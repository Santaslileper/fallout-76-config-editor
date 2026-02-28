import os
import shutil
import glob
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import stat
import subprocess
import webbrowser

import ctypes.wintypes

app = Flask(__name__, static_folder='.')
CORS(app)

def get_my_documents():
    try:
        CSIDL_PERSONAL = 5       # My Documents
        SHGFP_TYPE_CURRENT = 0   # Get current, not default value
        buf = ctypes.create_unicode_buffer(ctypes.wintypes.MAX_PATH)
        ctypes.windll.shell32.SHGetFolderPathW(None, CSIDL_PERSONAL, None, SHGFP_TYPE_CURRENT, buf)
        return buf.value
    except Exception as e:
        print(f"Error finding Documents via Shell32: {e}")
        return None

# Robust Logic to find Fallout 76 Config Directory
def find_config_dir():
    candidates = []
    
    # 1. Check Shell Documents (Most reliable)
    docs = get_my_documents()
    if docs:
        candidates.append(os.path.join(docs, "My Games", "Fallout 76"))

    # 2. Check User Home Documents
    user_home = os.environ.get('USERPROFILE') or os.path.expanduser('~')
    candidates.append(os.path.join(user_home, "Documents", "My Games", "Fallout 76"))
    
    # 3. Check OneDrive
    candidates.append(os.path.join(user_home, "OneDrive", "Documents", "My Games", "Fallout 76"))

    # Check candidates
    for path in candidates:
        if os.path.exists(path) and os.path.exists(os.path.join(path, "Fallout76Prefs.ini")):
             print(f"Found Config Directory: {path}")
             return path
             
    # If standard paths fail, fall back to the first candidate that exists (even if empty) or create test dir
    for path in candidates:
        if os.path.exists(path):
            return path
            
    # Fallback to test_output if nothing else exists
    test_path = os.path.join(os.getcwd(), "test_output")
    if not os.path.exists(test_path):
        os.makedirs(test_path)
    return test_path

GAME_CONFIG_DIR = find_config_dir()
print(f"Final Configuration Directory: {GAME_CONFIG_DIR}")

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify({
        "status": "online",
        "directory": GAME_CONFIG_DIR,
        "found": os.path.exists(GAME_CONFIG_DIR)
    })

def safe_read(path):
    if not os.path.exists(path):
        return ""
    
    encodings = ['utf-8', 'utf-16', 'utf-16-le', 'cp1252', 'latin-1']
    for enc in encodings:
        try:
            with open(path, 'r', encoding=enc) as f:
                content = f.read()
                # Basic validation: check if it looks like text (no excessive nulls if not utf-16)
                if enc.startswith('utf-16') or '\0' not in content:
                    return content
        except UnicodeError:
            continue
        except Exception as e:
            print(f"Error reading {path} with {enc}: {e}")
            
    # Fallback with ignore
    try:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
    except Exception as e:
        print(f"Final read failure {path}: {e}")
        return ""

@app.route('/api/load', methods=['GET'])
def load_config():
    try:
        custom_path = os.path.join(GAME_CONFIG_DIR, "Fallout76Custom.ini")
        prefs_path = os.path.join(GAME_CONFIG_DIR, "Fallout76Prefs.ini")
        base_path = os.path.join(GAME_CONFIG_DIR, "Fallout76.ini")
        control_map_path = os.path.join(GAME_CONFIG_DIR, "ControlMap_Custom.txt")

        return jsonify({
            "success": True, 
            "custom": safe_read(custom_path), 
            "prefs": safe_read(prefs_path),
            "base": safe_read(base_path),
            "control_map": safe_read(control_map_path),
            "path": GAME_CONFIG_DIR
        })
    except Exception as e:
        print(f"Error loading: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

def set_readonly(filepath, readonly=True):
    try:
        if os.path.exists(filepath):
            if readonly:
                current_perms = os.stat(filepath).st_mode
                os.chmod(filepath, current_perms & ~stat.S_IWRITE)
                print(f"Set read-only: {os.path.basename(filepath)}")
            else:
                current_perms = os.stat(filepath).st_mode
                os.chmod(filepath, current_perms | stat.S_IWRITE)
                print(f"Removed read-only: {os.path.basename(filepath)}")
    except Exception as e:
        print(f"Warning: Could not change read-only flag: {e}")

def clean_backups(directory, pattern):
    try:
        files = glob.glob(os.path.join(directory, pattern))
        files.sort(key=os.path.getmtime, reverse=True)
        for old_file in files[5:]:
            os.remove(old_file)
    except Exception as e:
        print(f"Error cleaning backups: {e}")

@app.route('/api/save', methods=['POST'])
def save_config():
    try:
        data = request.json
        custom_content = data.get('custom', '')
        prefs_content = data.get('prefs', '')
        control_map_content = data.get('control_map', None)
        apply_protection = data.get('read_only', True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        custom_path = os.path.join(GAME_CONFIG_DIR, "Fallout76Custom.ini")
        prefs_path = os.path.join(GAME_CONFIG_DIR, "Fallout76Prefs.ini")
        control_map_path = os.path.join(GAME_CONFIG_DIR, "ControlMap_Custom.txt")

        if os.path.exists(custom_path):
            backup_path = os.path.join(GAME_CONFIG_DIR, f"Fallout76Custom_{timestamp}.bak")
            shutil.copy2(custom_path, backup_path)
            clean_backups(GAME_CONFIG_DIR, "Fallout76Custom_*.bak")

        if os.path.exists(prefs_path):
            backup_path = os.path.join(GAME_CONFIG_DIR, f"Fallout76Prefs_{timestamp}.bak")
            shutil.copy2(prefs_path, backup_path)
            clean_backups(GAME_CONFIG_DIR, "Fallout76Prefs_*.bak")
        
        if control_map_content is not None and os.path.exists(control_map_path):
             backup_path = os.path.join(GAME_CONFIG_DIR, f"ControlMap_Custom_{timestamp}.bak")
             shutil.copy2(control_map_path, backup_path)
             clean_backups(GAME_CONFIG_DIR, "ControlMap_Custom_*.bak")

        set_readonly(custom_path, readonly=False)
        set_readonly(prefs_path, readonly=False)
        set_readonly(control_map_path, readonly=False)

        with open(custom_path, 'w', encoding='utf-8') as f:
            f.write(custom_content)
        
        with open(prefs_path, 'w', encoding='utf-8') as f:
            f.write(prefs_content)
            
        if control_map_content is not None:
            if not control_map_content.strip():
                if os.path.exists(control_map_path):
                    os.remove(control_map_path)
            else:
                with open(control_map_path, 'w', encoding='utf-8') as f:
                    f.write(control_map_content)

        if apply_protection:
            set_readonly(custom_path, readonly=True)
            set_readonly(prefs_path, readonly=True)
            if control_map_content and control_map_content.strip() and os.path.exists(control_map_path):
                 set_readonly(control_map_path, readonly=True)
        else:
            print("Read-only protection skipped as per user setting.")
            
        return jsonify({
            "success": True, 
            "message": f"Saved successfully. (Protection: {'ON' if apply_protection else 'OFF'})", 
            "path": GAME_CONFIG_DIR
        })

    except Exception as e:
        print(f"Error saving: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/launch', methods=['POST'])
def launch_game():
    try:
        try:
            os.startfile('steam://rungameid/1151340')
            return jsonify({"success": True, "message": "Launching Fallout 76 via Steam (os.startfile)..."})
        except Exception as e1:
            print(f"os.startfile failed: {e1}")
            
        try:
            os.system('start steam://rungameid/1151340')
            return jsonify({"success": True, "message": "Launching Fallout 76 via Steam (cmd start)..."})
        except Exception as e2:
             print(f"os.system failed: {e2}")

        webbrowser.open('steam://rungameid/1151340')
        return jsonify({"success": True, "message": "Launching Fallout 76 via Steam (webbrowser)..."})
        
    except Exception as e:
        print(f"Error launching: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/kill', methods=['POST'])
def kill_game():
    try:
        os.system("taskkill /F /IM Fallout76.exe")
        os.system("taskkill /F /IM Project76.exe")
        return jsonify({"success": True, "message": "Fallout 76 processes terminated."})
    except Exception as e:
        print(f"Error killing process: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.after_request
def add_header(response):
    response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

if __name__ == '__main__':
    print("Starting Fallout 76 Config Server...")
    print(f"Server accessible at http://localhost:5000")
    # debug=True enables auto-reloading when server.py changes.
    # It does NOT properly watch static files, but disabling cache (above) helps.
    app.run(port=5000, debug=True)
