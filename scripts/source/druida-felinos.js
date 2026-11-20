/* ══ Druida: Forma de Tigre Branco e Forma de Pantera Negra (p216.67) ══════════════════════════════════════════
   Duas habilidades NOVAS de transformação (não substituem Javali, Lobisomem nem Urso). Entram como mais uma opção
   na escolha de habilidade por nível: Pantera Negra no nível 5 (ao lado de Lobisomem, Raízes e Anel de Carvalho) e
   Tigre Branco no nível 10 (ao lado de Águia, Saraivada de Espinhos e Visco).
   Os bônus extras (dano / crítico) duram enquanto a forma durar (saem junto com as outras marcas __form).
   • Tigre Branco: 6 s · +60% de dano e +20% de velocidade · golpes de garra (corpo a corpo, como as outras formas).
   • Pantera Negra: 6 s · +45% de velocidade, 30% de esquiva e +25% de crítico.
   Arte (PixelLab): o Druida vira o ANIMAL de verdade, de quatro patas (p216.68; antes ficava de pé como o Urso) —
   parado, andar, correr (galope), bote com a pata, rugido (habilidades), dano, morte e andar/correr nas quatro
   direções; folhas
   druid-tigre-* e druid-pantera-* (build_armaduras_unicas.py tigre / pantera; fontes scripts/art-src/armaduras/
   tigre-* e pantera-*). Ícones próprios: assets/pixel-art/ui/icons/TIGRE_FORM.png e PANTERA_FORM.png (ix-<ID>). */
const __DFL = {
  TIGRE_FORM: { form: "tigre", sheet: "mk4b-druid-tigre", big: 1, tint: 0xd8ecff,
    pt: ["Forma de Tigre Branco", "Vira tigre-branco por 6s: +60% de dano e +20% de velocidade, com garras. Recarrega 10s depois de voltar."],
    en: ["White Tiger Form", "Become a white tiger for 6s: +60% damage and +20% speed, with claws. Recharges 10s after returning."],
    es: ["Forma de Tigre Blanco", "Te conviertes en tigre blanco durante 6s: +60% de daño y +20% de velocidad, con garras. Recarga 10s después de volver."],
    def: { cost: 25, cooldown: 16, duration: 6, speedMult: 1.2, damageMult: 1, dmgUp: .6 } },
  PANTERA_FORM: { form: "pantera", sheet: "mk4b-druid-pantera", big: 1, tint: 0x6a4aa8,
    pt: ["Forma de Pantera Negra", "Vira pantera-negra por 6s: +45% de velocidade, 30% de chance de esquivar e +25% de crítico. Recarrega 10s depois de voltar."],
    en: ["Black Panther Form", "Become a black panther for 6s: +45% speed, 30% dodge chance and +25% crit. Recharges 10s after returning."],
    es: ["Forma de Pantera Negra", "Te conviertes en pantera negra durante 6s: +45% de velocidad, 30% de esquiva y +25% de crítico. Recarga 10s después de volver."],
    def: { cost: 25, cooldown: 16, duration: 6, speedMult: 1.45, dodge: .3, damageMult: 1, critUp: 25 } },
};
for (const [id, F] of Object.entries(__DFL)) {
  Ye[id] = { id, name: F.pt[0], desc: F.pt[1], icon: "icon-lobisomem-form", type: "shapeshift", form: F.form, damageType: "physical",
    tint: F.tint, sound: "sfx-warrior-iron-skin", ...F.def };
  try { _s[`abn.${id}`] = F.en[0]; _s[`abd.${id}`] = F.en[1]; Io[`abn.${id}`] = F.es[0]; Io[`abd.${id}`] = F.es[1] } catch (e) {}
}
/* opções novas na escolha por nível do Druida (campanha e Infinito) */
try { const D = Ps.DRUID; D[5].includes("PANTERA_FORM") || D[5].push("PANTERA_FORM"); D[10].includes("TIGRE_FORM") || D[10].push("TIGRE_FORM") } catch (e) {}
/* efeito da troca de forma igual ao das outras formas */
try { __SKH_FX.DRUID.TIGRE_FORM = __SKH_FX.DRUID.PANTERA_FORM = ["d-shift", "c", 0, .7, 0, -14] } catch (e) {}
/* folhas de perfil (direções e golpes vêm da lista __HA_UNI de herois-armaduras.js) e ícones */
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  for (const [id, F] of Object.entries(__DFL)) {
    this.textures.exists(F.sheet) || L.spritesheet(F.sheet, `assets/pixel-art/characters/druid-${F.form}-body.png`, { frameWidth: 128, frameHeight: 128 });
    this.textures.exists("ix-" + id) || L.image("ix-" + id, `assets/pixel-art/ui/icons/${id}.png`);
  }
  L.setPath(op);
  L.once("complete", () => { for (const id of Object.keys(__DFL)) this.textures.exists("ix-" + id) && (Ye[id].icon = "ix-" + id) });
} catch (e) {} return r }}
{const SH = Yh.prototype.execShapeshift; Yh.prototype.execShapeshift = function (i) {
  const F = Object.values(__DFL).find(f => f.form === i?.form);
  const r = SH.apply(this, arguments);
  if (!F) return r;
  try {
    const S = this.scene, V = S.playerVisual, St0 = S.stats, tot = St0.total, mk = () => { St0.buffs[St0.buffs.length - 1].__form = !0 };
    // a garrada é corpo a corpo (dano físico) e as habilidades do Druida usam o mágico: o bônus vale para os dois
    if (i.dmgUp) for (const k of ["damage", "magicDamage"]) { St0.addBuff(k, Math.max(1, Math.round((tot[k] ?? 1) * i.dmgUp)), 9999); mk() }
    if (i.critUp) { St0.addBuff("critChance", i.critUp, 9999); mk() }
    St0.recompute?.();
    const k = __dfSheet(S, F.sheet); k && V?.setSkin?.({ sheet: k });
    if (V && !V.__dfBig) { V.__dfBig = V.mk2Scale; V.mk2Scale *= F.big }
    const E0 = S.__endForm;
    if (E0 && !E0.__df) { S.__endForm = function () { try { if (V?.__dfBig) { V.mk2Scale = V.__dfBig; V.__dfBig = 0 } } catch (e) {} return E0.apply(this, arguments) }; S.__endForm.__df = 1 }
    S.effects?.burstTinted?.(S.player.x, S.player.y - 12, F.tint, 18);
  } catch (e) { console.warn("[felinos]", e) }
  return r }}
