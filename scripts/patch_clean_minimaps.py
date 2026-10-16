# -*- coding: utf-8 -*-
"""
Patch for DepthGate Codex:
Remove the sector/room squares and labels from the mini-maps,
leaving purely the authentic visual top-down graphical battlemap art!
"""

import os

CLEAN_RENDER_BIOME_PAGE = '''renderBiomePage(idx, LX, RX, PW) {
    const b = __CODEX_BIOMES[idx];
    if (!b) return;
    const L = this.L, R = this.R;

    // === PÁGINA ESQUERDA: MAPA DO NÍVEL & TOPOGRAFIA OFICIAL ===
    L.add(this.add.text(LX + 10, 32, b.name.toUpperCase(), {
      fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "bold", color: "#2b190c"
    }));

    L.add(this.add.text(LX + 10, 48, `Topografia • ${b.title}`, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9px", color: "#7a5c36"
    }));

    // Canvas do Mapa Topográfico
    const mapG = this.add.graphics();
    const mapX = LX + 8, mapY = 60, mapW = PW - 16, mapH = 138;

    // Moldura base de pergaminho escuro
    mapG.fillStyle(0x130e09, 0.95).fillRoundedRect(mapX, mapY, mapW, mapH, 6);
    mapG.lineStyle(1.5, 0x8a6230, 0.85).strokeRoundedRect(mapX, mapY, mapW, mapH, 6);
    L.add(mapG);

    // IMAGEM REAL DO MAPA DO NÍVEL (SOMENTE PARTE GRÁFICA, PURA E NÍTIDA)
    const mapKey = `codex-map-${b.id}`;
    if (this.textures.exists(mapKey)) {
      const mapImg = this.add.image(mapX + mapW / 2, mapY + mapH / 2, mapKey);
      mapImg.setDisplaySize(mapW - 6, mapH - 6);
      L.add(mapImg);

      // Vinheta sutil de borda para perfeita integração à página
      const vig = this.add.graphics();
      vig.lineStyle(3, 0x160f0a, 0.65).strokeRoundedRect(mapX + 2, mapY + 2, mapW - 4, mapH - 4, 5);
      vig.lineStyle(1, 0xc9a24a, 0.75).strokeRoundedRect(mapX + 1, mapY + 1, mapW - 2, mapH - 2, 6);
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

    // Rosa dos Ventos (canto superior direito)
    const roseX = mapX + mapW - 14, roseY = mapY + 14;
    fg.fillStyle(0x0a0705, 0.8).fillCircle(roseX, roseY, 10);
    fg.lineStyle(1, 0xc9a24a, 0.85).strokeCircle(roseX, roseY, 10);
    fg.lineStyle(1.5, 0xc9a24a, 1);
    fg.strokeLineShape(new Phaser.Geom.Line(roseX, roseY - 9, roseX, roseY + 9));
    fg.strokeLineShape(new Phaser.Geom.Line(roseX - 9, roseY, roseX + 9, roseY));
    fg.fillStyle(0xdf3824, 1).fillTriangle(roseX, roseY - 9, roseX - 2.5, roseY - 1, roseX + 2.5, roseY - 1);
    fg.fillStyle(0xecd79b, 0.8).fillTriangle(roseX, roseY + 9, roseX - 2, roseY + 1, roseX + 2, roseY + 1);
    L.add(this.add.text(roseX, roseY - 10, "N", { fontFamily: "'Courier New', monospace", fontSize: "7px", fontStyle: "bold", color: "#ecd79b" }).setOrigin(0.5, 1));

    // Barra de escala cartográfica (canto inferior esquerdo)
    fg.lineStyle(1, 0xc9a24a, 0.8);
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + 8, mapY + mapH - 7, mapX + 42, mapY + mapH - 7));
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + 8, mapY + mapH - 9, mapX + 8, mapY + mapH - 5));
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + 25, mapY + mapH - 8, mapX + 25, mapY + mapH - 6));
    fg.strokeLineShape(new Phaser.Geom.Line(mapX + 42, mapY + mapH - 9, mapX + 42, mapY + mapH - 5));
    L.add(this.add.text(mapX + 25, mapY + mapH - 11, "50 braças", { fontFamily: "'Courier New', monospace", fontSize: "6.5px", color: "#b89e6e" }).setOrigin(0.5, 1));

    // Fita cartouche
    L.add(this.add.text(mapX + 10, mapY + 5, "VISTA TOPOGRÁFICA DO REINO", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#ecd79b"
    }));
    L.add(fg);

    // Painel de Parâmetros Geográficos & Ameaças
    const legY = 204;
    const hudBox = this.add.graphics();
    hudBox.fillStyle(0x130e09, 0.08).fillRoundedRect(LX + 8, legY, PW - 16, 88, 4);
    hudBox.lineStyle(1, 0x8a6230, 0.45).strokeRoundedRect(LX + 8, legY, PW - 16, 88, 4);
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
      const yy = legY + 16 + i * 16;
      L.add(this.add.text(LX + 12, yy, k, {
        fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#7a6244"
      }));
      L.add(this.add.text(LX + 82, yy, v, {
        fontFamily: "Georgia, serif", fontSize: "8px", color: c, wordWrap: { width: PW - 94 }
      }));
    });

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
  }'''

def apply_patch():
    files = [
        'assets/index-D6qIWtA7-p209.js',
        'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
    ]

    for fpath in files:
        print(f"Patching {fpath}...")
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Replace renderBiomePage and remove updateRoomBriefing
        b_start = content.find('renderBiomePage(idx, LX, RX, PW) {')
        h_start = content.find('renderHeroPage(idx, LX, RX, PW) {', b_start)
        sec2_idx = content.rfind('// --- Se', b_start, h_start)
        if sec2_idx == -1: sec2_idx = h_start

        if b_start != -1:
            content = content[:b_start] + CLEAN_RENDER_BIOME_PAGE + '\n\n  ' + content[sec2_idx:]
            print("  Replaced renderBiomePage with clean visual map.")

        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Saved {fpath}")

if __name__ == '__main__':
    apply_patch()
