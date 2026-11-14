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
  /* ── v2: casos que o vigia de cima não pegava (a tela preta continuava até apertar START) ──
     • esmaecimento preso mesmo com a cena "ocupada": o fim do escurecimento aconteceu, mas quem esperava por ele
       (camerafadeoutcomplete) não ouviu — depois de 1,5 s o aviso é repetido; depois de 4,5 s a cena volta a aparecer;
     • clareamento parado (fadeIn que não anda) → termina na hora;
     • Refúgio/fase pausados ou dormindo sem nenhuma tela por cima (livros, viagem de volta, Valdrak) → retomados;
     • laço do jogo dormindo com a página visível → acordado (relógio do navegador, fora do laço). */
  const OVER = ["ValdrakAntiga", "BestiaryBook", "CollectiblesBook", "CodexBook", "ReturnJourney", "ArcticPrologue", "Traversal"];
  const tick2 = (G, dt) => {
    const over = OVER.some(k => G.scene.isActive(k));
    for (const k of KEYS) {
      const s = G.scene.getScene(k); if (!s?.sys) continue;
      const W = s.__bkW2 || (s.__bkW2 = { fl: 0, hard: 0, fin: 0, finP: -1, held: 0 });
      try {
        // pausada ou dormindo sem motivo
        const off = (s.sys.isPaused?.() || s.sys.isSleeping?.()) && !over && !(k === "Game" && s.state === "paused");
        W.held = off ? W.held + dt : 0;
        if (W.held > 3000) { W.held = 0; s.sys.isSleeping?.() ? G.scene.wake(k) : G.scene.resume(k); console.warn("[anti-trava] cena retomada", k) }
        if (!s.sys.isActive?.()) { W.fl = W.hard = W.fin = 0; continue }
        const cam = s.cameras?.main, fe = cam?.fadeEffect; if (!fe) continue;
        const black = !fe.isRunning && fe.direction === !0 && fe.alpha >= .95;
        W.fl = black ? W.fl + dt : 0; W.hard = black ? W.hard + dt : 0;
        if (W.fl > 1500 && cam.listenerCount?.("camerafadeoutcomplete")) { W.fl = 0; cam.emit("camerafadeoutcomplete", cam, fe); console.warn("[anti-trava] aviso de escurecimento repetido em", k) }
        if (W.hard > 4500) { W.hard = 0; try { fe.reset() } catch (e) {} cam.resetFX?.(); cam.fadeIn(300, 0, 0, 0); console.warn("[anti-trava] tela preta destravada (cena ocupada) em", k) }
        if (fe.isRunning && fe.direction === !1) { W.fin = fe.progress === W.finP ? W.fin + dt : 0; W.finP = fe.progress; if (W.fin > 2000) { W.fin = 0; try { fe.reset() } catch (e) {} cam.resetFX?.(); console.warn("[anti-trava] clareamento parado terminado em", k) } } else W.fin = 0;
      } catch (e) {}
    }
  };
  const C0 = bo.prototype.create;
  bo.prototype.create = function () {
    const r = C0.apply(this, arguments);
    try {
      const G = this.game;
      if (!G.__bkWatch) { G.__bkWatch = 1; let last = performance.now(); G.events.on("poststep", () => { const n = performance.now(), dt = Math.min(250, n - last); last = n; tick(G, dt); tick2(G, dt) }) }
      if (!G.__bkLoop) { G.__bkLoop = setInterval(() => { try { const L = G.loop; if (!document.hidden && L && (L.sleeping || L.running === !1)) { (L.wake || L.resume)?.call(L); console.warn("[anti-trava] laço do jogo acordado") } } catch (e) {} }, 1000) }
    } catch (e) {}
    return r;
  };
}
/* ═══ Herói preso em diálogo ═══
   Às vezes um diálogo terminava mas o herói continuava parado (a fala abriu com a cena já marcada como ocupada e,
   ao fechar, ninguém desmarcava; ou o Refúgio ficava "ocupado" sem nada aberto). Vigia a cada quadro:
   • fase: "interface aberta" sem nenhuma janela de verdade na tela (diálogo, painel com fundo escurecido, modais
     de portal/fenda/evento) por 6 s (as cenas de câmera duram menos) — ou 0,6 s logo depois que uma fala fecha → solta o herói e o mundo (física e relógio voltam);
   • Refúgio: "ocupado" sem painel, sem diálogo, sem pesca/diário e sem a câmera trocando de lugar por 4 s → solta;
     a caixa de fala sumida mas ainda registrada é esquecida. */
{
  const bigOpen = (sc, W_, H_) => {
    if (!sc?.sys) return !1;
    const walk = (list) => { for (const o of list) { if (!o?.visible || o.alpha === 0) continue; if (o.type === "Rectangle" && o.input?.enabled && o.width * (o.scaleX || 1) >= W_ * .6 && o.height * (o.scaleY || 1) >= H_ * .6) return !0; if (o.type === "Container" && o.list?.length && walk(o.list)) return !0 } return !1 };
    return walk(sc.children?.list || []);
  };
  const tick = (G, dt) => {
    const W_ = typeof _ !== "undefined" ? _ : 480, H_ = typeof st !== "undefined" ? st : 270;
    const S = G.scene.getScene("Game");
    if (S?.sys?.isActive?.() && S.uiOpen && S.state === "playing" && !S.transitioning && !S.finished) {
      const ui = G.scene.getScene("UI"), open = ui?.__dlgOpen || S.__portalModalOpen || S.__riftModalOpen || S.pendingEvent || S.__ppGoing || bigOpen(ui, W_, H_) || bigOpen(S, W_, H_);
      if (ui) { if (ui.__dlgOpen) ui.__dgWasDlg = 1; else if (ui.__dgWasDlg) { ui.__dgWasDlg = 0; S.__dgFast = 1 } }
      S.__dgUi = open ? 0 : (S.__dgUi || 0) + dt;
      if (open) S.__dgFast = 0;
      if (S.__dgUi > (S.__dgFast ? 600 : 6000)) { S.__dgUi = 0; S.__dgFast = 0; S.uiOpen = !1; try { S.physics?.resume?.(); S.time.paused = !1 } catch (e) {} console.warn("[anti-trava] herói solto (interface sem janela)") }
    } else if (S) S.__dgUi = 0;
    const Hb = G.scene.getScene("Hub");
    if (Hb?.sys?.isActive?.()) {
      if (Hb.__hubDlgO && !Hb.__hubDlgO.scene) Hb.__hubDlgO = null;
      const fe = Hb.cameras?.main?.fadeEffect, moving = fe?.isRunning || (fe && fe.direction === !0 && fe.alpha > .5);
      const stuck = Hb.__busy && !Hb.panel && !Hb.__hubDlgO && !Hb.__pqReel && !Hb.__pqJ && !moving;
      Hb.__dgBusy = stuck ? (Hb.__dgBusy || 0) + dt : 0;
      if (Hb.__dgBusy > 4000) { Hb.__dgBusy = 0; Hb.__busy = !1; console.warn("[anti-trava] Refúgio destravado (ocupado sem nada aberto)") }
    }
  };
  const C0 = bo.prototype.create;
  bo.prototype.create = function () {
    const r = C0.apply(this, arguments);
    try { const G = this.game; if (!G.__dgDlgWatch) { G.__dgDlgWatch = 1; let last = performance.now(); G.events.on("poststep", () => { const n = performance.now(), dt = Math.min(250, n - last); last = n; tick(G, dt) }) } } catch (e) {}
    return r;
  };
}
