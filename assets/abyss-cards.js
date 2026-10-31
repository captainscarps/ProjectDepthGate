// Cartas dos Pactos — Modo Infinito
// No altar do pacto o herói tira uma de 3 cartas viradas (Bênção, Pacto, Maldição ou, rara, Lendária).
// A mão guarda no máximo 6 cartas; com a mão cheia, a carta nova obriga a descartar uma.
// Substitui a escolha antiga de pactos (abyss-portals-and-pacts.js) mantendo a mesma interface
// (window.__openAbyssPactsModal, uiScene.__pactsUI.handleKey/close/open, window.__getAbyssPactModifiers).
// Arte: assets/pixel-art/cards (gerada por scripts/build_pact_cards.py). Fonte: assets/fonts (OFL).
(() => {
  const T = (pt, en, es) => {
    try { if (window.__L3G) return window.__L3G(pt, en, es ?? en); } catch (e) {}
    return pt;
  };
  const HAND_MAX = 6;
  const FONT = "NeoDunggeunmo, 'Courier New', monospace";
  const W = { l: 4, b: 25, p: 45, m: 26 };          // chance de cada tipo em cada uma das 3 cartas
  const TYPE = {
    b: { pt: "BÊNÇÃO", en: "BLESSING", color: "#7fe08a", hex: 0x7fe08a, glow: 0x4fd06a },
    p: { pt: "PACTO", en: "PACT", color: "#c9a0ff", hex: 0xc9a0ff, glow: 0x9a5cff },
    m: { pt: "MALDIÇÃO", en: "CURSE", color: "#ff6a5a", hex: 0xff6a5a, glow: 0xff3322 },
    l: { pt: "LENDÁRIA", en: "LEGENDARY", color: "#ffd24a", hex: 0xffd24a, glow: 0xffc040 }
  };

  // gain = o que ganha · cost = o que perde (mods somados pelo jogo; os de tempo rodam aqui)
  const CARDS = [
    { id: "b1", name: ["SANGUE FERVENTE", "BOILING BLOOD"], gain: ["+20% de dano", "+20% damage"], g: { damageMult: .2 } },
    { id: "b2", name: ["PELE DE BASALTO", "BASALT SKIN"], gain: ["+2 de defesa", "+2 defense"], g: { defenseAdd: 2 } },
    { id: "b3", name: ["PASSOS DE CINZA", "ASH STEPS"], gain: ["+12% de velocidade", "+12% speed"], g: { speedMult: .12 } },
    { id: "b4", name: ["MÃO LIGEIRA", "SWIFT HAND"], gain: ["Recarga das habilidades 15% mais rápida", "Skills recharge 15% faster"], g: { cooldownReduction: .15 } },
    { id: "b5", name: ["BOLSA DO ABISMO", "ABYSS SATCHEL"], gain: ["Poções curam +1 de vida", "Potions heal +1 HP"], g: { potionPower: 1 } },

    { id: "p6", name: ["MARCA MORTAL", "DEADLY MARK"], gain: ["+50% de dano crítico", "+50% critical damage"], cost: ["Poções curam -1 de vida", "Potions heal 1 less HP"], g: { critMultAdd: .5 }, c: { potionPower: -1 } },
    { id: "p7", name: ["PACTO DAS SOMBRAS", "SHADOW PACT"], gain: ["Ouro em dobro", "Double gold"], cost: ["Inimigos 25% mais rápidos", "Enemies 25% faster"], g: { goldMult: 1 }, c: { enemySpeedMult: 1.25 } },
    { id: "p8", name: ["CORAÇÃO DE VIDRO", "GLASS HEART"], gain: ["Dano em dobro", "Double damage"], cost: ["Metade da vida máxima", "Half max HP"], g: { damageMult: 1 }, c: { maxHpPct: -.5 } },
    { id: "p9", name: ["LÂMINA SÔFREGA", "HUNGRY BLADE"], gain: ["A cada 3 abates, cura 1 de vida", "Every 3 kills heals 1 HP"], cost: ["-1 de vida a cada 10s sem abater", "-1 HP every 10s without a kill"], g: { killHealEvery: 3 }, c: { hunger: 10 } },
    { id: "p10", name: ["MURALHA SANGRENTA", "BLOODY BULWARK"], gain: ["+4 de defesa", "+4 defense"], cost: ["-15% de velocidade", "-15% speed"], g: { defenseAdd: 4 }, c: { speedMult: -.15 } },
    { id: "p11", name: ["RITO DO ECLIPSE", "ECLIPSE RITE"], gain: ["Recarga 30% mais rápida", "Recharge 30% faster"], cost: ["-20% de vida máxima", "-20% max HP"], g: { cooldownReduction: .3 }, c: { maxHpPct: -.2 } },
    { id: "p12", name: ["FÚRIA CEGA", "BLIND FURY"], gain: ["+35% de dano", "+35% damage"], cost: ["-2 de defesa", "-2 defense"], g: { damageMult: .35 }, c: { defenseAdd: -2 } },

    { id: "m13", name: ["FRAQUEZA", "WEAKNESS"], cost: ["-15% de dano", "-15% damage"], c: { damageMult: -.15 } },
    { id: "m14", name: ["OSSOS DE VIDRO", "GLASS BONES"], cost: ["Recebe 25% a mais de dano", "Take 25% more damage"], c: { dmgTakenMult: 1.25 } },
    { id: "m15", name: ["CORRENTES", "CHAINS"], cost: ["-15% de velocidade", "-15% speed"], c: { speedMult: -.15 } },
    { id: "m16", name: ["SEDE ETERNA", "ENDLESS THIRST"], cost: ["Poções curam -2 de vida", "Potions heal 2 less HP"], c: { potionPower: -2 } },
    { id: "m17", name: ["HORDA FEROZ", "FEROCIOUS HORDE"], cost: ["Inimigos com 20% a mais de vida", "Enemies have 20% more HP"], c: { enemyHpMult: 1.2 } },
    { id: "m18", name: ["PESTE", "PLAGUE"], cost: ["-1 de vida a cada 20s", "-1 HP every 20s"], c: { plague: 20 } },
    { id: "m19", name: ["MENTE TURVA", "CLOUDED MIND"], cost: ["Recarga das habilidades 20% mais lenta", "Skills recharge 20% slower"], c: { cooldownReduction: -.2 } },
    { id: "m20", name: ["POBREZA", "POVERTY"], cost: ["-40% de ouro", "-40% gold"], c: { goldMult: -.4 } },

    { id: "l1", name: ["COROA DO ABISMO", "ABYSS CROWN"], gain: ["+40% de dano, +2 de defesa e +10% de velocidade", "+40% damage, +2 defense, +10% speed"], g: { damageMult: .4, defenseAdd: 2, speedMult: .1 } },
    { id: "l2", name: ["FÊNIX DE CINZAS", "ASHEN PHOENIX"], gain: ["Ao morrer, renasce com metade da vida (a carta queima)", "On death, revive with half HP (the card burns)"], g: { phoenix: 1 } },
    { id: "l3", name: ["OLHO DO VAZIO", "VOID EYE"], gain: ["Anula as maldições da sua mão", "Cancels the curses in your hand"], g: { voidEye: 1 } },
    { id: "l4", name: ["PACTO ETERNO", "ETERNAL PACT"], gain: ["Anula os custos dos pactos da sua mão", "Cancels the costs of the pacts in your hand"], g: { eternal: 1 } },
    { id: "l5", name: ["CORAÇÃO DO TITÃ", "TITAN HEART"], gain: ["+50% de vida máxima e +1 de vida a cada 15s", "+50% max HP and +1 HP every 15s"], g: { maxHpPct: .5, regen: 15 } }
  ];
  const BY = {};
  for (const c of CARDS) { c.type = c.id[0]; c.num = +c.id.slice(1); BY[c.id] = c; }
  window.__PACT_CARDS = CARDS;
  const OLD = { eye_of_doom: "p6", shadow_pact: "p7", glass_heart: "p8", vampiric_blade: "p9", bloody_bulwark: "p10" };
  const L = (arr) => (arr ? T(arr[0], arr[1], arr[1]) : "");

  // ───────────────────────── mão (guardada na run, vai junto no save) ─────────────────────────
  const isEndless = (s) => !!(s && (s.mode === "endless" || s.level?.endless || s.game?.registry?.get("mode") === "endless" || s.endlessRun?.()));
  function hand(scene) {
    const run = scene?.endlessRun?.();
    if (!run) return [];
    if (!Array.isArray(run.cards)) {
      const old = Array.isArray(run.pacts) ? run.pacts : (scene.game?.registry?.get("endless:activePacts") || []);
      run.cards = [...new Set(old.map((id) => OLD[id] || (BY[id] ? id : null)).filter(Boolean))].slice(0, HAND_MAX);
    }
    run.pacts = run.cards;
    return run.cards;
  }
  window.__getActivePacts = (scene) => hand(scene);
  window.__getCardHand = (scene) => hand(scene);

  function modifiers(scene) {
    const h = hand(scene);
    const voidEye = h.includes("l3"), eternal = h.includes("l4");
    const o = { damageMult: 0, defenseAdd: 0, critAdd: 0, critMultAdd: 0, speedMult: 0, goldMult: 0, potionPower: 0, cooldownReduction: 0,
      maxHpPct: 0, dmgTakenMult: 1, enemyHpMult: 1, enemySpeedMult: 1, killHealEvery: 0, hunger: 0, plague: 0, regen: 0, phoenix: 0 };
    const add = (m) => {
      for (const [k, v] of Object.entries(m || {})) {
        if (k === "dmgTakenMult" || k === "enemyHpMult" || k === "enemySpeedMult") o[k] *= v;
        else if (k === "killHealEvery" || k === "hunger" || k === "plague" || k === "regen") o[k] = o[k] ? Math.min(o[k], v) : v;
        else if (k in o) o[k] += v;
      }
    };
    for (const id of h) {
      const c = BY[id];
      if (!c) continue;
      add(c.g);
      if (c.type === "m" && voidEye) continue;
      if (c.type === "p" && eternal) continue;
      add(c.c);
    }
    const base = scene?.classDef?.baseStats?.maxHp ?? scene?.classDef?.stats?.maxHp ?? 6;
    o.maxHpAdd = o.maxHpPct ? Math.sign(o.maxHpPct) * Math.max(1, Math.round(base * Math.abs(o.maxHpPct))) : 0;
    return o;
  }
  window.__getAbyssPactModifiers = function (scene) {
    if (!isEndless(scene)) return {};
    try { attach(scene); } catch (e) {}
    return modifiers(scene);
  };

  // ───────────────────────── efeitos que correm com o tempo ─────────────────────────
  function attach(g) {
    if (!g || g.__cardsOn || !g.events || !g.game) return;
    g.__cardsOn = true;
    const st = { kills: 0, hunger: 0, plague: 0, regen: 0 };
    g.__cardSt = st;
    const onDied = (e) => {
      if (!g.sys?.isActive?.() || e === g.player) return;
      const fx = modifiers(g);
      st.hunger = 0;
      if (fx.killHealEvery && g.player && !g.player.dead) {
        if (++st.kills >= fx.killHealEvery) { st.kills = 0; g.player.hp < g.player.maxHp && g.player.heal?.(1); }
      }
    };
    const onUpdate = (t, dms) => tick(g, Math.min(.1, dms / 1000), st);
    g.events.on("update", onUpdate);
    g.game.events.on("enemy:died", onDied);
    g.events.once("shutdown", () => {
      g.events.off("update", onUpdate);
      g.game.events.off("enemy:died", onDied);
      g.__cardsOn = false;
      const ui = g.scene?.get?.("UI");
      ui?.__cardHud?.setVisible(false);
    });
  }

  function drain(g, label) {
    const p = g.player;
    if (!p || p.dead || p.hp <= 1) return;
    p.hp = Math.max(1, p.hp - 1);
    g.game.events.emit("hud:hp", p.hp, p.maxHp);
    g.playerVisual?.flashHurt?.();
    g.effects?.floatText?.(p.x, p.y - 20, "-1", label);
  }

  function wrapPlayer(g) {
    const p = g.player;
    if (!p || p.__cardWrap) return;
    p.__cardWrap = true;
    const td = p.takeDamage, die = p.die;
    p.takeDamage = function (i, t) {
      if (i > 0 && isEndless(g)) { const m = modifiers(g).dmgTakenMult; if (m !== 1) i *= m; }
      return td.call(this, i, t);
    };
    p.die = function () {
      const h = isEndless(g) ? hand(g) : [];
      const k = h.indexOf("l2");
      if (k >= 0 && !this.dead) {
        h.splice(k, 1);
        g.stats?.recompute?.();
        this.hp = Math.max(1, Math.ceil(this.maxHp * .5));
        this.invuln = Math.max(this.invuln || 0, 2.2);
        g.game.events.emit("hud:hp", this.hp, this.maxHp);
        g.effects?.burstTinted?.(this.x, this.y - 8, 0xff9a3a, 26);
        g.effects?.shockwaveRing?.(this.x, this.y, 30);
        g.cameras?.main?.flash?.(260, 255, 170, 80);
        g.game.audioEngine?.sfx?.("sfx-event-accept");
        g.game.events.emit("ui:banner", T("A FÊNIX DE CINZAS TE TROUXE DE VOLTA!", "THE ASHEN PHOENIX BROUGHT YOU BACK!"), "#ffb04a");
        g.game.events.emit("cards:changed");
        g.requestSave?.(200);
        return;
      }
      return die.call(this);
    };
  }

  function tick(g, dt, st) {
    if (!isEndless(g)) return;
    wrapPlayer(g);
    hud(g);
    if (g.state !== "playing" || g.uiOpen || g.time?.paused || !g.player || g.player.dead) return;
    const fx = modifiers(g);
    if (fx.hunger) { st.hunger += dt; if (st.hunger >= fx.hunger) { st.hunger = 0; drain(g, "#c04040"); } } else st.hunger = 0;
    if (fx.plague) { st.plague += dt; if (st.plague >= fx.plague) { st.plague = 0; drain(g, "#7ac040"); } }
    if (fx.regen) {
      st.regen += dt;
      if (st.regen >= fx.regen) { st.regen = 0; g.player.hp < g.player.maxHp && g.player.heal?.(1); }
    }
    const list = g.enemies?.getChildren?.() || [];
    for (const e of list) {
      if (e.__cardMod || e.dead || !e.maxHp) continue;
      e.__cardMod = 1;
      if (fx.enemyHpMult !== 1) { const r = e.hp / e.maxHp; e.maxHp = Math.max(1, Math.round(e.maxHp * fx.enemyHpMult)); e.hp = Math.max(1, Math.round(e.maxHp * r)); }
      if (fx.enemySpeedMult !== 1 && e.speed) e.speed *= fx.enemySpeedMult;
    }
  }

  // ───────────────────────── utilidades de tela ─────────────────────────
  function view(scene) {
    let w = 640;
    try { if (window._) w = window._; else if (scene?.scale?.width) w = scene.scale.width > 700 ? Math.round(scene.scale.width / 2) : scene.scale.width; } catch (e) {}
    return { w, h: 360, cx: Math.round(w / 2), cy: 180 };
  }
  const KEYS = () => ["pc-back", "pc-fx", "pc-pack", "pc-pack-open", "pc-pack-rare", "pc-pack-rare-open", ...CARDS.map((c) => "pc-card-" + c.id)];
  const FILE = (k) => "assets/pixel-art/cards/" + ({ "pc-back": "card-back", "pc-fx": "card-fx" }[k] || k.replace(/^pc-/, "")) + ".png";
  function ensureTextures(ui, cb) {
    if (!ui.textures.exists("pc-dot")) {
      const gr = ui.make.graphics({ x: 0, y: 0, add: false });
      gr.fillStyle(0xffffff, 1).fillCircle(3, 3, 3);
      gr.generateTexture("pc-dot", 6, 6);
      gr.destroy();
    }
    const fontP = document.fonts?.load ? document.fonts.load("12px NeoDunggeunmo").catch(() => {}) : Promise.resolve();
    const ld = ui.load;
    const miss = KEYS().filter((k) => !ui.textures.exists(k));
    if (miss.length && !ld.isLoading()) {
      const op = ld.path;
      ld.setPath("");
      miss.forEach((k) => ld.image(k, FILE(k)));
      ld.setPath(op);
      ld.start();
    }
    const t0 = performance.now();
    const wait = () => {
      if (KEYS().every((k) => ui.textures.exists(k)) || performance.now() - t0 > 12000) fontP.then(() => cb(), () => cb());
      else {
        if (!ld.isLoading()) { const m = KEYS().filter((k) => !ui.textures.exists(k)); const op = ld.path; ld.setPath(""); m.forEach((k) => ld.image(k, FILE(k))); ld.setPath(op); ld.start(); }
        setTimeout(wait, 80);
      }
    };
    wait();
  }
  const sfx = (ui, k) => { try { ui.game.audioEngine?.sfx?.(k); } catch (e) {} };
  const haptic = (a, b) => { try { window.__triggerHaptic?.(a, b); } catch (e) {} };

  function burst(ui, parent, x, y, color, n, o = {}) {
    for (let i = 0; i < n; i++) {
      const d = ui.add.image(x, y, "pc-dot").setTint(color).setScale((o.size || 1) * (.4 + Math.random() * .6)).setBlendMode(o.add === false ? 0 : 1);
      parent.add(d);
      const a = o.up ? -Math.PI / 2 + (Math.random() - .5) * (o.spread ?? 1.4) : Math.random() * Math.PI * 2;
      const r = (o.dist || 60) * (.4 + Math.random() * .8);
      ui.tweens.add({ targets: d, x: x + Math.cos(a) * r, y: y + Math.sin(a) * r - (o.rise || 0), alpha: 0, scale: .1,
        duration: (o.dur || 700) * (.6 + Math.random() * .6), ease: "Cubic.easeOut", onComplete: () => d.destroy() });
    }
  }

  // carta: outer (posição, escala, seleção) › inner (flutua e vira)
  function makeCard(ui, id, S) {
    const def = BY[id];
    const outer = ui.add.container(0, 0);
    const halo = ui.add.image(0, 0, "light").setBlendMode(1).setScale(1.25, 1.6).setAlpha(0).setTint(0xb07aff);
    const inner = ui.add.container(0, 0);
    outer.add([halo, inner]);
    const glow = def.type === "l" ? ui.add.image(0, 2, "pc-fx").setScale(.95, .92) : null;
    const back = ui.add.image(0, 0, "pc-back");
    const front = ui.add.image(0, 0, "pc-card-" + id);
    const title = ui.add.text(0, 24, L(def.name), { fontFamily: FONT, fontSize: "10px", color: "#ffffff", stroke: "#1a1010", strokeThickness: 2 }).setOrigin(.5);
    const parts = [front, title];
    const box = { fontFamily: FONT, fontSize: "10px", align: "center", wordWrap: { width: 100 }, lineSpacing: -1 };
    if (def.type === "p") {
      const g1 = ui.add.text(0, 0, "▲ " + L(def.gain), { ...box, color: "#1e6e28" }).setOrigin(.5, 0);
      const g2 = ui.add.text(0, 0, "▼ " + L(def.cost), { ...box, color: "#a01e1e" }).setOrigin(.5, 0);
      const tot = g1.height + g2.height + 5;
      g1.y = 74 - tot / 2;
      const sep = ui.add.rectangle(0, g1.y + g1.height + 2, 70, 1, 0xa88c6a);
      g2.y = g1.y + g1.height + 5;
      parts.push(g1, sep, g2);
    } else {
      const t = ui.add.text(0, 74, L(def.gain || def.cost), { ...box, color: def.type === "m" ? "#8a1e1e" : "#3c281e" }).setOrigin(.5);
      parts.push(t);
    }
    if (glow) parts.unshift(glow);
    inner.add([back, ...parts]);
    const hit = ui.add.zone(0, 0, 156, 236).setInteractive({ useHandCursor: true });
    inner.add(hit);
    if (glow) ui.tweens.add({ targets: glow, alpha: .45, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    outer.setScale(S);
    Object.assign(outer, { def, inner, halo, back, parts, hit, S, face: false, id });
    setFace(outer, false);
    return outer;
  }
  function setFace(c, up) { c.back.setVisible(!up); c.parts.forEach((o) => o.setVisible(up)); c.face = up; }
  function flip(ui, c, up, mid, done) {
    ui.tweens.killTweensOf(c.inner);
    ui.tweens.add({ targets: c.inner, scaleX: 0, duration: 130, ease: "Sine.easeIn", onComplete: () => {
      setFace(c, up); mid && mid();
      ui.tweens.add({ targets: c.inner, scaleX: 1, duration: 190, ease: "Back.easeOut", onComplete: () => done && done() });
      ui.tweens.add({ targets: c.inner, y: -8, duration: 120, yoyo: true, ease: "Quad.easeOut" });
    } });
  }

  // ───────────────────────── mão no canto da tela ─────────────────────────
  function hud(g) {
    const ui = g.scene?.get?.("UI");
    if (!ui || !ui.sys?.isActive?.() || !ui.add) return;
    if (!ui.__cardHud) {
      if (!KEYS().every((k) => ui.textures.exists(k))) { if (!ui.__cardLoading) { ui.__cardLoading = true; ensureTextures(ui, () => { ui.__cardLoading = false; }); } return; }
      ui.__cardHud = ui.add.container(0, 0).setDepth(95);
      ui.__cardHud.__sig = "";
    }
    const box = ui.__cardHud, h = hand(g);
    const busy = ui.__pactsUI?.open;
    box.setVisible(h.length > 0 && !busy);
    const { cx } = view(ui);
    box.setPosition(cx, ui.bossBar?.visible ? 44 : 4);
    const sig = h.join(",");
    if (sig === box.__sig) return;
    box.__sig = sig;
    box.removeAll(true);
    const sw = 25, gap = 4, x0 = -((HAND_MAX * sw + (HAND_MAX - 1) * gap) / 2) + sw / 2;
    const bg = ui.add.rectangle(0, 20, HAND_MAX * sw + (HAND_MAX - 1) * gap + 10, 44, 0x0a0608, .55).setStrokeStyle(1, 0x5a4030, .8)
      .setInteractive({ useHandCursor: true }).on("pointerdown", () => openViewer(ui));
    box.add(bg);
    for (let i = 0; i < HAND_MAX; i++) {
      const x = x0 + i * (sw + gap), id = h[i];
      if (!id) { box.add(ui.add.rectangle(x, 20, sw - 3, 36, 0x000000, .35).setStrokeStyle(1, 0x3a2a22, .9)); continue; }
      if (BY[id].type === "l") {
        const gl = ui.add.image(x, 21, "pc-fx").setScale(.155, .15);
        box.add(gl);
        ui.tweens.add({ targets: gl, alpha: .4, duration: 900, yoyo: true, repeat: -1 });
      }
      box.add(ui.add.image(x, 20, "pc-card-" + id).setScale(.16));
    }
  }
  function openViewer(ui) {
    const g = ui.scene.get("Game");
    if (!g || !hand(g).length) return;
    const pui = getUI(ui);
    if (pui.open) return;
    pui.showViewer();
  }

  // ───────────────────────── tela das cartas ─────────────────────────
  class CardPactsUI {
    constructor(ui) { this.ui = ui; this.open = false; this.phase = "idle"; this.sel = 0; }

    pauseGame(on) {
      const g = this.ui.scene.get("Game");
      if (!g) return;
      if (on) {
        this.__paused = !g.uiOpen;
        g.uiOpen = true; g.time.paused = true; g.tweens?.pauseAll?.();
      } else if (this.__paused && !this.cb) {
        g.uiOpen = false; g.time.paused = false; g.tweens?.resumeAll?.();
      }
      this.ui.game.events.emit("ui:inventory", !!on);
    }

    base() {
      const ui = this.ui, { w, cx } = view(ui);
      this.root?.destroy(true);
      this.root = ui.add.container(0, 0).setDepth(930);
      this.dim = ui.add.rectangle(cx, 180, Math.max(w * 4, 3840), 2160, 0x07040a, 0).setInteractive();
      this.root.add(this.dim);
      ui.tweens.add({ targets: this.dim, fillAlpha: .93, duration: 260 });
      this.title = ui.add.text(cx, 24, "", { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "17px", color: "#e05a4a", fontStyle: "bold", stroke: "#0a0806", strokeThickness: 3 }).setOrigin(.5);
      this.sub = ui.add.text(cx, 45, "", { fontFamily: FONT, fontSize: "11px", color: "#d8c0a8" }).setOrigin(.5);
      this.foot = ui.add.text(cx, 343, "", { fontFamily: FONT, fontSize: "10px", color: "#c9a24a", stroke: "#0a0806", strokeThickness: 2 }).setOrigin(.5);
      this.root.add([this.title, this.sub, this.foot]);
    }

    // —— altar: 3 cartas viradas ——
    show() {
      if (this.open) return;
      this.open = true;
      this.phase = "load";
      this.openedAt = performance.now();
      const ui = this.ui, g = ui.scene.get("Game");
      this.pauseGame(true);
      const h = hand(g);
      this.offer = (Array.isArray(window.__forcePactOffer) && window.__forcePactOffer.length === 3) ? window.__forcePactOffer : roll(h);
      ensureTextures(ui, () => this.intro());
    }

    intro() {
      const ui = this.ui, { cx } = view(ui);
      this.base();
      this.title.setText(T("PACTO DAS PROFUNDEZAS", "PACT OF THE DEPTHS"));
      this.sub.setText(T("Escolha uma carta às cegas", "Pick a card blindly") + "   ·   " + T("Mão", "Hand") + ` ${hand(ui.scene.get("Game")).length}/${HAND_MAX}`);
      this.title.setAlpha(0); this.sub.setAlpha(0);
      ui.tweens.add({ targets: [this.title, this.sub], alpha: 1, duration: 400, delay: 150 });
      const rare = this.offer.some((id) => BY[id].type === "l");
      const pk = rare ? "pc-pack-rare" : "pc-pack";
      const pack = ui.add.image(cx, -140, pk).setScale(.5);
      this.root.add(pack);
      let aura = null;
      if (rare) {
        aura = ui.add.image(cx, 186, "light").setBlendMode(1).setTint(0xffc040).setScale(1.3).setAlpha(0);
        this.root.addAt(aura, 1);
        ui.tweens.add({ targets: aura, alpha: .4, duration: 500, yoyo: true, repeat: -1 });
      }
      sfx(ui, "sfx-door-open");
      ui.tweens.chain({ targets: pack, tweens: [
        { y: 186, duration: 520, ease: "Bounce.easeOut" },
        { x: cx - 4, duration: 60, yoyo: true, repeat: 2, ease: "Sine.easeInOut", onStart: () => haptic(60, .4) },
        { x: cx + 4, duration: 60, yoyo: true, repeat: 1, ease: "Sine.easeInOut" },
        { scale: .56, duration: 120, ease: "Quad.easeOut", onComplete: () => {
          pack.setTexture(pk + "-open").setX(cx);
          ui.cameras.main.flash(160, 255, 235, 200);
          burst(ui, this.root, cx, 150, rare ? 0xffd060 : 0xd8a070, rare ? 30 : 16, { up: true, dist: 90, rise: 20 });
          sfx(ui, "sfx-event-accept");
          this.deal(pack, aura);
        } }
      ] });
    }

    deal(pack, aura) {
      const ui = this.ui, { cx } = view(ui);
      const S = .86;
      this.cards = this.offer.map((id, k) => {
        const c = makeCard(ui, id, S);
        c.setPosition(cx, 150).setAlpha(0).setScale(S * .3);
        this.root.add(c);
        const tx = cx + (k - 1) * 150;
        ui.tweens.add({ targets: c, x: tx, y: 188, scale: S, alpha: 1, delay: 120 + k * 120, duration: 480, ease: "Back.easeOut",
          onStart: () => sfx(ui, "sfx-mana-use"),
          onComplete: () => {
            ui.tweens.add({ targets: c.inner, y: -3, duration: 1300 + k * 120, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
            if (k === this.offer.length - 1) this.choose();
          } });
        c.hit.on("pointerover", () => this.phase === "choose" && this.select(k));
        c.hit.on("pointerdown", () => { if (this.phase === "choose") { this.select(k); this.reveal(k); } else if (this.phase === "revealed") this.next(); });
        return c;
      });
      ui.tweens.add({ targets: pack, y: 330, alpha: 0, scale: .4, delay: 300, duration: 500, ease: "Quad.easeIn", onComplete: () => pack.destroy() });
      aura && ui.tweens.add({ targets: aura, alpha: 0, delay: 300, duration: 500, onComplete: () => aura.destroy() });
    }

    choose() {
      this.phase = "choose";
      this.select(1);
      this.foot.setText(T("◀ ▶ escolher   ·   Enter / toque: virar a carta", "◀ ▶ choose   ·   Enter / tap: flip the card"));
    }

    select(k) {
      const ui = this.ui;
      this.sel = k;
      (this.cards || []).forEach((c, i) => {
        const on = i === k;
        ui.tweens.add({ targets: c, scale: c.S * (on ? 1.07 : 1), y: on ? 178 : 188, duration: 160, ease: "Quad.easeOut" });
        ui.tweens.add({ targets: c.halo, alpha: on ? .4 : 0, duration: 160 });
      });
      haptic(20, .15);
    }

    reveal(k) {
      if (this.phase !== "choose") return;
      this.phase = "reveal";
      const ui = this.ui, c = this.cards[k], t = c.def.type, { cx } = view(ui);
      this.chosen = c;
      this.foot.setText("");
      ui.tweens.add({ targets: c.halo, alpha: 0, duration: 120 });
      flip(ui, c, true, () => {
        const col = TYPE[t].glow;
        if (t === "b") {
          burst(ui, this.root, c.x, c.y, 0x9cff9a, 22, { up: true, dist: 110, rise: 30 });
          burst(ui, this.root, c.x, c.y, 0xffe08a, 14, { dist: 70 });
          sfx(ui, "sfx-event-accept"); haptic(120, .5);
        } else if (t === "p") {
          const ring = ui.add.circle(c.x, c.y, 30, col, 0).setStrokeStyle(3, col, .9);
          this.root.add(ring);
          ui.tweens.add({ targets: ring, scale: 4, alpha: 0, duration: 650, ease: "Cubic.easeOut", onComplete: () => ring.destroy() });
          burst(ui, this.root, c.x, c.y, 0xb080ff, 20, { dist: 90 });
          sfx(ui, "sfx-mana-use"); haptic(140, .6);
        } else if (t === "m") {
          ui.cameras.main.shake(260, .012);
          const red = ui.add.rectangle(cx, 180, 3840, 2160, 0xa00000, .38);
          this.root.add(red);
          ui.tweens.add({ targets: red, alpha: 0, duration: 700, onComplete: () => red.destroy() });
          burst(ui, this.root, c.x, c.y, 0x401010, 18, { dist: 80, add: false, size: 1.4 });
          burst(ui, this.root, c.x, c.y, 0xff4020, 10, { up: true, dist: 70 });
          sfx(ui, "sfx-boss-spawn"); haptic(260, 1);
        } else {
          ui.cameras.main.flash(380, 255, 220, 140);
          ui.cameras.main.shake(180, .006);
          burst(ui, this.root, c.x, c.y, 0xffd24a, 40, { dist: 150 });
          burst(ui, this.root, c.x, c.y, 0xffffff, 18, { up: true, dist: 120, rise: 40 });
          sfx(ui, "sfx-boss-spawn"); sfx(ui, "sfx-event-accept"); haptic(300, 1);
        }
        const tag = ui.add.text(c.x, c.y + 110, T(TYPE[t].pt, TYPE[t].en) + (t === "l" ? "!" : ""), { fontFamily: FONT, fontSize: "14px", color: TYPE[t].color, stroke: "#0a0606", strokeThickness: 3 }).setOrigin(.5).setScale(.2);
        this.root.add(tag);
        this.tag = tag;
        ui.tweens.add({ targets: tag, scale: 1, duration: 300, ease: "Back.easeOut" });
      }, () => {
        // as outras viram também, apagadas: o que você deixou passar
        this.cards.forEach((o, i) => {
          if (i === k) return;
          ui.time.delayedCall(260 + Math.abs(i - k) * 140, () => flip(ui, o, true, () => { o.inner.list.forEach((p) => p.setTint?.(0x777777)); }, () => {
            ui.tweens.add({ targets: o, alpha: .55, scale: o.S * .92, y: 196, duration: 200 });
          }));
        });
        ui.time.delayedCall(700, () => {
          this.phase = "revealed";
          this.foot.setText(T("Enter / toque: continuar", "Enter / tap: continue"));
        });
      });
    }

    next() {
      if (this.phase !== "revealed") return;
      const g = this.ui.scene.get("Game");
      if (hand(g).length < HAND_MAX) this.toHand(-1);
      else this.replace();
    }

    // —— carta vai para a mão (no canto de cima) ——
    toHand(slot) {
      this.phase = "fly";
      const ui = this.ui, g = ui.scene.get("Game"), c = this.chosen, { cx } = view(ui);
      const h = hand(g);
      const idx = slot >= 0 ? slot : h.length;
      const sw = 25, gap = 4, x0 = -((HAND_MAX * sw + (HAND_MAX - 1) * gap) / 2) + sw / 2;
      const tx = cx + x0 + idx * (sw + gap), ty = (ui.bossBar?.visible ? 44 : 4) + 20;
      this.foot.setText(""); this.tag?.destroy();
      (this.cards || []).forEach((o) => { if (o !== c) ui.tweens.add({ targets: o, y: o.y + 60, alpha: 0, duration: 300, ease: "Quad.easeIn" }); });
      (this.handCards || []).forEach((o) => ui.tweens.add({ targets: o, y: o.y + 80, alpha: 0, duration: 300, ease: "Quad.easeIn" }));
      ui.tweens.killTweensOf(c.inner);
      ui.tweens.add({ targets: c.inner, y: 0, duration: 100 });
      ui.tweens.add({ targets: [this.title, this.sub], alpha: 0, duration: 250 });
      ui.tweens.add({ targets: this.dim, fillAlpha: 0, delay: 250, duration: 350 });
      ui.tweens.add({ targets: c, x: tx, y: ty, scale: .16, duration: 620, delay: 120, ease: "Cubic.easeInOut",
        onComplete: () => {
          burst(ui, this.root, tx, ty, TYPE[c.def.type].glow, 12, { dist: 30 });
          if (slot >= 0) h[slot] = c.id; else h.push(c.id);
          this.apply(c.def);
          ui.time.delayedCall(180, () => this.finish(c.def));
        } });
    }

    // —— mão cheia: escolhe qual carta sai ——
    replace() {
      this.phase = "replace";
      const ui = this.ui, g = ui.scene.get("Game"), c = this.chosen, { cx } = view(ui);
      const h = hand(g);
      this.tag?.destroy();
      this.cards.forEach((o) => { if (o !== c) ui.tweens.add({ targets: o, y: o.y - 40, alpha: 0, duration: 260, onComplete: () => o.setVisible(false) }); });
      ui.tweens.killTweensOf(c.inner);
      c.inner.y = 0;
      ui.tweens.add({ targets: c, x: cx, y: 128, scale: .6, duration: 420, ease: "Cubic.easeOut" });
      ui.tweens.add({ targets: c.inner, y: -2, duration: 1200, yoyo: true, repeat: -1, ease: "Sine.easeInOut", delay: 420 });
      this.title.setText(T("MÃO CHEIA", "HAND FULL"));
      this.sub.setText(T("Escolha uma carta da sua mão para dar lugar à nova", "Choose a card from your hand to make room for the new one"));
      const newTag = ui.add.text(cx, 58, T("NOVA CARTA", "NEW CARD"), { fontFamily: FONT, fontSize: "10px", color: "#ffd24a" }).setOrigin(.5);
      this.root.add(newTag);
      this.newTag = newTag;
      const S = .5, n = h.length, step = 84;
      this.handCards = h.map((id, i) => {
        const o = makeCard(ui, id, S);
        setFace(o, true);
        const tx = cx + (i - (n - 1) / 2) * step, ang = 0, /* sem girar: containers girados quebram o desenho */ ty = 286 + Math.abs(i - (n - 1) / 2) * 3;
        o.home = { x: tx, y: ty, a: ang };
        o.setPosition(cx, 420);
        this.root.add(o);
        ui.tweens.add({ targets: o, x: tx, y: ty, duration: 420, delay: 200 + i * 70, ease: "Back.easeOut", onComplete: () => { if (i === n - 1) this.pick(0); } });
        o.hit.on("pointerover", () => this.phase === "pick" && this.pick(i));
        o.hit.on("pointerdown", () => { if (this.phase === "pick") { this.pick(i); this.discard(i); } });
        return o;
      });
      this.foot.setText(T("◀ ▶ escolher   ·   Enter / toque: descartar", "◀ ▶ choose   ·   Enter / tap: discard"));
    }

    pick(i) {
      if (!this.handCards) return;
      this.phase = "pick";
      this.hsel = i;
      const ui = this.ui;
      this.handCards.forEach((o, k) => {
        const on = k === i;
        o.setDepth?.(on ? 2 : 1);
        ui.tweens.add({ targets: o, y: o.home.y - (on ? 34 : 0), scale: o.S * (on ? 1.3 : 1), duration: 150, ease: "Quad.easeOut" });
        ui.tweens.add({ targets: o.halo, alpha: on ? .35 : 0, duration: 150 });
        o.halo.setTint(0xff5040).setScale(1.3, 1.7);
      });
      const top = this.handCards[i];
      this.root.bringToTop(top);
      haptic(20, .15);
    }

    discard(i) {
      if (this.phase !== "pick") return;
      this.phase = "burn";
      const ui = this.ui, o = this.handCards[i];
      this.foot.setText("");
      o.inner.list.forEach((p) => p.setTint?.(0xff6a3a));
      sfx(ui, "sfx-boss-spawn");
      haptic(160, .7);
      ui.tweens.add({ targets: o, x: o.x + 2, duration: 40, yoyo: true, repeat: 4 });
      ui.time.delayedCall(220, () => {
        burst(ui, this.root, o.x, o.y, 0xff7a2a, 26, { up: true, dist: 90, rise: 30 });
        burst(ui, this.root, o.x, o.y, 0x2a1a14, 14, { up: true, dist: 70, add: false });
        ui.tweens.add({ targets: o, scaleY: 0, scaleX: o.scaleX * 1.2, alpha: 0, y: o.y - 20, duration: 480, ease: "Quad.easeIn", onComplete: () => {
          o.destroy();
          this.handCards.splice(i, 1);
          this.newTag?.destroy();
          this.toHand(i);
        } });
      });
    }

    apply(def) {
      const ui = this.ui, g = ui.scene.get("Game");
      if (!g) return;
      const er = g.endlessRun?.();
      if (er) er.pathResolved = true;
      g.stats?.recompute?.();
      if (g.player && g.player.hp > g.player.maxHp) g.player.hp = g.player.maxHp;
      g.game.events.emit("hud:hp", g.player?.hp, g.player?.maxHp);
      ui.game.events.emit("ui:banner", `${T(TYPE[def.type].pt, TYPE[def.type].en)}: ${L(def.name)}`, TYPE[def.type].color);
      ui.game.events.emit("cards:changed");
      g.requestSave?.(200);
    }

    finish(def) {
      const ui = this.ui;
      this.phase = "idle";
      this.open = false;
      this.root?.destroy(true);
      this.root = null; this.cards = null; this.handCards = null;
      this.pauseGame(false);
      const cb = this.cb;
      this.cb = null;
      if (typeof cb === "function") cb(def);
    }

    // —— ver a mão (toque na mão do canto) ——
    showViewer() {
      const ui = this.ui, g = ui.scene.get("Game"), h = hand(g);
      if (!h.length) return;
      this.open = true;
      this.phase = "viewer";
      this.openedAt = performance.now();
      this.pauseGame(true);
      this.base();
      const { cx } = view(ui);
      this.title.setText(T("SUA MÃO", "YOUR HAND")).setColor("#c9a24a").setY(18);
      this.sub.setText("").setVisible(false);
      this.foot.setText(T("Toque / Esc: voltar", "Tap / Esc: back")).setY(350);
      this.dim.on("pointerdown", () => this.closeViewer());
      this.handCards = h.map((id, i) => {
        const o = makeCard(ui, id, .58);
        setFace(o, true);
        const col = i % 3, row = Math.floor(i / 3);
        const tx = cx + (col - 1) * 104, ty = 104 + row * 146;
        o.setPosition(tx, ty + 30).setAlpha(0);
        this.root.add(o);
        ui.tweens.add({ targets: o, y: ty, alpha: 1, duration: 260, delay: i * 50, ease: "Back.easeOut" });
        o.hit.on("pointerdown", () => this.closeViewer());
        return o;
      });
    }

    closeViewer() {
      if (this.phase !== "viewer") return;
      this.cb = null;
      this.finish(null);
    }

    close() {
      // usado pelo jogo ao sair da tela; durante a escolha a carta não pode ser recusada
      if (this.phase === "viewer") return this.closeViewer();
      if (!this.open) return;
      if (this.phase === "load" || this.phase === "idle") { this.open = false; this.root?.destroy(true); this.root = null; this.pauseGame(false); }
    }

    handleKey(key) {
      if (!this.open) return false;
      if (performance.now() - (this.openedAt || 0) < 200) return true;
      const left = ["ArrowLeft", "a", "A", "Left", "LEFT"].includes(key);
      const right = ["ArrowRight", "d", "D", "Right", "RIGHT"].includes(key);
      const ok = ["Enter", " ", "Space", "CONFIRM", "z", "Z", "e", "E"].includes(key);
      const esc = ["Escape", "b", "B", "CANCEL", "x", "X"].includes(key);
      if (this.phase === "viewer") { if (ok || esc) this.closeViewer(); return true; }
      if (this.phase === "choose") {
        if (left && this.sel > 0) this.select(this.sel - 1);
        else if (right && this.sel < this.cards.length - 1) this.select(this.sel + 1);
        else if (ok) this.reveal(this.sel);
        return true;
      }
      if (this.phase === "revealed") { if (ok) this.next(); return true; }
      if (this.phase === "pick") {
        if (left && this.hsel > 0) this.pick(this.hsel - 1);
        else if (right && this.hsel < this.handCards.length - 1) this.pick(this.hsel + 1);
        else if (ok) this.discard(this.hsel);
        return true;
      }
      return true;
    }
  }

  function roll(h) {
    const out = [];
    for (let k = 0; k < 3; k++) {
      const pool = CARDS.filter((c) => !h.includes(c.id) && !out.includes(c.id));
      const types = Object.keys(W).filter((t) => pool.some((c) => c.type === t));
      if (!types.length) break;
      let r = Math.random() * types.reduce((s, t) => s + W[t], 0), t = types[0];
      for (const x of types) { if ((r -= W[x]) < 0) { t = x; break; } }
      const opts = pool.filter((c) => c.type === t);
      out.push(opts[Math.floor(Math.random() * opts.length)].id);
    }
    return out;
  }
  window.__rollPactCards = roll;

  function getUI(ui) {
    if (!(ui.__pactsUI instanceof CardPactsUI)) ui.__pactsUI = new CardPactsUI(ui);
    return ui.__pactsUI;
  }
  window.CardPactsUI = CardPactsUI;
  window.__openCardHand = (ui) => openViewer(ui);
  window.__openAbyssPactsModal = function (uiScene, onAccepted) {
    if (!uiScene) return;
    const p = getUI(uiScene);
    if (p.open) return;
    p.cb = onAccepted || null;
    p.show();
  };
})();
