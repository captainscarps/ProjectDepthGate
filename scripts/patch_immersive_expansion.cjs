const fs = require('fs');

const files = [
  'assets/index-D6qIWtA7-p209.js',
  'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // =======================================================================
  // 1. AUDIO ENGINE: ADD VOCAL SYNTHESIS, ENEMY SOUNDS & EVIL LAUGHS
  // =======================================================================
  const oldDemonAttack = 'case"demon-attack":this.tone({type:"sawtooth",freq:160,freqEnd:70,duration:.25,gain:.14}),this.noiseHit({duration:.2,filter:"bandpass",freq:700,freqEnd:200,q:3,gain:.12});break;';

  const newAudioCases = `case"demon-attack":this.tone({type:"sawtooth",freq:160,freqEnd:70,duration:.25,gain:.14}),this.noiseHit({duration:.2,filter:"bandpass",freq:700,freqEnd:200,q:3,gain:.12});break;
// --- INIMIGOS ESPECIFICOS: DANO E MORTE ---
case"skeleton-hurt":this.tone({type:"triangle",freq:480,freqEnd:180,duration:.08,gain:.15}),this.noiseHit({duration:.08,filter:"bandpass",freq:2200,freqEnd:900,q:5,gain:.16});break;
case"skeleton-death":for(let b=0;b<4;b++){const bt=b*.05;this.noiseHit({duration:.07,filter:"bandpass",freq:1800-b*250,freqEnd:550,q:4.5,gain:.14,delay:bt}),this.tone({type:"triangle",freq:380-b*45,duration:.05,gain:.08,delay:bt});}break;
case"goblin-hurt":this.tone({type:"sawtooth",freq:680,freqEnd:320,duration:.11,gain:.16}),this.noiseHit({duration:.08,filter:"highpass",freq:2200,gain:.11});break;
case"goblin-death":this.tone({type:"sawtooth",freq:540,freqEnd:140,duration:.22,gain:.18}),this.noiseHit({duration:.18,filter:"bandpass",freq:1400,freqEnd:400,q:3,gain:.14});break;
case"orc-hurt":this.tone({type:"square",freq:130,freqEnd:55,duration:.16,gain:.20}),this.noiseHit({duration:.14,filter:"lowpass",freq:380,gain:.18});break;
case"orc-death":this.tone({type:"sawtooth",freq:95,freqEnd:35,duration:.38,gain:.26}),this.noiseHit({duration:.32,filter:"bandpass",freq:420,freqEnd:90,q:2,gain:.22});break;
case"demon-hurt":this.tone({type:"sawtooth",freq:240,freqEnd:80,duration:.20,gain:.16}),this.noiseHit({duration:.18,filter:"bandpass",freq:850,freqEnd:250,q:3.5,gain:.14});break;
case"demon-death":this.tone({type:"sawtooth",freq:140,freqEnd:25,duration:.55,gain:.24}),this.noiseHit({duration:.45,filter:"lowpass",freq:500,freqEnd:60,gain:.22}),this.tone({type:"sine",freq:55,freqEnd:20,duration:.6,gain:.2,delay:.1});break;
case"ghost-hurt":this.tone({type:"sine",freq:750,freqEnd:320,duration:.25,gain:.10}),this.noiseHit({duration:.22,filter:"highpass",freq:2600,gain:.06});break;
case"ghost-death":this.tone({type:"sine",freq:440,freqEnd:110,duration:.45,gain:.12}),this.noiseHit({duration:.4,filter:"bandpass",freq:1800,freqEnd:600,q:4,gain:.08});break;
case"troll-hurt":this.tone({type:"square",freq:90,freqEnd:40,duration:.22,gain:.22}),this.noiseHit({duration:.25,filter:"lowpass",freq:280,gain:.20});break;
case"troll-death":this.tone({type:"sawtooth",freq:65,freqEnd:22,duration:.7,gain:.30}),this.noiseHit({duration:.6,freq:320,freqEnd:50,gain:.28});break;
case"beast-hurt":this.tone({type:"sawtooth",freq:420,freqEnd:180,duration:.14,gain:.16}),this.noiseHit({duration:.12,filter:"bandpass",freq:1200,freqEnd:400,q:3,gain:.12});break;
case"beast-death":this.tone({type:"sawtooth",freq:260,freqEnd:70,duration:.32,gain:.20}),this.noiseHit({duration:.28,filter:"bandpass",freq:800,freqEnd:200,q:2.5,gain:.15});break;
case"dragon-hurt":this.tone({type:"sawtooth",freq:140,freqEnd:60,duration:.26,gain:.22}),this.noiseHit({duration:.22,filter:"bandpass",freq:650,freqEnd:180,q:2.5,gain:.18});break;
case"dragon-death":this.tone({type:"sawtooth",freq:85,freqEnd:24,duration:.9,gain:.32}),this.tone({type:"sine",freq:50,freqEnd:18,duration:1.1,gain:.25,delay:.1}),this.noiseHit({duration:.85,filter:"lowpass",freq:380,freqEnd:50,gain:.28});break;
case"mimic-alert":this.tone({type:"triangle",freq:180,freqEnd:380,duration:.18,gain:.20}),this.noiseHit({duration:.15,filter:"bandpass",freq:1600,freqEnd:800,q:4,gain:.18});break;
case"mimic-attack":this.noiseHit({duration:.12,filter:"bandpass",freq:1400,freqEnd:300,q:3,gain:.22}),this.tone({type:"square",freq:220,freqEnd:90,duration:.10,gain:.16});break;
case"mimic-hurt":this.noiseHit({duration:.10,filter:"bandpass",freq:1800,freqEnd:600,q:3.5,gain:.18}),this.tone({type:"triangle",freq:310,freqEnd:120,duration:.10,gain:.14});break;
case"mimic-death":for(let m=0;m<3;m++){const mt=m*.07;this.noiseHit({duration:.12,filter:"bandpass",freq:1200-m*200,freqEnd:300,q:3,gain:.18,delay:mt}),this.tone({type:"square",freq:160-m*30,duration:.08,gain:.12,delay:mt});}break;
// --- RISADAS MALIGNAS PARA CHEFES HUMANOIDES ---
case"boss-evil-laugh-deep":for(let l=0;l<4;l++){const lt=l*.17,baseP=140-l*14;this.tone({type:"sawtooth",freq:baseP,freqEnd:baseP*.75,duration:.15,gain:.24,delay:lt}),this.tone({type:"triangle",freq:baseP*2,freqEnd:baseP*1.5,duration:.14,gain:.12,delay:lt}),this.noiseHit({duration:.12,filter:"bandpass",freq:780,freqEnd:450,q:3.5,gain:.08,delay:lt});}break;
case"boss-evil-laugh-wicked":for(let l=0;l<5;l++){const lt=l*.12,baseP=320-l*18;this.tone({type:"sawtooth",freq:baseP,freqEnd:baseP*.82,duration:.10,gain:.20,delay:lt}),this.tone({type:"sine",freq:baseP*2.2,duration:.08,gain:.10,delay:lt+.01}),this.noiseHit({duration:.08,filter:"bandpass",freq:1600,freqEnd:900,q:4,gain:.06,delay:lt});}break;
// --- VOZES DOS HEROIS (GRUNHIDOS DE ESFORCO E DANO) ---
case"hero-grunt-warrior":this.tone({type:"sawtooth",freq:130,freqEnd:75,duration:.16,gain:.22}),this.tone({type:"triangle",freq:260,freqEnd:140,duration:.14,gain:.14}),this.noiseHit({duration:.12,filter:"bandpass",freq:650,freqEnd:280,q:2.5,gain:.10});break;
case"hero-grunt-mage":this.tone({type:"sine",freq:220,freqEnd:310,duration:.22,gain:.16}),this.tone({type:"triangle",freq:440,freqEnd:180,duration:.18,gain:.10,delay:.04}),this.noiseHit({duration:.18,filter:"bandpass",freq:1200,freqEnd:450,q:3.5,gain:.06});break;
case"hero-grunt-archer":this.tone({type:"triangle",freq:280,freqEnd:130,duration:.11,gain:.18}),this.noiseHit({duration:.10,filter:"highpass",freq:1400,gain:.12});break;
case"hero-grunt-rogue":this.tone({type:"triangle",freq:240,freqEnd:110,duration:.09,gain:.16}),this.noiseHit({duration:.08,filter:"bandpass",freq:2200,freqEnd:900,q:4,gain:.14});break;
case"hero-grunt-berserker":this.tone({type:"sawtooth",freq:105,freqEnd:48,duration:.28,gain:.28}),this.tone({type:"square",freq:65,freqEnd:32,duration:.24,gain:.18,delay:.02}),this.noiseHit({duration:.25,filter:"lowpass",freq:420,gain:.18});break;
case"hero-hurt-male":this.tone({type:"sawtooth",freq:165,freqEnd:60,duration:.15,gain:.22}),this.noiseHit({duration:.12,filter:"bandpass",freq:550,freqEnd:180,q:2,gain:.14});break;
case"hero-hurt-female":this.tone({type:"triangle",freq:290,freqEnd:120,duration:.13,gain:.20}),this.noiseHit({duration:.11,filter:"bandpass",freq:850,freqEnd:320,q:3,gain:.12});break;
case"hero-victory-cheer":this.arpeggio([261,329,392,523],.08,.18,"triangle"),this.tone({type:"sine",freq:523,freqEnd:659,duration:.35,gain:.15,delay:.24});break;`;

  if (code.includes(oldDemonAttack)) {
    code = code.replace(oldDemonAttack, newAudioCases);
    console.log(`[${file}] Added separate enemy hurt/death, boss evil laughs, and hero vocalizations to AudioEngine.`);
  }

  // =======================================================================
  // 2. WEATHER AUDIO: ADD PLAY DROP PATTER (WATER BUBBLE/DROPLET PLOP)
  // =======================================================================
  const oldStopAll = 'stopAll: function(scene) {\n      this.stopRain(scene);\n      this.stopWind(scene);\n    }\n  };';
  const newStopAll = `playDropPatter: function(scene) {
      try {
        const ctx = this.getCtx(scene);
        if (!ctx || ctx.state === "suspended") return;
        const out = this.getOutputNode(scene) || ctx.destination;
        const vScale = this.getVolumeScale(scene);
        const t0 = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const baseFreq = 980 + Math.random() * 520;
        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq, t0);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.32, t0 + 0.02);
        const vol = (0.016 + Math.random() * 0.02) * vScale;
        gain.gain.setValueAtTime(0.0005, t0);
        gain.gain.linearRampToValueAtTime(vol, t0 + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.042);
        osc.connect(gain);
        gain.connect(out);
        osc.start(t0);
        osc.stop(t0 + 0.048);
      } catch(e) {}
    },

    stopAll: function(scene) {
      this.stopRain(scene);
      this.stopWind(scene);
    }
  };`;

  if (code.includes(oldStopAll)) {
    code = code.replace(oldStopAll, newStopAll);
    console.log(`[${file}] Added playDropPatter realistic acoustic raindrop synthesis to WeatherAudio.`);
  }

  // =======================================================================
  // 3. DETAILED RAIN RENDERING: TEARDROP SHAPE, DROPLET SPLASHES & PATTER
  // =======================================================================
  const oldRainLoop = `        for (let i = 0; i < mgr.particles.length; i++) {
          const p = mgr.particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          if (p.y > screenH - 15) {
            // Concentric ground ripples on impact
            if (Math.random() < 0.32 && mgr.splashes.length < 32) {
              const wx = cam.scrollX + p.x;
              const wy = cam.scrollY + p.y;
              mgr.splashes.push({ x: wx, y: wy, r: 2, maxR: 10, alpha: 0.75 });
            }
            p.y = -25;
            p.x = Math.random() * (screenW + 120) - 60;
          }
          if (p.x > screenW + 40) p.x = -25;

          // Motion-blurred rain streak
          g.lineStyle(p.thick, 0xd0e8ff, p.alpha);
          g.beginPath();
          g.moveTo(p.x, p.y);
          g.lineTo(p.x - p.vx * 0.038, p.y - p.len);
          g.strokePath();
        }

        // Render Ground Splash Ripples (Concentric rings)
        if (gg && mgr.splashes.length > 0) {
          for (let s = mgr.splashes.length - 1; s >= 0; s--) {
            const sp = mgr.splashes[s];
            sp.r += 26 * dt;
            sp.alpha -= 3.0 * dt;
            if (sp.alpha <= 0) {
              mgr.splashes.splice(s, 1);
              continue;
            }
            gg.lineStyle(1.4, 0xbbe2ff, sp.alpha);
            gg.strokeEllipse(sp.x, sp.y, sp.r * 2.2, sp.r * 1.1);
            if (sp.r > 5) {
              gg.lineStyle(1.0, 0xd8f0ff, sp.alpha * 0.5);
              gg.strokeEllipse(sp.x, sp.y, sp.r * 1.2, sp.r * 0.6);
            }
          }
        }`;

  const newRainLoop = `        mgr.dropletSplashes = mgr.dropletSplashes || [];
        mgr.patterTimer = (mgr.patterTimer || 0) + dt;
        if (mgr.patterTimer >= (mgr.weather === "storm" ? 0.14 : 0.26)) {
          mgr.patterTimer = 0;
          WeatherAudio.playDropPatter(scene);
        }

        for (let i = 0; i < mgr.particles.length; i++) {
          const p = mgr.particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          if (p.y > screenH - 12) {
            const wx = cam.scrollX + p.x;
            const wy = cam.scrollY + p.y;
            // 1. Concentric water ripple ring
            if (Math.random() < 0.38 && mgr.splashes.length < 36) {
              mgr.splashes.push({ x: wx, y: wy, r: 1.8, maxR: 12, alpha: 0.85 });
            }
            // 2. Micro ballistic water droplet splashes (2-3 bouncing water droplets)
            if (Math.random() < 0.45 && mgr.dropletSplashes.length < 40) {
              const numDrops = Math.floor(Math.random() * 2) + 2;
              for (let d = 0; d < numDrops; d++) {
                mgr.dropletSplashes.push({
                  x: wx,
                  y: wy - 2,
                  vx: (Math.random() - 0.5) * 65,
                  vy: -(45 + Math.random() * 75),
                  alpha: 0.9,
                  size: 1.0 + Math.random() * 1.4
                });
              }
            }
            p.y = -25;
            p.x = Math.random() * (screenW + 120) - 60;
          }
          if (p.x > screenW + 40) p.x = -25;

          // Motion-blurred rain streak with bright pearled droplet head
          g.lineStyle(p.thick, 0xd8edff, p.alpha * 0.75);
          g.beginPath();
          g.moveTo(p.x, p.y);
          g.lineTo(p.x - p.vx * 0.038, p.y - p.len);
          g.strokePath();

          // Realistic bright tear-drop head at the tip
          g.fillStyle(0xffffff, Math.min(1.0, p.alpha * 1.15));
          g.fillCircle(p.x, p.y, p.thick * 1.05);
        }

        // Render Bouncing Water Droplet Splashes
        if (gg && mgr.dropletSplashes.length > 0) {
          for (let d = mgr.dropletSplashes.length - 1; d >= 0; d--) {
            const dp = mgr.dropletSplashes[d];
            dp.x += dp.vx * dt;
            dp.y += dp.vy * dt;
            dp.vy += 360 * dt; // gravity arc
            dp.alpha -= 3.8 * dt;
            if (dp.alpha <= 0) {
              mgr.dropletSplashes.splice(d, 1);
              continue;
            }
            gg.fillStyle(0xeaf4ff, dp.alpha);
            gg.fillCircle(dp.x, dp.y, dp.size);
          }
        }

        // Render Ground Splash Ripples (Concentric rings)
        if (gg && mgr.splashes.length > 0) {
          for (let s = mgr.splashes.length - 1; s >= 0; s--) {
            const sp = mgr.splashes[s];
            sp.r += 26 * dt;
            sp.alpha -= 3.0 * dt;
            if (sp.alpha <= 0) {
              mgr.splashes.splice(s, 1);
              continue;
            }
            gg.lineStyle(1.4, 0xbbe2ff, sp.alpha);
            gg.strokeEllipse(sp.x, sp.y, sp.r * 2.2, sp.r * 1.1);
            if (sp.r > 4.5) {
              gg.lineStyle(1.0, 0xd8f0ff, sp.alpha * 0.55);
              gg.strokeEllipse(sp.x, sp.y, sp.r * 1.25, sp.r * 0.6);
            }
          }
        }`;

  if (code.includes(oldRainLoop)) {
    code = code.replace(oldRainLoop, newRainLoop);
    console.log(`[${file}] Upgraded rain rendering with teardrop heads, micro ballistic droplet splashes, and acoustic drop patter.`);
  }

  // =======================================================================
  // 4. ENEMY DEATH HOOK: PLAY RACE-SPECIFIC DEATH SOUND
  // =======================================================================
  const oldEnemyDied = 'onEnemyDied(i){this.audio.play(Ct.ENEMY_DEATH),this.game.registry.inc("campaign:kills",1)';
  const newEnemyDied = `onEnemyDied(i){{const tex=(i?.data_?.texture||i?.def?.texture||i?.texture?.key||i?.typeKey||"").toLowerCase();if(tex.includes("skeleton"))this.audio?.play("sfx-skeleton-death");else if(tex.includes("goblin"))this.audio?.play("sfx-goblin-death");else if(tex.includes("orc"))this.audio?.play("sfx-orc-death");else if(tex.includes("demon"))this.audio?.play("sfx-demon-death");else if(tex.includes("ghost")||tex.includes("shade"))this.audio?.play("sfx-ghost-death");else if(tex.includes("troll")||tex.includes("yeti")||tex.includes("cyclops"))this.audio?.play("sfx-troll-death");else if(tex.includes("wolf")||tex.includes("beast"))this.audio?.play("sfx-beast-death");else if(tex.includes("dragon")||tex.includes("wyrm")||tex.includes("drake"))this.audio?.play("sfx-dragon-death");else if(tex.includes("mimic"))this.audio?.play("sfx-mimic-death");else this.audio?.play(Ct.ENEMY_DEATH);}this.game.registry.inc("campaign:kills",1)`;

  if (code.includes(oldEnemyDied)) {
    code = code.replace(oldEnemyDied, newEnemyDied);
    console.log(`[${file}] Hooked race-specific death sounds in onEnemyDied.`);
  }

  // =======================================================================
  // 5. ENEMY HURT HOOK: PLAY RACE-SPECIFIC HURT SOUND IN TAKEDAMAGE
  // =======================================================================
  const oldEnemyTakeDamage = 'this.hp-=i,this.hurtTimer=this.data_.hitFlashMs/1e3,this.sinceHit=0;';
  const newEnemyTakeDamage = `this.hp-=i,this.hurtTimer=this.data_.hitFlashMs/1e3,this.sinceHit=0;if(this.hp>0&&Math.random()<0.65){const tex=(this.data_?.texture||"").toLowerCase();if(tex.includes("skeleton"))this.scene.audioRef?.play("sfx-skeleton-hurt");else if(tex.includes("goblin"))this.scene.audioRef?.play("sfx-goblin-hurt");else if(tex.includes("orc"))this.scene.audioRef?.play("sfx-orc-hurt");else if(tex.includes("demon"))this.scene.audioRef?.play("sfx-demon-hurt");else if(tex.includes("ghost")||tex.includes("shade"))this.scene.audioRef?.play("sfx-ghost-hurt");else if(tex.includes("troll")||tex.includes("yeti")||tex.includes("cyclops"))this.scene.audioRef?.play("sfx-troll-hurt");else if(tex.includes("wolf")||tex.includes("beast"))this.scene.audioRef?.play("sfx-beast-hurt");else if(tex.includes("mimic"))this.scene.audioRef?.play("sfx-mimic-hurt");}`;

  if (code.includes(oldEnemyTakeDamage)) {
    code = code.replace(oldEnemyTakeDamage, newEnemyTakeDamage);
    console.log(`[${file}] Hooked race-specific hurt sounds in Enemy.takeDamage.`);
  }

  // =======================================================================
  // 6. BOSS HUMANOID EVIL LAUGH HOOK
  // =======================================================================
  const oldBossPhase2 = 'this.scene.audioRef?.play(Ct.BOSS_PHASE2),this.scene.game.events.emit("boss:phase",2)';
  const newBossPhase2 = `this.scene.audioRef?.play(Ct.BOSS_PHASE2),this.scene.game.events.emit("boss:phase",2);{const bName=(this.data_?.name||"").toLowerCase();const isHum=!bName.includes("drag")&&!bName.includes("ent")&&!bName.includes("coloss");if(isHum){this.scene.audioRef?.play(bName.includes("necro")||bName.includes("guard")?"sfx-boss-evil-laugh-wicked":"sfx-boss-evil-laugh-deep");}}`;

  if (code.includes(oldBossPhase2)) {
    code = code.replace(oldBossPhase2, newBossPhase2);
    console.log(`[${file}] Hooked humanoid boss evil laugh on phase 2.`);
  }

  // Boss Spawned Evil Laugh
  const oldBossSpawned = 't.game.events.emit("boss:spawned",s.data_.name,s.data_.subtitle)';
  const newBossSpawned = `t.game.events.emit("boss:spawned",s.data_.name,s.data_.subtitle);{const bName=(s.data_?.name||"").toLowerCase();const isHum=!bName.includes("drag")&&!bName.includes("ent")&&!bName.includes("coloss");if(isHum){t.time.delayedCall(1100,()=>{t.audioRef?.play(bName.includes("necro")||bName.includes("guard")?"sfx-boss-evil-laugh-wicked":"sfx-boss-evil-laugh-deep");});}}`;

  if (code.includes(oldBossSpawned)) {
    code = code.replace(oldBossSpawned, newBossSpawned);
    console.log(`[${file}] Hooked humanoid boss evil laugh on intro banner.`);
  }

  // =======================================================================
  // 7. HERO VOCALIZATIONS: ATTACK GRUNTS & HURT GRUNTS
  // =======================================================================
  const oldPlayerAttack = 'this.audio.play(t.sound),this.scene.playerVisual?.playAttack(i);';
  const newPlayerAttack = `this.audio.play(t.sound),this.scene.playerVisual?.playAttack(i);if(Math.random()<0.38){const c=(this.scene?.classDef?.id||"").toLowerCase();if(c.includes("warrior"))this.audio?.play("sfx-hero-grunt-warrior");else if(c.includes("mage"))this.audio?.play("sfx-hero-grunt-mage");else if(c.includes("archer")||c.includes("huntress"))this.audio?.play("sfx-hero-grunt-archer");else if(c.includes("rogue"))this.audio?.play("sfx-hero-grunt-rogue");else if(c.includes("berserk"))this.audio?.play("sfx-hero-grunt-berserker");}`;

  if (code.includes(oldPlayerAttack)) {
    code = code.replace(oldPlayerAttack, newPlayerAttack);
    console.log(`[${file}] Hooked class-specific hero attack grunts.`);
  }

  // Hero hurt vocalization
  const oldPlayerHurtSfx = 'this.audio.play(Ct.PLAYER_HURT)';
  const newPlayerHurtSfx = `this.audio.play(Ct.PLAYER_HURT);{const c=(this.scene?.classDef?.id||"").toLowerCase();const isF=c.includes("archer")||c.includes("huntress")||c.includes("rogue");this.audio?.play(isF?"sfx-hero-hurt-female":"sfx-hero-hurt-male");}`;

  if (code.includes(oldPlayerHurtSfx)) {
    code = code.replace(oldPlayerHurtSfx, newPlayerHurtSfx);
    console.log(`[${file}] Hooked hero hurt vocalization (male/female).`);
  }

  // Hero victory cheer on level up
  const oldLevelUp = 'this.scene.audioRef?.play(Ct.LEVEL_UP)';
  const newLevelUp = 'this.scene.audioRef?.play(Ct.LEVEL_UP),this.scene.audioRef?.play("sfx-hero-victory-cheer")';
  if (code.includes(oldLevelUp)) {
    code = code.replace(oldLevelUp, newLevelUp);
    console.log(`[${file}] Hooked hero victory cheer on level up.`);
  }

  fs.writeFileSync(file, code, 'utf8');
}

console.log('Immersive sound and rain expansion complete.');
