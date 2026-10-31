const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8142;
const ROOT = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(ROOT, reqPath);
  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  const ext = path.extname(filePath);
  const mimeMap = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.mp3': 'audio/mpeg'
  };
  res.writeHead(200, {
    'Content-Type': mimeMap[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '127.0.0.1', async () => {
  console.log(`Servidor rodando em http://127.0.0.1:${PORT}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userData = path.join(__dirname, 'chrome_test_profile_verify');

  const chrome = spawn(chromePath, [
    '--remote-debugging-port=9242',
    `--user-data-dir=${userData}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `http://127.0.0.1:${PORT}/index.html`
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:9242/json');
  const tabs = await listRes.json();
  const tab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  let idCounter = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const id = ++idCounter;
      const handler = (evt) => {
        const msg = JSON.parse(evt.data);
        if (msg.id === id) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  ws.onopen = async () => {
    await send('Runtime.enable');
    await send('Page.enable');

    console.log('Aguardando e dispensando tela de introdução...');
    // Dispensa qualquer tela de vídeo ou introdução
    for (let i = 0; i < 40; i++) {
      await send('Runtime.evaluate', {
        expression: `
          (function() {
            document.querySelectorAll("div").forEach(d => {
              if (d.style.zIndex >= 90000 || (d.innerText && d.innerText.includes("CLIQUE"))) {
                d.click();
                d.remove();
              }
            });
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }));
          })()
        `
      });
      await new Promise(r => setTimeout(r, 200));
    }

    // Inicia e carrega campanha
    await send('Runtime.evaluate', {
      expression: `
        (function() {
          const g = window.__DED_GAME;
          if (!g) return;
          g.registry.set("prologue:pending", false);
          g.scene.start("Game", { heroClass: "WARRIOR", classId: "WARRIOR", mode: "campaign", levelIndex: 0 });
        })()
      `,
      returnByValue: true
    });

    // Aguarda a cena UI estar ativa com player no jogo
    for (let i = 0; i < 40; i++) {
      const chk = await send('Runtime.evaluate', {
        expression: `!!(window.__DED_GAME?.scene?.isActive("UI") && window.__DED_GAME?.scene?.getScene("Game")?.player)`,
        returnByValue: true
      });
      if (chk?.result?.value) break;
      await new Promise(r => setTimeout(r, 300));
    }

    // Abre o painel de configurações no UI
    const evalRes = await send('Runtime.evaluate', {
      expression: `
        (function() {
          // Remove qualquer overlay restante
          document.querySelectorAll("div").forEach(d => {
            if (d.style.zIndex >= 90000) d.remove();
          });

          const g = window.__DED_GAME;
          const ui = g.scene.getScene("UI");
          const sp = ui.settingsPanel;
          sp.show();
          
          const voiceRow = sp.rows.find(r => r.key === "voiceLang");
          const voiceRowIdx = sp.rows.indexOf(voiceRow);
          sp.selected = voiceRowIdx;
          sp.refresh();

          const catRows = sp.catRows();
          const displayIdx = catRows.indexOf(voiceRowIdx);

          return {
            open: sp.open,
            rootVis: sp.root.visible,
            selectedKey: sp.rows[sp.selected]?.key,
            labelText: sp.rowTexts[displayIdx]?.label?.text,
            valText: sp.rowTexts[displayIdx]?.value?.text,
            currentVoice: sp.settings.voiceLang
          };
        })()
      `,
      returnByValue: true
    });

    console.log('Configurações abertas:', JSON.stringify(evalRes?.result?.value, null, 2));

    await new Promise(r => setTimeout(r, 800));

    // Captura screenshot
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(screenshot.data, 'base64');
    const ssPath = path.join(ROOT, 'audit_dubbing_settings.png');
    const artPath = 'C:\\Users\\rafaelscarpille\\.gemini\\antigravity\\brain\\b413688e-2beb-42e0-9d5c-24c0349908a1\\audit_dubbing_settings.png';
    fs.writeFileSync(ssPath, buffer);
    fs.writeFileSync(artPath, buffer);
    console.log(`📸 Screenshot salvo com sucesso em ${ssPath} e ${artPath}`);

    chrome.kill();
    server.close();
    process.exit(0);
  };
});
