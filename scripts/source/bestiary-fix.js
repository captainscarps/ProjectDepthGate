/* Bestiário: correções (scripts/patch_bestiary_fix.py) */
try{window.__bestiaryOpenG=__bestiaryOpen}catch(e){}
{
  const P = __BookScene.prototype;
  // registros sem nome travavam a virada de página (run(...).toUpperCase de undefined)
  const R0 = P.render;
  P.render = function () {
    for (const e of this.E || []) if (e?.d && !e.d.name) {
      const pretty = String(e.k || "?").toLowerCase().split("_").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
      let n = null; try { n = St(`enemy.${e.k}`, null) } catch (_) {}
      e.d = { ...e.d, name: n || pretty };
    }
    return R0.apply(this, arguments);
  };
  // texto mais arejado: mais espaço entre linhas e letra um pouco maior nos parágrafos
  const T0 = P.T;
  P.T = function (c, x, y, s, size = 9, color, o = {}) {
    const multi = !!o.ww || /\n/.test(String(s ?? ""));
    const q = { ...o, ls: (o.ls ?? 2) + (multi ? 3 : 1) };
    if (multi && size < 9.5) size += .5;
    return T0.call(this, c, x, y, s ?? "", size, color, q);
  };
}
{
  // índice: com muitos nomes, duas colunas por página e linhas legíveis (antes as linhas se sobrepunham)
  const P = __BookScene.prototype, I0 = P.pageIndex;
  P.pageIndex = function (c, X, PW, a, b, head) {
    const n = b - a;
    if (n <= 16) return I0.apply(this, arguments);
    let y = 44;
    if (head) { this.T(c, X + PW / 2, y, head, 11, __BK_RED, { ox: .5, st: "bold" }); this.orn(c, X + PW / 2, y + 20, 50); }
    y += 32;
    const rows = Math.ceil(n / 2), step = Math.min(17, (306 - y) / rows), CW = (PW - 6) / 2;
    for (let i = a; i < b; i++) {
      const j = i - a, col = Math.floor(j / rows), yy = Math.round(y + (j % rows) * step);
      const e = this.E[i], num = e.boss ? i - this.nC + 1 : i + 1;
      let name = `${String(num).padStart(2, "0")} ${e.d.name}`;
      const sel = (this.spread === 1 || this.spread === 2) && i === this.sel;
      const x0 = X + col * (CW + 6);
      const t = this.T(c, x0 + 4, yy, name, 8, __BK_INK, { st: sel ? "bold" : "normal" });
      while (t.width > CW - 22 && name.length > 6) { name = name.slice(0, -2); t.setText(name + "…") }
      const p = this.T(c, x0 + CW - 2, yy, String(2 * (this.FRONT + i) + 1), 8, __BK_FAINT, { ox: 1 });
      sel && (() => { const g = this.add.graphics(); g.fillStyle(7999252, .14).fillRect(x0, yy - 2, CW, 12); c.add(g); c.sendToBack(g) })();
      const z = this.add.zone(x0 + CW / 2, yy + 5, CW, Math.max(11, step)).setInteractive({ useHandCursor: !0 });
      z.on("pointerdown", () => this.go(this.FRONT + i)); z.on("pointerover", () => t.setColor(__BK_RED)); z.on("pointerout", () => t.setColor(__BK_INK));
      c.add(z);
    }
  };
}
{
  // tabelas auxiliares que não são criaturas (ex.: "anims") não entram no livro
  const B0 = __bkEntries;
  __bkEntries = function () { return B0().filter(e => e.boss || (e.d && typeof e.d === "object" && e.d.maxHp && e.d.texture)) };
}
