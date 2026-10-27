// Abyss Branching Portals, Cursed Pacts, and Elemental Build Auras
// Full Gamepad, Touch, and Keyboard navigation with tactile haptics
(() => {
  // --- 1. PACTS & CURSED RELICS DATA ---
  const ABYSS_PACTS = [
    {
      id: "eye_of_doom",
      name: "Olho da Perdição",
      icon: "👁️",
      color: "#ff4466",
      boon: "+50% de Dano Crítico",
      curse: "Poções curam 40% a menos",
      mods: { critAdd: 50, potionPower: -0.4 }
    },
    {
      id: "shadow_pact",
      name: "Pacto das Sombras",
      icon: "🌑",
      color: "#b055ff",
      boon: "Drops e Ouro coletados dobrados (+100%)",
      curse: "Inimigos movem-se 25% mais rápido",
      mods: { goldMult: 1.0, enemySpeedMult: 1.25 }
    },
    {
      id: "glass_heart",
      name: "Coração de Vidro",
      icon: "💎",
      color: "#00e5ff",
      boon: "Dano Total multiplicado por ×2.0",
      curse: "Vida máxima reduzida pela metade (-50%)",
      mods: { damageMult: 1.0, maxHpMult: 0.5 }
    },
    {
      id: "vampiric_blade",
      name: "Lâmina Sôfrega",
      icon: "🩸",
      color: "#ff2233",
      boon: "Cada abate restaura +5% de vida máxima",
      curse: "Perde 1 de vida a cada 10s sem abater",
      mods: { killHealPct: 0.05, hungerTick: 10 }
    },
    {
      id: "bloody_bulwark",
      name: "Muralha Sangrenta",
      icon: "🛡️",
      color: "#e6a100",
      boon: "+30 de Defesa física e mágica",
      curse: "Velocidade de movimento reduzida em -15%",
      mods: { defenseAdd: 30, speedMult: -0.15 }
    }
  ];

  window.__ABYSS_PACTS = ABYSS_PACTS;

  // Active pacts for current run
  window.__getActivePacts = function(scene) {
    if (!scene) return [];
    if (!scene.registry.has("endless:activePacts")) {
      scene.registry.set("endless:activePacts", []);
    }
    return scene.registry.get("endless:activePacts");
  };

  window.__getAbyssPactModifiers = function(scene) {
    if (!scene || scene.mode !== "endless") return {};
    const pacts = window.__getActivePacts(scene);
    let damageMult = 0;
    let defenseAdd = 0;
    let critAdd = 0;
    let speedMult = 0;
    let goldMult = 0;

    for (const pactId of pacts) {
      const def = ABYSS_PACTS.find(p => p.id === pactId);
      if (def?.mods) {
        if (def.mods.damageMult) damageMult += def.mods.damageMult;
        if (def.mods.defenseAdd) defenseAdd += def.mods.defenseAdd;
        if (def.mods.critAdd) critAdd += def.mods.critAdd;
        if (def.mods.speedMult) speedMult += def.mods.speedMult;
        if (def.mods.goldMult) goldMult += def.mods.goldMult;
      }
    }

    return { damageMult, defenseAdd, critAdd, speedMult, goldMult };
  };

  // --- 2. BRANCHING PORTALS UI (Escolha de Caminho entre Andares) ---
  class AbyssPortalChoiceUI {
    constructor(scene) {
      this.ui = scene;
      this.open = !1;
      this.built = !1;
      this.selectedIdx = 0;
      this.cards = [];
      this.onChoice = null;
    }

    gs() {
      return this.ui.scene.get("Game");
    }

    build() {
      if (this.built) return;
      this.built = !0;
      const i = this.ui;
      const w = 640, h = 360;

      this.root = i.add.container(0, 0).setDepth(910).setVisible(!1);

      this.backdrop = i.add.rectangle(w / 2, h / 2, w * 1.5, h * 1.5, 0x06040b, 0.94).setInteractive();
      this.root.add(this.backdrop);

      this.frameG = i.add.graphics();
      this.root.add(this.frameG);

      this.title = i.add.text(w / 2, 38, "ESCOLHA SEU CAMINHO NO ABISMO", {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "16px",
        color: "#ffd24a",
        fontStyle: "bold"
      }).setOrigin(0.5);

      this.subtitle = i.add.text(w / 2, 60, "Selecione o destino para a próxima descida nas profundezas", {
        fontFamily: "sans-serif",
        fontSize: "9.5px",
        color: "#9e8e76"
      }).setOrigin(0.5);

      this.root.add([this.title, this.subtitle]);

      this.cardsContainer = i.add.container(0, 0);
      this.root.add(this.cardsContainer);

      this.footerText = i.add.text(w / 2, 328, "🎮 [D-Pad Esquerda/Direita] Navegar   [A / Enter] Entrar no Portal", {
        fontFamily: "sans-serif",
        fontSize: "9.5px",
        color: "#ffd24a"
      }).setOrigin(0.5);
      this.root.add(this.footerText);
    }

    // Open portal choices for the next depth
    show(nextDepth, onChoiceCallback) {
      this.build();
      this.open = !0;
      this.onChoice = onChoiceCallback;
      this.selectedIdx = 0;
      this.root.setVisible(!0);

      // Generate 3 random portal choices
      const possiblePortals = [
        {
          type: "puzzle",
          title: "CÂMARA DO ENIGMA",
          icon: "🧩",
          badgeColor: "#00e5ff",
          desc: "Um enigma ancestral de luz ou runas.\n\n✨ Recompensa: +1 Ponto de Habilidade Extra e Equipamento Raro garantido!"
        },
        {
          type: "elite",
          title: "COVIL DE ELITE",
          icon: "💀",
          badgeColor: "#ff4455",
          desc: "Inimigos de elite perigosos com vida dobrada.\n\n🏆 Recompensa: Baú de Tesouro Lendário com alta chance das armas da Página 21!"
        },
        {
          type: "shop",
          title: "BAZAR & ALTAR",
          icon: "🪙",
          badgeColor: "#ffd24a",
          desc: "Refúgio pacífico com o Mercador das Sombras.\n\n🔥 Fogueira de cura e Altar de Redistribuição de Pontos (Re-spec)!"
        },
        {
          type: "pact",
          title: "ALTAR DO PACTO",
          icon: "🩸",
          badgeColor: "#b055ff",
          desc: "Comungue com entidades do abismo.\n\n⚡ Recompensa: Escolha uma Relíquia Amaldiçoada com bônus colossais!"
        }
      ];

      // Shuffle and pick 3
      Phaser.Utils.Array.Shuffle(possiblePortals);
      this.cards = possiblePortals.slice(0, 3);

      this.renderCards();
      window.__triggerHaptic?.(60, 0.4);
    }

    close() {
      if (!this.open) return;
      this.open = !1;
      this.root.setVisible(!1);
    }

    renderCards() {
      this.cardsContainer.removeAll(!0);
      const w = 640;
      const cardW = 175, cardH = 220;
      const startX = w / 2 - (cardW * 1.5 + 20) + cardW / 2;
      const cardY = 82;

      for (let idx = 0; idx < this.cards.length; idx++) {
        const cData = this.cards[idx];
        const cx = startX + idx * (cardW + 20);
        const isSel = idx === this.selectedIdx;

        const cardC = this.ui.add.container(cx, cardY);

        const bg = this.ui.add.rectangle(0, cardH / 2, cardW, cardH, 0x120d1e, 0.95);
        const borderG = this.ui.add.graphics();

        if (isSel) {
          borderG.lineStyle(2.5, 0xffd24a, 1);
          borderG.strokeRoundedRect(-cardW / 2, 0, cardW, cardH, 6);
          borderG.lineStyle(1, 0xffe680, 0.7);
          borderG.strokeRoundedRect(-cardW / 2 + 3, 3, cardW - 6, cardH - 6, 4);
        } else {
          borderG.lineStyle(1.5, 0x3d304f, 0.8);
          borderG.strokeRoundedRect(-cardW / 2, 0, cardW, cardH, 6);
        }

        const iconT = this.ui.add.text(0, 32, cData.icon, {
          fontSize: "26px"
        }).setOrigin(0.5);

        const titleT = this.ui.add.text(0, 68, cData.title, {
          fontFamily: "Cinzel, Georgia, serif",
          fontSize: "11px",
          color: isSel ? "#ffffff" : cData.badgeColor,
          fontStyle: "bold"
        }).setOrigin(0.5);

        const descT = this.ui.add.text(0, 92, cData.desc, {
          fontFamily: "sans-serif",
          fontSize: "9px",
          color: isSel ? "#f2ede4" : "#baa892",
          lineSpacing: 2,
          wordWrap: { width: cardW - 24 }
        }).setOrigin(0.5, 0);

        const btn = this.ui.add.rectangle(0, cardH - 20, cardW - 30, 22, isSel ? 0x6e4318 : 0x241a2e).setInteractive({ useHandCursor: !0 });
        const btnT = this.ui.add.text(0, cardH - 20, isSel ? "[ (A) ENTRAR ]" : "[ SELECIONAR ]", {
          fontFamily: "sans-serif",
          fontSize: "9px",
          color: isSel ? "#ffd24a" : "#8a7e6a",
          fontStyle: "bold"
        }).setOrigin(0.5);

        const curIdx = idx;
        bg.setInteractive({ useHandCursor: !0 }).on("pointerdown", () => {
          this.selectedIdx = curIdx;
          this.renderCards();
          window.__triggerHaptic?.(30, 0.2);
        });

        btn.on("pointerdown", () => {
          this.confirmChoice(curIdx);
        });

        cardC.add([bg, borderG, iconT, titleT, descT, btn, btnT]);
        this.cardsContainer.add(cardC);
      }
    }

    confirmChoice(idx) {
      const choice = this.cards[idx];
      this.close();
      window.__triggerHaptic?.(120, 0.6);
      if (typeof this.onChoice === "function") {
        this.onChoice(choice.type);
      }
    }

    handleKey(key) {
      if (!this.open) return !1;

      if (key === "ArrowLeft" || key === "a" || key === "A" || key === "Left" || key === "LEFT") {
        if (this.selectedIdx > 0) {
          this.selectedIdx--;
          this.renderCards();
          window.__triggerHaptic?.(30, 0.2);
        }
        return !0;
      }
      if (key === "ArrowRight" || key === "d" || key === "D" || key === "Right" || key === "RIGHT") {
        if (this.selectedIdx < this.cards.length - 1) {
          this.selectedIdx++;
          this.renderCards();
          window.__triggerHaptic?.(30, 0.2);
        }
        return !0;
      }
      if (key === "Enter" || key === " " || key === "Space" || key === "CONFIRM" || key === "z" || key === "Z") {
        this.confirmChoice(this.selectedIdx);
        return !0;
      }
      if (key === "Escape" || key === "b" || key === "B" || key === "CANCEL" || key === "x" || key === "X") {
        // Default to first card if backed out
        this.confirmChoice(this.selectedIdx);
        return !0;
      }

      return !1;
    }
  }

  // --- 3. CURSED PACTS UI (Escolha de Pactos Amaldiçoados) ---
  class AbyssPactsUI {
    constructor(scene) {
      this.ui = scene;
      this.open = !1;
      this.built = !1;
      this.selectedIdx = 0;
      this.pacts = [];
    }

    build() {
      if (this.built) return;
      this.built = !0;
      const i = this.ui;
      const w = 640, h = 360;

      this.root = i.add.container(0, 0).setDepth(920).setVisible(!1);

      this.backdrop = i.add.rectangle(w / 2, h / 2, w * 1.5, h * 1.5, 0x050308, 0.95).setInteractive();
      this.root.add(this.backdrop);

      this.title = i.add.text(w / 2, 36, "PACTO DAS PROFUNDEZAS", {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "16px",
        color: "#ff3355",
        fontStyle: "bold"
      }).setOrigin(0.5);

      this.subtitle = i.add.text(w / 2, 58, "Aceite um poder proibido... ao custo de uma terrível maldição", {
        fontFamily: "sans-serif",
        fontSize: "9.5px",
        color: "#c29b9b"
      }).setOrigin(0.5);

      this.root.add([this.title, this.subtitle]);

      this.pactsContainer = i.add.container(0, 0);
      this.root.add(this.pactsContainer);

      this.footerText = i.add.text(w / 2, 330, "🎮 [D-Pad Esquerda/Direita] Selecionar   [A] Aceitar Pacto   [B / Esc] Recusar", {
        fontFamily: "sans-serif",
        fontSize: "9.5px",
        color: "#ffd24a"
      }).setOrigin(0.5);
      this.root.add(this.footerText);
    }

    show() {
      this.build();
      this.open = !0;
      this.selectedIdx = 0;
      this.root.setVisible(!0);

      // Offer 3 random pacts from ABYSS_PACTS
      const available = [...ABYSS_PACTS];
      Phaser.Utils.Array.Shuffle(available);
      this.pacts = available.slice(0, 3);

      this.renderPacts();
      window.__triggerHaptic?.(100, 0.5);
    }

    close() {
      if (!this.open) return;
      this.open = !1;
      this.root.setVisible(!1);
    }

    renderPacts() {
      this.pactsContainer.removeAll(!0);
      const w = 640;
      const cardW = 175, cardH = 220;
      const startX = w / 2 - (cardW * 1.5 + 20) + cardW / 2;
      const cardY = 82;

      for (let idx = 0; idx < this.pacts.length; idx++) {
        const pData = this.pacts[idx];
        const cx = startX + idx * (cardW + 20);
        const isSel = idx === this.selectedIdx;

        const cardC = this.ui.add.container(cx, cardY);
        const bg = this.ui.add.rectangle(0, cardH / 2, cardW, cardH, 0x160c18, 0.95);
        const borderG = this.ui.add.graphics();

        if (isSel) {
          borderG.lineStyle(2.5, 0xff3355, 1);
          borderG.strokeRoundedRect(-cardW / 2, 0, cardW, cardH, 6);
          borderG.lineStyle(1, 0xff8899, 0.7);
          borderG.strokeRoundedRect(-cardW / 2 + 3, 3, cardW - 6, cardH - 6, 4);
        } else {
          borderG.lineStyle(1.5, 0x4a2233, 0.8);
          borderG.strokeRoundedRect(-cardW / 2, 0, cardW, cardH, 6);
        }

        const iconT = this.ui.add.text(0, 30, pData.icon, { fontSize: "26px" }).setOrigin(0.5);

        const titleT = this.ui.add.text(0, 64, pData.name.toUpperCase(), {
          fontFamily: "Cinzel, Georgia, serif",
          fontSize: "11px",
          color: isSel ? "#ffffff" : pData.color,
          fontStyle: "bold"
        }).setOrigin(0.5);

        // Boon
        const boonT = this.ui.add.text(0, 95, `✓ BÊNÇÃO:\n${pData.boon}`, {
          fontFamily: "sans-serif", fontSize: "9px", color: "#55ff88", fontStyle: "bold", wordWrap: { width: cardW - 24 }, lineSpacing: 2
        }).setOrigin(0.5, 0);

        // Curse
        const curseT = this.ui.add.text(0, 145, `✗ MALDIÇÃO:\n${pData.curse}`, {
          fontFamily: "sans-serif", fontSize: "9px", color: "#ff5555", fontStyle: "bold", wordWrap: { width: cardW - 24 }, lineSpacing: 2
        }).setOrigin(0.5, 0);

        const btn = this.ui.add.rectangle(0, cardH - 20, cardW - 30, 22, isSel ? 0x6e1828 : 0x241018).setInteractive({ useHandCursor: !0 });
        const btnT = this.ui.add.text(0, cardH - 20, isSel ? "[ ACEITAR PACTO ]" : "[ EXAMINAR ]", {
          fontFamily: "sans-serif", fontSize: "9px", color: isSel ? "#ff8899" : "#a66a7a", fontStyle: "bold"
        }).setOrigin(0.5);

        const curIdx = idx;
        bg.setInteractive({ useHandCursor: !0 }).on("pointerdown", () => {
          this.selectedIdx = curIdx;
          this.renderPacts();
          window.__triggerHaptic?.(30, 0.2);
        });

        btn.on("pointerdown", () => {
          this.acceptPact(curIdx);
        });

        cardC.add([bg, borderG, iconT, titleT, boonT, curseT, btn, btnT]);
        this.pactsContainer.add(cardC);
      }
    }

    acceptPact(idx) {
      const chosen = this.pacts[idx];
      const g = this.ui.scene.get("Game");
      if (g) {
        const pacts = window.__getActivePacts(g);
        pacts.push(chosen.id);
        g.stats?.recompute();
        g.game?.audioEngine?.sfx?.("sfx-boss-spawn");
        this.ui.game.events.emit("ui:banner", `PACTO ACEITO: ${chosen.name.toUpperCase()}!`, chosen.color);
      }
      this.close();
      window.__triggerHaptic?.(200, 0.9);
    }

    handleKey(key) {
      if (!this.open) return !1;

      if (key === "ArrowLeft" || key === "a" || key === "A" || key === "Left" || key === "LEFT") {
        if (this.selectedIdx > 0) {
          this.selectedIdx--;
          this.renderPacts();
          window.__triggerHaptic?.(30, 0.2);
        }
        return !0;
      }
      if (key === "ArrowRight" || key === "d" || key === "D" || key === "Right" || key === "RIGHT") {
        if (this.selectedIdx < this.pacts.length - 1) {
          this.selectedIdx++;
          this.renderPacts();
          window.__triggerHaptic?.(30, 0.2);
        }
        return !0;
      }
      if (key === "Enter" || key === " " || key === "Space" || key === "CONFIRM" || key === "z" || key === "Z") {
        this.acceptPact(this.selectedIdx);
        return !0;
      }
      if (key === "Escape" || key === "b" || key === "B" || key === "CANCEL" || key === "x" || key === "X") {
        // Decline pact
        this.close();
        window.__triggerHaptic?.(50, 0.3);
        return !0;
      }

      return !1;
    }
  }

  // --- 4. BUILD VISUAL ELEMENTAL AURAS ---
  class BuildVisualAuras {
    static updatePlayerAura(scene) {
      if (!scene || scene.mode !== "endless" || !scene.player) return;
      const skillsState = scene.registry?.get("endless:skills");
      if (!skillsState || !skillsState.chosenTree) return;

      const p = scene.player;
      if (!p.__auraG) {
        p.__auraG = scene.add.graphics().setDepth(p.depth - 1);
      }
      const g = p.__auraG;
      g.clear();

      const treeKey = skillsState.chosenTree;
      const heroId = scene.classDef?.id;

      // Color themes:
      // Fire/Fury: 0xff6600
      // Frost/Ice/Bones: 0x00ccff
      // Poison/Curare/Shadows: 0x00ff66
      // Aegis/Defense/Shield: 0xffd24a
      let auraColor = 0xffd24a;
      if (treeKey === "attack") {
        auraColor = (heroId === "MAGE" || heroId === "WARRIOR") ? 0xff5511 : (heroId === "SHAMAN" || heroId === "ROGUE") ? 0x00ff88 : 0xaa44ff;
      } else {
        auraColor = (heroId === "MAGE" || heroId === "ARCHER") ? 0x00ccff : (heroId === "NECROMANCER") ? 0x8844ff : 0xffcc22;
      }

      // Draw subtle glowing rune halo at feet
      const time = scene.time.now * 0.003;
      const pulseR = 16 + Math.sin(time) * 3;

      g.lineStyle(2, auraColor, 0.65);
      g.strokeCircle(p.x, p.y + 12, pulseR);

      g.fillStyle(auraColor, 0.15);
      g.fillCircle(p.x, p.y + 12, pulseR);
    }
  }

  window.AbyssPortalChoiceUI = AbyssPortalChoiceUI;
  window.AbyssPactsUI = AbyssPactsUI;
  window.BuildVisualAuras = BuildVisualAuras;

  // Global opener helpers
  window.__openAbyssPortalModal = function(uiScene, nextDepth, callback) {
    if (!uiScene) return;
    if (!uiScene.__portalChoiceUI) {
      uiScene.__portalChoiceUI = new AbyssPortalChoiceUI(uiScene);
    }
    uiScene.__portalChoiceUI.show(nextDepth, callback);
  };

  window.__openAbyssPactsModal = function(uiScene) {
    if (!uiScene) return;
    if (!uiScene.__pactsUI) {
      uiScene.__pactsUI = new AbyssPactsUI(uiScene);
    }
    uiScene.__pactsUI.show();
  };
})();
