/* ══ Vestes do Saqueador — armadura do ferreiro só para o Guerreiro (p216.23) ══════════════════════════════════
   • Aba ARMADURAS da forja (Pedra Cobalto, durabilidade em runs); só aparece para o Guerreiro.
   • Visual: viking — cabelo loiro, barba trançada, couro com tachas, gola de pele, escudo redondo de madeira com
     raios vermelhos (folha warrior-saqueador-body.png, feita por scripts/build_guerreiro_saqueador.py).        */
const __SQ_ID = "armor_forge_saqueador", __SQ_SHEET = "mk4b-warrior-saqueador";
__FARM[__SQ_ID] = {
  name: ["Vestes do Saqueador", "Raider's Garb", "Atuendo del Saqueador"], price: 170, cls: "WARRIOR",
  main: 0x8a5c38, trim: 0xa82a22, glow: 0xffc070, pulse: 0, fx: "none",
  stats: { defense: 10, maxHp: 6, damage: 4 },
  st: ["+10 DEFESA · +6 VIDA · +4 DANO", "+10 DEFENSE · +6 HEALTH · +4 DAMAGE"],
  desc: "Couro grosso cravejado de ferro, pele de urso nos ombros e um escudo de tábuas pintado de vermelho. Roupa de quem atravessou o mar frio para saquear.",
};
{
  const a = __FARM[__SQ_ID];
  Xt[__SQ_ID] = { name: a.name[0], type: "armor", slot: "armor", icon: "icon-armor", minRarity: "UNIQUE",
    stats: a.stats, value: a.price * 2, tint: a.main, forgeArmor: __SQ_ID, uniqueForge: !0, breaksOnDeath: !0, desc: a.desc + " Quebra-se se morrer na run." };
  try { _s["item." + __SQ_ID] = a.name[1]; Io["item." + __SQ_ID] = a.name[2] } catch (e) {}
}
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__SQ_SHEET) || L.spritesheet(__SQ_SHEET, "assets/pixel-art/characters/warrior-saqueador-body.png", { frameWidth: 128, frameHeight: 128 });
  L.setPath(op) } catch (e) {} return r }}
function __sqSheet(sc) {
  if (!sc.textures.exists(__SQ_SHEET)) return null;
  try { sc.textures.get(__SQ_SHEET).setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const base = "mk4b-warrior-t0-";
  for (const A0 of sc.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(base)) continue;
    const nk = __SQ_SHEET + "-" + A0.key.slice(base.length);
    sc.anims.exists(nk) || sc.anims.create({ key: nk, frames: A0.frames.map(f => ({ key: __SQ_SHEET, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return __SQ_SHEET;
}
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try { if (skin && classId === "WARRIOR" && eq?.armor?.id === __SQ_ID) { const k = __sqSheet(scene); if (k) return { ...skin, sheet: k, __farm: __FARM[__SQ_ID] } } } catch (e) {}
  return SK0.apply(this, arguments) }}
