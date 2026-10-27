/* ── Telas no estilo "C · limpo e moderno": escolha de herói (e dificuldade), painéis e cartões genéricos ─── */
function __ucFonts(list){for(const o of list){if(o?.list){__ucFonts(o.list);continue}if(o?.type!=="Text"||o.__ucF)continue;const f=o.style?.fontFamily||"";if(!/Georgia|Courier|Trebuchet/.test(f))continue;o.__ucF=1;const it=/italic/.test(o.style.fontStyle||"");o.setFontFamily(__UC_F).setFontStyle(it?"italic":"bold")}}
function __ucBtn(t,primary,solid){if(!t||t.__ucB)return t;t.__ucB=1;t.removeAllListeners("pointerover");t.removeAllListeners("pointerout");const bg=primary?"#ffc14d":solid?"#1b1f28":"rgba(255,255,255,0.10)",hv=primary?"#ffd27a":solid?"#2a2f3a":"rgba(255,255,255,0.2)",c=primary?"#16130c":"#ffffff";
 t.setFontFamily(__UC_F).setFontStyle("bold").setColor(c).setStroke("#000000",0).setBackgroundColor(bg);t.on("pointerover",()=>t.setBackgroundColor(hv));t.on("pointerout",()=>t.setBackgroundColor(bg));return t}
/* painéis e cartões usados em várias telas (escolha de herói, espaços de save, dificuldade, pausa…) */
__softPanel=function(g,x,y,w,h){g.fillStyle(0x12151c,.88).fillRoundedRect(x,y,w,h,12),g.lineStyle(1.5,0xffffff,.13).strokeRoundedRect(x+.5,y+.5,w-1,h-1,12);return g};
__slotCard=function(g,x,y,w,h,s,e){g.fillStyle(s?0x232833:0x161a22,.96).fillRoundedRect(x,y,w,h,12),g.lineStyle(s?2:1,s?0xffc14d:0xffffff,s?1:.13).strokeRoundedRect(x+.5,y+.5,w-1,h-1,12),g.lineStyle(1,0xffffff,.08).lineBetween(x+12,y+30,x+w-12,y+30)};
__ornatePanel=function(g,x,y,w,h){g.fillStyle(0x12151c,.97).fillRoundedRect(x,y,w,h,16),g.lineStyle(1.5,0xffffff,.14).strokeRoundedRect(x+.5,y+.5,w-1,h-1,16);return g};
/* escolha de herói */
{const C0=bl.prototype.create;bl.prototype.create=function(){const r=C0.apply(this,arguments);try{__ucFonts(this.children.list);
 for(const o of this.children.list){if(o.type!=="Text")continue;if(o.style?.color==="#f0c860")o.setColor("#ffc14d");if(o.style?.color==="#bfa882"||o.style?.color==="#a89468")o.setColor("#9aa3b2");if(o.style?.backgroundColor==="#2b1810")__ucBtn(o,!1)}
 this.nameTxt?.setStroke("#000000",0);this.footTxt?.setColor("#9aa3b2");this.redraw()}catch(e){}return r}
 const R0=bl.prototype.redraw;bl.prototype.redraw=function(){const r=R0.apply(this,arguments);try{const g=this.listG;if(!g)return r;g.clear();this.items.forEach((it,k)=>{const s=k===this.selected,x=22,y=it.y,w=166,h=23;
  s?g.fillStyle(it.lk?0x3a404c:0xffc14d,1).fillRoundedRect(x,y,w,h,h/2):g.fillStyle(0xffffff,.05).fillRoundedRect(x,y,w,h,h/2).lineStyle(1,0xffffff,.1).strokeRoundedRect(x+.5,y+.5,w-1,h-1,h/2);
  it.t.__ucF||(it.t.__ucF=1,it.t.setFontFamily(__UC_F).setFontStyle("bold"));it.t.setColor(s?(it.lk?"#c4cad4":"#16130c"):it.lk?"#5d6470":"#e8ebf0");
  if(it.lk){const c=s?0xc4cad4:0x5d6470;g.fillStyle(c,1).fillRoundedRect(x+w-21,y+11,9,7,1.5),g.lineStyle(1.5,c,1).strokeRoundedRect(x+w-19,y+6,5,7,2)}})}catch(e){}return r}
 const O0=bl.prototype.__openDiff;bl.prototype.__openDiff=function(){const r=O0.apply(this,arguments);try{const d=this.__dPanel;if(!d)return r;__ucFonts(d.list);
  const tr={"DIFICULDADE":__L3("DIFICULDADE","DIFFICULTY","DIFICULTAD"),"DIFÍCIL":__L3("DIFÍCIL","HARD","DIFÍCIL"),"Inimigos com dano e resistência padrão.":__L3("Inimigos com dano e resistência padrão.","Enemies with standard damage and toughness.","Enemigos con daño y resistencia estándar."),"Inimigos com 3x mais dano e 3x mais resistência.":__L3("Inimigos com 3x mais dano e 3x mais resistência.","Enemies deal 3x damage and are 3x tougher.","Enemigos con 3x más daño y 3x más resistencia."),"VOLTAR":__L3("VOLTAR","BACK","VOLVER")};
  for(const o of d.list){if(o.type!=="Text")continue;tr[o.text]&&o.setText(tr[o.text]);o.text===__L3("DIFICULDADE","DIFFICULTY","DIFICULTAD")&&o.setColor("#ffc14d");o.style?.backgroundColor==="#2b1810"&&__ucBtn(o,!1)}}catch(e){}return r}
 bl.prototype.__drawDiff=function(){const e=_/2;this.__dBtns?.forEach((q,k)=>{const s=k===this.__dSel;q.g.clear().fillStyle(s?0x232833:0x161a22,.96).fillRoundedRect(e-150,q.y,300,54,12).lineStyle(s?2:1,s?0xffc14d:0xffffff,s?1:.13).strokeRoundedRect(e-149.5,q.y+.5,299,53,12);q.t.setColor(s?"#ffc14d":"#e8ebf0")})}}
/* menu principal: rodapé e demais textos na fonte nova */
{const C1=$o.prototype.create;$o.prototype.create=function(){const r=C1.apply(this,arguments);try{let n=-1;const up=()=>{let c=this.children.list.length;for(const o of this.children.list)o.list&&(c+=o.list.length*1e3);c!==n&&(n=c,__ucFonts(this.children.list))};this.events.on("postupdate",up);this.events.once("shutdown",()=>this.events.off("postupdate",up))}catch(e){}return r}}
/* livros (Bestiário e Códice): as páginas de pergaminho ficam — é a identidade do livro; a moldura (✕, rodapé) segue o estilo novo.
   Colecionáveis: janela inteira no estilo novo. */
function __ucChrome(S,full){let n=-1;const fix=()=>{let c=S.children.list.length;for(const o of S.children.list)o.list&&(c+=o.list.length*1e3);if(c===n)return;n=c;
 const walk=l=>{for(const o of l){if(o.list){walk(o.list);continue}if(o.type!=="Text"||o.__ucC)continue;const f=o.style?.fontFamily||"";
  if(o.text==="✕"){o.__ucC=1;__ucBtn(o,!1,!0);o.setFontSize("16px").setPadding(12,8,12,8);continue}
  if(/VOLTAR|BACK|VOLVER/.test(o.text)&&o.style?.backgroundColor&&o.style.backgroundColor!=="transparent"){o.__ucC=1;o.setText("◀ "+__L3("VOLTAR","BACK","VOLVER"));__ucBtn(o,!0);o.setPadding(18,9,18,9);continue}
  if(full?/Georgia|Courier|Trebuchet/.test(f):/Courier/.test(f)){o.__ucC=1;const it=/italic/.test(o.style.fontStyle||"");o.setFontFamily(__UC_F).setFontStyle(it?"italic":"bold");if(full){o.style?.color==="#ffd24a"&&o.setColor("#ffc14d")}}}};walk(S.children.list)};
 S.events.on("postupdate",fix);S.events.once("shutdown",()=>S.events.off("postupdate",fix))}
for(const K of[__BookScene,__CodexScene,__CollectiblesScene]){const C=K.prototype.create;K.prototype.create=function(){const r=C.apply(this,arguments);try{__ucChrome(this,K===__CollectiblesScene)}catch(e){}return r}}
/* avisos grandes (SALA LIMPA, NÍVEL…) na fonte nova */
{const B0=Vd.prototype.showBanner;Vd.prototype.showBanner=function(){try{const b=this.banner;if(b&&!b.__ucF){b.__ucF=1;b.setFontFamily(__UC_F).setFontStyle("bold").setStroke("#0b0d12",5).setShadow(0,2,"rgba(0,0,0,.45)",6,!0,!0)}}catch(e){}return B0.apply(this,arguments)}}
/* painéis do Refúgio (ferreiro, melhorias): linhas em pílula, selecionada em âmbar, Voltar em botão */
{const O1=Fl.prototype.openMetaPanel;Fl.prototype.openMetaPanel=function(){const r=O1.apply(this,arguments);try{const back=W("hub.back");for(const o of this.panel?.list||[])o.type==="Text"&&o.text===back&&(__ucBtn(o,!1),o.setPadding(16,8,16,8))}catch(e){}return r}
 const R1=Fl.prototype.refreshPanel;Fl.prototype.refreshPanel=function(){const r=R1.apply(this,arguments);try{(this.panelRows||[]).forEach(({id,def,row},d)=>{const mx=(this.meta.upgrades[id]??0)>=def.max,s=d===this.panelSel;
  row.setFontFamily(__UC_F).setBackgroundColor(s?"#ffc14d":"#1b1f28").setColor(s?"#16130c":mx?"#5d6470":"#e8ebf0")})}catch(e){}return r}}
/* barra de vida dos chefes: placa escura arredondada e textos na fonte nova */
{const C2=bo.prototype.create;bo.prototype.create=function(){const r=C2?.apply(this,arguments);try{const T=this.textures;if(T.exists("ui2-np")&&!T.__ucNp){T.__ucNp=1;T.remove("ui2-np");const c=T.createCanvas("ui2-np",640,90),x=c.getContext();
 x.shadowColor="rgba(0,0,0,.5)";x.shadowBlur=10;x.beginPath();x.roundRect?x.roundRect(24,10,592,70,26):x.rect(24,10,592,70);x.fillStyle="rgba(18,21,28,.9)";x.fill();x.shadowColor="transparent";x.lineWidth=2;x.strokeStyle="rgba(255,255,255,.14)";x.stroke();c.refresh();T.get("ui2-np").setFilter(j.Textures.FilterMode.LINEAR)}}catch(e){}return r}}
{const P0=Pd.prototype.show;Pd.prototype.show=function(){try{if(!this.__ucF){this.__ucF=1;this.nameText.setFontFamily(__UC_F).setStroke("#000000",3);this.subText.setFontFamily(__UC_F);this.phaseText.setFontFamily(__UC_F)}}catch(e){}return P0.apply(this,arguments)}}
/* ficha do item (inventário): cartão grafite opaco, borda clara, textos na fonte nova */
{const T0=__invTip;__invTip=function(C){try{const g=C.__tipG;if(g&&!g.__uc){g.__uc=1;const F=g.fillStyle,Ls=g.lineStyle;
 g.fillStyle=function(c,a){return c===789766?F.call(this,0x161a22,.985):c===9053216?F.call(this,0xffc14d,0):F.call(this,c,a)};
 g.lineStyle=function(w,c,a){return c===9053216?Ls.call(this,1.5,0xffffff,.18):Ls.call(this,w,c,a)};
 __ucFonts([C.tipName,C.tipMeta,C.tipLock,C.tipStats,C.tipDesc,C.tipSet,C.cmpTitle,C.cmpText].filter(Boolean))}}catch(e){}return T0.apply(this,arguments)}}
/* alerta "!" do botão HABILIDADES: vira um selo âmbar no canto do botão, sem encostar nas letras */
{const A0=No.prototype.setSkillsAlert;No.prototype.setSkillsAlert=function(v){const r=A0.apply(this,arguments);try{const b=this.skillsBtn,a=this.skillsAlert;if(b&&a){
 if(!a.__uc){a.__uc=1;a.setFontFamily(__UC_F).setFontStyle("bold").setFontSize("8px").setColor("#16130c").setStroke("#16130c",0).setBackgroundColor("#ffc14d").setPadding(4,1,4,1).setOrigin(.5)}
 const x0=b.x-b.displayWidth*b.originX,y0=b.y-b.displayHeight*b.originY;a.setPosition(x0+b.displayWidth-7,y0+3).setScrollFactor(b.scrollFactorX,b.scrollFactorY);b.parentContainer&&a.parentContainer!==b.parentContainer&&b.parentContainer.add(a)}}catch(e){}return r}}
/* caixa dos Selos/objetivo (canto superior direito): cartão grafite com faixa âmbar */
__cdBgSkin=function(ui){const T=ui.__cdT;if(!T||!__ui2ok(ui))return;ui.__cdBg&&ui.__cdBg.scene||(ui.__cdBg=ui.add.graphics().setDepth(538));const g=ui.__cdBg;g.clear();if(!T.visible||!T.text){g.setVisible(!1);return}g.setVisible(!0);
 const w=T.displayWidth,h=T.displayHeight,x=T.x-w-12,y=T.y-6;g.fillStyle(0x12151c,.88).fillRoundedRect(x,y,w+24,h+12,8).lineStyle(1,0xffffff,.14).strokeRoundedRect(x+.5,y+.5,w+23,h+11,8).fillStyle(0xffc14d,1).fillRoundedRect(x+3,y+4,3,h+4,1.5)};
/* escolha de herói: barras de atributo arredondadas, sem moldura marrom; divisórias claras nos painéis */
{const SP=__softPanel;__softPanel=function(g){if(g&&!g.__ucL){g.__ucL=1;const Ls=g.lineStyle;g.lineStyle=function(w,c,a){return c===13214282?Ls.call(this,1,0xffffff,.1):Ls.call(this,w,c,a)}}return SP.apply(this,arguments)}}
{const C3=bl.prototype.create;bl.prototype.create=function(){const r=C3.apply(this,arguments);try{const sg=this.statG;if(sg&&!sg.__uc){sg.__uc=1;const F=sg.fillStyle,Ls=sg.lineStyle;
 sg.fillStyle=function(c,a){return c===0&&a===.6?F.call(this,0xffffff,.1):F.call(this,c,a)};sg.fillRect=function(x,y,w,h){return this.fillRoundedRect(x,y,w,h,Math.min(3,h/2,w/2))};
 sg.lineStyle=function(w,c,a){return c===6045226?Ls.call(this,0,0,0):Ls.call(this,w,c,a)};sg.strokeRect=function(){return this};this.refreshDetails?.()}}catch(e){}return r}}
