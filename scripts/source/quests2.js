/* ══ Missões secundárias (parte 2) ══
   7. Os Gatos da Alline — logo na primeira chegada ao Coração da Floresta, quando a Guardiã termina de falar, a
      Alline (elfa ruiva) vem pedir ajuda: três gatos fugiram pelos portais. Cada um se esconde numa masmorra, foge
      do herói e só se deixa pegar quando cansa. Pela ordem do resgate: Mel, Carvão e, por último, o Ollie (cinza
      rajado), que vira o companheiro do herói e fareja ouro nas salas limpas.
   Apoio ao Aprendiz do Ferreiro (a missão mora em dorf-caves.js e hub-village.js): texturas do Brokk no jogo,
   nome traduzido do martelo e limpeza da chave por herói ao excluir / começar jogo novo.
   Estado salvo por slot junto da história (__Q, um jogo novo começa do zero). */
const __GT_CATS = [
  { id: "mel", n: "Mel", tex: "gato-a" },
  { id: "car", n: "Carvão", tex: "gato-d" },
  { id: "oll", n: "Ollie", tex: "gato-g" },
];
const __GT_TEX = { "gato-a": 100, "gato-d": 100, "gato-g": 92 };
function __gtAnims(S) {
  const A = S.anims, mk = (k, tex, a, n, fr, rep = -1) => { if (!A.exists(k) && S.textures.exists(tex)) A.create({ key: k, frames: A.generateFrameNumbers(tex, { start: a, end: a + n - 1 }), frameRate: fr, repeat: rep }) };
  for (const t in __GT_TEX) { mk(t + "-idle", t, 0, 7, 6); mk(t + "-walk", t, 11, 11, 13); mk(t + "-run", t, 22, 10, 17); mk(t + "-hiss", t, 33, 4, 7, 0) }
  mk("aprendiz-idle", "aprendiz", 50, 6, 6); mk("aprendiz-scared", "aprendiz", 0, 6, 6); mk("aprendiz-walk", "aprendiz", 10, 10, 12); mk("aprendiz-run", "aprendiz", 20, 10, 15);
  mk("aprendiz-hurt", "aprendiz", 30, 3, 10, 0); mk("aprendiz-dead", "aprendiz", 40, 4, 7, 0); mk("aprendiz-talk", "aprendiz", 50, 6, 8);
  mk("alline-idle", "alline", 0, 7, 6); mk("alline-idle2", "alline", 12, 7, 6); mk("alline-walk", "alline", 24, 12, 12); mk("alline-talk", "alline", 36, 8, 8); mk("alline-special", "alline", 48, 7, 8, 0);
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
  cat(k) { return __GT_CATS[Math.max(0, Math.min(__GT_CATS.length - 1, k | 0))] },   // pela ordem do resgate: o último é o Ollie
  M(t, e = "talk") { return { who: "alline", expr: e, name: "ALLINE", text: t } },
  H(t, e = "talk") { return { who: "hero", expr: e, text: t } },
  banner(S, t, c = "#ffd27a") { S.game.events.emit("ui:banner", t, c) },
};
/* ─── Alline e os gatos resgatados no Coração da Floresta ─── */
function __gtDiscKey(S) { return "depthgate:alDesc:" + (window.__heroTag ? window.__heroTag(S.game.registry, 1, S) : (S.game.registry.get("save:slot") ?? 1)) }
function __gtHub(S, arrive) {
  if (!__GT.st(S) && !__stFlag(S, "gHub0")) return;
  if (__GT.st(S) === 2) return;   // depois do resgate ela mora no Refúgio, na forja do Rafael
  if (S.__gtNpc) { arrive && S.__gtNpc.arrive(); return }
  const L3 = __GT.L3, [mx, my] = __Q.hubPos(S, -40, 150);
  const talk = () => {
    const s = __GT.st(S), L = __GT.list(S), F = __GT.found(S);
    if (!s) {
      __dlg(S, [
        __GT.M(L3("Ei, você aí! Espera! Você é o viajante de quem a Guardiã tanto fala, não é?", "Hey, you there! Wait! You're the traveler the Guardian keeps talking about, right?", "¡Eh, tú! ¡Espera! Eres el viajero del que tanto habla la Guardiana, ¿verdad?"), "special"),
        __GT.M(L3("Meus gatos fugiram pelos portais correndo atrás dos ratos das Profundezas. São três, e cada um se meteu numa terra diferente.", "My cats ran through the portals chasing the rats of the Depths. There are three, and each one slipped into a different land.", "Mis gatos huyeron por los portales persiguiendo a las ratas de las Profundidades. Son tres, y cada uno se metió en una tierra distinta."), "sadness"),
        __GT.H(L3("Vou trazer todos de volta. Prometo.", "I'll bring them all back. I promise.", "Los traeré a todos de vuelta. Lo prometo."), "talk"),
        __GT.M(L3("Eles vão fugir de você. Deixe que cansem, chegue perto e pegue no colo.", "They'll run from you. Let them tire out, get close and scoop them up.", "Van a huir de ti. Deja que se cansen, acércate y tómalos en brazos."), "smile"),
      ], () => {
        const free = __HUBD.filter((id) => !(typeof __isPortalDone === "function" && __isPortalDone(S, id)));
        const pool = (free.length ? free : __HUBD.slice()).sort(() => Math.random() - 0.5);
        const n = Math.max(1, Math.min(__GT_CATS.length, pool.length));
        __Q.set(S, "gt", 1); __Q.set(S, "gtL", pool.slice(0, n)); __Q.set(S, "gtF", []);
        S.requestSave?.(10);
        __GT.banner(S, L3(`NOVA MISSÃO: OS GATOS DA ALLINE (0/${n})`, `NEW QUEST: ALLINE'S CATS (0/${n})`, `NUEVA MISIÓN: LOS GATOS DE ALLINE (0/${n})`));
      });
      return;
    }
    if (s === 1 && F.length >= L.length) {
      __dlg(S, [
        __GT.M(L3("Todos eles! Olha só, a Mel até voltou mais gordinha.", "All of them! Look, Mel even came back a little chubbier.", "¡Todos! Mira, Mel hasta volvió más gordita."), "smile"),
        __GT.M(L3("O Ollie não sai do seu pé… acho que ele te escolheu. Leve ele junto: nariz de gato acha ouro onde ninguém procura.", "Ollie won't leave your side… I think he chose you. Take him along: a cat's nose finds gold where nobody looks.", "Ollie no se separa de ti… creo que te eligió. Llévalo contigo: la nariz de un gato encuentra oro donde nadie busca."), "talk"),
        __GT.H(L3("Vamos, Ollie. Temos selos para fechar.", "Come on, Ollie. We have seals to close.", "Vamos, Ollie. Tenemos sellos que cerrar."), "smile"),
        __GT.M(L3("E tem mais: o ferreiro do Refúgio, o Rafael, é o meu marido. Vou pedir pra ele te dar um desconto na próxima compra.", "And there's more: the Refuge blacksmith, Rafael, is my husband. I'll ask him to give you a discount on your next purchase.", "Y hay más: el herrero del Refugio, Rafael, es mi marido. Le pediré que te haga un descuento en tu próxima compra."), "smile"),
        __GT.M(L3("Agora que os gatos voltaram, vamos morar com ele no Refúgio. Passa lá na forja pra nos ver!", "Now that the cats are back, we're moving in with him at the Refuge. Drop by the forge to see us!", "Ahora que los gatos volvieron, nos mudamos con él al Refugio. ¡Pasa por la forja a vernos!"), "talk"),
      ], () => {
        __Q.set(S, "gt", 2); __Q.frag(40); S.stats?.addGold?.(120); S.requestSave?.(10);
        try { localStorage.setItem(__gtDiscKey(S), "1") } catch (e) {}
        // a Alline e os gatos vão para o Refúgio
        const n = S.__gtNpc;
        if (n) { n.spr.__lock = 1; S.anims.exists("alline-walk") && n.spr.play("alline-walk"); n.spr.setFlipX(!1); n.zone && (n.zone.interactLabel = null); S.tweens.add({ targets: [n.spr, n.sh], x: "+=90", alpha: 0, duration: 1800, delay: 400, onComplete: () => n.destroy() }) }
        S.__gtCats?.oll?.destroy?.();
        for (const [k, c] of Object.entries(S.__gtCats || {})) k !== "oll" && c?.active && S.tweens.add({ targets: c, x: "+=110", alpha: 0, duration: 1600, delay: 300, onStart: () => c.play(c.texture.key + "-run"), onComplete: () => c.destroy() });
        __GT.banner(S, L3("+120 OURO · +40 CRISTAIS DO REFÚGIO · O OLLIE AGORA TE ACOMPANHA", "+120 GOLD · +40 REFUGE CRYSTALS · OLLIE NOW FOLLOWS YOU", "+120 ORO · +40 CRISTALES DEL REFUGIO · OLLIE AHORA TE ACOMPAÑA"));
        S.time.delayedCall(300, () => S.scene.isActive() && __gtPet(S));
      });
      return;
    }
    if (s === 1) {
      const P = [
        [L3("Nenhum voltou ainda… O diário mostra em quais terras eles estão.", "None of them are back yet… The journal shows which lands they're in.", "Ninguno ha vuelto todavía… El diario muestra en qué tierras están."), "sadness"],
        [L3("A Mel já está em casa! Ainda faltam dois. Veja no diário onde procurar.", "Mel is already home! Two more to go. Check the journal for where to look.", "¡Mel ya está en casa! Faltan dos. Mira en el diario dónde buscar."), "smile"],
        [L3("Só falta um! Veja no diário onde ele se escondeu.", "Just one left! Check the journal for where he's hiding.", "¡Solo falta uno! Mira en el diario dónde se escondió."), "special"],
      ][Math.min(2, F.length)];
      __dlg(S, [__GT.M(P[0], P[1])]);
      return;
    }
    const lines = [L3("A casa nunca esteve tão cheia de pelo. E de felicidade.", "The house has never been this full of fur. Or of happiness.", "La casa nunca estuvo tan llena de pelo. Ni de felicidad."), L3("Cuide bem do Ollie. Ele gosta de peixe e de ouro, nessa ordem.", "Take good care of Ollie. He likes fish and gold, in that order.", "Cuida bien a Ollie. Le gustan el pescado y el oro, en ese orden.")];
    __dlg(S, [__GT.M(lines[(Math.random() * lines.length) | 0], "smile")]);
  };
  const npc = __qNpc(S, "alline", mx, my, { scale: .62, label: L3("Falar com a Alline", "Talk to Alline", "Hablar con Alline"), onTalk: talk });
  if (!npc) return;
  S.__gtNpc = npc;
  S.events.once("shutdown", () => { S.__gtNpc = null; S.__gtCats = null });
  // logo depois da fala da Guardiã: ela vem correndo até o herói e puxa conversa
  npc.arrive = () => {
    if (__GT.st(S) || npc.__walking) return;
    const s = npc.spr, P = S.player; if (!P) return;
    npc.__walking = !0; s.__lock = 1; S.anims.exists("alline-walk") && s.play("alline-walk");
    // longe demais: ela entra pela lateral da tela, perto o bastante para ser vista chegando
    if (Math.hypot(P.x - s.x, P.y - s.y) > 240) {
      const wall = (x, y) => !!S.dungeon?.isWallAtWorld?.(x, y);
      for (const [ox, oy] of [[190, 20], [-190, 20], [150, 90], [-150, 90], [0, 140], [120, -80], [-120, -80]]) {
        const nx = P.x + ox, ny = P.y + oy;
        if (!wall(nx, ny) && (!S.dungeon?.hasLineOfSight || S.dungeon.hasLineOfSight(nx, ny, P.x, P.y))) { s.setPosition(nx, ny); npc.sh.setPosition(nx, ny); break }
      }
      Math.hypot(P.x - s.x, P.y - s.y) > 240 && (s.setPosition(P.x + 150, P.y + 10), npc.sh.setPosition(P.x + 150, P.y + 10));
    }
    const U = (_t, ms) => {
      if (!s.active || !S.player) return;
      const dx = S.player.x + (S.player.x > s.x ? -46 : 46) - s.x, dy = S.player.y + 4 - s.y, d = Math.hypot(dx, dy), st2 = 110 * ms / 1000;
      if (d > 6 && npc.__t < 5000) { s.x += dx / d * Math.min(d, st2); s.y += dy / d * Math.min(d, st2); s.setFlipX(dx < 0).setDepth(s.y); npc.sh.setPosition(s.x, s.y).setDepth(s.y - 1); npc.zone?.setPosition(s.x, s.y - 6); npc.__t += ms; return }
      S.events.off("update", U); npc.__walking = !1; s.__lock = 0;
      if (Math.hypot(S.player.x - s.x, S.player.y - s.y) > 120) { s.setPosition(S.player.x + 46, S.player.y + 4); npc.sh.setPosition(s.x, s.y); npc.zone?.setPosition(s.x, s.y - 6) }
      s.setFlipX(S.player.x < s.x);
      if (!S.uiOpen) talk(); else S.time.delayedCall(600, () => S.scene.isActive() && !__GT.st(S) && talk());
    };
    npc.__t = 0; S.events.on("update", U); S.events.once("shutdown", () => S.events.off("update", U));
  };
  arrive && npc.arrive();
  // gatos já resgatados passeiam em volta dela (o Ollie vai com o herói depois da missão)
  S.__gtCats = {};
  __GT.found(S).forEach((lv, k) => {
    const c = __GT.cat(k); if (__GT.st(S) === 2 && c.id === "oll") return;
    const hx = mx + Math.cos(k * 1.9) * (40 + k * 7), hy = my + 14 + Math.sin(k * 1.9) * 18;
    const s = S.add.sprite(hx, hy, c.tex, 0).setOrigin(.5, 1).setScale(.5).setDepth(hy).play(c.tex + "-idle");
    S.__gtCats[c.id] = s;
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
  const id = S.levelId;
  if (!__GT.list(S).includes(id) || __GT.found(S).includes(id)) return;
  const L3 = __GT.L3, c = __GT.cat(__GT.found(S).length), D = S.dungeon, lv = D?.level; if (!lv?.rooms?.length) return;
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
  S.time.delayedCall(1800, () => S.scene.isActive() && __GT.banner(S, L3(`${c.n.toUpperCase()}, UM DOS GATOS DA ALLINE, ESTÁ ESCONDIDO AQUI`, `${c.n.toUpperCase()}, ONE OF ALLINE'S CATS, IS HIDING HERE`, `${c.n.toUpperCase()}, UNO DE LOS GATOS DE ALLINE, SE ESCONDE AQUÍ`)));
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
    __dlg(S, [__GT.H(L3(`Peguei você, ${c.n}! A Alline está te esperando.`, `Got you, ${c.n}! Alline is waiting for you.`, `¡Te tengo, ${c.n}! Alline te está esperando.`), "smile")], () => {
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
/* ─── Ollie, o gato companheiro (cinza rajado): segue o herói e fareja ouro nas salas limpas ─── */
function __gtPet(S) {
  if (__GT.st(S) !== 2 || S.__gtPet || !S.player || S.isDorfCave) return;
  __gtAnims(S);
  const L3 = __GT.L3, P = S.player, s = S.add.sprite(P.x - 26, P.y + 6, "gato-g", 0).setOrigin(.5, 1).setScale(.5).setDepth(P.y).play("gato-g-idle");
  const sh = S.add.ellipse(s.x, s.y, 22, 6, 0, .28).setDepth(P.y - 1);
  S.__gtPet = s;
  const fol = __qFollow(S, s, { gap: 34, walk: 95, run: 175 });
  let sniff = null;
  const U = (_t, ms) => {
    if (!s.active || !S.player) return;
    if (sniff) {
      const dx = sniff.x - s.x, dy = sniff.y - s.y, d = Math.hypot(dx, dy), st2 = 120 * ms / 1000;
      if (d > st2 && sniff.t > 0) { s.x += dx / d * st2; s.y += dy / d * st2; s.setFlipX(dx < 0); s.anims.currentAnim?.key !== "gato-g-walk" && s.play("gato-g-walk") }
      else if (!sniff.done) {
        sniff.done = !0; s.play("gato-g-idle");
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
      const sp = fol(ms); const want = sp > 130 ? "gato-g-run" : sp > 0 ? "gato-g-walk" : "gato-g-idle";
      s.anims.currentAnim?.key !== want && s.play(want);
    }
    s.setDepth(s.y); sh.setPosition(s.x, s.y).setDepth(s.y - 1);
  };
  const mul = () => window.__petMul?.(S, "oll") ?? 1;      // treino do pet (pets.js): mais chance e mais ouro
  const onClear = () => {
    if (!s.active || sniff || Math.random() > Math.min(.85, 0.4 + (mul() - 1) * .3)) return;
    const a = Math.random() * Math.PI * 2, tx = S.player.x + Math.cos(a) * 50, ty = S.player.y + Math.sin(a) * 34;
    if (S.dungeon?.isWallAtWorld?.(tx, ty)) return;
    sniff = { x: tx, y: ty, t: 2500, g: Math.round((8 + __Q.n(S) * 4 + ((Math.random() * 8) | 0)) * mul()) };
    S.effects?.floatText?.(s.x, s.y - 26, L3("*fareja*", "*sniff*", "*olfatea*"), "#e8d090", 8);
  };
  S.game.events.on("room:cleared", onClear); S.__gtSniff = onClear;
  S.events.on("update", U);
  const kill = () => { S.events.off("update", U); S.game.events.off("room:cleared", onClear); S.__gtPet = null; S.__gtPetKill = null };
  S.__gtPetKill = () => { kill(); s.destroy(); sh.destroy() };     // trocar de pet no meio da área (aba PETS do livro)
  S.events.once("shutdown", kill);
}
/* ─── ganchos ─── */
{
  __QLIST.push({ id: "gatos", title: "Os Gatos da Alline", st: (S) => {
    const s = __GT.st(S); if (!s) return null;
    if (s === 2) return ["done", __GT.L3("Todos os gatos voltaram para casa. O Ollie agora te acompanha.", "All the cats are home. Ollie now travels with you.", "Todos los gatos volvieron a casa. Ollie ahora te acompaña.")];
    const L = __GT.list(S), F = __GT.found(S);
    if (F.length >= L.length) return ["on", __GT.L3("Todos resgatados! Volte à Alline no Coração da Floresta.", "All rescued! Go back to Alline in the Heart of the Forest.", "¡Todos rescatados! Vuelve con Alline al Corazón del Bosque.")];
    const miss = L.filter((lv) => !F.includes(lv)).map((lv) => (typeof St === "function" ? St(`lvl.${lv}`, ki?.[lv]?.name ?? lv) : lv)).join(", ");
    return ["on", __GT.L3(`Gatos: ${F.length}/${L.length} — procure em: ${miss}.`, `Cats: ${F.length}/${L.length} — search in: ${miss}.`, `Gatos: ${F.length}/${L.length} — busca en: ${miss}.`)];
  } });
  __QLIST.push({ id: "aprendiz", title: "O Aprendiz do Ferreiro", st: (S) => {
    const a = window.__apzGet?.(S) || {}, L3 = __GT.L3;
    return !a.s ? null : a.s === 3 ? ["done", L3("O Brokk voltou para a forja. O Martelo Rúnico está na armaria.", "Brokk is back at the forge. The Runic Hammer is in the armory.", "Brokk volvió a la forja. El Martillo Rúnico está en la armería.")]
      : a.s === 4 ? ["done", L3("O Brokk não sobreviveu às cavernas…", "Brokk did not survive the caves…", "Brokk no sobrevivió a las cavernas…")]
      : ["on", L3("Encontre o Brokk nas Cavernas Dorf e leve-o vivo até um portal branco.", "Find Brokk in the Dorf Caves and bring him alive to a white portal.", "Encuentra a Brokk en las Cavernas Dorf y llévalo con vida a un portal blanco.")];
  } });
  try {
    Object.assign(__TR.en, { "Os Gatos da Alline": "Alline's Cats", "O Aprendiz do Ferreiro": "The Blacksmith's Apprentice", "Martelo Rúnico de Brokk": "Brokk's Runic Hammer" });
    __TR.es && Object.assign(__TR.es, { "Os Gatos da Alline": "Los Gatos de Alline", "O Aprendiz do Ferreiro": "El Aprendiz del Herrero", "Martelo Rúnico de Brokk": "Martillo Rúnico de Brokk" });
  } catch (e) {}
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path, D = "assets/pixel-art/npc/"; L.setPath("");
      for (const t in __GT_TEX) this.textures.exists(t) || L.spritesheet(t, D + t + ".png", { frameWidth: __GT_TEX[t], frameHeight: 50 });
      this.textures.exists("aprendiz") || L.spritesheet("aprendiz", D + "aprendiz.png", { frameWidth: 92, frameHeight: 66 });
      this.textures.exists("alline") || L.spritesheet("alline", D + "alline.png", { frameWidth: 46, frameHeight: 72 });
      for (const ex of ["talk", "calm", "smile", "sadness", "aggression", "special"]) this.textures.exists(`alline-p-${ex}`) || L.image(`alline-p-${ex}`, `${D}alline-p-${ex}.png`);
      for (const ex of ["talk", "calm", "smile", "sadness", "aggression", "special"]) this.textures.exists(`aprendiz-p-${ex}`) || L.image(`aprendiz-p-${ex}`, `${D}aprendiz-p-${ex}.png`);
      L.setPath(op);
    } catch (e) {}
    return r;
  };
  const GS = __gSay;
  __gSay = function (S, list, done) {
    try {
      if (list === __GHUB0 && __Q.camp(S) && !__GT.st(S)) {
        const d0 = done;
        return GS.call(this, S, list, () => { d0?.(); S.time.delayedCall(700, () => S.scene.isActive() && __gtHub(S, !0)) });
      }
    } catch (e) {}
    return GS.apply(this, arguments);
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
  const apzDel = (tag) => { try { localStorage.removeItem("depthgate:apz:" + tag); localStorage.removeItem("depthgate:alDesc:" + tag) } catch (e) {} };
  const K0 = Kr;
  Kr = function (c = 1, i = "campaign") { apzDel((i === "endless" ? "e" : "") + c); return K0.apply(this, arguments) };
  const CR = __cReset;
  __cReset = function (g, sl) { apzDel(String(sl)); return CR.apply(this, arguments) };
}
// o Refúgio (outra cena) lê o estado da missão pelo save da história
window.__gtDone = (scene) => { try { const tag = window.__heroTag ? window.__heroTag(scene.game.registry, 1, scene) : 1; return (JSON.parse(localStorage.getItem("depthgate:story:" + tag) || "{}").q_gt | 0) === 2 } catch (e) { return !1 } };
window.__gtDiscKey = __gtDiscKey;
window.__dgQ2 = { GT: __GT, cats: __GT_CATS, hub: __gtHub, level: __gtLevel, pet: __gtPet, follow: __qFollow, hubIntro: (S) => __gSay(S, __GHUB0) };
