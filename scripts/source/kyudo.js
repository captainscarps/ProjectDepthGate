/* ══ Hakama do Kyūdō — armadura do ferreiro só para o Arqueiro (p216.139) ═════════════════════════════════════
   • Aba ARMADURAS da forja (Pedra Cobalto, durabilidade em runs); só aparece para o Arqueiro.
   • Visual (ideia do Rafael: arqueiro de kyūdō): sem elmo nem armadura — cabelo preto longo num rabo alto, quimono
     azul-marinho com a manga direita tirada (ombro e peito à mostra), hakama plissada verde-floresta, obi verde-sálvia,
     tabi brancas, braçadeiras de couro e um yumi bem alto (folhas archer-kyudo-body/-dirs/-sk/-fish.png; PixelLab:
     scripts/gerar_armadura_kyudo.py → build_armaduras_unicas.py kyudo e build_pesca_herois.py).
   • Pouca proteção, muita precisão: menos defesa que a Lua Rubra, mais dano e crítico.                           */
const __KY_ID = "armor_forge_kyudo", __KY_SHEET = "mk4b-archer-kyudo";
__FARM[__KY_ID] = {
  name: ["Hakama do Kyūdō", "Kyūdō Hakama", "Hakama del Kyūdō"], price: 170, cls: "ARCHER",
  main: 0x2f5a34, trim: 0x1c2233, glow: 0xd8c27a, pulse: 0, fx: "none",
  stats: { defense: 3, maxHp: 3, damage: 6, critChance: 10 },
  st: ["+3 DEFESA · +3 VIDA · +6 DANO · +10% CRÍTICO", "+3 DEFENSE · +3 HEALTH · +6 DAMAGE · +10% CRIT"],
  desc: "Sem armadura, só o quimono e a respiração. O arqueiro do kyūdō não mira o alvo: espera o momento em que a flecha já sabe o caminho.",
};
{
  const a = __FARM[__KY_ID];
  Xt[__KY_ID] = { name: a.name[0], type: "armor", slot: "armor", icon: "icon-armor", minRarity: "UNIQUE",
    stats: a.stats, value: a.price * 2, tint: a.main, forgeArmor: __KY_ID, uniqueForge: !0, breaksOnDeath: !0, desc: a.desc + " Quebra-se se morrer na run." };
  try { _s["item." + __KY_ID] = a.name[1]; Io["item." + __KY_ID] = a.name[2] } catch (e) {}
  try { window.__FORGE_RUNS && (window.__FORGE_RUNS[__KY_ID] = 4) } catch (e) {}
}
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__KY_SHEET) || L.spritesheet(__KY_SHEET, "assets/pixel-art/characters/archer-kyudo-body.png", { frameWidth: 128, frameHeight: 128 });
  L.setPath(op) } catch (e) {} return r }}
function __kySheet(sc) {
  if (!sc.textures.exists(__KY_SHEET)) return null;
  try { sc.textures.get(__KY_SHEET).setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const base = "mk4b-archer-t0-";
  for (const A0 of sc.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(base)) continue;
    const nk = __KY_SHEET + "-" + A0.key.slice(base.length);
    sc.anims.exists(nk) || sc.anims.create({ key: nk, frames: A0.frames.map(f => ({ key: __KY_SHEET, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return __KY_SHEET;
}
{const SK0 = __skinFor; __skinFor = function (scene, skin, classId, eq) {
  try { if (skin && classId === "ARCHER" && eq?.armor?.id === __KY_ID) { const k = __kySheet(scene); if (k) return { ...skin, sheet: k, __farm: __FARM[__KY_ID] } } } catch (e) {}
  return SK0.apply(this, arguments) }}
