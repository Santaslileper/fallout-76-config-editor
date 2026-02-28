import os
import json
import re
import hashlib

def obscure_id(val):
    if not val: return val
    return hashlib.md5(val.encode()).hexdigest()[:8]

def sanitize_json_content(data):
    if isinstance(data, dict):
        new_data = {}
        for k, v in data.items():
            if k in ['meta_id', 'ign_page_id', 'remote_id', 'source_id']:
                new_data[k] = obscure_id(str(v)) if v else None
            else:
                new_data[k] = sanitize_json_content(v)
        return new_data
    elif isinstance(data, list):
        return [sanitize_json_content(item) for item in data]
    else:
        return data

def process_js_file(file_path):
    if not os.path.exists(file_path):
        return
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple regex to find the object/array
    # This is risky but since we know the file structure it's okay
    # match = re.search(r'export const \w+ = (\{.*\}|\[.*\]);', content, re.DOTALL)
    if 'MAP_DATABASE' in content:
        # Markers.js is basically one big line or two
        start_idx = content.find('{')
        end_idx = content.rfind('}') + 1
        json_str = content[start_idx:end_idx]
        try:
            data = json.loads(json_str)
            sanitized_data = sanitize_json_content(data)
            new_content = content[:start_idx] + json.dumps(sanitized_data) + content[end_idx:]
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Deep sanitized JS: {file_path}")
        except:
            print(f"Failed to parse JSON in {file_path}")

def process_plain_file(file_path):
    if not os.path.exists(file_path):
        return
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Block external domains
    content = content.replace('nukaknights.com', 'fallout-db.internal')
    content = content.replace('ign.com', 'wiki.vault-tec.internal')
    content = content.replace('mapheads.com', 'map.internal')
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Sanitized links in: {file_path}")

def main():
    base_dir = r"d:\Users\user\Desktop\fallout 76 config"
    js_dir = os.path.join(base_dir, "js")
    
    process_js_file(os.path.join(js_dir, "markers.js"))
    
    files_to_check = ["index.html", "app.py", "js/data.js", "js/database.js", "README.md", "bootstrap.ps1"]
    for f in files_to_check:
        process_plain_file(os.path.join(base_dir, f))

if __name__ == "__main__":
    main()
