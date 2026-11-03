const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8139;
const ROOT = path.resolve(__dirname, '..');

function getMime(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ttf': 'font/ttf'
  };
  return map[ext] || 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(ROOT, reqPath);
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not Found');
    return;
  }
  res.writeHead(200, { 'Content-Type': getMime(filePath) });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '127.0.0.1', async () => {
  console.log('Test server running on port ' + PORT);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userData = path.join(__dirname, 'chrome_test_profile_paje3');

  const chrome = spawn(chromePath, [
    '--remote-debugging-port=9239',
    `--user-data-dir=${userData}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `http://127.0.0.1:${PORT}/index.html`
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:9239/json');
  const tabs = await listRes.json();
  const tab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));

    setTimeout(() => {
      const expr = `
        (async function() {
          let wAttempts = 0;
          while (typeof window.__dubDur !== 'function' && wAttempts < 60) {
            await new Promise(r => setTimeout(r, 200));
            wAttempts++;
          }
          if (typeof window.__dubDur !== 'function') {
            return { error: "__dubDur not found" };
          }

          let rAttempts = 0;
          while ((!window.__dubReady || !window.__dubReady()) && rAttempts < 60) {
            await new Promise(r => setTimeout(r, 200));
            rAttempts++;
          }
          await new Promise(r => setTimeout(r, 1000));

          const pajeLines = [
            "Kunhã… filha da mata. Eu sentia o seu cheiro de urucum desde o outro lado do portal.",
            "O último que sobrou. Quando começaram a construir portais novos, o nosso selo velho rachou. Atravessei para segurá-lo.",
            "Roubaram as três coisas sagradas do ritual. Sem elas, não consigo fechar a rachadura.",
            "Hm. Mais um forasteiro tocado pelas Profundezas.",
            "Um velho que segura uma porta que não quer ficar fechada. Roubaram as coisas sagradas do meu ritual.",
            "Se as encontrar pelo caminho, traga para mim. Talvez você sirva para alguma coisa.",
            "Ainda faltam 3. A mata espera.",
            "Ainda faltam 2. A mata espera.",
            "Ainda faltam 1. A mata espera.",
            "Ainda falta 1. A mata espera.",
            "Tudo aqui. Segure o maracá comigo, kunhã. Cante comigo.",
            "Tudo aqui… você trouxe mesmo. Afaste-se.",
            "O igapó respira de novo. Leve a bênção da mata: ela vai segurar a sua vida como segurou a minha.",
            "E ouça, kunhã: quem constrói os portais novos usa o mesmo símbolo do castelo. O olho. Cuidado com ele."
          ];

          const checksPt = [];
          const checksEn = [];

          // 1. Check PT durations (voiceLang = 'pt')
          localStorage.setItem("dungeon-crawler:settings", JSON.stringify({ voiceLang: "pt", language: "pt" }));
          localStorage.setItem("depthgate_voice_manual", "1");
          window.__currentSpeaker = null;

          for (const line of pajeLines) {
            const dur = window.__dubDur(line);
            checksPt.push({
              text: line.slice(0, 30) + '...',
              dur,
              ok: typeof dur === 'number' && dur > 0
            });
          }

          // 2. Check EN durations and translations (voiceLang = 'en')
          localStorage.setItem("dungeon-crawler:settings", JSON.stringify({ voiceLang: "en", language: "en" }));
          localStorage.setItem("depthgate_voice_manual", "1");
          window.__currentSpeaker = null;

          for (const line of pajeLines) {
            const tr = window.__TR?.en?.[line];
            const dur = window.__dubDur(line);
            checksEn.push({
              text: line.slice(0, 30) + '...',
              tr: tr ? tr.slice(0, 30) + '...' : null,
              hasTr: !!tr,
              dur,
              ok: typeof dur === 'number' && dur > 0 && !!tr
            });
          }

          return { checksPt, checksEn };
        })()
      `;

      ws.send(JSON.stringify({
        id: 2,
        method: 'Runtime.evaluate',
        params: {
          expression: expr,
          awaitPromise: true,
          returnByValue: true
        }
      }));
    }, 3000);
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id === 2) {
      console.log('=== TEST RESULTS ===');
      const val = data.result.result.value;
      console.log(JSON.stringify(val, null, 2));

      const ptAllOk = val.checksPt && val.checksPt.every(r => r.ok);
      const enAllOk = val.checksEn && val.checksEn.every(r => r.ok);
      const allOk = ptAllOk && enAllOk;
      console.log('PT ALL OK:', ptAllOk);
      console.log('EN ALL OK:', enAllOk);
      console.log('OVERALL PASS:', allOk);

      ws.close();
      chrome.kill();
      server.close();
      process.exit(allOk ? 0 : 1);
    }
  };
});
