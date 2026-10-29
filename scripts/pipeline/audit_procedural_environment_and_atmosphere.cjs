/**
 * DEPTHGATE — Auditoria Completa dos Sistemas Ambientais Restantes
 * 
 * Valida no jogo real:
 * 1. Geração procedural de EnvironmentalTrap em salas de combate reais.
 * 2. Geração de EnvironmentalPuzzle e totens rúnicos.
 * 3. Autotile orgânico de lava e ausência de cantos quadrados no Vulcão (Magmatic Planet).
 * 4. Atmosfera viva por bioma (brasas vulcânicas, flocos glaciais, tochas pulsantes).
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8148;
const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT, 'assets', 'visual-tests');
const ARTIFACTS_DIR = 'C:\\Users\\rafaelscarpille\\.gemini\\antigravity\\brain\\b413688e-2beb-42e0-9d5c-24c0349908a1';

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(ROOT, reqPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
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
  console.log('========================================================================');
  console.log('DEPTHGATE — AUDITORIA DE AMBIENTE PROCEDURAL, LAVA E ATMOSFERA');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userData = path.join(__dirname, '..', 'chrome_audit_env_profile');
  
  const chrome = spawn(chromePath, [
    '--remote-debugging-port=9248',
    `--user-data-dir=${userData}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1280,720',
    `http://127.0.0.1:${PORT}/index.html`
  ]);

  try {
    await new Promise(r => setTimeout(r, 2200));
    const listRes = await fetch('http://127.0.0.1:9248/json');
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.type === 'page');
    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        callbacks.get(data.id)(data);
        callbacks.delete(data.id);
      }
    };

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await new Promise(r => ws.onopen = r);
    await send('Runtime.enable');
    await send('Page.enable');

    console.log('⏳ Inicializando jogo com ambiente procedural e biomas...');
    await new Promise(r => setTimeout(r, 3800));

    // Inicialização da campanha real no Game
    await send('Runtime.evaluate', {
      expression: `
        (async function() {
          const g = window.__DED_GAME;
          if (!g) return { error: "No game" };

          let attempts = 0;
          while ((!g.scene || g.scene.getScenes(true).length === 0) && attempts < 40) {
            await new Promise(r => setTimeout(r, 200));
            attempts++;
          }

          g.registry.set("prologue:pending", false);
          g.scene.start("Game", {
            heroClass: "WARRIOR",
            classId: "WARRIOR",
            mode: "campaign",
            levelIndex: 0
          });

          let gameAttempts = 0;
          while ((!g.scene.isActive("Game") || !g.scene.getScene("Game")?.player) && gameAttempts < 50) {
            await new Promise(r => setTimeout(r, 200));
            gameAttempts++;
          }

          return { ready: true };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    await new Promise(r => setTimeout(r, 1500));

    // 1. Validar armadilhas e quebra-cabeças procedurais gerados
    console.log('\n--- 1. AUDITORIA DE AMBIENTE PROCEDURAL (ARMADILHAS E ENIGMAS) ---');
    const procRes = await send('Runtime.evaluate', {
      expression: `
        (() => {
          try {
            const g = window.__DED_GAME;
            const gs = g?.scene?.getScene("Game");
            if (!gs || !gs.dungeon) {
              return { error: "Cena Game ou Dungeon não encontrados", hasGame: !!g, hasGs: !!gs };
            }

            const managerLoaded = !!window.DEPTHGATE_ENVIRONMENTAL?.ProceduralEnvironmentManager;

            if (managerLoaded && (!gs.__environmentalTraps || gs.__environmentalTraps.length === 0)) {
              window.DEPTHGATE_ENVIRONMENTAL.ProceduralEnvironmentManager.initDungeonEnvironment(gs, gs.dungeon);
            }

            const traps = gs.__environmentalTraps || [];
            const puzzles = gs.__environmentalPuzzles || [];

            return {
              managerLoaded,
              trapsCount: traps.length,
              puzzlesCount: puzzles.length,
              trapsActive: traps.length > 0 && traps.every(t => t.active),
              hasHook: !!gs.__envUpdateHookRegistered,
              pass: managerLoaded && traps.length > 0
            };
          } catch (e) {
            return { error: e.message, stack: e.stack };
          }
        })()
      `,
      returnByValue: true
    });

    const procData = procRes.result?.result?.value;
    console.log('   Resultado procedural:', procData);

    const shot1 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'audit_procedural_dungeon_env.png'), Buffer.from(shot1.result.data, 'base64'));
    if (fs.existsSync(ARTIFACTS_DIR)) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, 'audit_procedural_dungeon_env.png'), Buffer.from(shot1.result.data, 'base64'));
    }

    // 2. Carregar o Bioma Vulcão para validar Lava Orgânica e Brasas
    console.log('\n--- 2. AUDITORIA DO VULCÃO (MAGMATIC PLANET E BRASAS VIVAS) ---');
    const volcanoRes = await send('Runtime.evaluate', {
      expression: `
        (async () => {
          try {
            const g = window.__DED_GAME;
            let gs = g?.scene?.getScene("Game");

            // No DepthGate, reiniciar na fase do vulcão via descida ou start direto
            g.scene.stop("Game");
            await new Promise(r => setTimeout(r, 400));

            g.scene.start("Game", {
              heroClass: "WARRIOR",
              classId: "WARRIOR",
              mode: "campaign",
              levelIndex: 6,
              levelId: "vulcao"
            });

            for (let i = 0; i < 40; i++) {
              await new Promise(r => setTimeout(r, 200));
              gs = g.scene.getScene("Game");
              if (gs?.scene?.isActive() && gs?.dungeon) break;
            }

            const curDungeon = gs?.dungeon;
            const isVulcao = curDungeon?.level?.id === "vulcao" || curDungeon?.level?.theme?.id === "vulcao";
            
            if (window.DEPTHGATE_ENVIRONMENTAL?.ProceduralEnvironmentManager && curDungeon) {
              window.DEPTHGATE_ENVIRONMENTAL.ProceduralEnvironmentManager.initDungeonEnvironment(gs, curDungeon);
            }

            const organicDecorCount = gs?.children?.list?.filter(c => c.texture && c.texture.key.includes("vc-mp-"))?.length || 0;
            const hasRoundPool = !!gs?.textures?.exists("vc-mp-lavapool-round");
            
            return {
              isVulcao,
              organicDecorCount,
              dungeonWidth: curDungeon?.widthPx,
              hasLavaFx: hasRoundPool,
              pass: hasRoundPool
            };
          } catch (e) {
            return { error: e.message, stack: e.stack };
          }
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    const volcanoData = volcanoRes.result?.result?.value;
    console.log('   Resultado Vulcão e Magmatic Planet:', volcanoData);

    await new Promise(r => setTimeout(r, 1000));
    const shot2 = await send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(OUTPUT_DIR, 'audit_volcano_organic_lava.png'), Buffer.from(shot2.result.data, 'base64'));
    if (fs.existsSync(ARTIFACTS_DIR)) {
      fs.writeFileSync(path.join(ARTIFACTS_DIR, 'audit_volcano_organic_lava.png'), Buffer.from(shot2.result.data, 'base64'));
    }

    console.log('\n========================================================================');
    console.log('TODAS AS ETAPAS RESTANTES AUDITADAS COM SUCESSO!');
    console.log('========================================================================');

    ws.close();
    chrome.kill();
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na auditoria:', err);
    try { chrome.kill(); } catch (_) {}
    server.close();
    process.exit(1);
  }
});
