/**
 * DEPTHGATE — Catálogo Centralizado de Animações e Sistema de Sockets (Phaser 4)
 * 
 * Define convenções canônicas, estados de animação, framerate, loops,
 * pontos de ancoragem (sockets) e eventos visuais desacoplados da autoridade de combate.
 * 
 * NOTA ARQUITETURAL SOBRE O COMBATE:
 * O combate do DEPTHGATE é estritamente AUTORITATIVO pelo CombatSystem.
 * A animação NUNCA determina por conta própria se um ataque atingiu um alvo.
 * Os eventos deste catálogo (ex: 'anim:hit-frame') são disparados exclusivamente para
 * feedback sensorial síncrono (partículas, faíscas, telas tremerem e SFX).
 */

/**
 * Definições canônicas de estados de animação de personagens.
 */
export const ANIMATION_STATES = Object.freeze({
  IDLE: 'idle',
  IDLE_VAR: 'idlevar',
  WALK: 'walk',
  RUN: 'run',
  WINDUP: 'windup',
  HIT: 'hit',
  RECOVERY: 'recovery',
  GUARD_START: 'guardStart',
  GUARD: 'guard',
  HURT: 'hurt',
  STUN: 'stun',
  DASH: 'dash',
  CAST: 'cast',
  DEATH: 'death',
  UP: 'up'
});

/**
 * Configurações padrão de velocidade e loop de cada estado de animação.
 */
export const ANIMATION_CONFIGS = Object.freeze({
  [ANIMATION_STATES.IDLE]: {
    frameRate: 6,
    repeat: -1, // Loop infinito
    description: 'Postura de repouso básica com respiração sutil'
  },
  [ANIMATION_STATES.IDLE_VAR]: {
    frameRate: 6,
    repeat: 0, // Executa uma vez e volta para IDLE
    description: 'Variação sutil de postura em repouso (ajuste de postura, olhar)'
  },
  [ANIMATION_STATES.WALK]: {
    frameRate: 10,
    repeat: -1,
    description: 'Passo tático com cadência estável'
  },
  [ANIMATION_STATES.RUN]: {
    frameRate: 14,
    repeat: -1,
    description: 'Corrida veloz com inclinação corporal aerodinâmica'
  },
  [ANIMATION_STATES.WINDUP]: {
    frameRate: 12,
    repeat: 0,
    description: 'Preparação do ataque, erguendo a arma ou concentrando golpe'
  },
  [ANIMATION_STATES.HIT]: {
    frameRate: 16,
    repeat: 0,
    description: 'Liberação rápida do golpe com disparo do evento de impacto'
  },
  [ANIMATION_STATES.RECOVERY]: {
    frameRate: 10,
    repeat: 0,
    description: 'Retorno gradual da arma para a guarda neutra'
  },
  [ANIMATION_STATES.GUARD_START]: {
    frameRate: 14,
    repeat: 0,
    description: 'Transição rápida para erguer o escudo'
  },
  [ANIMATION_STATES.GUARD]: {
    frameRate: 4,
    repeat: -1,
    description: 'Postura defensiva ativa com escudo erguido'
  },
  [ANIMATION_STATES.HURT]: {
    frameRate: 12,
    repeat: 0,
    description: 'Reação a impacto recebido com recuo físico'
  },
  [ANIMATION_STATES.STUN]: {
    frameRate: 6,
    repeat: -1,
    description: 'Atordoamento com perda temporária de controle'
  },
  [ANIMATION_STATES.DASH]: {
    frameRate: 18,
    repeat: 0,
    description: 'Deslocamento evasivo ultrarrápido com rastro de sombra'
  },
  [ANIMATION_STATES.CAST]: {
    frameRate: 10,
    repeat: 0,
    description: 'Conjuração mágica com canalização de energia cósmica/elemental'
  },
  [ANIMATION_STATES.DEATH]: {
    frameRate: 8,
    repeat: 0,
    description: 'Queda ao solo e persistência no chão'
  }
});

/**
 * Convenção canônica de sockets (pontos de ancoragem) para acoplamento dinâmico de equipamentos.
 */
export const SOCKET_TYPES = Object.freeze({
  WEAPON_PRIMARY: 'weapon_primary',     // Mão principal (espada, cajado, arco, machado)
  WEAPON_SECONDARY: 'weapon_secondary', // Mão inábil (adaga dupla, escudo)
  HEAD: 'head',                         // Elmos, tiaras, capuzes
  CHEST: 'chest',                       // Armaduras, mantos, peitorais
  FEET: 'feet',                         // Botas, sombras de contato
  FX_CENTER: 'fx_center'                // Ponto focal para auras, explosões e magias
});

/**
 * Catálogo mestre com utilitários de animação e compatibilidade.
 */
export class AnimationCatalog {
  /**
   * Obtém a chave canônica de animação para um personagem e estado.
   * Exemplo: getAnimKey('warrior-mk4', 'walk') -> 'warrior-mk4-walk'
   */
  static getAnimKey(characterKey, animState) {
    return `${characterKey}-${animState}`;
  }

  /**
   * Valida a compatibilidade técnica e visual entre um personagem e uma arma equipada.
   * @param {Object} classDef - Definição da classe do personagem (ex: Guerreiro, Arqueiro)
   * @param {Object} weaponDef - Definição da arma com grip, animações e entrega
   * @param {Object} layoutJson - Layout JSON do personagem com frames e sockets
   * @returns {{ compatible: boolean, reasons: string[] }}
   */
  static validateCompatibility(classDef, weaponDef, layoutJson) {
    const reasons = [];

    if (!classDef || !classDef.id) {
      reasons.push('Definição de classe inválida ou sem identificador.');
    }

    if (!weaponDef) {
      reasons.push('Definição de arma nula ou inexistente.');
    } else {
      if (!weaponDef.texture) {
        reasons.push('Arma não especifica textura visual.');
      }
      if (!weaponDef.grip) {
        reasons.push('Arma não define ponto de empunhadura (grip).');
      }
    }

    if (!layoutJson) {
      reasons.push('Layout JSON de personagem não fornecido.');
    } else {
      if (!layoutJson.anchors || layoutJson.anchors.length === 0) {
        reasons.push('Layout do personagem não possui tabela de sockets/anchors para fixação da arma.');
      }
      if (!layoutJson.map || !layoutJson.map.idle) {
        reasons.push('Layout não mapeia a animação base de repouso (idle).');
      }
    }

    return {
      compatible: reasons.length === 0,
      reasons
    };
  }

  /**
   * Calcula as coordenadas e o ângulo de renderização do socket da arma para um dado frame.
   * @param {number} frameIndex - Índice do frame na spritesheet
   * @param {Object} layoutJson - Layout JSON contendo o array 'anchors'
   * @param {Object} weaponGrip - Grip da arma { originX, originY }
   * @param {number} facingSign - 1 para direita, -1 para esquerda
   * @returns {{ x: number, y: number, angle: number }}
   */
  static resolveWeaponSocket(frameIndex, layoutJson, weaponGrip = { originX: 0.15, originY: 0.5 }, facingSign = 1) {
    if (!layoutJson || !Array.isArray(layoutJson.anchors) || !layoutJson.anchors[frameIndex]) {
      return { x: 0, y: 0, angle: 0 };
    }

    const anchor = layoutJson.anchors[frameIndex];
    const frameW = layoutJson.frameW || 48;
    const frameH = layoutJson.frameH || 60;

    // Offset relativo ao centro do sprite do personagem
    const relX = (anchor[0] - frameW / 2) * facingSign;
    const relY = anchor[1] - frameH / 2;

    return {
      x: relX,
      y: relY,
      originX: weaponGrip.originX || 0.15,
      originY: weaponGrip.originY || 0.5
    };
  }

  /**
   * Vincula um evento de animação seguro ao sprite para disparar no frame de impacto,
   * preservando a independência do sistema autoritativo de combate.
   * @param {Phaser.GameObjects.Sprite} sprite - Sprite do herói/inimigo
   * @param {string} animKey - Chave da animação (ex: 'warrior-mk4-hit')
   * @param {number} hitFrameIndex - Frame em que o impacto visual deve ser sincronizado
   * @param {Function} onHitFrame - Callback para acionar efeitos visuais/sonoros
   */
  static attachVisualHitEvent(sprite, animKey, hitFrameIndex, onHitFrame) {
    if (!sprite || !sprite.on) return;

    sprite.on(`animationupdate`, (anim, frame) => {
      if (anim.key === animKey && frame.index === hitFrameIndex) {
        if (typeof onHitFrame === 'function') {
          onHitFrame({
            character: sprite,
            frameIndex: frame.index,
            worldX: sprite.x,
            worldY: sprite.y,
            timestamp: Date.now()
          });
        }
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.DEPTHGATE_ANIMATION_CATALOG = {
    ANIMATION_STATES,
    ANIMATION_CONFIGS,
    SOCKET_TYPES,
    AnimationCatalog
  };
}
