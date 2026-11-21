/* ══ Chefes: golpes refeitos (p216.78) ═══════════════════════════════════════════════════════════════════════════
   • Animação: cada chefe da campanha ganhou um PREPARO (enquanto o aviso no chão enche) e um GOLPE (na hora em que o
     golpe acontece), feitos no PixelLab (animate-pixminimax a partir do quadro parado do chefe; o golpe começa onde o
     preparo termina). Folhas assets/pixel-art/bosses/anim/<chefe>-windup.png / -strike.png (scripts/build_chefes_golpes.py).
   • Efeitos em pixel art no lugar dos círculos/flashes: impacto no chão (pancada), onda de choque, garra/corte,
     rocha caindo, explosão de fogo, estilhaços de gelo, magia sombria, poeira da investida e a runa de aviso por baixo
     dos avisos circulares. Folhas assets/pixel-art/fx/boss/<efeito>.png.                                              */
const __BG_BOSS = { "boss-minotaur": 128, "boss-gorgon": 128, "boss-lava-golem": 128, "boss-magma-titan": 128, "boss-icegolem": 128, "boss-dragon3": 256,
  "boss-anhanga": 72, "boss-gorgon-forest": 128, "boss-necro-queen": 128, "boss-cerberus": 128, "boss-pale-dragon": 256, "boss-ent": 128,
  "boss-observer": 128, "boss-guardian-fallen": 256, "boss-tengu": 128 };
/* sabor do efeito de área de cada chefe */
const __BG_FLAV = { "boss-lava-golem": "fire", "boss-magma-titan": "fire", "boss-dragon3": "fire", "boss-pale-dragon": "ice", "boss-icegolem": "ice",
  "boss-necro-queen": "dark", "boss-observer": "dark", "boss-guardian-fallen": "dark", "boss-tengu": "dark", "boss-anhanga": "dark" };
const __BG_FX = { impact: 128, shock: 128, slash: 128, rock: 128, fire: 128, ice: 128, dark: 128, warn: 128, dust: 64 };
/* quadros usados de cada efeito (a IA às vezes deixa um quadro parado no começo ou um borrão no fim) */
const __BG_FR = { impact: [0, 7], shock: [1, 4], slash: [1, 5], rock: [0, 8], fire: [0, 6], ice: [0, 7], dark: [0, 8], warn: [0, 8], dust: [0, 8] };
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  for (const [k, w] of Object.entries(__BG_BOSS)) for (const a of ["windup", "strike"]) this.textures.exists(`${k}-${a}2`) || L.spritesheet(`${k}-${a}2`, `assets/pixel-art/bosses/anim/${k}-${a}.png`, { frameWidth: w, frameHeight: w });
  for (const [k, w] of Object.entries(__BG_FX)) this.textures.exists("bfx-" + k) || L.spritesheet("bfx-" + k, `assets/pixel-art/fx/boss/${k}.png`, { frameWidth: w, frameHeight: w });
  L.setPath(op) } catch (e) {} return r }}
function __bgAnims(sc) {
  const A = sc.anims, T = sc.textures;
  for (const k of Object.keys(__BG_FX)) { const t = "bfx-" + k; if (!T.exists(t) || A.exists(t)) continue; const n = T.get(t).frameTotal - 1;
    const [a, b] = __BG_FR[k] || [0, n - 1];
    A.create({ key: t, frames: A.generateFrameNumbers(t, { start: Math.min(a, n - 1), end: Math.min(b, n - 1) }), frameRate: k === "warn" ? 10 : k === "dust" ? 16 : k === "shock" ? 12 : 14, repeat: k === "warn" ? -1 : 0 }) }
  for (const k of Object.keys(__BG_BOSS)) {
    const w = k + "-windup2", s = k + "-strike2";
    if (T.exists(w) && !A.get(k + "-windup")?.__bg) { const n = T.get(w).frameTotal - 1; if (n > 1) { A.remove(k + "-windup"); const a = A.create({ key: k + "-windup", frames: A.generateFrameNumbers(w, { start: 0, end: n - 1 }), frameRate: 11, repeat: 0 }); a && (a.__bg = 1) } }
    if (T.exists(s) && !A.exists(k + "-strike2a")) { const n = T.get(s).frameTotal - 1; n > 1 && A.create({ key: k + "-strike2a", frames: A.generateFrameNumbers(s, { start: 0, end: n - 1 }), frameRate: 16, repeat: 0 }) }
  }
}
/* um efeito de pixel art que toca uma vez (ou fica em laço até ms) e some */
function __bfx(sc, k, x, y, size, o = {}) {
  try {
    const t = "bfx-" + k; if (!sc?.textures?.exists(t)) return null; __bgAnims(sc);
    const s = sc.add.sprite(x, y, t, 0).setOrigin(.5, .5).setScale(size / __BG_FX[k]).setDepth(o.depth ?? (y + 30)).setAlpha(o.alpha ?? 1);
    o.rot != null && s.setRotation(o.rot); o.tint != null && s.setTint(o.tint); o.add && s.setBlendMode(j.BlendModes.ADD); o.flip && s.setFlipX(!0);
    s.play(t);
    if (k === "shock") { const k0 = s.scaleX; s.setScale(k0 * .45); sc.tweens.add({ targets: s, scaleX: k0, scaleY: k0, duration: 300, ease: "Quad.easeOut" }) }
    if (o.ms) sc.time.delayedCall(o.ms, () => s.active && sc.tweens.add({ targets: s, alpha: 0, duration: 140, onComplete: () => s.destroy() }));
    else s.once("animationcomplete", () => s.active && sc.tweens.add({ targets: s, alpha: 0, duration: 160, onComplete: () => s.destroy() }));
    return s;
  } catch (e) { return null }
}
window.__bfx = __bfx;
/* golpe: toca a animação de golpe do chefe por cima da lógica de animação até terminar */
function __bgStrike(B) {
  try {
    const k = B.data_?.texture, a = k && B.scene.anims.get(k + "-strike2a"); if (!a || B.dead) return;
    B.play(k + "-strike2a", !0); B.__bgUntil = B.scene.time.now + a.frames.length / a.frameRate * 1e3;
  } catch (e) {}
}
{const U0 = hh.prototype.updateAnim; hh.prototype.updateAnim = function () {
  try { __bgAnims(this.scene); if (!this.dead && this.__bgUntil && this.scene.time.now < this.__bgUntil && !this.flying) return } catch (e) {}
  return U0.apply(this, arguments) }}
{const fl = B => __BG_FLAV[B.data_?.texture] || null, W = (n, f) => { const o = hh.prototype[n]; if (typeof o !== "function") return; hh.prototype[n] = function (...a) { if (!this.dead) try { f.call(this, ...a) } catch (e) {} return o.apply(this, a) } };
  W("executeSlam", function () { __bgStrike(this); const A = this.slamArea; if (!A) return; const sz = Math.max(A.w, A.h) * 1.15; __bfx(this.scene, ["fire", "ice", "dark"].includes(fl(this)) ? fl(this) : "impact", A.cx, A.cy, sz, { depth: A.cy - 2 }); __bfx(this.scene, "dust", A.cx, A.cy, sz * .7) });
  W("executeShockwave", function () { __bgStrike(this); const r = this.shockRadius || 100, f = fl(this); __bfx(this.scene, "shock", this.x, this.y, r * 2.25, { depth: this.y - 4, tint: f === "fire" ? 0xffb070 : f === "ice" ? 0xbfefff : f === "dark" ? 0xc890ff : null }); f && __bfx(this.scene, f, this.x, this.y + 6, Math.min(170, r * 1.3), { depth: this.y + 2 }) });
  W("executeTailSweep", function () { __bgStrike(this); const r = this.shockRadius || 100; __bfx(this.scene, "shock", this.x, this.y, r * 2.25, { depth: this.y - 4 }); __bfx(this.scene, "slash", this.x, this.y, r * 1.6, { rot: Math.random() * 6.28 }) });
  W("executeRoar", function () { __bgStrike(this); const r = this.shockRadius || 150; __bfx(this.scene, "shock", this.x, this.y, r * 2.25, { depth: this.y - 4, tint: 0xffd0a0 }); __bfx(this.scene, "shock", this.x, this.y, r * 1.35, { depth: this.y - 3 }) });
  W("executeFrontal", function () { __bgStrike(this); const A = this.slamArea; if (!A) return; __bfx(this.scene, "slash", A.cx, A.cy, Math.max(A.w, A.h) * 1.2, { rot: A.rot, depth: A.cy + 40 }) });
  W("executeFireBreath", function () { __bgStrike(this); const A = this.slamArea; if (!A) return; for (let k = 0; k < 5; k++) { const t = (k / 4 - .5) * A.w * .9; this.scene.time.delayedCall(k * 60, () => __bfx(this.scene, "fire", A.cx + Math.cos(A.rot) * t, A.cy + Math.sin(A.rot) * t, A.h * 1.6)) } });
  W("executeRockImpact", function (x, y, r) { __bfx(this.scene, "rock", x, y - 6, (r || 34) * 2.6, { depth: y + 4 }); __bfx(this.scene, "dust", x, y, (r || 34) * 2) });
  W("executeMeteorImpact", function (x, y, r) { __bfx(this.scene, "fire", x, y - 4, (r || 40) * 2.6, { depth: y + 4 }) });
  W("executeIceImpact", function (x, y, r) { __bfx(this.scene, "ice", x, y - 6, (r || 40) * 2.6, { depth: y + 4 }) });
  W("executeLanding", function () { __bfx(this.scene, "impact", this.x, this.y + 10, 190, { depth: this.y - 2 }); __bfx(this.scene, "shock", this.x, this.y, 260, { depth: this.y - 4 }) });
  W("executeChargeStart", function () { __bgStrike(this); const d = this.data_.attacks?.CHARGE?.durationMs ?? 600; for (let t = 0; t < d; t += 90) this.scene.time.delayedCall(t, () => { if (!this.active || this.dead) return; __bfx(this.scene, "dust", this.x - (this.chargeDir?.x ?? 0) * 18, this.y + this.displayHeight * .18, 44, { depth: this.y - 1 }) }) });
}
/* runa por baixo dos avisos circulares (chefes e inimigos) */
{const C0 = Sd.prototype.create; Sd.prototype.create = function () { const r = C0.apply(this, arguments); try {
  const S = this, TG = S.telegraphs; __bgAnims(S);
  if (TG && !TG.__bg && typeof TG.circle === "function") { const c0 = TG.circle.bind(TG); TG.circle = function (x, y, rad, ms, col, cb) { try { rad > 16 && __bfx(S, "warn", x, y, rad * 2.15, { ms: Math.max(120, ms - 40), alpha: .6, tint: col, add: !0, depth: y - 40 }) } catch (e) {} return c0(x, y, rad, ms, col, cb) }; TG.__bg = 1 }
} catch (e) {} return r }}
