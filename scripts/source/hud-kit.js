/* ══ HUD do gameplay no estilo do kit "Pixel UI HUD" (p216.125) ═══════════════════════════════════════════════════
   Peças em assets/ui/hud2 (demo grátis do kit, uso comercial liberado). O que este módulo faz:
   1) BARRA DE HABILIDADES (PC): espaços com a moldura do kit sobre um painel bordô com borda dourada; recarga em
      "relógio" (fatia escura que vai abrindo) com os segundos no meio; brilho dourado quando a habilidade volta.
   2) EFEITOS ATIVOS: ícones pequenos embaixo das barras de vida (bônus de dano, defesa, velocidade, ataque,
      crítico) com o tempo que falta.
   3) BARRA DO CHEFE: moldura grande do kit, emblema no encaixe, nome dentro da barra, a vida perdida descendo
      devagar (faixa clara) e marcas douradas onde o chefe muda de fase.
   4) VIDA DOS INIMIGOS: barra fina (bordô com borda) que só aparece depois de levar dano e some 4 s depois;
      elites com borda dourada e sempre visível.
   5) NÚMEROS DE DANO: letra de pixel; crítico maior, laranja e com "!" e um pulo.
   6) AVISOS DE GANHO: XP, ouro e item novo entram pela direita e somem.
   7) MISSÃO EM ANDAMENTO: quadro pequeno no canto de cima à direita com o objetivo da missão do Diário.
   8) AVISO DE BOTÃO: "[E] Abrir baú" num quadro escuro; no celular sem a tecla.
   9) VIDA BAIXA: bordas da tela pulsando em vermelho abaixo de 30% de vida.                                         */
const __HK_F = "PixelifySans, Georgia, serif";
const __hkKit = (S) => S.textures.exists("hb2-slot") && S.textures.exists("hb2-status-bg");
function __hkFilt(S, keys) { for (const k of keys) { try { S.textures.exists(k) && S.textures.get(k).setFilter(j.Textures.FilterMode.LINEAR) } catch (e) {} } }

/* 1) barra de habilidades (PC) */
{const U0 = __RefHud.prototype.update; __RefHud.prototype.update = function (i) {
  const r = U0.apply(this, arguments);
  try {
    if (!this.__sk || !__hkKit(this.s)) return r;
    const S = this.s, W = this.W, G = this.G;
    if (!this.__hk) {
      __hkFilt(S, ["hb2-slot"]);
      for (const sl of this.__slots || []) sl.setTexture("hb2-slot").setDisplaySize(W + 3, W + 3);
      const pw = this.N * (W + G) - G + 14, px = this.x0 - 7, py = this.sy - 7, ph = W + 14;
      const pan = S.add.graphics().setDepth(119.2);
      pan.fillStyle(0x140808, .82).fillRoundedRect(px, py, pw, ph, 6).lineStyle(1.5, 0xb08446, 1).strokeRoundedRect(px, py, pw, ph, 6).lineStyle(1, 0x000000, .7).strokeRoundedRect(px - 1.5, py - 1.5, pw + 3, ph + 3, 7);
      this.__hk = { pan, cdG: S.add.graphics().setDepth(123.5), glow: S.add.graphics().setDepth(123.6), txt: [], prev: [] };
      for (let x = 0; x < 4; x++) this.__hk.txt.push(S.add.text(this.x0 + x * (W + G) + W / 2, this.sy + W / 2, "", { fontFamily: __HK_F, fontStyle: "bold", fontSize: "10px", color: "#fff0c8", stroke: "#000000", strokeThickness: 3 }).setOrigin(.5).setDepth(124));
      this.parts?.push(this.__hk.pan, this.__hk.cdG, this.__hk.glow, ...this.__hk.txt);
    }
    const K = this.__hk, on = !!this.on;
    this.__ab?.setAlpha(0);
    K.pan.setVisible(on); K.cdG.setVisible(on); K.glow.setVisible(on);
    if (!on) { K.txt.forEach((t) => t.setVisible(!1)); return r }
    this.live.clear(); K.cdG.clear(); K.glow.clear();
    const u = i.abilities?.slots ?? [], a = i.resource, now = S.time.now;
    for (let x = 0; x < 4; x++) {
      const A = u[x], E = this.x0 + x * (W + G), cx = E + W / 2, cy = this.sy + W / 2, T = K.txt[x];
      let cd = 0;
      if (A?.def) {
        cd = A.cooldown > 0 ? A.cooldown : 0;
        if (cd > 0) {
          const w = Math.min(1, cd / A.def.cooldown), R = W / 2 + 2;
          K.cdG.fillStyle(0x000000, .62).slice(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * w, !1).fillPath();
          const s = cd >= 1 ? String(Math.ceil(cd)) : cd.toFixed(1); T._s !== s && (T.setText(s), T._s = s); T.setVisible(!0);
        } else { T.setVisible(!1); (a?.canAfford ? a.canAfford(A.def.cost) : !0) || K.cdG.fillStyle(0x10203a, .55).fillRect(E + 1, this.sy + 1, W - 2, W - 2) }
        if (K.prev[x] > 0 && cd <= 0) K["f" + x] = now;
      } else T.setVisible(!1);
      K.prev[x] = cd;
      const ft = K["f" + x]; if (ft && now - ft < 600) { const k = 1 - (now - ft) / 600; K.glow.lineStyle(2.5, 0xffd86a, k).strokeRoundedRect(E - 2 - (1 - k) * 3, this.sy - 2 - (1 - k) * 3, W + 4 + (1 - k) * 6, W + 4 + (1 - k) * 6, 4) }
    }
  } catch (e) {}
  return r }}

/* 2) efeitos ativos (bônus com tempo) embaixo das barras */
const __HK_BUFF = { damage: "icon-sword", defense: "icon-shield", speed: "icon-boots", attackSpeed: "icon-bloodlust", critChance: "icon-deadly-mark" };
{const U0 = __Hud2.prototype.update; __Hud2.prototype.update = function (g) {
  const r = U0.apply(this, arguments);
  try {
    const S = this.s; if (!__hkKit(S)) return r;
    const K = this.__hkB ||= { items: [] };
    const show = !!g?.player && S.__hbBottom > 0 && S.hud?.panel?.visible !== !1;
    const now = g?.time?.now ?? 0, bf = show ? (g.stats?.buffs || []).filter((b) => b.until > now) : [];
    const by = {}; for (const b of bf) { const k = b.stat; (!by[k] || by[k].until < b.until) && (by[k] = b) }
    const list = Object.values(by).slice(0, 6);
    while (K.items.length < list.length) {
      const sl = S.add.image(0, 0, "hb2-slot").setOrigin(0).setDisplaySize(17, 17).setDepth(110.6), ic = S.add.image(0, 0, "icon-sword").setDepth(110.7),
        t = S.add.text(0, 0, "", { fontFamily: __HK_F, fontStyle: "bold", fontSize: "7px", color: "#fff0c8", stroke: "#000000", strokeThickness: 2 }).setOrigin(.5, 0).setDepth(110.7);
      K.items.push({ sl, ic, t });
    }
    const x0 = this.mode === "mob" ? 8 : 10, y0 = (S.__hbBottom || 60) + 1;
    K.items.forEach((it, n) => {
      const b = list[n], v = !!b; it.sl.setVisible(v); it.ic.setVisible(v); it.t.setVisible(v); if (!v) return;
      const x = x0 + n * 20, key = __HK_BUFF[b.stat] || "icon-sword";
      it.sl.setPosition(x, y0); if (it.ic.texture.key !== key && S.textures.exists(key)) it.ic.setTexture(key);
      it.ic.setPosition(x + 8.5, y0 + 8.5).setScale(Math.min(1, 11 / Math.max(it.ic.width, it.ic.height)));
      const s = Math.ceil((b.until - now) / 1000) + "s"; it.t._s !== s && (it.t.setText(s), it.t._s = s); it.t.setPosition(x + 8.5, y0 + 17);
      it.ic.setAlpha(b.until - now < 2500 ? .55 + .45 * Math.sin(now / 90) : 1);
    });
    S.__hkBuffH = list.length ? 26 : 0;
  } catch (e) {}
  return r }}

/* 3) barra do chefe */
{
  const SH0 = Pd.prototype.show, RD0 = Pd.prototype.redraw, HI0 = Pd.prototype.hide;
  Pd.prototype.show = function (name) {
    const r = SH0.apply(this, arguments);
    try {
      const S = this.scene; if (!__hkKit(S)) return r;
      __hkFilt(S, ["hb2-status-bg", "hb2-status-fill-hp", "hb2-status-fill-gray"]);
      this.__hk?.C.destroy(!0);
      const bw = Math.min((typeof _ !== "undefined" ? _ : 640) - 40, this.w + 70), sc = bw / 395, C = S.add.container(Ve - bw / 2, 6).setDepth(110.5);
      const bg = S.add.image(0, 0, "hb2-status-bg").setOrigin(0).setScale(sc),
        gh = S.add.image(57 * sc, 9 * sc, "hb2-status-fill-gray").setOrigin(0).setScale(sc * 314 / 319, sc).setTint(0xffd8b0).setAlpha(.75),
        fi = S.add.image(57 * sc, 9 * sc, "hb2-status-fill-hp").setOrigin(0).setScale(sc * 314 / 319, sc), mk = S.add.graphics();
      C.add([bg, gh, fi, mk]);
      this.__hk = { C, gh, fi, mk, sc, bw, ph: [] };
      /* marcas de fase: do chefe que acabou de aparecer */
      try { const G = S.scene.get("Game"), b = G?.children?.list?.find((o) => o.data_?.name === name && o.data_?.phases); this.__hk.ph = (b?.data_?.phases || []).map((p) => p.at).filter((v) => v > 0 && v < 1) } catch (e) {}
      this.panel.setVisible(!1); this.bar.setVisible(!1); this.__np?.setVisible(!1);
      S.tweens.killTweensOf(this.parts); for (const o of this.parts) o !== this.panel && o !== this.bar && o !== this.__np && o.setAlpha(1);
      this.emblem.setPosition(Ve - bw / 2 + 30 * sc, 6 + 28.5 * sc).setScale(Math.min(1, 34 * sc / Math.max(1, this.emblem.height)));
      const mid = Ve - bw / 2 + (57 + 157) * sc;
      this.nameText.setOrigin(.5).setPosition(mid, 6 + 28.5 * sc).setFontFamily(__HK_F).setColor("#ffe6b0").setStroke("#1a0404", 4).setFontSize(13); __fit(this.nameText, 290 * sc);
      this.subText.setOrigin(.5, 0).setPosition(mid, 6 + 57 * sc + 1).setFontFamily(__HK_F);
      this.phaseText.setOrigin(1, 0).setPosition(Ve + bw / 2 - 14, 6 + 57 * sc + 1).setFontFamily(__HK_F);
      for (const o of [C]) { o.setAlpha(0); S.tweens.add({ targets: o, alpha: 1, duration: 380 }) }
      this.redraw();
    } catch (e) {}
    return r;
  };
  Pd.prototype.redraw = function () {
    const r = RD0.apply(this, arguments);
    try {
      const K = this.__hk; if (!K || !K.C.active) return r;
      this.panel.setVisible(!1); this.bar.setVisible(!1); this.__np?.setVisible(!1); K.C.setVisible(!!this.visible);
      const hp = this.maxHp > 0 ? Math.max(0, this.hp / this.maxHp) : 0, gh = Math.max(hp, Math.min(1, this.ghost ?? hp));
      K.fi.setCrop(0, 0, 319 * hp, 39).setVisible(hp > 0); K.gh.setCrop(0, 0, 319 * gh, 39).setVisible(gh > hp + .002);
      K.mk.clear(); for (const at of K.ph) { const x = (57 + 314 * at) * K.sc; K.mk.lineStyle(2, 0xffd66e, 1).lineBetween(x, 10 * K.sc, x, 47 * K.sc) }
      if (this.flashT > 0) K.mk.fillStyle(0xffffff, .35 * this.flashT).fillRect(57 * K.sc, 9 * K.sc, 314 * K.sc, 39 * K.sc);
      if (this.numTxt) { this.numTxt.setFontFamily(__HK_F).setOrigin(1, .5).setPosition(Ve + K.bw / 2 - 30 * K.sc, 6 + 28.5 * K.sc) }
    } catch (e) {}
    return r;
  };
  Pd.prototype.hide = function (now) {
    const r = HI0.apply(this, arguments);
    try { const K = this.__hk; if (K?.C.active) { if (now) K.C.setVisible(!1); else this.scene.tweens.add({ targets: K.C, alpha: 0, duration: 450, onComplete: () => K.C.setVisible(!1) }) } } catch (e) {}
    return r;
  };
}

/* 4) vida dos inimigos: some quando cheia e sem levar dano há 4 s; elite com borda dourada */
{const DH0 = lh.prototype.drawHpBar; lh.prototype.drawHpBar = function () {
  const g = this.hpBar; if (!g) return DH0.apply(this, arguments);
  g.clear();
  if (this.dead) { this.hpTxt?.setVisible(!1); return }
  const recent = (this.sinceHit ?? 99) < 4, show = this.isElite || recent || (this.hp < this.maxHp && this.isBoss);
  if (!show) { this.hpTxt?.setVisible(!1); return }
  const w = Math.max(26, this.displayWidth * .8), x = this.x - w / 2, y = this.y - this.displayHeight / 2 - 8, hf = Math.max(0, this.hp / this.maxHp);
  g.fillStyle(0x000000, .7).fillRoundedRect(x - 2, y - 2, w + 4, 8, 2);
  g.fillStyle(0x3a1414, 1).fillRect(x, y, w, 4);
  g.fillStyle(this.isElite ? 0xe0a83a : 0xc82e2e, 1).fillRect(x, y, w * hf, 4);
  g.fillStyle(0xffffff, .28).fillRect(x, y, w * hf, 1);
  g.lineStyle(1, this.isElite ? 0xffd66e : 0xb08446, this.isElite ? 1 : .85).strokeRoundedRect(x - 1.5, y - 1.5, w + 3, 7, 2);
  if (this.isElite && this.affixes?.length) for (let o = 0; o < this.affixes.length; o++) { const a = qt[this.affixes[o]]?.color ?? 0xc9a24a; g.fillStyle(0, .8).fillRect(x + o * 6 - 1, y + 5, 6, 5); g.fillStyle(a, 1).fillRect(x + o * 6, y + 6, 4, 3) }
  if (this.isElite) {
    const hs = `${Math.max(0, Math.ceil(this.hp))}/${this.maxHp}`;
    this.hpTxt || (this.hpTxt = this.scene.add.text(0, 0, "", { fontFamily: __HK_F, fontSize: "7px", fontStyle: "bold", color: "#ffe6b0", stroke: "#000000", strokeThickness: 2 }).setOrigin(.5, 0).setDepth(9001));
    this.hpTxt.originY !== 0 && this.hpTxt.setOrigin(.5, 0);
    this.hpTxt._s !== hs && (this.hpTxt.setText(hs), this.hpTxt._s = hs); this.hpTxt.setPosition(this.x, y + 6).setVisible(!0);   // embaixo da barra (em cima fica o nome do elite)
  } else this.hpTxt?.setVisible(!1);
}}

/* 5) números de dano: letra de pixel; crítico maior, laranja, com "!" e um pulo */
{const FT0 = fh.prototype.floatText; fh.prototype.floatText = function (x, y, t, col = "#ffffff", sz = 10) {
  let crit = !1;
  try { const m = /^(\d+) CR[IÍ]TICO$|^(\d+) CRITICAL$|^(\d+) CRÍTICO$/i.exec(String(t)); if (m) { t = (m[1] || m[2] || m[3]) + "!"; col = "#ffb43c"; sz = 15; crit = !0 } } catch (e) {}
  const r = FT0.call(this, x, y, t, col, sz);
  try {
    const P = this.__ftPool, a = P && [...P].reverse().find((q) => q.active && q.visible && q.text === String(t));
    if (a) { a.__hkF || (a.setFontFamily(__HK_F), a.__hkF = 1); if (crit) { a.setScale(.6); this.scene.tweens.add({ targets: a, scale: 1.25, duration: 110, yoyo: !0, ease: "Back.easeOut", onComplete: () => a.setScale(1) }) } else a.scale !== 1 && a.setScale(1) }
  } catch (e) {}
  return r;
}}

/* 6) avisos de ganho (XP, ouro, item) à direita */
function __hkToast(U, txt, col) {
  try {
    if (!U?.sys?.isActive?.()) return;
    const L = (U.__hkT ||= []).filter((c) => c.active); U.__hkT = L;
    if (L.length >= 4) { const o = L.shift(); o.destroy() }
    const W = typeof _ !== "undefined" ? _ : 640, C = U.add.container(W + 4, 0).setDepth(560);
    const t = U.add.text(0, 0, txt, { fontFamily: __HK_F, fontStyle: "bold", fontSize: "9px", color: col, stroke: "#000000", strokeThickness: 2 }).setOrigin(1, .5);
    const w = Math.min(W * .45, t.width + 14), g = U.add.graphics(); g.fillStyle(0x1e0c0c, .88).fillRoundedRect(-w, -8, w, 16, 4).lineStyle(1, 0xb08446, 1).strokeRoundedRect(-w, -8, w, 16, 4);
    if (t.width > w - 12) t.setScale((w - 12) / t.width);
    t.setPosition(-7, 0); C.add([g, t]); L.push(C);
    const Y0 = U.touchControls?.visible ? 100 : 168, relay = () => L.forEach((c, n) => c.active && U.tweens.add({ targets: c, y: Y0 + n * 19, duration: 160 }));
    C.y = Y0 + (L.length - 1) * 19; relay();
    U.tweens.add({ targets: C, x: W - 8, duration: 220, ease: "Back.easeOut" });
    U.time.delayedCall(2600, () => C.active && U.tweens.add({ targets: C, alpha: 0, x: W + 10, duration: 350, onComplete: () => { C.destroy(); relay() } }));
  } catch (e) {}
}
{
  let lastXp = null, lastLv = null, lastGold = null;
  const hook = () => {
    const g = window.__DED_GAME; if (!g?.events) return setTimeout(hook, 500);
    const U = () => { const u = g.scene.getScene("UI"), G = g.scene.getScene("Game"); return u?.sys?.isActive?.() && G?.sys?.isActive?.() ? u : null };
    g.events.on("hud:xp", (lv, xp) => {
      try { if (lastLv === lv && lastXp != null && xp > lastXp) __hkToast(U(), `+${Math.round(xp - lastXp)} XP`, "#ffd66e"); lastLv = lv; lastXp = xp } catch (e) {}
    });
    g.events.on("hud:gold", (gold) => {
      try { if (lastGold != null && gold > lastGold) __hkToast(U(), `+${gold - lastGold} ${__L3("ouro", "gold", "oro")}`, "#f2c86a"); lastGold = gold } catch (e) {}
    });
    /* troca de fase/cena: o próximo valor é só referência */
    g.events.on("hkReset", () => { lastXp = lastLv = lastGold = null });
  };
  hook();
  const C0 = Sd.prototype.create; Sd.prototype.create = function () { try { this.game.events.emit("hkReset") } catch (e) {} return C0.apply(this, arguments) };
  const PK0 = Sd.prototype.pickup; Sd.prototype.pickup = function (o) {
    const it = o?.payload?.item, n0 = this.inventory?.items?.length;
    const r = PK0.apply(this, arguments);
    try { if (it && it.type !== "potion" && it.type !== "quest" && this.inventory?.items?.length > n0) { const R = bt[it.rarity]; __hkToast(this.scene.get("UI"), `${__L3("ITEM", "ITEM", "OBJETO")}: ${_t(it)}`, "#" + (R?.color ?? 0xffffff).toString(16).padStart(6, "0")) } } catch (e) {}
    return r;
  };
}

/* 7) missão em andamento (canto de cima à direita) */
{const U0 = __Hud2.prototype.update; __Hud2.prototype.update = function (g) {
  const r = U0.apply(this, arguments);
  try {
    const S = this.s; if (typeof __QLIST === "undefined") return r;
    const show = !!g?.player && S.hud?.panel?.visible !== !1 && g.state === "playing";
    const K = this.__hkQ ||= {};
    if (!K.C) {
      K.C = S.add.container(0, 0).setDepth(108); K.g = S.add.graphics();
      K.t1 = S.add.text(0, 0, "", { fontFamily: __HK_F, fontStyle: "bold", fontSize: "8px", color: "#ffd66e", stroke: "#000000", strokeThickness: 2 });
      K.t2 = S.add.text(0, 0, "", { fontFamily: __HK_F, fontSize: "7.5px", color: "#ecdcbe", stroke: "#000000", strokeThickness: 2, wordWrap: { width: 140 } });
      K.C.add([K.g, K.t1, K.t2]);
    }
    if (!show) { K.C.setVisible(!1); return r }
    const now = performance.now();
    if (!K.at || now - K.at > 1000) {
      K.at = now; let q = null;
      for (const Q of __QLIST) { try { const s = Q.st(g); s && s[0] === "on" && (q = [Q.title, s[1]]) } catch (e) {} }
      K.q = q;
    }
    if (!K.q) { K.C.setVisible(!1); return r }
    const [t1, t2] = K.q, key = t1 + "|" + t2;
    if (K.k !== key) {
      K.k = key; K.t1.setText(`${__L3("MISSÃO", "QUEST", "MISIÓN")} · ${t1}`); K.t2.setText(String(t2 || "").slice(0, 120));
      K.t1.setScale(1); K.t1.width > 140 && K.t1.setScale(140 / K.t1.width);
      const w = 152, h = 12 + K.t2.height + 4; K.g.clear().fillStyle(0x1e0c0c, .85).fillRoundedRect(0, 0, w, h, 4).lineStyle(1, 0xb08446, 1).strokeRoundedRect(0, 0, w, h, 4);
      K.t1.setPosition(6, 3); K.t2.setPosition(6, 13); K.w = w;
    }
    const W = typeof _ !== "undefined" ? _ : 640;
    K.C.setPosition(W - K.w - 8, this.mode === "mob" ? 52 : 56).setVisible(!0);
  } catch (e) {}
  return r }}

/* 8) aviso de botão num quadro escuro; no celular sem a tecla */
{const C0 = Sd.prototype.create; Sd.prototype.create = function () {
  const r = C0.apply(this, arguments);
  try {
    const H = this.interactHint; if (H && !H.__hk) {
      H.__hk = 1;
      H.setFontFamily(__HK_F).setStyle({ backgroundColor: "#1e0c0cdd", padding: { x: 5, y: 2 }, color: "#f2e6c8", stroke: "#000000", strokeThickness: 2 }).setFontSize(8);
      const ST = H.setText.bind(H);
      H.setText = (t) => { try { const tv = !!this.scene.get("UI")?.touchControls?.visible; if (tv) t = String(t).replace(/^\[[^\]]*\]\s*/, "") } catch (e) {} return ST(t) };
    }
  } catch (e) {}
  return r }}

/* 9) vida baixa: bordas vermelhas pulsando (textura própria: degradê vermelho nas bordas) */
function __hkVigTex(S) {
  if (S.textures.exists("hk-redvig")) return "hk-redvig";
  const w = 256, h = 144, c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d");
  const g = x.createRadialGradient(w / 2, h / 2, h * .38, w / 2, h / 2, w * .62); g.addColorStop(0, "rgba(200,0,0,0)"); g.addColorStop(.6, "rgba(190,10,10,.35)"); g.addColorStop(1, "rgba(150,0,0,.85)");
  x.fillStyle = g; x.fillRect(0, 0, w, h); S.textures.addCanvas("hk-redvig", c); return "hk-redvig";
}
{const U0 = __Hud2.prototype.update; __Hud2.prototype.update = function (g) {
  const r = U0.apply(this, arguments);
  try {
    const S = this.s, W = typeof _ !== "undefined" ? _ : 640, H = typeof st !== "undefined" ? st : 360;
    const K = this.__hkV ||= { im: S.add.image(W / 2, H / 2, __hkVigTex(S)).setDisplaySize(W, H).setDepth(41).setAlpha(0) };
    const P = g?.player, hp = P?.maxHp > 0 ? P.hp / P.maxHp : 1, low = !!P && !P.dead && hp > 0 && hp < .3 && g.state === "playing";
    K.im.setVisible(low); if (low) K.im.setAlpha(.45 + .4 * (.5 + .5 * Math.sin(S.time.now / 260)));
  } catch (e) {}
  return r }}
