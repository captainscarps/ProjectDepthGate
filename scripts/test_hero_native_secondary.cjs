const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8135;
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
  const userData = path.join(__dirname, 'chrome_test_profile_nat');
  
  const chrome = spawn(chromePath, [
    '--remote-debugging-port=9235',
    `--user-data-dir=${userData}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `http://127.0.0.1:${PORT}/index.html`
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:9235/json');
  const tabs = await listRes.json();
  const tab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));

    setTimeout(() => {
      ws.send(JSON.stringify({
        id: 10,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (async function() {
              let wAttempts = 0;
              while (typeof window.__dubDur !== 'function' && wAttempts < 60) {
                await new Promise(r => setTimeout(r, 200));
                wAttempts++;
              }
              if (typeof window.__dubDur !== 'function') {
                return { error: "__dubDur not found" };
              }

              // Wait until __dubReady() is true
              let rAttempts = 0;
              while ((!window.__dubReady || !window.__dubReady()) && rAttempts < 60) {
                await new Promise(r => setTimeout(r, 200));
                rAttempts++;
              }
              // Small extra tick for async json loads
              await new Promise(r => setTimeout(r, 1000));

              const linesToTest = [
                { text: "É a letra do meu irmão mais velho… AKIHIRO.", cls: "ARCHER" },
                { text: "É a letra do meu irmão… HAYATO.", cls: "BERSERKER" },
                { text: "Nunca deixaria você sozinho. Nem aqui, nem em lugar nenhum.", cls: "BERSERKER" },
                { text: "Lembro. Você sempre chegava atrasado.", cls: "ARCHER" },
                { text: "Avô? O senhor é… um dos pajés do igapó?", cls: "SHAMAN" },
                { text: "Quem é o senhor?", cls: "WARRIOR" },
                { text: "O Observador…", cls: "SHAMAN" },
                { text: "Bispo! Mostre o que está bordado no seu manto.", cls: "MAGE" },
                { text: "Fique perto de mim. Vou te tirar daqui.", cls: "HUNTER" },
                { text: "Me perdoe. Eu não fui rápido o bastante.", cls: "ROGUE" },
                { text: "Você me envenenou!", cls: "DRUID" },
                { text: "Desfaça o feitiço. Agora.", cls: "NECROMANCER" },
                { text: "Essa missão foi mais difícil do que deveria ser… o que será?", cls: "WARRIOR" },
                { text: "Filho das Profundezas… a fé pode guiar sua lâmina.", isNpc: true }
              ];

              const checks = [];
              for (const item of linesToTest) {
                if (item.isNpc) {
                  window.__currentSpeaker = null;
                  const dur = window.__dubDur(item.text);
                  checks.push({
                    text: item.text,
                    isNpc: true,
                    dur,
                    ok: dur > 0
                  });
                } else {
                  window.__heroCls = item.cls;
                  window.__currentSpeaker = null;
                  const dur = window.__dubDur(item.text);
                  checks.push({
                    text: item.text,
                    cls: item.cls,
                    dur,
                    ok: dur > 0
                  });
                }
              }

              // Brother speaker test
              window.__heroCls = "BERSERKER";
              window.__currentSpeaker = "ARCHER";
              const brotherLine = "Você veio. Eu sabia que viria.";
              const bDur = window.__dubDur(brotherLine);
              checks.push({
                text: brotherLine,
                speaker: "ARCHER",
                playerCls: "BERSERKER",
                bDur,
                ok: bDur > 0
              });

              return { checks };
            })()
          `,
          awaitPromise: true,
          returnByValue: true
        }
      }));
    }, 2500);
  };

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.id === 10) {
      if (data.result?.exceptionDetails) {
        console.error("Evaluation Exception:", data.result.exceptionDetails);
        chrome.kill();
        server.close();
        process.exit(1);
      }
      const results = data.result?.result?.value;
      if (!results || !results.checks) {
        console.error("No result from evaluation:", data.result);
        chrome.kill();
        server.close();
        process.exit(1);
      }

      console.log("=== IN-GAME RUNTIME DURATION & PLAYBACK AUDIT ===\n");
      let allOk = true;
      for (const c of results.checks) {
        const status = c.ok ? "PASS" : "FAIL";
        if (!c.ok) allOk = false;
        if (c.isNpc) {
          console.log(`[${status}] NPC dialogue duration: "${c.text.slice(0, 45)}" -> ${c.dur}s`);
        } else if (c.speaker) {
          console.log(`[${status}] Brother NPC speaker: "${c.text}" -> speaker:${c.speaker} -> ${c.bDur}s`);
        } else {
          console.log(`[${status}] Hero [${(c.cls || "").padEnd(11)}] native voice: "${c.text.slice(0, 45)}" -> ${c.dur}s`);
        }
      }

      chrome.kill();
      server.close();
      if (!allOk) {
        console.error("\nTEST FAILED: Some checks did not pass.");
        process.exit(1);
      } else {
        console.log("\nALL HERO NATIVE DIALOGUES VERIFIED IN ENGINE: 100% SUCCESS!");
        process.exit(0);
      }
    }
  };
});
