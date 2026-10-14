import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const port = 8096;
const root = path.resolve('Projeto atualizado');
const artifactDir = 'C:/Users/rafaelscarpille/.gemini/antigravity/brain/f32dd795-4fc4-4eee-a304-6a2759fd9a03';

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
  console.log(`Capture Server listening at http://127.0.0.1:${port}`);
  
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browserBin = fs.existsSync(edgePath) ? edgePath : chromePath;

  const debugPort = 9228;
  const browser = spawn(browserBin, [
    `--remote-debugging-port=${debugPort}`,
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1280,720',
    `http://127.0.0.1:${port}/index.html`
  ]);

  await new Promise(r => setTimeout(r, 2000));

  try {
    const listRes = await fetch(`http://127.0.0.1:${debugPort}/json`);
    const tabs = await listRes.json();
    const gameTab = tabs.find(t => t.url.includes('index.html')) || tabs[0];

    if (gameTab && gameTab.webSocketDebuggerUrl) {
      const ws = new globalThis.WebSocket(gameTab.webSocketDebuggerUrl);

      let msgId = 100;
      const sendCdp = (method, params = {}) => {
        return new Promise((resolve) => {
          const id = ++msgId;
          const handler = (evt) => {
            const data = JSON.parse(evt.data);
            if (data.id === id) {
              ws.removeEventListener('message', handler);
              resolve(data.result);
            }
          };
          ws.addEventListener('message', handler);
          ws.send(JSON.stringify({ id, method, params }));
        });
      };

      ws.onopen = async () => {
        await sendCdp('Runtime.enable');
        await sendCdp('Page.enable');

        console.log('Waiting for MainMenu...');
        for (let i = 0; i < 30; i++) {
          const check = await sendCdp('Runtime.evaluate', {
            expression: `
              (() => {
                window.__logoShown = true;
                document.querySelectorAll('div').forEach(el => {
                  if (el.style.zIndex === '99999' || (el.textContent && el.textContent.includes('CLIQUE OU PRESSIONE'))) {
                    el.click();
                    el.remove();
                  }
                });
                const game = window.__DED_GAME;
                return game?.scene?.isActive("MainMenu") || game?.scene?.getScene("MainMenu")?.sys?.settings?.active;
              })()
            `,
            returnByValue: true
          });
          if (check?.result?.value) {
            console.log('MainMenu ready!');
            break;
          }
          await new Promise(r => setTimeout(r, 500));
        }

        const captureBiomeState = async (biomeName, depth, weatherState, fileName) => {
          console.log(`\n--- Capturing Biome: ${biomeName} | Weather: ${weatherState} ---`);
          
          await sendCdp('Runtime.evaluate', {
            expression: `
              (() => {
                const game = window.__DED_GAME;
                document.querySelectorAll('div').forEach(el => {
                  if (el.style.zIndex === '99999') el.remove();
                });

                const run = {
                  seed: 777,
                  depth: ${depth},
                  currentBiomeTheme: "${biomeName}",
                  maxLevel: 10,
                  hp: 120,
                  maxHp: 120,
                  score: 100
                };
                game.registry.set("mode", "endless");
                game.registry.set("endless:run", run);

                for (const s of game.scene.getScenes(true)) {
                  game.scene.stop(s.scene.key);
                }

                game.scene.start("Game", { endless: true, classId: "WARRIOR", restoreEndless: null });
              })()
            `
          });

          // Wait 2.5s for level load
          await new Promise(r => setTimeout(r, 2500));

          // Force the specific weather state and clear camera fades
          await sendCdp('Runtime.evaluate', {
            expression: `
              (() => {
                const game = window.__DED_GAME;
                const gameScene = game.scene.getScene("Game");
                if (gameScene && gameScene.__weatherManager) {
                  gameScene.__weatherManager.applyWeatherState("${weatherState}");
                }
                if (gameScene && gameScene.cameras && gameScene.cameras.main) {
                  gameScene.cameras.main.alpha = 1;
                  gameScene.cameras.main.fadeEffect?.reset?.();
                }
              })()
            `
          });

          // Let the weather particles and mist clouds animate for 1.8s
          await new Promise(r => setTimeout(r, 1800));

          const res = await sendCdp('Page.captureScreenshot', { format: 'png' });
          if (res && res.data) {
            const outPath = path.join(artifactDir, fileName);
            fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
            console.log(`[OK] Saved screenshot: ${outPath} (${fs.statSync(outPath).size} bytes)`);
          }
        };

        // 1. River Tempestade (Heavy Rainstorm with atmospheric darkening and water ripples)
        await captureBiomeState('erio', 9, 'storm', 'weather_river_storm.png');

        // 2. Frozen Citadel Nevasca (Heavy Snowstorm / Blizzard)
        await captureBiomeState('frozen', 7, 'blizzard', 'weather_frozen_blizzard.png');

        // 3. Amazon Forest Fog (Volumetric soft feathered mist clouds & ambient leaves)
        await captureBiomeState('ebosque', 5, 'fog', 'weather_forest_volumetric_fog.png');

        // 4. Dead Forest Dense Mist (Creeping spectral cemetery fog)
        await captureBiomeState('emorta', 13, 'dense_fog', 'weather_dead_forest_dense_fog.png');

        console.log('\nAll advanced weather screenshots captured successfully!');
        browser.kill();
        server.close();
        process.exit(0);
      };

      ws.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        if (data.method === 'Runtime.consoleAPICalled') {
          const args = data.params.args.map(a => a.value || a.description).join(' ');
          console.log('[BROWSER]:', args);
        } else if (data.method === 'Runtime.exceptionThrown') {
          console.error('[BROWSER ERR]:', data.params.exceptionDetails?.text);
        }
      };
    }
  } catch(e) {
    console.error('Error in capture:', e);
    browser.kill();
    server.close();
    process.exit(1);
  }
});
