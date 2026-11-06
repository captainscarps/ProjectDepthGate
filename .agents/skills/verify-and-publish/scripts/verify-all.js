import fs from 'fs';
import path from 'path';
import vm from 'vm';
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
    new vm.SourceTextModule(code);
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
} catch (err) {
  logFail(`Falha no teste funcional do Refúgio: ${err.message}`);
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
