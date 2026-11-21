/* ══ Tela de escolha: heróis em pixel art, pose de apresentação e animados (p216.90) ══
   Arte: PixelLab a partir do sprite de cada herói (scripts/gerar_selecao_herois.py → build_selecao_herois.py →
   assets/pixel-art/heroes-sel/<classe>.png, 9 quadros de 144×144: 0 = pose, 1–8 = parado respirando).
   Carrega sob demanda na tela de escolha; quando a folha do herói existe, ela substitui a ilustração antiga no palco
   (mesmo lugar, pé na sombra, escala 2). Herói bloqueado fica escurecido e parado, como antes. */
{
 const P = "./assets/pixel-art/heroes-sel/";
 let MAN = null;
 const load = (S, done) => {
  const go = () => {
   const L = S.load; let n = 0;
   for (const c in MAN) { const k = "sel-" + c; if (!S.textures.exists(k)) { L.spritesheet(k, P + c + ".png", { frameWidth: MAN[c].size, frameHeight: MAN[c].size }); n++ } }
   if (!n) return done();
   L.once("complete", done); L.start();
  };
  if (MAN) return go();
  if (S.cache.json.exists("sel-man")) { MAN = S.cache.json.get("sel-man"); return go() }
  S.load.json("sel-man", P + "manifest.json"); S.load.once("complete", () => { MAN = S.cache.json.get("sel-man") || {}; go() }); S.load.start();
 };
 const show = (S) => {
  try {
   if (!MAN || !S.hero || typeof fe === "undefined") return;
   const C = fe[S.selected], c = String(C).toLowerCase(), k = "sel-" + c, m = MAN[c], h = S.hero;
   if (!m || !S.textures.exists(k)) return;
   S.__heroT?.forEach((q) => q.remove()); S.__heroT = [];
   h.anims.stop();
   const a = k + "-idle";
   if (!S.anims.exists(a)) S.anims.create({ key: a, frames: S.anims.generateFrameNumbers(k, { start: 1, end: m.frames - 1 }), frameRate: 7, repeat: -1, yoyo: !0 });
   S.__art?.setVisible(!1);                                        // ilustração antiga (hero-art.js) sai do palco
   const lk = S.__ok?.(C) === !1, changed = S.__selK !== k || S.__selL !== lk; S.__selK = k; S.__selL = lk;
   h.setTexture(k, 0).setVisible(!0).setOrigin(.5, m.foot / m.size);
   if (lk) { h.setTint(1379848) } else { h.clearTint(); h.play(a, !0) }
   if (changed) { S.tweens.killTweensOf(h); h.setScale(1.9).setAlpha(0); S.tweens.add({ targets: h, scale: 2, alpha: lk ? .92 : 1, duration: 260, ease: "Cubic.easeOut" }) }
   else h.setScale(2);
  } catch (e) { console.warn("[seleção]", e) }
 };
 const R0 = bl.prototype.refreshDetails;
 bl.prototype.refreshDetails = function () { const r = R0.apply(this, arguments); show(this); return r };
 const C0 = bl.prototype.create;
 bl.prototype.create = function () {
  const r = C0.apply(this, arguments), S = this;
  try { load(S, () => { if (S.sys?.isActive?.()) show(S) }) } catch (e) {}
  return r;
 };
}
