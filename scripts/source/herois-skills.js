/* ══ Golpes e habilidades animados (p216.34) ═══════════════════════════════════════════════════════════════════
   • Golpe básico fluido: em vez de 5 poses paradas, o golpe toca 8 quadros ao longo do tempo do golpe.
   • Uma animação por habilidade (pancada por cima, escudada, saque rápido, giro, golpe no chão, grito de guerra).
     Quadros na folha extra "<pacote>-t<n>-sk.png" (8 colunas, uma linha por animação; "sk" no json do pacote).
   • Efeitos em pixel art (PixelLab /vfx) por cima dos efeitos de código: corte, impacto pesado, onda no chão,
     redemoinho, escudada, saque, execução e aura (assets/pixel-art/fx-herois/, scripts/build_fx_herois.py).
   Só vale para heróis cujo pacote tem "sk" (por enquanto o Guerreiro). Skins/armaduras sem a folha extra seguem
   com as poses de antes.                                                                                         */
const __FXH = {"w-bash":{"w":64,"h":64,"n":6,"fps":14,"ax":32,"ay":32},"w-cry":{"w":80,"h":101,"n":8,"fps":12,"ax":40,"ay":83},"w-exec":{"w":58,"h":67,"n":6,"fps":8,"ax":29,"ay":26},"w-heavy":{"w":92,"h":138,"n":8,"fps":9,"ax":7,"ay":77},"w-iai":{"w":120,"h":48,"n":6,"fps":16,"ax":60,"ay":24},"w-quake":{"w":116,"h":55,"n":8,"fps":8,"ax":58,"ay":27},"w-slash":{"w":59,"h":60,"n":6,"fps":12,"ax":27,"ay":28},"w-spin":{"w":96,"h":80,"n":8,"fps":12,"ax":48,"ay":40}};
const __SKH_CLS = { WARRIOR: "warrior" };
const __SKH_ID = { HEAVY_STRIKE: "slam", DEMOLISHING_BLOW: "slam", KAISHAKU: "slam", HOLY_SMITE: "slam", SHIELD_BASH: "bash",
  IAIJUTSU: "draw", ET_TSUBAME: "draw", KAZE_GIRI: "draw", WHIRLWIND: "spin", TSUMUJI: "spin", RUPTURE: "quake", ET_QUAKE: "quake" };
const __SKH_TYPE = { "melee-heavy": "slam", "aoe-self": "spin", buff: "cry", execute: "slam", "shadow-strike": "draw" };
/* efeito por habilidade: [nome, onde, atraso s, escala, dx, dy] — onde: f = na frente, p = nos pés, c = no corpo */
const __SKH_FX = { WARRIOR: {
  _atk: ["w-slash", "f", 0, .55, 18, -20],
  HEAVY_STRIKE: ["w-heavy", "f", .24, .45, 2, -24], DEMOLISHING_BLOW: ["w-heavy", "f", .24, .5, 2, -24],
  KAISHAKU: ["w-exec", "f", .24, .6, 18, -22], SHIELD_BASH: ["w-bash", "f", .16, .6, 20, -22],
  IAIJUTSU: ["w-iai", "f", .2, .6, 30, -18], ET_TSUBAME: ["w-iai", "f", .2, .6, 30, -18], KAZE_GIRI: ["w-iai", "f", .2, .6, 30, -18],
  WHIRLWIND: ["w-spin", "c", .06, .65, 0, -10], TSUMUJI: ["w-spin", "c", .06, .65, 0, -10],
  RUPTURE: ["w-quake", "p", .3, .7, 14, 0], ET_QUAKE: ["w-quake", "p", .3, .75, 14, 0],
  _buff: ["w-cry", "p", .04, .55, 0, 0] } };
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  for (const [n, m] of Object.entries(__FXH)) this.textures.exists("fxh-" + n) || L.spritesheet("fxh-" + n, `assets/pixel-art/fx-herois/${n}.png`, { frameWidth: m.w, frameHeight: m.h });
  for (const c of Object.values(__SKH_CLS)) for (let t = 0; t <= 4; t++) { const k = `mk4b-${c}-t${t}-sk`; this.textures.exists(k) || L.spritesheet(k, `assets/pixel-art/characters/${c}-pack-t${t}-sk.png`, { frameWidth: 128, frameHeight: 128 }) }
  L.setPath(op) } catch (e) {} return r }}
function __skhFx(V, name, where, sc, dx, dy) {
  const S = V.scene, m = __FXH[name]; if (!m || !S.textures.exists("fxh-" + name)) return;
  const C = V.container, L = V.mk2Layout || {}, sg = Math.sign(C.scaleX) || 1;
  const feet = C.y + (V.mk2?.y || 0) + ((L.footY ?? 118) - 64) * (V.mk2?.scaleY || .5);
  const k = "fxh-" + name;
  S.anims.exists(k) || S.anims.create({ key: k, frames: S.anims.generateFrameNumbers(k, { start: 0, end: m.n - 1 }), frameRate: m.fps, repeat: 0 });
  const x = C.x + sg * dx, y = where === "p" ? feet + dy : feet + dy;
  const s = S.add.sprite(x, y, k, 0).setScale(sc).setFlipX(sg < 0).setDepth((C.depth ?? C.y) + 3);
  where === "p" ? s.setOrigin(m.ax / m.w, m.ay / m.h) : s.setOrigin(sg < 0 ? 1 - m.ax / m.w : m.ax / m.w, m.ay / m.h);
  if (where === "p") s.setDepth((C.depth ?? C.y) - 1);                               // no chão e a aura ficam atrás do herói
  if (name === "w-cry") s.setAlpha(.8);
  s.play(k); s.once("animationcomplete", () => s.destroy());
}
function __skhKey(V) { return V.animPrefix + "-sk" }
/* golpe básico */
{const A0 = Qe.prototype.playAttack; Qe.prototype.playAttack = function () {
  const a = A0.apply(this, arguments);
  try { const L = this.mk2Layout; if (L?.sk && this.scene.textures.exists(__skhKey(this))) {
    this.__atkE = 0; this.__atkD = Math.max(.12, ((a?.windupMs ?? 120) + (a?.hitMs ?? 80) + (a?.recoveryMs ?? 130)) / 1e3);
    const cls = this.scene.classDef?.id, F = __SKH_FX[cls]?._atk;
    if (F) { const V = this; this.scene.time.delayedCall((a?.windupMs ?? 120) * .9, () => { try { V.container?.active !== !1 && __skhFx(V, F[0], F[1], F[3], F[4], F[5]) } catch (e) {} }) }
  } } catch (e) {}
  return a }}
/* habilidades */
{const T0 = Yh.prototype.tryUse; Yh.prototype.tryUse = function (i) {
  const r = T0.apply(this, arguments);
  try { if (r) { const d = this.slots[i]?.def, S = this.scene, V = S.playerVisual, L = V?.mk2Layout;
    if (d && V && L?.sk && S.textures.exists(__skhKey(V))) {
      const key = __SKH_ID[d.id] || __SKH_TYPE[d.type];
      if (key && L.sk.rows[key] != null) V.__skA = { row: L.sk.rows[key], e: 0, d: key === "spin" ? .5 : .56 };
      const FX = __SKH_FX[S.classDef?.id] || {}, F = FX[d.id] || (d.type === "buff" ? FX._buff : null);
      if (F) S.time.delayedCall(F[2] * 1000, () => { try { __skhFx(V, F[0], F[1], F[3], F[4], F[5]) } catch (e) {} });
    } } } catch (e) {}
  return r }}
{const U0 = Qe.prototype.update; Qe.prototype.update = function (i) {
  const m = this.mk2, L = this.mk2Layout, sk = L?.sk ? __skhKey(this) : null;
  if (!m || !sk) return U0.apply(this, arguments);
  if (m.texture?.key === sk) m.setTexture(this.animPrefix, (L.map?.idle || [0])[0]);   // devolve a folha normal antes da lógica de sempre
  const r = U0.apply(this, arguments);
  try {
    const has = this.scene.textures.exists(sk), dt = i || 0;
    let row = null, k = 0;
    if (this.__skA) { const A = this.__skA; A.e += dt; if (A.e >= A.d || this.deadPose) this.__skA = null; else { row = A.row; k = Math.min(7, Math.floor(A.e / A.d * 8)) } }
    if (row == null && this.attackState === "attack" && this.__atkD) { this.__atkE += dt; row = L.sk.rows.atk; k = Math.min(7, Math.floor(this.__atkE / this.__atkD * 8)) }
    this.__skBusy = row != null;
    if (row != null && has && !this.deadPose) { m.anims.stop(); m.setTexture(sk, row * (L.sk.cols || 8) + k) }
  } catch (e) {}
  return r }}
