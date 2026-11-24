/* ══ HUD em pixel art (p216.117) ═══════════════════════════════════════════════════════════════════════════════════
   Peças desenhadas no PixelLab (Create UI Pro; fontes em scripts/art-src/ui):
   • BARRAS de vida, recurso (mana/fúria/energia — na cor do recurso) e experiência: moldura de ferro com dourado e
     caveira (assets/ui/hud-barra.png), no canto superior esquerdo; o preenchimento é desenhado por cima e acompanha
     o valor (a vida pisca quando está baixa). No celular substituem o cartão; no PC ficam embaixo do retrato e os
     globos de vida/recurso e a barra de XP de baixo saem (as barras mostram o mesmo).
   • FAIXA DO LOCAL: ao entrar numa região o nome aparece numa faixa vermelha com bordado dourado (faixa-local.png),
     menor, logo abaixo das barras, à esquerda — não cobre mais o meio da tela.
   • PERGAMINHO DE MISSÃO: quando uma missão secundária começa (entra no Diário como "em andamento"), um pergaminho
     abre no centro da tela com o nome e o objetivo; sai ao tocar ou apertar qualquer tecla/botão do controle.        */
try { document.fonts?.load?.('700 12px "CinzelDecorative"') } catch (e) {}
const __HB_K = "hb-barra", __HB_F = "hb-faixa", __HB_P = "assets/ui/pergaminho-missao.png";
const __HB_IN = [56, 9, 440, 24];   // interior da moldura (px da imagem 495×32)
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__HB_K) || L.image(__HB_K, "assets/ui/hud-barra.png");
  this.textures.exists(__HB_F) || L.image(__HB_F, "assets/ui/faixa-local.png");
  L.setPath(op) } catch (e) {} return r }}
/* p216.124: barras no estilo do kit "Pixel UI HUD: Fantasy RPG Kit" (demo grátis, uso comercial liberado —
   scripts/art-src/ui/PixelHUDUI_demo): moldura bordô com dourado e encaixe quadrado à esquerda (coração na vida,
   orbe na cor do recurso), preenchimento com textura recortado pelo valor; XP na barra fina do mesmo kit. */
const __HB2 = "assets/ui/hud2/";
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  for (const k of ["status-bg", "status-fill-hp", "status-fill-gray", "prog-bg", "prog-fill-gray", "heart", "slot"]) this.textures.exists("hb2-" + k) || L.image("hb2-" + k, __HB2 + k + ".png");
  L.setPath(op) } catch (e) {} return r }}
/* barra de status (vida/recurso): 395×57 na arte, encaixe x 6–54, interior x 57–372 / y 9–48 */
function __hbStatus(S, w, depth, kind) {
  const sc = w / 395, C = S.add.container(0, 0).setDepth(depth);
  const bg = S.add.image(0, 0, "hb2-status-bg").setOrigin(0).setScale(sc);
  const fill = S.add.image(57 * sc, 9 * sc, kind === "hp" ? "hb2-status-fill-hp" : "hb2-status-fill-gray").setOrigin(0).setScale(sc * 314 / 319, sc);
  const shine = S.add.graphics();
  C.add([bg, fill, shine]);
  let icon;
  if (kind === "hp" && S.textures.exists("hb2-heart")) icon = S.add.image(30 * sc, 28.5 * sc, "hb2-heart").setScale(sc * .95);
  else { icon = S.add.graphics(); }
  C.add(icon);
  for (const k of ["hb2-status-bg", "hb2-status-fill-hp", "hb2-status-fill-gray", "hb2-heart"]) { try { S.textures.get(k).setFilter(j.Textures.FilterMode.LINEAR) } catch (e) {} }
  return { C, fill, icon, sc, h: 57 * sc, k: "", set(r, col, a = 1) {
    const key = r.toFixed(3) + "|" + col + "|" + a.toFixed(2); if (key === this.k) return; this.k = key;
    r = Math.max(0, Math.min(1, r)); this.fill.setVisible(r > 0).setCrop(0, 0, 319 * r, 39).setAlpha(a);
    if (kind !== "hp") { this.fill.setTint(col);
      const g = this.icon; g.clear(); const cx = 30 * sc, cy = 28.5 * sc, R = 12 * sc;
      g.fillStyle(0x000000, .35).fillCircle(cx, cy + 1, R + 1).fillStyle(col, 1).fillCircle(cx, cy, R).fillStyle(0xffffff, .55).fillCircle(cx - R * .35, cy - R * .35, R * .35).lineStyle(1, 0xf0d090, .9).strokeCircle(cx, cy, R) }
  }, vis(v) { this.C.setVisible(v) } };
}
/* barra fina de XP: 104×39 esticada (9 partes), interior x 6–98 / y 7–31 */
function __hbProg(S, w, h, depth) {
  const s = h / 39, C = S.add.container(0, 0).setDepth(depth), W = w / s;
  let bg, fill;
  try { bg = S.add.nineslice(0, 0, "hb2-prog-bg", null, W, 39, 9, 9, 8, 8).setOrigin(0); fill = S.add.nineslice(6, 7, "hb2-prog-fill-gray", null, W - 12, 24, 4, 4, 4, 4).setOrigin(0) }
  catch (e) { bg = S.add.image(0, 0, "hb2-prog-bg").setOrigin(0).setDisplaySize(W, 39); fill = S.add.image(6, 7, "hb2-prog-fill-gray").setOrigin(0).setDisplaySize(W - 12, 24) }
  C.add([bg, fill]).setScale(s);
  return { C, fill, h, k: "", set(r, col) {
    const key = r.toFixed(3) + "|" + col; if (key === this.k) return; this.k = key;
    const fw = (W - 12) * Math.max(0, Math.min(1, r)); this.fill.setVisible(fw >= 8); if (fw >= 8) { this.fill.type === "NineSlice" ? this.fill.setSize(fw, 24) : this.fill.setDisplaySize(fw, 24) } this.fill.setTint?.(col);
  }, vis(v) { this.C.setVisible(v) } };
}
function __hbMake(H) {
  const S = H.s; if (!S.textures.exists("hb2-status-bg")) return null;
  const F = { fontFamily: "PixelifySans, Georgia, serif", fontStyle: "bold" }, Wd = 172;
  const o = { hp: __hbStatus(S, Wd, 110, "hp"), rs: __hbStatus(S, Wd, 110, "rs"), xp: __hbProg(S, Wd * .86, 10, 110) };
  o.hpT = S.add.text(0, 0, "", { ...F, fontSize: "9px", color: "#ffffff", stroke: "#1a0606", strokeThickness: 3 }).setOrigin(1, .5).setDepth(110.5);
  o.top = S.add.text(0, 0, "", { ...F, fontSize: "8px", color: "#f2d98a", stroke: "#0a0604", strokeThickness: 2 }).setDepth(110.5);
  o.all = [o.hp, o.rs, o.xp]; o.txt = [o.hpT, o.top];
  o.place = (x, y, mob, noR) => {
    const key = x + "," + y + mob + noR; if (o.at === key) return; o.at = key;
    let yy = y; o.top.setPosition(x + 4, yy).setVisible(mob); if (mob) yy += 10;
    o.hp.C.setPosition(x, yy); o.hpT.setPosition(x + 362 * o.hp.sc, yy + 28.5 * o.hp.sc); yy += o.hp.h + 1;
    if (!noR) { o.rs.C.setPosition(x, yy); yy += o.rs.h + 1 }
    o.xp.C.setPosition(x + 54 * o.hp.sc, yy); o.bottom = yy + o.xp.h + 2;
  };
  return o;
}
{const U0 = __Hud2.prototype.update; __Hud2.prototype.update = function (g) {
  const r = U0.apply(this, arguments);
  try {
    if (!this.ok) return r;
    const S = this.s, h = S.hud, show = !!g?.player && h?.panel?.visible !== !1 && g.state !== "gameover" && g.state !== "victory" && !!this.mode;
    if (this.__hb === void 0) this.__hb = __hbMake(this);
    const B = this.__hb; if (!B) return r;
    const vis = (v) => { for (const b of B.all) b.vis(v); for (const t of B.txt) t.setVisible(v) };
    const R = S.refHud;
    if (!show) { vis(!1); S.__hbBottom = 0; return r }
    const mob = this.mode === "mob", Rs = g.resource, hasR = !!Rs?.def;
    if (mob) { this.__uc?.setVisible(!1); for (const o of [this.mhp, this.mname, this.mlvlT, this.muf, this.hpF, this.rsF, this.mlvl]) o?.setVisible(!1); B.place(6, 4, !0, !hasR) }
    else B.place(8, 66, !1, !hasR);
    /* PC: globos e barra de XP de baixo saem (as barras mostram o mesmo) */
    if (R?.__sk) { for (const o of [...(R.__gb || []), ...(R.__gf || []), R.__xb, R.__xf, R.hpT, R.mpT]) o?.setAlpha?.(0) }
    vis(!0); B.top.setVisible(mob); B.rs.vis(hasR);
    const P = g.player, hp = P.maxHp > 0 ? Math.max(0, P.hp / P.maxHp) : 0, low = hp < .3 && hp > 0;
    B.hp.set(hp, 0, low ? .55 + .45 * Math.sin(S.time.now / 140) : 1);
    hasR && B.rs.set(Rs.max > 0 ? Math.max(0, Rs.current / Rs.max) : 0, Rs.def.color ?? 0x3b7bff);
    const xr = h && h.xpNext > 0 ? Math.max(0, Math.min(1, h.xp / h.xpNext)) : 0; B.xp.set(xr, 0xf0b43c);
    const T = `${Math.max(0, Math.ceil(P.hp))}/${P.maxHp}`; B.hpT._s !== T && (B.hpT.setText(T), B.hpT._s = T);
    if (mob) { const st_ = g.stats, nm = (__HN[g.classDef?.id] ?? g.classDef?.name ?? "").toUpperCase(), N = `${__L3("NV", "LV", "NV")} ${st_?.level ?? 1} · ${nm} · ◆ ${st_?.gold ?? 0}`; B.top._s !== N && (B.top.setText(N), B.top._s = N) }
    S.__hbBottom = B.bottom;
  } catch (e) {}
  return r }}
/* ── faixa do local: substitui o título grande no meio da tela ── */
__rtNext = function (G) {
  const U = G.scene.get("UI"), it = (G.__rtQ || []).shift();
  if (!it || !U || !U.sys?.isActive?.() || !G.sys?.isActive?.()) { G.__rtOn = !1; return }
  if (U.storyPanel?.visible || U.blessingPanel?.visible || U.result?.isVisible?.()) { G.__rtQ.unshift(it); G.__rtOn = !0; U.time.delayedCall(700, () => __rtNext(G)); return }
  if (!U.textures.exists(__HB_F)) { G.__rtOn = !1; return }
  G.__rtOn = !0; const [name, sub] = it;
  try { U.textures.get(__HB_F).setFilter(j.Textures.FilterMode.LINEAR) } catch (e) {}
  const y = (U.__hbBottom || 50) + 4, C = U.add.container(4, y).setDepth(650).setAlpha(0);
  /* p216.121: letra de fantasia (Cinzel Decorative, OFL) e o nome sempre dentro do painel do meio da faixa */
  const tx = U.add.text(0, 0, String(name), { fontFamily: "CinzelDecorative, Georgia, serif", fontStyle: "bold", fontSize: "12px", color: "#ffe6a8", stroke: "#2a0606", strokeThickness: 3 }).setOrigin(.5);
  /* p216.118: a faixa crescia com o nome (nomes longos viravam uma faixa enorme): largura fixa e a letra encolhe */
  const w = 176, sc = w / 237, ban = U.add.image(0, 0, __HB_F).setOrigin(0).setScale(sc);
  const IW = 128 * sc, IH = 28 * sc;   // painel do meio da faixa: x 48–190, y 5–35 da imagem 237×54
  for (let fs = 12; (tx.width > IW || tx.height > IH) && fs > 5; fs -= .5) tx.setFontSize(fs);
  if (tx.width > IW) tx.setScale(IW / tx.width);
  tx.setPosition(119 * sc, 20 * sc);
  const sb = U.add.text(w / 2, 54 * sc + 2, sub || "", { fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "8px", color: "#ecdcac", stroke: "#0a0604", strokeThickness: 2 }).setOrigin(.5, 0).setAlpha(0);
  C.add([ban, tx, sb]); try { __rtChime(G) } catch (e) {}
  C.x = -w; U.tweens.add({ targets: C, x: 4, alpha: 1, duration: 600, ease: "Back.easeOut" }); U.tweens.add({ targets: sb, alpha: .9, duration: 700, delay: 400 });
  U.time.delayedCall(3800, () => U.tweens.add({ targets: C, alpha: 0, x: -w * .3, duration: 800, ease: "Sine.easeIn", onComplete: () => { C.destroy(); U.time.delayedCall(400, () => __rtNext(G)) } }));
};
/* ── pergaminho de missão secundária ── */
function __hbScroll(title, text) {
  if (document.getElementById("hb-scroll")) return;
  const g = window.__DED_GAME, scenes = ["Game", "Hub"].map((k) => g?.scene?.getScene(k)).filter((s) => s?.sys?.isActive?.());
  const ov = document.createElement("div"); ov.id = "hb-scroll";
  ov.innerHTML = `<style>#hb-scroll{position:fixed;inset:0;z-index:9500;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);opacity:0;transition:opacity .25s;touch-action:manipulation;-webkit-text-size-adjust:100%}
#hb-scroll.on{opacity:1}#hb-sc{position:relative;height:min(88vh,88vw*1.14);aspect-ratio:128/146;background:url(${__HB_P}) center/100% 100% no-repeat;image-rendering:pixelated;transform:scaleY(.08);transition:transform .45s cubic-bezier(.2,1.3,.4,1)}
#hb-scroll.on #hb-sc{transform:scaleY(1)}#hb-tx{position:absolute;left:19%;right:19%;top:21%;bottom:22%;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;font-family:PixelifySans,Georgia,serif;color:#4a2a12;overflow:hidden}
#hb-k{font-size:min(2.6vh,15px);letter-spacing:1px;color:#8a2a14;font-weight:700;margin-top:4%}#hb-t{font-size:min(4.4vh,26px);font-weight:700;color:#3a1c08;margin:5% 0 7%;line-height:1.05}#hb-d{font-size:min(3vh,17px);line-height:1.35}
#hb-h{position:absolute;left:0;right:0;bottom:-2.4em;text-align:center;font:600 min(2.4vh,13px) system-ui,sans-serif;color:#f2e2b8;text-shadow:0 1px 3px #000;opacity:.85}</style>
<div id="hb-sc"><div id="hb-tx"><div id="hb-k"></div><div id="hb-t"></div><div id="hb-d"></div></div><div id="hb-h"></div></div>`;
  document.body.appendChild(ov);
  ov.querySelector("#hb-k").textContent = __L3("NOVA MISSÃO SECUNDÁRIA", "NEW SIDE QUEST", "NUEVA MISIÓN SECUNDARIA");
  ov.querySelector("#hb-t").textContent = title; ov.querySelector("#hb-d").textContent = text || "";
  ov.querySelector("#hb-h").textContent = __L3("toque ou aperte qualquer botão", "tap or press any button", "toca o pulsa cualquier botón");
  requestAnimationFrame(() => ov.classList.add("on"));
  /* o jogo espera enquanto o pergaminho está aberto */
  const was = scenes.map((s) => [s, !!s.uiOpen, !!s.__busy]); for (const [s] of was) { s.uiOpen = !0; s.scene.key === "Hub" && (s.__busy = !0); try { s.physics?.pause?.() } catch (e) {} }
  const t0 = performance.now(); let done = !1, raf = 0;
  const close = () => {
    if (done || performance.now() - t0 < 600) return; done = !0; cancelAnimationFrame(raf);
    window.__hbClose = null; ov.removeEventListener("pointerdown", close);
    ov.classList.remove("on"); setTimeout(() => ov.remove(), 260);
    for (const [s, w, bz] of was) { s.uiOpen = w; s.scene.key === "Hub" && (s.__busy = bz); try { w || s.physics?.resume?.() } catch (e) {} s.__uiClosedAt = performance.now() }
  };
  window.__hbClose = close; ov.addEventListener("pointerdown", close);
  let held = !0;
  const pad = () => { raf = requestAnimationFrame(pad); try { const gp = [...(navigator.getGamepads?.() ?? [])].find((q) => q?.connected); const any = !!gp?.buttons?.some((b) => b.pressed); if (!any) held = !1; else if (!held) close() } catch (e) {} };
  raf = requestAnimationFrame(pad);
}
window.__hbScroll = __hbScroll;
window.__hbTitle = (n, sub) => { try { const G = window.__DED_GAME.scene.getScene("Game"); __rtTitle(G, n, sub) } catch (e) {} };
/* tecla: ouvinte fixo registrado cedo (outras telas param a tecla antes de chegar a ouvintes novos); a tecla que fecha
   o pergaminho não chega ao jogo */
addEventListener("keydown", (e) => { if (!document.getElementById("hb-scroll")) return; e.preventDefault(); e.stopImmediatePropagation(); window.__hbClose?.() }, !0);
/* vigia: missão que passou a "em andamento" pela primeira vez → pergaminho */
{
  const key = (S) => { try { return __stKey(S) } catch (e) { return "x" } };
  let lastT = 0;
  const tick = () => {
    try {
      const g = window.__DED_GAME; if (!g) return;
      const S = ["Game", "Hub"].map((k) => g.scene.getScene(k)).find((s) => s?.sys?.isActive?.() && s.player); if (!S || typeof __QLIST === "undefined") return;
      if (S.uiOpen || document.getElementById("hb-scroll") || document.getElementById("dm-ov")) return;
      const U = g.scene.getScene(S.scene.key === "Hub" ? "HubUI" : "UI"); if (U?.storyPanel?.visible || U?.blessingPanel?.visible || U?.__dlgOpen || S.__dlgOpen) return;   // espera a conversa/história terminar
      const k = "hbq:" + key(S); let seen; try { seen = JSON.parse(localStorage.getItem(k) || "null") } catch (e) { seen = null }
      const on = []; for (const q of __QLIST) { try { const s = q.st(S); s && on.push([q, s]) } catch (e) {} }
      if (!seen) { localStorage.setItem(k, JSON.stringify(on.map(([q]) => q.id))); return }   // primeira vez neste jogo salvo: o que já existia não abre
      const nw = on.find(([q, s]) => s[0] === "on" && !seen.includes(q.id));
      for (const [q] of on) seen.includes(q.id) || seen.push(q.id);
      localStorage.setItem(k, JSON.stringify(seen));
      nw && __hbScroll(nw[0].title, nw[1][1]);
    } catch (e) {}
  };
  setInterval(() => { const n = performance.now(); if (n - lastT > 900) { lastT = n; tick() } }, 1000);
}
/* ── avisos no meio da tela ("ui:banner") — p216.118: o texto era de 24 px numa linha só; frases longas (o aviso dos
   selos do guardião) passavam da largura da tela. Agora a letra é menor, quebra em até 2 linhas, encolhe se ainda
   não couber, fica mais tempo se for longa e espera a faixa do local sair antes de aparecer (fila). ── */
{
  const hook = () => {
    const g = window.__DED_GAME, U = g?.scene?.getScene?.("UI"); if (!U) return setTimeout(hook, 500);
    const P = Object.getPrototypeOf(U); if (P.__hbBan || !P.showBanner) return; P.__hbBan = 1;
    P.showBanner = function (txt, col) {
      const G = this.scene.get("Game");
      if (G?.__rtOn || this.__banBusy) { (this.__banQ ||= []).length < 4 && this.__banQ.push([txt, col]); return }
      const b = this.banner, W = typeof _ !== "undefined" ? _ : 640, s = String(txt ?? ""), long = s.length > 28;
      this.__banBusy = 1;
      b.setStyle({ fontSize: long ? "13px" : "18px", strokeThickness: 3, align: "center", wordWrap: { width: W * .62, useAdvancedWrap: !0 } });
      b.setText(s).setColor(col).setVisible(!0).setAlpha(0).setScale(.9);
      if (b.width > W * .8) b.setFontSize(Math.max(10, Math.floor((long ? 13 : 18) * W * .8 / b.width)));
      this.tweens.killTweensOf(b);
      this.tweens.add({ targets: b, alpha: 1, scale: 1, duration: 220, yoyo: !0, hold: Math.min(3200, 900 + s.length * 35), onComplete: () => {
        b.setVisible(!1); this.__banBusy = 0; const n = this.__banQ?.shift(); n && this.time.delayedCall(250, () => this.showBanner(n[0], n[1])) } });
    };
    /* quando a faixa do local termina, solta o aviso que estava esperando */
    setInterval(() => { try { const u = g.scene.getScene("UI"), G0 = g.scene.getScene("Game"); if (u?.sys?.isActive() && !G0?.__rtOn && !u.__banBusy && u.__banQ?.length) { const n = u.__banQ.shift(); u.showBanner(n[0], n[1]) } } catch (e) {} }, 400);
  };
  hook();
}
window.__openColl = (S, k) => { try { (k === "BestiaryBook" ? __bestiaryOpen : k === "CodexBook" ? __codexOpen : __collectiblesOpen)(S) } catch (e) {} };
/* ══ Escolha de habilidade em cartas (p216.120) ════════════════════════════════════════════════════════════════════
   Moldura de carta feita no PixelLab (assets/ui/carta-habilidade.png, 152×241): runas nos cantos, espadas cruzadas,
   janela em arco e placa. Na janela o herói faz o golpe daquela habilidade em laço (folha "sk" do herói, a mesma
   que o jogo usa ao lançar); passivas (Pesadelo) mostram o ícone grande. Na placa: tipo e nome. Para ler no celular,
   a descrição e a recarga/custo da carta escolhida ficam numa faixa larga embaixo das cartas, em letra maior. ── */
const __HB_C = "hb-carta";
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__HB_C) || L.image(__HB_C, "assets/ui/carta-habilidade.png"); L.setPath(op) } catch (e) {} return r }}
function __hbSkAnim(S, id) {
  try {
    const V = S.playerVisual, L = V?.mk2Layout, cls = S.classDef?.id; if (!L?.sk) return null;
    let key = V.animPrefix + "-sk"; if (!S.textures.exists(key)) key = `mk4b-${(cls || "").toLowerCase()}-t0-sk`; if (!S.textures.exists(key)) return null;
    const M = __SKH_MAP[cls] || {}, d = Ye[id] || {};
    let k = M[id] || M._t?.[d.type] || M._d || "cast"; if (L.sk.rows[k] == null) k = L.sk.rows.cast != null ? "cast" : "atk";
    const row = L.sk.rows[k]; if (row == null) return null;
    const cols = L.sk.cols || 8; return { key, frames: Array.from({ length: cols }, (_, i) => row * cols + i) };
  } catch (e) { return null }
}
{
  const D0 = __SPPanel.prototype.draw, S0 = __SPPanel.prototype.select, C0 = __SPPanel.prototype.close;
  __SPPanel.prototype.draw = function () {
    const U = this.U; if (!U.textures.exists(__HB_C)) return D0.apply(this, arguments);
    try { U.textures.get(__HB_C).setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
    const q = this.q, n = this.opts.length, S = this.gs();
    try { this.cards?.forEach((c) => c.__mk?.destroy()) } catch (e) {}
    this.root?.destroy(!0); clearInterval(this.__anim);
    const touch = matchMedia?.("(pointer:coarse)").matches;
    const W = typeof _ !== "undefined" ? _ : 640, H = typeof st !== "undefined" ? st : 360, cx = Math.round(W / 2);
    const R = this.root = U.add.container(0, 0).setDepth(950);
    R.add(U.add.rectangle(cx, H / 2, 4000, 2400, 0x060403, .92).setInteractive());
    const PX = "PixelifySans, Georgia, serif", GE = "Georgia, 'Times New Roman', serif";
    const title = q.kind === "nm" ? `${__L3("PESADELO", "NIGHTMARE", "PESADILLA")} ${__roman ? __roman(q.g) : q.g}` : `${__L3("NÍVEL", "LEVEL", "NIVEL")} ${q.lv}`;
    R.add(U.add.text(cx, 20, title, { fontFamily: PX, fontSize: "22px", fontStyle: "bold", color: "#ffd66e", stroke: "#2a0806", strokeThickness: 4 }).setOrigin(.5));
    R.add(U.add.text(cx, 42, q.kind === "nm" ? __L3("Escolha UMA passiva — ela fica até o fim da run", "Choose ONE passive — it stays until the end of the run", "Elige UNA pasiva — se queda hasta el final de la partida")
      : __L3("Escolha UMA habilidade — as outras deste nível ficam trancadas", "Choose ONE skill — the others of this level stay locked", "Elige UNA habilidad — las demás de este nivel quedan cerradas"),
      { fontFamily: GE, fontSize: "12px", color: "#ecdcb4", stroke: "#000", strokeThickness: 2 }).setOrigin(.5));
    /* cartas: altura que cabe entre o subtítulo e a faixa de descrição */
    const top = 56, bot = H - 84, sc0 = (bot - top) / 241, gap = 14, scW = (W - 30 - (n - 1) * gap) / (n * 152), sc = Math.min(sc0, scW);
    const cw = 152 * sc, ch = 241 * sc, x0 = cx - (n * cw + (n - 1) * gap) / 2 + cw / 2, yc = top + ch / 2 + 2;
    this.__anims = [];
    this.cards = this.opts.map((o, i) => {
      const x = x0 + i * (cw + gap), c = U.add.container(x, yc);
      const glow = U.add.graphics(); c.add(glow);
      const fr = U.add.image(0, 0, __HB_C).setScale(sc); c.add(fr);
      const L = (px, py) => [(px - 76) * sc, (py - 120.5) * sc];
      /* janela: o golpe em laço (ou o ícone) */
      const [wx, wb] = L(76.5, 143), wh = 93 * sc, ww = 71 * sc;
      const A = q.kind !== "nm" ? __hbSkAnim(S, o.id) : null;
      if (A) {
        const sp = U.add.sprite(wx, wb + 4 * sc, A.key, A.frames[0]).setOrigin(.5, 1);
        sp.setScale(wh * 1.06 / 128);   // (Phaser 4 não tem máscara simples: o quadro cabe na janela; só o herói ocupa o meio)
        try { U.textures.get(A.key).setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
        c.add(sp);
        this.__anims.push({ sp, A, k: 0 });
      } else if (o.ic && U.textures.exists(o.ic)) {
        const ic = U.add.image(wx, wb - wh / 2, o.ic); ic.setScale(Math.min(ww * .7 / ic.width, wh * .6 / ic.height)); c.add(ic);
      }
      /* placa: tipo e nome (letra grande; encolhe para nomes longos) */
      const [pxx, pyy] = L(75.5, 190), pw = 86 * sc;
      const isNew = o.tag === __L3("NOVA", "NEW", "NUEVA");
      const tg = U.add.text(pxx, pyy - 16 * sc, o.tag, { fontFamily: PX, fontSize: "9px", fontStyle: "bold", color: isNew ? "#1e5a8c" : "#8b1d16" }).setOrigin(.5);
      const nm = U.add.text(pxx, pyy + 4 * sc, o.n, { fontFamily: PX, fontSize: "14px", fontStyle: "bold", color: "#3a1c08", align: "center", wordWrap: { width: pw, useAdvancedWrap: !0 }, lineSpacing: -2 }).setOrigin(.5);
      for (let fs = 14; (nm.height > 34 * sc || nm.width > pw) && fs > 9; fs--) nm.setFontSize(fs);
      c.add([tg, nm]);
      const z = U.add.zone(0, 0, cw, ch).setInteractive({ useHandCursor: !0 });
      z.on("pointerover", () => this.select(i)); z.on("pointerdown", () => { if (this.sel === i || !touch) { this.select(i); this.choose() } else this.select(i) });
      c.add(z); c.__g = glow; c.__w = cw; c.__h = ch;
      c.setAlpha(0).setY(yc + 18);
      U.tweens.add({ targets: c, alpha: 1, y: yc, duration: 260, delay: 80 * i, ease: "Back.easeOut", onUpdate: () => { if (c.__mk) { c.__mk.y = c.y - yc } } });
      R.add(c); return c;
    });
    /* faixa de descrição da carta escolhida — letra grande para o celular */
    const by = H - 68, bw = Math.min(W - 40, 560);
    const bg = U.add.graphics(); bg.fillStyle(0x1a110a, .92).fillRoundedRect(cx - bw / 2, by, bw, 46, 6).lineStyle(1.5, 0xb8862e, .9).strokeRoundedRect(cx - bw / 2, by, bw, 46, 6); R.add(bg);
    this.__meta = U.add.text(cx, by + 7, "", { fontFamily: PX, fontSize: "11px", fontStyle: "bold", color: "#ffd66e" }).setOrigin(.5, 0); R.add(this.__meta);
    this.__desc = U.add.text(cx, by + 21, "", { fontFamily: GE, fontSize: "12.5px", color: "#f2e6c8", align: "center", wordWrap: { width: bw - 20 }, lineSpacing: 1 }).setOrigin(.5, 0); R.add(this.__desc);
    this.__descY = by + 21; this.__descW = bw;
    R.add(U.add.text(cx, H - 12, touch ? __L3("toque numa carta para ver · toque de novo para escolher", "tap a card to see it · tap again to choose", "toca una carta para verla · tócala otra vez para elegir")
      : __L3("◀ ▶ escolher   ·   Enter / A / clique: confirmar", "◀ ▶ choose   ·   Enter / A / click: confirm", "◀ ▶ elegir   ·   Enter / A / clic: confirmar"), { fontFamily: GE, fontSize: "11px", color: "#c9a24a" }).setOrigin(.5));
    /* o golpe em laço (só a carta escolhida anima; as outras ficam no 1º quadro) */
    let k = 0; this.__anim = setInterval(() => { try { if (!this.root) return clearInterval(this.__anim); k++; this.__anims.forEach((a, i) => { const on = i === this.sel; a.sp.setFrame(a.A.frames[on ? k % a.A.frames.length : 0]) }) } catch (e) {} }, 95);
    this.select(0);
  };
  __SPPanel.prototype.select = function (i) {
    if (!this.cards?.[0]?.__h) return S0.apply(this, arguments);
    this.sel = i;
    this.cards.forEach((c, k) => {
      const on = k === i, g = c.__g, w = c.__w, h = c.__h; g.clear();
      if (on) { for (let r = 0; r < 4; r++) g.fillStyle(0xffc860, .1 + r * .05).fillRoundedRect(-w / 2 - 8 + r * 2, -h / 2 - 8 + r * 2, w + 16 - r * 4, h + 16 - r * 4, 10) }
      c.setScale(on ? 1.03 : .97); c.list.forEach((o) => o.setAlpha?.(on ? 1 : .78));
      if (c.__mk) { c.__mk.scaleX = c.__mk.scaleY = 1 }
    });
    const o = this.opts[i]; if (!o) return;
    const meta = o.grade ? `${__L3("Grau", "Rank", "Grado")} ${o.grade}/${o.m}` : [o.cd ? `${__L3("Recarga", "Cooldown", "Recarga")} ${Math.round(o.cd)} s` : null, o.cost ? `${o.cost} ${__L3("de recurso", "resource", "de recurso")}` : null].filter(Boolean).join("   ·   ");
    this.__meta?.setText(meta);
    if (this.__desc) { this.__desc.setFontSize(12.5).setText(o.d || ""); for (let fs = 12.5; this.__desc.height > 26 && fs > 9.5; fs -= .5) this.__desc.setFontSize(fs); if (!meta) this.__desc.setY(this.__descY - 8); else this.__desc.setY(this.__descY) }
  };
  __SPPanel.prototype.close = function () { clearInterval(this.__anim); try { this.cards?.forEach((c) => c.__mk?.destroy()) } catch (e) {} return C0.apply(this, arguments) };
}
/* ── p216.123: painéis do Refúgio (Ferreiro, Vendedor, Santuário): nenhuma linha passa da janela (380 de largura) —
   linha longa (ex.: "Martelo de Forjador · restam 10 de 10 usos…") encolhe até caber; a mensagem e a frase também. ── */
{
  const fit = (t, max) => { if (!t?.active) return; t.setScale(1); const w = t.width; if (w > max) t.setScale(max / w) };
  const fitAll = (H) => { try { for (const r of H.panelRows || []) fit(r.row, 352); fit(H.panelMsg, 352) } catch (e) {} };
  const R0 = Fl.prototype.refreshPanel; Fl.prototype.refreshPanel = function () { const r = R0.apply(this, arguments); fitAll(this); return r };
  const P0 = Fl.prototype.panelConfirm; Fl.prototype.panelConfirm = function () { const r = P0.apply(this, arguments); fitAll(this); return r };
  const O0 = Fl.prototype.openMetaPanel; Fl.prototype.openMetaPanel = function () {
    const r = O0.apply(this, arguments);
    try { for (const o of this.panel?.list || []) if (o.type === "Text" && o.width > 352) fit(o, 352) } catch (e) {}
    fitAll(this); return r };
}
/* ── p216.123: as ruínas de colunas quebradas (dx-ruin*) eram enfeites grandes com colisão de 1 quadrado só — o herói
   atravessava a figura inteira. Saem das salas (Ruínas Antigas, Catacumbas e os biomas do Infinito que usam as
   mesmas salas). ── */
/* roda depois que o pacote inteiro carregou (Sl é declarado mais adiante no arquivo) */
setTimeout(() => { try { for (const b of Object.values(Sl)) for (const k of Object.keys(b || {})) { const A = b[k]; if (Array.isArray(A)) for (let i = A.length - 1; i >= 0; i--) /^dx-ruin/.test(A[i]?.tex || "") && A.splice(i, 1) }
  /* as fases da campanha copiaram os enfeites na hora de montar (ki) */
  for (const L of Object.values(ki)) for (const rm of L?.rooms || []) if (Array.isArray(rm.decor)) rm.decor = rm.decor.filter((o) => !/^dx-ruin/.test(o?.tex || ""));
} catch (e) { console.warn("[ruinas]", e) } }, 0);
