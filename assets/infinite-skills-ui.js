// Infinite Skill Tree UI & Roguelike System
// Replicating media_1793127386674_e50e4b17.jpg with full Gamepad, Touch, and Mouse navigation
(() => {
  class InfiniteSkillTreeUI {
    constructor(scene) {
      this.scene = scene;
      this.ui = scene;
      this.open = !1;
      this.built = !1;
      this.selectedNodeId = null;
      this.viewingLockedTree = !1;
      this.choiceModalOpen = !1;
      this.choiceSel = 0; // 0 = defense, 1 = attack
      this.curPadDebounce = 0;
    }

    gs() {
      return this.scene.scene.get("Game");
    }

    // Get active endless run state
    getRunState() {
      const g = this.gs();
      if (!g) return null;
      if (!g.registry.has("endless:skills")) {
        g.registry.set("endless:skills", {
          chosenTree: null, // "defense" | "attack"
          invested: {},     // { [nodeId]: rank }
          unlockedApex: null,
          spentPoints: 0,
          spentNmPoints: 0
        });
      }
      return g.registry.get("endless:skills");
    }

    // Points calculation: 1 pt per level from lvl 3 to 15 (max 13 pts)
    getAvailablePoints() {
      const g = this.gs();
      if (!g || !g.stats) return { points: 0, nmPoints: 0 };
      const lvl = g.stats.level || 1;
      const nm = g.stats.nm || 0;
      const state = this.getRunState();

      // Standard points: levels 3 to 15
      const totalStd = Math.max(1, Math.min(15, lvl));
      // Bonus points from puzzle rooms or shrines
      const bonusPts = g.registry.get("endless:bonusSkillPoints") || 0;
      const availableStd = Math.max(0, (totalStd + bonusPts) - (state.spentPoints || 0));

      // Nightmare points: 1 per nightmare tier
      const availableNm = Math.max(0, nm - (state.spentNmPoints || 0));

      return { points: availableStd, nmPoints: availableNm };
    }

    getActiveTree() {
      const g = this.gs();
      if (!g || !g.classDef) return null;
      const trees = window.__getHeroInfiniteTrees(g.classDef.id);
      const state = this.getRunState();
      const targetKey = this.viewingLockedTree
        ? (state.chosenTree === 'defense' ? 'attack' : 'defense')
        : (state.chosenTree || 'defense');
      return trees[targetKey];
    }

    build() {
      if (this.built) return;
      this.built = !0;
      const i = this.scene;

      this.root = i.add.container(0, 0).setDepth(850).setVisible(!1);

      // 1. Dark mystical backdrop (matching media_1793127386674_e50e4b17.jpg)
      const w = 640, h = 360;
      this.backdrop = i.add.rectangle(w / 2, h / 2, w * 1.5, h * 1.5, 0x0a0812, 0.94).setInteractive();
      this.root.add(this.backdrop);

      // Fresco stone texture background & temple pillars
      this.frescoG = i.add.graphics();
      this.root.add(this.frescoG);

      // Conduits / illuminated energy lines layer
      this.linesG = i.add.graphics();
      this.root.add(this.linesG);

      // Nodes container
      this.nodesContainer = i.add.container(0, 0);
      this.root.add(this.nodesContainer);

      // Selection Halo (Diamond glow cursor for Gamepad/Mouse)
      this.cursorG = i.add.graphics();
      this.root.add(this.cursorG);

      // 2. Right Detail Panel (Parchment with double gold border)
      this.detailG = i.add.graphics();
      this.root.add(this.detailG);
      this.detailCardContent = i.add.container(0, 0);
      this.root.add(this.detailCardContent);

      // Header Texts
      this.titleText = i.add.text(45, 22, "", {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "14px",
        color: "#ffd24a",
        fontStyle: "bold"
      });
      this.shapeTagText = i.add.text(45, 40, "", {
        fontFamily: "sans-serif",
        fontSize: "9px",
        color: "#9e8e76"
      });

      // Currency / Points Counter (purple crystal essence)
      this.pointsText = i.add.text(355, 24, "", {
        fontFamily: "sans-serif",
        fontSize: "12px",
        color: "#e6c280",
        fontStyle: "bold"
      }).setOrigin(1, 0);

      this.root.add([this.titleText, this.shapeTagText, this.pointsText]);

      // Details Panel Elements
      const px = 375, py = 50, pw = 235;
      this.dName = i.add.text(px + 12, py + 14, "", {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "13px",
        color: "#ffd24a",
        fontStyle: "bold",
        wordWrap: { width: pw - 24 }
      });
      this.dTag = i.add.text(px + 12, py + 34, "", {
        fontFamily: "sans-serif",
        fontSize: "9px",
        color: "#c29b38"
      });
      this.dReq = i.add.text(px + 12, py + 48, "", {
        fontFamily: "sans-serif",
        fontSize: "9.5px",
        color: "#55e088"
      });
      this.dRank = i.add.text(px + 12, py + 64, "", {
        fontFamily: "sans-serif",
        fontSize: "9.5px",
        color: "#b0a090"
      });
      this.dDesc = i.add.text(px + 12, py + 84, "", {
        fontFamily: "sans-serif",
        fontSize: "9px",
        color: "#dcd6cd",
        lineSpacing: 3,
        wordWrap: { width: pw - 24 }
      });

      // Action Button
      this.actionBtnBg = i.add.rectangle(px + pw / 2, py + 215, pw - 30, 26, 0x3d2814).setInteractive({ useHandCursor: !0 });
      this.actionBtnText = i.add.text(px + pw / 2, py + 215, "[ (A) APRIMORAR ]", {
        fontFamily: "sans-serif",
        fontSize: "10px",
        color: "#ffd24a",
        fontStyle: "bold"
      }).setOrigin(0.5);

      this.actionBtnBg.on("pointerdown", () => this.upgradeSelected());

      // Toggle Tree Button (inspect locked tree)
      this.toggleTreeBtn = i.add.rectangle(px + pw / 2, py + 252, pw - 30, 20, 0x1f192b).setInteractive({ useHandCursor: !0 });
      this.toggleTreeText = i.add.text(px + pw / 2, py + 252, "[ (X) Ver Outro Caminho ]", {
        fontFamily: "sans-serif",
        fontSize: "8.5px",
        color: "#a496b8"
      }).setOrigin(0.5);

      this.toggleTreeBtn.on("pointerdown", () => this.toggleLockedView());

      this.root.add([
        this.dName, this.dTag, this.dReq, this.dRank, this.dDesc,
        this.actionBtnBg, this.actionBtnText,
        this.toggleTreeBtn, this.toggleTreeText
      ]);

      // Re-spec Button
      this.respecBtn = i.add.rectangle(px + pw / 2, py + 282, pw - 30, 18, 0x1a1520).setInteractive({ useHandCursor: !0 });
      this.respecText = i.add.text(px + pw / 2, py + 282, "[ (Y) Redistribuir Pontos ]", {
        fontFamily: "sans-serif",
        fontSize: "8px",
        color: "#c28080"
      }).setOrigin(0.5);
      this.respecBtn.on("pointerdown", () => this.triggerRespec());
      this.root.add([this.respecBtn, this.respecText]);

      // Footer Gamepad Hints
      this.footerText = i.add.text(w / 2, 348, "🎮 [D-Pad] Navegar   [A] Aprimorar   [Y] Redistribuir   [B] Voltar   [X] Ver Outro", {
        fontFamily: "sans-serif",
        fontSize: "9px",
        color: "#8c7e6a"
      }).setOrigin(0.5);
      this.root.add(this.footerText);

      // Close button (X in top right)
      this.closeBtn = i.add.text(w - 28, 16, "✕", {
        fontFamily: "sans-serif",
        fontSize: "14px",
        color: "#c29b38"
      }).setInteractive({ useHandCursor: !0 });
      this.closeBtn.on("pointerdown", () => this.close());
      this.root.add(this.closeBtn);

      // 3. Level 3 Choice Modal Container
      this.buildChoiceModal();
    }

    // Modal shown at Level 3: Choose Offensive or Defensive tree
    buildChoiceModal() {
      const i = this.scene;
      const w = 640, h = 360;
      this.modalContainer = i.add.container(0, 0).setDepth(920).setVisible(!1);

      const mBg = i.add.rectangle(w / 2, h / 2, w * 1.5, h * 1.5, 0x07050d, 0.95).setInteractive();
      this.modalContainer.add(mBg);

      this.modalG = i.add.graphics();
      this.modalContainer.add(this.modalG);

      this.mTitle = i.add.text(w / 2, 40, "ESCOLHA O CAMINHO DO ABISMO", {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "16px",
        color: "#ffd24a",
        fontStyle: "bold"
      }).setOrigin(0.5);

      this.mSubtitle = i.add.text(w / 2, 62, "Escolha o seu caminho do Abismo. Seu estilo definirá suas árvores de habilidades e bônus da jornada.", {
        fontFamily: "sans-serif",
        fontSize: "9.5px",
        color: "#cfc4b2"
      }).setOrigin(0.5);

      this.modalContainer.add([this.mTitle, this.mSubtitle]);

      // Cards for Defesa and Ataque
      this.cardDef = this.createChoiceCard(w / 2 - 145, 85, 270, 210, "defense");
      this.cardAtk = this.createChoiceCard(w / 2 + 145, 85, 270, 210, "attack");

      this.modalContainer.add([this.cardDef.container, this.cardAtk.container]);

      // Footer hint for modal
      this.mFooter = i.add.text(w / 2, 325, "🎮 [D-Pad Esquerda/Direita] Selecionar   [A / Enter] Confirmar Caminho", {
        fontFamily: "sans-serif",
        fontSize: "9.5px",
        color: "#ffd24a"
      }).setOrigin(0.5);
      this.modalContainer.add(this.mFooter);
    }

    createChoiceCard(cx, cy, cw, ch, key) {
      const i = this.scene;
      const c = i.add.container(cx, cy);

      const bg = i.add.rectangle(0, ch / 2, cw, ch, 0x181324, 0.9).setInteractive({ useHandCursor: !0 });
      const borderG = i.add.graphics();

      const typeLabel = key === 'defense' ? "🛡️ CAMINHO DEFENSIVO" : "⚔️ CAMINHO OFENSIVO";
      const typeColor = key === 'defense' ? "#4da6ff" : "#ff5544";

      const tHeader = i.add.text(0, 18, typeLabel, {
        fontFamily: "sans-serif",
        fontSize: "10px",
        color: typeColor,
        fontStyle: "bold"
      }).setOrigin(0.5);

      const tTitle = i.add.text(0, 40, "", {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "14px",
        color: "#ffd24a",
        fontStyle: "bold"
      }).setOrigin(0.5);

      const tShape = i.add.text(0, 58, "", {
        fontFamily: "sans-serif",
        fontSize: "9px",
        color: "#a496b8"
      }).setOrigin(0.5);

      const tDesc = i.add.text(0, 80, "", {
        fontFamily: "sans-serif",
        fontSize: "9px",
        color: "#e0d8cb",
        lineSpacing: 3,
        wordWrap: { width: cw - 30 }
      }).setOrigin(0.5, 0);

      const selectBtn = i.add.rectangle(0, ch - 22, cw - 40, 24, 0x3d2814).setInteractive({ useHandCursor: !0 });
      const selectBtnText = i.add.text(0, ch - 22, `[ ESCOLHER ESTE ]`, {
        fontFamily: "sans-serif",
        fontSize: "9.5px",
        color: "#ffd24a",
        fontStyle: "bold"
      }).setOrigin(0.5);

      c.add([bg, borderG, tHeader, tTitle, tShape, tDesc, selectBtn, selectBtnText]);

      bg.on("pointerdown", () => {
        this.choiceSel = key === 'defense' ? 0 : 1;
        this.renderChoiceModal();
      });

      selectBtn.on("pointerdown", () => {
        this.confirmTreeChoice(key);
      });

      return { container: c, bg, borderG, tTitle, tShape, tDesc, selectBtn, selectBtnText, key };
    }

    renderFrescoBackground() {
      const g = this.frescoG;
      g.clear();

      // Ancient temple fresco stone frame
      g.fillStyle(0x130e20, 0.8);
      g.fillRoundedRect(30, 16, 335, 315, 6);

      // Engraved hero outline placeholder on stone wall
      g.lineStyle(1.5, 0x2e2442, 0.5);
      g.strokeRoundedRect(32, 18, 331, 311, 5);

      // Subtle relief columns
      g.lineStyle(1, 0x221a33, 0.4);
      g.beginPath();
      g.moveTo(70, 20); g.lineTo(70, 325);
      g.moveTo(330, 20); g.lineTo(330, 325);
      g.strokePath();

      // Right detail card background (dark parchment with double gold border)
      const px = 375, py = 16, pw = 235, ph = 320;
      g.fillStyle(0x110c1c, 0.95);
      g.fillRoundedRect(px, py, pw, ph, 4);

      // Double gold border
      g.lineStyle(2, 0x8a6a2a, 0.85);
      g.strokeRoundedRect(px, py, pw, ph, 4);
      g.lineStyle(1, 0x544018, 0.7);
      g.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 3);

      g.fillStyle(0xffd24a, 0.9);
      this.drawDiamond(g, px + pw / 2, py + 74, 4);
    }

    drawDiamond(g, x, y, r) {
      g.beginPath();
      g.moveTo(x, y - r);
      g.lineTo(x + r, y);
      g.lineTo(x, y + r);
      g.lineTo(x - r, y);
      g.closePath();
      g.fillPath();
      g.strokePath();
    }

    show() {
      const g = this.gs();
      if (!g || g.state !== "playing") return;
      this.build();

      const state = this.getRunState();
      // If no tree chosen yet, open choice modal (or preview at levels 1-2)
      if (!state.chosenTree) {
        this.openChoiceModal();
        return;
      }

      this.open = !0;
      this.viewingLockedTree = !1;
      this.root.setVisible(!0);
      this.render();
    }

    close() {
      if (!this.open && !this.choiceModalOpen) return;
      this.open = !1;
      this.choiceModalOpen = !1;
      this.root?.setVisible(!1);
      this.modalContainer?.setVisible(!1);
      this.scene.game.events.emit("skills:seen");
    }

    openChoiceModal() {
      this.build();
      this.choiceModalOpen = !0;
      this.choiceSel = 0;
      this.modalContainer.setVisible(!0);
      this.renderChoiceModal();
    }

    renderChoiceModal() {
      const g = this.gs();
      if (!g || !g.classDef) return;
      const trees = window.__getHeroInfiniteTrees(g.classDef.id);

      // Update Def card
      const dTree = trees.defense;
      if (dTree) {
        this.cardDef.tTitle.setText(dTree.treeName);
        this.cardDef.tShape.setText(`Formato: ${dTree.shape}`);
        this.cardDef.tDesc.setText(dTree.mechanic);
      }

      // Update Atk card
      const aTree = trees.attack;
      if (aTree) {
        this.cardAtk.tTitle.setText(aTree.treeName);
        this.cardAtk.tShape.setText(`Formato: ${aTree.shape}`);
        this.cardAtk.tDesc.setText(aTree.mechanic);
      }

      // Highlight selected card
      const isDef = this.choiceSel === 0;
      this.drawCardHighlight(this.cardDef, isDef);
      this.drawCardHighlight(this.cardAtk, !isDef);
    }

    drawCardHighlight(card, selected) {
      const g = card.borderG;
      g.clear();
      const cw = 270, ch = 210;
      if (selected) {
        g.lineStyle(2.5, 0xffd24a, 1);
        g.strokeRoundedRect(-cw / 2, 0, cw, ch, 6);
        card.selectBtn.setFillStyle(0x754719, 1);
        card.selectBtnText.setColor("#fff2b8");
      } else {
        g.lineStyle(1, 0x3d354d, 0.7);
        g.strokeRoundedRect(-cw / 2, 0, cw, ch, 6);
        card.selectBtn.setFillStyle(0x241a10, 0.8);
        card.selectBtnText.setColor("#a6927a");
      }
    }

    confirmTreeChoice(key) {
      const state = this.getRunState();
      state.chosenTree = key;
      this.choiceModalOpen = !1;
      this.modalContainer.setVisible(!1);

      // Play fanfare
      const g = this.gs();
      g?.game?.audioEngine?.sfx?.("sfx-shrine-use");
      this.scene.game.events.emit("ui:banner", `CAMINHO ESCOLHIDO: ${key === 'defense' ? 'DEFESA' : 'ATAQUE'}`, "#ffd24a");

      // Open skill tree immediately
      this.show();
    }

    render() {
      this.renderFrescoBackground();
      const tree = this.getActiveTree();
      if (!tree) return;

      const state = this.getRunState();
      const pts = this.getAvailablePoints();
      const isLocked = this.viewingLockedTree;

      // Header Texts
      const heroName = tree.heroName;
      const typeStr = tree.treeKey === 'defense' ? "Defensiva" : "Ofensiva";
      this.titleText.setText(`${heroName} · ${tree.treeName} (${typeStr})`);
      this.shapeTagText.setText(isLocked ? "🔒 CAMINHO TRANCADO NESTA RUN (APENAS LEITURA)" : `Formato: ${tree.shape} · ${tree.mechanic}`);

      this.pointsText.setText(`Pontos: ${pts.points} 🔮  |  Pesadelo: ${pts.nmPoints} 💀`);

      // Toggle tree button text
      const otherType = tree.treeKey === 'defense' ? "Ofensivo" : "Defensivo";
      this.toggleTreeText.setText(isLocked ? `[ (X) Voltar à Árvore Ativa ]` : `[ (X) Inspecionar Caminho ${otherType} ]`);

      // Ensure a selected node
      if (!this.selectedNodeId || !tree.nodes.find(n => n.id === this.selectedNodeId)) {
        this.selectedNodeId = tree.nodes[0]?.id;
      }

      this.renderConduits(tree);
      this.renderNodes(tree);
      this.renderDetailCard(tree);
    }

    renderConduits(tree) {
      const g = this.linesG;
      g.clear();
      const state = this.getRunState();
      const isLocked = this.viewingLockedTree;

      for (const [fromId, toId] of (tree.connections || [])) {
        const fromNode = tree.nodes.find(n => n.id === fromId);
        const toNode = tree.nodes.find(n => n.id === toId);
        if (!fromNode || !toNode) continue;

        const fromRank = !isLocked ? (state.invested[fromId] || 0) : 0;
        const toRank = !isLocked ? (state.invested[toId] || 0) : 0;

        if (fromRank > 0 && toRank > 0) {
          // Fully illuminated golden beam
          g.lineStyle(4, 0xffca3a, 0.4);
          g.beginPath();
          g.moveTo(fromNode.x, fromNode.y); g.lineTo(toNode.x, toNode.y);
          g.strokePath();

          g.lineStyle(2, 0xfff2a8, 0.95);
          g.beginPath();
          g.moveTo(fromNode.x, fromNode.y); g.lineTo(toNode.x, toNode.y);
          g.strokePath();
        } else if (fromRank > 0) {
          // Semi-illuminated amber conduit
          g.lineStyle(1.5, 0x997b28, 0.7);
          g.beginPath();
          g.moveTo(fromNode.x, fromNode.y); g.lineTo(toNode.x, toNode.y);
          g.strokePath();
        } else {
          // Dark dormant stone conduit
          g.lineStyle(1.5, 0x282036, 0.6);
          g.beginPath();
          g.moveTo(fromNode.x, fromNode.y); g.lineTo(toNode.x, toNode.y);
          g.strokePath();
        }
      }
    }

    renderNodes(tree) {
      this.nodesContainer.removeAll(!0);
      this.cursorG.clear();

      const state = this.getRunState();
      const pts = this.getAvailablePoints();
      const isLockedTree = this.viewingLockedTree;
      const gScene = this.gs();
      const eq = gScene?.inventory?.equipment;
      const druidForm = gScene?.druidForm || null;

      for (const node of tree.nodes) {
        const rank = !isLockedTree ? (state.invested[node.id] || 0) : 0;
        const wepCheck = window.__checkNodeWeaponReq(node.req, eq, druidForm);
        const wepActive = wepCheck.active;

        let prereqsMet = !0;
        for (const reqId of (node.requires || [])) {
          if (!state.invested[reqId] || state.invested[reqId] <= 0) {
            prereqsMet = !1;
            break;
          }
        }
        if (node.requires && node.requires.length === 0) prereqsMet = !0;

        const isNightmare = node.category === 'nightmare';
        const hasPoint = isNightmare ? pts.nmPoints > 0 : pts.points > 0;
        const isMax = rank >= node.maxRank;
        const isAvailable = !isLockedTree && prereqsMet && !isMax && hasPoint;
        const isSelected = this.selectedNodeId === node.id;

        const nodeContainer = this.scene.add.container(node.x, node.y);
        const diamondG = this.scene.add.graphics();
        nodeContainer.add(diamondG);

        const r = 15; // Node diamond radius

        // Fill and stroke based on state
        if (rank > 0) {
          if (wepActive) {
            diamondG.fillStyle(0x382a12, 1);
            diamondG.lineStyle(2, 0xffd24a, 1);
          } else {
            diamondG.fillStyle(0x331c18, 1);
            diamondG.lineStyle(1.5, 0x994444, 1);
          }
        } else if (isAvailable) {
          diamondG.fillStyle(0x231a33, 1);
          diamondG.lineStyle(2, 0xffb703, 1);
        } else {
          diamondG.fillStyle(0x100c1c, 0.95);
          diamondG.lineStyle(1.5, 0x332845, 0.8);
        }

        this.drawDiamond(diamondG, 0, 0, r);

        // Render Ability Icon Texture inside diamond
        const iconKey = node.icon || "icon-sword";
        if (this.scene.textures.exists(iconKey)) {
          const iconImg = this.scene.add.image(0, 0, iconKey).setDisplaySize(18, 18);
          if (rank > 0) {
            if (wepActive) {
              iconImg.setAlpha(1.0);
            } else {
              iconImg.setTint(0xaa6655).setAlpha(0.7);
            }
          } else if (isAvailable) {
            iconImg.setTint(0xffe280).setAlpha(0.9);
          } else {
            iconImg.setTint(0x4a3d5c).setAlpha(0.45);
          }
          nodeContainer.add(iconImg);
        }

        // Rank / Lock / Status badges (neatly positioned in corners)
        if (rank > 0) {
          if (!wepActive) {
            const warnBadge = this.scene.add.text(9, -9, "✕", {
              fontSize: "9px",
              color: "#ff3333",
              fontStyle: "bold"
            }).setOrigin(0.5);
            nodeContainer.add(warnBadge);
          }
          if (node.maxRank > 1) {
            const badgeBg = this.scene.add.rectangle(0, 11, 16, 9, 0x0a0612, 0.85);
            const rankText = this.scene.add.text(0, 11, `${rank}/${node.maxRank}`, {
              fontFamily: "sans-serif",
              fontSize: "7px",
              color: wepActive ? "#ffd24a" : "#ff8888",
              fontStyle: "bold"
            }).setOrigin(0.5);
            nodeContainer.add([badgeBg, rankText]);
          } else {
            const checkText = this.scene.add.text(8, 8, "★", {
              fontSize: "8px",
              color: "#ffd24a"
            }).setOrigin(0.5);
            nodeContainer.add(checkText);
          }
        } else if (!prereqsMet || isLockedTree) {
          const lockText = this.scene.add.text(8, 8, "🔒", {
            fontSize: "8px"
          }).setOrigin(0.5);
          nodeContainer.add(lockText);
        } else {
          const plusText = this.scene.add.text(8, 8, "+", {
            fontFamily: "sans-serif",
            fontSize: "10px",
            color: "#ffd24a",
            fontStyle: "bold"
          }).setOrigin(0.5);
          nodeContainer.add(plusText);
        }

        // Selection Cursor on focused node
        if (isSelected) {
          this.cursorG.lineStyle(2, 0xffffff, 0.95);
          this.drawDiamond(this.cursorG, node.x, node.y, r + 5);
          this.cursorG.lineStyle(1.5, 0xffd24a, 0.7);
          this.drawDiamond(this.cursorG, node.x, node.y, r + 8);
        }

        // Interactive zone for mouse / touch
        const hitZone = this.scene.add.zone(0, 0, 32, 32).setInteractive({ useHandCursor: !0 });
        hitZone.on("pointerdown", () => {
          this.selectedNodeId = node.id;
          this.render();
          window.__triggerHaptic?.(25, 0.2);
        });
        nodeContainer.add(hitZone);

        this.nodesContainer.add(nodeContainer);
      }
    }

    renderDetailCard(tree) {
      if (!this.detailCardContent) {
        this.detailCardContent = this.scene.add.container(0, 0);
        this.root.add(this.detailCardContent);
      }
      this.detailCardContent.removeAll(!0);
      this.detailG.clear();

      const node = tree.nodes.find(n => n.id === this.selectedNodeId);
      if (!node) return;

      const state = this.getRunState();
      const pts = this.getAvailablePoints();
      const rank = !this.viewingLockedTree ? (state.invested[node.id] || 0) : 0;
      const gScene = this.gs();
      const eq = gScene?.inventory?.equipment;
      const druidForm = gScene?.druidForm || null;
      const reqCheck = window.__checkNodeWeaponReq(node.req, eq, druidForm);

      const px = 375, py = 16, pw = 235;

      // 1. Icon Box with gold frame
      const iconBoxX = px + 14, iconBoxY = py + 12;
      this.detailG.lineStyle(1.5, 0xc9a24a, 0.85);
      this.detailG.strokeRoundedRect(iconBoxX, iconBoxY, 36, 36, 4);
      this.detailG.fillStyle(0x181024, 0.95);
      this.detailG.fillRoundedRect(iconBoxX, iconBoxY, 36, 36, 4);

      const iconKey = node.icon || "icon-sword";
      if (this.scene.textures.exists(iconKey)) {
        const iconImg = this.scene.add.image(iconBoxX + 18, iconBoxY + 18, iconKey).setDisplaySize(28, 28);
        this.detailCardContent.add(iconImg);
      }

      // 2. Name next to Icon
      const nameX = px + 56, nameY = py + 12;
      const dName = this.scene.add.text(nameX, nameY, node.name.toUpperCase(), {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "11px",
        color: "#ffd24a",
        fontStyle: "bold",
        wordWrap: { width: pw - 68 }
      });
      this.detailCardContent.add(dName);

      // 3. Category / Type Tag below Name
      const tagY = dName.y + dName.height + 2;
      const dTag = this.scene.add.text(nameX, tagY, `TIPO: ${node.rawType.toUpperCase()}`, {
        fontFamily: "sans-serif",
        fontSize: "8px",
        color: "#c29b38"
      });
      this.detailCardContent.add(dTag);

      // 4. Gold Divider Glyph
      const divY = Math.max(py + 54, dTag.y + dTag.height + 5);
      this.detailG.lineStyle(1, 0x8a6a2a, 0.55);
      this.detailG.beginPath();
      this.detailG.moveTo(px + 14, divY); this.detailG.lineTo(px + pw - 14, divY);
      this.detailG.strokePath();

      // 5. Weapon Requirement
      const reqY = divY + 6;
      let reqStr = "REQUER: Qualquer arma";
      let reqColor = "#a09080";
      if (node.req && node.req !== '—') {
        if (reqCheck.active) {
          reqStr = `✓ REQUER: ${node.req} (ATIVO)`;
          reqColor = "#55e088";
        } else {
          reqStr = `✗ REQUER: ${node.req} (NÃO EQUIPADA)`;
          reqColor = "#ff6b6b";
        }
      }
      const dReq = this.scene.add.text(px + 14, reqY, reqStr, {
        fontFamily: "sans-serif",
        fontSize: "8.5px",
        color: reqColor,
        wordWrap: { width: pw - 28 }
      });
      this.detailCardContent.add(dReq);

      // 6. Rank
      const rankY = dReq.y + dReq.height + 4;
      const dRank = this.scene.add.text(px + 14, rankY, `GRAU: ${rank} / ${node.maxRank}`, {
        fontFamily: "sans-serif",
        fontSize: "8.5px",
        color: "#cfc4b2",
        fontStyle: "bold"
      });
      this.detailCardContent.add(dRank);

      // 7. Description (dynamically wrapped, line-spaced)
      const descY = dRank.y + dRank.height + 6;
      const dDesc = this.scene.add.text(px + 14, descY, node.desc, {
        fontFamily: "sans-serif",
        fontSize: "8.5px",
        color: "#e8e0d5",
        lineSpacing: 2.5,
        wordWrap: { width: pw - 28 }
      });
      this.detailCardContent.add(dDesc);

      // 8. Buttons cleanly positioned from bottom up
      const btnActionY = 268;
      const btnToggleY = 294;
      const btnRespecY = 316;

      this.actionBtnBg.setPosition(px + pw / 2, btnActionY);
      this.actionBtnText.setPosition(px + pw / 2, btnActionY);

      this.toggleTreeBtn.setPosition(px + pw / 2, btnToggleY);
      this.toggleTreeText.setPosition(px + pw / 2, btnToggleY);

      this.respecBtn.setPosition(px + pw / 2, btnRespecY);
      this.respecText.setPosition(px + pw / 2, btnRespecY);

      // Button states
      if (this.viewingLockedTree) {
        this.actionBtnBg.setFillStyle(0x221a2e, 0.6);
        this.actionBtnText.setText("[ CAMINHO TRANCADO ]").setColor("#7a6b8a");
        return;
      }

      if (rank >= node.maxRank) {
        this.actionBtnBg.setFillStyle(0x241a10, 0.8);
        this.actionBtnText.setText("[ GRAU MÁXIMO ]").setColor("#a6927a");
      } else {
        let prereqsMet = !0;
        for (const reqId of (node.requires || [])) {
          if (!state.invested[reqId] || state.invested[reqId] <= 0) {
            prereqsMet = !1;
            break;
          }
        }
        const isNm = node.category === 'nightmare';
        const hasPoint = isNm ? pts.nmPoints > 0 : pts.points > 0;

        if (!prereqsMet) {
          this.actionBtnBg.setFillStyle(0x241a10, 0.6);
          this.actionBtnText.setText("[ BLOQUEADO: PRÉ-REQUISITO ]").setColor("#6e6052");
        } else if (!hasPoint) {
          this.actionBtnBg.setFillStyle(0x241a10, 0.6);
          this.actionBtnText.setText(isNm ? "[ REQUER PONTO PESADELO ]" : "[ SEM PONTOS DISPONÍVEIS ]").setColor("#8a7762");
        } else {
          this.actionBtnBg.setFillStyle(0x613d18, 1);
          this.actionBtnText.setText(isNm ? "[ (A) APRIMORAR (1 PESADELO) ]" : "[ (A) APRIMORAR (1 PONTO) ]").setColor("#fff2b8");
        }
      }
    }

    upgradeSelected() {
      if (this.viewingLockedTree) return;
      const tree = this.getActiveTree();
      if (!tree) return;
      const node = tree.nodes.find(n => n.id === this.selectedNodeId);
      if (!node) return;

      const state = this.getRunState();
      const pts = this.getAvailablePoints();
      const currentRank = state.invested[node.id] || 0;
      if (currentRank >= node.maxRank) return;

      // Prerequisites check
      for (const reqId of (node.requires || [])) {
        if (!state.invested[reqId] || state.invested[reqId] <= 0) return;
      }

      const isNm = node.category === 'nightmare';
      if (isNm) {
        if (pts.nmPoints <= 0) return;
        state.spentNmPoints = (state.spentNmPoints || 0) + 1;
      } else {
        if (pts.points <= 0) return;
        state.spentPoints = (state.spentPoints || 0) + 1;
      }

      state.invested[node.id] = currentRank + 1;

      // Play audio feedback
      const gScene = this.gs();
      gScene?.game?.audioEngine?.sfx?.("sfx-shrine-use");

      // Register and equip active ability if this node is an active skill
      if (node.category === 'active' && typeof window.__registerInfiniteActiveAbilities === 'function') {
        window.__registerInfiniteActiveAbilities();
        const abId = (tree.heroId + "_" + tree.treeKey.slice(0, 3) + "_" + node.name.replace(/\s+/g, '_')).toUpperCase();
        // Check Ye for matching ability or find key
        let targetKey = null;
        if (window.Ye) {
          for (const k of Object.keys(window.Ye)) {
            if (window.Ye[k].name === node.name) { targetKey = k; break; }
          }
        }
        if (targetKey && gScene?.skillState?.equipped) {
          const eq = gScene.skillState.equipped;
          if (!eq.includes(targetKey)) {
            let emptyIdx = eq.indexOf(null);
            if (emptyIdx === -1) emptyIdx = 3; // replace last slot
            eq[emptyIdx] = targetKey;
            gScene.abilities?.setEquipped?.(eq);
            this.scene.game.events.emit("ui:banner", `HABILIDADE EQUIPADA: ${node.name.toUpperCase()}`, "#ffd24a");
          }
        }
      }

      // Apply passive buffs and active skills
      this.applySkills();

      this.render();
    }

    applySkills() {
      const gScene = this.gs();
      if (!gScene || !gScene.player) return;
      const state = this.getRunState();
      const tree = this.getActiveTree();
      if (!tree || !state.chosenTree) return;

      // Recompute stats and buffs
      if (typeof window.__recomputeInfiniteSkills === 'function') {
        window.__recomputeInfiniteSkills(gScene);
      }
    }

    toggleLockedView() {
      this.viewingLockedTree = !this.viewingLockedTree;
      const tree = this.getActiveTree();
      if (tree) {
        this.selectedNodeId = tree.nodes[0]?.id;
      }
      this.render();
    }


    triggerRespec() {
      if (this.viewingLockedTree) return;
      const gScene = this.gs();
      if (typeof window.__resetInfiniteSkills === 'function') {
        window.__resetInfiniteSkills(gScene);
        this.render();
      }
    }

    // GAMEPAD & KEYBOARD NAVIGATION
    handleKey(key) {
      if (this.choiceModalOpen) {
        if (key === "ArrowLeft" || key === "a" || key === "A") {
          this.choiceSel = 0;
          this.renderChoiceModal();
          return !0;
        }
        if (key === "ArrowRight" || key === "d" || key === "D") {
          this.choiceSel = 1;
          this.renderChoiceModal();
          return !0;
        }
        if (key === "Enter" || key === " " || key === "Space") {
          this.confirmTreeChoice(this.choiceSel === 0 ? "defense" : "attack");
          return !0;
        }
        if (key === "Escape") {
          // Cannot cancel Level 3 choice without choosing
          return !0;
        }
        return !1;
      }

      if (!this.open) return !1;

      const tree = this.getActiveTree();
      if (!tree) return !1;
      const currentNode = tree.nodes.find(n => n.id === this.selectedNodeId);

      if (key === "ArrowUp" || key === "w" || key === "W") {
        if (currentNode?.nav?.up) {
          this.selectedNodeId = currentNode.nav.up;
          this.render();
          return !0;
        }
      } else if (key === "ArrowDown" || key === "s" || key === "S") {
        if (currentNode?.nav?.down) {
          this.selectedNodeId = currentNode.nav.down;
          this.render();
          return !0;
        }
      } else if (key === "ArrowLeft" || key === "a" || key === "A") {
        if (currentNode?.nav?.left) {
          this.selectedNodeId = currentNode.nav.left;
          this.render();
          return !0;
        }
      } else if (key === "ArrowRight" || key === "d" || key === "D") {
        if (currentNode?.nav?.right) {
          this.selectedNodeId = currentNode.nav.right;
          this.render();
          return !0;
        }
      } else if (key === "Enter" || key === " " || key === "Space") {
        this.upgradeSelected();
        return !0;
      } else if (key === "y" || key === "Y") {
        this.triggerRespec();
        return !0;
      } else if (key === "x" || key === "X") {
        this.toggleLockedView();
        return !0;
      } else if (key === "Escape" || key === "b" || key === "B") {
        this.close();
        return !0;
      }

      return !1;
    }
  }

  window.InfiniteSkillTreeUI = InfiniteSkillTreeUI;
})();
