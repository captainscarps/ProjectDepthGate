/* ══ Configurações: VOLTAR e ✕ dentro da página de papel ══
   Os dois botões ficavam colados no canto da tela (x = largura−14), em cima da moldura da página; em tela cheia
   (ex.: Edge 1080p) o VOLTAR aparecia cortado pela moldura/borda. Agora ficam dentro da área útil do papel, e a
   dica de teclas sobe junto. Vale para a tela de configurações do menu e da pausa (mesma classe). */
{
  const B0 = Vn.prototype.build;
  Vn.prototype.build = function () {
    const r = B0.apply(this, arguments);
    try {
      const R = this.root, bk = R?.__bk, m = bk ? 30 : 16;
      const right = (bk ? bk.x + bk.w : _) - m, bottom = (bk ? bk.y + bk.h : st) - (bk ? 22 : 12), top = (bk ? bk.y : 0) + (bk ? 22 : 12);
      for (const o of R?.list ?? []) {
        if (o.type !== "Text") continue;
        if (o.text === "✕") o.setPosition(right, top);
        else if (/VOLTAR|BACK|VOLVER/.test(o.text) && o.originY === 1) o.setPosition(right, bottom);
      }
      this.navHint?.setY(bottom - 2);
    } catch (e) {}
    return r;
  };
}
