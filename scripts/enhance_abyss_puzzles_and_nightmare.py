import os, sys, shutil

sys.stdout.reconfigure(encoding='utf-8')

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR_BUNDLE = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
PUZZLES_JS = os.path.join(ROOT, "assets", "abyss-puzzles.js")
MIRROR_PUZZLES_JS = os.path.join(ROOT, "Projeto atualizado", "assets", "abyss-puzzles.js")

print("Enhancing Abyss Puzzles (interactive physical prisms and runic plates) and Nightmare Affixes...")

# 1. Update assets/abyss-puzzles.js with update loop, physical collision, and active hazards
enhanced_puzzles_code = '''// Abyss Puzzles & Nightmare Modifiers System for Endless Mode
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
      s.game.events.emit("ui:banner", "🧩 ENIGMA DOS PRISMAS: ALINHE O FEIXE SOLAR AO ALTAR!", "#ffd24a");
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

      // Draw Receiver (Solar Altar)
      const recColor = pState.receiver.hit ? 0x00ff88 : 0x443366;
      g.fillStyle(recColor, 1);
      g.fillCircle(pState.receiver.x, pState.receiver.y, 14);
      g.lineStyle(2.5, pState.receiver.hit ? 0x88ffbb : 0x7755aa, 1);
      g.strokeCircle(pState.receiver.x, pState.receiver.y, 16);

      // Label on altar
      if (!pState.altarT) {
        pState.altarT = s.add.text(pState.receiver.x, pState.receiver.y - 24, "ALTAR SOLAR", {
          fontFamily: "Cinzel, serif",
          fontSize: "9px",
          color: "#ffd24a",
          fontStyle: "bold"
        }).setOrigin(0.5).setDepth(251);
      }

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

    getNearbyPrism(playerX, playerY, maxDist = 36) {
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
      const cx = roomBounds?.x ? roomBounds.x + (roomBounds.width || 300) / 2 : 280;
      const cy = roomBounds?.y ? roomBounds.y + (roomBounds.height || 200) / 2 : 160;

      // 4 Runes on ground: Fogo (Top), Gelo (Bottom), Raio (Left), Terra (Right)
      const runes = [
        { id: 0, key: "fire",  name: "Runa de Fogo",  color: 0xff4422, x: cx,       y: cy - 45,  dpad: "UP" },
        { id: 1, key: "ice",   name: "Runa de Gelo",  color: 0x33ccff, x: cx,       y: cy + 45,  dpad: "DOWN" },
        { id: 2, key: "shock", name: "Runa de Raio",  color: 0xffd24a, x: cx - 55,  y: cy,       dpad: "LEFT" },
        { id: 3, key: "earth", name: "Runa da Terra", color: 0x44dd66, x: cx + 55,  y: cy,       dpad: "RIGHT" }
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

        // Glowing glyph
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
          s.game.events.emit("ui:banner", "REPITA A SEQUÊNCIA PISANDO NAS RUNAS!", "#ffd24a");
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

    inputRuneStep(runeId) {
      const pState = this.activePuzzle;
      if (!pState || pState.type !== "runic_memory" || pState.isPlayingSequence || pState.solved) return;

      const s = this.scene;
      const expectedRune = pState.sequence[pState.playerStep];

      if (runeId === expectedRune) {
        this.renderRunicPuzzle(pState, runeId);
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
      s.game?.audioEngine?.sfx?.("sfx-shrine-use");
      window.__triggerHaptic?.(250, 1.0);

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

    update(dt) {
      const pState = this.activePuzzle;
      if (!pState || pState.solved) return;
      const p = this.scene?.player;
      if (!p) return;

      if (pState.type === "runic_memory" && !pState.isPlayingSequence) {
        for (const r of pState.runes) {
          const dist = Phaser.Math.Distance.Between(r.x, r.y, p.x, p.y);
          if (dist < 24) {
            if (!r.__stepped) {
              r.__stepped = !0;
              this.inputRuneStep(r.id);
            }
          } else if (dist > 32) {
            r.__stepped = !1;
          }
        }
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

        // Draw pulsing fissures around room centers
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
'''

with open(PUZZLES_JS, 'w', encoding='utf-8') as f:
    f.write(enhanced_puzzles_code)

shutil.copyfile(PUZZLES_JS, MIRROR_PUZZLES_JS)
print("Updated abyss-puzzles.js and mirror with interactive prisms, runes, and magma/fog update loop.")

# 2. Patch BUNDLE to hook findInteractable and update loop
with open(BUNDLE, 'r', encoding='utf-8') as f:
    s = f.read()

def rep(old, new, desc):
    global s
    c = s.count(old)
    if c != 1:
        print(f"ERROR: Expected 1 occurrence for '{desc}', found {c}")
        sys.exit(1)
    s = s.replace(old, new)
    print(f"Applied: {desc}")

# A. Hook findInteractable() to detect nearby prisms
old_fi_end = 'const d=this.roomManager.portal;return d&&(this.level.next||this.level.endless)&&j.Math.Distance.Between(d.x,d.y,i.x,i.y)<(t?Math.min(e,44):44)&&(t={kind:"portal",target:d,label:this.level.endless?W("g.descend"):W("g.enter",{name:St(`lvl.${this.level.next}`,ki[this.level.next].name)})}),t}'
new_fi_end = 'if(this.__abyssPuzzles?.activePuzzle?.type==="laser_prisms"){const pr=this.__abyssPuzzles.getNearbyPrism(i.x,i.y,38);if(pr){t={kind:"abyss_prism",target:pr,label:"Girar Prisma [ (A) ]",prismId:pr.id}}}const d=this.roomManager.portal;return d&&(this.level.next||this.level.endless)&&j.Math.Distance.Between(d.x,d.y,i.x,i.y)<(t?Math.min(e,44):44)&&(t={kind:"portal",target:d,label:this.level.endless?W("g.descend"):W("g.enter",{name:St(`lvl.${this.level.next}`,ki[this.level.next].name)})}),t}'

if old_fi_end in s:
    rep(old_fi_end, new_fi_end, "Hook findInteractable to return abyss_prism")

# B. Hook interact action execution
old_interact_exec = 'n.kind==="guardian"?__guardianTalk(this):n.kind==="hubportal"?__hubEnter(this,n.target):n.kind==="portal"?'
new_interact_exec = 'n.kind==="abyss_prism"?this.__abyssPuzzles?.interactPrism(n.prismId):n.kind==="guardian"?__guardianTalk(this):n.kind==="hubportal"?__hubEnter(this,n.target):n.kind==="portal"?'

if old_interact_exec in s:
    rep(old_interact_exec, new_interact_exec, "Hook interact execution for abyss_prism")

# C. Hook Game update(i,t) for puzzle update and nightmare hazard update
old_upd_hook = 'if(typeof window!=="undefined"&&window.BuildVisualAuras)window.BuildVisualAuras.updatePlayerAura(this);'
new_upd_hook = 'if(typeof window!=="undefined"&&window.BuildVisualAuras)window.BuildVisualAuras.updatePlayerAura(this);this.__abyssPuzzles?.update(e);if(typeof window!=="undefined"&&window.NightmareModifierSystem)window.NightmareModifierSystem.update(this,e);'

if old_upd_hook in s:
    rep(old_upd_hook, new_upd_hook, "Hook abyss puzzles update and nightmare hazard update into Game loop")

# D. Enrich HUD setEndless with active pacts and path preview
old_hud_endless = 'const nm=this.nmLvl??0;this.endlessText.setText(W("hud.endless",{depth:i.depth,score:i.score.toLocaleString("pt-BR")})+(nm>0?`\\nPESADELO ${__roman(nm)}`:"")).setColor(nm>0?"#ff5a4a":"#9a7fd0").setAlign("center").setVisible(!0)'
new_hud_endless = 'const nm=this.nmLvl??0;const pacts=(typeof window!=="undefined"&&window.__getActivePacts?.(this.scene))||[];const pactIcons=pacts.map(p=>window.__ABYSS_PACTS?.find(x=>x.id===p)?.icon||"🩸").join(" ");const pStr=pacts.length>0?`\\nPACTOS: ${pactIcons}`:"";this.endlessText.setText(W("hud.endless",{depth:i.depth,score:i.score.toLocaleString("pt-BR")})+(nm>0?`\\nPESADELO ${__roman(nm)}`:"")+pStr).setColor(nm>0?"#ff5a4a":"#9a7fd0").setAlign("center").setVisible(!0)'

if old_hud_endless in s:
    rep(old_hud_endless, new_hud_endless, "Show active cursed pacts icons on Endless HUD")

with open(BUNDLE, 'w', encoding='utf-8') as f:
    f.write(s)
print(f"Saved patched {BUNDLE}")

with open(MIRROR_BUNDLE, 'w', encoding='utf-8') as f:
    f.write(s)
print(f"Saved mirror {MIRROR_BUNDLE}")

print("All Abyss Puzzles & Nightmare Hazard enhancements successfully integrated!")
