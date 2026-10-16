# -*- coding: utf-8 -*-
"""
Patch for DepthGate Codex:
1. Fix hero sprites: restore mk4b-* (official 128x128 animated character sprites used in ClassSelect)
2. Add real top-down battlemaps in the visual style of the attached image (desert_preview / volcano_preview / battlemap chunks)
"""

import os
import re

PRELOAD_INJECTION = 'for(const m of["forest","castle","catacombs","ruins","temple","glacial","vulcao","fortress","bosque","rio","morta"])this.load.image("codex-map-"+m,"assets/images/codex_maps/map_"+m+".jpg");'

HERO_SPRITES_REPLACEMENTS = [
    ('spriteKey: "player-warrior"', 'spriteKey: "mk4b-warrior"'),
    ('spriteKey: "player-berserker"', 'spriteKey: "mk4b-berserker"'),
    ('spriteKey: "player-archer"', 'spriteKey: "mk4b-archer"'),
    ('spriteKey: "player-mage"', 'spriteKey: "mk4b-mage"'),
    ('spriteKey: "player-rogue"', 'spriteKey: "mk4b-rogue"'),
    ('spriteKey: "player-necromancer"', 'spriteKey: "mk4b-necromancer"'),
    ('spriteKey: "player-hunter"', 'spriteKey: "mk4b-hunter"'),
    ('spriteKey: "player-shaman"', 'spriteKey: "mk4b-shaman"'),
    ('spriteKey: "player-paladin"', 'spriteKey: "mk4b-paladin"'),
]

NEW_RENDER_BIOME_PAGE = '''renderBiomePage(idx, LX, RX, PW) {
    const b = __CODEX_BIOMES[idx];
    if (!b) return;
    const L = this.L, R = this.R;

    // === PÁGINA ESQUERDA: MAPA DO NÍVEL & TOPOGRAFIA OFICIAL ===
    L.add(this.add.text(LX + 10, 32, b.name.toUpperCase(), {
      fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "bold", color: "#2b190c"
    }));

    L.add(this.add.text(LX + 10, 48, `Mapa do Nível • ${b.title}`, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9px", color: "#7a5c36"
    }));

    // Canvas do Mapa Topográfico
    const mapG = this.add.graphics();
    const mapX = LX + 8, mapY = 62, mapW = PW - 16, mapH = 132;

    // Moldura base de pergaminho escuro
    mapG.fillStyle(0x130e09, 0.95).fillRoundedRect(mapX, mapY, mapW, mapH, 6);
    mapG.lineStyle(1.5, 0x8a6230, 0.85).strokeRoundedRect(mapX, mapY, mapW, mapH, 6);
    L.add(mapG);

    // IMAGEM REAL DO MAPA DO NÍVEL (Estilo top-down autêntico do jogo)
    const mapKey = `codex-map-${b.id}`;
    if (this.textures.exists(mapKey)) {
      const mapImg = this.add.image(mapX + mapW / 2, mapY + mapH / 2, mapKey);
      mapImg.setDisplaySize(mapW - 6, mapH - 6);
      L.add(mapImg);

      // Vinheta de borda para integração ao livro
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
    L.add(fg);

    // Pins e Câmaras Táticas posicionadas sobre o mapa
    const cellW = (mapW - 30) / 9, cellH = (mapH - 28) / 8;
    b.rooms.forEach((rm, rIdx) => {
      const rx = mapX + 16 + (rm.x - 1) * cellW;
      const ry = mapY + 14 + (rm.y - 1) * cellH;
      const rw = Math.max(26, rm.w * cellW);
      const rh = Math.max(14, rm.h * cellH);

      const rG = this.add.graphics();
      let pinColor = 0x1e3624, borderColor = 0x56a066, textColor = "#e6dcc8", prefix = "";

      if (rm.boss) {
        pinColor = 0x4a1210; borderColor = 0xe23c2c; textColor = "#ff9a8a"; prefix = "☠ ";
      } else if (rm.secret) {
        pinColor = 0x2d123d; borderColor = 0xb04fe6; textColor = "#deb8ff"; prefix = "★ ";
      } else if (rIdx === 0) {
        pinColor = 0x122434; borderColor = 0x38a0d4; textColor = "#9fe2ff"; prefix = "◈ ";
      }

      // Caixa de identificação com sombra
      rG.fillStyle(0x060403, 0.7).fillRoundedRect(rx - rw / 2 + 1, ry - rh / 2 + 1, rw, rh, 3);
      rG.fillStyle(pinColor, 0.9).fillRoundedRect(rx - rw / 2, ry - rh / 2, rw, rh, 3);
      rG.lineStyle(1.2, borderColor, 0.9).strokeRoundedRect(rx - rw / 2, ry - rh / 2, rw, rh, 3);
      L.add(rG);

      const lbl = this.add.text(rx, ry, prefix + rm.label, {
        fontFamily: "'Courier New', monospace", fontSize: "7px", fontStyle: "bold", color: textColor
      }).setOrigin(0.5);
      L.add(lbl);

      const hitZone = this.add.zone(rx, ry, rw + 6, rh + 6).setOrigin(0.5).setInteractive({ useHandCursor: true });
      hitZone.on("pointerdown", () => {
        this.game.audioEngine?.sfx("sfx-ui-click");
        this.updateRoomBriefing(b, rm, rIdx);
      });
      hitZone.on("pointerover", () => { lbl.setColor("#ffff55"); rG.lineStyle(2, 0xffd24a, 1).strokeRoundedRect(rx - rw / 2, ry - rh / 2, rw, rh, 3); });
      hitZone.on("pointerout", () => { lbl.setColor(textColor); rG.lineStyle(1.2, borderColor, 0.9).strokeRoundedRect(rx - rw / 2, ry - rh / 2, rw, rh, 3); });
      L.add(hitZone);
    });

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

    // Fita cartouche
    L.add(this.add.text(mapX + 10, mapY + 5, "VISTA TOPOGRÁFICA DO REINO", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#ecd79b"
    }));

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
  }'''

NEW_RENDER_HERO_PAGE = '''renderHeroPage(idx, LX, RX, PW) {
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

    // Sprite do Campeão animado oficial (mesmo do ClassSelect)
    const sKey = h.spriteKey;
    if (this.textures.exists(sKey)) {
      const layout = this.cache?.json?.get?.(`${sKey}-layout`);
      const footY = (layout?.footY ?? 119) / 128;
      const sp = this.add.sprite(fx + fw / 2, fy + fh - 12, sKey, 0)
        .setScale(1.5 * (layout?.hires ?? 1))
        .setOrigin(0.5, footY);
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

        # 1. Inject preload loading of codex maps
        if 'codex-map-' not in content:
            marker = 'this.load.image("logo-dark-epic","assets/ui/dark-epic-dungeons-logo.png");'
            if marker in content:
                content = content.replace(marker, marker + PRELOAD_INJECTION)
                print("  Injected codex-map loading into preload.")
            else:
                print("  Warning: preload marker not found!")

        # 2. Replace spriteKey in __CODEX_HEROES
        for old_sk, new_sk in HERO_SPRITES_REPLACEMENTS:
            if old_sk in content:
                content = content.replace(old_sk, new_sk)
        print("  Updated hero sprite keys to mk4b-*.")

        # 3. Replace renderBiomePage
        b_start = content.find('renderBiomePage(idx, LX, RX, PW) {')
        b_end = content.find('updateRoomBriefing(b, rm, rIdx) {', b_start)
        if b_start != -1 and b_end != -1:
            content = content[:b_start] + NEW_RENDER_BIOME_PAGE + '\n\n  ' + content[b_end:]
            print("  Updated renderBiomePage with real battlemap display.")

        # 4. Replace renderHeroPage
        h_start = content.find('renderHeroPage(idx, LX, RX, PW) {')
        h_end = content.find('renderLegendPage(idx, LX, RX, PW) {', h_start)
        # Find the comment '// --- Seção III: Lendas das Profundezas' right before renderLegendPage
        sec3_idx = content.rfind('// --- Se', h_start, h_end)
        if sec3_idx == -1: sec3_idx = h_end
        if h_start != -1:
            content = content[:h_start] + NEW_RENDER_HERO_PAGE + '\n\n  ' + content[sec3_idx:]
            print("  Updated renderHeroPage with layout origin and scale.")

        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Saved {fpath}")

if __name__ == '__main__':
    apply_patch()
