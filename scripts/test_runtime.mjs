import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const port = 8091;
const root = path.resolve('Projeto atualizado');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg'
};

const server = http.createServer((req, res) => {
  let p = decodeURI(req.url.split('?')[0]);
  if (p === '/' || !p) p = '/index.html';
  let fp = path.join(root, p.replace(/^\//, ''));
  if (!fs.existsSync(fp)) fp = path.join(root, 'index.html');
  const ext = path.extname(fp).toLowerCase();
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(fp).pipe(res);
});

server.listen(port, async () => {
  console.log(`Server listening at http://127.0.0.1:${port}`);
  
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browserBin = fs.existsSync(edgePath) ? edgePath : chromePath;

  const debugPort = 9223;
  const browser = spawn(browserBin, [
    `--remote-debugging-port=${debugPort}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    `http://127.0.0.1:${port}/index.html`
  ]);

  // Wait 1.5s for browser to initialize debugging endpoint
  await new Promise(r => setTimeout(r, 1500));

  try {
    const listRes = await fetch(`http://127.0.0.1:${debugPort}/json`);
    const tabs = await listRes.json();
    const gameTab = tabs.find(t => t.url.includes('index.html')) || tabs[0];
    console.log('Target tab:', gameTab?.title, gameTab?.url);

    if (gameTab && gameTab.webSocketDebuggerUrl) {
      // Connect native WebSocket
      const ws = new globalThis.WebSocket(gameTab.webSocketDebuggerUrl);
      ws.onopen = () => {
        ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
        ws.send(JSON.stringify({ id: 2, method: 'Log.enable' }));
      };

      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.method === 'Runtime.consoleAPICalled') {
          const type = data.params.type;
          const args = data.params.args.map(a => a.value || a.description).join(' ');
          console.log(`[CONSOLE ${type.toUpperCase()}]:`, args);
        } else if (data.method === 'Runtime.exceptionThrown') {
          console.error('[EXCEPTION]:', data.params.exceptionDetails?.text, data.params.exceptionDetails?.exception?.description);
        }
      };
    }
  } catch(e) {
    console.error('CDP Error:', e.message);
  }

  // Run for 12 seconds
  setTimeout(() => {
    console.log('Test completed.');
    browser.kill();
    server.close();
    process.exit(0);
  }, 12000);
});
