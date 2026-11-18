/* ══ Vestes do Ossário — armadura do ferreiro só para o Necromante (p216.20) ═════════════════════════════════
   • Vendida na aba ARMADURAS da forja (Pedra Cobalto, durabilidade em runs, como as outras); só aparece para o
     Necromante.
   • Visual: o Necromante vira um esqueleto de capuz roxo (folha necromancer-ossos-body.png, feita por
     scripts/build_necro_ossos.py); olhos e gema pulsam em roxo.
   • Corrente de Ossos: 6 ossos presos numa corrente giram em volta do herói. Cada golpe físico (inimigo colado no
     herói) quebra um osso e não causa dano; um osso volta a cada 3 s.
   • Sem defesa mágica: projéteis e magias (dano que vem de longe) entram 50% mais fortes.                     */
const __OS_ID = "armor_forge_ossos", __OS_SHEET = "mk4b-necromancer-ossos", __OS_N = 6, __OS_REGEN = 3000, __OS_MAGIC = 1.5;
__FARM[__OS_ID] = {
  name: ["Vestes do Ossário", "Ossuary Vestments", "Vestiduras del Osario"], price: 170, cls: "NECROMANCER",
  main: 0x4a3278, trim: 0xd6a851, glow: 0xb46cff, pulse: .9, fx: "none",
  stats: { maxHp: 6, magicDamage: 5 },
  st: ["CORRENTE DE OSSOS · +6 VIDA · +5 DANO MÁGICO · SEM DEFESA MÁGICA", "BONE CHAIN · +6 HEALTH · +5 MAGIC DMG · NO MAGIC DEFENSE"],
  desc: "Mortalha costurada com ossos do Ossário. Uma corrente de ossos gira em volta de quem a veste e para golpes físicos, mas a magia atravessa sem resistência.",
};
{
  const a = __FARM[__OS_ID];
  Xt[__OS_ID] = { name: a.name[0], type: "armor", slot: "armor", icon: Xt.ancient_dragon_armor ? "icon-dragon-armor" : "icon-armor", minRarity: "UNIQUE",
    stats: a.stats, value: a.price * 2, tint: a.main, forgeArmor: __OS_ID, uniqueForge: !0, breaksOnDeath: !0, desc: a.desc + " Quebra-se se morrer na run." };
  try { _s["item." + __OS_ID] = a.name[1]; Io["item." + __OS_ID] = a.name[2] } catch (e) {}
}
/* a loja só mostra as Vestes do Ossário para o Necromante */
try {
  Object.defineProperty(window, "__FARM", { configurable: !0, get() {
    let cls = "";
    try { const g = window.__DED_GAME; cls = g?.scene?.getScene?.("Hub")?.classDef?.id || g?.registry?.get?.("hub:classId") || "" } catch (e) {}
    const o = {};
    for (const [k, v] of Object.entries(__FARM)) if (!v.cls || v.cls === cls) o[k] = v;
    return o;
  } });
} catch (e) {}

/* arte */
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__OS_SHEET) || L.spritesheet(__OS_SHEET, "assets/pixel-art/characters/necromancer-ossos-body.png", { frameWidth: 128, frameHeight: 128 });
  this.textures.exists(__OS_SHEET + "-glow") || L.spritesheet(__OS_SHEET + "-glow", "assets/pixel-art/characters/necromancer-ossos-glow.png", { frameWidth: 128, frameHeight: 128 });
  L.setPath(op) } catch (e) {} return r }}

function __osSheet(sc) {
  if (!sc.textures.exists(__OS_SHEET)) return null;
  try { sc.textures.get(__OS_SHEET).setFilter(j.Textures.FilterMode.NEAREST); sc.textures.get(__OS_SHEET + "-glow")?.setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const base = "mk4b-necromancer-t0-";
  for (const A0 of sc.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(base)) continue;
    const nk = __OS_SHEET + "-" + A0.key.slice(base.length);
    sc.anims.exists(nk) || sc.anims.create({ key: nk, frames: A0.frames.map(f => ({ key: __OS_SHEET, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return __OS_SHEET;
}
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try { if (skin && classId === "NECROMANCER" && eq?.armor?.id === __OS_ID) { const k = __osSheet(scene); if (k) return { ...skin, sheet: k, __farm: __FARM[__OS_ID] } } } catch (e) {}
  return SK0.apply(this, arguments) }}

/* corrente de ossos */
function __osTex(S) {
  if (S.textures.exists("os-bone")) return;
  const mk = (k, w, h, fn) => { const t = S.textures.createCanvas(k, w, h), g = t.getContext(); fn(g); t.refresh(); t.setFilter(j.Textures.FilterMode.NEAREST) };
  mk("os-bone", 11, 5, (g) => {
    g.fillStyle = "#1e1418"; g.fillRect(1, 0, 3, 5); g.fillRect(7, 0, 3, 5); g.fillRect(0, 1, 11, 3);
    g.fillStyle = "#e8e0c8"; g.fillRect(2, 1, 1, 3); g.fillRect(8, 1, 1, 3); g.fillRect(1, 2, 9, 1);
    g.fillStyle = "#b8ae96"; g.fillRect(3, 3, 5, 1);
    g.fillStyle = "#fffaf0"; g.fillRect(4, 2, 3, 1);
  });
  mk("os-link", 3, 3, (g) => { g.fillStyle = "#5a4a6e"; g.fillRect(0, 0, 3, 3); g.fillStyle = "#a890c8"; g.fillRect(1, 0, 1, 1); g.clearRect(1, 1, 1, 1) });
}
function __osTick(S, dt) {
  const p = S.player, on = !!p && !p.dead && p.active && S.inventory?.equipment?.armor?.id === __OS_ID;
  let O = S.__os;
  if (!on) { if (O) { O.on = !1; for (const s of O.spr) s.setVisible(!1) } return }
  if (!O) {
    __osTex(S);
    O = S.__os = { on: !0, have: __OS_N, regen: 0, t: 0, spr: [] };
    for (let k = 0; k < __OS_N; k++) O.spr.push(S.add.image(0, 0, "os-bone").setScale(.6));
    for (let k = 0; k < __OS_N * 2; k++) O.spr.push(S.add.image(0, 0, "os-link").setScale(.6));
  }
  O.on = !0;
  O.t += dt;
  if (O.have < __OS_N && (O.regen += dt) >= __OS_REGEN) {
    O.regen = 0; O.have++;
    S.effects?.burstTinted?.(p.x, p.y - 8, 0xe8e0c8, 5);
  }
  const R = 13, cy = p.y + 1, base = O.t / 1000 * 1.7;
  for (let k = 0; k < __OS_N; k++) {
    const a = base + k / __OS_N * Math.PI * 2, s = Math.sin(a), b = O.spr[k];
    b.setVisible(k < O.have).setPosition(p.x + Math.cos(a) * R, cy + s * 6).setRotation(a + Math.PI / 2 + Math.sin(O.t / 160 + k) * .3)
      .setDepth((p.depth ?? p.y) + (s > 0 ? 2 : -2)).setScale(.6 * (s > 0 ? 1 : .85)).setAlpha(s > 0 ? 1 : .8);
    for (let q = 1; q <= 2; q++) {                       // elos da corrente até o próximo osso
      const a2 = a + q / 3 * (Math.PI * 2 / __OS_N), s2 = Math.sin(a2), l = O.spr[__OS_N + k * 2 + q - 1];
      l.setVisible(k < O.have || (k + 1) % __OS_N < O.have).setPosition(p.x + Math.cos(a2) * R, cy + s2 * 6).setDepth((p.depth ?? p.y) + (s2 > 0 ? 2 : -2)).setAlpha(s2 > 0 ? .95 : .6);
    }
  }
}
function __osBreak(S, p) {
  const O = S.__os; O.have--; O.regen = 0;
  const a = O.t / 1000 * 1.7, x = p.x + Math.cos(a) * 13, y = p.y + 1;
  for (let k = 0; k < 5; k++) {                          // estilhaços de osso
    const f = S.add.image(x, y, "os-bone").setScale(.35).setDepth((p.depth ?? p.y) + 3).setRotation(Math.random() * 6);
    S.tweens.add({ targets: f, x: x + (Math.random() - .5) * 40, y: y + 6 + Math.random() * 14, rotation: f.rotation + 4, alpha: 0, duration: 420, ease: "Quad.easeOut", onComplete: () => f.destroy() });
  }
  S.effects?.floatText?.(p.x, p.y - 26, __L3("OSSO!", "BONE!", "¡HUESO!"), "#e8e0c8", 9);
  S.audioRef?.play?.("sfx-shield-block");
  S.cameraSys?.shake?.(.003, 80);
}
/* golpe físico = vem de um inimigo colado no herói; o resto (projéteis, magias de longe) é mágico */
{const A0 = Uh.prototype.apply; Uh.prototype.apply = function (o) {
  const S = this.scene;
  if (!o || o.target !== S?.player || !S.__os?.on) return A0.apply(this, arguments);
  const src = o.source, P = S.player;
  S.__osPhys = !!src && src !== P && !src.isProjectile && Math.hypot(src.x - P.x, src.y - P.y) < 64;
  try { return A0.apply(this, arguments) } finally { S.__osPhys = null }
}}
{const T0 = oh.prototype.takeDamage; oh.prototype.takeDamage = function (i, t) {
  const S = this.scene, O = S?.__os;
  if (!O?.on || this !== S.player || this.dead || this.invuln > 0 || this.__shieldT > 0) return T0.apply(this, arguments);
  let phys = S.__osPhys;
  if (phys == null) {                                    // dano que não passou pelo sistema de dano: olha quem está colado
    phys = !!this.__contactHit;
    if (!phys) for (const e of S.enemies?.getChildren?.() ?? []) if (e.active && !e.dead && Math.hypot(e.x - this.x, e.y - this.y) < 40) { phys = !0; break }
  }
  if (phys && O.have > 0) { __osBreak(S, this); this.invuln = Math.max(this.invuln, .3); this.__contactHit = !1; return !1 }
  if (!phys) i *= __OS_MAGIC;
  return T0.call(this, i, t);
}}
{const C0 = Sd.prototype.create; Sd.prototype.create = function () { const r = C0.apply(this, arguments); try {
  const S = this; S.__os = null;
  const fn = (_, dt) => { try { __osTick(S, dt || 16) } catch (e) {} };
  S.events.on("postupdate", fn); S.events.once("shutdown", () => { S.events.off("postupdate", fn); S.__os = null });
} catch (e) {} return r }}
window.__ossario = { id: __OS_ID, give: (S) => { const L = S.lootSystem, p = S.player; L.spawnItem(p.x, p.y + 30, L.makeItem(__OS_ID, "UNIQUE")) } };
