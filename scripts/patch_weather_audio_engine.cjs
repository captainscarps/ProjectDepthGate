const fs = require('fs');

const files = [
  'assets/index-D6qIWtA7-p209.js',
  'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
];

// New refined, soft and realistic WeatherAudio implementation
const newWeatherAudioCode = `  // -----------------------------------------------------------------------
  // PROCEDURAL WEB AUDIO SYNTHESIS FOR WEATHER (SOFT RAIN, DEEP THUNDER, ORGANIC WIND)
  // Connects directly to AudioEngine ambientBus / respects Climatic Effects volume slider
  // -----------------------------------------------------------------------
  const WeatherAudio = {
    rainNode: null,
    rainGain: null,
    rainLfo: null,
    windNode: null,
    windGain: null,
    windLfo: null,

    getAudioEngine: function(scene) {
      try {
        return scene?.game?.audioEngine || window.__game?.audioEngine || window.__DED_GAME?.audioEngine || null;
      } catch(e) { return null; }
    },

    getOutputNode: function(scene) {
      try {
        const ae = this.getAudioEngine(scene);
        if (ae && ae.ready && ae.ambientBus) return ae.ambientBus;
        const ctx = this.getCtx(scene);
        return ctx ? ctx.destination : null;
      } catch(e) { return null; }
    },

    getCtx: function(scene) {
      try {
        const ae = this.getAudioEngine(scene);
        if (ae && ae.ctx) return ae.ctx;
        return scene?.sound?.context || window.__DED_GAME?.sound?.context || (window.AudioContext && new window.AudioContext());
      } catch(e) { return null; }
    },

    getVolumeScale: function(scene) {
      try {
        const ae = this.getAudioEngine(scene);
        if (ae && typeof ae.ambientVolume === 'number') {
          return ae.ambientBus ? 1.0 : Math.max(0, Math.min(1, ae.ambientVolume));
        }
        const s = localStorage.getItem("dungeon-crawler:settings");
        if (s) {
          const cfg = JSON.parse(s);
          if (typeof cfg.ambientVolume === 'number') return Math.max(0, Math.min(1, cfg.ambientVolume));
        }
      } catch(e) {}
      return 0.8;
    },

    startRain: function(scene, intensity = 0.5) {
      try {
        const ctx = this.getCtx(scene);
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume().catch(()=>{});

        // Gentle, pleasant rain volume that sits comfortably behind music (0.04 to 0.09)
        const vScale = this.getVolumeScale(scene);
        const baseTarget = (0.038 + Math.min(intensity, 1.0) * 0.048) * vScale;

        if (this.rainNode) {
          if (this.rainGain) {
            this.rainGain.gain.cancelScheduledValues(ctx.currentTime);
            this.rainGain.gain.linearRampToValueAtTime(baseTarget, ctx.currentTime + 1.2);
          }
          return;
        }

        const bufLen = ctx.sampleRate * 2;
        const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        // Pink-ish weighted smooth noise to avoid sharp digital hiss
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufLen; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99765 * b0 + white * 0.0990460;
          b1 = 0.96300 * b1 + white * 0.2965164;
          b2 = 0.57000 * b2 + white * 1.0526913;
          data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.22;
        }

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        noiseSrc.loop = true;

        // Bandpass centered at warm raindrop range (~580Hz, Q=1.1)
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 580;
        bp.Q.value = 1.1;

        // Warm Lowpass filter cutting harsh frequencies above 880Hz (eliminates TV hiss/chiado)
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 880;

        // Highpass filter cutting sub rumble below 140Hz
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 140;

        // Soft organic LFO for slight wind/rain variance (0.18Hz)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = "sine";
        lfo.frequency.value = 0.18;
        lfoGain.gain.value = 0.015;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(baseTarget, ctx.currentTime + 1.5);

        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        try { lfo.start(0); } catch(e) {}

        const out = this.getOutputNode(scene) || ctx.destination;
        noiseSrc.connect(hp);
        hp.connect(bp);
        bp.connect(lp);
        lp.connect(gain);
        gain.connect(out);
        noiseSrc.start(0);

        this.rainNode = noiseSrc;
        this.rainGain = gain;
        this.rainLfo = lfo;
      } catch(e) {}
    },

    stopRain: function(scene) {
      try {
        const ctx = this.getCtx(scene);
        if (this.rainGain && ctx) {
          this.rainGain.gain.cancelScheduledValues(ctx.currentTime);
          this.rainGain.gain.linearRampToValueAtTime(0.00001, ctx.currentTime + 1.2);
        }
        const node = this.rainNode;
        const lfo = this.rainLfo;
        setTimeout(() => {
          try { node?.stop(); node?.disconnect(); } catch(e) {}
          try { lfo?.stop(); lfo?.disconnect(); } catch(e) {}
        }, 1300);
        this.rainNode = null;
        this.rainGain = null;
        this.rainLfo = null;
      } catch(e) {}
    },

    startWind: function(scene, intensity = 0.5) {
      try {
        const ctx = this.getCtx(scene);
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume().catch(()=>{});

        const vScale = this.getVolumeScale(scene);
        const baseTarget = (0.028 + Math.min(intensity, 1.0) * 0.042) * vScale;

        if (this.windNode) {
          if (this.windGain) {
            this.windGain.gain.cancelScheduledValues(ctx.currentTime);
            this.windGain.gain.linearRampToValueAtTime(baseTarget, ctx.currentTime + 1.5);
          }
          return;
        }

        const bufLen = ctx.sampleRate * 2;
        const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        noiseSrc.loop = true;

        // Bandpass for soft hollow howling wind (340Hz)
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 340;
        bp.Q.value = 2.0;

        // LFO slowly drifting the wind pitch between 240Hz and 460Hz
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.type = "sine";
        lfo.frequency.value = 0.12;
        lfoGain.gain.value = 90;
        lfo.connect(bp.frequency);
        try { lfo.start(0); } catch(e) {}

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(baseTarget, ctx.currentTime + 1.6);

        const out = this.getOutputNode(scene) || ctx.destination;
        noiseSrc.connect(bp);
        bp.connect(gain);
        gain.connect(out);
        noiseSrc.start(0);

        this.windNode = noiseSrc;
        this.windGain = gain;
        this.windLfo = lfo;
      } catch(e) {}
    },

    stopWind: function(scene) {
      try {
        const ctx = this.getCtx(scene);
        if (this.windGain && ctx) {
          this.windGain.gain.cancelScheduledValues(ctx.currentTime);
          this.windGain.gain.linearRampToValueAtTime(0.00001, ctx.currentTime + 1.2);
        }
        const node = this.windNode;
        const lfo = this.windLfo;
        setTimeout(() => {
          try { node?.stop(); node?.disconnect(); } catch(e) {}
          try { lfo?.stop(); lfo?.disconnect(); } catch(e) {}
        }, 1300);
        this.windNode = null;
        this.windGain = null;
        this.windLfo = null;
      } catch(e) {}
    },

    playThunder: function(scene) {
      try {
        const ctx = this.getCtx(scene);
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume().catch(()=>{});

        const out = this.getOutputNode(scene) || ctx.destination;
        const vScale = this.getVolumeScale(scene);
        const t0 = ctx.currentTime;

        // 1. Primary Deep Sub-Bass Rumble (Cinema Grade, 56Hz down to 24Hz)
        const osc1 = ctx.createOscillator();
        const oscGain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(56, t0);
        osc1.frequency.exponentialRampToValueAtTime(24, t0 + 2.2);
        oscGain1.gain.setValueAtTime(0.001, t0);
        oscGain1.gain.linearRampToValueAtTime(0.38 * vScale, t0 + 0.04);
        oscGain1.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.6);
        osc1.connect(oscGain1);
        oscGain1.connect(out);
        osc1.start(t0);
        osc1.stop(t0 + 2.65);

        // 2. Diffused Atmosphere Crack (Lowpassed, eliminates sharp click)
        const noiseLen = Math.floor(ctx.sampleRate * 2.0);
        const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
        const nData = noiseBuf.getChannelData(0);
        for (let i = 0; i < noiseLen; i++) nData[i] = Math.random() * 2 - 1;
        const nSrc = ctx.createBufferSource();
        nSrc.buffer = noiseBuf;

        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.setValueAtTime(320, t0);
        lp.frequency.exponentialRampToValueAtTime(68, t0 + 1.8);

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.001, t0);
        nGain.gain.linearRampToValueAtTime(0.24 * vScale, t0 + 0.03);
        nGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.0);

        nSrc.connect(lp);
        lp.connect(nGain);
        nGain.connect(out);
        nSrc.start(t0);

        // 3. Rolling Secondary Echo (Distortion-free mountain reverberation after 340ms)
        const oscEcho = ctx.createOscillator();
        const echoGain = ctx.createGain();
        oscEcho.type = "triangle";
        oscEcho.frequency.setValueAtTime(42, t0 + 0.34);
        oscEcho.frequency.exponentialRampToValueAtTime(20, t0 + 2.4);
        echoGain.gain.setValueAtTime(0.0001, t0);
        echoGain.gain.setValueAtTime(0.0001, t0 + 0.33);
        echoGain.gain.linearRampToValueAtTime(0.16 * vScale, t0 + 0.42);
        echoGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.5);
        oscEcho.connect(echoGain);
        echoGain.connect(out);
        oscEcho.start(t0 + 0.34);
        oscEcho.stop(t0 + 2.55);
      } catch(e) {}
    },

    stopAll: function(scene) {
      this.stopRain(scene);
      this.stopWind(scene);
    }
  };`;

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Find start of WeatherAudio and end of WeatherAudio
  const startMarker = '// -----------------------------------------------------------------------\n  // PROCEDURAL WEB AUDIO SYNTHESIS FOR WEATHER (RAIN, THUNDER, WIND)';
  const endMarker = 'stopAll: function(scene) {\n      this.stopRain(scene);\n      this.stopWind(scene);\n    }\n  };';

  const startIdx = code.indexOf(startMarker);
  const endIdx = code.indexOf(endMarker, startIdx);

  if (startIdx !== -1 && endIdx !== -1) {
    const fullEndIdx = endIdx + endMarker.length;
    code = code.substring(0, startIdx) + newWeatherAudioCode + code.substring(fullEndIdx);
    fs.writeFileSync(file, code, 'utf8');
    console.log(`[${file}] Successfully replaced WeatherAudio with smooth, realistic, ambient-bus connected audio.`);
  } else {
    console.log(`[${file}] Markers not found! Start: ${startIdx}, End: ${endIdx}`);
  }
}
