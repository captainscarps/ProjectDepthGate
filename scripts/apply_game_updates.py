import re, sys

def patch_bundle(path):
    print(f"Patching {path}...")
    with open(path, 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. Scope dialogue / chronicle logs to active character
    target_chron = 'function __chKey(S){return"depthgate:chron:"+(S.game.registry.get("save:slot")??0)}function __chList(S){try{return JSON.parse(localStorage.getItem(__chKey(S))||"[]")}catch(e){return[]}}function __chron(S,title,text){if(!text)return;const L=__chList(S);if(L.some(e=>e.text===text))return;L.push({title,text});try{localStorage.setItem(__chKey(S),JSON.stringify(L.slice(-80)))}catch(e){}S.game?.events?.emit?.("ui:banner","NOVA CRÔNICA REGISTRADA","#c9a24a")}'
    replacement_chron = 'function __chKey(S){const sl=S?.game?.registry?.get("save:slot")??1;const cls=(S?.classDef?.id||S?.player?.classDef?.id||S?.game?.registry?.get("hub:classId")||"WARRIOR").toUpperCase();return"depthgate:chron:"+sl+":"+cls}function __chList(S){const k=__chKey(S);const cls=(S?.classDef?.id||S?.player?.classDef?.id||S?.game?.registry?.get("hub:classId")||"WARRIOR").toUpperCase();try{let L=JSON.parse(localStorage.getItem(k)||"[]");if(!L.length){const sl=S?.game?.registry?.get("save:slot")??1;const legacy=JSON.parse(localStorage.getItem("depthgate:chron:"+sl)||"[]");if(legacy.length){const nm=((typeof __HN!=="undefined"&&__HN[cls])||cls).toUpperCase();L=legacy.filter(e=>e.classId===cls||(e.title&&e.title.toUpperCase().includes(nm)));if(L.length){try{localStorage.setItem(k,JSON.stringify(L))}catch(err){}}}}return L.filter(e=>!e.classId||e.classId===cls)}catch(e){return[]}}function __chron(S,title,text){if(!text)return;const cls=(S?.classDef?.id||S?.player?.classDef?.id||S?.game?.registry?.get("hub:classId")||"WARRIOR").toUpperCase();const L=__chList(S);if(L.some(e=>e.text===text))return;L.push({title,text,classId:cls});try{localStorage.setItem(__chKey(S),JSON.stringify(L.slice(-80)))}catch(e){}S.game?.events?.emit?.("ui:banner",__L3("NOVA CRÔNICA REGISTRADA","NEW CHRONICLE RECORDED","NUEVA CRÓNICA REGISTRADA"),"#c9a24a")}'
    assert target_chron in code, "target_chron not found!"
    code = code.replace(target_chron, replacement_chron, 1)
    print("  -> Scoped __chKey and __chList to active character.")

    # 2. Add Preload spritesheets for Satyr 1, Satyr 2, Demon 1, Demon 2
    target_boss_preload = '["boss-cerberus","boss-cerberus.png",128,128]'
    replacement_boss_preload = '["boss-cerberus","boss-cerberus.png",128,128],["boss-satyr-sister1","boss-satyr-sister1.png",128,128],["boss-satyr-sister2","boss-satyr-sister2.png",128,128]'
    assert target_boss_preload in code, "target_boss_preload not found!"
    code = code.replace(target_boss_preload, replacement_boss_preload, 1)
    print("  -> Added boss-satyr-sister1 and sister2 to boss spritesheet preloads.")

    target_enemy_preload = '["shaman-wolf","shaman-wolf.png",128,128]'
    replacement_enemy_preload = '["shaman-wolf","shaman-wolf.png",128,128],["enemy-shadow-demon1","enemy-shadow-demon1.png",128,128],["enemy-shadow-demon2","enemy-shadow-demon2.png",128,128]'
    assert target_enemy_preload in code, "target_enemy_preload not found!"
    code = code.replace(target_enemy_preload, replacement_enemy_preload, 1)
    print("  -> Added enemy-shadow-demon1 and demon2 to enemy spritesheet preloads.")

    target_tiles = 'for(const k of["eforest","ebosque","erio","emorta","ecastle"])this.load.image("ek-"+k,`assets/pixel-art/tiles/ek-${k}.png`);'
    replacement_tiles = 'for(const k of["eforest","ebosque","erio","emorta","ecastle"])this.load.image("ek-"+k,`assets/pixel-art/tiles/ek-${k}.png`);this.load.image("tiles-floresta-nevada","assets/pixel-art/tiles/tiles-floresta-nevada.png");this.load.image("tiles-mina-abandonada","assets/pixel-art/tiles/tiles-mina-abandonada.png");'
    assert target_tiles in code, "target_tiles not found!"
    code = code.replace(target_tiles, replacement_tiles, 1)
    print("  -> Added tiles-floresta-nevada and tiles-mina-abandonada preloads.")

    # 3. Add Si scale multipliers for Shadow Demons
    target_si = '"enemy-mimic":0.46}'
    replacement_si = '"enemy-mimic":0.46,"enemy-shadow-demon1":0.55,"enemy-shadow-demon2":0.55}'
    assert target_si in code, "target_si not found!"
    code = code.replace(target_si, replacement_si, 1)
    print("  -> Added scale multipliers to Si for Shadow Demons.")

    # 4. Add ee entries for SHADOW_DEMON_1 and SHADOW_DEMON_2
    target_ee = 'ee={'
    demon_entries = '''SHADOW_DEMON_1:{name:"Demônio das Sombras",texture:"enemy-shadow-demon1",sizeClass:"medium",bodySize:22,speed:78,maxHp:10,damage:3,hitFlashMs:120,behavior:"chase",ai:{detectionRange:260,loseTargetRange:380,attacks:[{type:"MELEE",damage:3,range:42,telegraphMs:400,cooldownMs:2200}]},xp:110,gold:{min:10,max:20,chance:.8},loot:{chance:.65,pools:["sword","axe","dagger","staff","bow","helmet","armor","boots","ring","amulet"],rarities:{COMMON:20,UNCOMMON:40,RARE:30,EPIC:9,LEGENDARY:1}},anims:{idle:{frames:[0,1,2,3,4,5,6,7],frameRate:7,repeat:-1},walk:{frames:[8,9,10,11,12,13,14,15,16,17],frameRate:9,repeat:-1},attack:{frames:[18,19,20,21,22,23],frameRate:10,repeat:0},strike:{frames:[20,21,22],frameRate:10,repeat:0},windup:{frames:[18,19],frameRate:8,repeat:0},hurt:{frames:[24,25,26,27,28,29],frameRate:10,repeat:0},death:{frames:[30,31,32,33,34,35,36,37,38,39,40],frameRate:9,repeat:0}}},SHADOW_DEMON_2:{name:"Demônio Voraz das Sombras",texture:"enemy-shadow-demon2",sizeClass:"medium",bodySize:24,speed:86,maxHp:13,damage:3,hitFlashMs:120,behavior:"chase",ai:{detectionRange:280,loseTargetRange:400,attacks:[{type:"CHARGE",damage:4,speed:280,durationMs:450,minRange:80,maxRange:220,telegraphMs:500,cooldownMs:3800}]},xp:135,gold:{min:14,max:28,chance:.85},loot:{chance:.7,pools:["sword","axe","dagger","staff","bow","helmet","armor","boots","ring","amulet"],rarities:{COMMON:15,UNCOMMON:40,RARE:32,EPIC:11,LEGENDARY:2}},anims:{idle:{frames:[0,1,2,3,4,5,6,7],frameRate:7,repeat:-1},walk:{frames:[8,9,10,11,12,13,14,15,16,17],frameRate:9,repeat:-1},attack:{frames:[18,19,20,21,22,23,24],frameRate:10,repeat:0},charge:{frames:[25,26,27,28,29,30,31],frameRate:10,repeat:-1},strike:{frames:[21,22,23],frameRate:10,repeat:0},windup:{frames:[18,19,20],frameRate:8,repeat:0},hurt:{frames:[32,33,34,35,36,37],frameRate:10,repeat:0},death:{frames:[38,39,40,41,42,43,44,45,46,47,48,49],frameRate:9,repeat:0}}},'''
    assert target_ee in code, "target_ee not found!"
    code = code.replace(target_ee, target_ee + demon_entries, 1)
    print("  -> Added SHADOW_DEMON_1 and SHADOW_DEMON_2 to ee.")

    # 5. Add Yt entries for SATYR_SISTER_1, SATYR_SISTER_2, SATYR_SISTERS
    target_yt = 'Yt.LAVA_GOLEM||(Yt.LAVA_GOLEM='
    satyr_boss_defs = '''
Yt.SATYR_SISTER_1 || (Yt.SATYR_SISTER_1 = {
  ...Yt.ABYSS_GUARDIAN,
  name: "Kallisto, A Lança de Espinhos",
  subtitle: "Irmã Sátiro da Fúria Selvagem",
  texture: "boss-satyr-sister1",
  scale: 1.18,
  bodySize: 34,
  maxHp: 80,
  contactDamage: 3,
  speed: 74,
  xp: 1200,
  gold: { min: 140, max: 240 },
  attackCooldownMs: 1300,
  attacks: {
    SLAM: { damage: 4, range: 65, width: 75, telegraphMs: 500, recoverMs: 400 },
    CHARGE: { damage: 4, speed: 440, length: 280, durationMs: 550, telegraphMs: 600, recoverMs: 500 }
  },
  phase2: { hpRatio: 0.5, speedMult: 1.45, damageMult: 1.35, cooldownMult: 0.6, tint: 0xff6666 },
  anims: {
    idle: { frames: [0, 1, 2, 3, 4, 5, 6], frameRate: 6, repeat: -1 },
    walk: { frames: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], frameRate: 10, repeat: -1 },
    attack: { frames: [19, 20, 21, 22], frameRate: 8, repeat: 0 },
    strike: { frames: [20, 21, 22], frameRate: 8, repeat: 0 },
    windup: { frames: [19], frameRate: 6, repeat: 0 },
    charge: { frames: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32], frameRate: 12, repeat: -1 },
    hurt: { frames: [33, 34, 35, 36], frameRate: 10, repeat: 0 },
    death: { frames: [37, 38, 39, 40], frameRate: 6, repeat: 0 }
  }
});

Yt.SATYR_SISTER_2 || (Yt.SATYR_SISTER_2 = {
  ...Yt.ABYSS_GUARDIAN,
  name: "Thalia, O Chifre das Sombras",
  subtitle: "Irmã Sátiro da Tempestade Obscura",
  texture: "boss-satyr-sister2",
  scale: 1.18,
  bodySize: 34,
  maxHp: 75,
  contactDamage: 3,
  speed: 78,
  xp: 1200,
  gold: { min: 140, max: 240 },
  attackCooldownMs: 1250,
  attacks: {
    SLAM: { damage: 3, range: 70, width: 85, telegraphMs: 450, recoverMs: 400 },
    CHARGE: { damage: 4, speed: 480, length: 320, durationMs: 600, telegraphMs: 550, recoverMs: 450 },
    SHOCKWAVE: { damage: 3, radius: 110, telegraphMs: 700, recoverMs: 600 }
  },
  phase2: { hpRatio: 0.5, speedMult: 1.5, damageMult: 1.4, cooldownMult: 0.55, tint: 0xcc66ff },
  anims: {
    idle: { frames: [0, 1, 2, 3, 4, 5, 6], frameRate: 6, repeat: -1 },
    walk: { frames: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], frameRate: 10, repeat: -1 },
    attack: { frames: [19, 20, 21, 22, 23, 24, 25, 26], frameRate: 10, repeat: 0 },
    strike: { frames: [22, 23, 24, 25], frameRate: 10, repeat: 0 },
    windup: { frames: [19, 20, 21], frameRate: 8, repeat: 0 },
    charge: { frames: [27, 28, 29, 30, 31, 32, 33, 34], frameRate: 12, repeat: -1 },
    hurt: { frames: [35, 36, 37, 38], frameRate: 10, repeat: 0 },
    death: { frames: [39, 40, 41, 42], frameRate: 6, repeat: 0 }
  }
});

Yt.SATYR_SISTERS || (Yt.SATYR_SISTERS = {
  ...Yt.ABYSS_GUARDIAN,
  name: "Irmãs Sátiro",
  subtitle: "Kallisto & Thalia, Guardiãs Selvagens",
  texture: "boss-satyr-sister1",
  scale: 1.18,
  bodySize: 34,
  maxHp: 155,
  contactDamage: 3,
  speed: 75,
  xp: 2400,
  gold: { min: 280, max: 480 },
  attackCooldownMs: 1200,
  attacks: {
    SLAM: { damage: 4, range: 68, width: 80, telegraphMs: 480, recoverMs: 400 },
    CHARGE: { damage: 4, speed: 460, length: 300, durationMs: 580, telegraphMs: 580, recoverMs: 480 }
  },
  phase2: { hpRatio: 0.5, speedMult: 1.45, damageMult: 1.35, cooldownMult: 0.6, tint: 0xff6666 },
  anims: {
    idle: { frames: [0, 1, 2, 3, 4, 5, 6], frameRate: 6, repeat: -1 },
    walk: { frames: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], frameRate: 10, repeat: -1 },
    attack: { frames: [19, 20, 21, 22], frameRate: 8, repeat: 0 },
    strike: { frames: [20, 21, 22], frameRate: 8, repeat: 0 },
    windup: { frames: [19], frameRate: 6, repeat: 0 },
    charge: { frames: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32], frameRate: 12, repeat: -1 },
    hurt: { frames: [33, 34, 35, 36], frameRate: 10, repeat: 0 },
    death: { frames: [37, 38, 39, 40], frameRate: 6, repeat: 0 }
  }
});
'''
    assert target_yt in code, "target_yt not found!"
    code = code.replace(target_yt, satyr_boss_defs + target_yt, 1)
    print("  -> Added SATYR_SISTER_1, SATYR_SISTER_2, SATYR_SISTERS to Yt.")

    # 6. Dual Boss logic in spawnBoss:
    target_spawnboss = '''this.boss2=null;const isCoopBoss=this.game.registry.get("mode")==="endless"&&!!this.game.registry.get("endless:coop");
this.boss=new hh(this,isCoopBoss?t-55:t,e,i);'''
    replacement_spawnboss = '''this.boss2=null;const isSatyrDuo=i==="SATYR_SISTERS";const isCoopBoss=!isSatyrDuo&&this.game.registry.get("mode")==="endless"&&!!this.game.registry.get("endless:coop");
this.boss=new hh(this,isSatyrDuo?t-65:isCoopBoss?t-55:t,e,isSatyrDuo?"SATYR_SISTER_1":i);
if(isSatyrDuo){
  this.boss.data_={...this.boss.data_,name:"Kallisto, A Lança de Espinhos"};
  this.boss2=new hh(this,t+65,e,"SATYR_SISTER_2");
  this.boss2.data_={...this.boss2.data_,name:"Thalia, O Chifre das Sombras"};
  this.physics.add.collider(this.boss2,this.dungeon.wallLayer);
  this.physics.add.collider(this.boss2,this.dungeon.solids);
  this.physics.add.overlap(this.player,this.boss2,(r,l)=>{
    if(l.dead||r.dead||this.state!=="playing")return;
    const h=r.x-l.x,u=r.y-l.y,p=Math.hypot(h,u)||1;
    this.damageSystem.apply({source:l,target:r,amount:l.data_.contactDamage,dir:{x:h/p,y:u/p}});
  });
  if(this.player2){
    this.physics.add.overlap(this.player2,this.boss2,(r,l)=>{
      if(l.dead||r.dead||this.state!=="playing")return;
      const h=r.x-l.x,u=r.y-l.y,p=Math.hypot(h,u)||1;
      this.damageSystem.apply({source:l,target:r,amount:l.data_.contactDamage,dir:{x:h/p,y:u/p}});
    });
  }
}'''
    assert target_spawnboss in code, "target_spawnboss not found!"
    code = code.replace(target_spawnboss, replacement_spawnboss, 1)
    print("  -> Wired SATYR_SISTERS dual boss spawn in spawnBoss.")

    # 7. Fraternal rage and completion check in onBossDefeated
    target_onbossdef = '''onBossDefeated(i){__bossLine(this.scene,i.typeKey,1,i);const t=this.rooms.find(d=>d.state==="active"&&(d.def.boss===i.typeKey||d.def.bossRush));'''
    replacement_onbossdef = '''onBossDefeated(i){__bossLine(this.scene,i.typeKey,1,i);
if(i.typeKey==="SATYR_SISTER_1"||i.typeKey==="SATYR_SISTER_2"||i.typeKey==="SATYR_SISTERS"){
  const other=(i===this.scene.boss?this.scene.boss2:this.scene.boss);
  if(other&&!other.dead){
    other.phase=2;other.speed=Math.round(other.speed*1.35);other.attackCooldown=0.4;other.setTint(0xff4444);
    this.scene.effects?.floatText(other.x,other.y-45,"FÚRIA FRATERNAL!","#ff3333");
    this.scene.game.events.emit("ui:banner","A OUTRA IRMÃ ENTRA EM FÚRIA!","#ff4444");
    this.scene.stats?.addXp(i.xp);this.scene.lootSystem?.dropFromBoss(i);
    return;
  }
}
const t=this.rooms.find(d=>d.state==="active"&&(d.def.boss===i.typeKey||(d.def.boss==="SATYR_SISTERS"&&(i.typeKey==="SATYR_SISTER_1"||i.typeKey==="SATYR_SISTER_2"))||d.def.bossRush));'''
    assert target_onbossdef in code, "target_onbossdef not found!"
    code = code.replace(target_onbossdef, replacement_onbossdef, 1)
    print("  -> Added Fraternal Rage & dual-death check to onBossDefeated.")

    # 8. Add Floresta Nevada and Mina Abandonada scenarios INSIDE ki object literal
    scenario_inner = ''',floresta_nevada:{id:"floresta_nevada",name:"Floresta Nevada",theme:{...xl,id:"floresta_nevada",name:"Floresta Nevada",tilesetKey:"tiles-floresta-nevada",music:{explore:"frozen",boss:"boss-ambience"},palette:{...xl.palette,stoneBase:56,stoneMortar:"#d0e4f8",stoneShadow:"rgba(10,20,40,0.4)"}},world:{cols:76,rows:46},rooms:[{id:"fn-00",name:"Trilha Congelada",rect:{x:8,y:8,w:16,h:12},ambient:.38,walls:[],enemies:[{type:"SHADOW_DEMON_1",col:14,row:13},{type:"SHADOW_DEMON_2",col:18,row:14},{type:"DRAGON_WYRMLING_FROST",col:20,row:11}],decor:[]},{id:"fn-01",name:"Bosque dos Pinheiros Brancos",rect:{x:30,y:8,w:16,h:12},ambient:.36,walls:[],enemies:[{type:"SHADOW_DEMON_1",col:36,row:12},{type:"SHADOW_DEMON_2",col:42,row:15,elite:!0}],decor:[]},{id:"fn-boss",name:"Covil das Irmãs Sátiro",rect:{x:52,y:8,w:18,h:14},ambient:.35,walls:[],hasBoss:!0,boss:"SATYR_SISTERS",roomType:"BOSS",enemies:[{type:"SATYR_SISTERS",col:61,row:15,boss:!0}],decor:[]}],corridors:[{x:24,y:13,w:6,h:3},{x:46,y:13,w:6,h:3}],doors:[],playerSpawn:{col:12,row:14},next:null},mina_abandonada:{id:"mina_abandonada",name:"Mina Abandonada",theme:{...Xn,id:"mina_abandonada",name:"Mina Abandonada",tilesetKey:"tiles-mina-abandonada",music:{explore:"catacombs-ambience",boss:"boss-ambience"},palette:{...Xn.palette,stoneBase:38,stoneMortar:"#1e140d",stoneShadow:"rgba(5,5,5,0.6)"}},world:{cols:76,rows:46},rooms:[{id:"ma-00",name:"Túnel dos Trilhos Quebrados",rect:{x:8,y:8,w:16,h:12},ambient:.28,walls:[],enemies:[{type:"SHADOW_DEMON_1",col:15,row:13},{type:"GOBLIN_ASSASSIN",col:19,row:12},{type:"SHADOW_DEMON_2",col:14,row:16}],decor:[]},{id:"ma-01",name:"Caverna dos Minérios Raros",rect:{x:30,y:8,w:16,h:12},ambient:.26,walls:[],enemies:[{type:"SHADOW_DEMON_2",col:37,row:13,elite:!0},{type:"TROLL",col:42,row:14}],decor:[]},{id:"ma-boss",name:"Câmara das Profundezas Obscuras",rect:{x:52,y:8,w:18,h:14},ambient:.25,walls:[],hasBoss:!0,boss:"SATYR_SISTERS",roomType:"BOSS",enemies:[{type:"SATYR_SISTERS",col:61,row:15,boss:!0}],decor:[]}],corridors:[{x:24,y:13,w:6,h:3},{x:46,y:13,w:6,h:3}],doors:[],playerSpawn:{col:12,row:14},next:null}'''

    target_ki_end = 'playerSpawn:yl,next:null}}'
    assert target_ki_end in code, "target_ki_end not found!"
    code = code.replace(target_ki_end, 'playerSpawn:yl,next:null}' + scenario_inner + '}', 1)
    print("  -> Added floresta_nevada and mina_abandonada inside ki object literal.")

    # 9. Add SATYR_SISTERS and shadow demons to Bestiary
    target_bk_bosses = '__BK_BOSSES = ['
    replacement_bk_bosses = '__BK_BOSSES = ["SATYR_SISTERS", "SATYR_SISTER_1", "SATYR_SISTER_2", '
    assert target_bk_bosses in code, "target_bk_bosses not found!"
    code = code.replace(target_bk_bosses, replacement_bk_bosses, 1)
    print("  -> Added SATYR_SISTERS to Bestiary boss list.")

    # 10. Add Shadow Demons and biomes to Endless mode factions & rotation
    target_factions = 'DEMON:{biomes:["catacombs","fortress"],members:[{type:"DEMON",cost:4,minDepth:3}'
    replacement_factions = 'DEMON:{biomes:["catacombs","fortress","floresta_nevada","mina_abandonada"],members:[{type:"SHADOW_DEMON_1",cost:3,minDepth:1},{type:"SHADOW_DEMON_2",cost:4,minDepth:2},{type:"DEMON",cost:4,minDepth:3}'
    assert target_factions in code, "target_factions not found!"
    code = code.replace(target_factions, replacement_factions, 1)
    print("  -> Added Shadow Demons to DEMON faction in Endless Mode.")

    # Also add SATYR_SISTERS to endless boss pool
    target_boss_pool = '"FOX_WITCH","CASTLE_LORD","BEHOLDER","PALE_DRAGON","CERBERUS"].filter(k=>Yt[k])'
    replacement_boss_pool = '"FOX_WITCH","CASTLE_LORD","BEHOLDER","PALE_DRAGON","CERBERUS","SATYR_SISTERS"].filter(k=>Yt[k])'
    assert target_boss_pool in code, "target_boss_pool not found!"
    code = code.replace(target_boss_pool, replacement_boss_pool, 1)
    print("  -> Added SATYR_SISTERS to endless boss pool.")

    # Also add SATYR_SISTERS to Challenge Rift pool
    target_rift_pool = '"BEHOLDER", "PALE_DRAGON", "CERBERUS",'
    replacement_rift_pool = '"BEHOLDER", "PALE_DRAGON", "CERBERUS", "SATYR_SISTERS",'
    assert target_rift_pool in code, "target_rift_pool not found!"
    code = code.replace(target_rift_pool, replacement_rift_pool, 1)
    print("  -> Added SATYR_SISTERS to Challenge Rift boss pool.")

    # Save patched code
    with open(path, 'w', encoding='utf-8') as f:
        f.write(code)
    print(f"Finished patching {path}.")

patch_bundle(r'assets/index-D6qIWtA7-p209.js')
patch_bundle(r'Projeto atualizado/assets/index-D6qIWtA7-p209.js')
