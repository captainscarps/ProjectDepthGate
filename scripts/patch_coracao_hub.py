"""
Script para aplicar a reconstrução do Coração da Floresta circular no index.js
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [
    os.path.join(ROOT, 'assets', 'index-D6qIWtA7-p209.js'),
    os.path.join(ROOT, 'Projeto atualizado', 'assets', 'index-D6qIWtA7-p209.js')
]

# 1. Old and new coracao room definition
OLD_ROOM = '{id:"coracao",name:"Coração da Floresta",rect:{x:34,y:8,w:20,h:12},ambient:.52,hub:!0,banner:"CORAÇÃO DA FLORESTA",walls:[{x:38,y:11,w:2,h:2},{x:48,y:11,w:2,h:2}],enemies:[],decor:[{type:"sprite",tex:"fp-mega1",col:36,row:10,solid:!0,bw:60,bh:18},{type:"sprite",tex:"fp-mega2",col:51,row:10,solid:!0,bw:60,bh:18},{type:"sprite",tex:"fp-lumi1",col:35,row:17,solid:!0,light:"MAGIC_CRYSTAL"},{type:"sprite",tex:"fp-lumi3",col:52,row:17,solid:!0,light:"MAGIC_CRYSTAL"},{type:"sprite",tex:"fp-idol-human",col:42,row:9,solid:!0},{type:"sprite",tex:"fp-idol-dragon",col:46,row:9,solid:!0},{type:"sprite",tex:"fp-statue-oldman",col:44,row:10,solid:!0}]}'
NEW_ROOM = '{id:"coracao",name:"Coração da Floresta",rect:{x:33,y:1,w:30,h:19},ambient:.68,hub:!0,banner:"CORAÇÃO DA FLORESTA",walls:[{x:33,y:1,w:5,h:4},{x:57,y:1,w:6,h:4},{x:33,y:15,w:6,h:5},{x:56,y:15,w:7,h:5},{x:46,y:7,w:3,h:2}],enemies:[],decor:[]}'

# 2. Minimap room draw with hub circular ring
OLD_MM = 'e.fillStyle(u,.85).fillRect(n,s,r,l),e.lineStyle(1,h?9860140:3812376,1).strokeRect(n,s,r,l);const p={BOSS:10771168,ELITE:16747082,TREASURE:16765514,SHRINE:8376552,EVENT:13213951,CHALLENGE:14703178,SECRET:8382688,SHOP:13214282},v=a.boss?p.BOSS:p[a.type];__mmIcon(e,n+r/2,s+l/2,a.boss?"BOSS":a.final?"EXIT":a.type,this.scene.time.now)'
NEW_MM = 'e.fillStyle(u,.85).fillRect(n,s,r,l),e.lineStyle(1,h?9860140:3812376,1).strokeRect(n,s,r,l);if(a.hub){const mx=n+r/2,my=s+l/2;e.lineStyle(1,14402660,.75).strokeCircle(mx,my,Math.min(r,l)*.38);for(let k=0;k<10;k++){const ang=k*Math.PI*2/10-Math.PI/2,px=mx+Math.cos(ang)*(r*.36),py=my+Math.sin(ang)*(l*.36);e.fillStyle(16765514,1).fillRect(px-1,py-1,2,2)}}const p={BOSS:10771168,ELITE:16747082,TREASURE:16765514,SHRINE:8376552,EVENT:13213951,CHALLENGE:14703178,SECRET:8382688,SHOP:13214282},v=a.boss?p.BOSS:p[a.type];__mmIcon(e,n+r/2,s+l/2,a.hub?"SHRINE":a.boss?"BOSS":a.final?"EXIT":a.type,this.scene.time.now)'

# 3. New __hubPortals implementation
NEW_HUB_PORTALS = '''function __hubPortals(S){if(S.__hubPortals)return;const B=S.dungeon,R=B.level.rooms.find(r=>r.hub),q=R?.rect;if(!q)return;const P=[],done=__HUBD.filter(id=>__isPortalDone(S,id)),all=done.length>=__HUBD.length;done.forEach(id=>{const cid=__CRY[id];if(cid&&!__hasItem(S,cid)&&S.lootSystem?.makeItem){const it=S.lootSystem.makeItem(cid,"LEGENDARY");it&&S.inventory?.items?.push(it)}});S.anims.exists("hub-portal-a")||S.anims.create({key:"hub-portal-a",frames:S.anims.generateFrameNumbers("hub-portal",{start:0,end:13}),frameRate:10,repeat:-1});const CIRCLE_POS={glacial:{x:1514,y:72},vulcao:{x:1628,y:96},catacombs:{x:1400,y:96},morta:{x:1726,y:164},castle:{x:1302,y:164},rio:{x:1796,y:248},bosque:{x:1264,y:260},ruins:{x:1720,y:334},fortress:{x:1606,y:376},temple:{x:1450,y:380}};const mk=(id,big)=>{const pos=CIRCLE_POS[id]||{x:1514,y:238},x=pos.x,y=pos.y;const sp=S.add.sprite(x,y,"hub-portal",0).setOrigin(.5,1).setDepth(y).setScale(big?1.4:1.05);sp.play("hub-portal-a");const col=id==="castle"?16765514:__HUBC[id];sp.setBlendMode(j.BlendModes.ADD).setTint(col).setAlpha(.45);const gl=S.add.image(x,y-22,"light").setScale(big?.55:.38).setBlendMode(j.BlendModes.ADD).setTint(col).setAlpha(.5).setDepth(y-1);S.tweens.add({targets:gl,alpha:.25,scale:big?.65:.44,duration:1100,yoyo:!0,repeat:-1});S.lighting?.addLight?.({x,y:y-22,radius:big?130:90,flicker:.12,color:col});S.lighting?.addLight?.({x:x-18,y:y-10,radius:45,flicker:.18,color:16755268});S.lighting?.addLight?.({x:x+18,y:y-10,radius:45,flicker:.18,color:16755268});const ov=S.add.sprite(x,y,"hub-portal",0).setOrigin(.5,1).setDepth(y+.5).setScale(sp.scaleX).setBlendMode(j.BlendModes.ADD).setTint(col).setAlpha(0);S.tweens.add({targets:ov,alpha:.45,duration:1300,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"});sp.__ov=ov;sp.__level=id;sp.__glow=gl;return sp};S.lighting?.addLight?.({x:1514,y:215,radius:95,flicker:.08,color:4513279});const altGlow=S.add.image(1514,215,"light").setScale(.42).setBlendMode(j.BlendModes.ADD).setTint(4513279).setAlpha(.45).setDepth(214);S.tweens.add({targets:altGlow,alpha:.22,scale:.48,duration:1600,yoyo:!0,repeat:-1});S.lighting?.addLight?.({x:1484,y:230,radius:50,flicker:.18,color:16746547});S.lighting?.addLight?.({x:1544,y:230,radius:50,flicker:.18,color:16746547});const abg=S.add.rectangle(1514,256,128,12,0x0a0806,.75).setDepth(8999);S.add.text(1514,256,__T("✦ CORAÇÃO DA FLORESTA ✦"),{fontFamily:"'Courier New', monospace",fontSize:"7.5px",fontStyle:"bold",color:"#8ae0b0",stroke:"#0a0806",strokeThickness:2.5}).setOrigin(.5,.5).setDepth(9000);__HUBD.forEach(id=>{const p=mk(id,!1),nm=St(`lvl.${id}`,ki[id].name);p.__sealed=done.includes(id);S.add.rectangle(p.x,p.y+7,nm.length*5.2+8,11,0x0a0806,.7).setDepth(8999);S.add.text(p.x,p.y+7,nm.toUpperCase(),{fontFamily:"'Courier New', monospace",fontSize:"7px",fontStyle:"bold",color:p.__sealed?"#7a7268":"#f5e6c8",stroke:"#0a0806",strokeThickness:2.5}).setOrigin(.5,.5).setDepth(9000);if(p.__sealed){__sealFx(S,"seal-ward",p.x,p.y+4,.55,!0)?.setAlpha(.55);p.setTint(7829367).setAlpha(.15),p.__glow.setVisible(!1),p.__ov.setVisible(!1);S.add.text(p.x,p.y-40,__T("✦ SELADO ✦"),{fontFamily:"'Courier New', monospace",fontSize:"7px",fontStyle:"bold",color:"#c9a24a",stroke:"#000",strokeThickness:3}).setOrigin(.5).setDepth(9e3)}p.__label=()=>p.__sealed?__T("Portal selado (concluído)"):`${__L3("Entrar","Enter","Entrar")}: ${nm}`;P.push(p)});const cp=mk("castle",!0);cp.__locked=!all;all?cp.setTint(16771782):(cp.setTint(5592405).setAlpha(.15),cp.__glow.setVisible(!1),cp.__ov.setVisible(!1));S.add.rectangle(cp.x,cp.y+7,120,12,0x0a0806,.75).setDepth(8999);S.add.text(cp.x,cp.y+7,__T("CASTELO DE VALDRAK"),{fontFamily:"'Courier New', monospace",fontSize:"8px",fontStyle:"bold",color:all?"#ffd24a":"#7a7268",stroke:"#0a0806",strokeThickness:2.5}).setOrigin(.5,.5).setDepth(9000);__guardian(S);cp.__label=()=>cp.__locked?__L3(`Portal adormecido (${done.length}/${__HUBD.length} masmorras)`,`Dormant gate (${done.length}/${__HUBD.length} dungeons)`,`Portal dormido (${done.length}/${__HUBD.length} mazmorras)`):__T("Entrar: Castelo de Valdrak");P.push(cp);S.__hubPortals=P}'''

for path in TARGETS:
    with open(path, 'r', encoding='utf-8') as f:
        src = f.read()

    # Replace 1: Coracao room in Zo
    assert OLD_ROOM in src, f"OLD_ROOM not found in {path}"
    src = src.replace(OLD_ROOM, NEW_ROOM, 1)

    # Replace 2: Minimap hub ring
    assert OLD_MM in src, f"OLD_MM not found in {path}"
    src = src.replace(OLD_MM, NEW_MM, 1)

    # Replace 3: __hubPortals function
    start = src.find('function __hubPortals(S){')
    end = src.find('P.push(cp);S.__hubPortals=P}', start) + len('P.push(cp);S.__hubPortals=P}')
    assert start != -1 and end != -1, f"__hubPortals not found in {path}"
    src = src[:start] + NEW_HUB_PORTALS + src[end:]

    # Replace 4: Player respawn on retreat / hub return
    src = src.replace('q&&S.player.body.reset((q.x+q.w/2)*dt,(q.y+q.h-2)*dt)', 'q&&S.player.body.reset(1514,290)')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(src)
    print(f"[OK] Patched {path}")

print("[SUCCESS] All files updated with circular Coração da Floresta sanctuary!")
