/* ══ O Rei que Abriu as Portas — arco do príncipe (Valdrak, trezentos anos atrás) ══════════════════
   Cena própria ("ValdrakAntiga"): o jogador controla Aelric jovem pela vila antiga (onde hoje fica o
   Refúgio). Ato I: tarefas na festa (moinho, riacho com pulo, o menino Tico) e a lei dos portões contada
   pelo velho Bram. Ato II: o cerco dos Corvos de Ferro — resgatar moradores até o poço e vencer o chefe.
   Ato III: os portões fechados, a corda, o juramento e a revelação (a vila é o Refúgio).
   Mapa: scripts/build_valdrak_map.py · sprites: scripts/build_valdrak_sprites.py · falas: scripts/valdrak_lines.json
   Entrada: window.__valdrakNow(classe, aoTerminar) · estado salvo em localStorage "depthgate:valdrak:<slot>". */
const __VL = /*__VLINES__*/null/*__VLINES_END__*/;
const __VP = "assets/pixel-art/valdrak/";
/* proporção: altura do corpo (px) de cada desenho e a altura que ele deve ter no mapa.
   O príncipe (adolescente) fica com ~67 px; adultos ~70; crianças ~50. */
const __VH = { adult: 70, kid: 50, prince: 67, king: 72 };
const __VBODY = { "vk-aelric-young-idle": 74, "vk-aelric-king-idle": 72, "peasant-1": 65, "peasant-2": 67, "peasant-3": 68, "peasant-4": 71, "elf-1": 67, "menino": 74, "vk-raider": 66, "vk-chief": 65 };
function __vScale(S, tex, kind = "adult") { const f = (S.cache.json.get("vk-vill") || {})[String(tex).replace(/^vkv-/, "")]; const bh = f?.bh || __VBODY[tex] || 67; return __VH[kind] / bh }
function __vT(a) { try { return __L3(a[0], a[1], a[2]) } catch (e) { return a[0] } }
function __vKey() { return "depthgate:valdrak:" + (window.__activeSlot || 1) }
function __vGet() { try { return JSON.parse(localStorage.getItem(__vKey()) || "{}") } catch (e) { return {} } }
function __vSet(o) { try { localStorage.setItem(__vKey(), JSON.stringify(Object.assign(__vGet(), o))) } catch (e) { } }
window.__valdrakState = __vGet; window.__valdrakSet = __vSet;

class __ValdrakAntiga extends j.Scene {
  constructor() { super("ValdrakAntiga") }
  init(d) { this.cls = String(d?.classId || window.__heroCls || "WARRIOR").toUpperCase(); this.onDone = d?.onDone || null; this.startAct = d?.act || 1; this.mode = d?.mode || "prince";
    const r = Math.random(); this.weather = d?.weather || window.__vkWeather || (r < .5 ? "clear" : r < .75 ? "rain" : "snow");
    this.isNight = d?.night ?? window.__vkNight ?? (Math.random() < .3) }
  preload() {
    const L = this.load, P = __VP, ex = k => this.textures.exists(k);
    ex("vk-ground") || L.image("vk-ground", P + "map/ground.png");
    ex("vk-props") || L.atlas("vk-props", P + "map/props.png", P + "map/props.json");
    if (this.weather === "snow") { ex("vk-props-snow") || L.atlas("vk-props-snow", P + "map/props-snow.png", P + "map/props.json"); ex("vk-gsnow") || L.image("vk-gsnow", P + "map/ground-snow.png") }
    this.cache.json.exists("vk-lights") || L.json("vk-lights", P + "map/lights.json");
    this.cache.json.exists("vk-map") || L.json("vk-map", P + "map/map.json");
    const sp = { "aelric-young": ["idle", "idle2", "walk", "run", "attack1", "attack2", "jump", "hurt", "dead"], "aelric-king": ["idle", "dialogue"] };
    for (const who in sp) for (const a of sp[who]) ex(`vk-${who}-${a}`) || L.spritesheet(`vk-${who}-${a}`, `${P}${who}-${a}.png`, { frameWidth: 128, frameHeight: 128 });
    for (const k of ["peasant-1", "peasant-2", "peasant-3", "peasant-4"]) ex(k) || L.spritesheet(k, `assets/pixel-art/npc/${k}.png`, { frameWidth: 128, frameHeight: 128 });
    ex("elf-1") || L.spritesheet("elf-1", "assets/pixel-art/npc/elf-1.png", { frameWidth: 128, frameHeight: 128 });
    ex("menino") || L.spritesheet("menino", "assets/pixel-art/npc/menino.png", { frameWidth: 64, frameHeight: 77 });
    const vq = m => { for (const k in m) { const f = m[k]; this.textures.exists("vkv-" + k) || L.spritesheet("vkv-" + k, P + "npc/" + k + ".png", { frameWidth: f.fw || 128, frameHeight: f.fh }) } };
    if (this.cache.json.exists("vk-vill")) vq(this.cache.json.get("vk-vill")); else { L.json("vk-vill", P + "npc/villagers.json"); L.once("filecomplete-json-vk-vill", (k, t, d) => vq(d)) }
    ex("vk-raider") || L.spritesheet("vk-raider", "assets/pixel-art/enemies/nf-pyro-ashblade.png", { frameWidth: 75, frameHeight: 98 });
    ex("vk-chief") || L.spritesheet("vk-chief", "assets/pixel-art/enemies/nf-pyro-cultist.png", { frameWidth: 85, frameHeight: 79 });
  }
  mkAnims() {
    const A = this.anims, mk = (k, t, fr, rep = -1, s = 0, e) => { if (A.exists(k) || !this.textures.exists(t)) return; const n = this.textures.get(t).frameTotal - 1; A.create({ key: k, frames: A.generateFrameNumbers(t, { start: s, end: e ?? n - 1 }), frameRate: fr, repeat: rep }) };
    for (const a of [["idle", 7], ["idle2", 7], ["walk", 12], ["run", 16], ["attack1", 14, 0], ["attack2", 14, 0], ["jump", 16, 0], ["hurt", 10, 0], ["dead", 8, 0]]) mk("vk-ay-" + a[0], "vk-aelric-young-" + a[0], a[1], a[2] ?? -1);
    mk("vk-k-idle", "vk-aelric-king-idle", 7);
    mk("vk-mira-idle", "elf-1", 6, -1, 0, 5); mk("vk-mira-walk", "elf-1", 11, -1, 32, 43);
    mk("vk-p1-idle", "peasant-1", 6, -1, 16, 22); mk("vk-p2-idle", "peasant-2", 6, -1, 0, 6); mk("vk-p4-idle", "peasant-4", 6, -1, 0, 6); mk("vk-p3-idle", "peasant-3", 6, -1, 0, 6);
    mk("vk-tico-idle", "menino", 6, -1, 0, 5); mk("vk-tico-walk", "menino", 12, -1, 12, 23);
    const VM = this.cache.json.get("vk-vill") || {};
    for (const k in VM) { const f = VM[k], t = "vkv-" + k; mk("vkv-i-" + k, t, 6, -1, 0, f.idle - 1); mk("vkv-m-" + k, t, f.walk ? 11 : 6, -1, f.cols, f.cols + f.move - 1) }
    mk("vk-r-idle", "vk-raider", 8, -1, 0, 7); mk("vk-r-walk", "vk-raider", 10, -1, 8, 15); mk("vk-r-atk", "vk-raider", 14, 0, 23, 33); mk("vk-r-die", "vk-raider", 10, 0, 38, 47);
    mk("vk-c-idle", "vk-chief", 8, -1, 0, 7); mk("vk-c-walk", "vk-chief", 10, -1, 8, 23); mk("vk-c-atk", "vk-chief", 14, 0, 24, 38); mk("vk-c-die", "vk-chief", 10, 0, 39, 47);
  }
  create() {
    if (this.mode === "dream") return this.dream();
    const S = this, M = S.M = S.cache.json.get("vk-map"), cam = S.cameras.main;
    S.mkAnims(); S.W = M.w; S.H = M.h; S.G = M.g; S.coll = M.coll; S.lt = __vT;
    S.add.image(0, 0, "vk-ground").setOrigin(0).setDepth(-1e4);
    const snow = S.weather === "snow" && S.textures.exists("vk-props-snow"), PT = snow ? "vk-props-snow" : "vk-props";
    snow && S.textures.exists("vk-gsnow") && S.add.image(0, 0, "vk-gsnow").setOrigin(0).setDepth(-9999);
    S.props = [];
    for (const [k, x, y, f] of M.props) { const im = S.add.image(x, y, PT, k).setOrigin(.5, 1).setDepth(y); f && im.setFlipX(!0); S.props.push(im); if (k === "windmill") S.mill = im }
    if (S.mill) { S.sails = S.add.image(S.mill.x + 2, S.mill.y - S.mill.height + 78, PT, "sails").setDepth(S.mill.y + 1); S.tweens.add({ targets: S.sails, angle: 360, duration: 9000, repeat: -1 }) }
    // pedras do riacho e tábuas quebradas
    S.stones = (M.stones || []).map(([x, y]) => S.add.image(x, y + 8, "vk-props", "stone").setDepth(y - 30).setScale(1.5));
    // personagens
    const sp = M.spots;
    S.hero = S.add.sprite(sp.start[0], sp.start[1], "vk-aelric-young-idle", 0).setOrigin(.5, .99).setScale(__vScale(S, "vk-aelric-young-idle", "prince"));
    S.hero.play("vk-ay-idle"); S.hShadow = S.add.ellipse(0, 0, 34, 10, 0, .3);
    S.hp = 6; S.maxHp = 6; S.face = 1; S.inv = 0; S.jumpT = 0; S.atkT = 0; S.lastSafe = [sp.start[0], sp.start[1]];
    S.npcs = {};
    const npc = (id, tex, anim, x, y, sc = .7, flip = !1) => { const s = S.add.sprite(x, y, tex, 0).setOrigin(.5, .99).setScale(__vScale(S, tex, tex === "menino" ? "kid" : "adult")).setFlipX(flip); S.anims.exists(anim) && s.play(anim); s.idA = anim; S.npcs[id] = s; return s };
    npc("mira", "elf-1", "vk-mira-idle", sp.mira[0], sp.mira[1], .68, !0);
    npc("baker", "peasant-2", "vk-p2-idle", sp.baker[0], sp.baker[1], .68);
    npc("smith", "peasant-1", "vk-p1-idle", sp.smith[0], sp.smith[1] - 40, .7, !0);   // o ferreiro na bigorna (sprite com a bigorna desenhada)
    npc("mom", "vkv-elf-3-1", "vkv-i-elf-3-1", sp.ticoMom[0], sp.ticoMom[1], .64);
    npc("barmaid", "peasant-2", "vk-p2-idle", sp.tavernDoor[0] + 150, sp.tavernDoor[1] + 50, .64, !0);   // só uma garçonete, na frente da taberna
    npc("tico", "menino", "vk-tico-idle", sp.tico[0], sp.tico[1], .62);
    npc("bram", "vkv-bram", "vkv-i-bram", sp.bram[0] + 60, sp.bram[1] + 40, .7, !0);
    S.enemies = []; S.followers = [];
    S.spawnVillagers();
    // câmera e camadas de luz
    cam.setBounds(0, 0, S.W, S.H); cam.startFollow(S.hero, !0, .12, .12); cam.setZoom(Math.max(.8, cam.width / 1150)); cam.setBackgroundColor(0x1a2a14);
    S.night = S.add.rectangle(0, 0, S.W * 2, S.H * 2, 0x0a0a28, 0).setOrigin(0).setDepth(9e3);
    S.fireL = S.add.layer().setDepth(9001);
    // HUD (câmera fixa)
    S.ui = S.add.container(0, 0).setScrollFactor(0).setDepth(2e4);
    const uz = 1 / cam.zoom, ox = cam.width / 2 * (1 - uz), oy = cam.height / 2 * (1 - uz); S.uz = uz; S.uox = ox; S.uoy = oy;
    S.ui.setScale(uz).setPosition(ox, oy);
    S.objT = S.add.text(12, 10, "", { fontFamily: "Georgia, serif", fontSize: "13px", color: "#f2d9a0", stroke: "#100806", strokeThickness: 3 });
    S.hpT = S.add.text(12, 30, "", { fontFamily: "Georgia, serif", fontSize: "14px", color: "#e05050", stroke: "#100806", strokeThickness: 3 });
    S.hint = S.add.text(cam.width / 2, cam.height - 18, "", { fontFamily: "Georgia, serif", fontSize: "12px", color: "#ece2cc", stroke: "#100806", strokeThickness: 3 }).setOrigin(.5, 1);
    S.prompt = S.add.text(0, 0, "", { fontFamily: "Georgia, serif", fontSize: "11px", color: "#fff3c8", stroke: "#100806", strokeThickness: 3 }).setOrigin(.5, 1).setDepth(19000);
    S.ui.add([S.objT, S.hpT, S.hint]);
    S.setupWeather(); S.isNight && S.setNight(!0);
    S.setupInput(); S.setupTouch();
    S.dlgBox(); S.state = {}; S.busy = !1;
    S.game.audioEngine?.music?.("hub-theme"); S.game.audioEngine?.startAmbience?.("hub");
    S.events.once("shutdown", () => { try { window.__dubStop?.() } catch (e) { } });
    S.cameras.main.fadeIn(900, 0, 0, 0);
    if (S.startAct >= 2) S.toAct2(!0); else S.time.delayedCall(400, () => S.titleCard(__vT(__VL.ui.title), __vT(__VL.ui.subtitle), () => S.titleCard(__vT(__VL.ui.act1), "", () => S.say("a1_intro", () => { S.state.a1 = 1; S.setObj("o_mill"); S.hint.setText(__vT(__VL.ui.keys)); S.time.delayedCall(9000, () => S.hint.setText("")) }))));
  }
  // sonho no Refúgio: tela escura, a voz do Rei, o fragmento da coroa
  dream() {
    const S = this, cam = S.cameras.main; cam.setBackgroundColor(0x05050a); cam.fadeIn(1200);
    S.ui = S.add.container(0, 0).setScrollFactor(0).setDepth(2e4); S.uz = 1; S.uox = 0; S.uoy = 0; S.k = null;
    const mist = []; for (let i = 0; i < 14; i++) { const m = S.add.image(Math.random() * cam.width, Math.random() * cam.height, "light").setTint(0x8aa0c8).setAlpha(.08).setScale(2 + Math.random() * 2).setBlendMode(j.BlendModes.ADD); S.tweens.add({ targets: m, x: "+=" + (60 + Math.random() * 80), alpha: { from: .04, to: .12 }, duration: 5000 + Math.random() * 4000, yoyo: !0, repeat: -1 }); mist.push(m) }
    S.setupInput(); S.dlgBox(); S.busy = !0; S.state = {};
    S.time.delayedCall(1300, () => {
      const lines = __VL.scenes.dream, kingL = lines.filter(l => l[0] === "king"), heroL = lines.filter(l => l[0] === "hero");
      __VL.scenes.__d1 = kingL; __VL.scenes.__d2 = heroL;
      S.say("__d1", () => {
        cam.flash(600, 255, 230, 160);
        const fr = S.add.image(cam.width / 2, cam.height * .42, "light").setTint(0xffd27a).setBlendMode(j.BlendModes.ADD).setScale(.6);
        const pc = S.add.star(cam.width / 2, cam.height * .42, 5, 8, 18, 0xe8c060).setStrokeStyle(2, 0x7a5a20);
        S.tweens.add({ targets: [fr, pc], scale: "*=1.15", duration: 700, yoyo: !0, repeat: -1 }); S.tweens.add({ targets: pc, angle: 360, duration: 6000, repeat: -1 });
        S.time.delayedCall(900, () => S.say("__d2", () => { __vSet({ dream: 1 }); S.time.delayedCall(400, () => { cam.fadeOut(900); S.time.delayedCall(950, () => { const cb = S.onDone; S.scene.stop(); cb?.() }) }) }));
      });
    });
  }
  // ── entrada ────────────────────────────────────────────────────────────────────────────────────
  setupInput() {
    const K = this.input.keyboard, k = s => K.addKey(s);
    this.k = { up: k("W"), dn: k("S"), lf: k("A"), rt: k("D"), u2: k("UP"), d2: k("DOWN"), l2: k("LEFT"), r2: k("RIGHT"), run: k("SHIFT"), jump: k("SPACE"), j2: k("K"), atk: k("J"), a2: k("Z"), use: k("E"), u3: k("ENTER") };
    this.input.on("pointerdown", p => { if (p.wasTouch) return; if (this.dlg.vis) this.dlgNext(); else if (p.leftButtonDown() && !this.touchOn) this.attack() });
    this.input.gamepad && (this.input.gamepad.once("connected", () => { }));
    this.prevPad = {};
  }
  setupTouch() {
    const S = this, touch = (S.sys.game.device.input.touch);
    if (!touch) return;
    const cam = S.cameras.main, mk = (x, y, r, label) => { const c = S.add.circle(x, y, r, 0x000000, .35).setStrokeStyle(2, 0xf2d9a0, .6), t = S.add.text(x, y, label, { fontFamily: "Georgia, serif", fontSize: Math.round(r * .7) + "px", color: "#f2d9a0" }).setOrigin(.5); S.ui.add([c, t]); return c };
    S.tUse = mk(cam.width - 46, cam.height - 110, 24, "!"); S.tAtk = mk(cam.width - 46, cam.height - 52, 26, "⚔"); S.tJmp = mk(cam.width - 104, cam.height - 52, 24, "⤴");
    S.joy = { base: S.add.circle(86, cam.height - 86, 46, 0x000000, .25).setStrokeStyle(2, 0xf2d9a0, .4), knob: S.add.circle(86, cam.height - 86, 20, 0xf2d9a0, .45), id: null, dx: 0, dy: 0 };
    S.ui.add([S.joy.base, S.joy.knob]); S.touchOn = !0;
    const toUi = p => [(p.x - S.uox) / S.uz, (p.y - S.uoy) / S.uz];
    S.input.addPointer(2);
    S.input.on("pointerdown", p => {
      const [x, y] = toUi(p); const hit = (b) => b && Math.hypot(x - b.x, y - b.y) < b.radius + 10;
      if (S.dlg.vis) { S.dlgNext(); return }
      if (hit(S.tAtk)) S.attack(); else if (hit(S.tJmp)) S.jump(); else if (hit(S.tUse)) S.use();
      else if (x < cam.width / 2) { S.joy.id = p.id; S.joy.base.setPosition(x, y); S.joy.knob.setPosition(x, y) }
    });
    S.input.on("pointermove", p => { if (p.id !== S.joy.id) return; const [x, y] = toUi(p), b = S.joy.base; let dx = x - b.x, dy = y - b.y; const d = Math.hypot(dx, dy) || 1, m = Math.min(d, 42); S.joy.knob.setPosition(b.x + dx / d * m, b.y + dy / d * m); S.joy.dx = dx / d * (m / 42); S.joy.dy = dy / d * (m / 42) });
    S.input.on("pointerup", p => { if (p.id !== S.joy.id) return; S.joy.id = null; S.joy.dx = S.joy.dy = 0; S.joy.knob.setPosition(S.joy.base.x, S.joy.base.y) });
  }
  padState() {
    const g = this.input.gamepad?.pad1; if (!g) return null;
    const b = i => !!g.buttons[i]?.pressed, ax = g.axes[0]?.getValue?.() ?? 0, ay = g.axes[1]?.getValue?.() ?? 0;
    return { x: Math.abs(ax) > .25 ? ax : (b(14) ? -1 : b(15) ? 1 : 0), y: Math.abs(ay) > .25 ? ay : (b(12) ? -1 : b(13) ? 1 : 0), a: b(0), b: b(1), x2: b(2), run: b(5) || b(7) };
  }
  // ── diálogo ────────────────────────────────────────────────────────────────────────────────────
  dlgBox() {
    const S = this, cam = S.cameras.main, w = cam.width - 40, h = 86, x = 20, y = cam.height - h - 14;
    const c = S.add.container(0, 0).setVisible(!1);
    const bg = S.add.graphics(); bg.fillStyle(0x140d0a, .94).fillRoundedRect(x, y, w, h, 8).lineStyle(1, 0x8a6a2c, .9).strokeRoundedRect(x, y, w, h, 8);
    const por = S.add.sprite(x + 50, y + h + 30, "__DEFAULT").setOrigin(.5, 1);
    const nm = S.add.text(x + 104, y + 10, "", { fontFamily: "Georgia, serif", fontStyle: "bold", fontSize: "13px", color: "#f2d9a0", stroke: "#120a08", strokeThickness: 3 });
    const tx = S.add.text(x + 104, y + 30, "", { fontFamily: "Georgia, serif", fontSize: "12px", color: "#ece2cc", lineSpacing: 3, wordWrap: { width: w - 120 }, stroke: "#0a0806", strokeThickness: 2 });
    const mask = S.add.graphics().fillRect(x + 4, y + 4, 92, h - 8).setVisible(!1); por.setMask(mask.createGeometryMask());
    c.add([bg, por, nm, tx]); S.ui.add(c);
    S.dlg = { c, por, nm, tx, vis: !1, list: null, i: 0, full: "", shown: 0 };
  }
  speaker(who) {
    const sp = __VL.speakers[who] || {}, S = this;
    if (who === "hero") { const nm = (typeof __HN !== "undefined" && __HN[S.cls]) || S.cls; return { name: String(nm).toUpperCase(), tex: this.textures.exists("mk4b-" + S.cls.toLowerCase()) ? "mk4b-" + S.cls.toLowerCase() : "__DEFAULT", sc: .9, cls: S.cls } }
    const T = { aelric: ["vk-aelric-young-idle", .95], narr: ["vk-aelric-king-idle", .95], king: ["vk-aelric-king-idle", .95], mira: ["elf-1", .9], baker: ["peasant-2", .85], mom: ["vkv-elf-3-1", .85], smith: ["peasant-1", .85], tico: ["menino", 1.1], bram: ["vkv-bram", .85], villager: ["peasant-3", .85], chief: ["vk-chief", 1.1], halvard: ["vk-aelric-king-idle", .95] }[who] || ["__DEFAULT", 1];
    return { name: sp.name ? __vT(sp.name) : who, tex: T[0], sc: T[1], dark: who === "halvard" || who === "king" };
  }
  say(scene, done) {
    const list = (__VL.scenes[scene] || []).map(([who, pt, en, es]) => ({ who, text: __vT([pt, en, es]) }));
    if (!list.length) { done?.(); return }
    const S = this; S.busy = !0; S.dlg.list = list; S.dlg.i = -1; S.dlg.done = done; S.dlg.vis = !0; S.dlg.c.setVisible(!0);
    try { window.__dubPrefetch?.(list.map(e => e.text)) } catch (e) { }
    S.dlgNext();
  }
  dlgNext() {
    const S = this, D = S.dlg;
    if (D.shown < D.full.length && D.i >= 0) { D.shown = D.full.length; D.tx.setText(D.full); return }
    D.i++;
    if (D.i >= D.list.length) { D.vis = !1; D.c.setVisible(!1); S.busy = !1; try { window.__dubStop?.() } catch (e) { } const d = D.done; D.done = null; D.full = ""; d?.(); return }
    const e = D.list[D.i], sp = S.speaker(e.who);
    D.nm.setText(sp.name); D.por.setTexture(sp.tex, 0).setScale(sp.sc * 1.7); sp.dark ? D.por.setTint(0x101018) : D.por.clearTint();
    window.__currentSpeaker = sp.cls || null;
    D.full = e.text; D.shown = 0; D.tx.setText("");
    try { window.__dub?.(e.text) } catch (er) { }
  }
  titleCard(a, b, done) {
    const S = this, cam = S.cameras.main;
    const t1 = S.add.text(cam.width / 2, cam.height * .38, a, { fontFamily: "Georgia, serif", fontStyle: "bold", fontSize: "30px", color: "#f2d9a0", stroke: "#100806", strokeThickness: 5 }).setOrigin(.5).setAlpha(0);
    const t2 = S.add.text(cam.width / 2, cam.height * .38 + 34, b, { fontFamily: "Georgia, serif", fontSize: "14px", color: "#ece2cc", stroke: "#100806", strokeThickness: 3 }).setOrigin(.5).setAlpha(0);
    S.ui.add([t1, t2]); S.busy = !0;
    S.tweens.add({ targets: [t1, t2], alpha: 1, duration: 700, hold: 1600, yoyo: !0, onComplete: () => { t1.destroy(); t2.destroy(); S.busy = !1; done?.() } });
  }
  setObj(k, extra = "") { this.objK = k; this.objT.setText(k ? "◆ " + __vT(__VL.ui[k]) + extra : "") }
  // ── moradores (variações dos NPCs do jogo): andam, conversam e comentam a festa ───────────────────
  spawnVillagers() {
    const S = this, VM = S.cache.json.get("vk-vill") || {}, keys = Object.keys(VM).filter(k => !VM[k].special && !k.startsWith("peasant-2") && !k.startsWith("peasant-4")), R = Math.random;  // gente da taberna (garçonete e taberneiro de avental) e o Bram não entram na multidão
    if (!keys.length) return; S.vill = [];
    const farmers = keys.filter(k => VM[k].farm), walkers = keys.filter(k => VM[k].walk && !VM[k].kid && !VM[k].farm), standers = (a => a.length ? a : keys.filter(k => !VM[k].kid && !VM[k].farm))(keys.filter(k => !VM[k].walk && !VM[k].kid)), kids = keys.filter(k => VM[k].kid);
    const pick = a => a[Math.floor(R() * a.length)];
    const GROUPS = [  // [x, y, raio, quantos, tipo]  tipo: w = anda · s = parado conversando · k = criança correndo
      [1600, 930, 230, 9, "w"], [1500, 1000, 40, 2, "s"], [1720, 880, 40, 2, "s"], [1600, 960, 200, 3, "k"],
      [1430, 1185, 30, 1, "s"], [1785, 1180, 30, 1, "s"], [1410, 800, 30, 1, "s"], [1800, 800, 40, 2, "s"],
      [600, 1120, 90, 3, "s"], [700, 1090, 140, 2, "w"], [1100, 900, 220, 3, "w"], [2150, 920, 220, 3, "w"],
      [1600, 450, 160, 3, "w"], [1600, 330, 60, 2, "s"], [1580, 1400, 260, 3, "w"], [380, 1950, 160, 3, "f"],
      [870, 2000, 140, 2, "f"], [300, 1560, 120, 1, "f"], [1060, 1720, 90, 1, "f"], [1600, 700, 120, 3, "w"], [2450, 940, 90, 2, "w"],
      [900, 1300, 160, 2, "w"], [2200, 1350, 160, 2, "w"], [900, 1820, 60, 1, "s"], [1130, 1950, 120, 2, "k"], [2860, 980, 60, 1, "s"],
      [2300, 1200, 160, 2, "w"], [1250, 640, 140, 2, "w"], [1950, 640, 140, 2, "w"], [1330, 1600, 130, 2, "w"]];
    for (const [gx, gy, rad, n, type] of GROUPS) for (let i = 0; i < n; i++) {
      const pool = type === "k" ? kids : type === "f" ? (farmers.length ? farmers : walkers) : type === "s" ? (R() < .6 ? standers : walkers) : walkers, k = pick(pool), f = VM[k];
      let x = gx, y = gy; for (let t = 0; t < 12; t++) { const a = R() * 6.28, d = R() * rad; x = gx + Math.cos(a) * d; y = gy + Math.sin(a) * d * .7; if (S.free(x, y) && S.free(x, y - 10)) break }
      const sc = __vScale(S, "vkv-" + k, f.kid ? "kid" : "adult") * (.95 + R() * .1), s = S.add.sprite(x, y, "vkv-" + k, 0).setOrigin(.5, .99).setScale(sc).setFlipX(R() < .5);
      s.play({ key: "vkv-i-" + k, startFrame: Math.floor(R() * Math.max(1, f.idle - 1)) });
      S.vill.push({ s, k, f, home: [gx, gy], rad, type, mob: f.walk && type !== "s", wait: 600 + R() * 4000, tgt: null, talk: 0 });
    }
    // conversas: quem está parado em grupo alterna entre parado e falando
    S.time.addEvent({ delay: 1600, loop: !0, callback: () => { for (const v of S.vill) if (!v.mob && v.s.visible && R() < .35) { const tk = v.f.walk ? "vkv-i-" + v.k : (v.s.anims.currentAnim?.key === "vkv-m-" + v.k ? "vkv-i-" + v.k : "vkv-m-" + v.k); v.s.play(tk, !0) } } });
  }
  updVillagers(dtMs, dt) {
    const S = this; if (!S.vill) return; const H = S.hero, CH = S.chatter || (S.chatter = [].concat(__VL.chatter || [], S.weather === "rain" ? __VL.chatter_rain || [] : [], S.weather === "snow" ? __VL.chatter_snow || [] : [], S.isNight ? __VL.chatter_night || [] : [])); S.bubCd = (S.bubCd || 0) - dtMs;
    for (const v of S.vill) {
      const s = v.s; if (!s.visible) continue; s.setDepth(s.y);
      if (v.bub) { v.bub.setPosition(s.x, s.y - s.displayHeight - 6); v.bubT -= dtMs; if (v.bubT <= 0) { v.bub.destroy(); v.bub = null } }
      if (CH && !v.bub && !S.busy && S.bubCd <= 0 && (v.cd = (v.cd || 0) - dtMs) <= 0 && Math.abs(H.x - s.x) < 90 && Math.abs(H.y - s.y) < 60) {
        S.bubCd = 2800;
        v.cd = 9000 + Math.random() * 8000; const line = CH[Math.floor(Math.random() * CH.length)];
        v.bub = S.add.text(s.x, s.y - s.displayHeight - 6, __vT(line), { fontFamily: "Georgia, serif", fontSize: "11px", color: "#2a1a10", backgroundColor: "#f4ead2", padding: { x: 5, y: 3 }, align: "center", wordWrap: { width: 170 } }).setOrigin(.5, 1).setDepth(19500); v.bubT = 2600;
        s.setFlipX(H.x < s.x);
      }
      if (!v.mob) continue;
      if (!v.tgt) { v.wait -= dtMs; if (v.wait > 0) continue; for (let t = 0; t < 6; t++) { const a = Math.random() * 6.28, d = Math.random() * v.rad, x = v.home[0] + Math.cos(a) * d, y = v.home[1] + Math.sin(a) * d * .7; if (S.free(x, y) && S.free(x, y - 10)) { v.tgt = [x, y]; break } } if (v.tgt) s.play("vkv-m-" + v.k, !0); else v.wait = 800; continue }
      const dx = v.tgt[0] - s.x, dy = v.tgt[1] - s.y, d = Math.hypot(dx, dy), sp = (v.type === "k" ? 95 : 48) * dt;
      if (d < 4) { v.tgt = null; v.wait = 1200 + Math.random() * 4500; s.play("vkv-i-" + v.k, !0); continue }
      const ox = s.x, oy = s.y; S.move(s, dx / d * sp, dy / d * sp, !1); s.setFlipX(dx < 0);
      if (Math.abs(s.x - ox) + Math.abs(s.y - oy) < sp * .2) { v.tgt = null; v.wait = 500; s.play("vkv-i-" + v.k, !0) }
    }
  }
  hideVillagers() { for (const v of S_VILL(this)) { v.s.setVisible(!1); v.bub?.destroy(); v.bub = null } }
  // ── clima: chuva, neve e noite ─────────────────────────────────────────────────────────────────
  setNight(on) {
    const S = this; S.night.fillAlpha = on ? (S.weather === "rain" ? .64 : .6) : (S.weather === "rain" ? .16 : S.weather === "snow" ? .05 : 0);
    S.night.fillColor = S.weather === "snow" && !on ? 0xc8d8ff : 0x0a0a28;
    if (!on || S.nightLights) return; S.nightLights = [];
    const L = (S.cache.json.get("vk-lights") || {}).lights || [];
    for (const [x, y, t] of L) {
      const lamp = t === "lamp", g = S.add.image(x, y, "light").setBlendMode(j.BlendModes.ADD).setTint(lamp ? 0xffb860 : 0xffa848).setScale(lamp ? .62 : .42).setAlpha(lamp ? .5 : .34).setDepth(9003);
      S.tweens.add({ targets: g, alpha: { from: g.alpha * .75, to: g.alpha }, duration: 180 + Math.random() * 220, yoyo: !0, repeat: -1 }); S.nightLights.push(g);
    }
    S.heroGlow = S.add.image(0, 0, "light").setBlendMode(j.BlendModes.ADD).setTint(0xffe2b0).setScale(.55).setAlpha(.18).setDepth(9004);
  }
  setupWeather() {
    const S = this, cam = S.cameras.main, w = cam.width, h = cam.height, R = Math.random;
    S.setNight(!1);
    if (S.weather === "clear") return;
    const g = S.wxG = S.add.graphics(); S.ui.addAt(g, 0); S.wx = [];
    const n = S.weather === "rain" ? 260 : 190;
    for (let i = 0; i < n; i++) S.wx.push({ x: R() * w, y: R() * h, v: S.weather === "rain" ? 520 + R() * 300 : 30 + R() * 45, l: S.weather === "rain" ? 8 + R() * 10 : 1 + Math.floor(R() * 3), ph: R() * 6 });
    // som: chuva sintetizada (ruído filtrado) ou o vento da neve do jogo
    try {
      const E = S.game.audioEngine, C = E?.ctx; if (!C) return; const out = C.createGain(); out.gain.value = 0; out.connect(C.destination); S.wxOut = out;
      out.gain.linearRampToValueAtTime(S.weather === "rain" ? .16 : .22, C.currentTime + 2);
      if (S.weather === "rain") {
        const buf = C.createBuffer(1, C.sampleRate * 2, C.sampleRate), d = buf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const src = C.createBufferSource(); src.buffer = buf; src.loop = !0; const bp = C.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1400; bp.Q.value = .6;
        const lp = C.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 5200; src.connect(bp); bp.connect(lp); lp.connect(out); src.start(); S.wxSrc = src;
      } else {
        const go = buf => { if (!S.sys?.isActive?.() || !S.wxOut) return; const src = C.createBufferSource(); src.buffer = buf; src.loop = !0; src.connect(out); src.start(); S.wxSrc = src };
        if (window.__gsWindBuf) go(window.__gsWindBuf); else { const ogg = (new Audio).canPlayType("audio/ogg; codecs=vorbis"); fetch("assets/audio/ambient/snow-wind." + (ogg ? "ogg" : "mp3")).then(r => r.arrayBuffer()).then(b => C.decodeAudioData(b)).then(b => { window.__gsWindBuf = b; go(b) }).catch(() => { }) }
      }
      S.events.once("shutdown", () => { try { S.wxSrc?.stop() } catch (e) { } try { S.wxOut?.disconnect() } catch (e) { } S.wxOut = null });
    } catch (e) { }
  }
  updWeather(dtMs) {
    const S = this, g = S.wxG; S.heroGlow?.setPosition(S.hero.x, S.hero.y - 30);
    if (!g) return; const cam = S.cameras.main, w = cam.width, h = cam.height, dt = dtMs / 1000, t = S.time.now / 1000; g.clear();
    if (S.weather === "rain") {
      g.lineStyle(1, 0xb8d0ff, .55);
      for (const p of S.wx) { p.y += p.v * dt; p.x -= p.v * .22 * dt; if (p.y > h) { p.y = -20; p.x = Math.random() * (w + 80) } if (p.x < -20) p.x += w + 40; g.lineBetween(p.x, p.y, p.x + p.l * .22, p.y - p.l) }
      // respingos no chão perto do herói
      if (Math.random() < .6) { const wv = cam.worldView, x = wv.x + Math.random() * wv.width, y = wv.y + Math.random() * wv.height, r = S.add.ellipse(x, y, 4, 2).setStrokeStyle(1, 0xd0e0ff, .6).setDepth(y); S.tweens.add({ targets: r, scaleX: 3, scaleY: 3, alpha: 0, duration: 380, onComplete: () => r.destroy() }) }
      if (S.isNight || S.state?.a2) { S.thT = (S.thT ?? 6000 + Math.random() * 9000) - dtMs; if (S.thT <= 0) { S.thT = 8000 + Math.random() * 12000; cam.flash(160, 210, 220, 255); S.time.delayedCall(220, () => cam.flash(90, 180, 190, 230)) } }
    } else {
      g.fillStyle(0xffffff, .9);
      for (const p of S.wx) { p.y += p.v * dt; p.x += Math.sin(t * 1.2 + p.ph) * 14 * dt - 6 * dt; if (p.y > h) { p.y = -6; p.x = Math.random() * w } if (p.x < -6) p.x += w + 12; if (p.x > w + 6) p.x -= w + 12; g.fillRect(p.x, p.y, p.l, p.l) }
    }
  }
  // ── mundo ──────────────────────────────────────────────────────────────────────────────────────
  cell(x, y) { const r = this.coll[Math.floor(y / this.G)]; return r ? r[Math.floor(x / this.G)] ?? "1" : "1" }
  free(x, y, air) { const c = this.cell(x, y); return c === "0" || c === "3" || (air && c === "2") }
  jump() { const S = this; if (S.busy || S.jumpT > 0 || S.dead) return; S.jumpT = 560; S.hero.play("vk-ay-jump", !0); S.game.audioEngine?.sfx?.("sfx-ui-tab") }
  attack() {
    const S = this; if (S.busy || S.atkT > 0 || S.dead) return; S.atkT = 420; S.hero.play(Math.random() < .5 ? "vk-ay-attack1" : "vk-ay-attack2", !0);
    S.game.audioEngine?.sfx?.("sfx-sword-swing");
    const hx = S.hero.x + S.face * 46, hy = S.hero.y - 14;
    for (const e of S.enemies) if (!e.dead && Math.abs(e.s.x - hx) < 52 && Math.abs(e.s.y - hy) < 34) S.hitEnemy(e);
  }
  use() {
    const S = this; if (S.dlg.vis) { S.dlgNext(); return } if (S.busy || !S.near) return;
    const n = S.near; S.near = null; S.prompt.setText(""); n.fn();
  }
  hitEnemy(e) {
    const S = this; e.hp--; e.s.setTintFill(0xffffff); S.time.delayedCall(90, () => e.s?.scene && e.s.clearTint());
    const dx = Math.sign(e.s.x - S.hero.x) || 1; e.kx = dx * 260; e.stun = 260;
    S.game.audioEngine?.sfx?.("sfx-hit");
    if (e.hp <= 0) { e.dead = !0; e.s.play(e.chief ? "vk-c-die" : "vk-r-die"); S.tweens.add({ targets: e.s, alpha: 0, delay: 900, duration: 500, onComplete: () => e.s.destroy() }); e.onDie?.() }
  }
  hurt(n) {
    const S = this; if (S.inv > 0 || S.dead || S.busy) return; S.hp -= n; S.inv = 900; S.hero.play("vk-ay-hurt", !0); S.cameras.main.shake(120, .004);
    if (S.hp <= 0) { S.dead = !0; S.hero.play("vk-ay-dead"); S.time.delayedCall(1300, () => { S.cameras.main.fadeOut(500); S.time.delayedCall(520, () => { S.hint.setText(__vT(__VL.ui.down)); S.restartAct2() }) }) }
  }
  spawnRaider(x, y, chief) {
    const S = this, s = S.add.sprite(x, y, chief ? "vk-chief" : "vk-raider", 0).setOrigin(.5, .97).setScale(__vScale(S, chief ? "vk-chief" : "vk-raider") * (chief ? 1.12 : 1));
    chief && s.setTint(0xc8a0a0); s.play(chief ? "vk-c-walk" : "vk-r-walk");
    const e = { s, hp: chief ? 9 : 3, chief, cd: 800 + Math.random() * 600, kx: 0, stun: 0 }; S.enemies.push(e); return e;
  }
  move(o, dx, dy, air) { const S = this; let nx = o.x + dx, ny = o.y + dy; if (S.free(nx, o.y, air) && S.free(nx, o.y - 8, air)) o.x = nx; if (S.free(o.x, ny, air) && S.free(o.x, ny - 8, air)) o.y = ny }
  update(t, dtMs) {
    if (this.mode === "dream") { const D = this.dlg; if (!D) return; if (this.k && (Phaser_JD(this.k.use) || Phaser_JD(this.k.u3) || Phaser_JD(this.k.jump))) this.dlgNext(); const P = this.padState(); if (P && P.a && !this.prevPad.a) this.dlgNext(); this.prevPad = P || {}; if (D.vis && D.shown < D.full.length) { D.shown = window.__dubType ? window.__dubType(D.full, D.shown, 1) : D.shown + 1; D.tx.setText(D.full.slice(0, D.shown)) } return }
    const S = this, dt = Math.min(dtMs, 50) / 1000, H = S.hero, k = S.k, pad = S.padState();
    // botões do controle (borda de subida)
    if (pad) { const P = S.prevPad; if (pad.a && !P.a) S.dlg.vis ? S.dlgNext() : (S.near ? S.use() : 0); if (pad.x2 && !P.x2) S.attack(); if (pad.b && !P.b) S.jump(); S.prevPad = pad }
    if (Phaser_JD(k.use) || Phaser_JD(k.u3)) S.dlg.vis ? S.dlgNext() : S.use();
    if (Phaser_JD(k.atk) || Phaser_JD(k.a2)) S.attack();
    if (Phaser_JD(k.jump) || Phaser_JD(k.j2)) S.dlg.vis ? S.dlgNext() : S.jump();
    // texto do diálogo acompanhando a voz
    const D = S.dlg; if (D.vis && D.shown < D.full.length) { D.shown = window.__dubType ? window.__dubType(D.full, D.shown, 1) : Math.min(D.full.length, D.shown + 1); D.tx.setText(D.full.slice(0, D.shown)) }
    S.inv = Math.max(0, S.inv - dtMs); S.atkT = Math.max(0, S.atkT - dtMs);
    const air = S.jumpT > 0;
    if (air) { S.jumpT -= dtMs; const p = 1 - S.jumpT / 560; H.__jy = -Math.sin(Math.PI * Math.min(1, p)) * 34; if (S.jumpT <= 0) { S.jumpT = 0; H.__jy = 0; if (S.cell(H.x, H.y) === "2") { S.hint.setText(__vT(__VL.ui.fell)); S.time.delayedCall(1800, () => S.hint.text === __vT(__VL.ui.fell) && S.hint.setText("")); H.setPosition(S.lastSafe[0], S.lastSafe[1]); S.game.audioEngine?.sfx?.("sfx-splash") } } }
    let mx = 0, my = 0;
    if (!S.busy && !S.dead && !S.auto) {
      mx = (k.lf.isDown || k.l2.isDown ? -1 : 0) + (k.rt.isDown || k.r2.isDown ? 1 : 0); my = (k.up.isDown || k.u2.isDown ? -1 : 0) + (k.dn.isDown || k.d2.isDown ? 1 : 0);
      if (pad && (pad.x || pad.y)) { mx = pad.x; my = pad.y }
      if (S.joy && (S.joy.dx || S.joy.dy)) { mx = S.joy.dx; my = S.joy.dy }
    }
    if (S.auto) { const [tx, ty] = S.auto, dx = tx - H.x, dy = ty - H.y, d = Math.hypot(dx, dy); if (d < 6) { const cb = S.autoCb; S.auto = null; S.autoCb = null; cb?.() } else { mx = dx / d; my = dy / d } }
    const m = Math.hypot(mx, my); const run = (k.run.isDown || pad?.run || m > .95 && S.joy?.id != null) && !S.auto;
    if (m > .05) {
      const sp = (run ? 230 : 150) * Math.min(1, m) / Math.max(1, m) * (S.atkT > 0 ? .35 : 1);
      S.move(H, mx * sp * dt, my * sp * dt, air || S.auto);
      if (Math.abs(mx) > .1) S.face = mx < 0 ? -1 : 1;
      if (!air && S.atkT <= 0 && S.inv < 600) H.anims.currentAnim?.key !== (run ? "vk-ay-run" : "vk-ay-walk") && H.play(run ? "vk-ay-run" : "vk-ay-walk");
    } else if (!air && S.atkT <= 0 && S.inv < 600 && !S.dead) H.anims.currentAnim?.key !== "vk-ay-idle" && H.play("vk-ay-idle");
    if (!air && S.cell(H.x, H.y) !== "2") S.lastSafe = [H.x, H.y];
    H.setFlipX(S.face < 0); H.setDepth(H.y); H.y += 0; H.setY(H.y);
    if (H.__jy) H.y += 0;
    H.displayOriginY = H.height * .99 - (H.__jy || 0) / H.scaleY;
    S.hShadow.setPosition(H.x, H.y - 2).setDepth(H.y - 1).setScale(air ? .7 : 1);
    S.hpT.setText(S.state.a2 && !S.state.a3 ? "♥".repeat(Math.max(0, S.hp)) + "♡".repeat(Math.max(0, S.maxHp - S.hp)) : "");
    for (const id in S.npcs) { const n = S.npcs[id]; n.setDepth(n.y) }
    // seguidores (Ato III)
    let prev = H; for (const f of S.followers) { const dx = prev.x - f.x, dy = prev.y - f.y, d = Math.hypot(dx, dy); if (d > 46) { f.x += dx / d * (d - 46) * Math.min(1, dt * 6); f.y += dy / d * (d - 46) * Math.min(1, dt * 6) } f.setFlipX(dx < 0); f.setDepth(f.y); prev = f }
    S.updEnemies(dtMs, dt); S.updRunners(dt); S.updVillagers(dtMs, dt); S.updWeather(dtMs); S.triggers();
  }
  updEnemies(dtMs, dt) {
    const S = this, H = S.hero;
    for (const e of S.enemies) {
      if (e.dead) continue; const s = e.s;
      if (e.stun > 0) { e.stun -= dtMs; S.move(s, e.kx * dt, 0, !1); e.kx *= .85; continue }
      const tgt = H, dx = tgt.x - s.x, dy = tgt.y - s.y, d = Math.hypot(dx, dy);
      s.setFlipX(dx < 0); s.setDepth(s.y);
      if (e.atk) { e.atk -= dtMs; if (e.atk <= 0) { e.atk = 0; if (Math.abs(H.x - s.x) < 58 && Math.abs(H.y - s.y) < 30 && !S.jumpT) S.hurt(e.chief ? 2 : 1); s.play(e.chief ? "vk-c-walk" : "vk-r-walk") } continue }
      e.cd -= dtMs;
      if (d < 50 && e.cd <= 0) { e.atk = 520; e.cd = e.chief ? 1100 : 1500; s.play(e.chief ? "vk-c-atk" : "vk-r-atk", !0) }
      else if (d > 40 && d < 900 && !S.busy) { const sp = e.chief ? 95 : 105; S.move(s, dx / d * sp * dt, dy / d * sp * dt, !1); s.anims.currentAnim?.key.endsWith("walk") || s.play(e.chief ? "vk-c-walk" : "vk-r-walk") }
    }
  }
  updRunners(dt) {
    const S = this; if (!S.runners) return;
    for (const r of S.runners) { if (r.safe) continue; const [tx, ty] = S.M.spots.well, dx = tx - r.s.x, dy = ty - r.s.y, d = Math.hypot(dx, dy); if (d < 30) { r.safe = !0; S.tweens.add({ targets: r.s, alpha: 0, scale: r.s.scale * .6, duration: 500 }); S.saved++; S.setObj("o_rescue", ` (${S.saved}/4)`); S.checkRescue(); continue } r.s.x += dx / d * 170 * dt; r.s.y += dy / d * 170 * dt; r.s.setFlipX(dx < 0); r.s.setDepth(r.s.y) }
  }
  near2(x, y, r = 60) { return Math.hypot(this.hero.x - x, this.hero.y - y) < r }
  offer(x, y, label, fn) { this.near = { fn }; this.prompt.setText("[E] " + label).setPosition(x, y - 90) }
  triggers() {
    const S = this, sp = S.M.spots, st = S.state, N = S.npcs, ui = __VL.ui;
    S.near = null; if (S.busy) { S.prompt.setText(""); return }
    // Ato I
    if (st.a1 === 1 && S.near2(sp.millLever[0], sp.millLever[1], 70)) S.offer(sp.millLever[0], sp.millLever[1], __vT(ui.pull), () => { S.busy = !0; S.cameras.main.shake(200, .003); S.game.audioEngine?.sfx?.("sfx-door"); S.time.delayedCall(600, () => { S.busy = !1; S.say("a1_mill", () => { st.a1 = 2; st.tasks = st.tasks || {}; S.setObj("o_square"); S.tweens.add({ targets: N.mira, x: sp.festival[0] - 60, y: sp.festival[1] + 40, duration: 9000 }) }) }) });
    if (st.a1 === 2) {
      st.tasks = st.tasks || {};
      if (!st.tasks.baker && S.near2(N.baker.x, N.baker.y)) S.offer(N.baker.x, N.baker.y, __vT(ui.talk), () => S.say("a1_baker", () => { st.tasks.baker = 1 }));
      if (!st.tasks.smithTalk && S.near2(sp.bridgeW[0], sp.bridgeW[1], 120)) { st.tasks.smithTalk = 1; S.say("a1_smith", () => S.setObj("o_bridge")) }
      if (st.tasks.smithTalk && !st.tasks.bridge && S.near2(N.smith.x, N.smith.y, 80)) S.offer(N.smith.x, N.smith.y, __vT(ui.talk), () => S.say("a1_smith_done", () => { st.tasks.bridge = 1; S.nextTask() }));
      if (!st.tasks.mom && S.near2(N.mom.x, N.mom.y)) S.offer(N.mom.x, N.mom.y, __vT(ui.talk), () => S.say("a1_mom", () => { st.tasks.mom = 1; S.setObj("o_tico") }));
      if (st.tasks.mom && !st.tasks.tico && S.near2(N.tico.x, N.tico.y)) S.offer(N.tico.x, N.tico.y, __vT(ui.talk), () => S.say("a1_tico", () => { st.tasks.tico = 1; S.tweens.add({ targets: N.tico, x: N.mom.x + 30, y: N.mom.y + 6, duration: 2600 }); S.time.delayedCall(2700, () => S.say("a1_mom_done", () => { st.tasks.ticoDone = 1; S.nextTask() })) }));
    }
    if (st.a1 === 3 && S.near2(sp.tavernDoor[0], sp.tavernDoor[1] + 40, 130)) S.offer(sp.tavernDoor[0], sp.tavernDoor[1], __vT(ui.talk), () => S.say("a1_tavern", () => S.toAct2()));
    // Ato II
    if (st.a2 === 2 && S.near2(sp.well[0], sp.well[1], 90)) S.offer(sp.well[0], sp.well[1], __vT(ui.talk), () => S.say("a2_well", () => S.toAct3()));
    if (st.a2 === 1 && S.rescueNpcs) for (const r of S.rescueNpcs) if (!r.go && S.near2(r.s.x, r.s.y, 70)) S.offer(r.s.x, r.s.y, __vT(ui.help), () => { const first = !S.saidRescue; S.saidRescue = !0; const go = () => { r.go = !0; S.runners.push(r) }; first ? S.say("a2_rescue", go) : go() });
    // Ato III
    if (st.a3 === 1 && S.hero.y < S.M.wallH + 260 && Math.abs(S.hero.x - sp.gate[0]) < 200) { st.a3 = 2; S.gateScene() }
    S.near || S.prompt.setText("");
  }
  nextTask() { const t = this.state.tasks; if (t.bridge && t.ticoDone) { this.state.a1 = 3; this.setObj("o_tavern") } else this.setObj(t.bridge ? "o_tico" : t.mom ? "o_bridge" : "o_square") }
  // ── atos ───────────────────────────────────────────────────────────────────────────────────────
  toAct2(skipTalk) {
    const S = this, sp = S.M.spots; S.busy = !0; S.state.a1 = 4;
    S.cameras.main.fadeOut(800); S.time.delayedCall(820, () => {
      S.setNight(!0);
      for (const id in S.npcs) if (id !== "mira" && id !== "bram") S.npcs[id].setVisible(!1);
      S.hideVillagers();
      S.npcs.mira.setPosition(sp.festival[0] - 40, sp.festival[1] + 30); S.npcs.bram.setPosition(sp.festival[0] + 50, sp.festival[1] + 30);
      S.hero.setPosition(sp.festival[0], sp.festival[1] + 60);
      // fogo nas plantações e casas
      for (const [x, y] of [[300, 1900], [600, 1950], [900, 1870], [1100, 760], [2150, 760], [2400, 1500], [1850, 1500], [2100, 1700]]) { const f = S.add.image(x, y, "light").setTint(0xff7a20).setBlendMode(j.BlendModes.ADD).setScale(1.6).setAlpha(.7).setDepth(9002); S.tweens.add({ targets: f, alpha: { from: .45, to: .85 }, scale: { from: 1.4, to: 1.8 }, duration: 260 + Math.random() * 200, yoyo: !0, repeat: -1 }) }
      S.cameras.main.fadeIn(700); S.busy = !1;
      S.titleCard(__vT(__VL.ui.act2), "", () => S.say("a2_alarm", () => S.startRaid()));
    });
  }
  startRaid() {
    const S = this, sp = S.M.spots; S.state.a2 = 1; S.hp = S.maxHp; S.saved = 0; S.runners = []; S.saidRescue = S.saidRescue || !1;
    S.npcs.mira.setVisible(!1); S.npcs.bram.setVisible(!1);
    const tex = [["vkv-elf-2-1", "vkv-i-elf-2-1"], ["vkv-camp-rapaz-1", "vkv-i-camp-rapaz-1"], ["peasant-3", "vk-p3-idle"], ["menino", "vk-tico-idle"]];
    S.rescueNpcs = sp.rescue.slice(0, 4).map(([x, y], i) => { const s = S.add.sprite(x, y, tex[i][0], 0).setOrigin(.5, .99).setScale(__vScale(S, tex[i][0], i === 3 ? "kid" : "adult")); s.play(tex[i][1]); return { s } });
    S.setObj("o_rescue", " (0/4)");
    const waves = () => { if (S.state.a2 !== 1) return; const alive = S.enemies.filter(e => !e.dead).length; if (alive < 5) { const [rx, ry] = sp.raidFrom; S.spawnRaider(rx + (Math.random() - .5) * 500, ry - 300 + Math.random() * 200) } S.time.delayedCall(4200, waves) };
    for (let i = 0; i < 3; i++) S.spawnRaider(sp.raidFrom[0] - 300 + i * 220, sp.raidFrom[1] - 420); waves();
  }
  checkRescue() {
    const S = this; if (S.saved === 2 && !S.chief) { const [x, y] = S.M.spots.raidFrom; S.chief = S.spawnRaider(x - 600, y - 500, !0); S.chief.onDie = () => { S.chiefDown = !0; S.checkRescue() }; S.cameras.main.pan(S.chief.s.x, S.chief.s.y, 700, "Sine.easeInOut", !0); S.busy = !0; S.time.delayedCall(800, () => { S.busy = !1; S.say("a2_chief", () => { S.cameras.main.pan(S.hero.x, S.hero.y, 400); S.setObj("o_chief") }) }) }
    if (S.saved >= 4 && S.chiefDown) { S.state.a2 = 2; S.setObj("o_well"); for (const e of S.enemies) if (!e.dead) { e.dead = !0; S.tweens.add({ targets: e.s, alpha: 0, duration: 800, onComplete: () => e.s.destroy() }) } }
    else if (S.saved >= 4 && S.chief && !S.chiefDown) S.setObj("o_chief");
  }
  restartAct2() {
    const S = this; for (const e of S.enemies) e.s?.destroy(); S.enemies = []; S.chief = null; S.chiefDown = !1; (S.rescueNpcs || []).forEach(r => r.s.destroy()); S.rescueNpcs = null; S.runners = [];
    S.dead = !1; S.hero.setPosition(S.M.spots.festival[0], S.M.spots.festival[1] + 60); S.cameras.main.fadeIn(600); S.startRaid();
  }
  toAct3() {
    const S = this, sp = S.M.spots; S.state.a2 = 3; S.busy = !0;
    S.cameras.main.fadeOut(700); S.time.delayedCall(720, () => {
      const g = [["elf-1", "vk-mira-idle", .68], ["vkv-peasant-3-2", "vkv-i-peasant-3-2", .66], ["vkv-elf-2-1", "vkv-i-elf-2-1", .64]];
      S.followers = g.map(([t, a, sc], i) => { const s = S.add.sprite(S.hero.x - 40 * (i + 1), S.hero.y + 10, t, 0).setOrigin(.5, .99).setScale(__vScale(S, t)); s.play(a); return s });
      S.cameras.main.fadeIn(600); S.busy = !1; S.titleCard(__vT(__VL.ui.act3), "", () => { S.state.a3 = 1; S.setObj("o_gate") });
      S.spawnRaider(sp.raidFrom[0] - 900, sp.raidFrom[1] - 900);
    });
  }
  gateScene() {
    const S = this, sp = S.M.spots, H = S.hero; S.busy = !0; S.setObj(null);
    for (const e of S.enemies) if (!e.dead) { e.dead = !0; e.s.setVisible(!1) }
    S.auto = [sp.gate[0], S.M.wallH + 70]; S.autoCb = () => {
      S.face = 1; S.busy = !0;
      const king = S.add.sprite(sp.wallTop[0] + 70, sp.wallTop[1] + 40, "vk-aelric-king-idle", 0).setOrigin(.5, 1).setScale(__vScale(S, "vk-aelric-king-idle", "king")).setTint(0x101018).setDepth(5e3); king.play("vk-k-idle");
      S.cameras.main.pan(sp.gate[0], S.M.wallH - 20, 900, "Sine.easeInOut");
      S.time.delayedCall(1000, () => S.say("a3_gates", () => {
        const rope = S.add.rectangle(H.x + 10, S.M.wallH - 150, 3, 10, 0x8a6a3c).setOrigin(.5, 0).setDepth(6e3);
        S.tweens.add({ targets: rope, height: H.y - (S.M.wallH - 150), duration: 900, onComplete: () => {
          S.tweens.add({ targets: [H, S.hShadow], y: "-=170", duration: 1800, ease: "Sine.easeIn" }); S.tweens.add({ targets: rope, height: 20, duration: 1800 });
          S.time.delayedCall(900, () => { S.cameras.main.fadeOut(1400, 0, 0, 0) });
          S.time.delayedCall(2500, () => { for (const f of S.followers) f.setVisible(!1); S.say("a3_after", () => S.reveal()) });
        } });
      }));
    };
  }
  reveal() {
    const S = this, cam = S.cameras.main;
    S.textures.exists("vh-ground") ? 0 : 0;
    const go = () => {
      const im = S.add.image(cam.width / 2, cam.height / 2, S.textures.exists("vh-ground") ? "vh-ground" : "vk-ground").setDisplaySize(cam.width, cam.height).setAlpha(0);
      S.ui.add(im); S.ui.sendToBack(im); cam.fadeIn(1200);
      S.tweens.add({ targets: im, alpha: 1, duration: 1800, onComplete: () => S.say("a3_reveal", () => S.finish()) });
    };
    if (!S.textures.exists("vh-ground")) { S.load.image("vh-ground", "assets/pixel-art/hub/village/ground.png"); S.load.once("complete", go); S.load.start() } else go();
  }
  finish() {
    const S = this; __vSet({ prince: 1 });
    try { window.__chronAdd?.(__vT(["O PRÍNCIPE DE VALDRAK", "THE PRINCE OF VALDRAK", "EL PRÍNCIPE DE VALDRAK"]), __vT(["Aelric viu o pai cumprir a lei dos portões e deixar o povo do lado de fora. Naquela noite jurou nunca fazer igual.", "Aelric watched his father obey the law of the gates and leave the people outside. That night he swore never to do the same.", "Aelric vio a su padre cumplir la ley de las puertas y dejar al pueblo afuera. Esa noche juró no hacer nunca lo mismo."])) } catch (e) { }
    S.titleCard(__vT(__VL.ui.end), "", () => { S.cameras.main.fadeOut(900); S.time.delayedCall(950, () => { const cb = S.onDone; S.scene.stop(); cb?.() }) });
  }
}
function S_VILL(S) { return S.vill || [] }
function Phaser_JD(k) { return !!k && j.Input.Keyboard.JustDown(k) }
window.__valdrakNow = function (cls, onDone, act, mode) {
  const game = window.__DED_GAME; if (!game) return;
  game.scene.getScene("ValdrakAntiga") || game.scene.add("ValdrakAntiga", __ValdrakAntiga, !1);
  game.scene.run("ValdrakAntiga", { classId: cls || window.__heroCls, onDone, act, mode }); game.scene.bringToTop("ValdrakAntiga");
};
/* Refúgio: depois da metade dos selos, o sonho com o Rei (uma vez) e o portal-eco dourado até o arco do príncipe */
function __vkHub(S) {
  const st = __vGet(); let n = 0; try { n = __hubProg(S).n } catch (e) { }
  if (window.__vkForce) n = 9;
  if (st.prince || n < Math.ceil(__HUBD.length / 2)) return;
  const cls = String(S.classDef?.id || window.__heroCls || "WARRIOR").toUpperCase(), game = S.game;
  const run = (mode, after) => { S.__busy = !0; S.scene.sleep(); window.__valdrakNow(cls, () => { try { S.scene.wake(); S.__busy = !1 } catch (e) { } after?.() }, 1, mode) };
  const portal = () => {
    if (S.__vkPortal) return; const sp = S.M?.spots?.campfire || [512, 458], x = sp[0] + 96, y = sp[1] - 6;
    const p = S.__vkPortal = S.add.sprite(x, y, "hub-portal", 0).setOrigin(.5, 1).setDepth(y).setTint(0xffd27a).setScale(.9);
    S.anims.exists("hub-portal-a") && p.play("hub-portal-a");
    const gl = S.add.image(x, y - 30, "light").setBlendMode(j.BlendModes.ADD).setTint(0xffc860).setScale(.5).setAlpha(.45).setDepth(y - 1);
    S.tweens.add({ targets: gl, alpha: { from: .3, to: .6 }, duration: 900, yoyo: !0, repeat: -1 });
    S.inters.push({ area: "out", id: "vk-portal", x, y: y + 4, r: 34, label: __L3("Eco de Valdrak", "Echo of Valdrak", "Eco de Valdrak"), desc: __L3("Um fragmento da coroa brilha aqui.", "A crown fragment glows here.", "Un fragmento de la corona brilla aquí."),
      act: () => run("prince", () => { if (__vGet().prince) { p.destroy(); gl.destroy(); S.inters = S.inters.filter(o => o.id !== "vk-portal"); S.__vkPortal = null } }) });
  };
  if (!st.dream) S.time.delayedCall(1500, () => run("dream", portal)); else portal();
}
{ const _c = Fl.prototype.create; Fl.prototype.create = function (...a) { const r = _c.apply(this, a); try { __vkHub(this) } catch (e) { console.warn("valdrak hub", e) } return r } }
