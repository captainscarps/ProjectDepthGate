/* ══ Formas do Druida: o ataque é do animal (p216.63) ═══════════════════════════════════════════════════════════
   Transformado (javali, lobisomem, urso…), o golpe básico do Druida ainda usava a arma equipada: com cajado ele
   soltava a magia (projétil). Agora, em qualquer forma, o golpe é corpo a corpo — mordida/garra — com alcance um
   pouco maior que o soco, som de golpe e o mesmo dano (com os bônus da forma).                                      */
oe.__fera = { ...oe.unarmed, anim: { windupMs: 90, hitMs: 70, recoveryMs: 110 }, sound: "sfx-sword-swing", effect: "flash", delivery: "melee" };
oa.__fera = { range: 54, angle: 150 };
{const G0 = dh.prototype.getWeaponKey; dh.prototype.getWeaponKey = function () {
  try { if (this.scene?.__form) return "__fera" } catch (e) {}
  return G0.apply(this, arguments) }}
/* ── Urso Pardo (p216.63): a "Forma de Urso" da árvore de talentos (ET_BEAR) usava o desenho do javali; agora o
   Druida vira um urso-pardo grande de pé (folhas druid-urso-body/-dirs/-sk.png, PixelLab: build_armaduras_unicas.py
   urso; fontes scripts/art-src/armaduras/urso-*). Fica 15% maior que o herói; a capa das armaduras some na forma. */
const __DF_URSO = "mk4b-druid-urso", __DF_BIG = { [__DF_URSO]: 1.15 };
{const P0 = bo.prototype.preload; bo.prototype.preload = function () { const r = P0.apply(this, arguments); try { const L = this.load, op = L.path; L.setPath("");
  this.textures.exists(__DF_URSO) || L.spritesheet(__DF_URSO, "assets/pixel-art/characters/druid-urso-body.png", { frameWidth: 128, frameHeight: 128 });
  L.setPath(op) } catch (e) {} return r }}
function __dfSheet(sc, key) {
  if (!sc.textures.exists(key)) return null;
  try { sc.textures.get(key).setFilter(j.Textures.FilterMode.NEAREST) } catch (e) {}
  const base = "mk4b-druid-t0-";
  for (const A0 of sc.anims.anims?.getArray?.() ?? []) {
    if (!A0.key.startsWith(base)) continue;
    const nk = key + "-" + A0.key.slice(base.length);
    sc.anims.exists(nk) || sc.anims.create({ key: nk, frames: A0.frames.map(f => ({ key, frame: f.frame.name })), frameRate: A0.frameRate, repeat: A0.repeat });
  }
  return key;
}
{const SH = Yh.prototype.execShapeshift; Yh.prototype.execShapeshift = function (i) {
  const r = SH.apply(this, arguments);
  try {
    const S = this.scene, V = S.playerVisual;
    if (V && (i?.id === "ET_BEAR" || i?.form === "urso")) { const k = __dfSheet(S, __DF_URSO); k && V.setSkin?.({ sheet: k }) }
    const big = __DF_BIG[V?.animPrefix];
    if (V && big && !V.__dfBig) { V.__dfBig = V.mk2Scale; V.mk2Scale *= big }
    const E0 = S.__endForm;
    if (E0 && !E0.__df) { S.__endForm = function () { try { if (V?.__dfBig) { V.mk2Scale = V.__dfBig; V.__dfBig = 0 } } catch (e) {} return E0.apply(this, arguments) }; S.__endForm.__df = 1 }
  } catch (e) {}
  return r }}
/* capa das armaduras raras/lendárias: não aparece em nenhuma forma animal */
{const C0 = __capeUpdate; __capeUpdate = function (V) { if (V?.scene?.__form) { V.__cape?.g?.setVisible(!1); return } return C0.apply(this, arguments) }}
