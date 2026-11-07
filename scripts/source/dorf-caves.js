/* ── Bioma: Cavernas da Montanha Dorf (RPG Worlds Deep Cave - Szadi art) ─────────────────────────
   Cenário exploratório amplo, orgânico e procedural por entrada (sem salas e sem explorar profundidades):
   - Paredes de basalto de 3 tiles de altura em degraus curvos com vinhas luminescentes
   - Clareiras de musgo hexagonal com bordas orgânicas, terraços de pedra cinza e escadarias
   - Penínsulas rochosas abissais internas (como nas imagens de referência) criando loops naturais
   - Formações de estalagmites 2.5D com ordenação de profundidade Y (Y-sorting) e colisão na base
   - Economia de exploração: poucos baús escondidos em fendas laterais, porém valiosos,
     com Pedra Cobalto (veios para minerar e pepitas dos inimigos), a única matéria-prima
     que o ferreiro aceita para forjar as Armas Únicas no Refúgio.
────────────────────────────────────────────────────────────────────────────────────────────────── */
let __dorfN = 0;

/* 0) Economia global das Moedas do Ferreiro (🪙) */
const __DORF_COIN_KEY = "depthgate:forge_coins"; /* saldo de Pedra Cobalto (nome antigo: Moedas do Ferreiro) */
let __cobaltMig = false;

function __getForgeCoins(S) {
  if (!__cobaltMig) { __cobaltMig = true; try { if (!localStorage.getItem("depthgate:cobalt_mig")) { localStorage.setItem("depthgate:cobalt_mig", "1"); const old = __getForgeCoins(S); if (old > 0) __setForgeCoins(old * 10, S) } } catch (e) {} }
  let v = 0;
  try {
    v = parseInt(localStorage.getItem(__DORF_COIN_KEY) || "0", 10);
    if (!isFinite(v) || v < 0) v = 0;
  } catch (e) { v = 0; }
  try {
    const sl = S?.dorfSlot || S?.retSlot || S?.game?.registry?.get("save:slot") || 1;
    if (typeof Dn === "function") {
      const cr = Dn(sl);
      if (cr?.ok && typeof cr.data?.player?.forgeCoins === "number") {
        v = Math.max(v, cr.data.player.forgeCoins | 0);
      }
    }
    if (typeof Nn === "function") {
      const er = Nn(sl);
      if (er?.ok && typeof er.data?.player?.forgeCoins === "number") {
        v = Math.max(v, er.data.player.forgeCoins | 0);
      }
    }
  } catch (e) {}
  return v;
}

function __setForgeCoins(n, S) {
  const val = Math.max(0, n | 0);
  try { localStorage.setItem(__DORF_COIN_KEY, String(val)); } catch (e) {}
  try {
    const sl = S?.dorfSlot || S?.retSlot || S?.game?.registry?.get("save:slot") || 1;
    if (typeof Dn === "function") {
      const cr = Dn(sl);
      if (cr?.ok && cr.data) {
        cr.data.player = cr.data.player || {};
        cr.data.player.forgeCoins = val;
        localStorage.setItem(Wt("campaign", sl), JSON.stringify(cr.data));
      }
    }
    if (typeof Nn === "function") {
      const er = Nn(sl);
      if (er?.ok && er.data) {
        er.data.player = er.data.player || {};
        er.data.player.forgeCoins = val;
        localStorage.setItem(Wt("endless", sl), JSON.stringify(er.data));
      }
    }
  } catch (e) {}
  return val;
}

function __addForgeCoins(delta, S, wx, wy) {
  const cur = __getForgeCoins(S);
  const next = __setForgeCoins(cur + (delta | 0), S);
  if (S) {
    try {
      if (S.__dorfCoinTxt?.active) {
        const L3 = typeof __L3 === "function" ? __L3 : (pt) => pt;
        S.__dorfCoinTxt.setText(`◆ ${L3("Pedra Cobalto", "Cobalt Stone", "Piedra Cobalto")}: ${next}`);
        S.tweens?.add({ targets: S.__dorfCoinTxt, scale: { from: 1.18, to: 1 }, duration: 260, ease: "Back.easeOut" });
      }
      if (wx != null && wy != null && S.add) {
        const L3 = typeof __L3 === "function" ? __L3 : (pt) => pt;
        const label = `+${delta} ◆ ` + L3("COBALTO", "COBALT", "COBALTO");
        const t = S.add.text(wx, wy - 18, label, {
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: "11px",
          fontStyle: "bold",
          color: "#9cc2ff",
          stroke: "#0a1030",
          strokeThickness: 4
        }).setOrigin(0.5).setDepth(9500);
        S.tweens?.add({
          targets: t,
          y: wy - 48,
          alpha: { from: 1, to: 0 },
          duration: 1800,
          ease: "Cubic.easeOut",
          onComplete: () => t.destroy()
        });
      }
      window.__advancedAudio?.playMetalClang?.("E5");
    } catch (e) {}
  }
  return next;
}

if (typeof window !== "undefined") {
  window.__getForgeCoins = __getForgeCoins;
  window.__setForgeCoins = __setForgeCoins;
  window.__addForgeCoins = __addForgeCoins;
}

/* 0a) Durabilidade das armas do ferreiro no modo infinito (máximo de 3 runs, conserto com Pedra Cobalto) */
const __FORGE_MAX_RUNS = 3;
function __forgeDurGet(slot) { try { return JSON.parse(localStorage.getItem("depthgate:forgeDur:" + slot) || "{}") || {} } catch (e) { return {} } }
function __forgeDurSet(slot, m) { try { localStorage.setItem("depthgate:forgeDur:" + slot, JSON.stringify(m || {})) } catch (e) {} }
function __forgeBrokenGet(slot) { try { const v = JSON.parse(localStorage.getItem("depthgate:forgeBroken:" + slot) || "[]"); return Array.isArray(v) ? v : [] } catch (e) { return [] } }
function __forgeBrokenSet(slot, l) { try { localStorage.setItem("depthgate:forgeBroken:" + slot, JSON.stringify(l || [])) } catch (e) {} }
function __forgeBrokenAdd(slot, l) { __forgeBrokenSet(slot, __forgeBrokenGet(slot).concat(l || [])) }
try { if (typeof window !== "undefined") Object.assign(window, { __FORGE_MAX_RUNS, __forgeDurGet, __forgeDurSet, __forgeBrokenGet, __forgeBrokenSet, __forgeBrokenAdd }) } catch (e) {}

/* 0a2) Armas do ferreiro: cada uma tem uma animação própria a cada golpe (por cima do ataque normal) */
const __FFX = {
  add(S) { return j.BlendModes.ADD },
  mote(S, x, y, col, sc, d) { return S.add.image(x, y, "light").setBlendMode(j.BlendModes.ADD).setTint(col).setScale(sc).setDepth(d) },
  burst(S, x, y, col, n, spd, life, sc, d, up = 0) {
    for (let k = 0; k < n; k++) {
      const a = Math.random() * Math.PI * 2, v = spd * (0.4 + Math.random() * 0.6), m = __FFX.mote(S, x, y, col, sc * (0.6 + Math.random() * 0.6), d);
      S.tweens.add({ targets: m, x: x + Math.cos(a) * v, y: y + Math.sin(a) * v * 0.7 - up, alpha: 0, scale: 0.002, duration: life * (0.7 + Math.random() * 0.5), ease: "Quad.easeOut", onComplete: () => m.destroy() });
    }
  },
  arc(S, x, y, ang, r, span, w, col, dur, d, alpha = 0.95) {
    const g = S.add.graphics().setDepth(d).setBlendMode(j.BlendModes.ADD).setPosition(x, y);
    g.lineStyle(w, col, alpha); g.beginPath(); g.arc(0, 0, r, ang - span / 2, ang + span / 2); g.strokePath();
    S.tweens.add({ targets: g, alpha: 0, scaleX: 1.18, scaleY: 1.18, duration: dur, ease: "Quad.easeOut", onComplete: () => g.destroy() });
    return g;
  },
  comet(S, x, y, ang, dist, dur, col, trail, d, tsc = 0.05) {
    const h = __FFX.mote(S, x, y, col, tsc * 1.6, d + 1), tx = x + Math.cos(ang) * dist, ty = y + Math.sin(ang) * dist;
    let acc = 0;
    S.tweens.add({ targets: h, x: tx, y: ty, duration: dur, ease: "Linear",
      onUpdate: (tw, t, k, dt_) => { acc += 16; if (acc >= 32) { acc = 0; const m = __FFX.mote(S, h.x + (Math.random() - 0.5) * 6, h.y + (Math.random() - 0.5) * 6, trail, tsc * (0.6 + Math.random() * 0.6), d); S.tweens.add({ targets: m, alpha: 0, scale: 0.002, y: m.y + 6, duration: 420, onComplete: () => m.destroy() }) } },
      onComplete: () => { __FFX.burst(S, h.x, h.y, col, 8, 26, 380, tsc, d); h.destroy() } });
  },
};
const __FORGE_FX = {
  // Espada-Baluarte da Aurora: meia-lua dourada da alvorada + escudo hexagonal que cintila em volta do herói
  unique_forge_aegis(S, x, y, ang, d) {
    __FFX.arc(S, x, y - 8, ang, 34, 2.3, 7, 0xffcf5a, 300, d);
    __FFX.arc(S, x, y - 8, ang, 34, 2.0, 2, 0xffffff, 240, d + 1);
    const g = S.add.graphics().setDepth(d - 2).setBlendMode(j.BlendModes.ADD).setPosition(x, y - 10);
    g.lineStyle(2, 0xffe9a0, 0.7); g.beginPath();
    for (let k = 0; k <= 6; k++) { const a = k / 6 * Math.PI * 2 + Math.PI / 6, px = Math.cos(a) * 22, py = Math.sin(a) * 18; k ? g.lineTo(px, py) : g.moveTo(px, py) }
    g.strokePath(); g.setScale(0.7);
    S.tweens.add({ targets: g, scaleX: 1.25, scaleY: 1.25, alpha: 0, duration: 420, ease: "Quad.easeOut", onComplete: () => g.destroy() });
    for (let k = 0; k < 5; k++) { const m = __FFX.mote(S, x + (Math.random() - 0.5) * 30, y - 4, 0xffd36a, 0.025, d); S.tweens.add({ targets: m, y: y - 40 - Math.random() * 20, alpha: 0, duration: 600 + k * 60, onComplete: () => m.destroy() }) }
  },
  // Lâmina do Eclipse Negro: corte escuro com borda de coroa solar e um eclipse que se abre no ponto do golpe
  unique_forge_eclipse(S, x, y, ang, d) {
    const g = S.add.graphics().setDepth(d).setPosition(x, y - 8);
    g.lineStyle(9, 0x0b0612, 0.85); g.beginPath(); g.arc(0, 0, 32, ang - 1.1, ang + 1.1); g.strokePath();
    S.tweens.add({ targets: g, alpha: 0, scaleX: 1.15, scaleY: 1.15, duration: 280, onComplete: () => g.destroy() });
    __FFX.arc(S, x, y - 8, ang, 37, 2.2, 2, 0xffcf5a, 300, d + 1);
    const ex = x + Math.cos(ang) * 30, ey = y - 8 + Math.sin(ang) * 30;
    const disc = S.add.circle(ex, ey, 7, 0x05030a, 1).setDepth(d + 2).setScale(0.3);
    const cor = __FFX.mote(S, ex, ey, 0xffae1e, 0.06, d + 1);
    const ring = S.add.circle(ex, ey, 8).setStrokeStyle(2, 0xffe9a0, 1).setDepth(d + 2).setBlendMode(j.BlendModes.ADD).setScale(0.3);
    S.tweens.add({ targets: [disc, ring], scale: 1.4, duration: 180, ease: "Back.easeOut", yoyo: true, hold: 120, onComplete: () => { disc.destroy(); ring.destroy() } });
    S.tweens.add({ targets: cor, scale: 0.16, alpha: 0, duration: 520, onComplete: () => cor.destroy() });
    __FFX.burst(S, ex, ey, 0xffcf5a, 6, 26, 360, 0.02, d + 1);
  },
  // Presas do Vácuo Eterno: dois cortes ciano que se cruzam em X e rastros do herói
  unique_forge_shadowfangs(S, x, y, ang, d) {
    const cx = x + Math.cos(ang) * 22, cy = y - 8 + Math.sin(ang) * 22;
    const cut = (rot, delay) => S.time.delayedCall(delay, () => {
      const g = S.add.graphics().setDepth(d + 1).setBlendMode(j.BlendModes.ADD).setPosition(cx, cy).setRotation(rot);
      g.lineStyle(4, 0x38bdf8, 1).lineBetween(-20, 0, 20, 0); g.lineStyle(1.5, 0xffffff, 1).lineBetween(-17, 0, 17, 0);
      g.setScale(0.2, 1);
      S.tweens.add({ targets: g, scaleX: 1.1, duration: 90, ease: "Quad.easeOut", onComplete: () => S.tweens.add({ targets: g, alpha: 0, duration: 200, onComplete: () => g.destroy() }) });
    });
    cut(ang + Math.PI / 4, 0); cut(ang - Math.PI / 4, 80);
    for (let k = 1; k <= 3; k++) {
      const m = S.add.graphics().setDepth(d - 1).setBlendMode(j.BlendModes.ADD);
      const bx = x - Math.cos(ang) * k * 9, by = y - 10 - Math.sin(ang) * k * 9;
      m.fillStyle(0x1f8fd0, 0.45 / k).fillEllipse(bx, by, 14, 22);
      S.tweens.add({ targets: m, alpha: 0, duration: 260 + k * 40, onComplete: () => m.destroy() });
    }
    S.time.delayedCall(90, () => __FFX.burst(S, cx, cy, 0x7ad8ff, 7, 24, 300, 0.02, d + 1));
  },
  // Arco Estelar de Dorf: estrelas no disparo e um cometa dourado que acompanha a flecha
  unique_forge_starfall(S, x, y, ang, d) {
    const bx = x + Math.cos(ang) * 12, by = y - 10 + Math.sin(ang) * 12;
    __FFX.burst(S, bx, by, 0xffe9a0, 8, 20, 320, 0.02, d + 1);
    __FFX.comet(S, bx, by, ang, 280, 560, 0xffd36a, 0xfff3c4, d + 1, 0.035);
    const st = S.add.star(bx, by, 4, 2, 7, 0xffffff).setDepth(d + 2).setBlendMode(j.BlendModes.ADD);
    S.tweens.add({ targets: st, angle: 90, scale: 1.8, alpha: 0, duration: 340, onComplete: () => st.destroy() });
  },
  // Machado do Cataclismo: golpe em brasa, chão que racha e onda de choque
  unique_forge_cataclysm(S, x, y, ang, d) {
    __FFX.arc(S, x, y - 8, ang, 36, 2.6, 10, 0xff5a2a, 320, d);
    __FFX.arc(S, x, y - 8, ang, 36, 2.2, 3, 0xffd36a, 260, d + 1);
    const ix = x + Math.cos(ang) * 34, iy = y + Math.sin(ang) * 24 + 4;
    const cr = S.add.graphics().setDepth(iy - 1);
    for (let k = 0; k < 6; k++) {
      let a = k / 6 * Math.PI * 2 + Math.random() * 0.5, px = ix, py = iy;
      cr.lineStyle(3, 0x2a0a04, 0.9); cr.beginPath(); cr.moveTo(px, py);
      const pts = [[px, py]];
      for (let s2 = 0; s2 < 3; s2++) { a += (Math.random() - 0.5) * 0.8; px += Math.cos(a) * (7 + Math.random() * 6); py += Math.sin(a) * (5 + Math.random() * 4); cr.lineTo(px, py); pts.push([px, py]) }
      cr.strokePath(); cr.lineStyle(1, 0xff8a3a, 0.9); cr.beginPath(); cr.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(([a1, b1]) => cr.lineTo(a1, b1)); cr.strokePath();
    }
    S.tweens.add({ targets: cr, alpha: 0, duration: 900, delay: 300, onComplete: () => cr.destroy() });
    const ring = S.add.ellipse(ix, iy, 16, 8).setStrokeStyle(3, 0xff7a2a, 0.9).setDepth(iy).setBlendMode(j.BlendModes.ADD);
    S.tweens.add({ targets: ring, scaleX: 4.5, scaleY: 4.5, alpha: 0, duration: 460, ease: "Quad.easeOut", onComplete: () => ring.destroy() });
    __FFX.burst(S, ix, iy - 4, 0xff9a3a, 10, 34, 420, 0.022, d + 1, 10);
    try { S.cameras.main.shake(90, 0.004) } catch (e) {}
  },
  // Cetro da Ruína Astral: círculo de runas que gira sob o herói e um cometa violeta com órbitas
  unique_forge_abyss_scepter(S, x, y, ang, d) {
    const g = S.add.graphics().setDepth(y - 2).setBlendMode(j.BlendModes.ADD).setPosition(x, y + 2);
    g.lineStyle(1.5, 0xc690ff, 0.9).strokeEllipse(0, 0, 44, 18); g.lineStyle(1, 0xa855f7, 0.7).strokeEllipse(0, 0, 32, 12);
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; g.fillStyle(0xe8d0ff, 1).fillCircle(Math.cos(a) * 22, Math.sin(a) * 9, 1.6) }
    g.setScale(0.5);
    S.tweens.add({ targets: g, scaleX: 1.1, scaleY: 1.1, duration: 220, ease: "Back.easeOut", onComplete: () => S.tweens.add({ targets: g, alpha: 0, duration: 380, onComplete: () => g.destroy() }) });
    const ox = x + Math.cos(ang) * 14, oy = y - 14 + Math.sin(ang) * 14;
    __FFX.comet(S, ox, oy, ang, 240, 520, 0xc690ff, 0x7a2cff, d + 1, 0.04);
    for (let k = 0; k < 2; k++) {
      const o = __FFX.mote(S, ox, oy, 0xe8d0ff, 0.02, d + 2), st = { t: 0 };
      S.tweens.add({ targets: st, t: 1, duration: 520, onUpdate: () => { const cx = ox + Math.cos(ang) * 240 * st.t, cy = oy + Math.sin(ang) * 240 * st.t, w = st.t * 18 + k * Math.PI; o.setPosition(cx + Math.cos(w) * 9, cy + Math.sin(w) * 5) }, onComplete: () => o.destroy() });
    }
  },
};
if (typeof dh !== "undefined" && dh.prototype?.deliverAttack) {
  const D0 = dh.prototype.deliverAttack;
  dh.prototype.deliverAttack = function (i, t, e) {
    const r = D0.apply(this, arguments);
    try {
      const S = this.scene, it = S.inventory?.equipment?.weapon, fx = it && __FORGE_FX[it.id];
      if (fx && this.player?.active) {
        const dd = e ?? this.player.facing, L = Math.hypot(dd.x, dd.y) || 1;
        fx(S, this.player.x, this.player.y, Math.atan2(dd.y / L, dd.x / L), (this.player.depth || this.player.y) + 6);
      }
    } catch (err) {}
    return r;
  };
}
try { if (typeof window !== "undefined") window.__FORGE_FX = __FORGE_FX; } catch (e) {}

/* 0b) Pedra Cobalto: texturas em pixel art, pepitas para juntar e veios para minerar */
function __cobaltTex(S) {
  const T = S.textures;
  const pal = { o: "#0e1638", a: "#1d3384", b: "#2f56c8", c: "#5b8cff", d: "#cfe0ff", r: "#2a2030", s: "#4a3a48", t: "#6b5566" };
  const draw = (key, rows) => {
    if (T.exists(key)) return;
    const h = rows.length, w = rows[0].length, cv = T.createCanvas(key, w, h), g = cv.getContext();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const ch = rows[y][x]; if (pal[ch]) { g.fillStyle = pal[ch]; g.fillRect(x, y, 1, 1) } }
    cv.refresh();
  };
  draw("cobalt-ore", [
    "...oo...",
    "..ocdo..",
    ".ocdbbo.",
    ".ocbbao.",
    "obcbaao.",
    "obbaao..",
    ".oaao...",
    "..oo...."]);
  draw("cobalt-vein", [
    "..........oo..........",
    ".........ocdo.........",
    "....oo...ocdbo...oo...",
    "...ocdo..ocbbo..ocdo..",
    "...ocbo.ocdbbao.ocbo..",
    "..ocdbaoocbbbaoocdbao.",
    "..ocbbaoocbbaaoocbbao.",
    "..ocbaaoocbbaaoocbaao.",
    ".ttocbaoottbaaootcbaott",
    "tsstocaosstoaossttoasst",
    "tssssoosssssoossssossss",
    "rssstsssssstsssssstssr.",
    ".rrsssssssssssssssssrr.",
    "...rrrrrrrrrrrrrrrrr..."]);
}
function __cobaltBurst(S, x, y, total) {
  try {
    __cobaltTex(S);
    const n = Math.min(8, Math.max(1, Math.ceil(total / 3)));
    let left = total;
    for (let i = 0; i < n; i++) {
      const v = i === n - 1 ? left : Math.max(1, Math.round(total / n)); left -= v; if (v <= 0) continue;
      const a = Math.random() * Math.PI * 2, d = 14 + Math.random() * 26, tx = x + Math.cos(a) * d, ty = y + Math.sin(a) * d * 0.6;
      const o = S.add.image(x, y - 10, "cobalt-ore").setScale(2).setDepth(ty + 1);
      const gl = S.add.image(tx, ty, "light").setBlendMode(j.BlendModes.ADD).setTint(0x4f7fe8).setScale(0.07).setAlpha(0.6).setDepth(ty);
      o.__v = v; o.__gl = gl; o.__ready = false;
      S.tweens.add({ targets: o, x: tx, duration: 420, ease: "Quad.easeOut" });
      S.tweens.add({ targets: o, y: { from: y - 10, to: ty - 22 }, duration: 210, ease: "Quad.easeOut", yoyo: false, onComplete: () => S.tweens.add({ targets: o, y: ty, duration: 210, ease: "Bounce.easeOut", onComplete: () => { o.__ready = true; S.tweens.add({ targets: o, y: ty - 3, duration: 700, yoyo: true, repeat: -1, ease: "Sine.easeInOut" }) } }) });
      (S.__cobaltOres = S.__cobaltOres || []).push(o);
    }
    if (!S.__cobaltTick) {
      S.__cobaltTick = true;
      S.events.on("update", () => {
        const P = S.player; if (!P || P.dead || !S.__cobaltOres?.length) return;
        for (let i = S.__cobaltOres.length - 1; i >= 0; i--) {
          const o = S.__cobaltOres[i];
          if (!o.active) { S.__cobaltOres.splice(i, 1); continue }
          if (!o.__ready) continue;
          const dx = P.x - o.x, dy = P.y - 8 - o.y, dd = Math.hypot(dx, dy);
          if (dd < 110) { o.x += dx * 0.14; o.y += dy * 0.14; o.__gl?.setPosition(o.x, o.y) }
          if (dd < 20) {
            S.__cobaltOres.splice(i, 1); o.__gl?.destroy(); o.destroy();
            __addForgeCoins(o.__v, S, P.x, P.y - 20);
            S.__cobaltRun = (S.__cobaltRun | 0) + o.__v;
          }
        }
      });
      S.events.once("shutdown", () => { S.__cobaltOres = []; S.__cobaltTick = false });
    }
  } catch (e) { __addForgeCoins(total, S, x, y) }
}
function __cobaltVeins(S, B) {
  if (S.__cobaltVeinsDone || !B?.level?.__organicGrid) return;
  S.__cobaltVeinsDone = true;
  __cobaltTex(S);
  const G = B.level.__organicGrid, R = G.length, C = G[0].length, T = dt || 32;
  const sp = B.level.playerSpawn, spots = [];
  // pontos de piso encostados numa parede norte (o veio fica cravado na rocha)
  for (let r = 7; r < R - 4; r++) for (let c = 5; c < C - 5; c++)
    if (G[r][c] === 0 && G[r - 1][c] === 1 && G[r][c - 1] === 0 && G[r][c + 1] === 0 && G[r + 1][c] === 0 && Math.hypot(c - sp.col, r - sp.row) > 12) spots.push([c, r]);
  const n = Math.min(spots.length, 7 + ((Math.random() * 4) | 0)), used = [];
  for (let k = 0, tries = 0; k < n && tries < 400; tries++) {
    const [c, r] = spots[(Math.random() * spots.length) | 0];
    if (used.some(([a, b]) => Math.hypot(a - c, b - r) < 9)) continue;
    used.push([c, r]); k++;
    const x = c * T + 16, y = r * T + 14;
    const v = S.add.image(x, y, "cobalt-vein").setOrigin(0.5, 1).setScale(2).setDepth(y);
    const gl = S.add.image(x, y - 16, "light").setBlendMode(j.BlendModes.ADD).setTint(0x3d6cf0).setScale(0.22).setAlpha(0.45).setDepth(y + 1);
    S.tweens.add({ targets: gl, alpha: 0.25, duration: 1300 + Math.random() * 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    try { S.lighting?.addLight?.({ x, y: y - 14, radius: 90, flicker: 0.05, color: 0x4f7fe8 }) } catch (e) {}
    const L3 = typeof __L3 === "function" ? __L3 : (pt) => pt;
    const z = S.add.zone(x, y, 4, 4); z.interactLabel = L3("Minerar Pedra Cobalto", "Mine Cobalt Stone", "Minar Piedra Cobalto");
    let hits = 0;
    z.interact = () => {
      hits++;
      S.cameras.main.shake(90, 0.003);
      try { window.__advancedAudio?.playMetalClang?.(hits < 3 ? "C5" : "G5") } catch (e) {}
      S.tweens.add({ targets: v, x: { from: x - 2, to: x }, duration: 90 });
      if (hits < 3) { S.effects?.burstTinted?.(x, y - 14, 0x5b8cff, 6); return }
      const i = S.dungeon.objects.indexOf(z); i >= 0 && S.dungeon.objects.splice(i, 1);
      S.effects?.burstTinted?.(x, y - 14, 0x9cc2ff, 18);
      __cobaltBurst(S, x, y - 4, 10 + ((Math.random() * 9) | 0) + (S.__dorfDanger | 0));
      S.tweens.add({ targets: [v, gl], alpha: 0, duration: 500, onComplete: () => { v.destroy(); gl.destroy() } });
    };
    S.dungeon.objects.push(z);
  }
}

/* 1) Registro de Tema, Inimigos Reais e Tabelas de Loot Escasso e Valioso */
(function __registerDorfBiome() {
  if (typeof Ls === "undefined") return;
  const baseTheme = Ls.catacombs || Ls.ruins || Object.values(Ls)[0];
  Ls.dorf_cave = {
    ...baseTheme,
    id: "dorf_cave",
    name: "Cavernas da Montanha Dorf",
    tilesetKey: "tiles-dorf-cave",
    ambient: 0.62,
    fogColor: 0x0d0a10,
    fogDensity: 0.006,
    music: "catacombs-theme",
    palette: {
      floor: 0x4b3834,
      wall: 0x5c4454,
      accent: 0x38bdf8,
      light: 0x67e8f9
    },
    lightPreset: {
      color: 0x67e8f9,
      radius: 155,
      intensity: 0.96
    }
  };

  if (typeof ud !== "undefined") ud.dorf_cave = "Cavernas da Montanha Dorf";
  try {
    if (typeof Ns !== "undefined") Ns["biome.dorf_cave"] = "Cavernas da Montanha Dorf";
    if (typeof _s !== "undefined") _s["biome.dorf_cave"] = "Dorf Mountain Caves";
    if (typeof Io !== "undefined") Io["biome.dorf_cave"] = "Cavernas de la Montaña Dorf";
  } catch (e) {}

  try {
    if (typeof td !== "undefined" && Array.isArray(td)) {
      for (const g of td) {
        if ((g.biomes?.includes("ruins") || g.biomes?.includes("catacombs")) && !g.biomes.includes("dorf_cave")) {
          g.biomes.push("dorf_cave");
        }
      }
    }
    if (typeof js !== "undefined") {
      const refPools = js.fortress?.pools || js.ruins?.pools || [
        "dragon_sword", "bulwark_blade", "tower_shield", "ember_bow", "inferno_staff",
        "soul_reaper", "great_sword", "war_hammer", "long_bow", "arcane_staff",
        "assassin_dagger", "colossus_sword", "hunter_bow", "ruins_staff",
        "colossus_plate", "armor", "helmet", "ring", "amulet", "potion"
      ];
      // Poucos baús na caverna, mas cada um guarda equipamento Raro, Épico ou Lendário + Moedas do Ferreiro
      js.dorf_cave = {
        rolls: 2,
        gold: { min: 22, max: 45 },
        pools: refPools,
        rarities: { COMMON: 0, UNCOMMON: 10, RARE: 52, EPIC: 28, LEGENDARY: 10 }
      };
    }
    if (typeof ed !== "undefined") {
      ed.dorf_cave = {
        common: ["GOBLIN", "GOBLIN_ARCHER", "GOBLIN_ASSASSIN", "SKELETON", "SKELETON_WARRIOR", "ORC"],
        uncommon: ["ORC_WARRIOR", "ORC_BRUTE", "SKELETON_MAGE", "NECRO_SHADE", "MB_CINDER_STALKER", "MB_CRYSTAL_SAGE"],
        elite: ["MB_BASALT_COLOSSUS", "TROLL", "CYCLOPS", "DEMON"],
        bosses: ["ANCIENT_COLOSSUS", "ABYSS_GUARDIAN"]
      };
    }
  } catch (e) {}

  // Hook em _l.prototype.carve para usar diretamente a malha orgânica (__organicGrid) antes de criar wallLayer
  if (typeof _l !== "undefined" && _l.prototype && !_l.prototype.__dorfCarveHooked) {
    _l.prototype.__dorfCarveHooked = true;
    const __origCarve = _l.prototype.carve;
    _l.prototype.carve = function () {
      if (this.level?.__organicGrid) {
        this.grid = this.level.__organicGrid.map((row) => row.slice());
        return;
      }
      return __origCarve.apply(this, arguments);
    };
  }

  // Hook no Minimapa (class Id) para desenhar o contorno orgânico da caverna em vez de retângulos de salas
  if (typeof Id !== "undefined" && Id.prototype && !Id.prototype.__dorfMinimapHooked) {
    Id.prototype.__dorfMinimapHooked = true;
    const __origRedraw = Id.prototype.redraw;
    Id.prototype.redraw = function (i, t) {
      const gs = this.scene?.scene?.get?.("Game");
      if (gs?.isDorfCave && gs.level?.__organicGrid) {
        if (this.touchOn) {
          this.panel?.setVisible(false);
          this.parch?.setVisible(false);
          this.map?.setVisible(false);
          this.title?.setVisible(false);
          return;
        }
        this.panel?.setVisible(true);
        this.parch?.setVisible(true);
        this.map?.setVisible(true);
        this.title?.setVisible(true);
        const __n = performance.now();
        if (this.__rl && __n - this.__rl < 80) return;
        this.__rl = __n;
        const e = this.map;
        const C = gs.level.world.cols, R = gs.level.world.rows;
        if (this.setWorld(C, R)) this.layout();
        const d = this.mapScale;
        const __tk = "dorf_cave|" + this.width;
        e.clear();
        if (this.__tk !== __tk) {
          this.__tk = __tk;
          this.title.setText("CAVERNAS DORF");
        }
        e.fillStyle(0x5c4438, 0.88);
        for (const sp of gs.level.corridors || []) {
          e.fillRect(this.tx(sp.x), this.ty(sp.y), Math.max(1, sp.w * d), Math.max(1, d + 0.35));
        }
        e.fillStyle(0x3b6e4c, 0.85);
        for (const mz of gs.level.__mossZones || []) {
          e.fillCircle(this.tx(mz.cx), this.ty(mz.cy), Math.max(2, mz.rx * d * 0.65));
        }
        const pts = gs.__dorfPortals || (gs.__dorfReturnPortal ? [gs.__dorfReturnPortal] : []);
        for (const pt of pts) {
          e.fillStyle(0x38bdf8, 1);
          e.fillCircle(this.tx(pt.x / 32), this.ty(pt.y / 32), 2.5);
        }
        if (t) {
          e.fillStyle(0x2c2013, 1).fillCircle(this.tx(t.x / 32), this.ty(t.y / 32), 3);
          e.fillStyle(0xffd24a, 1).fillCircle(this.tx(t.x / 32), this.ty(t.y / 32), 2);
        }
        return;
      }
      return __origRedraw.apply(this, arguments);
    };
  }
})();

/* 2) Gerador Procedural Amplo e Orgânico por Entrada (__buildDorfCaveLevel)
      Não explora profundidades e não usa salas retangulares padrão. */
function __buildDorfCaveLevel(runCfg = {}) {
  const salt = runCfg.freshSeed || `${Date.now()}_${Math.floor(Math.random() * 1e9)}_${++__dorfN}`;
  const seedStr = `${runCfg.seed || "dorf"}_${salt}`;
  let sd = seedStr.split("").reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 19) >>> 0;
  const rnd = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
  const pick = (a) => a[(rnd() * a.length) | 0];
  const between = (a, b) => a + rnd() * (b - a);

  // Mapa amplo (110x88 tiles): salões grandes separados por rocha, ligados por corredores estreitos
  const C = 110, R = 88;
  const grid = Array.from({ length: R }, () => new Array(C).fill(1));

  // Posicionamento procedural das câmaras (cada entrada gera uma caverna diferente)
  const NAMES = {
    START: ["Fenda de Entrada", "Pórtico de Basalto", "Boca da Montanha"],
    MOSS: ["Santuário do Musgo Antigo", "Jardim dos Vasos Luminescentes", "Clareira do Musgo Luminoso", "Terraço Verdejante"],
    OPEN: ["Vale Subterrâneo de Dorf", "Galeria dos Cogumelos Gigantes", "Encruzilhada de Basalto", "Salão dos Ecos"],
    DARK_ROCK: ["Floresta de Estalagmites", "Galeria das Colunas Rubras", "Vale das Sombras Antigas"],
    ALCOVE_LOOT: ["Veio de Cobalto Escondido", "Fenda dos Cristais Azuis", "Recanto dos Mineiros", "Gruta Esquecida"],
    SANCTUARY: ["Coração da Montanha Dorf", "Altar da Montanha Dorf"]
  };
  const plan = ["OPEN", "MOSS", "DARK_ROCK", "OPEN", "MOSS", "DARK_ROCK", "OPEN", "ALCOVE_LOOT", "ALCOVE_LOOT", "ALCOVE_LOOT", "ALCOVE_LOOT"];
  if (rnd() < 0.6) plan.push(pick(["MOSS", "OPEN", "DARK_ROCK"]));
  const size = (k) => k === "START" ? [7.5, 5.2] : k === "ALCOVE_LOOT" ? [between(4.4, 5.6), between(3.6, 4.3)] : k === "SANCTUARY" ? [between(10, 11.5), between(6.8, 7.6)] : rnd() < 0.45 ? [between(10.5, 13), between(7, 8.6)] : [between(7.2, 9.2), between(5.2, 6.4)];
  const nodes = [];
  const fits = (cx, cy, rx, ry) => cx - rx > 7 && cx + rx < C - 7 && cy - ry > 9 && cy + ry < R - 6 &&
    nodes.every((o) => Math.abs(cx - o.cx) > rx + o.rx + 6 || Math.abs(cy - o.cy) > ry + o.ry + 7);
  const place = (kind, tries = 500, far = null) => {
    const [rx, ry] = size(kind);
    let best = null, bestD = -1;
    for (let t = 0; t < tries; t++) {
      const cx = between(rx + 8, C - rx - 8), cy = kind === "START" ? between(13, 17) : between(ry + 10, R - ry - 7);
      if (!fits(cx, cy, rx, ry)) continue;
      if (!far) { best = [cx, cy]; break }
      const d = Math.hypot(cx - far.cx, (cy - far.cy) * 1.2);
      if (d > bestD) { bestD = d; best = [cx, cy] }
    }
    if (!best) return null;
    const nd = { id: kind.toLowerCase() + "_" + nodes.length, name: pick(NAMES[kind]), cx: best[0], cy: best[1], rx, ry, kind };
    nodes.push(nd);
    return nd;
  };
  const start = place("START");
  place("SANCTUARY", 160, start);
  for (const k of plan) place(k);

  // Ligações: árvore geradora mínima entre salões + 2 laços; alcovas ficam como becos
  const big = nodes.filter((n) => n.kind !== "ALCOVE_LOOT");
  const edges = [];
  const dist = (A, B) => Math.hypot(A.cx - B.cx, (A.cy - B.cy) * 1.15);
  const inT = new Set([big[0]]);
  while (inT.size < big.length) {
    let bb = null;
    for (const A of inT) for (const Bn of big) if (!inT.has(Bn)) { const d = dist(A, Bn); if (!bb || d < bb[2]) bb = [A, Bn, d] }
    inT.add(bb[1]); edges.push([nodes.indexOf(bb[0]), nodes.indexOf(bb[1])]);
  }
  const extra = [];
  for (let i = 0; i < big.length; i++) for (let k = i + 1; k < big.length; k++) {
    const ia = nodes.indexOf(big[i]), ib = nodes.indexOf(big[k]);
    if (!edges.some(([x, y]) => (x === ia && y === ib) || (x === ib && y === ia))) extra.push([ia, ib, dist(big[i], big[k])]);
  }
  extra.sort((x, y) => x[2] - y[2]).slice(0, 2).forEach(([x, y]) => edges.push([x, y]));
  for (const al of nodes.filter((n) => n.kind === "ALCOVE_LOOT")) {
    let bn = null; for (const Bn of big) if (!bn || dist(al, Bn) < dist(al, bn)) bn = Bn;
    edges.push([nodes.indexOf(bn), nodes.indexOf(al)]);
  }
  // Ilhas de rocha dentro dos maiores salões (pilares naturais)
  const rockIslands = big.filter((n) => n.rx > 10.5 && n.kind !== "START" && rnd() < 0.55).map((n) => ({ cx: n.cx + between(-2, 2), cy: n.cy + between(-1, 1), rx: between(2.6, 3.4), ry: between(2.2, 2.8) }));
  const flipX = false;
  const carveDisk = (cx, cy, rx, ry, ph1 = 0, ph2 = 0, val = 0) => {
    const x0 = Math.max(4, Math.floor(cx - rx - 3));
    const x1 = Math.min(C - 5, Math.ceil(cx + rx + 3));
    const y0 = Math.max(6, Math.floor(cy - ry - 3));
    const y1 = Math.min(R - 5, Math.ceil(cy + ry + 3));
    for (let r = y0; r <= y1; r++) {
      for (let c = x0; c <= x1; c++) {
        const ang = Math.atan2(r - cy, c - cx);
        const wob = 1.0 + 0.15 * Math.sin(ang * 3 + ph1) + 0.10 * Math.cos(ang * 5 + ph2);
        const d2 = ((c - cx) / (rx * wob)) ** 2 + ((r - cy) / (ry * wob)) ** 2;
        if (d2 <= 1.0) grid[r][c] = val;
      }
    }
  };

  // 1) Esculpir grandes clareiras multi-lobulares orgânicas
  for (const nd of nodes) {
    const p1 = between(0, 6.28), p2 = between(0, 6.28);
    carveDisk(nd.cx, nd.cy, nd.rx, nd.ry, p1, p2, 0);
    const lobes = nd.kind === "ALCOVE_LOOT" ? 2 : 3;
    for (let k = 0; k < lobes; k++) {
      const a = between(0, 6.28);
      const ox = nd.cx + Math.cos(a) * nd.rx * 0.42;
      const oy = nd.cy + Math.sin(a) * nd.ry * 0.38;
      carveDisk(ox, oy, nd.rx * 0.6, nd.ry * 0.56, p1 + k * 1.7, p2 - k * 1.3, 0);
    }
  }

  // 2) Corredores estreitos e sinuosos entre os salões (3 a 4 tiles; becos das alcovas com 3)
  for (const [i, k] of edges) {
    const A = nodes[i], B = nodes[k];
    const isAlcove = A.kind === "ALCOVE_LOOT" || B.kind === "ALCOVE_LOOT";
    const L = Math.hypot(B.cx - A.cx, B.cy - A.cy) || 1;
    const nx = -(B.cy - A.cy) / L, ny = (B.cx - A.cx) / L;
    const bend = between(-0.28, 0.28) * L;
    const mx = (A.cx + B.cx) * 0.5 + nx * bend, my = (A.cy + B.cy) * 0.5 + ny * bend;
    const steps = Math.ceil(L * 3);
    const ph = between(0, 6.28), fq = between(2, 4);
    for (let st = 0; st <= steps; st++) {
      const t = st / steps, u = 1 - t;
      const wig = Math.sin(t * Math.PI * fq + ph) * 1.6 * Math.sin(t * Math.PI);
      const x = u * u * A.cx + 2 * u * t * mx + t * t * B.cx + nx * wig;
      const y = u * u * A.cy + 2 * u * t * my + t * t * B.cy + ny * wig;
      const w = (isAlcove ? 1.45 : 1.75) + 0.3 * Math.sin(t * 9 + ph);
      carveDisk(x, y, w, w * 0.92, ph, ph * 0.6, 0);
    }
  }

  // 2b) Inserir penínsulas/ilhas rochosas abissais entre os grandes salões (como na Imagem 3)
  for (const isl of rockIslands) {
    carveDisk(isl.cx, isl.cy, isl.rx, isl.ry, between(0, 6.28), between(0, 6.28), 1);
  }

  // 3) Garantir nicho de entrada norte para o Arco do Portal de Entrada
  const st = nodes[0];
  let spCol = Math.round(st.cx), spRow = Math.round(st.cy) - 1;
  while (spRow > 6 && grid[spRow - 1][spCol] === 0) spRow--;
  for (let dc = -2; dc <= 1; dc++) {
    const cc = Math.max(5, Math.min(C - 6, spCol + dc));
    for (let r = 0; r < spRow; r++) grid[r][cc] = 1;
    for (let r = spRow; r <= spRow + 4 && r < R - 4; r++) grid[r][cc] = 0;
  }
  const playerSpawn = { col: spCol, row: spRow + 2 };

  // 4) Suavização celular (Cellular Automata) para contornos 100% naturais
  for (let pass = 0; pass < 2; pass++) {
    const next = grid.map((r) => r.slice());
    for (let r = 6; r < R - 4; r++) {
      for (let c = 4; c < C - 4; c++) {
        if (Math.abs(c - spCol) <= 3 && Math.abs(r - spRow) <= 3) continue;
        let floors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            if (grid[r + dy][c + dx] === 0) floors++;
          }
        }
        if (grid[r][c] === 1 && floors >= 5) next[r][c] = 0;
        else if (grid[r][c] === 0 && floors <= 2) next[r][c] = 1;
      }
    }
    for (let r = 6; r < R - 4; r++) for (let c = 4; c < C - 4; c++) grid[r][c] = next[r][c];
  }

  // 4b) Remover dentes de 1 tile (bordas sem "recortes"): pontas isoladas viram piso, buracos isolados viram rocha
  for (let pass = 0; pass < 3; pass++) {
    for (let r = 6; r < R - 4; r++) for (let c = 4; c < C - 4; c++) {
      if (Math.abs(c - spCol) <= 3 && Math.abs(r - spRow) <= 3) continue;
      const n4 = (grid[r - 1][c] === 0) + (grid[r + 1][c] === 0) + (grid[r][c - 1] === 0) + (grid[r][c + 1] === 0);
      if (grid[r][c] === 1 && (n4 >= 3 || (grid[r][c - 1] === 0 && grid[r][c + 1] === 0) || (grid[r - 1][c] === 0 && grid[r + 1][c] === 0))) grid[r][c] = 0;
      else if (grid[r][c] === 0 && n4 <= 1) grid[r][c] = 1;
    }
  }

  // 5) Quebrar paredes horizontais longas (> 3 colunas) para criar o efeito de falésias de basalto em degraus
  for (let r = 6; r < R - 5; r++) {
    let run = 0;
    for (let c = 4; c < C - 4; c++) {
      if (Math.abs(c - spCol) <= 3 && Math.abs(r - spRow) <= 3) { run = 0; continue; }
      if (grid[r][c] === 0 && grid[r - 1][c] === 1) {
        run++;
        if (run >= 7 && rnd() < 0.3) {
          if (r + 3 < R - 4 && grid[r + 1][c] === 0 && grid[r + 2][c] === 0) {
            grid[r][c] = 1;
          }
          run = 0;
        }
      } else {
        run = 0;
      }
    }
  }

  // 6) Regra de espessura vertical de parede (>= 5 tiles) para falésias de basalto de 3 tiles + borda sul + abismo
  for (let c = 0; c < C; c++) {
    for (let r = 0; r < 5; r++) grid[r][c] = 1;
    for (let r = R - 3; r < R; r++) grid[r][c] = 1;
  }
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < 3; c++) grid[r][c] = 1;
    for (let c = C - 3; c < C; c++) grid[r][c] = 1;
  }
  for (let iter = 0; iter < 3; iter++) {
    for (let c = 3; c < C - 3; c++) {
      let r = 0;
      while (r < R) {
        if (grid[r][c] === 1) {
          const r0 = r;
          while (r < R && grid[r][c] === 1) r++;
          const r1 = r;
          if (r0 > 0 && r1 < R) {
            const h = r1 - r0;
            if (h <= 2) {
              for (let rr = r0; rr < r1; rr++) grid[rr][c] = 0;
            } else if (h < 5) {
              const need = 5 - h;
              for (let k = 0; k < need; k++) {
                if (r1 + k < R - 3) grid[r1 + k][c] = 1;
              }
            }
          }
        } else {
          r++;
        }
      }
    }
  }

  // 7) Garantir conectividade total a partir de playerSpawn via Flood Fill (BFS)
  const ensureConnected = () => {
    const vis = Array.from({ length: R }, () => new Array(C).fill(false));
    const q = [[playerSpawn.col, playerSpawn.row]];
    grid[playerSpawn.row][playerSpawn.col] = 0;
    vis[playerSpawn.row][playerSpawn.col] = true;
    while (q.length) {
      const [cx, cy] = q.shift();
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (nx >= 3 && nx < C - 3 && ny >= 5 && ny < R - 3 && !vis[ny][nx] && grid[ny][nx] === 0) {
          vis[ny][nx] = true;
          q.push([nx, ny]);
        }
      }
    }
    return vis;
  };

  let vis = ensureConnected();
  // Se algum nó importante ficou desconectado por uma ilha rochosa, abrir passagem de 3 tiles até playerSpawn
  for (const nd of nodes) {
    const nc = Math.max(5, Math.min(C - 6, Math.round(nd.cx)));
    const nr = Math.max(7, Math.min(R - 6, Math.round(nd.cy)));
    if (!vis[nr]?.[nc]) {
      const steps = 40;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const x = Math.round(playerSpawn.col + (nc - playerSpawn.col) * t);
        const y = Math.round(playerSpawn.row + (nr - playerSpawn.row) * t);
        for (let dy = -2; dy <= 2; dy++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (y + dy >= 6 && y + dy < R - 4 && x + dx >= 4 && x + dx < C - 4) {
              grid[y + dy][x + dx] = 0;
            }
          }
        }
      }
    }
  }
  vis = ensureConnected();
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 0 && !vis[r][c]) grid[r][c] = 1;
    }
  }

  const nearestFloor = (tc, tr, minClear = 1) => {
    tc = Math.round(tc); tr = Math.round(tr);
    for (let rad = 0; rad < 22; rad++) {
      for (let dy = -rad; dy <= rad; dy++) {
        for (let dx = -rad; dx <= rad; dx++) {
          const c = tc + dx, r = tr + dy;
          if (c < 4 || c >= C - 4 || r < 6 || r >= R - 4) continue;
          let ok = true;
          for (let yy = -minClear; yy <= minClear && ok; yy++) {
            for (let xx = -minClear; xx <= minClear && ok; xx++) {
              if (grid[r + yy]?.[c + xx] !== 0) ok = false;
            }
          }
          if (ok) return { col: c, row: r };
        }
      }
    }
    return { col: playerSpawn.col, row: playerSpawn.row + 1 };
  };

  // 8) Spans horizontais em `corridors` (usados pelo minimapa orgânico)
  const corridors = [];
  for (let r = 0; r < R; r++) {
    let c = 0;
    while (c < C) {
      if (grid[r][c] === 0) {
        const c0 = c;
        while (c < C && grid[r][c] === 0) c++;
        corridors.push({ x: c0, y: r, w: c - c0, h: 1 });
      } else {
        c++;
      }
    }
  }

  // 9) Inimigos reais do jogo (chaves validadas em `ee`) e poucos baús valiosos nas fendas ocultas
  const enemyPools = {
    common: ["GOBLIN", "GOBLIN_ARCHER", "GOBLIN_ASSASSIN", "SKELETON", "SKELETON_WARRIOR", "ORC"],
    mid: ["ORC_WARRIOR", "ORC_BRUTE", "SKELETON_MAGE", "NECRO_SHADE", "MB_CINDER_STALKER", "MB_CRYSTAL_SAGE"],
    elite: ["MB_BASALT_COLOSSUS", "TROLL", "CYCLOPS", "DEMON"]
  };

  const mossZones = [];
  const darkZones = [];
  const decor = [];
  const caveEnemies = [];
  let sanctuaryNode = null;

  // Escolher no máximo 2 ou 3 alcovas para conter os baús raros (escassos e valiosos!)
  const alcoveNodes = nodes.filter((n) => n.kind === "ALCOVE_LOOT");
  const maxAlcoveChests = rnd() < 0.45 ? 3 : 2;
  const activeChestAlcoves = new Set(alcoveNodes.slice(0, maxAlcoveChests).map((n) => n.id));

  nodes.forEach((nd) => {
    const center = nearestFloor(nd.cx, nd.cy, 1);
    nd.cx = center.col;
    nd.cy = center.row;

    if (nd.kind === "MOSS") {
      mossZones.push({ cx: center.col, cy: center.row, rx: nd.rx * 0.72, ry: nd.ry * 0.66 });
    } else if (nd.kind === "DARK_ROCK" || nd.kind === "SANCTUARY") {
      darkZones.push({ cx: center.col, cy: center.row, rx: nd.rx * 0.76, ry: nd.ry * 0.72 });
    }

    if (nd.kind === "START") {
      // Entrada pacífica junto ao portal
      return;
    }

    if (nd.kind === "ALCOVE_LOOT") {
      if (activeChestAlcoves.has(nd.id)) {
        const chSpot = nearestFloor(center.col, center.row - 1, 1);
        const tier = rnd() < 0.18 ? "LEGENDARY" : rnd() < 0.55 ? "EPIC" : "RARE";
        decor.push({
          type: "chest",
          col: chSpot.col,
          row: chSpot.row,
          tier: tier,
          noMimic: true,
          dorfCache: true
        });
      }
      const guardCount = 2;
      for (let k = 0; k < guardCount; k++) {
        const ep = nearestFloor(center.col + (k ? 2 : -2), center.row + 1, 0);
        caveEnemies.push({
          type: pick(k === 0 ? enemyPools.mid : enemyPools.common),
          col: ep.col,
          row: ep.row,
          elite: k === 0 && rnd() < 0.35
        });
      }
    } else if (nd.kind === "SANCTUARY") {
      sanctuaryNode = nd;
      const bossSpot = nearestFloor(center.col, center.row, 1);
      // Chefe Guardião do Abismo / Colosso Ancestral livre para caçar na caverna
      caveEnemies.push({
        type: pick(["MB_BASALT_COLOSSUS", "CYCLOPS", "TROLL"]),
        col: bossSpot.col,
        row: bossSpot.row,
        elite: true,
        isCaveBoss: true
      });
      for (let k = 0; k < 3; k++) {
        const ang = (k / 3) * Math.PI * 2;
        const ep = nearestFloor(center.col + Math.cos(ang) * 3.5, center.row + Math.sin(ang) * 2.5, 0);
        caveEnemies.push({
          type: pick(rnd() < 0.5 ? enemyPools.mid : enemyPools.common),
          col: ep.col,
          row: ep.row,
          elite: false
        });
      }
      // 1 Arca Ancestral guardada pelo Chefe no Santuário se houver apenas 2 alcovas ativas
      if (activeChestAlcoves.size <= 2) {
        const cSpot = nearestFloor(center.col + 3, center.row - 1, 1);
        decor.push({
          type: "chest",
          col: cSpot.col,
          row: cSpot.row,
          tier: rnd() < 0.35 ? "LEGENDARY" : "EPIC",
          noMimic: true,
          dorfCache: true
        });
      }
    } else {
      // Grandes clareiras abertas de exploração: patrulhas naturais espalhadas e mini-chefes livres
      const isLargeGlade = nd.rx >= 10 && nd.id !== "coracao_dorf";
      if (isLargeGlade && rnd() < 0.45) {
        const eliteSpot = nearestFloor(center.col + 1, center.row + 1, 1);
        caveEnemies.push({
          type: pick(["MB_CRYSTAL_SAGE", "MB_CINDER_STALKER", "TROLL"]),
          col: eliteSpot.col,
          row: eliteSpot.row,
          elite: true,
          isCaveBoss: true
        });
      }
      const count = 2 + (rnd() < 0.65 ? 1 : 0);
      for (let k = 0; k < count; k++) {
        const ang = (k / count) * Math.PI * 2 + between(-0.4, 0.4);
        const ep = nearestFloor(center.col + Math.cos(ang) * 4.0, center.row + Math.sin(ang) * 2.8, 0);
        caveEnemies.push({
          type: pick(k === 0 && rnd() < 0.5 ? enemyPools.mid : enemyPools.common),
          col: ep.col,
          row: ep.row,
          elite: k === 0 && rnd() < 0.18
        });
      }
    }
  });

  // 1 única zona contínua abrangendo toda a caverna para não existir transição/trancamento de salas!
  const rooms = [
    {
      id: "dorf_expanse",
      name: "Cavernas da Montanha Dorf",
      roomType: "START",
      rect: { x: 2, y: 2, w: C - 4, h: R - 4 },
      walls: [],
      enemies: [],
      decor: decor,
      ambient: 0.62,
      exit: false
    }
  ];

  return {
    id: "dorf_cave",
    biome: "dorf_cave",
    name: "Cavernas da Montanha Dorf",
    depth: 1,
    seed: seedStr,
    endless: false,
    next: null,
    theme: Ls.dorf_cave,
    world: { cols: C, rows: R },
    playerSpawn: playerSpawn,
    rooms: rooms,
    corridors: corridors,
    doors: [], // Zero portas: cenário exploratório contínuo!
    __organicGrid: grid,
    __mossZones: mossZones,
    __darkZones: darkZones,
    __nodes: nodes,
    __sanctuaryNode: sanctuaryNode,
    __caveEnemies: caveEnemies
  };
}

if (typeof window !== "undefined") {
  window.__buildDorfCaveLevel = __buildDorfCaveLevel;
}

/* 3) Renderizador 2.5D Realista das Cavernas Dorf (__dorfBake) */
function __dorfBake(B) {
  const S = B.scene, M = S.cache.json.get("dorf-atlas");
  if (S.isDorfCave) { S.__dorfEnemiesSpawned = false; S.__dorfExiting = false; S.__dorfFalling = false; S.__dorfHunterTickRegistered = false; S.__cobaltVeinsDone = false; S.__dorfCoinTxt = null; S.__cobaltOres = []; S.__cobaltRun = 0 }
  if (!M || !S.textures.exists("dorf-atlas")) return false;

  if (B.level?.__organicGrid) {
    for (let r = 0; r < B.rows; r++) {
      for (let c = 0; c < B.cols; c++) {
        B.grid[r][c] = B.level.__organicGrid[r]?.[c] ?? 1;
      }
    }
  }

  const texObj = S.textures.get("dorf-atlas");
  if (M.frames && texObj && !texObj.has("p-col-tall-fern")) {
    for (const [k, rect] of Object.entries(M.frames)) {
      if (!texObj.has(k)) texObj.add(k, 0, rect[0], rect[1], rect[2], rect[3]);
    }
  }

  const src = texObj.getSourceImage();
  const C = B.cols, R = B.rows, T = dt || 32, key = "dorfb-" + ++__dorfN;
  const tx = S.textures.createCanvas(key, C * T, R * T), g = tx.getContext();
  g.imageSmoothingEnabled = false;

  let sd = String(B.level.seed ?? "dorf")
    .split("")
    .reduce((a, c) => ((a * 31 + c.charCodeAt(0)) | 0), 13) >>> 0;
  const rnd = () => (sd = (sd * 1664525 + 1013904223) >>> 0) / 4294967296;
  const pick = (a) => a[(rnd() * a.length) | 0];
  const F = (c, r) => c >= 0 && r >= 0 && c < C && r < R && !B.isWallTile(c, r);
  const D = (q, x, y, sw = q[2], sh = q[3]) => {
    if (!q) return;
    g.drawImage(src, q[0], q[1], q[2], q[3], Math.round(x), Math.round(y), Math.round(sw), Math.round(sh));
  };

  // 1) Fundo abissal escuro (#0d0a10)
  g.fillStyle = "#0d0a10";
  g.fillRect(0, 0, C * T, R * T);

  // 2) Mapa de musgo hexagonal orgânico e solo vulcânico escuro
  const isMoss = Array.from({ length: R }, () => new Array(C).fill(false));
  const isDark = Array.from({ length: R }, () => new Array(C).fill(false));
  const mossZones = B.level.__mossZones || [];
  const darkZones = B.level.__darkZones || [];

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (!F(c, r)) continue;
      for (const mz of mossZones) {
        const ang = Math.atan2(r - mz.cy, c - mz.cx);
        const wob = 1.0 + 0.14 * Math.sin(ang * 3 + mz.cx) + 0.09 * Math.cos(ang * 4 - mz.cy);
        const d2 = ((c - mz.cx) / (mz.rx * wob)) ** 2 + ((r - mz.cy) / (mz.ry * wob)) ** 2;
        if (d2 <= 1.0 && F(c, r - 1) && F(c, r + 1) && F(c - 1, r) && F(c + 1, r)) {
          isMoss[r][c] = true;
          break;
        }
      }
      if (!isMoss[r][c]) {
        for (const dz of darkZones) {
          const d2 = ((c - dz.cx) / dz.rx) ** 2 + ((r - dz.cy) / dz.ry) ** 2;
          if (d2 <= 1.0) {
            isDark[r][c] = true;
            break;
          }
        }
      }
    }
  }

  // 3) Desenhar Pisos (Terra Marrom, Solo Escuro, Musgo Hexagonal com Bordas Autotile, Crateras e Tufos)
  const mb = M.floor.mossBorder;
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (!F(c, r)) continue;
      const x = c * T, y = r * T;
      if (isMoss[r][c] && mb) {
        const mn = isMoss[r - 1]?.[c] ?? false;
        const ms = isMoss[r + 1]?.[c] ?? false;
        const mw = isMoss[r]?.[c - 1] ?? false;
        const me = isMoss[r]?.[c + 1] ?? false;
        if (!mn && !mw) D(mb.nw, x, y);
        else if (!mn && !me) D(mb.ne, x, y);
        else if (!ms && !mw) D(mb.sw, x, y);
        else if (!ms && !me) D(mb.se, x, y);
        else if (!mn) D(pick(mb.n), x, y);
        else if (!ms) D(pick(mb.s), x, y);
        else if (!mw) D(pick(mb.w), x, y);
        else if (!me) D(pick(mb.e), x, y);
        else D(pick(M.floor.moss), x, y);
      } else {
        const p = rnd();
        if (p < 0.068 && M.floor.craters?.length) {
          D(pick(M.floor.craters), x, y);
        } else if (p < 0.155 && M.floor.tufts?.length) {
          D(pick(M.floor.tufts), x, y);
        } else {
          D(pick(M.floor.dirt), x, y);
        }
      }
    }
  }

  // 3b) Manchas de sombra orgânicas (máscara de ruído em blocos de 4px, bordas irregulares como no pack)
  try {
    const P = 4, MW = Math.ceil((C * T) / P), MH = Math.ceil((R * T) / P);
    const hsh = (x, y) => { let h = (x * 374761393 + y * 668265263 + (sd & 0xffff) * 2246822519) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296 };
    const vn = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = hsh(xi, yi), b = hsh(xi + 1, yi), c2 = hsh(xi, yi + 1), d = hsh(xi + 1, yi + 1); return a + (b - a) * u + (c2 - a) * v + (a - b - c2 + d) * u * v };
    const fbm = (x, y) => vn(x / 22, y / 22) * 0.55 + vn(x / 9, y / 9) * 0.3 + vn(x / 4, y / 4) * 0.15;
    const val = new Float32Array(MW * MH);
    const zones = darkZones.map((z) => ({ cx: z.cx, cy: z.cy, rx: z.rx * 1.05, ry: z.ry * 1.0 }));
    // sombras menores espalhadas (sob formações e nos cantos), como nas referências
    const nSmall = Math.round((C * R) / 260);
    for (let k = 0, tries = 0; k < nSmall && tries < nSmall * 20; tries++) {
      const c = 2 + ((rnd() * (C - 4)) | 0), r = 2 + ((rnd() * (R - 4)) | 0);
      if (!F(c, r)) continue;
      zones.push({ cx: c + 0.5, cy: r + 0.5, rx: 1.6 + rnd() * 2.6, ry: 1.2 + rnd() * 1.8 }); k++;
    }
    for (const z of zones) {
      const x0 = Math.max(0, Math.floor(((z.cx - z.rx * 1.5) * T) / P)), x1 = Math.min(MW - 1, Math.ceil(((z.cx + z.rx * 1.5) * T) / P));
      const y0 = Math.max(0, Math.floor(((z.cy - z.ry * 1.5) * T) / P)), y1 = Math.min(MH - 1, Math.ceil(((z.cy + z.ry * 1.5) * T) / P));
      for (let my = y0; my <= y1; my++) for (let mx = x0; mx <= x1; mx++) {
        const tx_ = (mx * P) / T, ty_ = (my * P) / T;
        const d2 = ((tx_ - z.cx) / z.rx) ** 2 + ((ty_ - z.cy) / z.ry) ** 2;
        const v = 1 - d2; const i = my * MW + mx; if (v > val[i]) val[i] = v;
      }
    }
    const mc = document.createElement("canvas"); mc.width = MW; mc.height = MH;
    const mg = mc.getContext("2d"), id = mg.createImageData(MW, MH), dd = id.data;
    let any = 0;
    for (let my = 0; my < MH; my++) for (let mx = 0; mx < MW; mx++) {
      const i = my * MW + mx; if (val[i] <= -0.6) continue;
      const c = Math.floor((mx * P) / T), r = Math.floor((my * P) / T);
      if (!F(c, r)) continue;
      const v = val[i] * 1.15 + (fbm(mx, my) - 0.5) * 1.5;
      if (v > 0.3) { const o = i * 4; dd[o] = 122; dd[o + 1] = 114; dd[o + 2] = 118; dd[o + 3] = 255; any++ }
    }
    if (any) {
      mg.putImageData(id, 0, 0);
      g.save(); g.imageSmoothingEnabled = false; g.globalCompositeOperation = "multiply";
      g.drawImage(mc, 0, 0, MW, MH, 0, 0, MW * P, MH * P); g.restore();
    }
  } catch (e) { console.warn("[dorf_cave] sombras", e) }

  // 4) Marcar células ocupadas pelas paredes norte de basalto (3 tiles de altura: r-1, r-2, r-3)
  const hasNCol = Array.from({ length: R }, () => new Array(C).fill(false));
  for (let r = 1; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (F(c, r) && !F(c, r - 1)) {
        for (let k = 1; k <= 3; k++) {
          if (r - k >= 0) hasNCol[r - k][c] = true;
        }
      }
    }
  }

  // 5) Bordas Laterais (Leste/Oeste) e Borda Sul de Basalto (incluindo penínsulas rochosas internas!)
  if (M.wall.south && M.wall.sideL && M.wall.sideR) {
    for (let r = 0; r < R; r++) {
      for (let c = 0; c < C; c++) {
        if (F(c, r) || hasNCol[r][c]) continue;
        const fn = F(c, r - 1);
        const fw = F(c - 1, r);
        const fe = F(c + 1, r);
        const x = c * T, y = r * T;
        if (fn) {
          D(M.wall.south[(c + r) % M.wall.south.length], x, y);
        } else if (fe) {
          D(M.wall.sideL[r % M.wall.sideL.length], x, y);
        } else if (fw) {
          D(M.wall.sideR[r % M.wall.sideR.length], x, y);
        } else if (F(c + 1, r - 1) && M.wall.cornerSW) {
          D(M.wall.cornerSW, x, y);
        } else if (F(c - 1, r - 1) && M.wall.cornerSE) {
          D(M.wall.cornerSE, x, y);
        } else if (F(c + 1, r + 1) && M.wall.cornerNW) {
          D(M.wall.cornerNW, x, y);
        } else if (F(c - 1, r + 1) && M.wall.cornerNE) {
          D(M.wall.cornerNE, x, y);
        }
      }
    }
  }

  // 6) Paredes Norte de Basalto de 3 Tiles de Altura (cap + mid + base + vinhas luminescentes)
  const grottoSpots = [];
  const sp = B.level.playerSpawn || { col: 18, row: 14 };

  for (let r = 1; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (!F(c, r) || F(c, r - 1)) continue;
      const x = c * T;
      const useGlow = rnd() < 0.26 && M.wall.glowCap?.length;
      const k = (c * 3 + r * 5) % M.wall.cap.length;
      const gk = (c * 3 + r * 5) % (M.wall.glowCap?.length || 1);

      if (useGlow) {
        if (r - 3 >= 0) D(M.wall.glowCap[gk], x, (r - 3) * T);
        if (r - 2 >= 0) D(M.wall.faceGlow[gk], x, (r - 2) * T);
        D(M.wall.glowBase[gk], x, (r - 1) * T);
      } else {
        if (r - 3 >= 0) D(M.wall.cap[k], x, (r - 3) * T);
        if (r - 2 >= 0) D(M.wall.mid[k], x, (r - 2) * T);
        D(M.wall.base[k], x, (r - 1) * T);
      }

      g.fillStyle = "rgba(8, 5, 12, 0.34)";
      g.fillRect(x, r * T, T, 6);

      if (
        c > 5 && c < C - 6 &&
        Math.hypot(c - sp.col, r - sp.row) > 9 &&
        F(c + 1, r) && !F(c + 1, r - 1) &&
        rnd() < 0.16
      ) {
        grottoSpots.push({ col: c, row: r });
      }
    }
  }

  // 7) Embutir Grotas Escuras (cave-grotto) na parede norte (como na Imagem de Referência 3)
  if (M.arches?.grotto) {
    let placedGrottos = 0;
    for (const gs of grottoSpots) {
      if (placedGrottos >= 4) break;
      if (grottoSpots.some((o) => o !== gs && o.__used && Math.hypot(o.col - gs.col, o.row - gs.row) < 11)) continue;
      gs.__used = true;
      placedGrottos++;
      D(M.arches.grotto, gs.col * T, (gs.row - 3) * T);
    }
  }

  // 8) Terraços de Pedra Cinza e Escadarias ao redor das Clareiras de Musgo (Imagens de Referência 2 e 3)
  const stairTiles = new Set();
  if (M.ledge) {
    for (const mz of mossZones) {
      const sc = Math.round(mz.cx);
      let sRow = Math.round(mz.cy);
      while (sRow < R - 4 && isMoss[sRow]?.[sc]) sRow++;
      if (F(sc, sRow) && F(sc + 1, sRow)) {
        D(M.stairs, sc * T, (sRow - 1) * T + 12);
        stairTiles.add(`${sc},${sRow}`);
        stairTiles.add(`${sc + 1},${sRow}`);
        stairTiles.add(`${sc},${sRow - 1}`);
        stairTiles.add(`${sc + 1},${sRow - 1}`);
      }
      let wCol = Math.round(mz.cx);
      while (wCol > 4 && isMoss[Math.round(mz.cy)]?.[wCol]) wCol--;
      let eCol = Math.round(mz.cx);
      while (eCol < C - 5 && isMoss[Math.round(mz.cy)]?.[eCol]) eCol++;
      if (F(wCol - 1, Math.round(mz.cy)) && M.ledge.pillarL) {
        D(M.ledge.pillarL, (wCol - 1) * T, (Math.round(mz.cy) - 1) * T);
      }
      if (F(eCol, Math.round(mz.cy)) && M.ledge.pillarR) {
        D(M.ledge.pillarR, eCol * T, (Math.round(mz.cy) - 1) * T);
      }
    }

    for (let r = 2; r < R - 2; r++) {
      for (let c = 2; c < C - 2; c++) {
        if (!F(c, r) || isMoss[r][c] || stairTiles.has(`${c},${r}`)) continue;
        const mn = isMoss[r - 1]?.[c] ?? false;
        const ms = isMoss[r + 1]?.[c] ?? false;
        const mw = isMoss[r]?.[c - 1] ?? false;
        const me = isMoss[r]?.[c + 1] ?? false;
        if (mn) {
          D(M.ledge.s[(c + r) % M.ledge.s.length], c * T, r * T);
        } else if (me && !mn && !ms) {
          D(M.ledge.l[r % M.ledge.l.length], c * T, r * T);
        } else if (mw && !mn && !ms) {
          D(M.ledge.r[r % M.ledge.r.length], c * T, r * T);
        }
      }
    }
  }

  // 9) Animações de Chamas de Cristal Ciano e Verde (32x64 por frame, 6 frames suaves sem piscar!)
  ["cyan", "green", "fire"].forEach((colKey) => {
    const frames = M.lights[colKey];
    if (!frames || !frames.length) return;
    frames.forEach((rect, idx) => {
      const fKey = `dorf-l32-${colKey}-${idx}`;
      if (!S.textures.exists(fKey)) {
        const c = S.textures.createCanvas(fKey, rect[2], rect[3]);
        const ctx = c.getContext();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(src, rect[0], rect[1], rect[2], rect[3], 0, 0, rect[2], rect[3]);
        c.refresh();
      }
    });
    const animKey = `dorf-light32-${colKey}`;
    if (!S.anims.exists(animKey)) {
      S.anims.create({
        key: animKey,
        frames: frames.map((_, idx) => ({ key: `dorf-l32-${colKey}-${idx}` })),
        frameRate: 8,
        repeat: -1
      });
    }
  });

  const spawnBrazier = (wx, wy, colKey = "cyan") => {
    const spr = S.add.sprite(wx, wy, `dorf-l32-${colKey}-0`)
      .setOrigin(0.5, 0.92)
      .setDepth(wy + 4);
    spr.play(`dorf-light32-${colKey}`);
    const tint = colKey === "cyan" ? 0x38bdf8 : colKey === "green" ? 0x4ade80 : 0xfbbf24;
    const gl = S.add.image(wx, wy - 16, "light")
      .setBlendMode(j.BlendModes.ADD)
      .setTint(tint)
      .setScale(0.52)
      .setAlpha(0.28)
      .setDepth(wy + 3);
    S.tweens.add({
      targets: gl,
      alpha: { from: 0.20, to: 0.34 },
      scale: { from: 0.48, to: 0.56 },
      duration: 1100 + Math.random() * 400,
      yoyo: true,
      repeat: -1
    });
    B.lightSources?.push({ x: wx, y: wy - 14, type: "MAGIC_CRYSTAL", color: tint, radius: 140 });
    return spr;
  };

  // 10) Portais de Retorno ao Refúgio (Entrada Norte + Santuário Distante)
  let wallRow = sp.row;
  while (wallRow > 3 && F(sp.col, wallRow - 1)) wallRow--;
  const archX = (sp.col - 2) * T;
  const archY = (wallRow - 3) * T;
  if (M.portalArch) {
    D(M.portalArch, archX, archY);
  }
  const spX = sp.col * T;
  const spY = wallRow * T + 8;

  spawnBrazier(spX - 38, spY + 2, "cyan");
  spawnBrazier(spX + 38, spY + 2, "cyan");

  // Segundo Portal de Retorno no Santuário Distante (para sair após explorar sem precisar voltar tudo a pé)
  let farPortalPos = null;
  const sNode = B.level.__sanctuaryNode;
  if (sNode) {
    let fCol = Math.round(sNode.cx), fRow = Math.round(sNode.cy);
    while (fRow > 5 && F(fCol, fRow - 1)) fRow--;
    if (!F(fCol, fRow - 1) && F(fCol - 1, fRow) && F(fCol + 1, fRow)) {
      if (M.portalArch) D(M.portalArch, (fCol - 2) * T, (fRow - 3) * T);
      farPortalPos = { x: fCol * T, y: fRow * T + 8, col: fCol, row: fRow };
      spawnBrazier(farPortalPos.x - 38, farPortalPos.y + 2, "cyan");
      spawnBrazier(farPortalPos.x + 38, farPortalPos.y + 2, "cyan");
    }
  }

  // 11) Adereços 2.5D com Y-Sorting Real e Proporções 1:1 (Estalagmites, Cogumelos, Samambaias, Vasos)
  const usedCells = new Set();
  const markUsed = (c, r, rad = 1) => {
    for (let dy = -rad; dy <= rad; dy++) {
      for (let dx = -rad; dx <= rad; dx++) usedCells.add(`${c + dx},${r + dy}`);
    }
  };
  markUsed(sp.col, sp.row, 3);
  markUsed(sp.col, wallRow, 3);
  if (farPortalPos) markUsed(farPortalPos.col, farPortalPos.row, 3);
  for (const rm of B.level.rooms || []) {
    for (const dc of rm.decor || []) markUsed(dc.col, dc.row, 2);
  }
  for (const en of B.level.__caveEnemies || []) {
    markUsed(en.col, en.row, 1);
  }

  // Obter grupo de sólidos do calabouço pré-configurado com colisões no jogador e inimigos
  const solidGroup = B.solids || (S.physics?.add ? S.physics.add.staticGroup() : null);

  const spawnProp25D = (frameKey, wx, wy, solidW = 0, solidH = 0, depthOffset = 0) => {
    if (!texObj.has(frameKey)) return null;
    const im = S.add.image(wx, wy, "dorf-atlas", frameKey)
      .setOrigin(0.5, 1)
      .setDepth(wy + depthOffset);
    if (solidW > 0 && solidH > 0 && solidGroup) {
      const z = S.add.zone(wx, wy - solidH * 0.5, solidW, solidH);
      S.physics.add.existing(z, true);
      solidGroup.add(z);
    }
    return im;
  };

  // A) Grandes formações de estalagmites encostadas nas falésias norte e curvas da caverna (Imagens 1, 2 e 3)
  const cliffCols = [
    "p-col-red-tall-fern", "p-col-red-spire-fern", "p-col-red-massive", "p-col-tall-fern",
    "p-col-spire-fern", "p-col-wide-fern", "p-col-massive-fern", "p-col-cluster", "p-col-red-cluster"
  ];
  for (let r = 6; r < R - 5; r++) {
    for (let c = 5; c < C - 5; c++) {
      if (!F(c, r) || F(c, r - 1)) continue;
      if (usedCells.has(`${c},${r}`)) continue;
      if (!F(c, r + 1) || !F(c, r + 2) || !F(c, r + 3) || !F(c - 1, r + 1) || !F(c + 1, r + 1)) continue;
      if (rnd() < 0.16) {
        const fk = isMoss[r + 1]?.[c]
          ? pick(["p-col-red-tall-fern", "p-col-red-spire-fern", "p-col-red-massive", "p-col-red-cluster"])
          : pick(cliffCols);
        const wx = c * T + T * 0.5;
        const wy = r * T + 24;
        spawnProp25D(fk, wx, wy, 28, 14, 0);
        markUsed(c, r, 3);
      }
    }
  }

  // B) Pilares de rocha internos nas clareiras amplas + Vasos de Brotos no Musgo Hexagonal
  const midCols = ["p-col-trio", "p-col-red-trio", "p-col-cone", "p-col-red-cone", "p-col-pillar", "p-col-twin-fern", "p-rock-trio", "p-rock-red-trio"];
  const shroomKeys = ["p-shroom-big", "p-shroom-big-2", "p-shroom-cluster", "p-shroom-med-1", "p-shroom-med-2", "p-shroom-tiny"];
  const fernKeys = ["p-fern-big", "p-fern-med", "p-fern-small", "p-reeds-big", "p-reeds-small"];

  for (let r = 7; r < R - 5; r++) {
    for (let c = 5; c < C - 5; c++) {
      if (!F(c, r) || usedCells.has(`${c},${r}`)) continue;
      const wx = c * T + (rnd() - 0.5) * 8 + T * 0.5;
      const wy = r * T + (rnd() - 0.5) * 8 + T * 0.75;

      let open3x3 = true;
      for (let dy = -1; dy <= 1 && open3x3; dy++) {
        for (let dx = -1; dx <= 1 && open3x3; dx++) {
          if (!F(c + dx, r + dy)) open3x3 = false;
        }
      }

      if (isMoss[r][c]) {
        if (open3x3 && rnd() < 0.065) {
          spawnProp25D(rnd() < 0.5 ? "p-sprout-pot-1" : "p-sprout-pot-2", wx, wy, 14, 10, 0);
          markUsed(c, r, 2);
        } else if (rnd() < 0.05) {
          spawnProp25D(pick(["p-reeds-small", "p-fern-tiny"]), wx, wy, 0, 0, -12);
          markUsed(c, r, 1);
        }
      } else {
        const nearWall = !F(c - 1, r) || !F(c + 1, r) || !F(c, r - 1) || !F(c, r + 1);
        if (open3x3 && rnd() < 0.032 && F(c, r + 2) && F(c, r - 2)) {
          const fk = pick(midCols);
          spawnProp25D(fk, wx, wy, 20, 12, 0);
          markUsed(c, r, 2);
        } else if (nearWall && rnd() < 0.12) {
          const sk = pick(shroomKeys);
          const isBig = sk.includes("big") || sk.includes("cluster");
          spawnProp25D(sk, wx, wy, isBig ? 14 : 0, isBig ? 10 : 0, isBig ? 0 : -8);
          if (isBig) {
            const sgl = S.add.image(wx, wy - 12, "light")
              .setBlendMode(j.BlendModes.ADD)
              .setTint(0xa7f3d0)
              .setScale(0.24)
              .setAlpha(0.18)
              .setDepth(wy - 1);
            S.tweens.add({ targets: sgl, alpha: 0.09, duration: 1300 + Math.random() * 500, yoyo: true, repeat: -1 });
          }
          markUsed(c, r, 1);
        } else if (rnd() < 0.08) {
          spawnProp25D(pick(fernKeys), wx, wy, 0, 0, -12);
          markUsed(c, r, 1);
        }
      }
    }
  }

  // C) Braseiros de Cristal Ciano/Verde distribuídos nas escadarias dos terraços, fendas e encruzilhadas
  for (const mz of mossZones) {
    const sc = Math.round(mz.cx);
    let sRow = Math.round(mz.cy);
    while (sRow < R - 4 && isMoss[sRow]?.[sc]) sRow++;
    if (F(sc - 2, sRow)) spawnBrazier((sc - 2) * T + 16, sRow * T + 14, "cyan");
    if (F(sc + 3, sRow)) spawnBrazier((sc + 3) * T + 16, sRow * T + 14, "cyan");
  }
  for (const nd of B.level.__nodes || []) {
    if (nd.kind === "START") continue;
    const bx = (nd.cx + (rnd() < 0.5 ? -2 : 2)) * T + 16;
    const by = (nd.cy - 1) * T + 16;
    if (F(Math.floor(bx / T), Math.floor(by / T))) {
      spawnBrazier(bx, by, nd.kind === "ALCOVE_LOOT" ? "green" : "cyan");
    }
  }

  tx.refresh();
  S.add.image(0, 0, key).setOrigin(0, 0).setDepth(0.5);
  B.groundLayer?.setVisible?.(false);
  B.wallLayer?.setVisible?.(false);

  // 12) Configurar Portais de Retorno ao Refúgio, Inimigos de Patrulha, Colisões 2.5D e Moedas do Ferreiro
  if (S.isDorfCave) {
    const L3 = typeof __L3 === "function" ? __L3 : (pt) => pt;
    S.__dorfReturnPortal = { x: spX, y: spY - 52, r: 44 };
    S.__dorfPortals = [S.__dorfReturnPortal];

    const addReturnVortex = (px, py) => {
      const retVortex = S.add.sprite(px, py - 4, "portal", 0)
        .setScale(0.85)
        .setTint(0x38bdf8)
        .setAlpha(0.78)
        .setDepth(py - 2);
      if (S.anims.exists("portal-spin")) retVortex.play("portal-spin");
      S.add.text(px, py - 34, L3("SAÍDA · REFÚGIO", "EXIT · REFUGE", "SALIDA · REFUGIO"), {
        fontFamily: "'Cinzel', Georgia, serif",
        fontSize: "8px",
        color: "#7dd3fc",
        stroke: "#090d16",
        strokeThickness: 3
      }).setOrigin(0.5, 1).setDepth(9100);
    };

    addReturnVortex(spX, spY - 52);
    if (farPortalPos) {
      const fp = { x: farPortalPos.x, y: farPortalPos.y - 44, r: 44 };
      S.__dorfPortals.push(fp);
      addReturnVortex(fp.x, fp.y);
    }

    let postInitDone = false;
    const runPostInit = () => {
      if (postInitDone || !S.scene?.isActive()) return;
      postInitDone = true;

      // Limpar qualquer pendência ou estado aberto de __SPPanel na caverna Dorf
      try {
        const U = S.scene?.get?.("UI");
        if (U?.__etp) {
          U.__etp.open = false;
          U.__etp.queue = [];
          try { U.__etp.root?.destroy?.(true); } catch (_) {}
          U.__etp.root = null;
        }
      } catch (_) {}

      // Instanciar criaturas patrulhando naturalmente pela caverna ampla e chefes que caçam o jogador
      if (!S.__dorfEnemiesSpawned && Array.isArray(B.level.__caveEnemies)) {
        S.__dorfEnemiesSpawned = true;
        for (const en of B.level.__caveEnemies) {
          try {
            const validType = typeof ee !== "undefined" && ee[en.type] ? en.type : "SKELETON_WARRIOR";
            const spawned = S.spawnEnemy?.(validType, en.col, en.row, { elite: !!en.elite, eliteRoll: false });
            if (spawned) {
              // Garante proporção e colisão física no corpo de cada criatura
              spawned.setDepth?.(spawned.y);
              if (en.isCaveBoss) spawned.__dorfBossPending = true;
            }
          } catch (e) {}
        }
      }

      // Navegação pelos túneis (mapa de distâncias BFS) + chefes errantes + perigo que cresce com o tempo
      if (!S.__dorfHunterTickRegistered) {
        S.__dorfHunterTickRegistered = true;
        const G = B.level.__organicGrid, RR = G.length, CC = G[0].length, T = dt || 32;
        const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]], N8 = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
        const bfs = (tc, tr) => {
          if (G[tr]?.[tc] !== 0) return null;
          const d = new Int16Array(RR * CC).fill(-1), q = new Int32Array(RR * CC); let h = 0, t = 0;
          d[tr * CC + tc] = 0; q[t++] = tr * CC + tc;
          while (h < t) { const i = q[h++], r = (i / CC) | 0, c = i - r * CC;
            for (const [dc, dr] of N4) { const nc = c + dc, nr = r + dr; if (nc < 0 || nr < 0 || nc >= CC || nr >= RR || G[nr][nc] !== 0) continue; const k = nr * CC + nc; if (d[k] >= 0) continue; d[k] = d[i] + 1; q[t++] = k } }
          return d;
        };
        const dirFrom = (d, x, y) => {
          if (!d) return null;
          const c = (x / T) | 0, r = (y / T) | 0; let bv = d[r * CC + c], best = null;
          if (bv < 0) return null;
          for (const [dc, dr] of N8) { const nc = c + dc, nr = r + dr; if (G[nr]?.[nc] !== 0) continue; if (dc && dr && (G[r][nc] !== 0 || G[nr][c] !== 0)) continue; const v = d[nr * CC + nc]; if (v >= 0 && v < bv) { bv = v; best = [dc, dr] } }
          if (!best) return null;
          const tx = (c + best[0] + 0.5) * T - x, ty = (r + best[1] + 0.5) * T - y, L = Math.hypot(tx, ty) || 1;
          return [tx / L, ty / L];
        };
        const losClear = (ax, ay, bx, by) => { const L = Math.hypot(bx - ax, by - ay), n = Math.ceil(L / 14); for (let i = 1; i < n; i++) { const x = ax + (bx - ax) * i / n, y = ay + (by - ay) * i / n; if (G[(y / T) | 0]?.[(x / T) | 0] !== 0) return false } return true };
        const nodes = (B.level.__nodes || []).filter((n) => G[Math.round(n.cy)]?.[Math.round(n.cx)] === 0);
        const nodeField = new Map();
        const fieldFor = (ni) => { if (!nodeField.has(ni)) { const n = nodes[ni]; nodeField.set(ni, bfs(Math.round(n.cx), Math.round(n.cy))) } return nodeField.get(ni) };
        let pField = null, pAt = -1e9, pTile = -1;
        const L3b = typeof __L3 === "function" ? __L3 : (pt) => pt;

        // Chefe da caverna: mais forte, aura âmbar, vaga pelos salões até achar o herói
        const makeBoss = (en) => {
          en.__isDorfCaveBoss = true;
          en.maxHp = Math.round((en.maxHp || 40) * 1.6); en.hp = en.maxHp;
          en.damage = Math.round((en.damage || 3) * 1.3);
          if (en.ai?.cfg) { en.ai.cfg = { ...en.ai.cfg, detectionRange: 300, loseTargetRange: 900 } }
          if (!en._dorfAura) {
            const aura = S.add.image(en.x, en.y - 12, "light").setScale(0.36).setBlendMode(j.BlendModes.ADD).setTint(0xf59e0b).setAlpha(0.24).setDepth(en.y - 1);
            S.tweens.add({ targets: aura, alpha: 0.12, duration: 900, yoyo: true, repeat: -1 });
            en.on("destroy", () => aura?.destroy?.()); en._dorfAura = aura;
          }
        };
        S.__dorfMakeBoss = makeBoss;
        const navPatch = (en) => {
          const ai = en.ai; if (!ai || en.__dorfNav) return; en.__dorfNav = true;
          const md = ai.moveDir.bind(ai);
          ai.moveDir = function (dx, dy, sp, dtt) {
            const P = S.player;
            if (P && (this.state === "chase") && pField && Math.hypot(P.x - en.x, P.y - en.y) > 70 && !losClear(en.x, en.y, P.x, P.y)) {
              const v = dirFrom(pField, en.x, en.y); if (v) { dx = v[0]; dy = v[1] }
            }
            return md(dx, dy, sp, dtt);
          };
          if (en.__isDorfCaveBoss || en.__dorfHunter) {
            ai.updatePatrol = function (dtt) {
              const P = S.player;
              if (en.__dorfHunter && pField) { const v = dirFrom(pField, en.x, en.y); if (v) { this.state = "patrol"; md(v[0], v[1], en.speed * 0.8, dtt); return } }
              if (!nodes.length) return;
              const f = en.__roamNode != null ? fieldFor(en.__roamNode) : null;
              const here = f ? f[((en.y / T) | 0) * CC + ((en.x / T) | 0)] : -1;
              if (en.__roamNode == null || here < 0 || here <= 2) {
                // escolhe outro salão; com o perigo alto, tende a ir para onde o herói está
                let ni = (Math.random() * nodes.length) | 0;
                if (P && Math.random() < Math.min(0.85, (S.__dorfDanger | 0) * 0.18)) { let bd = 1e9; nodes.forEach((n, k) => { const d = Math.hypot(n.cx * T - P.x, n.cy * T - P.y); if (d < bd) { bd = d; ni = k } }) }
                en.__roamNode = ni; return;
              }
              const v = dirFrom(f, en.x, en.y);
              if (v) { this.state = "patrol"; md(v[0], v[1], en.speed * 0.7, dtt) }
            };
          }
        };

        // HUD do perigo
        S.__dorfDanger = 0; S.__dorfT0 = S.time.now;
        const dTxt = (S.scene.get("UI") || S).add.text(18, 94, "", { fontFamily: "'Cinzel', Georgia, serif", fontSize: "10px", fontStyle: "bold", color: "#fcd34d", backgroundColor: "#1a0a0acc", padding: { x: 7, y: 4 }, stroke: "#000", strokeThickness: 2 }).setDepth(9600);
        const paintDanger = () => { const l = S.__dorfDanger; dTxt.setText(`${L3b("PERIGO", "DANGER", "PELIGRO")} ${"▲".repeat(Math.min(8, l + 1))}`).setColor(["#fcd34d", "#fbbf24", "#f59e0b", "#f97316", "#ef4444", "#dc2626"][Math.min(5, l)]) };
        paintDanger();
        S.events.once("shutdown", () => { try { dTxt.destroy(); S.__dorfCoinTxt?.destroy?.() } catch (e) {} S.__dorfCoinTxt = null; S.__dorfHunterTickRegistered = false; S.__cobaltVeinsDone = false; S.__dorfFalling = false });
        let nextWave = 25000, acc = 0;
        const spawnAt = (minD, maxD) => {
          if (!pField) return null; const opts = [];
          for (let i = 0; i < pField.length; i += 3) { const v = pField[i]; if (v >= minD && v <= maxD) opts.push(i) }
          if (!opts.length) return null; const i = opts[(Math.random() * opts.length) | 0]; return { col: i % CC, row: (i / CC) | 0 };
        };
        const scaleEn = (en, l) => { en.maxHp = Math.round((en.maxHp || 10) * (1 + 0.18 * l)); en.hp = en.maxHp; en.damage = Math.round((en.damage || 2) * (1 + 0.12 * l)) || en.damage };
        const wave = () => {
          const l = S.__dorfDanger | 0, alive = (S.enemies?.getChildren?.() || []).filter((e) => e.active && !e.dead).length;
          if (alive >= 34) return;
          const pool = l < 2 ? ["GOBLIN", "GOBLIN_ARCHER", "SKELETON", "SKELETON_WARRIOR", "ORC"] : ["ORC_WARRIOR", "ORC_BRUTE", "SKELETON_MAGE", "NECRO_SHADE", "MB_CINDER_STALKER", "MB_CRYSTAL_SAGE", "GOBLIN_ASSASSIN"];
          const at = spawnAt(14, 28); if (!at) return;
          const n = Math.min(6, 2 + ((l / 2) | 0));
          for (let k = 0; k < n; k++) {
            const type = pool[(Math.random() * pool.length) | 0];
            try {
              const en = S.spawnEnemy?.(typeof ee !== "undefined" && ee[type] ? type : "SKELETON", at.col + ((k % 3) - 1), at.row + ((k / 3) | 0), { elite: l >= 3 && Math.random() < 0.15 * l, eliteRoll: false });
              if (en) { scaleEn(en, l); en.__dorfHunter = true; en.setDepth?.(en.y) }
            } catch (e) {}
          }
        };
        const extraBoss = () => {
          const at = spawnAt(22, 60); if (!at) return;
          try {
            const type = ["MB_BASALT_COLOSSUS", "CYCLOPS", "TROLL", "DEMON"][(Math.random() * 4) | 0];
            const en = S.spawnEnemy?.(typeof ee !== "undefined" && ee[type] ? type : "TROLL", at.col, at.row, { elite: true, eliteRoll: false });
            if (en) { scaleEn(en, S.__dorfDanger | 0); makeBoss(en); S.game.events.emit("ui:banner", L3b("UM CHEFE DESPERTOU NAS PROFUNDEZAS…", "A BOSS AWAKENS IN THE DEPTHS…", "UN JEFE DESPIERTA EN LAS PROFUNDIDADES…"), "#f59e0b") }
          } catch (e) {}
        };

        S.events.on("update", (time, delta) => {
          if (!S.scene?.isActive() || !S.isDorfCave || !S.player || S.player.dead || S.__dorfExiting) return;
          const P = S.player, pt = ((P.y / T) | 0) * CC + ((P.x / T) | 0);
          if (pt !== pTile || time - pAt > 900) { const f = bfs((P.x / T) | 0, (P.y / T) | 0); if (f) { pField = f; pTile = pt; pAt = time } }
          for (const en of S.enemies?.getChildren?.() || []) {
            if (!en.active || en.dead) continue;
            navPatch(en);
            if (en._dorfAura?.active) en._dorfAura.setPosition(en.x, en.y - 12);
          }
          if (S.uiOpen) return;
          // perigo sobe a cada 50 s dentro da caverna
          const l = Math.floor((time - S.__dorfT0) / 50000);
          if (l !== S.__dorfDanger) {
            S.__dorfDanger = l; paintDanger();
            S.game.events.emit("ui:banner", L3b(`A CAVERNA FICA MAIS PERIGOSA… PERIGO ${l + 1}`, `THE CAVE GROWS MORE DANGEROUS… DANGER ${l + 1}`, `LA CAVERNA SE VUELVE MÁS PELIGROSA… PELIGRO ${l + 1}`), "#f97316");
            try { S.cameras.main.shake(260, 0.004) } catch (e) {}
            if (l > 0 && l % 3 === 0) extraBoss();
          }
          acc += delta;
          if (acc >= nextWave) { acc = 0; nextWave = Math.max(12000, 32000 - S.__dorfDanger * 3500); wave() }
        });
      }

      for (const en of S.enemies?.getChildren?.() || []) if (en.__dorfBossPending) { en.__dorfBossPending = false; S.__dorfMakeBoss?.(en) }

      // Atualizar HUD superior direito para exibir EXPLORAÇÃO LIVRE em vez de SALAS: 0/0
      try {
        const uiScene = S.scene?.get?.("UI");
        if (uiScene && uiScene.hud && !uiScene.hud.__dorfPatched) {
          uiScene.hud.__dorfPatched = true;
          const origHudRedraw = uiScene.hud.redraw.bind(uiScene.hud);
          uiScene.hud.redraw = function () {
            origHudRedraw();
            if (S.isDorfCave && this.statusText) {
              this.statusText.setText(L3("EXPLORAÇÃO LIVRE", "FREE EXPLORATION", "EXPLORACIÓN LIBRE"));
            }
          };
          uiScene.hud.redraw();
        }
      } catch (e) {}

      // Indicador de Moedas do Ferreiro na HUD da caverna
      if (!S.__dorfCoinTxt) {
        const curCoins = __getForgeCoins(S);
        S.__dorfCoinTxt = (S.scene.get("UI") || S).add.text(18, 72, `◆ ${L3("Pedra Cobalto", "Cobalt Stone", "Piedra Cobalto")}: ${curCoins}`, {
          fontFamily: "'Cinzel', Georgia, serif",
          fontSize: "10px",
          fontStyle: "bold",
          color: "#9cc2ff",
          backgroundColor: "#0a1030cc",
          padding: { x: 7, y: 4 },
          stroke: "#000000",
          strokeThickness: 2
        }).setDepth(9600);
      }

      // Hook no sistema de loot para entregar as Moedas do Ferreiro (escassas e valiosas!)
      if (S.lootSystem && !S.lootSystem.__dorfHooked) {
        S.lootSystem.__dorfHooked = true;
        const origOpenChest = S.lootSystem.openChest.bind(S.lootSystem);
        S.lootSystem.openChest = function (chest) {
          origOpenChest(chest);
          if (S.isDorfCave && !chest.__dorfCoinGiven) {
            chest.__dorfCoinGiven = true;
            __cobaltBurst(S, chest.x, chest.y, 8 + ((Math.random() * 7) | 0));
          }
        };

        const origDropEnemy = S.lootSystem.dropFromEnemy.bind(S.lootSystem);
        S.lootSystem.dropFromEnemy = function (enemy) {
          if (S.isDorfCave && enemy) {
            // Na caverna não cai ouro: tudo vira Pedra Cobalto
            enemy.goldMult = 0;
            const dl = S.__dorfDanger | 0;
            if (enemy.__isDorfCaveBoss) __cobaltBurst(S, enemy.x, enemy.y, 15 + ((Math.random() * 11) | 0) + dl * 2);
            else if (enemy.isElite) __cobaltBurst(S, enemy.x, enemy.y, 4 + ((Math.random() * 4) | 0) + dl);
            else if (Math.random() < 0.5 + Math.min(0.3, dl * 0.05)) __cobaltBurst(S, enemy.x, enemy.y, 1 + ((Math.random() * 2) | 0));
          }
          return origDropEnemy(enemy);
        };
      }
      __cobaltVeins(S, B);
    };
    S.time?.delayedCall(120, runPostInit);
    setTimeout(runPostInit, 160);
  }

  return true;
}

/* 3b) Herói caído na caverna: a Guardiã abre o portal branco e o leva para se recuperar */
function __dorfFall(S) {
  if (!S || S.__dorfFalling || S.__dorfExiting) return;
  S.__dorfFalling = true;
  try {
    S.uiOpen = false; if (S.time) S.time.paused = false; S.physics?.resume?.(); S.tweens?.resumeAll?.();
    for (const e of S.enemies?.getChildren?.() || []) { if (e.active && !e.dead) { e.setVelocity?.(0, 0); if (e.ai) e.ai.busyTimer = 9 } }
    const P = S.player, x = P?.x ?? 0, y = (P?.y ?? 0) - 6;
    let o = null;
    if (typeof __PP !== "undefined" && __PP.anims(S)) o = __PP.make(S, x, y + 6, "w", 0.1, 0xf2f7ff, y + 4);
    if (o) { o.sh.setAlpha(0); S.tweens.add({ targets: [o.s, o.ov], scaleX: 1.5, scaleY: 1.5, duration: 520, ease: "Back.easeOut" }) }
    const gl = S.add.image(x, y - 40, "light").setBlendMode(j.BlendModes.ADD).setTint(0xffffff).setScale(0.05).setAlpha(0.6).setDepth(y + 5);
    S.tweens.add({ targets: gl, scale: 0.6, alpha: 0.4, duration: 600, ease: "Quad.easeOut" });
    try { typeof __FX !== "undefined" && (__FX.tex(S), __FX.ring(S, x, y - 24, 0xffffff, 70, 600, y + 6)) } catch (e) {}
    P && S.tweens.add({ targets: P, alpha: 0.15, duration: 700, delay: 500 });
    const L3 = typeof __L3 === "function" ? __L3 : (pt) => pt;
    S.game.events.emit("ui:banner", L3("A GUARDIÃ ABRIU UM PORTAL…", "THE GUARDIAN OPENED A PORTAL…", "LA GUARDIANA ABRIÓ UN PORTAL…"), "#e8f4ff");
    try { S.audio?.play?.("portal") } catch (e) {}
  } catch (e) {}
  setTimeout(() => __dorfReturnToRefuge(S, true), 1500);
}
try { if (typeof window !== "undefined") window.__dorfFall = __dorfFall; } catch (e) {}

/* 3c) A Guardiã aparece no Refúgio junto do herói, fala e some num efeito mágico */
function __dorfGuardianVisit(H, cx, cy, line) {
  const ADD = j.BlendModes.ADD;
  const gx = cx + 46, gy = cy + 2;
  const fallback = () => { try { H.__say(cx, cy - 92, line, 5200, "#e8f4ff", "female") } catch (e) {} };
  try {
    typeof __stAnims === "function" && __stAnims(H);
    if (!H.textures.exists("guardia-sp-idle")) { H.time.delayedCall(900, fallback); return }
    const sc = 0.62;
    const g = H.add.sprite(cx, gy, "guardia-sp-idle", 0).setOrigin(0.5, 124 / 128).setScale(sc).setDepth(gy).setAlpha(0).setFlipX(true);
    H.anims.exists("guardia-a-idle") && g.play("guardia-a-idle");
    const sh = H.add.ellipse(gx, gy + 1, 24, 7, 0, 0).setDepth(gy - 1);
    const au = H.add.image(gx, gy - 30, "light").setBlendMode(ADD).setTint(0xfff3c4).setScale(0.3).setAlpha(0).setDepth(gy - 1);
    // sai do portal junto com o herói
    H.tweens.add({ targets: g, alpha: 1, x: gx, duration: 700, ease: "Quad.easeOut" });
    H.tweens.add({ targets: sh, alpha: 0.32, duration: 700 });
    H.tweens.add({ targets: au, alpha: 0.3, duration: 700, onComplete: () => H.tweens.add({ targets: au, alpha: 0.15, scale: 0.36, duration: 1400, yoyo: true, repeat: -1 }) });
    const bub = 5600;
    H.time.delayedCall(900, () => {
      H.anims.exists("guardia-a-talk") && g.play("guardia-a-talk");
      try { H.__say(gx, gy - 80, line, bub, "#e8f4ff", "female") } catch (e) {}
    });
    H.time.delayedCall(900 + bub - 600, () => {
      if (!g.active) return;
      H.anims.exists("guardia-a-idle") && g.play("guardia-a-idle");
      // efeito mágico: espiral de luz, brilho e desaparecimento
      const cols = [0xffffff, 0xfff3c4, 0xbfe3ff, 0xffd98a];
      for (let i = 0; i < 26; i++) {
        const a0 = (i / 26) * Math.PI * 2, r0 = 16 + Math.random() * 10, del = i * 28;
        const p = H.add.image(gx + Math.cos(a0) * r0, gy - 4 + Math.sin(a0) * r0 * 0.4, "light").setBlendMode(ADD).setTint(cols[i % 4]).setScale(0.014 + Math.random() * 0.016).setAlpha(0).setDepth(gy + 2);
        const st = { t: 0 };
        H.tweens.add({ targets: st, t: 1, duration: 1100, delay: del, ease: "Sine.easeIn",
          onStart: () => p.setAlpha(0.95),
          onUpdate: () => { const a = a0 + st.t * 5, r = r0 * (1 - st.t * 0.6); p.setPosition(gx + Math.cos(a) * r, gy - 4 - st.t * 70 + Math.sin(a) * r * 0.4); p.setAlpha(0.95 * (1 - st.t)) },
          onComplete: () => p.destroy() });
      }
      const ring = H.add.ellipse(gx, gy, 10, 4).setStrokeStyle(2, 0xfff3c4, 0.9).setDepth(gy - 0.5);
      H.tweens.add({ targets: ring, scaleX: 6, scaleY: 6, alpha: 0, duration: 700, ease: "Quad.easeOut", onComplete: () => ring.destroy() });
      H.tweens.add({ targets: au, scale: 0.75, alpha: 0.7, duration: 500, yoyo: true, onComplete: () => au.destroy() });
      H.tweens.add({ targets: g, scaleX: 0.04, scaleY: sc * 1.15, alpha: 0, y: gy - 14, duration: 650, delay: 350, ease: "Back.easeIn", onComplete: () => { g.destroy() } });
      H.tweens.add({ targets: sh, alpha: 0, duration: 600, delay: 350, onComplete: () => sh.destroy() });
      H.time.delayedCall(950, () => {
        const fl = H.add.image(gx, gy - 30, "light").setBlendMode(ADD).setTint(0xffffff).setScale(0.12).setAlpha(1).setDepth(gy + 3);
        H.tweens.add({ targets: fl, scale: 0.7, alpha: 0, duration: 520, ease: "Quad.easeOut", onComplete: () => fl.destroy() });
        try { H.game.audioEngine?.sfx?.("portal") } catch (e) {}
      });
    });
  } catch (e) { fallback() }
}

/* 4) Retorno seguro das Cavernas de Dorf para o Refúgio (salvando ouro, itens e Moedas do Ferreiro) */
function __dorfReturnToRefuge(S, fell = false) {
  if (!S || S.__dorfExiting) return;
  S.__dorfExiting = true;

  // Descongelar timers, física, tweens e flags de UI para evitar qualquer travamento
  try {
    S.uiOpen = false;
    if (S.time) S.time.paused = false;
    S.physics?.resume?.();
    S.tweens?.resumeAll?.();
    if (S.player?.body) {
      S.player.body.enable = false;
      S.player.setVelocity?.(0, 0);
    }
    for (const e of (S.enemies?.getChildren?.() || [])) {
      if (e.active && !e.dead) e.setVelocity?.(0, 0);
    }
    const U = S.scene?.get?.("UI");
    if (U?.__etp) {
      U.__etp.open = false;
      U.__etp.queue = [];
      try { U.__etp.root?.destroy?.(true); } catch (_) {}
      U.__etp.root = null;
    }
  } catch (e) {
    console.warn("[dorf_cave] erro ao descongelar física/tweens:", e);
  }

  S.audio?.play?.("portal") || S.game?.audioEngine?.sfx?.("portal");

  const isCamp = S.originMode === "campaign";
  const slot = S.dorfSlot || S.game?.registry?.get("save:slot") || 1;
  const curForgeCoins = __getForgeCoins(S);

  try {
    if (isCamp && typeof Dn === "function") {
      const res = Dn(slot);
      if (res?.ok && res.data) {
        const d = res.data;
        d.player = d.player || {};
        // Ao retornar (seja vivo ou derrotado), garante HP recuperado no Refúgio
        const maxHp = S.player?.maxHp || S.stats?.maxHp || d.player.maxHp || 6;
        d.player.hp = Math.max(1, maxHp);
        d.player.dead = false;
        if (typeof S.stats?.gold === "number") d.player.gold = S.stats.gold;
        else if (typeof S.player?.gold === "number") d.player.gold = S.player.gold;
        d.player.forgeCoins = curForgeCoins;
        if (S.inventory?.serialize) {
          const inv = S.inventory.serialize();
          d.player.inventory = inv;
          if (inv.items) d.player.items = inv.items;
          if (inv.equipment) d.player.equipment = inv.equipment;
          if (typeof inv.potions === "number") d.player.potions = inv.potions;
        }
        if (typeof S.stats?.xp === "number") d.player.xp = S.stats.xp;
        if (typeof S.stats?.level === "number") d.player.level = S.stats.level;
        localStorage.setItem(Wt("campaign", slot), JSON.stringify(d));
      }
    } else if (!isCamp && typeof In === "function") {
      try { In(S); } catch (e) {}
      __setForgeCoins(curForgeCoins, S);
    }
  } catch (e) {
    console.warn("[dorf_cave] erro ao salvar retorno:", e);
  }

  let returned = false;
  const doReturn = () => {
    if (returned) return;
    returned = true;
    try { S.scene.stop("UI"); } catch (e) {}
    const FELL = typeof __L3 === "function" ? __L3("Você caiu, herói. Eu te trouxe para se recuperar.", "You fell, hero. I brought you here to recover.", "Caíste, héroe. Te traje para que te recuperes.") : "Você caiu, herói. Eu te trouxe para se recuperar.";
    if (fell) {
      // A Guardiã traz o herói caído de volta pelo portal branco do Refúgio
      const GN = typeof __L3 === "function" ? __L3("A Guardiã", "The Guardian", "La Guardiana") : "A Guardiã";
      const tryHub = (n) => {
        const H = S.game.scene.getScene("Hub");
        if (H?.sys?.isActive?.() && H.__say && H.rig?.container && H.playerX != null) {
          const [cx, cy] = H.cavePortalPos || [836, 646];
          H.area = H.area || "out";
          H.playerX = cx - 50; H.playerY = cy - 8; H.facing = { x: 1, y: 0 };
          try { H.rig.container.setPosition(H.playerX, H.playerY); H.cameras.main.centerOn(H.playerX, H.playerY) } catch (e) {}
          try {
            const fl = H.add.image(cx, cy - 34, "light").setBlendMode(j.BlendModes.ADD).setTint(0xffffff).setScale(0.1).setAlpha(0.9).setDepth(cy + 50);
            H.tweens.add({ targets: fl, scale: 0.9, alpha: 0, duration: 900, ease: "Quad.easeOut", onComplete: () => fl.destroy() });
            H.rig.container.setAlpha(0.2); H.tweens.add({ targets: H.rig.container, alpha: 1, duration: 700 });
          } catch (e) {}
          __dorfGuardianVisit(H, cx, cy, `${GN}: ${FELL}`);
        } else if (n < 80) setTimeout(() => tryHub(n + 1), 150);
      };
      setTimeout(() => tryHub(0), 300);
    }
    if (isCamp) {
      S.game.registry.set("hub:fromForest", { slot: slot });
    } else {
      S.game.registry.remove("hub:fromForest");
    }
    S.game.registry.set("hub:classId", S.classDef?.id || "WARRIOR");
    S.scene.start("Hub");
  };
  try { S.cameras?.main?.fadeEffect?.reset?.(); } catch (e) {}
  S.cameraSys?.fadeOut(350, doReturn);
  setTimeout(doReturn, 400);
}
try { if (typeof window !== "undefined") window.__dorfReturnToRefuge = __dorfReturnToRefuge; } catch (e) {}
