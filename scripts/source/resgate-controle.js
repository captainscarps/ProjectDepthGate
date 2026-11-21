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
 /* p216.84: START do controle no Refúgio sem nenhuma reação (a pausa não abriu) → destrava tudo o que pode segurar a
    vila — fade de câmera parado, relógio/tweens/física pausados, entrada desligada, cena em pausa, fala "fantasma"
    (sem caixa na tela) e __busy — e abre a pausa, igual ao botão START da tela. */
 const forceHub = (g) => {
  const H = g.scene.getScene("Hub"); if (!H?.sys?.isActive?.() && !H?.sys?.isPaused?.()) return;
  if (H.panel || H.__pz || domOv() || otherScene(g)) return;
  const U = g.scene.getScene("HubUI"); if (U?.__hiOpen) return;
  const dl = H.__hubDlgO; if (dl && dl.active !== !1 && dl.visible !== !1 && dl.scene) return;     // fala de verdade: o A avança
  try { H.__hubDlgO = null } catch (e) {}
  try { H.sys.isPaused?.() && H.scene.resume() } catch (e) {}
  try { const c = H.cameras.main; c.fadeEffect?.isRunning && c.fadeEffect.reset(); c.resetFX?.(); c.setAlpha?.(1) } catch (e) {}
  try { H.time.paused = !1; H.tweens.resumeAll?.(); H.anims?.resumeAll?.(); H.physics?.resume?.() } catch (e) {}
  try { H.input.enabled = !0; H.input.keyboard && (H.input.keyboard.enabled = !0); H.input.gamepad && (H.input.gamepad.enabled = !0) } catch (e) {}
  try { const L = window.__vlk; L && (L.n = 0, L.sc = []) } catch (e) {}
  try { g.inputManager && (g.inputManager.padButtons = []) } catch (e) {}
  try { g.loop && !g.loop.running && g.loop.start?.(g.loop.callback) } catch (e) {}
  H.__busy = !1; H.__stPv = !0; H.__slPv = !0;
  try { H.__pzOpen?.() } catch (e) {}
  log("refúgio forçado (start sem reação)");
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
  if (st && !stPv) { freeHub(g, "start") && H_open(g); setTimeout(() => freeGame(g, "start"), 180); { const H0 = g.scene.getScene("Hub"), was = !!(H0?.panel || H0?.__pz || H0?.__hubDlgO); was || setTimeout(() => forceHub(g), 500) } }
  stPv = st;
  /* trava de vídeo vazada: nenhum vídeo/cinemática na tela e as cenas continuam sem controle */
  try { const L = window.__vlk; if (L && (L.n > 0 || L.sc?.length) && !domOv()) { L.__z ||= now; if (now - L.__z > 3000) { for (const sc of L.sc || []) { const I = sc.input; if (!I || !sc.sys || (sc.sys.settings?.status ?? 0) > 7) continue; I.enabled = !0; I.keyboard && (I.keyboard.enabled = !0, I.keyboard.resetKeys?.()) } log("trava de vídeo solta (" + L.n + ")"); L.n = 0; L.sc = []; L.__z = 0 } } else if (L) L.__z = 0 } catch (e) {}
  /* refúgio: __busy preso sozinho por muito tempo */
  const H = g.scene.getScene("Hub");
  if (H?.sys?.isActive?.() && H.__busy && !H.panel && !H.__hubDlgO) { hubT ||= now; if (now - hubT > 6000) { freeHub(g, "tempo"); hubT = 0 } } else hubT = 0;
 }, 250);
}

/* ══ Textos do mundo sempre na frente (p216.83) ══
   Nomes, placas e avisos escritos no cenário nunca ficam atrás de herói, inimigo ou NPC: todo texto solto do mundo
   (ou rótulo feito só de texto + fundo) abaixo da camada 9000 sobe para 9000+, mantendo a ordem entre eles. */
{
 const SC = ["Game", "Hub", "Traversal", "ValdrakAntiga"];
 const isLabel = (o) => o.type === "Container" && o.list?.some((c) => c.type === "Text") && o.list.every((c) => c.type === "Text" || c.type === "Graphics" || c.type === "Rectangle" || c.type === "NineSlice");
 setInterval(() => {
  const g = window.__DED_GAME; if (!g) return;
  for (const k of SC) {
   const S = g.scene.getScene(k);
   if (!S?.sys?.isActive?.() || !S.children) continue;
   for (const o of S.children.list) {
    if (o.__txtFront || !o.visible || o.depth >= 9000 || o.__txtKeep) continue;
    if (o.type !== "Text" && !isLabel(o)) continue;
    if (o.scrollFactorX === 0) continue;                 // texto preso na tela (HUD da cena) não entra
    o.__txtFront = 1; o.setDepth(9000 + Math.max(0, Math.min(999, o.depth)) / 1000);
   }
  }
 }, 300);
}

/* ══ Pactos do Abismo não sobrevivem à morte (p216.84) ══
   Ao chegar no Refúgio sem uma corrida viva do Infinito (morreu / terminou), o deck de pactos é zerado. */
{
 const C0 = Fl.prototype.create;
 Fl.prototype.create = function () {
  const r = C0.apply(this, arguments);
  try {
   const reg = this.game.registry, run = reg.get("endless:run");
   if (!run || run.finished) { if (run) { run.pacts = []; run.cards = [] } reg.set("endless:activePacts", []) }
  } catch (e) {}
  return r;
 };
}

/* ══ Sala presa (p216.84) ══
   Às vezes a sala ficava trancada com todos os inimigos já mortos (o último morreu por um caminho que não avisava a
   sala, nenhum inimigo chegou a nascer, ou sobrou um inimigo fora da sala / invisível / preso na parede).
   Vigia de 1 s fora do laço do Phaser: sala ativa sem chefe e sem objetivo pendente →
   • inimigo "fantasma" (invisível, sem corpo, sem vida ou longe da sala) é removido;
   • inimigo parado no mesmo lugar sem levar dano por 25 s, longe do herói, é trazido para perto dele;
   • sem nenhum inimigo de verdade por 2 s, a sala é concluída (portas abrem, portal do Infinito aparece). */
{
 let room = null, emptyT = 0;
 const track = new WeakMap();
 setInterval(() => {
  const g = window.__DED_GAME; if (!g || document.visibilityState !== "visible") return;
  const S = g.scene.getScene("Game");
  if (!S?.sys?.isActive?.() || S.state !== "playing" || S.uiOpen) return;
  const rm = S.roomManager, r = rm?.activeRoom;
  if (!r || r.state !== "active" || r.hasBoss || S.boss?.active) { room = null; emptyT = 0; return }
  if (room !== r) { room = r; emptyT = 0 }
  try {
   if (r.def?.cdObj && !r.cdDone) {
    if (r.def.cdObj === "SURVIVE" && r.cdUntil && S.time.now > r.cdUntil + 3000 && typeof __cdObjDone === "function") __cdObjDone(S, r);
    return;
   }
   const T = typeof dt === "number" ? dt : 32, rc = r.def?.rect || r.rect, now = performance.now(), p = S.player;
   const inRoom = (e) => !rc || (e.x > (rc.x - 3) * T && e.x < (rc.x + rc.w + 3) * T && e.y > (rc.y - 3) * T && e.y < (rc.y + rc.h + 3) * T);
   const al = S.enemies?.getChildren?.().filter((e) => e.active && !e.dead) || [];
   const real = []; let pend = 0;
   for (const e of al) {
    // invisível pode ser inimigo que se enterra/some por um tempo: só conta depois de 8 s; fora da sala ou sem vida, 3 s
    const lim = (e.hp != null && e.hp <= 0) || !inRoom(e) || (!e.body && e.type !== "Container") ? 3000 : !e.visible ? 8000 : 0;
    if (!lim) { real.push(e); continue }
    let t = track.get(e); if (!t) { t = { ghost0: now }; track.set(e, t) } else t.ghost0 ||= now;
    if (now - t.ghost0 > lim) { try { e.dead = !0; e.setActive(!1).setVisible(!1); e.body && (e.body.enable = !1); e.destroy() } catch (x) {} console.warn("[resgate] inimigo fantasma removido da sala", e.texture?.key) }
    else pend++;
   }
   for (const e of real) {
    let t = track.get(e); if (!t) { t = {}; track.set(e, t) }
    t.ghost0 = 0;
    if (t.x == null || Math.hypot(e.x - t.x, e.y - t.y) > 6 || e.hp !== t.hp) { t.x = e.x; t.y = e.y; t.hp = e.hp; t.since = now; continue }
    if (p && now - t.since > 25000 && Math.hypot(e.x - p.x, e.y - p.y) > T * 3) {
     const a = Math.random() * Math.PI * 2; e.setPosition(p.x + Math.cos(a) * T * 2, p.y + Math.sin(a) * T * 2); t.since = now; t.x = e.x; t.y = e.y;
     console.warn("[resgate] inimigo preso trazido para perto do herói", e.texture?.key);
    }
   }
   if (real.length || pend) { emptyT = 0; return }
   emptyT ||= now;
   if (now - emptyT > 2000 && r.state === "active") { emptyT = 0; rm.completeRoom(r, !1); console.warn("[resgate] sala concluída (sem inimigos vivos)") }
  } catch (e) { console.warn("[resgate] sala", e) }
 }, 1000);
}
