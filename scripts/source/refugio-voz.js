/* ══ Refúgio: cada fala dublada toca uma vez só ══
   Conversar de novo com o mesmo NPC mostra o texto, mas a voz não se repete (vale para todo o Refúgio — Olivia,
   ferreiro, taverna, heróis, curtidor… — porque todos tocam a voz por window.__dub). A lista vale até recarregar o
   jogo; fora do Refúgio (história, cenas) nada muda. */
{
  const D0 = window.__dub;
  if (typeof D0 === "function" && !D0.__once) {
    const said = new Set();
    const W2 = function (t) {
      try {
        const H = window.__DED_GAME?.scene?.getScene("Hub");
        if (H?.sys?.isActive?.() && t) { const k = String(t).trim(); if (said.has(k)) return !1; said.add(k) }
      } catch (e) {}
      return D0.apply(this, arguments);
    };
    W2.__once = 1; window.__dub = W2;
  }
}
