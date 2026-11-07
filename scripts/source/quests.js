/* ══ Missões secundárias da campanha + contratos do modo infinito + Diário ══
   1. Laço dos Irmãos (só Akihiro e Hayato) — carta do irmão, Templo dos Irmãos, os dois contra o Tengu
   2. O Último Pajé (todos; versão completa com a Araí) — três objetos sagrados espalhados nas masmorras
   3. O Bispo e a Freira — em quem acreditar? confronto com o bispo ou a bênção vira maldição
   4. A Lâmina Faminta — arma amaldiçoada que cresce a cada morte e começa a sussurrar
   5. A Criança Perdida — escolta numa masmorra; se ela cair, volta como fantasma
   6. Contratos do Abismo (modo infinito) — desafio a cada profundidade, paga em cristais do Refúgio
   Estado salvo por slot junto da história (um jogo novo começa do zero). */
const __Q = {
  get(S, k, d = 0) { try { const o = JSON.parse(localStorage.getItem(__stKey(S)) || "{}"); return o["q_" + k] ?? d } catch (e) { return d } },
  set(S, k, v) { try { const key = __stKey(S), o = JSON.parse(localStorage.getItem(key) || "{}"); o["q_" + k] = v; localStorage.setItem(key, JSON.stringify(o)) } catch (e) {} return v },
  camp(S) { return S?.game?.registry?.get("mode") === "campaign" && !S.level?.endless },
  n(S) { try { return __hubProg(S).n } catch (e) { return 0 } },
  cls(S) { return S.classDef?.id || "" },
  hero(S) { return (__HN[S.classDef?.id] ?? "Herói").toUpperCase() },
  G(text, expr = "talk") { return { who: "guardia", expr, name: __GN, text } },
  N(who, name, text, expr = "talk") { return { who, expr, name, text } },
  H(S, text, expr = "talk") { const c = String(S?.classDef?.id || S?.player?.heroClass || window.__heroCls || "WARRIOR").toLowerCase(); return { who: "hero-" + c, expr, name: (__HN[S.classDef?.id] ?? "Herói").toUpperCase(), text } },
  hubPos(S, dx, dy) { const q = S.dungeon.level.rooms.find((r) => r.hub)?.rect; return q ? [(q.x + q.w / 2) * dt + dx, (q.y + q.h / 2) * dt + dy] : [S.player.x + dx, S.player.y + dy] },
  frag(n) { try { const m = Xe(); m.fragments = (m.fragments || 0) + n; m.totalEarned = (m.totalEarned || 0) + n; tr(m) } catch (e) {} },
};
const __QBRO = { BERSERKER: "ARCHER", ARCHER: "BERSERKER" };
/* ─── NPC genérico: sprite animado que olha para o herói e mexe a boca quando há diálogo perto ─── */
function __qAnims(S) {
  const A = S.anims, mk = (k, tex, a, n, fr, rep = -1) => { if (!A.exists(k) && S.textures.exists(tex)) A.create({ key: k, frames: A.generateFrameNumbers(tex, { start: a, end: a + n - 1 }), frameRate: fr, repeat: rep }) };
  mk("bispo-idle", "bispo", 0, 6, 6); mk("bispo-walk", "bispo", 12, 12, 10); mk("bispo-attack", "bispo", 24, 8, 12, 0); mk("bispo-strike", "bispo", 28, 4, 12, 0);
  mk("bispo-windup", "bispo", 24, 4, 9, 0); mk("bispo-special", "bispo", 36, 4, 7); mk("bispo-phase", "bispo", 36, 4, 7, 0); mk("bispo-talk", "bispo", 48, 10, 8);
  mk("bispo-hurt", "bispo", 24, 1, 8, 0); mk("bispo-death", "bispo", 36, 4, 4, 0);
  mk("freira-idle", "freira", 0, 8, 6); mk("freira-walk", "freira", 12, 12, 10); mk("freira-talk", "freira", 24, 8, 7);
  mk("menino-idle", "menino", 0, 6, 7); mk("menino-walk", "menino", 12, 12, 13); mk("menino-run", "menino", 24, 12, 16); mk("menino-hurt", "menino", 36, 3, 10, 0);
  mk("paje-sit", "paje", 8, 7, 8, 0); mk("paje-talk", "paje", 16, 4, 3); mk("paje-walk", "paje", 0, 8, 9); mk("paje-idle", "paje", 24, 2, 2);
}
function __qNpc(S, key, x, y, o = {}) {
  __qAnims(S);
  if (!S.textures.exists(key)) return null;
  const s = S.add.sprite(x, y, key, 0).setOrigin(.5, 1).setScale(o.scale ?? 1).setDepth(y);
  const idle = o.idle ?? key + "-idle", talk = o.talk ?? key + "-talk";
  S.anims.exists(idle) && s.play(idle);
  o.tint && s.setTint(o.tint); o.alpha != null && s.setAlpha(o.alpha);
  const sh = S.add.ellipse(x, y, 24 * (o.scale ?? 1) + 6, 7, 0, o.ghost ? .12 : .32).setDepth(y - 1);
  let gl = null;
  if (o.ghost) { gl = S.add.image(x, y - 22, "light").setBlendMode(j.BlendModes.ADD).setTint(0x7ac8ff).setScale(.2).setAlpha(.35).setDepth(y + 1); S.tweens.add({ targets: s, y: y - 4, duration: 1400, yoyo: !0, repeat: -1, ease: "Sine.easeInOut" }) }
  const U = () => {
    if (!s.active || !S.player || s.__lock) return;
    o.noFlip || s.setFlipX(o.faceLeft ? S.player.x > s.x : S.player.x < s.x);
    const ui = S.scene.get("UI"), near = !!ui?.__dlgOpen && Math.hypot(S.player.x - s.x, S.player.y - s.y) < 190;
    const want = near && S.anims.exists(talk) ? talk : idle;
    S.anims.exists(want) && s.anims.currentAnim?.key !== want && s.play(want);
  };
  S.events.on("update", U); S.events.once("shutdown", () => S.events.off("update", U));
  let z = null;
  if (o.label) { z = S.add.zone(x, y - 6, 4, 4); z.interactLabel = o.label; z.interact = o.onTalk; S.dungeon.objects.push(z) }
  return { spr: s, sh, gl, zone: z, destroy() { S.events.off("update", U); s.destroy(); sh.destroy(); gl?.destroy(); if (z) { const i = S.dungeon.objects.indexOf(z); i >= 0 && S.dungeon.objects.splice(i, 1); z.destroy() } } };
}
function __qGo(S, id, extra) { try { __goLevel(S, id, extra || {}) } catch (e) {} }
/* ─── Diário de missões ─── */
const __QLIST = [
  { id: "bruxa", title: "A Velha da Cabana", st: (S) => !__WQ.f(S, "wqCrQ") ? null : __WQ.f(S, "wqCure") ? ["done", "A bruxa caiu e o feitiço se desfez."] : __WQ.f(S, "wqRev") ? ["on", "Derrote a Bruxa das Sepulturas na porta da casa dela."] : !__WQ.f(S, "wqCrDone") ? ["on", "Derrote o Cérbero da Podridão na Floresta da Cripta."] : __WQ.f(S, "wqEat") ? ["on", "Você comeu a fruta da senhora… algo não parece certo."] : ["done", "A Floresta da Cripta está em paz."] },
  { id: "irmaos", title: "Laço dos Irmãos", st: (S) => !__QBRO[__Q.cls(S)] ? null : __Q.get(S, "irm") === 2 ? ["done", "Os irmãos lutaram lado a lado no Templo."] : __Q.get(S, "irm") === 1 ? ["on", "Encontre seu irmão no Templo dos Irmãos."] : null },
  { id: "paje", title: "O Último Pajé", st: (S) => { const s = __Q.get(S, "pj"); if (!s) return null; if (s === 3) return ["done", "O selo do igapó foi refeito."]; const got = (__Q.get(S, "pjL", []) || []).filter((l) => __Q.get(S, "pjG_" + l)).length, need = (__Q.get(S, "pjL", []) || []).length; return ["on", got >= need ? "Leve os objetos sagrados ao pajé no Coração da Floresta." : `Objetos sagrados: ${got}/${need} — procure nas masmorras: ${(__Q.get(S, "pjL", []) || []).filter((l) => !__Q.get(S, "pjG_" + l)).map((l) => St(`lvl.${l}`, ki[l]?.name ?? l)).join(", ")}.`] } },
  { id: "bispo", title: "O Bispo e a Freira", st: (S) => { const s = __Q.get(S, "bp"); return !s ? null : s === 9 ? ["done", "O bispo mostrou quem era. A freira está em paz."] : s === 8 ? ["done", "Você confiou no bispo… e pagou o preço."] : ["on", "Fale com o bispo e com a freira no Coração da Floresta."] } },
  { id: "lamina", title: "A Lâmina Faminta", st: (S) => { const s = __Q.get(S, "mc"); if (!s) return null; const k = __Q.get(S, "mcK"); return s === 3 ? ["done", "A lâmina se curvou à sua vontade."] : s === 4 ? ["done", "A lâmina foi purificada."] : ["on", `Mortes alimentadas: ${k}. ${k >= 80 ? "Ela sussurra… fale com a Guardiã." : "A lâmina cresce a cada morte."}`] } },
  { id: "crianca", title: "A Criança Perdida", st: (S) => { const s = __Q.get(S, "ck"); return !s ? null : s === 3 ? ["done", "O menino voltou para casa."] : s === 2 ? ["on", "O menino caiu… o fantasma dele vaga pelo Coração da Floresta."] : s === 4 ? ["done", "O menino não sobreviveu… o fantasma dele encontrou paz."] : ["on", "Leve o menino em segurança até o fim da masmorra."] } },
];
function __qDiary(S) {
  const ui = S.scene.get("UI"); if (!ui || ui.__qDia) return;
  const F = "Georgia, 'Times New Roman', serif", R = ui.add.container(0, 0).setDepth(9850); ui.__qDia = R;
  const W = Math.min(520, _ - 40), H = Math.min(330, st - 40), x0 = (_ - W) / 2, y0 = (st - H) / 2;
  R.add(ui.add.rectangle(_ / 2, st / 2, _ * 1.3, st * 1.3, 0, .6).setInteractive());
  const bg = ui.add.graphics(); bg.fillStyle(0x140d08, .97).fillRoundedRect(x0, y0, W, H, 10); bg.lineStyle(2, 0x8a6a30, 1).strokeRoundedRect(x0, y0, W, H, 10); R.add(bg);
  R.add(ui.add.text(_ / 2, y0 + 16, __L3("DIÁRIO DE MISSÕES", "QUEST JOURNAL", "DIARIO DE MISIONES"), { fontFamily: F, fontStyle: "bold", fontSize: "15px", color: "#f2d98a" }).setOrigin(.5, 0));
  let y = y0 + 44; const rows = __QLIST.map((q) => [q, q.st(S)]).filter(([, s]) => s);
  if (!rows.length) R.add(ui.add.text(_ / 2, y + 30, __L3("Nenhuma missão ainda. Explore e converse com quem encontrar.", "No quests yet.", "Sin misiones aún."), { fontFamily: F, fontSize: "11px", color: "#cfc2a6" }).setOrigin(.5, 0));
  for (const [q, [state, txt]] of rows.sort((a, b) => (a[1][0] === "on" ? 0 : 1) - (b[1][0] === "on" ? 0 : 1))) {
    const done = state === "done";
    R.add(ui.add.text(x0 + 18, y, (done ? "✓ " : "◆ ") + q.title, { fontFamily: F, fontStyle: "bold", fontSize: "12px", color: done ? "#8fcf8a" : "#ffd27a" }));
    const t = ui.add.text(x0 + 34, y + 16, txt, { fontFamily: F, fontSize: "10px", color: done ? "#9a9488" : "#e8dcc0", wordWrap: { width: W - 52 } }); R.add(t);
    y += 22 + t.height + 6;
  }
  R.add(ui.add.text(_ / 2, y0 + H - 18, __L3("[L] / B ou toque para fechar", "[L] / B or tap to close", "[L] / B o toca para cerrar"), { fontFamily: F, fontSize: "9px", color: "#8a7f66" }).setOrigin(.5));
  const was = !!S.uiOpen; S.uiOpen = !0; try { S.physics?.pause?.() } catch (e) {}
  const close = () => { if (!ui.__qDia) return; R.destroy(); ui.__qDia = null; window.removeEventListener("keydown", kd); S.uiOpen = was; try { was || S.physics?.resume?.() } catch (e) {} S.__uiClosedAt = performance.now() };
  const kd = (e) => { if (e.key === "l" || e.key === "L" || e.key === "Escape") close() };
  setTimeout(() => window.addEventListener("keydown", kd), 50);
  R.list[0].on("pointerdown", close);
}
{
  window.addEventListener("keydown", (e) => {
    if (e.key !== "l" && e.key !== "L") return;
    try { const S = window.__DED_GAME?.scene?.getScene("Game"); if (!S?.scene?.isActive() || !__Q.camp(S) || S.uiOpen) return; __qDiary(S) } catch (er) {}
  });
}
{
  // controle: direcional esquerdo (botão 14, livre no mapeamento padrão) abre o diário na campanha
  let pv14 = false;
  const loop = () => {
    requestAnimationFrame(loop);
    try {
      const g = Array.from(navigator.getGamepads?.() ?? []).find((q) => q && q.connected); if (!g) { pv14 = false; return }
      const on = !!(g.buttons[14]?.pressed || (g.buttons[14]?.value ?? 0) > 0.5);
      if (on && !pv14) { const S = window.__DED_GAME?.scene?.getScene("Game"); if (S?.scene?.isActive() && S.state === "playing" && __Q.camp(S) && !S.uiOpen) __qDiary(S) }
      pv14 = on;
    } catch (e) {}
  };
  typeof requestAnimationFrame === "function" && requestAnimationFrame(loop);
}
/* botão do diário no HUD (toque) */
function __qDiaryBtn(S) {
  const ui = S.scene.get("UI"); if (!ui || ui.__qBtn?.active) return;
  const b = ui.add.text(_ - 10, 64, "DIÁRIO [L / ◀]", { fontFamily: "Georgia, serif", fontStyle: "bold", fontSize: "10px", color: "#f2d98a", backgroundColor: "#140d08cc", padding: { x: 5, y: 3 } }).setOrigin(1, 0).setDepth(120).setInteractive({ useHandCursor: !0 });
  b.on("pointerdown", () => { try { __Q.camp(S) && !S.uiOpen && __qDiary(S) } catch (e) {} });
  ui.__qBtn = b;
  S.events.once("shutdown", () => { b.destroy(); ui.__qBtn = null });
}
/* ─── bônus permanentes e temporários (recalculados com os atributos) ─── */
{
  const RC = Eh.prototype.recompute;
  Eh.prototype.recompute = function () {
    const r = RC.apply(this, arguments);
    try {
      const S = this.scene; if (!__Q.camp(S)) return r;
      const t = this.total, n = __Q.n(S); let dm = 1, hp = 1;
      if (__Q.get(S, "irm") === 2) dm *= 1.08;
      if (__Q.get(S, "pj") === 3) hp *= 1.12;
      if (__Q.get(S, "bpBless", -1) === n) dm *= 1.2;
      if (__Q.get(S, "bpCurse", -1) === n) hp *= .85;
      if (__Q.get(S, "bp") === 9) t.critChance = (t.critChance ?? 0) + 5;
      const mc = __Q.get(S, "mc"); if (mc) dm *= 1 + (mc === 3 ? .4 : mc === 4 ? .1 : Math.min(40, __Q.get(S, "mcK") / 2) / 100);
      if (dm !== 1) { t.damage = Math.max(1, Math.round(t.damage * dm)); t.magicDamage = Math.round((t.magicDamage ?? 0) * dm) }
      if (hp !== 1) t.maxHp = Math.max(1, Math.round(t.maxHp * hp));
      const e = S.player; e && (e.maxHp = t.maxHp, e.hp = Math.min(e.hp, e.maxHp), S.game.events.emit("hud:hp", e.hp, e.maxHp));
      S.game.events.emit("rpg:stats", t);
    } catch (e) {}
    return r;
  };
}
/* ═════ 1. Laço dos Irmãos ═════ */
function __qIrmStart(S) {
  const bro = __QBRO[__Q.cls(S)], bn = (__HN[bro] ?? "").toUpperCase();
  __dlg(S, [
    __Q.G("Espere. Uma carta atravessou um dos portais. Está selada com um brasão que você conhece."),
    __Q.H(S, `É a letra do ${bn === "AKIHIRO" ? "meu irmão mais velho" : "meu irmão"}… ${bn}.`, "special"),
    { name: "CARTA DE " + bn, text: `"Encontrei um templo nas Profundezas com o símbolo do nosso clã. Algo vive no santuário. Não consigo sozinho. Venha."` },
    __Q.G("O templo fica além do último selo que você fechou. Vou abrir o caminho. Tragam um ao outro de volta.", "calm"),
  ], () => { __Q.set(S, "irm", 1); S.requestSave?.(10); __qGo(S, "templo") });
}
function __qTemplo(S) {
  if (__Q.get(S, "irm") !== 1) return;
  const bro = __QBRO[__Q.cls(S)], bn = (__HN[bro] ?? "").toUpperCase(), who = "hero-" + bro.toLowerCase();
  // o irmão espera na porta do santuário
  const x = 52 * dt + 16, y = 14 * dt + 24; // no Altar, diante da porta do santuário
  let rig = null, cont = null;
  try { rig = new Qe(S, pe[bro], { x, y, scale: .62, isPreview: !0 }); cont = rig.container; cont.setDepth(y) } catch (e) {
    cont = S.add.image(x, y, "hero-" + bro.toLowerCase() + "-hud").setScale(.5).setDepth(y);
  }
  let met = !1, help = null;
  const U = (t, ms) => {
    if (!cont?.active || !S.player) return;
    const P = S.player, d = Math.hypot(P.x - cont.x, P.y - cont.y);
    if (!met && d < 120 && !S.uiOpen) {
      met = !0;
      __dlg(S, [
        { who, expr: "smile", name: bn, text: "Você veio. Eu sabia que viria." },
        __Q.H(S, "Nunca deixaria você sozinho. Nem aqui, nem em lugar nenhum."),
        { who, expr: "talk", name: bn, text: "O guardião do santuário é um tengu. O mesmo espírito das histórias do nosso avô." },
        { who, expr: "aggression", name: bn, text: "Juntos, como no dojo. Eu cubro as suas costas." },
      ]);
    }
    if (met) { // segue o herói um pouco atrás
      const tx = P.x - 34, ty = P.y + 10, dx = tx - cont.x, dy = ty - cont.y, dd = Math.hypot(dx, dy);
      if (dd > 24) { const sp = Math.min(dd * 3, 170) * ms / 1000; cont.x += dx / dd * sp; cont.y += dy / dd * sp }
      cont.setDepth(cont.y); rig?.setFlip?.(dx < 0);
    }
    // ataque do irmão contra o chefe
    const b = S.boss;
    if (met && b?.active && !b.dead && b.typeKey === "RIVER_TENGU") {
      help = (help ?? 1200) - ms;
      if (help <= 0) {
        help = 2600;
        const dmg = Math.max(2, Math.round(b.maxHp * .035));
        try {
          if (bro === "ARCHER") { const g = S.add.graphics().setDepth(9000); g.lineStyle(2, 0xfff2c0, 1).lineBetween(cont.x, cont.y - 20, b.x, b.y - 20); S.tweens.add({ targets: g, alpha: 0, duration: 220, onComplete: () => g.destroy() }) }
          else S.effects?.slash?.(b.x, b.y - 10, Math.random() * 6, 0xb0d8ff);
          S.effects?.burstTinted?.(b.x, b.y - 16, 0xffe6a0, 10);
          b.takeDamage(dmg, { x: 0, y: 0 });
          S.effects?.floatText?.(b.x, b.y - 40, `${bn} ${dmg}`, "#ffd27a", 9);
        } catch (e) {}
      }
    }
  };
  S.events.on("update", U); S.events.once("shutdown", () => S.events.off("update", U));
  const on = (b) => {
    if (b?.typeKey !== "RIVER_TENGU") return;
    __Q.set(S, "irm", 2); S.stats.recompute(); S.requestSave?.(10);
    S.time.delayedCall(1200, () => S.scene.isActive() && __dlg(S, [
      { who, expr: "smile", name: bn, text: "Conseguimos… como quando éramos crianças, lembra?" },
      __Q.H(S, "Lembro. Você sempre chegava atrasado.", "smile"),
      { who, expr: "talk", name: bn, text: "Vou seguir pelos meus próprios portais. Mas leve isto: o laço do nosso clã. Vai deixar seus golpes mais fortes." },
    ], () => S.game.events.emit("ui:banner", "LAÇO DOS IRMÃOS: +8% DE DANO", "#ffd27a")));
  };
  S.game.events.on("boss:defeated", on); S.events.once("shutdown", () => S.game.events.off("boss:defeated", on));
}
/* ═════ 2. O Último Pajé ═════ */
const __PJOBJ = [["maraca", "Maracá Sagrado", "O chocalho que acorda os espíritos."], ["muiraquita", "Muiraquitã", "A pedra verde em forma de sapo, amuleto dos rios."], ["cuia", "Cuia de Ervas", "A cuia onde o pajé misturava as ervas do selo."]];
function __qPajeHub(S) {
  const s = __Q.get(S, "pj"); if (s === 3) return;
  const [x, y] = __Q.hubPos(S, 150, 70);
  const logs = S.textures.exists("paje-logs") ? S.add.image(x, y + 2, "paje-logs", 0).setOrigin(.5, 1).setScale(1).setDepth(y - 2) : null;
  const npc = __qNpc(S, "paje", x, y, { idle: "paje-talk", talk: "paje-talk", label: "Falar com o pajé", onTalk: () => __qPajeTalk(S, npc) });
  npc?.spr.setFrame(16);
}
function __qPajeTalk(S, npc) {
  const s = __Q.get(S, "pj"), ara = __Q.cls(S) === "SHAMAN", P = (t, e = "talk") => __Q.N("paje", "O PAJÉ", t, e);
  if (!s) {
    const L = ara ? [
      P("Kunhã… filha da mata. Eu sentia o seu cheiro de urucum desde o outro lado do portal.", "smile"),
      __Q.H(S, "Avô? O senhor é… um dos pajés do igapó?", "special"),
      P("O último que sobrou. Quando começaram a construir portais novos, o nosso selo velho rachou. Atravessei para segurá-lo."),
      P("Roubaram as três coisas sagradas do ritual. Sem elas, não consigo fechar a rachadura.", "sadness"),
    ] : [
      P("Hm. Mais um forasteiro tocado pelas Profundezas.", "calm"),
      __Q.H(S, "Quem é o senhor?"),
      P("Um velho que segura uma porta que não quer ficar fechada. Roubaram as coisas sagradas do meu ritual.", "sadness"),
      P("Se as encontrar pelo caminho, traga para mim. Talvez você sirva para alguma coisa.", "aggression"),
    ];
    __dlg(S, L, () => {
      // espalha os objetos em masmorras ainda não seladas
      const open = __HUBD.filter((id) => !__isPortalDone(S, id)), pref = ["rio", "bosque", "morta"];
      const lv = [...pref.filter((l) => open.includes(l)), ...open.filter((l) => !pref.includes(l))].slice(0, 3);
      __Q.set(S, "pjL", lv); __Q.set(S, "pj", 1); S.requestSave?.(10);
      S.game.events.emit("ui:banner", "NOVA MISSÃO: O ÚLTIMO PAJÉ (L ou ◀ no controle para o diário)", "#9fe0a8");
    });
    return;
  }
  const lv = __Q.get(S, "pjL", []) || [], got = lv.filter((l) => __Q.get(S, "pjG_" + l)).length;
  if (got < lv.length) { __dlg(S, [P(`Ainda faltam ${lv.length - got}. A mata espera.`, "calm")]); return }
  // ritual
  __dlg(S, [P(ara ? "Tudo aqui. Segure o maracá comigo, kunhã. Cante comigo." : "Tudo aqui… você trouxe mesmo. Afaste-se.", "special")], () => {
    // grava primeiro: o efeito visual nunca pode impedir a conclusão
    __Q.set(S, "pj", 3); S.requestSave?.(10);
    try { S.stats.recompute() } catch (e) {}
    const x = npc?.spr?.x ?? S.player.x, y = npc?.spr?.y ?? S.player.y;
    try { __FX.tex(S); for (let k = 0; k < 4; k++) S.time.delayedCall(k * 350, () => { try { __FX.ring(S, x, y - 10, 0x9ce64e, 60 + k * 30, 700, y + 2) } catch (e) {} }); __FX.impact(S, x, y - 30, "poison", 1.6) } catch (e) {}
    try { S.cameras.main.shake(500, .006) } catch (e) {}
    const fin = () => {
      if (!S.scene.isActive()) return;
      const L = [P("O igapó respira de novo. Leve a bênção da mata: ela vai segurar a sua vida como segurou a minha.", "smile")];
      ara && L.push(P("E ouça, kunhã: quem constrói os portais novos usa o mesmo símbolo do castelo. O olho. Cuidado com ele.", "aggression"), __Q.H(S, "O Observador…", "sadness"));
      __dlg(S, L, () => {
        S.game.events.emit("ui:banner", "BÊNÇÃO DA MATA: +12% DE VIDA MÁXIMA", "#9fe0a8");
        npc && S.tweens.add({ targets: [npc.spr, npc.sh], alpha: 0, duration: 1200, onComplete: () => npc.destroy() });
      });
    };
    setTimeout(fin, 1600);
  });
}
function __qPajeLevel(S) {
  if (__Q.get(S, "pj") !== 1) return;
  const lv = __Q.get(S, "pjL", []) || [], idx = lv.indexOf(S.levelId);
  if (idx < 0 || __Q.get(S, "pjG_" + S.levelId)) return;
  const [, name, desc] = __PJOBJ[idx];
  const rooms = S.dungeon.level.rooms.filter((r) => r.rect && !r.boss && !r.hub);
  const rm = rooms[Math.min(rooms.length - 1, 1 + (rooms.length > 3 ? 1 : 0))] || rooms[0]; if (!rm) return;
  let c = rm.rect.x + (rm.rect.w >> 1), r = rm.rect.y + (rm.rect.h >> 1);
  for (let k = 0; k < 30 && S.dungeon.isWallTile(c, r); k++) { c = rm.rect.x + 1 + (Math.random() * (rm.rect.w - 2) | 0); r = rm.rect.y + 1 + (Math.random() * (rm.rect.h - 2) | 0) }
  const x = c * dt + 16, y = r * dt + 16;
  const gl = S.add.image(x, y - 6, "light").setBlendMode(j.BlendModes.ADD).setTint(0x9ce64e).setScale(.25).setAlpha(.6).setDepth(y + 1);
  S.tweens.add({ targets: gl, alpha: .25, scale: .32, duration: 800, yoyo: !0, repeat: -1 });
  const ic = S.add.text(x, y - 8, "✦", { fontFamily: "Georgia, serif", fontSize: "18px", color: idx === 0 ? "#ffd27a" : idx === 1 ? "#7fe0a0" : "#e0b080", stroke: "#1a3010", strokeThickness: 3 }).setOrigin(.5).setDepth(y + 2);
  S.tweens.add({ targets: ic, y: y - 14, duration: 900, yoyo: !0, repeat: -1, ease: "Sine.easeInOut" });
  const z = S.add.zone(x, y, 4, 4); z.interactLabel = "Pegar: " + name; S.dungeon.objects.push(z);
  z.interact = () => {
    __Q.set(S, "pjG_" + S.levelId, 1); S.requestSave?.(10);
    gl.destroy(); ic.destroy(); const i = S.dungeon.objects.indexOf(z); i >= 0 && S.dungeon.objects.splice(i, 1);
    S.effects?.burstTinted?.(x, y, 0x9ce64e, 18);
    S.game.events.emit("ui:banner", `OBJETO SAGRADO: ${name.toUpperCase()}`, "#9fe0a8");
    __dlg(S, [{ name, text: desc + " (Leve ao pajé no Coração da Floresta.)" }]);
  };
}
/* ═════ 3. O Bispo e a Freira ═════ */
function __qBispoHub(S) {
  const s = __Q.get(S, "bp"); if (s >= 8) return;
  const [bx, by] = __Q.hubPos(S, -170, 60), [fx, fy] = __Q.hubPos(S, -235, 72);
  const B = (t, e = "talk") => __Q.N("bispo", "O BISPO", t, e), Fr = (t, e = "talk") => __Q.N("freira", "A FREIRA", t, e);
  const bispo = __qNpc(S, "bispo", bx, by, { scale: .62, label: "Falar com o bispo", onTalk: () => {
    const st = __Q.get(S, "bp");
    if (st === 0) { __Q.set(S, "bp", 1); __dlg(S, [B("Filho das Profundezas… a fé pode guiar sua lâmina.", "smile"), B("Por uma pequena oferta de 40 moedas, abençoo seu próximo portal. Seus golpes cairão como a ira divina.")], () => offer()); return }
    offer();
  } });
  const offer = () => {
    const n = __Q.n(S);
    if (__Q.get(S, "bpBless", -1) === n) { __dlg(S, [B("A bênção já está com você. Vá.", "calm")]); return }
    __wqAsk(S, ["Pagar 40 de ouro pela bênção", "Agora não"], (k) => {
      if (k) return;
      if ((S.stats?.gold ?? 0) < 40) { __dlg(S, [B("A fé não aceita bolsos vazios.", "calm")]); return }
      S.stats.addGold(-40); __Q.set(S, "bpBless", n); S.stats.recompute(); S.requestSave?.(10);
      S.game.events.emit("ui:banner", "BÊNÇÃO DO BISPO: +20% DE DANO NO PRÓXIMO PORTAL", "#ffe6a0");
      __dlg(S, [B("Que a luz caminhe ao seu lado.", "smile")]);
    });
  };
  const freira = __qNpc(S, "freira", fx, fy, { scale: .8, label: "Falar com a freira", onTalk: () => {
    const st = __Q.get(S, "bp");
    if (st < 1) { __dlg(S, [Fr("…", "calm")]); return }
    __dlg(S, [
      Fr("(sussurrando) Não fale alto. Ele escuta tudo.", "sadness"),
      Fr("Aquele não é um homem de fé. Vi o olho bordado por dentro do manto dele. O mesmo olho do castelo.", "aggression"),
      Fr("Cada bênção que ele vende amarra a sua alma a alguém que observa. Em quem você acredita?", "talk"),
    ], () => __wqAsk(S, ["Acreditar na freira e confrontar o bispo", "Acreditar no bispo"], (k) => {
      if (k === 1) {
        __Q.set(S, "bp", 8); __Q.set(S, "bpCurse", __Q.n(S)); S.stats.recompute(); S.requestSave?.(10);
        __dlg(S, [B("Sábia escolha, filho. Ela vai deixar o templo hoje mesmo.", "smile")], () => {
          freira && S.tweens.add({ targets: [freira.spr, freira.sh], alpha: 0, duration: 900, onComplete: () => freira.destroy() });
          S.time.delayedCall(1200, () => { if (!S.scene.isActive()) return; __dlg(S, [B("Hehehe… o Observador agradece a sua confiança.", "aggression")], () => { S.game.events.emit("ui:banner", "MALDIÇÃO: −15% DE VIDA ATÉ O PRÓXIMO SELO", "#e05a4a"); S.tweens.add({ targets: [bispo.spr, bispo.sh], alpha: 0, duration: 900, onComplete: () => bispo.destroy() }) }) });
        });
        return;
      }
      __dlg(S, [__Q.H(S, "Bispo! Mostre o que está bordado no seu manto."), B("…Menina tola. Então que vejam o olho de verdade!", "aggression")], () => __qBispoFight(S, bispo, freira));
    }));
  } });
}
function __qBispoFight(S, bispo, freira) {
  const x = bispo.spr.x, y = bispo.spr.y;
  try { __FX.tex(S); __FX.impact(S, x, y - 30, "holy", 2.2); __FX.ring(S, x, y, 0xffe6a0, 120, 600, y + 4) } catch (e) {}
  S.cameraSys?.shake?.(.012, 400);
  bispo.destroy();
  if (!Yt.BISPO_CAIDO) {
    Yt.BISPO_CAIDO = { ...Yt.ABYSS_GUARDIAN, name: "Bispo do Olho", subtitle: "Servo do Observador", texture: "bispo", scale: 1, bodySize: 26, maxHp: 95, contactDamage: 2, speed: 58, xp: 700, gold: { min: 90, max: 160 }, summons: !0, attackCooldownMs: 1500,
      attacks: { SLAM: { damage: 3, range: 62, width: 74, telegraphMs: 600, recoverMs: 520 }, SHOCKWAVE: { damage: 3, radius: 118, telegraphMs: 800, recoverMs: 650 } },
      phase2: { hpRatio: .5, speedMult: 1.3, cooldownMult: .62, damageMult: 1.3, radiusMult: 1.3, tint: 0xffd27a },
      anims: { idle: {}, walk: {}, attack: {}, strike: {}, windup: {}, hurt: {}, death: {}, phase: {} } };
  }
  const b = S.spawnBoss("BISPO_CAIDO", x, y, {});
  try { const hr = [...S.roomManager.byId.values()].find((r) => r.def?.hub); hr && (b.arenaBounds = S.roomManager.arenaBoundsFor(hr)) } catch (e) {}
  S.game.events.emit("boss:spawned", b.data_.name, b.data_.subtitle);
  const on = (bb) => {
    if (bb?.typeKey !== "BISPO_CAIDO") return;
    S.game.events.off("boss:defeated", on);
    __Q.set(S, "bp", 9); S.stats.recompute(); S.requestSave?.(10);
    S.time.delayedCall(1500, () => S.scene.isActive() && __dlg(S, [
      __Q.N("freira", "A FREIRA", "Você acreditou em mim… obrigada. Que a verdadeira luz guie seus golpes.", "smile"),
    ], () => { S.game.events.emit("ui:banner", "BÊNÇÃO DA FREIRA: +5% DE CRÍTICO", "#ffe6a0"); freira && S.tweens.add({ targets: [freira.spr, freira.sh], alpha: 0, duration: 1200, onComplete: () => freira.destroy() }) }));
  };
  S.game.events.on("boss:defeated", on); S.events.once("shutdown", () => S.game.events.off("boss:defeated", on));
}
/* ═════ 4. A Lâmina Faminta ═════ */
function __qMercHub(S) {
  if (__Q.get(S, "mc")) return;
  const [x, y] = __Q.hubPos(S, 150, -50);
  let npc = null;
  try { npc = __vendorNpc(S, x, y, y) } catch (e) {}
  npc && npc.setTint(0xb8a0d0);
  const sh = npc ? null : S.add.text(x, y - 20, "†", { fontFamily: "Georgia, serif", fontSize: "18px", color: "#c0a0ff" }).setOrigin(.5).setDepth(y);
  const z = S.add.zone(x, y, 4, 4); z.interactLabel = "Falar com o mercador encapuzado"; S.dungeon.objects.push(z);
  const M = (t, e) => ({ name: "MERCADOR ENCAPUZADO", text: t });
  z.interact = () => {
    __dlg(S, [M("Psst… você parece alguém que precisa de uma lâmina que nunca cansa."), M("A Lâmina Faminta. Fica mais forte a cada vida que toma. 60 moedas e ela é sua. Sem devoluções.")], () =>
      __wqAsk(S, ["Comprar a Lâmina Faminta (60 de ouro)", "Recusar"], (k) => {
        if (k) { __dlg(S, [M("Hm. Voltarei a te oferecer… se você sobreviver.")]); return }
        if ((S.stats?.gold ?? 0) < 60) { __dlg(S, [M("Sem moedas, sem lâmina.")]); return }
        S.stats.addGold(-60); __Q.set(S, "mc", 1); __Q.set(S, "mcK", 0); S.stats.recompute(); S.requestSave?.(10);
        S.game.events.emit("ui:banner", "A LÂMINA FAMINTA: +0,5% DE DANO POR MORTE (ATÉ +40%)", "#c0a0ff");
        __dlg(S, [M("Hehe… alimente-a bem.")], () => { npc?.destroy?.(); sh?.destroy(); const i = S.dungeon.objects.indexOf(z); i >= 0 && S.dungeon.objects.splice(i, 1) });
      }));
  };
}
function __qMercKill(S) {
  if (__Q.get(S, "mc") !== 1) return;
  const k = __Q.set(S, "mcK", __Q.get(S, "mcK") + 1);
  k % 4 === 0 && S.stats.recompute();
  k === 80 && S.game.events.emit("ui:banner", "A LÂMINA COMEÇOU A SUSSURRAR…", "#c0a0ff");
}
function __qMercWhisper(S) {
  if (__Q.get(S, "mc") !== 1) return;
  let acc = 0;
  const U = (t, ms) => {
    if (__Q.get(S, "mc") !== 1 || __Q.get(S, "mcK") < 80 || S.uiOpen || !S.player || S.player.dead || S.levelId === "forest") return;
    acc += ms; if (acc < 22000) return; acc = 0;
    try { S.damageSystem.apply({ source: S.player, target: S.player, amount: 1, dir: { x: 0, y: 0 } }) } catch (e) {}
    __say(S, S.player.x, S.player.y - 40, pickW(), "#c0a0ff", 2600, S.player);
  };
  const W = ["…mais… dê-me mais…", "…ele nos observa…", "…sangue… só mais um pouco…", "…você é meu…"], pickW = () => W[Math.random() * W.length | 0];
  S.events.on("update", U); S.events.once("shutdown", () => S.events.off("update", U));
}
function __qMercGuard(S) {
  __dlg(S, [__Q.G("Essa lâmina… ela fala com você, não fala? Sinto a fome dela daqui.", "aggression"), __Q.G("Posso purificá-la — ela perde a fome, mas guarda um pouco da força. Ou você enfrenta o espírito dentro dela e a domina.", "calm")], () =>
    __wqAsk(S, ["Purificar a lâmina", "Enfrentar o espírito da lâmina"], (k) => {
      if (!k) { __Q.set(S, "mc", 4); S.stats.recompute(); S.requestSave?.(10); try { __FX.ring(S, S.player.x, S.player.y, 0xffe6a0, 80, 700, S.player.y + 4) } catch (e) {} S.game.events.emit("ui:banner", "LÂMINA PURIFICADA: +10% DE DANO", "#ffe6a0"); return }
      if (!Yt.ESPIRITO_LAMINA) Yt.ESPIRITO_LAMINA = { ...Yt.REAPER, name: "Espírito da Lâmina", subtitle: "A Fome", maxHp: 85, xp: 600 };
      const x = S.player.x + 90, y = S.player.y - 20, b = S.spawnBoss("ESPIRITO_LAMINA", x, y, {});
      b.setTint(0xc060ff);
      try { const hr = [...S.roomManager.byId.values()].find((r) => r.def?.hub); hr && (b.arenaBounds = S.roomManager.arenaBoundsFor(hr)) } catch (e) {}
      S.game.events.emit("boss:spawned", b.data_.name, b.data_.subtitle);
      const on = (bb) => { if (bb?.typeKey !== "ESPIRITO_LAMINA") return; S.game.events.off("boss:defeated", on); __Q.set(S, "mc", 3); S.stats.recompute(); S.requestSave?.(10); S.game.events.emit("ui:banner", "LÂMINA DOMINADA: +40% DE DANO", "#c0a0ff") };
      S.game.events.on("boss:defeated", on); S.events.once("shutdown", () => S.game.events.off("boss:defeated", on));
    }));
}
/* ═════ 5. A Criança Perdida ═════ */
function __qKidLevel(S) {
  if (__Q.get(S, "ck") !== 0 || __Q.n(S) < 6 || !__HUBD.includes(S.levelId)) return;
  const sp = S.dungeon.level.playerSpawn, x = sp.col * dt + 70, y = sp.row * dt + 10;
  const K = (t, e = "talk") => __Q.N("menino", "MENINO", t, e);
  let hp = 6, follow = !1, hurtCd = 0;
  const npc = __qNpc(S, "menino", x, y, { scale: .5, label: "Falar com o menino", onTalk: () => {
    if (follow) return;
    __dlg(S, [K("(soluçando) Eu… eu me perdi. Entrei atrás do meu cachorro e a porta sumiu.", "sadness"), __Q.H(S, "Fique perto de mim. Vou te tirar daqui."), K("Promete?", "special")], () => {
      follow = !0; __Q.set(S, "ck", 1); S.requestSave?.(10); S.game.events.emit("ui:banner", "ESCOLTA: MANTENHA O MENINO VIVO ATÉ O CHEFE CAIR", "#ffd27a");
      const i = S.dungeon.objects.indexOf(npc.zone); i >= 0 && S.dungeon.objects.splice(i, 1);
    });
  } });
  if (!npc) return;
  const s = npc.spr; s.__lock = 1; s.play("menino-idle");
  const bar = S.add.graphics().setDepth(9001);
  const U = (t, ms) => {
    if (!s.active || !S.player) return;
    const P = S.player; bar.clear();
    if (!follow) { s.setFlipX(P.x < s.x); return }
    const dt_ = ms / 1000, tx = P.x - (P.flipX ? -28 : 28), ty = P.y + 8, dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy);
    let sp = 0; if (d > 18) { sp = d > 90 ? 175 : 95; s.x += dx / d * sp * dt_; s.y += dy / d * sp * dt_ }
    const want = sp > 120 ? "menino-run" : sp > 0 ? "menino-walk" : "menino-idle";
    s.anims.currentAnim?.key !== want && s.play(want); Math.abs(dx) > 2 && s.setFlipX(dx < 0);
    s.setDepth(s.y); npc.sh.setPosition(s.x, s.y);
    // inimigos encostados machucam o menino
    hurtCd -= ms;
    if (hurtCd <= 0) for (const e of S.enemies?.getChildren?.() ?? []) if (e.active && !e.dead && Math.hypot(e.x - s.x, e.y - s.y) < 26) { hp--; hurtCd = 900; s.setTint(0xff6060); S.time.delayedCall(150, () => s.active && s.clearTint()); S.effects?.floatText?.(s.x, s.y - 34, "-1", "#ff8080", 9); break }
    bar.fillStyle(0x000000, .6).fillRect(s.x - 13, s.y - 44, 26, 4); bar.fillStyle(0x8ae08a, 1).fillRect(s.x - 12, s.y - 43, 24 * hp / 6, 2);
    if (hp <= 0) {
      follow = !1; __Q.set(S, "ck", 2); S.requestSave?.(10); S.events.off("update", U); bar.destroy();
      s.play("menino-hurt"); S.tweens.add({ targets: [s, npc.sh], alpha: 0, duration: 1400, delay: 400, onComplete: () => npc.destroy() });
      S.game.events.emit("ui:banner", "O MENINO CAIU…", "#e05a4a");
    }
  };
  S.events.on("update", U); S.events.once("shutdown", () => { S.events.off("update", U); bar.destroy() });
  const on = () => { if (follow && hp > 0) { __Q.set(S, "ck", 3); __Q.frag(60); S.stats.addGold(80); S.requestSave?.(10); S.time.delayedCall(1800, () => S.scene.isActive() && __dlg(S, [K("Você cumpriu a promessa! Vou contar pra todo mundo da vila!", "smile")], () => S.game.events.emit("ui:banner", "+60 CRISTAIS DO REFÚGIO · +80 OURO", "#ffd27a"))) } };
  S.game.events.on("boss:defeated", on); S.events.once("shutdown", () => S.game.events.off("boss:defeated", on));
}
function __qKidGhost(S) {
  if (__Q.get(S, "ck") !== 2) return;
  const [x, y] = __Q.hubPos(S, 50, 100);
  const npc = __qNpc(S, "menino", x, y, { scale: .5, tint: 0x9fdcff, alpha: .6, ghost: !0, label: "Falar com o fantasma do menino", onTalk: () => {
    __dlg(S, [__Q.N("menino", "FANTASMA DO MENINO", "Você prometeu…", "sadness"), __Q.H(S, "Me perdoe. Eu não fui rápido o bastante.", "sadness"), __Q.N("menino", "FANTASMA DO MENINO", "…Tudo bem. Meu cachorro estava me esperando do outro lado. Agora eu sei o caminho.", "smile")], () => {
      __Q.set(S, "ck", 4); S.requestSave?.(10); S.tweens.add({ targets: [npc.spr, npc.sh, npc.gl], alpha: 0, y: "-=20", duration: 1600, onComplete: () => npc.destroy() });
    });
  } });
}
/* ═════ 6. Contratos do Abismo (modo infinito) ═════ */
const __QCON = [
  { id: "kill", txt: (g) => `Derrote ${g} inimigos nesta profundidade`, goal: (d) => 10 + Math.min(20, d), ok: (c) => c.kills >= c.goal, rw: 12 },
  { id: "nohit", txt: () => "Termine a profundidade sem levar dano", goal: () => 0, ok: (c) => !c.hit, rw: 25 },
  { id: "fast", txt: (g) => `Termine a profundidade em menos de ${g}s`, goal: (d) => 120 + d * 4, ok: (c) => (c.t1 - c.t0) / 1000 <= c.goal, rw: 18 },
  { id: "elite", txt: (g) => `Derrote ${g} elite${g > 1 ? "s" : ""}`, goal: (d) => d < 6 ? 1 : 2, ok: (c) => c.elites >= c.goal, rw: 15 },
];
function __qContract(S) {
  const run = S.endlessRun?.(); if (!run) return;
  const d = run.depth ?? 1, def = __QCON[(d * 7 + (run.seed ? String(run.seed).length : 0)) % __QCON.length];
  const c = S.__qCon = { def, goal: def.goal(d), kills: 0, elites: 0, hit: !1, t0: S.time.now, done: !1, rw: def.rw + Math.floor(d / 3) * 3 };
  const ui = S.scene.get("UI");
  const txt = ui?.add?.text(_ / 2, 52, "", { fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "bold", fontSize: "10px", color: "#e8d090", stroke: "#000", strokeThickness: 3, align: "center" }).setOrigin(.5, 0).setDepth(110);
  const paint = () => { if (!txt?.active) return; const p = def.id === "kill" ? ` (${c.kills}/${c.goal})` : def.id === "elite" ? ` (${c.elites}/${c.goal})` : def.id === "nohit" && c.hit ? " ✗" : ""; txt.setText(`◆ ${__L3("Contrato", "Contract", "Contrato")}: ${def.txt(c.goal)}${p} · ✦${c.rw}`).setColor(c.done ? "#8fcf8a" : def.id === "nohit" && c.hit ? "#c07060" : "#e8d090") };
  paint(); S.time.delayedCall(900, () => S.scene.isActive() && S.game.events.emit("ui:banner", "CONTRATO: " + def.txt(c.goal).toUpperCase(), "#e8d090"));
  const onDie = (e) => { if (S.__qCon !== c || c.done) return; c.kills++; e?.isElite && c.elites++; e?.elite && c.elites++; paint() };
  S.game.events.on("enemy:died", onDie);
  c.paint = paint;
  // recompensa quando o portal da profundidade aparece
  const rm = S.roomManager, sp0 = rm.spawnEndlessPortal;
  rm.spawnEndlessPortal = function () {
    const r = sp0.apply(this, arguments);
    try { if (!c.done) { c.t1 = S.time.now; if (def.ok(c)) { c.done = !0; __Q.frag(c.rw); S.game.events.emit("ui:banner", `CONTRATO CUMPRIDO: +${c.rw} CRISTAIS DO REFÚGIO`, "#8fcf8a") } else { c.done = !0; S.game.events.emit("ui:banner", "CONTRATO PERDIDO", "#c07060") } paint() } } catch (e) {}
    return r;
  };
  S.events.once("shutdown", () => { S.game.events.off("enemy:died", onDie); txt?.destroy() });
}
{
  // dano levado pelo herói (contrato "sem dano")
  const AP = Uh.prototype.apply;
  Uh.prototype.apply = function (o) {
    const r = AP.apply(this, arguments);
    try { const S = this.scene || o?.target?.scene; if (S?.__qCon && o?.target === S.player && o?.source !== S.player && !S.__qCon.done) { S.__qCon.hit = !0; S.__qCon.paint?.() } } catch (e) {}
    return r;
  };
}
/* ═════ ganchos ═════ */
{
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path, D = "assets/pixel-art/npc/"; L.setPath("");
      const sh = (k, f, w, h) => this.textures.exists(k) || L.spritesheet(k, D + f, { frameWidth: w, frameHeight: h });
      sh("bispo", "bispo.png", 128, 128); sh("freira", "freira.png", 72, 72); sh("menino", "menino.png", 64, 77); sh("paje", "paje.png", 47, 60);
      this.textures.exists("paje-logs") || L.spritesheet("paje-logs", D + "paje-logs.png", { frameWidth: 46, frameHeight: 19 });
      for (const nm of ["bispo", "freira", "menino", "paje"]) for (const ex of ["talk", "calm", "smile", "sadness", "aggression", "special"]) this.textures.exists(`${nm}-p-${ex}`) || L.image(`${nm}-p-${ex}`, `${D}${nm}-p-${ex}.png`);
      L.setPath(op);
    } catch (e) {}
    return r;
  };
  const HS = __hubSetup;
  __hubSetup = function (S) {
    const r = HS.apply(this, arguments);
    try {
      __qAnims(S);
      if (S.level?.endless || S.game.registry.get("mode") === "endless") { S.time.delayedCall(600, () => S.scene.isActive() && __qContract(S)); return r }
      if (!__Q.camp(S)) return r;
      __qDiaryBtn(S);
      const id = S.levelId;
      if (id === "templo") __qTemplo(S);
      if (__HUBD.includes(id)) { __qPajeLevel(S); __qKidLevel(S) }
      __qMercWhisper(S);
      if (id === "forest") S.time.delayedCall(500, () => {
        if (!S.scene.isActive() || !S.__hubPortals) return;
        const n = __Q.n(S);
        if (__Q.get(S, "pj") || n >= 2) __qPajeHub(S);
        if (n >= 4) __qBispoHub(S);
        if (n >= 5) __qMercHub(S);
        __qKidGhost(S);
      });
    } catch (e) { console.warn("[quests]", e) }
    return r;
  };
  const RT = __hubReturnTalk;
  __hubReturnTalk = function (S, from) {
    if (from === "templo") { if (!S.__guard || S.__guard.intro) return; __gSay(S, [__Q.G(__Q.get(S, "irm") === 2 ? "Vocês dois juntos… há muito tempo não via isso. Agora, de volta aos selos." : "O templo ainda espera por vocês.", "smile")]); return }
    const r = RT.apply(this, arguments);
    try {
      if (!__Q.camp(S) || !__HUBD.includes(from)) return r;
      const n = __Q.n(S);
      if (__QBRO[__Q.cls(S)] && !__Q.get(S, "irm") && n >= 3) S.time.delayedCall(400, () => S.scene.isActive() && __qIrmStart(S));
      if (__Q.get(S, "bpCurse", -1) === n - 1) S.stats.recompute();
      if (__Q.get(S, "bpBless", -1) === n - 1) S.stats.recompute();
    } catch (e) {}
    return r;
  };
  const GT = __guardianTalk;
  __guardianTalk = function (S) {
    try {
      if (__Q.camp(S) && !S.__guard?.intro) {
        if (__Q.get(S, "irm") === 1) { __gSay(S, [__Q.G("Seu irmão espera no templo. Vou abrir o caminho de novo.", "calm")], () => __qGo(S, "templo")); return }
        if (__Q.get(S, "mc") === 1 && __Q.get(S, "mcK") >= 80) { __qMercGuard(S); return }
      }
    } catch (e) {}
    return GT.apply(this, arguments);
  };
  const onKill = (e) => { try { const S = e?.scene; S && __Q.camp(S) && __qMercKill(S) } catch (er) {} };
  let wired = !1;
  const C0 = Sd.prototype.create;
  Sd.prototype.create = function () { const r = C0.apply(this, arguments); if (!wired) { wired = !0; this.game.events.on("enemy:died", onKill) } return r };
}
window.__dgQ = { Q: __Q, diary: (S) => __qDiary(S), list: __QLIST, paje: __qPajeHub, bispo: __qBispoHub, merc: __qMercHub, ghost: __qKidGhost, kid: __qKidLevel, irm: __qIrmStart, templo: __qTemplo, pjLevel: __qPajeLevel, contract: __qContract, mercGuard: __qMercGuard };
