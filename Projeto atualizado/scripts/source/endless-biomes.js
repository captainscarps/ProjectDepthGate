/* ══ Cenários do modo infinito ══
   - baús de recompensa (elite, desafio, chefe) nunca viram mímico
   - sequência de salas: sem duas salas do mesmo tipo seguidas, sem duas salas vazias seguidas
     (filler de combate entre elas) e sem a mesma planta duas vezes seguidas
   - sem armadilhas nem poças que ferem nas salas geradas
   - biomas novos: Deserto Esquecido (edesert), Vulcão de Cinzas (evulcao) e Salões de Valdrak (ecastelo,
     peças do pack do castelo em assets/pixel-art/endless/exc-atlas.*, scripts/build_endless_castle.py)
   Ganchos de texto no pacote: scripts/patch_endless_biomes.py */

/* 1) baús de recompensa sem mímico */
Sd.prototype.spawnRewardChest = function (i, t, e) {
  const d = Math.floor(i / dt), o = Math.floor(t / dt) + 1, a = new ms(this, { type: "chest", col: d, row: o, tier: e, noMimic: !0, reward: !0 }, this.dungeon.solids);
  this.dungeon.objects.push(a), this.effects.burstTinted(a.x, a.y, 16765514, 16), this.effects.shockwaveRing(a.x, a.y, 30);
};

/* 2) sequência de salas */
const __exQUIET = new Set(["START", "TREASURE", "SHRINE", "SHOP", "EVENT", "SECRET", "PUZZLE", "REST", "MERCHANT"]);
let __exLastGeo = null;
function __exHosts(g, l) {
  const all = g.slice(1, -1), fight = all.filter(k => !__exQUIET.has(l[k]?.type));
  return fight.length ? fight : all;
}
{
  const FD0 = fd;
  fd = function (c, i, nextPath) {
    __exLastGeo = null;
    const r = FD0(c, i, nextPath), m = r.main, end = m[m.length - 1];
    const mid = m.slice(1, -1), Q = mid.filter(t => __exQUIET.has(t)), F = mid.filter(t => !__exQUIET.has(t));
    // o tipo pedido pelo caminho escolhido (loja, enigma, pacto) fica; o resto das salas calmas, no máximo 3
    const keep = nextPath === "shop" ? "SHOP" : nextPath === "puzzle" ? "PUZZLE" : nextPath === "pact" ? "EVENT" : null;
    while (Q.length > 3) { const k = Q.findIndex(t => t !== keep); Q.splice(k < 0 ? Q.length - 1 : k, 1) }
    // F sem tipos iguais vizinhos: intercala COMBAT com os outros
    const fill = ["COMBAT", "CHALLENGE"];
    while (F.length < Q.length) F.push(fill[F.length % 2]);
    if (!F.length) F.push("COMBAT");
    const out = ["START"];
    let fi = 0, qi = 0;
    while (fi < F.length || qi < Q.length) {
      if (fi < F.length) out.push(F[fi++]);
      if (qi < Q.length) out.push(Q[qi++]);
    }
    // limpa repetições vizinhas que sobrarem (ex.: COMBAT,COMBAT)
    const seq = [out[0]];
    for (let k = 1; k < out.length; k++) {
      const t = out[k], p = seq[seq.length - 1];
      if (t === p) { if (!__exQUIET.has(t)) { seq.push(t === "COMBAT" ? "CHALLENGE" : "COMBAT"); continue } continue }
      seq.push(t);
    }
    if (seq[seq.length - 1] === end) seq.push(end === "BOSS" ? "COMBAT" : "CHALLENGE");
    seq.push(end);
    // ramos laterais calmos só se ligam a salas com luta (__exHosts) — SECRET tem um guardião elite
    return { main: seq, branches: r.branches };
  };
  const JI0 = ji;
  ji = function (c, t) {
    let n = JI0(c, t);
    for (let k = 0; k < 6 && t !== "BOSS" && __exLastGeo && n.template === __exLastGeo.template && (n.template !== "RECTANGLE" || Math.abs(n.w - __exLastGeo.w) + Math.abs(n.h - __exLastGeo.h) < 3); k++) n = JI0(c, t);
    __exLastGeo = n;
    return n;
  };
  const MD0 = md;
  md = function (c) {
    const L = MD0(c);
    try { __exPost(L) } catch (e) { console.warn("[endless-biomes]", e) }
    return L;
  };
}
function __exPost(L) {
  if (!L?.rooms) return;
  const used = new Set();
  for (const rm of L.rooms) {
    // sem armadilhas e sem poças de lava que ferem
    rm.decor = (rm.decor || []).filter(d => d && !/^trap-/.test(d.type || "") && d.type !== "lava-pool");
    // nomes sem repetir no mesmo andar
    if (rm.roomType === "BOSS") continue;
    if (used.has(rm.name)) {
      const pool = (Tr[rm.roomType] || Tr.COMBAT).filter(n => !used.has(n));
      if (pool.length) rm.name = pool[Math.floor(me(rm.rect.x, rm.rect.y) * pool.length)];
      else { let k = 2; while (used.has(`${rm.name} ${["", "", "II", "III", "IV", "V", "VI"][k] || k}`)) k++; rm.name = `${rm.name} ${["", "", "II", "III", "IV", "V", "VI"][k] || k}` }
    }
    used.add(rm.name);
  }
}

/* 3) biomas novos */
Ls.edesert = { ...Kn, id: "edesert", name: "Deserto Esquecido", tilesetKey: "tiles-ruins",
  palette: { ...Kn.palette, stoneBase: 85, gold: 16766720, goldBright: 16773530, fire: 16752688 },
  lights: { ...Kn.lights, PLAYER: { ...Kn.lights.PLAYER, radius: 200 } }, music: { explore: "ruins-ambience", boss: "boss-ambience" } };
Ls.evulcao = { ...$n, id: "evulcao", name: "Vulcão de Cinzas", tilesetKey: "tiles-fortress" };
Ls.ecastelo = { ...Xn, id: "ecastelo", name: "Salões de Valdrak", tilesetKey: "tiles-ecastle", music: { explore: "catacombs-ambience", boss: "boss-ambience" } };
Object.assign(ud, { edesert: "Deserto Esquecido", evulcao: "Vulcão de Cinzas", ecastelo: "Salões de Valdrak" });
try {
  Object.assign(_s, { "biome.edesert": "Forgotten Desert", "biome.evulcao": "Ash Volcano", "biome.ecastelo": "Halls of Valdrak" });
  Object.assign(Io, { "biome.edesert": "Desierto Olvidado", "biome.evulcao": "Volcán de Ceniza", "biome.ecastelo": "Salones de Valdrak" });
} catch (e) {}
{
  const B = { edesert: "ruins", evulcao: "fortress", ecastelo: "ecastle" };
  for (const g of Object.values(ga)) for (const [n, b] of Object.entries(B)) g.biomes.includes(b) && !g.biomes.includes(n) && g.biomes.push(n);
  for (const [n, b] of Object.entries(B)) js[n] ??= js[b];
  Object.assign(ed, {
    edesert: { wallTop: [], onWall: [], solid: ["ds-boulder3", "ds-boulder4", "ds-boulder5", "ds-cactus4", "ds-cactus2"], flat: ["ds-skull"], lightExtra: [] },
    evulcao: { wallTop: [], onWall: [], solid: ["vc-mp-rock-cluster", "vc-obsidian1", "vc-obsidian2", "vc-mp-magma-rock", "vc-boulder2", "vc-mp-crystal1"], flat: ["vc-mp-titan-skull", "vc-remains", "vc-sulfur"], lightExtra: ["fire-crystal"] },
    ecastelo: { wallTop: ["torch"], onWall: ["banner"], solid: ["cf-p-knight", "cf-p-urns", "cf-p-pillar-short", "cf-p-gargoyle", "cf-p-angel", "cf-p-halberds", "cf-p-candles"], flat: ["cf-p-rubble-s", "cf-p-stones", "bones"], lightExtra: ["candle"] },
  });
}
/* ordem dos biomas: 2 profundidades cada; depois do ciclo, sorteio sem repetir o anterior */
const __exCYCLE = ["catacombs", "ruins", "edesert", "ebosque", "frozen", "erio", "evulcao", "fortress", "emorta", "ecastelo", "ecastle", "graveyard"];
pr = function (c, i) {
  const cyc = Math.floor((Math.max(1, c) - 1) / 2);
  if (cyc < __exCYCLE.length) return __exCYCLE[cyc];
  let prev = __exCYCLE[__exCYCLE.length - 1], d = prev;
  for (let k = __exCYCLE.length; k <= cyc; k++) {
    const n = __exCYCLE.filter(h => h !== prev);
    d = n[Math.floor(new $e(`${i}:biome_cycle2:${k}`).random() * n.length)];
    prev = d;
  }
  return d;
};
{
  const VR0 = vr;
  vr = function (c, i, b) {
    const k = { evulcao: "MAGMA_TITAN", edesert: "ANCIENT_COLOSSUS", ecastelo: "CASTLE_LORD" }[b];
    if (k && Yt[k] && (c < 12 || i.chance(.7))) return k;
    return VR0(c, i, b);
  };
}
/* deserto e vulcão: cenário aberto pintado pelo __ekBake */
__EK2.edesert = { under: [168, 122, 72], f: [[212, 174, 116], [224, 188, 130], [234, 202, 146]], dirt: [194, 148, 94], dark: [92, 60, 34],
  tr: ["ds-cactus", "ds-cactus2", "ds-cactus3", "ds-deadtree", "ds-deadtree2", "ds-deadtree3", "ds-boulder", "ds-boulder2", "ds-rockpile", "ds-cactus", "ds-boulder4"],
  tu: [], bush: ["ds-cactus4", "ds-boulder3", "ds-boulder5", "ds-skull", "ds-log"] };
__EK2.evulcao = { under: [44, 24, 28], f: [[70, 52, 52], [82, 60, 58], [96, 70, 64]], dirt: [112, 56, 38], dark: [16, 7, 9],
  tr: ["vc-mp-tall-cone", "vc-mp-twin-cone", "vc-mp-spatter-cone", "vc-obsidian1", "vc-obsidian2", "vc-obsidian3", "vc-mp-column-single", "vc-mp-column-trio", "vc-mp-column-bundle", "vc-boulder1", "vc-boulder4", "vc-mp-rock-cluster", "vc-vent"],
  tu: ["vc-fx-crust1", "vc-fx-crust2", "vc-fx-crust3"], bush: ["vc-mp-ember-fern", "vc-mp-fire-succulent", "vc-mp-crystal1", "vc-mp-crystal2", "vc-sulfur", "vc-mp-ember-fern"] };

/* castelo: interior montado com as peças do pack */
let __excN = 0;
function __excBake(B) {
  const S = B.scene, M = S.cache.json.get("exc-atlas");
  if (!M || !S.textures.exists("exc-atlas")) return !1;
  const src = S.textures.get("exc-atlas").getSourceImage(), C = B.cols, R = B.rows, T = dt, key = "excb-" + ++__excN;
  const tx = S.textures.createCanvas(key, C * T, R * T), g = tx.getContext();
  g.imageSmoothingEnabled = !1;
  let sd = (String(B.level.seed ?? "v") + B.level.depth).split("").reduce((a, c) => a * 31 + c.charCodeAt(0) | 0, 7) >>> 0;
  const rnd = () => (sd = sd * 1664525 + 1013904223 >>> 0) / 4294967296, pick = a => a[rnd() * a.length | 0];
  const F = (c, r) => c >= 0 && r >= 0 && c < C && r < R && !B.isWallTile(c, r);
  const D = (q, x, y, sx = 0, sy = 0, sw = q[2], sh = q[3]) => g.drawImage(src, q[0] + sx, q[1] + sy, sw, sh, x, y, sw, sh);
  const kind = new Array(C * R).fill("grey"), rooms = B.level.rooms || [];
  for (const rm of rooms) {
    const t = rm.roomType, r = rm.rect;
    if (!r) continue;
    const k = t === "BOSS" || t === "ELITE" ? "maroon" : ["SHOP", "REST", "TREASURE", "MERCHANT"].includes(t) ? "wood" : ["SHRINE", "EVENT", "PUZZLE", "SECRET"].includes(t) ? "brown" : rnd() < .35 ? "brown" : "grey";
    rm.__exk = k;
    for (let y = r.y; y < r.y + r.h; y++) for (let x = r.x; x < r.x + r.w; x++) kind[y * C + x] = k;
  }
  g.fillStyle = "rgb(9,11,17)";
  g.fillRect(0, 0, C * T, R * T);
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) F(c, r) && D(pick(M.floor[kind[r * C + c]]), c * T, r * T);
  // lajotas grandes e tapetes
  for (const rm of rooms) {
    const r = rm.rect;
    if (!r) continue;
    if (rm.__exk === "grey") for (let y = r.y + 2; y < r.y + r.h - 3; y += 4) for (let x = r.x + 2; x < r.x + r.w - 3; x += 5)
      if (rnd() < .35 && F(x, y) && F(x + 1, y) && F(x, y + 1) && F(x + 1, y + 1)) D(M.big, x * T, y * T);
    if (rm.__exk === "maroon" && r.h >= 6) {
      const cx = r.x + Math.floor(r.w / 2), x0 = cx * T - 22, x1 = cx * T + 22, y0 = (r.y + 1) * T + 2, y1 = (r.y + r.h - 1) * T - 4;
      g.fillStyle = "rgb(92,22,26)"; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      g.fillStyle = "rgb(122,30,32)"; g.fillRect(x0 + 2, y0, x1 - x0 - 4, y1 - y0);
      g.fillStyle = "rgb(178,136,64)"; g.fillRect(x0 + 4, y0, 2, y1 - y0); g.fillRect(x1 - 6, y0, 2, y1 - y0);
      for (let yy = y0 + 18; yy < y1 - 10; yy += 30) {
        g.fillStyle = "rgb(150,44,40)"; g.beginPath(); g.moveTo(cx * T, yy - 8); g.lineTo(cx * T + 8, yy); g.lineTo(cx * T, yy + 8); g.lineTo(cx * T - 8, yy); g.closePath(); g.fill();
        g.strokeStyle = "rgb(178,136,64)"; g.lineWidth = 1; g.stroke();
      }
      g.fillStyle = "rgb(178,136,64)";
      for (let xx = x0 + 2; xx < x1 - 1; xx += 3) g.fillRect(xx, y1 + 1, 1, 3);
    }
  }
  // paredes: até 2 fileiras de tijolo + 1 de topo acima de cada borda superior de piso
  const face = new Int8Array(C * R);
  for (let x = 0; x < C; x++) for (let y = 1; y < R; y++) if (F(x, y) && !F(x, y - 1))
    for (const [k, v] of [[1, 1], [2, 1], [3, 2]]) { const yy = y - k; if (yy < 0 || F(x, yy)) break; face[yy * C + x] = v }
  const isBot = (x, y) => face[y * C + x] === 1 && (y + 1 >= R || face[(y + 1) * C + x] !== 1);
  const wallSpots = [];
  for (let y = 0; y < R; y++) for (let x = 0; x < C;) {
    if (!isBot(x, y)) { x++; continue }
    const x0 = x;
    while (x < C && isBot(x, y)) x++;
    for (let c = x0; c < x; c++) D(M.brick[c === x0 ? 0 : c === x - 1 ? 4 : 1 + (c - x0) % 3], c * T, (y - 1) * T);
    for (let c = x0 + 1; c < x - 1; c += 1) face[(y - 1) * C + c] === 1 && wallSpots.push([c, y]);
  }
  for (let y = 0; y < R; y++) for (let x = 0; x < C;) {
    if (face[y * C + x] !== 2) { x++; continue }
    const x0 = x;
    while (x < C && face[y * C + x] === 2) x++;
    for (let c = x0; c < x; c++) D(M.top[c === x0 ? 0 : c === x - 1 ? 4 : 1 + (c - x0) % 3], c * T, y * T);
  }
  // janelas, escudos e espadas nas paredes (sem encostar uns nos outros)
  const taken = new Set(), WN = Object.keys(M.wall), win = WN.filter(n => /^win|arch/.test(n)), arm = WN.filter(n => !/^win|arch|banner/.test(n));
  for (const [c, y] of wallSpots) {
    if (rnd() > .22 || taken.has(c - 1 + "," + y) || taken.has(c + "," + y) || taken.has(c - 2 + "," + y)) continue;
    const n = rnd() < .55 ? pick(win) : pick(arm), q = M.wall[n];
    if (q[3] > 60) continue;
    taken.add(c + "," + y);
    D(q, c * T + 16 - (q[2] >> 1), (y + 1) * T - 6 - q[3]);
  }
  // moldura do topo das paredes contornando o vazio
  const open = (c, r) => F(c, r) || (c >= 0 && r >= 0 && c < C && r < R && face[r * C + c] > 0);
  const fr = M.frame;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (open(c, r)) continue;
    open(c + 1, r) && D(fr.R, c * T + 18, r * T, 18, 0, 14, 32);
    open(c - 1, r) && D(fr.L, c * T, r * T, 0, 0, 14, 32);
    open(c, r + 1) && !face[(r + 1) * C + c] && D(fr.B, c * T, r * T + 18, 0, 18, 32, 14);
    F(c, r - 1) && D(fr.T, c * T, r * T, 0, 0, 32, 14);
  }
  // sombra ao pé das paredes e nas laterais
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (!F(c, r)) continue;
    if (!F(c, r - 1)) { const q = g.createLinearGradient(0, r * T, 0, r * T + 14); q.addColorStop(0, "rgba(0,0,0,.5)"); q.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = q; g.fillRect(c * T, r * T, T, 14) }
    if (!F(c - 1, r)) { const q = g.createLinearGradient(c * T, 0, c * T + 10, 0); q.addColorStop(0, "rgba(0,0,0,.35)"); q.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = q; g.fillRect(c * T, r * T, 10, T) }
    if (!F(c + 1, r)) { const q = g.createLinearGradient(c * T + 22, 0, c * T + 32, 0); q.addColorStop(0, "rgba(0,0,0,0)"); q.addColorStop(1, "rgba(0,0,0,.35)"); g.fillStyle = q; g.fillRect(c * T + 22, r * T, 10, T) }
  }
  tx.refresh();
  S.add.image(0, 0, key).setOrigin(0).setDepth(-2);
  B.groundLayer?.setVisible(!1);
  B.wallLayer?.setVisible(!1);
  S.cameras.main.setBackgroundColor("rgb(9,11,17)");
  S.events.once("shutdown", () => { S.textures.exists(key) && S.textures.remove(key) });
  return !0;
}
/* vulcão: poças de lava fora das salas (não ferem) com brilho pulsando */
function __exVolcanoFx(B) {
  const S = B.scene, C = B.cols, R = B.rows, T = dt, pools = ["vc-mp-lavapool-round", "vc-mp-lavapool-crust", "vc-mp-lavapool-drip", "vc-lavapool", "vc-lavapool2"].filter(k => S.textures.exists(k));
  if (!pools.length) return;
  let n = 0;
  for (let k = 0; k < 5000 && n < 40; k++) {
    const c = Math.random() * C | 0, r = Math.random() * R | 0;
    if (!B.isWallTile(c, r) || !B.nearFloor(c, r, 2) || B.nearFloor(c, r, 0)) continue;
    let near1 = !1;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (!B.isWallTile(c + dx, r + dy)) near1 = !0;
    if (near1) continue;
    n++;
    const x = c * T + 16, y = r * T + 16, p = S.add.image(x, y, pools[Math.random() * pools.length | 0]).setDepth(.6);
    S.tweens.add({ targets: p, alpha: { from: 1, to: .78 }, duration: 900 + Math.random() * 700, yoyo: !0, repeat: -1, delay: Math.random() * 900 });
  }
}
{
  const BW0 = _l.prototype.buildWallVisuals;
  _l.prototype.buildWallVisuals = function () {
    const id = this.level?.theme?.id;
    if (id === "ecastelo") { try { if (__excBake(this)) return } catch (e) { console.warn("[ecastelo]", e) } }
    const r = BW0.apply(this, arguments);
    if (id === "evulcao") try { __exVolcanoFx(this) } catch (e) {}
    return r;
  };
  const CFP = ["knight", "urns", "pillar-short", "gargoyle", "angel", "halberds", "candles", "rubble-s", "stones"];
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path;
      L.setPath("");
      this.textures.exists("exc-atlas") || L.image("exc-atlas", "assets/pixel-art/endless/exc-atlas.png");
      L.json("exc-atlas", "assets/pixel-art/endless/exc-atlas.json");
      for (const n of CFP) this.textures.exists("cf-p-" + n) || L.image("cf-p-" + n, `assets/pixel-art/castle2/cf-p-${n}.png`);
      L.setPath(op);
    } catch (e) {}
    return r;
  };
}
