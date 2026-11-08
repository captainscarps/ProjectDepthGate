/* ── Armaduras lendárias mudam o herói: sem capacete/capuz e capa esvoaçante ──────────────────────────────────────
   Com uma armadura LENDÁRIA (ou relíquia) equipada:
   - o capacete sai: a máscara de cada quadro (scripts/build_hero_mods.py) recorta os pixels dele e a cabeça
     descoberta do herói é colada no lugar — vale para qualquer folha da classe (níveis de traje, cores, forja);
   - uma capa presa na nuca, na cor da armadura, com física simples: cai parada, esvoaça ao correr, vira junto.
   Por enquanto só as classes com cabeça desenhada em build_hero_mods.py (Draven).                                */
const __HMOD_CLS = ["warrior"];
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

/* capa: corrente de pontos presa na nuca, desenhada atrás do herói */
const __CAPE_N = 9;
function __capeCols(eq) {
  const t = eq?.armor?.tint ?? 0x8b1d16, F = __FARM?.[eq?.armor?.id];
  const main = F ? F.main : t, [h, s, v] = __HSV(main >> 16 & 255, main >> 8 & 255, main & 255);
  const C = (H, S, V) => { const [r, g, b] = __RGB(H, Math.min(1, S), Math.max(0, Math.min(1, V))); return (r << 16) | (g << 8) | b; };
  const trim = F ? F.trim : 0xd9a441;
  return { main: C(h, Math.max(.45, s), Math.max(.42, v)), shade: C(h, Math.max(.5, s), Math.max(.25, v) * .62), trim, line: 0x1a1210 };
}
function __capeUpdate(V, dt) {
  const eq = V.scene?.inventory?.equipment ?? V.__eqRef, C = V.container, m = V.mk2;
  const on = V.__hmodCape && m && C.visible && !V.deadPose;
  if (!on) { V.__cape?.g.setVisible(!1); return; }
  const info = V.scene.cache.json.get(`hmod-${V.classDef.id.toLowerCase()}`), fi = +m.frame.name, F = info?.frames?.[fi];
  if (!F) { V.__cape?.g.setVisible(!1); return; }
  const par = C.parentContainer, sx = C.scaleX, sy = C.scaleY, u = Math.abs(sx) * Math.abs(m.scaleX) / .69;
  const ax = C.x + (m.x + (F.neck[0] - 2 - 64) * m.scaleX) * sx, ay = C.y + (m.y + (F.neck[1] - 64) * m.scaleY) * sy;
  let K = V.__cape;
  if (!K) {
    const g = V.scene.add.graphics();
    par ? par.addAt(g, par.getIndex(C)) : 0;
    K = V.__cape = { g, p: Array.from({ length: __CAPE_N }, (_, i) => ({ x: ax, y: ay + i * 3 * u, px: ax, py: ay + i * 3 * u })), cols: __capeCols(V.__eqRef), t: 0 };
  }
  K.cols = V.__capeCols ?? K.cols;
  const P = K.p, face = Math.sign(sx) || 1, seg = 3.3 * u, k = Math.min(2, dt / 16.7);
  K.t += dt / 1000;
  const run = Math.min(1, Math.hypot(ax - (K.ax ?? ax), ay - (K.ay ?? ay)) / (2.2 * u * k + .01));
  K.ax = ax; K.ay = ay;
  P[0].x = ax; P[0].y = ay; P[0].px = ax; P[0].py = ay;
  for (let i = 1; i < P.length; i++) {
    const q = P[i], vx = (q.x - q.px) * .9, vy = (q.y - q.py) * .9;
    q.px = q.x; q.py = q.y;
    const wind = (-face * (.05 + .22 * run) + Math.sin(K.t * 3 + i) * .03 * (1 + run)) * u * k;
    q.x += vx + wind; q.y += vy + (.16 - .08 * run) * u * k;
  }
  for (let it = 0; it < 5; it++) {
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], b = P[i], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, f = (d - seg) / d;
      if (i === 1) { b.x -= dx * f; b.y -= dy * f; } else { a.x += dx * f * .5; a.y += dy * f * .5; b.x -= dx * f * .5; b.y -= dy * f * .5; }
    }
    // a capa fica atrás do corpo (não atravessa para a frente)
    for (let i = 1; i < P.length; i++) { const q = P[i], lim = ax + face * 1.5 * u; if (face > 0 ? q.x > lim : q.x < lim) q.x = lim; if (q.y < ay - 2 * u) q.y = ay - 2 * u; }
  }
  // segue o líder: nenhum pedaço fica mais longe do anterior do que o comprimento dele (a capa nunca estica)
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], q = P[i], dx = q.x - a.x, dy = q.y - a.y, d = Math.hypot(dx, dy) || 1;
    if (d > seg) { const nx = a.x + dx / d * seg, ny = a.y + dy / d * seg; q.px += nx - q.x; q.py += ny - q.y; q.x = nx; q.y = ny; }
    if (q.y < ay - 2 * u) { q.py += ay - 2 * u - q.y; q.y = ay - 2 * u; }   // não sobe acima dos ombros
  }
  // desenho: contorno, cor, sombra do lado de dentro e barra dourada
  const g = K.g.setVisible(!0);
  g.clear();
  const L = [], R = [];
  for (let i = 0; i < P.length; i++) {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
    const w = (3 + 3.4 * i / (P.length - 1)) * u, nx = -dy / d * w, ny = dx / d * w;
    L.push([Math.round(P[i].x + nx), Math.round(P[i].y + ny)]);
    R.push([Math.round(P[i].x - nx), Math.round(P[i].y - ny)]);
  }
  const poly = pts => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.closePath(); };
  const Rr = [...R].reverse(), all = [...L, ...Rr];
  g.fillStyle(K.cols.line, 1); poly(all.map(([x, y], i) => [x + (i < L.length ? 1 : -1), y + 1])); g.fillPath();
  g.fillStyle(K.cols.main, 1); poly(all); g.fillPath();
  const M = L.map(([x, y], i) => [Math.round((x + P[i].x) / 2), Math.round((y + P[i].y) / 2)]);
  g.fillStyle(K.cols.shade, .9); poly([...M, ...Rr]); g.fillPath();
  const e = P.length - 1;
  g.lineStyle(Math.max(1, u), K.cols.trim, 1);
  g.beginPath(); g.moveTo(L[e][0], L[e][1]); g.lineTo(R[0][0], R[0][1]); g.strokePath();
  if (!par) g.setDepth(C.depth - .5);
}
{
  const ad0 = __adorn;
  __adorn = function (V, eq) {
    ad0(V, eq);
    try {
      V.__eqRef = eq;
      const on = __hmodOn(eq) && __HMOD_CLS.includes(V.classDef?.id?.toLowerCase());
      V.__hmodCape = on;
      if (on) { V.__capeCols = __capeCols(eq); if (V.__cape) V.__cape.cols = V.__capeCols; }
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
