/* =====================================================================
   CONFIRMAÇÃO E CÁLCULO DE DIFICULDADE DE PORTAL
   Pergunta se o jogador tem certeza antes de entrar num portal e exibe
   a dificuldade calculada com base na força e resistência dos inimigos
   do local comparados ao nível e equipamentos do herói.
   ===================================================================== */

function __calcPortalDifficulty(S, targetLevelId, extra = {}) {
  // 1. DADOS DO HERÓI ATUAL E SEUS EQUIPAMENTOS
  const heroLvl = Math.max(1, S.stats?.level ?? 1);
  const heroTot = S.stats?.total ?? {};
  const heroDmg = Math.max(heroTot.damage ?? 0, heroTot.magicDamage ?? 0, 1);
  const heroMaxHp = Math.round(S.player?.maxHp ?? heroTot.maxHp ?? 10);
  const heroDef = Math.round(heroTot.defense ?? 0);
  
  // Equipamentos equipados:
  const eqMap = S.inventory?.equipment ?? {};
  const eqList = Object.values(eqMap).filter(Boolean);
  const eqCount = eqList.length;
  
  // Poder de combate do herói (Qi é a função padrão da engine para rating de herói + equipamentos):
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
  
  // Durabilidade efetiva do herói (EHP) e Poder Ofensivo:
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

  if (targetLevelId === "endless") {
    const depth = extra.depth || (S.endlessRun?.()?.depth || 1) + 1;
    destName = typeof __L3 === "function" 
      ? __L3(`Modo Infinito — Andar ${depth}`, `Endless Mode — Floor ${depth}`, `Modo Infinito — Piso ${depth}`)
      : `Modo Infinito — Andar ${depth}`;
    recLvl = Math.max(1, Math.round(depth * 1.4));
    avgEnemyHp = Math.round(8 * (1 + depth * 0.32));
    avgEnemyDmg = Math.max(1, Math.round(2 * (1 + depth * 0.18)));
    if (depth % 5 === 0) {
      bossName = typeof __L3 === "function" ? __L3("Guardião das Profundezas", "Depths Guardian", "Guardián de las Profundidades") : "Guardião das Profundezas";
      bossHp = Math.round(100 * (1 + depth * 0.4));
      bossDmg = Math.round(4 * (1 + depth * 0.22));
    }
    threat = (avgEnemyHp * 3.5) + (avgEnemyDmg * 15) + (bossHp ? bossHp * 0.35 : 0) + (bossDmg ? bossDmg * 7 : 0);
  } else {
    const lv = typeof ki !== "undefined" ? ki[targetLevelId] : null;
    try {
      destName = typeof St === "function" ? St(`lvl.${targetLevelId}`, lv?.name ?? targetLevelId) : (lv?.name ?? targetLevelId);
    } catch(e) {
      destName = lv?.name ?? targetLevelId;
    }
    
    // Níveis recomendados por progressão de masmorra no jogo:
    const REC_LEVELS = {
      forest: 1,
      catacombs: 2,
      bosque: 3,
      temple: 4,
      ruins: 5,
      rio: 6,
      glacial: 7,
      morta: 8,
      fortress: 9,
      castle: 10
    };
    recLvl = REC_LEVELS[targetLevelId] ?? 3;

    // Escalonamento de atributos de inimigos:
    let sc = { hpMultiplier: 1, damageMultiplier: 1 };
    if (typeof __dgScale === "function") {
      try { sc = __dgScale(S, false); } catch(e) {}
    } else if (typeof Lh === "function") {
      try { sc = Lh(recLvl, 0); } catch(e) {}
    }

    // Coleta de inimigos das salas da fase:
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

    // Médias base de vida (resistência) e dano (força):
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
  }

  // 3. RELAÇÃO DE FORÇA E RESISTÊNCIA (HERÓI VS INIMIGOS)
  const lvlDiff = heroLvl - recLvl;
  const lvlMod = Math.max(0.35, 1.0 + (lvlDiff * 0.12));
  const ratio = (heroCombatScore * lvlMod) / Math.max(1, threat);

  // 4. CLASSIFICAÇÃO DE DIFICULDADE
  let diffLabel = "MODERADA";
  let diffColor = "#fbbf24"; // Âmbar dourado
  let diffBorder = 0xfbbf24;
  let diffDesc = typeof __L3 === "function" 
    ? __L3("Desafio equilibrado. Exigirá habilidade e poções.", "Balanced challenge. Will require skill and potions.", "Desafío equilibrado. Requerirá habilidad y pociones.")
    : "Desafio equilibrado. Exigirá habilidade e poções.";

  if (ratio >= 1.35) {
    diffLabel = typeof __L3 === "function" ? __L3("MUITO FÁCIL", "VERY EASY", "MUY FÁCIL") : "MUITO FÁCIL";
    diffColor = "#4ade80";
    diffBorder = 0x4ade80;
    diffDesc = typeof __L3 === "function"
      ? __L3("Seu herói e equipamentos superam amplamente este local.", "Your hero and gear far outmatch this location.", "Tu héroe y equipo superan con creces este lugar.")
      : "Seu herói e equipamentos superam amplamente este local.";
  } else if (ratio >= 1.05) {
    diffLabel = typeof __L3 === "function" ? __L3("FÁCIL", "EASY", "FÁCIL") : "FÁCIL";
    diffColor = "#86efac";
    diffBorder = 0x86efac;
    diffDesc = typeof __L3 === "function"
      ? __L3("Você está bem preparado para a força dos monstros daqui.", "You are well prepared for the monsters here.", "Estás bien preparado para la fuerza de estos monstruos.")
      : "Você está bem preparado para a força dos monstros daqui.";
  } else if (ratio >= 0.85) {
    diffLabel = typeof __L3 === "function" ? __L3("MODERADA", "MODERATE", "MODERADA") : "MODERADA";
    diffColor = "#fbbf24";
    diffBorder = 0xfbbf24;
    diffDesc = typeof __L3 === "function"
      ? __L3("Inimigos de força equivalente. Lute com atenção.", "Enemies of equal strength. Fight attentively.", "Enemigos de fuerza equivalente. Lucha con atención.")
      : "Inimigos de força equivalente. Lute com atenção.";
  } else if (ratio >= 0.65) {
    diffLabel = typeof __L3 === "function" ? __L3("DIFÍCIL", "HARD", "DIFÍCIL") : "DIFÍCIL";
    diffColor = "#fb923c";
    diffBorder = 0xfb923c;
    diffDesc = typeof __L3 === "function"
      ? __L3("Inimigos resistentes com alto dano! Cuidado com emboscadas.", "Resistant enemies with high damage! Beware of ambushes.", "¡Enemigos resistentes con alto daño! Cuidado con emboscadas.")
      : "Inimigos resistentes com alto dano! Cuidado com emboscadas.";
  } else {
    diffLabel = typeof __L3 === "function" ? __L3("EXTREMA / MORTAL", "EXTREME / DEADLY", "EXTREMA / MORTAL") : "EXTREMA / MORTAL";
    diffColor = "#ef4444";
    diffBorder = 0xef4444;
    diffDesc = typeof __L3 === "function"
      ? __L3("PERIGO MORTAL! Monstros muito fortes para seu nível e itens atuais.", "DEADLY PERIL! Monsters too strong for your current level and gear.", "¡PELIGRO MORTAL! Monstruos demasiado fuertes para tu nivel y equipo actual.")
      : "PERIGO MORTAL! Monstros muito fortes para seu nível e itens atuais.";
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
  const ui = S.scene.get("UI") || S;
  if (!ui || ui.__dlgOpen) return;

  S.__portalModalOpen = !0;
  S.uiOpen = !0;
  S.physics?.pause?.();
  S.player?.setVelocity?.(0, 0);

  // Som de aviso do portal
  try { S.audio?.play("sfx-room-enter") } catch(e) {}
  try { S.game.audioEngine?.tone?.({ type: "sine", freq: 330, duration: 0.15, gain: 0.08 }) } catch(e) {}

  const d = __calcPortalDifficulty(S, opts.levelId, opts);
  const F_SERIF = "Georgia, 'Times New Roman', serif";
  const F_MONO = "'Courier New', monospace";

  // Dimensões e posicionamento na tela 640x360
  const W = 400;
  const H = 250;
  const cx = Math.round(_ / 2);
  const cy = Math.round(st / 2);
  const x0 = cx - Math.round(W / 2);
  const y0 = cy - Math.round(H / 2);

  const R = ui.add.container(0, 0).setDepth(9950);

  // 1. Fundo escuro com bloqueio de toque/clique
  const dim = ui.add.rectangle(cx, cy, _ * 1.5, st * 1.5, 0x050403, 0.76).setInteractive();
  R.add(dim);

  // 2. Moldura e janela gótica
  const bg = ui.add.graphics();
  // Fundo do painel
  bg.fillStyle(0x0e0906, 0.97);
  bg.fillRoundedRect(x0, y0, W, H, 10);
  // Borda externa dourada
  bg.lineStyle(2, 0xc9a24a, 0.95);
  bg.strokeRoundedRect(x0, y0, W, H, 10);
  // Borda interna ornamental
  bg.lineStyle(1, 0x3d2c18, 0.85);
  bg.strokeRoundedRect(x0 + 4, y0 + 4, W - 8, H - 8, 8);
  R.add(bg);

  // Efeito de brilho de luz mística no topo
  try {
    const glow = ui.add.image(cx, y0 + 20, "light")
      .setScale(0.4)
      .setBlendMode(j.BlendModes.ADD)
      .setTint(0xc9a24a)
      .setAlpha(0.25);
    R.add(glow);
  } catch(e) {}

  // 3. Título principal
  const titleTxt = typeof __L3 === "function" 
    ? __L3("ATRAVESSAR PORTAL?", "ENTER PORTAL?", "¿CRUZAR PORTAL?")
    : "ATRAVESSAR PORTAL?";
  const t1 = ui.add.text(cx, y0 + 13, titleTxt, {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "13px",
    color: "#ffd24a",
    stroke: "#0a0604",
    strokeThickness: 3
  }).setOrigin(0.5, 0);

  const tSub = ui.add.text(cx, y0 + 30, `✦ ${d.destName.toUpperCase()} ✦`, {
    fontFamily: F_MONO,
    fontStyle: "bold",
    fontSize: "10.5px",
    color: "#f3e8c8",
    stroke: "#0a0604",
    strokeThickness: 2.5
  }).setOrigin(0.5, 0);
  R.add([t1, tSub]);

  // 4. Faixa de Dificuldade Calculada
  const badgeY = y0 + 48;
  const badgeW = 260;
  const badgeH = 22;
  const badgeBg = ui.add.graphics();
  badgeBg.fillStyle(0x1a120c, 0.95);
  badgeBg.fillRoundedRect(cx - badgeW / 2, badgeY, badgeW, badgeH, 5);
  badgeBg.lineStyle(1.5, d.diffBorder, 0.9);
  badgeBg.strokeRoundedRect(cx - badgeW / 2, badgeY, badgeW, badgeH, 5);
  R.add(badgeBg);

  const badgeTxt = typeof __L3 === "function"
    ? __L3(`DIFICULDADE: [ ${d.diffLabel} ]`, `DIFFICULTY: [ ${d.diffLabel} ]`, `DIFICULTAD: [ ${d.diffLabel} ]`)
    : `DIFICULDADE: [ ${d.diffLabel} ]`;
  const tBadge = ui.add.text(cx, badgeY + badgeH / 2, badgeTxt, {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "11px",
    color: d.diffColor,
    stroke: "#0a0604",
    strokeThickness: 3
  }).setOrigin(0.5, 0.5);
  R.add(tBadge);

  const recTxt = typeof __L3 === "function"
    ? __L3(`Nível Recomendado: Lvl ${d.recLvl}+   ·   Seu Herói: Lvl ${d.heroLvl}`, `Recommended Level: Lvl ${d.recLvl}+   ·   Your Hero: Lvl ${d.heroLvl}`, `Nivel Recomendado: Lvl ${d.recLvl}+   ·   Tu Héroe: Lvl ${d.heroLvl}`)
    : `Nível Recomendado: Lvl ${d.recLvl}+   ·   Seu Herói: Lvl ${d.heroLvl}`;
  const tRec = ui.add.text(cx, badgeY + badgeH + 4, recTxt, {
    fontFamily: F_MONO,
    fontStyle: "bold",
    fontSize: "8.5px",
    color: "#d1c7b7",
    stroke: "#0a0604",
    strokeThickness: 2
  }).setOrigin(0.5, 0);
  R.add(tRec);

  // 5. Comparativo em duas caixas (Herói & Itens vs Inimigos do Local)
  const boxY = y0 + 86;
  const boxW = 180;
  const boxH = 68;

  // Caixa Esquerda: Herói & Equipamentos
  const leftX = cx - Math.round(W / 2) + 14;
  const leftBg = ui.add.graphics();
  leftBg.fillStyle(0x140e0a, 0.88);
  leftBg.fillRoundedRect(leftX, boxY, boxW, boxH, 6);
  leftBg.lineStyle(1, 0x4a3721, 0.85);
  leftBg.strokeRoundedRect(leftX, boxY, boxW, boxH, 6);
  R.add(leftBg);

  const tHeroHdr = ui.add.text(leftX + 8, boxY + 6, typeof __L3 === "function" ? __L3("⚔ SEU HERÓI", "⚔ YOUR HERO", "⚔ TU HÉROE") : "⚔ SEU HERÓI", {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "9px",
    color: "#ffd24a"
  });
  const tHeroL1 = ui.add.text(leftX + 8, boxY + 20, `${typeof __L3 === "function" ? __L3("Força de Ataque", "Attack Power", "Fuerza de Ataque") : "Força de Ataque"}: ~${d.heroDmg} dano`, {
    fontFamily: F_MONO,
    fontSize: "7.5px",
    color: "#e8dcc0"
  });
  const tHeroL2 = ui.add.text(leftX + 8, boxY + 34, `${typeof __L3 === "function" ? __L3("Resistência", "Durability", "Resistencia") : "Resistência"}: ${d.heroMaxHp} HP · ${d.heroDef} Def`, {
    fontFamily: F_MONO,
    fontSize: "7.5px",
    color: "#86efac"
  });
  const tHeroL3 = ui.add.text(leftX + 8, boxY + 48, `${typeof __L3 === "function" ? __L3("Equipamentos", "Equipment", "Equipamiento") : "Equipamentos"}: ${d.eqCount} peças (Poder ${d.heroPwr})`, {
    fontFamily: F_MONO,
    fontSize: "7.5px",
    color: "#c9a24a"
  });
  R.add([tHeroHdr, tHeroL1, tHeroL2, tHeroL3]);

  // Caixa Direita: Inimigos do Local
  const rightX = cx + Math.round(W / 2) - boxW - 14;
  const rightBg = ui.add.graphics();
  rightBg.fillStyle(0x140e0a, 0.88);
  rightBg.fillRoundedRect(rightX, boxY, boxW, boxH, 6);
  rightBg.lineStyle(1, 0x4a3721, 0.85);
  rightBg.strokeRoundedRect(rightX, boxY, boxW, boxH, 6);
  R.add(rightBg);

  const tEnemyHdr = ui.add.text(rightX + 8, boxY + 6, typeof __L3 === "function" ? __L3("💀 INIMIGOS DO LOCAL", "💀 DUNGEON MONSTERS", "💀 MONSTRUOS DEL LUGAR") : "💀 INIMIGOS DO LOCAL", {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "9px",
    color: "#f87171"
  });
  const tEnemyL1 = ui.add.text(rightX + 8, boxY + 20, `${typeof __L3 === "function" ? __L3("Força Média", "Avg Strength", "Fuerza Media") : "Força Média"}: ~${d.avgEnemyDmg} dano`, {
    fontFamily: F_MONO,
    fontSize: "7.5px",
    color: "#e8dcc0"
  });
  const tEnemyL2 = ui.add.text(rightX + 8, boxY + 34, `${typeof __L3 === "function" ? __L3("Resistência", "Avg Resistance", "Resistencia Media") : "Resistência"}: ~${d.avgEnemyHp} HP base`, {
    fontFamily: F_MONO,
    fontSize: "7.5px",
    color: "#fca5a5"
  });
  const bossStr = d.bossName ? `${d.bossName} (~${d.bossHp} HP)` : (typeof __L3 === "function" ? __L3("Inimigos de Elite", "Elite Enemies", "Enemigos de Élite") : "Inimigos de Elite");
  const tEnemyL3 = ui.add.text(rightX + 8, boxY + 48, `${typeof __L3 === "function" ? __L3("Chefe", "Boss", "Jefe") : "Chefe"}: ${bossStr}`, {
    fontFamily: F_MONO,
    fontSize: "7.5px",
    color: "#fbbf24"
  });
  R.add([tEnemyHdr, tEnemyL1, tEnemyL2, tEnemyL3]);

  // 6. Texto explicativo / parecer do cálculo
  const tDesc = ui.add.text(cx, y0 + 160, d.diffDesc, {
    fontFamily: F_SERIF,
    fontSize: "8.5px",
    color: d.diffColor,
    align: "center",
    stroke: "#0a0604",
    strokeThickness: 2,
    wordWrap: { width: W - 32 }
  }).setOrigin(0.5, 0);

  const askTxt = typeof __L3 === "function"
    ? __L3("Tem certeza que deseja entrar?", "Are you sure you want to enter?", "¿Seguro que deseas entrar?")
    : "Tem certeza que deseja entrar?";
  const tAsk = ui.add.text(cx, y0 + 179, askTxt, {
    fontFamily: F_MONO,
    fontStyle: "bold",
    fontSize: "9px",
    color: "#ffffff",
    stroke: "#0a0604",
    strokeThickness: 2.5
  }).setOrigin(0.5, 0);
  R.add([tDesc, tAsk]);

  // 7. Botões Interativos: ENTRAR e CANCELAR
  const btnY = y0 + H - 28;
  const btnW = 146;
  const btnH = 26;

  // Fechamento e limpeza
  let closed = !1;
  const close = () => {
    if (closed) return;
    closed = !0;
    S.__portalModalOpen = !1;
    S.uiOpen = !1;
    ui.input.keyboard?.off("keydown", keyHandler);
    ui.events.off("update", padHandler);
    R.destroy();
    S.physics?.resume?.();
  };

  const confirmAction = () => {
    if (closed) return;
    closed = !0;
    S.__portalModalOpen = !1;
    ui.input.keyboard?.off("keydown", keyHandler);
    ui.events.off("update", padHandler);
    R.destroy();
    try { S.game.audioEngine?.tone?.({ type: "triangle", freq: 523, duration: 0.08, gain: 0.1 }) } catch(e) {}
    try { opts.onConfirm?.() } catch(e) { S.physics?.resume?.(); S.uiOpen = !1; }
  };

  // Botão 1: ENTRAR NO PORTAL
  const enterBtnX = cx - 82;
  const bEnterBg = ui.add.graphics();
  bEnterBg.fillStyle(0x163820, 0.95);
  bEnterBg.fillRoundedRect(enterBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
  bEnterBg.lineStyle(1.5, 0x4ade80, 0.95);
  bEnterBg.strokeRoundedRect(enterBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);

  const enterLabel = typeof __L3 === "function" ? __L3("✔ ENTRAR [ENTER]", "✔ ENTER [ENTER]", "✔ ENTRAR [ENTER]") : "✔ ENTRAR [ENTER]";
  const tEnter = ui.add.text(enterBtnX, btnY, enterLabel, {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "10px",
    color: "#86efac",
    stroke: "#0a0604",
    strokeThickness: 2.5
  }).setOrigin(0.5, 0.5);

  const enterZone = ui.add.zone(enterBtnX, btnY, btnW, btnH).setInteractive({ useHandCursor: !0 });
  enterZone.on("pointerover", () => {
    bEnterBg.clear();
    bEnterBg.fillStyle(0x235230, 1);
    bEnterBg.fillRoundedRect(enterBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
    bEnterBg.lineStyle(2, 0x86efac, 1);
    bEnterBg.strokeRoundedRect(enterBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
    tEnter.setColor("#ffffff");
  });
  enterZone.on("pointerout", () => {
    bEnterBg.clear();
    bEnterBg.fillStyle(0x163820, 0.95);
    bEnterBg.fillRoundedRect(enterBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
    bEnterBg.lineStyle(1.5, 0x4ade80, 0.95);
    bEnterBg.strokeRoundedRect(enterBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
    tEnter.setColor("#86efac");
  });
  enterZone.on("pointerdown", () => confirmAction());
  R.add([bEnterBg, tEnter, enterZone]);

  // Botão 2: CANCELAR
  const cancelBtnX = cx + 82;
  const bCancelBg = ui.add.graphics();
  bCancelBg.fillStyle(0x351411, 0.95);
  bCancelBg.fillRoundedRect(cancelBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
  bCancelBg.lineStyle(1.5, 0xef4444, 0.9);
  bCancelBg.strokeRoundedRect(cancelBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);

  const cancelLabel = typeof __L3 === "function" ? __L3("✖ CANCELAR [ESC]", "✖ CANCEL [ESC]", "✖ CANCELAR [ESC]") : "✖ CANCELAR [ESC]";
  const tCancel = ui.add.text(cancelBtnX, btnY, cancelLabel, {
    fontFamily: F_SERIF,
    fontStyle: "bold",
    fontSize: "10px",
    color: "#fca5a5",
    stroke: "#0a0604",
    strokeThickness: 2.5
  }).setOrigin(0.5, 0.5);

  const cancelZone = ui.add.zone(cancelBtnX, btnY, btnW, btnH).setInteractive({ useHandCursor: !0 });
  cancelZone.on("pointerover", () => {
    bCancelBg.clear();
    bCancelBg.fillStyle(0x4a1c18, 1);
    bCancelBg.fillRoundedRect(cancelBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
    bCancelBg.lineStyle(2, 0xfca5a5, 1);
    bCancelBg.strokeRoundedRect(cancelBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
    tCancel.setColor("#ffffff");
  });
  cancelZone.on("pointerout", () => {
    bCancelBg.clear();
    bCancelBg.fillStyle(0x351411, 0.95);
    bCancelBg.fillRoundedRect(cancelBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
    bCancelBg.lineStyle(1.5, 0xef4444, 0.9);
    bCancelBg.strokeRoundedRect(cancelBtnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 5);
    tCancel.setColor("#fca5a5");
  });
  cancelZone.on("pointerdown", () => close());
  R.add([bCancelBg, tCancel, cancelZone]);

  // Clique no fundo fora da janela fecha o modal
  dim.on("pointerdown", () => close());

  // Teclado
  const keyHandler = ev => {
    if (closed) return;
    const k = ev.key;
    if (["Enter", " ", "e", "E"].includes(k)) {
      ev.stopImmediatePropagation?.();
      confirmAction();
    } else if (["Escape", "Backspace", "q", "Q"].includes(k)) {
      ev.stopImmediatePropagation?.();
      close();
    }
  };
  ui.input.keyboard?.on("keydown", keyHandler);

  // Controle Gamepad
  let prevPadA = !0, prevPadB = !0;
  const padHandler = () => {
    if (closed) return;
    const g = navigator.getGamepads?.()?.find?.(p => p);
    if (!g) return;
    const btnA = !!g.buttons[0]?.pressed;
    const btnB = !!g.buttons[1]?.pressed;
    if (btnA && !prevPadA) confirmAction();
    else if (btnB && !prevPadB) close();
    prevPadA = btnA;
    prevPadB = btnB;
  };
  ui.events.on("update", padHandler);

  S.events.once("shutdown", close);
}
