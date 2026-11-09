/* ── Menus em livro (kit "Pixel Journal – Book UI Kit", Antahonist) ─────────────────────────────────────────────
   As janelas do jogo (inventário e abas, habilidades, diário, relíquias, lojas…) passam a ser um livro de couro
   aberto, com páginas de papel, em vez do painel escuro:
   - __winSkin desenha o livro (janela larga = duas páginas com lombada; estreita = uma página com moldura de couro)
     do tamanho exato da janela, montado em 9 fatias a partir de book_spread.png.
   - tudo que está dentro da janela é "passado para o papel": textos claros viram tinta marrom, dourados viram
     carmim, fundos escuros viram papel envelhecido, bordas viram traço marrom (cores trocadas na hora em que são
     desenhadas, então vale para o que cada aba redesenha depois).
   - inventário: o livro abre com a animação do kit, cada troca de aba vira a página, a aba ativa ganha a fita
     vermelha e o conteúdo é arrumado para não cair na lombada.                                                     */
const __BKP = "pixel-art/book/";   // o carregador da cena de abertura já começa em assets/
const __BK_PARTS = ["book_spread", "panel_paper", "panel_paper_ornate", "panel_leather", "panel_inset", "banner_title",
  "divider", "close_button_normal", "close_button_hover", "slot_36", "slot_36_selected", "slot_36_locked",
  "button_leather_normal", "button_leather_hover", "button_red_normal", "button_green_normal", "ribbon_bookmark_red",
  "wax_seal", "checkbox_on", "checkbox_off", "list_row_selected", "list_row_normal", "bar_frame", "bar_fill_gold", "bar_fill_red", "corner_ornament_tl", "corner_ornament_tr", "corner_ornament_bl", "corner_ornament_br", "tooltip", "page_curl"];
(function () {
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    P0.call(this);
    const L = this.load;
    for (const n of __BK_PARTS) L.image("bk-" + n, __BKP + n + ".png");
    L.spritesheet("bk-open", __BKP + "open_sheet.png", { frameWidth: 492, frameHeight: 336 });
    for (const d of ["forward", "backward"]) for (const l of ["page", "shadow"])
      L.spritesheet(`bk-flip-${d[0]}-${l}`, __BKP + `flip_${d}_fast_${l}.png`, { frameWidth: 492, frameHeight: 336 });
  };
})();
try { document.fonts?.load?.('10px "PixelifySans"'); } catch (e) {}
function __bkOk(S) { return S.textures.exists("bk-book_spread"); }

/* 9 fatias com o miolo e as bordas repetidos (o grão do papel se repete em vez de esticar) */
function __bk9(g, src, sx, sy, sw, sh, m, dx, dy, dw, dh) {
  const [L, T, R, B] = m, cw = sw - L - R, ch = sh - T - B, dcw = dw - L - R, dch = dh - T - B;
  const tile = (x0, y0, w0, h0, X, Y, W, H) => {
    for (let y = 0; y < H; y += h0) for (let x = 0; x < W; x += w0) {
      const ww = Math.min(w0, W - x), hh = Math.min(h0, H - y);
      g.drawImage(src, x0, y0, ww, hh, X + x, Y + y, ww, hh);
    }
  };
  g.drawImage(src, sx, sy, L, T, dx, dy, L, T);
  g.drawImage(src, sx + sw - R, sy, R, T, dx + dw - R, dy, R, T);
  g.drawImage(src, sx, sy + sh - B, L, B, dx, dy + dh - B, L, B);
  g.drawImage(src, sx + sw - R, sy + sh - B, R, B, dx + dw - R, dy + dh - B, R, B);
  tile(sx + L, sy, cw, T, dx + L, dy, dcw, T);
  tile(sx + L, sy + sh - B, cw, B, dx + L, dy + dh - B, dcw, B);
  tile(sx, sy + T, L, ch, dx, dy + T, L, dch);
  tile(sx + sw - R, sy + T, R, ch, dx + dw - R, dy + T, R, dch);
  tile(sx + L, sy + T, cw, ch, dx + L, dy + T, dcw, dch);
}
/* livro aberto de w×h (duas páginas) ou uma página só */
function __bkTex(S, w, h, single) {
  w = Math.round(w); h = Math.round(h);
  const key = `bk-${single ? "page" : "book"}-${w}x${h}`;
  if (S.textures.exists(key)) return key;
  const t = S.textures.createCanvas(key, w, h), g = t.getContext();
  g.imageSmoothingEnabled = !1;
  const src = S.textures.get("bk-book_spread").getSourceImage();
  if (single) {
    const lea = S.textures.get("bk-panel_leather").getSourceImage(), pap = S.textures.get("bk-panel_paper_ornate").getSourceImage();
    __bk9(g, lea, 0, 0, 48, 48, [7, 7, 7, 7], 0, 0, w, h);
    __bk9(g, pap, 0, 0, 48, 48, [9, 9, 9, 9], 6, 6, w - 12, h - 12);
  } else {
    const hw = Math.floor(w / 2);
    __bk9(g, src, 0, 0, 210, 264, [14, 14, 14, 18], 0, 0, hw, h);
    __bk9(g, src, 210, 0, 210, 264, [14, 14, 14, 18], hw, 0, w - hw, h);
  }
  t.refresh();
  t.setFilter(j.Textures.FilterMode.NEAREST);
  return key;
}

/* ── troca de cores: tema escuro → papel ── */
const __bkHSL = c => {
  const r = (c >> 16 & 255) / 255, g = (c >> 8 & 255) / 255, b = (c & 255) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const L = (mx + mn) / 2, d = mx - mn, S = d ? d / (1 - Math.abs(2 * L - 1)) : 0;
  let H = 0;
  if (d) H = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [H * 60, S, L];
};
const __bkDark = (c, k) => ((c >> 16 & 255) * k << 16) | ((c >> 8 & 255) * k << 8) | ((c & 255) * k);
const __bkGold = (H, S) => S > .35 && H >= 28 && H <= 62;
const __bkFromHSL = (H, S, L) => {
  const C = (1 - Math.abs(2 * L - 1)) * S, X = C * (1 - Math.abs((H / 60) % 2 - 1)), m = L - C / 2;
  const [r, g, b] = H < 60 ? [C, X, 0] : H < 120 ? [X, C, 0] : H < 180 ? [0, C, X] : H < 240 ? [0, X, C] : H < 300 ? [X, 0, C] : [C, 0, X];
  return (Math.round((r + m) * 255) << 16) | (Math.round((g + m) * 255) << 8) | Math.round((b + m) * 255);
};
function __bkFill(c, a) {
  const [H, S, L] = __bkHSL(c);
  if (L < .3 && L >= .1 && S >= .4 && (__bkGold(H, S) || H < 28 || (H > 80 && H < 170))) return [__bkFromHSL(H, Math.min(__bkGold(H, S) || H < 28 ? .5 : .22, S), .72), a * .8];   // destaque escuro colorido → tinta clara da mesma cor
  if (L < .16) return [0xc3a06c, a * .42];                 // fundo/escaninho escuro → papel mais escuro
  if (L < .42 && S < .4) return [0xae8a5a, a * .55];
  if (__bkGold(H, S)) return [0xb8862f, a];                // destaque dourado → ouro velho
  return [c, a];
}
function __bkLine(c, a) {
  const [H, S, L] = __bkHSL(c);
  if (__bkGold(H, S)) return [0x9a6a1c, a];
  if (S < .35) return [0x7a5634, Math.max(a, .55)];
  return [__bkDark(c, .7), a];
}
const __bkHex = c => "#" + (c >>> 0).toString(16).padStart(6, "0").slice(-6);
function __bkCssToInt(s) {
  if (typeof s !== "string") return null;
  const m = s.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  const h = m[1].length === 3 ? m[1].split("").map(x => x + x).join("") : m[1];
  return parseInt(h, 16);
}
function __bkText(css) {
  const c = __bkCssToInt(css);
  if (c == null) return css;
  const [H, S, L] = __bkHSL(c);
  if (S < .25 || L > .78) return L > .62 ? "#3b2416" : L > .38 ? "#6b4a2e" : "#4a3020";   // claro/creme → tinta
  if (__bkGold(H, S)) return L > .45 ? "#8b1d16" : "#7a4a10";
  return __bkHex(__bkDark(c, L > .5 ? .55 : .8));
}
/* Graphics: comandos já gravados também trocam de cor */
let __BKCMD = null;
function __bkCmds(S) {
  if (__BKCMD) return __BKCMD;
  const g = S.add.graphics(), b = g.commandBuffer, code = f => { b.length = 0; f(); return b[0]; }, M = {};
  const add = (f, n) => { const k = code(f); k != null && (M[k] = n); };
  add(() => g.fillStyle(1, 1), "F"); add(() => g.lineStyle(1, 1, 1), "L"); add(() => g.fillGradientStyle(1, 1, 1, 1, 1), "G");
  const n = {}, cnt = (f, k) => { b.length = 0; f(); n[b[0]] = b.length - 1; };
  cnt(() => g.fillStyle(1, 1)); cnt(() => g.lineStyle(1, 1, 1)); cnt(() => g.fillGradientStyle(1, 1, 1, 1, 1));
  cnt(() => g.beginPath()); cnt(() => g.closePath()); cnt(() => g.fillPath()); cnt(() => g.strokePath());
  cnt(() => g.fillRect(0, 0, 1, 1)); cnt(() => g.moveTo(0, 0)); cnt(() => g.lineTo(1, 1));
  cnt(() => g.fillTriangle(0, 0, 1, 0, 0, 1)); cnt(() => g.strokeTriangle(0, 0, 1, 0, 0, 1));
  cnt(() => g.arc(0, 0, 1, 0, 1)); cnt(() => g.save()); cnt(() => g.restore());
  cnt(() => g.translateCanvas(1, 1)); cnt(() => g.scaleCanvas(1, 1)); cnt(() => g.rotateCanvas(1));
  g.destroy();
  return (__BKCMD = { M, n });
}
function __bkRecolorBuf(S, o) {
  const C = __bkCmds(S), b = o.commandBuffer;
  if (!b) return;
  for (let i = 0; i < b.length;) {
    const k = b[i], t = C.M[k], n = C.n[k];
    if (n == null) return;                       // comando desconhecido: para (não arrisca desalinhar)
    if (t === "F") { const m = __bkFill(b[i + 1], b[i + 2]); b[i + 1] = m[0]; b[i + 2] = m[1]; }
    else if (t === "L") { const m = __bkLine(b[i + 2], b[i + 3]); b[i + 2] = m[0]; b[i + 3] = m[1]; }
    else if (t === "G") { for (let q = 1; q <= 4; q++) b[i + q] = __bkFill(b[i + q], 1)[0]; }
    i += n + 1;
  }
}
(function () {
  const GP = j.GameObjects.Graphics.prototype, f0 = GP.fillStyle, l0 = GP.lineStyle, g0 = GP.fillGradientStyle;
  GP.fillStyle = function (c, a = 1) { if (this.__paper && !this.__bkRaw) { const m = __bkFill(c, a); return f0.call(this, m[0], m[1]); } return f0.call(this, c, a); };
  GP.lineStyle = function (w, c, a = 1) { if (this.__paper && !this.__bkRaw) { const m = __bkLine(c, a); return l0.call(this, w, m[0], m[1]); } return l0.call(this, w, c, a); };
  GP.fillGradientStyle = function (a, b, c, d, al, ...r) {
    if (this.__paper) { const F = x => __bkFill(x, 1)[0]; return g0.call(this, F(a), F(b), F(c), F(d), al, ...r); }
    return g0.call(this, a, b, c, d, al, ...r);
  };
  const TP = j.GameObjects.Text.prototype, c0 = TP.setColor, st0 = TP.setStroke, sh0 = TP.setShadow, bg0 = TP.setBackgroundColor;
  TP.setColor = function (c) { return c0.call(this, this.__paper && !this.__bkBtn ? __bkText(c) : c); };
  TP.setStroke = function (c, w) { return this.__paper ? st0.call(this, "#000000", 0) : st0.call(this, c, w); };
  TP.setShadow = function (...a) { return this.__paper ? this : sh0.apply(this, a); };
  TP.setBackgroundColor = function (c) { return bg0.call(this, this.__paper && c ? "#6e3b22" : c); };
})();
function __bkPaperize(S, o, root) {
  if (!o || o.__noPaper) return;
  if (o.type === "Container") { for (const c of o.list) __bkPaperize(S, c, root); return; }
  if (o.__paper) return;
  o.__paper = 1;
  if (o.type === "Graphics") __bkRecolorBuf(S, o);
  else if (o.type === "Text") {
    const st = o.style;
    if (st.backgroundColor) {             // botão de texto: couro com letra clara
      o.__bkBtn = 1;
      o.setBackgroundColor("#6e3b22");
      o.setColor("#f6e7c8");
    } else o.setColor(st.color);
    st.strokeThickness && o.setStroke("#000", 0);
    try { st.shadowBlur || st.shadowOffsetX ? (o.style.setShadow(0, 0, "#000", 0, !1, !1), o.updateText()) : 0; } catch (e) {}
  } else if ((o.type === "Rectangle" || o.type === "Arc") && o.isFilled && o.width < _ * .9) {
    const m = __bkFill(o.fillColor, o.fillAlpha);
    o.setFillStyle(m[0], m[1]);
    o.isStroked && o.setStrokeStyle(o.lineWidth, __bkLine(o.strokeColor, o.strokeAlpha)[0], o.strokeAlpha);
  }
}
/* raízes com livro: a cada quadro passa para o papel o que apareceu de novo (barato: quem já foi marcado é pulado) */
function __bkTrack(S, root) {
  (S.__bkRoots ||= new Set()).add(root);
  if (S.__bkHook) return;
  S.__bkHook = 1;
  S.events.on("update", () => { for (const r of S.__bkRoots) if (r.active && r.visible) __bkPaperize(S, r, r); });
  S.events.once("shutdown", () => { S.__bkRoots = null; S.__bkHook = 0; });
}

/* __winSkin: o livro no lugar do painel escuro */
__winSkin = function (S, root, x, y, w, h, idx = 1) {
  if (!__bkOk(S)) return !1;
  const single = w < 560 || h > w * 1.05, pad = single ? 6 : 8;   // duas páginas só nas janelas feitas em duas colunas
  const key = __bkTex(S, w + pad * 2, h + pad * 2, single);
  const img = S.add.image(x - pad, y - pad, key).setOrigin(0);
  img.__noPaper = 1;
  root.addAt(img, idx);
  root.__bk = { x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2, single, img };
  __bkTrack(S, root);
  return !0;
};

/* ── animações do livro ── */
function __bkAnims(S) {
  const A = S.anims;
  if (A.exists("bk-open")) return;
  A.create({ key: "bk-open", frames: A.generateFrameNumbers("bk-open", { start: 2, end: 15 }), frameRate: 26 });
  for (const d of ["f", "b"]) for (const l of ["page", "shadow"])
    A.create({ key: `bk-flip-${d}-${l}`, frames: A.generateFrameNumbers(`bk-flip-${d}-${l}`), frameRate: 22 });
}
/* toca os quadros contando o tempo com o atraso de cada quadro limitado: um tranco (montar a janela na primeira
   vez) não pula a animação inteira */
function __bkPlay(S, spr, from, to, ms, done) {
  let t = 0, f = from;
  spr.setFrame(f);
  const U = (_, dt) => {
    if (!spr.active) { S.events.off("update", U); return; }
    t += Math.min(dt, 34);
    while (t >= ms && f < to) { t -= ms; spr.setFrame(++f); }
    if (f >= to && t >= ms) { S.events.off("update", U); done?.(); }
  };
  S.events.on("update", U);
}
/* sprite do kit encaixado no livro desenhado (o quadro tem 36 px de margem e o livro 420×264 dentro) */
function __bkFit(S, spr, B, depth) {
  const sx = B.w / 420, sy = B.h / 264;
  spr.setOrigin(0).setScale(sx, sy).setPosition(B.x - 36 * sx, B.y - 36 * sy).setDepth(depth);
  spr.texture.setFilter(j.Textures.FilterMode.NEAREST);
  return spr;
}
function __bkOpenAnim(S, root, done) {
  const B = root.__bk;
  if (!B) { done?.(); return; }
  __bkAnims(S);
  const ox = root.x, oy = root.y, s = __bkFit(S, S.add.sprite(0, 0, "bk-open", 2), { ...B, x: B.x + ox, y: B.y + oy }, (root.depth || 0) + 1);
  root.setAlpha(0);
  __bkPlay(S, s, 2, 15, 38, () => {
    s.destroy();
    S.tweens.add({ targets: root, alpha: 1, duration: 120 });
    done?.();
  });
}
function __bkFlip(S, root, fwd) {
  const B = root.__bk;
  if (!B || B.single) return;
  __bkAnims(S);
  const d = fwd ? "f" : "b", BB = { ...B, x: B.x + root.x, y: B.y + root.y }, dep = (root.depth || 0) + 2;
  const sh = __bkFit(S, S.add.sprite(0, 0, `bk-flip-${d}-shadow`, 0), BB, dep), pg = __bkFit(S, S.add.sprite(0, 0, `bk-flip-${d}-page`, 0), BB, dep + .1);
  __bkPlay(S, sh, 0, 7, 42);
  __bkPlay(S, pg, 0, 7, 42, () => { sh.destroy(); pg.destroy(); });
}

/* ── inventário (abas) ── */
(function () {
  const show0 = Cd.prototype.show;
  Cd.prototype.show = function () {
    const was = this.open;
    show0.apply(this, arguments);
    if (!was && this.root?.__bk) {
      this.__tw?.stop?.();                 // a entrada antiga (sobe e aparece) dá lugar ao livro abrindo
      this.root.setY(0);
      __bkTabs(this);
      __bkGrid(this);
      __bkOpenAnim(this.ui, this.root);
    }
  };
  const ref0 = Cd.prototype.refresh;
  Cd.prototype.refresh = function () {
    const r = ref0.apply(this, arguments);
    this.root?.__bk && __bkGrid(this);
    return r;
  };
  const tab0 = __invTab;
  __invTab = function (C, k) {
    const prev = C.__tab, open = C.open && C.root?.visible && C.root.alpha > .9;
    tab0(C, k);
    if (C.root?.__bk) {
      __bkTabs(C);
      __bkSpine(C);
      if (open && prev != null && prev !== C.__tab) __bkFlip(C.ui, C.root, C.__tab > prev || (prev === C.__tabT.length - 1 && C.__tab === 0));
    }
  };
})();
/* ficha do item no livro: um cartão de pergaminho opaco na página do lado oposto ao que foi tocado — item do
   inventário (página da direita) abre a ficha na página da esquerda, item vestido (esquerda) abre na da direita.
   Assim a ficha nunca cobre a grade nem os espaços que a pessoa está percorrendo, e dá para ler tudo. */
{
  const T2 = __invTip;
  __invTip = function (C) {
    const B = C.root?.__bk;
    if (!B || B.single) return T2.apply(this, arguments);
    const half = B.w / 2, botLim = B.y + B.h - 18, top = C.selected?.source === "equip" && C.invTitle ? Math.round(C.invTitle.y + C.invTitle.height + 2) : B.y + 40;
    C.__tipLim = botLim;               // a página toda é da ficha: só passa para duas colunas se não couber mesmo
    const r = T2.apply(this, arguments);
    try {
      const g = C.__tipG, parts = [C.tipName, C.tipMeta, C.tipLock, C.tipStats, C.tipDesc, C.tipSet, C.cmpTitle, C.cmpText].filter(o => o && o.visible && o.text);
      if (!g || !parts.length || !C.selectedItem()) return r;
      const onLeft = C.selected?.source !== "equip";
      const px0 = onLeft ? B.x + 18 : B.x + half + 14, px1 = onLeft ? B.x + half - 14 : B.x + B.w - 18;
      let x0 = Math.min(...parts.map(o => o.x)), x1 = Math.max(...parts.map(o => o.x + o.width)), y0 = Math.min(...parts.map(o => o.y)), y1 = Math.max(...parts.map(o => o.y + o.height));
      const w = Math.min(px1 - px0, Math.max(200, x1 - x0 + 24)), h = y1 - y0 + 18;
      const bx = Math.round(px0 + (px1 - px0 - w) / 2), by = Math.round(Math.max(top, Math.min(top + 6, botLim - h)));
      const dx = bx + 12 - x0, dy = by + 9 - y0;
      for (const o of parts) o.setPosition(Math.round(o.x + dx), Math.round(o.y + dy));
      g.__bkRaw = 1;
      g.clear()
        .fillStyle(0x3b2416, .22).fillRoundedRect(bx + 3, by + 4, w, h, 5)
        .fillStyle(0xf6e9c8, 1).fillRoundedRect(bx, by, w, h, 5)
        .lineStyle(2, 0x6e4a2a, 1).strokeRoundedRect(bx + 1, by + 1, w - 2, h - 2, 5)
        .lineStyle(1, 0xb8862f, .7).strokeRoundedRect(bx + 4, by + 4, w - 8, h - 8, 3);
      g.__bkRaw = 0;
      C.root.bringToTop(g);
      for (const o of parts) C.root.bringToTop(o);
      for (const b of [C.actionBtn, C.dropBtn, C.forgeBtn, C.closeBtn, C.closeBtn?.__bkX]) b && C.root.bringToTop(b);
    } catch (e) {}
    return r;
  };
}
/* setas no inventário: os espaços vestidos ficam em duas colunas (elmo, armadura, botas, acessório 2 | arma, escudo,
   acessório 1) e a grade fica à direita delas — as setas andam pelo que se vê, não pela ordem antiga dos espaços */
{
  const COLS = [["helmet", "armor", "boots", "accessory2"], ["weapon", "offhand", "accessory1"]];
  const hk0 = Cd.prototype.handleKey;
  Cd.prototype.handleKey = function (k) {
    try {
      const arrows = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] };
      const v = arrows[k];
      if (!v || !this.open || !this.__sk || (this.__logicalTab ?? this.__tab ?? 0) !== 0 || typeof __EQPOS === "undefined") return hk0.apply(this, arguments);
      const inv = this.gs().inventory, per = 5, rows = Math.ceil(inv.capacity / per), f = this.focus ?? (this.focus = this.firstFocus());
      if (f.area === "inv") {
        const c = f.index % per, r = Math.floor(f.index / per);
        if (!(v[0] < 0 && c === 0)) return hk0.apply(this, arguments);
        const col = COLS[1];
        this.focus = { area: "equip", index: se.indexOf(col[Math.min(r, col.length - 1)]) };
        this.refresh();
        return !0;
      }
      const name = se[f.index], ci = COLS[0].includes(name) ? 0 : 1, ri = Math.max(0, COLS[ci].indexOf(name));
      if (v[1]) {
        const col = COLS[ci];
        this.focus = { area: "equip", index: se.indexOf(col[(ri + v[1] + col.length) % col.length]) };
      } else if (v[0] > 0 && ci === 1) {
        this.focus = { area: "inv", index: Math.min(ri, rows - 1) * per };
      } else if (v[0] > 0 || (v[0] < 0 && ci === 1)) {
        const col = COLS[1 - ci];
        this.focus = { area: "equip", index: se.indexOf(col[Math.min(ri, col.length - 1)]) };
      }
      this.refresh();
      return !0;
    } catch (e) { return hk0.apply(this, arguments); }
  };
}
/* abas: a ativa ganha a fita vermelha do kit; as outras ficam como tinta */
function __bkTabs(C) {
  const S = C.ui, T = C.__tabT;
  if (!T) return;
  C.__tabG?.clear();
  C.__bkRib ||= (() => { const r = S.add.nineslice(0, 0, "bk-banner_title", undefined, 80, 17, 11, 11, 4, 6).setOrigin(.5); r.__noPaper = 1; C.root.add(r); return r; })();
  T.forEach((o, n) => {
    o.__bkBtn = n === C.__tab ? 1 : 0;
    o.setColor(n === C.__tab ? "#fbe9c6" : "#5a3a22");
    o.setFontFamily?.("PixelifySans, Georgia, serif");
  });
  __bkClose(S, C.root, C.closeBtn);
  const t = T[C.__tab];
  if (t) {
    C.__bkRib.setVisible(!0).setSize(t.width + 34, 17).setPosition(t.x + t.width / 2, t.y + 1);
    C.root.bringToTop(C.__bkRib);
    C.root.bringToTop(t);
  }
}
/* abas de página inteira (crônicas, habilidades, poções, deck): a grade do inventário some — antes ficava atrás de
   um fundo escuro opaco, que no papel não existe mais */
function __bkGrid(C) {
  const lt = C.__logicalTab ?? 0, full = lt !== 0, on = !full;   // a grade é só da aba de equipamento
  C.__chBg?.setVisible(!1);
  C.slotsG?.setVisible(on);
  C.invTitle?.setVisible(on);
  for (const g of C.gridUi || []) { g.zone?.setVisible(on); if (full) g.icon.setVisible(!1); }
  C.__bkGridOff = full;
  try { __bkRight(C, lt); } catch (e) {}
}
/* página da direita das abas de texto: a identificação do que está na página da esquerda */
const __BK_STATS = [
  ["damage", "Dano", "Damage", "força de cada golpe físico.", "strength of each physical hit."],
  ["magicDamage", "Dano mágico", "Magic damage", "força das magias e habilidades arcanas.", "power of spells and arcane skills."],
  ["defense", "Defesa", "Defense", "tira uma parte do dano de cada golpe recebido.", "removes part of the damage of every hit you take."],
  ["maxHp", "Vida", "Health", "quanto você aguenta antes de cair.", "how much you can take before falling."],
  ["speed", "Velocidade", "Speed", "rapidez para andar e fugir dos golpes.", "how fast you move and dodge."],
  ["critChance", "Crítico", "Crit", "chance de acertar um golpe crítico; o x mostra quanto ele multiplica.", "chance of a critical hit; the x shows its multiplier."],
  [null, "Atq/s", "Atk/s", "golpes por segundo.", "attacks per second."],
  [null, "Bloqueio", "Block", "chance de aparar o golpe com o escudo.", "chance to parry a hit with the shield."],
  ["maxMana", "Recurso", "Resource", "fúria, mana ou energia da sua classe, gasta nas habilidades.", "your class's rage, mana or energy, spent on skills."],
];
function __bkRight(C, lt) {
  const B = C.root?.__bk, S = C.ui;
  if (!B || B.single) return;
  const show = lt === 1 || lt === 2;
  if (!C.__bkR) {
    if (!show) return;
    const x = Math.round(B.x + B.w / 2 + 18), w = Math.round(B.w / 2 - 40);
    const PX = "PixelifySans, Georgia, serif", SER = "Georgia, 'Times New Roman', serif";
    const t = S.add.text(x, B.y + 36, "", { fontFamily: PX, fontSize: "11px", color: "#8b1d16" });
    const dv = S.add.image(x + w / 2, B.y + 54, "bk-divider").setScale(2, 1);
    const b = S.add.text(x, B.y + 62, "", { fontFamily: SER, fontSize: "9px", color: "#3b2416", lineSpacing: 3, wordWrap: { width: w } });
    for (const o of [t, dv, b]) { o.__noPaper = 1; C.root.add(o); }
    C.__bkR = { t, dv, b, x, w };
  }
  const R = C.__bkR, pt = __L3("pt", "en", "es") !== "en";
  for (const o of [R.t, R.dv, R.b]) o.setVisible(show);
  if (!show) return;
  const L = (a, b) => pt ? a : b;
  if (lt === 1) {
    R.t.setText(L("O QUE CADA ATRIBUTO FAZ", "WHAT EACH STAT DOES"));
    const eq = C.gs?.()?.inventory?.equipment || {}, tot = {};
    for (const it of Object.values(eq)) if (it?.stats) for (const [k, v] of Object.entries(it.stats)) tot[k] = (tot[k] || 0) + v;
    const lines = __BK_STATS.map(([k, p, e, dp, de]) => `${L(p, e)}${k && tot[k] ? `  (+${tot[k]} ${L("do equipamento", "from gear")})` : ""} — ${L(dp, de)}`);
    R.b.setText(lines.join("\n"));
  } else {
    R.t.setText(L("MISSÕES EM ANDAMENTO", "QUESTS IN PROGRESS"));
    const G = S.scene.get("Game"), out = [];
    try {
      for (const q of (typeof __QLIST !== "undefined" ? __QLIST : [])) {
        const st = q.st(G);
        if (!st || st[0] === "done") continue;
        const txt = String(st[1] || "").replace(/\s+/g, " ");
        out.push(`◆ ${q.title}\n${txt.length > 150 ? txt.slice(0, 148) + "…" : txt}`);
        if (out.length >= 4) break;
      }
    } catch (e) {}
    R.b.setText(out.length ? out.join("\n\n") : L("Nenhuma missão em andamento.\nAbra o Diário [L] para ver as concluídas.", "No quests in progress.\nOpen the Journal [L] to see completed ones."));
  }
  const max = B.y + B.h - 20 - R.b.y;
  R.b.setFontSize("9px");
  if (R.b.height > max) R.b.setFontSize("8px");
}
/* o conteúdo da aba de equipamento não pode cair na lombada: a grade vai inteira para a página da direita */
function __bkSpine(C) {
  const B = C.root.__bk;
  if (!B || B.single || !C.gridUi) return;
  const gx = Math.round(B.x + B.w / 2 + 16);
  if (C.gridUi[0]?.pos?.x !== gx) {
    for (let d = 0; d < C.gridUi.length; d++) {
      const g = C.gridUi[d], x = gx + d % 5 * 44, y = 66 + Math.floor(d / 5) * 44;
      g.pos = { x, y };
      g.icon.setPosition(x + 20, y + 20);
      g.zone?.setPosition(x, y);
    }
  }
  C.invTitle.setX(gx);
  let bx = gx;
  for (const b of [C.actionBtn, C.dropBtn, C.forgeBtn]) if (b) { b.setX(bx); bx += b.width + 8; }
}

/* botão de fechar do kit (selo vermelho) no lugar do ✕ escuro; o botão original continua recebendo o toque */
function __bkClose(S, root, btn) {
  if (!btn || btn.__bkX) return;
  const b = btn.getBounds?.(), B = root.__bk;
  if (!b || !B) return;
  const cx = Math.min(b.centerX - root.x, B.x + B.w - 12), cy = Math.max(b.centerY - root.y, B.y + 12);
  const im = S.add.image(cx, cy, "bk-close_button_normal").setScale(2);
  im.__noPaper = 1;
  root.add(im);
  btn.__bkX = im;
  btn.setAlpha(.001);
  btn.on?.("pointerover", () => im.setTexture("bk-close_button_hover"));
  btn.on?.("pointerout", () => im.setTexture("bk-close_button_normal"));
  const vis0 = btn.setVisible;
  btn.setVisible = function (v) { im.setVisible(v); return vis0.call(this, v); };
}

/* ── diário de missões: página da esquerda com a lista (marcada quando concluída), da direita com a missão ── */
{
  const D0 = __qDiary;
  __qDiary = function (S) {
    const ui = S.scene.get("UI");
    if (!ui || ui.__qDia) return;
    if (!__bkOk(ui)) return D0(S);
    const PX = "PixelifySans, Georgia, serif", SER = "Georgia, 'Times New Roman', serif";
    const W = 560, H = 318, x0 = Math.round((_ - W) / 2), y0 = Math.round((st - H) / 2), sp = x0 + W / 2;
    const R = ui.add.container(0, 0).setDepth(9850);
    ui.__qDia = R;
    const dim = ui.add.rectangle(_ / 2, st / 2, _ * 1.3, st * 1.3, 0, .6).setInteractive();
    dim.__noPaper = 1;
    R.add(dim);
    __winSkin(ui, R, x0, y0, W, H, 1);
    R.__bk && (R.__bk.img.__noPaper = 1);
    const add = o => { o.__noPaper = 1; R.add(o); return o; };
    const rows = __QLIST.map(q => [q, q.st(S)]).filter(([, s]) => s)
      .sort((a, b) => (a[1][0] === "on" ? 0 : 1) - (b[1][0] === "on" ? 0 : 1));
    const nOn = rows.filter(r => r[1][0] !== "done").length, nDone = rows.length - nOn;
    // página da esquerda
    const lx = x0 + 16, lw = W / 2 - 30;
    add(ui.add.nineslice(x0 + W / 4, y0 + 18, "bk-banner_title", undefined, 150, 17, 11, 11, 4, 6));
    add(ui.add.text(x0 + W / 4, y0 + 17, __L3("DIÁRIO DE MISSÕES", "QUEST LOG", "DIARIO DE MISIONES"), { fontFamily: PX, fontSize: "9px", color: "#fbe9c6" }).setOrigin(.5));
    const sel = add(ui.add.nineslice(0, 0, "bk-list_row_selected", undefined, lw, 20, 3, 3, 3, 3).setOrigin(0, .5).setVisible(!1));
    const RH = 22, ry0 = y0 + 46, maxRows = Math.floor((H - 110) / RH);
    const items = rows.slice(0, maxRows).map(([q, [state]], k) => {
      const y = ry0 + k * RH, done = state === "done";
      add(ui.add.image(lx + 10, y, done ? "bk-checkbox_on" : "bk-checkbox_off"));
      const t = add(ui.add.text(lx + 22, y, q.title, { fontFamily: PX, fontSize: "10px", color: done ? "#8a7356" : "#3b2416" }).setOrigin(0, .5));
      const line = ui.add.graphics();
      line.__noPaper = 1;
      line.fillStyle(0x9a7a52, .45);
      for (let x = lx; x < lx + lw; x += 4) line.fillRect(x, y + 10, 2, 1);
      R.add(line);
      const z = add(ui.add.zone(lx, y - 10, lw, 20).setOrigin(0).setInteractive({ useHandCursor: !0 }));
      z.on("pointerdown", () => pick(k));
      return { y, t };
    });
    if (!rows.length)
      add(ui.add.text(lx + lw / 2, ry0 + 20, __L3("Nenhuma missão ainda.\nExplore e converse com quem encontrar.", "No quests yet.\nExplore and talk to whoever you meet.", "Sin misiones aún."), { fontFamily: SER, fontSize: "10px", color: "#6b4a2e", align: "center" }).setOrigin(.5, 0));
    add(ui.add.text(lx + 4, y0 + H - 46, __L3(`Ativas: ${nOn}    Concluídas: ${nDone}`, `Active: ${nOn}    Done: ${nDone}`, `Activas: ${nOn}    Hechas: ${nDone}`), { fontFamily: PX, fontSize: "9px", color: "#5a3a22" }));
    add(ui.add.nineslice(lx, y0 + H - 28, "bk-bar_frame", undefined, lw, 10, 3, 3, 3, 3).setOrigin(0, .5));
    rows.length && nDone && add(ui.add.nineslice(lx + 4, y0 + H - 28, "bk-bar_fill_gold", undefined, Math.max(6, (lw - 8) * nDone / rows.length), 6, 2, 2, 2, 2).setOrigin(0, .5));
    // página da direita
    const rx = sp + 16, rw = W / 2 - 32;
    const tT = add(ui.add.text(rx, y0 + 20, "", { fontFamily: PX, fontSize: "15px", color: "#3b2416", wordWrap: { width: rw } }));
    const tS = add(ui.add.text(rx, y0 + 42, "", { fontFamily: PX, fontSize: "9px", color: "#a32418" }));
    const dv = add(ui.add.image(rx + rw / 2, y0 + 64, "bk-divider").setScale(2, 1));
    const box = add(ui.add.nineslice(rx, y0 + 76, "bk-panel_inset", undefined, rw, 120, 2, 2, 2, 2).setOrigin(0));
    const tD = add(ui.add.text(rx + 10, y0 + 86, "", { fontFamily: SER, fontSize: "11px", color: "#3b2416", lineSpacing: 5, wordWrap: { width: rw - 20 } }));
    const seal = add(ui.add.image(rx + rw - 14, y0 + 212, "bk-wax_seal").setScale(2).setVisible(!1));
    add(ui.add.text(sp + W / 4, y0 + H - 22, __L3("↑↓ escolher  ·  [L] / B ou toque fora para fechar", "↑↓ choose  ·  [L] / B or tap outside to close", "↑↓ elegir  ·  [L] / B o toca fuera para cerrar"), { fontFamily: PX, fontSize: "8px", color: "#8a7356" }).setOrigin(.5));
    let cur = -1;
    const pick = (k, flip) => {
      if (!items.length || k === cur) return;
      k = (k + items.length) % items.length;
      if (flip && cur >= 0) __bkFlip(ui, R, k > cur);
      cur = k;
      const [q, [state, txt]] = rows[k], done = state === "done";
      sel.setVisible(!0).setPosition(lx - 4, items[k].y);
      tT.setText(q.title);
      tS.setText(done ? __L3("CONCLUÍDA", "COMPLETED", "COMPLETADA") : __L3("EM ANDAMENTO", "IN PROGRESS", "EN CURSO")).setColor(done ? "#3d6b2a" : "#a32418");
      tS.setY(tT.y + tT.height + 4);
      dv.setY(tS.y + 18);
      box.setY(dv.y + 10);
      tD.setText(txt).setY(box.y + 10);
      box.setSize(rw, Math.max(60, tD.height + 22));
      seal.setVisible(done).setY(box.y + box.height + 16);
    };
    items.length ? pick(0) : (dv.setVisible(!1), box.setVisible(!1));
    __bkOpenAnim(ui, R);
    const was = !!S.uiOpen;
    S.uiOpen = !0;
    try { S.physics?.pause?.(); } catch (e) {}
    const close = () => {
      if (!ui.__qDia) return;
      R.destroy(); ui.__qDia = null;
      window.removeEventListener("keydown", kd);
      S.uiOpen = was;
      try { was || S.physics?.resume?.(); } catch (e) {}
      S.__uiClosedAt = performance.now();
    };
    const kd = e => {
      const k = e.key;
      if (k === "l" || k === "L" || k === "Escape") close();
      else if (k === "ArrowDown" || k === "s" || k === "S") pick(cur + 1, 1);
      else if (k === "ArrowUp" || k === "w" || k === "W") pick(cur - 1, 1);
    };
    setTimeout(() => window.addEventListener("keydown", kd), 50);
    dim.on("pointerdown", close);
  };
}

/* escolha de habilidade ao subir de nível: cada carta vira uma folha de papel com moldura */
{
  const d0 = __SPPanel.prototype.draw;
  __SPPanel.prototype.draw = function () {
    d0.apply(this, arguments);
    const U = this.U;
    if (!__bkOk(U) || !this.cards) return;
    for (const c of this.cards) {
      const p = U.add.image(0, 0, __bkTex(U, c.__w, 240, !0));
      p.__noPaper = 1;
      c.addAt(p, 0);
      __bkPaperize(U, c, c);
    }
    this.select?.(this.sel ?? 0);
  };
}

/* cenas inteiras (relíquias…): o livro entra logo acima do fundo escurecido e a cena toda vai para o papel */
function __bkScene(S, x, y, w, h, single) {
  if (!__bkOk(S)) return null;
  const pad = single ? 6 : 8, key = __bkTex(S, w + pad * 2, h + pad * 2, single);
  const img = S.add.image(x - pad, y - pad, key).setOrigin(0);
  img.__noPaper = 1;
  try { S.children.moveTo(img, 1); } catch (e) {}
  const root = { type: "Container", active: !0, visible: !0, get list() { return S.children.list; } };
  root.__bk = { x: x - pad, y: y - pad, w: w + pad * 2, h: h + pad * 2, single, img };
  __bkTrack(S, root);
  __bkPaperize(S, root, root);
  return root;
}
{
  const c0 = __CollectiblesScene.prototype.create;
  __CollectiblesScene.prototype.create = function () {
    c0.apply(this, arguments);
    if (!__bkOk(this)) return;
    const pw = 580, ph = 320, px = this.cx - pw / 2, py = this.cy - ph / 2;
    this.panelG?.clear();
    this.detailsX += 14; this.detailsW -= 14;
    try { this.renderDetails(); } catch (e) {}
    __bkScene(this, px, py, pw, ph, !1);
  };
}

/* configurações: uma página grande de papel no lugar da tela escura (a lista atravessa a tela toda) */
{
  const b0 = Vn.prototype.build;
  Vn.prototype.build = function () {
    b0.apply(this, arguments);
    const S = this.scene, R = this.root;
    if (!__bkOk(S) || !R) return;
    const P = R.list[1];
    P?.clear?.();
    this.__hdr?.setVisible(!1);
    const x = 8, y = 2, w = _ - 16, h = st - 4;
    const img = S.add.image(x, y, __bkTex(S, w, h, !0)).setOrigin(0);
    img.__noPaper = 1;
    R.addAt(img, 1);
    R.__bk = { x, y, w, h, single: !0, img };
    __bkTrack(S, R);
  };
}
/* Hall da Fama (arquivo à parte, assets/hall-of-fame-ui.js): carrega depois do jogo, então o ajuste espera por ele */
(function hof() {
  const H = window.HallOfFameUI;
  if (!H) { setTimeout(hof, 400); return; }
  if (H.prototype.__bk) return;
  H.prototype.__bk = 1;
  const b0 = H.prototype.build;
  H.prototype.build = function () {
    const was = this.built;
    b0.apply(this, arguments);
    if (was || !__bkOk(this.ui)) return;
    const S = this.ui, R = this.root, x = 24, y = 10, w = 592, h = 340;
    const img = S.add.image(x, y, __bkTex(S, w, h, !0)).setOrigin(0);
    img.__noPaper = 1;
    R.addAt(img, 1);
    R.__bk = { x, y, w, h, single: !0, img };
    __bkTrack(S, R);
  };
})();
