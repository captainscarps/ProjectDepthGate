/* ══ Árvores do Modo Infinito · tela ════════════════════════════════════════════════════════════════════════
   Escolha no nível 3 (duas cartas com prévia animada) e a árvore em si: nós com formato por tipo, ligações que
   acendem, pulso nos nós disponíveis, explosão ao aprender, espaços de habilidade. Teclado, gamepad, toque e mouse. */
function __etUI(U){return U.__etp??(U.__etp=new __ETPanel(U))}
const __ETC={bg:0x12151c,card:0x1b1f28,card2:0x232833,line:0xffffff,amber:0xffc14d,amber2:0xffd27a,red:0xe08a7a,nm:0xff5a4a,green:0x8ae0b0};
class __ETPanel{
 constructor(U){this.ui=U;this.open=!1;this.built=!1;this.mode="tree";this.side="d";this.sel=0;this.cs=0;this.slotMode=!1;this.slotSel=0;this.confirm=!1;this.nodeUi=[];this.t=0;this.anim=[]}
 gs(){return this.ui.scene.get("Game")}
 tx(x,y,s,o={}){const t=this.ui.add.text(x,y,s,{fontFamily:typeof __UC_F!=="undefined"?__UC_F:"sans-serif",fontSize:(o.sz??10)+"px",fontStyle:o.b===!1?"normal":"bold",color:o.c??"#ffffff",lineSpacing:o.ls??2,align:o.al??"left",...(o.w?{wordWrap:{width:o.w}}:{})});t.setOrigin(o.ox??0,o.oy??0);return t}
 btn(x,y,s,cb,o={}){const t=this.tx(x,y,s,{sz:o.sz??10,ox:o.ox??.5,oy:.5,c:o.p?"#16130c":"#ffffff"});t.setPadding(o.px??12,6,o.px??12,6).setBackgroundColor(o.p?"#ffc14d":"rgba(255,255,255,0.10)").setInteractive({useHandCursor:!0});
  const bg=o.p?"#ffc14d":"rgba(255,255,255,0.10)",hv=o.p?"#ffd27a":"rgba(255,255,255,0.22)";t.on("pointerover",()=>t.setBackgroundColor(hv));t.on("pointerout",()=>t.setBackgroundColor(t.__bg??bg));t.on("pointerdown",()=>{this.ui.game.inputManager?.markTouchConsumed?.();cb()});try{Gt(t,8,6)}catch(e){}return t}
 build(){this.built=!0;const U=this.ui,ox=Math.round((_-640)/2);this.root=U.add.container(ox,0).setDepth(772).setVisible(!1);
  const dim=U.add.rectangle(_/2-ox,st/2,_*1.4,st*1.4,328450,.84).setInteractive();this.root.add(dim);
  this.cardG=U.add.graphics();this.root.add(this.cardG);
  this.title=this.tx(30,18,"",{sz:14});this.sub=this.tx(30,36,"",{sz:9,c:"#ffc14d"});this.root.add([this.title,this.sub]);
  this.tabG=U.add.graphics();this.root.add(this.tabG);this.tabs=["d","a"].map((k,n)=>{const t=this.tx(0,0,"",{sz:10,ox:.5,oy:.5});t.setInteractive({useHandCursor:!0});t.on("pointerdown",()=>{this.mode==="tree"&&(this.side=k,this.sel=0,this.slotMode=!1,this.buildTree(),this.refresh())});this.root.add(t);return t});
  this.clsBtn=this.btn(538,25,"",()=>this.toClass(),{sz:9,px:10});this.root.add(this.clsBtn);
  const cl=this.btn(606,25,"✕",()=>this.close(),{sz:13,px:9});this.root.add(cl);
  this.linesG=U.add.graphics();this.nodesG=U.add.graphics();this.fxG=U.add.graphics();this.iconL=U.add.container(0,0);this.labL=U.add.container(0,0);this.root.add([this.linesG,this.nodesG,this.iconL,this.fxG,this.labL]);
  this.lockC=U.add.container(0,0).setVisible(!1);const lg=U.add.graphics();lg.fillStyle(0x0b0d12,.72).fillRoundedRect(22,54,372,292,12);this.lockC.add([lg,this.tx(208,190,"🔒",{sz:28,ox:.5,oy:.5}),this.tx(208,224,"",{sz:11,ox:.5,oy:.5,c:"#e08a7a"})]);this.root.add(this.lockC);
  /* cartão de informação */
  this.infoG=U.add.graphics();this.root.add(this.infoG);
  this.iName=this.tx(414,64,"",{sz:13,w:190});this.iType=this.tx(414,0,"",{sz:8,c:"#16130c"});this.iType.setPadding(6,2,6,2).setBackgroundColor("#ffc14d");
  this.iPips=U.add.graphics();this.iReq=this.tx(414,0,"",{sz:9,c:"#e08a7a",w:190});this.iDesc=this.tx(414,0,"",{sz:10,b:!1,c:"#d8dce4",w:192,ls:3});this.iWhy=this.tx(414,0,"",{sz:8,c:"#9aa3b2",w:192});
  this.root.add([this.iName,this.iType,this.iPips,this.iReq,this.iDesc,this.iWhy]);
  this.buyBtn=this.btn(508,258,"",()=>this.buy(),{p:!0,sz:10});this.root.add(this.buyBtn);
  this.slotT=this.tx(414,280,"",{sz:8,c:"#9aa3b2"});this.root.add(this.slotT);this.slotG=U.add.graphics();this.root.add(this.slotG);this.slotUi=[];
  for(let k=0;k<4;k++){const x=432+k*46,y=312,im=U.add.image(x,y,"icon-sword").setVisible(!1),n=this.tx(x-15,y-15,`${k+1}`,{sz:7,c:"#9aa3b2"}),z=U.add.zone(x,y,40,40).setInteractive({useHandCursor:!0});
   z.on("pointerdown",()=>{this.slotSel=k;this.equipSel()});z.on("pointerover",()=>{this.slotMode&&(this.slotSel=k,this.refresh())});this.root.add([im,n,z]);this.slotUi.push({x,y,im,n,z})}
  this.hint=this.tx(508,342,"",{sz:7,ox:.5,oy:1,c:"#7d8696",w:196,al:"center"});this.root.add(this.hint);
  this.ptsT=this.tx(30,56,"",{sz:9,c:"#c4cad4"});this.root.add(this.ptsT);
  /* escolha */
  this.chC=U.add.container(0,0).setVisible(!1);this.root.add(this.chC);
  this.cfC=U.add.container(0,0).setVisible(!1).setDepth(5);this.root.add(this.cfC);
  U.events.on("update",(t,d)=>{try{this.open&&this.frame(d/1e3)}catch(e){}});
  U.events.once("shutdown",()=>{U.__etp=null})}
 show(mode){const S=this.gs();if(!S||!__etOn(S)||S.state!=="playing")return;this.built||this.build();const st=__etSt(S);
  if(!st.tree&&(S.stats.level??1)>=3)mode="choose";if(!st.tree&&mode!=="choose")mode="choose";
  this.mode=mode??"tree";this.side=st.tree??"d";this.sel=0;this.cs=0;this.slotMode=!1;this.confirm=!1;this.open=!0;this.root.setVisible(!0);
  this.ui.skillTree?.open&&this.ui.skillTree.close();this.ui.inventoryUI?.open&&this.ui.inventoryUI.close();
  this.ui.game.events.emit("ui:inventory",!0);this.ui.game.audioEngine?.sfx?.("sfx-ui-open");
  this.root.setAlpha(0);this.ui.tweens.add({targets:this.root,alpha:1,duration:160});
  this.mode==="choose"?this.buildChoose():this.buildTree(!0);this.refresh()}
 close(){if(!this.open)return;this.open=!1;this.confirm=!1;this.cfC?.setVisible(!1);this.root.setVisible(!1);this.ui.game.events.emit("ui:inventory",!1);this.ui.game.audioEngine?.sfx?.("sfx-ui-close");this.ui.refreshSkillsAlert?.()}
 toClass(){const S=this.gs();if(!__etSt(S)?.tree&&this.mode==="choose")return;this.close();this.ui.time.delayedCall(30,()=>{try{this.ui.skillTree.show()}catch(e){}})}
 tree(){const S=this.gs();return __ET[S.classDef.id]?.[this.side]}
 pos(n){return{x:208+n.x*64,y:n.t==="nm"?330:92+n.y*42}}
 /* ── árvore ─────────────────────────────────────────────────────────────────────────────────────────── */
 buildTree(pop){const U=this.ui;this.chC.setVisible(!1);this.iconL.removeAll(!0);this.labL.removeAll(!0);this.nodeUi=[];const T=this.tree();if(!T)return;
  T.nodes.forEach((n,k)=>{const p=this.pos(n),ic=U.textures.exists(n.ic)?n.ic:"icon-sword",im=U.add.image(p.x,p.y,ic);const s=20/Math.max(im.width,im.height);im.setScale(s);im.__s=s;
   const wb=n.w&&U.textures.exists(__ETFAM[n.w].ic)?U.add.image(p.x-13,p.y+12,__ETFAM[n.w].ic):null;wb&&wb.setScale(9/Math.max(wb.width,wb.height));const z=U.add.zone(p.x,p.y,36,36).setInteractive({useHandCursor:!0});z.on("pointerdown",()=>{if(this.mode!=="tree")return;this.ui.game.inputManager?.markTouchConsumed?.();this.sel===k&&!this.slotMode?this.buy():(this.sel=k,this.slotMode=!1,this.refresh())});
   z.on("pointerover",()=>{this.mode==="tree"&&!this.slotMode&&this.sel!==k&&(this.sel=k,this.refresh())});this.iconL.add([im,z]);wb&&this.iconL.add(wb);this.nodeUi.push({n,...p,im,z,k,wb});
   if(pop){im.setScale(0);this.ui.tweens.add({targets:im,scale:s,duration:260,delay:60+(n.t==="nm"?6:n.y)*55+Math.abs(n.x)*18,ease:"Back.easeOut"})}});
  this.labL.add(this.tx(30,330,__L3("PESADELO","NIGHTMARE","PESADILLA"),{sz:7,oy:.5,c:"#ff7a6a"}));pop&&(this.revealT=0)}
 refresh(){if(!this.built||!this.open)return;const S=this.gs();if(!S)return;const st=__etSt(S),C=this.ui.classDef??null,cls=S.classDef.id,TT=__ET[cls];
  const g=this.cardG.clear();g.fillStyle(__ETC.bg,.98).fillRoundedRect(14,8,612,346,16).lineStyle(1.5,0xffffff,.13).strokeRoundedRect(14.5,8.5,611,345,16);
  this.title.setText(__L3("ÁRVORE DO INFINITO","ENDLESS TREE","ÁRBOL DEL INFINITO")+"  ·  "+W(`class.${cls}`));
  this.clsBtn.setText(__L3("CLASSE","CLASS","CLASE")+(this.ui.game.inputManager?.device==="gamepad"?"  Ⓨ":"  [T]"));this.clsBtn.setX(this.mode==="choose"?9e3:500);
  const tg=this.tabG.clear();
  if(this.mode==="choose"){this.sub.setText(__L3("Nível 3: escolha a sua árvore. A outra fica trancada até o fim da run.","Level 3: choose your tree. The other one stays locked until the run ends.","Nivel 3: elige tu árbol. El otro queda bloqueado hasta el final de la partida."));
   for(const t of this.tabs)t.setVisible(!1);for(const o of[this.linesG,this.nodesG,this.iconL,this.labL,this.infoG,this.iName,this.iType,this.iPips,this.iReq,this.iDesc,this.iWhy,this.buyBtn,this.slotT,this.slotG,this.ptsT,this.lockC])o.setVisible(!1);for(const s of this.slotUi)s.im.setVisible(!1),s.n.setVisible(!1),s.z.setVisible(!1);
   this.refreshChoose();this.hint.setText(this.hintTxt());return}
  for(const o of[this.linesG,this.nodesG,this.iconL,this.labL,this.infoG,this.iName,this.iType,this.iPips,this.iReq,this.iDesc,this.iWhy,this.ptsT])o.setVisible(!0);
  const T=TT[this.side];this.sub.setText(`${__etL(T.n)}  ·  ${__L3("formato","shape","forma")} ${__etL(__ETSHAPE[T.sh])}  ·  ${__etL(T.s)}`);
  ["d","a"].forEach((k,n)=>{const t=this.tabs[n],on=k===this.side,lock=st.tree&&st.tree!==k;t.setVisible(!0).setText((k==="d"?__L3("DEFESA","DEFENSE","DEFENSA"):__L3("ATAQUE","ATTACK","ATAQUE"))+(lock?"  🔒":""));t.setPosition(300+n*84,25).setColor(on?"#16130c":lock?"#7d8696":"#c4cad4");
   on&&tg.fillStyle(__ETC.amber,1).fillRoundedRect(t.x-t.width/2-12,13,t.width+24,24,12);!on&&tg.fillStyle(0xffffff,.07).fillRoundedRect(t.x-t.width/2-12,13,t.width+24,24,12)});
  const locked=st.tree!==this.side;this.lockC.setVisible(locked);locked&&this.lockC.list[2].setText(__L3("Trancada nesta run — só leitura","Locked for this run — read only","Bloqueado en esta partida — solo lectura"));
  const fr=__etFree(S,!1),fn=__etFree(S,!0);this.ptsT.setText(`${__L3("Pontos","Points","Puntos")} ${Math.max(0,fr)}/${__etPts(S)}`+(__etNmPts(S)>0?`  ·  ${__L3("Pesadelo","Nightmare","Pesadilla")} ${Math.max(0,fn)}/${__etNmPts(S)}`:""));
  this.drawTree();this.refreshInfo();this.hint.setText(this.hintTxt())}
 rank(n){return __etSt(this.gs()).r[n.id]|0}
 nstate(n){const S=this.gs(),st=__etSt(S),r=st.r[n.id]|0;if(st.tree!==this.side)return"locked";if(r>=n.m)return"max";if(r>0)return __etWhyNot(S,n.id,this.side)?"own":"ownup";return __etWhyNot(S,n.id,this.side)?"no":"avail"}
 drawTree(){const S=this.gs(),T=this.tree(),lg=this.linesG.clear(),ng=this.nodesG.clear(),by={};for(const u of this.nodeUi)by[u.n.id]=u;
  /* ligações */
  for(const u of this.nodeUi)for(const q of u.n.req){if(q.startsWith("ab:"))continue;const ids=q.startsWith("any:")?q.slice(4).split("|"):[q.split(":")[0]];for(const id of ids){const a=by[id];if(!a)continue;
   const on=this.rank(a.n)>0&&this.rank(u.n)>0,half=this.rank(a.n)>0,dx=u.x-a.x,dy=u.y-a.y,l=Math.hypot(dx,dy)||1,ux=dx/l,uy=dy/l,x0=a.x+ux*19,y0=a.y+uy*19,x1=u.x-ux*19,y1=u.y-uy*19;
   q.startsWith("any:")?lg.lineStyle(on?2.5:1.5,on?__ETC.amber:0xffffff,on?.9:half?.35:.14):lg.lineStyle(on?3:2,on?__ETC.amber:0xffffff,on?.95:half?.4:.16);lg.lineBetween(x0,y0,x1,y1);u.__lk=u.__lk??[];}}
  for(const u of this.nodeUi){const n=u.n,s=this.nstate(n),sel=u.k===this.sel,r=this.rank(n),miss=r>0&&n.w&&!__etHas(S,n.w),x=u.x,y=u.y;
   const fill=s==="max"||s==="own"||s==="ownup"?(n.t==="nm"?0x3a1a18:0x2e2616):s==="avail"?__ETC.card2:0x15181f,bord=n.t==="nm"?__ETC.nm:s==="max"?__ETC.amber:s==="own"||s==="ownup"?__ETC.amber2:s==="avail"?0xffffff:0x5a6170,ba=s==="no"||s==="locked"?.45:1;
   const shape=(gg,rr)=>{if(n.t==="a"){gg.fillCircle(x,y,rr);return"c"}const pts=n.t==="s"?6:n.t==="top"?8:4,off=pts===4?0:pts===6?Math.PI/6:Math.PI/8,P=[];for(let k=0;k<pts;k++){const a=off+k*6.283/pts-Math.PI/2;P.push({x:x+Math.cos(a)*rr,y:y+Math.sin(a)*rr})}gg.fillPoints(P,!0);return P};
   ng.fillStyle(0,.35);shape(ng,n.t==="a"?17:19);ng.fillStyle(fill,1);const P=shape(ng,n.t==="a"?15:17);ng.lineStyle(sel?3:n.t==="top"?2.5:2,sel?__ETC.amber:bord,sel?1:ba);P==="c"?ng.strokeCircle(x,y,15):ng.strokePoints(P,!0,!0);
   n.t==="u"&&(ng.fillStyle(__ETC.amber,1).fillCircle(x+12,y-12,5),ng.lineStyle(1.5,0x16130c,1).lineBetween(x+9.5,y-12,x+14.5,y-12).lineBetween(x+12,y-14.5,x+12,y-9.5));
   n.t==="top"&&ng.fillStyle(__ETC.amber,.9).fillTriangle(x-5,y-21,x,y-26,x+5,y-21);
   for(let k=0;k<n.m;k++){const px=x-(n.m-1)*3.5+k*7,py=y+19;ng.fillStyle(k<r?(n.t==="nm"?__ETC.nm:__ETC.amber):0x3a404c,1).fillCircle(px,py,2.2)}
   if(n.w){const has=__etHas(S,n.w);ng.fillStyle(has?0x1b2a22:0x3a1a18,1).fillCircle(x-13,y+12,6.5).lineStyle(1.2,has?0x8ae0b0:__ETC.red,1).strokeCircle(x-13,y+12,6.5);u.wb&&u.wb.setAlpha(has?1:.8)[has?"clearTint":"setTint"](16747386)}
   u.im.setAlpha(s==="no"||s==="locked"?.38:miss?.55:1);(s==="no"||s==="locked"||miss)?u.im.setTint(miss?13417386:8421504):u.im.clearTint()}}
 /* animações contínuas: pulso nos disponíveis, luz correndo nas ligações acesas, anel no selecionado */
 frame(dt){this.t+=dt;const g=this.fxG.clear();if(this.mode==="choose"){this.frameChoose(g);return}const S=this.gs();if(!S)return;const by={};for(const u of this.nodeUi)by[u.n.id]=u;
  for(const u of this.nodeUi){const s=this.nstate(u.n);if(s==="avail"||s==="ownup"){const p=.5+Math.sin(this.t*4+u.k)*.5;g.lineStyle(2,u.n.t==="nm"?__ETC.nm:__ETC.amber,.15+.45*p).strokeCircle(u.x,u.y,22+p*3)}
   for(const q of u.n.req){if(q.startsWith("ab:"))continue;for(const id of(q.startsWith("any:")?q.slice(4).split("|"):[q.split(":")[0]])){const a=by[id];if(!a||!(this.rank(a.n)>0&&this.rank(u.n)>0))continue;
    const f=(this.t*.8+u.k*.17)%1,dx=u.x-a.x,dy=u.y-a.y;g.fillStyle(0xfff1c4,.9).fillCircle(a.x+dx*f,a.y+dy*f,2.2).fillStyle(__ETC.amber,.35).fillCircle(a.x+dx*f,a.y+dy*f,4.5)}}}
  const u=this.nodeUi[this.sel];if(u&&!this.slotMode){const a=this.t*2.4;g.lineStyle(2,0xffffff,.85);for(let k=0;k<4;k++){g.beginPath();g.arc(u.x,u.y,25,a+k*1.571,a+k*1.571+.7);g.strokePath()}}
  if(this.slotMode){const s=this.slotUi[this.slotSel],p=.5+Math.sin(this.t*6)*.5;s&&g.lineStyle(2,__ETC.amber,.4+.5*p).strokeRoundedRect(s.x-21,s.y-21,42,42,9)}
  for(let k=this.anim.length-1;k>=0;k--){const A=this.anim[k];A.t+=dt;const f=A.t/A.d;if(f>=1){this.anim.splice(k,1);continue}A.f(g,f)}}
 refreshInfo(){const S=this.gs(),u=this.nodeUi[this.sel],ig=this.infoG.clear();ig.fillStyle(__ETC.card,.96).fillRoundedRect(402,52,212,294,12).lineStyle(1,0xffffff,.1).strokeRoundedRect(402.5,52.5,211,293,12);
  if(!u)return;const n=u.n,r=this.rank(n),why=__etWhyNot(S,n.id,this.side);this.iName.setText(__etL(n.n));let y=64+this.iName.height+6;
  const typ=__etL(__ETTYPE[n.t])+(n.m>1&&n.t!=="top"?"  "+["I","I–II","I–III","I–IV","I–V"][n.m-1]:"");this.iType.setText(typ).setPosition(414,y).setBackgroundColor(n.t==="nm"?"#ff7a6a":n.t==="a"?"#8ae0b0":"#ffc14d");
  const pg=this.iPips.clear();for(let k=0;k<n.m;k++)pg.fillStyle(k<r?(n.t==="nm"?__ETC.nm:__ETC.amber):0x3a404c,1).fillRoundedRect(414+this.iType.width+10+k*12,y+3,9,6,3);y+=this.iType.height+6;
  if(n.w){const has=__etHas(S,n.w);this.iReq.setText(__L3("Requer: ","Requires: ","Requiere: ")+__etL(__ETFAM[n.w].n)+(has?"  ✓":__L3("  (não equipado)","  (not equipped)","  (no equipado)"))).setColor(has?"#8ae0b0":"#e08a7a").setPosition(414,y).setVisible(!0);y+=this.iReq.height+5}else this.iReq.setVisible(!1);
  this.iDesc.setText(__etL(n.d)).setPosition(414,y);y+=this.iDesc.height+6;
  const locked=__etSt(S).tree!==this.side;this.iWhy.setText(locked?__L3("Árvore trancada nesta run","Tree locked for this run","Árbol bloqueado en esta partida"):r>=n.m?__L3("Grau máximo","Max rank","Grado máximo"):why??(n.t==="nm"?__L3("Custa 1 ponto de Pesadelo","Costs 1 Nightmare point","Cuesta 1 punto de Pesadilla"):__L3("Custa 1 ponto","Costs 1 point","Cuesta 1 punto"))).setPosition(414,Math.min(y,244)).setColor(why&&!locked&&r<n.m?"#e08a7a":"#9aa3b2");
  const can=!why&&!locked;this.buyBtn.setVisible(can).setText(r>0?__L3("MELHORAR","UPGRADE","MEJORAR")+` ${__roman(r+1)}`:__L3("APRENDER","LEARN","APRENDER")).setY(Math.min(y+this.iWhy.height+20,266));
  const act=n.ab&&r>0,eq=S.skillState.equipped;this.slotT.setVisible(!!act).setText(this.slotMode?__L3("Escolha o espaço  ◀ ▶  e confirme","Pick a slot  ◀ ▶  and confirm","Elige un espacio  ◀ ▶  y confirma"):__L3("Toque num espaço para equipar","Tap a slot to equip","Toca un espacio para equipar"));
  const sg=this.slotG.clear();this.slotUi.forEach((s,k)=>{s.im.setVisible(!!act&&!!eq[k]);s.n.setVisible(!!act);s.z.setVisible(!!act);if(!act)return;const id=eq[k],me=id===n.ab;
   sg.fillStyle(me?0x2e2616:0x15181f,1).fillRoundedRect(s.x-19,s.y-19,38,38,8).lineStyle(me?2:1,me?__ETC.amber:0xffffff,me?1:.15).strokeRoundedRect(s.x-19,s.y-19,38,38,8);
   if(id&&Ye[id]){const ic=this.ui.textures.exists(Ye[id].icon)?Ye[id].icon:"icon-sword";s.im.setTexture(ic);s.im.setScale(24/Math.max(s.im.width,s.im.height))}})}
 hintTxt(){const pad=this.ui.game.inputManager?.device==="gamepad",touch=this.ui.game.inputManager?.device==="touch";if(touch)return"";
  if(this.mode==="choose")return pad?__L3("◀ ▶ escolher · Ⓐ confirmar","◀ ▶ choose · Ⓐ confirm","◀ ▶ elegir · Ⓐ confirmar"):__L3("← → escolher · Enter confirmar","← → choose · Enter confirm","← → elegir · Enter confirmar");
  return pad?__L3("✥ mover · Ⓐ aprender/equipar · LB/RB trocar árvore · Ⓨ árvore da classe · Ⓑ fechar","✥ move · Ⓐ learn/equip · LB/RB switch tree · Ⓨ class tree · Ⓑ close","✥ mover · Ⓐ aprender/equipar · LB/RB cambiar árbol · Ⓨ árbol de clase · Ⓑ cerrar")
   :__L3("Setas mover · Enter aprender/equipar · Q/E trocar árvore · T árvore da classe · Esc fechar","Arrows move · Enter learn/equip · Q/E switch tree · T class tree · Esc close","Flechas mover · Enter aprender/equipar · Q/E cambiar árbol · T árbol de clase · Esc cerrar")}
 buy(){const S=this.gs(),u=this.nodeUi[this.sel];if(!u)return;const n=u.n,r=this.rank(n);
  if(r>0&&n.ab&&(r>=n.m||__etWhyNot(S,n.id,this.side))){this.slotMode=!0;this.slotSel=Math.max(0,S.skillState.equipped.indexOf(n.ab));this.refresh();return}
  if(!__etBuy(S,n.id)){this.ui.game.audioEngine?.sfx?.("sfx-event-refuse")||S.audioRef?.play("sfx-event-refuse");this.shake(u);return}
  S.audioRef?.play("sfx-ability-ready");this.burst(u);this.refresh();this.ui.refreshSkillsAlert?.()}
 shake(u){this.ui.tweens.add({targets:u.im,x:u.x+4,duration:40,yoyo:!0,repeat:2,onComplete:()=>u.im.setX(u.x)})}
 burst(u){const U=this.ui,c=u.n.t==="nm"?__ETC.nm:__ETC.amber,l=U.add.image(u.x,u.y,"light").setTint(c).setBlendMode(j.BlendModes.ADD).setScale(.05).setAlpha(.95);this.root.add(l);U.tweens.add({targets:l,scale:.42,alpha:0,duration:520,ease:"Cubic.easeOut",onComplete:()=>l.destroy()});
  U.tweens.add({targets:u.im,scale:u.im.__s*1.45,duration:120,yoyo:!0,ease:"Quad.easeOut"});
  this.anim.push({t:0,d:.55,f:(g,f)=>{g.lineStyle(3*(1-f),c,1-f).strokeCircle(u.x,u.y,20+f*34);for(let k=0;k<8;k++){const a=k*.785+f;g.fillStyle(0xfff1c4,1-f).fillCircle(u.x+Math.cos(a)*(16+f*40),u.y+Math.sin(a)*(16+f*40),2*(1-f)+.5)}}});
  const by={};for(const q of this.nodeUi)by[q.n.id]=q;for(const q of u.n.req){if(q.startsWith("ab:"))continue;for(const id of(q.startsWith("any:")?q.slice(4).split("|"):[q.split(":")[0]])){const a=by[id];if(!a||!(this.rank(a.n)>0))continue;
   this.anim.push({t:0,d:.35,f:(g,f)=>{g.lineStyle(4,0xfff1c4,.9).lineBetween(a.x,a.y,a.x+(u.x-a.x)*f,a.y+(u.y-a.y)*f)}})}}
  const t=this.tx(u.x,u.y-26,"+1",{sz:11,ox:.5,oy:.5,c:"#ffe08a"});this.root.add(t);U.tweens.add({targets:t,y:u.y-46,alpha:0,duration:700,onComplete:()=>t.destroy()})}
 equipSel(){const S=this.gs(),u=this.nodeUi[this.sel];if(!u?.n.ab||this.rank(u.n)<=0)return;__etEquip(S,u.n.ab,this.slotSel);S.audioRef?.play("sfx-class-select");this.slotMode=!1;
  const s=this.slotUi[this.slotSel];this.anim.push({t:0,d:.4,f:(g,f)=>g.lineStyle(3*(1-f),__ETC.amber,1-f).strokeRoundedRect(s.x-20-f*8,s.y-20-f*8,40+f*16,40+f*16,10)});this.refresh()}
 nav(dir){const L=this.nodeUi,c=L[this.sel];if(!c)return;let best=null,bs=1e9;for(const u of L){if(u===c)continue;const dx=u.x-c.x,dy=u.y-c.y,p=dir==="L"?-dx:dir==="R"?dx:dir==="U"?-dy:dy,q=dir==="L"||dir==="R"?Math.abs(dy):Math.abs(dx);if(p<=4)continue;const sc=p+q*2.2;sc<bs&&(bs=sc,best=u)}
  best&&(this.sel=best.k,this.ui.game.audioEngine?.sfx?.("sfx-ui-move"),this.refresh())}
 handleKey(k){if(!this.open)return!1;if(this.confirm)return this.confirmKey(k),!0;
  if(this.mode==="choose"){if(k==="ArrowLeft"||k==="ArrowRight"||k==="q"||k==="e"){this.cs=1-this.cs;this.ui.game.audioEngine?.sfx?.("sfx-ui-move");this.refresh()}else if(k==="Enter"||k===" ")this.askChoose(this.cs);else if(k==="Escape"){this.close()}return!0}
  if(this.slotMode){if(k==="ArrowLeft")this.slotSel=(this.slotSel+3)%4,this.refresh();else if(k==="ArrowRight")this.slotSel=(this.slotSel+1)%4,this.refresh();else if(k==="Enter"||k===" ")this.equipSel();else if(k==="Escape"||k==="Backspace")this.slotMode=!1,this.refresh();return!0}
  if(k==="ArrowLeft")this.nav("L");else if(k==="ArrowRight")this.nav("R");else if(k==="ArrowUp")this.nav("U");else if(k==="ArrowDown")this.nav("D");
  else if(k==="Enter"||k===" ")this.buy();else if(k==="q"||k==="Q"||k==="e"||k==="E"){this.side=this.side==="d"?"a":"d";this.sel=0;this.buildTree(!0);this.refresh();this.ui.game.audioEngine?.sfx?.("sfx-ui-move")}
  else if(k==="t"||k==="T")this.toClass();else if(k==="Escape"||k==="Backspace")this.close();else return!1;return!0}
 /* ── escolha no nível 3 ─────────────────────────────────────────────────────────────────────────────── */
 buildChoose(){const U=this.ui,S=this.gs(),cls=S.classDef.id,C=this.chC;C.removeAll(!0);C.setVisible(!0);this.chCards=[];
  ["d","a"].forEach((k,i)=>{const T=__ET[cls][k],x=32+i*292,y=60,w=276,h=262,c=U.add.container(x,y+30).setAlpha(0),g=U.add.graphics();c.add(g);
   c.add(this.tx(18,14,k==="d"?__L3("DEFESA","DEFENSE","DEFENSA"):__L3("ATAQUE","ATTACK","ATAQUE"),{sz:9,c:"#ffc14d"}));c.add(this.tx(18,28,__etL(T.n),{sz:15,w:w-36}));
   c.add(this.tx(18,50,__L3("formato ","shape ","forma ")+__etL(__ETSHAPE[T.sh]),{sz:8,c:"#9aa3b2"}));c.add(this.tx(18,64,__etL(T.s),{sz:9,b:!1,c:"#d8dce4",w:w-36,ls:3}));
   const pv=U.add.graphics();c.add(pv);const ics=[];for(const n of T.nodes){if(n.t==="nm")continue;const px=w/2+n.x*44,py=112+n.y*22,im=U.add.image(px,py,U.textures.exists(n.ic)?n.ic:"icon-sword");im.setScale(12/Math.max(im.width,im.height)).setAlpha(.9);c.add(im);ics.push({n,x:px,y:py,im})}
   const b=this.btn(w/2,h-22,__L3("ESCOLHER","CHOOSE","ELEGIR"),()=>{this.cs=i;this.askChoose(i)},{p:!0,sz:11});c.add(b);
   const z=U.add.zone(w/2,h/2-20,w,h-50).setInteractive({useHandCursor:!0});z.on("pointerover",()=>{this.cs!==i&&(this.cs=i,this.refresh())});z.on("pointerdown",()=>{this.ui.game.inputManager?.markTouchConsumed?.();this.cs===i?this.askChoose(i):(this.cs=i,this.refresh())});c.addAt(z,1);
   C.add(c);this.chCards.push({c,g,pv,ics,w,h,T,k});U.tweens.add({targets:c,y,alpha:1,duration:340,delay:80+i*110,ease:"Cubic.easeOut"})})}
 refreshChoose(){const S=this.gs();for(const[i,o]of this.chCards.entries()){const s=i===this.cs,g=o.g.clear();g.fillStyle(s?__ETC.card2:0x161a22,.98).fillRoundedRect(0,0,o.w,o.h,14).lineStyle(s?2.5:1,s?__ETC.amber:0xffffff,s?1:.12).strokeRoundedRect(.5,.5,o.w-1,o.h-1,14);
   const pv=o.pv.clear(),by={};for(const q of o.ics)by[q.n.id]=q;for(const q of o.ics)for(const r of q.n.req){if(r.startsWith("ab:"))continue;for(const id of(r.startsWith("any:")?r.slice(4).split("|"):[r.split(":")[0]])){const a=by[id];a&&pv.lineStyle(1.5,s?__ETC.amber:0xffffff,s?.55:.2).lineBetween(a.x,a.y,q.x,q.y)}}
   for(const q of o.ics){pv.fillStyle(0x0f1218,1).fillCircle(q.x,q.y,8).lineStyle(1,s?__ETC.amber2:0xffffff,s?.9:.25).strokeCircle(q.x,q.y,8)}o.c.setScale(s?1:.97)}}
 frameChoose(g){if(!this.chCards)return;const o=this.chCards[this.cs];if(!o)return;const p=.5+Math.sin(this.t*3.2)*.5,x=o.c.x,y=o.c.y;g.lineStyle(3,__ETC.amber,.12+.25*p).strokeRoundedRect(x-4,y-4,o.w+8,o.h+8,17);
  const f=(this.t*.35)%1;for(const q of o.ics){const k=(q.y-112)/120;Math.abs(k-f)<.08&&g.fillStyle(0xfff1c4,.9*(1-Math.abs(k-f)/.08)).fillCircle(x+q.x,y+q.y,3)}
  for(let k=this.anim.length-1;k>=0;k--){const A=this.anim[k];A.t+=.016;const ff=A.t/A.d;if(ff>=1){this.anim.splice(k,1);continue}A.f(g,ff)}}
 askChoose(i){const U=this.ui,S=this.gs(),T=__ET[S.classDef.id][i===0?"d":"a"],C=this.cfC;C.removeAll(!0);this.confirm=!0;this.cfSel=0;const g=U.add.graphics();g.fillStyle(0,.55).fillRect(-200,-50,1040,460).fillStyle(__ETC.bg,1).fillRoundedRect(150,110,340,140,14).lineStyle(2,__ETC.amber,1).strokeRoundedRect(150.5,110.5,339,139,14);
  C.add(g);C.add(this.tx(320,134,__L3("Escolher ","Choose ","¿Elegir ")+__etL(T.n)+"?",{sz:13,ox:.5,w:300,al:"center"}));C.add(this.tx(320,170,__L3("A outra árvore fica trancada para este herói até o fim da run.","The other tree stays locked for this hero until the run ends.","El otro árbol queda bloqueado para este héroe hasta el final de la partida."),{sz:9,b:!1,c:"#c4cad4",ox:.5,w:300,al:"center"}));
  this.cfB=[this.btn(262,222,__L3("CONFIRMAR","CONFIRM","CONFIRMAR"),()=>this.doChoose(i),{p:!0,sz:10}),this.btn(386,222,__L3("VOLTAR","BACK","VOLVER"),()=>{this.confirm=!1;C.setVisible(!1)},{sz:10})];C.add(this.cfB);
  C.setVisible(!0).setAlpha(0);U.tweens.add({targets:C,alpha:1,duration:140});this.refreshConfirm()}
 refreshConfirm(){this.cfB?.forEach((b,k)=>{const on=k===this.cfSel;b.__bg=k===0?(on?"#ffd27a":"#c99a3a"):(on?"rgba(255,255,255,0.28)":"rgba(255,255,255,0.10)");b.setBackgroundColor(b.__bg)})}
 confirmKey(k){if(k==="ArrowLeft"||k==="ArrowRight")this.cfSel=1-this.cfSel,this.refreshConfirm();else if(k==="Enter"||k===" ")this.cfSel===0?this.doChoose(this.cs):(this.confirm=!1,this.cfC.setVisible(!1));else if(k==="Escape"||k==="Backspace")this.confirm=!1,this.cfC.setVisible(!1)}
 doChoose(i){const S=this.gs(),side=i===0?"d":"a";if(!__etChoose(S,side))return;this.confirm=!1;this.cfC.setVisible(!1);const U=this.ui,me=this.chCards[i],ot=this.chCards[1-i];
  S.audioRef?.play("sfx-ability-ready");U.game.audioEngine?.stinger?.("level_up");U.cameras.main.flash(180,255,210,120);
  U.tweens.add({targets:me.c,scale:1.06,duration:180,yoyo:!0,ease:"Quad.easeOut"});U.tweens.add({targets:ot.c,alpha:.25,duration:300});
  const lk=this.tx(ot.c.x+ot.w/2,ot.c.y+40,"🔒",{sz:30,ox:.5,oy:.5});lk.setAlpha(0);this.chC.add(lk);U.tweens.add({targets:lk,y:ot.c.y+ot.h/2-10,alpha:1,duration:420,ease:"Bounce.easeOut"});
  const l=U.add.image(me.c.x+me.w/2,me.c.y+me.h/2,"light").setTint(__ETC.amber).setBlendMode(j.BlendModes.ADD).setScale(.1).setAlpha(.9);this.root.add(l);U.tweens.add({targets:l,scale:1.4,alpha:0,duration:700,onComplete:()=>l.destroy()});
  U.time.delayedCall(820,()=>{if(!this.open)return;this.mode="tree";this.side=side;this.sel=0;this.chC.setVisible(!1);this.buildTree(!0);this.refresh();S.game.events.emit("ui:banner",__L3("Árvore escolhida: ","Tree chosen: ","Árbol elegido: ")+__etL(__ET[S.classDef.id][side].n),"#ffc14d")})}}
/* ── entradas: botão de habilidades do HUD, teclado/gamepad, aba Habilidades do inventário ─────────────── */
{const O0=Vd.prototype.onSkillsOpen;Vd.prototype.onSkillsOpen=function(){try{const S=this.scene.get("Game");if(__etOn(S)&&(S.stats.level??1)>=3&&!(this.result?.isVisible?.()||this.pauseMenu?.open||this.shopUI?.open||this.storyPanel?.visible||this.blessingPanel?.visible)){
 const P=__etUI(this);if(P.open){P.close();return}if(this.skillTree?.open){this.skillTree.close();return}P.show();return}}catch(e){}return O0.apply(this,arguments)}}
{const A0=Vd.prototype.refreshSkillsAlert;Vd.prototype.refreshSkillsAlert=function(){const r=A0.apply(this,arguments);try{const S=this.scene.get("Game");if(__etOn(S)&&(S.stats.level??1)>=3){const st=__etSt(S);(!st.tree||__etFree(S,!1)>0||__etFree(S,!0)>0)&&this.hud?.setSkillsAlert?.(!0)}}catch(e){}return r}}
{const H0=Rd.prototype.handleKey;Rd.prototype.handleKey=function(k){if(this.open&&!this.__emb&&(k==="t"||k==="T")){const S=this.gs();if(__etOn(S)&&(S.stats.level??1)>=3){this.close();this.ui.time.delayedCall(30,()=>__etUI(this.ui).show());return!0}}return H0.apply(this,arguments)}}
{const B0=Rd.prototype.build;Rd.prototype.build=function(){const r=B0.apply(this,arguments);try{const i=this.ui,t=i.add.text(470,312,"",{fontFamily:typeof __UC_F!=="undefined"?__UC_F:"sans-serif",fontSize:"9px",fontStyle:"bold",color:"#16130c"}).setOrigin(.5).setPadding(10,5,10,5).setBackgroundColor("#ffc14d").setInteractive({useHandCursor:!0}).setVisible(!1);
 t.on("pointerdown",()=>{const S=this.gs();if(!__etOn(S))return;this.__emb?this.ui.inventoryUI?.close?.():this.close();this.ui.time.delayedCall(40,()=>__etUI(this.ui).show())});this.root.add(t);this.__etBtn=t}catch(e){}return r}}
{const F0=Rd.prototype.refresh;Rd.prototype.refresh=function(){const r=F0.apply(this,arguments);try{const b=this.__etBtn;if(b){const S=this.gs(),on=__etOn(S)&&(S.stats.level??1)>=3;b.setVisible(!!on&&this.open);on&&b.setText("★ "+__L3("ÁRVORE DO INFINITO","ENDLESS TREE","ÁRBOL DEL INFINITO")+(this.ui.game.inputManager?.device==="gamepad"?"  Ⓨ":"  [T]"));this.root.bringToTop(b)}}catch(e){}return r}}
/* no inventário, Y/T na aba Habilidades abre a árvore do infinito (nas outras abas continua abrindo a forja) */
setTimeout(()=>{try{const F1=__openForge;__openForge=function(inv){try{const S=inv?.gs?.();if(inv?.__logicalTab===4&&__etOn(S)&&(S.stats.level??1)>=3){inv.close();inv.ui.time.delayedCall(40,()=>__etUI(inv.ui).show());return}}catch(e){}return F1.apply(this,arguments)}}catch(e){}},0);
