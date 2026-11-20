/* p216.72 — resgate do controle: estados presos que só o toque/mouse destravava.
   Roda fora do laço do Phaser (setInterval), lê o gamepad direto e:
   1) START/ESC com o jogo "preso" (uiOpen/pausa sem nenhum painel na tela) → solta a fase;
   2) Refúgio com __busy preso (sem painel, diálogo nem mochila) → solta o herói e abre a pausa;
   3) campo de texto escondido segurando o foco → devolve o foco ao jogo. */
{
 const G = () => window.__DED_GAME;
 const domOv = () => !!document.getElementById("depthgate-cinematic-overlay") || [...document.body.children].some(e => e.tagName === "DIV" && e.id !== "game" && +getComputedStyle(e).zIndex >= 9999 && e.offsetWidth > 200 && +getComputedStyle(e).opacity > .05);
 const OVER = ["BestiaryBook", "CollectiblesBook", "CodexBook", "ValdrakAntiga", "SkillTreeScene", "HallOfFame"];
 const uiBusy = u => { try { return !!(u && (u.nameEntry || u.__dlgOpen || u.pauseMenu?.open || u.inventoryUI?.open || u.shopUI?.open || u.skillTree?.open || u.settingsPanel?.open || u.storyPanel?.visible || u.blessingPanel?.visible || u.eventPanel?.visible || u.result?.isVisible?.() || u.__portalChoiceUI?.open || u.__pactsUI?.open || u.__hallOfFameUI?.open || u.__hiInv?.open)) } catch (e) { return !0 } };
 const otherScene = g => g.scene.getScenes(true).some(s => OVER.includes(s.sys.settings.key));
 const log = m => { try { console.warn("[resgate] " + m) } catch (e) {} };
 const freeGame = (g, why) => {
  const S = g.scene.getScene("Game"); if (!S?.sys?.isActive?.()) return !1;
  if (!(S.uiOpen || S.state === "paused" || S.physics?.world?.isPaused || S.time?.paused)) return !1;
  if (!["playing", "paused"].includes(S.state)) return !1;
  const u = g.scene.getScene("UI"); if (uiBusy(u) || otherScene(g) || domOv()) return !1;
  S.uiOpen = !1; S.state === "paused" && (S.state = "playing");
  try { S.physics?.resume?.() } catch (e) {} try { S.time.paused = !1 } catch (e) {} try { S.tweens?.resumeAll?.() } catch (e) {} try { S.anims?.resumeAll?.() } catch (e) {}
  try { g.inputManager && (g.inputManager.padButtons = []) } catch (e) {}
  log("fase solta (" + why + ")"); return !0
 };
 const freeHub = (g, why) => {
  const H = g.scene.getScene("Hub"); if (!H?.sys?.isActive?.() || !H.__busy || H.panel || H.__hubDlgO || H.__pz) return !1;
  const U = g.scene.getScene("HubUI"); if (U?.__hiOpen || domOv() || otherScene(g)) return !1;
  try { if (H.cameras.main.fadeEffect?.isRunning) return !1 } catch (e) {}
  H.__busy = !1; H.__stPv = !0; H.__slPv = !0; log("refúgio solto (" + why + ")"); return !0
 };
 let stPv = !1, hubT = 0;
 window.addEventListener("keydown", e => { if (e.isTrusted && e.key === "Escape") { const g = G(); if (!g) return; setTimeout(() => { freeHub(g, "esc") && H_open(g); freeGame(g, "esc") }, 200) } }, !0);
 const H_open = g => { try { const H = g.scene.getScene("Hub"); H.time.delayedCall(30, () => H.__pzOpen?.()) } catch (e) {} };
 setInterval(() => {
  const g = G(); if (!g?.scene || document.visibilityState !== "visible") return;
  const now = performance.now();
  /* a pausa não abre por cima de uma fala: a fala tem um véu de tela inteira que roubava os toques da pausa
     e o A do controle avançava a fala e escolhia item da pausa ao mesmo tempo */
  try { const u = g.scene.getScene("UI"), pm = u?.pauseMenu; if (pm && !pm.__rgDlg && typeof pm.toggle === "function") { const T = pm.toggle; pm.toggle = function () { if (!this.open && u.__dlgOpen) return; return T.apply(this, arguments) }; pm.__rgDlg = 1 } } catch (e) {}
  /* foco preso num campo escondido */
  try { const a = document.activeElement; if (a && (a.tagName === "INPUT" || a.tagName === "TEXTAREA") && (!a.isConnected || a.offsetParent === null || getComputedStyle(a).visibility === "hidden")) { a.blur(); g.canvas?.focus?.() } } catch (e) {}
  /* START do gamepad */
  let p = null; try { p = [...(navigator.getGamepads?.() || [])].find(x => x && x.connected) } catch (e) {}
  const st = !!p && !!(p.buttons[9]?.pressed);
  if (st && !stPv) { freeHub(g, "start") && H_open(g); setTimeout(() => freeGame(g, "start"), 180) }
  stPv = st;
  /* trava de vídeo vazada: nenhum vídeo/cinemática na tela e as cenas continuam sem controle */
  try { const L = window.__vlk; if (L && (L.n > 0 || L.sc?.length) && !domOv()) { L.__z ||= now; if (now - L.__z > 3000) { for (const sc of L.sc || []) { const I = sc.input; if (!I || !sc.sys || (sc.sys.settings?.status ?? 0) > 7) continue; I.enabled = !0; I.keyboard && (I.keyboard.enabled = !0, I.keyboard.resetKeys?.()) } log("trava de vídeo solta (" + L.n + ")"); L.n = 0; L.sc = []; L.__z = 0 } } else if (L) L.__z = 0 } catch (e) {}
  /* refúgio: __busy preso sozinho por muito tempo */
  const H = g.scene.getScene("Hub");
  if (H?.sys?.isActive?.() && H.__busy && !H.panel && !H.__hubDlgO) { hubT ||= now; if (now - hubT > 6000) { freeHub(g, "tempo"); hubT = 0 } } else hubT = 0;
 }, 250);
}
