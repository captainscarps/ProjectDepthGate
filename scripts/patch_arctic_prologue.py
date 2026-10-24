"""
Prólogo no Mar Gelado entre o vídeo de abertura da campanha e a Floresta de Eldervale.
Código em scripts/source/arctic-prologue.js (cena ArcticPrologue), peças de scripts/build_arctic_prologue.py,
narração da Guardiã em scripts/voice_extra_lines.json. Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__ARC__*/"
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


SRC = open(os.path.join(ROOT, "scripts", "source", "arctic-prologue.js"), encoding="utf-8").read()
s = s + T + "\n" + SRC + "\ntry{wt.scene.add(\"ArcticPrologue\",__ArcticPrologue,!1)}catch(e){}\n/*§*/" + T
put('this.scene.start("Cutscene",{script:"intro",classId:t,next:{key:"Game",data:{levelId:Zn,classId:t,introHandoff:!0}}})',
    'this.scene.start("Cutscene",{script:"intro",classId:t,next:{key:"ArcticPrologue",data:{classId:t,next:{key:"Game",data:{levelId:Zn,classId:t,introHandoff:!0}}}}})')
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("prólogo do mar gelado aplicado")
