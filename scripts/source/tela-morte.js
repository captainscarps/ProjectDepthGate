/* ══ Tela de morte do Modo Infinito (p216.87 · visual novo p216.88) ═══════════════════════════════════════════════
   O herói morre no Infinito → abre esta tela e o jogo só segue quando o jogador aperta "IR PARA O REFÚGIO".
   Visual em pixel art, com as artes do próprio jogo:
   • fundo: a pintura do bioma onde o herói caiu (vis-*.jpg), em tons de sangue, com zoom lento, vinheta, linhas
     de varredura e cinzas/brasas quadradas subindo (canvas próprio em baixa resolução);
   • à esquerda o emblema (espada partida nos escombros, elmo rachado — PixelLab, assets/pixel-art/ui/tela-morte),
     flutuando sobre um brilho vermelho;
   • à direita: "VOCÊ CAIU" em fonte pixel, letra por letra; profundidade e bioma; a Guardiã (retrato) com a fala
     sendo escrita; placas com salas · pontos · abates · tempo (os números sobem); o que volta e o que fica;
   • botão com moldura pixelada e o A do controle. Animações em degraus (steps), como sprite.
   Feita em HTML por cima do jogo (não depende do laço do Phaser). Aceita clique/toque, Enter/Espaço/E e A/START do
   controle; só responde depois de 1,2 s. Ao confirmar chama a volta normal (onRestart); se em 6 s o Refúgio não
   abriu, abre direto.
   p216.89: o miolo virou __dmScreen (reaproveitado pelas telas das Cavernas de Dorf: queda e volta vitoriosa). */
function __dmL(pt, en, es) { try { return __L3(pt, en, es) } catch (e) { return pt } }
const __DM_MSG = [
  ["A escuridão venceu desta vez. Abri o portal branco e trouxe você de volta — o Abismo continua lá, esperando.",
   "The darkness won this time. I opened the white portal and brought you back — the Abyss is still there, waiting.",
   "La oscuridad ganó esta vez. Abrí el portal blanco y te traje de vuelta — el Abismo sigue ahí, esperando."],
  ["Cair também faz parte da descida. Cada profundidade vencida deixa você mais pronto para a próxima.",
   "Falling is part of the descent. Every depth conquered makes you readier for the next.",
   "Caer también es parte del descenso. Cada profundidad vencida te deja más listo para la siguiente."],
  ["O Abismo guarda tudo o que você deixou lá embaixo. Descanse, passe na forja e volte para buscar.",
   "The Abyss keeps everything you left down there. Rest, visit the forge and come back for it.",
   "El Abismo guarda todo lo que dejaste allá abajo. Descansa, pasa por la forja y vuelve a buscarlo."],
  ["Até os heróis mais lembrados de Valdrak caíram antes de vencer. O fogo do Refúgio ainda está aceso.",
   "Even Valdrak's most remembered heroes fell before they won. The Refuge fire is still burning.",
   "Hasta los héroes más recordados de Valdrak cayeron antes de vencer. El fuego del Refugio sigue encendido."],
];
const __DM_VIS = { catacombs: "catacombs", ruins: "ruins", edesert: "temple", temple: "temple", ebosque: "bosque", bosque: "bosque", forest: "bosque",
  frozen: "glacial", glacial: "glacial", erio: "rio", rio: "rio", evulcao: "fortress", vulcao: "fortress", fortress: "fortress", emorta: "morta",
  morta: "morta", graveyard: "morta", ecastelo: "castle", ecastle: "castle", castle: "castle" };
function __dmTime(ms) { const s = Math.max(0, Math.round((ms || 0) / 1000)), m = Math.floor(s / 60); return m >= 60 ? `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}` : `${m}:${String(s % 60).padStart(2, "0")}` }
function __dmCss() {
  if (document.getElementById("dm-css")) return;
  const st = document.createElement("style"); st.id = "dm-css";
  /* moldura pixelada: degraus de 4 px feitos com box-shadow (sem cantos redondos nem gradiente de "app") */
  const px = (c, d) => `0 -4px 0 0 ${c},0 4px 0 0 ${c},-4px 0 0 0 ${c},4px 0 0 0 ${c},0 -8px 0 0 ${d},0 8px 0 0 ${d},-8px 0 0 0 ${d},8px 0 0 0 ${d},-4px -4px 0 0 ${d},4px -4px 0 0 ${d},-4px 4px 0 0 ${d},4px 4px 0 0 ${d}`;
  st.textContent = `
#dm-ov{position:fixed;inset:0;z-index:10050;overflow:hidden;opacity:0;transition:opacity 1.1s steps(11);background:#050203;
 font-family:NeoDunggeunmo,'Courier New',monospace;color:#e8dcc0;user-select:none;-webkit-user-select:none;touch-action:manipulation}
#dm-ov.on{opacity:1}
#dm-bg{position:absolute;inset:-4%;background-size:cover;background-position:center;image-rendering:pixelated;
 filter:grayscale(1) contrast(1.15) brightness(.42) sepia(1) hue-rotate(-38deg) saturate(2.4);animation:dmZoom 30s linear forwards}
#dm-vig{position:absolute;inset:0;background:radial-gradient(ellipse 70% 62% at 50% 52%,rgba(0,0,0,0) 0%,rgba(10,0,0,.55) 62%,rgba(0,0,0,.94) 100%),
 repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 2px,rgba(0,0,0,0) 2px 4px)}
#dm-fx{position:absolute;inset:0;width:100%;height:100%;image-rendering:pixelated}
#dm-wrap{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:min(5vw,56px);padding:3vh 4vw;box-sizing:border-box}
#dm-left{position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:center}
#dm-glow{position:absolute;width:118%;height:70%;bottom:2%;left:-9%;background:radial-gradient(ellipse at center,rgba(200,30,16,.55),rgba(120,10,6,.18) 45%,transparent 70%);animation:dmGlow 3.2s steps(8) infinite alternate}
#dm-emb{position:relative;width:384px;height:384px;image-rendering:pixelated;animation:dmBob 3.6s steps(6) infinite alternate;filter:drop-shadow(0 8px 0 rgba(0,0,0,.6))}
#dm-right{flex:0 1 560px;min-width:0}
#dm-tit{margin:0;font-family:PixelifySans,NeoDunggeunmo,monospace;font-weight:700;font-size:clamp(40px,7.2vw,78px);line-height:1;letter-spacing:4px;color:#ff5a40;
 text-shadow:4px 4px 0 #3a0604,8px 8px 0 #120102,0 0 26px rgba(255,60,30,.35);white-space:nowrap}
#dm-tit span{display:inline-block;opacity:0;transform:translateY(-26px);animation:dmDrop .42s steps(5) forwards}
#dm-sub{margin:14px 0 0;font-size:14px;letter-spacing:4px;color:#c9a24a;text-transform:uppercase;text-shadow:2px 2px 0 #000}
#dm-sub b{color:#f2d9a0;font-weight:normal}
#dm-rec{display:none;margin:16px 0 0 8px;padding:5px 10px;width:max-content;font-size:13px;letter-spacing:3px;color:#1a1008;background:#ffd24a;box-shadow:${px("#ffd24a", "#7a5a10")};animation:dmBlink 1s steps(2) infinite}
#dm-say{position:relative;display:flex;gap:14px;align-items:flex-start;margin:24px 8px 0 8px;padding:10px 12px 10px 10px;background:#140d0b;box-shadow:${px("#4a3420", "#0a0605")}}
#dm-por{flex:0 0 96px;width:96px;height:96px;image-rendering:pixelated;background:#21150f;box-shadow:inset 0 0 0 2px #4a3420}
#dm-say>div{flex:1;min-width:0}
#dm-nm{font-size:12px;letter-spacing:3px;color:#c9a24a;margin:2px 0 6px}
#dm-msg{font-size:15px;line-height:1.55;color:#e8dcc0;min-height:4.6em}
#dm-msg:after{content:"▌";color:#c9a24a;animation:dmBlink .7s steps(2) infinite}
#dm-st{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:26px 8px 0}
#dm-st div{background:#120c0a;box-shadow:${px("#3a2a1a", "#080504")};padding:8px 4px 7px;text-align:center}
#dm-st b{display:block;font-family:PixelifySans,monospace;font-size:26px;line-height:1.1;color:#f2d9a0;text-shadow:2px 2px 0 #000}
#dm-st span{font-size:10px;letter-spacing:2px;color:#9a8a6a;text-transform:uppercase}
#dm-keep{margin:22px 8px 0;font-size:12.5px;line-height:1.75;color:#b9ab8c}
#dm-keep p{margin:0}
#dm-keep i{font-style:normal;display:inline-block;width:14px;text-align:center;margin-right:6px}
#dm-keep .g{color:#f2d9a0}#dm-keep .x{color:#e07a64}#dm-keep .k{color:#8fbaff}
#dm-btn{margin:26px 8px 0 12px;display:inline-flex;align-items:center;gap:12px;padding:12px 22px 11px;font:20px PixelifySans,NeoDunggeunmo,monospace;letter-spacing:3px;color:#2a1606;
 background:#e8b84a;border:0;border-radius:0;box-shadow:inset 0 -5px 0 0 #a8741c,inset 0 4px 0 0 #ffe9a0,${px("#2a1606", "#000")};cursor:pointer;filter:saturate(.35) brightness(.7);transition:filter .3s steps(3)}
#dm-btn.ok{filter:none;animation:dmPulse 1.4s steps(2) infinite}
#dm-btn:hover,#dm-btn:focus-visible{outline:none;background:#ffd062}
#dm-btn:active{transform:translateY(3px)}
#dm-btn i{font-style:normal;display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;font:14px NeoDunggeunmo,monospace;color:#9cff8a;background:#1a1008;
 box-shadow:0 -2px 0 0 #1a1008,0 2px 0 0 #1a1008,-2px 0 0 0 #1a1008,2px 0 0 0 #1a1008}
#dm-hint{margin:14px 8px 0;font-size:11px;letter-spacing:1px;color:#7a6c52}
#dm-items{margin:16px 8px 0;padding:8px 10px;background:#100a09;box-shadow:${px("#3a2a1a", "#080504")}}
#dm-items h4{margin:0 0 6px;font-weight:normal;font-size:11px;letter-spacing:3px;color:#9a8a6a;text-transform:uppercase}
#dm-items ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px 8px;max-height:96px;overflow:auto}
#dm-items li{display:flex;align-items:center;gap:6px;padding:3px 8px 3px 4px;background:#1a1210;font-size:12px;box-shadow:inset 0 0 0 1px #2e2016}
#dm-items li img{width:20px;height:20px;image-rendering:pixelated}
#dm-items li.lost{text-decoration:line-through;text-decoration-color:#e05a4a;opacity:.85}
#dm-items .none{font-size:12px;color:#7a6c52}
#dm-ov.win #dm-tit{color:#8fd0ff;text-shadow:4px 4px 0 #0a2448,8px 8px 0 #030a16,0 0 26px rgba(90,170,255,.35)}
#dm-ov.win #dm-glow{background:radial-gradient(ellipse at center,rgba(70,140,255,.5),rgba(20,60,140,.18) 45%,transparent 70%)}
#dm-ov.win #dm-btn{background:#8fd0ff;box-shadow:inset 0 -5px 0 0 #3a78b8,inset 0 4px 0 0 #d8f0ff,${px("#071a33", "#000")};color:#071a33}
#dm-ov.win #dm-btn.ok{animation:dmPulseB 1.4s steps(2) infinite}
@keyframes dmPulseB{50%{background:#b8e2ff}}
@keyframes dmZoom{from{transform:scale(1)}to{transform:scale(1.12)}}
@keyframes dmBob{from{transform:translateY(0)}to{transform:translateY(-8px)}}
@keyframes dmGlow{from{opacity:.6}to{opacity:1}}
@keyframes dmDrop{60%{opacity:1;transform:translateY(4px)}100%{opacity:1;transform:none}}
@keyframes dmBlink{50%{opacity:0}}
@keyframes dmPulse{50%{background:#ffd062}}
@media (max-width:980px),(max-height:620px){#dm-emb{width:192px;height:192px}#dm-wrap{gap:22px}#dm-say{margin-top:14px}#dm-st{margin-top:16px}#dm-keep{margin-top:12px}#dm-btn{margin-top:16px}#dm-por{flex-basis:64px;width:64px;height:64px}#dm-msg{font-size:13px;min-height:3.2em}}
@media (max-width:720px){#dm-wrap{flex-direction:column;justify-content:center;gap:6px;overflow:auto}#dm-emb{width:128px;height:128px}#dm-right{flex:0 0 auto;width:100%}#dm-tit,#dm-sub{text-align:center}#dm-st{gap:10px}#dm-st b{font-size:20px}}
`;
  document.head.appendChild(st);
}
/* cinzas e brasas quadradas subindo (resolução baixa, ampliada sem suavizar) */
function __dmEmbers(cv, blue) {
  const g = cv.getContext("2d"), P = [];
  let W = 0, H = 0, run = !0;
  const fit = () => { W = cv.width = Math.ceil(innerWidth / 4); H = cv.height = Math.ceil(innerHeight / 4) };
  fit(); addEventListener("resize", fit);
  for (let k = 0; k < 70; k++) P.push({ x: Math.random() * W, y: Math.random() * H, v: .08 + Math.random() * .25, w: Math.random() * 6.28, e: Math.random() < .45, s: Math.random() < .15 ? 2 : 1 });
  const step = () => {
    if (!run) return;
    g.clearRect(0, 0, W, H);
    for (const p of P) {
      p.y -= p.v; p.w += .02; p.x += Math.sin(p.w) * .12;
      if (p.y < -4) { p.y = H + 4; p.x = Math.random() * W }
      const a = Math.max(0, Math.min(1, p.y / H * 1.3));
      g.fillStyle = p.e ? (blue ? `rgba(${90 + (p.w * 40 % 80) | 0},170,255,${a})` : `rgba(255,${90 + (p.w * 40 % 80) | 0},40,${a})`) : `rgba(170,150,140,${a * .5})`;
      g.fillRect(p.x | 0, p.y | 0, p.s, p.s);
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  return () => { run = !1; removeEventListener("resize", fit) };
}
/* ícone do item tirado da textura do Phaser (quando der) */
function __dmIcon(S, it) {
  try {
    const k = it?.icon || it?.def?.icon; if (!k || !S?.textures?.exists?.(k)) return "";
    return S.textures.getBase64(k) || "";
  } catch (e) { return "" }
}
function __dmItemName(it) { try { return _t(it) || it.name || it.id } catch (e) { return it?.name || it?.id || "?" } }
function __dmItemCol(it) { try { return "#" + (bt[it.rarity]?.color ?? 0xd8cdb4).toString(16).padStart(6, "0") } catch (e) { return "#d8cdb4" } }
/* monta a tela (o = { S, cls, bg, bgFilter, emblem, title, sub, rec, msg, stats:[[valor,rótulo,numérico]], lines:[[classe,ícone,html]],
   items:{title, list, lost, none}, btn, hint, onGo }) */
function __dmScreen(o) {
  const S = o.S, g = S.game;
  if (document.getElementById("dm-ov")) return;
  __dmCss();
  const ov = document.createElement("div"); ov.id = "dm-ov"; o.cls && ov.classList.add(o.cls);
  const msg = o.msg || "";
  const it = o.items;
  const itemsHtml = it ? `<div id="dm-items"><h4>${it.title}</h4>${it.list.length ? `<ul>${it.list.slice(0, 24).map((x) => { const ic = __dmIcon(S, x); return `<li class="${it.lost ? "lost" : ""}">${ic ? `<img alt="" src="${ic}">` : ""}<span style="color:${__dmItemCol(x)}">${__dmItemName(x)}</span></li>` }).join("")}${it.list.length > 24 ? `<li>+${it.list.length - 24}</li>` : ""}</ul>` : `<div class="none">${it.none}</div>`}</div>` : "";
  ov.innerHTML = `<div id="dm-bg" style="background-image:url('${o.bg}');${o.bgFilter ? "filter:" + o.bgFilter : ""}"></div><canvas id="dm-fx"></canvas><div id="dm-vig"></div>
  <div id="dm-wrap" role="dialog" aria-modal="true" aria-label="${o.title}">
   <div id="dm-left"><div id="dm-glow"></div><img id="dm-emb" alt="" src="${o.emblem}"></div>
   <div id="dm-right">
    <h1 id="dm-tit"${o.title.length > 11 ? ' style="font-size:clamp(30px,4vw,48px);white-space:normal;line-height:1.15"' : ""}>${(() => { let n = 0; return o.title.split(" ").map((w) => `<em style="display:inline-block;white-space:nowrap;font-style:normal">${[...w].map((c) => `<span style="animation-delay:${(.25 + (n++) * .06).toFixed(2)}s">${c}</span>`).join("")}</em>`).join(" ") })()}</h1>
    <div id="dm-sub">${o.sub || ""}</div>
    <div id="dm-rec">★ ${o.rec || __dmL("NOVO RECORDE", "NEW RECORD", "NUEVO RÉCORD")} ★</div>
    ${msg ? `<div id="dm-say"><img id="dm-por" alt="" src="./assets/pixel-art/story/guardia-p-${o.face || "sadness"}.png"><div><div id="dm-nm">${__dmL("A GUARDIÃ", "THE GUARDIAN", "LA GUARDIANA")}</div><div id="dm-msg"></div></div></div>` : ""}
    <div id="dm-st" style="grid-template-columns:repeat(${o.stats.length},1fr)">${o.stats.map(([v, l, num]) => `<div><b ${num ? `data-n="${v}"` : ""}>${num ? 0 : v}</b><span>${l}</span></div>`).join("")}</div>
    ${itemsHtml}
    <div id="dm-keep">${(o.lines || []).map(([c, ic, h]) => `<p><i class="${c}">${ic}</i><span class="${c}">${h}</span></p>`).join("")}</div>
    <button id="dm-btn" type="button"><i>A</i>${o.btn || __dmL("IR PARA O REFÚGIO", "GO TO THE REFUGE", "IR AL REFUGIO")}</button>
    <div id="dm-hint">${__dmL("A ou START no controle · Enter no teclado · ou toque no botão", "A or START on the controller · Enter on the keyboard · or tap the button", "A o START en el mando · Enter en el teclado · o toca el botón")}</div>
   </div>
  </div>`;
  document.body.appendChild(ov);
  o.showRec && (ov.querySelector("#dm-rec").style.display = "block");
  const stopFx = __dmEmbers(ov.querySelector("#dm-fx"), o.cls === "win");
  requestAnimationFrame(() => ov.classList.add("on"));
  window.__padUI = (window.__padUI || 0) + 1;
  const mEl = ov.querySelector("#dm-msg"); let mi = 0;
  const typer = mEl ? setInterval(() => { mi += 2; mEl.textContent = msg.slice(0, mi); mi >= msg.length && clearInterval(typer) }, 28) : 0;
  msg && setTimeout(() => { try { window.__dubHas?.(msg) && window.__dub?.(msg) } catch (x) {} }, 900);
  const t0 = performance.now() + 700, nums = [...ov.querySelectorAll("#dm-st b[data-n]")];
  const count = () => { const k = Math.min(1, Math.max(0, (performance.now() - t0) / 1100)), q = 1 - (1 - k) ** 3; for (const b of nums) b.textContent = Math.round(+b.dataset.n * q).toLocaleString("pt-BR"); k < 1 && document.body.contains(ov) && requestAnimationFrame(count) };
  requestAnimationFrame(count);
  const btn = ov.querySelector("#dm-btn");
  let ready = !1, gone = !1, pv = !0;
  setTimeout(() => { ready = !0; btn.classList.add("ok"); try { btn.focus({ preventScroll: !0 }) } catch (x) {} }, 1200);
  const go = () => {
    if (!ready || gone) return; gone = !0;
    try { g.audioEngine?.sfx?.("sfx-ui-confirm") } catch (x) {}
    try { window.__dubStop?.() } catch (x) {}
    window.removeEventListener("keydown", kd, !0); clearInterval(pad); typer && clearInterval(typer);
    window.__padUI = Math.max(0, (window.__padUI || 0) - 1);
    try { const im = g.inputManager; im && (im.padButtons = [], im.keysDown?.clear?.(), im.keyPressedBuffer?.clear?.()) } catch (x) {}
    // p216.112: a tecla que confirmou (Enter/Espaço/E/Esc, às vezes segurada) não pode vazar para o Refúgio que está
    // abrindo — lá ela interagia/abria painel no primeiro quadro e o herói ficava preso até apertar START.
    const swallow = (ev) => { if (["Enter", " ", "e", "E", "Escape"].includes(ev.key)) { ev.preventDefault(); ev.stopImmediatePropagation() } };
    window.addEventListener("keydown", swallow, !0); window.addEventListener("keyup", swallow, !0);
    setTimeout(() => { window.removeEventListener("keydown", swallow, !0); window.removeEventListener("keyup", swallow, !0); try { g.inputManager?.keysDown?.clear?.() } catch (x) {} }, 1600);
    ov.classList.remove("on"); setTimeout(() => { stopFx(); ov.remove() }, 1150);
    try { o.onGo() } catch (x) { console.warn("[tela]", x); try { g.scene.start("Hub") } catch (y) {} }
    // garantia: se em 6 s o Refúgio não abriu, abre direto
    setTimeout(() => { try { const H = g.scene.getScene("Hub"); if (!H?.sys?.isActive?.()) { __dmHubReg(g, o.S); g.scene.getScenes(!0).forEach((q) => { const k = q.sys.settings.key; k !== "LazyMaps" && g.scene.stop(k) }); g.scene.start("Hub") } } catch (x) {} }, 6000);
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

/* morte no Modo Infinito */
function __deathScreen(S, t) {
  const g = S.game, e = t?.entry || {}, info = S.__deathInfo || {};
  const depth = info.depth || e.depth || 1;
  let biome = "";
  try { biome = St(`lvl.${S.levelId}`, S.level?.name || "") || "" } catch (x) { biome = S.level?.name || "" }
  biome = /^endless-/i.test(biome) ? "" : String(biome).replace(/^\s*prof(undidade|\.)?\s*\d+\s*·\s*/i, "");
  const bk = String(S.level?.biome || S.level?.themeId || S.level?.theme?.id || S.levelId || "").toLowerCase();
  let vis = "catacombs"; for (const k in __DM_VIS) if (bk.includes(k)) { vis = __DM_VIS[k]; break }
  const broke = info.broke || 0;
  __dmScreen({ S, bg: `./assets/pixel-art/story/vis-${vis}.jpg`, emblem: "./assets/pixel-art/ui/tela-morte/emblema.png",
    title: __dmL("VOCÊ CAIU", "YOU FELL", "HAS CAÍDO"),
    sub: `${__dmL("Profundidade", "Depth", "Profundidad")} <b>${depth}</b>${biome ? " · " + biome : ""}`, showRec: !!t?.newRecord,
    msg: __dmL(...__DM_MSG[Math.floor(Math.random() * __DM_MSG.length)]),
    stats: [[e.roomsCleared ?? 0, __dmL("Salas", "Rooms", "Salas"), 1], [e.score ?? 0, __dmL("Pontos", "Score", "Puntos"), 1], [e.enemiesKilled ?? 0, __dmL("Abates", "Kills", "Bajas"), 1], [__dmTime(e.elapsedMs), __dmL("Tempo", "Time", "Tiempo")]],
    lines: [["g", "●", `${__dmL("Volta com você", "You keep", "Vuelve contigo")}: ${info.gold ?? 0} ${__dmL("de ouro", "gold", "de oro")}, ${__dmL("a arma inicial e as peças do ferreiro", "your starting weapon and blacksmith pieces", "el arma inicial y las piezas del herrero")}`],
      ["x", "✖", __dmL("Fica no Abismo: nível do herói, itens achados e pactos", "Left in the Abyss: hero level, found items and pacts", "Se queda en el Abismo: nivel del héroe, objetos y pactos")],
      ...(broke ? [["k", "⚒", `${broke} ${__dmL("peça(s) do ferreiro quebraram — conserte na forja", "blacksmith piece(s) broke — repair them at the forge", "pieza(s) del herrero se rompieron — repáralas en la forja")}`]] : [])],
    onGo: () => {
      if (S.sys?.isActive?.()) S.onRestart();
      else { __dmHubReg(g, S); g.scene.getScenes(!0).forEach((q) => { const k = q.sys.settings.key; k !== "LazyMaps" && g.scene.stop(k) }); g.scene.start("Hub") }
    } });
}
window.__deathScreen = __deathScreen;
/* p216.112: quando a volta normal (onRestart) não acontece e o Refúgio é aberto "na marra", deixa o registro igual ao
   da volta normal — senão o Refúgio abria sem saber qual espaço do Infinito era o do herói. */
function __dmHubReg(g, S) {
  try {
    const R = g.registry; if (R.get("mode") !== "endless") return;
    const sl = R.get("save:slot") || 1, sv = typeof Nn === "function" ? Nn(sl) : null;
    R.set("hub:endlessSlot", sl); R.remove("hub:fromForest");
    const cls = sv?.ok ? sv.data.player.classId : S?.classDef?.id; cls && R.set("hub:classId", cls);
  } catch (e) {}
}

/* Cavernas da Montanha Dorf (p216.89): queda (perde metade da Pedra Cobalto e os itens achados lá dentro) e volta
   vitoriosa pelo portal (tudo o que juntou). r = { fell, runStone, lostStone, total, found, onGo } */
const __CV_FELL = [
  ["Você caiu, herói. Eu te trouxe de volta para se recuperar — mas a caverna ficou com parte do que você juntou.",
   "You fell, hero. I brought you back to recover — but the cave kept part of what you gathered.",
   "Caíste, héroe. Te traje de vuelta para que te recuperes — pero la caverna se quedó con parte de lo que juntaste."],
  ["As profundezas de Dorf não perdoam. Descanse no Refúgio; o cobalto que ficou lá embaixo ainda pode ser seu.",
   "The depths of Dorf show no mercy. Rest at the Refuge; the cobalt left down there can still be yours.",
   "Las profundidades de Dorf no perdonan. Descansa en el Refugio; el cobalto que quedó allá abajo aún puede ser tuyo."],
];
const __CV_WIN = [
  ["Que bela colheita! O ferreiro vai ficar feliz com essa Pedra Cobalto.",
   "What a haul! The blacksmith will be glad to see this Cobalt Stone.",
   "¡Qué buena cosecha! El herrero se alegrará con esta Piedra Cobalto."],
  ["Você voltou inteiro e com os bolsos cheios. A forja do Refúgio espera por você.",
   "You came back in one piece and with full pockets. The Refuge forge awaits.",
   "Volviste entero y con los bolsillos llenos. La forja del Refugio te espera."],
];
function __caveScreen(S, r) {
  const fell = !!r.fell, kept = Math.max(0, (r.runStone | 0) - (r.lostStone | 0)), pick = (a) => __dmL(...a[Math.floor(Math.random() * a.length)]);
  const CO = __dmL("Pedra Cobalto", "Cobalt Stone", "Piedra Cobalto");
  __dmScreen({ S, cls: fell ? "" : "win", bg: "./assets/pixel-art/ui/tela-morte/caverna-fundo.png",
    bgFilter: fell ? "grayscale(.6) contrast(1.1) brightness(.4) sepia(.6) hue-rotate(-30deg) saturate(1.6)" : "brightness(.5) contrast(1.05) saturate(1.1)",
    emblem: `./assets/pixel-art/ui/tela-morte/${fell ? "caverna-queda" : "caverna-volta"}.png`,
    title: fell ? __dmL("VOCÊ CAIU", "YOU FELL", "HAS CAÍDO") : __dmL("DE VOLTA AO REFÚGIO", "BACK TO THE REFUGE", "DE VUELTA AL REFUGIO"),
    sub: __dmL("Cavernas da Montanha Dorf", "Dorf Mountain Caves", "Cavernas de la Montaña Dorf"),
    face: fell ? "sadness" : "smile",
    msg: fell ? pick(__CV_FELL) : pick(__CV_WIN),
    stats: fell
      ? [[r.runStone | 0, __dmL("Juntou", "Gathered", "Juntó"), 1], [r.lostStone | 0, __dmL("Perdeu", "Lost", "Perdió"), 1], [kept, __dmL("Ficou", "Kept", "Quedó"), 1], [r.total | 0, __dmL("Saldo ◆", "Total ◆", "Saldo ◆"), 1]]
      : [[r.runStone | 0, __dmL("◆ Trazidas", "◆ Brought", "◆ Traídas"), 1], [r.found.length, __dmL("Itens", "Items", "Objetos"), 1], [r.total | 0, __dmL("Saldo ◆", "Total ◆", "Saldo ◆"), 1]],
    items: fell
      ? { title: __dmL("Itens perdidos na queda", "Items lost in the fall", "Objetos perdidos en la caída"), list: r.found, lost: !0, none: __dmL("Nenhum item achado na caverna foi perdido.", "No item found in the cave was lost.", "Ningún objeto hallado en la caverna se perdió.") }
      : { title: __dmL("Itens encontrados", "Items found", "Objetos encontrados"), list: r.found, none: __dmL("Nenhum item novo desta vez.", "No new items this time.", "Ningún objeto nuevo esta vez.") },
    lines: fell
      ? [["x", "◆", `${__dmL("Metade da", "Half of the", "La mitad de la")} ${CO} ${__dmL("ficou caída na caverna", "was left in the cave", "quedó en la caverna")} (−${r.lostStone | 0})`],
         ["g", "●", __dmL("Seu ouro, o equipamento que você já tinha e o resto da Pedra Cobalto voltam com você", "Your gold, the gear you already had and the rest of the Cobalt Stone come back with you", "Tu oro, el equipo que ya tenías y el resto de la Piedra Cobalto vuelven contigo")]]
      : [["k", "◆", `+${r.runStone | 0} ${CO} ${__dmL("guardadas para a forja do Refúgio", "stored for the Refuge forge", "guardadas para la forja del Refugio")}`]],
    btn: __dmL("IR PARA O REFÚGIO", "GO TO THE REFUGE", "IR AL REFUGIO"),
    onGo: r.onGo });
}
window.__caveScreen = __caveScreen;

/* o que o herói tinha ao entrar na caverna (para saber o que foi achado lá dentro) */
{
 const C0 = Sd.prototype.create;
 Sd.prototype.create = function () {
  const r = C0.apply(this, arguments), S = this;
  try {
   S.__dorfBase = null;
   const snap = () => { try { if (!S.isDorfCave || S.__dorfBase || !S.inventory) return; const inv = S.inventory; S.__dorfBase = { items: new Set([...inv.items, ...Object.values(inv.equipment)].filter(Boolean)), eq: { ...inv.equipment } } } catch (e) {} };
   setTimeout(snap, 900); setTimeout(snap, 2500);
  } catch (e) {}
  return r;
 };
}

/* ══ Portal do Refúgio direto para a corrida (p216.89) ══
   Sem save do Infinito ligado ao Refúgio (ex.: voltou da caverna, ou o registro perdeu o espaço), o portal levava à
   escolha de heróis e depois carregava de novo. Agora: acha o save do espaço atual e continua por ele; se não houver
   save, começa uma corrida nova direto com o herói que está no Refúgio. */
{
 const EP0 = Fl.prototype.enterPortal;
 Fl.prototype.enterPortal = function () {
  try {
   if (this.fromForest) return EP0.apply(this, arguments);
   const R = this.game.registry, sl = R.get("hub:endlessSlot") || R.get("save:slot") || 1;
   const sv = typeof Nn === "function" ? Nn(sl) : null;
   if (sv?.ok) { R.set("hub:endlessSlot", sl); return EP0.apply(this, arguments) }
   const cls = String(R.get("hub:classId") || window.__heroCls || "").toUpperCase();
   if (!cls || typeof pe === "undefined" || !pe[cls]) return EP0.apply(this, arguments);
   R.set("mode", "endless"); R.set("save:slot", sl); R.set("hub:endlessSlot", sl);
   R.remove("endless:run"); R.set("endless:coop", !1); R.remove("endless:netRole");
   this.game.audioEngine?.sfx("sfx-endless-start");
   this.cameras.main.fadeOut(500, 0, 0, 0);
   this.cameras.main.once("camerafadeoutcomplete", () => this.scene.start("Game", { endless: !0, classId: cls }));
  } catch (e) { console.warn("[portal]", e); return EP0.apply(this, arguments) }
 };
}

/* ══ Cópia de segurança dos saves do Modo Infinito (p216.112) ══
   Cada gravação de "dungeon-crawler:save:eN" também vai para "dg-bak:eN" (chave só deste aparelho, fora da nuvem).
   Apagar o espaço pelo menu (lixeira) apaga a cópia junto. Se ao abrir o menu principal o espaço estiver vazio mas a
   cópia existir — e nenhum download da nuvem tiver acontecido depois dela —, o save volta da cópia. */
{
  const SP = Storage.prototype, S0 = SP.setItem, D0 = SP.removeItem, RX = /^dungeon-crawler:save:e(\d)$/;
  SP.setItem = function (k, v) {
    const r = S0.apply(this, arguments);
    try { const m = this === window.localStorage && typeof k === "string" && k.match(RX); if (m) { const d = JSON.parse(v); d?.player?.classId && d?.run?.seed && S0.call(this, "dg-bak:e" + m[1], JSON.stringify({ t: Date.now(), v })) } } catch (e) {}
    return r;
  };
  SP.removeItem = function (k) {
    const r = D0.apply(this, arguments);
    try { const m = this === window.localStorage && typeof k === "string" && k.match(RX); m && D0.call(this, "dg-bak:e" + m[1]) } catch (e) {}
    return r;
  };
  const hookCloud = () => { try { const C = window.DGSave; if (C && !C.__bakH) { const A0 = C.apply; C.apply = function () { try { S0.call(localStorage, "dg-bak:cloudAt", String(Date.now())) } catch (e) {} return A0.apply(this, arguments) }; C.__bakH = 1 } } catch (e) {} };
  hookCloud(); setTimeout(hookCloud, 3000);
  window.__endBakRestore = function () {
    hookCloud();
    const cAt = +(localStorage.getItem("dg-bak:cloudAt") || 0), out = [];
    for (let n = 1; n <= 4; n++) {
      try {
        const k = "dungeon-crawler:save:e" + n; if (localStorage.getItem(k)) continue;
        const b = JSON.parse(localStorage.getItem("dg-bak:e" + n) || "null"); if (!b?.v || b.t < cAt) continue;
        const d = JSON.parse(b.v); if (!d?.player?.classId || !d?.run?.seed) continue;
        S0.call(localStorage, k, b.v); out.push(n);
        console.warn("[DEPTHGATE] save do Infinito " + n + " estava vazio — recuperado da cópia de segurança");
        try { typeof __atLog === "function" && __atLog("save do Infinito " + n + " recuperado da cópia", { message: "slot vazio ao abrir o menu" }) } catch (e) {}
      } catch (e) {}
    }
    return out;
  };
  const C0 = $o.prototype.create;
  $o.prototype.create = function () { try { window.__endBakRestore() } catch (e) {} return C0.apply(this, arguments) };
}
