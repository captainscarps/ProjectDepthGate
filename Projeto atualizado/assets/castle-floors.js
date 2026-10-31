// Castelo de Valdrak em andares (campanha)
// O castelo deixa de ser um mapa de salas fechadas: tem a parte externa, andares ligados por escadas,
// portas que pedem chaves (estilo Resident Evil), livros de registro para salvar e um mapa clicável.
// Dados: assets/castle2/castle-data.json (scripts/castle/build_castle.py). Ganchos no jogo: scripts/patch_castle_floors.py.
(() => {
  const T = (pt, en, es) => { try { if (window.__L3G) return window.__L3G(pt, en, es ?? en); } catch (e) {} return pt; };
  const L = (a) => (Array.isArray(a) ? T(a[0], a[1], a[2]) : a || "");
  const FONT = "NeoDunggeunmo, 'Courier New', monospace";
  const TS = 32;
  let DATA = null;
  const load = () => fetch("assets/castle2/castle-data.json", { cache: "no-cache" }).then((r) => r.json()).then((d) => { DATA = d; }).catch(() => setTimeout(load, 3000));
  load();
  const G = () => window.__DED_GAME;

  // ───────────────────────── progresso do castelo (por slot e por campanha) ─────────────────────────
  let ST = null, STK = "";
  const key = () => { const R = G()?.registry; return `ded-castle2:${R?.get("save:slot") ?? 1}:${R?.get("campaign:seed") ?? 0}`; };
  function st() {
    const k = key();
    if (ST && STK === k) return ST;
    STK = k;
    try { ST = JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { ST = null; }
    ST = Object.assign({ floor: "ext", keys: [], doors: [], opened: [], cleared: {}, seen: {} }, ST || {});
    return ST;
  }
  let saveT = 0;
  function persist(now) {
    const go = () => { try { localStorage.setItem(STK, JSON.stringify(ST)); } catch (e) {} };
    if (now) return go();
    clearTimeout(saveT); saveT = setTimeout(go, 400);
  }
  const isCastle = (s) => !!s?.level?.castle2;
  const floorOf = (s) => DATA?.floors?.[s?.level?.floorId];

  // ───────────────────────── o jogo pede a fase "castle": devolvemos o andar atual ─────────────────────────
  window.__castleLevel = function (scene, levelId, data, base) {
    if (levelId !== "castle" || !DATA || !base) return null;
    if (scene.game.registry.get("mode") !== "campaign") return null;
    const s = st();
    let fid = s.floor, arrive = null;
    if (data?.castleFloor) { fid = data.castleFloor; arrive = data.castleArrive; }
    else if (data?.carry && !data?.restore) { fid = "ext"; arrive = "start"; }
    if (!DATA.floors[fid]) fid = "ext";
    s.floor = fid;
    persist(true);
    const F = DATA.floors[fid];
    const cleared = new Set(s.cleared[fid] || []);
    const rooms = F.rooms.map((r) => {
      const q = JSON.parse(JSON.stringify(r));
      if (cleared.has(q.id)) { q.enemies = []; if (q.boss) delete q.boss; }
      return q;
    });
    const sp = (arrive && F.arrive?.[arrive]) || F.spawn;
    return { ...base, world: F.world, rooms, corridors: F.corridors, doors: [], playerSpawn: { col: sp.col, row: sp.row },
      castle2: true, noCd: true, floorId: fid, corrTraps: [] };
  };

  // ───────────────────────── cenário: pedaços do andar + objetos ─────────────────────────
  const CF = ["cf-gate", "cf-crestdoor", "cf-portcullis", "cf-icon-castle_crank", "cf-icon-castle_key_iron", "cf-icon-castle_key_crest"];
  function chunkKeys(F) { const c = F.chunks, o = []; for (let y = 0; y < c.rows; y++) for (let x = 0; x < c.cols; x++) o.push(`${c.prefix}-${x}-${y}`); return o; }
  function ensure(scene, keys, cb) {
    const miss = keys.filter((k) => !scene.textures.exists(k));
    if (!miss.length) return cb();
    const ld = scene.load, op = ld.path;
    ld.setPath("");
    miss.forEach((k) => ld.image(k, `assets/pixel-art/castle2/${k}.png`));
    ld.setPath(op);
    ld.once("complete", cb);
    ld.start();
  }
  window.__castleBaked = function (B) {
    const d = B.scene, F = floorOf(d);
    if (!F) return false;
    B.groundLayer?.setVisible?.(false);
    B.wallLayer?.setVisible?.(false);
    d.cameras.main.setBackgroundColor(F.bg);
    const draw = () => {
      if (d.__c2drawn) return;
      d.__c2drawn = true;
      const c = F.chunks;
      for (let y = 0; y < c.rows; y++) for (let x = 0; x < c.cols; x++) d.add.image(x * c.chunk, y * c.chunk, `${c.prefix}-${x}-${y}`).setOrigin(0).setDepth(-2);
      // objetos do andar quando o herói e o saque já existem (não depende do relógio da cena, que pausa nos diálogos)
      const t0 = Date.now();
      const go = () => {
        if (!d.sys?.isActive?.() || d.level?.floorId !== F.id) return;
        if (!d.player || !d.lootSystem || !d.dungeon?.objects) { if (Date.now() - t0 < 15000) setTimeout(go, 50); return; }
        try { setup(d, F); } catch (e) { console.warn("[castelo]", e); }
      };
      setTimeout(go, 0);
    };
    d.__c2drawn = false;
    ensure(d, [...chunkKeys(F), ...CF], draw);
    // os outros andares vêm em segundo plano
    setTimeout(() => { if (d.sys?.isActive?.()) for (const id of Object.keys(DATA.floors)) if (id !== F.id) ensure(d, chunkKeys(DATA.floors[id]), () => {}); }, 4000);
    return true;
  };

  const has = (g, id) => g.inventory?.items?.some((q) => q && q.id === id);
  const banner = (g, txt, col) => g.game.events.emit("ui:banner", txt, col || "#c9a24a");
  const sfx = (g, k) => { try { g.game.audioEngine?.sfx?.(k); } catch (e) {} };

  function setup(g, F) {
    const s = st(), D = g.dungeon;
    g.__c2 = { F, doors: [], items: [] };
    // chaves pegas antes nunca se perdem (mesmo voltando a um save antigo)
    for (const id of s.keys) if (!has(g, id) && g.lootSystem?.makeItem) { try { g.inventory.add(g.lootSystem.makeItem(id, "LEGENDARY")); } catch (e) {} }
    // portas trancadas
    for (const dd of F.doors) {
      if (s.doors.includes(dd.id)) continue;
      const cx = (dd.col + dd.w / 2) * TS, cy = (dd.row + dd.h / 2) * TS;
      const blk = D.solids.create(cx, cy, "light").setVisible(false).setDisplaySize(dd.w * TS, dd.h * TS);
      blk.refreshBody?.();
      const vis = g.add.image(cx, (dd.row + dd.h) * TS, dd.gfx).setOrigin(.5, 1).setDisplaySize(dd.w * TS, Math.max(2, dd.h) * TS).setDepth((dd.row + dd.h) * TS + 2);
      const lock = g.add.image(cx, (dd.row + dd.h) * TS - 30, "light").setBlendMode(1).setTint(0xffc040).setScale(.16).setAlpha(.5).setDepth(vis.depth + 1);
      g.tweens.add({ targets: lock, alpha: .2, duration: 900, yoyo: true, repeat: -1 });
      const obj = { x: cx, y: cy + 10, __c2door: dd };
      Object.defineProperty(obj, "interactLabel", { get: () => (has(g, dd.key) ? L(dd.use) : L(dd.label)), configurable: true });
      obj.interact = () => {
        if (!has(g, dd.key)) { sfx(g, "sfx-door-locked"); banner(g, L(dd.label), "#d8a070"); g.cameraSys?.shake?.(.003, 120); return; }
        s.doors.push(dd.id); persist();
        blk.destroy();
        const i = D.objects.indexOf(obj); i >= 0 && D.objects.splice(i, 1);
        sfx(g, "sfx-door-open");
        g.effects?.burstTinted?.(cx, cy, 0xffd24a, 18);
        g.tweens.add({ targets: vis, y: vis.y - 40, alpha: 0, duration: 700, ease: "Quad.easeIn", onComplete: () => vis.destroy() });
        lock.destroy();
        banner(g, L(dd.open), "#ffd24a");
        g.requestSave?.(400);
      };
      D.objects.push(obj);
    }
    // escadas e portas de saída
    for (const sx of F.stairs) {
      const w = sx.w || 2;
      let x = (sx.col + w / 2) * TS, y = (sx.row + 1) * TS;
      if (sx.kind === "up") y = (sx.row + 2) * TS + 6;
      if (sx.kind === "door") y = (sx.row + .5) * TS;
      const obj = { x, y };
      const blocked = () => sx.oneWay && !s.opened.includes(sx.id);
      Object.defineProperty(obj, "interactLabel", { get: () => (blocked() ? L(sx.blocked) : L(sx.label)), configurable: true });
      obj.interact = () => {
        if (blocked()) { sfx(g, "sfx-door-locked"); banner(g, L(sx.blocked), "#d8a070"); return; }
        if (sx.opens && !s.opened.includes(sx.opens)) { s.opened.push(sx.opens); }
        s.floor = sx.to; persist(true);
        sfx(g, sx.kind === "door" ? "sfx-door-open" : "sfx-door-open");
        window.__goLevelG?.(g, "castle", { castleFloor: sx.to, castleArrive: sx.arrive });
      };
      D.objects.push(obj);
      if (sx.kind !== "door") {
        const gl = g.add.image(x, y - 8, "light").setBlendMode(1).setTint(0x9ac0ff).setScale(.22).setAlpha(.25).setDepth(1);
        g.tweens.add({ targets: gl, alpha: .1, duration: 1200, yoyo: true, repeat: -1 });
      }
    }
    // chaves no chão
    for (const it of F.items) {
      if (s.keys.includes(it.id) || has(g, it.id)) continue;
      try {
        const item = g.lootSystem.makeItem(it.id, "LEGENDARY");
        g.lootSystem.spawnItem(it.col * TS + 16, it.row * TS + 16, item);
        const gl = g.add.image(it.col * TS + 16, it.row * TS + 18, "light").setBlendMode(1).setTint(0xffd060).setScale(.3).setAlpha(.45).setDepth(1);
        g.tweens.add({ targets: gl, alpha: .15, scale: .24, duration: 900, yoyo: true, repeat: -1 });
        g.__c2.items.push({ id: it.id, gl });
      } catch (e) {}
    }
    // livros de registro: salvar e descansar
    for (const sv of F.saves) {
      const x = sv.col * TS + 16, y = sv.row * TS + 16;
      const book = D.solids.create(x, y, "cx-lectern");
      book.setDepth(y + 8);
      book.refreshBody?.();
      const gl = g.add.image(x, y - 6, "light").setBlendMode(1).setTint(0x7fe8a0).setScale(.2).setAlpha(.35).setDepth(y + 9);
      g.tweens.add({ targets: gl, alpha: .12, duration: 1100, yoyo: true, repeat: -1 });
      const obj = { x, y: y + 14 };
      Object.defineProperty(obj, "interactLabel", { get: () => T("Escrever no Livro de Registros (salvar)", "Write in the Record Book (save)", "Escribir en el Libro de Registros (guardar)"), configurable: true });
      obj.interact = () => {
        const p = g.player;
        if (p && !p.dead) { p.hp = p.maxHp; g.game.events.emit("hud:hp", p.hp, p.maxHp); }
        g.effects?.burstTinted?.(x, y - 6, 0x7fe8a0, 16);
        sfx(g, "sfx-event-accept");
        g.requestSave?.(0);
        banner(g, T("PROGRESSO REGISTRADO — VIDA RESTAURADA", "PROGRESS RECORDED — HEALTH RESTORED", "PROGRESO REGISTRADO — VIDA RESTAURADA"), "#7fe8a0");
      };
      D.objects.push(obj);
    }
    // eventos: salas limpas, visitas, chaves pegas
    const onClear = (n, room) => {
      const id = room?.def?.id;
      if (!id || !isCastle(g)) return;
      (s.cleared[F.id] ||= []).includes(id) || s.cleared[F.id].push(id);
      persist();
    };
    g.game.events.on("room:cleared", onClear);
    const tick = setInterval(() => { if (g.sys?.isActive?.()) track(g, F, s); }, 400);
    g.events.once("shutdown", () => { g.game.events.off("room:cleared", onClear); clearInterval(tick); hudBtn(false); });
    hudBtn(true);
    if (g.scene.settings.data?.castleFloor) setTimeout(() => g.sys?.isActive?.() && g.requestSave?.(0), 900);
    setTimeout(() => g.sys?.isActive?.() && banner(g, L(F.name).toUpperCase(), "#c9b48a"), 900);
  }

  function track(g, F, s) {
    if (!isCastle(g) || !g.player) return;
    const c = Math.floor(g.player.x / TS), r = Math.floor(g.player.y / TS);
    const seen = (s.seen[F.id] ||= []);
    const mark = (k) => { if (!seen.includes(k)) { seen.push(k); persist(); } };
    F.rooms.forEach((q) => { const R = q.rect; if (c >= R.x && c < R.x + R.w && r >= R.y && r < R.y + R.h) mark(q.id); });
    F.corridors.forEach((R, i) => { if (c >= R.x && c < R.x + R.w && r >= R.y && r < R.y + R.h) mark("c" + i); });
    for (const id of Object.keys(DATA.keys)) {
      if (has(g, id) && !s.keys.includes(id)) {
        s.keys.push(id); persist(true);
        const it = g.__c2?.items?.find((q) => q.id === id);
        it?.gl?.destroy();
        const K = DATA.keys[id];
        banner(g, T("OBTEVE: ", "OBTAINED: ", "OBTUVISTE: ") + T(K.pt, K.en, K.es).toUpperCase(), "#ffd24a");
        g.requestSave?.(300);
      }
    }
  }

  // ───────────────────────── botão e mapa clicável ─────────────────────────
  const ui = () => G()?.scene?.getScene?.("UI");
  const game = () => G()?.scene?.getScene?.("Game");
  function view() { let w = 640; try { if (window._) w = window._; } catch (e) {} return { w, h: 360, cx: Math.round(w / 2) }; }
  function hudBtn(on) {
    const u = ui();
    if (!u || !u.add) return;
    if (!u.__c2btn && on) {
      const { w } = view();
      const b = u.add.container(w - 46, 78).setDepth(96);
      const bg = u.add.rectangle(0, 0, 70, 20, 0x140e0a, .8).setStrokeStyle(1, 0xc9a24a, .9).setInteractive({ useHandCursor: true });
      const t = u.add.text(0, 0, T("◈ MAPA", "◈ MAP", "◈ MAPA"), { fontFamily: FONT, fontSize: "11px", color: "#e8d4a8" }).setOrigin(.5);
      b.add([bg, t]);
      bg.on("pointerdown", () => openMap());
      u.__c2btn = b;
    }
    u.__c2btn?.setVisible(!!on);
  }
  window.addEventListener("keydown", (e) => {
    if (e.key !== "m" && e.key !== "M" && e.key !== "Escape") return;
    const g = game();
    if (e.key === "Escape") { if (MAP.open) { e.stopPropagation(); closeMap(); } return; }
    if (!isCastle(g) || !g.sys?.isActive?.()) return;
    if (MAP.open) closeMap(); else if (!g.uiOpen && g.state === "playing") openMap();
  }, true);

  const MAP = { open: false, floor: null };
  function openMap() {
    const g = game(), u = ui();
    if (!g || !u || !DATA || MAP.open) return;
    MAP.open = true;
    MAP.floor = g.level.floorId;
    MAP.paused = !g.uiOpen;
    g.uiOpen = true; g.time.paused = true; g.physics?.pause?.();
    u.game.events.emit("ui:inventory", true);
    drawMap();
  }
  function closeMap() {
    const g = game(), u = ui();
    MAP.open = false;
    MAP.root?.destroy(true); MAP.root = null;
    if (g && MAP.paused) { g.uiOpen = false; g.time.paused = false; g.physics?.resume?.(); }
    u?.game.events.emit("ui:inventory", false);
  }
  window.__castleMapOpen = () => MAP.open;
  window.__castleMapClose = closeMap;

  function drawMap() {
    const u = ui(), g = game(), s = st();
    MAP.root?.destroy(true);
    const { w, cx } = view();
    const R = (MAP.root = u.add.container(0, 0).setDepth(940));
    const dim = u.add.rectangle(cx, 180, 3840, 2160, 0x06040a, .94).setInteractive();
    R.add(dim);
    R.add(u.add.text(cx, 16, T("MAPA DO CASTELO DE VALDRAK", "MAP OF VALDRAK CASTLE", "MAPA DEL CASTILLO DE VALDRAK"), { fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "15px", color: "#c9a24a", fontStyle: "bold", stroke: "#0a0806", strokeThickness: 3 }).setOrigin(.5));
    // abas dos andares
    const order = DATA.order;
    const tabW = Math.min(110, (w - 40) / order.length);
    order.forEach((fid, i) => {
      const known = !!DATA.floors[fid];
      const visited = known && ((s.seen[fid] || []).length > 0 || g.level.floorId === fid);
      const name = known ? L(DATA.floors[fid].name) : L(DATA.future[fid]);
      const x = cx + (i - (order.length - 1) / 2) * tabW, sel = MAP.floor === fid;
      const bg = u.add.rectangle(x, 38, tabW - 6, 18, sel ? 0x8a6a20 : 0x1c1410, sel ? .95 : .85).setStrokeStyle(1, visited ? 0xc9a24a : 0x4a3a2a);
      const t = u.add.text(x, 38, visited ? name : "???", { fontFamily: FONT, fontSize: "10px", color: sel ? "#ffffff" : visited ? "#d8c0a0" : "#5a4a3c" }).setOrigin(.5);
      if (visited) bg.setInteractive({ useHandCursor: true }).on("pointerdown", () => { MAP.floor = fid; drawMap(); });
      R.add([bg, t]);
    });
    const F = DATA.floors[MAP.floor];
    const seen = new Set(s.seen[F.id] || []);
    // área do desenho
    const AX = 18, AY = 54, AW = w - 190, AH = 280;
    const sc = Math.min(AW / F.world.cols, AH / F.world.rows);
    const ox = AX + (AW - F.world.cols * sc) / 2, oy = AY + (AH - F.world.rows * sc) / 2;
    const gr = u.add.graphics();
    R.add(gr);
    const rect = (q, fill, a, line) => {
      gr.fillStyle(fill, a).fillRect(ox + q.x * sc, oy + q.y * sc, q.w * sc, q.h * sc);
      if (line) gr.lineStyle(1, line, .9).strokeRect(ox + q.x * sc + .5, oy + q.y * sc + .5, q.w * sc - 1, q.h * sc - 1);
    };
    F.corridors.forEach((q, i) => seen.has("c" + i) && rect(q, 0x6a5a48, 1));
    const here = g.level.floorId === F.id ? F.rooms.find((q) => { const c = g.player.x / TS, r = g.player.y / TS, Q = q.rect; return c >= Q.x && c < Q.x + Q.w && r >= Q.y && r < Q.y + Q.h; }) : null;
    let label = null;
    F.rooms.forEach((q) => {
      if (!seen.has(q.id)) return;
      const done = (s.cleared[F.id] || []).includes(q.id) || !(q.enemies?.length || q.boss);
      rect(q.rect, done ? 0x3e6a8a : 0x8a3a30, .9, 0xd8c0a0);
      const z = u.add.zone(ox + (q.rect.x + q.rect.w / 2) * sc, oy + (q.rect.y + q.rect.h / 2) * sc, q.rect.w * sc, q.rect.h * sc).setInteractive({ useHandCursor: true });
      z.on("pointerdown", () => { label?.setText(q.name + (done ? "" : T("  · inimigos", "  · enemies", "  · enemigos"))); });
      R.add(z);
    });
    // portas, escadas, chaves, livros
    const pt = (c, r, col, rad) => gr.fillStyle(col, 1).fillCircle(ox + c * sc, oy + r * sc, rad);
    const known = (c, r) => F.rooms.some((q) => seen.has(q.id) && c >= q.rect.x - 1 && c <= q.rect.x + q.rect.w && r >= q.rect.y - 1 && r <= q.rect.y + q.rect.h) ||
      F.corridors.some((q, i) => seen.has("c" + i) && c >= q.x - 1 && c <= q.x + q.w && r >= q.y - 1 && r <= q.y + q.h);
    for (const d of F.doors) {
      if (!known(d.col, d.row)) continue;
      const open = s.doors.includes(d.id);
      gr.fillStyle(open ? 0x6ab0ff : 0xff4a3a, 1).fillRect(ox + d.col * sc, oy + (d.row + d.h / 2) * sc - 2, d.w * sc, 4);
    }
    for (const x of F.stairs) {
      if (!known(x.col, x.row)) continue;
      const c = x.col + (x.w || 2) / 2, r = x.row + 1;
      gr.fillStyle(0xe8d4a8, 1).fillTriangle(ox + c * sc - 4, oy + r * sc + (x.kind === "up" ? 3 : -3), ox + c * sc + 4, oy + r * sc + (x.kind === "up" ? 3 : -3), ox + c * sc, oy + r * sc + (x.kind === "up" ? -4 : 4));
    }
    for (const it of F.items) if (!s.keys.includes(it.id) && known(it.col, it.row)) pt(it.col + .5, it.row + .5, 0xffd24a, 3);
    for (const sv of F.saves) if (known(sv.col, sv.row)) pt(sv.col + .5, sv.row + .5, 0x7fe8a0, 3);
    if (g.level.floorId === F.id && g.player) {
      const px = ox + g.player.x / TS * sc, py = oy + g.player.y / TS * sc;
      const me = u.add.circle(px, py, 4, 0xffffff).setStrokeStyle(2, 0xff3030);
      R.add(me);
      u.tweens.add({ targets: me, scale: 1.6, alpha: .4, duration: 600, yoyo: true, repeat: -1 });
    }
    label = u.add.text(ox, AY + AH + 6, here ? here.name : "", { fontFamily: FONT, fontSize: "11px", color: "#e8d4a8" });
    R.add(label);
    // painel: legenda e itens-chave
    const PX = w - 166, PY = 58;
    R.add(u.add.rectangle(PX + 76, PY + 136, 156, 272, 0x140e0a, .85).setStrokeStyle(1, 0x5a4636));
    R.add(u.add.text(PX + 8, PY + 6, T("ITENS-CHAVE", "KEY ITEMS", "OBJETOS CLAVE"), { fontFamily: FONT, fontSize: "11px", color: "#c9a24a" }));
    let yy = PY + 26;
    for (const id of Object.keys(DATA.keys)) {
      const got = s.keys.includes(id) || has(g, id), K = DATA.keys[id];
      if (u.textures.exists("cf-icon-" + id)) R.add(u.add.image(PX + 18, yy + 7, "cf-icon-" + id).setAlpha(got ? 1 : .25).setTint(got ? 0xffffff : 0x404040));
      R.add(u.add.text(PX + 34, yy, got ? T(K.pt, K.en, K.es) : "???", { fontFamily: FONT, fontSize: "10px", color: got ? "#e8d4a8" : "#5a4a3c", wordWrap: { width: 116 } }));
      yy += 24;
    }
    yy += 8;
    const leg = [[0x3e6a8a, T("sala explorada", "explored room", "sala explorada")], [0x8a3a30, T("sala com inimigos", "room with enemies", "sala con enemigos")],
      [0xff4a3a, T("porta trancada", "locked door", "puerta cerrada")], [0x6ab0ff, T("porta aberta", "open door", "puerta abierta")],
      [0xffd24a, T("item-chave", "key item", "objeto clave")], [0x7fe8a0, T("livro de registros", "record book", "libro de registros")]];
    for (const [c, t] of leg) {
      R.add(u.add.rectangle(PX + 16, yy + 6, 10, 8, c));
      R.add(u.add.text(PX + 28, yy, t, { fontFamily: FONT, fontSize: "9px", color: "#a89880" }));
      yy += 15;
    }
    R.add(u.add.text(PX + 8, yy + 4, T("▲▼ escadas", "▲▼ stairs", "▲▼ escaleras"), { fontFamily: FONT, fontSize: "9px", color: "#a89880" }));
    const close = u.add.text(cx, 346, T("M / Esc / toque fora: fechar   ·   toque numa sala: nome", "M / Esc / tap outside: close   ·   tap a room: name", "M / Esc / toca fuera: cerrar   ·   toca una sala: nombre"), { fontFamily: FONT, fontSize: "9px", color: "#7a6a58" }).setOrigin(.5);
    R.add(close);
    dim.on("pointerdown", (p) => { if (p.y > 330 || p.x > PX + 156 || p.y < 30) closeMap(); });
    const x = u.add.text(w - 14, 14, "✕", { fontFamily: FONT, fontSize: "16px", color: "#e8d4a8" }).setOrigin(.5).setInteractive({ useHandCursor: true }).on("pointerdown", closeMap);
    R.add(x);
  }
})();
