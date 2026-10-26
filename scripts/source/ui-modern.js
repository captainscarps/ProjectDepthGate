/* ── Visual "C · limpo e moderno" — etapa 1: controles de toque e barras do HUD no celular ─────────────────
   • botões redondos de vidro escuro com borda clara; ATAQUE em destaque âmbar; toque dá um "pulo" e um anel
   • joystick translúcido com manete branca
   • START / INVENTÁRIO em pílula
   • HUD do celular: cartão translúcido com nível em destaque, vida e recurso em barras arredondadas
     (a vida pisca em vermelho quando está baixa)
   Tudo desenhado aqui (texturas geradas), sem trocar a lógica dos controles.                               */
const __UC_F="system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
function __ucTex(S){const T=S.textures;if(T.exists("uc-btn"))return;
 const mk=(k,sz,draw)=>{const c=T.createCanvas(k,sz,sz),x=c.getContext();draw(x,sz);c.refresh()};
 mk("uc-btn",256,(x,s)=>{const r=s/2;x.beginPath();x.arc(r,r,r-10,0,7);x.fillStyle="rgba(15,18,24,0.62)";x.fill();
  const g=x.createLinearGradient(0,0,0,s);g.addColorStop(0,"rgba(255,255,255,0.10)");g.addColorStop(.5,"rgba(255,255,255,0)");x.fillStyle=g;x.fill();
  x.lineWidth=6;x.strokeStyle="rgba(255,255,255,0.42)";x.stroke()});
 mk("uc-btn-atk",256,(x,s)=>{const r=s/2;x.shadowColor="rgba(0,0,0,0.45)";x.shadowBlur=14;x.shadowOffsetY=5;x.beginPath();x.arc(r,r-3,r-16,0,7);
  const g=x.createLinearGradient(0,0,0,s);g.addColorStop(0,"#ffd27a");g.addColorStop(1,"#f5a823");x.fillStyle=g;x.fill();x.shadowColor="transparent";
  x.lineWidth=5;x.strokeStyle="rgba(255,255,255,0.55)";x.stroke()});
 mk("uc-ring",256,(x,s)=>{const r=s/2;x.beginPath();x.arc(r,r,r-8,0,7);x.lineWidth=10;x.strokeStyle="#ffffff";x.stroke()});
 mk("uc-joy-bg",256,(x,s)=>{const r=s/2;x.beginPath();x.arc(r,r,r-6,0,7);x.fillStyle="rgba(15,18,24,0.34)";x.fill();x.lineWidth=5;x.strokeStyle="rgba(255,255,255,0.38)";x.stroke();
  x.fillStyle="rgba(255,255,255,0.28)";for(const a of[0,1.5708,3.1416,4.7124]){x.beginPath();const cx=r+Math.cos(a)*(r-30),cy=r+Math.sin(a)*(r-30);x.moveTo(cx+Math.cos(a)*10,cy+Math.sin(a)*10);x.lineTo(cx+Math.cos(a+2.4)*9,cy+Math.sin(a+2.4)*9);x.lineTo(cx+Math.cos(a-2.4)*9,cy+Math.sin(a-2.4)*9);x.fill()}});
 mk("uc-joy-h",128,(x,s)=>{const r=s/2;x.shadowColor="rgba(0,0,0,0.45)";x.shadowBlur=10;x.shadowOffsetY=3;x.beginPath();x.arc(r,r-2,r-14,0,7);x.fillStyle="rgba(255,255,255,0.9)";x.fill()});
 for(const k of["uc-btn","uc-btn-atk","uc-ring","uc-joy-bg","uc-joy-h"])T.get(k).setFilter(j.Textures.FilterMode.LINEAR)}
/* botões de toque */
__btnSkin=function(B,S,x,y){__ucTex(S);const atk=B.action==="ATTACK";B.__uc=1;B.__bg=S.add.image(x,y,atk?"uc-btn-atk":"uc-btn").setDepth(399.6);B.__bd=S.add.image(x,y,"uc-ring").setDepth(401.6).setAlpha(0).setTint(atk?0xffe2a0:0xffffff);
 B.circle.setFillStyle(B.baseColor,0).setStrokeStyle(0,0,0);B.gloss.setFillStyle(16777215,0);B.parts.push(B.__bg,B.__bd);
 try{atk&&B.icon.setTint?.(0x1a140a);B.action==="DASH"&&B.icon.setTint?.(0xffffff);B.icon.setFontFamily?.(__UC_F);B.icon.setStroke?.("#000000",2);B.icon.setColor?.("#ffffff");
  B.keyHint.setFontFamily(__UC_F).setFontStyle("bold").setColor("#ffffff").setStroke("#000000",3);B.cdText.setFontFamily(__UC_F).setColor("#ffffff").setStroke("#000000",3)}catch(e){}
 B.circle.on("pointerdown",()=>{B.circle.setFillStyle(0xffffff,0);const sc=B.__bg.scaleX;S.tweens.killTweensOf([B.__bg,B.__bd]);B.__bg.setScale(sc*.88);S.tweens.add({targets:B.__bg,scale:sc,duration:180,ease:"Back.easeOut"});
  B.__bd.setScale(sc).setAlpha(.7);S.tweens.add({targets:B.__bd,scale:sc*1.25,alpha:0,duration:320,ease:"Cubic.easeOut"})});
 __btnSkinSize(B)};
__btnSkinSize=function(B){if(!B.__bg)return;const k=B.r*2.25/256;B.__bg.setScale(k);B.__bd.setScale(k)};
{const C0=ne.prototype.setCooldown;ne.prototype.setCooldown=function(i,t,e){const r=C0.apply(this,arguments);if(this.__uc){this.circle.setStrokeStyle(0,0,0);this.__bg.setAlpha(e?.45:1);
 /* habilidade ficou pronta: anel rápido */const rd=!(i>0)&&!e;if(rd&&this.__wasCd&&this.__bd){const S=this.sceneRef,sc=this.__bg.scaleX;this.__bd.setScale(sc).setAlpha(.8);S.tweens.add({targets:this.__bd,scale:sc*1.3,alpha:0,duration:420})}this.__wasCd=i>0}return r}}
/* joystick */
__joySkin=function(J,S){__ucTex(S);J.__jb=S.add.image(J.base.x,J.base.y,"uc-joy-bg").setDepth(399.7);J.__jh=S.add.image(J.thumb.x,J.thumb.y,"uc-joy-h").setDepth(401.7);J.base.setFillStyle(0,0).setStrokeStyle(0,0,0);J.thumb.setFillStyle(0,0).setStrokeStyle(0,0,0);J.parts.push(J.__jb,J.__jh)};
__joySync=function(J){if(!J?.__jb)return;const r=J.base.radius??J.radius;J.__jb.setPosition(J.base.x,J.base.y).setScale(r*2.5/256);J.__jh.setPosition(J.thumb.x,J.thumb.y).setScale(r*1.05/128)};
/* START / INVENTÁRIO: pílulas */
{const L0=La;La=class extends L0{constructor(i,t,o){super(i,t,o);const T=this.text,S=i;T.setFontFamily(__UC_F).setFontStyle("bold").setFontSize("10px").setColor("#ffffff").setBackgroundColor("rgba(0,0,0,0)");
  this.pill=S.add.graphics().setDepth(399.5);this.parts.push(this.pill);T.removeAllListeners("pointerdown");T.on("pointerdown",()=>{t.markTouchConsumed();t.touchPress(o.action);this.flash()});this.draw()}
 draw(on){const T=this.text,g=this.pill,w=T.width+4,h=T.height;g.clear().fillStyle(on?0xffc14d:0x0f1218,on?.95:.62).fillRoundedRect(T.x-w/2,T.y-h/2,w,h,h/2).lineStyle(1,0xffffff,on?0:.28).strokeRoundedRect(T.x-w/2,T.y-h/2,w,h,h/2);T.setColor(on?"#16130c":"#ffffff")}
 flash(){this.draw(!0);this.text.scene.time.delayedCall(140,()=>this.draw(!1))}
 setPosition(i,t){super.setPosition(i,t);this.draw()}}}
__joyExcl=function(H){const J=H.joystick;if(!J)return;J.__excl=[[H.selectBtn,"INVENTORY"],[H.startBtn,"PAUSE"]].filter(([b])=>b?.text).map(([b,act])=>{const t=b.text,w=t.displayWidth,h=t.displayHeight,x0=t.x-w/2-18,y0=t.y-h/2-14;
 return{t,r:new j.Geom.Rectangle(x0,y0,w+36,Math.max(h+28,st-y0)),fn:()=>{H.mgr.markTouchConsumed();H.mgr.touchPress(act);b.flash?.()}}})};
/* HUD do celular */
{const U0=__Hud2.prototype.update;__Hud2.prototype.update=function(g){const r=U0.apply(this,arguments);try{if(!this.ok)return r;const S=this.s,mob=this.mode==="mob";
 if(!this.__uc){this.__uc=S.add.graphics().setDepth(107.5);this.__ucT=[this.mhp,this.mname,this.mlvlT];for(const t of this.__ucT)t.setFontFamily(__UC_F).setFontStyle("bold");
  this.mhp.setFontSize("7px").setColor("#ffffff").setStroke("#000000",2).setOrigin(1,.5);this.mname.setFontSize("8px").setColor("#ffffff").setStroke("#000000",2);this.mlvlT.setFontSize("10px").setColor("#16130c").setStroke("#16130c",0)}
 const G=this.__uc;if(!mob||!this.mhp.visible){G.setVisible(!1);return r}
 for(const o of[this.muf,this.hpF,this.rsF,this.mlvl])o.setVisible(!1);G.setVisible(!0);
 const P=g.player,R=g.resource,hp=P.maxHp>0?Math.max(0,P.hp/P.maxHp):0,rs=R?.def&&R.max>0?Math.max(0,R.current/R.max):0,col=R?.def?.color??0x4da3ff,low=hp<.3,
  t=S.time.now,pul=low?.55+.45*Math.sin(t/140):1,key=`${hp.toFixed(3)}|${rs.toFixed(3)}|${col}|${low?Math.round(pul*10):1}`;
 this.mlvlT.setPosition(22,24);this.mname.setPosition(38,8);this.mhp.setPosition(150,21);
 if(this.__ucK===key)return r;this.__ucK=key;
 G.clear();G.fillStyle(0x0f1218,.58).fillRoundedRect(6,5,150,36,12).lineStyle(1,0xffffff,.12).strokeRoundedRect(6,5,150,36,12);
 G.fillStyle(0xffc14d,1).fillCircle(22,24,11);
 G.fillStyle(0xffffff,.14).fillRoundedRect(38,25,112,6,3);hp>0&&G.fillStyle(low?0xff3b3b:0xff5a5f,low?pul:1).fillRoundedRect(38,25,Math.max(6,112*hp),6,3);
 if(R?.def){G.fillStyle(0xffffff,.12).fillRoundedRect(38,34,112,4,2);rs>0&&G.fillStyle(col,1).fillRoundedRect(38,34,Math.max(4,112*rs),4,2)}
 }catch(e){}return r}}
/* o ATAQUE fica sempre bem visível (mesmo com a opacidade dos controles baixa) */
{const A0=Hd.prototype.applyLayout;Hd.prototype.applyLayout=function(){const r=A0.apply(this,arguments);try{const a=this.attackBtn;if(a?.__uc){const o=Math.max(.92,this.settings?.touchOpacity??.6);a.__bg.setAlpha(o);a.icon.setAlpha(o)}}catch(e){}return r}}
/* ── etapa 2: ícones de itens e habilidades ─────────────────────────────────────────────────────────────
   • os ícones de itens são desenhos vetoriais feitos num quadro de 20 px: agora cada um ganha também uma versão
     nítida de 64 px ("hd-…"), usada nos espaços do inventário
   • espaços do inventário: cartão escuro arredondado, borda e brilho na cor da raridade, gema no canto para
     Raro ou melhor, item selecionado com borda âmbar
   • ícones das habilidades maiores dentro dos botões de toque                                                */
{const V0=vt;vt=function(c,i,t){const r=V0.apply(this,arguments);try{const{canvas:e,ctx:d}=Tt(64,64);d.scale(3.2,3.2);t(d);Et(c,"hd-"+i,e);c.textures.get("hd-"+i).setFilter(j.Textures.FilterMode.LINEAR)}catch(e){}return r}}
const __UC_GEM=new Set([4886745,10771168,14715438,8382688]);
Cd.prototype.slotBox=function(g,x,y,col,sel){const dark=col===xt.UI_BORDER_DARK;
 g.fillStyle(0x0f1218,.88).fillRoundedRect(x,y,40,40,8);
 if(!dark){g.fillStyle(col,.16).fillRoundedRect(x+2,y+2,36,36,7);g.fillStyle(0xffffff,.06).fillRoundedRect(x+3,y+3,34,14,{tl:6,tr:6,bl:0,br:0})}
 g.lineStyle(sel?2.5:1.5,sel?0xffc14d:dark?0xffffff:col,sel?1:dark?.14:.9).strokeRoundedRect(x+.5,y+.5,39,39,8);
 if(sel)g.lineStyle(4,0xffc14d,.22).strokeRoundedRect(x-2,y-2,44,44,10);
 if(!dark&&__UC_GEM.has(col)){g.fillStyle(0x0f1218,1).fillCircle(x+35,y+5,4.5);g.fillStyle(col,1).fillCircle(x+35,y+5,3);g.fillStyle(0xffffff,.7).fillCircle(x+34.2,y+4.2,1)}};
{const R0=Cd.prototype.refresh;Cd.prototype.refresh=function(){const r=R0.apply(this,arguments);try{if(!this.open)return r;const T=this.ui.textures;
 for(const o of[...(this.equipUi||[]),...(this.gridUi||[])]){const ic=o.icon;if(!ic?.visible||ic.texture?.key==="items-hd")continue;let k=ic.texture?.key||"";if(!k.startsWith("hd-")&&T.exists("hd-"+k)){ic.setTexture("hd-"+k);k="hd-"+k}
  if(k.startsWith("hd-"))ic.setDisplaySize(34,34);else{const f=ic.frame,m=Math.max(f.width,f.height)||1;ic.setScale(Math.min(3,Math.max(1,Math.floor(30/m)||30/m)))}}
 /* foco (teclado/gamepad): anel âmbar arredondado por cima do quadrado antigo */
 if(this.focus){const p=this.focus.area==="inv"?this.gridUi[this.focus.index]?.pos:this.equipUi[this.focus.index]?.pos;p&&!(this.__sk&&this.__tab&&this.focus.area==="equip")&&this.slotsG.lineStyle(2.5,0xffc14d,1).strokeRoundedRect(p.x-3,p.y-3,46,46,10)}}catch(e){}return r}}
{const C1=ne.prototype.setCooldown;ne.prototype.setCooldown=function(){const r=C1.apply(this,arguments);try{const ic=this.icon;if(this.__uc&&ic?.setTexture&&/^ABILITY_/.test(this.action||"")){const f=ic.frame,m=Math.max(f.width,f.height)||24,s=this.r*1.3/m;Math.abs(ic.scaleX-s)>.01&&ic.setScale(s)}}catch(e){}return r}}
/* ── etapa 3: menus e janelas ─────────────────────────────────────────────────────────────────────────────
   • as texturas de janela/botão/aba/slot da interface (ui2-*) são redesenhadas no estilo novo: vidro escuro
     arredondado com borda clara, botões em pílula, selecionado em âmbar — todas as janelas que usam essas peças
     (inventário, pausa, loja, ferreiro, refúgio, códex…) mudam juntas
   • textos de menu passam para a fonte do sistema, com cores claras e destaque âmbar
   • abas do inventário em pílula âmbar; botões de ação (Equipar, Descartar, Forja) em pílula                  */
function __ucReskin(S){const T=S.textures;if(T.__ucDone)return;T.__ucDone=1;
 const mk=(k,w,h,draw)=>{try{T.exists(k)&&T.remove(k);const c=T.createCanvas(k,w,h),x=c.getContext();draw(x,w,h);c.refresh();T.get(k).setFilter(j.Textures.FilterMode.LINEAR)}catch(e){}};
 const rr=(x,X,Y,W,H,r)=>{x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()};
 mk("ui2-win",1200,700,(x,w,h)=>{x.shadowColor="rgba(0,0,0,.55)";x.shadowBlur=24;x.shadowOffsetY=8;rr(x,14,14,w-28,h-28,40);x.fillStyle="rgba(18,21,28,.97)";x.fill();x.shadowColor="transparent";
  const g=x.createLinearGradient(0,14,0,180);g.addColorStop(0,"rgba(255,255,255,.07)");g.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=g;x.fill();x.lineWidth=4;x.strokeStyle="rgba(255,255,255,.13)";x.stroke()});
 mk("ui2-hdr",520,46,(x,w,h)=>{});
 mk("ui2-btn",340,62,(x,w,h)=>{rr(x,3,3,w-6,h-6,(h-6)/2);x.fillStyle="rgba(255,255,255,.08)";x.fill();x.lineWidth=2;x.strokeStyle="rgba(255,255,255,.14)";x.stroke()});
 mk("ui2-btn-sel",340,62,(x,w,h)=>{rr(x,3,3,w-6,h-6,(h-6)/2);const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,"#ffd27a");g.addColorStop(1,"#f5a823");x.fillStyle=g;x.fill()});
 mk("ui2-tabglow",200,60,(x,w,h)=>{});
 mk("ui2-slot",56,56,(x,w,h)=>{rr(x,2,2,w-4,h-4,10);x.fillStyle="rgba(15,18,24,.85)";x.fill();x.lineWidth=2;x.strokeStyle="rgba(255,255,255,.16)";x.stroke()})}
{const C0=bo.prototype.create;bo.prototype.create=function(){const r=C0?.apply(this,arguments);try{__ucReskin(this)}catch(e){}return r}}
/* fontes e cores padrão dos menus */
try{for(const o of[ye,ge,ts,Le,ti,la])o.fontFamily=__UC_F;ye.color="#e8ebf0";ti.color="#e8ebf0";ge.color="#9aa3b2";Le.color="#9aa3b2";ts.color="#ffc14d";la.color="#ffffff"}catch(e){}
/* painel simples (quando não há textura) */
Dt=function(c,i,t,e,d){c.fillStyle(0x12151c,.97).fillRoundedRect(i,t,e,d,12);c.fillStyle(0xffffff,.05).fillRoundedRect(i+1,t+1,e-2,Math.min(26,d*.3),{tl:11,tr:11,bl:0,br:0});c.lineStyle(1.5,0xffffff,.13).strokeRoundedRect(i+.5,t+.5,e-1,d-1,12);return c};
/* abas do inventário */
{const T0=__invTab;__invTab=function(C,k){const r=T0.apply(this,arguments);try{const g=C.__tabG,t=C.__tabT?.[C.__tab];C.__tabT.forEach((o,n)=>{o.setFontFamily(__UC_F).setFontStyle("bold").setColor(n===C.__tab?"#16130c":"#c4cad4")});
 g.clear();t&&g.fillStyle(0xffc14d,1).fillRoundedRect(t.x-10,t.y-10,t.width+20,20,10)}catch(e){}return r}}
/* botões de texto em pílula (inventário e loja) */
function __ucPill(t,primary){if(!t||t.__pill)return t;const S=t.scene;t.__pill=1;t.setBackgroundColor("rgba(0,0,0,0)").setFontFamily(__UC_F).setFontStyle("bold").setColor(primary?"#16130c":"#ffffff").setPadding(14,8,14,8);
 const g=S.add.graphics();t.__pg=g;const par=t.parentContainer;const sync=()=>{if(!t.active){g.destroy();S.events.off("postupdate",sync);return}const p=t.parentContainer;if(p&&g.parentContainer!==p){p.addAt(g,Math.max(0,p.getIndex(t)))}
  g.setVisible(t.visible&&(p?p.visible:!0)).setAlpha(t.alpha);if(!g.visible)return;const w=t.displayWidth,h=t.displayHeight,x=t.x-w*t.originX,y=t.y-h*t.originY,k=t.__hov?1:0;
  const key=`${x}|${y}|${w}|${h}|${k}`;if(g.__k===key)return;g.__k=key;g.clear();primary?g.fillStyle(k?0xffd27a:0xffc14d,1).fillRoundedRect(x,y,w,h,h/2):g.fillStyle(0xffffff,k?.16:.09).fillRoundedRect(x,y,w,h,h/2).lineStyle(1,0xffffff,.18).strokeRoundedRect(x,y,w,h,h/2)};
 t.on("pointerover",()=>{t.__hov=1;t.setColor(primary?"#16130c":"#ffffff")});t.on("pointerout",()=>{t.__hov=0;t.setColor(primary?"#16130c":"#ffffff")});S.events.on("postupdate",sync);return t}
{const M0=Cd.prototype.makeButton;Cd.prototype.makeButton=function(i,t,e,d){const b=M0.apply(this,arguments);return __ucPill(b,!this.actionBtn)}}
{const M1=bd.prototype.makeButton;bd.prototype.makeButton=function(i,t,e,d){const b=M1.apply(this,arguments);return __ucPill(b,!1)}}
/* menu de pausa: texto escuro no selecionado (fundo âmbar) */
{const R0=Bd.prototype.refresh;Bd.prototype.refresh=function(){const r=R0.apply(this,arguments);try{(this.buttons||[]).forEach((b,k)=>{b.t.setFontFamily(__UC_F);b.bgI&&b.t.setColor(k===this.selected?"#16130c":"#e8ebf0")})}catch(e){}return r}}
/* poção extra: sai de cima do minimapa e vai para o canto de baixo, ao lado do DASH */
{const A1=Hd.prototype.applyLayout;Hd.prototype.applyLayout=function(){const r=A1.apply(this,arguments);try{if(this.pot2Btn){const i=Gd[this.settings?.touchSize??"medium"]??1,o=this.insets||{left:0,right:0,bottom:0},left=this.settings?.leftyMode===!0,h=left?92*i+o.left:_-92*i-o.right,u=st-88*i-o.bottom,p=left?-1:1;
 this.pot2Btn.setPosition(h+p*52*i,u+56*i)}}catch(e){}return r}}
/* botão SKILLS do HUD e o ✕ do inventário no estilo novo; título da pausa na fonte nova */
{const B0=No.prototype.buildSkillsButton;No.prototype.buildSkillsButton=function(){const r=B0.apply(this,arguments);try{const b=this.skillsBtn;if(b&&!b.__pill){b.removeAllListeners("pointerover");b.removeAllListeners("pointerout");__ucPill(b,!1);b.setFontSize("9px").setPadding(10,5,10,5)}}catch(e){}return r}}
{const S0=Cd.prototype.show;Cd.prototype.show=function(){const r=S0.apply(this,arguments);try{const c=this.closeBtn;if(c&&!c.__uc){c.__uc=1;c.removeAllListeners("pointerover");c.removeAllListeners("pointerout");c.setFontFamily(__UC_F).setFontSize("16px").setColor("#ffffff").setBackgroundColor("rgba(255,255,255,0.10)").setPadding(12,8,12,8);
 c.on("pointerover",()=>c.setBackgroundColor("rgba(255,255,255,0.2)"));c.on("pointerout",()=>c.setBackgroundColor("rgba(255,255,255,0.10)"))}}catch(e){}return r}}
{const B1=Bd.prototype.build;Bd.prototype.build=function(){const r=B1.apply(this,arguments);try{for(const o of this.root.list)o.type==="Text"&&o.style?.fontFamily?.includes("Georgia")&&(o.setFontFamily(__UC_F).setFontStyle("bold").setColor("#ffffff"),o.y===90&&o.setY(80).setFontSize("18px"))}catch(e){}return r}}
/* ── Etapa 4 · animações e respostas ───────────────────────────────────────────────────────────────────
   • janelas (inventário, pausa, loja) entram com fade + leve subida
   • ao equipar, o ícone "salta" no espaço do equipamento
   • ao subir de nível, o círculo de nível do HUD pulsa com um anel
   • destaque dos menus (menu principal, seleção de herói, COMEÇAR) vira pílula âmbar                       */
__brush=function(g,x,y,w,h=20,col=15260848){const c=col===15260848?0xffc14d:col===16774864?0xffd27a:col===7039851?0x5a606b:col;g.fillStyle(c,1).fillRoundedRect(x,y-h/2,w,h,h/2)};
function __ucIn(o,S){try{if(!o?.root||!S?.tweens)return;o.__tw?.stop?.();o.root.setAlpha(0).setY(10);o.__tw=S.tweens.add({targets:o.root,alpha:1,y:0,duration:170,ease:"Cubic.easeOut"})}catch(e){}}
{const S1=Cd.prototype.show;Cd.prototype.show=function(){const w=this.open,r=S1.apply(this,arguments);!w&&this.open&&__ucIn(this,this.ui);return r}}
{const S2=Bd.prototype.show;Bd.prototype.show=function(){const w=this.open,r=S2.apply(this,arguments);!w&&this.open&&__ucIn(this,this.ui);return r}}
{const S3=bd.prototype.show;bd.prototype.show=function(){const w=this.open,r=S3.apply(this,arguments);!w&&this.open&&__ucIn(this,this.ui);return r}}
/* (o brilho animado nas bordas de Lendário/Relíquia foi removido a pedido: a borda colorida do espaço já indica a raridade) */
/* salto ao equipar */
{const D0=Cd.prototype.doAction;Cd.prototype.doAction=function(){let t=null,src=null;try{t=this.selectedItem();src=this.selected?.source}catch(e){}const r=D0.apply(this,arguments);
 try{if(t&&src==="inv"&&t.slot){const o=(this.equipUi||[]).find(q=>this.gs().inventory.equipment[q.slotName]===t);if(o?.icon){const ic=o.icon,sx=ic.scaleX,sy=ic.scaleY;this.ui.tweens.add({targets:ic,scaleX:{from:sx*1.45,to:sx},scaleY:{from:sy*1.45,to:sy},duration:260,ease:"Back.easeOut"});
  const g=this.ui.add.graphics();this.root.add(g);const st={k:0};this.ui.tweens.add({targets:st,k:1,duration:380,ease:"Cubic.easeOut",onUpdate:()=>{g.clear().lineStyle(2,0xffc14d,1-st.k).strokeRoundedRect(ic.x-20-8*st.k,ic.y-20-8*st.k,40+16*st.k,40+16*st.k,8)},onComplete:()=>g.destroy()});this.ui.game.audioEngine?.sfx?.("sfx-ui-open")}}}catch(e){}return r}}
/* pulso do nível no HUD */
{const U4=__Hud2.prototype.update;__Hud2.prototype.update=function(g){const r=U4.apply(this,arguments);try{const T=this.mlvlT;if(T&&this.mode==="mob"&&T.visible){const v=T.text;if(this.__lv!==void 0&&v!==this.__lv){const S=this.s;S.tweens.add({targets:T,scale:{from:1.7,to:1},duration:420,ease:"Back.easeOut"});
 const q=S.add.graphics().setDepth(108),st={k:0};T.parentContainer&&T.parentContainer.add(q);S.tweens.add({targets:st,k:1,duration:650,ease:"Cubic.easeOut",onUpdate:()=>{q.clear().lineStyle(3,0xffc14d,1-st.k).strokeCircle(T.x,T.y,12+14*st.k)},onComplete:()=>q.destroy()})}this.__lv=v}}catch(e){}return r}}
/* menu principal: itens na fonte nova (a pílula âmbar acompanha a largura do texto) */
{const RB=$o.prototype.refreshButtons;$o.prototype.refreshButtons=function(){try{(this.buttons||[]).forEach(b=>{if(!b.small&&b.t&&!b.t.__uc){b.t.__uc=1;b.t.setFontFamily(__UC_F).setFontStyle("bold")}})}catch(e){}return RB.apply(this,arguments)}}
