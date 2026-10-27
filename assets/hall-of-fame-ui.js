// Hall of Fame & Build Archives System for Endless Mode
// Full Gamepad, Touch, and Keyboard navigation with tactile haptic feedback
(() => {
  // Universal Haptic / Vibration helper (Gamepad Rumble + Mobile Vibration)
  window.__triggerHaptic = function(durationMs = 80, strength = 0.5) {
    try {
      if (typeof navigator !== "undefined" && navigator.getGamepads) {
        const pads = navigator.getGamepads();
        for (const pad of pads) {
          if (pad && pad.vibrationActuator && pad.vibrationActuator.playEffect) {
            pad.vibrationActuator.playEffect("dual-rumble", {
              startDelay: 0,
              duration: durationMs,
              weakMagnitude: strength,
              strongMagnitude: Math.min(1.0, strength * 1.3)
            }).catch(() => {});
          }
        }
      }
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(durationMs);
      }
    } catch(e) {}
  };

  class HallOfFameUI {
    constructor(scene) {
      this.ui = scene;
      this.open = !1;
      this.built = !1;
      this.selectedIdx = 0;
      this.records = [];
    }

    gs() {
      return this.ui.scene.get("Game");
    }

    loadRecords() {
      try {
        const raw = localStorage.getItem("dungeon-crawler:hall_of_fame");
        this.records = raw ? JSON.parse(raw) : [];
      } catch(e) {
        this.records = [];
      }
      // If empty, supply placeholder legendary runs
      if (!this.records || this.records.length === 0) {
        this.records = [
          { date: "27/10/2026", hero: "Draven", tree: "Guarda de Valdrak (Defesa)", depth: 42, nightmare: 3, kills: 384 },
          { date: "26/10/2026", hero: "Akihiro", tree: "Corte Único (Ataque)", depth: 36, nightmare: 2, kills: 295 },
          { date: "25/10/2026", hero: "Hayato", tree: "Flecha Certeira (Ataque)", depth: 28, nightmare: 1, kills: 210 }
        ];
      }
    }

    build() {
      if (this.built) return;
      this.built = !0;
      const i = this.ui;
      const w = 640, h = 360;

      this.root = i.add.container(0, 0).setDepth(890).setVisible(!1);

      // Dark backdrop
      this.backdrop = i.add.rectangle(w / 2, h / 2, w * 1.5, h * 1.5, 0x08060f, 0.94).setInteractive();
      this.root.add(this.backdrop);

      // Fresco frame graphics
      this.frameG = i.add.graphics();
      this.root.add(this.frameG);

      // Header Title
      this.titleText = i.add.text(w / 2, 28, "CRÔNICAS DO ABISMO · HALL DA FAMA", {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "16px",
        color: "#ffd24a",
        fontStyle: "bold"
      }).setOrigin(0.5);

      this.subtitleText = i.add.text(w / 2, 48, "As maiores expedições e builds registradas nas profundezas infinitas", {
        fontFamily: "sans-serif",
        fontSize: "9px",
        color: "#9e8e76"
      }).setOrigin(0.5);

      this.root.add([this.titleText, this.subtitleText]);

      // Entries Container
      this.entriesContainer = i.add.container(0, 0);
      this.root.add(this.entriesContainer);

      // Selection Highlight
      this.highlightG = i.add.graphics();
      this.root.add(this.highlightG);

      // Footer Gamepad Hints
      this.footerText = i.add.text(w / 2, 340, "🎮 [D-Pad Cima/Baixo] Navegar Histórico   [B / Esc] Voltar", {
        fontFamily: "sans-serif",
        fontSize: "9px",
        color: "#8c7e6a"
      }).setOrigin(0.5);
      this.root.add(this.footerText);

      // Close Button
      this.closeBtn = i.add.text(w - 36, 18, "✕", {
        fontFamily: "sans-serif",
        fontSize: "15px",
        color: "#c29b38"
      }).setInteractive({ useHandCursor: !0 });
      this.closeBtn.on("pointerdown", () => this.close());
      this.root.add(this.closeBtn);
    }

    show() {
      this.build();
      this.loadRecords();
      this.open = !0;
      this.selectedIdx = 0;
      this.root.setVisible(!0);
      this.render();
      window.__triggerHaptic?.(50, 0.3);
    }

    close() {
      if (!this.open) return;
      this.open = !1;
      this.root.setVisible(!1);
      window.__triggerHaptic?.(40, 0.2);
    }

    render() {
      const g = this.frameG;
      g.clear();
      const w = 640;
      const bx = 45, by = 64, bw = 550, bh = 264;

      // Stone panel background
      g.fillStyle(0x110c1c, 0.95);
      g.fillRoundedRect(bx, by, bw, bh, 5);

      // Double gold border
      g.lineStyle(2, 0x8a6a2a, 0.85);
      g.strokeRoundedRect(bx, by, bw, bh, 5);
      g.lineStyle(1, 0x544018, 0.7);
      g.strokeRoundedRect(bx + 3, by + 3, bw - 6, bh - 6, 4);

      // Header row
      g.fillStyle(0x1e152d, 0.9);
      g.fillRoundedRect(bx + 6, by + 6, bw - 12, 22, 3);

      this.entriesContainer.removeAll(!0);

      // Table Header Titles
      const colRank = bx + 25;
      const colHero = bx + 90;
      const colTree = bx + 220;
      const colDepth = bx + 390;
      const colKills = bx + 475;

      const thStyle = { fontFamily: "sans-serif", fontSize: "9px", color: "#ffd24a", fontStyle: "bold" };
      this.entriesContainer.add([
        this.ui.add.text(colRank, by + 11, "POS", thStyle).setOrigin(0.5, 0),
        this.ui.add.text(colHero, by + 11, "HERÓI", thStyle),
        this.ui.add.text(colTree, by + 11, "CAMINHO / ÁRVORE", thStyle),
        this.ui.add.text(colDepth, by + 11, "ANDAR / PESADELO", thStyle),
        this.ui.add.text(colKills, by + 11, "ABATES", thStyle)
      ]);

      // Render up to 7 visible records
      const rowH = 28;
      const startY = by + 34;

      this.highlightG.clear();

      for (let idx = 0; idx < Math.min(7, this.records.length); idx++) {
        const r = this.records[idx];
        const rowY = startY + idx * rowH;
        const isSel = idx === this.selectedIdx;

        // Draw selection cursor
        if (isSel) {
          this.highlightG.fillStyle(0x3d2b52, 0.85);
          this.highlightG.fillRoundedRect(bx + 8, rowY, bw - 16, rowH - 4, 3);
          this.highlightG.lineStyle(1.5, 0xffd24a, 0.9);
          this.highlightG.strokeRoundedRect(bx + 8, rowY, bw - 16, rowH - 4, 3);
        }

        // Rank Badge
        let medal = `${idx + 1}º`;
        let medalColor = "#b3a698";
        if (idx === 0) { medal = "🥇 1º"; medalColor = "#ffd24a"; }
        else if (idx === 1) { medal = "🥈 2º"; medalColor = "#e0e0e0"; }
        else if (idx === 2) { medal = "🥉 3º"; medalColor = "#e69966"; }

        const tRank = this.ui.add.text(colRank, rowY + 5, medal, {
          fontFamily: "sans-serif", fontSize: "10px", color: medalColor, fontStyle: "bold"
        }).setOrigin(0.5, 0);

        const tHero = this.ui.add.text(colHero, rowY + 5, r.hero || "Guerreiro", {
          fontFamily: "sans-serif", fontSize: "10px", color: isSel ? "#ffffff" : "#d8d0c2", fontStyle: "bold"
        });

        const tTree = this.ui.add.text(colTree, rowY + 5, r.tree || "Defesa", {
          fontFamily: "sans-serif", fontSize: "9px", color: isSel ? "#ffe88a" : "#b0a088"
        });

        const nmStr = (r.nightmare && r.nightmare > 0) ? ` · Pesadelo ${r.nightmare}` : "";
        const tDepth = this.ui.add.text(colDepth, rowY + 5, `Andar ${r.depth || 1}${nmStr}`, {
          fontFamily: "sans-serif", fontSize: "9.5px", color: isSel ? "#00ff88" : "#66dd99"
        });

        const tKills = this.ui.add.text(colKills, rowY + 5, `${r.kills || 0} 💀`, {
          fontFamily: "sans-serif", fontSize: "9.5px", color: isSel ? "#ff8877" : "#cc6655"
        });

        // Click zone
        const zone = this.ui.add.zone(bx + 8, rowY, bw - 16, rowH - 4).setOrigin(0).setInteractive({ useHandCursor: !0 });
        const curIdx = idx;
        zone.on("pointerdown", () => {
          this.selectedIdx = curIdx;
          this.render();
          window.__triggerHaptic?.(30, 0.2);
        });

        this.entriesContainer.add([tRank, tHero, tTree, tDepth, tKills, zone]);
      }
    }

    handleKey(key) {
      if (!this.open) return !1;

      if (key === "ArrowUp" || key === "w" || key === "W") {
        if (this.selectedIdx > 0) {
          this.selectedIdx--;
          this.render();
          window.__triggerHaptic?.(30, 0.2);
        }
        return !0;
      }
      if (key === "ArrowDown" || key === "s" || key === "S") {
        if (this.selectedIdx < Math.min(6, this.records.length - 1)) {
          this.selectedIdx++;
          this.render();
          window.__triggerHaptic?.(30, 0.2);
        }
        return !0;
      }
      if (key === "Escape" || key === "b" || key === "B") {
        this.close();
        return !0;
      }

      return !1;
    }
  }

  window.HallOfFameUI = HallOfFameUI;

  // Global opener helper
  window.__openHallOfFame = function(scene) {
    if (!scene) return;
    if (!scene.__hallOfFameUI) {
      scene.__hallOfFameUI = new HallOfFameUI(scene);
    }
    scene.__hallOfFameUI.show();
  };
})();
