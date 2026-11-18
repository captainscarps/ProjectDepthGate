/* ══ Ambientes realistas dos cenários procedurais (p216.17) — 1º bioma: Catacumbas ════════════════════════
   • Luz com relevo: os blocos de pedra do piso e das paredes ganham um "mapa de relevo" (normal map) feito aqui
     mesmo a partir da arte (altura = brilho do pixel, rejunte fundo e pedra alta). A tocha do herói e as tochas
     da masmorra iluminam esse relevo com a luz do Phaser 4 — o brilho e a sombra nas frestas mudam conforme a
     luz anda. Só no gráfico ALTO (é o efeito mais pesado).
   • Sombras de contato: o chão escurece encostado nas paredes e nos cantos; manchas de umidade, rachaduras e
     poças com reflexo — tudo pintado uma vez num canvas da fase (meia resolução), sem custo por quadro.
   • Sombras projetadas: herói, inimigos e pets projetam sombra para o lado oposto da tocha mais próxima; a sombra
     estica e gira quando passam por ela.
   • Detalhes: teias nos cantos, pó caindo do teto, gotas pingando nas poças.
   Gráfico MÉDIO: contato + manchas + sombras projetadas; BAIXO: nada.  */
const __AMB = {
  catacombs: {
    tiles: "tiles-catacombs", top: "walltop-catacombs", face: "wallface-catacombs",
    amb: 0xb2a89c, hero: 0xffc890, torch: 0xff9a40, stain: "28,20,14", wet: "40,52,58", crack: "10,7,5",
    webs: .35, drips: 1, dust: 1,
  },
};

function __ambBiome(S) {
  const D = S.dungeon, k = D?.groundLayer?.tileset?.[0]?.image?.key || "";
  for (const b in __AMB) if (__AMB[b].tiles === k) return b;
  return null;
}

/* normal map a partir do brilho: rejunte (escuro) fundo, face da pedra (clara) alta */
function __ambNormal(S, key, strength) {
  const tex = S.textures.get(key);
  if (!tex || tex.__ambN) return;
  const src = tex.getSourceImage(), w = src.width, h = src.height;
  const cv = document.createElement("canvas"); cv.width = w; cv.height = h;
  const g = cv.getContext("2d"); g.drawImage(src, 0, 0);
  const id = g.getImageData(0, 0, w, h), d = id.data, H = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) H[i] = d[i * 4 + 3] < 8 ? 0 : (d[i * 4] * .3 + d[i * 4 + 1] * .59 + d[i * 4 + 2] * .11) / 255;
  // suaviza 1 px (pedra arredondada, sem chiado)
  const B = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let s = 0, n = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const xx = x + i, yy = y + j; if (xx >= 0 && yy >= 0 && xx < w && yy < h) { s += H[yy * w + xx] * (i || j ? 1 : 2); n += i || j ? 1 : 2 } }
    B[y * w + x] = s / n;
  }
  const at = (x, y) => B[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * strength, dy = (at(x, y + 1) - at(x, y - 1)) * strength;
    let nx = -dx, ny = -dy, nz = 1; const L = Math.hypot(nx, ny, nz); nx /= L; ny /= L; nz /= L;
    const o = (y * w + x) * 4;
    d[o] = (nx * .5 + .5) * 255; d[o + 1] = (ny * .5 + .5) * 255; d[o + 2] = (nz * .5 + .5) * 255; d[o + 3] = 255;
  }
  g.putImageData(id, 0, 0);
  try { tex.setDataSource(cv); tex.__ambN = 1 } catch (e) { console.warn("[ambiente] normal", key, e) }
}

function __ambTex(S) {
  if (S.textures.exists("amb-cast")) return;
  const mk = (k, w, h, fn) => { const t = S.textures.createCanvas(k, w, h), g = t.getContext(); fn(g, w, h); t.refresh() };
  mk("amb-cast", 32, 64, (g) => {               // sombra projetada: base na origem (topo), some na ponta
    const q = g.createLinearGradient(0, 0, 0, 64); q.addColorStop(0, "rgba(0,0,0,.85)"); q.addColorStop(.6, "rgba(0,0,0,.3)"); q.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = q; g.beginPath(); g.ellipse(16, 22, 11, 22, 0, 0, Math.PI * 2); g.fill();
  });
  mk("amb-drop", 2, 4, (g) => { g.fillStyle = "rgba(190,220,235,.9)"; g.fillRect(0, 0, 2, 3); g.fillStyle = "rgba(255,255,255,1)"; g.fillRect(0, 0, 1, 1) });
  mk("amb-ring", 16, 8, (g) => { g.strokeStyle = "rgba(200,230,255,.8)"; g.lineWidth = 1; g.beginPath(); g.ellipse(8, 4, 6, 2.5, 0, 0, Math.PI * 2); g.stroke() });
  mk("amb-dust", 3, 3, (g) => { g.fillStyle = "rgba(220,205,180,.8)"; g.fillRect(1, 0, 1, 3); g.fillRect(0, 1, 3, 1) });
}

/* canvas da fase: sombras de contato + manchas + rachaduras + poças (meia resolução, uma vez) */
function __ambPaint(S, C, R) {
  const D = S.dungeon, T = dt, cols = D.cols, rows = D.rows, G = D.grid;
  const solid = (c, r) => c < 0 || r < 0 || c >= cols || r >= rows || G[r][c] !== 0;
  const K = .5, W = Math.ceil(cols * T * K), H = Math.ceil(rows * T * K);
  const key = "amb-floor-" + (D.level?.id || "x");
  if (S.textures.exists(key)) S.textures.remove(key);
  const tex = S.textures.createCanvas(key, W, H), g = tex.getContext(), t = T * K;
  const puddles = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (solid(c, r)) continue;
    const x = c * t, y = r * t;
    // contato com as paredes: em cima (a face da parede faz sombra comprida), dos lados e embaixo
    const sh = (x0, y0, x1, y1, a) => { const q = g.createLinearGradient(x0, y0, x1, y1); q.addColorStop(0, `rgba(0,0,0,${a})`); q.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = q; g.fillRect(x, y, t, t) };
    if (solid(c, r - 1)) sh(x, y, x, y + t * .9, .5);
    if (solid(c - 1, r)) sh(x, y, x + t * .55, y, .38);
    if (solid(c + 1, r)) sh(x + t, y, x + t * .45, y, .38);
    if (solid(c, r + 1)) sh(x, y + t, x, y + t * .7, .22);
    // cantos internos: mais escuros (oclusão)
    const corner = (cx, cy, a) => { const q = g.createRadialGradient(cx, cy, 0, cx, cy, t * .8); q.addColorStop(0, `rgba(0,0,0,${a})`); q.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = q; g.fillRect(x, y, t, t) };
    if (solid(c - 1, r - 1) && solid(c - 1, r) && solid(c, r - 1)) corner(x, y, .35);
    if (solid(c + 1, r - 1) && solid(c + 1, r) && solid(c, r - 1)) corner(x + t, y, .35);
    // umidade perto das paredes, manchas soltas, rachaduras
    const nearWall = solid(c, r - 1) || solid(c - 1, r) || solid(c + 1, r);
    if (R() < (nearWall ? .22 : .06)) {
      const cx = x + R() * t, cy = y + R() * t, rr = t * (.4 + R() * .9);
      for (let k = 0; k < 3; k++) {
        const ox = cx + (R() - .5) * rr, oy = cy + (R() - .5) * rr * .6, q = g.createRadialGradient(ox, oy, 0, ox, oy, rr * (.5 + R() * .5));
        q.addColorStop(0, `rgba(${nearWall ? C.wet : C.stain},${.22 + R() * .12})`); q.addColorStop(1, `rgba(${C.stain},0)`);
        g.fillStyle = q; g.fillRect(ox - rr, oy - rr, rr * 2, rr * 2);
      }
    }
    if (R() < .05) {
      g.strokeStyle = `rgba(${C.crack},.55)`; g.lineWidth = .6; g.beginPath();
      let px = x + R() * t, py = y + R() * t; g.moveTo(px, py);
      for (let k = 0; k < 4 + R() * 4; k++) { px += (R() - .5) * 7; py += (R() - .5) * 7; g.lineTo(px, py) }
      g.stroke();
    }
    if (C.drips && !solid(c, r - 1) && !solid(c, r + 1) && !solid(c - 1, r) && !solid(c + 1, r) && R() < .012) puddles.push({ x: (c + .2 + R() * .6) * T, y: (r + .2 + R() * .6) * T, s: .7 + R() * .6 });
  }
  // poças: escuras, com borda clara (reflexo do teto)
  for (const p of puddles) {
    const x = p.x * K, y = p.y * K, rx = 7 * p.s, ry = 3.2 * p.s;
    g.fillStyle = "rgba(14,18,22,.55)"; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(120,150,170,.18)"; g.beginPath(); g.ellipse(x - rx * .25, y - ry * .3, rx * .5, ry * .35, 0, 0, Math.PI * 2); g.fill();
  }
  tex.refresh();
  const im = S.add.image(0, 0, key).setOrigin(0).setScale(1 / K).setDepth(.5);
  im.__lzSkip = 1;
  return { im, puddles, key };
}

function __ambSetup(S) {
  const b = __ambBiome(S);
  if (!b || S.__amb || window.__ambOff) return;
  const C = __AMB[b], D = S.dungeon, Q = () => (window.__gfxQ ? window.__gfxQ() : 2);
  if (Q() < 1) return;
  __ambTex(S);
  let seed = 0; for (const ch of String(D.level?.seed ?? D.level?.id ?? "x") + b) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const R = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const A = { b, C, objs: [], lights: [], casts: new Map(), relief: false, litObjs: [], litT: 0 };
  S.__amb = A;

  // 1) chão: contato, manchas, poças
  const P = __ambPaint(S, C, R);
  A.objs.push(P.im);

  // 2) teias nos cantos internos de cima
  const T = dt, G = D.grid, solid = (c, r) => c < 0 || r < 0 || c >= D.cols || r >= D.rows || G[r][c] !== 0;
  if (C.webs && S.textures.exists("web")) {
    for (let r = 1; r < D.rows; r++) for (let c = 1; c < D.cols - 1; c++) {
      if (solid(c, r) || !solid(c, r - 1)) continue;
      const L = solid(c - 1, r), Rr = solid(c + 1, r);
      if ((L || Rr) && R() < C.webs) {
        const w = S.add.image(c * T + (L ? 2 : T - 2), r * T + 2, "web").setOrigin(L ? 0 : 1, 0).setFlipX(!L).setAlpha(.55).setScale(.8 + R() * .3).setDepth(2);
        w.__lzSkip = 1; A.objs.push(w);
      }
    }
  }

  // 3) gotas pingando nas poças
  if (C.drips && P.puddles.length) {
    const drip = () => {
      if (!S.__amb || !S.sys.isActive()) return;
      const v = S.cameras.main.worldView, vis = P.puddles.filter((p) => v.contains(p.x, p.y));
      if (vis.length) {
        const p = vis[(R() * vis.length) | 0], d = S.add.image(p.x, p.y - 70, "amb-drop").setDepth(p.y + 1).setAlpha(.9);
        d.__lzSkip = 1;
        S.tweens.add({ targets: d, y: p.y, duration: 420, ease: "Quad.easeIn", onComplete: () => {
          d.destroy();
          const ring = S.add.image(p.x, p.y, "amb-ring").setDepth(1).setScale(.3).setAlpha(.8); ring.__lzSkip = 1;
          S.tweens.add({ targets: ring, scale: 1.2 * p.s, alpha: 0, duration: 700, onComplete: () => ring.destroy() });
        } });
      }
      A.dripT = S.time.delayedCall(700 + R() * 1600, drip);
    };
    A.dripT = S.time.delayedCall(900, drip);
  }

  // 4) pó caindo do teto, de vez em quando, perto das paredes
  if (C.dust) {
    const dust = () => {
      if (!S.__amb || !S.sys.isActive()) return;
      const v = S.cameras.main.worldView;
      const c = Math.floor((v.x + R() * v.width) / T), r = Math.floor((v.y + R() * v.height) / T);
      if (!solid(c, r) && solid(c, r - 1)) {
        for (let k = 0; k < 5 + R() * 5; k++) {
          const p = S.add.image(c * T + R() * T, r * T - 4, "amb-dust").setDepth(9001).setAlpha(.7); p.__lzSkip = 1;
          S.tweens.add({ targets: p, y: p.y + 30 + R() * 30, x: p.x + (R() - .5) * 10, alpha: 0, duration: 1400 + R() * 900, delay: k * 60, onComplete: () => p.destroy() });
        }
      }
      A.dustT = S.time.delayedCall(1800 + R() * 3000, dust);
    };
    A.dustT = S.time.delayedCall(2000, dust);
  }

  // 5) luz com relevo (gráfico alto)
  const relief = (on) => {
    if (on === A.relief) return;
    A.relief = on;
    const layers = [D.groundLayer, D.wallLayer, ...S.children.list.filter((o) => o.texture && (o.texture.key === C.top || o.texture.key === C.face))];
    if (on) {
      for (const k of [C.tiles, C.top, C.face]) __ambNormal(S, k, k === C.tiles ? 3.2 : 2.6);
      S.lights.enable().setAmbientColor(C.amb);
      for (const o of layers) o?.setLighting?.(true);
      A.hero = S.lights.addLight(0, 0, 300, C.hero, 1.9, 90);
      A.lights = (D.lightSources || D.torches || []).map((t) => { const L = S.lights.addLight(t.x, t.y, 210, C.torch, 1.3, 50); L.__f = R() * 10; return L });
      if (S.__lz) S.__lz.C = { ...S.__lz.C, d: Math.min(S.__lz.C.d, .18) };   // a luz com relevo já escurece: a camada de sombra alivia
    } else {
      for (const o of S.children.list) o.__ambLit = 0;
      for (const o of layers) o?.setLighting?.(false);
      for (const o of A.litObjs) o.active && o.setLighting?.(false);
      A.litObjs.length = 0;
      for (const L of [A.hero, ...A.lights]) L && S.lights.removeLight(L);
      A.hero = null; A.lights = [];
      S.lights.disable();
      if (S.__lz) S.__lz.C = __lzCfg(S) || S.__lz.C;
    }
  };
  // relevo: só no gráfico alto e fora de celular/tablet (ou em aparelho com 8+ núcleos)
  const strong = () => !(("ontouchstart" in window) || (navigator.maxTouchPoints || 0) > 0) || (navigator.hardwareConcurrency || 4) >= 8;
  A.apply = () => { const q = Q(); relief(q >= 2 && strong()); for (const o of A.objs) o.setVisible(q >= 1) };
  try { A.apply() } catch (e) { console.warn("[ambiente] relevo", e); A.relief = false }

  // tudo o que está no mundo (herói, inimigos, objetos) recebe a mesma luz: sem isso ficariam "acesos" no escuro
  const litScan = () => {
    const walk = (list) => {
      for (const o of list) {
        if (o.list) { if (o !== S.playerVisual?.container) walk(o.list); continue }   // o herói carrega a tocha: fica com a cor dele
        if (o.__ambLit || o.__lzSkip || (o.type !== "Image" && o.type !== "Sprite") || !o.setLighting) continue;
        if (o.blendMode === 1 || o.scrollFactorX === 0 || o.depth >= 8000) { o.__ambLit = 1; continue }
        const k = o.texture?.key || "";
        if (/^(lz-|amb-|light$|__)/.test(k)) { o.__ambLit = 1; continue }
        o.setLighting(true); o.__ambLit = 1; A.litObjs.push(o);
      }
    };
    walk(S.children.list);
    if (A.litObjs.length > 600) A.litObjs = A.litObjs.filter((o) => o.active);
  };

  // 6) sombras projetadas + tremulação das luzes
  let t = 0;
  const near = (x, y) => {
    let best = null, bd = 1e9;
    for (const s of D.lightSources || D.torches || []) { const d = (s.x - x) ** 2 + (s.y - y) ** 2; if (d < bd) { bd = d; best = s } }
    return bd < 260 * 260 ? [best, Math.sqrt(bd)] : null;
  };
  const castFor = (o) => {
    if (!o || !o.active || o.dead) { const c = A.casts.get(o); if (c) { c.destroy(); A.casts.delete(o) } return }
    const n = near(o.x, o.y);
    let c = A.casts.get(o);
    if (!n) { c && c.setVisible(false); return }
    if (!c) { c = S.add.image(0, 0, "amb-cast").setOrigin(.5, 0).setDepth(1); c.__lzSkip = 1; A.casts.set(o, c) }
    const [s, d] = n, ang = Math.atan2(o.y - s.y, o.x - s.x);
    c.setVisible(true).setPosition(o.x, o.y + 10).setRotation(ang - Math.PI / 2)
      .setScale(.75, Math.min(1.8, .55 + d / 120)).setAlpha(Math.max(0, .85 - d / 320));
  };
  const step = (_, dtMs) => {
    if (!S.sys.isActive() || !S.player) return;
    t += dtMs;
    if (A.relief && (A.litT -= dtMs) <= 0) { A.litT = 400; litScan() }
    if (A.relief && A.hero) {
      A.hero.x = S.player.x - 6; A.hero.y = S.player.y - 34;   // a tocha fica acima do ombro: luz por cima, sem estourar o herói
      A.hero.intensity = 1.9 + Math.sin(t * .011) * .05 + Math.sin(t * .029) * .04;
      // só as 4 tochas mais perto do herói ficam acesas no shader (cada luz custa em todos os pixels iluminados)
      if ((A.selT = (A.selT || 0) - dtMs) <= 0) {
        A.selT = 300;
        const px = S.player.x, py = S.player.y;
        const ord = A.lights.slice().sort((a, b) => ((a.x - px) ** 2 + (a.y - py) ** 2) - ((b.x - px) ** 2 + (b.y - py) ** 2));
        ord.forEach((L, i) => { L.visible = i < 4 && (L.x - px) ** 2 + (L.y - py) ** 2 < 520 * 520 });
      }
      for (const L of A.lights) L.intensity = 1.3 + Math.sin(t * .013 + L.__f) * .12 + Math.sin(t * .031 + L.__f) * .06;
    }
    if (Q() >= 1) {
      castFor(S.player);
      for (const e of S.enemies?.getChildren?.() || []) castFor(e);
      if (S.__petObj) castFor(S.__petObj);
      for (const [o, c] of A.casts) if (!o.active) { c.destroy(); A.casts.delete(o) }
    }
  };
  S.events.on("update", step);
  S.events.once("shutdown", () => {
    S.events.off("update", step);
    for (const c of A.casts.values()) c.destroy();
    try { S.lights.disable() } catch (e) {}
    S.__amb = null;
  });
}

(function () {
  const C0 = Sd.prototype.create;
  Sd.prototype.create = function () {
    const r = C0.apply(this, arguments);
    try { this.time.delayedCall(90, () => { try { __ambSetup(this) } catch (e) { console.warn("[ambiente]", e) } }) } catch (e) {}
    return r;
  };
  const hook = () => { const g = window.__DED_GAME; if (!g) return setTimeout(hook, 500); g.events.on("settings:changed", () => { try { g.scene.getScene("Game")?.__amb?.apply?.() } catch (e) {} }) };
  hook();
})();
