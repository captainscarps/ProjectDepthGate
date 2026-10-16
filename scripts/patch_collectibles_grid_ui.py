# -*- coding: utf-8 -*-
"""
Script de atualização do Menu de Colecionáveis:
- Visualização em GRID (grade 4x3 de slots)
- As informações completas são mostradas ao clicar/tocar em cada slot
- Colecionáveis não encontrados ficam ocultos, mostrando APENAS a silhueta misteriosa escura
- Nenhuma localização é mostrada (nem mapa, nem pistas de onde encontrar)
- Visual 100% no padrão de UI do jogo (__ornatePanel, __softPanel, bordas douradas, touch 44x44px com Gt)
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js"),
]

def apply_patches():
    with open(TARGETS[0], "r", encoding="utf-8") as f:
        src = f.read()

    orig_len = len(src)
    print(f"Lendo {TARGETS[0]} ({orig_len} bytes)")

    # Localizar class __CollectiblesScene atual
    start_pos = src.find('class __CollectiblesScene extends j.Scene {')
    assert start_pos != -1, "class __CollectiblesScene não encontrada"
    end_pos = src.find('class __BookScene extends j.Scene {', start_pos)
    assert end_pos != -1, "class __BookScene não encontrada"

    new_collectibles_scene = '''class __CollectiblesScene extends j.Scene {
  constructor() { super("CollectiblesBook"); }
  init(d) {
    this.from = d?.from ?? null;
    this.__closing = !1;
    this.selected = 0;
  }
  create() {
    le(this);
    this.collected = __getCollectedRelics();
    this.total = __CAMPAIGN_RELICS.length;
    this.count = Object.keys(this.collected).filter(id => __CAMPAIGN_RELICS.some(r => r.id === id)).length;
    this.cx = Math.round(_ / 2);
    this.cy = Math.round(st / 2);

    // Fundo escuro com vinheta
    this.add.rectangle(this.cx, this.cy, _ * 1.5, st * 1.5, 0x050403, 0.88).setInteractive();

    // Painel Ornato no padrão oficial da UI
    this.panelG = this.add.graphics();
    const pw = 580, ph = 320, px = this.cx - pw / 2, py = this.cy - ph / 2;
    if (typeof __ornatePanel === "function") {
      __ornatePanel(this.panelG, px, py, pw, ph);
    } else {
      this.panelG.fillStyle(0x130e0a, 0.98).fillRoundedRect(px, py, pw, ph, 12);
      this.panelG.lineStyle(2, 0xc9a24a, 0.85).strokeRoundedRect(px, py, pw, ph, 12);
    }

    // Cabeçalho da Janela
    this.add.text(this.cx, py + 22, "✦ RELÍQUIAS DA CAMPANHA ✦", {
      fontFamily: "Georgia, serif", fontSize: "14px", fontStyle: "bold", color: "#ffd24a"
    }).setOrigin(0.5);

    const pct = Math.round((this.count / this.total) * 100);
    this.add.text(this.cx, py + 38, `Colecionáveis Resgatados: ${this.count} / ${this.total} (${pct}%) · Toque em um item para examinar`, {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", color: "#a89468"
    }).setOrigin(0.5);

    // Divisor dourado sutil
    this.panelG.lineStyle(1, 0xc9a24a, 0.35).lineBetween(px + 20, py + 48, px + pw - 20, py + 48);

    // Container do Grid (Lado Esquerdo)
    this.gridContainer = this.add.container(0, 0);
    this.slotCards = [];
    this.buildGrid(px + 22, py + 58);

    // Container de Detalhes (Lado Direito)
    this.detailsX = px + 288;
    this.detailsY = py + 58;
    this.detailsW = pw - 310;
    this.detailsH = ph - 105;
    this.detailsG = this.add.graphics();
    this.detailsContainer = this.add.container(0, 0);
    this.renderDetails();

    // Rodapé / Botão Voltar
    const botY = py + ph - 24;
    const closeB = this.add.text(this.cx, botY, "[ ◀ VOLTAR ]", {
      fontFamily: "'Courier New', monospace", fontSize: "10px", fontStyle: "bold", color: "#e8d8b8",
      backgroundColor: "#2b1810", padding: { x: 16, y: 7 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeB.on("pointerdown", () => this.close());
    typeof Gt === "function" && Gt(closeB, 20, 16);

    // Botão X no topo direito
    const xTop = this.add.text(px + pw - 24, py + 20, "✕", {
      fontFamily: "Arial, sans-serif", fontSize: "14px", fontStyle: "bold", color: "#d8cdb4",
      backgroundColor: "#3a1810", padding: { x: 10, y: 6 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    xTop.on("pointerdown", () => this.close());
    typeof Gt === "function" && Gt(xTop, 22, 18);

    // Teclas de atalho
    this.__kd = ev => {
      if (!this.sys.isActive()) return;
      if (ev.key === "ArrowLeft") this.select((this.selected - 1 + this.total) % this.total);
      else if (ev.key === "ArrowRight") this.select((this.selected + 1) % this.total);
      else if (ev.key === "ArrowUp") this.select((this.selected - 4 + this.total) % this.total);
      else if (ev.key === "ArrowDown") this.select((this.selected + 4) % this.total);
      else if (ev.key === "Escape" || ev.key === "Enter") this.close();
    };
    window.addEventListener("keydown", this.__kd);
  }

  buildGrid(gx, gy) {
    this.gridContainer.removeAll(true);
    this.slotCards = [];
    const cols = 4;
    const slotW = 58, slotH = 62, gapX = 8, gapY = 8;

    __CAMPAIGN_RELICS.forEach((relic, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const sx = gx + col * (slotW + gapX);
      const sy = gy + row * (slotH + gapY);
      const isCollected = !!this.collected[relic.id];
      const isSel = this.selected === i;

      // Gráficos do Slot
      const g = this.add.graphics();
      this.drawSlotBox(g, sx, sy, slotW, slotH, isCollected, isSel);
      this.gridContainer.add(g);

      // Número do Slot
      const numTxt = this.add.text(sx + 5, sy + 4, `#${i < 9 ? "0" + (i + 1) : (i + 1)}`, {
        fontFamily: "'Courier New', monospace", fontSize: "7px", color: isCollected ? "#8ae0b0" : "#5a4530"
      });
      this.gridContainer.add(numTxt);

      // Ícone / Silhueta do Colecionável
      if (isCollected) {
        const colInt = parseInt(relic.color.replace("#", "0x")) || 0xffd24a;
        const ico = this.add.sprite(sx + slotW / 2, sy + slotH / 2 + 2, relic.icon || "icon-fragment")
          .setScale(1.25)
          .setTint(colInt);
        this.gridContainer.add(ico);

        // Selo de coletado no canto
        const chk = this.add.text(sx + slotW - 6, sy + 3, "✔", {
          fontFamily: "Arial, sans-serif", fontSize: "7px", color: "#8ae0b0"
        }).setOrigin(1, 0);
        this.gridContainer.add(chk);
      } else {
        // SILHUETA MISTERIOSA: Sprite tingido de preto/sombra sem revelar o item
        const sil = this.add.sprite(sx + slotW / 2, sy + slotH / 2 + 2, relic.icon || "icon-fragment")
          .setScale(1.25)
          .setTint(0x1a1510)
          .setAlpha(0.65);
        this.gridContainer.add(sil);

        const qMark = this.add.text(sx + slotW / 2, sy + slotH / 2 + 2, "?", {
          fontFamily: "Georgia, serif", fontSize: "16px", fontStyle: "bold", color: "#4a3520"
        }).setOrigin(0.5);
        this.gridContainer.add(qMark);
      }

      // Zona Interativa (Click/Touch)
      const zone = this.add.zone(sx, sy, slotW, slotH).setOrigin(0).setInteractive({ useHandCursor: true });
      zone.on("pointerdown", () => this.select(i));
      typeof Gt === "function" && Gt(zone, 18, 16);
      this.gridContainer.add(zone);

      this.slotCards.push({ g, sx, sy, slotW, slotH, isCollected, i });
    });
  }

  drawSlotBox(g, x, y, w, h, isCollected, isSel) {
    g.clear();
    // Fundo do slot
    g.fillStyle(isSel ? 0x22180e : (isCollected ? 0x140e08 : 0x0a0806), 0.95);
    g.fillRoundedRect(x, y, w, h, 6);

    // Bordas
    if (isSel) {
      g.lineStyle(2, 0xffd24a, 1).strokeRoundedRect(x, y, w, h, 6);
      g.lineStyle(1, 0xffea88, 0.4).strokeRoundedRect(x - 2, y - 2, w + 4, h + 4, 8);
    } else if (isCollected) {
      g.lineStyle(1.5, 0xc9a24a, 0.75).strokeRoundedRect(x, y, w, h, 6);
    } else {
      g.lineStyle(1, 0x3a2c1e, 0.6).strokeRoundedRect(x, y, w, h, 6);
    }
  }

  select(i) {
    if (this.selected === i) return;
    const old = this.selected;
    this.selected = i;

    // Atualizar caixas de seleção no grid
    if (this.slotCards[old]) {
      const c = this.slotCards[old];
      this.drawSlotBox(c.g, c.sx, c.sy, c.slotW, c.slotH, c.isCollected, !1);
    }
    if (this.slotCards[i]) {
      const c = this.slotCards[i];
      this.drawSlotBox(c.g, c.sx, c.sy, c.slotW, c.slotH, c.isCollected, !0);
    }

    this.renderDetails();
  }

  renderDetails() {
    this.detailsG.clear();
    this.detailsContainer.removeAll(true);

    const relic = __CAMPAIGN_RELICS[this.selected];
    const isCollected = !!this.collected[relic.id];
    const dx = this.detailsX, dy = this.detailsY, dw = this.detailsW, dh = this.detailsH;

    // Painel de Detalhes no padrão __softPanel
    if (typeof __softPanel === "function") {
      __softPanel(this.detailsG, dx, dy, dw, dh);
    } else {
      this.detailsG.fillStyle(0x0e0a07, 0.95).fillRoundedRect(dx, dy, dw, dh, 6);
      this.detailsG.lineStyle(1, 0x5a4228, 0.6).strokeRoundedRect(dx, dy, dw, dh, 6);
    }

    // Moldura do Ícone
    const icoBox = this.add.graphics();
    icoBox.fillStyle(0x0a0705, 0.95).fillRoundedRect(dx + 12, dy + 12, 60, 60, 4);
    icoBox.lineStyle(1, isCollected ? 0xc9a24a : 0x3a281a, 0.8).strokeRoundedRect(dx + 12, dy + 12, 60, 60, 4);
    this.detailsContainer.add(icoBox);

    if (isCollected) {
      const colInt = parseInt(relic.color.replace("#", "0x")) || 0xffd24a;
      const ico = this.add.sprite(dx + 42, dy + 42, relic.icon || "icon-fragment").setScale(1.8).setTint(colInt);
      this.detailsContainer.add(ico);
    } else {
      // Silhueta no painel de detalhes
      const sil = this.add.sprite(dx + 42, dy + 42, relic.icon || "icon-fragment").setScale(1.8).setTint(0x1a1510).setAlpha(0.7);
      this.detailsContainer.add(sil);
      const q = this.add.text(dx + 42, dy + 42, "?", {
        fontFamily: "Georgia, serif", fontSize: "24px", fontStyle: "bold", color: "#4a3520"
      }).setOrigin(0.5);
      this.detailsContainer.add(q);
    }

    // Título e Status (SEM NENHUMA LOCALIZAÇÃO)
    const titleTxt = this.add.text(dx + 82, dy + 14, isCollected ? relic.name : "??? (Relíquia Oculta)", {
      fontFamily: "Georgia, serif", fontSize: "12px", fontStyle: "bold",
      color: isCollected ? "#ffd24a" : "#7d6648"
    });
    this.detailsContainer.add(titleTxt);

    const stTag = this.add.text(dx + 82, dy + 32, isCollected ? "✔ COLECIONÁVEL RESGATADO" : "✖ NÃO LOCALIZADO", {
      fontFamily: "'Courier New', monospace", fontSize: "7.5px", fontStyle: "bold",
      color: isCollected ? "#8ae0b0" : "#a85040"
    });
    this.detailsContainer.add(stTag);

    const numTxt = this.add.text(dx + 82, dy + 46, `Registro Arcano #${this.selected < 9 ? "0" + (this.selected + 1) : (this.selected + 1)} de ${this.total}`, {
      fontFamily: "'Courier New', monospace", fontSize: "7px", color: "#8a7860"
    });
    this.detailsContainer.add(numTxt);

    // Divisor
    this.detailsG.lineStyle(1, 0x4a3822, 0.4).lineBetween(dx + 12, dy + 80, dx + dw - 12, dy + 80);

    // Descrição
    const desc = isCollected ? relic.desc : "Uma relíquia ancestral esquecida nas profundezas. Seu paradeiro permanece um enigma até que você a descubra em suas jornadas.";
    const descTxt = this.add.text(dx + 12, dy + 88, desc, {
      fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "8px", color: "#d8cdb4", wordWrap: { width: dw - 24 }
    });
    this.detailsContainer.add(descTxt);

    // Caixa de Curiosidade da Campanha
    const curBox = this.add.graphics();
    const cbX = dx + 10, cbY = dy + 124, cbW = dw - 20, cbH = dh - 132;
    curBox.fillStyle(0x090604, 0.95).fillRoundedRect(cbX, cbY, cbW, cbH, 4);
    curBox.lineStyle(1, isCollected ? 0xc9a24a : 0x3a281a, 0.5).strokeRoundedRect(cbX, cbY, cbW, cbH, 4);
    this.detailsContainer.add(curBox);

    const curTitle = this.add.text(cbX + 8, cbY + 6, isCollected ? "✦ CURIOSIDADE DA CAMPANHA ✦" : "✦ SEGREDO OCULTO ✦", {
      fontFamily: "'Courier New', monospace", fontSize: "7px", fontStyle: "bold", color: isCollected ? "#ffd24a" : "#7d6648"
    });
    this.detailsContainer.add(curTitle);

    const curText = isCollected
      ? relic.curiosity
      : "As memórias, crônicas e segredos deste artefato permanecem selados pelas brumas do tempo. Explore os caminhos e salas da campanha para encontrá-lo e revelar sua história.";
    const curBody = this.add.text(cbX + 8, cbY + 19, curText, {
      fontFamily: "Georgia, serif", fontSize: "7.5px", lineSpacing: 2, color: isCollected ? "#f4ebd0" : "#7a6e5a", wordWrap: { width: cbW - 16 }
    });
    this.detailsContainer.add(curBody);
  }

  close() {
    if (this.__closing) return;
    this.__closing = !0;
    window.removeEventListener("keydown", this.__kd);
    this.scene.stop();
    if (this.from) this.scene.resume(this.from);
  }
}
'''

    src = src[:start_pos] + new_collectibles_scene + src[end_pos:]
    print("Sucesso: __CollectiblesScene atualizada com visual em Grid, Silhuetas Ocultas e sem exibição de localização!")

    # Gravar em ambos os arquivos alvo
    for target in TARGETS:
        with open(target, "w", encoding="utf-8") as f:
            f.write(src)
        print(f"Gravado com sucesso em: {target} ({len(src)} bytes)")

if __name__ == "__main__":
    apply_patches()
