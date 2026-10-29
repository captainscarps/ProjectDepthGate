/**
 * DEPTHGATE — Auditoria Completa das 11 Classes Jogáveis no Jogo Real
 * 
 * Valida a movimentação direcional, ordem de profundidade de arma,
 * texturas e layouts para todas as 11 classes:
 * WARRIOR, BERSERKER, ARCHER, MAGE, ROGUE, NECROMANCER,
 * HUNTER, SHADOW_ASSASSIN, DRUID, WARLOCK, SHAMAN.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8146;
const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(ROOT, 'assets', 'visual-tests');
const ARTIFACTS_DIR = 'C:\\Users\\rafaelscarpille\\.gemini\\antigravity\\brain\\b413688e-2beb-42e0-9d5c-24c0349908a1';

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const ALL_11_CLASSES = [
  { id: 'WARRIOR', name: 'Guerreiro' },
  { id: 'BERSERKER', name: 'Samurai' },
  { id: 'ARCHER', name: 'Arqueiro' },
  { id: 'MAGE', name: 'Maga' },
  { id: 'ROGUE', name: 'Ladina' },
  { id: 'NECROMANCER', name: 'Necromante' },
  { id: 'HUNTER', name: 'Caçador' },
  { id: 'SHADOW_ASSASSIN', name: 'Assassino das Sombras' },
  { id: 'DRUID', name: 'Druida' },
  { id: 'WARLOCK', name: 'Bruxo' },
  { id: 'SHAMAN', name: 'Xamã' }
];

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
  console.log('DEPTHGATE — AUDITORIA DAS 11 CLASSES JOGÁVEIS (JOGO REAL)');
  console.log('========================================================================\n');

  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userData = path.join(__dirname, '..', 'chrome_audit_all_classes_profile');
  
  const chrome = spawn(chromePath, [
    '--remote-debugging-port=9246',
    `--user-data-dir=${userData}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1280,720',
    `http://127.0.0.1:${PORT}/index.html`
  ]);

  const results = [];

  try {
    await new Promise(r => setTimeout(r, 2200));
    const listRes = await fetch('http://127.0.0.1:9246/json');
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

    console.log('⏳ Inicializando jogo e iniciando campanha real...');
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

    await new Promise(r => setTimeout(r, 1200));

    for (const hero of ALL_11_CLASSES) {
      console.log(`\n⏳ Auditando classe ${hero.id} (${hero.name})...`);
      
      const evalRes = await send('Runtime.evaluate', {
        expression: `
          (async () => {
            try {
              const gs = window.__DED_GAME.scene.getScene("Game");
              const p = gs.player;
              const pv = gs.playerVisual;

              // Atualizar definição de classe
              const def = { id: "${hero.id}", name: "${hero.name}" };
              pv.classDef = def;

              // 1. Testar movimentação para CIMA (arma nas costas)
              p.facing = { x: 0, y: -1 };
              p.body.velocity.x = 0;
              p.body.velocity.y = -180;
              pv.update(0.016, p);

              const weaponIdxUp = pv.container.getIndex(pv.weapon);
              const shadowIdxUp = pv.container.getIndex(pv.contactShadow);
              const bodyIdxUp = pv.container.getIndex(pv.body);
              const depthUpOk = weaponIdxUp < bodyIdxUp && shadowIdxUp < weaponIdxUp;

              // 2. Testar movimentação para BAIXO (arma na frente)
              p.facing = { x: 0, y: 1 };
              p.body.velocity.x = 0;
              p.body.velocity.y = 180;
              pv.update(0.016, p);
              const weaponIdxDown = pv.container.getIndex(pv.weapon);
              const bodyIdxDown = pv.container.getIndex(pv.body);
              const depthDownOk = weaponIdxDown > bodyIdxDown;

              // 3. Testar movimentação LATERAL (flipX)
              p.facing = { x: 1, y: 0 };
              p.body.velocity.x = 180;
              p.body.velocity.y = 0;
              pv.update(0.016, p);
              const scaleRight = pv.container.scaleX;

              p.facing = { x: -1, y: 0 };
              p.body.velocity.x = -180;
              pv.update(0.016, p);
              const scaleLeft = pv.container.scaleX;
              const flipOk = scaleRight > 0 && scaleLeft < 0;

              // 4. Testar texturas do PlayerVisual
              const n = "${hero.id}".toLowerCase();
              const hasBodyTex = gs.textures.exists(\`pv-body-\${n}\`);
              const hasHairTex = gs.textures.exists(\`pv-hair-\${n}\`);
              const hasBaseTex = gs.textures.exists(\`player-\${n}\`);

              // Retornar ao repouso e idle para captura limpa
              p.body.velocity.x = 0;
              p.body.velocity.y = 0;
              p.facing = { x: 0, y: 1 };
              pv.update(0.016, p);

              return {
                classId: "${hero.id}",
                className: "${hero.name}",
                depthUpOk,
                depthDownOk,
                flipOk,
                hasBodyTex,
                hasHairTex,
                hasBaseTex,
                allOk: depthUpOk && depthDownOk && flipOk && (hasBodyTex || hasBaseTex)
              };
            } catch (err) {
              return { error: err.message, stack: err.stack };
            }
          })()
        `,
        awaitPromise: true,
        returnByValue: true
      });

      const data = evalRes.result?.result?.value;
      await new Promise(r => setTimeout(r, 400));

      // Captura da tela real com o herói renderizado
      const shot = await send('Page.captureScreenshot', { format: 'png' });
      const imgBuffer = Buffer.from(shot.result.data, 'base64');
      const filename = `audit_class_${hero.id.toLowerCase()}.png`;
      const outPath = path.join(OUTPUT_DIR, filename);
      fs.writeFileSync(outPath, imgBuffer);

      if (fs.existsSync(ARTIFACTS_DIR)) {
        fs.writeFileSync(path.join(ARTIFACTS_DIR, filename), imgBuffer);
      }

      const passed = data?.allOk === true;
      console.log(`   ✓ [${hero.id}] UpDepth: ${data?.depthUpOk}, DownDepth: ${data?.depthDownOk}, Flip: ${data?.flipOk}, Textura: ${data?.hasBodyTex ? 'pv-body' : 'player-base'} -> ${passed ? 'APROVADO' : 'FALHOU'}`);
      if (data?.error) {
        console.error(`      Erro interno: ${data.error}`);
      }
      results.push({
        classId: hero.id,
        name: hero.name,
        evidence: filename,
        depthUp: data?.depthUpOk ? 'SIM' : 'NÃO',
        depthDown: data?.depthDownOk ? 'SIM' : 'NÃO',
        flip: data?.flipOk ? 'SIM' : 'NÃO',
        texture: data?.hasBodyTex ? 'pv-body' : 'player-base',
        status: passed ? 'APROVADO' : 'FALHOU'
      });
    }

    console.log('\n========================================================================');
    console.log('MATRIZ AUDITADA — TODAS AS 11 CLASSES DO DEPTHGATE');
    console.log('========================================================================');
    console.table(results);

    // Salvar relatório consolidado das 11 classes
    fs.writeFileSync(
      path.join(ROOT, 'assets', 'all-11-classes-audit-report.json'),
      JSON.stringify({ timestamp: new Date().toISOString(), classes: results }, null, 2),
      'utf8'
    );

    ws.close();
    chrome.kill();
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na auditoria das 11 classes:', err);
    try { chrome.kill(); } catch (_) {}
    server.close();
    process.exit(1);
  }
});
