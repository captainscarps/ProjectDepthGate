const fs = require('fs');

const files = [
  'assets/index-D6qIWtA7-p209.js',
  'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Replace window.__advancedAudio with comprehensive audio engine
  const oldAdvStart = '// =========================================================================\n// ADVANCED DUAL AUDIO ENGINE (HOWLER.JS + TONE.JS HYBRID ACCELERATION)';
  const oldAdvEnd = 'window.addEventListener("keydown", () => window.__advancedAudio?.unlock(), { once: true, passive: true });';

  const advStartIdx = code.indexOf(oldAdvStart);
  const advEndIdx = code.indexOf(oldAdvEnd);

  const fullAdvancedAudioEngine = `// =========================================================================
// ADVANCED MASTER STUDIO SOUND ENGINE (TONE.JS + WEB AUDIO + HOWLER.JS)
// Full vocal formants, realistic biometrics, visceral enemy deaths and acoustic weather
// =========================================================================
window.__advancedAudio = {
  toneReady: false,
  howlerReady: false,
  synths: {},
  reverb: null,

  unlock: function() {
    try {
      if (typeof window.Tone !== 'undefined') {
        if (window.Tone.context && window.Tone.context.state !== 'running') {
          window.Tone.start().catch(()=>{});
        }
        if (!this.synths.membrane && window.Tone.MembraneSynth) {
          this.synths.membrane = new window.Tone.MembraneSynth({
            pitchDecay: 0.025,
            octaves: 2.2,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.04 }
          }).toDestination();
          this.synths.membrane.volume.value = -12;
        }
        if (!this.synths.metal && window.Tone.MetalSynth) {
          this.synths.metal = new window.Tone.MetalSynth({
            frequency: 220,
            envelope: { attack: 0.001, decay: 0.14, release: 0.08 },
            harmonicity: 3.4,
            modulationIndex: 22,
            resonance: 2800,
            octaves: 1.5
          }).toDestination();
          this.synths.metal.volume.value = -14;
        }
        if (!this.synths.voice && window.Tone.Synth) {
          this.synths.voice = new window.Tone.Synth({
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.02, decay: 0.12, sustain: 0.1, release: 0.08 }
          }).toDestination();
          this.synths.voice.volume.value = -14;
        }
        this.toneReady = true;
      }
      if (typeof window.Howler !== 'undefined' && window.Howler.ctx) {
        if (window.Howler.ctx.state !== 'running') window.Howler.ctx.resume().catch(()=>{});
        this.howlerReady = true;
      }
    } catch(e) {}
  },

  playMetalClang: function(note = "E4", dur = "16n") {
    try {
      if (this.synths.metal) {
        this.synths.metal.triggerAttackRelease(note, dur);
        return true;
      }
    } catch(e) {}
    return false;
  },

  playMembraneThud: function(note = "G1", dur = "32n") {
    try {
      if (this.synths.membrane) {
        this.synths.membrane.triggerAttackRelease(note, dur);
        return true;
      }
    } catch(e) {}
    return false;
  },

  // Synthesis of vocal human scream of pain and exertion
  playVocalTone: function(note, duration = "8n") {
    try {
      if (this.synths.voice) {
        this.synths.voice.triggerAttackRelease(note, duration);
        return true;
      }
    } catch(e) {}
    return false;
  }
};
window.addEventListener("pointerdown", () => window.__advancedAudio?.unlock(), { once: true, passive: true });
window.addEventListener("keydown", () => window.__advancedAudio?.unlock(), { once: true, passive: true });`;

  if (advStartIdx !== -1 && advEndIdx !== -1) {
    code = code.substring(0, advStartIdx) + fullAdvancedAudioEngine + code.substring(advEndIdx + oldAdvEnd.length);
    console.log(`[${file}] Upgraded __advancedAudio with full studio vocal synths.`);
  }

  // =======================================================================
  // 2. COMPLETE OVERHAUL OF SFX CASES FOR ENEMY HURTS, DEATH CRIES & LAUGHS
  // =======================================================================
  const oldSfxCasesStart = 'case"demon-attack":';
  const oldSfxCasesEnd = 'case"hero-victory-cheer":this.arpeggio([261,329,392,523],.08,.18,"triangle"),this.tone({type:"sine",freq:523,freqEnd:659,duration:.35,gain:.15,delay:.24});break;';

  const sStartIdx = code.indexOf(oldSfxCasesStart);
  const sEndIdx = code.indexOf(oldSfxCasesEnd);

  const enhancedSfxCases = `case"demon-attack":this.tone({type:"sawtooth",freq:160,freqEnd:70,duration:.25,gain:.14}),this.noiseHit({duration:.2,filter:"bandpass",freq:700,freqEnd:200,q:3,gain:.12});break;

// ========================
// INIMIGOS: GRUNHIDOS, ALERTAS E REACOES
// ========================
case"skeleton-alert":
  this.noiseHit({duration:.06,filter:"bandpass",freq:2400,freqEnd:1200,q:6,gain:.18});
  this.tone({type:"triangle",freq:520,freqEnd:260,duration:.07,gain:.12,delay:.02});
  break;

case"skeleton-hurt":
  // Bone crack and dry hollow jar
  this.tone({type:"triangle",freq:540,freqEnd:190,duration:.08,gain:.18});
  this.noiseHit({duration:.07,filter:"bandpass",freq:2600,freqEnd:800,q:5.5,gain:.22});
  this.noiseHit({duration:.04,filter:"highpass",freq:3200,gain:.14,delay:.02});
  break;

case"skeleton-death":
  // Pile of bones shattering and bouncing on the floor
  for(let b=0;b<5;b++){
    const bt=b*.045;
    this.noiseHit({duration:.08,filter:"bandpass",freq:2200-b*320,freqEnd:450,q:5,gain:.20-b*0.02,delay:bt});
    this.tone({type:"triangle",freq:420-b*55,duration:.05,gain:.10,delay:bt});
  }
  break;

case"goblin-alert":
  // High-pitched cackling chatter
  this.tone({type:"sawtooth",freq:780,freqEnd:920,duration:.08,gain:.15});
  this.tone({type:"sawtooth",freq:920,freqEnd:640,duration:.10,gain:.14,delay:.07});
  this.noiseHit({duration:.08,filter:"highpass",freq:2400,gain:.12,delay:.04});
  break;

case"goblin-hurt":
  // High pitched squeal of pain
  this.tone({type:"sawtooth",freq:880,freqEnd:340,duration:.14,gain:.22});
  this.noiseHit({duration:.10,filter:"bandpass",freq:2800,freqEnd:1200,q:4,gain:.16});
  break;

case"goblin-death":
  // Choked dying yelp and thump
  this.tone({type:"sawtooth",freq:740,freqEnd:110,duration:.28,gain:.24});
  this.noiseHit({duration:.20,filter:"bandpass",freq:1600,freqEnd:320,q:3,gain:.18});
  this.tone({type:"sine",freq:90,freqEnd:40,duration:.18,gain:.18,delay:.18});
  break;

case"orc-alert":
  // Deep chest growl and challenge grunt
  this.tone({type:"square",freq:110,freqEnd:75,duration:.22,gain:.24});
  this.noiseHit({duration:.18,filter:"lowpass",freq:320,gain:.22});
  break;

case"orc-hurt":
  // Heavy guttural roar of agony
  this.tone({type:"sawtooth",freq:145,freqEnd:50,duration:.20,gain:.26});
  this.noiseHit({duration:.16,filter:"lowpass",freq:420,freqEnd:90,gain:.24});
  this.tone({type:"square",freq:85,freqEnd:45,duration:.18,gain:.18,delay:.02});
  break;

case"orc-death":
  // Guttural death rattle and colossal body collapse
  this.tone({type:"sawtooth",freq:120,freqEnd:28,duration:.55,gain:.32});
  this.noiseHit({duration:.45,filter:"bandpass",freq:480,freqEnd:70,q:1.8,gain:.28});
  this.noiseHit({duration:.25,filter:"lowpass",freq:160,gain:.28,delay:.32});
  break;

case"demon-alert":
  // Inverted sulfurous whisper and underworld roar
  this.tone({type:"sawtooth",freq:90,freqEnd:180,duration:.35,gain:.18});
  this.noiseHit({duration:.32,filter:"bandpass",freq:900,freqEnd:350,q:3.5,gain:.16});
  break;

case"demon-hurt":
  // Unholy shriek from the abyss
  this.tone({type:"sawtooth",freq:320,freqEnd:75,duration:.24,gain:.22});
  this.tone({type:"sine",freq:160,freqEnd:40,duration:.26,gain:.20,delay:.02});
  this.noiseHit({duration:.22,filter:"bandpass",freq:1100,freqEnd:220,q:3,gain:.18});
  break;

case"demon-death":
  // Abyssal collapse into ashes with hellish echo
  this.tone({type:"sawtooth",freq:160,freqEnd:20,duration:.75,gain:.30});
  this.noiseHit({duration:.65,filter:"lowpass",freq:600,freqEnd:45,gain:.28});
  this.tone({type:"sine",freq:48,freqEnd:18,duration:.85,gain:.26,delay:.1});
  break;

case"ghost-alert":
  // Ethereal chilling wail
  this.tone({type:"sine",freq:520,freqEnd:780,duration:.4,gain:.12});
  this.noiseHit({duration:.35,filter:"highpass",freq:2800,gain:.07});
  break;

case"ghost-hurt":
  // Piercing spectral banshee screech
  this.tone({type:"sine",freq:980,freqEnd:380,duration:.30,gain:.18});
  this.noiseHit({duration:.26,filter:"highpass",freq:3200,gain:.10});
  break;

case"ghost-death":
  // Dissipating sorrowful soul sigh
  this.tone({type:"sine",freq:620,freqEnd:110,duration:.65,gain:.16});
  this.noiseHit({duration:.55,filter:"bandpass",freq:2200,freqEnd:400,q:4,gain:.12});
  break;

case"troll-alert":
  this.tone({type:"square",freq:65,freqEnd:85,duration:.35,gain:.26});
  this.noiseHit({duration:.35,filter:"lowpass",freq:220,gain:.24});
  break;

case"troll-hurt":
  // Earth-shaking bellow of pain
  this.tone({type:"square",freq:85,freqEnd:35,duration:.28,gain:.28});
  this.noiseHit({duration:.30,filter:"lowpass",freq:300,gain:.26});
  break;

case"troll-death":
  // Titanic mountain ogre collapse
  this.tone({type:"sawtooth",freq:70,freqEnd:18,duration:.9,gain:.35});
  this.noiseHit({duration:.8,filter:"lowpass",freq:350,freqEnd:40,gain:.32});
  this.noiseHit({duration:.4,filter:"lowpass",freq:180,gain:.32,delay:.45});
  break;

case"beast-alert":
  // Low guttural canine snarl
  this.tone({type:"sawtooth",freq:180,freqEnd:130,duration:.28,gain:.18});
  this.noiseHit({duration:.25,filter:"bandpass",freq:950,freqEnd:400,q:2.5,gain:.16});
  break;

case"beast-hurt":
  // Sharp yelp of wounded predator
  this.tone({type:"sawtooth",freq:520,freqEnd:190,duration:.16,gain:.22});
  this.noiseHit({duration:.14,filter:"bandpass",freq:1400,freqEnd:450,q:3,gain:.16});
  break;

case"beast-death":
  // Dying whimper and final breath
  this.tone({type:"sawtooth",freq:320,freqEnd:60,duration:.42,gain:.24});
  this.noiseHit({duration:.35,filter:"bandpass",freq:900,freqEnd:180,q:2.5,gain:.18});
  break;

case"dragon-alert":
  this.tone({type:"sawtooth",freq:110,freqEnd:220,duration:.45,gain:.25});
  this.noiseHit({duration:.4,filter:"bandpass",freq:600,freqEnd:180,q:2,gain:.22});
  break;

case"dragon-hurt":
  // Roar of rage echoing off scales
  this.tone({type:"sawtooth",freq:160,freqEnd:50,duration:.32,gain:.28});
  this.noiseHit({duration:.28,filter:"bandpass",freq:750,freqEnd:160,q:2.2,gain:.24});
  break;

case"dragon-death":
  // Apocalyptic dying roar of colossal wyrm
  this.tone({type:"sawtooth",freq:95,freqEnd:20,duration:1.2,gain:.36});
  this.tone({type:"sine",freq:55,freqEnd:15,duration:1.4,gain:.30,delay:.15});
  this.noiseHit({duration:1.1,filter:"lowpass",freq:420,freqEnd:40,gain:.32});
  break;

case"mimic-alert":
  this.tone({type:"triangle",freq:180,freqEnd:440,duration:.18,gain:.22});
  this.noiseHit({duration:.15,filter:"bandpass",freq:1800,freqEnd:800,q:4,gain:.20});
  break;

case"mimic-attack":
  this.noiseHit({duration:.14,filter:"bandpass",freq:1600,freqEnd:350,q:3.2,gain:.24});
  this.tone({type:"square",freq:240,freqEnd:85,duration:.12,gain:.18});
  break;

case"mimic-hurt":
  this.noiseHit({duration:.12,filter:"bandpass",freq:2100,freqEnd:650,q:3.8,gain:.20});
  this.tone({type:"triangle",freq:340,freqEnd:110,duration:.11,gain:.16});
  break;

case"mimic-death":
  for(let m=0;m<4;m++){
    const mt=m*.06;
    this.noiseHit({duration:.14,filter:"bandpass",freq:1400-m*250,freqEnd:280,q:3,gain:.22,delay:mt});
    this.tone({type:"square",freq:180-m*35,duration:.09,gain:.14,delay:mt});
  }
  break;

// ========================
// RISADAS MALEFICAS DE CHEFES HUMANOIDES
// ========================
case"boss-evil-laugh-deep":
  // "BWAH... HA... HA... HAA!" - Cavernous, deep sinister laugh with dark resonance
  for(let l=0;l<4;l++){
    const lt=l*.19, baseP=145-l*15;
    this.tone({type:"sawtooth",freq:baseP,freqEnd:baseP*.72,duration:.18,gain:.28,delay:lt});
    this.tone({type:"triangle",freq:baseP*2.1,freqEnd:baseP*1.4,duration:.16,gain:.16,delay:lt});
    this.noiseHit({duration:.15,filter:"bandpass",freq:820,freqEnd:420,q:3.2,gain:.12,delay:lt});
    this.tone({type:"sine",freq:baseP*.5,duration:.22,gain:.14,delay:lt+.02});
  }
  break;

case"boss-evil-laugh-wicked":
  // "HEH-HEH-HEH-HEEE!" - High-pitched cruel staccato cackle of corrupted sorcerers
  for(let l=0;l<5;l++){
    const lt=l*.13, baseP=340-l*20;
    this.tone({type:"sawtooth",freq:baseP,freqEnd:baseP*.80,duration:.11,gain:.24,delay:lt});
    this.tone({type:"sine",freq:baseP*2.4,duration:.09,gain:.14,delay:lt+.01});
    this.noiseHit({duration:.09,filter:"bandpass",freq:1750,freqEnd:850,q:4.2,gain:.09,delay:lt});
  }
  break;

// ========================
// VOZES DOS HEROIS: ATAQUE, GRUNHIDOS E GRITOS DE DOR
// ========================
case"hero-grunt-warrior":
  // Powerful muscular war grunt ("HRAAH!")
  this.tone({type:"sawtooth",freq:140,freqEnd:72,duration:.18,gain:.26});
  this.tone({type:"triangle",freq:280,freqEnd:130,duration:.16,gain:.18});
  this.noiseHit({duration:.14,filter:"bandpass",freq:720,freqEnd:260,q:2.2,gain:.14});
  break;

case"hero-grunt-mage":
  // Focused arcane breath of incantation ("AH-UM!")
  this.tone({type:"sine",freq:240,freqEnd:330,duration:.24,gain:.20});
  this.tone({type:"triangle",freq:480,freqEnd:190,duration:.20,gain:.14,delay:.03});
  this.noiseHit({duration:.20,filter:"bandpass",freq:1350,freqEnd:420,q:3.2,gain:.08});
  break;

case"hero-grunt-archer":
  // Sharp focused exhale on release ("HYAH!")
  this.tone({type:"triangle",freq:310,freqEnd:140,duration:.13,gain:.22});
  this.noiseHit({duration:.12,filter:"highpass",freq:1600,gain:.15});
  break;

case"hero-grunt-rogue":
  // Swift whispered breath ("TSK-HAH!")
  this.tone({type:"triangle",freq:260,freqEnd:115,duration:.10,gain:.20});
  this.noiseHit({duration:.09,filter:"bandpass",freq:2400,freqEnd:850,q:3.8,gain:.16});
  break;

case"hero-grunt-berserker":
  // Primal bloodlust battle roar ("WRAAAGH!")
  this.tone({type:"sawtooth",freq:115,freqEnd:45,duration:.34,gain:.34});
  this.tone({type:"square",freq:75,freqEnd:30,duration:.28,gain:.24,delay:.02});
  this.noiseHit({duration:.30,filter:"lowpass",freq:480,gain:.22});
  break;

case"hero-hurt-male":
  // Visceral grunt of physical trauma ("UGH!")
  this.tone({type:"sawtooth",freq:175,freqEnd:55,duration:.17,gain:.28});
  this.tone({type:"triangle",freq:90,freqEnd:40,duration:.15,gain:.18,delay:.01});
  this.noiseHit({duration:.14,filter:"bandpass",freq:600,freqEnd:160,q:2,gain:.18});
  break;

case"hero-hurt-female":
  // Sharp gasp and cry under heavy hit ("GAH!")
  this.tone({type:"triangle",freq:320,freqEnd:110,duration:.15,gain:.26});
  this.tone({type:"sine",freq:580,freqEnd:220,duration:.12,gain:.16});
  this.noiseHit({duration:.13,filter:"bandpass",freq:920,freqEnd:280,q:2.8,gain:.16});
  break;

case"hero-death-male":
  // Heart-wrenching death groan and falling breath
  this.tone({type:"sawtooth",freq:160,freqEnd:32,duration:.65,gain:.32});
  this.tone({type:"sine",freq:80,freqEnd:24,duration:.75,gain:.24,delay:.05});
  this.noiseHit({duration:.55,filter:"bandpass",freq:550,freqEnd:70,q:2,gain:.24});
  break;

case"hero-death-female":
  // Tragic dying gasp expiring into silence
  this.tone({type:"triangle",freq:290,freqEnd:50,duration:.60,gain:.30});
  this.tone({type:"sine",freq:420,freqEnd:80,duration:.50,gain:.20,delay:.04});
  this.noiseHit({duration:.50,filter:"bandpass",freq:820,freqEnd:110,q:2.5,gain:.20});
  break;

case"hero-victory-cheer":
  this.arpeggio([261,329,392,523],.08,.18,"triangle"),this.tone({type:"sine",freq:523,freqEnd:659,duration:.35,gain:.15,delay:.24});break;`;

  if (sStartIdx !== -1 && sEndIdx !== -1) {
    code = code.substring(0, sStartIdx) + enhancedSfxCases + code.substring(sEndIdx + oldSfxCasesEnd.length);
    console.log(`[${file}] Injected comprehensive enemy voices, hero hurt/death cries, and boss evil laughs.`);
  }

  // =======================================================================
  // 3. HOOK HERO DEATH CRY IN PLAYER ONDEATH
  // =======================================================================
  const oldPlayerDeath = 'this.player.dead=!0,this.state="gameover"';
  const newPlayerDeath = 'this.player.dead=!0,this.state="gameover";try{const c=(this.classDef?.id||"").toLowerCase();this.audio?.play(c.match(/archer|huntress|rogue/i)?"sfx-hero-death-female":"sfx-hero-death-male");}catch(e){}';
  if (code.includes(oldPlayerDeath)) {
    code = code.replace(oldPlayerDeath, newPlayerDeath);
    console.log(`[${file}] Hooked dramatic hero death cry in onDeath.`);
  }

  fs.writeFileSync(file, code, 'utf8');
}

console.log('Grand Sound & Voices overhaul patch applied.');
