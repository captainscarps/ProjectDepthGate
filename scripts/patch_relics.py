"""
Relíquias dos enigmas: efeito próprio de cada uma (equipada), coleção por slot com bônus em 3/6/9 relíquias,
página "Relicários" no Códice e falas da Guardiã quando o herói traz cada relíquia ao Coração da Floresta.
Código em scripts/source/relic-effects.js. Aplicar depois de patch_level_puzzles.py.
Re-executável (bloco com marcador e texto original em base64).
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
SRC = open(os.path.join(ROOT, "scripts", "source", "relic-effects.js"), encoding="utf-8").read()
T = "/*__RLC__*/"


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


s = s + T + "\n" + SRC + "\n/*§*/" + T
# efeitos e bônus: instalados junto com o sistema de dano de cada fase
put("this.damageSystem=new Uh(this),", "this.damageSystem=new Uh(this),__relicFx(this),")
# Guardiã comenta cada relíquia nova antes da conversa normal
put("function __guardianTalk(S){", "function __guardianTalk(S){if(!S.__guard?.intro&&__relicTalk(S))return;")
# Códice: uma página dupla a mais no fim (Relicários)
put("    this.nSpreads = this.LEGENDS_START + this.totalLegends;",
    "    this.nSpreads = this.LEGENDS_START + this.totalLegends + 1;\n    this.RELICS_SPREAD = this.nSpreads - 1;")
put('    } else {\n      run(this.L, LX, "LENDAS DO ABISMO");',
    '    } else if (s === this.RELICS_SPREAD) {\n      run(this.L, LX, "RELICÁRIOS DAS PROFUNDEZAS");\n      run(this.R, RX, "COLEÇÃO & BÊNÇÃO");\n      __relicPage(this, LX, RX, PW);\n    } else {\n      run(this.L, LX, "LENDAS DO ABISMO");')

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("relíquias: efeitos, coleção, Códice e falas aplicados")
