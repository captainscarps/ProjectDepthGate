"""
Script para espaçar amplamente os portais do Coração da Floresta,
descolar os nomes e corrigir o bug do quadrado preto/verde no centro da tela.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [
    os.path.join(ROOT, 'assets', 'index-D6qIWtA7-p209.js'),
    os.path.join(ROOT, 'Projeto atualizado', 'assets', 'index-D6qIWtA7-p209.js')
]

OLD_LOAD = 'this.load.spritesheet("hub-portal","assets/pixel-art/hub/hub-portal2.png",{frameWidth:56,frameHeight:65});'
NEW_LOAD = 'this.load.spritesheet("hub-portal","assets/pixel-art/hub/hub-portal2.png",{frameWidth:56,frameHeight:65});this.load.image("hub-shrine","assets/pixel-art/hub/shrine.png");this.load.image("hub-torch","assets/pixel-art/props/torch-base.png");this.load.image("hub-brazier","assets/pixel-art/props/brazier.png");'

OLD_ROOM = '{id:"coracao",name:"Coração da Floresta",rect:{x:34,y:8,w:20,h:12},ambient:.62,hub:!0,banner:"CORAÇÃO DA FLORESTA",walls:[{x:43,y:13,w:2,h:1}],enemies:[],decor:[]}'
NEW_ROOM = '{id:"coracao",name:"Coração da Floresta",rect:{x:34,y:6,w:22,h:14},ambient:.65,hub:!0,banner:"CORAÇÃO DA FLORESTA",walls:[{x:44,y:10,w:2,h:1}],enemies:[],decor:[]}'

NEW_HUB_PORTALS = '''function __hubPortals(S){if(S.__hubPortals)return;const B=S.dungeon,R=B.level.rooms.find(r=>r.hub),q=R?.rect;if(!q)return;const P=[],done=__HUBD.filter(id=>__isPortalDone(S,id)),all=done.length>=__HUBD.length;done.forEach(id=>{const cid=__CRY[id];if(cid&&!__hasItem(S,cid)&&S.lootSystem?.makeItem){const it=S.lootSystem.makeItem(cid,"LEGENDARY");it&&S.inventory?.items?.push(it)}});S.anims.exists("hub-portal-a")||S.anims.create({key:"hub-portal-a",frames:S.anims.generateFrameNumbers("hub-portal",{start:0,end:13}),frameRate:10,repeat:-1});const cx=1420,cy=340,rx=290,ry=140;const PORTALS_CFG=[["glacial",-72],["catacombs",-108],["vulcao",-36],["castle",-144],["morta",0],["bosque",180],["rio",36],["temple",144],["ruins",72],["fortress",108]];const pavG=S.add.graphics().setDepth(.2);pavG.lineStyle(4,11838860,.4);pavG.strokeEllipse(cx,cy,rx,ry);pavG.lineStyle(2,10523000,.3);pavG.strokeEllipse(cx,cy,rx*.7,ry*.7);pavG.lineStyle(3,12496770,.4);pavG.strokeEllipse(cx,cy,rx*.4,ry*.4);pavG.lineStyle(1.5,10523000,.2);for(const[pid,deg]of PORTALS_CFG){const rad=deg*Math.PI/180,px=cx+Math.round(rx*Math.cos(rad)),py=cy+Math.round(ry*Math.sin(rad));pavG.lineBetween(cx,cy,px,py);pavG.fillStyle(13938506,.6).fillCircle(px,py,2.5)}const altTex=S.textures.exists("hub-shrine")?"hub-shrine":(S.textures.exists("ruin-altar")?"ruin-altar":(S.textures.exists("altar")?"altar":"fp-statue-mother"));const altSpr=S.add.sprite(cx,cy-8,altTex).setOrigin(.5,1).setDepth(cy).setScale(1.15);S.lighting?.addLight?.({x:cx,y:cy-40,radius:95,flicker:.08,color:4513279});const altGl=S.add.image(cx,cy-40,"light").setScale(.45).setBlendMode(j.BlendModes.ADD).setTint(4513279).setAlpha(.45).setDepth(cy-1);S.tweens.add({targets:altGl,alpha:.22,scale:.52,duration:1800,yoyo:!0,repeat:-1});const brzTex=S.textures.exists("brazier")?"brazier":"hub-brazier";if(S.textures.exists(brzTex)){const bL=S.add.sprite(cx-36,cy,brzTex).setOrigin(.5,1).setDepth(cy);const bR=S.add.sprite(cx+36,cy,brzTex).setOrigin(.5,1).setDepth(cy)}S.lighting?.addLight?.({x:cx-36,y:cy-20,radius:55,flicker:.18,color:16746547});S.lighting?.addLight?.({x:cx+36,y:cy-20,radius:55,flicker:.18,color:16746547});S.add.rectangle(cx,cy+8,140,13,0x0a0806,.78).setDepth(8999);S.add.text(cx,cy+8,__T("✦ CORAÇÃO DA FLORESTA ✦"),{fontFamily:"'Courier New', monospace",fontSize:"7.5px",fontStyle:"bold",color:"#8ae0b0",stroke:"#0a0806",strokeThickness:2.5}).setOrigin(.5,.5).setDepth(9000);const mk=(id,deg,big)=>{const rad=deg*Math.PI/180,x=cx+Math.round(rx*Math.cos(rad)),y=cy+Math.round(ry*Math.sin(rad));const trchTex=S.textures.exists("torch-base")?"torch-base":"hub-torch";if(S.textures.exists(trchTex)){S.add.image(x-22,y,trchTex).setOrigin(.5,1).setDepth(y-.1);S.add.image(x+22,y,trchTex).setOrigin(.5,1).setDepth(y-.1)}S.lighting?.addLight?.({x:x-22,y:y-36,radius:45,flicker:.2,color:16755268});S.lighting?.addLight?.({x:x+22,y:y-36,radius:45,flicker:.2,color:16755268});const fL=S.add.image(x-22,y-36,"light").setScale(.12).setBlendMode(j.BlendModes.ADD).setTint(16755268).setAlpha(.4).setDepth(y);const fR=S.add.image(x+22,y-36,"light").setScale(.12).setBlendMode(j.BlendModes.ADD).setTint(16755268).setAlpha(.4).setDepth(y);S.tweens.add({targets:[fL,fR],alpha:.2,duration:250+Math.random()*150,yoyo:!0,repeat:-1});const sp=S.add.sprite(x,y,"hub-portal",0).setOrigin(.5,1).setDepth(y).setScale(big?1.35:1);sp.play("hub-portal-a");const col=id==="castle"?16765514:__HUBC[id];sp.setTint(col);const gl=S.add.image(x,y-10,"light").setScale(big?.5:.32).setBlendMode(j.BlendModes.ADD).setTint(col).setAlpha(.45).setDepth(y-1);S.tweens.add({targets:gl,alpha:.22,duration:1100,yoyo:!0,repeat:-1});S.lighting?.addLight?.({x,y:y-24,radius:big?110:75,flicker:.12,color:col});const ov=S.add.sprite(x,y,"hub-portal",0).setOrigin(.5,1).setDepth(y+.5).setScale(sp.scaleX).setBlendMode(j.BlendModes.ADD).setTint(col).setAlpha(.35);S.tweens.add({targets:ov,alpha:.65,duration:1200,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"});sp.__ov=ov;sp.__level=id;sp.__glow=gl;return sp};__HUBD.forEach(id=>{const cfg=PORTALS_CFG.find(c=>c[0]===id),deg=cfg?cfg[1]:0,p=mk(id,deg,!1),nm=St(`lvl.${id}`,ki[id].name);p.__sealed=done.includes(id);const tw=Math.max(54,nm.length*5.4+14);S.add.rectangle(p.x,p.y+8,tw,12,0x0a0806,.78).setDepth(8999);S.add.text(p.x,p.y+8,nm.toUpperCase(),{fontFamily:"'Courier New', monospace",fontSize:"7px",fontStyle:"bold",color:p.__sealed?"#7a7268":"#f5e6c8",stroke:"#0a0806",strokeThickness:2}).setOrigin(.5,.5).setDepth(9000);if(p.__sealed){__sealFx(S,"seal-ward",p.x,p.y+4,.55,!0)?.setAlpha(.55);p.setTint(7829367).setAlpha(.4),p.__glow.setVisible(!1),p.__ov.setVisible(!1);S.add.text(p.x,p.y-42,__T("✦ SELADO ✦"),{fontFamily:"'Courier New', monospace",fontSize:"7px",fontStyle:"bold",color:"#c9a24a",stroke:"#000",strokeThickness:3}).setOrigin(.5).setDepth(9e3)}p.__label=()=>p.__sealed?__T("Portal selado (concluído)"):`${__L3("Entrar","Enter","Entrar")}: ${nm}`;P.push(p)});const cCfg=PORTALS_CFG.find(c=>c[0]==="castle"),cp=mk("castle",cCfg?cCfg[1]:-144,!0);cp.__locked=!all;all?cp.setTint(16771782):(cp.setTint(5592405).setAlpha(.5),cp.__glow.setVisible(!1),cp.__ov.setVisible(!1));S.add.rectangle(cp.x,cp.y+8,128,12,0x0a0806,.8).setDepth(8999);S.add.text(cp.x,cp.y+8,__T("CASTELO DE VALDRAK"),{fontFamily:"'Courier New', monospace",fontSize:"7.5px",fontStyle:"bold",color:all?"#ffd24a":"#7a7268",stroke:"#0a0806",strokeThickness:2}).setOrigin(.5,.5).setDepth(9000);__guardian(S);cp.__label=()=>cp.__locked?__L3(`Portal adormecido (${done.length}/${__HUBD.length} masmorras)`,`Dormant gate (${done.length}/${__HUBD.length} dungeons)`,`Portal dormido (${done.length}/${__HUBD.length} mazmorras)`):__T("Entrar: Castelo de Valdrak");P.push(cp);S.__hubPortals=P}'''

for path in TARGETS:
    with open(path, 'r', encoding='utf-8') as f:
        src = f.read()

    # Preload textures
    if 'this.load.image("hub-shrine"' not in src:
        assert OLD_LOAD in src, f"OLD_LOAD not found in {path}"
        src = src.replace(OLD_LOAD, NEW_LOAD, 1)

    # Room definition
    if OLD_ROOM in src:
        src = src.replace(OLD_ROOM, NEW_ROOM, 1)

    # __hubPortals function
    start = src.find('function __hubPortals(S){')
    end = src.find('P.push(cp);S.__hubPortals=P}', start) + len('P.push(cp);S.__hubPortals=P}')
    assert start != -1 and end != -1, f"__hubPortals not found in {path}"
    src = src[:start] + NEW_HUB_PORTALS + src[end:]

    # Player respawn on retreat / hub return
    src = src.replace('q&&S.player.body.reset(1408,510)', 'q&&S.player.body.reset(1420,440)')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(src)
    print(f"[OK] Patched {path}")

print("[SUCCESS] Applied wide spacing and altar fix to both JS files!")
