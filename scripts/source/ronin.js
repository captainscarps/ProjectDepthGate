/* ══ Armadura do Ronin — armadura do ferreiro só para o Samurai (p216.60) ═════════════════════════════════════
   • Aba ARMADURAS da forja (Pedra Cobalto, durabilidade em runs); só aparece para o Samurai.
   • Visual: ronin sem elmo — coque preto, bigode e cavanhaque, faixa marrom sobre um olho com pontas soltas, manto
     de pele nos ombros, armadura lamelar vermelho-escura gasta, cinto de corda branca, caneleiras listradas e
     sandálias de palha; katana na cintura (folhas berserker-ronin-body/-dirs/-sk/-fish.png, PixelLab:
     build_armaduras_unicas.py ronin e build_pesca_herois.py).                                                     */
const __RN_ID = "armor_forge_ronin", __RN_SHEET = "mk4b-berserker-ronin";
__FARM[__RN_ID] = {
  name: ["Armadura do Ronin", "Ronin Armor", "Armadura del Ronin"], price: 160, cls: "BERSERKER",
  main: 0x7a2a22, trim: 0x3a2a20, glow: 0xffb070, pulse: 0, fx: "none",
  stats: { defense: 7, maxHp: 5, damage: 3, critChance: 5 },
  st: ["+7 DEFESA · +5 VIDA · +3 DANO · +5% CRÍTICO", "+7 DEFENSE · +5 HEALTH · +3 DAMAGE · +5% CRIT"],
  desc: "Laca vermelha rachada por cem batalhas, pele de lobo nos ombros e uma faixa sobre o olho que perdeu. Um samurai sem senhor não tem a quem obedecer — só à própria lâmina.",
};
{
  const a = __FARM[__RN_ID];
  Xt[__RN_ID] = { name: a.name[0], type: "armor", slot: "armor", icon: "icon-armor", minRarity: "UNIQUE",
    stats: a.stats, value: a.price * 2, tint: a.main, forgeArmor: __RN_ID, uniqueForge: !0, breaksOnDeath: !0, desc: a.desc + " Quebra-se se morrer na run." };
  try { _s["item." + __RN_ID] = a.name[1]; Io["item." + __RN_ID] = a.name[2] } catch (e) {}
}
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__RN_SHEET) || L.spritesheet(__RN_SHEET, "assets/pixel-art/characters/berserker-ronin-body.png", { frameWidth: 128, frameHeight: 128 });
  L.setPath(op) } catch (e) {} return r }}
function __rnSheet(sc) {
  if (!sc.textures.exists(__RN_SHEET)) return null;
  try { sc.textures.get(__RN_SHEET).setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const base = "mk4b-berserker-t0-";
  for (const A0 of sc.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(base)) continue;
    const nk = __RN_SHEET + "-" + A0.key.slice(base.length);
    sc.anims.exists(nk) || sc.anims.create({ key: nk, frames: A0.frames.map(f => ({ key: __RN_SHEET, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return __RN_SHEET;
}
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try { if (skin && classId === "BERSERKER" && eq?.armor?.id === __RN_ID) { const k = __rnSheet(scene); if (k) return { ...skin, sheet: k, __farm: __FARM[__RN_ID] } } } catch (e) {}
  return SK0.apply(this, arguments) }}
