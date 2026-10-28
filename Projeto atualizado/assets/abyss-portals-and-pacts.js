// Abyss Branching Portals, Cursed Pacts, and Elemental Build Auras
// Full Gamepad, Touch, and Keyboard navigation with tactile haptics & Fullscreen Responsive Layout
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

  function getViewport(scene) {
    const sc = scene?.scale;
    const cam = scene?.cameras?.main;
    const w = sc?.width || cam?.width || 640;
    const h = sc?.height || cam?.height || 360;
    return { w, h, cx: Math.round(w / 2), cy: Math.round(h / 2) };
  }

  // --- 2. BRANCHING PORTALS UI (Escolha de Caminho entre Andares - 100% Fullscreen) ---
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
      const { w, h, cx, cy } = getViewport(i);

      this.root = i.add.container(0, 0).setDepth(910).setVisible(!1);

      // Fundo infinito que cobre toda e qualquer resolução / tela cheia / ultrawide
      this.backdrop = i.add.rectangle(cx, cy, Math.max(w * 4, 3840), Math.max(h * 4, 2160), 0x06040b, 0.95).setOrigin(0.5).setInteractive();
      this.root.add(this.backdrop);

      this.frameG = i.add.graphics();
      this.root.add(this.frameG);

      this.title = i.add.text(cx, Math.max(26, cy - 138), "ESCOLHA SEU CAMINHO NO ABISMO", {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "17px",
        color: "#ffd24a",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3
      }).setOrigin(0.5);

      this.subtitle = i.add.text(cx, Math.max(50, cy - 114), "Selecione o destino para a próxima descida nas profundezas", {
        fontFamily: "sans-serif",
        fontSize: "10px",
        color: "#c2ab87"
      }).setOrigin(0.5);

      this.root.add([this.title, this.subtitle]);

      this.cardsContainer = i.add.container(0, 0);
      this.root.add(this.cardsContainer);

      this.footerText = i.add.text(cx, Math.min(h - 22, cy + 146), "🎮 [D-Pad Esquerda/Direita] Navegar   [A / Enter] Entrar no Portal", {
        fontFamily: "sans-serif",
        fontSize: "10px",
        color: "#ffd24a",
        stroke: "#000000",
        strokeThickness: 2
      }).setOrigin(0.5);
      this.root.add(this.footerText);

      // Redimensionamento responsivo automático em fullscreen / resize
      i.scale?.on("resize", () => {
        if (this.open) this.layout();
      });
    }

    layout() {
      if (!this.root || !this.ui) return;
      const { w, h, cx, cy } = getViewport(this.ui);
      this.backdrop.setPosition(cx, cy).setSize(Math.max(w * 4, 3840), Math.max(h * 4, 2160));
      this.title.setPosition(cx, Math.max(26, cy - 138));
      this.subtitle.setPosition(cx, Math.max(50, cy - 114));
      this.footerText.setPosition(cx, Math.min(h - 22, cy + 146));
      this.renderCards();
    }

    show(nextDepth, onChoiceCallback) {
      this.build();
      this.open = !0;
      this.onChoice = onChoiceCallback;
      this.selectedIdx = 0;
      this.root.setVisible(!0);
      this.ui.game?.events?.emit("ui:inventory", !0);

      const possiblePortals = [
        {
          type: "puzzle",
          title: "CÂMARA DO ENIGMA",
          icon: "🧩",
          badgeColor: "#00e5ff",
          desc: "Um enigma ancestral de luz ou runas místicas.\n\n✨ Recompensa: +1 Ponto de Habilidade Extra e Baú de Relíquia garantido!"
        },
        {
          type: "elite",
          title: "COVIL DE ELITE",
          icon: "💀",
          badgeColor: "#ff4455",
          desc: "Inimigos de elite coléricos com vida e agressividade aumentadas.\n\n🏆 Recompensa: Baú Lendário com alta chance das armas supremas!"
        },
        {
          type: "shop",
          title: "BAZAR & ALTAR",
          icon: "🪙",
          badgeColor: "#ffd24a",
          desc: "Refúgio pacífico com o Mercador das Sombras.\n\n🔥 Fogueira restauradora e Altar de Purificação / Redistribuição de Pontos!"
        },
        {
          type: "pact",
          title: "ALTAR DO PACTO",
          icon: "🩸",
          badgeColor: "#b055ff",
          desc: "Comungue com entidades esquecidas do abismo.\n\n⚡ Recompensa: Escolha uma Relíquia Amaldiçoada com poderes devastadores!"
        }
      ];

      Phaser.Utils.Array.Shuffle(possiblePortals);
      this.cards = possiblePortals.slice(0, 3);

      this.layout();
      window.__triggerHaptic?.(60, 0.4);
    }

    close() {
      if (!this.open) return;
      this.open = !1;
      this.root.setVisible(!1);
      this.ui.game?.events?.emit("ui:inventory", !1);
    }

    renderCards() {
      this.cardsContainer.removeAll(!0);
      const { cx, cy } = getViewport(this.ui);
      const cardW = 184, cardH = 224;
      const gap = 20;
      const totalW = this.cards.length * cardW + (this.cards.length - 1) * gap;
      const startX = cx - totalW / 2 + cardW / 2;
      const cardY = cy - cardH / 2 + 6;

      for (let idx = 0; idx < this.cards.length; idx++) {
        const cData = this.cards[idx];
        const curX = startX + idx * (cardW + gap);
        const isSel = idx === this.selectedIdx;

        const cardC = this.ui.add.container(curX, cardY);

        const bg = this.ui.add.rectangle(0, cardH / 2, cardW, cardH, isSel ? 0x1b132c : 0x110b1a, 0.96);
        const borderG = this.ui.add.graphics();

        if (isSel) {
          borderG.lineStyle(2.5, 0xffd24a, 1);
          borderG.strokeRoundedRect(-cardW / 2, 0, cardW, cardH, 8);
          borderG.lineStyle(1, 0xffe680, 0.7);
          borderG.strokeRoundedRect(-cardW / 2 + 3, 3, cardW - 6, cardH - 6, 6);
        } else {
          borderG.lineStyle(1.5, 0x483a5e, 0.85);
          borderG.strokeRoundedRect(-cardW / 2, 0, cardW, cardH, 8);
        }

        const iconT = this.ui.add.text(0, 32, cData.icon, {
          fontSize: "28px"
        }).setOrigin(0.5);

        const titleT = this.ui.add.text(0, 70, cData.title, {
          fontFamily: "Cinzel, Georgia, serif",
          fontSize: "11px",
          color: isSel ? "#ffffff" : cData.badgeColor,
          fontStyle: "bold"
        }).setOrigin(0.5);

        const descT = this.ui.add.text(0, 96, cData.desc, {
          fontFamily: "sans-serif",
          fontSize: "9px",
          color: isSel ? "#f5f0e6" : "#baa892",
          lineSpacing: 3,
          wordWrap: { width: cardW - 24 }
        }).setOrigin(0.5, 0);

        const btn = this.ui.add.rectangle(0, cardH - 22, cardW - 32, 24, isSel ? 0x7a4a1a : 0x241830).setInteractive({ useHandCursor: !0 });
        const btnT = this.ui.add.text(0, cardH - 22, isSel ? "[ (A) ENTRAR ]" : "[ SELECIONAR ]", {
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
        this.confirmChoice(this.selectedIdx);
        return !0;
      }

      return !1;
    }
  }

  // --- 3. CURSED PACTS UI (Escolha de Pactos Amaldiçoados - 100% Fullscreen) ---
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
      const { w, h, cx, cy } = getViewport(i);

      this.root = i.add.container(0, 0).setDepth(920).setVisible(!1);

      this.backdrop = i.add.rectangle(cx, cy, Math.max(w * 4, 3840), Math.max(h * 4, 2160), 0x050308, 0.96).setOrigin(0.5).setInteractive();
      this.root.add(this.backdrop);

      this.title = i.add.text(cx, Math.max(26, cy - 138), "PACTO DAS PROFUNDEZAS", {
        fontFamily: "Cinzel, Georgia, serif",
        fontSize: "17px",
        color: "#ff3355",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3
      }).setOrigin(0.5);

      this.subtitle = i.add.text(cx, Math.max(50, cy - 114), "Aceite um poder proibido... ao custo de uma terrível maldição", {
        fontFamily: "sans-serif",
        fontSize: "10px",
        color: "#d8a4a4"
      }).setOrigin(0.5);

      this.root.add([this.title, this.subtitle]);

      this.pactsContainer = i.add.container(0, 0);
      this.root.add(this.pactsContainer);

      this.footerText = i.add.text(cx, Math.min(h - 22, cy + 146), "🎮 [D-Pad Esquerda/Direita] Selecionar   [A] Aceitar Pacto   [B / Esc] Recusar", {
        fontFamily: "sans-serif",
        fontSize: "10px",
        color: "#ffd24a",
        stroke: "#000000",
        strokeThickness: 2
      }).setOrigin(0.5);
      this.root.add(this.footerText);

      i.scale?.on("resize", () => {
        if (this.open) this.layout();
      });
    }

    layout() {
      if (!this.root || !this.ui) return;
      const { w, h, cx, cy } = getViewport(this.ui);
      this.backdrop.setPosition(cx, cy).setSize(Math.max(w * 4, 3840), Math.max(h * 4, 2160));
      this.title.setPosition(cx, Math.max(26, cy - 138));
      this.subtitle.setPosition(cx, Math.max(50, cy - 114));
      this.footerText.setPosition(cx, Math.min(h - 22, cy + 146));
      this.renderPacts();
    }

    show() {
      this.build();
      this.open = !0;
      this.selectedIdx = 0;
      this.root.setVisible(!0);

      const available = [...ABYSS_PACTS];
      Phaser.Utils.Array.Shuffle(available);
      this.pacts = available.slice(0, 3);

      this.layout();
      window.__triggerHaptic?.(100, 0.5);
    }

    close() {
      if (!this.open) return;
      this.open = !1;
      this.root.setVisible(!1);
    }

    renderPacts() {
      this.pactsContainer.removeAll(!0);
      const { cx, cy } = getViewport(this.ui);
      const cardW = 184, cardH = 224;
      const gap = 20;
      const totalW = this.pacts.length * cardW + (this.pacts.length - 1) * gap;
      const startX = cx - totalW / 2 + cardW / 2;
      const cardY = cy - cardH / 2 + 6;

      for (let idx = 0; idx < this.pacts.length; idx++) {
        const pData = this.pacts[idx];
        const curX = startX + idx * (cardW + gap);
        const isSel = idx === this.selectedIdx;

        const cardC = this.ui.add.container(curX, cardY);
        const bg = this.ui.add.rectangle(0, cardH / 2, cardW, cardH, isSel ? 0x220e18 : 0x150910, 0.96);
        const borderG = this.ui.add.graphics();

        if (isSel) {
          borderG.lineStyle(2.5, 0xff3355, 1);
          borderG.strokeRoundedRect(-cardW / 2, 0, cardW, cardH, 8);
          borderG.lineStyle(1, 0xff8899, 0.7);
          borderG.strokeRoundedRect(-cardW / 2 + 3, 3, cardW - 6, cardH - 6, 6);
        } else {
          borderG.lineStyle(1.5, 0x542337, 0.85);
          borderG.strokeRoundedRect(-cardW / 2, 0, cardW, cardH, 8);
        }

        const iconT = this.ui.add.text(0, 30, pData.icon, { fontSize: "28px" }).setOrigin(0.5);

        const titleT = this.ui.add.text(0, 66, pData.name.toUpperCase(), {
          fontFamily: "Cinzel, Georgia, serif",
          fontSize: "11px",
          color: isSel ? "#ffffff" : pData.color,
          fontStyle: "bold"
        }).setOrigin(0.5);

        const boonT = this.ui.add.text(0, 96, `✓ BÊNÇÃO:\n${pData.boon}`, {
          fontFamily: "sans-serif", fontSize: "9px", color: "#55ff88", fontStyle: "bold", wordWrap: { width: cardW - 24 }, lineSpacing: 3
        }).setOrigin(0.5, 0);

        const curseT = this.ui.add.text(0, 146, `✗ MALDIÇÃO:\n${pData.curse}`, {
          fontFamily: "sans-serif", fontSize: "9px", color: "#ff5555", fontStyle: "bold", wordWrap: { width: cardW - 24 }, lineSpacing: 3
        }).setOrigin(0.5, 0);

        const btn = this.ui.add.rectangle(0, cardH - 22, cardW - 32, 24, isSel ? 0x7a1828 : 0x2a101c).setInteractive({ useHandCursor: !0 });
        const btnT = this.ui.add.text(0, cardH - 22, isSel ? "[ ACEITAR PACTO ]" : "[ EXAMINAR ]", {
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

      let auraColor = 0xffd24a;
      if (treeKey === "attack") {
        auraColor = (heroId === "MAGE" || heroId === "WARRIOR") ? 0xff5511 : (heroId === "SHAMAN" || heroId === "ROGUE") ? 0x00ff88 : 0xaa44ff;
      } else {
        auraColor = (heroId === "MAGE" || heroId === "ARCHER") ? 0x00ccff : (heroId === "NECROMANCER") ? 0x8844ff : 0xffcc22;
      }

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
