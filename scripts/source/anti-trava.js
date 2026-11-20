/* ══ Anti-trava (p216.54) ═══════════════════════════════════════════════════════════════════════════════════════
   Ao voltar ao Refúgio a tela às vezes ficava parada (nada se mexia) até apertar START. O laço do Phaser chama o
   próximo quadro DEPOIS de terminar o atual: um erro fora da proteção das cenas (ao desenhar, ao criar a cena ou
   num evento do jogo) interrompia a corrente de quadros. Agora:
   • desenhar cada cena e o passo do gerenciador de cenas ficam protegidos (o erro vai para o console e o jogo segue);
   • um vigia independente (setInterval) percebe se nenhum quadro passou em 1,5 s com a aba visível e religa o laço
     (e tira a pausa do jogo, se ficou pausado sem motivo);
   • o último erro/travamento fica em localStorage "depthgate:trava" (para diagnóstico).                           */
function __atLog(kind, e) {
  try {
    const msg = `${kind}: ${e?.message ?? e}`.slice(0, 300);
    console.error("[DEPTHGATE] " + msg, e?.stack ?? "");
    localStorage.setItem("depthgate:trava", JSON.stringify({ t: new Date().toISOString(), msg, stack: String(e?.stack ?? "").slice(0, 900) }));
  } catch (x) {}
}
{const SP = j.Scenes?.Systems?.prototype;
 if (SP && !SP.__safeR) { const R0 = SP.render; SP.render = function () { try { return R0.apply(this, arguments) } catch (e) { (this.__errR = (this.__errR || 0) + 1) <= 3 && __atLog("erro ao desenhar " + (this.settings?.key ?? "?"), e) } }; SP.__safeR = 1 }}
{const SM = j.Scenes?.SceneManager?.prototype;
 if (SM && !SM.__safeU) { const U0 = SM.update; SM.update = function () { try { return U0.apply(this, arguments) } catch (e) { (this.__errU = (this.__errU || 0) + 1) <= 3 && __atLog("erro no gerenciador de cenas", e) } }; SM.__safeU = 1 }}
{let lastF = -1, lastT = 0, fixes = 0;
 setInterval(() => {
   try {
     const g = window.__DED_GAME, L = g?.loop; if (!L || document.visibilityState !== "visible") { lastT = 0; return }
     const now = performance.now();
     if (L.frame !== lastF) { lastF = L.frame; lastT = now; return }
     if (!lastT || now - lastT < 1500) return;
     if (document.getElementById("depthgate-cinematic-overlay") || [...document.body.children].some(e => e.tagName === "DIV" && e.id !== "game" && +getComputedStyle(e).zIndex >= 99999 && e.offsetWidth > 200 && +getComputedStyle(e).opacity > .05)) return;   // vídeo/cinemática na frente: o jogo dorme de propósito
     if (document.querySelector(".rotate-overlay.visible, #rotate-overlay.visible")) return;                                              // celular em pé
     __atLog("jogo parado " + Math.round(now - lastT) + " ms — religando", { message: `running=${L.running} paused=${g.isPaused} cenas=${g.scene.scenes.filter(s => s.sys.settings.status >= 5).map(s => s.scene.key + ":" + s.sys.settings.status).join(",")}` });
     if (g.isPaused) g.resume();
     try { L.sleep() } catch (e) {}
     L.wake(); lastT = now; fixes++;
   } catch (e) {}
 }, 500)}
