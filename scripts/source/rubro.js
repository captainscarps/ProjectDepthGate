/* ══ Armadura da Lua Rubra — armadura do ferreiro só para o Arqueiro (p216.66) ═════════════════════════════════
   • Aba ARMADURAS da forja (Pedra Cobalto, durabilidade em runs); só aparece para o Arqueiro.
   • Visual (arte de referência do Rafael: samurai arqueiro diante da lua vermelha): ō-yoroi laqueada de vermelho
     com amarração preta e acabamento dourado, kabuto preto com chifres longos curvos, máscara de oni vermelha com
     presas, ombreiras vermelhas em camadas, mangas pretas, caneleiras vermelhas, arco yumi dourado e aljava com
     flechas de penas vermelhas (folhas archer-rubro-body/-dirs/-sk/-fish.png, PixelLab: transfer-outfit-v2 para
     a pose base e as direções, animate-pixminimax para as animações; build_armaduras_unicas.py rubro e
     build_pesca_herois.py).                                                                                       */
const __RB_ID = "armor_forge_rubro", __RB_SHEET = "mk4b-archer-rubro";
__FARM[__RB_ID] = {
  name: ["Armadura da Lua Rubra", "Crimson Moon Armor", "Armadura de la Luna Carmesí"], price: 180, cls: "ARCHER",
  main: 0xb3202a, trim: 0xd6a851, glow: 0xff5a4a, pulse: 0, fx: "none",
  stats: { defense: 8, maxHp: 5, damage: 4, critChance: 5 },
  st: ["+8 DEFESA · +5 VIDA · +4 DANO · +5% CRÍTICO", "+8 DEFENSE · +5 HEALTH · +4 DAMAGE · +5% CRIT"],
  desc: "Laca vermelha como a lua das noites de guerra e a máscara de um oni que sorri para o alvo. Dizem que suas flechas só voam quando a lua sangra.",
};
{
  const a = __FARM[__RB_ID];
  Xt[__RB_ID] = { name: a.name[0], type: "armor", slot: "armor", icon: "icon-armor", minRarity: "UNIQUE",
    stats: a.stats, value: a.price * 2, tint: a.main, forgeArmor: __RB_ID, uniqueForge: !0, breaksOnDeath: !0, desc: a.desc + " Quebra-se se morrer na run." };
  try { _s["item." + __RB_ID] = a.name[1]; Io["item." + __RB_ID] = a.name[2] } catch (e) {}
  try { window.__FORGE_RUNS && (window.__FORGE_RUNS[__RB_ID] = 4) } catch (e) {}
}
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__RB_SHEET) || L.spritesheet(__RB_SHEET, "assets/pixel-art/characters/archer-rubro-body.png", { frameWidth: 128, frameHeight: 128 });
  L.setPath(op) } catch (e) {} return r }}
function __rbSheet(sc) {
  if (!sc.textures.exists(__RB_SHEET)) return null;
  try { sc.textures.get(__RB_SHEET).setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const base = "mk4b-archer-t0-";
  for (const A0 of sc.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(base)) continue;
    const nk = __RB_SHEET + "-" + A0.key.slice(base.length);
    sc.anims.exists(nk) || sc.anims.create({ key: nk, frames: A0.frames.map(f => ({ key: __RB_SHEET, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return __RB_SHEET;
}
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try { if (skin && classId === "ARCHER" && eq?.armor?.id === __RB_ID) { const k = __rbSheet(scene); if (k) return { ...skin, sheet: k, __farm: __FARM[__RB_ID] } } } catch (e) {}
  return SK0.apply(this, arguments) }}
