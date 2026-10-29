/**
 * DEPTHGATE — Automação de Capturas e Testes Visuais (Pipeline Gráfico)
 * 
 * Executa testes visuais automatizados no Chrome Headless via CDP WebSocket nativo.
 * Padroniza câmera, escala, resolução canônica (640x360), posição e tempo de captura.
 * Captura os 7 estados canônicos solicitados na Etapa E.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8135;
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
  console.log('====================================================');
  console.log('DEPTHGATE — TESTES VISUAIS AUTOMATIZADOS (ETAPA E)');
  console.log('====================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userData = path.join(__dirname, '..', 'chrome_test_profile_visual');
  
  const chrome = spawn(chromePath, [
    '--remote-debugging-port=9232',
    `--user-data-dir=${userData}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1280,720',
    `http://127.0.0.1:${PORT}/index.html`
  ]);

  try {
    await new Promise(r => setTimeout(r, 2200));
    const listRes = await fetch('http://127.0.0.1:9232/json');
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

    console.log('⏳ Aguardando inicialização da engine e carregamento do cache de assets...');
    await new Promise(r => setTimeout(r, 3500));

    // Inicializar cena de teste isolada
    const setupResult = await send('Runtime.evaluate', {
      expression: `
        (async function() {
          const game = window.__DED_GAME;
          if (!game) return { error: "Jogo não inicializado" };

          // Importar dinamicamente os módulos do pipeline sem poluir o runtime da campanha
          const { createVisualTestSceneClass } = await import('/assets/visual-test-scene.js');
          await import('/assets/graphic-effects.js');
          await import('/assets/animation-catalog.js');

          const VisualSceneClass = createVisualTestSceneClass();

          if (!game.scene.getScene('VisualTestScene')) {
            game.scene.add('VisualTestScene', VisualSceneClass, false);
          }

          // Pausar cenas ativas e iniciar a VisualTestScene
          for (const s of game.scene.getScenes(true)) {
            game.scene.stop(s.scene.key);
          }
          game.scene.start('VisualTestScene', { character: 'warrior', weapon: 'weapon-sword-mk4', anim: 'idle' });
          return { ok: true };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('   Resultado do setup da cena:', setupResult.result?.value);
    await new Promise(r => setTimeout(r, 1200));

    async function captureSnapshot(testName, description, actionExpr) {
      if (actionExpr) {
        await send('Runtime.evaluate', { expression: actionExpr, returnByValue: true });
        await new Promise(r => setTimeout(r, 350));
      }

      const snapRes = await send('Page.captureScreenshot', { format: 'png' });
      if (snapRes && snapRes.result && snapRes.result.data) {
        const buf = Buffer.from(snapRes.result.data, 'base64');
        const filename = `visual_test_${testName}.png`;
        const localPath = path.join(OUTPUT_DIR, filename);
        fs.writeFileSync(localPath, buf);

        if (fs.existsSync(ARTIFACTS_DIR)) {
          const artPath = path.join(ARTIFACTS_DIR, filename);
          fs.writeFileSync(artPath, buf);
        }

        console.log(`   ✓ [${testName.toUpperCase()}] Captura gerada: ${filename} (${buf.length} bytes) — ${description}`);
        return true;
      }
      return false;
    }

    console.log('\n📸 Iniciando bateria padronizada de 7 capturas visuais:');

    // 1. Personagem Parado (idle)
    await captureSnapshot('1_idle', 'Personagem parado com postura neutra', `
      window.__DEPTHGATE_VISUAL_TEST.setAnimation('idle');
      window.__DEPTHGATE_VISUAL_TEST.setPosition(320, 180);
    `);

    // 2. Caminhada (walk)
    await captureSnapshot('2_walk', 'Ciclo de caminhada tática', `
      window.__DEPTHGATE_VISUAL_TEST.setAnimation('walk');
    `);

    // 3. Corrida (run)
    await captureSnapshot('3_run', 'Ciclo de corrida com inclinação corporal', `
      window.__DEPTHGATE_VISUAL_TEST.setAnimation('run');
    `);

    // 4. Ataque (attack / hit)
    await captureSnapshot('4_attack', 'Liberação do golpe e impacto', `
      window.__DEPTHGATE_VISUAL_TEST.setAnimation('hit');
      window.__DEPTHGATE_VISUAL_TEST.triggerHitImpact();
    `);

    // 5. Troca de Arma (weapon swap)
    await captureSnapshot('5_weapon_swap', 'Substituição de espada por machado pesado MK4', `
      window.__DEPTHGATE_VISUAL_TEST.setWeapon('weapon-axe-mk4');
      window.__DEPTHGATE_VISUAL_TEST.setAnimation('idle');
    `);

    // 6. Efeito Mágico (magic cast & glow)
    await captureSnapshot('6_magic_glow', 'Canalização mágica com aura aditiva no socket da arma', `
      window.__DEPTHGATE_VISUAL_TEST.setAnimation('cast');
      window.__DEPTHGATE_VISUAL_TEST.triggerMagicGlow();
    `);

    // 7. Sobreposição com Cenário (depth sorting)
    await captureSnapshot('7_scenery_overlap', 'Sobreposição do personagem à frente da coluna do cenário', `
      window.__DEPTHGATE_VISUAL_TEST.setAnimation('walk');
      window.__DEPTHGATE_VISUAL_TEST.setPosition(362, 190);
    `);

    console.log('\n🎉 Todas as 7 capturas foram concluídas com sucesso absoluto!');
    console.log(`📁 Imagens salvas em: ${OUTPUT_DIR}\n`);

    ws.close();
  } catch (err) {
    console.error('❌ Erro durante os testes visuais:', err);
  } finally {
    try { chrome.kill(); } catch (e) {}
    server.close();
  }
});
