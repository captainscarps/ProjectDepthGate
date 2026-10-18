"""
Catacumbas maiores: 4 salas novas, armadilhas, alavancas e um interruptor secreto que abrem portas,
e a porta do chefe só abre depois de vasculhar todas as salas.

  Ossuário (oeste da Entrada)          — ossadas, espinhos; ALAVANCA abre a Cripta Selada
  Galeria das Armadilhas (leste)       — dardos, fogo e espinhos; INTERRUPTOR SECRETO abre a Capela
  Cripta Selada (noroeste, via Câmara das Ruínas)    — porta presa por mecanismo; tesouro
  Capela Esquecida (nordeste, via Santuário Sombrio) — porta presa por mecanismo; tesouro épico
  Porta do Trono — só abre com todas as salas vasculhadas (contador na porta)

Também: curva de experiência mais lenta (o herói subia de nível fácil demais).
Re-executável.
"""
import base64
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__CATX__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    inner = s[a + len(T):b]
    k = inner.rindex("/*§")
    s = s[:a] + base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") + s[b + len(T):]


def put(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T, 1)


J = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))
E = lambda t, c, r: {"type": t, "col": c, "row": r}
D = lambda t, c, r, **k: {"type": t, "col": c, "row": r, **k}

ROOMS = [
    {"id": "ossuario", "name": "Ossuário", "rect": {"x": 6, "y": 40, "w": 14, "h": 8}, "ambient": .72,
     "walls": [{"x": 10, "y": 42, "w": 1, "h": 2}, {"x": 15, "y": 44, "w": 1, "h": 2}],
     "enemies": [E("SKELETON", 8, 42), E("SKELETON_ARCHER", 17, 41), E("SKELETON_WARRIOR", 13, 46), E("GHOST", 18, 45)],
     "decor": [D("torch", 9, 39), D("torch", 16, 39), D("lever", 7, 46, id="ossuario", solid=True),
               D("trap-spikes", 12, 43), D("trap-spikes", 12, 44), D("trap-spikes", 13, 43), D("trap-spikes", 17, 43),
               D("coffin", 7, 41, solid=True), D("coffin-open", 18, 46, solid=True), D("bones", 11, 46), D("skull", 14, 41),
               D("bones", 16, 42), D("candle", 9, 45), D("candle", 14, 45), D("web", 6, 40), D("web", 19, 40)]},
    {"id": "galeria", "name": "Galeria das Armadilhas", "rect": {"x": 42, "y": 40, "w": 14, "h": 8}, "ambient": .7,
     "walls": [{"x": 46, "y": 42, "w": 1, "h": 1}, {"x": 51, "y": 42, "w": 1, "h": 1}, {"x": 46, "y": 45, "w": 1, "h": 1}, {"x": 51, "y": 45, "w": 1, "h": 1}],
     "enemies": [E("SKELETON_WARRIOR", 53, 42), E("GHOST", 48, 46), E("GHOST", 54, 46)],
     "decor": [D("torch", 45, 39), D("torch", 52, 39), D("trap-dart", 44, 41), D("trap-dart", 49, 44), D("trap-fire", 48, 41),
               D("trap-fire", 53, 44), D("trap-spikes", 44, 44), D("trap-spikes", 45, 44), D("trap-spikes", 50, 46),
               D("statue", 55, 41, solid=True), D("lever", 55, 46, id="galeria-oculta", hidden=True, solid=True),
               D("statue", 43, 46, solid=True), D("skull", 47, 43), D("bones", 52, 47), D("candle", 49, 40)]},
    {"id": "cripta", "name": "Cripta Selada", "rect": {"x": 3, "y": 3, "w": 15, "h": 10}, "ambient": .68,
     "walls": [{"x": 7, "y": 6, "w": 2, "h": 2}, {"x": 13, "y": 6, "w": 2, "h": 2}],
     "enemies": [E("GHOST", 5, 5), E("GHOST", 16, 5), E("SKELETON_MAGE", 10, 4), E("SKELETON_WARRIOR", 10, 10)],
     "decor": [D("torch", 6, 2), D("torch", 14, 2), D("sarcophagus", 10, 6, solid=True), D("coffin", 4, 9, solid=True),
               D("coffin", 16, 9, solid=True), D("chest", 10, 8, solid=True, tier="RARE"), D("trap-spikes", 9, 10),
               D("trap-spikes", 11, 10), D("candle", 5, 11), D("candle", 15, 11), D("chains", 4, 2), D("skull", 12, 11), D("bones", 6, 8)]},
    {"id": "capela", "name": "Capela Esquecida", "rect": {"x": 45, "y": 3, "w": 13, "h": 10}, "ambient": .72,
     "walls": [{"x": 48, "y": 6, "w": 1, "h": 3}, {"x": 54, "y": 6, "w": 1, "h": 3}],
     "enemies": [E("DEMON", 51, 5), E("SKELETON_MAGE", 47, 10), E("GHOST", 56, 10)],
     "decor": [D("torch", 48, 2), D("torch", 54, 2), D("altar", 51, 4, solid=True), D("chest", 51, 7, solid=True, tier="EPIC"),
               D("trap-fire", 50, 9), D("trap-fire", 52, 9), D("candle", 49, 4), D("candle", 53, 4), D("banner", 51, 2),
               D("statue", 46, 4, solid=True), D("statue", 56, 4, solid=True), D("skull", 55, 11)]},
]
CORR = [{"x": 20, "y": 43, "w": 7, "h": 2}, {"x": 36, "y": 43, "w": 6, "h": 2},
        {"x": 5, "y": 13, "w": 2, "h": 15}, {"x": 55, "y": 13, "w": 2, "h": 15}]
DOORS = [{"id": "porta-ossuario", "orientation": "v", "col": 23, "row": 43, "rooms": ["entrada", "ossuario"]},
         {"id": "porta-galeria", "orientation": "v", "col": 38, "row": 43, "rooms": ["entrada", "galeria"]},
         {"id": "porta-cripta-selada", "orientation": "h", "col": 5, "row": 20, "rooms": ["ruinas", "cripta"],
          "cdSeal": "gate", "gate": "lever:ossuario", "gateRoom": "cripta"},
         {"id": "porta-capela", "orientation": "h", "col": 55, "row": 20, "rooms": ["santuario", "capela"],
          "cdSeal": "gate", "gate": "lever:galeria-oculta", "gateRoom": "capela"}]

put('catacombs:{id:"catacombs",name:"Catacumbas",theme:Xn,world:_o,rooms:_e("catacombs",tl),corridors:el,doors:il,playerSpawn:sl,next:null}',
    'catacombs:{id:"catacombs",name:"Catacumbas",theme:Xn,world:_o,rooms:[..._e("catacombs",tl),' + ",".join(J(r) for r in ROOMS) + '],corridors:[...el,' +
    ",".join(J(c) for c in CORR) + '],doors:[...il.map(d=>d.id==="porta-trono"?{...d,cdSeal:"gate",gate:"explore"}:d),' + ",".join(J(d) for d in DOORS) + '],playerSpawn:sl,next:null}')

# ── portas presas por mecanismo / exploração (usa o mesmo fluxo dos selos do diretor de campanha) ──
GATE = (r'function __gateOk(d){const sc=d.scene,rm=sc?.roomManager,g=d.def?.gate||"";if(!rm)return!1;if(g==="explore"){const q=__gateExplore(sc);return q.a>=q.b}'
        r'if(g.startsWith("lever:")){return!!sc.__levers?.[g.slice(6)]||rm.byId.get(d.def.gateRoom)?.state==="cleared"}return!0}'
        r'function __gateExplore(sc){const rs=sc.roomManager.rooms.filter(r=>!r.hasBoss&&!r.isSecretRoom&&!r.def.secret);return{a:rs.filter(r=>r.state==="cleared").length,b:rs.length}}'
        r'function __gateLabel(d){const g=d.def?.gate||"";if(g==="explore"){const q=__gateExplore(d.scene);return __L3(`Porta do chefe — vasculhe todas as salas (${q.a}/${q.b})`,`Boss door — search every room (${q.a}/${q.b})`,`Puerta del jefe — explora todas las salas (${q.a}/${q.b})`)}'
        r'return __L3("Trancada por um mecanismo escondido","Locked by a hidden mechanism","Cerrada por un mecanismo oculto")}'
        r'function __gateOpenAll(sc,why){const rm=sc?.roomManager;if(!rm)return;for(const d of rm.doors||[]){if(d.cdSeal!=="gate"||!__gateOk(d))continue;d.cdSeal=null;d.clearTint?.();d.state="closed";d.setTextureForState();sc.effectsRef?.burstTinted(d.x,d.y,why==="explore"?16765514:8382688,18);sc.effectsRef?.shockwaveRing?.(d.x,d.y,44);'
        r'sc.game.events.emit("ui:banner",d.def.gate==="explore"?__L3("A PORTA DO CHEFE SE ABRIU!","THE BOSS DOOR HAS OPENED!","¡LA PUERTA DEL JEFE SE ABRIÓ!"):__L3("UM MECANISMO DESTRANCOU UMA PORTA…","A MECHANISM UNLOCKED A DOOR…","UN MECANISMO ABRIÓ UNA PUERTA…"),d.def.gate==="explore"?"#ffd24a":"#7fe8e0");sc.audioRef?.play?.("sfx-secret-reveal")}}'
        r'function __leverTex(sc){if(sc.textures.exists("cx-lever-off"))return;const mk=(k,on,hid)=>{const c=sc.textures.createCanvas(k,20,26),g=c.getContext();g.fillStyle="rgba(0,0,0,.35)";g.fillRect(3,22,14,3);'
        r'if(hid){g.fillStyle="#5a5248";g.fillRect(2,12,16,12);g.fillStyle="#6e665a";g.fillRect(3,13,14,4);g.fillStyle="#d8d2c2";g.fillRect(7,15,6,5);g.fillStyle="#1a1410";g.fillRect(8,16,1,1);g.fillRect(11,16,1,1);g.fillRect(9,18,2,1);if(on){g.fillStyle="#7fe8e0";g.fillRect(8,16,1,1);g.fillRect(11,16,1,1)}}'
        r'else{g.fillStyle="#3a3630";g.fillRect(3,16,14,8);g.fillStyle="#5a544a";g.fillRect(4,17,12,3);g.fillStyle="#2a2620";g.fillRect(8,14,4,3);g.strokeStyle="#8a7a5a";g.lineWidth=2;g.beginPath();g.moveTo(10,15);g.lineTo(on?16:4,4);g.stroke();g.fillStyle=on?"#8ae0b0":"#c9a24a";g.fillRect(on?14:2,2,4,4)}c.refresh()};'
        r'mk("cx-lever-off",0,0);mk("cx-lever-on",1,0);mk("cx-hidden-off",0,1);mk("cx-hidden-on",1,1)}'
        r'class __Lever extends Ut{constructor(i,t,e){__leverTex(i);super(i,t,t.hidden?"cx-hidden-off":"cx-lever-off");this.setOrigin(.5,.75);t.solid&&this.addSolidBody(e);this.pulled=!1;'
        r'if(!t.hidden){const gl=i.add.image(this.x,this.y-6,"light").setScale(.12).setBlendMode(j.BlendModes.ADD).setTint(13214282).setAlpha(.35).setDepth(this.depth-1);i.tweens.add({targets:gl,alpha:.12,duration:900,yoyo:!0,repeat:-1});this.__gl=gl}}'
        r'get interactLabel(){return this.pulled?null:this.def.hidden?__L3("Examinar a caveira na parede","Examine the skull on the wall","Examinar la calavera en la pared"):__L3("Puxar a alavanca","Pull the lever","Tirar de la palanca")}'
        r'interact(){if(this.pulled)return;this.pulled=!0;const sc=this.scene;this.setTexture(this.def.hidden?"cx-hidden-on":"cx-lever-on");this.__gl?.destroy();(sc.__levers??={})[this.def.id]=!0;'
        r'sc.cameraSys?.shake?.(.006,260);sc.effectsRef?.burstTinted(this.x,this.y-8,this.def.hidden?8382688:13214282,16);sc.audioRef?.play?.("sfx-door-open");'
        r'this.def.hidden&&sc.game.events.emit("ui:banner",__L3("SEGREDO DESCOBERTO!","SECRET DISCOVERED!","¡SECRETO DESCUBIERTO!"),"#7fe8e0");sc.time.delayedCall(400,()=>__gateOpenAll(sc,"lever"))}}')
put("class _l{constructor(i,t){", GATE + "class _l{constructor(i,t){")
put('jl={"cd-obj":(c,i,t)=>new __CdObj(c,i,t),', 'jl={lever:(c,i,t)=>new __Lever(c,i,t),"cd-obj":(c,i,t)=>new __CdObj(c,i,t),')
put('function __cdDoorOk(d){const sc=d.scene;return d.cdSeal==="key"?', 'function __cdDoorOk(d){const sc=d.scene;return d.cdSeal==="gate"?__gateOk(d):d.cdSeal==="key"?')
put('function __cdDoorLabel(d){const q=__cdSeals(d.scene);return d.cdSeal==="key"?', 'function __cdDoorLabel(d){if(d.cdSeal==="gate")return __gateLabel(d);const q=__cdSeals(d.scene);return d.cdSeal==="key"?')
put('d.scene.game.events.emit("ui:banner",d.cdSeal==="key"?W("cd.lbl.locked"):W("cd.sealIntro",{b:__cdSeals(d.scene).b}),"#c9a24a")',
    'd.scene.game.events.emit("ui:banner",d.cdSeal==="gate"?__gateLabel(d):d.cdSeal==="key"?W("cd.lbl.locked"):W("cd.sealIntro",{b:__cdSeals(d.scene).b}),"#c9a24a")')
# o diretor de campanha não troca a trava das nossas portas
put('for(const d of s.ds)d.cdSeal="key"', 'for(const d of s.ds)d.cdSeal||(d.cdSeal="key")')
# a cada sala concluída, confere se alguma porta presa pode abrir (inclusive a do chefe)
put('completeRoom(i,t){i.state="cleared",i.clearedAtMs=Date.now();', 'completeRoom(i,t){i.state="cleared",i.clearedAtMs=Date.now();this.scene.time?.delayedCall?.(300,()=>this.scene.scene?.isActive?.()&&__gateOpenAll(this.scene,"explore"));')

# ── curva de experiência mais lenta (níveis 1-15) ──
put("const hr=[0,100,250,450,700,1e3,1400,1900,2500,3200,4e3,4900,5900,7e3,8200]",
    "const hr=[0,160,420,800,1320,2e3,2850,3900,5150,6650,8400,10450,12800,15500,18600]")

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("catacumbas ampliadas + portas com mecanismo + curva de XP")
