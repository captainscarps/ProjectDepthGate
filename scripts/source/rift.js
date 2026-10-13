/* =====================================================================
   FENDA DESAFIO (CHALLENGE RIFT)
   - Dungeon longa, procedural, sem nenhum save.
   - Inimigos difíceis e 3 chefes aleatórios em salas diferentes.
   - Recompensas: Itens Lendários Únicos e Cristais do Refúgio para o Herói.
   - Guardiã oferece a Fenda quando o herói estiver fraco ou sem falas novas.
   ===================================================================== */

function __offerRiftPrompt(S) {
  if (!S || S.transitioning || S.__riftModalOpen) return;
  const __prog = typeof __hubProg === "function" ? __hubProg(S) : { n: 0 };
  if ((__prog?.n ?? 0) < 1) return;
  const ui = S.scene.get("UI") || S;
  if (!ui) return;

  S.__riftModalOpen = !0;
  S.uiOpen = !0;
  S.physics?.pause?.();
  S.player?.setVelocity?.(0, 0);

  const F_SERIF = "Georgia, 'Times New Roman', serif";
  const F_MONO = "'Courier New', monospace";

  const W = 420;
  const H = 250;
  const cx = Math.round(_ / 2);
  const cy = Math.round(st / 2);
  const x0 = cx - Math.round(W / 2);
  const y0 = cy - Math.round(H / 2);

  const R = ui.add.container(0, 0).setDepth(9970);

  // Fundo escuro
  const dim = ui.add.rectangle(cx, cy, _ * 1.5, st * 1.5, 0x050403, 0.78).setInteractive();
  R.add(dim);

  // Moldura
  const bg = ui.add.graphics();
  bg.fillStyle(0x0e0906, 0.98);
  bg.fillRoundedRect(x0, y0, W, H, 10);
  bg.lineStyle(2, 0xc9a24a, 0.95);
  bg.strokeRoundedRect(x0, y0, W, H, 10);
  bg.lineStyle(1, 0x3d2c18, 0.85);
  bg.strokeRoundedRect(x0 + 4, y0 + 4, W - 8, H - 8, 8);
  R.add(bg);

  // Ícone de brilho místico púrpura
  try {
    const gl = ui.add.image(cx, y0 + 22, "light").setScale(0.45).setBlendMode(j.BlendModes.ADD).setTint(0x9333ea).setAlpha(0.35);
    R.add(gl);
  } catch(e) {}

  // Título
  const tTitle = ui.add.text(cx, y0 + 13, "✦ A FENDA DESAFIO ✦", {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "13px",
    color: "#e9d5ff",
    stroke: "#0a0604",
    strokeThickness: 3
  }).setOrigin(0.5, 0);

  const tSpeaker = ui.add.text(cx, y0 + 31, "— GUARDIÃ ELYNDRA —", {
    fontFamily: F_MONO,
    fontStyle: "bold",
    fontSize: "8.5px",
    color: "#ffd24a",
    stroke: "#0a0604",
    strokeThickness: 2
  }).setOrigin(0.5, 0);
  R.add([tTitle, tSpeaker]);

  // Texto da Guardiã
  const speech = typeof __L3 === "function"
    ? __L3(
        "\"Seu herói ainda precisa de mais poder para confrontar os selos sombrios à frente.\n" +
        "Adentre a FENDA DESAFIO: uma masmorra longa e procedural, sem nenhum descanso ou save,\n" +
        "guardada por 3 grandes chefes em covis separados.\n\n" +
        "Sobreviva e trará Cristais do Refúgio para seus aprimoramentos e tesouros lendários!\"",
        "\"Your hero still needs more strength to face the dark seals ahead.\n" +
        "Enter the CHALLENGE RIFT: a long procedural dungeon, with NO saves,\n" +
        "guarded by 3 mighty bosses in separate chambers.\n\n" +
        "Survive and you will claim Refuge Crystals for upgrades and legendary loot!\"",
        "\"Tu héroe aún necesita más poder para enfrentar los oscuros sellos.\n" +
        "Entra en la GRIETA DESAFÍO: una mazmorra larga y procedural, ¡SIN guardados!,\n" +
        "custodiada por 3 grandes jefes en guaridas separadas.\n\n" +
        "¡Sobrevive y obtendrás Cristales del Refugio y tesoros legendarios!\""
      )
    : "\"Seu herói ainda precisa de mais poder para confrontar os selos sombrios à frente.\n" +
      "Adentre a FENDA DESAFIO: uma masmorra longa e procedural, sem nenhum descanso ou save,\n" +
      "guardada por 3 grandes chefes em covis separados.\n\n" +
      "Sobreviva e trará Cristais do Refúgio para seus aprimoramentos e tesouros lendários!\"";

  const tSpeech = ui.add.text(cx, y0 + 52, speech, {
    fontFamily: F_SERIF,
    fontSize: "8.5px",
    color: "#f3e8c8",
    align: "center",
    lineSpacing: 3,
    stroke: "#0a0604",
    strokeThickness: 2,
    wordWrap: { width: W - 40 }
  }).setOrigin(0.5, 0);
  R.add(tSpeech);

  // Aviso: Sem Save + 3 Chefes
  const warnBox = ui.add.graphics();
  warnBox.fillStyle(0x2a1018, 0.9);
  warnBox.fillRoundedRect(cx - 160, y0 + 152, 320, 24, 4);
  warnBox.lineStyle(1, 0xef4444, 0.8);
  warnBox.strokeRoundedRect(cx - 160, y0 + 152, 320, 24, 4);
  R.add(warnBox);

  const tWarn = ui.add.text(cx, y0 + 164, "⚠ MODO SEM SAVE: 3 Chefes Aleatórios · Inimigos Fortes · Cristais & Lendários", {
    fontFamily: F_MONO,
    fontStyle: "bold",
    fontSize: "7.5px",
    color: "#fca5a5",
    stroke: "#0a0604",
    strokeThickness: 2
  }).setOrigin(0.5, 0.5);
  R.add(tWarn);

  // Pergunta final
  const tAsk = ui.add.text(cx, y0 + 184, typeof __L3 === "function" ? __L3("Deseja fazer a Fenda Desafio agora?", "Do you want to enter the Challenge Rift now?", "¿Deseas entrar en la Grieta Desafío ahora?") : "Deseja fazer a Fenda Desafio agora?", {
    fontFamily: F_MONO,
    fontStyle: "bold",
    fontSize: "9px",
    color: "#ffffff",
    stroke: "#0a0604",
    strokeThickness: 2
  }).setOrigin(0.5, 0.5);
  R.add(tAsk);

  // Botões
  const btnY = y0 + H - 26;
  const btnW = 146;
  const btnH = 24;

  let closed = !1;
  const close = () => {
    if (closed) return;
    closed = !0;
    S.__riftModalOpen = !1;
    S.uiOpen = !1;
    ui.input.keyboard?.off("keydown", keyHandler);
    R.destroy();
    S.physics?.resume?.();
  };

  const confirmEnter = () => {
    if (closed) return;
    closed = !0;
    S.__riftModalOpen = !1;
    ui.input.keyboard?.off("keydown", keyHandler);
    R.destroy();
    __startRiftRun(S);
  };

  // Botão 1: ENTRAR NA FENDA
  const b1X = cx - 82;
  const b1G = ui.add.graphics();
  b1G.fillStyle(0x3b124a, 0.95);
  b1G.fillRoundedRect(b1X - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
  b1G.lineStyle(1.5, 0xc084fc, 0.95);
  b1G.strokeRoundedRect(b1X - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);

  const tB1 = ui.add.text(b1X, btnY, "⚡ ENTRAR NA FENDA", {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "9.5px",
    color: "#e9d5ff",
    stroke: "#0a0604",
    strokeThickness: 2.5
  }).setOrigin(0.5, 0.5);

  const z1 = ui.add.zone(b1X, btnY, btnW, btnH).setInteractive({ useHandCursor: !0 });

  // Botão 2: RECUSAR
  const b2X = cx + 82;
  const b2G = ui.add.graphics();
  b2G.fillStyle(0x241a10, 0.95);
  b2G.fillRoundedRect(b2X - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
  b2G.lineStyle(1.5, 0x8a7f66, 0.9);
  b2G.strokeRoundedRect(b2X - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);

  const tB2 = ui.add.text(b2X, btnY, typeof __L3 === "function" ? __L3("RECUSAR", "DECLINE", "RECHAZAR") : "RECUSAR", {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "9.5px",
    color: "#d1c7b7",
    stroke: "#0a0604",
    strokeThickness: 2.5
  }).setOrigin(0.5, 0.5);

  const z2 = ui.add.zone(b2X, btnY, btnW, btnH).setInteractive({ useHandCursor: !0 });
  let selectedIdx = 0; // 0 = Entrar, 1 = Agora Não

  const updateVisualButtons = () => {
    const isB1Sel = selectedIdx === 0;
    b1G.clear();
    b1G.fillStyle(isB1Sel ? 0x5b1a75 : 0x3b124a, 0.95);
    b1G.fillRoundedRect(b1X - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
    b1G.lineStyle(isB1Sel ? 2 : 1.5, isB1Sel ? 0xffffff : 0xc084fc, 0.95);
    b1G.strokeRoundedRect(b1X - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
    tB1.setColor(isB1Sel ? "#ffffff" : "#e9d5ff");

    const isB2Sel = selectedIdx === 1;
    b2G.clear();
    b2G.fillStyle(isB2Sel ? 0x3a2c1d : 0x241a10, 0.95);
    b2G.fillRoundedRect(b2X - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
    b2G.lineStyle(isB2Sel ? 2 : 1.5, isB2Sel ? 0xffffff : 0x8a7f66, 0.9);
    b2G.strokeRoundedRect(b2X - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
    tB2.setColor(isB2Sel ? "#ffffff" : "#d1c7b7");
  };

  z1.on("pointerover", () => { selectedIdx = 0; updateVisualButtons(); });
  z1.on("pointerdown", () => confirmEnter());
  R.add([b1G, tB1, z1]);

  z2.on("pointerover", () => { selectedIdx = 1; updateVisualButtons(); });
  z2.on("pointerdown", () => close());
  R.add([b2G, tB2, z2]);

  updateVisualButtons();
  dim.on("pointerdown", () => close());

  const keyHandler = ev => {
    if (closed) return;
    if (ev.key === "ArrowLeft" || ev.key === "a" || ev.key === "A") {
      ev.stopImmediatePropagation?.();
      selectedIdx = 0;
      updateVisualButtons();
    } else if (ev.key === "ArrowRight" || ev.key === "d" || ev.key === "D") {
      ev.stopImmediatePropagation?.();
      selectedIdx = 1;
      updateVisualButtons();
    } else if (ev.key === "Enter" || ev.key === " " || ev.key === "e" || ev.key === "E") {
      ev.stopImmediatePropagation?.();
      if (selectedIdx === 0) confirmEnter(); else close();
    } else if (ev.key === "Escape" || ev.key === "Backspace" || ev.key === "q" || ev.key === "Q") {
      ev.stopImmediatePropagation?.();
      close();
    }
  };
  ui.input.keyboard?.on("keydown", keyHandler);

  // Suporte Gamepad contínuo
  let prevPad = {};
  const padPoll = () => {
    if (closed) return;
    try {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const pad = Array.from(pads).find(p => p && p.connected);
      if (pad) {
        const btn = (i) => !!pad.buttons[i]?.pressed || (pad.buttons[i]?.value || 0) > 0.5;
        const left = btn(14) || (pad.axes[0] || 0) < -0.5;
        const right = btn(15) || (pad.axes[0] || 0) > 0.5;
        const confirm = btn(0);
        const cancel = btn(1) || btn(9);

        if (left && !prevPad.left) {
          selectedIdx = 0;
          updateVisualButtons();
        } else if (right && !prevPad.right) {
          selectedIdx = 1;
          updateVisualButtons();
        } else if (confirm && !prevPad.confirm) {
          if (selectedIdx === 0) confirmEnter(); else close();
        } else if (cancel && !prevPad.cancel) {
          close();
        }
        prevPad = { left, right, confirm, cancel };
      }
    } catch(e) {}
    if (!closed) requestAnimationFrame(padPoll);
  };
  requestAnimationFrame(padPoll);
}

function __startRiftRun(S) {
  if (!S || S.transitioning) return;
  try { __stFlag(S, "forest_done", !0); } catch(e) {}
  S.game.events.emit("ui:banner", "✦ ADENTRANDO A FENDA DESAFIO ✦", "#c084fc");
  try { S.audioRef?.play("sfx-boss-intro") } catch(e) {}
  __goLevel(S, "rift", { isRift: true });
}

function __buildRiftLevel(scene) {
  // Gera uma dungeon procedural longa usando o gerador do jogo
  const seed = "rift_" + Date.now();
  const cfg = {
    depth: 8,
    seed: seed,
    maxLevel: scene.stats?.level || 1,
    currentBiomeTheme: "fortress"
  };
  let lvl = null;
  try { lvl = md(cfg); } catch(e) {}
  if (!lvl) {
    try { lvl = vd(cfg); } catch(e) {}
  }
  if (!lvl) {
    lvl = { ...ki.catacombs };
  }

  lvl.id = "rift";
  lvl.name = "Fenda Desafio";
  lvl.isRift = !0;

  // 3 Chefes Aleatórios em salas diferentes (incluindo novos chefes: Beholder, Dragão Pálido e Cérbero)
  const pool = [
    "BEHOLDER", "PALE_DRAGON", "CERBERUS",
    "LAVA_GOLEM", "ABYSS_GUARDIAN", "ANCIENT_COLOSSUS", "FROST_WARDEN",
    "DRAGON_ANCIENT", "ANHANGA", "WILD_ENT", "FOX_WITCH", "RIVER_TENGU"
  ];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const picked = pool.slice(0, 3);

  const combatRooms = (lvl.rooms || []).filter(r => r.roomType !== "START" && r.rect);
  const usedRooms = new Set();
  const step = Math.max(1, Math.floor(combatRooms.length / 3));
  const candidateIndices = [
    Math.min(combatRooms.length - 1, step - 1),
    Math.min(combatRooms.length - 1, step * 2 - 1),
    Math.min(combatRooms.length - 1, combatRooms.length - 1)
  ];

  picked.forEach((bKey, idx) => {
    let r = combatRooms[candidateIndices[idx]];
    if (!r || usedRooms.has(r.id)) {
      r = combatRooms.find(cr => !usedRooms.has(cr.id)) || combatRooms[0];
    }
    if (r) {
      usedRooms.add(r.id);
      r.hasBoss = !0;
      r.boss = bKey;
      r.roomType = "BOSS";
      const bDef = typeof Yt !== "undefined" ? Yt[bKey] : null;
      const bName = bDef?.name || bKey;
      r.name = `Covil da Fenda: ${bName}`;
      const col = Math.floor(r.rect.x + r.rect.w / 2);
      const row = Math.floor(r.rect.y + r.rect.h / 2);
      r.enemies = (r.enemies || []).filter(e => !e.boss);
      r.enemies.push({ type: bKey, col, row, boss: !0 });
    }
  });

  return lvl;
}

function __onRiftBossKilled(S, boss) {
  if (!S || !S.isRift) return;
  S.__riftBossesDefeated = (S.__riftBossesDefeated || 0) + 1;
  const count = S.__riftBossesDefeated;

  // Dropa 1 Item Lendário único garantido
  try {
    const pool = ["sword", "axe", "bow", "staff", "armor", "helmet", "boots", "ring", "amulet"];
    const tmpl = S.lootSystem?.pickTemplate ? S.lootSystem.pickTemplate(pool) : "great_sword";
    const it = S.lootSystem.makeItem(tmpl, "LEGENDARY");
    S.lootSystem.spawnItem(boss.x, boss.y, it);
  } catch(e) {}

  // Ganha +25 Cristais do Refúgio por chefe
  const m = Xe();
  m.fragments = (m.fragments || 0) + 25;
  m.totalEarned = (m.totalEarned || 0) + 25;
  tr(m);

  try { S.audioRef?.play("sfx-boss-victory") } catch(e) {}
  S.game.events.emit("ui:banner", `⚡ CHEFE DA FENDA DERROTADO (${count}/3)! +25 CRISTAIS`, "#ffd24a");

  if (count >= 3) {
    // 3 CHEFES DERROTADOS -> VITÓRIA TOTAL DA FENDA!
    const m2 = Xe();
    m2.fragments = (m2.fragments || 0) + 100;
    m2.totalEarned = (m2.totalEarned || 0) + 100;
    tr(m2);

    try {
      // Dropa 1 Relíquia Máxima
      const relPool = ["sword", "great_sword", "long_bow", "arcane_staff", "armor"];
      const tmpl = S.lootSystem?.pickTemplate ? S.lootSystem.pickTemplate(relPool) : "great_sword";
      const rel = S.lootSystem.makeItem(tmpl, "RELIC");
      S.lootSystem.spawnItem(boss.x + 20, boss.y, rel);
    } catch(e) {}

    S.game.events.emit("ui:banner", "✦ FENDA DESAFIO CONCLUÍDA! +100 CRISTAIS DO REFÚGIO! ✦", "#8ae0b0");

    // Portal de vitória para retornar ao Refúgio
    try {
      const p = S.add.sprite(boss.x, boss.y, "hub-portal", 0).play("hub-portal-a").setDepth(boss.y + 10).setScale(1.4);
      p.setTint(0x4ade80);
      S.add.text(boss.x, boss.y + 6, "RETORNAR AO REFÚGIO", {
        fontFamily: "'Courier New', monospace",
        fontSize: "8px",
        fontStyle: "bold",
        color: "#86efac",
        stroke: "#0a0806",
        strokeThickness: 3
      }).setOrigin(0.5, 0).setDepth(9999);
    } catch(e) {}

    S.time.delayedCall(4500, () => {
      if (S.scene?.isActive()) {
        __goLevel(S, "forest", { hubReturn: !0 });
      }
    });
  }
}
