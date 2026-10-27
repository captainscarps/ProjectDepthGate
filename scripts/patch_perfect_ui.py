import os, sys, shutil

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UI_FILE = os.path.join(ROOT, "assets", "infinite-skills-ui.js")
MIRROR_UI = os.path.join(ROOT, "Projeto atualizado", "assets", "infinite-skills-ui.js")

with open(UI_FILE, 'r', encoding='utf-8') as f:
    s = f.read()

# 1. Update renderFrescoBackground parchment dimensions
old_fresco = '''      // Right detail card background (dark parchment with double gold border)
      const px = 375, py = 16, pw = 235, ph = 315;
      g.fillStyle(0x110c1c, 0.95);
      g.fillRoundedRect(px, py, pw, ph, 4);

      // Double gold border
      g.lineStyle(2, 0x8a6a2a, 0.85);
      g.strokeRoundedRect(px, py, pw, ph, 4);
      g.lineStyle(1, 0x544018, 0.7);
      g.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 3);

      // Diamond ornament divider (◆ ─── ◆)
      g.lineStyle(1, 0x8a6a2a, 0.6);
      g.beginPath();
      g.moveTo(px + 20, py + 74); g.lineTo(px + pw - 20, py + 74);
      g.strokePath();'''

new_fresco = '''      // Right detail card background (dark parchment with double gold border)
      const px = 375, py = 16, pw = 235, ph = 320;
      g.fillStyle(0x110c1c, 0.95);
      g.fillRoundedRect(px, py, pw, ph, 4);

      // Double gold border
      g.lineStyle(2, 0x8a6a2a, 0.85);
      g.strokeRoundedRect(px, py, pw, ph, 4);
      g.lineStyle(1, 0x544018, 0.7);
      g.strokeRoundedRect(px + 3, py + 3, pw - 6, ph - 6, 3);'''

if old_fresco in s:
    s = s.replace(old_fresco, new_fresco, 1)
    print("Updated renderFrescoBackground parchment")

# 2. Update footer position in build()
old_footer = 'this.footerText = i.add.text(w / 2, 342,'
new_footer = 'this.footerText = i.add.text(w / 2, 348,'
if old_footer in s:
    s = s.replace(old_footer, new_footer, 1)
    print("Updated footer position to 348")

# 3. Add detailCardContent container in build()
old_detailG = 'this.detailG = i.add.graphics();\n      this.root.add(this.detailG);'
new_detailG = 'this.detailG = i.add.graphics();\n      this.root.add(this.detailG);\n      this.detailCardContent = i.add.container(0, 0);\n      this.root.add(this.detailCardContent);'
if old_detailG in s:
    s = s.replace(old_detailG, new_detailG, 1)
    print("Added detailCardContent container in build()")

# 4. Replace renderNodes to render ability icons inside diamonds
pos_rn = s.find('renderNodes(tree) {')
pos_rn_end = s.find('renderDetailCard(tree) {', pos_rn)

old_renderNodes = s[pos_rn:pos_rn_end]

new_renderNodes = '''renderNodes(tree) {
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

    '''

s = s.replace(old_renderNodes, new_renderNodes, 1)
print("Replaced renderNodes with full icon and badge rendering")

# 5. Replace renderDetailCard with dynamic flow layout and prominent icon display
pos_rdc = s.find('renderDetailCard(tree) {')
pos_rdc_end = s.find('upgradeSelected() {', pos_rdc)

old_renderDetailCard = s[pos_rdc:pos_rdc_end]

new_renderDetailCard = '''renderDetailCard(tree) {
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

    '''

s = s.replace(old_renderDetailCard, new_renderDetailCard, 1)
print("Replaced renderDetailCard with dynamic flow layout and no overflow")

with open(UI_FILE, 'w', encoding='utf-8') as f:
    f.write(s)

shutil.copyfile(UI_FILE, MIRROR_UI)
print("Saved infinite-skills-ui.js and mirror!")
