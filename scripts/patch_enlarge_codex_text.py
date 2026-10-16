# -*- coding: utf-8 -*-
"""
Patch to enlarge all text in __CodexScene for improved readability:
- Cover: Title 18px, Subtitle 10px, Preface 9.5px, Help 8.5-9.5px
- Index: Section headers 11px, entries 9-9.5px, page numbers 8-8.5px
- Biomes:
  * Left page: Name 13px, Subtitle 9px, Map labels 7.5px, Data 7.5-8px, Room briefing 7.5px
  * Right page: Chronicle title 13px, body 9.5px, Secrets title 9.5px, body 9.5px, Tip title 9px, body 9px
- Heroes:
  * Left page: Name 15px, Subtitle 9.5px, labels 8px, values 8.5px
  * Right page: Bio title 13px, Lore body 9.5px, Motivation title 9px, body 9px, Abilities title 9px, items 8.5px
- Legends:
  * Left page: Name 15px, Title 9.5px, Quote 9px
  * Right page: History title 13px, Chronicle 9.5px, Mystery title 9.5px, body 9.5px, Seal note 8.5px
- Chrome: Tabs 8.5px, Nav buttons 9.5px, Page indicator 9.5px
"""

import os

NEW_CODEX_SCENE_JS = '''class __CodexScene extends j.Scene {
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
    
    // Spreads:
    // 0: Capa / Título
    // 1: Índice Geral
    // 2 .. 12: Biomas (11)
    // 13 .. 21: Heróis (9)
    // 22: O Rei de Valdrak
    // 23: A Guardiã
    this.BIOMES_START = 2;
    this.HEROES_START = 2 + this.totalBiomes; // 13
    this.LEGENDS_START = this.HEROES_START + this.totalHeroes; // 22
    this.nSpreads = this.LEGENDS_START + this.totalLegends; // 24

    // Fundo escurecido
    this.add.rectangle(this.cx, st / 2, _ * 1.5, st * 1.5, 0x050403, 0.85).setInteractive();

    // Livro (capa, páginas e abas)
    this.bookG = this.add.graphics();
    this.drawBook();

    // Containers para as duas páginas
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

    // Touch Swipe realista para virar páginas
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

  drawBook() {
    const g = this.bookG, cx = this.cx, X0 = cx - 306, Y0 = 10, W = 612, H = 340;
    // Sombra do livro
    g.fillStyle(0, 0.55).fillRoundedRect(X0 + 7, Y0 + 9, W, H, 14);
    // Couro exterior encadernado
    g.fillStyle(0x281910, 1).fillRoundedRect(X0, Y0, W, H, 12);
    g.fillStyle(0x3a2418, 0.45).fillRoundedRect(X0 + 3, Y0 + 3, W - 6, H / 2, 10);
    g.lineStyle(2, 0x160c06, 1).strokeRoundedRect(X0, Y0, W, H, 12);
    g.lineStyle(1, 0x8a6230, 0.7).strokeRoundedRect(X0 + 5, Y0 + 5, W - 10, H - 10, 9);

    // Cantoneiras douradas ornamentadas
    for (const [x, y, sx, sy] of [[X0, Y0, 1, 1], [X0 + W, Y0, -1, 1], [X0, Y0 + H, 1, -1], [X0 + W, Y0 + H, -1, -1]]) {
      g.fillStyle(0xc9a24a, 1).fillTriangle(x, y, x + 22 * sx, y, x, y + 22 * sy);
      g.fillStyle(0x7a5822, 1).fillTriangle(x + 2 * sx, y + 2 * sy, x + 16 * sx, y + 2 * sy, x + 2 * sx, y + 16 * sy);
      g.fillStyle(0xffe89a, 0.9).fillCircle(x + 7 * sx, y + 7 * sy, 2);
    }

    // Dobra central / lombada interna
    g.fillStyle(0x0e0804, 0.85).fillRect(cx - 10, Y0 + 8, 20, H - 16);
    g.lineStyle(1, 0xecd79b, 0.2).strokeLineShape(new Phaser.Geom.Line(cx, Y0 + 8, cx, Y0 + H - 8));

    // Páginas de pergaminho
    const pw = 282, ph = 314, py = Y0 + 13;
    this.P = { l: cx - 294, r: cx + 12, w: pw, h: ph, y: py, b: py + ph };
    const pL = this.P.l, pR = this.P.r;

    // Folhas de pergaminho sobressalentes
    for (let f = 3; f >= 1; f--) {
      g.fillStyle(0xd5be94, 0.5).fillRoundedRect(pL - f * 1.5, py + f, pw, ph, 4);
      g.fillStyle(0xd5be94, 0.5).fillRoundedRect(pR + f * 1.5, py + f, pw, ph, 4);
    }

    // Página esquerda principal
    g.fillStyle(0xf3e5c8, 1).fillRoundedRect(pL, py, pw, ph, 5);
    g.lineStyle(1, 0xecd79b, 0.8).strokeRoundedRect(pL + 3, py + 3, pw - 6, ph - 6, 4);
    g.lineStyle(1, 0x8a6230, 0.35).strokeRoundedRect(pL + 6, py + 6, pw - 12, ph - 12, 3);

    // Página direita principal
    g.fillStyle(0xf3e5c8, 1).fillRoundedRect(pR, py, pw, ph, 5);
    g.lineStyle(1, 0xecd79b, 0.8).strokeRoundedRect(pR + 3, py + 3, pw - 6, ph - 6, 4);
    g.lineStyle(1, 0x8a6230, 0.35).strokeRoundedRect(pR + 6, py + 6, pw - 12, ph - 12, 3);

    // Sombreamento realista da lombada
    g.fillStyle(0x1a0f08, 0.22).fillRect(cx - 16, py, 16, ph);
    g.fillStyle(0x1a0f08, 0.22).fillRect(cx, py, 16, ph);
  }

  drawChrome() {
    const cx = this.cx, P = this.P;
    
    // Abas superiores de navegação direta com texto legível
    const tabs = [
      ["ÍNDICE", 0x8a6230, () => this.go(1)],
      ["BIOMAS & MAPAS", 0x3d7055, () => this.go(this.BIOMES_START)],
      ["HERÓIS DE OUTRAS ERAS", 0x355a80, () => this.go(this.HEROES_START)],
      ["LENDAS DO ABISMO", 0x753a48, () => this.go(this.LEGENDS_START)]
    ];

    const tabW = 126, tabH = 19, startX = cx - (tabs.length * tabW) / 2;
    tabs.forEach(([label, col, act], idx) => {
      const tx = startX + idx * tabW;
      const tg = this.add.graphics();
      tg.fillStyle(col, 0.95).fillRoundedRect(tx + 4, 2, tabW - 8, tabH, { tl: 5, tr: 5, bl: 0, br: 0 });
      tg.lineStyle(1, 0xecd79b, 0.75).strokeRoundedRect(tx + 4, 2, tabW - 8, tabH, { tl: 5, tr: 5, bl: 0, br: 0 });
      
      const txt = this.add.text(tx + tabW / 2, 11, label, {
        fontFamily: "'Courier New', monospace", fontSize: "8.5px", fontStyle: "bold", color: "#fdf8ee"
      }).setOrigin(0.5);

      const zone = this.add.zone(tx + 4, 2, tabW - 8, tabH + 6).setOrigin(0).setInteractive({ useHandCursor: true });
      zone.on("pointerdown", act);
      zone.on("pointerover", () => txt.setColor("#ffd24a"));
      zone.on("pointerout", () => txt.setColor("#fdf8ee"));
      typeof Gt === "function" && Gt(zone, 10, 8);
    });

    // Botões de navegação no rodapé com fonte maior
    const prevB = this.add.text(P.l + 38, P.b - 13, "◀ PÁG ANTERIOR", {
      fontFamily: "'Courier New', monospace", fontSize: "9.5px", fontStyle: "bold", color: "#5a4228",
      backgroundColor: "rgba(220,200,165,0.75)", padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    prevB.on("pointerdown", () => this.go(this.spread - 1));
    prevB.on("pointerover", () => prevB.setColor("#a03520"));
    prevB.on("pointerout", () => prevB.setColor("#5a4228"));
    typeof Gt === "function" && Gt(prevB, 18, 14);

    const nextB = this.add.text(P.r - 38, P.b - 13, "PRÓXIMA PÁG ▶", {
      fontFamily: "'Courier New', monospace", fontSize: "9.5px", fontStyle: "bold", color: "#5a4228",
      backgroundColor: "rgba(220,200,165,0.75)", padding: { x: 10, y: 4 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    nextB.on("pointerdown", () => this.go(this.spread + 1));
    nextB.on("pointerover", () => nextB.setColor("#a03520"));
    nextB.on("pointerout", () => nextB.setColor("#5a4228"));
    typeof Gt === "function" && Gt(nextB, 18, 14);

    // Indicador central de página
    this.pageInd = this.add.text(cx, P.b - 13, "", {
      fontFamily: "'Courier New', monospace", fontSize: "9.5px", fontStyle: "bold", color: "#6a523a"
    }).setOrigin(0.5);

    // Botão Fechar no canto superior direito
    const clX = cx + 288, clY = 24;
    const clG = this.add.graphics();
    clG.fillStyle(0x701818, 0.95).fillCircle(clX, clY, 11);
    clG.lineStyle(1.5, 0xecd79b, 0.9).strokeCircle(clX, clY, 11);

    const clT = this.add.text(clX, clY, "✕", {
      fontFamily: "Arial", fontSize: "12px", fontStyle: "bold", color: "#fdf8ee"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    clT.on("pointerdown", () => this.close());
    clT.on("pointerover", () => { clT.setScale(1.15); clG.fillStyle(0xa02424, 1); });
    clT.on("pointerout", () => { clT.setScale(1); clG.fillStyle(0x701818, 0.95); });
    typeof Gt === "function" && Gt(clT, 14, 14);
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

    const cx = this.cx, py = this.P.y, ph = this.P.h;
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
    this.L.removeAll(true);
    this.R.removeAll(true);

    const s = this.spread;
    this.pageInd.setText(`${s === 0 ? "CAPA" : "PÁG " + s} / ${this.nSpreads - 1}`);

    const LX = this.cx - 276, RX = this.cx + 20, PW = 256;

    if (s === 0) {
      this.renderCover(LX, RX, PW);
    } else if (s === 1) {
      this.renderIndex(LX, RX, PW);
    } else if (s >= this.BIOMES_START && s < this.HEROES_START) {
      this.renderBiomePage(s - this.BIOMES_START, LX, RX, PW);
    } else if (s >= this.HEROES_START && s < this.LEGENDS_START) {
      this.renderHeroPage(s - this.HEROES_START, LX, RX, PW);
    } else {
      this.renderLegendPage(s - this.LEGENDS_START, LX, RX, PW);
    }
  }

  // --- Capa do Códice ---
  renderCover(LX, RX, PW) {
    const L = this.L, R = this.R;
    
    // Página Esquerda: Frontispício
    const eg = this.add.graphics();
    eg.lineStyle(1.5, 0x8a6230, 0.5).strokeRoundedRect(LX + 10, 36, PW - 20, 260, 6);
    eg.lineStyle(1, 0xecd79b, 0.4).strokeRoundedRect(LX + 13, 39, PW - 26, 254, 4);
    L.add(eg);

    L.add(this.add.text(LX + PW / 2, 68, "✦ ARCHIVUM PROFUNDIS ✦", {
      fontFamily: "'Courier New', monospace", fontSize: "10.5px", fontStyle: "bold", color: "#8a5822"
    }).setOrigin(0.5));

    L.add(this.add.text(LX + PW / 2, 126, "O CÓDICE\\nDAS PROFUNDEZAS", {
      fontFamily: "Georgia, serif", fontSize: "18px", fontStyle: "bold", color: "#2b190c", align: "center", lineSpacing: 4
    }).setOrigin(0.5));

    L.add(this.add.text(LX + PW / 2, 175, "Crônicas dos Mundos, Biomas\\n& Campeões Convocados", {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "10px", color: "#6a523a", align: "center", lineSpacing: 3
    }).setOrigin(0.5));

    L.add(this.add.text(LX + PW / 2, 244, "Compilado pela Ordem das Sentinelas\\npara os que atravessam os portais.", {
      fontFamily: "'Courier New', monospace", fontSize: "8.5px", color: "#7a6240", align: "center", lineSpacing: 2
    }).setOrigin(0.5));

    // Página Direita: Introdução & Instruções
    R.add(this.add.text(RX + PW / 2, 46, "PREFÁCIO DA GUARDIÃ", {
      fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "bold", color: "#2b190c"
    }).setOrigin(0.5));

    const pref = "“Durante séculos, os mapas de nossas terras foram redesenhados pelas fendas dimensionais. Este tomo reúne os registros topográficos de cada região alcançada pelos portais, bem como o relato detalhado de cada herói trazido de eras remotas.\\n\\nNinguém atravessa por acaso. Que este compêndio ilumine seus passos nas trevas.”";
    R.add(this.add.text(RX + 14, 70, pref, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9.5px", lineSpacing: 3, color: "#3a2818", wordWrap: { width: PW - 28 }
    }));

    // Caixa de ajuda interativa
    const hBox = this.add.graphics();
    hBox.fillStyle(0x0e0804, 0.08).fillRoundedRect(RX + 14, 172, PW - 28, 114, 6);
    hBox.lineStyle(1, 0x8a6230, 0.55).strokeRoundedRect(RX + 14, 172, PW - 28, 114, 6);
    R.add(hBox);

    R.add(this.add.text(RX + PW / 2, 185, "COMO NAVEGAR NO CÓDICE", {
      fontFamily: "'Courier New', monospace", fontSize: "9px", fontStyle: "bold", color: "#8a5822"
    }).setOrigin(0.5));

    R.add(this.add.text(RX + 22, 202, "• Touch / Mobile: Deslize o dedo para virar\\n• Abas no topo: Acesse seções instantaneamente\\n• Teclado: Setas ◀ ▶ ou teclas A / D\\n• Roda do Mouse: Role para folhear rápido\\n• Clique nas entradas do Índice para abrir", {
      fontFamily: "'Courier New', monospace", fontSize: "8.5px", lineSpacing: 2.5, color: "#4a3520"
    }));

    const openIdx = this.add.text(RX + PW / 2, 268, "[ ABRIR ÍNDICE DO CÓDICE ▶ ]", {
      fontFamily: "'Courier New', monospace", fontSize: "9.5px", fontStyle: "bold", color: "#8c1f1f"
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    openIdx.on("pointerdown", () => this.go(1));
    openIdx.on("pointerover", () => openIdx.setColor("#e03520"));
    openIdx.on("pointerout", () => openIdx.setColor("#8c1f1f"));
    typeof Gt === "function" && Gt(openIdx, 14, 10);
    R.add(openIdx);
  }

  // --- Índice Geral ---
  renderIndex(LX, RX, PW) {
    const L = this.L, R = this.R;

    // Coluna Esquerda: Biomas
    L.add(this.add.text(LX + PW / 2, 36, "❖ SEÇÃO I: BIOMAS & MAPAS ❖", {
      fontFamily: "Georgia, serif", fontSize: "11px", fontStyle: "bold", color: "#2b190c"
    }).setOrigin(0.5));

    __CODEX_BIOMES.forEach((b, i) => {
      const y = 54 + i * 21;
      const t = this.add.text(LX + 12, y, `${i < 9 ? "0" + (i + 1) : (i + 1)}. ${b.name}`, {
        fontFamily: "Georgia, serif", fontSize: "9.5px", fontStyle: "bold", color: "#3a2614"
      }).setInteractive({ useHandCursor: true });
      
      const pg = this.add.text(LX + PW - 12, y, `Pág ${this.BIOMES_START + i}`, {
        fontFamily: "'Courier New', monospace", fontSize: "8.5px", color: "#8a7550"
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

      const act = () => this.go(this.BIOMES_START + i);
      t.on("pointerdown", act); pg.on("pointerdown", act);
      t.on("pointerover", () => t.setColor("#a03520")); t.on("pointerout", () => t.setColor("#3a2614"));
      L.add([t, pg]);
    });

    // Coluna Direita: Heróis e Lendas
    R.add(this.add.text(RX + PW / 2, 36, "❖ SEÇÃO II: HERÓIS CONVOCADOS ❖", {
      fontFamily: "Georgia, serif", fontSize: "11px", fontStyle: "bold", color: "#2b190c"
    }).setOrigin(0.5));

    __CODEX_HEROES.forEach((h, i) => {
      const y = 52 + i * 19;
      const t = this.add.text(RX + 12, y, `• ${h.name} (${h.subtitle.split('&')[0].trim()})`, {
        fontFamily: "Georgia, serif", fontSize: "9px", fontStyle: "bold", color: "#243a50"
      }).setInteractive({ useHandCursor: true });
      
      const pg = this.add.text(RX + PW - 12, y, `Pág ${this.HEROES_START + i}`, {
        fontFamily: "'Courier New', monospace", fontSize: "8px", color: "#8a7550"
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

      const act = () => this.go(this.HEROES_START + i);
      t.on("pointerdown", act); pg.on("pointerdown", act);
      t.on("pointerover", () => t.setColor("#a03520")); t.on("pointerout", () => t.setColor("#243a50"));
      R.add([t, pg]);
    });

    // Divisor para Lendas
    R.add(this.add.text(RX + PW / 2, 226, "❖ SEÇÃO III: LENDAS DO ABISMO ❖", {
      fontFamily: "Georgia, serif", fontSize: "10.5px", fontStyle: "bold", color: "#6a2030"
    }).setOrigin(0.5));

    __CODEX_LEGENDS.forEach((leg, i) => {
      const y = 244 + i * 20;
      const t = this.add.text(RX + 12, y, `• ${leg.name} • ${leg.role}`, {
        fontFamily: "Georgia, serif", fontSize: "9px", fontStyle: "bold", color: "#501824"
      }).setInteractive({ useHandCursor: true });

      const pg = this.add.text(RX + PW - 12, y, `Pág ${this.LEGENDS_START + i}`, {
        fontFamily: "'Courier New', monospace", fontSize: "8px", color: "#8a7550"
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

      const act = () => this.go(this.LEGENDS_START + i);
      t.on("pointerdown", act); pg.on("pointerdown", act);
      t.on("pointerover", () => t.setColor("#a03520")); t.on("pointerout", () => t.setColor("#501824"));
      R.add([t, pg]);
    });
  }

  // --- Seção I: Páginas de Biomas & Mapas ---
  renderBiomePage(idx, LX, RX, PW) {
    const b = __CODEX_BIOMES[idx];
    if (!b) return;
    const L = this.L, R = this.R;

    // === PÁGINA ESQUERDA: CARTA CARTOGRÁFICA GRÁFICA & TOPOGRAFIA ===
    L.add(this.add.text(LX + 10, 32, b.name.toUpperCase(), {
      fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "bold", color: "#2b190c"
    }));

    L.add(this.add.text(LX + 10, 48, `Carta Cartográfica • ${b.title}`, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9px", color: "#7a5c36"
    }));

    // Canvas do Mapa Gráfico Topográfico
    const mapG = this.add.graphics();
    const mapX = LX + 8, mapY = 62, mapW = PW - 16, mapH = 132;

    // Paleta de terreno específica por bioma
    const biomePalettes = {
      forest:   { bg: 0x122214, border: 0x3d7032, path: 0x5a4832, room: 0x223820, roomB: 0x528c40, water: 0x286080, accent: 0x44aa44 },
      castle:   { bg: 0x181822, border: 0x685e82, path: 0x383648, room: 0x282838, roomB: 0x8a7cb0, water: 0x121028, accent: 0xa02828 },
      catacombs:{ bg: 0x181514, border: 0x7a6250, path: 0x3e322a, room: 0x28211c, roomB: 0x9c7e68, water: 0x1a2e22, accent: 0xbb3322 },
      ruins:    { bg: 0x1d2016, border: 0x6e784c, path: 0x484232, room: 0x2a301e, roomB: 0x8a985e, water: 0x244240, accent: 0xd4a030 },
      temple:   { bg: 0x2a2012, border: 0xa88438, path: 0x5a4628, room: 0x3c2e1a, roomB: 0xd8ac4c, water: 0x207068, accent: 0xe0a020 },
      glacial:  { bg: 0x101c29, border: 0x4a7ea8, path: 0x243e58, room: 0x1c3044, roomB: 0x76b2db, water: 0x0a121c, accent: 0x9be2ff },
      vulcao:   { bg: 0x1c1210, border: 0x9c3620, path: 0x4a2218, room: 0x301814, roomB: 0xde4e2c, water: 0xff4800, accent: 0xffaa00 },
      fortress: { bg: 0x1c1414, border: 0x8a3838, path: 0x442626, room: 0x2c1c1c, roomB: 0xb84444, water: 0x301010, accent: 0xd43030 },
      bosque:   { bg: 0x0f2215, border: 0x2e6e3e, path: 0x463b22, room: 0x1a3822, roomB: 0x429658, water: 0x163e32, accent: 0x2ed664 },
      rio:      { bg: 0x0d1a29, border: 0x386894, path: 0x4a4434, room: 0x182c40, roomB: 0x5894cc, water: 0x143452, accent: 0x38b8e0 },
      morta:    { bg: 0x1a1622, border: 0x5a486e, path: 0x362c42, room: 0x282035, roomB: 0x826c9c, water: 0x14101a, accent: 0x9b59b6 }
    };
    const pal = biomePalettes[b.id] || biomePalettes.forest;

    // Fundo pergaminho escuro envelhecido
    mapG.fillStyle(pal.bg, 0.96).fillRoundedRect(mapX, mapY, mapW, mapH, 6);
    mapG.lineStyle(1.5, pal.border, 0.85).strokeRoundedRect(mapX, mapY, mapW, mapH, 6);
    mapG.lineStyle(0.5, 0xecd79b, 0.25).strokeRoundedRect(mapX + 2, mapY + 2, mapW - 4, mapH - 4, 5);

    // Cantoneiras douradas decorativas da moldura
    const cSize = 6;
    mapG.lineStyle(1.5, 0xc9a24a, 0.9);
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 3, mapY + 3, mapX + 3 + cSize, mapY + 3));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 3, mapY + 3, mapX + 3, mapY + 3 + cSize));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + mapW - 3, mapY + 3, mapX + mapW - 3 - cSize, mapY + 3));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + mapW - 3, mapY + 3, mapX + mapW - 3, mapY + 3 + cSize));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 3, mapY + mapH - 3, mapX + 3 + cSize, mapY + mapH - 3));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 3, mapY + mapH - 3, mapX + 3, mapY + mapH - 3 - cSize));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + mapW - 3, mapY + mapH - 3, mapX + mapW - 3 - cSize, mapY + mapH - 3));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + mapW - 3, mapY + mapH - 3, mapX + mapW - 3, mapY + mapH - 3 - cSize));

    // Elementos gráficos de terreno específicos desenhados no relevo
    if (b.id === "forest" || b.id === "bosque") {
      mapG.lineStyle(4, pal.water, 0.7);
      mapG.beginPath();
      mapG.moveTo(mapX + mapW * 0.48, mapY + 8);
      mapG.lineTo(mapX + mapW * 0.52, mapY + mapH * 0.45);
      mapG.lineTo(mapX + mapW * 0.46, mapY + mapH * 0.88);
      mapG.strokePath();
      mapG.fillStyle(pal.roomB, 0.25);
      [ [12, 12], [mapW - 16, 14], [14, mapH - 16], [mapW * 0.5, 16], [mapW * 0.45, mapH - 18] ].forEach(([ox, oy]) => {
        mapG.fillCircle(mapX + ox, mapY + oy, 7);
      });
    } else if (b.id === "castle") {
      mapG.lineStyle(1, 0x3d3852, 0.5);
      mapG.strokeRect(mapX + 10, mapY + 12, mapW - 20, mapH - 24);
      mapG.fillStyle(0x8a1818, 0.4).fillRect(mapX + mapW * 0.48, mapY + mapH * 0.5, 8, mapH * 0.35);
    } else if (b.id === "vulcao") {
      mapG.lineStyle(3, 0xff5500, 0.8);
      mapG.beginPath();
      mapG.moveTo(mapX + mapW * 0.15, mapY + 10);
      mapG.lineTo(mapX + mapW * 0.45, mapY + mapH * 0.5);
      mapG.lineTo(mapX + mapW * 0.85, mapY + mapH * 0.85);
      mapG.strokePath();
      mapG.lineStyle(1.5, 0xffbb00, 0.95);
      mapG.strokePath();
    } else if (b.id === "glacial") {
      mapG.lineStyle(2, 0x081018, 0.8);
      mapG.beginPath();
      mapG.moveTo(mapX + 15, mapY + mapH * 0.4);
      mapG.lineTo(mapX + mapW * 0.5, mapY + mapH * 0.48);
      mapG.lineTo(mapX + mapW - 20, mapY + mapH * 0.42);
      mapG.strokePath();
      mapG.lineStyle(1, 0x9be2ff, 0.4);
      mapG.strokePath();
    } else if (b.id === "rio") {
      mapG.lineStyle(1, 0x20507a, 0.4);
      for (let w = 0; w < 4; w++) {
        mapG.strokeCircle(mapX + mapW * 0.5, mapY + mapH * 0.5, 20 + w * 18);
      }
    } else if (b.id === "temple") {
      mapG.lineStyle(1, 0x785a28, 0.35);
      for (let d = 0; d < 3; d++) {
        mapG.beginPath();
        mapG.moveTo(mapX + 10, mapY + 30 + d * 35);
        mapG.lineTo(mapX + mapW - 10, mapY + 40 + d * 35);
        mapG.strokePath();
      }
    }

    // Grid e cálculo de coordenadas para salas
    const cellW = mapW / 11, cellH = mapH / 10;

    // Corredores de pedra conectando salas
    mapG.lineStyle(3.5, 0x0c0906, 0.7);
    for (let i = 0; i < b.rooms.length - 1; i++) {
      const r1 = b.rooms[i], r2 = b.rooms[i + 1];
      const cx1 = mapX + (r1.x + r1.w / 2) * cellW;
      const cy1 = mapY + (r1.y + r1.h / 2) * cellH;
      const cx2 = mapX + (r2.x + r2.w / 2) * cellW;
      const cy2 = mapY + (r2.y + r2.h / 2) * cellH;
      mapG.lineBetween(cx1, cy1, cx2, cy2);
    }
    mapG.lineStyle(2, pal.path, 0.95);
    for (let i = 0; i < b.rooms.length - 1; i++) {
      const r1 = b.rooms[i], r2 = b.rooms[i + 1];
      const cx1 = mapX + (r1.x + r1.w / 2) * cellW;
      const cy1 = mapY + (r1.y + r1.h / 2) * cellH;
      const cx2 = mapX + (r2.x + r2.w / 2) * cellW;
      const cy2 = mapY + (r2.y + r2.h / 2) * cellH;
      mapG.lineBetween(cx1, cy1, cx2, cy2);
    }

    // Desenhar cada câmara com relevo 3D de alvenaria e rótulos ampliados
    b.rooms.forEach((rm, rIdx) => {
      const rx = mapX + rm.x * cellW, ry = mapY + rm.y * cellH;
      const rw = rm.w * cellW, rh = rm.h * cellH;

      mapG.fillStyle(0x060403, 0.65).fillRoundedRect(rx + 1.5, ry + 2, rw, rh, 3);

      if (rm.boss) {
        mapG.fillStyle(0x4a1210, 0.95).fillRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(1.5, 0xe23c2c, 0.95).strokeRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(0.5, 0xffaa88, 0.5).strokeRoundedRect(rx + 1.5, ry + 1.5, rw - 3, rh - 3, 2);
      } else if (rm.secret) {
        mapG.fillStyle(0x2d123d, 0.95).fillRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(1.5, 0xb04fe6, 0.95).strokeRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(0.5, 0xe2a8ff, 0.5).strokeRoundedRect(rx + 1.5, ry + 1.5, rw - 3, rh - 3, 2);
      } else if (rIdx === 0) {
        mapG.fillStyle(0x122434, 0.95).fillRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(1.5, 0x38a0d4, 0.95).strokeRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(0.5, 0x8ce0ff, 0.5).strokeRoundedRect(rx + 1.5, ry + 1.5, rw - 3, rh - 3, 2);
      } else {
        mapG.fillStyle(pal.room, 0.95).fillRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(1.2, pal.roomB, 0.85).strokeRoundedRect(rx, ry, rw, rh, 3);
        mapG.lineStyle(0.5, 0xd0c4a4, 0.2).strokeRoundedRect(rx + 1, ry + 1, rw - 2, rh - 2, 2);
      }

      let prefix = "";
      let color = "#e6dcc8";
      if (rm.boss) { prefix = "☠ "; color = "#ff9a8a"; }
      else if (rm.secret) { prefix = "★ "; color = "#deb8ff"; }
      else if (rIdx === 0) { prefix = "◈ "; color = "#9fe2ff"; }

      const lbl = L.add(this.add.text(rx + rw / 2, ry + rh / 2, prefix + rm.label, {
        fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: color
      }).setOrigin(0.5));

      const hitZone = this.add.zone(rx + rw / 2, ry + rh / 2, rw, rh).setOrigin(0.5).setInteractive({ useHandCursor: true });
      hitZone.on("pointerdown", () => {
        this.game.audioEngine?.sfx("sfx-ui-click");
        this.updateRoomBriefing(b, rm, rIdx);
      });
      hitZone.on("pointerover", () => lbl.setColor("#ffff55"));
      hitZone.on("pointerout", () => lbl.setColor(color));
      L.add(hitZone);
    });

    // Rosa dos Ventos
    const roseX = mapX + mapW - 15, roseY = mapY + 15;
    mapG.fillStyle(0x0a0705, 0.75).fillCircle(roseX, roseY, 11);
    mapG.lineStyle(1, 0xc9a24a, 0.85).strokeCircle(roseX, roseY, 11);
    mapG.lineStyle(1.5, 0xc9a24a, 1);
    mapG.strokeLineShape(new Phaser.Geom.Line(roseX, roseY - 10, roseX, roseY + 10));
    mapG.strokeLineShape(new Phaser.Geom.Line(roseX - 10, roseY, roseX + 10, roseY));
    mapG.fillStyle(0xdf3824, 1).fillTriangle(roseX, roseY - 10, roseX - 2.5, roseY - 1, roseX + 2.5, roseY - 1);
    mapG.fillStyle(0xecd79b, 0.8).fillTriangle(roseX, roseY + 10, roseX - 2, roseY + 1, roseX + 2, roseY + 1);
    L.add(this.add.text(roseX, roseY - 11, "N", { fontFamily: "'Courier New', monospace", fontSize: "7px", fontStyle: "bold", color: "#ecd79b" }).setOrigin(0.5, 1));

    // Barra de escala cartográfica
    mapG.lineStyle(1, 0xc9a24a, 0.8);
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 8, mapY + mapH - 7, mapX + 42, mapY + mapH - 7));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 8, mapY + mapH - 9, mapX + 8, mapY + mapH - 5));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 25, mapY + mapH - 8, mapX + 25, mapY + mapH - 6));
    mapG.strokeLineShape(new Phaser.Geom.Line(mapX + 42, mapY + mapH - 9, mapX + 42, mapY + mapH - 5));
    L.add(this.add.text(mapX + 25, mapY + mapH - 11, "50 braças", { fontFamily: "'Courier New', monospace", fontSize: "6.5px", color: "#b89e6e" }).setOrigin(0.5, 1));

    // Fita cartouche
    L.add(this.add.text(mapX + 10, mapY + 5, "TOPOGRAFIA REGIONAL", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#ecd79b"
    }));

    L.add(mapG);

    // Painel de Parâmetros Geográficos & Ameaças
    const legY = 200;
    const hudBox = this.add.graphics();
    hudBox.fillStyle(0x130e09, 0.08).fillRoundedRect(LX + 8, legY, PW - 16, 92, 4);
    hudBox.lineStyle(1, 0x8a6230, 0.45).strokeRoundedRect(LX + 8, legY, PW - 16, 92, 4);
    L.add(hudBox);

    L.add(this.add.text(LX + 12, legY + 5, "DADOS CARTOGRÁFICOS & AMEAÇAS", {
      fontFamily: "'Courier New', monospace", fontSize: "8px", fontStyle: "bold", color: "#8a5822"
    }));

    const rows = [
      ["Grau de Perigo:", b.danger, "#a03020"],
      ["Atmosfera / Clima:", b.climate, "#4a3520"],
      ["Inimigos Típicos:", b.threat, "#3a2614"],
      ["Ameaça Suprema:", b.boss, "#8a2418"]
    ];

    rows.forEach(([k, v, c], i) => {
      const yy = legY + 16 + i * 15;
      L.add(this.add.text(LX + 12, yy, k, {
        fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#7a6244"
      }));
      L.add(this.add.text(LX + 82, yy, v, {
        fontFamily: "Georgia, serif", fontSize: "8px", color: c, wordWrap: { width: PW - 94 }
      }));
    });

    // Faixa interativa de briefing
    this.roomBriefingText = this.add.text(LX + 12, legY + 77, `[✦ Clique nas câmaras no mapa para inspecionar]`, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "7.5px", color: "#8a5822", wordWrap: { width: PW - 24 }
    });
    L.add(this.roomBriefingText);

    // === PÁGINA DIREITA: CRÔNICA, SEGREDOS E DICAS (FONTE AMPLIADA) ===
    R.add(this.add.text(RX + 10, 32, "CRÔNICA DA REGIÃO", {
      fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "bold", color: "#2b190c"
    }));

    R.add(this.add.text(RX + 10, 48, b.chronicle, {
      fontFamily: "Georgia, serif", fontSize: "9.5px", lineSpacing: 2, color: "#3a2818", wordWrap: { width: PW - 20 }
    }));

    // Segredos Arcanos
    const secY = 126;
    R.add(this.add.text(RX + 10, secY, "✦ ARQUITETURA & SEGREDOS OCULTOS", {
      fontFamily: "'Courier New', monospace", fontSize: "9.5px", fontStyle: "bold", color: "#8a5822"
    }));

    R.add(this.add.text(RX + 10, secY + 14, b.secrets, {
      fontFamily: "Georgia, serif", fontSize: "9.5px", lineSpacing: 2, color: "#4a3520", wordWrap: { width: PW - 20 }
    }));

    // Caixa de Dica de Sobrevivência
    const tipBox = this.add.graphics();
    const tbX = RX + 8, tbY = 208, tbW = PW - 16, tbH = 84;
    tipBox.fillStyle(0x130e09, 0.08).fillRoundedRect(tbX, tbY, tbW, tbH, 4);
    tipBox.lineStyle(1, 0x8a6230, 0.5).strokeRoundedRect(tbX, tbY, tbW, tbH, 4);
    R.add(tipBox);

    R.add(this.add.text(tbX + 8, tbY + 6, "CONSELHO DO EXPLORADOR:", {
      fontFamily: "'Courier New', monospace", fontSize: "9px", fontStyle: "bold", color: "#8a5822"
    }));

    R.add(this.add.text(tbX + 8, tbY + 20, b.tip, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9px", lineSpacing: 2, color: "#3a2818", wordWrap: { width: tbW - 16 }
    }));
  }

  updateRoomBriefing(b, rm, rIdx) {
    if (!this.roomBriefingText) return;
    let desc = "";
    if (rm.boss) {
      desc = `[COVIL DO CHEFE] ${rm.label}: Santuário do lorde supremo ${b.boss}. Prepare-se antes de cruzar!`;
    } else if (rm.secret) {
      desc = `[SEGREDO OCULTO] ${rm.label}: Câmara selada por runas. Contém oferendas raras e baús esquecidos.`;
    } else if (rIdx === 0) {
      desc = `[PORTAL DE ENTRADA] ${rm.label}: Ponto de chegada do vórtice dimensional e refúgio temporário.`;
    } else {
      desc = `[CÂMARA] ${rm.label}: Corredores patrulhados por ${b.threat.split(' e ')[0] || 'inimigos hostis'}.`;
    }
    this.roomBriefingText.setText(desc);
    this.roomBriefingText.setColor(rm.boss ? "#a02818" : rm.secret ? "#6e2ca0" : "#1e4828");
  }

  // --- Seção II: Páginas de Heróis (Fonte Ampliada) ---
  renderHeroPage(idx, LX, RX, PW) {
    const h = __CODEX_HEROES[idx];
    if (!h) return;
    const L = this.L, R = this.R;

    // === PÁGINA ESQUERDA: ILUSTRAÇÃO DO HERÓI & DADOS ===
    L.add(this.add.text(LX + 10, 32, h.name.toUpperCase(), {
      fontFamily: "Georgia, serif", fontSize: "15px", fontStyle: "bold", color: "#1c2e42"
    }));

    L.add(this.add.text(LX + 10, 49, h.subtitle, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9.5px", color: "#6a523a"
    }));

    // Moldura do Retrato / Sprite
    const fBox = this.add.graphics();
    const fx = LX + 10, fy = 66, fw = PW - 20, fh = 108;
    fBox.fillStyle(0x0e141c, 0.95).fillRoundedRect(fx, fy, fw, fh, 6);
    fBox.lineStyle(1.5, 0x4a78a0, 0.75).strokeRoundedRect(fx, fy, fw, fh, 6);
    L.add(fBox);

    // Sprite do Campeão animado
    const sKey = h.spriteKey;
    if (this.textures.exists(sKey)) {
      const sp = this.add.sprite(fx + fw / 2, fy + fh - 14, sKey, 0).setScale(1.6).setOrigin(0.5, 1);
      this.anims.exists(`${sKey}-idle`) && sp.play(`${sKey}-idle`);
      L.add(sp);
    } else {
      L.add(this.add.text(fx + fw / 2, fy + fh / 2, `[ ${h.name} ]`, {
        fontFamily: "Georgia, serif", fontSize: "15px", fontStyle: "bold", color: "#a8c0d8"
      }).setOrigin(0.5));
    }

    // Informações da Origem Cósmica com texto ampliado
    const infoY = 180;
    const items = [
      ["Era de Origem:", h.era],
      ["Plano / Dimensão:", h.dimension],
      ["Papel Tático:", h.role],
      ["Arma & Estilo:", h.weapon]
    ];

    items.forEach(([lbl, val], i) => {
      const yy = infoY + i * 26;
      L.add(this.add.text(LX + 10, yy, lbl, {
        fontFamily: "'Courier New', monospace", fontSize: "8px", fontStyle: "bold", color: "#5a7288"
      }));
      L.add(this.add.text(LX + 10, yy + 10, val, {
        fontFamily: "Georgia, serif", fontSize: "8.5px", color: "#243648", wordWrap: { width: PW - 20 }
      }));
    });

    // === PÁGINA DIREITA: BIOGRAFIA & HABILIDADES (FONTE AMPLIADA) ===
    R.add(this.add.text(RX + 10, 32, "BIOGRAFIA & CONVOCAÇÃO", {
      fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "bold", color: "#1c2e42"
    }));

    R.add(this.add.text(RX + 10, 48, h.lore, {
      fontFamily: "Georgia, serif", fontSize: "9.5px", lineSpacing: 2, color: "#243648", wordWrap: { width: PW - 20 }
    }));

    R.add(this.add.text(RX + 10, 114, "MOTIVAÇÃO NA CAMPANHA:", {
      fontFamily: "'Courier New', monospace", fontSize: "9px", fontStyle: "bold", color: "#6a4a20"
    }));

    R.add(this.add.text(RX + 10, 127, h.motivation, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9px", lineSpacing: 2, color: "#3a2818", wordWrap: { width: PW - 20 }
    }));

    // Caixa de Habilidades Distintivas
    const skBox = this.add.graphics();
    const skX = RX + 8, skY = 174, skW = PW - 16, skH = 118;
    skBox.fillStyle(0x0e141c, 0.08).fillRoundedRect(skX, skY, skW, skH, 4);
    skBox.lineStyle(1, 0x4a78a0, 0.5).strokeRoundedRect(skX, skY, skW, skH, 4);
    R.add(skBox);

    R.add(this.add.text(skX + 8, skY + 6, "ARSENAL & HABILIDADES:", {
      fontFamily: "'Courier New', monospace", fontSize: "9px", fontStyle: "bold", color: "#204a70"
    }));

    h.abilities.forEach((ab, i) => {
      R.add(this.add.text(skX + 8, skY + 20 + i * 31, `• ${ab}`, {
        fontFamily: "Georgia, serif", fontSize: "8.5px", lineSpacing: 1.5, color: "#203040", wordWrap: { width: skW - 16 }
      }));
    });
  }

  // --- Seção III: Lendas das Profundezas (Rei e Guardiã - Fonte Ampliada) ---
  renderLegendPage(idx, LX, RX, PW) {
    const leg = __CODEX_LEGENDS[idx];
    if (!leg) return;
    const L = this.L, R = this.R;

    // === PÁGINA ESQUERDA: RETRATO DA LENDA ===
    L.add(this.add.text(LX + 10, 32, leg.name.toUpperCase(), {
      fontFamily: "Georgia, serif", fontSize: "15px", fontStyle: "bold", color: "#4a1220"
    }));

    L.add(this.add.text(LX + 10, 49, leg.title, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9.5px", color: "#7a4820"
    }));

    // Retrato da Imagem de Cinemática
    const pBox = this.add.graphics();
    const px = LX + 10, py = 66, pw = PW - 20, ph = 135;
    pBox.fillStyle(0x130a0e, 0.95).fillRoundedRect(px, py, pw, ph, 6);
    pBox.lineStyle(1.5, 0xa04058, 0.8).strokeRoundedRect(px, py, pw, ph, 6);
    L.add(pBox);

    const imgKey = leg.image;
    if (this.textures.exists(imgKey)) {
      const im = this.add.image(px + pw / 2, py + ph / 2, imgKey);
      const sc = Math.min((pw - 8) / im.width, (ph - 8) / im.height);
      im.setScale(sc);
      L.add(im);
    } else {
      L.add(this.add.text(px + pw / 2, py + ph / 2, `✦ ${leg.name} ✦`, {
        fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "bold", color: "#d8a8b8"
      }).setOrigin(0.5));
    }

    // Citação Solene
    L.add(this.add.text(LX + 10, 212, leg.quote, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9px", lineSpacing: 2, color: "#6a2034", wordWrap: { width: PW - 20 }
    }));

    // === PÁGINA DIREITA: CRÔNICA HISTÓRICA & MISTÉRIO (FONTE AMPLIADA) ===
    R.add(this.add.text(RX + 10, 32, "A HISTÓRIA ANCESTRAL", {
      fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "bold", color: "#4a1220"
    }));

    R.add(this.add.text(RX + 10, 48, leg.chronicle, {
      fontFamily: "Georgia, serif", fontSize: "9.5px", lineSpacing: 2, color: "#3a1820", wordWrap: { width: PW - 20 }
    }));

    // O Encontro / Segredo
    R.add(this.add.text(RX + 10, 126, "O ENIGMA DOS PORTAIS", {
      fontFamily: "'Courier New', monospace", fontSize: "9.5px", fontStyle: "bold", color: "#8a2840"
    }));

    R.add(this.add.text(RX + 10, 140, leg.mystery, {
      fontFamily: "Georgia, serif", fontSize: "9.5px", lineSpacing: 2, color: "#3a1820", wordWrap: { width: PW - 20 }
    }));

    // Selo de Registro Oficial
    const sG = this.add.graphics();
    const sgX = RX + 10, sgY = 228, sgW = PW - 20, sgH = 64;
    sG.fillStyle(0x280e14, 0.08).fillRoundedRect(sgX, sgY, sgW, sgH, 4);
    sG.lineStyle(1, 0x8a2840, 0.45).strokeRoundedRect(sgX, sgY, sgW, sgH, 4);
    R.add(sG);

    R.add(this.add.text(sgX + 8, sgY + 6, "REGISTRO SELADO PELAS SENTINELAS", {
      fontFamily: "'Courier New', monospace", fontSize: "8.5px", fontStyle: "bold", color: "#8a2840"
    }));

    R.add(this.add.text(sgX + 8, sgY + 20, "As revelações finais acerca da natureza do Abismo aguardam aqueles que alcançarem a Câmara do Trono e desvendarem os últimos selos.", {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "8.5px", lineSpacing: 1.5, color: "#501824", wordWrap: { width: sgW - 16 }
    }));
  }

  close() {
    if (this.__closing) return;
    this.__closing = true;
    window.removeEventListener("keydown", this.__kd);
    this.scene.stop();
    if (this.from) this.scene.resume(this.from);
  }
}'''

def apply_patch():
    files = [
        'assets/index-D6qIWtA7-p209.js',
        'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
    ]
    
    start_marker = 'class __CodexScene extends j.Scene {'
    end_marker = 'class __BookScene extends j.Scene {'
    
    for fpath in files:
        print(f"Patching {fpath}...")
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()

        idx1 = content.find(start_marker)
        idx2 = content.find(end_marker)
        if idx1 == -1 or idx2 == -1:
            raise ValueError(f"Could not find markers in {fpath}")

        content = content[:idx1] + NEW_CODEX_SCENE_JS + '\n\n' + content[idx2:]
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  Successfully patched {fpath}")

if __name__ == '__main__':
    apply_patch()
