import os

path1 = 'assets/index-D6qIWtA7-p209.js'
path2 = 'Projeto atualizado/assets/index-D6qIWtA7-p209.js'

for target_file in [path1, path2]:
    print(f"Patching {target_file}...")
    with open(target_file, 'r', encoding='utf-8') as f:
        bundle = f.read()

    # 1. UPGRADE window.__advancedAudio (Full Tone.js + Web Audio FX Matrix)
    aa_start = bundle.find('window.__advancedAudio = {')
    aa_end = bundle.find('class zr', aa_start)
    assert aa_start != -1 and aa_end != -1, '__advancedAudio boundaries not found'

    new_advanced_audio = '''window.__advancedAudio = {
  toneReady: false,
  howlerReady: false,
  synths: {},
  effects: {},
  reverb: null,

  unlock: function() {
    try {
      if (typeof window.Tone !== 'undefined') {
        if (window.Tone.context && window.Tone.context.state !== 'running') {
          window.Tone.start().catch(()=>{});
        }
        
        // Master Limiter to prevent clipping on heavy battle sounds
        if (!this.effects.limiter && window.Tone.Limiter) {
          this.effects.limiter = new window.Tone.Limiter(-1).toDestination();
        }
        const masterOut = this.effects.limiter || window.Tone.Destination;

        // Sub-bass impact MembraneSynth (punchy, deep organic thud)
        if (!this.synths.membrane && window.Tone.MembraneSynth) {
          this.synths.membrane = new window.Tone.MembraneSynth({
            pitchDecay: 0.035,
            octaves: 3.5,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.16, sustain: 0, release: 0.08 }
          }).connect(masterOut);
          this.synths.membrane.volume.value = -7;
        }

        // Metallic blade clashing & armor hit synth
        if (!this.synths.metal && window.Tone.MetalSynth) {
          this.synths.metal = new window.Tone.MetalSynth({
            frequency: 240,
            envelope: { attack: 0.001, decay: 0.12, release: 0.05 },
            harmonicity: 3.8,
            modulationIndex: 28,
            resonance: 3200,
            octaves: 1.2
          }).connect(masterOut);
          this.synths.metal.volume.value = -11;
        }

        // FMSynth for guttural monster roars and beast vocalizations
        if (!this.synths.monster && window.Tone.FMSynth) {
          this.synths.monster = new window.Tone.FMSynth({
            harmonicity: 1.5,
            modulationIndex: 12,
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.04, decay: 0.3, sustain: 0.1, release: 0.2 },
            modulation: { type: "square" },
            modulationEnvelope: { attack: 0.02, decay: 0.25, sustain: 0.2, release: 0.2 }
          }).connect(masterOut);
          this.synths.monster.volume.value = -9;
        }

        // Realistic vocal exertion synth for heroes & humanoid grunts
        if (!this.synths.voice && window.Tone.Synth) {
          this.synths.voice = new window.Tone.Synth({
            oscillator: { type: "sawtooth4" },
            envelope: { attack: 0.02, decay: 0.18, sustain: 0, release: 0.06 }
          }).connect(masterOut);
          this.synths.voice.volume.value = -8;
        }

        // PolySynth for spectral wails, magic incantations & dark ether
        if (!this.synths.spectral && window.Tone.PolySynth) {
          this.synths.spectral = new window.Tone.PolySynth(window.Tone.Synth, {
            oscillator: { type: "sine" },
            envelope: { attack: 0.05, decay: 0.4, sustain: 0.2, release: 0.3 }
          }).connect(masterOut);
          this.synths.spectral.volume.value = -12;
        }

        // NoiseSynth for blade swooshes and bone crunch bursts
        if (!this.synths.noise && window.Tone.NoiseSynth) {
          this.synths.noise = new window.Tone.NoiseSynth({
            noise: { type: "pink" },
            envelope: { attack: 0.002, decay: 0.09, sustain: 0 }
          }).connect(masterOut);
          this.synths.noise.volume.value = -10;
        }

        this.toneReady = true;
      }
    } catch(e) {
      console.warn("[AdvancedAudio] Tone initialization skipped:", e);
    }
  },

  playMembraneThud: function(note = "C1", duration = "16n") {
    try {
      if (!this.toneReady) this.unlock();
      if (this.synths.membrane) this.synths.membrane.triggerAttackRelease(note, duration);
    } catch(e) {}
  },

  playMetalClang: function(note = "D4", duration = "32n") {
    try {
      if (!this.toneReady) this.unlock();
      if (this.synths.metal) this.synths.metal.triggerAttackRelease(note, duration);
    } catch(e) {}
  },

  playMonsterRoar: function(note = "F1", duration = "8n") {
    try {
      if (!this.toneReady) this.unlock();
      if (this.synths.monster) this.synths.monster.triggerAttackRelease(note, duration);
    } catch(e) {}
  },

  playVocalTone: function(note = "G2", duration = "16n") {
    try {
      if (!this.toneReady) this.unlock();
      if (this.synths.voice) this.synths.voice.triggerAttackRelease(note, duration);
    } catch(e) {}
  },

  playSpectralChime: function(notes = ["E3", "B3", "E4"], duration = "8n") {
    try {
      if (!this.toneReady) this.unlock();
      if (this.synths.spectral) this.synths.spectral.triggerAttackRelease(notes, duration);
    } catch(e) {}
  },

  playNoiseBurst: function(duration = "32n") {
    try {
      if (!this.toneReady) this.unlock();
      if (this.synths.noise) this.synths.noise.triggerAttackRelease(duration);
    } catch(e) {}
  }
};
'''
    bundle = bundle[:aa_start] + new_advanced_audio + bundle[aa_end:]

    # 2. UPGRADE HERO ATTACK GRUNTS (All 9 Hero Classes)
    old_grunt = 'if(Math.random()<0.38){const c=(this.scene?.classDef?.id||"").toLowerCase();if(c.includes("warrior"))this.audio?.play("sfx-hero-grunt-warrior");else if(c.includes("mage"))this.audio?.play("sfx-hero-grunt-mage");else if(c.includes("archer")||c.includes("huntress"))this.audio?.play("sfx-hero-grunt-archer");else if(c.includes("rogue"))this.audio?.play("sfx-hero-grunt-rogue");else if(c.includes("berserk"))this.audio?.play("sfx-hero-grunt-berserker");}'
    new_grunt = 'if(Math.random()<0.45){const c=(this.scene?.classDef?.id||"").toLowerCase();if(c.includes("warrior"))this.audio?.play("sfx-hero-grunt-warrior");else if(c.includes("mage"))this.audio?.play("sfx-hero-grunt-mage");else if(c.includes("archer")||c.includes("huntress"))this.audio?.play("sfx-hero-grunt-archer");else if(c.includes("rogue")||c.includes("shadow"))this.audio?.play("sfx-hero-grunt-rogue");else if(c.includes("berserk")||c.includes("samurai"))this.audio?.play("sfx-hero-grunt-berserker");else if(c.includes("hunter"))this.audio?.play("sfx-hero-grunt-hunter");else if(c.includes("druid")||c.includes("paladin"))this.audio?.play("sfx-hero-grunt-druid");else if(c.includes("shaman"))this.audio?.play("sfx-hero-grunt-shaman");else if(c.includes("necro")||c.includes("warlock"))this.audio?.play("sfx-hero-grunt-necro");else this.audio?.play("sfx-hero-grunt-warrior");}'
    assert old_grunt in bundle, 'old_grunt not found'
    bundle = bundle.replace(old_grunt, new_grunt)

    # 3. UPGRADE HERO HURT SOUNDS (Class specific voices including female classes)
    old_hurt = 'this.audio?.play((this.scene?.classDef?.id||"").match(/archer|huntress|rogue/i)?"sfx-hero-hurt-female":"sfx-hero-hurt-male")'
    new_hurt = 'this.audio?.play((this.scene?.classDef?.id||"").match(/archer|huntress|rogue|shaman|mage/i)?"sfx-hero-hurt-female":"sfx-hero-hurt-male")'
    assert old_hurt in bundle, 'old_hurt not found'
    bundle = bundle.replace(old_hurt, new_hurt)

    # 4. REMOVE DUPLICATE OLD ALERT BLOCK
    duplicate_alerts = 'case"skeleton-alert":this.noiseHit({duration:.08,filter:"bandpass",freq:1800,q:6,gain:.08}),this.tone({type:"square",freq:340,freqEnd:260,duration:.05,gain:.04,delay:.06});break;case"goblin-alert":this.tone({type:"sawtooth",freq:720,freqEnd:980,duration:.09,gain:.07});break;case"orc-alert":this.tone({type:"sawtooth",freq:140,freqEnd:90,duration:.16,gain:.1});break;case"demon-alert":this.noiseHit({duration:.2,filter:"bandpass",freq:2400,freqEnd:900,q:3,gain:.06}),this.tone({type:"sawtooth",freq:190,freqEnd:120,duration:.14,gain:.05,delay:.03});break;case"ghost-alert":this.tone({type:"sine",freq:520,freqEnd:380,duration:.35,gain:.05});break;case"beast-alert":this.tone({type:"sawtooth",freq:110,freqEnd:75,duration:.22,gain:.09}),this.noiseHit({duration:.18,filter:"lowpass",freq:420,gain:.05});break;case"dragon-alert":this.tone({type:"sawtooth",freq:130,freqEnd:70,duration:.3,gain:.11}),this.noiseHit({duration:.25,filter:"bandpass",freq:500,freqEnd:200,q:2,gain:.08});break;'
    assert duplicate_alerts in bundle, 'duplicate_alerts not found'
    bundle = bundle.replace(duplicate_alerts, '')

    # 5. UPGRADE SFX SWITCH IN CLASS ZR
    replacements = [
        # Weapons & Impacts
        ('case"weapon-sword":window.__advancedAudio?.playMetalClang?.("E4","32n");this.noiseHit({duration:.14,filter:"bandpass",freq:1400,freqEnd:320,q:2.2,gain:.15}),this.tone({type:"triangle",freq:480,freqEnd:180,duration:.1,gain:.05});break;',
         'case"weapon-sword":window.__advancedAudio?.playMetalClang?.("F4","32n");window.__advancedAudio?.playNoiseBurst?.("32n");this.noiseHit({duration:.16,filter:"bandpass",freq:1850,freqEnd:280,q:2.8,gain:.22}),this.tone({type:"sawtooth",freq:380,freqEnd:120,duration:.12,gain:.10});break;'),

        ('case"weapon-axe":this.noiseHit({duration:.24,filter:"bandpass",freq:650,freqEnd:120,q:1.6,gain:.22}),this.tone({type:"sawtooth",freq:110,freqEnd:45,duration:.18,gain:.12});break;',
         'case"weapon-axe":window.__advancedAudio?.playMembraneThud?.("D1","16n");window.__advancedAudio?.playMetalClang?.("C3","32n");this.noiseHit({duration:.24,filter:"lowpass",freq:650,freqEnd:120,gain:.32}),this.tone({type:"sawtooth",freq:140,freqEnd:45,duration:.20,gain:.18});break;'),

        ('case"weapon-dagger":this.noiseHit({duration:.08,filter:"highpass",freq:2600,gain:.13}),this.tone({type:"triangle",freq:820,freqEnd:350,duration:.06,gain:.04});break;',
         'case"weapon-dagger":window.__advancedAudio?.playMetalClang?.("G5","64n");this.noiseHit({duration:.09,filter:"highpass",freq:3200,gain:.18}),this.tone({type:"sine",freq:880,freqEnd:420,duration:.06,gain:.08});break;'),

        ('case"weapon-bow":this.noiseHit({duration:.08,filter:"bandpass",freq:1900,freqEnd:900,q:5,gain:.15}),this.tone({type:"triangle",freq:240,freqEnd:80,duration:.07,gain:.09});break;',
         'case"weapon-bow":window.__advancedAudio?.playNoiseBurst?.("16n");this.tone({type:"triangle",freq:520,freqEnd:180,duration:.08,gain:.16}),this.noiseHit({duration:.14,filter:"bandpass",freq:2100,freqEnd:480,q:3.8,gain:.18}),this.tone({type:"sine",freq:160,freqEnd:70,duration:.10,gain:.12,delay:.02});break;'),

        ('case"weapon-staff":this.tone({type:"sine",freq:420,freqEnd:680,duration:.2,gain:.12}),this.noiseHit({duration:.18,filter:"bandpass",freq:1100,freqEnd:1800,q:3.5,gain:.05}),this.tone({type:"sine",freq:880,freqEnd:440,duration:.15,gain:.04,delay:.04});break;',
         'case"weapon-staff":window.__advancedAudio?.playSpectralChime?.(["D4","A4","F5"],"16n");this.tone({type:"sine",freq:440,freqEnd:660,duration:.22,gain:.16}),this.tone({type:"triangle",freq:880,freqEnd:330,duration:.18,gain:.12,delay:.02}),this.noiseHit({duration:.20,filter:"bandpass",freq:1600,freqEnd:500,q:3.5,gain:.12});break;'),

        ('case"hit":this.tone({type:"triangle",freq:220,freqEnd:65,duration:.1,gain:.18}),this.noiseHit({duration:.09,filter:"bandpass",freq:1200,freqEnd:280,q:2.5,gain:.2}),this.tone({type:"sine",freq:650,freqEnd:320,duration:.06,gain:.08,delay:.01});break;',
         'case"hit":window.__advancedAudio?.playMembraneThud?.("G1","32n");window.__advancedAudio?.playNoiseBurst?.("32n");this.tone({type:"sawtooth",freq:180,freqEnd:40,duration:.12,gain:.26}),this.noiseHit({duration:.11,filter:"bandpass",freq:1600,freqEnd:220,q:2.2,gain:.28}),this.tone({type:"triangle",freq:420,freqEnd:120,duration:.08,gain:.14,delay:.01});break;'),

        ('case"shield-block":window.__advancedAudio?.playMetalClang?.("A3","16n");this.tone({type:"triangle",freq:420,freqEnd:210,duration:.12,gain:.22,priority:2}),this.tone({type:"sine",freq:840,freqEnd:380,duration:.08,gain:.14,priority:2}),this.noiseHit({duration:.07,filter:"bandpass",freq:1900,freqEnd:600,q:3.5,gain:.18,priority:2});break;',
         'case"shield-block":window.__advancedAudio?.playMetalClang?.("D4","16n");window.__advancedAudio?.playMembraneThud?.("E1","16n");this.tone({type:"triangle",freq:520,freqEnd:180,duration:.16,gain:.32,priority:2}),this.tone({type:"sine",freq:1040,freqEnd:320,duration:.10,gain:.20,priority:2}),this.noiseHit({duration:.12,filter:"bandpass",freq:2400,freqEnd:500,q:4.2,gain:.28,priority:2});break;'),

        # Goblin
        ('case"goblin-alert":\n  // High-pitched cackling chatter\n  this.tone({type:"sawtooth",freq:780,freqEnd:920,duration:.08,gain:.15});\n  this.tone({type:"sawtooth",freq:920,freqEnd:640,duration:.10,gain:.14,delay:.07});\n  this.noiseHit({duration:.08,filter:"highpass",freq:2400,gain:.12,delay:.04});\n  break;',
         'case"goblin-alert":window.__advancedAudio?.playMonsterRoar?.("G4","16n");this.tone({type:"sawtooth",freq:640,freqEnd:1120,duration:.13,gain:.18});this.noiseHit({duration:.10,filter:"bandpass",freq:2200,freqEnd:1100,q:3,gain:.12});break;'),

        ('case"goblin-attack":this.noiseHit({duration:.07,filter:"highpass",freq:1800,gain:.12}),this.tone({type:"sawtooth",freq:500,freqEnd:300,duration:.07,gain:.07});break;',
         'case"goblin-attack":window.__advancedAudio?.playMetalClang?.("B4","32n");this.noiseHit({duration:.12,filter:"bandpass",freq:2400,freqEnd:700,q:2.5,gain:.22}),this.tone({type:"sawtooth",freq:620,freqEnd:240,duration:.11,gain:.16});break;'),

        ('case"goblin-hurt":\n  // High pitched squeal of pain\n  this.tone({type:"sawtooth",freq:880,freqEnd:340,duration:.14,gain:.22});\n  this.noiseHit({duration:.10,filter:"bandpass",freq:2800,freqEnd:1200,q:4,gain:.16});\n  break;',
         'case"goblin-hurt":window.__advancedAudio?.playMonsterRoar?.("A4","16n");this.tone({type:"sawtooth",freq:960,freqEnd:280,duration:.18,gain:.30});this.tone({type:"triangle",freq:540,freqEnd:160,duration:.14,gain:.20,delay:.02});this.noiseHit({duration:.14,filter:"bandpass",freq:3200,freqEnd:900,q:4.5,gain:.24});break;'),

        ('case"goblin-death":\n  // Choked dying yelp and thump\n  this.tone({type:"sawtooth",freq:740,freqEnd:110,duration:.28,gain:.24});\n  this.noiseHit({duration:.20,filter:"bandpass",freq:1600,freqEnd:320,q:3,gain:.18});\n  this.tone({type:"sine",freq:90,freqEnd:40,duration:.18,gain:.18,delay:.18});\n  break;',
         'case"goblin-death":window.__advancedAudio?.playMonsterRoar?.("E4","16n");window.__advancedAudio?.playMembraneThud?.("C1","16n");this.tone({type:"sawtooth",freq:820,freqEnd:90,duration:.32,gain:.32});this.noiseHit({duration:.25,filter:"bandpass",freq:2100,freqEnd:240,q:3.2,gain:.26});this.tone({type:"sine",freq:85,freqEnd:35,duration:.22,gain:.24,delay:.16});break;'),

        # Skeleton
        ('case"skeleton-alert":\n  this.noiseHit({duration:.06,filter:"bandpass",freq:2400,freqEnd:1200,q:6,gain:.18});\n  this.tone({type:"triangle",freq:520,freqEnd:260,duration:.07,gain:.12,delay:.02});\n  break;',
         'case"skeleton-alert":window.__advancedAudio?.playMetalClang?.("C5","32n");this.noiseHit({duration:.16,filter:"bandpass",freq:2800,freqEnd:900,q:5.2,gain:.22});this.tone({type:"triangle",freq:580,freqEnd:180,duration:.12,gain:.14});this.noiseHit({duration:.08,filter:"highpass",freq:3600,gain:.16,delay:.04});break;'),

        ('case"skeleton-attack":this.noiseHit({duration:.1,filter:"bandpass",freq:1400,freqEnd:500,q:4,gain:.13}),this.tone({type:"square",freq:220,freqEnd:140,duration:.06,gain:.06});break;',
         'case"skeleton-attack":window.__advancedAudio?.playNoiseBurst?.("16n");this.noiseHit({duration:.14,filter:"bandpass",freq:2200,freqEnd:420,q:4.5,gain:.24}),this.tone({type:"sawtooth",freq:340,freqEnd:110,duration:.10,gain:.16});break;'),

        ('case"skeleton-hurt":\n  // Bone crack and dry hollow jar\n  this.tone({type:"triangle",freq:540,freqEnd:190,duration:.08,gain:.18});\n  this.noiseHit({duration:.07,filter:"bandpass",freq:2600,freqEnd:800,q:5.5,gain:.22});\n  this.noiseHit({duration:.04,filter:"highpass",freq:3200,gain:.14,delay:.02});\n  break;',
         'case"skeleton-hurt":window.__advancedAudio?.playMetalClang?.("F4","32n");this.tone({type:"triangle",freq:640,freqEnd:160,duration:.11,gain:.28});this.noiseHit({duration:.10,filter:"bandpass",freq:3400,freqEnd:750,q:5.8,gain:.32});this.noiseHit({duration:.06,filter:"highpass",freq:4200,gain:.22,delay:.02});break;'),

        ('case"skeleton-death":\n  // Pile of bones shattering and bouncing on the floor\n  for(let b=0;b<5;b++){\n    const bt=b*.045;\n    this.noiseHit({duration:.08,filter:"bandpass",freq:2200-b*320,freqEnd:450,q:5,gain:.20-b*0.02,delay:bt});\n    this.tone({type:"triangle",freq:420-b*55,duration:.05,gain:.10,delay:bt});\n  }\n  break;',
         'case"skeleton-death":window.__advancedAudio?.playMembraneThud?.("G1","16n");for(let b=0;b<6;b++){const bt=b*.04;window.__advancedAudio?.playMetalClang?.(b%2===0?"A4":"D5","64n");this.noiseHit({duration:.10,filter:"bandpass",freq:2800-b*380,freqEnd:320,q:5.2,gain:.26-b*0.03,delay:bt});this.tone({type:"triangle",freq:520-b*65,duration:.07,gain:.16-b*0.02,delay:bt});}break;'),

        # Orc
        ('case"orc-alert":\n  // Deep chest growl and challenge grunt\n  this.tone({type:"square",freq:110,freqEnd:75,duration:.22,gain:.24});\n  this.noiseHit({duration:.18,filter:"lowpass",freq:320,gain:.22});\n  break;',
         'case"orc-alert":window.__advancedAudio?.playMonsterRoar?.("E2","8n");this.tone({type:"sawtooth",freq:160,freqEnd:65,duration:.24,gain:.26});this.noiseHit({duration:.18,filter:"lowpass",freq:420,freqEnd:90,gain:.20});break;'),

        ('case"orc-attack":this.noiseHit({duration:.18,filter:"bandpass",freq:450,freqEnd:140,q:2,gain:.2}),this.tone({type:"square",freq:110,freqEnd:60,duration:.14,gain:.1});break;',
         'case"orc-attack":window.__advancedAudio?.playMembraneThud?.("C1","16n");this.noiseHit({duration:.22,filter:"bandpass",freq:550,freqEnd:90,q:2.2,gain:.32}),this.tone({type:"sawtooth",freq:130,freqEnd:45,duration:.18,gain:.22});break;'),

        ('case"orc-hurt":\n  // Heavy guttural roar of agony\n  this.tone({type:"sawtooth",freq:145,freqEnd:50,duration:.20,gain:.26});\n  this.noiseHit({duration:.16,filter:"lowpass",freq:420,freqEnd:90,gain:.24});\n  this.tone({type:"square",freq:85,freqEnd:45,duration:.18,gain:.18,delay:.02});\n  break;',
         'case"orc-hurt":window.__advancedAudio?.playMonsterRoar?.("C2","8n");this.tone({type:"sawtooth",freq:150,freqEnd:42,duration:.26,gain:.38});this.tone({type:"square",freq:85,freqEnd:30,duration:.22,gain:.28,delay:.02});this.noiseHit({duration:.20,filter:"lowpass",freq:480,freqEnd:90,gain:.30});break;'),

        ('case"orc-death":\n  // Guttural death rattle and colossal body collapse\n  this.tone({type:"sawtooth",freq:120,freqEnd:28,duration:.55,gain:.32});\n  this.noiseHit({duration:.45,filter:"bandpass",freq:480,freqEnd:70,q:1.8,gain:.28});\n  this.noiseHit({duration:.25,filter:"lowpass",freq:160,gain:.28,delay:.32});\n  break;',
         'case"orc-death":window.__advancedAudio?.playMonsterRoar?.("A1","4n");window.__advancedAudio?.playMembraneThud?.("B0","8n");this.tone({type:"sawtooth",freq:130,freqEnd:24,duration:.65,gain:.42});this.tone({type:"square",freq:75,freqEnd:18,duration:.55,gain:.32,delay:.05});this.noiseHit({duration:.50,filter:"lowpass",freq:420,freqEnd:50,gain:.35});this.noiseHit({duration:.32,filter:"bandpass",freq:220,freqEnd:35,q:2.2,gain:.36,delay:.30});break;'),

        # Demon
        ('case"demon-alert":\n  // Inverted sulfurous whisper and underworld roar\n  this.tone({type:"sawtooth",freq:90,freqEnd:180,duration:.35,gain:.18});\n  this.noiseHit({duration:.32,filter:"bandpass",freq:900,freqEnd:350,q:3.5,gain:.16});\n  break;',
         'case"demon-alert":window.__advancedAudio?.playMonsterRoar?.("F2","8n");window.__advancedAudio?.playSpectralChime?.(["F2","C3","G#3"],"8n");this.noiseHit({duration:.26,filter:"bandpass",freq:2600,freqEnd:600,q:3.2,gain:.18});this.tone({type:"sawtooth",freq:170,freqEnd:60,duration:.22,gain:.24,delay:.03});break;'),

        ('case"demon-attack":this.tone({type:"sawtooth",freq:160,freqEnd:70,duration:.25,gain:.14}),this.noiseHit({duration:.2,filter:"bandpass",freq:700,freqEnd:200,q:3,gain:.12});break;',
         'case"demon-attack":window.__advancedAudio?.playMembraneThud?.("D1","16n");this.tone({type:"sawtooth",freq:210,freqEnd:50,duration:.28,gain:.28}),this.noiseHit({duration:.24,filter:"bandpass",freq:950,freqEnd:160,q:2.8,gain:.26});break;'),

        ('case"demon-hurt":\n  // Unholy shriek from the abyss\n  this.tone({type:"sawtooth",freq:320,freqEnd:75,duration:.24,gain:.22});\n  this.tone({type:"sine",freq:160,freqEnd:40,duration:.26,gain:.20,delay:.02});\n  this.noiseHit({duration:.22,filter:"bandpass",freq:1100,freqEnd:220,q:3,gain:.18});\n  break;',
         'case"demon-hurt":window.__advancedAudio?.playMonsterRoar?.("D2","8n");this.tone({type:"sawtooth",freq:440,freqEnd:80,duration:.26,gain:.32});this.tone({type:"square",freq:220,freqEnd:35,duration:.22,gain:.24,delay:.02});this.noiseHit({duration:.22,filter:"highpass",freq:2400,freqEnd:350,gain:.28});break;'),

        ('case"demon-death":\n  // Abyssal collapse into ashes with hellish echo\n  this.tone({type:"sawtooth",freq:160,freqEnd:20,duration:.75,gain:.30});\n  this.noiseHit({duration:.65,filter:"lowpass",freq:600,freqEnd:45,gain:.28});\n  this.tone({type:"sine",freq:48,freqEnd:18,duration:.85,gain:.26,delay:.1});\n  break;',
         'case"demon-death":window.__advancedAudio?.playMonsterRoar?.("G1","4n");window.__advancedAudio?.playMembraneThud?.("A0","8n");this.tone({type:"sawtooth",freq:320,freqEnd:25,duration:.70,gain:.40});this.tone({type:"triangle",freq:640,freqEnd:40,duration:.60,gain:.28,delay:.05});this.noiseHit({duration:.65,filter:"bandpass",freq:1600,freqEnd:60,q:3.2,gain:.35});this.noiseHit({duration:.50,filter:"lowpass",freq:320,gain:.30,delay:.14});break;'),

        # Beast
        ('case"beast-alert":\n  // Low guttural canine snarl\n  this.tone({type:"sawtooth",freq:180,freqEnd:130,duration:.28,gain:.18});\n  this.noiseHit({duration:.25,filter:"bandpass",freq:950,freqEnd:400,q:2.5,gain:.16});\n  break;',
         'case"beast-alert":window.__advancedAudio?.playMonsterRoar?.("A2","8n");this.tone({type:"sawtooth",freq:260,freqEnd:90,duration:.22,gain:.22});this.noiseHit({duration:.18,filter:"bandpass",freq:850,freqEnd:220,q:2.5,gain:.18});break;'),

        ('case"beast-hurt":\n  // Sharp yelp of wounded predator\n  this.tone({type:"sawtooth",freq:520,freqEnd:190,duration:.16,gain:.22});\n  this.noiseHit({duration:.14,filter:"bandpass",freq:1400,freqEnd:450,q:3,gain:.16});\n  break;',
         'case"beast-hurt":window.__advancedAudio?.playMonsterRoar?.("G3","16n");this.tone({type:"sawtooth",freq:580,freqEnd:150,duration:.20,gain:.30});this.noiseHit({duration:.18,filter:"bandpass",freq:1800,freqEnd:350,q:3.2,gain:.24});break;'),

        ('case"beast-death":\n  // Dying whimper and final breath\n  this.tone({type:"sawtooth",freq:320,freqEnd:60,duration:.42,gain:.24});\n  this.noiseHit({duration:.35,filter:"bandpass",freq:900,freqEnd:180,q:2.5,gain:.18});\n  break;',
         'case"beast-death":window.__advancedAudio?.playMonsterRoar?.("D3","8n");window.__advancedAudio?.playMembraneThud?.("D1","16n");this.tone({type:"sawtooth",freq:460,freqEnd:45,duration:.55,gain:.32});this.noiseHit({duration:.42,filter:"bandpass",freq:1100,freqEnd:110,q:2.8,gain:.24});this.tone({type:"sine",freq:150,freqEnd:30,duration:.35,gain:.20,delay:.10});break;'),

        # Ghost
        ('case"ghost-alert":\n  // Ethereal chilling wail\n  this.tone({type:"sine",freq:520,freqEnd:780,duration:.4,gain:.12});\n  this.noiseHit({duration:.35,filter:"highpass",freq:2800,gain:.07});\n  break;',
         'case"ghost-alert":window.__advancedAudio?.playSpectralChime?.(["F4","B4","E5"],"8n");this.tone({type:"sine",freq:480,freqEnd:820,duration:.42,gain:.16});this.noiseHit({duration:.38,filter:"highpass",freq:3200,gain:.12});break;'),

        ('case"ghost-hurt":\n  // Piercing spectral banshee screech\n  this.tone({type:"sine",freq:980,freqEnd:380,duration:.30,gain:.18});\n  this.noiseHit({duration:.26,filter:"highpass",freq:3200,gain:.10});\n  break;',
         'case"ghost-hurt":window.__advancedAudio?.playSpectralChime?.(["C#5","G5"],"16n");this.tone({type:"sine",freq:1120,freqEnd:320,duration:.32,gain:.24});this.noiseHit({duration:.28,filter:"highpass",freq:3800,gain:.16});break;'),

        ('case"ghost-death":\n  // Dissipating sorrowful soul sigh\n  this.tone({type:"sine",freq:620,freqEnd:110,duration:.65,gain:.16});\n  this.noiseHit({duration:.55,filter:"bandpass",freq:2200,freqEnd:400,q:4,gain:.12});\n  break;',
         'case"ghost-death":window.__advancedAudio?.playSpectralChime?.(["A4","E5","C6"],"4n");this.tone({type:"sine",freq:680,freqEnd:80,duration:.75,gain:.22});this.noiseHit({duration:.60,filter:"bandpass",freq:2600,freqEnd:300,q:4.2,gain:.18});break;'),

        # Dragon
        ('case"dragon-alert":\n  this.tone({type:"sawtooth",freq:110,freqEnd:220,duration:.45,gain:.25});\n  this.noiseHit({duration:.4,filter:"bandpass",freq:600,freqEnd:180,q:2,gain:.22});\n  break;',
         'case"dragon-alert":window.__advancedAudio?.playMonsterRoar?.("C2","4n");window.__advancedAudio?.playMembraneThud?.("C1","8n");this.tone({type:"sawtooth",freq:95,freqEnd:240,duration:.55,gain:.36});this.noiseHit({duration:.48,filter:"bandpass",freq:650,freqEnd:140,q:2.2,gain:.32});break;'),

        ('case"dragon-hurt":\n  // Roar of rage echoing off scales\n  this.tone({type:"sawtooth",freq:160,freqEnd:50,duration:.32,gain:.28});\n  this.noiseHit({duration:.28,filter:"bandpass",freq:750,freqEnd:160,q:2.2,gain:.24});\n  break;',
         'case"dragon-hurt":window.__advancedAudio?.playMonsterRoar?.("D2","8n");this.tone({type:"sawtooth",freq:180,freqEnd:40,duration:.36,gain:.36});this.noiseHit({duration:.32,filter:"bandpass",freq:850,freqEnd:120,q:2.4,gain:.30});break;'),

        ('case"dragon-death":\n  // Apocalyptic dying roar of colossal wyrm\n  this.tone({type:"sawtooth",freq:95,freqEnd:20,duration:1.2,gain:.36});\n  this.tone({type:"sine",freq:55,freqEnd:15,duration:1.4,gain:.30,delay:.15});\n  this.noiseHit({duration:1.1,filter:"lowpass",freq:420,freqEnd:40,gain:.32});\n  break;',
         'case"dragon-death":window.__advancedAudio?.playMonsterRoar?.("G0","2n");window.__advancedAudio?.playMembraneThud?.("E0","4n");this.tone({type:"sawtooth",freq:85,freqEnd:16,duration:1.5,gain:.44});this.tone({type:"sine",freq:45,freqEnd:12,duration:1.7,gain:.36,delay:.15});this.noiseHit({duration:1.3,filter:"lowpass",freq:460,freqEnd:30,gain:.38});break;'),

        # Boss
        ('case"boss-attack":this.tone({type:"sawtooth",freq:95,freqEnd:55,duration:.22,gain:.2});break;',
         'case"boss-attack":window.__advancedAudio?.playMonsterRoar?.("D2","8n");window.__advancedAudio?.playMembraneThud?.("D1","16n");this.tone({type:"sawtooth",freq:110,freqEnd:45,duration:.24,gain:.28});break;'),

        ('case"boss-hit":this.tone({type:"square",freq:110,freqEnd:50,duration:.12,gain:.24}),this.noiseHit({duration:.1,freq:400,gain:.2});break;',
         'case"boss-hit":window.__advancedAudio?.playMembraneThud?.("G1","32n");window.__advancedAudio?.playMetalClang?.("G2","32n");this.tone({type:"sawtooth",freq:130,freqEnd:35,duration:.14,gain:.32}),this.noiseHit({duration:.12,filter:"lowpass",freq:450,gain:.26});break;'),

        ('case"boss-death":this.noiseHit({duration:1.3,freq:500,freqEnd:45,gain:.3}),this.tone({type:"sawtooth",freq:80,freqEnd:25,duration:1.3,gain:.22});break;',
         'case"boss-death":window.__advancedAudio?.playMonsterRoar?.("B0","2n");window.__advancedAudio?.playMembraneThud?.("E0","4n");this.noiseHit({duration:1.5,filter:"lowpass",freq:550,freqEnd:30,gain:.42}),this.tone({type:"sawtooth",freq:95,freqEnd:18,duration:1.5,gain:.36});break;'),

        # Hero Hurts
        ('case"hero-hurt-male":\n  // Visceral grunt of physical trauma ("UGH!")\n  this.tone({type:"sawtooth",freq:175,freqEnd:55,duration:.17,gain:.28});\n  this.tone({type:"triangle",freq:90,freqEnd:40,duration:.15,gain:.18,delay:.01});\n  this.noiseHit({duration:.14,filter:"bandpass",freq:600,freqEnd:160,q:2,gain:.18});\n  break;',
         'case"hero-hurt-male":window.__advancedAudio?.playVocalTone?.("A2","16n");window.__advancedAudio?.playNoiseBurst?.("32n");this.tone({type:"sawtooth",freq:195,freqEnd:48,duration:.18,gain:.32});this.tone({type:"triangle",freq:110,freqEnd:35,duration:.16,gain:.22,delay:.01});this.noiseHit({duration:.15,filter:"bandpass",freq:750,freqEnd:120,q:2.2,gain:.24});break;'),

        ('case"hero-hurt-female":\n  // Sharp gasp and cry under heavy hit ("GAH!")\n  this.tone({type:"triangle",freq:320,freqEnd:110,duration:.15,gain:.26});\n  this.tone({type:"sine",freq:580,freqEnd:220,duration:.12,gain:.16});\n  this.noiseHit({duration:.13,filter:"bandpass",freq:920,freqEnd:280,q:2.8,gain:.16});\n  break;',
         'case"hero-hurt-female":window.__advancedAudio?.playVocalTone?.("D3","16n");window.__advancedAudio?.playNoiseBurst?.("32n");this.tone({type:"triangle",freq:360,freqEnd:95,duration:.16,gain:.30});this.tone({type:"sine",freq:640,freqEnd:180,duration:.13,gain:.20});this.noiseHit({duration:.15,filter:"bandpass",freq:1100,freqEnd:220,q:3.2,gain:.22});break;'),

        # Hero Grunts
        ('case"hero-grunt-warrior":\n  // Powerful muscular war grunt ("HRAAH!")\n  this.tone({type:"sawtooth",freq:140,freqEnd:72,duration:.18,gain:.26});\n  this.tone({type:"triangle",freq:280,freqEnd:130,duration:.16,gain:.18});\n  this.noiseHit({duration:.14,filter:"bandpass",freq:720,freqEnd:260,q:2.2,gain:.14});\n  break;',
         'case"hero-grunt-warrior":window.__advancedAudio?.playVocalTone?.("E2","16n");window.__advancedAudio?.playMembraneThud?.("E1","32n");this.tone({type:"sawtooth",freq:155,freqEnd:65,duration:.19,gain:.32});this.tone({type:"triangle",freq:310,freqEnd:110,duration:.17,gain:.22});this.noiseHit({duration:.15,filter:"bandpass",freq:820,freqEnd:220,q:2.4,gain:.18});break;'),

        ('case"hero-grunt-berserker":\n  // Primal bloodlust battle roar ("WRAAAGH!")\n  this.tone({type:"sawtooth",freq:115,freqEnd:45,duration:.34,gain:.34});\n  this.tone({type:"square",freq:75,freqEnd:30,duration:.28,gain:.24,delay:.02});\n  this.noiseHit({duration:.30,filter:"lowpass",freq:480,gain:.22});\n  break;',
         'case"hero-grunt-berserker":window.__advancedAudio?.playMonsterRoar?.("C2","8n");window.__advancedAudio?.playVocalTone?.("D2","8n");this.tone({type:"sawtooth",freq:135,freqEnd:38,duration:.36,gain:.42});this.tone({type:"square",freq:85,freqEnd:24,duration:.30,gain:.30,delay:.02});this.noiseHit({duration:.32,filter:"lowpass",freq:550,gain:.28});break;'),

        ('case"hero-grunt-mage":\n  // Focused arcane breath of incantation ("AH-UM!")\n  this.tone({type:"sine",freq:240,freqEnd:330,duration:.24,gain:.20});\n  this.tone({type:"triangle",freq:480,freqEnd:190,duration:.20,gain:.14,delay:.03});\n  this.noiseHit({duration:.20,filter:"bandpass",freq:1350,freqEnd:420,q:3.2,gain:.08});\n  break;',
         'case"hero-grunt-mage":window.__advancedAudio?.playSpectralChime?.(["E4","B4"],"16n");this.tone({type:"sine",freq:270,freqEnd:380,duration:.24,gain:.24});this.tone({type:"triangle",freq:540,freqEnd:210,duration:.20,gain:.18,delay:.02});this.noiseHit({duration:.20,filter:"bandpass",freq:1650,freqEnd:380,q:3.5,gain:.12});break;'),

        ('case"hero-grunt-archer":\n  // Sharp focused exhale on release ("HYAH!")\n  this.tone({type:"triangle",freq:310,freqEnd:140,duration:.13,gain:.22});\n  this.noiseHit({duration:.12,filter:"highpass",freq:1600,gain:.15});\n  break;',
         'case"hero-grunt-archer":window.__advancedAudio?.playVocalTone?.("F3","32n");this.tone({type:"triangle",freq:340,freqEnd:120,duration:.14,gain:.26});this.noiseHit({duration:.13,filter:"highpass",freq:1900,gain:.20});break;'),

        ('case"hero-grunt-rogue":\n  // Swift whispered breath ("TSK-HAH!")\n  this.tone({type:"triangle",freq:260,freqEnd:115,duration:.10,gain:.20});\n  this.noiseHit({duration:.09,filter:"bandpass",freq:2400,freqEnd:850,q:3.8,gain:.16});\n  break;',
         'case"hero-grunt-rogue":window.__advancedAudio?.playMetalClang?.("A5","64n");this.tone({type:"triangle",freq:290,freqEnd:95,duration:.11,gain:.24});this.noiseHit({duration:.10,filter:"bandpass",freq:2900,freqEnd:750,q:4.2,gain:.22});break;')
    ]

    for old_s, new_s in replacements:
        assert old_s in bundle, f'Old pattern not found in {target_file}: {old_s[:40]}'
        bundle = bundle.replace(old_s, new_s)

    # 6. ADD HERO GRUNTS FOR HUNTER, DRUID, SHAMAN, NECROMANCER
    extra_hero_grunts = '''case"hero-grunt-hunter":window.__advancedAudio?.playVocalTone?.("G2","32n");this.tone({type:"triangle",freq:280,freqEnd:90,duration:.13,gain:.24});this.noiseHit({duration:.12,filter:"bandpass",freq:1400,freqEnd:350,q:2.5,gain:.18});break;
case"hero-grunt-druid":window.__advancedAudio?.playVocalTone?.("D2","16n");this.tone({type:"sine",freq:180,freqEnd:90,duration:.18,gain:.26});this.noiseHit({duration:.16,filter:"lowpass",freq:600,freqEnd:120,gain:.18});break;
case"hero-grunt-shaman":window.__advancedAudio?.playVocalTone?.("E3","16n");this.tone({type:"sawtooth",freq:320,freqEnd:110,duration:.16,gain:.28});this.noiseHit({duration:.14,filter:"bandpass",freq:1700,freqEnd:420,q:3,gain:.20});break;
case"hero-grunt-necro":window.__advancedAudio?.playSpectralChime?.(["C3","G3"],"16n");this.tone({type:"sawtooth",freq:170,freqEnd:65,duration:.20,gain:.26});this.noiseHit({duration:.18,filter:"bandpass",freq:850,freqEnd:190,q:3.2,gain:.14});break;
'''
    target_after = 'case"hero-grunt-rogue":window.__advancedAudio?.playMetalClang?.("A5","64n");this.tone({type:"triangle",freq:290,freqEnd:95,duration:.11,gain:.24});this.noiseHit({duration:.10,filter:"bandpass",freq:2900,freqEnd:750,q:4.2,gain:.22});break;'
    assert target_after in bundle, f'target_after not found in {target_file}'
    bundle = bundle.replace(target_after, target_after + '\n' + extra_hero_grunts)

    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(bundle)
    print(f"Successfully patched {target_file}")

print("All files patched successfully!")
