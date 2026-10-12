/* ===================================================================== BESTIÁRIO (livro)
   Injetado no bundle por scripts/patch_bestiary.py (logo depois da cena de teste "Bestiary").
   Usa, do escopo do bundle: j (Phaser), ee (inimigos), Yt (chefes), ki (fases), ga (facções do
   Modo Infinito), St (tradução de nomes), __L3 (texto por idioma), le (câmera padrão), _ / st (tela).
   Os números vêm das próprias tabelas do jogo: mudou o jogo, o livro acompanha. */
const __BK_INK = "#3b2614", __BK_RED = "#7a1f14", __BK_FAINT = "#7d6648", __BK_SERIF = "Georgia, 'Times New Roman', serif";
const __BK_HIDE = new Set(["SHAMAN_WOLF", "ORC"]);                       // só existe como companheiro do Xamã
const __BK_BOSSES = ["LAVA_GOLEM", "ABYSS_GUARDIAN", "ANCIENT_COLOSSUS", "FROST_WARDEN", "DRAGON_ANCIENT", "ANHANGA", "WILD_ENT",
  "FOX_WITCH", "CASTLE_LORD", "RIVER_TENGU", "GUARDIAN_FALLEN"];
const __BK_ENDLESS_BOSS = new Set(["ABYSS_GUARDIAN", "ANCIENT_COLOSSUS", "FROST_WARDEN", "DRAGON_ANCIENT", "ANHANGA",
  "WILD_ENT", "FOX_WITCH", "CASTLE_LORD", "RIVER_TENGU"]);
const __BK_EXTRA_WHERE = {
  NECRO_SHADE: "Invocada pela Rainha Necromante",
  GHOST: "Invocado pelo Anhangá",
  GUARDIAN_FALLEN: "Castelo de Valdrak — o confronto final",
};
const __BK_LORE = {
  SKELETON: "Ossos de soldados esquecidos, erguidos pela magia que vaza dos selos. Frágeis e sem pensamento próprio, avançam em grupo e sem medo.",
  SKELETON_WARRIOR: "Restos de guardas que ainda lembram da espada. Erguem a lâmina antes de golpear — quem recua a tempo sai ileso.",
  SKELETON_ARCHER: "Mantém distância e dispara flechas de osso. Encurtar o espaço é a melhor defesa contra ele.",
  SKELETON_MAGE: "Um aprendiz de feiticeiro que nunca parou de estudar, nem depois de morto. Lança esferas arcanas de longe e foge do combate corpo a corpo.",
  NECRO_SHADE: "Sombra arrancada de uma alma e posta a serviço de quem a chamou. Rápida e incansável, some quando seu mestre cai.",
  GHOST: "Eco de alguém que morreu sem terminar o que começou. Atravessa paredes e se aproxima sem fazer barulho.",
  DEMON: "Criatura do Abismo que escapou pelas frestas dos selos. Resistente, bate com força e não recua diante de feridas.",
  DEMON_CASTER: "Demônio que aprendeu a moldar o fogo do Abismo. Alterna explosões no chão com projéteis — fique sempre em movimento.",
  GOBLIN: "Pequeno, ganancioso e muito rápido. Anda agachado com sua picareta enferrujada; sozinho é inofensivo, em bando cerca o viajante distraído.",
  GOBLIN_ARCHER: "Caçador covarde que gira a funda e atira pedras escondido atrás dos companheiros. Tem pouca vida: derrube-o primeiro.",
  GOBLIN_ASSASSIN: "A elite dos goblins: lanceiro de pele escura, passos rápidos e estocadas certeiras. Avança de surpresa e recua.",
  ORC: "Guerreiro bruto das terras altas. Difícil de empurrar e paciente na perseguição.",
  ORC_WARRIOR: "Orc veterano, alto e marcado por cicatrizes, que luta com um chicote de corrente. Prepara golpes amplos que cortam tudo à sua frente.",
  ORC_BRUTE: "Rocha animada pelas runas das ruínas. Lento, mas cada pancada esmaga quem estiver por perto.",
  TROLL: "Gigante de um olho só e pele grossa que vive nas matas fundas. Esmaga com os punhos. Aguenta muito castigo e não se deixa empurrar.",
  CYCLOPS: "Colosso de um olho só que guarda as ilhas. Bate no chão com força suficiente para abrir uma onda de choque.",
  DRAGON_WYRMLING: "Filhote de dragão, ainda pequeno mas já perigoso. Morde de perto e cospe fogo em linha reta.",
  DRAGON_DRAKE: "Dragão de escamas carmesim e asas cor de brasa, maior e mais furioso que os filhotes. Combina garras e mordidas com um sopro de fogo devastador.",
  HARPY: "Mulher-pássaro das alturas. Voa rápido, ataca de longe e mergulha quando o alvo se distrai.",
  FIRE_ELEMENTAL: "Corpo de pedra derretida que mantém acesa a forja da Fortaleza. Arremessa magma e faz o chão explodir ao seu redor.",
  DRAGON_PRIEST: "Sacerdote mascarado com o crânio de um dragão, a serviço do Dragão Ancião. Fortalece os aliados próximos — elimine-o antes da tropa.",
  DRAGON_KNIGHT: "Brutamontes rubro jurado aos dragões, com um crânio por elmo e uma clava de tronco no ombro. Alterna golpes rápidos com pancadas esmagadoras.",
  ICE_SKELETON: "Guerreiro esquelético de armadura coberta de geada, conservado no gelo eterno da Cidadela. Mais duro e mais forte que os das catacumbas.",
  FROST_GOBLIN: "Goblin das montanhas geladas, mais forte e mais teimoso que os da floresta.",
  FROST_GOBLIN_ARCHER: "Atira pedras de gelo com a funda do alto dos penhascos. Mantém distância, se esconde na nevasca e seus disparos deixam o alvo lento.",
  FROST_WOLF: "Urso enorme de pelagem branca marcada por runas de gelo. Lento até perceber a presa — então investe de uma vez e golpeia com patadas pesadas.",
  DRAGON_WYRMLING_FROST: "Filhote nascido entre as geleiras. Em vez de fogo, cospe um sopro gélido que congela os passos de quem é atingido.",
  DRAGON_WYRMLING_SHADOW: "Filhote corrompido pelas trevas dos santuários profanados. Seu sopro sombrio é mágico e atravessa armaduras.",
  YETI: "Fera colossal das nevascas, de um olho só e pelagem branca como a neve. Seu golpe pesado derruba até os guerreiros mais firmes.",
  ICE_ELEMENTAL: "Cristal vivo que guarda os salões congelados. Dispara estilhaços e faz o gelo explodir ao seu redor.",
  FROST_DEMON: "Brutamontes de pele congelada, com um crânio por elmo e uma clava coberta de gelo. Corta, dispara e explode em gelo — um dos inimigos mais perigosos do norte.",
  NECRO_SERVANT: "Cadáver erguido pelos necromantes da Floresta Morta. Rápido e sem vontade própria.",
  HUNTER_HOUND: "Cão de caça que perdeu o dono para as Profundezas. Corre mais que qualquer viajante.",
  ABYSS_GUARDIAN: "Guardião do selo das Catacumbas, acorrentado ali desde a queda do Rei. Investe de cabeça baixa e faz o chão tremer com cada pancada.",
  LAVA_GOLEM: "Coração de magma que dormia sob a Pirâmide Esquecida. Desperta quando alguém pisa no deserto: avança em chamas, golpeia com punhos ardentes e explode em ondas de fogo.",
  ANCIENT_COLOSSUS: "Senhora das Ruínas Antigas. Seu olhar petrifica os curiosos, e os destroços que ela arranca do templo caem como chuva.",
  FROST_WARDEN: "Sentinela de gelo que vigia a Cidadela Glacial há séculos. Lança estilhaços e avança como uma avalanche.",
  DRAGON_ANCIENT: "O último dos grandes dragões, adormecido sob a Fortaleza. Domina o céu e o fogo; quando enfurecido, faz chover meteoros.",
  ANHANGA: "Espírito protetor da mata, de olhos de fogo. Pune quem caça sem respeito e chama os fantasmas da floresta para lutar ao seu lado.",
  WILD_ENT: "Górgona que reina sobre as Ilhas. Serpentes no lugar do cabelo e a paciência de uma predadora.",
  FOX_WITCH: "Senhora da Floresta Morta. Ergue sombras dos mortos para lutar por ela e nunca combate sozinha.",
  CASTLE_LORD: "A presença que tomou o corpo do Rei e o trono de Valdrak. Tudo vê, e usa os próprios salões do castelo contra quem entra.",
  RIVER_TENGU: "Espírito-corvo que domina os ventos entre as ilhas. Aparece para quem desce fundo demais nas Profundezas.",
  GUARDIAN_FALLEN: "A própria Guardiã, consumida pelos selos que jurou proteger. Séculos de espera viraram fome.",
};
const __BK_ATK = {
  MELEE_SLASH: "Golpe cortante", PROJECTILE: "Disparo à distância", AREA_BLAST: "Explosão em área",
  HEAVY_SMASH: "Golpe esmagador", FIRE_BREATH: "Sopro de fogo", BUFF_ALLIES: "Fortalece aliados",
  SLAM: "Pancada no chão", CHARGE: "Investida", SHOCKWAVE: "Onda de choque", ROCKS: "Chuva de pedras",
  BITE: "Mordida", CLAW: "Garra", TAIL_SWEEP: "Golpe de cauda", ROAR: "Rugido", FIRE_METEOR: "Chuva de meteoros",
  FLYOVER: "Voo rasante", ICE_SHARDS: "Estilhaços de gelo",
};
const __BK_SIZE = { small: "Pequeno", medium: "Médio", large: "Grande", huge: "Enorme" };

function __bkKills() { try { return JSON.parse(localStorage.getItem("depthgate:bestiary") || "{}") } catch (e) { return {} } }
function __bkKill(k) { if (!k) return; const K = __bkKills(); K[k] = (K[k] || 0) + 1; try { localStorage.setItem("depthgate:bestiary", JSON.stringify(K)) } catch (e) { } }
function __bestTrack(G) {
  if (!G || G.__bkTr) return; G.__bkTr = !0;
  G.events.on("enemy:died", e => { e && !e.isMinion && __bkKill(e.typeKey) });
  G.events.on("boss:defeated", b => __bkKill(b?.typeKey));
}
function __bkEntries() {
  const reg = {}, nm = id => { try { return St(`lvl.${id}`, ki[id]?.name ?? id) } catch (e) { return ki[id]?.name ?? id } };
  try {
    for (const [id, lv] of Object.entries(ki)) for (const r of lv.rooms || []) {
      for (const e of r.enemies || []) (reg[e.type] ??= new Set).add(nm(id));
      r.boss && (reg[r.boss] ??= new Set).add(nm(id));
    }
  } catch (e) { }
  const deep = {};
  try { for (const f of Object.values(ga)) for (const m of f.members || []) deep[m.type] = Math.min(deep[m.type] ?? 999, m.minDepth) } catch (e) { }
  const out = [];
  for (const k of Object.keys(ee)) {
    if (__BK_HIDE.has(k)) continue;
    out.push({ k, boss: !1, d: ee[k], where: [...(reg[k] || [])], deep: deep[k] ?? null });
  }
  for (const k of __BK_BOSSES) {
    if (!Yt[k]) continue;
    out.push({ k, boss: !0, d: Yt[k], where: [...(reg[k] || [])], deep: __BK_ENDLESS_BOSS.has(k) ? 1 : null });
  }
  for (const e of out) __BK_EXTRA_WHERE[e.k] && e.where.push(__BK_EXTRA_WHERE[e.k]);
  return out;
}
function __bestiaryOpen(from) {
  const G = from?.game; if (!G) return;
  if (G.scene.isActive("BestiaryBook")) return;
  G.scene.getScene("BestiaryBook") || G.scene.add("BestiaryBook", __BookScene, !1);
  from.scene.pause();
  G.scene.run("BestiaryBook", { from: from.scene.key });
  G.scene.bringToTop("BestiaryBook");
}

class __BookScene extends j.Scene {
  constructor() { super("BestiaryBook") }
  init(d) { this.from = d?.from ?? null; this.__closing = !1; this.busy = !1 }
  create() {
    le(this);
    this.E = __bkEntries(); this.K = __bkKills();
    this.nC = this.E.filter(e => !e.boss).length; this.nB = this.E.length - this.nC;
    this.maxHpC = Math.max(...this.E.filter(e => !e.boss).map(e => e.d.maxHp || 1));
    this.maxHpB = Math.max(...this.E.filter(e => e.boss).map(e => e.d.maxHp || 1));
    this.maxDmg = Math.max(...this.E.map(e => e.d.damage ?? e.d.contactDamage ?? 1));
    this.maxSpd = Math.max(...this.E.map(e => e.d.speed || 1));
    this.FRONT = 3; this.spread = 0; this.sel = 0; this.nSpreads = this.FRONT + this.E.length;
    this.cx = Math.round(_ / 2);
    this.add.rectangle(this.cx, st / 2, _ * 1.5, st * 1.5, 395780, .8).setInteractive();
    this.bookG = this.add.graphics(); this.drawBook();
    this.L = this.add.container(0, 0); this.R = this.add.container(0, 0);
    this.fx = this.add.graphics();
    this.drawChrome();
    this.render();
    // teclado direto na página: o teclado do Phaser numa cena criada agora perde a 1ª tecla
    this.__kd = ev => {
      if (!this.sys.isActive() || ev.repeat && !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(ev.key)) return;
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " ", "PageUp", "PageDown", "Backspace"].includes(ev.key) && ev.preventDefault();
      this.key(ev.key);
    };
    window.addEventListener("keydown", this.__kd);
    this.events.once("shutdown", () => window.removeEventListener("keydown", this.__kd));
    this.input.on("wheel", (p, g, dx, dy) => { Math.abs(dy) > 4 && this.go(this.spread + (dy > 0 ? 1 : -1)) });
    this.__pad = this.padState();
    this.cameras.main.fadeIn(160, 6, 4, 10);
    this.game.audioEngine?.sfx("sfx-ui-open");
  }
  // ------------------------------------------------------------------ livro (capa, páginas, fitas)
  drawBook() {
    const g = this.bookG, cx = this.cx, X0 = cx - 306, Y0 = 10, W = 612, H = 340;
    g.fillStyle(0, .5).fillRoundedRect(X0 + 7, Y0 + 9, W, H, 14);
    g.fillStyle(3809810, 1).fillRoundedRect(X0, Y0, W, H, 12);
    g.fillStyle(4862490, .5).fillRoundedRect(X0 + 3, Y0 + 3, W - 6, H / 2, 10);
    g.lineStyle(2, 2233098, 1).strokeRoundedRect(X0, Y0, W, H, 12);
    g.lineStyle(1, 9070138, .75).strokeRoundedRect(X0 + 5, Y0 + 5, W - 10, H - 10, 9);
    g.fillStyle(11568208, .5);
    for (let x = X0 + 16; x < X0 + W - 16; x += 7) g.fillRect(x, Y0 + 9, 4, 1), g.fillRect(x, Y0 + H - 10, 4, 1);
    for (let y = Y0 + 16; y < Y0 + H - 16; y += 7) g.fillRect(X0 + 9, y, 1, 4), g.fillRect(X0 + W - 10, y, 1, 4);
    for (const [x, y, sx, sy] of [[X0, Y0, 1, 1], [X0 + W, Y0, -1, 1], [X0, Y0 + H, 1, -1], [X0 + W, Y0 + H, -1, -1]]) {
      g.fillStyle(13214282, 1).fillTriangle(x, y, x + 20 * sx, y, x, y + 20 * sy);
      g.fillStyle(8018468, 1).fillTriangle(x + 3 * sx, y + 3 * sy, x + 12 * sx, y + 3 * sy, x + 3 * sx, y + 12 * sy);
    }
    const P = this.P = { l: cx - 292, r: cx + 292, t: 21, b: 337 };
    for (let i = 5; i >= 1; i--) g.fillStyle(i % 2 ? 13351055 : 14272415, 1).fillRoundedRect(P.l - i, P.t + i * .5, (P.r - P.l) + 2 * i, (P.b - P.t) + i, 3);
    g.fillStyle(15391926, 1).fillRect(P.l, P.t, cx - 1 - P.l, P.b - P.t).fillRect(cx + 1, P.t, P.r - cx - 1, P.b - P.t);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 420; i++) g.fillStyle(rnd() < .5 ? 12166263 : 13088144, .25 + rnd() * .2).fillRect(P.l + rnd() * (P.r - P.l), P.t + rnd() * (P.b - P.t), 1, 1);
    for (let i = 0; i < 7; i++) g.fillStyle(10717783, .045).fillCircle(P.l + rnd() * (P.r - P.l), P.t + rnd() * (P.b - P.t), 10 + rnd() * 26);
    for (let i = 0; i < 26; i++) { const a = .24 * (1 - i / 26) ** 2; g.fillStyle(5913114, a).fillRect(cx - 1 - i - 1, P.t, 1, P.b - P.t).fillRect(cx + 1 + i, P.t, 1, P.b - P.t) }
    for (let i = 0; i < 10; i++) { const a = .1 * (1 - i / 10); g.fillStyle(6965802, a).fillRect(P.l + i, P.t, 1, P.b - P.t).fillRect(P.r - 1 - i, P.t, 1, P.b - P.t) }
    g.fillStyle(3809810, .5).fillRect(cx - 1, P.t, 2, P.b - P.t);
    // fita marcadora: só a ponta aparece, saindo de baixo das páginas
    g.fillStyle(7999252, 1).fillRect(cx + 150, P.b - 2, 9, 14).fillTriangle(cx + 150, P.b + 12, cx + 159, P.b + 12, cx + 154.5, P.b + 6);
    g.fillStyle(0, .2).fillRect(cx + 157, P.b - 2, 2, 12);
  }
  drawChrome() {
    const cx = this.cx, X1 = cx + 306;
    const tabs = [[__L3("ÍNDICE", "INDEX", "ÍNDICE"), 6955546, () => this.go(1)],
                  [__L3("CRIATURAS", "CREATURES", "CRIATURAS"), 3099178, () => this.go(this.FRONT)],
                  [__L3("CHEFES", "BOSSES", "JEFES"), 8018452, () => this.go(this.FRONT + this.nC)]];
    this.tabG = this.add.graphics();
    this.tabs = tabs.map(([lab, col, fn], i) => {
      const y = 46 + i * 66, h = 58;
      const t = this.add.text(X1 + 11, y + h / 2, lab, { fontFamily: __BK_SERIF, fontStyle: "bold", fontSize: "8px", color: "#f3e6c4" }).setOrigin(.5).setAngle(90);
      const z = this.add.zone(X1 + 10, y + h / 2, 22, h).setInteractive({ useHandCursor: !0 });
      z.on("pointerdown", fn);
      return { y, h, col, t, z };
    });
    const close = this.add.text(X1 - 4, 12, "✕", { fontFamily: __BK_SERIF, fontStyle: "bold", fontSize: "13px", color: "#f3e6c4", backgroundColor: "#5a1a12", padding: { x: 6, y: 3 } }).setOrigin(.5).setInteractive({ useHandCursor: !0 });
    close.on("pointerdown", () => this.close());
    const mk = (x, s, d) => {
      const t = this.add.text(x, 326, s, { fontFamily: __BK_SERIF, fontStyle: "bold", fontSize: "14px", color: __BK_RED }).setOrigin(.5).setInteractive({ useHandCursor: !0 });
      t.on("pointerdown", () => this.go(this.spread + d)); t.on("pointerover", () => t.setColor("#b0402a")); t.on("pointerout", () => t.setColor(__BK_RED));
      return t;
    };
    this.prevB = mk(this.P.l + 16, "◀", -1); this.nextB = mk(this.P.r - 16, "▶", 1);
    this.hint = this.add.text(cx, 352, "", { fontFamily: "'Courier New', monospace", fontStyle: "bold", fontSize: "8px", color: "#b8a888" }).setOrigin(.5, 1);
  }
  drawTabs() {
    const g = this.tabG, X1 = this.cx + 306; g.clear();
    const cur = this.spread < this.FRONT ? 0 : (this.spread < this.FRONT + this.nC ? 1 : 2);
    this.tabs.forEach((b, i) => {
      const w = i === cur ? 26 : 21;
      g.fillStyle(0, .35).fillRect(X1 - 2, b.y + 3, w + 2, b.h);
      g.fillStyle(b.col, 1).fillRect(X1 - 4, b.y, w, b.h);
      g.fillStyle(16777215, .12).fillRect(X1 - 4, b.y, w, 3);
      b.t.setX(X1 - 4 + w / 2);
    });
  }
  // ------------------------------------------------------------------ texto
  T(c, x, y, s, size = 9, color = __BK_INK, o = {}) {
    const t = this.add.text(x, y, s, { fontFamily: __BK_SERIF, fontSize: size + "px", color, lineSpacing: o.ls ?? 2, fontStyle: o.st ?? "normal", align: o.al ?? "left", wordWrap: o.ww ? { width: o.ww } : void 0 });
    o.ox != null && t.setOrigin(o.ox, o.oy ?? 0);
    c.add(t); return t;
  }
  rule(c, x0, x1, y, col = 9070138, a = .8) { const g = this.add.graphics(); g.lineStyle(1, col, a).lineBetween(x0, y, x1, y); c.add(g); return g }
  orn(c, x, y, w = 70) {
    const g = this.add.graphics(); g.lineStyle(1, 7999252, .9).lineBetween(x - w, y, x - 7, y).lineBetween(x + 7, y, x + w, y);
    g.fillStyle(7999252, 1).fillTriangle(x - 4, y, x, y - 4, x + 4, y).fillTriangle(x - 4, y, x, y + 4, x + 4, y);
    g.fillStyle(7999252, 1).fillCircle(x - w - 2, y, 1.6).fillCircle(x + w + 2, y, 1.6); c.add(g);
  }
  // ------------------------------------------------------------------ páginas
  render() {
    for (const c of [this.L, this.R]) { c.removeAll(!0); c.setAlpha(1) }
    const cx = this.cx, LX = cx - 276, RX = cx + 20, PW = 256, s = this.spread;
    const pn = (c, x, n) => this.T(c, x + PW / 2, 319, `— ${n} —`, 8, __BK_FAINT, { ox: .5 });
    pn(this.L, LX, 2 * s + 1); pn(this.R, RX, 2 * s + 2);
    const run = (c, x, str) => this.T(c, x + PW / 2, 26, str.toUpperCase(), 7, __BK_FAINT, { ox: .5, st: "bold" });
    if (s === 0) this.pageTitle(LX, RX, PW);
    else if (s === 1) { run(this.L, LX, __L3("Índice", "Index", "Índice")); run(this.R, RX, __L3("Índice", "Index", "Índice")); this.pageIndex(this.L, LX, PW, 0, Math.ceil(this.nC / 2), __L3("CRIATURAS", "CREATURES", "CRIATURAS")); this.pageIndex(this.R, RX, PW, Math.ceil(this.nC / 2), this.nC, null) }
    else if (s === 2) { run(this.L, LX, __L3("Índice", "Index", "Índice")); run(this.R, RX, __L3("Como ler", "How to read", "Cómo leer")); this.pageIndex(this.L, LX, PW, this.nC, this.E.length, __L3("CHEFES", "BOSSES", "JEFES")); this.pageLegend(RX, PW) }
    else { const e = this.E[s - this.FRONT]; run(this.L, LX, e.boss ? __L3("Chefes", "Bosses", "Jefes") : __L3("Criaturas", "Creatures", "Criaturas")); run(this.R, RX, e.d.name); this.pageEntryL(e, LX, PW); this.pageEntryR(e, RX, PW) }
    this.prevB.setVisible(s > 0); this.nextB.setVisible(s < this.nSpreads - 1);
    this.drawTabs();
    const pad = typeof __usingPad === "function" && __usingPad();
    this.hint.setText(pad ? `✥ ${__L3("PÁGINAS", "PAGES", "PÁGINAS")}    A ${__L3("ABRIR", "OPEN", "ABRIR")}    B ${__L3("FECHAR", "CLOSE", "CERRAR")}    Y ${__L3("ÍNDICE", "INDEX", "ÍNDICE")}`
      : `← → ${__L3("VIRAR PÁGINAS", "TURN PAGES", "PASAR PÁGINAS")}    ↑ ↓ ENTER ${__L3("ÍNDICE", "INDEX", "ÍNDICE")}    ESC ${__L3("FECHAR", "CLOSE", "CERRAR")}`);
  }
  pageTitle(LX, RX, PW) {
    const L = this.L, R = this.R, mx = LX + PW / 2;
    this.orn(L, mx, 74, 84);
    this.T(L, mx, 92, __L3("BESTIÁRIO", "BESTIARY", "BESTIARIO"), 26, __BK_RED, { ox: .5, st: "bold" });
    this.T(L, mx, 126, __L3("das Profundezas", "of the Depths", "de las Profundidades"), 13, __BK_INK, { ox: .5, st: "italic" });
    this.orn(L, mx, 152, 84);
    this.T(L, mx, 170, __L3("Registro das criaturas de Eldervale, das masmorras sob os selos e do Abismo. Escrito para os que descem — e para os que pretendem voltar.",
      "A record of the creatures of Eldervale, of the dungeons beneath the seals and of the Abyss. Written for those who descend — and for those who mean to return.",
      "Registro de las criaturas de Eldervale, de las mazmorras bajo los sellos y del Abismo. Escrito para quienes descienden — y para quienes pretenden volver."), 9.5, __BK_INK, { ox: .5, st: "italic", al: "center", ww: 218, ls: 4 });
    this.T(L, mx, 282, __L3("— registrado pela Guardiã —", "— recorded by the Guardian —", "— registrado por la Guardiana —"), 8, __BK_FAINT, { ox: .5, st: "italic" });
    const rx = RX + PW / 2;
    this.T(R, rx, 50, __L3("SUMÁRIO", "CONTENTS", "SUMARIO"), 14, __BK_RED, { ox: .5, st: "bold" });
    this.orn(R, rx, 72, 60);
    const ch = [[__L3("I. Índice das criaturas", "I. Index of creatures", "I. Índice de criaturas"), 1],
                [__L3("II. Índice dos chefes", "II. Index of bosses", "II. Índice de jefes"), 2],
                [__L3("III. Criaturas", "III. Creatures", "III. Criaturas"), this.FRONT],
                [__L3("IV. Chefes", "IV. Bosses", "IV. Jefes"), this.FRONT + this.nC]];
    ch.forEach(([lab, sp], i) => this.leader(R, RX, PW, 92 + i * 20, lab, 2 * sp + 1, () => this.go(sp), 10));
    const kills = Object.values(this.K).reduce((a, b) => a + b, 0);
    const seen = this.E.filter(e => this.K[e.k]).length;
    const y0 = 196; this.rule(R, RX + 30, RX + PW - 30, y0 - 8, 9070138, .5);
    this.T(R, rx, y0, `${__L3("Criaturas registradas", "Creatures recorded", "Criaturas registradas")}: ${this.nC}`, 9.5, __BK_INK, { ox: .5 });
    this.T(R, rx, y0 + 16, `${__L3("Chefes registrados", "Bosses recorded", "Jefes registrados")}: ${this.nB}`, 9.5, __BK_INK, { ox: .5 });
    this.T(R, rx, y0 + 32, `${__L3("Espécies já derrotadas", "Species defeated", "Especies derrotadas")}: ${seen} / ${this.E.length}`, 9.5, __BK_INK, { ox: .5 });
    this.T(R, rx, y0 + 48, `${__L3("Inimigos derrotados", "Enemies defeated", "Enemigos derrotados")}: ${kills}`, 9.5, __BK_INK, { ox: .5 });
    this.T(R, rx, 286, __L3("Os valores deste livro são os de base: elites, chefes enfurecidos e o Modo Infinito são mais fortes.",
      "Values in this book are base values: elites, enraged bosses and Endless Mode are stronger.",
      "Los valores de este libro son los base: élites, jefes furiosos y el Modo Infinito son más fuertes."), 7.5, __BK_FAINT, { ox: .5, st: "italic", al: "center", ww: 220 });
  }
  leader(c, X, PW, y, lab, page, fn, size = 9, selected = !1) {
    y = Math.round(y);
    const t = this.T(c, X + 8, y, lab, size, __BK_INK, { st: selected ? "bold" : "normal" });
    const p = this.T(c, X + PW - 8, y, String(page), size, __BK_INK, { ox: 1 });
    const x0 = X + 8 + t.width + 4, x1 = X + PW - 8 - p.width - 4, g = this.add.graphics();
    g.fillStyle(9070138, .8); for (let x = x0; x < x1; x += 4) g.fillRect(x, y + size * .95, 1, 1);
    selected && g.fillStyle(7999252, .14).fillRect(X + 2, y - 2, PW - 4, size + 6);
    c.add(g); c.sendToBack(g);
    const z = this.add.zone(X + PW / 2, y + size / 2 + 1, PW - 8, size + 6).setInteractive({ useHandCursor: !0 });
    z.on("pointerdown", fn); z.on("pointerover", () => t.setColor(__BK_RED)); z.on("pointerout", () => t.setColor(__BK_INK));
    c.add(z); return t;
  }
  pageIndex(c, X, PW, a, b, head) {
    let y = 44;
    if (head) { this.T(c, X + PW / 2, y, head, 11, __BK_RED, { ox: .5, st: "bold" }); this.orn(c, X + PW / 2, y + 20, 50); y += 30 }
    else y += 30;
    const n = b - a, step = Math.floor(Math.min(17, (300 - y) / Math.max(1, n)));
    for (let i = a; i < b; i++) {
      const e = this.E[i], num = e.boss ? i - this.nC + 1 : i + 1;
      this.leader(c, X, PW, y + (i - a) * step, `${String(num).padStart(2, "0")}  ${e.d.name}`, 2 * (this.FRONT + i) + 1, () => this.go(this.FRONT + i), 9, (this.spread === 1 || this.spread === 2) && i === this.sel);
    }
  }
  pageLegend(X, PW) {
    const R = this.R; let y = 44;
    this.T(R, X + PW / 2, y, __L3("COMO LER ESTE LIVRO", "HOW TO READ THIS BOOK", "CÓMO LEER ESTE LIBRO"), 11, __BK_RED, { ox: .5, st: "bold" }); this.orn(R, X + PW / 2, y + 20, 50); y += 34;
    const rows = __L3([
      ["Vida", "quantos golpes a criatura aguenta."], ["Dano", "o dano de contato, ao encostar em você."], ["Velocidade", "quão rápido ela se move."],
      ["Porte", "o tamanho do corpo."], ["XP e ouro", "o que ela deixa ao ser derrotada."], ["Ataques", "os golpes especiais e o dano de cada um."],
      ["Traços", "comportamentos que mudam a luta."], ["Onde encontrar", "regiões da campanha e, no Modo Infinito, a profundidade em que começa a aparecer."]],
      [["Health", "how many hits the creature can take."], ["Damage", "contact damage when it touches you."], ["Speed", "how fast it moves."],
      ["Size", "how big its body is."], ["XP and gold", "what it drops when defeated."], ["Attacks", "special moves and the damage of each."],
      ["Traits", "behaviours that change the fight."], ["Where to find", "campaign regions and, in Endless Mode, the depth where it starts to appear."]],
      [["Vida", "cuántos golpes aguanta la criatura."], ["Daño", "el daño por contacto."], ["Velocidad", "qué tan rápido se mueve."],
      ["Tamaño", "el tamaño del cuerpo."], ["XP y oro", "lo que deja al ser derrotada."], ["Ataques", "los golpes especiales y su daño."],
      ["Rasgos", "comportamientos que cambian la pelea."], ["Dónde encontrar", "regiones de la campaña y, en el Modo Infinito, la profundidad en que empieza a aparecer."]]);
    for (const [k, v] of rows) {
      const a = this.T(R, X + 8, y, k, 9, __BK_RED, { st: "bold" });
      const b = this.T(R, X + 8, y + 12, v, 8.5, __BK_INK, { ww: PW - 16 });
      y += 12 + b.height + 3;
    }
  }
  bbox(tex) {
    const c = this.__bb || (this.__bb = {}); if (c[tex] !== void 0) return c[tex];
    try {
      const f = this.textures.getFrame(tex, 0); if (!f || !f.source?.image) return c[tex] = null;
      const cv = document.createElement("canvas"); cv.width = f.cutWidth; cv.height = f.cutHeight;
      const x = cv.getContext("2d"); x.drawImage(f.source.image, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.cutWidth, f.cutHeight);
      const d = x.getImageData(0, 0, cv.width, cv.height).data; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let y = 0; y < cv.height; y++) for (let xx = 0; xx < cv.width; xx++) if (d[(y * cv.width + xx) * 4 + 3] > 24) { xx < x0 && (x0 = xx); xx > x1 && (x1 = xx); y < y0 && (y0 = y); y > y1 && (y1 = y) }
      return c[tex] = x1 < 0 ? { x: 0, y: 0, w: f.cutWidth, h: f.cutHeight } : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
    } catch (e) { return c[tex] = null }
  }
  gameScale(e) {
    const d = e.d;
    if (e.boss) return d.scale || 1;
    return (Si[d.texture] ?? 1) * (ui[d.sizeClass]?.scale ?? 1);
  }
  pageEntryL(e, X, PW) {
    const L = this.L, d = e.d, idx = e.boss ? this.E.indexOf(e) - this.nC + 1 : this.E.indexOf(e) + 1;
    this.T(L, X + 2, 40, `${e.boss ? __L3("CHEFE", "BOSS", "JEFE") : __L3("CRIATURA", "CREATURE", "CRIATURA")}  ·  Nº ${String(idx).padStart(2, "0")}`, 7.5, __BK_RED, { st: "bold" });
    const nm = this.T(L, X + 2, 52, d.name, d.name.length > 24 ? 13 : 16, __BK_INK, { st: "bold", ww: PW - 4 });
    let y = 52 + nm.height + 1;
    if (d.subtitle) { const s = this.T(L, X + 2, y, d.subtitle, 9, __BK_RED, { st: "italic" }); y += s.height + 1 }
    // moldura da ilustração
    const bx = X + 4, by = Math.max(y + 6, 84), bw = PW - 8, bh = 132, g = this.add.graphics();
    g.fillStyle(14011295, 1).fillRect(bx, by, bw, bh);
    for (let i = 0; i < 10; i++) g.fillStyle(9070138, .05 * (1 - i / 10)).fillRect(bx + i, by + i, bw - 2 * i, 1).fillRect(bx + i, by + bh - 1 - i, bw - 2 * i, 1);
    g.lineStyle(2, 8018468, 1).strokeRect(bx, by, bw, bh); g.lineStyle(1, 8018468, .6).strokeRect(bx + 4, by + 4, bw - 8, bh - 8);
    for (const [x, yy] of [[bx, by], [bx + bw, by], [bx, by + bh], [bx + bw, by + bh]]) g.fillStyle(7999252, 1).fillCircle(x, yy, 2.5);
    g.fillStyle(5913114, .22).fillEllipse(bx + bw / 2, by + bh - 16, 92, 12);
    L.add(g);
    const tex = d.texture;
    if (tex && this.textures.exists(tex)) {
      const bb = this.bbox(tex) || { x: 0, y: 0, w: 64, h: 64 };
      // escala proporcional ao tamanho real no jogo: o maior do grupo preenche a moldura
      const fit = (q, gs) => Math.min((bw - 30) / (q.w * gs), (bh - 26) / (q.h * gs));
      if (!this.__pk) {
        this.__pk = {};
        for (const grp of [!1, !0]) {
          let k = 1e9;
          for (const o of this.E) if (!!o.boss === grp && o.d.texture && this.textures.exists(o.d.texture)) {
            const q = this.bbox(o.d.texture); q && (k = Math.min(k, fit(q, this.gameScale(o))));
          }
          this.__pk[grp ? "b" : "c"] = k < 1e9 ? k : 1;
        }
      }
      let sc = (e.boss ? this.__pk.b : this.__pk.c) * this.gameScale(e);
      sc = Math.min(sc, fit(bb, 1));
      const sp = this.add.sprite(0, 0, tex, 0).setOrigin(0, 0).setScale(sc);
      sp.setPosition(Math.round(bx + bw / 2 - (bb.x + bb.w / 2) * sc), Math.round(by + bh - 14 - (bb.y + bb.h) * sc));
      const an = `${tex}-idle`; this.anims.exists(an) && sp.play(an);
      L.add(sp);
    } else this.T(L, bx + bw / 2, by + bh / 2 - 12, "?", 26, __BK_FAINT, { ox: .5, st: "bold" });
    // descrição
    const lore = __BK_LORE[e.k] || "";
    this.T(L, X + 2, by + bh + 10, lore, 9.5, __BK_INK, { st: "italic", ww: PW - 4, ls: 3 });
    const k = this.K[e.k] || 0;
    this.T(L, X + PW / 2, 300, k ? `${__L3("Derrotados por você", "Defeated by you", "Derrotados por ti")}: ${k}` : __L3("Ainda não derrotado", "Not yet defeated", "Aún no derrotado"), 8, k ? __BK_INK : __BK_FAINT, { ox: .5, st: "italic" });
  }
  pageEntryR(e, X, PW) {
    const R = this.R, d = e.d; let y = 40;
    const head = s => { this.T(R, X + 2, y, s, 9.5, __BK_RED, { st: "bold" }); this.rule(R, X + 2, X + PW - 2, y + 13, 9070138, .6); y += 17 };
    const bar = (lab, val, ratio, txt) => {
      this.T(R, X + 4, y, lab, 8.5, __BK_INK, { st: "bold" });
      const g = this.add.graphics(), x0 = X + 84, w = PW - 84 - 54;
      g.fillStyle(13351055, 1).fillRect(x0, y + 3, w, 5); g.fillStyle(9054746, 1).fillRect(x0, y + 3, Math.max(2, w * Math.min(1, ratio)), 5);
      g.lineStyle(1, 8018468, .7).strokeRect(x0, y + 3, w, 5); R.add(g);
      this.T(R, X + PW - 4, y, txt ?? String(val), 8.5, __BK_INK, { ox: 1 }); y += 14;
    };
    const row = (lab, txt) => { this.T(R, X + 4, y, lab, 8.5, __BK_INK, { st: "bold" }); this.T(R, X + PW - 4, y, txt, 8.5, __BK_INK, { ox: 1 }); y += 13 };
    head(__L3("ATRIBUTOS", "ATTRIBUTES", "ATRIBUTOS"));
    const dmg = d.damage ?? d.contactDamage ?? 0, spd = d.speed || 0;
    const sw = spd < 60 ? __L3("lenta", "slow", "lenta") : spd < 95 ? __L3("média", "average", "media") : spd < 145 ? __L3("rápida", "fast", "rápida") : __L3("muito rápida", "very fast", "muy rápida");
    bar(__L3("Vida", "Health", "Vida"), d.maxHp, (d.maxHp || 0) / (e.boss ? this.maxHpB : this.maxHpC));
    bar(e.boss ? __L3("Dano (contato)", "Damage (contact)", "Daño (contacto)") : __L3("Dano", "Damage", "Daño"), dmg, dmg / this.maxDmg);
    bar(__L3("Velocidade", "Speed", "Velocidad"), spd, spd / this.maxSpd, sw);
    row(__L3("Porte", "Size", "Tamaño"), e.boss ? __L3("Colossal", "Colossal", "Colosal") : (__BK_SIZE[d.sizeClass] ?? "—"));
    const gd = d.gold, gtx = gd ? `${gd.min}–${gd.max}${gd.chance != null && gd.chance < 1 ? ` (${Math.round(gd.chance * 100)}%)` : ""}` : "";
    if (e.boss) row(__L3("Recompensa", "Reward", "Recompensa"), `${d.xp ?? 0} XP · ${gtx} ${__L3("ouro", "gold", "oro")}`);
    else { row(__L3("Experiência", "Experience", "Experiencia"), `${d.xp ?? 0} XP`); gd && row(__L3("Ouro", "Gold", "Oro"), gtx) }
    e.boss && d.attackCooldownMs && row(__L3("Intervalo entre ataques", "Time between attacks", "Intervalo entre ataques"), `${(d.attackCooldownMs / 1e3).toFixed(1)} s`);
    y += 4; head(__L3("ATAQUES", "ATTACKS", "ATAQUES"));
    const atk = [];
    if (e.boss) { for (const [k, a] of Object.entries(d.attacks || {})) atk.push([__BK_ATK[k] ?? k, a?.damage]) }
    else { for (const a of d.ai?.attacks || []) atk.push([
      a.type === "PROJECTILE" && a.texture === "proj-arrow" ? __L3("Flechas", "Arrows", "Flechas")
      : a.type === "PROJECTILE" && /GOBLIN_ARCHER/.test(e.k) ? __L3("Pedras de funda", "Sling stones", "Piedras de honda")
      : a.type === "FIRE_BREATH" && a.status?.key === "SLOW" ? __L3("Sopro gélido (deixa lento)", "Frost breath (slows)", "Aliento gélido (ralentiza)")
      : a.type === "FIRE_BREATH" && a.damageType === "magical" ? __L3("Sopro sombrio (mágico)", "Shadow breath (magic)", "Aliento sombrío (mágico)")
      : (__BK_ATK[a.type] ?? a.type), a.damage]) }
    if (!atk.length) atk.push([__L3("Ataque corpo a corpo", "Melee strike", "Ataque cuerpo a cuerpo"), dmg]);
    const dl = __L3("de dano", "damage", "de daño");
    if (atk.length > 3) {                                   // muitos ataques (chefes): duas colunas
      const h = Math.ceil(atk.length / 2), col = a => a.map(([n, v]) => `•  ${n}${v ? ` · ${v}` : ""}`).join("\n");
      const a1 = this.T(R, X + 4, y, col(atk.slice(0, h)), 8.5, __BK_INK, { ww: PW / 2 - 6, ls: 2 });
      this.T(R, X + PW / 2 + 2, y, col(atk.slice(h)), 8.5, __BK_INK, { ww: PW / 2 - 6, ls: 2 });
      y += a1.height + 2;
      this.T(R, X + 4, y, __L3("(número = dano)", "(number = damage)", "(número = daño)"), 7, __BK_FAINT, { st: "italic" }); y += 14;
    } else {
      const atxt = atk.map(([n, v]) => `•  ${n}${v ? ` — ${v} ${dl}` : ""}`).join("\n");
      const at = this.T(R, X + 4, y, atxt, 8.5, __BK_INK, { ww: PW - 8, ls: 2 }); y += at.height + 8;
    }
    const tr = [];
    if (d.knockbackResist || d.sizeClass === "huge") tr.push(__L3("Resiste a empurrões", "Resists knockback", "Resiste empujones"));
    if (d.behavior === "ghost") tr.push(__L3("Etéreo: atravessa paredes", "Ethereal: passes through walls", "Etéreo: atraviesa paredes"));
    if (d.ai?.preferredRange) tr.push(__L3("Mantém distância de você", "Keeps its distance", "Mantiene la distancia"));
    if (d.ai?.patrol) tr.push(__L3("Patrulha a área antes de notar você", "Patrols before noticing you", "Patrulla antes de notarte"));
    if (d.ai?.movementMode === "flying") tr.push(__L3("Voa", "Flies", "Vuela"));
    if (e.boss && d.phase2) tr.push(__L3(`Enfurece com ${Math.round((d.phase2.hpRatio || .5) * 100)}% de vida: mais rápido e mais forte`, `Enrages at ${Math.round((d.phase2.hpRatio || .5) * 100)}% health: faster and stronger`, `Se enfurece al ${Math.round((d.phase2.hpRatio || .5) * 100)}% de vida: más rápido y fuerte`));
    if (e.boss && Array.isArray(d.phases) && d.phases.length) tr.push(__L3(`Luta em ${d.phases.length + 1} fases`, `Fights in ${d.phases.length + 1} phases`, `Pelea en ${d.phases.length + 1} fases`));
    if (e.boss && d.summons) tr.push(__L3("Invoca servos durante a luta", "Summons minions", "Invoca sirvientes"));
    if (e.k === "ANHANGA") tr.push(__L3("Invoca fantasmas durante a luta", "Summons ghosts", "Invoca fantasmas"));
    if (e.boss) tr.push(d.exclusiveLoot ? __L3("Deixa item Raro ou melhor (às vezes exclusivo)", "Drops a Rare item or better (sometimes exclusive)", "Deja objeto Raro o mejor (a veces exclusivo)")
      : __L3("Sempre deixa um item Raro ou melhor", "Always drops a Rare item or better", "Siempre deja un objeto Raro o mejor"));
    if (tr.length) { head(__L3("TRAÇOS", "TRAITS", "RASGOS")); const t = this.T(R, X + 4, y, tr.map(s => "•  " + s).join("\n"), 8.5, __BK_INK, { ww: PW - 8, ls: 2 }); y += t.height + 8 }
    head(__L3("ONDE ENCONTRAR", "WHERE TO FIND", "DÓNDE ENCONTRAR"));
    const wh = [...e.where];
    e.deep != null && wh.push(e.boss ? __L3("Modo Infinito (chefe de profundidade)", "Endless Mode (depth boss)", "Modo Infinito (jefe de profundidad)") : __L3(`Modo Infinito, a partir da profundidade ${e.deep}`, `Endless Mode, from depth ${e.deep}`, `Modo Infinito, desde la profundidad ${e.deep}`));
    const wl = wh.length ? wh : [__L3("Desconhecido", "Unknown", "Desconocido")];
    const wt = this.T(R, X + 4, y, e.boss ? wl.join("  ·  ") : wl.map(s => "•  " + s).join("\n"), 8.5, __BK_INK, { ww: PW - 8, ls: 2 });
    y += wt.height;
    this.__overflow = y > 312 ? y : 0;
  }
  // ------------------------------------------------------------------ navegação
  go(n) {
    n = Math.max(0, Math.min(this.nSpreads - 1, n));
    if (n === this.spread || this.busy) return;
    const dir = n > this.spread ? 1 : -1;
    if (n >= this.FRONT) this.sel = n - this.FRONT;
    this.spread = n; this.busy = !0; this.render(); this.flip(dir);
    this.game.audioEngine?.sfx("sfx-ui-tab");
  }
  flip(dir) {
    const g = this.fx, cx = this.cx, t = this.P.t, b = this.P.b, pw = cx - this.P.l, dest = dir > 0 ? this.L : this.R;
    dest.setAlpha(0);
    this.tweens.addCounter({
      from: 0, to: 1, duration: 320, ease: "Sine.easeInOut",
      onUpdate: tw => {
        const v = tw.getValue(), s = dir > 0 ? 1 - 2 * v : 2 * v - 1, w = Math.abs(s) * pw, x = s >= 0 ? cx : cx - w, lift = 1 - Math.abs(s);
        g.clear();
        g.fillStyle(0, .16 * lift).fillRect(s >= 0 ? x : x - 8, t + 2, w + 8, b - t);
        g.fillStyle(15391926, 1).fillRect(x, t - 4 * lift, w, b - t + 8 * lift);
        for (let i = 0; i < 14; i++) g.fillStyle(6965802, .2 * (1 - i / 14) * (.4 + .6 * lift)).fillRect(s >= 0 ? x + i : x + w - 1 - i, t - 4 * lift, 1, b - t + 8 * lift);
        g.lineStyle(1, 13351055, 1).strokeRect(x, t - 4 * lift, w, b - t + 8 * lift);
      },
      onComplete: () => { g.clear(); this.tweens.add({ targets: dest, alpha: 1, duration: 110 }); this.busy = !1 }
    });
  }
  selMove(d) {
    if (this.spread !== 1 && this.spread !== 2) { this.go(1); return }
    this.sel = (this.sel + d + this.E.length) % this.E.length;
    const want = this.sel < this.nC ? 1 : 2;
    want !== this.spread ? this.go(want) : this.render();
  }
  key(k) {
    if (this.__closing) return;
    if (["ArrowRight", "d", "D", "e", "E", "PageDown"].includes(k)) this.go(this.spread + 1);
    else if (["ArrowLeft", "a", "A", "q", "Q", "PageUp"].includes(k)) this.go(this.spread - 1);
    else if (["ArrowUp", "w", "W"].includes(k)) this.selMove(-1);
    else if (["ArrowDown", "s", "S"].includes(k)) this.selMove(1);
    else if (k === "Enter" || k === " ") { (this.spread === 1 || this.spread === 2) ? this.go(this.FRONT + this.sel) : this.go(this.spread + 1) }
    else if (k === "Home") this.go(0);
    else if (k === "End") this.go(this.nSpreads - 1);
    else if (k === "Escape" || k === "Backspace" || k === "b" || k === "B") this.close();
  }
  padState() {
    try {
      const p = [...(navigator.getGamepads ? navigator.getGamepads() : [])].find(Boolean); if (!p) return {};
      const B = i => !!p.buttons[i]?.pressed, ax = p.axes[0] || 0, ay = p.axes[1] || 0;
      return { l: B(14) || B(4) || ax < -.6, r: B(15) || B(5) || ax > .6, u: B(12) || ay < -.6, d: B(13) || ay > .6, a: B(0), b: B(1), y: B(3) };
    } catch (e) { return {} }
  }
  update() {
    const s = this.padState(), p = this.__pad || {}; this.__pad = s;
    const ed = k => s[k] && !p[k];
    ed("l") && this.key("ArrowLeft"); ed("r") && this.key("ArrowRight"); ed("u") && this.key("ArrowUp"); ed("d") && this.key("ArrowDown");
    ed("a") && this.key("Enter"); ed("b") && this.key("Escape"); ed("y") && this.go(1);
  }
  close() {
    if (this.__closing) return; this.__closing = !0;
    this.game.audioEngine?.sfx("sfx-ui-close");
    this.cameras.main.fadeOut(140, 6, 4, 10);
    this.time.delayedCall(150, () => { const f = this.from; this.scene.stop(); f && this.game.scene.resume(f) });
  }
}
