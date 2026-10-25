/* ── Títulos de região e prévia dos portais ────────────────────────────────────────────────────────────
   • ao entrar numa fase da campanha aparece o nome dela grande no alto da tela, com um subtítulo e um sino
     suave (como nos títulos do prólogo do rio)
   • na floresta, o mesmo ao chegar pela primeira vez no Coração da Floresta e no Jardim Escondido
   • no Coração da Floresta, cada portal ganha uma placa com a situação da região (aberto, concluído
     ou trancado), que aparece quando o herói chega perto — dá para ver de longe o que ainda falta abrir    */
const __RT_SUB={forest:["Onde a jornada começa","Where the journey begins","Donde comienza el viaje"],
 temple:["As areias guardam segredos","The sands keep their secrets","Las arenas guardan secretos"],
 catacombs:["Onde os mortos não descansam","Where the dead do not rest","Donde los muertos no descansan"],
 ruins:["Ecos de um reino caído","Echoes of a fallen kingdom","Ecos de un reino caído"],
 glacial:["O frio que nunca derrete","A cold that never thaws","Un frío que nunca se derrite"],
 fortress:["O ninho dos dragões","The dragons' nest","El nido de los dragones"],
 bosque:["A mata que respira","The jungle that breathes","La selva que respira"],
 rio:["Ilhas à deriva no nevoeiro","Islands adrift in the fog","Islas a la deriva en la niebla"],
 morta:["Onde a vida esqueceu de voltar","Where life forgot to return","Donde la vida olvidó volver"],
 vulcao:["O coração em brasa da terra","The burning heart of the earth","El corazón ardiente de la tierra"],
 castle:["O trono de Valdrak","Valdrak's throne","El trono de Valdrak"]};
function __rtChime(S){const E=S.game.audioEngine,C=E?.ctx;if(!C||C.state!=="running")return;try{const t=C.currentTime,out=E.sfxBus||E.ambientBus||C.destination;[[1046.5,.045,0],[1568,.028,.06],[2093,.014,.12]].forEach(([f,v,d])=>{const o=C.createOscillator(),g=C.createGain();o.type="sine";o.frequency.value=f;g.gain.setValueAtTime(0,t+d);g.gain.linearRampToValueAtTime(v,t+d+.02);g.gain.exponentialRampToValueAtTime(.0003,t+d+2.6);o.connect(g);g.connect(out);o.start(t+d);o.stop(t+d+2.7)})}catch(e){}}
/* desenha o título na tela de interface (fila: um de cada vez) */
function __rtTitle(G,name,sub){const U=G.scene.get("UI");if(!U||!U.sys?.isActive?.())return;(G.__rtQ=G.__rtQ||[]).push([name,sub]);G.__rtOn||__rtNext(G)}
function __rtNext(G){const U=G.scene.get("UI"),it=(G.__rtQ||[]).shift();if(!it||!U||!U.sys?.isActive?.()||!G.sys?.isActive?.()){G.__rtOn=!1;return}
 /* espera painéis grandes fecharem (história, bênção, resultado) */
 if(U.storyPanel?.visible||U.blessingPanel?.visible||U.result?.isVisible?.()){G.__rtQ.unshift(it);G.__rtOn=!0;U.time.delayedCall(700,()=>__rtNext(G));return}
 G.__rtOn=!0;const[name,sub]=it,F="Georgia, 'Times New Roman', serif",C=U.add.container(_/2,st*.2).setDepth(940).setAlpha(0),sh=U.add.image(0,3,"light").setTint(0).setAlpha(.5).setScale(3,.62);
 const tx=U.add.text(0,-3,name,{fontFamily:F,fontStyle:"bold",fontSize:"24px",color:"#fbf1d4",stroke:"#2a1808",strokeThickness:3}).setOrigin(.5).setShadow(0,2,"#000000",6,!0,!0).setScale(.94);
 const sb=U.add.text(0,19,(sub||"").toUpperCase(),{fontFamily:F,fontStyle:"italic",fontSize:"9px",color:"#ecdcac",letterSpacing:3}).setOrigin(.5).setAlpha(0);
 const wl=tx.width/2+12,gl=U.add.graphics();gl.lineStyle(1,0xd9b86a,.95).lineBetween(-wl-62,-3,-wl-4,-3).lineBetween(wl+4,-3,wl+62,-3);gl.fillStyle(0xf2d78f,1);for(const s of[-1,1]){const dx=s*wl;gl.fillTriangle(dx-3,-3,dx,-6,dx+3,-3).fillTriangle(dx-3,-3,dx,0,dx+3,-3);gl.fillCircle(s*(wl+64),-3,1.2)}gl.setScale(0,1);
 C.add([sh,gl,tx,sb]);__rtChime(G);
 U.tweens.add({targets:C,alpha:1,duration:900,ease:"Sine.easeOut"});U.tweens.add({targets:tx,scale:1,duration:1400,ease:"Sine.easeOut"});U.tweens.add({targets:gl,scaleX:1,duration:1100,delay:150,ease:"Cubic.easeOut"});U.tweens.add({targets:sb,alpha:.92,duration:900,delay:450});
 U.time.delayedCall(4200,()=>U.tweens.add({targets:C,alpha:0,y:C.y-6,duration:1100,ease:"Sine.easeIn",onComplete:()=>{C.destroy();U.time.delayedCall(500,()=>__rtNext(G))}}))}
/* entrada na fase */
{const C0=Sd.prototype.create;Sd.prototype.create=function(){const r=C0.apply(this,arguments);const S=this;try{window.__heroCls=String(S.classDef?.id||S.classId||"").toUpperCase();
 const mode=S.game.registry.get("mode");if(mode!=="campaign"||S.level?.endless||S.isRift)return r;S.__rtOn=!1;S.__rtQ=[];
 const id=S.levelId,name=St(`lvl.${id}`,S.level?.name??id),sb=__RT_SUB[id];S.time.delayedCall(1300,()=>S.sys.isActive()&&__rtTitle(S,name,sb?__L3(...sb):""));
 /* salas especiais da floresta */
 if(id==="forest"){const seen=new Set,t0=S.time.now,up=()=>{const R=S.roomManager?.activeRoom,d=R?.def;if(!d||seen.has(d.id)||S.state!=="playing")return;if(d.hub||d.secret){seen.add(d.id);d.hub&&seen.size===1&&S.time.now-t0<4e3||__rtTitle(S,d.name??"",__L3("Floresta de Eldervale","Eldervale Forest","Bosque de Eldervale"))}};
  /* sai junto com a fase (antes ficava preso e, ao voltar à floresta, o título das salas especiais podia aparecer duas vezes) */
  S.events.on("update",up);S.events.once("shutdown",()=>S.events.off("update",up))}}catch(e){}return r}}
/* placas dos portais no Coração da Floresta */
{const HP=__hubPortals;__hubPortals=function(S){const had=!!S.__hubPortals,v=HP.apply(this,arguments);try{if(!had&&S.__hubPortals?.length)__rtPlates(S)}catch(e){}return v}}
function __rtPlates(S){const F="Georgia, 'Times New Roman', serif",P=[];
 for(const hp of S.__hubPortals){const id=hp.__level;if(!id)continue;const name=id==="__refugio"?__L3("Refúgio","Refuge","Refugio"):St(`lvl.${id}`,ki[id]?.name??id);
  const st_=()=>hp.__sealed?["✓ "+__L3("Concluído","Completed","Completado"),"#9fe0a8"]:hp.__locked?["🔒 "+__L3("Trancado","Locked","Cerrado"),"#e0a0a0"]:["✦ "+__L3("Aberto","Open","Abierto"),"#f2d78f"];
  /* o nome já aparece embaixo do portal: a placa mostra a situação */
  const[sl,sc]=st_(),y=hp.y-(hp.displayHeight||60)*(hp.originY??.5)-10,c=S.add.container(hp.x,y).setDepth(9e3).setAlpha(0);
  const t2=S.add.text(0,0,sl,{fontFamily:F,fontStyle:"bold",fontSize:"8px",color:sc,stroke:"#120a04",strokeThickness:3}).setOrigin(.5);
  const w=t2.width+14,bg=S.add.graphics();bg.fillStyle(0x0b0f16,.6).fillRoundedRect(-w/2,-8,w,16,5).lineStyle(1,0xc9a24a,.55).strokeRoundedRect(-w/2,-8,w,16,5);
  c.add([bg,t2]);P.push({hp,c,t2,st_,last:sl,name})}
 const upd=()=>{const p=S.player;if(!p)return;for(const o of P){const d=Math.hypot(o.hp.x-p.x,o.hp.y-p.y),a=Math.max(0,Math.min(1,1-(d-70)/130));o.c.setAlpha(o.c.alpha+(a-o.c.alpha)*.15);if(a>0){const[sl,sc]=o.st_();sl!==o.last&&(o.last=sl,o.t2.setText(sl).setColor(sc))}}};
 S.events.on("update",upd);S.events.once("shutdown",()=>S.events.off("update",upd))}
/* ── escolha de herói: língua nativa no card ── */
const __HLANG={WARRIOR:["Inglês (Reino Unido)","English (UK)","Inglés (Reino Unido)"],BERSERKER:["Japonês","Japanese","Japonés"],ARCHER:["Japonês","Japanese","Japonés"],
 HUNTER:["Inglês (Canadá)","English (Canada)","Inglés (Canadá)"],DRUID:["Tcheco (República Tcheca)","Czech (Czech Republic)","Checo (República Checa)"],NECROMANCER:["Polonês","Polish","Polaco"],MAGE:["Árabe (Egito)","Arabic (Egypt)","Árabe (Egipto)"],
 ROGUE:["Francês (Seicheles)","French (Seychelles)","Francés (Seychelles)"],SHAMAN:["Nheengatu","Nheengatu","Ñeengatú"]};
{const C0=bl.prototype.create;bl.prototype.create=function(){const r=C0.apply(this,arguments);try{if(this.tagTxt&&this.nameTxt&&!this.natTxt){
  this.natTxt=this.add.text(this.nameTxt.x,this.tagTxt.y+1,"",{fontFamily:"Georgia, 'Times New Roman', serif",fontStyle:"italic",fontSize:"8px",color:"#cdb98a"}).setOrigin(.5,0).setDepth(3);
  this.tagTxt.setY(this.tagTxt.y+13);this.refreshDetails?.()}}catch(e){}return r}}
{const R0=bl.prototype.refreshDetails;bl.prototype.refreshDetails=function(){const v=R0.apply(this,arguments);try{const c=fe[this.selected],L=__HLANG[c];this.natTxt?.setText(L?"🗣 "+__L3("Língua nativa: ","Native language: ","Lengua nativa: ")+__L3(...L):"")}catch(e){}return v}}
