const fs = require('fs');

const files = [
  'assets/index-D6qIWtA7-p209.js',
  'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // 1. Upgrade AudioEngine step method with realistic biome sounds (stone, grass, water, snow, wood, moss)
  const oldStep = 'step(i="stone",t=!1){if(!this.ready)return;const e=.85+Math.random()*.3,d=t?1.35:1;switch(i){case"moss":this.noiseHit({duration:.05,freq:260*e,gain:.055*d,priority:0}),Math.random()<.3&&this.noiseHit({duration:.04,filter:"bandpass",freq:900*e,q:3,gain:.02,delay:.015,priority:0});break;case"volcanic":this.noiseHit({duration:.06,freq:200*e,gain:.07*d,priority:0}),this.noiseHit({duration:.035,filter:"bandpass",freq:1400*e,q:4,gain:.02*d,priority:0});break;case"snow":this.noiseHit({duration:.07,filter:"highpass",freq:1800*e,gain:.045*d,priority:0}),this.noiseHit({duration:.04,freq:300*e,gain:.03*d,priority:0});break;case"rug":this.noiseHit({duration:.045,freq:170*e,gain:.035*d,priority:0});break;default:this.noiseHit({duration:.05,freq:380*e,gain:.06*d,priority:0}),t&&this.tone({type:"triangle",freq:90*e,duration:.04,gain:.02,priority:0})}}';

  const newStep = 'step(i="stone",t=!1){if(!this.ready)return;const e=.88+Math.random()*.24,d=t?1.25:1;switch(i){case"water":this.noiseHit({duration:.08,filter:"bandpass",freq:550*e,q:2.5,gain:.045*d,priority:0}),this.noiseHit({duration:.04,filter:"lowpass",freq:320*e,gain:.035*d,delay:.012,priority:0});break;case"grass":case"moss":this.noiseHit({duration:.045,filter:"bandpass",freq:850*e,q:3.2,gain:.032*d,priority:0}),this.noiseHit({duration:.03,filter:"highpass",freq:1800*e,gain:.018*d,delay:.01,priority:0});break;case"snow":this.noiseHit({duration:.07,filter:"bandpass",freq:1200*e,q:2,gain:.038*d,priority:0}),this.noiseHit({duration:.05,filter:"lowpass",freq:280*e,gain:.025*d,priority:0});break;case"wood":this.noiseHit({duration:.045,filter:"bandpass",freq:420*e,q:4,gain:.048*d,priority:0}),this.tone({type:"triangle",freq:130*e,freqEnd:75,duration:.04,gain:.025*d,priority:0});break;case"volcanic":this.noiseHit({duration:.05,filter:"bandpass",freq:380*e,q:2.5,gain:.045*d,priority:0}),this.noiseHit({duration:.03,filter:"highpass",freq:2200*e,gain:.02*d,priority:0});break;default:this.noiseHit({duration:.045,filter:"bandpass",freq:480*e,q:3.5,gain:.04*d,priority:0}),this.noiseHit({duration:.025,filter:"highpass",freq:1900*e,gain:.02*d,delay:.008,priority:0}),t&&this.tone({type:"triangle",freq:85*e,duration:.035,gain:.02,priority:0})}}';

  if (code.includes(oldStep)) {
    code = code.replace(oldStep, newStep);
    console.log(`[${file}] Replaced step method with realistic multi-surface audio.`);
  }

  // 2. Upgrade Weapon Attack SFX (sword swish, axe heavy cleave, dagger swift slice, bow release, staff arcane chime)
  const oldWeapons = 'case"weapon-sword":this.noiseHit({duration:.12,filter:"bandpass",freq:1100,freqEnd:400,q:3,gain:.16});break;case"weapon-axe":this.noiseHit({duration:.22,filter:"bandpass",freq:500,freqEnd:150,q:2,gain:.22}),this.tone({type:"square",freq:90,freqEnd:50,duration:.12,gain:.1,delay:.2});break;case"weapon-dagger":this.noiseHit({duration:.06,filter:"highpass",freq:2200,gain:.12});break;case"weapon-staff":this.tone({freq:320,freqEnd:480,duration:.16,gain:.1}),this.noiseHit({duration:.14,filter:"bandpass",freq:900,q:4,gain:.06});break;case"weapon-bow":this.noiseHit({duration:.07,filter:"bandpass",freq:1600,q:6,gain:.14}),this.tone({type:"triangle",freq:180,freqEnd:120,duration:.08,gain:.06});break;';

  const newWeapons = 'case"weapon-sword":this.noiseHit({duration:.14,filter:"bandpass",freq:1400,freqEnd:320,q:2.2,gain:.15}),this.tone({type:"triangle",freq:480,freqEnd:180,duration:.1,gain:.05});break;case"weapon-axe":this.noiseHit({duration:.24,filter:"bandpass",freq:650,freqEnd:120,q:1.6,gain:.22}),this.tone({type:"sawtooth",freq:110,freqEnd:45,duration:.18,gain:.12});break;case"weapon-dagger":this.noiseHit({duration:.08,filter:"highpass",freq:2600,gain:.13}),this.tone({type:"triangle",freq:820,freqEnd:350,duration:.06,gain:.04});break;case"weapon-staff":this.tone({type:"sine",freq:420,freqEnd:680,duration:.2,gain:.12}),this.noiseHit({duration:.18,filter:"bandpass",freq:1100,freqEnd:1800,q:3.5,gain:.05}),this.tone({type:"sine",freq:880,freqEnd:440,duration:.15,gain:.04,delay:.04});break;case"weapon-bow":this.noiseHit({duration:.08,filter:"bandpass",freq:1900,freqEnd:900,q:5,gain:.15}),this.tone({type:"triangle",freq:240,freqEnd:80,duration:.07,gain:.09});break;';

  if (code.includes(oldWeapons)) {
    code = code.replace(oldWeapons, newWeapons);
    console.log(`[${file}] Replaced weapon attack sfx with realistic blade swish and bow string snap.`);
  }

  // 3. Upgrade Hit SFX (Steel blade impact, flesh thud, critical clang)
  const oldHit = 'case"hit":this.tone({type:"square",freq:150,freqEnd:70,duration:.09,gain:.2}),this.noiseHit({duration:.08,freq:500,gain:.22});break;';

  const newHit = 'case"hit":this.tone({type:"triangle",freq:220,freqEnd:65,duration:.1,gain:.18}),this.noiseHit({duration:.09,filter:"bandpass",freq:1200,freqEnd:280,q:2.5,gain:.2}),this.tone({type:"sine",freq:650,freqEnd:320,duration:.06,gain:.08,delay:.01});break;';

  if (code.includes(oldHit)) {
    code = code.replace(oldHit, newHit);
    console.log(`[${file}] Replaced hit sound with metallic blade impact and visceral thud.`);
  }

  // 4. Upgrade Mage Spells (Fireball whoosh explosion, Arcane blast crystal resonance)
  const oldSpells = 'case"mage-fireball":this.noiseHit({duration:.25,filter:"bandpass",freq:700,freqEnd:250,q:1.5,gain:.18}),this.tone({freq:220,freqEnd:140,duration:.2,gain:.1});break;case"mage-arcane-blast":this.tone({type:"sawtooth",freq:880,freqEnd:220,duration:.25,gain:.16});break;';

  const newSpells = 'case"mage-fireball":this.noiseHit({duration:.32,filter:"bandpass",freq:950,freqEnd:160,q:1.4,gain:.22}),this.tone({type:"triangle",freq:180,freqEnd:60,duration:.25,gain:.14}),this.noiseHit({duration:.18,filter:"lowpass",freq:350,gain:.12,delay:.05});break;case"mage-arcane-blast":this.tone({type:"sine",freq:1046,freqEnd:261,duration:.28,gain:.18}),this.tone({type:"triangle",freq:523,freqEnd:130,duration:.22,gain:.12,delay:.02}),this.noiseHit({duration:.2,filter:"bandpass",freq:2400,freqEnd:800,q:4,gain:.08});break;';

  if (code.includes(oldSpells)) {
    code = code.replace(oldSpells, newSpells);
    console.log(`[${file}] Replaced Mage magic sounds with rich whoosh and arcane resonance.`);
  }

  fs.writeFileSync(file, code, 'utf8');
}

console.log('Combat SFX patch complete.');
