/* ══ Escolha de habilidades por nível (campanha e Modo Infinito) ═══════════════════════════════════════════════
   Nos níveis 1, 5, 10 e 15 o jogo pausa e mostra as habilidades daquele nível — as da classe e uma extra.
   O herói fica com UMA; as outras ficam fechadas até o fim da run/campanha. Nos graus de Pesadelo
   (Modo Infinito, depois do nível 15) a escolha é entre passivas. Estado em S.skillState.pick. */
const __SPX = {
  WARRIOR: { 1: "ET_CHARGE", 5: "ET_CLAN_CRY", 10: "ET_SPIN", 15: "ET_AEGIS" },
  BERSERKER: { 1: "ET_TSUBAME", 5: "ET_PARRY", 10: "ET_QUAKE", 15: "ET_IRON_WALL" },
  ARCHER: { 1: "ET_CHARGED", 5: "ET_BACKFLIP", 10: "ET_FENCE", 15: "ET_ARROW_STORM" },
  MAGE: { 1: "ET_ICE_COMET", 5: "ET_SUN_MIRROR", 10: "ET_ICE_PRISON", 15: "ET_STARFALL" },
  ROGUE: { 1: "ET_DEATH_MARK", 5: "ET_ROLL", 10: "ET_TOXIC_SMOKE", 15: "ET_BLADE_DANCE" },
  NECROMANCER: { 1: "ET_PLAGUE", 5: "ET_BONE_ARMOR", 10: "ET_REAP", 15: "ET_BONE_STORM" },
  HUNTER: { 1: "ET_DOUBLE_SHOT", 5: "ET_CAMPFIRE", 10: "ET_COORD", 15: "ET_PROTECT_HOWL" },
  SHAMAN: { 1: "ET_DART_HAIL", 5: "ET_BARK", 10: "ET_WAR_DANCE", 15: "ET_JAGUAR" },
  DRUID: { 1: "ET_BLOOD_HOWL", 5: "ET_OAK_RING", 10: "ET_MISTLETOE", 15: "ET_BEAR" },
};
/* três habilidades novas para quem tinha só três extras */
for (const [id, o, n, d] of [
  ["ET_ARROW_STORM", { type: "multi-projectile", damageType: "physical", cost: 30, cooldown: 12, damageMult: 1, count: 9, spread: .15, projectile: { texture: "proj-arrow", speed: 470, maxDist: 300, tint: 16769354 }, icon: "icon-volley", sound: "sfx-archer-multishot", tint: 16769354 },
    ["Tempestade de Flechas", "Arrow Storm", "Tormenta de Flechas"], ["Nove flechas num leque largo; recarga 12 s", "Nine arrows in a wide fan; cooldown 12 s", "Nueve flechas en un abanico amplio; recarga 12 s"]],
  ["ET_STARFALL", { type: "projectile", damageType: "magical", cost: 35, cooldown: 14, damageMult: 3.2, projectile: { texture: "proj-bolt", speed: 300, maxDist: 320, tint: 16748330, explosion: { radius: 92 } }, icon: "icon-holy-nova", sound: "sfx-mage-fireball", tint: 16748330 },
    ["Estrela Cadente", "Falling Star", "Estrella Fugaz"], ["Uma estrela de fogo que explode numa área grande; recarga 14 s", "A fiery star that explodes over a wide area; cooldown 14 s", "Una estrella de fuego que estalla en un área grande; recarga 14 s"]],
  ["ET_BONE_STORM", { type: "multi-projectile", damageType: "magical", cost: 30, cooldown: 12, damageMult: .9, count: 12, spread: .5236, projectile: { texture: "proj-bolt", speed: 380, maxDist: 240, tint: 14215368 }, icon: "icon-skeleton-army", sound: "sfx-mage-arcane-blast", tint: 14215368 },
    ["Tempestade de Ossos", "Bone Storm", "Tormenta de Huesos"], ["Doze lascas de osso em todas as direções; recarga 12 s", "Twelve bone shards in every direction; cooldown 12 s", "Doce astillas de hueso en todas direcciones; recarga 12 s"]],
]) {
  Ye[id] = { id, ...o, get name() { return __etL(n) }, get desc() { return __etL(d) } };
  _s[`abn.${id}`] = n[1]; Io[`abn.${id}`] = n[2]; _s[`abd.${id}`] = d[1]; Io[`abd.${id}`] = d[2];
}
const __SP_ETNODE = {};
for (const [id, nid] of __ETABD) __SP_ETNODE[id] = nid;

function __spSt(S) { const k = S?.skillState; if (!k) return null; k.pick = k.pick && typeof k.pick === "object" ? k.pick : {}; return k.pick }
function __spOpts(S, lv) {
  const c = S.classDef.id, o = [...(Ps[c]?.[lv] ?? [])], x = __SPX[c]?.[lv];
  x && o.push(x);
  return o.filter(id => Ye[id]);
}
function __spName(id) { const d = Ye[id]; try { return St(`abn.${id}`, d?.name ?? id) } catch (e) { return d?.name ?? id } }
function __spDesc(id) { const d = Ye[id]; try { return St(`abd.${id}`, d?.desc ?? "") } catch (e) { return d?.desc ?? "" } }
/* saves antigos: o que já estava liberado conta como a escolha daquele nível */
function __spMigrate(S) {
  const P = __spSt(S), un = S.skillState.unlocked ?? [];
  for (const lv of Ne) if (P[lv] == null && lv > 1) { const o = __spOpts(S, lv).find(id => un.includes(id)); o && (P[lv] = o) }
}
function __spPending(S) {
  const P = __spSt(S), lvl = S.stats?.level ?? 1, out = [];
  for (const lv of Ne) if (lv <= lvl && P[lv] == null && __spOpts(S, lv).length) out.push({ kind: "lv", lv });
  const nm = S.stats?.nm | 0, done = P.nm | 0;
  for (let k = done; k < nm; k++) out.push({ kind: "nm", g: k + 1 });
  return out;
}
function __spPassives(S) {
  const T = __ET[S.classDef.id]; if (!T) return [];
  const st = __etSt(S), un = S.skillState.unlocked ?? [];
  /* só passivas que fazem sentido com as habilidades escolhidas */
  const okReq = q => {
    if (q.startsWith("ab:")) return un.includes(q.slice(3));
    const ids = q.startsWith("any:") ? q.slice(4).split("|") : [q.split(":")[0]];
    return ids.some(id => { const n = __ETIDX[id]?.n; if (!n) return !0; if (n.ab) return (st.r[id] | 0) > 0; return (n.req || []).every(okReq) });
  };
  const all = [...T.d.nodes, ...T.a.nodes].filter(n => (n.t === "p" || n.t === "top" || n.t === "nm") && !n.ab && (st.r[n.id] | 0) < n.m && (n.req || []).every(okReq));
  for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [all[i], all[j]] = [all[j], all[i]] }
  return all.slice(0, 3);
}
function __spApply(S, q, choice) {
  const P = __spSt(S), k = S.skillState, st = __etSt(S);
  if (q.kind === "nm") {
    st.r[choice] = (st.r[choice] | 0) + 1; P.nm = (P.nm | 0) + 1;
  } else {
    P[q.lv] = choice;
    const others = __spOpts(S, q.lv).filter(id => id !== choice);
    let slot = -1;
    for (const o of others) {
      const u = k.unlocked.indexOf(o); u >= 0 && k.unlocked.splice(u, 1);
      const e = k.equipped.indexOf(o); e >= 0 && (k.equipped[e] = null, slot < 0 && (slot = e));
    }
    k.unlocked.includes(choice) || k.unlocked.push(choice);
    __SP_ETNODE[choice] && (st.r[__SP_ETNODE[choice]] = Math.max(1, st.r[__SP_ETNODE[choice]] | 0));
    if (!k.equipped.includes(choice)) { const e = slot >= 0 ? slot : k.equipped.findIndex(o => o == null); e >= 0 && (k.equipped[e] = choice) }
    S.abilities.setEquipped(k.equipped);
    S.game.events.emit("skills:unlocked", choice);
  }
  S.stats.recompute(); __etPersist(S);
}

/* ── janela de escolha (usa o mesmo caminho de teclado/controle que já existia: U.__etp) ── */
class __SPPanel {
  constructor(U) { this.U = U; this.open = !1; this.queue = []; this.sel = 0 }
  gs() { return this.U.scene.get("Game") }
  push(q) { if (!this.queue.some(o => o.kind === q.kind && o.lv === q.lv && o.g === q.g)) this.queue.push(q); this.tryShow() }
  busy() {
    const S = this.gs(), U = this.U;
    return !S?.sys?.isActive?.() || S.state !== "playing" || S.player?.dead || S.transitioning || U.result?.isVisible?.() || U.pauseMenu?.open || U.shopUI?.open ||
      U.storyPanel?.visible || U.blessingPanel?.visible || U.eventPanel?.visible || U.inventoryUI?.open || U.__pactsUI?.open || U.skillTree?.open ||
      (typeof window.__castleMapOpen === "function" && window.__castleMapOpen()) || (S.uiOpen && !this.open);
  }
  tryShow() {
    if (this.open || !this.queue.length) return;
    if (this.busy()) { clearTimeout(this.__t); this.__t = setTimeout(() => this.tryShow(), 900); return }
    this.show(this.queue.shift());
  }
  show(q) {
    const S = this.gs(), U = this.U;
    const opts = q.kind === "nm" ? __spPassives(S).map(n => ({ id: n.id, n: __etL(n.n), d: __etL(n.d), ic: n.ic, tag: __L3("PASSIVA", "PASSIVE", "PASIVA"), grade: (__etSt(S).r[n.id] | 0) + 1, m: n.m }))
      : __spOpts(S, q.lv).map(id => ({ id, n: __spName(id), d: __spDesc(id), ic: Ye[id].icon, tag: __SP_ETNODE[id] || /^ET_/.test(id) ? __L3("NOVA", "NEW", "NUEVA") : __L3("DA CLASSE", "CLASS", "DE CLASE"), cost: Ye[id].cost, cd: Ye[id].cooldown }));
    if (!opts.length) { if (q.kind === "nm") { __spSt(S).nm = (__spSt(S).nm | 0) + 1; __etPersist(S) } return this.tryShow() }
    this.q = q; this.opts = opts; this.sel = 0; this.open = !0; this.at = performance.now();
    this.__paused = !S.uiOpen; S.uiOpen = !0; S.time.paused = !0; S.physics?.pause?.(); S.tweens?.pauseAll?.();
    U.game.events.emit("ui:inventory", !0);
    S.audioRef?.play?.("sfx-ability-ready");
    this.draw();
  }
  draw() {
    const U = this.U, q = this.q, n = this.opts.length;
    this.root?.destroy(!0);
    const W = typeof _ !== "undefined" ? _ : 640, cx = Math.round(W / 2);
    const R = this.root = U.add.container(0, 0).setDepth(950);
    const dim = U.add.rectangle(cx, 180, 4000, 2400, 393738, .9).setInteractive(); R.add(dim);
    const F = "Georgia, 'Times New Roman', serif";
    const title = q.kind === "nm" ? `${__L3("PESADELO", "NIGHTMARE", "PESADILLA")} ${__roman ? __roman(q.g) : q.g}` : `${__L3("NÍVEL", "LEVEL", "NIVEL")} ${q.lv}`;
    R.add(U.add.text(cx, 30, title, { fontFamily: F, fontSize: "20px", fontStyle: "bold", color: "#ffd24a", stroke: "#0a0806", strokeThickness: 4 }).setOrigin(.5));
    R.add(U.add.text(cx, 56, q.kind === "nm" ? __L3("Escolha UMA passiva — ela fica até o fim da run", "Choose ONE passive — it stays until the end of the run", "Elige UNA pasiva — se queda hasta el final de la partida")
      : __L3("Escolha UMA habilidade — as outras deste nível ficam fechadas", "Choose ONE skill — the others of this level stay locked", "Elige UNA habilidad — las demás de este nivel quedan cerradas"),
      { fontFamily: F, fontSize: "11px", fontStyle: "italic", color: "#e8dcc0" }).setOrigin(.5));
    const cw = Math.min(176, (W - 40) / n - 12), gap = 12, x0 = cx - (n * cw + (n - 1) * gap) / 2 + cw / 2;
    this.cards = this.opts.map((o, i) => {
      const x = x0 + i * (cw + gap), y = 184, c = U.add.container(x, y);
      const g = U.add.graphics(); c.add(g);
      const ic = U.textures.exists(o.ic) ? U.add.image(0, -66, o.ic).setScale(1.6) : U.add.text(0, -66, "✦", { fontSize: "26px", color: "#ffd24a" }).setOrigin(.5);
      const tag = U.add.text(0, -98, o.tag, { fontFamily: F, fontSize: "8px", fontStyle: "bold", color: o.tag === __L3("NOVA", "NEW", "NUEVA") ? "#8ae0ff" : "#c9a24a" }).setOrigin(.5);
      const nm = U.add.text(0, -36, o.n, { fontFamily: F, fontSize: "12.5px", fontStyle: "bold", color: "#ffe9b0", align: "center", wordWrap: { width: cw - 16 } }).setOrigin(.5, 0);
      const meta = o.grade ? `${__L3("Grau", "Rank", "Grado")} ${o.grade}/${o.m}` : [o.cost ? `${o.cost} ${__L3("de recurso", "resource", "de recurso")}` : null, o.cd ? `${__L3("recarga", "cooldown", "recarga")} ${Math.round(o.cd)} s` : null].filter(Boolean).join("  ·  ");
      const mt = U.add.text(0, nm.y + nm.height + 4, meta, { fontFamily: F, fontSize: "9px", color: "#a89880", align: "center" }).setOrigin(.5, 0);
      const ds = U.add.text(0, mt.y + mt.height + 8, o.d, { fontFamily: F, fontSize: "10px", color: "#e8dcc0", align: "center", lineSpacing: 4, wordWrap: { width: cw - 18 } }).setOrigin(.5, 0);
      c.add([ic, tag, nm, mt, ds]);
      const z = U.add.zone(0, 0, cw, 240).setInteractive({ useHandCursor: !0 });
      z.on("pointerover", () => this.select(i)); z.on("pointerdown", () => { this.select(i); this.choose() });
      c.add(z);
      c.__g = g; c.__w = cw;
      c.setAlpha(0).setY(y + 20);
      U.tweens.add({ targets: c, alpha: 1, y, duration: 260, delay: 80 * i, ease: "Back.easeOut" });
      R.add(c); return c;
    });
    R.add(U.add.text(cx, 340, __L3("◀ ▶ escolher   ·   Enter / A / toque: confirmar", "◀ ▶ choose   ·   Enter / A / tap: confirm", "◀ ▶ elegir   ·   Enter / A / toque: confirmar"), { fontFamily: F, fontSize: "10px", color: "#c9a24a" }).setOrigin(.5));
    this.select(0);
  }
  select(i) {
    this.sel = i;
    (this.cards || []).forEach((c, k) => {
      const on = k === i, g = c.__g, w = c.__w;
      g.clear(); g.fillStyle(on ? 2763306 : 1315601, .96).fillRoundedRect(-w / 2, -116, w, 240, 8);
      g.lineStyle(on ? 2 : 1, on ? 16765514 : 5917740, 1).strokeRoundedRect(-w / 2, -116, w, 240, 8);
      c.setScale(on ? 1.04 : 1);
    });
  }
  choose() {
    if (!this.open || performance.now() - this.at < 350) return;
    const S = this.gs(), o = this.opts[this.sel], c = this.cards[this.sel], U = this.U;
    __spApply(S, this.q, o.id);
    U.tweens.add({ targets: c, scale: 1.15, duration: 140, yoyo: !0 });
    this.cards.forEach((k, i) => i !== this.sel && U.tweens.add({ targets: k, alpha: .25, duration: 200 }));
    S.audioRef?.play?.("sfx-event-accept");
    U.game.events.emit("ui:banner", `${o.n.toUpperCase()}`, "#ffd24a");
    this.open = !1;
    setTimeout(() => this.close(), 420);
  }
  close() {
    const S = this.gs(), U = this.U;
    this.root?.destroy(!0); this.root = null; this.cards = null;
    if (S && this.__paused && !this.queue.length) { S.uiOpen = !1; S.time.paused = !1; S.physics?.resume?.(); S.tweens?.resumeAll?.() }
    !this.queue.length && U.game.events.emit("ui:inventory", !1);
    this.open = !1;
    if (this.queue.length) { this.__paused && (S.uiOpen = !1); setTimeout(() => this.tryShow(), 120) }
  }
  handleKey(k) {
    if (!this.open) return !1;
    if (["ArrowLeft", "a", "A", "Left", "LEFT"].includes(k)) { this.sel > 0 && this.select(this.sel - 1); return !0 }
    if (["ArrowRight", "d", "D", "Right", "RIGHT"].includes(k)) { this.sel < this.opts.length - 1 && this.select(this.sel + 1); return !0 }
    if (["Enter", " ", "Space", "CONFIRM", "z", "Z", "e", "E"].includes(k)) { this.choose(); return !0 }
    return !0;
  }
}
function __spUI(U) { return U.__etp instanceof __SPPanel ? U.__etp : (U.__etp = new __SPPanel(U)) }
function __spCheck(S, delay = 0) {
  try {
    if (!S?.skillState || !S.classDef || S.isRift) return;
    const U = S.scene.get("UI"); if (!U) return;
    const P = __spUI(U);
    setTimeout(() => { if (!S.sys?.isActive?.()) return; for (const q of __spPending(S)) P.push(q) }, delay);
  } catch (e) { console.warn("[skill-picks]", e) }
}
/* ganchos: ao entrar na fase, ao subir de nível e ao ganhar grau de Pesadelo */
{
  const C0 = Sd.prototype.create;
  Sd.prototype.create = function (...a) {
    const r = C0.apply(this, a);
    try { if (this.skillState) { __spSt(this); __spMigrate(this); __spCheck(this, 2600); this.game.events.on("rpg:levelup", this.__spLv = () => __spCheck(this, 700)); this.events.once("shutdown", () => this.game.events.off("rpg:levelup", this.__spLv)) } } catch (e) { console.warn("[skill-picks] init", e) }
    return r;
  };
  const X0 = Eh.prototype.addXp;
  Eh.prototype.addXp = function (i) {
    const S = this.scene, n0 = this.nm | 0, r = X0.apply(this, arguments);
    try { (this.nm | 0) > n0 && (S.__etNmSeen = this.nm | 0, __spCheck(S, 1600)) } catch (e) {}
    return r;
  };
}
/* árvore da classe (aba Habilidades): mostra a escolhida; o resto fica fechado; nada se libera por ali */
{
  Rd.prototype.nodes = function () {
    const S = this.gs(), P = __spSt(S) || {}, t = [], ey = { 1: 86, 5: 148, 10: 210, 15: 272 };
    for (const lv of Ne) {
      const o = P[lv] ? [P[lv]] : __spOpts(S, lv);
      o.forEach((id, n) => t.push({ id, level: lv, x: o.length === 1 ? 190 : o.length === 2 ? 130 + n * 120 : 100 + n * 90, y: ey[lv] }));
    }
    return t;
  };
  Rd.prototype.stateOf = function (id, lv) { const S = this.gs(); return S.skillState.unlocked.includes(id) ? "unlocked" : "locked" };
  Rd.prototype.unlockSelected = function () {};
}
window.__dgSP = { opts: __spOpts, pending: __spPending, ui: __spUI, check: __spCheck, X: __SPX };
