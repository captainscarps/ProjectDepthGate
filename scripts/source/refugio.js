/* ══ Refúgio mais vivo (campanha e modo infinito) ══
   • Praça: poço, caixotes e barril junto do vendedor, bancos de tronco em volta da fogueira, canteiros de flores
     nos pés dos postes, pedrinhas e tufos quebrando o tijolo liso (o ground.png perdeu os ladrilhos quadrados
     manchados: scripts/fix_hub_ground_patches.py).
   • Muro do topo: hera descendo pela pedra, estandartes vermelhos do Refúgio, tochas, e tufos na base do muro.
   • Vida: ovelhas pastando no gramado de baixo, coelhos no gramado do curtidor, patos andando perto da herborista,
     passarinhos ciscando na praça (voam quando o herói chega perto e voltam depois), borboletas sobre as flores,
     vaga-lumes no entardecer e folhas caindo das árvores das bordas.
   Arte: scripts/build_refugio_deco.py (pacotes CraftPix fora do repositório). */
const __RF_SHEETS = { "rf-sheep": 48, "rf-rabbit": 48, "rf-duck": 48, "rf-butterfly": 48, "rf-birds": 32 };
{
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path; L.setPath("");
      this.textures.exists("rf-deco") || L.atlas("rf-deco", "assets/pixel-art/hub/refugio/deco.png", "assets/pixel-art/hub/refugio/deco.json");
      for (const k in __RF_SHEETS) this.textures.exists(k) || L.spritesheet(k, `assets/pixel-art/hub/refugio/${k.slice(3)}.png`, { frameWidth: __RF_SHEETS[k], frameHeight: __RF_SHEETS[k] });
      L.setPath(op);
    } catch (e) {}
    return r;
  };
  const I0 = Fl.prototype.__inters;
  Fl.prototype.__inters = function () {
    const r = I0.apply(this, arguments);
    try { this.textures.exists("rf-deco") && __rfDecorate(this) } catch (e) { console.warn("[refugio]", e) }
    return r;
  };
}
/* texturas pequenas prontas (sombra e pixel): imagens são bem mais leves que formas (Ellipse/Rectangle), que o
   Phaser 4 refaz a cada quadro */
function __rfTex(H) {
  if (!H.textures.exists("rf-shadow")) { const g = H.make.graphics({ x: 0, y: 0 }, !1); g.fillStyle(0, 1).fillEllipse(16, 4, 32, 8); g.generateTexture("rf-shadow", 32, 8); g.destroy() }
  if (!H.textures.exists("rf-px")) { const g = H.make.graphics({ x: 0, y: 0 }, !1); g.fillStyle(0xffffff, 1).fillRect(0, 0, 4, 2); g.generateTexture("rf-px", 4, 2); g.destroy() }
}
window.__rfTex = __rfTex;
function __rfShadow(H, x, y, w, h, a) { __rfTex(H); return H.add.image(x, y, "rf-shadow").setDisplaySize(w, h).setAlpha(a) }
window.__rfShadow = __rfShadow;
function __rfRand(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) }
function __rfDecorate(H) {
  const A = H.anims, rnd = __rfRand(4242);
  // o que é só enfeite animado fica registrado aqui: no modo leve (aparelho lento) tudo isso é desligado
  const LIVE = (H.__rfLive = []);
  const keep = (o) => (LIVE.push(o), o);
  const onU = (fn) => { H.events.on("update", fn); LIVE.push({ destroy: () => H.events.off("update", fn) }) };
  H.M = Object.assign({}, H.M, { coll: H.M.coll.slice() });
  const M = H.M, g = M.g, S = M.spots;
  const block = (x0, y0, x1, y1) => {
    for (let y = y0; y < y1; y += g) for (let x = x0; x < x1; x += g) {
      const gx = Math.floor(x / g), gy = Math.floor(y / g), row = M.coll[gy];
      row && gx >= 0 && gx < row.length && (M.coll[gy] = row.slice(0, gx) + "1" + row.slice(gx + 1));
    }
  };
  const solidAt = (x, y) => { const row = H.M.coll[Math.floor(y / g)]; return !row || row[Math.floor(x / g)] !== "0" };
  // perto de algum ponto de interação ou personagem? (não enfeitar em cima de quem se usa)
  const busy = (x, y, r = 22) => (H.inters || []).some((o) => o.area === "out" && Math.hypot(o.x - x, o.y - y) < r + 10) || Object.values(S).some((p) => Math.hypot(p[0] - x, p[1] - y) < r);
  // desempenho: o que é chão/parede (pedrinhas, tufos, flores, hera, estandartes) vai todo para UMA textura
  // (bake) em vez de centenas de imagens soltas; só os objetos sólidos continuam como imagens
  const BAKE = [];
  const deco = (f, x, y, o = {}) => {
    const im = H.add.image(x, y, "rf-deco", f).setOrigin(.5, 1).setDepth(o.depth ?? y);
    o.bake && BAKE.push(im);
    o.flip && im.setFlipX(!0); o.alpha && im.setAlpha(o.alpha); o.scale && im.setScale(o.scale);
    o.solid && block(x - o.solid[0], y - o.solid[1], x + o.solid[0], y);
    return im;
  };
  // cores do chão lidas UMA vez (antes eram centenas de leituras de pixel na entrada do Refúgio)
  let GD = null, GW = 0;
  try { const src = H.textures.get("vh-ground").getSourceImage(), cv = document.createElement("canvas"); cv.width = GW = src.width; cv.height = src.height; const cx = cv.getContext("2d", { willReadFrequently: !0 }); cx.drawImage(src, 0, 0); GD = cx.getImageData(0, 0, cv.width, cv.height).data } catch (e) {}
  const grass = (x, y) => { if (!GD) return !1; x |= 0; y |= 0; if (x < 0 || y < 0 || x >= GW) return !1; const i = (y * GW + x) * 4; return GD[i + 1] > GD[i] + 12 };
  // procura perto de (x, y) um lugar de grama livre para o enfeite
  const onGrass = (f, x, y, o = {}) => {
    for (let r = 0; r < 60; r += 6) for (let a = 0; a < 6.28; a += 1.05) {
      const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * .7;
      if (grass(px, py) && grass(px - 8, py) && grass(px + 8, py) && !solidAt(px, py) && !busy(px, py, 20)) return deco(f, px, py, o);
    }
    return null;
  };
  const flat = (f, x, y, a = 1) => BAKE.push(H.add.image(x, y, "rf-deco", f).setOrigin(.5).setAlpha(a));   // no chão

  /* ─── muro do topo ─── */
  const WALL_Y = 58, WALL_B = 88;
  for (const x of [52, 118, 196, 262, 338, 402, 586, 650, 742, 828, 902, 968]) {
    const k = (x * 7) % 4; deco(`ivy${k}`, x + ((x * 13) % 9) - 4, WALL_Y + [22, 30, 18, 26][k], { bake: 1 });
  }
  for (const x of [292, 452, 572, 720]) {
    deco("banner", x, WALL_Y + 35, { bake: 1 });
  }
  for (const x of [372, 512, 650, 860, 160]) {                                       // tochas presas no muro
    BAKE.push({ rects: [[x - 2, WALL_Y + 14, 4, 10, "#2a2420"], [x - 4, WALL_Y + 12, 8, 3, "#4a4038"]] });
    H.add.sprite(x, WALL_Y + 13, "torch-flame", 0).play("torch-flame-burn").setOrigin(.5, 1).setDepth(WALL_Y + 4);
    keep(H.add.image(x, WALL_Y + 6, "light")).setScale(.28).setBlendMode(j.BlendModes.ADD).setTint(16750130).setAlpha(.26).setDepth(9001);   // luz fixa (sem tween)
  }
  for (let x = 14; x < 1012; x += 22 + rnd() * 26) {                                 // a base reta do muro vira mato
    const y = WALL_B + 4 + rnd() * 5;
    if (solidAt(x, y + 6) && !solidAt(x, y + 14)) continue;
    deco(rnd() < .78 ? `tuft${(rnd() * 14) | 0}` : `fl${1 + ((rnd() * 9) | 0)}`, x, y, { bake: 1, flip: rnd() < .5 });
  }

  /* ─── praça ─── */
  const C = S.campfire;
  deco("bench", C[0] - 34, C[1] + 26, { solid: [14, 6] });
  deco("bench", C[0] + 34, C[1] + 28, { solid: [14, 6], flip: !0 });
  deco("well", 612, 398, { solid: [16, 10] });
  deco("crates", S.vendor[0] + 40, S.vendor[1] + 2, { solid: [12, 8] });
  deco("stump-up", S.vendor[0] + 56, S.vendor[1] - 6, { solid: [6, 5] });
  deco("crate-s", S.board[0] + 26, S.board[1] + 4, { solid: [6, 5] });
  for (const [x, y] of M.lamps) {                                                       // canteiros nos pés dos postes
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + rnd(), d = 9 + rnd() * 6, fx = x + Math.cos(a) * d, fy = y + 2 + Math.sin(a) * d * .5;
      deco(k % 2 ? `fl${1 + ((rnd() * 9) | 0)}` : `tuft${(rnd() * 14) | 0}`, fx, fy, { bake: 1, flip: rnd() < .5 });
    }
  }
  for (let n = 0; n < 70; n++) {                                                        // pedrinhas e tufos pelo tijolo
    const x = 330 + rnd() * 380, y = 300 + rnd() * 270;
    if (solidAt(x, y) || busy(x, y, 18) || Math.hypot(x - C[0], y - C[1]) < 40) continue;
    if (grass(x, y)) continue;
    rnd() < .6 ? flat(`peb${(rnd() * 12) | 0}`, x, y, .4) : deco(`tuft${(rnd() * 14) | 0}`, x, y, { bake: 1, alpha: .9 });
  }
  /* ─── cantos de grama ─── */
  onGrass("log", 300, 236, { solid: [16, 6] });
  onGrass("stump-b", 930, 500, { solid: [14, 8] });
  onGrass("mush-b", 960, 560, { solid: [10, 6] });
  onGrass("stump-r", 60, 446, { solid: [10, 6] });
  onGrass("mush", 744, 650, { bake: 1 }); onGrass("mush", 300, 560, { scale: .8, bake: 1 });
  for (let n = 0; n < 60; n++) {                                                        // flores e mato espalhados na grama
    const x = 40 + rnd() * 944, y = 100 + rnd() * 580;
    if (x > 320 && x < 720 && y > 280 && y < 600) continue;
    if (solidAt(x, y) || busy(x, y, 16) || !grass(x, y)) continue;
    deco(rnd() < .5 ? `fl${1 + ((rnd() * 9) | 0)}` : `tuft${(rnd() * 14) | 0}`, x, y, { bake: 1, flip: rnd() < .5 });
  }
  // desenha tudo direto NA textura do chão (canvas): nenhuma camada a mais para a placa de vídeo pintar
  try {
    const gImg = H.children.list.find((o) => o.texture?.key === "vh-ground");
    const src = H.textures.get("vh-ground").getSourceImage(), atl = H.textures.get("rf-deco");
    const cv = document.createElement("canvas"); cv.width = src.width; cv.height = src.height;
    const c2 = cv.getContext("2d"); c2.imageSmoothingEnabled = !1; c2.drawImage(src, 0, 0);
    for (const o of (H.__rfBake || [])) BAKE.push(o);               // a cerca de trás e os comedouros do Canto dos Pets
    H.__rfBake = null;
    for (const o of BAKE) {
      if (o.rects) { for (const [x, y, w, h, col] of o.rects) { c2.fillStyle = col; c2.fillRect(x, y, w, h) } continue }
      const fr = o.frame, sc = Math.abs(o.scaleX), w = fr.cutWidth * sc, h = fr.cutHeight * sc;
      c2.save(); c2.globalAlpha = o.alpha; c2.translate(Math.round(o.x), Math.round(o.y));
      o.flipX && c2.scale(-1, 1);
      c2.drawImage(fr.source.image, fr.cutX, fr.cutY, fr.cutWidth, fr.cutHeight, Math.round(-w * o.originX), Math.round(-h * o.originY), w, h);
      c2.restore();
    }
    H.textures.exists("rf-ground") && H.textures.remove("rf-ground");
    H.textures.addCanvas("rf-ground", cv);
    gImg?.setTexture("rf-ground");
    H.__rfFloor = gImg;
  } catch (e) { console.warn("[refugio] bake", e); for (const o of BAKE) o.setDepth?.(-3); BAKE.length = 0 }
  for (const o of BAKE) o.destroy?.();

  /* ─── bichos ─── */
  const anim = (key, tex, a, b, fr, rep = -1) => { A.exists(key) || A.create({ key, frames: A.generateFrameNumbers(tex, { start: a, end: b }), frameRate: fr, repeat: rep }) };
  anim("rf-sheep-walk", "rf-sheep", 0, 3, 6); anim("rf-sheep-idle", "rf-sheep", 4, 7, 4);
  anim("rf-rabbit-hop", "rf-rabbit", 0, 3, 9); anim("rf-rabbit-idle", "rf-rabbit", 4, 7, 4);
  anim("rf-duck-idle", "rf-duck", 0, 3, 5); anim("rf-duck-fly", "rf-duck", 4, 7, 10);
  anim("rf-bfly", "rf-butterfly", 0, 3, 12);
  anim("rf-bird-peck", "rf-birds", 0, 19, 10); anim("rf-bird-fly", "rf-birds", 0, 3, 14);
  const walker = (tex, walkK, idleK, zone, n, sp, sc) => {
    for (let i = 0; i < n; i++) {
      let x = zone[0] + rnd() * (zone[2] - zone[0]), y = zone[1] + rnd() * (zone[3] - zone[1]);
      for (let t = 0; t < 12 && solidAt(x, y); t++) x = zone[0] + rnd() * (zone[2] - zone[0]), y = zone[1] + rnd() * (zone[3] - zone[1]);
      const s = keep(H.add.sprite(x, y + 14, tex, 0).setOrigin(.5, 1).setScale(sc).setDepth(y).play(idleK));
      s.anims.setProgress(rnd());
      let tx = x, ty = y, wait = 1 + rnd() * 4, mv = !1;
      onU((_t, dms) => {
        if (!s.active) return;
        const sec = Math.min(.06, dms / 1000);
        if (!mv) { wait -= sec; if (wait > 0) return; tx = zone[0] + rnd() * (zone[2] - zone[0]); ty = zone[1] + rnd() * (zone[3] - zone[1]); if (solidAt(tx, ty)) { wait = .5; return } mv = !0; s.play(walkK) }
        // o herói perto: o bicho se afasta
        const hx = H.playerX, hy = H.playerY;
        if (hx != null && H.area === "out" && Math.hypot(hx - x, hy - y) < 34 && !s.__flee) { s.__flee = 1; tx = x + Math.sign(x - hx || 1) * 50; ty = y + Math.sign(y - hy || 1) * 20; mv = !0; s.play(walkK) }
        const dx = tx - x, dy = ty - y, d = Math.hypot(dx, dy), st = sp * (s.__flee ? 2.2 : 1) * sec;
        if (d <= st) { mv = !1; s.__flee = 0; wait = 2 + rnd() * 5; s.play(idleK); return }
        const nx = x + dx / d * st, ny = y + dy / d * st;
        if (solidAt(nx, ny)) { mv = !1; s.__flee = 0; wait = 1; s.play(idleK); return }
        x = nx; y = ny; Math.abs(dx) > .3 && s.setFlipX(dx < 0);
        s.setPosition(x, y + 14).setDepth(y);
      });
    }
  };
  walker("rf-sheep", "rf-sheep-walk", "rf-sheep-idle", [730, 470, 960, 600], 2, 14, .9);
  walker("rf-rabbit", "rf-rabbit-hop", "rf-rabbit-idle", [200, 190, 330, 276], 2, 34, .8);
  walker("rf-duck", "rf-duck-idle", "rf-duck-idle", [720, 330, 960, 440], 1, 16, .8);
  // passarinhos ciscando na praça: voam quando o herói chega perto e pousam de novo depois
  for (let i = 0; i < 3; i++) {
    const home = [C[0] - 90 + rnd() * 180, C[1] - 120 + rnd() * 70];
    if (solidAt(...home)) continue;
    const s = keep(H.add.sprite(home[0], home[1], "rf-birds", 0)).setOrigin(.5, 1).setScale(.75).setDepth(home[1]).play("rf-bird-peck").setFlipX(rnd() < .5);
    s.anims.setProgress(rnd());
    let gone = !1;
    onU(() => {
      if (gone || !s.active) return;
      const hx = H.playerX, hy = H.playerY;
      if (hx == null || H.area !== "out" || Math.hypot(hx - s.x, hy - s.y) > 46) return;
      gone = !0; s.play("rf-bird-fly"); const dir = s.x < hx ? -1 : 1; s.setFlipX(dir < 0);
      H.tweens.add({ targets: s, x: s.x + dir * 160, y: s.y - 140, alpha: 0, duration: 1300, ease: "Quad.easeIn", onComplete: () => {
        H.time.delayedCall(6000 + rnd() * 6000, () => {
          if (!s.active) return;
          s.setPosition(home[0] - dir * 120, home[1] - 110).setAlpha(1);
          H.tweens.add({ targets: s, x: home[0], y: home[1], duration: 1400, ease: "Quad.easeOut", onComplete: () => { s.play("rf-bird-peck"); gone = !1 } });
        });
      } });
    });
  }
  // borboletas sobre os canteiros e a horta
  for (let i = 0; i < 3; i++) {
    const cx = [780, 930, 250, 700][i], cy = [170, 150, 380, 540][i];
    const s = keep(H.add.sprite(cx, cy, "rf-butterfly", 0)).setOrigin(.5).setScale(.6).setDepth(cy + 40).play("rf-bfly");
    s.setTint([0xffffff, 0xfff0a0, 0xd8b0ff][i % 3]);
    const ph = rnd() * 10;
    onU((t) => { if (!s.active) return; const k = t / 1000 + ph; s.setPosition(cx + Math.sin(k * .7) * 34 + Math.sin(k * 2.3) * 6, cy + Math.cos(k * .9) * 18 + Math.sin(k * 3.1) * 4); s.setFlipX(Math.cos(k * .7) < 0) });
  }
  // vaga-lumes no entardecer: um ponto de luz pronto (textura) por vaga-lume e um único laço de atualização
  if (!H.textures.exists("rf-ff")) { const gg = H.make.graphics({ x: 0, y: 0 }, !1); gg.fillStyle(0xe8ff80, .22).fillCircle(5, 5, 5).fillStyle(0xf8f0a0, 1).fillCircle(5, 5, 1.4); gg.generateTexture("rf-ff", 10, 10); gg.destroy() }
  const FF = [];
  for (let i = 0; i < 10; i++) {
    const zone = i % 3 === 0 ? [40, 100, 330, 200] : i % 3 === 1 ? [720, 440, 990, 680] : [40, 440, 330, 560];
    const x0 = zone[0] + rnd() * (zone[2] - zone[0]), y0 = zone[1] + rnd() * (zone[3] - zone[1]);
    FF.push({ x0, y0, ph: rnd() * 20, o: keep(H.add.image(x0, y0, "rf-ff")).setDepth(8990).setBlendMode(j.BlendModes.ADD).setData("rfFF", 1) });
  }
  H.__rfFF = FF;
  let ffT = 0;
  onU((t, dms) => {
    if ((ffT += dms) < 33) return;                          // ~30 quadros por segundo bastam
    ffT = 0;
    for (const f of FF) {
      if (!f.o.visible) continue;
      const k = t / 1000 + f.ph, a = Math.max(0, Math.sin(k * 1.7)) ** 2;
      f.o.setPosition(f.x0 + Math.sin(k * .4) * 20 + Math.sin(k * 1.3) * 5, f.y0 + Math.cos(k * .5) * 12).setAlpha(a);
    }
  });
  // folhas caindo das árvores das bordas
  const trees = (M.props || []).filter((p) => /^(tree|pine)/.test(p[0])).map((p) => [p[1], p[2]]);
  trees.length && LIVE.push(((ev) => ({ destroy: () => ev.remove() }))(H.time.addEvent({ delay: 1400, loop: !0, callback: () => {
    if (H.area !== "out" || rnd() < .5) return;
    const [tx, ty] = trees[(rnd() * trees.length) | 0], x = tx + (rnd() - .5) * 40, y = ty - 40 - rnd() * 30;
    __rfTex(H);
    const lf = H.add.image(x, y, "rf-px").setDisplaySize(2, 1.5).setTint([0x8cc060, 0xc0a040, 0x6ea048][(rnd() * 3) | 0]).setDepth(ty + 30);
    const dx = (rnd() - .3) * 60;
    H.tweens.add({ targets: lf, y: y + 46 + rnd() * 20, x: x + dx, angle: 360 * (rnd() < .5 ? 1 : -1), duration: 2600 + rnd() * 1400, ease: "Sine.easeIn" });
    H.tweens.add({ targets: lf, alpha: 0, delay: 2200, duration: 900, onComplete: () => lf.destroy() });
  } })));
}
window.__dgRefugio = { decorate: __rfDecorate };
