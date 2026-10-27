/* ── Etapa 5 · navegação (gamepad, toque e teclado) ────────────────────────────────────────────────────
   • gamepad: segurar o direcional (ou o analógico) repete o movimento nos menus, como no teclado
   • dicas de navegação traduzidas e iguais em todo lugar (LB/RB trocam abas, Ⓑ volta…)
   • Configurações no estilo novo (abas em pílula âmbar, linhas e controles arredondados)
   • HUD do computador no estilo novo (cartão do herói, barra de ações, orbes e textos)                     */
function __navH(pad,kb,touch){return __usingPad()?pad:__isTouch()&&touch?touch:kb}
const __NV={nav:()=>__L3("NAVEGAR","NAVIGATE","NAVEGAR"),sel:()=>__L3("SELECIONAR","SELECT","SELECCIONAR"),back:()=>__L3("VOLTAR","BACK","VOLVER"),adj:()=>__L3("AJUSTAR","ADJUST","AJUSTAR"),cat:()=>__L3("CATEGORIA","CATEGORY","CATEGORÍA"),item:()=>__L3("ITEM","ITEM","OPCIÓN"),pick:()=>__L3("ESCOLHER","CHOOSE","ELEGIR"),go:()=>__L3("COMEÇAR","START","EMPEZAR")};
function __hintMenu(){return __navH(`✥ ${__NV.nav()}    ${__padL(0)} ${__NV.sel()}    ${__padL(1)} ${__NV.back()}`,`↑ ↓ ${__NV.nav()}    ENTER ${__NV.sel()}    ESC ${__NV.back()}`,__L3("TOQUE PARA SELECIONAR","TAP TO SELECT","TOCA PARA SELECCIONAR"))}
function __hintHero(){return __navH(`✥  ${__NV.pick()}     ${__padL(0)}  ${__NV.go()}     ${__padL(1)}  ${__NV.back()}`,`↑ ↓  ${__NV.pick()}     ENTER  ${__NV.go()}     ESC  ${__NV.back()}`)}
function __hintSet(){return __navH(`✥ ${__NV.adj()}     ${__padL(4)} ${__padL(5)} ${__NV.cat()}     ${__padL(1)} ${__NV.back()}`,`↑↓ ${__NV.item()}     ←→ ${__NV.adj()}     Q/E ${__NV.cat()}     ESC ${__NV.back()}`,__L3("TOQUE NAS OPÇÕES PARA AJUSTAR","TAP AN OPTION TO ADJUST","TOCA UNA OPCIÓN PARA AJUSTAR"))}
/* repetição ao segurar direções no gamepad (380 ms para começar, depois a cada 110 ms) */
{const MB=to.prototype.menuBridge;to.prototype.menuBridge=function(){const r=MB.apply(this,arguments);try{const i=this.pad();if(!i||!this.bridgeActive()){this.__rep=null;return r}
 const t=d=>i.buttons[d]?.pressed||(i.buttons[d]?.value??0)>.5,a=i.axes||[],dir=t(12)||(a[1]??0)<-.6?"UI_UP":t(13)||(a[1]??0)>.6?"UI_DOWN":t(14)||(a[0]??0)<-.6?"UI_LEFT":t(15)||(a[0]??0)>.6?"UI_RIGHT":null,now=performance.now();
 if(!dir){this.__rep=null;return r}if(!this.__rep||this.__rep.d!==dir){this.__rep={d:dir,t:now+380};return r}if(now>=this.__rep.t){this.__rep.t=now+110;this.uiPress(dir)}}catch(e){}return r}}
/* Configurações no estilo novo */
{const B0=Vn.prototype.build;Vn.prototype.build=function(){const r=B0.apply(this,arguments);try{if(!this.__k2)return r;const F=__UC_F,P=this.root.list[1];
 P?.clear?.().fillStyle(0x0f1218,.97).fillRect(0,0,_,st).fillStyle(0xffffff,.08).fillRect(40,62,_-80,1);this.__hdr?.setVisible(!1);
 this.title.setFontFamily(F).setColor("#ffffff").setStroke("#000000",0);
 for(const q of this.catT)q.t.setFontFamily(F).setStroke("#000000",0).setFontSize("12px");__setTabs(this);
 for(const q of this.rowTexts)for(const o of[q.label,q.value,q.la,q.ra])o.setFontFamily(F);
 this.navHint.setFontFamily(F).setColor("#9aa3b2").setFontSize("8px");
 for(const o of this.root.list){if(o.type!=="Text")continue;if(o.text==="✕"){o.setFontFamily(F).setBackgroundColor("rgba(255,255,255,0.10)");o.on("pointerover",()=>o.setBackgroundColor("rgba(255,255,255,0.2)"));o.on("pointerout",()=>o.setBackgroundColor("rgba(255,255,255,0.10)"))}
  else if(/VOLTAR/.test(o.text)){o.setText("◀ "+__NV.back()).setFontFamily(F).setColor("#16130c").setBackgroundColor("#ffc14d").setPadding(16,8,16,8);Gt(o,18,14)}}}catch(e){}return r}
 const R0=Vn.prototype.refresh;Vn.prototype.refresh=function(){const r=R0.apply(this,arguments);try{if(!this.__k2||!this.cats)return r;const cg=this.catG,g=this.rowG;cg.clear();
  this.catT.forEach((q,k)=>{const s=k===this.cat,h=k===this.__hc;(s||h)&&cg.fillStyle(s?0xffc14d:0xffffff,s?1:.1).fillRoundedRect(q.t.x-10,q.y-11,q.t.width+20,22,11);q.t.setColor(s?"#16130c":"#c4cad4").setAlpha(1)});
  g.clear();const R=this.catRows();this.rowTexts.forEach((q,k)=>{const i=R[k];if(i==null)return;const t=this.rows[i],e=this.settings[t.key],s=i===this.selected;
   s&&g.fillStyle(0xffffff,.06).fillRoundedRect(50,q.y-13,578,26,8);g.fillStyle(s?0x2a2f3a:0x1b1f28,.95).fillRoundedRect(444,q.y-11,180,22,11);g.lineStyle(1,s?0xffc14d:0xffffff,s?1:.12).strokeRoundedRect(444.5,q.y-10.5,179,21,11);
   if(t.type==="slider"){g.fillStyle(0x3a404c,1).fillRoundedRect(464,q.y-2,100,4,2);e>0&&g.fillStyle(0xffc14d,1).fillRoundedRect(464,q.y-2,Math.max(4,100*e),4,2);g.fillStyle(0xffffff,1).fillCircle(464+100*e,q.y,5)}
   q.label.setColor(s?"#ffffff":"#c4cad4");t.type==="toggle"?q.value.setColor(e?"#7ee08a":"#8a93a3"):q.value.setColor("#ffffff");q.la.setColor("#ffc14d");q.ra.setColor("#ffc14d")});
  this.navHint.setText(__hintSet())}catch(e){}return r}}
/* HUD do computador: peças redesenhadas (mesmo tamanho das originais) */
function __ucReskin2(S){const T=S.textures;if(T.__uc2)return;T.__uc2=1;
 const mk=(k,w,h,draw)=>{try{if(!T.exists(k))return;T.remove(k);const c=T.createCanvas(k,w,h),x=c.getContext();draw(x,w,h);c.refresh();T.get(k).setFilter(j.Textures.FilterMode.LINEAR)}catch(e){}};
 const rr=(x,X,Y,W,H,r)=>{x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+W,Y,X+W,Y+H,r);x.arcTo(X+W,Y+H,X,Y+H,r);x.arcTo(X,Y+H,X,Y,r);x.arcTo(X,Y,X+W,Y,r);x.closePath()};
 const card=(x,X,Y,W,H,r)=>{x.shadowColor="rgba(0,0,0,.45)";x.shadowBlur=10;x.shadowOffsetY=3;rr(x,X,Y,W,H,r);x.fillStyle="rgba(18,21,28,.86)";x.fill();x.shadowColor="transparent";x.lineWidth=2;x.strokeStyle="rgba(255,255,255,.14)";x.stroke()};
 mk("ui2-top",460,132,(x)=>{card(x,96,24,330,84,26);x.beginPath();x.arc(66,66,60,0,Math.PI*2);x.fillStyle="#12151c";x.fill();x.lineWidth=4;x.strokeStyle="rgba(255,255,255,.22)";x.stroke()});
 mk("ui2-lvl",44,44,(x)=>{x.beginPath();x.arc(22,22,20,0,Math.PI*2);const g=x.createLinearGradient(0,2,0,42);g.addColorStop(0,"#ffd27a");g.addColorStop(1,"#f5a823");x.fillStyle=g;x.fill();x.lineWidth=2;x.strokeStyle="#12151c";x.stroke()});
 mk("ui2-ab",620,112,(x)=>{card(x,34,34,552,74,24)});
 mk("ui2-globe-bg",150,141,(x)=>{x.shadowColor="rgba(0,0,0,.5)";x.shadowBlur=10;x.beginPath();x.arc(75,70,66,0,Math.PI*2);x.fillStyle="#12151c";x.fill();x.shadowColor="transparent";x.lineWidth=5;x.strokeStyle="rgba(255,255,255,.2)";x.stroke()});
 mk("ui2-xp-bg",480,14,(x)=>{rr(x,1,2,478,10,5);x.fillStyle="rgba(0,0,0,.6)";x.fill();x.lineWidth=1;x.strokeStyle="rgba(255,255,255,.14)";x.stroke()})}
{const C0=bo.prototype.create;bo.prototype.create=function(){const r=C0?.apply(this,arguments);try{__ucReskin2(this)}catch(e){}return r}}
/* textos do HUD do computador na fonte nova */
{const U5=__Hud2.prototype.update;__Hud2.prototype.update=function(g){const r=U5.apply(this,arguments);try{if(this.ok){const S=this.s,n=S.children.list.length;if(this.__ucN!==n){this.__ucN=n;
 for(const o of S.children.list){if(o.type!=="Text"||o.__ucF)continue;const f=o.style?.fontFamily||"",d=o.depth;if(!(/Georgia|Courier/.test(f))||!((d>=100&&d<=130)||d===539))continue;o.__ucF=1;o.setFontFamily(__UC_F).setFontStyle("bold")}
 this.mode!=="mob"&&this.lvlT&&this.lvlT.setColor("#16130c").setStroke("#16130c",0);this.lvlT2?.setColor?.("#16130c").setStroke("#16130c",0)}}}catch(e){}return r}}
/* minimapa no estilo novo */
{const M0=__mmSkin;__mmSkin=function(M){if(!M0(M))return!1;try{const x=M.x,y=M.y,w=M.width,h=M.height;M.panel.clear().fillStyle(0x12151c,.88).fillRoundedRect(x,y,w,h,12).lineStyle(1.5,0xffffff,.16).strokeRoundedRect(x+.5,y+.5,w-1,h-1,12);
 M.title.__uc||(M.title.__uc=1,M.title.setFontFamily(__UC_F));M.title.setColor("#c4cad4").setStroke("#000000",0)}catch(e){}return!0}}
/* o painel de Controles (módulo separado) usa a tradução de 3 idiomas do jogo */
setTimeout(()=>{try{window.__dgMod&&(window.__dgMod.L3=__L3)}catch(e){}},0);
/* Configurações: enquanto o painel de Controles está aberto, as teclas (e o gamepad) vão só para ele
   (antes as duas telas recebiam: o A reabria o painel na primeira linha e o B fechava as Configurações por trás) */
{const B9=Vn.prototype.build;Vn.prototype.build=function(){const r=B9.apply(this,arguments);try{const kh=this.keyHandler;this.keyHandler=e=>{if(this.controlsPanel?.root?.visible)return;return kh(e)}}catch(e){}return r}}
