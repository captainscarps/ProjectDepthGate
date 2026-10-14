const fs = require('fs');

const files = [
  'assets/index-D6qIWtA7-p209.js',
  'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // =======================================================================
  // 1. CINEMATIC MULTI-STAGE ROLLING THUNDER
  // =======================================================================
  const oldThunderStart = 'playThunder: function(scene) {';
  const oldThunderEnd = 'playDropPatter: function(scene) {';

  const tStartIdx = code.indexOf(oldThunderStart);
  const tEndIdx = code.indexOf(oldThunderEnd, tStartIdx);

  if (tStartIdx !== -1 && tEndIdx !== -1) {
    const newThunderCode = `playThunder: function(scene) {
      try {
        const ctx = this.getCtx(scene);
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume().catch(()=>{});

        const out = this.getOutputNode(scene) || ctx.destination;
        const vScale = this.getVolumeScale(scene);
        const t0 = ctx.currentTime;

        // 1. Initial Atmospheric Lightning Snap / Tear (Crisp crack traveling through air)
        const snapBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate);
        const snapData = snapBuf.getChannelData(0);
        for (let i = 0; i < snapData.length; i++) snapData[i] = Math.random() * 2 - 1;
        const snapSrc = ctx.createBufferSource();
        snapSrc.buffer = snapBuf;
        const snapFilt = ctx.createBiquadFilter();
        snapFilt.type = "bandpass";
        snapFilt.frequency.setValueAtTime(1200, t0);
        snapFilt.frequency.exponentialRampToValueAtTime(160, t0 + 0.18);
        snapFilt.Q.value = 1.8;
        const snapGain = ctx.createGain();
        snapGain.gain.setValueAtTime(0.001, t0);
        snapGain.gain.linearRampToValueAtTime(0.32 * vScale, t0 + 0.015);
        snapGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.24);
        snapSrc.connect(snapFilt);
        snapFilt.connect(snapGain);
        snapGain.connect(out);
        snapSrc.start(t0);

        // 2. Primary Massive Sub-Bass Pressure Shockwave (48Hz down to 22Hz)
        const osc1 = ctx.createOscillator();
        const oscGain1 = ctx.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(52, t0 + 0.04);
        osc1.frequency.exponentialRampToValueAtTime(22, t0 + 3.2);
        oscGain1.gain.setValueAtTime(0.0001, t0);
        oscGain1.gain.setValueAtTime(0.0001, t0 + 0.04);
        oscGain1.gain.linearRampToValueAtTime(0.44 * vScale, t0 + 0.12);
        oscGain1.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.4);
        osc1.connect(oscGain1);
        oscGain1.connect(out);
        osc1.start(t0 + 0.04);
        osc1.stop(t0 + 3.45);

        // 3. Multi-Path Rolling Thunder Swells (4-second continuous rumbling texture)
        const rollLen = Math.floor(ctx.sampleRate * 4.2);
        const rollBuf = ctx.createBuffer(1, rollLen, ctx.sampleRate);
        const rollData = rollBuf.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < rollLen; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99765 * b0 + white * 0.0990460;
          b1 = 0.96300 * b1 + white * 0.2965164;
          b2 = 0.57000 * b2 + white * 1.0526913;
          rollData[i] = (b0 + b1 + b2 + white * 0.1848) * 0.24;
        }
        const rollSrc = ctx.createBufferSource();
        rollSrc.buffer = rollBuf;

        const rollFilter = ctx.createBiquadFilter();
        rollFilter.type = "lowpass";
        rollFilter.frequency.setValueAtTime(420, t0);
        rollFilter.frequency.exponentialRampToValueAtTime(75, t0 + 3.8);

        const rollGain = ctx.createGain();
        rollGain.gain.setValueAtTime(0.0001, t0);
        rollGain.gain.linearRampToValueAtTime(0.36 * vScale, t0 + 0.14);
        rollGain.gain.linearRampToValueAtTime(0.18 * vScale, t0 + 0.55);
        rollGain.gain.linearRampToValueAtTime(0.28 * vScale, t0 + 0.85);
        rollGain.gain.linearRampToValueAtTime(0.12 * vScale, t0 + 1.45);
        rollGain.gain.linearRampToValueAtTime(0.20 * vScale, t0 + 1.75);
        rollGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 4.2);

        rollSrc.connect(rollFilter);
        rollFilter.connect(rollGain);
        rollGain.connect(out);
        rollSrc.start(t0);

        // 4. Secondary Deep Harmonic Echo (Cave & Valley Resonance at t0 + 0.65s)
        const oscEcho = ctx.createOscillator();
        const echoGain = ctx.createGain();
        oscEcho.type = "triangle";
        oscEcho.frequency.setValueAtTime(38, t0 + 0.65);
        oscEcho.frequency.exponentialRampToValueAtTime(18, t0 + 3.6);
        echoGain.gain.setValueAtTime(0.0001, t0);
        echoGain.gain.setValueAtTime(0.0001, t0 + 0.64);
        echoGain.gain.linearRampToValueAtTime(0.22 * vScale, t0 + 0.88);
        echoGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 3.8);
        oscEcho.connect(echoGain);
        echoGain.connect(out);
        oscEcho.start(t0 + 0.65);
        oscEcho.stop(t0 + 3.85);
      } catch(e) {}
    },

    `;
    code = code.substring(0, tStartIdx) + newThunderCode + code.substring(tEndIdx);
    console.log(`[${file}] Patched cinematic rolling multi-wave thunder.`);
  }

  // =======================================================================
  // 2. SYNCHRONIZED CAMERA TREMOR WITH THUNDER ROLLING WAVES
  // =======================================================================
  const oldCamShake = 'WeatherAudio.playThunder(scene);\n            cam.shake(0.005, 140);';
  const newCamShake = 'WeatherAudio.playThunder(scene);\n            cam.shake(0.007, 240);\n            scene.time.delayedCall(450, () => cam.shake(0.0035, 420));';
  if (code.includes(oldCamShake)) {
    code = code.replace(oldCamShake, newCamShake);
    console.log(`[${file}] Upgraded camera rumble synchronicity with rolling thunder.`);
  }

  // =======================================================================
  // 3. HYPER-REALISTIC BOOT FOOTSTEPS (BIPEDAL L/R ALTERNATION & MASS)
  // =======================================================================
  const oldStepMethod = 'step(i="stone",t=!1){if(!this.ready)return;const e=.88+Math.random()*.24,d=t?1.25:1;switch(i){case"water":this.noiseHit({duration:.08,filter:"bandpass",freq:550*e,q:2.5,gain:.045*d,priority:0}),this.noiseHit({duration:.04,filter:"lowpass",freq:320*e,gain:.035*d,delay:.012,priority:0});break;case"grass":case"moss":this.noiseHit({duration:.045,filter:"bandpass",freq:850*e,q:3.2,gain:.032*d,priority:0}),this.noiseHit({duration:.03,filter:"highpass",freq:1800*e,gain:.018*d,delay:.01,priority:0});break;case"snow":this.noiseHit({duration:.07,filter:"bandpass",freq:1200*e,q:2,gain:.038*d,priority:0}),this.noiseHit({duration:.05,filter:"lowpass",freq:280*e,gain:.025*d,priority:0});break;case"wood":this.noiseHit({duration:.045,filter:"bandpass",freq:420*e,q:4,gain:.048*d,priority:0}),this.tone({type:"triangle",freq:130*e,freqEnd:75,duration:.04,gain:.025*d,priority:0});break;case"volcanic":this.noiseHit({duration:.05,filter:"bandpass",freq:380*e,q:2.5,gain:.045*d,priority:0}),this.noiseHit({duration:.03,filter:"highpass",freq:2200*e,gain:.02*d,priority:0});break;default:this.noiseHit({duration:.045,filter:"bandpass",freq:480*e,q:3.5,gain:.04*d,priority:0}),this.noiseHit({duration:.025,filter:"highpass",freq:1900*e,gain:.02*d,delay:.008,priority:0}),t&&this.tone({type:"triangle",freq:85*e,duration:.035,gain:.02,priority:0})}}';

  const newStepMethod = `step(i="stone",t=!1){if(!this.ready)return;this._stepFoot=!this._stepFoot;const isLeft=this._stepFoot,footDetune=isLeft?.94:1.06,e=(.92+Math.random()*.16)*footDetune,d=t?1.3:1;this.noiseHit({duration:.026,filter:"lowpass",freq:160*e,gain:(isLeft?.048:.042)*d,priority:0});switch(i){case"water":this.noiseHit({duration:.065,filter:"bandpass",freq:620*e,q:2.2,gain:.042*d,priority:0}),this.noiseHit({duration:.035,filter:"lowpass",freq:360*e,gain:.035*d,delay:.012,priority:0});break;case"grass":case"moss":this.noiseHit({duration:.04,filter:"bandpass",freq:480*e,q:1.8,gain:.034*d,priority:0}),this.noiseHit({duration:.028,filter:"bandpass",freq:880*e,q:2.5,gain:.022*d,delay:.008,priority:0});break;case"snow":this.noiseHit({duration:.06,filter:"bandpass",freq:1100*e,q:1.6,gain:.04*d,priority:0}),this.noiseHit({duration:.045,filter:"lowpass",freq:380*e,gain:.03*d,delay:.01,priority:0});break;case"wood":this.noiseHit({duration:.045,filter:"bandpass",freq:320*e,q:2.8,gain:.046*d,priority:0}),this.noiseHit({duration:.025,filter:"bandpass",freq:740*e,q:3.5,gain:.025*d,delay:.006,priority:0});break;case"volcanic":this.noiseHit({duration:.038,filter:"bandpass",freq:520*e,q:2.2,gain:.042*d,priority:0}),this.noiseHit({duration:.022,filter:"highpass",freq:1800*e,gain:.024*d,delay:.008,priority:0});break;default:this.noiseHit({duration:.035,filter:"bandpass",freq:580*e,q:2,gain:.045*d,priority:0}),this.noiseHit({duration:.018,filter:"bandpass",freq:1400*e,q:3.2,gain:.026*d,delay:.006,priority:0}),t&&this.noiseHit({duration:.022,filter:"lowpass",freq:220*e,gain:.038,priority:0})}}`;

  if (code.includes(oldStepMethod)) {
    code = code.replace(oldStepMethod, newStepMethod);
    console.log(`[${file}] Replaced step method with realistic bipedal leather boot mechanics.`);
  }

  // =======================================================================
  // 4. NATURAL HUMAN FOOTSTEP CADENCE IN PLAYER LOOP
  // =======================================================================
  const oldCadence = 'if(this.stepDistance>=(s?26:21)){';
  const newCadence = 'if(this.stepDistance>=(s?44:32)){';

  if (code.includes(oldCadence)) {
    code = code.replace(oldCadence, newCadence);
    console.log(`[${file}] Adjusted player footstep cadence from machine-gun to natural human stride.`);
  }

  fs.writeFileSync(file, code, 'utf8');
}

console.log('Footstep & Thunder realism patch complete.');
