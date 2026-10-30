// Abyss Branching Portals, Cursed Pacts, and Elemental Build Auras
// Full Gamepad, Touch, and Keyboard navigation with tactile haptics & Fullscreen Responsive Layout
(() => {
  // --- 1. PACTS & CURSED RELICS DATA ---
  const ABYSS_PACTS = [
    {
      id: "eye_of_doom",
      name: "Olho da Perdição",
      icon: "✦",
      iconTex: "icon-deadly-mark",
      color: "#e05a4a",
      accentHex: 0xe05a4a,
      boon: "+50% de Dano Crítico",
      curse: "Poções curam 40% a menos",
      mods: { critAdd: 50, potionPower: -0.4 }
    },
    {
      id: "shadow_pact",
      name: "Pacto das Sombras",
      icon: "❖",
      iconTex: "icon-shadow-step",
      color: "#c9a0ff",
      accentHex: 0xc9a0ff,
      boon: "Drops e Ouro coletados dobrados (+100%)",
      curse: "Inimigos movem-se 25% mais rápido",
      mods: { goldMult: 1.0, enemySpeedMult: 1.25 }
    },
    {
      id: "glass_heart",
      name: "Coração de Vidro",
      icon: "❖",
      iconTex: "icon-frozen-heart",
      color: "#8ae0ff",
      accentHex: 0x8ae0ff,
      boon: "Dano Total multiplicado por ×2.0",
      curse: "Vida máxima reduzida pela metade (-50%)",
      mods: { damageMult: 1.0, maxHpMult: 0.5 }
    },
    {
      id: "vampiric_blade",
      name: "Lâmina Sôfrega",
      icon: "✦",
      iconTex: "icon-bloodlust",
      color: "#e04848",
      accentHex: 0xe04848,
      boon: "Cada abate restaura +5% de vida máxima",
      curse: "Perde 1 de vida a cada 10s sem abater",
      mods: { killHealPct: 0.05, hungerTick: 10 }
    },
    {
      id: "bloody_bulwark",
      name: "Muralha Sangrenta",
      icon: "❖",
      iconTex: "icon-shield-wall",
      color: "#e8c872",
      accentHex: 0xe8c872,
      boon: "+30 de Defesa física e mágica",
      curse: "Velocidade de movimento reduzida em -15%",
      mods: { defenseAdd: 30, speedMult: -0.15 }
    }
  ];

  window.__ABYSS_PACTS = ABYSS_PACTS;

  // Active pacts for current run (persisted inside endless:run for save/reload support)
  window.__getActivePacts = function(scene) {
    if (!scene) return [];
    const reg = scene.registry || scene.game?.registry;
    const run = scene.endlessRun?.() || reg?.get?.("endless:run");
    if (run) {
      if (!Array.isArray(run.pacts)) {
        const regPacts = reg?.get?.("endless:activePacts");
        run.pacts = Array.isArray(regPacts) ? [...regPacts] : [];
      }
      reg?.set?.("endless:activePacts", run.pacts);
      return run.pacts;
    }
    if (!reg) return [];
    if (!reg.has("endless:activePacts")) {
      reg.set("endless:activePacts", []);
    }
    return reg.get("endless:activePacts");
  };

  window.__getAbyssPactModifiers = function(scene) {
    const isEndless = scene && (scene.mode === "endless" || scene.level?.endless || scene.game?.registry?.get("mode") === "endless" || !!scene.endlessRun?.());
    if (!isEndless) return {};
    const pacts = window.__getActivePacts(scene);
    let damageMult = 0;
    let defenseAdd = 0;
    let critAdd = 0;
    let speedMult = 0;
    let goldMult = 0;
    let potionPower = 0;
    let maxHpAdd = 0;
    let killHealPct = 0;
    let enemySpeedMult = 1;

    for (const pactId of pacts) {
      const def = ABYSS_PACTS.find(p => p.id === pactId);
      if (def?.mods) {
        if (def.mods.damageMult) damageMult += def.mods.damageMult;
        if (def.mods.defenseAdd) defenseAdd += def.mods.defenseAdd;
        if (def.mods.critAdd) critAdd += def.mods.critAdd;
        if (def.mods.speedMult) speedMult += def.mods.speedMult;
        if (def.mods.goldMult) goldMult += def.mods.goldMult;
        if (def.mods.potionPower) potionPower += def.mods.potionPower;
        if (def.mods.maxHpMult) {
          const baseHp = scene.classDef?.stats?.maxHp || 6;
          maxHpAdd -= Math.max(1, Math.floor(baseHp * (1 - def.mods.maxHpMult)));
        }
        if (def.mods.killHealPct) killHealPct += def.mods.killHealPct;
        if (def.mods.enemySpeedMult) enemySpeedMult *= def.mods.enemySpeedMult;
      }
    }

    return { damageMult, defenseAdd, critAdd, speedMult, goldMult, potionPower, maxHpAdd, killHealPct, enemySpeedMult };
  };

  function getViewport(scene) {
    let w = 640;
    try {
      if (typeof window !== "undefined" && window._) {
        w = window._;
      } else if (scene?.scale?.width) {
        w = scene.scale.width > 700 ? Math.round(scene.scale.width / 2) : scene.scale.width;
      }
    } catch (e) {
      w = 640;
    }
    const h = 360;
    return { w, h, cx: Math.round(w / 2), cy: Math.round(h / 2) };
  }

  // Helper para desenhar moldura gótica/dark-fantasy ornamentada no padrão __ornatePanel do jogo
  function drawOrnateCardBorder(g, cardW, cardH, isSel, mainColorHex, innerColorHex, rivetColorHex) {
    const x = -cardW / 2;
    const y = 0;

    if (isSel) {
      // Borda luminosa externa de destaque com reflexo dourado/rubi
      g.lineStyle(4, 0xffd24a, 0.35);
      g.strokeRoundedRect(x - 1, y - 1, cardW + 2, cardH + 2, 9);

      g.lineStyle(2.5, 0xffe070, 1);
      g.strokeRoundedRect(x, y, cardW, cardH, 8);

      // Linha interna acentuada com a cor tematica
      g.lineStyle(1.4, mainColorHex || 0xe05a4a, 0.9);
      g.strokeRoundedRect(x + 4, y + 4, cardW - 8, cardH - 8, 6);

      // Reflexo / brilho sutil no topo do card (highlight metalico)
      g.lineStyle(2, 0xffffff, 0.7);
      g.beginPath();
      g.moveTo(x + 24, y + 1);
      g.lineTo(x + cardW - 24, y + 1);
      g.strokePath();

      // Reflexo secundario sutil na borda interna superior
      g.lineStyle(1, 0xffea9f, 0.5);
      g.beginPath();
      g.moveTo(x + 28, y + 5);
      g.lineTo(x + cardW - 28, y + 5);
      g.strokePath();
    } else {
      // Card nao selecionado: moldura sobria e discreta
      g.lineStyle(1.5, 0x3d1c1e, 0.65);
      g.strokeRoundedRect(x, y, cardW, cardH, 8);
      g.lineStyle(1, 0x220e10, 0.4);
      g.strokeRoundedRect(x + 4, y + 4, cardW - 8, cardH - 8, 6);
    }

    const gem = (gx, gy, col, r = 3.5) => {
      g.fillStyle(col, isSel ? 1 : 0.6);
      g.fillTriangle(gx, gy - r, gx + r, gy, gx, gy + r);
      g.fillTriangle(gx, gy - r, gx - r, gy, gx, gy + r);
      if (isSel) {
        g.fillStyle(0xffffff, 0.8);
        g.fillCircle(gx, gy, 1.2);
      }
    };

    // Gemas nos cantos e centro superior
    gem(0, y + 4, isSel ? 0xffe488 : rivetColorHex, isSel ? 5 : 3.5);
    for (const [rx, ry] of [
      [x + 8, y + 8],
      [x + cardW - 8, y + 8],
      [x + 8, y + cardH - 8],
      [x + cardW - 8, y + cardH - 8]
    ]) {
      gem(rx, ry, isSel ? 0xffd24a : rivetColorHex, isSel ? 3.5 : 2.8);
    }
  }

  function addMedallionIcon(ui, container, y, iconTex, fallbackGlyph, accentHex, isSel) {
    const medG = ui.add.graphics();
    medG.fillStyle(isSel ? 0x1e160e : 0x120d09, 0.95);
    medG.fillCircle(0, y, 18);
    medG.lineStyle(isSel ? 2 : 1.2, isSel ? 0xffd24a : accentHex, isSel ? 1 : 0.75);
    medG.strokeCircle(0, y, 18);
    medG.lineStyle(1, 0x5a4628, 0.5);
    medG.strokeCircle(0, y, 14);
    container.add(medG);

    if (iconTex && ui.textures?.exists(iconTex)) {
      const img = ui.add.image(0, y, iconTex).setOrigin(0.5);
      const maxDim = Math.max(img.width || 20, img.height || 20);
      const scale = maxDim <= 24 ? 1.15 : 22 / maxDim;
      img.setScale(scale);
      container.add(img);
    } else {
      const iconT = ui.add.text(0, y, fallbackGlyph || "❖", {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "16px",
        color: "#ffd24a",
        fontStyle: "bold"
      }).setOrigin(0.5);
      container.add(iconT);
    }
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

      // Fundo dark-fantasy que cobre toda a resolução
      this.backdrop = i.add.rectangle(cx, cy, Math.max(w * 4, 3840), Math.max(h * 4, 2160), 0x080604, 0.94).setOrigin(0.5).setInteractive();
      this.root.add(this.backdrop);

      this.frameG = i.add.graphics();
      this.root.add(this.frameG);

      if (i.textures?.exists("ui-boss-emblem")) {
        this.emblem = i.add.image(cx, Math.max(24, cy - 140), "ui-boss-emblem").setScale(0.58).setAlpha(0.45);
        this.root.add(this.emblem);
      }

      this.title = i.add.text(cx, Math.max(26, cy - 138), "ESCOLHA SEU CAMINHO NO ABISMO", {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "17px",
        color: "#efe4c8",
        fontStyle: "bold",
        stroke: "#0a0806",
        strokeThickness: 3
      }).setOrigin(0.5);

      this.subtitle = i.add.text(cx, Math.max(50, cy - 114), "Selecione o destino para a próxima descida nas profundezas", {
        fontFamily: "'Courier New', monospace",
        fontSize: "9.5px",
        color: "#b8a888"
      }).setOrigin(0.5);

      this.root.add([this.title, this.subtitle]);

      this.cardsContainer = i.add.container(0, 0);
      this.root.add(this.cardsContainer);

      this.footerText = i.add.text(cx, Math.min(h - 22, cy + 146), "❖ [Setas / A-D / D-Pad] Navegar   ·   [Clique / Enter / E / (A)] Entrar no Portal", {
        fontFamily: "'Courier New', monospace",
        fontSize: "9.5px",
        color: "#c9a24a",
        fontStyle: "bold",
        stroke: "#0a0806",
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
      if (this.emblem) this.emblem.setPosition(cx, Math.max(24, cy - 140));
      this.title.setPosition(cx, Math.max(26, cy - 138));
      this.subtitle.setPosition(cx, Math.max(50, cy - 114));
      this.footerText.setPosition(cx, Math.min(h - 22, cy + 146));
      this.renderCards();
    }

    show(nextDepth, onChoiceCallback) {
      this.build();
      this.open = !0;
      this.openedAt = performance.now();
      this.onChoice = onChoiceCallback;
      this.selectedIdx = 0;
      this.root.setVisible(!0);
      this.ui.game?.events?.emit("ui:inventory", !0);

      const possiblePortals = [
        {
          type: "puzzle",
          title: "CÂMARA DO ENIGMA",
          icon: "❖",
          iconTex: "icon-pz-lock_sigil",
          badgeColor: "#8ae0ff",
          accentHex: 0x5fc8b0,
          desc: "Um enigma ancestral de luz ou runas místicas.\n\n✦ Recompensa: +1 Ponto de Habilidade Extra e Baú de Relíquia garantido."
        },
        {
          type: "elite",
          title: "COVIL DE ELITE",
          icon: "✦",
          iconTex: "icon-skull-scepter",
          badgeColor: "#e05a4a",
          accentHex: 0xc84a3a,
          desc: "Inimigos de elite coléricos com vida e agressividade aumentadas.\n\n✦ Recompensa: Baú Lendário com alta chance de armas supremas."
        },
        {
          type: "shop",
          title: "BAZAR & ALTAR",
          icon: "❖",
          iconTex: "icon-gold",
          badgeColor: "#ffd24a",
          accentHex: 0xc9a24a,
          desc: "Refúgio pacífico com o Mercador das Sombras.\n\n✦ Braseiro restaurador (cura total + poção) e Fonte de Purificação (+1 Ponto)."
        },
        {
          type: "pact",
          title: "ALTAR DO PACTO",
          icon: "✦",
          iconTex: "icon-demon-pact",
          badgeColor: "#c9a0ff",
          accentHex: 0x9a6ad8,
          desc: "Comungue com entidades esquecidas do abismo.\n\n✦ Recompensa: Escolha um Pacto Abissal com bônus devastadores."
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
      const gs = this.gs();
      if (gs) {
        gs.uiOpen = !1;
        gs.time.paused = !1;
        gs.tweens?.resumeAll?.();
      }
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

        const bg = this.ui.add.rectangle(0, cardH / 2, cardW, cardH, isSel ? 0x1a140e : 0x110d09, 0.97);
        cData.bg = { x: curX, y: cardY + cardH / 2, width: cardW, height: cardH };
        const borderG = this.ui.add.graphics();

        drawOrnateCardBorder(
          borderG,
          cardW,
          cardH,
          isSel,
          isSel ? 0xffd24a : 0x4a3b28,
          isSel ? 0xc9a24a : 0x2c2218,
          isSel ? 0xffd24a : (cData.accentHex || 0xc9a24a)
        );

        cardC.add([bg, borderG]);
        addMedallionIcon(this.ui, cardC, 34, cData.iconTex, cData.icon, cData.accentHex || 0xc9a24a, isSel);

        const titleT = this.ui.add.text(0, 70, cData.title, {
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "11px",
          color: isSel ? "#efe4c8" : cData.badgeColor,
          fontStyle: "bold"
        }).setOrigin(0.5);

        const descT = this.ui.add.text(0, 94, cData.desc, {
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "9.5px",
          color: isSel ? "#e8dcc4" : "#a8987e",
          lineSpacing: 3,
          wordWrap: { width: cardW - 24 }
        }).setOrigin(0.5, 0);

        const btn = this.ui.add.rectangle(0, cardH - 22, cardW - 32, 24, isSel ? 0x4a3418 : 0x1c150e).setInteractive({ useHandCursor: !0 });
        const btnBorder = this.ui.add.graphics();
        btnBorder.lineStyle(1, isSel ? 0xffd24a : 0x4a3b28, 0.9);
        btnBorder.strokeRoundedRect(-(cardW - 32) / 2, cardH - 34, cardW - 32, 24, 4);

        const btnT = this.ui.add.text(0, cardH - 22, isSel ? "[ (A) ENTRAR ]" : "[ SELECIONAR ]", {
          fontFamily: "'Courier New', monospace",
          fontSize: "9px",
          color: isSel ? "#ffd24a" : "#8a7f66",
          fontStyle: "bold"
        }).setOrigin(0.5);

        const curIdx = idx;
        bg.setInteractive({ useHandCursor: !0 })
          .on("pointerover", () => {
            if (this.selectedIdx !== curIdx) {
              this.selectedIdx = curIdx;
              this.renderCards();
            }
          })
          .on("pointerdown", () => {
            this.selectedIdx = curIdx;
            this.confirmChoice(curIdx);
          });

        btn.on("pointerover", () => {
          if (this.selectedIdx !== curIdx) {
            this.selectedIdx = curIdx;
            this.renderCards();
          }
        });
        btn.on("pointerdown", () => {
          this.selectedIdx = curIdx;
          this.confirmChoice(curIdx);
        });

        cardC.add([titleT, descT, btn, btnBorder, btnT]);
        this.cardsContainer.add(cardC);
      }
    }

    confirmChoice(idx) {
      const choice = this.cards[idx] || this.cards[0];
      const cb = this.onChoice;
      this.onChoice = null;
      this.close();
      window.__triggerHaptic?.(120, 0.6);
      if (typeof cb === "function" && choice) {
        cb(choice.type);
      }
    }

    handleKey(key) {
      if (!this.open) return !1;
      if (performance.now() - (this.openedAt || 0) < 160) return !0;

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
      if (key === "Enter" || key === " " || key === "Space" || key === "CONFIRM" || key === "z" || key === "Z" || key === "e" || key === "E") {
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

      this.backdrop = i.add.rectangle(cx, cy, Math.max(w * 4, 3840), Math.max(h * 4, 2160), 0x080506, 0.95).setOrigin(0.5).setInteractive();
      this.root.add(this.backdrop);

      if (i.textures?.exists("ui-boss-emblem")) {
        this.emblem = i.add.image(cx, Math.max(24, cy - 140), "ui-boss-emblem").setScale(0.58).setAlpha(0.45);
        this.root.add(this.emblem);
      }

      this.title = i.add.text(cx, Math.max(26, cy - 138), "PACTO DAS PROFUNDEZAS", {
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "17px",
        color: "#e05a4a",
        fontStyle: "bold",
        stroke: "#0a0806",
        strokeThickness: 3
      }).setOrigin(0.5);

      this.subtitle = i.add.text(cx, Math.max(50, cy - 114), "Aceite um poder proibido... ao custo de uma terrível maldição", {
        fontFamily: "'Courier New', monospace",
        fontSize: "9.5px",
        color: "#c8a49c"
      }).setOrigin(0.5);

      this.root.add([this.title, this.subtitle]);

      this.pactsContainer = i.add.container(0, 0);
      this.root.add(this.pactsContainer);

      this.footerText = i.add.text(cx, Math.min(h - 22, cy + 146), "❖ [Setas / A-D] Selecionar   ·   [Clique / A / Enter] Aceitar Pacto   ·   [B / Esc] Recusar", {
        fontFamily: "'Courier New', monospace",
        fontSize: "9.5px",
        color: "#c9a24a",
        fontStyle: "bold",
        stroke: "#0a0806",
        strokeThickness: 2
      }).setOrigin(0.5).setInteractive({ useHandCursor: !0 }).on("pointerdown", () => {
        this.close();
      });
      this.root.add(this.footerText);

      i.scale?.on("resize", () => {
        if (this.open) this.layout();
      });
    }

    layout() {
      if (!this.root || !this.ui) return;
      const { w, h, cx, cy } = getViewport(this.ui);
      this.backdrop.setPosition(cx, cy).setSize(Math.max(w * 4, 3840), Math.max(h * 4, 2160));
      if (this.emblem) this.emblem.setPosition(cx, Math.max(24, cy - 140));
      this.title.setPosition(cx, Math.max(26, cy - 138));
      this.subtitle.setPosition(cx, Math.max(50, cy - 114));
      this.footerText.setPosition(cx, Math.min(h - 22, cy + 146));
      this.renderPacts();
    }

    show() {
      this.build();
      this.open = !0;
      this.openedAt = performance.now();
      this.selectedIdx = 0;
      this.root.setVisible(!0);
      this.ui.game?.events?.emit("ui:inventory", !0);

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
      this.ui.game?.events?.emit("ui:inventory", !1);
      const gs = this.ui.scene.get("Game");
      if (gs) {
        gs.uiOpen = !1;
        gs.time.paused = !1;
        gs.tweens?.resumeAll?.();
      }
    }

    renderPacts() {
      this.pactsContainer.removeAll(!0);
      const { cx, cy } = getViewport(this.ui);
      const cardW = 184, cardH = 224;
      const gap = 20;
      const totalW = this.pacts.length * cardW + (this.pacts.length - 1) * gap;
      const startX = cx - totalW / 2 + cardW / 2;
      const cardBaseY = cy - cardH / 2 + 6;

      this.cardContainers = [];

      for (let idx = 0; idx < this.pacts.length; idx++) {
        const pData = this.pacts[idx];
        const curX = startX + idx * (cardW + gap);
        const isSel = idx === this.selectedIdx;

        // Elevacao discreta do card selecionado
        const cardY = isSel ? cardBaseY - 6 : cardBaseY;
        const cardC = this.ui.add.container(curX, cardY);
        cardC.setScale(isSel ? 1.02 : 0.98);
        cardC.setAlpha(isSel ? 1.0 : 0.72);
        this.cardContainers.push(cardC);

        // Fundo com tom tematico enriquecido se selecionado
        const bgFillColor = isSel ? (pData.accentHex ? Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.ValueToColor(0x221014),
          Phaser.Display.Color.ValueToColor(pData.accentHex),
          100, 22
        ).color : 0x241216) : 0x120a0c;

        const bg = this.ui.add.rectangle(0, cardH / 2, cardW, cardH, bgFillColor, isSel ? 0.98 : 0.94);
        pData.bg = { x: curX, y: cardY + cardH / 2, width: cardW, height: cardH };
        const borderG = this.ui.add.graphics();

        drawOrnateCardBorder(
          borderG,
          cardW,
          cardH,
          isSel,
          isSel ? (pData.accentHex || 0xe05a4a) : 0x4e2628,
          isSel ? 0xffd24a : 0x2e1618,
          isSel ? 0xffd24a : (pData.accentHex || 0xc9a24a)
        );

        cardC.add([bg, borderG]);
        addMedallionIcon(this.ui, cardC, 34, pData.iconTex, pData.icon, isSel ? 0xffd24a : (pData.accentHex || 0xe05a4a), isSel);

        const titleT = this.ui.add.text(0, 68, pData.name.toUpperCase(), {
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "11px",
          color: isSel ? "#fff0c0" : pData.color,
          fontStyle: "bold",
          stroke: isSel ? "#421014" : "#000000",
          strokeThickness: isSel ? 2 : 1
        }).setOrigin(0.5);

        const boonT = this.ui.add.text(0, 94, `✦ BÊNÇÃO:\n${pData.boon}`, {
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "9.5px",
          color: isSel ? "#9cf5c2" : "#8ae0b0",
          fontStyle: "bold",
          wordWrap: { width: cardW - 24 },
          lineSpacing: 3
        }).setOrigin(0.5, 0);

        const curseT = this.ui.add.text(0, 144, `❖ MALDIÇÃO:\n${pData.curse}`, {
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: "9.5px",
          color: isSel ? "#ff8272" : "#e06a5a",
          fontStyle: "bold",
          wordWrap: { width: cardW - 24 },
          lineSpacing: 3
        }).setOrigin(0.5, 0);

        // Botao de acao inferior
        const btnFill = isSel ? 0x6e2228 : 0x220e12;
        const btn = this.ui.add.rectangle(0, cardH - 22, cardW - 32, 24, btnFill).setInteractive({ useHandCursor: !0 });
        const btnBorder = this.ui.add.graphics();
        btnBorder.lineStyle(isSel ? 1.5 : 1, isSel ? 0xffd24a : 0x4e2628, 0.95);
        btnBorder.strokeRoundedRect(-(cardW - 32) / 2, cardH - 34, cardW - 32, 24, 4);

        const btnT = this.ui.add.text(0, cardH - 22, isSel ? "✦ ACEITAR PACTO ✦" : "[ EXAMINAR ]", {
          fontFamily: "'Courier New', monospace",
          fontSize: isSel ? "9.5px" : "9px",
          color: isSel ? "#ffe488" : "#9e7a7a",
          fontStyle: "bold"
        }).setOrigin(0.5);

        const curIdx = idx;
        bg.setInteractive({ useHandCursor: !0 })
          .on("pointerover", () => {
            if (this.selectedIdx !== curIdx) {
              this.selectedIdx = curIdx;
              this.renderPacts();
              window.__triggerHaptic?.(25, 0.2);
            }
          })
          .on("pointerdown", () => {
            this.selectedIdx = curIdx;
            this.acceptPact(curIdx);
          });

        btn.on("pointerover", () => {
          if (this.selectedIdx !== curIdx) {
            this.selectedIdx = curIdx;
            this.renderPacts();
            window.__triggerHaptic?.(25, 0.2);
          }
        });
        btn.on("pointerdown", () => {
          this.selectedIdx = curIdx;
          this.acceptPact(curIdx);
        });

        cardC.add([titleT, boonT, curseT, btn, btnBorder, btnT]);
        this.pactsContainer.add(cardC);
      }
    }

    acceptPact(idx) {
      if (this.accepting) return;
      this.accepting = !0;

      const chosen = this.pacts[idx] || this.pacts[0];
      const g = this.ui.scene.get("Game");
      const targetCard = this.cardContainers?.[idx];

      // Feedback visual claro ao confirmar a escolha
      if (targetCard) {
        this.ui.tweens.add({
          targets: targetCard,
          scale: 1.08,
          alpha: 1,
          duration: 120,
          yoyo: !0
        });
      }

      if (this.ui.effects?.burstTinted && targetCard) {
        this.ui.effects.burstTinted(targetCard.x, targetCard.y + 60, 0xffd24a, 14);
      }

      window.__triggerHaptic?.(200, 0.9);

      this.ui.time.delayedCall(160, () => {
        this.accepting = !1;
        this.close();

        if (g && chosen) {
          const pacts = window.__getActivePacts(g);
          pacts.push(chosen.id);
          const er = g.endlessRun?.();
          if (er) er.pathResolved = !0;
          g.stats?.recompute();
          if (g.player && g.player.hp > g.player.maxHp) {
            g.player.hp = g.player.maxHp;
          }
          g.game?.events?.emit("hud:hp", g.player?.hp, g.player?.maxHp);
          g.game?.audioEngine?.sfx?.("sfx-boss-spawn");
          this.ui.game.events.emit("ui:banner", `PACTO ACEITO: ${chosen.name.toUpperCase()}!`, chosen.color);
          g.requestSave?.(200);

          if (typeof this.onPactAccepted === 'function') {
            const cb = this.onPactAccepted;
            this.onPactAccepted = null;
            cb(chosen);
          }
        }
      });
    }

    handleKey(key) {
      if (!this.open) return !1;
      if (performance.now() - (this.openedAt || 0) < 160) return !0;

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
      if (key === "Enter" || key === " " || key === "Space" || key === "CONFIRM" || key === "z" || key === "Z" || key === "e" || key === "E") {
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
      const isEndless = scene && (scene.mode === "endless" || scene.level?.endless || scene.game?.registry?.get("mode") === "endless" || !!scene.endlessRun?.());
      if (!isEndless || !scene.player) return;
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

  window.__openAbyssPactsModal = function(uiScene, onAccepted) {
    if (!uiScene) return;
    if (!uiScene.__pactsUI) {
      uiScene.__pactsUI = new AbyssPactsUI(uiScene);
    }
    uiScene.__pactsUI.onPactAccepted = onAccepted || null;
    uiScene.__pactsUI.show();
  };
})();
