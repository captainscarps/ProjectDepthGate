/* ══ A Velha da Cabana — missão secundária da campanha ══
   Depois do 1º selo, a Guardiã manda o herói à Floresta da Cripta (cenário do cemitério) para matar o
   Cérbero da Podridão. No caminho há uma cabana: dentro, uma senhora vende uma fruta "mágica" (+crítico,
   −recarga) e insiste que seja comida na hora. Quem come perde 13% da vida máxima a cada selo seguinte
   (multiplicado: ×0,87 por selo). Ao voltar ao Coração da Floresta o herói estranha o cansaço; se falar com a
   Guardiã logo em seguida e disser que não está bem, ela descobre o veneno. Se ninguém perceber, ela percebe
   sozinha ao 5º selo. Ela leva o herói até a casa da bruxa, que vira chefe. Morta a bruxa, todo o efeito
   da fruta some (bom e ruim). */
const __WQ = {
  PRICE: 30, CRIT: 10, CDR: .15, HP: .87, FORCE_AT: 5,
  f(S, k, set) { try { return __stFlag(S, k, set) } catch (e) { return !1 } },
  camp(S) { return S?.game?.registry?.get("mode") === "campaign" && !S.level?.endless },
  sealed(S) { try { return __hubProg(S).n } catch (e) { return 0 } },
  atEat(S) { for (let k = 0; k <= 12; k++) if (this.f(S, "wqAt" + k)) return k; return 0 },
  poisoned(S) { return this.f(S, "wqEat") && !this.f(S, "wqCure") },
  stacks(S) { return this.poisoned(S) ? Math.max(0, this.sealed(S) - this.atEat(S)) : 0 },
  hero(S) { return (__HN[S.classDef?.id] ?? "Herói").toUpperCase() },
  G(text, expr = "talk") { return { who: "guardia", expr, name: __GN, text } },
  V(text, expr = "talk") { return { who: "velha", expr, name: "A SENHORA", text } },
  B(text, expr = "aggression") { return { who: "velha", expr, name: "A BRUXA", text } },
  H(S, text) { return { name: this.hero(S), text } },
};
/* ─── chefes ─── */
function __wqDefs() {
  if (__wqDefs.ok) return;
  __wqDefs.ok = !!Yt.CERBERUS;
  Yt.CERBERUS_ROT = {
  ...(Yt.CERBERUS || Yt.ABYSS_GUARDIAN), name: "Cérbero da Podridão", subtitle: "O Cão que Abre as Portas dos Mortos",
  maxHp: 72, contactDamage: 2, speed: 68, xp: 520, gold: { min: 60, max: 110 }, attackCooldownMs: 1450,
  attacks: {
    SLAM: { damage: 3, range: 66, width: 78, telegraphMs: 560, recoverMs: 480 },
    CHARGE: { damage: 3, speed: 420, length: 280, durationMs: 600, telegraphMs: 720, recoverMs: 600 },
    SHOCKWAVE: { damage: 2, radius: 118, telegraphMs: 820, recoverMs: 700 },
  },
  phase2: { hpRatio: .5, speedMult: 1.35, cooldownMult: .65, damageMult: 1.25, radiusMult: 1.25, chargeSpeedMult: 1.2, tint: 0x9be05a },
};
Yt.WITCH_CRONE = {
  ...(Yt.REAPER || Yt.ABYSS_GUARDIAN), name: "Bruxa das Sepulturas", subtitle: "A Velha da Cabana", texture: "gw-crone", scale: 1.85,
  bodySize: 30, maxHp: 125, contactDamage: 2, speed: 56, xp: 950, gold: { min: 120, max: 200 }, attackCooldownMs: 1600,
  attacks: {
    SLAM: { damage: 3, range: 62, width: 74, telegraphMs: 600, recoverMs: 520 },
    SHOCKWAVE: { damage: 3, radius: 112, telegraphMs: 820, recoverMs: 650 },
  },
  phase2: { hpRatio: .5, speedMult: 1.3, cooldownMult: .62, damageMult: 1.3, radiusMult: 1.3, tint: 0xc8ff9a },
  anims: { idle: { frames: [0], frameRate: 3, repeat: -1 }, walk: { frames: [0], frameRate: 6, repeat: -1 }, attack: { frames: [0], frameRate: 8, repeat: 0 }, hurt: { frames: [0], frameRate: 6, repeat: 0 }, death: { frames: [0], frameRate: 4, repeat: 0 } },
};
}
try { Object.assign(__BEL, { CERBERUS_ROT: "poison", WITCH_CRONE: "poison" }) } catch (e) {}
/* ─── níveis ─── */
{
  const gy = { ...Ls.graveyard, id: "graveyard", name: "Floresta da Cripta" };
  const st = (tex, col, row) => ({ type: "sprite", tex, col, row, solid: !0, bw: 14, bh: 10 });
  ki.cripta = {
    id: "cripta", name: "Floresta da Cripta", theme: gy, world: { cols: 84, rows: 46 }, pendingFinale: "O CÉRBERO DA PODRIDÃO CAIU",
    rooms: [
      { id: "cr-00", name: "Clareira do Portal", rect: { x: 4, y: 18, w: 12, h: 10 }, ambient: .55, walls: [], enemies: [], decor: [st("gy-statue3", 6, 20), st("gy-statue7", 13, 26)] },
      { id: "cr-01", name: "Túmulos Revirados", rect: { x: 22, y: 16, w: 14, h: 12 }, ambient: .5, walls: [], decor: [st("gy-statue2", 24, 18), st("gy-statue5", 33, 18), st("gy-statue9", 24, 25), st("gy-statue11", 33, 25)],
        enemies: [{ type: "GW_ZOMBIE", col: 26, row: 19 }, { type: "GW_ZOMBIE", col: 31, row: 24 }, { type: "GW_SKELETON_GRAVEDIGGER", col: 32, row: 20 }, { type: "GW_ZOMBIE", col: 25, row: 24 }] },
      { id: "cr-02", name: "Cabana na Névoa", rect: { x: 21, y: 2, w: 16, h: 9 }, ambient: .48, walls: [], enemies: [], decor: [], wqCabin: !0 },
      { id: "cr-03", name: "Portões dos Mortos", rect: { x: 42, y: 15, w: 14, h: 14 }, ambient: .45, walls: [], decor: [st("gy-statue14", 44, 17), st("gy-statue16", 53, 17), st("gy-statue18", 44, 27), st("gy-statue20", 53, 27)],
        enemies: [{ type: "GW_ZOMBIE", col: 45, row: 19 }, { type: "GW_SHEET_GHOST", col: 52, row: 19 }, { type: "GW_SKELETON_GRAVEDIGGER", col: 47, row: 25 }, { type: "GW_PUMPKIN_SCARECROW", col: 51, row: 24, elite: !0 }] },
      { id: "cr-04", name: "Covil da Podridão", rect: { x: 61, y: 12, w: 18, h: 20 }, ambient: .42, walls: [], enemies: [], decor: [st("gy-statue22", 63, 14), st("gy-statue24", 76, 14)], boss: "CERBERUS_ROT", bossCol: 70, bossRow: 20 },
      { id: "cr-int", name: "Dentro da Cabana", rect: { x: 4, y: 36, w: 10, h: 7 }, ambient: .62, walls: [], enemies: [], decor: [], interior: !0 },
    ],
    corridors: [{ x: 16, y: 21, w: 6, h: 3 }, { x: 28, y: 11, w: 3, h: 5 }, { x: 36, y: 21, w: 6, h: 3 }, { x: 56, y: 21, w: 5, h: 3 }],
    doors: [], playerSpawn: { col: 9, row: 23 }, next: null,
  };
  ki.bruxa = {
    id: "bruxa", name: "Cabana da Bruxa", theme: gy, world: { cols: 40, rows: 30 }, pendingFinale: "A BRUXA DAS SEPULTURAS CAIU",
    rooms: [{ id: "bx-00", name: "Clareira da Bruxa", rect: { x: 5, y: 4, w: 30, h: 22 }, ambient: .46, walls: [], enemies: [], wqCabin: !0,
      decor: [st("gy-statue4", 8, 14), st("gy-statue6", 31, 14), st("gy-statue8", 9, 22), st("gy-statue10", 30, 22)] }],
    corridors: [], doors: [], playerSpawn: { col: 20, row: 23 }, next: null,
  };
}
/* ─── texturas: bruxa recolorida (manto verde-podre), retrato, cabana sombria ─── */
function __wqHsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60 } return [h, s, l] }
function __wqRgb(h, s, l) { const f = (n) => { const k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))) }; return [f(0), f(8), f(4)] }
function __wqTex(S) {
  const T = S.textures;
  const recolor = (srcKey, dst, fn) => {
    if (T.exists(dst) || !T.exists(srcKey)) return T.exists(dst);
    const im = T.get(srcKey).getSourceImage(), cv = T.createCanvas(dst, im.width, im.height), x = cv.getContext();
    x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, im.width, im.height), O = d.data;
    for (let i = 0; i < O.length; i += 4) { if (!O[i + 3]) continue; const r = fn(O[i], O[i + 1], O[i + 2]); if (r) { O[i] = r[0]; O[i + 1] = r[1]; O[i + 2] = r[2] } }
    x.putImageData(d, 0, 0); cv.refresh(); return !0;
  };
  // manto e chapéu (cinza-arroxeado, pouco saturado) viram verde-musgo podre
  if (recolor("gw-witch", "gw-crone", (r, g, b) => { const [h, s, l] = __wqHsl(r, g, b); return s < .34 && l > .05 && l < .56 ? __wqRgb(96, .32 + s * .3, Math.min(.6, l * 1.08)) : null })) {
    const t = T.get("gw-crone"); if (!t.has(7)) for (let k = 0; k < 8; k++) t.add(k, 0, k * 64, 0, 64, 64);
    for (const a of ["idle", "walk", "attack", "hurt", "death", "windup", "strike", "phase", "special"]) { const ak = "gw-crone-" + a, an = S.anims.get(ak); if (an && !(an.frames?.length > 0)) S.anims.remove(ak); S.anims.exists(ak) || S.anims.create({ key: "gw-crone-" + a, frames: [{ key: "gw-crone", frame: 0 }], frameRate: 4, repeat: a === "idle" || a === "walk" ? -1 : 0 }) }
  }
  // retrato para os diálogos (rosto ampliado do quadro de frente)
  const face = T.exists("velha-face");
  if ((face || T.exists("gw-crone")) && !T.exists("velha-p-talk")) {
    const src = T.get(face ? "velha-face" : "gw-crone").getSourceImage();
    for (const [ex, tint] of [["talk", null], ["smile", null], ["calm", null], ["aggression", "rgba(120,255,90,.22)"], ["special", "rgba(120,255,90,.32)"]]) {
      const cv = T.createCanvas("velha-p-" + ex, 128, 128), x = cv.getContext(); x.imageSmoothingEnabled = !1;
      face ? x.drawImage(src, 0, 0) : x.drawImage(src, 8, 2, 40, 40, 0, 0, 128, 128);
      if (tint) { x.globalCompositeOperation = "source-atop"; x.fillStyle = tint; x.fillRect(0, 0, 128, 128); x.globalCompositeOperation = "source-over" }
      cv.refresh();
    }
  }
  // cabana: telhado de mato seco, sem flores, janelas com brilho verde
  recolor("gyx-hut-src", "gyx-hut", (r, g, b) => {
    const [h, s, l] = __wqHsl(r, g, b);
    if (h > 200 && h < 280 && s > .2) return __wqRgb(100, .7, .55);
    if (h >= 30 && h < 62 && s > .45 && l > .5) return __wqRgb(32, .25, l * .48);
    if (h >= 62 && h < 170) return __wqRgb(48 + (h - 62) * .08, s * .38, l * .62);
    if (h < 30 || h > 330) return __wqRgb(h, s * .7, l * .78);
    return null;
  });
}
/* ─── escolha com teclado, controle e toque ─── */
function __wqAsk(S, opts, cb) {
  const ui = S.scene.get("UI"); if (!ui) { cb(0); return }
  const F = "Georgia, 'Times New Roman', serif", R = ui.add.container(0, 0).setDepth(9800);
  R.add(ui.add.rectangle(_ / 2, st / 2, _ * 1.3, st * 1.3, 0, .45).setInteractive());
  const w = Math.min(380, _ - 40), x0 = _ / 2, y0 = st - 70 - opts.length * 30;
  let sel = 0, gone = !1;
  const items = opts.map((o, k) => {
    const y = y0 + k * 30, b = ui.add.rectangle(x0, y, w, 26, 0x140c08, .94).setStrokeStyle(1, 0x8a6a30), t = ui.add.text(x0, y, __T(o), { fontFamily: F, fontStyle: "bold", fontSize: "12px", color: "#e8dcc0" }).setOrigin(.5);
    const z = ui.add.zone(x0, y, w, 26).setInteractive({ useHandCursor: !0 }); z.on("pointerover", () => { sel = k; paint() }); z.on("pointerdown", () => { sel = k; pick() });
    R.add([b, t, z]); return { b, t };
  });
  const paint = () => items.forEach((it, k) => { it.b.setStrokeStyle(k === sel ? 2 : 1, k === sel ? 0xffd27a : 0x8a6a30).setFillStyle(k === sel ? 0x2a1a0e : 0x140c08, .96); it.t.setColor(k === sel ? "#ffffff" : "#cfc2a6") });
  const key = (e) => { const c = e.key; if (c === "ArrowUp" || c === "w" || c === "W" || c === "ArrowLeft") { sel = (sel + opts.length - 1) % opts.length; paint() } else if (c === "ArrowDown" || c === "s" || c === "S" || c === "ArrowRight") { sel = (sel + 1) % opts.length; paint() } else if (c === "Enter" || c === " " || c === "e" || c === "E") pick() };
  window.addEventListener("keydown", key); window.__padUI = (window.__padUI || 0) + 1;
  const was = !!S.uiOpen; S.uiOpen = !0; try { S.physics?.pause?.() } catch (e) {}
  const pick = () => { if (gone) return; gone = !0; window.removeEventListener("keydown", key); window.__padUI = Math.max(0, (window.__padUI || 0) - 1); R.destroy(); S.uiOpen = was; try { was || S.physics?.resume?.() } catch (e) {} S.__uiClosedAt = performance.now(); cb(sel) };
  paint();
}
/* ─── efeitos no personagem (recalculados com os atributos) ─── */
{
  const RC = Eh.prototype.recompute;
  Eh.prototype.recompute = function () {
    const r = RC.apply(this, arguments);
    try {
      const S = this.scene;
      if (!__WQ.camp(S) || !__WQ.poisoned(S)) return r;
      const t = this.total, n = __WQ.stacks(S);
      t.critChance = (t.critChance ?? 0) + __WQ.CRIT;
      t.cooldownReduction = Math.min(.5, (t.cooldownReduction ?? 0) + __WQ.CDR);
      if (n > 0) t.maxHp = Math.max(1, Math.round(t.maxHp * Math.pow(__WQ.HP, n)));
      const e = S.player; e && (e.maxHp = t.maxHp, e.hp = Math.min(e.hp, e.maxHp), S.game.events.emit("hud:hp", e.hp, e.maxHp));
      S.game.events.emit("rpg:stats", t);
    } catch (e) {}
    return r;
  };
}
/* ─── fogos de artifício pequenos ─── */
function __wqPortalFx(S, x, y, col = 0x9be05a) {
  try { __FX.tex(S); __FX.impact(S, x, y - 14, "poison", 1.4); __FX.ring(S, x, y, col, 70, 600, y + 6) } catch (e) {}
  try { S.effects?.burstTinted?.(x, y - 10, col, 24); S.cameraSys?.shake?.(.004, 200) } catch (e) {}
}
function __wqGo(S, id, extra) { __wqPortalFx(S, S.player.x, S.player.y, id === "forest" ? 0xffe6a0 : 0x9be05a); S.time.delayedCall(450, () => S.scene.isActive() && __goLevel(S, id, extra || {})) }
/* ─── veneno da bruxa no herói ─── */
function __wqPoison(S, src, dmg) {
  const p = S.player; if (!p || p.dead) return;
  S.__wqPz = (S.__wqPz || 0) + 1; const id = S.__wqPz;
  let n = 4; const tick = () => {
    if (!S.scene.isActive() || p.dead || S.__wqPz !== id || n-- <= 0) return;
    try { S.damageSystem.apply({ source: src, target: p, amount: dmg, dir: { x: 0, y: 0 } }) } catch (e) {}
    S.effects?.floatText?.(p.x, p.y - 26, "☠", "#9aff4a", 10); S.effects?.burstTinted?.(p.x, p.y - 8, 0x7ad84a, 5);
    S.time.delayedCall(850, tick);
  };
  S.game.events.emit("ui:banner", "ENVENENADO!", "#9aff4a"); S.time.delayedCall(500, tick);
}
/* ─── NPC: a senhora (mesma figura da bruxa, olhando para o herói) ─── */
function __wqLady(S, x, y) {
  __wqTex(S);
  if (S.textures.exists("velha")) {
    // a senhora encapuzada (pack Priest): parada, falando quando há diálogo por perto, sempre virada para o herói
    const A = S.anims;
    for (const [k, a, n, fr] of [["velha-idle", 0, 8, 6], ["velha-talk", 12, 11, 8], ["velha-walk", 24, 12, 10]]) A.exists(k) || A.create({ key: k, frames: A.generateFrameNumbers("velha", { start: a, end: a + n - 1 }), frameRate: fr, repeat: -1 });
    const s = S.add.sprite(x, y, "velha", 0).setOrigin(.5, 1).setDepth(y).setScale(.66).play("velha-idle");
    const sh = S.add.ellipse(x, y, 22, 7, 0, .35).setDepth(y - 1);
    const U = () => {
      if (!s.active || !S.player) return;
      s.setFlipX(S.player.x < s.x);
      const ui = S.scene.get("UI"), talk = !!ui?.__dlgOpen && Math.hypot(S.player.x - s.x, S.player.y - s.y) < 170;
      const want = talk ? "velha-talk" : "velha-idle";
      s.anims.currentAnim?.key !== want && s.play(want);
    };
    S.events.on("update", U); S.events.once("shutdown", () => S.events.off("update", U));
    return { spr: s, sh, destroy() { S.events.off("update", U); s.destroy(); sh.destroy() } };
  }
  const s = S.add.sprite(x, y, "gw-crone", 0).setOrigin(.5, .92).setDepth(y).setScale(.78);
  const sh = S.add.ellipse(x, y + 2, 26, 8, 0, .35).setDepth(y - 1);
  const U = () => { if (!s.active || !S.player) return; const a = (Math.atan2(S.player.y - s.y, S.player.x - s.x) * 180 / Math.PI + 360) % 360; s.setFrame([2, 1, 0, 7, 6, 5, 4, 3][Math.round(a / 45) % 8]); s.y = y + Math.sin(S.time.now / 600) * .6 };
  S.events.on("update", U); S.events.once("shutdown", () => S.events.off("update", U));
  return { spr: s, sh, destroy() { S.events.off("update", U); s.destroy(); sh.destroy() } };
}
function __wqZone(S, x, y, label, fn) { const z = S.add.zone(x, y, 4, 4); z.interactLabel = label; z.interact = fn; S.dungeon.objects.push(z); return z }
function __wqCabin(S, rm, solid = !0) {
  __wqTex(S);
  if (S.textures.exists("wh-cabin")) return __wqCabin2(S, rm, solid);
  const r = rm.rect, cx = (r.x + r.w / 2) * dt, by = (r.y + 4) * dt + 8, sc = 1.25;
  const hut = S.add.image(cx, by, S.textures.exists("gyx-hut") ? "gyx-hut" : "gy-decor1").setOrigin(.5, 1).setScale(sc).setDepth(by);
  S.add.ellipse(cx + 6, by - 2, 230, 24, 0, .35).setDepth(.6);
  if (solid) { const b = S.dungeon.solids.create(cx, by - 26, "rock"); b.setVisible(!1).setDisplaySize(212, 40); b.refreshBody?.() }
  const dx = cx + 14 * sc, dy = by;
  // janelas com brilho verde e fumaça na chaminé
  for (const ox of [-30, 52]) { const g = S.add.image(cx + ox * sc * .5 + (ox > 0 ? 10 : -6), by - 22, "light").setBlendMode(j.BlendModes.ADD).setTint(0x8cff6a).setScale(.08).setAlpha(.5).setDepth(by + 1); S.tweens.add({ targets: g, alpha: .22, duration: 900 + Math.random() * 500, yoyo: !0, repeat: -1 }) }
  S.lighting?.addLight?.({ x: dx, y: dy - 20, radius: 70, flicker: .18, color: 0x8cff6a });
  return { hut, door: { x: dx, y: dy + 6 } };
}
/* casa da bruxa (pack Main Characters Home recolorido, scripts/build_witch_house.py) */
function __wqCabin2(S, rm, solid) {
  const r = rm.rect, cx = (r.x + r.w / 2) * dt, by = (r.y + 4) * dt + 40, sc = 2, N = (nx, ny) => [cx + (nx - 64) * sc, by - (127 - ny) * sc];
  const hut = S.add.image(cx, by, "wh-cabin").setOrigin(.5, 1).setScale(sc).setDepth(by);
  S.add.ellipse(cx + 8, by - 4, 250, 26, 0, .38).setDepth(.6);
  if (solid) { const b = S.dungeon.solids.create(cx, by - 46, "rock"); b.setVisible(!1).setDisplaySize(240, 64); b.refreshBody?.() }
  // janelas acesas em verde
  for (const [nx, ny] of [[22, 108], [47, 108], [72, 108], [42, 78], [62, 78]]) {
    const [x, y] = N(nx, ny), g = S.add.image(x, y, "light").setBlendMode(j.BlendModes.ADD).setTint(0x8cff6a).setScale(.07).setAlpha(.55).setDepth(by + 1);
    S.tweens.add({ targets: g, alpha: .2, duration: 800 + Math.random() * 700, yoyo: !0, repeat: -1 });
  }
  // fumaça esverdeada saindo da chaminé
  if (S.textures.exists("wh-smoke")) {
    S.anims.exists("wh-smoke-a") || S.anims.create({ key: "wh-smoke-a", frames: S.anims.generateFrameNumbers("wh-smoke", {}), frameRate: 6, repeat: -1 });
    const [x, y] = N(25, 15), sm = S.add.sprite(x, y, "wh-smoke", 0).setOrigin(22 / 48, 1).setScale(sc).setDepth(by + 2).setTint(0xa8ff9a).setAlpha(.85);
    sm.play("wh-smoke-a");
  }
  const [dx, dy] = N(97.5, 127);
  S.lighting?.addLight?.({ x: dx, y: dy - 24, radius: 80, flicker: .18, color: 0x8cff6a });
  for (const [nx, ny] of [[42, 78], [47, 108]]) { const [x, y] = N(nx, ny); S.lighting?.addLight?.({ x, y, radius: 46, flicker: .2, color: 0x8cff6a }) }
  return { hut, door: { x: dx, y: dy + 6 } };
}
/* interior da cabana: piso de tábuas, paredes de tronco, caldeirão borbulhando */
function __wqInterior(S, rm) {
  if (S.textures.exists("wh-interior") && S.cache.json.get("wh-props")) return __wqInterior2(S, rm);
  const r = rm.rect, T = dt, x0 = (r.x - 1) * T, y0 = (r.y - 2) * T, W = (r.w + 2) * T, H = (r.h + 3) * T, key = "wqint-" + S.levelId;
  S.textures.exists(key) && S.textures.remove(key);
  const cv = S.textures.createCanvas(key, W, H), g = cv.getContext();
  let sd = 7; const rnd = () => (sd = sd * 1664525 + 1013904223 >>> 0) / 4294967296;
  g.fillStyle = "#0b0807"; g.fillRect(0, 0, W, H);
  // paredes de tronco (topo) e laterais
  for (let y = 0; y < 2 * T; y += 9) { g.fillStyle = y % 18 ? "#4a2f1e" : "#3d2618"; g.fillRect(T * .5, y + 4, W - T, 8); g.fillStyle = "rgba(0,0,0,.35)"; g.fillRect(T * .5, y + 11, W - T, 1) }
  g.fillStyle = "#2a1a10"; g.fillRect(0, 0, T * .5, H); g.fillRect(W - T * .5, 0, T * .5, H); g.fillRect(0, H - T * .6, W, T * .6);
  // piso de tábuas
  for (let y = 2 * T; y < H - T * .6; y += 8) for (let x = T * .5; x < W - T * .5;) { const w = 40 + rnd() * 50, v = 82 + rnd() * 26 | 0; g.fillStyle = `rgb(${v},${v * .62 | 0},${v * .38 | 0})`; g.fillRect(x, y, Math.min(w, W - T * .5 - x), 7); g.fillStyle = "rgba(0,0,0,.32)"; g.fillRect(x, y + 7, w, 1); g.fillRect(x + w - 1, y, 1, 7); x += w }
  // tapete e sombra nas bordas
  g.fillStyle = "rgba(70,24,30,.85)"; g.fillRect(W / 2 - 50, H / 2 - 18, 100, 52); g.strokeStyle = "rgba(200,160,90,.5)"; g.strokeRect(W / 2 - 46, H / 2 - 14, 92, 44);
  const q = g.createLinearGradient(0, 2 * T, 0, 2 * T + 18); q.addColorStop(0, "rgba(0,0,0,.55)"); q.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = q; g.fillRect(0, 2 * T, W, 18);
  // porta de saída (embaixo, no meio)
  g.fillStyle = "#5a3a22"; g.fillRect(W / 2 - 16, H - T * .6 - 2, 32, T * .6 + 2); g.fillStyle = "#c9a24a"; g.fillRect(W / 2 + 8, H - T * .35, 3, 3);
  cv.refresh();
  S.add.image(x0, y0, key).setOrigin(0).setDepth(.97);
  S.events.once("shutdown", () => { S.textures.exists(key) && S.textures.remove(key) });
  const ix = (c) => x0 + c, iy = (c) => y0 + c, list = [];
  const prop = (k, x, y, fr) => { if (!S.textures.exists(k)) return null; const o = (fr != null ? S.add.sprite(x, y, k, fr) : S.add.image(x, y, k)).setOrigin(.5, 1).setDepth(y); list.push(o); return o };
  prop("gyx-shelf", ix(60), iy(2 * T + 6));
  prop("gyx-shelf", ix(W - 70), iy(2 * T + 6))?.setFlipX(!0);
  const bed = prop("gyx-bed", ix(W - 64), iy(H - T * .6 - 8)); bed?.setScale(.72);
  const caul = prop("gyx-caul", ix(W / 2 - 46), iy(2 * T + 74), 0);
  if (caul) { S.anims.exists("gyx-caul-a") || S.anims.create({ key: "gyx-caul-a", frames: S.anims.generateFrameNumbers("gyx-caul", {}), frameRate: 8, repeat: -1 }); caul.play("gyx-caul-a").setTint(0xb8ff9a) }
  const gl = S.add.image(ix(W / 2 - 46), iy(2 * T + 56), "light").setBlendMode(j.BlendModes.ADD).setTint(0x8cff6a).setScale(.3).setAlpha(.4).setDepth(iy(2 * T + 75));
  S.tweens.add({ targets: gl, alpha: .2, scale: .34, duration: 700, yoyo: !0, repeat: -1 });
  S.lighting?.addLight?.({ x: ix(W / 2 - 46), y: iy(2 * T + 56), radius: 120, flicker: .25, color: 0x8cff6a });
  S.lighting?.addLight?.({ x: ix(W - 60), y: iy(2 * T + 20), radius: 70, flicker: .2, color: 0xffb060 });
  return { lady: { x: ix(W / 2 - 4), y: iy(2 * T + 78) }, exit: { x: ix(W / 2), y: iy(H - T * .6 - 10) }, inside: { x: ix(W / 2), y: iy(H - T * .6 - 30) } };
}
/* interior novo: parede de pedra com janelas verdes, piso, tapete, estantes, cama, ervas e o caldeirão */
function __wqInterior2(S, rm) {
  const r = rm.rect, x0 = (r.x - 1) * dt, y0 = (r.y - 2) * dt, sc = 2, G = (nx, ny) => [x0 + nx * sc, y0 + ny * sc];
  S.add.image(x0, y0, "wh-interior").setOrigin(0).setScale(sc).setDepth(.97);
  const M = S.cache.json.get("wh-props"), T = S.textures.get("wh-props");
  for (const [k, q] of Object.entries(M)) T.has(k) || T.add(k, 0, q[0], q[1], q[2], q[3]);
  const solids = [];
  const prop = (k, nx, ny, solid = !0, flip = !1) => {
    if (!M[k]) return null;
    const [x, y] = G(nx, ny), o = S.add.image(x, y, "wh-props", k).setOrigin(0, 1).setScale(sc).setDepth(y).setFlipX(flip);
    if (solid) { const w = M[k][2] * sc, h = Math.min(M[k][3] * sc, 26); const b = S.dungeon.solids.create(x + w / 2, y - h / 2, "rock"); b.setVisible(!1).setDisplaySize(w - 4, h); b.refreshBody?.() }
    return o;
  };
  prop("shelf-jars", 14, 42); prop("bookshelf", 148, 42);
  prop("herbs", 92, 30, !1); prop("garlic", 130, 38, !1);
  prop("potions-table", 20, 96); prop("chair", 50, 96, !1); prop("crate", 120, 42);
  prop("bed", 150, 132); prop("barrel", 18, 140); prop("box", 38, 140);
  prop("pot1", 58, 120, !1); prop("pot2", 46, 112, !1);
  // caldeirão borbulhando
  const [cxx, cyy] = G(80, 104);
  if (S.textures.exists("gyx-caul")) {
    S.anims.exists("gyx-caul-a") || S.anims.create({ key: "gyx-caul-a", frames: S.anims.generateFrameNumbers("gyx-caul", {}), frameRate: 8, repeat: -1 });
    S.add.sprite(cxx, cyy, "gyx-caul", 0).setOrigin(.5, 1).setDepth(cyy).setTint(0xb8ff9a).play("gyx-caul-a");
    const b = S.dungeon.solids.create(cxx, cyy - 10, "rock"); b.setVisible(!1).setDisplaySize(30, 20); b.refreshBody?.();
  }
  const gl = S.add.image(cxx, cyy - 18, "light").setBlendMode(j.BlendModes.ADD).setTint(0x8cff6a).setScale(.3).setAlpha(.4).setDepth(cyy + 1);
  S.tweens.add({ targets: gl, alpha: .2, scale: .34, duration: 700, yoyo: !0, repeat: -1 });
  S.lighting?.addLight?.({ x: cxx, y: cyy - 18, radius: 130, flicker: .25, color: 0x8cff6a });
  for (const nx of [75, 117]) { const [x, y] = G(nx, 18); S.lighting?.addLight?.({ x, y, radius: 60, flicker: .1, color: 0x8cff6a }) }
  const L = G(100, 102), E = G(96, 140), I = G(96, 128);
  return { lady: { x: L[0], y: L[1] }, exit: { x: E[0], y: E[1] }, inside: { x: I[0], y: I[1] } };
}
function __wqFog(S, on) { for (const f of S.__gyFog || []) f.setVisible(on) }
function __wqTeleport(S, x, y, inside) {
  if (S.__wqTp) return; S.__wqTp = !0;
  S.cameras.main.fadeOut(220, 0, 0, 0);
  S.time.delayedCall(240, () => { if (!S.scene.isActive()) return; S.player.body.reset(x, y); S.player.setVelocity?.(0, 0); S.cameras.main.centerOn(x, y); __wqFog(S, !inside); S.cameras.main.fadeIn(260, 0, 0, 0); S.__wqTp = !1 });
}
/* ─── Floresta da Cripta ─── */
function __wqCripta(S) {
  const L = S.dungeon.level, cab = L.rooms.find((r) => r.wqCabin), inr = L.rooms.find((r) => r.interior);
  const C = __wqCabin(S, cab), I = __wqInterior(S, inr);
  __wqZone(S, C.door.x, C.door.y, "Vasculhar a cabana", () => { __wqTeleport(S, I.inside.x, I.inside.y, !0); __WQ.f(S, "wqMet") || S.time.delayedCall(900, () => S.scene.isActive() && __wqLadyTalk(S)) });
  __wqZone(S, I.exit.x, I.exit.y, "Sair da cabana", () => __wqTeleport(S, C.door.x, C.door.y + 26, !1));
  const lady = __wqLady(S, I.lady.x, I.lady.y);
  __wqZone(S, I.lady.x, I.lady.y, "Falar com a senhora", () => __wqLadyTalk(S));
  S.__wqLadyNpc = lady;
  if (!S.__wqIntro) { S.__wqIntro = 1; S.time.delayedCall(1400, () => S.scene.isActive() && __dlg(S, [__WQ.G("Cuidado. Esta névoa esconde mais do que túmulos. Siga até o covil do Cérbero e acabe com ele.")])) }
  // o cão é verde-podre, com aura de veneno
  const TB = () => { const b = S.boss; if (!b || b.__wqT || b.typeKey !== "CERBERUS_ROT" || !b.active) return; b.__wqT = 1; b.setTint(0xa8e88a); try { b.__fxAura = __FX.follow(S, b, "poison", { size: 1.4, oy: -b.displayHeight * .25, zone: { w: b.displayWidth * .45, h: b.displayHeight * .4 }, lightScale: .35, lightAlpha: .16 }) } catch (e) {} };
  S.events.on("update", TB); S.events.once("shutdown", () => S.events.off("update", TB));
  const onB = (b) => {
    if (b?.typeKey !== "CERBERUS_ROT") return;
    S.time.delayedCall(2300, () => {
      if (!S.scene.isActive()) return;
      __dlg(S, [__WQ.G("Você conseguiu! As portas dos mortos estão se fechando."), __WQ.G("Vou te trazer de volta ao Coração da Floresta.", "smile")], () => { __WQ.f(S, "wqCrDone", !0); S.requestSave?.(10); __wqGo(S, "forest", { hubReturn: !0, fromLevel: "cripta" }) });
    });
  };
  S.game.events.on("boss:defeated", onB); S.events.once("shutdown", () => S.game.events.off("boss:defeated", onB));
}
function __wqLadyTalk(S) {
  const A = __WQ, P = A.PRICE;
  if (A.f(S, "wqEat")) { __dlg(S, [A.V("Ainda aqui, criança? Vá, vá… o cão de três cabeças não vai se matar sozinho. Hihihi.", "smile")]); return }
  const first = !A.f(S, "wqMet"); A.f(S, "wqMet", !0);
  const L = first ? [
    A.V("Ah… visita! Faz tanto tempo que ninguém bate à porta desta pobre velha.", "smile"),
    A.V("Estes ossos não aguentam mais o frio da névoa. Uma moedinha ajudaria tanto…"),
    A.V("Em troca, te dou isto: uma fruta que só nasce no fundo da mata. É mágica, sabia?"),
    A.V("Seus golpes vão achar o ponto fraco com mais frequência, e suas habilidades vão voltar bem mais rápido."),
  ] : [A.V("Voltou, criança? A fruta ainda está aqui, fresquinha. Só uma moedinha…", "smile")];
  __dlg(S, L, () => {
    const gold = S.stats?.gold ?? 0;
    __wqAsk(S, [`Ajudar com ${P} de ouro e aceitar a fruta${gold < P ? " (ouro insuficiente)" : ""}`, "Recusar"], (k) => {
      if (k === 1) { __dlg(S, [A.V("Hmpf. Os jovens de hoje não têm coração…", "calm")]); return }
      if ((S.stats?.gold ?? 0) < P) { __dlg(S, [A.V("Sem moedas? Que pena… volte quando tiver, criança.", "calm")]); return }
      S.stats.addGold(-P);
      __dlg(S, [A.V("Que coração bondoso! Tome. Mas coma agora, aqui na minha frente.", "smile"), A.V("Fruta mágica perde o encanto se esfriar. Vamos, uma mordida… isso!", "special")], () => {
        A.f(S, "wqEat", !0); A.f(S, "wqAt" + A.sealed(S), !0);
        S.stats.recompute();
        const p = S.player; __wqPortalFx(S, p.x, p.y, 0xff7ad8);
        S.game.events.emit("ui:banner", `FRUTA MÁGICA: +${A.CRIT}% CRÍTICO · −${Math.round(A.CDR * 100)}% RECARGA`, "#ffb0e8");
        S.time.delayedCall(1800, () => S.scene.isActive() && S.game.events.emit("ui:banner", "MISSÃO SECUNDÁRIA CONCLUÍDA: A VELHA DA CABANA", "#8ae0b0"));
        S.time.delayedCall(900, () => S.scene.isActive() && __dlg(S, [A.V("Hihihi… que os mortos te sejam leves. Agora vá, o Cérbero te espera.", "smile")]));
        S.requestSave?.(200);
      });
    });
  });
}
/* ─── Cabana da Bruxa: o confronto ─── */
function __wqBruxa(S) {
  const L = S.dungeon.level, rm = L.rooms[0], C = __wqCabin(S, rm);
  const lady = __wqLady(S, C.door.x, C.door.y + 30);
  S.__wqLadyNpc = lady;
  let started = !1;
  const U = () => {
    if (started || !S.player || S.uiOpen) return;
    if (Math.hypot(S.player.x - lady.spr.x, S.player.y - lady.spr.y) > 150) return;
    started = !0; S.events.off("update", U); __wqWitchTalk(S, lady);
  };
  S.events.on("update", U); S.events.once("shutdown", () => S.events.off("update", U));
  const onB = (b) => {
    if (b?.typeKey !== "WITCH_CRONE") return;
    for (const e of S.enemies?.getChildren?.() ?? []) e.__summon && e.active && !e.dead && e.takeDamage?.(999999, { x: 0, y: 0 });
    S.__wqPz = -1;
    __WQ.f(S, "wqCure", !0); S.stats.recompute();
    S.player && (S.player.hp = Math.min(S.player.maxHp, S.player.hp + Math.round(S.player.maxHp * .3)));
    S.game.events.emit("ui:banner", "O FEITIÇO SE DESFEZ — A FRUTA PERDEU O EFEITO", "#c8ff9a");
    S.time.delayedCall(2000, () => {
      if (!S.scene.isActive()) return;
      const x = S.player.x + 60, y = S.player.y - 10; __wqPortalFx(S, x, y, 0xffe6a0);
      try { S.__guard = null; const g = __guardianNpc(S, x, y, __GN); g.spr.setFlipX(S.player.x < x) } catch (e) {}
      S.time.delayedCall(600, () => S.scene.isActive() && __dlg(S, [__WQ.G("Acabou. O feitiço morreu junto com ela."), __WQ.G("Venha, vou te levar de volta para casa.", "smile")], () => { S.requestSave?.(10); __wqGo(S, "forest", { hubReturn: !0, fromLevel: "bruxa" }) }));
    });
  };
  S.game.events.on("boss:defeated", onB); S.events.once("shutdown", () => S.game.events.off("boss:defeated", onB));
}
function __wqWitchTalk(S, lady) {
  const A = __WQ;
  __dlg(S, [
    A.V("Ora, ora… voltou para me ver? A fruta estava docinha, não estava? Hihihi.", "smile"),
    A.H(S, "Você me envenenou!"),
    A.V("Envenenar? Eu te dei força! E cobrei um preço justo: um pedacinho da sua vida a cada selo."),
    A.V("Cada pedaço que você perde vem para mim. Olhe bem… estou quase jovem de novo.", "special"),
    A.H(S, "Desfaça o feitiço. Agora."),
    A.B("Desfazer? Só se me matar, criança… e ninguém mata a Bruxa das Sepulturas na porta da casa dela!"),
  ], () => {
    if (!S.scene.isActive()) return;
    const x = lady.spr.x, y = lady.spr.y, cam = S.cameras.main;
    S.uiOpen = !0; try { S.physics?.pause?.() } catch (e) {}
    S.game.events.emit("ui:banner", "A VELHA MOSTRA SUA VERDADEIRA FORMA!", "#9aff4a");
    S.audioRef?.play?.("sfx-ancient-dragon-phase");
    const dark = S.add.rectangle(x, y, 4000, 4000, 0x061206, 0).setDepth(y - 2); S.tweens.add({ targets: dark, fillAlpha: .55, duration: 800 });
    try { __FX.tex(S) } catch (e) {}
    S.tweens.add({ targets: lady.spr, x: x + 2, duration: 45, yoyo: !0, repeat: 30 });
    S.time.addEvent({ delay: 140, repeat: 12, callback: () => { lady.spr.active && lady.spr.setTint(Math.random() < .5 ? 0x8cff6a : 0xffffff); try { __FX.ring(S, x, y, 0x7ad84a, 40 + Math.random() * 60, 420, y + 4) } catch (e) {} } });
    S.tweens.add({ targets: lady.spr, scaleX: 1.6, scaleY: 1.6, duration: 1700, ease: "Quad.easeIn" });
    S.time.delayedCall(1900, () => {
      if (!S.scene.isActive()) return;
      try { cam.flash(280, 140, 255, 120) } catch (e) {}
      S.cameraSys?.shake?.(.016, 520); S.audioRef?.play?.("sfx-ancient-dragon-roar");
      __wqPortalFx(S, x, y, 0x7ad84a);
      lady.destroy();
      const b = S.spawnBoss("WITCH_CRONE", x, y, {});
      const br = [...S.roomManager.byId.values()][0];
      try { br && (b.arenaBounds = S.roomManager.arenaBoundsFor(br)) } catch (e) {}
      b.state_ = "recover"; b.stateTimer = 1.4; b.setAlpha(.2); S.tweens.add({ targets: b, alpha: 1, duration: 500 });
      try { b.__fxAura = __FX.follow(S, b, "poison", { size: 1.5, oy: -b.displayHeight * .3, zone: { w: b.displayWidth * .4, h: b.displayHeight * .5 }, lightScale: .4, lightAlpha: .2 }) } catch (e) {}
      S.game.events.emit("boss:spawned", b.data_.name, b.data_.subtitle);
      __wqWitchAI(S, b);
      S.time.delayedCall(600, () => { S.tweens.add({ targets: dark, fillAlpha: 0, duration: 800, onComplete: () => dark.destroy() }); try { S.physics?.resume?.() } catch (e) {} S.uiOpen = !1; S.state = "playing" });
    });
  });
}
/* poderes da bruxa: rajada de veneno (envenena ao acertar) e mortos invocados */
function __wqWitchAI(S, b) {
  let vol = 2600, sum = 3500, said = 0;
  const live = () => b.active && !b.dead && b.hp > 0;
  const U = (t, ms) => {
    if (!live()) { S.events.off("update", U); return }
    if (S.uiOpen || S.player?.dead) return;
    const ph2 = b.hp / b.maxHp < .5;
    if (ph2 && !said) { said = 1; __say(S, b.x, b.y - b.displayHeight * .8, "Lobo da sepultura, venha jantar!", "#c8ff9a", 3200, b) }
    vol -= ms; sum -= ms;
    if (vol <= 0 && b.state_ !== "telegraph" && b.state_ !== "attack") { vol = ph2 ? 2300 : 3300; volley(ph2 ? 5 : 3) }
    if (sum <= 0) { sum = ph2 ? 6000 : 8500; summon(ph2) }
  };
  const volley = (n) => {
    const p = S.player; if (!p) return;
    const ox = b.x, oy = b.y - b.displayHeight * .45, base = Math.atan2(p.y - oy, p.x - ox), dmg = Math.max(1, Math.round(b.scaledDamage?.(2) ?? 2)), pz = Math.max(1, Math.round(b.scaledDamage?.(1) ?? 1));
    const glow = S.add.image(ox, oy, "light").setBlendMode(j.BlendModes.ADD).setTint(0x8cff6a).setScale(.05).setDepth(oy + 50);
    S.tweens.add({ targets: glow, scale: .22, alpha: .2, duration: 420, onComplete: () => glow.destroy() });
    S.time.delayedCall(420, () => {
      if (!live()) return;
      for (let k = 0; k < n; k++) {
        const a = base + (k - (n - 1) / 2) * .22, o = S.add.image(ox, oy, "light").setBlendMode(j.BlendModes.ADD).setTint(0x7aff4a).setScale(.07).setDepth(9000);
        const core = S.add.circle(ox, oy, 3.5, 0xd8ffb0).setDepth(9001);
        let tr = null; try { tr = __FX.follow(S, o, "poison", { size: .6, light: !1 }) } catch (e) {}
        let life = 2200; const sp = ph(b) ? 175 : 150;
        const M = (t2, ms2) => {
          life -= ms2; o.x += Math.cos(a) * sp * ms2 / 1000; o.y += Math.sin(a) * sp * ms2 / 1000; core.setPosition(o.x, o.y);
          const pl = S.player, hit = pl && !pl.dead && Math.hypot(pl.x - o.x, pl.y - 8 - o.y) < 14, wall = S.dungeon.isWallAtWorld?.(o.x, o.y);
          if (hit) { try { S.damageSystem.apply({ source: b, target: pl, amount: dmg, dir: { x: Math.cos(a), y: Math.sin(a) } }) } catch (e) {} __wqPoison(S, b, pz) }
          if (hit || wall || life <= 0 || !S.scene.isActive()) { S.events.off("update", M); tr?.stop?.(); try { __FX.impact(S, o.x, o.y, "poison", .6) } catch (e) {} o.destroy(); core.destroy() }
        };
        S.events.on("update", M); S.events.once("shutdown", () => S.events.off("update", M));
      }
    });
  };
  const ph = (bb) => bb.hp / bb.maxHp < .5;
  const summon = (p2) => {
    const alive = (S.enemies?.getChildren?.() ?? []).filter((e) => e.__summon && e.active && !e.dead);
    if (alive.length >= (p2 ? 5 : 3)) return;
    const wolf = alive.some((e) => e.data_?.texture === "gw-werewolf");
    const types = p2 && !wolf ? ["GW_WEREWOLF", "GW_SHEET_GHOST"] : p2 ? ["GW_SKELETON_GRAVEDIGGER", "GW_SHEET_GHOST"] : [Math.random() < .5 ? "GW_SKELETON_GRAVEDIGGER" : "GW_SHEET_GHOST"];
    try { __FX.ring(S, b.x, b.y, 0x7ad84a, 90, 500, b.y + 4) } catch (e) {}
    types.forEach((ty, k) => {
      const a = Math.random() * 6.28, r = 70 + Math.random() * 50, x = b.x + Math.cos(a) * r, y = b.y + Math.sin(a) * r;
      if (S.dungeon.isWallAtWorld?.(x, y)) return;
      S.effects?.burstTinted?.(x, y, 0x7ad84a, 12);
      S.time.delayedCall(450 + k * 200, () => { if (!live()) return; const e = S.spawnEnemy(ty, Math.floor(x / dt), Math.floor(y / dt), { eliteRoll: !1 }); e && (e.__summon = !0, e.setAlpha?.(0), S.tweens.add({ targets: e, alpha: 1, duration: 400 })) });
    });
  };
  S.events.on("update", U); S.events.once("shutdown", () => S.events.off("update", U));
}
/* ─── Coração da Floresta: missão, cansaço, pergunta e revelação ─── */
function __wqUrgent(S) {
  __dlg(S, [
    __WQ.G("Espere. Antes que você continue, preciso que faça uma coisa por mim."),
    __WQ.G("Vou abrir um portal e te levar à Floresta da Cripta."),
    __WQ.G("Lá, o Cérbero da Podridão está causando o caos e abrindo portas para os mortos passarem.", "aggression"),
    __WQ.G("Derrote-o. Isso é urgente!", "aggression"),
  ], () => { __WQ.f(S, "wqCrQ", !0); S.requestSave?.(10); __wqGo(S, "cripta") });
}
function __wqReveal(S, forced) {
  const A = __WQ;
  const L = [];
  forced && L.push(A.G("Espere… estou sentindo que você está mais fraco. Menos resistente.", "sadness"));
  L.push(A.G("Deixe-me examinar você.", "calm"));
  __dlg(S, L, () => {
    const p = S.player, g = S.__guard;
    try { __FX.tex(S); __FX.ring(S, p.x, p.y, 0xffe6a0, 50, 700, p.y + 4); __FX.impact(S, p.x, p.y - 12, "holy", .9) } catch (e) {}
    S.time.delayedCall(900, () => S.scene.isActive() && __dlg(S, [
      A.G("Isto é um envenenamento mágico. Ele se agarra à sua vida e a consome a cada selo.", "sadness"),
      A.G("Você aceitou algo de algum estranho?"),
      A.H(S, "Uma senhora… na Floresta da Cripta. Ela me deu uma fruta e insistiu que eu comesse ali mesmo."),
      A.G("Na Floresta da Cripta, além dos mortos, só vive uma bruxa. Foi ela que te envenenou.", "aggression"),
      A.G("Vou tentar desfazer o feitiço."),
    ], () => {
      try { __FX.ring(S, p.x, p.y, 0x9be05a, 60, 800, p.y + 4); __FX.impact(S, p.x, p.y - 12, "poison", 1.1); S.cameraSys?.shake?.(.006, 300) } catch (e) {}
      S.time.delayedCall(1100, () => S.scene.isActive() && __dlg(S, [
        A.G("Não… não é o suficiente. Algo prende você a essa bruxa. Enquanto ela viver, o veneno vive.", "sadness"),
        A.G("Vou abrir um portal bem na porta da casa dela. Acabe com isso.", "aggression"),
      ], () => { A.f(S, "wqRev", !0); S.requestSave?.(10); __wqGo(S, "bruxa") }));
    }));
  });
}
function __wqAskWell(S) {
  S.__wqAsk = 0;
  __gSay(S, [__WQ.G("Você se sente bem?", "calm")], () => {
    __wqAsk(S, ["Sim, estou bem.", "Não… algo está errado comigo."], (k) => {
      if (k === 0) { __gSay(S, [__WQ.G("Que bom. Mas não ignore o que o corpo diz. Se algo mudar, me procure.", "smile")]); return }
      __wqReveal(S, !1);
    });
  });
}
const __WQBARK = ["Essa missão foi mais difícil do que deveria ser… o que será?", "Minhas pernas pesam como pedra… isso não é normal.", "Antes eu aguentava muito mais. O que está acontecendo comigo?", "Cada selo me deixa mais fraco… ou é impressão minha?"];
{
  const HS = __hubSetup;
  __hubSetup = function (S) {
    const r = HS.apply(this, arguments);
    try {
      if (!__WQ.camp(S)) return r;
      __wqTex(S); __wqDefs();
      const id = S.levelId;
      if (id === "cripta") __wqCripta(S);
      else if (id === "bruxa") __wqBruxa(S);
      else if (id === "forest") { S.stats?.recompute?.(); const d = S.sys.settings.data ?? {}; d.hubReturn && S.player && (S.player.hp = S.player.maxHp, S.game.events.emit("hud:hp", S.player.hp, S.player.maxHp)) }
    } catch (e) { console.warn("[wq]", e) }
    return r;
  };
  const RT = __hubReturnTalk;
  __hubReturnTalk = function (S, from) {
    const A = __WQ;
    if (from === "cripta") { if (!S.__guard || S.__guard.intro) return; __gSay(S, [A.G("A Floresta da Cripta está em paz… por enquanto. Obrigada.", "smile"), A.G("Agora, sim, podemos voltar aos selos.")]); return }
    if (from === "bruxa") { if (!S.__guard || S.__guard.intro) return; __gSay(S, [A.G("Agora sinto que está melhorando. Acho que podemos continuar.", "smile")]); return }
    const r = RT.apply(this, arguments);
    try {
      if (!A.camp(S) || !__HUBD.includes(from)) return r;
      const n = A.sealed(S);
      if (n >= 1 && !A.f(S, "wqCrQ")) { __wqUrgent(S); return r }
      if (A.poisoned(S) && !A.f(S, "wqRev") && A.stacks(S) > 0) {
        const line = __WQBARK[Math.min(__WQBARK.length - 1, Math.max(0, A.stacks(S) - 1))];
        __dlg(S, [A.H(S, line)], () => {
          if (n >= A.FORCE_AT) { __wqReveal(S, !0); return }
          S.__wqAsk = S.time.now + 60000;
        });
      }
    } catch (e) { console.warn("[wq] rt err", e) }
    return r;
  };
  const GT = __guardianTalk;
  __guardianTalk = function (S) {
    const A = __WQ;
    try {
      if (A.camp(S) && !S.__guard?.intro) {
        if (A.f(S, "wqCrQ") && !A.f(S, "wqCrDone")) { __gSay(S, [A.G("A Floresta da Cripta não pode esperar. Vou abrir o portal de novo.", "aggression")], () => __wqGo(S, "cripta")); return }
        if (A.f(S, "wqRev") && A.poisoned(S)) { __gSay(S, [A.G("A bruxa ainda prende você. Vou te levar até a casa dela.", "aggression")], () => __wqGo(S, "bruxa")); return }
        if (S.__wqAsk && S.time.now < S.__wqAsk) { __wqAskWell(S); return }
      }
    } catch (e) {}
    return GT.apply(this, arguments);
  };
  // carrega a cabana e os móveis da casa de ervas do Refúgio
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path, V = "assets/pixel-art/hub/village/"; L.setPath("");
      this.textures.exists("gyx-hut-src") || L.image("gyx-hut-src", V + "herb-hut.png");
      this.textures.exists("gyx-bed") || L.image("gyx-bed", V + "herb-bed.png");
      this.textures.exists("gyx-shelf") || L.image("gyx-shelf", V + "herb-shelf.png");
      const PR = "assets/pixel-art/props/";
      this.textures.exists("velha") || L.spritesheet("velha", "assets/pixel-art/npc/velha.png", { frameWidth: 48, frameHeight: 68 });
      this.textures.exists("velha-face") || L.image("velha-face", "assets/pixel-art/npc/velha-face.png");
      this.textures.exists("wh-cabin") || L.image("wh-cabin", PR + "wh-cabin.png");
      this.textures.exists("wh-interior") || L.image("wh-interior", PR + "wh-interior.png");
      this.textures.exists("wh-props") || L.image("wh-props", PR + "wh-props.png");
      L.json("wh-props", PR + "wh-props.json");
      this.textures.exists("wh-smoke") || L.spritesheet("wh-smoke", PR + "wh-smoke.png", { frameWidth: 48, frameHeight: 31 });
      this.textures.exists("gyx-caul") || L.spritesheet("gyx-caul", V + "herb-cauldron.png", { frameWidth: 32, frameHeight: 48 });
      L.setPath(op);
    } catch (e) {}
    return r;
  };
}
window.__dgWQ = Object.assign(__WQ, { urgent: (S) => __wqUrgent(S), reveal: (S, f) => __wqReveal(S, f), ask: (S) => __wqAskWell(S), dlg: (S, l, d) => __dlg(S, l, d), go: (S, id, ex) => __goLevel(S, id, ex), talk: (S) => __guardianTalk(S) });
