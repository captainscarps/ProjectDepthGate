/**
 * Patch: Extra Bosses (Beholder, Pale Dragon, Cerberus)
 * Adiciona os 3 novos chefes ao jogo:
 * - Preload de spritesheets
 * - Configurações completas em Yt (vida, dano, velocidade, fases, ataques especiais, frames)
 * - Registro na Fenda Desafio e no Modo Infinito (vr e Zi boss rushes)
 * - Registro no Bestiário (__BK_ENDLESS_BOSS)
 * - Atualização dos bundles JS em assets/ e Projeto atualizado/
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.dirname(__dirname);

const BUNDLE = path.join(ROOT, 'assets', 'index-D6qIWtA7-p209.js');
const MIRROR = path.join(ROOT, 'Projeto atualizado', 'assets', 'index-D6qIWtA7-p209.js');

let s = fs.readFileSync(BUNDLE, 'utf8');

if (s.includes('boss-beholder') && s.includes('Yt.BEHOLDER')) {
  console.log('Patch de chefes extras já aplicado!');
  process.exit(0);
}

// 1. Injetar spritesheets no preload de bosses
const PRELOAD_TARGET = '["boss-observer","boss-observer.png",128,128]';
const PRELOAD_REPLACEMENT = '["boss-observer","boss-observer.png",128,128],["boss-beholder","boss-beholder.png",42,42],["boss-pale-dragon","boss-pale-dragon.png",256,256],["boss-cerberus","boss-cerberus.png",128,128]';

if (!s.includes(PRELOAD_TARGET)) {
  console.error('ERRO: Preload target não encontrado');
  process.exit(1);
}
s = s.replace(PRELOAD_TARGET, PRELOAD_REPLACEMENT);

// 2. Definir os 3 Chefes em Yt logo após Yt.LAVA_GOLEM
const YT_TARGET = 'Yt.LAVA_GOLEM||';
const BOSS_DEFS = `
Yt.BEHOLDER || (Yt.BEHOLDER = {
  ...Yt.ABYSS_GUARDIAN,
  name: "O Beholder Abissal",
  subtitle: "O Olho das Profundezas Obscuras",
  texture: "boss-beholder",
  scale: 2.1,
  bodySize: 32,
  maxHp: 85,
  contactDamage: 3,
  speed: 52,
  xp: 1200,
  gold: { min: 140, max: 230 },
  attackCooldownMs: 1400,
  attacks: {
    RAY: { damage: 4, range: 240, width: 48, telegraphMs: 700, recoverMs: 600 },
    SLAM: { damage: 3, range: 64, width: 70, telegraphMs: 600, recoverMs: 500 },
    SHOCKWAVE: { damage: 3, radius: 120, telegraphMs: 800, recoverMs: 700 }
  },
  phase2: {
    hpRatio: 0.5,
    speedMult: 1.4,
    cooldownMult: 0.65,
    damageMult: 1.3,
    radiusMult: 1.3,
    chargeSpeedMult: 1.25,
    tint: 0xd8b4fe
  },
  anims: {
    idle: { frames: [0, 1, 2, 3], frameRate: 6, repeat: -1 },
    walk: { frames: [4, 5, 6, 7], frameRate: 8, repeat: -1 },
    attack: { frames: [8, 9, 10, 11], frameRate: 9, repeat: 0 },
    strike: { frames: [12, 13, 14, 15], frameRate: 11, repeat: 0 },
    hurt: { frames: [16, 17, 18, 19], frameRate: 10, repeat: 0 },
    death: { frames: [20, 21, 22, 23], frameRate: 6, repeat: 0 },
    windup: { frames: [8, 9, 10], frameRate: 7, repeat: 0 },
    phase: { frames: [12, 13, 14, 15], frameRate: 8, repeat: 0 },
    special: { frames: [12, 13, 14, 15], frameRate: 6, repeat: -1 }
  }
});

Yt.PALE_DRAGON || (Yt.PALE_DRAGON = {
  ...Yt.DRAGON_ANCIENT,
  name: "Dragão Pálido",
  subtitle: "O Pesadelo Espectral dos Céus",
  texture: "boss-pale-dragon",
  scale: 1.35,
  bodySize: 58,
  bodyCenterY: 185,
  shadowOffY: 65,
  maxHp: 130,
  contactDamage: 4,
  speed: 68,
  xp: 1800,
  gold: { min: 280, max: 450 },
  attackCooldownMs: 1550,
  attacks: {
    BITE: { damage: 4, range: 74, width: 68, maxDist: 120, telegraphMs: 500, recoverMs: 450 },
    CLAW: { damage: 3, range: 66, width: 120, maxDist: 110, telegraphMs: 600, recoverMs: 500 },
    FIRE_BREATH: { damage: 5, length: 240, width: 88, minDist: 60, telegraphMs: 850, recoverMs: 750 },
    TAIL_SWEEP: { damage: 4, radius: 130, maxDist: 150, telegraphMs: 800, recoverMs: 650 },
    ROAR: { damage: 2, radius: 180, maxDist: 200, telegraphMs: 550, recoverMs: 480, knockback: 3 },
    FIRE_METEOR: { damage: 4, radius: 50, count: 6, spread: 160, telegraphMs: 850, staggerMs: 160, recoverMs: 650 }
  },
  phase2: {
    hpRatio: 0.55,
    speedMult: 1.35,
    cooldownMult: 0.6,
    damageMult: 1.35,
    radiusMult: 1.35,
    chargeSpeedMult: 1.25,
    tint: 0xe2e8f0
  },
  anims: {
    idle: { frames: [0, 1, 2, 3, 4, 5, 6], frameRate: 7, repeat: -1 },
    walk: { frames: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], frameRate: 11, repeat: -1 },
    attack: { frames: [19, 20, 21, 22], frameRate: 9, repeat: 0 },
    strike: { frames: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32], frameRate: 12, repeat: 0 },
    windup: { frames: [33, 34, 35, 36, 37, 38], frameRate: 9, repeat: 0 },
    fly: { frames: [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57], frameRate: 10, repeat: -1 },
    hurt: { frames: [58, 59, 60, 61], frameRate: 10, repeat: 0 },
    death: { frames: [62, 63, 64], frameRate: 5, repeat: 0 },
    phase: { frames: [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], frameRate: 12, repeat: 0 },
    special: { frames: [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], frameRate: 10, repeat: -1 }
  }
});

Yt.CERBERUS || (Yt.CERBERUS = {
  ...Yt.ABYSS_GUARDIAN,
  name: "Cérbero Infernal",
  subtitle: "O Guardião das Três Cabeças",
  texture: "boss-cerberus",
  scale: 1.6,
  bodySize: 48,
  maxHp: 105,
  contactDamage: 3,
  speed: 76,
  xp: 1400,
  gold: { min: 180, max: 300 },
  attackCooldownMs: 1250,
  attacks: {
    SLAM: { damage: 4, range: 68, width: 80, telegraphMs: 500, recoverMs: 450 },
    CHARGE: { damage: 4, speed: 460, length: 300, durationMs: 600, telegraphMs: 650, recoverMs: 550 },
    SHOCKWAVE: { damage: 3, radius: 125, telegraphMs: 750, recoverMs: 650 }
  },
  phase2: {
    hpRatio: 0.5,
    speedMult: 1.5,
    cooldownMult: 0.55,
    damageMult: 1.4,
    radiusMult: 1.35,
    chargeSpeedMult: 1.3,
    tint: 0xf87171
  },
  anims: {
    idle: { frames: [0, 1, 2, 3, 4, 5], frameRate: 7, repeat: -1 },
    walk: { frames: [12, 13, 14, 15, 16, 17, 18, 19, 20], frameRate: 11, repeat: -1 },
    attack: { frames: [21, 22, 23, 24, 25, 26], frameRate: 12, repeat: 0 },
    strike: { frames: [27, 28, 29, 30], frameRate: 12, repeat: 0 },
    windup: { frames: [31, 32, 33], frameRate: 10, repeat: 0 },
    fly: { frames: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43], frameRate: 11, repeat: -1 },
    hurt: { frames: [44, 45, 46], frameRate: 10, repeat: 0 },
    death: { frames: [47, 48, 49, 50, 51], frameRate: 7, repeat: 0 },
    phase: { frames: [34, 35, 36, 37, 38, 39, 40, 41, 42, 43], frameRate: 12, repeat: 0 },
    special: { frames: [6, 7, 8, 9, 10, 11], frameRate: 10, repeat: -1 }
  }
});
`;

s = s.replace(YT_TARGET, BOSS_DEFS + '\n' + YT_TARGET);

// 3. Atualizar função vr(c, i, b) no Modo Infinito
const VR_OLD = 'const A=["ABYSS_GUARDIAN","ANCIENT_COLOSSUS","FROST_WARDEN","DRAGON_ANCIENT","ANHANGA","RIVER_TENGU","FOX_WITCH","CASTLE_LORD"].filter(k=>Yt[k])';
const VR_NEW = 'const A=["ABYSS_GUARDIAN","ANCIENT_COLOSSUS","FROST_WARDEN","DRAGON_ANCIENT","ANHANGA","RIVER_TENGU","FOX_WITCH","CASTLE_LORD","BEHOLDER","PALE_DRAGON","CERBERUS"].filter(k=>Yt[k])';

if (!s.includes(VR_OLD)) {
  console.error('ERRO: vr target não encontrado');
  process.exit(1);
}
s = s.replace(VR_OLD, VR_NEW);

// 4. Atualizar Zi (boss rushes no Modo Infinito) para incluir os novos chefes em profundidades altas
const ZI_OLD = 'const Zi=[{minDepth:100,waves:["ABYSS_GUARDIAN","ANCIENT_COLOSSUS","DRAGON_ANCIENT"],variants:!0}';
const ZI_NEW = 'const Zi=[{minDepth:100,waves:["BEHOLDER","CERBERUS","PALE_DRAGON"],variants:!0},{minDepth:85,waves:["ABYSS_GUARDIAN","ANCIENT_COLOSSUS","DRAGON_ANCIENT"],variants:!0}';
if (s.includes(ZI_OLD)) {
  s = s.replace(ZI_OLD, ZI_NEW);
}

// 5. Atualizar Bestiário e Bosses do Endless
const BK_OLD = 'const __BK_ENDLESS_BOSS = new Set(["ABYSS_GUARDIAN", "ANCIENT_COLOSSUS", "FROST_WARDEN", "DRAGON_ANCIENT", "ANHANGA",\n  "WILD_ENT", "FOX_WITCH", "CASTLE_LORD", "RIVER_TENGU"]);';
const BK_NEW = 'const __BK_ENDLESS_BOSS = new Set(["ABYSS_GUARDIAN", "ANCIENT_COLOSSUS", "FROST_WARDEN", "DRAGON_ANCIENT", "ANHANGA",\n  "WILD_ENT", "FOX_WITCH", "CASTLE_LORD", "RIVER_TENGU", "BEHOLDER", "PALE_DRAGON", "CERBERUS"]);';

if (s.includes(BK_OLD)) {
  s = s.replace(BK_OLD, BK_NEW);
}

// 6. Atualizar a Fenda Desafio dentro do bundle caso a versão anterior já esteja inserida
const RIFT_POOL_OLD = 'const pool = [\n    "LAVA_GOLEM", "ABYSS_GUARDIAN", "ANCIENT_COLOSSUS", "FROST_WARDEN",\n    "DRAGON_ANCIENT", "ANHANGA", "WILD_ENT", "FOX_WITCH", "RIVER_TENGU"\n  ];';
const RIFT_POOL_NEW = 'const pool = [\n    "BEHOLDER", "PALE_DRAGON", "CERBERUS",\n    "LAVA_GOLEM", "ABYSS_GUARDIAN", "ANCIENT_COLOSSUS", "FROST_WARDEN",\n    "DRAGON_ANCIENT", "ANHANGA", "WILD_ENT", "FOX_WITCH", "RIVER_TENGU"\n  ];';
if (s.includes(RIFT_POOL_OLD)) {
  s = s.replace(RIFT_POOL_OLD, RIFT_POOL_NEW);
}

// Salva bundle principal e espelha em Projeto atualizado
fs.writeFileSync(BUNDLE, s, 'utf8');
if (fs.existsSync(path.dirname(MIRROR))) {
  fs.writeFileSync(MIRROR, s, 'utf8');
}

console.log('OK — Chefes Beholder, Dragão Pálido e Cérbero adicionados com sucesso ao jogo!');
