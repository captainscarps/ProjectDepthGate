"""
Campanha: terceiro espaço de save (SAVE 3).

A campanha passa a ter 3 slots (o Modo Infinito continua com 2). Na tela de escolha de save os
cartões ficam um pouco mais estreitos para caber os três lado a lado. Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__SLOT3__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    inner = s[a + len(T):b]
    k = inner.rindex("/*§")
    s = s[:a] + base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") + s[b + len(T):]
REP = [
    ("ke=[1,2],", "ke=[1,2],__kC=[1,2,3],"),
    ('return ke.some(i=>localStorage.getItem(Wt("campaign",i))!=null)',
     'return __kC.some(i=>localStorage.getItem(Wt("campaign",i))!=null)'),
    ('ke.some(l=>Ws("campaign",l).completed)', '__kC.some(l=>Ws("campaign",l).completed)'),
    ("__ornatePanel(a,e-230,22,460,318)",
     '__ornatePanel(a,e-(i==="campaign"?262:230),22,i==="campaign"?524:460,318)'),
    ("const CW=196,CH=192,gp=20,x0=e-(ke.length*CW+(ke.length-1)*gp)/2;ke.forEach(",
     'const KS=i==="campaign"?__kC:ke,CW=KS.length>2?156:196,CH=192,gp=KS.length>2?12:20,'
     "x0=e-(KS.length*CW+(KS.length-1)*gp)/2;KS.forEach("),
]
for old, new in REP:
    assert s.count(old) == 1, old
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode()).decode() + "*/" + T, 1)
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("campanha com 3 saves")
