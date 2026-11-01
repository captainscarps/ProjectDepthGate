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
  /* avisos no chão: em vez de linhas retas, mancha de energia com borda irregular que vai enchendo,
     rachaduras abrindo, partículas do elemento na borda e brilho no chão */
  const texs = (S) => {
    __FX.tex(S);
    if (S.textures.exists("fx2-disc")) return;
    const mkN = (k, W, H, shape) => {
      const t = S.textures.createCanvas(k, W, H), g = t.getContext(), img = g.createImageData(W, H), d = img.data;
      const nz = (x, y) => { const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return v - Math.floor(v) };
      const sm = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, a = nz(xi, yi), b = nz(xi + 1, yi), c = nz(xi, yi + 1), e = nz(xi + 1, yi + 1), u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return a + (b - a) * u + (c - a) * v + (a - b - c + e) * u * v };
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const q = shape(x / W * 2 - 1, y / H * 2 - 1), n = sm(x / 9, y / 9) * .6 + sm(x / 4, y / 4) * .4, edge = q + (n - .5) * .34;
        let al = 0;
        if (edge < 1) { const rim = Math.max(0, 1 - Math.abs(edge - .9) / .1); al = (.22 + edge * .35) * (.75 + n * .5) + rim * .7 }
        const i = (y * W + x) * 4; d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = Math.min(255, al * 255);
      }
      g.putImageData(img, 0, 0); t.refresh();
    };
    mkN("fx2-disc", 128, 128, (u, v) => Math.hypot(u, v));
    mkN("fx2-lane", 160, 64, (u, v) => Math.sqrt(Math.pow(Math.abs(u), 6) + v * v));
  };
  const elOf = (S, col) => { const b = S.boss; return b && !b.dead && b.active ? __bossEl(b) : (__fxElOf({ tint: col }) ?? "fire") };
  const crackLines = (S, x, y, len, rot, n, col, depth) => {
    const g = S.add.graphics().setDepth(depth).setBlendMode(j.BlendModes.ADD), L = [];
    for (let k = 0; k < n; k++) { let a = rot + (k / n) * 6.28 + Math.random() * .5, px = 0, py = 0; const pts = [[0, 0]]; for (let s = 0; s < 5; s++) { a += (Math.random() - .5) * .8; px += Math.cos(a) * len / 5; py += Math.sin(a) * len / 5 * .75; pts.push([px, py]) } L.push(pts) }
    return { g, draw(t, al) { g.clear(); for (const pts of L) { const m = Math.max(1, Math.floor(pts.length * t)); g.lineStyle(2, col, al); g.beginPath(); g.moveTo(x + pts[0][0], y + pts[0][1]); for (let i = 1; i <= m && i < pts.length; i++) g.lineTo(x + pts[i][0], y + pts[i][1]); g.strokePath() } } };
  };
  const rimEmit = (S, el, src, depth, freq) => {
    if (!__FX.ok()) return null;
    const P = __FX.PAL[el], tx = el === "fire" ? "fx2-flame" : el === "ice" ? "fx2-flake" : el === "poison" || el === "nature" ? "fx2-bubble" : "fx2-dot";
    try {
      const e = S.add.particles(0, 0, tx, { emitZone: { type: "random", source: src }, frequency: freq / __FX.q, lifespan: { min: 300, max: 650 }, speed: { min: 6, max: 24 }, angle: { min: 250, max: 290 }, scale: { start: .6, end: .1 }, alpha: { start: .75, end: 0 }, tint: [P.mid, P.out, P.light], gravityY: el === "fire" ? -60 : el === "ice" ? 10 : -20, blendMode: "ADD" }).setDepth(depth);
      __FX.live++; return e;
    } catch (err) { return null }
  };
  const run = (S, ms, parts, onTick, cb) => {
    let done = !1;
    const end = (fire) => { if (done) return; done = !0; tw.stop(); for (const p of parts) { if (!p) continue; if (p.stop && p.type === "ParticleEmitter") { p.stop(); S.time.delayedCall(700, () => { __FX.live--; p.destroy() }) } else p.destroy?.() } fire && cb?.() };
    const tick = (t) => { try { onTick(t) } catch (e) { tick.e || console.warn("[telegraph] tick", e?.message); tick.e = 1 } }, o = { t: 0 }, tw = S.tweens.add({ targets: o, t: 1, duration: ms, onUpdate: () => tick(o.t), onComplete: () => end(!0) });
    tick(0);
    return { cancel: () => end(!1) };
  };
  const CI0 = Gh.prototype.circle, RE0 = Gh.prototype.rect;
  Gh.prototype.circle = function (x, y, r, ms, col, cb) { try { return CIRC.apply(this, arguments) } catch (e) { console.warn("[telegraph]", e); return CI0.apply(this, arguments) } };
  Gh.prototype.rect = function (x, y, w, h, rot, ms, col, cb) { try { return RECT.apply(this, arguments) } catch (e) { console.warn("[telegraph]", e); return RE0.apply(this, arguments) } };
  const CIRC = function (x, y, r, ms, col, cb) {
    const S = this.scene;
    texs(S);
    const el = elOf(S, col), P = __FX.PAL[el], dp = 29;
    const base = S.add.image(x, y, "fx2-disc").setTint(P.deep).setAlpha(.5).setDepth(dp).setDisplaySize(r * 2.1, r * 1.5).setRotation(Math.random() * 6.28);
    const fill = S.add.image(x, y, "fx2-disc").setTint(P.out).setBlendMode(j.BlendModes.ADD).setDepth(dp + .1).setRotation(Math.random() * 6.28);
    const glow = S.textures.exists("light") ? S.add.image(x, y, "light").setTint(P.light).setBlendMode(j.BlendModes.ADD).setDepth(dp + .2).setScale(r / 80) : null;
    const cr = crackLines(S, x, y, r * .95, Math.random() * 6.28, 6, P.mid, dp + .15);
    const em = rimEmit(S, el, new j.Geom.Ellipse(0, 0, 0, 0), dp + .3, Math.max(14, 900 / r));
    const zone = em ? new j.Geom.Ellipse(x, y, r * 2, r * 1.45) : null;
    if (em) em.clearEmitZones(), em.addEmitZone({ type: "edge", source: zone, quantity: 32 });
    const b = S.boss, atk = b && !b.dead ? b.currentAttack : null;
    if (atk === "FIRE_METEOR") S.time.delayedCall(ms * .35, () => __BX.fall(S, x, y, ms * .65, "fire", "meteor"));
    else if (atk === "ICE_SHARDS") S.time.delayedCall(ms * .4, () => __BX.fall(S, x, y, ms * .6, "ice", "ice"));
    else if (atk === "ROCKS") S.time.delayedCall(ms * .4, () => __BX.fall(S, x, y, ms * .6, "fire", "rock"));
    return run(S, ms, [base, fill, glow, cr.g, em], (t) => {
      const pul = .85 + Math.sin(t * 40) * .15 * t;
      fill.setDisplaySize(r * 2.1 * t, r * 1.5 * t).setAlpha((.25 + t * .5) * pul);
      base.setAlpha(.35 + t * .3);
      glow && glow.setAlpha(t * .45 * pul);
      cr.draw(t, .35 + t * .55);
    }, cb);
  };
  const RECT = function (x, y, w, h, rot, ms, col, cb) {
    const S = this.scene;
    texs(S);
    const el = elOf(S, col), P = __FX.PAL[el], dp = 29, cs = Math.cos(rot), sn = Math.sin(rot);
    const x0 = x - cs * w / 2, y0 = y - sn * w / 2;
    const base = S.add.image(x, y, "fx2-lane").setTint(P.deep).setAlpha(.5).setDepth(dp).setDisplaySize(w * 1.04, h * 1.25).setRotation(rot);
    const fill = S.add.image(x0, y0, "fx2-lane").setOrigin(0, .5).setTint(P.out).setBlendMode(j.BlendModes.ADD).setDepth(dp + .1).setRotation(rot);
    const glow = S.textures.exists("light") ? S.add.image(x, y, "light").setTint(P.light).setBlendMode(j.BlendModes.ADD).setDepth(dp + .2).setRotation(rot).setScale(w / 160, h / 110) : null;
    const cr = crackLines(S, x0 + cs * 8, y0 + sn * 8, w * .9, rot, 1, P.mid, dp + .15);
    const cr2 = crackLines(S, x, y, Math.min(w, h) * .5, rot, 4, P.mid, dp + .15);
    const em = rimEmit(S, el, new j.Geom.Rectangle(0, 0, 1, 1), dp + .3, Math.max(12, 1600 / w));
    if (em) { const pts = []; for (let k = 0; k < 24; k++) { const u = (k / 23 - .5) * w, side = k % 2 ? 1 : -1; pts.push({ x: x + cs * u - sn * side * h / 2, y: y + sn * u + cs * side * h / 2 }) } em.clearEmitZones(), em.addEmitZone({ type: "random", source: { getRandomPoint: (pt) => { const q = pts[Math.random() * pts.length | 0]; pt.x = q.x + (Math.random() - .5) * 6; pt.y = q.y + (Math.random() - .5) * 6; return pt } } }) }
    return run(S, ms, [base, fill, glow, cr.g, cr2.g, em], (t) => {
      const pul = .85 + Math.sin(t * 40) * .15 * t;
      fill.setDisplaySize(Math.max(1, w * t), h * 1.1).setAlpha((.25 + t * .5) * pul);
      base.setAlpha(.35 + t * .3);
      glow && glow.setAlpha(t * .3 * pul);
      cr.draw(t, .3 + t * .6); cr2.draw(t, .25 + t * .5);
    }, cb);
  };
  Gh.prototype.line = function () { return this.rect.apply(this, arguments) };
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

/* ══ Golpe exclusivo de cada chefe, pelo elemento dele ══
   fogo: pilares de lava em linha · gelo: anel de estacas · sombra: foice cruzada · veneno: poças tóxicas
   natureza: espinhos · arcano: runas em pentagrama · sagrado: colunas de luz · raio: correntes elétricas
   A cada ~11 s (7 s na segunda fase), quando o chefe está perseguindo. */
const __SIGN = {
  fire: ["PILARES DE LAVA", "LAVA PILLARS", "PILARES DE LAVA"], ice: ["PRISÃO DE ESTACAS", "SPIKE PRISON", "PRISIÓN DE ESTACAS"],
  shadow: ["FOICE SOMBRIA", "SHADOW SCYTHE", "GUADAÑA SOMBRÍA"], poison: ["POÇAS TÓXICAS", "TOXIC POOLS", "CHARCOS TÓXICOS"],
  nature: ["ESPINHOS DA TERRA", "EARTH THORNS", "ESPINAS DE LA TIERRA"], arcane: ["PENTAGRAMA ARCANO", "ARCANE PENTAGRAM", "PENTAGRAMA ARCANO"],
  holy: ["COLUNAS DE LUZ", "PILLARS OF LIGHT", "COLUMNAS DE LUZ"], lightning: ["CORRENTES DO TROVÃO", "THUNDER CHAINS", "CADENAS DEL TRUENO"],
  steel: ["PISÃO SÍSMICO", "SEISMIC STOMP", "PISOTÓN SÍSMICO"],
};
function __sigSpikes(S, x, y, r, tint) {
  for (let k = 0; k < 4; k++) {
    const a = k / 4 * 6.28 + Math.random() * .8, px = x + Math.cos(a) * r * .35, py = y + Math.sin(a) * r * .25, sp = S.add.image(px, py + 10, "fx2-shard").setTint(tint).setScale(1.5, 0).setOrigin(.5, 1).setDepth(py + 5);
    S.tweens.add({ targets: sp, scaleY: 2.4 + Math.random(), y: py, duration: 110, ease: "Back.easeOut", onComplete: () => S.tweens.add({ targets: sp, alpha: 0, delay: 650, duration: 280, onComplete: () => sp.destroy() }) });
  }
}
function __sigColumn(S, x, y, el) {
  const Pa = __FX.PAL[el];
  if (S.textures.exists("light")) { const c = S.add.image(x, y - 70, "light").setBlendMode(j.BlendModes.ADD).setTint(Pa.light).setScale(.25, 1.6).setAlpha(.9).setDepth(y + 60); S.tweens.add({ targets: c, scaleX: .05, alpha: 0, duration: 520, ease: "Quad.easeIn", onComplete: () => c.destroy() }) }
  __FX.em(S, el === "fire" ? "fx2-flame" : el === "holy" ? "fx2-star" : "fx2-dot", { speed: { min: 120, max: 260 }, angle: { min: 262, max: 278 }, lifespan: { min: 300, max: 600 }, scale: { start: .9, end: .2 }, alpha: { start: .85, end: 0 }, tint: [Pa.mid, Pa.out, Pa.core], blendMode: "ADD", gravityY: 60 }, 16, x, y, y + 61);
}
{
  const P = hh.prototype, U0 = P.update;
  P.update = function (dt, pl) {
    try {
      if (!this.dead && !this.fleeing && this.scene?.state === "playing" && this.currentAttack !== "SIGNATURE") {
        this.__sigT = (this.__sigT ?? 5 + Math.random() * 3) - dt;
        const p = this.scene.player;
        if (this.__sigT <= 0 && !this.flying && this.state_ === "chase" && p && !p.dead && Math.hypot(p.x - this.x, p.y - this.y) < 430) { this.__sigT = (this.phase >= 2 ? 7 : 11) + Math.random() * 3; __bossSignature(this) }
      }
    } catch (e) { console.warn("[boss-sig]", e) }
    return U0.apply(this, arguments);
  };
}
function __bossSignature(b) {
  const S = b.scene, p = S.player, el = __bossEl(b), Pa = __FX.PAL[el], T = S.telegraphs;
  const base = Math.max(2, ...Object.values(b.data_.attacks || {}).map((a) => a?.damage ?? 0)), dmg = b.scaledDamage(Math.max(2, Math.round(base * .8)));
  b.state_ = "telegraph"; b.currentAttack = "SIGNATURE"; b.setVelocity(0, 0);
  let pending = 0;
  const done = () => { if (--pending <= 0 && !b.dead && b.currentAttack === "SIGNATURE") b.recover(900) };
  const hitC = (x, y, r) => { if (b.dead || p.dead || !S.damageSystem.circleHit(x, y, r, p.x, p.y, p.body.width / 2)) return; const l = Math.hypot(p.x - x, p.y - y) || 1; b.hitPlayer(dmg, { x: (p.x - x) / l, y: (p.y - y) / l }) };
  const hitR = (cx, cy, w, h, rot) => { if (b.dead || p.dead || !S.damageSystem.rectHit(cx, cy, w, h, rot, p.x, p.y)) return; const l = Math.hypot(p.x - b.x, p.y - b.y) || 1; b.hitPlayer(dmg, { x: (p.x - b.x) / l, y: (p.y - b.y) / l }) };
  const circ = (x, y, r, ms, delay, fx) => { pending++; S.time.delayedCall(delay, () => { if (b.dead) return done(); T.circle(x, y, r, ms, Pa.out, () => { if (!b.dead) { S.__fxBossEl = el; try { fx(x, y, r); hitC(x, y, r) } finally { S.__fxBossEl = null } } done() }) }) };
  const lane = (cx, cy, w, h, rot, ms, delay, fx) => { pending++; S.time.delayedCall(delay, () => { if (b.dead) return done(); T.rect(cx, cy, w, h, rot, ms, Pa.out, () => { if (!b.dead) { fx(cx, cy, w, h, rot); hitR(cx, cy, w, h, rot) } done() }) }) };
  // nome do golpe sobre o chefe
  try { const nm = __SIGN[el] ?? __SIGN.steel, t = typeof window.__L3G === "function" ? window.__L3G(nm[0], nm[1], nm[2]) : nm[0]; S.effects.floatText(b.x, b.y - b.displayHeight * .7, t, "#" + Pa.mid.toString(16).padStart(6, "0"), 11) } catch (e) {}
  S.audioRef?.play?.("sfx-boss-attack");
  const dx = p.x - b.x, dy = p.y - b.y, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, ang = Math.atan2(uy, ux);
  if (el === "fire") {
    for (let k = 0; k < 6; k++) circ(b.x + ux * (50 + k * 46), b.y + uy * (50 + k * 46), 30, 760, k * 130, (x, y) => { __FX.impact(S, x, y, "fire", 1.5); __sigColumn(S, x, y, "fire"); __BX.scorch(S, x, y, 30); __BX.stop(S, 30) });
  } else if (el === "ice") {
    for (let k = 0; k < 8; k++) { const a = k / 8 * 6.28; circ(p.x + Math.cos(a) * 74, p.y + Math.sin(a) * 52, 26, 900, 0, (x, y, r) => { __FX.impact(S, x, y, "ice", 1.2); __sigSpikes(S, x, y, r, 0xd8f2ff) }) }
    circ(p.x, p.y, 30, 1250, 0, (x, y, r) => { __FX.impact(S, x, y, "ice", 1.8); __sigSpikes(S, x, y, r * 1.4, 0xd8f2ff) });
  } else if (el === "shadow") {
    for (const s of [-1, 1]) lane(p.x, p.y, 380, 44, ang + s * .78, 880, s > 0 ? 160 : 0, (cx, cy, w, h, rot) => {
      const c = Math.cos(rot), n = Math.sin(rot);
      for (let k = -2; k <= 2; k++) __FX.impact(S, cx + c * k * w * .2, cy + n * k * w * .2, "shadow", .9);
      __FX.bolt(S, cx - c * w / 2, cy - n * w / 2, cx + c * w / 2, cy + n * w / 2, Pa.mid, 220); __BX.flash(S, Pa.out, 120, .2);
    });
  } else if (el === "poison" || el === "nature") {
    for (let k = 0; k < 6; k++) { const a = Math.random() * 6.28, d = k === 0 ? 0 : 40 + Math.random() * 70; circ(p.x + Math.cos(a) * d, p.y + Math.sin(a) * d * .75, 30, 820, k * 110, (x, y, r) => { __FX.impact(S, x, y, el, 1.4); el === "nature" ? __sigSpikes(S, x, y, r, 0x5a8a3a) : __BX.dust(S, x, y, 16, 0x5a8a3a, 6) }) }
  } else if (el === "arcane") {
    for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28 - 1.57; circ(p.x + Math.cos(a) * 80, p.y + Math.sin(a) * 58, 28, 1000, 0, (x, y) => __FX.impact(S, x, y, "arcane", 1.5)) }
    circ(p.x, p.y, 34, 1300, 0, (x, y) => { __FX.impact(S, x, y, "arcane", 2.2); __BX.flash(S, Pa.out, 140, .25) });
  } else if (el === "holy") {
    for (let k = 0; k < 4; k++) S.time.delayedCall(k * 320, () => { if (!b.dead) circ(p.x, p.y, 32, 700, 0, (x, y) => { __sigColumn(S, x, y, "holy"); __FX.impact(S, x, y, "holy", 1.4) }) }), pending++;
    S.time.delayedCall(4 * 320 + 10, () => { pending -= 4; pending <= 0 && done() });
  } else if (el === "lightning") {
    for (let k = -1; k <= 1; k++) { const a = ang + k * .38, len = 340; lane(b.x + Math.cos(a) * len / 2, b.y + Math.sin(a) * len / 2, len, 30, a, 680, Math.abs(k) * 120, (cx, cy, w, h, rot) => { const c = Math.cos(rot), n = Math.sin(rot); for (let q = 0; q < 2; q++) __FX.bolt(S, cx - c * w / 2, cy - n * w / 2, cx + c * w / 2, cy + n * w / 2, Pa.out, 240); __FX.impact(S, cx + c * w / 2, cy + n * w / 2, "lightning", 1.2) }) }
  } else {
    for (let k = 0; k < 3; k++) circ(b.x, b.y, 70 + k * 45, 700, k * 260, (x, y, r) => { __BX.dust(S, x, y, r * .6, 0x8a7a66, 14); __BX.crack(S, x, y, r * .7); __BX.stop(S, 40) });
  }
}
