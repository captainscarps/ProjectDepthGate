"""
Fim do jogo: depois do texto do epílogo e antes do vídeo final do herói, entra o "Caminho de Volta"
(cena ReturnJourney, em scripts/source/arctic-prologue.js). Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__RETJ__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    inner = s[a + len(T):b]
    k = inner.rindex("/*§")
    s = s[:a] + base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") + s[b + len(T):]
A = 'R.destroy();__holdM(!0);__playVideos(["assets/video/final_herois/"'
i = s.index(A)
assert s.count(A) == 1
END = 'done && done();  }});'
j = s.index(END, i) + len(END)
old = s[i:j]
new = "R.destroy();__retJourney(S,choice,()=>{" + old[len("R.destroy();"):] + "})"
s = s[:i] + T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T + s[j:]
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("caminho de volta antes do vídeo final")
