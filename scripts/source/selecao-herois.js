/* ══ Tela de escolha: heróis em pixel art, pose de apresentação e animados (p216.90–92) ══
   Arte: PixelLab a partir do sprite de cada herói (scripts/gerar_selecao_herois.py e gerar_selecao_acoes.py →
   build_selecao_herois.py → assets/pixel-art/heroes-sel/): <classe>.png (0 = pose, 1–8 = parado respirando),
   <classe>-acao.png (ação especial que começa e termina na pose) e x-*.png (caveira, lobo, urso).
   Folhas de 256×256 em escala 1, pé na sombra do palco. Herói bloqueado: silhueta escura e parada.
   Ação especial (p216.92): ~3 s depois de escolher o herói e depois a cada ~10 s —
   Cavaleiro limpa a espada · Arqueiro testa o arco · Maga solta magia do orbe · Ladina some e volta das sombras ·
   Necromante ergue uma caveira da terra · Araí toca a terra (folhas e vagalumes) · Samurai saca e guarda a katana ·
   Caçador assobia e o lobo chega correndo · Druida vira urso por alguns segundos e volta. */
{
 const P = "./assets/pixel-art/heroes-sel/";
 let MAN = null;
 const load = (S, done) => {
  const go = () => {
   const L = S.load; let n = 0;
   const sheet = (k, f, w, h) => { if (!S.textures.exists(k)) { L.spritesheet(k, P + f, { frameWidth: w, frameHeight: h || w }); n++ } };
   for (const c in MAN) {
    if (c === "_x") continue;
    sheet("sel-" + c, c + ".png", MAN[c].size);
    MAN[c].acao && sheet("sel-" + c + "-acao", c + "-acao.png", MAN[c].size);
   }
   for (const x in MAN._x || {}) { const m = MAN._x[x]; sheet("selx-" + x, "x-" + x + ".png", m.w, m.h) }
   if (!n) return done();
   L.once("complete", done); L.start();
  };
  if (MAN) return go();
  if (S.cache.json.exists("sel-man")) { MAN = S.cache.json.get("sel-man"); return go() }
  S.load.json("sel-man", P + "manifest.json"); S.load.once("complete", () => { MAN = S.cache.json.get("sel-man") || {}; go() }); S.load.start();
 };
 const anim = (S, key, tex, a, b, fr, rep, yoyo) => { if (!S.anims.exists(key) && S.textures.exists(tex)) S.anims.create({ key, frames: S.anims.generateFrameNumbers(tex, { start: a, end: b }), frameRate: fr, repeat: rep, yoyo: !!yoyo }); return key };

 /* efeitos de pixel: quadradinhos que sobem/espalham */
 const bits = (S, x, y, n, cols, o = {}) => {
  for (let i = 0; i < n; i++) {
   const c = cols[i % cols.length], s = o.size || (Math.random() < .3 ? 3 : 2);
   const r = S.add.rectangle(x + (Math.random() - .5) * (o.w || 30), y + (Math.random() - .5) * (o.h || 10), s, s, c).setDepth(o.d ?? 6).setAlpha(o.a ?? 1);
   fx(S, r);
   S.tweens.add({ targets: r, x: r.x + (Math.random() - .5) * (o.dx || 40), y: r.y - (o.up ?? 40) * (.4 + Math.random()), alpha: 0, duration: (o.t || 900) * (.6 + Math.random() * .7), delay: Math.random() * (o.spread || 300), ease: "Quad.easeOut", onComplete: () => r.destroy() });
  }
 };
 const smoke = (S, x, y, n) => {
  for (let i = 0; i < n; i++) {
   const r = S.add.circle(x + (Math.random() - .5) * 50, y - Math.random() * 110, 6 + Math.random() * 10, i % 3 ? 0x140c18 : 0x2a1a34, .85).setDepth(6);
   fx(S, r);
   S.tweens.add({ targets: r, scale: 1.8 + Math.random(), alpha: 0, x: r.x + (Math.random() - .5) * 40, y: r.y - 10 - Math.random() * 20, duration: 700 + Math.random() * 500, ease: "Quad.easeOut", onComplete: () => r.destroy() });
  }
 };
 const flash = (S, x, y, col, sc = 1.2) => {
  if (!S.textures.exists("light")) return;
  const f = S.add.image(x, y, "light").setBlendMode(j.BlendModes.ADD).setTint(col).setScale(.1).setAlpha(.9).setDepth(7);
  fx(S, f);
  S.tweens.add({ targets: f, scale: sc, alpha: 0, duration: 520, ease: "Quad.easeOut", onComplete: () => f.destroy() });
 };

 /* palco: recorte entre o painel da lista e o painel de detalhes (os efeitos não passam por cima deles) */
 const stageMask = (S) => {
  if (S.__selMask) return S.__selMask;
  const h = S.hero, X = h ? h.x : 318, g = S.make.graphics({ add: !1 });
  g.fillStyle(0xffffff).fillRect(X - 116, 0, 236, 2000);
  return (S.__selMask = g.createGeometryMask());
 };
 const fx = (S, o, mask) => { o.__selTag = 1; S.__selFx.push(o); mask && o.setMask(stageMask(S)); return o };
 const stop = (S) => {
  S.__selT?.forEach((t) => t.remove?.()); S.__selT = [];
  S.__selTw?.forEach((t) => { try { t.remove() } catch (e) {} }); S.__selTw = [];
  for (const o of [...(S.children?.list || [])]) if (o.__selTag) { try { S.tweens.killTweensOf(o); o.destroy() } catch (e) {} }
  S.__selFx?.forEach((o) => { try { S.tweens.killTweensOf(o); o.destroy() } catch (e) {} }); S.__selFx = [];
  S.__selActing = !1;
  S.hero?.off("animationupdate"); S.hero?.off("animationcomplete");
 };
 const later = (S, ms, fn) => { const t = S.time.delayedCall(ms, fn); S.__selT.push(t); return t };

 /* toca a ação do herói; ao terminar volta a respirar */
 const act = (S, c) => {
  const h = S.hero, m = MAN?.[c]; if (!h || !m?.acao || S.__selActing || S.__selL) return;
  const ak = anim(S, `sel-${c}-acao-a`, `sel-${c}-acao`, 0, m.acao - 1, 12, 0);
  const idle = `sel-${c}-idle`, X = h.x, Y = h.y;
  S.__selActing = !0; S.__selFx = S.__selFx.filter((o) => o.active);
  const done = () => { S.__selActing = !1; h.off("animationupdate"); h.off("animationcomplete"); if (h.texture.key !== `sel-${c}`) h.setTexture(`sel-${c}`, 0).setOrigin(.5, m.foot / m.size); h.setAlpha(1); h.play(idle, !0) };
  const hooks = {};
  if (c === "rogue") hooks[9] = () => {                                       // some nas sombras e volta
   h.anims.pause(); smoke(S, X, Y, 16);
   S.tweens.add({ targets: h, alpha: 0, duration: 160 });
   later(S, 1100, () => { smoke(S, X, Y, 18); S.tweens.add({ targets: h, alpha: 1, duration: 160 }); h.anims.resume() });
  };
  if (c === "mage") hooks[10] = () => { flash(S, X + 30, Y - 210, 0xb070ff, 1.4); bits(S, X + 30, Y - 205, 34, [0xc58cff, 0x8a4dff, 0xffffff], { up: 90, dx: 90, w: 16, h: 16, t: 1000, spread: 200 }) };
  if (c === "shaman") for (const f of [8, 11, 14]) hooks[f] = () => bits(S, X - 30, Y - 8, 14, [0x7fe08a, 0x4fb060, 0xd8ff8a, 0xfff6a0], { up: 70, dx: 60, w: 40, t: 1400, spread: 400 });
  if (c === "berserker") for (const f of [4, 9, 14]) hooks[f] = () => {   // meditação: vento com pétalas de cerejeira
   for (let i = 0; i < 9; i++) {
    const p = fx(S, S.add.rectangle(X - 130 - Math.random() * 30, Y - 60 - Math.random() * 170, 3, 2, [0xffc0d8, 0xff9cc2, 0xfff0f6][i % 3]).setDepth(6), 1);
    S.tweens.add({ targets: p, x: p.x + 230 + Math.random() * 60, y: p.y + 30 + Math.random() * 50, angle: 540, duration: 1800 + Math.random() * 900, delay: Math.random() * 500, ease: "Sine.easeInOut", onComplete: () => p.destroy() });
   }
  };
  if (c === "necromancer") hooks[15] = () => {                               // caveira sai da terra
   const xm = MAN._x?.esqueleto; if (!xm || !S.textures.exists("selx-esqueleto")) return;
   const gx = X - 66, sk = fx(S, S.add.sprite(gx, Y, "selx-esqueleto", 0).setOrigin(.5, 0).setScale(.66).setDepth(2.5), 1);   // do lado onde o cajado bate no chão
   const ia = anim(S, "selx-esqueleto-a", "selx-esqueleto", 1, xm.frames - 1, 8, -1, !0);
   const st = { v: 0 }, H = xm.foot, set = () => { if (!sk.active) return; const v = Math.round(st.v); sk.setCrop(0, 0, xm.w, v).setY(Y - v * sk.scaleY) };
   set(); flash(S, gx, Y - 10, 0xff3040, .9);
   S.__selTw.push(S.tweens.add({ targets: st, v: H, duration: 1000, ease: "Quad.easeOut", onUpdate: set, onComplete: () => sk.active && sk.play(ia) }));
   bits(S, gx, Y - 2, 26, [0x4a3424, 0x6b4a30, 0x2a1c14], { up: 30, dx: 70, w: 50, h: 4, t: 900, spread: 700 });
   later(S, 3800, () => { bits(S, gx, Y - 2, 18, [0x4a3424, 0x6b4a30], { up: 20, dx: 60, w: 50, h: 4, t: 700, spread: 500 }); S.__selTw.push(S.tweens.add({ targets: st, v: 0, duration: 800, ease: "Quad.easeIn", onUpdate: set, onComplete: () => sk.destroy() })) });
  };
  if (c === "hunter") hooks[12] = () => {                                    // assobio → o lobo chega correndo
   const rm = MAN._x?.["lobo-corre"], im = MAN._x?.["lobo-idle"]; if (!rm || !S.textures.exists("selx-lobo-corre")) return;
   const ra = anim(S, "selx-lobo-run", "selx-lobo-corre", 0, rm.frames - 1, 14, -1), ia = anim(S, "selx-lobo-id", "selx-lobo-idle", 1, (im?.frames || 2) - 1, 9, -1, !0);
   // a arte do lobo olha para a direita: entra pela borda esquerda do palco (recortado — não passa por cima do painel),
   // para à frente do herói, um pouco abaixo; sai virado para a esquerda
   const wf = fx(S, S.add.sprite(X - 220, Y + 10, "selx-lobo-corre", 0).setOrigin(.5, rm.foot / rm.h).setScale(.72).setDepth(3.5).play(ra), 1);
   S.tweens.add({ targets: wf, x: X - 54, duration: 900, ease: "Cubic.easeOut", onComplete: () => {
    S.textures.exists("selx-lobo-idle") ? wf.setTexture("selx-lobo-idle", 0).play(ia) : wf.anims.stop();
    later(S, 2600, () => { wf.setTexture("selx-lobo-corre", 0).setFlipX(!0).play(ra); S.tweens.add({ targets: wf, x: X - 260, duration: 900, ease: "Cubic.easeIn", onComplete: () => wf.destroy() }) });
   } });
  };
  let bearing = !1;
  if (c === "druid") hooks[10] = () => {                                     // vira urso e volta
   const um = MAN._x?.["urso-idle"]; if (!um || !S.textures.exists("selx-urso-idle")) return;
   bearing = !0; h.anims.pause();
   flash(S, X, Y - 110, 0x8cff6a, 2); bits(S, X, Y - 100, 40, [0x7fe08a, 0x4fb060, 0xd8ff8a], { up: 80, dx: 120, w: 90, h: 160, t: 900, spread: 150 });
   const ua = anim(S, "selx-urso-a", "selx-urso-idle", 0, um.frames - 1, 10, 0);
   h.setTexture("selx-urso-idle", 0).setOrigin(.5, um.foot / um.h); h.play(ua);
   later(S, 4200, () => {
    flash(S, X, Y - 110, 0x8cff6a, 2); bits(S, X, Y - 100, 40, [0x7fe08a, 0x4fb060, 0xd8ff8a], { up: 80, dx: 120, w: 90, h: 160, t: 900, spread: 150 });
    h.setTexture(`sel-${c}-acao`, 11).setOrigin(.5, m.foot / m.size); bearing = !1; h.play({ key: ak, startFrame: 11 });
   });
  };
  const fired = new Set();
  h.on("animationupdate", (an, fr) => {
   if (an.key !== ak) return;
   const i = fr.index - 1; for (const k in hooks) if (i >= +k && !fired.has(k)) { fired.add(k); try { hooks[k]() } catch (e) {} }
  });
  h.on("animationcomplete", (an) => { if (an.key === ak && !bearing && S.__selActing) done() });
  h.play(ak);
 };

 const show = (S) => {
  try {
   if (!MAN || !S.hero || typeof fe === "undefined") return;
   const C = fe[S.selected], c = String(C).toLowerCase(), k = "sel-" + c, m = MAN[c], h = S.hero;
   if (!m || !S.textures.exists(k)) return;
   S.__heroT?.forEach((q) => q.remove()); S.__heroT = [];
   S.__art?.setVisible(!1);                                        // ilustração antiga (hero-art.js) sai do palco
   const lk = S.__ok?.(C) === !1, changed = S.__selK !== k || S.__selL !== lk;
   if (!changed) {                                                  // mesmo herói (no toque o refresh roda 2×): o refresh original
    const z = S.__selSnap; S.__heroT?.forEach((q) => q.remove()); S.__heroT = [];   // trocou para o sprite pequeno do jogo — volta o nosso
    if (z && z.key && S.textures.exists(z.key)) {
     h.setTexture(z.key, z.frame).setOrigin(z.ox, z.oy).setScale(z.sx).setAlpha(z.alpha).setFlipX(z.flip);
     z.tint ? h.setTint(1379848) : h.clearTint();
     if (z.anim && S.anims.exists(z.anim)) h.play({ key: z.anim, startFrame: Math.max(0, z.idx) }, !0);
    }
    h.setVisible(!0); return;
   }
   S.__selK = k; S.__selL = lk;
   stop(S); h.anims.stop();
   const a = anim(S, k + "-idle", k, 1, m.frames - 1, 7, -1, !0);
   h.setTexture(k, 0).setVisible(!0).setOrigin(.5, m.foot / m.size).setFlipX(!1);
   if (lk) { h.setTint(1379848) } else { h.clearTint(); h.play(a, !0) }
   const sc = m.size > 200 ? 1 : 2;
   S.tweens.killTweensOf(h); h.setScale(sc * .95).setAlpha(0); S.tweens.add({ targets: h, scale: sc, alpha: lk ? .92 : 1, duration: 260, ease: "Cubic.easeOut" });
   if (!lk && m.acao && S.textures.exists(k + "-acao")) {
    const loop = () => { act(S, c); later(S, 10000 + Math.random() * 2000, loop) };
    later(S, 3000, loop);
   }
  } catch (e) { console.warn("[seleção]", e) }
 };
 const R0 = bl.prototype.refreshDetails;
 bl.prototype.refreshDetails = function () {
  const h = this.hero;
  try { if (h && /^sel/.test(h.texture?.key || "")) { const a = h.anims; this.__selSnap = { key: h.texture.key, frame: h.frame?.name, ox: h.originX, oy: h.originY, sx: h.scaleX, alpha: h.alpha, flip: h.flipX, tint: h.isTinted, anim: a?.isPlaying ? a.currentAnim?.key : null, idx: a?.currentFrame ? a.currentFrame.index - 1 : 0 } } } catch (e) {}
  const r = R0.apply(this, arguments); show(this); return r;
 };
 const C0 = bl.prototype.create;
 bl.prototype.create = function () {
  const r = C0.apply(this, arguments), S = this;
  S.__selK = null; S.__selT = []; S.__selTw = []; S.__selFx = []; S.__selActing = !1; S.__selMask = null;
  try { load(S, () => { if (S.sys?.isActive?.()) { S.__selK = null; show(S) } }) } catch (e) {}
  S.events.once("shutdown", () => { try { stop(S) } catch (e) {} });
  return r;
 };
}
