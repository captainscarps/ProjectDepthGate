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
  { role: 'cave_explorer', pt: 'Essa caverna é traiçoeira, ela sempre muda a cada entrada, explore com cuidado.', en: 'This cave is treacherous, it always changes with every entrance, explore with caution.' },
  { role: 'blacksmith_welcome', pt: 'Ah, um cliente! Chegue mais perto.', en: 'Ah, a customer! Come closer.' },
  { role: 'blacksmith_talk1', pt: 'Aço bom pede fogo paciente. Em que posso ajudar?', en: 'Good steel needs patient fire. How can I help?' },
  { role: 'blacksmith_talk2', pt: 'Traga fragmentos e eu deixo sua lâmina digna do Abismo.', en: "Bring fragments and I'll make your blade worthy of the Abyss." },
  { role: 'blacksmith_quote', pt: 'Traga arma e catalisador para a fusão — eu cuido do fogo.', en: 'Bring weapon and catalyst for the fusion — I handle the fire.' },
  { role: 'herbalist_greet', pt: 'Psst! Poções fresquinhas, direto do caldeirão!', en: 'Psst! Fresh potions, straight from the cauldron!' },
  { role: 'herbalist_shop1', pt: 'Ervas frescas e um pouco de magia. Do que você precisa?', en: 'Fresh herbs and a little magic. What do you need?' },
  { role: 'herbalist_shop2', pt: 'Plantei essas flores em terra do Abismo. Curam melhor assim.', en: 'I planted these flowers in Abyss soil. They heal better that way.' },
  { role: 'herbalist_shop3', pt: 'A dourada protege, mas não dura. Use na hora certa.', en: 'The golden one protects, but it does not last. Use it at the right moment.' },
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

  async function evaluate(expr) {
    const res = await sendCommand('Runtime.evaluate', {
      expression: expr,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.method === 'Console.messageAdded') {
      console.log('[BROWSER CONSOLE]', data.params.message.text);
    }
    if (data.method === 'Runtime.consoleAPICalled') {
      console.log('[BROWSER LOG]', ...data.params.args.map(a => a.value || a.description || ''));
    }
    if (data.method === 'Runtime.exceptionThrown') {
      console.error('[BROWSER EXCEPTION]', JSON.stringify(data.params.exceptionDetails));
    }
    if (data.id && pending.has(data.id)) {
      const { resolve } = pending.get(data.id);
      pending.delete(data.id);
      resolve(data.result);
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
      for (let i = 0; i < 40; i++) {
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
          // Se MainMenu ou ClassSelect ou Hub já estiver ativo, ou Preload terminou
          if (state.activeScenes.includes('MainMenu') || state.activeScenes.includes('Hub') || state.preloadProgress === 1) {
            ready = true;
            break;
          }
        }
        await new Promise(r => setTimeout(r, 500));
      }

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

      // 2. Transicionar diretamente para a cena Hub
      console.log('Transicionando para cena Hub (Refúgio)...');
      await evaluate(`
        (function() {
          const game = window.__DED_GAME;
          try {
            game.registry.set("hub:fromForest", { slot: 1 });
            const actScenes = game.scene.getScenes(true);
            for (const s of actScenes) {
              if (s.sys.settings.key !== 'Hub') {
                game.scene.stop(s.sys.settings.key);
              }
            }
            game.scene.start("Hub", { fromForest: true, slot: 1 });
          } catch(e) {
            console.error('Erro ao iniciar Hub:', e.message, e.stack);
          }
        })()
      `);

      // 3. Aguardar cena Hub estar ativa
      let hubActive = false;
      for (let i = 0; i < 20; i++) {
        const hubState = await evaluate(`
          (function() {
            const sc = window.__DED_GAME.scene.getScene("Hub");
            return {
              exists: !!sc,
              isActive: sc?.sys?.isActive() || false,
              isTransitioning: sc?.sys?.isTransitioning() || false,
              hasCaveExplorer: !!sc?.caveExplorer,
              status: sc?.sys?.settings?.status
            };
          })()
        `);
        console.log(`[Hub Check ${i}]:`, hubState);
        if (hubState && hubState.isActive && hubState.hasCaveExplorer) {
          hubActive = true;
          break;
        }
        await new Promise(r => setTimeout(r, 600));
      }
      if (!hubActive) throw new Error('Cena Hub não ativou com sucesso');
      console.log('✓ Cena Hub ativa com sucesso!');

      // 4. Testar Texturas e Animações dos Novos NPCs
      console.log('\n--- Verificando Texturas e Animações no Phaser ---');
      const animsCheck = await evaluate(`
        (function() {
          const sc = window.__DED_GAME.scene.getScene("Hub");
          return {
            tex_peasant1: sc.textures.exists("peasant-1"),
            tex_peasant3: sc.textures.exists("peasant-3"),
            tex_elf1: sc.textures.exists("elf-1"),
            anim_p1_idle: sc.anims.exists("peasant-1-idle"),
            anim_p1_talk: sc.anims.exists("peasant-1-talk"),
            anim_p3_idle: sc.anims.exists("peasant-3-idle"),
            anim_p3_talk: sc.anims.exists("peasant-3-talk"),
            anim_elf_idle: sc.anims.exists("elf-1-idle"),
            anim_elf_talk: sc.anims.exists("elf-1-talk")
          };
        })()
      `);
      console.log('Status de texturas e animações:', animsCheck);
      for (const [k, v] of Object.entries(animsCheck)) {
        if (!v) throw new Error(`Falha no Phaser: ${k} é false!`);
      }
      console.log('✓ Todas as texturas e animações dos NPCs estão registradas!');

      // 5. Testar Presença e Configuração dos NPCs no Refúgio
      console.log('\n--- Verificando NPCs na cena Hub ---');
      const npcsState = await evaluate(`
        (function() {
          const sc = window.__DED_GAME.scene.getScene("Hub");
          return {
            smithExists: !!sc.smith,
            smithTex: sc.smith?.f?.texture?.key,
            smithAnim: sc.smith?.f?.anims?.currentAnim?.key,
            herbExists: !!sc.herb,
            herbTex: sc.herb?.s?.texture?.key,
            herbAnim: sc.herb?.s?.anims?.currentAnim?.key,
            caveNpcExists: !!sc.caveExplorer,
            caveNpcTex: sc.caveExplorer?.texture?.key,
            caveNpcAnim: sc.caveExplorer?.anims?.currentAnim?.key,
            caveNpcPos: sc.caveExplorer ? [sc.caveExplorer.x, sc.caveExplorer.y] : null
          };
        })()
      `);
      console.log('Estado dos NPCs no Refúgio:', npcsState);

      if (npcsState.smithTex !== 'peasant-1') throw new Error(`Ferreiro esperado 'peasant-1', obteve '${npcsState.smithTex}'`);
      if (npcsState.herbTex !== 'elf-1') throw new Error(`Herbalista esperada 'elf-1', obteve '${npcsState.herbTex}'`);
      if (npcsState.caveNpcTex !== 'peasant-3') throw new Error(`Explorador da caverna esperado 'peasant-3', obteve '${npcsState.caveNpcTex}'`);
      console.log('✓ Ferreiro, Herbalista e Explorador da Caverna estão com as spritesheets corretas!');

      // 6. Testar Diálogo e Voz do Explorador da Caverna
      console.log('\n--- Testando fala e dublagem do Explorador da Caverna ---');
      const caveTalkResult = await evaluate(`
        (function() {
          const sc = window.__DED_GAME.scene.getScene("Hub");
          const expectedLine = "Essa caverna é traiçoeira, ela sempre muda a cada entrada, explore com cuidado.";
          const hasDub = window.__dubHas ? window.__dubHas(expectedLine) : false;
          const dur = window.__dubDur ? window.__dubDur(expectedLine) : 0;
          
          let callbackFired = false;
          sc.__talkCaveNpc(() => { callbackFired = true; });
          
          const currentAnim = sc.caveExplorer?.anims?.currentAnim?.key;
          const bubText = sc.__bub ? sc.__bub.text : null;
          
          return {
            hasDub,
            dur,
            currentAnim,
            bubText,
            matchedExpected: bubText === expectedLine
          };
        })()
      `);
      console.log('Resultado do Explorador da Caverna:', caveTalkResult);
      if (!caveTalkResult.hasDub) throw new Error('Dublagem do Explorador da Caverna não encontrada em __dubHas!');
      if (caveTalkResult.dur < 4.0) throw new Error(`Duração calculada muito baixa: ${caveTalkResult.dur}s`);
      if (caveTalkResult.currentAnim !== 'peasant-3-talk') throw new Error(`Animação esperada 'peasant-3-talk', obteve '${caveTalkResult.currentAnim}'`);
      if (!caveTalkResult.matchedExpected) throw new Error(`Texto do balão divergente: '${caveTalkResult.bubText}'`);
      console.log('✓ Fala e animação do Explorador da Caverna verificadas com sucesso!');

      // 7. Testar Diálogo e Voz do Ferreiro
      console.log('\n--- Testando fala e dublagem do Ferreiro ---');
      const smithTalkResult = await evaluate(`
        (function() {
          const sc = window.__DED_GAME.scene.getScene("Hub");
          sc.__smithTalk();
          const bubText = sc.__bub ? sc.__bub.text : null;
          const hasDub = window.__dubHas ? window.__dubHas(bubText) : false;
          const dur = window.__dubDur ? window.__dubDur(bubText) : 0;
          const anim = sc.smith?.f?.anims?.currentAnim?.key;
          return {
            bubText,
            hasDub,
            dur,
            anim
          };
        })()
      `);
      console.log('Resultado do Ferreiro:', smithTalkResult);
      if (!smithTalkResult.hasDub) throw new Error(`Dublagem do Ferreiro não encontrada para: '${smithTalkResult.bubText}'`);
      if (smithTalkResult.anim !== 'peasant-1-talk') throw new Error(`Animação esperada 'peasant-1-talk', obteve '${smithTalkResult.anim}'`);
      console.log('✓ Fala e animação do Ferreiro verificadas com sucesso!');

      // 8. Testar Diálogo e Voz da Herbalista
      console.log('\n--- Testando fala e dublagem da Herbalista ---');
      const herbTalkResult = await evaluate(`
        (function() {
          const sc = window.__DED_GAME.scene.getScene("Hub");
          sc.closePanel();
          sc.panel = null;
          sc.__busy = false;
          sc.__herbShop();
          const bubText = sc.__bub ? sc.__bub.text : null;
          const hasDub = window.__dubHas ? window.__dubHas(bubText) : false;
          const dur = window.__dubDur ? window.__dubDur(bubText) : 0;
          const anim = sc.herb?.s?.anims?.currentAnim?.key;
          return {
            bubText,
            hasDub,
            dur,
            anim
          };
        })()
      `);
      console.log('Resultado da Herbalista:', herbTalkResult);
      if (!herbTalkResult.hasDub) throw new Error(`Dublagem da Herbalista não encontrada para: '${herbTalkResult.bubText}'`);
      if (herbTalkResult.anim !== 'elf-1-talk') throw new Error(`Animação esperada 'elf-1-talk', obteve '${herbTalkResult.anim}'`);
      console.log('✓ Fala e animação da Herbalista verificadas com sucesso!');

      // 9. Testar Troca de Idioma para Inglês (EN)
      console.log('\n--- Testando dublagem em Inglês (EN) ---');
      const enCheck = await evaluate(`
        (function() {
          const expectedEn = "This cave is treacherous, it always changes with every entrance, explore with caution.";
          const hasDub = window.__dubHas ? window.__dubHas(expectedEn) : false;
          const dur = window.__dubDur ? window.__dubDur(expectedEn) : 0;
          return { hasDub, dur };
        })()
      `);
      console.log('Resultado EN para o Explorador da Caverna:', enCheck);
      if (!enCheck.hasDub) throw new Error('Linha em inglês não encontrada em __dubHas!');
      if (enCheck.dur < 4.0) throw new Error(`Duração EN inválida: ${enCheck.dur}s`);
      console.log('✓ Sistema em inglês verificado com sucesso!');

      // 10. Capturar screenshot do Refúgio
      console.log('\n--- Capturando screenshots da tela ---');
      await evaluate(`
        (function() {
          try {
            document.querySelectorAll("div").forEach(d => {
              if (d.textContent && d.textContent.includes("CLIQUE OU PRESSIONE")) d.remove();
            });
          } catch(e) {}
        })()
      `);
      await new Promise(r => setTimeout(r, 400));
      const shot = await sendCommand('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ROOT, 'test_hub_npcs_verified.png'), Buffer.from(shot.data, 'base64'));
      console.log('✓ Screenshot 1 (modal da loja) salvo em test_hub_npcs_verified.png!');

      // Fechar modal e focar câmera no portal da caverna com o Explorador
      await evaluate(`
        (function() {
          const sc = window.__DED_GAME.scene.getScene("Hub");
          sc.closePanel();
          sc.panel = null;
          sc.__busy = false;
          const p = sc.M.spots.portal;
          sc.cameras.main.centerOn(p[0], p[1]);
        })()
      `);
      await new Promise(r => setTimeout(r, 600));
      const shot2 = await sendCommand('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(path.join(ROOT, 'test_hub_npcs_overview.png'), Buffer.from(shot2.data, 'base64'));
      console.log('✓ Screenshot 2 (portal e explorador) salvo em test_hub_npcs_overview.png!');

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
