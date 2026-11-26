/* p216.133 — CONTROLE "TOQUE / CLIQUE PARA MOVER" (point and click), OPCIONAL
   Configurações → Controles → "TOCAR/CLICAR PARA MOVER" (desligado por padrão). O jogo continua igual; isto só soma:
   • toque/clique no chão: o herói anda até lá (caminho A* no grid da masmorra; sem grid, vai em linha reta)
   • toque/clique num inimigo: vira alvo; o herói chega ao alcance da arma (corpo a corpo ou distância) e ataca
     sozinho até ele cair
   • toque/clique em item, baú, porta, portal, NPC: vai até ele e interage
   • segurar o botão do mouse: segue o cursor (desktop)
   • qualquer movimento pelo teclado, controle ou joystick cancela na hora; as habilidades continuam nos botões
   Não liga no cooperativo local (cada jogador tem seu controle). O toque que começa no joystick vale como clique
   se for rápido e sem arrastar. */
{
  const ON = (S) => { try { return !!(S.game.registry.get("settings") ?? {}).pointClick && !(S.game.registry.get("mode") === "endless" && S.game.registry.get("endless:coop")) } catch (e) { return !1 } };
  const PC = (S) => S.__pc || (S.__pc = { path: [], target: null, obj: null, dest: null, stuck: 0, chk: null, rp: 0, give: 0, down: null, g: null, ring: 0 });
  const clear = (S) => { const p = PC(S); p.path = []; p.target = null; p.obj = null; p.dest = null; p.stuck = 0; p.give = 0; const M = S.game.inputManager; M && (M.__pcAxis = null, M.__pcAim = null) };
  const blocked = (S) => !S.player || S.player.dead || S.player.isDowned || S.state !== "playing" || S.uiOpen || S.freezeTimer > 0 || S.ui?.__dlgOpen || S.__dlgOpen || S.detailsOpen;

  /* ---------- entrada global: axis/aim/press extras no gerenciador de comandos ---------- */
  const wrapMgr = (M) => {
    if (!M || M.__pcW) return; M.__pcW = 1;
    const ax = M.axis.bind(M), am = M.aim.bind(M), jd = M.justDown.bind(M);
    M.__pcPress = new Set();
    M.axis = function () { const a = ax(), v = M.__pcAxis; return v && Math.hypot(a.x, a.y) < .2 ? v : a };
    M.aim = function () { return am() ?? M.__pcAim ?? null };
    M.justDown = function (a) { return jd(a) || M.__pcPress.has(a) };
  };

  /* ---------- caminho ---------- */
  const D = (S) => S.dungeon?.grid && typeof S.dungeon.isWallTile === "function" ? S.dungeon : null;
  const T = 32;
  function astar(G, sx, sy, tx, ty) {
    if (G.isWallTile(tx, ty)) return null; const C = G.cols, key = (x, y) => y * C + x, sk = key(sx, sy), tk = key(tx, ty);
    const gS = new Map([[sk, 0]]), came = new Map(), H = [[Math.hypot(tx - sx, ty - sy), sk]], closed = new Set();
    const push = (f, k) => { H.push([f, k]); let i = H.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (H[p][0] <= H[i][0]) break;[H[p], H[i]] = [H[i], H[p]]; i = p } };
    const pop = () => { const top = H[0], last = H.pop(); if (H.length) { H[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < H.length && H[l][0] < H[m][0]) m = l; if (r < H.length && H[r][0] < H[m][0]) m = r; if (m === i) break;[H[m], H[i]] = [H[i], H[m]]; i = m } } return top };
    let n = 0;
    while (H.length && n++ < 9000) {
      const [, k] = pop(); if (closed.has(k)) continue; closed.add(k);
      if (k === tk) { const out = []; let c = k; while (c !== sk) { out.unshift({ x: c % C, y: (c / C) | 0 }); c = came.get(c) } return out }
      const x = k % C, y = (k / C) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue; const nx = x + dx, ny = y + dy;
        if (G.isWallTile(nx, ny) || (dx && dy && (G.isWallTile(x + dx, y) || G.isWallTile(x, y + dy)))) continue;
        const nk = key(nx, ny); if (closed.has(nk)) continue;
        /* evita colar na parede: casa vizinha de parede custa um pouco mais */
        let pen = 0; for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (G.isWallTile(nx + ox, ny + oy)) { pen = .35; break }
        const ng = gS.get(k) + (dx && dy ? 1.414 : 1) + pen;
        if (!gS.has(nk) || ng < gS.get(nk)) { gS.set(nk, ng); came.set(nk, k); push(ng + Math.hypot(tx - nx, ty - ny), nk) }
      }
    }
    return null;
  }
  /* corta os pontos do caminho que dá para pular em linha reta */
  function smooth(G, pts, sx, sy) {
    if (!G?.hasLineOfSight || pts.length < 3) return pts; const out = []; let ax = sx, ay = sy, i = 0;
    while (i < pts.length) { let j = pts.length - 1; while (j > i && !G.hasLineOfSight(ax, ay, pts[j].x, pts[j].y)) j--; out.push(pts[j]); ax = pts[j].x; ay = pts[j].y; i = j + 1 }
    return out;
  }
  function nearFree(G, tx, ty) { if (!G.isWallTile(tx, ty)) return { x: tx, y: ty }; for (let r = 1; r < 4; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (!G.isWallTile(tx + dx, ty + dy)) return { x: tx + dx, y: ty + dy }; return null }
  function route(S, wx, wy) {
    const P = S.player, G = D(S), pc = PC(S);
    if (!G) { pc.path = [{ x: wx, y: wy }]; return !0 }
    const sx = Math.floor(P.x / T), sy = Math.floor(P.y / T), t = nearFree(G, Math.floor(wx / T), Math.floor(wy / T)); if (!t) { pc.path = []; return !1 }
    const s0 = G.isWallTile(sx, sy) ? nearFree(G, sx, sy) : { x: sx, y: sy }; if (!s0) { pc.path = [{ x: wx, y: wy }]; return !0 }
    const p = astar(G, s0.x, s0.y, t.x, t.y); if (!p) { pc.path = []; return !1 }
    const pts = p.map((q) => ({ x: q.x * T + T / 2, y: q.y * T + T / 2 }));
    if (pts.length && t.x === Math.floor(wx / T) && t.y === Math.floor(wy / T)) pts[pts.length - 1] = { x: wx, y: wy };
    pc.path = smooth(G, pts, P.x, P.y); if (!pc.path.length) pc.path = [{ x: wx, y: wy }];
    return !0;
  }

  /* ---------- o que existe no ponto tocado ---------- */
  const alive = (e) => e && e.active && !e.dead && !(e.hp <= 0);
  function enemyAt(S, x, y) {
    const L = S.enemies?.getChildren?.().filter(alive) ?? []; alive(S.boss) && L.push(S.boss);
    let b = null, bd = 1e9; for (const e of L) { const r = Math.max(22, (e.displayHeight || 40) * .45), d = Math.hypot(e.x - x, e.y - (e.displayHeight || 40) * .15 - y); if (d < r && d < bd) { bd = d; b = e } } return b;
  }
  function objectAt(S, x, y) {
    const C = []; for (const o of S.groundItems ?? []) C.push(o);
    for (const o of S.dungeon?.objects ?? []) if (o.interactLabel && typeof o.interact === "function") C.push(o);
    for (const o of S.roomManager?.doors ?? []) if (o.interactLabel) C.push(o);
    S.__guard && C.push(S.__guard); for (const o of S.__hubPortals ?? []) C.push(o); for (const o of S.__dorfPortals ?? (S.__dorfReturnPortal ? [S.__dorfReturnPortal] : [])) C.push(o);
    let b = null, bd = 30; for (const o of C) { if (!o || o.active === !1) continue; const d = Math.hypot(o.x - x, o.y - y); if (d < bd) { bd = d; b = o } } return b;
  }

  /* ---------- toque/clique no mundo ---------- */
  function worldTap(S, sx, sy) {
    if (!ON(S) || blocked(S)) return; const cam = S.cameras.main, w = cam.getWorldPoint(sx, sy), pc = PC(S);
    const e = enemyAt(S, w.x, w.y);
    pc.target = null; pc.obj = null; pc.give = 0; pc.stuck = 0;
    if (e) { pc.target = e; pc.rp = 0; mark(S, e.x, e.y, 0xff5b4b); return }
    const o = objectAt(S, w.x, w.y);
    if (o) { pc.obj = o; route(S, o.x, o.y + 6); mark(S, o.x, o.y, 0xffd27a); return }
    pc.dest = { x: w.x, y: w.y }; route(S, w.x, w.y) ? mark(S, w.x, w.y, 0xe8b44c) : mark(S, w.x, w.y, 0x8a8178);
  }
  function mark(S, x, y, col) {
    try { const g = S.add.graphics().setDepth(y - 2); g.lineStyle(2, col, 1).strokeEllipse(0, 0, 22, 11); g.setPosition(x, y + 4); S.tweens.add({ targets: g, scaleX: 1.6, scaleY: 1.6, alpha: 0, duration: 420, onComplete: () => g.destroy() }) } catch (e) {}
  }

  /* liga o toque no Game e na camada de interface por cima dele */
  function hook(S) {
    if (S.__pcHooked) return; S.__pcHooked = 1; wrapMgr(S.game.inputManager);
    let UI = null; try { UI = S.scene.get("UI") } catch (e) {} UI = UI && UI.input ? UI : null; const src = UI || S;
    const isJoy = (o) => { const J = UI?.touchControls?.joystick; return J && o === J.zone };
    const onDown = (p, objs) => {
      if (!ON(S)) return; const hit = (objs || []).filter((o) => o.visible !== !1 && !isJoy(o));
      if (hit.length || p.button === 2) { PC(S).down = null; return }
      PC(S).down = { id: p.id, x: p.x, y: p.y, t: performance.now(), joy: (objs || []).some(isJoy), held: !1 };
    };
    const onUp = (p) => {
      const pc = PC(S), d = pc.down; if (!d || d.id !== p.id) return; pc.down = null;
      if (d.held) return; const moved = Math.hypot(p.x - d.x, p.y - d.y), dt = performance.now() - d.t;
      if (moved < 14 && dt < (d.joy ? 320 : 900)) worldTap(S, p.x, p.y);
    };
    src.input.on("pointerdown", onDown); src.input.on("pointerup", onUp);
    /* o Game só recebe o clique quando a interface não tem nada no ponto */
    UI && UI !== S && (S.input.on("pointerdown", (p) => { PC(S).down || onDown(p, []) }), S.input.on("pointerup", onUp));
    S.events.once("shutdown", () => { try { src.input.off("pointerdown", onDown); src.input.off("pointerup", onUp) } catch (e) {} clear(S); S.__pcHooked = 0 });
  }

  /* ---------- a cada quadro ---------- */
  function tick(S, ms) {
    const M = S.game.inputManager; if (!M) return; M.__pcPress?.clear();
    if (!ON(S)) { (M.__pcAxis || M.__pcAim) && clear(S); PC(S).g?.clear(); return }
    hook(S); const pc = PC(S), P = S.player, dt = Math.min(.05, ms / 1e3);
    if (blocked(S)) { M.__pcAxis = null; M.__pcAim = null; pc.g?.clear(); return }
    /* teclado / controle / joystick mandam: cancela */
    const k = M.keyboardAxis?.() ?? { x: 0, y: 0 }, gp = M.gamepadAxis ?? { x: 0, y: 0 }, tc = M.touch?.axis ?? { x: 0, y: 0 };
    if (Math.hypot(k.x, k.y) > .2 || Math.hypot(gp.x, gp.y) > .25 || Math.hypot(tc.x, tc.y) > .2) { if (pc.path.length || pc.target || pc.obj) clear(S); if (pc.down) pc.down.joy && (pc.down = null); return }
    /* segurar o mouse: segue o cursor (só no desktop) */
    if (pc.down && !pc.down.joy) {
      const ap = S.input.activePointer;
      if (ap?.isDown && ap.id === pc.down.id && performance.now() - pc.down.t > 260 && !ap.wasTouch) { const w = S.cameras.main.getWorldPoint(ap.x, ap.y); pc.down.held = !0; pc.target = null; pc.obj = null; pc.rp -= dt; if (pc.rp <= 0 || !pc.path.length) { pc.rp = .2; route(S, w.x, w.y) } }
    }
    let aim = null;
    /* alvo: chega ao alcance e ataca */
    if (pc.target) {
      const e = pc.target; if (!alive(e)) { pc.target = null; pc.path = [] } else {
        const key = S.combat?.getWeaponKey?.() ?? "unarmed", def = oe[key] ?? {}, ranged = def.delivery === "arrow" || def.delivery === "bolt" || S.classDef?.attackType === "projectile";
        const er = Math.max(10, (e.body?.width ?? 20) / 2), d = Math.hypot(e.x - P.x, e.y - P.y), G = D(S);
        const reach = ranged ? 230 : (Tl(key)?.range ?? 52) * .78 + er, see = !G?.hasLineOfSight || G.hasLineOfSight(P.x, P.y, e.x, e.y);
        if (d <= reach && see) { pc.path = []; aim = { x: (e.x - P.x) / (d || 1), y: (e.y - P.y) / (d || 1) }; M.__pcPress.add("ATTACK") }
        else { pc.rp -= dt; if (pc.rp <= 0 || !pc.path.length) { pc.rp = .35; route(S, e.x, e.y) } }
      }
    }
    /* objeto: chega e interage */
    if (pc.obj) {
      const o = pc.obj, n = S.findInteractable?.();
      if (!o.active && o.active !== void 0) { pc.obj = null; pc.path = [] }
      else if (n && n.target === o) { M.__pcPress.add("INTERACT"); pc.obj = null; pc.path = [] }
      else if (!pc.path.length) { pc.give += dt; if (pc.give > .6) { pc.obj = null } else route(S, o.x, o.y + 6) }
    }
    /* anda pelo caminho */
    let ax = null;
    if (pc.path.length) {
      const wp = pc.path[0], dx = wp.x - P.x, dy = wp.y - P.y, d = Math.hypot(dx, dy), last = pc.path.length === 1;
      if (d < (last ? 6 : 12)) { pc.path.shift(); if (!pc.path.length) pc.dest = null }
      else {
        const sl = last && d < 26 ? Math.max(.45, d / 26) : 1; ax = { x: dx / d * sl, y: dy / d * sl };
        /* preso (caixote, porta fechada): tenta de novo e depois desiste */
        pc.chk = pc.chk ?? { x: P.x, y: P.y, t: 0 }; pc.chk.t += dt;
        if (pc.chk.t > .5) { const mv = Math.hypot(P.x - pc.chk.x, P.y - pc.chk.y); pc.chk = { x: P.x, y: P.y, t: 0 }; if (mv < 6) { pc.stuck++; if (pc.stuck > 3) { pc.path = []; pc.target = null; pc.obj = null; pc.stuck = 0 } else { const f = pc.path[pc.path.length - 1]; route(S, f.x + (Math.random() - .5) * 20, f.y + (Math.random() - .5) * 20) } } else pc.stuck = 0 }
      }
    } else pc.chk = null;
    M.__pcAxis = ax; M.__pcAim = aim;
    /* anel no alvo */
    try {
      pc.g = pc.g && pc.g.scene ? pc.g : S.add.graphics(); const g = pc.g; g.clear();
      if (pc.target && alive(pc.target)) { const e = pc.target; pc.ring += dt * 4; g.setDepth(e.y - 1); g.lineStyle(2, 0xff5b4b, .75 + .25 * Math.sin(pc.ring)).strokeEllipse(e.x, e.y + (e.displayHeight || 40) * .32, 30, 12) }
    } catch (e) {}
  }

  const U0 = Sd.prototype.update;
  Sd.prototype.update = function (t, d) { try { tick(this, d) } catch (e) { console.warn("[toque para mover]", e) } return U0.apply(this, arguments) };

  /* textos da opção */
  try {
    const TX = { pt: "TOCAR/CLICAR PARA MOVER", en: "TAP/CLICK TO MOVE", es: "TOCAR/CLIC PARA MOVER" };
    for (const [l, v] of Object.entries(TX)) Rs?.[l] && (Rs[l]["set.pointClick"] = v);
    typeof Hn === "object" && Hn && (Hn["set.pointClick"] ??= TX.en);
  } catch (e) {}
}
