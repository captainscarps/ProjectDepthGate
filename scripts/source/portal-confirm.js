/* =====================================================================
   CONFIRMAÇÃO E CÁLCULO DE DIFICULDADE DE PORTAL (CAMPANHA)
   - Exibido APENAS na Campanha ao interagir com portais.
   - Navegável 100% com GAMEPAD (D-pad/Stick e botões A/B) e TECLADO/MOUSE.
   - Design direto, gótico e no padrão das telas do jogo.
   ===================================================================== */

function __calcPortalDifficulty(S, targetLevelId, extra = {}) {
  const heroLvl = Math.max(1, S.stats?.level ?? 1);
  const heroTot = S.stats?.total ?? {};
  const heroDmg = Math.max(heroTot.damage ?? 0, heroTot.magicDamage ?? 0, 1);
  const heroMaxHp = Math.round(S.player?.maxHp ?? heroTot.maxHp ?? 10);
  const heroDef = Math.round(heroTot.defense ?? 0);
  
  const eqMap = S.inventory?.equipment ?? {};
  const eqList = Object.values(eqMap).filter(Boolean);
  const eqCount = eqList.length;
  
  let heroPwr = 0;
  if (typeof Qi === "function") {
    try { heroPwr = Qi(S.stats, S.inventory); } catch(e) {}
  }
  if (!heroPwr) {
    const rScore = { COMMON: 1, UNCOMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 5, RELIC: 6 };
    let eqBonus = 0;
    for (const item of eqList) if (item) eqBonus += 4 + (rScore[item.rarity] || 1) ** 2 * 2;
    heroPwr = heroLvl * 8 + heroDmg * 2.5 + heroDef * 2 + heroMaxHp * 0.8 + eqBonus;
  }
  
  const heroEHP = heroMaxHp * (1 + heroDef * 0.18);
  const heroOffense = heroDmg * 16 + (heroTot.critChance ? heroTot.critChance * 1.5 : 0);
  const heroCombatScore = (heroEHP * 2.8) + heroOffense + (heroPwr * 0.5);

  let destName = "";
  let recLvl = 1;
  let avgEnemyHp = 8;
  let avgEnemyDmg = 2.5;
  let bossName = null;
  let bossHp = 0;
  let bossDmg = 0;
  let threat = 100;

  const lv = typeof ki !== "undefined" ? ki[targetLevelId] : null;
  try {
    destName = typeof St === "function" ? St(`lvl.${targetLevelId}`, lv?.name ?? targetLevelId) : (lv?.name ?? targetLevelId);
  } catch(e) {
    destName = lv?.name ?? targetLevelId;
  }
  
  const dungeonProgression = {
    catacombs: 1,
    bosque: 2,
    temple: 3,
    ruins: 4,
    rio: 5,
    glacial: 6,
    morta: 7,
    fortress: 8,
    castle: 9
  };
  recLvl = dungeonProgression[targetLevelId] || lv?.depth || 1;

  const t = Math.max(0, Math.max(heroLvl, recLvl) - 1);
  const scHp = Math.min(8, (1 + t * 0.17) * 1.15);
  const scDmg = Math.min(4.5, (1 + t * 0.11) * 1.12);

  const enemyList = [];
  let bKey = null;
  if (lv?.rooms) {
    for (const r of lv.rooms) {
      if (r.enemies) {
        for (const en of r.enemies) {
          if (en?.type && typeof ee !== "undefined" && ee[en.type]) {
            enemyList.push(ee[en.type]);
          }
        }
      }
      if (r.boss && typeof Yt !== "undefined" && Yt[r.boss]) {
        bKey = r.boss;
      }
    }
  }
  if (targetLevelId === "castle") bKey = "CASTLE_LORD";

  const fallbackStats = {
    catacombs: { hp: 5, dmg: 1.5, bHp: 65, bDmg: 3.0, bNm: "Guardião do Abismo" },
    bosque:    { hp: 8, dmg: 2.2, bHp: 80, bDmg: 3.5, bNm: "Anhangá" },
    temple:    { hp: 12, dmg: 2.6, bHp: 95, bDmg: 3.8, bNm: "Golem de Lava" },
    ruins:     { hp: 16, dmg: 3.0, bHp: 130, bDmg: 4.2, bNm: "Górgona das Ruínas" },
    rio:       { hp: 20, dmg: 3.4, bHp: 135, bDmg: 4.6, bNm: "Tengu do Rio" },
    glacial:   { hp: 24, dmg: 3.8, bHp: 165, bDmg: 5.0, bNm: "Guardião Glacial" },
    morta:     { hp: 28, dmg: 4.2, bHp: 155, bDmg: 5.2, bNm: "Bruxa da Raposa" },
    fortress:  { hp: 34, dmg: 4.8, bHp: 240, bDmg: 6.2, bNm: "Dragão Ancião" },
    castle:    { hp: 40, dmg: 5.4, bHp: 350, bDmg: 7.5, bNm: "Rei Valdrak" }
  };
  const fb = fallbackStats[targetLevelId] || { hp: 9, dmg: 2.5, bHp: 90, bDmg: 3.8, bNm: "Chefe do Local" };

  let baseHp = enemyList.length ? (enemyList.reduce((acc, e) => acc + (e.maxHp || 2), 0) / enemyList.length) : fb.hp;
  let baseDmg = enemyList.length ? (enemyList.reduce((acc, e) => acc + (e.damage || e.contactDamage || 1), 0) / enemyList.length) : fb.dmg;

  avgEnemyHp = Math.max(2, Math.round(baseHp * scHp));
  avgEnemyDmg = Math.max(1.5, +(baseDmg * scDmg).toFixed(1));

  const bDef = bKey && typeof Yt !== "undefined" ? Yt[bKey] : null;
  if (bDef) {
    bossName = bDef.name || fb.bNm;
    bossHp = Math.round((bDef.maxHp || fb.bHp) * scHp * 1.35);
    bossDmg = Math.round(((bDef.damage || bDef.contactDamage || fb.bDmg) * scDmg * 1.15));
  } else if (fb.bHp) {
    bossName = fb.bNm;
    bossHp = Math.round(fb.bHp * scHp * 1.35);
    bossDmg = Math.round(fb.bDmg * scDmg * 1.15);
  }

  threat = (avgEnemyHp * 4.2) + (avgEnemyDmg * 22) + (bossHp ? bossHp * 0.45 : 0) + (bossDmg ? bossDmg * 9 : 0);

  const lvlDiff = heroLvl - recLvl;
  const lvlMod = Math.max(0.4, 1.0 + (lvlDiff * 0.08));
  const ratio = (heroCombatScore * lvlMod) / Math.max(1, threat);

  let diffLabel = "MODERADO";
  let diffColor = "#38bdf8";
  let diffBorder = 0x38bdf8;
  let diffDesc = "";

  if (ratio >= 0.95) {
    diffLabel = typeof __L3 === "function" ? __L3("MODERADO", "MODERATE", "MODERADO") : "MODERADO";
    diffColor = "#38bdf8";
    diffBorder = 0x38bdf8;
    diffDesc = typeof __L3 === "function"
      ? __L3(
          `Desafio balanceado. Monstros causam dano considerável (~${avgEnemyDmg} dano). Requer atenção contínua e foco.`,
          `Balanced challenge. Monsters inflict solid damage (~${avgEnemyDmg} dmg). Demands active focus and care.`,
          `Desafío balanceado. Los monstruos infligen daño considerable (~${avgEnemyDmg} daño). Requiere atención continua.`
        )
      : `Desafio balanceado. Monstros causam dano considerável (~${avgEnemyDmg} dano). Requer atenção contínua e foco.`;
  } else if (ratio >= 0.75) {
    diffLabel = typeof __L3 === "function" ? __L3("DESAFIADOR", "CHALLENGING", "DESAFIANTE") : "DESAFIADOR";
    diffColor = "#fbbf24";
    diffBorder = 0xfbbf24;
    diffDesc = typeof __L3 === "function"
      ? __L3(
          `Inimigos de alta resistência (~${avgEnemyHp} HP). Ataques combinados podem esgotar sua vida rapidamente!`,
          `Tough enemies (~${avgEnemyHp} HP). Grouped strikes can deplete your health quickly!`,
          `Enemigos resistentes (~${avgEnemyHp} HP). ¡Ataques combinados pueden vaciar tu salud con rapidez!`
        )
      : `Inimigos de alta resistência (~${avgEnemyHp} HP). Ataques combinados podem esgotar sua vida rapidamente!`;
  } else if (ratio >= 0.55) {
    diffLabel = typeof __L3 === "function" ? __L3("DIFÍCIL", "HARD", "DIFÍCIL") : "DIFÍCIL";
    diffColor = "#fb923c";
    diffBorder = 0xfb923c;
    diffDesc = typeof __L3 === "function"
      ? __L3(
          `Destino com perigo elevado. Chefe com alto impacto (${bossHp ? bossHp + ' HP' : 'letal'}) e monstros agressivos.`,
          `High-threat destination. Boss packs heavy blows (${bossHp ? bossHp + ' HP' : 'lethal'}) and aggressive mobs.`,
          `Destino de alto peligro. Jefe de gran impacto (${bossHp ? bossHp + ' HP' : 'letal'}) y monstruos agresivos.`
        )
      : `Destino com perigo elevado. Chefe com alto impacto (${bossHp ? bossHp + ' HP' : 'letal'}) e monstros agressivos.`;
  } else {
    diffLabel = typeof __L3 === "function" ? __L3("PERIGO MORTAL", "DEADLY HAZARD", "PELIGRO MORTAL") : "PERIGO MORTAL";
    diffColor = "#ef4444";
    diffBorder = 0xef4444;
    diffDesc = typeof __L3 === "function"
      ? __L3(
          `Nível Lvl ${recLvl}+ recomendado. Monstros brutais capazes de derrotar o herói em poucos golpes!`,
          `Recommended Lvl ${recLvl}+. Brutal monsters capable of taking the hero down in just a few hits!`,
          `Nivel Lvl ${recLvl}+ recomendado. ¡Monstruos letales capaces de abatir al héroe en pocos golpes!`
        )
      : `Nível Lvl ${recLvl}+ recomendado. Monstros brutais capazes de derrotar o herói em poucos golpes!`;
  }

  return {
    destName,
    recLvl,
    heroLvl,
    heroMaxHp,
    heroDef,
    heroDmg,
    heroPwr: Math.round(heroPwr),
    eqCount,
    avgEnemyHp,
    avgEnemyDmg,
    bossName,
    bossHp,
    bossDmg,
    diffLabel,
    diffColor,
    diffBorder,
    diffDesc
  };
}

function __portalPrompt(S, opts = {}) {
  if (!S || S.transitioning || S.__portalModalOpen) return;
  
  if (S.level?.endless || S.game?.registry?.get("mode") === "endless" || opts.levelId === "endless") {
    try { opts.onConfirm?.(); } catch(e) {}
    return;
  }

  const ui = S.scene.get("UI") || S;
  if (!ui || ui.__dlgOpen) return;

  S.__portalModalOpen = !0;
  S.uiOpen = !0;
  S.physics?.pause?.();
  S.player?.setVelocity?.(0, 0);

  try { S.audio?.play("sfx-room-enter") } catch(e) {}

  const d = __calcPortalDifficulty(S, opts.levelId, opts);
  const F_SERIF = "Georgia, 'Times New Roman', serif";
  const F_MONO = "'Courier New', monospace";

  const W = 380;
  const H = 210;
  const cx = Math.round(_ / 2);
  const cy = Math.round(st / 2);
  const x0 = cx - Math.round(W / 2);
  const y0 = cy - Math.round(H / 2);

  const R = ui.add.container(0, 0).setDepth(9950);

  const dim = ui.add.rectangle(cx, cy, _ * 1.5, st * 1.5, 0x050403, 0.78).setInteractive();
  R.add(dim);

  const bg = ui.add.graphics();
  bg.fillStyle(0x0e0906, 0.98);
  bg.fillRoundedRect(x0, y0, W, H, 8);
  bg.lineStyle(2, 0xc9a24a, 0.95);
  bg.strokeRoundedRect(x0, y0, W, H, 8);
  bg.lineStyle(1, 0x3d2c18, 0.85);
  bg.strokeRoundedRect(x0 + 3, y0 + 3, W - 6, H - 6, 6);
  R.add(bg);

  const titleTxt = typeof __L3 === "function" ? __L3("ATRAVESSAR PORTAL?", "ENTER PORTAL?", "¿CRUZAR PORTAL?") : "ATRAVESSAR PORTAL?";
  const t1 = ui.add.text(cx, y0 + 12, titleTxt, {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "12px",
    color: "#ffd24a",
    stroke: "#0a0604",
    strokeThickness: 3
  }).setOrigin(0.5, 0);

  const tSub = ui.add.text(cx, y0 + 28, `✦ ${d.destName.toUpperCase()} ✦`, {
    fontFamily: F_MONO,
    fontStyle: "bold",
    fontSize: "9.5px",
    color: "#e9d5ff",
    stroke: "#0a0604",
    strokeThickness: 2
  }).setOrigin(0.5, 0);
  R.add([t1, tSub]);

  const badgeY = y0 + 44;
  const badgeW = 240;
  const badgeH = 20;
  const badgeBg = ui.add.graphics();
  badgeBg.fillStyle(0x18100a, 0.95);
  badgeBg.fillRoundedRect(cx - badgeW / 2, badgeY, badgeW, badgeH, 4);
  badgeBg.lineStyle(1.5, d.diffBorder, 0.9);
  badgeBg.strokeRoundedRect(cx - badgeW / 2, badgeY, badgeW, badgeH, 4);
  R.add(badgeBg);

  const badgeTxt = typeof __L3 === "function"
    ? __L3(`DIFICULDADE: [ ${d.diffLabel} ]`, `DIFFICULTY: [ ${d.diffLabel} ]`, `DIFICULTAD: [ ${d.diffLabel} ]`)
    : `DIFICULDADE: [ ${d.diffLabel} ]`;
  const tBadge = ui.add.text(cx, badgeY + badgeH / 2, badgeTxt, {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "10px",
    color: d.diffColor,
    stroke: "#0a0604",
    strokeThickness: 2.5
  }).setOrigin(0.5, 0.5);
  R.add(tBadge);

  const boxY = y0 + 70;
  const boxW = 168;
  const boxH = 46;

  const leftX = cx - Math.round(W / 2) + 14;
  const leftBg = ui.add.graphics();
  leftBg.fillStyle(0x140e0a, 0.9);
  leftBg.fillRoundedRect(leftX, boxY, boxW, boxH, 4);
  leftBg.lineStyle(1, 0x4a3721, 0.85);
  leftBg.strokeRoundedRect(leftX, boxY, boxW, boxH, 4);
  R.add(leftBg);

  const tHeroHdr = ui.add.text(leftX + 6, boxY + 4, `HERÓI: Lvl ${d.heroLvl}`, {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "8.5px",
    color: "#ffd24a"
  });
  const tHeroL1 = ui.add.text(leftX + 6, boxY + 18, `Ataque: ~${d.heroDmg} | Def: ${d.heroDef}`, {
    fontFamily: F_MONO,
    fontSize: "7.5px",
    color: "#f3e8c8"
  });
  const tHeroL2 = ui.add.text(leftX + 6, boxY + 30, `Vida: ${d.heroMaxHp} HP | Itens: ${d.eqCount}`, {
    fontFamily: F_MONO,
    fontSize: "7.5px",
    color: "#86efac"
  });
  R.add([tHeroHdr, tHeroL1, tHeroL2]);

  const rightX = cx + Math.round(W / 2) - boxW - 14;
  const rightBg = ui.add.graphics();
  rightBg.fillStyle(0x140e0a, 0.9);
  rightBg.fillRoundedRect(rightX, boxY, boxW, boxH, 4);
  rightBg.lineStyle(1, 0x4a3721, 0.85);
  rightBg.strokeRoundedRect(rightX, boxY, boxW, boxH, 4);
  R.add(rightBg);

  const tEnemyHdr = ui.add.text(rightX + 6, boxY + 4, `DESTINO: Lvl ${d.recLvl}+`, {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "8.5px",
    color: "#f87171"
  });
  const tEnemyL1 = ui.add.text(rightX + 6, boxY + 18, `Monstros: ~${d.avgEnemyDmg} Dano | ~${d.avgEnemyHp} HP`, {
    fontFamily: F_MONO,
    fontSize: "7.5px",
    color: "#fca5a5"
  });
  const bossStr = d.bossName ? `${d.bossName}` : "Inimigos de Elite";
  const tEnemyL2 = ui.add.text(rightX + 6, boxY + 30, `Chefe: ${bossStr}`, {
    fontFamily: F_MONO,
    fontSize: "7.5px",
    color: "#fbbf24"
  });
  R.add([tEnemyHdr, tEnemyL1, tEnemyL2]);

  const tDesc = ui.add.text(cx, y0 + 124, d.diffDesc, {
    fontFamily: F_SERIF,
    fontSize: "8px",
    color: d.diffColor,
    align: "center",
    stroke: "#0a0604",
    strokeThickness: 2,
    wordWrap: { width: W - 28 }
  }).setOrigin(0.5, 0);
  R.add(tDesc);

  const btnY = y0 + H - 24;
  const btnW = 138;
  const btnH = 22;

  let selectedIdx = 0; // 0 = Entrar, 1 = Recuar
  let closed = !1;

  const close = () => {
    if (closed) return;
    closed = !0;
    S.__portalModalOpen = !1;
    S.uiOpen = !1;
    ui.input.keyboard?.off("keydown", keyHandler);
    window.removeEventListener("gamepadconnected", refreshPad);
    R.destroy();
    S.physics?.resume?.();
  };

  const confirmAction = () => {
    if (closed) return;
    closed = !0;
    S.__portalModalOpen = !1;
    ui.input.keyboard?.off("keydown", keyHandler);
    window.removeEventListener("gamepadconnected", refreshPad);
    R.destroy();
    try { opts.onConfirm?.() } catch(e) { S.physics?.resume?.(); S.uiOpen = !1; }
  };

  const bEnterBg = ui.add.graphics();
  const enterBtnX = cx - 76;
  const tEnter = ui.add.text(enterBtnX, btnY, "✔ ENTRAR", {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "9px",
    color: "#86efac",
    stroke: "#0a0604",
    strokeThickness: 2
  }).setOrigin(0.5, 0.5);
  const enterZone = ui.add.zone(enterBtnX, btnY, btnW, btnH).setInteractive({ useHandCursor: !0 });

  const bCancelBg = ui.add.graphics();
  const cancelBtnX = cx + 76;
  const tCancel = ui.add.text(cancelBtnX, btnY, "✕ RECUAR", {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "9px",
    color: "#d1c7b7",
    stroke: "#0a0604",
    strokeThickness: 2
  }).setOrigin(0.5, 0.5);
  const cancelZone = ui.add.zone(cancelBtnX, btnY, btnW, btnH).setInteractive({ useHandCursor: !0 });

  const updateVisualButtons = () => {
    bEnterBg.clear();
    bCancelBg.clear();

    const isEnterSel = selectedIdx === 0;
    bEnterBg.fillStyle(isEnterSel ? 0x245832 : 0x163820, 0.95);
    bEnterBg.fillRoundedRect(enterBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
    bEnterBg.lineStyle(isEnterSel ? 2 : 1.5, isEnterSel ? 0xffffff : 0x4ade80, 0.95);
    bEnterBg.strokeRoundedRect(enterBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
    tEnter.setColor(isEnterSel ? "#ffffff" : "#86efac");

    const isCancelSel = selectedIdx === 1;
    bCancelBg.fillStyle(isCancelSel ? 0x3d2c18 : 0x241a10, 0.95);
    bCancelBg.fillRoundedRect(cancelBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
    bCancelBg.lineStyle(isCancelSel ? 2 : 1.5, isCancelSel ? 0xffffff : 0x8a7f66, 0.9);
    bCancelBg.strokeRoundedRect(cancelBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
    tCancel.setColor(isCancelSel ? "#ffffff" : "#d1c7b7");
  };

  enterZone.on("pointerover", () => { selectedIdx = 0; updateVisualButtons(); });
  enterZone.on("pointerdown", () => confirmAction());

  cancelZone.on("pointerover", () => { selectedIdx = 1; updateVisualButtons(); });
  cancelZone.on("pointerdown", () => close());
  dim.on("pointerdown", () => close());

  updateVisualButtons();
  R.add([bEnterBg, tEnter, enterZone, bCancelBg, tCancel, cancelZone]);

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
      if (selectedIdx === 0) confirmAction(); else close();
    } else if (ev.key === "Escape" || ev.key === "Backspace" || ev.key === "q" || ev.key === "Q") {
      ev.stopImmediatePropagation?.();
      close();
    }
  };
  ui.input.keyboard?.on("keydown", keyHandler);

  // Navegação direta com GAMEPAD (D-pad, Analógico, Botões A e B)
  let prevPadBtn = {};
  const padPoll = () => {
    if (closed) return;
    try {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const pad = Array.from(pads).find(p => p && p.connected);
      if (pad) {
        const btn = (i) => !!pad.buttons[i]?.pressed || (pad.buttons[i]?.value || 0) > 0.5;
        const left = btn(14) || (pad.axes[0] || 0) < -0.5;
        const right = btn(15) || (pad.axes[0] || 0) > 0.5;
        const confirm = btn(0); // Botão A / Cruz
        const cancel = btn(1) || btn(9); // Botão B / Círculo ou Start

        if (left && !prevPadBtn.left) {
          selectedIdx = 0;
          updateVisualButtons();
        } else if (right && !prevPadBtn.right) {
          selectedIdx = 1;
          updateVisualButtons();
        } else if (confirm && !prevPadBtn.confirm) {
          if (selectedIdx === 0) confirmAction(); else close();
        } else if (cancel && !prevPadBtn.cancel) {
          close();
        }

        prevPadBtn = { left, right, confirm, cancel };
      }
    } catch(e) {}
    if (!closed) requestAnimationFrame(padPoll);
  };
  requestAnimationFrame(padPoll);

  const refreshPad = () => {};
  window.addEventListener("gamepadconnected", refreshPad);
}
