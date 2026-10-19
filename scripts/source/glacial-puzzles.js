/* ── Cidadela Glacial: enigmas + luz realista nos personagens ─────────────────────────────────────
   Enigmas (opcionais, cada um libera um baú):
     1. Lago Congelado: blocos de gelo que deslizam + placas de pressão (só o peso do bloco aciona)
     2. Clareira dos Pinheiros: espelhos de gelo levando o feixe de luz do cristal até o cristal-alvo
     3. Trilha Nevada: três alavancas na ordem certa (dica na lápide)
     4. Bosque Gélido: quatro braseiros acesos ao mesmo tempo (cada um apaga sozinho)
     5. Portão Congelado: quatro runas — repetir a sequência de luzes e sons (memória)
   Recompensa maior: cada enigma da floresta (1-4) acende um selo no Relicário Congelado (Bosque Gélido).
   Com os quatro selos o gelo se quebra e libera o Coração do Inverno (acessório lendário único) —
   e só com ele as runas do Portão Congelado despertam.
   Luz: normal maps gerados na hora a partir dos sprites (herói e inimigos), luzes do Phaser nos lampiões,
   tochas, braseiros e cristais + uma luz fria de céu; sombras dinâmicas que se afastam da luz mais próxima.
   O estado dos enigmas fica salvo por slot (localStorage depthgate:gspz:<slot>).                    */
Object.assign(Xt,{winter_heart:{name:"Coração do Inverno",type:"accessory",slot:"accessory",icon:"icon-winter-heart",minRarity:"LEGENDARY",stats:{maxHp:3,defense:2,damage:1,magicDamage:1,critChance:3},value:320,desc:"Frio como a neve, mas bate como um coração vivo. Desperta as runas do Portão Congelado."}});
try{_s["item.winter_heart"]="Heart of Winter";Io["item.winter_heart"]="Corazón del Invierno"}catch(e){}
function __gsHasHeart(S){const I=S.inventory;return!!(I&&((I.items||[]).some(q=>q&&q.id==="winter_heart")||Object.values(I.equipment||{}).some(q=>q&&q.id==="winter_heart")))}
function __gsTex(S){if(S.textures.exists("pz-relic"))return;const mk=(k,w,h,f)=>{const t=S.textures.createCanvas(k,w,h),g=t.getContext();f(g,w,h);t.refresh()};
const grad=(g,x0,y0,x1,y1,st)=>{const q=g.createLinearGradient(x0,y0,x1,y1);for(const[o,c]of st)q.addColorStop(o,c);return q};
/* bloco de gelo */
mk("pz-block",32,38,g=>{g.fillStyle="rgba(10,30,50,.35)";g.beginPath();g.ellipse(16,35,14,3,0,0,7);g.fill();g.fillStyle=grad(g,0,10,0,36,[[0,"#bfeaff"],[.5,"#7fc4ec"],[1,"#3f86b8"]]);g.fillRect(3,12,26,24);g.fillStyle=grad(g,0,2,0,14,[[0,"#f4fdff"],[1,"#b4e2fa"]]);g.beginPath();g.moveTo(3,12);g.lineTo(9,4);g.lineTo(31,4);g.lineTo(29,12);g.closePath();g.fill();g.fillStyle="#5aa2cf";g.beginPath();g.moveTo(29,12);g.lineTo(31,4);g.lineTo(31,30);g.lineTo(29,36);g.closePath();g.fill();
g.strokeStyle="rgba(255,255,255,.75)";g.lineWidth=1;g.beginPath();g.moveTo(6,16);g.lineTo(12,30);g.moveTo(18,15);g.lineTo(22,24);g.stroke();g.strokeStyle="rgba(30,80,120,.6)";g.strokeRect(3.5,12.5,25,23);g.fillStyle="rgba(255,255,255,.9)";g.fillRect(10,6,12,2);g.fillStyle="#ffffff";g.fillRect(9,4,22,2)});
/* placa de pressão (apagada / acesa) */
for(const on of[0,1])mk(on?"pz-plate-on":"pz-plate",30,22,g=>{g.fillStyle="rgba(10,20,40,.35)";g.beginPath();g.ellipse(15,13,14,7,0,0,7);g.fill();g.fillStyle=grad(g,0,2,0,20,[[0,"#9aa6b4"],[1,"#566270"]]);g.beginPath();g.ellipse(15,10,13,7,0,0,7);g.fill();g.fillStyle=on?"#8ff2ff":"#3a4654";g.beginPath();g.ellipse(15,9,9,4.5,0,0,7);g.fill();g.strokeStyle=on?"#e8ffff":"#7d8a98";g.lineWidth=1;g.beginPath();g.moveTo(10,9);g.lineTo(15,6);g.lineTo(20,9);g.lineTo(15,12);g.closePath();g.stroke()});
/* pedra de recomeçar */
mk("pz-reset",24,30,g=>{g.fillStyle="rgba(10,20,40,.35)";g.beginPath();g.ellipse(12,27,10,3,0,0,7);g.fill();g.fillStyle=grad(g,0,2,0,28,[[0,"#a8b2c0"],[1,"#5a6574"]]);g.beginPath();g.moveTo(4,27);g.lineTo(3,10);g.quadraticCurveTo(12,0,21,10);g.lineTo(20,27);g.closePath();g.fill();g.strokeStyle="#9ff0ff";g.lineWidth=1.5;g.beginPath();g.arc(12,15,5,0.3,5.6);g.stroke();g.beginPath();g.moveTo(16,10);g.lineTo(17,14);g.lineTo(13,13);g.stroke()});
/* espelho de gelo (duas posições) */
for(const k of["a","b"])mk("pz-mirror-"+k,30,44,g=>{g.fillStyle="rgba(10,20,40,.35)";g.beginPath();g.ellipse(15,41,12,3,0,0,7);g.fill();g.fillStyle=grad(g,0,30,0,42,[[0,"#8d97a6"],[1,"#4c5664"]]);g.fillRect(6,32,18,9);g.fillStyle="#6c7684";g.fillRect(13,22,4,11);g.save();g.translate(15,16);g.rotate(k==="a"?-.62:.62);g.fillStyle=grad(g,-11,0,11,0,[[0,"#d8f6ff"],[.45,"#8fd4f4"],[.55,"#ffffff"],[1,"#5aa8d8"]]);g.fillRect(-12,-5,24,9);g.strokeStyle="#2e6c96";g.lineWidth=1;g.strokeRect(-12,-5,24,9);g.restore()});
/* lápide da dica */
mk("pz-plaque",26,32,g=>{g.fillStyle="rgba(10,20,40,.35)";g.beginPath();g.ellipse(13,29,11,3,0,0,7);g.fill();g.fillStyle=grad(g,0,0,0,30,[[0,"#b9c2ce"],[1,"#66707e"]]);g.beginPath();g.moveTo(3,29);g.lineTo(3,8);g.quadraticCurveTo(13,-2,23,8);g.lineTo(23,29);g.closePath();g.fill();g.fillStyle="#f4fbff";g.fillRect(5,5,16,3);g.fillStyle="#4a5462";for(let y=12;y<26;y+=4)g.fillRect(7,y,12,1.5)});
/* braseiro */
mk("pz-brazier",26,28,g=>{g.fillStyle="rgba(10,20,40,.35)";g.beginPath();g.ellipse(13,25,11,3,0,0,7);g.fill();g.fillStyle="#3a3f48";g.fillRect(6,14,2,11);g.fillRect(18,14,2,11);g.fillRect(12,15,2,10);g.fillStyle=grad(g,0,6,0,16,[[0,"#7a828e"],[1,"#30353e"]]);g.beginPath();g.moveTo(2,8);g.lineTo(24,8);g.lineTo(20,16);g.lineTo(6,16);g.closePath();g.fill();g.fillStyle="#1c1f26";g.beginPath();g.ellipse(13,8,11,3,0,0,7);g.fill();g.fillStyle="#f4fbff";g.fillRect(3,6,6,2);g.fillRect(17,6,6,2)});
/* Relicário Congelado: pedestal com 4 encaixes, casca de gelo, coração e gema */
mk("pz-relic",64,58,g=>{g.fillStyle="rgba(10,20,40,.4)";g.beginPath();g.ellipse(32,54,30,4,0,0,7);g.fill();g.fillStyle=grad(g,0,44,0,57,[[0,"#9aa4b2"],[1,"#4d5765"]]);g.fillRect(3,44,58,12);g.fillStyle="#c6d0dc";g.fillRect(3,44,58,2);
g.fillStyle=grad(g,10,0,54,0,[[0,"#59636f"],[.35,"#aab4c0"],[.7,"#8a94a2"],[1,"#4f5965"]]);g.fillRect(10,18,44,27);g.fillStyle="#2b333e";g.fillRect(10,42,44,3);
g.fillStyle=grad(g,0,8,0,20,[[0,"#e9f6ff"],[1,"#8e9aa8"]]);g.beginPath();g.moveTo(5,20);g.lineTo(59,20);g.lineTo(53,11);g.lineTo(11,11);g.closePath();g.fill();g.fillStyle="#ffffff";g.fillRect(12,10,40,2);
g.strokeStyle="rgba(40,60,90,.55)";g.lineWidth=1;g.beginPath();g.moveTo(16,24);g.lineTo(20,28);g.lineTo(16,32);g.moveTo(48,24);g.lineTo(44,28);g.lineTo(48,32);g.stroke();
for(let k=0;k<4;k++){const x=14+k*12;g.fillStyle="#1a2029";g.beginPath();g.arc(x+4,35,4.2,0,7);g.fill();g.strokeStyle="#c6d0dc";g.lineWidth=1;g.beginPath();g.arc(x+4,35,4.6,0,7);g.stroke()}});
mk("pz-relic-ice",84,96,g=>{const sh=[[42,2,20,88,64,88],[20,20,8,90,36,90],[64,16,50,90,78,90],[30,36,18,92,46,92],[56,40,40,92,70,92],[10,50,2,92,22,92],[76,48,66,92,84,92]];
for(const[tx,ty,ax,ay,bx,by]of sh){g.fillStyle=grad(g,ax,ty,bx,ay,[[0,"rgba(214,246,255,.78)"],[.5,"rgba(140,206,240,.55)"],[1,"rgba(80,150,200,.72)"]]);g.beginPath();g.moveTo(tx,ty);g.lineTo(bx,by);g.lineTo(ax,ay);g.closePath();g.fill();g.strokeStyle="rgba(255,255,255,.85)";g.lineWidth=1;g.beginPath();g.moveTo(tx,ty);g.lineTo(ax+(bx-ax)*.35,ay);g.stroke();g.strokeStyle="rgba(40,100,150,.5)";g.beginPath();g.moveTo(tx,ty);g.lineTo(bx,by);g.stroke()}
g.fillStyle="rgba(255,255,255,.9)";g.fillRect(40,8,2,10);g.fillRect(22,26,2,7);g.fillRect(64,22,2,8)});
mk("pz-heart",20,20,g=>{g.fillStyle="#2c6a9c";g.beginPath();g.arc(6.5,7,5,0,7);g.arc(13.5,7,5,0,7);g.fill();g.beginPath();g.moveTo(1.6,8.6);g.lineTo(10,19);g.lineTo(18.4,8.6);g.closePath();g.fill();g.fillStyle=grad(g,0,2,0,18,[[0,"#e4f8ff"],[.5,"#8fdcff"],[1,"#3f9ad0"]]);g.beginPath();g.arc(6.5,7,3.8,0,7);g.arc(13.5,7,3.8,0,7);g.fill();g.beginPath();g.moveTo(3,8.6);g.lineTo(10,17);g.lineTo(17,8.6);g.closePath();g.fill();g.fillStyle="#ffffff";g.fillRect(5,5,3,2)});
mk("pz-gem",10,10,g=>{g.fillStyle="#ffffff";g.beginPath();g.arc(5,5,3.6,0,7);g.fill();g.fillStyle="rgba(255,255,255,.6)";g.fillRect(3,2,2,2)});
/* pilares de runa (4 cores) */
const RC=["#7fe8ff","#c89bff","#ffd36a","#8af2a6"];
RC.forEach((col,i)=>mk("pz-pillar-"+i,24,52,g=>{g.fillStyle="rgba(10,20,40,.4)";g.beginPath();g.ellipse(12,49,11,3,0,0,7);g.fill();g.fillStyle=grad(g,0,0,24,0,[[0,"#56606e"],[.4,"#a3adba"],[1,"#4a5361"]]);g.beginPath();g.moveTo(4,48);g.lineTo(6,8);g.lineTo(12,2);g.lineTo(18,8);g.lineTo(20,48);g.closePath();g.fill();g.fillStyle="#eef8ff";g.fillRect(8,5,8,3);g.strokeStyle=col;g.lineWidth=1.6;g.beginPath();
if(i===0){g.moveTo(12,16);g.lineTo(12,34);g.moveTo(8,20);g.lineTo(16,28)}else if(i===1){g.moveTo(9,16);g.lineTo(15,25);g.lineTo(9,34)}else if(i===2){g.arc(12,25,6,0,6.3);g.moveTo(12,17);g.lineTo(12,33)}else{g.moveTo(8,18);g.lineTo(16,18);g.lineTo(8,32);g.lineTo(16,32)}g.stroke();g.fillStyle="#2a3140";g.fillRect(4,44,16,4)}))}

function __gsPuzzles(S,def,solids){__gsTex(S);__leverTex(S);const T=dt,L3=__L3,R=Math.random,ADD=j.BlendModes.ADD,C=(c,r)=>[c*T+T/2,r*T+T/2],K=(c,r)=>c+","+r,P=__GSPZ_DEF;
const slot=S.game.registry.get("save:slot")??1,KEY="depthgate:gspz:"+slot;let done={};try{done=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){}const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(done))}catch(e){}};
const on=f=>{S.events.on("update",f);S.events.once("shutdown",()=>S.events.off("update",f))};const OBJ=[],SOL=new Set,sfx=k=>S.game.audioEngine?.sfx?.(k),banner=(t,c)=>S.game.events.emit("ui:banner",t,c||"#8ae0ff"),wall=(c,r)=>{const D=S.dungeon;return!D||D.isWallTile(c,r)};
const zone=(c,r,w=26,h=22)=>{const[x,y]=C(c,r),z=S.add.zone(x,y+4,w,h);S.physics.add.existing(z,!0);solids.add(z);SOL.add(K(c,r));return z};
const label=(o,f)=>{Object.defineProperty(o,"interactLabel",{get:f,configurable:!0})};
const glow=(x,y,s,c,a)=>S.add.image(x,y,"light").setScale(s).setBlendMode(ADD).setTint(c).setAlpha(a);
const lights=S.__gsLights=S.__gsLights||[];
/* baú de recompensa */
const chest=(id,c,r,tier)=>{const[x,y]=C(c,r),key=tier==="EPIC"?"chest-epic":"chest-rare",o=S.add.image(x,y,key).setDepth(y).setVisible(!1);o.def={col:c,row:r,tier};o.opened=!!done[id+"_c"];o.opened&&S.textures.exists(key+"-open")&&o.setTexture(key+"-open");
label(o,()=>o.visible&&!o.opened?W("g.openChest"):null);o.interact=()=>{if(o.opened)return;o.opened=!0;done[id+"_c"]=1;save();S.tweens.add({targets:o,scaleY:.75,duration:90,yoyo:!0,onYoyo:()=>S.textures.exists(key+"-open")&&o.setTexture(key+"-open")});S.effectsRef?.burstTinted(x,y-8,16765514,20);S.audioRef?.play?.(Ct.CHEST_OPEN);S.lootSystem?.openChest(o)};
o.show=(inst)=>{o.setVisible(!0);if(inst)return;o.setAlpha(0).setScale(.4);S.tweens.add({targets:o,alpha:1,scale:1,duration:500,ease:"Back.easeOut"});S.effectsRef?.burstTinted(x,y-6,9437183,24);S.effectsRef?.shockwaveRing?.(x,y,30)};OBJ.push(o);return o};
const solved=(id,ch,t,inst)=>{if(!inst){done[id]=1;save();banner(L3("ENIGMA RESOLVIDO: ","PUZZLE SOLVED: ","ENIGMA RESUELTO: ")+t,"#9ff0ff");sfx("sfx-secret-reveal");S.cameraSys?.shake?.(.004,200)}ch.show(inst)};
/* tom (para as runas) */
const tone=(f,d=.38)=>{const E=S.game.audioEngine;if(!E?.ctx||!E.sfxBus)return;try{const t0=E.ctx.currentTime,o=E.ctx.createOscillator(),o2=E.ctx.createOscillator(),g=E.ctx.createGain();o.type="sine";o2.type="triangle";o.frequency.value=f;o2.frequency.value=f*2.01;g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(.32,t0+.01);g.gain.exponentialRampToValueAtTime(.001,t0+d*2.2);o.connect(g);o2.connect(g);g.connect(E.sfxBus);o.start(t0);o2.start(t0);o.stop(t0+d*2.4);o2.stop(t0+d*2.4)}catch(e){}};

/* ── 1. blocos de gelo + placas ── */
{const D=P.ice,id="ice",ICE=new Set((S.cache.json.get("gsb-meta")?.ice||[]).map(([x,y])=>K(x,y)));const ch=chest(id,D.chest[0],D.chest[1],"RARE");
const plates=D.plates.map(([c,r])=>{const[x,y]=C(c,r);return{c,r,img:S.add.image(x,y+2,"pz-plate").setDepth(.8),gl:glow(x,y,.16,9437183,0).setDepth(.81)}});
const blocks=D.blocks.map(([c,r])=>{const[x,y]=C(c,r),img=S.add.image(x,y+T/2+2,"pz-block").setOrigin(.5,1).setDepth(y+T/2),z=zone(c,r,28,24);return{c,r,c0:c,r0:r,img,z,mv:!1}});
const occ=(c,r,me)=>blocks.some(b=>b!==me&&b.c===c&&b.r===r)||SOL.has(K(c,r))&&!blocks.some(b=>b.c===c&&b.r===r);
const place=(b,inst)=>{const[x,y]=C(b.c,b.r);SOL.delete(K(b.__pc??b.c0,b.__pr??b.r0));SOL.add(K(b.c,b.r));b.__pc=b.c;b.__pr=b.r;if(inst){b.img.setPosition(x,y+T/2+2).setDepth(y+T/2);b.z.setPosition(x,y+4);b.z.body.updateFromGameObject()}};
if(done[id]){D.plates.forEach(([c,r],k)=>{blocks[k]&&(blocks[k].c=c,blocks[k].r=r,place(blocks[k],!0))})}
const slide=(b,dx,dy)=>{if(b.mv||done[id])return!1;let c=b.c,r=b.r,n=0;const free=(cc,rr)=>!wall(cc,rr)&&!occ(cc,rr,b);if(!free(c+dx,r+dy))return!1;c+=dx;r+=dy;n=1;while(ICE.has(K(c,r))&&free(c+dx,r+dy)){c+=dx;r+=dy;n++}
const[x,y]=C(c,r);b.mv=!0;SOL.delete(K(b.c,b.r));b.c=c;b.r=r;SOL.add(K(c,r));sfx("sfx-door-locked");S.tweens.add({targets:b.img,x,y:y+T/2+2,duration:70*n+60,ease:n>1?"Quad.easeOut":"Linear",onUpdate:()=>{b.img.setDepth(b.img.y);b.z.setPosition(b.img.x,b.img.y-T/2+2);b.z.body.updateFromGameObject()},onComplete:()=>{b.mv=!1;b.__pc=c;b.__pr=r;b.z.setPosition(x,y+4);b.z.body.updateFromGameObject();S.effectsRef?.burstTinted(x,y+10,15269887,6);check()}});
for(let k=0;k<5;k++){const p=S.add.rectangle(b.img.x+(R()-.5)*20,b.img.y-2,2,2,15269887).setDepth(b.img.y+1);S.tweens.add({targets:p,x:p.x-dx*14,y:p.y-4,alpha:0,duration:380,onComplete:()=>p.destroy()})}return!0};
const check=()=>{let all=!0;for(const p of plates){const on=blocks.some(b=>!b.mv&&b.c===p.c&&b.r===p.r);p.img.setTexture(on?"pz-plate-on":"pz-plate");p.gl.setAlpha(on?.45:0);on&&!p.on&&sfx("sfx-lever");p.on=on;all=all&&on}if(all&&!done[id])solved(id,ch,L3("os blocos de gelo","the ice blocks","los bloques de hielo"))};check();done[id]&&ch.show(!0);
/* pedra de recomeçar */
{const[c,r]=D.reset,[x,y]=C(c,r),o=S.add.image(x,y+T/2,"pz-reset").setOrigin(.5,1).setDepth(y+T/2);zone(c,r,20,18);label(o,()=>done[id]?null:L3("Recomeçar os blocos de gelo","Reset the ice blocks","Reiniciar los bloques de hielo"));o.interact=()=>{for(const b of blocks){if(b.mv)return}for(const b of blocks){SOL.delete(K(b.c,b.r));b.c=b.c0;b.r=b.r0;place(b,!0);S.effectsRef?.burstTinted(b.img.x,b.img.y-12,9437183,10)}sfx("sfx-shrine-use");check()};OBJ.push(o)}
/* empurrar: o herói encosta no bloco e segura a direção */
let hold=0,hb=null;on((t,ms)=>{if(done[id]||S.state!=="playing")return;const p=S.player;if(!p?.body)return;const im=S.inputMgr;let a=im?.axis?.()||{x:0,y:0};const k=im?.keyboardAxis?.()||{x:0,y:0};Math.hypot(k.x,k.y)>Math.hypot(a.x,a.y)&&(a=k);
const px=p.body.center.x,py=p.body.bottom-6;let tgt=null,dx=0,dy=0;if(Math.abs(a.x)>.55&&Math.abs(a.x)>Math.abs(a.y))dx=Math.sign(a.x);else if(Math.abs(a.y)>.55)dy=Math.sign(a.y);
if(dx||dy)for(const b of blocks){const[x,y]=C(b.c,b.r);if(dx&&Math.abs(py-y)<14&&Math.abs(px+dx*22-x)<12||dy&&Math.abs(px-x)<14&&Math.abs(py+dy*20-y)<12){tgt=b;break}}
if(tgt&&tgt===hb){hold+=ms;if(hold>170){hold=-250;slide(tgt,dx,dy)}}else{hb=tgt;hold=0}})}

/* ── 2. espelhos e feixe de luz ── */
{const D=P.mirror,id="mirror",ch=chest(id,D.chest[0],D.chest[1],"RARE");const[sx,sy]=C(...D.source),[tx,ty]=C(...D.target);
const src=S.add.image(sx,sy+T/2,"ice-crystal").setOrigin(.5,1).setDepth(sy+T/2).setTint(11534335);zone(...D.source,20,18);const sg=glow(sx,sy-8,.3,9437183,.55).setDepth(9001);S.tweens.add({targets:sg,alpha:.3,duration:900,yoyo:!0,repeat:-1});lights.push({x:sx,y:sy-8,col:9437183,r:150,i:1.4});
const tgtI=S.add.image(tx,ty+T/2,"ice-crystal").setOrigin(.5,1).setDepth(ty+T/2).setTint(6976640);zone(...D.target,20,18);const tg=glow(tx,ty-8,.32,9437183,0).setDepth(9001);
const mirrors=D.mirrors.map(([c,r,o])=>{const[x,y]=C(c,r),img=S.add.image(x,y+T/2+2,o==="/"?"pz-mirror-a":"pz-mirror-b").setOrigin(.5,1).setDepth(y+T/2);zone(c,r,20,18);const m={c,r,o,img};label(img,()=>done[id]?null:L3("Girar o espelho","Turn the mirror","Girar el espejo"));img.interact=()=>{m.o=m.o==="/"?"\\":"/";img.setTexture(m.o==="/"?"pz-mirror-a":"pz-mirror-b");S.tweens.add({targets:img,scaleX:{from:-.2,to:1},duration:200,ease:"Back.easeOut"});sfx("sfx-ui-tab");beam()};OBJ.push(img);return m});
const bg=S.add.graphics().setDepth(1.2).setBlendMode(ADD);let hit=!1,pts=[];
const beam=()=>{let c=D.source[0],r=D.source[1],dx=1,dy=0;pts=[[sx,sy-10]];hit=!1;for(let n=0;n<70;n++){c+=dx;r+=dy;if(wall(c,r)){const[x,y]=C(c-dx*.5,r-dy*.5);pts.push([x,y-10]);break}if(c===D.target[0]&&r===D.target[1]){pts.push([tx,ty-10]);hit=!0;break}const m=mirrors.find(q=>q.c===c&&q.r===r);if(m){const[x,y]=C(c,r);pts.push([x,y-12]);[dx,dy]=m.o==="/"?[-dy,-dx]:[dy,dx];continue}if(SOL.has(K(c,r))){const[x,y]=C(c-dx*.4,r-dy*.4);pts.push([x,y-10]);break}}
if(hit){tgtI.setTint(14745599);tg.setAlpha(.6);if(!done[id]){solved(id,ch,L3("o feixe de luz","the light beam","el haz de luz"));lights.push({x:tx,y:ty-8,col:9437183,r:160,i:1.6})}}};
on((t)=>{bg.clear();if(pts.length<2)return;const w=.55+.2*Math.sin(t/90);for(const[lw,al,col]of[[7,.18*w,9437183],[3,.55*w,11534335],[1.2,.95,16777215]]){bg.lineStyle(lw,col,al);bg.beginPath();bg.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++)bg.lineTo(pts[k][0],pts[k][1]);bg.strokePath()}if(R()<.3){const q=pts[1+Math.floor(R()*(pts.length-1))],q0=pts[0];const s=S.add.rectangle(q0[0]+(q[0]-q0[0])*R(),q0[1]+(q[1]-q0[1])*R(),1.5,1.5,16777215).setBlendMode(ADD).setDepth(1.3);S.tweens.add({targets:s,y:s.y-6,alpha:0,duration:500,onComplete:()=>s.destroy()})}});
S.time.delayedCall(50,beam);done[id]&&ch.show(!0)}

/* ── 3. alavancas na ordem ── */
{const D=P.levers,id="levers",ch=chest(id,D.chest[0],D.chest[1],"RARE");let seq=[];
const lv=D.pos.map(([c,r],k)=>{const[x,y]=C(c,r),img=S.add.image(x,y,"cx-lever-off").setOrigin(.5,.75).setDepth(y);zone(c,r,18,14);done[id]&&img.setTexture("cx-lever-on");label(img,()=>done[id]||seq.includes(k)?null:L3("Puxar a alavanca","Pull the lever","Tirar de la palanca"));
img.interact=()=>{if(done[id]||seq.includes(k))return;seq.push(k);img.setTexture("cx-lever-on");sfx("sfx-lever");S.effectsRef?.burstTinted(x,y-8,13214282,8);if(seq.length===D.order.length){if(seq.every((v,q)=>v===D.order[q]))solved(id,ch,L3("as alavancas","the levers","las palancas"));else{S.time.delayedCall(500,()=>{sfx("sfx-event-refuse");S.cameraSys?.shake?.(.005,180);S.effectsRef?.floatText(x,y-30,L3("Ordem errada…","Wrong order…","Orden equivocado…"),"#e08a7a");seq=[];lv.forEach(o=>o.setTexture("cx-lever-off"))})}}};OBJ.push(img);return img});
const[c,r]=D.plaque,[x,y]=C(c,r),pl=S.add.image(x,y+T/2,"pz-plaque").setOrigin(.5,1).setDepth(y+T/2);zone(c,r,20,16);label(pl,()=>L3("Ler a lápide","Read the tombstone","Leer la lápida"));
pl.interact=()=>S.game.events.emit("story:show",{title:L3("LÁPIDE CONGELADA","FROZEN TOMBSTONE","LÁPIDA CONGELADA"),lines:[L3("“Primeiro desperta a do meio, que olha a trilha de frente.","“First wake the middle one, that faces the trail.","“Primero despierta la del medio, que mira el sendero de frente."),L3("Depois, a do oeste, voltada para a clareira dos pinheiros.","Then the western one, turned to the pine clearing.","Después, la del oeste, vuelta hacia el claro de los pinos."),L3("Por último, a do leste, que ouve o lago congelado.”","Last, the eastern one, that hears the frozen lake.”","Por último, la del este, que oye el lago congelado.”")]});OBJ.push(pl);done[id]&&ch.show(!0)}

/* ── 4. braseiros ── */
{const D=P.braziers,id="braziers",ch=chest(id,D.chest[0],D.chest[1],"RARE"),BURN=D.burn||9;
const br=D.pos.map(([c,r])=>{const[x,y]=C(c,r),img=S.add.image(x,y+T/2,"pz-brazier").setOrigin(.5,1).setDepth(y+T/2);zone(c,r,20,16);const f=S.add.sprite(x,y+T/2-20,"torch-flame",0).setOrigin(.5,1).setScale(1.25).setDepth(y+T/2+1).setVisible(!1);S.anims.exists("torch-flame-burn")&&f.play("torch-flame-burn");const g=glow(x,y-6,.5,16750130,0).setDepth(9001),L={x,y:y-10,col:16758116,r:150,i:0,warm:1};lights.push(L);
const b={img,f,g,L,t:0};label(img,()=>done[id]||b.t>0?null:L3("Acender o braseiro","Light the brazier","Encender el brasero"));img.interact=()=>{if(done[id]||b.t>0)return;b.t=BURN;sfx("sfx-mage-fireball");S.effectsRef?.burstTinted(x,y-14,16750130,12);check()};OBJ.push(img);return b});
const set=(b,on,k=1)=>{b.f.setVisible(on).setScale(1.25*k);b.g.setAlpha(on?.42*k:0);b.L.i=on?1.8*k:0};
const check=()=>{if(br.every(b=>b.t>0)&&!done[id]){solved(id,ch,L3("os braseiros","the braziers","los braseros"))}};
if(done[id]){br.forEach(b=>{b.t=1e9;set(b,!0)});ch.show(!0)}
on((t,ms)=>{for(const b of br){if(done[id]){set(b,!0,1+.05*Math.sin(t/120));continue}if(b.t>0){b.t-=ms/1e3;if(b.t<=0){b.t=0;set(b,!1);S.effectsRef?.burstTinted(b.img.x,b.img.y-20,7368816,6)}else{const k=b.t<3?.45+.55*(b.t/3)*(.8+.2*Math.sin(t/60)):1;set(b,!0,k)}}}})}

/* ── Relicário Congelado: os quatro selos da floresta libertam o Coração do Inverno ── */
{const D=P.relic,SEALS=[["ice",8384511,L3("Selo do Gelo","Seal of Ice","Sello del Hielo"),L3("os blocos de gelo do Lago Congelado","the ice blocks of the Frozen Lake","los bloques de hielo del Lago Congelado")],
["mirror",16769658,L3("Selo da Luz","Seal of Light","Sello de la Luz"),L3("os espelhos da Clareira dos Pinheiros","the mirrors of the Pine Clearing","los espejos del Claro de los Pinos")],
["levers",13161184,L3("Selo do Ferro","Seal of Iron","Sello del Hierro"),L3("as alavancas da Trilha Nevada","the levers of the Snowy Trail","las palancas del Sendero Nevado")],
["braziers",16750154,L3("Selo do Fogo","Seal of Fire","Sello del Fuego"),L3("os braseiros do Bosque Gélido","the braziers of the Icy Grove","los braseros del Bosque Gélido")]];
const[x,yc]=C(...D.pos),y=yc+T/2,cnt=()=>SEALS.filter(q=>done[q[0]]).length;
const base=S.add.image(x,y,"pz-relic").setOrigin(.5,1).setDepth(y);{const z=S.add.zone(x,y-10,56,18);S.physics.add.existing(z,!0);solids.add(z);SOL.add(K(D.pos[0],D.pos[1]))}
const heart=S.add.image(x,y-66,"pz-heart").setDepth(y+.5).setScale(1.2),hg=glow(x,y-66,.32,9437183,.35).setDepth(y+.45);S.tweens.add({targets:[heart,hg],y:"-=5",duration:1300,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"});
const ice=S.add.image(x,y-38,"pz-relic-ice").setOrigin(.5,1).setDepth(y+1).setAlpha(.88).setScale(.78);const L={x,y:y-44,col:9437183,r:150,i:.7};lights.push(L);
const gems=SEALS.map((q,k)=>{const gx=x-14+k*12-4+4,gy=y-23;return{q,g:S.add.image(gx,gy,"pz-gem").setDepth(y+.6).setTint(3815994),gl:glow(gx,gy,.1,q[1],0).setDepth(y+.65),on:!1}});
const drop=()=>{const it=S.lootSystem?.makeItem?.("winter_heart","LEGENDARY",0);it&&S.lootSystem.spawnItem(x,y+20,it)};
const opened=()=>{ice.setVisible(!1);heart.setVisible(!1);hg.setVisible(!1);L.i=1.2};
if(done.relic){opened();!done.relic_got&&!__gsHasHeart(S)&&S.time.delayedCall(600,drop)}
let prev=-1;const paint=()=>{const c=cnt();for(const G of gems){const on=!!done[G.q[0]];if(on&&!G.on){G.g.setTint(G.q[1]);G.gl.setAlpha(.55);if(prev>=0){S.effectsRef?.burstTinted(G.g.x,G.g.y,G.q[1],14);S.effectsRef?.shockwaveRing?.(G.g.x,G.g.y,18)}}G.on=on}
if(prev>=0&&c>prev&&!done.relic){S.time.delayedCall(1900,()=>{banner(L3("SELO DESPERTO NO RELICÁRIO ","SEAL AWAKENED AT THE RELIQUARY ","SELLO DESPERTADO EN EL RELICARIO ")+c+"/4","#bff4ff");sfx("sfx-shrine-use");if(c===4)S.time.delayedCall(1600,()=>S.game.events.emit("story:show",{title:L3("OS QUATRO SELOS","THE FOUR SEALS","LOS CUATRO SELLOS"),lines:[L3("Gelo, luz, ferro e fogo brilham ao mesmo tempo.","Ice, light, iron and fire shine at once.","Hielo, luz, hierro y fuego brillan a la vez."),L3("No Bosque Gélido, o cristal do Relicário começa a rachar…","In the Icy Grove, the Reliquary's crystal starts to crack…","En el Bosque Gélido, el cristal del Relicario empieza a agrietarse…")]}))})}
if(c===4&&!done.relic&&!ice.__crk){ice.__crk=1;S.tweens.add({targets:ice,alpha:.7,duration:700,yoyo:!0,repeat:-1});L.i=1.4}prev=c;
if(done.relic&&!done.relic_got&&__gsHasHeart(S)){done.relic_got=1;save()}};paint();S.time.addEvent({delay:300,loop:!0,callback:paint});
label(base,()=>done.relic?null:cnt()<4?L3("Examinar o Relicário Congelado","Examine the Frozen Reliquary","Examinar el Relicario Congelado")+" ("+cnt()+"/4)":L3("Libertar o Relicário","Free the Reliquary","Liberar el Relicario"));
base.interact=()=>{if(done.relic)return;const c=cnt();if(c<4){S.game.events.emit("story:show",{title:L3("RELICÁRIO CONGELADO","FROZEN RELIQUARY","RELICARIO CONGELADO"),lines:[L3("Um coração de gelo pulsa preso no cristal. Quatro encaixes cercam o pedestal.","A heart of ice beats trapped in the crystal. Four sockets ring the pedestal.","Un corazón de hielo late atrapado en el cristal. Cuatro engastes rodean el pedestal."),...SEALS.map(q=>(done[q[0]]?"✔  ":"◇  ")+q[2]+" — "+q[3]),L3(c+" de 4 selos despertos.",c+" of 4 seals awakened.",c+" de 4 sellos despertados.")]});return}
done.relic=1;save();sfx("sfx-secret-reveal");S.cameraSys?.shake?.(.006,700);ice.__crk&&S.tweens.killTweensOf(ice);ice.setAlpha(.95);
S.tweens.add({targets:ice,x:{from:x-2,to:x+2},duration:45,yoyo:!0,repeat:8,onComplete:()=>{ice.setVisible(!1);S.cameras.main.flash(260,200,236,255);S.effectsRef?.burstTinted(x,y-40,9437183,34);S.effectsRef?.shockwaveRing?.(x,y-20,70);sfx("sfx-relic-drop");
for(let k=0;k<30;k++){const r=S.add.rectangle(x+(R()-.5)*54,y-40-R()*70,2+R()*5,5+R()*10,[15269887,11534335,14745599,16777215][k%4]).setDepth(y+2).setRotation(R()*6).setAlpha(.9);S.tweens.add({targets:r,x:r.x+(R()-.5)*190,y:r.y+40+R()*50,rotation:r.rotation+(R()-.5)*8,alpha:0,duration:700+R()*600,ease:"Quad.easeOut",onComplete:()=>r.destroy()})}
L.i=1.4;S.tweens.add({targets:[heart,hg],y:y-96,alpha:0,duration:700,delay:250,ease:"Quad.easeIn",onComplete:()=>{heart.setVisible(!1);hg.setVisible(!1);drop()}});
banner(L3("RELICÁRIO LIBERTADO","RELIQUARY FREED","RELICARIO LIBERADO"),"#bff4ff");
S.time.delayedCall(1700,()=>S.game.events.emit("story:show",{title:L3("CORAÇÃO DO INVERNO","HEART OF WINTER","CORAZÓN DEL INVIERNO"),lines:[L3("Frio como a neve, mas bate como um coração vivo.","Cold as snow, yet it beats like a living heart.","Frío como la nieve, pero late como un corazón vivo."),L3("As runas do Portão Congelado vão reconhecê-lo.","The runes of the Frozen Gate will recognize it.","Las runas de la Puerta Congelada lo reconocerán.")]}))}})};
OBJ.push(base);(S.__gsDbg??={}).relic={cnt,done:()=>done}}

/* ── 5. runas da memória (Portão Congelado) — só despertam com o Coração do Inverno ── */
{const D=P.runes,id="runes",ch=chest(id,D.chest[0],D.chest[1],"EPIC"),FR=[392,494,587,740],COL=[8384511,13146111,16765802,9105062];let st="idle",seq=[],inp=0,round=0;const LEN=[3,4,5];
const pil=D.pos.map(([c,r],k)=>{const[x,y]=C(c,r),img=S.add.image(x,y+T/2,"pz-pillar-"+k).setOrigin(.5,1).setDepth(y+T/2);zone(c,r,18,14);const g=glow(x,y-20,.34,COL[k],done[id]?.35:0).setDepth(9001),L={x,y:y-20,col:COL[k],r:130,i:done[id]?1:0};lights.push(L);
const flash=()=>{g.setAlpha(.8);L.i=2.2;tone(FR[k]);S.tweens.add({targets:g,alpha:done[id]?.35:0,duration:520,onUpdate:()=>{L.i=g.alpha*2.6}})};
label(img,()=>done[id]||st==="show"?null:!__gsHasHeart(S)?L3("Examinar a runa adormecida","Examine the dormant rune","Examinar la runa dormida"):st==="idle"?L3("Tocar a runa (começar)","Touch the rune (start)","Tocar la runa (empezar)"):L3("Tocar a runa","Touch the rune","Tocar la runa"));
img.interact=()=>{if(done[id]||st==="show")return;if(!__gsHasHeart(S)){sfx("sfx-door-locked");S.game.events.emit("story:show",{title:L3("RUNAS ADORMECIDAS","DORMANT RUNES","RUNAS DORMIDAS"),lines:[L3("As quatro runas estão frias e mudas.","The four runes are cold and silent.","Las cuatro runas están frías y mudas."),L3("No centro do círculo há um encaixe em forma de coração… coberto de geada.","In the middle of the circle there is a heart-shaped socket… covered in frost.","En el centro del círculo hay un engaste con forma de corazón… cubierto de escarcha."),L3("Talvez algo na floresta lá fora as desperte.","Perhaps something in the forest outside can wake them.","Quizás algo en el bosque de afuera las despierte.")]});return}if(st==="idle"){round=0;play();return}flash();if(k!==seq[inp]){st="show";S.time.delayedCall(300,()=>{sfx("sfx-event-refuse");S.cameraSys?.shake?.(.005,180);S.effectsRef?.floatText(x,y-40,L3("A sequência se desfez…","The sequence broke…","La secuencia se rompió…"),"#e08a7a");st="idle"});return}inp++;if(inp>=seq.length){st="show";round++;if(round>=LEN.length){S.time.delayedCall(450,()=>{st="done";solved(id,ch,L3("as runas da memória","the memory runes","las runas de la memoria"));pil.forEach(p=>p.flash())})}else S.time.delayedCall(900,play)}};OBJ.push(img);return{flash,img}});
const nap=()=>{const aw=done[id]||__gsHasHeart(S);for(const q of pil)aw?q.img.clearTint():q.img.setTint(8423568)};nap();S.time.addEvent({delay:400,loop:!0,callback:nap});
(S.__gsDbg??={}).runes={st:()=>st,seq:()=>seq,imgs:()=>OBJ.filter(o=>/^pz-pillar/.test(o.texture?.key||""))};const play=()=>{st="show";seq=Array.from({length:LEN[round]},()=>Math.floor(R()*4));inp=0;seq.forEach((k,q)=>S.time.delayedCall(450+q*620,()=>pil[k].flash()));S.time.delayedCall(450+seq.length*620,()=>{st="input"})};done[id]&&ch.show(!0)}

/* objetos interativos entram na lista do calabouço depois que ele termina de montar */
S.time.delayedCall(0,()=>{const L=S.dungeon?.objects;if(L)for(const o of OBJ)L.includes(o)||L.push(o)});
/* falas do herói ao chegar perto de um enigma ainda não resolvido (uma vez por enigma a cada entrada no mapa) */
{const BK=[["ice",P.ice.blocks[0]],["mirror",P.mirror.source],["levers",P.levers.plaque],["braziers",P.braziers.pos[0]],["relic",P.relic.pos],["runes",P.runes.pos[0]]],said=S.__gsSaid??=new Set,
LN=[["Algum tipo de segredo existe aqui…","Some kind of secret lies here…","Algún tipo de secreto existe aquí…"],["Parece um novo quebra-cabeça.","Looks like a new puzzle.","Parece un nuevo rompecabezas."],["Hm… isso não está aqui por acaso.","Hm… this isn't here by chance.","Hm… esto no está aquí por casualidad."],["Tem algo escondido por aqui.","Something is hidden around here.","Hay algo escondido por aquí."],["Um enigma… vamos ver o que ele guarda.","A riddle… let's see what it guards.","Un enigma… veamos qué guarda."]];
let busy=0,last=-1;const say=t=>{const p=S.player;if(!p)return;const tx=S.add.text(0,0,t,{fontFamily:"Georgia, 'Times New Roman', serif",fontStyle:"italic",fontSize:"13px",color:"#1d2433",align:"center",wordWrap:{width:190}}).setOrigin(.5),w=tx.width+18,h=tx.height+10,bg=S.add.graphics();
bg.fillStyle(15660798,.94).lineStyle(1.5,4877680,.9).fillRoundedRect(-w/2,-h/2,w,h,7).strokeRoundedRect(-w/2,-h/2,w,h,7).fillStyle(15660798,.94).fillTriangle(-6,h/2-1,6,h/2-1,0,h/2+7).lineStyle(1.5,4877680,.9).lineBetween(-6,h/2,0,h/2+7).lineBetween(6,h/2,0,h/2+7);
const box=S.add.container(p.x,p.y-74-h/2,[bg,tx]).setDepth(9600).setAlpha(0).setScale(.85),fol=()=>{const q=S.player;q&&box.active&&box.setPosition(q.x,q.y-74-h/2)};S.events.on("update",fol);busy=1;
S.tweens.add({targets:box,alpha:1,scale:1,duration:220,ease:"Back.easeOut"});S.time.delayedCall(3200,()=>S.tweens.add({targets:box,alpha:0,duration:350,onComplete:()=>{S.events.off("update",fol);box.destroy();busy=0}}))};
(S.__gsDbg??={}).say=say;const chk=()=>{const p=S.player;if(!p||busy||!S.sys.isActive())return;for(const[id,cr]of BK){if(done[id]||said.has(id))continue;const[x,y]=C(cr[0],cr[1]);if(Math.hypot(p.x-x,p.y-y)<T*4.5){said.add(id);let k=said.size-1;if(k>1)do k=Math.floor(R()*LN.length);while(k===last);last=k;say(L3(...LN[k]));break}}};
S.__gsBarkEv?.remove?.();const ev=S.__gsBarkEv=S.time.addEvent({delay:250,loop:!0,callback:chk});S.events.once("shutdown",()=>{ev.remove();S.__gsSaid=null;S.__gsBarkEv=null})}
__gsLit(S);S.__gsPZ={done};const host=S.add.zone(-99,-99,1,1);return host}

/* ── luz com normal maps + sombras dinâmicas ── */
function __nmGen(src){const w=src.width,h=src.height,c=document.createElement("canvas");c.width=w;c.height=h;const x=c.getContext("2d");x.drawImage(src,0,0);const D=x.getImageData(0,0,w,h),d=D.data,N=w*h,A=new Float32Array(N),Lm=new Float32Array(N);for(let i=0;i<N;i++){A[i]=d[i*4+3]/255;Lm[i]=(d[i*4]*.3+d[i*4+1]*.59+d[i*4+2]*.11)/255}
const blur=(S,r)=>{const Tm=new Float32Array(N),O=new Float32Array(N);for(let y=0;y<h;y++){let s=0;for(let k=-r;k<=r;k++)s+=S[y*w+Math.min(w-1,Math.max(0,k))];for(let q=0;q<w;q++){Tm[y*w+q]=s/(2*r+1);s+=S[y*w+Math.min(w-1,q+r+1)]-S[y*w+Math.max(0,q-r)]}}for(let q=0;q<w;q++){let s=0;for(let k=-r;k<=r;k++)s+=Tm[Math.min(h-1,Math.max(0,k))*w+q];for(let y=0;y<h;y++){O[y*w+q]=s/(2*r+1);s+=Tm[Math.min(h-1,y+r+1)*w+q]-Tm[Math.max(0,y-r)*w+q]}}return O};
const B=blur(blur(A,2),2),H=new Float32Array(N);for(let i=0;i<N;i++)H[i]=B[i]+Lm[i]*.45*A[i];const out=x.createImageData(w,h),o=out.data,k=2.4;
for(let y=0;y<h;y++)for(let q=0;q<w;q++){const i=y*w+q,l=H[y*w+Math.max(0,q-1)],r=H[y*w+Math.min(w-1,q+1)],u=H[Math.max(0,y-1)*w+q],dn=H[Math.min(h-1,y+1)*w+q];let nx=-(r-l)*k,ny=(dn-u)*k,nz=1;const m=Math.hypot(nx,ny,nz);o[i*4]=(nx/m*.5+.5)*255;o[i*4+1]=(ny/m*.5+.5)*255;o[i*4+2]=(nz/m*.5+.5)*255;o[i*4+3]=255}x.putImageData(out,0,0);return c}
function __gsLit(S){if(S.__gsLitOn||!S.lights)return;S.__gsLitOn=1;const LM=S.lights,M=S.cache.json.get("gsb-meta")||{},R=Math.random;try{LM.enable();LM.setAmbientColor(11847888)}catch(e){return}
const pool=[];for(let k=0;k<8;k++)pool.push(LM.addLight(0,0,10,16777215,0));const sky=pool[0];
const lamps=(M.lamps||[]).map(([x,y])=>({x,y,col:16758116,r:170,i:2,warm:1}));
const done=window.__nmDone||(window.__nmDone=new Set),queue=[],lit=new WeakSet,shadows=new Map;
const want=k=>/^(mk3e-|mk4b-|mk4-|pv-|gear-|weapon-)/.test(k||"");
const track=o=>{if(!o||!o.texture||lit.has(o))return;const k=o.texture.key;if(!want(k))return;if(!done.has(k)){queue.includes(k)||queue.push(k);return}try{o.setLighting(!0)}catch(e){}lit.add(o)};
let acc=0,acc2=0;const upd=(t,ms)=>{try{upd0(t,ms)}catch(e){window.__gsErr=String(e&&e.stack||e)}},upd0=(t,ms)=>{const p=S.player;if(!p||!S.sys.isActive())return;acc+=ms;acc2+=ms;
if(queue.length&&acc2>120){acc2=0;const k=queue.shift();try{const Tx=S.textures.get(k),src=Tx.getSourceImage();src&&src.width&&Tx.setDataSource(__nmGen(src))}catch(e){}done.add(k)}
if(acc>200){acc=0;const pv=S.playerVisual?.container;const walk=L=>{for(const o of L||[]){o.list?walk(o.list):track(o)}};walk(pv?.list);for(const e of S.enemies?.getChildren?.()||[]){track(e);e.list&&walk(e.list)}}
/* luzes: céu frio + as mais próximas do herói */
const inC=p.y<((M.row0||49)-1)*dt;if(S.__gsAmb!==inC){S.__gsAmb=inC;try{LM.setAmbientColor(inC?15265528:11847888)}catch(e){}}sky.x=p.x-260;sky.y=p.y-320;sky.radius=900;sky.__c!==1&&(sky.__c=1,sky.setColor?.(10467583));sky.intensity=.9;
const src=[...lamps,...(S.__gsLights||[]).filter(l=>l.i>0),...(S.lighting?.lights||[]).filter(l=>l.x&&l.y).map(l=>({x:l.x,y:l.y,col:l.color||16750130,r:(l.radius||100)*1.3,i:1.6*(l.intensity||1),warm:1}))].map(l=>({...l,d:Math.hypot(l.x-p.x,l.y-p.y)})).filter(l=>l.d<520).sort((a,b)=>a.d-b.d).slice(0,pool.length-1);
for(let k=1;k<pool.length;k++){const L=pool[k],s=src[k-1];if(!s){L.intensity=0;continue}L.x=s.x;L.y=s.y;L.radius=s.r;const c=s.col;L.__c!==c&&(L.__c=c,L.setColor?.(c));L.intensity=s.i*(s.warm?1+.08*Math.sin(t/70+k*1.7)+.05*Math.sin(t/23+k):1)}
/* sombras dinâmicas: silhueta achatada que se afasta da luz mais próxima */
const actors=[];const body=S.playerVisual?.container?.list?.find?.(o=>o.type==="Sprite"&&o.visible&&/^mk/.test(o.texture?.key||""));body&&actors.push([body,p,S.playerVisual.container]);for(const e of S.enemies?.getChildren?.()||[])e.active&&!e.dead&&e.visible&&e.type==="Sprite"&&Math.abs(e.y-p.y)<420&&actors.push([e,e,null]);
const seen=new Set;for(const[spr,ent,cont]of actors){seen.add(spr);let sh=shadows.get(spr);if(!sh){sh=S.add.sprite(0,0,spr.texture.key,spr.frame.name).setTint(1708336).setTintMode(1).setAlpha(0);shadows.set(spr,sh)}
sh.setTexture(spr.texture.key,spr.frame.name).setFlipX(cont?spr.flipX!==(cont.scaleX<0):spr.flipX);const fx=ent.body?ent.body.center.x:ent.x,fy=ent.body?ent.body.bottom:ent.y+12;let near=null;for(const l of src)if(l.d!=null&&Math.hypot(l.x-fx,l.y-fy)<230){near=l;break}
let dx=.55,dy=.83,a=.26;if(near){const vx=fx-near.x,vy=fy-near.y,m=Math.hypot(vx,vy)||1;dx=vx/m;dy=vy/m;a=Math.min(.42,.18+60/m)}
const sc=(cont?Math.abs(cont.scaleX):1)*Math.abs(spr.scaleX||1),sy=(cont?Math.abs(cont.scaleY):1)*Math.abs(spr.scaleY||1);sh.setOrigin(spr.originX,spr.originY>.5?spr.originY:1).setPosition(fx,fy-1).setScale(sc,-sy*.5).setRotation(Math.atan2(-dx,dy)).setAlpha(a).setDepth((cont?cont.depth:spr.depth)-.6)}
for(const[spr,sh]of shadows)if(!seen.has(spr)){sh.destroy();shadows.delete(spr)}};
S.events.on("update",upd);S.events.once("shutdown",()=>{S.events.off("update",upd);for(const sh of shadows.values())sh.destroy();shadows.clear()})}
