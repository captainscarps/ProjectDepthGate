"""
Integra o Bosque Amaldiçoado na fase das Ruínas (gerado por build_ruins_forest.py):
  - mapa das ruínas cresce para 80 linhas; o herói começa na Trilha Amaldiçoada e chega às Ruínas pelo portão
  - salas, corredores e porta novas; início movido para a floresta
  - inimigos novos: Muda Amaldiçoada, Árvore Amaldiçoada e Ancião Corrompido (Ents)
  - chão assado da floresta + árvores com profundidade + névoa arroxeada
Re-executável.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
LV = json.load(open(os.path.join(ROOT, "scripts", "ruins_forest_level.json"), encoding="utf-8"))
SH = json.load(open(os.path.join(ROOT, "scripts", "ruins_forest_sheets.json")))
META = json.load(open(os.path.join(ROOT, "assets", "pixel-art", "ruins-forest", "rfb-meta.json")))
T = "/*__RF__*/"


import base64


def strip_all():
    """desfaz blocos anteriores: cada um guarda o texto original em base64 no comentário final"""
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
put("al={cols:60,rows:50}", "al={cols:60,rows:80}")
put('ruins:{id:"ruins",name:"Ruínas Antigas",theme:Kn,world:al,rooms:_e("ruins",nl),corridors:rl,doors:ol,playerSpawn:ll,next:null}',
    'ruins:{id:"ruins",name:"Ruínas Antigas",theme:Kn,world:al,rooms:[..._e("ruins",nl),' + rooms_js + '],corridors:[...rl,' + corr_js + '],doors:[...ol,' + door_js + '],playerSpawn:' + json.dumps(LV["spawn"]) + ',next:null}')

# ── inimigos ──
ENTS = ('CURSED_SAPLING:{name:"Muda Amaldiçoada",texture:"mk3e-cursed-ent2",sizeClass:"small",bodySize:16,speed:92,maxHp:5,damage:1,hitFlashMs:120,behavior:"chase",'
        'ai:{detectionRange:240,loseTargetRange:360,attackRange:38,attacks:[{type:"MELEE_SLASH",damage:2,range:36,width:30,telegraphMs:380,recoverMs:420,cooldownMs:1500,sound:"sfx-orc-attack"}]},'
        'xp:40,gold:{min:3,max:7,chance:.6},loot:{chance:.3,pools:["staff","ring","potion","boots"],rarities:{COMMON:55,UNCOMMON:33,RARE:11,EPIC:1}},anims:At},'
        'CURSED_ENT:{name:"Árvore Amaldiçoada",texture:"mk3e-cursed-ent1",sizeClass:"medium",bodySize:22,speed:54,maxHp:13,damage:2,hitFlashMs:120,behavior:"chase",knockbackResist:.7,'
        'ai:{detectionRange:220,loseTargetRange:340,attackRange:56,attacks:[{type:"HEAVY_SMASH",damage:3,radius:50,maxRange:58,telegraphMs:720,recoverMs:760,cooldownMs:2800,sound:"sfx-heavy-smash"}]},'
        'xp:110,gold:{min:8,max:15,chance:.75},loot:{chance:.5,pools:["staff","great_sword","armor","helmet","potion"],rarities:{COMMON:26,UNCOMMON:42,RARE:24,EPIC:7,LEGENDARY:1}},anims:At},'
        'CURSED_ELDER:{name:"Ancião Corrompido",texture:"mk3e-cursed-ent3",sizeClass:"large",bodySize:24,speed:46,maxHp:24,damage:2,hitFlashMs:120,behavior:"chase",knockbackResist:.85,'
        'ai:{detectionRange:240,loseTargetRange:360,attackRange:64,attacks:[{type:"HEAVY_SMASH",damage:4,radius:62,maxRange:66,telegraphMs:820,recoverMs:820,cooldownMs:3200,sound:"sfx-heavy-smash"},'
        '{type:"MELEE_SLASH",damage:3,range:48,width:44,telegraphMs:480,recoverMs:520,cooldownMs:1900,sound:"sfx-orc-attack"}]},'
        'xp:220,gold:{min:16,max:28,chance:.9},loot:{chance:.8,pools:["staff","great_sword","armor","helmet","amulet","ring"],rarities:{COMMON:10,UNCOMMON:36,RARE:36,EPIC:15,LEGENDARY:3}},anims:At},')
put("ee={SHADOW_DEMON_1:{", "ee={" + ENTS + "SHADOW_DEMON_1:{")
put('Si={"mk3e-skeleton":.643,', 'Si={"mk3e-cursed-ent1":.8,"mk3e-cursed-ent2":.82,"mk3e-cursed-ent3":.64,"mk3e-skeleton":.643,')
load = "".join(f'["mk3e-{k}","{k}.png",{w},{h}],' for k, (w, h) in SH.items())
put('["mk3e-orc-brute","golem-rock-v2.png",57,59],', load + '["mk3e-orc-brute","golem-rock-v2.png",57,59],')

# ── carregamento da arte da floresta ──
chunks = [c[0] for c in META["chunks"]]
put('this.load.json("cab-meta","assets/pixel-art/castle/cab-meta.json");',
    'this.load.json("cab-meta","assets/pixel-art/castle/cab-meta.json");for(const f of ' + json.dumps(chunks) + ')this.load.image(f,`assets/pixel-art/ruins-forest/${f}.png`);'
    'this.load.json("rfb-meta","assets/pixel-art/ruins-forest/rfb-meta.json");this.load.atlas("rf-props","assets/pixel-art/ruins-forest/rf-props.png","assets/pixel-art/ruins-forest/rf-props.json");')

# ── desenho: chão assado, árvores, névoa; paredes de pedra só na parte das ruínas ──
FN = (r'function __rfBake(B){if(B.level?.id!=="ruins")return;const d=B.scene,M=d.cache.json.get("rfb-meta");if(!M||!d.textures.exists(M.chunks[0][0]))return;B.__rfRow=M.row0;'
      r'for(const[k,x,y]of M.chunks)d.add.image(x,y,k).setOrigin(0).setDepth(.3);'
      r'if(d.textures.exists("rf-props"))for(const[k,x,y]of M.props)d.add.image(x,y,"rf-props",k).setOrigin(.5,1).setDepth(y);'
      r'const ADD=j.BlendModes.ADD,R=Math.random;for(const[x,y]of M.fog){const f=d.add.image(x,y,"light").setScale(.5+R()*.5).setTint(R()<.5?3809608:2829104).setAlpha(.16+R()*.1).setDepth(y+40);d.tweens.add({targets:f,x:x+(R()-.5)*60,y:y+(R()-.5)*30,alpha:.06,duration:4e3+R()*4e3,yoyo:!0,repeat:-1,ease:"Sine.easeInOut"})}'
      r'for(const[x,y]of M.pond){if(R()<.35){const g=d.add.image(x,y,"light").setScale(.25).setBlendMode(ADD).setTint(7864524).setAlpha(.12).setDepth(.5);d.tweens.add({targets:g,alpha:.03,duration:1500+R()*1500,yoyo:!0,repeat:-1})}}'
      r'const sp=()=>{if(!d.sys?.isActive?.())return;const p=d.player;if(p&&p.y>B.__rfRow*dt){const c=d.add.rectangle(p.x+(R()-.5)*300,p.y+(R()-.5)*200,2,2,R()<.5?12224762:9502463).setBlendMode(ADD).setAlpha(0).setDepth(9e3);d.tweens.add({targets:c,alpha:.8,y:c.y-20-R()*20,x:c.x+(R()-.5)*30,duration:1400,yoyo:!0,onComplete:()=>c.destroy()})}d.time.delayedCall(260,sp)};d.time.delayedCall(500,sp);'
      r'const SH=new Set((M.shallow||[]).map(([x,y])=>x+","+y));let lx=0,ly=0;SH.size&&d.time.addEvent({delay:170,loop:!0,callback:()=>{const p=d.player;if(!p||!p.active)return;const k=Math.floor(p.x/dt)+","+Math.floor(p.y/dt);const mv=Math.hypot(p.x-lx,p.y-ly)>2;lx=p.x;ly=p.y;if(!SH.has(k))return;const e=d.add.ellipse(p.x,p.y+10,10,4).setStrokeStyle(1,12437215,.8).setFillStyle().setDepth(p.y-1);d.tweens.add({targets:e,scaleX:mv?2.6:1.8,scaleY:mv?2.6:1.8,alpha:0,duration:mv?520:900,onComplete:()=>e.destroy()});mv&&Math.random()<.5&&d.effectsRef?.burstTinted(p.x,p.y+8,10403034,2)}})}')
put("class _l{constructor(i,t){", FN + "class _l{constructor(i,t){")
put('buildWallVisuals(){const i=this.level.theme.id,d=this.scene;', 'buildWallVisuals(){const i=this.level.theme.id,d=this.scene;__rfBake(this);')
put('for(let a=0;a<this.rows;a++)for(let n=0;n<this.cols;n++){if(!this.isWallTile(n,a))continue;const s=o(n,a-1)',
    'for(let a=0;a<this.rows;a++)for(let n=0;n<this.cols;n++){if(!this.isWallTile(n,a)||this.__rfRow!=null&&a>=this.__rfRow)continue;const s=o(n,a-1)')

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("Bosque Amaldiçoado integrado às Ruínas")
