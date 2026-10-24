/* ── Prólogo do Rio da Floresta (antes da Floresta de Eldervale) ─────────────────────────────────────
   Depois do vídeo de abertura da campanha o herói chega de barco e desce um rio longo no meio da mata:
     1. remando (o herói não aparece, só o barco): lago enevoado → garganta com corredeira → ruínas da ponte
        dos Antigos → segundo lago com ilhota e vitórias-régias → rio até o píer. A correnteza leva o barco
        (mesmo sem remar ele desce devagar), a câmera antecipa o caminho e as falas ficam espaçadas no trajeto.
     2. no píer aparece "Desembarcar"; o herói desce e explora a clareira
     3. um barco naufragado na margem e uma estátua antiga contam um pouco da história
     4. a trilha entre as árvores leva à Floresta de Eldervale (fase normal)
   A Guardiã narra o caminho (voz em scripts/voice_extra_lines.json); as falas entram numa fila e nunca se
   cortam. Sons: correnteza, corredeira, água no casco, remadas, rangidos, vento na mata com rajadas que
   mexem as folhas e as árvores (assets/audio/ambient, scripts/build_river_audio.py).
   Botão "Pular prólogo" sempre visível.
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
 L("Além das árvores fica o Coração da Floresta. Estou esperando por você lá.","Beyond the trees lies the Heart of the Forest. I am waiting for you there.","Más allá de los árboles está el Corazón del Bosque. Te espero allí."),
 L("Sinta o vento. Ele carrega os sussurros de quem se perdeu nestas águas.","Feel the wind. It carries the whispers of those who were lost in these waters.","Siente el viento. Lleva los susurros de quienes se perdieron en estas aguas."),
 L("Esta ponte uniu dois reinos, até a escuridão rachar suas pedras.","This bridge once joined two kingdoms, until the darkness cracked its stones.","Este puente unió dos reinos, hasta que la oscuridad agrietó sus piedras."),
 L("Os vaga-lumes guiam quem ainda tem esperança. Deixe que te levem até a margem.","The fireflies guide those who still have hope. Let them lead you to the shore.","Las luciérnagas guían a quien aún tiene esperanza. Deja que te lleven a la orilla.")]}
const __ARC_EXPR=["calm","talk","sadness","talk","special","sadness","calm","smile","calm","sadness","smile"];
const __RPA=["river-flow","river-rapids","river-wind","boat-glide","boat-sfx"];

class __ArcticPrologue extends j.Scene{constructor(){super("ArcticPrologue")}
init(d){this.next=d?.next??{key:"Game",data:{levelId:"forest"}};this.classId=d?.classId??this.next.data?.classId??"WARRIOR";this.leaving=!1}
preload(){this.textures.exists("arc-boat-red")||this.load.image("arc-boat-red","assets/pixel-art/arctic/arc-boat-red.png");this.textures.exists("arc-boat-teal")||this.load.image("arc-boat-teal","assets/pixel-art/arctic/arc-boat-teal.png");
 this.textures.exists("rf-props")||this.load.atlas("rf-props","assets/pixel-art/ruins-forest/rf-props.png","assets/pixel-art/ruins-forest/rf-props.json");
 this.textures.exists("fr-bridge")||this.load.image("fr-bridge","assets/pixel-art/forest-open/fr-bridge.png");
 const more=M=>{for(const[k]of M.chunks)this.textures.exists(k)||this.load.image(k,`assets/pixel-art/river-prologue/${k}.png`);
  for(const[k]of M.deco||[])if(!/^rf-/.test(k)&&!this.textures.exists("rpx-"+k))this.load.image("rpx-"+k,k==="rp-pillar"?"assets/pixel-art/river-prologue/rp-pillar.png":`assets/pixel-art/props-extra/${k}.png`)};
 this.cache.json.exists("rp-meta")||this.load.json("rp-meta","assets/pixel-art/river-prologue/rp-meta.json");
 this.load.once("filecomplete-json-rp-meta",()=>more(this.cache.json.get("rp-meta")));
 if(this.cache.json.exists("rp-meta"))more(this.cache.json.get("rp-meta"))}
create(){const S=this,M=S.cache.json.get("rp-meta"),R=Math.random,L3=__L3;S.M=M;S.W=M.w;S.H=M.h;le(S);const cam=S.cameras.main;cam.setBounds(0,0,S.W,S.H).setBackgroundColor(0x0d1a12);
 S.uiCam=S.cameras.add(0,0,cam.width,cam.height);S.uiCam.setZoom(cam.zoom).centerOn(_/2,st/2);S.ui=S.add.container(0,0).setDepth(5e3);cam.ignore(S.ui);
 const w=o=>(S.uiCam.ignore(o),o);S.w=w;
 const raw=atob(M.grid);S.grid=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)S.grid[i]=raw.charCodeAt(i);
 for(const[k,x,y]of M.chunks)w(S.add.image(x,y,k).setOrigin(0).setDepth(0));
 /* trajeto do rio: correnteza e roteiro da narração */
 S.P=M.path||[];S.flow=M.flow||[];S.pi=0;S.prog=0;S.cues=Object.entries(M.cues||{}).map(([k,v])=>[+k,v]).sort((a,b)=>a[1]-b[1]);
 S.gorge=S.P.filter((p,i)=>(S.flow[i]||0)>50);
 /* água viva: brilho que desliza e fios de correnteza que descem o rio */
 for(let k=0;k<130;k++){const p=S.freeCell(2);if(!p)break;const gl=w(S.add.ellipse(p.x,p.y,6+R()*10,1.4,0xcfeee4,0).setDepth(.6));S.tweens.add({targets:gl,alpha:{from:0,to:.45},x:"+=14",duration:1400+R()*1600,yoyo:!0,repeat:-1,delay:R()*3e3})}
 S.streaks=[];for(let k=0;k<44;k++){const e=w(S.add.ellipse(-99,-99,14+R()*16,1.3,0xe4fff6,0).setDepth(.7));e.life=0;e.max=1;S.streaks.push(e)}
 /* árvores e moitas da borda, com profundidade (balançam com o vento) */
 S.lobs=[];S.sway=[];for(const[k,x,y]of M.props){if(!S.textures.get("rf-props").has(k))continue;const im=w(S.add.image(x,y,"rf-props",k).setOrigin(.5,1).setDepth(y));R()<.5&&im.setFlipX(!0);im.ph=R()*6.28;im.amp=/Bush/.test(k)?.6:1;S.sway.push(im);S.lobs.push({x,y:y-6,r:/Bush/.test(k)?10:13})}
 /* ruínas da ponte, pedras da corredeira, troncos caídos */
 for(const[k,x,y,sc,fl]of M.deco||[]){const rf=/^rf-/.test(k),key=rf?"rf-props":"rpx-"+k;if(rf?!S.textures.get("rf-props").has(k):!S.textures.exists(key))continue;const im=w((rf?S.add.image(x,y,key,k):S.add.image(x,y,key)).setOrigin(.5,1).setScale(sc).setFlipX(!!fl).setDepth(y));
  /^dx-rock/.test(k)&&im.setTint(0xa9b4a2);/^dx-ruin/.test(k)&&im.setTint(0xb8b8a8);
  if(k==="rp-pillar"||/^dx-rock/.test(k)){const ring=w(S.add.ellipse(x,y-4,im.displayWidth*.9,7,0xe6fff4,0).setStrokeStyle(1,0xe6fff4,.5).setDepth(.8));S.tweens.add({targets:ring,scaleX:1.25,scaleY:1.3,alpha:{from:.9,to:0},duration:1500,repeat:-1,delay:R()*1500})}
  !rf||/Broken/.test(k)?0:S.lobs.push({x,y:y-6,r:18})}
 S.wobs=(M.wobs||[]).map(([x,y,r])=>({x,y,r}));
 /* píer de madeira: do chão da clareira até o remanso */
 const D=M.dock,Lp=M.land;S.dock={x:D[0],y:D[1]};for(let y=Lp[1]-6;y<=D[1]+10;y+=14)w(S.add.image(D[0],y,"fr-bridge").setScale(.7,.5).setDepth(1.5));
 for(const dx of[-11,11])for(const y of[Lp[1]+16,D[1]+8])w(S.add.rectangle(D[0]+dx,y,4,10,0x4a3424).setDepth(1.6));
 /* naufrágio e estátua */
 S.poi=[];const Wr=M.wreck,St=M.statue;w(S.add.image(Wr[0],Wr[1],"arc-boat-teal").setScale(.42).setRotation(1.9).setTint(0x6b6a5c).setAlpha(.92).setDepth(Wr[1]));S.lobs.push({x:Wr[0],y:Wr[1],r:22});
 S.poi.push({x:Wr[0],y:Wr[1]-18,line:5,label:L3("Examinar o barco naufragado","Examine the wrecked boat","Examinar el barco naufragado")});
 w(S.add.image(St[0],St[1],"rf-props","rf-Ruin_grass4").setOrigin(.5,1).setDepth(St[1]));S.lobs.push({x:St[0],y:St[1]-6,r:18});const sg=w(S.add.image(St[0],St[1]-40,"light").setScale(.4).setBlendMode(j.BlendModes.ADD).setTint(0x9fe8a8).setAlpha(.3).setDepth(St[1]+1));S.tweens.add({targets:sg,alpha:.12,duration:1300,yoyo:!0,repeat:-1});
 S.poi.push({x:St[0],y:St[1]+14,line:6,label:L3("Examinar a estátua antiga","Examine the ancient statue","Examinar la estatua antigua")});
 /* saída: luz entre as árvores */
 const E=M.exit,ex=w(S.add.image(E[0],E[1]+10,"light").setScale(.7).setBlendMode(j.BlendModes.ADD).setTint(0xfff1c4).setAlpha(.3).setDepth(2));S.tweens.add({targets:ex,alpha:.14,duration:1400,yoyo:!0,repeat:-1});
 /* névoa sobre os lagos e feixes de luz entre as copas */
 for(const[mx,my,rx,ry]of M.mist||[])for(let k=0;k<7;k++){const m=w(S.add.ellipse(mx+(R()-.5)*rx,my+(R()-.5)*ry,rx*(.5+R()*.5),ry*(.35+R()*.3),0xdfeee8,0).setDepth(3900));S.tweens.add({targets:m,alpha:{from:.02,to:.09},x:"+="+(30+R()*50),duration:6e3+R()*5e3,yoyo:!0,repeat:-1,delay:R()*4e3})}
 for(let k=0;k<16;k++){const x=R()*S.W,y=R()*S.H,ray=w(S.add.image(x,y,"light").setScale(.9,5).setRotation(.55).setBlendMode(j.BlendModes.ADD).setTint(0xfff3c8).setAlpha(0).setDepth(3950));S.tweens.add({targets:ray,alpha:{from:0,to:.07},duration:4e3+R()*3e3,yoyo:!0,repeat:-1,delay:R()*5e3})}
 /* barco */
 S.mode="boat";const P0=M.start;S.boat=w(S.add.image(P0[0],P0[1],"arc-boat-red").setScale(.5).setDepth(P0[1]));S.bv={x:0,y:0};S.wakeT=0;S.bt=0;
 const p1=S.P[3]||[P0[0]+10,P0[1]-10];S.bang=Math.atan2(p1[1]-P0[1],p1[0]-P0[0]);
 /* herói (aparece ao desembarcar) */
 const cls=String(S.classId||"WARRIOR").toLowerCase(),key=[`mk4b-${cls}-t0`,`mk4b-${cls}`].find(k=>S.textures.exists(k));S.lay=S.cache.json.get(`mk4b-${cls}-layout`);S.hkey=key;
 S.hero=key?w(S.add.sprite(0,0,key,0).setScale(S.lay?.scale??.67).setOrigin(.5,(S.lay?.footY??(S.lay?.frameH??128)-8)/(S.lay?.frameH??128)).setVisible(!1)):null;S.hsh=w(S.add.ellipse(0,0,22,7,0,.3).setVisible(!1).setDepth(1.7));
 cam.startFollow(S.boat,!0,.05,.05);S.look={x:0,y:0};cam.centerOn(P0[0],P0[1]);
 /* folhas caindo (o vento empurra) e vaga-lumes */
 S.leaves=[];for(let k=0;k<48;k++){const f=w(S.add.rectangle(R()*S.W,R()*S.H,3,2,[0x9cc46a,0xc9b25a,0x6f9a4a][k%3],.85).setDepth(4e3));f.vx=10+R()*14;f.vy=14+R()*16;f.ph=R()*6;S.leaves.push(f)}
 for(let k=0;k<70;k++){const p=S.freeCell(R()<.5?1:2);if(!p)continue;const ff=w(S.add.image(p.x,p.y,"light").setScale(.05).setBlendMode(j.BlendModes.ADD).setTint(0xd8ff9a).setAlpha(0).setDepth(3e3));S.tweens.add({targets:ff,alpha:{from:0,to:.8},x:"+="+(R()*30-15),y:"-="+(R()*20),duration:1500+R()*1500,yoyo:!0,repeat:-1,delay:R()*3e3})}
 S.buildUI();S.lineDone=new Set;S.queue=[];S.time.delayedCall(1600,()=>S.say(0));
 try{S.game.audioEngine?.music?.("forest")}catch(e){}
 S.gust=.4;S.windEnv=null;fetch("assets/audio/ambient/river-wind.json").then(r=>r.json()).then(j_=>{S.windEnv=j_}).catch(()=>{});
 S.audioInit();S.events.once("shutdown",()=>S.audioStop());
 S.input.keyboard?.on("keydown-ESC",()=>S.finish(!0));S.keyE=S.input.keyboard?.addKey?.("E");
 cam.fadeIn(1200,0,0,0)}
/* ── sons ── */
audioInit(){const S=this,E=S.game.audioEngine;S.au={};const go=()=>{if(!S.sys?.isActive?.()||S.leaving)return;if(!E?.ctx||!E.ambientBus){S.time.delayedCall(600,go);return}const C=E.ctx,ogg=(new Audio).canPlayType("audio/ogg; codecs=vorbis")?"ogg":"mp3";window.__rpBuf=window.__rpBuf||{};
  fetch("assets/audio/ambient/boat-sfx.json").then(r=>r.json()).then(j_=>{S.sfxMap=j_}).catch(()=>{});
  for(const n of __RPA){const use=b=>{if(!S.sys?.isActive?.()||S.leaving)return;if(n==="boat-sfx"){S.sfxBuf=b;return}const src=C.createBufferSource();src.buffer=b;src.loop=!0;const g=C.createGain();g.gain.value=0;src.connect(g);g.connect(E.ambientBus);src.start(0,Math.random()*b.duration);S.au[n]={src,g}};
   if(window.__rpBuf[n]){use(window.__rpBuf[n]);continue}fetch(`assets/audio/ambient/${n}.${ogg}`).then(r=>r.arrayBuffer()).then(b=>C.decodeAudioData(b)).then(b=>{window.__rpBuf[n]=b;use(b)}).catch(()=>{})}};S.time.delayedCall(200,go)}
gain(n,v,tc=.35){const a=this.au?.[n],C=this.game.audioEngine?.ctx;if(!a||!C)return;a.g.gain.setTargetAtTime(Math.max(0,v),C.currentTime,tc)}
sfx(kind,vol=1,pan=0){const S=this,E=S.game.audioEngine,C=E?.ctx,L=S.sfxMap?.[kind];if(!C||!S.sfxBuf||!L||!L.length)return;const[o,d]=L[Math.floor(Math.random()*L.length)];try{const src=C.createBufferSource();src.buffer=S.sfxBuf;src.playbackRate.value=.92+Math.random()*.16;const g=C.createGain();g.gain.value=vol;let out=g;if(C.createStereoPanner){const p=C.createStereoPanner();p.pan.value=pan;g.connect(p);out=p}src.connect(g);out.connect(E.sfxBus||E.ambientBus);src.start(0,o,d)}catch(e){}}
audioStop(){const S=this,C=S.game.audioEngine?.ctx;for(const n in S.au||{}){const a=S.au[n];try{a.g.gain.setTargetAtTime(0,C.currentTime,.25);setTimeout(()=>{try{a.src.stop();a.src.disconnect()}catch(e){}},1200)}catch(e){}}S.au={}}
cell(x,y){const M=this.M,i=Math.floor(x/M.cell),j_=Math.floor(y/M.cell);if(i<0||j_<0||i>=M.gw||j_>=M.gh)return 0;return this.grid[j_*M.gw+i]}
freeCell(v){for(let t=0;t<60;t++){const x=Math.random()*this.W,y=Math.random()*this.H;if(this.cell(x,y)===v&&this.cell(x+10,y)===v&&this.cell(x-10,y)===v)return{x,y}}return null}
okArea(x,y,v,r){return this.cell(x,y)===v&&this.cell(x+r,y)===v&&this.cell(x-r,y)===v&&this.cell(x,y+r)===v&&this.cell(x,y-r)===v}
/* ponto do trajeto mais perto (busca local a partir do último) */
near(x,y,from){const P=this.P;if(!P.length)return-1;let b=-1,bd=1e18;const a0=from==null?0:Math.max(0,from-14),a1=from==null?P.length:Math.min(P.length,from+15);for(let i=a0;i<a1;i++){const d=(P[i][0]-x)**2+(P[i][1]-y)**2;if(d<bd){bd=d;b=i}}return b}
tan(i){const P=this.P,a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],m=Math.hypot(dx,dy)||1;return{x:dx/m,y:dy/m}}
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
/* narração: fila em ordem, uma fala nunca corta a outra */
say(i){const S=this;if(S.lineDone.has(i))return;S.lineDone.add(i);S.queue.push(i);S.speaking||S.nextLine()}
nextLine(){const S=this;if(!S.queue.length){S.speaking=!1;S.tweens.add({targets:S.nar,alpha:0,duration:600});return}S.speaking=!0;const i=S.queue.shift(),t=__arcLines()[i],ex=__ARC_EXPR[i]||"talk";
 S.textures.exists("guardia-p-"+ex)&&S.por.setTexture("guardia-p-"+ex);S.narTx.setText("");S.tweens.add({targets:S.nar,alpha:1,duration:300});let n=0;S.typer?.remove();S.typer=S.time.addEvent({delay:26,repeat:t.length-1,callback:()=>S.narTx.setText(t.slice(0,++n))});
 i===8&&(S.gustBoost=1);
 let fin=!1;const done=ok=>{if(fin)return;fin=!0;S.time.delayedCall(ok?1100:Math.max(3e3,t.length*60),()=>S.sys.isActive()&&S.nextLine())};
 try{window.__dub?window.__dub(t,done):done(!1)}catch(e){done(!1)}}
doAct(){const S=this,a=S.curAct;if(!a)return;if(a.kind==="land"){S.disembark();return}if(a.kind==="poi"){a.p.done=!0;S.say(a.p.line);S.game.audioEngine?.sfx?.("sfx-ui-tab");S.burst(a.p.x,a.p.y-20)}}
burst(x,y){const S=this;for(let k=0;k<10;k++){const c=S.w(S.add.circle(x,y,1.5,0xd8ff9a,.9).setDepth(5e3));S.tweens.add({targets:c,x:x+(Math.random()-.5)*50,y:y-20-Math.random()*30,alpha:0,duration:700,onComplete:()=>c.destroy()})}}
disembark(){const S=this;if(S.mode!=="boat")return;S.mode="land";S.bv={x:0,y:0};S.tweens.add({targets:S.boat,x:S.dock.x+34,y:S.dock.y+6,rotation:.25,duration:500});
 S.sfx("splash",.8);S.sfx("bump",.6);S.time.delayedCall(250,()=>S.sfx("step",.7));S.time.delayedCall(480,()=>S.sfx("step",.7));
 const Lp=S.M.land,hx=Lp[0],hy=Lp[1];S.hx=hx;S.hy=hy;S.hero&&S.hero.setPosition(hx,hy).setVisible(!0).setAlpha(0).setDepth(hy+1);S.hero&&S.tweens.add({targets:S.hero,alpha:1,duration:400});S.hsh.setPosition(hx,hy).setVisible(!0);
 S.hero&&S.anims.exists(S.hkey+"-idle")&&S.hero.play(S.hkey+"-idle");S.cameras.main.startFollow(S.hero||S.boat,!0,.08,.08);S.cameras.main.setFollowOffset(0,0);S.time.delayedCall(700,()=>S.say(4))}
axis(){const S=this,im=S.game.inputManager;try{im?.update?.()}catch(e){}let a=im?.axis?.()||{x:0,y:0};const k=im?.keyboardAxis?.()||{x:0,y:0};Math.hypot(k.x,k.y)>Math.hypot(a.x,a.y)&&(a=k);if(S.joy.on&&Math.hypot(S.joy.x,S.joy.y)>Math.hypot(a.x,a.y))a={x:S.joy.x,y:S.joy.y};const m=Math.hypot(a.x,a.y);return m<.15?{x:0,y:0}:{x:a.x/Math.max(1,m),y:a.y/Math.max(1,m)}}
push(o,list,rad){for(const q of list){const dx=o.x-q.x,dy=o.y-q.y,d=Math.hypot(dx,dy),m=rad+q.r;if(d<m&&d>.01){o.x=q.x+dx/d*m;o.y=q.y+dy/d*m}}}
/* anda deslizando pela borda: tenta o passo inteiro, depois só x, depois só y */
step(px,py,nx,ny,ok){if(ok(nx,ny))return[nx,ny];if(ok(nx,py))return[nx,py];if(ok(px,ny))return[px,ny];return[px,py]}
update(t,ms){const S=this;if(S.leaving)return;const dt=Math.min(.05,ms/1e3),a=S.axis(),im=S.game.inputManager,L3=__L3,M=S.M,cam=S.cameras.main;
 /* vento: envelope das rajadas do som (o mesmo laço que toca) */
 const WE=S.windEnv;let g=.45;if(WE?.env?.length){const ph=(t/1e3)%WE.dur*4,i0=Math.floor(ph),f=ph-i0;g=WE.env[i0%WE.env.length]*(1-f)+WE.env[(i0+1)%WE.env.length]*f}
 S.gustBoost=Math.max(0,(S.gustBoost||0)-dt*.12);S.gust+=(Math.min(1,g+S.gustBoost*.6)-S.gust)*Math.min(1,dt*2);const G=S.gust;
 const v=cam.worldView;for(const f of S.leaves){f.ph+=dt*2;f.x+=(f.vx*(.4+G*1.8)+Math.sin(f.ph)*10)*dt;f.y+=f.vy*(.7+G*.6)*dt;f.rotation+=dt*(2+G*3);if(f.y>v.bottom+10){f.y=v.top-10;f.x=v.x+Math.random()*v.width}if(f.x>v.right+10){f.x=v.x-5;f.y=v.y+Math.random()*v.height}}
 const tw=t/1e3;for(const im_ of S.sway){if(im_.x<v.x-80||im_.x>v.right+80||im_.y<v.y-20||im_.y>v.bottom+140)continue;im_.rotation=(Math.sin(tw*1.4+im_.ph)*.012+Math.sin(tw*3.1+im_.ph*2)*.005)*im_.amp*(.35+G*1.6)}
 /* fios de correnteza que descem com a água, perto da câmera */
 for(const e of S.streaks){if(e.life<=0){const x=v.x+Math.random()*v.width,y=v.y+Math.random()*v.height;if(S.cell(x,y)===2&&S.cell(x+12,y)===2&&S.cell(x-12,y)===2){const k=S.near(x,y);if(k>=0){const tn=S.tan(k);e.setPosition(x,y);e.vx=tn.x;e.vy=tn.y;e.sp=(S.flow[k]||30)*(.9+Math.random()*.5);e.setRotation(Math.atan2(tn.y,tn.x));e.max=e.life=1.4+Math.random()*1.4}}continue}
  e.life-=dt;e.x+=e.vx*e.sp*dt;e.y+=e.vy*e.sp*dt;const q=e.life/e.max;e.setAlpha(Math.sin(q*Math.PI)*(e.sp>55?.55:.3));if(S.cell(e.x,e.y)!==2)e.life=0}
 let act=null,flowNear=0;
 if(S.mode==="boat"){const B=S.boat,acc=170,max=100;S.pi=S.near(B.x,B.y,S.pi);const tn=S.pi>=0?S.tan(S.pi):{x:0,y:0},fl=S.pi>=0?(S.flow[S.pi]||28):0;flowNear=fl;
  S.bv.x+=a.x*acc*dt;S.bv.y+=a.y*acc*dt;const sp=Math.hypot(S.bv.x,S.bv.y);if(sp>max){S.bv.x*=max/sp;S.bv.y*=max/sp}const dr=Math.pow(.4,dt);S.bv.x*=dr;S.bv.y*=dr;
  /* correnteza: empurra rio abaixo e puxa de leve para o meio do canal */
  let cx=tn.x*fl*.85,cy=tn.y*fl*.85;if(S.pi>=0){const p=S.P[S.pi],ox=p[0]-B.x,oy=p[1]-B.y,lat=ox*-tn.y+oy*tn.x;cx+=-tn.y*lat*.35;cy+=tn.x*lat*.35}
  if(S.pi>=S.P.length-4){cx*=.2;cy*=.2}
  const vx=S.bv.x+cx,vy=S.bv.y+cy;const tx=B.x+vx*dt,ty=B.y+vy*dt;let[nx,ny]=S.step(B.x,B.y,tx,ty,(x,y)=>S.okArea(x,y,2,14));
  const o={x:nx,y:ny};S.push(o,S.wobs,12);S.okArea(o.x,o.y,2,12)&&(nx=o.x,ny=o.y);
  const hit=Math.abs(nx-tx)+Math.abs(ny-ty)>.3;if(hit){S.bv.x*=.7;S.bv.y*=.7;if(sp>45&&(S.bumpT||0)<t){S.bumpT=t+900;S.sfx("bump",Math.min(.8,sp/120));S.cameras.main.shake(120,.0015)}}
  B.setPosition(nx,ny).setDepth(ny);const tv=Math.hypot(vx,vy);S.bspd=tv;
  if(tv>6){const ang=Math.atan2(vy,vx);let d=ang-S.bang;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;S.bang+=d*Math.min(1,dt*2.6)}
  S.bt+=dt;B.setRotation(S.bang+Math.PI/2+Math.sin(S.bt*1.7)*.035).setScale(.5,.5*(1+Math.sin(S.bt*2.3)*.012));
  S.wakeT+=dt;if(tv>18&&S.wakeT>.11){S.wakeT=0;for(const sd of[-1,1]){const bx=B.x-Math.cos(S.bang)*26+Math.sin(S.bang)*sd*7,by=B.y-Math.sin(S.bang)*26-Math.cos(S.bang)*sd*7,e=S.w(S.add.ellipse(bx,by,8,4,0xcfeee4,.45).setDepth(.95).setRotation(S.bang));S.tweens.add({targets:e,x:bx+Math.sin(S.bang)*sd*10,y:by-Math.cos(S.bang)*sd*10,scaleX:2.6,scaleY:1.6,alpha:0,duration:1100,onComplete:()=>e.destroy()})}}
  /* remadas (som + respingo dos dois lados) e rangidos da madeira */
  const rowing=Math.hypot(a.x,a.y)>.3;S.rowT=(S.rowT||0)-dt;if(rowing&&S.rowT<=0){S.rowT=.95+Math.random()*.2;S.side=-(S.side||1);S.sfx("paddle",.75,S.side*.35);const px_=B.x+Math.sin(S.bang)*S.side*16,py_=B.y-Math.cos(S.bang)*S.side*16;for(let k=0;k<5;k++){const c=S.w(S.add.circle(px_,py_,1.4,0xe8fff8,.9).setDepth(ny+1));S.tweens.add({targets:c,x:px_+(Math.random()-.5)*14,y:py_-6-Math.random()*8,alpha:0,duration:450,onComplete:()=>c.destroy()})}const r=S.w(S.add.ellipse(px_,py_,6,3,0,0).setStrokeStyle(1,0xe8fff8,.7).setDepth(.9));S.tweens.add({targets:r,scaleX:3.4,scaleY:3,alpha:0,duration:900,onComplete:()=>r.destroy()})}
  S.creakT=(S.creakT??3)-dt;if(S.creakT<=0){S.creakT=4+Math.random()*6;tv>12&&S.sfx("creak",.35+Math.random()*.25,(Math.random()-.5)*.6)}
  /* câmera olha um pouco à frente do barco */
  const lk=.75;S.look.x+=(-vx*lk-S.look.x)*Math.min(1,dt*1.2);S.look.y+=(-vy*lk-S.look.y)*Math.min(1,dt*1.2);cam.setFollowOffset(S.look.x,S.look.y);
  /* roteiro da narração pelo quanto já desceu o rio */
  if(S.pi>=0)S.prog=Math.max(S.prog,S.P[S.pi][2]);for(const[li,sv]of S.cues)S.prog>=sv&&S.say(li);
  if(Math.hypot(B.x-S.dock.x,B.y-S.dock.y)<70)act={kind:"land",label:L3("⚓ Desembarcar","⚓ Disembark","⚓ Desembarcar")}}
 else if(S.hero){const spd=105;let[nx,ny]=S.step(S.hx,S.hy,S.hx+a.x*spd*dt,S.hy+a.y*spd*dt,(x,y)=>S.okArea(x,y,1,5)||Math.abs(x-S.dock.x)<14&&y>M.land[1]-10&&y<M.land[1]+20);const o={x:nx,y:ny};S.push(o,S.lobs,8);if(!(S.okArea(o.x,o.y,1,5)||Math.abs(o.x-S.dock.x)<14)){o.x=nx;o.y=ny}
  const moved=Math.hypot(o.x-S.hx,o.y-S.hy);S.hx=o.x;S.hy=o.y;
  S.hero.setPosition(o.x,o.y).setDepth(o.y+1);S.hsh.setPosition(o.x,o.y+1);a.x&&S.hero.setFlipX(a.x<0);const moving=Math.hypot(a.x,a.y)>.1,an=S.hkey+(moving?"-walk":"-idle");S.anims.exists(an)&&S.hero.anims.currentAnim?.key!==an&&S.hero.play(an);
  if(moved>.5&&Math.abs(o.x-S.dock.x)<16&&o.y>M.land[1]+4){S.stepT=(S.stepT||0)-dt;if(S.stepT<=0){S.stepT=.34;S.sfx("step",.5)}}
  for(const p of S.poi)if(!p.done&&Math.hypot(p.x-o.x,p.y-o.y)<48){act={kind:"poi",p,label:"✦ "+p.label};break}
  if(Math.hypot(o.x-M.exit[0],o.y-M.exit[1])<80){S.say(7);S.finish(!1)}}
 /* mixagem: rio perto, corredeira perto da garganta, casco pela velocidade, vento pelas rajadas */
 const fx=S.mode==="boat"?S.boat.x:S.hx,fy=S.mode==="boat"?S.boat.y:S.hy;let dg=1e9;for(const p of S.gorge){const d=Math.hypot(p[0]-fx,p[1]-fy);d<dg&&(dg=d)}
 if(S.au){S.gain("river-flow",S.mode==="boat"?.55:.3,.6);S.gain("river-rapids",Math.max(0,1-dg/420)**1.5*.95,.5);S.gain("boat-glide",S.mode==="boat"?Math.min(1,(S.bspd||0)/90)*.6:0,.25);S.gain("river-wind",.18+G*.5,.4)}
 S.curAct=act;S.act.setVisible(!!act);act&&S.actTx.text!==act.label&&S.actTx.setText(act.label);
 if(act&&(im?.justDown?.("INTERACT")||S.keyE&&j.Input.Keyboard.JustDown(S.keyE)))S.doAct()}
finish(skip){const S=this;if(S.leaving)return;S.leaving=!0;const go=()=>{try{window.__dubStop?.()}catch(e){}S.audioStop();S.scene.start(S.next.key,S.next.data)};
 S.hero&&S.anims.exists(S.hkey+"-idle")&&S.hero.play(S.hkey+"-idle");const fade=()=>{for(const n in S.au||{})S.gain(n,0,.3)};
 if(skip){fade();S.cameras.main.fadeOut(500,0,0,0);S.uiCam.fadeOut(500,0,0,0);S.time.delayedCall(520,go);return}
 let n=0;const wait=()=>{if((S.speaking||S.queue.length)&&n++<20){S.time.delayedCall(500,wait);return}fade();S.cameras.main.fadeOut(900,0,0,0);S.uiCam.fadeOut(900,0,0,0);S.time.delayedCall(920,go)};S.time.delayedCall(400,wait)}}
