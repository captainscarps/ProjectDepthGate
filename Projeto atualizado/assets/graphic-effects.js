/**
 * DEPTHGATE — Módulo de Efeitos Gráficos Profissionais (Pixel-Art Premium)
 * 
 * Implementa efeitos modulares, de alto desempenho e reutilizáveis utilizando
 * os recursos nativos do Phaser 4 (BlendModes, TintModes, Tweens, Particles e Shaders leves).
 * 
 * Todos os efeitos possuem fallback automático e preservam a nitidez pixel-perfect
 * sem filtros de desfoque global que comprometam a arte em pixel art.
 */

export class GraphicEffects {
  /**
   * Aplica efeito de brilho pulsante em uma arma mágica/lendária.
   * Utiliza BlendModes.ADD e tween nativo com fallback de tintura.
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.Image|Phaser.GameObjects.Sprite} weaponSprite
   * @param {number} color - Cor hexadecimal (ex: 0x8a40ff para épico, 0xffd700 para lendário)
   * @param {number} [intensity=0.4] - Intensidade do brilho
   */
  static applyWeaponGlow(scene, weaponSprite, color = 0xc9a24a, intensity = 0.45) {
    if (!scene || !weaponSprite || !weaponSprite.active) return null;

    // Criar um clone do sprite como camada de brilho aditiva
    const glow = scene.add.image(weaponSprite.x, weaponSprite.y, weaponSprite.texture.key, weaponSprite.frame?.name);
    glow.setOrigin(weaponSprite.originX, weaponSprite.originY);
    glow.setScale(weaponSprite.scaleX * 1.08, weaponSprite.scaleY * 1.08);
    glow.setRotation(weaponSprite.rotation);
    glow.setTint(color);
    glow.setAlpha(intensity);
    glow.setDepth(weaponSprite.depth + 1);

    // Phaser 4 BlendModes.ADD nativo
    if (scene.renderer && scene.renderer.type === 1) { // 1 = WEBGL
      const addBlend = (typeof Phaser !== 'undefined' && Phaser.BlendModes ? Phaser.BlendModes.ADD : (window.Phaser?.BlendModes?.ADD ?? 1));
      glow.setBlendMode(addBlend);
    }

    const tween = scene.tweens.add({
      targets: glow,
      alpha: { from: intensity * 0.5, to: intensity * 1.2 },
      scaleX: { from: weaponSprite.scaleX * 1.04, to: weaponSprite.scaleX * 1.12 },
      scaleY: { from: weaponSprite.scaleY * 1.04, to: weaponSprite.scaleY * 1.12 },
      duration: 650,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    return {
      glowSprite: glow,
      update: () => {
        if (!weaponSprite.active) {
          glow.destroy();
          return;
        }
        glow.setPosition(weaponSprite.x, weaponSprite.y);
        glow.setRotation(weaponSprite.rotation);
        glow.setVisible(weaponSprite.visible);
      },
      destroy: () => {
        tween.stop();
        glow.destroy();
      }
    };
  }

  /**
   * Dispara um flash de impacto instantâneo (hit flash) de 80ms ao acertar um monstro ou jogador.
   * Utiliza TintModes.FILL ou tint branco com restauração automática de paleta.
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.Sprite|Phaser.GameObjects.Image} target
   * @param {number} [flashColor=0xffffff]
   */
  static playHitFlash(scene, target, flashColor = 0xffffff) {
    if (!scene || !target || !target.setTint) return;

    const originalTint = target.isTinted ? target.tintTopLeft : null;

    // Aplica o flash sólido instantâneo
    target.setTint(flashColor);

    // Partículas de faíscas em pixel art puro (quadrados 2x2 com blend aditivo)
    if (scene.add && scene.add.rectangle) {
      const px = target.x;
      const py = target.y;
      for (let i = 0; i < 5; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 25 + Math.random() * 35;
        const spark = scene.add.rectangle(px, py, 2, 2, flashColor)
          .setDepth(target.depth + 2)
          .setAlpha(0.9);

        if (scene.renderer && scene.renderer.type === 1) {
          const addBlend = (typeof Phaser !== 'undefined' && Phaser.BlendModes ? Phaser.BlendModes.ADD : (window.Phaser?.BlendModes?.ADD ?? 1));
          spark.setBlendMode(addBlend);
        }

        scene.tweens.add({
          targets: spark,
          x: px + Math.cos(angle) * speed,
          y: py + Math.sin(angle) * speed,
          alpha: 0,
          scaleX: 0.2,
          scaleY: 0.2,
          duration: 180 + Math.random() * 90,
          ease: 'Cubic.easeOut',
          onComplete: () => spark.destroy()
        });
      }
    }

    scene.time.delayedCall(80, () => {
      if (!target.active) return;
      if (originalTint !== null) {
        target.setTint(originalTint);
      } else {
        target.clearTint();
      }
    });
  }

  /**
   * Efeito de dissolução para eliminação de inimigos com desintegração em cinzas.
   * @param {Phaser.Scene} scene
   * @param {Phaser.GameObjects.Sprite} target
   * @param {Function} [onComplete]
   */
  static playDissolve(scene, target, onComplete) {
    if (!scene || !target || !target.active) {
      if (onComplete) onComplete();
      return;
    }

    const tx = target.x;
    const ty = target.y;
    const bounds = target.getBounds ? target.getBounds() : { width: 32, height: 32 };

    // Dispersão de cinzas pixeladas para cima
    const count = 12;
    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * bounds.width * 0.8;
      const offsetY = (Math.random() - 0.5) * bounds.height * 0.8;
      const ash = scene.add.rectangle(tx + offsetX, ty + offsetY, 2, 2, 0xd0c0b0)
        .setDepth(target.depth + 1)
        .setAlpha(0.85);

      scene.tweens.add({
        targets: ash,
        y: ty + offsetY - (20 + Math.random() * 30),
        x: tx + offsetX + (Math.random() - 0.5) * 16,
        alpha: 0,
        duration: 400 + Math.random() * 300,
        delay: i * 20,
        ease: 'Sine.easeOut',
        onComplete: () => ash.destroy()
      });
    }

    // Desvanecimento e escala do alvo
    scene.tweens.add({
      targets: target,
      alpha: 0,
      scaleX: target.scaleX * 0.8,
      duration: 350,
      ease: 'Quad.easeIn',
      onComplete: () => {
        if (target.destroy) target.destroy();
        if (onComplete) onComplete();
      }
    });
  }

  /**
   * Efeito de pulso de portal abissal (anéis concêntricos sem blur global).
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {number} [color=0x4a80e0]
   */
  static createPortalVortex(scene, x, y, color = 0x4a80e0) {
    if (!scene || !scene.add) return null;

    const ring = scene.add.graphics().setDepth(2);
    ring.lineStyle(1.5, color, 0.7);
    ring.strokeCircle(x, y, 16);

    const tween = scene.tweens.add({
      targets: ring,
      scaleX: { from: 0.6, to: 1.4 },
      scaleY: { from: 0.6, to: 1.4 },
      alpha: { from: 0.8, to: 0.1 },
      duration: 1200,
      repeat: -1,
      ease: 'Sine.easeOut'
    });

    return {
      ring,
      destroy: () => {
        tween.stop();
        ring.destroy();
      }
    };
  }
}

if (typeof window !== 'undefined') {
  window.DEPTHGATE_GRAPHIC_EFFECTS = GraphicEffects;
}
