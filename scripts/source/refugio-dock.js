/* ══ Refúgio: a Doca (setor aberto para o mar, ao sul do portal) ══
   O chão novo (grama, caminho de tijolo, margem, mar, chão do píer e barcos) já vem no ground.png e a colisão no
   village.json (scripts/build_refugio_dock.py). Aqui: os objetos altos da doca com profundidade pela base (casa,
   rede, tubarão, caixotes, barris, varal de peixes, postes), peixes pulando no mar, brilho na água e o nome do lugar.
   No raso (M.shallow) o herói anda mais devagar, com a água pelas pernas, ondinhas em volta e som de passo n'água;
   a espuma vai e volta na beira e o som do mar cresce conforme ele chega perto da praia (ondas sintetizadas).
   Arte: CraftPix "2D Pixel Fishing Village" (só cenário e peixes; os personagens do pacote não entram). */
{
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path; L.setPath("");
      this.textures.exists("rf-dock") || L.atlas("rf-dock", "assets/pixel-art/hub/refugio/dock.png", "assets/pixel-art/hub/refugio/dock.json");
      for (const k of ["fish-jump", "fish-jump2"]) this.textures.exists("rf-" + k) || L.spritesheet("rf-" + k, `assets/pixel-art/hub/refugio/${k}.png`, { frameWidth: 32, frameHeight: 32 });
      L.setPath(op);
    } catch (e) {}
    return r;
  };
  const I0 = Fl.prototype.__inters;
  Fl.prototype.__inters = function () {
    const r = I0.apply(this, arguments);
    try { this.textures.exists("rf-dock") && __rfDock(this) } catch (e) { console.warn("[doca]", e) }
    return r;
  };
}
function __rfDock(H) {
  const M = H.M, D = M.dockProps, R = M.dockRect; if (!D || !R) return;
  const LIVE = H.__rfLive || [], keep = o => (LIVE.push(o), o), rnd = Math.random;
  const FO = M.feetOff || 0; for (const [k, x, y] of D) H.add.image(x, y, "rf-dock", k).setOrigin(.5, 1).setDepth(y - FO);   // profundidade pelos pés do herói
  const A = H.anims;
  A.exists("rf-fj1") || A.create({ key: "rf-fj1", frames: A.generateFrameNumbers("rf-fish-jump", { start: 0, end: 8 }), frameRate: 11 });
  A.exists("rf-fj2") || A.create({ key: "rf-fj2", frames: A.generateFrameNumbers("rf-fish-jump2", { start: 0, end: 8 }), frameRate: 11 });
  const g = M.g, inDock = (x, y) => x > R[0] - 10 && x < R[0] + R[2] + 10 && y > R[1] - 10 && y < R[1] + R[3] + 10;
  const sea = (x, y) => { if (y < M.seaTop + 14 || y > M.h - 16 || x < 24 || x > M.w - 24 || inDock(x, y)) return !1; const r = M.coll[Math.floor(y / g)]; return !!r && r[Math.floor(x / g)] === "1" && r[Math.floor(x / g) + 2] === "1" && r[Math.floor(x / g) - 2] === "1" };
  const spot = () => { for (let i = 0; i < 20; i++) { const x = 30 + rnd() * (M.w - 60), y = M.seaTop + 20 + rnd() * (M.h - M.seaTop - 40); if (sea(x, y)) return [x, y] } return null };
  // peixes pulando de vez em quando
  keep(((ev) => ({ destroy: () => ev.remove() }))(H.time.addEvent({ delay: 2200, loop: !0, callback: () => {
    if (H.area !== "out" || rnd() < .45) return; const p = spot(); if (!p) return;
    const f = H.add.sprite(p[0], p[1], rnd() < .5 ? "rf-fish-jump" : "rf-fish-jump2", 0).setOrigin(.5, .8).setDepth(p[1]).setFlipX(rnd() < .5);
    f.play(f.texture.key === "rf-fish-jump" ? "rf-fj1" : "rf-fj2"); f.once("animationcomplete", () => f.destroy());
  } })));
  // brilho na água: risquinhos claros que acendem e apagam
  __rfTex?.(H);
  for (let i = 0; i < 34; i++) {
    const p = spot(); if (!p) continue;
    const s = keep(H.add.image(p[0], p[1], "rf-px")).setDisplaySize(4 + ((rnd() * 4) | 0) * 2, 1).setTint(0xd8f0ff).setAlpha(0).setDepth(-20);
    keep(H.tweens.add({ targets: s, alpha: { from: 0, to: .7 }, duration: 700 + rnd() * 700, yoyo: !0, repeat: -1, repeatDelay: 1200 + rnd() * 3000, delay: rnd() * 3000 }));
  }
  // nome do lugar
  const sp = M.spots.dock || [R[0] + 150, R[1] + 118];
  const lab = H.add.text(sp[0] + 60, R[1] + 10, __L3("DOCA", "DOCK", "MUELLE"), { ...Le, fontSize: "8px", color: "#a8d8f0", stroke: "#120c08", strokeThickness: 3 }).setOrigin(.5, 1).setScale(.7).setDepth(9100).setAlpha(.9);
  H.labels.push(lab);
  __rfBeach(H);
}
/* ── praia: raso, espuma e som ─────────────────────────────────────────────────────────────────────── */
function __rfShal(H, x, y) { const S = H.M.shallow, g = H.M.g; if (!S || H.area !== "out") return 0; const r = S.rows[Math.floor(y / g) - S.y0]; return r ? +r[Math.floor(x / g)] || 0 : 0 }
function __rfBeach(H) {
  const M = H.M, R = M.dockRect, SY = M.shoreY; if (!SY) return;
  const LIVE = H.__rfLive || [], keep = o => (LIVE.push(o), o), rnd = Math.random, g = M.g;
  if (!H.textures.exists("rf-ring")) { const q = H.make.graphics({ x: 0, y: 0 }, !1); q.lineStyle(1, 0xffffff, 1).strokeEllipse(12, 4, 22, 6); q.generateTexture("rf-ring", 24, 8); q.destroy() }
  if (!H.textures.exists("rf-wcov")) { const q = H.make.graphics({ x: 0, y: 0 }, !1); q.fillStyle(0xffffff, 1).fillEllipse(10, 3, 20, 6).fillRect(0, 3, 20, 13); q.generateTexture("rf-wcov", 20, 16); q.destroy() }
  // espuma: risquinhos brancos que sobem e descem na linha d'água, em onda que corre pela praia
  const inDockX = x => x > R[0] + 10 && x < R[0] + 292;
  for (let x = 8; x < M.w - 8; x += 12) {
    if (inDockX(x)) continue; const y0 = SY[Math.floor(x / g)] + 1;
    const f = keep(H.add.image(x + rnd() * 4, y0, "rf-px")).setDisplaySize(6 + ((rnd() * 3) | 0) * 2, 2).setTint(0xf2fbff).setAlpha(.75).setDepth(-21);
    keep(H.tweens.add({ targets: f, y: y0 - 4 - rnd() * 2, alpha: { from: .8, to: .25 }, duration: 1700, yoyo: !0, repeat: -1, ease: "Sine.easeInOut", delay: (x * 3.1) % 3400 }));
  }
  // herói no raso: água pelas pernas, linha d'água, ondinhas, mais devagar e passos molhados
  const WC = 0x5f9fb6, cov = H.add.image(0, 0, "rf-wcov").setOrigin(.5, 1).setTint(WC).setAlpha(0), line = H.add.image(0, 0, "rf-ring").setOrigin(.5, .5).setTint(0xe8f8ff).setAlpha(0);
  let lvl0 = 0, stepT = 0, ringT = 0, px = H.playerX, py = H.playerY;
  const ring = (x, y, big) => { const r = H.add.image(x, y, "rf-ring").setTint(0xeafaff).setAlpha(.7).setDepth(H.playerY - .5).setScale(big ? .7 : .45); H.tweens.add({ targets: r, scale: big ? 1.6 : 1.15, alpha: 0, duration: big ? 900 : 700, onComplete: () => r.destroy() }) };
  const drops = (x, y, n) => { for (let i = 0; i < n; i++) { const d = H.add.image(x + (rnd() - .5) * 8, y - 2, "rf-px").setDisplaySize(2, 2).setTint(0xeafaff).setDepth(H.playerY + 2); H.tweens.add({ targets: d, x: d.x + (rnd() - .5) * 18, y: { value: y - 6 - rnd() * 8, ease: "Quad.easeOut" }, duration: 220, yoyo: !0, onComplete: () => d.destroy() }) } };
  const onPre = () => { px = H.playerX; py = H.playerY };
  const onPost = (t, dt) => {
    const lvl = __rfShal(H, H.playerX, H.playerY), moved = Math.hypot(H.playerX - px, H.playerY - py);
    if (lvl && moved > 0 && !H.__dashT) {   // mais devagar quanto mais fundo
      const k = [1, .8, .68, .58][lvl]; H.playerX = px + (H.playerX - px) * k; H.playerY = py + (H.playerY - py) * k;
      H.rig?.container?.setPosition(H.playerX, H.playerY);
    }
    const c = H.rig?.container, sh = c?.list?.[0], x = H.playerX, d0 = H.playerY, sp = c?.list?.find(o => o.type === "Sprite" && o.visible), y = d0 + (sp ? (sp.y + sp.height * .33) * (c.scaleY || .6) : 24), hgt = [0, 4, 7, 10][lvl];   // y = pés (a sombra do herói)
    cov.setVisible(!!lvl); line.setVisible(!!lvl); sh && sh.setVisible(!lvl);
    if (lvl) { cov.setPosition(x, y + 3).setDisplaySize(18, hgt + 5).setAlpha(.72).setDepth(d0 + 1); line.setPosition(x, y - hgt + 1).setAlpha(.85).setDepth(d0 + 1.5) }
    if (lvl && !lvl0) { __rfSfx(H, "splash", .35); ring(x, y - hgt + 1, !0); drops(x, y - hgt, 6) }
    if (!lvl && lvl0) __rfSfx(H, "step", .4);
    lvl0 = lvl; stepT -= dt; ringT -= dt;
    if (lvl && moved > .2) { if (stepT <= 0) { stepT = 380 + lvl * 40; __rfSfx(H, "wade", .32 + lvl * .08); drops(x, y - hgt, 2 + lvl) } if (ringT <= 0) { ringT = 240; ring(x, y - hgt + 1, !1) } }
    else if (lvl && ringT <= 0) { ringT = 1300; ring(x, y - hgt + 1, !1) }
  };
  H.events.on("preupdate", onPre); H.events.on("postupdate", onPost); __rfSfx(H, "step", 0);   // já deixa os sons carregando
  // som do mar (ondas sintetizadas: chiado grave que cresce e recua) pela distância até a beira
  const E = H.game.audioEngine, C = E?.ctx; let au = null;
  if (C) try {
    const n = C.sampleRate * 2, b = C.createBuffer(1, n, C.sampleRate), d = b.getChannelData(0); let l = 0;
    for (let i = 0; i < n; i++) { const w = Math.random() * 2 - 1; l = (l + .04 * w) / 1.04; d[i] = l * 3.2 + w * .12 }
    const src = C.createBufferSource(); src.buffer = b; src.loop = !0;
    const lp = C.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    const swell = C.createGain(); swell.gain.value = .25; const hs = C.createBiquadFilter(); hs.type = "highpass"; hs.frequency.value = 1800; const fizz = C.createGain(); fizz.gain.value = 0;
    const master = C.createGain(); master.gain.value = 0;
    src.connect(lp); lp.connect(swell); swell.connect(master); src.connect(hs); hs.connect(fizz); fizz.connect(master); master.connect(E.ambientBus || E.masterGain || C.destination); src.start();
    au = { src, swell, fizz, master };
  } catch (e) { au = null }
  const wave = () => { if (!au) return; const t0 = C.currentTime; au.swell.gain.setTargetAtTime(.95, t0, .55); au.fizz.gain.setTargetAtTime(.22, t0 + 1.1, .12); au.swell.gain.setTargetAtTime(.22, t0 + 1.6, 1.3); au.fizz.gain.setTargetAtTime(0, t0 + 1.7, .9) };
  const ev1 = H.time.addEvent({ delay: 6200, loop: !0, callback: () => H.time.delayedCall(rnd() * 1800, wave) }); wave();
  const ev2 = H.time.addEvent({ delay: 200, loop: !0, callback: () => {
    if (!au) return; const col = Math.max(0, Math.min(SY.length - 1, Math.floor(H.playerX / g))), dist = SY[col] - H.playerY;
    const v = H.area !== "out" || !H.sys.isActive() ? 0 : Math.max(0, Math.min(1, 1 - (dist - 20) / 260)) * .55;
    au.master.gain.setTargetAtTime(v, C.currentTime, .4);
  } });
  const stop = () => { ev1.remove(); ev2.remove(); H.events.off("preupdate", onPre); H.events.off("postupdate", onPost); if (au) { try { au.master.gain.setTargetAtTime(0, C.currentTime, .15); const a = au; setTimeout(() => { try { a.src.stop(); a.src.disconnect(); a.master.disconnect() } catch (e) { } }, 600) } catch (e) { } au = null } };
  H.events.once("shutdown", stop); H.events.once("destroy", stop);
  H.events.on("sleep", () => au && au.master.gain.setTargetAtTime(0, C.currentTime, .1));
}
/* efeitos curtos de água (passo n'água, splash, passo na areia): o mesmo banco de sons do barco do prólogo */
function __rfSfx(H, kind, vol = 1) {
  const E = H.game.audioEngine, C = E?.ctx; if (!C) return;
  const W_ = window, play = () => { const L = W_.__rfBoatMap?.[kind]; if (!L || !W_.__rfBoatBuf) return; const [o, d] = L[(Math.random() * L.length) | 0];
    try { const src = C.createBufferSource(); src.buffer = W_.__rfBoatBuf; src.playbackRate.value = .92 + Math.random() * .16; const gn = C.createGain(); gn.gain.value = vol; src.connect(gn); gn.connect(E.sfxBus || E.ambientBus || C.destination); src.start(0, o, d) } catch (e) { } };
  if (W_.__rfBoatBuf) return play();
  if (W_.__rfBoatLoading) return; W_.__rfBoatLoading = 1;
  const ext = (new Audio()).canPlayType?.("audio/ogg") ? "ogg" : "mp3";
  fetch("assets/audio/ambient/boat-sfx.json").then(r => r.json()).then(j_ => { W_.__rfBoatMap = j_; return fetch("assets/audio/ambient/boat-sfx." + ext) }).then(r => r.arrayBuffer()).then(b => C.decodeAudioData(b)).then(b => { W_.__rfBoatBuf = b }).catch(() => { W_.__rfBoatLoading = 0 });
}
