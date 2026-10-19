"""
Herborista (só na campanha): poções extras numa bolsa sem limite e um 2º slot de poção.

- Slot 1 = a poção normal do jogo, sem mudanças (POÇÃO: Q / direcional ↑ / botão de toque).
- Slot 2 = a poção da Herborista equipada (Vida, Vida Plus = 3x a cura, Invulnerabilidade 6s).
  Bebe com POÇÃO 2: R / direcional → / botão de toque extra.
- Inventário ganha a aba POÇÕES: mostra os 2 slots e a bolsa; escolher uma poção da bolsa equipa no slot 2.
- A bolsa fica no save da campanha (campaign.refuge.herb = {c,p,v,s}); s = tipo equipado.
- Barra de ações: um slot pequeno acima da poção normal mostra a poção do slot 2.
Re-executável (troca o bloco de funções inteiro a cada execução).
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()

HELPERS = r'''/*__HERB__*/const __HBV=6,__HBK=["c","p","v"];function __hbName(k,sh){return k==="p"?(sh?"PLUS":__L3("Poção de Vida Plus","Health Potion Plus","Poción de Vida Plus")):k==="v"?(sh?"INVULN.":__L3("Poção de Invulnerabilidade","Invulnerability Potion","Poción de Invulnerabilidad")):(sh?__L3("VIDA","HEALTH","VIDA"):__L3("Poção de Vida","Health Potion","Poción de Vida"))}
function __hbIcon(k){return k==="p"?"icon-potion-plus":k==="v"?"icon-potion-inv":"icon-potion"}
function __hbDesc(k){return k==="p"?__L3("Cura o triplo da poção comum.","Heals triple the common potion.","Cura el triple de la poción común."):k==="v"?__L3("Nenhum dano por 6 segundos.","No damage for 6 seconds.","Ningún daño durante 6 segundos."):__L3("Cura comum (+3 de vida e o bônus de Alquimia).","Common heal (+3 health plus Alchemy bonus).","Cura común (+3 de vida y el bono de Alquimia).")}
function __hbCamp(S){return S?.game?.registry?.get("mode")==="campaign"}
function __hbGet(S){const g=S.game;if(!__hbCamp(S))return S.__hbE||(S.__hbE={c:0,p:0,v:0,s:"p"});let r=g.registry.get("campaign:refuge");r||(r={upgrades:{}},g.registry.set("campaign:refuge",r));r.herb=Object.assign({c:0,p:0,v:0,s:"p"},r.herb||{});return r.herb}
function __hbPut(S){if(!__hbCamp(S))return;const g=S.game,H=__hbGet(S);try{const sl=g.registry.get("save:slot")??1,r=Dn(sl);if(r.ok){r.data.campaign??={};r.data.campaign.refuge??={upgrades:{}};r.data.campaign.refuge.herb={c:H.c|0,p:H.p|0,v:H.v|0,s:H.s};localStorage.setItem(Wt("campaign",sl),JSON.stringify(r.data))}}catch(e){}}
function __hbHud(S){const H=__hbGet(S),k=H.s||"p";window.__potHud={sel:k,n:H[k]|0,c:H.c|0,p:H.p|0,v:H.v|0,camp:__hbCamp(S)}}
function __hbUse2(S){const i=S.player;if(!i||S.state!=="playing"||i.dead||S.potionCooldown>0)return!1;const H=__hbGet(S);let k=H.s||"p";const no=t=>(S.effects.floatText(i.x,i.y-20,t,"#d84040"),!1);
if((H[k]|0)<=0){const alt=__HBK.find(x=>(H[x]|0)>0);if(!alt)return no(__hbCamp(S)?__L3("Slot 2 vazio — compre na Herborista","Slot 2 empty — buy from the Herbalist","Ranura 2 vacía — compra a la Herbolaria"):__L3("Sem poções da Herborista","No Herbalist potions","Sin pociones de la Herbolaria"));H.s=k=alt;S.effects.floatText(i.x,i.y-34,"⇄ "+__hbName(k),"#ffd24a")}
if(k!=="v"&&i.hp>=i.maxHp)return __hbHud(S),S.effects.floatText(i.x,i.y-20,W("g.hpFull"),"#8ae0b0"),!1;H[k]--;__hbPut(S);S.potionCooldown=1.2;const t=3+S.getBlessingBonus("potionPower");
if(k==="v"){i.__shieldT=Math.max(i.__shieldT||0,__HBV);S.audio.play(Ct.POTION_USE);S.game.audioEngine?.sfx?.("sfx-shrine-use");S.effects.burstTinted(i.x,i.y-6,16765514,18);S.effects.shockwaveRing?.(i.x,i.y,22);S.effects.floatText(i.x,i.y-26,__L3("INVULNERÁVEL!","INVULNERABLE!","¡INVULNERABLE!"),"#ffd24a")}
else if(k==="p"){i.heal(t*3);S.audio.play(Ct.POTION_USE);S.effects.burstTinted(i.x,i.y-6,16730730,22);S.effects.floatText(i.x,i.y-26,`+${t*3}`,"#ff8aa8")}
else{i.heal(t);S.audio.play(Ct.POTION_USE);S.effects.burstTinted(i.x,i.y-6,14174826,12)}
__hbHud(S);S.game.events.emit("hud:potions",S.potions.count,S.potions.max);S.game.events.emit("haptic","hit");return!0}
function __hbTick(S,e){if(!S.__hbI){S.__hbI=1;__hbHud(S)}const p=S.player;if(!p)return;let a=S.__hbAura;if(p.__shieldT>0&&!p.dead){p.__shieldT-=e;if(!a||!a.active){a=S.__hbAura=S.add.image(p.x,p.y,"light").setBlendMode(j.BlendModes.ADD).setTint(16765514).setScale(.34);S.__hbRing=S.add.graphics().setBlendMode(j.BlendModes.ADD)}const k=p.__shieldT,bl=k<1.6&&Math.floor(k*8)%2===1;a.setPosition(p.x,p.y-10).setDepth(p.depth+1).setAlpha(bl?.12:.4+.12*Math.sin(S.time.now/110));const R=S.__hbRing;R.clear().setDepth(p.depth+1);bl||R.lineStyle(1.5,16765514,.75).strokeEllipse(p.x,p.y-10,30+3*Math.sin(S.time.now/90),36+3*Math.sin(S.time.now/90));if(Math.random()<e*14){const q=S.add.rectangle(p.x+j.Math.Between(-12,12),p.y-j.Math.Between(0,22),2,2,16771498).setDepth(p.depth+2).setBlendMode(j.BlendModes.ADD);S.tweens.add({targets:q,y:q.y-14,alpha:0,duration:600,onComplete:()=>q.destroy()})}if(p.__shieldT<=0){p.__shieldT=0;a.destroy();S.__hbRing?.destroy();S.__hbAura=S.__hbRing=null;S.effects?.floatText(p.x,p.y-24,__L3("A proteção acabou","Protection faded","La protección terminó"),"#c9bfa4")}}else if(a){a.destroy();S.__hbRing?.destroy();S.__hbAura=S.__hbRing=null}}
function __hbKey(S,act){const im=S.game.inputManager;if(im?.device==="touch")return"";if(im?.device==="gamepad"){const b=(im.bindings?.gamepad?.[act]??[])[0];return b===12?"↑":b===15?"→":b!=null?__padL?.(b)??"":""}return(im?.label?.(act)||"").replace(/[\[\]]/g,"")}
function __hb2Hud(R,S){const P=window.__potHud,show=!!R.on&&!!P&&(P.camp||P.c+P.p+P.v>0),s=R.s;if(!R.__h2){if(!show)return;const x=R.x0+4*(R.W+R.G)+R.W/2,y=R.by-17,F={fontFamily:"'Courier New', monospace",fontStyle:"bold"};const bg=s.add.graphics().setDepth(121.6);bg.fillStyle(657157,.92).fillRoundedRect(x-11,y-11,22,22,4).lineStyle(1.5,16765514,.9).strokeRoundedRect(x-11,y-11,22,22,4);R.__h2=[bg,s.add.image(x,y,"icon-potion-plus").setDepth(122).setScale(.85),s.add.text(x-10,y-12,"",{...F,fontSize:"7px",color:"#ffffff",stroke:"#000000",strokeThickness:2}).setDepth(124),s.add.text(x+11,y+11,"",{...F,fontSize:"6px",color:"#ffd24a",stroke:"#000000",strokeThickness:2}).setOrigin(1,1).setDepth(124)]}const[bg,ic,cn,ky]=R.__h2;for(const o of R.__h2)o.setVisible(show);if(!show)return;const key=__hbIcon(P.sel);ic.texture.key!==key&&ic.setTexture(key);ic.setAlpha(P.n>0?1:.35);cn.setText(`${P.n}`);ky.setText(__hbKey(S,"POTION2"))}
function __potTab(C,on){const i=C.ui,S=C.gs();if(!C.__potC){if(!on)return;const c=C.__potC=i.add.container(0,0);C.root.add(c);const F={fontFamily:"Georgia, 'Times New Roman', serif",fontStyle:"bold"},M={fontFamily:"'Courier New', monospace",fontStyle:"bold"};C.__potG=i.add.graphics();c.add(C.__potG);
const card=(x,t)=>{const o={x,ic:i.add.image(x+34,104,"icon-potion").setScale(2.2),tt:i.add.text(x+66,70,t,{...F,fontSize:"10px",color:"#e8c872"}),nm:i.add.text(x+66,88,"",{...M,fontSize:"11px",color:"#ffffff"}),ct:i.add.text(x+66,106,"",{...M,fontSize:"10px",color:"#d8cdb4"}),ky:i.add.text(x+66,122,"",{...M,fontSize:"9px",color:"#ffd24a"})};c.add([o.ic,o.tt,o.nm,o.ct,o.ky]);return o};
C.__potS1=card(52,__L3("SLOT 1 · POÇÃO NORMAL","SLOT 1 · NORMAL POTION","RANURA 1 · POCIÓN NORMAL"));C.__potS2=card(326,__L3("SLOT 2 · DA HERBORISTA","SLOT 2 · HERBALIST","RANURA 2 · HERBOLARIA"));
c.add(C.__potH=i.add.text(52,156,__L3("BOLSA DA HERBORISTA — escolha a poção do slot 2","HERBALIST'S BAG — choose the slot 2 potion","BOLSA DE LA HERBOLARIA — elige la poción de la ranura 2"),{...F,fontSize:"10px",color:"#b8f0a0"}));
C.__potR=__HBK.map((k,n)=>{const y=172+n*40,z=i.add.zone(50,y,540,36).setOrigin(0).setInteractive({useHandCursor:!0}),o={k,y,ic:i.add.image(72,y+18,__hbIcon(k)).setScale(1.2),nm:i.add.text(92,y+5,__hbName(k).toUpperCase(),{...M,fontSize:"10px",color:k==="v"?"#ffd24a":k==="p"?"#ff8ab4":"#ff9a9a"}),ds:i.add.text(92,y+20,__hbDesc(k),{...M,fontSize:"8px",fontStyle:"normal",color:"#c9bfa4"}),ct:i.add.text(582,y+5,"",{...M,fontSize:"10px",color:"#e8dcc0"}).setOrigin(1,0),eq:i.add.text(582,y+20,"",{...M,fontSize:"8px",color:"#ffd24a"}).setOrigin(1,0)};z.on("pointerover",()=>{C.__pSel=n;__potDraw(C)});z.on("pointerdown",()=>{C.__pSel=n;__potEquip(C)});c.add([z,o.ic,o.nm,o.ds,o.ct,o.eq]);return o});
c.add(C.__potT=i.add.text(320,310,"",{...M,fontSize:"8px",fontStyle:"normal",color:"#a8a08a",align:"center"}).setOrigin(.5,0));C.__pSel=0}
C.__potC.setVisible(on);if(on){C.root.bringToTop(C.__potC);C.closeBtn&&C.root.bringToTop(C.closeBtn);const H=__hbGet(S);C.__pSel=Math.max(0,__HBK.indexOf(H.s||"p"));__potDraw(C)}}
function __potDraw(C){if(!C.__potC?.visible)return;const S=C.gs(),H=__hbGet(S),g=C.__potG,camp=__hbCamp(S),k2=H.s||"p";g.clear();for(const x of[52,326]){g.fillStyle(1182736,.94).fillRoundedRect(x,62,262,80,6).lineStyle(1.5,x===52?14174826:16765514,.85).strokeRoundedRect(x+.5,62.5,261,79,6)}
const a=C.__potS1;a.nm.setText(__hbName("c").toUpperCase());a.ct.setText(`x${S.potions?.count??0} / ${S.potions?.max??5}`);a.ky.setText(__hbKey(S,"POTION")?__L3("beber: ","drink: ","beber: ")+__hbKey(S,"POTION"):__L3("botão de poção","potion button","botón de poción"));a.ic.setTexture("icon-potion");
const b=C.__potS2;b.ic.setTexture(__hbIcon(k2)).setAlpha((H[k2]|0)>0?1:.35);b.nm.setText(__hbName(k2).toUpperCase());b.ct.setText(`x${H[k2]|0}`);b.ky.setText(__hbKey(S,"POTION2")?__L3("beber: ","drink: ","beber: ")+__hbKey(S,"POTION2"):__L3("botão de poção 2","potion 2 button","botón de poción 2"));
C.__potR.forEach((r,n)=>{const on=n===C.__pSel,eq=r.k===k2;g.fillStyle(on?3813406:2366992,on?.95:.7).fillRoundedRect(50,r.y,540,36,5);on&&g.lineStyle(1.5,16765514,.9).strokeRoundedRect(50.5,r.y+.5,539,35,5);r.ct.setText(__L3("na bolsa: ","in bag: ","en la bolsa: ")+(H[r.k]|0));r.eq.setText(eq?__L3("◆ NO SLOT 2","◆ IN SLOT 2","◆ EN RANURA 2"):"");r.ic.setAlpha((H[r.k]|0)>0?1:.4)});
C.__potT.setText(camp?__L3("↑↓ escolher · ENTER / A equipar no slot 2 · Compre mais com a Herborista do Refúgio","↑↓ choose · ENTER / A equip in slot 2 · Buy more from the Refuge Herbalist","↑↓ elegir · ENTER / A equipar en ranura 2 · Compra más a la Herbolaria del Refugio"):__L3("A Herborista só atende na campanha.","The Herbalist only trades in the campaign.","La Herbolaria solo atiende en la campaña."))}
function __potEquip(C){const S=C.gs(),H=__hbGet(S),k=__HBK[C.__pSel|0];if(H.s!==k){H.s=k;__hbPut(S);__hbHud(S);C.ui.game.audioEngine?.sfx?.("sfx-equip")}__potDraw(C)}
function __potKey(C,i){if(i==="ArrowUp"||i==="w"||i==="ArrowDown"||i==="s"){C.__pSel=((C.__pSel|0)+(i==="ArrowUp"||i==="w"?-1:1)+3)%3;C.ui.game.audioEngine?.sfx?.("sfx-ui-tab");__potDraw(C);return!0}if(i==="Enter"||i===" "){__potEquip(C);return!0}return i==="ArrowLeft"||i==="ArrowRight"||i==="Delete"}
'''

ICONS = r'''vt(c,"icon-potion-plus",i=>{i.fillStyle="#b8c4d0",i.fillRect(7,1,6,3),i.fillStyle="#5a1020",i.beginPath(),i.arc(10,12,7.5,0,Math.PI*2),i.fill(),i.fillStyle="#e0285a",i.beginPath(),i.arc(10,12,6.5,0,Math.PI*2),i.fill(),i.fillStyle="#ff9ab4",i.fillRect(6,8,3,3),i.fillStyle="#ffe08a",i.fillRect(10,9,2,7),i.fillRect(8,11,6,2)}),vt(c,"icon-potion-inv",i=>{i.fillStyle="#b8c4d0",i.fillRect(8,2,4,3),i.fillStyle="#6a5008",i.beginPath(),i.arc(10,12,6.5,0,Math.PI*2),i.fill(),i.fillStyle="#f0c030",i.beginPath(),i.arc(10,12,5.5,0,Math.PI*2),i.fill(),i.fillStyle="#fff4b0",i.fillRect(7,9,3,3),i.fillStyle="#ffffff",i.fillRect(12,10,1,5),i.fillRect(10,12,5,1)}),'''

GAME = 'class Sd extends j.Scene{constructor(){super("Game"'

TABS_PT = '["EQUIPAMENTO","ATRIBUTOS","CRÔNICAS","HABILIDADES"],["EQUIPMENT","ATTRIBUTES","CHRONICLES","SKILLS"],["EQUIPO","ATRIBUTOS","CRÓNICAS","HABILIDADES"]'
TABS_C = '["EQUIPAMENTO","ATRIBUTOS","MISSÃO","CRÔNICAS","HABILIDADES"],["EQUIPMENT","ATTRIBUTES","MISSION","CHRONICLES","SKILLS"],["EQUIPO","ATRIBUTOS","MISIÓN","CRÓNICAS","HABILIDADES"]'

REPL = [
    # ação nova: POÇÃO 2 (slot da herborista)
    ('"PAUSE","POTION","MOVE_UP"', '"PAUSE","POTION","POTION2","MOVE_UP"'),
    ('POTION:["KeyQ"],', 'POTION:["KeyQ"],POTION2:["KeyR"],'),
    ('POTION:[12],', 'POTION:[12],POTION2:[15],'),
    ('__p1K("POTION")&&this.usePotion(),', '__p1K("POTION")&&this.usePotion(),\n__p1K("POTION2")&&__hbUse2(this),'),
    ('this.potionCooldown>0&&(this.potionCooldown-=e);', 'this.potionCooldown>0&&(this.potionCooldown-=e);__hbTick(this,e);'),
    ('this.potions={count:', 'this.__hbE=null,this.__hbI=0,this.__hbAura=null,this.potions={count:'),
    # invulnerabilidade
    ('takeDamage(i,t){if(this.dead||this.invuln>0)return this.__contactHit=!1,!1;',
     'takeDamage(i,t){if(this.dead||this.invuln>0||this.__shieldT>0)return this.__contactHit=!1,!1;'),
    # barra de ações: slot 2 acima da poção normal; contagem certa da poção normal
    ('const u=i.abilities?.slots??[],p=i.inventory,v=p?.potionCount?.()??0',
     '__hb2Hud(this,i);const u=i.abilities?.slots??[],p=i.inventory,v=i.potions?.count??p?.potionCount?.()??0'),
    ('setOn(i){if(this.on===i)return;this.on=i;', 'setOn(i){if(this.on===i)return;this.on=i;this.__h2?.forEach(o=>o.setVisible(!1));'),
    # toque: botão da poção 2
    ('sublabel:"POÇÃO"}),', 'sublabel:"POÇÃO"}),this.pot2Btn=new ne(i,this.mgr,{x:0,y:0,r:14,icon:"icon-potion-plus",action:"POTION2",color:2756372,ring:16765514,sublabel:"POÇÃO 2"}),'),
    ('this.potionBtn,this.startBtn', 'this.potionBtn,this.pot2Btn,this.startBtn'),
    ('[this.potionBtn,18]]', '[this.potionBtn,18],[this.pot2Btn,14]]'),
    ('this.potionBtn.setPosition(h+p*54*i,u-54*i)', 'this.potionBtn.setPosition(h+p*54*i,u-54*i),this.pot2Btn?.setPosition(h+p*92*i,u-80*i)'),
    ('this.potionBtn.keyHint.setText(a>0?`POÇÃO x${a}`:"POÇÃO");',
     'this.potionBtn.keyHint.setText(a>0?`POÇÃO x${a}`:"POÇÃO");if(this.pot2Btn){const P=window.__potHud,on=!!P&&(P.camp||P.c+P.p+P.v>0);for(const r of this.pot2Btn.parts)r.setVisible(on);if(on){const k=__hbIcon(P.sel);this.pot2Btn.__hbK!==k&&(this.pot2Btn.__hbK=k,this.pot2Btn.setIconTexture(k));this.pot2Btn.setCooldown(o>0?o/1.2:0,o,P.n<=0);this.pot2Btn.keyHint.setText(`${__hbName(P.sel,1)} x${P.n}`)}}'),
    # inventário: aba POÇÕES
    (TABS_PT, '["EQUIPAMENTO","ATRIBUTOS","CRÔNICAS","HABILIDADES","POÇÕES"],["EQUIPMENT","ATTRIBUTES","CHRONICLES","SKILLS","POTIONS"],["EQUIPO","ATRIBUTOS","CRÓNICAS","HABILIDADES","POCIONES"]'),
    (TABS_C, '["EQUIPAMENTO","ATRIBUTOS","MISSÃO","CRÔNICAS","HABILIDADES","POÇÕES"],["EQUIPMENT","ATTRIBUTES","MISSION","CHRONICLES","SKILLS","POTIONS"],["EQUIPO","ATRIBUTOS","MISIÓN","CRÓNICAS","HABILIDADES","POCIONES"]'),
    ('{let tx=52;for(const o of C.__tabT)o.setX(tx),tx+=o.width+30}', '{let tx=48;for(const o of C.__tabT)o.setX(tx),tx+=o.width+(C.__tabT.length>5?20:30)}'),
    ('const numTabs=_isEndless?4:5;', 'const numTabs=_isEndless?5:6;'),
    ('C.__big.setVisible(!eq&&logicalTab!==4);', 'C.__big.setVisible(!eq&&logicalTab<4);__potTab(C,logicalTab===5);'),
    ('handleKey(i){if(!this.open)return!1;if(this.__sk&&this.__tab>=1', 'handleKey(i){if(!this.open)return!1;if(this.__sk&&this.__logicalTab===5&&__potKey(this,i))return!0;if(this.__sk&&this.__tab>=1'),
    ('vt(c,"icon-potion",', ICONS + 'vt(c,"icon-potion",'),
]
for old, new in REPL:
    if new not in s:
        assert s.count(old) == 1, (s.count(old), old[:80])
        s = s.replace(old, new)

if "/*__HERB__*/" in s:
    a = s.index("/*__HERB__*/")
    b = s.index(GAME, a)
    s = s[:a] + s[b:]
assert s.count(GAME) == 1
s = s.replace(GAME, HELPERS + GAME)

for p in (BUNDLE, MIRROR):
    open(p, "w", encoding="utf-8").write(s)
print("herborista: slot 2 de poção + aba POÇÕES aplicados")
