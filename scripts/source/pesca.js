/* ══ Pesca no mar (doca do Refúgio) ══
   Três pontos de pesca (ponta do píer, escada do barco e o ponto fundo, no fim da ponte), marcados por ondinhas
   na água. Joga a linha → espera a boia afundar → aperta na hora do "!" → barra de puxar: segure (toque/clique em
   qualquer lugar, Espaço/E/Enter ou A do controle) para subir a faixa verde e manter o peixe dentro dela; a barra
   de captura enche enquanto o peixe está na faixa e esvazia quando escapa. Dez espécies (comuns a lendária),
   algumas só à noite, de manhã ou no ponto fundo. Diário de Pesca na casa do pescador; completar o diário dá
   recompensa. Os peixes vão para o cesto (etapa 2: vender e cozinhar na taverna).
   Arte: pacote CraftPix "Fishing and Gathering" (scripts/build_pesca.py). */
const __PZ_SPECIES = [   // id, pt, en, es, raridade, peso de sorteio, força (1-8), tamanho cm [min,max], condição
  ["sardinha", "Sardinha", "Sardine", "Sardina", 0, 30, 1, [12, 22], null],
  ["robalo", "Robalo", "Sea bass", "Lubina", 0, 22, 2, [30, 70], null],
  ["pescada", "Pescada", "Hake", "Merluza", 0, 16, 2, [25, 55], null],
  ["palhaco", "Peixe-palhaço", "Clownfish", "Pez payaso", 1, 10, 2, [8, 14], null],
  ["garoupa", "Garoupa", "Grouper", "Mero", 1, 10, 4, [40, 110], null],
  ["anjo", "Peixe-anjo", "Angelfish", "Pez ángel", 1, 9, 3, [15, 35], null],
  ["noturno", "Aleta-noturna", "Nightfin", "Aleta nocturna", 2, 7, 4, [20, 45], "night"],
  ["koi", "Carpa-koi", "Koi", "Carpa koi", 2, 6, 4, [35, 80], "morning"],
  ["barracuda", "Barracuda", "Barracuda", "Barracuda", 2, 6, 6, [60, 150], "deep"],
  ["espadarte", "Espadarte", "Swordfish", "Pez espada", 3, 2.5, 8, [150, 320], "deep"]];
// qual animação do pacote cada espécie usa (Fish1..10)
const __PZ_TEX = { sardinha: 1, robalo: 2, pescada: 5, palhaco: 10, garoupa: 3, anjo: 4, noturno: 6, koi: 8, barracuda: 7, espadarte: 9 };
const __PZ_RAR = [["COMUM", "COMMON", "COMÚN", "#cfe0ff"], ["INCOMUM", "UNCOMMON", "POCO COMÚN", "#9be27a"], ["RARO", "RARE", "RARO", "#7ab8ff"], ["LENDÁRIO", "LEGENDARY", "LEGENDARIO", "#ffd24a"]];
{
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path, P = "assets/pixel-art/hub/pesca/"; L.setPath("");
      for (let i = 1; i <= 10; i++) this.textures.exists("pq-f" + i) || L.spritesheet("pq-f" + i, P + "fish" + i + ".png", { frameWidth: 32, frameHeight: 32 });
      this.cache.json.exists("pq-info") || L.json("pq-info", P + "pesca.json");
      L.setPath(op);
    } catch (e) {}
    return r;
  };
  const I0 = Fl.prototype.__inters;
  Fl.prototype.__inters = function () {
    const r = I0.apply(this, arguments);
    try { this.M?.dockRect && this.textures.exists("pq-f1") && this.cache.json.exists("pq-info") && __pqBuild(this) } catch (e) { console.warn("[pesca]", e) }
    return r;
  };
}
/* diário e cesto (por espaço de jogo salvo) */
function __pqKey(H) { let sl = 1; try { sl = H.retSlot ?? H.game.registry.get("save:slot") ?? 1 } catch (e) { } return "depthgate:pesca:" + (H.fromForest ? "c" : "e") + sl }
function __pqGet(H) { try { return JSON.parse(localStorage.getItem(__pqKey(H)) || "{}") } catch (e) { return {} } }
function __pqSet(H, d) { try { localStorage.setItem(__pqKey(H), JSON.stringify(d)) } catch (e) { } }
function __pqBuild(H) {
  const L3 = __L3, rnd = Math.random, INFO = H.cache.json.get("pq-info").fish, A = H.anims, FO = H.M.feetOff || 24;
  for (let i = 1; i <= 10; i++) A.exists("pq-j" + i) || A.create({ key: "pq-j" + i, frames: A.generateFrameNumbers("pq-f" + i, { start: 0, end: INFO[i - 1].n - 1 }), frameRate: 12, repeat: 0 });
  const icon = id => { const i = __PZ_TEX[id]; return ["pq-f" + i, INFO[i - 1].icon] };
  // pontos de pesca: [posição lógica do herói, alvo na água, fundo?]
  const SPOTS = [
    { id: "ponta", at: [720, 920], w: [722, 990], deep: !1, name: L3("PONTA DO PÍER", "PIER END", "PUNTA DEL MUELLE") },
    { id: "escada", at: [632, 1000], w: [604, 1064], deep: !1, name: L3("ESCADA DO BARCO", "BOAT STAIRS", "ESCALERA DEL BARCO") },
    { id: "fundo", at: [906, 872], w: [956, 912], deep: !0, name: L3("PONTO FUNDO", "DEEP SPOT", "PUNTO HONDO") }];
  __rfTex?.(H);
  if (!H.textures.exists("pq-ring")) { const q = H.make.graphics({ x: 0, y: 0 }, !1); q.lineStyle(1, 0xffffff, 1).strokeEllipse(10, 4, 18, 6); q.generateTexture("pq-ring", 20, 8); q.destroy() }
  for (const s of SPOTS) {   // ondinhas marcando o ponto
    const rs = [0, 1].map(k => H.add.image(s.w[0], s.w[1], "pq-ring").setTint(s.deep ? 0x9fd8ff : 0xe8f8ff).setAlpha(0).setDepth(-19));
    rs.forEach((r, k) => H.tweens.add({ targets: r, scale: { from: .4, to: 1.5 }, alpha: { from: .75, to: 0 }, duration: 1600, repeat: -1, delay: k * 800 }));
    s.glow = H.add.image(s.w[0], s.w[1], "light").setBlendMode(j.BlendModes.ADD).setTint(s.deep ? 0x6fb8ff : 0xbfe8ff).setScale(.22).setAlpha(.25).setDepth(-19);
    H.tweens.add({ targets: s.glow, alpha: { from: .12, to: .32 }, duration: 1300, yoyo: !0, repeat: -1 });
  }
  // estado da pescaria
  const F = H.__pqF = { st: 0, spot: null };   // 0 nada · 1 esperando · 2 fisgou · 3 puxando
  const bob = H.add.container(0, 0).setVisible(!1); const bg = H.add.graphics(); bg.fillStyle(0xffffff, 1).fillCircle(0, -2, 2).fillStyle(0xe03a2a, 1).fillCircle(0, 0, 2.2).fillStyle(0x0a1a2a, .5).fillEllipse(0, 2.5, 6, 1.6); bob.add(bg);
  const line = H.add.graphics();
  const say = (t, c, ms = 2000) => { try { H.__say(H.playerX, H.playerY - 40, t, ms, c) } catch (e) { } };
  const sfx = (k, v) => { try { __rfSfx?.(H, k, v) } catch (e) { } };
  /* vara de pescar desenhada na mão do herói: curva (verga com a força do peixe), molinete, cabo de cortiça e a
     linha com barriga quando frouxa. Animações: arremesso (vai atrás da cabeça e chicoteia), espera (balança,
     beliscadas falsas), fisgada (verga e treme), briga (tensão conforme o peixe foge da faixa), pegou (levanta) e
     arrebentou (chicoteia e para). */
  const ROD = H.__pqRod = { vis: !1, ang: -50, bend: 0, shake: 0, sag: 10, anim: null, launched: !0, tension: 0 };
  const rodG = H.add.graphics();
  const rdir = () => H.facing?.x || (F.spot ? Math.sign(F.spot.w[0] - H.playerX) || 1 : 1);
  const hand = () => { const d = rdir(); return [H.playerX + d * 5, H.playerY + 7] };
  const rodPlay = (keys, dur, then) => { ROD.anim = { k: keys, t: 0, dur, then } };
  const lerpK = (k, t) => { for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const a = k[i - 1], b = k[i], u = (t - a[0]) / Math.max(1e-6, b[0] - a[0]), e = u * u * (3 - 2 * u); return [a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e] } const z = k[k.length - 1]; return [z[1], z[2]] };
  let nibT = 2 + rnd() * 3, nib = 0;
  const rodTick = (t, ms) => {
    if (!ROD.vis) { rodG.clear(); return }
    const dt = ms / 1000; let ang = ROD.ang, bend = ROD.bend, shake = 0;
    if (ROD.anim) { const A = ROD.anim; A.t += ms; const u = Math.min(1, A.t / A.dur); [ang, bend] = lerpK(A.k, u); A.onT?.(u); if (u >= 1) { ROD.anim = null; ROD.ang = ang; ROD.bend = bend; A.then?.() } }
    else if (F.st === 1) {   // esperando: balança de leve e às vezes um peixe belisca
      ang = -45 + Math.sin(t / 760) * 3; bend = .08 + nib; if ((nibT -= dt) <= 0) { nibT = 1.5 + rnd() * 3.5; nib = .22; bob.y += 1.2; H.time.delayedCall(140, () => { nib = 0; bob.y -= 1.2 }) }
    } else if (F.st === 2) { ang = -32; bend = .58; shake = Math.sin(t / 22) * 2.2 }
    else if (F.st === 3) { ang = -52 + ROD.tension * 14; bend = .32 + ROD.tension * .5; shake = Math.sin(t / 30) * ROD.tension * 2.4 }
    const d = rdir(), [hx, hy] = hand(), L = 24, ar = ang * Math.PI / 180;
    let tx = hx + Math.cos(ar) * L * d, ty = hy + Math.sin(ar) * L;
    const bx = bob.visible && ROD.launched ? bob.x : tx, by = bob.visible && ROD.launched ? bob.y : ty + 6;
    // a ponta verga na direção da linha
    const vx = bx - tx, vy = by - ty, vl = Math.hypot(vx, vy) || 1, b = bend * L * .42;
    tx += vx / vl * b * .7 + shake * .3; ty += vy / vl * b * .7 + shake;
    const cx = (hx + tx) / 2 + vx / vl * b * .55, cy = (hy + ty) / 2 + vy / vl * b * .55;
    const pts = []; for (let i = 0; i <= 8; i++) { const u = i / 8, w = 1 - u; pts.push([w * w * hx + 2 * w * u * cx + u * u * tx, w * w * hy + 2 * w * u * cy + u * u * ty]) }
    rodG.clear().setDepth(H.playerY + 1.5);
    // linha: da ponta até a boia, com barriga quando frouxa
    if (bob.visible) { const sag = ROD.sag * (1 - Math.min(1, bend * 1.4)), mx = (tx + bx) / 2, my = (ty + by) / 2 + sag; rodG.lineStyle(1, 0xeef4f8, .8).beginPath().moveTo(tx, ty); for (let i = 1; i <= 8; i++) { const u = i / 8, w = 1 - u; rodG.lineTo(w * w * tx + 2 * w * u * mx + u * u * bx, w * w * ty + 2 * w * u * my + u * u * by) } rodG.strokePath() }
    // cabo de cortiça (atrás da mão)
    const ux = (pts[1][0] - hx), uy = (pts[1][1] - hy), ul = Math.hypot(ux, uy) || 1;
    rodG.lineStyle(3, 0xc89a62, 1).lineBetween(hx - ux / ul * 4, hy - uy / ul * 4, hx + ux / ul * 1, hy + uy / ul * 1);
    // vara: escura com brilho, afinando na ponta
    rodG.lineStyle(2, 0x4a2e16, 1).beginPath().moveTo(pts[0][0], pts[0][1]); for (let i = 1; i <= 5; i++) rodG.lineTo(pts[i][0], pts[i][1]); rodG.strokePath();
    rodG.lineStyle(1, 0x5a3a1c, 1).beginPath().moveTo(pts[5][0], pts[5][1]); for (let i = 6; i <= 8; i++) rodG.lineTo(pts[i][0], pts[i][1]); rodG.strokePath();
    rodG.lineStyle(1, 0xb07a40, .9).beginPath().moveTo(pts[0][0], pts[0][1] - .6); for (let i = 1; i <= 4; i++) rodG.lineTo(pts[i][0], pts[i][1] - .6); rodG.strokePath();
    // molinete
    rodG.fillStyle(0x9aa0aa, 1).fillCircle(hx + ux / ul * 2.5 - uy / ul * 2, hy + uy / ul * 2.5 + ux / ul * 2, 1.7).fillStyle(0x3a3a44, 1).fillCircle(hx + ux / ul * 2.5 - uy / ul * 2, hy + uy / ul * 2.5 + ux / ul * 2, .7);
    ROD.tip = [tx, ty];
  };
  H.events.on("update", rodTick); H.events.once("shutdown", () => H.events.off("update", rodTick));
  const rodHide = ms => H.time.delayedCall(ms, () => { if (!F.st) { ROD.vis = !1; rodG.clear() } });
  const drawLine = () => { };
  const drawLineOld = () => { if (!F.spot) return; const [hx, hy] = hand(); line.clear().lineStyle(1, 0x5a3a1c, 1).lineBetween(hx, hy, hx + (H.facing?.x || 0) * 6, hy - 10).lineStyle(1, 0xeef4f8, .75).lineBetween(hx + (H.facing?.x || 0) * 6, hy - 10, bob.x, bob.y - 2); line.setDepth(H.playerY + 2) };
  const end = (outro) => { F.st = 0; bob.setVisible(!1); line.clear(); F.ev?.remove(); F.ev = null; H.tweens.killTweensOf(bob); F.spot = null;
    if (!outro && ROD.vis) rodPlay([[0, ROD.ang, ROD.bend], [.5, -70, .05], [1, -60, 0]], 300, () => rodHide(0)) };
  const hour = () => new Date().getHours();
  const ok = (s, sp) => !s[8] || (s[8] === "night" ? (hour() >= 19 || hour() < 6) : s[8] === "morning" ? (hour() >= 6 && hour() < 11) : s[8] === "deep" ? sp.deep : !0);
  const roll = sp => { const pool = __PZ_SPECIES.filter(s => ok(s, sp)).map(s => [s, s[5] * (sp.deep && s[4] >= 2 ? 2.2 : 1)]); let t = pool.reduce((a, b) => a + b[1], 0) * rnd(); for (const [s, w] of pool) { if ((t -= w) <= 0) return s } return pool[0][0] };
  const cast = sp => {
    F.spot = sp; F.st = 1; const dx = sp.w[0] - H.playerX; H.facing = Math.abs(dx) > 8 ? { x: Math.sign(dx), y: 0 } : { x: 0, y: 1 };
    ROD.vis = !0; ROD.launched = !1; ROD.sag = 10; bob.setVisible(!1).setAlpha(1).setDepth(sp.w[1] - FO + 1);
    rodPlay([[0, -55, 0], [.38, -150, .12], [.6, -14, .3], [.8, -48, .06], [1, -45, .08]], 560);
    H.time.delayedCall(330, () => { if (F.st !== 1 || F.spot !== sp) return;
    const [sx, sy] = ROD.tip || hand(); bob.setPosition(sx, sy).setVisible(!0); ROD.launched = !0; sfx("paddle", .12);
    const c = { u: 0 }; H.tweens.add({ targets: c, u: 1, duration: 520, ease: "Sine.easeOut", onUpdate: () => { bob.x = sx + (sp.w[0] - sx) * c.u; bob.y = sy + (sp.w[1] - sy) * c.u - Math.sin(Math.PI * c.u) * 26 }, onComplete: () => {
      sfx("splash", .25); const r = H.add.image(sp.w[0], sp.w[1], "pq-ring").setAlpha(.8).setDepth(-18); H.tweens.add({ targets: r, scale: 1.6, alpha: 0, duration: 700, onComplete: () => r.destroy() });
      H.tweens.add({ targets: bob, y: sp.w[1] + 1, duration: 700, yoyo: !0, repeat: -1, ease: "Sine.easeInOut", onUpdate: drawLine });
    } }); });
    F.fish = roll(sp);
    F.ev = H.time.delayedCall(2000 + rnd() * 4500, () => {
      if (F.st !== 1) return; F.st = 2; H.tweens.killTweensOf(bob); bob.y += 3; bob.setAlpha(.55); drawLine(); sfx("wade", .45);
      const ex = H.add.text(bob.x, bob.y - 14, "!", { ...Le, fontSize: "14px", color: "#ffe14a", stroke: "#120c08", strokeThickness: 3 }).setOrigin(.5).setDepth(9200);
      H.tweens.add({ targets: ex, scale: { from: .6, to: 1.15 }, duration: 160, yoyo: !0 });
      H.game.audioEngine?.sfx?.("sfx-ui-move");
      F.ev = H.time.delayedCall(950, () => { ex.destroy(); if (F.st === 2) { end(); say(L3("Escapou… aperte assim que aparecer o !", "It got away… press as soon as the ! shows up", "Se escapó… pulsa en cuanto aparezca el !"), "#ffb0a0") } });
      F.ex = ex;
    });
  };
  let lastAct = 0;
  const act = sp => {
    if (H.__pqReel) return;
    const now = Date.now(); if (now - lastAct < 300) return; lastAct = now;   // o E chama a interação duas vezes no mesmo toque
    if (F.st === 0) return cast(sp);
    if (F.spot !== sp) return;
    if (F.st === 1) { end(); say(L3("Puxou cedo demais! Espere a boia afundar.", "Too early! Wait for the bobber to sink.", "¡Demasiado pronto! Espera a que se hunda el corcho."), "#ffb0a0"); return }
    if (F.st === 2) { F.ev?.remove(); F.ex?.destroy(); F.st = 3; reel(F.fish) }
  };
  // ── barra de puxar ──────────────────────────────────────────────────────────────────────────────
  const reel = S => {
    H.__pqReel = 1; H.__busy = !0; H.path = null; const lvl = S[6], rar = __PZ_RAR[S[4]];
    const W_ = typeof _ !== "undefined" ? _ : 480, H_ = typeof st !== "undefined" ? st : 270;
    const o = H.add.container(H.__ox ?? 0, H.__oy ?? 0).setDepth(9806).setScrollFactor(0).setScale(H.__us ?? 1);
    const BH = 132, BX = W_ - 70, BY = H_ / 2 - BH / 2 - 6, zoneH = Math.max(18, 44 - lvl * 3.2);
    const fr = H.add.graphics(); fr.fillStyle(0x120c08, .88).fillRoundedRect(BX - 16, BY - 14, 66, BH + 28, 6).lineStyle(1, 0xc9a24a, .9).strokeRoundedRect(BX - 16, BY - 14, 66, BH + 28, 6);
    fr.fillStyle(0x1c3a5a, 1).fillRect(BX - 6, BY, 18, BH).lineStyle(1, 0x5a8ab0, 1).strokeRect(BX - 6, BY, 18, BH);
    const zone = H.add.rectangle(BX + 3, BY + BH - zoneH / 2, 16, zoneH, 0x6fe07a, .55).setStrokeStyle(1, 0xb8ffb8, .9);
    const [tk, tf] = icon(S[0]); const fi = H.add.image(BX + 3, BY + BH / 2, tk, tf).setScale(.9);
    const meterBg = H.add.rectangle(BX + 26, BY + BH / 2, 7, BH, 0x2a1c10, 1).setStrokeStyle(1, 0x8a6a3a, 1);
    const meter = H.add.rectangle(BX + 26, BY + BH, 5, 1, 0xffd24a, 1).setOrigin(.5, 1);
    const hint = H.add.text(BX + 17, BY + BH + 20, L3("SEGURE", "HOLD", "MANTÉN"), { ...Le, fontSize: "8px", color: "#f2d9a0", stroke: "#120c08", strokeThickness: 3 }).setOrigin(.5).setScale(.8);
    const title = H.add.text(BX + 17, BY - 22, rar[3] === "#ffd24a" ? "!!!" : "!", { ...Le, fontSize: "11px", color: rar[3], stroke: "#120c08", strokeThickness: 3 }).setOrigin(.5);
    o.add([fr, zone, fi, meterBg, meter, hint, title]);
    let zy = BY + BH - zoneH / 2, zv = 0, fy = BY + BH * .7, ft = fy, ftT = .8, prog = .3, done = !1, tickT = 0, grace = 1;
    const down = new Set(), kd = e => { if ([" ", "e", "E", "Enter", "z", "Z"].includes(e.key)) down.add(e.key.toLowerCase()) }, ku = e => down.delete(e.key.toLowerCase());
    window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
    const held = () => { if (H.input.activePointer?.isDown) return !0; if (down.size) return !0; try { const g = Array.from(navigator.getGamepads?.() ?? []).find(q => q && q.connected); if (g && (g.buttons[0]?.pressed || g.buttons[7]?.pressed)) return !0 } catch (e) { } return !1 };
    const finish = win => {
      if (done) return; done = !0; H.events.off("update", upd); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku);
      H.tweens.add({ targets: o, alpha: 0, duration: 200, onComplete: () => o.destroy() });
      H.time.delayedCall(220, () => { H.__busy = !1; H.__pqReel = 0 });
      const sp = F.spot; end(!0);
      if (win) rodPlay([[0, ROD.ang, .6], [.35, -88, .25], [.7, -80, .05], [1, -82, 0]], 700, () => rodHide(900));
      else rodPlay([[0, ROD.ang, .7], [.15, -20, -.35], [.35, -60, .25], [.55, -38, -.12], [.75, -50, .06], [1, -46, 0]], 650, () => rodHide(500));
      if (win) caught(S, sp); else { sfx("splash", .3); say(L3("A linha arrebentou… ele era forte!", "The line snapped… it was strong!", "Se rompió el sedal… ¡era fuerte!"), "#ffb0a0") }
    };
    const upd = (_t, ms) => {
      const dt = Math.min(.05, ms / 1000);
      // faixa verde: sobe segurando, cai soltando
      zv += (held() ? -520 : 420) * dt; zv = Math.max(-200, Math.min(240, zv)); zy += zv * dt;
      const top = BY + zoneH / 2, bot = BY + BH - zoneH / 2; if (zy < top) { zy = top; zv = 0 } if (zy > bot) { zy = bot; zv *= -.25 }
      zone.y = zy;
      // peixe: escolhe alvos, mais nervoso quanto mais forte
      if ((ftT -= dt) <= 0) { ftT = .35 + rnd() * (1.4 - lvl * .1); ft = BY + 8 + rnd() * (BH - 16); if (rnd() < lvl * .06) ftT *= .4 }
      fy += (ft - fy) * Math.min(1, dt * (1.6 + lvl * .55)); fi.y = fy; fi.x = BX + 3 + Math.sin(_t / 90) * (lvl > 5 ? 1.5 : .7);
      const inZ = Math.abs(fy - zy) < zoneH / 2;
      ROD.tension = Math.min(1, Math.abs(fy - zy) / (BH * .45) + (held() ? .15 : 0));
      grace -= dt; prog += (inZ ? .3 - lvl * .012 : grace > 0 ? 0 : -(.11 + lvl * .018)) * dt; prog = Math.max(0, Math.min(1, prog));
      meter.height = Math.max(1, prog * (BH - 2)); meter.fillColor = prog > .7 ? 0x8fff8a : prog > .35 ? 0xffd24a : 0xff7a5a;
      zone.fillColor = inZ ? 0x6fe07a : 0x8aa070;
      if ((tickT -= dt) <= 0 && inZ) { tickT = .22; try { H.game.audioEngine?.sfx?.("sfx-ui-tab") } catch (e) { } }
      if (prog >= 1) finish(!0); else if (prog <= 0) finish(!1);
      drawLine(); if (bob.visible) bob.x = (F.spot?.w[0] || bob.x) + Math.sin(_t / 70) * (2 + lvl * .4);
    };
    H.events.on("update", upd);
    H.events.once("shutdown", () => { done = !0; H.events.off("update", upd); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); H.__pqReel = 0 });
  };
  // ── pegou ──────────────────────────────────────────────────────────────────────────────────────
  const caught = (S, sp) => {
    const d = __pqGet(H); d.f ??= {}; d.cesto ??= {};
    const [a, b] = S[7], cm = Math.round(a + (b - a) * Math.pow(rnd(), 1.6)), rec = d.f[S[0]], novo = !rec, recorde = rec && cm > rec.max;
    d.f[S[0]] = { n: (rec?.n || 0) + 1, max: Math.max(rec?.max || 0, cm) }; d.cesto[S[0]] = (d.cesto[S[0]] || 0) + 1;
    const all = __PZ_SPECIES.every(s => d.f[s[0]]), firstAll = all && !d.done; if (firstAll) d.done = 1;
    __pqSet(H, d);
    // o peixe pula da água no ponto
    const ti = __PZ_TEX[S[0]], j_ = H.add.sprite(sp ? sp.w[0] : H.playerX, sp ? sp.w[1] : H.playerY, "pq-f" + ti, 0).setOrigin(.5, .8).setScale(1.2).setDepth((sp ? sp.w[1] : H.playerY) - FO + 3);
    j_.play("pq-j" + ti); j_.once("animationcomplete", () => j_.destroy()); sfx("splash", .4);
    // cartão do peixe
    const W_ = typeof _ !== "undefined" ? _ : 480, H_ = typeof st !== "undefined" ? st : 270, rar = __PZ_RAR[S[4]];
    const o = H.add.container(H.__ox ?? 0, H.__oy ?? 0).setDepth(9807).setScrollFactor(0).setScale(H.__us ?? 1).setAlpha(0);
    const cx = W_ / 2, cy = H_ * .34, bw = 190, bh = 74;
    const g = H.add.graphics(); g.fillStyle(0x120c08, .92).fillRoundedRect(cx - bw / 2, cy - bh / 2, bw, bh, 7).lineStyle(1.5, Phaser_hex(rar[3]), 1).strokeRoundedRect(cx - bw / 2, cy - bh / 2, bw, bh, 7);
    const [tk, tf] = icon(S[0]); const ic = H.add.image(cx - bw / 2 + 32, cy, tk, tf).setScale(1.6);
    const nm = H.add.text(cx - bw / 2 + 62, cy - 24, L3(S[1], S[2], S[3]).toUpperCase(), { ...Le, fontSize: "11px", color: "#f6e6c0", stroke: "#120c08", strokeThickness: 3 });
    const rt = H.add.text(cx - bw / 2 + 62, cy - 8, L3(rar[0], rar[1], rar[2]), { ...Le, fontSize: "8px", color: rar[3], stroke: "#120c08", strokeThickness: 3 });
    const sz = H.add.text(cx - bw / 2 + 62, cy + 6, `${cm} cm` + (novo ? L3("  · NOVO NO DIÁRIO!", "  · NEW IN JOURNAL!", "  · ¡NUEVO EN EL DIARIO!") : recorde ? L3("  · RECORDE!", "  · RECORD!", "  · ¡RÉCORD!") : ""), { ...Le, fontSize: "8px", color: novo || recorde ? "#9be27a" : "#cfe0ff", stroke: "#120c08", strokeThickness: 3 });
    const bk = H.add.text(cx - bw / 2 + 62, cy + 20, L3("Guardado no cesto", "Stored in the basket", "Guardado en la cesta"), { ...Le, fontSize: "7px", color: "#bba888", stroke: "#120c08", strokeThickness: 2 });
    o.add([g, ic, nm, rt, sz, bk]);
    H.tweens.add({ targets: o, alpha: 1, y: o.y - 6, duration: 220 }); H.tweens.add({ targets: o, alpha: 0, delay: 2600, duration: 400, onComplete: () => o.destroy() });
    H.game.audioEngine?.sfx?.(S[4] >= 2 ? "sfx-epic-drop" : "sfx-item-pickup");
    if (S[4] >= 2) H.time.delayedCall(500, () => say(S[4] === 3 ? L3("Que monstro! Ninguém vai acreditar nisso.", "What a monster! Nobody will believe this.", "¡Qué monstruo! Nadie lo va a creer.") : L3("Esse é dos bons!", "Now that's a good one!", "¡Este es de los buenos!"), "#ffe9a0", 2400));
    if (firstAll) H.time.delayedCall(3300, () => { const n = __pqReward(H, 500); say(L3(`Diário completo! +${n} de recompensa.`, `Journal complete! +${n} reward.`, `¡Diario completo! +${n} de recompensa.`), "#ffd24a", 3200) });
  };
  for (const sp of SPOTS) H.inters.push({ area: "out", id: "pesca-" + sp.id, x: sp.at[0], y: sp.at[1], r: 20, label: sp.name, desc: L3("Pescar", "Fish", "Pescar"), act: () => act(sp) });
  // afastou: recolhe a linha
  const away = () => { if (F.st && F.st < 3 && F.spot && Math.hypot(H.playerX - F.spot.at[0], H.playerY - F.spot.at[1]) > 34) end() };
  H.events.on("update", away); H.events.once("shutdown", () => H.events.off("update", away));
  // Diário de Pesca: na porta da casa do pescador
  const R = H.M.dockRect, DP = [R[0] + 96, R[1] + 128 - FO + 6];
  H.inters.push({ area: "out", id: "pesca-diario", x: DP[0], y: DP[1], r: 22, label: L3("DIÁRIO DE PESCA", "FISHING JOURNAL", "DIARIO DE PESCA"), desc: L3("Ver peixes", "View fish", "Ver peces"), act: () => { const n = Date.now(); if (n - (H.__pqJT || 0) < 300) return; H.__pqJT = n; __pqJournal(H, icon) } });
}
function Phaser_hex(c) { return parseInt(String(c).replace("#", ""), 16) }
/* recompensa em ouro (campanha) ou fragmentos (infinito), como a pesca do laguinho */
function __pqReward(H, n) {
  try {
    if (H.fromForest) { const c = __cData(H); if (c?.d) { c.d.player ??= {}; c.d.player.gold = (c.d.player.gold ?? 0) + n; localStorage.setItem(Wt("campaign", c.sl), JSON.stringify(c.d)) } }
    else { const m = Xe(); const f = Math.max(1, Math.round(n / 5)); m.fragments = (m.fragments || 0) + f; m.totalEarned = (m.totalEarned || 0) + f; tr(m); n = f }
    H.refreshFragments?.();
  } catch (e) { }
  return n;
}
/* painel do diário: 10 peixes em 5x2, silhueta nos que faltam, com dica de onde/quando aparecem */
function __pqJournal(H, icon) {
  if (H.__hubDlgO || H.__pqJ) return;
  const L3 = __L3, d = __pqGet(H), f = d.f || {}, cesto = d.cesto || {};
  const W_ = typeof _ !== "undefined" ? _ : 480, H_ = typeof st !== "undefined" ? st : 270;
  H.__busy = !0;
  const o = H.__pqJ = H.add.container(H.__ox ?? 0, H.__oy ?? 0).setDepth(9806).setScrollFactor(0).setScale(H.__us ?? 1);
  const dim = H.add.rectangle(W_ / 2, H_ / 2, W_ * 1.3, H_ * 1.3, 0, .45).setInteractive(); o.add(dim);
  const pw = Math.min(W_ - 24, 420), ph = Math.min(H_ - 20, 230), px = (W_ - pw) / 2, py = (H_ - ph) / 2;
  const g = H.add.graphics(); g.fillStyle(0x2a1c10, .97).fillRoundedRect(px, py, pw, ph, 8).lineStyle(1.5, 0xc9a24a, 1).strokeRoundedRect(px, py, pw, ph, 8);
  const got = __PZ_SPECIES.filter(s => f[s[0]]).length;
  const tt = H.add.text(W_ / 2, py + 12, L3("DIÁRIO DE PESCA", "FISHING JOURNAL", "DIARIO DE PESCA") + `  ${got}/10`, { ...Le, fontSize: "12px", color: "#f2d9a0", stroke: "#120a08", strokeThickness: 3 }).setOrigin(.5, 0);
  o.add([g, tt]);
  const cw = (pw - 20) / 5, chh = (ph - 56) / 2;
  __PZ_SPECIES.forEach((s, i) => {
    const cx = px + 10 + cw * (i % 5) + cw / 2, cy = py + 38 + chh * (i / 5 | 0) + chh / 2, has = f[s[0]], rar = __PZ_RAR[s[4]];
    const cell = H.add.graphics(); cell.fillStyle(0x120c08, .6).fillRoundedRect(cx - cw / 2 + 3, cy - chh / 2 + 3, cw - 6, chh - 6, 5).lineStyle(1, has ? Phaser_hex(rar[3]) : 0x5a4a30, has ? .9 : .6).strokeRoundedRect(cx - cw / 2 + 3, cy - chh / 2 + 3, cw - 6, chh - 6, 5);
    const [tk, tf] = icon(s[0]); const ic = H.add.image(cx, cy - 12, tk, tf).setScale(1.25); if (!has) ic.setTint(0x000000).setAlpha(.55);
    const hint = s[8] === "night" ? L3("Só à noite", "Night only", "Solo de noche") : s[8] === "morning" ? L3("Só de manhã", "Mornings only", "Solo de mañana") : s[8] === "deep" ? L3("Ponto fundo", "Deep spot", "Punto hondo") : "";
    const t1 = H.add.text(cx, cy + 8, has ? L3(s[1], s[2], s[3]) : "???", { ...Le, fontSize: "8px", color: has ? "#f6e6c0" : "#8a7a60", stroke: "#120c08", strokeThickness: 2, align: "center" }).setOrigin(.5, 0);
    const t2 = H.add.text(cx, cy + 20, has ? `${L3("máx", "max", "máx")} ${has.max} cm · ×${has.n}` : hint || L3(rar[0], rar[1], rar[2]), { ...Le, fontSize: "7px", color: has ? "#cfe0ff" : (hint ? "#9fc8e8" : rar[3]), stroke: "#120c08", strokeThickness: 2 }).setOrigin(.5, 0);
    o.add([cell, ic, t1, t2]);
  });
  const tot = Object.values(cesto).reduce((a, b) => a + b, 0);
  const ft = H.add.text(W_ / 2, py + ph - 14, (d.done ? L3("Diário completo! ", "Journal complete! ", "¡Diario completo! ") : L3("Complete o diário para ganhar uma recompensa. ", "Complete the journal for a reward. ", "Completa el diario para una recompensa. ")) + L3(`No cesto: ${tot} peixes`, `In the basket: ${tot} fish`, `En la cesta: ${tot} peces`), { ...Le, fontSize: "7px", color: "#bba888", stroke: "#120c08", strokeThickness: 2 }).setOrigin(.5, 1);
  o.add(ft);
  let ready = !1; H.time.delayedCall(250, () => ready = !0);
  const close = () => { if (!ready || !o.active) return; H.input.off("pointerdown", close); H.input.keyboard?.off("keydown", kh); H.events.off("update", pad); o.destroy(); H.__pqJ = null; H.time.delayedCall(150, () => H.__busy = !1) };
  const kh = e => ["Escape", "Enter", " ", "e", "E", "z", "Z", "Backspace"].includes(e.key) && close();
  let pv = !0; const pad = () => { let g2 = null; try { g2 = Array.from(navigator.getGamepads?.() ?? []).find(q => q && q.connected) } catch (e) { } const a = !!(g2 && (g2.buttons[0]?.pressed || g2.buttons[1]?.pressed)); a && !pv && close(); pv = a };
  H.input.on("pointerdown", close); H.input.keyboard?.on("keydown", kh); H.events.on("update", pad);
  H.events.once("shutdown", () => { H.input.off("pointerdown", close); H.input.keyboard?.off("keydown", kh); H.events.off("update", pad); H.__pqJ = null });
}
