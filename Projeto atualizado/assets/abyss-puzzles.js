// Abyss Puzzles System for Depth Gate
// Fully aligned with Depth Gate's canonical puzzle mechanics, textures, sounds and rewards (__pzBuild / __gsPuzzles)
// Enhanced: Highly visible (never hidden, radiant floor sigils, lighting, glowing accents) & challenging depth
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

    // 1.0 Círculo Rúnico Ancestral do Piso (180x180) - Evidencia a câmara do enigma
    mk("pz-sigil-floor", 180, 180, (g) => {
      const cx = 90, cy = 90;
      // Brilho exterior suave
      const radG = g.createRadialGradient(cx, cy, 20, cx, cy, 88);
      radG.addColorStop(0, "rgba(0, 229, 255, 0.22)");
      radG.addColorStop(0.5, "rgba(255, 210, 74, 0.12)");
      radG.addColorStop(1, "rgba(0, 0, 0, 0)");
      g.fillStyle = radG;
      g.beginPath();
      g.arc(cx, cy, 88, 0, Math.PI * 2);
      g.fill();

      // Anel rúnico externo
      g.strokeStyle = "rgba(255, 210, 74, 0.65)";
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, cy, 78, 0, Math.PI * 2);
      g.stroke();

      g.strokeStyle = "rgba(0, 229, 255, 0.5)";
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(cx, cy, 70, 0, Math.PI * 2);
      g.stroke();

      // Estrela de 8 pontas entrelaçada
      g.strokeStyle = "rgba(255, 225, 120, 0.4)";
      g.lineWidth = 1;
      for (let pass = 0; pass < 2; pass++) {
        g.beginPath();
        const baseAngle = (pass * Math.PI) / 4;
        for (let i = 0; i < 4; i++) {
          const a = baseAngle + (i * Math.PI) / 2;
          const x = cx + Math.cos(a) * 64;
          const y = cy + Math.sin(a) * 64;
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.closePath();
        g.stroke();
      }

      // Anel rúnico interno
      g.strokeStyle = "rgba(255, 255, 255, 0.55)";
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(cx, cy, 38, 0, Math.PI * 2);
      g.stroke();

      // Glifos cardeais
      const glyphColors = ["#ffd24a", "#8ae0ff", "#ffd24a", "#8ae0ff"];
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        const gx = cx + Math.cos(a) * 52;
        const gy = cy + Math.sin(a) * 52;
        g.fillStyle = glyphColors[i];
        g.beginPath();
        g.arc(gx, gy, 3.5, 0, Math.PI * 2);
        g.fill();
      }
    });

    // 1.1 Bloco de Pedra Pesada Deslizante (Padrão e Temáticos Sol / Lua) (32x40)
    const drawStoneBlock = (key, accentColor, runeType) => {
      mk(key, 32, 40, (g) => {
        g.fillStyle = "rgba(0,0,0,.45)";
        g.beginPath();
        g.ellipse(16, 37, 15, 3.5, 0, 0, 7);
        g.fill();

        g.fillStyle = grad(g, 0, 12, 0, 38, [[0, "#eceff4"], [0.5, "#b0b8c4"], [1, "#5f6978"]]);
        g.beginPath();
        g.moveTo(2, 14);
        g.lineTo(30, 14);
        g.lineTo(30, 36);
        g.lineTo(28, 38);
        g.lineTo(4, 38);
        g.lineTo(2, 36);
        g.closePath();
        g.fill();

        g.fillStyle = grad(g, 0, 3, 0, 15, [[0, "#ffffff"], [1, "#d8dee9"]]);
        g.beginPath();
        g.moveTo(2, 14);
        g.lineTo(6, 5);
        g.lineTo(9, 4);
        g.lineTo(27, 4);
        g.lineTo(30, 6);
        g.lineTo(30, 14);
        g.closePath();
        g.fill();

        // Linhas de entalhe em pedra
        g.strokeStyle = "rgba(46, 52, 64, 0.7)";
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

        // Glifo frontal em relevo brilhante
        g.fillStyle = accentColor;
        g.strokeStyle = "#ffffff";
        g.lineWidth = 1.2;
        if (runeType === "sun") {
          g.beginPath();
          g.arc(16, 20, 4, 0, Math.PI * 2);
          g.fill();
          g.stroke();
        } else if (runeType === "moon") {
          g.beginPath();
          g.arc(16, 20, 4.5, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = "#b0b8c4";
          g.beginPath();
          g.arc(18, 19, 3.8, 0, Math.PI * 2);
          g.fill();
        } else {
          g.beginPath();
          g.arc(16, 9, 3.2, 0, 6.3);
          g.stroke();
        }
      });
    };

    drawStoneBlock("pz-stone", "#ffd24a", "generic");
    drawStoneBlock("pz-stone-sun", "#ffd24a", "sun");
    drawStoneBlock("pz-stone-moon", "#8ae0ff", "moon");

    // 1.2 Pilar Obstáculo de Labirinto / Coluna de Pedra (26x42)
    mk("pz-pillar-block", 26, 42, (g) => {
      g.fillStyle = "rgba(0,0,0,.45)";
      g.beginPath();
      g.ellipse(13, 39, 12, 3.5, 0, 0, 7);
      g.fill();

      g.fillStyle = grad(g, 0, 8, 0, 40, [[0, "#8892a0"], [0.5, "#485260"], [1, "#28303a"]]);
      g.fillRect(4, 10, 18, 29);

      g.fillStyle = grad(g, 0, 2, 0, 10, [[0, "#d0d8e4"], [1, "#8892a0"]]);
      g.fillRect(2, 6, 22, 6);

      g.strokeStyle = "#ffd24a";
      g.lineWidth = 1.2;
      g.strokeRect(6, 14, 14, 22);

      g.fillStyle = "#ffd24a";
      g.beginPath();
      g.arc(13, 25, 3, 0, Math.PI * 2);
      g.fill();
    });

    // 1.3 Placa de Pressão Rúnica (Desativada / Ativada) (34x24)
    const drawPressurePlate = (key, on, runeColor, runeType) => {
      mk(key, 34, 24, (g) => {
        g.fillStyle = "rgba(10,20,40,.45)";
        g.beginPath();
        g.ellipse(17, 14, 16, 8, 0, 0, 7);
        g.fill();

        g.fillStyle = grad(g, 0, 2, 0, 20, [[0, on ? "#5f6e82" : "#9aa6b4"], [1, on ? "#283240" : "#4c5868"]]);
        g.beginPath();
        g.ellipse(17, 11, 15, 7.5, 0, 0, 7);
        g.fill();

        g.fillStyle = on ? runeColor : "#2e3a48";
        g.beginPath();
        g.ellipse(17, 10, 10, 5, 0, 0, 7);
        g.fill();

        g.strokeStyle = on ? "#ffffff" : runeColor;
        g.lineWidth = on ? 1.8 : 1.2;
        g.beginPath();
        if (runeType === "sun") {
          g.arc(17, 10, 4, 0, Math.PI * 2);
        } else if (runeType === "moon") {
          g.arc(17, 10, 4.5, 0.5, 5.8);
        } else {
          g.moveTo(11, 10);
          g.lineTo(17, 6);
          g.lineTo(23, 10);
          g.lineTo(17, 14);
          g.closePath();
        }
        g.stroke();
      });
    };

    drawPressurePlate("pz-plate", 0, "#ffd24a", "generic");
    drawPressurePlate("pz-plate-on", 1, "#ffd24a", "generic");
    drawPressurePlate("pz-plate-sun", 0, "#ffd24a", "sun");
    drawPressurePlate("pz-plate-sun-on", 1, "#ffd24a", "sun");
    drawPressurePlate("pz-plate-moon", 0, "#8ae0ff", "moon");
    drawPressurePlate("pz-plate-moon-on", 1, "#8ae0ff", "moon");

    // 1.4 Altar / Pilar de Recomeçar (26x34)
    mk("pz-reset", 26, 34, (g) => {
      g.fillStyle = "rgba(10,20,40,.45)";
      g.beginPath();
      g.ellipse(13, 31, 12, 3.5, 0, 0, 7);
      g.fill();

      g.fillStyle = grad(g, 0, 2, 0, 30, [[0, "#d8dee9"], [0.5, "#8892a0"], [1, "#434c5e"]]);
      g.beginPath();
      g.moveTo(4, 30);
      g.lineTo(3, 10);
      g.quadraticCurveTo(13, 0, 23, 10);
      g.lineTo(22, 30);
      g.closePath();
      g.fill();

      g.strokeStyle = "#8ae0ff";
      g.lineWidth = 1.8;
      g.beginPath();
      g.arc(13, 16, 6, 0.4, 5.7);
      g.stroke();

      g.beginPath();
      g.moveTo(17, 11);
      g.lineTo(19, 15);
      g.lineTo(14, 15);
      g.stroke();
    });

    // 1.5 Prismas de Cristal Angulares Giratórios (4 Direções: 0°, 90°, 180°, 270°) (34x48)
    for (let d = 0; d < 4; d++) {
      mk("pz-prism-" + d, 34, 48, (g) => {
        g.fillStyle = "rgba(10,20,40,.45)";
        g.beginPath();
        g.ellipse(17, 44, 14, 3.8, 0, 0, 7);
        g.fill();

        // Pedestal de suporte
        g.fillStyle = grad(g, 0, 32, 0, 44, [[0, "#8d97a6"], [1, "#434c5e"]]);
        g.fillRect(8, 34, 18, 10);
        g.fillStyle = "#4c5664";
        g.fillRect(15, 24, 4, 11);

        // Cristal reluzente girado
        g.save();
        g.translate(17, 18);
        g.rotate((d * Math.PI) / 2);

        // Faceta do cristal
        g.fillStyle = grad(g, -12, 0, 12, 0, [
          [0, "rgba(216, 246, 255, 0.95)"],
          [0.45, "rgba(143, 212, 244, 0.95)"],
          [0.55, "rgba(255, 255, 255, 1)"],
          [1, "rgba(90, 168, 216, 0.9)"]
        ]);
        g.beginPath();
        g.moveTo(-13, -7);
        g.lineTo(13, -7);
        g.lineTo(10, 7);
        g.lineTo(-10, 7);
        g.closePath();
        g.fill();

        g.strokeStyle = "#2e6c96";
        g.lineWidth = 1.2;
        g.stroke();

        // Indicador de seta de deflexão
        g.fillStyle = "#ffffff";
        g.beginPath();
        g.moveTo(0, -5);
        g.lineTo(6, 2);
        g.lineTo(-6, 2);
        g.closePath();
        g.fill();

        g.restore();
      });
    }

    // Compatibilidade com espelhos antigos a/b
    mk("pz-mirror-a", 34, 48, (g) => {
      const tex = textures.get("pz-prism-0")?.getSourceImage();
      if (tex) g.drawImage(tex, 0, 0);
    });
    mk("pz-mirror-b", 34, 48, (g) => {
      const tex = textures.get("pz-prism-1")?.getSourceImage();
      if (tex) g.drawImage(tex, 0, 0);
    });

    // 1.6 Lápide de Dica / Enigma Antigo (28x34)
    mk("pz-plaque", 28, 34, (g) => {
      g.fillStyle = "rgba(10,20,40,.45)";
      g.beginPath();
      g.ellipse(14, 31, 12, 3.5, 0, 0, 7);
      g.fill();

      g.fillStyle = grad(g, 0, 0, 0, 32, [[0, "#d8dee9"], [0.5, "#9aa6b4"], [1, "#4c5664"]]);
      g.beginPath();
      g.moveTo(3, 31);
      g.lineTo(3, 8);
      g.quadraticCurveTo(14, -3, 25, 8);
      g.lineTo(25, 31);
      g.closePath();
      g.fill();

      g.strokeStyle = "#ffd24a";
      g.lineWidth = 1.2;
      g.stroke();

      g.fillStyle = "#f4fbff";
      g.fillRect(6, 6, 16, 3);
      g.fillStyle = "#4a5462";
      for (let y = 13; y < 28; y += 4) g.fillRect(7, y, 14, 1.8);
    });

    // 1.7 Braseiro Cerimonial de Fogo (28x30)
    mk("pz-brazier", 28, 30, (g) => {
      g.fillStyle = "rgba(10,20,40,.45)";
      g.beginPath();
      g.ellipse(14, 27, 12, 3.5, 0, 0, 7);
      g.fill();

      g.fillStyle = "#3a3f48";
      g.fillRect(6, 15, 3, 12);
      g.fillRect(19, 15, 3, 12);
      g.fillRect(13, 16, 2, 11);

      g.fillStyle = grad(g, 0, 6, 0, 18, [[0, "#8892a0"], [1, "#28303a"]]);
      g.beginPath();
      g.moveTo(2, 9);
      g.lineTo(26, 9);
      g.lineTo(21, 18);
      g.lineTo(7, 18);
      g.closePath();
      g.fill();

      g.fillStyle = "#181c24";
      g.beginPath();
      g.ellipse(14, 9, 12, 3.5, 0, 0, 7);
      g.fill();
    });

    // 1.8 Pedestal de Cristal / Foco (24x36)
    mk("pz-post", 24, 36, (g) => {
      const q = g.createLinearGradient(3, 0, 21, 0);
      q.addColorStop(0, "#5a6472");
      q.addColorStop(0.45, "#e5e9f0");
      q.addColorStop(1, "#434c5e");
      g.fillStyle = "rgba(0,0,0,.45)";
      g.beginPath();
      g.ellipse(12, 33, 11, 3.5, 0, 0, 7);
      g.fill();
      g.fillStyle = q;
      g.fillRect(5, 7, 14, 26);
      g.fillStyle = "#eceff4";
      g.beginPath();
      g.moveTo(4, 8);
      g.lineTo(12, 1);
      g.lineTo(20, 8);
      g.closePath();
      g.fill();
      g.fillStyle = "rgba(0,0,0,.35)";
      g.fillRect(5, 30, 14, 3);
    });

    // 1.9 Orbe Radiante de Energia (22x22)
    mk("pz-orb", 22, 22, (g) => {
      const q = g.createRadialGradient(9, 8, 1, 11, 11, 10);
      q.addColorStop(0, "#ffffff");
      q.addColorStop(0.4, "#ffd98a");
      q.addColorStop(0.8, "#ff9900");
      q.addColorStop(1, "rgba(255,140,0,0)");
      g.fillStyle = q;
      g.beginPath();
      g.arc(11, 11, 10, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#ffffff";
      g.beginPath();
      g.arc(11, 11, 5, 0, Math.PI * 2);
      g.fill();
    });

    // 1.10 Glifos Celestiais (0: Sol, 1: Lua, 2: Estrela, 3: Triângulo, 4: Losango, 5: Olho)
    for (let k = 0; k < 6; k++) {
      mk("pz-glyph-" + k, 18, 18, (g) => {
        g.fillStyle = "#ffffff";
        g.strokeStyle = "#ffffff";
        g.lineWidth = 1.8;
        g.beginPath();
        if (k === 0) {
          // Sol
          g.arc(9, 9, 3.8, 0, 7);
          g.fill();
          for (let a = 0; a < 8; a++) {
            const q = (a * Math.PI) / 4;
            g.moveTo(9 + Math.cos(q) * 5.2, 9 + Math.sin(q) * 5.2);
            g.lineTo(9 + Math.cos(q) * 8.2, 9 + Math.sin(q) * 8.2);
          }
          g.stroke();
        } else if (k === 1) {
          // Lua
          g.arc(9, 9, 6.8, 0, 7);
          g.fill();
          g.globalCompositeOperation = "destination-out";
          g.beginPath();
          g.arc(12.5, 7, 6.2, 0, 7);
          g.fill();
          g.globalCompositeOperation = "source-over";
        } else if (k === 2) {
          // Estrela
          for (let a = 0; a < 10; a++) {
            const q = -Math.PI / 2 + (a * Math.PI) / 5;
            const r = a % 2 ? 3.5 : 8;
            a ? g.lineTo(9 + Math.cos(q) * r, 9 + Math.sin(q) * r) : g.moveTo(9 + Math.cos(q) * r, 9 + Math.sin(q) * r);
          }
          g.closePath();
          g.fill();
        } else if (k === 3) {
          // Triângulo
          g.moveTo(9, 1.5);
          g.lineTo(16, 16);
          g.lineTo(2, 16);
          g.closePath();
          g.fill();
        } else if (k === 4) {
          // Losango
          g.moveTo(9, 1);
          g.lineTo(16, 9);
          g.lineTo(9, 17);
          g.lineTo(2, 9);
          g.closePath();
          g.fill();
        } else {
          // Olho do Abismo
          g.moveTo(1.5, 9);
          g.quadraticCurveTo(9, 1.5, 16.5, 9);
          g.quadraticCurveTo(9, 16.5, 1.5, 9);
          g.closePath();
          g.fill();
          g.globalCompositeOperation = "destination-out";
          g.beginPath();
          g.arc(9, 9, 3, 0, 7);
          g.fill();
          g.globalCompositeOperation = "source-over";
        }
      });
    }

    // 1.11 Alavancas Mecânicas
    if (!textures.exists("cx-lever-off")) {
      const mkLev = (k, on) => {
        mk(k, 22, 28, (g) => {
          g.fillStyle = "rgba(0,0,0,.45)";
          g.fillRect(3, 23, 16, 3);
          g.fillStyle = "#3a3630";
          g.fillRect(3, 17, 16, 9);
          g.fillStyle = "#5a544a";
          g.fillRect(4, 18, 14, 3);
          g.fillStyle = "#2a2620";
          g.fillRect(9, 15, 4, 3);
          g.strokeStyle = "#8a7a5a";
          g.lineWidth = 2.2;
          g.beginPath();
          g.moveTo(11, 16);
          g.lineTo(on ? 18 : 4, 4);
          g.stroke();
          g.fillStyle = on ? "#00e5ff" : "#ffd24a";
          g.fillRect(on ? 16 : 2, 2, 5, 5);
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
      gain.gain.linearRampToValueAtTime(0.32, t0 + 0.015);
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

  function setInteractLabel(obj, fn) {
    Object.defineProperty(obj, "interactLabel", { get: fn, configurable: true });
  }

  // --- 3. ABYSS PUZZLE MANAGER (CANÔNICO, VISÍVEL & DESAFIADOR) ---
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

    update(dt) {
      // Método seguro de atualização frame a frame
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
        x: px - 150,
        y: py - 120,
        width: 300,
        height: 240
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

    // Cria o Círculo Rúnico no piso e a iluminação mágica: O puzzle JAMAIS fica escondido!
    spawnSigilFloor(cx, cy) {
      const S = this.scene;
      // 1. Selo Rúnico no Chão
      const floorSigil = S.add.image(cx, cy, "pz-sigil-floor").setDepth(cy - 120).setAlpha(0);
      S.tweens.add({
        targets: floorSigil,
        alpha: 0.9,
        duration: 600,
        ease: "Sine.easeOut"
      });
      // Leve rotação pulsante contínua
      S.tweens.add({
        targets: floorSigil,
        angle: 360,
        duration: 38000,
        repeat: -1,
        ease: "Linear"
      });
      this.registerObject(floorSigil, false);

      // 2. Luz aconchegante central
      try {
        const glow = S.add.image(cx, cy, "light").setScale(0.95).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffd24a).setAlpha(0.25).setDepth(cy - 110);
        S.tweens.add({
          targets: glow,
          alpha: 0.42,
          scale: 1.1,
          duration: 1600,
          yoyo: true,
          repeat: -1
        });
        this.registerObject(glow, false);
      } catch (_) {}

      // 3. Efeito de choque místico de revelação
      S.effectsRef?.shockwaveRing?.(cx, cy, 42);
      S.effectsRef?.burstTinted?.(cx, cy, 0x00e5ff, 20);
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

    spawnRewardChest(x, y, onSolve) {
      const scene = this.scene;
      const key = "chest-epic";
      let spawnX = x;
      let spawnY = y;
      if (scene?.player && Phaser.Math.Distance.Between(scene.player.x, scene.player.y, spawnX, spawnY) < 26) {
        spawnY -= 30;
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

      setInteractLabel(chest, () => (!chest.opened ? "Abrir Baú do Enigma (Relíquia Ancestral)" : null));

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
    // 1. ENIGMA DESAFIADOR: MONÓLITOS GÊMEOS & LABIRINTO DE SOKOBAN (blocks)
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

      this.spawnSigilFloor(cx, cy);

      // Pilares de labirinto / obstáculos para manobra tipo Sokoban
      const obstacles = [
        { x: cx, y: cy + 10 },
        { x: cx - 44, y: cy - 24 },
        { x: cx + 44, y: cy + 44 }
      ];
      for (const obs of obstacles) {
        const pillar = S.add.image(obs.x, obs.y, "pz-pillar-block").setOrigin(0.5, 0.85).setDepth(obs.y);
        this.registerObject(pillar, false);
      }

      // 2 Placas de Pressão Específicas: Selo Solar (Dourado) e Selo Lunar (Azul Celeste)
      const plateSunX = cx + 64, plateSunY = cy - 26;
      const plateSun = S.add.image(plateSunX, plateSunY, "pz-plate-sun").setDepth(plateSunY - 10);
      this.registerObject(plateSun, false);

      const plateMoonX = cx - 64, plateMoonY = cy + 42;
      const plateMoon = S.add.image(plateMoonX, plateMoonY, "pz-plate-moon").setDepth(plateMoonY - 10);
      this.registerObject(plateMoon, false);

      // 2 Monólitos: Monólito Solar e Monólito Lunar
      const startSunX = cx - 44, startSunY = cy + 18;
      const stoneSun = S.add.image(startSunX, startSunY, "pz-stone-sun").setOrigin(0.5, 0.85).setDepth(startSunY);
      S.physics.add.existing(stoneSun, false);
      stoneSun.body.setSize(24, 18);
      stoneSun.body.setOffset(4, 18);
      stoneSun.body.setImmovable(true);

      const startMoonX = cx + 44, startMoonY = cy - 18;
      const stoneMoon = S.add.image(startMoonX, startMoonY, "pz-stone-moon").setOrigin(0.5, 0.85).setDepth(startMoonY);
      S.physics.add.existing(stoneMoon, false);
      stoneMoon.body.setSize(24, 18);
      stoneMoon.body.setOffset(4, 18);
      stoneMoon.body.setImmovable(true);

      let sunActivated = false;
      let moonActivated = false;

      const checkBothActivated = () => {
        sunActivated = Phaser.Math.Distance.Between(stoneSun.x, stoneSun.y, plateSunX, plateSunY) < 24;
        moonActivated = Phaser.Math.Distance.Between(stoneMoon.x, stoneMoon.y, plateMoonX, plateMoonY) < 24;

        plateSun.setTexture(sunActivated ? "pz-plate-sun-on" : "pz-plate-sun");
        plateMoon.setTexture(moonActivated ? "pz-plate-moon-on" : "pz-plate-moon");

        if (sunActivated && moonActivated && !this.isSolved) {
          S.effectsRef?.burstTinted?.(plateSunX, plateSunY, 0xffd24a, 24);
          S.effectsRef?.burstTinted?.(plateMoonX, plateMoonY, 0x00e5ff, 24);
          this.triggerSolve("Os Monólitos Gêmeos do Zênite", cx, cy - 26, onSolve);
        }
      };

      const pushStone = (stone, dirX, dirY, isSun) => {
        if (this.isSolved || stone.sliding) return;
        stone.sliding = true;
        S.game?.audioEngine?.sfx?.("sfx-door-open");

        const targetX = Phaser.Math.Clamp(stone.x + dirX * 36, bounds.x + 28, bounds.x + bounds.width - 28);
        const targetY = Phaser.Math.Clamp(stone.y + dirY * 36, bounds.y + 28, bounds.y + bounds.height - 28);

        // Evita colisão direta com outro bloco ou pilar
        const otherStone = isSun ? stoneMoon : stoneSun;
        if (Phaser.Math.Distance.Between(targetX, targetY, otherStone.x, otherStone.y) < 28) {
          stone.sliding = false;
          return;
        }
        for (const obs of obstacles) {
          if (Phaser.Math.Distance.Between(targetX, targetY, obs.x, obs.y) < 26) {
            stone.sliding = false;
            return;
          }
        }

        S.tweens.add({
          targets: stone,
          x: targetX,
          y: targetY,
          duration: 260,
          ease: "Sine.easeOut",
          onUpdate: () => {
            stone.setDepth(stone.y);
            if (stone.body) stone.body.updateFromGameObject?.();
            checkBothActivated();
          },
          onComplete: () => {
            stone.sliding = false;
            checkBothActivated();
          }
        });
      };

      setInteractLabel(stoneSun, () => (this.isSolved ? null : "Empurrar Monólito Solar (ao Selo Dourado)"));
      stoneSun.interact = () => {
        if (this.isSolved || stoneSun.sliding) return;
        const dx = plateSunX - stoneSun.x;
        const dy = plateSunY - stoneSun.y;
        const pushX = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0;
        const pushY = pushX === 0 ? Math.sign(dy) : 0;
        pushStone(stoneSun, pushX || 1, pushY, true);
      };
      this.registerObject(stoneSun, true);

      setInteractLabel(stoneMoon, () => (this.isSolved ? null : "Empurrar Monólito Lunar (ao Selo Azul)"));
      stoneMoon.interact = () => {
        if (this.isSolved || stoneMoon.sliding) return;
        const dx = plateMoonX - stoneMoon.x;
        const dy = plateMoonY - stoneMoon.y;
        const pushX = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0;
        const pushY = pushX === 0 ? Math.sign(dy) : 0;
        pushStone(stoneMoon, pushX || -1, pushY, false);
      };
      this.registerObject(stoneMoon, true);

      // Altar de Reset
      const resetAltar = S.add.image(cx, cy - 54, "pz-reset").setOrigin(0.5, 0.85).setDepth(cy - 54);
      setInteractLabel(resetAltar, () => (this.isSolved ? null : "Reiniciar Posição dos Monólitos"));
      resetAltar.interact = () => {
        if (this.isSolved || stoneSun.sliding || stoneMoon.sliding) return;
        stoneSun.setPosition(startSunX, startSunY).setDepth(startSunY);
        stoneMoon.setPosition(startMoonX, startMoonY).setDepth(startMoonY);
        S.effectsRef?.burstTinted?.(startSunX, startSunY, 0xffd24a, 12);
        S.effectsRef?.burstTinted?.(startMoonX, startMoonY, 0x00e5ff, 12);
        S.game?.audioEngine?.sfx?.("sfx-door-open");
        checkBothActivated();
      };
      this.registerObject(resetAltar, true);

      // Empurrar por contato contínuo
      let pushTimer = 0;
      this.updateHandler = () => {
        if (this.isSolved || !S.player) return;
        const p = S.player;
        const dSun = Phaser.Math.Distance.Between(p.x, p.y, stoneSun.x, stoneSun.y);
        const dMoon = Phaser.Math.Distance.Between(p.x, p.y, stoneMoon.x, stoneMoon.y);

        if (dSun < 34 && !stoneSun.sliding) {
          pushTimer++;
          if (pushTimer > 8) {
            pushTimer = 0;
            const dx = stoneSun.x - p.x;
            const dy = stoneSun.y - p.y;
            const pushX = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0;
            const pushY = pushX === 0 ? Math.sign(dy) : 0;
            if (pushX !== 0 || pushY !== 0) pushStone(stoneSun, pushX, pushY, true);
          }
        } else if (dMoon < 34 && !stoneMoon.sliding) {
          pushTimer++;
          if (pushTimer > 8) {
            pushTimer = 0;
            const dx = stoneMoon.x - p.x;
            const dy = stoneMoon.y - p.y;
            const pushX = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) : 0;
            const pushY = pushX === 0 ? Math.sign(dy) : 0;
            if (pushX !== 0 || pushY !== 0) pushStone(stoneMoon, pushX, pushY, false);
          }
        } else {
          pushTimer = 0;
        }
      };

      S.events.on("update", this.updateHandler);
      S.game?.events?.emit("ui:banner", "✦ Enigma: Posicione o Monólito Solar no Selo Dourado e o Lunar no Azul!", "#ffd24a");
    }

    // =========================================================================
    // 2. ENIGMA DESAFIADOR: 4 PRISMAS DE CRISTAL EM CIRCUITO (mirror)
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

      this.spawnSigilFloor(cx, cy);

      // Obelisco central de bloqueio (impede o raio de atravessar em linha reta)
      const centerBlock = S.add.image(cx, cy, "pz-pillar-block").setOrigin(0.5, 0.85).setDepth(cy);
      this.registerObject(centerBlock, false);

      // Emissor de Foco Solar (Oeste)
      const emitterX = cx - 84;
      const emitterY = cy - 28;
      const emitterPost = S.add.image(emitterX, emitterY + 6, "pz-post").setDepth(emitterY);
      const emitterOrb = S.add.image(emitterX, emitterY - 8, "pz-orb").setDepth(emitterY + 1);
      this.registerObject(emitterPost, false);
      this.registerObject(emitterOrb, false);

      // Receptor de Energia Alvo (Leste)
      const targetX = cx + 84;
      const targetY = cy + 28;
      const targetPost = S.add.image(targetX, targetY + 6, "pz-post").setDepth(targetY);
      const targetOrb = S.add.image(targetX, targetY - 8, "pz-orb").setDepth(targetY + 1).setTint(0x666666);
      this.registerObject(targetPost, false);
      this.registerObject(targetOrb, false);

      // 4 Prismas de Cristal em geometria de diamante (circuito de 4 refrações):
      // P0: Noroeste (cx - 40, cy - 28) - Precisa refletir para P1 (cx, cy - 54)
      // P1: Norte (cx, cy - 54) - Precisa refletir para P2 (cx + 40, cy - 28)
      // P2: Nordeste (cx + 40, cy - 28) - Precisa refletir para P3 (cx + 40, cy + 28)
      // P3: Sudeste (cx + 40, cy + 28) - Reflete para o Receptor!
      const prismPositions = [
        { x: cx - 40, y: cy - 28, solvedAngle: 1, name: "Prisma Noroeste" },
        { x: cx, y: cy - 52, solvedAngle: 2, name: "Prisma do Zênite" },
        { x: cx + 42, y: cy - 28, solvedAngle: 3, name: "Prisma Nordeste" },
        { x: cx + 42, y: cy + 28, solvedAngle: 0, name: "Prisma Sudeste" }
      ];

      const prisms = prismPositions.map((p, idx) => {
        let angleState = (p.solvedAngle + 1 + idx) % 4; // Começa desalinhado
        const prism = S.add.image(p.x, p.y, "pz-prism-" + angleState).setDepth(p.y);
        setInteractLabel(prism, () => (this.isSolved ? null : `Girar ${p.name}`));

        prism.interact = () => {
          if (this.isSolved) return;
          angleState = (angleState + 1) % 4;
          prism.setTexture("pz-prism-" + angleState);
          S.game?.audioEngine?.sfx?.("sfx-lever");
          S.effectsRef?.burstTinted?.(p.x, p.y - 8, 0x00e5ff, 12);
          updateLaserRay();
        };

        this.registerObject(prism, true);
        return {
          getAngle: () => angleState,
          pos: p
        };
      });

      this.laserGraphics = S.add.graphics().setDepth(cy + 60);

      const updateLaserRay = () => {
        if (!this.laserGraphics) return;
        this.laserGraphics.clear();

        this.laserGraphics.lineStyle(3.5, 0xffea75, 0.9);

        const a0 = prisms[0].getAngle() === prismPositions[0].solvedAngle;
        const a1 = prisms[1].getAngle() === prismPositions[1].solvedAngle;
        const a2 = prisms[2].getAngle() === prismPositions[2].solvedAngle;
        const a3 = prisms[3].getAngle() === prismPositions[3].solvedAngle;

        this.laserGraphics.beginPath();
        this.laserGraphics.moveTo(emitterX, emitterY - 8);
        this.laserGraphics.lineTo(prismPositions[0].x, prismPositions[0].y);

        if (a0) {
          this.laserGraphics.lineTo(prismPositions[1].x, prismPositions[1].y);
          if (a1) {
            this.laserGraphics.lineTo(prismPositions[2].x, prismPositions[2].y);
            if (a2) {
              this.laserGraphics.lineTo(prismPositions[3].x, prismPositions[3].y);
              if (a3) {
                // Alinhamento completo em 4 refrações!
                this.laserGraphics.lineTo(targetX, targetY - 8);
                this.laserGraphics.strokePath();

                targetOrb.clearTint();
                S.effectsRef?.burstTinted?.(targetX, targetY - 8, 0xffd24a, 26);
                S.effectsRef?.shockwaveRing?.(targetX, targetY - 8, 30);
                this.triggerSolve("O Foco Cristalino dos Quatro Prismas", cx, cy - 24, onSolve);
                return;
              }
            }
          }
        }
        this.laserGraphics.strokePath();
      };

      updateLaserRay();
      S.game?.events?.emit("ui:banner", "✦ Enigma: Ajuste os 4 Prismas de Cristal para Conduzir a Luz ao Receptor!", "#ffd24a");
    }

    // =========================================================================
    // 3. ENIGMA DESAFIADOR: AS QUATRO ALAVANCAS E A CHARADA DA LÁPIDE (levers)
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

      this.spawnSigilFloor(cx, cy);

      // 4 Alavancas: 0: Sol, 1: Lua, 2: Estrela, 3: Olho do Abismo
      // Charada: "O Olho vigia a noite primordial. A Estrela guia os navegantes. A Lua declina na aurora. E o Sol ergue-se coroando o dia."
      // Ordem Ancestral: Olho (3) -> Estrela (2) -> Lua (1) -> Sol (0)
      const leverCount = 4;
      const correctOrder = [3, 2, 1, 0];
      let currentStep = [];

      // Lápide com a charada poética
      const plaqueX = cx;
      const plaqueY = cy - 44;
      const plaque = S.add.image(plaqueX, plaqueY, "pz-plaque").setOrigin(0.5, 1).setDepth(plaqueY);
      setInteractLabel(plaque, () => "Ler a Charada Ancestral dos Signos");
      plaque.interact = () => {
        S.effectsRef?.floatText?.(plaqueX, plaqueY - 30, "« Olho ➔ Estrela ➔ Lua ➔ Sol »", "#ffd24a", 11);
        S.game?.events?.emit("ui:banner", "Charada: 1º Olho Primordial ➔ 2º Estrela ➔ 3º Lua ➔ 4º Sol", "#ffd24a");
      };
      this.registerObject(plaque, true);

      const levers = [];
      for (let i = 0; i < leverCount; i++) {
        const lx = cx - 60 + i * 40;
        const ly = cy + 28;

        const lev = S.add.image(lx, ly, "cx-lever-off").setOrigin(0.5, 0.75).setDepth(ly);
        const glyphId = i === 3 ? 5 : i; // 0: Sol, 1: Lua, 2: Estrela, 5: Olho
        const glyphImg = S.add.image(lx, ly - 26, "pz-glyph-" + glyphId).setDepth(ly + 1).setTint(0xffd24a);

        this.registerObject(lev, true);
        this.registerObject(glyphImg, false);

        setInteractLabel(lev, () => (this.isSolved || currentStep.includes(i) ? null : `Puxar Alavanca (${GLYPH_NAMES[glyphId][0]})`));

        lev.interact = () => {
          if (this.isSolved || currentStep.includes(i)) return;
          currentStep.push(i);
          lev.setTexture("cx-lever-on");
          S.game?.audioEngine?.sfx?.("sfx-lever");
          S.effectsRef?.burstTinted?.(lx, ly - 8, 0xffd24a, 12);

          const ok = currentStep.every((val, idx) => val === correctOrder[idx]);
          if (!ok) {
            // Errou: penalidade e reset das alavancas
            S.time.delayedCall(450, () => {
              S.game?.audioEngine?.sfx?.("sfx-event-refuse");
              S.cameraSys?.shake?.(0.005, 180);
              S.effectsRef?.floatText?.(cx, cy - 20, "Ordem Incorreta! (Olho ➔ Estrela ➔ Lua ➔ Sol)", "#e08a7a");
              currentStep = [];
              levers.forEach((l) => l.setTexture("cx-lever-off"));
            });
          } else if (currentStep.length === leverCount) {
            // Acertou as 4 alavancas na ordem exata!
            this.triggerSolve("O Selo das Quatro Eras", cx, cy - 18, onSolve);
          }
        };

        levers.push(lev);
      }

      S.game?.events?.emit("ui:banner", "✦ Enigma: Decifre a Charada na Lápide e Puxe as 4 Alavancas na Ordem!", "#ffd24a");
    }

    // =========================================================================
    // 4. ENIGMA DESAFIADOR: BRASEIROS DO PENTAGRAMA SAGRADO (braziers)
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

      this.spawnSigilFloor(cx, cy);

      // 5 Braseiros dispostos em geometria de pentagrama amplo
      const offsets = [
        [0, -48],       // Topo
        [48, -14],      // Nordeste
        [30, 42],       // Sudeste
        [-30, 42],      // Sudoeste
        [-48, -14]      // Noroeste
      ];

      // Tempo de queima dinâmico e veloz: 5.5s exige rota ágil com dash/corrida
      const BURN_TIME = 5.5;
      const braziers = [];

      offsets.forEach(([ox, oy], idx) => {
        const bx = cx + ox;
        const by = cy + oy;

        const img = S.add.image(bx, by, "pz-brazier").setOrigin(0.5, 1).setDepth(by);
        const flame = S.add.sprite(bx, by - 16, "torch-flame", 0).setOrigin(0.5, 1).setScale(1.2).setDepth(by + 1).setVisible(false);
        if (S.anims.exists("torch-flame-burn")) flame.play("torch-flame-burn");

        const data = { img, flame, timeLeft: 0, index: idx };

        setInteractLabel(img, () => (this.isSolved || data.timeLeft > 0 ? null : "Acender Braseiro Sagrado"));

        img.interact = () => {
          if (this.isSolved || data.timeLeft > 0) return;
          data.timeLeft = BURN_TIME;
          flame.setVisible(true);
          S.game?.audioEngine?.sfx?.("sfx-mage-fireball");
          S.effectsRef?.burstTinted?.(bx, by - 16, 0xff7722, 16);

          if (braziers.every((b) => b.timeLeft > 0)) {
            this.triggerSolve("O Fogo Sagrado do Pentagrama", cx, cy - 22, onSolve);
          }
        };

        this.registerObject(img, true);
        this.registerObject(flame, false);
        braziers.push(data);
      });

      this.updateHandler = (time, delta) => {
        if (this.isSolved || S.uiOpen || S.time?.paused) return;
        const dt = delta / 1000;
        for (const b of braziers) {
          if (b.timeLeft > 0) {
            b.timeLeft -= dt;
            if (b.timeLeft <= 1.8 && b.timeLeft > 0) {
              // Avisa visualmente que a chama está enfraquecendo
              b.flame.setAlpha(0.6 + Math.sin(time * 0.02) * 0.4);
            } else {
              b.flame.setAlpha(1);
            }
            if (b.timeLeft <= 0) {
              b.timeLeft = 0;
              b.flame.setVisible(false);
              S.effectsRef?.burstTinted?.(b.img.x, b.img.y - 16, 0x666666, 8);
            }
          }
        }
      };

      S.events.on("update", this.updateHandler);
      S.game?.events?.emit("ui:banner", "✦ Enigma: Acenda os 5 Braseiros em Menos de 5.5 Segundos!", "#ffd24a");
    }

    // =========================================================================
    // 5. ENIGMA DESAFIADOR: SINFONIA RÚNICA DE 2 FASES (runes)
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

      this.spawnSigilFloor(cx, cy);

      const runes = [
        { name: "Sol", glyph: 0, freq: 261.63, ox: -48, oy: -28, color: 0xffd24a },
        { name: "Lua", glyph: 1, freq: 329.63, ox: 48, oy: -28, color: 0x8ae0ff },
        { name: "Estrela", glyph: 2, freq: 392.0, ox: -48, oy: 28, color: 0xff88ff },
        { name: "Olho", glyph: 5, freq: 523.25, ox: 48, oy: 28, color: 0x88ffaa }
      ];

      // Duas fases progressivas de Simon Says
      const phase1 = [0, 2, 1, 3];          // 4 notas harmônicas
      const phase2 = [0, 2, 1, 3, 2, 0];    // 6 notas melódicas
      let currentPhase = 1;
      let sequence = phase1;
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
          playTone(S, r.freq, 0.42);
          S.effectsRef?.burstTinted?.(rx, ry, r.color, 12);
          const t = S.time.delayedCall(320, () => {
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
              if (currentPhase === 1) {
                // Passa para a Fase 2!
                currentPhase = 2;
                sequence = phase2;
                playerStep = 0;
                isPlayingSequence = true;
                S.effectsRef?.burstTinted?.(cx, cy, 0x00e5ff, 24);
                S.game?.events?.emit("ui:banner", "✦ Fase 1 Concluída! Ouça a Melodia Ancestral da Fase 2...", "#9ff0ff");
                const tNext = S.time.delayedCall(1400, playPattern);
                this.activeTimers.push(tNext);
              } else {
                // Completou as duas fases!
                this.triggerSolve("A Sinfonia Rúnica Celestial", cx, cy - 24, onSolve);
              }
            }
          } else {
            // Errou: reinicia passo e repete
            isPlayingSequence = true;
            S.time.delayedCall(400, () => {
              S.game?.audioEngine?.sfx?.("sfx-event-refuse");
              S.cameraSys?.shake?.(0.005, 180);
              S.effectsRef?.floatText?.(cx, cy - 20, "Dissonância Rúnica! Ouça Novamente...", "#e08a7a");
              playerStep = 0;
              const tRep = S.time.delayedCall(1000, playPattern);
              this.activeTimers.push(tRep);
            });
          }
        };

        return { flash, plate, glyph };
      });

      // Pedestal Central de Repetição
      const hintAltar = S.add.image(cx, cy - 46, "pz-reset").setOrigin(0.5, 0.85).setDepth(cy - 46);
      setInteractLabel(hintAltar, () => (this.isSolved ? null : "Ouvir Novamente a Melodia da Fase Atual"));
      hintAltar.interact = () => {
        if (this.isSolved || isPlayingSequence) return;
        playerStep = 0;
        playPattern();
      };
      this.registerObject(hintAltar, true);

      const playPattern = () => {
        if (this.isSolved || this.isDestroyed) return;
        isPlayingSequence = true;
        sequence.forEach((runeIdx, step) => {
          const t = S.time.delayedCall(step * 500 + 250, () => {
            if (this.isSolved || this.isDestroyed || !this.scene?.sys?.isActive?.()) return;
            runeObjects[runeIdx]?.flash();
            if (step === sequence.length - 1) {
              const tEnd = S.time.delayedCall(360, () => {
                isPlayingSequence = false;
              });
              this.activeTimers.push(tEnd);
            }
          });
          this.activeTimers.push(t);
        });
      };

      const startT = S.time.delayedCall(900, playPattern);
      this.activeTimers.push(startT);
      S.game?.events?.emit("ui:banner", "✦ Enigma: Memorize e Repita a Harmonia das Runas (2 Fases)!", "#ffd24a");
    }

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

  window.AbyssPuzzleManager = AbyssPuzzleManager;
})();
