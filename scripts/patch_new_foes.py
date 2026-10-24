"""
Inimigos novos no jogo todo: esqueletos (Legionário, Lanceiro, Atirador), Cultistas Piromantes (Cultista,
Zelote, Lâmina das Cinzas), deserto (Guardião de Anúbis, Mantícora, Estátua Desperta) e os 3 Espiões do
Observador (chefes surpresa). Código em scripts/source/new-foes.js, folhas de scripts/build_new_foes.py.
  • carrega as folhas e os projéteis junto com os outros inimigos
  • as salas da campanha recebem os novos (troca fixa por sala) e o modo infinito ganha 3 facções
  • os espiões podem surgir em qualquer fase (fora do refúgio) com uma chance a cada 15 s
Re-executável.
"""
import base64
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__NFOE__*/"
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


META = json.load(open(os.path.join(ROOT, "scripts", "new_foes_meta.json")))
PJ = META.pop("_proj")
loads = [[f"nf-{k}", v["file"], v["fw"], v["fh"]] for k, v in META.items()] + [[f"nf-proj-{k}", v["file"], v["fw"], v["fh"]] for k, v in PJ.items()]
old = '["enemy-shadow-demon2","enemy-shadow-demon2.png",128,128]]'
put(old, old[:-1] + "," + ",".join(json.dumps(x, separators=(",", ":")) for x in loads) + "]")
put("this.rooms=t.rooms.map(e=>new th(e)),this.byId=new Map(this.rooms.map(e=>[e.id,e]));",
    "this.rooms=t.rooms.map(e=>new th(e)),this.byId=new Map(this.rooms.map(e=>[e.id,e]));try{__nfMix(this)}catch(e){}")
put('this.game.events.on("enemy:died",this.onEnemyDied,this),', '__bhInit(this),this.game.events.on("enemy:died",this.onEnemyDied,this),')
SRC = open(os.path.join(ROOT, "scripts", "source", "new-foes.js"), encoding="utf-8").read()
meta_js = json.dumps({k: {kk: v[kk] for kk in ("anims", "si", "visW", "visH")} for k, v in META.items()}, separators=(",", ":"))
s = s + T + "\nconst __NF_META=" + meta_js + ";\n" + SRC + "\n/*§*/" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("inimigos novos aplicados:", ", ".join(META))
