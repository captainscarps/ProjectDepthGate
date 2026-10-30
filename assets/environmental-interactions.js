/**
 * DEPTHGATE — Sistema Modular de Interações Ambientais e Decorações Vivas
 * 
 * Implementa de forma totalmente integrada com o Phaser 4:
 * 1. EnvironmentalChest: Baús com estados (closed/opening/opened), feedback e recompensas.
 * 2. EnvironmentalLever: Alavancas mecânicas para acionamento de portas e segredos.
 * 3. EnvironmentalTrap: Armadilhas com telégrafo visual, ativação e dano autoritativo.
 * 4. EnvironmentalPuzzle: Quebra-cabeça modular de sequência rúnica/cristalina.
 * 5. EnvironmentalAtmosphere: Tochas, brasas, fumaça e partículas discretas por bioma.
 * 6. ProceduralEnvironmentManager: Gerador procedural que distribui armadilhas, enigmas,
 *    autotiling orgânico de lava (Magmatic Planet) e clima de partículas nas fases reais.
 */

class EnvironmentalChest {
  constructor(scene, x, y, options = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.rarity = options.rarity || 'rare';
    this.rewardGold = options.gold || (this.rarity === 'legendary' ? 120 : this.rarity === 'epic' ? 75 : 40);
    this.opened = false;

    const texKey = options.texture || (this.rarity === 'epic' || this.rarity === 'legendary' ? 'chest-epic' : 'chest-rare');
    const baseTex = scene.textures.exists(texKey) ? texKey : 'chest';
    
    this.sprite = scene.add.image(x, y, baseTex).setOrigin(0.5, 1).setDepth(y).setScale(0.9);

    const glowColor = this.rarity === 'legendary' ? 0xffaa00 : this.rarity === 'epic' ? 0x9944ff : 0x00e5ff;
    this.glow = scene.add.image(x, y - 14, 'light')
      .setScale(0.22)
      .setTint(glowColor)
      .setAlpha(0.28)
      .setDepth(y - 1);

    if (scene.renderer && scene.renderer.type === 1) {
      this.glow.setBlendMode(Phaser.BlendModes.ADD);
    }

    this.pulseTween = scene.tweens.add({
      targets: this.glow,
      alpha: { from: 0.15, to: 0.38 },
      scale: { from: 0.20, to: 0.25 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.radius = options.radius || 32;
  }

  isPlayerNear(player) {
    if (!player || this.opened) return false;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    return dist <= this.radius;
  }

  open(player) {
    if (this.opened) return null;
    this.opened = true;

    if (this.pulseTween) this.pulseTween.stop();
    this.scene.tweens.add({
      targets: this.glow,
      alpha: 0,
      scale: 0.4,
      duration: 250,
      onComplete: () => this.glow.destroy()
    });

    this.scene.tweens.add({
      targets: this.sprite,
      scaleY: 1.15,
      y: this.y - 4,
      duration: 120,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (this.scene.textures.exists('chest-open')) {
          this.sprite.setTexture('chest-open');
        } else {
          this.sprite.setTint(0xcccccc);
        }
      }
    });

    if (this.scene.game?.audioEngine?.sfx) {
      this.scene.game.audioEngine.sfx('sfx-chest-open');
    } else if (this.scene.sound) {
      this.scene.sound.play('sfx-chest-open');
    }

    if (this.scene.effects?.sparklesBurst) {
      this.scene.effects.sparklesBurst(this.x, this.y - 12, 14);
    }

    const reward = {
      gold: this.rewardGold,
      xp: this.rarity === 'legendary' ? 45 : this.rarity === 'epic' ? 30 : 15,
      rarity: this.rarity
    };

    if (player) {
      if (typeof player.addGold === 'function') player.addGold(reward.gold);
      else if (this.scene.registry) {
        const currentGold = this.scene.registry.get('gold') || 0;
        this.scene.registry.set('gold', currentGold + reward.gold);
      }

      if (typeof player.addXp === 'function') player.addXp(reward.xp);
      else if (this.scene.registry) {
        const currentXp = this.scene.registry.get('xp') || 0;
        this.scene.registry.set('xp', currentXp + reward.xp);
      }
    }

    this.scene.game?.events?.emit('ui:banner', `✦ Baú Aberto: +${reward.gold} Ouro e +${reward.xp} XP!`, '#ffd24a');
    return reward;
  }

  destroy() {
    if (this.pulseTween) this.pulseTween.stop();
    if (this.glow?.active) this.glow.destroy();
    if (this.sprite?.active) this.sprite.destroy();
  }
}

class EnvironmentalLever {
  constructor(scene, x, y, options = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.pulled = false;
    this.doorId = options.doorId || null;
    this.onToggle = options.onToggle || null;

    const offTex = scene.textures.exists('cx-lever-off') ? 'cx-lever-off' : 'lever-off';
    this.sprite = scene.add.image(x, y, offTex).setOrigin(0.5, 0.75).setDepth(y);

    this.glow = scene.add.image(x, y - 6, 'light')
      .setScale(0.14)
      .setTint(0x7fe8e0)
      .setAlpha(0.25)
      .setDepth(y - 1);

    if (scene.renderer && scene.renderer.type === 1) {
      this.glow.setBlendMode(Phaser.BlendModes.ADD);
    }

    this.radius = options.radius || 28;
  }

  isPlayerNear(player) {
    if (!player || this.pulled) return false;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    return dist <= this.radius;
  }

  pull() {
    if (this.pulled) return false;
    this.pulled = true;

    const onTex = this.scene.textures.exists('cx-lever-on') ? 'cx-lever-on' : 'lever-on';
    if (this.scene.textures.exists(onTex)) {
      this.sprite.setTexture(onTex);
    } else {
      this.sprite.setFlipX(true);
    }

    this.glow.setTint(0x8ae0b0).setAlpha(0.45);

    if (this.scene.game?.audioEngine?.sfx) {
      this.scene.game.audioEngine.sfx('sfx-lever-click');
    } else if (this.scene.sound) {
      this.scene.sound.play('sfx-lever-click');
    }

    if (this.scene.effects?.shockwaveRing) {
      this.scene.effects.shockwaveRing(this.x, this.y, 24);
    }

    if (typeof this.onToggle === 'function') {
      this.onToggle(this);
    }

    this.scene.game?.events?.emit('ui:banner', '⚙ Um mecanismo distante foi acionado!', '#7fe8e0');
    return true;
  }

  destroy() {
    if (this.glow?.active) this.glow.destroy();
    if (this.sprite?.active) this.sprite.destroy();
  }
}

class EnvironmentalTrap {
  constructor(scene, x, y, options = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.damage = options.damage || 1;
    this.cooldown = options.cooldown || 2000;
    this.active = true;
    this.canTrigger = true;
    this.state = 'idle';
    this.radius = options.radius || 16;

    // Modelo original classico de espinhos do DepthGate: placa plana 'trap-spikes' em repouso
    this.spikes = scene.add.sprite(x, y, 'trap-spikes')
      .setDepth(1.05)
      .setAlpha(0.85);
  }

  trigger(player) {
    if (!this.canTrigger || !this.active || this.state !== 'idle') return false;
    this.canTrigger = false;
    this.state = 'arming';

    // 1. Armacao: pontas de aco surgindo ('trap-spikes-arm') com faiscas
    if (this.scene.textures.exists('trap-spikes-arm')) {
      this.spikes.setTexture('trap-spikes-arm');
    }
    this.scene.effects?.burstTinted?.(this.x, this.y, 0x908069, 3);

    this.scene.tweens.add({
      targets: this.spikes,
      alpha: 1,
      duration: 190,
      yoyo: true,
      onComplete: () => {
        if (!this.active || !this.spikes?.active) return;
        // 2. Disparo: espinhos afiados saltados para fora ('trap-spikes-out') com som e dano
        this.state = 'out';
        if (this.scene.textures.exists('trap-spikes-out')) {
          this.spikes.setTexture('trap-spikes-out').setAlpha(1);
        }

        if (this.scene.audioRef?.play) {
          this.scene.audioRef.play('sfx-door-locked');
        } else if (this.scene.game?.audioEngine?.sfx) {
          this.scene.game.audioEngine.sfx('sfx-spikes-trigger');
        } else if (this.scene.sound) {
          this.scene.sound.play('sfx-spikes-trigger');
        }

        // Dano no jogador
        if (player && this.isPlayerOver(player)) {
          if (!player.isDashing && !player.invulnerable) {
            if (typeof player.takeDamage === 'function') {
              player.takeDamage(this.damage);
            } else if (player.body && typeof player.hp === 'number') {
              player.hp = Math.max(0, player.hp - this.damage);
              this.scene.events?.emit('player:damaged', { hp: player.hp, damage: this.damage });
            }
          }
        }

        // Dano colateral em monstros
        if (this.scene.enemies?.getChildren) {
          for (const enemy of this.scene.enemies.getChildren()) {
            if (enemy.active && !enemy.dead && this.isEnemyOver(enemy)) {
              if (typeof enemy.takeDamage === 'function') {
                enemy.takeDamage(this.damage * 2, false);
              }
            }
          }
        }

        // 3. Retracao completa: volta para 'trap-spikes' (espinhos recolhem totalmente para a placa)
        this.scene.time.delayedCall(520, () => {
          if (!this.active || !this.spikes?.active) return;
          this.state = 'retracting';
          if (this.scene.textures.exists('trap-spikes')) {
            this.spikes.setTexture('trap-spikes').setAlpha(0.85);
          }

          this.scene.time.delayedCall(Math.max(600, this.cooldown - 900), () => {
            this.state = 'idle';
            this.canTrigger = true;
          });
        });
      }
    });

    return true;
  }

  isPlayerOver(player) {
    if (!player) return false;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    return dist <= this.radius;
  }

  isEnemyOver(enemy) {
    if (!enemy) return false;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
    return dist <= this.radius + 4;
  }

  destroy() {
    this.active = false;
    if (this.spikes?.active) this.spikes.destroy();
  }
}

class EnvironmentalPuzzle {
  constructor(scene, cx, cy, options = {}) {
    this.scene = scene;
    const isEndless = scene && (scene.isEndless || scene.level?.endless || scene.mode === "endless" || scene.game?.registry?.get("mode") === "endless" || !!scene.endlessRun?.());
    if (isEndless) { this.active = false; this.totems = []; return; }
    this.cx = cx;
    this.cy = cy;
    this.expectedSequence = options.sequence || [0, 1, 2];
    this.playerSequence = [];
    this.solved = false;
    this.totems = [];
    this.colors = [0xff4444, 0x44ff44, 0x4488ff];

    // Desobstrução garantida: remove árvores, rochas ou decorações que ocultem o quebra-cabeça
    try {
      const clearRadius = 140;
      if (scene.dungeon && Array.isArray(scene.dungeon.objects)) {
        scene.dungeon.objects = scene.dungeon.objects.filter(obj => {
          if (!obj) return false;
          const ox = obj.x ?? obj.pixelX ?? 0;
          const oy = obj.y ?? obj.pixelY ?? 0;
          if (Phaser.Math.Distance.Between(cx, cy, ox, oy) < clearRadius) {
            try { obj.destroy?.(); } catch(_) {}
            return false;
          }
          return true;
        });
      }
      if (scene.children && Array.isArray(scene.children.list)) {
        const toRemove = [];
        for (const child of scene.children.list) {
          if (child && (child.isDecor || child.texture?.key?.includes('tree') || child.texture?.key?.includes('rock') || child.texture?.key?.includes('decor') || child.texture?.key?.includes('foliage'))) {
            if (Phaser.Math.Distance.Between(cx, cy, child.x || 0, child.y || 0) < clearRadius) {
              toRemove.push(child);
            }
          }
        }
        toRemove.forEach(c => { try { c.destroy(); } catch(_) {} });
      }
    } catch (_) {}

    // Piso rúnico sagrado e círculo místico: garante visibilidade cristalina mesmo em biomas densos
    const floorSigil = scene.add.circle(cx, cy, 48, 0x141e2b, 0.75)
      .setStrokeStyle(2.5, 0x55bbff, 0.85)
      .setDepth(0.92);
    const innerRing = scene.add.circle(cx, cy, 32, 0x1a2638, 0.6)
      .setStrokeStyle(1.5, 0x99ddff, 0.7)
      .setDepth(0.93);
    const centerSigil = scene.add.polygon(cx, cy, [0, -12, 10, 0, 0, 12, -10, 0], 0x3388ff)
      .setAlpha(0.6)
      .setDepth(0.94);
    scene.tweens.add({
      targets: [floorSigil, innerRing],
      scale: 1.06,
      alpha: 0.9,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const radius = 32;
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
      const tx = cx + Math.cos(angle) * radius;
      const ty = cy + Math.sin(angle) * radius;

      // Base do Totem Rúnico com profundidade alta garantida
      const base = scene.add.rectangle(tx, ty, 18, 24, 0x242d38)
        .setStrokeStyle(2, 0x4a5d73)
        .setDepth(ty + 50);

      // Cristal Místico flutuante no topo do totem
      const crystal = scene.add.polygon(tx, ty - 16, [0, -9, 6, 0, 0, 9, -6, 0], this.colors[i])
        .setAlpha(0.6)
        .setDepth(ty + 60);

      // Brilho pulsante do cristal
      scene.tweens.add({
        targets: crystal,
        y: ty - 19,
        duration: 900 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this.totems.push({
        id: i,
        x: tx,
        y: ty,
        base,
        crystal,
        lit: false
      });
    }

    this.onSolveCallback = options.onSolve || null;
  }

  interactTotem(index) {
    if (this.solved || index < 0 || index >= this.totems.length) return;
    const totem = this.totems[index];
    if (totem.lit) return;

    totem.lit = true;
    this.playerSequence.push(index);

    this.scene.tweens.add({
      targets: totem.crystal,
      alpha: 1,
      scale: 1.25,
      duration: 180
    });

    this.scene.game?.audioEngine?.sfx?.('sfx-rune-chime') || this.scene.sound?.play?.('sfx-weapon-sword');

    const step = this.playerSequence.length - 1;
    if (this.playerSequence[step] !== this.expectedSequence[step]) {
      this.scene.time.delayedCall(400, () => this.resetPuzzle());
      return;
    }

    if (this.playerSequence.length === this.expectedSequence.length) {
      this.solved = true;
      this.onSuccess();
    }
  }

  resetPuzzle() {
    this.playerSequence = [];
    for (const t of this.totems) {
      t.lit = false;
      this.scene.tweens.add({
        targets: t.crystal,
        alpha: 0.4,
        scale: 1.0,
        duration: 250
      });
    }
    this.scene.cameras?.main?.shake?.(0.003, 100);
  }

  onSuccess() {
    if (this.scene.effects?.shockwaveRing) {
      this.scene.effects.shockwaveRing(this.cx, this.cy, 36);
    }
    this.scene.game?.audioEngine?.sfx?.('sfx-puzzle-solved');

    const secretChest = new EnvironmentalChest(this.scene, this.cx, this.cy + 10, {
      rarity: 'epic',
      gold: 90
    });

    if (typeof this.onSolveCallback === 'function') {
      this.onSolveCallback(secretChest);
    }
  }

  destroy() {
    for (const t of this.totems) {
      if (t.base?.active) t.base.destroy();
      if (t.crystal?.active) t.crystal.destroy();
    }
  }
}

class EnvironmentalAtmosphere {
  static addTorch(scene, x, y) {
    if (!scene || !scene.add) return null;

    const stick = scene.add.rectangle(x, y + 4, 3, 10, 0x4a3420).setDepth(y);
    const flame = scene.add.circle(x, y - 3, 3, 0xff8811, 0.95).setDepth(y + 1);
    const innerFlame = scene.add.circle(x, y - 4, 1.5, 0xffee44, 1).setDepth(y + 2);

    scene.tweens.add({
      targets: [flame, innerFlame],
      scaleX: { from: 0.85, to: 1.2 },
      scaleY: { from: 0.9, to: 1.35 },
      x: { from: x - 0.5, to: x + 0.5 },
      duration: 120 + Math.random() * 80,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const light = scene.add.circle(x, y - 2, 28, 0xff9922, 0.12).setDepth(1);
    if (scene.renderer && scene.renderer.type === 1) {
      light.setBlendMode(Phaser.BlendModes.ADD);
    }

    return { flame, innerFlame, light };
  }
}

/**
 * Gerenciador Procedural de Ambiente do DepthGate
 * Conecta-se às fases e distribui armadilhas, autotiling e atmosfera automaticamente.
 */
class ProceduralEnvironmentManager {
  static initDungeonEnvironment(scene, dungeon) {
    if (!scene || !dungeon || !dungeon.level) return;

    scene.__environmentalTraps = scene.__environmentalTraps || [];
    scene.__environmentalPuzzles = scene.__environmentalPuzzles || [];
    scene.__environmentalChests = scene.__environmentalChests || [];
    scene.__environmentalLevers = scene.__environmentalLevers || [];

    const biomeId = dungeon.level?.theme?.id || dungeon.level?.id || 'castle';
    const dt = 32;

    // 1. Distribuição procedural de armadilhas e quebra-cabeças pelas salas
    const rooms = dungeon.level.rooms || [];
    const sp = dungeon.level.playerSpawn;
    rooms.forEach((room, roomIdx) => {
      if (room.hasBoss) return;
      const rect = room.rect;
      if (!rect) return;

      if (room.enemies && room.enemies.length > 0) {
        const numTraps = Math.min(2, Math.floor(room.enemies.length / 2) + 1);
        for (let i = 0; i < numTraps; i++) {
          const tc = rect.x + 1 + Math.floor(Math.random() * Math.max(1, rect.w - 2));
          const tr = rect.y + 1 + Math.floor(Math.random() * Math.max(1, rect.h - 2));

          if (sp && Math.abs(tc - sp.col) <= 1 && Math.abs(tr - sp.row) <= 1) continue;

          if (!dungeon.isWallTile(tc, tr)) {
            const trap = new EnvironmentalTrap(scene, tc * dt + 16, tr * dt + 16, {
              damage: 1,
              cooldown: 1800
            });
            scene.__environmentalTraps.push(trap);
          }
        }
      }

      const isEndless = scene && (scene.isEndless || scene.level?.endless || scene.mode === "endless" || scene.game?.registry?.get("mode") === "endless" || !!scene.endlessRun?.());
      if (!isEndless && rect.w >= 8 && rect.h >= 8 && scene.__environmentalPuzzles.length === 0 && roomIdx > 0) {
        const pc = Math.floor(rect.x + rect.w / 2);
        const pr = Math.floor(rect.y + rect.h / 2);
        if (!dungeon.isWallTile(pc, pr)) {
          const puzzle = new EnvironmentalPuzzle(scene, pc * dt + 16, pr * dt + 16);
          scene.__environmentalPuzzles.push(puzzle);
        }
      }
    });

    if (scene.__environmentalTraps.length === 0 && rooms[0]?.rect) {
      const r = rooms[0].rect;
      for (let tc = r.x + 1; tc < r.x + r.w - 1; tc++) {
        for (let tr = r.y + 1; tr < r.y + r.h - 1; tr++) {
          if (!dungeon.isWallTile(tc, tr) && (!sp || Math.abs(tc - sp.col) > 1 || Math.abs(tr - sp.row) > 1)) {
            scene.__environmentalTraps.push(new EnvironmentalTrap(scene, tc * dt + 16, tr * dt + 16));
            break;
          }
        }
        if (scene.__environmentalTraps.length > 0) break;
      }
    }

    // 2. Refinamento de autotiling orgânico de lava (Magmatic Planet)
    if (biomeId === 'vulcao') {
      this.applyLavaOrganicAutotile(scene, dungeon);
    }

    // 3. Atmosfera de partículas contínua por bioma
    this.applyBiomeAtmosphere(scene, biomeId, dungeon);

    // 4. Hook de update para interações em tempo real
    if (!scene.__envUpdateHookRegistered) {
      scene.__envUpdateHookRegistered = true;
      scene.events.on('update', () => {
        this.updateSceneEnvironment(scene);
      });
      scene.events.once('shutdown', () => {
        scene.__envUpdateHookRegistered = false;
      });
    }
  }

  static applyLavaOrganicAutotile(scene, dungeon) {
    if (!scene || !dungeon) return;
    const dt = 32;

    // Decorações orgânicas chanfradas do Magmatic Planet para arredondar poças e cantos
    const organicProps = [
      'vc-mp-lavapool-round',
      'vc-mp-lavapool-crust',
      'vc-mp-magma-rock',
      'vc-mp-crystal1',
      'vc-mp-ember-fern'
    ].filter(k => scene.textures.exists(k));

    if (!organicProps.length) return;

    // Detectar margens de lava e adicionar transições curvas orgânicas
    const rooms = dungeon.level?.rooms || [];
    rooms.forEach(room => {
      const decs = room.decor || [];
      decs.forEach(dec => {
        if (dec.tex && dec.tex.includes('lavapool') && !dec.tex.includes('mp-')) {
          // Substituir visual rígido por piscina orgânica arredondada
          const pick = organicProps[Math.floor(Math.random() * organicProps.length)];
          const patch = scene.add.image(dec.col * dt + 16, dec.row * dt + 16, pick)
            .setDepth(1.02)
            .setScale(1.15)
            .setAlpha(0.9);
          if (scene.renderer && scene.renderer.type === 1) {
            patch.setBlendMode(Phaser.BlendModes.ADD);
          }
        }
      });
    });
  }

  static applyBiomeAtmosphere(scene, biomeId, dungeon) {
    if (!scene || !scene.add) return;

    const w = (dungeon?.cols || 80) * 32;
    const h = (dungeon?.rows || 64) * 32;

    if (biomeId === 'vulcao') {
      // Brasas incandescentes subindo suavemente
      const numEmbers = 45;
      for (let i = 0; i < numEmbers; i++) {
        const ex = Math.random() * w;
        const ey = Math.random() * h;
        const color = Math.random() < 0.6 ? 0xff5511 : 0xffaa33;
        const ember = scene.add.circle(ex, ey, Math.random() < 0.5 ? 1.5 : 2.5, color, 0.75)
          .setDepth(999);
        if (scene.renderer && scene.renderer.type === 1) {
          ember.setBlendMode(Phaser.BlendModes.ADD);
        }

        scene.tweens.add({
          targets: ember,
          y: ey - 180 - Math.random() * 120,
          x: ex + (Math.random() * 50 - 25),
          alpha: { from: 0.8, to: 0 },
          scale: { from: 1, to: 0.4 },
          duration: 2400 + Math.random() * 1800,
          repeat: -1,
          ease: 'Sine.easeOut'
        });
      }
    } else if (biomeId === 'glacial') {
      // Flocos de gelo e neve polar caindo com leve vento
      const numFlakes = 40;
      for (let i = 0; i < numFlakes; i++) {
        const fx = Math.random() * w;
        const fy = Math.random() * h;
        const flake = scene.add.circle(fx, fy, 1.5, 0xe0f4ff, 0.65).setDepth(999);

        scene.tweens.add({
          targets: flake,
          y: fy + 160 + Math.random() * 100,
          x: fx + 60 + Math.random() * 40,
          alpha: { from: 0.7, to: 0.1 },
          duration: 2200 + Math.random() * 1500,
          repeat: -1,
          ease: 'Linear'
        });
      }
    } else if (biomeId === 'morta' || biomeId === 'ruins') {
      // Névoa rasteira suave
      const numMists = 25;
      for (let i = 0; i < numMists; i++) {
        const mx = Math.random() * w;
        const my = Math.random() * h;
        const mist = scene.add.circle(mx, my, 22 + Math.random() * 18, 0x223328, 0.14)
          .setDepth(1.05);

        scene.tweens.add({
          targets: mist,
          x: mx + (Math.random() * 40 - 20),
          alpha: { from: 0.08, to: 0.22 },
          duration: 3500 + Math.random() * 2000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
      }
    }
  }

  static updateSceneEnvironment(scene) {
    if (!scene || !scene.player) return;
    const player = scene.player;

    // Atualização de armadilhas ativas
    if (scene.__environmentalTraps && scene.__environmentalTraps.length > 0) {
      scene.__environmentalTraps.forEach(trap => {
        if (trap.isPlayerOver(player)) {
          trap.trigger(player);
        }
      });
    }

    // Interações com totens rúnicos
    if (scene.__environmentalPuzzles && scene.__environmentalPuzzles.length > 0) {
      scene.__environmentalPuzzles.forEach(puzzle => {
        if (puzzle.solved) return;
        puzzle.totems.forEach((totem, idx) => {
          const dist = Phaser.Math.Distance.Between(totem.x, totem.y, player.x, player.y);
          if (dist < 26) {
            puzzle.interactTotem(idx);
          }
        });
      });
    }
  }
}

if (typeof window !== 'undefined') {
  window.DEPTHGATE_ENVIRONMENTAL = {
    EnvironmentalChest,
    EnvironmentalLever,
    EnvironmentalTrap,
    EnvironmentalPuzzle,
    EnvironmentalAtmosphere,
    ProceduralEnvironmentManager
  };
}

if (typeof window !== 'undefined') {
  window.EnvironmentalChest = EnvironmentalChest;
  window.EnvironmentalLever = EnvironmentalLever;
  window.EnvironmentalTrap = EnvironmentalTrap;
  window.EnvironmentalPuzzle = EnvironmentalPuzzle;
  window.EnvironmentalAtmosphere = EnvironmentalAtmosphere;
  window.ProceduralEnvironmentManager = ProceduralEnvironmentManager;
  window.DEPTHGATE_ENVIRONMENTAL = {
    EnvironmentalChest,
    EnvironmentalLever,
    EnvironmentalTrap,
    EnvironmentalPuzzle,
    EnvironmentalAtmosphere,
    ProceduralEnvironmentManager
  };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EnvironmentalChest,
    EnvironmentalLever,
    EnvironmentalTrap,
    EnvironmentalPuzzle,
    EnvironmentalAtmosphere,
    ProceduralEnvironmentManager
  };
}
