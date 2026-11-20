/* ══ Manto do Corvo-Lobo — armadura do ferreiro só para o Druida (p216.61) ════════════════════════════════════
   • Aba ARMADURAS da forja (Pedra Cobalto, durabilidade em runs); só aparece para o Druida.
   • Visual: pele de lobo negro como capuz, cachecol ferrugem, manto longo de penas de corvo, túnica de couro verde,
     um corvo no ombro e cajado alto de madeira entalhada (folhas druid-corvo-body/-dirs/-sk/-fish.png, PixelLab:
     build_armaduras_unicas.py corvo e build_pesca_herois.py). As formas de javali e lobisomem não mudam.           */
const __CV_ID = "armor_forge_corvo", __CV_SHEET = "mk4b-druid-corvo";
__FARM[__CV_ID] = {
  name: ["Manto do Corvo-Lobo", "Raven-Wolf Mantle", "Manto del Cuervo-Lobo"], price: 170, cls: "DRUID",
  main: 0x23262e, trim: 0x8a4a2a, glow: 0x9ad8a0, pulse: 0, fx: "none",
  stats: { defense: 7, maxHp: 6, magicDamage: 5 },
  st: ["+7 DEFESA · +6 VIDA · +5 DANO MÁGICO", "+7 DEFENSE · +6 HEALTH · +5 MAGIC DAMAGE"],
  desc: "A pele do lobo que ele não quis matar e as penas do corvo que nunca o abandonou. A mata reconhece quem a veste.",
};
{
  const a = __FARM[__CV_ID];
  Xt[__CV_ID] = { name: a.name[0], type: "armor", slot: "armor", icon: "icon-armor", minRarity: "UNIQUE",
    stats: a.stats, value: a.price * 2, tint: a.main, forgeArmor: __CV_ID, uniqueForge: !0, breaksOnDeath: !0, desc: a.desc + " Quebra-se se morrer na run." };
  try { _s["item." + __CV_ID] = a.name[1]; Io["item." + __CV_ID] = a.name[2] } catch (e) {}
}
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__CV_SHEET) || L.spritesheet(__CV_SHEET, "assets/pixel-art/characters/druid-corvo-body.png", { frameWidth: 128, frameHeight: 128 });
  L.setPath(op) } catch (e) {} return r }}
function __cvSheet(sc) {
  if (!sc.textures.exists(__CV_SHEET)) return null;
  try { sc.textures.get(__CV_SHEET).setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const base = "mk4b-druid-t0-";
  for (const A0 of sc.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(base)) continue;
    const nk = __CV_SHEET + "-" + A0.key.slice(base.length);
    sc.anims.exists(nk) || sc.anims.create({ key: nk, frames: A0.frames.map(f => ({ key: __CV_SHEET, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return __CV_SHEET;
}
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try { if (skin && classId === "DRUID" && eq?.armor?.id === __CV_ID) { const k = __cvSheet(scene); if (k) return { ...skin, sheet: k, __farm: __FARM[__CV_ID] } } } catch (e) {}
  return SK0.apply(this, arguments) }}
