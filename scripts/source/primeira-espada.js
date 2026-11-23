/* ══ Missão secundária 10: A Primeira Espada (Farias, dono da taverna · p216.103) ════════════════════════════════
   Antes da taverna, o Farias (pai do Rafael, o ferreiro) era o "Mão-de-Ferro", mercenário. A primeira espada que o
   Rafael forjou, aos doze anos, foi para ele; a Ivone, mulher do Farias, enrolou o punho com a fita vermelha do
   vestido de casamento, "pra você sempre voltar pra casa". Numa descida que deu errado ele correu e deixou para trás
   a espada e o parceiro, Gaspar. Nunca contou ao filho.
   Campanha (estado por slot em __Q, chave "fe"):
     0 nada · 1 aceita (Ruínas) · 2 achou a fita da Ivone (Cidadela Glacial) · 3 achou o acampamento (o Gaspar, no mesmo lugar)
     4 venceu o Gaspar, tem a espada (voltar à taverna) · 5 Farias levou a espada à forja · 6 concluída
   · Taverna: o Farias oferece depois do segundo portal concluído (no primeiro já há outra missão); "!" sobre ele.
   · Ruínas Antigas / Templo Perdido: a fita presa numa lápide. · Cidadela Glacial / Trilha Nevada: o acampamento do
     Gaspar; lido o recado, o Gaspar, o Corvo (chefe, preso pelo Abismo há vinte anos) espera no Lago Congelado.
   · A Ivone está viva: é ela quem manda a fita para o herói no fim.
   · Forja: o Farias espera ao lado da bigorna; pai e filho conversam e o Rafael restaura a espada, que fica
     pendurada atrás do balcão da taverna. Recompensa: Fita da Ivone (acessório lendário: +4 vida, +2 defesa;
     uma vez por masmorra, um golpe que mataria deixa 1 de vida).
   Arte: scripts/gerar_primeira_espada.py → scripts/build_primeira_espada.py. */
const __FE = {
  L3(pt, en, es) { return typeof __L3 === "function" ? __L3(pt, en, es) : pt },
  st(S) { return __Q.get(S, "fe") },
  set(S, v) { __Q.set(S, "fe", v); try { S.requestSave?.(10) } catch (e) {} return v },
  G(t, e = "talk") { return { who: "gaspar", expr: e, name: "GASPAR", text: t } },
  banner(S, t, c = "#ffcf8a") { S.game.events.emit("ui:banner", t, c) },
  busy(S) { const ui = S.scene.get("UI"); return !S.scene.isActive() || S.uiOpen || ui?.__dlgOpen || ui?.storyPanel?.visible || S.player?.dead },
  room(S, id) { return S.dungeon?.level?.rooms?.find((r) => r.id === id)?.rect },
  spot(S, R, fx = .5, fy = .5) {
    let c = Math.round(R.x + R.w * fx), r = Math.round(R.y + R.h * fy);
    for (let k = 0; k < 40 && S.dungeon.isWallTile?.(c, r); k++) { c = R.x + 2 + (Math.random() * (R.w - 4) | 0); r = R.y + 2 + (Math.random() * (R.h - 4) | 0) }
    return [c * dt + 16, r * dt + 16];
  },
  zone(S, x, y, label, act) {
    const z = S.add.zone(x, y, 4, 4); z.interactLabel = label; z.interact = act; S.dungeon.objects.push(z);
    const off = () => { const i = S.dungeon.objects.indexOf(z); i >= 0 && S.dungeon.objects.splice(i, 1) };
    S.events.once("shutdown", off); return off;
  },
  glow(S, x, y, col, depth) {
    const g = S.add.image(x, y, "light").setBlendMode(j.BlendModes.ADD).setTint(col).setScale(.22).setAlpha(.5).setDepth(depth);
    S.tweens.add({ targets: g, alpha: .2, scale: .3, duration: 800, yoyo: !0, repeat: -1, ease: "Sine.easeInOut" }); return g;
  },
};
/* Gaspar: folha 9 colunas × 5 linhas de 128 (parado, andando, golpe, dano, morte) */
function __feAnims(S) {
  const A = S.anims, mk = (k, a, n, fr, rep = -1) => { if (!A.exists(k) && S.textures.exists("gaspar")) A.create({ key: k, frames: A.generateFrameNumbers("gaspar", { start: a, end: a + n - 1 }), frameRate: fr, repeat: rep }) };
  mk("gaspar-idle", 0, 8, 7); mk("gaspar-talk", 0, 8, 7); mk("gaspar-walk", 9, 8, 10); mk("gaspar-attack", 18, 9, 12, 0);
  mk("gaspar-windup", 18, 3, 8, 0); mk("gaspar-strike", 21, 6, 14, 0); mk("gaspar-hurt", 27, 5, 12, 0);
  mk("gaspar-death", 36, 9, 7, 0); mk("gaspar-phase", 0, 8, 10, 0);
}
/* 1. Ruínas Antigas — a fita da Ivone presa numa lápide do Templo Perdido */
function __feFita(S) {
  if (__FE.st(S) !== 1 || S.__feOn) return; S.__feOn = 1;
  const R = __FE.room(S, "templo"); if (!R || !S.textures.exists("pe-fita-lapide")) return;
  const L3 = __FE.L3, [x, y] = __FE.spot(S, R, .5, .4);
  const s = S.add.image(x, y + 14, "pe-fita-lapide").setOrigin(.5, 1).setScale(.75).setDepth(y + 14);
  const g = __FE.glow(S, x, y - 6, 0xff5a5a, y + 15);
  const off = __FE.zone(S, x, y + 4, L3("Examinar a lápide", "Examine the gravestone", "Examinar la lápida"), () => {
    if (__FE.busy(S) || __FE.st(S) !== 1) return;
    __dlg(S, [
      __Q.H(S, L3("Uma fita vermelha, de seda, amarrada nesta lápide… desbotada, mas inteira.", "A red silk ribbon tied to this gravestone… faded, but whole.", "Una cinta roja de seda atada a esta lápida… desteñida, pero entera."), "calm"),
      __Q.H(S, L3("É a fita da Ivone. Alguém desenrolou do punho da espada e deixou aqui, como um aviso.", "It's Ivone's ribbon. Someone unwound it from the sword's grip and left it here, like a sign.", "Es la cinta de Ivone. Alguien la desenrolló de la empuñadura y la dejó aquí, como una señal."), "talk"),
      __Q.H(S, L3("Tem um \"G.\" riscado na pedra, e marcas de bota subindo para a Cidadela Glacial. O Gaspar saiu daqui vivo… e levou a espada.", "There's a \"G.\" scratched into the stone, and boot marks heading up to the Glacial Citadel. Gaspar left here alive… and took the sword.", "Hay una \"G.\" rayada en la piedra y huellas de bota hacia la Ciudadela Glacial. Gaspar salió vivo de aquí… y se llevó la espada."), "special"),
    ], () => {
      __FE.set(S, 2); off(); S.tweens.killTweensOf(g); g.destroy();
      S.tweens.add({ targets: s, alpha: .55, duration: 400 });
      S.effects?.burstTinted?.(x, y - 4, 0xff6a6a, 14);
      __FE.banner(S, L3("A PRIMEIRA ESPADA: VOCÊ GUARDOU A FITA DA IVONE · SIGA PARA A CIDADELA GLACIAL", "THE FIRST SWORD: YOU KEPT IVONE'S RIBBON · HEAD TO THE GLACIAL CITADEL", "LA PRIMERA ESPADA: GUARDASTE LA CINTA DE IVONE · VE A LA CIUDADELA GLACIAL"));
    });
  });
}
/* 2. Cidadela Glacial — o acampamento do Gaspar na Trilha Nevada, com o recado entalhado; lido, o Gaspar espera no Lago Congelado */
function __feCamp(S) {
  if (__FE.st(S) !== 2 || S.__feOn) return; S.__feOn = 1;
  const R = __FE.room(S, "gs-trilha"); if (!R || !S.textures.exists("pe-acampamento")) return;
  const L3 = __FE.L3, [x, y] = __FE.spot(S, R, .45, .5);
  S.add.image(x, y + 14, "pe-acampamento").setOrigin(.5, 1).setScale(.85).setDepth(y + 2);
  const g = __FE.glow(S, x + 14, y - 8, 0xffc070, y + 15);
  const off = __FE.zone(S, x, y + 4, L3("Ler a pedra entalhada", "Read the carved stone", "Leer la piedra tallada"), () => {
    if (__FE.busy(S) || __FE.st(S) !== 2) return;
    __dlg(S, [
      __Q.H(S, L3("Um acampamento velho. Cinzas frias, uma garrafa quebrada… e dezenas de risquinhos na pedra, contando dias.", "An old camp. Cold ashes, a broken bottle… and dozens of little scratches on the stone, counting days.", "Un campamento viejo. Cenizas frías, una botella rota… y decenas de rayitas en la piedra, contando días."), "calm"),
      __Q.H(S, L3("\"F. não voltou. Levo a espada do menino até o lago lá em cima. Alguém tem que terminar o contrato. — G.\"", "\"F. didn't come back. I'm taking the boy's sword up to the lake. Someone has to finish the contract. — G.\"", "\"F. no volvió. Llevo la espada del niño hasta el lago de arriba. Alguien tiene que terminar el contrato. — G.\""), "special"),
      __Q.H(S, L3("Esperou o parceiro aqui até desistir. O Lago Congelado, então.", "He waited for his partner here until he gave up. The Frozen Lake, then.", "Esperó a su compañero aquí hasta rendirse. El Lago Congelado, entonces."), "sadness"),
    ], () => {
      __FE.set(S, 3); off(); S.tweens.killTweensOf(g); g.destroy();
      __FE.banner(S, L3("A PRIMEIRA ESPADA: O GASPAR ESPERA NO LAGO CONGELADO", "THE FIRST SWORD: GASPAR WAITS AT THE FROZEN LAKE", "LA PRIMERA ESPADA: GASPAR ESPERA EN EL LAGO CONGELADO"));
      S.__feOn = 0; __feGaspar(S);
    });
  });
}
/* 3. Cidadela Glacial — Gaspar, o Corvo, no Lago Congelado */
function __feGaspar(S) {
  if (__FE.st(S) !== 3 || S.__feOn) return; S.__feOn = 1;
  const R = __FE.room(S, "gs-lago"); if (!R || !S.textures.exists("gaspar")) return;
  __feAnims(S);
  const L3 = __FE.L3, G = __FE.G, [x, y] = __FE.spot(S, R, .5, .45);
  const npc = __qNpc(S, "gaspar", x, y + 16, { scale: .44 });
  if (!npc) return;
  npc.spr.setFlipX(!0).setTint(0xdfefff);
  let started = !1;
  const fight = () => {
    if (!Yt.GASPAR_CORVO) Yt.GASPAR_CORVO = { ...Yt.ABYSS_GUARDIAN, name: "Gaspar, o Corvo", subtitle: "O Contrato Inacabado", texture: "gaspar", scale: .44, bodySize: 20, maxHp: 115, contactDamage: 2, speed: 62, xp: 750, gold: { min: 90, max: 170 }, attackCooldownMs: 1400,
      attacks: { SLAM: { damage: 3, range: 66, width: 78, telegraphMs: 560, recoverMs: 480 }, SHOCKWAVE: { damage: 3, radius: 112, telegraphMs: 760, recoverMs: 620 } },
      phase2: { hpRatio: .5, speedMult: 1.3, cooldownMult: .65, damageMult: 1.25, radiusMult: 1.25, tint: 0x9fdcff },
      anims: { idle: {}, walk: {}, attack: {}, strike: {}, windup: {}, hurt: {}, death: {}, phase: {} } };
    try { _s["Gaspar, o Corvo"] = "Gaspar the Crow" } catch (e) {}
    const bx = npc.spr.x, by = npc.spr.y - 10; npc.destroy();
    S.effects?.burstTinted?.(bx, by, 0xcfe8ff, 24); S.cameraSys?.shake?.(.008, 300);
    const b = S.spawnBoss("GASPAR_CORVO", bx, by, {});
    try { b.name = L3("Gaspar, o Corvo", "Gaspar the Crow", "Gaspar, el Cuervo") } catch (e) {}
    try { const rr = [...S.roomManager.byId.values()].find((r) => r.def?.id === "gs-lago"); rr && (b.arenaBounds = S.roomManager.arenaBoundsFor(rr)) } catch (e) {}
    S.game.events.emit("boss:spawned", b.data_.name, b.data_.subtitle);
    const on = (bb) => {
      if (bb?.typeKey !== "GASPAR_CORVO") return; S.game.events.off("boss:defeated", on);
      setTimeout(() => { if (S.scene.isActive() && !S.player?.dead) __feGasparEnd(S, bb.x, bb.y) }, 1800);
    };
    S.game.events.on("boss:defeated", on); S.events.once("shutdown", () => S.game.events.off("boss:defeated", on));
  };
  const talk = () => {
    if (started || __FE.busy(S)) return; started = !0;
    __dlg(S, [
      G(L3("Farias…? Não. Você não é ele. Mas carrega o cheiro de cerveja da taverna dele.", "Farias…? No. You're not him. But you carry the beer smell of his tavern.", "¿Farias…? No. No eres él. Pero traes el olor a cerveza de su taberna."), "talk"),
      G(L3("Vinte anos. Ou vinte dias. Aqui embaixo o tempo congela junto com tudo.", "Twenty years. Or twenty days. Down here time freezes along with everything else.", "Veinte años. O veinte días. Aquí abajo el tiempo se congela con todo lo demás."), "sadness"),
      __Q.H(S, L3("Vim buscar a espada do filho dele. O Farias nunca te esqueceu.", "I came for his son's sword. Farias never forgot you.", "Vine por la espada de su hijo. Farias nunca te olvidó.")),
      G(L3("Esqueceu de voltar, isso sim. O contrato não terminou. Se quer a espada, tire ela da minha mão!", "He forgot to come back, that's what. The contract isn't over. If you want the sword, take it from my hand!", "Olvidó volver, eso sí. El contrato no terminó. ¡Si quieres la espada, quítamela de la mano!"), "aggression"),
    ], fight);
  };
  const off = __FE.zone(S, x, y + 4, L3("Falar com o velho mercenário", "Talk to the old mercenary", "Hablar con el viejo mercenario"), () => { off(); talk() });
  const U = () => {
    const P = S.player; if (!P || started || !npc.spr.active) { S.events.off("update", U); return }
    if (Math.hypot(P.x - x, P.y - y) < 110 && !__FE.busy(S)) { S.events.off("update", U); off(); talk() }
  };
  S.events.on("update", U); S.events.once("shutdown", () => S.events.off("update", U));
}
function __feGasparEnd(S, x, y) {
  const L3 = __FE.L3, G = __FE.G;
  __dlg(S, [
    G(L3("Hah… o menino forjou bem. Nem vinte anos de gelo entortaram mais do que ela já era.", "Hah… the boy forged well. Not even twenty years of ice bent it more than it already was.", "Ja… el niño forjó bien. Ni veinte años de hielo la torcieron más de lo que ya estaba."), "sadness"),
    G(L3("Diz pro Farias que eu entendo. Eu também teria corrido, se tivesse um filho esperando em casa.", "Tell Farias I understand. I'd have run too, if I had a son waiting at home.", "Dile a Farias que lo entiendo. Yo también habría corrido, si tuviera un hijo esperando en casa."), "talk"),
    G(L3("E devolve a espada pro menino. Ela nunca foi minha. O contrato… acabou.", "And give the sword back to the boy. It was never mine. The contract… is over.", "Y devuélvele la espada al niño. Nunca fue mía. El contrato… se acabó."), "sadness"),
  ], () => {
    __FE.set(S, 4);
    try { if (S.textures.exists("pe-espada")) { const sw = S.add.image(x, y - 10, "pe-espada").setScale(.45).setDepth(y + 20); S.tweens.add({ targets: sw, y: y - 34, alpha: 0, angle: -30, duration: 1400, ease: "Sine.easeOut", onComplete: () => sw.destroy() }) } } catch (e) {}
    S.effects?.burstTinted?.(x, y, 0xcfe8ff, 18);
    __FE.banner(S, L3("A PRIMEIRA ESPADA: VOCÊ RECUPEROU A ESPADA DO RAFAEL · LEVE AO FARIAS", "THE FIRST SWORD: YOU RECOVERED RAFAEL'S SWORD · BRING IT TO FARIAS", "LA PRIMERA ESPADA: RECUPERASTE LA ESPADA DE RAFAEL · LLÉVALA A FARIAS"), "#ffd27a");
  });
}
/* Fita da Ivone: uma vez por masmorra, um golpe que mataria deixa 1 de vida */
function __feHasFita(S) { try { return Object.values(S.inventory?.equipment || {}).some((it) => it?.id === "fita_ivone") } catch (e) { return !1 } }
{const D0 = oh.prototype.die; oh.prototype.die = function () {
  const S = this.scene;
  try { if (this === S?.player && !S.__feFitaUsed && __feHasFita(S)) {
    S.__feFitaUsed = 1; this.dead = !1; this.hp = 1; this.invuln = Math.max(this.invuln || 0, 1.5);
    S.game.events.emit("hud:hp", this.hp, this.maxHp);
    S.effects?.burstTinted?.(this.x, this.y, 0xff5a6a, 22); S.effects?.shockwaveRing?.(this.x, this.y, 60); S.cameraSys?.shake?.(.008, 240);
    S.effects?.floatText?.(this.x, this.y - 36, __FE.L3("PRA SEMPRE VOLTAR PRA CASA", "ALWAYS COME BACK HOME", "PARA SIEMPRE VOLVER A CASA"), "#ff8a9a", 11);
    return;
  } } catch (e) {}
  return D0.apply(this, arguments) }}
/* peças com nome próprio (fixedName): os afixos aleatórios somam atributos, mas não trocam o nome */
try { const IU = __itemUnique; __itemUnique = function (it) { const r = IU.apply(this, arguments); try { const d = it && Xt[it.id]; if (d?.fixedName) it.name = d.name } catch (e) {} return r } } catch (e) {}
/* ─── ganchos do jogo ─── */
{
  __QLIST.push({ id: "espada", title: "A Primeira Espada", st: (S) => {
    const s = __FE.st(S), L3 = __FE.L3; if (!s) return null;
    return s >= 6 ? ["done", L3("A espada do Rafael voltou para o gancho da taverna. O Farias te deu a Fita da Ivone.", "Rafael's sword is back on the tavern's hook. Farias gave you Ivone's Ribbon.", "La espada de Rafael volvió al gancho de la taberna. Farias te dio la Cinta de Ivone.")]
      : ["on", [, L3("Procure a fita da Ivone no Templo Perdido das Ruínas Antigas.", "Look for Ivone's ribbon in the Lost Temple of the Ancient Ruins.", "Busca la cinta de Ivone en el Templo Perdido de las Ruinas Antiguas."),
        L3("Siga o rastro do Gaspar pela Trilha Nevada da Cidadela Glacial.", "Follow Gaspar's trail along the Snowy Trail of the Glacial Citadel.", "Sigue el rastro de Gaspar por el Sendero Nevado de la Ciudadela Glacial."),
        L3("Encontre o Gaspar no Lago Congelado da Cidadela Glacial.", "Find Gaspar at the Frozen Lake of the Glacial Citadel.", "Encuentra a Gaspar en el Lago Congelado de la Ciudadela Glacial."),
        L3("Leve a espada de volta ao Farias, na taverna do Refúgio.", "Bring the sword back to Farias, at the Refuge tavern.", "Lleva la espada de vuelta a Farias, en la taberna del Refugio."),
        L3("O Farias levou a espada até a forja. Encontre os dois lá.", "Farias took the sword to the forge. Meet them there.", "Farias llevó la espada a la forja. Encuéntralos allí.")][s] || ""];
  } });
  Xt.fita_ivone = { name: "Fita da Ivone", type: "accessory", slot: "accessory", icon: "icon-fita-ivone", minRarity: "LEGENDARY",
    stats: { maxHp: 4, defense: 2 }, value: 300, fixedName: !0, desc: "A fita do vestido de casamento da Ivone. Uma vez por masmorra, um golpe que mataria deixa você com 1 de vida." };
  try {
    const en = { "A Primeira Espada": "The First Sword", "Fita da Ivone": "Ivone's Ribbon", "A fita do vestido de casamento da Ivone. Uma vez por masmorra, um golpe que mataria deixa você com 1 de vida.": "The ribbon from Ivone's wedding dress. Once per dungeon, a blow that would kill you leaves you at 1 life." };
    const es = { "A Primeira Espada": "La Primera Espada", "Fita da Ivone": "Cinta de Ivone", "A fita do vestido de casamento da Ivone. Uma vez por masmorra, um golpe que mataria deixa você com 1 de vida.": "La cinta del vestido de novia de Ivone. Una vez por mazmorra, un golpe que te mataría te deja con 1 de vida." };
    Object.assign(__TR.en, en); __TR.es && Object.assign(__TR.es, es);
    _s["item.fita_ivone"] = en["Fita da Ivone"]; Io["item.fita_ivone"] = es["Fita da Ivone"];
  } catch (e) {}
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path, Dp = "assets/pixel-art/npc/", ex = (k) => this.textures.exists(k); L.setPath("");
      ex("gaspar") || L.spritesheet("gaspar", Dp + "gaspar.png", { frameWidth: 128, frameHeight: 128 });
      for (const k of ["fita-lapide", "acampamento", "espada"]) ex("pe-" + k) || L.image("pe-" + k, Dp + "pe-" + k + ".png");
      ex("icon-fita-ivone") || L.image("icon-fita-ivone", Dp + "icon-fita-ivone.png");
      for (const e of ["talk", "calm", "smile", "sadness", "aggression", "special"]) ex(`gaspar-p-${e}`) || L.image(`gaspar-p-${e}`, `${Dp}gaspar-p-${e}.png`);
      L.setPath(op);
    } catch (e) {}
    return r;
  };
  const HS = __hubSetup;
  __hubSetup = function (S) {
    const r = HS.apply(this, arguments);
    try {
      if (!__Q.camp(S) || S.isDorfCave) return r;
      if (__FE.st(S) >= 6 && __Q.get(S, "feItem") === 1) S.time.delayedCall(900, () => {
        if (!S.scene.isActive() || !S.player) return;
        try { const it = S.lootSystem.makeItem("fita_ivone", "LEGENDARY"); S.lootSystem.spawnItem(S.player.x, S.player.y + 18, it); __Q.set(S, "feItem", 2);
          __FE.banner(S, __FE.L3("O FARIAS MANDOU A FITA DA IVONE PARA VOCÊ", "FARIAS SENT YOU IVONE'S RIBBON", "FARIAS TE ENVIÓ LA CINTA DE IVONE"), "#ffd27a") } catch (e) {}
      });
      const lv = S.levelId, st = __FE.st(S), f = lv === "ruins" ? __feFita : lv === "glacial" ? (st === 2 ? __feCamp : __feGaspar) : null;
      f && S.time.delayedCall(450, () => { if (S.scene.isActive()) f(S) });
    } catch (e) { console.warn("[primeira-espada]", e) }
    return r;
  };
}
/* ─── Refúgio: taverna (Farias) e forja (pai e filho) ─── */
function __feHub(H) { return !!H.fromForest }
/* masmorras da campanha concluídas, vistas do Refúgio (lá não há mochila, então __hubProg não serve) */
function __feProg(H) {
  const L = new Set(H.completedDungeons || []);
  try { const c = __cData(H); for (const id of [...(c?.d?.campaign?.completedDungeons || []), ...(c?.d?.completedDungeons || [])]) L.add(id);
    for (const id of JSON.parse(localStorage.getItem("depthgate:portals:slot_" + (c?.sl ?? H.retSlot ?? 1)) || "[]")) L.add(id) } catch (e) {}
  return __HUBD.filter((id) => L.has(id)).length;
}
function __feHero(H, t, e = "talk") {
  const id = H.rig?.classDef?.id || H.classDef?.id || "WARRIOR", c = String(id).toLowerCase();
  return { name: String((typeof __HN !== "undefined" && __HN[id]) || id).toUpperCase(), por: "hero-" + c, e, t };
}
function __feFariasTalk(H, orig) {
  const s = __FE.st(H), L3 = __FE.L3, F = (t, e = "talk") => ({ who: "farias", e, t }), R = (t, e = "talk") => ({ who: "rafael", e, t });
  const prog = __feProg(H);
  if (!s && prog >= 2) {
    H.__hubDlg([
      F(L3("Tá vendo aquele gancho vazio atrás do balcão? Faz vinte anos que ele está assim.", "See that empty hook behind the counter? It's been like that for twenty years.", "¿Ves ese gancho vacío detrás de la barra? Lleva veinte años así."), "sadness"),
      F(L3("Antes desta taverna eu era o Farias Mão-de-Ferro. Mercenário. Dos bons… ou pelo menos dos teimosos.", "Before this tavern I was Farias Iron-Hand. Mercenary. One of the good ones… or at least one of the stubborn ones.", "Antes de esta taberna yo era Farias Mano-de-Hierro. Mercenario. De los buenos… o al menos de los tercos."), "calm"),
      F(L3("O Rafael tinha doze anos quando forjou a primeira espada da vida dele. Torta, pesada… e pra mim.", "Rafael was twelve when he forged the first sword of his life. Crooked, heavy… and for me.", "Rafael tenía doce años cuando forjó la primera espada de su vida. Torcida, pesada… y para mí."), "smile"),
      F(L3("A Ivone, minha mulher, enrolou o punho com a fita vermelha do vestido de casamento. \"Pra você sempre voltar pra casa\", ela disse. Até hoje ela me pergunta dessa espada.", "Ivone, my wife, wrapped the grip with the red ribbon from her wedding dress. \"So you always come back home\", she said. She still asks me about that sword.", "Ivone, mi mujer, envolvió la empuñadura con la cinta roja de su vestido de novia. \"Para que siempre vuelvas a casa\", dijo. Todavía me pregunta por esa espada."), "smile"),
      F(L3("Eu voltei. A espada não. Numa descida que deu errado eu corri… e deixei ela pra trás. E o Gaspar, meu parceiro, junto.", "I came back. The sword didn't. On a descent gone wrong I ran… and left it behind. And Gaspar, my partner, with it.", "Yo volví. La espada no. En un descenso que salió mal corrí… y la dejé atrás. Y a Gaspar, mi compañero, con ella."), "sadness"),
      F(L3("Nunca contei isso pro meu filho. Se um dia passar pelas Ruínas Antigas, procura a fita da Ivone. Onde ela estiver, a espada passou.", "I never told my son. If you ever pass through the Ancient Ruins, look for Ivone's ribbon. Wherever it is, the sword went by.", "Nunca se lo conté a mi hijo. Si alguna vez pasas por las Ruinas Antiguas, busca la cinta de Ivone. Donde esté, pasó la espada."), "talk"),
    ], () => { __FE.set(H, 1); H.__feMark?.(); H.__say?.(H.playerX, H.playerY - 46, L3("NOVA MISSÃO: A PRIMEIRA ESPADA", "NEW QUEST: THE FIRST SWORD", "NUEVA MISIÓN: LA PRIMERA ESPADA"), 3200, "#ffd27a") });
    return !0;
  }
  if (s === 4) {
    H.__hubDlg([
      __feHero(H, L3("Farias. Encontrei o Gaspar… e isto.", "Farias. I found Gaspar… and this.", "Farias. Encontré a Gaspar… y esto.")),
      F(L3("…É ela. Torta do mesmo jeito. O menino errou a têmpera e eu jurei que era a melhor espada do reino.", "…That's her. Just as crooked. The boy botched the temper and I swore it was the finest sword in the realm.", "…Es ella. Igual de torcida. El niño falló el temple y yo juré que era la mejor espada del reino."), "special"),
      __feHero(H, L3("Ele pediu pra te dizer que entende. Que também teria corrido, se tivesse um filho esperando.", "He asked me to tell you he understands. That he'd have run too, if he had a son waiting.", "Me pidió decirte que lo entiende. Que también habría corrido, si tuviera un hijo esperando."), "sadness"),
      F(L3("O velho Corvo… Ele merecia um parceiro melhor.", "The old Crow… He deserved a better partner.", "El viejo Cuervo… Merecía un compañero mejor."), "sadness"),
      F(L3("Não sou eu quem tem que pendurar essa espada. Vou levar até a forja. Encontra a gente lá.", "I'm not the one who should hang this sword. I'll take it to the forge. Meet us there.", "No soy yo quien debe colgar esta espada. La llevaré a la forja. Encuéntranos allí."), "calm"),
    ], () => { __FE.set(H, 5); H.__feMark?.() });
    return !0;
  }
  if (s === 1 || s === 2 || s === 3) {
    const t = [, L3("As Ruínas Antigas, herói. O Templo Perdido era onde a gente montava acampamento.", "The Ancient Ruins, hero. The Lost Temple was where we used to make camp.", "Las Ruinas Antiguas, héroe. El Templo Perdido era donde acampábamos."),
      L3("A fita da Ivone… você achou mesmo. Então o Gaspar saiu vivo daquele templo. Vivo! Ela vai querer saber disso.", "Ivone's ribbon… you really found it. So Gaspar left that temple alive. Alive! She'll want to hear this.", "La cinta de Ivone… de verdad la encontraste. Entonces Gaspar salió vivo de ese templo. ¡Vivo! Ella querrá saberlo."),
      L3("A Cidadela… Ele sempre foi o mais teimoso de nós dois. Toma cuidado lá em cima.", "The Citadel… He was always the more stubborn of us two. Be careful up there.", "La Ciudadela… Siempre fue el más terco de los dos. Ten cuidado allá arriba.")][s];
    H.__hubDlg([F(t, s === 2 ? "special" : "talk")]);
    return !0;
  }
  if (s >= 6 && !H.__feThx) {
    H.__feThx = 1;
    H.__hubDlg([F([L3("A espada ficou no gancho. Toda noite, antes de fechar, eu dou boa-noite pra ela. Não conta pra Maria.", "The sword stays on the hook. Every night, before closing, I say goodnight to it. Don't tell Maria.", "La espada quedó en el gancho. Cada noche, antes de cerrar, le doy las buenas noches. No se lo digas a Maria."),
      L3("O Rafael apareceu pra jantar ontem. Primeira vez em anos. A Ivone fez o ensopado dela.", "Rafael came over for dinner yesterday. First time in years. Ivone made her stew.", "Rafael vino a cenar ayer. Primera vez en años. Ivone hizo su guiso.")][Math.random() * 2 | 0], "smile")]);
    return !0;
  }
  return !1;
}
/* cena na forja: o Farias espera ao lado da bigorna; pai e filho conversam e o Rafael restaura a espada */
function __feForge(H) {
  const s = H.smith, L3 = __FE.L3, F = (t, e = "talk") => ({ who: "farias", e, t }), R = (t, e = "talk") => ({ who: "rafael", e, t });
  s.talk = 1e9; s.f.play("ferreiro-talk", !0);
  H.__hubDlg([
    F(L3("Filho… eu te devo uma história. Lembra da primeira espada que você fez?", "Son… I owe you a story. Remember the first sword you ever made?", "Hijo… te debo una historia. ¿Recuerdas la primera espada que hiciste?"), "sadness"),
    R(L3("A torta? Você disse que perdeu numa aposta de cartas.", "The crooked one? You said you lost it in a card game.", "¿La torcida? Dijiste que la perdiste en una apuesta de cartas."), "talk"),
    F(L3("Menti. Eu larguei ela numa masmorra, fugindo. Larguei o Gaspar junto. Tive medo de não voltar pra vocês.", "I lied. I left it in a dungeon, running away. Left Gaspar with it. I was afraid of not coming back to you two.", "Mentí. La dejé en una mazmorra, huyendo. Dejé a Gaspar con ella. Tuve miedo de no volver con ustedes."), "sadness"),
    R(L3("…Pai. Você voltou. É isso que a mãe sempre quis dizer com aquela fita.", "…Dad. You came back. That's what Mom always meant with that ribbon.", "…Papá. Volviste. Eso es lo que mamá siempre quiso decir con esa cinta."), "smile"),
    R(L3("Me dá ela aqui. A têmpera eu acerto agora. O torto a gente deixa: é a parte que eu mais gosto.", "Hand it over. I'll get the temper right now. The crook we keep: it's the part I like best.", "Dámela. El temple lo arreglo ahora. Lo torcido lo dejamos: es la parte que más me gusta."), "talk"),
  ], () => {
    try { H.__sparks?.(s.x + 4, s.y - 22, 14); window.__advancedAudio?.playMetalClang?.("C5"); H.cameras.main.shake(180, .004) } catch (e) {}
    H.time.delayedCall(700, () => {
      H.__hubDlg([
        R(L3("Pronto. Volta pro gancho da taverna, onde é o lugar dela.", "Done. Back to the tavern's hook, where it belongs.", "Listo. Vuelve al gancho de la taberna, donde pertenece."), "smile"),
        R(L3("A mãe vai chorar quando vir ela pendurada de novo. Chorar e rir, do jeito dela.", "Mom is going to cry when she sees it hanging again. Cry and laugh, the way she does.", "Mamá va a llorar cuando la vea colgada otra vez. Llorar y reír, a su manera."), "smile"),
        F(L3("E a fita fica com você, herói. Foi a própria Ivone que mandou: disse que agora ela tem que proteger quem ainda desce.", "And the ribbon stays with you, hero. Ivone herself insisted: she said now it has to protect someone who still goes down there.", "Y la cinta se queda contigo, héroe. Lo pidió la propia Ivone: dijo que ahora tiene que proteger a quien todavía baja."), "smile"),
        F(L3("Pra sempre voltar pra casa. Promete?", "So you always come back home. Promise?", "Para siempre volver a casa. ¿Lo prometes?"), "calm"),
      ], () => {
        __FE.set(H, 6); s.talk = .01;
        /* a fita vai para a mochila salva (como as peças da armaria); sem save legível, fica pendente e chega na próxima masmorra */
        let ok = !1; try { const c = __cData(H); if (c?.d) { c.d.player = c.d.player || {}; c.d.player.items = c.d.player.items || []; c.d.player.items.push({ id: "fita_ivone", rarity: "LEGENDARY", seed: Date.now() }); localStorage.setItem(Wt("campaign", c.sl), JSON.stringify(c.d)); ok = !0 } } catch (e) { console.warn("[primeira-espada] item", e) }
        __Q.set(H, "feItem", ok ? 2 : 1);
        H.__say?.(H.playerX, H.playerY - 46, L3("A PRIMEIRA ESPADA · VOCÊ GANHOU A FITA DA IVONE", "THE FIRST SWORD · YOU GOT IVONE'S RIBBON", "LA PRIMERA ESPADA · OBTUVISTE LA CINTA DE IVONE"), 3600, "#ffd27a");
        try { H.audioRef?.play?.("sfx-boss-victory") || H.game.audioEngine?.sfx?.("sfx-boss-victory") } catch (e) {}
        const f = H.__feF; if (f) H.tweens.add({ targets: f, alpha: 0, delay: 900, duration: 900, onComplete: () => { f.destroy(); H.__feF = null } });
      });
    });
  });
}
{
  const I0 = Fl.prototype.__inters;
  Fl.prototype.__inters = function () {
    const r = I0.apply(this, arguments);
    try {
      const H = this, fi = (this.inters || []).find((o) => o.id === "farias" && o.area === "in");
      if (fi && !fi.__fe) {
        fi.__fe = 1; const a0 = fi.act;
        fi.act = () => { if (H.__tv && __feHub(H) && !H.__hubDlgO && __feFariasTalk(H)) return; return a0() };
        /* "!" sobre o Farias quando há o que conversar; a espada pendurada atrás do balcão depois da missão */
        const mk = H.add.text(fi.x, fi.y - 44, "!", { fontFamily: "Georgia, serif", fontStyle: "bold", fontSize: "16px", color: "#ffd24a", stroke: "#1a120c", strokeThickness: 4 }).setOrigin(.5).setDepth(fi.y + 60).setVisible(!1);
        H.tweens.add({ targets: mk, y: mk.y - 4, duration: 500, yoyo: !0, repeat: -1, ease: "Sine.easeInOut" });
        const sw = H.textures.exists("pe-espada") ? H.add.image(fi.x + 21, fi.y - 16, "pe-espada").setScale(.27).setAngle(-45).setDepth(5000).setVisible(!1) : null;
        H.__feMark = () => {
          const s = __FE.st(H); const prog = __feProg(H);
          mk.setVisible(!!H.__tv && __feHub(H) && ((!s && prog >= 2) || s === 4));
          sw?.setVisible(!!H.__tv && __feHub(H) && s >= 6);
        };
        const fu = () => { try { H.__feMark() } catch (e) {} }; H.events.on("update", fu); H.events.once("shutdown", () => H.events.off("update", fu));
      }
    } catch (e) { console.warn("[primeira-espada] taverna", e) }
    return r;
  };
  const A0 = Fl.prototype.__area;
  Fl.prototype.__area = function (a) {
    const r = A0.apply(this, arguments);
    try {
      const H = this, want = a === "in" && !H.__tv && __feHub(H) && __FE.st(H) === 5 && H.textures.exists("farias");
      if (want && !H.__feF && H.M?.interior?.smith) {
        const A = H.M.interior.smith.anvil;
        H.__feF = H.add.sprite(A[0] - 34, A[1] + 4, "farias", 0).setOrigin(.5, 1).setScale(.194).setDepth(A[1] + 4);
        H.anims.exists("farias-idle") && H.__feF.play("farias-idle");
      } else if (!want && H.__feF && a !== "in") { H.__feF.destroy(); H.__feF = null }
    } catch (e) { console.warn("[primeira-espada] forja", e) }
    return r;
  };
  const T0 = Fl.prototype.__smithTalk;
  Fl.prototype.__smithTalk = function () {
    try { if (__feHub(this) && __FE.st(this) === 5 && !this.__hubDlgO && this.smith) { __feForge(this); return } } catch (e) { console.warn("[primeira-espada]", e) }
    return T0.apply(this, arguments);
  };
}
window.__dgFE = { FE: __FE, fita: __feFita, camp: __feCamp, gaspar: __feGaspar, prog: (H) => __feProg(H) };
