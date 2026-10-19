"""
Herborista: 3 tipos de poção no jogo (Vida, Vida Plus = 3x a cura, Invulnerabilidade temporária).

- A bolsa da herborista guarda as poções compradas, sem limite:
    campanha → save da campanha (campaign.refuge.herb) + registry "campaign:refuge"
    fora da campanha → localStorage "depthgate:herb"
- POÇÃO (Q / direcional ↑ / botão de toque) bebe o tipo selecionado.
  Poção comum: primeiro as da corrida (limite normal), depois as da bolsa.
- TROCAR POÇÃO (R / direcional → / botão ⇄ no toque) alterna entre os tipos que você tem.
- HUD mostra o ícone/quantidade do tipo selecionado.
Re-executável.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()

HELPERS = r'''/*__HERB__*/const __HBV=6;function __hbName(k,sh){return k==="p"?(sh?"PLUS":__L3("Poção de Vida Plus","Health Potion Plus","Poción de Vida Plus")):k==="v"?(sh?__L3("INVULN.","INVULN.","INVULN."):__L3("Poção de Invulnerabilidade","Invulnerability Potion","Poción de Invulnerabilidad")):(sh?__L3("POÇÃO","POTION","POCIÓN"):__L3("Poção de Vida","Health Potion","Poción de Vida"))}
function __hbGet(S){const g=S.game;if(g.registry.get("mode")==="campaign"){let r=g.registry.get("campaign:refuge");r||(r={upgrades:{}},g.registry.set("campaign:refuge",r));r.herb=Object.assign({c:0,p:0,v:0},r.herb||{});return r.herb}if(!S.__hbL){let o=null;try{o=JSON.parse(localStorage.getItem("depthgate:herb")||"null")}catch(e){}S.__hbL=Object.assign({c:0,p:0,v:0},o||{})}return S.__hbL}
function __hbPut(S){const g=S.game,H=__hbGet(S);if(g.registry.get("mode")==="campaign"){try{const sl=g.registry.get("save:slot")??1,r=Dn(sl);if(r.ok){r.data.campaign??={};r.data.campaign.refuge??={upgrades:{}};r.data.campaign.refuge.herb={c:H.c|0,p:H.p|0,v:H.v|0};localStorage.setItem(Wt("campaign",sl),JSON.stringify(r.data))}}catch(e){}return}try{localStorage.setItem("depthgate:herb",JSON.stringify(H))}catch(e){}}
function __hbHud(S){const H=__hbGet(S),sel=S.__potSel||"c",run=S.potions?.count??0;window.__potHud={sel,run,c:H.c|0,p:H.p|0,v:H.v|0,n:sel==="c"?run+(H.c|0):H[sel]|0};S.game.events.emit("hud:potions",run,S.potions?.max??5)}
function __hbSlot(S){const P=window.__potHud,sel=P?.sel||"c";if(sel==="c"){const n=(S?.potions?.count??0)+(P?.c||0);return{icon:"icon-potion",count:n,dim:n<=0}}const n=P?.n||0;return{icon:sel==="p"?"icon-potion-plus":"icon-potion-inv",count:n,dim:n<=0}}
function __hbNext(S){const p=S.player;if(!p||S.state!=="playing")return;const H=__hbGet(S),C=["c","p","v"].filter(k=>k==="c"||(H[k]|0)>0);if(C.length<2){S.effects?.floatText(p.x,p.y-20,__L3("Só poções comuns — a Herborista vende outras","Only common potions — the Herbalist sells others","Solo pociones comunes — la Herbolaria vende otras"),"#c9bfa4");return}const k=C[(C.indexOf(S.__potSel||"c")+1)%C.length];S.__potSel=k;S.game.audioEngine?.sfx?.("sfx-ui-tab");S.effects?.floatText(p.x,p.y-22,"⇄ "+__hbName(k),k==="v"?"#ffd24a":k==="p"?"#ff8aa8":"#e88a8a");__hbHud(S)}
function __hbTick(S,e){if(!S.__hbI){S.__hbI=1;__hbHud(S);const P=window.__potHud;if(!window.__hbTip&&P&&P.p+P.v>0&&S.player){window.__hbTip=1;S.time.delayedCall(1800,()=>{const im=S.game.inputManager;S.player&&S.effects?.floatText(S.player.x,S.player.y-34,(im?.device==="touch"?"⇄":im?.label?.("POTION_NEXT")||"[R]")+" "+__L3("troca o tipo de poção","switches potion type","cambia el tipo de poción"),"#ffd24a")})}}const p=S.player;if(!p)return;let a=S.__hbAura;if(p.__shieldT>0&&!p.dead){p.__shieldT-=e;if(!a||!a.active){a=S.__hbAura=S.add.image(p.x,p.y,"light").setBlendMode(j.BlendModes.ADD).setTint(16765514).setScale(.34);S.__hbRing=S.add.graphics().setBlendMode(j.BlendModes.ADD)}const k=p.__shieldT,bl=k<1.6&&Math.floor(k*8)%2===1;a.setPosition(p.x,p.y-10).setDepth(p.depth+1).setAlpha(bl?.12:.4+.12*Math.sin(S.time.now/110));const R=S.__hbRing;R.clear().setDepth(p.depth+1);bl||R.lineStyle(1.5,16765514,.75).strokeEllipse(p.x,p.y-10,30+3*Math.sin(S.time.now/90),36+3*Math.sin(S.time.now/90));if(Math.random()<e*14){const q=S.add.rectangle(p.x+j.Math.Between(-12,12),p.y-j.Math.Between(0,22),2,2,16771498).setDepth(p.depth+2).setBlendMode(j.BlendModes.ADD);S.tweens.add({targets:q,y:q.y-14,alpha:0,duration:600,onComplete:()=>q.destroy()})}if(p.__shieldT<=0){p.__shieldT=0;a.destroy();S.__hbRing?.destroy();S.__hbAura=S.__hbRing=null;S.effects?.floatText(p.x,p.y-24,__L3("A proteção acabou","Protection faded","La protección terminó"),"#c9bfa4")}}else if(a){a.destroy();S.__hbRing?.destroy();S.__hbAura=S.__hbRing=null}}
function __hbHudDraw(h){const P=window.__potHud,sel=P?.sel||"c",key=sel==="p"?"icon-potion-plus":sel==="v"?"icon-potion-inv":"icon-potion";h.potionIcon.texture?.key!==key&&h.scene.textures.exists(key)&&h.potionIcon.setTexture(key);if(sel==="c"){const ex=P?.c||0,n=h.potions;h.potionIcon.setAlpha(n+ex>0?1:.35);h.potionText.setText(n+ex>0?ex>0?`x${n}+${ex}`:`x${n}`:"")}else{const n=P?.n||0;h.potionIcon.setAlpha(n>0?1:.35);h.potionText.setText(`x${n}`)}let lb="";if((P?.p||0)+(P?.v||0)>0){const im=h.scene.game.inputManager;lb=im?.device==="touch"?"⇄":(im?.label?.("POTION_NEXT")||"[R]")+"⇄"}h.potionKey.setText(lb)}
'''

USE = r'''usePotion(){/*__HBUSE__*/const i=this.player;if(this.state!=="playing"||i.dead||this.potionCooldown>0)return!1;const H=__hbGet(this),sel=this.__potSel||"c",no=()=>(this.effects.floatText(i.x,i.y-20,W("g.noPotion"),"#d84040"),!1);
if(sel==="v"){if((H.v|0)<=0)return this.__potSel="c",__hbHud(this),no();H.v--;__hbPut(this);this.potionCooldown=1.2;i.__shieldT=Math.max(i.__shieldT||0,__HBV);this.audio.play(Ct.POTION_USE);this.game.audioEngine?.sfx?.("sfx-shrine-use");this.effects.burstTinted(i.x,i.y-6,16765514,18);this.effects.shockwaveRing?.(i.x,i.y,22);this.effects.floatText(i.x,i.y-26,__L3("INVULNERÁVEL!","INVULNERABLE!","¡INVULNERABLE!"),"#ffd24a");H.v<=0&&(this.__potSel="c");__hbHud(this);this.game.events.emit("haptic","hit");return!0}
if(i.hp>=i.maxHp)return this.effects.floatText(i.x,i.y-20,W("g.hpFull"),"#8ae0b0"),!1;const t=3+this.getBlessingBonus("potionPower");
if(sel==="p"){if((H.p|0)<=0)return this.__potSel="c",__hbHud(this),no();H.p--;__hbPut(this);this.potionCooldown=1.2;i.heal(t*3);this.audio.play(Ct.POTION_USE);this.effects.burstTinted(i.x,i.y-6,16730730,22);this.effects.floatText(i.x,i.y-26,`+${t*3}`,"#ff8aa8");H.p<=0&&(this.__potSel="c")}
else{if(this.potions.count>0)this.potions.count--;else if((H.c|0)>0)H.c--,__hbPut(this);else{const alt=(H.p|0)>0?"p":null;if(alt){this.__potSel=alt;__hbHud(this);return this.usePotion()}return __hbHud(this),no()}this.potionCooldown=1.2;i.heal(t);this.audio.play(Ct.POTION_USE);this.effects.burstTinted(i.x,i.y-6,14174826,12)}
__hbHud(this);this.game.events.emit("haptic","hit");return!0}'''

ICONS = r'''vt(c,"icon-potion-plus",i=>{i.fillStyle="#b8c4d0",i.fillRect(7,1,6,3),i.fillStyle="#5a1020",i.beginPath(),i.arc(10,12,7.5,0,Math.PI*2),i.fill(),i.fillStyle="#e0285a",i.beginPath(),i.arc(10,12,6.5,0,Math.PI*2),i.fill(),i.fillStyle="#ff9ab4",i.fillRect(6,8,3,3),i.fillStyle="#ffe08a",i.fillRect(10,9,2,7),i.fillRect(8,11,6,2)}),vt(c,"icon-potion-inv",i=>{i.fillStyle="#b8c4d0",i.fillRect(8,2,4,3),i.fillStyle="#6a5008",i.beginPath(),i.arc(10,12,6.5,0,Math.PI*2),i.fill(),i.fillStyle="#f0c030",i.beginPath(),i.arc(10,12,5.5,0,Math.PI*2),i.fill(),i.fillStyle="#fff4b0",i.fillRect(7,9,3,3),i.fillStyle="#ffffff",i.fillRect(12,10,1,5),i.fillRect(10,12,5,1)}),'''

GAME = 'class Sd extends j.Scene{constructor(){super("Game"'

REPL = [
    # ação nova: trocar poção
    ('"PAUSE","POTION","MOVE_UP"', '"PAUSE","POTION","POTION_NEXT","MOVE_UP"'),
    ('POTION:["KeyQ"],', 'POTION:["KeyQ"],POTION_NEXT:["KeyR"],'),
    ('POTION:[12],', 'POTION:[12],POTION_NEXT:[15],'),
    ('__p1K("POTION")&&this.usePotion(),', '__p1K("POTION")&&this.usePotion(),\n__p1K("POTION_NEXT")&&__hbNext(this),'),
    ('this.potionCooldown>0&&(this.potionCooldown-=e);', 'this.potionCooldown>0&&(this.potionCooldown-=e);__hbTick(this,e);'),
    ('this.potions={count:', 'this.__hbL=null,this.__hbI=0,this.__hbAura=null,this.__potSel="c",this.potions={count:'),
    # invulnerabilidade
    ('takeDamage(i,t){if(this.dead||this.invuln>0)return this.__contactHit=!1,!1;',
     'takeDamage(i,t){if(this.dead||this.invuln>0||this.__shieldT>0)return this.__contactHit=!1,!1;'),
    # HUD
    ('this.potionIcon.setAlpha(this.potions>0?1:.35),this.potionText.setText(this.potions>0?`x${this.potions}`:""),this.potionKey.setText("")',
     '__hbHudDraw(this)'),
    ('{icon:"icon-potion",count:v,dim:v<=0}', '__hbSlot(i)'),
    # toque: botão ⇄ e ícone do tipo selecionado
    ('sublabel:"POÇÃO"}),', 'sublabel:"POÇÃO"}),this.potNextBtn=new ne(i,this.mgr,{x:0,y:0,r:11,label:"⇄",action:"POTION_NEXT",color:2756372,ring:16765514,labelColor:"#ffd24a"}),'),
    ('this.potionBtn,this.startBtn', 'this.potionBtn,this.potNextBtn,this.startBtn'),
    ('[this.potionBtn,18]]', '[this.potionBtn,18],[this.potNextBtn,11]]'),
    ('this.potionBtn.setPosition(h+p*54*i,u-54*i)', 'this.potionBtn.setPosition(h+p*54*i,u-54*i),this.potNextBtn?.setPosition(h+p*84*i,u-76*i)'),
    ('const o=Math.max(0,i.potionCooldown??0),a=i.potions?.count??0;this.potionBtn.setCooldown(o>0?o/1.2:0,o,a<=0),this.potionBtn.keyHint.setText(a>0?`POÇÃO x${a}`:"POÇÃO");',
     'const o=Math.max(0,i.potionCooldown??0),__hs=__hbSlot(i),a=__hs.count;this.potionBtn.__hbK!==__hs.icon&&(this.potionBtn.__hbK=__hs.icon,this.potionBtn.setIconTexture(__hs.icon));this.potionBtn.setCooldown(o>0?o/1.2:0,o,a<=0),this.potionBtn.keyHint.setText(a>0?`${__hbName(window.__potHud?.sel||"c",1)} x${a}`:"POÇÃO");if(this.potNextBtn){const P=window.__potHud,alt=(P?.p||0)+(P?.v||0)>0;for(const r of this.potNextBtn.parts)r.setVisible(alt)}'),
    ('vt(c,"icon-potion",', ICONS + 'vt(c,"icon-potion",'),
]
for old, new in REPL:
    if new not in s:
        assert s.count(old) == 1, old[:70]
        s = s.replace(old, new)

if "/*__HERB__*/" in s:
    a = s.index("/*__HERB__*/")
    b = s.index(GAME, a)
    s = s[:a] + s[b:]
assert s.count(GAME) == 1
s = s.replace(GAME, HELPERS + GAME)

if "/*__HBUSE__*/" not in s:
    a = s.index("usePotion(){const i=this.player;")
    b = s.index("gainPotion(i=1){", a)
    old = s[a:b]
    assert old.endswith('this.game.events.emit("haptic","hit"),!0}'), old[-80:]
    s = s[:a] + USE + s[b:]

for p in (BUNDLE, MIRROR):
    open(p, "w", encoding="utf-8").write(s)
print("herborista: poções aplicadas")
