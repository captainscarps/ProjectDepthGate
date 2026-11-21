/* ══ Sons ambientes por bioma + música mais baixa (p216.81) ═════════════════════════════════════════════════════════
   • Música: o volume real da música fica em 35% do que a barra de MÚSICA marca (a barra continua funcionando).
   • Cada bioma tem um FUNDO em laço sem emenda e EVENTOS soltos (pássaros, corvos, pingos, rajadas, rangidos…)
     tocados a cada poucos segundos, com volume e posição no estéreo sorteados — tudo no canal AMBIENTE (barra de
     ambiente nas configurações). Sons do ElevenLabs (scripts/gerar_ambientes_elevenlabs.py →
     assets/audio/ambient/bioma/<bioma>-bed.mp3 / -e<n>.mp3 + manifest.json). Troca de bioma faz fade cruzado.
   • Onde já existe o fundo real, os bipes sintetizados antigos do ambiente ficam desligados.
   • Menu, seleção de herói, cenas e o prólogo (que tem o próprio som de rio) param o ambiente.            */
const __AS_DIR = "assets/audio/ambient/bioma/";
const __AS_MUS = .35;
const __AS_ALIAS = { deep: "catacombs", desert: "ruins", crypt: "graveyard", cripta: "graveyard", bruxa: "graveyard", glacial: "frozen", forest_open: "forest" };
/* ritmo e volume de cada bioma: [intervalo mínimo s, máximo s, volume do fundo, volume dos eventos] */
const __AS_MIX = { forest: [3, 8, .8, .55], catacombs: [4, 11, .9, .6], ruins: [5, 12, .8, .5], temple: [4, 10, .85, .55], frozen: [5, 12, .85, .55],
  fortress: [6, 14, .85, .55], bosque: [3, 7, .8, .5], rio: [4, 10, .8, .5], morta: [4, 10, .9, .6], graveyard: [5, 12, .85, .55], vulcao: [5, 12, .9, .55],
  castle: [6, 14, .85, .55], hub: [6, 14, .7, .45] };
const __AS = { man: null, buf: new Map(), cur: null, bed: null, timer: 0, tok: 0 };
function __asMan() {
  if (__AS.man) return Promise.resolve(__AS.man);
  return (__AS.manP ||= fetch(__AS_DIR + "manifest.json").then(r => r.ok ? r.json() : {}).catch(() => ({})).then(m => (__AS.man = m)));
}
function __asLoad(E, f) {
  if (__AS.buf.has(f)) return __AS.buf.get(f);
  const p = fetch(__AS_DIR + f).then(r => { if (!r.ok) throw 0; return r.arrayBuffer() }).then(a => new Promise((ok, ko) => E.ctx.decodeAudioData(a, ok, ko))).catch(() => null);
  __AS.buf.set(f, p); return p;
}
function __asStop(fade = 1.2) {
  __AS.tok++; clearTimeout(__AS.timer); __AS.cur = null;
  const b = __AS.bed; __AS.bed = null;
  if (b) try { const t = b.g.context.currentTime; b.g.gain.cancelScheduledValues(t); b.g.gain.setValueAtTime(b.g.gain.value, t); b.g.gain.linearRampToValueAtTime(0, t + fade); b.s.stop(t + fade + .05) } catch (e) {}
}
function __asPlay(E, biome) {
  const b = __AS_ALIAS[biome] || biome;
  if (!E?.ctx || !E.ambientBus || __AS.cur === b) return;
  __asStop(1.6); __AS.cur = b; const tok = __AS.tok;
  __asMan().then(man => {
    if (tok !== __AS.tok || !(b in man)) return;
    const mix = __AS_MIX[b] || [5, 12, .8, .5];
    __asLoad(E, `${b}-bed.mp3`).then(buf => {
      if (!buf || tok !== __AS.tok) return;
      const ctx = E.ctx, s = ctx.createBufferSource(), g = ctx.createGain(); s.buffer = buf; s.loop = !0;
      s.connect(g); g.connect(E.ambientBus); const t = ctx.currentTime; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(mix[2], t + 2.2);
      s.start(t, Math.random() * Math.max(0, buf.duration - 1)); __AS.bed = { s, g };
    });
    const n = man[b] | 0; for (let i = 0; i < n; i++) __asLoad(E, `${b}-e${i}.mp3`);
    const next = () => {
      if (tok !== __AS.tok) return;
      __AS.timer = setTimeout(() => {
        if (tok !== __AS.tok) return;
        if (document.visibilityState === "visible" && n) {
          const i = Math.floor(Math.random() * n);
          __asLoad(E, `${b}-e${i}.mp3`).then(buf => {
            if (!buf || tok !== __AS.tok) return;
            try {
              const ctx = E.ctx, s = ctx.createBufferSource(), g = ctx.createGain(), p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
              s.buffer = buf; s.playbackRate.value = .94 + Math.random() * .12; g.gain.value = mix[3] * (.55 + Math.random() * .45);
              p ? (p.pan.value = Math.random() * 1.6 - .8, s.connect(p), p.connect(g)) : s.connect(g); g.connect(E.ambientBus); s.start();
            } catch (e) {}
          });
        }
        next();
      }, (mix[0] + Math.random() * (mix[1] - mix[0])) * 1e3);
    };
    next();
  });
}
{
  let done = 0;
  const hook = () => {
    const E = window.__DED_GAME?.audioEngine; if (!E || done) return !!done; done = 1;
    /* música mais baixa: a barra marca o valor, o canal recebe 35% dele */
    const SM = E.setMusicVolume?.bind(E);
    if (SM) { E.setMusicVolume = function (v) { return SM(v * __AS_MUS) }; try { SM((E.musicVolume ?? .385) / .55 * __AS_MUS) } catch (e) {} }   // o original guarda musicVolume = barra × 0,55
    const SA = E.startAmbience?.bind(E);
    if (SA) E.startAmbience = function (i = this.ambienceBiome) { const r = SA(i); try { __asPlay(this, i) } catch (e) {} return r };
    const AE = E.ambientEvents?.bind(E);
    if (AE) E.ambientEvents = function (i) { const b = __AS_ALIAS[i] || i; return __AS.man && b in __AS.man ? [] : AE(i) };
    __asMan();
    return !0;
  };
  const iv = setInterval(() => { try { hook() && clearInterval(iv) } catch (e) {} }, 300);
  /* fora das fases e do Refúgio (menu, seleção, cenas, prólogo com o próprio som de rio) o fundo para */
  setInterval(() => { try { const g = window.__DED_GAME; if (!g?.scene || !__AS.cur) return;
    if (!["Game", "Hub", "Traversal", "ValdrakAntiga"].some(k => g.scene.isActive(k))) __asStop(1.2) } catch (e) {} }, 800);
  /* aba escondida: o fundo continua tocando baixo; ao voltar, nada a fazer (o laço não para) */
}
window.__asPlay = __asPlay; window.__asStop = __asStop; window.__AS = __AS;
