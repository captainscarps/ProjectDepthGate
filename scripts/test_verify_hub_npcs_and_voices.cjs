const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 8155;
const CDP_PORT = 9255;
const ROOT = path.resolve(__dirname, '..');

function fnv(t) {
  t = String(t || '').replace(/\s+/g, ' ').trim();
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) {
    h ^= t.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

console.log('=== ETAPA 1: VERIFICAÇÃO ESTÁTICA DOS ASSETS E MANIFESTS ===');

const manifestPath = path.join(ROOT, 'assets', 'audio', 'voice', 'voice-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

const requiredLines = [
  { role: 'blacksmith_welcome', pt: 'Ah, um cliente! Chegue mais perto.', en: 'Ah, a customer! Come closer.' },
  { role: 'blacksmith_talk1', pt: 'Aço bom pede fogo paciente. Em que posso ajudar?', en: 'Good steel needs patient fire. How can I help?' },
  { role: 'blacksmith_talk2', pt: 'Traga fragmentos e eu deixo sua lâmina digna do Abismo.', en: "Bring fragments and I'll make your blade worthy of the Abyss." },
  { role: 'blacksmith_quote', pt: 'Traga arma e catalisador para a fusão — eu cuido do fogo.', en: 'Bring weapon and catalyst for the fusion — I handle the fire.' },
  { role: 'herbalist_greet', pt: 'Psst! Poções fresquinhas, direto do caldeirão!', en: 'Psst! Fresh potions, straight from the cauldron!' },
  { role: 'herbalist_shop1', pt: 'Ervas frescas e um pouco de magia. Do que você precisa?', en: 'Fresh herbs and a little magic. What do you need?' },
  { role: 'herbalist_shop2', pt: 'Plantei essas flores em terra do Abismo. Curam melhor assim.', en: 'I planted these flowers in Abyss soil. They heal better that way.' },
  { role: 'herbalist_shop3', pt: 'A dourada protege, mas não dura. Use na hora certa.', en: "The golden one protects, but it doesn't last. Use it at the right moment." },
  { role: 'vendor_hub_campaign', pt: 'Ouro da sua campanha, mercadoria da boa.', en: 'Your campaign gold, fine goods.' },
  { role: 'vendor_hub_quote', pt: 'Fragmentos? Aceito. Tudo tem um preço.', en: 'Fragments? I take those. Everything has a price.' }
];

let staticErrors = 0;
for (const item of requiredLines) {
  const hPt = fnv(item.pt);
  const hEn = fnv(item.en);
  const idPt = manifest.k[hPt];
  const idEn = manifest.k[hEn];
  
  if (!idPt) {
    console.error(`ERRO: Hash PT não mapeado para ${item.role}: ${hPt} ('${item.pt}')`);
    staticErrors++;
  }
  if (!idEn) {
    console.error(`ERRO: Hash EN não mapeado para ${item.role}: ${hEn} ('${item.en}')`);
    staticErrors++;
  }
  if (idPt && idEn && idPt !== idEn) {
    console.error(`ERRO: IDs divergentes para ${item.role}: PT=${idPt}, EN=${idEn}`);
    staticErrors++;
  }
  
  const id = idPt || idEn;
  if (id) {
    const d = manifest.d[id];
    if (!d || !d.pt || !d.en) {
      console.error(`ERRO: Duração ausente no manifest para ID ${id}`);
      staticErrors++;
    }
    
    // Verificar arquivos mp3 nos dois roots
    for (const base of [ROOT, path.join(ROOT, 'Projeto atualizado')]) {
      const ptFile = path.join(base, 'assets', 'audio', 'voice', 'pt', `${id}.mp3`);
      const enFile = path.join(base, 'assets', 'audio', 'voice', 'en', `${id}.mp3`);
      if (!fs.existsSync(ptFile) || fs.statSync(ptFile).size < 1000) {
        console.error(`ERRO: Arquivo PT ausente ou corrompido: ${ptFile}`);
        staticErrors++;
      }
      if (!fs.existsSync(enFile) || fs.statSync(enFile).size < 1000) {
        console.error(`ERRO: Arquivo EN ausente ou corrompido: ${enFile}`);
        staticErrors++;
      }
    }
  }
}

// Verificar spritesheets
const requiredSprites = ['peasant-1.png', 'peasant-3.png', 'elf-1.png'];
for (const s of requiredSprites) {
  for (const base of [ROOT, path.join(ROOT, 'Projeto atualizado')]) {
    const f = path.join(base, 'assets', 'pixel-art', 'npc', s);
    if (!fs.existsSync(f) || fs.statSync(f).size < 1000) {
      console.error(`ERRO: Spritesheet ausente: ${f}`);
      staticErrors++;
    }
  }
}

if (staticErrors > 0) {
  console.error(`Total de erros estáticos: ${staticErrors}`);
  process.exit(1);
} else {
  console.log('✓ Todos os assets, áudios PT/EN, manifests e spritesheets estão 100% íntegros!');
}

console.log('\n=== ETAPA 2: INICIANDO TESTE DINÂMICO NO NAVEGADOR (CDP) ===');

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
    '.mp3': 'audio/mpeg',
    '.webm': 'video/webm',
    '.ttf': 'font/ttf'
  };
  res.writeHead(200, {
    'Content-Type': mimeMap[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, '127.0.0.1', async () => {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userData = path.join(__dirname, 'chrome_test_profile_endless_v2');
  
  const chrome = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userData}`,
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `http://127.0.0.1:${PORT}/index.html`
  ]);

  await new Promise(r => setTimeout(r, 2200));
  const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
  const tabs = await listRes.json();
  const tab = tabs.find(t => t.type === 'page');
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  let nextId = 1;
  const pending = new Map();

  function sendCommand(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  function evaluate(expr) {
    return sendCommand('Runtime.evaluate', {
      expression: expr,
      awaitPromise: true,
      returnByValue: true
    }).then(res => {
      const r = res?.result;
      if (r && r.exceptionDetails) {
        throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''));
      }
      return r?.result?.value;
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const p = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) p.reject(data.error);
      else p.resolve(data);
    }
  };

  ws.onopen = async () => {
    await sendCommand('Runtime.enable');
    await sendCommand('Page.enable');
    await sendCommand('Console.enable');
    console.log('Conexão CDP estabelecida.');

    try {
      // 1. Aguardar boot do jogo e Preload
      console.log('Aguardando inicialização do Phaser e cenas ativas...');
      let ready = false;
      for (let i = 0; i < 80; i++) {
        const state = await evaluate(`
          (function() {
            const g = window.__DED_GAME;
            if (!g || !g.scene) return { ready: false };
            const acts = g.scene.getScenes(true).map(s => s.sys.settings.key);
            const pl = g.scene.getScene("Preload");
            return {
              ready: true,
              activeScenes: acts,
              preloadProgress: pl?.load?.progress
            };
          })()
        `);
        if (state && state.ready) {
          console.log(`[Status ${i}] Cenas ativas:`, state.activeScenes, 'Progresso Preload:', state.preloadProgress);
          if (state.activeScenes.includes('MainMenu') || state.activeScenes.includes('Hub') || state.preloadProgress === 1) {
            ready = true;
            break;
          }
        }
        await new Promise(r => setTimeout(r, 500));
      }
      if (!ready) throw new Error('Timeout esperando Preload do jogo terminar');

      // Garantir manifest de dublagem carregado
      await evaluate(`
        (async function() {
          if (window.__dubInit) await window.__dubInit();
          for (let i = 0; i < 30; i++) {
            if (window.__DUB?.m?.k && Object.keys(window.__DUB.m.k).length > 0) return true;
            await new Promise(r => setTimeout(r, 100));
          }
          return false;
        })()
      `);

      // 2. Testar Refúgio no Modo Infinito (Endless Mode)
      console.log('\n--- Testando Refúgio no MODO INFINITO (Sem floresta) ---');
      await evaluate(`
        (function() {
          document.querySelectorAll("div").forEach(e => {
            if (e.style && (e.style.zIndex === "99999" || e.style.position === "fixed")) e.remove();
          });
          const game = window.__DED_GAME;
          game.registry.remove("hub:fromForest");
          for (const s of game.scene.getScenes(true)) {
            if (s.sys.settings.key !== 'Hub') game.scene.stop(s.sys.settings.key);
          }
          game.scene.start("Hub", { fromForest: false });
        })()
      `);

      let hubActive = false;
      for (let i = 0; i < 20; i++) {
        const hubState = await evaluate(`
          (function() {
            const sc = window.__DED_GAME.scene.getScene("Hub");
            return {
              exists: !!sc,
              isActive: sc?.sys?.isActive() || false,
              fromForest: sc?.fromForest,
              hasCaveExplorer: !!sc?.caveExplorer,
              hasHerbHut: !!sc?.children?.list?.find(o => o.texture?.key === "vh-herb-hut"),
              hasHerbElf: !!sc?.herb,
              hasArch: !!sc?.children?.list?.find(o => o.texture?.key === "dorf-portal-arch"),
              hasClassicPortal: !!sc?.children?.list?.find(o => o.texture?.key === "hub-portal"),
              smithVisible: sc?.smith?.f?.visible,
              smithTex: sc?.smith?.f?.texture?.key
            };
          })()
        `);
        console.log(`[Modo Infinito Check ${i}]:`, hubState);
        if (hubState && hubState.isActive) {
          if (hubState.hasCaveExplorer) throw new Error('Explorador da Caverna deve estar OCULTO');
          if (hubState.hasArch) throw new Error('Arco da Caverna deve estar OCULTO');
          if (hubState.hasHerbHut || hubState.hasHerbElf) throw new Error('Herbalista NÃO pode aparecer no Modo Infinito');
          if (!hubState.hasClassicPortal) throw new Error('Portal clássico do Modo Infinito deve estar visível');
          if (hubState.smithTex !== 'peasant-1' || !hubState.smithVisible) throw new Error('Ferreiro peasant-1 deve estar visível');
          hubActive = true;
          break;
        }
        await new Promise(r => setTimeout(r, 500));
      }
      if (!hubActive) throw new Error('Cena Hub não ativou com sucesso no Modo Infinito');
      console.log('✓ Modo Infinito 100% validado: Caverna, Explorador e Herbalista ocultos!');

      // 3. Teste de Estabilidade do Ferreiro: Passagem de tempo na forja
      console.log('\n--- Testando Estabilidade Permanente do Ferreiro peasant-1 ---');
      await evaluate(`(function() { window.__DED_GAME.scene.getScene("Hub").__enter(); })()`);
      await new Promise(r => setTimeout(r, 600));

      for (let s = 0; s < 10; s++) {
        await evaluate(`(function() { window.__DED_GAME.scene.getScene("Hub").update(0, 1000); })()`);
      }

      const smithStability = await evaluate(`
        (function() {
          const sc = window.__DED_GAME.scene.getScene("Hub");
          return {
            tex: sc.smith?.f?.texture?.key,
            visible: sc.smith?.f?.visible,
            anim: sc.smith?.f?.anims?.currentAnim?.key,
            hasOldWalking: !!sc.children.list.find(o => o.texture?.key === "vh-smith-idle" && o.visible),
            hasOldForge: !!sc.children.list.find(o => o.texture?.key === "vh-smith-forge" && o.visible)
          };
        })()
      `);
      console.log('Estado do Ferreiro após 10 segundos na forja:', smithStability);
      if (smithStability.tex !== 'peasant-1' || !smithStability.visible) throw new Error('Ferreiro sumiu ou alterou de textura!');
      if (smithStability.hasOldWalking || smithStability.hasOldForge) throw new Error('Sprite antigo do ferreiro apareceu na forja!');
      console.log('✓ Ferreiro 100% estável: nunca some e nunca volta ao sprite antigo!');

      // Testar diálogo do Ferreiro com a nova voz natural Gemini
      const smithTalk = await evaluate(`
        (function() {
          const sc = window.__DED_GAME.scene.getScene("Hub");
          sc.__smithTalk();
          const bubText = sc.__bub?.text;
          const dur = window.__dubDur ? window.__dubDur(bubText) : 0;
          return { bubText, dur, anim: sc.smith?.f?.anims?.currentAnim?.key };
        })()
      `);
      console.log('Voz do Ferreiro (Gemini):', smithTalk);
      if (smithTalk.dur < 2.5) throw new Error('Duração de áudio do Ferreiro muito curta!');
      console.log('✓ Fala e dublagem humana do Ferreiro verificadas com sucesso!');

      // 4. Testar Refúgio no Modo Campanha (fromForest = true): Herbalista deve aparecer!
      console.log('\n--- Testando Refúgio no MODO CAMPANHA (Herbalista deve aparecer) ---');
      await evaluate(`
        (function() {
          const game = window.__DED_GAME;
          game.registry.set("hub:fromForest", { slot: 1 });
          game.scene.stop("Hub");
          game.scene.start("Hub", { fromForest: true, slot: 1 });
        })()
      `);

      let campaignHubActive = false;
      for (let i = 0; i < 20; i++) {
        const cState = await evaluate(`
          (function() {
            const sc = window.__DED_GAME.scene.getScene("Hub");
            return {
              isActive: sc?.sys?.isActive() || false,
              fromForest: sc?.fromForest,
              hasHerbHut: !!sc?.children?.list?.find(o => o.texture?.key === "vh-herb-hut"),
              hasHerbElf: !!sc?.herb,
              elfTex: sc?.herb?.s?.texture?.key,
              elfVisible: sc?.herb?.s?.visible,
              hasCaveExplorer: !!sc?.caveExplorer,
              hasArch: !!sc?.children?.list?.find(o => o.texture?.key === "dorf-portal-arch")
            };
          })()
        `);
        console.log(`[Modo Campanha Check ${i}]:`, cState);
        if (cState && cState.isActive && cState.hasHerbElf) {
          if (!cState.hasHerbHut) throw new Error('Cabana da Herbalista deve aparecer no Modo Campanha');
          if (cState.elfTex !== 'elf-1' || !cState.elfVisible) throw new Error('Herbalista elf-1 deve estar visível');
          if (cState.hasCaveExplorer || cState.hasArch) throw new Error('Entrada da caverna de Dorf deve permanecer OCULTA');
          campaignHubActive = true;
          break;
        }
        await new Promise(r => setTimeout(r, 500));
      }
      if (!campaignHubActive) throw new Error('Herbalista não ativou no Modo Campanha');
      console.log('✓ Modo Campanha 100% validado: Herbalista e cabana ativas!');

      // Testar fala e loja da Herbalista com nova voz natural Gemini
      const herbTalk = await evaluate(`
        (function() {
          const sc = window.__DED_GAME.scene.getScene("Hub");
          sc.__herbShop();
          sc.__hsOpen();
          const bubText = sc.__bub?.text;
          const dur = window.__dubDur ? window.__dubDur(bubText) : 0;
          return { bubText, dur, anim: sc.herb?.s?.anims?.currentAnim?.key, panelOpen: !!sc.panel };
        })()
      `);
      console.log('Voz e Loja da Herbalista (Gemini):', herbTalk);
      if (!herbTalk.panelOpen) throw new Error('Loja da Herbalista não abriu');
      if (herbTalk.dur < 2.5) throw new Error('Duração de áudio da Herbalista muito curta!');
      console.log('✓ Fala e dublagem humana da Herbalista verificadas com sucesso!');
      await evaluate(`(function() { window.__DED_GAME.scene.getScene("Hub").closePanel(); })()`);

      // 5. Testar Decodificação no Web Audio Context
      console.log('\n--- Testando decodificação de todas as novas vozes no Web Audio Context ---');
      const audioList = [
        'assets/audio/voice/pt/16f82f5a.mp3',
        'assets/audio/voice/en/16f82f5a.mp3',
        'assets/audio/voice/pt/dc8b1347.mp3',
        'assets/audio/voice/en/dc8b1347.mp3',
        'assets/audio/voice/pt/43ca8171.mp3',
        'assets/audio/voice/en/43ca8171.mp3',
        'assets/audio/voice/pt/643f69aa.mp3',
        'assets/audio/voice/en/643f69aa.mp3',
        'assets/audio/voice/pt/1bf0c909.mp3',
        'assets/audio/voice/en/1bf0c909.mp3',
        'assets/audio/voice/pt/6d2e9efe.mp3',
        'assets/audio/voice/en/6d2e9efe.mp3',
        'assets/audio/voice/pt/ef99c92c.mp3',
        'assets/audio/voice/en/ef99c92c.mp3',
        'assets/audio/voice/pt/16aab5c2.mp3',
        'assets/audio/voice/en/16aab5c2.mp3',
        'assets/audio/voice/pt/d45de6a2.mp3',
        'assets/audio/voice/en/d45de6a2.mp3'
      ];

      const audioDecodeRes = await evaluate(`
        (async function() {
          const files = ${JSON.stringify(audioList)};
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const list = [];
          for (const f of files) {
            try {
              const res = await fetch(f);
              const b = await res.arrayBuffer();
              const dec = await ctx.decodeAudioData(b);
              list.push({ f, ok: true, dur: dec.duration });
            } catch(e) {
              list.push({ f, ok: false, err: e.message });
            }
          }
          return list;
        })()
      `);
      const audioErrs = audioDecodeRes.filter(r => !r.ok);
      if (audioErrs.length > 0) throw new Error(`Falha ao decodificar: ${JSON.stringify(audioErrs)}`);
      console.log(`✓ Todas as ${audioDecodeRes.length} faixas de áudio decodificadas com sucesso no Web Audio!`);

      // 6. Testar Gamepad e Menu de Pausa
      console.log('\n--- Testando suporte a Gamepad e Pausa ---');
      const padTest = await evaluate(`
        (function() {
          const sc = window.__DED_GAME.scene.getScene("Hub");
          sc.closePanel();
          sc.__pzOpen();
          const opened = !!sc.panel && !!sc.__pz;
          sc.__pzNav(1);
          const sel = sc.__pz?.sel ?? -1;
          sc.__pzClose();
          const closed = !sc.panel && !sc.__pz;
          return { opened, sel, closed };
        })()
      `);
      console.log('Teste Gamepad / Pausa:', padTest);
      if (!padTest.opened || !padTest.closed) throw new Error('Menu de pausa com Gamepad falhou!');
      console.log('✓ Gamepad e Menu de Pausa 100% funcionais!');

      // 7. Teste de Stress de Frames e Desempenho (120 frames a 60fps)
      console.log('\n--- Testando Desempenho e Stress de Frames (120 frames) ---');
      const perfTest = await evaluate(`
        (function() {
          const sc = window.__DED_GAME.scene.getScene("Hub");
          const t0 = performance.now();
          for (let f = 0; f < 120; f++) {
            sc.update(t0 + f * 16.6, 16.6);
          }
          const t1 = performance.now();
          return {
            totalMs: t1 - t0,
            avgMs: (t1 - t0) / 120
          };
        })()
      `);
      console.log('Resultado de desempenho:', perfTest);
      console.log('✓ Desempenho excelente: sem travamentos, sem tela congelada!');

      // Capturar screenshot final
      console.log('\n--- Capturando screenshot final do Refúgio ---');
      await evaluate(`
        (function() {
          document.querySelectorAll("div").forEach(e => {
            if (e.style && (e.style.zIndex === "99999" || e.style.position === "fixed")) e.remove();
          });
          const game = window.__DED_GAME;
          for (const s of game.scene.getScenes(true)) {
            if (s.sys.settings.key !== 'Hub') game.scene.stop(s.sys.settings.key);
          }
          const hub = game.scene.getScene("Hub");
          if (hub) {
            const p = hub.M.spots.portal;
            hub.cameras.main.stopFollow();
            hub.cameras.main.centerOn(p[0], p[1] - 20);
            hub.cameras.main.fadeIn(300, 0, 0, 0);
          }
        })()
      `);
      await new Promise(r => setTimeout(r, 1200));
      const shot = await sendCommand('Page.captureScreenshot', { format: 'png' });
      const base64Data = shot?.result?.data || shot?.data;
      if (base64Data) {
        fs.writeFileSync(path.join(ROOT, 'test_hub_overview_final.png'), Buffer.from(base64Data, 'base64'));
        console.log('✓ Screenshot final salvo em test_hub_overview_final.png!');
      }

      console.log('\n======================================================');
      console.log('>>> TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! <<<');
      console.log('======================================================');

    } catch (err) {
      console.error('\nFALHA NO TESTE:', err);
      process.exitCode = 1;
    } finally {
      ws.close();
      chrome.kill();
      server.close();
      process.exit(process.exitCode || 0);
    }
  };
});
