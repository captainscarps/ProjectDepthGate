"""
Melhoria orgânica do Dragão Pálido (Vulcão de Cinzas):
- Mapeamento de animações fiel à spritesheet 2048x2304 (frames 0 a 64)
- Sons restaurados para cada golpe (mordida, garras, sopro, cauda, rugido, meteoro, voo, pouso)
- Movimentação orgânica predatória (inércia com aceleração suave, stalking em arco e posicionamento tático)
- Bote e garras com impulso físico para frente (lunge real em vez de estático)
- Sopro de cinzas espectrais contínuo em leque com partículas de cinza e brasas
- Voo e mergulho aéreo contínuo (swoop suave dos céus até o solo sem teletransporte)
- Recuperação viva com baforadas de fumaça e transição natural
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")

s = open(BUNDLE, encoding="utf-8").read()

# --------------------------------------------------------------------------
# 1. ATUALIZAR DEFINIÇÃO DO Yt.PALE_DRAGON
# --------------------------------------------------------------------------
NEW_PALE_DRAGON = '''Yt.PALE_DRAGON || (Yt.PALE_DRAGON = {
  ...Yt.DRAGON_ANCIENT,
  name: "Dragão Pálido",
  subtitle: "O Pesadelo Espectral dos Céus",
  texture: "boss-pale-dragon",
  scale: 1.35,
  bodySize: 58,
  bodyCenterY: 185,
  shadowOffY: 65,
  maxHp: 130,
  contactDamage: 4,
  speed: 70,
  xp: 1800,
  gold: { min: 280, max: 450 },
  attackCooldownMs: 1400,
  attacks: {
    BITE: { damage: 4, range: 74, width: 68, maxDist: 125, telegraphMs: 460, recoverMs: 380, sound: "sfx-ancient-dragon-bite" },
    CLAW: { damage: 3, range: 66, width: 120, maxDist: 110, telegraphMs: 500, recoverMs: 420, sound: "sfx-ancient-dragon-claw" },
    FIRE_BREATH: { damage: 5, length: 240, width: 92, minDist: 50, telegraphMs: 780, recoverMs: 650, sound: "sfx-ancient-dragon-fire" },
    TAIL_SWEEP: { damage: 4, radius: 130, maxDist: 150, telegraphMs: 700, recoverMs: 520, sound: "sfx-ancient-dragon-tail" },
    ROAR: { damage: 2, radius: 180, maxDist: 200, telegraphMs: 550, recoverMs: 480, knockback: 3, sound: "sfx-ancient-dragon-roar" },
    FIRE_METEOR: { damage: 4, radius: 50, count: 6, spread: 160, telegraphMs: 800, staggerMs: 150, recoverMs: 580, sound: "sfx-ancient-dragon-meteor" },
    FLYOVER: { damage: 5, landRadius: 120, flyMs: 1700, telegraphMs: 800, recoverMs: 700, minDist: 0, sound: "sfx-ancient-dragon-fly" }
  },
  attackPools: {
    1: ["BITE", "CLAW", "FIRE_BREATH"],
    2: ["BITE", "CLAW", "FIRE_BREATH", "TAIL_SWEEP", "ROAR", "FIRE_METEOR"],
    3: ["FIRE_BREATH", "TAIL_SWEEP", "ROAR", "FIRE_METEOR", "FLYOVER"]
  },
  phases: [
    { at: 0.65, label: "FASE 2 - ASAS DE CINZA", speedMult: 1.25, cooldownMult: 0.75, damageMult: 1.25, tint: 0xe2e8f0, ambient: 0.95 },
    { at: 0.30, label: "FUROR ESPECTRAL", speedMult: 1.4, cooldownMult: 0.55, damageMult: 1.45, tint: 0xcfd8dc, ambient: 1.0 }
  ],
  anims: {
    idle: { frames: [0, 1, 2, 3, 4, 5, 6], frameRate: 6, repeat: -1 },
    walk: { frames: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], frameRate: 10, repeat: -1 },
    attack: { frames: [19, 20, 21, 22], frameRate: 8, repeat: 0 },
    strike: { frames: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32], frameRate: 12, repeat: 0 },
    windup: { frames: [19, 20, 21, 22], frameRate: 8, repeat: 0 },
    breath: { frames: [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], frameRate: 11, repeat: 0 },
    fly: { frames: [48, 49, 50, 51, 52, 53, 54, 55], frameRate: 9, repeat: -1 },
    hurt: { frames: [58, 59, 60, 61], frameRate: 10, repeat: 0 },
    death: { frames: [62, 63, 64], frameRate: 5, repeat: 0 },
    phase: { frames: [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], frameRate: 12, repeat: 0 },
    special: { frames: [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], frameRate: 10, repeat: -1 }
  }
});'''

# Substitui o bloco antigo de Yt.PALE_DRAGON
start_pos = s.find("Yt.PALE_DRAGON || (Yt.PALE_DRAGON = {")
assert start_pos != -1, "Yt.PALE_DRAGON não encontrado"
end_pos = s.find("Yt.CERBERUS ||", start_pos)
assert end_pos != -1, "Yt.CERBERUS não encontrado"

# Manter o que houver entre o final de PALE_DRAGON e Yt.CERBERUS
s = s[:start_pos] + NEW_PALE_DRAGON + "\n\n" + s[end_pos:]

# --------------------------------------------------------------------------
# 2. INJETAR EXTENSÕES ORGÂNICAS EM hh.prototype
# --------------------------------------------------------------------------
DRAGON_AI_HOOKS = '''
/* === DRAGÃO PÁLIDO: COMPORTAMENTO ORGÂNICO, FÍSICA E COMBOS === */
(function() {
  const _origChase = hh.prototype.doChase;
  hh.prototype.doChase = function(player) {
    if (this.typeKey === "PALE_DRAGON" && !player.dead) {
      const tx = player.x - this.x;
      const ty = player.y - this.y;
      const dist = Math.hypot(tx, ty) || 1;
      const spd = this.data_.speed * this.mult("speedMult");

      let targetVx = (tx / dist) * spd;
      let targetVy = (ty / dist) * spd;

      // Stalking predatório em arco: a média distância (75..175px), o dragão cerca e flanqueia
      if (dist >= 75 && dist <= 175) {
        const timeSec = (this.scene.time?.now || 0) * 0.0028;
        const perpX = -ty / dist;
        const perpY = tx / dist;
        const curve = Math.sin(timeSec) * 0.42;
        targetVx = (tx / dist * 0.82 + perpX * curve) * spd;
        targetVy = (ty / dist * 0.82 + perpY * curve) * spd;
      } else if (dist < 75) {
        // Muito próximo: desacelera e estabiliza postura para atacar
        targetVx *= 0.35;
        targetVy *= 0.35;
      }

      // Inércia natural e aceleração com massa
      const currentVx = this.body?.velocity?.x || 0;
      const currentVy = this.body?.velocity?.y || 0;
      this.setVelocity(
        currentVx * 0.74 + targetVx * 0.26,
        currentVy * 0.74 + targetVy * 0.26
      );

      this.setFlipX(tx < 0);
      if (this.attackCooldown <= 0) {
        this.chooseAttack(player, dist);
      }
      return;
    }
    return _origChase.call(this, player);
  };

  const _origFrontal = hh.prototype.executeFrontal;
  hh.prototype.executeFrontal = function(atkKey) {
    if (this.typeKey === "PALE_DRAGON" && !this.dead && this.slamArea) {
      // Impulso físico real (bote predatório avançando no jogador)
      const rot = this.slamArea.rot;
      const lungeSpeed = atkKey === "BITE" ? 210 : 150;
      this.setVelocity(Math.cos(rot) * lungeSpeed, Math.sin(rot) * lungeSpeed);
      this.scene.tweens?.add({
        targets: this.body.velocity,
        x: 0,
        y: 0,
        duration: 250,
        ease: "Cubic.easeOut"
      });
      // Partículas espectrais de cinza e brasas
      this.scene.effects?.burstTinted?.(this.slamArea.cx, this.slamArea.cy, 0xd0e8f2, 14);
      this.scene.effects?.burstTinted?.(this.slamArea.cx, this.slamArea.cy, 0xff7733, 8);
    }
    return _origFrontal.call(this, atkKey);
  };

  const _origBreath = hh.prototype.executeFireBreath;
  hh.prototype.executeFireBreath = function(dir) {
    if (this.typeKey === "PALE_DRAGON" && !this.dead && this.slamArea) {
      const atk = this.data_.attacks.FIRE_BREATH;
      const player = this.scene.player;
      const area = this.slamArea;

      // Reproduzir som e animação de sopro com asas erguidas
      this.scene.audioRef?.play?.("sfx-ancient-dragon-fire");
      if (this.data_.anims?.breath) this.play(`${this.data_.texture}-breath`, true);

      // Jato contínuo e fluído de sopro em 5 ondas durante 600ms
      const totalWaves = 5;
      for (let w = 0; w < totalWaves; w++) {
        this.scene.time.delayedCall(w * 115, () => {
          if (this.dead) return;
          const sweepSpread = (w / (totalWaves - 1) - 0.5) * 0.32;
          const waveRot = area.rot + sweepSpread;
          const fx = Math.cos(waveRot);
          const fy = Math.sin(waveRot);
          this.scene.cameraSys?.shake?.(0.0035, 80);

          // Puffs de fogo e cinza espectral se expandindo em cone
          for (let p = 1; p <= 6; p++) {
            const dist = (p / 6) * atk.length;
            const px = this.x + fx * dist + (Math.random() - 0.5) * 20;
            const py = this.y + fy * dist + (Math.random() - 0.5) * 20;
            const tint = (p + w) % 3 === 0 ? 0xd0e8f2 : ((p + w) % 2 === 0 ? 0xff7733 : 0x94a3b8);
            this.scene.effects?.burstTinted?.(px, py, tint, 6);
          }

          // Checagem de dano fatiada por pulso
          if (!player.dead && this.scene.damageSystem?.rectHit(area.cx, area.cy, area.w, area.h + 14, waveRot, player.x, player.y)) {
            const dmgPart = Math.max(1, Math.round(this.scaledDamage(atk.damage) / 2));
            this.hitPlayer(dmgPart, { x: fx, y: fy });
          }
        });
      }
      this.recover(atk.recoverMs);
      return;
    }
    return _origBreath.call(this, dir);
  };

  const _origLanding = hh.prototype.executeLanding;
  hh.prototype.executeLanding = function(targetX, targetY, flyAtk) {
    if (this.typeKey === "PALE_DRAGON" && !this.dead) {
      // Mergulho aéreo dinâmico (swoop suave vindo da posição atual no céu)
      const dist = Math.hypot(targetX - this.x, targetY - this.y);
      const diveDuration = Math.min(300, Math.max(160, dist * 1.1));

      this.scene.tweens?.add({
        targets: this,
        x: targetX,
        y: targetY,
        duration: diveDuration,
        ease: "Quad.easeIn",
        onComplete: () => {
          if (this.dead) return;
          this.clampToArena();
          this.flying = false;
          this.body.checkCollision.none = false;
          const p = this.scene.player;
          this.setFlipX(p.x < this.x);

          this.scene.tweens?.add({ targets: this, scaleX: this.data_.scale, scaleY: this.data_.scale, duration: 200 });
          this.scene.tweens?.add({ targets: this.shadow, alpha: 0.5, scaleX: this.displayWidth / 30, scaleY: this.displayWidth / 30, duration: 200 });
          this.scene.audioRef?.play?.("sfx-ancient-dragon-land");

          // Ondas de choque sísmicas e poeira vulcânica
          this.scene.effects?.shockwaveRing?.(targetX, targetY, flyAtk.landRadius);
          this.scene.effects?.shockwaveRing?.(targetX, targetY, flyAtk.landRadius * 0.55);
          this.scene.effects?.burstTinted?.(targetX, targetY, 0xd0e8f2, 26);
          this.scene.effects?.burstTinted?.(targetX, targetY, 0xff7733, 18);
          this.scene.effects?.hitStop?.(80);
          this.scene.cameraSys?.shake?.(0.012, 360);

          if (!p.dead && this.scene.damageSystem?.circleHit(targetX, targetY, flyAtk.landRadius, p.x, p.y, p.body.width / 2)) {
            const d = Math.hypot(p.x - targetX, p.y - targetY) || 1;
            this.hitPlayer(this.scaledDamage(flyAtk.damage), { x: (p.x - targetX) / d, y: (p.y - targetY) / d });
          }
          this.recover(flyAtk.recoverMs);
        }
      });
      return;
    }
    return _origLanding.call(this, targetX, targetY, flyAtk);
  };

  const _origRecover = hh.prototype.recover;
  hh.prototype.recover = function(ms) {
    if (this.typeKey === "PALE_DRAGON") {
      this.scene.tweens?.add({
        targets: this.body?.velocity,
        x: 0,
        y: 0,
        duration: 220,
        ease: "Sine.easeOut"
      });
      // Baforada sutil de cinzas no focinho
      this.scene.effects?.burstTinted?.(this.x, this.y - (this.displayHeight || 60) * 0.22, 0x94a3b8, 3);
    }
    return _origRecover.call(this, ms);
  };
})();
'''

# Injetar DRAGON_AI_HOOKS logo após a definição de class hh
if "/* === DRAGÃO PÁLIDO: COMPORTAMENTO ORGÂNICO" not in s:
    marker = "this.debugGfx?.destroy(),this.shadow.destroy(),this.destroy()}})}}"
    pos_marker = s.find(marker)
    assert pos_marker != -1, "Marker de fim de class hh não encontrado"
    insert_at = pos_marker + len(marker)
    s = s[:insert_at] + DRAGON_AI_HOOKS + s[insert_at:]
else:
    # Substituir bloco existente
    start_h = s.find("/* === DRAGÃO PÁLIDO: COMPORTAMENTO ORGÂNICO")
    end_h = s.find("})();\n", start_h) + len("})();\n")
    s = s[:start_h] + DRAGON_AI_HOOKS + s[end_h:]

# Salvar no bundle e no mirror
for p in (BUNDLE, MIRROR):
    if os.path.exists(os.path.dirname(p)):
        with open(p, "w", encoding="utf-8") as f:
            f.write(s)
print(f"[OK] Melhorias orgânicas do Dragão Pálido aplicadas com sucesso em {BUNDLE} e {MIRROR}!")
