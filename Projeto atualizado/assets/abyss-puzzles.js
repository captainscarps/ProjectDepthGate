// Abyss Puzzles & Nightmare Modifiers System for Endless Mode
// Harder procedural puzzle chambers with top-tier Gamepad, Touch, and Keyboard gameplay
(() => {
  class AbyssPuzzleManager {
    constructor(gameScene) {
      this.scene = gameScene;
      this.activePuzzle = null;
      this.solved = !1;
      this.puzzleG = null;
    }

    shouldSpawnAbyssPortal(depth) {
      if (this.scene.mode !== "endless") return !1;
      return depth > 0 && depth % 4 === 0;
    }

    // --- ENIGMA 1: PRISMAS E FEIXES DE LUZ (Laser Reflection) ---
    startLaserPrismPuzzle(container, roomBounds, onComplete) {
      const s = this.scene;
      const w = roomBounds?.width || 480;
      const h = roomBounds?.height || 280;
      const cx = roomBounds?.x || 80;
      const cy = roomBounds?.y || 40;

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
    }

    renderLaserPuzzle(pState) {
      const s = this.scene;
      if (!this.puzzleG) {
        this.puzzleG = s.add.graphics().setDepth(250);
      }
      const g = this.puzzleG;
      g.clear();

      // Draw Emitter
      g.fillStyle(0xff9900, 1);
      g.fillCircle(pState.emitter.x, pState.emitter.y, 10);
      g.lineStyle(2, 0xffd24a, 1);
      g.strokeCircle(pState.emitter.x, pState.emitter.y, 12);

      // Draw Receiver
      const recColor = pState.receiver.hit ? 0x00ff88 : 0x443366;
      g.fillStyle(recColor, 1);
      g.fillCircle(pState.receiver.x, pState.receiver.y, 12);
      g.lineStyle(2.5, pState.receiver.hit ? 0x88ffbb : 0x7755aa, 1);
      g.strokeCircle(pState.receiver.x, pState.receiver.y, 14);

      // Trace laser beam
      this.traceLaserBeam(pState, g);

      // Draw Prisms
      for (const pr of pState.prisms) {
        g.fillStyle(0x221a36, 1);
        g.fillRoundedRect(pr.x - 14, pr.y - 14, 28, 28, 4);
        g.lineStyle(2, 0x9988cc, 1);
        g.strokeRoundedRect(pr.x - 14, pr.y - 14, 28, 28, 4);

        const rad = Phaser.Math.DegToRad(pr.angle);
        const mx1 = pr.x - Math.cos(rad) * 10;
        const my1 = pr.y - Math.sin(rad) * 10;
        const mx2 = pr.x + Math.cos(rad) * 10;
        const my2 = pr.y + Math.sin(rad) * 10;

        g.lineStyle(3, 0x00ffff, 0.9);
        g.beginPath();
        g.moveTo(mx1, my1); g.lineTo(mx2, my2);
        g.strokePath();
      }
    }

    traceLaserBeam(pState, g) {
      let curX = pState.emitter.x;
      let curY = pState.emitter.y;
      let curDir = "UP";

      g.lineStyle(3, 0xffe066, 0.85);
      g.beginPath();
      g.moveTo(curX, curY);

      let hitsReceiver = !1;

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
          g.lineTo(rx, ry);
          hitsReceiver = !0;
          break;
        }

        if (nextPrism) {
          g.lineTo(nextPrism.x, nextPrism.y);
          curX = nextPrism.x;
          curY = nextPrism.y;

          if (curDir === "UP") {
            curDir = (nextPrism.angle === 90 || nextPrism.angle === 45) ? "RIGHT" : "LEFT";
          } else if (curDir === "RIGHT") {
            curDir = (nextPrism.angle === 180 || nextPrism.angle === 270) ? "DOWN" : "UP";
          } else if (curDir === "DOWN") {
            curDir = (nextPrism.angle === 270 || nextPrism.angle === 0) ? "RIGHT" : "LEFT";
          } else if (curDir === "LEFT") {
            curDir = (nextPrism.angle === 0 || nextPrism.angle === 90) ? "UP" : "DOWN";
          }
        } else {
          const endX = curDir === "RIGHT" ? curX + 160 : curDir === "LEFT" ? curX - 160 : curX;
          const endY = curDir === "DOWN" ? curY + 160 : curDir === "UP" ? curY - 160 : curY;
          g.lineTo(endX, endY);
          break;
        }
      }
      g.strokePath();

      pState.receiver.hit = hitsReceiver;

      if (hitsReceiver && !pState.solved) {
        pState.solved = !0;
        this.onPuzzleSolved(pState);
      }
    }

    interactPrism(prismId) {
      if (!this.activePuzzle || this.activePuzzle.solved) return;
      const pr = this.activePuzzle.prisms?.find(p => p.id === prismId);
      if (pr) {
        pr.angle = (pr.angle + 90) % 360;
        this.scene.game?.audioEngine?.sfx?.("sfx-lever");
        this.renderLaserPuzzle(this.activePuzzle);
      }
    }

    // --- ENIGMA 2: SEQUÊNCIA RÚNICA DO ABISMO (Memory Sequence) ---
    startRunicMemoryPuzzle(roomBounds, onComplete) {
      const s = this.scene;
      const cx = roomBounds?.x || 280;
      const cy = roomBounds?.y || 160;

      // 4 Runes on ground: Fogo (Top), Gelo (Bottom), Raio (Left), Terra (Right)
      const runes = [
        { id: 0, key: "fire",  name: "Runa de Fogo",  color: 0xff4422, x: cx,       y: cy - 45,  dpad: "UP" },
        { id: 1, key: "ice",   name: "Runa de Gelo",  color: 0x33ccff, x: cx,       y: cy + 45,  dpad: "DOWN" },
        { id: 2, key: "shock", name: "Runa de Raio",  color: 0xffd24a, x: cx - 55,  y: cy,       dpad: "LEFT" },
        { id: 3, key: "earth", name: "Runa da Terra", color: 0x44dd66, x: cx + 55,  y: cy,       dpad: "RIGHT" }
      ];

      // Generate random sequence of 5 steps
      const sequence = [];
      for (let i = 0; i < 5; i++) {
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
      if (!this.puzzleG) {
        this.puzzleG = s.add.graphics().setDepth(250);
      }
      const g = this.puzzleG;
      g.clear();

      for (const r of pState.runes) {
        const isActive = activeRuneId === r.id;
        g.fillStyle(isActive ? r.color : 0x1a1426, isActive ? 1 : 0.85);
        g.fillCircle(r.x, r.y, 20);

        g.lineStyle(isActive ? 3 : 1.5, isActive ? 0xffffff : r.color, 0.9);
        g.strokeCircle(r.x, r.y, 22);

        // Subtle glowing glyph
        g.fillStyle(isActive ? 0xffffff : r.color, 0.8);
        g.fillCircle(r.x, r.y, 6);
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
          s.game.events.emit("ui:banner", "REPITA A SEQUÊNCIA RÚNICA NO GAMEPAD!", "#ffd24a");
          return;
        }

        const runeId = pState.sequence[stepIndex];
        this.renderRunicPuzzle(pState, runeId);
        s.game?.audioEngine?.sfx?.("sfx-portal");

        s.time.delayedCall(450, () => {
          this.renderRunicPuzzle(pState, null);
          stepIndex++;
          s.time.delayedCall(200, flashNext);
        });
      };

      s.time.delayedCall(600, flashNext);
    }

    // Player inputs rune step (via Gamepad D-pad or walking over plate)
    inputRuneStep(runeId) {
      const pState = this.activePuzzle;
      if (!pState || pState.type !== "runic_memory" || pState.isPlayingSequence || pState.solved) return;

      const s = this.scene;
      const expectedRune = pState.sequence[pState.playerStep];

      if (runeId === expectedRune) {
        // Correct step!
        this.renderRunicPuzzle(pState, runeId);
        s.game?.audioEngine?.sfx?.("sfx-parry");
        pState.playerStep++;

        s.time.delayedCall(250, () => {
          this.renderRunicPuzzle(pState, null);
        });

        if (pState.playerStep >= pState.sequence.length) {
          pState.solved = !0;
          this.onPuzzleSolved(pState);
        }
      } else {
        // Wrong step! Camera shake and reset round
        s.cameras?.main?.shake(200, 0.01);
        s.game?.audioEngine?.sfx?.("sfx-trap-dart");
        s.game.events.emit("ui:banner", "SEQUÊNCIA QUEBRADA! OBSERVE NOVAMENTE...", "#ff5544");
        pState.playerStep = 0;
        this.playRunicDemonstration(pState);
      }
    }

    onPuzzleSolved(pState) {
      const s = this.scene;
      s.game?.audioEngine?.sfx?.("sfx-shrine-use");

      s.game.events.emit("ui:banner", "ENIGMA DO ABISMO RESOLVIDO! +1 PONTO DE HABILIDADE", "#00ff88");

      const curBonus = s.registry.get("endless:bonusSkillPoints") || 0;
      s.registry.set("endless:bonusSkillPoints", curBonus + 1);

      const cx = pState.receiver ? pState.receiver.x : (pState.runes ? pState.runes[0].x : 200);
      const cy = pState.receiver ? pState.receiver.y : (pState.runes ? pState.runes[0].y : 150);
      this.dropPuzzleReward(cx, cy);

      if (typeof pState.onComplete === "function") {
        pState.onComplete();
      }
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
        s.spawnLootItem(x, y, rewardItemKey, "RARE");
      }
    }
  }

  // --- AFIXOS E MODIFICADORES DE PESADELO (Nightmare Modifiers) ---
  class NightmareModifierSystem {
    static getAffixForTier(tier) {
      const affixes = [
        { id: "fog",     name: "Névoa Asfixiante",    color: "#a482cc", desc: "Visibilidade reduzida e névoa densa na sala." },
        { id: "magma",   name: "Chão de Magma",       color: "#ff6622", desc: "Fissuras de lava pulsam e incendeiam quem parar nelas." },
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
  }

  window.AbyssPuzzleManager = AbyssPuzzleManager;
  window.NightmareModifierSystem = NightmareModifierSystem;
})();
