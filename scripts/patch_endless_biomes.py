"""
Ganchos de texto do pacote para scripts/source/endless-biomes.js (que entra no bloco do
patch_endless_trees.py). Re-executável: cada troca guarda o original em base64 entre marcadores.
  - salas laterais calmas só se ligam a salas com luta (__exHosts)
  - baú da câmara de elite das masmorras da campanha nunca é mímico
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = [os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
         os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")]
M = "/*__EXBIO__*/"
SWAPS = [
    ("N=g.slice(1,-1);if(N.length===0)break;const B=r.pick(N)", "N=__exHosts(g,l);if(N.length===0)break;const B=r.pick(N)"),
    ('tier:depth>=4?"EPIC":"RARE",cdRoom:el.id,cdPlaced:!0}', 'tier:depth>=4?"EPIC":"RARE",cdRoom:el.id,cdPlaced:!0,noMimic:!0}'),
]


def undo(s):
    while M in s:
        a = s.index(M)
        b = s.index(M, a + 1)
        inner = s[a + len(M):b]
        k = inner.rfind("/*§")
        s = s[:a] + base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") + s[b + len(M):]
    return s


for p in FILES:
    if not os.path.exists(p):
        continue
    s = undo(open(p, encoding="utf-8").read())
    for old, new in SWAPS:
        assert s.count(old) == 1, old
        s = s.replace(old, M + new + "/*§" + base64.b64encode(old.encode()).decode() + "*/" + M)
    open(p, "w", encoding="utf-8").write(s)
print("ganchos dos biomas do infinito aplicados")
