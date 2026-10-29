/**
 * DEPTHGATE — Sistema Modular de Interações Ambientais e Decorações Vivas
 * 
 * Implementa de forma totalmente integrada com o Phaser 4:
 * 1. EnvironmentalChest: Baús com estados (closed/opening/opened), feedback e recompensas.
 * 2. EnvironmentalLever: Alavancas mecânicas para acionamento de portas e segredos.
 * 3. EnvironmentalTrap: Armadilhas com telégrafo visual, ativação e dano autoritativo.
 * 4. EnvironmentalPuzzle: Quebra-cabeça modular de sequência rúnica/cristalina.
 * 5. EnvironmentalAtmosphere: Tochas, brasas, fumaça e partículas discretas por bioma.
 */

export class EnvironmentalChest {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} options
   */
  constructor(scene, x, y, options = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.rarity = options.rarity || 'rare'; // 'common', 'rare', 'epic', 'legendary'
    this.rewardGold = options.gold || (this.rarity === 'legendary' ? 120 : this.rarity === 'epic' ? 75 : 40);
    this.opened = false;

    const texKey = options.texture || (this.rarity === 'epic' || this.rarity === 'legendary' ? 'chest-epic' : 'chest-rare');
    const baseTex = scene.textures.exists(texKey) ? texKey : 'chest';
    
    // Imagem do Baú
    this.sprite = scene.add.image(x, y, baseTex).setOrigin(0.5, 1).setDepth(y).setScale(0.9);

    // Aura sutil indicativa de raridade
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

    // Zona de interação (32px de raio)
    this.radius = options.radius || 32;
  }

  isPlayerNear(player) {
    if (!player || this.opened) return false;
    const dist = Math.hypot(player.x - this.x, player.y - this.y);
    return dist <= this.radius;
  }

  open(player) {
    if (this.opened) return false;
    this.opened = true;

    // Parar brilho fechado
    if (this.pulseTween) this.pulseTween.stop();
    if (this.glow) {
      this.scene.tweens.add({
        targets: this.glow,
        alpha: 0,
        scale: 0.4,
        duration: 300,
        onComplete: () => this.glow.destroy()
      });
    }

    // Trocar textura para aberto
    const openTex = `${this.sprite.texture.key}-open`;
    if (this.scene.textures.exists(openTex)) {
      this.sprite.setTexture(openTex);
    } else {
      // Efeito de pulso de abertura se não houver sprite aberto separado
      this.scene.tweens.add({
        targets: this.sprite,
        scaleY: 0.75,
        duration: 120,
        yoyo: true
      });
    }

    // Áudio oficial
    this.scene.game?.audioEngine?.sfx?.('sfx-chest-open');

    // Partículas de moedas/ouro reluzente
    for (let i = 0; i < 8; i++) {
      const sparkle = this.scene.add.rectangle(
        this.x + (Math.random() - 0.5) * 20,
        this.y - 10,
        2, 2,
        0xffd700
      ).setDepth(this.y + 2);

      this.scene.tweens.add({
        targets: sparkle,
        y: this.y - 30 - Math.random() * 20,
        x: sparkle.x + (Math.random() - 0.5) * 25,
        alpha: 0,
        duration: 500 + Math.random() * 300,
        ease: 'Cubic.easeOut',
        onComplete: () => sparkle.destroy()
      });
    }

    // Conceder recompensa oficial
    if (this.scene.player) {
      if (typeof this.scene.gold === 'number') {
        this.scene.gold += this.rewardGold;
      }
      if (this.scene.banner) {
        this.scene.banner(`+${this.rewardGold} OURO`, '#ffd700');
      }
    }

    return true;
  }
}

export class EnvironmentalLever {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Function} onActivate
   * @param {Object} options
   */
  constructor(scene, x, y, onActivate, options = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.onActivate = onActivate;
    this.activated = false;
    this.id = options.id || `lever_${x}_${y}`;

    // Base da alavanca com pedestal de pedra
    this.base = scene.add.rectangle(x, y + 4, 14, 6, 0x2a221b)
      .setStrokeStyle(1, 0x4a3a2a)
      .setDepth(y);

    // Haste da alavanca
    this.stick = scene.add.rectangle(x, y - 2, 3, 12, 0xa08060)
      .setOrigin(0.5, 0.9)
      .setRotation(-0.35)
      .setDepth(y + 1);

    // Pomo luminoso no topo
    this.knob = scene.add.circle(x - 3, y - 10, 3, 0xff4422)
      .setDepth(y + 2);

    this.radius = 28;
  }

  isPlayerNear(player) {
    if (!player || this.activated) return false;
    return Math.hypot(player.x - this.x, player.y - this.y) <= this.radius;
  }

  toggle() {
    if (this.activated) return false;
    this.activated = true;

    // Animação mecânica de virar a alavanca
    this.scene.tweens.add({
      targets: this.stick,
      rotation: 0.35,
      duration: 180,
      ease: 'Back.easeOut'
    });

    this.scene.tweens.add({
      targets: this.knob,
      x: this.x + 3,
      duration: 180,
      ease: 'Back.easeOut'
    });

    // Mudar a cor do pomo para verde/azul ativo
    this.knob.setFillStyle(0x00ff88);

    // Flash sonoro mecânico
    this.scene.game?.audioEngine?.sfx?.('sfx-lever') || this.scene.sound?.play?.('sfx-weapon-sword');

    if (this.scene.effects?.shockwaveRing) {
      this.scene.effects.shockwaveRing(this.x, this.y, 14);
    }

    if (typeof this.onActivate === 'function') {
      this.onActivate(this);
    }

    return true;
  }
}

export class EnvironmentalTrap {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {Object} options
   */
  constructor(scene, x, y, options = {}) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.damage = options.damage || 1;
    this.cooldownMs = options.cooldownMs || 2200;
    this.state = 'armed'; // 'armed', 'triggering', 'firing', 'cooldown'
    this.lastFireTime = 0;

    // Placa de pressão no chão
    this.plate = scene.add.rectangle(x, y, 22, 22, 0x1d1814)
      .setStrokeStyle(1, 0x3d3024)
      .setDepth(1);

    // Orifícios de espinhos
    this.holes = scene.add.graphics().setDepth(2);
    this.holes.fillStyle(0x0a0806, 0.9);
    for (let dx = -6; dx <= 6; dx += 6) {
      for (let dy = -6; dy <= 6; dy += 6) {
        this.holes.fillCircle(x + dx, y + dy, 1.5);
      }
    }

    // Telégrafo de perigo (luz de aviso)
    this.warningLight = scene.add.circle(x, y, 4, 0xff2200, 0)
      .setDepth(3);

    this.radius = 16;
  }

  update(time, player) {
    if (!player || player.dead || this.state === 'cooldown' || this.state === 'firing') return;

    const dist = Math.hypot(player.x - this.x, player.y - this.y);

    if (dist <= this.radius && this.state === 'armed') {
      this.trigger(player);
    }
  }

  trigger(player) {
    this.state = 'triggering';

    // Telégrafo visual: pisca aviso vermelho por 350ms antes de disparar espinhos
    this.scene.tweens.add({
      targets: this.warningLight,
      alpha: { from: 0.2, to: 0.8 },
      duration: 120,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.fire(player);
      }
    });
  }

  fire(player) {
    this.state = 'firing';

    // Disparo de espinhos pontiagudos
    const spikes = this.scene.add.graphics().setDepth(this.y + 4);
    spikes.fillStyle(0xc0c8d8, 1);
    for (let dx = -6; dx <= 6; dx += 6) {
      for (let dy = -6; dy <= 6; dy += 6) {
        spikes.beginPath();
        spikes.moveTo(this.x + dx - 2, this.y + dy + 2);
        spikes.lineTo(this.x + dx, this.y + dy - 10);
        spikes.lineTo(this.x + dx + 2, this.y + dy + 2);
        spikes.closePath();
        spikes.fill();
      }
    }

    // Som de impacto
    this.scene.game?.audioEngine?.sfx?.('sfx-trap-spike') || this.scene.sound?.play?.('sfx-weapon-axe');

    // Se o jogador ainda estiver na área, recebe dano autoritativo do combate
    if (player && !player.dead) {
      const dist = Math.hypot(player.x - this.x, player.y - this.y);
      if (dist <= this.radius + 6) {
        if (typeof player.takeDamage === 'function') {
          player.takeDamage(this.damage, { x: 0, y: 0 });
        } else if (typeof player.hp === 'number') {
          player.hp = Math.max(0, player.hp - this.damage);
          this.scene.game?.events?.emit('hud:hp', player.hp, player.maxHp || 10);
          this.scene.effects?.burstTinted?.(player.x, player.y, 0xff2200, 8);
        }
      }
    }

    // Recolhimento dos espinhos e início do cooldown
    this.scene.time.delayedCall(400, () => {
      this.scene.tweens.add({
        targets: spikes,
        scaleY: 0,
        duration: 180,
        onComplete: () => {
          spikes.destroy();
          this.warningLight.setAlpha(0);
          this.state = 'cooldown';
          this.scene.time.delayedCall(this.cooldownMs, () => {
            this.state = 'armed';
          });
        }
      });
    });
  }
}

export class EnvironmentalPuzzle {
  /**
   * Quebra-cabeça de ativação sequencial de totens cristalinos.
   * @param {Phaser.Scene} scene
   * @param {number} cx - Centro X
   * @param {number} cy - Centro Y
   * @param {Object} options
   */
  constructor(scene, cx, cy, options = {}) {
    this.scene = scene;
    this.cx = cx;
    this.cy = cy;
    this.solved = false;
    this.playerSequence = [];
    
    // Sequência canônica: 0 (Azul), 1 (Dourado), 2 (Roxo)
    this.expectedSequence = options.sequence || [0, 1, 2];
    this.colors = [0x00e5ff, 0xffd700, 0xbb44ff];
    this.totems = [];

    // Desenhar runas indicativas no chão (pistas visuais legíveis)
    const sigil = scene.add.circle(cx, cy, 38, 0x000000, 0.35)
      .setStrokeStyle(1.5, 0x4a4030)
      .setDepth(1);

    // Criar 3 totens dispostos em triângulo
    const radius = 28;
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
      const tx = cx + Math.cos(angle) * radius;
      const ty = cy + Math.sin(angle) * radius;

      // Base do totem
      const base = scene.add.rectangle(tx, ty, 14, 18, 0x26201a)
        .setStrokeStyle(1, 0x4d3e2a)
        .setDepth(ty);

      // Cristal no topo
      const crystal = scene.add.polygon(tx, ty - 12, [0, -6, 4, 0, 0, 6, -4, 0], this.colors[i])
        .setAlpha(0.4)
        .setDepth(ty + 1);

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
    if (totem.lit) return; // Já aceso

    totem.lit = true;
    this.playerSequence.push(index);

    // Acender o cristal com brilho pleno
    this.scene.tweens.add({
      targets: totem.crystal,
      alpha: 1,
      scale: 1.25,
      duration: 180
    });

    this.scene.game?.audioEngine?.sfx?.('sfx-rune-chime') || this.scene.sound?.play?.('sfx-weapon-sword');

    // Verificar se a sequência parcial está correta
    const step = this.playerSequence.length - 1;
    if (this.playerSequence[step] !== this.expectedSequence[step]) {
      // Errou a sequência: reset suave após breve telégrafo
      this.scene.time.delayedCall(400, () => this.resetPuzzle());
      return;
    }

    // Se completou todos os passos corretamente
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
    // Efeito sonoro de falha sutil
    this.scene.cameras?.main?.shake?.(0.003, 100);
  }

  onSuccess() {
    // Efeito de conclusão triunfante
    if (this.scene.effects?.shockwaveRing) {
      this.scene.effects.shockwaveRing(this.cx, this.cy, 36);
    }
    this.scene.game?.audioEngine?.sfx?.('sfx-puzzle-solved');

    // Baú secreto surge no centro
    const secretChest = new EnvironmentalChest(this.scene, this.cx, this.cy + 10, {
      rarity: 'epic',
      gold: 90
    });

    if (typeof this.onSolveCallback === 'function') {
      this.onSolveCallback(secretChest);
    }
  }
}

export class EnvironmentalAtmosphere {
  /**
   * Adiciona tochas vivas com iluminação suave e brasas discretas.
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   */
  static addTorch(scene, x, y) {
    if (!scene || !scene.add) return null;

    // Suporte da tocha
    const stick = scene.add.rectangle(x, y + 4, 3, 10, 0x4a3420).setDepth(y);
    
    // Chama animada (2 pixels pulsantes)
    const flame = scene.add.circle(x, y - 3, 3, 0xff8811, 0.95).setDepth(y + 1);
    const innerFlame = scene.add.circle(x, y - 4, 1.5, 0xffee44, 1).setDepth(y + 2);

    // Oscilação natural de fogo
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

    // Luz ambiente suave
    const light = scene.add.circle(x, y - 2, 28, 0xff9922, 0.12).setDepth(1);
    if (scene.renderer && scene.renderer.type === 1) {
      light.setBlendMode(Phaser.BlendModes.ADD);
    }

    return { flame, innerFlame, light };
  }
}

if (typeof window !== 'undefined') {
  window.DEPTHGATE_ENVIRONMENTAL = {
    EnvironmentalChest,
    EnvironmentalLever,
    EnvironmentalTrap,
    EnvironmentalPuzzle,
    EnvironmentalAtmosphere
  };
}
