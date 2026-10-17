import os
import re
import subprocess

ROOT = r"C:\Users\rafaelscarpille\.gemini\antigravity\scratch\ProjectDepthGate"

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

    # -------------------------------------------------------------
    # 1. FIX CLASS SELECT ABILITIES POSITION ON WIDESCREEN / STRETCH
    # -------------------------------------------------------------
    old_ab = 'y+=4*13+8;const ab=(t.abilities??[]).slice(0,3);this.abIcons.forEach((im,k)=>{const a=ab[k]&&Ye[ab[k]];a&&this.textures.exists(a.icon)?im.setTexture(a.icon).setPosition(533+(k-1)*34,y+12).setVisible(!0).setAlpha(lk?.35:1):im.setVisible(!1)}),this.abTxt.setY(y+28).setText(ab.map(id=>St(`abn.${id}`,Ye[id]?.name??id)).join("  ·  "));this.redraw()}'
    new_ab = 'y+=4*13+8;const ab=(t.abilities??[]).slice(0,3),cx=this.nameTxt?.x??(533+Math.round((_-640)/2));this.abIcons.forEach((im,k)=>{const a=ab[k]&&Ye[ab[k]];a&&this.textures.exists(a.icon)?im.setTexture(a.icon).setPosition(cx+(k-1)*34,y+12).setVisible(!0).setAlpha(lk?.35:1):im.setVisible(!1)}),this.abTxt.setX(cx).setY(y+28).setText(ab.map(id=>St(`abn.${id}`,Ye[id]?.name??id)).join("  ·  "));this.redraw()}'
    
    if old_ab in content:
        content = content.replace(old_ab, new_ab, 1)
        print(f"[OK] Patched ClassSelect abilities in {rel_path}")
    else:
        m = re.search(r'y\+=4\*13\+8;const ab=\(t\.abilities\?\?\[\]\)\.slice\(0,3\);this\.abIcons\.forEach\(\(im,k\)=>\{const a=ab\[k\]&&Ye\[ab\[k\]\];a&&this\.textures\.exists\(a\.icon\)\?im\.setTexture\(a\.icon\)\.setPosition\(533\+\(k-1\)\*34,y\+12\)\.setVisible\(!0\)\.setAlpha\(lk\?\.35:1\):im\.setVisible\(!1\)\}\),this\.abTxt\.setY\(y\+28\)\.setText\(ab\.map\(id=>St\(`abn\.\$\{id\}`,Ye\[id\]\?\.name\?\?id\)\)\.join\([^\)]+\)\);this\.redraw\(\)\}', content)
        if m:
            content = content.replace(m.group(0), new_ab, 1)
            print(f"[OK] Patched ClassSelect abilities (via regex) in {rel_path}")

    # -------------------------------------------------------------
    # 2. STANDARDIZE CODEX (TABS BOUNDS & ZERO TEXT OVERFLOW)
    # -------------------------------------------------------------
    codex_start = content.find('class __CodexScene extends')
    codex_end = content.find('class __BookScene extends')
    if codex_start != -1 and codex_end != -1:
        new_codex = open(os.path.join(ROOT, "scripts", "standardized_codex.js"), "r", encoding="utf-8").read()
        content = content[:codex_start] + new_codex + content[codex_end:]
        print(f"[OK] Replaced __CodexScene with standardized implementation in {rel_path}")

    # -------------------------------------------------------------
    # 3. FIX BESTIARY KILL COUNTERS (DATA NORMALIZATION & DISPLAY)
    # -------------------------------------------------------------
    p_bk = content.find("function __bkKills()")
    p_bk_end = content.find("function __bkEntries()", p_bk)
    if p_bk != -1 and p_bk_end != -1:
        new_bk_logic = """function __bkKills() {
  try {
    const raw = JSON.parse(localStorage.getItem("depthgate:bestiary") || "{}");
    if (raw["SATYR_SISTERS"]) {
      const leg = raw["SATYR_SISTERS"], c = (typeof leg === "object" ? leg.campaign : Number(leg)) || 0, e = (typeof leg === "object" ? leg.endless : 0) || 0;
      raw["SATYR_SISTER_1"] ||= { campaign: c, endless: e, total: c + e };
      raw["SATYR_SISTER_2"] ||= { campaign: c, endless: e, total: c + e };
    }
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === "number") {
        raw[k] = { campaign: v, endless: 0, total: v };
      } else if (typeof v === "object" && v !== null) {
        const c = Number(v.campaign) || 0, e = Number(v.endless) || 0, t = Number(v.total) || (c + e);
        raw[k] = { campaign: c, endless: e, total: t };
      }
    }
    return raw;
  } catch (e) { return {} }
}
function __bkKill(k, isEndless = false) {
  if (!k) return;
  const K = __bkKills();
  let entry = K[k];
  if (!entry || typeof entry !== "object") {
    const n = typeof entry === "number" ? entry : 0;
    entry = { campaign: n, endless: 0, total: n };
  }
  if (isEndless) {
    entry.endless = (entry.endless || 0) + 1;
  } else {
    entry.campaign = (entry.campaign || 0) + 1;
  }
  entry.total = (entry.campaign || 0) + (entry.endless || 0);
  K[k] = entry;
  try { localStorage.setItem("depthgate:bestiary", JSON.stringify(K)) } catch (e) { }
}
function __bestTrack(G) {
  if (!G || G.__bkTr) return; G.__bkTr = !0;
  const isEnd = () => { try { return G.registry?.get("mode") === "endless"; } catch(e) { return false; } };
  G.events.on("enemy:died", e => { e && !e.isMinion && __bkKill(e.typeKey, isEnd()) });
  G.events.on("boss:defeated", b => __bkKill(b?.typeKey, isEnd()));
}
"""
        content = content[:p_bk] + new_bk_logic + content[p_bk_end:]
        print(f"[OK] Patched __bkKills, __bkKill and __bestTrack in {rel_path}")

    # Bestiary display logic
    p_pe = content.find("const kd = this.K[e.k]")
    p_pe_end = content.find("this.T(L, X + PW / 2, 300, kTxt", p_pe)
    if p_pe != -1 and p_pe_end != -1:
        new_pe_kill = """const rawKd = this.K[e.k];
    let tot = 0, cK = 0, eK = 0;
    if (typeof rawKd === "number") { tot = rawKd; cK = rawKd; eK = 0; }
    else if (typeof rawKd === "object" && rawKd !== null) {
      cK = Number(rawKd.campaign) || 0;
      eK = Number(rawKd.endless) || 0;
      tot = Number(rawKd.total) || (cK + eK);
    }
    const kTxt = tot > 0 ? `${__L3("Derrotados", "Defeated", "Derrotados")}: ${tot} (Campanha: ${cK} | Infinito: ${eK})` : __L3("Ainda não derrotado", "Not yet defeated", "Aún no derrotado");
    """
        content = content[:p_pe] + new_pe_kill + content[p_pe_end:]
        print(f"[OK] Patched Bestiary pageEntryL kill display in {rel_path}")

    # -------------------------------------------------------------
    # 4. OVERHAUL __advancedAudio
    # -------------------------------------------------------------
    aa_start = content.find('window.__advancedAudio = {')
    aa_end = content.find('class zr{', aa_start)
    if aa_start != -1 and aa_end != -1:
        content = content[:aa_start] + NEW_ADVANCED_AUDIO + "\n" + content[aa_end:]
        print(f"[OK] Overhauled __advancedAudio in {rel_path}")

    # -------------------------------------------------------------
    # 5. OVERHAUL SFX COMBAT, ENEMY, BOSS & HERO SOUNDS (NO TONAL BEEPS)
    # -------------------------------------------------------------
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
    print(f"[OK] Patched all elements in {rel_path}")

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
