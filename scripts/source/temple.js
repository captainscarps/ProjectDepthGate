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
        walls: [{ x: 47, y: 33, w: 6, h: 4, water: !0 }, { x: 54, y: 37, w: 4, h: 3, water: !0 }],
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
      const l = !F(c - 1, r) && !SP(c - 1, r) && !fc(c - 1, r), rr = !F(c + 1, r) && !SP(c + 1, r) && !fc(c + 1, r), b = !F(c, r + 1) && !SP(c, r + 1);
      let t = 79;
      if (sp === "plat") { const u = SP(c, r - 1) === "plat", d = SP(c, r + 1) === "plat", lf = SP(c - 1, r) === "plat", rt = SP(c + 1, r) === "plat"; t = [[65, 66, 67], [78, 79, 80], [91, 92, 93]][!u ? 0 : !d ? 2 : 1][!lf ? 0 : !rt ? 2 : 1] }
      else if (b && l) t = 91; else if (b && rr) t = 93; else if (b) t = 92; else if (l) t = 78; else if (rr) t = 80;
      tile(t, c, r);
      if (!sp && t === 79 && rnd() < .055) tile(pick([284, 285, 297, 298]), c, r);
      if (sp === "plat" && SP(c, r + 1) !== "plat") { tile(53, c, r, 0, 10, 16, 6, 0, 10) }
      continue;
    }
    if (sp === "water") continue;
    const f = face[r * C + c];
    if (f) {
      const L = fc(c - 1, r) === f, Rt = fc(c + 1, r) === f;
      const base = f === 1 ? 52 : f === 2 ? 39 : 26;
      tile(base + (!L ? 0 : !Rt ? 2 : 1), c, r);
      continue;
    }
    // vazio: bordas onde encosta no piso
    const up = F(c, r - 1) || SP(c, r - 1) === "plat", lf = F(c - 1, r), rt = F(c + 1, r);
    if (up && lf) tile(0, c, r); else if (up && rt) tile(2, c, r); else if (up) tile(1, c, r);
    else if (lf) tile(13, c, r); else if (rt) tile(15, c, r);
  }
  // água: poça funda com borda de pedra, brilho animado depois
  for (const [k, v] of special) {
    if (v !== "water") continue;
    const [c, r] = k.split(",").map(Number), x = c * T, y = r * T;
    const top = SP(c, r - 1) !== "water", lf = SP(c - 1, r) !== "water", rt = SP(c + 1, r) !== "water", bt = SP(c, r + 1) !== "water";
    g.fillStyle = top ? "rgb(36,72,128)" : "rgb(63,112,166)"; g.fillRect(x, y, T, T);
    if (top) { const q = g.createLinearGradient(0, y, 0, y + T); q.addColorStop(0, "rgb(30,52,92)"); q.addColorStop(1, "rgb(63,112,166)"); g.fillStyle = q; g.fillRect(x, y, T, T) }
    g.fillStyle = "rgb(161,165,216)";
    top && g.fillRect(x, y, T, 3); lf && g.fillRect(x, y, 3, T); rt && g.fillRect(x + T - 3, y, 3, T); bt && g.fillRect(x, y + T - 3, T, 3);
    g.fillStyle = "rgba(120,190,240,.55)"; rnd() < .5 && g.fillRect(x + 6 + rnd() * 14 | 0, y + 10 + rnd() * 14 | 0, 8, 2);
  }
  // manchas de piso mais escuro, de contorno suave (desenhadas pequenas e ampliadas com suavização)
  {
    const sm = document.createElement("canvas"); sm.width = C * 4; sm.height = R * 4; const sg = sm.getContext("2d");
    sg.fillStyle = "rgba(40,46,74,1)";
    for (const rm of rooms) {
      const q = rm.rect; if (!q) continue;
      for (let k = 0; k < 2; k++) {
        const w = 3 + (rnd() * 3 | 0), h = 2 + (rnd() * 2 | 0), x = q.x + (rnd() * Math.max(1, q.w - w) | 0), y = q.y + 1 + (rnd() * Math.max(1, q.h - h - 1) | 0);
        for (let b = 0; b < 10; b++) { sg.beginPath(); sg.arc((x + rnd() * w) * 4, (y + rnd() * h) * 4, (.6 + rnd() * .8) * 4, 0, 7); sg.fill() }
      }
    }
    g.save(); g.globalAlpha = .16; g.imageSmoothingEnabled = !0; g.imageSmoothingQuality = "high";
    g.filter = "blur(6px)"; g.drawImage(sm, 0, 0, C * 4, R * 4, 0, 0, C * T, R * T); g.filter = "none"; g.restore(); g.imageSmoothingEnabled = !1;
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
    const fa = S.add.tileSprite(0, 0, C * T, R * T, "gy-fog").setOrigin(0).setDepth(.9).setAlpha(.42).setTint(0x7c84ae).setTileScale(2.4);
    const fb = S.add.tileSprite(0, 0, C * T, R * T, "gy-fog").setOrigin(0).setDepth(8990).setAlpha(.11).setTint(0x8088b0).setTileScale(3.6);
    const fc2 = S.add.tileSprite(0, 0, C * T, R * T, "gy-fog").setOrigin(0).setDepth(.95).setAlpha(.26).setTint(0x9aa2c8).setTileScale(1.4).setFlipY(!0);
    // o vazio escuro fica por cima da névoa (borda suave), para a névoa só correr pelo chão
    const vk = key + "-v", vc = S.textures.createCanvas(vk, C * T, R * T), vg = vc.getContext();
    const sm = document.createElement("canvas"); sm.width = C * 2; sm.height = R * 2; const sg = sm.getContext("2d");
    sg.fillStyle = "rgb(29,28,43)";
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (W(c, r) && !face[r * C + c]) sg.fillRect(c * 2, r * 2, 2, 2);
    vg.imageSmoothingEnabled = !0; vg.imageSmoothingQuality = "high"; vg.drawImage(sm, 0, 0, C * 2, R * 2, 0, 0, C * T, R * T); vc.refresh();
    S.add.image(0, 0, vk).setOrigin(0).setDepth(.97);
    S.events.once("shutdown", () => { S.textures.exists(vk) && S.textures.remove(vk) });
    const dr = (t, ms) => { const k = ms / 1000; fa.tilePositionX += 4 * k; fa.tilePositionY += 1 * k; fb.tilePositionX -= 2.5 * k; fc2.tilePositionX += 7 * k; fc2.tilePositionY -= 1.4 * k; fa.setAlpha(.38 + Math.sin(t / 5600) * .06) };
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
    const o = S.add.image(x, y, "tpd-atlas", k).setOrigin(.5, 1).setScale(2).setDepth(k === "hatch" ? 0.95 : y);
    if (sol !== !1 && !/^gold|hatch|ladder/.test(k)) solid(x, y - Math.min(q[3], 14), q[2] * 2 - 6, Math.min(q[3] * 2, 26));
  }
  // velas nos nichos das paredes
  for (const [x, y] of niches) fire("candle", x, y + 2, !1);
  // água viva: reflexos que correm
  for (const [k, v] of special) {
    if (v !== "water" || Math.random() > .5) continue;
    const [c, r] = k.split(",").map(Number), x = c * T + 6 + Math.random() * 20, y = r * T + 8 + Math.random() * 18;
    const s = S.add.rectangle(x, y, 6 + Math.random() * 8, 2, 0xbfe6ff, .7).setDepth(.96).setAlpha(0);
    S.tweens.add({ targets: s, alpha: .75, x: x + 6, duration: 900 + Math.random() * 900, yoyo: !0, repeat: -1, delay: Math.random() * 2000, repeatDelay: Math.random() * 1500 });
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
