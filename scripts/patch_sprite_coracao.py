"""
Aplica a construção do Coração da Floresta circular puramente usando os sprites do jogo.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [
    os.path.join(ROOT, 'assets', 'index-D6qIWtA7-p209.js'),
    os.path.join(ROOT, 'Projeto atualizado', 'assets', 'index-D6qIWtA7-p209.js')
]

# 1. Room definition in Zo:
# Keep room rect {x:34,y:8,w:20,h:12}, set ambient to .62, solid wall at altar (col 43..44, row 13), decor empty (sprites created in __hubPortals)
OLD_ROOM_PATTERNS = [
    '{id:"coracao",name:"Coração da Floresta",rect:{x:33,y:1,w:30,h:19},ambient:.68,hub:!0,banner:"CORAÇÃO DA FLORESTA",walls:[{x:33,y:1,w:5,h:4},{x:57,y:1,w:6,h:4},{x:33,y:15,w:6,h:5},{x:56,y:15,w:7,h:5},{x:46,y:7,w:3,h:2}],enemies:[],decor:[]}',
    '{id:"coracao",name:"Coração da Floresta",rect:{x:34,y:8,w:20,h:12},ambient:.52,hub:!0,banner:"CORAÇÃO DA FLORESTA",walls:[{x:38,y:11,w:2,h:2},{x:48,y:11,w:2,h:2}],enemies:[],decor:[{type:"sprite",tex:"fp-mega1",col:36,row:10,solid:!0,bw:60,bh:18},{type:"sprite",tex:"fp-mega2",col:51,row:10,solid:!0,bw:60,bh:18},{type:"sprite",tex:"fp-lumi1",col:35,row:17,solid:!0,light:"MAGIC_CRYSTAL"},{type:"sprite",tex:"fp-lumi3",col:52,row:17,solid:!0,light:"MAGIC_CRYSTAL"},{type:"sprite",tex:"fp-idol-human",col:42,row:9,solid:!0},{type:"sprite",tex:"fp-idol-dragon",col:46,row:9,solid:!0},{type:"sprite",tex:"fp-statue-oldman",col:44,row:10,solid:!0}]}'
]
NEW_ROOM = '{id:"coracao",name:"Coração da Floresta",rect:{x:34,y:8,w:20,h:12},ambient:.62,hub:!0,banner:"CORAÇÃO DA FLORESTA",walls:[{x:43,y:13,w:2,h:1}],enemies:[],decor:[]}'

# 2. Pure sprite-based __hubPortals implementation
NEW_HUB_PORTALS = '''function __hubPortals(S){if(S.__hubPortals)return;const B=S.dungeon,R=B.level.rooms.find(r=>r.hub),q=R?.rect;if(!q)return;const P=[],done=__HUBD.filter(id=>__isPortalDone(S,id)),all=done.length>=__HUBD.length;done.forEach(id=>{const cid=__CRY[id];if(cid&&!__hasItem(S,cid)&&S.lootSystem?.makeItem){const it=S.lootSystem.makeItem(cid,"LEGENDARY");it&&S.inventory?.items?.push(it)}});S.anims.exists("hub-portal-a")||S.anims.create({key:"hub-portal-a",frames:S.anims.generateFrameNumbers("hub-portal",{start:0,end:13}),frameRate:10,repeat:-1});const cx=1408,cy=440,rx=215,ry=125;const PORTALS_CFG=[["glacial",-90],["vulcao",-48],["morta",-12],["rio",24],["ruins",60],["fortress",80],["temple",100],["bosque",120],["castle",160],["catacombs",-132]];const pavG=S.add.graphics().setDepth(.2);pavG.lineStyle(4,11838860,.45);pavG.strokeEllipse(cx,cy,rx,ry);pavG.lineStyle(2,10523000,.35);pavG.strokeEllipse(cx,cy,rx*.7,ry*.7);pavG.lineStyle(3,12496770,.45);pavG.strokeEllipse(cx,cy,rx*.4,ry*.4);pavG.lineStyle(1.5,10523000,.25);for(const[pid,deg]of PORTALS_CFG){const rad=deg*Math.PI/180,px=cx+Math.round(rx*Math.cos(rad)),py=cy+Math.round(ry*Math.sin(rad));pavG.lineBetween(cx,cy,px,py);pavG.fillStyle(13938506,.6).fillCircle(px,py,2.5)}const altSpr=S.add.sprite(cx,cy-10,"shrine").setOrigin(.5,1).setDepth(cy).setScale(1.15);S.lighting?.addLight?.({x:cx,y:cy-45,radius:100,flicker:.08,color:4513279});const altGl=S.add.image(cx,cy-45,"light").setScale(.5).setBlendMode(j.BlendModes.ADD).setTint(4513279).setAlpha(.5).setDepth(cy-1);S.tweens.add({targets:altGl,alpha:.25,scale:.58,duration:1800,yoyo:!0,repeat:-1});const bL=S.add.sprite(cx-36,cy,"brazier").setOrigin(.5,1).setDepth(cy);const bR=S.add.sprite(cx+36,cy,"brazier").setOrigin(.5,1).setDepth(cy);S.lighting?.addLight?.({x:cx-36,y:cy-24,radius:60,flicker:.18,color:16746547});S.lighting?.addLight?.({x:cx+36,y:cy-24,radius:60,flicker:.18,color:16746547});S.add.rectangle(cx,cy+8,136,13,0x0a0806,.78).setDepth(8999);S.add.text(cx,cy+8,__T("✦ CORAÇÃO DA FLORESTA ✦"),{fontFamily:"'Courier New', monospace",fontSize:"7.5px",fontStyle:"bold",color:"#8ae0b0",stroke:"#0a0806",strokeThickness:2.5}).setOrigin(.5,.5).setDepth(9000);const mk=(id,deg,big)=>{const rad=deg*Math.PI/180,x=cx+Math.round(rx*Math.cos(rad)),y=cy+Math.round(ry*Math.sin(rad));S.add.image(x-22,y,"torch-base").setOrigin(.5,1).setDepth(y-.1);S.add.image(x+22,y,"torch-base").setOrigin(.5,1).setDepth(y-.1);S.lighting?.addLight?.({x:x-22,y:y-36,radius:45,flicker:.2,color:16755268});S.lighting?.addLight?.({x:x+22,y:y-36,radius:45,flicker:.2,color:16755268});const fL=S.add.image(x-22,y-36,"light").setScale(.12).setBlendMode(j.BlendModes.ADD).setTint(16755268).setAlpha(.4).setDepth(y);const fR=S.add.image(x+22,y-36,"light").setScale(.12).setBlendMode(j.BlendModes.ADD).setTint(16755268).setAlpha(.4).setDepth(y);S.tweens.add({targets:[fL,fR],alpha:.2,duration:250+Math.random()*150,yoyo:!0,repeat:-1});const sp=S.add.sprite(x,y,"hub-portal",0).setOrigin(.5,1).setDepth(y).setScale(big?1.35:1);sp.play("hub-portal-a");const col=id==="castle"?16765514:__HUBC[id];sp.setTint(col);const gl=S.add.image(x,y-10,"light").setScale(big?.5:.32).setBlendMode(j.BlendModes.ADD).setTint(col).setAlpha(.45).setDepth(y-1);S.tweens.add({targets:gl,alpha:.22,duration:1100,yoyo:!0,repeat:-1});S.lighting?.addLight?.({x,y:y-24,radius:big?110:75,flicker:.12,color:col});const ov=S.add.sprite(x,y,"hub-portal",0).setOrigin(.5,1).setDepth(y+.5).setScale(sp.scaleX).setBlendMode(j.BlendModes.ADD).setTint(col).setAlpha(.35);S.tweens.add({targets:ov,alpha:.65,duration:1200,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"});sp.__ov=ov;sp.__level=id;sp.__glow=gl;return sp};__HUBD.forEach(id=>{const cfg=PORTALS_CFG.find(c=>c[0]===id),deg=cfg?cfg[1]:0,p=mk(id,deg,!1),nm=St(`lvl.${id}`,ki[id].name);p.__sealed=done.includes(id);S.add.rectangle(p.x,p.y+7,nm.length*5.2+10,12,0x0a0806,.75).setDepth(8999);S.add.text(p.x,p.y+7,nm.toUpperCase(),{fontFamily:"'Courier New', monospace",fontSize:"7.5px",fontStyle:"bold",color:p.__sealed?"#7a7268":"#f5e6c8",stroke:"#0a0806",strokeThickness:2.5}).setOrigin(.5,.5).setDepth(9000);if(p.__sealed){__sealFx(S,"seal-ward",p.x,p.y+4,.55,!0)?.setAlpha(.55);p.setTint(7829367).setAlpha(.4),p.__glow.setVisible(!1),p.__ov.setVisible(!1);S.add.text(p.x,p.y-42,__T("✦ SELADO ✦"),{fontFamily:"'Courier New', monospace",fontSize:"7px",fontStyle:"bold",color:"#c9a24a",stroke:"#000",strokeThickness:3}).setOrigin(.5).setDepth(9e3)}p.__label=()=>p.__sealed?__T("Portal selado (concluído)"):`${__L3("Entrar","Enter","Entrar")}: ${nm}`;P.push(p)});const cCfg=PORTALS_CFG.find(c=>c[0]==="castle"),cp=mk("castle",cCfg?cCfg[1]:160,!0);cp.__locked=!all;all?cp.setTint(16771782):(cp.setTint(5592405).setAlpha(.5),cp.__glow.setVisible(!1),cp.__ov.setVisible(!1));S.add.rectangle(cp.x,cp.y+7,120,12,0x0a0806,.75).setDepth(8999);S.add.text(cp.x,cp.y+7,__T("CASTELO DE VALDRAK"),{fontFamily:"'Courier New', monospace",fontSize:"8px",fontStyle:"bold",color:all?"#ffd24a":"#7a7268",stroke:"#0a0806",strokeThickness:2.5}).setOrigin(.5,.5).setDepth(9000);__guardian(S);cp.__label=()=>cp.__locked?__L3(`Portal adormecido (${done.length}/${__HUBD.length} masmorras)`,`Dormant gate (${done.length}/${__HUBD.length} dungeons)`,`Portal dormido (${done.length}/${__HUBD.length} mazmorras)`):__T("Entrar: Castelo de Valdrak");P.push(cp);S.__hubPortals=P}'''

for path in TARGETS:
    with open(path, 'r', encoding='utf-8') as f:
        src = f.read()

    # 1. Replace room definition
    replaced_room = False
    for old_pat in OLD_ROOM_PATTERNS:
        if old_pat in src:
            src = src.replace(old_pat, NEW_ROOM, 1)
            replaced_room = True
            break
    assert replaced_room, f"Room pattern not found in {path}"

    # 2. Replace __hubPortals function
    start = src.find('function __hubPortals(S){')
    end = src.find('P.push(cp);S.__hubPortals=P}', start) + len('P.push(cp);S.__hubPortals=P}')
    assert start != -1 and end != -1, f"__hubPortals not found in {path}"
    src = src[:start] + NEW_HUB_PORTALS + src[end:]

    # 3. Player respawn on retreat / hub return
    src = src.replace('q&&S.player.body.reset(1514,290)', 'q&&S.player.body.reset(1408,510)')
    src = src.replace('q&&S.player.body.reset((q.x+q.w/2)*dt,(q.y+q.h-2)*dt)', 'q&&S.player.body.reset(1408,510)')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(src)
    print(f"[OK] Patched {path} with pure sprite-based sanctuary!")

print("[SUCCESS] All files updated with sprite-based Coração da Floresta!")
