/* Painel de CONTROLES (Configurações → Controles) no estilo "C · limpo e moderno".
   Gerado por scripts/patch_controls_panel.py a partir deste arquivo (substitui o módulo ControlsPanel do jogo).
   • todas as ações que o jogo lê: mover, atacar, dash, bloqueio, 4 habilidades, interagir, poção, poção extra,
     inventário e pausa
   • gamepad: A altera, B volta, LB/RB trocam teclado ↔ controle; ao capturar um botão, o próprio B pode ser
     escolhido (antes o B cancelava a captura e não dava para usar)
   • botão repetido: se o botão/tecla já estava em outra ação, as duas trocam (nada fica com dois comandos)
   • RESTAURAR PADRÃO no fim da lista
   • textos em pt/en/es                                                                                       */
const{G:H0,a:W0,t:tr,k:keyL,g:padL}=window.__dgMod;
const FF="system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const L3=(pt,en,es)=>{const f=window.__dgMod?.L3;return f?f(pt,en,es):en};
const ROWS=()=>[["MOVE_UP",tr("ctl.moveUp")],["MOVE_DOWN",tr("ctl.moveDown")],["MOVE_LEFT",tr("ctl.moveLeft")],["MOVE_RIGHT",tr("ctl.moveRight")],["ATTACK",tr("ctl.attack")],["DASH",tr("ctl.dash")],["GUARD",tr("ctl.guard")],["ABILITY_1",tr("ctl.ability",{n:1})],["ABILITY_2",tr("ctl.ability",{n:2})],["ABILITY_3",tr("ctl.ability",{n:3})],["ABILITY_4",tr("ctl.ability",{n:4})],["INTERACT",tr("ctl.interact")],["POTION",tr("ctl.potion")],["POTION2",L3("POÇÃO EXTRA","EXTRA POTION","POCIÓN EXTRA")],["INVENTORY",L3("INVENTÁRIO","INVENTORY","INVENTARIO")],["PAUSE",L3("PAUSA","PAUSE","PAUSA")]];
/* células fixas (não alteráveis): movimento no gamepad é o analógico/direcional; inventário e pausa no teclado são I e ESC */
const FIXED_PAD={MOVE_UP:"STICK / ✥",MOVE_DOWN:"STICK / ✥",MOVE_LEFT:"STICK / ✥",MOVE_RIGHT:"STICK / ✥"},FIXED_KB={INVENTORY:"I",PAUSE:"ESC"};
const SETK="dungeon-crawler:settings";
const KN={ArrowUp:"↑",ArrowDown:"↓",ArrowLeft:"←",ArrowRight:"→"};
const kLab=L=>[...new Set(L.map(k=>KN[k]??keyL(k)))].join(" / ");
class S{constructor(t){this.scene=t,this.mgr=t.game.inputManager,this.capturing=null,this.row=0,this.col=0,this.build()}
 build(){const t=this.scene,W=W0,H=H0,dx=Math.round((W-640)/2);this.root=t.add.container(dx,0).setDepth(960).setVisible(!1);
  const bg=t.add.rectangle(W/2-dx,H/2,W*1.3,H*1.3,0x0f1218,1).setInteractive();this.root.add(bg);
  const P=t.add.graphics();P.fillStyle(0xffffff,.08).fillRect(40,44,560,1);this.root.add(P);
  this.title=t.add.text(320,8,tr("ctl.title").toUpperCase(),{fontFamily:FF,fontStyle:"bold",fontSize:"19px",color:"#ffffff"}).setOrigin(.5,0);this.root.add(this.title);
  this.kx=420,this.gx=540;
  for(const[x,s]of[[this.kx,tr("ctl.keyboard")],[this.gx,tr("ctl.gamepad")]])this.root.add(t.add.text(x,54,String(s).toUpperCase(),{fontFamily:FF,fontStyle:"bold",fontSize:"9px",color:"#9aa3b2"}).setOrigin(.5));
  this.rowG=t.add.graphics();this.root.add(this.rowG);this.cells=[];
  const RH=15.5,Y0=70;
  ROWS().forEach(([a,l],k)=>{const y0=Y0+k*RH,lab=t.add.text(64,y0,String(l).toUpperCase(),{fontFamily:FF,fontStyle:"bold",fontSize:"9px",color:"#c4cad4"}).setOrigin(0,.5),
   kb=t.add.text(this.kx,y0,"",{fontFamily:FF,fontStyle:"bold",fontSize:"9px",color:"#ffffff"}).setOrigin(.5),gp=t.add.text(this.gx,y0,"",{fontFamily:FF,fontStyle:"bold",fontSize:"9px",color:"#ffffff"}).setOrigin(.5),
   zk=t.add.zone(this.kx,y0,112,RH).setInteractive({useHandCursor:!0}),zg=t.add.zone(this.gx,y0,112,RH).setInteractive({useHandCursor:!0});
   zk.on("pointerover",()=>{this.capturing||(this.row=k,this.col=0,this.refresh())}),zg.on("pointerover",()=>{this.capturing||(this.row=k,this.col=1,this.refresh())});
   zk.on("pointerdown",()=>{if(this.capturing)return;this.row=k,this.col=0,this.start()}),zg.on("pointerdown",()=>{if(this.capturing)return;this.row=k,this.col=1,this.start()});
   this.root.add([lab,kb,gp,zk,zg]);this.cells.push({action:a,lab,kb,gp,y:y0})});
  /* restaurar padrão (última linha navegável) */
  const yr=Y0+this.cells.length*RH+8;this.resetY=yr;
  this.resetT=t.add.text(320,yr,L3("RESTAURAR PADRÃO","RESTORE DEFAULTS","RESTAURAR VALORES"),{fontFamily:FF,fontStyle:"bold",fontSize:"9px",color:"#ffffff",padding:{x:14,y:4}}).setOrigin(.5).setInteractive({useHandCursor:!0});
  this.resetT.on("pointerover",()=>{this.capturing||(this.row=this.cells.length,this.refresh())});this.resetT.on("pointerdown",()=>{this.capturing||this.resetAll()});this.root.add(this.resetT);
  this.msg=t.add.text(64,54,"",{fontFamily:FF,fontStyle:"bold",fontSize:"9px",color:"#7ee08a"}).setOrigin(0,.5);this.root.add(this.msg);
  this.hint=t.add.text(40,H-10,"",{fontFamily:FF,fontSize:"8px",fontStyle:"bold",color:"#9aa3b2",wordWrap:{width:440}}).setOrigin(0,1);this.root.add(this.hint);
  const cl=t.add.text(640-14,10,"✕",{fontFamily:FF,fontStyle:"bold",fontSize:"16px",color:"#ffffff",backgroundColor:"#ffffff1a",padding:{x:12,y:8}}).setOrigin(1,0).setInteractive({useHandCursor:!0});
  cl.input?.hitArea?.setTo&&cl.input.hitArea.setTo(-20,-16,cl.width+40,cl.height+32);cl.on("pointerdown",()=>this.hide());this.root.add(cl);
  const bk=t.add.text(640-14,H-10,"◀ "+L3("VOLTAR","BACK","VOLVER"),{fontFamily:FF,fontStyle:"bold",fontSize:"11px",color:"#16130c",backgroundColor:"#ffc14d",padding:{x:16,y:8}}).setOrigin(1,1).setInteractive({useHandCursor:!0});
  bk.input?.hitArea?.setTo&&bk.input.hitArea.setTo(-16,-12,bk.width+32,bk.height+24);bk.on("pointerdown",()=>this.hide());this.root.add(bk);
  this.keyH=i=>{if(!this.root.visible)return;i.stopImmediatePropagation?.();i.preventDefault?.();
   if(!this.capturing&&i.isTrusted===!1&&performance.now()-(this.__padHold||0)<350)return;
   if(this.capturing){/* capturando botão do gamepad: ignora as teclas simuladas pelo próprio gamepad (o B não cancela) */
    if(this.col===1&&i.isTrusted===!1)return;if(i.key==="Escape")this.cancel();return}
   const n=this.cells.length+1,k=i.key;
   k==="ArrowUp"?(this.row=(this.row-1+n)%n,this.refresh()):k==="ArrowDown"?(this.row=(this.row+1)%n,this.refresh()):
   k==="ArrowLeft"||k==="ArrowRight"||k==="q"||k==="e"||k==="Tab"?(this.col=1-this.col,this.refresh()):
   k==="Enter"||k===" "?(this.row===this.cells.length?this.resetAll():this.start()):k==="Escape"&&this.hide()}}
 binds(dev,a){return this.mgr.bindings[dev]?.[a]??[]}
 fixed(c,col){return col===1?FIXED_PAD[c.action]:FIXED_KB[c.action]}
 start(){const c=this.cells[this.row];if(!c||this.capturing)return;if(this.fixed(c,this.col)){this.scene.game.audioEngine?.sfx?.("sfx-event-refuse");return}
  this.scene.game.audioEngine?.sfx?.("sfx-ui-tab");const tx=this.col===0?c.kb:c.gp,dev=this.col===0?"keyboard":"gamepad";this.capturing=tx;this.msg.setText("");tx.setText("…").setColor("#ffc14d");this.refresh();
  const done=v=>{if(this.capturing!==tx)return;this.assign(dev,c.action,v);this.capturing=null;this.refresh()};
  if(this.col===0){this.mgr.captureKey(done);return}
  /* o leitor de botões do jogo só roda durante a partida; aqui o painel lê o controle sozinho */
  const rd=()=>{let g=null;try{g=this.mgr.pad?.()??Array.from(navigator.getGamepads?.()??[]).find(x=>x&&x.connected)}catch(e){}return g?g.buttons.map(q=>!!(q?.pressed||(q?.value??0)>.5)):[]};
  let prev=rd();const poll=()=>{if(this.capturing!==tx){this.scene.events.off("update",poll);return}const cur=rd(),i=cur.findIndex((v,k)=>v&&!prev[k]);prev=cur;
   if(i>=0){this.scene.events.off("update",poll);this.mgr.padCapture=null;this.__padHold=performance.now();done(i)}};this.scene.events.on("update",poll)}
 /* grava a nova tecla/botão; se já estava em outra ação, as duas trocam */
 assign(dev,a,v){const prev=this.binds(dev,a).slice(),others=[];for(const c of this.cells){const x=c.action;if(x===a)continue;const L=this.binds(dev,x);if(L.includes(v))others.push([x,L])}
  this.mgr.saveBinding(dev,a,[v]);let sw=null;for(const[x,L]of others){let nl=L.filter(q=>q!==v);nl.length||(nl=prev.filter(q=>q!==v));this.mgr.saveBinding(dev,x,nl);sw=x}
  if(sw){const lab=this.cells.find(c=>c.action===sw)?.lab?.text??sw;this.msg.setColor("#ffc14d").setText(L3("Trocado com ","Swapped with ","Intercambiado con ")+lab)}else this.msg.setColor("#7ee08a").setText(L3("Salvo","Saved","Guardado"))}
 resetAll(){try{const o=JSON.parse(localStorage.getItem(SETK)||"{}");delete o.bindings;localStorage.setItem(SETK,JSON.stringify(o))}catch(e){}this.mgr.reloadBindings?.();
  this.scene.game.audioEngine?.sfx?.("sfx-ui-tab");this.msg.setColor("#7ee08a").setText(L3("Controles restaurados","Controls restored","Controles restaurados"));this.refresh()}
 cancel(){this.capturing=null,this.mgr.keyCapture=null,this.mgr.padCapture=null,this.refresh()}
 refresh(){const g=this.rowG;g.clear();for(const[k,c]of this.cells.entries()){const s=k===this.row;s&&g.fillStyle(0xffffff,.06).fillRoundedRect(52,c.y-7.5,544,15,6);
   for(const[col,x]of[[0,this.kx],[1,this.gx]]){const on=s&&this.col===col,fx=this.fixed(c,col);g.fillStyle(on?0x2a2f3a:0x1b1f28,fx?.5:.95).fillRoundedRect(x-56,c.y-6.5,112,13,6.5);g.lineStyle(1,on?0xffc14d:0xffffff,on?1:.1).strokeRoundedRect(x-55.5,c.y-6,111,12,6)}
   c.lab.setColor(s?"#ffffff":"#c4cad4");
   if(c.kb!==this.capturing){const f=FIXED_KB[c.action],L=this.binds("keyboard",c.action);c.kb.setText(f??(L.length?kLab(L):"—")).setColor(f?"#6b7280":"#ffffff")}
   if(c.gp!==this.capturing){const f=FIXED_PAD[c.action],L=this.binds("gamepad",c.action);c.gp.setText(f??(L.length?[...new Set(L.map(padL))].join(" / "):"—")).setColor(f?"#6b7280":"#ffffff")}}
  const rs=this.row===this.cells.length;this.resetT.setBackgroundColor(rs?"#ffc14d":"#ffffff1a").setColor(rs?"#16130c":"#ffffff");
  const pad=this.mgr.device==="gamepad",isT=typeof globalThis.__isTouch==="function"?globalThis.__isTouch():("ontouchstart"in window||(navigator.maxTouchPoints??0)>0);
  this.hint.setText(this.capturing?(this.col===1?L3("PRESSIONE O BOTÃO DO CONTROLE     ESC NO TECLADO CANCELA","PRESS A CONTROLLER BUTTON     ESC ON KEYBOARD CANCELS","PULSA UN BOTÓN DEL MANDO     ESC EN EL TECLADO CANCELA"):L3("PRESSIONE A TECLA     ESC CANCELA","PRESS A KEY     ESC CANCELS","PULSA UNA TECLA     ESC CANCELA")):
   pad?`✥ ${L3("ESCOLHER","CHOOSE","ELEGIR")}     ${padL(4)} ${padL(5)} ${L3("TECLADO/CONTROLE","KEYBOARD/CONTROLLER","TECLADO/MANDO")}     ${padL(0)} ${L3("ALTERAR","CHANGE","CAMBIAR")}     ${padL(1)} ${L3("VOLTAR","BACK","VOLVER")}`:
   isT?L3("TOQUE NUM VALOR E PRESSIONE A NOVA TECLA OU BOTÃO","TAP A VALUE AND PRESS THE NEW KEY OR BUTTON","TOCA UN VALOR Y PULSA LA NUEVA TECLA O BOTÓN"):
   L3("↑↓ ESCOLHER     ←→ TECLADO/CONTROLE     ENTER ALTERAR     ESC VOLTAR","↑↓ CHOOSE     ←→ KEYBOARD/CONTROLLER     ENTER CHANGE     ESC BACK","↑↓ ELEGIR     ←→ TECLADO/MANDO     ENTER CAMBIAR     ESC VOLVER"))}
 show(){this.row=0,this.col=this.mgr.device==="gamepad"?1:0,this.msg.setText(""),this.refresh(),this.root.setVisible(!0),window.addEventListener("keydown",this.keyH,!0)}
 hide(){this.root.setVisible(!1),this.cancel(),window.removeEventListener("keydown",this.keyH,!0)}}
export{S as default};
