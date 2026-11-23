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
const __HB_K = "hb-barra", __HB_F = "hb-faixa", __HB_P = "assets/ui/pergaminho-missao.png";
const __HB_IN = [56, 9, 440, 24];   // interior da moldura (px da imagem 495×32)
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__HB_K) || L.image(__HB_K, "assets/ui/hud-barra.png");
  this.textures.exists(__HB_F) || L.image(__HB_F, "assets/ui/faixa-local.png");
  L.setPath(op) } catch (e) {} return r }}
/* uma barra: moldura + preenchimento */
function __hbBar(S, x, y, w, h, depth) {
  const fr = S.add.image(x, y, __HB_K).setOrigin(0).setDisplaySize(w, h).setDepth(depth + .2);
  try { S.textures.get(__HB_K).setFilter(j.Textures.FilterMode.LINEAR) } catch (e) {}
  const g = S.add.graphics().setDepth(depth + .3);
  const sx = w / 495, sy = h / 32, ix = x + __HB_IN[0] * sx, iy = y + __HB_IN[1] * sy, iw = (__HB_IN[2] - __HB_IN[0]) * sx, ih = (__HB_IN[3] - __HB_IN[1]) * sy;
  return { fr, g, ix, iy, iw, ih, k: "", set(r, col, a = 1) {
    const key = r.toFixed(3) + "|" + col + "|" + a.toFixed(2); if (key === this.k) return; this.k = key;
    const G = this.g; G.clear(); if (r <= 0) return;
    const W = Math.max(1, this.iw * Math.min(1, r)), hi = Math.max(1, Math.round(this.ih * .3));
    G.fillStyle(col, a).fillRect(this.ix, this.iy, W, this.ih);
    G.fillStyle(0xffffff, .28 * a).fillRect(this.ix, this.iy, W, hi);
    G.fillStyle(0x000000, .25 * a).fillRect(this.ix, this.iy + this.ih - 1, W, 1);
  }, vis(v) { this.fr.setVisible(v); this.g.setVisible(v) } };
}
function __hbMake(H) {
  const S = H.s; if (!S.textures.exists(__HB_K)) return null;
  const F = { fontFamily: "PixelifySans, Georgia, serif", fontStyle: "bold" };
  const o = { hp: __hbBar(S, 0, 0, 190, 13, 110), rs: __hbBar(S, 0, 0, 190, 13, 110), xp: __hbBar(S, 0, 0, 158, 9, 110) };
  o.hpT = S.add.text(0, 0, "", { ...F, fontSize: "8px", color: "#ffffff", stroke: "#000000", strokeThickness: 2 }).setOrigin(1, .5).setDepth(110.5);
  o.top = S.add.text(0, 0, "", { ...F, fontSize: "8px", color: "#f2d98a", stroke: "#0a0604", strokeThickness: 2 }).setDepth(110.5);
  o.all = [o.hp, o.rs, o.xp]; o.txt = [o.hpT, o.top];
  o.place = (x, y, mob) => {
    if (o.at === x + "," + y + mob) return; o.at = x + "," + y + mob;
    const put = (b, X, Y) => { const dx = X - b.fr.x, dy = Y - b.fr.y; b.fr.setPosition(X, Y); b.ix += dx; b.iy += dy; b.k = "" };
    let yy = y; o.top.setPosition(x + 4, yy).setVisible(mob); if (mob) yy += 10;
    put(o.hp, x, yy); o.hpT.setPosition(x + 166, yy + 6.5); yy += 15; put(o.rs, x, yy); o.rsY = yy; put(o.xp, x, yy + 15); o.bottom = yy + 25;
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
    const mob = this.mode === "mob";
    if (mob) { this.__uc?.setVisible(!1); for (const o of [this.mhp, this.mname, this.mlvlT, this.muf, this.hpF, this.rsF, this.mlvl]) o?.setVisible(!1); B.place(6, 4, !0) }
    else B.place(8, 66, !1);
    /* PC: globos e barra de XP de baixo saem (as barras mostram o mesmo) */
    if (R?.__sk) { for (const o of [...(R.__gb || []), ...(R.__gf || []), R.__xb, R.__xf, R.hpT, R.mpT]) o?.setAlpha?.(0) }
    vis(!0); B.top.setVisible(mob);
    const P = g.player, Rs = g.resource, hp = P.maxHp > 0 ? Math.max(0, P.hp / P.maxHp) : 0, low = hp < .3 && hp > 0;
    B.hp.set(hp, low ? 0xff3434 : 0xd42e2e, low ? .55 + .45 * Math.sin(S.time.now / 140) : 1);
    const hasR = !!Rs?.def; B.rs.vis(hasR); hasR && B.rs.set(Rs.max > 0 ? Math.max(0, Rs.current / Rs.max) : 0, Rs.def.color ?? 0x3b7bff);
    if (!hasR) { if (B.__xpUp !== 1) { B.__xpUp = 1; B.at = "" } } else if (B.__xpUp) { B.__xpUp = 0; B.at = "" }
    const xr = h && h.xpNext > 0 ? Math.max(0, Math.min(1, h.xp / h.xpNext)) : 0; B.xp.set(xr, 0xe0a83a);
    if (B.__xpUp) { const X = B.xp, dy = B.rsY - X.fr.y; if (dy) { X.fr.y += dy; X.iy += dy; X.k = ""; B.bottom = B.rsY + 10 } }
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
  const tx = U.add.text(0, 0, String(name).toUpperCase(), { fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "bold", fontSize: "11px", color: "#ffe6a8", stroke: "#2a0606", strokeThickness: 3, letterSpacing: 1 }).setOrigin(.5);
  /* p216.118: a faixa crescia com o nome (nomes longos viravam uma faixa enorme): largura fixa e a letra encolhe */
  const w = 150, sc = w / 237, ban = U.add.image(0, 0, __HB_F).setOrigin(0).setScale(sc);
  for (let fs = 11; tx.width > w * .56 && fs > 6; fs--) tx.setFontSize(fs);
  tx.setPosition(w / 2, 54 * sc / 2 - 1);
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
window.__openColl = (S) => { try { __collectiblesOpen(S) } catch (e) {} };
