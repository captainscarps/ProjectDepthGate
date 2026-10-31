/* ══ Árvores do Modo Infinito · habilidades novas (ativas) ══════════════════════════════════════════════════
   type "et": executadas por __ETAB[id]; as demais usam os tipos do jogo (projétil, leque, fumaça).
   cd2 = recarga no grau II; ch2 = grau II dá 2 cargas. */
const __ETABD=[
 ["ET_AEGIS","wd_egide",{type:"et",cost:0,cd:14,cd2:10,icon:"icon-aegis",sound:"sfx-warrior-iron-skin",tint:16761165}],
 ["ET_CLAN_CRY","wd_brado",{type:"et",cost:0,cd:12,cd2:9,icon:"icon-guardian-wave",sound:"sfx-warrior-whirlwind",tint:16765514}],
 ["ET_CHARGE","wa_inv",{type:"et",cost:0,cd:9,icon:"icon-shadow-strike",sound:"sfx-rogue-shadow-step",tint:13214282,aim:!0}],
 ["ET_SPIN","wa_redm",{type:"et",cost:0,cd:11,icon:"icon-whirlwind",sound:"sfx-warrior-whirlwind",tint:16756810}],
 ["ET_PARRY","bd_apa",{type:"et",cost:10,cd:8,cd2:6,icon:"icon-shield-counter",sound:"sfx-warrior-iron-skin",tint:12640767}],
 ["ET_TSUBAME","ba_tsu",{type:"et",cost:20,cd:7,icon:"icon-tsumuji",sound:"sfx-warrior-heavy-strike",tint:16762052,aim:!0}],
 ["ET_QUAKE","ba_terr",{type:"et",cost:30,cd:10,icon:"icon-rupture",sound:"sfx-warrior-whirlwind",tint:13408614}],
 ["ET_IRON_WALL","bd_mon",{type:"et",cost:20,cd:16,icon:"icon-shield-wall",sound:"sfx-warrior-iron-skin",tint:10135736}],
 ["ET_BACKFLIP","ard_salto",{type:"et",cost:15,cd:8,ch2:!0,icon:"icon-falcon-dive",sound:"sfx-rogue-shadow-step",tint:9095274,aim:!0}],
 ["ET_FENCE","ard_barr",{type:"et",cost:30,cd:14,cd2:10,icon:"icon-volley",sound:"sfx-archer-explosive-arrow",tint:9101450,aim:!0}],
 ["ET_CHARGED","ara_carr",{type:"et",cost:20,cd:6,cd2:4,icon:"icon-aimed-shot",sound:"sfx-archer-multishot",tint:16769354,aim:!0}],
 ["ET_SUN_MIRROR","md_esp",{type:"et",cost:30,cd:12,cd2:9,icon:"icon-holy-nova",sound:"sfx-mage-arcane-blast",tint:16765514}],
 ["ET_ICE_COMET","ma_com",{type:"projectile",damageType:"magical",cost:25,cd:7,damageMult:2.4,projectile:{texture:"proj-bolt",speed:330,maxDist:300,tint:12580607,explosion:{radius:58}},status:{key:"CHILL",duration:2.5},icon:"icon-winter-staff",sound:"sfx-mage-fireball",tint:12580607}],
 ["ET_ICE_PRISON","md_inv",{type:"et",cost:40,cd:22,icon:"icon-frozen-heart",sound:"sfx-mage-arcane-blast",tint:10483967}],
 ["ET_ROLL","rd_rol",{type:"et",cost:15,cd:6,ch2:!0,icon:"icon-shadow-strike",sound:"sfx-rogue-shadow-step",tint:10125264,aim:!0}],
 ["ET_DECOY","rd_isca",{type:"et",cost:25,cd:14,cd2:10,icon:"icon-mirror-step",sound:"sfx-rogue-smoke",tint:9058998}],
 ["ET_TOXIC_SMOKE","rd_fum",{type:"smoke",cost:35,cd:12,radius:92,duration:4,icon:"icon-smoke-bomb",sound:"sfx-rogue-smoke",tint:7000186}],
 ["ET_BLADE_DANCE","ra_danca",{type:"et",cost:35,cd:9,icon:"icon-fan-blades",sound:"sfx-rogue-fan",tint:13159640}],
 ["ET_DEATH_MARK","ra_marca",{type:"et",cost:25,cd:12,icon:"icon-deadly-mark",sound:"sfx-rogue-backstab",tint:16734794}],
 ["ET_BONE_ARMOR","nd_arm",{type:"et",cost:25,cd:15,icon:"icon-skeleton-army",sound:"sfx-mage-arcane-blast",tint:14215368}],
 ["ET_PLAGUE","na_praga",{type:"et",damageType:"magical",cost:30,cd:10,cd2:7,icon:"icon-void-nova",sound:"sfx-rogue-smoke",tint:7000186,aim:!0}],
 ["ET_REAP","na_ceifa",{type:"et",damageType:"magical",cost:25,cd:8,cd2:6,icon:"icon-soul-siphon",sound:"sfx-warrior-whirlwind",tint:5963696}],
 ["ET_PROTECT_HOWL","hd_uivo",{type:"et",cost:25,cd:16,cd2:12,icon:"icon-wild-pack",sound:"sfx-warrior-whirlwind",tint:10483967}],
 ["ET_CAMPFIRE","hd_fog",{type:"et",cost:30,cd:20,cd2:15,icon:"icon-consecration",sound:"sfx-mage-fireball",tint:16748330}],
 ["ET_DOUBLE_SHOT","ha_td",{type:"et",cost:15,cd:5,icon:"icon-multishot",sound:"sfx-archer-multishot",tint:14209730,aim:!0}],
 ["ET_COORD","ha_coord",{type:"et",cost:25,cd:12,cd2:9,icon:"icon-deadly-mark",sound:"sfx-rogue-backstab",tint:16765514}],
 ["ET_JUREMA_CIRCLE","sd_circ",{type:"et",cost:35,cd:18,cd2:14,icon:"icon-holy-nova",sound:"sfx-rogue-smoke",tint:5287994}],
 ["ET_BARK","sd_casca",{type:"et",cost:25,cd:14,cd2:10,icon:"icon-aegis",sound:"sfx-warrior-iron-skin",tint:9134650}],
 ["ET_DART_HAIL","sa_sara",{type:"multi-projectile",damageType:"physical",cost:30,cd:8,damageMult:.9,count:5,spread:.2,projectile:{texture:"proj-dart",speed:440,maxDist:260,tint:9425498},status:{key:"POISON",duration:4},icon:"icon-volley",sound:"sfx-archer-multishot",tint:9425498}],
 ["ET_WAR_DANCE","sa_dguer",{type:"et",cost:30,cd:9,icon:"icon-tsumuji",sound:"sfx-warrior-whirlwind",tint:16742954}],
 ["ET_JAGUAR","sa_onca",{type:"et",cost:35,cd:12,icon:"icon-lobisomem-form",sound:"sfx-rogue-shadow-step",tint:16756810,aim:!0}],
 ["ET_TRAMPLE","dd_pis",{type:"et",cost:15,cd:8,ch2:!0,icon:"icon-demolish",sound:"sfx-warrior-heavy-strike",tint:11561544,aim:!0}],
 ["ET_OAK_RING","dd_cc",{type:"et",cost:35,cd:16,cd2:12,icon:"icon-roots",sound:"sfx-rogue-smoke",tint:5287994}],
 ["ET_BEAR","dd_urso",{type:"et",cost:40,cd:60,icon:"icon-guardian-vengeance",sound:"sfx-warrior-iron-skin",tint:9134650}],
 ["ET_BLOOD_HOWL","da_uivo",{type:"et",cost:20,cd:14,icon:"icon-bloodlust",sound:"sfx-warrior-whirlwind",tint:14365530}],
 ["ET_MISTLETOE","da_colh",{type:"et",cost:25,cd:10,icon:"icon-night-harvest",sound:"sfx-warrior-whirlwind",tint:16765514}]];
for(const[id,nid,o]of __ETABD){const n=__ETIDX[nid].n,{cd,cd2,...rest}=o;const d={id,...rest,etNode:nid,get name(){return n.n[0]},get desc(){return n.d[0]}};
 Object.defineProperty(d,"cooldown",{get(){const S=__etGS();return cd2&&S&&__etRaw(S,nid)>=2?cd2:cd},enumerable:!0});Ye[id]=d;
 _s[`abn.${id}`]=n.n[1];Io[`abn.${id}`]=n.n[2];_s[`abd.${id}`]=n.d[1];Io[`abd.${id}`]=n.d[2]}
const __ETAB={
 ET_AEGIS(Y,d,S){const P=S.player;__etShield(S,"aegis",P.maxHp*.25*__etPow(1.4,R(S,"wd_n2")),6,16761165);__etTxt(S,__L3("ÉGIDE","AEGIS","ÉGIDA"),"#ffc14d");S.cameraSys?.shake?.(.003,90)},
 ET_CLAN_CRY(Y,d,S){const P=S.player;__etRingIn(S,P.x,P.y,140,16765514);S.time.delayedCall(120,()=>__etRingIn(S,P.x,P.y,110,16761165));S.cameraSys?.shake?.(.006,180);__etTxt(S,__L3("BRADO DO CLÃ!","CLAN CRY!","¡GRITO DEL CLAN!"),"#ffd24a",12);
  let n=0;for(const e of __etTargets(S)){if(Math.hypot(e.x-P.x,e.y-P.y)>132)continue;n++;__etPullTo(S,e,P.x,P.y,460);S.effects.burstTinted(e.x,e.y,16765514,6);R(S,"wd_eco")&&S.statusFx?.apply(e,"HSLOW",{duration:3,power:1})}
  __etFort(S,n);if(R(S,"wd_mural")){const s=Y.slots.find(q=>q.def?.id==="ET_AEGIS");s&&s.cooldown>0&&(s.cooldown*=.5,S.effects.floatText(P.x,P.y-44,__L3("ÉGIDE ½","AEGIS ½","ÉGIDA ½"),"#ffc14d",9))}},
 ET_CHARGE(Y,d,S){const fd=Y.facingDir();S.playerVisual?.setTintAll?.(13214282);S.time.delayedCall(260,()=>S.playerVisual?.clearTintAll?.());S.cameraSys?.shake?.(.004,140);
  __etDashHit(S,fd,160,230,1.6,{ctx:"ab:ET_CHARGE",stun:.9,col:13214282,r:30,kb:1.6})},
 ET_SPIN(Y,d,S){const P=S.player;P.__etSpin=!0;S.tweens.add({targets:P,angle:720,duration:2e3,onComplete:()=>{P.setAngle(0);P.__etSpin=!1}});
  for(let k=0;k<6;k++)S.time.delayedCall(k*330,()=>{if(!P.active||P.dead)return;for(let q=0;q<4;q++)S.effects.slash(P.x,P.y,Math.PI/2*q+k*.4,16756810);S.effects.shockwaveRing(P.x,P.y,76);
   for(const e of __etTargets(S)){const l=Math.hypot(e.x-P.x,e.y-P.y);R(S,"wa_redp")&&l<160&&__etPullTo(S,e,P.x,P.y,260);l<84&&__etHit(S,e,.7,{ctx:"ab:ET_SPIN",kb:.5})}S.audioRef?.play("sfx-warrior-whirlwind")})},
 ET_PARRY(Y,d,S){const P=S.player;S.__etParry={until:S.time.now+420};__etFlash(S,P.x,P.y-8,12640767,34);S.effects.shockwaveRing(P.x,P.y,22);__etTxt(S,"UKE","#c0e0ff",11);
  try{S.playerVisual?.setTintAll?.(12640767);S.time.delayedCall(420,()=>S.playerVisual?.clearTintAll?.())}catch(e){}},
 ET_TSUBAME(Y,d,S){const P=S.player,fd=Y.facingDir(),a=Math.atan2(fd.y,fd.x),hit=(m,ctx)=>{for(const e of __etTargets(S))S.combat.arcHit(P,fd,96,150,e)&&__etHit(S,e,m(e),{ctx})};
  P.playAttackAnim?.();S.effects.arcSlash(P.x,P.y,a,96,150,16762052);hit(()=>1.8,"ab:ET_TSUBAME");
  S.time.delayedCall(170,()=>{if(!P.active)return;S.effects.arcSlash(P.x,P.y,a+Math.PI*.02,90,150,16777215);for(let k=0;k<6;k++)S.effects.burstTinted(P.x+fd.x*50+Math.random()*30-15,P.y+fd.y*50+Math.random()*30-15,16762052,2);
   const mil=R(S,"ba_mil");hit(e=>{const m=mil?(e.__etCut|0):0;mil&&(e.__etCut=0);m&&S.effects.floatText(e.x,e.y-30,`×${m}`,"#ffb0c8",10);return 1.8*(1+.4*m)},"ab:ET_TSUBAME2");S.effects.hitStop?.(50)})},
 ET_QUAKE(Y,d,S){const P=S.player;P.playAttackAnim?.();S.time.delayedCall(140,()=>{if(!P.active)return;S.cameraSys?.shake?.(.012,260);S.effects.shockwaveRing(P.x,P.y,100);S.time.delayedCall(90,()=>S.effects.shockwaveRing(P.x,P.y,70));__etFlash(S,P.x,P.y,13408614,70);
   const g=S.add.graphics().setDepth(3);g.lineStyle(2,3815994,.9);for(let k=0;k<9;k++){const a=k*.7+Math.random()*.3;let x=P.x,y=P.y;g.beginPath();g.moveTo(x,y);for(let q=0;q<4;q++){x+=Math.cos(a+Math.random()*.6-.3)*22;y+=Math.sin(a+Math.random()*.6-.3)*22;g.lineTo(x,y)}g.strokePath()}
   S.tweens.add({targets:g,alpha:0,delay:500,duration:600,onComplete:()=>g.destroy()});for(let k=0;k<14;k++){const a=k/14*6.28;S.effects.burstTinted(P.x+Math.cos(a)*80,P.y+Math.sin(a)*80,9076582,3)}
   for(const e of __etTargets(S))Math.hypot(e.x-P.x,e.y-P.y)<104&&__etHit(S,e,2.6,{ctx:"ab:ET_QUAKE",stun:1,kb:1.4});
   R(S,"ba_saku")&&__etLava(S,P.x,P.y,86,4)})},
 ET_IRON_WALL(Y,d,S){const P=S.player;S.__etIronU=S.time.now+4e3;__etFlash(S,P.x,P.y,10135736,40);S.effects.shockwaveRing(P.x,P.y,30);__etTxt(S,__L3("MURO DE FERRO","IRON WALL","MURO DE HIERRO"),"#c8d4e8");
  try{S.playerVisual?.setTintAll?.(10135736);S.time.delayedCall(4e3,()=>S.playerVisual?.clearTintAll?.())}catch(e){}},
 ET_BACKFLIP(Y,d,S){const P=S.player,fd=Y.facingDir(),b={x:-fd.x,y:-fd.y};P.dashDir=b;P.dashTimer=.22;P.dashSpeed=128/.22;P.invuln=Math.max(P.invuln,.4);__etGhost(S,9095274,5,44);
  S.tweens.add({targets:P,angle:-360*(fd.x>=0?1:-1),duration:220,onComplete:()=>P.setAngle(0)});
  S.time.delayedCall(240,()=>{if(!P.active||P.dead)return;P.facing={x:fd.x,y:fd.y};const{amount:a,crit:c}=S.stats.rollAbilityDamage(1.7,"physical");S.__etCtx="ab:ET_BACKFLIP";
   try{S.projectiles.spawn({x:P.x+fd.x*14,y:P.y+fd.y*14,dir:fd,texture:"proj-arrow",speed:560,maxDist:320,tint:16769354,damage:a,critical:c,damageType:"physical",noFalloff:!0})}finally{S.__etCtx=null}S.effects.burstTinted(P.x,P.y+8,9076582,8)})},
 ET_FENCE(Y,d,S){const P=S.player,fd=Y.facingDir(),cx=P.x+fd.x*58,cy=P.y+fd.y*58,ux=-fd.y,uy=fd.x,len=150,imgs=[];
  for(let k=0;k<9;k++){const t=(k/8-.5)*len,x=cx+ux*t,y=cy+uy*t;try{const im=S.add.image(x,y-80,"proj-arrow").setRotation(Math.PI/2).setDepth(y+4).setTint(14209730);S.tweens.add({targets:im,y,duration:150,delay:k*35,ease:"Cubic.easeIn",onComplete:()=>S.effects.burstTinted(x,y,9076582,3)});imgs.push(im)}catch(e){}}
  (S.__etBlk=S.__etBlk??[]).push({x:cx,y:cy,ux,uy,len,until:S.time.now+4e3,end:()=>imgs.forEach(im=>S.tweens.add({targets:im,alpha:0,duration:300,onComplete:()=>im.destroy()}))})},
 ET_CHARGED(Y,d,S){const P=S.player,k=S.__etLastSlot??0,t0=S.time.now,touch=S.game.inputManager?.device==="touch",gl=S.add.image(P.x,P.y-8,"light").setTint(16769354).setBlendMode(j.BlendModes.ADD).setAlpha(.6).setScale(.05).setDepth(P.y+50),g=S.add.graphics().setDepth(P.y+51);
  S.__etChg={t0};const fin=()=>{const f=Math.min(1,(S.time.now-t0)/1500);S.__etChg=null;gl.destroy();g.destroy();if(!P.active||P.dead)return;const fd=Y.facingDir?.()??P.facing,l=Math.hypot(fd.x,fd.y)||1,dir={x:fd.x/l,y:fd.y/l};
   const full=f>=.98,mult=1+2*f,{amount:a,crit:c}=S.stats.rollAbilityDamage(mult,"physical");S.__etCtx=full?"ab:ET_CHARGED_FULL":"ab:ET_CHARGED";
   try{S.projectiles.spawn({x:P.x+dir.x*14,y:P.y+dir.y*14,dir,texture:"proj-arrow",speed:640,maxDist:380,tint:full?16769354:16777215,damage:a,critical:c,damageType:"physical",noFalloff:!0,pierce:full&&R(S,"ara_atr")?99:1+R(S,"ara_pont")})}finally{S.__etCtx=null}
   P.playAttackAnim?.();S.cameraSys?.shake?.(.003+.004*f,100);full&&(__etFlash(S,P.x,P.y-8,16769354,46),S.effects.floatText(P.x,P.y-32,__L3("CARGA MÁXIMA","FULL CHARGE","CARGA MÁXIMA"),"#ffe08a",10));S.audioRef?.play("sfx-archer-multishot")};
  const tk=()=>{if(!gl.active)return S.events.off("update",tk);const f=Math.min(1,(S.time.now-t0)/1500);gl.setPosition(P.x,P.y-8).setScale(.05+f*.22).setDepth(P.y+50);g.clear().lineStyle(2,16769354,.85).beginPath();g.arc(P.x,P.y-8,16,-Math.PI/2,-Math.PI/2+f*Math.PI*2);g.strokePath();g.setDepth(P.y+51);
   P.body&&P.setVelocity(P.body.velocity.x*.45,P.body.velocity.y*.45);const held=!touch&&!!S.inputMgr?.isDown?.(`ABILITY_${k+1}`);if(f>=1||(!held&&S.time.now-t0>(touch?1200:220))||P.dead){S.events.off("update",tk);fin()}};S.events.on("update",tk)},
 ET_SUN_MIRROR(Y,d,S){const P=S.player;S.__etMirror={until:S.time.now+3e3,x:P.x,y:P.y,follow:!!R(S,"md_espd"),r:R(S,"md_espd")?50:38};__etFlash(S,P.x,P.y,16765514,50);__etTxt(S,__L3("ESPELHO SOLAR","SOLAR MIRROR","ESPEJO SOLAR"),"#ffe08a")},
 ET_ICE_PRISON(Y,d,S){const P=S.player;S.__etIceU=S.time.now+2e3;P.invuln=Math.max(P.invuln,2);__etFlash(S,P.x,P.y,10483967,60);S.effects.shockwaveRing(P.x,P.y,90);
  for(const e of __etTargets(S))Math.hypot(e.x-P.x,e.y-P.y)<96&&__etStun(S,e,2,"FREEZE");
  S.time.delayedCall(2e3,()=>{if(!P.active)return;for(let k=0;k<16;k++)S.effects.burstTinted(P.x+Math.random()*30-15,P.y-10+Math.random()*30-15,12580607,3);S.effects.shockwaveRing(P.x,P.y,60);for(const e of __etTargets(S))Math.hypot(e.x-P.x,e.y-P.y)<80&&__etHit(S,e,1.4,{ctx:"ab:ET_ICE_PRISON",type:"magical",status:{key:"CHILL",duration:2}})})},
 ET_ROLL(Y,d,S){const P=S.player,fd=Y.facingDir();P.dashDir=fd;P.dashTimer=.2;P.dashSpeed=120/.2;P.invuln=Math.max(P.invuln,.42);__etGhost(S,10125264,4,45);
  S.tweens.add({targets:P,angle:360*(fd.x>=0?1:-1),duration:200,onComplete:()=>P.setAngle(0)});S.effects.burstTinted(P.x,P.y+8,9076582,6)},
 ET_DECOY(Y,d,S){const P=S.player;let im;try{im=S.add.sprite(P.x,P.y,P.texture.key,P.frame?.name??0).setFlipX(P.flipX).setScale(P.scaleX,P.scaleY).setTint(11045594).setAlpha(.82).setDepth(P.y)}catch(e){}
  S.effects.burstTinted(P.x,P.y,5593702,16);S.effects.floatText(P.x,P.y-30,__L3("ISCA","DECOY","SEÑUELO"),"#c9a0ff",10);const dc={x:P.x,y:P.y,dead:!1,until:S.time.now+3e3,img:im};S.__etDecoy=dc;S.__etLure=!0;
  im&&S.tweens.add({targets:im,scaleX:P.scaleX*1.05,scaleY:P.scaleY*.95,yoyo:!0,repeat:-1,duration:260});
  S.time.delayedCall(3e3,()=>{if(S.__etDecoy===dc)S.__etDecoy=null;im&&S.tweens.add({targets:im,alpha:0,duration:200,onComplete:()=>im.destroy()});S.effects.burstTinted(dc.x,dc.y,5593702,12);
   R(S,"rd_iscae")&&__etBoom(S,dc.x,dc.y,72,2.2,16748330,{ctx:"ab:ET_DECOY",text:"BOOM"})})},
 ET_BLADE_DANCE(Y,d,S){const P=S.player,n=R(S,"ra_milp")?10:5;P.invuln=Math.max(P.invuln,n*.09+.1);
  for(let k=0;k<n;k++)S.time.delayedCall(k*90,()=>{if(!P.active||P.dead)return;let t=null,b=120;for(const e of __etTargets(S)){const l=Math.hypot(e.x-P.x,e.y-P.y);l<b&&(b=l,t=e)}
   if(t){const a=Math.random()*6.28,x=t.x+Math.cos(a)*20,y=t.y+Math.sin(a)*20;S.dungeon?.isWallAtWorld?.(x,y)||P.setPosition(x,y);try{S.playerVisual?.spawnAfterimage?.()}catch(e){}__etSlashAt(S,t.x,t.y-6,Math.atan2(t.y-y,t.x-x),13159640);__etHit(S,t,.8,{ctx:"ab:ET_BLADE_DANCE",kb:.3})}
   else S.effects.slash(P.x+P.facing.x*20,P.y+P.facing.y*20,Math.random()*6.28,13159640);
   if(k===n-1&&R(S,"ra_ferr")){S.effects.shockwaveRing(P.x,P.y,140);for(const e of __etTargets(S)){const p=e.statuses?.POISON;if(!(p?.t>0)||Math.hypot(e.x-P.x,e.y-P.y)>150)continue;const dmg=Math.max(1,Math.round(p.power*ai.POISON.dotPct*(p.t/ai.POISON.tickSec)));delete e.statuses.POISON;S.statusFx?.refreshTint?.(e);
    e.takeDamage(dmg,null,0);S.effects.floatText(e.x,e.y-28,`${dmg}`,"#9aff4a",12);S.effects.burstTinted(e.x,e.y,7000186,14)}}})},
 ET_DEATH_MARK(Y,d,S){const P=S.player;let t=null,b=230;for(const e of __etTargets(S)){const l=Math.hypot(e.x-P.x,e.y-P.y);l<b&&(b=l,t=e)}if(!t){S.effects.burstTinted(P.x,P.y-10,16734794,8);return}
  __etMark(S,t)},
 ET_BONE_ARMOR(Y,d,S){const P=S.player;S.__etBA=R(S,"nd_arm")>=2?5:3;S.__etBAmax=S.__etBA;S.__etBAU=S.time.now+2e4;__etFlash(S,P.x,P.y,14215368,40);S.effects.burstTinted(P.x,P.y,14215368,16);__etTxt(S,__L3("ARMADURA DE OSSOS","BONE ARMOR","ARMADURA DE HUESOS"),"#e8e0c8")},
 ET_PLAGUE(Y,d,S){const P=S.player,fd=Y.facingDir(),x=P.x+fd.x*100,y=P.y+fd.y*100,big=R(S,"na_peste"),m=__etPow(1.35,R(S,"na_n1"));S.effects.burstTinted(x,y,7000186,22);__etFlash(S,x,y,7000186,60);
  big&&S.effects.floatText(P.x,P.y-30,__L3("PESTE NEGRA","BLACK DEATH","PESTE NEGRA"),"#9aff4a",12);
  __etZone(S,{x,y,r:80,dur:5,every:.5,depth:4,draw:(z,f,life)=>{const R0=big&&S.time.now-z.t0<3e3?420:80;z.r+=(R0-z.r)*.12;const g=z.g.clear();g.fillStyle(7000186,.13*f).fillCircle(z.x,z.y,z.r).lineStyle(2,10157130,.45*f).strokeCircle(z.x,z.y,z.r*(1+Math.sin(S.time.now/220)*.03));
    if(Math.random()<.5){const a=Math.random()*6.28,q=Math.random()*z.r;S.effects.burstTinted(z.x+Math.cos(a)*q,z.y+Math.sin(a)*q,7000186,1)}},
   tick:z=>{for(const e of __etTargets(S))if(Math.hypot(e.x-z.x,e.y-z.y)<z.r+8){e.__etPlagueU=S.time.now+1500;__etHit(S,e,.42*m,{ctx:"ab:ET_PLAGUE",type:"magical",kb:0})}}})},
 ET_REAP(Y,d,S){const P=S.player,m=__etPow(1.5,R(S,"na_n2"));P.playAttackAnim?.();for(let q=0;q<4;q++)S.time.delayedCall(q*55,()=>S.effects.arcSlash(P.x,P.y,q*Math.PI/2,88,100,5963696));S.effects.shockwaveRing(P.x,P.y,86);
  let tot=0;for(const e of __etTargets(S))Math.hypot(e.x-P.x,e.y-P.y)<92&&(tot+=__etHit(S,e,1.6,{ctx:"ab:ET_REAP",type:"magical"})||0,__etSoul(S,e));
  tot>0&&S.time.delayedCall(300,()=>P.heal(Math.max(1,Math.min(Math.round(P.maxHp*.2),Math.round(tot*.1*m)))))},
 ET_PROTECT_HOWL(Y,d,S){const P=S.player;let w=__etWolf(S);if(!w&&Ye.WOLF_COMPANION){try{Y.execSummon(Ye.WOLF_COMPANION)}catch(e){}w=__etWolf(S)}const o=w??P;
  S.__etHowlU=S.time.now+5e3;for(const k of[0,140,280])S.time.delayedCall(k,()=>S.effects.shockwaveRing(o.x,o.y,60+k/3));S.effects.floatText(o.x,o.y-30,"AUUU!","#c0e0ff",12);
  R(S,"hd_uivr")&&__etTargets(S).forEach(e=>Math.hypot(e.x-o.x,e.y-o.y)<115&&__etStun(S,e,1))},
 ET_CAMPFIRE(Y,d,S){const P=S.player,x=P.x,y=P.y+6,img=S.add.image(x,y-6,"light").setTint(16748330).setBlendMode(j.BlendModes.ADD).setAlpha(.6).setDepth(y+2).setScale(.5);
  __etZone(S,{x,y,r:72,dur:6,every:.25,depth:3,img,draw:(z,f)=>{const g=z.g.clear(),fl=1+Math.sin(S.time.now/70)*.08+Math.random()*.05;z.img.setScale(.55*fl).setAlpha(.55*f);g.fillStyle(16748330,.07*f).fillCircle(z.x,z.y,z.r);g.lineStyle(1.5,16765514,.35*f).strokeCircle(z.x,z.y,z.r);
    g.lineStyle(3,7029795,f).lineBetween(z.x-8,z.y+4,z.x+8,z.y-2).lineBetween(z.x-8,z.y-2,z.x+8,z.y+4);Math.random()<.6&&S.effects.burstTinted(z.x+Math.random()*8-4,z.y-6,Math.random()<.5?16748330:16765514,1)},
   tick:z=>{const p=S.player;if(Math.hypot(p.x-z.x,p.y-z.y)<z.r&&!p.dead&&p.hp<p.maxHp){z.h=(z.h??0)+p.maxHp*.02*.25;const n=Math.floor(z.h);n>0&&(z.h-=n,p.hp=Math.min(p.maxHp,p.hp+n),S.game.events.emit("hud:hp",p.hp,p.maxHp),S.effects.burstTinted(p.x,p.y-8,5221971,2))}
    if(R(S,"hd_foga"))for(const e of __etTargets(S)){const l=Math.hypot(e.x-z.x,e.y-z.y);!__etIsBoss(S,e)&&l<z.r&&__etPullTo(S,e,z.x*2-e.x,z.y*2-e.y,180)}}});
  if(R(S,"hd_acamp"))for(let k=0;k<3;k++){const a=k*2.094+.5;__etTrap(S,x+Math.cos(a)*48,y+Math.sin(a)*48)}},
 ET_DOUBLE_SHOT(Y,d,S){const P=S.player,fd=Y.facingDir();for(let k=0;k<2;k++)S.time.delayedCall(k*110,()=>{if(!P.active||P.dead)return;const a=Math.atan2(fd.y,fd.x)+(k?.05:-.05),dir={x:Math.cos(a),y:Math.sin(a)},{amount:m,crit:c}=S.stats.rollAbilityDamage(1.3,"physical");
  P.playAttackAnim?.();S.__etCtx="ab:ET_DOUBLE_SHOT";try{S.projectiles.spawn({x:P.x+dir.x*14,y:P.y+dir.y*14,dir,texture:"proj-arrow",speed:540,maxDist:300,tint:14209730,damage:m,critical:c,damageType:"physical",pierce:1+R(S,"ara_pont")})}finally{S.__etCtx=null}S.audioRef?.play("sfx-archer-multishot")})},
 ET_COORD(Y,d,S){const P=S.player;let t=null,b=250;for(const e of __etTargets(S)){const l=Math.hypot(e.x-P.x,e.y-P.y);l<b&&(b=l,t=e)}if(!t){S.effects.burstTinted(P.x,P.y-10,16765514,8);return}
  S.__etCoord={t,until:S.time.now+4e3};const w=__etWolf(S);w&&(w.__etForce=t);S.effects.floatText(t.x,t.y-30,"⊕","#ffe08a",15);S.effects.shockwaveRing(t.x,t.y,26)},
 ET_JUREMA_CIRCLE(Y,d,S){const P=S.player,x=P.x,y=P.y,hm=__etPow(1.4,R(S,"sd_n2")),seen=new Set;S.effects.shockwaveRing(x,y,84);__etFlash(S,x,y,5287994,60);
  __etZone(S,{x,y,r:82,dur:6,every:.25,depth:3,draw:(z,f)=>{const g=z.g.clear(),t=S.time.now/900;g.fillStyle(5287994,.1*f).fillCircle(z.x,z.y,z.r).lineStyle(2,9425498,.6*f).strokeCircle(z.x,z.y,z.r);
    for(let k=0;k<10;k++){const a=k*.628+t,b=a+.3;g.lineStyle(2,3368499,.7*f).beginPath();g.arc(z.x,z.y,z.r-6,a,b);g.strokePath();g.fillStyle(9425498,.8*f).fillCircle(z.x+Math.cos(b)*(z.r-6),z.y+Math.sin(b)*(z.r-6),2.5)}},
   tick:z=>{const p=S.player;if(Math.hypot(p.x-z.x,p.y-z.y)<z.r&&!p.dead&&p.hp<p.maxHp){z.h=(z.h??0)+p.maxHp*.02*.25*hm;const n=Math.floor(z.h);n>0&&(z.h-=n,p.hp=Math.min(p.maxHp,p.hp+n),S.game.events.emit("hud:hp",p.hp,p.maxHp),S.effects.burstTinted(p.x,p.y-8,5221971,2))}
    for(const e of __etTargets(S))if(!seen.has(e)&&Math.hypot(e.x-z.x,e.y-z.y)<z.r){seen.add(e);__etStun(S,e,1.4);S.effects.floatText(e.x,e.y-26,__L3("PRESO","ROOTED","ATRAPADO"),"#8ae08a",8);S.effects.burstTinted(e.x,e.y,3368499,8)}}})},
 ET_BARK(Y,d,S){const P=S.player;__etShield(S,"bark",P.maxHp*.2,6,9134650,{renew:R(S,"sd_suma")?1:0});__etTxt(S,__L3("CASCA DE SUMAÚMA","KAPOK BARK","CORTEZA DE CEIBA"),"#c8a070")},
 ET_WAR_DANCE(Y,d,S){const P=S.player;for(let k=0;k<3;k++)S.time.delayedCall(k*190,()=>{if(!P.active||P.dead)return;S.tweens.add({targets:P,angle:360,duration:180,onComplete:()=>P.setAngle(0)});S.effects.arcSlash(P.x,P.y,k*2.1,80,360,16742954);S.effects.shockwaveRing(P.x,P.y,76);
  for(const e of __etTargets(S))Math.hypot(e.x-P.x,e.y-P.y)<84&&__etHit(S,e,1.05,{ctx:"ab:ET_WAR_DANCE",kb:.7});S.audioRef?.play("sfx-warrior-whirlwind")})},
 ET_JAGUAR(Y,d,S){const fd=Y.facingDir();let dist=230;const P=S.player;for(let q=20;q<=230;q+=10)if(S.dungeon?.isWallAtWorld?.(P.x+fd.x*q,P.y+fd.y*q)){dist=q-18;break}
  S.cameraSys?.shake?.(.006,200);S.effects.floatText(P.x,P.y-30,__L3("SALTO DA ONÇA","JAGUAR LEAP","SALTO DEL JAGUAR"),"#ffb04a",11);
  __etDashHit(S,fd,Math.max(40,dist),300,2.6,{ctx:"ab:ET_JAGUAR",col:16756810,r:34,inv:.45,onHit:e=>{const a=Math.atan2(fd.y,fd.x)+Math.PI/2;for(const o of[-7,0,7])__etSlashAt(S,e.x+Math.cos(a)*o,e.y-6+Math.sin(a)*o,a-Math.PI/2+.6,16756810,.9)}})},
 ET_TRAMPLE(Y,d,S){const fd=Y.facingDir();S.cameraSys?.shake?.(.005,180);__etDashHit(S,fd,150,220,1.8,{ctx:"ab:ET_TRAMPLE",stun:1,col:11561544,r:32,kb:1.8,onHit:e=>S.effects.burstTinted(e.x,e.y,9076582,8)})},
 ET_OAK_RING(Y,d,S){const P=S.player,x=P.x,y=P.y,r=96,trees=[];for(let k=0;k<12;k++){const a=k/12*6.28,tx=x+Math.cos(a)*r,ty=y+Math.sin(a)*r,g=S.add.graphics().setDepth(ty);
   g.fillStyle(0,.25).fillEllipse(0,4,22,7).fillStyle(6044970,1).fillRect(-3,-14,6,18).fillStyle(3368499,1).fillCircle(0,-20,10).fillStyle(5287994,1).fillCircle(-4,-24,7).fillCircle(5,-22,6);g.setPosition(tx,ty).setScale(0);
   S.tweens.add({targets:g,scale:1,duration:260,delay:k*25,ease:"Back.easeOut"});trees.push(g)}
  for(const e of __etTargets(S))Math.hypot(e.x-x,e.y-y)<r+12&&__etHit(S,e,.8,{ctx:"ab:ET_OAK_RING",type:"magical",kb:2});S.cameraSys?.shake?.(.004,140);
  (S.__etBlk=S.__etBlk??[]).push({ring:!0,x,y,r,until:S.time.now+4e3,end:()=>trees.forEach(g=>S.tweens.add({targets:g,scale:0,alpha:0,duration:280,onComplete:()=>g.destroy()}))})},
 ET_BEAR(Y,d,S){const P=S.player;try{Y.execShapeshift({...Ye.JAVALI_FORM,id:"ET_BEAR",name:__L3("Forma de Urso","Bear Form","Forma de Oso"),duration:8,damageMult:1.5,defense:12,tint:9134650})}catch(e){}
  S.__etBearOn=!0;S.__etBearU=S.time.now+8e3;S.stats.recompute();P.heal(Math.round(P.maxHp*.25));S.cameraSys?.shake?.(.01,260);for(const k of[0,120,240])S.time.delayedCall(k,()=>S.effects.shockwaveRing(P.x,P.y,50+k/2));
  try{S.playerVisual?.setTintAll?.(13148266)}catch(e){}S.effects.floatText(P.x,P.y-34,__L3("GUARDIÃO DA ŠUMAVA","GUARDIAN OF ŠUMAVA","GUARDIÁN DE ŠUMAVA"),"#c8a070",11)},
 ET_BLOOD_HOWL(Y,d,S){const P=S.player,b=S.stats.total.attackSpeed||1;S.stats.addBuff("attackSpeed",b*.3,6);S.__etBHowlU=S.time.now+6e3;S.effects.floatText(P.x,P.y-30,"AUUU!","#ff6a5a",12);for(const k of[0,150])S.time.delayedCall(k,()=>S.effects.shockwaveRing(P.x,P.y,56));
  try{S.playerVisual?.setTintAll?.(14365530);S.time.delayedCall(6e3,()=>S.playerVisual?.clearTintAll?.())}catch(e){}},
 ET_MISTLETOE(Y,d,S){const P=S.player;let im;try{im=S.add.image(P.x,P.y,"slash").setTint(16765514).setBlendMode(j.BlendModes.ADD).setDepth(P.y+30).setScale(.9)}catch(e){}const t0=S.time.now;
  const tk=()=>{const t=(S.time.now-t0)/1e3;if(t>1.5||!P.active){S.events.off("update",tk);im?.destroy();return}const a=t*14;im&&im.setPosition(P.x+Math.cos(a)*44,P.y-4+Math.sin(a)*44).setRotation(a+Math.PI/2).setDepth(P.y+30)};S.events.on("update",tk);
  for(let k=0;k<6;k++)S.time.delayedCall(k*250,()=>{if(!P.active||P.dead)return;let tot=0;for(const e of __etTargets(S))Math.hypot(e.x-P.x,e.y-P.y)<70&&(tot+=__etHit(S,e,.65,{ctx:"ab:ET_MISTLETOE",kb:.3})||0);tot>0&&P.heal(Math.max(1,Math.round(tot*.25)))});
  R(S,"da_samh")&&S.time.delayedCall(1500,()=>{for(let k=0;k<6;k++)S.time.delayedCall(k*500,()=>{if(!P.active||P.dead)return;S.effects.shockwaveRing(P.x,P.y,110);for(let q=0;q<8;q++)__etSlashAt(S,P.x+Math.cos(q*.785)*60,P.y+Math.sin(q*.785)*60,q*.785,16765514,.8);
   for(const e of __etTargets(S))Math.hypot(e.x-P.x,e.y-P.y)<114&&__etHit(S,e,.5,{ctx:"et:samhain",kb:.4})})})}};
/* marca da morte (pula para o mais próximo com Marca Saltitante) */
function __etMark(S,t){t.markedUntil=S.time.now+8e3;t.markedBonus=Math.max(t.markedBonus??0,.3);t.setTint?.(16734794);S.__etDM={t,until:S.time.now+8e3};S.effects.floatText(t.x,t.y-28,"☠","#ff5a4a",14);S.effects.shockwaveRing(t.x,t.y,24)}
function __etSoul(S,e){try{const P=S.player,o=S.add.image(e.x,e.y-8,"light").setTint(5963696).setBlendMode(j.BlendModes.ADD).setScale(.06).setDepth(9e3);S.tweens.add({targets:o,x:P.x,y:P.y-8,duration:420,ease:"Cubic.easeIn",onComplete:()=>o.destroy()})}catch(x){}}
function __etLava(S,x,y,r,dur){const img=S.add.image(x,y,"light").setTint(16733986).setBlendMode(j.BlendModes.ADD).setAlpha(.5).setDepth(4).setScale(r/80);
 __etZone(S,{x,y,r,dur,every:.5,depth:3,img,draw:(z,f)=>{const g=z.g.clear(),p=Math.sin(S.time.now/160);z.img.setAlpha((.4+p*.1)*f);g.fillStyle(9311488,.55*f).fillCircle(z.x,z.y,z.r).fillStyle(16733986,(.35+p*.08)*f).fillCircle(z.x,z.y,z.r*.78);
   for(let k=0;k<5;k++){const a=k*1.26+S.time.now/1300,q=z.r*.45;g.fillStyle(16769354,.55*f).fillCircle(z.x+Math.cos(a)*q,z.y+Math.sin(a)*q,2+Math.abs(Math.sin(S.time.now/200+k))*2)}Math.random()<.3&&S.effects.burstTinted(z.x+Math.random()*z.r-z.r/2,z.y+Math.random()*z.r-z.r/2,16748330,1)},
  tick:z=>{for(const e of __etTargets(S))Math.hypot(e.x-z.x,e.y-z.y)<z.r+6&&__etHit(S,e,.4,{ctx:"et:lava",status:{key:"BURN",duration:2},kb:0})}})}
function __etFort(S,n){if(n<=0)return;const now=S.time.now;S.__etFortL=(S.__etFortL??[]).filter(u=>u>now);for(let k=0;k<n;k++)S.__etFortL.push(now+8e3);S.__etFortL.sort((a,b)=>b-a);S.__etFortL.length=Math.min(5,S.__etFortL.length);
 const P=S.player;S.effects.floatText(P.x,P.y-40,`◆ ${S.__etFortL.length}`,"#ffc14d",10)}
const __etFortN=S=>(S.__etFortL??[]).filter(u=>u>S.time.now).length;
