/* ── Prólogo do Rio da Floresta (antes da Floresta de Eldervale) ─────────────────────────────────────
   Depois do vídeo de abertura da campanha o herói chega de barco por um lago e um rio no meio da mata:
     1. remando (o herói não aparece, só o barco) pelo lago e pelo rio sinuoso
     2. no píer da clareira aparece "Desembarcar"; o herói desce e explora a clareira
     3. um barco naufragado na margem e uma estátua antiga contam um pouco da história
     4. a trilha entre as árvores leva à Floresta de Eldervale (fase normal)
   A Guardiã narra o caminho (voz em scripts/voice_extra_lines.json). Botão "Pular prólogo" sempre visível.
   Mapa assado: assets/pixel-art/river-prologue (scripts/build_river_prologue.py), mesmo padrão do Bosque
   Amaldiçoado. Do pacote Arctic Viking só o barco (assets/pixel-art/arctic).                          */
function __arcLines(){const L=__L3;return[
 L("Desperte, viajante. O rio te trouxe mais longe do que qualquer barco deveria ir.","Wake, traveler. The river carried you farther than any boat should go.","Despierta, viajero. El río te trajo más lejos de lo que cualquier barco debería ir."),
 L("A floresta se lembra de quem cruzou antes de você. Siga a correnteza.","The forest remembers those who crossed before you. Follow the current.","El bosque recuerda a quienes cruzaron antes que tú. Sigue la corriente."),
 L("Estas águas já marcaram a fronteira dos Antigos. Poucos ousaram cruzá-la.","These waters once marked the border of the Ancients. Few dared to cross it.","Estas aguas marcaron la frontera de los Antiguos. Pocos se atrevieron a cruzarla."),
 L("Ali, a margem. Daqui em diante, você caminha.","There, the shore. From here on, you walk.","Allí, la orilla. De aquí en adelante, caminas."),
 L("Ouça a floresta. É a última voz sincera antes das Profundezas.","Listen to the forest. It is the last honest voice before the Depths.","Escucha el bosque. Es la última voz sincera antes de las Profundidades."),
 L("Outro barco, outro viajante. Nem todos chegaram até mim.","Another boat, another traveler. Not all of them reached me.","Otro barco, otro viajero. No todos llegaron hasta mí."),
 L("Esta estátua assistiu à primeira selagem. Logo você vai entender o que ela guardava.","This statue watched the first sealing. Soon you will understand what it guarded.","Esta estatua presenció el primer sellado. Pronto entenderás lo que guardaba."),
 L("Além das árvores fica o Coração da Floresta. Estou esperando por você lá.","Beyond the trees lies the Heart of the Forest. I am waiting for you there.","Más allá de los árboles está el Corazón del Bosque. Te espero allí.")]}
const __ARC_EXPR=["calm","talk","sadness","talk","special","sadness","calm","smile"];

class __ArcticPrologue extends j.Scene{constructor(){super("ArcticPrologue")}
init(d){this.next=d?.next??{key:"Game",data:{levelId:"forest"}};this.classId=d?.classId??this.next.data?.classId??"WARRIOR";this.leaving=!1}
preload(){this.textures.exists("arc-boat-red")||this.load.image("arc-boat-red","assets/pixel-art/arctic/arc-boat-red.png");this.textures.exists("arc-boat-teal")||this.load.image("arc-boat-teal","assets/pixel-art/arctic/arc-boat-teal.png");
 this.textures.exists("rf-props")||this.load.atlas("rf-props","assets/pixel-art/ruins-forest/rf-props.png","assets/pixel-art/ruins-forest/rf-props.json");
 this.textures.exists("fr-bridge")||this.load.image("fr-bridge","assets/pixel-art/forest-open/fr-bridge.png");
 this.cache.json.exists("rp-meta")||this.load.json("rp-meta","assets/pixel-art/river-prologue/rp-meta.json");
 this.load.once("filecomplete-json-rp-meta",()=>{for(const[k]of this.cache.json.get("rp-meta").chunks)this.textures.exists(k)||this.load.image(k,`assets/pixel-art/river-prologue/${k}.png`)});
 if(this.cache.json.exists("rp-meta"))for(const[k]of this.cache.json.get("rp-meta").chunks)this.textures.exists(k)||this.load.image(k,`assets/pixel-art/river-prologue/${k}.png`)}
create(){const S=this,M=S.cache.json.get("rp-meta"),R=Math.random,L3=__L3;S.M=M;S.W=M.w;S.H=M.h;le(S);const cam=S.cameras.main;cam.setBounds(0,0,S.W,S.H).setBackgroundColor(0x0d1a12);
 S.uiCam=S.cameras.add(0,0,cam.width,cam.height);S.uiCam.setZoom(cam.zoom).centerOn(_/2,st/2);S.ui=S.add.container(0,0).setDepth(5e3);cam.ignore(S.ui);
 const w=o=>(S.uiCam.ignore(o),o);S.w=w;
 const raw=atob(M.grid);S.grid=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)S.grid[i]=raw.charCodeAt(i);
 for(const[k,x,y]of M.chunks)w(S.add.image(x,y,k).setOrigin(0).setDepth(0));
 /* água viva: brilho que desliza sobre a água */
 S.glints=[];for(let k=0;k<46;k++){const p=S.freeCell(2);if(!p)break;const gl=w(S.add.ellipse(p.x,p.y,6+R()*10,1.4,0xcfeee4,0).setDepth(.6));S.glints.push(gl);S.tweens.add({targets:gl,alpha:{from:0,to:.45},x:"+=14",duration:1400+R()*1600,yoyo:!0,repeat:-1,delay:R()*3e3})}
 /* árvores e moitas da borda, com profundidade */
 S.lobs=[];for(const[k,x,y]of M.props){if(!S.textures.get("rf-props").has(k))continue;const im=w(S.add.image(x,y,"rf-props",k).setOrigin(.5,1).setDepth(y));R()<.5&&im.setFlipX(!0);S.lobs.push({x,y:y-6,r:/Bush/.test(k)?10:13})}
 /* píer de madeira: do chão da clareira até o remanso */
 const D=M.dock,Lp=M.land;S.dock={x:D[0],y:D[1]};for(let y=Lp[1]-6;y<=D[1]+10;y+=14)w(S.add.image(D[0],y,"fr-bridge").setScale(.7,.5).setDepth(1.5));
 for(const dx of[-11,11])for(const y of[Lp[1]+16,D[1]+8])w(S.add.rectangle(D[0]+dx,y,4,10,0x4a3424).setDepth(1.6));
 /* naufrágio e estátua */
 S.poi=[];const Wr=M.wreck,St=M.statue;w(S.add.image(Wr[0],Wr[1],"arc-boat-teal").setScale(.42).setRotation(1.9).setTint(0x6b6a5c).setAlpha(.92).setDepth(Wr[1]));S.lobs.push({x:Wr[0],y:Wr[1],r:22});
 S.poi.push({x:Wr[0],y:Wr[1]-18,line:5,label:L3("Examinar o barco naufragado","Examine the wrecked boat","Examinar el barco naufragado")});
 w(S.add.image(St[0],St[1],"rf-props","rf-Ruin_grass4").setOrigin(.5,1).setDepth(St[1]));S.lobs.push({x:St[0],y:St[1]-6,r:18});const sg=w(S.add.image(St[0],St[1]-40,"light").setScale(.4).setBlendMode(j.BlendModes.ADD).setTint(0x9fe8a8).setAlpha(.3).setDepth(St[1]+1));S.tweens.add({targets:sg,alpha:.12,duration:1300,yoyo:!0,repeat:-1});
 S.poi.push({x:St[0],y:St[1]+14,line:6,label:L3("Examinar a estátua antiga","Examine the ancient statue","Examinar la estatua antigua")});
 /* saída: luz entre as árvores */
 const E=M.exit,ex=w(S.add.image(E[0],E[1]+20,"light").setScale(.7).setBlendMode(j.BlendModes.ADD).setTint(0xfff1c4).setAlpha(.3).setDepth(2));S.tweens.add({targets:ex,alpha:.14,duration:1400,yoyo:!0,repeat:-1});
 /* barco */
 S.mode="boat";const P0=M.start;S.boat=w(S.add.image(P0[0],P0[1],"arc-boat-red").setScale(.5).setDepth(P0[1]));S.bv={x:0,y:0};S.bang=-Math.PI/4;S.wakeT=0;
 /* herói (aparece ao desembarcar) */
 const cls=String(S.classId||"WARRIOR").toLowerCase(),key=[`mk4b-${cls}-t0`,`mk4b-${cls}`].find(k=>S.textures.exists(k));S.lay=S.cache.json.get(`mk4b-${cls}-layout`);S.hkey=key;
 S.hero=key?w(S.add.sprite(0,0,key,0).setScale(S.lay?.scale??.67).setOrigin(.5,(S.lay?.footY??(S.lay?.frameH??128)-8)/(S.lay?.frameH??128)).setVisible(!1)):null;S.hsh=w(S.add.ellipse(0,0,22,7,0,.3).setVisible(!1).setDepth(1.7));
 cam.startFollow(S.boat,!0,.08,.08);
 /* folhas caindo e vaga-lumes */
 S.leaves=[];for(let k=0;k<34;k++){const f=w(S.add.rectangle(R()*S.W,R()*S.H,3,2,[0x9cc46a,0xc9b25a,0x6f9a4a][k%3],.85).setDepth(4e3));f.vx=10+R()*14;f.vy=14+R()*16;f.ph=R()*6;S.leaves.push(f)}
 for(let k=0;k<26;k++){const p=S.freeCell(R()<.5?1:2);if(!p)continue;const ff=w(S.add.image(p.x,p.y,"light").setScale(.05).setBlendMode(j.BlendModes.ADD).setTint(0xd8ff9a).setAlpha(0).setDepth(3e3));S.tweens.add({targets:ff,alpha:{from:0,to:.8},x:"+="+(R()*30-15),y:"-="+(R()*20),duration:1500+R()*1500,yoyo:!0,repeat:-1,delay:R()*3e3})}
 S.buildUI();S.lineDone=new Set;S.queue=[];S.time.delayedCall(1200,()=>S.say(0));
 try{S.game.audioEngine?.music?.("forest")}catch(e){}
 S.input.keyboard?.on("keydown-ESC",()=>S.finish(!0));S.keyE=S.input.keyboard?.addKey?.("E");
 cam.fadeIn(900,0,0,0)}
cell(x,y){const M=this.M,i=Math.floor(x/M.cell),j=Math.floor(y/M.cell);if(i<0||j<0||i>=M.gw||j>=M.gh)return 0;return this.grid[j*M.gw+i]}
freeCell(v){for(let t=0;t<60;t++){const x=Math.random()*this.W,y=Math.random()*this.H;if(this.cell(x,y)===v&&this.cell(x+10,y)===v&&this.cell(x-10,y)===v)return{x,y}}return null}
okArea(x,y,v,r){return this.cell(x,y)===v&&this.cell(x+r,y)===v&&this.cell(x-r,y)===v&&this.cell(x,y+r)===v&&this.cell(x,y-r)===v}
buildUI(){const S=this,L3=__L3,U=S.ui,F="Georgia, 'Times New Roman', serif";
 const px=_/2,py=st-48;S.nar=S.add.container(px,py).setAlpha(0);const bg=S.add.graphics();bg.fillStyle(0x0b0f16,.82).fillRoundedRect(-250,-30,500,60,8).lineStyle(1,0xc9a24a,.7).strokeRoundedRect(-250,-30,500,60,8);
 S.por=S.add.image(-222,28,"guardia-p-talk").setOrigin(.5,1).setScale(.5);S.narName=S.add.text(-182,-24,typeof __GN!=="undefined"?__GN:"A GUARDIÃ",{fontFamily:F,fontStyle:"bold",fontSize:"10px",color:"#f2d9a0"});
 S.narTx=S.add.text(-182,-10,"",{fontFamily:F,fontSize:"10px",color:"#ece2cc",wordWrap:{width:420},lineSpacing:2});S.nar.add([bg,S.por,S.narName,S.narTx]);U.add(S.nar);
 S.act=S.add.container(_-92,st-118).setVisible(!1);const ab=S.add.graphics();ab.fillStyle(0x1d2a20,.9).fillRoundedRect(-80,-15,160,30,8).lineStyle(1.5,0x8ae08a,.9).strokeRoundedRect(-80,-15,160,30,8);S.actTx=S.add.text(0,0,"",{fontFamily:F,fontStyle:"bold",fontSize:"10px",color:"#e8ffe0"}).setOrigin(.5);S.act.add([ab,S.actTx]);
 const az=S.add.zone(0,0,160,30).setInteractive({useHandCursor:!0});az.on("pointerdown",()=>{S.uiTap=!0;S.doAct()});S.act.add(az);U.add(S.act);
 const sk=S.add.text(_-10,10,L3("PULAR PRÓLOGO ▸","SKIP PROLOGUE ▸","SALTAR PRÓLOGO ▸"),{fontFamily:"'Courier New', monospace",fontStyle:"bold",fontSize:"9px",color:"#e8dcb0",backgroundColor:"#1a120cdd",padding:{x:6,y:4}}).setOrigin(1,0).setInteractive({useHandCursor:!0});sk.on("pointerdown",()=>{S.uiTap=!0;S.finish(!0)});U.add(sk);
 S.joy={on:!1,ox:0,oy:0,x:0,y:0,id:null};const jb=S.add.circle(0,0,26,0xffffff,.12).setStrokeStyle(2,0xffffff,.35).setVisible(!1),jt=S.add.circle(0,0,11,0xffffff,.35).setVisible(!1);U.add([jb,jt]);
 const toUI=p=>({x:(p.x-S.uiCam.width/2)/S.uiCam.zoom+_/2,y:(p.y-S.uiCam.height/2)/S.uiCam.zoom+st/2});
 S.input.on("pointerdown",p=>{if(S.uiTap){S.uiTap=!1;return}const q=toUI(p);S.joy={on:!0,ox:q.x,oy:q.y,x:0,y:0,id:p.id};jb.setPosition(q.x,q.y).setVisible(!0);jt.setPosition(q.x,q.y).setVisible(!0)});
 S.input.on("pointermove",p=>{if(!S.joy.on||p.id!==S.joy.id)return;const q=toUI(p);let dx=q.x-S.joy.ox,dy=q.y-S.joy.oy;const m=Math.hypot(dx,dy);if(m>26){dx*=26/m;dy*=26/m}S.joy.x=dx/26;S.joy.y=dy/26;jt.setPosition(S.joy.ox+dx,S.joy.oy+dy)});
 const up=p=>{if(p.id!==S.joy.id)return;S.joy.on=!1;S.joy.x=S.joy.y=0;jb.setVisible(!1);jt.setVisible(!1)};S.input.on("pointerup",up);S.input.on("pointerupoutside",up)}
say(i){const S=this;if(S.lineDone.has(i))return;S.lineDone.add(i);S.queue=[i];S.speaking||S.nextLine()}
nextLine(){const S=this;if(!S.queue.length){S.speaking=!1;S.tweens.add({targets:S.nar,alpha:0,duration:500});return}S.speaking=!0;const i=S.queue.shift(),t=__arcLines()[i],ex=__ARC_EXPR[i]||"talk";
 S.textures.exists("guardia-p-"+ex)&&S.por.setTexture("guardia-p-"+ex);S.narTx.setText("");S.tweens.add({targets:S.nar,alpha:1,duration:300});let n=0;S.typer?.remove();S.typer=S.time.addEvent({delay:24,repeat:t.length-1,callback:()=>S.narTx.setText(t.slice(0,++n))});
 let fin=!1;const done=ok=>{if(fin)return;fin=!0;S.time.delayedCall(ok?700:Math.max(2600,t.length*55),()=>S.sys.isActive()&&S.nextLine())};
 try{window.__dub?window.__dub(t,done):done(!1)}catch(e){done(!1)}}
doAct(){const S=this,a=S.curAct;if(!a)return;if(a.kind==="land"){S.disembark();return}if(a.kind==="poi"){a.p.done=!0;S.say(a.p.line);S.game.audioEngine?.sfx?.("sfx-ui-tab");S.burst(a.p.x,a.p.y-20)}}
burst(x,y){const S=this;for(let k=0;k<10;k++){const c=S.w(S.add.circle(x,y,1.5,0xd8ff9a,.9).setDepth(5e3));S.tweens.add({targets:c,x:x+(Math.random()-.5)*50,y:y-20-Math.random()*30,alpha:0,duration:700,onComplete:()=>c.destroy()})}}
disembark(){const S=this;if(S.mode!=="boat")return;S.mode="land";S.bv={x:0,y:0};S.tweens.add({targets:S.boat,x:S.dock.x+34,y:S.dock.y+6,rotation:.25,duration:500});
 const Lp=S.M.land,hx=Lp[0],hy=Lp[1];S.hx=hx;S.hy=hy;S.hero&&S.hero.setPosition(hx,hy).setVisible(!0).setAlpha(0).setDepth(hy+1);S.hero&&S.tweens.add({targets:S.hero,alpha:1,duration:400});S.hsh.setPosition(hx,hy).setVisible(!0);
 S.hero&&S.anims.exists(S.hkey+"-idle")&&S.hero.play(S.hkey+"-idle");S.cameras.main.startFollow(S.hero||S.boat,!0,.1,.1);S.game.audioEngine?.sfx?.("sfx-door-open");S.time.delayedCall(600,()=>S.say(4))}
axis(){const S=this,im=S.game.inputManager;try{im?.update?.()}catch(e){}let a=im?.axis?.()||{x:0,y:0};const k=im?.keyboardAxis?.()||{x:0,y:0};Math.hypot(k.x,k.y)>Math.hypot(a.x,a.y)&&(a=k);if(S.joy.on&&Math.hypot(S.joy.x,S.joy.y)>Math.hypot(a.x,a.y))a={x:S.joy.x,y:S.joy.y};const m=Math.hypot(a.x,a.y);return m<.15?{x:0,y:0}:{x:a.x/Math.max(1,m),y:a.y/Math.max(1,m)}}
push(o,list,rad){for(const q of list){const dx=o.x-q.x,dy=o.y-q.y,d=Math.hypot(dx,dy),m=rad+q.r;if(d<m&&d>.01){o.x=q.x+dx/d*m;o.y=q.y+dy/d*m}}}
/* anda deslizando pela borda: tenta o passo inteiro, depois só x, depois só y */
step(px,py,nx,ny,ok){if(ok(nx,ny))return[nx,ny];if(ok(nx,py))return[nx,py];if(ok(px,ny))return[px,ny];return[px,py]}
update(t,ms){const S=this;if(S.leaving)return;const dt=Math.min(.05,ms/1e3),a=S.axis(),im=S.game.inputManager,L3=__L3,M=S.M;
 const v=S.cameras.main.worldView;for(const f of S.leaves){f.ph+=dt*2;f.x+=(f.vx+Math.sin(f.ph)*10)*dt;f.y+=f.vy*dt;f.rotation+=dt*2;if(f.y>v.bottom+10){f.y=v.top-10;f.x=v.x+Math.random()*v.width}if(f.x>v.right+10)f.x=v.x-5}
 let act=null;
 if(S.mode==="boat"){const B=S.boat,acc=200,max=115;S.bv.x+=a.x*acc*dt;S.bv.y+=a.y*acc*dt;const sp=Math.hypot(S.bv.x,S.bv.y);if(sp>max){S.bv.x*=max/sp;S.bv.y*=max/sp}const dr=Math.pow(.35,dt);S.bv.x*=dr;S.bv.y*=dr;
  const[nx,ny]=S.step(B.x,B.y,B.x+S.bv.x*dt,B.y+S.bv.y*dt,(x,y)=>S.okArea(x,y,2,14));if(Math.abs(nx-(B.x+S.bv.x*dt))+Math.abs(ny-(B.y+S.bv.y*dt))>.3){S.bv.x*=.7;S.bv.y*=.7}B.setPosition(nx,ny).setDepth(ny);
  if(sp>8){const ang=Math.atan2(S.bv.y,S.bv.x);let d=ang-S.bang;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;S.bang+=d*Math.min(1,dt*4)}B.setRotation(S.bang+Math.PI/2);
  S.wakeT+=dt;if(sp>20&&S.wakeT>.09){S.wakeT=0;const bx=B.x-Math.cos(S.bang)*30,by=B.y-Math.sin(S.bang)*30,e=S.w(S.add.ellipse(bx+(Math.random()-.5)*8,by+(Math.random()-.5)*8,10,5,0xcfeee4,.5).setDepth(.95).setRotation(S.bang));S.tweens.add({targets:e,scaleX:2.4,scaleY:1.6,alpha:0,duration:900,onComplete:()=>e.destroy()})}
  B.x>M.cues.river&&S.say(1);B.x>M.cues.mid&&S.say(2);B.y<M.cues.near&&B.x>1100&&S.say(3);
  if(Math.hypot(B.x-S.dock.x,B.y-S.dock.y)<64)act={kind:"land",label:L3("⚓ Desembarcar","⚓ Disembark","⚓ Desembarcar")}}
 else if(S.hero){const spd=105;let[nx,ny]=S.step(S.hx,S.hy,S.hx+a.x*spd*dt,S.hy+a.y*spd*dt,(x,y)=>S.okArea(x,y,1,5)||Math.abs(x-S.dock.x)<14&&y>M.land[1]-10&&y<M.land[1]+20);const o={x:nx,y:ny};S.push(o,S.lobs,8);if(!(S.okArea(o.x,o.y,1,5)||Math.abs(o.x-S.dock.x)<14)){o.x=nx;o.y=ny}S.hx=o.x;S.hy=o.y;
  S.hero.setPosition(o.x,o.y).setDepth(o.y+1);S.hsh.setPosition(o.x,o.y+1);a.x&&S.hero.setFlipX(a.x<0);const moving=Math.hypot(a.x,a.y)>.1,an=S.hkey+(moving?"-walk":"-idle");S.anims.exists(an)&&S.hero.anims.currentAnim?.key!==an&&S.hero.play(an);
  for(const p of S.poi)if(!p.done&&Math.hypot(p.x-o.x,p.y-o.y)<48){act={kind:"poi",p,label:"✦ "+p.label};break}
  if(o.y<M.exit[1]+60&&Math.abs(o.x-M.exit[0])<90){S.say(7);S.finish(!1)}}
 S.curAct=act;S.act.setVisible(!!act);act&&S.actTx.text!==act.label&&S.actTx.setText(act.label);
 if(act&&(im?.justDown?.("INTERACT")||S.keyE&&j.Input.Keyboard.JustDown(S.keyE)))S.doAct()}
finish(skip){const S=this;if(S.leaving)return;S.leaving=!0;const go=()=>{try{window.__dubStop?.()}catch(e){}S.scene.start(S.next.key,S.next.data)};
 if(skip){S.cameras.main.fadeOut(500,0,0,0);S.uiCam.fadeOut(500,0,0,0);S.time.delayedCall(520,go);return}
 let n=0;const wait=()=>{if(S.speaking&&n++<14){S.time.delayedCall(500,wait);return}S.cameras.main.fadeOut(900,0,0,0);S.uiCam.fadeOut(900,0,0,0);S.time.delayedCall(920,go)};S.time.delayedCall(400,wait)}}
