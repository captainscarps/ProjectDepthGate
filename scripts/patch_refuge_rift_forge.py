"""
Patch: Refúgio por Herói + Guardiã & Fenda Desafio + Forja no Inventário
- Upgrades do Refúgio agora são por herói atual (limpos ao excluir o herói).
- Guardiã oferece a Fenda Desafio se o herói estiver fraco ou sem falas novas.
- Fenda Desafio: procedural, longa, sem save, inimigos difíceis, 3 chefes aleatórios em salas diferentes.
  Recompensas: Cristais do Refúgio e itens lendários/únicos.
- Forja no Inventário: funde 3 itens da mesma raridade em 1 da raridade superior (ou Cristais do Refúgio se for Relíquia).
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")

FORGE_SRC = open(os.path.join(ROOT, "scripts", "source", "forge.js"), encoding="utf-8").read()
RIFT_SRC = open(os.path.join(ROOT, "scripts", "source", "rift.js"), encoding="utf-8").read()

s = open(BUNDLE, encoding="utf-8").read()
if "__openForge" in s:
    print("já aplicado — nada a fazer")
    raise SystemExit(0)

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, f"esperava {count}, achei {n}: {old[:90]!r}"
    s = s.replace(old, new)

# 1. Injeta código da Forja e da Fenda antes de function __hubEnter
rep(
    'function __hubEnter(S,p){',
    FORGE_SRC + '\n' + RIFT_SRC + '\nfunction __hubEnter(S,p){'
)

# 2. Upgrades do Refúgio atrelados ao herói atual
rep(
    'function Xe(){try{const c=localStorage.getItem(_n),i=c?JSON.parse(c):{};return{fragments:i.fragments??0,upgrades:i.upgrades??{},totalEarned:i.totalEarned??0}}catch{return{fragments:0,upgrades:{},totalEarned:0}}}function tr(c){try{localStorage.setItem(_n,JSON.stringify(c))}catch{}}',
    'function __metaKey(){let s=1;try{const g=window.__DED_GAME;s=g?.registry?.get("save:slot")??1}catch(e){}return"dungeon-crawler:meta:slot_"+s}function Xe(){try{const k=__metaKey(),c=localStorage.getItem(k)||localStorage.getItem(_n),i=c?JSON.parse(c):{};return{fragments:i.fragments??0,upgrades:i.upgrades??{},totalEarned:i.totalEarned??0}}catch{return{fragments:0,upgrades:{},totalEarned:0}}}function tr(c){try{localStorage.setItem(__metaKey(),JSON.stringify(c))}catch{}}'
)

# 3. Exclusão de Herói: remove também os upgrades do Refúgio daquele slot
rep(
    'function Kr(c=1,i="campaign"){localStorage.removeItem(Wt(i,c))}',
    'function Kr(c=1,i="campaign"){localStorage.removeItem(Wt(i,c));try{localStorage.removeItem("dungeon-crawler:meta:slot_"+c)}catch(e){}}'
)

# 4. Guardiã oferece a Fenda Desafio quando terminar as falas ou se o herói já as ouviu
rep(
    'function __guardianTalk(S){if(S.__guard?.intro){__gSay(S,[{who:"guardia",expr:"talk",name:__GN,text:"Os Cristais Esmeralda estão nas clareiras mais distantes da mata. Traga-os ao Coração da Floresta."}]);return}const{r}=__hubProg(S),L=[...__gStage(r)];if(!__stFlag(S,"heroLine")){const h=__heroLine(S);h&&(__stFlag(S,"heroLine",!0),L.push(h,{who:"guardia",expr:"smile",name:__GN,text:"Perguntas demais para alguém tão jovem. Vá. As respostas estão do outro lado."}))}__gSay(S,L)}',
    'function __guardianTalk(S){if(S.__guard?.intro){__gSay(S,[{who:"guardia",expr:"talk",name:__GN,text:"Os Cristais Esmeralda estão nas clareiras mais distantes da mata. Traga-os ao Coração da Floresta."}]);return}const{r}=__hubProg(S),L=[...__gStage(r)];if(!__stFlag(S,"heroLine")){const h=__heroLine(S);h&&(__stFlag(S,"heroLine",!0),L.push(h,{who:"guardia",expr:"smile",name:__GN,text:"Perguntas demais para alguém tão jovem. Vá. As respostas estão do outro lado."}))}const tk="gTk_"+r;if(__stFlag(S,tk)){__offerRiftPrompt(S);return}__stFlag(S,tk,!0);__gSay(S,L,()=>__offerRiftPrompt(S))}'
)

# 5. Cena Game: suporte a Fenda Desafio (isRift)
rep(
    'else this.levelId=i.levelId??Zn,this.level=__cdLevel(this,ki[this.levelId]);',
    'else if(i.isRift){this.isRift=!0;this.level=__buildRiftLevel(this);this.levelId="rift";ki.rift=this.level;}else this.levelId=i.levelId??Zn,this.level=__cdLevel(this,ki[this.levelId]);'
)

# 6. Sem Save dentro da Fenda Desafio
rep(
    'requestSave(i=400){this.game.registry.get("mode")!=="endless"&&(this.saveTimer?.remove(),this.saveTimer=this.time.delayedCall(i,()=>{this.state!=="playing"&&this.state!=="victory"||(this.game.events.emit("save:saving"),di(this))}))}',
    'requestSave(i=400){if(this.isRift)return;this.game.registry.get("mode")!=="endless"&&(this.saveTimer?.remove(),this.saveTimer=this.time.delayedCall(i,()=>{this.state!=="playing"&&this.state!=="victory"||(this.game.events.emit("save:saving"),di(this))}))}'
)

# 7. Morte na Fenda Desafio: sem permadeath, resgate pela Guardiã de volta ao Refúgio
rep(
    'onGameOver(){this.state==="playing"&&(this.state="gameover"),this.audio.setState("DEFEAT"),this.endChallenge();',
    'onGameOver(){if(this.isRift){this.state="rift_defeat";this.game.events.emit("ui:banner",__L3("A FENDA TE REJEITOU! Retornando ao Refúgio...","THE RIFT REJECTED YOU! Returning to Refuge...","¡LA GRIETA TE RECHAZÓ! Regresando al Refugio..."),"#e05a4a");this.time.delayedCall(1600,()=>__goLevel(this,"forest",{hubReturn:!0}));return;}this.state==="playing"&&(this.state="gameover"),this.audio.setState("DEFEAT"),this.endChallenge();'
)

# 8. Inimigos difíceis na Fenda Desafio
rep(
    'd.respawned&&(n.respawned=!0,n.xp=Math.max(1,Math.round(n.xp*.5))),this.enemies.add(n)',
    'd.respawned&&(n.respawned=!0,n.xp=Math.max(1,Math.round(n.xp*.5))),this.isRift&&(n.maxHp=Math.round(n.maxHp*1.6),n.hp=n.maxHp,n.damage=+(n.damage*1.35).toFixed(1),n.xp=Math.round(n.xp*2)),this.enemies.add(n)'
)

# 9. Chefes da Fenda Desafio: dropar lendários únicos + Cristais do Refúgio
rep(
    'this.scene.stats.addXp(i.xp),this.scene.effects.floatText(i.x,i.y-30,`+${i.xp} XP`,"#c9a24a"),this.scene.lootSystem.dropFromBoss(i);',
    'this.scene.stats.addXp(i.xp),this.scene.effects.floatText(i.x,i.y-30,`+${i.xp} XP`,"#c9a24a"),this.scene.lootSystem.dropFromBoss(i);if(this.scene.isRift)try{__onRiftBossKilled(this.scene,i)}catch(e){}'
)

# 10. Botão da FORJA no inventário
rep(
    'C.actionBtn.setPosition(262,256),C.dropBtn.setPosition(372,256);',
    'C.actionBtn.setPosition(262,256),C.dropBtn.setPosition(372,256);C.forgeBtn||(C.forgeBtn=C.makeButton(482,256,__L3("FORJA","FORGE","FORJA"),()=>__openForge(C)),C.root.add(C.forgeBtn));C.forgeBtn.setPosition(482,256);'
)

# 11. Visibilidade do botão da FORJA nas abas do inventário
rep(
    'C.__big.setVisible(!eq&&C.__tab!==4);C.refresh();__invScroll(C)}',
    'C.__big.setVisible(!eq&&C.__tab!==4);C.forgeBtn?.setVisible(C.__tab===0);C.refresh();__invScroll(C)}'
)

open(BUNDLE, "w", encoding="utf-8").write(s)
if os.path.isdir(os.path.dirname(MIRROR)):
    shutil.copyfile(BUNDLE, MIRROR)
print("OK — Refúgio por herói, Fenda Desafio e Forja aplicados com sucesso!")
