/* =====================================================================
   SISTEMA DE FORJA (FUSÃO DE ITENS NO INVENTÁRIO)
   - Permite fundir 3 itens da mesma raridade em 1 item da raridade acima.
   - Caso a raridade seja a máxima (RELIC), produz Cristais do Refúgio.
   ===================================================================== */

const __FORGE_RARITIES = [
  { key: "COMMON", name: "Comum", color: "#a8a29e", border: 0xa8a29e, next: "UNCOMMON" },
  { key: "UNCOMMON", name: "Incomum", color: "#4ade80", border: 0x4ade80, next: "RARE" },
  { key: "RARE", name: "Raro", color: "#60a5fa", border: 0x60a5fa, next: "EPIC" },
  { key: "EPIC", name: "Épico", color: "#c084fc", border: 0xc084fc, next: "LEGENDARY" },
  { key: "LEGENDARY", name: "Lendário", color: "#fbbf24", border: 0xfbbf24, next: "RELIC" },
  { key: "RELIC", name: "Relíquia (Máxima)", color: "#f87171", border: 0xf87171, next: null }
];

function __openForge(invUi) {
  if (!invUi || !invUi.open) return;
  const S = invUi.gs();
  const ui = invUi.ui;
  if (!S || !ui) return;

  // Fechar qualquer modal de forja anterior
  if (invUi.__forgeModal) {
    invUi.__forgeModal.destroy();
    invUi.__forgeModal = null;
  }

  const F_SERIF = "Georgia, 'Times New Roman', serif";
  const F_MONO = "'Courier New', monospace";

  const W = 420;
  const H = 270;
  const cx = Math.round(_ / 2);
  const cy = Math.round(st / 2);
  const x0 = cx - Math.round(W / 2);
  const y0 = cy - Math.round(H / 2);

  const R = ui.add.container(0, 0).setDepth(9960);
  invUi.__forgeModal = R;

  // 1. Fundo escuro com bloqueio de toque
  const dim = ui.add.rectangle(cx, cy, _ * 1.5, st * 1.5, 0x050403, 0.78).setInteractive();
  R.add(dim);

  // 2. Janela da Forja
  const bg = ui.add.graphics();
  bg.fillStyle(0x0e0906, 0.98);
  bg.fillRoundedRect(x0, y0, W, H, 10);
  bg.lineStyle(2, 0xc9a24a, 0.95);
  bg.strokeRoundedRect(x0, y0, W, H, 10);
  bg.lineStyle(1, 0x3d2c18, 0.8);
  bg.strokeRoundedRect(x0 + 4, y0 + 4, W - 8, H - 8, 8);
  R.add(bg);

  // 3. Cabeçalho
  const titleTxt = typeof __L3 === "function" 
    ? __L3("✦ FORJA DE EQUIPAMENTOS ✦", "✦ EQUIPMENT FORGE ✦", "✦ FORJA DE EQUIPO ✦")
    : "✦ FORJA DE EQUIPAMENTOS ✦";
  const tTitle = ui.add.text(cx, y0 + 12, titleTxt, {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "13px",
    color: "#ffd24a",
    stroke: "#0a0604",
    strokeThickness: 3
  }).setOrigin(0.5, 0);

  const subTxt = typeof __L3 === "function"
    ? __L3("Funda 3 itens da mesma raridade em 1 item da raridade superior.\n3 Relíquias produzem 100 Cristais do Refúgio!",
           "Fuse 3 items of the same rarity into 1 item of the next rarity.\n3 Relics produce 100 Refuge Crystals!",
           "¡Funde 3 objetos de la misma rareza en 1 de rareza superior!\n¡3 Reliquias producen 100 Cristales del Refugio!")
    : "Funda 3 itens da mesma raridade em 1 item da raridade superior.\n3 Relíquias produzem 100 Cristais do Refúgio!";
  const tSub = ui.add.text(cx, y0 + 30, subTxt, {
    fontFamily: F_MONO,
    fontSize: "8px",
    color: "#d1c7b7",
    align: "center",
    stroke: "#0a0604",
    strokeThickness: 2
  }).setOrigin(0.5, 0);
  R.add([tTitle, tSub]);

  // Função interna para fechar o modal
  const closeForge = () => {
    if (invUi.__forgeModal) {
      ui.input.keyboard?.off("keydown", keyHandler);
      invUi.__forgeModal.destroy();
      invUi.__forgeModal = null;
    }
  };

  const keyHandler = ev => {
    if (ev.key === "Escape" || ev.key === "Backspace") {
      ev.stopImmediatePropagation?.();
      closeForge();
    }
  };
  ui.input.keyboard?.on("keydown", keyHandler);
  dim.on("pointerdown", () => closeForge());

  // Botão fechar (X)
  const closeBtn = ui.add.text(x0 + W - 20, y0 + 10, "✕", {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "14px",
    color: "#e8c872"
  }).setOrigin(0.5, 0).setInteractive({ useHandCursor: !0 });
  closeBtn.on("pointerdown", () => closeForge());
  closeBtn.on("pointerover", () => closeBtn.setColor("#ffffff"));
  closeBtn.on("pointerout", () => closeBtn.setColor("#e8c872"));
  R.add(closeBtn);

  // Container dinâmico das linhas de raridade
  const rowsContainer = ui.add.container(0, 0);
  R.add(rowsContainer);

  const drawRows = () => {
    rowsContainer.removeAll(!0);

    // Agrupa itens da mochila por raridade
    const bagItems = S.inventory.items.filter(Boolean);
    const byRarity = { COMMON: [], UNCOMMON: [], RARE: [], EPIC: [], LEGENDARY: [], RELIC: [] };
    for (const it of bagItems) {
      if (it && byRarity[it.rarity]) byRarity[it.rarity].push(it);
    }

    const rowStartY = y0 + 58;
    const rowH = 29;

    __FORGE_RARITIES.forEach((rar, idx) => {
      const ry = rowStartY + idx * rowH;
      const count = byRarity[rar.key].length;
      const canForge = count >= 3;

      // Fundo da linha
      const rbg = ui.add.graphics();
      rbg.fillStyle(canForge ? 0x18120c : 0x100b08, 0.9);
      rbg.fillRoundedRect(x0 + 14, ry, W - 28, rowH - 4, 4);
      rbg.lineStyle(1, canForge ? rar.border : 0x2e2318, canForge ? 0.8 : 0.4);
      rbg.strokeRoundedRect(x0 + 14, ry, W - 28, rowH - 4, 4);
      rowsContainer.add(rbg);

      // Nome da Raridade
      const tRar = ui.add.text(x0 + 24, ry + (rowH - 4) / 2, rar.name.toUpperCase(), {
        fontFamily: F_SERIF,
        fontStyle: "bold",
        fontSize: "9px",
        color: rar.color,
        stroke: "#0a0604",
        strokeThickness: 2
      }).setOrigin(0, 0.5);
      rowsContainer.add(tRar);

      // Quantidade disponível
      const qColor = canForge ? "#86efac" : "#8a7f66";
      const qTxt = `${count}/3 ${typeof __L3 === "function" ? __L3("na mochila", "in bag", "en bolsa") : "na mochila"}`;
      const tCount = ui.add.text(x0 + 160, ry + (rowH - 4) / 2, qTxt, {
        fontFamily: F_MONO,
        fontSize: "8.5px",
        color: qColor,
        stroke: "#0a0604",
        strokeThickness: 2
      }).setOrigin(0, 0.5);
      rowsContainer.add(tCount);

      // Botão de Forjar
      const btnW = 110;
      const btnH = 20;
      const btnX = x0 + W - 24 - btnW / 2;
      const btnY = ry + (rowH - 4) / 2;

      const btnG = ui.add.graphics();
      btnG.fillStyle(canForge ? (rar.key === "RELIC" ? 0x4a1814 : 0x1c3a24) : 0x181410, 0.95);
      btnG.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
      btnG.lineStyle(1, canForge ? (rar.key === "RELIC" ? 0xef4444 : 0x4ade80) : 0x3d3024, 0.9);
      btnG.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
      rowsContainer.add(btnG);

      const bLabel = rar.key === "RELIC"
        ? (typeof __L3 === "function" ? __L3("💎 100 CRISTAIS", "💎 100 CRYSTALS", "💎 100 CRISTALES") : "💎 100 CRISTAIS")
        : (typeof __L3 === "function" ? __L3(`⚒ FORJAR ${rar.next}`, `⚒ FORGE ${rar.next}`, `⚒ FORJAR ${rar.next}`) : `⚒ FORJAR ${rar.next}`);

      const tBtn = ui.add.text(btnX, btnY, bLabel, {
        fontFamily: F_SERIF,
        fontStyle: "bold",
        fontSize: "8px",
        color: canForge ? "#ffffff" : "#6a6054",
        stroke: "#0a0604",
        strokeThickness: 2
      }).setOrigin(0.5, 0.5);
      rowsContainer.add(tBtn);

      if (canForge) {
        const zone = ui.add.zone(btnX, btnY, btnW, btnH).setInteractive({ useHandCursor: !0 });
        zone.on("pointerover", () => {
          btnG.clear();
          btnG.fillStyle(rar.key === "RELIC" ? 0x68201a : 0x275533, 1);
          btnG.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
          btnG.lineStyle(1.5, 0xffffff, 1);
          btnG.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
        });
        zone.on("pointerout", () => {
          btnG.clear();
          btnG.fillStyle(rar.key === "RELIC" ? 0x4a1814 : 0x1c3a24, 0.95);
          btnG.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
          btnG.lineStyle(1, rar.key === "RELIC" ? 0xef4444 : 0x4ade80, 0.9);
          btnG.strokeRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
        });
        zone.on("pointerdown", () => {
          // Executa a forja
          executeForge(rar.key);
        });
        rowsContainer.add(zone);
      }
    });

    // Saldo atual de Cristais do Refúgio do Herói
    let curFrags = 0;
    try { curFrags = Xe().fragments || 0; } catch(e) {}
    const tFrags = ui.add.text(cx, y0 + H - 18, `✦ ${typeof __L3 === "function" ? __L3("Cristais do Refúgio do Herói", "Hero's Refuge Crystals", "Cristales del Refugio del Héroe") : "Cristais do Refúgio do Herói"}: ${curFrags} ✦`, {
      fontFamily: F_MONO,
      fontStyle: "bold",
      fontSize: "8px",
      color: "#c9a0ff",
      stroke: "#0a0604",
      strokeThickness: 2
    }).setOrigin(0.5, 0.5);
    rowsContainer.add(tFrags);
  };

  const executeForge = (rarKey) => {
    const bag = S.inventory.items;
    // Pega 3 itens daquela raridade
    const matched = [];
    for (let i = 0; i < bag.length; i++) {
      if (bag[i] && bag[i].rarity === rarKey) {
        matched.push(bag[i]);
        if (matched.length === 3) break;
      }
    }
    if (matched.length < 3) return;

    // Remove os 3 itens
    for (const it of matched) {
      S.inventory.remove(it);
    }

    if (rarKey === "RELIC") {
      // Máxima raridade -> Cristais do Refúgio!
      const m = Xe();
      m.fragments = (m.fragments || 0) + 100;
      m.totalEarned = (m.totalEarned || 0) + 100;
      tr(m);

      try {
        S.audioRef?.play("sfx-boss-victory");
        S.effects?.burstTinted?.(S.player?.x || 0, (S.player?.y || 0) - 8, 0xef4444, 25);
      } catch(e) {}

      S.game.events.emit("ui:banner", typeof __L3 === "function" ? __L3("✦ FORJA: +100 CRISTAIS DO REFÚGIO! ✦", "✦ FORGE: +100 REFUGE CRYSTALS! ✦", "✦ ¡FORJA: +100 CRISTALES DEL REFUGIO! ✦") : "✦ FORJA: +100 CRISTAIS DO REFÚGIO! ✦", "#c9a0ff");
    } else {
      // Raridade superior
      const nextRar = { COMMON: "UNCOMMON", UNCOMMON: "RARE", RARE: "EPIC", EPIC: "LEGENDARY", LEGENDARY: "RELIC" }[rarKey];
      // Seleciona um template aleatório de equipamento
      const pool = ["sword", "axe", "bow", "staff", "armor", "helmet", "boots", "ring", "amulet", "dagger", "mace"];
      let tmpl = "iron_sword";
      try {
        if (S.lootSystem?.pickTemplate) {
          tmpl = S.lootSystem.pickTemplate(pool);
        } else {
          tmpl = pool[Math.floor(Math.random() * pool.length)];
        }
      } catch(e) {}

      let newItem = null;
      try {
        newItem = S.lootSystem.makeItem(tmpl, nextRar);
      } catch(e) {
        newItem = { id: tmpl, name: "Item Forjado", rarity: nextRar, slot: "weapon" };
      }

      S.inventory.add(newItem);

      try {
        S.audioRef?.play("sfx-epic-drop");
        S.effects?.burstTinted?.(S.player?.x || 0, (S.player?.y || 0) - 8, 0xffd24a, 20);
      } catch(e) {}

      const itName = typeof _t === "function" ? _t(newItem) : (newItem.name || "Item");
      S.game.events.emit("ui:banner", `⚔ FORJA: ${itName} (${nextRar})!`, "#ffd24a");
    }

    try { fi(S); } catch(e) {}
    invUi.refresh();
    drawRows();
    S.requestSave?.(500);
  };

  drawRows();
}
