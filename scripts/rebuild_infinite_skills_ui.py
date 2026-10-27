import os, sys, shutil

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UI_FILE = os.path.join(ROOT, "assets", "infinite-skills-ui.js")
MIRROR_UI = os.path.join(ROOT, "Projeto atualizado", "assets", "infinite-skills-ui.js")

print("Rebuilding Infinite Skills UI with complete visual fidelity to reference art and intuitive D-pad navigation...")

code = r'''// Infinite Mode Skill Trees UI — High Fidelity Roguelike Presentation
// Fully faithful to reference art (media_1793127386674_e50e4b17.jpg)
// Features large cream-gold diamonds, stone fresco relief, thick illuminated conduits,
// crystal-clear D-pad navigation with smart directional fallbacks, and a bold action button.

(() => {
  class InfiniteSkillTreeUI {
    constructor(scene) {
      this.scene = scene;
      this.open = !1;
      this.built = !1;
      this.selectedNodeId = null;
      this.choiceModalOpen = !1;
      this.choiceSel = 0; // 0 = defense, 1 = attack
      this.viewingLockedTree = !1;
      this.pulseTimer = 0;
    }

    gs() {
      return this.scene.scene.get("Game");
    }

    getRunState() {
      const g = this.gs();
      if (!g) return { chosenTree: null, invested: {}, spentPoints: 0, spentNmPoints: 0 };
      if (!g.registry.has("endless:skills")) {
        g.registry.set("endless:skills", {
          chosenTree: null,
          invested: {},
          spentPoints: 0,
          spentNmPoints: 0
        });
      }
      return g.registry.get("endless:skills");
    }

    getAvailablePoints() {
      const g = this.gs();
      if (!g || !g.stats) return { points: 1, nmPoints: 0 };
      const lvl = g.stats.level || 1;
      const nm = g.stats.nm || g.stats.nmPoints || 0;
      const state = this.getRunState();

      // Standard points: 1 point per level, starting with 1 at Level 1
      const totalStd = Math.max(1, Math.min(15, lvl));
      const bonusPts = g.registry.get("endless:bonusSkillPoints") || 0;
      const availableStd = Math.max(0, (totalStd + bonusPts) - (state.spentPoints || 0));

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
      const w = 640, h = 360;

      this.root = i.add.container(0, 0).setDepth(850).setVisible(!1);

      // 1. Mystical deep violet-black background
      this.backdrop = i.add.rectangle(w / 2, h / 2, w * 1.5, h * 1.5, 0x090510, 0.96).setInteractive();
      this.root.add(this.backdrop);

      // Fresco stone texture background with guardian relief silhouettes
      this.frescoG = i.add.graphics();
      this.root.add(this.frescoG);

      // Conduits layer (thick illuminated golden conduits & dark locked bars)
      this.linesG = i.add.graphics();
      this.root.add(this.linesG);

      // Nodes container
      this.nodesContainer = i.add.container(0, 0);
      this.root.add(this.nodesContainer);

      // Glowing reticle cursor for selected node
      this.cursorG = i.add.graphics();
      this.root.add(this.cursorG);

      // 2. Top Header Elements
      this.titleText = i.add.text(35, 18, "", {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "13px",
        color: "#f7e8a9",
        fontStyle: "bold"
      });
      this.shapeTagText = i.add.text(35, 34, "", {
        fontFamily: "sans-serif",
        fontSize: "8.5px",
        color: "#8f7e9c"
      });

      // Top-right Currency Pill (e.g. 18 🟣 | 0 💀)
      this.currencyBg = i.add.graphics();
      this.pointsText = i.add.text(410, 24, "", {
        fontFamily: "sans-serif",
        fontSize: "11px",
        color: "#f7e8a9",
        fontStyle: "bold"
      }).setOrigin(1, 0.5);

      this.root.add([this.titleText, this.shapeTagText, this.currencyBg, this.pointsText]);

      // 3. Right Detail Panel Graphics & Content Container
      this.detailG = i.add.graphics();
      this.root.add(this.detailG);

      this.detailContent = i.add.container(0, 0);
      this.root.add(this.detailContent);

      // Right Detail Panel Persistent Buttons
      const px = 425, py = 16, pw = 202;

      // Big Action Upgrade Button
      this.actionBtnBg = i.add.rectangle(px + pw / 2, 260, pw - 24, 30, 0x6e4318).setInteractive({ useHandCursor: !0 });
      this.actionBtnText = i.add.text(px + pw / 2, 260, "[ (A) APRIMORAR ]", {
        fontFamily: "sans-serif",
        fontSize: "10.5px",
        color: "#ffffff",
        fontStyle: "bold"
      }).setOrigin(0.5);

      this.actionBtnBg.on("pointerdown", () => this.upgradeSelected());

      // Toggle Tree Button (inspect locked branch)
      this.toggleTreeBtn = i.add.rectangle(px + pw / 2, 292, pw - 24, 20, 0x1a1224).setInteractive({ useHandCursor: !0 });
      this.toggleTreeText = i.add.text(px + pw / 2, 292, "[ (X) Ver Outro Caminho ]", {
        fontFamily: "sans-serif",
        fontSize: "8.5px",
        color: "#a494b8"
      }).setOrigin(0.5);
      this.toggleTreeBtn.on("pointerdown", () => this.toggleLockedView());

      // Re-spec Button
      this.respecBtn = i.add.rectangle(px + pw / 2, 314, pw - 24, 16, 0x140e1c).setInteractive({ useHandCursor: !0 });
      this.respecText = i.add.text(px + pw / 2, 314, "[ (Y) Redistribuir Pontos ]", {
        fontFamily: "sans-serif",
        fontSize: "7.5px",
        color: "#b07878"
      }).setOrigin(0.5);
      this.respecBtn.on("pointerdown", () => this.triggerRespec());

      this.root.add([
        this.actionBtnBg, this.actionBtnText,
        this.toggleTreeBtn, this.toggleTreeText,
        this.respecBtn, this.respecText
      ]);

      // 4. Footer Gamepad Hints Bar
      this.footerText = i.add.text(w / 2, 346, "🎮 [D-Pad] Navegar    [A] Aprimorar    [X] Alternar Ramo    [Y] Redistribuir    [B / Esc] Voltar", {
        fontFamily: "sans-serif",
        fontSize: "8.5px",
        color: "#c2ab80"
      }).setOrigin(0.5);
      this.root.add(this.footerText);

      // Close button (X top right)
      this.closeBtn = i.add.text(w - 20, 16, "✕", {
        fontFamily: "sans-serif",
        fontSize: "13px",
        color: "#c29b38"
      }).setOrigin(0.5).setInteractive({ useHandCursor: !0 });
      this.closeBtn.on("pointerdown", () => this.close());
      this.root.add(this.closeBtn);

      // Choice Modal (Offensive vs Defensive)
      this.buildChoiceModal();
    }

    buildChoiceModal() {
      const i = this.scene;
      const w = 640, h = 360;
      this.modalContainer = i.add.container(0, 0).setDepth(920).setVisible(!1);

      const mBg = i.add.rectangle(w / 2, h / 2, w * 1.5, h * 1.5, 0x07040d, 0.95).setInteractive();
      this.modalContainer.add(mBg);

      this.modalG = i.add.graphics();
      this.modalContainer.add(this.modalG);

      this.mTitle = i.add.text(w / 2, 38, "ESCOLHA SEU CAMINHO NO ABISMO", {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "15px",
        color: "#f7e8a9",
        fontStyle: "bold"
      }).setOrigin(0.5);

      this.mSubtitle = i.add.text(w / 2, 58, "Escolha seu estilo de combate no Modo Infinito. O outro ramo permanecerá trancado nesta jornada.", {
        fontFamily: "sans-serif",
        fontSize: "9px",
        color: "#baa894"
      }).setOrigin(0.5);

      this.modalContainer.add([this.mTitle, this.mSubtitle]);

      this.cardDef = this.createChoiceCard(w / 2 - 145, 82, 270, 215, "defense");
      this.cardAtk = this.createChoiceCard(w / 2 + 145, 82, 270, 215, "attack");

      this.modalContainer.add([this.cardDef.container, this.cardAtk.container]);

      this.mFooter = i.add.text(w / 2, 326, "🎮 [D-Pad Esquerda/Direita] Selecionar    [A / Enter] Confirmar Caminho", {
        fontFamily: "sans-serif",
        fontSize: "9px",
        color: "#ffd24a"
      }).setOrigin(0.5);
      this.modalContainer.add(this.mFooter);
    }

    createChoiceCard(cx, cy, cw, ch, key) {
      const i = this.scene;
      const c = i.add.container(cx, cy);

      const bg = i.add.rectangle(0, ch / 2, cw, ch, 0x140e1f, 0.95).setInteractive({ useHandCursor: !0 });
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
        fontSize: "13px",
        color: "#f7e8a9",
        fontStyle: "bold"
      }).setOrigin(0.5);

      const tShape = i.add.text(0, 58, "", {
        fontFamily: "sans-serif",
        fontSize: "8.5px",
        color: "#a496b8"
      }).setOrigin(0.5);

      const tDesc = i.add.text(0, 80, "", {
        fontFamily: "sans-serif",
        fontSize: "8.5px",
        color: "#d8cebf",
        lineSpacing: 2.5,
        wordWrap: { width: cw - 28 }
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
        window.__triggerHaptic?.(30, 0.2);
      });

      selectBtn.on("pointerdown", () => {
        this.confirmTreeChoice(key);
      });

      return { container: c, bg, borderG, tTitle, tShape, tDesc, selectBtn, selectBtnText, key };
    }

    renderFrescoBackground() {
      const g = this.frescoG;
      g.clear();

      // Fresco frame around tree area (x: 25 to 415, y: 16 to 334)
      g.fillStyle(0x100a1c, 0.75);
      g.fillRoundedRect(25, 16, 390, 318, 6);

      // Engraved temple stone wall relief (silhouettes of ancient guardian statues from reference art)
      g.lineStyle(1.5, 0x241838, 0.6);
      g.strokeRoundedRect(27, 18, 386, 314, 5);

      // Guardian 1 (left figure with cloak & hood)
      g.lineStyle(1.2, 0x2b1e42, 0.45);
      g.strokeCircle(110, 80, 18); // Head
      g.beginPath();
      g.moveTo(110, 98); g.lineTo(110, 220); // Body
      g.moveTo(85, 110); g.lineTo(135, 110); // Shoulders
      g.moveTo(85, 110); g.lineTo(75, 290);  // Cloak left
      g.moveTo(135, 110); g.lineTo(145, 290); // Cloak right
      g.strokePath();

      // Guardian 2 (center colossus with sword)
      g.strokeCircle(210, 75, 20); // Head
      g.beginPath();
      g.moveTo(210, 95); g.lineTo(210, 240); // Body
      g.moveTo(180, 105); g.lineTo(240, 105); // Broad shoulders
      g.moveTo(180, 105); g.lineTo(170, 295);
      g.moveTo(240, 105); g.lineTo(250, 295);
      g.moveTo(210, 130); g.lineTo(210, 280); // Greatsword blade
      g.moveTo(195, 145); g.lineTo(225, 145); // Crossguard
      g.strokePath();

      // Guardian 3 (right figure with staff)
      g.strokeCircle(310, 80, 18); // Head
      g.beginPath();
      g.moveTo(310, 98); g.lineTo(310, 220);
      g.moveTo(285, 110); g.lineTo(335, 110);
      g.moveTo(285, 110); g.lineTo(275, 290);
      g.moveTo(335, 110); g.lineTo(345, 290);
      g.strokePath();

      // Right detail card background (dark parchment with double gold border)
      const px = 425, py = 16, pw = 202, ph = 318;
      g.fillStyle(0x130c1c, 0.96);
      g.fillRoundedRect(px, py, pw, ph, 4);

      // Double gold border
      g.lineStyle(2, 0x8a6a2a, 0.85);
      g.strokeRoundedRect(px, py, pw, ph, 4);
      g.lineStyle(1, 0x544018, 0.6);
      g.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 3);
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
      const typeStr = tree.treeKey === 'defense' ? "Caminho Defensivo" : "Caminho Ofensivo";
      this.titleText.setText(`${heroName.toUpperCase()} · ${tree.treeName.toUpperCase()}`);
      this.shapeTagText.setText(isLocked ? "🔒 RAMO TRANCADO NESTA RUN (MODO LEITURA)" : `${typeStr} · Geometria: ${tree.shape}`);

      // Top-right Currency Pill
      this.currencyBg.clear();
      this.currencyBg.fillStyle(0x1a1026, 0.9);
      this.currencyBg.fillRoundedRect(310, 14, 105, 22, 11);
      this.currencyBg.lineStyle(1.5, 0x5a3d7a, 0.8);
      this.currencyBg.strokeRoundedRect(310, 14, 105, 22, 11);

      this.pointsText.setText(`${pts.points} 🟣  |  ${pts.nmPoints} 💀`);

      // Toggle Tree Button Text
      const otherType = tree.treeKey === 'defense' ? "Ofensivo" : "Defensivo";
      this.toggleTreeText.setText(isLocked ? `[ (X) Voltar ao Ramo Ativo ]` : `[ (X) Inspecionar Ramo ${otherType} ]`);

      // Ensure a selected node
      if (!this.selectedNodeId || !tree.nodes.find(n => n.id === this.selectedNodeId)) {
        this.selectedNodeId = tree.nodes[0]?.id;
      }

      this.renderConduits(tree);
      this.renderNodes(tree);
      this.renderDetailCard(tree);
    }

    // Thick illuminated conduits matching media_1793127386674_e50e4b17.jpg
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
          // Fully illuminated thick golden conduit (identical to reference image)
          g.lineStyle(8, 0xffca3a, 0.3);
          g.beginPath();
          g.moveTo(fromNode.x, fromNode.y); g.lineTo(toNode.x, toNode.y);
          g.strokePath();

          g.lineStyle(4.5, 0xf7e8a9, 1);
          g.beginPath();
          g.moveTo(fromNode.x, fromNode.y); g.lineTo(toNode.x, toNode.y);
          g.strokePath();
        } else if (fromRank > 0) {
          // Half-illuminated conduit leading to available node
          g.lineStyle(5, 0x1e1528, 1);
          g.beginPath();
          g.moveTo(fromNode.x, fromNode.y); g.lineTo(toNode.x, toNode.y);
          g.strokePath();

          g.lineStyle(2, 0xc29b38, 0.7);
          g.beginPath();
          g.moveTo(fromNode.x, fromNode.y); g.lineTo(toNode.x, toNode.y);
          g.strokePath();
        } else {
          // Inactive dark thick conduit bar
          g.lineStyle(5, 0x181022, 1);
          g.beginPath();
          g.moveTo(fromNode.x, fromNode.y); g.lineTo(toNode.x, toNode.y);
          g.strokePath();

          g.lineStyle(2, 0x2b1e38, 0.6);
          g.beginPath();
          g.moveTo(fromNode.x, fromNode.y); g.lineTo(toNode.x, toNode.y);
          g.strokePath();
        }
      }
    }

    // Large cream-gold diamonds matching media_1793127386674_e50e4b17.jpg
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

        const r = 20; // Large, prominent diamond (radius 20 = 40px diameter)

        if (rank > 0) {
          // Unlocked Node: Solid bright cream-gold diamond
          if (wepActive) {
            diamondG.fillStyle(0xf7e8a9, 1);
            diamondG.lineStyle(2, 0xd8c278, 1);
          } else {
            diamondG.fillStyle(0x785a44, 1);
            diamondG.lineStyle(2, 0xaa4444, 1);
          }
        } else if (isAvailable) {
          // Next node in path: dark purple with bright pulsing gold border
          diamondG.fillStyle(0x231836, 1);
          diamondG.lineStyle(2.5, 0xffd24a, 1);
        } else {
          // Locked node: dark purple-slate diamond
          diamondG.fillStyle(0x161022, 1);
          diamondG.lineStyle(1.8, 0x38284e, 0.85);
        }

        this.drawDiamond(diamondG, 0, 0, r);

        // Center Icon Texture inside diamond
        const iconKey = node.icon || "icon-sword";
        if (this.scene.textures.exists(iconKey)) {
          const iconImg = this.scene.add.image(0, 0, iconKey).setDisplaySize(20, 20);
          if (rank > 0) {
            if (wepActive) {
              iconImg.setTint(0x1c1204).setAlpha(0.95); // Dark crisp silhouette on gold background
            } else {
              iconImg.setTint(0xff8888).setAlpha(0.85);
            }
          } else if (isAvailable) {
            iconImg.setTint(0xffd24a).setAlpha(0.9);
          } else {
            iconImg.setTint(0x4a365f).setAlpha(0.45);
          }
          nodeContainer.add(iconImg);
        }

        // Rank / Lock / Status Badges
        if (rank > 0) {
          if (!wepActive) {
            const warnBadge = this.scene.add.text(12, -12, "✕", {
              fontSize: "10px",
              color: "#ff3333",
              fontStyle: "bold"
            }).setOrigin(0.5);
            nodeContainer.add(warnBadge);
          }
          if (node.maxRank > 1) {
            const badgeBg = this.scene.add.rectangle(0, 13, 18, 9, 0x140e04, 0.9);
            const rankText = this.scene.add.text(0, 13, `${rank}/${node.maxRank}`, {
              fontFamily: "sans-serif",
              fontSize: "7.5px",
              color: wepActive ? "#ffd24a" : "#ff8888",
              fontStyle: "bold"
            }).setOrigin(0.5);
            nodeContainer.add([badgeBg, rankText]);
          } else {
            const starBadge = this.scene.add.text(11, 11, "★", {
              fontSize: "9px",
              color: "#6e4a08"
            }).setOrigin(0.5);
            nodeContainer.add(starBadge);
          }
        } else if (!prereqsMet || isLockedTree) {
          const lockText = this.scene.add.text(10, 10, "🔒", {
            fontSize: "8.5px"
          }).setOrigin(0.5);
          nodeContainer.add(lockText);
        } else {
          const plusText = this.scene.add.text(10, 10, "+", {
            fontFamily: "sans-serif",
            fontSize: "11px",
            color: "#ffd24a",
            fontStyle: "bold"
          }).setOrigin(0.5);
          nodeContainer.add(plusText);
        }

        // Selection Reticle on focused node (glowing pulsating double frame)
        if (isSelected) {
          this.cursorG.lineStyle(2.5, 0xffffff, 0.95);
          this.drawDiamond(this.cursorG, node.x, node.y, r + 6);
          this.cursorG.lineStyle(1.5, 0xffd24a, 0.7);
          this.drawDiamond(this.cursorG, node.x, node.y, r + 9);
        }

        // Interactive click zone for mouse/touch
        const hitZone = this.scene.add.zone(0, 0, 42, 42).setInteractive({ useHandCursor: !0 });
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
      if (!this.detailContent) {
        this.detailContent = this.scene.add.container(0, 0);
        this.root.add(this.detailContent);
      }
      this.detailContent.removeAll(!0);
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

      const px = 425, py = 16, pw = 202;

      // 1. Prominent Icon Box in Gold Frame
      const iconBoxX = px + 12, iconBoxY = py + 12;
      this.detailG.lineStyle(1.5, 0xc9a24a, 0.85);
      this.detailG.strokeRoundedRect(iconBoxX, iconBoxY, 34, 34, 4);
      this.detailG.fillStyle(0x1a1026, 0.95);
      this.detailG.fillRoundedRect(iconBoxX, iconBoxY, 34, 34, 4);

      const iconKey = node.icon || "icon-sword";
      if (this.scene.textures.exists(iconKey)) {
        const iconImg = this.scene.add.image(iconBoxX + 17, iconBoxY + 17, iconKey).setDisplaySize(26, 26);
        this.detailContent.add(iconImg);
      }

      // 2. Name next to Icon
      const nameX = px + 52, nameY = py + 10;
      const dName = this.scene.add.text(nameX, nameY, node.name.toUpperCase(), {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "10.5px",
        color: "#f7e8a9",
        fontStyle: "bold",
        wordWrap: { width: pw - 58 }
      });
      this.detailContent.add(dName);

      // 3. Category / Type Tag below Name
      const tagY = dName.y + dName.height + 2;
      const dTag = this.scene.add.text(nameX, tagY, `TIPO: ${node.rawType.toUpperCase()}`, {
        fontFamily: "sans-serif",
        fontSize: "8px",
        color: "#c29b38"
      });
      this.detailContent.add(dTag);

      // 4. Horizontal Gold Divider with Diamond Glyph
      const divY = Math.max(py + 52, dTag.y + dTag.height + 6);
      this.detailG.lineStyle(1, 0x8a6a2a, 0.55);
      this.detailG.beginPath();
      this.detailG.moveTo(px + 12, divY); this.detailG.lineTo(px + pw - 12, divY);
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
      const dReq = this.scene.add.text(px + 12, reqY, reqStr, {
        fontFamily: "sans-serif",
        fontSize: "8.5px",
        color: reqColor,
        wordWrap: { width: pw - 24 }
      });
      this.detailContent.add(dReq);

      // 6. Rank Indicator (Diamond Pips ◆ ◆ ◇)
      const rankY = dReq.y + dReq.height + 4;
      let pips = "";
      for (let rIdx = 1; rIdx <= node.maxRank; rIdx++) {
        pips += (rIdx <= rank) ? "◆ " : "◇ ";
      }
      const dRank = this.scene.add.text(px + 12, rankY, `GRAU: ${pips} (${rank}/${node.maxRank})`, {
        fontFamily: "sans-serif",
        fontSize: "8.5px",
        color: "#cfc4b2",
        fontStyle: "bold"
      });
      this.detailContent.add(dRank);

      // 7. Description (Spacious, comfortable reading)
      const descY = dRank.y + dRank.height + 6;
      const dDesc = this.scene.add.text(px + 12, descY, node.desc, {
        fontFamily: "sans-serif",
        fontSize: "8.5px",
        color: "#e8e0d5",
        lineSpacing: 2.5,
        wordWrap: { width: pw - 24 }
      });
      this.detailContent.add(dDesc);

      // 8. Action Button State
      if (this.viewingLockedTree) {
        this.actionBtnBg.setFillStyle(0x1a1224, 0.7);
        this.actionBtnText.setText("[ CAMINHO TRANCADO ]").setColor("#6a5a7a");
        return;
      }

      if (rank >= node.maxRank) {
        this.actionBtnBg.setFillStyle(0x241a10, 0.85);
        this.actionBtnText.setText("✓ GRAU MÁXIMO").setColor("#a6927a");
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
          this.actionBtnBg.setFillStyle(0x1e1526, 0.75);
          this.actionBtnText.setText("BLOQUEADO: NÓ ANTERIOR").setColor("#7a658a");
        } else if (!hasPoint) {
          this.actionBtnBg.setFillStyle(0x241a12, 0.75);
          this.actionBtnText.setText(isNm ? "REQUER PONTO PESADELO 💀" : "SEM PONTOS DISPONÍVEIS").setColor("#8a7762");
        } else {
          this.actionBtnBg.setFillStyle(0x784a1a, 1);
          this.actionBtnText.setText(isNm ? "[ (A) APRIMORAR (1 PESADELO) ]" : "[ (A) APRIMORAR ]").setColor("#ffffff");
        }
      }
    }

    drawDiamond(g, cx, cy, r) {
      g.beginPath();
      g.moveTo(cx, cy - r);
      g.lineTo(cx + r, cy);
      g.lineTo(cx, cy + r);
      g.lineTo(cx - r, cy);
      g.closePath();
      g.fillPath();
      g.strokePath();
    }

    renderChoiceModal() {
      if (!this.choiceModalOpen) return;
      const g = this.gs();
      if (!g || !g.classDef) return;
      const trees = window.__getHeroInfiniteTrees(g.classDef.id);

      this.populateCard(this.cardDef, trees.defense, this.choiceSel === 0);
      this.populateCard(this.cardAtk, trees.attack, this.choiceSel === 1);
    }

    populateCard(card, treeData, isSelected) {
      if (!treeData) return;
      card.tTitle.setText(treeData.treeName.toUpperCase());
      card.tShape.setText(`Formato: ${treeData.shape} · 12 Níveis de Maestria`);
      card.tDesc.setText(`${treeData.mechanic}\n\n⚔️ Armas Recomendadas: Arcos, Espadas, Adagas, Cajados ou Foices.`);

      card.borderG.clear();
      if (isSelected) {
        card.borderG.lineStyle(2.5, 0xffd24a, 1);
        card.borderG.strokeRoundedRect(-135, 0, 270, 215, 6);
        card.borderG.lineStyle(1, 0xffe680, 0.7);
        card.borderG.strokeRoundedRect(-132, 3, 264, 209, 4);

        card.selectBtn.setFillStyle(0x784a1a, 1);
        card.selectBtnText.setColor("#ffffff").setText("[ (A) CONFIRMAR ESTE ]");
      } else {
        card.borderG.lineStyle(1.5, 0x3d304f, 0.75);
        card.borderG.strokeRoundedRect(-135, 0, 270, 215, 6);

        card.selectBtn.setFillStyle(0x241a10, 0.8);
        card.selectBtnText.setColor("#a6927a").setText("[ SELECIONAR ]");
      }
    }

    openChoiceModal() {
      this.build();
      this.choiceModalOpen = !0;
      this.choiceSel = 0;
      this.modalContainer.setVisible(!0);
      this.renderChoiceModal();
      window.__triggerHaptic?.(80, 0.5);
    }

    confirmTreeChoice(key) {
      const state = this.getRunState();
      state.chosenTree = key;
      this.choiceModalOpen = !1;
      this.modalContainer.setVisible(!1);

      const g = this.gs();
      g?.game?.audioEngine?.sfx?.("sfx-shrine-use");
      window.__triggerHaptic?.(150, 0.8);
      this.scene.game.events.emit("ui:banner", `CAMINHO ESCOLHIDO: ${key === 'defense' ? 'DEFENSIVO' : 'OFENSIVO'}`, "#ffd24a");

      this.show();
    }

    toggleLockedView() {
      this.viewingLockedTree = !this.viewingLockedTree;
      const tree = this.getActiveTree();
      if (tree && tree.nodes.length > 0) {
        this.selectedNodeId = tree.nodes[0].id;
      }
      this.render();
      window.__triggerHaptic?.(30, 0.3);
    }

    triggerRespec() {
      const g = this.gs();
      if (!g) return;
      const state = this.getRunState();
      if (!state.invested || Object.keys(state.invested).length === 0) {
        this.scene.game.events.emit("ui:banner", "Nenhum ponto investido para redistribuir.", "#c29b38");
        return;
      }

      state.invested = {};
      state.spentPoints = 0;
      state.spentNmPoints = 0;

      g.stats?.recompute?.();
      g.game?.audioEngine?.sfx?.("sfx-relic-pickup");
      window.__triggerHaptic?.(100, 0.6);
      this.scene.game.events.emit("ui:banner", "PONTOS REDISTRIBUÍDOS COM SUCESSO!", "#ffd24a");
      this.render();
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

      // Check prerequisites
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

      const gScene = this.gs();
      gScene?.game?.audioEngine?.sfx?.("sfx-equip");
      window.__triggerHaptic?.(100, 0.7);

      gScene?.stats?.recompute?.();
      this.scene.game.events.emit("ui:banner", `HABILIDADE APRIMORADA: ${node.name.toUpperCase()} (GRAU ${currentRank + 1})`, "#ffd24a");
      this.render();
    }

    // Smart D-pad navigation with nearest neighbor fallback
    findClosestNodeInDir(currentNode, allNodes, dir) {
      let best = null, bestDist = 999999;
      for (const n of allNodes) {
        if (n.id === currentNode.id) continue;
        if (dir === 'UP' && n.y < currentNode.y - 10) {
          const dy = currentNode.y - n.y;
          const dx = Math.abs(n.x - currentNode.x);
          const dist = dy * 2.5 + dx;
          if (dist < bestDist) { bestDist = dist; best = n; }
        } else if (dir === 'DOWN' && n.y > currentNode.y + 10) {
          const dy = n.y - currentNode.y;
          const dx = Math.abs(n.x - currentNode.x);
          const dist = dy * 2.5 + dx;
          if (dist < bestDist) { bestDist = dist; best = n; }
        } else if (dir === 'LEFT' && n.x < currentNode.x - 10) {
          const dx = currentNode.x - n.x;
          const dy = Math.abs(n.y - currentNode.y);
          const dist = dx * 2.5 + dy;
          if (dist < bestDist) { bestDist = dist; best = n; }
        } else if (dir === 'RIGHT' && n.x > currentNode.x + 10) {
          const dx = n.x - currentNode.x;
          const dy = Math.abs(n.y - currentNode.y);
          const dist = dx * 2.5 + dy;
          if (dist < bestDist) { bestDist = dist; best = n; }
        }
      }
      return best;
    }

    handleKey(key) {
      if (this.choiceModalOpen) {
        if (key === "ArrowLeft" || key === "a" || key === "A" || key === "Left") {
          this.choiceSel = 0;
          this.renderChoiceModal();
          window.__triggerHaptic?.(25, 0.2);
          return !0;
        }
        if (key === "ArrowRight" || key === "d" || key === "D" || key === "Right") {
          this.choiceSel = 1;
          this.renderChoiceModal();
          window.__triggerHaptic?.(25, 0.2);
          return !0;
        }
        if (key === "Enter" || key === " " || key === "Space" || key === "CONFIRM") {
          this.confirmTreeChoice(this.choiceSel === 0 ? "defense" : "attack");
          return !0;
        }
        if (key === "Escape") {
          return !0; // Must choose
        }
        return !1;
      }

      if (!this.open) return !1;

      const tree = this.getActiveTree();
      if (!tree) return !1;
      const currentNode = tree.nodes.find(n => n.id === this.selectedNodeId);
      if (!currentNode) return !1;

      if (key === "ArrowUp" || key === "w" || key === "W" || key === "Up") {
        let targetId = currentNode.nav?.up;
        if (!targetId) {
          const fallback = this.findClosestNodeInDir(currentNode, tree.nodes, 'UP');
          targetId = fallback?.id;
        }
        if (targetId) {
          this.selectedNodeId = targetId;
          this.render();
          window.__triggerHaptic?.(25, 0.2);
        }
        return !0;
      }

      if (key === "ArrowDown" || key === "s" || key === "S" || key === "Down") {
        let targetId = currentNode.nav?.down;
        if (!targetId) {
          const fallback = this.findClosestNodeInDir(currentNode, tree.nodes, 'DOWN');
          targetId = fallback?.id;
        }
        if (targetId) {
          this.selectedNodeId = targetId;
          this.render();
          window.__triggerHaptic?.(25, 0.2);
        }
        return !0;
      }

      if (key === "ArrowLeft" || key === "a" || key === "A" || key === "Left") {
        let targetId = currentNode.nav?.left;
        if (!targetId) {
          const fallback = this.findClosestNodeInDir(currentNode, tree.nodes, 'LEFT');
          targetId = fallback?.id;
        }
        if (targetId) {
          this.selectedNodeId = targetId;
          this.render();
          window.__triggerHaptic?.(25, 0.2);
        }
        return !0;
      }

      if (key === "ArrowRight" || key === "d" || key === "D" || key === "Right") {
        let targetId = currentNode.nav?.right;
        if (!targetId) {
          const fallback = this.findClosestNodeInDir(currentNode, tree.nodes, 'RIGHT');
          targetId = fallback?.id;
        }
        if (targetId) {
          this.selectedNodeId = targetId;
          this.render();
          window.__triggerHaptic?.(25, 0.2);
        }
        return !0;
      }

      if (key === "Enter" || key === " " || key === "Space" || key === "CONFIRM") {
        this.upgradeSelected();
        return !0;
      }

      if (key === "x" || key === "X") {
        this.toggleLockedView();
        return !0;
      }

      if (key === "y" || key === "Y") {
        this.triggerRespec();
        return !0;
      }

      if (key === "Escape" || key === "b" || key === "B" || key === "CANCEL") {
        this.close();
        return !0;
      }

      return !1;
    }

    show() {
      const g = this.gs();
      if (!g || g.state !== "playing") return;
      this.build();

      const state = this.getRunState();
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
      this.root.setVisible(!1);
      this.modalContainer?.setVisible(!1);
      this.scene.game.events.emit("ui:inventory", !1);
    }
  }

  window.InfiniteSkillTreeUI = InfiniteSkillTreeUI;
})();
'''

with open(UI_FILE, 'w', encoding='utf-8') as f:
    f.write(code)

shutil.copyfile(UI_FILE, MIRROR_UI)
print("Saved brand new, reference-faithful infinite-skills-ui.js and mirror!")
