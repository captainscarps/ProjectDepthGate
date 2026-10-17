import os
import re
import subprocess

ROOT = r"C:\Users\rafaelscarpille\.gemini\antigravity\scratch\ProjectDepthGate"

# -------------------------------------------------------------
# 1. UPDATE STANDARDIZED CODEX TABS
# -------------------------------------------------------------
codex_file = os.path.join(ROOT, "scripts", "standardized_codex.js")
codex_code = open(codex_file, "r", encoding="utf-8").read()

# Ensure tabs are concise and clean
old_tab_pattern = r'const tabDefs = \[\s*\[[^\]]+ÍNDICE[^\]]+\],\s*\[[^\]]+BIOMAS[^\]]+\],\s*\[[^\]]+HERÓIS[^\]]+\],\s*\[[^\]]+LENDAS[^\]]+\]\s*\];'
new_tab_defs = """const tabDefs = [
      [typeof __L3 === "function" ? __L3("ÍNDICE", "INDEX", "ÍNDICE") : "ÍNDICE", 0x8a6230, () => this.go(1)],
      [typeof __L3 === "function" ? __L3("BIOMAS", "BIOMES", "BIOMAS") : "BIOMAS", 0x3d7055, () => this.go(this.BIOMES_START)],
      [typeof __L3 === "function" ? __L3("HERÓIS", "HEROES", "HÉROES") : "HERÓIS", 0x355a80, () => this.go(this.HEROES_START)],
      [typeof __L3 === "function" ? __L3("LENDAS", "LEGENDS", "LEYENDAS") : "LENDAS", 0x753a48, () => this.go(this.LEGENDS_START)]
    ];"""

# Replace in standardized_codex.js
codex_code = re.sub(r'const tabDefs = \[\s*\[[^\]]+\],\s*\[[^\]]+\],\s*\[[^\]]+\],\s*\[[^\]]+\]\s*\];', new_tab_defs, codex_code)
# Ensure tabW is 125, tabH is 18, fontSize is 9px bold
codex_code = re.sub(r'const tabW = \d+, tabH = \d+', 'const tabW = 125, tabH = 18', codex_code)
open(codex_file, "w", encoding="utf-8").write(codex_code)
print("[OK] Updated standardized_codex.js tabs.")


# -------------------------------------------------------------
# 2. AUDIO OVERHAUL DEFINITIONS
# -------------------------------------------------------------
NEW_ADVANCED_AUDIO = """window.__advancedAudio = {
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

        // Sub-bass impact MembraneSynth (punchy, deep organic thud, non-melodic)
        if (!this.synths.membrane && window.Tone.MembraneSynth) {
          this.synths.membrane = new window.Tone.MembraneSynth({
            pitchDecay: 0.045,
            octaves: 4.0,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.05 }
          }).connect(masterOut);
          this.synths.membrane.volume.value = -6;
        }

        // Metallic blade clashing & armor hit synth (inharmonic metallic clatter)
        if (!this.synths.metal && window.Tone.MetalSynth) {
          this.synths.metal = new window.Tone.MetalSynth({
            frequency: 180,
            envelope: { attack: 0.001, decay: 0.08, release: 0.03 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 2800,
            octaves: 1.5
          }).connect(masterOut);
          this.synths.metal.volume.value = -12;
        }

        // NoiseSynth for blade swooshes and bone crunch bursts
        if (!this.synths.noise && window.Tone.NoiseSynth) {
          this.synths.noise = new window.Tone.NoiseSynth({
            noise: { type: "pink" },
            envelope: { attack: 0.001, decay: 0.08, sustain: 0 }
          }).connect(masterOut);
          this.synths.noise.volume.value = -9;
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
      if (this.synths.membrane) this.synths.membrane.triggerAttackRelease("C1", duration);
    } catch(e) {}
  },

  playMetalClang: function(note = "D4", duration = "32n") {
    try {
      if (!this.toneReady) this.unlock();
      if (this.synths.metal) this.synths.metal.triggerAttackRelease("C3", duration);
    } catch(e) {}
  },

  playMonsterRoar: function(note = "F1", duration = "8n") {
    try {
      if (!this.toneReady) this.unlock();
      if (this.synths.membrane) this.synths.membrane.triggerAttackRelease("A0", "8n");
      if (this.synths.noise) this.synths.noise.triggerAttackRelease("16n");
    } catch(e) {}
  },

  playVocalTone: function(note = "G2", duration = "16n") {
    try {
      if (!this.toneReady) this.unlock();
      if (this.synths.noise) this.synths.noise.triggerAttackRelease("32n");
      if (this.synths.membrane) this.synths.membrane.triggerAttackRelease("C1", "32n");
    } catch(e) {}
  },

  playSpectralChime: function(notes = ["E3", "B3", "E4"], duration = "8n") {
    try {
      if (!this.toneReady) this.unlock();
      if (this.synths.noise) this.synths.noise.triggerAttackRelease(duration);
    } catch(e) {}
  },

  playNoiseBurst: function(duration = "32n") {
    try {
      if (!this.toneReady) this.unlock();
      if (this.synths.noise) this.synths.noise.triggerAttackRelease(duration);
    } catch(e) {}
  }
};"""

def patch_file(rel_path):
    full_path = os.path.join(ROOT, rel_path)
    content = open(full_path, "r", encoding="utf-8").read()

    # 1. REPLACE CODEX SCENE
    codex_start = content.find('class __CodexScene extends')
    codex_end = content.find('class __BookScene extends')
    if codex_start != -1 and codex_end != -1:
        new_codex = open(codex_file, "r", encoding="utf-8").read()
        content = content[:codex_start] + new_codex + content[codex_end:]
        print(f"[OK] Replaced __CodexScene in {rel_path}")

    # 2. OVERHAUL __advancedAudio
    aa_start = content.find('window.__advancedAudio = {')
    aa_end = content.find('class zr{', aa_start)
    if aa_start != -1 and aa_end != -1:
        content = content[:aa_start] + NEW_ADVANCED_AUDIO + "\n" + content[aa_end:]
        print(f"[OK] Replaced __advancedAudio in {rel_path}")

    # 3. OVERHAUL SFX SWITCH COMBAT & MONSTER & HERO CASES
    # Replace the tonal combat sounds with visceral noise & physical impacts
    
    # Shield block
    content = re.sub(
        r'case"shield-block":[^:]+?break;',
        r'case"shield-block":window.__advancedAudio?.playMetalClang?.("parry","16n");window.__advancedAudio?.playMembraneThud?.("block","16n");this.noiseHit({duration:.025,filter:"highpass",freq:3800,gain:.38,priority:3});this.noiseHit({duration:.12,filter:"bandpass",freq:1200,freqEnd:400,q:3.5,gain:.32,priority:3});this.noiseHit({duration:.15,filter:"lowpass",freq:220,freqEnd:60,gain:.40,priority:3});break;',
        content
    )
    content = re.sub(
        r'case"shield-block-heavy":[^:]+?break;',
        r'case"shield-block-heavy":window.__advancedAudio?.playMetalClang?.("heavy","16n");window.__advancedAudio?.playMembraneThud?.("heavy","16n");this.noiseHit({duration:.03,filter:"highpass",freq:2800,gain:.42,priority:3});this.noiseHit({duration:.16,filter:"bandpass",freq:800,freqEnd:220,q:2.8,gain:.38,priority:3});this.noiseHit({duration:.20,filter:"lowpass",freq:150,freqEnd:40,gain:.48,priority:3});break;',
        content
    )

    # Attack & Hit
    content = re.sub(
        r'case"attack":[^:]+?break;',
        r'case"attack":window.__advancedAudio?.playNoiseBurst?.("32n");this.noiseHit({duration:.09,filter:"bandpass",freq:850,freqEnd:260,q:1.6,gain:.22,priority:1});break;',
        content
    )
    content = re.sub(
        r'case"hit":[^:]+?break;',
        r'case"hit":window.__advancedAudio?.playMembraneThud?.("hit","16n");window.__advancedAudio?.playNoiseBurst?.("16n");this.noiseHit({duration:.02,filter:"highpass",freq:2400,gain:.38,priority:3});this.noiseHit({duration:.11,filter:"bandpass",freq:360,freqEnd:110,q:2.2,gain:.42,priority:3});this.noiseHit({duration:.08,filter:"lowpass",freq:95,freqEnd:25,gain:.45,priority:3});break;',
        content
    )

    # Player hurt & Enemy death
    content = re.sub(
        r'case"player-hurt":[^:]+?break;',
        r'case"player-hurt":window.__advancedAudio?.playVocalTone?.("hurt","16n");this.noiseHit({duration:.12,filter:"bandpass",freq:420,freqEnd:180,q:3.0,gain:.36,priority:3});this.noiseHit({duration:.09,filter:"lowpass",freq:110,freqEnd:35,gain:.38,priority:3});break;',
        content
    )
    content = re.sub(
        r'case"enemy-death":[^:]+?break;',
        r'case"enemy-death":window.__advancedAudio?.playNoiseBurst?.("16n");this.noiseHit({duration:.025,filter:"highpass",freq:2800,gain:.32,priority:2});this.noiseHit({duration:.22,filter:"bandpass",freq:420,freqEnd:90,q:2.2,gain:.38,priority:2});this.noiseHit({duration:.30,filter:"lowpass",freq:150,freqEnd:25,gain:.34,priority:2});break;',
        content
    )

    # Specific attacks (satyr, shadow demon, boss)
    content = re.sub(
        r'case"satyr-attack":[^:]+?break;',
        r'case"satyr-attack":window.__advancedAudio?.playMonsterRoar?.("satyr","8n");this.noiseHit({duration:.14,filter:"bandpass",freq:1800,freqEnd:350,q:2.0,gain:.34,priority:2});this.noiseHit({duration:.22,filter:"bandpass",freq:280,freqEnd:110,q:3.5,gain:.38,priority:2});break;',
        content
    )
    content = re.sub(
        r'case"shadow-demon-attack":[^:]+?break;',
        r'case"shadow-demon-attack":window.__advancedAudio?.playSpectralChime?.(null,"16n");this.noiseHit({duration:.24,filter:"bandpass",freq:1400,freqEnd:220,q:2.8,gain:.36,priority:2});this.noiseHit({duration:.28,filter:"lowpass",freq:300,freqEnd:60,gain:.38,priority:2});break;',
        content
    )
    content = re.sub(
        r'case"boss-attack":[^:]+?break;',
        r'case"boss-attack":window.__advancedAudio?.playMonsterRoar?.("boss","8n");window.__advancedAudio?.playMembraneThud?.("boss","16n");this.noiseHit({duration:.18,filter:"bandpass",freq:650,freqEnd:120,q:2.2,gain:.42,priority:3});this.noiseHit({duration:.26,filter:"lowpass",freq:180,freqEnd:35,gain:.48,priority:3});break;',
        content
    )
    content = re.sub(
        r'case"boss-hit":[^:]+?break;',
        r'case"boss-hit":window.__advancedAudio?.playMetalClang?.("heavy","32n");window.__advancedAudio?.playMembraneThud?.("heavy","16n");this.noiseHit({duration:.03,filter:"highpass",freq:2200,gain:.42,priority:3});this.noiseHit({duration:.14,filter:"bandpass",freq:500,freqEnd:140,q:3.0,gain:.46,priority:3});this.noiseHit({duration:.18,filter:"lowpass",freq:140,freqEnd:35,gain:.50,priority:3});break;',
        content
    )
    content = re.sub(
        r'case"boss-death":[^:]+?break;',
        r'case"boss-death":window.__advancedAudio?.playMonsterRoar?.("death","2n");window.__advancedAudio?.playMembraneThud?.("death","4n");this.noiseHit({duration:.04,filter:"highpass",freq:1800,gain:.45,priority:3});this.noiseHit({duration:1.4,filter:"lowpass",freq:450,freqEnd:25,gain:.46,priority:3});this.noiseHit({duration:.9,filter:"bandpass",freq:320,freqEnd:40,q:2.5,gain:.40,delay:.2,priority:3});break;',
        content
    )

    # Skeleton sounds (dry bone rattle & chainmail)
    content = re.sub(
        r'case"skeleton-alert":[^:]+?break;',
        r'case"skeleton-alert":window.__advancedAudio?.playMetalClang?.("rattle","32n");this.noiseHit({duration:.025,filter:"highpass",freq:3400,gain:.28});this.noiseHit({duration:.12,filter:"bandpass",freq:2200,freqEnd:800,q:4.8,gain:.24,delay:.02});break;',
        content
    )
    content = re.sub(
        r'case"skeleton-hurt":[^:]+?break;',
        r'case"skeleton-hurt":window.__advancedAudio?.playMetalClang?.("bone","32n");this.noiseHit({duration:.02,filter:"highpass",freq:3800,gain:.35});this.noiseHit({duration:.10,filter:"bandpass",freq:2600,freqEnd:650,q:5.2,gain:.32});this.noiseHit({duration:.08,filter:"lowpass",freq:220,gain:.24,delay:.01});break;',
        content
    )
    content = re.sub(
        r'case"skeleton-death":[^:]+?break;',
        r'case"skeleton-death":window.__advancedAudio?.playMembraneThud?.("fall","16n");for(let b=0;b<5;b++){const bt=b*.045;this.noiseHit({duration:.03,filter:"highpass",freq:3200-b*300,gain:.30-b*0.04,delay:bt});this.noiseHit({duration:.08,filter:"bandpass",freq:1800-b*220,freqEnd:400,q:4.5,gain:.24-b*0.03,delay:bt});}break;',
        content
    )

    # Goblin sounds (raspy screech and chitter)
    content = re.sub(
        r'case"goblin-alert":[^:]+?break;',
        r'case"goblin-alert":window.__advancedAudio?.playMonsterRoar?.("goblin","16n");this.noiseHit({duration:.11,filter:"bandpass",freq:1600,freqEnd:750,q:3.2,gain:.24});this.noiseHit({duration:.08,filter:"highpass",freq:2400,gain:.18,delay:.02});break;',
        content
    )
    content = re.sub(
        r'case"goblin-hurt":[^:]+?break;',
        r'case"goblin-hurt":window.__advancedAudio?.playMonsterRoar?.("goblin","16n");this.noiseHit({duration:.14,filter:"bandpass",freq:1900,freqEnd:550,q:3.8,gain:.32});this.noiseHit({duration:.09,filter:"lowpass",freq:320,gain:.26,delay:.02});break;',
        content
    )
    content = re.sub(
        r'case"goblin-death":[^:]+?break;',
        r'case"goblin-death":window.__advancedAudio?.playMonsterRoar?.("goblin","16n");window.__advancedAudio?.playMembraneThud?.("fall","16n");this.noiseHit({duration:.22,filter:"bandpass",freq:1500,freqEnd:220,q:3.0,gain:.32});this.noiseHit({duration:.25,filter:"lowpass",freq:140,freqEnd:30,gain:.28,delay:.08});break;',
        content
    )

    # Orc sounds (heavy guttural bass rumble and chest breath)
    content = re.sub(
        r'case"orc-alert":[^:]+?break;',
        r'case"orc-alert":window.__advancedAudio?.playMonsterRoar?.("orc","8n");this.noiseHit({duration:.22,filter:"bandpass",freq:320,freqEnd:90,q:2.2,gain:.30});this.noiseHit({duration:.20,filter:"lowpass",freq:160,freqEnd:40,gain:.28});break;',
        content
    )
    content = re.sub(
        r'case"orc-hurt":[^:]+?break;',
        r'case"orc-hurt":window.__advancedAudio?.playMonsterRoar?.("orc","8n");this.noiseHit({duration:.24,filter:"bandpass",freq:280,freqEnd:70,q:2.5,gain:.38});this.noiseHit({duration:.22,filter:"lowpass",freq:140,freqEnd:35,gain:.36});break;',
        content
    )
    content = re.sub(
        r'case"orc-death":[^:]+?break;',
        r'case"orc-death":window.__advancedAudio?.playMonsterRoar?.("orc","4n");window.__advancedAudio?.playMembraneThud?.("fall","8n");this.noiseHit({duration:.45,filter:"bandpass",freq:240,freqEnd:45,q:2.2,gain:.40});this.noiseHit({duration:.55,filter:"lowpass",freq:120,freqEnd:25,gain:.42,delay:.1});break;',
        content
    )

    # Demon sounds (unearthly rushing wind and low dread rumble)
    content = re.sub(
        r'case"demon-alert":[^:]+?break;',
        r'case"demon-alert":window.__advancedAudio?.playSpectralChime?.(null,"8n");this.noiseHit({duration:.28,filter:"bandpass",freq:1200,freqEnd:260,q:2.8,gain:.26});this.noiseHit({duration:.25,filter:"lowpass",freq:220,freqEnd:45,gain:.28});break;',
        content
    )
    content = re.sub(
        r'case"demon-hurt":[^:]+?break;',
        r'case"demon-hurt":window.__advancedAudio?.playMonsterRoar?.("demon","8n");this.noiseHit({duration:.24,filter:"bandpass",freq:1500,freqEnd:320,q:3.0,gain:.34});this.noiseHit({duration:.20,filter:"lowpass",freq:180,freqEnd:40,gain:.32});break;',
        content
    )
    content = re.sub(
        r'case"demon-death":[^:]+?break;',
        r'case"demon-death":window.__advancedAudio?.playMonsterRoar?.("demon","4n");window.__advancedAudio?.playMembraneThud?.("abyss","8n");this.noiseHit({duration:.60,filter:"bandpass",freq:1100,freqEnd:90,q:2.8,gain:.38});this.noiseHit({duration:.70,filter:"lowpass",freq:160,freqEnd:25,gain:.40,delay:.05});break;',
        content
    )

    # Ghost sounds (ethereal chill wind)
    content = re.sub(
        r'case"ghost-alert":[^:]+?break;',
        r'case"ghost-alert":window.__advancedAudio?.playSpectralChime?.(null,"8n");this.noiseHit({duration:.38,filter:"bandpass",freq:1400,freqEnd:420,q:3.2,gain:.20});break;',
        content
    )
    content = re.sub(
        r'case"ghost-hurt":[^:]+?break;',
        r'case"ghost-hurt":window.__advancedAudio?.playSpectralChime?.(null,"16n");this.noiseHit({duration:.28,filter:"bandpass",freq:1800,freqEnd:500,q:3.5,gain:.26});break;',
        content
    )
    content = re.sub(
        r'case"ghost-death":[^:]+?break;',
        r'case"ghost-death":window.__advancedAudio?.playSpectralChime?.(null,"4n");this.noiseHit({duration:.65,filter:"bandpass",freq:1200,freqEnd:180,q:3.0,gain:.28});break;',
        content
    )

    # Troll sounds
    content = re.sub(
        r'case"troll-alert":[^:]+?break;',
        r'case"troll-alert":this.noiseHit({duration:.35,filter:"lowpass",freq:160,freqEnd:40,gain:.32});break;',
        content
    )
    content = re.sub(
        r'case"troll-hurt":[^:]+?break;',
        r'case"troll-hurt":this.noiseHit({duration:.30,filter:"lowpass",freq:180,freqEnd:35,gain:.36});this.noiseHit({duration:.25,filter:"bandpass",freq:300,freqEnd:80,q:2,gain:.30});break;',
        content
    )
    content = re.sub(
        r'case"troll-death":[^:]+?break;',
        r'case"troll-death":this.noiseHit({duration:.85,filter:"lowpass",freq:200,freqEnd:25,gain:.42});this.noiseHit({duration:.45,filter:"lowpass",freq:90,gain:.38,delay:.40});break;',
        content
    )

    # Dragon sounds
    content = re.sub(
        r'case"dragon-alert":[^:]+?break;',
        r'case"dragon-alert":window.__advancedAudio?.playMonsterRoar?.("dragon","4n");window.__advancedAudio?.playMembraneThud?.("dragon","8n");this.noiseHit({duration:.55,filter:"bandpass",freq:650,freqEnd:110,q:2.2,gain:.38});this.noiseHit({duration:.50,filter:"lowpass",freq:220,freqEnd:30,gain:.36});break;',
        content
    )
    content = re.sub(
        r'case"dragon-hurt":[^:]+?break;',
        r'case"dragon-hurt":window.__advancedAudio?.playMonsterRoar?.("dragon","8n");this.noiseHit({duration:.36,filter:"bandpass",freq:750,freqEnd:120,q:2.4,gain:.38});this.noiseHit({duration:.32,filter:"lowpass",freq:180,freqEnd:35,gain:.34});break;',
        content
    )
    content = re.sub(
        r'case"dragon-death":[^:]+?break;',
        r'case"dragon-death":window.__advancedAudio?.playMonsterRoar?.("dragon","2n");window.__advancedAudio?.playMembraneThud?.("dragon","4n");this.noiseHit({duration:1.5,filter:"lowpass",freq:320,freqEnd:20,gain:.48});this.noiseHit({duration:1.2,filter:"bandpass",freq:550,freqEnd:40,q:2.0,gain:.42,delay:.15});break;',
        content
    )

    # Beast sounds
    content = re.sub(
        r'case"beast-alert":[^:]+?break;',
        r'case"beast-alert":window.__advancedAudio?.playMonsterRoar?.("beast","8n");this.noiseHit({duration:.20,filter:"bandpass",freq:480,freqEnd:120,q:2.5,gain:.26});break;',
        content
    )
    content = re.sub(
        r'case"beast-hurt":[^:]+?break;',
        r'case"beast-hurt":window.__advancedAudio?.playMonsterRoar?.("beast","16n");this.noiseHit({duration:.20,filter:"bandpass",freq:650,freqEnd:140,q:3.0,gain:.34});this.noiseHit({duration:.15,filter:"lowpass",freq:160,gain:.28});break;',
        content
    )
    content = re.sub(
        r'case"beast-death":[^:]+?break;',
        r'case"beast-death":window.__advancedAudio?.playMonsterRoar?.("beast","8n");window.__advancedAudio?.playMembraneThud?.("fall","16n");this.noiseHit({duration:.45,filter:"bandpass",freq:420,freqEnd:80,q:2.5,gain:.35});this.noiseHit({duration:.40,filter:"lowpass",freq:140,freqEnd:25,gain:.32,delay:.08});break;',
        content
    )

    # Boss evil laughs (rasping sinister chuckles, zero sawtooth)
    content = re.sub(
        r'case"boss-evil-laugh-deep":[^:]+?break;',
        r'case"boss-evil-laugh-deep":for(let l=0;l<4;l++){const lt=l*.19;this.noiseHit({duration:.15,filter:"bandpass",freq:380-l*35,freqEnd:160,q:3.2,gain:.28,delay:lt});this.noiseHit({duration:.12,filter:"lowpass",freq:140,freqEnd:40,gain:.22,delay:lt});}break;',
        content
    )
    content = re.sub(
        r'case"boss-evil-laugh-wicked":[^:]+?break;',
        r'case"boss-evil-laugh-wicked":for(let l=0;l<5;l++){const lt=l*.13;this.noiseHit({duration:.11,filter:"bandpass",freq:680-l*40,freqEnd:240,q:3.8,gain:.24,delay:lt});this.noiseHit({duration:.08,filter:"highpass",freq:1200,gain:.14,delay:lt});}break;',
        content
    )

    # Hero exertion grunts and screams of pain (human vocal tract formants)
    content = re.sub(
        r'case"hero-grunt-warrior":[^:]+?break;',
        r'case"hero-grunt-warrior":window.__advancedAudio?.playVocalTone?.("grunt","16n");this.noiseHit({duration:.15,filter:"bandpass",freq:320,freqEnd:140,q:2.5,gain:.32});this.noiseHit({duration:.10,filter:"lowpass",freq:130,gain:.26});break;',
        content
    )
    content = re.sub(
        r'case"hero-grunt-mage":[^:]+?break;',
        r'case"hero-grunt-mage":window.__advancedAudio?.playVocalTone?.("grunt","16n");this.noiseHit({duration:.16,filter:"bandpass",freq:440,freqEnd:180,q:2.8,gain:.26});break;',
        content
    )
    content = re.sub(
        r'case"hero-grunt-archer":[^:]+?break;',
        r'case"hero-grunt-archer":window.__advancedAudio?.playVocalTone?.("grunt","32n");this.noiseHit({duration:.13,filter:"bandpass",freq:480,freqEnd:190,q:3.0,gain:.26});break;',
        content
    )
    content = re.sub(
        r'case"hero-grunt-rogue":[^:]+?break;',
        r'case"hero-grunt-rogue":window.__advancedAudio?.playNoiseBurst?.("32n");this.noiseHit({duration:.10,filter:"bandpass",freq:550,freqEnd:220,q:3.2,gain:.24});break;',
        content
    )
    content = re.sub(
        r'case"hero-grunt-hunter":[^:]+?break;',
        r'case"hero-grunt-hunter":window.__advancedAudio?.playVocalTone?.("grunt","32n");this.noiseHit({duration:.12,filter:"bandpass",freq:360,freqEnd:150,q:2.6,gain:.25});break;',
        content
    )
    content = re.sub(
        r'case"hero-grunt-druid":[^:]+?break;',
        r'case"hero-grunt-druid":window.__advancedAudio?.playVocalTone?.("grunt","16n");this.noiseHit({duration:.15,filter:"bandpass",freq:290,freqEnd:120,q:2.4,gain:.26});break;',
        content
    )
    content = re.sub(
        r'case"hero-grunt-shaman":[^:]+?break;',
        r'case"hero-grunt-shaman":window.__advancedAudio?.playVocalTone?.("grunt","16n");this.noiseHit({duration:.15,filter:"bandpass",freq:340,freqEnd:140,q:2.6,gain:.28});break;',
        content
    )
    content = re.sub(
        r'case"hero-grunt-necro":[^:]+?break;',
        r'case"hero-grunt-necro":window.__advancedAudio?.playVocalTone?.("grunt","16n");this.noiseHit({duration:.16,filter:"bandpass",freq:280,freqEnd:110,q:2.8,gain:.26});break;',
        content
    )
    content = re.sub(
        r'case"hero-grunt-berserker":[^:]+?break;',
        r'case"hero-grunt-berserker":window.__advancedAudio?.playMonsterRoar?.("berserk","8n");this.noiseHit({duration:.28,filter:"bandpass",freq:260,freqEnd:80,q:2.2,gain:.38});this.noiseHit({duration:.24,filter:"lowpass",freq:160,freqEnd:35,gain:.36});break;',
        content
    )

    # Hero hurt & death
    content = re.sub(
        r'case"hero-hurt-male":[^:]+?break;',
        r'case"hero-hurt-male":window.__advancedAudio?.playVocalTone?.("hurt","16n");this.noiseHit({duration:.14,filter:"bandpass",freq:360,freqEnd:140,q:2.5,gain:.34});this.noiseHit({duration:.10,filter:"lowpass",freq:120,gain:.28});break;',
        content
    )
    content = re.sub(
        r'case"hero-hurt-female":[^:]+?break;',
        r'case"hero-hurt-female":window.__advancedAudio?.playVocalTone?.("hurt","16n");this.noiseHit({duration:.14,filter:"bandpass",freq:520,freqEnd:210,q:2.8,gain:.32});this.noiseHit({duration:.09,filter:"lowpass",freq:140,gain:.24});break;',
        content
    )
    content = re.sub(
        r'case"hero-death-male":[^:]+?break;',
        r'case"hero-death-male":this.noiseHit({duration:.55,filter:"bandpass",freq:320,freqEnd:60,q:2.2,gain:.34});this.noiseHit({duration:.45,filter:"lowpass",freq:110,freqEnd:25,gain:.30,delay:.1});break;',
        content
    )
    content = re.sub(
        r'case"hero-death-female":[^:]+?break;',
        r'case"hero-death-female":this.noiseHit({duration:.50,filter:"bandpass",freq:480,freqEnd:90,q:2.5,gain:.32});this.noiseHit({duration:.40,filter:"lowpass",freq:120,freqEnd:25,gain:.26,delay:.1});break;',
        content
    )

    open(full_path, "w", encoding="utf-8").write(content)
    print(f"[OK] Patched all combat & enemy & hero SFX in {rel_path}")

    # Syntax check with Node
    res = subprocess.run(["node", "-c", full_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode == 0:
        print(f"[SUCCESS] Syntax check PASSED for {rel_path}")
    else:
        print(f"[ERROR] Syntax check FAILED for {rel_path}:\n{res.stderr}")
        return False

    return True

if __name__ == "__main__":
    patch_file(r"assets\index-D6qIWtA7-p209.js")
    if os.path.exists(os.path.join(ROOT, r"Projeto atualizado\assets\index-D6qIWtA7-p209.js")):
        patch_file(r"Projeto atualizado\assets\index-D6qIWtA7-p209.js")
