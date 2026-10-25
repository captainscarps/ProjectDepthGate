"""
História: cada herói foi tocado pelas Profundezas porque nasceu numa terra onde, há séculos, um portal foi
selado — e, como dentro dos selos não existe tempo, os portais trazem os heróis de épocas diferentes. A Guardiã diz isso na abertura (páginas da história) e ao encontrar o herói na floresta. Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__ORIGINS__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    inner = s[a + len(T):b]
    k = inner.rindex("/*§")
    s = s[:a] + base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") + s[b + len(T):]


def put(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T, 1)


A = ("Cada um de vocês nasceu numa terra onde, há séculos, um portal foi selado. As Profundezas nunca esqueceram esses lugares — nem quem veio deles.",
     "Each of you was born in a land where, centuries ago, a gate was sealed. The Depths never forgot those places — or the people who came from them.",
     "Cada uno de ustedes nació en una tierra donde, hace siglos, se selló un portal. Las Profundidades nunca olvidaron esos lugares, ni a quienes vienen de ellos.")
B = ("Você nasceu numa terra onde um portal foi selado há séculos. Foi lá que as Profundezas tocaram você pela primeira vez.",
     "You were born in a land where a gate was sealed centuries ago. That is where the Depths first touched you.",
     "Naciste en una tierra donde se selló un portal hace siglos. Fue allí donde las Profundidades te tocaron por primera vez.")
C = ("E os selos não conhecem o tempo. Os portais trouxeram vocês de séculos diferentes, mas todos chegam ao mesmo lago.",
     "And the seals know nothing of time. The gates brought you from different centuries, yet all of you reach the same lake.",
     "Y los sellos no conocen el tiempo. Los portales los trajeron de siglos distintos, pero todos llegan al mismo lago.")
D = ("Dentro dos selos não existe tempo. Quem atravessa um portal pode ter nascido séculos antes ou depois de você… e todos chegam a este mesmo lago.",
     "Inside the seals, time does not exist. Whoever crosses a gate may have been born centuries before or after you… and all of them arrive at this same lake.",
     "Dentro de los sellos no existe el tiempo. Quien cruza un portal puede haber nacido siglos antes o después que tú… y todos llegan a este mismo lago.")
q = lambda t: '"' + t.replace('"', '\\"') + '"'
put('"Foram escolhidos porque já foram tocados pelas Profundezas.","Lá dentro está a resposta.",',
    '"Foram escolhidos porque já foram tocados pelas Profundezas.",' + q(A[0]) + ',' + q(C[0]) + ',"Lá dentro está a resposta.",')
put('{who:"guardia",expr:"talk",name:__GN,text:"Antes que você conhecesse as Profundezas, elas já conheciam você."},',
    '{who:"guardia",expr:"talk",name:__GN,text:"Antes que você conhecesse as Profundezas, elas já conheciam você."},{who:"guardia",expr:"sadness",name:__GN,text:' + q(B[0]) + '},{who:"guardia",expr:"calm",name:__GN,text:' + q(D[0]) + '},')
put('const __TR={en:{', 'const __TR={en:{' + ''.join(q(x[0]) + ':' + q(x[1]) + ',' for x in (A, B, C, D)))
i = s.index("const __TR={en:{")
j = s.index("},es:{", i)
for x in (A, B, C, D):
    e = q(x[0]) + ":" + q(x[2]) + ","
    if e not in s:
        s = s[:j] + "},es:{" + e + s[j + len("},es:{"):]
        j = s.index("},es:{", i)
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("origem dos heróis na história")
