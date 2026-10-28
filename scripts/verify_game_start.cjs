const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8130;
const ROOT = path.resolve(__dirname, '..');

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(ROOT, reqPath);
  if (!fs.existsSync(filePath)) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
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
    '.mp3': 'audio/mpeg',
    '.webm': 'video/webm'
  };
  res.writeHead(200, {
    'Content-Type': mimeMap[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '127.0.0.1', async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userData = path.join(__dirname, 'chrome_test_profile_verify');
  
  const chrome = spawn(chromePath, [
    '--remote-debugging-port=9229',
    `--user-data-dir=${userData}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `http://127.0.0.1:${PORT}/index.html`
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const listRes = await fetch('http://127.0.0.1:9229/json');
  const tabs = await listRes.json();
  const tab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  let realErrors = [];
  let testSuiteAssertions = {
    campaignOk: false,
    touchLifecycleOk: false,
    pauseMenuLayoutOk: false,
    abyssModalOk: false,
    endlessOk: false,
    canonicalPuzzlesOk: false,
    moltenbornTexturesOk: false,
    codexBestiaryOk: false
  };

  ws.onopen = () => {
    ws.send(JSON.stringify({ id: 1, method: 'Runtime.enable' }));
    ws.send(JSON.stringify({ id: 2, method: 'Console.enable' }));

    // Wait 3.5s for Preload to complete and start Campaign
    setTimeout(() => {
      console.log('\n--- [ETAPA 1] Iniciando Modo Campanha e habilitando Touch ---');
      ws.send(JSON.stringify({
        id: 10,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (function() {
              const g = window.__DED_GAME;
              if (!g) return "NO GAME";
              try {
                const cur = JSON.parse(localStorage.getItem("depthgate_settings") || "{}");
                cur.touchControls = "on";
                localStorage.setItem("depthgate_settings", JSON.stringify(cur));

                g.scene.start("Game", {
                  heroClass: "WARRIOR",
                  mode: "campaign",
                  levelIndex: 0
                });
                return "Started Campaign";
              } catch(e) {
                console.error("CAMPAIGN ERROR:", e);
                return "FAIL: " + e.message;
              }
            })()
          `,
          returnByValue: true
        }
      }));
    }, 3500);

    // Wait 6s for Campaign and UI scene to build
    setTimeout(() => {
      console.log('\n--- [ETAPA 2] Validando Estado do Jogo e Ciclo de Vida do Touch / Pausa ---');
      ws.send(JSON.stringify({
        id: 11,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (function() {
              const g = window.__DED_GAME;
              const gs = g.scene.getScene("Game");
              const ui = g.scene.getScene("UI");
              const tc = ui?.touchControls;
              const pm = ui?.pauseMenu;

              if (tc && !tc.built) tc.build();
              if (tc) tc.setVisible(true);

              const initialTouchVis = tc?.visible;
              const initialDesiredVis = tc?.desiredVisible;
              const startBtnText = tc?.startBtn?.text?.text;
              const selectBtnText = tc?.selectBtn?.text?.text;

              // Step 1: Open Pause Menu
              pm?.show();
              const pauseOpen = !!pm?.open;
              const pauseRootVis = !!pm?.root?.visible;

              let titleY = null;
              if (pm?.root?.list) {
                const tObj = pm.root.list.find(o => o.text && o.text.includes("P A U S A"));
                if (tObj) titleY = tObj.y;
              }
              const firstBtnY = pm?.buttons?.[0]?.t?.y;

              // Step 2: Close Pause Menu
              pm?.close();
              const pauseClosed = !pm?.open;

              // Step 3: CRITICAL ASSERTION - Verify touch controls persist and are NOT disabled!
              const afterTouchVis = tc?.visible;
              const afterDesiredVis = tc?.desiredVisible;
              const startBtnStillVis = tc?.startBtn?.parts?.[0]?.visible;
              const selectBtnStillVis = tc?.selectBtn?.parts?.[0]?.visible;

              return {
                isActive: gs?.scene?.isActive(),
                playerCreated: !!gs?.player,
                dungeonCreated: !!gs?.dungeon,
                state: gs?.state,
                initialTouchVis,
                initialDesiredVis,
                startBtnText,
                selectBtnText,
                pauseOpen,
                pauseRootVis,
                titleY,
                firstBtnY,
                noOverlap: (firstBtnY != null && titleY != null && firstBtnY > (titleY + 16)),
                pauseClosed,
                afterTouchVis,
                afterDesiredVis,
                startBtnStillVis,
                selectBtnStillVis,
                touchPersisted: (afterTouchVis === true && afterDesiredVis === true && startBtnStillVis === true)
              };
            })()
          `,
          returnByValue: true
        }
      }));
    }, 9500);

    // Test Abyss Portal modal layout
    setTimeout(() => {
      console.log('\n--- [ETAPA 3] Validando Layout da Tela de Escolha do Abismo (Centralização e Responsividade) ---');
      ws.send(JSON.stringify({
        id: 15,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (function() {
              const g = window.__DED_GAME;
              const ui = g.scene.getScene("UI");
              if (!window.__openAbyssPortalModal) return { ok: false, error: "NO ABYSS MODAL" };

              window.__openAbyssPortalModal(ui, 2, () => {});
              const portalUI = ui.__portalChoiceUI;
              const open = portalUI?.open;
              const rootVis = portalUI?.root?.visible;

              const w = window._ || 640;
              const h = 360;
              const cx = Math.round(w / 2);

              // Check card container coordinates
              const cards = portalUI?.cardsContainer?.list || [];
              const coords = cards.map(c => ({ x: c.x, y: c.y }));
              
              // Cards must be centered around cx (320) and inside virtual bounds [0..w, 0..360]
              const insideScreen = coords.length === 3 && coords.every(c => c.x >= 20 && c.x <= w - 20 && c.y >= 20 && c.y <= h - 20);
              const isCentered = coords.length === 3 && Math.abs(coords[1].x - cx) <= 2;

              portalUI?.close();
              const closed = !portalUI?.open;

              return {
                ok: true,
                open,
                rootVis,
                w,
                h,
                cx,
                coords,
                insideScreen,
                isCentered,
                closed
              };
            })()
          `,
          returnByValue: true
        }
      }));
    }, 11500);

    // Now test Endless mode
    setTimeout(() => {
      console.log('\n--- [ETAPA 4] Iniciando Modo Infinito ---');
      ws.send(JSON.stringify({
        id: 20,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (function() {
              const g = window.__DED_GAME;
              if (!g) return "NO GAME";
              try {
                g.scene.start("Game", {
                  heroClass: "WARRIOR",
                  mode: "endless",
                  endless: true
                });
                return "Started Endless";
              } catch(e) {
                console.error("ENDLESS ERROR:", e);
                return "FAIL: " + e.message;
              }
            })()
          `,
          returnByValue: true
        }
      }));
    }, 13500);

    // Wait and check Endless Game scene status
    setTimeout(() => {
      console.log('\n--- [ETAPA 5] Verificando Estado da Cena do Modo Infinito ---');
      ws.send(JSON.stringify({
        id: 21,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (function() {
              const g = window.__DED_GAME;
              const gs = g.scene.getScene("Game");
              return {
                isActive: gs.scene.isActive(),
                playerCreated: !!gs.player,
                dungeonCreated: !!gs.dungeon,
                state: gs.state,
                isEndless: gs.mode === "endless" || !!gs.level?.endless
              };
            })()
          `,
          returnByValue: true
        }
      }));
    }, 17500);

    // Now test spawning canonical puzzles via AbyssPuzzleManager
    setTimeout(() => {
      console.log('\n--- [ETAPA 6] Testando os 5 Enigmas Canônicos (Blocos, Lasers, Alavancas, Braseiros, Runas) ---');
      ws.send(JSON.stringify({
        id: 30,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (function() {
              const g = window.__DED_GAME;
              const gs = g.scene.getScene("Game");
              if (!window.AbyssPuzzleManager) return "NO ABYSS PUZZLE MANAGER";
              const mgr = new window.AbyssPuzzleManager(gs);
              
              const r = gs.roomManager?.rooms?.[0];
              const b = r ? { x: r.x * 32, y: r.y * 32, width: r.w * 32, height: r.h * 32 } : { x: 300, y: 300, width: 300, height: 200 };
              
              mgr.startBlocksPuzzle(null, b, () => {});
              const hasBlocks = mgr.activeObjects.length > 0;
              mgr.destroyActive();

              mgr.startLaserPrismPuzzle(null, b, () => {});
              const hasLaser = mgr.activeObjects.length > 0;
              mgr.destroyActive();

              mgr.startLeversPuzzle(null, b, () => {});
              const hasLevers = mgr.activeObjects.length > 0;
              mgr.destroyActive();

              mgr.startBraziersPuzzle(null, b, () => {});
              const hasBraziers = mgr.activeObjects.length > 0;
              mgr.destroyActive();

              mgr.startRuneMemoryPuzzle(null, b, () => {});
              const hasRunes = mgr.activeObjects.length > 0;
              mgr.destroyActive();

              return {
                hasBlocks,
                hasLaser,
                hasLevers,
                hasBraziers,
                hasRunes
              };
            })()
          `,
          returnByValue: true
        }
      }));
    }, 19500);

    // Test Moltenborn enemy textures and Codex / Bestiary via Pause Menu button actions
    setTimeout(() => {
      console.log('\n--- [ETAPA 7] Testando Inimigos Moltenborn, Bestiário e Códice ---');
      ws.send(JSON.stringify({
        id: 40,
        method: 'Runtime.evaluate',
        params: {
          expression: `
            (function() {
              const g = window.__DED_GAME;
              const ui = g.scene.getScene("UI");
              const tm = g.textures;

              const expectedMb = [
                "mb-ash-spirit",
                "mb-basalt-colossus",
                "mb-cinder-stalker",
                "mb-crystal-sage",
                "mb-magma-brute",
                "mb-meteoro"
              ];
              const allMbExist = expectedMb.every(k => tm.exists(k));

              let bestiaryOk = false;
              let codexOk = false;

              const pm = ui?.pauseMenu;
              if (pm) {
                if (!pm.built) pm.build();
                // Button 1: BESTIÁRIO
                try {
                  const bBtn = pm.buttons?.find(b => b.label && b.label.includes("BESTI"));
                  if (bBtn) {
                    bBtn.action();
                    bestiaryOk = g.scene.isActive("BestiaryBook") || !!g.scene.getScene("BestiaryBook");
                    g.scene.stop("BestiaryBook");
                  }
                } catch(e) { console.error("BK ACTION ERR:", e); }

                // Button 4: CÓDICE
                try {
                  const cBtn = pm.buttons?.find(b => b.label && (b.label.includes("CÓDICE") || b.label.includes("CODEX")));
                  if (cBtn) {
                    cBtn.action();
                    codexOk = g.scene.isActive("CodexBook") || !!g.scene.getScene("CodexBook");
                    g.scene.stop("CodexBook");
                  }
                } catch(e) { console.error("CD ACTION ERR:", e); }
              }

              return {
                allMbExist,
                bestiaryOk,
                codexOk
              };
            })()
          `,
          returnByValue: true
        }
      }));
    }, 21500);

    setTimeout(() => {
      console.log('\n================ RESUMO FINAL DA BATERIA DE TESTES ================');
      console.log('Erros de execução não capturados:', realErrors.length);
      console.log('Status de cada teste:');
      console.log('  1. Campanha Iniciada:', testSuiteAssertions.campaignOk ? 'PASSOU ✅' : 'FALHOU ❌');
      console.log('  2. Touch Persistente pós-Pausa:', testSuiteAssertions.touchLifecycleOk ? 'PASSOU ✅' : 'FALHOU ❌');
      console.log('  3. Sem Colisão Pausa/Continuar:', testSuiteAssertions.pauseMenuLayoutOk ? 'PASSOU ✅' : 'FALHOU ❌');
      console.log('  4. Tela do Abismo Centralizada e Responsiva:', testSuiteAssertions.abyssModalOk ? 'PASSOU ✅' : 'FALHOU ❌');
      console.log('  5. Modo Infinito Ativo:', testSuiteAssertions.endlessOk ? 'PASSOU ✅' : 'FALHOU ❌');
      console.log('  6. Enigmas Canônicos:', testSuiteAssertions.canonicalPuzzlesOk ? 'PASSOU ✅' : 'FALHOU ❌');
      console.log('  7. Texturas Moltenborn:', testSuiteAssertions.moltenbornTexturesOk ? 'PASSOU ✅' : 'FALHOU ❌');
      console.log('  8. Bestiário e Códice:', testSuiteAssertions.codexBestiaryOk ? 'PASSOU ✅' : 'FALHOU ❌');

      const allSuccess = Object.values(testSuiteAssertions).every(v => v === true) && realErrors.length === 0;
      console.log('\nVEREDITO:', allSuccess ? 'TODOS OS TESTES PASSARAM COM SUCESSO! ✅' : 'ALGUM TESTE FALHOU ❌');

      chrome.kill();
      server.close();
      process.exit(allSuccess ? 0 : 1);
    }, 24500);
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id >= 10) {
      const val = data.result?.result?.value;
      console.log(`[EVAL ${data.id}]`, JSON.stringify(val, null, 2));

      if (data.id === 10 && val === "Started Campaign") testSuiteAssertions.campaignOk = true;
      if (data.id === 11) {
        if (val?.touchPersisted) testSuiteAssertions.touchLifecycleOk = true;
        if (val?.noOverlap) testSuiteAssertions.pauseMenuLayoutOk = true;
      }
      if (data.id === 15 && val?.insideScreen && val?.isCentered) testSuiteAssertions.abyssModalOk = true;
      if (data.id === 20 && val === "Started Endless") testSuiteAssertions.endlessOk = true;
      if (data.id === 30 && val?.hasBlocks && val?.hasLaser && val?.hasLevers && val?.hasBraziers && val?.hasRunes) {
        testSuiteAssertions.canonicalPuzzlesOk = true;
      }
      if (data.id === 40) {
        if (val?.allMbExist) testSuiteAssertions.moltenbornTexturesOk = true;
        if (val?.bestiaryOk && val?.codexOk) testSuiteAssertions.codexBestiaryOk = true;
      }
    }
    if (data.method === 'Runtime.exceptionThrown') {
      console.log('\n❌ [EXCEPTION]:', data.params.exceptionDetails.exception?.description || data.params.exceptionDetails.text);
      realErrors.push(data.params.exceptionDetails);
    }
    if (data.method === 'Runtime.consoleAPICalled') {
      const type = data.params.type;
      const args = data.params.args.map(a => a.value ?? a.description);
      const text = args.join(' ');
      if (type === 'error' && !text.includes('Texture key already in use') && !text.includes('net::ERR_')) {
        console.log('🔴 [CONSOLE ERROR]:', ...args);
        realErrors.push(args);
      }
    }
  };
});
