/* ══ Conjunto lendário "Caçador de Dragão" (Guerreiro) ═══════════════════════════════════════════════
   (injetado no bundle por scripts/patch_dragon_hunter.py; arte gerada por scripts/build_dragon_hunter_art.py)
   · Exclusivo: o Dragão Ancião da Fortaleza dos Dragões (campanha) solta as 5 peças lendárias de uma vez
     quando o Guerreiro o derrota — elmo, couraça, botas, escudo e espada. Não aparecem em loja nem em baú.
   · Bônus: 2 peças +3 de dano · 3 peças +3 de defesa e +4 de vida · 5 peças SOPRO DO DRAGÃO.
   · Sopro do Dragão (só com o conjunto completo): ao apertar o botão do escudo (BLOQUEIO / "ESCUDO" no
     toque), o herói solta um sopro de fogo em cone à frente que empurra os inimigos para longe e causa dano
     leve. Recarga de 7 s; segurar o botão continua bloqueando normalmente.
   · Visual: com o conjunto completo o Guerreiro veste a armadura de escamas (folha warrior-dh-body.png). */
const __DH_SET = "DRAGON_HUNTER", __DH_SHEET = "mk4b-warrior-dh", __DH_CD = 7000, __DH_R = 132, __DH_HALF = .62, __DH_FORCE = 380;
const __DH_PIECES = {
  dh_helm: { name: "Elmo do Caçador de Dragão", type: "armor", slot: "helmet", stats: { defense: 2, maxHp: 1 }, value: 120,
    desc: "A crista foi forjada com escamas do próprio Ancião." },
  dh_plate: { name: "Couraça do Caçador de Dragão", type: "armor", slot: "armor", stats: { defense: 3, maxHp: 2 }, value: 160,
    desc: "Escamas carmesim sobre obsidiana. Ainda guarda o calor do dragão." },
  dh_boots: { name: "Botas do Caçador de Dragão", type: "armor", slot: "boots", stats: { defense: 1, speed: 5 }, value: 110,
    desc: "Pisaram as cinzas da Fortaleza e não queimaram." },
  dh_shield: { name: "Escudo do Caçador de Dragão", type: "shield", slot: "offhand", stats: { defense: 3, blockChance: 10, blockCounter: 3 }, value: 150,
    desc: "Com o conjunto completo, erguê-lo liberta o sopro do dragão." },
  dh_sword: { name: "Espada do Caçador de Dragão", type: "weapon", slot: "weapon", weaponCategory: "WARRIOR", visualKey: "sword",
    stats: { damage: 4, critChance: 2 }, attackSpeed: 1, value: 180, desc: "A lâmina brilha em brasa quando há um dragão por perto." },
};
const __DH_NAMES = {
  dh_helm: ["Dragon Hunter Helm", "Yelmo del Cazador de Dragones"], dh_plate: ["Dragon Hunter Cuirass", "Coraza del Cazador de Dragones"],
  dh_boots: ["Dragon Hunter Boots", "Botas del Cazador de Dragones"], dh_shield: ["Dragon Hunter Shield", "Escudo del Cazador de Dragones"],
  dh_sword: ["Dragon Hunter Sword", "Espada del Cazador de Dragones"],
};

function __dhInit() {
  if (__dhInit.done) return; __dhInit.done = !0;
  for (const [id, d] of Object.entries(__DH_PIECES))
    Xt[id] = { ...d, icon: `dh-icon-${id}`, classRequirement: "WARRIOR", minRarity: "LEGENDARY", setId: __DH_SET, bossOnly: !0,
      ...(id === "dh_plate" ? { tint: 0x8a2424 } : {}) };
  ps[__DH_SET] = { name: "Caçador de Dragão", pieces: Object.keys(__DH_PIECES), bonuses: {
    2: { label: "+3 dano", stats: { damage: 3 } },
    3: { label: "+3 defesa · +4 vida", stats: { defense: 3, maxHp: 4 } },
    5: { label: "SOPRO DO DRAGÃO: botão do escudo empurra os inimigos", stats: { knockbackBonus: .25 } } } };
  try { __SET_AURA[__DH_SET] = 0xff6a2a } catch (e) {}
  try {
    for (const [id, [en, es]] of Object.entries(__DH_NAMES)) { _s[`item.${id}`] = en; Io[`item.${id}`] = es }
    _s[`setl.${__DH_SET}`] = "Dragon Hunter"; Io[`setl.${__DH_SET}`] = "Cazador de Dragones";
  } catch (e) {}
}
__dhInit();

const __dhCount = eq => { let n = 0; for (const o of Object.values(eq ?? {})) o?.setId === __DH_SET && n++; return n };

/* arte: folha do herói e ícones, carregados no Preload */
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__DH_SHEET) || L.spritesheet(__DH_SHEET, "assets/pixel-art/characters/warrior-dh-body.png", { frameWidth: 128, frameHeight: 128 });
  for (const id of Object.keys(__DH_PIECES)) this.textures.exists(`dh-icon-${id}`) || L.image(`dh-icon-${id}`, `assets/pixel-art/items-hd/dh/${id}.png`);
  L.setPath(op) } catch (e) {} return r }}

function __dhSheet(sc) {
  if (!sc.textures.exists(__DH_SHEET)) return null;
  const tx = sc.textures.get(__DH_SHEET);
  try { tx.setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const map = sc.cache.json.get("mk4b-warrior-layout")?.map;
  if (map) for (const [a, fr, r] of [["idle", 4, -1], ["idlevar", 3, 0], ["walk", 11, -1], ["run", 15, -1]]) {
    const k = `${__DH_SHEET}-${a}`, base = sc.anims.get(`mk4b-warrior-t0-${a}`);
    if (!map[a] || sc.anims.exists(k)) continue;
    sc.anims.create({ key: k, frames: map[a].map(f => ({ key: __DH_SHEET, frame: f })), frameRate: base?.frameRate ?? fr, repeat: base?.repeat ?? r });
  }
  return __DH_SHEET;
}

/* visual: com as 5 peças, o Guerreiro veste a armadura de escamas (vale na campanha, no Refúgio e no infinito) */
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try { if (skin && classId === "WARRIOR" && __dhCount(eq) >= 5) { const k = __dhSheet(scene); if (k) return { ...skin, sheet: k } } } catch (e) {}
  return SK0.apply(this, arguments) }}

/* drop exclusivo: o Dragão Ancião da Fortaleza (campanha) libera o conjunto completo para o Guerreiro */
function __dhDrop(L, b) {
  const S = L.scene;
  if (b?.typeKey !== "DRAGON_ANCIENT" || S.isRift || S.endlessRun?.() || S.classDef?.id !== "WARRIOR") return;
  const ids = Object.keys(__DH_PIECES);
  S.time.delayedCall(700, () => {
    if (!S.scene.isActive()) return;
    S.effects?.shockwaveRing?.(b.x, b.y, 120); S.effects?.burstTinted?.(b.x, b.y, 0xff6a2a, 36);
    S.game.events.emit("ui:banner", __L3("CONJUNTO LENDÁRIO: CAÇADOR DE DRAGÃO", "LEGENDARY SET: DRAGON HUNTER", "CONJUNTO LEGENDARIO: CAZADOR DE DRAGONES"));
  });
  ids.forEach((id, k) => {
    const a = -Math.PI / 2 + k * (Math.PI * 2 / ids.length);
    S.time.delayedCall(1000 + k * 280, () => {
      if (!S.scene.isActive()) return;
      L.spawnItem(b.x + Math.cos(a) * 58, b.y + 12 + Math.sin(a) * 42, L.makeItem(id, "LEGENDARY"));
    });
  });
}
{const D0 = Bh.prototype.dropFromBoss; Bh.prototype.dropFromBoss = function (i) { const r = D0.apply(this, arguments); try { __dhDrop(this, i) } catch (e) {} return r }}

/* Sopro do Dragão */
function __dhBreath(S) {
  const p = S.player; let fx = p.facing?.x ?? 1, fy = p.facing?.y ?? 0; const n = Math.hypot(fx, fy) || 1; fx /= n; fy /= n;
  const ang = Math.atan2(fy, fx), ox = p.x + fx * 12, oy = p.y - 6 + fy * 12, dep = (p.depth ?? 10) + 2;
  S.audioRef?.play("sfx-dragon-fire-breath"); S.cameraSys?.shake?.(.005, 170);
  S.effects?.floatText?.(p.x, p.y - 34, __L3("SOPRO DO DRAGÃO!", "DRAGON BREATH!", "¡ALIENTO DEL DRAGÓN!"), "#ffb050", 11);
  const cols = [0xff4a18, 0xff8a2a, 0xffc850, 0xff6a20];
  for (let i = 0; i < 38; i++) {
    const a = ang + (Math.random() * 2 - 1) * __DH_HALF * .85, d = __DH_R * (.4 + Math.random() * .65);
    const img = S.add.image(ox, oy, "light").setBlendMode(j.BlendModes.ADD).setTint(cols[i % 4]).setScale(.04).setAlpha(.95).setDepth(dep);
    S.tweens.add({ targets: img, x: ox + Math.cos(a) * d, y: oy + Math.sin(a) * d, scale: .18 + Math.random() * .12, alpha: 0,
      delay: i * 11, duration: 360 + Math.random() * 200, ease: "Quad.easeOut", onComplete: () => img.destroy() });
  }
  S.effects?.burstTinted?.(ox, oy, 0xff7a30, 14);
  const dmg = Math.max(2, Math.round((S.stats?.total?.damage ?? 4) * .8));
  for (const e of S.combat?.getTargets?.() ?? []) {
    if (!e || e.dead || !e.active) continue;
    const dx = e.x - p.x, dy = e.y - p.y, dist = Math.hypot(dx, dy) || 1, rad = (e.body?.width ?? 16) / 2;
    if (dist - rad > __DH_R) continue;
    let da = Math.atan2(dy, dx) - ang; da = Math.atan2(Math.sin(da), Math.cos(da));
    if (Math.abs(da) > __DH_HALF && dist > 30) continue;                 // quem está colado no herói também é atingido
    const ux = dx / dist, uy = dy / dist, res = e === S.boss ? .75 : (e.knockbackResist ?? 0), f = __DH_FORCE * (1 - res);
    S.damageSystem?.apply({ source: p, target: e, amount: dmg, dir: { x: ux, y: uy }, knockbackMult: 2 });
    if (e.dead) continue;
    e.knock ? (e.knock.x += ux * f, e.knock.y += uy * f) : e.body && (e.body.velocity.x += ux * f, e.body.velocity.y += uy * f);
    S.effects?.burstTinted?.(e.x, e.y, 0xff8a30, 6);
  }
}
function __dhTick(S) {
  const p = S.player; if (!p || p.dead || !p.active) return;
  const full = S.classDef?.id === "WARRIOR" && (S.stats?.activeSets?.[__DH_SET] ?? 0) >= 5;
  const held = !!S.guardHeld, edge = held && !S.__dhHeld; S.__dhHeld = held;
  const now = S.time.now, left = (S.__dhReady ?? 0) - now;
  // anel de recarga sobre o herói
  if (full && left > 0) {
    S.__dhRing ??= S.add.graphics().setDepth((p.depth ?? 10) + 3);
    const g = S.__dhRing.clear().setVisible(!0), k = 1 - left / __DH_CD;
    g.lineStyle(2, 0x2a1210, .7).strokeCircle(p.x, p.y - 40, 6);
    g.lineStyle(2, 0xff8a30, .95).beginPath(); g.arc(p.x, p.y - 40, 6, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); g.strokePath();
  } else if (S.__dhRing?.visible) {
    S.__dhRing.setVisible(!1);
    full && S.__dhReady && (S.effects?.burstTinted?.(p.x, p.y - 36, 0xffa040, 8), S.__dhReady = 0);
  }
  if (!full || !edge || left > 0) return;
  S.__dhReady = now + __DH_CD;
  __dhBreath(S);
}
{const C0 = Sd.prototype.create; Sd.prototype.create = function () { const r = C0.apply(this, arguments); try {
  const S = this; S.__dhHeld = !1; S.__dhReady = 0; S.__dhRing = null;
  const fn = () => { try { __dhTick(S) } catch (e) {} };
  S.events.on("postupdate", fn); S.events.once("shutdown", () => { S.events.off("postupdate", fn); S.__dhRing = null });
} catch (e) {} return r }}
window.__dh = { pieces: __DH_PIECES, breath: S => __dhBreath(S), give: S => { const L = S.lootSystem, p = S.player;
  Object.keys(__DH_PIECES).forEach((id, k) => L.spawnItem(p.x - 60 + k * 30, p.y + 40, L.makeItem(id, "LEGENDARY"))) } };
