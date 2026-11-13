/* ══ Olivia, a filha do Rafael ══
   Vaga pelo Refúgio: um tempo lá fora, na frente da forja, correndo e pulando com a Mussarela (cachorra branca
   de manchas pretas); um tempo dentro da forja, brincando com o Fumaça (gato cinza). De tempos em tempos vai até
   a porta e troca de lugar; a Mussarela espera na porta. Falar com ela abre a caixa de fala com retrato (voz de
   menina). Arte: scripts/build_olivia.py; falas e voz: scripts/olivia_lines.json + scripts/gravar_valdrak.py. */
const __OL_L = /*__OLINES__*/{"speakers":{"olivia":{"name":["OLIVIA","OLIVIA","OLIVIA"],"voice":"olivia"}},"scenes":{"o_hi":[["olivia","Oi! Eu sou a Olivia. O Rafael é o meu papai!","Hi! I'm Olivia. Rafael is my daddy!","¡Hola! Soy Olivia. ¡Rafael es mi papá!","smile"],["olivia","Eu adoro brincar com os bichinhos. Eles são os meus melhores amigos.","I love playing with the animals. They're my best friends.","Me encanta jugar con los animalitos. Son mis mejores amigos.","smile"]],"o_out1":[["olivia","Essa é a Mussarela! Ela é branquinha com bolinhas pretas, igual um queijo… quer dizer, quase.","This is Mussarela! She's all white with black spots, like a cheese… well, almost.","¡Esta es Mussarela! Es blanquita con manchitas negras, como un queso… bueno, casi.","special"]],"o_out2":[["olivia","Ei! Cuidado pra não pisar no rabo da Mussarela!","Hey! Careful not to step on Mussarela's tail!","¡Oye! ¡Cuidado con pisarle la cola a Mussarela!","aggression"]],"o_out3":[["olivia","O papai é o Rafael, o ferreiro. Ele bate o martelo bem forte, mas me dá abraço bem de leve.","My daddy is Rafael, the blacksmith. He swings the hammer really hard, but he hugs me really gently.","Mi papá es Rafael, el herrero. Golpea el martillo muy fuerte, pero me abraza muy suavecito.","smile"]],"o_in1":[["olivia","Aqui dentro eu brinco com o Fumaça. Ele dorme perto da fornalha porque é quentinho, por isso ficou cinza!","In here I play with Fumaça. He sleeps by the furnace because it's warm, that's why he turned gray!","Aquí dentro juego con Fumaça. Duerme cerca del horno porque está calentito, ¡por eso quedó gris!","calm"]],"o_in2":[["olivia","Sabia que o papai faz espadas? Mas a coisa mais bonita que ele fez fui eu. Foi ele que disse!","Did you know Daddy makes swords? But the prettiest thing he ever made is me. He said so!","¿Sabías que papá hace espadas? Pero lo más bonito que hizo fui yo. ¡Él lo dijo!","special"]],"o_in3":[["olivia","Eu gosto de todos os bichinhos: o Fumaça, a Mussarela, os patinhos do laguinho… até o sapo!","I like all the animals: Fumaça, Mussarela, the little ducks at the pond… even the frog!","Me gustan todos los animalitos: Fumaça, Mussarela, los patitos del laguito… ¡hasta el sapo!","smile"]],"o_sad":[["olivia","O papai fica preocupado quando você demora pra voltar dos portais. Eu também.","Daddy gets worried when you take long to come back from the gates. Me too.","Papá se preocupa cuando tardas en volver de los portales. Yo también.","sadness"]]}}/*__OLINES_END__*/;
{
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path, N = "assets/pixel-art/npc/", ex = k => this.textures.exists(k); L.setPath("");
      ex("olivia") || L.spritesheet("olivia", N + "olivia.png", { frameWidth: 128, frameHeight: 128 });
      ex("mussarela") || L.spritesheet("mussarela", N + "mussarela.png", { frameWidth: 32, frameHeight: 32 });
      ex("gato-o") || L.spritesheet("gato-o", N + "gato-o.png", { frameWidth: 100, frameHeight: 50 });   // quadros de 100x50 (um gato por quadro)
      for (const e of ["talk", "calm", "smile", "sadness", "aggression", "special"]) ex("olivia-p-" + e) || L.image("olivia-p-" + e, `${N}olivia-p-${e}.png`);
      L.setPath(op);
    } catch (e) {}
    return r;
  };
  const I0 = Fl.prototype.__inters;
  Fl.prototype.__inters = function () {
    const r = I0.apply(this, arguments);
    try { this.textures.exists("olivia") && this.textures.exists("mussarela") && __olBuild(this) } catch (e) { console.warn("[olivia]", e) }
    return r;
  };
}
function __olBuild(H) {
  const M = H.M, FI = M.interior, A = H.anims, rnd = Math.random, L3 = __L3, g = M.g;
  if (!FI || !M.house) return;
  const mk = (k, t, fr, rate, rep = -1) => A.exists(k) || A.create({ key: k, frames: A.generateFrameNumbers(t, fr), frameRate: rate, repeat: rep });
  mk("olivia-run", "olivia", { start: 0, end: 11 }, 14); mk("olivia-jump", "olivia", { start: 15, end: 29 }, 16, 0); mk("olivia-idle", "olivia", { frames: [15] }, 1);
  mk("olivia-reach", "olivia", { start: 30, end: 33 }, 8, 0);
  ["d", "l", "r", "u"].forEach((d, i) => { mk("mz-w-" + d, "mussarela", { start: i * 6, end: i * 6 + 5 }, 10); mk("mz-i-" + d, "mussarela", { start: 24 + i * 6, end: 24 + i * 6 + 5 }, 5) });
  mk("gato-o-idle", "gato-o", { start: 0, end: 6 }, 6); mk("gato-o-walk", "gato-o", { start: 11, end: 21 }, 13);
  // regiões: lá fora (frente da forja) e dentro da forja; "pés" a FO px abaixo da posição lógica do herói
  const OUT = { cx: 520, cy: 372, rx: 110, ry: 52, door: [M.house.door[0], M.house.door[1] + 18], sc: .3, mz: 1, spd: 55, fo: 24, rows: () => M.coll, ox: 0, oy: 0 };
  const IN = { cx: FI.x + FI.w * .5, cy: FI.y + FI.h * .68, rx: FI.w * .34, ry: FI.h * .16, door: [FI.door[0], FI.door[1] - 6], sc: .44, mz: 1.4, spd: 70, fo: 35, rows: () => FI.coll, ox: FI.x, oy: FI.y };
  const free = (R, x, y) => { const rows = R.rows(), gy = Math.floor((y - R.fo - R.oy) / g), r = rows[gy]; if (!r) return !1; for (const dx of [-4, 0, 4]) { const gx = Math.floor((x + dx - R.ox) / g); if (r[gx] !== "0") return !1 } return !0 };
  const pathOk = (R, a, b) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 6); for (let i = 1; i <= n; i++) if (!free(R, a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n)) return !1; return !0 };
  const pick = (R, from) => { for (let i = 0; i < 30; i++) { const p = [R.cx + (rnd() * 2 - 1) * R.rx, R.cy + (rnd() * 2 - 1) * R.ry]; if (free(R, p[0], p[1]) && (!from || pathOk(R, from, p))) return p } return null };
  let start = pick(OUT) || [OUT.cx, OUT.cy];
  const O = { area: "out", R: OUT, x: start[0], y: start[1], tgt: null, t: 1, mode: "idle", swap: 40 + rnd() * 30, going: 0 };
  const s = H.add.sprite(O.x, O.y, "olivia", 15).setOrigin(.5, 1).setScale(OUT.sc).setDepth(O.y - OUT.fo).play("olivia-idle");
  const sh = H.add.ellipse(O.x, O.y, 12, 4, 0, .25).setDepth(O.y - OUT.fo - 1);
  // Mussarela (lá fora) e Fumaça (dentro)
  const D = { x: O.x - 18, y: O.y + 4, dir: "d", s: H.add.sprite(O.x - 18, O.y + 4, "mussarela", 24).setOrigin(.5, .85).setDepth(O.y - 20).play("mz-i-d") };
  const cs = H.add.sprite(IN.cx + 40, IN.cy, "gato-o", 0).setOrigin(.5, 1).setScale(.5).setDepth(IN.cy - IN.fo).play("gato-o-idle");
  const C = { x: cs.x, y: cs.y, tgt: null, t: 2, s: cs };
  const hearts = (x, y) => { for (let i = 0; i < 3; i++) { const h = H.add.text(x + (rnd() - .5) * 14, y, "♥", { fontFamily: "Georgia", fontSize: "9px", color: "#ff7a9a", stroke: "#3a0a14", strokeThickness: 2 }).setOrigin(.5).setScale(.6).setDepth(9200); H.tweens.add({ targets: h, y: y - 18 - rnd() * 8, alpha: 0, duration: 900 + rnd() * 300, delay: i * 120, onComplete: () => h.destroy() }) } };
  const face = x => s.setFlipX(x < O.x);
  const goTo = (p, run = !0) => { O.tgt = p; O.mode = "move"; face(p[0]); s.play("olivia-run", !0) };
  const think = () => {
    if (O.going) return;
    const k = rnd();
    if (k < .5) { const p = pick(O.R, [O.x, O.y]); if (p) return goTo(p) }
    if (k < .78) { O.mode = "play"; s.play("olivia-jump", !0); const pet = O.area === "out" ? D : C; face(pet.x); hearts(O.x, O.y - 30 * (O.R.sc / .3)); O.t = 1.1; if (rnd() < .4) try { H.__say(O.x, O.y - 34 * (O.R.sc / .3), O.area === "out" ? L3("Hihi! Pega, Mussarela!", "Hehe! Fetch, Mussarela!", "¡Jiji! ¡Atrapa, Mussarela!") : L3("Vem, Fumaça!", "Come here, Fumaça!", "¡Ven, Fumaça!"), 1600, "#ffe0ec") } catch (e) { } return }
    O.mode = "idle"; s.play("olivia-idle", !0); O.t = 1.2 + rnd() * 2;
  };
  const swapArea = () => {   // vai até a porta, some, aparece do outro lado
    O.going = 1; goTo(O.R.door);
  };
  const arrive = () => {
    const to = O.area === "out" ? IN : OUT;
    H.tweens.add({ targets: [s, sh], alpha: 0, duration: 250, onComplete: () => {
      O.area = O.area === "out" ? "in" : "out"; O.R = to; O.x = to.door[0]; O.y = to.door[1] + (to === IN ? -10 : 8);
      s.setScale(to.sc).setPosition(O.x, O.y); sh.setPosition(O.x, O.y).setScale(to.sc / .3);
      H.tweens.add({ targets: [s, sh], alpha: { from: 0, to: 1 }, duration: 300 });
      O.going = 0; O.swap = 45 + rnd() * 35; O.t = .5; O.mode = "idle"; s.play("olivia-idle", !0);
    } });
  };
  const near = (a, b, d) => Math.hypot(a[0] - b[0], a[1] - b[1]) < d;
  const dogDir = (dx, dy) => Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "l" : "r") : (dy < 0 ? "u" : "d");
  const upd = (_t, ms) => {
    if (!s.active) return; const dt = Math.min(.05, ms / 1000);
    if (H.__olTalk) { O.t = Math.max(O.t, .3) } else {
      O.swap -= dt; if (O.swap <= 0 && !O.going) swapArea();
      if (O.mode === "move" && O.tgt) {
        const dx = O.tgt[0] - O.x, dy = O.tgt[1] - O.y, d = Math.hypot(dx, dy), st = O.R.spd * dt;
        if (d <= st) { O.x = O.tgt[0]; O.y = O.tgt[1]; O.tgt = null; if (O.going) arrive(); else { O.mode = "idle"; s.play("olivia-idle", !0); O.t = .4 + rnd() } }
        else { O.x += dx / d * st; O.y += dy / d * st }
      } else if ((O.t -= dt) <= 0) think();
    }
    s.setPosition(O.x, O.y).setDepth(O.y - O.R.fo); sh.setPosition(O.x, O.y).setDepth(O.y - O.R.fo - 1);
    // Mussarela: corre atrás da Olivia lá fora; quando ela entra, espera sentada na porta
    const tg = O.area === "out" && !O.going ? [O.x + (s.flipX ? 16 : -16), O.y + 4] : [OUT.door[0] + 14, OUT.door[1] + 10];
    const ddx = tg[0] - D.x, ddy = tg[1] - D.y, dd = Math.hypot(ddx, ddy);
    if (dd > 6) { const sp = (dd > 50 ? 95 : 60) * dt; D.x += ddx / dd * Math.min(sp, dd); D.y += ddy / dd * Math.min(sp, dd); D.dir = dogDir(ddx, ddy); D.s.anims.currentAnim?.key !== "mz-w-" + D.dir && D.s.play("mz-w-" + D.dir) }
    else { const fd = O.area === "out" ? dogDir(O.x - D.x, O.y - D.y) : "u"; D.s.anims.currentAnim?.key !== "mz-i-" + fd && D.s.play("mz-i-" + fd) }
    D.s.setPosition(D.x, D.y).setDepth(D.y - 20);
    // Fumaça: passeia devagar pela forja e chega perto da Olivia quando ela está lá dentro
    if (C.tgt) { const cx = C.tgt[0] - C.x, cy = C.tgt[1] - C.y, cd = Math.hypot(cx, cy), st = 34 * dt; if (cd <= st) { C.tgt = null; C.s.play("gato-o-idle", !0); C.t = 2 + rnd() * 3 } else { C.x += cx / cd * st; C.y += cy / cd * st; C.s.setFlipX(cx < 0) } }
    else if ((C.t -= dt) <= 0) { const p = O.area === "in" && rnd() < .6 ? [O.x + (rnd() < .5 ? -22 : 22), O.y + 2] : pick(IN, [C.x, C.y]); if (p && free(IN, p[0], p[1]) && pathOk(IN, [C.x, C.y], p)) { C.tgt = p; C.s.play("gato-o-walk", !0) } else C.t = 1 }
    C.s.setPosition(C.x, C.y).setDepth(C.y - IN.fo);
  };
  H.events.on("update", upd); H.events.once("shutdown", () => H.events.off("update", upd));
  H.__ol = O; H.__olSwap = () => { O.swap = 0 };
  // conversa
  const LN = (__OL_L && __OL_L.scenes) || {}, line = id => (LN[id] || []).map(([who, pt, en, es, e]) => ({ who: "olivia", e: e || "talk", t: L3(pt, en, es) }));
  let n = -1, first = !0;
  const talk = () => {
    if (H.__hubDlgO) return; H.__olTalk = 1; O.mode = "idle"; O.tgt = O.going ? O.tgt : null; s.play("olivia-reach", !0); s.setFlipX(H.playerX < O.x);
    const pool = O.area === "out" ? ["o_out1", "o_out2", "o_out3", "o_sad"] : ["o_in1", "o_in2", "o_in3", "o_sad"];
    const id = first ? "o_hi" : pool[n = (n + 1) % pool.length]; first = !1;
    H.__hubDlg(line(id), () => { H.__olTalk = 0; s.play("olivia-idle", !0); if (O.going) goTo(O.R.door) });
  };
  const px = { x: 0, y: 0 }, far = { x: -9999, y: -9999 };
  const dyn = a => () => { if (O.area !== a || O.going) return far; px.x = O.x; px.y = O.y - O.R.fo; return px };
  H.inters.push({ area: "out", id: "olivia", x: 0, y: 0, r: 26, dyn: dyn("out"), label: "OLIVIA", desc: L3("Conversar", "Talk", "Hablar"), act: () => !H.__tv && talk() });
  H.inters.push({ area: "in", id: "olivia-in", x: 0, y: 0, r: 30, dyn: () => H.__tv ? far : dyn("in")(), label: "OLIVIA", desc: L3("Conversar", "Talk", "Hablar"), act: () => !H.__tv && talk() });
  H.inters.push({ area: "out", id: "mussarela", x: 0, y: 0, r: 22, dyn: () => D, label: "MUSSARELA", desc: L3("Fazer carinho", "Pet", "Acariciar"), act: () => { hearts(D.x, D.y - 18); try { H.__say(D.x, D.y - 22, L3("Au au!", "Woof!", "¡Guau!"), 1300, "#ffd27a"); H.game.audioEngine?.sfx?.("sfx-dog-happy") } catch (e) { } } });
  H.inters.push({ area: "in", id: "algodao", x: 0, y: 0, r: 26, dyn: () => H.__tv ? far : { x: C.x, y: C.y - IN.fo }, label: "FUMAÇA", desc: L3("Fazer carinho", "Pet", "Acariciar"), act: () => { hearts(C.x, C.y - 30); try { H.__say(C.x, C.y - 34, L3("Miau!", "Meow!", "¡Miau!"), 1300, "#ffd27a") } catch (e) { } } });
}
