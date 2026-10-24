"""
Dublagem pelo Web Audio (falas que abrem sozinhas também têm voz no iPhone) e espera a lista de falas carregar.
Código em scripts/source/voice-webaudio.js, acrescentado no fim do módulo (substitui __dub/__dubInit).
Re-executável.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__VWA__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    s = s[:a] + s[b + len(T):]
SRC = open(os.path.join(ROOT, "scripts", "source", "voice-webaudio.js"), encoding="utf-8").read()
s = s + T + "\n" + SRC + "\n" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("dublagem pelo Web Audio aplicada")
