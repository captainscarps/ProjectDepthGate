/* ══ Missões secundárias (parte 3) ══
   9. O Carcereiro — na Fortaleza dos Dragões (campanha), Durgan, o último carcereiro anão, barra o herói no
      Portão: foi o povo dele que acorrentou o dragão ali para vigiar a prisão das Profundezas. O dragão nunca foi
      o monstro; alguém corrompeu as runas das correntes e agora elas só alimentam a fúria dele. Três fechaduras
      rúnicas (Quartéis, Salão de Lava, Santuário): quebradas as três, o dragão entra na arena sem a fúria da
      prisão (35% menos vida) e, vencido, a alma dele descansa — Durgan entrega o Elo de Durgan (acessório
      lendário). Se o herói enfrentar o dragão com fechaduras inteiras, ele morre acorrentado e o anão só chora.
   Estado por slot junto da história (__Q): cc 0 nada · 1 em andamento · 2 libertado · 3 morreu acorrentado;
   ccL = salas com a fechadura quebrada. Um jogo novo começa do zero. */
const __CC_ROOMS = ["ashen-barracks", "molten-hall", "dragon-shrine"];
const __CC = {
  L3(pt, en, es) { return typeof __L3 === "function" ? __L3(pt, en, es) : pt },
  st(S) { return __Q.get(S, "cc") },
  locks(S) { return (__Q.get(S, "ccL", []) || []).filter((r) => __CC_ROOMS.includes(r)) },
  D(t, e = "talk") { return { who: "carcereiro", expr: e, name: "DURGAN", text: t } },
  banner(S, t, c = "#ffb070") { S.game.events.emit("ui:banner", t, c) },
  busy(S) { const ui = S.scene.get("UI"); return !S.scene.isActive() || S.uiOpen || ui?.__dlgOpen || ui?.storyPanel?.visible || S.player?.dead },
  room(S, id) { return S.dungeon?.level?.rooms?.find((r) => r.id === id)?.rect },
  spot(S, R, fx = .5, fy = .5) {
    let c = Math.round(R.x + R.w * fx), r = Math.round(R.y + R.h * fy);
    for (let k = 0; k < 40 && S.dungeon.isWallTile?.(c, r); k++) { c = R.x + 2 + (Math.random() * (R.w - 4) | 0); r = R.y + 2 + (Math.random() * (R.h - 4) | 0) }
    return [c * dt + 16, r * dt + 16];
  },
};
function __ccAnims(S) {
  const A = S.anims, mk = (k, a, n, fr, rep = -1) => { if (!A.exists(k) && S.textures.exists("carcereiro")) A.create({ key: k, frames: A.generateFrameNumbers("carcereiro", { start: a, end: a + n - 1 }), frameRate: fr, repeat: rep }) };
  mk("carcereiro-idle", 0, 6, 6); mk("carcereiro-walk", 10, 10, 11); mk("carcereiro-talk", 20, 5, 7); mk("carcereiro-sad", 40, 4, 5, 0);
}
/* Durgan: no Portão enquanto a missão não acabou; para o herói quando ele chega perto pela primeira vez */
function __ccDurgan(S) {
  const s0 = __CC.st(S); if (s0 >= 2) return;
  const R = __CC.room(S, "dragon-gate"); if (!R || !S.textures.exists("carcereiro")) return;
  __ccAnims(S);
  const L3 = __CC.L3, D = __CC.D;
  const [x, y] = __CC.spot(S, R, .8, .22);
  const talk = () => {
    if (__CC.busy(S)) return;
    if (!__CC.st(S)) {
      __dlg(S, [
        D(L3("Alto lá! Não dê nem mais um passo na direção da arena.", "Halt! Not one more step toward the arena.", "¡Alto ahí! Ni un paso más hacia la arena."), "aggression"),
        D(L3("Sou Durgan, o último carcereiro desta fortaleza. Foi o meu povo que acorrentou o dragão aqui, séculos atrás.", "I am Durgan, the last jailer of this fortress. My people chained the dragon here, centuries ago.", "Soy Durgan, el último carcelero de esta fortaleza. Mi pueblo encadenó al dragón aquí, hace siglos."), "calm"),
        D(L3("Ele nunca foi o monstro. Era o guarda da prisão. Mas alguém corrompeu as runas das correntes, e agora elas só alimentam a fúria dele.", "He was never the monster. He was the prison's guard. But someone corrupted the runes of the chains, and now they only feed his rage.", "Nunca fue el monstruo. Era el guardia de la prisión. Pero alguien corrompió las runas de las cadenas, y ahora solo alimentan su furia."), "sadness"),
        D(L3("Três fechaduras rúnicas prendem as correntes: nos Quartéis, no Salão de Lava e no Santuário. Quebre as três antes de enfrentá-lo.", "Three rune locks hold the chains: in the Barracks, the Lava Hall and the Shrine. Break all three before you face him.", "Tres cerraduras rúnicas sujetan las cadenas: en los Cuarteles, el Salón de Lava y el Santuario. Rompe las tres antes de enfrentarlo."), "talk"),
        D(L3("Sem a fúria da prisão, ele vai lutar mais fraco. E talvez, no fim, a alma dele possa descansar.", "Without the prison's rage he'll fight weaker. And maybe, in the end, his soul can rest.", "Sin la furia de la prisión, luchará más débil. Y tal vez, al final, su alma pueda descansar."), "calm"),
      ], () => {
        __Q.set(S, "cc", 1); S.requestSave?.(10);
        __CC.banner(S, L3("NOVA MISSÃO: O CARCEREIRO", "NEW QUEST: THE JAILER", "NUEVA MISIÓN: EL CARCELERO"), "#ffd27a");
        __ccLocks(S);
      });
      return;
    }
    const n = __CC.locks(S).length;
    __dlg(S, [n >= 3
      ? D(L3("As correntes afrouxaram. Vá. E seja rápido com ele.", "The chains have slackened. Go. And be quick with him.", "Las cadenas se aflojaron. Ve. Y sé rápido con él."), "calm")
      : D(L3("Ainda faltam fechaduras. Ouço as correntes rangendo daqui.", "There are locks left. I can hear the chains grinding from here.", "Aún quedan cerraduras. Oigo las cadenas crujir desde aquí."), "talk")]);
  };
  const npc = __qNpc(S, "carcereiro", x, y, { scale: .6, label: L3("Falar com Durgan", "Talk to Durgan", "Hablar con Durgan"), onTalk: talk });
  if (!npc) return;
  S.__ccNpc = npc;
  if (!s0) {   // na primeira vez, ele chama o herói assim que ele chega perto
    const U = () => {
      const P = S.player; if (!P || !npc.spr.active) { S.events.off("update", U); return }
      if (Math.hypot(P.x - x, P.y - y) < 95 && !__CC.busy(S)) { S.events.off("update", U); talk() }
    };
    S.events.on("update", U); S.events.once("shutdown", () => S.events.off("update", U));
  }
}
/* fechaduras rúnicas: pilar de ferro com correntes e a runa corrompida acesa */
function __ccLocks(S) {
  if (__CC.st(S) !== 1 || S.__ccLocksOn) return;
  S.__ccLocksOn = 1;
  const L3 = __CC.L3, done = __CC.locks(S);
  for (const id of __CC_ROOMS) {
    const R = __CC.room(S, id); if (!R) continue;
    const [x, y] = __CC.spot(S, R, .5, .45), broken = done.includes(id);
    const s = S.add.sprite(x, y + 14, "runa-corrente", broken ? 1 : 0).setOrigin(.5, 1).setScale(1.15).setDepth(y + 14);
    if (broken) continue;
    const gl = S.add.image(x, y - 2, "light").setBlendMode(j.BlendModes.ADD).setTint(0xff5a28).setScale(.3).setAlpha(.55).setDepth(y + 15);
    S.tweens.add({ targets: gl, alpha: .25, scale: .38, duration: 700, yoyo: !0, repeat: -1, ease: "Sine.easeInOut" });
    const z = S.add.zone(x, y + 4, 4, 4);
    z.interactLabel = L3("Quebrar a fechadura rúnica", "Break the rune lock", "Romper la cerradura rúnica");
    z.interact = () => {
      if (__CC.locks(S).includes(id)) return;
      const i = S.dungeon.objects.indexOf(z); i >= 0 && S.dungeon.objects.splice(i, 1);
      const L = __CC.locks(S).concat(id); __Q.set(S, "ccL", L); S.requestSave?.(10);
      S.cameraSys?.shake?.(.006, 260);
      S.game.audioEngine?.sfx?.("sfx-door-unlock") || S.game.audioEngine?.sfx?.("sfx-secret-reveal");
      window.__advancedAudio?.playMetalClang?.("C4");
      S.effects?.burstTinted?.(x, y, 0xff6a30, 22); S.effects?.shockwaveRing?.(x, y + 6, 60);
      s.setFrame(1); S.tweens.killTweensOf(gl); S.tweens.add({ targets: gl, alpha: 0, scale: .6, duration: 500, onComplete: () => gl.destroy() });
      __CC.banner(S, L.length >= 3
        ? L3("AS CORRENTES AFROUXARAM: O DRAGÃO PERDEU A FÚRIA DA PRISÃO", "THE CHAINS SLACKENED: THE DRAGON LOST THE PRISON'S RAGE", "LAS CADENAS SE AFLOJARON: EL DRAGÓN PERDIÓ LA FURIA DE LA PRISIÓN")
        : L3(`FECHADURA RÚNICA QUEBRADA (${L.length}/3)`, `RUNE LOCK BROKEN (${L.length}/3)`, `CERRADURA RÚNICA ROTA (${L.length}/3)`), L.length >= 3 ? "#ffd27a" : "#ffb070");
    };
    S.dungeon.objects.push(z);
    S.events.once("shutdown", () => { const i = S.dungeon.objects.indexOf(z); i >= 0 && S.dungeon.objects.splice(i, 1) });
  }
}
/* desfecho: dragão vencido — Durgan vem até o herói */
function __ccEnd(S, freed) {
  const L3 = __CC.L3, D = __CC.D;
  __Q.set(S, "cc", freed ? 2 : 3); S.requestSave?.(10);
  const P = S.player; if (!P) return;
  S.__ccNpc?.destroy?.();
  __ccAnims(S);
  const npc = __qNpc(S, "carcereiro", P.x - 70, P.y + 10, { scale: .6 });
  if (npc) { npc.spr.setAlpha(0); S.tweens.add({ targets: [npc.spr], alpha: 1, duration: 600 }) }
  const lines = freed ? [
    D(L3("Acabou… depois de tantos séculos, o velho guardião está livre.", "It's over… after so many centuries, the old guardian is free.", "Se acabó… después de tantos siglos, el viejo guardián es libre."), "sadness"),
    D(L3("Leve isto: o Elo de Durgan, o primeiro elo da corrente. Agora ele protege quem a quebrou.", "Take this: Durgan's Link, the first link of the chain. Now it protects the one who broke it.", "Toma esto: el Eslabón de Durgan, el primer eslabón de la cadena. Ahora protege a quien la rompió."), "smile"),
    D(L3("A prisão ficou sem vigia. Feche os portais que restam, herói, antes que o que está lá embaixo perceba.", "The prison has no warden now. Seal the portals that remain, hero, before what lies below notices.", "La prisión quedó sin vigía. Cierra los portales que quedan, héroe, antes de que lo que hay abajo se dé cuenta."), "calm"),
  ] : [
    D(L3("Você venceu… mas ele morreu acorrentado, com uma fúria que nunca foi dele.", "You won… but he died in chains, with a rage that was never his.", "Ganaste… pero murió encadenado, con una furia que nunca fue suya."), "sadness"),
    D(L3("Não é culpa sua. A prisão ficou sem vigia. Feche os portais que restam, herói.", "It's not your fault. The prison has no warden now. Seal the portals that remain, hero.", "No es tu culpa. La prisión quedó sin vigía. Cierra los portales que quedan, héroe."), "calm"),
  ];
  __dlg(S, lines, () => {
    if (freed) {
      try { const it = S.lootSystem.makeItem("durgan_link", "LEGENDARY"); S.lootSystem.spawnItem(P.x, P.y + 18, it) } catch (e) {}
      __CC.banner(S, L3("O CARCEREIRO: O DRAGÃO DESCANSA EM PAZ", "THE JAILER: THE DRAGON RESTS IN PEACE", "EL CARCELERO: EL DRAGÓN DESCANSA EN PAZ"), "#ffd27a");
    } else {
      try { S.stats?.addGold?.(60) } catch (e) {}
      __CC.banner(S, L3("O CARCEREIRO: O DRAGÃO MORREU ACORRENTADO", "THE JAILER: THE DRAGON DIED IN CHAINS", "EL CARCELERO: EL DRAGÓN MURIÓ ENCADENADO"), "#c0a0a0");
    }
    if (npc) S.tweens.add({ targets: [npc.spr, npc.sh], alpha: 0, delay: 600, duration: 900, onComplete: () => npc.destroy() });
  });
}
/* ─── ganchos ─── */
{
  __QLIST.push({ id: "carcereiro", title: "O Carcereiro", st: (S) => {
    const s = __CC.st(S), L3 = __CC.L3; if (!s) return null;
    if (s === 2) return ["done", L3("O dragão descansa, livre das correntes. Durgan te deu o Elo de Durgan.", "The dragon rests, free of its chains. Durgan gave you Durgan's Link.", "El dragón descansa, libre de sus cadenas. Durgan te dio el Eslabón de Durgan.")];
    if (s === 3) return ["done", L3("O dragão morreu acorrentado. Durgan chora o velho guardião.", "The dragon died in chains. Durgan mourns the old guardian.", "El dragón murió encadenado. Durgan llora al viejo guardián.")];
    const n = __CC.locks(S).length;
    return ["on", n >= 3
      ? L3("As correntes afrouxaram. Enfrente o dragão na Arena da Fortaleza dos Dragões.", "The chains have slackened. Face the dragon in the Dragon Fortress arena.", "Las cadenas se aflojaron. Enfrenta al dragón en la arena de la Fortaleza de los Dragones.")
      : L3(`Quebre as fechaduras rúnicas da Fortaleza dos Dragões antes de enfrentar o dragão: ${n}/3 (Quartéis, Salão de Lava, Santuário).`, `Break the rune locks in the Dragon Fortress before facing the dragon: ${n}/3 (Barracks, Lava Hall, Shrine).`, `Rompe las cerraduras rúnicas de la Fortaleza de los Dragones antes de enfrentar al dragón: ${n}/3 (Cuarteles, Salón de Lava, Santuario).`)];
  } });
  Xt.durgan_link = { name: "Elo de Durgan", type: "accessory", slot: "accessory", icon: "icon-durgan-link", minRarity: "LEGENDARY",
    stats: { defense: 4, maxHp: 4, damage: 2 }, value: 320, desc: "O primeiro elo da corrente do dragão. Protege quem a quebrou." };
  try {
    Object.assign(__TR.en, { "O Carcereiro": "The Jailer", "Elo de Durgan": "Durgan's Link", "O primeiro elo da corrente do dragão. Protege quem a quebrou.": "The first link of the dragon's chain. It protects the one who broke it." });
    __TR.es && Object.assign(__TR.es, { "O Carcereiro": "El Carcelero", "Elo de Durgan": "Eslabón de Durgan", "O primeiro elo da corrente do dragão. Protege quem a quebrou.": "El primer eslabón de la cadena del dragón. Protege a quien la rompió." });
  } catch (e) {}
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path, Dp = "assets/pixel-art/npc/"; L.setPath("");
      this.textures.exists("carcereiro") || L.spritesheet("carcereiro", Dp + "carcereiro.png", { frameWidth: 86, frameHeight: 61 });
      this.textures.exists("runa-corrente") || L.spritesheet("runa-corrente", Dp + "runa-corrente.png", { frameWidth: 32, frameHeight: 48 });
      this.textures.exists("icon-durgan-link") || L.image("icon-durgan-link", Dp + "elo-durgan.png");
      for (const ex of ["talk", "calm", "smile", "sadness", "aggression", "special"]) this.textures.exists(`carcereiro-p-${ex}`) || L.image(`carcereiro-p-${ex}`, `${Dp}carcereiro-p-${ex}.png`);
      L.setPath(op);
    } catch (e) {}
    return r;
  };
  // o dragão sem a fúria da prisão: 35% menos vida quando as três fechaduras foram quebradas
  const SB = Sd.prototype.spawnBoss;
  Sd.prototype.spawnBoss = function (key) {
    const b = SB.apply(this, arguments);
    try {
      if (key === "DRAGON_ANCIENT" && this.levelId === "fortress" && __Q.camp(this) && __CC.st(this) === 1 && __CC.locks(this).length >= 3 && b && !b.__ccWeak) {
        b.__ccWeak = 1;
        b.maxHp = Math.max(1, Math.round(b.maxHp * .65)); b.hp = Math.min(b.hp, b.maxHp);
        this.time.delayedCall(1800, () => this.scene.isActive() && __CC.banner(this, __CC.L3("SEM A FÚRIA DAS CORRENTES, O DRAGÃO ESTÁ MAIS FRACO", "WITHOUT THE CHAINS' RAGE, THE DRAGON IS WEAKER", "SIN LA FURIA DE LAS CADENAS, EL DRAGÓN ESTÁ MÁS DÉBIL"), "#ffd27a"));
      }
    } catch (e) {}
    return b;
  };
  const HS = __hubSetup;
  __hubSetup = function (S) {
    const r = HS.apply(this, arguments);
    try {
      if (!__Q.camp(S) || S.isDorfCave || S.levelId !== "fortress") return r;
      S.__ccLocksOn = 0;
      S.time.delayedCall(400, () => { if (!S.scene.isActive()) return; __ccDurgan(S); __ccLocks(S) });
      const on = (b) => {
        if (b?.typeKey !== "DRAGON_ANCIENT" || __CC.st(S) !== 1) return;
        S.game.events.off("boss:defeated", on);
        const freed = __CC.locks(S).length >= 3;
        // o diálogo entra na fila sozinho (se a Guardiã estiver falando, ele espera ela terminar)
        const go = () => { if (!S.scene.isActive() || S.player?.dead) return; __ccEnd(S, freed) };
        setTimeout(go, 2200);     // relógio de verdade: o da cena para enquanto a Guardiã fala depois do chefe
      };
      S.game.events.on("boss:defeated", on); S.events.once("shutdown", () => S.game.events.off("boss:defeated", on));
    } catch (e) { console.warn("[quests3]", e) }
    return r;
  };
}
window.__dgQ3 = { CC: __CC, durgan: __ccDurgan, locks: __ccLocks, end: __ccEnd };
