/* ══ Golpes e habilidades animados (p216.34–35) ════════════════════════════════════════════════════════════════
   • Golpe básico fluido: 8 quadros ao longo do golpe em vez de 5 poses paradas.
   • Uma animação por habilidade, por herói refeito (Guerreiro, Arqueiro, Maga, Necromante, Druida, Araí).
     Quadros na folha extra "sk" do pacote: Guerreiro uma por camada (warrior-pack-t<n>-sk.png); os outros uma só
     (<pacote>-pack-sk.png, "sk.f" no json). 8 colunas, uma linha por animação.
   • Efeitos em pixel art (PixelLab /vfx) por cima dos efeitos de código: na frente, nos pés, no ponto do feitiço
     (aoe-point/telegraph) ou onde o projétil termina (assets/pixel-art/fx-herois/, scripts/build_fx_herois.py).
   Skins/armaduras sem a folha extra seguem com as poses de antes.                                                  */
const __FXH = {"a-charge":{"w":67,"h":67,"n":8,"fps":12,"ax":33,"ay":33},"a-explode":{"w":46,"h":41,"n":8,"fps":12,"ax":23,"ay":24},"a-hit":{"w":64,"h":35,"n":6,"fps":14,"ax":33,"ay":17},"a-rain":{"w":148,"h":104,"n":8,"fps":24,"ax":53,"ay":65},"a-wind":{"w":115,"h":94,"n":8,"fps":14,"ax":60,"ay":48},"d-feather":{"w":73,"h":89,"n":8,"fps":12,"ax":34,"ay":82},"d-howl":{"w":103,"h":92,"n":8,"fps":12,"ax":58,"ay":46},"d-roots":{"w":103,"h":65,"n":18,"fps":12,"ax":51,"ay":47},"d-shift":{"w":64,"h":68,"n":8,"fps":16,"ax":35,"ay":33},"h-bolt":{"w":40,"h":27,"n":6,"fps":14,"ax":20,"ay":11},"h-campfire":{"w":38,"h":43,"n":8,"fps":12,"ax":19,"ay":35},"h-howl":{"w":112,"h":80,"n":8,"fps":12,"ax":56,"ay":48},"h-trap":{"w":56,"h":29,"n":8,"fps":12,"ax":28,"ay":15},"h-whistle":{"w":61,"h":74,"n":8,"fps":12,"ax":0,"ay":34},"k-kiai":{"w":96,"h":96,"n":8,"fps":12,"ax":48,"ay":48},"k-parry":{"w":74,"h":69,"n":6,"fps":8,"ax":43,"ay":27},"k-wind":{"w":124,"h":19,"n":6,"fps":12,"ax":50,"ay":9},"m-arcane":{"w":82,"h":80,"n":8,"fps":12,"ax":42,"ay":38},"m-fire":{"w":76,"h":76,"n":8,"fps":9,"ax":38,"ay":38},"m-ice":{"w":95,"h":61,"n":8,"fps":12,"ax":48,"ay":44},"m-nova":{"w":82,"h":48,"n":8,"fps":12,"ax":41,"ay":24},"n-armor":{"w":96,"h":96,"n":8,"fps":10,"ax":48,"ay":56},"n-bone":{"w":62,"h":65,"n":6,"fps":12,"ax":26,"ay":9},"n-curse":{"w":116,"h":62,"n":8,"fps":7,"ax":58,"ay":37},"n-reap":{"w":84,"h":84,"n":6,"fps":12,"ax":32,"ay":52},"n-summon":{"w":84,"h":109,"n":8,"fps":12,"ax":42,"ay":86},"r-blink":{"w":43,"h":48,"n":8,"fps":12,"ax":21,"ay":23},"r-hit":{"w":40,"h":24,"n":6,"fps":12,"ax":20,"ay":12},"r-mark":{"w":48,"h":48,"n":8,"fps":12,"ax":24,"ay":24},"r-poison":{"w":71,"h":42,"n":8,"fps":10,"ax":34,"ay":25},"r-slash":{"w":60,"h":63,"n":6,"fps":8,"ax":29,"ay":26},"r-smoke":{"w":96,"h":64,"n":8,"fps":10,"ax":48,"ay":40},"r-stab":{"w":65,"h":49,"n":6,"fps":12,"ax":27,"ay":25},"s-claw":{"w":64,"h":42,"n":6,"fps":12,"ax":33,"ay":23},"s-dance":{"w":96,"h":96,"n":8,"fps":12,"ax":48,"ay":48},"s-hawk":{"w":96,"h":96,"n":8,"fps":12,"ax":48,"ay":48},"s-poison":{"w":29,"h":33,"n":6,"fps":12,"ax":13,"ay":17},"s-roots":{"w":138,"h":102,"n":8,"fps":12,"ax":66,"ay":81},"w-bash":{"w":64,"h":64,"n":6,"fps":14,"ax":32,"ay":32},"w-cry":{"w":80,"h":101,"n":8,"fps":12,"ax":40,"ay":83},"w-exec":{"w":58,"h":67,"n":6,"fps":8,"ax":29,"ay":26},"w-heavy":{"w":92,"h":138,"n":8,"fps":9,"ax":7,"ay":77},"w-iai":{"w":120,"h":48,"n":6,"fps":16,"ax":60,"ay":24},"w-quake":{"w":116,"h":55,"n":8,"fps":8,"ax":58,"ay":27},"w-slash":{"w":59,"h":60,"n":6,"fps":12,"ax":27,"ay":28},"w-spin":{"w":96,"h":80,"n":8,"fps":12,"ax":48,"ay":40}};
const __SKH_CLS = { WARRIOR: ["warrior", 1], ARCHER: ["archer"], MAGE: ["mage"], NECROMANCER: ["necromancer"], DRUID: ["druid"], SHAMAN: ["shaman"], ROGUE: ["rogue"], BERSERKER: ["berserker"], HUNTER: ["hunter"] };
/* habilidade → linha da folha (por classe); sem linha própria: por tipo; senão "cast" */
const __SKH_MAP = {
  WARRIOR: { HEAVY_STRIKE: "slam", DEMOLISHING_BLOW: "slam", KAISHAKU: "slam", HOLY_SMITE: "slam", SHIELD_BASH: "bash",
    IAIJUTSU: "draw", ET_TSUBAME: "draw", KAZE_GIRI: "draw", WHIRLWIND: "spin", TSUMUJI: "spin", RUPTURE: "quake", ET_QUAKE: "quake",
    _t: { "melee-heavy": "slam", "aoe-self": "spin", buff: "cry", execute: "slam", "shadow-strike": "draw" }, _d: "cry" },
  ARCHER: { MULTI_SHOT: "multi", ET_DART_HAIL: "multi", EXPLOSIVE_ARROW: "charge", ET_CHARGED: "charge", PIERCING_ARROW: "charge", AIMED_SHOT: "charge",
    ARROW_RAIN: "cast", VOLLEY: "cast", REPULSE: "repulse", ET_FENCE: "fence", _t: { "multi-projectile": "multi", projectile: "charge", "telegraph-aoe": "cast" } },
  MAGE: { FIREBALL: "bolt", ET_ICE_COMET: "bolt", ARCANE_BLAST: "cast", METEOR: "cast", ET_SUN_MIRROR: "cast", ELEMENTAL_NOVA: "nova", REPULSE: "nova",
    ET_ICE_PRISON: "ice", TEMPORAL_VEIL: "ice", _t: { projectile: "bolt", "aoe-self": "nova" } },
  NECROMANCER: { SUMMON_SKELETON: "summon", SKELETON_ARMY: "summon", BONE_SPEAR: "atk", CURSE_NOVA: "cast", ET_PLAGUE: "cast", REPULSE: "cast",
    ET_REAP: "reap", ET_BONE_ARMOR: "armor", _t: { summon: "summon", "multi-summon": "summon", projectile: "atk" } },
  DRUID: { EAGLE_COMPANION: "call", ET_BEAR: "call", ET_OAK_RING: "roots", ET_MISTLETOE: "roots", ET_TRAMPLE: "roots", ET_BLOOD_HOWL: "howl",
    ENTANGLING_ROOTS: "roots", THORN_VOLLEY: "atk", NATURES_WRATH: "cast", _t: { eagle: "call" } },
  HUNTER: { AIMED_SHOT: "aim", ET_DOUBLE_SHOT: "double", SNARE_TRAP: "trap", ET_CAMPFIRE: "trap", WOLF_COMPANION: "whistle", WILD_PACK: "whistle",
    ET_COORD: "whistle", ET_PROTECT_HOWL: "whistle", VOLLEY: "cast", _t: { projectile: "aim", "multi-projectile": "double", summon: "whistle", "multi-summon": "whistle", "telegraph-aoe": "cast", "aoe-status": "trap" } },
  BERSERKER: { IAIJUTSU: "draw", ET_TSUBAME: "draw", KAZE_GIRI: "draw", TSUMUJI: "spin", WHIRLWIND: "spin", ET_QUAKE: "slam", KAISHAKU: "slam",
    ET_PARRY: "parry", MIKIRI: "parry", ET_IRON_WALL: "parry", KIAI: "kiai", _t: { buff: "kiai", "melee-heavy": "draw", "aoe-self": "spin", execute: "slam" } },
  ROGUE: { FAN_OF_BLADES: "fan", BACKSTAB: "stab", SMOKE_BOMB: "smoke", ET_TOXIC_SMOKE: "smoke", ET_BLADE_DANCE: "blades", ET_DEATH_MARK: "mark",
    DEADLY_MARK: "mark", ET_DECOY: "smoke", _t: { "multi-projectile": "fan", backstab: "stab", smoke: "smoke", mark: "mark", "aoe-self": "blades" } },
  SHAMAN: { RAIZES_JUREMA: "roots", ET_JUREMA_CIRCLE: "roots", ET_BARK: "roots", DARDOS_CURARE: "darts", ET_DART_HAIL: "darts",
    ET_WAR_DANCE: "dance", ET_JAGUAR: "claw", ESPIRITO_GAVIAO: "cast", _t: { "multi-projectile": "darts", eagle: "cast" } },
};
/* efeito: [nome, onde, atraso s, escala, dx, dy] — onde: f = na frente, p = nos pés, c = no corpo, a = no ponto do
   feitiço (atraso = do tipo telegraph usa telegraphMs), j = onde o projétil da habilidade termina */
const __SKH_FX = {
  WARRIOR: { _atk: ["w-slash", "f", 0, .55, 18, -20],
    HEAVY_STRIKE: ["w-heavy", "f", .24, .45, 2, -24], DEMOLISHING_BLOW: ["w-heavy", "f", .24, .5, 2, -24],
    KAISHAKU: ["w-exec", "f", .24, .6, 18, -22], SHIELD_BASH: ["w-bash", "f", .16, .6, 20, -22],
    IAIJUTSU: ["w-iai", "f", .2, .6, 30, -18], ET_TSUBAME: ["w-iai", "f", .2, .6, 30, -18], KAZE_GIRI: ["w-iai", "f", .2, .6, 30, -18],
    WHIRLWIND: ["w-spin", "c", .06, .65, 0, -10], TSUMUJI: ["w-spin", "c", .06, .65, 0, -10],
    RUPTURE: ["w-quake", "p", .3, .7, 14, 0], ET_QUAKE: ["w-quake", "p", .3, .75, 14, 0], _buff: ["w-cry", "p", .04, .55, 0, 0] },
  ARCHER: { EXPLOSIVE_ARROW: ["a-explode", "j", 0, .9, 0, 0], ET_CHARGED: ["a-charge", "f", 0, .45, 16, -22], AIMED_SHOT: ["a-charge", "f", 0, .45, 16, -22],
    ARROW_RAIN: ["a-rain", "a", -1, .7, 0, 0], VOLLEY: ["a-rain", "a", -1, .7, 0, 0], REPULSE: ["a-wind", "p", .2, .6, 0, 0],
    MULTI_SHOT: ["a-hit", "j", 0, .6, 0, 0], _proj: ["a-hit", "j", 0, .6, 0, 0] },
  MAGE: { FIREBALL: ["m-fire", "j", 0, .7, 0, 0], ET_ICE_COMET: ["m-ice", "j", 0, .6, 0, 0], ARCANE_BLAST: ["m-arcane", "a", .05, .6, 0, 0],
    METEOR: ["m-fire", "a", -1, 1.1, 0, 0], ELEMENTAL_NOVA: ["m-nova", "p", .3, .8, 0, 0], REPULSE: ["m-nova", "p", .25, .6, 0, 0],
    ET_ICE_PRISON: ["m-ice", "a", .3, .8, 0, 0], ET_SUN_MIRROR: ["m-arcane", "c", .25, .5, 0, -14] },
  NECROMANCER: { BONE_SPEAR: ["n-bone", "j", 0, .7, 0, 0], CURSE_NOVA: ["n-curse", "a", .05, .7, 0, 0], ET_PLAGUE: ["n-curse", "a", .05, .7, 0, 0],
    SUMMON_SKELETON: ["n-summon", "f", .15, .55, 26, 6], SKELETON_ARMY: ["n-summon", "f", .15, .6, 26, 6], REPULSE: ["n-curse", "p", .25, .6, 0, 0],
    ET_REAP: ["n-reap", "f", .2, .7, 18, -20], ET_BONE_ARMOR: ["n-armor", "c", .1, .7, 0, -14] },
  DRUID: { JAVALI_FORM: ["d-shift", "c", 0, .7, 0, -14], LOBISOMEM_FORM: ["d-shift", "c", 0, .7, 0, -14], EAGLE_COMPANION: ["d-feather", "c", .25, .6, 0, -18],
    ET_BEAR: ["d-feather", "c", .25, .6, 0, -18], ET_OAK_RING: ["d-roots", "p", .25, .7, 0, 0], ET_MISTLETOE: ["d-roots", "p", .25, .6, 0, 0],
    ET_TRAMPLE: ["d-roots", "p", .1, .6, 0, 0], ET_BLOOD_HOWL: ["d-howl", "c", .2, .6, 0, -14], ENTANGLING_ROOTS: ["d-roots", "a", .05, .7, 0, 0] },
  HUNTER: { _proj: ["h-bolt", "j", 0, .6, 0, 0], AIMED_SHOT: ["a-charge", "f", .3, .45, 18, -22], SNARE_TRAP: ["h-trap", "a", .35, .6, 0, 0],
    ET_CAMPFIRE: ["h-campfire", "f", .4, .6, 22, 2], WOLF_COMPANION: ["h-whistle", "c", .15, .6, 0, -26], WILD_PACK: ["h-whistle", "c", .15, .6, 0, -26],
    ET_COORD: ["h-whistle", "c", .15, .6, 0, -26], ET_PROTECT_HOWL: ["h-howl", "p", .1, .7, 0, 0], VOLLEY: ["a-rain", "a", -1, .7, 0, 0] },
  BERSERKER: { _atk: ["w-slash", "f", 0, .55, 18, -20], IAIJUTSU: ["w-iai", "f", .2, .6, 30, -18], ET_TSUBAME: ["w-iai", "f", .2, .6, 30, -18],
    KAZE_GIRI: ["k-wind", "f", .1, .7, 30, -18], TSUMUJI: ["w-spin", "c", .06, .65, 0, -10], ET_QUAKE: ["w-quake", "p", .3, .75, 14, 0],
    KAISHAKU: ["w-exec", "f", .24, .6, 18, -22], ET_PARRY: ["k-parry", "f", .1, .6, 14, -24], MIKIRI: ["k-parry", "f", .1, .6, 14, -24],
    ET_IRON_WALL: ["k-parry", "c", .1, .7, 0, -18], KIAI: ["k-parry", "c", .1, .75, 0, -18], _buff: ["k-kiai", "c", .15, .6, 0, -16] },
  ROGUE: { _atk: ["r-slash", "f", 0, .55, 16, -22], FAN_OF_BLADES: ["r-hit", "j", 0, .6, 0, 0], BACKSTAB: ["r-stab", "f", .2, .6, 18, -22],
    SMOKE_BOMB: ["r-smoke", "p", .25, .8, 0, 0], ET_TOXIC_SMOKE: ["r-poison", "p", .25, .8, 0, 0], ET_DECOY: ["r-blink", "c", .1, .7, 0, -16],
    SHADOW_STEP: ["r-blink", "c", 0, .7, 0, -16], SHADOW_BLINK: ["r-blink", "c", 0, .7, 0, -16], ET_ROLL: ["r-blink", "p", 0, .5, 0, 0],
    ET_BLADE_DANCE: ["r-slash", "c", .1, .8, 0, -18], ET_DEATH_MARK: ["r-mark", "a", .2, .6, 0, -30] },
  SHAMAN: { RAIZES_JUREMA: ["s-roots", "a", .05, .6, 0, 0], ET_JUREMA_CIRCLE: ["s-roots", "p", .2, .6, 0, 0], ET_BARK: ["s-roots", "p", .15, .45, 0, 0],
    DARDOS_CURARE: ["s-poison", "j", 0, .7, 0, 0], ET_DART_HAIL: ["s-poison", "j", 0, .7, 0, 0], ET_WAR_DANCE: ["s-dance", "p", .1, .6, 0, 0],
    ET_JAGUAR: ["s-claw", "f", .2, .6, 22, -20], ESPIRITO_GAVIAO: ["s-hawk", "c", .2, .7, 0, -18] },
};
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  for (const [n, m] of Object.entries(__FXH)) this.textures.exists("fxh-" + n) || L.spritesheet("fxh-" + n, `assets/pixel-art/fx-herois/${n}.png`, { frameWidth: m.w, frameHeight: m.h });
  for (const [c, per] of Object.values(__SKH_CLS)) for (let t = 0; t <= 4; t++) { const k = `mk4b-${c}-t${t}-sk`;
    this.textures.exists(k) || L.spritesheet(k, `assets/pixel-art/characters/${per ? `${c}-pack-t${t}-sk.png` : `${c}-pack-sk.png`}`, { frameWidth: 128, frameHeight: 128 }) }
  L.setPath(op) } catch (e) {} return r }}
function __skhAt(S, name, x, y, sc, flip, depth, origin) {
  const m = __FXH[name], k = "fxh-" + name; if (!m || !S.textures.exists(k)) return;
  S.anims.exists(k) || S.anims.create({ key: k, frames: S.anims.generateFrameNumbers(k, { start: 0, end: m.n - 1 }), frameRate: m.fps, repeat: 0 });
  const s = S.add.sprite(x, y, k, 0).setScale(sc).setFlipX(!!flip).setDepth(depth);
  origin ? s.setOrigin(...origin) : s.setOrigin(flip ? 1 - m.ax / m.w : m.ax / m.w, m.ay / m.h);
  if (name === "w-cry") s.setAlpha(.8);
  s.play(k); s.once("animationcomplete", () => s.destroy());
}
function __skhFx(V, F, at) {
  const [name, where, , sc, dx, dy] = F, S = V.scene, C = V.container, L = V.mk2Layout || {}, sg = Math.sign(C.scaleX) || 1;
  const feet = C.y + (V.mk2?.y || 0) + ((L.footY ?? 118) - 64) * (V.mk2?.scaleY || .5), dep = C.depth ?? C.y, m = __FXH[name]; if (!m) return;
  if (where === "a" && at) return __skhAt(S, name, at.x, at.y, sc, !1, at.y + 2, [m.ax / m.w, m.ay / m.h]);
  if (where === "p") return __skhAt(S, name, C.x + sg * dx, feet + dy, sc, !1, dep - 1, [m.ax / m.w, m.ay / m.h]);
  if (where === "c") return __skhAt(S, name, C.x + sg * dx, feet + dy, sc, sg < 0, dep + 3, [m.ax / m.w, m.ay / m.h]);
  return __skhAt(S, name, C.x + sg * dx, feet + dy, sc, sg < 0, dep + 3);
}
function __skhKey(V) { return V.animPrefix + "-sk" }
/* golpe básico */
{const A0 = Qe.prototype.playAttack; Qe.prototype.playAttack = function () {
  const a = A0.apply(this, arguments);
  try { const L = this.mk2Layout; if (L?.sk && this.scene.textures.exists(__skhKey(this))) {
    this.__atkE = 0; this.__atkD = Math.max(.12, ((a?.windupMs ?? 120) + (a?.hitMs ?? 80) + (a?.recoveryMs ?? 130)) / 1e3);
    const F = __SKH_FX[this.scene.classDef?.id]?._atk;
    if (F) { const V = this; this.scene.time.delayedCall((a?.windupMs ?? 120) * .9, () => { try { __skhFx(V, F) } catch (e) {} }) }
  } } catch (e) {}
  return a }}
/* golpe básico de quem ataca com magia (Maga, Necromante, Druida…): o jogo chama playCast; toca a linha "atk" */
{const C0 = Qe.prototype.playCast; Qe.prototype.playCast = function (col, t = 280) {
  const r = C0.apply(this, arguments);
  try { const L = this.mk2Layout; if (L?.sk && this.scene.textures.exists(__skhKey(this))) { this.__atkE = 0; this.__atkD = Math.max(.12, t / 1e3) } } catch (e) {}
  return r }}
/* habilidades */
{const T0 = Yh.prototype.tryUse; Yh.prototype.tryUse = function (i) {
  const S = this.scene, d0 = this.slots[i]?.def, FX = __SKH_FX[S.classDef?.id] || {};
  const Fj = d0 && (FX[d0.id] || FX._proj);
  const prevQ = S.__skhProj;
  S.__skhProj = Fj && Fj[1] === "j" ? { F: Fj, t: S.time.now + 1200 } : null;              // efeito onde o projétil terminar (a magia pode sair depois)
  let r; try { r = T0.apply(this, arguments) } finally { if (!r) S.__skhProj = prevQ }
  try { if (r) { const d = d0, V = S.playerVisual, L = V?.mk2Layout, M = __SKH_MAP[S.classDef?.id] || {};
    if (d && V && L?.sk && S.textures.exists(__skhKey(V))) {
      let key = M[d.id] || M._t?.[d.type] || M._d || "cast";
      if (L.sk.rows[key] == null) key = "cast";
      if (L.sk.rows[key] != null && d.type !== "shapeshift" && d.type !== "dash" && d.type !== "blink") V.__skA = { row: L.sk.rows[key], e: 0, d: key === "atk" ? .4 : .56 };
    }
    const F = d && (FX[d.id] || (d.type === "buff" ? FX._buff : null));
    if (V && F && F[1] !== "j") {
      let at = null;
      if (F[1] === "a") { const P = S.player, fd = this.facingDir(), cd = d.castDist ?? 120; at = { x: P.x + fd.x * cd, y: P.y + fd.y * cd } }
      const delay = F[2] < 0 ? (d.telegraphMs ?? 600) / 1e3 : F[2];
      S.time.delayedCall(delay * 1000, () => { try { __skhFx(V, F, at) } catch (e) {} });
    } } } catch (e) {}
  return r }}
/* projéteis de habilidade: efeito onde terminam (acertou ou chegou no alcance) */
{const C0 = Sd.prototype.create; Sd.prototype.create = function () { const r = C0.apply(this, arguments); try {
  const S = this, PJ = S.projectiles; if (PJ?.spawn && !PJ.__skh) { PJ.__skh = 1; const sp0 = PJ.spawn;
    PJ.spawn = function (cfg) { const Q = S.__skhProj, F = Q && !cfg?.hostile && S.time.now < Q.t ? Q.F : null; const p = sp0.apply(this, arguments);
      try { const o = p?.img || p; if (F && o?.once) o.once("destroy", () => { try { __skhAt(S, F[0], o.x, o.y, F[3], !1, o.y + 4, null) } catch (e) {} }) } catch (e) {}
      return p } }
} catch (e) {} return r }}
{const U0 = Qe.prototype.update; Qe.prototype.update = function (i) {
  const m = this.mk2, L = this.mk2Layout, sk = L?.sk ? __skhKey(this) : null;
  if (!m || !sk) return U0.apply(this, arguments);
  if (m.texture?.key === sk) m.setTexture(this.animPrefix, (L.map?.idle || [0])[0]);   // devolve a folha normal antes da lógica de sempre
  const r = U0.apply(this, arguments);
  try {
    const has = this.scene.textures.exists(sk), dt = i || 0;
    let row = null, k = 0;
    if (this.__skA) { const A = this.__skA; A.e += dt; if (A.e >= A.d || this.deadPose) this.__skA = null; else { row = A.row; k = Math.min(7, Math.floor(A.e / A.d * 8)) } }
    if (row == null && (this.attackState === "attack" || this.castTimer > 0) && this.__atkD && this.__atkE < this.__atkD) { this.__atkE += dt; row = L.sk.rows.atk; k = Math.min(7, Math.floor(this.__atkE / this.__atkD * 8)) }
    this.__skBusy = row != null;
    if (row != null && has && !this.deadPose) { m.anims.stop(); m.setTexture(sk, row * (L.sk.cols || 8) + k) }
  } catch (e) {}
  return r }}
