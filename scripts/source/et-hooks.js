/* ══ Árvores do Modo Infinito · ganchos no jogo ═════════════════════════════════════════════════════════════ */
let __etCurS=null;
/* ── início de cada andar: restaura a árvore (o jogo recria o skillState sem campos extras) ─────────────── */
{const C0=Sd.prototype.create;Sd.prototype.create=function(...a){const r=C0.apply(this,a);try{__etInit(this,a[0]??{})}catch(e){console.warn("[et] init",e)}return r}}
function __etInit(S,data){const src=data?.carry?.skills??data?.restore?.player?.skills??data?.restoreEndless?.player?.skills;
 if(src?.et&&S.skillState)S.skillState.et=JSON.parse(JSON.stringify(src.et));
 S.__etFloor={};__etRoomReset(S);S.__etSh=[];S.__etZ=[];S.__etBlk=[];S.__etFortL=[];__etCurS=S;
 if(!__etOn(S))return;__etSt(S);S.__etNmSeen=S.stats.nm|0;S.stats.recompute();
 const G=S.game.events,onDie=e=>{try{__etKill(S,e)}catch(x){console.warn("[et] kill",x)}},onRoom=()=>__etRoomReset(S),onLv=lv=>{try{__etOnLevel(S,lv)}catch(x){}};
 G.on("enemy:died",onDie);G.on("room:cleared",onRoom);G.on("rpg:levelup",onLv);
 const up=(t,dm)=>{try{__etTick(S,Math.min(.1,dm/1e3))}catch(x){S.__etErr||(S.__etErr=1,console.warn("[et] tick",x))}},pu=()=>{try{__etPost(S)}catch(x){}};
 S.events.on("update",up);S.events.on("postupdate",pu);
 S.events.once("shutdown",()=>{G.off("enemy:died",onDie);G.off("room:cleared",onRoom);G.off("rpg:levelup",onLv);S.events.off("update",up);S.events.off("postupdate",pu);__etCurS===S&&(__etCurS=null)});
 __etMaybeChoose(S,2600)}
function __etOnLevel(S,lv){const st=__etSt(S);if(lv>=3&&!st.tree){__etMaybeChoose(S,900);return}
 if(st.tree&&lv>=3&&lv<=15)S.time.delayedCall(1300,()=>S.game.events.emit("ui:banner",__L3("+1 ponto na Árvore do Infinito","+1 Endless Tree point","+1 punto en el Árbol del Infinito"),"#ffc14d"));
 S.scene.get("UI")?.refreshSkillsAlert?.()}
/* abre a escolha das árvores quando o herói chega ao nível 3 (tenta de novo se outra janela estiver aberta) */
function __etMaybeChoose(S,delay){if(S.__etChooseT)return;S.__etChooseT=1;const tryOpen=()=>{S.__etChooseT=0;if(!S.sys?.isActive?.()||!__etOn(S))return;const st=__etSt(S);if(st.tree||(S.stats.level??1)<3)return;
 const U=S.scene.get("UI"),busy=S.state!=="playing"||S.uiOpen||S.player?.dead||!U||U.result?.isVisible?.()||U.pauseMenu?.open||U.shopUI?.open||U.storyPanel?.visible||U.blessingPanel?.visible||U.eventPanel?.visible||U.__etp?.open;
 if(busy){S.__etChooseT=1;setTimeout(tryOpen,1500);return}__etUI(U).show("choose")};setTimeout(tryOpen,delay)}
/* ── atributos (passivas de crítico, velocidade, vida, mana) ─────────────────────────────────────────────── */
{const RC0=Eh.prototype.recompute;Eh.prototype.recompute=function(){const r=RC0.apply(this,arguments),S=this.scene;try{if(!__etOn(S)||!__etSt(S).tree)return r;const i=this.total;
 i.critChance=(i.critChance??0)+4*R(S,"wa_fio")+5*R(S,"ba_afi")+4*R(S,"ma_prec")+5*R(S,"ra_gc")+5*R(S,"ha_olho")+5*R(S,"sa_fio")+5*R(S,"da_garr");
 const sp=R(S,"ard_passo");sp&&(i.speed=Math.round(i.speed*(1+.05*sp)));
 const as=(1+.05*R(S,"ara_rap"))*__etPow(1.1,R(S,"ara_n2"));as!==1&&(i.attackSpeed=(i.attackSpeed||1)*as);
 let hp=(1+.15*R(S,"dd_couro"))*__etPow(1.5,R(S,"dd_n2"));S.__etBearOn&&(hp*=1.5);hp!==1&&(i.maxHp=Math.round(i.maxHp*hp));
 const mm=R(S,"md_n2");mm&&(i.maxResource=Math.round((i.maxResource||0)*__etPow(1.25,mm)),i.maxMana&&(i.maxMana=Math.round(i.maxMana*__etPow(1.25,mm))));
 const e=S.player;e&&(e.maxHp=i.maxHp,e.hp=Math.min(e.hp,e.maxHp),S.game.events.emit("hud:hp",e.hp,e.maxHp));S.resource?.def&&S.resource.setMax(i.maxResource+(i.maxMana??0));S.game.events.emit("rpg:stats",i)}catch(x){}return r}}
/* ── dano causado ─────────────────────────────────────────────────────────────────────────────────────── */
{const A0=Uh.prototype.apply;Uh.prototype.apply=function(o){const S=this.scene;if(!o||!o.target)return A0.apply(this,arguments);
 let st=o.status,tag=null;st&&st.key==="__ET"&&(tag=st.tag,o={...o,status:st.inner??null});
 if(!__etOn(S)||!__etSt(S).tree)return A0.call(this,o);
 const P=S.player,t=o.target;
 if(t===P){const ps=S.__etSrc;S.__etSrc=o.source??null;S.__etSrcProj=!o.source;try{return A0.call(this,o)}finally{S.__etSrc=ps;S.__etSrcProj=!1}}
 if(t.isMinion||t===S.player2)return A0.call(this,o);
 const kind=o.source===P?"basic":o.source?.isMinion?"minion":(tag??S.__etCtx??"ab"),ab=kind.startsWith("ab:")?kind.slice(3):null,now=S.time.now;
 let m=1,crit=!!o.critical,a=o.amount;
 m*=__etPow(1.3,R(S,"wa_n1"))*__etPow(1.3,R(S,"ara_n1"))*__etPow(1.3,R(S,"sa_n2"))*__etPow(1.3,R(S,"ha_n1"))*__etPow(1.3,R(S,"da_n1"));
 kind!=="basic"&&kind!=="minion"&&(m*=__etPow(1.3,R(S,"ma_n1")));
 now<(S.__etKiaiU??0)&&(m*=__etPow(1.2,R(S,"ba_n2")));
 R(S,"wd_balu")&&(m*=1+.04*__etFortN(S));
 R(S,"rd_lamf")&&__etInSmoke(S)&&(m*=1.5);
 R(S,"na_ceif")&&(m*=1+.02*(S.__etSouls|0));
 const brk=(t.__etBrkU??0)>now,stun=(t.__etStunU??0)>now;brk&&(m*=1.3);
 (brk||stun)&&(m*=1+.1*R(S,"wa_peso"));
 __etSlowed(t)&&(m*=1+.1*R(S,"ma_frio"));
 ((t.__etTrapped??0)>now||__etSlowed(t))&&(m*=1+.15*R(S,"ha_ponto"));
 const co=S.__etCoord;co&&co.t===t&&now<co.until&&(kind==="basic"||ab||(kind==="minion"&&(o.source?.cfg?.type==="HUNTER_HOUND")))&&(m*=1.5);
 (t.__etEagleU??0)>now&&(m*=1.2);
 ab==="BACKSTAB"&&R(S,"ra_gtl")&&(__etHasSt(t,"POISON")||(t.markedUntil??0)>now)&&(m*=1.5);
 ab&&S.__etOverNow&&(m*=2*__etPow(1.5,R(S,"ma_n2")));
 ab&&__etHeavy.has(ab)&&(m*=1+.15*R(S,"ba_peso"));
 if(kind==="minion"&&(o.source?.cfg?.type==="HUNTER_HOUND"))m*=(1+.15*R(S,"ha_pres"))*__etPow(1.5,R(S,"ha_n2"));
 kind==="basic"&&(m*=1+.1*R(S,"da_corte"));
 kind==="basic"&&S.__etTowerOn&&(m*=1.4);
 const fc=r=>{if(!crit){a=Math.round(a*(S.stats.total.critMult||1.5));crit=!0}};
 R(S,"sa_selva")&&__etHasSt(t,"STUN")&&fc();
 S.__etNextCrit&&kind!=="minion"&&(S.__etNextCrit=!1,fc());
 if(R(S,"ba_batto")&&(kind==="basic"||ab)&&!S.__etRoom.batto){S.__etRoom.batto=1;fc();a*=3;S.effects.floatText(t.x,t.y-34,"BATTO!","#ffe08a",12)}
 ab==="AIMED_SHOT"&&R(S,"ha_perf")&&co&&co.t===t&&now<co.until&&fc();
 crit&&(m*=__etPow(1.35,R(S,"ba_n1"))*__etPow(1.3,R(S,"ra_n2")));
 a=Math.max(1,Math.round(a*m));
 const boss=__etIsBoss(S,t),pct=(t.hp-a)/(t.maxHp||t.hp||1);let exe=null;
 if(!boss&&t.hp>a){if(R(S,"wa_exec")&&pct<.15)exe="exec";else if(ab==="BACKSTAB"&&R(S,"ra_exe")&&pct<.3)exe="exec";else if(ab==="AIMED_SHOT"&&R(S,"ha_ouro")&&t.isElite&&pct<.4)exe="gold";else if(ab==="ET_CHARGED_FULL"&&R(S,"ara_um")&&pct<.25)exe="exec"}
 exe&&(a=t.hp+1,S.effects.floatText(t.x,t.y-36,exe==="gold"?__L3("CORRIDA DO OURO!","GOLD RUSH!","¡FIEBRE DEL ORO!"):__L3("EXECUÇÃO!","EXECUTE!","¡EJECUCIÓN!"),"#ff4a3a",12),S.effects.hitStop?.(70));
 t.__etK={kind,ab,t:now};const was=t.dead,r=A0.call(this,{...o,amount:a,critical:crit});
 try{if(!t.dead&&!was&&r!==!1)__etOnHit(S,t,kind,ab,crit,a)}catch(x){}return r}}
function __etInSmoke(S){const z=S.smokeZone,P=S.player;return!!z&&S.time.now<z.until&&Math.hypot(P.x-z.x,P.y-z.y)<=z.radius}
/* efeitos ao acertar */
function __etOnHit(S,t,kind,ab,crit,a){const now=S.time.now;let r;
 if(crit&&(r=R(S,"ara_marc"))&&kind!=="minion"){if(!((t.markedUntil??0)>now&&(t.markedBonus??0)>.1*r)){t.markedUntil=now+4e3;t.markedBonus=Math.max(.1*r,(t.markedUntil>now?t.markedBonus??0:0));S.effects.floatText(t.x,t.y-30,"◎","#ffd24a",11)}}
 if(R(S,"ba_marca")&&(kind==="basic"||ab)){t.__etCut=(t.__etCut|0)+1;if(t.__etCut>=3&&!__etHasSt(t,"BLEED")&&!R(S,"ba_mil")||t.__etCut>=5){t.__etCut=0;S.statusFx?.apply(t,"BLEED",{duration:4,power:Math.max(2,Math.round(a*.8))})}}
 if(ab==="IAIJUTSU"&&R(S,"ba_iai")){t.__etCut=(t.__etCut|0)+1;S.effects.floatText(t.x,t.y-30,"✕","#ffb0c8",10)}
 if(kind==="basic"&&(r=R(S,"ra_ven")))S.statusFx?.apply(t,"POISON",{duration:4,power:Math.max(2,Math.round(3.2*r*(1+(S.stats.level??1)*.12)))});
 if((r=R(S,"sa_ponta"))&&(kind==="basic"||ab)){const cap=2+r;t.__etCur=Math.min(cap,(t.__etCur|0)+1);t.__etCurU=now+5e3;S.statusFx?.apply(t,"POISON",{duration:4,power:Math.max(2,Math.round(a*.35*t.__etCur))});
  S.effects.floatText(t.x+10,t.y-30,"●".repeat(t.__etCur),"#9aff4a",7);if(R(S,"sa_para")&&t.__etCur>=3&&!(t.__etParaU>now)){t.__etParaU=now+3e3;__etStun(S,t,1);S.effects.floatText(t.x,t.y-38,__L3("PARALISADO","PARALYZED","PARALIZADO"),"#c9ff6a",9)}}
 if(ab==="HEAVY_STRIKE"&&R(S,"wa_gpp")){t.__etBrkU=now+5e3;S.effects.floatText(t.x,t.y-32,__L3("QUEBRADO","SUNDERED","ROTO"),"#ffb04a",9);S.effects.burstTinted(t.x,t.y-6,16756810,8)}}
/* abates */
function __etKill(S,e){if(!__etOn(S)||!__etSt(S).tree||!e||e.isMinion)return;const P=S.player,k=e.__etK??{},now=S.time.now;let r;
 (r=R(S,"wa_imp"))&&S.stats.addBuff("speed",Math.max(1,Math.round((S.stats.total.speed||100)*.05*r)),4);
 (r=R(S,"ra_pressa"))&&S.stats.addBuff("attackSpeed",(S.stats.total.attackSpeed||1)*.06*r,4);
 (r=R(S,"wa_n2"))&&P.active&&!P.dead&&P.heal(Math.max(1,Math.round(P.maxHp*.01*r)));
 (r=R(S,"na_colh"))&&S.resource?.gain?.((S.resource.max||0)*.03*r);
 R(S,"na_ceif")&&(S.__etSouls=Math.min(50,(S.__etSouls|0)+1),__etSoul(S,e));
 R(S,"da_sang")&&S.__form?.type==="lobisomem"&&S.__etFormU&&(S.__etFormU+=2e3,S.effects.floatText(P.x,P.y-30,"+2s","#ff8a7a",9));
 if(k.ab==="ET_CHARGE"&&R(S,"wa_invc")){const s=S.abilities.slots.find(q=>q.def?.id==="ET_CHARGE");s&&s.cooldown>0&&(s.cooldown=0,S.effects.floatText(P.x,P.y-40,__L3("INVESTIDA!","CHARGE!","¡CARGA!"),"#ffd24a",10))}
 const dm=S.__etDM;if(dm&&dm.t===e&&now<dm.until){S.__etDM=null;for(const s of S.abilities.slots)s.def&&(s.cooldown=0);S.effects.shockwaveRing(P.x,P.y,40);S.effects.floatText(P.x,P.y-40,__L3("RECARGAS ZERADAS","COOLDOWNS RESET","RECARGAS REINICIADAS"),"#ff8a7a",10);
  if(R(S,"ra_msalt")){let n=null,b=280;for(const q of __etTargets(S)){const l=Math.hypot(q.x-e.x,q.y-e.y);q!==e&&l<b&&(b=l,n=q)}n&&S.time.delayedCall(120,()=>__etAlive(n)&&__etMark(S,n))}}
 if(R(S,"na_expl")&&((e.__etPlagueU??0)>now||(e.markedUntil??0)>now||__etHasSt(e,"SLOW")||__etHasSt(e,"HSLOW"))){const x=e.x,y=e.y;S.time.delayedCall(70,()=>__etBoom(S,x,y,62,1.2,7000186,{ctx:"et:corpse",type:"magical"}))}
 S.__etSpec&&(S.__etSpec.k++,S.effects.floatText(P.x,P.y-30,`${S.__etSpec.k}/3`,"#5affb0",10))}
/* ── dano recebido ────────────────────────────────────────────────────────────────────────────────────── */
{const T0=oh.prototype.takeDamage;oh.prototype.takeDamage=function(i,t){const S=this.scene;if(this!==S?.player||!__etOn(S)||!__etSt(S).tree||this.dead||this.invuln>0||this.__shieldT>0)return T0.apply(this,arguments);
 const now=S.time.now,src=S.__etSrc??(this.__contactHit?__etNearest(S,this,44):null),proj=!src&&!!S.__etSrcProj,P=this;
 /* Aparar */
 if(S.__etParry&&now<S.__etParry.until){S.__etParry=null;__etParried(S,src??__etNearest(S,P,140));this.__contactHit=!1;return!1}
 /* esquiva */
 let dg=.04*R(S,"rd_refl");dg&&(dg=Math.min(.4,dg*__etPow(1.2,R(S,"rd_n2"))));
 if(dg>0&&Math.random()<dg){S.effects.floatText(P.x,P.y-18,W("g.dodge"),"#9a7fd0");P.invuln=Math.max(P.invuln,.25);this.__contactHit=!1;__etOnDodge(S,"reflex");return!1}
 /* Armadura de Ossos */
 if(S.__etBA>0&&now<(S.__etBAU??0)){S.__etBA--;S.effects.burstTinted(P.x,P.y-6,14215368,10);S.effects.floatText(P.x,P.y-20,"✦","#e8e0c8",10);P.invuln=Math.max(P.invuln,.35);this.__contactHit=!1;
  if(S.__etBA<=0&&R(S,"nd_arme")){S.effects.shockwaveRing(P.x,P.y,50);for(let k=0;k<8;k++){const a=k*.785,dir={x:Math.cos(a),y:Math.sin(a)},{amount:m,crit:c}=S.stats.rollAbilityDamage(1.2,"magical");S.__etCtx="et:bonearmor";try{S.projectiles.spawn({x:P.x+dir.x*12,y:P.y+dir.y*12,dir,texture:"proj-bolt",speed:420,maxDist:220,tint:14215368,damage:m,critical:c,damageType:"magical",pierce:3})}finally{S.__etCtx=null}}}return!1}
 /* multiplicadores */
 let m=1;for(const id of["wd_n1","bd_n1","ard_n1","md_n1","rd_n1","nd_n1","hd_n1","sd_n1","dd_n1"])m*=__etPow(.85,R(S,id));
 m*=1-.04*__etFortN(S);
 m*=(1-.08*R(S,"wd_pele"))*(1-.06*R(S,"hd_pel"))*(1-.06*R(S,"sd_jen"))*(1-.06*R(S,"dd_casca"));
 now<(S.__etKamU??0)&&(m*=1-.15*R(S,"bd_kam"));
 now<(S.__etJurU??0)&&(m*=.5);now<(S.__etIronU??0)&&(m*=.4);
 (r=>r&&!__etTargets(S).some(e=>Math.hypot(e.x-P.x,e.y-P.y)<96)&&(m*=1-.08*r))(R(S,"ard_dist"));
 proj&&(m*=__etPow(.8,R(S,"ard_n2")));
 R(S,"rd_lamf")&&__etInSmoke(S)&&(m*=.7);
 src&&R(S,"nd_medo")&&Math.hypot(src.x-P.x,src.y-P.y)<120&&(m*=1-.08*R(S,"nd_medo"));
 P.guarding&&(m*=1-.1*R(S,"wd_post"));
 S.__etBearOn&&(m*=.75);
 let d=i*m;
 /* Manto de Mana */
 const mr=R(S,"md_manto"),res=S.resource;if(mr&&res?.def&&res.current>0){const part=d*.1*mr,take=Math.min(res.current,part*1.5);res.current-=take;res.emit?.();d-=take/1.5;take>0&&S.effects.burstTinted(P.x,P.y-8,9089279,4)}
 /* Pacto e Uivo de Proteção: parte do dano vai para um aliado */
 const pr=R(S,"nd_pacto");if(pr){const sk=(S.minions??[]).find(q=>__etAlive(q)&&!/HOUND|WOLF/.test(q.cfg?.type??""));if(sk){const part=d*.1*pr;sk.takeDamage(Math.max(1,Math.round(part*.6)),null,0);d-=part;S.effects.burstTinted(sk.x,sk.y-6,14215368,4)}}
 if(now<(S.__etHowlU??0)){const w=__etWolf(S);if(w){const part=d*.5;w.takeDamage(Math.max(1,Math.round(part*.6)),null,0);d-=part;S.effects.burstTinted(w.x,w.y-6,10483967,5)}}
 /* escudos */
 const L=S.__etSh;if(L?.length){let est=Math.max(1,(S.stats?S.stats.mitigate(d):d)*(typeof __stgMult==="function"?__stgMult(S):1));const pre=est;
  for(const s of L){if(s.until<=now||s.amt<=0)continue;const u=Math.min(s.amt,est);s.amt-=u;est-=u;s.amt<=0&&__etShieldBreak(S,s);if(est<=0)break}
  if(est<=0){S.effects.burstTinted(P.x,P.y-8,16765514,6);S.effects.floatText(P.x,P.y-20,__L3("ABSORVIDO","ABSORBED","ABSORBIDO"),"#ffe08a",8);P.invuln=Math.max(P.invuln,.3);this.__contactHit=!1;return!1}
  d*=est/pre}
 const hp0=P.hp;S.__etBlkNow=0;const ok=T0.call(this,d,t);
 if(ok&&!P.dead){const lost=hp0-P.hp;
  if(S.__etBlkNow===now&&R(S,"wd_post")){const back=Math.floor(lost*.1*R(S,"wd_post"));back>0&&(P.hp=Math.min(P.maxHp,P.hp+back),S.game.events.emit("hud:hp",P.hp,P.maxHp))}
  R(S,"sd_raiz")&&P.knock&&(P.knock.x=0,P.knock.y=0);
  R(S,"hd_armd")&&now>=(S.__etTrapCD??0)&&(S.__etTrapCD=now+1e4,__etTrap(S,P.x,P.y+4));
  if(R(S,"sd_trov")&&lost>P.maxHp*.15&&now>=(S.__etThunCD??0)){S.__etThunCD=now+8e3;__etThunder(S)}
  if(src&&Math.hypot(src.x-P.x,src.y-P.y)<64){
   if(R(S,"sd_cesp")&&__etShOn(S,"bark")&&__etAlive(src)){const q=Math.max(1,Math.round(lost*.3+(S.stats.total.damage||2)*.5));src.takeDamage?.(q,null,0);S.effects.floatText(src.x,src.y-26,`${q}`,"#c8a070",9);S.effects.burstTinted(src.x,src.y-6,9134650,6)}
   (r=>r&&__etAlive(src)&&S.statusFx?.apply(src,r>=3?"HSLOW":"SLOW",{duration:3,power:1}))(R(S,"md_pgelo"));
   now<(S.__etIronU??0)&&__etAlive(src)&&S.statusFx?.apply(src,"BURN",{duration:3,power:Math.max(2,Math.round((S.stats.total.damage||4)*.8))})}
  if(R(S,"bd_jur")&&P.hp<P.maxHp*.3&&!S.__etRoom.jur){S.__etRoom.jur=1;S.__etJurU=now+5e3;__etTxt(S,__L3("JURAMENTO DE SATSUMA","OATH OF SATSUMA","JURAMENTO DE SATSUMA"),"#ff7a5a",11);__etFlash(S,P.x,P.y,16734794,50)}}
 return ok}}
function __etNearest(S,p,max){let n=null,b=max;for(const e of __etTargets(S)){const l=Math.hypot(e.x-p.x,e.y-p.y);l<b&&(b=l,n=e)}return n}
function __etShieldBreak(S,s){const P=S.player;S.effects.burstTinted(P.x,P.y-8,s.col,14);S.effects.shockwaveRing(P.x,P.y,26);
 if(s.renew>0){s.renew--;s.__pend=!0;S.time.delayedCall(250,()=>{s.__pend=!1;if(!P.active||P.dead)return;s.amt=s.max;s.until=S.time.now+s.dur*1e3;S.effects.floatText(P.x,P.y-30,__L3("RENOVADA","RENEWED","RENOVADA"),"#c8a070",9);__etFlash(S,P.x,P.y,s.col,40)})}}
function __etThunder(S){const P=S.player;S.cameraSys?.shake?.(.008,200);S.effects.floatText(P.x,P.y-34,__L3("TROVÃO DE TUPÃ","TUPÃ'S THUNDER","TRUENO DE TUPÃ"),"#bfe0ff",11);
 for(const e of __etTargets(S)){if(Math.hypot(e.x-P.x,e.y-P.y)>150)continue;const g=S.add.graphics().setDepth(9e3);g.lineStyle(3,12574975,1);let x=e.x,y=e.y-120;g.beginPath();g.moveTo(x,y);for(let k=0;k<6;k++){x=e.x+Math.random()*16-8;y+=20;g.lineTo(x,y)}g.strokePath();
  S.tweens.add({targets:g,alpha:0,duration:260,onComplete:()=>g.destroy()});__etFlash(S,e.x,e.y,12574975,30);__etHit(S,e,2,{ctx:"et:thunder",type:"magical",stun:.5})}}
function __etParried(S,src){const P=S.player;S.effects.floatText(P.x,P.y-30,__L3("APARADO!","PARRIED!","¡PARADO!"),"#ffffff",13);__etFlash(S,P.x,P.y-8,16777215,46);S.effects.hitStop?.(90);S.cameraSys?.shake?.(.006,140);S.audioRef?.play("sfx-shield-block");P.invuln=Math.max(P.invuln,.4);
 if(__etAlive(src)){const dx=src.x-P.x,dy=src.y-P.y,l=Math.hypot(dx,dy)||1;P.facing={x:dx/l,y:dy/l};dx!==0&&P.setFlipX(dx<0);
  if(R(S,"bd_apap")&&Ye.IAIJUTSU&&(S.skillState.unlocked??[]).includes("IAIJUTSU")){S.__etFreeCast=!0;try{S.abilities.execute(Ye.IAIJUTSU)}catch(e){}S.__etFreeCast=!1}
  else{S.effects.arcSlash(P.x,P.y,Math.atan2(dy,dx),80,90,12640767);__etHit(S,src,2.4,{ctx:"et:parry",stun:.6})}}
 if(R(S,"bd_mente")){P.heal(Math.max(1,Math.round(P.maxHp*.05)));const r=R(S,"bd_disc");r&&__etShield(S,"kiai",P.maxHp*.1*r,5,15125322)}}
/* esquiva (dash ou Reflexos) */
function __etOnDodge(S,kind){const P=S.player,now=S.time.now;R(S,"rd_contra")&&(S.__etNextCrit=!0);
 if(R(S,"ard_danca")&&now>=(S.__etDanceCD??0)){S.__etDanceCD=now+3e3;P.invuln=Math.max(P.invuln,1);S.effects.floatText(P.x,P.y-30,__L3("DANÇA DO VENTO","WIND DANCE","DANZA DEL VIENTO"),"#c0e0ff",9);__etFlash(S,P.x,P.y,12640767,30)}
 if(kind==="reflex"&&R(S,"rd_mare")){const s=S.abilities.slots.find(q=>q.def?.id==="ET_ROLL");s&&s.cooldown>0&&(s.cooldown=0,s.__chOk=!0,S.effects.floatText(P.x,P.y-40,__L3("MARÉ BAIXA","LOW TIDE","MAREA BAJA"),"#9ad0ff",9))}
 if(kind==="dash"&&R(S,"ard_fant"))__etPhantom(S)}
function __etPhantom(S){const P=S.player;let im;try{im=S.add.sprite(P.x,P.y,P.texture.key,P.frame?.name??0).setFlipX(P.flipX).setScale(P.scaleX,P.scaleY).setTint(10137804).setAlpha(.6).setDepth(P.y).setBlendMode(j.BlendModes.ADD)}catch(e){return}
 const x=P.x,y=P.y;for(let k=0;k<6;k++)S.time.delayedCall(250+k*480,()=>{if(!im.active)return;const t=__etNearest(S,{x,y},260);if(!t)return;const dx=t.x-x,dy=t.y-y,l=Math.hypot(dx,dy)||1,dir={x:dx/l,y:dy/l},{amount:m,crit:c}=S.stats.rollAbilityDamage(.7,"physical");im.setFlipX(dx<0);
  S.__etCtx="et:phantom";try{S.projectiles.spawn({x:x+dir.x*12,y:y+dir.y*12,dir,texture:"proj-arrow",speed:480,maxDist:280,tint:10137804,damage:m,critical:c,damageType:"physical"})}finally{S.__etCtx=null}});
 S.time.delayedCall(3e3,()=>S.tweens.add({targets:im,alpha:0,duration:250,onComplete:()=>im.destroy()}))}
/* ── trapaças da morte (uma vez por andar ou sala) ───────────────────────────────────────────────────────── */
{const D0=oh.prototype.die;oh.prototype.die=function(){const S=this.scene;try{if(this===S?.player&&__etOn(S)&&__etSt(S).tree&&__etCheat(S,this,D0))return}catch(e){console.warn("[et] cheat",e)}return D0.apply(this,arguments)}}
function __etCheat(S,P,D0){const now=S.time.now,F=S.__etFloor??(S.__etFloor={}),Rm=S.__etRoom??(S.__etRoom={});
 const rev=(hp,inv,txt,col)=>{P.dead=!1;P.hp=Math.max(1,Math.min(P.maxHp,Math.round(hp)));P.invuln=Math.max(P.invuln,inv);S.game.events.emit("hud:hp",P.hp,P.maxHp);__etFlash(S,P.x,P.y,col,70);S.effects.shockwaveRing(P.x,P.y,60);
  S.effects.floatText(P.x,P.y-36,txt,"#"+col.toString(16).padStart(6,"0"),12);S.cameraSys?.shake?.(.008,240);return!0};
 if(R(S,"rd_ning")&&!Rm.ning){Rm.ning=1;for(let k=0;k<12;k++){const a=Math.random()*6.28,x=P.x+Math.cos(a)*120,y=P.y+Math.sin(a)*120;if(!S.dungeon?.isWallAtWorld?.(x,y)){S.effects.burstTinted(P.x,P.y,3025464,16);P.setPosition(x,y);break}}
  rev(P.maxHp*.15,2,__L3("NINGUÉM ME VÊ","NO ONE SEES ME","NADIE ME VE"),9058998);__etInvis(S,2);return!0}
 if(R(S,"wd_rei")&&!F.rei){F.rei=1;const n=__etFortN(S);S.__etFortL=[];return rev(1+P.maxHp*.1*n,1.2,__L3("ÚLTIMO REI DE PÉ","LAST KING STANDING","ÚLTIMO REY EN PIE"),16761165)}
 const lockRev=(key,txt,col,hp,draw)=>{F[key]=1;rev(1,3.3,txt,col);S.__etLockU=now+3e3;__etZone(S,{x:P.x,y:P.y,r:1,dur:3,follow:!0,depth:P.y+60,draw});
  S.time.delayedCall(3e3,()=>{if(!P.active)return;P.hp=Math.max(P.hp,Math.round(P.maxHp*hp));S.game.events.emit("hud:hp",P.hp,P.maxHp);for(let k=0;k<18;k++)S.effects.burstTinted(P.x+Math.random()*30-15,P.y-12+Math.random()*30-15,col,3);S.effects.shockwaveRing(P.x,P.y,70);P.heal(1)});return!0};
 if(R(S,"md_sarc")&&!F.sarc)return lockRev("sarc",__L3("SARCÓFAGO","SARCOPHAGUS","SARCÓFAGO"),10483967,.4,(z,f,life)=>{const g=z.g.clear().setDepth(S.player.y+60),x=z.x,y=z.y-12,h=26+Math.min(1,life*4)*8;
  g.fillStyle(10483967,.35*f).lineStyle(2,15204351,.9*f).beginPath();g.moveTo(x,y-h);g.lineTo(x+14,y-h*.4);g.lineTo(x+12,y+h*.6);g.lineTo(x,y+h*.8);g.lineTo(x-12,y+h*.6);g.lineTo(x-14,y-h*.4);g.closePath();g.fillPath();g.strokePath();
  g.lineStyle(1,16777215,.6*f).lineBetween(x-6,y-h*.5,x+2,y+h*.3)});
 if(R(S,"dd_ren")&&!F.ren)return lockRev("ren",__L3("RENASCER","REBIRTH","RENACER"),5287994,.5,(z,f,life)=>{const g=z.g.clear().setDepth(S.player.y+60),x=z.x,y=z.y,s=Math.min(1,life*5);
  g.fillStyle(6044970,f).fillRect(x-4,y-26*s,8,26*s+6).fillStyle(3368499,.95*f).fillCircle(x,y-30*s,16*s).fillStyle(5287994,.95*f).fillCircle(x-8,y-34*s,10*s).fillCircle(x+9,y-32*s,9*s)});
 if(R(S,"hd_han")&&!F.han){F.han=1;try{const w=S.add.sprite(P.x-90,P.y,S.textures.exists("hunter-hound")?"hunter-hound":P.texture.key,0).setTint(12640767).setAlpha(.7).setBlendMode(j.BlendModes.ADD).setDepth(P.y+1);S.tweens.add({targets:w,x:P.x,duration:340,onComplete:()=>S.tweens.add({targets:w,alpha:0,scale:1.6,duration:420,onComplete:()=>w.destroy()})})}catch(e){}
  return rev(P.maxHp*.5,1.5,__L3("ESPÍRITO HÄN","HÄN SPIRIT","ESPÍRITU HÄN"),12640767)}
 if(R(S,"nd_nao")&&!F.nao){F.nao=1;rev(1,6.3,__L3("NÃO MORTO","UNDEAD","NO MUERTO"),5963696);S.__etSpec={until:now+6e3,k:0,D0};P.setAlpha?.(.5);try{S.playerVisual?.setTintAll?.(5963696)}catch(e){}return!0}
 return!1}
/* ── habilidades: arma exigida, cargas, contexto do dano ─────────────────────────────────────────────────── */
{const TU0=Yh.prototype.tryUse;Yh.prototype.tryUse=function(k){const S=this.scene,t=this.slots[k];if(!t?.def||!__etOn(S))return TU0.apply(this,arguments);
 const d=t.def.__etOffOf??t.def,nid=d.etNode;
 if(nid){if(__etRaw(S,nid)<=0)return!1;const w=__ETIDX[nid].n.w;if(w&&!__etHas(S,w)){if(!(t.__etDen>S.time.now)){t.__etDen=S.time.now+900;const P=S.player;S.effects.floatText(P.x,P.y-24,__L3("Requer: ","Requires: ","Requiere: ")+__etL(__ETFAM[w].n),"#e08a7a",9);S.audioRef?.play("sfx-event-refuse")}return!1}}
 S.__etLastSlot=k;const ok=TU0.apply(this,arguments);
 if(ok&&nid&&d.ch2&&__etRaw(S,nid)>=2&&t.__chOk!==!1){t.__chOk=!1;t.__chT=t.cooldown;t.cooldown=.45}return ok}}
{const U0=Yh.prototype.update;Yh.prototype.update=function(dt){const r=U0.apply(this,arguments),S=this.scene;try{if(!__etOn(S))return r;
 for(const t of this.slots){if(t.__chT>0&&(t.__chT-=dt,t.__chT<=0)&&(t.__chOk=!0));const b=t.def?.__etOffOf??t.def;if(!b?.etNode)continue;const w=__ETIDX[b.etNode].n.w,off=!!w&&!__etHas(S,w);
  if(off&&!t.def.__etOffOf)t.def=__etOffDef(S,b);else if(!off&&t.def.__etOffOf)t.def=b}}catch(e){}return r}}
{const S0=Yh.prototype.setEquipped;Yh.prototype.setEquipped=function(i){return S0.call(this,i)}}
function __etOffDef(S,d){d.__etOff||(d.__etOff=Object.create(d,{icon:{value:__etOffTex(S,d.icon)},__etOffOf:{value:d}}));return d.__etOff}
/* ícone "arma riscada": versão cinza do ícone com um traço vermelho */
function __etOffTex(S,key){const k=key+"~off",T=S.textures;try{if(T.exists(k))return k;if(!T.exists(key))return key;const fr=T.getFrame(key),w=fr.cutWidth,h=fr.cutHeight,c=T.createCanvas(k,w,h),x=c.getContext(),src=fr.source.image;
 x.filter="grayscale(1) brightness(.55)";x.drawImage(src,fr.cutX,fr.cutY,w,h,0,0,w,h);x.filter="none";x.strokeStyle="#ff4a3a";x.lineWidth=Math.max(2,w/10);x.lineCap="round";x.beginPath();x.moveTo(w*.18,h*.82);x.lineTo(w*.82,h*.18);x.stroke();c.refresh();return k}catch(e){return key}}
{const EX0=Yh.prototype.execute;Yh.prototype.execute=function(d){const S=this.scene;if(!__etOn(S)||!__etSt(S).tree||!d)return EX0.apply(this,arguments);const P=S.player;
 d=__etModDef(S,d);if(d.type==="et"&&d.aim){try{const A=__aimDir(S,500);A&&(this.__aimOv=A,P.facing={x:A.x,y:A.y},A.x!==0&&P.setFlipX(A.x<0))}catch(e){}}
 if(!S.__etFreeCast){S.__etCasts=(S.__etCasts|0)+1;R(S,"ma_sobre")&&S.__etCasts%4===0&&(S.__etOverNow=!0,S.effects.floatText(P.x,P.y-34,__L3("SOBRECARGA","OVERLOAD","SOBRECARGA"),"#c9a0ff",10))}
 const pc=S.__etCtx;S.__etCtx="ab:"+d.id;let r;try{r=EX0.call(this,d)}finally{S.__etCtx=pc;S.__etOverNow=!1}try{__etAfterCast(S,this,d);__etAfterCast2(S,this,d)}catch(e){console.warn("[et] after",e)}return r}}
{const X0=Yh.prototype.__exec0;Yh.prototype.__exec0=function(d){if(d?.type==="et"){const f=__ETAB[d.id];if(f){try{f(this,d,this.scene)}catch(e){console.warn("[et] ability",d.id,e)}}return}return X0.apply(this,arguments)}}
function __etAfterCast2(S,Y,d){const P=S.player;
 if(d.id==="ET_TOXIC_SMOKE"){const z0=S.smokeZone;if(!z0)return;__etZone(S,{x:z0.x,y:z0.y,r:z0.radius,dur:d.duration??4,every:.5,depth:3,draw:(z,f)=>{z.g.clear().fillStyle(7000186,.1*f).fillCircle(z.x,z.y,z.r);Math.random()<.4&&S.effects.burstTinted(z.x+Math.random()*z.r-z.r/2,z.y+Math.random()*z.r-z.r/2,7000186,2)},
  tick:z=>{for(const e of __etTargets(S))Math.hypot(e.x-z.x,e.y-z.y)<z.r&&S.statusFx?.apply(e,"POISON",{duration:3,power:Math.max(2,Math.round((S.stats.total.damage||4)*.9))})}})}}
/* formas do Druida: duração controlada aqui (Lua Cheia, Sangue Celta, Lua de Závist), Instinto Animal e Visco */
{const SH0=Yh.prototype.execShapeshift;Yh.prototype.execShapeshift=function(i){const S=this.scene;if(!__etOn(S)||!__etSt(S).tree)return SH0.apply(this,arguments);const P=S.player,m0=P.maxHp;
 const dur=(i.duration??5)*(i.id==="ET_BEAR"?1:__etPow(1.3,R(S,"da_n2")));S.__etBearOn&&i.id!=="ET_BEAR"&&(S.__etBearOn=!1);const r=SH0.call(this,{...i,duration:9999});S.__etFormU=S.time.now+dur*1e3;
 if(R(S,"dd_inst")&&P.statuses){for(const k of["SLOW","CHILL","POISON","STUN","HSLOW","FREEZE"])delete P.statuses[k];S.statusFx?.refreshTint?.(P);S.effects.floatText(P.x,P.y-40,__L3("INSTINTO","INSTINCT","INSTINTO"),"#8ae08a",9)}
 const v=R(S,"dd_visco");v&&P.heal(Math.max(1,Math.round(P.maxHp*.03*v)));S.stats.recompute();P.maxHp>m0&&(P.hp=Math.min(P.maxHp,P.hp+(P.maxHp-m0)),S.game.events.emit("hud:hp",P.hp,P.maxHp));return r}}
{const SU0=Yh.prototype.execSummon;Yh.prototype.execSummon=function(i,...a){const S=this.scene,r=SU0.call(this,i,...a);try{if(!__etOn(S)||!__etSt(S).tree)return r;const m=(S.minions??[])[S.minions.length-1];if(!m||m.__etDone)return r;m.__etDone=1;
 const ty=i.minion?.type??"",wolf=/HOUND|WOLF/.test(ty);let hm=wolf?(1+.4*R(S,"hd_lobo"))*__etPow(1.5,R(S,"hd_n2")):(1+.3*R(S,"nd_duro"))*__etPow(1.5,R(S,"nd_n2"));
 if(!wolf&&R(S,"nd_escud")){m.__etShieldSk=!0;hm*=1.3;m.setTint?.(11061503)}hm!==1&&(m.maxHp=Math.round(m.maxHp*hm),m.hp=m.maxHp)}catch(e){}return r}}
/* ── projéteis: etiqueta de origem, perfuração, flecha de fogo, explosões em cacho ─────────────────────── */
{const KS0=Kh.prototype.spawn;Kh.prototype.spawn=function(o){const S=this.scene;if(!o||o.hostile||!__etOn(S)||!__etSt(S).tree)return KS0.apply(this,arguments);
 const basic=!!S.__etBasic,ctx=basic?"basic":(S.__etCtx??null);o={...o};const arrow=/arrow|dart/.test(o.texture||"");
 const pr=R(S,"ara_pont");pr&&arrow&&(o.pierce=Math.max(o.pierce||0,pr+1));
 if(basic){S.__etTowerOn&&(o.maxDist=(o.maxDist||280)*1.4);
  if(R(S,"ara_saku")&&arrow&&(S.__etArrows=(S.__etArrows|0)+1)%10===0){o.explosion={radius:52};o.tint=16742954;o.status={key:"BURN",duration:3};S.textures.exists("proj-fireball")&&(o.texture="proj-fireball");__etFlash(S,o.x,o.y,16742954,24)}
  R(S,"ma_comb")&&!o.status&&__etHas(S,"fogo")&&(o.status={key:"BURN",duration:2})}
 ctx&&(o.status={key:"__ET",tag:ctx,inner:o.status??null});return KS0.call(this,o)}}
{const KI0=Kh.prototype.impact;Kh.prototype.impact=function(i,t,e){const S=this.scene,tag=t?.status?.key==="__ET"?t.status.tag:null,x=t?.x,y=t?.y,r=KI0.apply(this,arguments);try{if(tag&&__etOn(S)){
 if(tag==="ab:EXPLOSIVE_ARROW"&&R(S,"ara_cacho"))for(let k=0;k<3;k++){const a=k*2.09+Math.random(),q=34;S.time.delayedCall(160+k*90,()=>__etBoom(S,x+Math.cos(a)*q,y+Math.sin(a)*q,32,.7,16748330,{ctx:"et:cluster"}))}
 if(tag==="ab:ET_ICE_COMET"&&R(S,"ma_come"))for(const q of __etTargets(S))Math.hypot(q.x-x,q.y-y)<70&&__etStun(S,q,1,"FREEZE")}}catch(x){}return r}}
/* ── estados: duração e força (Combustão, venenos, Maldição Profunda, Pelagem Grossa) ──────────────────── */
{const QA0=Qh.prototype.apply;Qh.prototype.apply=function(i,t,o){const S=this.scene;if(!i||!__etOn(S)||!__etSt(S).tree)return QA0.apply(this,arguments);o=o??{};
 if(i===S.player){if(t==="CHILL"&&R(S,"hd_pel"))return;if(S.__etBearOn&&(t==="SLOW"||t==="CHILL"))return;return QA0.apply(this,arguments)}
 let du=o.duration??3,pw=o.power??1,ex=0;
 t==="POISON"&&(pw*=__etPow(1.4,R(S,"ra_n1"))*__etPow(1.4,R(S,"sa_n1"))*(R(S,"sa_curm")?1.5:1));
 t==="BURN"&&(ex+=R(S,"ma_comb"));t==="SLOW"&&S.__etCtx==="ab:CURSE_NOVA"&&(ex+=2*R(S,"na_mald"));
 const r=QA0.call(this,i,t,{...o,duration:du,power:pw});ex>0&&i.statuses?.[t]&&(i.statuses[t].t=Math.max(i.statuses[t].t,Math.min(du,ai[t]?.maxDuration??du)+ex));return r}}
/* ── inimigos: isca, invisibilidade e esqueletos escudeiros mudam o alvo ───────────────────────────────── */
{const EU0=Ei.prototype.update;Ei.prototype.update=function(dt,t){const S=this.scene;if(S?.__etLure&&t===S.player){const L=__etLureFor(S,this.e);L&&(t=L)}return EU0.call(this,dt,t)}}
function __etLureFor(S,e){const now=S.time.now,P=S.player;if(now<(S.__etInvisU??0)){const o=S.__etInvT??(S.__etInvT={dead:!0});o.x=P.x;o.y=P.y;return o}
 const dc=S.__etDecoy;if(dc&&now<dc.until&&Math.hypot(e.x-dc.x,e.y-dc.y)<300)return dc;
 if(R(S,"nd_escud"))for(const m of S.minions??[])if(m.__etShieldSk&&__etAlive(m)&&Math.hypot(m.x-e.x,m.y-e.y)<90)return m;return null}
{const FT0=Wh.prototype.findTarget;Wh.prototype.findTarget=function(){const f=this.__etForce,S=this.scene;if(f){if(__etAlive(f)&&S.__etCoord?.t===f&&S.time.now<S.__etCoord.until){this.targetRef=f;return{target:f,dist:Math.hypot(f.x-this.x,f.y-this.y)}}this.__etForce=null}return FT0.apply(this,arguments)}}
{const WD0=Wh.prototype.die;typeof WD0==="function"&&(Wh.prototype.die=function(){const S=this.scene,r=WD0.apply(this,arguments);try{
 if(this.__etKnight)S.__etKnightT=S.time.now+15e3;
 else if(__etOn(S)&&R(S,"nd_exer")&&this.cfg&&!this.__etReborn&&!/HOUND|WOLF/.test(this.cfg.type??"")){const cfg={...this.cfg},hp=this.maxHp,sh=this.__etShieldSk;S.time.delayedCall(3e3,()=>{const P=S.player;if(!P?.active||P.dead)return;try{const a=Math.random()*6.28,m=new Wh(S,P.x+Math.cos(a)*28,P.y+Math.sin(a)*28,{...cfg,hp,lifetimeSec:Math.max(6,(cfg.lifetimeSec??10)*.6)});
  m.__etReborn=1;m.__etDone=1;m.maxHp=hp;m.hp=hp;sh&&(m.__etShieldSk=!0,m.setTint?.(11061503));(S.minions=S.minions??[]).push(m);S.effects.floatText(m.x,m.y-24,__L3("ERGUIDO","RISEN","ALZADO"),"#e8e0c8",9);S.effects.burstTinted(m.x,m.y,14215368,12)}catch(e){}})}}catch(e){}return r})}
/* ── ataque básico: contador de golpes (Lâmina do Herdeiro), Kamae ───────────────────────────────────────── */
{const DA0=dh.prototype.deliverAttack;dh.prototype.deliverAttack=function(i,t,e){const S=this.scene;if(!__etOn(S)||!__etSt(S).tree)return DA0.apply(this,arguments);S.__etBasic=!0;let r;try{r=DA0.apply(this,arguments)}finally{S.__etBasic=!1}
 try{const now=S.time.now,P=S.player;R(S,"bd_kam")&&(S.__etKamU=now+2e3);
  if(R(S,"wa_her")&&(S.__etSwing=(S.__etSwing|0)+1)%5===0){const fd=P.facing,l=Math.hypot(fd.x,fd.y)||1,dir={x:fd.x/l,y:fd.y/l},{amount:m,crit:c}=S.stats.rollAbilityDamage(1.5,"physical");S.__etCtx="et:heir";
   try{const p=S.projectiles.spawn({x:P.x+dir.x*16,y:P.y+dir.y*16,dir,texture:"slash",speed:380,maxDist:210,tint:16777215,damage:m,critical:c,damageType:"physical",pierce:6,noFalloff:!0});p?.img?.setScale?.(1.3).setBlendMode?.(j.BlendModes.ADD)}finally{S.__etCtx=null}__etFlash(S,P.x+dir.x*20,P.y+dir.y*20,16777215,24)}}catch(x){}return r}}
/* ── dash: Pés de Cinza, Dança do Vento, Fantasma de Cinza, Contra-ataque na Sombra ─────────────────────── */
{const TD0=Sd.prototype.tryDash;Sd.prototype.tryDash=function(){const ok=TD0.apply(this,arguments);try{if(ok&&__etOn(this)&&__etSt(this).tree){const r=R(this,"bd_pes");r&&(this.player.invuln+=.15*r);__etOnDodge(this,"dash")}}catch(e){}return ok}}
{const SB0=Sd.prototype.onShieldBlock;Sd.prototype.onShieldBlock=function(){const r=SB0.apply(this,arguments);try{if(__etOn(this)&&R(this,"wd_post")){__etFort(this,1);this.__etBlkNow=this.time.now}}catch(e){}return r}}
/* ── a cada quadro ─────────────────────────────────────────────────────────────────────────────────────── */
function __etTick(S,dt){if(!__etOn(S))return;const st=__etSt(S),P=S.player;if(!st.tree||!P||S.state!=="playing"||S.uiOpen)return;const now=S.time.now;
 if(P.dead){S.__etOv?.clear?.();return}
 __etZoneTick(S,dt);__etBlockTick(S);
 const v=P.body?.velocity,still=!!v&&Math.hypot(v.x,v.y)<12;S.__etStillT=still?(S.__etStillT??0)+dt:0;let r;
 if((r=R(S,"bd_resp"))&&(still||P.guarding)&&P.hp<P.maxHp){S.__etRg=(S.__etRg??0)+P.maxHp*.005*r*__etPow(1.5,R(S,"bd_n2"))*dt;const n=Math.floor(S.__etRg);n>0&&(S.__etRg-=n,P.hp=Math.min(P.maxHp,P.hp+n),S.game.events.emit("hud:hp",P.hp,P.maxHp),Math.random()<.4&&S.effects.burstTinted(P.x,P.y-6,5221971,2))}
 if((r=R(S,"md_conc"))&&still&&S.resource?.def&&S.resource.current<S.resource.max)S.resource.gain((S.resource.def.regen||2)*.5*r*dt);
 const tw=!!R(S,"ard_torre")&&S.__etStillT>=2;tw!==!!S.__etTowerOn&&(S.__etTowerOn=tw,tw&&(__etFlash(S,P.x,P.y,16769354,30),S.effects.floatText(P.x,P.y-30,__L3("TORRE DE VIGIA","WATCHTOWER","TORRE DE VIGÍA"),"#ffe08a",9)));
 R(S,"hd_pel")&&P.statuses?.CHILL&&delete P.statuses.CHILL;
 const PR=S.projectiles?.projectiles;if(PR?.length){const M=S.__etMirror;if(M&&now<M.until){M.follow&&(M.x=P.x,M.y=P.y);for(const p of PR)p.hostile&&Math.hypot(p.x-M.x,p.y-M.y)<M.r&&(__etReflect(S,p,16765514),R(S,"md_hier")&&S.resource?.gain?.((S.resource.max||0)*.02))}
  if(R(S,"wd_espin")&&__etShOn(S,"aegis"))for(const p of PR)p.hostile&&Math.hypot(p.x-P.x,p.y-P.y)<30&&__etReflect(S,p,16761165);
  const ir=R(S,"sd_esg"),ag=R(S,"dd_aguia")&&S.__eagle&&!S.__eagle.gone;if((ir||ag)&&now>=(S.__etIcpT??0))for(let k=PR.length-1;k>=0;k--){const p=PR[k];if(!p.hostile||Math.hypot(p.x-P.x,p.y-P.y)>80)continue;
   PR.splice(k,1);p.img.destroy();S.__etIcpT=now+(ir?(ir>=2?4e3:6e3):3e3);__etFlash(S,p.x,p.y,15258330,20);S.effects.burstTinted(p.x,p.y,15258330,8);S.effects.floatText(p.x,p.y-12,"✦","#ffe08a",10);break}}
 S.__etLure=!!(S.__etDecoy&&now<S.__etDecoy.until)||now<(S.__etInvisU??0)||!!R(S,"nd_escud")&&(S.minions??[]).some(m=>m.__etShieldSk&&__etAlive(m));
 if(R(S,"da_merg")&&S.__eagle&&!S.__eagle.gone&&now>=(S.__etDiveT??0)){const fl=now<(S.__etFlockU??0);S.__etDiveT=now+2600/(1+.3*R(S,"da_ceu"))/(fl?2:1);
  __etTargets(S).filter(e=>Math.hypot(e.x-P.x,e.y-P.y)<280).sort((a,b)=>Math.hypot(a.x-P.x,a.y-P.y)-Math.hypot(b.x-P.x,b.y-P.y)).slice(0,fl?5:1).forEach((e,k)=>S.time.delayedCall(k*110,()=>__etDive(S,e,1.1,null,!0)))}
 if(R(S,"sa_rev")&&now>=(S.__etRevT??0)){const L=__etTargets(S).filter(e=>__etHasSt(e,"POISON")&&Math.hypot(e.x-P.x,e.y-P.y)<320);if(L.length){S.__etRevT=now+8e3;S.effects.floatText(P.x,P.y-34,__L3("REVOADA","FLOCK","BANDADA"),"#ffe08a",10);L.slice(0,8).forEach((e,k)=>S.time.delayedCall(k*90,()=>__etDive(S,e,1.2,null)))}}
 if(R(S,"nd_rei")&&!__etAlive(S.__etKnight)&&now>=(S.__etKnightT??0))__etKnightUp(S);
 if(S.__etFormU&&S.__form){const lua=R(S,"da_lua")&&S.__form.type==="lobisomem"&&__etAlive(S.boss);if(!lua&&now>=S.__etFormU){S.__etFormU=0;S.__endForm?.()}}
 if(S.__etBearOn&&(!S.__form||now>=(S.__etBearU??0))){S.__etBearOn=!1;S.__form&&S.__endForm?.();try{S.playerVisual?.clearTintAll?.()}catch(e){}S.stats.recompute()}
 if(R(S,"da_mat")&&now<(S.__etBHowlU??0)&&now>=(S.__etLeapT??0)){S.__etLeapT=now+700;const t=__etNearest(S,P,170);if(t){const a=Math.atan2(P.y-t.y,P.x-t.x),x=t.x+Math.cos(a)*18,y=t.y+Math.sin(a)*18;S.dungeon?.isWallAtWorld?.(x,y)||(S.effects.burstTinted(P.x,P.y,14365530,6),P.setPosition(x,y));
  try{S.playerVisual?.spawnAfterimage?.()}catch(e){}__etSlashAt(S,t.x,t.y-6,a+Math.PI,14365530);__etHit(S,t,1,{ctx:"et:leap",kb:.4})}}
 if(S.__etCoord&&now>=S.__etCoord.until)S.__etCoord=null;if(S.__etDM&&(now>=S.__etDM.until||!__etAlive(S.__etDM.t)))S.__etDM=null;
 if(S.__etBA>0&&now>=(S.__etBAU??0))S.__etBA=0;if(S.__etSh?.length){for(const s of S.__etSh)s.until<=now&&s.amt>0&&s.renew>0&&(s.amt=0,__etShieldBreak(S,s));S.__etSh=S.__etSh.filter(s=>s.until>now&&s.amt>0||s.__pend)}
 const sp=S.__etSpec;if(sp&&now>=sp.until){S.__etSpec=null;P.setAlpha?.(1);try{S.playerVisual?.clearTintAll?.()}catch(e){}if(sp.k>=3){P.hp=Math.max(P.hp,Math.round(P.maxHp*.3));S.game.events.emit("hud:hp",P.hp,P.maxHp);__etFlash(S,P.x,P.y,5963696,60);S.effects.floatText(P.x,P.y-34,__L3("DE VOLTA","BACK FROM THE GRAVE","DE VUELTA"),"#5affb0",12)}else{P.hp=0;sp.D0.call(P);return}}
 const nm=S.stats.nm|0;if(nm>(S.__etNmSeen|0)){S.__etNmSeen=nm;S.time.delayedCall(1800,()=>S.game.events.emit("ui:banner",__L3("+1 ponto de Pesadelo na Árvore do Infinito","+1 Nightmare point on the Endless Tree","+1 punto de Pesadilla en el Árbol del Infinito"),"#ff7a5a"));S.scene.get("UI")?.refreshSkillsAlert?.()}
 __etDraw(S)}
function __etPost(S){const P=S.player,now=S.time.now;if(!P?.body||!__etOn(S))return;if(now<(S.__etLockU??0)||now<(S.__etIceU??0))P.setVelocity(0,0)}
function __etReflect(S,p,col){p.hostile=!1;p.dir={x:-p.dir.x,y:-p.dir.y};p.damage=S.stats.rollAbilityDamage(1.4,S.classDef.basicProjectile?.damageType??"physical").amount;p.traveled=0;p.maxDist=Math.max(p.maxDist||0,260);p.noFalloff=!0;
 p.img?.setTint?.(col).setRotation?.(Math.atan2(p.dir.y,p.dir.x));p.trailTint=col;p.status={key:"__ET",tag:"et:reflect",inner:null};p.hitSet=p.hitSet??null;S.effects.burstTinted(p.x,p.y,col,6)}
function __etKnightUp(S){const P=S.player;S.__etKnightT=S.time.now+15e3;try{const o=Math.max(1,S.stats.total.magicDamage??1),m=new Wh(S,P.x-26,P.y,{type:"SKELETON",hp:Math.max(10,Math.round(o*6)),damage:Math.max(1,Math.round(o*.7)),bossDamageMult:.6,speed:160,lifetimeSec:99999,attackRange:28,attackCooldown:1.2,unitIndex:0,totalUnits:1});
 m.__etKnight=1;m.__etDone=1;m.setScale(m.scaleX*1.35);m.setTint?.(15258330);(S.minions=S.minions??[]).push(m);S.__etKnight=m;S.effects.floatText(m.x,m.y-34,__L3("CAVALEIRO ESQUELETO","SKELETON KNIGHT","CABALLERO ESQUELETO"),"#ffe08a",10);S.effects.shockwaveRing(m.x,m.y,40);__etFlash(S,m.x,m.y,15258330,40)}catch(e){}}
/* desenhos por cima do herói: escudos, Fortificação, armadura de ossos, espelho, marcas */
function __etDraw(S){const P=S.player,now=S.time.now;let g=S.__etOv;if(!g||!g.active)g=S.__etOv=S.add.graphics();g.clear().setDepth(P.depth+6);const T=now/1e3;
 for(const s of S.__etSh??[]){if(s.until<=now||s.amt<=0)continue;const k=s.amt/s.max,r=19+Math.sin(T*4)*1;g.fillStyle(s.col,.1+.06*k).fillCircle(P.x,P.y-8,r).lineStyle(2,s.col,.35+.5*k).strokeCircle(P.x,P.y-8,r);
  for(let q=0;q<3;q++){const a=T*2.2+q*2.09;g.lineStyle(2.5,16777215,.5*k).beginPath();g.arc(P.x,P.y-8,r,a,a+.6);g.strokePath()}}
 const nf=__etFortN(S);for(let q=0;q<nf;q++){const x=P.x-(nf-1)*4+q*8,y=P.y-34;g.fillStyle(16761165,.95).fillTriangle(x,y-4,x+3,y,x,y+4).fillTriangle(x,y-4,x-3,y,x,y+4)}
 if(S.__etBA>0&&now<(S.__etBAU??0))for(let q=0;q<S.__etBA;q++){const a=T*2.6+q*6.283/S.__etBAmax,x=P.x+Math.cos(a)*22,y=P.y-8+Math.sin(a)*12;g.lineStyle(3,15262920,.95).lineBetween(x-3,y-3,x+3,y+3).fillStyle(15262920,1).fillCircle(x-3,y-3,1.6).fillCircle(x+3,y+3,1.6)}
 if(S.__etParry&&now<S.__etParry.until)g.lineStyle(2,16777215,.9).strokeCircle(P.x,P.y-8,16+(S.__etParry.until-now)/40);
 if(now<(S.__etIronU??0))g.lineStyle(3,13161192,.7).strokeRect(P.x-14,P.y-26,28,32);
 if(now<(S.__etJurU??0))g.lineStyle(2,16734794,.55+Math.sin(T*10)*.25).strokeCircle(P.x,P.y-8,22);
 if(S.__etTowerOn)g.lineStyle(1.5,16769354,.6).strokeEllipse(P.x,P.y+10,34,10);
 const M=S.__etMirror;if(M&&now<M.until){const n=6,c=16765514;g.lineStyle(2.5,c,.85);for(let q=0;q<n;q++){const a=T*3+q*6.283/n,b=a+6.283/n*.55;g.lineBetween(M.x+Math.cos(a)*M.r,M.y-8+Math.sin(a)*M.r,M.x+Math.cos(b)*M.r,M.y-8+Math.sin(b)*M.r)}g.fillStyle(c,.08).fillCircle(M.x,M.y-8,M.r)}
 if(now<(S.__etIceU??0)){const x=P.x,y=P.y-12;g.fillStyle(10483967,.32).lineStyle(2,15204351,.9).beginPath();g.moveTo(x,y-26);g.lineTo(x+16,y-8);g.lineTo(x+13,y+18);g.lineTo(x-13,y+18);g.lineTo(x-16,y-8);g.closePath();g.fillPath();g.strokePath()}
 const dm=S.__etDM;if(dm&&__etAlive(dm.t)){const t=dm.t;g.lineStyle(2,16734794,.8);for(let q=0;q<3;q++){const a=-T*3+q*2.09;g.beginPath();g.arc(t.x,t.y-8,16,a,a+1.2);g.strokePath()}}
 const co=S.__etCoord;if(co&&__etAlive(co.t)){const t=co.t,r=12+Math.sin(T*8)*2;g.lineStyle(2,16765514,.9).strokeCircle(t.x,t.y-8,r).lineBetween(t.x-r-5,t.y-8,t.x-r+4,t.y-8).lineBetween(t.x+r-4,t.y-8,t.x+r+5,t.y-8).lineBetween(t.x,t.y-8-r-5,t.x,t.y-8-r+4).lineBetween(t.x,t.y-8+r-4,t.x,t.y-8+r+5)}
 if(now<(S.__etHowlU??0)){const w=__etWolf(S);w&&g.lineStyle(2,12640767,.6).strokeCircle(w.x,w.y-6,14+Math.sin(T*6)*2)}}
/* acesso para testes automatizados */
window.__dgET={R,buy:__etBuy,choose:__etChoose,st:__etSt,ui:__etUI,ET:__ET,free:__etFree,why:__etWhyNot,equip:__etEquip};
