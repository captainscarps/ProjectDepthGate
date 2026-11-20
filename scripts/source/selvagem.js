/* ══ Pintura de Guerra Selvagem — armadura do ferreiro só para o Druida (p216.62) ══════════════════════════════
   • Aba ARMADURAS da forja (Pedra Cobalto, durabilidade em runs); só aparece para o Druida.
   • Visual: druida selvagem — cabelo preto longo com pequenos chifres, rosto pintado de branco com faixa preta nos
     olhos, peito nu com pintura de guerra, manto de couro cru com símbolo tribal, faixa verde, saiote de tiras com
     presas, botas de pele e cajado com folhas no topo (folhas druid-selvagem-body/-dirs/-sk/-fish.png, PixelLab:
     build_armaduras_unicas.py selvagem e build_pesca_herois.py). As formas de javali e lobisomem não mudam.       */
const __SV_ID = "armor_forge_selvagem", __SV_SHEET = "mk4b-druid-selvagem";
__FARM[__SV_ID] = {
  name: ["Pintura de Guerra Selvagem", "Wild Warpaint", "Pintura de Guerra Salvaje"], price: 160, cls: "DRUID",
  main: 0xb08a5a, trim: 0x2f5a34, glow: 0xf0f0e0, pulse: 0, fx: "none",
  stats: { defense: 5, maxHp: 8, damage: 3, magicDamage: 3 },
  st: ["+5 DEFESA · +8 VIDA · +3 DANO · +3 DANO MÁGICO", "+5 DEFENSE · +8 HEALTH · +3 DAMAGE · +3 MAGIC DAMAGE"],
  desc: "Couro cru, presas de fera e a pintura branca dos que caçam com os lobos. Na mata, não há diferença entre o druida e a matilha.",
};
{
  const a = __FARM[__SV_ID];
  Xt[__SV_ID] = { name: a.name[0], type: "armor", slot: "armor", icon: "icon-armor", minRarity: "UNIQUE",
    stats: a.stats, value: a.price * 2, tint: a.main, forgeArmor: __SV_ID, uniqueForge: !0, breaksOnDeath: !0, desc: a.desc + " Quebra-se se morrer na run." };
  try { _s["item." + __SV_ID] = a.name[1]; Io["item." + __SV_ID] = a.name[2] } catch (e) {}
}
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__SV_SHEET) || L.spritesheet(__SV_SHEET, "assets/pixel-art/characters/druid-selvagem-body.png", { frameWidth: 128, frameHeight: 128 });
  L.setPath(op) } catch (e) {} return r }}
function __svSheet(sc) {
  if (!sc.textures.exists(__SV_SHEET)) return null;
  try { sc.textures.get(__SV_SHEET).setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const base = "mk4b-druid-t0-";
  for (const A0 of sc.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(base)) continue;
    const nk = __SV_SHEET + "-" + A0.key.slice(base.length);
    sc.anims.exists(nk) || sc.anims.create({ key: nk, frames: A0.frames.map(f => ({ key: __SV_SHEET, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return __SV_SHEET;
}
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try { if (skin && classId === "DRUID" && eq?.armor?.id === __SV_ID) { const k = __svSheet(scene); if (k) return { ...skin, sheet: k, __farm: __FARM[__SV_ID] } } } catch (e) {}
  return SK0.apply(this, arguments) }}
