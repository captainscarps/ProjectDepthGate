/* ── Cidadela Glacial: enigmas + luz realista nos personagens ─────────────────────────────────────
   Enigmas (opcionais, cada um libera um baú):
     1. Lago Congelado: blocos de gelo que deslizam + placas de pressão (só o peso do bloco aciona)
     2. Clareira dos Pinheiros: espelhos de gelo levando o feixe de luz do cristal até o cristal-alvo
     3. Clareira: três alavancas na ordem certa (dica na lápide)
     4. Bosque Gélido: quatro braseiros acesos ao mesmo tempo (cada um apaga sozinho)
     5. Portão Congelado: quatro runas — repetir a sequência de luzes e sons (memória)
   Luz: normal maps gerados na hora a partir dos sprites (herói e inimigos), luzes do Phaser nos lampiões,
   tochas, braseiros e cristais + uma luz fria de céu; sombras dinâmicas que se afastam da luz mais próxima.
   O estado dos enigmas fica salvo por slot (localStorage depthgate:gspz:<slot>).                    */
function __gsTex(S){if(S.textures.exists("pz-block"))return;const mk=(k,w,h,f)=>{const t=S.textures.createCanvas(k,w,h),g=t.getContext();f(g,w,h);t.refresh()};
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
/* pilares de runa (4 cores) */
const RC=["#7fe8ff","#c89bff","#ffd36a","#8af2a6"];
RC.forEach((col,i)=>mk("pz-pillar-"+i,24,52,g=>{g.fillStyle="rgba(10,20,40,.4)";g.beginPath();g.ellipse(12,49,11,3,0,0,7);g.fill();g.fillStyle=grad(g,0,0,24,0,[[0,"#56606e"],[.4,"#a3adba"],[1,"#4a5361"]]);g.beginPath();g.moveTo(4,48);g.lineTo(6,8);g.lineTo(12,2);g.lineTo(18,8);g.lineTo(20,48);g.closePath();g.fill();g.fillStyle="#eef8ff";g.fillRect(8,5,8,3);g.strokeStyle=col;g.lineWidth=1.6;g.beginPath();
if(i===0){g.moveTo(12,16);g.lineTo(12,34);g.moveTo(8,20);g.lineTo(16,28)}else if(i===1){g.moveTo(9,16);g.lineTo(15,25);g.lineTo(9,34)}else if(i===2){g.arc(12,25,6,0,6.3);g.moveTo(12,17);g.lineTo(12,33)}else{g.moveTo(8,18);g.lineTo(16,18);g.lineTo(8,32);g.lineTo(16,32)}g.stroke();g.fillStyle="#2a3140";g.fillRect(4,44,16,4)}))}

function __gsPuzzles(S,def,solids){__gsTex(S);__leverTex(S);const T=dt,L3=__L3,R=Math.random,ADD=j.BlendModes.ADD,C=(c,r)=>[c*T+T/2,r*T+T/2],K=(c,r)=>c+","+r,P=__GSPZ_DEF;
const slot=S.game.registry.get("save:slot")??1,KEY="depthgate:gspz:"+slot;let done={};try{done=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){}const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(done))}catch(e){}};
const OBJ=[],SOL=new Set,sfx=k=>S.game.audioEngine?.sfx?.(k),banner=(t,c)=>S.game.events.emit("ui:banner",t,c||"#8ae0ff"),wall=(c,r)=>{const D=S.dungeon;return!D||D.isWallTile(c,r)};
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
let hold=0,hb=null;S.events.on("update",(t,ms)=>{if(done[id]||S.state!=="playing")return;const p=S.player;if(!p?.body)return;const im=S.inputMgr;let a=im?.axis?.()||{x:0,y:0};const k=im?.keyboardAxis?.()||{x:0,y:0};Math.hypot(k.x,k.y)>Math.hypot(a.x,a.y)&&(a=k);
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
S.events.on("update",(t)=>{bg.clear();if(pts.length<2)return;const w=.55+.2*Math.sin(t/90);for(const[lw,al,col]of[[7,.18*w,9437183],[3,.55*w,11534335],[1.2,.95,16777215]]){bg.lineStyle(lw,col,al);bg.beginPath();bg.moveTo(pts[0][0],pts[0][1]);for(let k=1;k<pts.length;k++)bg.lineTo(pts[k][0],pts[k][1]);bg.strokePath()}if(R()<.3){const q=pts[1+Math.floor(R()*(pts.length-1))],q0=pts[0];const s=S.add.rectangle(q0[0]+(q[0]-q0[0])*R(),q0[1]+(q[1]-q0[1])*R(),1.5,1.5,16777215).setBlendMode(ADD).setDepth(1.3);S.tweens.add({targets:s,y:s.y-6,alpha:0,duration:500,onComplete:()=>s.destroy()})}});
S.time.delayedCall(50,beam);done[id]&&ch.show(!0)}

/* ── 3. alavancas na ordem ── */
{const D=P.levers,id="levers",ch=chest(id,D.chest[0],D.chest[1],"RARE");let seq=[];
const lv=D.pos.map(([c,r],k)=>{const[x,y]=C(c,r),img=S.add.image(x,y,"cx-lever-off").setOrigin(.5,.75).setDepth(y);zone(c,r,18,14);done[id]&&img.setTexture("cx-lever-on");label(img,()=>done[id]||seq.includes(k)?null:L3("Puxar a alavanca","Pull the lever","Tirar de la palanca"));
img.interact=()=>{if(done[id]||seq.includes(k))return;seq.push(k);img.setTexture("cx-lever-on");sfx("sfx-lever");S.effectsRef?.burstTinted(x,y-8,13214282,8);if(seq.length===D.order.length){if(seq.every((v,q)=>v===D.order[q]))solved(id,ch,L3("as alavancas","the levers","las palancas"));else{S.time.delayedCall(500,()=>{sfx("sfx-event-refuse");S.cameraSys?.shake?.(.005,180);S.effectsRef?.floatText(x,y-30,L3("Ordem errada…","Wrong order…","Orden equivocado…"),"#e08a7a");seq=[];lv.forEach(o=>o.setTexture("cx-lever-off"))})}}};OBJ.push(img);return img});
const[c,r]=D.plaque,[x,y]=C(c,r),pl=S.add.image(x,y+T/2,"pz-plaque").setOrigin(.5,1).setDepth(y+T/2);zone(c,r,20,16);label(pl,()=>L3("Ler a lápide","Read the tombstone","Leer la lápida"));
pl.interact=()=>S.game.events.emit("story:show",{title:L3("LÁPIDE CONGELADA","FROZEN TOMBSTONE","LÁPIDA CONGELADA"),lines:[L3("“Primeiro desperta quem dorme junto ao muro do oeste.","“First wake the one who sleeps by the western wall.","“Primero despierta a quien duerme junto al muro del oeste."),L3("Depois, a que vigia o norte, onde o cristal enxerga.","Then the one watching the north, where the crystal sees.","Después, la que vigila el norte, donde el cristal ve."),L3("Por último, a do sul, que ouve o lago dos espelhos.”","Last, the one in the south, that hears the lake of mirrors.”","Por último, la del sur, que oye el lago de los espejos.”")]});OBJ.push(pl);done[id]&&ch.show(!0)}

/* ── 4. braseiros ── */
{const D=P.braziers,id="braziers",ch=chest(id,D.chest[0],D.chest[1],"RARE"),BURN=D.burn||9;
const br=D.pos.map(([c,r])=>{const[x,y]=C(c,r),img=S.add.image(x,y+T/2,"pz-brazier").setOrigin(.5,1).setDepth(y+T/2);zone(c,r,20,16);const f=S.add.sprite(x,y+T/2-20,"torch-flame",0).setOrigin(.5,1).setScale(1.25).setDepth(y+T/2+1).setVisible(!1);S.anims.exists("torch-flame-burn")&&f.play("torch-flame-burn");const g=glow(x,y-6,.5,16750130,0).setDepth(9001),L={x,y:y-10,col:16758116,r:150,i:0,warm:1};lights.push(L);
const b={img,f,g,L,t:0};label(img,()=>done[id]||b.t>0?null:L3("Acender o braseiro","Light the brazier","Encender el brasero"));img.interact=()=>{if(done[id]||b.t>0)return;b.t=BURN;sfx("sfx-mage-fireball");S.effectsRef?.burstTinted(x,y-14,16750130,12);check()};OBJ.push(img);return b});
const set=(b,on,k=1)=>{b.f.setVisible(on).setScale(1.25*k);b.g.setAlpha(on?.42*k:0);b.L.i=on?1.8*k:0};
const check=()=>{if(br.every(b=>b.t>0)&&!done[id]){solved(id,ch,L3("os braseiros","the braziers","los braseros"))}};
if(done[id]){br.forEach(b=>{b.t=1e9;set(b,!0)});ch.show(!0)}
S.events.on("update",(t,ms)=>{for(const b of br){if(done[id]){set(b,!0,1+.05*Math.sin(t/120));continue}if(b.t>0){b.t-=ms/1e3;if(b.t<=0){b.t=0;set(b,!1);S.effectsRef?.burstTinted(b.img.x,b.img.y-20,7368816,6)}else{const k=b.t<3?.45+.55*(b.t/3)*(.8+.2*Math.sin(t/60)):1;set(b,!0,k)}}}})}

/* ── 5. runas da memória (Portão Congelado) ── */
{const D=P.runes,id="runes",ch=chest(id,D.chest[0],D.chest[1],"EPIC"),FR=[392,494,587,740],COL=[8384511,13146111,16765802,9105062];let st="idle",seq=[],inp=0,round=0;const LEN=[3,4,5];
const pil=D.pos.map(([c,r],k)=>{const[x,y]=C(c,r),img=S.add.image(x,y+T/2,"pz-pillar-"+k).setOrigin(.5,1).setDepth(y+T/2);zone(c,r,18,14);const g=glow(x,y-20,.34,COL[k],done[id]?.35:0).setDepth(9001),L={x,y:y-20,col:COL[k],r:130,i:done[id]?1:0};lights.push(L);
const flash=()=>{g.setAlpha(.8);L.i=2.2;tone(FR[k]);S.tweens.add({targets:g,alpha:done[id]?.35:0,duration:520,onUpdate:()=>{L.i=g.alpha*2.6}})};
label(img,()=>done[id]||st==="show"?null:st==="idle"?L3("Tocar a runa (começar)","Touch the rune (start)","Tocar la runa (empezar)"):L3("Tocar a runa","Touch the rune","Tocar la runa"));
img.interact=()=>{if(done[id]||st==="show")return;if(st==="idle"){round=0;play();return}flash();if(k!==seq[inp]){st="show";S.time.delayedCall(300,()=>{sfx("sfx-event-refuse");S.cameraSys?.shake?.(.005,180);S.effectsRef?.floatText(x,y-40,L3("A sequência se desfez…","The sequence broke…","La secuencia se rompió…"),"#e08a7a");st="idle"});return}inp++;if(inp>=seq.length){st="show";round++;if(round>=LEN.length){S.time.delayedCall(450,()=>{st="done";solved(id,ch,L3("as runas da memória","the memory runes","las runas de la memoria"));pil.forEach(p=>p.flash())})}else S.time.delayedCall(900,play)}};OBJ.push(img);return{flash}});
(S.__gsDbg??={}).runes={st:()=>st,seq:()=>seq,imgs:()=>OBJ.filter(o=>/^pz-pillar/.test(o.texture?.key||""))};const play=()=>{st="show";seq=Array.from({length:LEN[round]},()=>Math.floor(R()*4));inp=0;seq.forEach((k,q)=>S.time.delayedCall(450+q*620,()=>pil[k].flash()));S.time.delayedCall(450+seq.length*620,()=>{st="input"})};done[id]&&ch.show(!0)}

/* objetos interativos entram na lista do calabouço depois que ele termina de montar */
S.time.delayedCall(0,()=>{const L=S.dungeon?.objects;if(L)for(const o of OBJ)L.includes(o)||L.push(o)});
/* falas do herói ao chegar perto de um enigma ainda não resolvido (uma vez por enigma a cada entrada no mapa) */
{const BK=[["ice",P.ice.blocks[0]],["mirror",P.mirror.source],["levers",P.levers.plaque],["braziers",P.braziers.pos[0]],["runes",P.runes.pos[0]]],said=S.__gsSaid??=new Set,
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
