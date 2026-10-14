const fs = require('fs');

const files = [
  'assets/index-D6qIWtA7-p209.js',
  'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
];

const fxEngineCode = `
// =========================================================================
// DEPTHGATE ADVANCED VISUAL EFFECTS & DYNAMIC WEATHER SYSTEM v2.0
// =========================================================================
(function(){
  if (typeof window === "undefined") return;

  const BLEND_ADD = 1;
  function randBetween(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
  }

  // -----------------------------------------------------------------------
  // PROCEDURAL WEB AUDIO SYNTHESIS FOR WEATHER (RAIN, THUNDER, WIND)
  // -----------------------------------------------------------------------
  const WeatherAudio = {
    rainNode: null,
    rainGain: null,
    windNode: null,
    windGain: null,

    getCtx: function(scene) {
      try {
        return scene?.sound?.context || window.__DED_GAME?.sound?.context || (scene?.audio?.engine?.ctx?.()) || (window.AudioContext && new window.AudioContext());
      } catch(e) {
        return null;
      }
    },

    startRain: function(scene, intensity = 0.5) {
      try {
        const ctx = this.getCtx(scene);
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume().catch(()=>{});

        if (this.rainNode) {
          if (this.rainGain) {
            const targetVol = Math.min(0.35, 0.12 + intensity * 0.22);
            this.rainGain.gain.cancelScheduledValues(ctx.currentTime);
            this.rainGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 1.2);
          }
          return;
        }

        // Generate 2-second white noise buffer
        const bufLen = ctx.sampleRate * 2;
        const noiseBuf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const data = noiseBuf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        noiseSrc.loop = true;

        // Bandpass filter centered at rain frequency (~1150Hz)
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 1150;
        bp.Q.value = 0.8;

        // Lowpass filter to soften high hiss (~3200Hz)
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 3200;

        const gain = ctx.createGain();
        const targetVol = Math.min(0.35, 0.12 + intensity * 0.22);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 1.5);

        noiseSrc.connect(bp);
        bp.connect(lp);
        lp.connect(gain);
        gain.connect(ctx.destination);
        noiseSrc.start(0);

        this.rainNode = noiseSrc;
        this.rainGain = gain;
      } catch(e) {}
    },

    stopRain: function(scene) {
      try {
        const ctx = this.getCtx(scene);
        if (this.rainGain && ctx) {
          this.rainGain.gain.cancelScheduledValues(ctx.currentTime);
          this.rainGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
        }
        const node = this.rainNode;
        setTimeout(() => {
          try { node?.stop(); node?.disconnect(); } catch(e) {}
        }, 1300);
        this.rainNode = null;
        this.rainGain = null;
      } catch(e) {}
    },

    startWind: function(scene, intensity = 0.5) {
      try {
        const ctx = this.getCtx(scene);
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume().catch(()=>{});

        if (this.windNode) {
          if (this.windGain) {
            const targetVol = Math.min(0.25, 0.08 + intensity * 0.16);
            this.windGain.gain.cancelScheduledValues(ctx.currentTime);
            this.windGain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 1.5);
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

        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = 420;
        bp.Q.value = 1.4;

        const gain = ctx.createGain();
        const targetVol = Math.min(0.25, 0.08 + intensity * 0.16);
        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(targetVol, ctx.currentTime + 1.5);

        noiseSrc.connect(bp);
        bp.connect(gain);
        gain.connect(ctx.destination);
        noiseSrc.start(0);

        this.windNode = noiseSrc;
        this.windGain = gain;
      } catch(e) {}
    },

    stopWind: function(scene) {
      try {
        const ctx = this.getCtx(scene);
        if (this.windGain && ctx) {
          this.windGain.gain.cancelScheduledValues(ctx.currentTime);
          this.windGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
        }
        const node = this.windNode;
        setTimeout(() => {
          try { node?.stop(); node?.disconnect(); } catch(e) {}
        }, 1300);
        this.windNode = null;
        this.windGain = null;
      } catch(e) {}
    },

    playThunder: function(scene) {
      try {
        const ctx = this.getCtx(scene);
        if (!ctx) return;
        if (ctx.state === "suspended") ctx.resume().catch(()=>{});

        // 1. Low frequency rumble (Sub bass drop 65Hz -> 28Hz)
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(70, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 1.6);
        oscGain.gain.setValueAtTime(0.35, ctx.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 1.85);

        // 2. Filtered noise crack
        const noiseLen = Math.floor(ctx.sampleRate * 1.5);
        const noiseBuf = ctx.createBuffer(1, noiseLen, ctx.sampleRate);
        const nData = noiseBuf.getChannelData(0);
        for (let i = 0; i < noiseLen; i++) nData[i] = Math.random() * 2 - 1;
        const nSrc = ctx.createBufferSource();
        nSrc.buffer = noiseBuf;

        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.setValueAtTime(450, ctx.currentTime);
        lp.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 1.4);

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.3, ctx.currentTime);
        nGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

        nSrc.connect(lp);
        lp.connect(nGain);
        nGain.connect(ctx.destination);
        nSrc.start(ctx.currentTime);
      } catch(e) {}
    },

    stopAll: function(scene) {
      this.stopRain(scene);
      this.stopWind(scene);
    }
  };

  // -----------------------------------------------------------------------
  // PROCEDURAL SOFT WEATHER TEXTURES (Volumetric Cloud, Soft Raindrop, Snowflake)
  // -----------------------------------------------------------------------
  function ensureWeatherTextures(scene) {
    try {
      if (!scene || !scene.textures) return;

      // 1. Soft Volumetric Cloud Puff (Radial Feathered Gradient - Eliminates flat/chapado look)
      if (!scene.textures.exists("weather-soft-cloud")) {
        const c = document.createElement("canvas");
        c.width = 256;
        c.height = 256;
        const ctx = c.getContext("2d");
        const rad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        rad.addColorStop(0, "rgba(255, 255, 255, 0.42)");
        rad.addColorStop(0.3, "rgba(255, 255, 255, 0.28)");
        rad.addColorStop(0.6, "rgba(255, 255, 255, 0.12)");
        rad.addColorStop(0.85, "rgba(255, 255, 255, 0.03)");
        rad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
        ctx.fillStyle = rad;
        ctx.fillRect(0, 0, 256, 256);
        scene.textures.addCanvas("weather-soft-cloud", c);
      }

      // 2. Realistic Motion-Blurred Raindrop (Gradient Streak)
      if (!scene.textures.exists("weather-drop")) {
        const c = document.createElement("canvas");
        c.width = 6;
        c.height = 36;
        const ctx = c.getContext("2d");
        const lin = ctx.createLinearGradient(3, 0, 3, 36);
        lin.addColorStop(0, "rgba(200, 230, 255, 0.0)");
        lin.addColorStop(0.65, "rgba(215, 240, 255, 0.45)");
        lin.addColorStop(1, "rgba(255, 255, 255, 0.95)");
        ctx.fillStyle = lin;
        ctx.beginPath();
        ctx.moveTo(3, 0);
        ctx.lineTo(5, 30);
        ctx.lineTo(3, 36);
        ctx.lineTo(1, 30);
        ctx.closePath();
        ctx.fill();
        scene.textures.addCanvas("weather-drop", c);
      }

      // 3. Organic Crystalline Snowflake
      if (!scene.textures.exists("weather-snow")) {
        const c = document.createElement("canvas");
        c.width = 16;
        c.height = 16;
        const ctx = c.getContext("2d");
        const rad = ctx.createRadialGradient(8, 8, 1, 8, 8, 8);
        rad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
        rad.addColorStop(0.5, "rgba(235, 248, 255, 0.65)");
        rad.addColorStop(1, "rgba(255, 255, 255, 0.0)");
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(8, 8, 7, 0, Math.PI * 2);
        ctx.fill();
        scene.textures.addCanvas("weather-snow", c);
      }
    } catch(e) {}
  }

  // 1. WEAPON-SPECIFIC MELEE ATTACK EFFECTS
  window.__weaponMeleeFx = function(combat, weaponKey, weaponDef, dirVec, dirAngle, arcDef, midX, midY) {
    try {
      const scene = combat.scene;
      const player = combat.player;
      const effects = combat.effects;
      const cam = combat.cameraSys;
      const key = (weaponKey || "").toLowerCase();
      const px = player.x;
      const py = player.y;
      const range = (arcDef && arcDef.range) || 42;
      const angleDeg = (arcDef && arcDef.angle) || 85;
      const halfAngleRad = (angleDeg / 2) * Math.PI / 180;

      const isGreatsword = key.includes("great") || key.includes("slayer") || key.includes("dragon_sword");
      const isDagger = key.includes("dagger") || key.includes("fang") || key.includes("rogue_dual");
      const isAxe = key.includes("axe");
      const isStaffOrClub = key.includes("staff") || key.includes("club");
      const isUnarmed = key === "unarmed";
      const isFrost = key.includes("frost") || key.includes("glacial");
      const isFire = key.includes("dragon") || key.includes("inferno") || key.includes("flame") || key.includes("ember");
      const isShadow = key.includes("shadow") || key.includes("twin_fang") || key.includes("assassin");

      if (isGreatsword) {
        const gRange = range * 1.25;
        const gColor = isFrost ? 0x77eeff : (isFire ? 0xff5500 : 0xffdd55);
        const arcG = scene.add.graphics().setDepth(py + 25).setBlendMode(BLEND_ADD);
        arcG.fillStyle(gColor, 0.32);
        arcG.slice(px, py, gRange, dirAngle - halfAngleRad * 1.15, dirAngle + halfAngleRad * 1.15, false);
        arcG.fillPath();

        arcG.lineStyle(5.0, 0xffffff, 0.95);
        arcG.beginPath();
        arcG.arc(px, py, gRange, dirAngle - halfAngleRad * 1.1, dirAngle + halfAngleRad * 1.1, false);
        arcG.strokePath();

        arcG.lineStyle(2.5, gColor, 0.85);
        arcG.beginPath();
        arcG.arc(px, py, gRange * 0.92, dirAngle - halfAngleRad, dirAngle + halfAngleRad, false);
        arcG.strokePath();

        scene.tweens.add({ targets: arcG, alpha: 0, scale: 1.08, duration: 180, onComplete: () => arcG.destroy() });
        effects.slash(px + dirVec.x * gRange * 0.6, py + dirVec.y * gRange * 0.6, dirAngle, gColor);

        const crack = scene.add.graphics().setDepth(py - 2).setBlendMode(BLEND_ADD);
        crack.lineStyle(2, gColor, 0.6);
        crack.beginPath();
        crack.moveTo(px + dirVec.x * 10, py + dirVec.y * 10);
        crack.lineTo(px + dirVec.x * (gRange * 0.9), py + dirVec.y * (gRange * 0.9));
        crack.strokePath();
        scene.tweens.add({ targets: crack, alpha: 0, duration: 260, onComplete: () => crack.destroy() });

        effects.burstTinted(midX, midY, gColor, 12);
        cam?.shake(0.007, 125);
        return true;
      }

      if (isDagger) {
        const dColor = isShadow ? 0xb555ff : (isFrost ? 0x88eeff : 0xd8ffff);
        const dRange = range * 1.05;
        const a1 = dirAngle - 0.42;
        const g1 = scene.add.graphics().setDepth(py + 22).setBlendMode(BLEND_ADD);
        g1.lineStyle(2.5, 0xffffff, 0.95);
        g1.beginPath();
        g1.arc(px, py, dRange, a1 - 0.5, a1 + 0.5, false);
        g1.strokePath();
        g1.lineStyle(1.5, dColor, 0.8);
        g1.beginPath();
        g1.arc(px, py, dRange * 0.95, a1 - 0.4, a1 + 0.4, false);
        g1.strokePath();
        scene.tweens.add({ targets: g1, alpha: 0, duration: 120, onComplete: () => g1.destroy() });

        scene.time.delayedCall(30, () => {
          if (!player.active) return;
          const a2 = dirAngle + 0.42;
          const g2 = scene.add.graphics().setDepth(py + 22).setBlendMode(BLEND_ADD);
          g2.lineStyle(2.5, 0xffffff, 0.95);
          g2.beginPath();
          g2.arc(px, py, dRange, a2 - 0.5, a2 + 0.5, false);
          g2.strokePath();
          g2.lineStyle(1.5, dColor, 0.8);
          g2.beginPath();
          g2.arc(px, py, dRange * 0.95, a2 - 0.4, a2 + 0.4, false);
          g2.strokePath();
          scene.tweens.add({ targets: g2, alpha: 0, duration: 120, onComplete: () => g2.destroy() });
          effects.burstTinted(midX, midY, dColor, 7);
        });

        cam?.shake(0.0025, 55);
        return true;
      }

      if (isAxe) {
        const aColor = 0xff3b30;
        const aRange = range * 1.1;
        const arcG = scene.add.graphics().setDepth(py + 25).setBlendMode(BLEND_ADD);
        arcG.fillStyle(aColor, 0.35);
        arcG.slice(px, py, aRange, dirAngle - halfAngleRad * 0.9, dirAngle + halfAngleRad * 0.9, false);
        arcG.fillPath();

        arcG.lineStyle(6.0, 0xffffff, 0.95);
        arcG.beginPath();
        arcG.arc(px, py, aRange, dirAngle - 0.25, dirAngle + 0.25, false);
        arcG.strokePath();

        scene.tweens.add({ targets: arcG, alpha: 0, duration: 160, onComplete: () => arcG.destroy() });
        effects.slash(midX, midY, dirAngle, aColor);

        const impactX = px + dirVec.x * aRange * 0.85;
        const impactY = py + dirVec.y * aRange * 0.85;
        effects.shockwaveRing?.(impactX, impactY, 22);
        effects.burstTinted(impactX, impactY, 0xff9500, 10);
        cam?.shake(0.006, 115);
        return true;
      }

      if (isStaffOrClub) {
        const sColor = isFire ? 0xff6600 : (isFrost ? 0x66ddff : 0xbb44ff);
        const sRange = range * 1.05;
        const wave = scene.add.graphics().setDepth(py + 20).setBlendMode(BLEND_ADD);
        wave.lineStyle(3.0, 0xffffff, 0.9);
        wave.beginPath();
        wave.arc(px, py, sRange * 0.75, dirAngle - halfAngleRad, dirAngle + halfAngleRad, false);
        wave.strokePath();

        wave.lineStyle(1.8, sColor, 0.8);
        wave.beginPath();
        wave.arc(px, py, sRange, dirAngle - halfAngleRad * 0.8, dirAngle + halfAngleRad * 0.8, false);
        wave.strokePath();

        scene.tweens.add({ targets: wave, alpha: 0, scale: 1.15, duration: 150, onComplete: () => wave.destroy() });
        effects.burstTinted(midX, midY, sColor, 8);
        cam?.shake(0.004, 85);
        return true;
      }

      if (isUnarmed) {
        const uColor = 0xffea77;
        const pWave = scene.add.graphics().setDepth(py + 20).setBlendMode(BLEND_ADD);
        pWave.lineStyle(3.5, 0xffffff, 0.95);
        pWave.beginPath();
        pWave.arc(px + dirVec.x * 8, py + dirVec.y * 8, range * 0.65, dirAngle - 0.45, dirAngle + 0.45, false);
        pWave.strokePath();
        scene.tweens.add({ targets: pWave, alpha: 0, scale: 1.25, duration: 110, onComplete: () => pWave.destroy() });
        effects.burstTinted(midX, midY, uColor, 6);
        cam?.shake(0.003, 65);
        return true;
      }

      const swColor = isFrost ? 0x66ddff : 0xfffae0;
      effects.arcSlash(px, py, dirAngle, range, angleDeg, swColor);
      effects.burstTinted(midX, midY, swColor, 5);
      cam?.shake(0.004, 80);
      return true;
    } catch(err) {
      console.error("Melee FX error:", err);
      return false;
    }
  };

  // 2. MAGE REALISTIC FALLING METEOR SYSTEM
  window.__spawnEpicMeteor = function(scene, targetX, targetY, radius, durationMs, color, onImpact) {
    try {
      if (!scene || scene.state !== "playing") return;
      const telegraphDuration = durationMs || 900;
      const meteorColor = color || 0xff5500;

      const sigil = scene.add.graphics().setDepth(targetY - 8).setBlendMode(BLEND_ADD);
      sigil.lineStyle(2, meteorColor, 0.7);
      sigil.strokeCircle(targetX, targetY, radius);
      sigil.lineStyle(1.2, 0xffdd66, 0.85);
      sigil.strokeCircle(targetX, targetY, radius * 0.65);
      
      const spokeCount = 6;
      for (let s = 0; s < spokeCount; s++) {
        const rad = (s / spokeCount) * Math.PI * 2;
        sigil.beginPath();
        sigil.moveTo(targetX + Math.cos(rad) * radius * 0.25, targetY + Math.sin(rad) * radius * 0.25);
        sigil.lineTo(targetX + Math.cos(rad) * radius * 0.95, targetY + Math.sin(rad) * radius * 0.95);
        sigil.strokePath();
      }

      scene.tweens.add({
        targets: sigil,
        rotation: 0.8,
        alpha: { from: 0.4, to: 0.95 },
        yoyo: true,
        duration: telegraphDuration / 2,
        onComplete: () => sigil.destroy()
      });

      const shadow = scene.add.ellipse(targetX, targetY, 18, 10, 0x070302, 0.25).setDepth(targetY - 9);
      scene.tweens.add({
        targets: shadow,
        scaleX: radius / 12,
        scaleY: (radius * 0.6) / 8,
        alpha: 0.75,
        duration: telegraphDuration,
        ease: "Cubic.easeIn",
        onComplete: () => shadow.destroy()
      });

      const startDistX = -240;
      const startDistY = -540;
      const startX = targetX + startDistX;
      const startY = targetY + startDistY;
      const fallAngle = Math.atan2(-startDistY, -startDistX);

      const meteor = scene.add.container(startX, startY).setDepth(9999);
      const mGfx = scene.add.graphics().setBlendMode(BLEND_ADD);

      mGfx.fillStyle(0xff2200, 0.45);
      mGfx.beginPath();
      mGfx.moveTo(0, 0);
      mGfx.lineTo(-65, -35);
      mGfx.lineTo(-120, -5);
      mGfx.lineTo(-65, 35);
      mGfx.closePath();
      mGfx.fillPath();

      mGfx.fillStyle(0xff8800, 0.75);
      mGfx.beginPath();
      mGfx.moveTo(0, 0);
      mGfx.lineTo(-45, -20);
      mGfx.lineTo(-85, 0);
      mGfx.lineTo(-45, 20);
      mGfx.closePath();
      mGfx.fillPath();

      mGfx.fillStyle(0xffffff, 0.95);
      mGfx.fillCircle(0, 0, 16);
      mGfx.fillStyle(0xffcc00, 0.9);
      mGfx.fillCircle(2, 0, 12);
      mGfx.lineStyle(3, 0xff3300, 0.9);
      mGfx.strokeCircle(0, 0, 18);

      meteor.add(mGfx);
      meteor.setRotation(fallAngle);

      const trailTimer = scene.time.addEvent({
        delay: 35,
        repeat: Math.floor(telegraphDuration / 35),
        callback: () => {
          if (!meteor.active) return;
          scene.effects.burstTinted(meteor.x + randBetween(-8, 8), meteor.y + randBetween(-8, 8), 0xff6600, 3);
        }
      });

      scene.tweens.add({
        targets: meteor,
        x: targetX,
        y: targetY,
        duration: telegraphDuration,
        ease: "Cubic.easeIn",
        onComplete: () => {
          trailTimer.remove();
          meteor.destroy();

          if (!scene || scene.state !== "playing") return;

          const flash = scene.add.rectangle(targetX, targetY, radius * 3.5, radius * 3.5, 0xfff6dd, 0.65)
            .setDepth(9999).setBlendMode(BLEND_ADD);
          scene.tweens.add({ targets: flash, alpha: 0, duration: 110, onComplete: () => flash.destroy() });

          const crater = scene.add.graphics().setDepth(targetY - 9);
          crater.fillStyle(0x130a06, 0.85);
          crater.fillEllipse(targetX, targetY, radius * 1.5, radius * 0.9);
          crater.lineStyle(2.5, 0xff3b10, 0.7);
          crater.strokeEllipse(targetX, targetY, radius * 1.1, radius * 0.65);
          
          crater.lineStyle(1.5, 0xff9900, 0.8);
          for (let f = 0; f < 5; f++) {
            const fa = (f / 5) * Math.PI * 2;
            crater.beginPath();
            crater.moveTo(targetX, targetY);
            crater.lineTo(targetX + Math.cos(fa) * radius * 0.5, targetY + Math.sin(fa) * radius * 0.3);
            crater.strokePath();
          }
          scene.tweens.add({ targets: crater, alpha: 0, duration: 3800, onComplete: () => crater.destroy() });

          scene.effects.shockwaveRing?.(targetX, targetY, radius * 1.35);
          scene.time.delayedCall(60, () => {
            scene.effects.shockwaveRing?.(targetX, targetY, radius * 1.65);
          });

          scene.effects.burstTinted(targetX, targetY, 0xffffff, 16);
          scene.effects.burstTinted(targetX, targetY, 0xff4400, 32);
          scene.effects.burstTinted(targetX, targetY - 14, 0xffaa00, 24);
          scene.effects.burstTinted(targetX, targetY, 0x2b1509, 18);

          scene.cameraSys?.shake(0.015, 380);
          scene.effects?.hitStop?.(110);
          scene.audioRef?.play?.("sfx-ancient-dragon-meteor");

          onImpact && onImpact();
        }
      });
    } catch(err) {
      console.error("Meteor FX error:", err);
      onImpact && onImpact();
    }
  };

  // -----------------------------------------------------------------------
  // 3. REALISTIC DYNAMIC WEATHER ENGINE (AUDIO + VOLUMETRIC GRAPHICS)
  // -----------------------------------------------------------------------
  function rollDynamicWeather(biome) {
    const b = (biome || "").toLowerCase();
    const r = Math.random();

    if (b.includes("rio") || b.includes("river") || b.includes("island")) {
      // River: 35% Storm, 35% Drizzle, 30% Clear
      if (r < 0.35) return "storm";
      if (r < 0.70) return "drizzle";
      return "clear";
    }

    if (b.includes("forest") || b.includes("bosque")) {
      // Forest: 30% Storm, 40% Mist/Fog, 30% Clear
      if (r < 0.30) return "storm";
      if (r < 0.70) return "fog";
      return "clear";
    }

    if (b.includes("frozen") || b.includes("glacial") || b.includes("snow") || b.includes("tundra")) {
      // Frozen Citadel: 40% Blizzard, 45% Snow, 15% Clear
      if (r < 0.40) return "blizzard";
      if (r < 0.85) return "snow";
      return "clear";
    }

    if (b.includes("morta") || b.includes("cemetery")) {
      // Dead Forest: 60% Dense Fog, 25% Storm Drizzle, 15% Clear
      if (r < 0.60) return "dense_fog";
      if (r < 0.85) return "storm";
      return "clear";
    }

    if (b.includes("desert")) {
      if (r < 0.40) return "sandstorm";
      return "clear";
    }

    return "clear";
  }

  window.__initGameWeather = function(scene) {
    try {
      if (!scene || !scene.cameras || !scene.cameras.main) return;
      if (scene.__weatherManager) {
        scene.__weatherManager.destroy();
        scene.__weatherManager = null;
      }

      ensureWeatherTextures(scene);
      const bio = (scene.dungeon?.level?.biome || scene.level?.biome || scene.levelId || scene.level?.id || "").toLowerCase();
      const initialWeather = rollDynamicWeather(bio);

      const cam = scene.cameras.main;
      const mgr = {
        scene: scene,
        cam: cam,
        biome: bio,
        weather: initialWeather,
        time: 0,
        nextTransitionTime: 65 + Math.random() * 40,
        nextLightningTime: 8 + Math.random() * 10,
        skyDarkness: 0,
        targetDarkness: 0,
        active: true,

        // Visual containers
        darkOverlay: scene.add.graphics().setDepth(8700).setScrollFactor(0),
        cloudContainer: scene.add.container(0, 0).setDepth(8800).setScrollFactor(0),
        rainGraphics: scene.add.graphics().setDepth(8950).setScrollFactor(0),
        groundGfx: scene.add.graphics().setDepth((scene.dungeon?.wallLayer?.depth || 8)).setBlendMode(BLEND_ADD),
        
        clouds: [],
        particles: [],
        splashes: []
      };

      mgr.applyWeatherState = function(state) {
        this.weather = state;
        const s = this.weather;
        console.log("[WEATHER] Dynamic transition to:", s, "in biome:", this.biome);

        // Sound State Management
        if (s === "storm") {
          WeatherAudio.startRain(this.scene, 1.0);
          WeatherAudio.startWind(this.scene, 0.6);
          this.targetDarkness = 0.32;
        } else if (s === "drizzle") {
          WeatherAudio.startRain(this.scene, 0.35);
          WeatherAudio.stopWind(this.scene);
          this.targetDarkness = 0.12;
        } else if (s === "blizzard") {
          WeatherAudio.stopRain(this.scene);
          WeatherAudio.startWind(this.scene, 1.0);
          this.targetDarkness = 0.20;
        } else if (s === "snow") {
          WeatherAudio.stopRain(this.scene);
          WeatherAudio.startWind(this.scene, 0.25);
          this.targetDarkness = 0.05;
        } else if (s === "dense_fog" || s === "fog") {
          WeatherAudio.stopRain(this.scene);
          WeatherAudio.startWind(this.scene, 0.3);
          this.targetDarkness = 0.18;
        } else {
          // Clear
          WeatherAudio.stopAll(this.scene);
          this.targetDarkness = 0.0;
        }

        // Setup particles for this state
        this.particles = [];
        const isRain = s === "storm" || s === "drizzle";
        const isSnow = s === "snow" || s === "blizzard";
        const count = s === "storm" ? 120 : (s === "drizzle" ? 65 : (s === "blizzard" ? 100 : (s === "snow" ? 70 : 35)));

        for (let i = 0; i < count; i++) {
          if (isRain) {
            const isHeavy = s === "storm";
            this.particles.push({
              x: Math.random() * cam.width,
              y: Math.random() * cam.height,
              vx: (isHeavy ? 90 : 45) + Math.random() * 35,
              vy: (isHeavy ? 720 : 520) + Math.random() * 160,
              len: (isHeavy ? 26 : 16) + Math.random() * 10,
              alpha: (isHeavy ? 0.6 : 0.4) + Math.random() * 0.3,
              thick: isHeavy ? (Math.random() < 0.3 ? 2.0 : 1.4) : 1.2
            });
          } else if (isSnow) {
            const isBlizz = s === "blizzard";
            const layer = Math.random();
            this.particles.push({
              x: Math.random() * cam.width,
              y: Math.random() * cam.height,
              vxBase: isBlizz ? (60 + Math.random() * 40) : (20 + Math.random() * 15),
              vy: (layer > 0.7 ? 120 : (layer > 0.3 ? 80 : 50)) * (isBlizz ? 1.6 : 1.0),
              size: layer > 0.7 ? 3.5 : (layer > 0.3 ? 2.2 : 1.2),
              seed: Math.random() * 100,
              alpha: layer > 0.7 ? 0.95 : 0.65
            });
          } else {
            // Ambient floating forest leaves / pollen / embers
            this.particles.push({
              x: Math.random() * cam.width,
              y: Math.random() * cam.height,
              size: 2.5 + Math.random() * 2,
              vy: 35 + Math.random() * 25,
              seed: Math.random() * 100,
              alpha: 0.5 + Math.random() * 0.4
            });
          }
        }

        // Setup Volumetric Feathered Mist Clouds (Soft radial texture - ZERO flat edges!)
        this.cloudContainer.removeAll(true);
        this.clouds = [];
        const isMisty = s === "fog" || s === "dense_fog" || s === "storm" || this.biome.includes("forest") || this.biome.includes("rio");
        if (isMisty) {
          const cloudPuffCount = s === "dense_fog" ? 10 : (s === "fog" ? 7 : 4);
          for (let c = 0; c < cloudPuffCount; c++) {
            const spr = this.scene.add.image(
              Math.random() * cam.width,
              Math.random() * (cam.height * 0.85) + 30,
              "weather-soft-cloud"
            ).setBlendMode(BLEND_ADD);

            const scale = 1.4 + Math.random() * 1.6;
            spr.setScale(scale);
            spr.setAlpha(s === "dense_fog" ? 0.28 : (s === "fog" ? 0.20 : 0.12));
            if (this.biome.includes("morta")) spr.setTint(0x775588); // Spectral purple/gray
            else if (this.biome.includes("frozen")) spr.setTint(0x99ccff); // Cold frost
            else spr.setTint(0xccddff); // Natural mist

            this.cloudContainer.add(spr);
            this.clouds.push({
              spr: spr,
              vx: (8 + c * 5) * (s === "storm" ? 2.2 : 1.0),
              baseAlpha: spr.alpha,
              rotSpeed: (Math.random() - 0.5) * 0.05,
              seed: Math.random() * 100
            });
          }
        }
      };

      mgr.destroy = function() {
        this.active = false;
        WeatherAudio.stopAll(this.scene);
        try { this.darkOverlay?.destroy(); } catch(e) {}
        try { this.cloudContainer?.destroy(); } catch(e) {}
        try { this.rainGraphics?.destroy(); } catch(e) {}
        try { this.groundGfx?.destroy(); } catch(e) {}
        this.clouds = [];
        this.particles = [];
        this.splashes = [];
      };

      scene.events.once("shutdown", () => mgr.destroy());
      mgr.applyWeatherState(initialWeather);
      scene.__weatherManager = mgr;
    } catch(err) {
      console.error("Weather init error:", err);
    }
  };

  // Weather Frame Update
  window.__updateGameWeather = function(scene, dt) {
    try {
      const mgr = scene?.__weatherManager;
      if (!mgr || !mgr.active) return;
      const cam = mgr.cam;
      const g = mgr.rainGraphics;
      const gg = mgr.groundGfx;
      const dark = mgr.darkOverlay;
      if (!g || !cam) return;

      mgr.time += dt;

      // 1. Dynamic Weather Time Transition
      if (mgr.time >= mgr.nextTransitionTime) {
        mgr.time = 0;
        mgr.nextTransitionTime = 55 + Math.random() * 45;
        const newWeather = rollDynamicWeather(mgr.biome);
        mgr.applyWeatherState(newWeather);
      }

      // Smooth Sky Ambient Darkness
      mgr.skyDarkness += (mgr.targetDarkness - mgr.skyDarkness) * Math.min(1.0, dt * 1.5);
      dark.clear();
      if (mgr.skyDarkness > 0.01) {
        dark.fillStyle(0x060814, mgr.skyDarkness);
        dark.fillRect(0, 0, cam.width, cam.height);
      }

      g.clear();
      gg?.clear();
      const screenW = cam.width;
      const screenH = cam.height;

      // 2. Thunderstorm Lightning Flashes
      if (mgr.weather === "storm") {
        if (mgr.time >= mgr.nextLightningTime) {
          mgr.nextLightningTime = mgr.time + 8 + Math.random() * 12;

          // Lightning Flash on Camera
          cam.flash(110, 255, 255, 255);

          // Procedural Lightning Bolt Graphic
          const bolt = scene.add.graphics().setDepth(9998).setScrollFactor(0).setBlendMode(BLEND_ADD);
          bolt.lineStyle(2.5, 0xffffff, 0.95);
          let lx = randBetween(screenW * 0.2, screenW * 0.8);
          let ly = 0;
          bolt.beginPath();
          bolt.moveTo(lx, ly);
          while (ly < screenH * 0.85) {
            lx += randBetween(-22, 22);
            ly += randBetween(25, 45);
            bolt.lineTo(lx, ly);
          }
          bolt.strokePath();
          scene.tweens.add({ targets: bolt, alpha: 0, duration: 80, onComplete: () => bolt.destroy() });

          // Audio Thunder Rumble (220ms delay after light)
          scene.time.delayedCall(220, () => {
            WeatherAudio.playThunder(scene);
            cam.shake(0.005, 140);
          });
        }
      }

      // 3. Render Rain / Drizzle / Storm
      const isRain = mgr.weather === "storm" || mgr.weather === "drizzle";
      if (isRain) {
        for (let i = 0; i < mgr.particles.length; i++) {
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
        }
      }

      // 4. Render Snow / Blizzard
      const isSnow = mgr.weather === "snow" || mgr.weather === "blizzard";
      if (isSnow) {
        for (let i = 0; i < mgr.particles.length; i++) {
          const p = mgr.particles[i];
          const windTurbulence = Math.sin(mgr.time * 2.2 + p.seed) * 22;
          p.x += (p.vxBase + windTurbulence) * dt;
          p.y += p.vy * dt;

          if (p.y > screenH + 12) {
            p.y = -10;
            p.x = Math.random() * (screenW + 80) - 40;
          }
          if (p.x > screenW + 25) p.x = -20;
          if (p.x < -25) p.x = screenW + 20;

          g.fillStyle(0xffffff, p.alpha);
          g.fillCircle(p.x, p.y, p.size);
        }
      }

      // 5. Update Volumetric Mist Clouds (Breathing + Feathered Drift)
      for (const c of mgr.clouds) {
        c.spr.x += c.vx * dt;
        if (c.spr.x > screenW + 280) {
          c.spr.x = -280;
          c.spr.y = Math.random() * (screenH * 0.85) + 30;
        }
        c.spr.rotation += c.rotSpeed * dt;
        // Organic sine breathing alpha (eliminates any flatness)
        c.spr.alpha = c.baseAlpha + Math.sin(mgr.time * 1.2 + c.seed) * (c.baseAlpha * 0.25);
      }
    } catch(err) {}
  };
})();
`;

for (const file of files) {
  if (!fs.existsSync(file)) {
    console.log('Skipping missing file:', file);
    continue;
  }
  console.log(`Processing: ${file}`);
  let code = fs.readFileSync(file, 'utf8');

  // Replace old fxEngineCode with new dynamic weather engine
  const marker = '// DEPTHGATE ADVANCED VISUAL EFFECTS';
  if (code.includes(marker)) {
    const endMarker = '})();\n';
    const startIdx = code.indexOf(marker);
    const endIdx = code.indexOf(endMarker, startIdx);
    if (startIdx !== -1 && endIdx !== -1) {
      code = code.substring(0, startIdx) + fxEngineCode.trim() + '\n' + code.substring(endIdx + endMarker.length);
      console.log(`[${file}] Upgraded FX & Dynamic Weather Engine.`);
    }
  } else {
    code = fxEngineCode + '\n' + code;
    console.log(`[${file}] Injected FX & Dynamic Weather Engine.`);
  }

  // Ensure window.Phaser = j is set
  const jDef = 'const j=pt.Ay,';
  const jRepl = 'const j=pt.Ay;window.Phaser=j;const ';
  if (code.includes(jDef) && !code.includes('window.Phaser=j')) {
    code = code.replace(jDef, jRepl);
  }

  fs.writeFileSync(file, code, 'utf8');
  console.log(`[${file}] Saved file successfully.`);
}

console.log('Upgrade completed cleanly.');
