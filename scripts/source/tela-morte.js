/* ══ Tela de morte do Modo Infinito (p216.87) ══════════════════════════════════════════════════════════════════
   Antes: o herói morria, apareciam faixas na tela e, 5 s depois, o jogo levava sozinho ao Refúgio — no meio da troca
   de cena às vezes a vila ficava travada (só o toque/START destravava). Agora a morte para numa tela própria e só
   segue quando o jogador aperta "IR PARA O REFÚGIO":
   • feita em HTML por cima do jogo (não depende do laço do Phaser: abre e responde mesmo se o jogo engasgar);
   • aceita clique/toque no botão, Enter/Espaço/E no teclado e A/START no controle (lido direto do gamepad);
   • os botões só respondem depois de 1,2 s (quem estava apertando ataque na hora da morte não pula a tela);
   • mostra a profundidade, os números da corrida, o que volta com o herói e as peças do ferreiro que quebraram;
   • ao confirmar, chama a volta normal ao Refúgio (onRestart) e, se a fase já não estiver ativa, abre o Refúgio direto. */
function __dmL(pt, en, es) { try { return __L3(pt, en, es) } catch (e) { return pt } }
const __DM_MSG = [
  ["A escuridão venceu desta vez. A Guardiã abriu o portal branco e trouxe você de volta — o Abismo continua lá, esperando.",
   "The darkness won this time. The Guardian opened the white portal and brought you back — the Abyss is still there, waiting.",
   "La oscuridad ganó esta vez. La Guardiana abrió el portal blanco y te trajo de vuelta — el Abismo sigue ahí, esperando."],
  ["Cair também faz parte da descida. Cada profundidade vencida deixa o herói mais pronto para a próxima.",
   "Falling is part of the descent. Every depth conquered makes the hero readier for the next.",
   "Caer también es parte del descenso. Cada profundidad vencida deja al héroe más listo para la siguiente."],
  ["O Abismo guarda tudo o que você deixou lá embaixo. Descanse, prepare-se na forja e volte para buscar.",
   "The Abyss keeps everything you left down there. Rest, gear up at the forge and come back for it.",
   "El Abismo guarda todo lo que dejaste allá abajo. Descansa, prepárate en la forja y vuelve a buscarlo."],
  ["Até os heróis mais lembrados de Valdrak caíram antes de vencer. O fogo do Refúgio ainda está aceso.",
   "Even Valdrak's most remembered heroes fell before they won. The Refuge fire is still burning.",
   "Hasta los héroes más recordados de Valdrak cayeron antes de vencer. El fuego del Refugio sigue encendido."],
];
function __dmTime(ms) { const s = Math.max(0, Math.round((ms || 0) / 1000)), m = Math.floor(s / 60); return m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m}:${String(s % 60).padStart(2, "0")}` }
function __dmCss() {
  if (document.getElementById("dm-css")) return;
  const st = document.createElement("style"); st.id = "dm-css";
  st.textContent = `
#dm-ov{position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .9s ease;
 background:radial-gradient(ellipse at center,rgba(40,6,6,.72) 0%,rgba(8,2,2,.93) 62%,rgba(0,0,0,.97) 100%);font-family:Georgia,'Times New Roman',serif;user-select:none;-webkit-user-select:none;touch-action:manipulation}
#dm-ov.on{opacity:1}
#dm-box{position:relative;width:min(560px,90vw);max-height:92vh;overflow:auto;padding:28px 34px 24px;box-sizing:border-box;text-align:center;color:#e8dcc0;
 background:linear-gradient(180deg,#17110d 0%,#0e0a08 100%);border:2px solid #6a4e26;box-shadow:0 0 0 1px #000,inset 0 0 0 1px #3a2a16,0 18px 60px rgba(0,0,0,.8),0 0 80px rgba(150,20,10,.25);
 transform:translateY(14px) scale(.97);transition:transform .9s cubic-bezier(.2,.8,.2,1)}
#dm-ov.on #dm-box{transform:none}
#dm-box:before,#dm-box:after{content:"";position:absolute;left:14px;right:14px;height:1px;background:linear-gradient(90deg,transparent,#c9a24a,transparent);opacity:.55}
#dm-box:before{top:8px}#dm-box:after{bottom:8px}
#dm-orn{color:#8a2a22;font-size:20px;letter-spacing:10px;margin-bottom:2px;opacity:.85}
#dm-tit{font-size:clamp(30px,6vw,44px);font-weight:bold;letter-spacing:4px;color:#e05a4a;text-shadow:0 0 18px rgba(224,60,40,.45),0 3px 0 #2a0806;margin:0}
#dm-sub{margin-top:6px;font-size:13px;letter-spacing:3px;color:#c9a24a;text-transform:uppercase}
#dm-rec{display:none;margin:12px auto 0;padding:4px 12px;width:max-content;border:1px solid #ffd24a;color:#ffd24a;font-size:12px;letter-spacing:3px;background:rgba(255,210,74,.08)}
#dm-msg{margin:16px auto 0;max-width:440px;font-style:italic;font-size:15px;line-height:1.5;color:#d9cdb2}
#dm-st{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:20px 0 0}
#dm-st div{background:rgba(255,255,255,.03);border:1px solid #33261a;padding:8px 4px}
#dm-st b{display:block;font-size:20px;color:#f2d9a0}
#dm-st span{font-size:10px;letter-spacing:2px;color:#9a8a6a;text-transform:uppercase}
#dm-keep{margin-top:16px;font-size:12.5px;line-height:1.6;color:#b9ab8c}
#dm-keep .g{color:#f2d9a0}#dm-keep .x{color:#d77a6a}#dm-keep .k{color:#7fb2ff}
#dm-btn{margin-top:22px;display:inline-flex;align-items:center;gap:10px;padding:13px 30px;font:bold 15px Georgia,serif;letter-spacing:3px;color:#1a1008;
 background:linear-gradient(180deg,#f2d27a,#c9a24a 55%,#a07a2c);border:1px solid #f8e2a0;box-shadow:0 0 0 2px #3a2a12,0 6px 18px rgba(0,0,0,.6);cursor:pointer;opacity:.45;transition:opacity .3s,transform .12s,box-shadow .2s}
#dm-btn.ok{opacity:1;animation:dmPulse 1.8s ease-in-out infinite}
#dm-btn:active{transform:scale(.97)}
#dm-btn i{font-style:normal;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:#1a1008;color:#7fe08a;font-size:12px}
#dm-hint{margin-top:9px;font-size:11px;letter-spacing:1px;color:#7a6c52}
@keyframes dmPulse{0%,100%{box-shadow:0 0 0 2px #3a2a12,0 6px 18px rgba(0,0,0,.6)}50%{box-shadow:0 0 0 2px #3a2a12,0 0 26px rgba(242,210,122,.55)}}
@media (max-height:430px){#dm-box{padding:16px 22px 14px}#dm-msg{margin-top:8px;font-size:13px}#dm-st{margin-top:10px}#dm-keep{margin-top:8px}#dm-btn{margin-top:12px}}
`;
  document.head.appendChild(st);
}
function __deathScreen(S, t) {
  const g = S.game, e = t?.entry || {}, info = S.__deathInfo || {};
  if (document.getElementById("dm-ov")) return;
  __dmCss();
  const ov = document.createElement("div"); ov.id = "dm-ov";
  const msg = __DM_MSG[Math.floor(Math.random() * __DM_MSG.length)];
  const depth = info.depth || e.depth || 1;
  let biome = "";
  try { biome = St(`lvl.${S.levelId}`, S.level?.name || "") || "" } catch (x) { biome = S.level?.name || "" }
  biome = /^endless-/i.test(biome) ? "" : String(biome).replace(/^\s*prof(undidade|\.)?\s*\d+\s*·\s*/i, "");
  const broke = info.broke || 0;
  ov.innerHTML = `<div id="dm-box" role="dialog" aria-modal="true">
   <div id="dm-orn">✦ ✠ ✦</div>
   <h1 id="dm-tit">${__dmL("VOCÊ CAIU", "YOU FELL", "HAS CAÍDO")}</h1>
   <div id="dm-sub">${__dmL("Profundidade", "Depth", "Profundidad")} ${depth}${biome ? " · " + biome : ""}</div>
   <div id="dm-rec">★ ${__dmL("NOVO RECORDE", "NEW RECORD", "NUEVO RÉCORD")} ★</div>
   <p id="dm-msg">“${__dmL(...msg)}”</p>
   <div id="dm-st">
    <div><b>${e.roomsCleared ?? 0}</b><span>${__dmL("Salas", "Rooms", "Salas")}</span></div>
    <div><b>${(e.score ?? 0).toLocaleString("pt-BR")}</b><span>${__dmL("Pontos", "Score", "Puntos")}</span></div>
    <div><b>${e.enemiesKilled ?? 0}</b><span>${__dmL("Abates", "Kills", "Bajas")}</span></div>
    <div><b>${__dmTime(e.elapsedMs)}</b><span>${__dmL("Tempo", "Time", "Tiempo")}</span></div>
   </div>
   <div id="dm-keep">
    ${__dmL("Volta com você", "You keep", "Vuelve contigo")}: <span class="g">● ${info.gold ?? 0} ${__dmL("de ouro", "gold", "de oro")}</span> · ${__dmL("a arma inicial", "your starting weapon", "el arma inicial")} · ${__dmL("as peças do ferreiro", "your blacksmith pieces", "las piezas del herrero")}<br>
    <span class="x">${__dmL("Fica no Abismo: nível do herói, itens achados e pactos", "Left in the Abyss: hero level, found items and pacts", "Se queda en el Abismo: nivel del héroe, objetos y pactos")}</span>
    ${broke ? `<br><span class="k">${broke} ${__dmL("peça(s) do ferreiro quebraram — conserte na forja", "blacksmith piece(s) broke — repair them at the forge", "pieza(s) del herrero se rompieron — repáralas en la forja")}</span>` : ""}
   </div>
   <button id="dm-btn" type="button"><i>A</i>${__dmL("IR PARA O REFÚGIO", "GO TO THE REFUGE", "IR AL REFUGIO")}</button>
   <div id="dm-hint">${__dmL("Ⓐ no controle · Enter no teclado · ou toque no botão", "Ⓐ on the controller · Enter on the keyboard · or tap the button", "Ⓐ en el mando · Enter en el teclado · o toca el botón")}</div>
  </div>`;
  document.body.appendChild(ov);
  t?.newRecord && (ov.querySelector("#dm-rec").style.display = "block");
  requestAnimationFrame(() => ov.classList.add("on"));
  window.__padUI = (window.__padUI || 0) + 1;
  const btn = ov.querySelector("#dm-btn");
  let ready = !1, gone = !1, pv = !0;
  setTimeout(() => { ready = !0; btn.classList.add("ok"); try { btn.focus({ preventScroll: !0 }) } catch (x) {} }, 1200);
  const go = () => {
    if (!ready || gone) return; gone = !0;
    try { g.audioEngine?.sfx?.("sfx-ui-confirm") } catch (x) {}
    window.removeEventListener("keydown", kd, !0); clearInterval(pad);
    window.__padUI = Math.max(0, (window.__padUI || 0) - 1);
    try { g.inputManager && (g.inputManager.padButtons = []) } catch (x) {}
    ov.classList.remove("on"); setTimeout(() => ov.remove(), 700);
    try {
      if (S.sys?.isActive?.()) S.onRestart();
      else { g.scene.getScenes(!0).forEach((q) => { const k = q.sys.settings.key; k !== "LazyMaps" && g.scene.stop(k) }); g.scene.start("Hub") }
    } catch (x) { console.warn("[tela de morte]", x); try { g.scene.start("Hub") } catch (y) {} }
    // garantia: se em 6 s o Refúgio não abriu, abre direto
    setTimeout(() => { try { const H = g.scene.getScene("Hub"); if (!H?.sys?.isActive?.()) { g.scene.getScenes(!0).forEach((q) => { const k = q.sys.settings.key; k !== "LazyMaps" && g.scene.stop(k) }); g.scene.start("Hub") } } catch (x) {} }, 6000);
  };
  const kd = (ev) => { if (["Enter", " ", "e", "E", "Escape"].includes(ev.key)) { ev.preventDefault(); ev.stopPropagation(); go() } };
  window.addEventListener("keydown", kd, !0);
  btn.addEventListener("click", go);
  const pad = setInterval(() => {
    let p = null; try { p = [...(navigator.getGamepads?.() || [])].find((x) => x && x.connected) } catch (x) {}
    const a = !!p && !!(p.buttons[0]?.pressed || p.buttons[9]?.pressed);
    a && !pv && go(); pv = a;
  }, 50);
}
window.__deathScreen = __deathScreen;
