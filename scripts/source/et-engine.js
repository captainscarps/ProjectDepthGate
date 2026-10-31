/* ══ Árvores do Modo Infinito · motor ═══════════════════════════════════════════════════════════════════════
   Estado em S.skillState.et = {tree:null|"d"|"a", r:{nó:grau}} (vai junto no save e no carry entre andares).
   R(S,id) devolve o grau ativo do nó (0 se não comprado, se for de outra árvore ou se falta a arma exigida). */
const __etL=a=>Array.isArray(a)?__L3(a[0],a[1]??a[0],a[2]??a[1]??a[0]):a;
const __etGS=()=>{try{return typeof __etCurS!=="undefined"&&__etCurS?.sys?.isActive?.()?__etCurS:null}catch(e){return null}};
function __etOn(S){try{return!!S&&!!S.skillState&&!!S.classDef&&!!__ET[S.classDef.id]&&!!S.endlessRun?.()}catch(e){return!1}}
function __etSt(S){const k=S?.skillState;if(!k)return null;if(!k.et||typeof k.et!=="object")k.et={tree:null,r:{}};k.et.r=k.et.r||{};return k.et}
function __etTree(S){const st=__etSt(S);return st?.tree?__ET[S.classDef.id]?.[st.tree]??null:null}
function __etRaw(S,id){const st=__etSt(S),x=__ETIDX[id];if(!st||!x||!st.tree||x.c!==S.classDef.id||x.k!==st.tree)return 0;return st.r[id]|0}
function __etWeapon(S){return S?.inventory?.equipment?.weapon??null}
function __etHas(S,fam){const F=__ETFAM[fam];if(!F)return!0;const eq=S?.inventory?.equipment;if(!eq)return!1;
 if(F.slot)return!!eq[F.slot];if(F.form)return S.__form?.type===F.form&&!S.__etBearOn;if(F.acc)return F.acc.includes(eq.accessory1?.id)||F.acc.includes(eq.accessory2?.id);
 const w=eq.weapon;if(!w)return!1;if(F.ids)return F.ids.includes(w.id);const del=(oe[w.visualKey??w.id]??oe[w.id])?.delivery;
 if(F.melee)return del==="melee";if(F.ranged)return w.id==="blowgun"||del==="arrow";return!0}
function R(S,id){if(!__etOn(S))return 0;const r=__etRaw(S,id);if(!r)return 0;const n=__ETIDX[id].n;if(n.w&&!__etHas(S,n.w))return 0;return r}
const __etPow=(b,r)=>r>0?Math.pow(b,r):1;
/* pontos: 1 por nível do 3 ao 15; depois, 1 de Pesadelo por grau de Pesadelo */
function __etPts(S){return Math.max(0,Math.min(S.stats?.level??1,15)-2)}
function __etNmPts(S){return S.stats?.nm|0}
function __etSpent(S,nm){const T=__etTree(S),st=__etSt(S);if(!T)return 0;let s=0;for(const n of T.nodes)if((n.t==="nm")===!!nm)s+=st.r[n.id]|0;return s}
function __etFree(S,nm){return nm?__etNmPts(S)-__etSpent(S,!0):__etPts(S)-__etSpent(S,!1)}
function __etReqOk(S,q,side){const st=__etSt(S),r=id=>__ETIDX[id]&&__ETIDX[id].k===side?st.r[id]|0:0;
 if(q.startsWith("ab:"))return(S.skillState.unlocked??[]).includes(q.slice(3));
 if(q.startsWith("any:"))return q.slice(4).split("|").some(id=>r(id)>0);
 const[id,lv]=q.split(":");return r(id)>=(+lv||1)}
/* motivo de não poder comprar (null = pode) */
function __etWhyNot(S,id,side){const st=__etSt(S),x=__ETIDX[id];if(!x)return"?";const n=x.n;side=side??x.k;
 if(!st.tree)return __L3("Escolha uma árvore","Choose a tree","Elige un árbol");
 if(st.tree!==side)return __L3("Árvore trancada nesta run","Tree locked for this run","Árbol bloqueado en esta partida");
 const r=st.r[id]|0;if(r>=n.m)return __L3("No grau máximo","At max rank","En el grado máximo");
 if(n.t==="nm"){if(__etNmPts(S)<=0)return __L3("Pontos de Pesadelo chegam depois do nível 15","Nightmare points arrive after level 15","Los puntos de Pesadilla llegan tras el nivel 15");if(__etFree(S,!0)<=0)return __L3("Sem pontos de Pesadelo","No Nightmare points","Sin puntos de Pesadilla")}
 else if(__etFree(S,!1)<=0)return __L3("Sem pontos (1 por nível)","No points (1 per level)","Sin puntos (1 por nivel)");
 for(const q of n.req)if(!__etReqOk(S,q,side)){if(q.startsWith("ab:")){const a=q.slice(3);return __L3("Requer a habilidade ","Requires the skill ","Requiere la habilidad ")+St(`abn.${a}`,Ye[a]?.name??a)}
  const ids=q.startsWith("any:")?q.slice(4).split("|"):[q.split(":")[0]],lv=+(q.split(":")[1])||1,nm=ids.map(i=>__etL(__ETIDX[i]?.n.n)).join(__L3(" ou "," or "," o "));
  return __L3("Requer ","Requires ","Requiere ")+nm+(lv>1&&!q.startsWith("any:")?" "+__roman(lv):"")}
 if(n.t==="top"&&r===0){const T=__ET[x.c][side];const o=T.nodes.find(q=>q.t==="top"&&q.id!==id&&(st.r[q.id]|0)>0);if(o)return __L3("Topo já escolhido: ","Peak already chosen: ","Cima ya elegida: ")+__etL(o.n)}
 return null}
function __etPersist(S){try{S.game.registry.get("mode")==="endless"?In(S):S.requestSave?.(500)}catch(e){}}
/* compra um grau; ativa nova vai para o primeiro espaço livre */
function __etBuy(S,id){if(__etWhyNot(S,id))return!1;const st=__etSt(S),n=__ETIDX[id].n;st.r[id]=(st.r[id]|0)+1;
 if(n.ab&&st.r[id]===1){const k=S.skillState;k.unlocked.includes(n.ab)||k.unlocked.push(n.ab);if(!k.equipped.includes(n.ab)){const e=k.equipped.findIndex(o=>o==null);e>=0&&(k.equipped[e]=n.ab,S.abilities.setEquipped(k.equipped))}}
 S.stats.recompute();__etPersist(S);S.game.events.emit("et:changed");return!0}
function __etChoose(S,side){const st=__etSt(S);if(st.tree||!__ET[S.classDef.id]?.[side])return!1;st.tree=side;st.r={};__etPersist(S);S.game.events.emit("et:changed");return!0}
function __etEquip(S,ab,slot){const k=S.skillState;if(!k.unlocked.includes(ab))return;const e=k.equipped,d=e.indexOf(ab);d>=0&&d!==slot&&(e[d]=null);e[slot]=ab;S.abilities.setEquipped(e);__etPersist(S)}
/* ── estados novos nos inimigos ─────────────────────────────────────────────────────────────────────────── */
Object.assign(ai,{BLEED:{key:"BLEED",name:"Sangramento",color:13901120,tickSec:.5,dotPct:.32,maxDuration:6,get text(){return __L3("SANGRANDO","BLEEDING","SANGRANDO")}},
 STUN:{key:"STUN",name:"Atordoado",color:16769354,speedMult:.03,maxDuration:3,get text(){return __L3("ATORDOADO","STUNNED","ATURDIDO")}},
 FREEZE:{key:"FREEZE",name:"Congelado",color:10483967,speedMult:.03,maxDuration:3,get text(){return __L3("CONGELADO!","FROZEN!","¡CONGELADO!")}},
 HSLOW:{key:"HSLOW",name:"Lentidão forte",color:9741258,speedMult:.6,maxDuration:4,get text(){return __L3("LENTO","SLOWED","LENTO")}}});
const __etAlive=e=>e&&e.active&&!e.dead;
const __etTargets=S=>{try{return S.combat.getTargets()}catch(e){return[]}};
const __etIsBoss=(S,e)=>e===S.boss||!!e?.isBoss||!!e?.data_?.isBoss;
const __etSlowed=e=>{const s=e?.statuses;return!!s&&["SLOW","CHILL","HSLOW","FREEZE","STUN"].some(k=>s[k]?.t>0)};
const __etHasSt=(e,k)=>(e?.statuses?.[k]?.t??0)>0;
function __etStun(S,e,sec,key="STUN"){if(!__etAlive(e))return;const b=__etIsBoss(S,e);sec*=b?.35:1;if(sec<=0)return;
 e.ai&&(e.ai.busyTimer=Math.max(e.ai.busyTimer||0,sec));e.setVelocity?.(0,0);S.statusFx?.apply(e,key,{duration:sec,power:1});e.__etStunU=S.time.now+sec*1e3;
 if(key==="FREEZE"&&R(S,"ma_zero")){e.__etFrz=(e.__etFrz|0)+1;if(e.__etFrz>=3){e.__etFrz=0;S.time.delayedCall(120,()=>__etBoom(S,e.x,e.y,74,3,10483967,{ctx:"et:zero",type:"magical",text:__L3("ZERO ABSOLUTO","ABSOLUTE ZERO","CERO ABSOLUTO")}))}}}
function __etPullTo(S,e,x,y,f){if(!__etAlive(e))return;const dx=x-e.x,dy=y-e.y,l=Math.hypot(dx,dy)||1,k=f*(1-(__etIsBoss(S,e)?.9:e.knockbackResist??0));
 e.knock?(e.knock.x=dx/l*k,e.knock.y=dy/l*k):e.body&&(e.body.velocity.x+=dx/l*k,e.body.velocity.y+=dy/l*k)}
/* dano das habilidades novas: passa pelo sistema de dano normal com a etiqueta da habilidade */
function __etHit(S,t,mult,o={}){if(!__etAlive(t))return!1;const f=o.from??S.player;let{amount:a,crit:c}=S.stats.rollAbilityDamage(mult,o.type??"physical");
 if(o.crit&&!c){a=Math.round(a*(S.stats.total.critMult||1.5));c=!0}const dx=t.x-f.x,dy=t.y-f.y,l=Math.hypot(dx,dy)||1,pc=S.__etCtx;S.__etCtx=o.ctx??pc??"ab";
 try{S.damageSystem.apply({target:t,amount:a,critical:c,type:o.type??"physical",dir:o.dir??{x:dx/l,y:dy/l},knockbackMult:o.kb??1,status:o.status??null})}finally{S.__etCtx=pc}
 o.stun&&__etStun(S,t,o.stun);return a}
function __etBoom(S,x,y,r,mult,col,o={}){S.effects.burstTinted(x,y,col,18);S.effects.shockwaveRing(x,y,r);S.cameraSys?.shake?.(.004,110);__etFlash(S,x,y,col,r);
 o.text&&S.effects.floatText(x,y-22,o.text,"#"+col.toString(16).padStart(6,"0"),11);let n=0;for(const e of __etTargets(S))S.damageSystem.circleHit(x,y,r,e.x,e.y,(e.body?.width??16)/2)&&(__etHit(S,e,mult,{...o,from:{x,y}}),n++);return n}
/* ── efeitos visuais ───────────────────────────────────────────────────────────────────────────────────── */
function __etFlash(S,x,y,col,r=40){try{const l=S.add.image(x,y,"light").setTint(col).setBlendMode(j.BlendModes.ADD).setDepth(y+60).setScale(r/90).setAlpha(.85);S.tweens.add({targets:l,scale:r/45,alpha:0,duration:380,ease:"Cubic.easeOut",onComplete:()=>l.destroy()})}catch(e){}}
function __etRingIn(S,x,y,r,col){const g=S.add.graphics().setDepth(y+40),o={r,a:.95};S.tweens.add({targets:o,r:8,a:.2,duration:360,ease:"Cubic.easeIn",onUpdate:()=>{g.clear().lineStyle(4,col,o.a).strokeCircle(x,y,o.r).lineStyle(2,16777215,o.a*.6).strokeCircle(x,y,o.r*.86)},onComplete:()=>g.destroy()})}
function __etTxt(S,t,col="#ffc14d",sz=11){const P=S.player;S.effects.floatText(P.x,P.y-30,t,col,sz)}
function __etGhost(S,col,n=5,gap=40){const P=S.player;for(let k=0;k<n;k++)S.time.delayedCall(k*gap,()=>{if(!P.body)return;try{S.playerVisual?.spawnAfterimage?.()}catch(e){}S.effects.burstTinted(P.x,P.y,col,4)})}
function __etSlashAt(S,x,y,ang,col,sc=1){try{const o=S.add.image(x,y,"slash").setRotation(ang).setTint(col).setBlendMode(j.BlendModes.ADD).setDepth(y+30).setScale(sc).setAlpha(.95);S.tweens.add({targets:o,alpha:0,scale:sc*1.35,duration:170,onComplete:()=>o.destroy()})}catch(e){}}
/* investida genérica: move o herói e acerta quem toca no caminho */
function __etDashHit(S,dir,dist,ms,mult,o={}){const P=S.player,hit=new Set;P.dashDir=dir;P.dashTimer=ms/1e3;P.dashSpeed=dist/(ms/1e3);P.invuln=Math.max(P.invuln,o.inv??.3);
 const n=Math.max(3,Math.round(ms/30));for(let k=0;k<=n;k++)S.time.delayedCall(k*ms/n,()=>{if(!P.body)return;o.col&&S.effects.burstTinted(P.x,P.y+6,o.col,3);
  for(const e of __etTargets(S)){if(hit.has(e)||Math.hypot(e.x-P.x,e.y-P.y)>(o.r??28))continue;hit.add(e);__etHit(S,e,mult,{ctx:o.ctx,stun:o.stun,kb:o.kb??1.2,crit:o.crit});o.col&&__etSlashAt(S,e.x,e.y-6,Math.atan2(dir.y,dir.x),o.col);o.onHit?.(e)}});
 __etGhost(S,o.col??12111064,Math.max(3,Math.round(ms/45)),45);return hit}
/* ── escudos que absorvem dano (Égide, Casca, Kiai, Nova) ───────────────────────────────────────────────── */
function __etShield(S,kind,amt,dur,col,o={}){S.__etSh=(S.__etSh??[]).filter(s=>s.kind!==kind);S.__etSh.push({kind,amt:Math.max(1,Math.round(amt)),max:Math.max(1,Math.round(amt)),until:S.time.now+dur*1e3,col,renew:o.renew??0,dur});
 const P=S.player;S.effects.shockwaveRing(P.x,P.y,30);S.effects.burstTinted(P.x,P.y-8,col,16);__etFlash(S,P.x,P.y-8,col,38)}
const __etShOn=(S,k)=>(S.__etSh??[]).some(s=>s.kind===k&&s.until>S.time.now&&s.amt>0);
/* ── zonas no chão (praga, lava, fogueira, sol, círculo) ─────────────────────────────────────────────────── */
function __etZone(S,z){z.t0=S.time.now;z.until=S.time.now+z.dur*1e3;z.acc=0;z.g=S.add.graphics().setDepth(z.depth??3);(S.__etZ=S.__etZ??[]).push(z);return z}
function __etZoneTick(S,dt){const L=S.__etZ;if(!L?.length)return;const now=S.time.now;for(let k=L.length-1;k>=0;k--){const z=L[k];
 if(now>=z.until||!z.g.active){z.end?.(z);z.g.destroy();z.img?.destroy?.();L.splice(k,1);continue}
 if(z.follow){z.x=S.player.x;z.y=S.player.y}const life=(now-z.t0)/(z.until-z.t0),fade=Math.min(1,(z.until-now)/400,(now-z.t0)/250);z.draw?.(z,fade,life);
 z.acc+=dt;if(z.every&&z.acc>=z.every){z.acc-=z.every;z.tick?.(z)}}}
/* ── bloqueios (cerca de flechas, anel de carvalhos) ─────────────────────────────────────────────────────── */
function __etBlockTick(S){const L=S.__etBlk;if(!L?.length)return;const now=S.time.now;for(let k=L.length-1;k>=0;k--){const b=L[k];if(now>=b.until){b.end?.();L.splice(k,1);continue}
 for(const e of __etTargets(S)){if(__etIsBoss(S,e))continue;if(b.ring){const dx=e.x-b.x,dy=e.y-b.y,l=Math.hypot(dx,dy)||1;if(l<b.r+10){e.setPosition(b.x+dx/l*(b.r+10),b.y+dy/l*(b.r+10));e.knock&&(e.knock.x=0,e.knock.y=0)}}
  else{const ux=b.ux,uy=b.uy,rx=e.x-b.x,ry=e.y-b.y,along=rx*ux+ry*uy,side=rx*-uy+ry*ux;if(Math.abs(along)>b.len/2+8){e.__etFs=Math.sign(side)||1;continue}
   const s0=e.__etFs??(Math.sign(side)||1);if(Math.abs(side)<14||Math.sign(side)!==s0){const ns=s0*14;e.setPosition(b.x+ux*along-uy*ns,b.y+uy*along+ux*ns);e.knock&&(e.knock.x=0,e.knock.y=0)}else e.__etFs=Math.sign(side)}}}}
/* ── armadilhas do Kael ────────────────────────────────────────────────────────────────────────────────── */
function __etTrap(S,x,y){const ch=R(S,"hd_dupla")?2:1,z=__etZone(S,{x,y,r:20,dur:20,ch,every:.1,depth:4,
 draw:(z,f)=>{const g=z.g.clear(),p=.55+Math.sin(S.time.now/160)*.2;g.lineStyle(2,9095274,f*.9).strokeCircle(z.x,z.y,12);for(let k=0;k<6;k++){const a=k*Math.PI/3+S.time.now/900;g.lineBetween(z.x+Math.cos(a)*6,z.y+Math.sin(a)*6,z.x+Math.cos(a)*14,z.y+Math.sin(a)*14)}g.fillStyle(16769354,p*f).fillCircle(z.x,z.y,2.5)},
 tick:z=>{for(const e of __etTargets(S)){if(e.__etTrapT>S.time.now||Math.hypot(e.x-z.x,e.y-z.y)>z.r+(e.body?.width??16)/2)continue;
  e.__etTrapT=S.time.now+2500;e.__etTrapped=S.time.now+2500;__etHit(S,e,.9,{ctx:"et:trap"});R(S,"hd_rastro")?__etStun(S,e,2,"FREEZE"):__etStun(S,e,1.4);
  S.effects.burstTinted(z.x,z.y,9095274,12);S.audioRef?.play("sfx-rogue-smoke");if(--z.ch<=0){z.until=S.time.now;break}}}});
 S.effects.burstTinted(x,y,9095274,8);return z}
/* ── estado por andar/sala ─────────────────────────────────────────────────────────────────────────────── */
function __etRoomReset(S){S.__etRoom={};S.__etSouls=0}
/* ── modificações de habilidades da classe (Aprimora) ───────────────────────────────────────────────────── */
function __etModDef(S,d){const id=d.id;
 if(id==="MULTI_SHOT"&&R(S,"ara_leq"))return{...d,count:(d.count??3)+2};
 if(id==="FIREBALL"&&R(S,"ma_bft"))return{...d,type:"multi-projectile",count:3,spread:.22};
 if(id==="BONE_SPEAR"&&R(S,"na_lanca"))return{...d,type:"multi-projectile",count:3,spread:.18};
 if(id==="AIMED_SHOT"&&R(S,"ha_tpp"))return{...d,projectile:{...d.projectile,pierce:99},status:{key:"BLEED",duration:4}};
 return d}
const __etHeavy=new Set(["HEAVY_STRIKE","SHIELD_BASH","IAIJUTSU","TSUMUJI","KAISHAKU","DEMOLISHING_BLOW","RUPTURE","ET_QUAKE","ET_TSUBAME","WHIRLWIND"]);
/* depois de usar uma habilidade */
function __etAfterCast(S,Y,d){const P=S.player,now=S.time.now,id=d.id;
 if(id==="KIAI"){S.__etKiaiU=now+(d.duration??5)*1e3;if(R(S,"bd_kiai")){const s=P.statuses;s&&["SLOW","CHILL","STUN","HSLOW","FREEZE"].forEach(k=>delete s[k]);S.statusFx?.refreshTint?.(P);__etTxt(S,__L3("INABALÁVEL","UNSHAKEN","INQUEBRANTABLE"),"#ffe08a")}
  const r=R(S,"bd_disc");r&&__etShield(S,"kiai",P.maxHp*.1*r,d.duration??5,15125322)}
 if(id==="ELEMENTAL_NOVA"&&R(S,"md_expl"))__etShield(S,"nova",P.maxHp*.15,6,8376575);
 if(id==="RAIZES_JUREMA"&&R(S,"sd_rab")){P.heal(Math.max(1,Math.round(P.maxHp*.06)));__etFlash(S,P.x,P.y,5287994,40)}
 if(id==="HUNTER_STEP"&&R(S,"ard_rep"))S.time.delayedCall((d.durationMs??150)+30,()=>{if(!P.active)return;S.effects.shockwaveRing(P.x,P.y,70);__etFlash(S,P.x,P.y,10146032,50);
  for(const e of __etTargets(S))Math.hypot(e.x-P.x,e.y-P.y)<80&&(__etPullTo(S,e,P.x*2-e.x,P.y*2-e.y,560),__etStun(S,e,.5))});
 if(id==="KAZE_GIRI"&&R(S,"ba_kaze")){const fd=Y.facingDir(),x0=P.x,y0=P.y;S.time.delayedCall((d.durationMs??150)+90,()=>{const len=d.distance??160,cx=x0+fd.x*len/2,cy=y0+fd.y*len/2,a=Math.atan2(fd.y,fd.x);
  for(let k=0;k<5;k++)__etSlashAt(S,x0+fd.x*len*(k+.5)/5,y0+fd.y*len*(k+.5)/5-6,a+Math.PI/2,12640767,1.1);for(const e of __etTargets(S))S.damageSystem.rectHit(cx,cy,len,(d.width??32)+8,a,e.x,e.y)&&__etHit(S,e,(d.damageMult??2.2)*.8,{ctx:"ab:KAZE_GIRI2"});S.cameraSys?.shake?.(.004,90)})}
 if(id==="METEOR"){const fd=P.facing,l=Math.hypot(fd.x,fd.y)||1,cd=d.castDist??130,x=P.x+fd.x/l*cd,y=P.y+fd.y/l*cd;
  if(R(S,"ma_met2")&&!S.__etFreeCast)S.time.delayedCall(1e3,()=>{if(!P.active||P.dead)return;S.__etFreeCast=!0;try{Y.__exec0({...d,castDist:Math.hypot(x-P.x,y-P.y)});__abilityFx(S,d)}catch(e){}S.__etFreeCast=!1});
  R(S,"ma_sol")&&S.time.delayedCall((d.telegraphMs??900)+80,()=>__etZone(S,{x,y,r:(d.radius??90)*.9,dur:5,every:.5,depth:3,img:S.add.image(x,y,"light").setTint(16748330).setBlendMode(j.BlendModes.ADD).setAlpha(.5).setDepth(4).setScale(.6),
   draw:(z,f)=>{const p=1+Math.sin(S.time.now/140)*.06;z.img.setScale(z.r/80*p).setAlpha(.45*f);z.g.clear().fillStyle(16742954,.16*f).fillCircle(z.x,z.y,z.r).lineStyle(2,16765514,.6*f).strokeCircle(z.x,z.y,z.r*p);for(let k=0;k<8;k++){const a=k*Math.PI/4+S.time.now/700;z.g.lineStyle(2,16773824,.45*f).lineBetween(z.x+Math.cos(a)*z.r*.35,z.y+Math.sin(a)*z.r*.35,z.x+Math.cos(a)*z.r*.7,z.y+Math.sin(a)*z.r*.7)}},
   tick:z=>{for(const e of __etTargets(S))Math.hypot(e.x-z.x,e.y-z.y)<z.r+8&&__etHit(S,e,.35,{ctx:"et:sun",type:"magical",status:{key:"BURN",duration:2},kb:0})}}))}
 if(id==="ARROW_RAIN"&&R(S,"ara_chuva")){const fd=P.facing,l=Math.hypot(fd.x,fd.y)||1,cd=d.castDist??120,x=P.x+fd.x/l*cd,y=P.y+fd.y/l*cd;
  for(const w of[1,2])S.time.delayedCall(w*1e3,()=>P.active&&__etRain(S,x,y,d.radius??84,(d.damageMult??2.2)*.6,d.rain?.count??10,d.color??9101450));
  R(S,"ara_cexp")&&S.time.delayedCall((d.telegraphMs??700)+60,()=>{for(let k=0;k<3;k++){const a=Math.random()*6.28,r=Math.random()*(d.radius??84)*.7;S.time.delayedCall(k*120,()=>__etBoom(S,x+Math.cos(a)*r,y+Math.sin(a)*r,40,.9,16748330,{ctx:"et:rainb"}))}})}
 if(id==="ESPIRITO_GAVIAO"&&R(S,"sa_merg"))S.time.delayedCall(350,()=>{const L=__etTargets(S).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y)).slice(0,2);L.forEach((e,k)=>S.time.delayedCall(k*260,()=>__etDive(S,e,1.6,{key:"POISON",duration:4})))});
 if(id==="WOLF_COMPANION"){S.time.delayedCall(30,()=>{const w=__etWolf(S);if(!w)return;R(S,"ha_rei")&&__etAlpha(S,w);
  if(R(S,"ha_mat"))for(let k=0;k<2;k++){try{const a=Math.random()*6.28,m=new Wh(S,P.x+Math.cos(a)*26,P.y+Math.sin(a)*26,{type:"HUNTER_HOUND",hp:Math.max(3,Math.round(w.maxHp*.4)),damage:Math.max(1,Math.round(w.damage*.5)),bossDamageMult:.5,speed:205,lifetimeSec:10,attackRange:22,attackCooldown:1.1,unitIndex:k+1,totalUnits:3});m.setScale(m.scaleX*.72);m.__etPup=!0;(S.minions=S.minions??[]).push(m)}catch(e){}}})}
 if((id==="EAGLE_COMPANION")&&R(S,"da_temp"))S.__etFlockU=now+8e3;
 if(id==="SHADOW_BLINK"&&R(S,"rd_somb"))__etInvis(S,1);
 if(id==="SMOKE_BOMB"||id==="VEIL_OF_DUSK"||id==="ET_TOXIC_SMOKE"){S.__etSmokeU=now+(d.duration??4)*1e3}
}
function __etInvis(S,sec){const P=S.player;S.__etInvisU=S.time.now+sec*1e3;P.invuln=Math.max(P.invuln,sec);S.__etLure=!0;try{S.playerVisual?.setAlphaAll?.(.35)}catch(e){}P.setAlpha?.(.35);
 S.effects.burstTinted(P.x,P.y,3025464,14);S.time.delayedCall(sec*1e3,()=>{P.setAlpha?.(1);try{S.playerVisual?.setAlphaAll?.(1)}catch(e){}})}
function __etWolf(S){return(S.minions??[]).filter(m=>__etAlive(m)&&(m.cfg?.type==="HUNTER_HOUND"||m.cfg?.type==="SHAMAN_WOLF")&&!m.__etPup).pop()??null}
function __etAlpha(S,w){if(w.__etAlphaOn)return;w.__etAlphaOn=!0;const s0x=w.scaleX,s0y=w.scaleY,d0=w.damage;w.damage=Math.round(d0*2);w.maxHp=Math.round(w.maxHp*1.8);w.hp=w.maxHp;
 S.tweens.add({targets:w,scaleX:s0x*1.6,scaleY:s0y*1.6,duration:380,ease:"Back.easeOut"});w.setTint?.(15258330);S.effects.shockwaveRing(w.x,w.y,40);S.effects.floatText(w.x,w.y-30,__L3("ALFA!","ALPHA!","¡ALFA!"),"#ffe08a",11);
 S.time.delayedCall(1e4,()=>{if(!w.active)return;w.__etAlphaOn=!1;w.damage=d0;S.tweens.add({targets:w,scaleX:s0x,scaleY:s0y,duration:300});w.clearTint?.()})}
/* mergulho de ave (gavião do Xamã, águia do Druida) */
function __etDive(S,e,mult,status,mark){if(!__etAlive(e))return;const P=S.player;let sp;try{sp=S.add.sprite(P.x-20,P.y-70,S.textures.exists("druid-eagle")?"druid-eagle":"proj-arrow",0).setDepth(9e3)}catch(x){return}
 S.tweens.add({targets:sp,x:e.x,y:e.y-8,duration:260,ease:"Cubic.easeIn",onComplete:()=>{if(__etAlive(e)){__etHit(S,e,mult,{ctx:"et:dive",status,type:S.classDef.basicProjectile?.damageType??"physical"});S.effects.burstTinted(e.x,e.y-6,15258330,10);
  mark&&(e.__etEagleU=S.time.now+5e3,S.effects.floatText(e.x,e.y-28,"✦","#ffe08a",12))}S.tweens.add({targets:sp,x:sp.x+(Math.random()*120-60),y:sp.y-110,alpha:0,duration:420,onComplete:()=>sp.destroy()})}})}
/* chuva de flechas extra (ondas) */
function __etRain(S,x,y,r,mult,n,col){const g=S.add.graphics().setDepth(3);g.lineStyle(2,col,.7).strokeCircle(x,y,r).fillStyle(col,.08).fillCircle(x,y,r);
 for(let k=0;k<n;k++)S.time.delayedCall(k*45,()=>{const a=Math.random()*6.28,q=Math.random()*r*.85,ax=x+Math.cos(a)*q,ay=y+Math.sin(a)*q;try{const im=S.add.image(ax,ay-90,"proj-arrow").setRotation(Math.PI/2).setDepth(ay+20);S.tweens.add({targets:im,y:ay,duration:160,onComplete:()=>{S.effects.burstTinted(ax,ay,col,3);im.destroy()}})}catch(e){}});
 S.time.delayedCall(260,()=>{for(const e of __etTargets(S))Math.hypot(e.x-x,e.y-y)<r+8&&__etHit(S,e,mult,{ctx:"et:rain",kb:.4});S.tweens.add({targets:g,alpha:0,duration:300,onComplete:()=>g.destroy()})})}
