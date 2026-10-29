// Abyss Puzzles System for Depth Gate
// Fully aligned with Depth Gate's canonical puzzle mechanics, textures, sounds and rewards (__pzBuild / __gsPuzzles)
(() => {
  // --- 1. PROCEDURAL PIXEL-ART TEXTURES & ASSET INITIALIZER ---
  function initCanonicalPuzzleTextures(scene) {
    if (!scene) return;
    const textures = scene.textures;

    const mk = (key, w, h, drawFn) => {
      if (textures.exists(key)) return;
      const canvas = textures.createCanvas(key, w, h);
      const ctx = canvas.getContext();
      drawFn(ctx, w, h);
      canvas.refresh();
    };

    const grad = (ctx, x0, y0, x1, y1, stops) => {
      const q = ctx.createLinearGradient(x0, y0, x1, y1);
      for (const [offset, color] of stops) q.addColorStop(offset, color);
      return q;
    };

    // 1.1 Bloco de Pedra Pesada Deslizante (32x40)
    mk("pz-stone", 32, 40, (g) => {
      g.fillStyle = "rgba(0,0,0,.38)";
      g.beginPath();
      g.ellipse(16, 37, 15, 3.2, 0, 0, 7);
      g.fill();
      g.fillStyle = grad(g, 0, 12, 0, 38, [[0, "#e2e2e2"], [1, "#8c8c8c"]]);
      g.beginPath();
      g.moveTo(2, 14);
      g.lineTo(30, 14);
      g.lineTo(30, 36);
      g.lineTo(28, 38);
      g.lineTo(4, 38);
      g.lineTo(2, 36);
      g.closePath();
      g.fill();
      g.fillStyle = grad(g, 0, 3, 0, 15, [[0, "#ffffff"], [1, "#d0d0d0"]]);
      g.beginPath();
      g.moveTo(2, 14);
      g.lineTo(6, 5);
      g.lineTo(9, 4);
      g.lineTo(27, 4);
      g.lineTo(30, 6);
      g.lineTo(30, 14);
      g.closePath();
      g.fill();
      g.strokeStyle = "rgba(60,60,60,.55)";
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(2, 25.5);
      g.lineTo(30, 25.5);
      g.moveTo(15.5, 14);
      g.lineTo(15.5, 25.5);
      g.moveTo(9.5, 25.5);
      g.lineTo(9.5, 38);
      g.moveTo(22.5, 25.5);
      g.lineTo(22.5, 38);
      g.stroke();
      g.strokeStyle = "rgba(255,255,255,.55)";
      g.beginPath();
      g.moveTo(3, 15);
      g.lineTo(29, 15);
      g.stroke();
      g.strokeStyle = "rgba(50,50,50,.6)";
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(16, 9, 3.2, 0, 6.3);
      g.moveTo(16, 5);
      g.lineTo(16, 13);
      g.stroke();
      g.strokeStyle = "rgba(40,40,40,.45)";
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(25, 27);
      g.lineTo(27, 31);
      g.lineTo(25, 34);
      g.moveTo(5, 17);
      g.lineTo(7, 20);
      g.stroke();
      g.fillStyle = "rgba(30,30,30,.25)";
      g.fillRect(26, 30, 3, 2);
      g.fillRect(4, 31, 2, 3);
      g.fillStyle = "rgba(0,0,0,.28)";
      g.fillRect(29, 14, 1, 22);
    });

    // 1.2 Placa de Pressão Rúnica (Desativada / Ativada) (30x22)
    for (const on of [0, 1]) {
      mk(on ? "pz-plate-on" : "pz-plate", 30, 22, (g) => {
        g.fillStyle = "rgba(10,20,40,.35)";
        g.beginPath();
        g.ellipse(15, 13, 14, 7, 0, 0, 7);
        g.fill();
        g.fillStyle = grad(g, 0, 2, 0, 20, [[0, "#9aa6b4"], [1, "#566270"]]);
        g.beginPath();
        g.ellipse(15, 10, 13, 7, 0, 0, 7);
        g.fill();
        g.fillStyle = on ? "#ffd24a" : "#3a4654";
        g.beginPath();
        g.ellipse(15, 9, 9, 4.5, 0, 0, 7);
        g.fill();
        g.strokeStyle = on ? "#fff0a0" : "#7d8a98";
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(10, 9);
        g.lineTo(15, 6);
        g.lineTo(20, 9);
        g.lineTo(15, 12);
        g.closePath();
        g.stroke();
      });
    }

    // 1.3 Altar / Pilar de Recomeçar (24x30)
    mk("pz-reset", 24, 30, (g) => {
      g.fillStyle = "rgba(10,20,40,.35)";
      g.beginPath();
      g.ellipse(12, 27, 10, 3, 0, 0, 7);
      g.fill();
      g.fillStyle = grad(g, 0, 2, 0, 28, [[0, "#a8b2c0"], [1, "#5a6574"]]);
      g.beginPath();
      g.moveTo(4, 27);
      g.lineTo(3, 10);
      g.quadraticCurveTo(12, 0, 21, 10);
      g.lineTo(20, 27);
      g.closePath();
      g.fill();
      g.strokeStyle = "#ffd24a";
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(12, 15, 5, 0.3, 5.6);
      g.stroke();
      g.beginPath();
      g.moveTo(16, 10);
      g.lineTo(17, 14);
      g.lineTo(13, 13);
      g.stroke();
    });

    // 1.4 Espelho de Luz Giratório (Posições A e B) (30x44)
    for (const k of ["a", "b"]) {
      mk("pz-mirror-" + k, 30, 44, (g) => {
        g.fillStyle = "rgba(10,20,40,.35)";
        g.beginPath();
        g.ellipse(15, 41, 12, 3, 0, 0, 7);
        g.fill();
        g.fillStyle = grad(g, 0, 30, 0, 42, [[0, "#8d97a6"], [1, "#4c5664"]]);
        g.fillRect(6, 32, 18, 9);
        g.fillStyle = "#6c7684";
        g.fillRect(13, 22, 4, 11);
        g.save();
        g.translate(15, 16);
        g.rotate(k === "a" ? -0.62 : 0.62);
        g.fillStyle = grad(g, -11, 0, 11, 0, [[0, "#d8f6ff"], [0.45, "#8fd4f4"], [0.55, "#ffffff"], [1, "#5aa8d8"]]);
        g.fillRect(-12, -5, 24, 9);
        g.strokeStyle = "#2e6c96";
        g.lineWidth = 1;
        g.strokeRect(-12, -5, 24, 9);
        g.restore();
      });
    }

    // 1.5 Lápide de Dica / Enigma Antigo (26x32)
    mk("pz-plaque", 26, 32, (g) => {
      g.fillStyle = "rgba(10,20,40,.35)";
      g.beginPath();
      g.ellipse(13, 29, 11, 3, 0, 0, 7);
      g.fill();
      g.fillStyle = grad(g, 0, 0, 0, 30, [[0, "#b9c2ce"], [1, "#66707e"]]);
      g.beginPath();
      g.moveTo(3, 29);
      g.lineTo(3, 8);
      g.quadraticCurveTo(13, -2, 23, 8);
      g.lineTo(23, 29);
      g.closePath();
      g.fill();
      g.fillStyle = "#f4fbff";
      g.fillRect(5, 5, 16, 3);
      g.fillStyle = "#4a5462";
      for (let y = 12; y < 26; y += 4) g.fillRect(7, y, 12, 1.5);
    });

    // 1.6 Braseiro Cerimonial de Fogo (26x28)
    mk("pz-brazier", 26, 28, (g) => {
      g.fillStyle = "rgba(10,20,40,.35)";
      g.beginPath();
      g.ellipse(13, 25, 11, 3, 0, 0, 7);
      g.fill();
      g.fillStyle = "#3a3f48";
      g.fillRect(6, 14, 2, 11);
      g.fillRect(18, 14, 2, 11);
      g.fillRect(12, 15, 2, 10);
      g.fillStyle = grad(g, 0, 6, 0, 16, [[0, "#7a828e"], [1, "#30353e"]]);
      g.beginPath();
      g.moveTo(2, 8);
      g.lineTo(24, 8);
      g.lineTo(20, 16);
      g.lineTo(6, 16);
      g.closePath();
      g.fill();
      g.fillStyle = "#1c1f26";
      g.beginPath();
      g.ellipse(13, 8, 11, 3, 0, 0, 7);
      g.fill();
    });

    // 1.7 Pedestal de Cristal / Foco (22x34)
    mk("pz-post", 22, 34, (g) => {
      const q = g.createLinearGradient(3, 0, 19, 0);
      q.addColorStop(0, "#7c7c7c");
      q.addColorStop(0.45, "#d8d8d8");
      q.addColorStop(1, "#6a6a6a");
      g.fillStyle = "rgba(0,0,0,.35)";
      g.beginPath();
      g.ellipse(11, 31, 10, 3, 0, 0, 7);
      g.fill();
      g.fillStyle = q;
      g.fillRect(4, 6, 14, 25);
      g.fillStyle = "#efefef";
      g.beginPath();
      g.moveTo(3, 7);
      g.lineTo(11, 1);
      g.lineTo(19, 7);
      g.closePath();
      g.fill();
      g.fillStyle = "rgba(0,0,0,.3)";
      g.fillRect(4, 28, 14, 3);
    });

    // 1.8 Orbe Radiante de Energia (20x20)
    mk("pz-orb", 20, 20, (g) => {
      const q = g.createRadialGradient(8, 7, 1, 10, 10, 9);
      q.addColorStop(0, "#ffffff");
      q.addColorStop(0.45, "#ffd98a");
      q.addColorStop(1, "rgba(255,180,50,0)");
      g.fillStyle = q;
      g.beginPath();
      g.arc(10, 10, 9, 0, 7);
      g.fill();
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.arc(10, 10, 4.5, 0, 7);
      g.fill();
    });

    // 1.9 Glifos Celestiais (Sol, Lua, Estrela, Triângulo, Losango, Olho)
    for (let k = 0; k < 6; k++) {
      mk("pz-glyph-" + k, 16, 16, (g) => {
        g.fillStyle = "#ffffff";
        g.strokeStyle = "#ffffff";
        g.lineWidth = 1.6;
        g.beginPath();
        if (k === 0) {
          g.arc(8, 8, 3.4, 0, 7);
          g.fill();
          for (let a = 0; a < 8; a++) {
            const q = (a * Math.PI) / 4;
            g.moveTo(8 + Math.cos(q) * 5, 8 + Math.sin(q) * 5);
            g.lineTo(8 + Math.cos(q) * 7.4, 8 + Math.sin(q) * 7.4);
          }
          g.stroke();
        } else if (k === 1) {
          g.arc(8, 8, 6, 0, 7);
          g.fill();
          g.globalCompositeOperation = "destination-out";
          g.beginPath();
          g.arc(11, 6, 5.4, 0, 7);
          g.fill();
          g.globalCompositeOperation = "source-over";
        } else if (k === 2) {
          for (let a = 0; a < 10; a++) {
            const q = -Math.PI / 2 + (a * Math.PI) / 5;
            const r = a % 2 ? 3 : 7.2;
            a ? g.lineTo(8 + Math.cos(q) * r, 8 + Math.sin(q) * r) : g.moveTo(8 + Math.cos(q) * r, 8 + Math.sin(q) * r);
          }
          g.closePath();
          g.fill();
        } else if (k === 3) {
          g.moveTo(8, 1.5);
          g.lineTo(14.5, 14);
          g.lineTo(1.5, 14);
          g.closePath();
          g.fill();
        } else if (k === 4) {
          g.moveTo(8, 1);
          g.lineTo(14, 8);
          g.lineTo(8, 15);
          g.lineTo(2, 8);
          g.closePath();
          g.fill();
        } else {
          g.moveTo(1, 8);
          g.quadraticCurveTo(8, 1, 15, 8);
          g.quadraticCurveTo(8, 15, 1, 8);
          g.closePath();
          g.fill();
          g.globalCompositeOperation = "destination-out";
          g.beginPath();
          g.arc(8, 8, 2.6, 0, 7);
          g.fill();
          g.globalCompositeOperation = "source-over";
        }
      });
    }

    // 1.10 Alavancas Mecânicas (cx-lever-off / on)
    if (!textures.exists("cx-lever-off")) {
      const mkLev = (k, on) => {
        mk(k, 20, 26, (g) => {
          g.fillStyle = "rgba(0,0,0,.35)";
          g.fillRect(3, 22, 14, 3);
          g.fillStyle = "#3a3630";
          g.fillRect(3, 16, 14, 8);
          g.fillStyle = "#5a544a";
          g.fillRect(4, 17, 12, 3);
          g.fillStyle = "#2a2620";
          g.fillRect(8, 14, 4, 3);
          g.strokeStyle = "#8a7a5a";
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(10, 15);
          g.lineTo(on ? 16 : 4, 4);
          g.stroke();
          g.fillStyle = on ? "#8ae0b0" : "#c9a24a";
          g.fillRect(on ? 14 : 2, 2, 4, 4);
        });
      };
      mkLev("cx-lever-off", 0);
      mkLev("cx-lever-on", 1);
    }
  }

  // --- 2. ÁUDIO SINTETIZADO E CANÔNICO ---
  function playTone(scene, freq, dur = 0.35) {
    const audio = scene?.game?.audioEngine;
    if (!audio?.ctx || !audio.sfxBus) return;
    try {
      const t0 = audio.ctx.currentTime;
      const osc1 = audio.ctx.createOscillator();
      const osc2 = audio.ctx.createOscillator();
      const gain = audio.ctx.createGain();

      osc1.type = "sine";
      osc2.type = "triangle";
      osc1.frequency.value = freq;
      osc2.frequency.value = freq * 2.01;

      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.3, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur * 2.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audio.sfxBus);

      osc1.start(t0);
      osc2.start(t0);
      osc1.stop(t0 + dur * 2.4);
      osc2.stop(t0 + dur * 2.4);
    } catch (_) {}
  }

  const GLYPH_NAMES = [
    ["Sol", "Sun", "Sol"],
    ["Lua", "Moon", "Luna"],
    ["Estrela", "Star", "Estrella"],
    ["Triângulo", "Triangle", "Triángulo"],
    ["Losango", "Diamond", "Rombo"],
    ["Olho", "Eye", "Ojo"]
  ];

  // Helper para rótulo interativo padrão Depth Gate
  function setInteractLabel(obj, fn) {
    Object.defineProperty(obj, "interactLabel", { get: fn, configurable: true });
  }

  // --- 3. ABYSS PUZZLE MANAGER (CANÔNICO) ---
  class AbyssPuzzleManager {
    constructor(scene) {
      this.scene = scene;
      this.activePuzzle = null;
      this.isDestroyed = true;
      this.activeObjects = [];
      this.laserGraphics = null;
      this.isSolved = false;
      this.updateHandler = null;
      this.activeTimers = [];

      initCanonicalPuzzleTextures(scene);
    }

    // Método update chamado a cada frame por Game.update(i, t)
    update(dt) {
      // Handler seguro para evitar TypeError em Game.update
    }

    resolveBounds(roomBounds) {
      const S = this.scene;
      if (
        roomBounds &&
        Number.isFinite(roomBounds.x) &&
        Number.isFinite(roomBounds.y) &&
        Number.isFinite(roomBounds.width) &&
        Number.isFinite(roomBounds.height) &&
        roomBounds.width > 0 &&
        roomBounds.height > 0
      ) {
        return roomBounds;
      }
      const r0 = S?.roomManager?.rooms?.[0];
      const rx = r0?.def?.rect;
      const tw = S?.dungeon?.tileWidth || 32;
      const th = S?.dungeon?.tileHeight || 32;
      if (rx && Number.isFinite(rx.x) && Number.isFinite(rx.y)) {
        return {
          x: rx.x * tw,
          y: rx.y * th,
          width: rx.w * tw,
          height: rx.h * th
        };
      }
      const px = S?.player?.x || 400;
      const py = S?.player?.y || 400;
      return {
        x: px - 144,
        y: py - 112,
        width: 288,
        height: 224
      };
    }

    registerObject(obj, interactive = false) {
      if (!obj) return obj;
      this.activeObjects.push(obj);
      if (interactive && this.scene?.dungeon?.objects && !this.scene.dungeon.objects.includes(obj)) {
        this.scene.dungeon.objects.push(obj);
      }
      return obj;
    }

    destroyActive() {
      if (this.updateHandler) {
        this.scene?.events?.off("update", this.updateHandler);
        this.updateHandler = null;
      }
      if (this.laserGraphics) {
        this.laserGraphics.destroy();
        this.laserGraphics = null;
      }
      const dObjs = this.scene?.dungeon?.objects;
      for (const obj of this.activeObjects) {
        try {
          if (Array.isArray(dObjs)) {
            const idx = dObjs.indexOf(obj);
            if (idx !== -1) dObjs.splice(idx, 1);
          }
          if (obj?.body && obj.body.enable) obj.body.enable = false;
          obj?.destroy();
        } catch (_) {}
      }
      if (this.activeTimers) {
        for (const t of this.activeTimers) {
          try { t?.remove?.(); } catch(_) {}
        }
        this.activeTimers = [];
      }
      this.activeObjects = [];
      this.activePuzzle = null;
      this.isDestroyed = true;
    }

    // Spawna o Baú Épico Canônico de Recompensa
    spawnRewardChest(x, y, onSolve) {
      const scene = this.scene;
      const key = "chest-epic";
      // Evita spawnar exatamente em cima do herói
      let spawnX = x;
      let spawnY = y;
      if (scene?.player && Phaser.Math.Distance.Between(scene.player.x, scene.player.y, spawnX, spawnY) < 24) {
        spawnY -= 28;
      }
      const chest = scene.add.image(spawnX, spawnY, key).setDepth(spawnY).setScale(0.3).setAlpha(0);
      chest.opened = false;
      chest.def = { tier: "EPIC", noMimic: true };
      chest.tierKey = "epic";

      scene.tweens.add({
        targets: chest,
        alpha: 1,
        scale: 1,
        duration: 500,
        ease: "Back.easeOut"
      });

      scene.effectsRef?.burstTinted?.(spawnX, spawnY - 6, 0xffd24a, 24);
      scene.effectsRef?.shockwaveRing?.(spawnX, spawnY, 32);

      setInteractLabel(chest, () => (!chest.opened ? "Abrir Baú do Enigma (Relíquia)" : null));

      chest.interact = () => {
        if (chest.opened) return;
        chest.opened = true;
        scene.tweens.add({
          targets: chest,
          scaleY: 0.75,
          duration: 90,
          yoyo: true,
          onYoyo: () => {
            if (scene.textures.exists(key + "-open")) chest.setTexture(key + "-open");
          }
        });
        scene.effectsRef?.burstTinted?.(spawnX, spawnY - 8, 0xffd24a, 20);
        scene.game?.audioEngine?.sfx?.("sfx-chest-open");
        scene.lootSystem?.openChest?.(chest);
        if (onSolve) onSolve();
      };

      this.registerObject(chest, true);
      return chest;
    }

    // Finaliza qualquer enigma com feedback canônico e recompensa prometida (+1 Ponto de Habilidade + Baú)
    triggerSolve(title, chestX, chestY, onSolve) {
      if (this.isSolved) return;
      this.isSolved = true;

      const scene = this.scene;
      const b = this.resolveBounds(null);
      const finalTitle = title || this.activePuzzle?.title || "Enigma Ancestral";
      const finalX = Number.isFinite(chestX) ? chestX : (this.activePuzzle?.chestX ?? (b.x + b.width / 2));
      const finalY = Number.isFinite(chestY) ? chestY : (this.activePuzzle?.chestY ?? (b.y + b.height / 2 - 22));
      const finalCb = onSolve || this.activePuzzle?.onSolve;

      scene.game?.audioEngine?.sfx?.("sfx-secret-reveal");
      scene.cameraSys?.shake?.(0.005, 220);

      // Concede +1 Ponto de Habilidade Extra e +150 XP conforme prometido no portal
      try {
        const curBonus = scene.registry?.get("endless:bonusSkillPoints") || 0;
        scene.registry?.set("endless:bonusSkillPoints", curBonus + 1);
        const er = scene.endlessRun?.();
        if (er) {
          er.bonusSkillPoints = (er.bonusSkillPoints || 0) + 1;
          er.pathResolved = true;
          er.bonusScore = (er.bonusScore || 0) + 350;
          scene.updateEndlessScore?.();
        }
        scene.stats?.addXp?.(150);
        scene.effectsRef?.floatText?.(scene.player?.x || finalX, (scene.player?.y || finalY) - 28, "+1 PONTO DE HABILIDADE & BAÚ ÉPICO!", "#00e5ff", 11);
      } catch (_) {}

      scene.game?.events?.emit("ui:banner", `✦ ENIGMA RESOLVIDO: ${finalTitle}`, "#9ff0ff");

      this.spawnRewardChest(finalX, finalY, finalCb);
    }

    // =========================================================================
    // 1. ENIGMA CANÔNICO DE BLOCOS DESLIZANTES & PLACAS DE PRESSÃO (KITS.blocks)
    // =========================================================================
    startBlocksPuzzle(targetRoom, roomBounds, onSolve) {
      this.destroyActive();
      this.isDestroyed = false;
      this.isSolved = false;
      this.activePuzzle = { type: "blocks" };
      const S = this.scene;
      initCanonicalPuzzleTextures(S);

      const bounds = this.resolveBounds(roomBounds);
      const cx = bounds.x + bounds.width / 2;
      const cy = bounds.y + bounds.height / 2;

      // 1 Altar / Placa de Pressão
      const plateX = cx + 48;
      const plateY = cy + 20;
      const plate = S.add.image(plateX, plateY, "pz-plate").setDepth(plateY - 10);
      this.registerObject(plate, false);

      // Bloco de Pedra Pesada Deslizante
      const startX = cx - 48;
      const startY = cy + 20;
      const stone = S.add.image(startX, startY, "pz-stone").setOrigin(0.5, 0.85).setDepth(startY);
      S.physics.add.existing(stone, false);
      stone.body.setSize(24, 18);
      stone.body.setOffset(4, 18);
      stone.body.setImmovable(true);
      if (S.dungeon?.solids) S.dungeon.solids.add(stone);

      let plateActivated = false;

      const pushStone = (dirX, dirY) => {
        if (this.isSolved || stone.sliding) return;
        stone.sliding = true;
        S.game?.audioEngine?.sfx?.("sfx-door-open");

        const targetX = Phaser.Math.Clamp(stone.x + dirX * 48, bounds.x + 28, bounds.x + bounds.width - 28);
        const targetY = Phaser.Math.Clamp(stone.y + dirY * 48, bounds.y + 28, bounds.y + bounds.height - 28);

        S.tweens.add({
          targets: stone,
          x: targetX,
          y: targetY,
          duration: 280,
          ease: "Sine.easeOut",
          onUpdate: () => {
            stone.setDepth(stone.y);
            if (stone.body) stone.body.updateFromGameObject?.();
            if (!plateActivated && Phaser.Math.Distance.Between(stone.x, stone.y, plateX, plateY) < 24) {
              plateActivated = true;
              plate.setTexture("pz-plate-on");
              S.effectsRef?.burstTinted?.(plateX, plateY, 0xffd24a, 20);
              S.effectsRef?.shockwaveRing?.(plateX, plateY, 26);
              this.triggerSolve("O Bloco Ancestral", cx, cy - 24, onSolve);
            }
          },
          onComplete: () => {
            stone.sliding = false;
            if (!plateActivated && Phaser.Math.Distance.Between(stone.x, stone.y, plateX, plateY) < 24) {
              plateActivated = true;
              plate.setTexture("pz-plate-on");
              this.triggerSolve("O Bloco Ancestral", cx, cy - 24, onSolve);
            }
          }
        });
      };

      setInteractLabel(stone, () => (this.isSolved ? null : "Empurrar Monólito até o Selo"));
      stone.interact = () => {
        if (this.isSolved || stone.sliding) return;
        const dx = plateX - stone.x;
        const dy = plateY - stone.y;
        const pushX = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0;
        const pushY = pushX === 0 ? Math.sign(dy) : 0;
        pushStone(pushX || 1, pushY);
      };
      this.registerObject(stone, true);

      // Altar de Recomeçar
      const resetX = cx;
      const resetY = cy - 48;
      const resetAltar = S.add.image(resetX, resetY, "pz-reset").setOrigin(0.5, 0.85).setDepth(resetY);
      setInteractLabel(resetAltar, () => (this.isSolved ? null : "Reiniciar Posição da Pedra"));
      resetAltar.interact = () => {
        if (this.isSolved || stone.sliding) return;
        stone.setPosition(startX, startY);
        stone.setDepth(startY);
        S.effectsRef?.burstTinted?.(startX, startY, 0x8ae0ff, 12);
        S.game?.audioEngine?.sfx?.("sfx-door-open");
      };
      this.registerObject(resetAltar, true);

      // Mecânica de Empurrar o Bloco por contato contínuo
      let pushTimer = 0;
      this.updateHandler = () => {
        if (this.isSolved || !S.player || stone.sliding) return;
        const dist = Phaser.Math.Distance.Between(S.player.x, S.player.y, stone.x, stone.y);
        if (dist < 36) {
          pushTimer++;
          if (pushTimer > 8) {
            const dx = stone.x - S.player.x;
            const dy = stone.y - S.player.y;
            const pushX = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0;
            const pushY = pushX === 0 ? Math.sign(dy) : 0;
            pushTimer = 0;
            if (pushX !== 0 || pushY !== 0) pushStone(pushX, pushY);
          }
        } else {
          pushTimer = 0;
        }
      };

      S.events.on("update", this.updateHandler);
      S.game?.events?.emit("ui:banner", "Enigma Ancestral: Empurre o Monólito de Pedra até o Selo", "#ffd24a");
    }

    // =========================================================================
    // 2. ENIGMA CANÔNICO DE ESPELHOS GIRATÓRIOS & FEIXE DE LUZ (KITS.mirror)
    // =========================================================================
    startLaserPrismPuzzle(targetRoom, roomBounds, onSolve) {
      this.destroyActive();
      this.isDestroyed = false;
      this.isSolved = false;
      this.activePuzzle = { type: "mirror" };
      const S = this.scene;
      initCanonicalPuzzleTextures(S);

      const bounds = this.resolveBounds(roomBounds);
      const cx = bounds.x + bounds.width / 2;
      const cy = bounds.y + bounds.height / 2;

      // Emissor de Foco Solar
      const emitterX = cx - 72;
      const emitterY = cy - 18;
      const emitterPost = S.add.image(emitterX, emitterY + 6, "pz-post").setDepth(emitterY);
      const emitterOrb = S.add.image(emitterX, emitterY - 8, "pz-orb").setDepth(emitterY + 1);
      this.registerObject(emitterPost, false);
      this.registerObject(emitterOrb, false);

      // Receptor de Energia Alvo
      const targetX = cx + 72;
      const targetY = cy - 18;
      const targetPost = S.add.image(targetX, targetY + 6, "pz-post").setDepth(targetY);
      const targetOrb = S.add.image(targetX, targetY - 8, "pz-orb").setDepth(targetY + 1).setTint(0x777777);
      this.registerObject(targetPost, false);
      this.registerObject(targetOrb, false);

      // Dois Espelhos Giratórios
      const m1X = cx - 28;
      const m1Y = cy - 42;
      const m2X = cx + 28;
      const m2Y = cy + 28;

      const createMirror = (x, y, initialAngle) => {
        let angleState = initialAngle; // 0 ou 1
        const mirror = S.add.image(x, y, angleState ? "pz-mirror-b" : "pz-mirror-a").setDepth(y);
        setInteractLabel(mirror, () => (this.isSolved ? null : "Girar Espelho de Cristal"));

        mirror.interact = () => {
          if (this.isSolved) return;
          angleState = 1 - angleState;
          mirror.setTexture(angleState ? "pz-mirror-b" : "pz-mirror-a");
          S.game?.audioEngine?.sfx?.("sfx-lever");
          S.effectsRef?.burstTinted?.(x, y - 8, 0x8ae0ff, 10);
          updateLaserRay();
        };

        this.registerObject(mirror, true);
        return {
          getAngle: () => angleState,
          x,
          y
        };
      };

      const mirror1 = createMirror(m1X, m1Y, 0);
      const mirror2 = createMirror(m2X, m2Y, 0);

      this.laserGraphics = S.add.graphics().setDepth(cy + 50);

      const updateLaserRay = () => {
        if (!this.laserGraphics) return;
        this.laserGraphics.clear();

        // Linha de luz do emissor
        this.laserGraphics.lineStyle(3, 0xffea75, 0.85);

        const a1 = mirror1.getAngle();
        const a2 = mirror2.getAngle();

        if (a1 === 1 && a2 === 1) {
          // Solução alinhada! O feixe viaja do emissor para espelho 1, para espelho 2, e atinge o receptor!
          this.laserGraphics.beginPath();
          this.laserGraphics.moveTo(emitterX, emitterY - 8);
          this.laserGraphics.lineTo(m1X, m1Y);
          this.laserGraphics.lineTo(m2X, m2Y);
          this.laserGraphics.lineTo(targetX, targetY - 8);
          this.laserGraphics.strokePath();

          // Brilho do receptor
          targetOrb.clearTint();
          S.effectsRef?.burstTinted?.(targetX, targetY - 8, 0xffd24a, 24);
          this.triggerSolve("O Foco dos Espelhos Ancestrais", cx, cy - 22, onSolve);
        } else if (a1 === 1) {
          // Primeiro espelho alinhado, falta o segundo
          this.laserGraphics.beginPath();
          this.laserGraphics.moveTo(emitterX, emitterY - 8);
          this.laserGraphics.lineTo(m1X, m1Y);
          this.laserGraphics.lineTo(m2X, m2Y);
          this.laserGraphics.strokePath();
        } else {
          // Feixe parcial
          this.laserGraphics.beginPath();
          this.laserGraphics.moveTo(emitterX, emitterY - 8);
          this.laserGraphics.lineTo(m1X, m1Y);
          this.laserGraphics.strokePath();
        }
      };

      updateLaserRay();
      S.game?.events?.emit("ui:banner", "Enigma Ancestral: Ajuste os Espelhos de Cristal para Conduzir a Luz", "#ffd24a");
    }

    // =========================================================================
    // 3. ENIGMA CANÔNICO DE ALAVANCAS MECÂNICAS & LÁPIDE (KITS.levers)
    // =========================================================================
    startLeversPuzzle(targetRoom, roomBounds, onSolve) {
      this.destroyActive();
      this.isDestroyed = false;
      this.isSolved = false;
      this.activePuzzle = { type: "levers" };
      const S = this.scene;
      initCanonicalPuzzleTextures(S);

      const bounds = this.resolveBounds(roomBounds);
      const cx = bounds.x + bounds.width / 2;
      const cy = bounds.y + bounds.height / 2;

      // 3 Alavancas com Glifos (Sol, Lua, Estrela)
      const leverCount = 3;
      const correctOrder = [1, 0, 2]; // Ordem: Lua -> Sol -> Estrela
      let currentStep = [];

      // Lápide com Enigma
      const plaqueX = cx;
      const plaqueY = cy - 42;
      const plaque = S.add.image(plaqueX, plaqueY, "pz-plaque").setOrigin(0.5, 1).setDepth(plaqueY);
      setInteractLabel(plaque, () => "Ler Lápide: Lua -> Sol -> Estrela");
      plaque.interact = () => {
        S.effectsRef?.floatText?.(plaqueX, plaqueY - 28, "1º Lua  ▸  2º Sol  ▸  3º Estrela", "#ffd24a", 10);
        S.game?.events?.emit("ui:banner", "Lápide dos Signos: 1º LUA ▸ 2º SOL ▸ 3º ESTRELA", "#ffd24a");
      };
      this.registerObject(plaque, true);

      const levers = [];
      for (let i = 0; i < leverCount; i++) {
        const lx = cx - 48 + i * 48;
        const ly = cy + 28;

        const lev = S.add.image(lx, ly, "cx-lever-off").setOrigin(0.5, 0.75).setDepth(ly);
        const glyphImg = S.add.image(lx, ly - 28, "pz-glyph-" + i).setDepth(ly + 1).setTint(0xffd24a);
        this.registerObject(lev, true);
        this.registerObject(glyphImg, false);

        setInteractLabel(lev, () => (this.isSolved || currentStep.includes(i) ? null : `Puxar Alavanca (${GLYPH_NAMES[i][0]})`));

        lev.interact = () => {
          if (this.isSolved || currentStep.includes(i)) return;
          currentStep.push(i);
          lev.setTexture("cx-lever-on");
          S.game?.audioEngine?.sfx?.("sfx-lever");
          S.effectsRef?.burstTinted?.(lx, ly - 8, 0xffd24a, 10);

          const ok = currentStep.every((val, idx) => val === correctOrder[idx]);
          if (!ok) {
            // Errou a sequência: reseta com alarme
            S.time.delayedCall(450, () => {
              S.game?.audioEngine?.sfx?.("sfx-event-refuse");
              S.cameraSys?.shake?.(0.005, 180);
              S.effectsRef?.floatText?.(cx, cy - 20, "Ordem Incorreta (Lua ▸ Sol ▸ Estrela)!", "#e08a7a");
              currentStep = [];
              levers.forEach((l) => l.setTexture("cx-lever-off"));
            });
          } else if (currentStep.length === leverCount) {
            // Acertou todas as alavancas!
            this.triggerSolve("O Selo das Alavancas", cx, cy - 18, onSolve);
          }
        };

        levers.push(lev);
      }

      S.game?.events?.emit("ui:banner", "Enigma Ancestral: Puxe as Alavancas na Ordem (Lua ▸ Sol ▸ Estrela)", "#ffd24a");
    }

    // =========================================================================
    // 4. ENIGMA CANÔNICO DE BRASEIROS TEMPORIZADOS (KITS.braziers)
    // =========================================================================
    startBraziersPuzzle(targetRoom, roomBounds, onSolve) {
      this.destroyActive();
      this.isDestroyed = false;
      this.isSolved = false;
      this.activePuzzle = { type: "braziers" };
      const S = this.scene;
      initCanonicalPuzzleTextures(S);

      const bounds = this.resolveBounds(roomBounds);
      const cx = bounds.x + bounds.width / 2;
      const cy = bounds.y + bounds.height / 2;

      // 4 Braseiros dispostos nos cantos
      const offsets = [
        [-48, -32],
        [48, -32],
        [-48, 32],
        [48, 32]
      ];

      const BURN_TIME = 12.0; // Segundos para cada braseiro
      const braziers = [];

      offsets.forEach(([ox, oy], idx) => {
        const bx = cx + ox;
        const by = cy + oy;

        const img = S.add.image(bx, by, "pz-brazier").setOrigin(0.5, 1).setDepth(by);
        const flame = S.add.sprite(bx, by - 16, "torch-flame", 0).setOrigin(0.5, 1).setScale(1.2).setDepth(by + 1).setVisible(false);
        if (S.anims.exists("torch-flame-burn")) flame.play("torch-flame-burn");

        const data = { img, flame, timeLeft: 0, index: idx };

        setInteractLabel(img, () => (this.isSolved || data.timeLeft > 0 ? null : "Acender o Braseiro"));

        img.interact = () => {
          if (this.isSolved || data.timeLeft > 0) return;
          data.timeLeft = BURN_TIME;
          flame.setVisible(true);
          S.game?.audioEngine?.sfx?.("sfx-mage-fireball");
          S.effectsRef?.burstTinted?.(bx, by - 16, 0xff7722, 14);

          // Verifica se todos estão acesos simultaneamente
          if (braziers.every((b) => b.timeLeft > 0)) {
            this.triggerSolve("O Fogo Sagrado dos Braseiros", cx, cy - 22, onSolve);
          }
        };

        this.registerObject(img, true);
        this.registerObject(flame, false);
        braziers.push(data);
      });

      // Loop de contagem regressiva dos braseiros
      this.updateHandler = (time, delta) => {
        if (this.isSolved || S.uiOpen || S.time?.paused) return;
        const dt = delta / 1000;
        for (const b of braziers) {
          if (b.timeLeft > 0) {
            b.timeLeft -= dt;
            if (b.timeLeft <= 0) {
              b.timeLeft = 0;
              b.flame.setVisible(false);
              S.effectsRef?.burstTinted?.(b.img.x, b.img.y - 16, 0x555555, 6);
            }
          }
        }
      };

      S.events.on("update", this.updateHandler);
      S.game?.events?.emit("ui:banner", "Enigma Ancestral: Acenda os 4 Braseiros Antes que Apaguem!", "#ffd24a");
    }

    // =========================================================================
    // 5. ENIGMA CANÔNICO DE RUNAS DA MEMÓRIA - SIMON SAYS (KITS.runes)
    // =========================================================================
    startRuneMemoryPuzzle(targetRoom, roomBounds, onSolve) {
      this.destroyActive();
      this.isDestroyed = false;
      this.isSolved = false;
      this.activePuzzle = { type: "runes" };
      const S = this.scene;
      initCanonicalPuzzleTextures(S);

      const bounds = this.resolveBounds(roomBounds);
      const cx = bounds.x + bounds.width / 2;
      const cy = bounds.y + bounds.height / 2;

      // 4 Runas Celestiais com frequências harmônicas
      const runes = [
        { name: "1º Sol", glyph: 0, freq: 261.63, ox: -44, oy: -28, color: 0xffd24a },
        { name: "2º Lua", glyph: 1, freq: 329.63, ox: 44, oy: -28, color: 0x8ae0ff },
        { name: "3º Estrela", glyph: 2, freq: 392.0, ox: -44, oy: 28, color: 0xff88ff },
        { name: "Olho", glyph: 5, freq: 523.25, ox: 44, oy: 28, color: 0x88ffaa }
      ];

      const sequence = [0, 1, 2, 0]; // 4 passos melódicos: Sol -> Lua -> Estrela -> Sol
      let playerStep = 0;
      let isPlayingSequence = false;

      const runeObjects = runes.map((r, idx) => {
        const rx = cx + r.ox;
        const ry = cy + r.oy;

        const plate = S.add.image(rx, ry, "pz-plate").setDepth(ry);
        const glyph = S.add.image(rx, ry - 4, "pz-glyph-" + r.glyph).setDepth(ry + 1).setTint(r.color).setScale(1.1);

        this.registerObject(plate, true);
        this.registerObject(glyph, false);

        const flash = () => {
          if (this.isDestroyed || !plate?.scene?.sys || !plate.active) return;
          try { plate.setTexture("pz-plate-on"); } catch(_) { return; }
          if (glyph?.scene?.sys && glyph.active) glyph.setScale(1.4);
          playTone(S, r.freq, 0.4);
          S.effectsRef?.burstTinted?.(rx, ry, r.color, 10);
          const t = S.time.delayedCall(300, () => {
            if (this.isDestroyed || !plate?.scene?.sys || !plate.active) return;
            try { plate.setTexture("pz-plate"); } catch(_) {}
            if (glyph?.scene?.sys && glyph.active) glyph.setScale(1.1);
          });
          this.activeTimers.push(t);
        };

        setInteractLabel(plate, () => (isPlayingSequence || this.isSolved ? null : `Tocar Runa (${r.name})`));

        plate.interact = () => {
          if (isPlayingSequence || this.isSolved) return;
          flash();

          if (sequence[playerStep] === idx) {
            playerStep++;
            if (playerStep === sequence.length) {
              this.triggerSolve("A Melodia Rúnica Celestial", cx, cy - 22, onSolve);
            }
          } else {
            // Errou: reinicia sequência após aviso
            isPlayingSequence = true;
            S.time.delayedCall(400, () => {
              S.game?.audioEngine?.sfx?.("sfx-event-refuse");
              S.cameraSys?.shake?.(0.005, 180);
              S.effectsRef?.floatText?.(cx, cy - 20, "Melodia Incorreta! (Sol ▸ Lua ▸ Estrela ▸ Sol)", "#e08a7a");
              playerStep = 0;
              S.time.delayedCall(900, playPattern);
            });
          }
        };

        return { flash, plate, glyph };
      });

      // Pedestal de repetição da melodia
      const hintAltar = S.add.image(cx, cy - 46, "pz-reset").setOrigin(0.5, 0.85).setDepth(cy - 46);
      setInteractLabel(hintAltar, () => (this.isSolved ? null : "Ouvir Melodia Rúnica (Sol ▸ Lua ▸ Estrela ▸ Sol)"));
      hintAltar.interact = () => {
        if (this.isSolved || isPlayingSequence) return;
        playerStep = 0;
        playPattern();
      };
      this.registerObject(hintAltar, true);

      // Toca a sequência harmônica do enigma
      const playPattern = () => {
        if (this.isSolved || this.isDestroyed) return;
        isPlayingSequence = true;
        sequence.forEach((runeIdx, step) => {
          const t = S.time.delayedCall(step * 520 + 250, () => {
            if (this.isSolved || this.isDestroyed || !this.scene?.sys?.isActive?.()) return;
            runeObjects[runeIdx]?.flash();
            if (step === sequence.length - 1) {
              const tEnd = S.time.delayedCall(350, () => {
                isPlayingSequence = false;
              });
              this.activeTimers.push(tEnd);
            }
          });
          this.activeTimers.push(t);
        });
      };

      const startT = S.time.delayedCall(950, playPattern);
      this.activeTimers.push(startT);
      S.game?.events?.emit("ui:banner", "Enigma Ancestral: Repita a Melodia (Sol ▸ Lua ▸ Estrela ▸ Sol)", "#ffd24a");
    }

    // Inicialização aleatória canônica (escolhe entre os 5 tipos canônicos)
    startRandomPuzzle(targetRoom, roomBounds, onSolve) {
      const types = [
        "blocks",
        "mirror",
        "levers",
        "braziers",
        "runes"
      ];
      const pick = types[Math.floor(Math.random() * types.length)];
      switch (pick) {
        case "blocks":
          return this.startBlocksPuzzle(targetRoom, roomBounds, onSolve);
        case "mirror":
          return this.startLaserPrismPuzzle(targetRoom, roomBounds, onSolve);
        case "levers":
          return this.startLeversPuzzle(targetRoom, roomBounds, onSolve);
        case "braziers":
          return this.startBraziersPuzzle(targetRoom, roomBounds, onSolve);
        case "runes":
        default:
          return this.startRuneMemoryPuzzle(targetRoom, roomBounds, onSolve);
      }
    }
  }

  // Exportação global
  window.AbyssPuzzleManager = AbyssPuzzleManager;
})();
