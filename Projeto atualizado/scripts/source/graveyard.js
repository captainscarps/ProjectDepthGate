/* ══ Cemitério dos Esquecidos ══
   Cenário com os ladrilhos do pack "Graveyard" (assets/pixel-art/endless/gyt-atlas.*, scripts/build_graveyard_tiles.py):
   clareiras de grama de contorno orgânico (sem lados retos) dentro da mata escura, trilhas de pedra quebrada,
   terra revirada, árvores secas, lápides, lanternas e forcas animadas, e névoa densa em camadas que se move.
   Inimigos do cemitério (gw-*): as folhas trazem 8 direções paradas, não passos. Antes a animação "andar"
   girava o boneco pelas 8 direções. Agora cada um olha para onde anda, com passada, respiro, bote e golpe. */
let __gyN = 0;
/* textura de névoa: ruído de valor fractal, repetível nas bordas (256 px, períodos 4/8/16/32) */
function __gyFogTex(S) {
  if (S.textures.exists("gy-fog")) return;
  const N = 256, cv = S.textures.createCanvas("gy-fog", N, N), x = cv.getContext(), im = x.createImageData(N, N), O = im.data;
  const h = (a, b, p) => { a = ((a % p) + p) % p; b = ((b % p) + p) % p; let q = Math.imul(a * 73856093 ^ b * 19349663 ^ p * 83492791, 1274126177); q ^= q >>> 15; return ((Math.imul(q, 2246822519) >>> 0) % 10007) / 10007 };
  const vn = (u, v, p) => { const i = Math.floor(u), j = Math.floor(v), fx = u - i, fy = v - j, a = fx * fx * (3 - 2 * fx), b = fy * fy * (3 - 2 * fy), A = h(i, j, p), B = h(i + 1, j, p), C = h(i, j + 1, p), D = h(i + 1, j + 1, p); return A + (B - A) * a + (C - A) * b + (A - B - C + D) * a * b };
  for (let y = 0; y < N; y++) for (let X = 0; X < N; X++) {
    let f = 0, w = .5, t = 0;
    for (const p of [4, 8, 16, 32]) { f += vn(X / N * p, y / N * p, p) * w; t += w; w *= .55 }
    f /= t;
    const a = Math.max(0, Math.min(1, (f - .36) * 2.6)), i = (y * N + X) * 4;
    O[i] = O[i + 1] = O[i + 2] = 255; O[i + 3] = Math.pow(a, 1.35) * 255;
  }
  x.putImageData(im, 0, 0); cv.refresh();
}
function __gyBake(B) {
  const S = B.scene, M = S.cache.json.get("gyt-atlas");
  if (!M || !S.textures.exists("gyt-atlas")) return !1;
  const src = S.textures.get("gyt-atlas").getSourceImage(), C = B.cols, R = B.rows, T = dt, key = "gyb-" + ++__gyN;
  const tx = S.textures.createCanvas(key, C * T, R * T), g = tx.getContext();
  g.imageSmoothingEnabled = !1;
  let sd = (String(B.level.seed ?? "g") + B.level.depth).split("").reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 11) >>> 0;
  const rnd = () => (sd = sd * 1664525 + 1013904223 >>> 0) / 4294967296, pick = (a) => a[rnd() * a.length | 0];
  const F = (c, r) => c >= 0 && r >= 0 && c < C && r < R && !B.isWallTile(c, r);
  const Wl = (c, r) => !F(c, r);
  const put = (k, c, r) => { const p = pick(M.t[k]); g.drawImage(src, p[0], p[1], T, T, c * T, r * T, T, T) };
  // distância até o chão (para escurecer o platô longe das salas)
  const dist = new Int16Array(C * R).fill(99), q = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (F(c, r)) dist[r * C + c] = 0, q.push(c, r);
  for (let i = 0; i < q.length; i += 2) { const c = q[i], r = q[i + 1], d = dist[r * C + c]; for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const x = c + dc, y = r + dr; if (x < 0 || y < 0 || x >= C || y >= R || dist[y * C + x] <= d + 1) continue; dist[y * C + x] = d + 1; q.push(x, y) } }
  // ── chão orgânico: nada de lados retos. A borda entre clareira e mata é um campo suave (bilinear dos ladrilhos)
  //    torcido por ruído; as cores vêm dos ladrilhos do pack (grama, mata escura, calçamento, terra revirada).
  const W0 = C * T, H0 = R * T;
  const ac = document.createElement("canvas"); ac.width = src.width; ac.height = src.height;
  const acx = ac.getContext("2d"); acx.drawImage(src, 0, 0); const AD = acx.getImageData(0, 0, ac.width, ac.height).data, AW = ac.width;
  const seedI = sd | 0, hash = (x, y) => { let h = (x * 374761393 + y * 668265263 + seedI) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296 };
  const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), A = hash(xi, yi), Bq = hash(xi + 1, yi), Cq = hash(xi, yi + 1), Dq = hash(xi + 1, yi + 1); return A + (Bq - A) * u + (Cq - A) * v + (A - Bq - Cq + Dq) * u * v };
  const ff = new Float32Array(C * R), pf = new Float32Array(C * R);
  for (let k = 0; k < C * R; k++) ff[k] = dist[k] === 0 ? 1 : 0;
  for (const k of B.level.corridors || []) for (let y = k.y; y < k.y + k.h; y++) for (let x = k.x; x < k.x + k.w; x++) if (F(x, y)) pf[y * C + x] = 1;
  const bil = (A, x, y) => { x = x / T - .5; y = y / T - .5; const x0 = Math.max(0, Math.min(C - 1, Math.floor(x))), y0 = Math.max(0, Math.min(R - 1, Math.floor(y))), x1 = Math.min(C - 1, x0 + 1), y1 = Math.min(R - 1, y0 + 1), fx = Math.max(0, Math.min(1, x - x0)), fy = Math.max(0, Math.min(1, y - y0)); return (A[y0 * C + x0] * (1 - fx) + A[y0 * C + x1] * fx) * (1 - fy) + (A[y1 * C + x0] * (1 - fx) + A[y1 * C + x1] * fx) * fy };
  const df = new Float32Array(C * R); for (let k = 0; k < C * R; k++) df[k] = Math.min(dist[k], 9);
  const px = (p, x, y) => ((p[1] + y) * AW + p[0] + x) * 4;
  const G1 = px(M.t.grass[0], 6, 6), G2 = px(M.t.dark[0], 6, 6);
  const grass = [AD[G1], AD[G1 + 1], AD[G1 + 2]], dark = [AD[G2], AD[G2 + 1], AD[G2 + 2]];
  const stoneT = M.t.stone, dirtT = [1, 2, 5, 6].map((i) => M.t.cliff2[i]).filter(Boolean);
  const img = g.createImageData(W0, H0), O = img.data;
  for (let cy = 0; cy < H0; cy += 2) for (let cx = 0; cx < W0; cx += 2) {
    const n = vn(cx / 46, cy / 46) * .55 + vn(cx / 17, cy / 17) * .3 + vn(cx / 6, cy / 6) * .15;
    const fv = bil(ff, cx, cy) + (n - .5) * .78;
    const tc = cx >> 5, tr = cy >> 5, lx = cx & 31, ly = cy & 31;
    let kind = 0, tile = null, m = 1, e = 1;
    if (fv > .5) {
      const pv = bil(pf, cx, cy) + (vn(cx / 13 + 91, cy / 13) - .5) * .8, gap = vn(cx / 5 + 7, cy / 5 + 3), dirt = vn(cx / 30 + 50, cy / 30 + 50);
      if (pv > .56 && gap > .22) { kind = 1; tile = stoneT[(hash(tc, tr) * stoneT.length) | 0]; m = .82 + n * .3 }
      else if (dirt > .83 && pv < .4) { kind = 1; tile = dirtT[(hash(tc + 3, tr) * dirtT.length) | 0]; m = .72 + n * .25 }
      else { kind = 0; m = .8 + n * .32 + (hash(cx, cy) < .05 ? .14 : hash(cy, cx) < .05 ? -.12 : 0) }
      if (fv < .64) e = .72 + (fv - .5) * 2; // sombra suave na beirada da clareira
    } else {
      kind = 2; const d = bil(df, cx, cy); m = (.62 + n * .38) * Math.max(.1, 1 - Math.max(0, d - .55) * .26) * (fv > .4 && hash(cx + 1, cy) < .35 ? 1.18 : 1);
    }
    for (let k = 0; k < 4; k++) {
      const dx = k & 1, dy = k >> 1, i = ((cy + dy) * W0 + cx + dx) * 4;
      let r, gg, b;
      if (kind === 1) { const q = px(tile, lx + dx, ly + dy); r = AD[q]; gg = AD[q + 1]; b = AD[q + 2] }
      else if (kind === 0) { r = grass[0]; gg = grass[1]; b = grass[2] }
      else { r = dark[0]; gg = dark[1]; b = dark[2] }
      const f = m * e; O[i] = r * f; O[i + 1] = gg * f; O[i + 2] = b * f; O[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  tx.refresh();
  S.add.image(0, 0, key).setOrigin(0).setDepth(-2);
  B.groundLayer?.setVisible(!1); B.wallLayer?.setVisible(!1);
  S.cameras.main.setBackgroundColor("#0e1612");
  S.events.once("shutdown", () => { S.textures.exists(key) && S.textures.remove(key) });
  // árvores secas, lápides e cercas no platô perto das salas
  const ex = (k) => S.textures.exists(k), trees = ["gy-tree1", "gy-tree2", "gy-tree3", "gy-tree4", "gy-tree5", "gy-tree6", "gy-tree7", "gy-tree8", "gy-tree9", "gy-tree10"].filter(ex);
  const stones = Array.from({ length: 31 }, (_, i) => "gy-statue" + (i + 1)).filter(ex), fences = Array.from({ length: 10 }, (_, i) => "gy-fence" + (i + 1)).filter(ex);
  const grid = new Set(), list = [];
  // nada de árvores, mausoléus ou lanternas colados no interior de casas nem sobre cabanas
  const noDeco = (B.level.rooms || []).filter((q) => q.interior || q.wqCabin).map((q) => ({ x0: q.rect.x - (q.interior ? 12 : 0), y0: q.rect.y - (q.interior ? 12 : 0), x1: q.rect.x + q.rect.w + (q.interior ? 12 : 0), y1: q.rect.y + (q.interior ? q.rect.h + 12 : 6) }));
  const blocked = (c, r) => noDeco.some((q) => c >= q.x0 && c < q.x1 && r >= q.y0 && r < q.y1);
  // mausoléus e criptas na mata, de frente para as clareiras (só onde caibem inteiros sobre a mata)
  {
    const kinds = [["gyt-maus", 4, 7, 2], ["gy-decor1", 3, 3, 1], ["gy-decor2", 2, 3, 1]].filter((k) => ex(k[0]));
    const placed = [], maxN = Math.max(2, Math.round((B.level.rooms || []).length * .7));
    const fits = (c0, r1, w, h) => { for (let r = r1 - h + 1; r <= r1; r++) for (let c = c0; c < c0 + w; c++) if (c < 0 || r < 0 || c >= C || r >= R || F(c, r)) return !1; return !0 };
    const cand = [];
    for (let r = 2; r < R - 2; r++) for (let c = 1; c < C - 4; c++) if (!F(c, r) && (F(c + 1, r + 1) || F(c + 1, r + 2)) && !F(c + 1, r)) cand.push([c, r]);
    for (let k = cand.length - 1; k > 0; k--) { const j2 = rnd() * (k + 1) | 0; [cand[k], cand[j2]] = [cand[j2], cand[k]] }
    for (const [c, r] of cand) {
      if (blocked(c, r)) continue;
      if (placed.length >= maxN) break;
      const nBig = placed.filter((q) => q.big).length, order = kinds.filter((k) => k[3] === 2 ? nBig < Math.ceil(maxN * .6) : rnd() < .5);
      let kd = null, c0 = 0;
      for (const k of order) { const cc = c - (k[1] >> 1) + 1; if (fits(cc, r, k[1], k[2]) && !placed.some((q) => Math.abs(q.c - cc) < 8 && Math.abs(q.r - r) < 8)) { kd = k; c0 = cc; break } }
      if (!kd) continue;
      const [tk, w, h, big] = kd;
      const x = (c0 + w / 2) * T, y = (r + 1) * T - 2;
      const sh2 = S.add.ellipse(x + 6, y - 2, w * T * 1.05, 18, 0, .38).setDepth(.5);
      const o = S.add.image(x, y, tk).setOrigin(.5, 1).setDepth(y).setTint(0xdfe3dd).setFlipX(rnd() < .5);
      list.push(o, sh2);
      if (big === 2 && S.textures.exists("light")) { const gl = S.add.image(x + (o.flipX ? 16 : -16), y - 30, "light").setBlendMode(j.BlendModes.ADD).setTint(0x9fc4ff).setScale(.2).setAlpha(.18).setDepth(y + 1); S.tweens.add({ targets: gl, alpha: .08, duration: 1600 + rnd() * 900, yoyo: !0, repeat: -1 }); list.push(gl) }
      placed.push({ c: c0, r, big: big === 2 });
      for (let rr = r - h; rr <= r + 1; rr++) for (let cc = c0 - 1; cc <= c0 + w; cc++) grid.add((cc >> 1) + "," + (rr >> 1));
    }
  }
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const d = dist[r * C + c];
    if (d < 1 || d > 3 || blocked(c, r)) continue;
    if (F(c, r - 1)) continue; // não cobre a beira da clareira
    const gk = (c >> 1) + "," + (r >> 1);
    if (grid.has(gk)) continue;
    const roll = rnd();
    if (roll < .42 && trees.length) { grid.add(gk); const x = c * T + 16 + (rnd() - .5) * 10, y = (r + 1) * T; list.push(S.add.image(x, y, pick(trees)).setOrigin(.5, 1).setDepth(y).setTint(0xc8d0c8)) }
    else if (roll < .5 && stones.length) { grid.add(gk); const x = c * T + 16, y = (r + 1) * T - 4; list.push(S.add.image(x, y, pick(stones)).setOrigin(.5, 1).setDepth(y)) }
    else if (roll < .58 && fences.length && d === 1) { const x = c * T + 16, y = (r + 1) * T - 6; list.push(S.add.image(x, y, pick(fences)).setOrigin(.5, 1).setDepth(y)) }
  }
  // lanternas e forcas animadas nas salas
  const A = M.anim;
  for (const [name, a] of Object.entries(A)) {
    const tk = "gya-" + name;
    if (!S.textures.exists(tk)) { const t = S.textures.addSpriteSheetFromAtlas ? null : null; const can = S.textures.createCanvas(tk, a.w * a.n, a.h); can.getContext().drawImage(src, a.x, a.y, a.w * a.n, a.h, 0, 0, a.w * a.n, a.h); can.refresh(); const tt = S.textures.get(tk); for (let k = 0; k < a.n; k++) tt.add(k, 0, k * a.w, 0, a.w, a.h) }
    S.anims.exists(tk) || S.anims.create({ key: tk, frames: Array.from({ length: a.n }, (_, k) => ({ key: tk, frame: k })), frameRate: name === "gallows" ? 5 : 7, repeat: -1 });
  }
  const sp = B.level.playerSpawn;
  for (const rm of B.level.rooms || []) {
    const r = rm.rect; if (!r || rm.roomType === "BOSS" || rm.boss || rm.interior || rm.wqCabin) continue;
    const spots = [[r.x + 1, r.y + 1], [r.x + r.w - 2, r.y + 1], [r.x + 1, r.y + r.h - 2], [r.x + r.w - 2, r.y + r.h - 2]];
    for (const [c, rr] of spots) {
      if (rnd() > .55 || !F(c, rr) || (sp && Math.abs(sp.col - c) + Math.abs(sp.row - rr) < 3)) continue;
      const kind = rnd() < .2 ? "gallows" : pick(["lantern1", "lantern2", "lantern3"]), x = c * T + 16, y = (rr + 1) * T - 2;
      const s = S.add.sprite(x, y, "gya-" + kind, 0).setOrigin(.5, 1).setDepth(y); s.play("gya-" + kind); s.anims.setProgress(rnd());
      list.push(s);
      if (kind !== "gallows" && S.textures.exists("light")) { const gl = S.add.image(x + 9, y - 34, "light").setBlendMode(j.BlendModes.ADD).setTint(0xffc46a).setScale(.22).setAlpha(.45).setDepth(y + 1); S.tweens.add({ targets: gl, alpha: .25, duration: 700 + rnd() * 500, yoyo: !0, repeat: -1 }); B.lightSources?.push?.({ x: x + 9, y: y - 34, type: "CANDLE" }) }
    }
  }
  // névoa densa: duas camadas de ruído fractal repetível, uma rasteira (abaixo dos personagens) e uma fina por cima
  __gyFogTex(S);
  const fogA = S.add.tileSprite(0, 0, C * T, R * T, "gy-fog").setOrigin(0).setDepth(.9).setAlpha(.62).setTint(0xc9d4cc).setTileScale(2.2);
  const fogB = S.add.tileSprite(0, 0, C * T, R * T, "gy-fog").setOrigin(0).setDepth(8990).setAlpha(.2).setTint(0xaebbb3).setTileScale(3.4);
  const fogC = S.add.tileSprite(0, 0, C * T, R * T, "gy-fog").setOrigin(0).setDepth(.95).setAlpha(.34).setTint(0xdfe6e0).setTileScale(1.3).setFlipY(!0);
  const drift = (t, dms) => { const k = dms / 1000; fogA.tilePositionX += 5.5 * k; fogA.tilePositionY += 1.2 * k; fogB.tilePositionX -= 3.2 * k; fogB.tilePositionY += .8 * k; fogC.tilePositionX += 9 * k; fogC.tilePositionY -= 1.6 * k; fogA.setAlpha(.56 + Math.sin(t / 5200) * .07); fogB.setAlpha(.18 + Math.sin(t / 7300 + 1) * .05) };
  S.__gyFog = [fogA, fogB, fogC];
  S.events.on("update", drift); S.events.once("shutdown", () => S.events.off("update", drift));
  // só desenha o que está perto da câmera
  let lc = 0; const cull = () => { const now = S.time.now; if (now - lc < 90) return; lc = now; const v = S.cameras.main.worldView, x1 = v.x - 140, x2 = v.right + 140, y1 = v.y - 160, y2 = v.bottom + 160; for (const o of list) o.active && o.setVisible(o.x >= x1 && o.x <= x2 && o.y >= y1 && o.y <= y2) };
  S.events.on("update", cull); S.events.once("shutdown", () => S.events.off("update", cull));
  return !0;
}
{
  const BW = _l.prototype.buildWallVisuals;
  _l.prototype.buildWallVisuals = function () {
    if (this.level?.theme?.id === "graveyard") { try { if (__gyBake(this)) return } catch (e) { console.warn("[graveyard]", e) } }
    return BW.apply(this, arguments);
  };
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try { const L = this.load, op = L.path; L.setPath(""); this.textures.exists("gyt-atlas") || L.image("gyt-atlas", "assets/pixel-art/endless/gyt-atlas.png"); this.textures.exists("gyt-maus") || L.image("gyt-maus", "assets/pixel-art/endless/gyt-maus.png"); L.json("gyt-atlas", "assets/pixel-art/endless/gyt-atlas.json"); L.setPath(op) } catch (e) {}
    return r;
  };
}
/* ─── inimigos do cemitério: direção certa + movimento procedural ─── */
{
  const DIR = [2, 1, 0, 7, 6, 5, 4, 3]; // índice do ângulo (0=leste, sentido horário) -> quadro da folha
  const isGw = (o) => /^gw-/.test(o.data_?.texture || "");
  // escala base guardada uma vez (a do nascimento); a cada quadro volta a ela antes da lógica do jogo
  const undo = (o) => { const f = o.__gwF; if (!f) return; o.__gwF = null; o.setScale(o.__gwB.x, o.__gwB.y); o.setAngle(0) };
  function pose(o, boss) {
    const S = o.scene, now = S.time.now, d = Math.min(.05, Math.max(0, (now - (o.__gwT ?? now)) / 1000)); o.__gwT = now;
    const v = o.body?.velocity || { x: 0, y: 0 }, sp = Math.hypot(v.x, v.y), st = boss ? o.state_ : o.ai?.state;
    const atk = st === "attack", tel = st === "telegraph" || st === "cast" || st === "phase_transition";
    if (st !== o.__gwS) { o.__gwS = st; o.__gwS0 = now }
    const sinceSt = (now - (o.__gwS0 ?? now)) / 1000;
    o.anims?.isPlaying && o.anims.stop();
    // direção: para onde anda; parado ou atacando, para o alvo
    let dx = v.x, dy = v.y;
    if (sp < 14 || atk || tel) { const P = S.player; if (P) { dx = P.x - o.x; dy = P.y - o.y } }
    if (Math.hypot(dx, dy) > .5) { const a = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360; o.__gwDir = DIR[Math.round(a / 45) % 8] }
    o.setFlipX(!1); o.setFrame(o.__gwDir ?? 0);
    o.__gwPh = (o.__gwPh ?? Math.random() * 6) + d * (sp > 14 ? 9 + sp * .045 : 2.4);
    const side = dx < 0 ? -1 : 1, ghost = /ghost/.test(o.data_.texture);
    let sx = 1, sy = 1, ang = 0;
    if (!boss && o.hurtTimer > 0) { ang = Math.sin(now / 16) * 7; sx = 1.07; sy = .93 }
    else if (tel) { const k = Math.min(1, sinceSt * 3); sx = 1 + .08 * k; sy = 1 - .07 * k; ang = -side * 9 * k + Math.sin(now / 30) * 1.5 * k }
    else if (atk) { const k = Math.max(0, 1 - sinceSt * 4); sx = 1 - .1 * k; sy = 1 + .12 * k; ang = side * 16 * k }
    else if (sp > 14) { const s = Math.sin(o.__gwPh); ang = ghost ? s * 8 : s * 6; sy = 1 + Math.abs(s) * .06; sx = 1 - Math.abs(s) * .035 }
    else { const s = Math.sin(o.__gwPh); sy = 1 + s * .03; sx = 1 - s * .015; ghost && (ang = s * 4) }
    o.__gwB ??= { x: o.scaleX, y: o.scaleY }; o.setScale(o.__gwB.x * sx, o.__gwB.y * sy); o.setAngle(ang);
    o.__gwF = 1;
  }
  for (const [K, boss] of [[lh, !1], [hh, !0]]) {
    const U0 = K.prototype.update;
    K.prototype.update = function () {
      const gw = isGw(this);
      gw && undo(this);
      const r = U0.apply(this, arguments);
      if (gw && !this.dead && this.active && this.state_ !== "dead") try { pose(this, boss) } catch (e) {}
      return r;
    };
  }
  const D0 = lh.prototype.die;
  lh.prototype.die = function () {
    const gw = isGw(this);
    gw && undo(this);
    const r = D0.apply(this, arguments);
    try { if (gw && this.active) { this.anims?.stop(); this.scene.tweens.add({ targets: this, angle: (this.__gwDir ?? 0) >= 5 ? -90 : 90, duration: 380, ease: "Quad.easeIn" }) } } catch (e) {}
    return r;
  };
}
/* no cemitério, só os mortos-vivos do próprio cemitério */
try { for (const [k, g] of Object.entries(ga)) if (k !== "GRAVEYARD" && g.biomes?.includes("graveyard")) g.biomes = g.biomes.filter((b) => b !== "graveyard") } catch (e) {}
/* placas quadradas de estrada soltas no chão destoam do contorno orgânico: fora da decoração do cemitério */
try { if (ed.graveyard) ed.graveyard.flat = ed.graveyard.flat.filter((k) => !/^gy-road/.test(k)) } catch (e) {}
