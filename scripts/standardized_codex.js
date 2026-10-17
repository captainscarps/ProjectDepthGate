class __CodexScene extends j.Scene {
  constructor() { super("CodexBook") }
  init(d) {
    this.from = d?.from ?? null;
    this.__closing = !1;
    this.busy = !1;
    this.spread = 0;
  }
  create() {
    le(this);
    this.cx = Math.round(_ / 2);
    this.totalBiomes = __CODEX_BIOMES.length;
    this.totalHeroes = __CODEX_HEROES.length;
    this.totalLegends = __CODEX_LEGENDS.length;
    
    this.BIOMES_START = 2;
    this.HEROES_START = 2 + this.totalBiomes;
    this.LEGENDS_START = this.HEROES_START + this.totalHeroes;
    this.nSpreads = this.LEGENDS_START + this.totalLegends;

    // Fundo escurecido total solido com protecao widescreen (sem vazamento do menu principal)
    this.add.rectangle(this.cx, st / 2, Math.max(_, 2600), st * 2, 0x000000, 1.0).setInteractive();

    // Livro (capa, paginas, fitas) padronizado exatamente igual ao Bestiario
    this.bookG = this.add.graphics();
    this.drawBook();

    // Containers para as duas paginas
    this.L = this.add.container(0, 0);
    this.R = this.add.container(0, 0);
    this.fx = this.add.graphics();

    this.drawChrome();
    this.render();

    // Som de abertura
    this.game.audioEngine?.sfx("sfx-ui-open");

    // Atalhos de teclado
    this.__kd = ev => {
      if (!this.sys.isActive() || this.busy) return;
      if (["ArrowRight", "d", "D", "PageDown"].includes(ev.key)) { ev.preventDefault(); ev.stopPropagation(); this.go(this.spread + 1); }
      else if (["ArrowLeft", "a", "A", "PageUp"].includes(ev.key)) { ev.preventDefault(); ev.stopPropagation(); this.go(this.spread - 1); }
      else if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); this.close(); }
      else if (ev.key === "Home") { ev.preventDefault(); ev.stopPropagation(); this.go(0); }
      else if (ev.key === "End") { ev.preventDefault(); ev.stopPropagation(); this.go(this.nSpreads - 1); }
    };
    window.addEventListener("keydown", this.__kd);
    this.events.once("shutdown", () => window.removeEventListener("keydown", this.__kd));

    // Roda do mouse
    this.input.on("wheel", (p, g, dx, dy) => {
      Math.abs(dy) > 4 && this.go(this.spread + (dy > 0 ? 1 : -1));
    });

    // Touch Swipe realista para virar paginas
    let tStartX = 0, tStartY = 0, touching = false;
    this.input.on("pointerdown", p => {
      tStartX = p.x; tStartY = p.y; touching = true;
    });
    this.input.on("pointerup", p => {
      if (!touching) return;
      touching = false;
      const dx = p.x - tStartX, dy = p.y - tStartY;
      if (Math.abs(dx) > 38 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        if (dx < 0) this.go(this.spread + 1);
        else this.go(this.spread - 1);
      }
    });
  }

  // Helpers de layout e tipografia padronizados
  orn(c, x, y, w = 70) {
    const g = this.add.graphics();
    g.lineStyle(1, 7999252, .9).lineBetween(x - w, y, x - 7, y).lineBetween(x + 7, y, x + w, y);
    g.fillStyle(7999252, 1).fillTriangle(x - 4, y, x, y - 4, x + 4, y).fillTriangle(x - 4, y, x, y + 4, x + 4, y);
    g.fillStyle(7999252, 1).fillCircle(x - w - 2, y, 1.6).fillCircle(x + w + 2, y, 1.6);
    c.add(g);
  }

  T(c, x, y, s, size = 9, color = __BK_INK, o = {}) {
    const t = this.add.text(x, y, s, {
      fontFamily: __BK_SERIF,
      fontSize: size + "px",
      color,
      lineSpacing: o.ls ?? 2,
      fontStyle: o.st ?? "normal",
      align: o.al ?? "left",
      wordWrap: o.ww ? { width: o.ww } : void 0
    });
    o.ox != null && t.setOrigin(o.ox, o.oy ?? 0);
    c.add(t);
    return t;
  }

  rule(c, x0, x1, y, col = 9070138, a = .8) {
    const g = this.add.graphics();
    g.lineStyle(1, col, a).lineBetween(x0, y, x1, y);
    c.add(g);
  }

  drawBook() {
    const g = this.bookG, cx = this.cx, X0 = cx - 306, Y0 = 10, W = 612, H = 340;
    g.fillStyle(0, .5).fillRoundedRect(X0 + 7, Y0 + 9, W, H, 14);
    g.fillStyle(3809810, 1).fillRoundedRect(X0, Y0, W, H, 12);
    g.fillStyle(4862490, .5).fillRoundedRect(X0 + 3, Y0 + 3, W - 6, H / 2, 10);
    g.lineStyle(2, 2233098, 1).strokeRoundedRect(X0, Y0, W, H, 12);
    g.lineStyle(1, 9070138, .75).strokeRoundedRect(X0 + 5, Y0 + 5, W - 10, H - 10, 9);
    g.fillStyle(11568208, .5);
    for (let x = X0 + 16; x < X0 + W - 16; x += 7) g.fillRect(x, Y0 + 9, 4, 1), g.fillRect(x, Y0 + H - 10, 4, 1);
    for (let y = Y0 + 16; y < Y0 + H - 16; y += 7) g.fillRect(X0 + 9, y, 1, 4), g.fillRect(X0 + W - 10, y, 1, 4);
    for (const [x, y, sx, sy] of [[X0, Y0, 1, 1], [X0 + W, Y0, -1, 1], [X0, Y0 + H, 1, -1], [X0 + W, Y0 + H, -1, -1]]) {
      g.fillStyle(13214282, 1).fillTriangle(x, y, x + 20 * sx, y, x, y + 20 * sy);
      g.fillStyle(8018468, 1).fillTriangle(x + 3 * sx, y + 3 * sy, x + 12 * sx, y + 3 * sy, x + 3 * sx, y + 12 * sy);
    }
    const P = this.P = { l: cx - 292, r: cx + 292, t: 21, b: 337 };
    for (let i = 5; i >= 1; i--) g.fillStyle(i % 2 ? 13351055 : 14272415, 1).fillRoundedRect(P.l - i, P.t + i * .5, (P.r - P.l) + 2 * i, (P.b - P.t) + i, 3);
    g.fillStyle(15391926, 1).fillRect(P.l, P.t, cx - 1 - P.l, P.b - P.t).fillRect(cx + 1, P.t, P.r - cx - 1, P.b - P.t);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 90; i++) {
      const rx = P.l + 4 + rnd() * (P.r - P.l - 8), ry = P.t + 4 + rnd() * (P.b - P.t - 8);
      g.fillStyle(14469798, .4).fillCircle(rx, ry, .6 + rnd() * 1.2);
    }
    g.fillStyle(13416578, .7).fillRect(P.l, P.t, 3, P.b - P.t).fillRect(P.r - 3, P.t, 3, P.b - P.t);
    g.fillStyle(12692080, .5).fillRect(P.l, P.t, (P.r - P.l), 2).fillRect(P.l, P.b - 2, (P.r - P.l), 2);
    g.fillStyle(0, .28).fillRect(cx - 7, P.t, 14, P.b - P.t);
    g.fillStyle(0, .45).fillRect(cx - 2, P.t, 4, P.b - P.t);
    g.fillStyle(11508354, 1).fillRect(cx - .5, P.t, 1, P.b - P.t);
    g.lineStyle(1, 13745284, .6).strokeRect(P.l + 7, P.t + 7, cx - P.l - 14, P.b - P.t - 14).strokeRect(cx + 7, P.t + 7, P.r - cx - 14, P.b - P.t - 14);
  }

  drawChrome() {
    const cx = this.cx, X1 = cx + 306;
    
    // Abas de navegacao no topo perfeitamente proporcionadas para a moldura
    const tabDefs = [
      [typeof __L3 === "function" ? __L3("ÍNDICE", "INDEX", "ÍNDICE") : "ÍNDICE", 0x8a6230, () => this.go(1)],
      [typeof __L3 === "function" ? __L3("BIOMAS", "BIOMES", "BIOMAS") : "BIOMAS", 0x3d7055, () => this.go(this.BIOMES_START)],
      [typeof __L3 === "function" ? __L3("HERÓIS", "HEROES", "HÉROES") : "HERÓIS", 0x355a80, () => this.go(this.HEROES_START)],
      [typeof __L3 === "function" ? __L3("LENDAS", "LEGENDS", "LEYENDAS") : "LENDAS", 0x753a48, () => this.go(this.LEGENDS_START)]
    ];

    this.tabG = this.add.graphics();
    const tabW = 125, tabH = 18, startX = cx - (tabDefs.length * tabW) / 2;
    this.tabs = tabDefs.map(([label, col, act], idx) => {
      const tx = startX + idx * tabW;
      const t = this.add.text(tx + tabW / 2, 9, label, {
        fontFamily: __BK_SERIF, fontSize: "9px", fontStyle: "bold", color: "#f3e6c4"
      }).setOrigin(0.5);
      const z = this.add.zone(tx + 4, 2, tabW - 8, tabH + 4).setOrigin(0).setInteractive({ useHandCursor: true });
      z.on("pointerdown", act);
      z.on("pointerover", () => t.setColor("#ffd24a"));
      z.on("pointerout", () => this.updateTabColors());
      typeof Gt === "function" && Gt(z, 10, 8);
      return { tx, tabW, tabH, col, t, z };
    });

    // Botao fechar padronizado igual ao Bestiario
    const close = this.add.text(X1 - 4, 12, "✕", {
      fontFamily: __BK_SERIF, fontStyle: "bold", fontSize: "16px", color: "#f3e6c4", backgroundColor: "#5a1a12", padding: { x: 12, y: 8 }
    }).setOrigin(.5).setInteractive({ useHandCursor: !0 });
    typeof Gt === "function" && Gt(close, 22, 18);
    close.on("pointerdown", () => this.close());
    close.on("pointerover", () => close.setColor("#ffd24a"));
    close.on("pointerout", () => close.setColor("#f3e6c4"));

    // Setas elegantes de navegacao nas bordas externas das paginas (identico ao Bestiario)
    const mk = (x, s, d) => {
      const t = this.add.text(x, 326, s, {
        fontFamily: __BK_SERIF, fontStyle: "bold", fontSize: "18px", color: __BK_RED, padding: { x: 12, y: 8 }
      }).setOrigin(.5).setInteractive({ useHandCursor: !0 });
      typeof Gt === "function" && Gt(t, 22, 18);
      t.on("pointerdown", () => this.go(this.spread + d));
      t.on("pointerover", () => t.setColor("#b0402a"));
      t.on("pointerout", () => t.setColor(__BK_RED));
      return t;
    };
    this.prevB = mk(cx - 276, "◀", -1);
    this.nextB = mk(cx + 276, "▶", 1);

    // Barra de atalhos e dicas na borda inferior de couro
    this.hint = this.add.text(cx, 352, "", {
      fontFamily: "'Courier New', monospace", fontStyle: "bold", fontSize: "8px", color: "#b8a888"
    }).setOrigin(.5, 1);
  }

  drawTabs() {
    const g = this.tabG, s = this.spread;
    g.clear();
    const cur = s <= 1 ? 0 : (s < this.HEROES_START ? 1 : (s < this.LEGENDS_START ? 2 : 3));
    this.tabs.forEach((tb, i) => {
      const active = i === cur;
      g.fillStyle(active ? tb.col : 0x22150e, active ? 1 : 0.75).fillRoundedRect(tb.tx + 4, active ? 1 : 3, tb.tabW - 8, tb.tabH, { tl: 5, tr: 5, bl: 0, br: 0 });
      g.lineStyle(1, active ? 0xecd79b : 0x6a4a2a, active ? 0.9 : 0.5).strokeRoundedRect(tb.tx + 4, active ? 1 : 3, tb.tabW - 8, tb.tabH, { tl: 5, tr: 5, bl: 0, br: 0 });
    });
    this.updateTabColors();
  }

  updateTabColors() {
    const s = this.spread;
    const cur = s <= 1 ? 0 : (s < this.HEROES_START ? 1 : (s < this.LEGENDS_START ? 2 : 3));
    this.tabs.forEach((tb, i) => {
      tb.t.setColor(i === cur ? "#ffd24a" : "#c4b694");
    });
  }

  go(n) {
    if (this.busy) return;
    const target = Phaser.Math.Clamp(n, 0, this.nSpreads - 1);
    if (target === this.spread) return;
    const dir = target > this.spread ? 1 : -1;
    this.spread = target;
    this.flip(dir);
  }

  flip(dir) {
    this.busy = true;
    this.game.audioEngine?.sfx("page-turn");

    const cx = this.cx, py = this.P.t, ph = this.P.b - this.P.t;
    const w = 270;
    const fx = this.fx;

    const startAng = dir > 0 ? 0 : Math.PI;
    const endAng = dir > 0 ? Math.PI : 0;

    let progress = 0;
    const tw = this.tweens.addCounter({
      from: 0, to: 1, duration: 240, ease: "Sine.easeInOut",
      onUpdate: () => {
        progress = tw.getValue();
        const ang = Phaser.Math.Linear(startAng, endAng, progress);
        const cos = Math.cos(ang);
        fx.clear();
        fx.fillStyle(0x0e0804, 0.3 * Math.sin(ang));
        if (dir > 0) fx.fillRect(cx - w, py, w, ph);
        else fx.fillRect(cx, py, w, ph);

        const curW = w * Math.abs(cos);
        const xEdge = cos >= 0 ? cx + curW : cx - curW;
        fx.fillStyle(0xf3e5c8, 0.98);
        fx.lineStyle(1.5, 0x8a6230, 0.7);
        if (cos >= 0) {
          fx.fillRoundedRect(cx, py, curW, ph, 4);
          fx.strokeRoundedRect(cx, py, curW, ph, 4);
          fx.fillStyle(0xecd79b, 0.35 * (1 - Math.abs(cos)));
          fx.fillRect(xEdge - 15, py, 15, ph);
        } else {
          fx.fillRoundedRect(cx - curW, py, curW, ph, 4);
          fx.strokeRoundedRect(cx - curW, py, curW, ph, 4);
          fx.fillStyle(0x0e0804, 0.25 * (1 - Math.abs(cos)));
          fx.fillRect(xEdge, py, 15, ph);
        }
      },
      onComplete: () => {
        fx.clear();
        this.busy = false;
        this.render();
      }
    });

    this.render();
  }

  render() {
    for (const c of [this.L, this.R]) { c.removeAll(!0); c.setAlpha(1); }

    const cx = this.cx, LX = cx - 276, RX = cx + 20, PW = 256, s = this.spread;

    // Numeracao de paginas padronizada identica ao Bestiario
    const pn = (c, x, n) => this.T(c, x + PW / 2, 319, `— ${n} —`, 8, __BK_FAINT, { ox: .5 });
    pn(this.L, LX, 2 * s + 1);
    pn(this.R, RX, 2 * s + 2);

    // Cabecalho superior decorativo (posicionado em y=20 com folga total para o titulo em y=40)
    const run = (c, x, str) => this.T(c, x + PW / 2, 20, str.toUpperCase(), 6.5, __BK_FAINT, { ox: .5, st: "bold" });

    if (s === 0) {
      this.renderCover(LX, RX, PW);
    } else if (s === 1) {
      // No Indice, as secoes tem seus proprios titulos proeminentes em y=38 (sem redundancia)
      this.renderIndex(LX, RX, PW);
    } else if (s >= this.BIOMES_START && s < this.HEROES_START) {
      run(this.L, LX, "BIOMAS & MAPAS");
      run(this.R, RX, "CRÔNICAS & SEGREDOS");
      this.renderBiomePage(s - this.BIOMES_START, LX, RX, PW);
    } else if (s >= this.HEROES_START && s < this.LEGENDS_START) {
      run(this.L, LX, "HERÓIS DE OUTRAS ERAS");
      run(this.R, RX, "BIOGRAFIA & HABILIDADES");
      this.renderHeroPage(s - this.HEROES_START, LX, RX, PW);
    } else {
      run(this.L, LX, "LENDAS DO ABISMO");
      run(this.R, RX, "REGISTROS ANCESTRAIS");
      this.renderLegendPage(s - this.LEGENDS_START, LX, RX, PW);
    }

    this.prevB.setVisible(s > 0);
    this.nextB.setVisible(s < this.nSpreads - 1);
    this.drawTabs();

    const pad = typeof __usingPad === "function" && __usingPad();
    this.hint.setText(pad
      ? `✥ PÁGINAS    A ABRIR    B FECHAR    Y ÍNDICE    X BIOMAS`
      : __isTouch()
        ? "TOQUE NAS SETAS ◀ ▶ PARA VIRAR PÁGINAS  ·  ✕ FECHAR"
        : "← → VIRAR PÁGINAS    ↑ ↓ ENTER ÍNDICE    ESC FECHAR");
  }

  // --- Capa do Códice com layout limpo e sem sobreposicao ---
  renderCover(LX, RX, PW) {
    const L = this.L, R = this.R, mx = LX + PW / 2, rx = RX + PW / 2;
    
    // Pagina Esquerda: Frontispicio ornamentado
    this.orn(L, mx, 65, 75);
    this.T(L, mx, 88, "O CÓDICE", 24, __BK_RED, { ox: .5, st: "bold" });
    this.T(L, mx, 116, "das Profundezas", 13, __BK_INK, { ox: .5, st: "italic" });
    this.orn(L, mx, 140, 75);
    
    this.T(L, mx, 162, "Crônicas dos Mundos, Biomas\n& Campeões Convocados", 10.5, __BK_INK, {
      ox: .5, st: "italic", al: "center", lineSpacing: 4, ww: 218
    });

    this.T(L, mx, 226, "Compilado pela Ordem das Sentinelas\npara os que atravessam os portais.", 8.5, __BK_FAINT, {
      ox: .5, al: "center", lineSpacing: 3, ww: 210
    });
    this.T(L, mx, 282, "— Tomo dos Antigos —", 8, __BK_FAINT, { ox: .5, st: "italic" });

    // Pagina Direita: Prefacio da Guardiana com espacamento gracioso
    this.T(R, rx, 48, "PREFÁCIO DA GUARDIÃ", 13.5, __BK_RED, { ox: .5, st: "bold" });
    this.orn(R, rx, 66, 60);

    const pref = "“Durante séculos, os mapas de nossas terras foram redesenhados pelas fendas dimensionais. Este tomo reúne os registros topográficos de cada região alcançada pelos portais, bem como o relato detalhado de cada herói trazido de eras remotas.\n\nNinguém atravessa por acaso. Que este compêndio ilumine seus passos nas trevas.”";
    this.T(R, RX + 14, 82, pref, 9.5, __BK_INK, {
      st: "italic", ls: 3.5, ww: PW - 28
    });

    this.T(R, rx, 206, "— A Guardiã dos Portais —", 8.5, __BK_FAINT, { ox: .5, st: "italic" });

    // Botao de acao destacado para abrir o sumario
    const btnBox = this.add.graphics();
    btnBox.fillStyle(0x3a1810, 0.9).fillRoundedRect(rx - 95, 234, 190, 26, 6);
    btnBox.lineStyle(1.5, 0xc9a24a, 0.85).strokeRoundedRect(rx - 95, 234, 190, 26, 6);
    R.add(btnBox);

    const bTxt = this.T(R, rx, 247, "[ ABRIR ÍNDICE DO CÓDICE ▶ ]", 9.5, "#ffd24a", { ox: .5, oy: .5, st: "bold" });
    const bZone = this.add.zone(rx, 247, 190, 26).setInteractive({ useHandCursor: true });
    bZone.on("pointerdown", () => {
      this.game.audioEngine?.sfx("sfx-ui-tab");
      this.go(1);
    });
    bZone.on("pointerover", () => {
      btnBox.clear();
      btnBox.fillStyle(0x5a2418, 1).fillRoundedRect(rx - 95, 234, 190, 26, 6);
      btnBox.lineStyle(2, 0xffd24a, 1).strokeRoundedRect(rx - 95, 234, 190, 26, 6);
      bTxt.setColor("#ffffff");
    });
    bZone.on("pointerout", () => {
      btnBox.clear();
      btnBox.fillStyle(0x3a1810, 0.9).fillRoundedRect(rx - 95, 234, 190, 26, 6);
      btnBox.lineStyle(1.5, 0xc9a24a, 0.85).strokeRoundedRect(rx - 95, 234, 190, 26, 6);
      bTxt.setColor("#ffd24a");
    });
    typeof Gt === "function" && Gt(bZone, 16, 12);
    R.add(bZone);

    this.T(R, rx, 280, "Toque nas setas ou use ← → para folhear", 7.5, __BK_FAINT, { ox: .5, st: "italic" });
  }

  renderIndex(LX, RX, PW) {
    const L = this.L, R = this.R;
    this.indexEntries = [];
    this.indexG = this.add.graphics();
    L.add(this.indexG);

    // Coluna Esquerda: Biomas (com espacamento perfeito e linhas-guia)
    L.add(this.add.text(LX + PW / 2, 38, "❖ SEÇÃO I: BIOMAS & MAPAS ❖", {
      fontFamily: "Georgia, serif", fontSize: "10px", fontStyle: "bold", color: "#2b190c"
    }).setOrigin(0.5));

    __CODEX_BIOMES.forEach((b, i) => {
      const y = 56 + i * 20;
      const numStr = (i < 9 ? "0" + (i + 1) : (i + 1));
      const t = this.add.text(LX + 12, y, `${numStr}. ${b.name}`, {
        fontFamily: "Georgia, serif", fontSize: "8.5px", fontStyle: "bold", color: "#3a2614"
      }).setInteractive({ useHandCursor: true });
      
      const pg = this.add.text(LX + PW - 10, y, `Pág ${2 * (this.BIOMES_START + i) + 1}`, {
        fontFamily: "'Courier New', monospace", fontSize: "8px", color: "#7a6540"
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

      const act = () => this.go(this.BIOMES_START + i);
      this.indexEntries.push({ x: LX + 8, y: y - 1, w: PW - 16, h: 18, spread: this.BIOMES_START + i });
      t.on("pointerdown", act); pg.on("pointerdown", act);
      t.on("pointerover", () => t.setColor("#a03520")); t.on("pointerout", () => t.setColor("#3a2614"));
      L.add([t, pg]);
    });

    // Coluna Direita: Herois Convocados
    R.add(this.add.text(RX + PW / 2, 38, "❖ SEÇÃO II: HERÓIS CONVOCADOS ❖", {
      fontFamily: "Georgia, serif", fontSize: "10px", fontStyle: "bold", color: "#2b190c"
    }).setOrigin(0.5));

    __CODEX_HEROES.forEach((h, i) => {
      const y = 56 + i * 16.5;
      const shortSub = h.subtitle.split('&')[0].trim();
      const heroLabel = `• ${h.name} — ${shortSub.length > 15 ? shortSub.slice(0, 14) + '…' : shortSub}`;
      const t = this.add.text(RX + 12, y, heroLabel, {
        fontFamily: "Georgia, serif", fontSize: "8px", fontStyle: "bold", color: "#243a50"
      }).setInteractive({ useHandCursor: true });
      
      const pg = this.add.text(RX + PW - 10, y, `Pág ${2 * (this.HEROES_START + i) + 1}`, {
        fontFamily: "'Courier New', monospace", fontSize: "8px", color: "#6a7580"
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

      const act = () => this.go(this.HEROES_START + i);
      this.indexEntries.push({ x: RX + 8, y: y - 1, w: PW - 16, h: 16, spread: this.HEROES_START + i });
      t.on("pointerdown", act); pg.on("pointerdown", act);
      t.on("pointerover", () => t.setColor("#a03520")); t.on("pointerout", () => t.setColor("#243a50"));
      R.add([t, pg]);
    });

    // Divisor para Lendas
    R.add(this.add.text(RX + PW / 2, 214, "❖ SEÇÃO III: LENDAS DO ABISMO ❖", {
      fontFamily: "Georgia, serif", fontSize: "10px", fontStyle: "bold", color: "#6a2030"
    }).setOrigin(0.5));

    const legendNames = ["• Lorde Valdrak (O Rei)", "• A Guardiã dos Portais"];
    __CODEX_LEGENDS.forEach((leg, i) => {
      const y = 232 + i * 19;
      const t = this.add.text(RX + 12, y, legendNames[i] || `• ${leg.name}`, {
        fontFamily: "Georgia, serif", fontSize: "8.5px", fontStyle: "bold", color: "#501824"
      }).setInteractive({ useHandCursor: true });

      const pg = this.add.text(RX + PW - 10, y, `Pág ${2 * (this.LEGENDS_START + i) + 1}`, {
        fontFamily: "'Courier New', monospace", fontSize: "8px", color: "#8a5060"
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

      const act = () => this.go(this.LEGENDS_START + i);
      this.indexEntries.push({ x: RX + 8, y: y - 1, w: PW - 16, h: 17, spread: this.LEGENDS_START + i });
      t.on("pointerdown", act); pg.on("pointerdown", act);
      t.on("pointerover", () => t.setColor("#a03520")); t.on("pointerout", () => t.setColor("#501824"));
      R.add([t, pg]);
    });
  }

  renderBiomePage(idx, LX, RX, PW) {
    const b = __CODEX_BIOMES[idx];
    if (!b) return;
    const L = this.L, R = this.R;

    // === PÁGINA ESQUERDA: MAPA DO NÍVEL & TOPOGRAFIA OFICIAL ===
    L.add(this.add.text(LX + 10, 40, b.name.toUpperCase(), {
      fontFamily: "Georgia, serif", fontSize: "12.5px", fontStyle: "bold", color: "#2b190c"
    }));

    L.add(this.add.text(LX + 10, 54, `Topografia • ${b.title}`, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "8.5px", color: "#7a5c36"
    }));

    // Canvas do Mapa Topográfico
    const mapX = LX + 8, mapY = 68, mapW = PW - 16, mapH = 114;
    const mapG = this.add.graphics();
    mapG.fillStyle(0x130e09, 0.95).fillRoundedRect(mapX, mapY, mapW, mapH, 5);
    mapG.lineStyle(1.5, 0x8a6230, 0.85).strokeRoundedRect(mapX, mapY, mapW, mapH, 5);
    L.add(mapG);

    // IMAGEM DO MAPA
    const mapKey = `codex-map-${b.id}`;
    if (this.textures.exists(mapKey)) {
      const mapImg = this.add.image(mapX + mapW / 2, mapY + mapH / 2, mapKey);
      mapImg.setDisplaySize(mapW - 6, mapH - 6);
      L.add(mapImg);

      const vig = this.add.graphics();
      vig.lineStyle(2, 0x160f0a, 0.65).strokeRoundedRect(mapX + 2, mapY + 2, mapW - 4, mapH - 4, 4);
      vig.lineStyle(1, 0xc9a24a, 0.75).strokeRoundedRect(mapX + 1, mapY + 1, mapW - 2, mapH - 2, 5);
      L.add(vig);
    }

    // Cantoneiras douradas decorativas da moldura
    const cSize = 6;
    const fg = this.add.graphics();
    fg.lineStyle(1.5, 0xc9a24a, 0.9);
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + 3, mapY + 3, mapX + 3 + cSize, mapY + 3));
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + 3, mapY + 3, mapX + 3, mapY + 3 + cSize));
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + mapW - 3, mapY + 3, mapX + mapW - 3 - cSize, mapY + 3));
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + mapW - 3, mapY + 3, mapX + mapW - 3, mapY + 3 + cSize));
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + 3, mapY + mapH - 3, mapX + 3 + cSize, mapY + mapH - 3));
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + 3, mapY + mapH - 3, mapX + 3, mapY + mapH - 3 - cSize));
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + mapW - 3, mapY + mapH - 3, mapX + mapW - 3 - cSize, mapY + mapH - 3));
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + mapW - 3, mapY + mapH - 3, mapX + mapW - 3, mapY + mapH - 3 - cSize));

    // Rosa dos Ventos
    const roseX = mapX + mapW - 14, roseY = mapY + 14;
    fg.fillStyle(0x0a0705, 0.8).fillCircle(roseX, roseY, 10);
    fg.lineStyle(1, 0xc9a24a, 0.85).strokeCircle(roseX, roseY, 10);
    fg.lineStyle(1.5, 0xc9a24a, 1);
    fg.strokeLineShape(new Phaser.Geom.Line(roseX, roseY - 9, roseX, roseY + 9));
    fg.strokeLineShape(new Phaser.Geom.Line(roseX - 9, roseY, roseX + 9, roseY));
    fg.fillStyle(0xdf3824, 1).fillTriangle(roseX, roseY - 9, roseX - 2.5, roseY - 1, roseX + 2.5, roseY - 1);
    fg.fillStyle(0xecd79b, 0.8).fillTriangle(roseX, roseY + 9, roseX - 2, roseY + 1, roseX + 2, roseY + 1);
    L.add(this.add.text(roseX, roseY - 10, "N", { fontFamily: "'Courier New', monospace", fontSize: "7px", fontStyle: "bold", color: "#ecd79b" }).setOrigin(0.5, 1));

    // Barra de escala cartográfica
    fg.lineStyle(1, 0xc9a24a, 0.8);
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + 8, mapY + mapH - 7, mapX + 42, mapY + mapH - 7));
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + 8, mapY + mapH - 9, mapX + 8, mapY + mapH - 5));
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + 25, mapY + mapH - 8, mapX + 25, mapY + mapH - 6));
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + 42, mapY + mapH - 9, mapX + 42, mapY + mapH - 5));
    L.add(this.add.text(mapX + 25, mapY + mapH - 11, "50 braças", { fontFamily: "'Courier New', monospace", fontSize: "6.5px", color: "#b89e6e" }).setOrigin(0.5, 1));

    // Cartouche do mapa
    L.add(this.add.text(mapX + 8, mapY + 5, "VISTA TOPOGRÁFICA DO REINO", {
      fontFamily: "'Courier New', monospace", fontSize: "7px", fontStyle: "bold", color: "#ecd79b"
    }));
    L.add(fg);

    // Painel de Parâmetros Geográficos com layout vertical dinâmico (sem sobreposição)
    const legY = 188;
    const rows = [
      ["Grau de Perigo:", b.danger, "#a03020"],
      ["Atmosfera / Clima:", b.climate, "#4a3520"],
      ["Inimigos Típicos:", b.threat, "#3a2614"],
      ["Ameaça Suprema:", b.boss, "#8a2418"]
    ];

    let rowY = legY + 16;
    const hudTexts = [];
    rows.forEach(([k, v, c]) => {
      const lbl = this.add.text(LX + 14, rowY, k, {
        fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#7a6244"
      });
      const val = this.add.text(LX + 94, rowY, v, {
        fontFamily: "Georgia, serif", fontSize: "8px", color: c, wordWrap: { width: PW - 108 }, lineSpacing: 2
      });
      hudTexts.push(lbl, val);
      const rh = Math.max(lbl.height, val.height);
      rowY += rh + 4;
    });

    const hudBoxH = (rowY - legY) + 4;
    const hudBox = this.add.graphics();
    hudBox.fillStyle(0x130e09, 0.08).fillRoundedRect(LX + 8, legY, PW - 16, hudBoxH, 4);
    hudBox.lineStyle(1, 0x8a6230, 0.45).strokeRoundedRect(LX + 8, legY, PW - 16, hudBoxH, 4);
    L.add(hudBox);
    L.add(this.add.text(LX + 14, legY + 4, "DADOS CARTOGRÁFICOS & AMEAÇAS", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#8a5822"
    }));
    L.add(hudTexts);

    // === PÁGINA DIREITA: CRÔNICA, SEGREDOS E DICAS ===
    let curY = 40;
    R.add(this.add.text(RX + 10, curY, "CRÔNICA DA REGIÃO", {
      fontFamily: "Georgia, serif", fontSize: "11.5px", fontStyle: "bold", color: "#2b190c"
    }));

    curY += 15;
    const tChron = this.add.text(RX + 10, curY, b.chronicle, {
      fontFamily: "Georgia, serif", fontSize: "8px", lineSpacing: 2.2, color: "#3a2818", wordWrap: { width: PW - 20 }
    });
    R.add(tChron);

    curY += tChron.height + 7;
    const tSecH = this.add.text(RX + 10, curY, "❖ ARQUITETURA & SEGREDOS OCULTOS", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#8a5822"
    });
    R.add(tSecH);

    curY += tSecH.height + 2;
    const tSec = this.add.text(RX + 10, curY, b.secrets, {
      fontFamily: "Georgia, serif", fontSize: "8px", lineSpacing: 2.2, color: "#4a3520", wordWrap: { width: PW - 20 }
    });
    R.add(tSec);

    curY += tSec.height + 7;

    // Caixa de Conselho do Explorador calculada dinamicamente para o texto caber 100% dentro
    const boxY = curY;
    const tipTitle = this.add.text(RX + 14, boxY + 5, "CONSELHO DO EXPLORADOR:", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#8a5822"
    });
    const tipTxt = this.add.text(RX + 14, boxY + 17, b.tip, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "8px", lineSpacing: 2.2, color: "#3a2818", wordWrap: { width: PW - 28 }
    });
    const tipBoxH = 17 + tipTxt.height + 6;
    const tipBox = this.add.graphics();
    tipBox.fillStyle(0x130e09, 0.08).fillRoundedRect(RX + 8, boxY, PW - 16, tipBoxH, 4);
    tipBox.lineStyle(1, 0x8a6230, 0.5).strokeRoundedRect(RX + 8, boxY, PW - 16, tipBoxH, 4);
    R.add([tipBox, tipTitle, tipTxt]);
  }

  // --- Seção II: Páginas de Heróis ---
  renderHeroPage(idx, LX, RX, PW) {
    const h = __CODEX_HEROES[idx];
    if (!h) return;
    const L = this.L, R = this.R;

    // === PÁGINA ESQUERDA: ILUSTRAÇÃO DO HERÓI & DADOS ===
    L.add(this.add.text(LX + 10, 40, h.name.toUpperCase(), {
      fontFamily: "Georgia, serif", fontSize: "12.5px", fontStyle: "bold", color: "#1c2e42"
    }));

    L.add(this.add.text(LX + 10, 54, h.subtitle, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "8.5px", color: "#6a523a"
    }));

    // Moldura do Retrato / Sprite
    const fBox = this.add.graphics();
    const fx = LX + 8, fy = 68, fw = PW - 16, fh = 96;
    fBox.fillStyle(0x0e141c, 0.95).fillRoundedRect(fx, fy, fw, fh, 5);
    fBox.lineStyle(1.5, 0x4a78a0, 0.75).strokeRoundedRect(fx, fy, fw, fh, 5);
    L.add(fBox);

    // Sprite do Campeao animado oficial
    const sKey = h.spriteKey;
    if (this.textures.exists(sKey)) {
      const layout = this.cache?.json?.get?.(`${sKey}-layout`);
      const footY = (layout?.footY ?? 119) / 128;
      const sp = this.add.sprite(fx + fw / 2, fy + fh - 10, sKey, 0)
        .setScale(1.4 * (layout?.hires ?? 1))
        .setOrigin(0.5, footY);
      this.anims.exists(`${sKey}-idle`) && sp.play(`${sKey}-idle`);
      L.add(sp);
    } else {
      L.add(this.add.text(fx + fw / 2, fy + fh / 2, `[ ${h.name} ]`, {
        fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "bold", color: "#a8c0d8"
      }).setOrigin(0.5));
    }

    // Painel de Origem Cósmica
    const infoY = 170;
    const items = [
      ["Era de Origem:", h.era],
      ["Plano / Dimensão:", h.dimension],
      ["Papel Tático:", h.role],
      ["Arma & Estilo:", h.weapon]
    ];

    let itemY = infoY + 5;
    const infoTexts = [];
    items.forEach(([lbl, val]) => {
      const lTxt = this.add.text(LX + 14, itemY, lbl, {
        fontFamily: "'Courier New', monospace", fontSize: "7px", fontStyle: "bold", color: "#5a7288"
      });
      const vTxt = this.add.text(LX + 14, itemY + 9, val, {
        fontFamily: "Georgia, serif", fontSize: "8px", color: "#243648", wordWrap: { width: PW - 28 }, lineSpacing: 1.5
      });
      infoTexts.push(lTxt, vTxt);
      itemY += 9 + vTxt.height + 3;
    });

    const infoH = (itemY - infoY) + 3;
    const infoBox = this.add.graphics();
    infoBox.fillStyle(0x0e141c, 0.06).fillRoundedRect(LX + 8, infoY, PW - 16, infoH, 4);
    infoBox.lineStyle(1, 0x4a78a0, 0.4).strokeRoundedRect(LX + 8, infoY, PW - 16, infoH, 4);
    L.add(infoBox);
    L.add(infoTexts);

    // === PÁGINA DIREITA: BIOGRAFIA & HABILIDADES ===
    let curY = 40;
    R.add(this.add.text(RX + 10, curY, "BIOGRAFIA & CONVOCAÇÃO", {
      fontFamily: "Georgia, serif", fontSize: "11.5px", fontStyle: "bold", color: "#1c2e42"
    }));

    curY += 15;
    const tLore = this.add.text(RX + 10, curY, h.lore, {
      fontFamily: "Georgia, serif", fontSize: "8px", lineSpacing: 2.2, color: "#243648", wordWrap: { width: PW - 20 }
    });
    R.add(tLore);

    curY += tLore.height + 7;
    const tMotH = this.add.text(RX + 10, curY, "MOTIVAÇÃO NA CAMPANHA:", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#6a4a20"
    });
    R.add(tMotH);

    curY += tMotH.height + 2;
    const tMot = this.add.text(RX + 10, curY, h.motivation, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "8px", lineSpacing: 2.2, color: "#3a2818", wordWrap: { width: PW - 20 }
    });
    R.add(tMot);

    curY += tMot.height + 7;
    const boxY = curY;
    const skTitle = this.add.text(RX + 14, boxY + 5, "ARSENAL & HABILIDADES:", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#204a70"
    });

    let abY = boxY + 17;
    const abTexts = [];
    h.abilities.forEach((ab) => {
      const abTxt = this.add.text(RX + 14, abY, `• ${ab}`, {
        fontFamily: "Georgia, serif", fontSize: "7.5px", lineSpacing: 2, color: "#203040", wordWrap: { width: PW - 28 }
      });
      abTexts.push(abTxt);
      abY += abTxt.height + 3;
    });

    const skBoxH = (abY - boxY) + 4;
    const skBox = this.add.graphics();
    skBox.fillStyle(0x0e141c, 0.08).fillRoundedRect(RX + 8, boxY, PW - 16, skBoxH, 4);
    skBox.lineStyle(1, 0x4a78a0, 0.5).strokeRoundedRect(RX + 8, boxY, PW - 16, skBoxH, 4);
    R.add([skBox, skTitle, ...abTexts]);
  }

  // --- Seção III: Lendas das Profundezas (Rei e Guardiã) ---
  renderLegendPage(idx, LX, RX, PW) {
    const leg = __CODEX_LEGENDS[idx];
    if (!leg) return;
    const L = this.L, R = this.R;

    // === PÁGINA ESQUERDA: RETRATO DA LENDA ===
    L.add(this.add.text(LX + 10, 40, leg.name.toUpperCase(), {
      fontFamily: "Georgia, serif", fontSize: "12.5px", fontStyle: "bold", color: "#4a1220"
    }));

    L.add(this.add.text(LX + 10, 54, leg.title, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "8.5px", color: "#7a4820"
    }));

    // Retrato da Imagem de Cinematica
    const pBox = this.add.graphics();
    const px = LX + 8, py = 68, pw = PW - 16, ph = 120;
    pBox.fillStyle(0x130a0e, 0.95).fillRoundedRect(px, py, pw, ph, 5);
    pBox.lineStyle(1.5, 0xa04058, 0.8).strokeRoundedRect(px, py, pw, ph, 5);
    L.add(pBox);

    const imgKey = leg.image;
    if (this.textures.exists(imgKey)) {
      const im = this.add.image(px + pw / 2, py + ph / 2, imgKey);
      const sc = Math.min((pw - 8) / im.width, (ph - 8) / im.height);
      im.setScale(sc);
      L.add(im);
    } else {
      L.add(this.add.text(px + pw / 2, py + ph / 2, `❖ ${leg.name} ❖`, {
        fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "bold", color: "#d8a8b8"
      }).setOrigin(0.5));
    }

    // Citação Solene
    const qY = 196;
    const qTitle = this.add.text(LX + 14, qY + 5, "REGISTRO DE VOZ & JURAMENTO:", {
      fontFamily: "'Courier New', monospace", fontSize: "7px", fontStyle: "bold", color: "#8a2840"
    });
    const qTxt = this.add.text(LX + 14, qY + 16, leg.quote, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "8px", lineSpacing: 2.2, color: "#6a2034", wordWrap: { width: PW - 28 }
    });
    const qH = 16 + qTxt.height + 6;
    const qBox = this.add.graphics();
    qBox.fillStyle(0x280e14, 0.06).fillRoundedRect(LX + 8, qY, PW - 16, qH, 4);
    qBox.lineStyle(1, 0x8a2840, 0.4).strokeRoundedRect(LX + 8, qY, PW - 16, qH, 4);
    L.add([qBox, qTitle, qTxt]);

    // === PÁGINA DIREITA: CRÔNICA HISTÓRICA & MISTÉRIO ===
    let curY = 40;
    R.add(this.add.text(RX + 10, curY, "A HISTÓRIA ANCESTRAL", {
      fontFamily: "Georgia, serif", fontSize: "11.5px", fontStyle: "bold", color: "#4a1220"
    }));

    curY += 15;
    const tChron = this.add.text(RX + 10, curY, leg.chronicle, {
      fontFamily: "Georgia, serif", fontSize: "8px", lineSpacing: 2.2, color: "#3a1820", wordWrap: { width: PW - 20 }
    });
    R.add(tChron);

    curY += tChron.height + 7;
    const tEnigH = this.add.text(RX + 10, curY, "❖ O ENIGMA DOS PORTAIS", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#8a2840"
    });
    R.add(tEnigH);

    curY += tEnigH.height + 2;
    const tEnig = this.add.text(RX + 10, curY, leg.mystery, {
      fontFamily: "Georgia, serif", fontSize: "8px", lineSpacing: 2.2, color: "#3a1820", wordWrap: { width: PW - 20 }
    });
    R.add(tEnig);

    curY += tEnig.height + 7;
    const boxY = curY;
    const sTitle = this.add.text(RX + 14, boxY + 5, "REGISTRO SELADO PELAS SENTINELAS", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#8a2840"
    });
    const sTxt = this.add.text(RX + 14, boxY + 17, "As revelações finais acerca da natureza do Abismo aguardam aqueles que alcançarem a Câmara do Trono e desvendarem os últimos selos.", {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "8px", lineSpacing: 2.2, color: "#501824", wordWrap: { width: PW - 28 }
    });
    const sgBoxH = 17 + sTxt.height + 6;
    const sG = this.add.graphics();
    sG.fillStyle(0x280e14, 0.08).fillRoundedRect(RX + 8, boxY, PW - 16, sgBoxH, 4);
    sG.lineStyle(1, 0x8a2840, 0.45).strokeRoundedRect(RX + 8, boxY, PW - 16, sgBoxH, 4);
    R.add([sG, sTitle, sTxt]);
  }

  padState() {
    try {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const p = Array.from(pads).find(pad => pad && pad.connected);
      if (!p) return {};
      const B = i => !!p.buttons[i]?.pressed || (p.buttons[i]?.value || 0) > 0.5;
      const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
      return {
        l: B(14) || B(4) || ax < -0.5,
        r: B(15) || B(5) || ax > 0.5,
        u: B(12) || ay < -0.5,
        d: B(13) || ay > 0.5,
        a: B(0), b: B(1), x: B(2), y: B(3),
        lb: B(4), rb: B(5),
        lt: B(6), rt: B(7),
        back: B(8), start: B(9)
      };
    } catch (e) { return {}; }
  }

  update() {
    if (this.__closing || !this.sys.isActive() || this.busy) return;
    const s = this.padState(), p = this.__pad || {};
    this.__pad = s;
    const ed = k => s[k] && !p[k];

    // Fechar com B, Back ou Start
    if (ed("b") || ed("back") || ed("start")) {
      this.close();
      return;
    }

    // Virar páginas
    if (ed("l") || ed("lb") || ed("lt")) {
      this.go(this.spread - 1);
      return;
    }
    if (ed("r") || ed("rb") || ed("rt")) {
      this.go(this.spread + 1);
      return;
    }

    // Atalhos
    if (ed("y")) {
      this.go(1);
      return;
    }
    if (ed("x")) {
      this.go(this.BIOMES_START);
      return;
    }

    // Navegação no Índice
    if (this.spread === 1) {
      const totalEntries = (this.indexEntries ? this.indexEntries.length : (this.totalBiomes + this.totalHeroes + this.totalLegends));
      if (ed("u")) {
        this.indexCursor = ((this.indexCursor ?? 0) - 1 + totalEntries) % totalEntries;
        this.highlightIndexCursor();
      } else if (ed("d")) {
        this.indexCursor = ((this.indexCursor ?? 0) + 1) % totalEntries;
        this.highlightIndexCursor();
      } else if (ed("a")) {
        this.openIndexCursor();
      }
    } else if (this.spread === 0 && ed("a")) {
      this.go(1);
    }
  }

  highlightIndexCursor() {
    if (this.spread !== 1 || !this.indexEntries || !this.indexEntries.length) return;
    const cur = Phaser.Math.Clamp(this.indexCursor ?? 0, 0, this.indexEntries.length - 1);
    this.indexG?.clear();
    const item = this.indexEntries[cur];
    if (item && this.indexG) {
      this.indexG.fillStyle(0xc9a24a, 0.22).fillRoundedRect(item.x - 4, item.y - 2, item.w + 8, item.h + 4, 3);
      this.indexG.lineStyle(1, 0x8a6230, 0.7).strokeRoundedRect(item.x - 4, item.y - 2, item.w + 8, item.h + 4, 3);
      this.game.audioEngine?.sfx("sfx-ui-hover");
    }
  }

  openIndexCursor() {
    if (this.spread !== 1 || !this.indexEntries || !this.indexEntries.length) return;
    const cur = Phaser.Math.Clamp(this.indexCursor ?? 0, 0, this.indexEntries.length - 1);
    const item = this.indexEntries[cur];
    if (item && item.spread != null) {
      this.go(item.spread);
    }
  }

  close() {
    if (this.__closing) return;
    this.__closing = true;
    window.removeEventListener("keydown", this.__kd);
    this.scene.stop();
    if (this.from) this.scene.resume(this.from);
  }
}

