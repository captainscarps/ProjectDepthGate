/* ══ Templo dos Irmãos ══
   Fase de exploração com o pack "Free 2D Top-Down Pixel Dungeon" (atlas: scripts/build_temple_dungeon.py).
   Paredes altas de pedra com arcos, nichos de vela, portas e grades; piso com bordas, rachaduras e
   ladrilhos decorados; cisterna com água, altar elevado com braseiro, escadas de mão, caixas, barris,
   vasos, ouro e escudos; baús do pack; alavanca que abre a câmara secreta; portão do santuário que só
   abre depois de explorar o templo. Chefe: o Tengu. */
const __TP = {
  id: "templo",
  SECRET_LEVER: "tp-arquivo",
};
{
  const R = (id, name, x, y, w, h, o = {}) => ({ id, name, rect: { x, y, w, h }, ambient: o.ambient ?? .5, walls: o.walls || [], enemies: o.enemies || [], decor: o.decor || [], tp: o.tp || [], ...o.extra });
  const E = (type, col, row, x = {}) => ({ type, col, row, ...x });
  ki.templo = {
    id: "templo", name: "Templo dos Irmãos", noCd: !0, pendingFinale: "O GUARDIÃO DO TEMPLO CAIU",
    theme: { ...Xn, id: "templo", name: "Templo dos Irmãos", music: { explore: "catacombs-ambience", boss: "boss-ambience" } },
    world: { cols: 84, rows: 46 },
    rooms: [
      R("tp-entrada", "Pátio da Entrada", 4, 30, 12, 10, { ambient: .62,
        tp: [["big", 9, 33], ["crates2", 5, 31], ["vases", 14, 31], ["barrel-box", 5, 38], ["gold3", 13, 38], ["hatch", 7, 36]] }),
      R("tp-salao", "Salão das Lanternas", 22, 28, 16, 12, { ambient: .48,
        walls: [{ x: 25, y: 31, w: 1, h: 2 }, { x: 34, y: 31, w: 1, h: 2 }, { x: 25, y: 36, w: 1, h: 2 }, { x: 34, y: 36, w: 1, h: 2 }],
        enemies: [E("SKELETON", 27, 30), E("SKELETON", 32, 35), E("SKELETON_ARCHER", 36, 30), E("GOBLIN_ASSASSIN", 29, 38)],
        tp: [["small", 29, 33], ["small", 30, 33], ["crate-barrel", 23, 29], ["box-tall", 37, 38], ["pot1", 23, 38], ["urn1", 36, 29]] }),
      R("tp-cisterna", "Cisterna Antiga", 44, 30, 16, 12, { ambient: .45,
        walls: [{ x: 47, y: 33, w: 6, h: 4, water: !0 }, { x: 53, y: 37, w: 5, h: 3, water: !0 }],
        enemies: [E("GHOST", 46, 38), E("GHOST", 57, 32), E("SKELETON_WARRIOR", 50, 39), E("SKELETON_MAGE", 58, 40)],
        decor: [{ type: "chest", col: 45, row: 31, solid: !0, tier: "RARE" }],
        tp: [["vases2", 58, 31], ["crates1", 45, 40], ["gold2", 53, 31], ["box", 56, 40]] }),
      R("tp-arquivo", "Arquivo dos Monges", 22, 10, 12, 10, { ambient: .5,
        enemies: [E("SKELETON_MAGE", 27, 13), E("SKELETON", 24, 17), E("SKELETON_ARCHER", 31, 12)],
        decor: [{ type: "lever", col: 32, row: 18, id: __TP.SECRET_LEVER, hidden: !0, solid: !0 }],
        tp: [["crate-tall", 23, 11], ["crates3", 25, 11], ["box-tall2", 30, 11], ["pot2", 32, 11], ["candle", 28, 15], ["ladder", 33, 11, !1]] }),
      R("tp-tesouro", "Câmara dos Irmãos", 4, 10, 10, 9, { ambient: .66, extra: { secret: !0 },
        decor: [{ type: "chest", col: 8, row: 13, solid: !0, tier: "EPIC" }],
        tp: [["gold5", 5, 11], ["gold1", 11, 11], ["chest-gold", 6, 16], ["basket-gold", 11, 16], ["gold4", 9, 17], ["shield", 5, 14], ["shield2", 12, 14], ["bowl", 8, 11]] }),
      R("tp-altar", "Altar do Fogo Eterno", 40, 8, 14, 12, { ambient: .55,
        walls: [{ x: 45, y: 11, w: 4, h: 3, plat: !0 }],
        enemies: [E("SKELETON_WARRIOR", 42, 16, { elite: !0 }), E("SKELETON", 51, 10), E("GHOST", 51, 17)],
        decor: [{ type: "chest", col: 52, row: 18, solid: !0, tier: "RARE" }],
        tp: [["big", 47, 12, !1], ["urn1", 41, 9], ["urn2", 52, 9], ["pot3", 41, 18]] }),
      R("tp-santuario", "Santuário do Tengu", 62, 8, 18, 22, { ambient: .42,
        walls: [{ x: 65, y: 12, w: 2, h: 2 }, { x: 75, y: 12, w: 2, h: 2 }, { x: 65, y: 23, w: 2, h: 2 }, { x: 75, y: 23, w: 2, h: 2 }, { x: 69, y: 9, w: 4, h: 2, plat: !0 }],
        tp: [["big", 70, 9, !1], ["big", 63, 27], ["big", 78, 27], ["shield", 63, 9], ["shield2", 78, 9]],
        extra: { boss: "RIVER_TENGU", bossCol: 71, bossRow: 17 } }),
    ],
    corridors: [
      { x: 16, y: 33, w: 6, h: 3 }, { x: 38, y: 34, w: 6, h: 3 }, { x: 27, y: 20, w: 3, h: 8 },
      { x: 14, y: 13, w: 8, h: 3 }, { x: 34, y: 13, w: 6, h: 3 }, { x: 48, y: 20, w: 3, h: 10 }, { x: 54, y: 13, w: 8, h: 3 },
    ],
    doors: [
      { id: "tp-porta-tesouro", orientation: "v", col: 17, row: 14, rooms: ["tp-arquivo", "tp-tesouro"], cdSeal: "gate", gate: "lever:" + __TP.SECRET_LEVER, gateRoom: "tp-tesouro" },
      { id: "tp-porta-santuario", orientation: "v", col: 58, row: 14, rooms: ["tp-altar", "tp-santuario"], cdSeal: "gate", gate: "explore", model: "gate" },
    ],
    playerSpawn: { col: 9, row: 37 }, next: null,
  };
  __tpOrganic(ki.templo);
}
/* sem lados retos: cantos das salas desmoronados em degraus, mordidas nas bordas e corredores com
   paredes irregulares (sempre longe das entradas, portas, inimigos e objetos) */
function __tpOrganic(L) {
  let sd = 4242; const rnd = () => (sd = sd * 1664525 + 1013904223 >>> 0) / 4294967296;
  const inR = (q, x, y) => x >= q.x && x < q.x + q.w && y >= q.y && y < q.y + q.h;
  const floor = (x, y) => L.rooms.some((r) => inR(r.rect, x, y)) || L.corridors.some((c) => inR(c, x, y));
  // poças de contorno irregular no lugar dos retângulos de água (uniões de elipses tortas)
  for (const r of L.rooms) {
    const ws = (r.walls || []).filter((w) => w.water); if (!ws.length) continue;
    r.walls = r.walls.filter((w) => !w.water);
    const q = r.rect, cells = new Set();
    for (const w of ws) {
      const blobs = [[w.x + w.w / 2, w.y + w.h / 2, w.w / 2 + .3, w.h / 2 + .3]];
      for (let k = 0; k < 4; k++) blobs.push([w.x + rnd() * w.w, w.y + rnd() * w.h, 1.2 + rnd() * w.w * .45, 1 + rnd() * w.h * .45]);
      blobs[0][2] *= .8 + rnd() * .2; blobs[0][3] *= .75 + rnd() * .25;
      for (let y = q.y + 1; y < q.y + q.h - 1; y++) for (let x = q.x + 1; x < q.x + q.w - 1; x++) {
        const cx = x + .5, cy = y + .5;
        if (blobs.some(([bx, by, rx, ry]) => ((cx - bx) / rx) ** 2 + ((cy - by) / ry) ** 2 < 1 + (rnd() - .5) * .25)) cells.add(x + "," + y);
      }
    }
    for (const k of cells) { const [x, y] = k.split(",").map(Number); r.walls.push({ x, y, w: 1, h: 1, water: !0 }) }
  }
  const keep = new Set();
  const mark = (x, y, rad = 2) => { for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) keep.add((x + dx) + "," + (y + dy)) };
  // entradas: células da borda da sala encostadas num corredor
  for (const r of L.rooms) { const q = r.rect; for (let x = q.x - 1; x <= q.x + q.w; x++) for (let y = q.y - 1; y <= q.y + q.h; y++) if (!inR(q, x, y) && L.corridors.some((c) => inR(c, x, y))) mark(x, y, 2) }
  for (const d of L.doors || []) mark(d.col, d.row, 2);
  mark(L.playerSpawn.col, L.playerSpawn.row, 2);
  for (const r of L.rooms) {
    for (const e of r.enemies || []) mark(e.col, e.row, 1);
    for (const d of r.decor || []) mark(d.col, d.row, 1);
    for (const t of r.tp || []) mark(t[1], t[2], 1);
    for (const w of r.walls || []) for (let y = w.y - 1; y <= w.y + w.h; y++) for (let x = w.x - 1; x <= w.x + w.w; x++) keep.add(x + "," + y);
    r.bossCol != null && mark(r.bossCol, r.bossRow, 3);
  }
  const bite = (r, x, y) => { const k = x + "," + y; if (keep.has(k)) return; r.walls.push({ x, y, w: 1, h: 1 }); keep.add(k) };
  for (const r of L.rooms) {
    const q = r.rect;
    // cantos em degrau (2 ou 3 células)
    const corners = [[q.x, q.y, 1, 1], [q.x + q.w - 1, q.y, -1, 1], [q.x, q.y + q.h - 1, 1, -1], [q.x + q.w - 1, q.y + q.h - 1, -1, -1]];
    for (const [cx, cy, sx, sy] of corners) {
      const n = 2 + (rnd() * 3 | 0);
      for (let i = 0; i < n; i++) for (let j = 0; j < n - i; j++) bite(r, cx + sx * i, cy + sy * j);
    }
    // mordidas nas bordas
    const edges = [];
    for (let x = q.x + 3; x < q.x + q.w - 3; x++) edges.push([x, q.y, 0, 1], [x, q.y + q.h - 1, 0, -1]);
    for (let y = q.y + 3; y < q.y + q.h - 3; y++) edges.push([q.x, y, 1, 0], [q.x + q.w - 1, y, -1, 0]);
    for (const [x, y, dx, dy] of edges) {
      if (rnd() > .26) continue;
      const top = dy === 1, len = top ? 3 + (rnd() * 2 | 0) : 1 + (rnd() * 3 | 0), deep = top ? 1 : rnd() < .5 ? 2 : 1;
      for (let k = 0; k < len; k++) for (let d = 0; d < deep; d++) bite(r, x + (dx ? 0 : k) + dx * d, y + (dy ? 0 : k) + dy * d);
    }
  }
  // corredores com paredes irregulares
  for (const c of L.corridors) {
    const horiz = c.w > c.h, len = horiz ? c.w : c.h;
    for (let i = 1; i < len - 1; i++) {
      if (rnd() > .3) continue;
      const side = rnd() < .5 ? 0 : (horiz ? c.h : c.w) - 1;
      const x = horiz ? c.x + i : c.x + side, y = horiz ? c.y + side : c.y + i;
      if (keep.has(x + "," + y)) continue;
      const host = L.rooms.find((r) => inR(r.rect, x, y)) || L.rooms[0];
      if (L.rooms.some((r) => inR(r.rect, x, y))) continue;
      (L.__cw ??= []).push({ x, y, w: 1, h: 1 }); keep.add(x + "," + y);
    }
  }
  // paredes dos corredores entram como paredes da sala mais próxima (o mapa só lê paredes de salas)
  if (L.__cw) L.rooms[0].walls.push(...L.__cw);
}
/* ─── pintura do mapa com os ladrilhos do pack (cada célula do jogo = 1 ladrilho de 16 px em 2x) ─── */
let __tpN = 0;
function __tpBake(B) {
  const S = B.scene, M = S.cache.json.get("tpd-atlas");
  if (!M || !S.textures.exists("tpd-atlas")) return !1;
  const src = S.textures.get("tpd-atlas").getSourceImage(), C = B.cols, R = B.rows, T = dt, key = "tpb-" + ++__tpN;
  const tx = S.textures.createCanvas(key, C * T, R * T), g = tx.getContext();
  g.imageSmoothingEnabled = !1;
  let sd = 9137; const rnd = () => (sd = sd * 1664525 + 1013904223 >>> 0) / 4294967296, pick = (a) => a[rnd() * a.length | 0];
  const WF = M.sheets.walls_floor, CR = M.sheets.decorative_cracks_floor, CW = 13;
  const tile = (i, c, r, sx = 0, sy = 0, sw = 16, sh = 16, dx = 0, dy = 0) => g.drawImage(src, WF[0] + (i % CW) * 16 + sx, WF[1] + (i / CW | 0) * 16 + sy, sw, sh, c * T + dx * 2, r * T + dy * 2, sw * 2, sh * 2);
  const CWs = M.sheets.decorative_cracks_walls, CRK = M.cracks || {}, plain = new Set();
  const rng = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  // bordas do piso quebradas (variações do pack para cada peça de borda)
  const FRC = { 65: [...rng(24, 27), ...rng(32, 35)], 66: rng(0, 3), 67: [...rng(28, 31), ...rng(36, 39)], 78: rng(8, 11), 80: rng(12, 15), 59: rng(4, 7), 61: rng(20, 23), 64: rng(16, 19), 73: rng(48, 51), 71: rng(52, 55), 74: rng(44, 47), 77: rng(40, 43) };
  // ladrilho de parede com chance de vir rachado (variações do próprio pack)
  const wtile = (i, c, r, ch = .45) => { const v = CRK[i]; if (v && CWs && rnd() < ch) { const k = pick(v); g.drawImage(src, CWs[0] + (k % 8) * 16, CWs[1] + (k / 8 | 0) * 16, 16, 16, c * T, r * T, 32, 32) } else tile(i, c, r) };
  const rooms = B.level.rooms || [];
  const special = new Map();
  for (const rm of rooms) for (const w of rm.walls || []) if (w.water || w.plat) for (let y = w.y; y < w.y + w.h; y++) for (let x = w.x; x < w.x + w.w; x++) special.set(x + "," + y, w.water ? "water" : "plat");
  const F = (c, r) => c >= 0 && r >= 0 && c < C && r < R && !B.isWallTile(c, r);
  const SP = (c, r) => special.get(c + "," + r);
  const W = (c, r) => !F(c, r) && !SP(c, r);
  const face = new Uint8Array(C * R); // 1 = base da parede, 2 = meio, 3 = topo
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (!W(c, r)) continue;
    if (F(c, r + 1)) face[r * C + c] = 1;
    else if (W(c, r + 1) && F(c, r + 2) && r + 1 < R) face[r * C + c] = 2;
    else if (W(c, r + 1) && W(c, r + 2) && F(c, r + 3)) face[r * C + c] = 3;
  }
  const fc = (c, r) => c >= 0 && r >= 0 && c < C && r < R ? face[r * C + c] : 0;
  g.fillStyle = "rgb(29,28,43)"; g.fillRect(0, 0, C * T, R * T);
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const sp = SP(c, r);
    if (F(c, r) || sp === "plat") {
      // piso com borda clara onde encontra o vazio
      const Wt = (x, y) => SP(x, y) === "water";
      const l = !F(c - 1, r) && !SP(c - 1, r) && !fc(c - 1, r), rr = !F(c + 1, r) && !SP(c + 1, r) && !fc(c + 1, r), b = !F(c, r + 1) && !SP(c, r + 1);
      let t = 79;
      if (sp === "plat") { const u = SP(c, r - 1) === "plat", d = SP(c, r + 1) === "plat", lf = SP(c - 1, r) === "plat", rt = SP(c + 1, r) === "plat"; t = [[65, 66, 67], [78, 79, 80], [91, 92, 93]][!u ? 0 : !d ? 2 : 1][!lf ? 0 : !rt ? 2 : 1] }
      else if (b && l) t = 91; else if (b && rr) t = 93; else if (b) t = 92; else if (l) t = 78; else if (rr) t = 80;
      const fv = FRC[t];
      if (fv && CR && rnd() < .5) { const k = pick(fv); g.drawImage(src, CR[0] + (k % 8) * 16, CR[1] + (k / 8 | 0) * 16, 16, 16, c * T, r * T, 32, 32) } else tile(t, c, r);
      if (t === 79) plain.add(c + "," + r);
      if (sp === "plat" && SP(c, r + 1) !== "plat") { tile(53, c, r, 0, 10, 16, 6, 0, 10) }
      continue;
    }
    if (sp === "water") continue;
    const f = face[r * C + c];
    if (f) {
      const L = fc(c - 1, r) === f, Rt = fc(c + 1, r) === f;
      // parede de uma célula de largura com piso dos dois lados: coluna fina de pedra (como no pack)
      if (F(c - 1, r) && F(c + 1, r) || (F(c - 1, r + (f === 1 ? 0 : 1)) && F(c + 1, r + (f === 1 ? 0 : 1)))) {
        tile(79, c, r);
        tile(f === 1 ? 182 : 169, c, r);
        continue;
      }
      const base = f === 1 ? 52 : f === 2 ? 39 : 26;
      wtile(base + (!L ? 0 : !Rt ? 2 : 1), c, r);
      continue;
    }
    // vazio: bordas onde encosta no piso
    const up = F(c, r - 1) || SP(c, r - 1) === "plat", lf = F(c - 1, r), rt = F(c + 1, r);
    if (F(c - 1, r) && F(c + 1, r)) { tile(79, c, r); tile(156, c, r); continue }
    if (up && lf) wtile(0, c, r, .3); else if (up && rt) wtile(2, c, r, .3); else if (up) wtile(1, c, r, .3);
    else if (lf) wtile(13, c, r, .3); else if (rt) wtile(15, c, r, .3);
  }
  // corredores num nível mais baixo (piso escuro) e escadinhas do pack nas entradas das salas
  {
    const inRoom = (c, r) => rooms.some((q) => q.rect && c >= q.rect.x && c < q.rect.x + q.rect.w && r >= q.rect.y && r < q.rect.y + q.rect.h);
    const low = (c, r) => F(c, r) && !SP(c, r) && !inRoom(c, r);
    const px = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x * 2, y * 2, w * 2, h * 2) };
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (!low(c, r)) continue;
      plain.delete(c + "," + r);
      const X = c * 16, Y = r * 16;
      px(X, Y, 16, 16, "rgb(94,107,125)");
      if (rnd() < .12) { const mx = X + 3 + (rnd() * 8 | 0), my = Y + 4 + (rnd() * 8 | 0); px(mx, my, 6, 1, "rgb(84,96,114)"); px(mx + 2, my, 1, 3, "rgb(84,96,114)") }
      // contorno onde encontra o vazio dos lados
      if (!F(c - 1, r) && !fc(c - 1, r)) { px(X, Y, 1, 16, "rgb(36,39,50)"); px(X + 1, Y, 1, 16, "rgb(71,83,98)") }
      if (!F(c + 1, r) && !fc(c + 1, r)) { px(X + 15, Y, 1, 16, "rgb(36,39,50)"); px(X + 14, Y, 1, 16, "rgb(71,83,98)") }
      if (!F(c, r + 1)) { px(X, Y + 15, 16, 1, "rgb(36,39,50)") }
    }
    // escada: célula da sala encostada no corredor em cima ou embaixo
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
      if (!F(c, r) || SP(c, r) || low(c, r)) continue;
      const dn = low(c, r + 1), up = low(c, r - 1);
      if (!dn && !up) {
        const lw = low(c - 1, r), rw = low(c + 1, r); if (!lw && !rw) continue;
        // degraus de lado: a escada do pack girada
        plain.delete(c + "," + r);
        g.save(); g.translate((c + .5) * T, (r + .5) * T); g.rotate(lw ? Math.PI / 2 : -Math.PI / 2); g.translate(-(c + .5) * T, -(r + .5) * T); tile(114, c, r); g.restore();
        continue;
      }
      plain.delete(c + "," + r);
      const lft = !(F(c - 1, r) && !low(c - 1, r) && (low(c - 1, r + (dn ? 1 : -1)))), rgt = !(F(c + 1, r) && !low(c + 1, r) && (low(c + 1, r + (dn ? 1 : -1))));
      const id = 114;
      if (dn) tile(id, c, r);
      else { g.save(); g.translate(0, (r * 2 + 1) * T); g.scale(1, -1); tile(id, c, r); g.restore() }
    }
  }
  // água no padrão do pack: fundo de piso afundado, beirada de pedra, linha d'água ciano e faixas claras
  {
    const Wt = (x, y) => SP(x, y) === "water";
    const px = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x * 2, y * 2, w * 2, h * 2) };
    for (const [k, v] of special) {
      if (v !== "water") continue;
      const [c, r] = k.split(",").map(Number), X = c * 16, Y = r * 16;
      const n = Wt(c, r - 1), s_ = Wt(c, r + 1), w = Wt(c - 1, r), e = Wt(c + 1, r);
      px(X, Y, 16, 16, "rgb(63,112,166)");
      // marcas do piso afundado
      if (rnd() < .3) { const mx = X + 3 + (rnd() * 8 | 0), my = Y + 4 + (rnd() * 8 | 0); px(mx, my, 6, 1, "rgb(56,99,152)"); px(mx + 2, my, 1, 3, "rgb(56,99,152)"); px(mx, my + 3, 5, 1, "rgb(56,99,152)") }
      // moldura de pedra clara da cisterna (cores e chanfro do pack), depois a água
      const FR = ["rgb(36,39,50)", "rgb(161,165,216)", "rgb(146,153,192)", "rgb(146,153,192)", "rgb(89,93,115)"];
      const L0 = !w ? 5 : 0, R0 = !e ? 5 : 0, B0 = !s_ ? 5 : 0;
      if (!n) {
        for (let k = 0; k < 5; k++) px(X, Y + k, 16, 1, FR[k]);
        px(X + L0, Y + 5, 16 - L0 - R0, 1, "rgb(39,40,55)"); px(X + L0, Y + 6, 16 - L0 - R0, 4, "rgb(52,52,70)");
        for (let q = L0; q < 16 - R0; q += 4 + (rnd() * 3 | 0)) px(X + q, Y + 6, 1, 4, "rgb(44,44,60)");
        px(X + L0, Y + 10, 16 - L0 - R0, 1, "rgb(76,171,211)"); px(X + L0, Y + 11, 16 - L0 - R0, 1, "rgb(74,160,203)"); px(X + L0, Y + 12, 16 - L0 - R0, 2, "rgb(67,128,179)");
      }
      if (!w) { for (let k = 0; k < 5; k++) px(X + k, Y, 1, 16, FR[k]); px(X + 5, Y + (n ? 0 : 10), 1, n ? 16 - B0 : 6 - B0, "rgb(76,171,211)") }
      if (!e) { for (let k = 0; k < 5; k++) px(X + 15 - k, Y, 1, 16, FR[k]); px(X + 10, Y + (n ? 0 : 10), 1, n ? 16 - B0 : 6 - B0, "rgb(76,171,211)") }
      if (!s_) { for (let k = 0; k < 5; k++) px(X, Y + 15 - k, 16, 1, FR[k]); px(X + L0, Y + 10, 16 - L0 - R0, 1, "rgb(76,171,211)") }
      // chanfro nos cantos da moldura
      const bev = (sx, sy, dx, dy) => { for (let k = 0; k < 5; k++) px(sx + dx * k, sy + dy * k, 1, 1, "rgb(89,93,115)") };
      if (!n && !w) bev(X, Y, 1, 1); if (!n && !e) bev(X + 15, Y, -1, 1); if (!s_ && !w) bev(X, Y + 15, 1, -1); if (!s_ && !e) bev(X + 15, Y + 15, -1, -1);
      // cantos de dentro (terra só na diagonal): pedacinho da moldura
      const nw = Wt(c - 1, r - 1), ne = Wt(c + 1, r - 1), sw = Wt(c - 1, r + 1), se = Wt(c + 1, r + 1);
      if (n && w && !nw) px(X, Y, 5, 5, "rgb(146,153,192)"); if (n && e && !ne) px(X + 11, Y, 5, 5, "rgb(146,153,192)");
      if (s_ && w && !sw) px(X, Y + 11, 5, 5, "rgb(146,153,192)"); if (s_ && e && !se) px(X + 11, Y + 11, 5, 5, "rgb(146,153,192)");
    }
  }
  // superfícies de piso mais escuro como no pack: manchas de contorno arredondado e irregular,
  // encostadas nas paredes e cantos, cor (92,105,127) com contorno (71,83,98) só à direita e embaixo
  {
    const PW = C * 16, PH = R * 16, mask = new Uint8Array(PW * PH);
    const okCell = (x, y) => plain.has(x + "," + y);
    const blob = (x0, y0, w, h, rad) => {
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
        if (x < 0 || y < 0 || x >= PW || y >= PH) continue;
        const dx = Math.max(x0 + rad - x, 0, x - (x0 + w - 1 - rad)), dy = Math.max(y0 + rad - y, 0, y - (y0 + h - 1 - rad));
        if (dx * dx + dy * dy <= rad * rad) mask[y * PW + x] = 1;
      }
    };
    for (const rm of rooms) {
      const q = rm.rect; if (!q || rm.interior) continue;
      const n = 1 + (rnd() * 2 | 0);
      for (let k = 0; k < n; k++) {
        // ancorada numa parede ou canto da sala, com 2 a 4 lóbulos
        const side = rnd() * 4 | 0, len = (3 + rnd() * Math.min(7, Math.max(q.w, q.h) - 3)) * 16, dep = (2 + rnd() * 2.5) * 16;
        let x0, y0, w, h;
        if (side === 0) { w = len; h = dep; x0 = (q.x + rnd() * Math.max(1, q.w - len / 16)) * 16; y0 = (q.y + .2) * 16 }
        else if (side === 1) { w = len; h = dep; x0 = (q.x + rnd() * Math.max(1, q.w - len / 16)) * 16; y0 = (q.y + q.h) * 16 - dep - 3 }
        else if (side === 2) { w = dep; h = len; x0 = (q.x + .2) * 16; y0 = (q.y + rnd() * Math.max(1, q.h - len / 16)) * 16 }
        else { w = dep; h = len; x0 = (q.x + q.w) * 16 - dep - 3; y0 = (q.y + rnd() * Math.max(1, q.h - len / 16)) * 16 }
        blob(x0 | 0, y0 | 0, w | 0, h | 0, 5 + (rnd() * 4 | 0));
        for (let l = 0; l < 2 + (rnd() * 3 | 0); l++) { const lw = 18 + rnd() * 30, lh = 14 + rnd() * 22; blob((x0 + rnd() * (w - lw * .5)) | 0, (y0 + rnd() * (h - lh * .5)) | 0, lw | 0, lh | 0, 6 + (rnd() * 5 | 0)) }
      }
    }
    // borda dentada em degraus de 1 px e recorte nas células que não são piso liso
    const cv = document.createElement("canvas"); cv.width = PW; cv.height = PH; const cg = cv.getContext("2d"), id = cg.createImageData(PW, PH), O = id.data;
    // recorta onde não é piso liso e arredonda os cantos do recorte (abertura morfológica de raio 3)
    for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) if (mask[y * PW + x] && !okCell(x >> 4, y >> 4)) mask[y * PW + x] = 0;
    const morph = (src, keepIf) => { const o = new Uint8Array(PW * PH); for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) { let cnt = 0, tot = 0; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { if (dx * dx + dy * dy > 10) continue; tot++; const X = x + dx, Y = y + dy; if (X >= 0 && Y >= 0 && X < PW && Y < PH && src[Y * PW + X]) cnt++ } o[y * PW + x] = keepIf(cnt, tot) ? 1 : 0 } return o };
    const er = morph(mask, (c, t) => c === t), op = morph(er, (c) => c > 0);
    mask.set(op);
    const M_ = (x, y) => x >= 0 && y >= 0 && x < PW && y < PH && mask[y * PW + x];
    for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
      if (!M_(x, y)) continue;
      const i = (y * PW + x) * 4, edge = !M_(x + 1, y) || !M_(x, y + 1);
      const v = edge ? [71, 83, 98] : [92, 105, 127];
      O[i] = v[0]; O[i + 1] = v[1]; O[i + 2] = v[2]; O[i + 3] = 255;
    }
    cg.putImageData(id, 0, 0);
    g.drawImage(cv, 0, 0, PW, PH, 0, 0, PW * 2, PH * 2);
    // marcas de tijolo do pack por cima de algumas células
    for (const k of plain) {
      const [c, r] = k.split(",").map(Number); let hit = !1;
      for (let y = r * 16 - 2; y < r * 16 + 18 && !hit; y += 2) for (let x = c * 16 - 2; x < c * 16 + 18; x += 2) if (M_(x, y)) { hit = !0; break }
      if (!hit && rnd() < .08) tile(pick([284, 285, 297, 298]), c, r);
    }
  }
  // sombra ao pé das paredes
  for (let r = 1; r < R; r++) for (let c = 0; c < C; c++) {
    if (!F(c, r) || F(c, r - 1)) continue;
    const q = g.createLinearGradient(0, r * T, 0, r * T + 14); q.addColorStop(0, "rgba(10,8,20,.45)"); q.addColorStop(1, "rgba(10,8,20,0)"); g.fillStyle = q; g.fillRect(c * T, r * T, T, 14);
  }
  // decoração das paredes: arcos, portas, grades e nichos (2x2 nas duas fileiras de baixo)
  const niches = [];
  const occupied = new Set((B.level.doors || []).map((d) => d.col + "," + d.row));
  for (let r = 1; r < R; r++) {
    let run = 0;
    for (let c = 0; c <= C; c++) {
      const ok = c < C && fc(c, r) === 1 && fc(c, r - 1) === 2;
      if (ok) { run++; continue }
      if (run >= 5) {
        const c0 = c - run;
        for (let x = c0 + 1 + (rnd() * 2 | 0); x + 1 < c - 1; x += 4 + (rnd() * 4 | 0)) {
          if (rnd() < .3) continue;
          const kind = pick([276, 276, 278, 280, 282, 282, 250, 254]);
          tile(kind, x, r - 1); tile(kind + 1, x + 1, r - 1); tile(kind + 13, x, r); tile(kind + 14, x + 1, r);
          if (kind === 282 || kind === 250) niches.push([(x + 1) * T, r * T + T - 6]);
        }
      }
      run = 0;
    }
  }
  // topo das paredes desmoronado e entulho ao pé delas
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const f = face[r * C + c];
    if (f === 3 || (f === 2 && fc(c, r - 1) === 0)) {
      g.fillStyle = "rgb(29,28,43)"; let x = c * T;
      for (let k = 0; k < 8; k++) { const h = rnd() < .45 ? (2 + (rnd() * 4 | 0)) * 2 : 0; h && g.fillRect(x + k * 4, r * T, 4, h) }
    }
    if (f === 1 && rnd() < .3) {
      const n = 2 + (rnd() * 4 | 0), y0 = (r + 1) * T;
      for (let k = 0; k < n; k++) { const s2 = 2 + (rnd() * 3 | 0) * 2, x = c * T + rnd() * 28, y = y0 + 2 + rnd() * 8; g.fillStyle = rnd() < .5 ? "rgb(92,90,118)" : "rgb(66,64,88)"; g.fillRect(x | 0, y | 0, s2, s2 - 2); g.fillStyle = "rgb(128,128,160)"; g.fillRect(x | 0, y | 0, s2, 2) }
    }
  }
  tx.refresh();
  S.add.image(0, 0, key).setOrigin(0).setDepth(-2);
  // névoa densa e fria correndo pelo chão do templo
  try {
    __gyFogTex(S);
    const fa = S.add.tileSprite(0, 0, C * T, R * T, "gy-fog").setOrigin(0).setDepth(.9).setAlpha(.07).setTint(0x7c84ae).setTileScale(2.4);
    const fb = S.add.tileSprite(0, 0, C * T, R * T, "gy-fog").setOrigin(0).setDepth(8990).setAlpha(0).setTint(0x8088b0).setTileScale(3.6);
    const fc2 = S.add.tileSprite(0, 0, C * T, R * T, "gy-fog").setOrigin(0).setDepth(.95).setAlpha(0).setTint(0x9aa2c8).setTileScale(1.4).setFlipY(!0);
    // o vazio escuro fica por cima da névoa (borda suave), para a névoa só correr pelo chão
    const vk = key + "-v", vc = S.textures.createCanvas(vk, C * T, R * T), vg = vc.getContext();
    const sm = document.createElement("canvas"); sm.width = C * 2; sm.height = R * 2; const sg = sm.getContext("2d");
    sg.fillStyle = "rgb(29,28,43)";
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (W(c, r) && !face[r * C + c]) sg.fillRect(c * 2, r * 2, 2, 2);
    vg.imageSmoothingEnabled = !0; vg.imageSmoothingQuality = "high"; vg.drawImage(sm, 0, 0, C * 2, R * 2, 0, 0, C * T, R * T); vc.refresh();
    S.add.image(0, 0, vk).setOrigin(0).setDepth(.97);
    S.events.once("shutdown", () => { S.textures.exists(vk) && S.textures.remove(vk) });
    const dr = (t, ms) => { const k = ms / 1000; fa.tilePositionX += 4 * k; fa.tilePositionY += 1 * k; fb.tilePositionX -= 2.5 * k; fc2.tilePositionX += 7 * k; fc2.tilePositionY -= 1.4 * k; fa.setAlpha(.06 + Math.sin(t / 5600) * .02) };
    S.events.on("update", dr); S.events.once("shutdown", () => S.events.off("update", dr));
  } catch (e) {}
  B.groundLayer?.setVisible(!1); B.wallLayer?.setVisible(!1);
  S.cameras.main.setBackgroundColor("rgb(29,28,43)");
  S.events.once("shutdown", () => { S.textures.exists(key) && S.textures.remove(key) });
  __tpProps(S, B, M, niches, special);
  return !0;
}
/* ─── objetos, chamas, água viva e baús do pack ─── */
function __tpProps(S, B, M, niches, special) {
  const T = dt, TX = S.textures.get("tpd-atlas");
  for (const [k, q] of Object.entries(M.props)) TX.has(k) || TX.add(k, 0, q[0], q[1], q[2], q[3]);
  for (const [k, q] of Object.entries(M.fire)) for (let f = 0; f < q[4]; f++) TX.has(`fire-${k}-${f}`) || TX.add(`fire-${k}-${f}`, 0, q[0], q[1] + f * 48, q[2], 48);
  const ch = M.chest; for (let f = 0; f < ch[4]; f++) TX.has("chest-" + f) || TX.add("chest-" + f, 0, ch[0] + f * 32, ch[1], 32, 32);
  for (const k of Object.keys(M.fire)) S.anims.exists("tpf-" + k) || S.anims.create({ key: "tpf-" + k, frames: Array.from({ length: 6 }, (_, f) => ({ key: "tpd-atlas", frame: `fire-${k}-${f}` })), frameRate: 9, repeat: -1 });
  S.anims.exists("tp-chest-open") || S.anims.create({ key: "tp-chest-open", frames: Array.from({ length: 5 }, (_, f) => ({ key: "tpd-atlas", frame: "chest-" + f })), frameRate: 12, repeat: 0 });
  const SQ = [], solid = (x, y, w, h) => SQ.push([x, y, w, h]);
  const fire = (k, x, y, solidIt = !0) => {
    const s = S.add.sprite(x, y, "tpd-atlas", `fire-${k}-0`).setOrigin(.5, 1).setScale(2).setDepth(y).play("tpf-" + k); s.anims.setProgress(Math.random());
    const rad = k === "big" ? 150 : k === "bowl" ? 110 : k === "small" ? 90 : 60;
    S.lighting?.addLight?.({ x, y: y - 30, radius: rad, flicker: .35, color: 16753450, warm: !0 });
    const gl = S.add.image(x, y - 34, "light").setBlendMode(j.BlendModes.ADD).setTint(0xffb050).setScale(rad / 520).setAlpha(.35).setDepth(y + 1);
    S.tweens.add({ targets: gl, alpha: .18, duration: 380 + Math.random() * 300, yoyo: !0, repeat: -1 });
    solidIt && k !== "candle" && solid(x, y - 14, k === "big" ? 60 : 36, 22);
  };
  for (const rm of B.level.rooms || []) for (const [k, c, r, sol] of rm.tp || []) {
    const x = c * T + 16, y = (r + 1) * T - 2;
    if (M.fire[k]) { fire(k, x, y, sol !== !1); continue }
    const q = M.props[k]; if (!q) continue;
    if (special.get(c + "," + r) === "water") continue;
    const o = S.add.image(x, y, "tpd-atlas", k).setOrigin(.5, 1).setScale(2).setDepth(k === "hatch" ? 0.95 : y);
    if (sol !== !1 && !/^gold|hatch|ladder/.test(k)) solid(x, y - Math.min(q[3], 14), q[2] * 2 - 6, Math.min(q[3] * 2, 26));
  }
  // velas nos nichos das paredes
  for (const [x, y] of niches) fire("candle", x, y + 2, !1);
  // água viva: manchas de reflexo que derivam devagar e brilhos piscando na linha d'água
  {
    const mk = (key, w, h, draw) => { if (S.textures.exists(key)) return; const cv = S.textures.createCanvas(key, w, h), x = cv.getContext(); draw(x); cv.refresh() };
    for (let v = 0; v < 3; v++) mk("tpw-rip" + v, 24, 8, (x) => {
      x.fillStyle = "rgb(72,149,195)"; const L = [[4, 0, 12], [1, 1, 20], [0, 2, 24], [2, 3, 18], [6, 4, 10]];
      for (const [a, y, w] of L) x.fillRect(a + (v * 2) % 5, y, w - v * 2, 1);
      x.fillStyle = "rgb(100,190,230)"; x.fillRect(9 + v, 2, 4, 1); x.fillStyle = "rgb(190,235,250)"; x.fillRect(10 + v, 2, 1, 1);
    });
    mk("tpw-spark", 2, 1, (x) => { x.fillStyle = "rgb(200,240,255)"; x.fillRect(0, 0, 2, 1) });
    const cells = [...special].filter(([, v]) => v === "water").map(([k]) => k.split(",").map(Number));
    // reflexos do próprio pack: grupos de ladrilhos animados copiados do mapa de exemplo
    const WD = M.wdet, WS = M.sheets.water_details;
    if (WD && WS) {
      for (const [k, fr] of Object.entries(WD.anim)) {
        const ids = fr.length ? fr : [+k];
        for (const id of ids) TX.has("wd-" + id) || TX.add("wd-" + id, 0, WS[0] + (id % WD.cols) * 16, WS[1] + (id / WD.cols | 0) * 16, 16, 16);
        S.anims.exists("wd-a-" + k) || S.anims.create({ key: "wd-a-" + k, frames: ids.map((id) => ({ key: "tpd-atlas", frame: "wd-" + id })), frameRate: 6.6, repeat: -1 });
      }
      for (const gp of WD.groups) for (const [, , id] of gp) TX.has("wd-" + id) || TX.add("wd-" + id, 0, WS[0] + (id % WD.cols) * 16, WS[1] + (id / WD.cols | 0) * 16, 16, 16);
      const isW = (c, r) => special.get(c + "," + r) === "water", used = new Set();
      const order = cells.slice().sort(() => Math.random() - .5);
      for (const [c0, r0] of order) {
        const gp = WD.groups[Math.random() * WD.groups.length | 0];
        if (!gp.every(([dx, dy]) => isW(c0 + dx, r0 + dy) && isW(c0 + dx, r0 + dy - 1) && !used.has((c0 + dx) + "," + (r0 + dy)))) continue;
        for (const [dx, dy, id] of gp) {
          used.add((c0 + dx) + "," + (r0 + dy));
          const o = S.add.sprite((c0 + dx) * T, (r0 + dy) * T, "tpd-atlas", "wd-" + ((WD.anim[id] || [id])[0])).setOrigin(0).setScale(2).setDepth(.955);
          WD.anim[id] && o.play("wd-a-" + id);
        }
      }
    }
    const shore = cells.filter(([c, r]) => special.get(c + "," + (r - 1)) !== "water");
    for (const [c, r] of shore) for (let k = 0; k < 2; k++) {
      const sp = S.add.image(c * T + 2 + Math.random() * 26 | 0, r * T + 10, "tpw-spark").setOrigin(0).setScale(2).setDepth(.956).setAlpha(0);
      S.tweens.add({ targets: sp, alpha: 1, duration: 220, yoyo: !0, repeat: -1, delay: Math.random() * 4000, repeatDelay: 1800 + Math.random() * 3200 });
    }
  }
  // baús do jogo com a arte do pack (os objetos são criados depois das paredes)
  S.events.once("update", () => { const G = B.solids || S.dungeon?.solids; if (G) for (const [x, y, w, h] of SQ) { const b = G.create(x, y, "rock"); b.setVisible(!1).setDisplaySize(w, h); b.refreshBody?.() } __tpChests(S, B) });
}
function __tpChests(S, B) {
  const chests = (B.objects || S.dungeon?.objects || []).filter((o) => o?.texture && /^chest/.test(o.texture.key));
  for (const o of chests) {
    const a = S.add.sprite(o.x, o.y + o.displayHeight / 2, "tpd-atlas", "chest-0").setOrigin(.5, 1).setScale(2).setDepth(o.depth + .1);
    o.setAlpha(0.001);
    let was = !!o.opened; if (was) a.setFrame("chest-4");
    const U = () => { if (!o.scene || !a.active) { S.events.off("update", U); return } if (o.opened && !was) { was = !0; a.play("tp-chest-open") } };
    S.events.on("update", U); S.events.once("shutdown", () => S.events.off("update", U));
  }
}
{
  const BW = _l.prototype.buildWallVisuals;
  _l.prototype.buildWallVisuals = function () {
    if (this.level?.theme?.id === "templo") { try { if (__tpBake(this)) return } catch (e) { console.warn("[templo]", e) } }
    return BW.apply(this, arguments);
  };
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try { const L = this.load, op = L.path; L.setPath(""); this.textures.exists("tpd-atlas") || L.image("tpd-atlas", "assets/pixel-art/temple/tpd-atlas.png"); L.json("tpd-atlas", "assets/pixel-art/temple/tpd-atlas.json"); L.setPath(op) } catch (e) {}
    return r;
  };
  // vencido o Tengu, a Guardiã traz o herói de volta
  const HS = __hubSetup;
  __hubSetup = function (S) {
    const r = HS.apply(this, arguments);
    try {
      if (S.levelId !== "templo") return r;
      const on = (b) => {
        if (b?.typeKey !== "RIVER_TENGU") return;
        S.time.delayedCall(2600, () => S.scene.isActive() && __dlg(S, [{ who: "guardia", expr: "smile", name: __GN, text: "O templo está em silêncio outra vez. Venha, vou te trazer de volta." }], () => __goLevel(S, "forest", { hubReturn: !0, fromLevel: "templo" })));
      };
      S.game.events.on("boss:defeated", on); S.events.once("shutdown", () => S.game.events.off("boss:defeated", on));
    } catch (e) {}
    return r;
  };
}
window.__dgTP = __TP;
