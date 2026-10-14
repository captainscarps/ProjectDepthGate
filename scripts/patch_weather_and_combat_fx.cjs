const fs = require('fs');

const files = [
  'assets/index-D6qIWtA7-p209.js',
  'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
];

const fxEngineCode = `
// =========================================================================
// DEPTHGATE ADVANCED VISUAL EFFECTS & WEATHER SYSTEM
// =========================================================================
(function(){
  if (typeof window === "undefined") return;

  const BLEND_ADD = 1; // Phaser.BlendModes.ADD
  function randBetween(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
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

      // Determine Weapon Archetype
      const isGreatsword = key.includes("great") || key.includes("slayer") || key.includes("dragon_sword");
      const isDagger = key.includes("dagger") || key.includes("fang") || key.includes("rogue_dual");
      const isAxe = key.includes("axe");
      const isStaffOrClub = key.includes("staff") || key.includes("club");
      const isUnarmed = key === "unarmed";
      const isFrost = key.includes("frost") || key.includes("glacial");
      const isFire = key.includes("dragon") || key.includes("inferno") || key.includes("flame") || key.includes("ember");
      const isShadow = key.includes("shadow") || key.includes("twin_fang") || key.includes("assassin");

      if (isGreatsword) {
        // --- GREATSWORD / HEAVY 2H BLADES ---
        const gRange = range * 1.25;
        const gColor = isFrost ? 0x77eeff : (isFire ? 0xff5500 : 0xffdd55);
        const arcG = scene.add.graphics().setDepth(py + 25).setBlendMode(BLEND_ADD);
        
        // Broad glowing blade sweep
        arcG.fillStyle(gColor, 0.32);
        arcG.slice(px, py, gRange, dirAngle - halfAngleRad * 1.15, dirAngle + halfAngleRad * 1.15, false);
        arcG.fillPath();

        // Thick cutting edge
        arcG.lineStyle(5.0, 0xffffff, 0.95);
        arcG.beginPath();
        arcG.arc(px, py, gRange, dirAngle - halfAngleRad * 1.1, dirAngle + halfAngleRad * 1.1, false);
        arcG.strokePath();

        // Outer elemental aura
        arcG.lineStyle(2.5, gColor, 0.85);
        arcG.beginPath();
        arcG.arc(px, py, gRange * 0.92, dirAngle - halfAngleRad, dirAngle + halfAngleRad, false);
        arcG.strokePath();

        scene.tweens.add({ targets: arcG, alpha: 0, scale: 1.08, duration: 180, onComplete: () => arcG.destroy() });

        // Forward heavy blade slash sprite
        effects.slash(px + dirVec.x * gRange * 0.6, py + dirVec.y * gRange * 0.6, dirAngle, gColor);

        // Ground cleave crack & dust
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
        // --- DAGGERS / DUAL FANGS / ASSASSIN (RAPID X-CROSS SLICES) ---
        const dColor = isShadow ? 0xb555ff : (isFrost ? 0x88eeff : 0xd8ffff);
        const dRange = range * 1.05;

        // Slice 1: angled cut (-25 deg)
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

        // Slice 2: delayed intersecting cut (+25 deg)
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

          // Razor spark glint at cross intersection
          effects.burstTinted(midX, midY, dColor, 7);
        });

        cam?.shake(0.0025, 55);
        return true;
      }

      if (isAxe) {
        // --- AXE (HEAVY BRUTAL DOWNWARD CHOP) ---
        const aColor = 0xff3b30;
        const aRange = range * 1.1;
        const arcG = scene.add.graphics().setDepth(py + 25).setBlendMode(BLEND_ADD);

        arcG.fillStyle(aColor, 0.35);
        arcG.slice(px, py, aRange, dirAngle - halfAngleRad * 0.9, dirAngle + halfAngleRad * 0.9, false);
        arcG.fillPath();

        // Heavy axe head blade weight
        arcG.lineStyle(6.0, 0xffffff, 0.95);
        arcG.beginPath();
        arcG.arc(px, py, aRange, dirAngle - 0.25, dirAngle + 0.25, false);
        arcG.strokePath();

        scene.tweens.add({ targets: arcG, alpha: 0, duration: 160, onComplete: () => arcG.destroy() });
        effects.slash(midX, midY, dirAngle, aColor);

        // Ground chop shockwave
        const impactX = px + dirVec.x * aRange * 0.85;
        const impactY = py + dirVec.y * aRange * 0.85;
        effects.shockwaveRing?.(impactX, impactY, 22);
        effects.burstTinted(impactX, impactY, 0xff9500, 10);
        cam?.shake(0.006, 115);
        return true;
      }

      if (isStaffOrClub) {
        // --- STAFF / BLUNT / CLUB (CONCUSSIVE ENERGY PULSE) ---
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
        // --- UNARMED / MARTIAL ARTS (SONIC KINETIC PUNCH) ---
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

      // Default: Refined 1-Handed Sword Slash
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

      // A. Ground Magic Sigil & Pentagram
      const sigil = scene.add.graphics().setDepth(targetY - 8).setBlendMode(BLEND_ADD);
      sigil.lineStyle(2, meteorColor, 0.7);
      sigil.strokeCircle(targetX, targetY, radius);
      sigil.lineStyle(1.2, 0xffdd66, 0.85);
      sigil.strokeCircle(targetX, targetY, radius * 0.65);
      
      // Rotating inner runic spokes
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

      // B. Growing Ground Impact Shadow
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

      // C. Supersonic Falling Meteor from High Sky
      const startDistX = -240;
      const startDistY = -540;
      const startX = targetX + startDistX;
      const startY = targetY + startDistY;
      const fallAngle = Math.atan2(-startDistY, -startDistX);

      // Meteor Visual Container
      const meteor = scene.add.container(startX, startY).setDepth(9999);
      const mGfx = scene.add.graphics().setBlendMode(BLEND_ADD);

      // Blazing flame tail stretching backward
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

      // Burning molten rock head
      mGfx.fillStyle(0xffffff, 0.95);
      mGfx.fillCircle(0, 0, 16);
      mGfx.fillStyle(0xffcc00, 0.9);
      mGfx.fillCircle(2, 0, 12);
      mGfx.lineStyle(3, 0xff3300, 0.9);
      mGfx.strokeCircle(0, 0, 18);

      meteor.add(mGfx);
      meteor.setRotation(fallAngle);

      // Trailing cinders emission timer during fall
      const trailTimer = scene.time.addEvent({
        delay: 35,
        repeat: Math.floor(telegraphDuration / 35),
        callback: () => {
          if (!meteor.active) return;
          scene.effects.burstTinted(meteor.x + randBetween(-8, 8), meteor.y + randBetween(-8, 8), 0xff6600, 3);
        }
      });

      // Accelerated downward flight tween
      scene.tweens.add({
        targets: meteor,
        x: targetX,
        y: targetY,
        duration: telegraphDuration,
        ease: "Cubic.easeIn",
        onComplete: () => {
          trailTimer.remove();
          meteor.destroy();

          // D. Cataclysmic Impact Event
          if (!scene || scene.state !== "playing") return;

          // 1. Blinding Impact Flash
          const flash = scene.add.rectangle(targetX, targetY, radius * 3.5, radius * 3.5, 0xfff6dd, 0.65)
            .setDepth(9999).setBlendMode(BLEND_ADD);
          scene.tweens.add({ targets: flash, alpha: 0, duration: 110, onComplete: () => flash.destroy() });

          // 2. Charred Ground Scorch Crater (Persists & Cools over 3.5s)
          const crater = scene.add.graphics().setDepth(targetY - 9);
          crater.fillStyle(0x130a06, 0.85);
          crater.fillEllipse(targetX, targetY, radius * 1.5, radius * 0.9);
          crater.lineStyle(2.5, 0xff3b10, 0.7);
          crater.strokeEllipse(targetX, targetY, radius * 1.1, radius * 0.65);
          
          // Magma fissures inside crater
          crater.lineStyle(1.5, 0xff9900, 0.8);
          for (let f = 0; f < 5; f++) {
            const fa = (f / 5) * Math.PI * 2;
            crater.beginPath();
            crater.moveTo(targetX, targetY);
            crater.lineTo(targetX + Math.cos(fa) * radius * 0.5, targetY + Math.sin(fa) * radius * 0.3);
            crater.strokePath();
          }
          scene.tweens.add({ targets: crater, alpha: 0, duration: 3800, onComplete: () => crater.destroy() });

          // 3. Dual Shockwave Rings
          scene.effects.shockwaveRing?.(targetX, targetY, radius * 1.35);
          scene.time.delayedCall(60, () => {
            scene.effects.shockwaveRing?.(targetX, targetY, radius * 1.65);
          });

          // 4. Violent Fire and Rock Particle Eruption
          scene.effects.burstTinted(targetX, targetY, 0xffffff, 16);
          scene.effects.burstTinted(targetX, targetY, 0xff4400, 32);
          scene.effects.burstTinted(targetX, targetY - 14, 0xffaa00, 24);
          scene.effects.burstTinted(targetX, targetY, 0x2b1509, 18);

          // 5. Heavy Camera Shake & Hitstop
          scene.cameraSys?.shake(0.015, 380);
          scene.effects?.hitStop?.(110);
          scene.audioRef?.play?.("sfx-ancient-dragon-meteor");

          // 6. Execute damage callback
          onImpact && onImpact();
        }
      });
    } catch(err) {
      console.error("Meteor FX error:", err);
      onImpact && onImpact();
    }
  };

  // Dragon Boss Falling Meteor hook
  window.__spawnDragonMeteor = function(scene, x, y, radius, telegraphMs, onImpact) {
    window.__spawnEpicMeteor(scene, x, y, radius, telegraphMs || 850, 0xff3300, onImpact);
  };

  // 3. OPEN MAPS WEATHER SYSTEM (RAIN, SNOW, MIST/FOG)
  window.__initGameWeather = function(scene) {
    try {
      if (!scene || !scene.cameras || !scene.cameras.main) return;
      if (scene.__weatherManager) {
        scene.__weatherManager.destroy();
        scene.__weatherManager = null;
      }

      const bio = (scene.dungeon?.level?.biome || scene.level?.biome || scene.levelId || scene.level?.id || "").toLowerCase();
      
      // Biome Weather Detection
      let weatherType = "none";
      if (bio.includes("rio") || bio.includes("river") || bio.includes("lake") || bio.includes("island")) {
        weatherType = "rain"; // River / open waters -> Rain with splashes and river mist
      } else if (bio.includes("frozen") || bio.includes("glacial") || bio.includes("snow") || bio.includes("tundra")) {
        weatherType = "snow"; // Frozen Citadel -> Snowfall with wind drift
      } else if (bio.includes("forest") || bio.includes("bosque")) {
        weatherType = "forest"; // Forest / Eldervale / Amazônica -> Canopy Mist & Leaves & gentle drizzle
      } else if (bio.includes("morta") || bio.includes("cemetery")) {
        weatherType = "fog"; // Dead Forest -> Creeping Fog & Ash
      } else if (bio.includes("desert")) {
        weatherType = "sand"; // Desert -> Sand drift
      }

      if (weatherType === "none") return;

      const cam = scene.cameras.main;
      const mgr = {
        type: weatherType,
        scene: scene,
        cam: cam,
        graphics: scene.add.graphics().setDepth(8950).setScrollFactor(0),
        groundGfx: scene.add.graphics().setDepth((scene.dungeon?.wallLayer?.depth || 8)).setBlendMode(BLEND_ADD),
        particles: [],
        splashes: [],
        mistClouds: [],
        time: 0,
        active: true
      };

      // Rain Particles Setup
      if (weatherType === "rain") {
        const count = 75;
        for (let i = 0; i < count; i++) {
          mgr.particles.push({
            x: Math.random() * cam.width,
            y: Math.random() * cam.height,
            vx: 55 + Math.random() * 25,
            vy: 480 + Math.random() * 120,
            len: 15 + Math.random() * 9,
            alpha: 0.45 + Math.random() * 0.35,
            color: 0x99ccff
          });
        }
      }

      // Snow Particles Setup
      if (weatherType === "snow") {
        const count = 65;
        for (let i = 0; i < count; i++) {
          const layer = Math.random();
          mgr.particles.push({
            x: Math.random() * cam.width,
            y: Math.random() * cam.height,
            size: layer > 0.75 ? 3.0 : (layer > 0.35 ? 2.0 : 1.2),
            vy: layer > 0.75 ? 95 : (layer > 0.35 ? 70 : 45),
            vxBase: 25,
            seed: Math.random() * 100,
            alpha: layer > 0.75 ? 0.9 : 0.65,
            color: 0xffffff
          });
        }
      }

      // Forest Canopy Leaves & Mist Setup
      if (weatherType === "forest") {
        const count = 30;
        for (let i = 0; i < count; i++) {
          mgr.particles.push({
            x: Math.random() * cam.width,
            y: Math.random() * cam.height,
            size: 2.5 + Math.random() * 1.5,
            vy: 40 + Math.random() * 30,
            seed: Math.random() * 100,
            color: Math.random() < 0.5 ? 0x6bb854 : 0xddaa44,
            alpha: 0.55 + Math.random() * 0.35
          });
        }
      }

      // Volumetric Fog / Mist Clouds Setup (Forest, River, Morta)
      if (weatherType === "forest" || weatherType === "rain" || weatherType === "fog") {
        const cloudCount = weatherType === "fog" ? 4 : 2;
        for (let c = 0; c < cloudCount; c++) {
          const fogGfx = scene.add.graphics().setDepth(8850).setScrollFactor(0).setBlendMode(BLEND_ADD);
          fogGfx.fillStyle(weatherType === "fog" ? 0x665577 : 0xaaccee, weatherType === "fog" ? 0.22 : 0.14);
          fogGfx.fillEllipse(0, 0, 480, 160);
          fogGfx.x = Math.random() * cam.width;
          fogGfx.y = 50 + c * 80;
          mgr.mistClouds.push({
            gfx: fogGfx,
            vx: 12 + c * 6,
            width: 480
          });
        }
      }

      mgr.destroy = function() {
        this.active = false;
        try { this.graphics?.destroy(); } catch(e) {}
        try { this.groundGfx?.destroy(); } catch(e) {}
        for (const c of this.mistClouds) {
          try { c.gfx?.destroy(); } catch(e) {}
        }
        this.particles = [];
        this.splashes = [];
        this.mistClouds = [];
      };

      scene.events.once("shutdown", () => mgr.destroy());
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
      const g = mgr.graphics;
      const gg = mgr.groundGfx;
      const cam = mgr.cam;
      if (!g || !cam) return;

      mgr.time += dt;
      g.clear();
      gg?.clear();

      const screenW = cam.width;
      const screenH = cam.height;

      // 1. Render Rain
      if (mgr.type === "rain") {
        for (let i = 0; i < mgr.particles.length; i++) {
          const p = mgr.particles[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Splash trigger when hitting bottom half of viewport
          if (p.y > screenH - 20) {
            if (Math.random() < 0.28 && mgr.splashes.length < 24) {
              const worldX = cam.scrollX + p.x;
              const worldY = cam.scrollY + p.y;
              mgr.splashes.push({ x: worldX, y: worldY, r: 2, maxR: 9, alpha: 0.65 });
            }
            p.y = -20;
            p.x = Math.random() * (screenW + 100) - 50;
          }
          if (p.x > screenW + 30) p.x = -20;

          // Draw slanted raindrop
          g.lineStyle(1.4, p.color, p.alpha);
          g.beginPath();
          g.moveTo(p.x, p.y);
          g.lineTo(p.x - p.vx * 0.035, p.y - p.len);
          g.strokePath();
        }

        // Render ground splash ripples in world space
        if (gg && mgr.splashes.length > 0) {
          for (let s = mgr.splashes.length - 1; s >= 0; s--) {
            const sp = mgr.splashes[s];
            sp.r += 24 * dt;
            sp.alpha -= 2.8 * dt;
            if (sp.alpha <= 0) {
              mgr.splashes.splice(s, 1);
              continue;
            }
            gg.lineStyle(1.2, 0xbbddff, sp.alpha);
            gg.strokeEllipse(sp.x, sp.y, sp.r * 2, sp.r);
          }
        }
      }

      // 2. Render Snow
      if (mgr.type === "snow") {
        for (let i = 0; i < mgr.particles.length; i++) {
          const p = mgr.particles[i];
          const windSway = Math.sin(mgr.time * 1.8 + p.seed) * 18;
          p.x += (p.vxBase + windSway) * dt;
          p.y += p.vy * dt;

          if (p.y > screenH + 10) {
            p.y = -10;
            p.x = Math.random() * (screenW + 60) - 30;
          }
          if (p.x > screenW + 20) p.x = -15;
          if (p.x < -20) p.x = screenW + 15;

          g.fillStyle(p.color, p.alpha);
          g.fillCircle(p.x, p.y, p.size);
        }
      }

      // 3. Render Forest Fluttering Leaves
      if (mgr.type === "forest") {
        for (let i = 0; i < mgr.particles.length; i++) {
          const p = mgr.particles[i];
          const sway = Math.sin(mgr.time * 2.2 + p.seed) * 24;
          p.x += sway * dt;
          p.y += p.vy * dt;

          if (p.y > screenH + 15) {
            p.y = -15;
            p.x = Math.random() * screenW;
          }
          if (p.x > screenW + 20) p.x = -10;
          if (p.x < -20) p.x = screenW + 10;

          g.fillStyle(p.color, p.alpha);
          g.fillEllipse(p.x, p.y, p.size * 1.8, p.size);
        }
      }

      // 4. Update Volumetric Fog / Mist Clouds
      for (const cloud of mgr.mistClouds) {
        cloud.gfx.x += cloud.vx * dt;
        if (cloud.gfx.x > screenW + cloud.width / 2) {
          cloud.gfx.x = -cloud.width / 2;
        }
      }
    } catch(err) {
      // Graceful error isolation
    }
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

  // Replace old fxEngineCode if already present, or inject fresh
  const marker = '// DEPTHGATE ADVANCED VISUAL EFFECTS & WEATHER SYSTEM';
  if (code.includes(marker)) {
    const endMarker = '})();\n';
    const startIdx = code.indexOf(marker);
    const endIdx = code.indexOf(endMarker, startIdx);
    if (startIdx !== -1 && endIdx !== -1) {
      code = code.substring(0, startIdx) + fxEngineCode.trim() + '\n' + code.substring(endIdx + endMarker.length);
      console.log(`[${file}] Updated FX Engine code.`);
    }
  } else {
    code = fxEngineCode + '\n' + code;
    console.log(`[${file}] Injected FX Engine code.`);
  }

  // Ensure window.Phaser = j is set
  const jDef = 'const j=pt.Ay,';
  const jRepl = 'const j=pt.Ay;window.Phaser=j;const ';
  if (code.includes(jDef) && !code.includes('window.Phaser=j')) {
    code = code.replace(jDef, jRepl);
    console.log(`[${file}] Exposed window.Phaser = j.`);
  }

  // 1. Hook deliverAttack
  const targetAttack = 't.effect==="heavy"?(this.effects.arcSlash(this.player.x,this.player.y,h,s.range,s.angle,16756810),this.effects.burstTinted(u,p,9080698,8),this.cameraSys.shake(.004,100)):t.effect==="flash"?(this.effects.arcSlash(this.player.x,this.player.y,h,s.range,s.angle,14217983),this.effects.burstTinted(u,p,16777215,5)):this.effects.arcSlash(this.player.x,this.player.y,h,s.range,s.angle,xt.ATTACK_SLASH);';
  const replAttack = 'window.__weaponMeleeFx(this,i,t,n,h,s,u,p);';
  if (code.includes(targetAttack)) {
    code = code.replace(targetAttack, replAttack);
    console.log(`[${file}] Hooked deliverAttack for weapon-specific melee effects.`);
  }

  // 2. Hook execTelegraphAoe (Meteor)
  const targetTelegraph = 'this.scene.telegraphs.circle(d,o,i.radius,i.telegraphMs,i.color,()=>{const a=this.scene;if(!a||a.state!=="playing")return;a.effects.burstTinted(d,o,16750130,26),a.effects.burstTinted(d,o,9180180,12),a.effects.shockwaveRing(d,o,i.radius),a.cameraSys.shake(.009,240),a.effects.hitStop(80);const{amount:n,crit:s}=this.rollDamage(i);for(const r of a.combat.getTargets())if(a.damageSystem.circleHit(d,o,i.radius,r.x,r.y,r.body.width/2)){const l=Math.hypot(r.x-d,r.y-o)||1;a.damageSystem.apply({target:r,amount:n,critical:s,type:i.damageType,dir:{x:(r.x-d)/l,y:(r.y-o)/l}})}})';
  const replTelegraph = 'if(i.id==="METEOR"||i.id==="FIRE_METEOR"){window.__spawnEpicMeteor(this.scene,d,o,i.radius,i.telegraphMs,i.color,()=>{const a=this.scene;if(!a||a.state!=="playing")return;const{amount:n,crit:s}=this.rollDamage(i);for(const r of a.combat.getTargets())if(a.damageSystem.circleHit(d,o,i.radius,r.x,r.y,r.body.width/2)){const l=Math.hypot(r.x-d,r.y-o)||1;a.damageSystem.apply({target:r,amount:n,critical:s,type:i.damageType,dir:{x:(r.x-d)/l,y:(r.y-o)/l}})}})}else{' + targetTelegraph + '}';
  if (code.includes(targetTelegraph)) {
    code = code.replace(targetTelegraph, replTelegraph);
    console.log(`[${file}] Hooked execTelegraphAoe for realistic Mage Meteor.`);
  }

  // 3. Hook GameScene Weather init
  const targetDust = 'this.dustTimer=this.time.addEvent({delay:420,loop:!0,callback:()=>{';
  const replDust = 'window.__initGameWeather(this);this.dustTimer=this.time.addEvent({delay:420,loop:!0,callback:()=>{';
  if (code.includes(targetDust) && !code.includes('window.__initGameWeather(this);')) {
    code = code.replace(targetDust, replDust);
    console.log(`[${file}] Hooked GameScene create for weather initialization.`);
  }

  // 4. Hook GameScene Weather update
  const targetUpdate = 'update(i,t){const e=Math.min(t/1e3,.05);if(this.freezeTimer>0){';
  const replUpdate = 'update(i,t){const e=Math.min(t/1e3,.05);window.__updateGameWeather(this,e);if(this.freezeTimer>0){';
  if (code.includes(targetUpdate) && !code.includes('window.__updateGameWeather(this,e);')) {
    code = code.replace(targetUpdate, replUpdate);
    console.log(`[${file}] Hooked GameScene update for weather animation.`);
  }

  fs.writeFileSync(file, code, 'utf8');
  console.log(`[${file}] Successfully saved updated file!`);
}

console.log('All patches applied cleanly.');
