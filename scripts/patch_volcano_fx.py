"""
Vulcão: lava animada, correntes rasas que queimam, itens de cenário.
Atualiza (de forma re-executável) a fase "vulcao" já aplicada por patch_volcano.py:
  - troca a definição da fase e a lista de imagens pelos dados novos do build_volcano_map.py
  - injeta scripts/source/volcano-fx.js e chama __vcFx ao montar o mapa assado
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
LV = json.load(open(os.path.join(ROOT, "scripts", "volcano_level.json"), encoding="utf-8"))
FX = open(os.path.join(ROOT, "scripts", "source", "volcano-fx.js"), encoding="utf-8").read()
s = open(BUNDLE, encoding="utf-8").read()
J = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))
NAME = "Vulcão de Cinzas"

# 1) definição da fase (substitui a antiga inteira)
a = s.index('vulcao:{id:"vulcao",')
b = s.index("next:null}", a) + len("next:null}")
s = s[:a] + (f'vulcao:{{id:"vulcao",name:"{NAME}",theme:{{...$n,id:"vulcao",name:"{NAME}"}},world:{J(LV["world"])},'
             f'rooms:{J(LV["rooms"])},corridors:{J(LV["corridors"])},doors:{J(LV["doors"])},playerSpawn:{J(LV["spawn"])},next:null}}') + s[b:]

# 2) lista de imagens da fase
m = re.search(r'for\(const f of\[("vc-[^\]]*)\]\)this\.load\.image\(f,`assets/pixel-art/newmaps/\$\{f\}\.png`\);', s)
assert m, "lista de props do vulcão não encontrada"
s = s[:m.start()] + f'for(const f of{J(LV["props"])})this.load.image(f,`assets/pixel-art/newmaps/${{f}}.png`);' + s[m.end():]

# 3) folha das bolhas
if 'load.spritesheet("vc-fx-bubble"' not in s:
    old = 'this.load.spritesheet("boss-magma-titan","assets/pixel-art/bosses/boss-magma-titan.png",{frameWidth:128,frameHeight:128});'
    assert s.count(old) == 1
    s = s.replace(old, old + 'this.load.spritesheet("vc-fx-bubble","assets/pixel-art/newmaps/vc-fx-bubble.png",{frameWidth:12,frameHeight:12});')

# 4) código dos efeitos (substitui se já existir)
if "function __vcFx(" in s:
    a = s.index("/* ── Vulcão de Cinzas: lava viva")
    b = s.index("function __frBaked(B){")
    s = s[:a] + s[b:]
old = "function __frBaked(B){"
assert s.count(old) == 1
s = s.replace(old, FX + old)

# 5) chamada ao montar o mapa
if 'if(P==="vcb")__vcFx(d,B,M);' not in s:
    old = '.setOrigin(0).setDepth(-2);if(P==="bqb"||P==="mtb"){'
    assert s.count(old) == 1, s.count(old)
    s = s.replace(old, '.setOrigin(0).setDepth(-2);if(P==="vcb")__vcFx(d,B,M);if(P==="bqb"||P==="mtb"){')

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("efeitos do vulcão aplicados")
