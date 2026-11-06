/* ══ Efeitos visuais das habilidades extras (partículas do Phaser, anéis, brilhos, rastros) ═══════════════════
   Somam-se às animações que cada habilidade já tinha: no lançamento (Yh.execute) e nos projéteis (rastro). */
const __VX = {
  tex(S) {
    if (S.textures.exists("vx-soft")) return;
    const g = S.make.graphics({ x: 0, y: 0, add: !1 });
    g.fillStyle(16777215, 1).fillCircle(3, 3, 3); g.generateTexture("vx-dot", 6, 6); g.clear();
    for (let r = 12; r > 0; r--) g.fillStyle(16777215, .09).fillCircle(12, 12, r);
    g.generateTexture("vx-soft", 24, 24); g.clear();
    g.fillStyle(16777215, 1).fillTriangle(2, 0, 4, 4, 2, 10).fillTriangle(2, 0, 0, 4, 2, 10); g.generateTexture("vx-shard", 5, 10); g.clear();
    g.fillStyle(16777215, 1).fillEllipse(4, 2, 8, 4); g.generateTexture("vx-leaf", 8, 4); g.clear();
    g.fillStyle(16777215, 1).fillRect(0, 1, 8, 2).fillCircle(1, 2, 2).fillCircle(7, 2, 2); g.generateTexture("vx-bone", 9, 5); g.clear();
    g.fillStyle(16777215, 1).fillRect(0, 0, 1, 7); g.generateTexture("vx-spark", 1, 7); g.clear();
    for (let r = 16; r > 0; r--) g.fillStyle(16777215, .085).fillCircle(16, 16, r);
    g.generateTexture("vx-smoke", 32, 32); g.destroy();
  },
  emit(S, x, y, tex, o, n) {
    try {
      const life = o.lifespan?.max ?? o.lifespan ?? 600;
      const e = S.add.particles(0, 0, tex, { emitting: !1, ...o });
      e.setDepth(o.depth ?? y + 60);
      e.explode(n, x, y);
      S.time.delayedCall(life + 200, () => e.destroy());
      return e;
    } catch (err) { return null }
  },
  burst(S, x, y, col, n = 16, o = {}) {
    return __VX.emit(S, x, y, o.tex ?? "vx-dot", { speed: { min: o.s0 ?? 40, max: o.s1 ?? 160 }, angle: o.angle ?? { min: 0, max: 360 }, lifespan: { min: (o.life ?? 600) * .5, max: o.life ?? 600 },
      scale: { start: o.sc ?? .9, end: 0 }, alpha: { start: 1, end: 0 }, tint: col, blendMode: o.blend ?? "ADD", gravityY: o.g ?? 0, rotate: o.rot ? { min: 0, max: 360 } : 0 }, n);
  },
  rise(S, x, y, col, n = 12, o = {}) { return __VX.burst(S, x, y, col, n, { angle: { min: 250, max: 290 }, s0: 20, s1: 70, life: 900, g: -40, ...o }) },
  smoke(S, x, y, col, n = 10, o = {}) {
    return __VX.emit(S, x, y, "vx-smoke", { speed: { min: 10, max: o.sp ?? 50 }, lifespan: { min: 700, max: o.life ?? 1400 }, scale: { start: o.sc ?? 1.2, end: (o.sc ?? 1.2) * 2.2 },
      alpha: { start: o.a ?? .7, end: 0 }, tint: col, blendMode: o.blend ?? "NORMAL", angle: { min: 0, max: 360 } }, n);
  },
  ring(S, x, y, r, col, dur = 420, w = 3, follow) {
    const g = S.add.graphics().setDepth(y + 61);
    const t = { k: 0 };
    S.tweens.add({ targets: t, k: 1, duration: dur, ease: "Cubic.easeOut", onUpdate: () => { g.clear(); const R = 6 + r * t.k, fx = follow ? follow.x : x, fy = follow ? follow.y : y; g.lineStyle(w * (1 - t.k * .7), col, 1 - t.k).strokeCircle(fx, fy, R) }, onComplete: () => g.destroy() });
  },
  flash(S, x, y, col, s = .5, dur = 320) {
    __VX.tex(S);
    const im = S.add.image(x, y, "vx-soft").setTint(col).setScale(s * 3).setAlpha(.6).setDepth(y + 62);
    S.tweens.add({ targets: im, scale: s * 6, alpha: 0, duration: dur, ease: "Quad.easeOut", onComplete: () => im.destroy() });
  },
  streak(S, x1, y1, x2, y2, col, w = 4, dur = 260) {
    const g = S.add.graphics().setDepth(Math.max(y1, y2) + 61);
    const t = { a: 1 };
    S.tweens.add({ targets: t, a: 0, duration: dur, onUpdate: () => { g.clear(); g.lineStyle(w * t.a + 1, col, t.a).lineBetween(x1, y1, x2, y2); g.lineStyle(1, 16777215, t.a).lineBetween(x1, y1, x2, y2) }, onComplete: () => g.destroy() });
  },
  aura(S, P, col, ms, r = 22) {
    const g = S.add.graphics();
    const t0 = S.time.now;
    const up = () => {
      if (!g.active) return;
      const k = (S.time.now - t0) / ms;
      if (k >= 1 || !P.active) { g.destroy(); S.events.off("update", up); return }
      g.clear().setDepth(P.y + 30);
      const pul = 1 + Math.sin(S.time.now * .012) * .08;
      g.lineStyle(2, col, .7 * (1 - k * .5)).strokeCircle(P.x, P.y - 6, r * pul);
      g.fillStyle(col, .12 * (1 - k * .5)).fillCircle(P.x, P.y - 6, r * pul);
    };
    S.events.on("update", up);
  },
  orbit(S, P, tex, col, n, ms, r = 22) {
    const ims = [];
    for (let i = 0; i < n; i++) ims.push(S.add.image(P.x, P.y, tex).setTint(col).setScale(1.3));
    const t0 = S.time.now;
    const up = () => {
      const k = (S.time.now - t0) / ms;
      if (k >= 1 || !P.active) { ims.forEach(o => o.destroy()); S.events.off("update", up); return }
      ims.forEach((o, i) => { const a = S.time.now * .006 + i * Math.PI * 2 / n; o.setPosition(P.x + Math.cos(a) * r, P.y - 8 + Math.sin(a) * r * .55).setRotation(a + Math.PI / 2).setDepth(P.y + (Math.sin(a) > 0 ? 20 : -2)).setAlpha(1 - k * .4) });
    };
    S.events.on("update", up);
  },
  gather(S, x, y, col, n = 14, r = 46, dur = 360) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, d = r * (.7 + Math.random() * .5);
      const im = S.add.image(x + Math.cos(a) * d, y + Math.sin(a) * d, "vx-dot").setTint(col).setScale(.8).setDepth(y + 60);
      S.tweens.add({ targets: im, x, y, scale: .2, duration: dur * (.7 + Math.random() * .5), ease: "Quad.easeIn", onComplete: () => im.destroy() });
    }
  },
  repeat(S, ms, every, fn) { let n = Math.floor(ms / every); const ev = S.time.addEvent({ delay: every, repeat: n - 1, callback: () => { try { fn() } catch (e) { ev.remove() } } }); return ev },
  nearest(S, P, max = 260) { let b = null, bd = max; try { for (const e of S.combat.getTargets()) { if (!e || e.dead) continue; const d = Math.hypot(e.x - P.x, e.y - P.y); d < bd && (bd = d, b = e) } } catch (e) {} return b },
  rune(S, t, col, ms = 900) {
    const g = S.add.graphics();
    const t0 = S.time.now;
    const up = () => {
      const k = (S.time.now - t0) / ms;
      if (k >= 1 || !t.active) { g.destroy(); S.events.off("update", up); return }
      g.clear().setDepth(t.y + 70);
      const r = 18 - k * 4, a = S.time.now * .004;
      g.lineStyle(2, col, 1 - k).strokeCircle(t.x, t.y - 8, r);
      for (let i = 0; i < 4; i++) { const q = a + i * Math.PI / 2; g.lineBetween(t.x + Math.cos(q) * (r - 6), t.y - 8 + Math.sin(q) * (r - 6), t.x + Math.cos(q) * (r + 5), t.y - 8 + Math.sin(q) * (r + 5)) }
    };
    S.events.on("update", up);
  },
};
/* rastros dos projéteis lançados por estas habilidades */
const __VXTRAIL = {
  ET_ICE_COMET: { tex: "vx-shard", tint: [12580607, 16777215], sc: .9, freq: 18, life: 420 },
  ET_STARFALL: { tex: "vx-dot", tint: [16748330, 16765514, 16733440], sc: 1.3, freq: 14, life: 520 },
  ET_ARROW_STORM: { tex: "vx-spark", tint: [16769354, 16777215], sc: 1, freq: 30, life: 220 },
  ET_BONE_STORM: { tex: "vx-bone", tint: [14215368, 9764863], sc: .8, freq: 34, life: 300 },
  ET_DART_HAIL: { tex: "vx-dot", tint: [9425498, 13434726], sc: .6, freq: 26, life: 380, g: 60 },
};
{
  const SP0 = Kh.prototype.spawn;
  Kh.prototype.spawn = function (o) {
    const p = SP0.apply(this, arguments), S = this.scene, v = S.__vxT;
    try {
      if (v && S.time.now < v.until && !o.hostile && __VXTRAIL[v.id] && p?.img) {
        const c = __VXTRAIL[v.id];
        const e = S.add.particles(0, 0, c.tex, { follow: p.img, frequency: c.freq, lifespan: c.life, speed: { min: 4, max: 22 }, scale: { start: c.sc, end: 0 }, alpha: { start: .9, end: 0 }, tint: c.tint, blendMode: "ADD", gravityY: c.g ?? 0, rotate: { min: 0, max: 360 } });
        e.setDepth(p.img.depth - 1);
        p.__vx = e;
        const chk = S.time.addEvent({ delay: 60, loop: !0, callback: () => { if (!p.img.active) { chk.remove(); e.stop(); S.time.delayedCall(c.life + 80, () => e.destroy()); v.id === "ET_STARFALL" && (__VX.burst(S, p.x, p.y, [16748330, 16765514], 30, { s1: 220, life: 700 }), __VX.smoke(S, p.x, p.y, 4204832, 8), __VX.ring(S, p.x, p.y, 90, 16748330, 500, 4), S.cameraSys?.shake?.(.006, 180));
          v.id === "ET_ICE_COMET" && (__VX.burst(S, p.x, p.y, [12580607, 16777215], 18, { tex: "vx-shard", rot: 1, s1: 180, life: 520 }), __VX.ring(S, p.x, p.y, 58, 12580607, 380, 3)) } else e.setDepth(p.img.depth - 1) } });
      }
    } catch (err) {}
    return p;
  };
}
const __VXCAST = {
  ET_CHARGE(S, P, fd) { __VX.smoke(S, P.x, P.y + 8, 9068378, 6, { sc: .6 }); __VX.streak(S, P.x, P.y - 6, P.x + fd.x * 160, P.y - 6 + fd.y * 160, 13214282, 6, 300);
    S.time.delayedCall(230, () => { __VX.burst(S, P.x + fd.x * 10, P.y - 6, [15263976, 16765514], 18, { tex: "vx-spark", rot: 1, s1: 200, life: 380 }); __VX.ring(S, P.x, P.y, 40, 13214282, 300) }) },
  ET_CLAN_CRY(S, P) { for (let k = 0; k < 3; k++) S.time.delayedCall(k * 110, () => __VX.ring(S, P.x, P.y - 6, 140 - k * 25, 16765514, 420, 4)); __VX.rise(S, P.x, P.y - 10, [16765514, 16761165], 14); __VX.flash(S, P.x, P.y - 8, 16765514, .7) },
  ET_SPIN(S, P) { __VX.repeat(S, 2000, 110, () => { const a = Math.random() * 6.28; __VX.burst(S, P.x + Math.cos(a) * 34, P.y - 6 + Math.sin(a) * 22, [15263976, 16756810], 5, { tex: "vx-spark", rot: 1, s1: 120, life: 260 }) }); __VX.aura(S, P, 16756810, 2000, 40) },
  ET_AEGIS(S, P) { __VX.aura(S, P, 9425498, 6000, 20); __VX.burst(S, P.x, P.y - 8, [9425498, 16765514], 16, { tex: "vx-leaf", rot: 1, s1: 110, life: 800 }); __VX.flash(S, P.x, P.y - 8, 13434726, .6) },
  ET_TSUBAME(S, P, fd) { const x = P.x + fd.x * 40, y = P.y - 6 + fd.y * 40; __VX.burst(S, x, y, [16762052, 16777215], 18, { tex: "vx-leaf", rot: 1, s1: 140, life: 900, g: 30 });
    __VX.streak(S, x - fd.y * 30 - fd.x * 20, y + fd.x * 30, x + fd.y * 30 + fd.x * 20, y - fd.x * 30, 16777215, 5); S.time.delayedCall(170, () => __VX.streak(S, x + fd.y * 30 - fd.x * 20, y - fd.x * 30, x - fd.y * 30 + fd.x * 20, y + fd.x * 30, 16762052, 5)) },
  ET_PARRY(S, P) { __VX.flash(S, P.x, P.y - 8, 12640767, .8, 260); __VX.burst(S, P.x, P.y - 8, [12640767, 16777215], 20, { tex: "vx-spark", rot: 1, s0: 80, s1: 220, life: 300 }) },
  ET_QUAKE(S, P) { S.time.delayedCall(140, () => { __VX.burst(S, P.x, P.y, [7895160, 10066329], 24, { tex: "vx-shard", rot: 1, s1: 200, life: 800, g: 380, blend: "NORMAL" }); __VX.smoke(S, P.x, P.y + 4, 8812898, 12, { sc: 1, sp: 90 });
    const g = S.add.graphics().setDepth(P.y - 1); g.lineStyle(2, 1709330, .9); for (let k = 0; k < 7; k++) { const a = k * .9 + Math.random() * .4; let x = P.x, y = P.y; g.beginPath(); g.moveTo(x, y); for (let s = 0; s < 4; s++) { x += Math.cos(a + (Math.random() - .5)) * 18; y += Math.sin(a + (Math.random() - .5)) * 12; g.lineTo(x, y) } g.strokePath() }
    S.tweens.add({ targets: g, alpha: 0, delay: 900, duration: 700, onComplete: () => g.destroy() }) }) },
  ET_IRON_WALL(S, P) { __VX.aura(S, P, 10135736, 4000, 24); __VX.burst(S, P.x, P.y - 8, [10135736, 15263976], 18, { tex: "vx-spark", rot: 1, life: 400 }) },
  ET_CHARGED(S, P, fd) { __VX.gather(S, P.x + fd.x * 10, P.y - 8, 16769354, 16, 50, 420); S.time.delayedCall(380, () => { __VX.streak(S, P.x, P.y - 8, P.x + fd.x * 260, P.y - 8 + fd.y * 260, 16769354, 6, 280); __VX.flash(S, P.x + fd.x * 12, P.y - 8, 16769354, .5) }) },
  ET_BACKFLIP(S, P) { __VX.smoke(S, P.x, P.y + 6, 9068378, 6, { sc: .6 }); for (let k = 0; k < 4; k++) S.time.delayedCall(k * 50, () => { try { S.playerVisual?.spawnAfterimage?.() } catch (e) {} }); __VX.burst(S, P.x, P.y, [9095274, 16777215], 10, { life: 400 }) },
  ET_FENCE(S, P, fd) { const x = P.x + fd.x * 70, y = P.y + fd.y * 70; S.time.delayedCall(160, () => { __VX.burst(S, x, y, [11561544, 13421772], 18, { tex: "vx-shard", rot: 1, s1: 120, life: 600, g: 220, blend: "NORMAL" }); __VX.smoke(S, x, y + 6, 9068378, 6, { sc: .7 }) }) },
  ET_ARROW_STORM(S, P, fd) { __VX.burst(S, P.x + fd.x * 14, P.y - 8 + fd.y * 14, [16769354, 16777215], 16, { tex: "vx-spark", rot: 1, life: 260, s1: 220 }) },
  ET_ICE_COMET(S, P) { __VX.smoke(S, P.x, P.y - 8, 12580607, 5, { sc: .5, a: .4, blend: "ADD" }); __VX.flash(S, P.x, P.y - 8, 12580607, .45) },
  ET_SUN_MIRROR(S, P) { __VX.flash(S, P.x, P.y - 8, 16765514, .9); const g = S.add.graphics(), t0 = S.time.now;
    const up = () => { const k = (S.time.now - t0) / 3000; if (k >= 1 || !P.active) { g.destroy(); S.events.off("update", up); return } g.clear().setDepth(P.y + 30); const a0 = S.time.now * .003;
      for (let i = 0; i < 10; i++) { const a = a0 + i * Math.PI / 5; g.lineStyle(2, 16765514, .55 * (1 - k * .5)).lineBetween(P.x + Math.cos(a) * 14, P.y - 8 + Math.sin(a) * 14, P.x + Math.cos(a) * 30, P.y - 8 + Math.sin(a) * 30) } g.lineStyle(2, 16777215, .5).strokeCircle(P.x, P.y - 8, 14) };
    S.events.on("update", up) },
  ET_ICE_PRISON(S, P) { __VX.flash(S, P.x, P.y - 8, 10483967, 1); __VX.burst(S, P.x, P.y - 6, [10483967, 16777215], 30, { tex: "vx-shard", rot: 1, s1: 220, life: 700 }); __VX.ring(S, P.x, P.y, 110, 10483967, 520, 4); __VX.smoke(S, P.x, P.y, 13434879, 10, { a: .35, blend: "ADD" }) },
  ET_STARFALL(S, P, fd) { __VX.gather(S, P.x + fd.x * 12, P.y - 10, 16748330, 12, 40, 260); __VX.flash(S, P.x + fd.x * 12, P.y - 10, 16748330, .6) },
  ET_DEATH_MARK(S, P) { const t = __VX.nearest(S, P, 300); if (t) { __VX.rune(S, t, 16734794, 1600); __VX.burst(S, t.x, t.y - 8, [16734794, 16777215], 14, { tex: "vx-spark", rot: 1, life: 400 }) } },
  ET_ROLL(S, P) { __VX.smoke(S, P.x, P.y + 6, 7364740, 7, { sc: .6 }); for (let k = 0; k < 5; k++) S.time.delayedCall(k * 40, () => { try { S.playerVisual?.spawnAfterimage?.() } catch (e) {} }) },
  ET_TOXIC_SMOKE(S, P) { const x = P.x, y = P.y; __VX.repeat(S, 4000, 260, () => { __VX.smoke(S, x + (Math.random() - .5) * 120, y + (Math.random() - .5) * 80, 7000186, 2, { sc: 1.6, a: .5, life: 1600 }); __VX.rise(S, x + (Math.random() - .5) * 100, y + (Math.random() - .5) * 60, [10079334, 13434726], 2, { tex: "vx-dot", sc: .5 }) }) },
  ET_BLADE_DANCE(S, P, fd) { for (let k = 0; k < 5; k++) S.time.delayedCall(k * 110, () => { const a = Math.atan2(fd.y, fd.x) + (Math.random() - .5) * 1.4, x = P.x + Math.cos(a) * 36, y = P.y - 6 + Math.sin(a) * 36;
    __VX.streak(S, x - Math.sin(a) * 18, y + Math.cos(a) * 18, x + Math.sin(a) * 18, y - Math.cos(a) * 18, 13159640, 4, 200); __VX.burst(S, x, y, [13159640, 16777215], 6, { tex: "vx-spark", rot: 1, life: 240 }) }) },
  ET_PLAGUE(S, P, fd) { const x = P.x + fd.x * 90, y = P.y + fd.y * 90; __VX.repeat(S, 5000, 220, () => { __VX.rise(S, x + (Math.random() - .5) * 90, y + (Math.random() - .5) * 60, [10079334, 7000186], 2, { tex: "vx-soft", sc: .5, blend: "ADD" }); Math.random() < .3 && __VX.smoke(S, x, y, 5937226, 1, { sc: 1.6, a: .35 }) }) },
  ET_BONE_ARMOR(S, P) { __VX.orbit(S, P, "vx-bone", 14215368, 5, 6000, 24); __VX.burst(S, P.x, P.y - 8, [14215368, 16777215], 14, { tex: "vx-bone", rot: 1, life: 500 }) },
  ET_REAP(S, P) { __VX.ring(S, P.x, P.y - 6, 80, 5963696, 380, 4); S.time.delayedCall(200, () => __VX.gather(S, P.x, P.y - 10, 5963696, 18, 80, 520)); __VX.burst(S, P.x, P.y - 6, [5963696, 16777215], 14, { tex: "vx-spark", rot: 1, s1: 220, life: 300 }) },
  ET_BONE_STORM(S, P) { __VX.burst(S, P.x, P.y - 8, [14215368, 9764863], 20, { tex: "vx-bone", rot: 1, s1: 160, life: 500 }); __VX.ring(S, P.x, P.y - 6, 60, 9764863, 360, 3); __VX.flash(S, P.x, P.y - 8, 9764863, .5) },
  ET_DOUBLE_SHOT(S, P, fd) { __VX.burst(S, P.x + fd.x * 14, P.y - 8 + fd.y * 14, [14209730, 16777215], 10, { tex: "vx-spark", rot: 1, life: 220 }) },
  ET_CAMPFIRE(S, P) { const x = P.x, y = P.y + 4; __VX.flash(S, x, y - 6, 16748330, .6); __VX.repeat(S, 6000, 140, () => __VX.rise(S, x + (Math.random() - .5) * 18, y - 4, [16748330, 16765514, 16733440], 2, { sc: .6, s1: 50, life: 1000 })) },
  ET_COORD(S, P) { const t = __VX.nearest(S, P, 320); if (t) { __VX.rune(S, t, 16765514, 4000); __VX.streak(S, P.x, P.y - 8, t.x, t.y - 8, 16765514, 2, 360) } __VX.rise(S, P.x, P.y - 10, [16765514], 8) },
  ET_PROTECT_HOWL(S, P) { for (let k = 0; k < 3; k++) S.time.delayedCall(k * 120, () => __VX.ring(S, P.x, P.y - 6, 120 - k * 20, 10483967, 460, 3)); __VX.aura(S, P, 10483967, 5000, 20) },
  ET_DART_HAIL(S, P, fd) { __VX.smoke(S, P.x + fd.x * 14, P.y - 8 + fd.y * 14, 9425498, 3, { sc: .4, a: .4 }) },
  ET_BARK(S, P) { __VX.aura(S, P, 9134650, 6000, 20); __VX.burst(S, P.x, P.y - 8, [9134650, 6710835], 16, { tex: "vx-shard", rot: 1, life: 600, blend: "NORMAL" }); __VX.burst(S, P.x, P.y - 8, [5287994], 10, { tex: "vx-leaf", rot: 1, life: 800 }) },
  ET_WAR_DANCE(S, P) { __VX.repeat(S, 900, 90, () => { const a = Math.random() * 6.28; __VX.burst(S, P.x + Math.cos(a) * 30, P.y - 6 + Math.sin(a) * 20, [16742954, 5287994, 16765514], 3, { tex: "vx-leaf", rot: 1, life: 600, s1: 90 }) }); __VX.ring(S, P.x, P.y - 6, 60, 16742954, 900, 3) },
  ET_JAGUAR(S, P, fd) { const a = Math.atan2(fd.y, fd.x); for (let k = -1; k <= 1; k++) { const ox = -Math.sin(a) * k * 7, oy = Math.cos(a) * k * 7; S.time.delayedCall(60 + k * 30, () => __VX.streak(S, P.x + ox, P.y - 8 + oy, P.x + ox + fd.x * 120, P.y - 8 + oy + fd.y * 120, 16756810, 3, 360)) }
    __VX.smoke(S, P.x, P.y + 6, 9068378, 6, { sc: .6 }) },
  ET_BLOOD_HOWL(S, P) { for (let k = 0; k < 3; k++) S.time.delayedCall(k * 120, () => __VX.ring(S, P.x, P.y - 6, 120 - k * 20, 14365530, 460, 4)); __VX.smoke(S, P.x, P.y - 6, 10489892, 8, { a: .4, blend: "ADD" }); __VX.flash(S, P.x, P.y - 8, 14365530, .8) },
  ET_OAK_RING(S, P) { for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5; __VX.burst(S, P.x + Math.cos(a) * 70, P.y + Math.sin(a) * 50, [5287994, 9134650], 5, { tex: "vx-leaf", rot: 1, life: 900, g: 40 }) } __VX.ring(S, P.x, P.y, 75, 5287994, 500, 3) },
  ET_MISTLETOE(S, P, fd) { __VX.burst(S, P.x + fd.x * 30, P.y - 8 + fd.y * 30, [16765514, 16777215], 14, { tex: "vx-spark", rot: 1, life: 300 }); __VX.burst(S, P.x, P.y - 8, [16777215, 5287994], 12, { tex: "vx-leaf", rot: 1, life: 900, g: 40 }) },
  ET_BEAR(S, P) { __VX.flash(S, P.x, P.y - 10, 9134650, 1.2, 500); __VX.smoke(S, P.x, P.y + 4, 8812898, 16, { sc: 1.1, sp: 110 }); for (let k = 0; k < 3; k++) S.time.delayedCall(k * 140, () => __VX.ring(S, P.x, P.y - 6, 150, 9134650, 500, 5)); S.cameraSys?.shake?.(.012, 320) },
};
{
  const EX0 = Yh.prototype.execute;
  Yh.prototype.execute = function (d) {
    const S = this.scene, f = d && __VXCAST[d.id];
    f && (S.__vxT = { id: d.id, until: S.time.now + 700 });
    const r = EX0.apply(this, arguments);
    if (f) try { __VX.tex(S); const fd = this.facingDir(); f(S, S.player, fd) } catch (e) { console.warn("[vfx]", d.id, e) }
    return r;
  };
}
/* ícones próprios das habilidades extras (assets/pixel-art/ui/icons/<ID>.png) */
{
  const IDS = Object.keys(__VXCAST);
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try { const L = this.load, op = L.path; L.setPath(""); for (const id of IDS) this.textures.exists("ix-" + id) || L.image("ix-" + id, `assets/pixel-art/ui/icons/${id}.png`); L.setPath(op);
      L.once("complete", () => { for (const id of IDS) Ye[id] && this.textures.exists("ix-" + id) && (Ye[id].icon = "ix-" + id) }) } catch (e) {}
    return r;
  };
}
