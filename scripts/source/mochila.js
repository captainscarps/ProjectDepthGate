/* ══ Inventário do jogo dentro do Refúgio ══
   O MESMO livro de inventário da run (Equipamento, Atributos, Missão, Diário, Habilidades, Poções…), aberto na camada
   de interface do Refúgio (HubUI). Como a cena da partida não está rodando, o livro recebe um "jogo substituto"
   montado com as peças do próprio jogo — o inventário (Rh) e os atributos (Eh) de verdade — preenchidos pelo save
   (campanha do slot ou herói do Modo Infinito). Cada troca grava no save na hora e o herói na vila troca de visual.
   Abre por: botão 🎒 INVENTÁRIO (ao lado do START), "Inventário" no menu Start, tecla I e Select do controle.
   Controle e teclado: os mesmos da run (direcional/setas andam, A/Enter escolhe e equipa, LB/RB ou Q/E trocam a
   aba, B/Esc volta e fecha, Select/I fecha). */
const __HI_SLOTS = ["weapon", "offhand", "helmet", "armor", "boots", "accessory1", "accessory2"];

Fl.prototype.__moLoad = function () {
  try {
    if (this.fromForest) { const c = __cData(this); return c ? { d: c.d, key: Wt("campaign", c.sl) } : null }
    const sl = this.game.registry.get("save:slot") || 1, e = Nn(sl);
    return e.ok ? { d: e.data, key: Wt("endless", sl), sl } : null;
  } catch (e) { return null }
};

/* o "jogo substituto" que o livro enxerga no lugar da cena da partida */
Fl.prototype.__hiState = function (S) {
  const H = this, g = H.game, cls = H.classDef, P = S.d.player = S.d.player || {};
  const L = new Bh(H), mk = r => { if (!r) return null; try { return L.makeItem(r.id, r.rarity || "COMMON", r.seed ?? 0) } catch (e) { return null } };
  const A = {
    game: g, registry: g.registry, time: H.time, scene: H.scene, sys: H.sys, classDef: cls, lootSystem: L, __hubInv: !0,
    mode: H.fromForest ? "campaign" : "endless", state: "playing", uiOpen: !0,
    audioRef: { play: k => { try { g.audioEngine?.sfx?.(k) } catch (e) {} } },
    endlessRun: () => null,
    skillState: P.skills && Array.isArray(P.skills.unlocked) ? { unlocked: [...P.skills.unlocked], equipped: [0, 1, 2, 3].map(k => P.skills.equipped?.[k] ?? null) } : zh(cls.id),
    abilities: { setEquipped() {} },
    player: { hp: P.hp || 6, maxHp: P.hp || 6, x: H.playerX, y: H.playerY, heal() {} },
    resource: { current: P.resource ?? 100, max: P.resource ?? 100 },
    potions: { count: P.potions || 0 }
  };
  A.stats = new Eh(A, cls); A.stats.level = P.level || 1; A.stats.xp = P.xp || 0; A.stats.gold = P.gold || 0;
  A.inventory = new Rh(A, A.stats);
  for (const r of P.items || []) { const it = mk(r); it && A.inventory.items.push(it) }
  for (const k of __HI_SLOTS) A.inventory.equipment[k] = mk(P.equipment?.[k]);
  A.stats.attachInventory(A.inventory);
  // descartar no Refúgio apagaria o item de vez (não há chão para ele cair): fica só para a run
  A.inventory.discard = () => { try { g.events.emit("ui:banner", __L3("Descartar itens só durante a run.", "Discard items only during a run.", "Descartar objetos solo durante la run."), "#ff9a7a") } catch (e) {} return !1 };
  try { A.player.maxHp = Math.max(A.player.hp, A.stats.total?.maxHp || A.player.hp) } catch (e) {}
  return A;
};

Fl.prototype.__invHub = function () {
  const H = this, U = H.scene.get("HubUI");
  if (!U?.sys?.isActive?.() || H.__busy || H.panel || H.__hubDlgO || U.__hiOpen) return;
  const S = H.__moLoad();
  if (!S || (S.d.player?.classId && S.d.player.classId !== H.classDef?.id)) { H.__ecoBanner?.(__L3("Nenhum save deste herói para abrir o inventário.", "No save for this hero to open the inventory.", "No hay partida de este héroe para abrir el inventario.")); return }
  const A = H.__hiState(S);
  const inv = U.__hiInv || (U.__hiInv = new Cd(U));
  inv.gs = () => A;
  // grava a cada troca (mesmo formato do save da run) e veste o herói da vila
  const ser = it => it ? { id: it.id, rarity: it.rarity, seed: it.seed ?? 0 } : null;
  const save = () => {
    try {
      const P = S.d.player; P.items = A.inventory.items.map(ser).filter(Boolean);
      P.equipment = Object.fromEntries(__HI_SLOTS.map(k => [k, ser(A.inventory.equipment[k])]));
      P.skills = { ...(P.skills || {}), unlocked: [...A.skillState.unlocked], equipped: [...A.skillState.equipped] };   // mantém a árvore do Infinito e as escolhas
      localStorage.setItem(S.key, JSON.stringify(S.d));
      typeof __rfGear === "function" && __rfGear(H);
    } catch (e) { console.warn("[inventário do Refúgio]", e) }
  };
  const onCh = () => save();
  A.requestSave = () => save();
  // aba HABILIDADES: a árvore de habilidades do jogo, também com o "jogo substituto"
  const T = U.skillTree || (U.skillTree = new Rd(U));
  T.gs = () => A; T.persist = () => save();
  H.game.events.on("inv:changed", onCh);
  // o Refúgio para enquanto o livro está aberto; os botões da vila somem para não cobrir o livro
  H.__busy = !0; H.path = null; H.pending = null; U.__hiOpen = !0; U.__hiAt = performance.now();
  const hud = [U.pzBtn, U.moBtn, U.pzBd, U.moBd].filter(Boolean);
  hud.forEach(o => o.setVisible(!1));
  try { U.tc?.setVisible?.(!1) } catch (e) {}
  // os avisos que o livro manda (ex.: "precisa do Martelo de Forjador") aparecem no Refúgio
  const onBan = (t, c) => {   // por cima do livro (na mesma camada dele)
    try { const x = U.add.text(_ / 2, 22, String(t || ""), { ...ti, fontSize: "11px", color: c || "#ffd27a", stroke: "#120c08", strokeThickness: 4, align: "center", wordWrap: { width: 560 } }).setOrigin(.5, 0).setDepth(99999); U.tweens.add({ targets: x, alpha: 0, delay: 2200, duration: 500, onComplete: () => x.destroy() }) } catch (e) {}
  };
  H.game.events.on("ui:banner", onBan);
  const C0 = inv.close;
  inv.close = function () {
    try { typeof __invSkills === "function" && __invSkills(inv, !1) } catch (e) {}
    try { inv.__forgeModal?.destroy?.(); inv.__forgeModal = null } catch (e) {}
    const r = C0.apply(this, arguments);
    inv.close = C0; save(); H.game.events.off("inv:changed", onCh); H.game.events.off("ui:banner", onBan);
    U.__hiOpen = !1; hud.forEach(o => o.setVisible(!0)); try { U.tc?.setVisible?.(!0) } catch (e) {}
    U.time.delayedCall(120, () => { H.__busy = !1; H.__slPv = !0; H.__stPv = !0 });
    return r;
  };
  inv.show();
  try { inv.__sk && typeof __invTab === "function" && __invTab(inv, 0) } catch (e) {}   // abre sempre em EQUIPAMENTO
};
Fl.prototype.__mochila = function () { return this.__invHub() };
Fl.prototype.__moOpen = function () { return !!this.scene.get("HubUI")?.__hiOpen };

/* teclado e controle do livro no Refúgio (na run quem faz isso é a cena da interface) */
{
  const C0 = __HubUI.prototype.create;
  __HubUI.prototype.create = function () {
    const r = C0.apply(this, arguments), U = this;
    /* p216.122: a cena da interface do Refúgio é a mesma a cada volta, mas os objetos do livro morrem no shutdown —
       o livro guardado da visita anterior dava erro ao abrir de novo (e a vila ficava "ocupada"). Começa do zero. */
    U.__hiInv = null; U.__hiOpen = !1; U.skillTree = null;
    U.events.once("shutdown", () => { U.__hiInv = null; U.__hiOpen = !1; U.skillTree = null });
    const close = () => U.__hiInv?.open && U.__hiInv.close();
    const key = k => {
      const v = U.__hiInv; if (!v?.open) return;
      if (k === "i" || k === "I") return performance.now() - (U.__hiAt || 0) > 250 && close();
      // na aba HABILIDADES as setas e o Enter vão para a árvore; Q/E trocam a aba e Esc fecha o livro
      if (U.skillTree?.open && U.skillTree.__emb && !["q", "e", "Q", "E", "Escape", "Tab", "PageUp", "PageDown"].includes(k)) return U.skillTree.handleKey(k);
      if (k === "Escape" && U.skillTree?.__emb) return close();
      // T / Y: a forja do livro (fundir itens), como na run — se a forja já estiver aberta, as teclas vão para ela
      if ((k === "t" || k === "T") && !v.__forgeModal) { try { __openForge(v) } catch (e) {} return }
      const used = v.handleKey(k); if (!used && k === "Escape") close();
    };
    U.input.keyboard?.on("keydown", e => { if (U.__hiOpen) key(e.key) });
    const MAP = [[12, "ArrowUp"], [13, "ArrowDown"], [14, "ArrowLeft"], [15, "ArrowRight"], [0, "Enter"], [1, "Escape"], [4, "q"], [5, "e"], [3, "t"]];
    let pv = { all: !0 };
    /* p216.122: sai no shutdown (antes cada volta ao Refúgio somava mais um ouvinte: o controle apertava várias vezes) */
    const upd = () => {
      if (!U.__hiOpen) { pv = { all: !0 }; return }
      let g = null; try { g = Array.from(navigator.getGamepads?.() ?? []).find(p => p && p.connected) } catch (e) {}
      if (!g) return;
      const b = i => !!(g.buttons[i]?.pressed || (g.buttons[i]?.value ?? 0) > .5), ax = g.axes[0] ?? 0, ay = g.axes[1] ?? 0;
      const now = { 12: b(12) || ay < -.6, 13: b(13) || ay > .6, 14: b(14) || ax < -.6, 15: b(15) || ax > .6, 0: b(0), 1: b(1), 2: b(2), 3: b(3), 4: b(4), 5: b(5), 8: b(8), 9: b(9) };
      if (pv.all) { pv = now; return }        // ignora o botão que abriu o livro
      for (const [i, k] of MAP) if (now[i] && !pv[i]) key(k);
      if ((now[8] && !pv[8]) || (now[9] && !pv[9])) close();
      pv = now;
    };
    U.events.on("update", upd); U.events.once("shutdown", () => U.events.off("update", upd));
    return r;
  };
}
/* tecla I no Refúgio */
{
  const C0 = Fl.prototype.create;
  Fl.prototype.create = function () {
    const r = C0.apply(this, arguments);
    try { this.input.keyboard?.on("keydown-I", () => { if (!this.scene.get("HubUI")?.__hiOpen && !this.panel) this.__invHub() }) } catch (e) {}
    return r;
  };
}

/* aba DECK DO PACTO: setas/direcional escolhem a carta (vale na run e no Refúgio) */
{
  const HK = Cd.prototype.handleKey;
  Cd.prototype.handleKey = function (k) { if (this.open && window.__invDeckKey?.(this, k)) return !0; return HK.apply(this, arguments) };
}
