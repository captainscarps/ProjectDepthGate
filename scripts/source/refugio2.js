/* ══ Refúgio, parte 2 ══
   • A chaminé solta que ficava no gramado do curtidor sai do mapa (a cabana já tem a dela).
   • Laguinho no gramado de cima, à esquerda (entre o muro e a cabana): juncos, vitórias-régias com sapos, patos
     nadando, peixes pulando, ondinhas; um pier de tábuas com PESCARIA — espere a boia afundar e puxe na hora
     (E / A / toque). Peixe vale ouro na campanha e fragmentos no modo infinito; 5 por visita.
   • O Refúgio cresce com a campanha (regiões seladas): bandeirolas na praça (1+), lanternas de papel (3+),
     estátua da Guardiã (5+), estandartes dourados no fim. E quem você ajudou nas missões vem morar aqui:
     o Pajé senta na fogueira, a Freira cuida do santuário, o menino brinca perto do Canto dos Pets e o Durgan
     fica de olho na forja.
   • Dia e noite pelo relógio do aparelho (amanhecer, dia, entardecer, noite) e, às vezes, chuva fina. */
{
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path; L.setPath("");
      const D = "assets/pixel-art/hub/refugio/";
      this.textures.exists("rf-lake") || L.image("rf-lake", D + "lake.png");
      this.textures.exists("rf-pier") || L.image("rf-pier", D + "pier.png");
      this.textures.exists("rf-frog") || L.spritesheet("rf-frog", D + "frog.png", { frameWidth: 48, frameHeight: 48 });
      L.setPath(op);
    } catch (e) {}
    return r;
  };
  const I0 = Fl.prototype.__inters;
  Fl.prototype.__inters = function () {
    const r = I0.apply(this, arguments);
    for (const f of [__rfChimney, __rfLake, __rfGrowth, __rfResidents, __rfSky, __rfQuality]) { try { f(this) } catch (e) { console.warn("[refugio2]", f.name, e) } }
    return r;
  };
}
{ // a troca entre lá fora e a forja repunha o entardecer fixo (.26): lá fora vale a hora do dia
  const A0 = Fl.prototype.__area;
  Fl.prototype.__area = function (a) {
    const r = A0.apply(this, arguments);
    try { if (this.__rfSkyA != null) { const al = a === "out" ? this.__rfSkyA : Math.min(.12, this.__rfSkyA); this.shade?.setAlpha(al).setVisible(al > 0) } } catch (e) {}
    return r;
  };
}
const __rfKeep = (H, o) => ((H.__rfLive ??= []).push(o), o);
const __rfOnU = (H, fn) => { H.events.on("update", fn); __rfKeep(H, { destroy: () => H.events.off("update", fn) }) };
const __rfEv = (H, cfg) => { const ev = H.time.addEvent(cfg); __rfKeep(H, { destroy: () => ev.remove() }); return ev };
const __RF_L = (pt, en, es) => (typeof __L3 === "function" ? __L3(pt, en, es ?? en) : pt);
function __rfCollSet(H, x0, y0, x1, y1, v) {
  const M = H.M, g = M.g;
  if (!H.__rfMc) { H.M = Object.assign({}, M, { coll: M.coll.slice() }); H.__rfMc = 1 }
  const C = H.M.coll;
  for (let y = y0; y < y1; y += g) for (let x = x0; x < x1; x += g) {
    const gx = Math.floor(x / g), gy = Math.floor(y / g), row = C[gy];
    row && gx >= 0 && gx < row.length && (C[gy] = row.slice(0, gx) + v + row.slice(gx + 1));
  }
}
function __rfChimney(H) {
  for (const o of H.children.list.slice()) if (o.type === "Image" && o.texture?.key === "vh-props" && o.frame?.name === "chimney" && Math.abs(o.x - 296) < 6 && Math.abs(o.y - 250) < 6) o.destroy();
  __rfCollSet(H, 288, 244, 304, 252, "0");
}

/* ─── laguinho + pescaria ─── */
const __RF_LAKE = { x: 70, y: 96, w: 240, h: 84 };
function __rfLake(H) {
  if (!H.textures.exists("rf-lake")) return;
  const K = __RF_LAKE, L3 = __RF_L, A = H.anims;
  // o lago é chão: pintado direto na textura do chão (sem camada extra)
  const floor = H.textures.exists("rf-ground") ? H.textures.get("rf-ground") : null, fctx = floor?.getSourceImage?.()?.getContext?.("2d");
  if (fctx) fctx.drawImage(H.textures.get("rf-lake").getSourceImage(), K.x, K.y);
  else H.add.image(K.x, K.y, "rf-lake").setOrigin(0).setDepth(-4);
  let LD = null; try { const im = H.textures.get("rf-lake").getSourceImage(), cv = document.createElement("canvas"); cv.width = K.w; cv.height = K.h; const cx = cv.getContext("2d", { willReadFrequently: !0 }); cx.drawImage(im, 0, 0); LD = cx.getImageData(0, 0, K.w, K.h).data } catch (e) {}
  const px = (x, y) => { x |= 0; y |= 0; if (!LD || x < 0 || y < 0 || x >= K.w || y >= K.h) return null; const i = (y * K.w + x) * 4; return { red: LD[i], green: LD[i + 1], blue: LD[i + 2], alpha: LD[i + 3] } };
  // a água bloqueia o herói (alfa da imagem, em células de 8 px)
  for (let y = 0; y < K.h; y += 8) for (let x = 0; x < K.w; x += 8) {
    const c = px(x + 4, y + 4);
    c && c.alpha > 0 && __rfCollSet(H, K.x + x, K.y + y, K.x + x + 8, K.y + y + 8, "1");
  }
  const inWater = (x, y) => { const c = px(x - K.x, y - K.y); return !!c && c.alpha > 0 && c.blue > c.red + 40 };
  // pier: entra na água pela margem de baixo
  // (à direita da cabana: o telhado dela esconderia o herói)
  const PX = K.x + 196;
  let yb = 0; for (let y = 0; y < K.h; y++) { const c = px(196, y); c && c.alpha > 0 && c.blue > c.red + 40 && (yb = y) }
  const PY = K.y + yb + 18;
  if (fctx) { const pi = H.textures.get("rf-pier").getSourceImage(); fctx.drawImage(pi, Math.round(PX - pi.width / 2), PY - pi.height); floor.refresh?.() }
  else H.add.image(PX, PY, "rf-pier").setOrigin(.5, 1).setDepth(K.y + K.h - 10);
  __rfCollSet(H, PX - 8, PY - 34, PX + 8, PY - 6, "0");
  // patos nadando, sapos nas vitórias-régias, ondinhas e peixes pulando
  A.exists("rf-duck-idle") || A.create({ key: "rf-duck-idle", frames: A.generateFrameNumbers("rf-duck", { start: 0, end: 3 }), frameRate: 5, repeat: -1 });
  A.exists("rf-frog-idle") || (H.textures.exists("rf-frog") && A.create({ key: "rf-frog-idle", frames: A.generateFrameNumbers("rf-frog", { start: 0, end: 3 }), frameRate: 4, repeat: -1 }));
  for (let i = 0; i < 2; i++) {
    if (!H.textures.exists("rf-duck")) break;
    const d = __rfKeep(H, H.add.sprite(K.x + 80 + i * 70, K.y + 40, "rf-duck", 0).setOrigin(.5, .78).setScale(.8).setDepth(K.y + 30).play("rf-duck-idle"));
    d.setCrop(0, 0, 48, 34);                                  // pés debaixo d'água
    let tx = d.x, ty = d.y;
    __rfOnU(H, (_t, ms) => {
      if (!d.active) return;
      const dx = tx - d.x, dy = ty - d.y, dd = Math.hypot(dx, dy), st = 9 * Math.min(.06, ms / 1000);
      if (dd < 1) { for (let k = 0; k < 8; k++) { const nx = K.x + 30 + Math.random() * (K.w - 60), ny = K.y + 24 + Math.random() * (K.h - 44); if (inWater(nx, ny) && inWater(nx - 10, ny) && inWater(nx + 10, ny)) { tx = nx; ty = ny; break } } return }
      d.x += dx / dd * st; d.y += dy / dd * st; Math.abs(dx) > .2 && d.setFlipX(dx < 0);
    });
  }
  if (A.exists("rf-frog-idle")) for (const [x, y] of [[K.x + 52, K.y + 44], [K.x + 176, K.y + 32]]) H.add.sprite(x, y, "rf-frog", 0).setOrigin(.5, .7).setScale(.55).setDepth(K.y + 20).play("rf-frog-idle").setFlipX(x > K.x + 100);
  // ondinhas: 3 anéis prontos reaproveitados (nada de Graphics redesenhado a cada quadro)
  if (!H.textures.exists("rf-ring")) { const gg = H.make.graphics({ x: 0, y: 0 }, !1); gg.lineStyle(1, 0xc8e8f8, 1).strokeEllipse(10, 5, 18, 8); gg.generateTexture("rf-ring", 20, 10); gg.destroy() }
  const rings = [0, 1, 2].map(() => H.add.image(0, 0, "rf-ring").setDepth(K.y + 6).setVisible(!1));
  let ri = 0;
  __rfEv(H, { delay: 900, loop: !0, callback: () => {
    if (H.area !== "out") return;
    const x = K.x + 30 + Math.random() * (K.w - 60), y = K.y + 20 + Math.random() * (K.h - 40);
    if (!inWater(x, y)) return;
    const rg = rings[ri++ % 3];
    H.tweens.killTweensOf(rg);
    rg.setPosition(x, y).setScale(.1).setAlpha(.8).setVisible(!0);
    H.tweens.add({ targets: rg, scale: 1, alpha: 0, duration: 1400, onComplete: () => rg.setVisible(!1) });
    if (Math.random() < .18) {                                 // peixe pulando
      __rfTex(H);
      const f = H.add.image(x, y, "rf-px").setTint(0xd8dce8).setDepth(K.y + 40);
      H.tweens.add({ targets: f, x: x + 14, duration: 520 });
      H.tweens.add({ targets: f, y: y - 12, duration: 260, yoyo: !0, ease: "Quad.easeOut", onComplete: () => f.destroy() });
      H.tweens.add({ targets: f, angle: 160, duration: 520 });
    }
  } });
  // pescaria
  H.__fishN = 0;
  const fish = { st: 0 };
  const FISH = [["Lambari", "Lambari", "Lambari", 3, "#cfe0ff", .55], ["Tilápia", "Tilapia", "Tilapia", 6, "#d8f0b0", .33], ["Tucunaré", "Peacock bass", "Tucunaré", 10, "#ffd27a", .1], ["Peixe-dourado", "Golden fish", "Pez dorado", 18, "#ffe14a", .02]];
  const bob = H.add.container(0, 0).setDepth(K.y + 50).setVisible(!1);
  const bg = H.add.graphics(); bg.fillStyle(0xffffff, 1).fillCircle(0, -2, 2).fillStyle(0xe03a2a, 1).fillCircle(0, 0, 2.2).fillStyle(0x2a1a10, .6).fillEllipse(0, 2.5, 6, 1.6);
  bob.add(bg);
  const line = H.add.graphics().setDepth(K.y + 49);
  const say = (t, c) => H.__say?.(H.playerX, H.playerY - 40, t, 1800, c);
  const end = () => { fish.st = 0; bob.setVisible(!1); line.clear(); fish.ev?.remove(); fish.ev = null; H.tweens.killTweensOf(bob) };
  const reward = (n) => {
    try {
      if (H.fromForest) { const c = __cData(H); if (c?.d) { c.d.player ??= {}; c.d.player.gold = (c.d.player.gold ?? 0) + n; localStorage.setItem(Wt("campaign", c.sl), JSON.stringify(c.d)) } }
      else { const m = Xe(); const f = Math.max(1, Math.round(n / 5)); m.fragments = (m.fragments || 0) + f; m.totalEarned = (m.totalEarned || 0) + f; tr(m); n = f }
      H.refreshFragments?.();
    } catch (e) {}
    return n;
  };
  const pull = () => {
    if (fish.st === 1) { end(); say(L3("Puxou cedo demais! O peixe fugiu.", "Too early! The fish got away.", "¡Demasiado pronto! El pez escapó."), "#ffb0a0"); return }
    if (fish.st !== 2) return;
    end();
    let r = Math.random(), k = 0; for (; k < FISH.length - 1 && r > FISH[k][5]; k++) r -= FISH[k][5];
    const F = FISH[k], n = reward(F[3]);
    H.__fishN++;
    const fx = H.add.text(H.playerX, H.playerY - 30, `🐟 ${L3(F[0], F[1], F[2])}  +${n}${H.fromForest ? " ●" : " ◆"}`, { ...Le, fontSize: "9px", color: F[4], stroke: "#120c08", strokeThickness: 3 }).setOrigin(.5).setScale(.8).setDepth(9200);
    H.tweens.add({ targets: fx, y: fx.y - 22, alpha: 0, delay: 900, duration: 900, onComplete: () => fx.destroy() });
    H.game.audioEngine?.sfx?.("sfx-item-pickup");
  };
  const cast = () => {
    if (fish.st) return pull();
    if (H.__fishN >= 5) { say(L3("Os peixes se esconderam. Volte numa próxima visita.", "The fish are hiding. Come back next visit.", "Los peces se escondieron. Vuelve en otra visita."), "#cfe0ff"); return }
    const bx = PX + (Math.random() * 30 - 15), by = PY - 42 - Math.random() * 10;
    fish.st = 1; bob.setPosition(bx, by).setVisible(!0).setAlpha(1);
    const draw = () => { line.clear().lineStyle(1, 0xe8e8e8, .7).lineBetween(H.playerX + 6, H.playerY - 20, bob.x, bob.y - 2) };
    draw(); H.tweens.add({ targets: bob, y: by + 1, duration: 700, yoyo: !0, repeat: -1, ease: "Sine.easeInOut", onUpdate: draw });
    say(L3("Agora é esperar a boia afundar…", "Now wait for the bobber to sink…", "Ahora espera a que se hunda el corcho…"), "#cfe0ff");
    fish.ev = H.time.delayedCall(1500 + Math.random() * 3000, () => {
      if (fish.st !== 1) return;
      fish.st = 2; H.tweens.killTweensOf(bob); bob.y += 3; bob.setAlpha(.55);
      const ex = H.add.text(bob.x, bob.y - 12, "!", { ...Le, fontSize: "12px", color: "#ffe14a", stroke: "#120c08", strokeThickness: 3 }).setOrigin(.5).setDepth(9200);
      H.game.audioEngine?.sfx?.("sfx-ui-move");
      fish.ev = H.time.delayedCall(750, () => { ex.destroy(); if (fish.st === 2) { end(); say(L3("Escapou… puxe quando aparecer o !", "It got away… pull when the ! shows up", "Se escapó… tira cuando aparezca el !"), "#ffb0a0") } });
      H.time.delayedCall(750, () => ex.active && ex.destroy());
    });
  };
  // afastou do pier: recolhe a linha
  H.events.on("update", () => { if (fish.st && Math.hypot(H.playerX - PX, H.playerY - (PY + 8)) > 40) end() });
  H.inters.push({ area: "out", id: "fish", x: PX, y: PY + 4, ay: PY + 10, r: 26, label: L3("PESCAR", "FISH", "PESCAR"), desc: L3("Espere a boia afundar e puxe na hora", "Wait for the bobber to sink, then pull", "Espera a que se hunda y tira"), act: () => cast() });
  const lab = H.add.text(K.x + K.w / 2, K.y - 6, L3("LAGUINHO", "POND", "LAGUITO"), { ...Le, fontSize: "8px", color: "#a8d8f0", stroke: "#120c08", strokeThickness: 3 }).setOrigin(.5, 1).setScale(.7).setDepth(9100).setAlpha(.9);
  H.labels.push(lab);
}

/* ─── progresso da campanha ─── */
function __rfProg(H) {
  let slot = H.fromForest ? H.retSlot : (H.game.registry.get("save:slot") ?? 1), done = [], fin = !1;
  try { const d = Dn(slot); if (d.ok) { fin = !!d.data.campaign?.completed; done = d.data.campaign?.completedDungeons || [] } } catch (e) {}
  if (!done.length) try { done = JSON.parse(localStorage.getItem("depthgate:portals:slot_" + slot) || "[]") } catch (e) {}
  return { n: Array.isArray(done) ? done.length : 0, fin };
}
function __rfGrowth(H) {
  if (!H.fromForest) return;
  const { n, fin } = __rfProg(H), M = H.M;
  H.__rfStage = n;
  const lamps = M.lamps;                                       // [344,352] [680,352] [344,560] [680,560] [430,600] [594,600]
  let bn = 0;
  // cada varal vira uma textura do tamanho justo dele (pouca área transparente para a placa de vídeo pintar)
  const bunting = (a, b, sag, cols, lant) => {
    const W = []; for (let i = 0; i <= 24; i++) { const t = i / 24; W.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t + Math.sin(Math.PI * t) * sag]) }
    const x0 = Math.min(...W.map((p) => p[0])) - 4, y0 = Math.min(...W.map((p) => p[1])) - 2, x1 = Math.max(...W.map((p) => p[0])) + 4, y1 = Math.max(...W.map((p) => p[1])) + (lant ? 14 : 9);
    const pts = W.map(([x, y]) => [x - x0, y - y0]);
    const g = H.make.graphics({ x: 0, y: 0 }, !1);
    g.lineStyle(1, 0x3a2a1a, .9); g.beginPath(); g.moveTo(...pts[0]); for (const p of pts) g.lineTo(...p); g.strokePath();
    for (let i = 1; i < 24; i += 2) { const [x, y] = pts[i]; g.fillStyle(cols[(i >> 1) % cols.length], 1).fillTriangle(x - 3, y, x + 3, y, x, y + 6).lineStyle(1, 0x2a1a10, .5).strokeTriangle(x - 3, y, x + 3, y, x, y + 6) }
    if (lant) for (let i = 4; i < 24; i += 6) {
      const [x, y] = pts[i];
      g.fillStyle(0x3a2a1a, 1).fillRect(x - .5, y, 1, 3).fillStyle(0xe8742a, 1).fillEllipse(x, y + 7, 7, 8).fillStyle(0xffc860, 1).fillEllipse(x, y + 7, 3, 5);
      LIT.push([x + x0, y + y0 + 7]);
    }
    const key = "rf-bunt" + bn++;
    H.textures.exists(key) && H.textures.remove(key);
    g.generateTexture(key, Math.ceil(x1 - x0), Math.ceil(y1 - y0)); g.destroy();
    H.add.image(x0, y0, key).setOrigin(0).setDepth(8400);
  };
  const LIT = [];
  const C1 = [0xd84a3a, 0xf0c040, 0x4a9ad8, 0x68b850, 0xf0f0e0], CG = [0xe8c050, 0xf8e8a0, 0xc89830];
  if (n >= 1) bunting([lamps[0][0], lamps[0][1] - 30], [lamps[1][0], lamps[1][1] - 30], 26, fin ? CG : C1, n >= 3);
  if (n >= 2) bunting([lamps[2][0], lamps[2][1] - 30], [lamps[3][0], lamps[3][1] - 30], 22, fin ? CG : C1, n >= 3);
  if (n >= 4) bunting([lamps[4][0], lamps[4][1] - 30], [lamps[5][0], lamps[5][1] - 30], 16, fin ? CG : C1, n >= 6);
  // estátua da Guardiã (5+ regiões)
  if (n >= 5 && H.textures.exists("guardia-sp-idle")) {
    const x = 512, y = 560;
    // pedra: a Guardiã em tons de cinza (cópia dessaturada do quadro 0)
    if (!H.textures.exists("rf-statue")) {
      const fr = H.textures.getFrame("guardia-sp-idle", 0), cv = document.createElement("canvas"); cv.width = fr.cutWidth; cv.height = fr.cutHeight;
      const cx2 = cv.getContext("2d"); cx2.drawImage(fr.source.image, fr.cutX, fr.cutY, fr.cutWidth, fr.cutHeight, 0, 0, fr.cutWidth, fr.cutHeight);
      const id = cx2.getImageData(0, 0, cv.width, cv.height), d = id.data;
      for (let i = 0; i < d.length; i += 4) { const l = d[i] * .3 + d[i + 1] * .59 + d[i + 2] * .11, v = 46 + l * .5; d[i] = v; d[i + 1] = v * .98; d[i + 2] = v * 1.04 }
      cx2.putImageData(id, 0, 0); H.textures.addCanvas("rf-statue", cv);
    }
    if (!H.textures.exists("rf-plinth")) {                    // pedestal pronto como textura
      const g = H.make.graphics({ x: 0, y: 0 }, !1), X = 16, Y = 22;
      g.fillStyle(0, .3).fillEllipse(X, Y + 1, 30, 7);
      g.fillStyle(0x6e6a72, 1).fillRoundedRect(X - 13, Y - 12, 26, 12, 3).fillStyle(0x8e8a92, 1).fillRoundedRect(X - 11, Y - 12, 22, 3, 1);
      g.fillStyle(0x5a5660, 1).fillRoundedRect(X - 10, Y - 20, 20, 9, 2);
      g.generateTexture("rf-plinth", 32, 26); g.destroy();
    }
    H.add.image(x - 16, y - 22, "rf-plinth").setOrigin(0).setDepth(y);
    H.add.image(x, y - 19, H.textures.exists("rf-statue") ? "rf-statue" : "guardia-sp-idle", 0).setOrigin(.5, 124 / 128).setScale(.6).setDepth(y + 1);
    __rfCollSet(H, x - 14, y - 10, x + 14, y, "1");
    H.inters.push({ area: "out", id: "statue", x, y: y + 4, ay: y + 12, r: 30, label: __RF_L("ESTÁTUA DA GUARDIÃ", "GUARDIAN STATUE", "ESTATUA DE LA GUARDIANA"), desc: "", act: () => H.__say?.(x, y - 60, __RF_L("“Para quem guardou a luz enquanto o mundo escurecia.”", "“For the one who kept the light while the world went dark.”", "“Para quien guardó la luz mientras el mundo se oscurecía.”"), 3200, "#f0e6c8") });
  }
  // estandartes dourados no fim da campanha
  if (fin) for (const o of H.children.list) o === H.__rfFloor || (o.frame?.name === "banner" && o.texture?.key === "rf-deco" && o.setTint(0xffe08a));
  if (fin && H.__rfFloor) for (const x of [292, 452, 572, 720]) H.add.image(x, 58 + 35, "rf-deco", "banner").setOrigin(.5, 1).setDepth(-2).setTint(0xffe08a);   // estandartes dourados por cima dos vermelhos
}
/* quem você ajudou vem morar no Refúgio */
function __rfResidents(H) {
  if (!H.fromForest) return;
  let st = {};
  try { const tag = window.__heroTag ? window.__heroTag(H.game.registry, 1, H) : H.retSlot; st = JSON.parse(localStorage.getItem("depthgate:story:" + tag) || "{}") || {} } catch (e) {}
  const q = (k) => st["q_" + k] ?? 0, L3 = __RF_L;
  try { __qAnims(H) } catch (e) {}
  const A = H.anims;
  if (H.textures.exists("carcereiro") && !A.exists("carcereiro-idle")) A.create({ key: "carcereiro-idle", frames: A.generateFrameNumbers("carcereiro", { start: 0, end: 5 }), frameRate: 6, repeat: -1 });
  const add = (tex, anim, x, y, sc, lines, o = {}) => {
    if (!H.textures.exists(tex)) return null;
    const s = H.add.sprite(x, y, tex, 0).setOrigin(.5, 1).setScale(sc).setDepth(y);
    A.exists(anim) && s.play(anim);
    o.flip && s.setFlipX(!0);
    __rfShadow(H, x, y, 18, 5, .28).setDepth(y - 1);
    __rfCollSet(H, x - 6, y - 6, x + 6, y, "1");
    let k = 0;
    H.inters.push({ area: "out", id: "res-" + tex, x, y: y + 2, ay: y + 12, r: 30, label: o.name, desc: "", act: () => { const l = lines[k++ % lines.length]; H.__say?.(x, y - (o.h ?? 46), l, 3000, "#fff3c4") } });
    const lb = H.add.text(x, y - (o.h ?? 46) + 8, o.name, { ...Le, fontSize: "8px", color: "#cfe0a0", stroke: "#120c08", strokeThickness: 3 }).setOrigin(.5, 1).setScale(.6).setDepth(9100).setAlpha(.85);
    H.labels.push(lb);
    return s;
  };
  const C = H.M.spots.campfire;
  if (q("pj") === 3) add("paje", "paje-sit", C[0] - 30, C[1] + 22, .5, [
    L3("O fogo daqui é manso. Lembra o igapó antes da sombra.", "The fire here is gentle. It reminds me of the igapó before the shadow.", "El fuego aquí es manso. Recuerda al igapó antes de la sombra."),
    L3("Senta, curumim. Uma história curta antes da próxima viagem.", "Sit, young one. A short story before your next journey.", "Siéntate, pequeño. Una historia corta antes del próximo viaje.")], { name: L3("PAJÉ", "SHAMAN ELDER", "CHAMÁN"), h: 40 });
  if (q("bp") === 9) add("freira", "freira-idle", 792, 300, .55, [
    L3("Eu acendo uma vela no santuário para cada herói que volta.", "I light a candle at the shrine for every hero who returns.", "Enciendo una vela en el santuario por cada héroe que vuelve."),
    L3("O olho bordado no manto… nunca mais. Aqui só há luz.", "The eye stitched on the robe… never again. Here there is only light.", "El ojo bordado en el manto… nunca más. Aquí solo hay luz.")], { name: L3("IRMÃ", "SISTER", "HERMANA"), flip: !0 });
  if (q("ck") === 3 && H.textures.exists("menino")) {
    const kid = add("menino", "menino-idle", 244, 562, .36, [
      L3("O Caramelo deixa eu fazer carinho! O lobo ainda não…", "Caramelo lets me pet him! The wolf, not yet…", "¡Caramelo me deja acariciarlo! El lobo, todavía no…"),
      L3("Quando eu crescer, vou cuidar dos pets do Refúgio.", "When I grow up, I'll take care of the Refuge's pets.", "Cuando crezca, cuidaré de las mascotas del Refugio.")], { name: L3("MENINO", "BOY", "NIÑO"), h: 34 });
    if (kid) {                                                // corre de um lado para o outro na frente do cercado
      __rfCollSet(H, 238, 556, 250, 562, "0");
      let dir = 1;
      H.time.addEvent({ delay: 3800, loop: !0, callback: () => { if (!kid.active) return; dir = -dir; kid.setFlipX(dir < 0); A.exists("menino-run") && kid.play("menino-run"); H.tweens.add({ targets: kid, x: kid.x + dir * 46, duration: 1300, onComplete: () => A.exists("menino-idle") && kid.play("menino-idle") }) } });
    }
  }
  if (q("cc") === 2) add("carcereiro", "carcereiro-idle", 584, 336, .5, [
    L3("Corrente nenhuma me prende mais. Agora eu ajudo o ferreiro a forjar as dele.", "No chain holds me now. I help the smith forge his own.", "Ninguna cadena me ata ya. Ahora ayudo al herrero a forjar las suyas."),
    L3("Se o dragão acordar de novo, me chame. Eu sei onde ficam as fechaduras.", "If the dragon wakes again, call me. I know where the locks are.", "Si el dragón despierta otra vez, llámame. Sé dónde están las cerraduras.")], { name: "DURGAN", h: 36, flip: !0 });
}

/* ─── céu: hora do dia e chuva ─── */
function __rfSky(H) {
  const sh = H.shade; if (!sh) return;
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  // [cor, alfa]: noite azul-escura, amanhecer rosado, dia limpo, entardecer laranja-roxo (o padrão antigo)
  const P = h < 5 ? [0x0c1430, .5] : h < 7 ? [0x6a3a5a, .28] : h < 9 ? [0xf0b070, .1] : h < 16.5 ? [0xffffff, 0] : h < 18 ? [0xe08040, .14] : h < 19.5 ? [0x1a2032, .26] : [0x0c1430, .46];
  sh.setFillStyle(P[0], 1).setAlpha(P[1]).setVisible(P[1] > 0);       // de dia: uma camada de tela inteira a menos
  H.__rfSkyA = P[1];
  H.__rfNight = h < 6 || h >= 19;
  // à noite os vaga-lumes e as lanternas ficam mais fortes; de dia os vaga-lumes somem
  const day = h >= 8 && h < 17;
  for (const f of H.__rfFF || []) f.o.setVisible(!day);
  // chuva fina: um dia em cada ~7 (fixo para o dia, para não piscar entre visitas)
  const d = new Date(), seed = d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate();
  if ((seed * 9301 + 49297) % 233280 / 233280 < .15) {
    const cam = H.cameras.main;
    sh.setAlpha(Math.max(sh.alpha, .2)).setFillStyle(0x2a3448, 1); H.__rfSkyA = sh.alpha;
    if (!H.textures.exists("rf-drop")) { const gg = H.make.graphics({ x: 0, y: 0 }, !1); gg.fillStyle(0xb8c8e8, 1).fillRect(0, 0, 1, 6); gg.generateTexture("rf-drop", 1, 6); gg.destroy() }
    try {
      const em = __rfKeep(H, H.add.particles(0, 0, "rf-drop", { x: { min: -40, max: 520 }, y: -10, speedY: { min: 380, max: 460 }, speedX: -70, rotate: 10, lifespan: 800, quantity: 1, frequency: 45, alpha: { start: .55, end: .2 }, maxParticles: 40 }).setDepth(9050));
      __rfOnU(H, () => { if (!em.active) return; const v = cam.worldView; em.setPosition(v.x, v.y); em.emitting = H.area === "out" });
    } catch (e) {}
  }
}
/* modo leve: se o aparelho não segura o Refúgio (abaixo de ~40 quadros/s), os enfeites animados (bichos soltos,
   borboletas, vaga-lumes, passarinhos, ondinhas, folhas, chuva, luzes extras) são desligados e a escolha fica
   guardada no aparelho para as próximas visitas. */
const __RF_LITE_K = "depthgate:refugio:lite";
function __rfLite(H, save) {
  if (H.__rfLiteOn) return; H.__rfLiteOn = 1;
  for (const o of H.__rfLive || []) { try { o.destroy() } catch (e) {} }
  H.__rfLive = [];
  if (save) try { localStorage.setItem(__RF_LITE_K, "1") } catch (e) {}
}
function __rfQuality(H) {
  let lite = !1; try { lite = localStorage.getItem(__RF_LITE_K) === "1" } catch (e) {}
  if (lite) return __rfLite(H, !1);
  const check = (k) => { if (!H.scene.isActive()) return; const f = H.game.loop.actualFps; if (f < 40) __rfLite(H, !0); else if (k < 2) H.time.delayedCall(5000, () => check(k + 1)) };
  H.time.delayedCall(2500, () => check(0));
}
window.__dgRefugio2 = { prog: __rfProg, sky: __rfSky };
