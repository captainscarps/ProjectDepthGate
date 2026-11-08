/* ── Armaduras do ferreiro (Rafael): forjadas em Pedra Cobalto, cada uma muda o herói por inteiro ──────────────────
   Visual único em três camadas, para qualquer classe (parte do traje base da classe, como as cores de armadura):
   1. o traje ganha duas cores: a principal da armadura e um acabamento (as partes mais claras da roupa);
   2. o acabamento brilha: uma cópia só com ele, somada por cima do herói, pulsando no ritmo da armadura;
   3. um efeito em volta do herói (brasas, geada, sombras, folhas, luz, faíscas) — só no jogo, não na prévia.
   Na loja da forja, uma aba ARMADURAS ao lado das ARMAS (mesmo preço em Pedra Cobalto, mesma durabilidade).      */
const __FARM = {
  armor_forge_brasa: {
    name: ["Couraça da Brasa Viva", "Living Ember Cuirass", "Coraza de la Brasa Viva"], price: 130,
    main: 0x3b302c, trim: 0xff7a1a, glow: 0xff8a2a, pulse: 1.4, fx: "ember",
    stats: { defense: 9, maxHp: 4, damage: 3 }, st: ["+9 DEFESA · +4 VIDA · +3 DANO", "+9 DEFENSE · +4 HEALTH · +3 DAMAGE"],
    desc: "Forjada no coração da fornalha: as placas nunca esfriam e soltam brasas a cada passo."
  },
  armor_forge_geada: {
    name: ["Manto da Geada Eterna", "Mantle of Endless Frost", "Manto de la Escarcha Eterna"], price: 140,
    main: 0x8fc8f0, trim: 0xf2fbff, glow: 0xbfe8ff, pulse: .9, fx: "frost",
    stats: { defense: 7, maxHp: 5, speed: 12 }, st: ["+7 DEFESA · +5 VIDA · +12 VEL", "+7 DEFENSE · +5 HEALTH · +12 SPEED"],
    desc: "Temperada em água do degelo da Cidadela. Onde passa, o ar se enche de cristais."
  },
  armor_forge_penumbra: {
    name: ["Vestes da Penumbra", "Robes of the Penumbra", "Vestiduras de la Penumbra"], price: 150,
    main: 0x2a2140, trim: 0xb06cff, glow: 0xa060ff, pulse: 1.1, fx: "shadow",
    stats: { defense: 6, critChance: 8, speed: 15 }, st: ["+6 DEFESA · +8% CRÍTICO · +15 VEL", "+6 DEFENSE · +8% CRIT · +15 SPEED"],
    desc: "Tecida com a sombra que sobra entre os portais. Quem a veste deixa um rastro de si mesmo."
  },
  armor_forge_raizes: {
    name: ["Couraça de Raízes Vivas", "Cuirass of Living Roots", "Coraza de Raíces Vivas"], price: 140,
    main: 0x4f7a36, trim: 0xe7c15a, glow: 0xd8e870, pulse: .8, fx: "leaf",
    stats: { defense: 8, maxHp: 6 }, st: ["+8 DEFESA · +6 VIDA", "+8 DEFENSE · +6 HEALTH"],
    desc: "Cobalto entrelaçado com raízes do Coração da Floresta. Ainda floresce."
  },
  armor_forge_aurora: {
    name: ["Armadura da Aurora", "Dawn Armor", "Armadura de la Aurora"], price: 170,
    main: 0xf1e7cc, trim: 0xffcf4a, glow: 0xffe08a, pulse: 1, fx: "halo",
    stats: { defense: 10, maxHp: 4, blockChance: 10 }, st: ["+10 DEFESA · +4 VIDA · +10% BLOQUEIO", "+10 DEFENSE · +4 HEALTH · +10% BLOCK"],
    desc: "Polida até refletir a primeira luz do dia. Um halo acompanha quem a veste."
  },
  armor_forge_cobalto: {
    name: ["Placas de Cobalto Rúnico", "Runic Cobalt Plates", "Placas de Cobalto Rúnico"], price: 180,
    main: 0x2a58d0, trim: 0x6ff3ff, glow: 0x58e6ff, pulse: 1.8, fx: "spark",
    stats: { defense: 12, maxHp: 3, magicDamage: 4 }, st: ["+12 DEFESA · +3 VIDA · +4 DANO MÁGICO", "+12 DEFENSE · +3 HEALTH · +4 MAGIC DMG"],
    desc: "Cobalto puro das Cavernas Dorf, gravado com runas anãs que acendem em batalha."
  },
};
for (const [id, a] of Object.entries(__FARM))
  Xt[id] = { name: a.name[0], type: "armor", slot: "armor", icon: Xt.ancient_dragon_armor ? "icon-dragon-armor" : "icon-armor", minRarity: "UNIQUE",
    stats: a.stats, value: a.price * 2, tint: a.main, forgeArmor: id, uniqueForge: !0, breaksOnDeath: !0, desc: a.desc + " Quebra-se se morrer na run." };
try { for (const [id, a] of Object.entries(__FARM)) { _s["item." + id] = a.name[1]; Io["item." + id] = a.name[2]; } } catch (e) {}
window.__FARM = __FARM;

/* folha do traje em duas cores + folha só com o acabamento (para o brilho) */
function __farmTex(scene, srcKey, cls, A) {
  const key = `${srcKey}-f${A.main.toString(16)}`, gk = key + "-glow";
  if (scene.textures.exists(key)) return key;
  const test = __GARMENT[cls];
  if (!test || !scene.textures.exists(srcKey)) return null;
  const src = scene.textures.get(srcKey), img = src.getSourceImage();
  const mk = () => { const c = document.createElement("canvas"); c.width = img.width; c.height = img.height; return c; };
  const cv = mk(), cx = cv.getContext("2d");
  cx.drawImage(img, 0, 0);
  const D = cx.getImageData(0, 0, cv.width, cv.height), p = D.data;
  const gv = mk(), gx = gv.getContext("2d"), G = gx.createImageData(cv.width, cv.height), q = G.data;
  const vs = [];
  for (let i = 0; i < p.length; i += 4 * 7) { if (p[i + 3] < 128) continue; const [h, s, v] = __HSV(p[i], p[i + 1], p[i + 2]); test(h, s, v) && vs.push(v); }
  vs.sort((a, b) => a - b);
  const ref = vs.length ? vs[vs.length >> 1] : .5, hi = vs.length ? vs[Math.floor(vs.length * .78)] : .8;
  const [mh, ms, mv] = __HSV(A.main >> 16 & 255, A.main >> 8 & 255, A.main & 255);
  const [th, ts, tv] = __HSV(A.trim >> 16 & 255, A.trim >> 8 & 255, A.trim & 255);
  for (let i = 0; i < p.length; i += 4) {
    if (p[i + 3] < 128) continue;
    const [h, s, v] = __HSV(p[i], p[i + 1], p[i + 2]);
    if (!test(h, s, v)) continue;
    if (v >= hi) {                                  // acabamento: as partes mais claras da roupa
      const nv = Math.min(1, tv * (.75 + .35 * v / Math.max(.2, hi)));
      const [r, g, b] = __RGB(th, Math.min(1, ts * .95), nv);
      p[i] = r; p[i + 1] = g; p[i + 2] = b;
      q[i] = r; q[i + 1] = g; q[i + 2] = b; q[i + 3] = 255;
    } else {
      const nv = Math.max(0, Math.min(1, v * (mv * .9 + .1) / Math.max(.12, ref)));
      const [r, g, b] = __RGB(mh, Math.min(1, ms * (s < .22 ? .7 : .85 + .15 * Math.min(1, s))), nv);
      p[i] = r; p[i + 1] = g; p[i + 2] = b;
    }
  }
  cx.putImageData(D, 0, 0);
  gx.putImageData(G, 0, 0);
  const fw = src.get(0)?.width ?? 128, fh = src.get(0)?.height ?? 128, n = Math.floor(img.width / fw);
  for (const [k, c] of [[key, cv], [gk, gv]]) {
    const t = scene.textures.addCanvas(k, c);
    for (let i = 0; i < n; i++) t.add(i, 0, i * fw, 0, fw, fh);
    t.setFilter(j.Textures.FilterMode.NEAREST);
  }
  for (const A0 of scene.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(srcKey + "-")) continue;
    const nk = key + A0.key.slice(srcKey.length);
    scene.anims.exists(nk) || scene.anims.create({ key: nk, frames: A0.frames.map(f => ({ key, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return key;
}
{
  const sf0 = __skinFor;
  __skinFor = function (scene, skin, classId, eq) {
    const A = __FARM[eq?.armor?.id];
    if (!A || !skin) return sf0(scene, skin, classId, eq);
    const base = `mk4b-${classId.toLowerCase()}-t0`, src = scene.textures.exists(base) ? base : skin.sheet;
    try { const k = __farmTex(scene, src, classId.toLowerCase(), A); return k ? { ...skin, sheet: k, __farm: A } : sf0(scene, skin, classId, eq); }
    catch (e) { return sf0(scene, skin, classId, eq); }
  };
}

/* brilho do acabamento + efeito em volta do herói */
function __farmDot(S) {
  if (S.textures.exists("fx2-dot")) return "fx2-dot";
  if (!S.textures.exists("farm-dot")) {
    const t = S.textures.createCanvas("farm-dot", 8, 8), g = t.getContext(), r = g.createRadialGradient(4, 4, 0, 4, 4, 4);
    r.addColorStop(0, "rgba(255,255,255,1)"); r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r; g.fillRect(0, 0, 8, 8); t.refresh();
  }
  return "farm-dot";
}
function __farmFx(V, eq) {
  const S = V.scene, A = __FARM[eq?.armor?.id];
  if (!A || !V.mk2) {
    V.__fGlow?.setVisible(!1);
    V.__fEm?.forEach(e => e.destroy());
    V.__fEm = null; V.__fA = null;
    return;
  }
  const gk = V.mk2.texture.key + "-glow";
  if (!S.textures.exists(gk)) return;
  if (!V.__fGlow) {
    V.__fGlow = S.add.sprite(0, 0, gk).setBlendMode(j.BlendModes.ADD);
    const i = V.container.getIndex(V.mk2);
    V.container.addAt(V.__fGlow, i + 1);
  }
  V.__fGlow.setTexture(gk).setTint(A.glow).setVisible(!0);
  if (V.__fA === A) return;
  V.__fA = A;
  V.__fEm?.forEach(e => e.destroy());
  V.__fEm = null;
  if (V.isPreview) return;
  const dot = __farmDot(S), tx = k => S.textures.exists(k) ? k : dot, C = V.container, F = { follow: C };
  const em = (key, cfg) => S.add.particles(0, 0, tx(key), { ...cfg, ...F }).setDepth(C.depth + 1);
  const L = {
    ember: () => [em("fx2-flame", { emitZone: { type: "random", source: new j.Geom.Rectangle(-12, -10, 24, 38) }, frequency: 150, lifespan: { min: 500, max: 900 }, speedY: { min: -40, max: -18 }, speedX: { min: -8, max: 8 }, scale: { start: .28, end: .04 }, alpha: { start: .75, end: 0 }, tint: [0xffd27a, 0xff7a1a, 0xc8401a], blendMode: "ADD" })],
    frost: () => [em("fx2-flake", { emitZone: { type: "random", source: new j.Geom.Rectangle(-16, -24, 32, 36) }, frequency: 260, lifespan: { min: 900, max: 1500 }, speedY: { min: 8, max: 22 }, speedX: { min: -6, max: 6 }, rotate: { min: 0, max: 360 }, scale: { start: .4, end: .15 }, alpha: { start: .7, end: 0 }, tint: [0xffffff, 0xcdeeff] }),
      em(dot, { emitZone: { type: "random", source: new j.Geom.Rectangle(-12, 20, 24, 8) }, frequency: 160, lifespan: 900, speedX: { min: -10, max: 10 }, scale: { start: 1.6, end: .2 }, alpha: { start: .35, end: 0 }, tint: 0xbfe8ff, blendMode: "ADD" })],
    shadow: () => [em("fx2-smoke", { emitZone: { type: "random", source: new j.Geom.Rectangle(-8, 8, 16, 18) }, frequency: 140, lifespan: { min: 600, max: 1000 }, speedY: { min: -14, max: -4 }, scale: { start: .25, end: .6 }, alpha: { start: .35, end: 0 }, tint: [0x2a1440, 0x5a2a90] }),
      em(dot, { emitZone: { type: "random", source: new j.Geom.Rectangle(-10, -4, 20, 26) }, frequency: 180, lifespan: 700, speedY: { min: -20, max: -6 }, scale: { start: .9, end: 0 }, alpha: { start: .8, end: 0 }, tint: 0xb06cff, blendMode: "ADD" })],
    leaf: () => [em("fx2-shard", { emitZone: { type: "random", source: new j.Geom.Rectangle(-16, -14, 32, 14) }, frequency: 220, lifespan: { min: 1100, max: 1700 }, speedY: { min: 10, max: 22 }, speedX: { min: -12, max: 12 }, rotate: { min: 0, max: 360 }, scale: { start: .45, end: .3 }, alpha: { start: 1, end: 0 }, tint: [0x7fbf4a, 0x4f7a36, 0xe7c15a] }),
      em(dot, { emitZone: { type: "random", source: new j.Geom.Rectangle(-10, 22, 20, 6) }, frequency: 260, lifespan: 800, speedY: { min: -12, max: -4 }, scale: { start: .8, end: 0 }, alpha: { start: .7, end: 0 }, tint: 0xd8e870, blendMode: "ADD" })],
    halo: () => [em(dot, { emitZone: { type: "edge", source: new j.Geom.Ellipse(0, -14, 22, 6), quantity: 24 }, frequency: 120, lifespan: 600, scale: { start: .45, end: .05 }, alpha: { start: .7, end: 0 }, tint: [0xffe08a, 0xffffff], blendMode: "ADD" }),
      em("fx2-star", { emitZone: { type: "random", source: new j.Geom.Rectangle(-12, -6, 24, 30) }, frequency: 260, lifespan: 700, speedY: { min: -16, max: -6 }, scale: { start: .35, end: 0 }, alpha: { start: 1, end: 0 }, tint: 0xffe08a, blendMode: "ADD" })],
    spark: () => [em("fx2-spark", { emitZone: { type: "random", source: new j.Geom.Rectangle(-10, -4, 20, 28) }, frequency: 220, lifespan: { min: 180, max: 340 }, speed: { min: 30, max: 70 }, angle: { min: 0, max: 360 }, scale: { start: .4, end: 0 }, alpha: { start: 1, end: 0 }, tint: [0x6ff3ff, 0xffffff, 0x2a58d0], blendMode: "ADD" })],
  };
  try { V.__fEm = (L[A.fx] || (() => []))(); } catch (e) { V.__fEm = null; }
}
{
  const ad0 = __adorn;
  __adorn = function (V, eq) {
    ad0(V, eq);
    try { __farmFx(V, eq); } catch (e) {}
  };
  const up0 = Qe.prototype.update;
  Qe.prototype.update = function () {
    const r = up0.apply(this, arguments);
    const g = this.__fGlow, m = this.mk2;
    if (g && g.visible && m) {
      const A = this.__fA ?? __FARM[this.scene?.inventory?.equipment?.armor?.id];
      g.setFrame(m.frame.name).setPosition(m.x, m.y).setScale(m.scaleX, m.scaleY).setOrigin(m.originX, m.originY)
        .setFlipX(m.flipX).setRotation(m.rotation);
      const t = (this.scene.time?.now ?? 0) / 1000 * (A?.pulse ?? 1);
      g.setAlpha((.45 + .4 * Math.sin(t * Math.PI)) * m.alpha);
      // sombra: o herói deixa cópias de si ao andar
      if (A?.fx === "shadow" && !this.isPreview) {
        this.__fShT = (this.__fShT || 0) + (this.scene.game.loop.delta || 16);
        const mv = Math.abs((this.container.x - (this.__fPx ?? this.container.x))) + Math.abs(this.container.y - (this.__fPy ?? this.container.y));
        this.__fPx = this.container.x; this.__fPy = this.container.y;
        if (mv > .6 && this.__fShT > 90) {
          this.__fShT = 0;
          const C = this.container, e = this.scene.add.image(C.x, C.y, m.texture.key, m.frame.name).setOrigin(m.originX, m.originY)
            .setScale(C.scaleX * m.scaleX, C.scaleY * m.scaleY).setPosition(C.x + m.x * C.scaleX, C.y + m.y * C.scaleY)
            .setTint(0x7a40c0).setAlpha(.4).setDepth(C.depth - 1).setBlendMode(j.BlendModes.ADD);
          this.scene.tweens.add({ targets: e, alpha: 0, duration: 380, onComplete: () => e.destroy() });
        }
      }
    }
    return r;
  };
  const d0 = Qe.prototype.destroy;
  Qe.prototype.destroy = function () {
    this.__fEm?.forEach(e => e.destroy());
    this.__fEm = null;
    return d0.apply(this, arguments);
  };
}

/* ícones próprios: o ícone de armadura em tons de cinza, pintado com as duas cores de cada armadura */
{
  const c0 = bo.prototype.create;
  bo.prototype.create = function () {
    const r = c0?.apply(this, arguments);
    try {
      const T = this.textures, base = ["icon-dragon-armor", "icon-armor"].find(k => T.exists(k));
      if (base) for (const [id, A] of Object.entries(__FARM)) {
        const key = "farm-ic-" + id;
        if (T.exists(key)) continue;
        const img = T.get(base).getSourceImage(), cv = document.createElement("canvas");
        cv.width = img.width; cv.height = img.height;
        const g = cv.getContext("2d");
        g.drawImage(img, 0, 0);
        const D = g.getImageData(0, 0, cv.width, cv.height), p = D.data;
        const [mh, ms, mv] = __HSV(A.main >> 16 & 255, A.main >> 8 & 255, A.main & 255), [th, ts, tv] = __HSV(A.trim >> 16 & 255, A.trim >> 8 & 255, A.trim & 255);
        for (let i = 0; i < p.length; i += 4) {
          if (p[i + 3] < 20) continue;
          const v = (p[i] * .3 + p[i + 1] * .59 + p[i + 2] * .11) / 255;
          const [rr, gg, bb] = v > .62 ? __RGB(th, ts, Math.min(1, tv * (.6 + v * .5))) : v < .12 ? [p[i], p[i + 1], p[i + 2]] : __RGB(mh, ms, Math.min(1, .25 + v * (mv * .9 + .35)));
          p[i] = rr; p[i + 1] = gg; p[i + 2] = bb;
        }
        g.putImageData(D, 0, 0);
        T.addCanvas(key, cv).setFilter(j.Textures.FilterMode.NEAREST);
        Xt[id].icon = key;
      }
    } catch (e) {}
    return r;
  };
}
