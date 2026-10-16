# -*- coding: utf-8 -*-
"""
Script de melhorias abrangentes v1.9.8:
1. Coração da Floresta:
   - Remove o texto escrito '✦ CORAÇÃO DA FLORESTA ✦' e a faixa de fundo no chão.
   - Remove o banner de anúncio de texto na sala.
   - Acende as fogueiras/braseiros centrais com chamas animadas, brilho pulsante e iluminação quente.
   - Integração com clima: as chamas apagam se estiver chovendo ('storm', 'drizzle', 'rain') e reacendem no tempo limpo.
2. Dragão Pálido:
   - Remove a ação e ataques de voo ('FLYOVER'), mantendo o dragão 100% no solo.
   - Adiciona ataque sísmico no solo ('GROUND_SHATTER') com rachaduras, tremor vulcânico e onda de choque.
   - Comportamento predatório terrestre e investidas orgânicas.
3. Catacumbas e Ruínas:
   - Aumenta a definição e contraste visual de paredes e chão.
   - Ladrilhos da parede com profundidade tridimensional real (rebaixo de argamassa profunda #070503,
     bisel chanfrado duplo no topo com realce especular, chanfro lateral, sombra de oclusão inferior
     e estrias horizontais de cinzelado na pedra).
   - Placas de chão com linhas de argamassa escuras, bordas biseladas nítidas e microtexturas táteis.
   - Paletas aprimoradas para Catacumbas e Ruínas.
4. Salas Secretas:
   - Sala completamente escura (shroud pitch-black) até o jogador entrar.
   - Ao cruzar o limiar e entrar na sala, a escuridão se dissolve suavemente (fade out tween),
     revelando a sala, efeitos arcanos e som de descoberta.
   - Inimigo ELITE garantido dentro de cada sala secreta, pronto para batalha.
5. Bestiário (Irmãs Sátiro):
   - Remove a entrada combinada 'Irmãs Sátiro'.
   - Separa em duas entradas individuais e detalhadas:
     * Kallisto, A Lança de Espinhos (Irmã Sátiro da Fúria Selvagem)
     * Thalia, O Chifre das Sombras (Irmã Sátiro da Tempestade Obscura)
   - Informações, estatísticas, lore próprio, ataques e locais de encontro para cada uma.
   - Preservação e espelhamento das mortes registradas anteriormente.
6. Atualização de versão no Launcher para v1.9.8.
"""
import os
import re
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js"),
]

def apply_patches():
    with open(TARGETS[0], "r", encoding="utf-8") as f:
        src = f.read()

    orig_len = len(src)
    print(f"Lendo {TARGETS[0]} ({orig_len} bytes)")

    # =========================================================================
    # 1. CORAÇÃO DA FLORESTA (Texto removido + Fogueiras acesas reativas à chuva)
    # =========================================================================
    old_hub_brazier = '''const brzTex=S.textures.exists("brazier")?"brazier":"hub-brazier";if(S.textures.exists(brzTex)){const bL=S.add.sprite(cx-36,cy,brzTex).setOrigin(.5,1).setDepth(cy);const bR=S.add.sprite(cx+36,cy,brzTex).setOrigin(.5,1).setDepth(cy)}S.lighting?.addLight?.({x:cx-36,y:cy-20,radius:55,flicker:.18,color:16746547});S.lighting?.addLight?.({x:cx+36,y:cy-20,radius:55,flicker:.18,color:16746547});S.add.rectangle(cx,cy+8,140,13,0x0a0806,.78).setDepth(8999);S.add.text(cx,cy+8,__T("✦ CORAÇÃO DA FLORESTA ✦"),{fontFamily:"'Courier New', monospace",fontSize:"7.5px",fontStyle:"bold",color:"#8ae0b0",stroke:"#0a0806",strokeThickness:2.5}).setOrigin(.5,.5).setDepth(9000);'''
    
    new_hub_brazier = '''const brzTex=S.textures.exists("brazier")?"brazier":"hub-brazier";let bL=null,bR=null;if(S.textures.exists(brzTex)){bL=S.add.sprite(cx-36,cy,brzTex).setOrigin(.5,1).setDepth(cy);bR=S.add.sprite(cx+36,cy,brzTex).setOrigin(.5,1).setDepth(cy)}S.anims.exists("hub-brazier-fire")||!S.textures.exists("scenery-temple-fire")||S.anims.create({key:"hub-brazier-fire",frames:S.anims.generateFrameNumbers("scenery-temple-fire",{start:0,end:23}),frameRate:12,repeat:-1});const __hubFlames=[],__hubLights=[];[-36,36].forEach(ox=>{const fx=cx+ox,fy=cy-20;let sp=null;if(S.anims.exists("hub-brazier-fire")){sp=S.add.sprite(fx,fy+4,"scenery-temple-fire",0).setOrigin(.5,1).setScale(.36).setDepth(cy+1);sp.play("hub-brazier-fire")}else{sp=S.add.image(fx,fy,"light").setScale(.2).setTint(16746547).setBlendMode(j.BlendModes.ADD).setDepth(cy+1)}const gl=S.add.image(fx,fy-4,"light").setScale(.26).setBlendMode(j.BlendModes.ADD).setTint(16755268).setAlpha(.45).setDepth(cy);S.tweens.add({targets:gl,alpha:.22,scale:.32,duration:350+Math.random()*150,yoyo:!0,repeat:-1});const lt=S.lighting?.addLight?.({x:fx,y:fy,radius:65,flicker:.2,color:16746547});sp&&__hubFlames.push(sp);gl&&__hubFlames.push(gl);lt&&__hubLights.push(lt)});const __updHubFire=()=>{const w=(S.__weatherManager?.weather||S.weather||"").toLowerCase();const isRain=w==="storm"||w==="drizzle"||w==="rain";__hubFlames.forEach(f=>{f&&f.setVisible(!isRain)});__hubLights.forEach(l=>{if(l)l.visible=!isRain})};__updHubFire();S.time.addEvent({delay:600,loop:!0,callback:__updHubFire});'''

    assert old_hub_brazier in src, "Bloco antigo de braseiro do Coração da Floresta não encontrado"
    src = src.replace(old_hub_brazier, new_hub_brazier)
    print("1. Coração da Floresta: texto removido e fogueiras reativas à chuva acesas!")

    # Também remover banner estático do quarto se presente
    old_room_banner = '{id:"coracao",name:"Coração da Floresta",rect:{x:34,y:6,w:22,h:14},ambient:.65,hub:!0,banner:"CORAÇÃO DA FLORESTA",'
    new_room_banner = '{id:"coracao",name:"Coração da Floresta",rect:{x:34,y:6,w:22,h:14},ambient:.65,hub:!0,banner:null,'
    if old_room_banner in src:
        src = src.replace(old_room_banner, new_room_banner)
        print("1b. Banner textual do Coração da Floresta silenciado!")

    # =========================================================================
    # 2. DRAGÃO PÁLIDO (Ataques 100% no chão, sem voo, com abalo sísmico)
    # =========================================================================
    # Atualizar Yt.PALE_DRAGON
    p_dragon_start = src.find('Yt.PALE_DRAGON || (Yt.PALE_DRAGON = {')
    assert p_dragon_start != -1, "Yt.PALE_DRAGON não encontrado"
    p_dragon_end = src.find('Yt.CERBERUS ||', p_dragon_start)
    assert p_dragon_end != -1, "Yt.CERBERUS não encontrado"

    new_pale_dragon = '''Yt.PALE_DRAGON || (Yt.PALE_DRAGON = {
  ...Yt.DRAGON_ANCIENT,
  name: "Dragão Pálido",
  subtitle: "O Pesadelo Espectral das Cinzas",
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
    GROUND_SHATTER: { damage: 5, radius: 135, maxDist: 160, telegraphMs: 680, recoverMs: 560, sound: "sfx-ancient-dragon-tail" }
  },
  attackPools: {
    1: ["BITE", "CLAW", "FIRE_BREATH"],
    2: ["BITE", "CLAW", "FIRE_BREATH", "TAIL_SWEEP", "ROAR"],
    3: ["BITE", "CLAW", "FIRE_BREATH", "TAIL_SWEEP", "ROAR", "FIRE_METEOR", "GROUND_SHATTER"]
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
    fly: { frames: [7, 8, 9, 10, 11, 12], frameRate: 9, repeat: -1 },
    hurt: { frames: [58, 59, 60, 61], frameRate: 10, repeat: 0 },
    death: { frames: [62, 63, 64], frameRate: 5, repeat: 0 },
    phase: { frames: [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], frameRate: 12, repeat: 0 },
    special: { frames: [33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45], frameRate: 10, repeat: -1 }
  }
});'''

    src = src[:p_dragon_start] + new_pale_dragon + "\n\n" + src[p_dragon_end:]

    # Atualizar hooks de comportamento e anulação de voo
    hooks_start = src.find('/* === DRAGÃO PÁLIDO: COMPORTAMENTO ORGÂNICO')
    assert hooks_start != -1, "DRAGÃO PÁLIDO hooks não encontrados"
    hooks_end = src.find('class dh{constructor', hooks_start)
    assert hooks_end != -1, "Fim dos hooks de dragão não encontrado"

    new_dragon_hooks = '''/* === DRAGÃO PÁLIDO: COMPORTAMENTO ORGÂNICO, FÍSICA E COMBOS 100% NO SOLO === */
(function() {
  const _origChase = hh.prototype.doChase;
  hh.prototype.doChase = function(player) {
    if (this.typeKey === "PALE_DRAGON" && !player.dead) {
      this.flying = false;
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
        // Muito próximo: desacelera e estabiliza postura para atacar no solo
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
      this.flying = false;
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
      this.flying = false;
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

  // Suprimir totalmente voo do Dragão Pálido: converter qualquer tentativa em impacto de solo
  const _origStartFlyover = hh.prototype.startFlyover;
  hh.prototype.startFlyover = function(atk) {
    if (this.typeKey === "PALE_DRAGON") {
      this.flying = false;
      const p = this.scene.player;
      const shAtk = this.data_.attacks?.GROUND_SHATTER || { damage: 5, radius: 135, telegraphMs: 680, recoverMs: 560 };
      const rad = shAtk.radius * this.mult("radiusMult");
      this.shockRadius = rad;
      this.telegraph = this.scene.damageSystem?.circle(this.x, this.y, rad, shAtk.telegraphMs, 0xd0e8f2, () => {
        if (this.dead) return;
        this.scene.audioRef?.play?.("sfx-ancient-dragon-tail");
        this.scene.cameraSys?.shake?.(0.012, 380);
        this.scene.effects?.shockwaveRing?.(this.x, this.y, rad);
        this.scene.effects?.shockwaveRing?.(this.x, this.y, rad * 0.55);
        this.scene.effects?.burstTinted?.(this.x, this.y, 0xd0e8f2, 28);
        this.scene.effects?.burstTinted?.(this.x, this.y, 0xff7733, 16);
        this.scene.effects?.hitStop?.(70);
        if (!p.dead && this.scene.damageSystem?.circleHit(this.x, this.y, rad, p.x, p.y, p.body.width / 2)) {
          const d = Math.hypot(p.x - this.x, p.y - this.y) || 1;
          this.hitPlayer(this.scaledDamage(shAtk.damage), { x: (p.x - this.x) / d, y: (p.y - this.y) / d });
        }
        this.recover(shAtk.recoverMs);
      });
      return;
    }
    return _origStartFlyover.call(this, atk);
  };

  const _origLanding = hh.prototype.executeLanding;
  hh.prototype.executeLanding = function(targetX, targetY, flyAtk) {
    if (this.typeKey === "PALE_DRAGON") {
      this.flying = false;
      return;
    }
    return _origLanding.call(this, targetX, targetY, flyAtk);
  };

  const _origRecover = hh.prototype.recover;
  hh.prototype.recover = function(ms) {
    if (this.typeKey === "PALE_DRAGON") {
      this.flying = false;
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
    src = src[:hooks_start] + new_dragon_hooks + src[hooks_end:]
    print("2. Dragão Pálido: voo removido e ataques 100% no solo configurados!")

    # =========================================================================
    # 3. CATACUMBAS E RUÍNAS (Profundidade tridimensional dos ladrilhos e chão)
    # =========================================================================
    # Aprimorar paletas em no
    old_no = '''no={"tiles-catacombs":{floorRGB:c=>`rgb(${c+8},${c},${c-6})`,wallRGB:c=>`rgb(${c},${c-5},${c-10})`,moss:"rgba(20,24,12,0.3)",mossHeavy:!1,boneNiches:!0},"tiles-ruins":{floorRGB:c=>`rgb(${c-2},${c+6},${c-8})`,wallRGB:c=>`rgb(${c-4},${c+2},${c-10})`,moss:"rgba(52,88,40,0.42)",mossHeavy:!0},'''
    new_no = '''no={"tiles-catacombs":{floorRGB:c=>`rgb(${c+12},${c+4},${c-4})`,wallRGB:c=>`rgb(${c+6},${c-2},${c-8})`,moss:"rgba(18,22,12,0.35)",mossHeavy:!1,boneNiches:!0,chiselDepth:!0},"tiles-ruins":{floorRGB:c=>`rgb(${c-2},${c+10},${c-6})`,wallRGB:c=>`rgb(${c-4},${c+6},${c-8})`,moss:"rgba(48,84,36,0.46)",mossHeavy:!0,chiselDepth:!0},'''

    assert old_no in src, "Definição de no tiles-catacombs e tiles-ruins não encontrada"
    src = src.replace(old_no, new_no)

    # Aprimorar je (paredes e ladrilhos com bisel chanfrado e profundidade 3D)
    old_je_start = src.find('function je(c,i,t,e,d,o){const a=dt;c.fillStyle="#120e0b"')
    assert old_je_start != -1, "Função je antiga não encontrada"
    old_je_end = src.find('function ro(c,i){', old_je_start)
    assert old_je_end != -1, "Fim da função je antiga não encontrado"

    new_je = '''function je(c,i,t,e,d,o){const a=dt;c.fillStyle="#070503",c.fillRect(i,0,a,a);const n=a/2;for(let s=0;s<2;s++){const r=s%2*(a/4);for(let l=-1;l<2;l++){const h=i+l*(a/2)+r,u=s*n,p=a/2-2,v=Math.max(h,i),f=Math.min(h+p,i+a);if(f<=v)continue;const m=Ot(t*5+l+s*13,t*9+s+l*3),g=64+Math.floor(m*18),y=f-v;c.fillStyle=o.wallRGB(g),c.fillRect(v+1,u+1,y-2,n-2);c.fillStyle="#070503",c.fillRect(v,u+1,1,1),c.fillRect(f-1,u+1,1,1),c.fillRect(v,u+n-2,1,1),c.fillRect(f-1,u+n-2,1,1);c.fillStyle=o.wallRGB(g+28),c.fillRect(v+1,u+1,y-2,1);c.fillStyle=o.wallRGB(g+14),c.fillRect(v+1,u+2,y-2,1);c.fillStyle=o.wallRGB(g+16),c.fillRect(v+1,u+2,1,Math.max(1,n-4));c.fillStyle=o.wallRGB(g-24),c.fillRect(v+1,u+n-3,y-2,1);c.fillStyle=o.wallRGB(g-38),c.fillRect(v+1,u+n-2,y-2,1);f-2>=v+1&&c.fillRect(f-2,u+2,1,Math.max(1,n-4));c.fillStyle=o.wallRGB(g-10),c.fillRect(v+2,u+5,Math.max(1,y-4),1);c.fillStyle=o.wallRGB(g+8),c.fillRect(v+3,u+6,Math.max(1,y-6),1);c.fillStyle=o.wallRGB(g-8),c.fillRect(v+2,u+9,Math.max(1,y-5),1);m>.68&&y>6&&(c.fillStyle="#070503",c.fillRect(f-4,u+2,3,2),c.fillStyle=o.wallRGB(g-12),c.fillRect(f-4,u+4,2,1));if(m<.25&&y>8){c.fillStyle="rgba(0,0,0,0.55)";const S=v+3+Math.floor(m*20);c.fillRect(S,u+3,1,4),c.fillRect(S+1,u+7,1,4)}}}c.fillStyle="rgba(0,0,0,0.65)",c.fillRect(i,n,a,1);if(o.boneNiches&&Ot(t*23,t*29)>.62){const s=i+8;c.fillStyle="#0a0806",c.fillRect(s,10,16,12),c.fillStyle="rgba(255,240,210,0.06)",c.fillRect(s,10,16,1),c.fillStyle="#948c76",c.fillRect(s+2,14,5,4),c.fillRect(s+9,15,5,4),c.fillStyle="#cfc8b4",c.fillRect(s+2,14,5,2),c.fillRect(s+9,15,5,2),c.fillStyle="#1d1a16",c.fillRect(s+3,15,1,1),c.fillRect(s+5,15,1,1),c.fillRect(s+10,16,1,1),c.fillRect(s+12,16,1,1),c.fillStyle="#6a6456",c.fillRect(s+1,19,13,1),c.fillRect(s+3,20,10,1)}if(o.mossHeavy){c.fillStyle=o.moss;const s=i+Math.floor(Ot(t*7,t*3)*(a-8))+2,r=8+Math.floor(Ot(t,t*2)*8);c.fillRect(s,0,5,r),c.fillRect(s+5,0,3,r-4),c.fillRect(s+1,r,2,3)}if(o.metalBands&&Ot(t*13,t*17)>.55&&(c.fillStyle="#3a2c1e",c.fillRect(i,a/2-3,a,5),c.fillStyle="#7a6248",c.fillRect(i,a/2-2,a,3),c.fillStyle="#a8865a",c.fillRect(i,a/2-2,a,1),c.fillStyle="#281e16",c.fillRect(i+4,a/2-1,2,2),c.fillRect(i+a-7,a/2-1,2,2),c.fillStyle="#c8a26a",c.fillRect(i+4,a/2-1,1,1),c.fillRect(i+a-7,a/2-1,1,1)),e){const s=c.createLinearGradient(0,a-12,0,a);s.addColorStop(0,"rgba(0,0,0,0)"),s.addColorStop(1,"rgba(0,0,0,0.5)"),c.fillStyle=s,c.fillRect(i,a-12,a,12),c.fillStyle="rgba(255,220,180,0.05)",c.fillRect(i,a-2,a,2)}d&&(c.fillStyle="rgba(255,240,210,0.14)",c.fillRect(i,0,a,2),c.fillStyle="rgba(255,240,210,0.06)",c.fillRect(i,2,a,2))}'''

    src = src[:old_je_start] + new_je + src[old_je_end:]
    print("3. Catacumbas e Ruínas: ladrilhos com alta profundidade e bisel implementados!")

    # =========================================================================
    # 4. SALAS SECRETAS (Escuridão shroud + Revelação ao entrar + Inimigo Elite)
    # =========================================================================
    # No gerador procedimental de sala secreta: Ar case "SECRET":
    old_secret_case = 'case"SECRET":{const s=d>=20?"LEGENDARY":"EPIC",r=t.center();i.decor.push({type:"chest",col:r.col,row:r.row,solid:!0,tier:s}),i.secret=!0;break}'
    new_secret_case = '''case"SECRET":{const s=d>=20?"LEGENDARY":"EPIC",r=t.center();i.decor.push({type:"chest",col:r.col,row:r.row,solid:!0,tier:s}),i.secret=!0;const bio=(a||"").toLowerCase();let ek="SKELETON_WARRIOR";bio.includes("ruin")?ek="ORC_BRUTE":bio.includes("catacomb")?ek="DEMON":bio.includes("fortress")?ek="DEMON_CASTER":bio.includes("froze")?ek="TROLL":(bio.includes("forest")||bio.includes("bosque"))&&(ek="GOBLIN_ASSASSIN");const ep=t.take(c,{inset:1})??r;i.enemies.push({type:ek,col:ep.col,row:ep.row,elite:!0});break}'''

    assert old_secret_case in src, "Caso case 'SECRET' não encontrado"
    src = src.replace(old_secret_case, new_secret_case)

    # No construtor de rh (dungeon room management): adicionar shroud de escuridão e garantir inimigo elite
    old_rh_ctor = 'class rh{constructor(i,t){this.scene=i,this.level=t,this.rooms=t.rooms.map(e=>new th(e)),this.byId=new Map(this.rooms.map(e=>[e.id,e])),'
    new_rh_ctor = '''class rh{constructor(i,t){this.scene=i,this.level=t,this.rooms=t.rooms.map(e=>new th(e)),this.byId=new Map(this.rooms.map(e=>[e.id,e]));for(const rm of this.rooms){const isSec=!!(rm.def?.secret||rm.def?.roomType==="SECRET"||rm.id?.includes?.("secret"));if(isSec){rm.isSecretRoom=!0;if(!rm.def.enemies)rm.def.enemies=[];if(!rm.def.enemies.some(e=>e.elite||e.isElite)){const rx=rm.def.rect,ecX=rx.x+Math.floor(rx.w/2),ecY=rx.y+Math.floor(rx.h/2),bio=(this.level.biome||"").toLowerCase();let ek="SKELETON_WARRIOR";bio.includes("ruin")?ek="ORC_BRUTE":bio.includes("catacomb")?ek="DEMON":bio.includes("fortress")?ek="DEMON_CASTER":bio.includes("froze")?ek="TROLL":(bio.includes("forest")||bio.includes("bosque"))&&(ek="GOBLIN_ASSASSIN");rm.def.enemies.push({type:ek,col:ecX,row:ecY,elite:!0})}const rx=rm.def.rect,px=(rx.x-.5)*dt,py=(rx.y-.5)*dt,pw=(rx.w+1)*dt,ph=(rx.h+1)*dt;rm.__darknessShroud=this.scene.add.rectangle(px+pw/2,py+ph/2,pw,ph,0x050403,1.0).setDepth(8400)}}'''

    assert old_rh_ctor in src, "Construtor de class rh não encontrado"
    src = src.replace(old_rh_ctor, new_rh_ctor)

    # Em enterRoom: dissolver escuridão suavemente revelando o interior e o elite
    old_enter_room = 'enterRoom(i){this.activeRoom=i;const t=!i.discovered;i.discovered=!0,this.scene.lighting.setAmbient(i.ambient),'
    new_enter_room = '''enterRoom(i){this.activeRoom=i;const t=!i.discovered;i.discovered=!0;if(i.isSecretRoom&&i.__darknessShroud){const sh=i.__darknessShroud;i.__darknessShroud=null;this.scene.tweens.add({targets:sh,alpha:0,duration:650,ease:"Cubic.easeOut",onComplete:()=>sh.destroy()});this.scene.audioRef?.play?.("sfx-secret-reveal");const cp=i.centerPx();this.scene.effectsRef?.shockwaveRing?.(cp.x,cp.y,90);this.scene.effectsRef?.burstTinted?.(cp.x,cp.y,8382688,20);this.scene.cameraSys?.shake?.(.005,200)}this.scene.lighting.setAmbient(i.ambient),'''

    assert old_enter_room in src, "enterRoom não encontrado"
    src = src.replace(old_enter_room, new_enter_room)
    print("4. Salas Secretas: sala escura até entrar, revelação arcana e inimigo elite garantido!")

    # =========================================================================
    # 5. BESTIÁRIO (Remover Irmãs Sátiro juntas e separar individualmente)
    # =========================================================================
    # Atualizar __BK_BOSSES
    old_bk_bosses = 'const __BK_BOSSES = ["SATYR_SISTERS", "SATYR_SISTER_1", "SATYR_SISTER_2", "LAVA_GOLEM",'
    new_bk_bosses = 'const __BK_BOSSES = ["SATYR_SISTER_1", "SATYR_SISTER_2", "LAVA_GOLEM",'
    assert old_bk_bosses in src, "__BK_BOSSES com SATYR_SISTERS não encontrado"
    src = src.replace(old_bk_bosses, new_bk_bosses)

    # Adicionar onde encontrar cada uma em __BK_EXTRA_WHERE
    old_bk_where = 'const __BK_EXTRA_WHERE = {\n  MIMIC:'
    new_bk_where = '''const __BK_EXTRA_WHERE = {
  SATYR_SISTER_1: "Bosque Sussurrante & Andares da Natureza no Modo Infinito (Luta em dupla com Thalia)",
  SATYR_SISTER_2: "Bosque Sussurrante & Andares da Natureza no Modo Infinito (Luta em dupla com Kallisto)",
  MIMIC:'''
    assert old_bk_where in src, "__BK_EXTRA_WHERE não encontrado"
    src = src.replace(old_bk_where, new_bk_where)

    # Adicionar lore individual em __BK_LORE
    old_bk_lore = 'const __BK_LORE = {\n  MIMIC:'
    new_bk_lore = '''const __BK_LORE = {
  SATYR_SISTER_1: "Kallisto, A Lança de Espinhos. A mais impetuosa das irmãs sátiro, lidera investidas ferozes empunhando uma lança talhada em espinheiros vivos e avança em botes brutais.",
  SATYR_SISTER_2: "Thalia, O Chifre das Sombras. Ágil guardiã dos bosques obscuros, canaliza ventos tempestuosos e conjura ondas de choque sombrias enquanto flanqueia em sincronia com sua irmã.",
  MIMIC:'''
    assert old_bk_lore in src, "__BK_LORE não encontrado"
    src = src.replace(old_bk_lore, new_bk_lore)

    # Migrar contagem de derrotas legacy em __bkKills()
    old_bk_kills = 'function __bkKills() { try { return JSON.parse(localStorage.getItem("depthgate:bestiary") || "{}") } catch (e) { return {} } }'
    new_bk_kills = '''function __bkKills() { try { const raw = JSON.parse(localStorage.getItem("depthgate:bestiary") || "{}"); if (raw["SATYR_SISTERS"]) { const leg=raw["SATYR_SISTERS"], c=(typeof leg==="object"?leg.campaign:Number(leg))||0, e=(typeof leg==="object"?leg.endless:0)||0; raw["SATYR_SISTER_1"]||(raw["SATYR_SISTER_1"]={campaign:c,endless:e}); raw["SATYR_SISTER_2"]||(raw["SATYR_SISTER_2"]={campaign:c,endless:e}); } return raw; } catch (e) { return {} } }'''

    assert old_bk_kills in src, "Função __bkKills() não encontrada"
    src = src.replace(old_bk_kills, new_bk_kills)
    print("5. Bestiário: Irmãs Sátiro removidas juntas e separadas individualmente com lore e estatísticas próprias!")

    # =========================================================================
    # GRAVAÇÃO E SINCRONIZAÇÃO DOS ARQUIVOS
    # =========================================================================
    for target in TARGETS:
        with open(target, "w", encoding="utf-8") as f:
            f.write(src)
        print(f"Gravado com sucesso em: {target} ({len(src)} bytes)")

    # 6. Atualizar versão no Launcher.cs para v1.9.8
    launcher_path = os.path.join(ROOT, "scripts", "Launcher.cs")
    if os.path.exists(launcher_path):
        with open(launcher_path, "r", encoding="utf-8") as f:
            l_src = f.read()
        l_src_new = l_src.replace('v1.9.7', 'v1.9.8')
        with open(launcher_path, "w", encoding="utf-8") as f:
            f.write(l_src_new)
        print("6. Launcher.cs atualizado para v1.9.8!")

if __name__ == "__main__":
    apply_patches()
