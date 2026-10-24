/* ── Prólogo no Mar Gelado (antes da Floresta de Eldervale) ──────────────────────────────────────────
   Depois do vídeo de abertura da campanha, o herói acorda num barco no mar gelado:
     1. remando (o herói não aparece, só o barco) entre blocos de gelo, pilares afundados e boias
     2. no píer da margem aparece "Desembarcar"; o herói desce e explora a margem nevada
     3. um barco naufragado e uma pedra de runas contam um pouco da história
     4. a trilha entre os pinheiros leva à Floresta de Eldervale (fase normal)
   A Guardiã narra o caminho (voz em scripts/voice_extra_lines.json). Botão "Pular prólogo" sempre visível.
   Peças: assets/pixel-art/arctic (scripts/build_arctic_prologue.py, pacote craftpix Top View Arctic Viking). */
function __arcLines(){const L=__L3;return[
 L("Desperte, viajante. O mar gelado te trouxe mais longe do que qualquer barco deveria ir.","Wake, traveler. The frozen sea carried you farther than any boat should go.","Despierta, viajero. El mar helado te trajo más lejos de lo que cualquier barco debería ir."),
 L("O gelo se lembra de quem cruzou antes de você. Siga pelas águas abertas.","The ice remembers those who crossed before you. Follow the open water.","El hielo recuerda a quienes cruzaron antes que tú. Sigue las aguas abiertas."),
 L("Estes pilares já sustentaram um portão. Os Antigos o afundaram para que ninguém voltasse.","These pillars once held a gate. The Ancients sank it so no one could return.","Estos pilares sostuvieron una puerta. Los Antiguos la hundieron para que nadie volviera."),
 L("Ali, a margem. Daqui em diante, você caminha.","There, the shore. From here on, you walk.","Allí, la orilla. De aquí en adelante, caminas."),
 L("Sinta o frio. É a última coisa sincera antes das Profundezas.","Feel the cold. It is the last honest thing before the Depths.","Siente el frío. Es lo último sincero antes de las Profundidades."),
 L("Outro barco, outro viajante. Nem todos chegaram até mim.","Another boat, another traveler. Not all of them reached me.","Otro barco, otro viajero. No todos llegaron hasta mí."),
 L("As runas falam de nove selos. Logo você vai entender o que eles guardam.","The runes speak of nine seals. Soon you will understand what they guard.","Las runas hablan de nueve sellos. Pronto entenderás lo que guardan."),
 L("Além dos pinheiros fica o Coração da Floresta. Estou esperando por você lá.","Beyond the pines lies the Heart of the Forest. I am waiting for you there.","Más allá de los pinos está el Corazón del Bosque. Te espero allí.")]}
const __ARC_EXPR=["calm","talk","sadness","talk","special","sadness","calm","smile"];
const __ARC_KEYS=["boat-red","boat-blue","boat-gold","boat-teal","foam","shallow","deep","pillar-break","post-rust","post-rope","ring","chevron","frame","ice-stack","pillar-lean","iceberg","shards-a","shards-b","iceberg-big","well","well-gold","floe-a","floe-b","ice-block","snow-tile","ice-tile","bridge","bridge-broken","pillar-wrap","post-a","post-b","post-c","post-d","ice-flat","pillar-pair","water","snow"];

class __ArcticPrologue extends j.Scene{constructor(){super("ArcticPrologue")}
init(d){this.next=d?.next??{key:"Game",data:{levelId:"forest"}};this.classId=d?.classId??this.next.data?.classId??"WARRIOR";this.leaving=!1}
preload(){for(const k of __ARC_KEYS)this.textures.exists("arc-"+k)||this.load.image("arc-"+k,`assets/pixel-art/arctic/arc-${k}.png`);
 this.textures.exists("gs-props")||this.load.atlas("gs-props","assets/pixel-art/glacial-snow/gs-props.png","assets/pixel-art/glacial-snow/gs-props.json")}
create(){const S=this,W=900,H=1700,R=Math.random,L3=__L3;S.W=W;S.H=H;le(S);const cam=S.cameras.main;cam.setBounds(0,0,W,H).setBackgroundColor(0x3eb2d6);
 S.uiCam=S.cameras.add(0,0,cam.width,cam.height);S.uiCam.setZoom(cam.zoom).centerOn(_/2,st/2);S.ui=S.add.container(0,0).setDepth(5e3);cam.ignore(S.ui);
 const w=o=>(S.uiCam.ignore(o),o);S.w=w;
 /* margem: linha da água (y) por x, ondulada */
 const shore=x=>420+18*Math.sin(x/70)+10*Math.sin(x/23+1.3);S.shore=shore;
 w(S.add.tileSprite(0,0,W*2,H*2,"arc-water").setOrigin(0).setScale(.5).setDepth(0));
 /* águas fundas e rasas espalhadas */
 for(const[k,x,y,a]of[["deep",160,1300,.55],["deep",720,900,.5],["shallow",620,1500,.55],["shallow",230,760,.5],["deep",420,1120,.35],["shallow",780,1250,.45]])w(S.add.image(x,y,"arc-"+k).setScale(.5).setAlpha(a).setDepth(.5));
 /* terra nevada com borda de gelo */
 const g=w(S.add.graphics().setDepth(1));const pts=[[0,0],[W,0]];for(let x=W;x>=0;x-=10)pts.push([x,shore(x)]);g.fillStyle(0xbfe9f7,1).fillPoints(pts.map(([x,y])=>({x,y:y+8})),!0);g.fillStyle(0x8fd3ea,1).fillPoints(pts.map(([x,y])=>({x,y:y+3})),!0);
 const snow=w(S.add.tileSprite(0,0,W*2,1000,"arc-snow").setOrigin(0).setScale(.5).setDepth(1.1));const mk=S.make.graphics({add:!1});mk.fillStyle(0xffffff).fillPoints(pts.map(([x,y])=>({x,y})),!0);snow.setMask(mk.createGeometryMask());
 for(let x=20;x<W;x+=46+R()*40)w(S.add.image(x,shore(x)+4,"arc-foam").setScale(.25+R()*.12).setAlpha(.9).setDepth(1.2).setFlipX(R()<.5));
 /* obstáculos na água: [chave, x, y, raio] */
 S.obs=[];const ob=(k,x,y,r,sc=.5,o={})=>{const im=w(S.add.image(x,y,"arc-"+k).setScale(sc).setDepth(y+(o.dz||0)));o.flip&&im.setFlipX(!0);o.rot&&im.setRotation(o.rot);r&&S.obs.push({x,y:y+(o.oy||0),r});return im};
 for(const[k,x,y,r]of[["iceberg-big",120,1540,44],["floe-a",780,1580,34],["ice-stack",250,1360,30],["iceberg",560,1390,22],["floe-b",720,1330,30],["ice-block",120,1180,24],["ice-flat",400,1230,26],
   ["iceberg",820,1120,24],["ice-stack",620,1060,30],["floe-a",130,960,34],["iceberg-big",360,880,40],["ice-block",760,820,24],["floe-b",560,720,28],["iceberg",110,640,24],["ice-flat",830,600,26]])ob(k,x,y,r);
 /* portão afundado: pilares e pontes quebradas */
 for(const[k,x,y]of[["pillar-pair",300,1010],["pillar-break",500,960],["pillar-wrap",380,1060],["pillar-lean",650,1180],["post-a",200,1100],["post-c",470,1100],["post-d",560,1020]])ob(k,x,y,13,.5,{oy:16});
 ob("bridge-broken",420,1015,0,.5);ob("bridge",230,780,0,.5,{flip:!0});
 for(const[k,x,y]of[["post-rust",600,1600],["post-rope",300,1640],["well",680,1450],["well-gold",170,850],["post-b",760,700],["post-rust",250,560]])ob(k,x,y,k.startsWith("well")?20:11,.5,{oy:k.startsWith("well")?0:14});
 for(const[k,x,y]of[["shards-a",470,1520],["shards-b",640,1270],["shards-a",300,690],["shards-b",700,980]])w(S.add.image(x,y,"arc-"+k).setScale(.4).setAlpha(.9).setDepth(.8));
 for(const[x,y,a]of[[450,1480,0],[420,1180,0],[470,840,0],[450,560,0]])w(S.add.image(x,y,"arc-chevron").setScale(.32).setAlpha(.35).setDepth(.9).setRotation(a));
 for(const[x,y]of[[340,1450],[600,860],[180,1240]])w(S.add.image(x,y,"arc-ring").setScale(.3).setAlpha(.35).setDepth(.9));
 /* píer */
 S.dock={x:450,y:shore(450)+46};ob("bridge",450,shore(450)+22,0,.55,{rot:Math.PI/2,dz:-40});
 /* margem: pinheiros e pedras (pacote da Floresta Nevada), naufrágio e pedra de runas */
 S.lobs=[];const tree=(f,x,y,sc=.9)=>{if(!S.textures.get("gs-props").has(f))return;w(S.add.image(x,y,"gs-props",f).setOrigin(.5,1).setScale(sc).setDepth(y));S.lobs.push({x,y:y-8,r:14})};
 for(let x=10;x<W;x+=38+R()*26){const y=40+R()*70;Math.abs(x-450)<70||tree(["gs-tree_3","gs-tree_8","gs-tree_9"][Math.floor(R()*3)],x,y,.8+R()*.3)}
 for(let y=120;y<380;y+=44+R()*30){tree(["gs-tree_3","gs-tree_8","gs-tree_9","gs-tree_11"][Math.floor(R()*4)],20+R()*40,y);tree(["gs-tree_3","gs-tree_8","gs-tree_9","gs-tree_12"][Math.floor(R()*4)],W-20-R()*40,y)}
 for(const[f,x,y]of[["gs-stones_5",330,330],["gs-stones_6",600,320],["gs-tree_14",180,250],["gs-snowman",740,330],["gs-stones_4",560,190]])tree(f,x,y,.85);
 {const tg=w(S.add.graphics().setDepth(1.15));const path=[[450,410],[440,350],[400,300],[430,240],[470,180],[455,120],[450,60]];for(let k=0;k<path.length-1;k++){const[ax,ay]=path[k],[bx,by]=path[k+1];for(let q=0;q<=12;q++){const x=ax+(bx-ax)*q/12,y=ay+(by-ay)*q/12;tg.fillStyle(0xc9dbe8,.5).fillEllipse(x+(R()-.5)*6,y,30,16)}}}
 for(const[f,x,y]of[["gs-lamp",400,380],["gs-lamp",500,250],["gs-lamp",410,150],["gs-banner",520,110],["gs-banner",380,110],["gs-barrel",560,370]])tree(f,x,y,.9);
 for(const[k,x,y,sc]of[["ice-block",120,360,.42],["ice-stack",800,250,.4],["iceberg",300,150,.45],["floe-b",760,380,.4]]){w(S.add.image(x,y,"arc-"+k).setScale(sc).setDepth(y+20));S.lobs.push({x,y:y+10,r:20})}
 S.poi=[];const wr=w(S.add.image(250,280,"arc-boat-teal").setScale(.42).setRotation(-1.1).setTint(0xb8c4cc).setDepth(280));S.lobs.push({x:250,y:285,r:30});S.poi.push({x:250,y:300,line:5,label:L3("Examinar o barco naufragado","Examine the wrecked boat","Examinar el barco naufragado")});
 const rs=w(S.add.image(680,230,"arc-pillar-break").setScale(.5).setDepth(230));S.lobs.push({x:680,y:236,r:16});const rg=w(S.add.image(678,206,"light").setScale(.3).setBlendMode(j.BlendModes.ADD).setTint(0x8ae0ff).setAlpha(.35).setDepth(231));S.tweens.add({targets:rg,alpha:.12,duration:1100,yoyo:!0,repeat:-1});
 S.poi.push({x:680,y:250,line:6,label:L3("Ler as runas","Read the runes","Leer las runas")});
 /* saída: trilha entre os pinheiros */
 const ex=w(S.add.image(450,52,"light").setScale(.6).setBlendMode(j.BlendModes.ADD).setTint(0xfff1c4).setAlpha(.35).setDepth(2));S.tweens.add({targets:ex,alpha:.18,duration:1400,yoyo:!0,repeat:-1});
 /* barco do herói */
 S.mode="boat";S.boat=w(S.add.image(450,1610,"arc-boat-red").setScale(.5).setDepth(1610));S.bv={x:0,y:0};S.bang=-Math.PI/2;S.wakeT=0;
 /* herói (aparece só ao desembarcar) */
 const cls=String(S.classId||"WARRIOR").toLowerCase(),key=[`mk4b-${cls}-t0`,`mk4b-${cls}`].find(k=>S.textures.exists(k));S.lay=S.cache.json.get(`mk4b-${cls}-layout`);S.hkey=key;
 S.hero=key?w(S.add.sprite(0,0,key,0).setScale(S.lay?.scale??.67).setOrigin(.5,(S.lay?.footY??(S.lay?.frameH??128)-8)/(S.lay?.frameH??128)).setVisible(!1)):null;S.hsh=w(S.add.ellipse(0,0,22,7,0,.25).setVisible(!1).setDepth(2));
 cam.startFollow(S.boat,!0,.08,.08);
 /* neve caindo */
 S.flakes=[];for(let k=0;k<70;k++){const f=w(S.add.circle(R()*W,R()*H,.6+R()*1.2,0xffffff,.55+R()*.4).setDepth(4e3));f.vx=-8-R()*12;f.vy=18+R()*24;S.flakes.push(f)}
 /* interface: narração, botão contextual, pular, joystick de toque */
 S.buildUI();S.lineDone=new Set;S.queue=[];S.time.delayedCall(1200,()=>S.say(0));
 try{S.game.audioEngine?.music?.("frozen-ambience")}catch(e){}
 S.input.keyboard?.on("keydown-ESC",()=>S.finish(!0));
 S.cameras.main.fadeIn(900,0,0,0)}
buildUI(){const S=this,L3=__L3,U=S.ui,F="Georgia, 'Times New Roman', serif";
 /* narração da Guardiã */
 const px=_/2,py=st-48;S.nar=S.add.container(px,py).setAlpha(0);const bg=S.add.graphics();bg.fillStyle(0x0b0f16,.82).fillRoundedRect(-250,-30,500,60,8).lineStyle(1,0xc9a24a,.7).strokeRoundedRect(-250,-30,500,60,8);
 S.por=S.add.image(-222,28,"guardia-p-talk").setOrigin(.5,1).setScale(.5);S.narName=S.add.text(-182,-24,typeof __GN!=="undefined"?__GN:"A GUARDIÃ",{fontFamily:F,fontStyle:"bold",fontSize:"10px",color:"#f2d9a0"});
 S.narTx=S.add.text(-182,-10,"",{fontFamily:F,fontSize:"10px",color:"#ece2cc",wordWrap:{width:420},lineSpacing:2});S.nar.add([bg,S.por,S.narName,S.narTx]);U.add(S.nar);
 /* botão contextual (desembarcar, examinar…) */
 S.act=S.add.container(_-92,st-118).setVisible(!1);const ab=S.add.graphics();ab.fillStyle(0x1d2a20,.9).fillRoundedRect(-78,-15,156,30,8).lineStyle(1.5,0x8ae08a,.9).strokeRoundedRect(-78,-15,156,30,8);S.actTx=S.add.text(0,0,"",{fontFamily:F,fontStyle:"bold",fontSize:"10px",color:"#e8ffe0"}).setOrigin(.5);S.act.add([ab,S.actTx]);
 const az=S.add.zone(0,0,156,30).setInteractive({useHandCursor:!0});az.on("pointerdown",p=>{p.event?.stopPropagation?.();S.uiTap=!0;S.doAct()});S.act.add(az);U.add(S.act);
 /* pular */
 const sk=S.add.text(_-10,10,L3("PULAR PRÓLOGO ▸","SKIP PROLOGUE ▸","SALTAR PRÓLOGO ▸"),{fontFamily:"'Courier New', monospace",fontStyle:"bold",fontSize:"9px",color:"#e8dcb0",backgroundColor:"#1a120cdd",padding:{x:6,y:4}}).setOrigin(1,0).setInteractive({useHandCursor:!0});sk.on("pointerdown",p=>{S.uiTap=!0;S.finish(!0)});U.add(sk);
 /* joystick de toque: arrastar em qualquer ponto livre da tela */
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
doAct(){const S=this,a=S.curAct;if(!a)return;if(a.kind==="land"){S.disembark();return}if(a.kind==="poi"){a.p.done=!0;S.say(a.p.line);S.game.audioEngine?.sfx?.("sfx-ui-tab");S.effectsBurst(a.p.x,a.p.y-20)}}
effectsBurst(x,y){const S=this;for(let k=0;k<10;k++){const c=S.w(S.add.circle(x,y,1.5,0x9ff0ff,.9).setDepth(5e3));S.tweens.add({targets:c,x:x+(Math.random()-.5)*50,y:y-20-Math.random()*30,alpha:0,duration:700,onComplete:()=>c.destroy()})}}
disembark(){const S=this;if(S.mode!=="boat")return;S.mode="land";S.bv={x:0,y:0};S.tweens.add({targets:S.boat,x:S.dock.x+46,y:S.dock.y+24,rotation:.15,duration:500});
 const hx=S.dock.x,hy=S.shore(S.dock.x)-18;S.hero&&S.hero.setPosition(hx,hy).setVisible(!0).setAlpha(0).setDepth(hy);S.hero&&S.tweens.add({targets:S.hero,alpha:1,duration:400});S.hsh.setPosition(hx,hy).setVisible(!0);S.hx=hx;S.hy=hy;
 S.hero&&S.anims.exists(S.hkey+"-idle")&&S.hero.play(S.hkey+"-idle");S.cameras.main.startFollow(S.hero||S.boat,!0,.1,.1);S.game.audioEngine?.sfx?.("sfx-door-open");S.time.delayedCall(600,()=>S.say(4))}
axis(){const S=this,im=S.game.inputManager;try{im?.update?.()}catch(e){}let a=im?.axis?.()||{x:0,y:0};const k=im?.keyboardAxis?.()||{x:0,y:0};Math.hypot(k.x,k.y)>Math.hypot(a.x,a.y)&&(a=k);if(S.joy.on&&Math.hypot(S.joy.x,S.joy.y)>Math.hypot(a.x,a.y))a={x:S.joy.x,y:S.joy.y};const m=Math.hypot(a.x,a.y);return m<.15?{x:0,y:0}:{x:a.x/Math.max(1,m),y:a.y/Math.max(1,m)}}
push(o,list,rad){for(const q of list){const dx=o.x-q.x,dy=o.y-q.y,d=Math.hypot(dx,dy),m=rad+q.r;if(d<m&&d>.01){o.x=q.x+dx/d*m;o.y=q.y+dy/d*m}}}
update(t,ms){const S=this;if(S.leaving)return;const dt=Math.min(.05,ms/1e3),a=S.axis(),im=S.game.inputManager,L3=__L3;
 for(const f of S.flakes){f.x+=f.vx*dt;f.y+=f.vy*dt;const v=S.cameras.main.worldView;if(f.y>v.bottom+10){f.y=v.top-10;f.x=v.x+Math.random()*v.width}if(f.x<v.x-10)f.x=v.right+5}
 let act=null;
 if(S.mode==="boat"){const B=S.boat,acc=210,max=120;S.bv.x+=a.x*acc*dt;S.bv.y+=a.y*acc*dt;const sp=Math.hypot(S.bv.x,S.bv.y);if(sp>max){S.bv.x*=max/sp;S.bv.y*=max/sp}const dr=Math.pow(.35,dt);S.bv.x*=dr;S.bv.y*=dr;
  const o={x:B.x+S.bv.x*dt,y:B.y+S.bv.y*dt};S.push(o,S.obs,22);o.x=Math.max(30,Math.min(S.W-30,o.x));o.y=Math.min(S.H-30,Math.max(S.shore(o.x)+38,o.y));
  const bumped=Math.hypot(o.x-(B.x+S.bv.x*dt),o.y-(B.y+S.bv.y*dt))>.5;bumped&&(S.bv.x*=.6,S.bv.y*=.6);B.setPosition(o.x,o.y).setDepth(o.y);
  if(sp>8){const ang=Math.atan2(S.bv.y,S.bv.x);let d=ang-S.bang;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;S.bang+=d*Math.min(1,dt*4)}B.setRotation(S.bang+Math.PI/2);B.setScale(.5+Math.sin(t/180)*.006*Math.min(1,sp/40));
  S.wakeT+=dt;if(sp>20&&S.wakeT>.09){S.wakeT=0;const bx=B.x-Math.cos(S.bang)*30,by=B.y-Math.sin(S.bang)*30,e=S.w(S.add.ellipse(bx+(Math.random()-.5)*8,by+(Math.random()-.5)*8,10,5,0xffffff,.55).setDepth(.95).setRotation(S.bang));S.tweens.add({targets:e,scaleX:2.4,scaleY:1.6,alpha:0,duration:900,onComplete:()=>e.destroy()})}
  B.y<1250&&S.say(1);B.y<1080&&S.say(2);B.y<760&&S.say(3);
  if(Math.hypot(B.x-S.dock.x,B.y-S.dock.y)<70)act={kind:"land",label:L3("⚓ Desembarcar","⚓ Disembark","⚓ Desembarcar")}}
 else if(S.hero){const spd=105,o={x:S.hx+a.x*spd*dt,y:S.hy+a.y*spd*dt};S.push(o,S.lobs,9);o.x=Math.max(16,Math.min(S.W-16,o.x));o.y=Math.max(16,Math.min(S.shore(o.x)-10,o.y));S.hx=o.x;S.hy=o.y;
  S.hero.setPosition(o.x,o.y).setDepth(o.y+1);S.hsh.setPosition(o.x,o.y+1);a.x&&S.hero.setFlipX(a.x<0);const moving=Math.hypot(a.x,a.y)>.1,an=S.hkey+(moving?"-walk":"-idle");S.anims.exists(an)&&S.hero.anims.currentAnim?.key!==an&&S.hero.play(an);
  if(moving&&Math.random()<dt*6){const p=S.w(S.add.ellipse(o.x+(Math.random()-.5)*6,o.y+2,4,2,0xa9c4d8,.6).setDepth(1.3));S.tweens.add({targets:p,alpha:0,duration:2600,onComplete:()=>p.destroy()})}
  for(const p of S.poi)if(!p.done&&Math.hypot(p.x-o.x,p.y-o.y)<46){act={kind:"poi",p,label:"✦ "+p.label};break}
  if(o.y<80&&Math.abs(o.x-450)<90){S.say(7);S.finish(!1)}}
 S.curAct=act;S.act.setVisible(!!act);act&&S.actTx.text!==act.label&&S.actTx.setText(act.label);
 if(act&&(im?.justDown?.("INTERACT")||S.input.keyboard?.checkDown?.(S.input.keyboard.addKey("E"),400)))S.doAct()}
finish(skip){const S=this;if(S.leaving)return;S.leaving=!0;const go=()=>{try{window.__dubStop?.()}catch(e){}S.scene.start(S.next.key,S.next.data)};
 if(skip){S.cameras.main.fadeOut(500,0,0,0);S.uiCam.fadeOut(500,0,0,0);S.time.delayedCall(520,go);return}
 /* espera a última fala da Guardiã antes de entrar na floresta */
 const wait=()=>{if(S.speaking&&S.queue.length+1>0&&S.__w<14){S.__w=(S.__w||0)+1;S.time.delayedCall(500,wait);return}S.cameras.main.fadeOut(900,0,0,0);S.uiCam.fadeOut(900,0,0,0);S.time.delayedCall(920,go)};S.__w=0;S.time.delayedCall(400,wait)}}
function __arcStart(sc,data){const G=sc.game;G.scene.getScene("ArcticPrologue")||G.scene.add("ArcticPrologue",__ArcticPrologue,!1);sc.scene.start("ArcticPrologue",data)}
