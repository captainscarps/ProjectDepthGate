/* ══ Vestes do Vendaval — armadura do ferreiro só para a Maga (p216.21) ═══════════════════════════════════════
   • Aba ARMADURAS da forja (Pedra Cobalto, durabilidade em runs); só aparece para a Maga.
   • Visual: sem capuz — cabelo azul-petróleo com trança, manto e vestido carmesim com bordado dourado que pulsa
     (folha mage-vendaval-body.png, feita por scripts/build_maga_vendaval.py).
   • Defesa mágica em dobro: projéteis e magias (dano que vem de longe) entram pela metade.
   • Defesa física pela metade: golpes de inimigos colados entram em dobro.
   • Aura de vento: rajadas giram em volta da heroína, com poeira e folhas levadas pelo vento.               */
const __VD_ID = "armor_forge_vendaval", __VD_SHEET = "mk4b-mage-vendaval", __VD_MAG = .5, __VD_PHYS = 2;
__FARM[__VD_ID] = {
  name: ["Vestes do Vendaval", "Gale Vestments", "Vestiduras del Vendaval"], price: 170, cls: "MAGE",
  main: 0x8c1c28, trim: 0xd6a851, glow: 0xffd27a, pulse: .7, fx: "none",
  stats: { maxHp: 4, magicDamage: 6, speed: 10 },
  st: ["AURA DE VENTO · 2× DEFESA MÁGICA · ½ DEFESA FÍSICA · +6 DANO MÁGICO", "WIND AURA · 2× MAGIC DEFENSE · ½ PHYSICAL DEFENSE · +6 MAGIC DMG"],
  desc: "Seda carmesim bordada com fios que prendem o vento. A magia se desfaz no redemoinho em volta de quem a veste, mas o tecido não para lâmina nenhuma.",
};
{
  const a = __FARM[__VD_ID];
  Xt[__VD_ID] = { name: a.name[0], type: "armor", slot: "armor", icon: Xt.ancient_dragon_armor ? "icon-dragon-armor" : "icon-armor", minRarity: "UNIQUE",
    stats: a.stats, value: a.price * 2, tint: a.main, forgeArmor: __VD_ID, uniqueForge: !0, breaksOnDeath: !0, desc: a.desc + " Quebra-se se morrer na run." };
  try { _s["item." + __VD_ID] = a.name[1]; Io["item." + __VD_ID] = a.name[2] } catch (e) {}
}

{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__VD_SHEET) || L.spritesheet(__VD_SHEET, "assets/pixel-art/characters/mage-vendaval-body.png", { frameWidth: 128, frameHeight: 128 });
  this.textures.exists(__VD_SHEET + "-glow") || L.spritesheet(__VD_SHEET + "-glow", "assets/pixel-art/characters/mage-vendaval-glow.png", { frameWidth: 128, frameHeight: 128 });
  L.setPath(op) } catch (e) {} return r }}

function __vdSheet(sc) {
  if (!sc.textures.exists(__VD_SHEET)) return null;
  try { sc.textures.get(__VD_SHEET).setFilter(j.Textures.FilterMode.NEAREST); sc.textures.get(__VD_SHEET + "-glow")?.setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const base = "mk4b-mage-t0-";
  for (const A0 of sc.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(base)) continue;
    const nk = __VD_SHEET + "-" + A0.key.slice(base.length);
    sc.anims.exists(nk) || sc.anims.create({ key: nk, frames: A0.frames.map(f => ({ key: __VD_SHEET, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return __VD_SHEET;
}
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try { if (skin && classId === "MAGE" && eq?.armor?.id === __VD_ID) { const k = __vdSheet(scene); if (k) return { ...skin, sheet: k, __farm: __FARM[__VD_ID] } } } catch (e) {}
  return SK0.apply(this, arguments) }}

/* aura de vento */
function __vdTex(S) {
  if (S.textures.exists("vd-gust")) return;
  const t = S.textures.createCanvas("vd-gust", 28, 12), g = t.getContext();
  for (const [w, a] of [[2.2, .35], [1, .9]]) {               // arco de vento: grosso e fraco por fora, fino e claro no meio
    g.strokeStyle = `rgba(235,248,255,${a})`; g.lineWidth = w; g.lineCap = "round";
    g.beginPath(); g.moveTo(2, 9); g.quadraticCurveTo(14, -1, 26, 7); g.stroke();
  }
  g.strokeStyle = "rgba(200,235,255,.6)"; g.lineWidth = .8; g.beginPath(); g.moveTo(16, 4); g.quadraticCurveTo(22, 1, 25, 3); g.stroke();
  t.refresh();
  const d = S.textures.createCanvas("vd-mote", 3, 3), q = d.getContext(); q.fillStyle = "rgba(230,240,250,.9)"; q.fillRect(1, 0, 1, 3); q.fillRect(0, 1, 3, 1); d.refresh();
}
function __vdTick(S, dt) {
  const p = S.player, on = !!p && !p.dead && p.active && S.inventory?.equipment?.armor?.id === __VD_ID;
  let W = S.__vd;
  if (!on) { if (W) { W.on = !1; for (const g of W.g) g.setVisible(!1) } return }
  if (!W) {
    __vdTex(S);
    W = S.__vd = { on: !0, t: 0, g: [], dust: 0 };
    for (let k = 0; k < 7; k++) W.g.push(S.add.image(0, 0, "vd-gust").setBlendMode(j.BlendModes.ADD).setData("k", k));
  }
  W.on = !0; W.t += dt;
  const T = W.t / 1000, cy = p.y + 3;
  for (const g of W.g) {
    const k = g.getData("k"), sp = 2.4 + (k % 3) * .6, R = 15 + (k % 3) * 5, a = T * sp + k * .9, s = Math.sin(a);
    const fade = .5 + .5 * Math.max(0, Math.sin(T * 3.1 + k * 1.7));                 // as rajadas vêm e vão
    g.setVisible(!0).setPosition(p.x + Math.cos(a) * R, cy + s * (5 + k % 2 * 3) - (k % 3) * 7)
      .setRotation(a + Math.PI / 2).setScale(.55 + (k % 3) * .12, .55).setAlpha(fade * (s > 0 ? 1 : .55))
      .setDepth((p.depth ?? p.y) + (s > 0 ? 2 : -2));
  }
  if ((W.dust -= dt) <= 0) {                                                            // poeira e folhas levadas em espiral
    W.dust = 110;
    const a0 = Math.random() * Math.PI * 2, R0 = 22, leaf = Math.random() < .25 && S.textures.exists("fx2-shard");
    const m = S.add.image(p.x + Math.cos(a0) * R0, cy + Math.sin(a0) * 7, leaf ? "fx2-shard" : "vd-mote").setDepth((p.depth ?? p.y) + 1).setAlpha(.8);
    leaf ? m.setScale(.3).setTint(Math.random() < .5 ? 0x8fbf5a : 0xd8c070) : m.setScale(.8);
    const o = { a: a0, r: R0 };
    S.tweens.add({ targets: o, a: a0 + 4.5, r: 8, duration: 900, onUpdate: () => { if (!m.active) return; m.setPosition(S.player.x + Math.cos(o.a) * o.r, S.player.y + 2 + Math.sin(o.a) * o.r * .35 - (o.a - a0) * 3).setRotation(o.a * 2) },
      onComplete: () => m.destroy() });
    S.tweens.add({ targets: m, alpha: 0, delay: 500, duration: 400 });
  }
}
/* físico = golpe de inimigo colado; mágico = o que vem de longe (projéteis, magias) */
{const A0 = Uh.prototype.apply; Uh.prototype.apply = function (o) {
  const S = this.scene;
  if (!o || o.target !== S?.player || !S.__vd?.on) return A0.apply(this, arguments);
  const src = o.source, P = S.player;
  S.__vdPhys = !!src && src !== P && Math.hypot(src.x - P.x, src.y - P.y) < 64;
  try { return A0.apply(this, arguments) } finally { S.__vdPhys = null }
}}
{const T0 = oh.prototype.takeDamage; oh.prototype.takeDamage = function (i, t) {
  const S = this.scene;
  if (!S?.__vd?.on || this !== S.player || this.dead || this.invuln > 0 || this.__shieldT > 0) return T0.apply(this, arguments);
  let phys = S.__vdPhys;
  if (phys == null) {
    phys = !!this.__contactHit;
    if (!phys) for (const e of S.enemies?.getChildren?.() ?? []) if (e.active && !e.dead && Math.hypot(e.x - this.x, e.y - this.y) < 40) { phys = !0; break }
  }
  if (!phys) S.effects?.burstTinted?.(this.x, this.y - 8, 0xdff4ff, 5);               // a magia se desfaz no vento
  return T0.call(this, i * (phys ? __VD_PHYS : __VD_MAG), t);
}}
{const C0 = Sd.prototype.create; Sd.prototype.create = function () { const r = C0.apply(this, arguments); try {
  const S = this; S.__vd = null;
  const fn = (_, dt) => { try { __vdTick(S, dt || 16) } catch (e) {} };
  S.events.on("postupdate", fn); S.events.once("shutdown", () => { S.events.off("postupdate", fn); S.__vd = null });
} catch (e) {} return r }}
window.__vendaval = { id: __VD_ID };
