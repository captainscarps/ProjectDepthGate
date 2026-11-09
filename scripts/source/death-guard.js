/* ═══ Morte sem travar ═══
   1) ao morrer, o que estiver aberto (história da fase, inventário, habilidades, loja, evento, escolha de
      habilidade, diário) sai da frente da tela de derrota — antes a história da fase podia abrir por cima dela;
   2) história nova não abre com o herói morto;
   3) vigia: herói morto e nenhuma tela de derrota/recorde depois de alguns segundos → mostra a derrota de novo e,
      se ainda assim nada aparecer, volta (Refúgio no infinito, escolha de herói na campanha). O jogo nunca fica parado. */
{
  const clearUi = U => {
    try {
      if (U.storyPanel?.visible) { try { __dubStop(); } catch (e) {} U.tweens.killTweensOf(U.storyPanel); U.storyPanel.setVisible(!1); }
      U.inventoryUI?.open && U.inventoryUI.close();
      U.skillTree?.open && U.skillTree.close();
      U.shopUI?.open && U.shopUI.close();
      U.eventPanel?.visible && U.eventPanel.setVisible(!1);
      for (const v of Object.values(U)) if (v && v.constructor?.name === "__SPPanel" && v.open) try { v.close(); } catch (e) {}
      if (U.__qDia) try { U.__qDia.destroy(); U.__qDia = null; } catch (e) {}
    } catch (e) {}
  };
  const go0 = Vd.prototype.onGameOver;
  Vd.prototype.onGameOver = function () {
    clearUi(this);
    return go0.apply(this, arguments);
  };
  const st0 = Vd.prototype.onStoryShow;
  Vd.prototype.onStoryShow = function () {
    const G = this.scene.get("Game");
    if (G?.player?.dead || (G?.state && G.state !== "playing")) return;
    return st0.apply(this, arguments);
  };
  const up0 = Sd.prototype.update;
  Sd.prototype.update = function (t, dt) {
    const r = up0.apply(this, arguments);
    try {
      if (this.player?.dead && this.state === "gameover" && !this.player2) {
        this.__deadT = (this.__deadT || 0) + (typeof dt === "number" ? dt : 16);
        const U = this.scene.get("UI"), shown = !U || U.result?.isVisible?.() || U.nameEntry || U.pauseMenu?.open || U.settingsPanel?.open;
        if (shown) this.__deadT = Math.min(this.__deadT, 1);
        else if (this.__deadT > 7000 && !this.__deadKick) {
          this.__deadKick = 1;
          clearUi(U);
          this.game.registry.get("mode") === "endless" ? this.onRestart() : U.onGameOver?.();
        } else if (this.__deadT > 14000 && this.__deadKick === 1) {
          this.__deadKick = 2;
          this.onRestart();
        }
      } else if (this.player?.dead && (this.state === "rift_defeat" || this.state === "dorf_defeat")) {
        // Fenda / Cavernas Dorf: a volta ao Refúgio tem que acontecer; se não aconteceu, força
        this.__deadT = (this.__deadT || 0) + (typeof dt === "number" ? dt : 16);
        if (this.__deadT > 6500 && !this.__deadKick) {
          this.__deadKick = 1;
          const U = this.scene.get("UI");
          clearUi(U);
          if (U?.__dlgOpen) { U.__dlgR?.setVisible?.(!1); U.__dlgOpen = !1; }
          this.uiOpen = !1;
          this.transitioning = !1;
          if (this.state === "rift_defeat") __goLevel(this, "forest", { hubReturn: !0 });
          else typeof __dorfReturnToRefuge === "function" ? __dorfReturnToRefuge(this) : this.onRestart();
        }
      } else if (this.__deadT) this.__deadT = 0;
    } catch (e) {}
    return r;
  };
}
/* ═══ Tela preta ao carregar ═══
   No celular, às vezes uma tela nova (o Refúgio, a fase) abria preta e só aparecia depois de apertar START.
   Vigia de todas as cenas de jogo, a cada quadro:
   • esmaecimento preso: a câmera terminou de escurecer (fadeOut) e ficou parada no preto por mais de 2,5 s sem
     nenhuma troca de cena acontecendo → a câmera volta a mostrar a cena (resetFX);
   • câmera perdida: ela segue o herói mas ele está fora do que ela mostra por mais de 1,2 s (tela redimensionada /
     girada no meio do carregamento) → centraliza nele de novo;
   • cena ativa marcada como invisível → volta a desenhar. */
{
  const KEYS = ["Hub", "Game", "ArcticPrologue", "ReturnJourney"];
  const calm = (s) => !s.__busy && !s.transitioning && !s.leaving && (s.scene.key !== "Game" || s.state === "playing");
  const tick = (G, dt) => {
    for (const k of KEYS) {
      const s = G.scene.getScene(k);
      if (!s?.sys?.isActive?.()) { if (s) s.__bkW = null; continue; }
      const W = s.__bkW || (s.__bkW = { fade: 0, lost: 0 });
      try {
        if (!s.sys.settings.visible) s.sys.setVisible(!0);
        const cam = s.cameras?.main;
        if (!cam) continue;
        const fe = cam.fadeEffect;
        const stuck = fe && !fe.isRunning && fe.direction === !0 && fe.alpha >= .95 && calm(s);
        W.fade = stuck ? W.fade + dt : 0;
        if (W.fade > 2500) { W.fade = 0; try { fe.reset() } catch (e) {} cam.resetFX?.(); cam.fadeIn(300, 0, 0, 0); console.warn("[anti-trava] tela preta destravada em", k); }
        const T = cam._follow;
        if (T && T.active !== !1 && calm(s)) {
          const v = cam.worldView, m = 60;
          const out = v.width > 0 && (T.x < v.x - m || T.x > v.right + m || T.y < v.y - m || T.y > v.bottom + m);
          W.lost = out ? W.lost + dt : 0;
          if (W.lost > 1200) { W.lost = 0; cam.centerOn(T.x, T.y); console.warn("[anti-trava] câmera recentrada em", k); }
        } else W.lost = 0;
      } catch (e) {}
    }
  };
  const C0 = bo.prototype.create;
  bo.prototype.create = function () {
    const r = C0.apply(this, arguments);
    try {
      const G = this.game;
      if (!G.__bkWatch) { G.__bkWatch = 1; let last = performance.now(); G.events.on("poststep", () => { const n = performance.now(), dt = Math.min(250, n - last); last = n; tick(G, dt) }) }
    } catch (e) {}
    return r;
  };
}
