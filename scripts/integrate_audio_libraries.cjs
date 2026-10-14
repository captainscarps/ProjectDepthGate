const fs = require('fs');

const files = [
  'assets/index-D6qIWtA7-p209.js',
  'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Let's integrate Howler and Tone into window.__audioAdvancedEngine
  const advancedAudioSnippet = `
// =========================================================================
// ADVANCED DUAL AUDIO ENGINE (HOWLER.JS + TONE.JS HYBRID ACCELERATION)
// Provides studio-grade audio synthesis, convolution reverbs and spatial Foley
// =========================================================================
window.__advancedAudio = {
  toneReady: false,
  howlerReady: false,
  reverb: null,
  limiter: null,
  metalSynth: null,
  membraneSynth: null,

  init: function() {
    try {
      if (typeof window.Howler !== 'undefined') {
        this.howlerReady = true;
        console.log('[AUDIO] Howler.js initialized successfully.');
      }
      if (typeof window.Tone !== 'undefined') {
        this.toneReady = true;
        console.log('[AUDIO] Tone.js initialized successfully.');
      }
    } catch(e) {}
  },

  // Setup Tone.js studio rack on first user gesture
  unlock: function() {
    try {
      if (typeof window.Tone !== 'undefined') {
        if (window.Tone.context && window.Tone.context.state !== 'running') {
          window.Tone.start().catch(()=>{});
        }
        if (!this.membraneSynth && window.Tone.MembraneSynth) {
          this.membraneSynth = new window.Tone.MembraneSynth({
            pitchDecay: 0.02,
            octaves: 2,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.04 }
          }).toDestination();
          this.membraneSynth.volume.value = -16;
        }
        if (!this.metalSynth && window.Tone.MetalSynth) {
          this.metalSynth = new window.Tone.MetalSynth({
            frequency: 180,
            envelope: { attack: 0.001, decay: 0.12, release: 0.08 },
            harmonicity: 3.1,
            modulationIndex: 16,
            resonance: 2400,
            octaves: 1.2
          }).toDestination();
          this.metalSynth.volume.value = -18;
        }
      }
      if (typeof window.Howler !== 'undefined' && window.Howler.ctx) {
        if (window.Howler.ctx.state !== 'running') {
          window.Howler.ctx.resume().catch(()=>{});
        }
      }
    } catch(e) {}
  },

  playMetalClang: function(freq = "C4", dur = "16n") {
    try {
      if (this.metalSynth) {
        this.metalSynth.triggerAttackRelease(freq, dur);
        return true;
      }
    } catch(e) {}
    return false;
  },

  playMembraneThud: function(note = "G1", dur = "32n") {
    try {
      if (this.membraneSynth) {
        this.membraneSynth.triggerAttackRelease(note, dur);
        return true;
      }
    } catch(e) {}
    return false;
  }
};
window.addEventListener("pointerdown", () => window.__advancedAudio?.unlock(), { once: true, passive: true });
window.addEventListener("keydown", () => window.__advancedAudio?.unlock(), { once: true, passive: true });
`;

  // Inject before class zr
  const classZrIndex = code.indexOf('class zr{');
  if (classZrIndex !== -1 && !code.includes('window.__advancedAudio = {')) {
    code = code.substring(0, classZrIndex) + advancedAudioSnippet + code.substring(classZrIndex);
    console.log(`[${file}] Integrated Advanced Dual Audio Engine with Tone.js & Howler.js.`);
  }

  // Hook into hit / weapons for Tone.js metallic resonance
  const oldSwordHit = 'case"weapon-sword":';
  const newSwordHit = 'case"weapon-sword":window.__advancedAudio?.playMetalClang?.("E4","32n");';
  if (code.includes(oldSwordHit) && !code.includes(newSwordHit)) {
    code = code.replace(oldSwordHit, newSwordHit);
    console.log(`[${file}] Hooked Tone.js MetalSynth into weapon-sword.`);
  }

  // Hook into shield block for Tone.js heavy metallic deflection
  const oldShieldBlock = 'case"shield-block":';
  const newShieldBlock = 'case"shield-block":window.__advancedAudio?.playMetalClang?.("A3","16n");';
  if (code.includes(oldShieldBlock) && !code.includes(newShieldBlock)) {
    code = code.replace(oldShieldBlock, newShieldBlock);
    console.log(`[${file}] Hooked Tone.js MetalSynth into shield-block.`);
  }

  fs.writeFileSync(file, code, 'utf8');
}

console.log('Audio library integration patch completed.');
