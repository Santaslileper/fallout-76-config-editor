using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

namespace Fallout76ConfigEditor {
    class BackendServer {
        private static string GameConfigDir = "";
        private static HttpListener listener;
        private static JavaScriptSerializer serializer = new JavaScriptSerializer();

        [DllImport("shell32.dll")]
        static extern int SHGetFolderPath(IntPtr hwndOwner, int nFolder, IntPtr hToken, uint dwFlags, StringBuilder pszPath);

        private const int CSIDL_PERSONAL = 0x0005;

        static void Main(string[] args) {
            Console.Title = "Fallout 76 Config Editor - Backend Server";
            Console.WriteLine("==================================================");
            Console.WriteLine("   FALLOUT 76 CONFIG EDITOR: UNIFIED INTERFACE");
            Console.WriteLine("==================================================");

            GameConfigDir = FindConfigDir();
            Console.WriteLine("[INFO] Config Directory: " + GameConfigDir);

            if (!Directory.Exists(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "wwwroot"))) {
                Console.WriteLine("[ERROR] 'wwwroot' folder not found! Make sure you extracted all files.");
                Console.WriteLine("Press any key to exit...");
                Console.ReadKey();
                return;
            }

            StartServer();
        }

        static string FindConfigDir() {
            List<string> candidates = new List<string>();
            StringBuilder sb = new StringBuilder(260);
            if (SHGetFolderPath(IntPtr.Zero, CSIDL_PERSONAL, IntPtr.Zero, 0, sb) == 0) {
                candidates.Add(Path.Combine(sb.ToString(), "My Games", "Fallout 76"));
            }
            string userHome = Environment.GetEnvironmentVariable("USERPROFILE") ?? Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            candidates.Add(Path.Combine(userHome, "Documents", "My Games", "Fallout 76"));
            candidates.Add(Path.Combine(userHome, "OneDrive", "Documents", "My Games", "Fallout 76"));

            foreach (var path in candidates) {
                if (Directory.Exists(path) && File.Exists(Path.Combine(path, "Fallout76Prefs.ini"))) return path;
            }
            foreach (var path in candidates) {
                if (Directory.Exists(path)) return path;
            }
            return AppDomain.CurrentDomain.BaseDirectory;
        }

        static void StartServer() {
            try {
                listener = new HttpListener();
                listener.Prefixes.Add("http://localhost:5000/");
                listener.Start();
                Console.WriteLine("[OK] Server listening on http://localhost:5000/");

                new Thread(() => {
                    while (listener.IsListening) {
                        try {
                            var context = listener.GetContext();
                            ThreadPool.QueueUserWorkItem((o) => ProcessRequest(context));
                        } catch { }
                    }
                }).Start();

                Console.WriteLine("[INFO] Opening browser...");
                Process.Start(new ProcessStartInfo("http://localhost:5000") { UseShellExecute = true });
                
                Console.WriteLine("--------------------------------------------------");
                Console.WriteLine("Server is RUNNING. Close this window to stop.");
                Console.WriteLine("Press 'Q' to quit manually.");
                while (listener.IsListening) {
                    if (Console.KeyAvailable && Console.ReadKey(true).Key == ConsoleKey.Q) break;
                    Thread.Sleep(100);
                }
                listener.Stop();
            } catch (Exception ex) {
                Console.WriteLine("[CRITICAL ERROR] Could not start server: " + ex.Message);
                Console.ReadKey();
            }
        }

        static void ProcessRequest(HttpListenerContext context) {
            string url = context.Request.Url.AbsolutePath;
            string method = context.Request.HttpMethod;

            try {
                if (url == "/") {
                    ServeStatic(context, "index.html");
                } else if (url == "/favicon.ico") {
                    ServeStatic(context, "assets/favicon.png", "image/png");
                } else if (url.StartsWith("/api/")) {
                    HandleApi(context, url, method);
                } else {
                    ServeStatic(context, url.TrimStart('/'));
                }
            } catch (Exception ex) {
                SendJson(context, new { success = false, message = ex.Message }, 500);
            }
        }

        static void ServeStatic(HttpListenerContext context, string path, string contentType = null) {
            string baseDir = AppDomain.CurrentDomain.BaseDirectory;
            string fullPath = Path.Combine(baseDir, "wwwroot", path.Replace("/", "\\"));
            
            if (!File.Exists(fullPath)) {
                context.Response.StatusCode = 404;
                context.Response.Close();
                return;
            }

            if (contentType == null) {
                string ext = Path.GetExtension(fullPath).ToLower();
                switch (ext) {
                    case ".html": contentType = "text/html"; break;
                    case ".js": contentType = "application/javascript"; break;
                    case ".css": contentType = "text/css"; break;
                    case ".png": contentType = "image/png"; break;
                    case ".jpg": case ".jpeg": contentType = "image/jpeg"; break;
                    case ".ico": contentType = "image/x-icon"; break;
                    case ".json": contentType = "application/json"; break;
                    default: contentType = "application/octet-stream"; break;
                }
            }

            try {
                byte[] buffer = File.ReadAllBytes(fullPath);
                context.Response.ContentType = contentType;
                context.Response.ContentLength64 = buffer.Length;
                context.Response.OutputStream.Write(buffer, 0, buffer.Length);
            } catch {
                context.Response.StatusCode = 500;
            } finally {
                context.Response.OutputStream.Close();
            }
        }

        static void HandleApi(HttpListenerContext context, string url, string method) {
            if (url == "/api/status") {
                SendJson(context, new { status = "online", directory = GameConfigDir });
            } else if (url == "/api/load") {
                string custom = SafeRead(Path.Combine(GameConfigDir, "Fallout76Custom.ini"));
                string prefs = SafeRead(Path.Combine(GameConfigDir, "Fallout76Prefs.ini"));
                string baseIni = SafeRead(Path.Combine(GameConfigDir, "Fallout76.ini"));
                string control = SafeRead(Path.Combine(GameConfigDir, "ControlMap_Custom.txt"));
                SendJson(context, new { success = true, custom = custom, prefs = prefs, baseIni = baseIni, control_map = control, path = GameConfigDir });
            } else if (url == "/api/save" && method == "POST") {
                SaveConfig(context);
            } else if (url == "/api/launch" && method == "POST") {
                try {
                    Process.Start("steam://rungameid/1151340");
                    SendJson(context, new { success = true });
                } catch {
                    SendJson(context, new { success = false }, 500);
                }
            } else if (url == "/api/kill" && method == "POST") {
                KillProcess("Fallout76");
                KillProcess("Project76");
                SendJson(context, new { success = true });
            }
        }

        static void SaveConfig(HttpListenerContext context) {
            using (var reader = new StreamReader(context.Request.InputStream, context.Request.ContentEncoding)) {
                try {
                    string json = reader.ReadToEnd();
                    var data = serializer.Deserialize<Dictionary<string, object>>(json);

                    string customContent = data.ContainsKey("custom") ? data["custom"].ToString() : "";
                    string prefsContent = data.ContainsKey("prefs") ? data["prefs"].ToString() : "";
                    string controlContent = data.ContainsKey("control_map") && data["control_map"] != null ? data["control_map"].ToString() : null;
                    bool readOnly = data.ContainsKey("read_only") && (bool)data["read_only"];

                    BackupAndSave(Path.Combine(GameConfigDir, "Fallout76Custom.ini"), customContent, readOnly);
                    BackupAndSave(Path.Combine(GameConfigDir, "Fallout76Prefs.ini"), prefsContent, readOnly);
                    
                    if (controlContent != null) {
                        string cp = Path.Combine(GameConfigDir, "ControlMap_Custom.txt");
                        if (string.IsNullOrWhiteSpace(controlContent)) { if (File.Exists(cp)) File.Delete(cp); }
                        else BackupAndSave(cp, controlContent, readOnly);
                    }
                    SendJson(context, new { success = true });
                } catch (Exception ex) {
                    SendJson(context, new { success = false, message = ex.Message }, 500);
                }
            }
        }

        static void BackupAndSave(string path, string content, bool readOnly) {
            if (File.Exists(path)) {
                try {
                    string backupDir = Path.Combine(GameConfigDir, "Backups");
                    if (!Directory.Exists(backupDir)) Directory.CreateDirectory(backupDir);
                    string backup = Path.Combine(backupDir, Path.GetFileName(path) + "_" + DateTime.Now.ToString("yyyyMMdd_HHmmss") + ".bak");
                    File.Copy(path, backup);
                    File.SetAttributes(path, FileAttributes.Normal);
                } catch { }
            }
            File.WriteAllText(path, content, Encoding.UTF8);
            if (readOnly) { try { File.SetAttributes(path, FileAttributes.ReadOnly); } catch { } }
        }

        static string SafeRead(string path) {
            if (!File.Exists(path)) return "";
            try { return File.ReadAllText(path); } catch { return ""; }
        }

        static void KillProcess(string name) {
            foreach (var p in Process.GetProcessesByName(name)) { try { p.Kill(); } catch { } }
        }

        static void SendJson(HttpListenerContext context, object data, int statusCode = 200) {
            try {
                string json = serializer.Serialize(data);
                byte[] buffer = Encoding.UTF8.GetBytes(json);
                context.Response.StatusCode = statusCode;
                context.Response.ContentType = "application/json";
                context.Response.ContentLength64 = buffer.Length;
                context.Response.OutputStream.Write(buffer, 0, buffer.Length);
            } catch { } finally {
                context.Response.OutputStream.Close();
            }
        }
    }
}
