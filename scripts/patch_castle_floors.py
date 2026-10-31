"""
Castelo de Valdrak em andares: ganchos no jogo para assets/castle-floors.js. Re-executável.
- a fase "castle" passa a ser montada pelo andar atual (window.__castleLevel)
- o cenário assado do andar vem de window.__castleBaked
- o diretor de campanha (selos/objetivos) não age no castelo novo (noCd)
- itens-chave do castelo; __goLevel exposto para as escadas
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
M = "/*__CASTLE2__*/"
s = open(BUNDLE, encoding="utf-8").read()
while M in s:
    a = s.index(M)
    b = s.index(M, a + 1)
    inner = s[a + len(M):b]
    k = inner.rfind("/*§")
    orig = base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") if k >= 0 else ""
    s = s[:a] + orig + s[b + len(M):]

DESC = "Item-chave do Castelo de Valdrak."
ITEMS = ('castle_crank:{name:"Manivela Enferrujada",type:"quest",icon:"cf-icon-castle_crank",minRarity:"LEGENDARY",stats:{},value:0,desc:"Ergue a grade levadiça do portão do castelo."},'
         'castle_key_iron:{name:"Chave de Ferro",type:"quest",icon:"cf-icon-castle_key_iron",minRarity:"LEGENDARY",stats:{},value:0,desc:"Abre a grade de ferro da ala oeste."},'
         'castle_key_crest:{name:"Chave do Brasão",type:"quest",icon:"cf-icon-castle_key_crest",minRarity:"LEGENDARY",stats:{},value:0,desc:"Leva o brasão dos Valdrak. Abre a porta da Sala do Trono."},')
REPS = [
    ("this.level=__cdLevel(this,ki[this.levelId])",
     "this.level=__cdLevel(this,(window.__castleLevel?.(this,this.levelId,i,ki[this.levelId]))||ki[this.levelId])"),
    ("function __cdLevel(sc,L){if(sc.__cdP=null,!L||L.endless||",
     "function __cdLevel(sc,L){if(sc.__cdP=null,!L||L.endless||L.noCd||"),
    ("function __frBaked(B){", "function __frBaked(B){if(B.level?.castle2&&window.__castleBaked)return window.__castleBaked(B);"),
    ('crystal_vulcao:{name:"Cristal de Magma"', ITEMS + 'crystal_vulcao:{name:"Cristal de Magma"'),
    # trocar de andar não repete a abertura da fase
    ("const s=!n&&!this.restoreData?gs(this.levelId):null;", "const s=!n&&!this.restoreData&&!i.castleFloor?gs(this.levelId):null;"),
]
for old, new in REPS:
    assert s.count(old) == 1, old
    s = s.replace(old, M + new + "/*§" + base64.b64encode(old.encode()).decode() + "*/" + M)
s = s + M + "\ntry{window.__goLevelG=__goLevel}catch(e){}\n" + M
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("castelo em andares: ganchos aplicados")
