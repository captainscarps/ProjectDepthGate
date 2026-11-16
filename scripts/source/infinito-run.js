/* ══ Modo Infinito: herói com run em andamento continua DENTRO da run ══
   Ao carregar o herói no menu, ele só aparece no Refúgio se estiver lá de fato (acabou de morrer: a morte grava
   atRefuge no save, e o primeiro salvamento dentro da run apaga essa marca) ou se nunca desceu (prof. 1, 0 pts).
   Com run em andamento, entra direto na profundidade em que estava. */
window.__endInRun = function (d) {
  try {
    if (!d?.run || !d?.player || d.atRefuge) return !1;
    return !((d.run.depth ?? 1) <= 1 && !(d.run.score > 0));
  } catch (e) { return !1 }
};
