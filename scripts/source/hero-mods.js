/* ── Armaduras lendárias mudam o herói: sem capacete/capuz e capa esvoaçante ──────────────────────────────────────
   Com uma armadura LENDÁRIA (ou relíquia) equipada:
   - o capacete sai: a máscara de cada quadro (scripts/build_hero_mods.py) recorta os pixels dele e a cabeça
     descoberta do herói é colada no lugar — vale para qualquer folha da classe (níveis de traje, cores, forja);
   - uma capa presa na nuca, na cor da armadura, com física simples: cai parada, esvoaça ao correr, vira junto.
   Cada herói tem a sua cabeça descoberta (build_hero_mods.py) e o seu modelo de capa (__CAPE); a Araí não usa
   capacete, então ganha um cocar de penas por cima do cabelo.                                */
const __HMOD_CLS = ["warrior", "berserker", "archer", "hunter", "druid", "necromancer", "mage", "rogue", "shaman"];
(function () {
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    P0.call(this);
    for (const c of __HMOD_CLS) {
      this.load.image(`hmod-${c}-helm`, `pixel-art/characters/mods/${c}-helm.png`);
      this.load.image(`hmod-${c}-head`, `pixel-art/characters/mods/${c}-head.png`);
      this.load.json(`hmod-${c}`, `pixel-art/characters/mods/${c}-mods.json`);
    }
  };
})();
function __hmodOn(eq) {
  const a = eq?.armor;
  return !!a && (a.rarity === "LEGENDARY" || a.rarity === "RELIC");
}
/* folha sem capacete (e o brilho da forja, se houver) */
function __hmodTex(scene, srcKey, cls) {
  const key = srcKey + "-nh";
  if (scene.textures.exists(key)) return key;
  const info = scene.cache.json.get(`hmod-${cls}`);
  if (!info || !scene.textures.exists(srcKey) || !scene.textures.exists(`hmod-${cls}-helm`)) return null;
  const mask = scene.textures.get(`hmod-${cls}-helm`).getSourceImage(), head = scene.textures.get(`hmod-${cls}-head`).getSourceImage();
  const mk = (sk, k, withHead) => {
    const src = scene.textures.get(sk), img = src.getSourceImage(), cv = document.createElement("canvas");
    cv.width = img.width; cv.height = img.height;
    const g = cv.getContext("2d");
    g.imageSmoothingEnabled = !1;
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = "destination-out";
    g.drawImage(mask, 0, 0);
    g.globalCompositeOperation = "source-over";
    const fw = src.get(0)?.width ?? 128, fh = src.get(0)?.height ?? 128, n = Math.floor(img.width / fw);
    if (withHead) info.frames.forEach((f, i) => f && i < n && g.drawImage(head, i * fw + f.hx, f.hy));
    const t = scene.textures.addCanvas(k, cv);
    for (let i = 0; i < n; i++) t.add(i, 0, i * fw, 0, fw, fh);
    t.setFilter(j.Textures.FilterMode.NEAREST);
  };
  mk(srcKey, key, !0);
  scene.textures.exists(srcKey + "-glow") && mk(srcKey + "-glow", key + "-glow", !1);
  for (const A0 of scene.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(srcKey + "-") || A0.key.startsWith(key)) continue;
    const nk = key + A0.key.slice(srcKey.length);
    scene.anims.exists(nk) || scene.anims.create({ key: nk, frames: A0.frames.map(f => ({ key, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return key;
}
{
  const sf0 = __skinFor;
  __skinFor = function (scene, skin, classId, eq) {
    const r = sf0(scene, skin, classId, eq), cls = classId.toLowerCase();
    if (!r || !__hmodOn(eq) || !__HMOD_CLS.includes(cls)) return r;
    try { const k = __hmodTex(scene, r.sheet, cls); return k ? { ...r, sheet: k, __hmod: 1 } : r; } catch (e) { return r; }
  };
}

/* capa: corrente de pontos presa na nuca, desenhada atrás do herói. Cada herói tem o seu modelo:
   n pedaços × seg de comprimento, largura do ombro (w0) até a ponta (w1), estilo da barra de baixo e cores fixas */
const __CAPE = {
  warrior: { n: 9, seg: 3.3, w0: 3, w1: 6.4, style: "royal" },                       // capa de cavaleiro com barra dourada
  berserker: { n: 8, seg: 3.3, w0: 3.4, w1: 6.6, style: "tatter" },                  // manto de guerra rasgado
  archer: { n: 8, seg: 3, w0: 1.3, w1: 1.8, style: "scarf", tails: 2 },             // fitas longas da faixa
  hunter: { n: 5, seg: 3.2, w0: 4.4, w1: 6.2, style: "fur", fur: 0xe8d6b0 },         // manto de pele curto
  druid: { n: 9, seg: 3.3, w0: 3, w1: 6.8, style: "leaf" },                          // manto de folhas
  necromancer: { n: 10, seg: 3.3, w0: 3, w1: 6.2, style: "tatter", glow: 0x9a7cff },  // mortalha esfarrapada
  mage: { n: 10, seg: 3.3, w0: 3, w1: 6, style: "royal" },                         // capa longa com barra
  rogue: { n: 8, seg: 3, w0: 1.6, w1: 2.2, style: "scarf", tails: 1 },              // cachecol esvoaçante
  shaman: { n: 6, seg: 3.2, w0: 3.4, w1: 6, style: "feather", base: 0x7a4a26, feathers: [0xc8281e, 0x2e8c46, 0xf0c83c, 0x1e6eb4] },  // manto de penas
};
/* raridades mais baixas também aparecem no herói (só a armadura do peito decide):
   comum: só a cor da roupa · incomum: lenço no pescoço · raro: capa curta (mantelete) ·
   épico: capa quase inteira (o elmo continua) · lendário/relíquia: cabeça descoberta + capa inteira */
const __CAPE_TIER = { UNCOMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4, RELIC: 4 };
function __capeFor(cls, eq) {
  const D = __CAPE[cls], tier = __CAPE_TIER[eq?.armor?.rarity] ?? 0;
  if (!D || !tier) return null;
  if (tier === 1) return { n: 4, seg: 2.6, w0: 1.3, w1: 1.7, style: "scarf", tails: 1, tier };
  if (tier === 2) return D.style === "scarf" ? { ...D, n: Math.max(4, Math.round(D.n * .55)), tails: 1, tier }
    : { ...D, n: Math.max(4, Math.round(D.n * .5)), w1: D.w1 * .92, tier };
  if (tier === 3) return { ...D, n: Math.max(4, Math.round(D.n * .82)), tier };
  return { ...D, tier };
}
function __capeCols(eq) {
  const t = eq?.armor?.tint ?? 0x8b1d16, F = __FARM?.[eq?.armor?.id];
  const main = F ? F.main : t, [h, s, v] = __HSV(main >> 16 & 255, main >> 8 & 255, main & 255);
  const C = (H, S, V) => { const [r, g, b] = __RGB(H, Math.min(1, S), Math.max(0, Math.min(1, V))); return (r << 16) | (g << 8) | b; };
  const tier = __CAPE_TIER[eq?.armor?.rarity] ?? 0;
  const trim = F ? F.trim : tier >= 3 ? 0xd9a441 : C(h, Math.max(.3, s * .8), Math.min(1, Math.max(.42, v) * 1.25));   // ouro só do épico para cima
  return { main: C(h, Math.max(.45, s), Math.max(.42, v)), shade: C(h, Math.max(.5, s), Math.max(.25, v) * .62), trim, line: 0x1a1210 };
}
function __capeUpdate(V, dt) {
  const C = V.container, m = V.mk2, cls = V.classDef?.id?.toLowerCase(), D = V.__capeD;
  const on = D && m && C.visible && !V.deadPose;
  if (!on) { V.__cape?.g.setVisible(!1); return; }
  const info = V.scene.cache.json.get(`hmod-${cls}`), fi = +m.frame.name, F = info?.frames?.[fi] ?? V.__capeLastF;
  if (!F) { V.__cape?.g.setVisible(!1); return; }
  V.__capeLastF = F;      // quadro sem cabeça achada (de costas, atrás do escudo): a capa fica na última nuca
  const par = C.parentContainer, sx = C.scaleX, sy = C.scaleY, u = Math.abs(sx) * Math.abs(m.scaleX) / .69;
  const ax = C.x + (m.x + (F.neck[0] - 2 - 64) * m.scaleX) * sx, ay = C.y + (m.y + (F.neck[1] - 64) * m.scaleY) * sy;
  let K = V.__cape;
  if (K && K.D !== D) { K.g.destroy(); K = V.__cape = null; }     // trocou a armadura: outra capa (outro tamanho)
  if (!K) {
    const g = V.scene.add.graphics();
    par ? par.addAt(g, par.getIndex(C)) : 0;
    const mkP = o => Array.from({ length: D.n }, (_, i) => ({ x: ax + o, y: ay + i * 3 * u, px: ax + o, py: ay + i * 3 * u }));
    K = V.__cape = { g, D, ch: Array.from({ length: D.tails || 1 }, (_, t) => mkP(t * 2)), t: 0 };
  }
  const cols = V.__capeCols ?? __capeCols(V.__eqRef), face = Math.sign(sx) || 1, seg = D.seg * u, k = Math.min(2, dt / 16.7);
  K.t += dt / 1000;
  const run = Math.min(1, Math.hypot(ax - (K.ax ?? ax), ay - (K.ay ?? ay)) / (2.2 * u * k + .01));
  K.ax = ax; K.ay = ay;
  const g = K.g.setVisible(!0);
  g.clear();
  K.ch.forEach((P, t) => {
    const ox = -face * t * 1.5 * u, oy = t * 1.2 * u, light = D.style === "scarf" ? .6 : 1;
    P[0].x = ax + ox; P[0].y = ay + oy; P[0].px = P[0].x; P[0].py = P[0].y;
    for (let i = 1; i < P.length; i++) {
      const q = P[i], vx = (q.x - q.px) * .82, vy = (q.y - q.py) * .82;
      q.px = q.x; q.py = q.y;
      const wind = (-face * (.04 + .12 * run) / light + Math.sin(K.t * (3 + t) + i * (1 + t * .5)) * .03 * (1 + run) / light) * u * k;
      q.x += vx + wind; q.y += vy + (.16 - .08 * run) * light * u * k;
    }
    for (let it = 0; it < 5; it++) {
      for (let i = 1; i < P.length; i++) {
        const a = P[i - 1], b = P[i], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, f = (d - seg) / d;
        if (i === 1) { b.x -= dx * f; b.y -= dy * f; } else { a.x += dx * f * .5; a.y += dy * f * .5; b.x -= dx * f * .5; b.y -= dy * f * .5; }
      }
      // atrás do corpo, e não sobe acima dos ombros
      for (let i = 1; i < P.length; i++) { const q = P[i], lim = ax + face * 1.5 * u; if (face > 0 ? q.x > lim : q.x < lim) q.x = lim; if (q.y < ay - 2 * u) q.y = ay - 2 * u; }
    }
    // segue o líder: a capa nunca estica, e cada pedaço pende para baixo (nada de bandeira na horizontal;
    // o tecido pesado pende mais que a fita), sem nunca dobrar para a frente do corpo
    const minDown = (D.style === "scarf" ? .3 : .55) * seg;
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], q = P[i];
      let dx = q.x - a.x, dy = q.y - a.y, d = Math.hypot(dx, dy) || 1;
      if (d > seg) { dx = dx / d * seg; dy = dy / d * seg; }
      if (dy < minDown) { dy = minDown; dx = (Math.sign(dx) || -face) * Math.sqrt(Math.max(0, seg * seg - dy * dy)) * Math.min(1, Math.abs(dx) / seg * 1.2); }
      if (face > 0 ? dx > .6 * u : dx < -.6 * u) dx = face * .6 * u;
      const nx = a.x + dx, ny = a.y + dy;
      q.px += nx - q.x; q.py += ny - q.y; q.x = nx; q.y = ny;
    }
    __capeDraw(g, P, D, cols, u, t);
  });
  if (!par) g.setDepth(C.depth - .5);
}
function __capeDraw(g, P, D, cols, u, tail) {
  const n = P.length, e = n - 1, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(e, i + 1)], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    const w = (D.w0 + (D.w1 - D.w0) * i / e) * u, nx = -dy / d * w, ny = dx / d * w;
    L.push([Math.round(P[i].x + nx), Math.round(P[i].y + ny)]);
    R.push([Math.round(P[i].x - nx), Math.round(P[i].y - ny)]);
  }
  const poly = pts => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.closePath(); };
  // ponta: reta (barra), recortada (rasgos/folhas/penas) ou bico (fita)
  const bottom = [];
  const [lx, ly] = L[e], [rx, ry] = R[e], tip = P[e], dx = tip.x - P[e - 1].x, dy = tip.y - P[e - 1].y, dd = Math.hypot(dx, dy) || 1;
  const teeth = D.style === "tatter" ? 4 : D.style === "leaf" ? 3 : D.style === "feather" ? 4 : 0;
  if (D.style === "scarf") bottom.push([Math.round(tip.x + dx / dd * 3 * u), Math.round(tip.y + dy / dd * 3 * u)]);
  else for (let q = 1; q < teeth * 2; q++) {
    const f = q / (teeth * 2), deep = q % 2 ? (D.style === "tatter" ? (2 + (q * 7 % 5)) : 3) * u : -1 * u;
    bottom.push([Math.round(lx + (rx - lx) * f + dx / dd * deep), Math.round(ly + (ry - ly) * f + dy / dd * deep)]);
  }
  const all = [...L, ...bottom, ...[...R].reverse()];
  g.fillStyle(cols.line, 1); poly(all.map(([x, y]) => [x + (x > P[0].x ? 1 : -1), y + 1])); g.fillPath();
  if (D.style === "feather") {              // manto de penas: base de palha trançada e fileiras de penas coloridas
    g.fillStyle(D.base, 1); poly(all); g.fillPath();
    for (let i = 2; i <= e; i += 2) {
      const c = D.feathers[(i / 2) % D.feathers.length];
      for (let q = 0; q < 3; q++) {           // três penas por fileira, em leque, apontando para baixo
        const f0 = q / 3, f1 = (q + 1) / 3, j = Math.max(0, i - 2);
        const a0 = [L[j][0] + (R[j][0] - L[j][0]) * f0, L[j][1] + (R[j][1] - L[j][1]) * f0];
        const a1 = [L[j][0] + (R[j][0] - L[j][0]) * f1, L[j][1] + (R[j][1] - L[j][1]) * f1];
        const tp = [L[i][0] + (R[i][0] - L[i][0]) * (f0 + f1) / 2, L[i][1] + (R[i][1] - L[i][1]) * (f0 + f1) / 2];
        g.fillStyle(c, 1); poly([a0, a1, tp]); g.fillPath();
      }
    }
    for (let q = 0; q < bottom.length; q += 2) {   // pontas das penas de baixo
      g.fillStyle(D.feathers[q / 2 % D.feathers.length], 1);
      const p0 = q ? bottom[q - 1] : L[e], p1 = bottom[q + 1] ?? R[e];
      poly([p0, bottom[q], p1]); g.fillPath();
    }
  } else {
    g.fillStyle(D.style === "fur" ? __bkDark(cols.main, .9) : cols.main, 1); poly(all); g.fillPath();
    const M = L.map(([x, y], i) => [Math.round((x + P[i].x) / 2), Math.round((y + P[i].y) / 2)]);
    g.fillStyle(cols.shade, .9); poly([...M, ...[...R].reverse()]); g.fillPath();
    if (D.style === "scarf" && tail) { g.fillStyle(cols.trim, .55); poly([...M, ...[...R].reverse()]); g.fillPath(); }
  }
  if (D.style === "royal") {               // barra dourada na ponta
    g.lineStyle(Math.max(1, u * 1.2), cols.trim, 1);
    g.beginPath(); g.moveTo(L[e][0], L[e][1]); g.lineTo(R[e][0], R[e][1]); g.strokePath();
  }
  if (D.style === "fur") {                 // gola de pele clara nos ombros
    g.fillStyle(D.fur, 1);
    for (let i = 0; i < 2; i++) { g.fillCircle(L[i][0], L[i][1], 1.6 * u); g.fillCircle(R[i][0], R[i][1], 1.6 * u); g.fillCircle(P[i].x, P[i].y, 1.8 * u); }
  }
  if (D.style === "leaf") {                // nervuras de folha
    g.lineStyle(1, cols.trim, .7);
    for (let i = 2; i < e; i += 2) { g.beginPath(); g.moveTo(P[i].x, P[i].y); g.lineTo(L[i + 1][0], L[i + 1][1]); g.strokePath(); }
  }
  if (D.glow) {                            // brilho fantasma nas pontas
    g.fillStyle(D.glow, .35 + .2 * Math.sin(Date.now() / 300));
    for (const [x, y] of bottom.filter((_, q) => q % 2 === 0)) g.fillCircle(x, y, 1.4 * u);
  }
}
{
  const ad0 = __adorn;
  __adorn = function (V, eq) {
    ad0(V, eq);
    try {
      V.__eqRef = eq;
      const cls = V.classDef?.id?.toLowerCase(), D = __HMOD_CLS.includes(cls) ? __capeFor(cls, eq) : null;
      const sig = D ? `${eq.armor.uid ?? eq.armor.id}|${D.tier}` : "";
      if (sig !== V.__capeSig) { V.__capeSig = sig; V.__capeD = D; }   // o mesmo item mantém a mesma capa (não reinicia o balanço)
      V.__hmodCape = !!D;
      if (D) V.__capeCols = __capeCols(eq);
      else V.__cape?.g.setVisible(!1);
    } catch (e) {}
  };
  const up0 = Qe.prototype.update;
  Qe.prototype.update = function (t, dt) {
    const r = up0.apply(this, arguments);
    try { __capeUpdate(this, typeof dt === "number" ? dt : (this.scene.game.loop.delta || 16)); } catch (e) {}
    return r;
  };
  const d0 = Qe.prototype.destroy;
  Qe.prototype.destroy = function () {
    this.__cape?.g.destroy();
    this.__cape = null;
    return d0.apply(this, arguments);
  };
}
