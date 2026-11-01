/* ══ Efeitos elementais (fogo, gelo, veneno, arcano, sombra, sagrado, raio) ══
   Biblioteca única usada pelos projéteis, impactos, armas mágicas e estados dos alvos.
   Só partículas e luz do próprio Phaser (sem biblioteca extra); quantidade reduzida no celular. */
const __FX = {
  q: 1, live: 0, CAP: 70,
  PAL: {
    fire: { core: 0xfff4c8, mid: 0xffa83a, out: 0xff4a12, deep: 0x8a1a08, smoke: 0x2e2622, light: 0xff8a34 },
    ice: { core: 0xffffff, mid: 0xc8eeff, out: 0x6cc0ff, deep: 0x2a6ab8, smoke: 0xd8f2ff, light: 0x8fd4ff },
    poison: { core: 0xf0ffc0, mid: 0x9ce64e, out: 0x4a9a2a, deep: 0x1e4a14, smoke: 0x5a8a3a, light: 0x9ce64e },
    arcane: { core: 0xffffff, mid: 0xd2a8ff, out: 0x8250ff, deep: 0x3a1a8a, smoke: 0x6a4ab0, light: 0xa77cff },
    shadow: { core: 0xe6c8ff, mid: 0x9050c8, out: 0x40186a, deep: 0x12061e, smoke: 0x1a0e24, light: 0x8a4ad0 },
    holy: { core: 0xffffff, mid: 0xfff2b0, out: 0xffc94a, deep: 0xb07a18, smoke: 0xfff4d0, light: 0xffe08a },
    lightning: { core: 0xffffff, mid: 0xd4ecff, out: 0x74a8ff, deep: 0x2a4ab0, smoke: 0xbcd8ff, light: 0xa8ccff },
    nature: { core: 0xf2ffd8, mid: 0x9ade60, out: 0x48a03e, deep: 0x1c4a1c, smoke: 0x6a8a4a, light: 0xa6e47a },
    steel: { core: 0xffffff, mid: 0xfff0c8, out: 0xd8b878, deep: 0x7a6040, smoke: 0x9a8a78, light: 0xffe6b0 },
  },
  ok() { return this.live < this.CAP },
  n(k) { return Math.max(1, Math.round(k * this.q)) },
  tex(S) {
    if (S.textures.exists("fx2-flame")) return;
    const mk = (k, w, h, fn) => { const t = S.textures.createCanvas(k, w, h), g = t.getContext(); fn(g, w, h); t.refresh() };
    const rad = (g, x, y, r, stops) => { const q = g.createRadialGradient(x, y, 0, x, y, r); for (const [o, c] of stops) q.addColorStop(o, c); return q };
    // chama: gota com núcleo claro
    mk("fx2-flame", 16, 24, (g) => {
      g.fillStyle = rad(g, 8, 15, 10, [[0, "rgba(255,255,255,1)"], [.45, "rgba(255,255,255,.75)"], [1, "rgba(255,255,255,0)"]]);
      g.beginPath(); g.moveTo(8, 0); g.bezierCurveTo(13, 8, 16, 13, 16, 17); g.arc(8, 17, 8, 0, Math.PI); g.bezierCurveTo(0, 13, 3, 8, 8, 0); g.fill();
    });
    mk("fx2-dot", 12, 12, (g) => { g.fillStyle = rad(g, 6, 6, 6, [[0, "rgba(255,255,255,1)"], [.35, "rgba(255,255,255,.8)"], [1, "rgba(255,255,255,0)"]]); g.fillRect(0, 0, 12, 12) });
    mk("fx2-spark", 14, 4, (g) => { const q = g.createLinearGradient(0, 0, 14, 0); q.addColorStop(0, "rgba(255,255,255,0)"); q.addColorStop(.7, "rgba(255,255,255,.9)"); q.addColorStop(1, "rgba(255,255,255,1)"); g.fillStyle = q; g.fillRect(0, 1, 14, 2) });
    mk("fx2-shard", 8, 16, (g) => {
      g.fillStyle = "rgba(255,255,255,.95)"; g.beginPath(); g.moveTo(4, 0); g.lineTo(8, 7); g.lineTo(4, 16); g.lineTo(0, 7); g.closePath(); g.fill();
      g.fillStyle = "rgba(200,230,255,.7)"; g.beginPath(); g.moveTo(4, 0); g.lineTo(8, 7); g.lineTo(4, 16); g.closePath(); g.fill();
    });
    mk("fx2-flake", 9, 9, (g) => { g.strokeStyle = "rgba(255,255,255,1)"; g.lineWidth = 1; g.beginPath(); for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; g.moveTo(4.5 - Math.cos(a) * 4, 4.5 - Math.sin(a) * 4); g.lineTo(4.5 + Math.cos(a) * 4, 4.5 + Math.sin(a) * 4) } g.stroke(); g.fillStyle = "#fff"; g.fillRect(4, 4, 1, 1) });
    mk("fx2-smoke", 32, 32, (g) => {
      for (let k = 0; k < 7; k++) { const x = 9 + Math.random() * 14, y = 9 + Math.random() * 14, r = 7 + Math.random() * 7; g.fillStyle = rad(g, x, y, r, [[0, "rgba(255,255,255,.22)"], [1, "rgba(255,255,255,0)"]]); g.fillRect(0, 0, 32, 32) }
    });
    mk("fx2-ring", 64, 64, (g) => { g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 3; g.beginPath(); g.arc(32, 32, 28, 0, 7); g.stroke(); g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 7; g.beginPath(); g.arc(32, 32, 27, 0, 7); g.stroke() });
    mk("fx2-bubble", 10, 10, (g) => { g.strokeStyle = "rgba(255,255,255,.9)"; g.lineWidth = 1.2; g.beginPath(); g.arc(5, 5, 3.8, 0, 7); g.stroke(); g.fillStyle = "rgba(255,255,255,.9)"; g.fillRect(3, 3, 1.5, 1.5) });
    mk("fx2-star", 11, 11, (g) => { g.fillStyle = rad(g, 5.5, 5.5, 5.5, [[0, "rgba(255,255,255,1)"], [1, "rgba(255,255,255,0)"]]); g.beginPath(); g.moveTo(5.5, 0); g.lineTo(6.6, 4.4); g.lineTo(11, 5.5); g.lineTo(6.6, 6.6); g.lineTo(5.5, 11); g.lineTo(4.4, 6.6); g.lineTo(0, 5.5); g.lineTo(4.4, 4.4); g.closePath(); g.fill() });
  },
  /* emissor de partículas avulso; criado em (0,0) e disparado em coordenadas do mundo */
  em(S, tex, cfg, n, x, y, depth) {
    if (!this.ok()) return null;
    try {
      const e = S.add.particles(0, 0, tex, { ...cfg, emitting: !1 });
      e.setDepth(depth ?? y + 40);
      this.live++;
      e.explode(this.n(n), x, y);
      const life = (cfg.lifespan?.max ?? cfg.lifespan ?? 800) + 80;
      S.time.delayedCall(life, () => { this.live--; e.destroy() });
      return e;
    } catch (err) { return null }
  },
  glow(S, x, y, col, s = .3, dur = 260, a = .8, depth) {
    if (!S.textures.exists("light")) return;
    const o = S.add.image(x, y, "light").setBlendMode(j.BlendModes.ADD).setTint(col).setScale(s * .6).setAlpha(a).setDepth(depth ?? y + 41);
    S.tweens.add({ targets: o, scale: s, alpha: 0, duration: dur, ease: "Quad.easeOut", onComplete: () => o.destroy() });
  },
  ring(S, x, y, col, r = 40, dur = 360, depth) {
    const o = S.add.image(x, y, "fx2-ring").setBlendMode(j.BlendModes.ADD).setTint(col).setScale(.1).setAlpha(.95).setDepth(depth ?? y + 40);
    S.tweens.add({ targets: o, scale: r / 30, alpha: 0, duration: dur, ease: "Cubic.easeOut", onComplete: () => o.destroy() });
  },
  /* raio em zigue-zague */
  bolt(S, x1, y1, x2, y2, col = 0xbfe0ff, dur = 180) {
    const g = S.add.graphics().setBlendMode(j.BlendModes.ADD).setDepth(Math.max(y1, y2) + 45), pts = [[x1, y1]], n = Math.max(4, Math.hypot(x2 - x1, y2 - y1) / 14 | 0);
    for (let k = 1; k < n; k++) { const t = k / n, nx = -(y2 - y1), ny = x2 - x1, l = Math.hypot(nx, ny) || 1, o = (Math.random() - .5) * 18; pts.push([x1 + (x2 - x1) * t + nx / l * o, y1 + (y2 - y1) * t + ny / l * o]) }
    pts.push([x2, y2]);
    const draw = (a) => { g.clear(); for (const [w, c, al] of [[6, col, .25], [3, col, .7], [1.2, 0xffffff, 1]]) { g.lineStyle(w, c, al * a); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts) g.lineTo(p[0], p[1]); g.strokePath() } };
    draw(1);
    S.tweens.addCounter({ from: 1, to: 0, duration: dur, onUpdate: (tw) => draw(tw.getValue()), onComplete: () => g.destroy() });
  },
  /* impacto do elemento (s = tamanho; 1 = acerto normal, 2+ = explosão) */
  impact(S, x, y, el, s = 1) {
    const P = this.PAL[el]; if (!P) return;
    this.tex(S);
    const d = y + 40;
    this.glow(S, x, y, P.light, .2 * s, 300, .75, d + 1);
    if (el === "fire") {
      this.em(S, "fx2-flame", { speed: { min: 30 * s, max: 120 * s }, angle: { min: 0, max: 360 }, lifespan: { min: 260, max: 520 }, scale: { start: .6 * s, end: .1 }, alpha: { start: .65, end: 0 }, tint: [P.mid, P.out, P.deep], gravityY: -120, blendMode: "ADD" }, 10 * s, x, y, d);
      this.em(S, "fx2-spark", { speed: { min: 80 * s, max: 220 * s }, angle: { min: 0, max: 360 }, rotate: { onEmit: (p) => Math.atan2(p.velocityY, p.velocityX) * 57.3 }, lifespan: { min: 200, max: 420 }, scale: { start: .8, end: .2 }, alpha: { start: .7, end: 0 }, tint: [P.core, P.mid], gravityY: 160, blendMode: "ADD" }, 6 * s, x, y, d);
      this.em(S, "fx2-smoke", { speed: { min: 10, max: 40 }, angle: { min: 200, max: 340 }, lifespan: { min: 600, max: 1000 }, scale: { start: .5 * s, end: 1.3 * s }, alpha: { start: .55, end: 0 }, tint: P.smoke, gravityY: -40 }, 3 * s, x, y - 4, d - 1);
    } else if (el === "ice") {
      this.em(S, "fx2-shard", { speed: { min: 60 * s, max: 170 * s }, angle: { min: 0, max: 360 }, rotate: { onEmit: (p) => Math.atan2(p.velocityY, p.velocityX) * 57.3 + 90 }, lifespan: { min: 300, max: 560 }, scale: { start: .9 * s, end: .3 }, alpha: { start: .7, end: 0 }, tint: [P.core, P.mid, P.out], gravityY: 200 }, 8 * s, x, y, d);
      this.em(S, "fx2-flake", { speed: { min: 10, max: 60 * s }, angle: { min: 0, max: 360 }, rotate: { min: 0, max: 360 }, lifespan: { min: 500, max: 900 }, scale: { start: 1, end: .4 }, alpha: { start: .95, end: 0 }, tint: P.core, gravityY: 30, blendMode: "ADD" }, 7 * s, x, y, d);
      this.em(S, "fx2-smoke", { speed: { min: 8, max: 30 }, angle: { min: 0, max: 360 }, lifespan: { min: 500, max: 900 }, scale: { start: .4 * s, end: 1.1 * s }, alpha: { start: .45, end: 0 }, tint: P.smoke, blendMode: "ADD" }, 3 * s, x, y, d - 1);
      this.ring(S, x, y, P.mid, 22 * s, 300, d);
    } else if (el === "poison") {
      this.em(S, "fx2-bubble", { speed: { min: 20, max: 70 * s }, angle: { min: 200, max: 340 }, lifespan: { min: 400, max: 800 }, scale: { start: .6, end: 1.2 }, alpha: { start: .7, end: 0 }, tint: [P.core, P.mid], gravityY: -50 }, 8 * s, x, y, d);
      this.em(S, "fx2-dot", { speed: { min: 40 * s, max: 130 * s }, angle: { min: 0, max: 360 }, lifespan: { min: 250, max: 480 }, scale: { start: .7, end: .1 }, alpha: { start: .7, end: 0 }, tint: [P.mid, P.out], gravityY: 220 }, 8 * s, x, y, d);
      this.em(S, "fx2-smoke", { speed: { min: 6, max: 26 }, angle: { min: 0, max: 360 }, lifespan: { min: 700, max: 1200 }, scale: { start: .5 * s, end: 1.4 * s }, alpha: { start: .5, end: 0 }, tint: P.smoke }, 3 * s, x, y, d - 1);
    } else if (el === "lightning") {
      for (let k = 0; k < 2 + s; k++) { const a = Math.random() * 6.3, r = 18 + Math.random() * 22 * s; this.bolt(S, x, y, x + Math.cos(a) * r, y + Math.sin(a) * r, P.out, 160) }
      this.em(S, "fx2-spark", { speed: { min: 100, max: 260 * s }, angle: { min: 0, max: 360 }, rotate: { onEmit: (p) => Math.atan2(p.velocityY, p.velocityX) * 57.3 }, lifespan: { min: 120, max: 300 }, scale: { start: .9, end: .2 }, alpha: { start: .7, end: 0 }, tint: [P.core, P.mid], blendMode: "ADD" }, 8 * s, x, y, d);
    } else {
      // arcano, sombra, sagrado
      const tx = el === "holy" ? "fx2-star" : "fx2-dot";
      this.em(S, tx, { speed: { min: 50 * s, max: 160 * s }, angle: { min: 0, max: 360 }, lifespan: { min: 260, max: 560 }, scale: { start: .9 * s, end: 0 }, alpha: { start: .7, end: 0 }, tint: [P.mid, P.out, P.deep], blendMode: "ADD" }, 12 * s, x, y, d);
      this.em(S, "fx2-smoke", { speed: { min: 8, max: 36 }, angle: { min: 0, max: 360 }, lifespan: { min: 500, max: 900 }, scale: { start: .4 * s, end: 1.2 * s }, alpha: { start: el === "shadow" ? .7 : .4, end: 0 }, tint: el === "shadow" ? P.deep : P.smoke, blendMode: el === "shadow" ? "NORMAL" : "ADD" }, 3 * s, x, y, d - 1);
      this.ring(S, x, y, P.mid, 20 * s, 320, d);
    }
  },
  /* configuração de rastro contínuo por elemento (segue um alvo) */
  trailCfg(el, s = 1) {
    const P = this.PAL[el];
    switch (el) {
      case "fire": return [["fx2-flame", { frequency: 16 / this.q, lifespan: { min: 180, max: 340 }, speed: { min: 5, max: 30 }, angle: { min: 0, max: 360 }, scale: { start: .75 * s, end: .1 }, alpha: { start: .7, end: 0 }, tint: [P.mid, P.out, P.deep], gravityY: -90, blendMode: "ADD" }],
        ["fx2-smoke", { frequency: 70 / this.q, lifespan: { min: 400, max: 700 }, speed: { min: 4, max: 16 }, scale: { start: .25 * s, end: .8 * s }, alpha: { start: .35, end: 0 }, tint: P.smoke, gravityY: -30 }]];
      case "ice": return [["fx2-dot", { frequency: 18 / this.q, lifespan: { min: 200, max: 380 }, speed: { min: 2, max: 18 }, scale: { start: .8 * s, end: .1 }, alpha: { start: .7, end: 0 }, tint: [P.mid, P.out, P.deep], blendMode: "ADD" }],
        ["fx2-flake", { frequency: 55 / this.q, lifespan: { min: 400, max: 700 }, speed: { min: 6, max: 26 }, angle: { min: 0, max: 360 }, rotate: { min: 0, max: 360 }, scale: { start: .9, end: .3 }, alpha: { start: .9, end: 0 }, tint: P.core, gravityY: 25, blendMode: "ADD" }]];
      case "poison": return [["fx2-dot", { frequency: 20 / this.q, lifespan: { min: 220, max: 420 }, speed: { min: 2, max: 14 }, scale: { start: .75 * s, end: .1 }, alpha: { start: .7, end: 0 }, tint: [P.mid, P.out, P.deep] }],
        ["fx2-bubble", { frequency: 80 / this.q, lifespan: { min: 400, max: 700 }, speed: { min: 6, max: 20 }, angle: { min: 230, max: 310 }, scale: { start: .5, end: 1 }, alpha: { start: .85, end: 0 }, tint: P.mid }]];
      case "lightning": return [["fx2-spark", { frequency: 24 / this.q, lifespan: { min: 90, max: 200 }, speed: { min: 30, max: 90 }, angle: { min: 0, max: 360 }, rotate: { onEmit: (p) => Math.atan2(p.velocityY, p.velocityX) * 57.3 }, scale: { start: .8, end: .2 }, alpha: { start: .7, end: 0 }, tint: [P.core, P.mid], blendMode: "ADD" }]];
      case "shadow": return [["fx2-smoke", { frequency: 30 / this.q, lifespan: { min: 300, max: 560 }, speed: { min: 4, max: 18 }, scale: { start: .35 * s, end: .9 * s }, alpha: { start: .7, end: 0 }, tint: P.deep }],
        ["fx2-dot", { frequency: 30 / this.q, lifespan: { min: 200, max: 400 }, speed: { min: 4, max: 20 }, scale: { start: .6 * s, end: 0 }, alpha: { start: .7, end: 0 }, tint: [P.mid, P.out, P.deep], blendMode: "ADD" }]];
      default: return [["fx2-dot", { frequency: 18 / this.q, lifespan: { min: 200, max: 400 }, speed: { min: 4, max: 24 }, scale: { start: .8 * s, end: 0 }, alpha: { start: .7, end: 0 }, tint: [P.mid, P.out, P.deep], blendMode: "ADD" }],
        [el === "holy" ? "fx2-star" : "fx2-dot", { frequency: 60 / this.q, lifespan: { min: 300, max: 600 }, speed: { min: 10, max: 34 }, angle: { min: 0, max: 360 }, scale: { start: .7, end: 0 }, alpha: { start: 1, end: 0 }, tint: P.core, blendMode: "ADD" }]];
    }
  },
  /* rastro + núcleo de luz que seguem um objeto até ele sumir */
  follow(S, obj, el, o = {}) {
    const P = this.PAL[el]; if (!P || !obj) return null;
    this.tex(S);
    const s = o.size ?? 1, ems = [], ox = o.ox ?? 0, oy = o.oy ?? 0;
    for (const [tex, cfg] of this.trailCfg(el, s)) {
      if (!this.ok()) break;
      try { const z = o.zone ? { emitZone: { type: "random", source: new j.Geom.Rectangle(-o.zone.w / 2, -o.zone.h / 2, o.zone.w, o.zone.h) } } : {}; const e = S.add.particles(0, 0, tex, { ...cfg, ...z, follow: obj, followOffset: { x: ox, y: oy } }); this.live++; ems.push(e) } catch (err) {}
    }
    const gl = o.light === !1 || !S.textures.exists("light") ? null : S.add.image(obj.x, obj.y, "light").setBlendMode(j.BlendModes.ADD).setTint(P.light).setScale((o.lightScale ?? .22) * s).setAlpha(o.lightAlpha ?? .75);
    const core = o.core && S.textures.exists("light") ? S.add.image(obj.x, obj.y, "light").setBlendMode(j.BlendModes.ADD).setTint(P.core).setScale(.035 * s).setAlpha(.9) : null;
    let t = 0, dead = !1;
    const up = (tm, dt) => {
      if (dead) return;
      if (!obj.active || obj.visible === !1 && !o.keepHidden) return h.stop();
      t += dt;
      const x = obj.x + ox, y = obj.y + oy, dp = (o.depth ?? (obj.depth ?? y)) + 1;
      for (const e of ems) e.setDepth(dp);
      gl && gl.setPosition(x, y).setDepth(dp + .5).setAlpha((o.lightAlpha ?? .75) * (.85 + Math.sin(t * .02) * .15));
      core && core.setPosition(x, y).setDepth(dp + .6);
    };
    const h = {
      ems, stop: () => {
        if (dead) return; dead = !0; S.events.off("update", up); S.events.off("shutdown", h.stop);
        for (const e of ems) { try { e.stop() } catch (err) {} S.time.delayedCall(800, () => { this.live--; e.destroy() }) }
        gl?.destroy(); core?.destroy();
      },
    };
    S.events.on("update", up);
    S.events.once("shutdown", () => h.stop());
    obj.once?.("destroy", () => h.stop());
    return h;
  },
};

/* qual elemento: estado da arma, nome da textura/habilidade, cor */
function __fxHue(c) { const r = (c >> 16 & 255) / 255, g = (c >> 8 & 255) / 255, b = (c & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < .18 || mx < .25) return null; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; return h < 0 ? h + 360 : h }
function __fxElOf(o = {}) {
  const st = o.status?.key ?? o.status;
  if (st === "BURN") return "fire"; if (st === "CHILL") return "ice"; if (st === "POISON") return "poison";
  const s = `${o.texture ?? ""} ${o.id ?? ""} ${o.name ?? ""}`.toLowerCase();
  if (/fire|flame|ember|meteor|lava|magma|inferno|pyre|burn|blaze|dragon_heart|sun_mirror|solar/.test(s)) return "fire";
  if (/ice|frost|frozen|snow|comet|glacial|winter|boreal|chill|blizzard|starfall/.test(s)) return "ice";
  if (/root|thorn|nature|wild|vine|entangl|leaf|oak|mistletoe|bark/.test(s)) return "nature";
  if (/poison|venom|plague|toxic|acid|dart|blowgun/.test(s)) return "poison";
  if (/consecra|judg|smite|aegis|guardian|kiai|iron_skin|shield/.test(s)) return "holy";
  if (/thunder|lightning|shock|storm|tupa|spark/.test(s)) return "lightning";
  if (/shadow|dark|void|soul|bone|skull|necro|grave|crypt|marrow|grim|curse|abyss/.test(s)) return "shadow";
  if (/holy|light|divine|bless|heal/.test(s)) return "holy";
  const h = o.tint && o.tint !== 0xffffff ? __fxHue(o.tint) : null;
  if (h != null) return h < 45 || h >= 340 ? "fire" : h < 70 ? "holy" : h < 160 ? "poison" : h < 235 ? "ice" : "arcane";
  if (/bolt|arcane|magic|orb/.test(s) || o.damageType === "magical") return "arcane";
  return null;
}

/* qualidade: celular / tela de toque fica com ~55% das partículas */
function __fxQuality(S) {
  try { const touch = S.game.inputManager?.device === "touch" || (navigator.maxTouchPoints > 0 && Math.min(innerWidth, innerHeight) < 600); __FX.q = touch ? .55 : 1; __FX.CAP = touch ? 40 : 70 } catch (e) {}
}

/* ─── projéteis: núcleo brilhante, rastro e impacto do elemento ─── */
{
  const PF0 = __projFx;
  __projFx = function (c, img, o) {
    let el = null;
    try {
      const ab = c.__fxAb && c.time.now < c.__fxAb.until ? c.__fxAb.def : null;
      // tiro comum de cajado/bastão: sem brilho nem rastro — só o impacto do elemento
      if (!ab && !o.hostile && o.texture === "proj-bolt") { img.__fxEl = __fxElOf({ status: o.status, id: c.inventory?.equipment?.weapon?.id, tint: o.tint === 9089279 ? 0 : o.tint }) ?? "arcane"; img.__fxBare = 1; return }
      el = __fxElOf({ ...o, id: ab?.id, name: ab?.name, damageType: o.damageType ?? ab?.damageType });
      // flecha comum sem cor nem estado continua só flecha
      if (el && /arrow|dart/.test(o.texture || "") && !o.status && (!o.tint || o.tint === 0xffffff)) el = null;
    } catch (e) {}
    if (!el) return PF0(c, img, o);
    img.__fxEl = el;
    const big = o.explosion ? 1.5 : o.hostile ? .9 : 1.1;
    if (/bolt|orb/.test(o.texture || "")) img.setScale((img.scaleX || 1) * 1.25);
    __FX.follow(c, img, el, { size: big, core: !0, lightScale: o.hostile ? .1 : .13, lightAlpha: .6 });
  };
  const SPW = Kh.prototype.spawn;
  Kh.prototype.spawn = function () { const p = SPW.apply(this, arguments); try { p?.img?.__fxBare && (p.trailTimer = 1e9) } catch (e) {} return p };
  const IM0 = Kh.prototype.impact;
  Kh.prototype.impact = function (i, t, e) {
    try { const el = t?.img?.__fxEl; el && __FX.impact(this.scene, t.x, t.y, el, t.explosion ? 2.2 : e ? 1.1 : .8) } catch (err) {}
    return IM0.apply(this, arguments);
  };
  // qual habilidade está saindo agora (para dar o elemento certo ao projétil dela)
  const EX1 = Yh.prototype.execute;
  Yh.prototype.execute = function (d) {
    const S = this.scene;
    try { d && (S.__fxAb = { def: d, el: __fxElOf({ id: d.id, name: d.name, tint: d.tint, damageType: d.damageType }), until: S.time.now + (d.type === "telegraph-aoe" ? 2800 : 900) }) } catch (e) {}
    const r = EX1.apply(this, arguments);
    try {
      if (d && !/^ET_/.test(d.id) && S.player && !S.player.dead) {
        const el = S.__fxAb.el, P = S.player, H = P.displayHeight ?? 32;
        if (d.type === "buff") {
          const h = __FX.follow(S, P, el ?? "holy", { size: .8, oy: -H * .3, zone: { w: 22, h: H * .7 }, lightScale: .12, lightAlpha: .35 });
          h?.ems.forEach((e) => { e.frequency = e.frequency * 2 });
          S.time.delayedCall(Math.max(1500, (d.duration ?? 4) * 1e3), () => h?.stop());
          __FX.impact(S, P.x, P.y - H * .3, el ?? "holy", 1.1);
        } else if (d.type === "aoe-self") __FX.impact(S, P.x, P.y - 6, el ?? "steel", Math.min(2.6, Math.max(1, (d.radius ?? 70) / 45)));
      }
    } catch (e) {}
    return r;
  };
}

/* ─── estados nos alvos: chamas, gelo, bolhas de veneno ─── */
{
  const ST_EL = { BURN: "fire", CHILL: "ice", POISON: "poison" };
  const AP0 = Qh.prototype.apply;
  Qh.prototype.apply = function (i, t, o) {
    const r = AP0.apply(this, arguments);
    try { const el = ST_EL[t]; el && i && !i.dead && __FX.impact(this.scene, i.x, i.y - (i.displayHeight ?? 24) * .35, el, .7) } catch (e) {}
    return r;
  };
  const TT0 = Qh.prototype.tickTarget;
  Qh.prototype.tickTarget = function (i, t) {
    const r = TT0.apply(this, arguments);
    try {
      const S = this.scene, st = i.statuses || {};
      i.__fxSt = i.__fxSt || {};
      for (const [k, el] of Object.entries(ST_EL)) {
        const on = st[k] && st[k].t > 0 && !i.dead && i.active;
        const h = i.__fxSt[k];
        if (on && !h) { const W = (i.body?.width ?? i.displayWidth ?? 24) * .9, H = (i.displayHeight ?? 32) * .6; i.__fxSt[k] = __FX.follow(S, i, el, { size: Math.min(1.3, H / 24), oy: -(i.displayHeight ?? 24) * .3, zone: { w: W, h: H }, light: el !== "poison", lightScale: .1, lightAlpha: .3 }); i.__fxSt[k]?.ems.forEach((e) => { e.frequency = e.frequency * .6 }) }
        else if (!on && h) { h.stop(); delete i.__fxSt[k] }
      }
    } catch (e) {}
    return r;
  };
}

/* ─── arma equipada com elemento: brilho na arma e golpe com rastro do elemento ─── */
function __fxIsStaff(it) { if (!it) return !1; const k = it.visualKey ?? it.id; return /staff|scepter|wand/.test(`${it.id} ${k}`) || oe[k]?.delivery === "bolt" }
function __fxWeaponEl(it) {
  if (!it || __fxIsStaff(it)) return null;
  const el = __fxElOf({ status: it.status, id: it.id, name: "" });
  if (el) return el;
  const md = it.stats?.magicDamage ?? 0;
  return md >= 5 || it.weaponCategory === "MAGE" ? "arcane" : null;
}
{
  const C0 = Sd.prototype.create;
  Sd.prototype.create = function () {
    const r = C0.apply(this, arguments);
    try {
      const S = this;
      __fxQuality(S);
      __FX.tex(S);
      let curKey = null, aura = null, glowT = 0;
      const anchor = { x: 0, y: 0, active: !0, depth: 0 };
      const place = () => {
        const p = S.player; if (!p) return;
        const f = p.facing || { x: 1, y: 0 }, sx = f.x !== 0 ? Math.sign(f.x) : (p.flipX ? -1 : 1);
        anchor.x = p.x + sx * 11; anchor.y = p.y - 6; anchor.depth = p.depth + 2;
      };
      const tick = () => {
        if (!S.player || S.player.dead) { aura?.stop(); aura = null; curKey = null; return }
        const it = S.inventory?.equipment?.weapon, el = __fxWeaponEl(it), key = el ? `${el}:${it.id}:${it.rarity}` : null;
        if (key !== curKey) {
          aura?.stop(); aura = null; curKey = key;
          if (el) { const rk = ({ COMMON: 0, UNCOMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4, MYTHIC: 5 })[it.rarity] ?? 2; aura = __FX.follow(S, anchor, el, { size: .35 + rk * .06, light: !1, zone: { w: 14, h: 22 }, keepHidden: !0 }); aura?.ems.forEach((e) => { e.frequency = e.frequency * (4.5 - rk * .5) }) }
        }
      };
      const U = () => { place(); if ((glowT -= 1) <= 0) { glowT = 30; tick() } };
      S.events.on("update", U);
      S.events.once("shutdown", () => { S.events.off("update", U); aura?.stop(); aura = null; curKey = null });
      // golpe corpo a corpo com arma de elemento: arco de partículas na direção do ataque
      const cb = S.combat;
      if (cb && !cb.__fxWrap) {
        cb.__fxWrap = 1;
        const DA = cb.deliverAttack.bind(cb);
        cb.deliverAttack = function (i, t, e) {
          const out = DA(i, t, e);
          try {
            const it = S.inventory?.equipment?.weapon, el = __fxWeaponEl(it);
            if (el && t?.delivery === "melee") {
              const p = S.player, f = p.facing || { x: 1, y: 0 }, a0 = Math.atan2(f.y, f.x), P = __FX.PAL[el];
              for (let k = 0; k < 7; k++) {
                const a = a0 - .9 + k * .3, x = p.x + Math.cos(a) * 26, y = p.y - 6 + Math.sin(a) * 20;
                S.time.delayedCall(k * 12, () => __FX.em(S, el === "ice" ? "fx2-flake" : el === "fire" ? "fx2-flame" : "fx2-dot", { speed: { min: 10, max: 40 }, angle: { min: 0, max: 360 }, lifespan: { min: 180, max: 340 }, scale: { start: .8, end: .1 }, alpha: { start: .7, end: 0 }, tint: [P.mid, P.out, P.deep], blendMode: "ADD", gravityY: el === "fire" ? -80 : 0 }, 3, x, y, p.depth + 3));
              }
              __FX.glow(S, p.x + Math.cos(a0) * 22, p.y - 6 + Math.sin(a0) * 16, P.light, .3, 220, .7, p.depth + 3);
            }
          } catch (err) {}
          return out;
        };
      }
    } catch (e) { console.warn("[fx]", e) }
    return r;
  };
}

/* bastões e cajados: sem arco de corte, sem brilho na ponta — só o impacto */
{
  const WM0 = window.__weaponMeleeFx;
  if (typeof WM0 === "function") window.__weaponMeleeFx = function (cb, key) { if (/staff|scepter|wand/.test(String(key || ""))) return; return WM0.apply(this, arguments) };
  const C1 = Sd.prototype.create;
  Sd.prototype.create = function () {
    const r = C1.apply(this, arguments);
    try {
      const S = this, PU = () => { const v = S.playerVisual; if (v && __fxIsStaff(S.inventory?.equipment?.weapon)) { v.castGlow?.visible && v.castGlow.setVisible(!1); v.weaponGlow?.visible && v.weaponGlow.setVisible(!1) } };
      S.events.on("postupdate", PU);
      S.events.once("shutdown", () => S.events.off("postupdate", PU));
    } catch (e) {}
    return r;
  };
}

/* ondas de choque e cortes com a cor do elemento de quem atacou (antes: sempre anel roxo) */
function __fxCtxEl(S) {
  if (S.__fxBossEl) return { el: S.__fxBossEl, ab: !1 };
  const a = S.__fxAb;
  if (a && S.time.now < a.until) return { el: a.el ?? "steel", ab: !/^ET_/.test(a.def?.id || "") };
  return null;
}
{
  const SW0 = fh.prototype.shockwaveRing;
  fh.prototype.shockwaveRing = function (x, y, r) {
    const S = this.scene, c = __fxCtxEl(S);
    if (!c || !__FX.PAL[c.el]) return SW0.apply(this, arguments);
    const P = __FX.PAL[c.el], g = S.add.graphics().setDepth(940), o = { r: 12, a: .9 };
    S.tweens.add({ targets: o, r, a: 0, duration: 340, onUpdate: () => { g.clear(); g.lineStyle(4, P.out, o.a).strokeCircle(x, y, o.r); g.lineStyle(2, P.mid, o.a).strokeCircle(x, y, o.r * .8) }, onComplete: () => g.destroy() });
    this.burstTinted(x, y, P.mid, 10);
    c.ab && __FX.impact(S, x, y, c.el, Math.min(2.6, Math.max(.9, r / 45)));
  };
  const SL0 = fh.prototype.slash;
  fh.prototype.slash = function (x, y, rot, col) {
    const r = SL0.apply(this, arguments);
    try { const S = this.scene, c = __fxCtxEl(S); c?.ab && __FX.impact(S, x, y, c.el, .9) } catch (e) {}
    return r;
  };
}
