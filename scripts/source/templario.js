/* ══ Armadura do Templário — lendária do Guerreiro (p216.52) ═════════════════════════════════════════════════════
   • Visual: cruzado de capuz de couro, barba escura, cota de malha, manto de couro com borda dourada, túnica branca
     com a cruz vermelha, escudo alto de madeira (folhas warrior-templario-body/-dirs/-sk/-fish.png, feitas com
     PixelLab por scripts/build_armaduras_unicas.py e scripts/build_pesca_herois.py; fontes em scripts/art-src).
   • Duas formas de conseguir:
     1) FERREIRO — aba ARMADURAS da forja (Pedra Cobalto, durabilidade em runs), só para o Guerreiro.
     2) DROP — quando cai uma armadura (couraça) LENDÁRIA ou RELÍQUIA para o Guerreiro, 1 em 4 vezes ela vem como
        "Armadura do Templário" (mesma raridade).
   • Com qualquer uma das duas vestida, o Guerreiro usa a arte do Templário (andar, correr, golpes, pesca).        */
const __TP_FORGE = "armor_forge_templario", __TP_DROP = "armor_templario", __TP_SHEET = "mk4b-warrior-templario";
const __TP_NAME = ["Armadura do Templário", "Templar Armor", "Armadura del Templario"];
const __TP_DESC = "Cota de malha sob a túnica branca da cruz vermelha, manto de couro com bordas douradas e o capuz de quem jurou não voltar atrás.";
__FARM[__TP_FORGE] = {
  name: __TP_NAME, price: 220, cls: "WARRIOR",
  main: 0xe8e0cc, trim: 0xb02a24, glow: 0xffe0a0, pulse: 0, fx: "none",
  stats: { defense: 12, maxHp: 8, blockChance: 4 },
  st: ["+12 DEFESA · +8 VIDA · +4% BLOQUEIO", "+12 DEFENSE · +8 HEALTH · +4% BLOCK"],
  desc: __TP_DESC,
};
{
  const a = __FARM[__TP_FORGE];
  Xt[__TP_FORGE] = { name: a.name[0], type: "armor", slot: "armor", icon: "icon-armor", minRarity: "LEGENDARY",
    stats: a.stats, value: a.price * 2, tint: a.main, forgeArmor: __TP_FORGE, uniqueForge: !0, breaksOnDeath: !0, desc: __TP_DESC + " Quebra-se se morrer na run." };
  Xt[__TP_DROP] = { name: __TP_NAME[0], type: "armor", slot: "armor", icon: "icon-armor", minRarity: "LEGENDARY", classRequirement: "WARRIOR",
    stats: { defense: 9, maxHp: 5, blockChance: 2 }, value: 150, tint: 0xe8e0cc, bossOnly: !0, desc: __TP_DESC };
  try { for (const id of [__TP_FORGE, __TP_DROP]) { _s["item." + id] = __TP_NAME[1]; Io["item." + id] = __TP_NAME[2] } } catch (e) {}
}
/* drop: couraça lendária (ou relíquia) do Guerreiro vira, às vezes, a do Templário */
{const M0 = Bh.prototype.makeItem; Bh.prototype.makeItem = function (i, t, sd) {
  const it = M0.apply(this, arguments);
  try {
    if (it && i !== __TP_DROP && it.slot === "armor" && (it.rarity === "LEGENDARY" || it.rarity === "RELIC") && !Xt[i]?.setId && !Xt[i]?.uniqueForge && !Xt[i]?.bossOnly
      && this.scene?.classDef?.id === "WARRIOR" && Math.random() < .25) return M0.call(this, __TP_DROP, it.rarity, sd);
  } catch (e) {}
  return it }}
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__TP_SHEET) || L.spritesheet(__TP_SHEET, "assets/pixel-art/characters/warrior-templario-body.png", { frameWidth: 128, frameHeight: 128 });
  L.setPath(op) } catch (e) {} return r }}
function __tpSheet(sc) {
  if (!sc.textures.exists(__TP_SHEET)) return null;
  try { sc.textures.get(__TP_SHEET).setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const base = "mk4b-warrior-t0-";
  for (const A0 of sc.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(base)) continue;
    const nk = __TP_SHEET + "-" + A0.key.slice(base.length);
    sc.anims.exists(nk) || sc.anims.create({ key: nk, frames: A0.frames.map(f => ({ key: __TP_SHEET, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return __TP_SHEET;
}
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try { const id = eq?.armor?.id; if (skin && classId === "WARRIOR" && (id === __TP_FORGE || id === __TP_DROP)) { const k = __tpSheet(scene); if (k) return { ...skin, sheet: k, __farm: __FARM[__TP_FORGE] } } } catch (e) {}
  return SK0.apply(this, arguments) }}
