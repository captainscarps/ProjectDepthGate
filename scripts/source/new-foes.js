/* ── Inimigos novos (pacotes craftpix) ─────────────────────────────────────────────────────────────
   Esqueletos: Legionário (escudo + investida), Lanceiro (estocada longa), Atirador (flecha rápida)
   Cultistas Piromantes: Cultista (bola de fogo + círculo de chamas), Zelote (lança-chamas), Lâmina das
   Cinzas (veloz, adaga + fogo)
   Deserto: Guardião de Anúbis, Mantícora (ácido venenoso + bote), Estátua Desperta (pesada, disparo de luz)
   Espiões do Observador: 3 olhos (Pálido, Rubro, do Vazio) que podem surgir a qualquer momento numa fase,
   com barra de chefe; se não forem abatidos a tempo, fogem. Recompensa grande.
   Folhas: scripts/build_new_foes.py (__NF_META é injetado pelo scripts/patch_new_foes.py).          */
function __nfAn(k,extra){const m=__NF_META[k].anims,f=(n,r,rep)=>({frames:m[n],frameRate:r,repeat:rep});
 return{idle:f("idle",7,-1),walk:f("walk",10,-1),run:f("run",13,-1),alert:f("alert",8,0),windup:f("windup",10,0),strike:f("strike",14,0),recover:f("recover",9,0),hurt:f("hurt",12,0),death:f("death",8,0),...(extra||{})}}
const __NF_LOOT={COMMON:40,UNCOMMON:38,RARE:18,EPIC:4};
const __NF_DEFS={
 SKELETON_LEGIONARY:{name:"Legionário Esquelético",texture:"nf-skeleton-legion",sizeClass:"small",bodySize:18,speed:72,maxHp:6,damage:2,hitFlashMs:120,behavior:"chase",knockbackResist:.35,
  ai:{detectionRange:220,loseTargetRange:360,attackRange:44,patrol:!0,attacks:[{type:"MELEE_SLASH",damage:2,range:42,width:36,telegraphMs:460,recoverMs:520,cooldownMs:1700,sound:"sfx-skeleton-attack"},{type:"CHARGE",damage:3,speed:250,durationMs:420,minRange:90,maxRange:200,telegraphMs:520,cooldownMs:4200}]},
  xp:60,gold:{min:4,max:9,chance:.65},loot:{chance:.45,pools:["sword","club","helmet","armor","potion"],rarities:{COMMON:55,UNCOMMON:32,RARE:11,EPIC:2}},anims:"skeleton-legion"},
 SKELETON_SPEARMAN:{name:"Lanceiro Esquelético",texture:"nf-skeleton-spear",sizeClass:"small",bodySize:18,speed:80,maxHp:5,damage:2,hitFlashMs:120,behavior:"chase",
  ai:{detectionRange:230,loseTargetRange:360,attackRange:56,patrol:!0,attacks:[{type:"MELEE_SLASH",damage:2,range:58,width:22,telegraphMs:420,recoverMs:480,cooldownMs:1500,sound:"sfx-skeleton-attack"},{type:"CHARGE",damage:3,speed:270,durationMs:380,minRange:80,maxRange:190,telegraphMs:480,cooldownMs:3800}]},
  xp:55,gold:{min:3,max:8,chance:.6},loot:{chance:.4,pools:["axe","club","boots","helmet","potion"],rarities:{COMMON:58,UNCOMMON:30,RARE:10,EPIC:2}},anims:"skeleton-spear"},
 SKELETON_SHARPSHOOTER:{name:"Atirador Esquelético",texture:"nf-skeleton-sharp",sizeClass:"small",bodySize:18,speed:82,maxHp:4,damage:1,hitFlashMs:120,behavior:"chase",
  ai:{detectionRange:280,loseTargetRange:400,preferredRange:190,retreatRange:120,attacks:[{type:"PROJECTILE",damage:2,speed:330,maxDist:340,minRange:80,maxRange:300,castMs:560,cooldownMs:2e3,texture:"nf-proj-arrow",sound:"sfx-ranged-enemy-attack"}]},
  xp:55,gold:{min:3,max:8,chance:.6},loot:{chance:.42,pools:["bow","long_bow","dagger","boots","potion"],rarities:{COMMON:52,UNCOMMON:33,RARE:12,EPIC:3}},anims:"skeleton-sharp"},
 PYRO_CULTIST:{name:"Cultista Piromante",texture:"nf-pyro-cultist",sizeClass:"small",bodySize:18,speed:68,maxHp:5,damage:1,hitFlashMs:120,behavior:"chase",
  ai:{detectionRange:270,loseTargetRange:400,preferredRange:180,retreatRange:120,attacks:[{type:"PROJECTILE",damage:2,speed:220,maxDist:320,minRange:70,maxRange:300,castMs:650,cooldownMs:2400,texture:"nf-proj-fireball",damageType:"magical",status:{key:"BURN",duration:2},sound:"sfx-ranged-enemy-attack"},{type:"AREA_BLAST",damage:3,radius:46,minRange:70,maxRange:250,telegraphMs:950,cooldownMs:4800,color:16742954,sound:"sfx-demon-attack"}]},
  xp:65,gold:{min:5,max:10,chance:.65},loot:{chance:.45,pools:["staff","inferno_staff","simple_staff","ring","amulet","potion"],rarities:{COMMON:45,UNCOMMON:35,RARE:16,EPIC:4}},anims:"pyro-cultist"},
 PYRO_ZEALOT:{name:"Zelote Piromante",texture:"nf-pyro-zealot",sizeClass:"small",bodySize:19,speed:78,maxHp:8,damage:2,hitFlashMs:120,behavior:"chase",knockbackResist:.25,
  ai:{detectionRange:240,loseTargetRange:380,attackRange:46,attacks:[{type:"FIRE_BREATH",damage:3,length:100,width:40,minRange:30,maxRange:105,telegraphMs:600,recoverMs:650,cooldownMs:3400,colors:[16742954,16765002],status:{key:"BURN",duration:2.5},sound:"sfx-dragon-fire-breath"},{type:"MELEE_SLASH",damage:2,range:46,width:40,telegraphMs:420,recoverMs:500,cooldownMs:1700}]},
  xp:80,gold:{min:6,max:12,chance:.7},loot:{chance:.5,pools:["ember_bow","inferno_staff","club","armor","ember_amulet","potion"],rarities:{COMMON:38,UNCOMMON:38,RARE:19,EPIC:5}},anims:"pyro-zealot"},
 PYRO_ASHBLADE:{name:"Lâmina das Cinzas",texture:"nf-pyro-ashblade",sizeClass:"small",bodySize:17,speed:108,maxHp:6,damage:2,hitFlashMs:110,behavior:"chase",
  ai:{detectionRange:260,loseTargetRange:400,attackRange:40,dashBurst:{minDist:80,maxDist:200,mult:2.3,durationMs:300,cooldownMs:2600},attacks:[{type:"MELEE_SLASH",damage:3,range:40,width:30,telegraphMs:300,recoverMs:420,cooldownMs:1300,sound:"sfx-skeleton-attack"},{type:"PROJECTILE",damage:2,speed:280,maxDist:260,minRange:90,maxRange:240,castMs:420,cooldownMs:3200,texture:"nf-proj-fireball",damageType:"magical",status:{key:"BURN",duration:1.5}}]},
  xp:75,gold:{min:5,max:11,chance:.7},loot:{chance:.48,pools:["dagger","ember_bow","boots","ring","potion"],rarities:{COMMON:40,UNCOMMON:36,RARE:19,EPIC:5}},anims:"pyro-ashblade"},
 ANUBIS_WARDEN:{name:"Guardião de Anúbis",texture:"nf-anubis",sizeClass:"medium",bodySize:22,speed:62,maxHp:18,damage:3,hitFlashMs:120,behavior:"chase",knockbackResist:.55,
  ai:{detectionRange:260,loseTargetRange:400,attackRange:50,attacks:[{type:"MELEE_SLASH",damage:4,range:50,width:48,telegraphMs:520,recoverMs:600,cooldownMs:1900,sound:"sfx-wood-attack"},{type:"PROJECTILE",damage:3,speed:200,maxDist:330,minRange:80,maxRange:300,castMs:650,cooldownMs:2600,texture:"nf-proj-orb",damageType:"magical",sound:"sfx-ranged-enemy-attack"},{type:"AREA_BLAST",damage:4,radius:54,minRange:60,maxRange:260,telegraphMs:1e3,cooldownMs:6e3,color:8308991,sound:"sfx-demon-attack"}]},
  xp:220,gold:{min:14,max:26,chance:.85},loot:{chance:.7,pools:["staff","arcane_staff","amulet","ring","armor","helmet","potion"],rarities:{UNCOMMON:40,RARE:40,EPIC:17,LEGENDARY:3}},anims:"anubis"},
 MANTICORE:{name:"Mantícora",texture:"nf-manticore",sizeClass:"medium",bodySize:22,speed:96,maxHp:16,damage:3,hitFlashMs:120,behavior:"chase",knockbackResist:.45,
  ai:{detectionRange:270,loseTargetRange:420,attackRange:44,attacks:[{type:"PROJECTILE",damage:2,speed:240,maxDist:300,minRange:80,maxRange:270,castMs:520,cooldownMs:2400,texture:"nf-proj-acid",status:{key:"POISON",duration:3},sound:"sfx-ranged-enemy-attack"},{type:"CHARGE",damage:4,speed:300,durationMs:420,minRange:80,maxRange:220,telegraphMs:500,cooldownMs:4e3},{type:"MELEE_SLASH",damage:3,range:44,width:40,telegraphMs:380,recoverMs:500,cooldownMs:1500,sound:"sfx-frost-wolf-attack"}]},
  xp:200,gold:{min:12,max:24,chance:.85},loot:{chance:.65,pools:["dagger","bow","boots","armor","amulet","potion"],rarities:{UNCOMMON:42,RARE:38,EPIC:17,LEGENDARY:3}},anims:"manticore"},
 REVIVED_STATUE:{name:"Estátua Desperta",texture:"nf-revived-statue",sizeClass:"large",bodySize:22,speed:44,maxHp:30,damage:4,hitFlashMs:120,behavior:"chase",knockbackResist:.9,
  ai:{detectionRange:240,loseTargetRange:380,attackRange:56,attacks:[{type:"HEAVY_SMASH",damage:5,radius:54,maxRange:60,telegraphMs:760,recoverMs:800,cooldownMs:2800,sound:"sfx-wood-attack"},{type:"PROJECTILE",damage:3,speed:290,maxDist:320,minRange:90,maxRange:300,castMs:600,cooldownMs:2600,texture:"nf-proj-shard",damageType:"magical",sound:"sfx-ranged-enemy-attack"}]},
  xp:300,gold:{min:18,max:34,chance:.9},loot:{chance:.8,pools:["great_sword","club","armor","helmet","amulet","potion"],rarities:{UNCOMMON:35,RARE:42,EPIC:19,LEGENDARY:4}},anims:"revived-statue"}};
/* espiões do Observador: chefes surpresa */
const __BH_LOOT={chance:1,pools:["sword","great_sword","axe","dagger","staff","arcane_staff","bow","long_bow","armor","helmet","boots","ring","amulet"],rarities:{RARE:30,EPIC:50,LEGENDARY:20}};
const __bhDef=(name,tex,hp,dmg,spd,xp,gold,col,col2,status,extra)=>({name,texture:tex,sizeClass:"large",bodySize:26,speed:spd,maxHp:hp,damage:dmg,hitFlashMs:110,behavior:"chase",knockbackResist:.95,spy:!0,
 ai:{movementMode:"flying",detectionRange:420,loseTargetRange:900,preferredRange:150,retreatRange:80,attacks:[
  {type:"PROJECTILE",damage:dmg,speed:240,maxDist:360,minRange:60,maxRange:330,castMs:480,cooldownMs:1500,texture:"proj-bolt",tint:col,damageType:"magical",status,sound:"sfx-ranged-enemy-attack"},
  {type:"FIRE_BREATH",damage:dmg+1,length:150,width:30,minRange:40,maxRange:150,telegraphMs:720,recoverMs:650,cooldownMs:4200,colors:[col,col2],damageType:"magical",status,sound:"sfx-dragon-fire-breath"},
  {type:"AREA_BLAST",damage:dmg+1,radius:62,minRange:50,maxRange:300,telegraphMs:1e3,cooldownMs:5200,color:col,sound:"sfx-demon-attack"},...(extra||[])]},
 xp,gold:{min:gold,max:Math.round(gold*1.6),chance:1},loot:__BH_LOOT,anims:tex.slice(3)});
__NF_DEFS.SPY_EYE_PALE=__bhDef("Olho Espião Pálido","nf-eye-pale",55,3,62,900,90,16773544,16777215,null);
__NF_DEFS.SPY_EYE_CRIMSON=__bhDef("Olho Espião Rubro","nf-eye-crimson",80,4,66,1300,130,16734794,16765002,{key:"BURN",duration:2});
__NF_DEFS.SPY_EYE_VOID=__bhDef("Olho Espião do Vazio","nf-eye-void",110,5,70,1800,180,11561727,7228159,{key:"SLOW",duration:1.8},[{type:"CHARGE",damage:6,speed:300,durationMs:450,minRange:90,maxRange:230,telegraphMs:560,cooldownMs:5200}]);
for(const[k,d]of Object.entries(__NF_DEFS)){const m=__NF_META[d.anims];d.anims=__nfAn(d.anims);ee[k]=d;Si[d.texture]=m.si}
/* modo infinito e mapas gerados: novas facções */
try{ga.UNDEAD.biomes.includes("temple")||ga.UNDEAD.biomes.push("temple");
 ga.LEGION={biomes:["catacombs","ruins","temple"],members:[{type:"SKELETON_SPEARMAN",cost:3,minDepth:2},{type:"SKELETON_LEGIONARY",cost:4,minDepth:3},{type:"SKELETON_SHARPSHOOTER",cost:4,minDepth:4}]};
 ga.PYRO_CULT={biomes:["fortress","catacombs","temple"],members:[{type:"PYRO_CULTIST",cost:4,minDepth:3},{type:"PYRO_ASHBLADE",cost:5,minDepth:5},{type:"PYRO_ZEALOT",cost:6,minDepth:7}]};
 ga.DESERT={biomes:["temple"],members:[{type:"SKELETON_SPEARMAN",cost:3,minDepth:1},{type:"MANTICORE",cost:7,minDepth:4},{type:"ANUBIS_WARDEN",cost:7,minDepth:5},{type:"REVIVED_STATUE",cost:9,minDepth:8}]}}catch(e){}
/* campanha: as salas de cada fase ganham os inimigos novos (troca fixa por sala, sempre igual) */
function __nfH(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return(h%1e3)/1e3}
const __NF_MIX=[
 [/^deserto/,{GOBLIN:[1,"SKELETON_SPEARMAN"],GOBLIN_ARCHER:[1,"SKELETON_SHARPSHOOTER"],DEMON:[1,"MANTICORE"],DEMON_CASTER:[1,["PYRO_CULTIST","REVIVED_STATUE"]],ORC_WARRIOR:[1,"ANUBIS_WARDEN"],SKELETON_WARRIOR:[.6,"SKELETON_LEGIONARY"],SKELETON_MAGE:[1,"REVIVED_STATUE"],SKELETON:[.5,"SKELETON_LEGIONARY"],GHOST:[.6,["REVIVED_STATUE","REVIVED_STATUE","ANUBIS_WARDEN"]],NECRO_SHADE:[.5,"PYRO_ASHBLADE"]}],
 [/^c\d\d$/,{SKELETON_WARRIOR:[.5,"SKELETON_LEGIONARY"],SKELETON:[.45,"SKELETON_SPEARMAN"],SKELETON_ARCHER:[.6,"SKELETON_SHARPSHOOTER"],DEMON_CASTER:[1,"PYRO_CULTIST"],SKELETON_MAGE:[.4,"PYRO_CULTIST"]}],
 [/^(ossuario|galeria|cripta|capela)/,{SKELETON_WARRIOR:[.6,"SKELETON_LEGIONARY"],SKELETON_ARCHER:[.7,"SKELETON_SHARPSHOOTER"],SKELETON:[.5,"SKELETON_SPEARMAN"],SKELETON_MAGE:[.5,"PYRO_CULTIST"]}],
 [/^morta/,{SKELETON_WARRIOR:[.6,"SKELETON_LEGIONARY"],SKELETON:[.45,"SKELETON_SPEARMAN"],SKELETON_ARCHER:[1,"SKELETON_SHARPSHOOTER"],SKELETON_MAGE:[.35,"PYRO_CULTIST"],DEMON:[1,"PYRO_ZEALOT"]}],
 [/^vulcao/,{DEMON_CASTER:[1,["PYRO_CULTIST","PYRO_ASHBLADE"]],DEMON:[.5,"PYRO_ZEALOT"],ORC_WARRIOR:[1,"PYRO_ASHBLADE"]}],
 [/^rio/,{DEMON_CASTER:[1,"PYRO_CULTIST"],ORC_WARRIOR:[.4,"PYRO_ASHBLADE"]}],
 [/^(salao|ruinas|santuario|arena)$/,{SKELETON_WARRIOR:[.5,"SKELETON_LEGIONARY"],SKELETON_ARCHER:[.5,"SKELETON_SHARPSHOOTER"],DEMON_CASTER:[1,"PYRO_CULTIST"]}],
 [/^(salao-antigos|patio|templo)$/,{GOBLIN_ASSASSIN:[1,"PYRO_ASHBLADE"],ORC_BRUTE:[1,"PYRO_ZEALOT"],GOBLIN_ARCHER:[.5,"PYRO_CULTIST"]}],
 [/^(ashen|molten|dragon-shrine)/,{SKELETON_WARRIOR:[1,"SKELETON_LEGIONARY"],ORC_BRUTE:[.5,"PYRO_ZEALOT"],HARPY:[.5,"PYRO_ASHBLADE"]}]];
function __nfMixList(id,list){const rule=__NF_MIX.find(([re])=>re.test(id));if(!rule||!list?.length)return list;
 return list.map((e,i)=>{const r=rule[1][e.type];if(!r||e.boss)return e;const h=__nfH(id+"#"+i);if(h>=r[0])return e;const t=Array.isArray(r[1])?r[1][Math.floor(__nfH(id+"@"+i)*r[1].length)]:r[1];return{...e,type:t,nfFrom:e.type}})}
function __nfMix(D){if(D.scene?.endlessRun?.())return;for(const rm of D.rooms||[]){const df=rm.def,id=String(rm.id??df?.id??"");if(df?.enemies?.length)df.enemies=__nfMixList(id,df.enemies)}}
/* a troca vale direto nos dados das fases: o bestiário (onde aparece) e a campanha enxergam o mesmo */
try{for(const lv of Object.values(ki))for(const r of lv.rooms||[])r.enemies?.length&&(r.enemies=__nfMixList(String(r.id??""),r.enemies))}catch(e){}
/* sombra e aura do tamanho do corpo (os quadros têm folga para os golpes) */
{const U=lh.prototype.update;lh.prototype.update=function(i,t){if(!this.__nfS&&this.texture?.key?.startsWith?.("nf-")){this.__nfS=1;const m=__NF_META[this.texture.key.slice(3)];if(m){const w=m.visW*Math.abs(this.scaleX);this.isFlying||this.shadow?.setScale(w*1.1/34);this.eliteAura?.setScale(w*1.5/42)}}return U.call(this,i,t)}}
/* ── espiões do Observador ── */
const __BH_TYPES=["SPY_EYE_PALE","SPY_EYE_CRIMSON","SPY_EYE_VOID"];
try{const W=()=>__L3("Qualquer fase da Campanha e do Modo Infinito — surge de surpresa e foge se não for abatido","Any Campaign or Endless stage — appears by surprise and flees if not slain","Cualquier fase de la Campaña y del Modo Infinito — aparece por sorpresa y huye si no es abatido");for(const k of __BH_TYPES)Object.defineProperty(__BK_EXTRA_WHERE,k,{get:W,enumerable:!0,configurable:!0})}catch(e){}
function __bhInit(S){try{const lid=String(S.levelId??S.level?.id??"");if(S.isRift||/hub|refuge|tutorial|prolog/i.test(lid)||S.game.registry.get("mode")==="hub")return;if(lid==="forest"&&!S.endlessRun?.()){__fsInit(S);return}
 S.__bh={t0:S.time.now,done:0,spy:null};const ev=S.time.addEvent({delay:15e3,loop:!0,callback:()=>__bhTick(S)});const up=()=>__bhUpdate(S);S.events.on("update",up);
 S.events.once("shutdown",()=>{ev.remove();S.events.off("update",up);__bhBar(S,null)})}catch(e){}}
function __bhTick(S,force){const B=S.__bh;if(!B||B.spy||S.state!=="playing"||!S.player||S.player.dead)return;if(S.boss&&!S.boss.dead&&S.boss.active)return;
 if(!force&&!window.__bhForce){if(B.done>=1||S.time.now-B.t0<75e3)return;if(Math.random()>(window.__BH_CHANCE??.06))return}window.__bhForce=!1;__bhSpawn(S)}
function __bhPick(S){const lv=S.stats?.level??1,w=lv<6?[60,30,10]:lv<12?[35,40,25]:[20,40,40];let r=Math.random()*100;for(let i=0;i<3;i++){if((r-=w[i])<0)return __BH_TYPES[i]}return __BH_TYPES[0]}
function __bhSpawn(S,type){const p=S.player,L3=__L3;let x=null,y=null;for(let k=0;k<40;k++){const a=Math.random()*Math.PI*2,d=150+Math.random()*80,tx=p.x+Math.cos(a)*d,ty=p.y+Math.sin(a)*d;let ok=!S.dungeon.isWallAtWorld(tx,ty);for(const[ox,oy]of[[20,0],[-20,0],[0,20],[0,-20]])ok=ok&&!S.dungeon.isWallAtWorld(tx+ox,ty+oy);if(ok){x=tx;y=ty;break}}
 if(x==null){x=p.x+(Math.random()<.5?-1:1)*60;y=p.y-40;if(S.dungeon.isWallAtWorld(x,y))return}
 const B=S.__bh;B.done++;type=type||__bhPick(S);
 S.game.events.emit("ui:banner",L3("👁 UM ESPIÃO DO OBSERVADOR!","👁 A SPY OF THE OBSERVER!","👁 ¡UN ESPÍA DEL OBSERVADOR!"),"#c9a0ff");
 S.cameraSys?.shake?.(.006,320);S.audio?.play?.("sfx-elite-spawn");S.effects?.shockwaveRing?.(x,y,60);
 const glow=S.add.image(x,y,"light").setTint(11561727).setBlendMode(j.BlendModes.ADD).setAlpha(0).setScale(.2).setDepth(y+5);S.tweens.add({targets:glow,alpha:.9,scale:2.2,duration:700,yoyo:!0,onComplete:()=>glow.destroy()});
 S.time.delayedCall(650,()=>{if(!S.scene.isActive()||S.state!=="playing")return;const e=S.spawnEnemy(type,Math.floor(x/dt),Math.floor(y/dt),{eliteRoll:!1});if(!e)return;e.x=x;e.y=y;e.isSpy=!0;e.aggro=!0;if(e.ai)e.ai.aggro=!0;
  S.effects?.burstTinted?.(x,y,11561727,30);S.effects?.burstTinted?.(x,y,16777215,12);e.setAlpha(0);S.tweens.add({targets:e,alpha:1,duration:450});
  B.spy=e;B.until=S.time.now+(window.__BH_TIME??85e3);B.warned=!1;__bhBar(S,e)})}
function __bhBar(S,e){try{const U=S.scene.get("UI"),bar=U?.bossBar;if(!bar)return;if(e){bar.show(e.data_.name,__L3("Espião do Observador","Spy of the Observer","Espía del Observador"));bar.setHp(e.hp,e.maxHp,1)}else if(!(S.boss&&!S.boss.dead&&S.boss.active))bar.hide()}catch(err){}}
function __bhUpdate(S){const B=S.__bh,e=B?.spy;if(!e)return;const L3=__L3;
 if(e.dead||!e.active){B.spy=null;__bhBar(S,null);if(e.dead&&!e.__bhGone){S.game.events.emit("ui:banner",L3("ESPIÃO ABATIDO! O Observador perdeu um olho.","SPY SLAIN! The Observer lost an eye.","¡ESPÍA ABATIDO! El Observador perdió un ojo."),"#ffd24a");try{S.lootSystem?.spawnGold?.(e.x,e.y+10,Math.round(40+(S.stats?.level??1)*6))}catch(err){}}return}
 try{S.scene.get("UI")?.bossBar?.setHp(e.hp,e.maxHp,1)}catch(err){}
 if(!B.warned&&S.time.now>B.until-12e3){B.warned=!0;S.game.events.emit("ui:banner",L3("O espião está prestes a fugir!","The spy is about to escape!","¡El espía está por huir!"),"#c9a0ff")}
 if(S.time.now>B.until)__bhEscape(S,e)}
function __bhEscape(S,e){const B=S.__bh;B.spy=null;e.__bhGone=!0;e.dead=!0;try{e.body&&(e.body.enable=!1);e.setVelocity?.(0,0)}catch(err){}
 S.effects?.burstTinted?.(e.x,e.y,11561727,26);S.game.events.emit("ui:banner",__L3("O espião fugiu para contar ao Observador...","The spy fled to report to the Observer...","El espía huyó para avisar al Observador..."),"#a89468");__bhBar(S,null);
 S.tweens.add({targets:e,alpha:0,y:e.y-30,scale:e.scale*.4,duration:700,onComplete:()=>{for(const k of["shadow","hpBar","eliteAura","eliteLabel","eliteEyes"])try{e[k]?.destroy()}catch(err){}try{e.destroy()}catch(err){}}})}
window.__bhSpawnNow=t=>{const S=window.__DED_GAME?.scene?.getScene?.("Game");S?.__bh&&__bhSpawn(S,t)};

/* ── Floresta de Eldervale: os espiões ainda não atacam aqui. Um olho só aparece espiando de longe (parte do
   cenário) e some; a Guardiã avisa que o Observador tem espiões por toda parte. Antes de encontrá-la, o herói
   se pergunta de quem é a voz que falou com ele no rio. ── */
function __heroBubble(S,t,ms=3400){const p=S.player;if(!p||!S.sys.isActive())return;const tx=S.add.text(0,0,t,{fontFamily:"Georgia, 'Times New Roman', serif",fontStyle:"italic",fontSize:"13px",color:"#1d2433",align:"center",wordWrap:{width:200}}).setOrigin(.5),w=tx.width+18,h=tx.height+10,bg=S.add.graphics();
 bg.fillStyle(15660798,.94).lineStyle(1.5,4877680,.9).fillRoundedRect(-w/2,-h/2,w,h,7).strokeRoundedRect(-w/2,-h/2,w,h,7).fillStyle(15660798,.94).fillTriangle(-6,h/2-1,6,h/2-1,0,h/2+7).lineStyle(1.5,4877680,.9).lineBetween(-6,h/2,0,h/2+7).lineBetween(6,h/2,0,h/2+7);
 S.__hbBox?.destroy?.();const box=S.add.container(p.x,p.y-74-h/2,[bg,tx]).setDepth(9600).setAlpha(0).setScale(.85);S.__hbBox=box;const fol=()=>{const q=S.player;q&&box.active&&box.setPosition(q.x,q.y-74-h/2)};S.events.on("update",fol);
 S.tweens.add({targets:box,alpha:1,scale:1,duration:220,ease:"Back.easeOut"});S.time.delayedCall(ms,()=>box.active&&S.tweens.add({targets:box,alpha:0,duration:350,onComplete:()=>{S.events.off("update",fol);box.destroy()}}))}
function __calmNow(S){if(S.state!=="playing"||S.uiOpen||!S.player||S.player.dead)return!1;for(const e of S.enemies?.getChildren?.()||[])if(!e.dead&&e.active&&Math.hypot(e.x-S.player.x,e.y-S.player.y)<300&&(e.ai?.aggro||e.aggro))return!1;return!0}
function __fsInit(S){const L3=__L3,reg=S.game.registry,met=()=>!!reg.get("story:gIntro");
 /* falas do herói antes de conhecer a Guardiã */
 const Q=[L3("Aquela voz no rio… disse que estaria me esperando. Mas quem é ela?","That voice on the river… it said it would be waiting for me. But who is she?","Esa voz en el río… dijo que me estaría esperando. ¿Pero quién es?"),
  L3("Sinto que alguém está me guiando… ou me observando.","I feel like someone is guiding me… or watching me.","Siento que alguien me guía… o me observa."),
  L3("Voz… se você está aí, mostre-se!","Voice… if you're out there, show yourself!","Voz… si estás ahí, ¡muéstrate!")];
 let qi=0;const qt=S.time.addEvent({delay:5200,loop:!0,callback:()=>{if(met()||qi>=Q.length){qt.remove();return}if(!__calmNow(S))return;__heroBubble(S,Q[qi++]);qt.delay=28e3}});
 /* um olho do Observador espiando de longe, uma vez por visita */
 const at=S.time.now+(40+Math.random()*40)*1e3;let seen=!1;
 const ck=S.time.addEvent({delay:2e3,loop:!0,callback:()=>{if(seen||S.time.now<at||!__calmNow(S))return;seen=!0;ck.remove();__fsSight(S)}});
 S.events.once("shutdown",()=>{qt.remove();ck.remove()})}
function __fsSight(S){const p=S.player,L3=__L3;let x=null,y=null;for(let k=0;k<40;k++){const a=Math.random()*Math.PI*2,d=170+Math.random()*60,tx=p.x+Math.cos(a)*d,ty=p.y+Math.sin(a)*d;if(!S.dungeon.isWallAtWorld(tx,ty)&&!S.dungeon.isWallAtWorld(tx,ty+16)){x=tx;y=ty;break}}if(x==null)return;
 const tex="nf-eye-pale";if(!S.textures.exists(tex))return;const m=__NF_META["eye-pale"],e=S.add.sprite(x,y,tex,0).setScale(m.si*2*.85).setAlpha(0).setDepth(y+40);S.anims.exists(tex+"-idle")&&e.play(tex+"-idle");e.setFlipX(p.x<x);
 const gl=S.add.image(x,y,"light").setTint(11561727).setBlendMode(j.BlendModes.ADD).setAlpha(0).setScale(.9).setDepth(y+39);
 S.tweens.add({targets:[e],alpha:.9,duration:900});S.tweens.add({targets:gl,alpha:.35,duration:900});S.tweens.add({targets:[e,gl],y:"-=6",duration:1100,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"});
 S.audio?.play?.("sfx-elite-spawn");S.time.delayedCall(700,()=>__heroBubble(S,L3("…O que é aquilo?!","…What is that?!","…¿¡Qué es eso!?"),2400));
 const gone=()=>{if(!e.active)return;S.effects?.burstTinted?.(e.x,e.y,11561727,18);S.tweens.killTweensOf([e,gl]);S.tweens.add({targets:[e,gl],alpha:0,scale:.1,duration:380,onComplete:()=>{e.destroy();gl.destroy()}});__fsWarn(S)};
 const nearT=S.time.addEvent({delay:120,loop:!0,callback:()=>{if(!e.active){nearT.remove();return}if(Math.hypot(S.player.x-e.x,S.player.y-e.y)<90){nearT.remove();gone()}}});
 S.time.delayedCall(3600,()=>{nearT.remove();gone()})}
function __fsWarn(S){if(__stFlag(S,"spyWarn"))return;__stFlag(S,"spyWarn",!0);const L3=__L3,met=!!S.game.registry.get("story:gIntro"),nm=met?__GN:L3("A VOZ","THE VOICE","LA VOZ"),hn=(__HN[S.classDef?.id]||"").toUpperCase();
 const L=[{who:met?"guardia":null,expr:"aggression",name:nm,text:L3("Não se aproxime. Aquilo era um olho do Observador.","Don't go near it. That was an eye of the Observer.","No te acerques. Eso era un ojo del Observador.")},
  {who:met?"guardia":null,expr:"sadness",name:nm,text:L3("Ele espalha espiões por todas as terras. Mesmo agora, alguém pode estar nos observando.","He spreads spies across every land. Even now, someone may be watching us.","Él esparce espías por todas las tierras. Incluso ahora, alguien podría estar observándonos.")},
  {who:met?"guardia":null,expr:"talk",name:nm,text:L3("Lá fora, nas terras além dos portais, eles vão atacar. Derrube-os antes que fujam.","Out there, in the lands beyond the gates, they will attack. Strike them down before they flee.","Allá afuera, en las tierras más allá de los portales, atacarán. Derríbalos antes de que huyan.")}];
 met||L.push({name:hn,text:L3("De novo essa voz… quem é você, afinal?","That voice again… who are you, really?","Otra vez esa voz… ¿quién eres, en realidad?")});
 S.time.delayedCall(500,()=>S.scene.isActive()&&(met?__gSay(S,L):__dlg(S,L)))}
window.__fsSightNow=()=>{const S=window.__DED_GAME?.scene?.getScene?.("Game");S&&__fsSight(S)};
