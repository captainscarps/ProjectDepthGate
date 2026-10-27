// Abyss Puzzles System for Endless Mode
// Harder procedural puzzle chambers with top-tier Gamepad, Touch, and Keyboard gameplay
(() => {
  class AbyssPuzzleManager {
    constructor(gameScene) {
      this.scene = gameScene;
      this.activePuzzle = null;
      this.solved = !1;
      this.puzzleOverlay = null;
    }

    // Check if an abyss puzzle should spawn on current endless floor
    shouldSpawnAbyssPortal(depth) {
      if (this.scene.mode !== "endless") return !1;
      // Spawns every 4 depths (4, 8, 12, 16...)
      return depth > 0 && depth % 4 === 0;
    }

    // Trigger Prisma Laser Puzzle
    startLaserPrismPuzzle(container, roomBounds, onComplete) {
      const s = this.scene;
      const w = roomBounds?.width || 480;
      const h = roomBounds?.height || 280;
      const cx = roomBounds?.x || 80;
      const cy = roomBounds?.y || 40;

      // 4 Pedestals with angles (0, 90, 180, 270)
      const prisms = [
        { id: 1, x: cx + 80,  y: cy + 60,  angle: 0,   targetAngle: 90 },
        { id: 2, x: cx + 240, y: cy + 60,  angle: 180, targetAngle: 180 },
        { id: 3, x: cx + 240, y: cy + 200, angle: 90,  targetAngle: 270 },
        { id: 4, x: cx + 380, y: cy + 200, angle: 0,   targetAngle: 180 }
      ];

      // Receiver Target
      const receiver = { x: cx + 380, y: cy + 60, hit: !1 };
      // Emitter Source
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

      // Draw Laser Beams
      this.traceLaserBeam(pState, g);

      // Draw Prisms
      for (const pr of pState.prisms) {
        g.fillStyle(0x221a36, 1);
        g.fillRoundedRect(pr.x - 14, pr.y - 14, 28, 28, 4);
        g.lineStyle(2, 0x9988cc, 1);
        g.strokeRoundedRect(pr.x - 14, pr.y - 14, 28, 28, 4);

        // Reflective mirror indicator inside prism
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
      // Trace beam starting at emitter moving UP
      let curX = pState.emitter.x;
      let curY = pState.emitter.y;
      let curDir = "UP"; // UP, DOWN, LEFT, RIGHT

      g.lineStyle(3, 0xffe066, 0.85);
      g.beginPath();
      g.moveTo(curX, curY);

      let hitsReceiver = !1;

      for (let step = 0; step < 8; step++) {
        let nextPrism = null;
        let minDist = 999999;

        for (const pr of pState.prisms) {
          if (curDir === "UP" && pr.x === curX && pr.y < curY && (curY - pr.y) < minDist) {
            minDist = curY - pr.y;
            nextPrism = pr;
          } else if (curDir === "DOWN" && pr.x === curX && pr.y > curY && (pr.y - curY) < minDist) {
            minDist = pr.y - curY;
            nextPrism = pr;
          } else if (curDir === "RIGHT" && pr.y === curY && pr.x > curX && (pr.x - curX) < minDist) {
            minDist = pr.x - curX;
            nextPrism = pr;
          } else if (curDir === "LEFT" && pr.y === curY && pr.x < curX && (curX - pr.x) < minDist) {
            minDist = curX - pr.x;
            nextPrism = pr;
          }
        }

        // Check if receiver is in line of sight
        const rx = pState.receiver.x;
        const ry = pState.receiver.y;
        let hitsRecThisStep = !1;
        if (curDir === "UP" && rx === curX && ry < curY && (curY - ry) < minDist) {
          hitsRecThisStep = !0;
          minDist = curY - ry;
        } else if (curDir === "DOWN" && rx === curX && ry > curY && (ry - curY) < minDist) {
          hitsRecThisStep = !0;
          minDist = ry - curY;
        } else if (curDir === "RIGHT" && ry === curY && rx > curX && (rx - curX) < minDist) {
          hitsRecThisStep = !0;
          minDist = rx - curX;
        } else if (curDir === "LEFT" && ry === curY && rx < curX && (curX - rx) < minDist) {
          hitsRecThisStep = !0;
          minDist = curX - rx;
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

          // Reflect based on prism angle
          // Angles: 0, 90, 180, 270
          if (curDir === "UP") {
            curDir = (nextPrism.angle === 45 || nextPrism.angle === 225 || nextPrism.angle === 90) ? "RIGHT" : "LEFT";
          } else if (curDir === "RIGHT") {
            curDir = (nextPrism.angle === 180 || nextPrism.angle === 270) ? "DOWN" : "UP";
          } else if (curDir === "DOWN") {
            curDir = (nextPrism.angle === 270 || nextPrism.angle === 0) ? "RIGHT" : "LEFT";
          } else if (curDir === "LEFT") {
            curDir = (nextPrism.angle === 0 || nextPrism.angle === 90) ? "UP" : "DOWN";
          }
        } else {
          // Beam stops at chamber border
          const endX = curDir === "RIGHT" ? curX + 200 : curDir === "LEFT" ? curX - 200 : curX;
          const endY = curDir === "DOWN" ? curY + 200 : curDir === "UP" ? curY - 200 : curY;
          g.lineTo(endX, endY);
          break;
        }
      }
      g.strokePath();

      pState.receiver.hit = hitsReceiver;

      // Check win condition
      if (hitsReceiver && !pState.solved) {
        pState.solved = !0;
        this.onPuzzleSolved(pState);
      }
    }

    // Called when player presses A near a prism
    interactPrism(prismId) {
      if (!this.activePuzzle || this.activePuzzle.solved) return;
      const pr = this.activePuzzle.prisms.find(p => p.id === prismId);
      if (pr) {
        pr.angle = (pr.angle + 90) % 360;
        this.scene.game?.audioEngine?.sfx?.("sfx-lever");
        this.renderLaserPuzzle(this.activePuzzle);
      }
    }

    // Puzzle completed callback
    onPuzzleSolved(pState) {
      const s = this.scene;
      s.game?.audioEngine?.sfx?.("sfx-shrine-use");

      // Spawn celebratory particles
      const rx = pState.receiver.x;
      const ry = pState.receiver.y;
      if (s.add?.particles) {
        // Star sparkle burst
      }

      // Banner announcement
      s.game.events.emit("ui:banner", "ENIGMA DO ABISMO RESOLVIDO! +1 PONTO DE HABILIDADE", "#00ff88");

      // Award bonus skill point for the infinite tree
      const curBonus = s.registry.get("endless:bonusSkillPoints") || 0;
      s.registry.set("endless:bonusSkillPoints", curBonus + 1);

      // Reward high tier loot / New equipment item
      this.dropPuzzleReward(rx, ry);

      if (typeof pState.onComplete === "function") {
        pState.onComplete();
      }
    }

    dropPuzzleReward(x, y) {
      const s = this.scene;
      const heroId = s.classDef?.id;
      // Select appropriate new equipment item based on hero
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

  window.AbyssPuzzleManager = AbyssPuzzleManager;
})();
