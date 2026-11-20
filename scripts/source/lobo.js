/* ══ Manto do Caçador do Norte — armadura do ferreiro só para o Caçador (p216.64) ══════════════════════════════
   • Aba ARMADURAS da forja (Pedra Cobalto, durabilidade em runs); só aparece para o Caçador.
   • Visual: capuz cinza-escuro, barba ruiva, manto de pele de lobo cinza, túnica longa cor de ardósia, cintos de
     couro, capa rasgada, botas de pele, espada na cintura e besta de madeira (folhas hunter-lobo-body/-dirs/-sk/
     -fish.png, PixelLab: build_armaduras_unicas.py lobo e build_pesca_herois.py).                                 */
const __LB_ID = "armor_forge_lobo", __LB_SHEET = "mk4b-hunter-lobo";
__FARM[__LB_ID] = {
  name: ["Manto do Caçador do Norte", "Northern Hunter's Mantle", "Manto del Cazador del Norte"], price: 170, cls: "HUNTER",
  main: 0x4a5560, trim: 0x8a8a8a, glow: 0xd0e0ff, pulse: 0, fx: "none",
  stats: { defense: 7, maxHp: 5, damage: 3, critChance: 4 },
  st: ["+7 DEFESA · +5 VIDA · +3 DANO · +4% CRÍTICO", "+7 DEFENSE · +5 HEALTH · +3 DAMAGE · +4% CRIT"],
  desc: "Pele do lobo-cinzento que caçou a matilha inteira, lã grossa contra a neve e uma besta que nunca erra duas vezes.",
};
{
  const a = __FARM[__LB_ID];
  Xt[__LB_ID] = { name: a.name[0], type: "armor", slot: "armor", icon: "icon-armor", minRarity: "UNIQUE",
    stats: a.stats, value: a.price * 2, tint: a.main, forgeArmor: __LB_ID, uniqueForge: !0, breaksOnDeath: !0, desc: a.desc + " Quebra-se se morrer na run." };
  try { _s["item." + __LB_ID] = a.name[1]; Io["item." + __LB_ID] = a.name[2] } catch (e) {}
}
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__LB_SHEET) || L.spritesheet(__LB_SHEET, "assets/pixel-art/characters/hunter-lobo-body.png", { frameWidth: 128, frameHeight: 128 });
  L.setPath(op) } catch (e) {} return r }}
function __lbSheet(sc) {
  if (!sc.textures.exists(__LB_SHEET)) return null;
  try { sc.textures.get(__LB_SHEET).setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const base = "mk4b-hunter-t0-";
  for (const A0 of sc.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(base)) continue;
    const nk = __LB_SHEET + "-" + A0.key.slice(base.length);
    sc.anims.exists(nk) || sc.anims.create({ key: nk, frames: A0.frames.map(f => ({ key: __LB_SHEET, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return __LB_SHEET;
}
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try { if (skin && classId === "HUNTER" && eq?.armor?.id === __LB_ID) { const k = __lbSheet(scene); if (k) return { ...skin, sheet: k, __farm: __FARM[__LB_ID] } } } catch (e) {}
  return SK0.apply(this, arguments) }}
