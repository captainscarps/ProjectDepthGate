/* ══ Armadura do Oni — armadura do ferreiro só para o Samurai (p216.59) ════════════════════════════════════════
   • Aba ARMADURAS da forja (Pedra Cobalto, durabilidade em runs); só aparece para o Samurai.
   • Visual: elmo-máscara de oni prateado com chifres dourados e olhos verdes, peitoral e ombreiras de prata gravada
     com dourado, mangas vermelho-escuras, saiote de placas preto e dourado, caneleiras de prata, sandálias de palha;
     katana na cintura (folhas berserker-oni-body/-dirs/-sk/-fish.png, PixelLab: build_armaduras_unicas.py oni e
     build_pesca_herois.py).                                                                                        */
const __ON_ID = "armor_forge_oni", __ON_SHEET = "mk4b-berserker-oni";
__FARM[__ON_ID] = {
  name: ["Armadura do Oni", "Oni Armor", "Armadura del Oni"], price: 180, cls: "BERSERKER",
  main: 0xc8ccd4, trim: 0xd6a851, glow: 0x7dff9a, pulse: 0, fx: "none",
  stats: { defense: 10, maxHp: 6, damage: 4 },
  st: ["+10 DEFESA · +6 VIDA · +4 DANO", "+10 DEFENSE · +6 HEALTH · +4 DAMAGE"],
  desc: "Prata gravada e laca negra, sob a máscara de um demônio de olhos verdes. Dizem que quem a veste não sente mais medo — só fome de batalha.",
};
{
  const a = __FARM[__ON_ID];
  Xt[__ON_ID] = { name: a.name[0], type: "armor", slot: "armor", icon: "icon-armor", minRarity: "UNIQUE",
    stats: a.stats, value: a.price * 2, tint: a.main, forgeArmor: __ON_ID, uniqueForge: !0, breaksOnDeath: !0, desc: a.desc + " Quebra-se se morrer na run." };
  try { _s["item." + __ON_ID] = a.name[1]; Io["item." + __ON_ID] = a.name[2] } catch (e) {}
}
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__ON_SHEET) || L.spritesheet(__ON_SHEET, "assets/pixel-art/characters/berserker-oni-body.png", { frameWidth: 128, frameHeight: 128 });
  L.setPath(op) } catch (e) {} return r }}
function __onSheet(sc) {
  if (!sc.textures.exists(__ON_SHEET)) return null;
  try { sc.textures.get(__ON_SHEET).setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const base = "mk4b-berserker-t0-";
  for (const A0 of sc.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(base)) continue;
    const nk = __ON_SHEET + "-" + A0.key.slice(base.length);
    sc.anims.exists(nk) || sc.anims.create({ key: nk, frames: A0.frames.map(f => ({ key: __ON_SHEET, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return __ON_SHEET;
}
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try { if (skin && classId === "BERSERKER" && eq?.armor?.id === __ON_ID) { const k = __onSheet(scene); if (k) return { ...skin, sheet: k, __farm: __FARM[__ON_ID] } } } catch (e) {}
  return SK0.apply(this, arguments) }}
