/* ══ Pets (campanha) ══
   • TREINO DE PETS: aba nova no VENDEDOR do Refúgio. Quatro bichos à venda (ouro da campanha), cada um com um
     papel: Breu (lobo, ATAQUE: morde inimigos perto do herói), Caramelo (cão, GUARDA: bloqueia golpes e cura a
     cada sala limpa), Migalha (rato, COLETA: busca ouro e itens no chão) e Agouro (corvo, RASTREIO: aponta
     objetivos de missões, baús e segredos da área).
   • Pets de missão são LENDÁRIOS e únicos (não se compram): hoje, o Ollie (Os Gatos da Alline, faro de ouro).
   • Aba PETS no livro do inventário: os pets que você tem, o nível de treino e o que cada um faz; ali se escolhe
     quem acompanha o herói (um por vez; a troca vale na hora).
   • Treino: cada missão feita juntos (chefe de masmorra vencido ou missão secundária concluída com o pet ao lado)
     conta. Níveis 1–5 em 0 · 2 · 5 · 9 · 14 missões; quanto maior o nível, mais forte o efeito.
   Estado por herói (etiqueta de __heroTag) em depthgate:pets:<tag> — some ao excluir o herói ou começar de novo.
   Folhas: scripts/build_pets.py. */
const __PET_TH = [0, 2, 5, 9, 14];
const __PET_MULS = [1, 1.3, 1.6, 2, 2.5];
const __PETS = {
  lobo: { tex: "pet-lobo", fw: 105, fh: 70, sc: .38, a: { idle: [0, 7, 6], walk: [13, 10, 12], act: [26, 5, 13], spec: [39, 12, 7] }, role: "atk", price: 380, rar: "RARE", nm: "Breu",
    kind: ["Lobo negro", "Black wolf", "Lobo negro"], rl: ["ATAQUE", "ATTACK", "ATAQUE"] },
  cao: { tex: "pet-cao", fw: 105, fh: 70, sc: .36, a: { idle: [0, 7, 6], walk: [13, 10, 12], act: [26, 5, 13], spec: [39, 12, 7] }, role: "grd", price: 320, rar: "RARE", nm: "Caramelo",
    kind: ["Cão caramelo", "Caramel dog", "Perro caramelo"], rl: ["GUARDA", "GUARD", "GUARDIA"] },
  rato: { tex: "pet-rato", fw: 62, fh: 44, sc: .62, a: { idle: [0, 11, 8], walk: [13, 8, 14], act: [26, 5, 12], spec: [39, 13, 9] }, role: "col", price: 220, rar: "UNCOMMON", nm: "Migalha",
    kind: ["Rato branco", "White rat", "Rata blanca"], rl: ["COLETA", "FETCH", "RECOLECCIÓN"] },
  corvo: { tex: "pet-corvo", fw: 48, fh: 48, sc: 1, a: { idle: [0, 4, 6], walk: [13, 4, 10], act: [13, 4, 14], spec: [0, 4, 4] }, fly: 1, role: "trk", price: 280, rar: "UNCOMMON", nm: "Agouro",
    kind: ["Corvo", "Crow", "Cuervo"], rl: ["RASTREIO", "TRACKING", "RASTREO"] },
  oll: { tex: "gato-g", fw: 92, fh: 50, sc: .5, keys: { idle: "gato-g-idle", walk: "gato-g-walk", act: "gato-g-run", spec: "gato-g-hiss" }, role: "gold", quest: "gatos", rar: "LEGENDARY", nm: "Ollie",
    kind: ["Gato cinza rajado", "Grey tabby cat", "Gato gris atigrado"], rl: ["FARO DE OURO", "GOLD NOSE", "OLFATO DE ORO"] },
};
const __PET_SHOP = ["lobo", "cao", "rato", "corvo"];
const __PET_ORDER = ["oll", "lobo", "cao", "rato", "corvo"];
const __PET_RAR = { UNCOMMON: ["INCOMUM", "UNCOMMON", "POCO COMÚN", "#3d8a3a"], RARE: ["RARO", "RARE", "RARO", "#2f6cc0"], LEGENDARY: ["LENDÁRIO · ÚNICO", "LEGENDARY · UNIQUE", "LEGENDARIO · ÚNICO", "#c46a12"] };
const __PL3 = (a) => (typeof __L3 === "function" ? __L3(a[0], a[1], a[2] ?? a[1]) : a[0]);
const __PL = (pt, en, es) => (typeof __L3 === "function" ? __L3(pt, en, es ?? en) : pt);

/* ─── estado por herói ─── */
function __petKey(S) { return "depthgate:pets:" + (window.__heroTag ? window.__heroTag(S.game.registry, 1, S) : (S.game.registry.get("save:slot") ?? 1)) }
function __petSt(S) {
  let o = {};
  try { o = JSON.parse(localStorage.getItem(__petKey(S)) || "{}") || {} } catch (e) {}
  o.own ??= {}; o.mis ??= {};
  return o;
}
function __petSave(S, o) { try { localStorage.setItem(__petKey(S), JSON.stringify(o)) } catch (e) {} }
function __petHasOll(S) { try { return !!window.__gtDone?.(S) } catch (e) { return !1 } }
function __petOwned(S, ps = __petSt(S)) { return __PET_ORDER.filter((id) => (id === "oll" ? __petHasOll(S) : !!ps.own[id])) }
function __petAct(S, ps = __petSt(S)) {
  const own = __petOwned(S, ps);
  if (ps.act === "none") return null;
  return own.includes(ps.act) ? ps.act : own[0] ?? null;
}
function __petLv(n) { let l = 0; for (const t of __PET_TH) n >= t && l++; return Math.max(1, l) }
function __petMulOf(S, id, ps = __petSt(S)) { return __PET_MULS[__petLv(ps.mis[id] | 0) - 1] }
window.__petMul = (S, id) => { try { return __petMulOf(S, id) } catch (e) { return 1 } };
/* o lobo ajuda, mas não carrega a luta: 20% do dano do herói no nível 1, 40% no 5 */
function __petAtkPct(L) { return .2 + .05 * (L - 1) }
function __petAtkCd(L) { return 3 / (1 + .1 * (L - 1)) }
/* vida dos pets: os inimigos encostados neles batem; zerou, um portal os leva para o Refúgio e eles ficam
   CAÍDOS até o herói ir ao Treino de Pets recrutá-los de novo */
const __PET_HP = { lobo: 10, cao: 14, rato: 6, corvo: 6, oll: 8 };
function __petMaxHp(id, L) { return Math.round(__PET_HP[id] * (1 + .2 * (L - 1))) }
function __petFallen(S, id, ps = __petSt(S)) { return !!ps.fall?.[id] }
function __petPortalOut(S, x, y, tex, frame, sc, flip, nm) {
  try {
    const glow = S.add.image(x, y - 14, "light").setBlendMode(j.BlendModes.ADD).setTint(0xcfe8ff).setScale(.05).setAlpha(.9).setDepth(y + 2);
    const ring = S.add.graphics().setDepth(y + 1);
    const o = { r: 2, a: 0 };
    const draw = () => { ring.clear(); ring.lineStyle(2, 0xeaf6ff, .9).strokeEllipse(x, y - 14, o.r * 1.1, o.r * 1.9); ring.lineStyle(1, 0x8fc8ff, .7).strokeEllipse(x, y - 14, o.r * .7, o.r * 1.3); ring.fillStyle(0xdff0ff, .25).fillEllipse(x, y - 14, o.r * 1.1, o.r * 1.9) };
    S.tweens.add({ targets: o, r: 22, duration: 380, ease: "Back.easeOut", onUpdate: draw });
    S.tweens.add({ targets: glow, scale: .28, duration: 380 });
    const cp = S.add.sprite(x, y, tex, frame).setOrigin(.5, 1).setScale(sc).setFlipX(flip).setDepth(y + 3);
    S.tweens.add({ targets: cp, delay: 420, y: y - 10, scale: sc * .25, alpha: 0, duration: 520, ease: "Quad.easeIn", onComplete: () => cp.destroy() });
    S.tweens.add({ targets: o, r: 0, delay: 1000, duration: 320, ease: "Quad.easeIn", onUpdate: draw, onComplete: () => ring.destroy() });
    S.tweens.add({ targets: glow, scale: 0, alpha: 0, delay: 1000, duration: 320, onComplete: () => glow.destroy() });
    S.effects?.burstTinted?.(x, y - 14, 0xcfe8ff, 10);
    S.game.audioEngine?.sfx?.("sfx-portal");
  } catch (e) {}
  S.game.events.emit("ui:banner", __PL(`${nm.toUpperCase()} CAIU E O PORTAL O LEVOU AO REFÚGIO · RECRUTE NO TREINO DE PETS`, `${nm.toUpperCase()} FELL AND A PORTAL TOOK IT TO THE REFUGE · RECRUIT IT AT PET TRAINING`, `${nm.toUpperCase()} CAYÓ Y UN PORTAL LO LLEVÓ AL REFUGIO · RECLÚTALO EN EL ENTRENAMIENTO`), "#9fd0ff");
}
/* get() → { x, y, h, spr } do pet agora; onFall() tira o pet de cena (o portal anima uma cópia) */
function __petLife(S, id, L, get, onFall) {
  const max = __petMaxHp(id, L), cdm = new Map(), bar = S.add.graphics().setDepth(9001);
  let hp = max, gone = !1;
  const U = () => {
    if (gone) return;
    const p = get(); if (!p) return;
    const now = S.time.now;
    if (S.player && !S.player.dead) for (const e of (S.enemies?.getChildren?.() || []).concat(S.boss ? [S.boss] : [])) {
      if (!e || !e.active || e.dead || (e.hp ?? 1) <= 0 || Math.hypot(e.x - p.x, e.y - p.y) > 26 || (cdm.get(e) || 0) > now) continue;
      cdm.set(e, now + 1300);
      api.hit(Math.max(1, Math.round(e.damage || 1)));
      if (gone) return;
    }
    bar.clear();
    if (hp < max) { const w = 22, x = p.x - w / 2, y = p.y - p.h - 6; bar.fillStyle(0, .6).fillRect(x - 1, y - 1, w + 2, 5).fillStyle(hp / max > .35 ? 0x7ad06a : 0xe0604a, 1).fillRect(x, y, w * hp / max, 3) }
  };
  const api = {
    get dead() { return gone },
    hit(n) {
      if (gone || !(n > 0)) return;
      hp -= n;
      const p = get();
      if (p) { S.effects?.floatText?.(p.x, p.y - p.h, `-${n}`, "#ff8a7a", 9); p.spr?.setTint?.(0xff7060); S.time.delayedCall(110, () => p.spr?.active && p.spr.clearTint()) }
      if (hp > 0) return;
      gone = !0; S.events.off("update", U); bar.destroy();
      const ps = __petSt(S); ps.fall ??= {}; ps.fall[id] = 1; __petSave(S, ps);
      const D = __PETS[id], spr = p?.spr;
      const fr = spr?.frame?.name ?? 0, fl = !!spr?.flipX;
      onFall();
      S.__petId = null; S.__petGuard = null;
      p && __petPortalOut(S, p.x, p.y, D.tex, fr, D.sc, fl, D.nm);
    },
    destroy() { gone = !0; S.events.off("update", U); bar.destroy() },
  };
  S.events.on("update", U);
  S.events.once("shutdown", () => api.destroy());
  return api;
}
/* o que o pet faz em cada nível (texto do livro e da loja) */
function __petEff(id, L) {
  const m = __PET_MULS[L - 1];
  switch (__PETS[id].role) {
    case "atk": { const pc = Math.round(__petAtkPct(L) * 100), c = __petAtkCd(L).toFixed(1); return __PL(`Morde o inimigo mais perto de você: ${pc}% do seu dano, a cada ${c} s.`, `Bites the enemy closest to you: ${pc}% of your damage, every ${c} s.`, `Muerde al enemigo más cercano: ${pc}% de tu daño, cada ${c} s.`) }
    case "grd": return __PL(`${Math.round((.1 + .04 * (L - 1)) * 100)}% de chance de entrar na frente de um golpe e levar no seu lugar; cura ${L >= 5 ? 3 : L >= 3 ? 2 : 1} de vida a cada sala limpa.`, `${Math.round((.1 + .04 * (L - 1)) * 100)}% chance to jump in front of a hit and take it for you; heals ${L >= 5 ? 3 : L >= 3 ? 2 : 1} health per cleared room.`, `${Math.round((.1 + .04 * (L - 1)) * 100)}% de probabilidad de bloquear un golpe; cura ${L >= 5 ? 3 : L >= 3 ? 2 : 1} de vida por sala limpia.`);
    case "col": return __PL(`Busca ouro e itens no chão até ${Math.round((90 + 25 * L) / 10)} passos de você; ${Math.round(8 * L)}% de chance de farejar moedas em cada sala limpa.`, `Fetches gold and items within ${Math.round((90 + 25 * L) / 10)} steps of you; ${Math.round(8 * L)}% chance to sniff out coins in each cleared room.`, `Recoge oro y objetos a ${Math.round((90 + 25 * L) / 10)} pasos de ti; ${Math.round(8 * L)}% de olfatear monedas por sala limpia.`);
    case "trk": return L >= 5 ? __PL("Aponta objetivos de missões, baús e segredos em toda a área, e voa na frente para mostrar o caminho.", "Points out quest objectives, chests and secrets across the whole area, and flies ahead to show the way.", "Señala objetivos de misiones, cofres y secretos en toda el área, y vuela delante para mostrar el camino.")
      : __PL(`Aponta objetivos de missões, baús e segredos até ${[42, 60, 85, 120][L - 1]} passos de você.`, `Points out quest objectives, chests and secrets within ${[42, 60, 85, 120][L - 1]} steps of you.`, `Señala objetivos de misiones, cofres y secretos a ${[42, 60, 85, 120][L - 1]} pasos de ti.`);
    case "gold": return __PL(`${Math.round(Math.min(.85, .4 + (m - 1) * .3) * 100)}% de chance de farejar ouro em cada sala limpa (×${m} ouro).`, `${Math.round(Math.min(.85, .4 + (m - 1) * .3) * 100)}% chance to sniff out gold in each cleared room (×${m} gold).`, `${Math.round(Math.min(.85, .4 + (m - 1) * .3) * 100)}% de olfatear oro por sala limpia (×${m} oro).`);
  }
  return "";
}
function __petTrain(n) {
  const L = __petLv(n), nx = __PET_TH[L];
  return { L, n, nx, txt: nx == null ? __PL(`Nível ${L} (máximo) · ${n} missões juntos`, `Level ${L} (max) · ${n} quests together`, `Nivel ${L} (máximo) · ${n} misiones juntos`)
    : __PL(`Nível ${L} · ${n}/${nx} missões juntos`, `Level ${L} · ${n}/${nx} quests together`, `Nivel ${L} · ${n}/${nx} misiones juntos`) };
}
function __petAnims(A, id) {
  const P = __PETS[id];
  if (!P || P.keys) return P?.keys ?? null;
  const K = {};
  for (const k in P.a) {
    const [a, n, fr] = P.a[k], key = `${P.tex}-${k}`;
    K[k] = key;
    if (!A.exists(key) && A.game?.textures?.exists?.(P.tex)) A.create({ key, frames: A.generateFrameNumbers(P.tex, { start: a, end: a + n - 1 }), frameRate: fr, repeat: k === "act" ? 0 : -1 });
  }
  return K;
}
/* um missão a mais com o pet ativo; avisa quando ele sobe de nível de treino */
function __petMission(S, why) {
  const id = S.__petId; if (!id) return;
  const ps = __petSt(S), n0 = ps.mis[id] | 0, L0 = __petLv(n0);
  ps.mis[id] = n0 + 1; __petSave(S, ps);
  const L1 = __petLv(n0 + 1), nm = __PETS[id].nm.toUpperCase();
  if (L1 > L0) {
    S.time.delayedCall(why === "boss" ? 2600 : 900, () => S.scene.isActive() && S.game.events.emit("ui:banner", __PL(`${nm} SUBIU PARA O NÍVEL ${L1} DE TREINO!`, `${nm} REACHED TRAINING LEVEL ${L1}!`, `¡${nm} SUBIÓ AL NIVEL ${L1} DE ENTRENAMIENTO!`), "#f0c060"));
    S.game.audioEngine?.sfx?.("sfx-levelup");
  }
}

/* ─── o pet em campo (os comprados; o Ollie continua em quests2.js) ─── */
const __PET_NOTGT = /portal|porta|door|escada|stair|sair|exit|descer|subir|mercad|merchant|vendedor|guardi|fogueira|campfire|santu|shrine|altar de b|alavanca|lever|espelho|mirror|braseiro|brazier|bloco|block|reinici|reset|palanca|espejo|brasero/i;
function __petTargets(S) {
  const P = S.player, out = [];
  for (const o of S.dungeon?.objects || []) {
    if (!o || o.active === !1 || o.visible === !1 || o.opened || o.used || o.__petSkip) continue;
    const lb = String(o.interactLabel || "");
    if (!lb || typeof o.interact !== "function" || __PET_NOTGT.test(lb)) continue;
    out.push(o);
  }
  for (const g of S.groundItems || []) if (g.active && g.payload?.item?.type === "quest") out.push(g);
  return out.map((o) => [o, Math.hypot(o.x - P.x, o.y - P.y)]).sort((a, b) => a[1] - b[1]);
}
function __petSpawn(S) {
  if (S.__petObj || !S.player || S.isDorfCave || !__Q.camp(S)) return;
  const ps = __petSt(S), id = __petAct(S, ps);
  if (!id || id === "oll" || !__PETS[id] || __petFallen(S, id, ps)) return;
  const D = __PETS[id];
  if (!S.textures.exists(D.tex)) return;
  const K = __petAnims(S.anims, id), L = __petLv(ps.mis[id] | 0), P = S.player, L3 = __PL;
  const hov = D.fly ? 26 : 0;
  const body = { x: P.x - 26, y: P.y + 6, active: !0, setFlipX: (f) => s.setFlipX(f) };
  const s = S.add.sprite(body.x, body.y - hov, D.tex, 0).setOrigin(.5, 1).setScale(D.sc).setDepth(P.y).play(K.idle);
  const sh = S.add.ellipse(body.x, body.y, D.fly ? 12 : D.fw * D.sc * .55, D.fly ? 4 : 6, 0, D.fly ? .18 : .28).setDepth(P.y - 1);
  const fol = __qFollow(S, body, { gap: id === "cao" ? 28 : D.fly ? 40 : 36, walk: 100, run: 185 });
  const fx = { burst: (x, y, c, n) => S.effects?.burstTinted?.(x, y, c, n), txt: (x, y, t, c, z = 10) => S.effects?.floatText?.(x, y, t, c, z) };
  let mode = "follow", tgt = null, tl = 0, cd = 1.2, busyT = 0, scan = 0, trk = null, lastTrk = null, ang = 0;
  const skip = new Set();
  const arrow = D.role === "trk" ? S.add.graphics().setDepth(9000) : null;
  const want = (k) => s.anims.currentAnim?.key !== K[k] && s.play(K[k]);
  const moveTo = (tx, ty, sp, ms) => {
    const dx = tx - body.x, dy = ty - body.y, d = Math.hypot(dx, dy) || 1, k = Math.min(d, sp * ms / 1000);
    const nx = body.x + dx / d * k, ny = body.y + dy / d * k;
    if (!D.fly && S.dungeon?.isWallAtWorld?.(nx, ny)) return -1;
    body.x = nx; body.y = ny; Math.abs(dx) > 1 && s.setFlipX(dx < 0);
    return d;
  };
  const alive = (e) => e && e.active && !e.dead && (e.hp ?? 1) > 0;
  const los = (x, y) => (S.dungeon?.hasLineOfSight ? S.dungeon.hasLineOfSight(body.x, body.y, x, y) : !0);
  const U = (_t, ms) => {
    if (!s.active || !S.player) return;
    ms = Math.min(ms, 60);
    const P2 = S.player, sec = ms / 1000;
    cd -= sec; busyT -= sec;
    if (P2.dead) { want("idle"); return }
    if (busyT > 0) { /* animação de ação em curso */ }
    else if (mode === "follow") {
      const sp = fol(ms);
      want(D.fly ? "walk" : sp > 0 ? "walk" : "idle");
      if (sp > 130 && !D.fly) s.anims.timeScale = 1.5; else s.anims.timeScale = 1;
      // ATAQUE: o inimigo mais perto do herói, com caminho livre
      if (D.role === "atk" && cd <= 0) {
        let best = null, bd = 150;
        const list = (S.enemies?.getChildren?.() || []).concat(S.boss ? [S.boss] : []);
        for (const e of list) { if (!alive(e)) continue; const d = Math.hypot(e.x - P2.x, e.y - P2.y); if (d < bd && Math.hypot(e.x - body.x, e.y - body.y) < 280 && los(e.x, e.y)) { bd = d; best = e } }
        if (best) { tgt = best; mode = "go"; tl = 2.2 } else cd = .3;
      }
      // COLETA: o que está no chão perto do herói
      if (D.role === "col" && cd <= 0) {
        cd = .3;
        let best = null, bd = 90 + 25 * L;
        for (const g of S.groundItems || []) { if (!g.active || skip.has(g)) continue; const d = Math.hypot(g.x - P2.x, g.y - P2.y); if (d < bd && los(g.x, g.y)) { bd = d; best = g } }
        if (best) { tgt = best; mode = "go"; tl = 3.5 }
      }
    } else if (mode === "go") {
      tl -= sec;
      if (D.role === "atk") {
        if (!alive(tgt) || tl <= 0) { mode = "follow"; cd = .6; tgt = null; return post() }
        const d = moveTo(tgt.x, tgt.y + 2, 235 + 15 * L, ms);
        want("walk"); s.anims.timeScale = 1.6;
        if (d < 0) { mode = "follow"; cd = 1; tgt = null }
        else if (d < 24) {
          s.anims.timeScale = 1; s.setFlipX(tgt.x < body.x); s.play(K.act); busyT = .42; mode = "follow";
          const e = tgt; tgt = null; cd = __petAtkCd(L);
          S.time.delayedCall(170, () => {
            if (!alive(e) || !s.active) return;
            const raw = (S.stats?.total?.damage || 2) * __petAtkPct(L), dmg = Math.floor(raw) + (Math.random() < raw % 1 ? 1 : 0);
            fx.burst(e.x, e.y - 6, 0xd8a070, dmg ? 6 : 3);
            if (!dmg) return;
            try { e.takeDamage(dmg, null, 0) } catch (er) {}
            fx.txt(e.x, e.y - 28, `${dmg}`, "#f0b070", 10);
            S.game.audioEngine?.sfx?.("sfx-hit");
          });
        }
      } else if (D.role === "col") {
        if (!tgt?.active || tl <= 0) { tgt && skip.add(tgt); mode = "follow"; tgt = null; return post() }
        const d = moveTo(tgt.x, tgt.y + 2, 150 + 15 * L, ms);
        want("walk");
        if (d < 0) { skip.add(tgt); mode = "follow"; tgt = null }
        else if (d < 8) {
          const g = tgt; tgt = null; mode = "follow"; s.play(K.act); busyT = .35;
          if (S.state === "playing") { try { S.pickup(g) } catch (er) {} g.active ? skip.add(g) : fx.burst(body.x, body.y - 6, 0xffd24a, 6) }
        }
      }
    }
    // RASTREIO: o objetivo mais perto dentro do alcance; o corvo voa na frente e a seta aponta do herói até lá
    if (D.role === "trk") {
      scan -= sec;
      if (scan <= 0) {
        scan = .8;
        const R = [420, 600, 850, 1200, 1e9][L - 1], t0 = __petTargets(S).find(([, d]) => d < R);
        trk = t0 ? t0[0] : null;
        if (trk && trk !== lastTrk) { fx.txt(body.x, body.y - hov - 22, L3("Crá!", "Caw!", "¡Cra!"), "#d8d0e8", 9); S.game.audioEngine?.sfx?.("sfx-ui-move") }
        lastTrk = trk;
      }
      arrow.clear();
      if (trk && trk.active !== !1 && !trk.opened) {
        const dx = trk.x - P2.x, dy = trk.y - P2.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
        if (d > 90) {
          const a = .6 + .35 * Math.sin(S.time.now / 180), cx = P2.x + ux * 28, cy = P2.y - 16 + uy * 20;
          arrow.fillStyle(0xf0d070, a).fillTriangle(cx + ux * 10, cy + uy * 10, cx - uy * 6 - ux * 4, cy + ux * 6 - uy * 4, cx + uy * 6 - ux * 4, cy - ux * 6 - uy * 4);
          arrow.lineStyle(1, 0x2a1a08, a * .8).strokeTriangle(cx + ux * 10, cy + uy * 10, cx - uy * 6 - ux * 4, cy + ux * 6 - uy * 4, cx + uy * 6 - ux * 4, cy - ux * 6 - uy * 4);
        }
        // o corvo vai um pedaço na direção do objetivo (no máximo 150 px do herói) e dá voltas ali
        ang += sec * 2.4;
        const k = Math.min(150, d * .7), ox = P2.x + ux * k + Math.cos(ang) * 14, oy = P2.y + uy * k + Math.sin(ang) * 8;
        mode === "follow" && busyT <= 0 && (moveTo(ox, oy, 170, ms), want("walk"));
      }
    }
    s.setPosition(body.x, body.y - hov + (D.fly ? Math.sin(S.time.now / 260) * 3 : 0)).setDepth(body.y + (D.fly ? 40 : 0));
    sh.setPosition(body.x, body.y).setDepth(body.y - 1);
  };
  const post = () => { s.setPosition(body.x, body.y - hov); sh.setPosition(body.x, body.y) };
  const onClear = () => {
    if (!s.active || !S.player || S.player.dead) return;
    if (D.role === "grd") {
      const h = L >= 5 ? 3 : L >= 3 ? 2 : 1;
      if (S.player.hp < S.player.maxHp) { S.time.delayedCall(500, () => { if (!S.player || S.player.dead) return; S.player.heal(h); s.active && (s.play(K.spec), busyT = 1.2) }) }
    } else if (D.role === "col" && Math.random() < .08 * L) {
      const a = Math.random() * Math.PI * 2, tx = S.player.x + Math.cos(a) * 46, ty = S.player.y + Math.sin(a) * 30;
      if (S.dungeon?.isWallAtWorld?.(tx, ty)) return;
      s.play(K.spec); busyT = 1.1;
      fx.txt(body.x, body.y - 24, L3("*fareja*", "*sniff*", "*olfatea*"), "#e8d090", 8);
      S.time.delayedCall(1100, () => { try { S.scene.isActive() && S.lootSystem?.spawnGold?.(tx, ty, 3 + __Q.n(S) * 2 + ((Math.random() * 4) | 0)) } catch (e) {} });
    }
  };
  S.game.events.on("room:cleared", onClear);
  if (D.role === "grd") {
    S.__petGuard = {
      p: .1 + .04 * (L - 1), cd: 0,
      block(src, n) {
        busyT = .5; s.active && s.play(K.act);
        life.hit(n);                                         // o golpe bloqueado acerta o cão
        const P3 = S.player; fx.txt(P3.x, P3.y - 30, L3("BLOQUEADO!", "BLOCKED!", "¡BLOQUEADO!"), "#f0c070", 10); fx.burst(P3.x, P3.y - 8, 0xf0c070, 8);
        if (src?.x != null) { s.setFlipX(src.x < body.x); const dx = src.x - body.x, dy = src.y - body.y, d = Math.hypot(dx, dy) || 1; d > 20 && (body.x += dx / d * Math.min(20, d - 18), body.y += dy / d * Math.min(14, d - 18)) }
        S.game.audioEngine?.sfx?.("sfx-shield-block");
      },
    };
  }
  S.events.on("update", U);
  const kill = () => { S.events.off("update", U); S.game.events.off("room:cleared", onClear); if (S.__petObj === obj) { S.__petObj = null; S.__petId = null; S.__petGuard = null } };
  const obj = { id, s, destroy() { kill(); life.destroy(); s.destroy(); sh.destroy(); arrow?.destroy() } };
  const life = __petLife(S, id, L, () => (s.active ? { x: body.x, y: body.y, h: D.fh * D.sc * .75 + hov, spr: s } : null), () => { kill(); s.destroy(); sh.destroy(); arrow?.destroy() });
  S.events.once("shutdown", kill);
  S.__petObj = obj; S.__petId = id;
  fx.burst(body.x, body.y - 8, 0xf0e0b0, 6);
}
/* tira o pet atual (o comprado ou o Ollie) e chama o escolhido — usado pela aba PETS do livro */
function __petSwap(S) {
  try {
    if (!S?.scene?.isActive?.() || !S.player || !__Q.camp(S)) return;
    S.__petObj?.destroy(); S.__petObj = null;
    S.__gtPetKill?.();
    S.__petId = null; S.__petGuard = null;
    const id = __petAct(S);
    if (id === "oll") __gtPet(S); else __petSpawn(S);
  } catch (e) { console.warn("[pets]", e) }
}
/* o cão bloqueia golpes do herói */
{
  const TD = oh.prototype.takeDamage;
  oh.prototype.takeDamage = function (i, t) {
    try {
      const S = this.scene, G = S?.__petGuard;
      if (G && this === S.player && !this.dead && !(this.invuln > 0) && i > 0 && S.time.now > G.cd && Math.random() < G.p) {
        G.cd = S.time.now + 700; this.__contactHit = !1; G.block(t, i);
        return !1;
      }
    } catch (e) {}
    return TD.apply(this, arguments);
  };
}
/* ─── ganchos na fase: o pet aparece junto do herói; chefe vencido e missão concluída contam como treino ─── */
{
  const GP = __gtPet;
  __gtPet = function (S) {
    try { if (__petAct(S) !== "oll" || __petFallen(S, "oll")) return } catch (e) {}
    const r = GP.apply(this, arguments);
    try {
      const c = S.__gtPet;
      if (c && !c.__life) {
        S.__petId = "oll";
        const kill0 = S.__gtPetKill;
        c.__life = __petLife(S, "oll", __petLv(__petSt(S).mis.oll | 0), () => (c.active ? { x: c.x, y: c.y, h: 24, spr: c } : null), () => kill0?.());
        S.__gtPetKill = () => { c.__life?.destroy(); kill0?.() };
      }
    } catch (e) {}
    return r;
  };
  const HS = __hubSetup;
  __hubSetup = function (S) {
    const r = HS.apply(this, arguments);
    try {
      if (!__Q.camp(S) || S.isDorfCave) return r;
      __PET_SHOP.forEach((id) => __petAnims(S.anims, id));
      S.__petBossDone = !1;                                   // a cena é reaproveitada entre as áreas
      if (!S.__petObj && !S.__gtPet) { S.__petId = null; S.__petGuard = null }
      S.time.delayedCall(720, () => S.scene.isActive() && __petSpawn(S));
      // treino: missão secundária concluída com o pet junto (a primeira leitura só guarda o que já estava pronto)
      S.time.delayedCall(1500, () => {
        if (!S.scene.isActive()) return;
        const ps = __petSt(S), done = __QLIST.filter((q) => { try { return q.st(S)?.[0] === "done" } catch (e) { return !1 } }).map((q) => q.id);
        if (!ps.qd) { ps.qd = done; __petSave(S, ps); return }
        const nw = done.filter((d) => !ps.qd.includes(d));
        if (!nw.length) return;
        ps.qd = ps.qd.concat(nw); __petSave(S, ps);
        nw.forEach(() => __petMission(S, "quest"));
      });
      const onBoss = () => { if (S.__petBossDone || !S.scene.isActive()) return; S.__petBossDone = !0; __petMission(S, "boss") };
      S.game.events.on("boss:defeated", onBoss);
      S.events.once("shutdown", () => S.game.events.off("boss:defeated", onBoss));
    } catch (e) { console.warn("[pets]", e) }
    return r;
  };
  // folhas
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try {
      const L = this.load, op = L.path; L.setPath("");
      for (const id of __PET_SHOP) { const D = __PETS[id]; this.textures.exists(D.tex) || L.spritesheet(D.tex, `assets/pixel-art/pets/${D.tex}.png`, { frameWidth: D.fw, frameHeight: D.fh }) }
      L.setPath(op);
    } catch (e) {}
    return r;
  };
  // os pets são do herói: somem ao excluir o herói ou começar campanha nova no slot
  const del = (tag) => { try { localStorage.removeItem("depthgate:pets:" + tag) } catch (e) {} };
  const K0 = Kr;
  Kr = function (c = 1, i = "campaign") { del((i === "endless" ? "e" : "") + c); return K0.apply(this, arguments) };
  const CR = __cReset;
  __cReset = function (g, sl) { del(String(sl)); return CR.apply(this, arguments) };
}

/* ─── aba PETS no livro do inventário (só na campanha; fica depois de POÇÕES) ─── */
function __bkPetTab(C, on) {
  const T = C.__bkPet;
  if (T) { for (const o of T.objs) o.destroy(); C.__bkPet = null }
  if (!on) return;
  const B = C.root?.__bk, S = C.ui, G = S.scene.get("Game");
  if (!B || B.single || !G) return;
  const PX = "PixelifySans, Georgia, serif", SER = "Georgia, 'Times New Roman', serif", objs = [];
  const add = (o) => { o.__noPaper = 1; C.root.add(o); objs.push(o); return o };
  const ps = __petSt(G), own = __petOwned(G, ps), act = __petAct(G, ps);
  const mid = B.x + B.w / 2, lx = B.x + 26, lw = mid - lx - 22, rx = mid + 22, rw = B.x + B.w - 26 - rx, top = B.y + 44;
  add(S.add.text(lx, top, __PL("Seus companheiros", "Your companions", "Tus compañeros"), { fontFamily: PX, fontSize: "11px", color: "#8b1d16" }));
  const RH = 40, ry0 = top + 22;
  const sel = add(S.add.nineslice(0, 0, "bk-list_row_selected", undefined, lw + 8, RH - 2, 3, 3, 3, 3).setOrigin(0).setVisible(!1));
  const rows = own.map((id, k) => {
    const D = __PETS[id], y = ry0 + k * RH, tr = __petTrain(ps.mis[id] | 0);
    const ic = add(S.add.image(lx + 18, y + RH / 2, D.tex, D.keys ? 0 : D.a.idle[0]).setOrigin(.5));
    ic.setScale(Math.min(34 / (D.fw * .7), 30 / (D.fh * .7)));
    if (!S.textures.exists(D.tex)) ic.setVisible(!1);
    const fl = __petFallen(G, id, ps);
    fl && ic.setTint(0x8a7a6a);
    const nm = add(S.add.text(lx + 40, y + 5, D.nm + (fl ? __PL("  · CAÍDO", "  · FALLEN", "  · CAÍDO") : id === act ? "  ✓" : ""), { fontFamily: PX, fontSize: "11px", color: fl ? "#8b1d16" : D.rar === "LEGENDARY" ? "#a8560e" : "#3b2416" }));
    add(S.add.text(lx + 40, y + 20, `${__PL3(D.rl)} · ${"★".repeat(tr.L)}${"☆".repeat(5 - tr.L)}`, { fontFamily: PX, fontSize: "8px", color: "#6b4a2e" }));
    const z = add(S.add.zone(lx - 4, y, lw + 8, RH - 2).setOrigin(0).setInteractive({ useHandCursor: !0 }));
    z.on("pointerdown", () => pick(k, !0));
    return { id, y, nm };
  });
  const hint = add(S.add.text(lx + lw / 2, ry0 + Math.max(1, rows.length) * RH + (rows.length ? 10 : 6), rows.length
    ? __PL("Mais pets no TREINO DE PETS\ndo vendedor do Refúgio.", "More pets at the PET TRAINING\nstall of the Refuge vendor.", "Más mascotas en el ENTRENAMIENTO\ndel vendedor del Refugio.")
    : __PL("Nenhum pet ainda.\n\nCompre um no TREINO DE PETS do\nvendedor do Refúgio, ou ganhe um\nlendário em missões secundárias.", "No pets yet.\n\nBuy one at the Refuge vendor's\nPET TRAINING, or earn a legendary\none in side quests.", "Aún no tienes mascotas.\n\nCompra una en el ENTRENAMIENTO del\nvendedor del Refugio o gana una\nlegendaria en misiones."), { fontFamily: SER, fontSize: "9px", color: "#6b4a2e", align: "center", lineSpacing: 3 }).setOrigin(.5, 0));
  // página da direita
  const tT = add(S.add.text(rx + rw / 2, top - 2, "", { fontFamily: PX, fontSize: "15px", color: "#3b2416" }).setOrigin(.5, 0));
  const tK = add(S.add.text(rx + rw / 2, top + 18, "", { fontFamily: PX, fontSize: "8px", color: "#6b4a2e" }).setOrigin(.5, 0));
  const tR = add(S.add.text(rx + rw / 2, top + 30, "", { fontFamily: PX, fontSize: "9px", color: "#c46a12" }).setOrigin(.5, 0));
  const spr = add(S.add.sprite(rx + rw / 2, top + 108, "__DEFAULT").setOrigin(.5, 1).setVisible(!1));
  const bar = add(S.add.graphics());
  const tL = add(S.add.text(rx + rw / 2, top + 116, "", { fontFamily: PX, fontSize: "9px", color: "#3b2416" }).setOrigin(.5, 0));
  const dv = add(S.add.image(rx + rw / 2, top + 166, "bk-divider").setScale(2, 1));
  const tE = add(S.add.text(rx + 4, top + 176, "", { fontFamily: SER, fontSize: "10px", color: "#3b2416", lineSpacing: 3, wordWrap: { width: rw - 8 } }));
  const tN = add(S.add.text(rx + 4, top + 200, "", { fontFamily: SER, fontSize: "9px", fontStyle: "italic", color: "#6b4a2e", lineSpacing: 2, wordWrap: { width: rw - 8 } }));
  // trocar de pet só no Refúgio: aqui é só a ficha (situação do pet no lugar do botão)
  const btn = add(S.add.text(rx + rw / 2, B.y + B.h - 34, "", { fontFamily: PX, fontSize: "11px", color: "#f6e7c8", backgroundColor: "#6e3b22", padding: { x: 12, y: 4 } }).setOrigin(.5));
  const tS = add(S.add.text(lx + lw / 2, B.y + B.h - 26, "", { fontFamily: SER, fontSize: "9px", fontStyle: "italic", color: "#8b1d16", align: "center", lineSpacing: 2, wordWrap: { width: lw - 10 } }).setOrigin(.5, 1));   // na página da esquerda, embaixo da lista
  rows.length || [tT, tK, tR, tL, dv, tE, tN, btn, tS].forEach((o) => o.setVisible(!1));
  let cur = -1;
  const pick = (k, flip) => {
    if (!rows.length) return;
    k = (k + rows.length) % rows.length;
    if (k === cur) return;
    flip && cur >= 0 && __bkFlip(S, C.root, k > cur);
    cur = k; C.__bkPet && (C.__bkPet.cur = k);
    const id = rows[k].id, D = __PETS[id], tr = __petTrain(ps.mis[id] | 0), rar = __PET_RAR[D.rar];
    sel.setVisible(!0).setPosition(lx - 4, rows[k].y);
    tT.setText(D.nm); tK.setText(`${__PL3(D.kind)} · ${__PL3(D.rl)}`); tR.setText(`${__PL3(rar)} · ♥ ${__petMaxHp(id, tr.L)}`).setColor(rar[3]);
    if (S.textures.exists(D.tex)) {
      const K = __petAnims(S.anims, id);
      spr.setTexture(D.tex).setVisible(!0).setScale(Math.min(2.2, 96 / D.fw / .8, 70 / D.fh / .8)).setFlipX(!1);
      K?.idle && S.anims.exists(K.idle) && spr.play(K.idle);
    }
    tL.setText(__PL(`TREINO: ${tr.txt}`, `TRAINING: ${tr.txt}`, `ENTRENAMIENTO: ${tr.txt}`));
    const bw = rw - 60, bx = rx + 30, by = top + 132, pr = tr.nx == null ? 1 : (tr.n - __PET_TH[tr.L - 1]) / (tr.nx - __PET_TH[tr.L - 1]);
    bar.clear().fillStyle(0x3b2416, .25).fillRoundedRect(bx, by, bw, 7, 3).fillStyle(0xc46a12, .95).fillRoundedRect(bx, by, Math.max(4, bw * pr), 7, 3).lineStyle(1, 0x3b2416, .7).strokeRoundedRect(bx, by, bw, 7, 3);
    for (let i = 1; i <= 5; i++) bar.fillStyle(i <= tr.L ? 0xc46a12 : 0x8a7356, i <= tr.L ? 1 : .4).fillCircle(rx + rw / 2 + (i - 3) * 12, by + 15, 3);
    tE.setText(__petEff(id, tr.L));
    tN.setY(tE.y + tE.height + 8).setText(tr.nx == null ? __PL("Treino completo: o vínculo de vocês é o mais forte possível.", "Training complete: your bond is as strong as it gets.", "Entrenamiento completo: su vínculo es el más fuerte posible.")
      : __PL(`No nível ${tr.L + 1}: `, `At level ${tr.L + 1}: `, `En nivel ${tr.L + 1}: `) + __petEff(id, tr.L + 1));
    paintBtn();
  };
  const paintBtn = () => {
    const id = rows[cur]?.id; if (!id) return;
    const fl = __petFallen(G, id), on = !fl && id === __petAct(G);
    btn.setText(fl ? __PL("CAÍDO · NO REFÚGIO", "FALLEN · AT THE REFUGE", "CAÍDO · EN EL REFUGIO") : on ? __PL("✓ ACOMPANHANDO VOCÊ", "✓ TRAVELING WITH YOU", "✓ TE ACOMPAÑA") : __PL("DESCANSANDO NO REFÚGIO", "RESTING AT THE REFUGE", "DESCANSANDO EN EL REFUGIO"))
      .setBackgroundColor(fl ? "#7a2a20" : on ? "#2f5a2a" : "#5a4a3a");
    tS.setText(fl ? __PL("Caiu em combate e um portal o levou ao Refúgio. Vá ao Treino de Pets do vendedor para recrutá-lo.", "It fell in battle and a portal took it to the Refuge. Go to the vendor's Pet Training to recruit it.", "Cayó en combate y un portal lo llevó al Refugio. Ve al Entrenamiento del vendedor para reclutarlo.")
      : on ? "" : __PL("Só dá para trocar de companheiro no Treino de Pets do Refúgio.", "You can only switch companions at the Refuge's Pet Training.", "Solo puedes cambiar de compañero en el Entrenamiento del Refugio."));
    hint.setVisible(!tS.text || hint.y + hint.height < tS.y - tS.height - 6);
  };
  const take = () => {};                       // trocar no meio da missão não pode
  C.__bkPet = { objs, cur: -1, pick, take, n: rows.length };
  rows.length && pick(Math.max(0, rows.findIndex((r) => r.id === act)));
}
{
  // a etiqueta da aba nasce com as outras (campanha)
  const B0 = Cd.prototype.build;
  Cd.prototype.build = function () {
    const r = B0.apply(this, arguments);
    try {
      const T = this.__tabT, endless = this.ui?.game?.registry?.get("mode") === "endless" || !!this.gs?.()?.level?.endless;
      if (T && T.length === 6 && !endless) {
        const a = T[T.length - 1], o = this.ui.add.text(a.x + a.width + 20, a.y, __PL("PETS", "PETS", "MASCOTAS"), a.style).setOrigin(a.originX, a.originY).setInteractive({ useHandCursor: !0 });
        o.on("pointerdown", () => __invTab(this, 6));
        this.root.add(o); T.push(o);
      }
    } catch (e) { console.warn("[pets]", e) }
    return r;
  };
  // trocar para a aba 6: o resto do livro se comporta como numa aba de página inteira (Atributos) e o pet desenha por cima
  const TB = __invTab;
  __invTab = function (C, k) {
    const n = C.__tabT?.length ?? 0;
    if (n !== 7) { __bkPetTab(C, !1); return TB.apply(this, arguments) }
    k = ((k % 7) + 7) % 7;
    const prev = C.__tab;
    if (k !== 6) { __bkPetTab(C, !1); return TB.call(this, C, k) }
    TB.call(this, C, 1);
    C.__tab = 6; C.__logicalTab = 6;
    try {
      C.__big?.setVisible(!1);
      C.__sbZ?.setVisible(!1); C.__dragZ?.setVisible(!1); C.__sbG?.clear();
      C.__big?.setCrop?.();
      if (C.root?.__bk) { __bkGrid(C); __bkTabs(C); prev === 1 && C.open && __bkFlip(C.ui, C.root, !0) }
      __bkPetTab(C, !0);
    } catch (e) { console.warn("[pets]", e) }
  };
  const S0 = Cd.prototype.show;
  Cd.prototype.show = function () {
    const r = S0.apply(this, arguments);
    try { if (this.__logicalTab === 6 && this.__tabT?.length === 7) { this.__big?.setVisible(!1); __bkPetTab(this, !0) } } catch (e) {}
    return r;
  };
  const R0 = Cd.prototype.refresh;
  Cd.prototype.refresh = function () {
    const r = R0.apply(this, arguments);
    try { if (this.__logicalTab === 6 && this.__tabT?.length === 7) this.__big?.setVisible(!1) } catch (e) {}
    return r;
  };
  const H0 = Cd.prototype.handleKey;
  Cd.prototype.handleKey = function (k) {
    try {
      const P = this.__bkPet;
      if (this.open && P && this.__logicalTab === 6) {
        if (k === "ArrowUp" || k === "w" || k === "ArrowLeft") { P.pick((P.cur < 0 ? 0 : P.cur) - 1, !0); return !0 }
        if (k === "ArrowDown" || k === "s" || k === "ArrowRight") { P.pick((P.cur < 0 ? 0 : P.cur) + 1, !0); return !0 }
        if (k === "Enter" || k === " ") { P.take(); return !0 }
      }
    } catch (e) {}
    return H0.apply(this, arguments);
  };
}

/* ─── Refúgio: o vendedor ganha a aba TREINO DE PETS ─── */
{
  const OM = Fl.prototype.openMetaPanel;
  Fl.prototype.openMetaPanel = function (title, quote, ids) {
    const r = OM.apply(this, arguments);
    try {
      if (this.fromForest && this.panel && title === W("hub.vendor")) {
        this.__vendArgs = [title, quote, ids];
        const o = this.panel, d = _ / 2, rows = this.panelRows || [];
        for (const pr of rows) pr.row.setY(pr.row.y + 22);
        const tab = (lbl, x, on, fn) => {
          const t = this.add.text(x, 102, on ? `▸ ${lbl} ◂` : lbl, { ...ti, fontSize: "10px", color: on ? "#ffd24a" : "#d8cdb4", ...(on ? {} : { backgroundColor: "#1a120b", padding: { x: 8, y: 3 } }) }).setOrigin(.5);
          if (on) t.__fnSkip = 1; else { t.setInteractive({ useHandCursor: !0 }); t.on("pointerdown", fn) }
          o.add(t); return t;
        };
        tab(__PL("🎒 MERCADORIA", "🎒 GOODS", "🎒 MERCANCÍA"), d - 86, !0);
        tab(__PL("🐾 TREINO DE PETS", "🐾 PET TRAINING", "🐾 MASCOTAS"), d + 80, !1, () => { this.closePanel(); this.__petShop() });
        const back = o.list.find((x) => x.type === "Text" && x.text === W("hub.back"));
        this.__fnAuto(o, back); this.panelRows = rows;          // foco do controle passa por abas, itens e voltar
      }
    } catch (e) { console.warn("[pets]", e) }
    return r;
  };
  Fl.prototype.__petShop = function () {
    if (this.panel || !this.fromForest) return;
    const L3 = __PL, d = _ / 2, Y = 12, HH = 336, H = this;
    const o = this.add.container(this.__ox, this.__oy).setDepth(9800).setScrollFactor(0).setScale(this.__us);
    const bg = this.add.rectangle(d, st / 2, _, st, 328450, .82).setInteractive();
    const n = this.add.graphics();
    Dt(n, d - 300, Y, 600, HH); o.add([bg, n]);
    __winSkin(this, o, d - 300, Y, 600, HH, 1) && n.clear();
    const LW = 272, LC = d - 150, RX = d + 14, RW = 272, RC = d + 150;
    const gold = () => { try { return __cData(this)?.d?.player?.gold ?? 0 } catch (e) { return 0 } };
    o.add(this.add.text(LC, Y + 16, L3("TREINO DE PETS", "PET TRAINING", "ENTRENAMIENTO DE MASCOTAS"), { ...ti, fontSize: "12px", color: "#ffd24a" }).setOrigin(.5));
    o.add(this.add.text(LC, Y + 28, L3("Um companheiro por vez. Quanto mais missões juntos, mais forte ele fica.", "One companion at a time. The more quests together, the stronger it gets.", "Un compañero a la vez. Cuantas más misiones juntos, más fuerte."), { ...Le, fontSize: "7px", fontStyle: "italic", color: "#c8b48a", align: "center", wordWrap: { width: LW } }).setOrigin(.5, 0));
    const tab = (lbl, x, on, fn) => {
      const t = this.add.text(x, Y + 58, on ? `▸ ${lbl} ◂` : lbl, { ...ti, fontSize: on ? "10px" : "9px", color: on ? "#ffd24a" : "#d8cdb4", ...(on ? {} : { backgroundColor: "#1a120b", padding: { x: 7, y: 3 } }) }).setOrigin(.5);
      if (on) t.__fnSkip = 1; else { t.setInteractive({ useHandCursor: !0 }); t.on("pointerdown", fn) }
      o.add(t); return t;
    };
    const close = () => { o.destroy(); this.panel = null; this.__fn = null; this.__busy = !1 };
    tab(L3("🎒 MERCADORIA", "🎒 GOODS", "🎒 MERCANCÍA"), LC - 70, !1, () => { close(); const a = this.__vendArgs; a && this.openMetaPanel(...a) });
    tab(L3("🐾 TREINO DE PETS", "🐾 PET TRAINING", "🐾 MASCOTAS"), LC + 62, !0);
    const goldT = this.add.text(LC, Y + HH - 40, "", { ...ti, fontSize: "10px", color: "#f2d98a" }).setOrigin(.5);
    o.add(goldT);
    const list = ["oll", ...__PET_SHOP];
    let sel = Math.max(0, list.indexOf(__petAct(this) ?? "lobo")), confirming = !1;
    const RY = Y + 72, RH = 38, rowsUi = [];
    list.forEach((id, k) => {
      const D = __PETS[id], y = RY + k * (RH + 2);
      const g = this.add.graphics(), z = this.add.zone(d - 300 + 14, y, LW, RH).setOrigin(0).setInteractive({ useHandCursor: !0 });
      const ok = this.textures.exists(D.tex), ic = this.add.image(d - 300 + 38, y + RH / 2 + 2, ok ? D.tex : "__DEFAULT", ok ? (D.keys ? 0 : D.a.idle[0]) : 0).setOrigin(.5).setVisible(ok);
      ic.setScale(Math.min(38 / (D.fw * .7), 30 / (D.fh * .7)));
      const nm = this.add.text(d - 300 + 64, y + 4, D.nm, { ...ti, fontSize: "11px", color: D.rar === "LEGENDARY" ? "#ffb347" : "#f2e6cc" });
      const rl = this.add.text(d - 300 + 64, y + 20, `${__PL3(D.kind)} · ${__PL3(D.rl)}`, { ...Le, fontSize: "8px", color: "#c8b48a" });
      const pr = this.add.text(d - 300 + 14 + LW - 8, y + RH / 2, "", { ...ti, fontSize: "9px", color: "#ffd24a" }).setOrigin(1, .5);
      z.on("pointerdown", () => select(k));
      o.add([g, ic, nm, rl, pr, z]);
      rowsUi.push({ id, g, pr, y, z, draw: (on) => { g.clear(); g.fillStyle(on ? 0x3a2f1e : 0x241a10, on ? .95 : .7).fillRoundedRect(d - 300 + 14, y, LW, RH, 5); on && g.lineStyle(1.5, 0xffd24a, .9).strokeRoundedRect(d - 300 + 14, y, LW, RH, 5) } });
    });
    // direita
    const pName = this.add.text(RC, Y + 16, "", { ...ti, fontSize: "13px", color: "#ffd24a" }).setOrigin(.5, 0);
    const pRar = this.add.text(RC, Y + 34, "", { ...Le, fontSize: "8px", color: "#e8a050" }).setOrigin(.5, 0);
    const pv = this.add.sprite(RC, Y + 128, "__DEFAULT").setOrigin(.5, 1).setVisible(!1);
    const pTr = this.add.text(RC, Y + 136, "", { ...Le, fontSize: "8px", color: "#9cc2ff" }).setOrigin(.5, 0);
    const pEff = this.add.text(RX + 8, Y + 156, "", { ...Le, fontSize: "9px", color: "#f2e6cc", lineSpacing: 3, wordWrap: { width: RW - 16 } });
    const pNote = this.add.text(RX + 8, Y + 200, "", { ...Le, fontSize: "8px", fontStyle: "italic", color: "#c8b48a", lineSpacing: 2, wordWrap: { width: RW - 16 } });
    const btn = this.add.text(RC, Y + 268, "", { ...ti, fontSize: "11px", color: "#f6e7c8", backgroundColor: "#6e3b22", padding: { x: 12, y: 5 } }).setOrigin(.5).setInteractive({ useHandCursor: !0 });
    const ask = this.add.text(RC, Y + 252, "", { ...Le, fontSize: "9px", color: "#f2e6cc", align: "center", wordWrap: { width: RW - 10 } }).setOrigin(.5).setVisible(!1);
    const yesBtn = this.add.text(RC - 56, Y + 276, L3("✔ ADOTAR", "✔ ADOPT", "✔ ADOPTAR"), { ...ti, fontSize: "10px", color: "#f6e7c8", backgroundColor: "#2f5a2a", padding: { x: 10, y: 4 } }).setOrigin(.5).setInteractive({ useHandCursor: !0 }).setVisible(!1);
    const noBtn = this.add.text(RC + 56, Y + 276, L3("✕ CANCELAR", "✕ CANCEL", "✕ CANCELAR"), { ...ti, fontSize: "10px", color: "#f6e7c8", backgroundColor: "#6e3b22", padding: { x: 10, y: 4 } }).setOrigin(.5).setInteractive({ useHandCursor: !0 }).setVisible(!1);
    const msg = this.add.text(RC, Y + 298, "", { ...Le, fontSize: "8px", color: "#4ade80", align: "center", wordWrap: { width: RW - 10 } }).setOrigin(.5, 0);
    o.add([pName, pRar, pv, pTr, pEff, pNote, btn, ask, yesBtn, noBtn, msg]);
    const cB = this.add.text(RC, Y + HH - 16, L3("✕ FECHAR", "✕ CLOSE", "✕ CERRAR"), { ...ti, fontSize: "10px", color: "#d8cdb4" }).setOrigin(.5).setInteractive({ useHandCursor: !0 });
    cB.on("pointerdown", close); o.add(cB);
    const state = (id) => { const ps = __petSt(this); const own = id === "oll" ? __petHasOll(this) : !!ps.own[id], fall = own && !!ps.fall?.[id]; return { ps, own, fall, act: !fall && __petAct(this, ps) === id, tr: __petTrain(ps.mis[id] | 0) } };
    const paint = () => {
      goldT.setText(L3(`Seu ouro: ● ${gold()}`, `Your gold: ● ${gold()}`, `Tu oro: ● ${gold()}`));
      rowsUi.forEach((r, i) => {
        r.draw(i === sel);
        const s2 = state(r.id), D = __PETS[r.id];
        r.pr.setText(s2.fall ? L3("CAÍDO", "FALLEN", "CAÍDO") : s2.act ? L3("✓ COM VOCÊ", "✓ WITH YOU", "✓ CONTIGO") : s2.own ? `${L3("Nv", "Lv", "Nv")} ${s2.tr.L}` : D.quest ? L3("MISSÃO", "QUEST", "MISIÓN") : `${D.price} ●`)
          .setColor(s2.fall ? "#ff7a6a" : s2.act ? "#8ae0b0" : s2.own ? "#9cc2ff" : D.quest ? "#e8a050" : gold() >= D.price ? "#ffd24a" : "#e08a7a");
      });
      const id = list[sel], D = __PETS[id], s2 = state(id), rar = __PET_RAR[D.rar];
      pName.setText(D.nm.toUpperCase()).setColor(D.rar === "LEGENDARY" ? "#ffb347" : "#ffd24a");
      pRar.setText(`${__PL3(D.kind)} · ${__PL3(D.rl)} · ${__PL3(rar)}`);
      if (this.textures.exists(D.tex)) {
        const K = __petAnims(this.anims, id);
        pv.setTexture(D.tex).setVisible(!0).setScale(Math.min(2.4, 110 / D.fw / .8, 80 / D.fh / .8));
        K?.idle && this.anims.exists(K.idle) && pv.play(K.idle);
        D.quest && !s2.own ? pv.setTint(0x202020) : pv.clearTint();
      } else pv.setVisible(!1);
      pTr.setText(s2.fall ? L3("Caiu em combate: recrute para ele voltar a te acompanhar", "Fell in battle: recruit it so it can travel with you again", "Cayó en combate: recluta para que vuelva contigo") : s2.own ? L3(`TREINO: ${s2.tr.txt} · ♥ ${__petMaxHp(id, s2.tr.L)}`, `TRAINING: ${s2.tr.txt}`, `ENTRENAMIENTO: ${s2.tr.txt}`) : L3("Treino começa no nível 1", "Training starts at level 1", "El entrenamiento empieza en nivel 1"));
      pEff.setText(__petEff(id, s2.own ? s2.tr.L : 1));
      pNote.setY(pEff.y + pEff.height + 8).setText(D.quest
        ? (s2.own ? L3("Lendário e único: não se compra, só se ganha em missão. Ele te escolheu.", "Legendary and unique: it can't be bought, only earned in a quest. It chose you.", "Legendario y único: no se compra, solo se gana en misión. Te eligió.")
          : L3("Lendário e único. Recompensa da missão Os Gatos da Alline.", "Legendary and unique. Reward of the quest Alline's Cats.", "Legendario y único. Recompensa de la misión Los Gatos de Alline."))
        : s2.tr.nx == null && s2.own ? "" : L3(`No nível 5 de treino: `, `At training level 5: `, `En nivel 5: `) + __petEff(id, 5));
      const canBtn = !(D.quest && !s2.own);
      btn.setVisible(!confirming && canBtn);
      btn.setText(s2.fall ? L3("RECRUTAR DE VOLTA", "RECRUIT BACK", "RECLUTAR") : s2.act ? L3("✓ ACOMPANHANDO VOCÊ", "✓ TRAVELING WITH YOU", "✓ TE ACOMPAÑA") : s2.own ? L3("LEVAR COMIGO", "TAKE WITH ME", "LLEVAR CONMIGO") : `${L3("ADOTAR", "ADOPT", "ADOPTAR")} · ${D.price} ●`)
        .setBackgroundColor(s2.act ? "#2f5a2a" : "#6e3b22");
      for (const b of [btn, yesBtn, noBtn]) b.input && (b.input.enabled = b.visible);
    };
    const refocus = (want) => { this.__fnAuto(o, confirming ? noBtn : cB, !0); if (this.__fn && want) { const k = this.__fn.items.indexOf(want); k >= 0 && (this.__fn.sel = k); this.__fnDraw() } };
    const setConfirm = (on) => {
      confirming = on; const D = __PETS[list[sel]];
      ask.setVisible(on); yesBtn.setVisible(on); noBtn.setVisible(on);
      on && ask.setText(L3(`Adotar ${D.nm} por ${D.price} de ouro?`, `Adopt ${D.nm} for ${D.price} gold?`, `¿Adoptar a ${D.nm} por ${D.price} de oro?`));
      for (const r of rowsUi) r.z.input && (r.z.input.enabled = !on);
      paint(); refocus(on ? yesBtn : btn);
    };
    const select = (k) => { if (confirming) return; sel = k; msg.setText(""); paint(); this.game.audioEngine?.sfx?.("sfx-ui-tab"); this.__fn && refocus(rowsUi[k].z) };
    btn.on("pointerdown", () => {
      const id = list[sel], D = __PETS[id], s2 = state(id);
      if (s2.act || (D.quest && !s2.own)) return;
      if (s2.fall) { delete s2.ps.fall[id]; s2.ps.act = id; __petSave(this, s2.ps); this.__petPenSpot && __petPenFill(this); this.game.audioEngine?.sfx?.("sfx-item-pickup"); msg.setText(L3(`${D.nm} está recuperado e vai com você na próxima saída!`, `${D.nm} has recovered and will go with you on your next trip!`, `¡${D.nm} se recuperó e irá contigo en la próxima salida!`)).setColor("#8ae0b0"); paint(); return }
      if (s2.own) { s2.ps.act = id; __petSave(this, s2.ps); this.__petPenSpot && __petPenFill(this); this.game.audioEngine?.sfx?.("sfx-item-pickup"); msg.setText(L3(`${D.nm} vai com você na próxima saída.`, `${D.nm} will go with you on your next trip.`, `${D.nm} irá contigo en la próxima salida.`)).setColor("#8ae0b0"); paint(); return }
      if (gold() < D.price) { msg.setText(L3("Ouro da campanha insuficiente.", "Not enough campaign gold.", "Oro de campaña insuficiente.")).setColor("#e08a7a"); this.game.audioEngine?.sfx?.("sfx-event-refuse"); return }
      setConfirm(!0);
    });
    noBtn.on("pointerdown", () => setConfirm(!1));
    yesBtn.on("pointerdown", () => {
      const id = list[sel], D = __PETS[id], c = __cData(this);
      if (!c?.d) return setConfirm(!1);
      c.d.player ??= {};
      const g = c.d.player.gold ?? 0;
      if (g < D.price) { setConfirm(!1); msg.setText(L3("Ouro da campanha insuficiente.", "Not enough campaign gold.", "Oro de campaña insuficiente.")).setColor("#e08a7a"); return }
      c.d.player.gold = g - D.price;
      try { localStorage.setItem(Wt("campaign", c.sl), JSON.stringify(c.d)) } catch (e) { c.d.player.gold = g; setConfirm(!1); return }
      const ps = __petSt(this); ps.own[id] = 1; ps.mis[id] ??= 0; ps.act = id; __petSave(this, ps); this.__petPenSpot && __petPenFill(this);
      try { this.refreshFragments?.() } catch (e) {}
      this.game.audioEngine?.sfx?.("sfx-item-pickup");
      setConfirm(!1);
      msg.setText(L3(`${D.nm} agora é seu e vai com você na próxima saída!`, `${D.nm} is yours and will go with you on your next trip!`, `¡${D.nm} es tuyo e irá contigo en la próxima salida!`)).setColor("#8ae0b0");
      try { this.__glow?.(this.playerX, this.playerY - 10, .4, 0xffd24a, .5, 500) } catch (e) {}
    });
    this.panel = o;
    paint();
    this.__fnAuto(o, cB);
    refocus(rowsUi[sel].z);
  };
}
/* ─── Canto dos Pets no Refúgio: cercado de madeira no gramado da esquerda (entre o caminho e os bonecos de treino),
   com casinha, cama de feno, ração e água. Os pets que você tem descansam ali dentro, andam, comem e bebem; os
   caídos dormem no feno se recuperando; o que vai com você espera no portão e te segue pela vila.
   Tocar no cercado abre o Treino de Pets. Só na campanha. ─── */
const __PEN = { x: 60, y: 424, w: 176, h: 112 };
const __PEN_IMG = ["pet-pen-back", "pet-pen-front", "pet-kennel", "pet-bowl", "pet-trough", "pet-hay"];
{
  const P0 = bo.prototype.preload;
  bo.prototype.preload = function () {
    const r = P0.apply(this, arguments);
    try { const L = this.load, op = L.path; L.setPath(""); for (const k of __PEN_IMG) this.textures.exists(k) || L.image(k, `assets/pixel-art/pets/${k}.png`); L.setPath(op) } catch (e) {}
    return r;
  };
  const I0 = Fl.prototype.__inters;
  Fl.prototype.__inters = function () {
    const r = I0.apply(this, arguments);
    try { this.fromForest && this.textures.exists("pet-pen-back") && __petPen(this) } catch (e) { console.warn("[pets]", e) }
    return r;
  };
}
function __petPen(H) {
  const P = __PEN, L3 = __PL;
  // a cerca bloqueia o herói (cópia da grade: o Refúgio do modo infinito não tem cercado)
  H.M = Object.assign({}, H.M, { coll: H.M.coll.slice() });
  const M = H.M, g = M.g;
  for (let y = P.y + 10; y < P.y + P.h - 2; y += g) for (let x = P.x; x < P.x + P.w; x += g) {
    const gx = Math.floor(x / g), gy = Math.floor(y / g), row = M.coll[gy];
    row && gx >= 0 && gx < row.length && (M.coll[gy] = row.slice(0, gx) + "1" + row.slice(gx + 1));
  }
  H.add.image(P.x, P.y, "pet-pen-back").setOrigin(0).setDepth(P.y + 18);
  H.add.image(P.x, P.y, "pet-pen-front").setOrigin(0).setDepth(P.y + P.h - 2);
  // a pedra e o caixote que ficavam nesse gramado saem do caminho (a pedra some, o caixote vai para perto dos bonecos)
  for (const o of H.children.list.slice()) {
    if (o.type !== "Image" || o.texture?.key !== "vh-props") continue;
    const f = o.frame?.name;
    if (f === "rock-s3" && Math.abs(o.x - 80) < 4 && Math.abs(o.y - 520) < 4) o.destroy();
    else if (f === "crate-tall" && Math.abs(o.x - 60) < 4 && Math.abs(o.y - 560) < 4) o.setPosition(282, 562).setDepth(562);
  }
  const spot = { kennel: [P.x + 32, P.y + 64], hay: [P.x + 78, P.y + 96], hay2: [P.x + 40, P.y + 96], bowl: [P.x + 132, P.y + 56], bowl2: [P.x + 148, P.y + 60], water: [P.x + 146, P.y + 96] };
  H.add.image(...spot.kennel, "pet-kennel").setOrigin(.5, 1).setDepth(spot.kennel[1]);
  H.add.image(spot.hay[0], spot.hay[1], "pet-hay").setOrigin(.5, 1).setDepth(spot.hay[1] - 8);
  H.add.image(spot.hay2[0], spot.hay2[1], "pet-hay").setOrigin(.5, 1).setDepth(spot.hay2[1] - 8).setFlipX(!0);
  H.add.image(...spot.bowl, "pet-bowl").setOrigin(.5, 1).setDepth(spot.bowl[1] - 4);
  H.add.image(...spot.bowl2, "pet-bowl").setOrigin(.5, 1).setDepth(spot.bowl2[1] - 4);
  H.add.image(...spot.water, "pet-trough").setOrigin(.5, 1).setDepth(spot.water[1] - 4);
  const lab = H.add.text(P.x + P.w / 2, P.y - 2, L3("CANTO DOS PETS", "PET CORNER", "RINCÓN DE MASCOTAS"), { ...Le, fontSize: "8px", color: "#f0d090", stroke: "#120c08", strokeThickness: 3 }).setOrigin(.5, 1).setScale(.7).setDepth(9100).setAlpha(.9);
  H.labels.push(lab);
  H.inters.push({ area: "out", id: "pets", x: P.x + P.w / 2, y: P.y + P.h + 4, ay: P.y + P.h + 12, r: 46, label: L3("CANTO DOS PETS", "PET CORNER", "RINCÓN DE MASCOTAS"), desc: L3("Treino de Pets: adotar, recrutar e escolher quem vai com você", "Pet Training: adopt, recruit and choose who goes with you", "Entrenamiento: adoptar, reclutar y elegir quién va contigo"), act: () => { H.panel || H.__petShop() } });
  H.__petPenSpot = spot;
  __petPenFill(H);
}
/* os bichos do cercado (refeito quando a loja muda o pet escolhido ou recruta um caído) */
function __petPenFill(H) {
  for (const o of H.__penPets || []) o.destroy();
  H.__penPets = [];
  const P = __PEN, spot = H.__petPenSpot, ps = __petSt(H), act = __petAct(H, ps), own = __petOwned(H, ps);
  const inX = P.x + 14, inY = P.y + 30, inW = P.w - 28, inH = P.h - 38;
  const rnd = (a, b) => a + Math.random() * (b - a);
  own.forEach((id, n) => {
    const D = __PETS[id];
    if (!H.textures.exists(D.tex)) return;
    const K = __petAnims(H.anims, id), fall = !!ps.fall?.[id], out = !fall && id === act;
    const sc = D.sc * .9, hov = D.fly ? 18 : 0;
    let x = out ? P.x + P.w / 2 + 14 : fall ? spot.hay[0] - 8 + n * 7 : rnd(inX, inX + inW), y = out ? P.y + P.h + 10 : fall ? spot.hay[1] - 3 : rnd(inY, inY + inH);
    if (D.fly && !out && !fall) [x, y] = [spot.kennel[0], spot.kennel[1] - 14];          // o corvo pousa no telhado da casinha
    const s = H.add.sprite(x, y, D.tex, 0).setOrigin(.5, 1).setScale(sc).setDepth(y);
    const sh = H.add.ellipse(x, y, D.fly ? 10 : D.fw * sc * .5, 4, 0, .25).setDepth(y - 1);
    K && H.anims.exists(K.idle) && s.play(K.idle);
    s.setFlipX(Math.random() < .5);
    if (fall) { s.setTint(0xb8b0a8); s.anims.timeScale = .4 }
    let mode = "idle", t = rnd(.5, 3), tx = x, ty = y, zt = 0, fly = !1;
    const U = (_t, dms) => {
      if (!s.active) return;
      const sec = Math.min(.06, dms / 1000);
      if (fall) {                                         // caído: dorme no feno, soltando "z"
        zt -= sec;
        if (zt <= 0) { zt = 2.4; const z = H.add.text(s.x + 6, s.y - 18, "z", { ...Le, fontSize: "9px", color: "#e8f0ff", stroke: "#203040", strokeThickness: 2 }).setOrigin(.5).setScale(.6).setDepth(9050); H.tweens.add({ targets: z, y: z.y - 14, x: z.x + 6, alpha: 0, duration: 1800, onComplete: () => z.destroy() }) }
        return;
      }
      if (out) {                                          // o escolhido segue o herói pela vila (de longe, sem atrapalhar)
        const px = H.playerX, py = H.playerY;
        if (px == null || H.area !== "out") return;
        const dx = px - s.x, dy = py - s.y, d = Math.hypot(dx, dy);
        if (d > 260) { s.setPosition(px - 24, py + 4); return }
        if (d > 40) {
          const sp = (d > 110 ? 150 : 90) * sec, nx = s.x + dx / d * sp, ny = s.y + dy / d * sp;
          if (D.fly || H.__free?.(nx, ny) !== !1) s.setPosition(nx, ny); else s.setPosition(s.x + dx / d * sp * .5, s.y);
          s.setFlipX(dx < 0); H.anims.exists(K.walk) && s.anims.currentAnim?.key !== K.walk && s.play(K.walk);
        } else H.anims.exists(K.idle) && s.anims.currentAnim?.key !== K.idle && s.play(K.idle);
        s.setDepth(s.y + (D.fly ? 30 : 0)); sh.setPosition(s.x, s.y + hov).setDepth(s.y - 1);
        return;
      }
      t -= sec;
      if (mode === "idle" && t <= 0) {
        const r = Math.random();
        if (D.fly) { fly = !fly; [tx, ty] = fly ? [rnd(inX, inX + inW), rnd(inY - 6, inY + inH - 10)] : [spot.kennel[0], spot.kennel[1] - 14] }
        else if (r < .3) { mode = "eat"; { const f = [spot.bowl, spot.bowl2, spot.water][(Math.random() * 3) | 0]; [tx, ty] = [f[0] - (f === spot.water ? 14 : 10), f[1] + 2] } }
        else [tx, ty] = [rnd(inX, inX + inW), rnd(inY, inY + inH)];
        mode = mode === "eat" ? "goeat" : "walk";
      }
      if (mode === "walk" || mode === "goeat") {
        const dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy), sp = (D.fly ? 70 : 34) * sec;
        if (d <= sp + .5) {
          s.setPosition(tx, ty);
          if (mode === "goeat") { mode = "eating"; t = rnd(2.5, 4); s.setFlipX(!1); const k = id === "oll" ? K.idle : K.spec; H.anims.exists(k) && s.play(k) }
          else { mode = "idle"; t = rnd(1.5, 4.5); H.anims.exists(K.idle) && s.play(K.idle) }
        } else {
          s.setPosition(s.x + dx / d * sp, s.y + dy / d * sp); Math.abs(dx) > .5 && s.setFlipX(dx < 0);
          H.anims.exists(K.walk) && s.anims.currentAnim?.key !== K.walk && s.play(K.walk);
        }
      } else if (mode === "eating" && t <= 0) { mode = "idle"; t = rnd(1, 3); H.anims.exists(K.idle) && s.play(K.idle) }
      s.setDepth(s.y + (D.fly && fly ? 30 : 0));
      sh.setPosition(s.x, D.fly ? (fly ? s.y + 14 : spot.kennel[1]) : s.y).setDepth(s.y - 1).setVisible(!D.fly || fly);
    };
    H.events.on("update", U);
    H.__penPets.push({ destroy() { H.events.off("update", U); s.destroy(); sh.destroy() } });
  });
  H.events.once("shutdown", () => { for (const o of H.__penPets || []) o.destroy(); H.__penPets = [] });
}
window.__dgPets = { PETS: __PETS, mission: __petMission, st: __petSt, save: __petSave, spawn: __petSpawn, swap: __petSwap, owned: __petOwned, act: __petAct, lv: __petLv, targets: __petTargets, tab: __bkPetTab };
