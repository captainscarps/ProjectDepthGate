/* ── Desempenho do áudio sintetizado (Tone.js) ──────────────────────────────────────────
   Os sons "viscerais" disparavam MembraneSynth/MetalSynth/NoiseSynth sem passar pelo limite
   de vozes do jogo: em luta de chefe isso criava ~130 nós de áudio por segundo e travava
   (principalmente no celular). Aqui:
   - cada sintetizador tem intervalo mínimo entre disparos + teto global por segundo;
   - o "clang" metálico (MetalSynth, o mais caro) vira um som nativo barato com limite de vozes;
   - respeita mudo / volume de efeitos / aba em segundo plano.                              */
(function () {
  const AA = window.__advancedAudio;
  if (!AA || AA.__perf) return;
  AA.__perf = !0;
  const GAP = { membrane: .085, noise: .065 };
  const last = { membrane: 0, noise: 0 };
  let win = 0, used = 0;
  const MAX_PER_SEC = 9;
  const eng = () => window.__DED_GAME?.audioEngine;
  const now = () => (window.Tone?.now ? window.Tone.now() : performance.now() / 1e3);
  function allow(kind) {
    const e = eng();
    if (document.visibilityState === "hidden") return !1;
    if (e && (e.muted || e.sfxVolume <= .01 || e.masterVolume <= .01)) return !1;
    const t = now();
    if (t - last[kind] < GAP[kind]) return !1;
    if (t - win >= 1) { win = t; used = 0 }
    if (used >= MAX_PER_SEC) return !1;
    used++; last[kind] = t;
    // volume do Tone acompanha os controles do jogo
    try {
      const v = e ? Math.max(.0001, (e.sfxVolume ?? 1) * (e.masterVolume ?? 1)) : 1;
      const db = 20 * Math.log10(v);
      if (AA.synths.membrane) AA.synths.membrane.volume.value = -6 + db;
      if (AA.synths.noise) AA.synths.noise.volume.value = -9 + db;
    } catch (err) { }
    return !0;
  }
  const trig = (kind, ...a) => {
    try {
      if (!AA.toneReady) AA.unlock();
      const s = AA.synths[kind];
      if (s && allow(kind)) s.triggerAttackRelease(...a);
    } catch (err) { }
  };
  // clang metálico nativo: 2 parciais inarmônicos + chiado agudo (≈7 nós, com limite de vozes)
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const hz = n => { const m = /^([A-G])(#?)(\d)$/.exec(n || "C3"); if (!m) return 260; return 440 * Math.pow(2, (NOTE[m[1]] + (m[2] ? 1 : 0) - 9) / 12 + (+m[3] - 4)) };
  let lastClang = 0;
  function clang(note) {
    const e = eng();
    if (!e || !e.ready) return;
    const t = performance.now();
    if (t - lastClang < 70) return;
    lastClang = t;
    const f = Math.min(2400, Math.max(180, hz(note)));
    e.tone({ type: "square", freq: f * 2.76, freqEnd: f * 2.6, duration: .07, gain: .045, priority: 0 });
    e.tone({ type: "triangle", freq: f * 5.4, duration: .05, gain: .03, priority: 0 });
    e.noiseHit({ duration: .05, filter: "highpass", freq: 4200, gain: .05, priority: 0 });
  }
  AA.playMembraneThud = function (note, duration = "16n") { trig("membrane", "C1", duration) };
  AA.playMetalClang = function (note = "D4") { clang(note) };
  AA.playMonsterRoar = function () { trig("membrane", "A0", "8n"); trig("noise", "16n") };
  AA.playVocalTone = function () { trig("noise", "32n"); trig("membrane", "C1", "32n") };
  AA.playSpectralChime = function (notes, duration = "8n") { trig("noise", duration) };
  AA.playNoiseBurst = function (duration = "32n") { trig("noise", duration) };
  // o MetalSynth não é mais usado: um marcador vazio impede que ele seja criado
  if (!AA.synths.metal) AA.synths.metal = { triggerAttackRelease() { }, volume: { value: 0 }, __stub: !0 };
})();
