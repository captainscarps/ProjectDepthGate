/* ═══ HUD de toque: PAUSA e INVENTÁRIO sem ficar em cima dos botões ═══
   As duas pílulas ficavam fixas no meio de baixo da tela; em telas mais estreitas (ou com o tamanho dos botões em
   "grande") o ESCUDO e as poções da direita chegavam em cima do PAUSA. Agora elas ficam no vão livre entre o
   joystick e o grupo de botões; se o vão não couber as duas, sobem para o alto da tela, no meio. */
{
  const A9 = Hd.prototype.applyLayout;
  Hd.prototype.applyLayout = function () {
    const r = A9.apply(this, arguments);
    try {
      const St = this.startBtn?.text, Se = this.selectBtn?.text;
      if (!this.built || !St || !Se) return r;
      const left = this.settings?.leftyMode === !0, o = this.insets || { left: 0, right: 0, top: 0, bottom: 0 };
      const i = Gd[this.settings?.touchSize ?? "medium"] ?? 1;
      const btns = [this.attackBtn, this.dashBtn, ...(this.abilityBtns || []), this.interactBtn, this.guardBtn, this.potionBtn, this.pot2Btn].filter(Boolean);
      const pos = (b) => { const p = b.parts?.find((q) => q.x != null) || b; return [p.x, p.y, (b.r ?? b.radius ?? 22 * i)] };
      // borda do grupo de botões que fica do lado das pílulas (com folga para o nome embaixo de cada botão)
      let edge = left ? 0 : _;
      for (const b of btns) { const [x, , rr] = pos(b); const pad = Math.max(rr, 30) + 8; edge = left ? Math.max(edge, x + pad) : Math.min(edge, x - pad) }
      const J = this.joystick, jx = J?.homeX ?? J?.base?.x ?? (left ? _ - 84 * i : 84 * i), jr = 42 * i + 14;
      const a = left ? edge : jx + jr, b = left ? jx - jr : edge;
      const wS = St.displayWidth, wE = Se.displayWidth, gap = 12, need = wS + wE + gap;
      const bottom = st - 16 - (o.bottom || 0);
      if (b - a >= need + 8) {
        const cx = (a + b) / 2;
        this.selectBtn.setPosition(Math.round(cx - need / 2 + wE / 2), bottom);
        this.startBtn.setPosition(Math.round(cx + need / 2 - wS / 2), bottom);
      } else {
        const top = 16 + (o.top || 0);
        this.selectBtn.setPosition(Math.round(_ / 2 - need / 2 + wE / 2), top);
        this.startBtn.setPosition(Math.round(_ / 2 + need / 2 - wS / 2), top);
      }
      typeof __joyExcl === "function" && __joyExcl(this);   // a área do joystick não engole o toque nas pílulas
    } catch (e) {}
    return r;
  };
}
