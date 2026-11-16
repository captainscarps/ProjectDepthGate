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

/* ══ Refúgio: no MELHORIAS do ferreiro (e nos outros painéis de lista) o item escolhido ganha um contorno dourado ══
   A cor de destaque do item era trocada pelo papel do livro e ninguém via qual estava escolhido no controle. */
{
  const R0 = Fl.prototype.refreshPanel;
  Fl.prototype.refreshPanel = function () {
    const r = R0.apply(this, arguments);
    try {
      const P = this.panel, rows = this.panelRows, row = rows?.[this.panelSel]?.row;
      if (!P?.active || !row?.active) { this.__prHl?.destroy(); this.__prHl = null; return r }
      if (!this.__prHl?.active || this.__prHl.parentContainer !== P) { this.__prHl?.destroy(); this.__prHl = this.add.graphics(); P.add(this.__prHl) }
      P.bringToTop(this.__prHl);
      const w = row.displayWidth || row.width, h = row.displayHeight || row.height, x = row.x - w * (row.originX ?? .5), y = row.y - h * (row.originY ?? .5);
      this.__prHl.clear().lineStyle(2, 16765514, 1).strokeRoundedRect(x - 3, y - 3, w + 6, h + 6, 4);
    } catch (e) {}
    return r;
  };
}
