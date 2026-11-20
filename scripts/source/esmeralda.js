/* ══ Sedas de Esmeralda — armadura do ferreiro só para a Ladina (p216.57) ══════════════════════════════════════
   • Aba ARMADURAS da forja (Pedra Cobalto, durabilidade em runs); só aparece para a Ladina.
   • Visual: dançarina-assassina — cabelo preto longo, diadema dourado, corpete preto e dourado, mangas e saia longa
     de seda verde-esmeralda com correntes douradas, perneiras pretas e douradas; mantém as duas adagas curvas
     (folhas rogue-esmeralda-body/-dirs/-sk/-fish.png, PixelLab: build_armaduras_unicas.py esmeralda e
     build_pesca_herois.py).                                                                                       */
const __EM_ID = "armor_forge_esmeralda", __EM_SHEET = "mk4b-rogue-esmeralda";
__FARM[__EM_ID] = {
  name: ["Sedas de Esmeralda", "Emerald Silks", "Sedas de Esmeralda"], price: 170, cls: "ROGUE",
  main: 0x1f8a5a, trim: 0xd6a851, glow: 0xa8ffd0, pulse: 0, fx: "none",
  stats: { defense: 6, maxHp: 4, critChance: 6 },
  st: ["+6 DEFESA · +4 VIDA · +6% CRÍTICO", "+6 DEFENSE · +4 HEALTH · +6% CRIT"],
  desc: "Seda verde de dançarina sobre um corpete de filigrana dourada. Os inimigos olham para o tecido — e nunca para as adagas.",
};
{
  const a = __FARM[__EM_ID];
  Xt[__EM_ID] = { name: a.name[0], type: "armor", slot: "armor", icon: "icon-armor", minRarity: "UNIQUE",
    stats: a.stats, value: a.price * 2, tint: a.main, forgeArmor: __EM_ID, uniqueForge: !0, breaksOnDeath: !0, desc: a.desc + " Quebra-se se morrer na run." };
  try { _s["item." + __EM_ID] = a.name[1]; Io["item." + __EM_ID] = a.name[2] } catch (e) {}
}
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__EM_SHEET) || L.spritesheet(__EM_SHEET, "assets/pixel-art/characters/rogue-esmeralda-body.png", { frameWidth: 128, frameHeight: 128 });
  L.setPath(op) } catch (e) {} return r }}
function __emSheet(sc) {
  if (!sc.textures.exists(__EM_SHEET)) return null;
  try { sc.textures.get(__EM_SHEET).setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const base = "mk4b-rogue-t0-";
  for (const A0 of sc.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(base)) continue;
    const nk = __EM_SHEET + "-" + A0.key.slice(base.length);
    sc.anims.exists(nk) || sc.anims.create({ key: nk, frames: A0.frames.map(f => ({ key: __EM_SHEET, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return __EM_SHEET;
}
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try { if (skin && classId === "ROGUE" && eq?.armor?.id === __EM_ID) { const k = __emSheet(scene); if (k) return { ...skin, sheet: k, __farm: __FARM[__EM_ID] } } } catch (e) {}
  return SK0.apply(this, arguments) }}
