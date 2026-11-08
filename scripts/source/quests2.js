/* ══ Missões secundárias (parte 2) ══
   7. Os Gatos da Marta — a taverneira do Coração da Floresta perdeu os gatos pelos portais; cada um se esconde
      numa masmorra, foge do herói e só se deixa pegar quando cansa. Resgatados, passeiam pelo Coração da
      Floresta; com todos de volta, a Mel vira companheira e fareja ouro nas salas limpas.
   Apoio ao Aprendiz do Ferreiro (a missão mora em dorf-caves.js e hub-village.js): texturas do Brokk no jogo,
   nome traduzido do martelo e limpeza da chave por herói ao excluir / começar jogo novo.
   Estado salvo por slot junto da história (__Q, um jogo novo começa do zero). */
const __GT_CATS = [
  { id: "mel", n: "Mel", tex: "gato-a" },
  { id: "lar", n: "Laranjinha", tex: "gato-f" },
  { id: "car", n: "Carvão", tex: "gato-d" },
  { id: "nuv", n: "Nuvem", tex: "gato-e" },
  { id: "can", n: "Canela", tex: "gato-b" },
  { id: "nev", n: "Neve", tex: "gato-c" },
];
const __GT_TEX = { "gato-a": 100, "gato-b": 92, "gato-c": 100, "gato-d": 100, "gato-e": 100, "gato-f": 92 };
function __gtAnims(S) {
  const A = S.anims, mk = (k, tex, a, n, fr, rep = -1) => { if (!A.exists(k) && S.textures.exists(tex)) A.create({ key: k, frames: A.generateFrameNumbers(tex, { start: a, end: a + n - 1 }), frameRate: fr, repeat: rep }) };
  for (const t in __GT_TEX) { mk(t + "-idle", t, 0, 7, 6); mk(t + "-walk", t, 11, 11, 13); mk(t + "-run", t, 22, 10, 17); mk(t + "-hiss", t, 33, 4, 7, 0) }
  mk("aprendiz-idle", "aprendiz", 50, 6, 6); mk("aprendiz-scared", "aprendiz", 0, 6, 6); mk("aprendiz-walk", "aprendiz", 10, 10, 12); mk("aprendiz-run", "aprendiz", 20, 10, 15);
  mk("aprendiz-hurt", "aprendiz", 30, 3, 10, 0); mk("aprendiz-dead", "aprendiz", 40, 4, 7, 0); mk("aprendiz-talk", "aprendiz", 50, 6, 8);
}
/* segue o herói pelo caminho que ele fez (migalhas), então não atravessa parede */
function __qFollow(S, spr, o = {}) {
  const crumbs = [], gap = o.gap ?? 30, far = o.far ?? 420;
  let acc = 0;
  return (ms, play) => {
    const P = S.player; if (!P || !spr.active) return 0;
    acc += ms;
    const last = crumbs[crumbs.length - 1];
    if (acc > 90 && (!last || Math.hypot(P.x - last[0], P.y - last[1]) > 10)) { acc = 0; crumbs.push([P.x, P.y]); crumbs.length > 90 && crumbs.shift() }
    const dP = Math.hypot(P.x - spr.x, P.y - spr.y);
    if (dP > far) { const b = crumbs[Math.max(0, crumbs.length - 4)] || [P.x, P.y]; spr.setPosition(b[0], b[1] + 6); crumbs.length = 0; return 0 }
    if (dP < gap) { crumbs.length = 0; return 0 }
    // alvo: a migalha mais antiga ainda à frente; com caminho livre, vai direto ao herói
    const los = S.dungeon?.hasLineOfSight ? S.dungeon.hasLineOfSight(spr.x, spr.y, P.x, P.y) : true;
    let tx = P.x, ty = P.y;
    if (!los && crumbs.length) { while (crumbs.length > 1 && Math.hypot(crumbs[0][0] - spr.x, crumbs[0][1] - spr.y) < 8) crumbs.shift(); [tx, ty] = crumbs[0] }
    else if (los) crumbs.length = 0;
    const dx = tx - spr.x, dy = ty - spr.y, d = Math.hypot(dx, dy) || 1, sp = dP > 110 ? (o.run ?? 170) : (o.walk ?? 100);
    const st = Math.min(d, sp * ms / 1000);
    spr.x += dx / d * st; spr.y += dy / d * st;
    Math.abs(dx) > 1 && spr.setFlipX(dx < 0);
    return sp;
  };
}
const __GT = {
  L3(pt, en, es) { return typeof __L3 === "function" ? __L3(pt, en, es) : pt },
  st(S) { return __Q.get(S, "gt") },
  list(S) { return __Q.get(S, "gtL", []) || [] },
  found(S) { return __Q.get(S, "gtF", []) || [] },
  cat(id) { return __GT_CATS.find((c) => c.id === id) || __GT_CATS[0] },
  M(t, e = "talk") { return { who: "peasant-2", expr: e, name: "MARTA", text: t } },
  H(t, e = "talk") { return { who: "hero", expr: e, text: t } },
  banner(S, t, c = "#ffd27a") { S.game.events.emit("ui:banner", t, c) },
};
/* ─── Marta e os gatos resgatados no Coração da Floresta ─── */
function __gtHub(S) {
  if (__Q.n(S) < 1 && !__GT.st(S)) return;
  const L3 = __GT.L3, [mx, my] = __Q.hubPos(S, -40, 150);
  const talk = () => {
    const s = __GT.st(S), L = __GT.list(S), F = __GT.found(S);
    if (!s) {
      __dlg(S, [
        __GT.M(L3("Ai, herói, que bom te ver! Você viu meus gatos? Fugiram pelos portais correndo atrás dos ratos das Profundezas.", "Oh, hero, thank goodness! Have you seen my cats? They ran through the portals chasing the rats of the Depths.", "¡Ay, héroe, qué bueno verte! ¿Viste a mis gatos? Huyeron por los portales persiguiendo a las ratas de las Profundidades."), "sadness"),
        __GT.M(L3("Cada um se meteu numa terra diferente… e gato assustado não vem quando a gente chama.", "Each one slipped into a different land… and a frightened cat won't come when you call.", "Cada uno se metió en una tierra distinta… y un gato asustado no viene cuando lo llamas."), "talk"),
        __GT.H(L3("Vou trazer todos de volta. Prometo.", "I'll bring them all back. I promise.", "Los traeré a todos de vuelta. Lo prometo."), "talk"),
        __GT.M(L3("Eles vão fugir de você. Deixe que cansem, chegue perto e pegue no colo.", "They'll run from you. Let them tire out, get close and scoop them up.", "Van a huir de ti. Deja que se cansen, acércate y tómalos en brazos."), "smile"),
      ], () => {
        const free = __HUBD.filter((id) => !(typeof __isPortalDone === "function" && __isPortalDone(S, id)));
        const pool = (free.length ? free : __HUBD.slice()).sort(() => Math.random() - 0.5);
        const n = Math.max(1, Math.min(__GT_CATS.length, pool.length));
        const map = {}; pool.slice(0, n).forEach((lv, k) => { map[lv] = __GT_CATS[k].id });
        __Q.set(S, "gt", 1); __Q.set(S, "gtL", Object.keys(map)); __Q.set(S, "gtM", map); __Q.set(S, "gtF", []);
        S.requestSave?.(10);
        __GT.banner(S, L3(`NOVA MISSÃO: OS GATOS DA MARTA (0/${n})`, `NEW QUEST: MARTA'S CATS (0/${n})`, `NUEVA MISIÓN: LOS GATOS DE MARTA (0/${n})`));
      });
      return;
    }
    if (s === 1 && F.length >= L.length) {
      __dlg(S, [
        __GT.M(L3("Todos eles! Olha só, a Mel até voltou mais gordinha.", "All of them! Look, Mel even came back a little chubbier.", "¡Todos! Mira, Mel hasta volvió más gordita."), "smile"),
        __GT.M(L3("A Mel gostou de você. Leve ela junto: nariz de gato acha ouro onde ninguém procura.", "Mel likes you. Take her along: a cat's nose finds gold where nobody looks.", "A Mel le caes bien. Llévala contigo: la nariz de un gato encuentra oro donde nadie busca."), "special"),
        __GT.H(L3("Vamos, Mel. Temos selos para fechar.", "Come on, Mel. We have seals to close.", "Vamos, Mel. Tenemos sellos que cerrar."), "smile"),
      ], () => {
        __Q.set(S, "gt", 2); __Q.frag(40); S.stats?.addGold?.(120); S.requestSave?.(10);
        __GT.banner(S, L3("+120 OURO · +40 CRISTAIS DO REFÚGIO · A MEL AGORA TE ACOMPANHA", "+120 GOLD · +40 REFUGE CRYSTALS · MEL NOW FOLLOWS YOU", "+120 ORO · +40 CRISTALES DEL REFUGIO · MEL AHORA TE ACOMPAÑA"));
        S.time.delayedCall(300, () => S.scene.isActive() && __gtPet(S));
      });
      return;
    }
    if (s === 1) {
      const M = __Q.get(S, "gtM", {}) || {}, miss = L.filter((lv) => !F.includes(lv));
      const where = miss.map((lv) => (typeof St === "function" ? St(`lvl.${lv}`, ki?.[lv]?.name ?? lv) : lv)).join(", ");
      __dlg(S, [__GT.M(L3(`Já voltaram ${F.length} de ${L.length}. Ainda faltam: ${miss.map((lv) => __GT.cat(M[lv]).n).join(", ")}.`, `${F.length} of ${L.length} are back. Still missing: ${miss.map((lv) => __GT.cat(M[lv]).n).join(", ")}.`, `Ya volvieron ${F.length} de ${L.length}. Aún faltan: ${miss.map((lv) => __GT.cat(M[lv]).n).join(", ")}.`), F.length ? "smile" : "sadness"),
        __GT.M(L3(`Sinto que estão em: ${where}.`, `I feel they're in: ${where}.`, `Siento que están en: ${where}.`), "calm")]);
      return;
    }
    const lines = [L3("A casa nunca esteve tão cheia de pelo. E de felicidade.", "The house has never been this full of fur. Or of happiness.", "La casa nunca estuvo tan llena de pelo. Ni de felicidad."), L3("Cuide bem da Mel. Ela gosta de peixe e de ouro, nessa ordem.", "Take good care of Mel. She likes fish and gold, in that order.", "Cuida bien a Mel. Le gustan el pescado y el oro, en ese orden.")];
    __dlg(S, [__GT.M(lines[(Math.random() * lines.length) | 0], "smile")]);
  };
  const npc = __qNpc(S, "peasant-2", mx, my, { scale: .62, label: L3("Falar com Marta", "Talk to Marta", "Hablar con Marta"), onTalk: talk });
  if (!npc) return;
  // gatos já resgatados passeiam em volta dela (a Mel vai com o herói depois da missão)
  const M = __Q.get(S, "gtM", {}) || {};
  __GT.found(S).forEach((lv, k) => {
    const c = __GT.cat(M[lv]); if (__GT.st(S) === 2 && c.id === "mel") return;
    const hx = mx + Math.cos(k * 1.9) * (40 + k * 7), hy = my + 14 + Math.sin(k * 1.9) * 18;
    const s = S.add.sprite(hx, hy, c.tex, 0).setOrigin(.5, 1).setScale(.5).setDepth(hy).play(c.tex + "-idle");
    s.anims.setProgress(Math.random());
    let t = 1 + Math.random() * 3, tgt = null;
    const U = (_t, ms) => {
      if (!s.active) return; t -= ms / 1000;
      if (tgt) { const dx = tgt[0] - s.x, dy = tgt[1] - s.y, d = Math.hypot(dx, dy), st2 = 34 * ms / 1000; if (d <= st2) { tgt = null; t = 2 + Math.random() * 4; s.play(c.tex + "-idle") } else { s.x += dx / d * st2; s.y += dy / d * st2; s.setFlipX(dx < 0).setDepth(s.y) } }
      else if (t <= 0) { tgt = [mx + (Math.random() - 0.5) * 120, my + 6 + Math.random() * 40]; s.play(c.tex + "-walk") }
    };
    S.events.on("update", U); S.events.once("shutdown", () => S.events.off("update", U));
  });
}
/* ─── gato escondido numa masmorra: foge, cansa, e é pego ─── */
function __gtLevel(S) {
  if (__GT.st(S) !== 1) return;
  const id = S.levelId, M = __Q.get(S, "gtM", {}) || {};
  if (!M[id] || __GT.found(S).includes(id)) return;
  const L3 = __GT.L3, c = __GT.cat(M[id]), D = S.dungeon, lv = D?.level; if (!lv?.rooms?.length) return;
  const sp = lv.playerSpawn, spx = (sp?.col ?? 0) * dt, spy = (sp?.row ?? 0) * dt;
  const rooms = lv.rooms.filter((r) => r.rect && !r.hasBoss && !r.boss && !r.hub).map((r) => ({ r, d: Math.hypot((r.rect.x + r.rect.w / 2) * dt - spx, (r.rect.y + r.rect.h / 2) * dt - spy) })).sort((a, b) => a.d - b.d);
  if (!rooms.length) return;
  const R = rooms[Math.min(rooms.length - 1, Math.floor(rooms.length * 0.6))].r.rect;
  const wall = (x, y) => !!D.isWallAtWorld?.(x, y);
  let x = (R.x + R.w / 2) * dt, y = (R.y + R.h / 2) * dt;
  for (let k = 0; k < 40 && wall(x, y); k++) { x = (R.x + 1 + Math.random() * (R.w - 2)) * dt; y = (R.y + 1 + Math.random() * (R.h - 2)) * dt }
  __gtAnims(S);
  const s = S.add.sprite(x, y, c.tex, 0).setOrigin(.5, 1).setScale(.5).setDepth(y).play(c.tex + "-idle");
  const sh = S.add.ellipse(x, y, 22, 6, 0, .28).setDepth(y - 1);
  const mark = S.add.text(x, y - 30, "?", { fontFamily: "Georgia, serif", fontStyle: "bold", fontSize: "12px", color: "#ffd27a", stroke: "#000", strokeThickness: 3 }).setOrigin(.5, 1).setDepth(9001);
  S.tweens.add({ targets: mark, y: y - 34, duration: 600, yoyo: !0, repeat: -1 });
  S.time.delayedCall(1800, () => S.scene.isActive() && __GT.banner(S, L3(`${c.n.toUpperCase()}, UM DOS GATOS DA MARTA, ESTÁ ESCONDIDO AQUI`, `${c.n.toUpperCase()}, ONE OF MARTA'S CATS, IS HIDING HERE`, `${c.n.toUpperCase()}, UNO DE LOS GATOS DE MARTA, SE ESCONDE AQUÍ`)));
  let state = "idle", stamina = 2.2, rest = 0, caught = !1, dir = [1, 0];
  const z = S.add.zone(x, y - 6, 4, 4);
  z.interactLabel = L3(`Pegar ${c.n}`, `Pick up ${c.n}`, `Atrapar a ${c.n}`);
  z.interact = () => {
    if (caught) return;
    const P = S.player; if (!P || Math.hypot(P.x - s.x, P.y - s.y) > 46) return;
    if (state === "flee" && stamina > 0.5) { s.play(c.tex + "-hiss"); S.effects?.floatText?.(s.x, s.y - 28, L3("Fsss!", "Hiss!", "¡Fsss!"), "#ffd27a", 9); return }
    caught = !0; state = "caught";
    const i = D.objects.indexOf(z); i >= 0 && D.objects.splice(i, 1);
    mark.destroy(); s.play(c.tex + "-idle");
    const F = __GT.found(S).concat(id); __Q.set(S, "gtF", F); S.requestSave?.(10);
    S.game.audioEngine?.sfx?.("sfx-secret-reveal");
    __dlg(S, [__GT.H(L3(`Peguei você, ${c.n}! A Marta está te esperando.`, `Got you, ${c.n}! Marta is waiting for you.`, `¡Te tengo, ${c.n}! Marta te está esperando.`), "smile")], () => {
      __FFX?.burst?.(S, s.x, s.y - 10, 0xffe9a0, 12, 26, 520, 0.03, s.depth + 2, 8);
      S.tweens.add({ targets: [s, sh], alpha: 0, y: "-=10", duration: 700, onComplete: () => { s.destroy(); sh.destroy(); z.destroy() } });
      const L = __GT.list(S);
      __GT.banner(S, L3(`GATO RESGATADO: ${c.n.toUpperCase()} (${F.length}/${L.length})`, `CAT RESCUED: ${c.n.toUpperCase()} (${F.length}/${L.length})`, `GATO RESCATADO: ${c.n.toUpperCase()} (${F.length}/${L.length})`), "#8fcf8a");
    });
  };
  D.objects.push(z);
  const U = (_t, ms) => {
    if (!s.active || caught || !S.player) return;
    const P = S.player, dts = ms / 1000, dx = s.x - P.x, dy = s.y - P.y, d = Math.hypot(dx, dy) || 1;
    if (state === "idle") { if (d < 120) { state = "flee"; stamina = 1.6 + Math.random() * 0.9 } }
    else if (state === "flee") {
      stamina -= dts;
      // corre para longe do herói; se der de cara com a parede, desvia
      const want = [dx / d, dy / d]; dir = [dir[0] * 0.7 + want[0] * 0.3, dir[1] * 0.7 + want[1] * 0.3];
      const L = Math.hypot(dir[0], dir[1]) || 1, vx = dir[0] / L, vy = dir[1] / L, sp2 = 140 * dts;
      let moved = !1;
      for (const a of [0, .6, -.6, 1.2, -1.2, 1.8, -1.8]) {
        const cs = Math.cos(a), sn = Math.sin(a), ux = vx * cs - vy * sn, uy = vx * sn + vy * cs, nx = s.x + ux * sp2, ny = s.y + uy * sp2;
        if (!wall(nx, ny) && !wall(nx + ux * 12, ny + uy * 8)) { s.x = nx; s.y = ny; dir = [ux, uy]; moved = !0; s.setFlipX(ux < 0); break }
      }
      s.anims.currentAnim?.key !== c.tex + "-run" && s.play(c.tex + "-run");
      if (!moved || stamina <= 0 || d > 260) { state = "rest"; rest = 2 + Math.random() * 1.2; s.play(c.tex + "-hiss"); s.once("animationcomplete", () => s.active && state === "rest" && s.play(c.tex + "-idle")) }
    } else if (state === "rest") { rest -= dts; if (rest <= 0) state = d < 70 ? "flee" : "idle", stamina = 1.4 + Math.random() * 0.8 }
    s.setDepth(s.y); sh.setPosition(s.x, s.y).setDepth(s.y - 1); mark.active && mark.setX(s.x); z.setPosition(s.x, s.y - 6);
  };
  S.events.on("update", U);
  S.events.once("shutdown", () => { S.events.off("update", U); const i = D.objects.indexOf(z); i >= 0 && D.objects.splice(i, 1) });
}
/* ─── Mel, a gata companheira: segue o herói e fareja ouro nas salas limpas ─── */
function __gtPet(S) {
  if (__GT.st(S) !== 2 || S.__gtPet || !S.player || S.isDorfCave) return;
  __gtAnims(S);
  const L3 = __GT.L3, P = S.player, s = S.add.sprite(P.x - 26, P.y + 6, "gato-a", 0).setOrigin(.5, 1).setScale(.5).setDepth(P.y).play("gato-a-idle");
  const sh = S.add.ellipse(s.x, s.y, 22, 6, 0, .28).setDepth(P.y - 1);
  S.__gtPet = s;
  const fol = __qFollow(S, s, { gap: 34, walk: 95, run: 175 });
  let sniff = null;
  const U = (_t, ms) => {
    if (!s.active || !S.player) return;
    if (sniff) {
      const dx = sniff.x - s.x, dy = sniff.y - s.y, d = Math.hypot(dx, dy), st2 = 120 * ms / 1000;
      if (d > st2 && sniff.t > 0) { s.x += dx / d * st2; s.y += dy / d * st2; s.setFlipX(dx < 0); s.anims.currentAnim?.key !== "gato-a-walk" && s.play("gato-a-walk") }
      else if (!sniff.done) {
        sniff.done = !0; s.play("gato-a-idle");
        S.time.delayedCall(700, () => {
          if (!s.active) return;
          const g = sniff.g; S.stats?.addGold?.(g); S.game.audioEngine?.sfx?.("sfx-item-pickup");
          S.effects?.floatText?.(s.x, s.y - 26, `+${g} ${L3("ouro", "gold", "oro")}`, "#ffd24a", 10);
          __FFX?.burst?.(S, s.x, s.y - 6, 0xffd24a, 8, 20, 420, 0.02, s.depth + 2, 6);
          sniff = null;
        });
      }
      sniff && (sniff.t -= ms);
    } else {
      const sp = fol(ms); const want = sp > 130 ? "gato-a-run" : sp > 0 ? "gato-a-walk" : "gato-a-idle";
      s.anims.currentAnim?.key !== want && s.play(want);
    }
    s.setDepth(s.y); sh.setPosition(s.x, s.y).setDepth(s.y - 1);
  };
  const onClear = () => {
    if (!s.active || sniff || Math.random() > 0.4) return;
    const a = Math.random() * Math.PI * 2, tx = S.player.x + Math.cos(a) * 50, ty = S.player.y + Math.sin(a) * 34;
    if (S.dungeon?.isWallAtWorld?.(tx, ty)) return;
    sniff = { x: tx, y: ty, t: 2500, g: 8 + __Q.n(S) * 4 + ((Math.random() * 8) | 0) };
    S.effects?.floatText?.(s.x, s.y - 26, L3("*fareja*", "*sniff*", "*olfatea*"), "#e8d090", 8);
  };
  S.game.events.on("room:cleared", onClear); S.__gtSniff = onClear;
  S.events.on("update", U);
  S.events.once("shutdown", () => { S.events.off("update", U); S.game.events.off("room:cleared", onClear); S.__gtPet = null });
}
/* ─── ganchos ─── */
{
  __QLIST.push({ id: "gatos", title: "Os Gatos da Marta", st: (S) => {
    const s = __GT.st(S); if (!s) return null;
    if (s === 2) return ["done", __GT.L3("Todos os gatos voltaram para casa. A Mel agora te acompanha.", "All the cats are home. Mel now travels with you.", "Todos los gatos volvieron a casa. Mel ahora te acompaña.")];
    const L = __GT.list(S), F = __GT.found(S), M = __Q.get(S, "gtM", {}) || {};
    if (F.length >= L.length) return ["on", __GT.L3("Todos resgatados! Volte à Marta no Coração da Floresta.", "All rescued! Go back to Marta in the Heart of the Forest.", "¡Todos rescatados! Vuelve con Marta al Corazón del Bosque.")];
    const miss = L.filter((lv) => !F.includes(lv)).map((lv) => `${__GT.cat(M[lv]).n} (${typeof St === "function" ? St(`lvl.${lv}`, ki?.[lv]?.name ?? lv) : lv})`).join(", ");
    return ["on", __GT.L3(`Gatos: ${F.length}/${L.length} — faltam ${miss}.`, `Cats: ${F.length}/${L.length} — missing ${miss}.`, `Gatos: ${F.length}/${L.length} — faltan ${miss}.`)];
  } });
  __QLIST.push({ id: "aprendiz", title: "O Aprendiz do Ferreiro", st: (S) => {
    const a = window.__apzGet?.(S) || {}, L3 = __GT.L3;
    return !a.s ? null : a.s === 3 ? ["done", L3("O Brokk voltou para a forja. O Martelo Rúnico está na armaria.", "Brokk is back at the forge. The Runic Hammer is in the armory.", "Brokk volvió a la forja. El Martillo Rúnico está en la armería.")]
      : a.s === 4 ? ["done", L3("O Brokk não sobreviveu às cavernas…", "Brokk did not survive the caves…", "Brokk no sobrevivió a las cavernas…")]
      : ["on", L3("Encontre o Brokk nas Cavernas Dorf e leve-o vivo até um portal branco.", "Find Brokk in the Dorf Caves and bring him alive to a white portal.", "Encuentra a Brokk en las Cavernas Dorf y llévalo con vida a un portal blanco.")];
  } });
  try {
    Object.assign(__TR.en, { "Os Gatos da Marta": "Marta's Cats", "O Aprendiz do Ferreiro": "The Blacksmith's Apprentice", "Martelo Rúnico de Brokk": "Brokk's Runic Hammer" });
    __TR.es && Object.assign(__TR.es, { "Os Gatos da Marta": "Los Gatos de Marta", "O Aprendiz do Ferreiro": "El Aprendiz del Herrero", "Martelo Rúnico de Brokk": "Martillo Rúnico de Brokk" });
  } catch (e) {}
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path, D = "assets/pixel-art/npc/"; L.setPath("");
      for (const t in __GT_TEX) this.textures.exists(t) || L.spritesheet(t, D + t + ".png", { frameWidth: __GT_TEX[t], frameHeight: 50 });
      this.textures.exists("aprendiz") || L.spritesheet("aprendiz", D + "aprendiz.png", { frameWidth: 92, frameHeight: 66 });
      for (const ex of ["talk", "calm", "smile", "sadness", "aggression", "special"]) this.textures.exists(`aprendiz-p-${ex}`) || L.image(`aprendiz-p-${ex}`, `${D}aprendiz-p-${ex}.png`);
      L.setPath(op);
    } catch (e) {}
    return r;
  };
  const HS = __hubSetup;
  __hubSetup = function (S) {
    const r = HS.apply(this, arguments);
    try {
      __gtAnims(S);
      if (!__Q.camp(S) || S.isDorfCave) return r;
      const id = S.levelId;
      if (__HUBD.includes(id)) __gtLevel(S);
      S.time.delayedCall(700, () => S.scene.isActive() && __gtPet(S));
      if (id === "forest") S.time.delayedCall(520, () => { if (S.scene.isActive() && S.__hubPortals) __gtHub(S) });
    } catch (e) { console.warn("[quests2]", e) }
    return r;
  };
  // missão do aprendiz (chave por herói): some ao excluir o herói ou começar campanha nova no slot
  const apzDel = (tag) => { try { localStorage.removeItem("depthgate:apz:" + tag) } catch (e) {} };
  const K0 = Kr;
  Kr = function (c = 1, i = "campaign") { apzDel((i === "endless" ? "e" : "") + c); return K0.apply(this, arguments) };
  const CR = __cReset;
  __cReset = function (g, sl) { apzDel(String(sl)); return CR.apply(this, arguments) };
}
window.__dgQ2 = { GT: __GT, cats: __GT_CATS, hub: __gtHub, level: __gtLevel, pet: __gtPet, follow: __qFollow };
