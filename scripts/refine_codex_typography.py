import os
import re

# Create updated standardized_codex.js with dynamic vertical flow and lineSpacing: 5
orig = open('scripts/standardized_codex.js', 'r', encoding='utf-8').read()

# Replace renderBiomePage, renderHeroPage, renderLegendPage, renderIndex
new_renderIndex = '''  renderIndex(LX, RX, PW) {
    const L = this.L, R = this.R;
    this.indexEntries = [];
    this.indexG = this.add.graphics();
    L.add(this.indexG);

    // Coluna Esquerda: Biomas (com espacamento perfeito e linhas-guia)
    L.add(this.add.text(LX + PW / 2, 36, "❖ SEÇÃO I: BIOMAS & MAPAS ❖", {
      fontFamily: "Georgia, serif", fontSize: "11px", fontStyle: "bold", color: "#2b190c"
    }).setOrigin(0.5));

    __CODEX_BIOMES.forEach((b, i) => {
      const y = 54 + i * 22;
      const numStr = (i < 9 ? "0" + (i + 1) : (i + 1));
      const t = this.add.text(LX + 12, y, `${numStr}. ${b.name}`, {
        fontFamily: "Georgia, serif", fontSize: "9.5px", fontStyle: "bold", color: "#3a2614"
      }).setInteractive({ useHandCursor: true });
      
      const pg = this.add.text(LX + PW - 12, y, `Pág ${this.BIOMES_START + i}`, {
        fontFamily: "'Courier New', monospace", fontSize: "8.5px", color: "#7a6540"
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

      const act = () => this.go(this.BIOMES_START + i);
      this.indexEntries.push({ x: LX + 10, y: y, w: PW - 20, h: 20, spread: this.BIOMES_START + i });
      t.on("pointerdown", act); pg.on("pointerdown", act);
      t.on("pointerover", () => t.setColor("#a03520")); t.on("pointerout", () => t.setColor("#3a2614"));
      L.add([t, pg]);
    });

    // Coluna Direita: Herois Convocados
    R.add(this.add.text(RX + PW / 2, 36, "❖ SEÇÃO II: HERÓIS CONVOCADOS ❖", {
      fontFamily: "Georgia, serif", fontSize: "11px", fontStyle: "bold", color: "#2b190c"
    }).setOrigin(0.5));

    __CODEX_HEROES.forEach((h, i) => {
      const y = 54 + i * 19;
      const t = this.add.text(RX + 12, y, `• ${h.name} (${h.subtitle.split('&')[0].trim()})`, {
        fontFamily: "Georgia, serif", fontSize: "9px", fontStyle: "bold", color: "#243a50"
      }).setInteractive({ useHandCursor: true });
      
      const pg = this.add.text(RX + PW - 12, y, `Pág ${this.HEROES_START + i}`, {
        fontFamily: "'Courier New', monospace", fontSize: "8.5px", color: "#6a7580"
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

      const act = () => this.go(this.HEROES_START + i);
      this.indexEntries.push({ x: RX + 10, y: y, w: PW - 20, h: 18, spread: this.HEROES_START + i });
      t.on("pointerdown", act); pg.on("pointerdown", act);
      t.on("pointerover", () => t.setColor("#a03520")); t.on("pointerout", () => t.setColor("#243a50"));
      R.add([t, pg]);
    });

    // Divisor para Lendas
    R.add(this.add.text(RX + PW / 2, 230, "❖ SEÇÃO III: LENDAS DO ABISMO ❖", {
      fontFamily: "Georgia, serif", fontSize: "10.5px", fontStyle: "bold", color: "#6a2030"
    }).setOrigin(0.5));

    __CODEX_LEGENDS.forEach((leg, i) => {
      const y = 248 + i * 22;
      const t = this.add.text(RX + 12, y, `• ${leg.name} • ${leg.role}`, {
        fontFamily: "Georgia, serif", fontSize: "9px", fontStyle: "bold", color: "#501824"
      }).setInteractive({ useHandCursor: true });

      const pg = this.add.text(RX + PW - 12, y, `Pág ${this.LEGENDS_START + i}`, {
        fontFamily: "'Courier New', monospace", fontSize: "8.5px", color: "#8a5060"
      }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

      const act = () => this.go(this.LEGENDS_START + i);
      this.indexEntries.push({ x: RX + 10, y: y, w: PW - 20, h: 18, spread: this.LEGENDS_START + i });
      t.on("pointerdown", act); pg.on("pointerdown", act);
      t.on("pointerover", () => t.setColor("#a03520")); t.on("pointerout", () => t.setColor("#501824"));
      R.add([t, pg]);
    });
  }'''

new_renderBiomePage = '''  renderBiomePage(idx, LX, RX, PW) {
    const b = __CODEX_BIOMES[idx];
    if (!b) return;
    const L = this.L, R = this.R;

    // === PÁGINA ESQUERDA: MAPA DO NÍVEL & TOPOGRAFIA OFICIAL ===
    L.add(this.add.text(LX + 10, 30, b.name.toUpperCase(), {
      fontFamily: "Georgia, serif", fontSize: "13.5px", fontStyle: "bold", color: "#2b190c"
    }));

    L.add(this.add.text(LX + 10, 47, `Topografia • ${b.title}`, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9px", color: "#7a5c36"
    }));

    // Canvas do Mapa Topográfico
    const mapG = this.add.graphics();
    const mapX = LX + 8, mapY = 60, mapW = PW - 16, mapH = 138;

    mapG.fillStyle(0x130e09, 0.95).fillRoundedRect(mapX, mapY, mapW, mapH, 6);
    mapG.lineStyle(1.5, 0x8a6230, 0.85).strokeRoundedRect(mapX, mapY, mapW, mapH, 6);
    L.add(mapG);

    // IMAGEM DO MAPA
    const mapKey = `codex-map-${b.id}`;
    if (this.textures.exists(mapKey)) {
      const mapImg = this.add.image(mapX + mapW / 2, mapY + mapH / 2, mapKey);
      mapImg.setDisplaySize(mapW - 6, mapH - 6);
      L.add(mapImg);

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
    L.add(this.add.text(mapX + 10, mapY + 5, "VISTA TOPOGRÁFICA DO REINO", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold", color: "#ecd79b"
    }));
    L.add(fg);

    // Painel de Parametros Geograficos com espacamento respirado
    const legY = 204;
    const hudBox = this.add.graphics();
    hudBox.fillStyle(0x130e09, 0.08).fillRoundedRect(LX + 8, legY, PW - 16, 92, 4);
    hudBox.lineStyle(1, 0x8a6230, 0.45).strokeRoundedRect(LX + 8, legY, PW - 16, 92, 4);
    L.add(hudBox);

    L.add(this.add.text(LX + 14, legY + 6, "DADOS CARTOGRÁFICOS & AMEAÇAS", {
      fontFamily: "'Courier New', monospace", fontSize: "8.5px", fontStyle: "bold", color: "#8a5822"
    }));

    const rows = [
      ["Grau de Perigo:", b.danger, "#a03020"],
      ["Atmosfera / Clima:", b.climate, "#4a3520"],
      ["Inimigos Típicos:", b.threat, "#3a2614"],
      ["Ameaça Suprema:", b.boss, "#8a2418"]
    ];

    rows.forEach(([k, v, c], i) => {
      const yy = legY + 18 + i * 17.5;
      L.add(this.add.text(LX + 14, yy, k, {
        fontFamily: "'Courier New', monospace", fontSize: "8px", fontStyle: "bold", color: "#7a6244"
      }));
      L.add(this.add.text(LX + 88, yy, v, {
        fontFamily: "Georgia, serif", fontSize: "8.5px", color: c, wordWrap: { width: PW - 100 }
      }));
    });

    // === PÁGINA DIREITA: CRÔNICA, SEGREDOS E DICAS (COM ESPAÇAMENTO RESPIRADO E ALTA LEGIBILIDADE) ===
    let curY = 30;
    R.add(this.add.text(RX + 10, curY, "CRÔNICA DA REGIÃO", {
      fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "bold", color: "#2b190c"
    }));

    curY += 18;
    const tChron = this.add.text(RX + 10, curY, b.chronicle, {
      fontFamily: "Georgia, serif", fontSize: "9.5px", lineSpacing: 5, color: "#3a2818", wordWrap: { width: PW - 20 }
    });
    R.add(tChron);

    curY += tChron.height + 12;
    const tSecH = this.add.text(RX + 10, curY, "❖ ARQUITETURA & SEGREDOS OCULTOS", {
      fontFamily: "'Courier New', monospace", fontSize: "9px", fontStyle: "bold", color: "#8a5822"
    });
    R.add(tSecH);

    curY += tSecH.height + 4;
    const tSec = this.add.text(RX + 10, curY, b.secrets, {
      fontFamily: "Georgia, serif", fontSize: "9.5px", lineSpacing: 5, color: "#4a3520", wordWrap: { width: PW - 20 }
    });
    R.add(tSec);

    curY += tSec.height + 10;
    const tbBoxH = Math.min(312 - curY, 80);
    if (tbBoxH > 35) {
      const tipBox = this.add.graphics();
      tipBox.fillStyle(0x130e09, 0.08).fillRoundedRect(RX + 8, curY, PW - 16, tbBoxH, 4);
      tipBox.lineStyle(1, 0x8a6230, 0.5).strokeRoundedRect(RX + 8, curY, PW - 16, tbBoxH, 4);
      R.add(tipBox);

      R.add(this.add.text(RX + 14, curY + 6, "CONSELHO DO EXPLORADOR:", {
        fontFamily: "'Courier New', monospace", fontSize: "8.5px", fontStyle: "bold", color: "#8a5822"
      }));

      R.add(this.add.text(RX + 14, curY + 20, b.tip, {
        fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9px", lineSpacing: 4.5, color: "#3a2818", wordWrap: { width: PW - 28 }
      }));
    }
  }'''

new_renderHeroPage = '''  renderHeroPage(idx, LX, RX, PW) {
    const h = __CODEX_HEROES[idx];
    if (!h) return;
    const L = this.L, R = this.R;

    // === PÁGINA ESQUERDA: ILUSTRAÇÃO DO HERÓI & DADOS ===
    L.add(this.add.text(LX + 10, 30, h.name.toUpperCase(), {
      fontFamily: "Georgia, serif", fontSize: "15px", fontStyle: "bold", color: "#1c2e42"
    }));

    L.add(this.add.text(LX + 10, 47, h.subtitle, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9.5px", color: "#6a523a"
    }));

    // Moldura do Retrato / Sprite
    const fBox = this.add.graphics();
    const fx = LX + 10, fy = 64, fw = PW - 20, fh = 108;
    fBox.fillStyle(0x0e141c, 0.95).fillRoundedRect(fx, fy, fw, fh, 6);
    fBox.lineStyle(1.5, 0x4a78a0, 0.75).strokeRoundedRect(fx, fy, fw, fh, 6);
    L.add(fBox);

    // Sprite do Campeao animado oficial
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

    // Informacoes da Origem Cosmica com espacamento limpo
    const infoY = 178;
    const items = [
      ["Era de Origem:", h.era],
      ["Plano / Dimensão:", h.dimension],
      ["Papel Tático:", h.role],
      ["Arma & Estilo:", h.weapon]
    ];

    items.forEach(([lbl, val], i) => {
      const yy = infoY + i * 27;
      L.add(this.add.text(LX + 10, yy, lbl, {
        fontFamily: "'Courier New', monospace", fontSize: "8.5px", fontStyle: "bold", color: "#5a7288"
      }));
      L.add(this.add.text(LX + 10, yy + 11, val, {
        fontFamily: "Georgia, serif", fontSize: "9px", color: "#243648", wordWrap: { width: PW - 20 }
      }));
    });

    // === PÁGINA DIREITA: BIOGRAFIA & HABILIDADES (FLUXO DINÂMICO E ALTA LEGIBILIDADE) ===
    let curY = 30;
    R.add(this.add.text(RX + 10, curY, "BIOGRAFIA & CONVOCAÇÃO", {
      fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "bold", color: "#1c2e42"
    }));

    curY += 18;
    const tLore = this.add.text(RX + 10, curY, h.lore, {
      fontFamily: "Georgia, serif", fontSize: "9.5px", lineSpacing: 5, color: "#243648", wordWrap: { width: PW - 20 }
    });
    R.add(tLore);

    curY += tLore.height + 10;
    const tMotH = this.add.text(RX + 10, curY, "MOTIVAÇÃO NA CAMPANHA:", {
      fontFamily: "'Courier New', monospace", fontSize: "9px", fontStyle: "bold", color: "#6a4a20"
    });
    R.add(tMotH);

    curY += tMotH.height + 4;
    const tMot = this.add.text(RX + 10, curY, h.motivation, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9px", lineSpacing: 4.5, color: "#3a2818", wordWrap: { width: PW - 20 }
    });
    R.add(tMot);

    curY += tMot.height + 10;
    const skBoxH = Math.min(312 - curY, 114);
    if (skBoxH > 40) {
      const skBox = this.add.graphics();
      skBox.fillStyle(0x0e141c, 0.08).fillRoundedRect(RX + 8, curY, PW - 16, skBoxH, 4);
      skBox.lineStyle(1, 0x4a78a0, 0.5).strokeRoundedRect(RX + 8, curY, PW - 16, skBoxH, 4);
      R.add(skBox);

      R.add(this.add.text(RX + 14, curY + 6, "ARSENAL & HABILIDADES:", {
        fontFamily: "'Courier New', monospace", fontSize: "8.5px", fontStyle: "bold", color: "#204a70"
      }));

      h.abilities.forEach((ab, i) => {
        const abY = curY + 20 + i * 29;
        if (abY + 20 <= curY + skBoxH) {
          R.add(this.add.text(RX + 14, abY, `• ${ab}`, {
            fontFamily: "Georgia, serif", fontSize: "9px", lineSpacing: 3.5, color: "#203040", wordWrap: { width: PW - 28 }
          }));
        }
      });
    }
  }'''

new_renderLegendPage = '''  renderLegendPage(idx, LX, RX, PW) {
    const leg = __CODEX_LEGENDS[idx];
    if (!leg) return;
    const L = this.L, R = this.R;

    // === PÁGINA ESQUERDA: RETRATO DA LENDA ===
    L.add(this.add.text(LX + 10, 30, leg.name.toUpperCase(), {
      fontFamily: "Georgia, serif", fontSize: "15px", fontStyle: "bold", color: "#4a1220"
    }));

    L.add(this.add.text(LX + 10, 47, leg.title, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9.5px", color: "#7a4820"
    }));

    // Retrato da Imagem de Cinematica
    const pBox = this.add.graphics();
    const px = LX + 10, py = 64, pw = PW - 20, ph = 135;
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
      L.add(this.add.text(px + pw / 2, py + ph / 2, `❖ ${leg.name} ❖`, {
        fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "bold", color: "#d8a8b8"
      }).setOrigin(0.5));
    }

    // Citacao Solene
    L.add(this.add.text(LX + 10, 212, leg.quote, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "9.5px", lineSpacing: 4.5, color: "#6a2034", wordWrap: { width: PW - 20 }
    }));

    // === PÁGINA DIREITA: CRÔNICA HISTÓRICA & MISTÉRIO (COM ESPAÇAMENTO RESPIRADO) ===
    let curY = 30;
    R.add(this.add.text(RX + 10, curY, "A HISTÓRIA ANCESTRAL", {
      fontFamily: "Georgia, serif", fontSize: "13px", fontStyle: "bold", color: "#4a1220"
    }));

    curY += 18;
    const tChron = this.add.text(RX + 10, curY, leg.chronicle, {
      fontFamily: "Georgia, serif", fontSize: "9.5px", lineSpacing: 5, color: "#3a1820", wordWrap: { width: PW - 20 }
    });
    R.add(tChron);

    curY += tChron.height + 12;
    const tEnigH = this.add.text(RX + 10, curY, "❖ O ENIGMA DOS PORTAIS", {
      fontFamily: "'Courier New', monospace", fontSize: "9px", fontStyle: "bold", color: "#8a2840"
    });
    R.add(tEnigH);

    curY += tEnigH.height + 4;
    const tEnig = this.add.text(RX + 10, curY, leg.mystery, {
      fontFamily: "Georgia, serif", fontSize: "9.5px", lineSpacing: 5, color: "#3a1820", wordWrap: { width: PW - 20 }
    });
    R.add(tEnig);

    curY += tEnig.height + 10;
    const sgBoxH = Math.min(312 - curY, 66);
    if (sgBoxH > 35) {
      const sG = this.add.graphics();
      sG.fillStyle(0x280e14, 0.08).fillRoundedRect(RX + 8, curY, PW - 16, sgBoxH, 4);
      sG.lineStyle(1, 0x8a2840, 0.45).strokeRoundedRect(RX + 8, curY, PW - 16, sgBoxH, 4);
      R.add(sG);

      R.add(this.add.text(RX + 14, curY + 6, "REGISTRO SELADO PELAS SENTINELAS", {
        fontFamily: "'Courier New', monospace", fontSize: "8.5px", fontStyle: "bold", color: "#8a2840"
      }));

      R.add(this.add.text(RX + 14, curY + 20, "As revelações finais acerca da natureza do Abismo aguardam aqueles que alcançarem a Câmara do Trono e desvendarem os últimos selos.", {
        fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "8.5px", lineSpacing: 4, color: "#501824", wordWrap: { width: PW - 28 }
      }));
    }
  }'''

# Locate and replace each method in orig
def replace_method(source, method_name, new_method):
    pattern = r'  ' + method_name + r'\([^\)]*\)\s*\{'
    m = re.search(pattern, source)
    if not m:
        print("Could not find", method_name)
        return source
    start_pos = m.start()
    # Find matching brace
    brace_count = 0
    i = source.find('{', start_pos)
    end_pos = i
    for j in range(i, len(source)):
        if source[j] == '{': brace_count += 1
        elif source[j] == '}':
            brace_count -= 1
            if brace_count == 0:
                end_pos = j + 1
                break
    return source[:start_pos] + new_method + source[end_pos:]

orig = replace_method(orig, 'renderIndex', new_renderIndex)
orig = replace_method(orig, 'renderBiomePage', new_renderBiomePage)
orig = replace_method(orig, 'renderHeroPage', new_renderHeroPage)
orig = replace_method(orig, 'renderLegendPage', new_renderLegendPage)

open('scripts/standardized_codex.js', 'w', encoding='utf-8').write(orig)
print("Updated standardized_codex.js with high-readability typography!")
