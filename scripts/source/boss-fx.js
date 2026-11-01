/* ══ Chefes: ataques com peso ══
   - aviso no chão com brilho que cresce até o golpe
   - meteoros, estacas de gelo e pedras caindo de verdade antes do impacto
   - sopro de fogo em jato, garras com cortes, pisões com poeira, rachaduras e destroços
   - segunda fase com clarão, onda e aura do elemento do chefe; morte com explosão do elemento
   Usa a biblioteca __FX (fx-lib.js). */
const __BEL = { DRAGON_ANCIENT: "fire", MAGMA_TITAN: "fire", LAVA_GOLEM: "fire", FROST_WARDEN: "ice", PALE_DRAGON: "ice", REAPER: "shadow",
  ABYSS_GUARDIAN: "shadow", ANHANGA: "shadow", FOX_WITCH: "arcane", CASTLE_LORD: "shadow", BEHOLDER: "arcane", CERBERUS: "fire",
  SATYR_SISTERS: "poison", ANCIENT_COLOSSUS: "holy", FOREST_ENT: "poison", WILD_ENT: "poison", RIVER_TENGU: "lightning" };
function __bossEl(b) { return __BEL[b?.typeKey] ?? __fxElOf({ id: b?.typeKey, name: b?.data_?.name, texture: b?.data_?.texture }) ?? "shadow" }
const __BX = {
  dust(S, x, y, r = 40, col = 0x8a7a66, n = 14) {
    __FX.tex(S);
    __FX.em(S, "fx2-smoke", { speed: { min: r * .8, max: r * 1.8 }, angle: { min: 0, max: 360 }, lifespan: { min: 600, max: 1100 }, scale: { start: .5, end: 1.6 }, alpha: { start: .55, end: 0 }, tint: col, gravityY: -10 }, n, x, y, y + 30);
  },
  debris(S, x, y, n = 10, col = [0x6a5a4a, 0x8a7a66, 0x4a3e34]) {
    __FX.em(S, "fx2-shard", { speed: { min: 80, max: 220 }, angle: { min: 200, max: 340 }, rotate: { min: 0, max: 360 }, lifespan: { min: 500, max: 900 }, scale: { start: .9, end: .5 }, alpha: { start: 1, end: .2 }, tint: col, gravityY: 520 }, n, x, y, y + 31);
  },
  crack(S, x, y, r = 50, col = 0x1a1410) {
    const g = S.add.graphics().setDepth(1.3);
    for (let k = 0; k < 7; k++) {
      let a = k / 7 * 6.28 + Math.random() * .5, px = x, py = y, len = r * (.6 + Math.random() * .5);
      g.lineStyle(2.4, col, .85); g.beginPath(); g.moveTo(px, py);
      for (let s = 0; s < 4; s++) { a += (Math.random() - .5) * .7; px += Math.cos(a) * len / 4; py += Math.sin(a) * len / 4 * .7; g.lineTo(px, py) }
      g.strokePath();
    }
    g.fillStyle(col, .35); g.fillEllipse(x, y, r * .5, r * .3);
    S.tweens.add({ targets: g, alpha: 0, delay: 1600, duration: 900, onComplete: () => g.destroy() });
  },
  scorch(S, x, y, r = 40) {
    const g = S.add.graphics().setDepth(1.25);
    g.fillStyle(0x140a06, .55); g.fillEllipse(x, y, r * 1.6, r * 1.0);
    g.fillStyle(0xff5a1a, .25); g.fillEllipse(x, y, r * .7, r * .45);
    S.tweens.add({ targets: g, alpha: 0, delay: 1400, duration: 1200, onComplete: () => g.destroy() });
  },
  flash(S, col, ms = 120, a = .25) {
    try { const c = S.cameras.main; c.flash(ms, (col >> 16 & 255) * a | 0, (col >> 8 & 255) * a | 0, (col & 255) * a | 0) } catch (e) {}
  },
  stop(S, ms) { try { S.effects?.hitStop?.(ms) } catch (e) {} },
  /* objeto caindo do céu até (x,y) em ms; com rastro do elemento e sombra crescendo no chão */
  fall(S, x, y, ms, el, kind) {
    __FX.tex(S);
    const tex = kind === "rock" ? (S.textures.exists("vc-boulder2") ? "vc-boulder2" : "fx2-dot") : kind === "ice" ? "fx2-shard" : "fx2-dot";
    const o = S.add.image(x + 90, y - 330, tex).setDepth(y + 200);
    if (kind === "ice") o.setScale(2.6).setTint(0xd8f2ff).setRotation(Math.atan2(330, -90) - Math.PI / 2);
    else if (kind === "rock") o.setScale(1.1);
    else o.setScale(2.2).setTint(0xfff0c0).setBlendMode(j.BlendModes.ADD);
    const sh = S.add.ellipse(x, y, 10, 6, 0, .35).setDepth(1.4);
    const h = __FX.follow(S, o, kind === "rock" ? "fire" : el, { size: kind === "rock" ? .8 : 1.6, core: kind !== "rock", lightScale: .22, depth: y + 199 });
    if (kind === "rock") h?.ems.forEach((e) => e.setVisible(!1));
    S.tweens.add({ targets: sh, scaleX: 5, scaleY: 5, alpha: .5, duration: ms, ease: "Quad.easeIn" });
    S.tweens.add({ targets: o, x, y, duration: ms, ease: "Quad.easeIn", onComplete: () => { h?.stop(); o.destroy(); sh.destroy() } });
  },
};
{
  /* avisos no chão: brilho do elemento crescendo por baixo do desenho */
  const sh0 = (S, x, y, r, ms, col, al = .45) => {
    if (!S.textures.exists("light")) return null;
    const g = S.add.image(x, y, "light").setBlendMode(j.BlendModes.ADD).setTint(col).setScale(r / 70).setAlpha(0).setDepth(29);
    S.tweens.add({ targets: g, alpha: al, duration: ms * .9, ease: "Quad.easeIn" });
    S.time.delayedCall(ms + 40, () => g.active && S.tweens.add({ targets: g, alpha: 0, scale: g.scale * 1.3, duration: 180, onComplete: () => g.destroy() }));
    return g;
  };
  const CI0 = Gh.prototype.circle, RE0 = Gh.prototype.rect;
  Gh.prototype.circle = function (x, y, r, ms, col, cb) {
    const S = this.scene, h = CI0.apply(this, arguments);
    try {
      const g = sh0(S, x, y, r, ms, col), b = S.boss, atk = b && !b.dead ? b.currentAttack : null;
      if (atk === "FIRE_METEOR") S.time.delayedCall(ms * .35, () => __BX.fall(S, x, y, ms * .65, "fire", "meteor"));
      else if (atk === "ICE_SHARDS") S.time.delayedCall(ms * .4, () => __BX.fall(S, x, y, ms * .6, "ice", "ice"));
      else if (atk === "ROCKS") S.time.delayedCall(ms * .4, () => __BX.fall(S, x, y, ms * .6, "fire", "rock"));
      if (g && h?.cancel) { const c0 = h.cancel; h.cancel = () => { g.destroy(); c0() } }
    } catch (e) {}
    return h;
  };
  Gh.prototype.rect = function (x, y, w, hh, rot, ms, col, cb) {
    const S = this.scene, h = RE0.apply(this, arguments);
    try { const g = sh0(S, x, y, Math.max(w, hh) * .6, ms, col, .22); g && g.setScale(w / 150, hh / 150).setRotation(rot); if (g && h?.cancel) { const c0 = h.cancel; h.cancel = () => { g.destroy(); c0() } } } catch (e) {}
    return h;
  };
}
{
  const P = hh.prototype, W = (name, fn) => { const f0 = P[name]; if (typeof f0 !== "function") return; P[name] = function () { const alive = !this.dead, S = this.scene; S.__fxBossEl = __bossEl(this); let r; try { r = f0.apply(this, arguments) } finally { S.__fxBossEl = null } try { alive && fn.apply(this, arguments) } catch (e) { console.warn("[boss-fx]", name, e) } return r } };
  /* preparo: o chefe brilha e puxa energia enquanto o aviso enche */
  W("startTelegraph", function (atk) {
    const S = this.scene, el = __bossEl(this), Pp = __FX.PAL[el], ms = this.data_.attacks?.[atk]?.telegraphMs ?? 600;
    const n = Math.max(3, Math.round(ms / 90));
    for (let k = 0; k < n; k++) S.time.delayedCall(k * 80, () => {
      if (this.dead || !this.active) return;
      const a = Math.random() * 6.28, r = this.displayWidth * .7, x = this.x + Math.cos(a) * r, y = this.y - this.displayHeight * .3 + Math.sin(a) * r * .6;
      const d = S.add.image(x, y, "fx2-dot").setBlendMode(j.BlendModes.ADD).setTint(Pp.mid).setScale(1.2).setDepth(this.depth + 2);
      S.tweens.add({ targets: d, x: this.x, y: this.y - this.displayHeight * .3, scale: .2, alpha: .3, duration: 260, ease: "Quad.easeIn", onComplete: () => d.destroy() });
    });
    __FX.glow(S, this.x, this.y - this.displayHeight * .3, Pp.light, this.displayWidth / 90, ms, .5, this.depth + 1);
  });
  W("executeFrontal", function (key) {
    const S = this.scene, d = this.slamArea; if (!d) return;
    const dx = Math.cos(d.rot), dy = Math.sin(d.rot), nx = -dy, ny = dx;
    for (let k = -1; k <= 1; k++) { const ox = nx * k * 9, oy = ny * k * 9; __FX.bolt(S, d.cx - dx * d.w * .4 + ox, d.cy - dy * d.w * .4 + oy, d.cx + dx * d.w * .4 + ox, d.cy + dy * d.w * .4 + oy, key === "BITE" ? 0xff5a4a : 0xffffff, 160) }
    __BX.dust(S, d.cx, d.cy, 26, 0x8a7a66, 8); __BX.stop(S, 50);
  });
  W("executeFireBreath", function () {
    const S = this.scene, d = this.slamArea; if (!d) return;
    __FX.tex(S);
    const deg = d.rot * 57.3, mx = d.cx - Math.cos(d.rot) * d.w / 2, my = d.cy - Math.sin(d.rot) * d.w / 2, P = __FX.PAL.fire;
    if (!__FX.ok()) return;
    const jet = S.add.particles(0, 0, "fx2-flame", { x: mx, y: my, frequency: 7 / __FX.q, quantity: 2, lifespan: { min: 380, max: 600 }, speed: { min: d.w * 1.3, max: d.w * 1.9 }, angle: { min: deg - 13, max: deg + 13 }, scale: { start: .6, end: 1.9 }, alpha: { start: .75, end: 0 }, tint: [P.mid, P.out, P.deep, P.core], rotate: { min: 0, max: 360 }, blendMode: "ADD" }).setDepth(d.cy + 60);
    const smk = S.add.particles(0, 0, "fx2-smoke", { x: mx, y: my, frequency: 40 / __FX.q, lifespan: { min: 700, max: 1100 }, speed: { min: d.w * .8, max: d.w * 1.2 }, angle: { min: deg - 12, max: deg + 12 }, scale: { start: .6, end: 2 }, alpha: { start: .4, end: 0 }, tint: P.smoke, gravityY: -40 }).setDepth(d.cy + 59);
    __FX.live += 2;
    for (let k = 0; k < 5; k++) S.time.delayedCall(k * 90, () => __FX.glow(S, d.cx + Math.cos(d.rot) * (k - 2) * d.w * .2, d.cy + Math.sin(d.rot) * (k - 2) * d.w * .2, P.light, .45, 300, .6, d.cy + 61));
    S.time.delayedCall(520, () => { jet.stop(); smk.stop(); S.time.delayedCall(1200, () => { __FX.live -= 2; jet.destroy(); smk.destroy() }) });
    __BX.flash(S, P.out, 160, .18);
  });
  const ground = function (x, y, r, el) {
    const S = this.scene;
    __BX.dust(S, x, y, r * .7, 0x8a7a66, 16); __BX.debris(S, x, y, 10); __BX.crack(S, x, y, r * .8);
    __FX.ring(S, x, y, __FX.PAL[el]?.mid ?? 0xffffff, r, 420, y + 30); __BX.stop(S, 70);
  };
  W("executeSlam", function () { const d = this.slamArea; d && ground.call(this, d.cx, d.cy, Math.max(d.w, d.h) * .5, __bossEl(this)) });
  W("executeTailSweep", function () { ground.call(this, this.x, this.y, this.shockRadius ?? 80, __bossEl(this)) });
  W("executeShockwave", function () { ground.call(this, this.x, this.y, this.shockRadius ?? 80, __bossEl(this)); __FX.impact(this.scene, this.x, this.y - 10, __bossEl(this), 1.6) });
  W("executeRoar", function () { const S = this.scene, el = __bossEl(this); __BX.dust(S, this.x, this.y, (this.shockRadius ?? 90) * .8, 0x8a7a66, 18); __BX.flash(S, __FX.PAL[el].out, 200, .3); __FX.ring(S, this.x, this.y - 20, __FX.PAL[el].mid, this.shockRadius ?? 90, 500) });
  W("executeLanding", function (x, y, e) { ground.call(this, x, y, e?.landRadius ?? 90, __bossEl(this)) });
  W("executeMeteorImpact", function (x, y, r) { const S = this.scene; __FX.impact(S, x, y, "fire", 2.4); __BX.scorch(S, x, y, r); __BX.debris(S, x, y, 8, [0x3a2a22, 0xff7a2a, 0x5a4a3a]); __BX.flash(S, 0xff6a2a, 90, .15) });
  W("executeIceImpact", function (x, y, r) {
    const S = this.scene; __FX.impact(S, x, y, "ice", 2.2);
    for (let k = 0; k < 5; k++) {
      const a = k / 5 * 6.28 + Math.random() * .6, px = x + Math.cos(a) * r * .45, py = y + Math.sin(a) * r * .3, sp = S.add.image(px, py + 10, "fx2-shard").setTint(0xd8f2ff).setScale(1.6, 0).setOrigin(.5, 1).setDepth(py + 5);
      S.tweens.add({ targets: sp, scaleY: 2.6 + Math.random(), y: py, duration: 120, ease: "Back.easeOut", onComplete: () => S.tweens.add({ targets: sp, alpha: 0, delay: 700, duration: 300, onComplete: () => sp.destroy() }) });
    }
  });
  W("executeRockImpact", function (x, y, r) { const S = this.scene; __BX.dust(S, x, y, r * .8, 0x8a7a66, 12); __BX.debris(S, x, y, 9); __BX.crack(S, x, y, r * .7) });
  W("executeChargeStart", function () {
    const S = this.scene, h = __FX.follow(S, this, "fire", { size: 1, light: !1, oy: this.displayHeight * .35 });
    h?.ems.forEach((e) => { e.setVisible(!1) });
    const t = S.time.addEvent({ delay: 60, repeat: 14, callback: () => { if (this.dead || !this.active) return; __BX.dust(S, this.x, this.y + this.displayHeight * .3, 12, 0x8a7a66, 3) } });
    S.time.delayedCall(950, () => { h?.stop(); t.remove() });
  });
  const phase = function () {
    const S = this.scene, el = __bossEl(this), Pp = __FX.PAL[el];
    __BX.flash(S, Pp.out, 260, .45); __FX.impact(S, this.x, this.y - this.displayHeight * .3, el, 2.6);
    for (let k = 0; k < 3; k++) S.time.delayedCall(k * 140, () => __FX.ring(S, this.x, this.y, Pp.mid, 90 + k * 40, 600));
    this.__fxAura?.stop();
    this.__fxAura = __FX.follow(S, this, el, { size: Math.min(2.2, this.displayHeight / 40), oy: -this.displayHeight * .3, zone: { w: this.displayWidth * .6, h: this.displayHeight * .6 }, lightScale: this.displayWidth / 160, lightAlpha: .35 });
    this.__fxAura?.ems.forEach((e) => { e.frequency = e.frequency * 1.6 });
  };
  W("enterPhase2", phase);
  W("enterPhaseN", phase);
  W("die", function () {
    const S = this.scene, el = __bossEl(this);
    this.__fxAura?.stop(); this.__fxAura = null;
    for (let k = 0; k < 4; k++) S.time.delayedCall(250 + k * 260, () => __FX.impact(S, this.x + (Math.random() - .5) * 60, this.y - this.displayHeight * .3 + (Math.random() - .5) * 40, el, 2));
    S.time.delayedCall(1400, () => { __FX.impact(S, this.x, this.y - this.displayHeight * .3, el, 3.4); __BX.flash(S, __FX.PAL[el].core, 300, .5); __BX.dust(S, this.x, this.y, 70, 0x8a7a66, 20) });
  });
}
