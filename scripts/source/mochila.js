/* ══ Mochila no Refúgio ══
   O inventário da run depende da cena da partida; no Refúgio esta tela lê e grava o MESMO save (campanha do slot ou
   herói do Modo Infinito): à esquerda o que o herói veste, à direita a mochila (grade de 20), embaixo os detalhes da
   peça e EQUIPAR / DESEQUIPAR — com as mesmas regras do jogo (classe que pode usar, mão secundária das adagas,
   dois acessórios, mochila cheia). O herói na vila troca de visual na hora.
   Abre por: botão 🎒 MOCHILA (ao lado do START), "Mochila" no menu Start, tecla I e Select do controle.
   Controle: direcional anda pela lista e pela grade (cima/baixo de linha em linha na grade), A escolhe e leva ao
   botão de ação, B/Select fecha. */
const __MO_SLOTS = ["weapon", "offhand", "helmet", "armor", "boots", "accessory1", "accessory2"];
const __MO_CAP = 20;

Fl.prototype.__moLoad = function () {
  try {
    if (this.fromForest) { const c = __cData(this); return c ? { d: c.d, key: Wt("campaign", c.sl) } : null }
    const sl = this.game.registry.get("save:slot") || 1, e = Nn(sl);
    return e.ok ? { d: e.data, key: Wt("endless", sl), sl } : null;
  } catch (e) { return null }
};
Fl.prototype.__moItem = function (raw) {
  if (!raw) return null;
  try { const L = this.__moL || (this.__moL = new Bh(this)), it = L.makeItem(raw.id, raw.rarity || "COMMON", raw.seed ?? 0); if (it) return { ...it, ...(raw.uid ? { uid: raw.uid } : {}) } } catch (e) {}
  return { ...raw, name: raw.name || raw.id };
};

Fl.prototype.__mochila = function (focusKey) {
  const L3 = __L3;
  if (this.__busy || this.__hubDlgO) return;
  this.closePanel();
  const S = this.__moLoad();
  const cls = this.classDef?.id || "WARRIOR";
  const d = _ / 2, Y = 28, HH = 304, X0 = d - 282, W0 = 564;
  const o = this.add.container(this.__ox, this.__oy).setDepth(9800).setScrollFactor(0).setScale(this.__us);
  const bg = this.add.rectangle(d, st / 2, _, st, 328450, .8).setInteractive(), n = this.add.graphics();
  Dt(n, X0, Y, W0, HH); o.add([bg, n]); __winSkin(this, o, X0, Y, W0, HH, 1) && n.clear();
  o.add(this.add.text(d, Y + 16, L3("MOCHILA", "BACKPACK", "MOCHILA"), { ...la, fontSize: "15px" }).setOrigin(.5));
  const closeB = this.add.text(X0 + W0 - 40, Y + HH - 14, L3("✕ FECHAR", "✕ CLOSE", "✕ CERRAR"), { ...ti, fontSize: "10px", color: "#8a4a3a" }).setOrigin(.5).setInteractive({ useHandCursor: !0 });
  closeB.on("pointerdown", () => this.closePanel());
  if (!S || (S.d.player?.classId && S.d.player.classId !== cls)) {
    o.add(this.add.text(d, Y + 140, L3("Nenhum save deste herói para mostrar.", "No save for this hero to show.", "No hay partida de este héroe."), { ...Le, fontSize: "10px", color: "#5a4a3a" }).setOrigin(.5));
    o.add(closeB); this.__fixScroll?.(o); this.panel = o; this.panelRows = null; this.__fnAuto?.(o, closeB); return;
  }
  const P = S.d.player = S.d.player || {}; P.equipment = P.equipment || {}; P.items = Array.isArray(P.items) ? P.items : [];
  const mk = r => this.__moItem(r);
  const FD = !this.fromForest ? (window.__forgeDurGet?.(S.sl) || {}) : {};
  const rarCol = it => { try { return es(bt[it?.rarity]?.color ?? 0x8a7f66) } catch (e) { return "#8a7f66" } };
  const nameOf = it => it ? ((typeof _t === "function" ? _t(it) : it.name) || it.id) : "";
  const iconOf = (it, x, y, size) => {
    if (!it) return null;
    const hd = this.textures.exists("items-hd") && this.textures.get("items-hd").has(it.id);
    const im = hd ? this.add.image(x, y, "items-hd", it.id).setDisplaySize(size, size) : this.add.image(x, y, this.textures.exists(it.icon) ? it.icon : "icon-sword");
    if (!hd) { im.setScale(size / Math.max(im.width, im.height, 1)); it.tint != null && !/^farm-ic-/.test(it.icon || "") && im.setTint(it.tint) }
    return im;
  };
  const SLOTN = { weapon: L3("Arma", "Weapon", "Arma"), offhand: L3("Mão secundária", "Off-hand", "Mano secundaria"), helmet: L3("Elmo", "Helmet", "Yelmo"), armor: L3("Armadura", "Armor", "Armadura"), boots: L3("Botas", "Boots", "Botas"), accessory1: L3("Acessório 1", "Accessory 1", "Accesorio 1"), accessory2: L3("Acessório 2", "Accessory 2", "Accesorio 2") };
  // nomes dos atributos como o jogo mostra (st.*); os que não têm tradução ganham um nome próprio
  const STK = { damage: "damage", magicDamage: "magic", defense: "defense", maxHp: "hp", maxHpAdd: "hp", maxMana: "mana", speed: "speed", speedAdd: "speed", critChance: "crit", blockChance: "block", blockCounter: "counter" };
  const STX = { cooldownReduction: L3("Recarga%", "Cooldown%", "Recarga%"), dodgeChance: L3("Esquiva%", "Dodge%", "Esquiva%"), knockbackBonus: L3("Empurrão", "Knockback", "Empuje"), attackRangeAdd: L3("Alcance", "Range", "Alcance"), projectileBoost: L3("Projétil", "Projectile", "Proyectil"), backstabBonus: L3("Ataque pelas costas", "Backstab", "Puñalada"), chillOnHit: L3("Congela ao acertar", "Chill on hit", "Congela al golpear") };
  const statTxt = it => {
    const s = it?.stats || {}, out = [];
    for (const [k, v] of Object.entries(s)) {
      if (!v || typeof v !== "number") continue;
      let lb = STX[k] || k; if (STK[k]) { try { const w = W(`st.${STK[k]}`); if (w && w !== `st.${STK[k]}`) lb = w } catch (e) {} }
      out.push(`${v > 0 ? "+" : ""}${Math.round(v * 10) / 10} ${lb}`);
    }
    return out.join("  ·  ");
  };
  const extraTxt = it => {
    if (!it) return "";
    const parts = [];
    if (window.__isForgeItem?.(it)) {
      if (this.fromForest) parts.push(L3("Peça do ferreiro · quebra se morrer na run", "Blacksmith piece · breaks if you die in the run", "Pieza del herrero · se rompe si mueres en la run"));
      else { const mx = window.__forgeMaxRuns?.(it.id) || 3, used = FD[String(it.seed ?? 0)] | 0; parts.push(L3(`Peça do ferreiro · ${Math.max(0, mx - used)}/${mx} runs`, `Blacksmith piece · ${Math.max(0, mx - used)}/${mx} runs`, `Pieza del herrero · ${Math.max(0, mx - used)}/${mx} runs`)) }
    }
    if (it.slot && !Ee(cls, it)) { try { parts.push(yi(it)) } catch (e) {} }
    if (it.type === "quest") parts.push(L3("Item de missão", "Quest item", "Objeto de misión"));
    return parts.join("  ·  ");
  };

  // ── esquerda: o que o herói veste ──
  o.add(this.add.text(X0 + 20, Y + 34, L3("EQUIPADO", "EQUIPPED", "EQUIPADO"), { ...Le, fontSize: "8px", color: "#8a6a3a", fontStyle: "bold" }));
  const LX = X0 + 16, LW = 250, RH = 23, R0 = Y + 46, focusables = [], eqZones = [];
  __MO_SLOTS.forEach((slot, i) => {
    const y = R0 + i * (RH + 2), raw = P.equipment[slot], it = mk(raw);
    const g = this.add.graphics(); g.fillStyle(0x1a120b, .18).fillRoundedRect(LX, y, LW, RH, 4); g.lineStyle(1, it ? 0x8a6a3a : 0x5a4832, .5).strokeRoundedRect(LX, y, LW, RH, 4);
    o.add(g);
    const ic = iconOf(it, LX + 14, y + RH / 2, 18); ic && o.add(ic);
    o.add(this.add.text(LX + 30, y + 3, SLOTN[slot], { ...Le, fontSize: "7px", color: "#8a6a3a" }));
    o.add(this.add.text(LX + 30, y + 12, it ? nameOf(it) : "—", { ...Le, fontSize: "9px", color: it ? "#3a2a1a" : "#9a8a7a", fontStyle: it && (bt[it.rarity]?.order ?? 0) >= 3 ? "bold" : "normal" }));
    const z = this.add.zone(LX + LW / 2, y + RH / 2, LW, RH).setInteractive({ useHandCursor: !0 });
    z.__mo = { kind: "eq", slot, raw, it }; o.add(z); focusables.push(z); eqZones.push(z);
  });

  // ── direita: a mochila ──
  const nItems = P.items.filter(q => q?.type !== "quest").length;
  o.add(this.add.text(X0 + 290, Y + 34, `${L3("MOCHILA", "BACKPACK", "MOCHILA")}  ${nItems}/${__MO_CAP}`, { ...Le, fontSize: "8px", color: "#8a6a3a", fontStyle: "bold" }));
  const GX = X0 + 290, GY = Y + 46, CS = 44, COLS = 5, cellZones = [];
  for (let k = 0; k < __MO_CAP; k++) {
    const cx = GX + (k % COLS) * (CS + 4), cy = GY + Math.floor(k / COLS) * (CS - 4 + 4), raw = P.items[k], it = mk(raw);
    const g = this.add.graphics(); g.fillStyle(0x1a120b, it ? .22 : .1).fillRoundedRect(cx, cy, CS, CS - 4, 4);
    g.lineStyle(it ? 1.5 : 1, it ? parseInt(rarCol(it).slice(1), 16) : 0x5a4832, it ? .9 : .4).strokeRoundedRect(cx, cy, CS, CS - 4, 4);
    o.add(g);
    const ic = iconOf(it, cx + CS / 2, cy + (CS - 4) / 2, 28); ic && o.add(ic);
    const z = this.add.zone(cx + CS / 2, cy + (CS - 4) / 2, CS, CS - 4).setInteractive({ useHandCursor: !0 });
    z.__mo = { kind: "bag", idx: k, raw, it }; o.add(z); focusables.push(z); cellZones.push(z);
  }

  // ── embaixo: detalhes e ação ──
  const DY = Y + 238;
  const ln = this.add.graphics(); ln.lineStyle(1, 9053216, .5).lineBetween(X0 + 16, DY - 6, X0 + W0 - 16, DY - 6); o.add(ln);
  const dName = this.add.text(X0 + 20, DY, "", { ...ti, fontSize: "11px", color: "#3a2a1a" });
  const dStat = this.add.text(X0 + 20, DY + 15, "", { ...Le, fontSize: "8px", color: "#4a3a2a", wordWrap: { width: 380 } });
  const dExtra = this.add.text(X0 + 20, DY + 37, "", { ...Le, fontSize: "8px", color: "#2a58a0", wordWrap: { width: 380 } });
  const msg = this.add.text(X0 + 20, Y + HH - 20, "", { ...Le, fontSize: "8px", color: "#2a7a3a" });
  const actB = this.add.text(X0 + W0 - 90, DY + 18, "", { ...ti, fontSize: "11px", color: "#f6e7c8", backgroundColor: "#6e3b22", padding: { x: 12, y: 5 } }).setOrigin(.5).setInteractive({ useHandCursor: !0 }).setVisible(!1);
  o.add([dName, dStat, dExtra, msg, actB, closeB]);
  let chosen = null;
  const show = m => {
    const it = m?.it;
    dName.setText(it ? nameOf(it) : (m?.kind === "eq" ? `${SLOTN[m.slot]} — ${L3("vazio", "empty", "vacío")}` : L3("Espaço vazio", "Empty space", "Espacio vacío"))).setColor(it ? rarCol(it) : "#8a7f66");
    dStat.setText(it ? statTxt(it) || "" : ""); dExtra.setText(extraTxt(it));
  };
  const setAction = m => {
    chosen = m; let label = null;
    if (m?.it) {
      if (m.kind === "eq") label = L3("DESEQUIPAR", "UNEQUIP", "DESEQUIPAR");
      else if (m.it.slot && m.it.type !== "quest") label = Ee(cls, m.it) ? L3("EQUIPAR", "EQUIP", "EQUIPAR") : null;
    }
    actB.setVisible(!!label); label && actB.setText(label);
    actB.input && (actB.input.enabled = !!label);
    this.__fnAuto?.(o, closeB, !0); hook();
  };
  for (const z of focusables) {
    z.on("pointerover", () => { if (!chosen) show(z.__mo) });
    z.on("pointerdown", () => {
      const pad = this.__fnByPad; show(z.__mo); setAction(z.__mo); this.game.audioEngine?.sfx?.("sfx-ui-tab");
      const F = this.__fn; if (F) { const want = pad && actB.visible ? actB : z, k = F.items.indexOf(want); k >= 0 && (F.sel = k, this.__fnDraw()) }
      if (z.__mo.it && !actB.visible && z.__mo.it.slot && !Ee(cls, z.__mo.it)) msg.setText(extraTxt(z.__mo.it)).setColor("#a83a2a");
    });
  }
  const save = () => { try { localStorage.setItem(S.key, JSON.stringify(S.d)) } catch (e) { return !1 } try { typeof __rfGear === "function" && __rfGear(this) } catch (e) {} return !0 };
  const insBag = raw => { const k = P.items.findIndex(q => q?.type === "quest"); k < 0 ? P.items.push(raw) : P.items.splice(k, 0, raw) };
  actB.on("pointerdown", () => {
    const m = chosen; if (!m?.it) return;
    if (m.kind === "eq") {
      if (P.items.filter(q => q?.type !== "quest").length >= __MO_CAP) { msg.setText(L3("Mochila cheia.", "Backpack full.", "Mochila llena.")).setColor("#a83a2a"); this.game.audioEngine?.sfx?.("sfx-event-refuse"); return }
      P.equipment[m.slot] = null; insBag(m.raw);
      if (!save()) return; this.game.audioEngine?.sfx?.("sfx-unequip");
      return this.__mochila("bag:" + P.items.indexOf(m.raw));
    }
    const it = m.it; if (!it.slot || !Ee(cls, it)) return;
    const E = P.equipment, wpn = mk(E.weapon);
    const slot = fa(it) && yh(cls) && fa(wpn) && !E.offhand ? "offhand" : it.slot !== "accessory" ? it.slot : E.accessory1 ? (E.accessory2 ? "accessory1" : "accessory2") : "accessory1";
    const prev = E[slot]; P.items.splice(m.idx, 1); E[slot] = m.raw; prev && insBag(prev);
    if (!save()) return; this.game.audioEngine?.sfx?.("sfx-equip");
    this.__mochila("eq:" + slot);
  });
  // controle: na grade, esquerda/direita andam de casa em casa e cima/baixo de linha em linha; da lista da
  // esquerda, direita entra na grade; da primeira coluna da grade, esquerda volta para a lista
  const hook = () => {
    const F = this.__fn; if (!F || F.o !== o) return;
    const go = b => { const k = F.items.indexOf(b); k >= 0 && (F.sel = k, this.__fnDraw(), this.game.audioEngine?.sfx?.("sfx-ui-move")) };
    F.lr = dd => {
      const cur = F.items[F.sel], ci = cellZones.indexOf(cur), ei = eqZones.indexOf(cur);
      if (ci >= 0) { const col = ci % COLS; if (dd < 0 && col === 0) return go(eqZones[Math.min(eqZones.length - 1, Math.floor(ci / COLS) * 2)]); if (dd > 0 && col === COLS - 1) return actB.visible ? go(actB) : go(cellZones[ci]); return go(cellZones[ci + dd]) }
      if (ei >= 0 && dd > 0) return go(cellZones[Math.min(cellZones.length - 1, Math.floor(ei / 2) * COLS)]);
      if (cur === actB && dd < 0) { const z = focusables.find(q => q.__mo === chosen); return z ? go(z) : this.__fnNav(dd) }
      this.__fnNav(dd);
    };
    F.ud = dd => {
      const cur = F.items[F.sel], ci = cellZones.indexOf(cur);
      if (ci >= 0) { const nx = ci + dd * COLS; if (nx >= 0 && nx < cellZones.length) return go(cellZones[nx]); if (dd > 0) return go(actB.visible ? actB : closeB) }
      this.__fnNav(dd);
    };
  };
  this.__fixScroll?.(o); this.panel = o; this.panelRows = null;
  this.__fnAuto?.(o, closeB); hook();
  // foco inicial: onde a última ação parou (ou a arma)
  const [fk, fv] = String(focusKey || "eq:weapon").split(":");
  const start = fk === "bag" ? cellZones[+fv] : eqZones[Math.max(0, __MO_SLOTS.indexOf(fv))];
  if (this.__fn && start) { const k = this.__fn.items.indexOf(start); k >= 0 && (this.__fn.sel = k, this.__fnDraw()) }
  show(start?.__mo);
  if (focusKey) msg.setText(fk === "bag" ? L3("Guardado na mochila.", "Put in the backpack.", "Guardado en la mochila.") : L3("Equipado!", "Equipped!", "¡Equipado!")).setColor("#2a7a3a");
  this.game.audioEngine?.sfx?.("sfx-ui-open");
};

/* atalhos: tecla I (teclado) e a entrada "Mochila" no menu Start */
{
  const C0 = Fl.prototype.create;
  Fl.prototype.create = function () {
    const r = C0.apply(this, arguments);
    try { this.input.keyboard?.on("keydown-I", () => { if (this.panel && this.__moOpen()) this.closePanel(); else if (!this.panel) this.__mochila() }) } catch (e) {}
    return r;
  };
  Fl.prototype.__moOpen = function () { return !!this.panel?.list?.some(x => x.type === "Text" && /^(MOCHILA|BACKPACK)$/.test(x.text)) };
}
