/* ══ Golpe corpo a corpo com peso: a ANIMAÇÃO cobre a área de acerto (o alcance não muda) ══
   O alcance e o ângulo de cada arma continuam os originais (tabela oa). O que mudou é o desenho do golpe:
   · rastro do golpe em meia-lua (o "smear"), varrendo exatamente o arco de acerto, do raio interno até a ponta;
   · adagas fazem uma estocada (risco longo e fino até o alcance); desarmado faz um arco curto e rápido;
   · armas pesadas (machado, montante, cutelo, clava) têm rastro mais grosso e mais lento, com poeira no fim;
   · o herói dá um passo visual para frente no golpe (só o desenho; a física não se mexe);
   · a cor segue o elemento da arma (gelo, fogo, raio, sombra…), aço por padrão. Bastões e cajados ficam de fora. */
{
  const HEAVY = /axe|great_sword|greatsword|slayer|cleaver|club|hammer|maul/, THRUST = /dagger|razor|fang|rogue_dual|shadow/;
  const STEEL = { deep: 0x5a6a88, out: 0xc8d4ea, mid: 0xf4f0e2, light: 0xffffff };
  const palOf = (S, key) => {
    try {
      const el = typeof __fxWeaponEl === "function" ? __fxWeaponEl(S.inventory?.equipment?.weapon) : null;
      if (el && typeof __FX !== "undefined" && __FX.PAL?.[el]) return __FX.PAL[el];
    } catch (e) {}
    const k = String(key || "").toLowerCase();
    if (/frost|glacial|winter|boreal/.test(k)) return { deep: 0x2a6a9a, out: 0x9fe6ff, mid: 0xdaf6ff, light: 0xffffff };
    if (/dragon|inferno|flame|ember|molten/.test(k)) return { deep: 0x9a2a10, out: 0xffa060, mid: 0xffe0a0, light: 0xfff4d0 };
    return STEEL;
  };
  const ease = (t) => 1 - Math.pow(1 - t, 3);

  function swoosh(S, key, ang, arc, dir) {
    const p = S.player; if (!p || !arc) return;
    const k = String(key || "").toLowerCase(), P = palOf(S, k), heavy = HEAVY.test(k), thrust = THRUST.test(k), unarmed = k === "unarmed";
    const R = arc.range, A = (arc.angle ?? 120) * Math.PI / 180, cx = () => p.x, cy = () => p.y - 4;
    const g = S.add.graphics().setBlendMode(j.BlendModes.ADD).setDepth(p.depth + 2);
    const sweepMs = thrust ? 70 : unarmed ? 80 : heavy ? 150 : 105, fadeMs = heavy ? 170 : 130;
    const side = (dir?.x ?? 1) < 0 ? -1 : 1, flip = (S.playerVisual?.dualSwap ? -1 : 1) * side;
    const a0 = ang - flip * A / 2, a1 = ang + flip * A / 2;
    const thick = heavy ? .3 : unarmed ? .18 : .24;      // espessura relativa da meia-lua (fração do raio)
    const drawArc = (head, tail, alpha) => {
      g.clear();
      const N = 14, layers = [[1.03, thick * 1.3, P.deep, .16], [1, thick, P.out, .26], [.99, thick * .45, P.mid, .42]];
      for (const [ro, th, col, al] of layers) {
        g.fillStyle(col, al * alpha).beginPath();
        for (let i = 0; i <= N; i++) { const t = i / N, a = tail + (head - tail) * t; g.lineTo(cx() + Math.cos(a) * R * ro, cy() + Math.sin(a) * R * ro) }
        for (let i = N; i >= 0; i--) { const t = i / N, a = tail + (head - tail) * t, w = th * (t * t); g.lineTo(cx() + Math.cos(a) * R * (ro - w), cy() + Math.sin(a) * R * (ro - w)) }
        g.closePath().fillPath();
      }
      g.lineStyle(heavy ? 1.8 : 1.2, P.light, .7 * alpha).beginPath();
      for (let i = 0; i <= N; i++) { const t = i / N; if (t < .35) continue; const a = tail + (head - tail) * t; g.lineTo(cx() + Math.cos(a) * R, cy() + Math.sin(a) * R) }
      g.strokePath();
    };
    const drawThrust = (len, alpha) => {
      g.clear();
      const ux = Math.cos(ang), uy = Math.sin(ang), nx = -uy, ny = ux, x0 = cx() + ux * R * .25, y0 = cy() + uy * R * .25;
      for (const [w, col, al] of [[7, P.deep, .2], [4.5, P.out, .34], [2, P.mid, .6]]) {
        const xe = cx() + ux * R * len, ye = cy() + uy * R * len, mx = x0 + (xe - x0) * .55, my = y0 + (ye - y0) * .55;
        g.fillStyle(col, al * alpha).fillTriangle(x0, y0, mx + nx * w * .5, my + ny * w * .5, xe, ye);
        g.fillTriangle(x0, y0, mx - nx * w * .5, my - ny * w * .5, xe, ye);
      }
    };
    const o = { t: 0, f: 1 };
    S.tweens.add({
      targets: o, t: 1, duration: sweepMs, ease: "Linear",
      onUpdate: () => {
        if (!g.active) return;
        g.setDepth(p.depth + 2);
        if (thrust) return drawThrust(.35 + .65 * ease(o.t), 1);
        const h = a0 + (a1 - a0) * ease(o.t), trail = (a1 - a0) * (heavy ? .85 : .7);
        drawArc(h, h - trail * Math.min(1, o.t * 1.6), 1);
      },
      onComplete: () => S.tweens.add({
        targets: o, f: 0, duration: fadeMs,
        onUpdate: () => { if (!g.active) return; thrust ? drawThrust(1, o.f) : drawArc(a1, a1 - (a1 - a0) * (heavy ? .85 : .7) * o.f, o.f) },
        onComplete: () => g.destroy()
      })
    });
    // poeira no fim do golpe pesado, na ponta da arma
    if (heavy) S.time.delayedCall(sweepMs, () => {
      try {
        const x = cx() + Math.cos(a1) * R * .9, y = cy() + Math.sin(a1) * R * .9 + 6;
        for (let i = 0; i < 6; i++) {
          const d = S.add.circle(x + Phaser_r(-6, 6), y + Phaser_r(-3, 3), 2 + Math.random() * 2, 0x8a7a64, .55).setDepth(p.depth + 1);
          S.tweens.add({ targets: d, x: d.x + Phaser_r(-14, 14), y: d.y - 4 - Math.random() * 6, alpha: 0, scale: 1.8, duration: 380, onComplete: () => d.destroy() });
        }
      } catch (e) {}
    });
  }
  function Phaser_r(a, b) { return a + Math.random() * (b - a) }

  const FX0 = window.__weaponMeleeFx;
  window.__weaponMeleeFx = function (cb, key, def, dir, ang, arc, mx, my) {
    try {
      if (!/staff|scepter|wand/.test(String(key || "")) && def?.delivery === "melee") {
        const S = cb.scene; swoosh(S, key, ang, arc, dir);
        S.__lunge = { t: S.time.now, x: dir?.x ?? 0, y: dir?.y ?? 0, heavy: HEAVY.test(String(key || "")) };
      }
    } catch (e) {}
    return FX0 ? FX0.apply(this, arguments) : !0;
  };

  // passo à frente no golpe: só o desenho do herói avança alguns pixels e volta (a física fica onde está)
  const C1 = Sd.prototype.create;
  Sd.prototype.create = function () {
    const r = C1.apply(this, arguments);
    try {
      const S = this, PU = () => {
        const L = S.__lunge, c = S.playerVisual?.container; if (!L || !c) return;
        const e = S.time.now - L.t, D = L.heavy ? 240 : 180; if (e > D) { S.__lunge = null; return }
        const k = Math.sin(Math.PI * Math.min(1, e / D)) * (L.heavy ? 5 : 3.5);
        c.x += L.x * k; c.y += L.y * k * .6;
      };
      S.events.on("postupdate", PU);
      S.events.once("shutdown", () => S.events.off("postupdate", PU));
    } catch (e) {}
    return r;
  };
}
