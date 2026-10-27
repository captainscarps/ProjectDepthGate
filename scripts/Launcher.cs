using System;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Diagnostics;
using System.Threading;
using System.Reflection;

namespace DepthgateLauncher
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                string gameRoot = Path.Combine(localApp, "DEPTHGATE");
                string gameWww = Path.Combine(gameRoot, "game");

                // Ensure extracted game files
                ExtractGameFiles(gameWww);

                // Start local server
                int port = GetGamePort();
                HttpListener listener = new HttpListener();
                listener.Prefixes.Add("http://127.0.0.1:" + port + "/");
                listener.Start();

                Thread serverThread = new Thread(() => ServeFiles(listener, gameWww));
                serverThread.IsBackground = true;
                serverThread.Start();

                string gameUrl = "http://127.0.0.1:" + port + "/index.html";

                // Launch in App Mode
                Process browserProc = LaunchAppMode(gameUrl);

                if (browserProc != null)
                {
                    browserProc.WaitForExit();
                }
                else
                {
                    // Fallback opened in default browser, wait keep-alive or close after some time
                    Thread.Sleep(3000);
                }

                try { listener.Stop(); } catch { }
            }
            catch (Exception ex)
            {
                System.Windows.Forms.MessageBox.Show("Erro ao iniciar DEPTHGATE: " + ex.Message, "DEPTHGATE", System.Windows.Forms.MessageBoxButtons.OK, System.Windows.Forms.MessageBoxIcon.Error);
            }
        }

        static int GetGamePort()
        {
            // Use fixed port 24816 so browser localStorage origin (http://127.0.0.1:24816) is 100% persistent across launches
            int basePort = 24816;
            for (int p = basePort; p < basePort + 20; p++)
            {
                try
                {
                    var l = new System.Net.Sockets.TcpListener(IPAddress.Loopback, p);
                    l.Start();
                    l.Stop();
                    return p;
                }
                catch { }
            }
            var fallback = new System.Net.Sockets.TcpListener(IPAddress.Loopback, 0);
            fallback.Start();
            int fp = ((IPEndPoint)fallback.LocalEndpoint).Port;
            fallback.Stop();
            return fp;
        }

        static void ExtractGameFiles(string destDir)
        {
            Assembly asm = Assembly.GetExecutingAssembly();
            using (Stream s = asm.GetManifestResourceStream("game.zip"))
            {
                if (s == null) return;
                
                // Compare size or check existence
                string verFile = Path.Combine(destDir, ".version");
                string currentVer = "v2.0.0";
                
                if (Directory.Exists(destDir) && File.Exists(verFile))
                {
                    try
                    {
                        if (File.ReadAllText(verFile).Trim() == currentVer)
                            return; // Up to date
                    }
                    catch { }
                }

                if (Directory.Exists(destDir))
                {
                    try { Directory.Delete(destDir, true); } catch { }
                }
                Directory.CreateDirectory(destDir);

                using (ZipArchive archive = new ZipArchive(s, ZipArchiveMode.Read))
                {
                    archive.ExtractToDirectory(destDir);
                }

                File.WriteAllText(verFile, currentVer);
            }
        }

        static void ServeFiles(HttpListener listener, string rootDir)
        {
            while (listener.IsListening)
            {
                try
                {
                    var ctx = listener.GetContext();
                    ThreadPool.QueueUserWorkItem((_) => ProcessRequest(ctx, rootDir));
                }
                catch
                {
                    break;
                }
            }
        }

        static void ProcessRequest(HttpListenerContext ctx, string rootDir)
        {
            try
            {
                string rawUrl = ctx.Request.Url.AbsolutePath;
                string relPath = rawUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar);
                string filePath = Path.Combine(rootDir, relPath);
                string ext = Path.GetExtension(filePath).ToLowerInvariant();

                if (!File.Exists(filePath))
                {
                    if (string.IsNullOrEmpty(ext) || ext == ".html")
                    {
                        filePath = Path.Combine(rootDir, "index.html");
                        ext = ".html";
                    }
                    else
                    {
                        ctx.Response.StatusCode = 404;
                        ctx.Response.Close();
                        return;
                    }
                }

                if (File.Exists(filePath))
                {
                    string mime = "application/octet-stream";
                    switch (ext)
                    {
                        case ".html": mime = "text/html; charset=utf-8"; break;
                        case ".js": mime = "text/javascript; charset=utf-8"; break;
                        case ".json": mime = "application/json"; break;
                        case ".css": mime = "text/css"; break;
                        case ".png": mime = "image/png"; break;
                        case ".jpg":
                        case ".jpeg": mime = "image/jpeg"; break;
                        case ".gif": mime = "image/gif"; break;
                        case ".svg": mime = "image/svg+xml"; break;
                        case ".ico": mime = "image/x-icon"; break;
                        case ".wav": mime = "audio/wav"; break;
                        case ".mp3": mime = "audio/mpeg"; break;
                        case ".ogg": mime = "audio/ogg"; break;
                        case ".mp4": mime = "video/mp4"; break;
                        case ".webm": mime = "video/webm"; break;
                        case ".woff": mime = "application/font-woff"; break;
                        case ".woff2": mime = "font/woff2"; break;
                        case ".ttf": mime = "application/font-ttf"; break;
                    }

                    byte[] data = File.ReadAllBytes(filePath);
                    ctx.Response.ContentType = mime;
                    ctx.Response.ContentLength64 = data.Length;
                    ctx.Response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate");
                    ctx.Response.OutputStream.Write(data, 0, data.Length);
                    ctx.Response.OutputStream.Close();
                }
                else
                {
                    ctx.Response.StatusCode = 404;
                    ctx.Response.Close();
                }
            }
            catch
            {
                try { ctx.Response.Close(); } catch { }
            }
        }

        static Process LaunchAppMode(string url)
        {
            string localApp = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            string userDataDir = Path.Combine(localApp, @"DEPTHGATE\UserData");
            try { Directory.CreateDirectory(userDataDir); } catch { }

            string edge = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Microsoft\Edge\Application\msedge.exe");
            if (!File.Exists(edge))
            {
                edge = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Microsoft\Edge\Application\msedge.exe");
            }

            string chrome = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), @"Google\Chrome\Application\chrome.exe");
            if (!File.Exists(chrome))
            {
                chrome = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), @"Google\Chrome\Application\chrome.exe");
            }

            string args = string.Format("--app=\"{0}\" --window-size=1280,720 --start-maximized --user-data-dir=\"{1}\"", url, userDataDir);

            if (File.Exists(edge))
            {
                return Process.Start(new ProcessStartInfo(edge, args));
            }
            if (File.Exists(chrome))
            {
                return Process.Start(new ProcessStartInfo(chrome, args));
            }

            Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            return null;
        }
    }
}
