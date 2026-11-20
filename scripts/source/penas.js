/* ══ Vestes da Pena Sagrada — armadura do ferreiro só para a Araí (p216.53) ════════════════════════════════════
   • Aba ARMADURAS da forja (Pedra Cobalto, durabilidade em runs); só aparece para a Araí (Xamã).
   • Visual: grande cocar de penas brancas e marrons, cabelo solto, colar de osso, top e tanga de camurça com
     franjas, braçadeiras de contas, perneiras com pele (folhas shaman-penas-body/-dirs/-sk/-fish.png, feitas com
     PixelLab por scripts/build_armaduras_unicas.py penas e scripts/build_pesca_herois.py).                        */
const __PN_ID = "armor_forge_penas", __PN_SHEET = "mk4b-shaman-penas";
__FARM[__PN_ID] = {
  name: ["Vestes da Pena Sagrada", "Sacred Feather Garb", "Atuendo de la Pluma Sagrada"], price: 170, cls: "SHAMAN",
  main: 0xe8d8b0, trim: 0x8a5a30, glow: 0xfff0c0, pulse: 0, fx: "none",
  stats: { defense: 8, maxHp: 6, damage: 4 },
  st: ["+8 DEFESA · +6 VIDA · +4 DANO", "+8 DEFENSE · +6 HEALTH · +4 DAMAGE"],
  desc: "Cocar de penas de gavião-real, camurça com franjas e colar de ossos dos ancestrais. Quem o veste fala com os espíritos da mata.",
};
{
  const a = __FARM[__PN_ID];
  Xt[__PN_ID] = { name: a.name[0], type: "armor", slot: "armor", icon: "icon-armor", minRarity: "UNIQUE",
    stats: a.stats, value: a.price * 2, tint: a.main, forgeArmor: __PN_ID, uniqueForge: !0, breaksOnDeath: !0, desc: a.desc + " Quebra-se se morrer na run." };
  try { _s["item." + __PN_ID] = a.name[1]; Io["item." + __PN_ID] = a.name[2] } catch (e) {}
}
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__PN_SHEET) || L.spritesheet(__PN_SHEET, "assets/pixel-art/characters/shaman-penas-body.png", { frameWidth: 128, frameHeight: 128 });
  L.setPath(op) } catch (e) {} return r }}
function __pnSheet(sc) {
  if (!sc.textures.exists(__PN_SHEET)) return null;
  try { sc.textures.get(__PN_SHEET).setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const base = "mk4b-shaman-t0-";
  for (const A0 of sc.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(base)) continue;
    const nk = __PN_SHEET + "-" + A0.key.slice(base.length);
    sc.anims.exists(nk) || sc.anims.create({ key: nk, frames: A0.frames.map(f => ({ key: __PN_SHEET, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return __PN_SHEET;
}
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try { if (skin && classId === "SHAMAN" && eq?.armor?.id === __PN_ID) { const k = __pnSheet(scene); if (k) return { ...skin, sheet: k, __farm: __FARM[__PN_ID] } } } catch (e) {}
  return SK0.apply(this, arguments) }}
