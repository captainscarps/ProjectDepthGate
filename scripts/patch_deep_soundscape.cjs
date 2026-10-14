const fs = require('fs');

const files = [
  'assets/index-D6qIWtA7-p209.js',
  'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // 1. SHIELD BLOCK (Crisp metallic deflection and shield thud)
  const oldShieldBlock = 'case"shield-block":this.tone({type:"square",freq:320,freqEnd:170,duration:.08,gain:.2,priority:2}),this.noiseHit({duration:.09,filter:"bandpass",freq:2200,freqEnd:900,q:4,gain:.16,priority:2});break;';
  const newShieldBlock = 'case"shield-block":this.tone({type:"triangle",freq:420,freqEnd:210,duration:.12,gain:.22,priority:2}),this.tone({type:"sine",freq:840,freqEnd:380,duration:.08,gain:.14,priority:2}),this.noiseHit({duration:.07,filter:"bandpass",freq:1900,freqEnd:600,q:3.5,gain:.18,priority:2});break;';
  if (code.includes(oldShieldBlock)) {
    code = code.replace(oldShieldBlock, newShieldBlock);
    console.log(`[${file}] Patched shield-block with authentic metal deflection resonance.`);
  }

  // 2. SHIELD BLOCK HEAVY (Massive fortress shield clang and ground vibration)
  const oldShieldBlockHeavy = 'case"shield-block-heavy":this.tone({type:"square",freq:240,freqEnd:110,duration:.14,gain:.26,priority:2}),this.noiseHit({duration:.16,filter:"bandpass",freq:1600,freqEnd:500,q:3,gain:.2,priority:2});break;';
  const newShieldBlockHeavy = 'case"shield-block-heavy":this.tone({type:"triangle",freq:260,freqEnd:90,duration:.22,gain:.28,priority:2}),this.tone({type:"sine",freq:520,freqEnd:160,duration:.16,gain:.16,priority:2}),this.noiseHit({duration:.18,filter:"bandpass",freq:1400,freqEnd:320,q:2.8,gain:.24,priority:2}),this.tone({type:"sine",freq:55,freqEnd:30,duration:.25,gain:.2,priority:2});break;';
  if (code.includes(oldShieldBlockHeavy)) {
    code = code.replace(oldShieldBlockHeavy, newShieldBlockHeavy);
    console.log(`[${file}] Patched shield-block-heavy with deep reverberating tower shield resonance.`);
  }

  // 3. ATTACK MISS (Aerodynamic blade whistling through thin air)
  const oldAttackMiss = 'case"attack-miss":this.noiseHit({duration:.09,filter:"bandpass",freq:700,freqEnd:1600,q:2.5,gain:.07});break;';
  const newAttackMiss = 'case"attack-miss":this.noiseHit({duration:.13,filter:"bandpass",freq:650,freqEnd:1850,q:2.8,gain:.11}),this.tone({type:"sine",freq:540,freqEnd:210,duration:.11,gain:.04});break;';
  if (code.includes(oldAttackMiss)) {
    code = code.replace(oldAttackMiss, newAttackMiss);
    console.log(`[${file}] Patched attack-miss with clean aerodynamic blade whoosh.`);
  }

  // 4. CAST CHARGE (Ethereal mystical chord gathering atmospheric mana)
  const oldCastCharge = 'case"cast-charge":this.tone({type:"sine",freq:240,freqEnd:620,duration:.28,gain:.07}),this.noiseHit({duration:.26,filter:"bandpass",freq:1200,freqEnd:2600,q:5,gain:.035});break;';
  const newCastCharge = 'case"cast-charge":this.tone({type:"sine",freq:293,freqEnd:659,duration:.32,gain:.09}),this.tone({type:"triangle",freq:440,freqEnd:880,duration:.3,gain:.06,delay:.02}),this.noiseHit({duration:.3,filter:"bandpass",freq:980,freqEnd:2400,q:4.2,gain:.04});break;';
  if (code.includes(oldCastCharge)) {
    code = code.replace(oldCastCharge, newCastCharge);
    console.log(`[${file}] Patched cast-charge with mystical arcane gathering harmony.`);
  }

  // 5. MAGE METEOR (Epic catastrophic atmospheric descent, thunderous seismic impact and fire blast)
  const oldMageMeteor = 'case"mage-meteor":this.tone({type:"sawtooth",freq:70,freqEnd:35,duration:.9,gain:.24}),this.noiseHit({duration:.9,freq:300,freqEnd:70,gain:.18});break;';
  const newMageMeteor = 'case"mage-meteor":this.noiseHit({duration:.45,filter:"bandpass",freq:1600,freqEnd:420,q:1.8,gain:.22}),this.tone({type:"triangle",freq:380,freqEnd:80,duration:.42,gain:.15}),this.tone({type:"sine",freq:58,freqEnd:22,duration:1.2,gain:.32,delay:.12}),this.noiseHit({duration:1.0,filter:"lowpass",freq:380,freqEnd:60,gain:.28,delay:.14}),this.noiseHit({duration:.35,filter:"bandpass",freq:1100,freqEnd:350,q:2,gain:.18,delay:.22});break;';
  if (code.includes(oldMageMeteor)) {
    code = code.replace(oldMageMeteor, newMageMeteor);
    console.log(`[${file}] Patched mage-meteor with cinematic descent, seismic crash and blazing combustion.`);
  }

  // 6. ARCHER MULTISHOT (Tri-volley bowstring snaps with crisp aerodynamic arrow whistling)
  const oldArcherMulti = 'case"archer-multishot":for(let e=0;e<3;e++)this.noiseHit({duration:.06,filter:"bandpass",freq:1600,q:6,gain:.14,delay:e*.06});break;';
  const newArcherMulti = 'case"archer-multishot":for(let e=0;e<3;e++){const t=e*.065;this.tone({type:"triangle",freq:280,freqEnd:90,duration:.06,gain:.09,delay:t}),this.noiseHit({duration:.08,filter:"bandpass",freq:2100,freqEnd:950,q:5.5,gain:.13,delay:t+0.01});}break;';
  if (code.includes(oldArcherMulti)) {
    code = code.replace(oldArcherMulti, newArcherMulti);
    console.log(`[${file}] Patched archer-multishot with multi bowstring snaps and arrow whistle.`);
  }

  // 7. ARCHER EXPLOSIVE ARROW (Bow release + piercing flight + fiery incendiary blast)
  const oldArcherExplosive = 'case"archer-explosive-arrow":this.noiseHit({duration:.07,filter:"bandpass",freq:1600,q:6,gain:.16});break;';
  const newArcherExplosive = 'case"archer-explosive-arrow":this.tone({type:"triangle",freq:310,freqEnd:95,duration:.07,gain:.11}),this.noiseHit({duration:.1,filter:"bandpass",freq:2200,freqEnd:800,q:4.5,gain:.15}),this.noiseHit({duration:.25,filter:"lowpass",freq:420,freqEnd:90,gain:.2,delay:.08}),this.tone({type:"sine",freq:120,freqEnd:45,duration:.18,gain:.14,delay:.09});break;';
  if (code.includes(oldArcherExplosive)) {
    code = code.replace(oldArcherExplosive, newArcherExplosive);
    console.log(`[${file}] Patched archer-explosive-arrow with snap release and combustible payload detination.`);
  }

  // 8. WARRIOR HEAVY STRIKE (Violent two-handed cleave whoosh + shattering blunt crunch)
  const oldWarriorHeavy = 'case"warrior-heavy-strike":this.tone({type:"square",freq:120,freqEnd:45,duration:.2,gain:.28}),this.noiseHit({duration:.18,freq:420,freqEnd:90,gain:.26});break;';
  const newWarriorHeavy = 'case"warrior-heavy-strike":this.noiseHit({duration:.18,filter:"bandpass",freq:900,freqEnd:180,q:1.6,gain:.22}),this.tone({type:"triangle",freq:140,freqEnd:40,duration:.24,gain:.28}),this.noiseHit({duration:.14,filter:"lowpass",freq:350,gain:.22,delay:.03}),this.tone({type:"sine",freq:65,freqEnd:28,duration:.22,gain:.2,delay:.04});break;';
  if (code.includes(oldWarriorHeavy)) {
    code = code.replace(oldWarriorHeavy, newWarriorHeavy);
    console.log(`[${file}] Patched warrior-heavy-strike with violent cleave and crushing impact.`);
  }

  // 9. WARRIOR WHIRLWIND (Continuous vortex of spinning steel blades)
  const oldWarriorWhirl = 'case"warrior-whirlwind":this.noiseHit({duration:.4,filter:"bandpass",freq:500,freqEnd:1300,q:2,gain:.2});break;';
  const newWarriorWhirl = 'case"warrior-whirlwind":for(let w=0;w<3;w++){const wt=w*.13;this.noiseHit({duration:.16,filter:"bandpass",freq:800+w*150,freqEnd:300,q:2.2,gain:.17,delay:wt}),this.tone({type:"triangle",freq:340+w*40,freqEnd:160,duration:.12,gain:.08,delay:wt});}break;';
  if (code.includes(oldWarriorWhirl)) {
    code = code.replace(oldWarriorWhirl, newWarriorWhirl);
    console.log(`[${file}] Patched warrior-whirlwind with three-stage spinning steel blade vortex.`);
  }

  // 10. WARRIOR IRON SKIN (Resonant harmonic iron bell plate ringing)
  const oldWarriorIron = 'case"warrior-iron-skin":this.tone({type:"square",freq:330,duration:.08,gain:.14}),this.tone({type:"square",freq:440,duration:.12,gain:.12,delay:.09});break;';
  const newWarriorIron = 'case"warrior-iron-skin":this.tone({type:"sine",freq:220,duration:.35,gain:.16}),this.tone({type:"sine",freq:440,duration:.3,gain:.12,delay:.02}),this.tone({type:"sine",freq:880,duration:.22,gain:.08,delay:.04}),this.noiseHit({duration:.12,filter:"bandpass",freq:1600,freqEnd:800,q:4,gain:.08});break;';
  if (code.includes(oldWarriorIron)) {
    code = code.replace(oldWarriorIron, newWarriorIron);
    console.log(`[${file}] Patched warrior-iron-skin with pure tempered steel armor resonance.`);
  }

  fs.writeFileSync(file, code, 'utf8');
}

console.log('Complete soundscape enhancement patch finished.');
