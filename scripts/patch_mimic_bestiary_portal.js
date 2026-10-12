/**
 * Patch: Mimic + Dual Bestiary Kills + Portal Redesign
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.dirname(__dirname);

const BUNDLE = path.join(ROOT, 'assets', 'index-D6qIWtA7-p209.js');
const MIRROR = path.join(ROOT, 'Projeto atualizado', 'assets', 'index-D6qIWtA7-p209.js');
const PORTAL_SRC = fs.readFileSync(path.join(ROOT, 'scripts', 'source', 'portal-confirm.js'), 'utf8');

let s = fs.readFileSync(BUNDLE, 'utf8');

// 1. Atualizar o código do Portal de Dificuldade com o novo design e métrica
const P_START = '/* =====================================================================\n   CONFIRMAÇÃO E CÁLCULO DE DIFICULDADE DE PORTAL';
const P_END = 'function __openForge(';
const idxPStart = s.indexOf(P_START);
const idxPEnd = s.indexOf(P_END);

if (idxPStart !== -1 && idxPEnd !== -1) {
  s = s.substring(0, idxPStart) + PORTAL_SRC + '\n\n' + s.substring(idxPEnd);
  console.log('1. Portal modal recalculado e redesenhado com sucesso!');
} else {
  console.warn('Aviso: bloco de portal não substituído por delimitador; checando método direto...');
}

// 2. Preload do Mimic no spritesheet de inimigos
const ENEMY_PRELOAD_TARGET = '["hunter-hound","hunter-hound.png",128,128]';
const ENEMY_PRELOAD_REP = '["hunter-hound","hunter-hound.png",128,128],["enemy-mimic","enemy-mimic.png",128,128]';
if (!s.includes('enemy-mimic')) {
  if (s.includes(ENEMY_PRELOAD_TARGET)) {
    s = s.replace(ENEMY_PRELOAD_TARGET, ENEMY_PRELOAD_REP);
    console.log('2. Preload de enemy-mimic inserido!');
  }
}

// 3. Definição do Inimigo MIMIC em ee
const EE_TARGET = 'ee={SKELETON:{';
const MIMIC_DEF = `ee={MIMIC:{name:"Mímico",texture:"enemy-mimic",sizeClass:"medium",bodySize:26,speed:75,maxHp:14,damage:3,hitFlashMs:120,behavior:"chase",ai:{detectionRange:240,loseTargetRange:360,patrol:!1},xp:80,gold:{min:15,max:35,chance:1},loot:{chance:.85,pools:["sword","dagger","great_sword","bow","staff","helmet","armor","boots","ring","amulet"],rarities:{UNCOMMON:45,RARE:40,EPIC:15}},anims:{idle:{frames:[0],frameRate:1,repeat:-1},walk:{frames:[1,2,3,4,5,6,7,8,9,10,11],frameRate:10,repeat:-1},attack:{frames:[12,13,14,15,16,17,18],frameRate:11,repeat:0},hurt:{frames:[29,30,31,32,33],frameRate:10,repeat:0},death:{frames:[34],frameRate:5,repeat:0}}},SKELETON:{`;

if (!s.includes('MIMIC:{name:')) {
  if (s.includes(EE_TARGET)) {
    s = s.replace(EE_TARGET, MIMIC_DEF);
    console.log('3. Definição do MIMIC em ee adicionada!');
  }
}

// 4. Interação com Baú (ms class): 25% na campanha, 55% no infinito de virar Mímico
const CHEST_TARGET = 'this.scene.audioRef?.play(Ct.CHEST_OPEN),this.scene.lootSystem.openChest(this)';
const CHEST_MIMIC = `
const __isEndless = !!this.scene.level?.endless || this.scene.game?.registry?.get("mode") === "endless";
const __mimicChance = __isEndless ? 0.55 : 0.25;
if (Math.random() < __mimicChance) {
  this.scene.audioRef?.play("sfx-elite-spawn");
  this.scene.effectsRef?.shockwaveRing(this.x, this.y, 45);
  this.scene.effectsRef?.burstTinted(this.x, this.y, 0xef4444, 24);
  this.scene.game?.events?.emit("ui:banner", typeof __L3 === "function" ? __L3("O BAÚ ERA UM MÍMICO!", "THE CHEST WAS A MIMIC!", "¡EL COFRE ERA UN MÍMICO!") : "O BAÚ ERA UM MÍMICO!", "#ef4444");
  const m = this.scene.spawnEnemy("MIMIC", this.x, this.y, { eliteRoll: false });
  if (m) {
    m.isMimic = !0;
    m.setVelocity?.(0, -60);
  }
  this.destroy();
  return;
}
this.scene.audioRef?.play(Ct.CHEST_OPEN),this.scene.lootSystem.openChest(this)
`;

if (!s.includes('__mimicChance')) {
  if (s.includes(CHEST_TARGET)) {
    s = s.replace(CHEST_TARGET, CHEST_MIMIC);
    console.log('4. Chance de Mímico em baús adicionada!');
  }
}

// 5. Bestiário: suporte a 2 contadores de mortes (Modo Campanha e Modo Infinito)
const BK_KILL_OLD = `function __bkKills() { try { return JSON.parse(localStorage.getItem("depthgate:bestiary") || "{}") } catch (e) { return {} } }
function __bkKill(k) { if (!k) return; const K = __bkKills(); K[k] = (K[k] || 0) + 1; try { localStorage.setItem("depthgate:bestiary", JSON.stringify(K)) } catch (e) { } }
function __bestTrack(G) {
  if (!G || G.__bkTr) return; G.__bkTr = !0;
  G.events.on("enemy:died", e => { e && !e.isMinion && __bkKill(e.typeKey) });
  G.events.on("boss:defeated", b => __bkKill(b?.typeKey));
}`;

const BK_KILL_NEW = `function __bkKills() {
  try {
    const raw = JSON.parse(localStorage.getItem("depthgate:bestiary") || "{}");
    const out = {};
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === "object" && v !== null) {
        out[k] = { campaign: v.campaign || 0, endless: v.endless || 0, total: (v.campaign || 0) + (v.endless || 0) };
      } else {
        const n = Number(v) || 0;
        out[k] = { campaign: n, endless: 0, total: n };
      }
    }
    return out;
  } catch (e) { return {}; }
}
function __bkKill(k, mode = null) {
  if (!k) return;
  try {
    const raw = JSON.parse(localStorage.getItem("depthgate:bestiary") || "{}");
    const isEndless = mode === "endless" || window.__DED_GAME?.registry?.get("mode") === "endless";
    const sub = isEndless ? "endless" : "campaign";
    if (typeof raw[k] !== "object" || raw[k] === null) {
      const prev = Number(raw[k]) || 0;
      raw[k] = { campaign: prev, endless: 0 };
    }
    raw[k][sub] = (raw[k][sub] || 0) + 1;
    localStorage.setItem("depthgate:bestiary", JSON.stringify(raw));
  } catch(e) {}
}
function __bestTrack(G) {
  if (!G || G.__bkTr) return; G.__bkTr = !0;
  G.events.on("enemy:died", e => {
    if (!e || e.isMinion) return;
    const isE = !!e.scene?.level?.endless || G.registry?.get("mode") === "endless";
    __bkKill(e.typeKey, isE ? "endless" : "campaign");
  });
  G.events.on("boss:defeated", b => {
    if (!b) return;
    const isE = !!b.scene?.level?.endless || G.registry?.get("mode") === "endless";
    __bkKill(b.typeKey, isE ? "endless" : "campaign");
  });
}`;

if (s.includes('function __bkKills() { try { return JSON.parse(localStorage.getItem("depthgate:bestiary")')) {
  s = s.replace(BK_KILL_OLD, BK_KILL_NEW);
  console.log('5. Sistema de contagem de mortes dupla (campanha / infinito) aplicado!');
}

// 6. Registro de BEHOLDER, PALE_DRAGON, CERBERUS em __BK_BOSSES
const BK_BOSSES_OLD = 'const __BK_BOSSES = ["LAVA_GOLEM", "ABYSS_GUARDIAN", "ANCIENT_COLOSSUS", "FROST_WARDEN", "DRAGON_ANCIENT", "ANHANGA", "WILD_ENT",\n  "FOX_WITCH", "CASTLE_LORD", "RIVER_TENGU", "GUARDIAN_FALLEN"];';
const BK_BOSSES_NEW = 'const __BK_BOSSES = ["LAVA_GOLEM", "ABYSS_GUARDIAN", "ANCIENT_COLOSSUS", "FROST_WARDEN", "DRAGON_ANCIENT", "ANHANGA", "WILD_ENT",\n  "FOX_WITCH", "CASTLE_LORD", "RIVER_TENGU", "BEHOLDER", "PALE_DRAGON", "CERBERUS", "GUARDIAN_FALLEN"];';

if (s.includes(BK_BOSSES_OLD)) {
  s = s.replace(BK_BOSSES_OLD, BK_BOSSES_NEW);
  console.log('6. Novos chefes adicionados ao livro do Bestiário (__BK_BOSSES)!');
}

// 7. Lore e Descrições para os novos monstros no Bestiário
const LORE_OLD = 'const __BK_LORE = {';
const LORE_NEW = `const __BK_LORE = {
  MIMIC: "Monstro disfarçado de baú de tesouro ancestral. Espera pacientemente que aventureiros gananciosos toquem sua fechadura antes de revelar suas presas e devorá-los.",
  BEHOLDER: "Uma aberração cósmica flutuante dotada de um olho central descomunal capaz de disparar feixes desintegradores de energia escura.",
  PALE_DRAGON: "O dragão das cinzas pálidas. Uma aparição colossal que vaga pelas profundezas exalando tempestades de chamas frias e meteoros espectrais.",
  CERBERUS: "A besta tricéfala do submundo. Extremamente rápida e feroz, avança em investidas implacáveis rasgando o chão com suas garras ardentes.",`;

if (!s.includes('MIMIC: "Monstro disfarçado')) {
  if (s.includes(LORE_OLD)) {
    s = s.replace(LORE_OLD, LORE_NEW);
    console.log('7. Lores do Mimic, Beholder, Dragão Pálido e Cerberus adicionadas!');
  }
}

// 8. Onde encontrar o Mímico e chefes novos (__BK_EXTRA_WHERE)
const WHERE_OLD = 'const __BK_EXTRA_WHERE = {';
const WHERE_NEW = `const __BK_EXTRA_WHERE = {
  MIMIC: "Encontrado disfarçado em baús na Campanha (25%) e Modo Infinito (55%)",
  BEHOLDER: "Fenda Desafio & Profundezas do Modo Infinito",
  PALE_DRAGON: "Fenda Desafio & Andares Finais do Modo Infinito",
  CERBERUS: "Fenda Desafio & Profundezas do Modo Infinito",`;

if (!s.includes('MIMIC: "Encontrado disfarçado')) {
  if (s.includes(WHERE_OLD)) {
    s = s.replace(WHERE_OLD, WHERE_NEW);
    console.log('8. Locais de encontro adicionados no Bestiário!');
  }
}

// 9. Renderização da Contagem Dupla de Mortes na Página do Inimigo
const BK_PAGE_KILL_OLD = 'const k = this.K[e.k] || 0;\n    this.T(L, X + PW / 2, 300, k ? `${__L3("Derrotados por você", "Defeated by you", "Derrotados por ti")}: ${k}` : __L3("Ainda não derrotado", "Not yet defeated", "Aún no derrotado"), 8, k ? __BK_INK : __BK_FAINT, { ox: .5, st: "italic" });';
const BK_PAGE_KILL_NEW = `const kd = this.K[e.k] || { campaign: 0, endless: 0, total: 0 };
    const tot = kd.total || 0;
    const cK = kd.campaign || 0;
    const eK = kd.endless || 0;
    const kTxt = tot ? \`\${__L3("Derrotados", "Defeated", "Derrotados")}: \${tot} (Campanha: \${cK} | Infinito: \${eK})\` : __L3("Ainda não derrotado", "Not yet defeated", "Aún no derrotado");
    this.T(L, X + PW / 2, 300, kTxt, 7.5, tot ? __BK_INK : __BK_FAINT, { ox: .5, st: "italic" });`;

if (s.includes(BK_PAGE_KILL_OLD)) {
  s = s.replace(BK_PAGE_KILL_OLD, BK_PAGE_KILL_NEW);
  console.log('9. Renderização de mortes por modo no Bestiário atualizada!');
}

// 10. Renderização da Contagem Dupla na Página de Estatísticas Iniciais do Livro
const BK_FRONT_KILL_OLD = 'this.T(R, rx, y0 + 48, `${__L3("Inimigos derrotados", "Enemies defeated", "Enemigos derrotados")}: ${kills}`, 9.5, __BK_INK, { ox: .5 });';
const BK_FRONT_KILL_NEW = `let totCamp = 0, totEnd = 0;
    for (const v of Object.values(this.K)) {
      if (typeof v === "object" && v !== null) { totCamp += (v.campaign || 0); totEnd += (v.endless || 0); }
      else { totCamp += (Number(v) || 0); }
    }
    this.T(R, rx, y0 + 48, \`\${__L3("Inimigos derrotados", "Enemies defeated", "Enemigos derrotados")}: \${totCamp + totEnd}\`, 9.5, __BK_INK, { ox: .5 });
    this.T(R, rx, y0 + 62, \`\${__L3("Campanha", "Campaign", "Campaña")}: \${totCamp}  ·  \${__L3("Infinito", "Endless", "Infinito")}: \${totEnd}\`, 8, 0x6e523b, { ox: .5 });`;

if (s.includes(BK_FRONT_KILL_OLD)) {
  s = s.replace(BK_FRONT_KILL_OLD, BK_FRONT_KILL_NEW);
  console.log('10. Estatísticas frontais com contagem dupla inseridas!');
}

// 11. Evitar __portalPrompt em portais do modo infinito ao descer
const PORTAL_ENDLESS_OLD = 'this.level.endless?__portalPrompt(this,{levelId:"endless",depth:(this.endlessRun?.()?.depth||1)+1,onConfirm:()=>this.descendEndless()}):';
const PORTAL_ENDLESS_NEW = 'this.level.endless?this.descendEndless():';
if (s.includes(PORTAL_ENDLESS_OLD)) {
  s = s.replace(PORTAL_ENDLESS_OLD, PORTAL_ENDLESS_NEW);
  console.log('11. Portal do Modo Infinito desce direto sem confirmação!');
}

// Salva bundle principal e espelha em Projeto atualizado
fs.writeFileSync(BUNDLE, s, 'utf8');
if (fs.existsSync(path.dirname(MIRROR))) {
  fs.writeFileSync(MIRROR, s, 'utf8');
}

console.log('OK — Patch de Mímico, Bestiário duplo e Portal redesenhado aplicado com sucesso!');
