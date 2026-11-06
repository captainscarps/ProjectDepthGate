/* ── Floresta de Eldervale viva (os mesmos refinamentos de cenário do prólogo do rio) ─────────────────────
   • campos de flores em manchas de uma cor, capim alto: a onda do vento corre pelo campo, as flores se abrem
     quando o herói passa e soltam pétalas; nas rajadas, pétalas voam sozinhas
   • animais vivendo em cada clareira (coelhos, pardais, corvos, patos e peixes no lago, sapos, uma família de
     cervos): fogem do herói E das lutas, se escondem na mata e voltam em outro canto quando tudo fica quieto
   • lago vivo: peixes saltando, bolhas, marolas
   • folhas caindo com o vento, raios de sol entre as copas, vaga-lumes e névoa baixa nos cantos escuros
   Mapa: o chão é o mapa assado (frb-*); "árvore/mata" = parede, água = parede azulada (lida pela cor do mapa). */
const __FL_SP={rabbit:{kind:"ground",walk:26,flee:125,fleeR:105,sc:.95,idle:"Idle",move:"Walk"},
 sparrow:{kind:"bird",walk:14,flee:150,fleeR:95,sc:.9,idle:"Idle",move:"Idle",fly:"Fly",flock:1},
 crow:{kind:"bird",walk:12,flee:140,fleeR:125,sc:1,idle:"Idle",move:"Idle",fly:"Fly",flock:1},
 duck:{kind:"duck",walk:9,flee:120,fleeR:100,sc:1,idle:"Idle",move:"Idle",fly:"Fly"},
 fish:{kind:"fish",walk:14,flee:80,fleeR:55,sc:.9,idle:"Swim",move:"Swim"},
 frog:{kind:"frog",walk:10,flee:55,fleeR:65,sc:.95,idle:"Idle",move:"Walk"},
 deer:{kind:"ground",walk:13,flee:150,fleeR:150,sc:1,idle:"Idle",move:"Walk",run:"Run",herd:1,grp:"deer",tex:"rp-deer",oy:.667,shw:18},
 doe:{kind:"ground",walk:13,flee:150,fleeR:150,sc:.96,idle:"Idle",move:"Walk",run:"Run",herd:1,grp:"deer",tex:"rp-deer",oy:.667,shw:17},
 fawn:{kind:"ground",walk:15,flee:160,fleeR:150,sc:1,idle:"Idle",move:"Walk",run:"Run",herd:1,grp:"deer",tex:"rp-deer",oy:.667,shw:13}};
/* quem vive em cada sala e que flores tem (cores: 0 laranja, 1 azul, 2 branca, 3 rosa, 4 amarela, 5 lilás brilhante) */
const __FL_ROOMS={despertar:{a:[["rabbit",2],["sparrow",3],["duck",2],["fish",3],["frog",2]],f:[2,4,3,1],d:1},
 clareira:{a:[["deer",1],["doe",2],["fawn",1],["sparrow",3]],f:[0,0,1,1,2,4],d:1.3},
 bosque:{a:[["crow",2]],f:[5,2,1],d:.5,glow:1,mist:1},"caverna-raizes":{a:[],f:[5,5],d:.35,glow:1},"gruta-secreta":{a:[["frog",1]],f:[5,2],d:.5,glow:1},
 ossadas:{a:[["crow",3]],f:[],d:0,mist:1},acampamento:{a:[["crow",2],["rabbit",1]],f:[4,0,2],d:.5},
 alamedas:{a:[["rabbit",2],["sparrow",3]],f:[1,2,3,4],d:.9},"caverna-cristal":{a:[],f:[5,5,1],d:.45,glow:1},
 coracao:{a:[["rabbit",2],["sparrow",4]],f:[0,1,2,3,4],d:.9},jardim:{a:[["rabbit",3],["sparrow",3],["frog",1]],f:[3,3,2,5,4,0],d:1.6,glow:1}};
/* a fase da floresta também carrega as folhas dos animais */
{const P0=Sd.prototype.preload;Sd.prototype.preload=function(){const r=P0.apply(this,arguments);try{const D=this.scene.settings.data||{},lv=D.levelId??D.restore?.campaign?.levelId;
 if(lv==="forest"&&!D.endless){const L=this.load;this.textures.exists("rp-animals")||L.spritesheet("rp-animals","assets/pixel-art/river-prologue/rp-animals.png",{frameWidth:48,frameHeight:48});
  this.cache.json.exists("rp-animals-meta")||L.json("rp-animals-meta","assets/pixel-art/river-prologue/rp-animals.json");
  this.textures.exists("rp-deer")||L.spritesheet("rp-deer","assets/pixel-art/river-prologue/rp-deer.png",{frameWidth:48,frameHeight:48});
  this.cache.json.exists("rp-deer-meta")||L.json("rp-deer-meta","assets/pixel-art/river-prologue/rp-deer.json")}}catch(e){}return r}}
{const C0=Sd.prototype.create;Sd.prototype.create=function(){const r=C0.apply(this,arguments);try{if(this.levelId==="forest"&&!this.level?.endless&&!this.isRift)__flInit(this)}catch(e){console.warn("forest-life",e)}return r}}
function __flInit(S){const B=S.dungeon,R=Math.random,W=B.cols*dt,H=B.rows*dt;if(!B||S.__fl)return;const F=S.__fl={flowers:[],animals:[],petals:0,leaves:[],water:new Set,t0:S.time.now,grid:new Map,vis:[],vkey:""};const n0=S.children.list.length;
 /* texturas (as mesmas do prólogo) */
 const px=(key,w,h,pts)=>{if(S.textures.exists(key))return;const g=S.make.graphics({add:!1});for(const[x,y,c,a]of pts)g.fillStyle(c,a??1).fillRect(x,y,1,1);g.generateTexture(key,w,h);g.destroy()};
 const FL=[[0xf08a3c,0xffd36a,0xc8652a],[0x5f86e8,0xe2ecff,0x3f5fb8],[0xf6f3ff,0xffdf7a,0xc9c4e0],[0xee8fbd,0xfff0f6,0xc06690],[0xffd34a,0xb8602a,0xd8a030],[0xd9d2ff,0xffffff,0xa89ee8]],G1=0x3f7a3a,G2=0x5a9a48;
 FL.forEach(([p,c,d],i)=>px("rpf-"+i,5,7,[[1,0,p],[3,0,p],[0,1,d],[1,1,p],[2,1,c],[3,1,p],[4,1,d],[1,2,d],[3,2,d],[2,3,G1],[2,4,G1],[1,4,G2],[2,5,G1],[3,5,G2],[2,6,G1]]));
 px("rpg-0",5,6,[[0,2,G2],[0,3,G1],[1,4,G1],[2,0,G2],[2,1,G2],[2,2,G1],[2,3,G1],[2,4,G1],[2,5,G1],[4,1,G2],[3,3,G1],[4,2,G2],[1,5,G1],[3,5,G1]]);
 if(!S.textures.exists("fl-glow")){const ct=S.textures.createCanvas("fl-glow",256,256),x=ct.getContext(),g=x.createRadialGradient(128,128,0,128,128,128);g.addColorStop(0,"rgba(255,255,255,1)");g.addColorStop(.35,"rgba(255,255,255,.45)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fillRect(0,0,256,256);ct.refresh()}
 /* texturas pequenas: tudo vira imagem (mesmo lote de desenho que as flores, sem trocar de "pincel" a cada objeto) */
 if(!S.textures.exists("fl-px")){const g=S.make.graphics({add:!1});g.fillStyle(0xffffff,1).fillRect(0,0,2,2);g.generateTexture("fl-px",2,2);g.clear();g.fillStyle(0xffffff,1).fillCircle(4,4,4);g.generateTexture("fl-dot",8,8);g.clear();g.fillStyle(0,1).fillEllipse(16,4,32,8);g.generateTexture("fl-sh",32,8);g.destroy()}
 /* cor do chão no mapa assado: terra (trilha) e água */
 /* leitura rápida: cada pedaço do mapa vira uma miniatura 128x128 lida uma vez só (antes era um getPixel por ponto) */
 const PXC={},pix=(x,y)=>{const i=Math.floor(x/512),k=Math.floor(y/512),key=`frb-${i}-${k}`;let d=PXC[key];if(d===undefined){d=null;try{if(S.textures.exists(key)){const src=S.textures.get(key).getSourceImage(),c=document.createElement("canvas");c.width=c.height=128;const g=c.getContext("2d",{willReadFrequently:!0});g.imageSmoothingEnabled=!1;g.drawImage(src,0,0,512,512,0,0,128,128);d=g.getImageData(0,0,128,128).data}}catch(e){}PXC[key]=d}
  if(!d)return null;const u=Math.min(127,Math.max(0,Math.floor((x-i*512)/4))),v=Math.min(127,Math.max(0,Math.floor((y-k*512)/4))),o=(v*128+u)*4;return{red:d[o],green:d[o+1],blue:d[o+2],alpha:d[o+3]}};
 const soil=(x,y)=>{const c=pix(x,y);return!!c&&c.red>c.green+4};
 for(let r=0;r<B.rows;r++)for(let c=0;c<B.cols;c++)if(B.isWallTile(c,r)){const p=pix(c*dt+16,r*dt+16);p&&p.blue>p.red+14&&p.blue>=p.green-6&&F.water.add(c+","+r)}
 /* só o lago de verdade: a mancha azul ligada aos ladrilhos do lago do mapa (copas azuladas não contam) */
 {const seed=(S.cache.json.get("frb-meta")?.skipWater||[]).filter(k=>F.water.has(k)),keep=new Set(seed),q=[...seed];while(q.length){const[c,r]=q.pop().split(",").map(Number);for(const[dc,dr]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=(c+dc)+","+(r+dr);if(keep.has(k))continue;const cc=c+dc,rr=r+dr;if(!B.isWallTile(cc,rr))continue;const p=pix(cc*dt+16,rr*dt+16);p&&p.blue>p.red+6&&(keep.add(k),q.push(k))}}seed.length&&(F.water=keep)}
 const cell=(x,y)=>{const c=Math.floor(x/dt),r=Math.floor(y/dt);if(c<0||r<0||c>=B.cols||r>=B.rows)return 0;if(F.water.has(c+","+r))return 2;return B.isWallTile(c,r)?0:1};F.cell=cell;
 const okArea=(x,y,v,rad)=>cell(x,y)===v&&cell(x+rad,y)===v&&cell(x-rad,y)===v&&cell(x,y+rad)===v&&cell(x,y-rad)===v;F.okArea=okArea;
 /* lugares ocupados por objetos (baús, pedras, estátuas, altares…) */
 const busy=[];for(const o of B.objects||[])o&&o.x!=null&&busy.push({x:o.x,y:o.y,r:22});for(const o of B.solids?.getChildren?.()||[])busy.push({x:o.x,y:o.y,r:Math.max(14,(o.displayWidth||24)*.55)});F.busy=busy;
 const free=(x,y,pad)=>!busy.some(q=>Math.hypot(x-q.x,y-q.y)<q.r+pad);
 /* flores e capim por sala */
 const rooms=B.level.rooms||[];
 for(const rm of rooms){const cfg=__FL_ROOMS[rm.id];if(!cfg)continue;const q=rm.rect,x0=q.x*dt,y0=q.y*dt,w=q.w*dt,h=q.h*dt,area=q.w*q.h;
  const clusters=Math.round(area/26*cfg.d);
  for(let c=0;c<clusters&&cfg.f.length;c++){let o=null;for(let t=0;t<30&&!o;t++){const x=x0+R()*w,y=y0+R()*h;okArea(x,y,1,10)&&!soil(x,y)&&free(x,y,14)&&(o={x,y})}if(!o)continue;
   const col=cfg.f[Math.floor(R()*cfg.f.length)],cr=14+R()*22,n=Math.round((12+R()*16)*Math.min(1.4,cfg.d+.3));
   for(let k=0;k<n;k++){const a=R()*6.283,rr=Math.pow(R(),.7)*cr,x=o.x+Math.cos(a)*rr,y=o.y+Math.sin(a)*rr*.7;if(cell(x,y)!==1||soil(x,y)||!free(x,y,4))continue;
    const ci=R()<.86?col:cfg.f[Math.floor(R()*cfg.f.length)],im=S.add.image(Math.round(x),Math.round(y),"rpf-"+ci).setOrigin(.5,1).setDepth(y-2);R()<.5&&im.setFlipX(!0);R()<.25&&im.setScale(.8);im.ph=x*.035;im.ci=ci;im.bend=0;F.flowers.push(im);
    if(cfg.glow&&ci===5&&R()<.3){const gl=S.add.image(x,y-4,"fl-glow").setScale(.025+R()*.025).setBlendMode(j.BlendModes.ADD).setTint(0xc8c0ff).setAlpha(0).setDepth(8950);S.tweens.add({targets:gl,alpha:{from:.04,to:.28},duration:1400+R()*1800,yoyo:!0,repeat:-1,delay:R()*2e3})}}}
  /* capim alto */
  for(let k=0;k<Math.round(area/11);k++){const x=x0+R()*w,y=y0+R()*h;if(!okArea(x,y,1,4)||soil(x,y)||!free(x,y,4))continue;const im=S.add.image(Math.round(x),Math.round(y),"rpg-0").setOrigin(.5,1).setDepth(y-2).setAlpha(.9);R()<.5&&im.setFlipX(!0);im.ph=x*.035;im.bend=0;im.grass=1;F.flowers.push(im)}
  /* luzes espirituais e névoa baixa nas salas escuras */
  if(cfg.glow)for(let k=0;k<Math.round(area/30);k++){const x=x0+R()*w,y=y0+R()*h;if(cell(x,y)!==1)continue;const o=S.add.image(x,y,"fl-glow").setScale(.03+R()*.03).setBlendMode(j.BlendModes.ADD).setTint(R()<.6?0xb8ffcf:0xd8d0ff).setAlpha(0).setDepth(9e3),c2=S.add.image(x,y,"fl-glow").setScale(.012).setBlendMode(j.BlendModes.ADD).setTint(0xffffff).setAlpha(0).setDepth(9001);
   const du=2600+R()*2600;S.tweens.add({targets:[o,c2],x:"+="+(10+R()*22),duration:du,yoyo:!0,repeat:-1,ease:"Sine.easeInOut",delay:R()*2e3});S.tweens.add({targets:[o,c2],y:"-="+(6+R()*14),duration:du*.73,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"});
   S.tweens.add({targets:o,alpha:{from:.1,to:.42},duration:1400+R()*1600,yoyo:!0,repeat:-1,delay:R()*1500});S.tweens.add({targets:c2,alpha:{from:.3,to:.9},duration:1400+R()*1600,yoyo:!0,repeat:-1,delay:R()*1500})}
  if(cfg.mist)for(let k=0;k<4;k++){const m=S.add.image(x0+R()*w,y0+R()*h,"fl-glow").setDisplaySize(w*(.5+R()*.4),h*(.3+R()*.2)).setTint(0xdfe8e2).setAlpha(0).setDepth(8800);S.tweens.add({targets:m,alpha:{from:.05,to:.16},x:"+="+(20+R()*40),duration:7e3+R()*4e3,yoyo:!0,repeat:-1,delay:R()*3e3})}}
 /* raios de sol entre as copas e folhas ao vento */
 for(let k=0;k<Math.round(W*H/520000);k++){const x=R()*W,y=R()*H,ray=S.add.image(x,y,"fl-glow").setScale(.55,3).setRotation(.55).setBlendMode(j.BlendModes.ADD).setTint(0xfff3c8).setAlpha(0).setDepth(8900);S.tweens.add({targets:ray,alpha:{from:0,to:.06},duration:4e3+R()*3e3,yoyo:!0,repeat:-1,delay:R()*5e3})}
 {const GS=256;for(const o of S.children.list.slice(n0)){const k=Math.floor(o.x/GS)+","+Math.floor(o.y/GS);let L=F.grid.get(k);L||F.grid.set(k,L=[]);L.push(o);o.setVisible(!1)}F.GS=GS}
 for(let k=0;k<24;k++){const f=S.add.image(R()*W,R()*H,"fl-px").setDisplaySize(3,2).setTint([0x9cc46a,0xc9b25a,0x6f9a4a][k%3]).setAlpha(.85).setDepth(9050);f.vx=10+R()*14;f.vy=14+R()*16;f.ph=R()*6;F.leaves.push(f)}
 __flAnimals(S);F.fjT=3;F.bbT=1.5;const up=(t,ms)=>{try{__flUpdate(S,t,Math.min(.05,ms/1e3))}catch(e){}};F.up=up;S.events.on("update",up);S.events.once("shutdown",()=>{S.events.off("update",up);S.__fl=null})}
/* ── animais ── */
function __flAnimals(S){const F=S.__fl,B=S.dungeon,R=Math.random,AM=Object.assign({},S.cache.json.get("rp-animals-meta")||{},S.textures.exists("rp-deer")&&S.cache.json.get("rp-deer-meta")||{});if(!AM.sheep||!S.textures.exists("rp-animals"))return;F.AM=AM;
 const rate={Idle:4,Walk:8,Fly:12,Swim:6,Run:11};for(const[sp,P]of Object.entries(AM))for(const[pose,fr]of Object.entries(P)){const k=`rpa-${sp}-${pose}`,tx=__FL_SP[sp]?.tex||"rp-animals";S.anims.exists(k)||!S.textures.exists(tx)||S.anims.create({key:k,frames:fr.map(f=>({key:tx,frame:f})),frameRate:(rate[pose.split("_")[1]]??6)*(.85+R()*.3),repeat:-1})}
 /* tamanho dos bichos proporcional ao herói (no prólogo o herói mede ~58 px de altura na tela do mundo) */
 F.k=Math.max(.7,Math.min(1.6,(S.player?.displayHeight||58)/58));
 for(const rm of B.level.rooms||[]){const cfg=__FL_ROOMS[rm.id];if(!cfg)continue;const groups={};
  for(const[sp,n]of cfg.a){const C=__FL_SP[sp];if(!C||!AM[sp])continue;for(let i=0;i<n;i++){const gk=(C.grp||sp);let p;
   if(C.herd||C.flock){groups[gk]=groups[gk]||__flPt(S,rm,C.kind,null,null,0,C.grp?30:10);p=groups[gk]&&(__flPt(S,rm,C.kind,{x:groups[gk].x,y:groups[gk].y,r:C.herd?55:40},null,0,C.grp?24:10)||groups[gk])}else p=__flPt(S,rm,C.kind);if(!p)continue;
   const fish=C.kind==="fish",spr=S.add.sprite(p.x,p.y,C.tex||"rp-animals",0).setOrigin(.5,C.oy||.62).setScale(C.sc*F.k).setDepth(fish?p.y-20:p.y);fish&&spr.setAlpha(.5).setTint(0x9ad0e8);
   const sh=fish||C.kind==="frog"?null:S.add.image(p.x,p.y+2,"fl-sh").setDisplaySize((C.shw||(C.kind==="duck"?12:9))*F.k,3*F.k).setAlpha(C.kind==="duck"?.12:.22).setDepth(p.y-1);
   const a={sp,C,s:spr,sh,x:p.x,y:p.y,st:"idle",t:R()*4,room:rm,alt:0,vx:0,vy:1,base:fish?.5:1};F.animals.push(a);__flPose(S,a,0,1)}}}}
function __flPt(S,rm,kind,near,avoid,minD=0,pad=10){const F=S.__fl,q=rm.rect,R=Math.random,wat=kind==="duck"||kind==="fish";
 for(let k=0;k<60;k++){let x,y;if(near){const a=R()*6.283,r=R()*(near.r||45);x=near.x+Math.cos(a)*r;y=near.y+Math.sin(a)*r}else{x=(q.x+.5+R()*(q.w-1))*dt;y=(q.y+.5+R()*(q.h-1))*dt}
  if(x<q.x*dt||y<q.y*dt||x>(q.x+q.w)*dt||y>(q.y+q.h)*dt)continue;if(wat?!F.okArea(x,y,2,kind==="duck"?10:6):!F.okArea(x,y,1,6))continue;
  if(avoid&&Math.hypot(x-avoid.x,y-avoid.y)<minD)continue;if(!wat&&F.busy.some(o=>Math.hypot(x-o.x,y-o.y)<o.r+pad))continue;return{x,y}}return null}
function __flPose(S,a,vx,vy,pose){const F=S.__fl,C=a.C;pose=pose||(Math.hypot(vx,vy)>2?C.move:C.idle);const P=F.AM?.[a.sp]||{};let d="S";
 if(Math.abs(vx)>Math.abs(vy)*.8){d="S";a.s.setFlipX(vx>0)}else if(vy>0)d="D";else d="U";let k=`${d}_${pose}`;if(!P[k])k=P[`S_${pose}`]?`S_${pose}`:Object.keys(P).find(q=>q.endsWith(pose))||Object.keys(P)[0];
 const key=`rpa-${a.sp}-${k}`;a.s.anims.currentAnim?.key!==key&&S.anims.exists(key)&&a.s.play(key,!0)}
function __flRing(S,x,y,r){const e=S.add.ellipse(x,y,r,r*.45,0,0).setStrokeStyle(1,0xe6fff4,.8).setDepth(y-30);S.tweens.add({targets:e,scaleX:2.4,scaleY:2.4,alpha:0,duration:800,onComplete:()=>e.destroy()})}
function __flDrops(S,x,y,n){for(let k=0;k<n;k++){const c=S.add.image(x,y-2,"fl-dot").setDisplaySize(2.2,2.2).setTint(0xe8fff8).setAlpha(.9).setDepth(y+2);S.tweens.add({targets:c,x:x+(Math.random()-.5)*12,y:y-5-Math.random()*7,alpha:0,duration:380,ease:"Quad.easeOut",onComplete:()=>c.destroy()})}}
/* ameaças: o herói e qualquer inimigo vivo por perto (os bichos fogem das lutas também) */
function __flThreat(S,a){const p=S.player;let best=null,bd=1e9;if(p&&!p.dead){const d=Math.hypot(a.x-p.x,a.y-p.y);d<bd&&(bd=d,best={x:p.x,y:p.y,hero:1})}
 for(const e of S.__fl?.foes||[]){const d=Math.hypot(a.x-e.x,a.y-e.y);d<bd&&(bd=d,best={x:e.x,y:e.y})}return best&&{...best,d:bd}}
function __flFlee(S,a,h,chain=!0){const F=S.__fl,C=a.C,R=Math.random;if(a.st==="flee"||a.st==="fly"||a.st==="gone"||a.st==="hide")return;let dx=a.x-h.x,dy=a.y-h.y,m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;a.t=0;
 if(C.kind==="bird"||C.kind==="duck"){a.st="fly";const ang=Math.atan2(dy,dx)+(R()-.5)*.9;a.vx=Math.cos(ang)*C.flee;a.vy=Math.sin(ang)*C.flee-40;a.s.setDepth(9e3);C.kind==="duck"&&__flRing(S,a.x,a.y,14)}
 else if(C.kind==="fish"){a.st="flee";a.vx=dx*C.flee;a.vy=dy*C.flee;S.tweens.add({targets:a.s,alpha:0,duration:650})}
 else if(C.kind==="frog"){a.st="flee";let best=null,bd=-1e9;for(let k=0;k<24;k++){const an=k/24*6.283,x=a.x+Math.cos(an)*70,y=a.y+Math.sin(an)*70;if(F.cell(x,y)===2){const d=Math.hypot(x-h.x,y-h.y);d>bd&&(bd=d,best={x,y})}}const g=best||{x:a.x+dx*60,y:a.y+dy*60},gm=Math.hypot(g.x-a.x,g.y-a.y)||1;a.vx=(g.x-a.x)/gm*C.flee;a.vy=(g.y-a.y)/gm*C.flee}
 else{a.st="flee";let best=null,bs=-1e9;for(let k=0;k<20;k++){const an=Math.atan2(dy,dx)+(k/19-.5)*2.2;for(let r=30;r<=260;r+=20){const x=a.x+Math.cos(an)*r,y=a.y+Math.sin(an)*r;if(F.cell(x,y)===0){const sc=-r+Math.hypot(x-h.x,y-h.y)*.6;sc>bs&&(bs=sc,best={x,y});break}}}
  const g=best||{x:a.x+dx*200,y:a.y+dy*200},gm=Math.hypot(g.x-a.x,g.y-a.y)||1;a.vx=(g.x-a.x)/gm*C.flee;a.vy=(g.y-a.y)/gm*C.flee}
 if(chain)for(const b of F.animals)b!==a&&(b.C.grp||b.sp)===(C.grp||a.sp)&&Math.hypot(b.x-a.x,b.y-a.y)<(C.grp?150:95)&&S.time.delayedCall(80+R()*260,()=>__flFlee(S,b,h,!1))}
function __flGone(a){a.st="gone";a.off=0;a.t=0;a.ret=9+Math.random()*9;a.s.setVisible(!1);a.sh&&a.sh.setVisible(!1)}
function __flReturn(S,a){const F=S.__fl,C=a.C,R=Math.random,rm=a.room;if(rm.state==="active")return;const h=__flThreat(S,a);
 const fk=(C.flock||C.herd)&&F.animals.find(b=>b!==a&&(b.C.grp||b.sp)===(C.grp||a.sp)&&b.room===rm&&b.st!=="gone"&&b.st!=="fly"&&b.st!=="flee"&&b.s.visible);
 const p=fk?__flPt(S,rm,C.kind,{x:fk.x,y:fk.y,r:45},h,220,C.grp?24:10):__flPt(S,rm,C.kind,null,h,240,C.grp?30:10);if(!p)return;
 a.s.setVisible(!0).setAlpha(0);a.sh&&a.sh.setVisible(!0);a.t=0;
 if(C.kind==="bird"||C.kind==="duck"){const an=R()*6.283;a.x=p.x+Math.cos(an)*140;a.y=p.y+Math.sin(an)*90;a.alt=70;a.tx=p.x;a.ty=p.y;a.st="land";a.s.setDepth(9e3);S.tweens.add({targets:a.s,alpha:a.base,duration:500})}
 else if(C.kind==="fish"||C.kind==="frog"){a.x=p.x;a.y=p.y;a.st="idle";a.t=1+R()*2;S.tweens.add({targets:a.s,alpha:a.base,duration:900})}
 else{let e=null,best=1e9;for(let k=0;k<16;k++){const an=k/16*6.283;let last=null;for(let r=8;r<=200;r+=6){const x=p.x+Math.cos(an)*r,y=p.y+Math.sin(an)*r;if(F.cell(x,y)!==1)break;last={x,y,r}}if(last&&last.r>24&&last.r<best&&F.cell(p.x+Math.cos(an)*(last.r+8),p.y+Math.sin(an)*(last.r+8))===0){best=last.r;e={x:p.x+Math.cos(an)*(last.r-6),y:p.y+Math.sin(an)*(last.r-6)}}}e=e||p;
  a.x=e.x;a.y=e.y;a.tx=p.x;a.ty=p.y;a.st="walk";a.spd=C.walk*1.6;S.tweens.add({targets:a.s,alpha:1,duration:900});a.sh&&(a.sh.setAlpha(0),S.tweens.add({targets:a.sh,alpha:.22,duration:900}))}}
function __flUpdate(S,t,dt_){const F=S.__fl;if(!F||S.uiOpen&&S.time.paused)return;const cam=S.cameras.main,v=cam.worldView,R=Math.random,tw=t/1e3,p=S.player;
 /* vento: rajadas suaves */
 const G=.45+.3*Math.sin(tw*.23)+.18*Math.sin(tw*.71+1.3);
 for(const f of F.leaves){f.ph+=dt_*2;f.x+=(f.vx*(.4+G*1.8)+Math.sin(f.ph)*10)*dt_;f.y+=f.vy*(.7+G*.6)*dt_;f.rotation+=dt_*(2+G*3);if(f.y>v.bottom+10){f.y=v.top-10;f.x=v.x+R()*v.width}if(f.x>v.right+10){f.x=v.x-5;f.y=v.y+R()*v.height}}
 /* flores: onda do vento + herói abre caminho e solta pétalas */
 {const GS=F.GS,x0=Math.floor((v.x-40)/GS),x1=Math.floor((v.right+40)/GS),y0=Math.floor((v.y-40)/GS),y1=Math.floor((v.bottom+60)/GS),key=x0+","+x1+","+y0+","+y1;
  if(key!==F.vkey){const on=new Set;for(let gx=x0;gx<=x1;gx++)for(let gy=y0;gy<=y1;gy++){const L=F.grid.get(gx+","+gy);L&&on.add(L)}for(const L of F.vcells||[])on.has(L)||L.forEach(o=>o.setVisible(!1));for(const L of on)L.forEach(o=>o.setVisible(!0));F.vcells=on;F.vkey=key;F.vis=[];for(const L of on)for(const o of L)o.ph!=null&&F.vis.push(o)}}
 let nearF=null;const hx=p?.x??-999,hy=p?.y??-999;for(const f of F.vis){if(f.x<v.x-10||f.x>v.right+10||f.y<v.y-4||f.y>v.bottom+12)continue;const wv=Math.sin(tw*2.1-f.ph+Math.sin(f.y*.02))*(.07+G*.24)+Math.sin(tw*5.3+f.ph*3)*.025;
  let tb=0;const dx=f.x-hx,dy=(f.y-hy)*1.6,d=Math.hypot(dx,dy);if(d<16){tb=(dx>=0?1:-1)*.75*(1-d/16);!f.grass&&d<10&&(nearF=f)}f.bend+=(tb-f.bend)*Math.min(1,dt_*10);f.rotation=wv+f.bend}
 const hm=Math.hypot(hx-(F.lx??hx),hy-(F.ly??hy))>.4;F.lx=hx;F.ly=hy;F.ptT=(F.ptT||0)-dt_;
 const petal=(x,y,ci)=>{const cols=[0xf08a3c,0x6f90ea,0xf6f3ff,0xee8fbd,0xffd34a,0xe2dcff],q=S.add.image(x,y,"fl-px").setDisplaySize(2,1).setTint(cols[ci]??0xf6f3ff).setAlpha(.95).setDepth(9050).setRotation(R()*3);F.petals++;S.tweens.add({targets:q,x:x+18+G*60+R()*24,y:y-10-R()*18,rotation:q.rotation+(R()-.5)*9,alpha:0,duration:1300+R()*900,ease:"Sine.easeOut",onComplete:()=>{q.destroy();F.petals--}})};
 nearF&&hm&&F.ptT<=0&&F.petals<60&&(F.ptT=.07,petal(nearF.x+(R()-.5)*6,nearF.y-4,nearF.ci));
 if(G>.6&&F.petals<40&&R()<dt_*G*6){const f=F.vis[Math.floor(R()*F.vis.length)];f&&!f.grass&&v.contains(f.x,f.y)&&petal(f.x,f.y-4,f.ci)}
 /* lago: peixes saltando e bolhas */
 const wpt=(r)=>{for(let k=0;k<20;k++){const x=v.x+20+R()*(v.width-40),y=v.y+20+R()*(v.height-40);if(F.okArea(x,y,2,r))return{x,y}}return null};
 F.fjT-=dt_;if(F.fjT<=0){F.fjT=3+R()*4.5;const q=wpt(10),fr=F.AM?.fish?.S_Swim;if(q&&fr){const dir=R()<.5?-1:1,len=(22+R()*16)*F.k,hgt=(16+R()*12)*F.k,f=S.add.sprite(q.x,q.y,"rp-animals",fr[0]).setDepth(q.y+30).setScale(1.05*F.k).setFlipX(dir>0);__flRing(S,q.x,q.y,9);__flDrops(S,q.x,q.y,5);
  S.tweens.addCounter({from:0,to:1,duration:620+R()*200,onUpdate:tw2=>{const u=tw2.getValue();f.setPosition(q.x+dir*len*u,q.y-Math.sin(u*Math.PI)*hgt).setRotation(dir*(-1.1+2.2*u)*.6);f.setFrame(fr[Math.floor(u*8)%fr.length])},onComplete:()=>{const ex=q.x+dir*len;__flRing(S,ex,q.y,11);__flDrops(S,ex,q.y,6);f.destroy()}})}}
 F.bbT-=dt_;if(F.bbT<=0){F.bbT=1+R()*2;const q=wpt(7);if(q){const n=3+Math.floor(R()*3);for(let k=0;k<n;k++){const b=S.add.circle(q.x+(R()-.5)*10,q.y+(R()-.5)*6,.9+R()*1.3,0,0).setStrokeStyle(.8,0xeafffa,.85).setDepth(q.y-30).setScale(.4);S.tweens.add({targets:b,scale:1.3,alpha:0,duration:700+R()*600,delay:k*170,onComplete:()=>b.destroy()})}}}
 /* animais */
 F.foes=(S.enemies?.getChildren?.()||[]).filter(e=>e.active&&!e.dead&&e.x>v.x-260&&e.x<v.right+260&&e.y>v.y-260&&e.y<v.bottom+260);
 const mx=v.x-160,Mx=v.right+160,my=v.y-160,My=v.bottom+160;
 for(const a of F.animals){const C=a.C;
  /* fora da tela: o bicho "dorme" (não pensa nem é desenhado); só o tempo de voltar continua contando */
  if(a.st!=="gone"&&(a.x<mx||a.x>Mx||a.y<my||a.y>My)){if(!a.off){a.off=1;a.s.setVisible(!1);a.sh&&a.sh.setVisible(!1)}continue}
  if(a.off&&a.st!=="gone"){a.off=0;a.s.setVisible(!0);a.sh&&a.sh.setVisible(!0)}
  const h=__flThreat(S,a);
  if((a.st==="idle"||a.st==="walk")&&h){const mv=h.hero?Math.hypot(p.body?.velocity?.x||0,p.body?.velocity?.y||0)>20:!0;if(h.d<C.fleeR*(mv?1:.55)*(h.hero?1:1.4))__flFlee(S,a,h)}
  switch(a.st){
  case"idle":a.t-=dt_;if(a.t<=0){const q=__flPt(S,a.room,C.kind,{x:a.x,y:a.y,r:C.kind==="bird"?30:80},null,0,C.grp?24:10);if(q){a.tx=q.x;a.ty=q.y;a.spd=C.walk*(.7+R()*.5);a.st="walk";a.t=6}else a.t=1}break;
  case"walk":{const dx=a.tx-a.x,dy=a.ty-a.y,m=Math.hypot(dx,dy);a.t-=dt_;if(m<2||a.t<=0){a.st="idle";a.t=(C.kind==="bird"?.6:1.5)+R()*(C.kind==="bird"?2:4.5);__flPose(S,a,a.vx*.01,a.vy*.01,C.idle);break}
   const sp=Math.min(a.spd,m/dt_);a.vx=dx/m*sp;a.vy=dy/m*sp;a.x+=a.vx*dt_;a.y+=a.vy*dt_;__flPose(S,a,a.vx,a.vy,C.move);break}
  case"flee":a.t+=dt_;a.x+=a.vx*dt_;a.y+=a.vy*dt_;__flPose(S,a,a.vx,a.vy,C.run||C.move);
   if(C.kind==="frog"&&F.cell(a.x,a.y)===2){__flRing(S,a.x,a.y,8);__flGone(a);break}if(C.kind==="fish"&&a.t>.7){__flGone(a);break}
   if(F.cell(a.x+a.vx*.2,a.y+a.vy*.2)===0||a.t>3){a.st="hide";S.tweens.add({targets:a.s,alpha:0,duration:220,onComplete:()=>__flGone(a)});a.sh&&S.tweens.add({targets:a.sh,alpha:0,duration:160})}break;
  case"fly":a.t+=dt_;a.alt=Math.min(90,a.alt+dt_*70);a.vy-=dt_*10;a.x+=a.vx*dt_;a.y+=a.vy*dt_*.6;__flPose(S,a,a.vx,a.vy,C.fly);if(a.t>2.6){a.st="hide";S.tweens.add({targets:a.s,alpha:0,duration:400,onComplete:()=>__flGone(a)})}break;
  case"land":{const dx=a.tx-a.x,dy=a.ty-a.y,m=Math.hypot(dx,dy),sp=Math.min(C.flee*.55,m/dt_);a.alt=Math.max(0,Math.min(a.alt,m*.5));if(m<3){a.x=a.tx;a.y=a.ty;a.alt=0;a.st="idle";a.t=2+R()*3;a.s.setDepth(a.y);C.kind==="duck"&&__flRing(S,a.x,a.y,14);__flPose(S,a,0,.01,C.idle);break}
   a.vx=dx/m*sp;a.vy=dy/m*sp;a.x+=a.vx*dt_;a.y+=a.vy*dt_;__flPose(S,a,a.vx,a.vy,C.fly);break}
  case"gone":a.t+=dt_;if(a.t>a.ret&&R()<dt_*2)__flReturn(S,a);continue;
  case"hide":break}
  if(a.st!=="gone"){a.s.x=a.x;a.s.y=a.y-a.alt;(a.st==="idle"||a.st==="walk")&&C.kind!=="fish"&&Math.abs(a.s.depth-a.y)>3&&a.s.setDepth(a.y);a.sh&&a.sh.setPosition(a.x,a.y+2).setAlpha(a.alt>2?.08:C.kind==="duck"?.12:.22)}
  if(C.kind==="duck"&&a.st==="idle"&&R()<dt_*.15)__flRing(S,a.x,a.y,10);if(C.kind==="fish"&&a.st==="idle"&&R()<dt_*.1&&v.contains(a.x,a.y))__flRing(S,a.x,a.y,5)}}
window.__flDebug=()=>{const S=window.__DED_GAME?.scene?.getScene?.("Game"),F=S?.__fl;return F&&{flowers:F.flowers.length,animals:F.animals.map(a=>[a.sp,a.room.id,a.st]),water:F.water.size,k:F.k}};
