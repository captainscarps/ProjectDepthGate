"""
Cartas dos Pactos (modo infinito): o jogo passa a somar nos atributos a vida máxima, a recarga e o dano
crítico que vêm das cartas (antes esses efeitos dos pactos não chegavam ao herói) e expõe o idioma para
assets/abyss-cards.js. Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
M = "/*__PCARDS__*/"
s = open(BUNDLE, encoding="utf-8").read()
# desfaz uma aplicação anterior
while M in s:
    a = s.index(M)
    b = s.index(M, a + 1)
    inner = s[a + len(M):b]
    k = inner.rfind("/*§")
    orig = base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") if k >= 0 else ""
    s = s[:a] + orig + s[b + len(M):]

REPS = [
    ("maxHpAdd:(t.maxHpAdd??0)+(e.maxHpAdd??0)", "maxHpAdd:(t.maxHpAdd??0)+(e.maxHpAdd??0)+(pct.maxHpAdd??0)"),
    ("cooldownReduction:(t.cooldownReduction??0),effectDuration",
     "cooldownReduction:(t.cooldownReduction??0)+(pct.cooldownReduction??0),effectDuration"),
    ("goldMult:(t.goldMult??0)+(pct.goldMult??0)}}getBlessingBonus",
     "goldMult:(t.goldMult??0)+(pct.goldMult??0),critMultAdd:(pct.critMultAdd??0)}}getBlessingBonus"),
    ("i.critChance+=t.critAdd??0,", "i.critChance+=t.critAdd??0,i.critMult=(i.critMult??1.5)+(t.critMultAdd??0),"),
]
for old, new in REPS:
    assert s.count(old) == 1, old
    s = s.replace(old, M + new + "/*§" + base64.b64encode(old.encode()).decode() + "*/" + M)
s = s + M + "\ntry{window.__L3G=(a,b,c)=>__L3(a,b,c)}catch(e){}\n" + M
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("cartas dos pactos: atributos ligados")
