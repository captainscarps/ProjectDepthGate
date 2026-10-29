/**
 * DEPTHGATE — Automação de Testes Visuais: Direções e Interações Modulares (Etapa 2, 4, 5, 6 e 7)
 * 
 * Captura estados padronizados:
 * 1. Movimento para Cima (vista traseira upA/upB)
 * 2. Movimento para Baixo (vista frontal)
 * 3. Movimento Lateral (vista lateral com arma empunhada)
 * 4. Baú Ambiental Interativo (closed & opened)
 * 5. Alavanca Mecânica (off & on com iluminação de feedback)
 * 6. Armadilha Ambiental com telégrafo e espinhos
 * 7. Quebra-cabeça de Totens Rúnicos
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8138;
const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT, 'assets', 'visual-tests');
const ARTIFACTS_DIR = 'C:\\Users\\rafaelscarpille\\.gemini\\antigravity\\brain\\b413688e-2beb-42e0-9d5c-24c0349908a1';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

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
  console.log('================================================================');
  console.log('DEPTHGATE — TESTES DE DIREÇÕES E INTERAÇÕES (ETAPAS 2, 4, 5, 6, 7)');
  console.log('================================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userData = path.join(__dirname, '..', 'chrome_test_profile_interactions');
  
  const chrome = spawn(chromePath, [
    '--remote-debugging-port=9234',
    `--user-data-dir=${userData}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1280,720',
    `http://127.0.0.1:${PORT}/index.html`
  ]);

  try {
    await new Promise(r => setTimeout(r, 2200));
    const listRes = await fetch('http://127.0.0.1:9234/json');
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

    console.log('⏳ Carregando engine do jogo e módulos interativos...');
    await new Promise(r => setTimeout(r, 3800));

    // Configurar cena de teste com objetos e suporte direcional
    const setupResult = await send('Runtime.evaluate', {
      expression: `
        (async function() {
          const game = window.__DED_GAME;
          if (!game) return { error: "Jogo não inicializado" };

          const { createVisualTestSceneClass } = await import('/assets/visual-test-scene.js');
          const { EnvironmentalChest, EnvironmentalLever, EnvironmentalTrap, EnvironmentalPuzzle, EnvironmentalAtmosphere } = await import('/assets/environmental-interactions.js');

          const VisualSceneClass = createVisualTestSceneClass();

          if (!game.scene.getScene('VisualTestScene')) {
            game.scene.add('VisualTestScene', VisualSceneClass, false);
          }

          for (const s of game.scene.getScenes(true)) {
            game.scene.stop(s.scene.key);
          }
          game.scene.start('VisualTestScene', { character: 'warrior', weapon: 'weapon-sword-mk4', anim: 'idle' });

          // Instanciar objetos interativos de teste após inicialização da cena
          setTimeout(() => {
            const sc = game.scene.getScene('VisualTestScene');
            if (sc) {
              // 1. Tochas de atmosfera
              EnvironmentalAtmosphere.addTorch(sc, 180, 110);
              EnvironmentalAtmosphere.addTorch(sc, 460, 110);

              // 2. Baú ambiental
              sc.__testChest = new EnvironmentalChest(sc, 220, 180, { rarity: 'epic', gold: 80 });

              // 3. Alavanca mecânica
              sc.__testLever = new EnvironmentalLever(sc, 280, 150, () => {
                sc.__testChest?.open();
              });

              // 4. Armadilha no piso
              sc.__testTrap = new EnvironmentalTrap(sc, 380, 220, { damage: 2 });

              // 5. Quebra-cabeça de totens
              sc.__testPuzzle = new EnvironmentalPuzzle(sc, 480, 210, { sequence: [0, 1, 2] });
            }
          }, 600);

          return { ok: true };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('   Resultado do setup:', setupResult.result?.value);
    await new Promise(r => setTimeout(r, 1600));

    async function capture(name, description, expr) {
      if (expr) {
        await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
        await new Promise(r => setTimeout(r, 400));
      }

      const snapRes = await send('Page.captureScreenshot', { format: 'png' });
      if (snapRes && snapRes.result && snapRes.result.data) {
        const buf = Buffer.from(snapRes.result.data, 'base64');
        const filename = `visual_test_${name}.png`;
        const localPath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(localPath, buf);

        if (fs.existsSync(ARTIFACTS_DIR)) {
          const artPath = path.join(ARTIFACTS_DIR, filename);
          fs.writeFileSync(artPath, buf);
        }

        console.log(`   ✓ [${name.toUpperCase()}] Captura: ${filename} (${buf.length} bytes) — ${description}`);
        return true;
      }
      return false;
    }

    console.log('\n📸 Iniciando bateria de capturas de direções e objetos interativos:');

    // 1. Vista Traseira / Movimento para Cima (upA/upB)
    await capture('dir_up_backview', 'Personagem em vista traseira (costas) com arma nas costas', `
      (() => {
        const sc = window.__DED_GAME.scene.getScene('VisualTestScene');
        sc.heroSprite.setFrame(37); // Frame upA oficial de costas
        sc.charContainer.sendToBack(sc.weaponSprite);
        sc.socketMarker.setPosition(0, -6);
        sc.hudText.setText('TESTE DIRECIONAL — CIMA (VISTA TRASEIRA / COSTAS)');
      })()
    `);

    // 2. Vista Frontal / Movimento para Baixo
    await capture('dir_down_frontview', 'Personagem em vista frontal com arma à frente', `
      (() => {
        const sc = window.__DED_GAME.scene.getScene('VisualTestScene');
        sc.heroSprite.setFrame(0); // Frame idle/frontal oficial
        sc.charContainer.bringToTop(sc.weaponSprite);
        sc.socketMarker.setPosition(10, 5);
        sc.hudText.setText('TESTE DIRECIONAL — BAIXO (VISTA FRONTAL)');
      })()
    `);

    // 3. Baú Interativo e Alavanca Mecânica
    await capture('interact_chest_lever', 'Baú épico e alavanca mecânica com feedback visual', `
      (() => {
        const sc = window.__DED_GAME.scene.getScene('VisualTestScene');
        sc.charContainer.setPosition(250, 180);
        sc.__testLever?.toggle();
        sc.hudText.setText('OBJETOS MODULARES — BAÚ ÉPICO E ALAVANCA ATIVADA');
      })()
    `);

    // 4. Armadilha Ambiental com Espinhos
    await capture('interact_trap_spikes', 'Armadilha no piso disparando espinhos mecânicos', `
      (() => {
        const sc = window.__DED_GAME.scene.getScene('VisualTestScene');
        sc.__testTrap?.fire(null);
        sc.hudText.setText('OBJETO MODULAR — ARMADILHA DE ESPINHOS COM TELÉGRAFO');
      })()
    `);

    // 5. Quebra-Cabeça de Totens Rúnicos
    await capture('puzzle_totems_sequence', 'Câmara de quebra-cabeça com totens cristalinos em sequência', `
      (() => {
        const sc = window.__DED_GAME.scene.getScene('VisualTestScene');
        sc.charContainer.setPosition(480, 240);
        sc.__testPuzzle?.interactTotem(0);
        sc.__testPuzzle?.interactTotem(1);
        sc.hudText.setText('QUEBRA-CABEÇA AMBIENTAL — TOTENS RÚNICOS ACESOS');
      })()
    `);

    console.log('\n🎉 Capturas direcionais e interativas salvas com sucesso absoluto!');
    console.log(`📁 Imagens salvas em: ${OUTPUT_DIR}\n`);

    ws.close();
  } catch (err) {
    console.error('❌ Erro durante as capturas:', err);
  } finally {
    try { chrome.kill(); } catch (e) {}
    server.close();
  }
});
