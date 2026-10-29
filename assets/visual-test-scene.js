/**
 * DEPTHGATE — VisualTestScene (Cena Isolada de Testes Visuais e Inspeção Gráfica)
 * 
 * Permite inspecionar personagens, armas, armaduras, pontos de ancoragem (sockets),
 * animações frame a frame e sobreposição com o cenário sem interferir na campanha ou no jogo normal.
 */

export function createVisualTestSceneClass() {
  const PhaserScene = (typeof Phaser !== 'undefined' && Phaser.Scene) ||
                      (typeof window !== 'undefined' && window.Phaser && window.Phaser.Scene) ||
                      class {};

  return class VisualTestScene extends PhaserScene {
    constructor() {
      super({ key: 'VisualTestScene' });
    }

    init(data) {
      this.testCharacter = data?.character || 'warrior';
      this.testWeapon = data?.weapon || 'weapon-sword-mk4';
      this.currentAnim = data?.anim || 'idle';
    }

    create() {
      const { width, height } = this.scale;
      const cx = width / 2;
      const cy = height / 2;

      // Fundo neutro com grid técnico sutil para aferição de alinhamento e pixel ratio
      this.add.rectangle(cx, cy, width, height, 0x12100d);
      
      // Grid de referência 16x16
      const gridGraphics = this.add.graphics();
      gridGraphics.lineStyle(1, 0x24201a, 0.4);
      for (let x = 0; x <= width; x += 32) {
        gridGraphics.lineBetween(x, 0, x, height);
      }
      for (let y = 0; y <= height; y += 32) {
        gridGraphics.lineBetween(0, y, width, y);
      }

      // Elemento de cenário para teste de sobreposição e depth sorting (Etapa E)
      this.sceneryObstacle = this.add.rectangle(cx + 42, cy - 8, 32, 48, 0x3d3024)
        .setOrigin(0.5, 0.8)
        .setDepth(cy - 8);
      this.add.text(cx + 42, cy - 36, 'COLUNA', {
        fontFamily: "'Courier New', monospace",
        fontSize: '8px',
        color: '#c9a24a'
      }).setOrigin(0.5);

      // Chão e sombra de contato
      this.contactShadow = this.add.ellipse(cx, cy + 18, 28, 9, 0x000000, 0.45);

      // Container do personagem de teste
      this.charContainer = this.add.container(cx, cy).setDepth(cy);

      // Carregar spritesheet e layout do personagem
      const sheetKey = `${this.testCharacter}-mk4`;
      const layoutKey = `${sheetKey}-layout`;
      const layout = this.cache?.json?.get(layoutKey) || { frameW: 48, frameH: 60, scale: 1 };

      // Sprite do corpo
      const bodyTexKey = this.textures.exists(`${sheetKey}-body`) ? `${sheetKey}-body` : sheetKey;
      this.heroSprite = this.add.sprite(0, 0, bodyTexKey, 0);
      this.charContainer.add(this.heroSprite);

      // Sprite da arma acoplada ao socket
      const weaponTexKey = this.textures.exists(this.testWeapon) ? this.testWeapon : 'weapon-sword';
      this.weaponSprite = this.add.image(10, 5, weaponTexKey).setOrigin(0.15, 0.5);
      this.charContainer.add(this.weaponSprite);

      // Marcador visual de Socket (guia de inspeção)
      this.socketMarker = this.add.circle(10, 5, 2, 0x00ffcc, 0.9).setDepth(10);
      this.charContainer.add(this.socketMarker);

      // Título e Rótulo de Status
      this.hudText = this.add.text(16, 16, `PALCO DE TESTES VISUAIS — DEPTHGATE\nClasse: ${this.testCharacter.toUpperCase()} | Arma: ${this.testWeapon} | Estado: ${this.currentAnim.toUpperCase()}`, {
        fontFamily: "'Courier New', monospace",
        fontSize: '10px',
        color: '#e8d9a0',
        backgroundColor: '#0a0806aa',
        padding: { x: 6, y: 4 }
      });

      // Iniciar animação solicitada se existir
      const fullAnimKey = `${sheetKey}-${this.currentAnim}`;
      if (this.anims?.exists(fullAnimKey)) {
        this.heroSprite.play(fullAnimKey);
      }

      // Expor método de troca de parâmetros para automação de capturas
      window.__DEPTHGATE_VISUAL_TEST = {
        setAnimation: (anim) => {
          this.currentAnim = anim;
          const key = `${sheetKey}-${anim}`;
          if (this.anims?.exists(key)) {
            this.heroSprite.play(key);
          }
          this.updateHud();
        },
        setWeapon: (weaponKey) => {
          this.testWeapon = weaponKey;
          if (this.textures?.exists(weaponKey)) {
            this.weaponSprite.setTexture(weaponKey);
          }
          this.updateHud();
        },
        setPosition: (x, y) => {
          this.charContainer.setPosition(x, y);
          this.charContainer.setDepth(y);
          this.contactShadow.setPosition(x, y + 18);
        },
        triggerMagicGlow: () => {
          if (window.DEPTHGATE_GRAPHIC_EFFECTS) {
            window.DEPTHGATE_GRAPHIC_EFFECTS.applyWeaponGlow(this, this.weaponSprite, 0x4a90e2, 0.6);
          }
        },
        triggerHitImpact: () => {
          if (window.DEPTHGATE_GRAPHIC_EFFECTS) {
            window.DEPTHGATE_GRAPHIC_EFFECTS.playHitFlash(this, this.heroSprite, 0xffffff);
          }
        }
      };
    }

    updateHud() {
      if (this.hudText) {
        this.hudText.setText(`PALCO DE TESTES VISUAIS — DEPTHGATE\nClasse: ${this.testCharacter.toUpperCase()} | Arma: ${this.testWeapon} | Estado: ${this.currentAnim.toUpperCase()}`);
      }
    }
  };
}

if (typeof window !== 'undefined') {
  window.DEPTHGATE_VISUAL_TEST_SCENE = createVisualTestSceneClass;
}
