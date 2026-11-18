/* ══ Luz e clima das fases (p216.16) ══════════════════════════════════════════════════════════════
   • Escuridão por fase: um mapa de luz pequeno (1/4 da tela) pintado com a cor do lugar e "furado" pelas luzes —
     o herói carrega uma tocha, e fogo, tochas, lava, cristais, portais e magias (tudo que brilha com mistura ADD)
     abrem a escuridão em volta. Esticado na tela, fica macio e custa uma só camada.
   • Brilho quente/frio em volta das luzes e partículas de ambiente (poeira, brasas, neve, esporos).
   • Segue a QUALIDADE GRÁFICA das Configurações: baixa = nada disso · média = luz e poucas partículas ·
     alta = luz, brilho em volta das tochas e todas as partículas. Se o jogo ficar abaixo de ~26 FPS por alguns
     segundos, baixa um nível só nesta sessão. */
window.__gfxQ = function () {
  if (window.__gfxDrop != null) return window.__gfxDrop;
  let q = "high";
  try { q = Kt().quality || "high" } catch (e) {}
  return q === "low" ? 0 : q === "medium" ? 1 : 2;
};

/* d: escuridão (0..1) · c: cor da sombra · r: raio da tocha do herói · a: partículas · g: cor do brilho das luzes */
const __LZ = {
  catacombs: { d: .8, c: 0x0d0806, r: 140, a: "dust", g: 0xffa040 },
  dorf_cave: { d: .8, c: 0x06080e, r: 140, a: "dust", g: 0xffb060 },
  castle: { d: .25, c: 0x0b0814, r: 130, a: "dust", g: 0xffb060 },
  fortress: { d: .6, c: 0x160604, r: 136, a: "ember", g: 0xff7a30 },
  vulcao: { d: .45, c: 0x1c0602, r: 150, a: "ember", g: 0xff6a20 },
  rift: { d: .62, c: 0x0c0418, r: 130, a: "spark", g: 0xb07cff },
  ruins: { d: .2, c: 0x041008, r: 170, a: "spore", g: 0xd8ff9a },
  morta: { d: .42, c: 0x0a0c12, r: 150, a: "spore", g: 0xc8e0ff },
  bosque: { d: 0, c: 0x03120a, r: 170, a: "spore", g: 0xd8ffa0 },
  forest: { d: 0, c: 0x061006, r: 190, a: "spore", g: 0xfff0b0 },
  rio: { d: 0, c: 0x041018, r: 200, a: null, g: 0xfff0c0 },
  temple: { d: 0, c: 0x201206, r: 200, a: null, g: 0xffd080 },
  glacial: { d: 0, c: 0x0a1630, r: 180, a: "snow", g: 0xbfe4ff },
  frozen: { d: .32, c: 0x0c1a38, r: 170, a: "snow", g: 0xbfe4ff },     // Cidadela Congelada do Infinito
};
const __LZ_HOT = /torch|tocha|fire|flame|chama|brazier|brasei|lava|candle|vela|lamp|lantern|lanter|crystal|cristal|portal|bonfire|fogueira|campfire|rune|runa|glow|ember|brasa/i;

function __lzCfg(S) {
  const id = String(S.levelId || S.level?.id || "");
  if (__LZ[id]) return __LZ[id];
  const t = String(S.level?.biome || S.level?.themeId || S.game?.registry?.get("endless:run")?.currentBiomeTheme || "").toLowerCase();
  for (const k in __LZ) if (t.includes(k)) return __LZ[k];
  if (/cave|caverna|crypt|cripta|dungeon|masmorra|abismo|abyss/.test(t + id)) return __LZ.catacombs;
  return S.level?.endless ? { d: .5, c: 0x0a0810, r: 120, a: "dust", g: 0xffb060 } : null;
}

function __lzTex(S) {
  if (S.textures.exists("lz-hole")) return;
  const mk = (k, w, h, fn) => { const t = S.textures.createCanvas(k, w, h), g = t.getContext(); fn(g, w, h); t.refresh() };
  mk("lz-hole", 64, 64, (g) => {                // furo de luz: centro cheio, borda bem macia
    const q = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    q.addColorStop(0, "rgba(255,255,255,1)"); q.addColorStop(.35, "rgba(255,255,255,.92)"); q.addColorStop(.7, "rgba(255,255,255,.4)"); q.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = q; g.fillRect(0, 0, 64, 64);
  });
  mk("lz-glow", 64, 64, (g) => {
    const q = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    q.addColorStop(0, "rgba(255,255,255,.55)"); q.addColorStop(.5, "rgba(255,255,255,.18)"); q.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = q; g.fillRect(0, 0, 64, 64);
  });
  mk("lz-mote", 4, 4, (g) => { g.fillStyle = "rgba(255,255,255,.9)"; g.fillRect(1, 1, 2, 2); g.fillStyle = "rgba(255,255,255,.4)"; g.fillRect(0, 1, 4, 2); g.fillRect(1, 0, 2, 4) });
  mk("lz-flake", 5, 5, (g) => { g.fillStyle = "rgba(255,255,255,.95)"; g.fillRect(1, 2, 3, 1); g.fillRect(2, 1, 1, 3); g.fillStyle = "rgba(255,255,255,.5)"; g.fillRect(0, 2, 5, 1); g.fillRect(2, 0, 1, 5) });
}

function __lzSetup(S) {
  const C = __lzCfg(S);
  if (!C || S.__lz || window.__lzOff) return;
  __lzTex(S);
  const cam = S.cameras.main, Q = () => window.__gfxQ();
  const DIV = 4, W = Math.ceil(cam.width / DIV), H = Math.ceil(cam.height / DIV);
  // mapa de luz num canvas 2D pequeno (determinístico e barato): pinta a sombra e apaga os furos de luz
  const MK = "lz-map-" + (S.sys.settings.key || "g");
  if (S.textures.exists(MK)) S.textures.remove(MK);
  const ctex = S.textures.createCanvas(MK, W, H), ctx = ctex.getContext();
  const holeC = document.createElement("canvas"); holeC.width = holeC.height = 64;
  { const g = holeC.getContext("2d"), q = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    q.addColorStop(0, "rgba(0,0,0,1)"); q.addColorStop(.35, "rgba(0,0,0,.92)"); q.addColorStop(.7, "rgba(0,0,0,.4)"); q.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = q; g.fillRect(0, 0, 64, 64) }
  const rt = S.add.image(0, 0, MK).setOrigin(.5).setScrollFactor(0).setDepth(9000);
  const glows = [];
  const fillCss = "#" + C.c.toString(16).padStart(6, "0");
  const L = { rt, C, flick: 0, fpsLow: 0, hot: [], scanT: 0, amb: null, on: true };
  S.__lz = L;

  // partículas de ambiente: um emissor só, nascendo dentro da área visível
  const ambient = (q) => {
    if (L.amb) { L.amb.destroy(); L.amb = null }
    if (!C.a || q < 1) return;
    const n = q >= 2 ? 1 : .45, view = cam.worldView;
    const P = {
      dust: { key: "lz-mote", tint: [0xe8d8b8, 0xc8b898], alpha: { start: 0, end: 0, ease: (v) => Math.sin(v * Math.PI) * .55 }, speedX: { min: -6, max: 6 }, speedY: { min: -4, max: 4 }, lifespan: 6000, scale: { min: .5, max: 1 }, freq: 260 },
      ember: { key: "lz-mote", tint: [0xffa040, 0xff6020, 0xffd070], alpha: { start: .9, end: 0 }, speedX: { min: -10, max: 10 }, speedY: { min: -38, max: -16 }, lifespan: 3600, scale: { min: .5, max: 1.1 }, freq: 170, blend: "ADD" },
      spark: { key: "lz-mote", tint: [0xc8a0ff, 0x8a60ff], alpha: { start: .9, end: 0 }, speedX: { min: -12, max: 12 }, speedY: { min: -18, max: 6 }, lifespan: 2600, scale: { min: .5, max: 1 }, freq: 200, blend: "ADD" },
      spore: { key: "lz-mote", tint: [0xe8ffb0, 0xfff2a0], alpha: { start: 0, end: 0, ease: (v) => Math.sin(v * Math.PI) * .7 }, speedX: { min: -8, max: 8 }, speedY: { min: -10, max: -2 }, lifespan: 5200, scale: { min: .4, max: .9 }, freq: 300, blend: "ADD" },
      snow: { key: "lz-flake", tint: [0xffffff, 0xdcefff], alpha: { start: .85, end: .2 }, speedX: { min: -14, max: 4 }, speedY: { min: 18, max: 34 }, lifespan: 5600, scale: { min: .5, max: 1 }, freq: 110 },
    }[C.a];
    if (!P) return;
    const cfg = {
      x: 0, y: 0, lifespan: P.lifespan, speedX: P.speedX, speedY: P.speedY, scale: P.scale, tint: P.tint,
      alpha: P.alpha.ease ? { start: 1, end: 0, ease: P.alpha.ease } : P.alpha, frequency: P.freq / n, quantity: 1,
      emitZone: { type: "random", source: new j.Geom.Rectangle(0, 0, view.width + 80, view.height + 80) }, maxAliveParticles: Math.round(60 * n),
    };
    if (P.blend) cfg.blendMode = j.BlendModes.ADD;
    try { L.amb = S.add.particles(0, 0, P.key, cfg).setDepth(8990) } catch (e) { L.amb = null }
  };

  const apply = () => {
    const q = Q();
    L.on = q >= 1 && C.d > .02;
    rt.setVisible(L.on);
    for (const g of glows) g.setVisible(L.on && !!g.__src);
    heroGlow?.setVisible(L.on && q >= 2 && C.d >= .4);
    ambient(q);
  };
  const heroGlow = S.add.image(0, 0, "lz-glow").setBlendMode(j.BlendModes.ADD).setDepth(8995).setTint(C.g).setAlpha(.16);
  heroGlow.__lzSkip = 1;
  apply();
  L.apply = apply;

  // fontes de luz (varredura a cada 0,5 s; a posição é lida a cada quadro)
  const scan = () => {
    const v = cam.worldView, pad = 160, out = [];
    for (const o of S.children.list) {
      if (!o.visible || o === rt || o === L.amb || o.alpha < .05 || o.scrollFactorX === 0 || o.__lzSkip) continue;
      const x = o.x, y = o.y;
      if (x < v.x - pad || x > v.right + pad || y < v.y - pad || y > v.bottom + pad) continue;
      if (o.type !== "Image" && o.type !== "Sprite" && o.type !== "ParticleEmitter") continue;
      const k = o.texture?.key || "";
      if (/base|shadow|^lz-/i.test(k)) continue;
      const add = o.blendMode === 1 || o.blendMode === "ADD";
      if (o.type === "ParticleEmitter") { if (add && o.alive?.length) out.push({ o, r: 36, emit: 1 }); continue }
      const sz = Math.max(o.displayWidth || 0, o.displayHeight || 0);
      if (add) out.push({ o, r: Math.min(80, Math.max(24, sz * .5)) * (.6 + .4 * Math.min(1, o.alpha * 2)) });
      else if (__LZ_HOT.test(k)) out.push({ o, r: /crystal|cristal|portal|rune|runa/i.test(k) ? Math.min(90, Math.max(40, sz * 1.1)) : Math.min(85, Math.max(50, sz * 2)), hot: 1 });
    }
    // fontes coladas (chama + luz + tocha no mesmo lugar) viram uma só, a maior
    out.sort((a, b) => b.r - a.r);
    const keep = [];
    for (const h of out) if (!keep.some((k) => Math.abs(k.o.x - h.o.x) < 30 && Math.abs(k.o.y - h.o.y) < 30 && (k.hot = k.hot || h.hot))) keep.push(h);
    out.length = 0; out.push(...keep);
    const hx = S.player?.x ?? 0, hy = S.player?.y ?? 0;
    out.sort((a, b) => Math.hypot(a.o.x - hx, a.o.y - hy) - Math.hypot(b.o.x - hx, b.o.y - hy));
    L.hot = out.slice(0, Q() >= 2 ? 28 : 16);
    // brilho colorido em volta das tochas e fogueiras (só as de cenário; as magias já brilham sozinhas)
    let gi = 0;
    for (const h of L.hot) {
      if (!h.hot || Q() < 2 || gi >= 10 || C.d < .4) continue;      // halo só em lugar escuro (na neve estoura)
      const g = glows[gi] || (glows[gi] = S.add.image(0, 0, "lz-glow").setBlendMode(j.BlendModes.ADD).setDepth(8995));
      g.__lzSkip = 1; g.__src = h; g.setTint(C.g).setVisible(L.on); gi++;
    }
    for (let k = gi; k < glows.length; k++) glows[k].setVisible(false).__src = null;
  };

  const step = (t, dtMs) => {
    if (!S.sys.isActive() || !S.player) return;
    // quedas fortes de FPS: baixa um nível nesta sessão
    const fps = S.game.loop.actualFps;
    L.fpsLow = fps < 26 ? L.fpsLow + dtMs : Math.max(0, L.fpsLow - dtMs * 2);
    if (L.fpsLow > 5000 && Q() > 0 && !window.__gfxNoDrop) { window.__gfxDrop = Q() - 1; L.fpsLow = 0; apply(); try { S.__amb?.apply?.() } catch (e) {} }
    if (L.amb) { const v = cam.worldView; L.amb.setPosition(v.x - 40, v.y - 40) }
    if (!L.on) return;
    if ((L.scanT -= dtMs) <= 0) { L.scanT = Q() >= 2 ? 150 : 300; scan() }
    const v = cam.worldView, sx = W / v.width, sy = H / v.height;
    rt.setPosition(cam.width / 2, cam.height / 2).setDisplaySize(cam.width / cam.zoom, cam.height / cam.zoom);
    ctx.globalCompositeOperation = "copy"; ctx.globalAlpha = C.d; ctx.fillStyle = fillCss; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "destination-out";
    L.flick += dtMs;
    const hole = (x, y, r, a) => {
      const px = (x - v.x) * sx, py = (y - v.y) * sy, rx = r * sx, ry = r * sy;
      if (px + rx < 0 || py + ry < 0 || px - rx > W || py - ry > H) return;
      ctx.globalAlpha = a; ctx.drawImage(holeC, px - rx, py - ry, rx * 2, ry * 2);
    };
    const fl = 1 + Math.sin(L.flick * .011) * .025 + Math.sin(L.flick * .027) * .02;
    for (const h of L.hot) {
      const o = h.o;
      if (!o.active || !o.visible) continue;
      let x = o.x, y = o.y;
      if (h.emit) { const p = o.alive[0]; if (!p) continue; x = p.x + (o.x || 0); y = p.y + (o.y || 0) }
      const ff = h.hot ? 1 + Math.sin(L.flick * .013 + x) * .06 : 1;
      hole(x, y, h.r * ff, h.hot ? .95 : .7);
    }
    hole(S.player.x, S.player.y + 2, C.r * fl, 1);     // a tocha do herói
    ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = 1;
    ctex.refresh();
    heroGlow.setPosition(S.player.x, S.player.y).setScale(C.r * 1.3 / 64 * fl);
    for (const g of glows) {
      const h = g.__src; if (!h || !g.visible) continue;
      const o = h.o; if (!o.active) { g.setVisible(false); continue }
      g.setPosition(o.x, o.y).setScale(h.r * 1.6 / 64 * (1 + Math.sin(L.flick * .013 + o.x) * .05)).setAlpha(.55);
    }
  };
  S.events.on("update", step);
  S.events.once("shutdown", () => { S.events.off("update", step); S.__lz = null; try { S.textures.remove(MK) } catch (e) {} });
}

(function () {
  const C0 = Sd.prototype.create;
  Sd.prototype.create = function () {
    const r = C0.apply(this, arguments);
    try { this.time.delayedCall(60, () => { try { __lzSetup(this) } catch (e) { console.warn("[luz]", e) } }) } catch (e) {}
    return r;
  };
  // trocou a qualidade nas Configurações: aplica na hora
  const hook = () => { const g = window.__DED_GAME; if (!g) return setTimeout(hook, 500); g.events.on("settings:changed", () => { window.__gfxDrop = null; g.scene.getScene("Game")?.__lz?.apply?.() }) };
  hook();
})();
