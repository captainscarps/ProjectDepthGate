/* ══ Cemitério dos Esquecidos ══
   Cenário com os ladrilhos do pack "Graveyard" (assets/pixel-art/endless/gyt-atlas.*, scripts/build_graveyard_tiles.py):
   chão de grama, platôs com penhasco de terra, bordas de cerca-viva, calçamento de pedra nos corredores,
   árvores secas, lápides, lanternas e forcas animadas.
   Inimigos do cemitério (gw-*): as folhas trazem 8 direções paradas, não passos. Antes a animação "andar"
   girava o boneco pelas 8 direções. Agora cada um olha para onde anda, com passada, respiro, bote e golpe. */
let __gyN = 0;
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
  // corredores com calçamento
  const path = new Uint8Array(C * R);
  for (const k of B.level.corridors || []) for (let y = k.y; y < k.y + k.h; y++) for (let x = k.x; x < k.x + k.w; x++) if (F(x, y)) path[y * C + x] = 1;
  g.fillStyle = "#0e1612"; g.fillRect(0, 0, C * T, R * T);
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const d = dist[r * C + c];
    if (d === 0) { put(path[r * C + c] ? "stone" : rnd() < .012 ? "patch" : "grass", c, r); continue }
    if (d > 7) continue;
    // platô: grama alta; bordas conforme o chão vizinho
    const below = F(c, r + 1), below2 = F(c, r + 2), below3 = F(c, r + 3), above = F(c, r - 1), above2 = F(c, r - 2), left = F(c - 1, r), right = F(c + 1, r);
    if (below) put("cliff3", c, r);
    else if (below2 && Wl(c, r + 1)) put("cliff2", c, r);
    else if (below3 && Wl(c, r + 1) && Wl(c, r + 2)) put("cliff1", c, r);
    else {
      put("grass", c, r);
      if (above) { g.drawImage(src, ...pick(M.t.edgeTop), T, T, c * T, r * T, T, T) }
      else if (above2 && Wl(c, r - 1)) put("edgeTop2", c, r);
      else if (right) put("sideR", c, r);
      else if (left) put("sideL", c, r);
      else if (d >= 3) put("dark", c, r);
    }
  }
  // escurece o platô longe das salas com gradiente suave (mapa pequeno ampliado com suavização)
  const sh = document.createElement("canvas"); sh.width = C; sh.height = R;
  const sg = sh.getContext("2d"), id = sg.createImageData(C, R);
  for (let k = 0; k < C * R; k++) { const d = dist[k]; id.data[k * 4] = 6; id.data[k * 4 + 1] = 10; id.data[k * 4 + 2] = 8; id.data[k * 4 + 3] = d <= 1 ? 0 : Math.min(235, (d - 1) * 46) }
  sg.putImageData(id, 0, 0);
  g.imageSmoothingEnabled = !0; g.imageSmoothingQuality = "high"; g.drawImage(sh, 0, 0, C, R, 0, 0, C * T, R * T); g.imageSmoothingEnabled = !1;
  // sombra ao pé dos penhascos
  for (let r = 1; r < R; r++) for (let c = 0; c < C; c++) {
    if (!F(c, r) || F(c, r - 1)) continue;
    const q2 = g.createLinearGradient(0, r * T, 0, r * T + 12); q2.addColorStop(0, "rgba(0,0,0,.42)"); q2.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = q2; g.fillRect(c * T, r * T, T, 12);
  }
  tx.refresh();
  S.add.image(0, 0, key).setOrigin(0).setDepth(-2);
  B.groundLayer?.setVisible(!1); B.wallLayer?.setVisible(!1);
  S.cameras.main.setBackgroundColor("#0e1612");
  S.events.once("shutdown", () => { S.textures.exists(key) && S.textures.remove(key) });
  // árvores secas, lápides e cercas no platô perto das salas
  const ex = (k) => S.textures.exists(k), trees = ["gy-tree1", "gy-tree2", "gy-tree3", "gy-tree4", "gy-tree5", "gy-tree6", "gy-tree7", "gy-tree8", "gy-tree9", "gy-tree10"].filter(ex);
  const stones = Array.from({ length: 31 }, (_, i) => "gy-statue" + (i + 1)).filter(ex), fences = Array.from({ length: 10 }, (_, i) => "gy-fence" + (i + 1)).filter(ex);
  const grid = new Set(), list = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const d = dist[r * C + c];
    if (d < 1 || d > 3) continue;
    if (F(c, r + 1) || F(c, r + 2)) continue; // não cobre o penhasco
    const gk = (c >> 1) + "," + (r >> 1);
    if (grid.has(gk)) continue;
    const roll = rnd();
    if (roll < .34 && trees.length) { grid.add(gk); const x = c * T + 16 + (rnd() - .5) * 10, y = (r + 1) * T; list.push(S.add.image(x, y, pick(trees)).setOrigin(.5, 1).setDepth(y).setTint(0xc8d0c8)) }
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
    const r = rm.rect; if (!r || rm.roomType === "BOSS") continue;
    const spots = [[r.x + 1, r.y + 1], [r.x + r.w - 2, r.y + 1], [r.x + 1, r.y + r.h - 2], [r.x + r.w - 2, r.y + r.h - 2]];
    for (const [c, rr] of spots) {
      if (rnd() > .55 || !F(c, rr) || (sp && Math.abs(sp.col - c) + Math.abs(sp.row - rr) < 3)) continue;
      const kind = rnd() < .2 ? "gallows" : pick(["lantern1", "lantern2", "lantern3"]), x = c * T + 16, y = (rr + 1) * T - 2;
      const s = S.add.sprite(x, y, "gya-" + kind, 0).setOrigin(.5, 1).setDepth(y); s.play("gya-" + kind); s.anims.setProgress(rnd());
      list.push(s);
      if (kind !== "gallows" && S.textures.exists("light")) { const gl = S.add.image(x + 9, y - 34, "light").setBlendMode(j.BlendModes.ADD).setTint(0xffc46a).setScale(.22).setAlpha(.45).setDepth(y + 1); S.tweens.add({ targets: gl, alpha: .25, duration: 700 + rnd() * 500, yoyo: !0, repeat: -1 }); B.lightSources?.push?.({ x: x + 9, y: y - 34, type: "CANDLE" }) }
    }
  }
  // névoa rasteira
  for (let k = 0; k < 5; k++) { const x = rnd() * C * T, y = rnd() * R * T, f = S.add.image(x, y, "light").setScale(2.6 + rnd() * 2).setTint(9076904).setAlpha(.09).setDepth(8999); S.tweens.add({ targets: f, x: x + 180, duration: 18e3 + rnd() * 8e3, yoyo: !0, repeat: -1, ease: "Sine.easeInOut" }) }
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
    try { const L = this.load, op = L.path; L.setPath(""); this.textures.exists("gyt-atlas") || L.image("gyt-atlas", "assets/pixel-art/endless/gyt-atlas.png"); L.json("gyt-atlas", "assets/pixel-art/endless/gyt-atlas.json"); L.setPath(op) } catch (e) {}
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
