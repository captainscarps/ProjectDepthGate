import fs from 'fs';
import path from 'path';
import vm from 'vm';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..', '..', '..');

console.log('====================================================');
console.log('   DEPTHGATE - SUÍTE DE VERIFICAÇÃO E TESTES (QA)   ');
console.log('====================================================\n');

let errors = 0;
let warnings = 0;

function logPass(msg) {
  console.log(`[PASS] ${msg}`);
}
function logFail(msg) {
  console.error(`[FAIL] ${msg}`);
  errors++;
}
function logWarn(msg) {
  console.warn(`[WARN] ${msg}`);
  warnings++;
}

// 1. Sincronização e Sintaxe dos Bundles
console.log('--- 1. Verificação Sintática dos Bundles ---');
const bundles = [
  path.join(ROOT, 'assets', 'index-D6qIWtA7-p209.js'),
  path.join(ROOT, 'Projeto atualizado', 'assets', 'index-D6qIWtA7-p209.js')
];

for (const b of bundles) {
  const rel = path.relative(ROOT, b);
  if (!fs.existsSync(b)) {
    logFail(`Bundle não encontrado: ${rel}`);
    continue;
  }
  try {
    const code = fs.readFileSync(b, 'utf8');
    if (vm.SourceTextModule) {
      new vm.SourceTextModule(code);
    } else {
      // Quando executado sem a flag experimental, mascara import.meta para validação de sintaxe pura
      const sanitized = code.replace(/import\.meta(?:\.[a-zA-Z_$][0-9a-zA-Z_$]*)*/g, '({})');
      new vm.Script(sanitized, { filename: rel });
    }
    logPass(`Sintaxe ES Module válida: ${rel}`);
  } catch (err) {
    logFail(`Erro de sintaxe em ${rel}: ${err.message}`);
  }
}

// 2. Verificação de Métodos Órfãos no Refúgio / Hub
console.log('\n--- 2. Verificação de Integridade dos Módulos (scripts/source) ---');
const hubPath = path.join(ROOT, 'scripts', 'source', 'hub-village.js');
if (fs.existsSync(hubPath)) {
  const hubCode = fs.readFileSync(hubPath, 'utf8');
  const defs = new Set();
  const defRegex = /(?:^|\n|;|\})\s*(?:async\s+)?(__?\w+)\s*\([^)]*\)\s*\{/g;
  let m;
  while ((m = defRegex.exec(hubCode)) !== null) {
    defs.add(m[1]);
  }
  const callRegex = /this\.(__\w+)\s*\(/g;
  const calls = new Set();
  while ((m = callRegex.exec(hubCode)) !== null) {
    calls.add(m[1]);
  }
  let missing = [];
  for (const c of calls) {
    if (!defs.has(c)) {
      missing.push(c);
    }
  }
  if (missing.length === 0) {
    logPass('hub-village.js: Todos os métodos this.__ estão devidamente definidos.');
  } else {
    logFail(`hub-village.js: Métodos chamados mas inexistentes: ${missing.join(', ')}`);
  }
}

// 3. Teste Funcional do Menu de Pausa do Refúgio
console.log('\n--- 3. Teste Funcional do Menu de Pausa do Refúgio ---');
try {
  const src = fs.readFileSync(hubPath, 'utf8');
  class MockScene {
    constructor() {
      this.cameras = { main: { zoom: 1, fadeOut: () => {}, fadeIn: () => {}, setBounds: () => {}, startFollow: () => {}, stopFollow: () => {} } };
      this.events = { on: () => {}, once: () => {}, off: () => {} };
      this.time = { delayedCall: () => {} };
      this.tweens = { add: () => {} };
      this.game = { audioEngine: { sfx: () => {}, music: () => {}, startAmbience: () => {}, setState: () => {} }, inputManager: {} };
      this.fromForest = false;
      this.area = 'out';
      this.inters = [];
      this.labels = [];
      this.dummies = [];
      this.__ox = 0;
      this.__oy = 0;
      this.__us = 1;
      this.add = {
        container: () => ({ add: () => {}, setDepth: function(){return this;}, setScrollFactor: function(){return this;}, setScale: function(){return this;}, destroy: function(){this.destroyed = true;} }),
        rectangle: () => ({ setInteractive: function(){return this;} }),
        graphics: () => ({ clear: () => {} }),
        text: () => ({ setOrigin: function(){return this;}, setInteractive: function(){return this;}, on: function(ev, fn){ this[ev] = fn; return this; }, setText: function(){return this;}, setColor: function(){return this;} })
      };
    }
    exitToMenu() { this.exitedToMenu = true; }
  }

  const evaluatedClass = new Function('Base', 'j', 'Dt', '__winSkin', '__L3', 'la', 'ti', 'Le', 'Gt', '_', 'st', 'W', 
    'class HubTest extends Base {\n' + src + '\n}\nreturn HubTest;'
  )(MockScene, { BlendModes: { ADD: 1 } }, () => {}, () => false, (a) => a, {}, {}, {}, () => {}, 800, 450, (k) => k);

  const hub = new evaluatedClass();
  hub.__pzOpen();
  if (!hub.panel || !hub.__pz) throw new Error('__pzOpen falhou em criar o painel');
  hub.__pzNav(1);
  hub.__pzConfirm();
  if (!hub.exitedToMenu || hub.panel !== null) throw new Error('__pzConfirm falhou na ação de sair para o menu');
  hub.exitedToMenu = false;
  hub.__pzOpen();
  hub.__pzConfirm(); // Confirmar Continuar (Resume)
  if (hub.panel !== null) throw new Error('__pzConfirm falhou em fechar o menu ao selecionar Continuar');
  logPass('Ciclo do menu de pausa (abrir, navegar, confirmar e fechar) validado com sucesso.');

  // Validar o portal branco da Caverna no canto inferior direito do Refúgio
  hub.M = {
    coll: Array.from({ length: 88 }, () => '0'.repeat(128)),
    spots: { vendor: [400, 420], shrine: [820, 282], campfire: [512, 458], portal: [512, 646], sign: [952, 620], hunter: [232, 302], board: [648, 300], cabin: [150, 300], girl: [544, 304] },
    house: { door: [464, 292] },
    interior: { door: [1248, 258], smith: { anvil: [1352, 200] }, spots: { forge: [1352, 124], rack: [1416, 220], tub: [1304, 156] } }
  };
  hub.textures = { exists: () => true };
  hub.children = { list: [] };
  hub.add.image = () => ({ setOrigin: function(){return this;}, setScale: function(){return this;}, setDepth: function(){return this;}, setBlendMode: function(){return this;}, setTint: function(){return this;}, setAlpha: function(){return this;} });
  hub.add.sprite = () => ({ setOrigin: function(){return this;}, setScale: function(){return this;}, setDepth: function(){return this;}, setTint: function(){return this;}, setBlendMode: function(){return this;}, setAlpha: function(){return this;}, play: function(){return this;}, active: true });
  hub.__caveExplorerInit();
  hub.__inters();
  const cavePortalInter = hub.inters.find(i => i.id === 'cave_portal');
  const caveNpcInter = hub.inters.find(i => i.id === 'cave_npc');
  if (!cavePortalInter || cavePortalInter.x < 800 || cavePortalInter.y < 600) {
    throw new Error('Portal da Caverna Dorf não encontrado no canto inferior direito do Refúgio');
  }
  // Pedido do usuário: no Refúgio fica só o portal branco padrão, sem explorador
  if (caveNpcInter || hub.caveExplorer) {
    throw new Error('O Refúgio não deve ter o NPC Explorador; só o portal branco padrão');
  }
  logPass('Portal branco da Caverna Dorf validado no canto inferior direito do Refúgio (sem explorador).');
} catch (err) {
  logFail(`Falha no teste funcional do Refúgio: ${err.message}`);
}

// 3.5 Teste Funcional do Gerador Procedural Orgânico da Caverna Dorf e Atlas
console.log('\n--- 3.5. Verificação das Cavernas Dorf (Atlas + Gerador Procedural Orgânico + Economia) ---');
try {
  const dorfAtlasPath = path.join(ROOT, 'assets', 'pixel-art', 'deepcave', 'dorf-atlas.json');
  const dorfPngPath = path.join(ROOT, 'assets', 'pixel-art', 'deepcave', 'dorf-atlas.png');
  if (!fs.existsSync(dorfAtlasPath) || !fs.existsSync(dorfPngPath)) {
    throw new Error('dorf-atlas.json ou dorf-atlas.png não encontrados');
  }
  const atlasMeta = JSON.parse(fs.readFileSync(dorfAtlasPath, 'utf8'));
  for (const key of ['floor', 'wall', 'ledge', 'arches', 'props', 'lights', 'portalArch']) {
    if (!atlasMeta[key]) throw new Error(`Chave ausente em dorf-atlas.json: ${key}`);
  }
  if (!atlasMeta.wall.cap || !atlasMeta.wall.mid || !atlasMeta.wall.base || !atlasMeta.wall.glowCap) {
    throw new Error('Paredes de basalto de 3 tiles (cap/mid/base/glowCap) ausentes no atlas');
  }
  logPass('Atlas Deep Cave (dorf-atlas.json + dorf-atlas.png) íntegro e completo.');

  const dorfSrc = fs.readFileSync(path.join(ROOT, 'scripts', 'source', 'dorf-caves.js'), 'utf8');
  const dorfFn = new Function('Ls', 'window', dorfSrc + '\nreturn { __buildDorfCaveLevel, __getForgeCoins, __setForgeCoins, __dorfReturnToRefuge };');
  const mockWin = {};
  const { __buildDorfCaveLevel, __dorfReturnToRefuge } = dorfFn({ catacombs: { id: 'catacombs' } }, mockWin);
  const lvl = __buildDorfCaveLevel({ depth: 1, seed: 'qa_test' });
  if (!lvl || !lvl.__organicGrid || !Array.isArray(lvl.doors) || lvl.doors.length !== 0) {
    throw new Error('A caverna gerada deve ser orgânica e sem portas trancadas (doors.length === 0)');
  }
  let chestCount = 0;
  for (const rm of lvl.rooms) {
    for (const dc of rm.decor || []) {
      if (dc.type === 'chest') chestCount++;
    }
  }
  if (chestCount < 2 || chestCount > 4) {
    throw new Error(`Quantidade de baús fora do esperado para economia escassa: ${chestCount}`);
  }
  logPass(`Gerador orgânico Cavernas Dorf validado (${lvl.world.cols}x${lvl.world.rows}, 0 portas, ${chestCount} baús valiosos em alcovas).`);

  // Testar fluxo de morte e retorno seguro da Caverna Dorf sem travar física/timers/UI
  let startCalled = false;
  const mockScene = {
    isDorfCave: true,
    originMode: 'campaign',
    dorfSlot: 1,
    time: { paused: true },
    physics: { resume: () => {} },
    tweens: { resumeAll: () => {} },
    player: { maxHp: 8, hp: 0, dead: true, body: { enable: true }, setVelocity: () => {} },
    enemies: { getChildren: () => [] },
    scene: {
      get: () => ({ __etp: { open: true, queue: [1], root: { destroy: () => {} } } }),
      stop: () => {},
      start: (key) => { if (key === 'Hub') startCalled = true; }
    },
    game: { registry: { get: () => 1, set: () => {}, remove: () => {} } },
    cameraSys: { fadeOut: (ms, cb) => cb() }
  };
  __dorfReturnToRefuge(mockScene);
  if (!startCalled || mockScene.time.paused) {
    throw new Error('Falha no fluxo de retorno e recuperação de morte da Caverna Dorf: cena congelada ou transição falhou.');
  }
  logPass('Fluxo de morte e retorno seguro ao Refúgio validado (física/timers descongelados, transição garantida).');

  const avPath = path.join(ROOT, 'asset-versions.json');
  if (fs.existsSync(avPath)) {
    const av = JSON.parse(fs.readFileSync(avPath, 'utf8'));
    const bundleHash = crypto.createHash('md5').update(fs.readFileSync(path.join(ROOT, 'assets/index-D6qIWtA7-p209.js'))).digest('hex').slice(0, 10);
    if (av['assets/index-D6qIWtA7-p209.js'] !== bundleHash) {
      throw new Error(`asset-versions.json desatualizado para index-D6qIWtA7-p209.js (${av['assets/index-D6qIWtA7-p209.js']} vs ${bundleHash})`);
    }
    logPass(`asset-versions.json sincronizado com o bundle atual (${bundleHash}).`);
  }
} catch (err) {
  logFail(`Falha na verificação das Cavernas Dorf: ${err.message}`);
}

// 4. Auditoria de Listeners e Promises
console.log('\n--- 4. Auditoria de Listeners e Riscos de Vazamento de Memória ---');
const srcDir = path.join(ROOT, 'scripts', 'source');
if (fs.existsSync(srcDir)) {
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.js'));
  files.forEach(f => {
    const code = fs.readFileSync(path.join(srcDir, f), 'utf8');
    const intervals = (code.match(/setInterval/g) || []).length;
    if (intervals > 0) {
      logWarn(`${f}: detectado(s) ${intervals} setInterval(s). Certifique-se de que são limpos no shutdown.`);
    }
  });
  logPass('Auditoria de listeners e temporizadores concluída.');
}

console.log('\n====================================================');
if (errors === 0) {
  console.log(`[SUCESSO] Todos os testes passaram! (Erros: 0, Alertas: ${warnings})`);
  process.exit(0);
} else {
  console.error(`[FALHA] Foram encontrados ${errors} erro(s). Corrija antes de publicar!`);
  process.exit(1);
}

