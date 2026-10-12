/* =====================================================================
   CONFIRMAÇÃO E CÁLCULO DE DIFICULDADE DE PORTAL (CAMPANHA)
   - Exibido APENAS na Campanha ao interagir com portais.
   - Design direto, limpo e gótico no padrão das telas do jogo.
   - Explica diretamente o porquê da dificuldade (status/nível vs inimigos).
   - Classificações: NORMAL, DESAFIADOR, DIFÍCIL, PERIGOSO / MORTAL.
   ===================================================================== */

function __calcPortalDifficulty(S, targetLevelId, extra = {}) {
  // 1. DADOS DO HERÓI ATUAL E SEUS EQUIPAMENTOS
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

  // 2. DADOS E INIMIGOS DO LOCAL DE DESTINO
  let destName = "";
  let recLvl = 1;
  let avgEnemyHp = 6;
  let avgEnemyDmg = 2;
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

  let sc = { hpMultiplier: 1, damageMultiplier: 1 };
  if (typeof Lh === "function") {
    try { sc = Lh(recLvl, 0); } catch(e) {}
  }

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
    catacombs: { hp: 4, dmg: 1.2, bHp: 50, bDmg: 2.5, bNm: "Guardião do Abismo" },
    bosque:    { hp: 7, dmg: 2.0, bHp: 65, bDmg: 3.0, bNm: "Anhangá" },
    temple:    { hp: 11, dmg: 2.2, bHp: 75, bDmg: 3.2, bNm: "Golem de Lava" },
    ruins:     { hp: 15, dmg: 2.4, bHp: 115, bDmg: 3.5, bNm: "Górgona das Ruínas" },
    rio:       { hp: 19, dmg: 3.0, bHp: 110, bDmg: 4.0, bNm: "Tengu do Rio" },
    glacial:   { hp: 23, dmg: 3.2, bHp: 145, bDmg: 4.2, bNm: "Guardião Glacial" },
    morta:     { hp: 26, dmg: 3.4, bHp: 135, bDmg: 4.2, bNm: "Bruxa da Raposa" },
    fortress:  { hp: 31, dmg: 4.0, bHp: 220, bDmg: 5.5, bNm: "Dragão Ancião" },
    castle:    { hp: 36, dmg: 4.4, bHp: 320, bDmg: 6.5, bNm: "Rei Valdrak" }
  };
  const fb = fallbackStats[targetLevelId] || { hp: 8, dmg: 2, bHp: 80, bDmg: 3, bNm: "Chefe do Local" };

  let baseHp = enemyList.length ? (enemyList.reduce((acc, e) => acc + (e.maxHp || 2), 0) / enemyList.length) : fb.hp;
  let baseDmg = enemyList.length ? (enemyList.reduce((acc, e) => acc + (e.damage || e.contactDamage || 1), 0) / enemyList.length) : fb.dmg;

  avgEnemyHp = Math.max(1, Math.round(baseHp * (sc.hpMultiplier || 1)));
  avgEnemyDmg = Math.max(1, +(baseDmg * (sc.damageMultiplier || 1)).toFixed(1));

  const bDef = bKey && typeof Yt !== "undefined" ? Yt[bKey] : null;
  if (bDef) {
    bossName = bDef.name || fb.bNm;
    bossHp = Math.round((bDef.maxHp || fb.bHp) * (sc.hpMultiplier || 1) * 1.35);
    bossDmg = Math.round(((bDef.damage || bDef.contactDamage || fb.bDmg) * (sc.damageMultiplier || 1) * 1.12));
  } else if (fb.bHp) {
    bossName = fb.bNm;
    bossHp = Math.round(fb.bHp * (sc.hpMultiplier || 1) * 1.35);
    bossDmg = Math.round(fb.bDmg * (sc.damageMultiplier || 1) * 1.12);
  }

  threat = (avgEnemyHp * 3.5) + (avgEnemyDmg * 15) + (bossHp ? bossHp * 0.35 : 0) + (bossDmg ? bossDmg * 7 : 0);

  // 3. RELAÇÃO DE FORÇA E RESISTÊNCIA
  const lvlDiff = heroLvl - recLvl;
  const lvlMod = Math.max(0.35, 1.0 + (lvlDiff * 0.12));
  const ratio = (heroCombatScore * lvlMod) / Math.max(1, threat);

  // 4. CLASSIFICAÇÃO (Muito Fácil passa a ser NORMAL / MODERADO)
  let diffLabel = "NORMAL";
  let diffColor = "#4ade80";
  let diffBorder = 0x4ade80;
  let diffDesc = "";

  if (ratio >= 1.05) {
    diffLabel = typeof __L3 === "function" ? __L3("NORMAL", "NORMAL", "NORMAL") : "NORMAL";
    diffColor = "#4ade80";
    diffBorder = 0x4ade80;
    diffDesc = typeof __L3 === "function"
      ? __L3(
          `Nível ${heroLvl} e equipamentos suficientes. A força dos monstros (~${avgEnemyDmg} dano) está sob controle.`,
          `Level ${heroLvl} and sufficient gear. Monster strength (~${avgEnemyDmg} dmg) is well within control.`,
          `Nivel ${heroLvl} y equipo suficiente. La fuerza de los monstruos (~${avgEnemyDmg} daño) está bajo control.`
        )
      : `Nível ${heroLvl} e equipamentos suficientes. A força dos monstros (~${avgEnemyDmg} dano) está sob controle.`;
  } else if (ratio >= 0.85) {
    diffLabel = typeof __L3 === "function" ? __L3("DESAFIADOR", "CHALLENGING", "DESAFIANTE") : "DESAFIADOR";
    diffColor = "#fbbf24";
    diffBorder = 0xfbbf24;
    diffDesc = typeof __L3 === "function"
      ? __L3(
          `Monstros de força equivalente (~${avgEnemyDmg} dano, ~${avgEnemyHp} HP). Requer atenção e boas esquivas.`,
          `Enemies of equal power (~${avgEnemyDmg} dmg, ~${avgEnemyHp} HP). Requires attention and good dodges.`,
          `Monstruos de poder similar (~${avgEnemyDmg} daño, ~${avgEnemyHp} HP). Requiere atención y esquivas.`
        )
      : `Monstros de força equivalente (~${avgEnemyDmg} dano, ~${avgEnemyHp} HP). Requer atenção e boas esquivas.`;
  } else if (ratio >= 0.65) {
    diffLabel = typeof __L3 === "function" ? __L3("DIFÍCIL", "HARD", "DIFÍCIL") : "DIFÍCIL";
    diffColor = "#fb923c";
    diffBorder = 0xfb923c;
    diffDesc = typeof __L3 === "function"
      ? __L3(
          `Destino acima do seu preparo atual. Inimigos resistentes e chefe perigoso (${bossHp ? bossHp + ' HP' : 'alto dano'}).`,
          `Zone above your current build. Tough enemies and dangerous boss (${bossHp ? bossHp + ' HP' : 'high dmg'}).`,
          `Zona por encima de tu preparación. Enemigos duros y jefe peligroso (${bossHp ? bossHp + ' HP' : 'alto daño'}).`
        )
      : `Destino acima do seu preparo atual. Inimigos resistentes e chefe perigoso (${bossHp ? bossHp + ' HP' : 'alto dano'}).`;
  } else {
    diffLabel = typeof __L3 === "function" ? __L3("PERIGO MORTAL", "DEADLY HAZARD", "PELIGRO MORTAL") : "PERIGO MORTAL";
    diffColor = "#ef4444";
    diffBorder = 0xef4444;
    diffDesc = typeof __L3 === "function"
      ? __L3(
          `Nível recomendado Lvl ${recLvl}+. Seu herói corre alto risco de derrota com itens e defesa atuais!`,
          `Recommended level Lvl ${recLvl}+. Your hero risks quick defeat with current defense and gear!`,
          `Nivel recomendado Lvl ${recLvl}+. ¡Tu héroe corre gran riesgo de derrota con equipo actual!`
        )
      : `Nível recomendado Lvl ${recLvl}+. Seu herói corre alto risco de derrota com itens e defesa atuais!`;
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
  
  // NUNCA abrir no Modo Infinito (conforme solicitação)
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

  // Modal mais direto, compacto e elegante
  const W = 380;
  const H = 210;
  const cx = Math.round(_ / 2);
  const cy = Math.round(st / 2);
  const x0 = cx - Math.round(W / 2);
  const y0 = cy - Math.round(H / 2);

  const R = ui.add.container(0, 0).setDepth(9950);

  // Fundo escuro com bloqueio
  const dim = ui.add.rectangle(cx, cy, _ * 1.5, st * 1.5, 0x050403, 0.78).setInteractive();
  R.add(dim);

  // Moldura gótica
  const bg = ui.add.graphics();
  bg.fillStyle(0x0e0906, 0.98);
  bg.fillRoundedRect(x0, y0, W, H, 8);
  bg.lineStyle(2, 0xc9a24a, 0.95);
  bg.strokeRoundedRect(x0, y0, W, H, 8);
  bg.lineStyle(1, 0x3d2c18, 0.85);
  bg.strokeRoundedRect(x0 + 3, y0 + 3, W - 6, H - 6, 6);
  R.add(bg);

  // Título e Destino
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

  // Faixa de Dificuldade
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

  // Resumo Comparativo Direto
  const boxY = y0 + 70;
  const boxW = 168;
  const boxH = 46;

  // Caixa 1: Herói
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

  // Caixa 2: Destino
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

  // Explicação direta e objetiva
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

  // Pergunta direta
  const tAsk = ui.add.text(cx, y0 + 144, typeof __L3 === "function" ? __L3("Deseja entrar no portal?", "Do you want to enter?", "¿Deseas entrar al portal?") : "Deseja entrar no portal?", {
    fontFamily: F_MONO,
    fontStyle: "bold",
    fontSize: "8.5px",
    color: "#d1c7b7",
    stroke: "#0a0604",
    strokeThickness: 2
  }).setOrigin(0.5, 0);
  R.add(tAsk);

  // Botões
  const btnY = y0 + H - 24;
  const btnW = 138;
  const btnH = 22;

  let closed = !1;
  const close = () => {
    if (closed) return;
    closed = !0;
    S.__portalModalOpen = !1;
    S.uiOpen = !1;
    ui.input.keyboard?.off("keydown", keyHandler);
    R.destroy();
    S.physics?.resume?.();
  };

  const confirmAction = () => {
    if (closed) return;
    closed = !0;
    S.__portalModalOpen = !1;
    ui.input.keyboard?.off("keydown", keyHandler);
    R.destroy();
    try { opts.onConfirm?.() } catch(e) { S.physics?.resume?.(); S.uiOpen = !1; }
  };

  // Botão 1: ENTRAR
  const enterBtnX = cx - 76;
  const bEnterBg = ui.add.graphics();
  bEnterBg.fillStyle(0x163820, 0.95);
  bEnterBg.fillRoundedRect(enterBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
  bEnterBg.lineStyle(1.5, 0x4ade80, 0.95);
  bEnterBg.strokeRoundedRect(enterBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);

  const tEnter = ui.add.text(enterBtnX, btnY, "✔ ENTRAR [ENTER]", {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "9px",
    color: "#86efac",
    stroke: "#0a0604",
    strokeThickness: 2
  }).setOrigin(0.5, 0.5);

  const enterZone = ui.add.zone(enterBtnX, btnY, btnW, btnH).setInteractive({ useHandCursor: !0 });
  enterZone.on("pointerover", () => {
    bEnterBg.clear();
    bEnterBg.fillStyle(0x235230, 1);
    bEnterBg.fillRoundedRect(enterBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
    bEnterBg.lineStyle(1.5, 0xffffff, 1);
    bEnterBg.strokeRoundedRect(enterBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
  });
  enterZone.on("pointerout", () => {
    bEnterBg.clear();
    bEnterBg.fillStyle(0x163820, 0.95);
    bEnterBg.fillRoundedRect(enterBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
    bEnterBg.lineStyle(1.5, 0x4ade80, 0.95);
    bEnterBg.strokeRoundedRect(enterBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
  });
  enterZone.on("pointerdown", () => confirmAction());
  R.add([bEnterBg, tEnter, enterZone]);

  // Botão 2: RECUAR
  const cancelBtnX = cx + 76;
  const bCancelBg = ui.add.graphics();
  bCancelBg.fillStyle(0x241a10, 0.95);
  bCancelBg.fillRoundedRect(cancelBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
  bCancelBg.lineStyle(1.5, 0x8a7f66, 0.9);
  bCancelBg.strokeRoundedRect(cancelBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);

  const tCancel = ui.add.text(cancelBtnX, btnY, "✕ RECUAR [ESC]", {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "9px",
    color: "#d1c7b7",
    stroke: "#0a0604",
    strokeThickness: 2
  }).setOrigin(0.5, 0.5);

  const cancelZone = ui.add.zone(cancelBtnX, btnY, btnW, btnH).setInteractive({ useHandCursor: !0 });
  cancelZone.on("pointerover", () => {
    bCancelBg.clear();
    bCancelBg.fillStyle(0x3a2c1d, 1);
    bCancelBg.fillRoundedRect(cancelBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
    bCancelBg.lineStyle(1.5, 0xffffff, 1);
    bCancelBg.strokeRoundedRect(cancelBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
  });
  cancelZone.on("pointerout", () => {
    bCancelBg.clear();
    bCancelBg.fillStyle(0x241a10, 0.95);
    bCancelBg.fillRoundedRect(cancelBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
    bCancelBg.lineStyle(1.5, 0x8a7f66, 0.9);
    bCancelBg.strokeRoundedRect(cancelBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 4);
  });
  cancelZone.on("pointerdown", () => close());
  dim.on("pointerdown", () => close());
  R.add([bCancelBg, tCancel, cancelZone]);

  const keyHandler = ev => {
    if (closed) return;
    if (ev.key === "Enter" || ev.key === " " || ev.key === "e" || ev.key === "E") {
      ev.stopImmediatePropagation?.();
      confirmAction();
    } else if (ev.key === "Escape" || ev.key === "Backspace" || ev.key === "q" || ev.key === "Q") {
      ev.stopImmediatePropagation?.();
      close();
    }
  };
  ui.input.keyboard?.on("keydown", keyHandler);
}
