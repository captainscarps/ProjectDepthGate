/* ══ Taverna do Refúgio ══
   A cabana do curtidor (antes "trancada") é a porta da taverna. Lá dentro: o salão do pacote CraftPix "Tavern"
   (balcão, barris, mesas compridas, mesas redondas, sofás; os fregueses do pacote não entram), o Farias atrás do
   balcão limpando canecas e a Maria levando a bandeja entre as mesas. Conversa com retrato (caixa de fala do
   Refúgio) e 5 expressões de cada um.
   Técnica: a taverna usa a mesma "área de dentro" da forja — ao entrar, M.interior passa a ser a taverna (colisão,
   porta e caminho por toque funcionam sozinhos) e a câmera segue o herói dentro do salão; ao sair, volta a forja.
   Arte: scripts/build_taverna.py. */
const __TV_X = 1184, __TV_Y = 320;
const __TV_L = /*__TVLINES__*/{"speakers":{"farias":{"name":["FARIAS","FARIAS","FARIAS"],"voice":"farias"},"maria":{"name":["MARIA","MARIA","MARIA"],"voice":"maria"}},"scenes":{"f1":[["farias","Bem-vindo à taverna do Refúgio. Limpe as botas: aqui dentro quem manda sou eu.","Welcome to the Refuge tavern. Wipe your boots: in here, I'm the one in charge.","Bienvenido a la taberna del Refugio. Límpiate las botas: aquí dentro mando yo.","calm"],["farias","Farias, a seu dispor. A Maria cuida das mesas, eu cuido de tudo o resto.","Farias, at your service. Maria handles the tables, I handle everything else.","Farias, a tu servicio. María atiende las mesas, yo me encargo de todo lo demás.","smile"]],"f2":[["farias","Hah! Voltou inteiro de mais um portal? A próxima caneca é por conta da casa… brincadeira, não é não.","Hah! Back in one piece from another gate? Next mug's on the house… just kidding, it's not.","¡Ja! ¿Volviste entero de otro portal? La próxima jarra va por la casa… es broma, no va.","smile"]],"f3":[["farias","Se for brigar, brigue lá fora. A última mesa quebrada ainda está na minha conta.","If you're going to fight, do it outside. The last broken table is still on my tab.","Si vas a pelear, pelea afuera. La última mesa rota todavía está en mi cuenta.","aggression"]],"f4":[["farias","Você ouviu isso? …Ah, é só a Maria derrubando outra bandeja.","Did you hear that? …Oh, it's just Maria dropping another tray.","¿Oíste eso? …Ah, es solo María tirando otra bandeja.","special"]],"f5":[["farias","Antes do Abismo, essas mesas viviam cheias. Um dia vão encher de novo. Eu espero.","Before the Abyss, these tables were always full. Someday they'll fill up again. I hope.","Antes del Abismo, estas mesas siempre estaban llenas. Algún día volverán a llenarse. Eso espero.","sadness"]],"m1":[["maria","Oi! Senta onde quiser, que eu já trago alguma coisa quente.","Hi! Sit wherever you like, I'll bring you something warm.","¡Hola! Siéntate donde quieras, ya te traigo algo caliente.","smile"]],"m2":[["maria","O Farias resmunga, mas foi ele que guardou um lugar pra cada herói que passou por aqui.","Farias grumbles, but he's the one who saved a seat for every hero who came through here.","Farias refunfuña, pero fue él quien guardó un lugar para cada héroe que pasó por aquí.","calm"]],"m3":[["maria","Dizem que um barco chegou na doca cheio de peixe estranho. O Farias jurou que não vai cozinhar nenhum.","They say a boat reached the dock full of strange fish. Farias swore he won't cook a single one.","Dicen que llegó un barco al muelle lleno de peces raros. Farias juró que no va a cocinar ninguno.","special"]],"m4":[["maria","Às vezes eu fico olhando a porta… esperando quem ainda não voltou.","Sometimes I just watch the door… waiting for the ones who haven't come back yet.","A veces me quedo mirando la puerta… esperando a los que todavía no volvieron.","sadness"]],"m5":[["maria","Ei! Nada de subir na mesa, viu? Eu acabei de limpar.","Hey! No climbing on the tables, okay? I just cleaned them.","¡Oye! Nada de subirse a la mesa, ¿eh? Acabo de limpiarla.","aggression"]]}}/*__TVLINES_END__*/;   // falas: scripts/taverna_lines.json (embutidas pelo patch_taverna.py)
/* fregueses (moradores do Refúgio, as variações de roupa e cabelo da vila): [sprite, quadros parados, pés x, pés y, virado p/ esquerda] */
const __TV_PATRONS = [["elf-2-2", 7, 336, 152, 1], ["camp-rapaz-2", 6, 88, 208, 0], ["camp-moca-1", 6, 334, 210, 1], ["peasant-3-3", 7, 244, 143, 1],
  ["camp-lavrador-1", 6, 176, 194, 0], ["elf-3-0", 7, 178, 143, 0], ["menino-1", 6, 98, 236, 0]];
/* heróis que passam o tempo na taverna (os primeiros desta lista que não são o herói do jogador): pés x, pés y, olhando */
const __TV_HEROES = [["BERSERKER", 128, 172, 1], ["ROGUE", 300, 176, -1], ["HUNTER", 256, 194, -1], ["DRUID", 152, 146, 1], ["SHAMAN", 70, 160, 1], ["NECROMANCER", 352, 196, -1]];
{
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path, T = "assets/pixel-art/hub/taverna/", N = "assets/pixel-art/npc/", ex = k => this.textures.exists(k); L.setPath("");
      ex("tv-base") || L.image("tv-base", T + "base.png"); ex("tv-top") || L.image("tv-top", T + "top.png");
      ex("tv-props") || L.atlas("tv-props", T + "props.png", T + "props.json"); this.cache.json.exists("tv-map") || L.json("tv-map", T + "taverna.json");
      for (const k of __TV_PATRONS) ex("vkv-" + k[0]) || L.spritesheet("vkv-" + k[0], "assets/pixel-art/valdrak/npc/" + k[0] + ".png", k[0].startsWith("menino") ? { frameWidth: 64, frameHeight: 77 } : { frameWidth: 128, frameHeight: 128 });
      for (const n of ["farias", "maria"]) {
        ex(n) || L.spritesheet(n, N + n + ".png", { frameWidth: 128, frameHeight: 128 });
        for (const e of ["talk", "calm", "smile", "sadness", "aggression", "special"]) ex(`${n}-p-${e}`) || L.image(`${n}-p-${e}`, `${N}${n}-p-${e}.png`);
      }
      L.setPath(op);
    } catch (e) {}
    return r;
  };
  const I0 = Fl.prototype.__inters;
  Fl.prototype.__inters = function () {
    const r = I0.apply(this, arguments);
    try { this.textures.exists("tv-base") && this.cache.json.exists("tv-map") && __tvBuild(this) } catch (e) { console.warn("[taverna]", e) }
    return r;
  };
  const A0 = Fl.prototype.__area;
  Fl.prototype.__area = function (a, instant) {
    const r = A0.apply(this, arguments);
    if (a === "in" && this.__tv) {   // dentro da taverna: câmera presa ao salão seguindo o herói, herói no tamanho de fora
      const I = this.M.interior, cam = this.cameras.main;
      cam.setBounds(I.x, I.y, I.w, I.h); cam.startFollow(this.rig.container, !0, instant ? 1 : .14, instant ? 1 : .14);
      this.rig?.container?.setScale(.6);
      try { this.title?.active && this.title.setText(__L3("TAVERNA", "TAVERN", "TABERNA")) } catch (e) { }
    }
    return r;
  };
  const HI = Fl.prototype.__heroesInit;   // os heróis da vila nascem depois: só então alguns vão para a taverna
  if (HI) Fl.prototype.__heroesInit = function () { const r = HI.apply(this, arguments); this.__tvHeroesReady = 1; try { this.__tvMoveHeroes?.() } catch (e) { console.warn("[taverna] heróis", e) } return r };
  const LV = Fl.prototype.__leave;
  Fl.prototype.__leave = function () {
    if (!this.__tv) return LV.apply(this, arguments);
    if (this.__busy) return; this.__busy = !0; this.game.audioEngine?.sfx("sfx-door-open");
    const cam = this.cameras.main; cam.fadeOut(220, 0, 0, 0);
    cam.once("camerafadeoutcomplete", () => {
      __tvMode(this, !1);
      const D = this.__tvDoorOut; this.playerX = D[0]; this.playerY = D[1] + 14; this.facing = { x: 0, y: 1 };
      this.rig.container.setPosition(this.playerX, this.playerY); this.__area("out", !0); this.time.delayedCall(30, () => this.__area("out"));
      cam.fadeIn(260, 0, 0, 0); this.__busy = !1;
    });
  };
}
/* liga/desliga o "modo taverna": troca o interior e cala os sons da forja (a bigorna toca quando a área é "in") */
function __tvMode(H, on) {
  const M = H.M;
  if (on) {
    if (H.__tv) return; H.__tv = 1; H.__tvForge = M.interior; M.interior = H.__tvI;
    H.__tvSparks = H.__sparks; H.__sparks = () => { };
    const AA = window.__advancedAudio; if (AA && AA.playMetalClang) { H.__tvClang = AA.playMetalClang; AA.playMetalClang = () => { } }
  } else {
    if (!H.__tv) return; H.__tv = 0; M.interior = H.__tvForge || M.interior;
    if (H.__tvSparks) H.__sparks = H.__tvSparks; const AA = window.__advancedAudio; if (AA && H.__tvClang) AA.playMetalClang = H.__tvClang;
  }
}
function __tvBuild(H) {
  const L3 = __L3;
  H.events.once("shutdown", () => { H.__tvHeroesReady = 0; H.__tvMoveHeroes = null });
  const J = H.cache.json.get("tv-map"), M = H.M, X = __TV_X, Y = __TV_Y, FO = J.feetOff || 0;
  H.__tvI = { x: X, y: Y, w: J.w, h: J.h, coll: J.coll, spawn: [X + J.spawn[0], Y + J.spawn[1]], door: [X + J.door[0], Y + J.door[1]], spots: {}, smith: M.interior.smith };
  H.add.image(X, Y, "tv-base").setOrigin(0).setDepth(-40);
  for (const [k, x, y] of J.props) H.add.image(X + x, Y + y, "tv-props", k).setOrigin(.5, 1).setDepth(Y + y - FO);
  H.add.image(X, Y, "tv-top").setOrigin(0).setDepth(Y + J.h + 60);
  // luz quente das janelas e do balcão
  for (const [lx, ly, s] of [[140, 92, .5], [276, 92, .5], [208, 120, .9]]) H.add.image(X + lx, Y + ly, "light").setBlendMode(j.BlendModes.ADD).setTint(0xffb860).setScale(s).setAlpha(.22).setDepth(Y + J.h + 61);
  const A = H.anims, mk = (k, t, a, b, fr, rep = -1) => A.exists(k) || A.create({ key: k, frames: A.generateFrameNumbers(t, { start: a, end: b }), frameRate: fr, repeat: rep });
  mk("farias-idle", "farias", 0, 6, 6); mk("farias-wipe", "farias", 16, 25, 8); mk("farias-idle2", "farias", 48, 54, 6);
  mk("maria-idle", "maria", 0, 6, 6); mk("maria-idle2", "maria", 16, 22, 6); mk("maria-walk", "maria", 32, 43, 10); mk("maria-serve", "maria", 48, 57, 8, 0);
  const SC = .46, rnd = Math.random;
  // Farias atrás do balcão
  const fs = J.spots.farias, far = H.add.sprite(X + fs[0], Y + fs[1], "farias", 0).setOrigin(.5, 1).setScale(SC).setDepth(Y + fs[1] - FO + 2).play("farias-wipe");   // atrás do balcão, na frente dos barris
  H.time.addEvent({ delay: 5200, loop: !0, callback: () => { if (H.__tvTalk !== "farias") far.play(rnd() < .65 ? "farias-wipe" : rnd() < .5 ? "farias-idle" : "farias-idle2", !0); far.setFlipX(rnd() < .3) } });
  // Maria entre as mesas: anda de um ponto ao outro e serve
  const P = J.spots.maria.map(p => [X + p[0], Y + p[1]]), C0 = [X + J.spots.counter[0], Y + J.spots.counter[1]];
  const mar = H.add.sprite(C0[0], C0[1], "maria", 0).setOrigin(.5, 1).setScale(SC).setDepth(C0[1] - FO).play("maria-idle");
  const mp = { x: mar.x, y: mar.y - FO }; let route = 0;
  const go = () => {
    if (!mar.active) return; if (H.__tvTalk === "maria") { H.time.delayedCall(1200, go); return }
    const to = route % 2 === 0 ? P[(route / 2 | 0) % P.length] : C0; route++;
    const d = Math.hypot(to[0] - mar.x, to[1] - mar.y); mar.setFlipX(to[0] < mar.x); mar.play("maria-walk", !0);
    H.tweens.add({ targets: mar, x: to[0], y: to[1], duration: d / 30 * 1000, onUpdate: () => { mar.setDepth(mar.y - FO); mp.x = mar.x; mp.y = mar.y - FO },
      onComplete: () => { if (to === C0) { mar.play("maria-idle", !0); H.time.delayedCall(1800 + rnd() * 1500, go) } else { mar.play("maria-serve", !0); mar.once("animationcomplete", () => { mar.play("maria-idle2", !0); H.time.delayedCall(1400 + rnd() * 1600, go) }) } } });
  };
  H.time.delayedCall(1500, go);
  // fregueses parados conversando nas mesas
  const PAT = [], H_ = 31;
  for (const [k, n, fx, fy, left] of __TV_PATRONS) {
    if (!H.textures.exists("vkv-" + k)) continue;
    mk("vkv-i-" + k, "vkv-" + k, 0, n - 1, 6);
    const kid = k.startsWith("menino"), bh = kid ? 74 : 68, s_ = (kid ? 22 : H_) / bh;
    const sp = H.add.sprite(X + fx, Y + fy, "vkv-" + k, 0).setOrigin(.5, .99).setScale(s_).setFlipX(!!left).setDepth(Y + fy - FO);
    sp.play({ key: "vkv-i-" + k, startFrame: (rnd() * n) | 0 }); PAT.push(sp);
  }
  const CHAT = [L3("…e o dragão nem viu de onde veio a flecha!", "…and the dragon never saw where the arrow came from!", "…¡y el dragón ni vio de dónde vino la flecha!"), L3("Mais uma rodada, Farias!", "Another round, Farias!", "¡Otra ronda, Farias!"),
    L3("Dizem que o castelo de Valdrak ainda respira.", "They say Valdrak castle still breathes.", "Dicen que el castillo de Valdrak todavía respira."), L3("Essa sopa tem gosto de bota velha… e eu adoro.", "This stew tastes like an old boot… and I love it.", "Esta sopa sabe a bota vieja… y me encanta."),
    L3("Viu a doca nova? Tem peixe pulando até de dia.", "Seen the new dock? Fish jump even in daylight.", "¿Viste el muelle nuevo? Los peces saltan hasta de día."), L3("Shh! A Maria está vindo.", "Shh! Maria's coming.", "¡Shh! Viene María."),
    L3("Aposto três moedas que ele não volta do próximo portal.", "Three coins says they don't come back from the next gate.", "Apuesto tres monedas a que no vuelve del próximo portal."), L3("Ha! Essa foi boa!", "Ha! Good one!", "¡Ja! ¡Esa fue buena!")];
  H.time.addEvent({ delay: 4200, loop: !0, callback: () => { if (!H.__tv || H.__hubDlgO || rnd() < .35 || !PAT.length) return; const p = PAT[(rnd() * PAT.length) | 0]; try { H.__say(p.x, p.y - 30, CHAT[(rnd() * CHAT.length) | 0], 2600, "#f2e6c8") } catch (e) { } } });
  // heróis na taverna: alguns dos heróis da vila passam a ficar aqui dentro (mesma conversa de sempre)
  const moveHeroes = () => {
    if (!H.heroes) return; let n = 0;
    for (const [id, fx, fy, face] of __TV_HEROES) {
      if (n >= 4) break; const h = H.heroes.find(q => q.id === id); if (!h) continue; n++;
      const ox = h.x, oy = h.y; h.x = X + fx; h.y = Y + fy - FO; h.face = { x: face, y: 0 }; h.tv = 1;
      h.rig.container.setPosition(h.x, h.y).setDepth(h.y);
      const it = H.inters.find(o => o.id === "hero-" + id); if (it) { it.area = "in"; it.x = h.x; it.y = h.y; it.ay = h.y + 14 }
      const lb = (H.labels || []).find(o => o.text && Math.abs(o.x - ox) < 2 && Math.abs(o.y - (oy - 34)) < 2); if (lb) { lb.setVisible(!1); H.labels = H.labels.filter(o => o !== lb); lb.destroy() }
    }
  };
  H.__tvMoveHeroes = moveHeroes; if (H.__tvHeroesReady) moveHeroes();
  // conversas (retrato e caixa de fala do Refúgio)
  const __S = (__TV_L && __TV_L.scenes) || {}, grp = p => Object.keys(__S).filter(k => k[0] === p).sort().map(k => __S[k].map(([who, pt, en, es, e]) => ({ who, e, t: L3(pt, en, es) })));
  const FL = grp("f"), ML = grp("m");
  let fn = -1, mn = -1;
  const talk = (who) => {
    if (H.__hubDlgO) return; H.__tvTalk = who;
    const lines = who === "farias" ? FL[fn = (fn + 1) % FL.length] : ML[mn = (mn + 1) % ML.length];
    if (who === "farias") far.play("farias-idle2", !0); else { H.tweens.killTweensOf(mar); mar.play("maria-idle", !0); mar.setFlipX(H.playerX < mar.x) }
    H.__hubDlg(lines, () => { H.__tvTalk = null; if (who === "maria") H.time.delayedCall(600, go) });
  };
  H.inters.push({ area: "in", id: "farias", x: X + J.spots.counter[0], y: Y + J.spots.counter[1] - FO, r: 30, label: "FARIAS", desc: L3("Conversar", "Talk", "Hablar"), act: () => H.__tv && talk("farias") });
  H.inters.push({ area: "in", id: "maria", x: 0, y: 0, r: 26, dyn: () => H.__tv ? mp : { x: -9999, y: -9999 }, label: "MARIA", desc: L3("Conversar", "Talk", "Hablar"), act: () => H.__tv && talk("maria") });
  // a porta: a cabana do curtidor
  const cab = H.inters.find(o => o.id === "cabin");
  if (cab) {
    H.__tvDoorOut = [cab.x, cab.y];
    cab.label = L3("TAVERNA", "TAVERN", "TABERNA"); cab.desc = L3("Entrar", "Enter", "Entrar");
    cab.act = () => {
      if (H.__busy) return; H.__busy = !0; H.game.audioEngine?.sfx("sfx-door-open");
      const cam = H.cameras.main; cam.fadeOut(220, 0, 0, 0);
      cam.once("camerafadeoutcomplete", () => {
        __tvMode(H, !0); const I = H.M.interior; H.playerX = I.spawn[0]; H.playerY = I.spawn[1]; H.facing = { x: 0, y: -1 };
        H.rig.container.setPosition(H.playerX, H.playerY); H.__area("in"); cam.fadeIn(260, 0, 0, 0); H.__busy = !1;
        if (!H.__tvHi) { H.__tvHi = 1; H.time.delayedCall(500, () => talk("farias")) }
      });
    };
  }
  H.events.once("shutdown", () => __tvMode(H, !1));
}
