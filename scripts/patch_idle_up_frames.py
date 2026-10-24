"""
Herói parado olhando para cima: não troca mais para quadros errados.

Parado depois de andar para cima, o jogo alternava os quadros upA/upB (37 e 38). Nas folhas novas dos heróis
(*-pack.json, com arma desenhada) esses quadros não são "de costas": no Arqueiro um deles é ele mirando de lado,
nos outros são pulos/golpes. Resultado: o herói ficava piscando entre parado e outra pose.
Agora, nessas folhas, o herói parado usa sempre a animação normal de parado. Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__IDLEUP__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    inner = s[a + len(T):b]
    k = inner.rindex("/*§")
    s = s[:a] + base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") + s[b + len(T):]
old = "else if(h&&M.upA!=null)this.mk2.anims.stop()"
new = "else if(h&&M.upA!=null&&!A.bakedWeapon)this.mk2.anims.stop()"
assert s.count(old) == 1
s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode()).decode() + "*/" + T, 1)
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("herói parado de costas corrigido")
