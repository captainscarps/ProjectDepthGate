/* ── Enigmas nas outras fases da campanha ─────────────────────────────────────────────────────────
   Deserto Esquecido, Catacumbas, Ruínas Antigas, Fortaleza dos Dragões, Profundezas Amazônicas, Ilhas,
   Floresta Morta e Vulcão de Cinzas (a Cidadela Glacial tem os seus em glacial-puzzles.js).
   Cada fase recebe quatro enigmas, escolhidos entre os cinco tipos abaixo, e cada fase resolve de um jeito
   diferente (tabela __PZV):
     alavancas: 3 a 5, dica pela posição (contando do oeste ou do leste) ou pelos glifos acima delas
     braseiros: todos ao mesmo tempo (com tempo) · numa ordem dada por glifos · só os glifos marcados
     espelhos: feixe com 2 ou 3 curvas e de 1 a 3 espelhos-isca
     blocos de pedra: arranjo gerado por fase (pilares, 1 ou 2 blocos) e conferido por um resolvedor
     runas da memória: tamanho das rodadas por fase, algumas de trás para frente
   e um Relicário Selado. Cada enigma resolvido acende um selo no Relicário; com todos os selos a casca
   se quebra e libera um acessório lendário único da fase.
   As peças são posicionadas na hora em que a fase é montada, só em chão livre:
     - fora de paredes, portas, ponto de início e lugar de inimigos
     - sem nenhum objeto do cenário (árvore, pedra, estátua…) desenhado em cima ou na frente
     - sem fechar passagem (o mapa continua todo alcançável)
   Fora do modo infinito. Estado salvo por fase e slot (localStorage depthgate:pz:<fase>:<slot>).   */
const __PZL={
 temple:{stone:15255696,item:"sun_eye",shell:16767904,orb:16763955,title:["RELICÁRIO DO SOL","RELIQUARY OF THE SUN","RELICARIO DEL SOL"]},
 catacombs:{stone:12105900,item:"ancients_lantern",shell:12632319,orb:11829759,title:["RELICÁRIO DOS ANTIGOS","RELIQUARY OF THE ANCIENTS","RELICARIO DE LOS ANTIGUOS"]},
 ruins:{stone:12109984,item:"lock_sigil",shell:15259050,orb:16770229,title:["RELICÁRIO DAS FECHADURAS","RELIQUARY OF THE LOCKS","RELICARIO DE LAS CERRADURAS"]},
 fortress:{stone:10127492,item:"warden_scale",shell:16758400,orb:16733500,title:["RELICÁRIO DO CARCEREIRO","WARDEN'S RELIQUARY","RELICARIO DEL CARCELERO"]},
 bosque:{stone:11057304,item:"anhanga_seed",shell:11730864,orb:8317046,title:["RELICÁRIO DA MATA","RELIQUARY OF THE WILDS","RELICARIO DE LA SELVA"]},
 rio:{stone:11582664,item:"tide_pearl",shell:10476543,orb:7397375,title:["RELICÁRIO DA MARÉ","RELIQUARY OF THE TIDE","RELICARIO DE LA MAREA"]},
 morta:{stone:11841216,item:"dead_bell",shell:13612511,orb:12950783,title:["RELICÁRIO DOS MORTOS","RELIQUARY OF THE DEAD","RELICARIO DE LOS MUERTOS"]},
 vulcao:{stone:9075316,item:"ember_core",shell:16757120,orb:16737826,title:["RELICÁRIO DA BRASA","RELIQUARY OF EMBERS","RELICARIO DE LA BRASA"]}};
Object.assign(Xt,{
 sun_eye:{name:"Olho do Sol",type:"accessory",slot:"accessory",icon:"icon-pz-sun_eye",minRarity:"LEGENDARY",stats:{damage:2,critChance:3,maxHp:2},value:300,desc:"Guarda a luz do meio-dia que um dia iluminou o templo."},
 ancients_lantern:{name:"Lanterna dos Antigos",type:"accessory",slot:"accessory",icon:"icon-pz-ancients_lantern",minRarity:"LEGENDARY",stats:{magicDamage:2,maxMana:5,maxHp:2,defense:1},value:300,desc:"A chama nunca se apaga — nem mesmo entre os mortos."},
 lock_sigil:{name:"Sinete das Fechaduras",type:"accessory",slot:"accessory",icon:"icon-pz-lock_sigil",minRarity:"LEGENDARY",stats:{defense:3,maxHp:3,damage:1},value:300,desc:"Forjado por quem selou as fechaduras das Profundezas."},
 warden_scale:{name:"Escama do Carcereiro",type:"accessory",slot:"accessory",icon:"icon-pz-warden_scale",minRarity:"LEGENDARY",stats:{defense:3,maxHp:4,critChance:1},value:300,desc:"O dragão vigiava uma prisão. Esta escama lembra de quem."},
 anhanga_seed:{name:"Semente do Anhangá",type:"accessory",slot:"accessory",icon:"icon-pz-anhanga_seed",minRarity:"LEGENDARY",stats:{maxHp:4,magicDamage:1,critChance:2,defense:1},value:300,desc:"Pulsa devagar, como a mata respirando."},
 tide_pearl:{name:"Pérola da Maré",type:"accessory",slot:"accessory",icon:"icon-pz-tide_pearl",minRarity:"LEGENDARY",stats:{maxMana:6,magicDamage:2,critChance:2,maxHp:1},value:300,desc:"Encoste no ouvido: ainda se ouve o mar das Ilhas."},
 dead_bell:{name:"Sino dos Mortos",type:"accessory",slot:"accessory",icon:"icon-pz-dead_bell",minRarity:"LEGENDARY",stats:{damage:2,critChance:3,maxHp:2},value:300,desc:"Toca sozinho quando algo não deveria acordar."},
 ember_core:{name:"Núcleo de Brasa",type:"accessory",slot:"accessory",icon:"icon-pz-ember_core",minRarity:"LEGENDARY",stats:{damage:3,magicDamage:2},value:300,desc:"Quente demais para segurar. Quente demais para largar."}});
try{Object.assign(_s,{"item.sun_eye":"Eye of the Sun","item.ancients_lantern":"Lantern of the Ancients","item.lock_sigil":"Signet of the Locks","item.warden_scale":"Warden's Scale","item.anhanga_seed":"Anhangá Seed","item.tide_pearl":"Tide Pearl","item.dead_bell":"Bell of the Dead","item.ember_core":"Ember Core"});
Object.assign(Io,{"item.sun_eye":"Ojo del Sol","item.ancients_lantern":"Linterna de los Antiguos","item.lock_sigil":"Sello de las Cerraduras","item.warden_scale":"Escama del Carcelero","item.anhanga_seed":"Semilla del Anhangá","item.tide_pearl":"Perla de la Marea","item.dead_bell":"Campana de los Muertos","item.ember_core":"Núcleo de Brasa"})}catch(e){}

/* variações por fase: cada fase resolve de um jeito diferente */
const __PZV={
 temple:{levers:{n:4,hint:"pos"},braziers:{mode:"all",n:4},mirror:{turns:2,decoys:1},blocks:{blocks:2,pillars:1},runes:{len:[3,4,5]}},
 catacombs:{levers:{n:5,hint:"glyph"},braziers:{mode:"some",n:6,lit:3},mirror:{turns:3,decoys:2},blocks:{blocks:1,pillars:2},runes:{len:[4,5],rev:1}},
 ruins:{levers:{n:3,hint:"glyph"},braziers:{mode:"order",n:4},mirror:{turns:2,decoys:2},blocks:{blocks:2,pillars:2},runes:{len:[3,4,5,6]}},
 fortress:{levers:{n:4,hint:"glyph"},braziers:{mode:"all",n:5},mirror:{turns:3,decoys:1},blocks:{blocks:1,pillars:1},runes:{len:[3,4],rev:1}},
 bosque:{levers:{n:5,hint:"pos",fromEast:1},braziers:{mode:"order",n:5},mirror:{turns:2,decoys:3},blocks:{blocks:2,pillars:3},runes:{len:[4,5,6]}},
 rio:{levers:{n:3,hint:"pos",fromEast:1},braziers:{mode:"some",n:5,lit:2},mirror:{turns:3,decoys:3},blocks:{blocks:1,pillars:3},runes:{len:[3,5],rev:1}},
 morta:{levers:{n:4,hint:"pos",fromEast:1},braziers:{mode:"some",n:6,lit:4},mirror:{turns:2,decoys:1},blocks:{blocks:2,pillars:1},runes:{len:[5,6]}},
 vulcao:{levers:{n:5,hint:"glyph"},braziers:{mode:"order",n:6},mirror:{turns:3,decoys:2},blocks:{blocks:1,pillars:2},runes:{len:[4,5,6],rev:1}}};
function __pzAuto(B){const S=B?.scene,id=B?.level?.id;if(!S||!__PZL[id])return;S.time.delayedCall(90,()=>{if(!S.sys?.isActive?.()||S.level?.endless||S.game.registry.get("mode")==="endless")return;try{__pzBuild(S,B,__PZL[id],id)}catch(e){window.__pzErr=String(e&&e.stack||e)}})}

function __pzBuild(S,D,cfg,lid){__gsTex(S);__leverTex(S);
if(!S.textures.exists("pz-orb")){const t=S.textures.createCanvas("pz-orb",20,20),g=t.getContext(),q=g.createRadialGradient(8,7,1,10,10,9);q.addColorStop(0,"#ffffff");q.addColorStop(.45,"#e8e8e8");q.addColorStop(1,"rgba(150,150,150,.0)");g.fillStyle=q;g.beginPath();g.arc(10,10,9,0,7);g.fill();g.fillStyle="#ffffff";g.beginPath();g.arc(10,10,5,0,7);g.fill();t.refresh()}
if(!S.textures.exists("pz-stone")){const t=S.textures.createCanvas("pz-stone",32,40),g=t.getContext(),gr=(x0,y0,x1,y1,st)=>{const q=g.createLinearGradient(x0,y0,x1,y1);for(const[o,c]of st)q.addColorStop(o,c);return q};
g.fillStyle="rgba(0,0,0,.35)";g.beginPath();g.ellipse(16,37,15,3.2,0,0,7);g.fill();
g.fillStyle=gr(0,12,0,38,[[0,"#e2e2e2"],[1,"#8c8c8c"]]);g.beginPath();g.moveTo(2,14);g.lineTo(30,14);g.lineTo(30,36);g.lineTo(28,38);g.lineTo(4,38);g.lineTo(2,36);g.closePath();g.fill();
g.fillStyle=gr(0,3,0,15,[[0,"#ffffff"],[1,"#d0d0d0"]]);g.beginPath();g.moveTo(2,14);g.lineTo(6,5);g.lineTo(9,4);g.lineTo(27,4);g.lineTo(30,6);g.lineTo(30,14);g.closePath();g.fill();
g.strokeStyle="rgba(60,60,60,.55)";g.lineWidth=1;g.beginPath();g.moveTo(2,25.5);g.lineTo(30,25.5);g.moveTo(15.5,14);g.lineTo(15.5,25.5);g.moveTo(9.5,25.5);g.lineTo(9.5,38);g.moveTo(22.5,25.5);g.lineTo(22.5,38);g.stroke();
g.strokeStyle="rgba(255,255,255,.55)";g.beginPath();g.moveTo(3,15);g.lineTo(29,15);g.stroke();
g.strokeStyle="rgba(50,50,50,.6)";g.lineWidth=1.4;g.beginPath();g.arc(16,9,3.2,0,6.3);g.moveTo(16,5);g.lineTo(16,13);g.stroke();
g.strokeStyle="rgba(40,40,40,.45)";g.lineWidth=1;g.beginPath();g.moveTo(25,27);g.lineTo(27,31);g.lineTo(25,34);g.moveTo(5,17);g.lineTo(7,20);g.stroke();
g.fillStyle="rgba(30,30,30,.25)";g.fillRect(26,30,3,2);g.fillRect(4,31,2,3);g.fillStyle="rgba(0,0,0,.28)";g.fillRect(29,14,1,22);t.refresh()}
const T=dt,L3=__L3,R=Math.random,ADD=j.BlendModes.ADD,C=(c,r)=>[c*T+T/2,r*T+T/2],K=(c,r)=>c+","+r,LV=D.level;
let sd=[...lid].reduce((a,ch)=>(a*31+ch.charCodeAt(0))>>>0,7);const RS=()=>(sd=(Math.imul(sd,1664525)+1013904223)>>>0)/4294967296;
const slot=S.game.registry.get("save:slot")??1,KEY="depthgate:pz:"+lid+":"+slot;let done={};try{done=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){}const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(done))}catch(e){}};
const OBJ=[],SOL=new Set,sfx=k=>S.game.audioEngine?.sfx?.(k),banner=(t,c)=>S.game.events.emit("ui:banner",t,c||"#8ae0ff"),solids=D.solids;
const wall=(c,r)=>D.isWallTile(c,r),on=f=>{S.events.on("update",f);S.events.once("shutdown",()=>S.events.off("update",f))};
const lit=(x,y,col,rad,i)=>{try{return S.lighting?.addLight?.({x,y,radius:rad,intensity:i,color:col})||{i}}catch(e){return{}}};
/* ── mapa de células ocupadas ── */
const SOLC=new Set,VIS=new Set,BAN=new Set;
for(const o of solids?.getChildren?.()||[]){const b=o.body;if(!b)continue;for(let c=Math.floor(b.x/T);c<=Math.floor((b.x+b.width-1)/T);c++)for(let r=Math.floor(b.y/T);r<=Math.floor((b.y+b.height-1)/T);r++)SOLC.add(K(c,r))}
const foes=new Set(S.enemies?.getChildren?.()||[]);
for(const o of S.children.list){if(!o.visible||!o.texture||o===S.player||foes.has(o)||o.blendMode===ADD||o.depth<1.5)continue;const k=o.texture.key;if(k==="light"||k==="__DEFAULT"||k==="__MISSING")continue;const w=o.displayWidth,h=o.displayHeight;if(!w||!h||w>T*9||h>T*9)continue;
const x0=o.x-w*o.originX,y0=o.y-h*o.originY,x1=x0+w,y1=y0+h;for(let c=Math.floor(x0/T)-1;c<=Math.floor(x1/T)+1;c++)for(let r=Math.floor(y0/T)-1;r<=Math.floor((y1+20)/T)+1;r++){const cx0=c*T+3,cx1=c*T+T-3,cy0=r*T-18,cy1=r*T+T-4;if(x1>cx0&&x0<cx1&&y1>cy0&&y0<cy1)VIS.add(K(c,r))}}
for(const o of D.objects||[]){if(!o?.hazard)continue;const w=o.displayWidth||T,h=o.displayHeight||T;for(let c=Math.floor((o.x-w/2)/T)-1;c<=Math.floor((o.x+w/2)/T)+1;c++)for(let r=Math.floor((o.y-h/2)/T)-1;r<=Math.floor((o.y+h/2)/T)+1;r++)BAN.add(K(c,r))}
for(const k of D.__water||[])BAN.add(k);
const near=(c,r,d)=>{for(let dx=-d;dx<=d;dx++)for(let dy=-d;dy<=d;dy++)BAN.add(K(c+dx,r+dy))};
LV.playerSpawn&&near(LV.playerSpawn.col,LV.playerSpawn.row,2);
/* nada de enigma colado em objeto do cenário que se usa (baú, santuário, braseiro/totem de objetivo…): a tecla de interagir
   pegaria o objeto errado e um totem/braseiro de objetivo poderia ficar cercado */
for(const o of D.objects||[])if(o&&o.active!==!1&&(typeof o.interact==="function"||o.def?.cdPlaced||o.def?.type==="cd-obj"))near(Math.floor(o.x/T),Math.floor((o.y-4)/T),2);
for(const rm of LV.rooms)for(const dc of rm.decor||[])(dc.cdPlaced||dc.type==="cd-obj"||dc.type==="chest"||dc.type==="shrine"||dc.type==="event-altar")&&near(dc.col,dc.row,2);for(const d of LV.doors||[])near(d.col,d.row,2);
for(const rm of LV.rooms){for(const e of rm.enemies||[])near(e.col,e.row,1);rm.bossCol!=null&&near(rm.bossCol,rm.bossRow,3)}
const inR=(q,c,r)=>c>=q.x&&c<q.x+q.w&&r>=q.y&&r<q.y+q.h;
const free=(q,c,r)=>inR(q,c,r)&&!wall(c,r)&&!SOLC.has(K(c,r))&&!VIS.has(K(c,r))&&!BAN.has(K(c,r));
/* alcance: o mapa continua todo ligado depois de colocar as peças sólidas */
const reach=extra=>{const sp=LV.playerSpawn;if(!sp)return-1;const seen=new Set([K(sp.col,sp.row)]),q=[[sp.col,sp.row]];while(q.length){const[c,r]=q.pop();for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const n=c+dx,m=r+dy,k=K(n,m);if(seen.has(k)||wall(n,m)||SOLC.has(k)||extra.has(k))continue;seen.add(k);q.push([n,m])}}return seen.size};
const base0=reach(new Set);
const ROOMOK=r=>!r.boss&&!r.final&&!r.roomType&&!r.hub&&r.rect.w>=7&&r.rect.h>=6,cand=LV.rooms.filter(r=>ROOMOK(r)&&r.cdObj!=="MECHANISM"&&r.cdObj!=="RITUAL").map(r=>({r,n:0,k:RS()+(r.cdObj?1:0)})).sort((a,b)=>a.k-b.k),EXTRA=LV.rooms.filter(r=>ROOMOK(r)&&(r.cdObj==="MECHANISM"||r.cdObj==="RITUAL")).map(r=>({r,n:3,k:9+RS()}));
const BUSY=new Set;
const ok=(q,c,r)=>free(q,c,r)&&!BUSY.has(K(c,r)),N4=[[1,0],[-1,0],[0,1],[0,-1]],rooms=()=>cand.slice().sort((a,b)=>a.n+(a.r.cdObj?2:0)-(b.n+(b.r.cdObj?2:0))||a.k-b.k);
const shuf=a=>{for(let k=a.length-1;k>0;k--){const m=Math.floor(RS()*(k+1));[a[k],a[m]]=[a[m],a[k]]}return a};
const conn=sol=>{if(base0<=0)return!0;const ex=new Set(sol.map(([c,r])=>K(c,r)));return reach(ex)>=reach(new Set)-ex.size};
const commit=(R0,sol,cells)=>{for(const[c,r]of cells)for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)BUSY.add(K(c+dx,r+dy));for(const[c,r]of sol)SOLC.add(K(c,r));R0.n++};
const rect=(w,h)=>{const o=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)o.push([x,y]);return o};
/* máscara: todas as células precisam estar livres (perto do centro da sala primeiro) */
const fit=(cells,sol)=>{const w=Math.max(...cells.map(q=>q[0]))+1,h=Math.max(...cells.map(q=>q[1]))+1;for(const R0 of rooms()){const q=R0.r.rect,cx=q.x+q.w/2,cy=q.y+q.h/2,pos=[];
for(let y=q.y;y+h<=q.y+q.h;y++)for(let x=q.x;x+w<=q.x+q.w;x++)cells.every(([a,b])=>ok(q,x+a,y+b))&&pos.push([Math.hypot(x+w/2-cx,y+h/2-cy)+RS()*.8,x,y]);
pos.sort((a,b)=>a[0]-b[0]);for(const[,x,y]of pos.slice(0,16)){const S2=sol.map(([a,b])=>[x+a,y+b]);if(!conn(S2))continue;commit(R0,S2,cells.map(([a,b])=>[x+a,y+b]));return{x,y,room:R0.r,q}}}return null};
/* peças soltas pela sala: n células livres, cada uma com chão livre ao lado, distância entre dmin e dmax */
const pick=(n,dmin,dmax,solN,valid)=>{for(const R0 of rooms()){const q=R0.r.rect,F=[];for(let y=q.y;y<q.y+q.h;y++)for(let x=q.x;x<q.x+q.w;x++)ok(q,x,y)&&N4.some(([dx,dy])=>ok(q,x+dx,y+dy))&&F.push([x,y]);if(F.length<n*2)continue;
for(let t=0;t<40;t++){const sel=[];for(const c of shuf(F.slice())){sel.every(s=>{const d=Math.max(Math.abs(s[0]-c[0]),Math.abs(s[1]-c[1]));return d>=dmin&&d<=dmax})&&sel.push(c);if(sel.length===n)break}
if(sel.length<n||valid&&!valid(sel))continue;const sol=sel.slice(0,solN);if(!conn(sol))continue;commit(R0,sol,sel);return{sel,room:R0.r,q}}}return null};
/* desfaz reservas de uma tentativa que não deu certo */
const snap=()=>({b:new Set(BUSY),s:new Set(SOLC),n:cand.map(o=>o.n)}),undo=z=>{BUSY.clear();z.b.forEach(k=>BUSY.add(k));SOLC.clear();z.s.forEach(k=>SOLC.add(k));cand.forEach((o,i)=>o.n=z.n[i]??o.n)};
const zone=(c,r,w=26,h=22)=>{const[x,y]=C(c,r),z=S.add.zone(x,y+4,w,h);S.physics.add.existing(z,!0);solids.add(z);SOL.add(K(c,r));return z};
const label=(o,f)=>{Object.defineProperty(o,"interactLabel",{get:f,configurable:!0})};
const glow=(x,y,s,c,a)=>S.add.image(x,y,"light").setScale(s).setBlendMode(ADD).setTint(c).setAlpha(a);
const chest=(id,c,r,tier)=>{const[x,y]=C(c,r),key=tier==="EPIC"?"chest-epic":"chest-rare",o=S.add.image(x,y,key).setDepth(y).setVisible(!1);o.def={col:c,row:r,tier};o.opened=!!done[id+"_c"];o.opened&&S.textures.exists(key+"-open")&&o.setTexture(key+"-open");
label(o,()=>o.visible&&!o.opened?W("g.openChest"):null);o.interact=()=>{if(o.opened)return;o.opened=!0;done[id+"_c"]=1;save();S.tweens.add({targets:o,scaleY:.75,duration:90,yoyo:!0,onYoyo:()=>S.textures.exists(key+"-open")&&o.setTexture(key+"-open")});S.effectsRef?.burstTinted(x,y-8,16765514,20);S.audioRef?.play?.(Ct.CHEST_OPEN);S.lootSystem?.openChest(o)};
o.show=inst=>{o.setVisible(!0);if(inst)return;o.setAlpha(0).setScale(.4);S.tweens.add({targets:o,alpha:1,scale:1,duration:500,ease:"Back.easeOut"});S.effectsRef?.burstTinted(x,y-6,9437183,24);S.effectsRef?.shockwaveRing?.(x,y,30)};OBJ.push(o);return o};
const solved=(id,ch,t,inst)=>{if(!inst){done[id]=1;save();banner(L3("ENIGMA RESOLVIDO: ","PUZZLE SOLVED: ","ENIGMA RESUELTO: ")+t,"#9ff0ff");sfx("sfx-secret-reveal");S.cameraSys?.shake?.(.004,200)}ch.show(inst)};
const tone=(f,d=.38)=>{const E=S.game.audioEngine;if(!E?.ctx||!E.sfxBus)return;try{const t0=E.ctx.currentTime,o=E.ctx.createOscillator(),o2=E.ctx.createOscillator(),g=E.ctx.createGain();o.type="sine";o2.type="triangle";o.frequency.value=f;o2.frequency.value=f*2.01;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.32,t0+.01);g.gain.exponentialRampToValueAtTime(.001,t0+d*2.2);o.connect(g);o2.connect(g);g.connect(E.sfxBus);o.start(t0);o2.start(t0);o.stop(t0+d*2.4);o2.stop(t0+d*2.4)}catch(e){}};
const KITS={},V=__PZV[lid]||__PZV.temple;
/* glifos (Sol, Lua, Estrela, Triângulo, Losango, Olho) desenhados uma vez */
if(!S.textures.exists("pz-glyph-0"))for(let k=0;k<6;k++){const t=S.textures.createCanvas("pz-glyph-"+k,16,16),g=t.getContext();g.fillStyle="#ffffff";g.strokeStyle="#ffffff";g.lineWidth=1.6;g.beginPath();
if(k===0){g.arc(8,8,3.4,0,7);g.fill();for(let a=0;a<8;a++){const q=a*Math.PI/4;g.moveTo(8+Math.cos(q)*5,8+Math.sin(q)*5);g.lineTo(8+Math.cos(q)*7.4,8+Math.sin(q)*7.4)}g.stroke()}
else if(k===1){g.arc(8,8,6,0,7);g.fill();g.globalCompositeOperation="destination-out";g.beginPath();g.arc(11,6,5.4,0,7);g.fill();g.globalCompositeOperation="source-over"}
else if(k===2){for(let a=0;a<10;a++){const q=-Math.PI/2+a*Math.PI/5,r=a%2?3:7.2;a?g.lineTo(8+Math.cos(q)*r,8+Math.sin(q)*r):g.moveTo(8+Math.cos(q)*r,8+Math.sin(q)*r)}g.closePath();g.fill()}
else if(k===3){g.moveTo(8,1.5);g.lineTo(14.5,14);g.lineTo(1.5,14);g.closePath();g.fill()}
else if(k===4){g.moveTo(8,1);g.lineTo(14,8);g.lineTo(8,15);g.lineTo(2,8);g.closePath();g.fill()}
else{g.moveTo(1,8);g.quadraticCurveTo(8,1,15,8);g.quadraticCurveTo(8,15,1,8);g.closePath();g.fill();g.globalCompositeOperation="destination-out";g.beginPath();g.arc(8,8,2.6,0,7);g.fill();g.globalCompositeOperation="source-over"}t.refresh()}
if(!S.textures.exists("pz-post")){const t=S.textures.createCanvas("pz-post",22,34),g=t.getContext(),q=g.createLinearGradient(3,0,19,0);q.addColorStop(0,"#7c7c7c");q.addColorStop(.45,"#d8d8d8");q.addColorStop(1,"#6a6a6a");g.fillStyle="rgba(0,0,0,.35)";g.beginPath();g.ellipse(11,31,10,3,0,0,7);g.fill();g.fillStyle=q;g.fillRect(4,6,14,25);g.fillStyle="#efefef";g.beginPath();g.moveTo(3,7);g.lineTo(11,1);g.lineTo(19,7);g.closePath();g.fill();g.fillStyle="rgba(0,0,0,.3)";g.fillRect(4,28,14,3);t.refresh()}
const GN=[["Sol","Sun","Sol"],["Lua","Moon","Luna"],["Estrela","Star","Estrella"],["Triângulo","Triangle","Triángulo"],["Losango","Diamond","Rombo"],["Olho","Eye","Ojo"]],gname=k=>L3(...GN[k]),gde=k=>L3(["do","da","da","do","do","do"][k]+" "+GN[k][0],"the "+GN[k][1],["del","de la","de la","del","del","del"][k]+" "+GN[k][2]);
const perm=n=>{const a=[...Array(n).keys()];for(let k=n-1;k>0;k--){const m=Math.floor(RS()*(k+1));[a[k],a[m]]=[a[m],a[k]]}return a};
const glyph=(x,y,k,d)=>S.add.image(x,y,"pz-glyph-"+k).setDepth(d).setTint(16766072).setAlpha(.95);
const ORD=[["primeira","first","primera"],["segunda","second","segunda"],["terceira","third","tercera"],["quarta","fourth","cuarta"],["quinta","fifth","quinta"],["sexta","sixth","sexta"]];
const plaque=(c,r,title,lines)=>{const[x,y]=C(c,r),pl=S.add.image(x,y+T/2,"pz-plaque").setOrigin(.5,1).setDepth(y+T/2);zone(c,r,20,16);label(pl,()=>L3("Ler a lápide","Read the tombstone","Leer la lápida"));pl.interact=()=>S.game.events.emit("story:show",{title,lines:lines()});OBJ.push(pl);return pl};

/* ── alavancas: 3 a 5, dica pela posição (contando de um lado) ou pelos glifos ── */
KITS.levers=()=>{const N=V.levers.n,dx=sel=>new Set(sel.slice(0,N).map(q=>q[0])).size===N,row=sel=>{const rs=sel.slice(0,N).map(q=>q[1]);return Math.max(...rs)-Math.min(...rs)<=1};let H=V.levers.hint,P=null;
/* dica pela posição só com as alavancas numa mesma faixa (contar do oeste/leste sem ambiguidade); senão vira dica por glifos */
if(H==="pos")P=pick(N+2,3,10,N+1,q=>dx(q)&&row(q))||pick(N+2,2,10,N+1,q=>dx(q)&&row(q));if(!P){H="glyph";P=pick(N+2,3,10,N+1,dx)||pick(N+2,2,10,N+1,dx)}if(!P)return null;
const id="levers",LP=P.sel.slice(0,N).sort((a,b)=>a[0]-b[0]),PL=P.sel[N],CH=P.sel[N+1],ch=chest(id,CH[0],CH[1],"RARE"),order=perm(N),gl=perm(6).slice(0,N),fromE=V.levers.fromEast;let seq=[];
order.every((v,k)=>v===k)&&order.reverse();
const lv=LP.map(([lc,lr],k)=>{const[x,y]=C(lc,lr),img=S.add.image(x,y,"cx-lever-off").setOrigin(.5,.75).setDepth(y);zone(lc,lr,18,14);H==="glyph"&&glyph(x,y-30,gl[k],y+1);done[id]&&img.setTexture("cx-lever-on");label(img,()=>done[id]||seq.includes(k)?null:L3("Puxar a alavanca","Pull the lever","Tirar de la palanca")+" ("+(H==="glyph"?gname(gl[k]):(fromE?N-k:k+1)+L3("ª","","ª"))+")");
img.interact=()=>{if(done[id]||seq.includes(k))return;seq.push(k);img.setTexture("cx-lever-on");sfx("sfx-lever");S.effectsRef?.burstTinted(x,y-8,13214282,8);const okSoFar=seq.every((v,q)=>v===order[q]);if(okSoFar&&seq.length<N){S.effectsRef?.floatText(x,y-30,seq.length+"/"+N,"#e8d8a0");return}if(!0){if(okSoFar)solved(id,ch,L3("as alavancas","the levers","las palancas"));else{S.time.delayedCall(500,()=>{sfx("sfx-event-refuse");S.cameraSys?.shake?.(.005,180);S.effectsRef?.floatText(x,y-30,L3("Ordem errada…","Wrong order…","Orden equivocado…"),"#e08a7a");seq=[];lv.forEach(o=>o.setTexture("cx-lever-off"))})}}};OBJ.push(img);return img});
const say=k=>H==="glyph"?L3("a "+gde(gl[k]),gde(gl[k])+" one","la "+gde(gl[k])):(()=>{const q=fromE?N-1-k:k;return L3("a "+ORD[q][0]+" contando do "+(fromE?"leste":"oeste"),"the "+ORD[q][1]+" counting from the "+(fromE?"east":"west"),"la "+ORD[q][2]+" contando desde el "+(fromE?"este":"oeste"))})();
plaque(PL[0],PL[1],L3("LÁPIDE ANTIGA","ANCIENT TOMBSTONE","LÁPIDA ANTIGUA"),()=>{const st=order.map((k,q)=>(q===0?L3("“Primeiro, ","“First, ","“Primero, "):q===N-1?L3("por último, ","last, ","por último, "):L3("depois, ","then, ","después, "))+say(k)+(q===N-1?".”":";")),o=[];for(let q=0;q<st.length;q+=2)o.push(st.slice(q,q+2).join(" "));return o});done[id]&&ch.show(!0);
return{id,name:L3("Selo do Ferro","Seal of Iron","Sello del Hierro"),col:13161184,at:PL,room:P.room,dbg:{solve:()=>order.forEach(k=>lv[k].interact()),order,lv}}};

/* ── braseiros: todos ao mesmo tempo (com tempo) · numa ordem (glifos) · só os marcados (glifos) ── */
KITS.braziers=()=>{const M=V.braziers.mode,N=V.braziers.n,needPl=M!=="all",P=pick(N+1+(needPl?1:0),3,10,N+(needPl?1:0))||pick(N+1+(needPl?1:0),2,10,N+(needPl?1:0));if(!P)return null;const id="braziers",BP=P.sel.slice(0,N),PL=needPl?P.sel[N]:null,CH=P.sel[P.sel.length-1],ch=chest(id,CH[0],CH[1],"RARE");
let tour=0;{const left=BP.slice(1);let cur=BP[0];while(left.length){left.sort((a,b)=>Math.hypot(a[0]-cur[0],a[1]-cur[1])-Math.hypot(b[0]-cur[0],b[1]-cur[1]));const nx=left.shift();tour+=Math.hypot(nx[0]-cur[0],nx[1]-cur[1]);cur=nx}}
const BURN=M==="all"?Math.max(6,Math.min(14,3.5+tour*.42)):1e9,gl=perm(6).slice(0,N),order=perm(N),want=M==="some"?new Set(perm(N).slice(0,V.braziers.lit)):null;let seq=[];
const br=BP.map(([c,r],k)=>{const[x,y]=C(c,r),img=S.add.image(x,y+T/2,"pz-brazier").setOrigin(.5,1).setDepth(y+T/2);zone(c,r,20,16);M!=="all"&&glyph(x,y+T/2-6,gl[k],y+T/2+.5).setScale(.8);const f=S.add.sprite(x,y+T/2-20,"torch-flame",0).setOrigin(.5,1).setScale(1.25).setDepth(y+T/2+1).setVisible(!1);S.anims.exists("torch-flame-burn")&&f.play("torch-flame-burn");const g=glow(x,y-6,.5,16750130,0).setDepth(9001),Lt=lit(x,y-10,16750130,120,0);
const b={img,f,g,Lt,t:0,k};label(img,()=>done[id]||b.t>0?null:L3("Acender o braseiro","Light the brazier","Encender el brasero"));img.interact=()=>{if(done[id]||b.t>0)return;b.t=BURN;sfx("sfx-mage-fireball");S.effectsRef?.burstTinted(x,y-14,16750130,12);set(b,!0);M==="all"||seq.push(k);check()};OBJ.push(img);return b});
function set(b,on,k=1){b.f.setVisible(on).setScale(1.25*k);b.g.setAlpha(on?.42*k:0);b.Lt.intensity=on?1.3*k:0}
const fail=()=>{S.time.delayedCall(450,()=>{sfx("sfx-event-refuse");S.cameraSys?.shake?.(.005,180);for(const b of br){b.t=0;set(b,!1);S.effectsRef?.burstTinted(b.img.x,b.img.y-20,7368816,6)}seq=[]})};
const check=()=>{if(done[id])return;if(M==="all"){br.every(b=>b.t>0)&&solved(id,ch,L3("os braseiros","the braziers","los braseros"));return}
if(M==="order"){const n=seq.length;if(seq[n-1]!==order[n-1])return fail();n===N&&solved(id,ch,L3("os braseiros","the braziers","los braseros"));return}
const last=seq[seq.length-1];if(!want.has(last))return fail();seq.length===want.size&&solved(id,ch,L3("os braseiros","the braziers","los braseros"))};
needPl&&plaque(PL[0],PL[1],L3("LÁPIDE DO FOGO","TOMBSTONE OF FIRE","LÁPIDA DEL FUEGO"),()=>M==="order"?[L3("“Acenda o fogo na ordem em que os astros despertam:","“Light the fire in the order the signs awaken:","“Enciende el fuego en el orden en que despiertan los signos:"),order.map(k=>gname(gl[k])).join("  →  ")+"”"]:[L3("“Só o fogo certo abre o caminho. Acenda apenas:","“Only the right fire opens the way. Light only:","“Solo el fuego correcto abre el camino. Enciende solo:"),[...want].map(k=>gname(gl[k])).join(" · ")+"”",L3("Um fogo errado apaga todos.","A wrong fire puts them all out.","Un fuego equivocado los apaga todos.")]);
if(done[id]){br.forEach(b=>{if(M!=="some"||want.has(b.k)){b.t=1e9;set(b,!0)}});ch.show(!0)}
M==="all"&&on((t,ms)=>{for(const b of br){if(done[id]){b.t>0&&set(b,!0,1+.05*Math.sin(t/120));continue}if(b.t>0){b.t-=ms/1e3;if(b.t<=0){b.t=0;set(b,!1);S.effectsRef?.burstTinted(b.img.x,b.img.y-20,7368816,6)}else set(b,!0,b.t<2.5?.45+.55*(b.t/2.5)*(.8+.2*Math.sin(t/60)):1)}}});
return{id,name:L3("Selo do Fogo","Seal of Fire","Sello del Fuego"),col:16750154,at:BP[0],room:P.room,dbg:{solve:()=>{(M==="all"?br.map((b,k)=>k):M==="order"?order:[...want]).forEach(k=>br[k].img.interact())}}}};

/* ── espelhos: caminho do feixe com 2 ou 3 curvas, espelhos-isca ── */
KITS.mirror=()=>{const DEC=V.mirror.decoys;let P=null;for(const TURNS of[...new Set([V.mirror.turns,2])]){
for(const R0 of rooms()){const q=R0.r.rect,starts=[];for(let y=q.y;y<q.y+q.h;y++)for(let x=q.x;x<q.x+q.w;x++)ok(q,x,y)&&starts.push([x,y]);
for(const st of shuf(starts).slice(0,60)){/* caminho: segmentos retos alternando eixo, sem cruzar */
for(let tr=0;tr<12&&!P;tr++){const pts=[st],used=new Set([K(...st)]);let dir=RS()<.5?[RS()<.5?1:-1,0]:[0,RS()<.5?1:-1],good=!0;const turns=[];
for(let sg=0;sg<=TURNS&&good;sg++){const len=2+Math.floor(RS()*4);let[c,r]=pts[pts.length-1];for(let k=0;k<len;k++){c+=dir[0];r+=dir[1];if(!ok(q,c,r)||used.has(K(c,r))){good=!1;break}used.add(K(c,r))}if(!good)break;pts.push([c,r]);
if(sg<TURNS){const nd=dir[0]?[0,RS()<.5?1:-1]:[RS()<.5?1:-1,0];turns.push([c,r,dir,nd]);dir=nd}}if(!good)continue;
const tg=pts[pts.length-1],F=[];for(let yy=q.y;yy<q.y+q.h;yy++)for(let xx=q.x;xx<q.x+q.w;xx++){if(!ok(q,xx,yy)||used.has(K(xx,yy)))continue;let adj=!1;for(let dx=-1;dx<=1&&!adj;dx++)for(let dy=-1;dy<=1;dy++)if(used.has(K(xx+dx,yy+dy))){adj=!0;break}adj||F.push([xx,yy])}
const ex=shuf(F).filter(f=>N4.some(([dx,dy])=>ok(q,f[0]+dx,f[1]+dy)));if(ex.length<DEC+1)continue;const sol=[st,...turns.map(t=>[t[0],t[1]]),tg,...ex.slice(0,DEC)];if(!conn(sol))continue;
commit(R0,sol,[...[...used].map(k=>k.split(",").map(Number)),...ex.slice(0,DEC+1)]);
/* tipo de espelho que cada curva precisa: '/' leva (dx,dy) em (-dy,-dx); '\' em (dy,dx) */
P={room:R0.r,q,SRC:st,TGT:tg,D0:turns.length?turns[0][2]:dir,TU:turns.map(([c,r,di,no])=>[c,r,(-di[1]===no[0]&&-di[0]===no[1])?"/":"\\"]),DC:ex.slice(0,DEC),CH:ex[DEC]};}if(P)break}if(P)break}if(P)break}
if(!P)return null;const id="mirror",ch=chest(id,P.CH[0],P.CH[1],"RARE"),SRC=P.SRC,TGT=P.TGT,flip=o=>o==="/"?"\\":"/";
const MS=[...P.TU.map(([c,r,need],k)=>[c,r,k===0||RS()<.6?flip(need):need]),...P.DC.map(([c,r])=>[c,r,RS()<.5?"/":"\\"])];
const[sx,sy]=C(...SRC),[tx,ty]=C(...TGT);S.add.image(sx,sy+T/2,"ice-crystal").setOrigin(.5,1).setDepth(sy+T/2).setTint(16775880);zone(...SRC,20,18);const sg=glow(sx,sy-8,.3,16769658,.55).setDepth(9001);S.tweens.add({targets:sg,alpha:.3,duration:900,yoyo:!0,repeat:-1});lit(sx,sy-8,16769658,110,1);
const tgtI=S.add.image(tx,ty+T/2,"ice-crystal").setOrigin(.5,1).setDepth(ty+T/2).setTint(6976640);zone(...TGT,20,18);const tg=glow(tx,ty-8,.32,16769658,0).setDepth(9001);let tL=null;
const mirrors=MS.map(([c,r,o])=>{const[x,y]=C(c,r),img=S.add.image(x,y+T/2+2,o==="/"?"pz-mirror-a":"pz-mirror-b").setOrigin(.5,1).setDepth(y+T/2);zone(c,r,20,18);const m={c,r,o,img};label(img,()=>done[id]?null:L3("Girar o espelho","Turn the mirror","Girar el espejo"));img.interact=()=>{if(done[id])return;m.o=flip(m.o);img.setTexture(m.o==="/"?"pz-mirror-a":"pz-mirror-b");S.tweens.add({targets:img,scaleX:{from:-.2,to:1},duration:200,ease:"Back.easeOut"});sfx("sfx-ui-tab");beam()};OBJ.push(img);return m});
if(done[id])P.TU.forEach(([c,r,need],k)=>{mirrors[k].o=need;mirrors[k].img.setTexture(need==="/"?"pz-mirror-a":"pz-mirror-b")});
const bg=S.add.graphics().setDepth(1.2).setBlendMode(ADD);let pts=[];
const beam=()=>{let c=SRC[0],r=SRC[1],[dx,dy]=P.D0,hit=!1;pts=[[sx,sy-10]];for(let n=0;n<80;n++){c+=dx;r+=dy;if(wall(c,r)||!inR(P.q,c,r)){const[x,y]=C(c-dx*.5,r-dy*.5);pts.push([x,y-10]);break}if(c===TGT[0]&&r===TGT[1]){pts.push([tx,ty-10]);hit=!0;break}const m=mirrors.find(q=>q.c===c&&q.r===r);if(m){const[x,y]=C(c,r);pts.push([x,y-12]);[dx,dy]=m.o==="/"?[-dy,-dx]:[dy,dx];continue}if(SOL.has(K(c,r))||SOLC.has(K(c,r))&&!(c===SRC[0]&&r===SRC[1])){const[x,y]=C(c-dx*.4,r-dy*.4);pts.push([x,y-10]);break}}
if(hit){tgtI.setTint(16777164);tg.setAlpha(.6);tL||(tL=lit(tx,ty-8,16769658,120,1.2));done[id]||solved(id,ch,L3("o feixe de luz","the light beam","el haz de luz"))}};
on(t=>{bg.clear();if(pts.length<2)return;const w=.55+.2*Math.sin(t/90);for(const[lw,al,col]of[[7,.18*w,16769658],[3,.55*w,16775880],[1.2,.95,16777215]]){bg.lineStyle(lw,col,al);bg.beginPath();bg.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++)bg.lineTo(pts[k][0],pts[k][1]);bg.strokePath()}});
S.time.delayedCall(60,beam);done[id]&&ch.show(!0);return{id,name:L3("Selo da Luz","Seal of Light","Sello de la Luz"),col:16769658,at:SRC,room:P.room,dbg:{solve:()=>P.TU.forEach(([c,r,need],k)=>{mirrors[k].o!==need&&mirrors[k].img.interact()})}}};

/* ── blocos de pedra: arranjo gerado por fase (pilares, 1 ou 2 blocos) e conferido por um resolvedor ── */
const sokoban=(W,H,pil,blk,pl,start)=>{const idx=(x,y)=>y*W+x,inn=(x,y)=>x>=0&&y>=0&&x<W&&y<H,PIL=new Set(pil.map(([x,y])=>idx(x,y))),PLs=new Set(pl.map(([x,y])=>idx(x,y)));
const reachP=(p,bs)=>{const B=new Set(bs),seen=new Set([p]),q=[p];while(q.length){const c=q.pop(),x=c%W,y=(c-x)/W;for(const[dx,dy]of N4){const nx=x+dx,ny=y+dy,n=idx(nx,ny);if(!inn(nx,ny)||PIL.has(n)||B.has(n)||seen.has(n))continue;seen.add(n);q.push(n)}}return seen};
const key=(p,bs)=>Math.min(...reachP(p,bs))+"|"+bs.slice().sort((a,b)=>a-b).join(",");let fr=[[idx(...start),blk.map(([x,y])=>idx(x,y)),0,[]]];const seen=new Set([key(fr[0][0],fr[0][1])]);
while(fr.length){const nx=[];for(const[p,bs,d,path]of fr){if(bs.every(b=>PLs.has(b)))return path;const R=reachP(p,bs);for(let i=0;i<bs.length;i++){const b=bs[i],bx=b%W,by=(b-bx)/W;for(const[dx,dy]of N4){const px=bx-dx,py=by-dy,tx=bx+dx,ty=by+dy;if(!inn(px,py)||!R.has(idx(px,py))||!inn(tx,ty))continue;const t=idx(tx,ty);if(PIL.has(t)||bs.includes(t))continue;const nb=bs.slice();nb[i]=t;const k=key(b,nb);if(seen.has(k))continue;seen.add(k);nx.push([b,nb,d+1,[...path,[i,dx,dy]]])}}}fr=nx;if(seen.size>60000)return null}return null};
KITS.blocks=()=>{let P=null,lay=null;for(const[NB,NP,MIN,SZ]of[[V.blocks.blocks,Math.max(1,V.blocks.pillars),V.blocks.blocks===2?6:5,[[6,5],[5,5],[6,4],[5,4]]],[1,1,4,[[5,4],[4,4]]]]){if(P)break;
for(const[w,h]of SZ){const z0=snap(),R0=fit(rect(w,h),[]);if(!R0)continue;for(let t=0;t<160&&!lay;t++){const cells=shuf(rect(w,h).slice()),pil=cells.slice(0,NP),blk=cells.slice(NP,NP+NB),pl=cells.slice(NP+NB,NP+NB*2),st=cells[NP+NB*2];
if(blk.some(([x,y])=>(x===0||x===w-1)&&(y===0||y===h-1)))continue;const sol=sokoban(w,h,pil,blk,pl,st);if(sol&&sol.length>=MIN&&sol.length<=MIN+8&&conn([...pil,...blk].map(([a,b])=>[R0.x+a,R0.y+b])))lay={w,h,pil,blk,pl,sol}}
if(lay){P=R0;const ex=new Set([...lay.pil,...lay.blk].map(([a,b])=>K(R0.x+a,R0.y+b)));for(const k of ex)SOLC.add(k);break}undo(z0)}}
if(!P)return null;const id="blocks",X=P.x,Y=P.y,Q={x:X,y:Y,w:lay.w,h:lay.h},PLc=lay.pl.map(([a,b])=>[X+a,Y+b]),CHc=rect(lay.w,lay.h).map(([a,b])=>[X+a,Y+b]).find(([c,r])=>!lay.pil.some(([a,b])=>X+a===c&&Y+b===r)&&!PLc.some(([a,b])=>a===c&&b===r)&&!lay.blk.some(([a,b])=>X+a===c&&Y+b===r)),ch=chest(id,CHc[0],CHc[1],"RARE");
lay.pil.forEach(([a,b],k)=>{const[x,y]=C(X+a,Y+b);if(k===0){const o=S.add.image(x,y+T/2,"pz-reset").setOrigin(.5,1).setDepth(y+T/2).setTint(cfg.stone);zone(X+a,Y+b,20,18);label(o,()=>done[id]?null:L3("Recomeçar os blocos","Reset the blocks","Reiniciar los bloques"));o.interact=()=>{if(blocks.some(b=>b.mv))return;for(const b of blocks){put(b,b.c0,b.r0);S.effectsRef?.burstTinted(b.img.x,b.img.y-12,13417386,10)}sfx("sfx-shrine-use");check()};OBJ.push(o)}else{S.add.image(x,y+T/2,"pz-post").setOrigin(.5,1).setDepth(y+T/2).setTint(cfg.stone);zone(X+a,Y+b,20,18)}});
const plates=PLc.map(([c,r])=>{const[x,y]=C(c,r);return{c,r,img:S.add.image(x,y+2,"pz-plate").setDepth(.8),gl:glow(x,y,.16,16765514,0).setDepth(.81)}});
const blocks=lay.blk.map(([a,b])=>{const c=X+a,r=Y+b,[x,y]=C(c,r),img=S.add.image(x,y+T/2+2,"pz-stone").setOrigin(.5,1).setDepth(y+T/2).setTint(cfg.stone),z=zone(c,r,28,24);return{c,r,c0:c,r0:r,img,z,mv:!1}});
function put(b,c,r){SOL.delete(K(b.c,b.r));b.c=c;b.r=r;SOL.add(K(c,r));const[x,y]=C(c,r);b.img.setPosition(x,y+T/2+2).setDepth(y+T/2);b.z.setPosition(x,y+4);b.z.body.updateFromGameObject()}
if(done[id])plates.forEach((p,k)=>put(blocks[k],p.c,p.r));
const occ=(c,r,me)=>blocks.some(b=>b!==me&&b.c===c&&b.r===r)||SOL.has(K(c,r))&&!blocks.some(b=>b.c===c&&b.r===r);
function check(){let all=!0;for(const p of plates){const on=blocks.some(b=>!b.mv&&b.c===p.c&&b.r===p.r);p.img.setTexture(on?"pz-plate-on":"pz-plate");p.gl.setAlpha(on?.45:0);on&&!p.on&&sfx("sfx-lever");p.on=on;all=all&&on}if(all&&!done[id])solved(id,ch,L3("os blocos de pedra","the stone blocks","los bloques de piedra"))}
const push=(b,dx,dy)=>{if(b.mv||done[id])return;const c=b.c+dx,r=b.r+dy;if(!inR(Q,c,r)||wall(c,r)||occ(c,r,b))return;const[x,y]=C(c,r);b.mv=!0;SOL.delete(K(b.c,b.r));b.c=c;b.r=r;SOL.add(K(c,r));sfx("sfx-door-locked");
S.tweens.add({targets:b.img,x,y:y+T/2+2,duration:150,ease:"Quad.easeOut",onUpdate:()=>{b.img.setDepth(b.img.y);b.z.setPosition(b.img.x,b.img.y-T/2+2);b.z.body.updateFromGameObject()},onComplete:()=>{b.mv=!1;b.z.setPosition(x,y+4);b.z.body.updateFromGameObject();S.effectsRef?.burstTinted(x,y+10,13417386,6);check()}})};
let hold=0,hb=null;on((t,ms)=>{if(done[id]||S.state!=="playing")return;const p=S.player;if(!p?.body)return;const im=S.inputMgr;let a=im?.axis?.()||{x:0,y:0};const k=im?.keyboardAxis?.()||{x:0,y:0};Math.hypot(k.x,k.y)>Math.hypot(a.x,a.y)&&(a=k);
const px=p.body.center.x,py=p.body.bottom-6;let tg=null,dx=0,dy=0;if(Math.abs(a.x)>.55&&Math.abs(a.x)>Math.abs(a.y))dx=Math.sign(a.x);else if(Math.abs(a.y)>.55)dy=Math.sign(a.y);
if(dx||dy)for(const b of blocks){const[x,y]=C(b.c,b.r);if(dx&&Math.abs(py-y)<14&&Math.abs(px+dx*22-x)<12||dy&&Math.abs(px-x)<14&&Math.abs(py+dy*20-y)<12){tg=b;break}}
if(tg&&tg===hb){hold+=ms;if(hold>170){hold=-200;push(tg,dx,dy)}}else{hb=tg;hold=0}});
check();done[id]&&ch.show(!0);return{id,name:L3("Selo da Pedra","Seal of Stone","Sello de la Piedra"),col:13942398,at:[X+1,Y+1],room:P.room,dbg:{blocks,push,steps:lay.sol}}};

/* ── runas da memória: tamanho das rodadas e modo (normal ou de trás para frente) por fase ── */
KITS.runes=()=>{const P=pick(5,3,8,4)||pick(5,2,7,4);if(!P)return null;const id="runes",RP=P.sel.slice(0,4),CH=P.sel[4],ch=chest(id,CH[0],CH[1],"RARE"),FR=[392,494,587,740],COL=[8384511,13146111,16765802,9105062],LEN=V.runes.len,REV=!!V.runes.rev;let st="idle",seq=[],inp=0,round=0;
const RNM=[["azul","blue","azul"],["violeta","violet","violeta"],["dourada","golden","dorada"],["verde","green","verde"]];const pil=RP.map(([c,r],k)=>{const[x,y]=C(c,r),img=S.add.image(x,y+T/2,"pz-pillar-"+k).setOrigin(.5,1).setDepth(y+T/2);zone(c,r,18,14);const g=glow(x,y-20,.34,COL[k],done[id]?.35:0).setDepth(9001);
const flash=()=>{g.setAlpha(.95).setScale(.5);img.setTint(COL[k]);tone(FR[k]);S.effectsRef?.burstTinted(x,y-26,COL[k],10);S.tweens.killTweensOf(img);img.setScale(1);S.tweens.add({targets:img,scaleX:1.12,scaleY:1.12,duration:110,yoyo:!0});S.tweens.add({targets:g,alpha:done[id]?.35:0,scale:.34,duration:560,onComplete:()=>img.clearTint()})};
label(img,()=>done[id]||st==="show"?null:st==="idle"?L3("Tocar a runa (começar)","Touch the rune (start)","Tocar la runa (empezar)"):L3("Tocar a runa "+RNM[k][0],"Touch the "+RNM[k][1]+" rune","Tocar la runa "+RNM[k][2])+(REV?L3(" (ao contrário)"," (backwards)"," (al revés)"):""));
img.interact=()=>{if(done[id]||st==="show")return;if(st==="idle"){round=0;REV&&(S.effectsRef?.floatText(x,y-46,L3("Repita de trás para frente","Repeat it backwards","Repítela al revés"),"#d8c8ff"),banner(L3("RUNAS: REPITA A SEQUÊNCIA DE TRÁS PARA FRENTE","RUNES: REPEAT THE SEQUENCE BACKWARDS","RUNAS: REPITE LA SECUENCIA AL REVÉS"),"#d8c8ff"));play();return}flash();const want=REV?seq[seq.length-1-inp]:seq[inp];if(k!==want){st="show";S.time.delayedCall(300,()=>{sfx("sfx-event-refuse");S.cameraSys?.shake?.(.005,180);S.effectsRef?.floatText(x,y-40,L3("Era a runa "+RNM[want][0]+"…","It was the "+RNM[want][1]+" rune…","Era la runa "+RNM[want][2]+"…"),"#e08a7a");banner(L3("A SEQUÊNCIA SE DESFEZ — OLHE DE NOVO","THE SEQUENCE BROKE — WATCH AGAIN","LA SECUENCIA SE ROMPIÓ — MIRA DE NUEVO"),"#e0a08a");S.time.delayedCall(1300,()=>play(!0))});return}inp++;S.effectsRef?.floatText(x,y-48,inp+"/"+seq.length,"#bfe8ff");if(inp>=seq.length){st="show";round++;if(round>=LEN.length){S.time.delayedCall(450,()=>{st="done";solved(id,ch,L3("as runas da memória","the memory runes","las runas de la memoria"));pil.forEach(p=>p.flash())})}else S.time.delayedCall(900,play)}};OBJ.push(img);return{flash,img}});
const play=again=>{st="show";again||(seq=Array.from({length:LEN[round]},()=>Math.floor(R()*4)));inp=0;seq.forEach((k,q)=>S.time.delayedCall(450+q*620,()=>pil[k].flash()));S.time.delayedCall(450+seq.length*620,()=>{st="input"})};
done[id]&&ch.show(!0);return{id,name:L3("Selo da Memória","Seal of Memory","Sello de la Memoria"),col:13146111,at:RP[0],room:P.room,dbg:{st:()=>st,seq:()=>REV?seq.slice().reverse():seq,pil}}};
/* quatro enigmas por fase (ordem embaralhada pela fase; se um não couber, entra o próximo) */
const order=["levers","braziers","mirror","blocks","runes"];for(let k=order.length-1;k>0;k--){const m=Math.floor(RS()*(k+1));[order[k],order[m]]=[order[m],order[k]]}
/* o Relicário vai primeiro (precisa de espaço), longe do início */
const sp=LV.playerSpawn;cand.forEach(o=>o.k=-(Math.hypot(o.r.rect.x+o.r.rect.w/2-(sp?.col??0),o.r.rect.y+o.r.rect.h/2-(sp?.row??0)))/100+(o.r.cdObj?1:0));
let AP=null,APr=3;for(const xt of[0,1]){xt&&cand.push(...EXTRA);for(const[h,ar]of[[5,3],[4,2],[3,2]]){AP=fit(rect(3,h),[[0,ar],[1,ar],[2,ar]]);if(AP){APr=ar;break}}xt&&cand.splice(cand.length-EXTRA.length,EXTRA.length);if(AP)break}cand.forEach(o=>o.k=RS()+(o.r.cdObj?1:0));
const SEALS=[];for(const k of order){if(SEALS.length>=4)break;const s=KITS[k]();s&&SEALS.push(s)}
/* ── Relicário Selado ── */
if(AP&&SEALS.length){const c0=AP.x+1,r0=AP.y+APr,[x,yc]=C(c0,r0),y=yc+T/2,cnt=()=>SEALS.filter(q=>done[q.id]).length,N=SEALS.length;
const base=S.add.image(x,y,"pz-relic").setOrigin(.5,1).setDepth(y);{const z=S.add.zone(x,y-10,56,18);S.physics.add.existing(z,!0);solids.add(z)}
const orb=S.add.image(x,y-66,"pz-orb").setDepth(y+.5).setTint(cfg.orb).setScale(1.1),og=glow(x,y-66,.34,cfg.orb,.4).setDepth(y+.45);S.tweens.add({targets:[orb,og],y:"-=5",duration:1300,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"});
const shell=S.add.image(x,y-38,"pz-relic-ice").setOrigin(.5,1).setDepth(y+1).setAlpha(.86).setScale(.78).setTint(cfg.shell);const Lt=lit(x,y-44,cfg.orb,120,.7);
const gems=SEALS.map((q,k)=>{const gx=x-14+k*12,gy=y-23;return{q,g:S.add.image(gx,gy,"pz-gem").setDepth(y+.6).setTint(3815994),gl:glow(gx,gy,.1,q.col,0).setDepth(y+.65),on:!1}});
const drop=()=>{const it=S.lootSystem?.makeItem?.(cfg.item,"LEGENDARY",0);it&&S.lootSystem.spawnItem(x,y+20,it)};
const has=()=>{const I=S.inventory;return!!(I&&((I.items||[]).some(q=>q&&q.id===cfg.item)||Object.values(I.equipment||{}).some(q=>q&&q.id===cfg.item)))};
if(done.relic){shell.setVisible(!1);orb.setVisible(!1);og.setVisible(!1);!done.relic_got&&!has()&&S.time.delayedCall(600,drop)}
const rn=AP.room.name||"";let prev=-1;
const paint=()=>{const c=cnt();for(const G of gems){const on=!!done[G.q.id];if(on&&!G.on){G.g.setTint(G.q.col);G.gl.setAlpha(.55);prev>=0&&(S.effectsRef?.burstTinted(G.g.x,G.g.y,G.q.col,14),S.effectsRef?.shockwaveRing?.(G.g.x,G.g.y,18))}G.on=on}
if(prev>=0&&c>prev&&!done.relic)S.time.delayedCall(1900,()=>{banner(L3("SELO DESPERTO NO RELICÁRIO ","SEAL AWAKENED AT THE RELIQUARY ","SELLO DESPERTADO EN EL RELICARIO ")+c+"/"+N,"#bff4ff");sfx("sfx-shrine-use");c===N&&S.time.delayedCall(1600,()=>S.game.events.emit("story:show",{title:L3(...cfg.title),lines:[L3("Todos os selos brilham ao mesmo tempo.","Every seal shines at once.","Todos los sellos brillan a la vez."),L3("Em "+rn+", a casca do Relicário começa a rachar…","At "+rn+", the Reliquary's shell starts to crack…","En "+rn+", la cáscara del Relicario empieza a agrietarse…")]}))});
if(c===N&&!done.relic&&!shell.__crk){shell.__crk=1;S.tweens.add({targets:shell,alpha:.6,duration:700,yoyo:!0,repeat:-1})}prev=c;if(done.relic&&!done.relic_got&&has()){done.relic_got=1;save()}};paint();S.time.addEvent({delay:300,loop:!0,callback:paint});
label(base,()=>done.relic?null:cnt()<N?L3("Examinar o Relicário Selado","Examine the Sealed Reliquary","Examinar el Relicario Sellado")+" ("+cnt()+"/"+N+")":L3("Libertar o Relicário","Free the Reliquary","Liberar el Relicario"));
base.interact=()=>{if(done.relic)return;const c=cnt();if(c<N){S.game.events.emit("story:show",{title:L3(...cfg.title),lines:[L3("Algo pulsa preso dentro da casca. "+N+" encaixes cercam o pedestal.","Something beats trapped inside the shell. "+N+" sockets ring the pedestal.","Algo late atrapado en la cáscara. "+N+" engastes rodean el pedestal."),...SEALS.map(q=>(done[q.id]?"✔  ":"◇  ")+q.name+" — "+(q.room?.name||"")),L3(c+" de "+N+" selos despertos.",c+" of "+N+" seals awakened.",c+" de "+N+" sellos despertados.")]});return}
done.relic=1;save();sfx("sfx-secret-reveal");S.cameraSys?.shake?.(.006,700);S.tweens.killTweensOf(shell);shell.setAlpha(.95);
S.tweens.add({targets:shell,x:{from:x-2,to:x+2},duration:45,yoyo:!0,repeat:8,onComplete:()=>{shell.setVisible(!1);S.cameras.main.flash(260,255,240,210);S.effectsRef?.burstTinted(x,y-40,cfg.orb,34);S.effectsRef?.shockwaveRing?.(x,y-20,70);sfx("sfx-relic-drop");
for(let k=0;k<30;k++){const r=S.add.rectangle(x+(R()-.5)*54,y-40-R()*70,2+R()*5,5+R()*10,[cfg.shell,cfg.orb,16777215][k%3]).setDepth(y+2).setRotation(R()*6).setAlpha(.9);S.tweens.add({targets:r,x:r.x+(R()-.5)*190,y:r.y+40+R()*50,rotation:r.rotation+(R()-.5)*8,alpha:0,duration:700+R()*600,ease:"Quad.easeOut",onComplete:()=>r.destroy()})}
S.tweens.add({targets:[orb,og],y:y-96,alpha:0,duration:700,delay:250,ease:"Quad.easeIn",onComplete:()=>{orb.setVisible(!1);og.setVisible(!1);drop()}});banner(L3("RELICÁRIO LIBERTADO","RELIQUARY FREED","RELICARIO LIBERADO"),"#bff4ff")}})};
OBJ.push(base);SEALS.relic={x:c0,y:r0}}
(S.__pzDbg={lid,mask:id=>{const q=LV.rooms.find(r=>r.id===id).rect,o=[];for(let y=q.y-1;y<=q.y+q.h;y++){let l="";for(let x=q.x-1;x<=q.x+q.w;x++)l+=wall(x,y)?"#":SOLC.has(K(x,y))?"S":BUSY.has(K(x,y))?"u":VIS.has(K(x,y))?"v":BAN.has(K(x,y))?"b":".";o.push(l)}return o.join("\n")},free:()=>cand.map(o=>{const q=o.r.rect;let n=0,w=0,v=0,so=0,bn=0;for(let y=q.y;y<q.y+q.h;y++)for(let x=q.x;x<q.x+q.w;x++){n++;wall(x,y)?w++:SOLC.has(K(x,y))?so++:VIS.has(K(x,y))?v++:BAN.has(K(x,y))&&bn++}return[o.r.id,n,"wall",w,"sol",so,"vis",v,"ban",bn]}),seals:SEALS,relic:AP&&{col:AP.x+1,row:AP.y+APr,room:AP.room.id},done:()=>done,save});
/* objetos interativos entram na lista do calabouço */
const Lo=D.objects||S.dungeon?.objects;if(Lo)for(const o of OBJ)Lo.includes(o)||Lo.push(o);
/* fala do herói ao chegar perto de um enigma ainda não resolvido */
const BK=SEALS.map(q=>[q.id,q.at]);AP&&BK.push(["relic",[AP.x+1,AP.y+APr]]);const said=new Set,LN=[["Algum tipo de segredo existe aqui…","Some kind of secret lies here…","Algún tipo de secreto existe aquí…"],["Parece um novo quebra-cabeça.","Looks like a new puzzle.","Parece un nuevo rompecabezas."],["Hm… isso não está aqui por acaso.","Hm… this isn't here by chance.","Hm… esto no está aquí por casualidad."],["Tem algo escondido por aqui.","Something is hidden around here.","Hay algo escondido por aquí."],["Um enigma… vamos ver o que ele guarda.","A riddle… let's see what it guards.","Un enigma… veamos qué guarda."]];
let busy=0,last=-1;const say=t=>{const p=S.player;if(!p)return;const tx=S.add.text(0,0,t,{fontFamily:"Georgia, 'Times New Roman', serif",fontStyle:"italic",fontSize:"13px",color:"#1d2433",align:"center",wordWrap:{width:190}}).setOrigin(.5),w=tx.width+18,h=tx.height+10,bg=S.add.graphics();
bg.fillStyle(15660798,.94).lineStyle(1.5,4877680,.9).fillRoundedRect(-w/2,-h/2,w,h,7).strokeRoundedRect(-w/2,-h/2,w,h,7).fillStyle(15660798,.94).fillTriangle(-6,h/2-1,6,h/2-1,0,h/2+7).lineStyle(1.5,4877680,.9).lineBetween(-6,h/2,0,h/2+7).lineBetween(6,h/2,0,h/2+7);
const box=S.add.container(p.x,p.y-74-h/2,[bg,tx]).setDepth(9600).setAlpha(0).setScale(.85),fol=()=>{const q=S.player;q&&box.active&&box.setPosition(q.x,q.y-74-h/2)};S.events.on("update",fol);busy=1;
S.tweens.add({targets:box,alpha:1,scale:1,duration:220,ease:"Back.easeOut"});S.time.delayedCall(3200,()=>S.tweens.add({targets:box,alpha:0,duration:350,onComplete:()=>{S.events.off("update",fol);box.destroy();busy=0}}))};
S.time.addEvent({delay:250,loop:!0,callback:()=>{const p=S.player;if(!p||busy||!S.sys.isActive())return;for(const[id,cr]of BK){if(done[id]||said.has(id))continue;const[x,y]=C(cr[0],cr[1]);if(Math.hypot(p.x-x,p.y-y)<T*4.5){said.add(id);let k=said.size-1;if(k>1)do k=Math.floor(R()*LN.length);while(k===last);last=k;say(L3(...LN[k]));break}}}})}
