// Abyss Puzzles & Nightmare Modifiers System for Endless Mode
// Fully aligned with Depth Gate's canonical pixel-art visual & interaction standards (__gsPuzzles)
(() => {
  // --- 1. PROCEDURAL PIXEL-ART TEXTURES GENERATOR ---
  function initPuzzleTextures(scene) {
    if (!scene || scene.textures.exists("ab-prism-base")) return;
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

    // 1.1 Base de Pedra Ornada do Prisma (32x32)
    mk("ab-prism-base", 32, 32, (ctx) => {
      // Sombra projetada
      ctx.fillStyle = "rgba(10, 8, 14, 0.4)";
      ctx.beginPath();
      ctx.ellipse(16, 26, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Pedestal de pedra chanfrada
      ctx.fillStyle = grad(ctx, 0, 6, 0, 26, [[0, "#3d3248"], [0.5, "#251d2f"], [1, "#140f1a"]]);
      ctx.beginPath();
      ctx.moveTo(8, 8);
      ctx.lineTo(24, 8);
      ctx.lineTo(28, 22);
      ctx.lineTo(4, 22);
      ctx.closePath();
      ctx.fill();

      // Borda de pedra entalhada
      ctx.strokeStyle = "rgba(180, 160, 210, 0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Topo dourado rúnico
      ctx.fillStyle = grad(ctx, 0, 8, 0, 16, [[0, "#ffd24a"], [1, "#946f20"]]);
      ctx.fillRect(9, 9, 14, 4);

      // Runa central mística
      ctx.fillStyle = "#ffe680";
      ctx.fillRect(15, 10, 2, 2);
    });

    // 1.2 Cristal de Luz Refletor (32x32)
    mk("ab-prism-crystal", 32, 32, (ctx) => {
      // Prisma de diamante lapidado
      ctx.fillStyle = grad(ctx, 16, 4, 16, 28, [
        [0, "#ffffff"],
        [0.2, "#80ffff"],
        [0.6, "#00b3cc"],
        [1, "#004d66"]
      ]);
      ctx.beginPath();
      ctx.moveTo(16, 4);
      ctx.lineTo(26, 14);
      ctx.lineTo(16, 26);
      ctx.lineTo(6, 14);
      ctx.closePath();
      ctx.fill();

      // Facetas de reflexão
      ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
      ctx.beginPath();
      ctx.moveTo(16, 4);
      ctx.lineTo(16, 26);
      ctx.lineTo(6, 14);
      ctx.closePath();
      ctx.fill();

      // Contorno de brilho prismático
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Centro brilhante
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(15, 13, 2, 2);
    });

    // 1.3 Emissor Solar / Foco Arcano (32x32)
    mk("ab-solar-emitter", 32, 32, (ctx) => {
      ctx.fillStyle = "rgba(20, 10, 5, 0.4)";
      ctx.beginPath();
      ctx.ellipse(16, 26, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Altar dourado
      ctx.fillStyle = grad(ctx, 0, 8, 0, 24, [[0, "#ffd24a"], [0.5, "#b3861b"], [1, "#593d05"]]);
      ctx.beginPath();
      ctx.arc(16, 16, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffe680";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Núcleo solar flamejante
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(16, 16, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // 1.4 Altar Solar Receptor (Apagado / Aceso - 36x36)
    for (const on of [0, 1]) {
      mk(on ? "ab-solar-altar-on" : "ab-solar-altar-off", 36, 36, (ctx) => {
        ctx.fillStyle = "rgba(10, 6, 14, 0.45)";
        ctx.beginPath();
        ctx.ellipse(18, 30, 16, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Círculo de pedra mágica
        ctx.fillStyle = grad(ctx, 0, 4, 0, 32, on ? [[0, "#2a3d24"], [1, "#121a10"]] : [[0, "#2c2536"], [1, "#15101a"]]);
        ctx.beginPath();
        ctx.arc(18, 18, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = on ? "#00ff88" : "#6f5b82";
        ctx.lineWidth = on ? 2 : 1.2;
        ctx.stroke();

        // Disco interno
        ctx.fillStyle = on ? "#00ff88" : "#3b3047";
        ctx.beginPath();
        ctx.arc(18, 18, on ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();

        if (on) {
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(18, 18, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // 1.5 Placas Rúnicas Elementais (Fogo, Gelo, Raio, Terra - 34x34)
    const runeDefs = [
      { key: "ab-rune-fire", color: "#ff4422", glyph: "🔥" },
      { key: "ab-rune-ice", color: "#33ccff", glyph: "❄️" },
      { key: "ab-rune-shock", color: "#ffd24a", glyph: "⚡" },
      { key: "ab-rune-earth", color: "#44dd66", glyph: "🌿" }
    ];

    for (const rDef of runeDefs) {
      for (const on of [0, 1]) {
        mk(`${rDef.key}${on ? "-on" : ""}`, 34, 34, (ctx) => {
          ctx.fillStyle = "rgba(8, 6, 12, 0.4)";
          ctx.beginPath();
          ctx.ellipse(17, 27, 15, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          // Placa de pedra com chanfro octogonal
          ctx.fillStyle = grad(ctx, 0, 4, 0, 28, on ? [[0, "#2e2230"], [1, "#171018"]] : [[0, "#221b26"], [1, "#120e15"]]);
          ctx.beginPath();
          ctx.arc(17, 16, 13, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = on ? rDef.color : "rgba(160, 140, 180, 0.4)";
          ctx.lineWidth = on ? 2.2 : 1;
          ctx.stroke();

          // Anel rúnico interno
          ctx.strokeStyle = on ? "#ffffff" : rDef.color;
          ctx.lineWidth = on ? 1.5 : 0.8;
          ctx.beginPath();
          ctx.arc(17, 16, 8, 0, Math.PI * 2);
          ctx.stroke();

          // Ponto de poder central
          ctx.fillStyle = on ? "#ffffff" : rDef.color;
          ctx.beginPath();
          ctx.arc(17, 16, on ? 4 : 2.5, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
  }

  class AbyssPuzzleManager {
    constructor(gameScene) {
      this.scene = gameScene;
      this.activePuzzle = null;
      this.solved = !1;
      this.puzzleG = null;
      this.sprites = [];
      initPuzzleTextures(gameScene);
    }

    shouldSpawnAbyssPortal(depth) {
      if (this.scene.mode !== "endless") return !1;
      return depth > 0 && depth % 4 === 0;
    }

    clearSprites() {
      for (const sp of this.sprites) {
        try { sp.destroy(); } catch (e) {}
      }
      this.sprites = [];
      if (this.puzzleG) {
        this.puzzleG.clear();
      }
    }

    // Tom harmônico suave usando WebAudio/Tone (idêntico ao padrão canônico de Depth Gate)
    playTone(freq, dur = 0.35) {
      const E = this.scene?.game?.audioEngine;
      if (!E?.ctx || !E.sfxBus) return;
      try {
        const t0 = E.ctx.currentTime;
        const osc = E.ctx.createOscillator();
        const osc2 = E.ctx.createOscillator();
        const gain = E.ctx.createGain();

        osc.type = "sine";
        osc2.type = "triangle";
        osc.frequency.value = freq;
        osc2.frequency.value = freq * 1.5;

        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(0.28, t0 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(E.sfxBus);

        osc.start(t0);
        osc2.start(t0);
        osc.stop(t0 + dur);
        osc2.stop(t0 + dur);
      } catch (e) {}
    }

    // --- ENIGMA 1: PRISMAS E FEIXES DE LUZ (Alinhamento Prismático) ---
    startLaserPrismPuzzle(container, roomBounds, onComplete) {
      const s = this.scene;
      initPuzzleTextures(s);
      this.clearSprites();

      const cx = roomBounds?.x ? roomBounds.x + 80 : 80;
      const cy = roomBounds?.y ? roomBounds.y + 40 : 40;

      const prisms = [
        { id: 1, x: cx + 80,  y: cy + 60,  angle: 0 },
        { id: 2, x: cx + 240, y: cy + 60,  angle: 180 },
        { id: 3, x: cx + 240, y: cy + 200, angle: 90 },
        { id: 4, x: cx + 380, y: cy + 200, angle: 0 }
      ];

      const receiver = { x: cx + 380, y: cy + 60, hit: !1 };
      const emitter = { x: cx + 80, y: cy + 200, dir: "UP" };

      const puzzleState = {
        type: "laser_prisms",
        prisms,
        receiver,
        emitter,
        solved: !1,
        onComplete
      };

      this.activePuzzle = puzzleState;
      this.renderLaserPuzzle(puzzleState);
      s.game.events.emit("ui:banner", "🧩 ENIGMA DOS PRISMAS: ALINHE O FEIXE SOLAR AO ALTAR!", "#ffd24a");
      s.game?.audioEngine?.sfx?.("sfx-portal");
    }

    renderLaserPuzzle(pState) {
      const s = this.scene;
      initPuzzleTextures(s);

      if (!this.puzzleG) {
        this.puzzleG = s.add.graphics().setDepth(250);
      }
      const g = this.puzzleG;
      g.clear();

      // Criar sprites se não existirem
      if (!pState.createdSprites) {
        pState.createdSprites = !0;

        // Emitter
        const emitSp = s.add.image(pState.emitter.x, pState.emitter.y, "ab-solar-emitter").setDepth(pState.emitter.y);
        this.sprites.push(emitSp);

        // Receiver (Altar Solar)
        const recSp = s.add.image(pState.receiver.x, pState.receiver.y, "ab-solar-altar-off").setDepth(pState.receiver.y);
        pState.recSp = recSp;
        this.sprites.push(recSp);

        // Altar Label
        const altarT = s.add.text(pState.receiver.x, pState.receiver.y - 24, "ALTAR SOLAR", {
          fontFamily: "Cinzel, Georgia, serif",
          fontSize: "9px",
          color: "#ffd24a",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 2
        }).setOrigin(0.5).setDepth(255);
        this.sprites.push(altarT);

        // Prisms
        pState.prismSprites = [];
        for (const pr of pState.prisms) {
          const baseSp = s.add.image(pr.x, pr.y, "ab-prism-base").setDepth(pr.y - 1);
          const crySp = s.add.image(pr.x, pr.y - 4, "ab-prism-crystal").setDepth(pr.y).setAngle(pr.angle);
          pState.prismSprites.push({ baseSp, crySp, data: pr });
          this.sprites.push(baseSp, crySp);
        }
      }

      // Atualizar rotação visual dos cristais
      if (pState.prismSprites) {
        for (const item of pState.prismSprites) {
          item.crySp.setAngle(item.data.angle);
        }
      }

      // Traçar feixe solar
      this.traceLaserBeam(pState, g);
    }

    traceLaserBeam(pState, g) {
      let curX = pState.emitter.x;
      let curY = pState.emitter.y;
      let curDir = "UP";

      // Feixe de luz solar com dupla camada (halo suave + núcleo brilhante)
      g.lineStyle(6, 0xffaa00, 0.3);
      g.beginPath();
      g.moveTo(curX, curY);

      let hitsReceiver = !1;
      const pathPoints = [{ x: curX, y: curY }];

      for (let step = 0; step < 8; step++) {
        let nextPrism = null;
        let minDist = 999999;

        for (const pr of pState.prisms) {
          if (curDir === "UP" && pr.x === curX && pr.y < curY && (curY - pr.y) < minDist) {
            minDist = curY - pr.y; nextPrism = pr;
          } else if (curDir === "DOWN" && pr.x === curX && pr.y > curY && (pr.y - curY) < minDist) {
            minDist = pr.y - curY; nextPrism = pr;
          } else if (curDir === "RIGHT" && pr.y === curY && pr.x > curX && (pr.x - curX) < minDist) {
            minDist = pr.x - curX; nextPrism = pr;
          } else if (curDir === "LEFT" && pr.y === curY && pr.x < curX && (curX - pr.x) < minDist) {
            minDist = curX - pr.x; nextPrism = pr;
          }
        }

        const rx = pState.receiver.x;
        const ry = pState.receiver.y;
        let hitsRecThisStep = !1;
        if (curDir === "UP" && rx === curX && ry < curY && (curY - ry) < minDist) {
          hitsRecThisStep = !0; minDist = curY - ry;
        } else if (curDir === "DOWN" && rx === curX && ry > curY && (ry - curY) < minDist) {
          hitsRecThisStep = !0; minDist = ry - curY;
        } else if (curDir === "RIGHT" && ry === curY && rx > curX && (rx - curX) < minDist) {
          hitsRecThisStep = !0; minDist = rx - curX;
        } else if (curDir === "LEFT" && ry === curY && rx < curX && (curX - rx) < minDist) {
          hitsRecThisStep = !0; minDist = curX - rx;
        }

        if (hitsRecThisStep) {
          pathPoints.push({ x: rx, y: ry });
          hitsReceiver = !0;
          break;
        }

        if (nextPrism) {
          pathPoints.push({ x: nextPrism.x, y: nextPrism.y });
          const ang = nextPrism.angle % 360;

          if (ang === 0) {
            if (curDir === "UP") curDir = "RIGHT";
            else if (curDir === "LEFT") curDir = "DOWN";
            else break;
          } else if (ang === 90) {
            if (curDir === "DOWN") curDir = "RIGHT";
            else if (curDir === "LEFT") curDir = "UP";
            else break;
          } else if (ang === 180) {
            if (curDir === "DOWN") curDir = "LEFT";
            else if (curDir === "RIGHT") curDir = "UP";
            else break;
          } else if (ang === 270) {
            if (curDir === "UP") curDir = "LEFT";
            else if (curDir === "RIGHT") curDir = "DOWN";
            else break;
          } else {
            break;
          }

          curX = nextPrism.x;
          curY = nextPrism.y;
        } else {
          let endX = curX, endY = curY;
          if (curDir === "UP") endY = curY - 90;
          else if (curDir === "DOWN") endY = curY + 90;
          else if (curDir === "LEFT") endX = curX - 90;
          else if (curDir === "RIGHT") endX = curX + 90;
          pathPoints.push({ x: endX, y: endY });
          break;
        }
      }

      // Desenhar linha de halo
      for (let pIdx = 1; pIdx < pathPoints.length; pIdx++) {
        g.lineTo(pathPoints[pIdx].x, pathPoints[pIdx].y);
      }
      g.strokePath();

      // Desenhar núcleo intenso de laser solar
      g.lineStyle(2.5, 0xffffff, 0.95);
      g.beginPath();
      g.moveTo(pathPoints[0].x, pathPoints[0].y);
      for (let pIdx = 1; pIdx < pathPoints.length; pIdx++) {
        g.lineTo(pathPoints[pIdx].x, pathPoints[pIdx].y);
      }
      g.strokePath();

      pState.receiver.hit = hitsReceiver;
      if (pState.recSp) {
        pState.recSp.setTexture(hitsReceiver ? "ab-solar-altar-on" : "ab-solar-altar-off");
      }

      if (hitsReceiver && !pState.solved) {
        pState.solved = !0;
        this.onPuzzleSolved(pState);
      }
    }

    getNearbyPrism(playerX, playerY, maxDist = 38) {
      if (!this.activePuzzle || this.activePuzzle.type !== "laser_prisms" || this.activePuzzle.solved) return null;
      for (const pr of this.activePuzzle.prisms) {
        const d = Phaser.Math.Distance.Between(pr.x, pr.y, playerX, playerY);
        if (d <= maxDist) return pr;
      }
      return null;
    }

    interactPrism(prismId) {
      if (!this.activePuzzle || this.activePuzzle.solved) return;
      const pr = this.activePuzzle.prisms?.find(p => p.id === prismId);
      if (pr) {
        pr.angle = (pr.angle + 90) % 360;
        this.scene.game?.audioEngine?.sfx?.("sfx-lever");
        this.playTone(440 + (pr.angle / 90) * 110, 0.25);
        window.__triggerHaptic?.(50, 0.4);
        this.renderLaserPuzzle(this.activePuzzle);
      }
    }

    // --- ENIGMA 2: SEQUÊNCIA RÚNICA DO ABISMO (Memory Sequence) ---
    startRuneMemoryPuzzle(container, roomBounds, onComplete) {
      this.startRunicMemoryPuzzle(roomBounds, onComplete);
    }

    startRunicMemoryPuzzle(roomBounds, onComplete) {
      const s = this.scene;
      initPuzzleTextures(s);
      this.clearSprites();

      const cx = roomBounds?.x ? roomBounds.x + (roomBounds.width || 300) / 2 : 280;
      const cy = roomBounds?.y ? roomBounds.y + (roomBounds.height || 200) / 2 : 160;

      const runes = [
        { id: 0, key: "ab-rune-fire",  name: "Runa de Fogo",  color: 0xff4422, freq: 261.63, x: cx,       y: cy - 48,  dpad: "UP" },
        { id: 1, key: "ab-rune-ice",   name: "Runa de Gelo",  color: 0x33ccff, freq: 329.63, x: cx,       y: cy + 48,  dpad: "DOWN" },
        { id: 2, key: "ab-rune-shock", name: "Runa de Raio",  color: 0xffd24a, freq: 392.00, x: cx - 60,  y: cy,       dpad: "LEFT" },
        { id: 3, key: "ab-rune-earth", name: "Runa da Terra", color: 0x44dd66, freq: 523.25, x: cx + 60,  y: cy,       dpad: "RIGHT" }
      ];

      const sequence = [];
      for (let i = 0; i < 4; i++) {
        sequence.push(Math.floor(Math.random() * 4));
      }

      const puzzleState = {
        type: "runic_memory",
        runes,
        sequence,
        playerStep: 0,
        isPlayingSequence: !0,
        solved: !1,
        onComplete
      };

      this.activePuzzle = puzzleState;
      this.renderRunicPuzzle(puzzleState);
      this.playRunicDemonstration(puzzleState);
    }

    renderRunicPuzzle(pState, activeRuneId = null) {
      const s = this.scene;
      initPuzzleTextures(s);

      if (!pState.runeSprites) {
        pState.runeSprites = [];
        for (const r of pState.runes) {
          const sp = s.add.image(r.x, r.y, r.key).setDepth(r.y).setScale(1.15);
          pState.runeSprites.push({ sp, def: r });
          this.sprites.push(sp);
        }
      }

      for (const item of pState.runeSprites) {
        const isActive = activeRuneId === item.def.id;
        item.sp.setTexture(isActive ? `${item.def.key}-on` : item.def.key);
        if (isActive) {
          item.sp.setScale(1.35);
          s.tweens.add({
            targets: item.sp,
            scale: 1.15,
            duration: 200,
            ease: "Back.easeOut"
          });
          s.effectsRef?.burstTinted?.(item.def.x, item.def.y, item.def.color, 12);
        }
      }
    }

    playRunicDemonstration(pState) {
      const s = this.scene;
      pState.isPlayingSequence = !0;
      let stepIndex = 0;

      const flashNext = () => {
        if (stepIndex >= pState.sequence.length) {
          pState.isPlayingSequence = !1;
          this.renderRunicPuzzle(pState, null);
          s.game.events.emit("ui:banner", "REPITA A SEQUÊNCIA PISANDO NAS RUNAS!", "#ffd24a");
          return;
        }

        const runeId = pState.sequence[stepIndex];
        const rDef = pState.runes.find(r => r.id === runeId);
        this.renderRunicPuzzle(pState, runeId);
        this.playTone(rDef ? rDef.freq : 330, 0.4);

        s.time.delayedCall(450, () => {
          this.renderRunicPuzzle(pState, null);
          stepIndex++;
          s.time.delayedCall(200, flashNext);
        });
      };

      s.time.delayedCall(600, flashNext);
    }

    inputRuneStep(runeId) {
      const pState = this.activePuzzle;
      if (!pState || pState.type !== "runic_memory" || pState.isPlayingSequence || pState.solved) return;

      const s = this.scene;
      const expectedRune = pState.sequence[pState.playerStep];
      const rDef = pState.runes.find(r => r.id === runeId);

      if (runeId === expectedRune) {
        this.renderRunicPuzzle(pState, runeId);
        this.playTone(rDef ? rDef.freq : 440, 0.35);
        s.game?.audioEngine?.sfx?.("sfx-parry");
        window.__triggerHaptic?.(40, 0.4);
        pState.playerStep++;

        s.time.delayedCall(250, () => {
          this.renderRunicPuzzle(pState, null);
        });

        if (pState.playerStep >= pState.sequence.length) {
          pState.solved = !0;
          this.onPuzzleSolved(pState);
        }
      } else {
        s.cameras?.main?.shake(200, 0.01);
        s.game?.audioEngine?.sfx?.("sfx-trap-dart");
        window.__triggerHaptic?.(120, 0.8);
        s.game.events.emit("ui:banner", "SEQUÊNCIA QUEBRADA! OBSERVE NOVAMENTE...", "#ff5544");
        pState.playerStep = 0;
        this.playRunicDemonstration(pState);
      }
    }

    onPuzzleSolved(pState) {
      const s = this.scene;
      s.game?.audioEngine?.sfx?.("sfx-secret-reveal");
      s.cameras?.main?.shake(300, 0.007);
      window.__triggerHaptic?.(250, 1.0);

      s.game.events.emit("ui:banner", "ENIGMA DO ABISMO RESOLVIDO! +1 PONTO DE HABILIDADE", "#00ff88");

      const curBonus = s.registry.get("endless:bonusSkillPoints") || 0;
      s.registry.set("endless:bonusSkillPoints", curBonus + 1);

      const cx = pState.receiver ? pState.receiver.x : (pState.runes ? pState.runes[0].x : 200);
      const cy = pState.receiver ? pState.receiver.y : (pState.runes ? pState.runes[0].y : 150);

      // Spawn Baú Épico no padrão canônico de Depth Gate
      this.spawnPuzzleChest(cx, cy);

      if (typeof pState.onComplete === "function") {
        pState.onComplete();
      }
    }

    spawnPuzzleChest(x, y) {
      const s = this.scene;
      const chestKey = s.textures.exists("chest-epic") ? "chest-epic" : "chest-rare";
      const ch = s.add.image(x, y + 10, chestKey).setDepth(y + 10).setScale(0.3).setAlpha(0);
      ch.opened = !1;
      ch.def = { col: Math.round(x / 32), row: Math.round(y / 32), tier: "EPIC" };

      s.tweens.add({
        targets: ch,
        scale: 1,
        alpha: 1,
        duration: 500,
        ease: "Back.easeOut"
      });

      s.effectsRef?.burstTinted?.(x, y, 16765514, 25);
      s.effectsRef?.shockwaveRing?.(x, y, 40);

      Object.defineProperty(ch, "interactLabel", {
        get: () => !ch.opened ? (typeof W === "function" ? W("g.openChest") : "[E] Abrir Baú") : null,
        configurable: !0
      });

      ch.interact = () => {
        if (ch.opened) return;
        ch.opened = !0;
        s.game?.audioEngine?.sfx?.("sfx-chest-open");
        if (s.textures.exists(chestKey + "-open")) {
          ch.setTexture(chestKey + "-open");
        }
        s.effectsRef?.burstTinted?.(x, y - 8, 16765514, 30);
        this.dropPuzzleReward(x, y);
      };

      // Registrar nas listas de objetos interativos se existirem
      if (s.interactables) s.interactables.push(ch);
      if (s.chests) s.chests.push(ch);
      this.sprites.push(ch);
    }

    dropPuzzleReward(x, y) {
      const s = this.scene;
      const heroId = s.classDef?.id;
      let rewardItemKey = "wolf_whistle";
      if (heroId === "HUNTER") rewardItemKey = "wolf_whistle";
      else if (heroId === "SHAMAN") rewardItemKey = Math.random() < 0.5 ? "sacred_maraca" : "blowpipe";
      else if (heroId === "DRUID") rewardItemKey = "golden_scythe";
      else if (heroId === "NECROMANCER") rewardItemKey = Math.random() < 0.5 ? "profane_ivory_staff" : "midnight_scythe";
      else rewardItemKey = "dragon_heart_amulet";

      if (typeof s.spawnLootItem === "function") {
        s.spawnLootItem(x, y + 8, rewardItemKey, "RARE");
      }
    }
  }

  // --- 5. NIGHTMARE MODIFIERS SYSTEM ---
  class NightmareModifierSystem {
    static getAffixForTier(tier) {
      const affixes = [
        { id: "magma",   name: "Fissuras Vulcânicas", color: "#ff4411", desc: "Fissuras de lava periódicas surgem no chão das câmaras." },
        { id: "decay",   name: "Miasma Venenoso",     color: "#00ff88", desc: "Reduz a regeneração passiva em 50%." },
        { id: "vamp",    name: "Vampirismo Espectral",color: "#ff3355", desc: "Inimigos recuperam 8% de vida ao golpear." },
        { id: "frenzy",  name: "Frenesi do Abismo",   color: "#ffd24a", desc: "Inimigos têm +30% de cadência e velocidade." },
        { id: "chaos",   name: "Caos do Pesadelo V",  color: "#ff0044", desc: "Inimigos com stats multiplicados ao extremo e afixos combinados." }
      ];
      return affixes[Math.min(affixes.length - 1, Math.max(0, (tier || 1) - 1))];
    }

    static applyToScene(scene, tier) {
      if (!scene || scene.mode !== "endless" || (tier || 0) <= 0) return;
      const affix = NightmareModifierSystem.getAffixForTier(tier);
      scene.game.events.emit("ui:banner", `⚠️ PESADELO ${tier} · AFLIÇÃO: ${affix.name.toUpperCase()}`, affix.color);
    }

    static update(scene, dt) {
      if (!scene || scene.mode !== "endless") return;
      const tier = scene.stats?.nm || scene.nmLvl || 0;
      if (tier <= 0) return;

      const affix = NightmareModifierSystem.getAffixForTier(tier);
      if (affix.id === "magma") {
        if (!scene.__magmaG) {
          scene.__magmaG = scene.add.graphics().setDepth(20);
        }
        const g = scene.__magmaG;
        g.clear();
        const p = scene.player;
        if (!p) return;

        const t = scene.time.now * 0.003;
        const pulse = Math.sin(t) * 0.3 + 0.7;
        g.fillStyle(0xff4400, 0.35 * pulse);
        for (const room of scene.roomManager?.rooms || []) {
          const fx = (room.x + 3) * 32;
          const fy = (room.y + 3) * 32;
          g.fillCircle(fx, fy, 24);
          if (Phaser.Math.Distance.Between(fx, fy, p.x, p.y) < 22) {
            if (!p.__magmaTick || scene.time.now - p.__magmaTick > 1500) {
              p.__magmaTick = scene.time.now;
              p.hp = Math.max(1, p.hp - 2);
              scene.effects?.floatText?.(p.x, p.y - 20, "QUEIMANDO! -2", "#ff4411", 10);
              scene.cameras?.main?.shake(100, 0.005);
              window.__triggerHaptic?.(60, 0.4);
            }
          }
        }
      }
    }
  }

  window.AbyssPuzzleManager = AbyssPuzzleManager;
  window.NightmareModifierSystem = NightmareModifierSystem;
})();
