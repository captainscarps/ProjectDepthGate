"""
Integra a Floresta Nevada na fase da Cidadela Glacial (gerada por build_glacial_snow.py):
  - mapa da Cidadela cresce para 80 linhas; o herói começa na Trilha Nevada e chega ao Portão Congelado pela porta
  - 4 salas novas com poucos inimigos da própria Cidadela (goblins, esqueleto de gelo, urso glacial)
  - chão de neve assado + árvores/pedras com profundidade + lampiões, neblina fria e neve caindo
  - pegadas na neve (sempre por baixo do personagem), poeira de neve nos pés e som de passo na neve
Re-executável (blocos com marcador e texto original em base64).
"""
import base64
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
LV = json.load(open(os.path.join(ROOT, "scripts", "glacial_snow_level.json"), encoding="utf-8"))
META = json.load(open(os.path.join(ROOT, "assets", "pixel-art", "glacial-snow", "gsb-meta.json")))
T = "/*__GS__*/"


def strip_all():
    global s
    while T in s:
        a = s.index(T)
        b = s.index(T, a + 1)
        inner = s[a + len(T):b]
        k = inner.rindex("/*§")
        orig = base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8")
        s = s[:a] + orig + s[b + len(T):]


strip_all()


def put(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T, 1)


# ── nível ──
rooms_js = ",".join(json.dumps(r, ensure_ascii=False, separators=(",", ":")) for r in LV["rooms"])
corr_js = ",".join(json.dumps(c, separators=(",", ":")) for c in LV["corridors"])
door_js = json.dumps(LV["door"], separators=(",", ":"))
put("hl={cols:60,rows:50}", "hl={cols:60,rows:80}")
put('glacial:{id:"glacial",name:"Cidadela Glacial",theme:Qn,world:hl,rooms:_e("glacial",dl),corridors:ul,doors:fl,playerSpawn:cl,next:null}',
    'glacial:{id:"glacial",name:"Cidadela Glacial",theme:Qn,world:hl,rooms:[..._e("glacial",dl),' + rooms_js + '],corridors:[...ul,' + corr_js +
    '],doors:[...fl,' + door_js + '],playerSpawn:' + json.dumps(LV["spawn"]) + ',next:null}')

# ── carregamento ──
chunks = [c[0] for c in META["chunks"]]
put('this.load.spritesheet("hub-portal","assets/pixel-art/hub/hub-portal2.png",{frameWidth:56,frameHeight:65});',
    'this.load.spritesheet("hub-portal","assets/pixel-art/hub/hub-portal2.png",{frameWidth:56,frameHeight:65});for(const f of ' + json.dumps(chunks) +
    ')this.load.image(f,`assets/pixel-art/glacial-snow/${f}.png`);this.load.json("gsb-meta","assets/pixel-art/glacial-snow/gsb-meta.json");this.load.image("gsb-drift","assets/pixel-art/glacial-snow/gsb-drift.png");this.load.image("gsb-gate","assets/pixel-art/glacial-snow/gsb-gate.png");this.load.image("gsb-ext","assets/pixel-art/glacial-snow/gsb-ext.png");'
    'this.load.atlas("gs-props","assets/pixel-art/glacial-snow/gs-props.png","assets/pixel-art/glacial-snow/gs-props.json");')

# ── desenho + efeitos ──
FN = (r'function __gsBake(B){if(B.level?.id!=="glacial")return;const d=B.scene,M=d.cache.json.get("gsb-meta");if(!M||!d.textures.exists(M.chunks[0][0]))return;B.__rfRow=M.row0;const R=Math.random,ADD=j.BlendModes.ADD,ROW=M.row0*dt;'
      r'for(const[k,x,y]of M.chunks)d.add.image(x,y,k).setOrigin(0).setDepth(.3);M.gate&&d.textures.exists("gsb-gate")&&d.add.image(M.gate[0],M.gate[1],"gsb-gate").setOrigin(0).setDepth(.35);M.ext&&d.textures.exists("gsb-ext")&&d.add.image(M.ext[0],M.ext[1],"gsb-ext").setOrigin(0).setDepth(-5);M.drift&&d.textures.exists("gsb-drift")&&d.add.image(M.drift[0],M.drift[1],"gsb-drift").setOrigin(0).setDepth(ROW-40);'
      r'if(d.textures.exists("gs-props"))for(const[k,x,y]of M.props)d.add.image(x,y,"gs-props",k).setOrigin(.5,1).setDepth(y);'
      # lampiões: luz quente que tremula
      r'for(const[x,y]of M.lamps||[]){const g=d.add.image(x,y,"light").setScale(.62).setBlendMode(ADD).setTint(16758116).setAlpha(.5).setDepth(9001);d.tweens.add({targets:g,alpha:.36,scale:.58,duration:180+R()*160,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"})}'
      # neblina fria entre as árvores
      r'for(const[x,y]of M.mist||[]){const f=d.add.image(x,y,"light").setScale(.6+R()*.5).setTint(R()<.5?15069183:13421823).setAlpha(.1+R()*.08).setDepth(y+40);d.tweens.add({targets:f,x:x+(R()-.5)*70,y:y+(R()-.5)*30,alpha:.04,duration:5e3+R()*4e3,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"})}'
      # textura da pegada (bota: ponta + calcanhar, sombra azulada com borda clara)
      r'if(!d.textures.exists("gs-print")){const g=d.make.graphics({x:0,y:0,add:!1});g.fillStyle(8360376,1).fillEllipse(5,4.5,7,8).fillEllipse(5,12,6,5);g.fillStyle(10598358,1).fillEllipse(5,5.2,5,6).fillEllipse(5,12.4,4.2,3.4);g.fillStyle(15925247,.9).fillEllipse(5,1.2,6,1.6);g.generateTexture("gs-print",10,15);g.destroy()}'
      r'const ICE=new Set((M.ice||[]).map(([x,y])=>x+","+y)),fb=o=>o.body?o.body.bottom:o.y+12,ST=new WeakMap,PR=[];'
      r'const step=(o,isP)=>{const fy=fb(o);let s=ST.get(o);if(!s){ST.set(o,{x:o.x,y:fy,a:0,side:1,n:0});return}const dx=o.x-s.x,dy=fy-s.y,m=Math.hypot(dx,dy);s.x=o.x;s.y=fy;if(m>26||m<.05)return;'
      r'if(fy<ROW+4||ICE.has(Math.floor(o.x/dt)+","+Math.floor((fy-3)/dt))){s.a=0;return}s.a+=m;if(s.a<(isP?11:13))return;s.a=0;s.side=-s.side;'
      r'const an=Math.atan2(dy,dx),nx=-Math.sin(an),ny=Math.cos(an),px=o.x+nx*3.2*s.side,py=fy-2+ny*1.6*s.side,sc=isP?.9:.78;'
      r'const im=d.add.image(px,py,"gs-print").setRotation(an+Math.PI/2).setDepth(.6).setScale(sc).setAlpha(isP?.78:.6);PR.push(im);d.tweens.add({targets:im,alpha:0,delay:isP?6e3:3500,duration:5e3,onComplete:()=>im.destroy()});if(PR.length>170){const q=PR.shift();q.active&&q.destroy()}'
      # poeira de neve chutada pelos pés — sempre atrás do personagem (profundidade menor)
      r'const dp=(o.depth??py)-2;for(let k=0;k<(isP?3:2);k++){const c=d.add.rectangle(px-dx*.4,py,R()<.5?2:1.5,R()<.5?2:1.5,R()<.3?14018815:16777215).setDepth(dp).setAlpha(.9);d.tweens.add({targets:c,x:c.x-Math.cos(an)*(4+R()*6)+(R()-.5)*6,y:c.y-3-R()*5,alpha:0,duration:300+R()*200,ease:"Quad.easeOut",onComplete:()=>c.destroy()})}'
      r'if(isP&&(s.n=(s.n+1)%2)===0)d.game.audioEngine?.sfx?.("sfx-snow-step")};'
      r'const fn=()=>{const p=d.player;if(!p||!p.active||!d.sys.isActive())return;p.dead||step(p,!0);const P2=d.player2;P2&&P2.active&&!P2.dead&&step(P2,!0);for(const e of d.enemies?.getChildren?.()||[])e.active&&!e.dead&&Math.abs(e.y-p.y)<400&&step(e,!1)};'
      r'd.events.on("update",fn);d.events.once("shutdown",()=>d.events.off("update",fn));'
      # neve caindo (clima) — só na floresta
      r'const fl=()=>{if(!d.sys?.isActive?.())return;const p=d.player,V=d.cameras.main.worldView;if(p&&p.y>ROW-160){for(let k=0;k<2;k++){const x=V.x+R()*V.width,y=V.y-6,r=R()<.7?.8:1.3,c=d.add.circle(x,y,r,16777215).setAlpha(.55+R()*.4).setDepth(9e3),dur=3500+R()*3e3;d.tweens.add({targets:c,y:y+V.height+20,x:x+(R()-.5)*90-20,duration:dur,ease:"Linear",onComplete:()=>c.destroy()})}}d.time.delayedCall(90,fl)};d.time.delayedCall(200,fl)}')
# a floresta nevada fica fora dos desafios aleatórios (emboscadas/ondas): poucos inimigos, como pedido
put('special=r=>r.boss||r.final||r.crystal||r.hub||r.secret||', 'special=r=>r.boss||r.final||r.crystal||r.hub||r.secret||/^gs-/.test(r.id)||')
put('function __ekBake(B){', FN + 'function __ekBake(B){')
put('if(__EK2[i]&&__ekBake(this))return;', '__gsBake(this);if(__EK2[i]&&__ekBake(this))return;')

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("Floresta Nevada integrada à Cidadela Glacial")
