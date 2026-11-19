/* ══ Heróis em alta (p216.26) ══════════════════════════════════════════════════════════════════════════════
   A Araí e o Druida novos (feitos com IA) ocupam ~100 px do quadro de 128 em vez de ~68, e o pacote usa uma
   escala menor para que fiquem do mesmo tamanho no jogo (mais nítidos). Com o sprite preso pelo meio, a escala
   menor subia o pé ~11 px: aqui o pé volta para a mesma altura dos outros heróis ("baseScale" no json = escala
   antiga). As formas do Druida (javali e lobisomem) e as Vestes do Vendaval da Maga continuam na escala antiga.                   */
const __HD_OLD = /-(javali|lobisomem)$/;   // p216.41: Vendaval, Ossário, Saqueador e Caçador de Dragão refeitos na arte nova      // folhas desenhadas sobre a arte antiga (formas do Druida, Vendaval, Caçador de Dragão, Saqueador)
/* deslocamento do pé que este módulo aplica depois do update (a capa, calculada no meio do update, precisa somar) */
function __hdOff(V) {
  const L = V?.mk2Layout, m = V?.mk2; if (!L?.baseScale || !m || __HD_OLD.test(V.animPrefix || "")) return 0;
  return ((L.footY ?? L.frameH - 1) - L.frameH / 2) * (L.baseScale - V.mk2Scale);
}
{const U0 = Qe.prototype.update; Qe.prototype.update = function () {
  const m = this.mk2, L = this.mk2Layout;
  if (!m || !L?.baseScale) return U0.apply(this, arguments);
  m.y -= this.__hdY || 0; this.__hdY = 0;
  try { return U0.apply(this, arguments) } finally {
    try {
      const old = __HD_OLD.test(this.animPrefix || ""), sc = old ? L.baseScale : this.mk2Scale;
      if (Math.abs(m.scaleX - sc) > 1e-3) m.setScale(sc);
      const fy = (L.footY ?? L.frameH - 1) - L.frameH / 2;
      this.__hdY = old ? 0 : fy * (L.baseScale - sc);
      m.y += this.__hdY;
    } catch (e) {}
  }
}}
