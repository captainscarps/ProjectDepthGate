"""
Conjunto lendário "Caçador de Dragão" do Guerreiro: drop exclusivo do Dragão Ancião (Fortaleza dos Dragões),
visual próprio com o conjunto completo e o Sopro do Dragão no botão do escudo.
Código em scripts/source/dragon-hunter.js; arte em scripts/build_dragon_hunter_art.py.
Re-executável (bloco com marcador no fim do bundle, sem trocar nenhum trecho original).
  python3 scripts/patch_dragon_hunter.py && node --check assets/index-D6qIWtA7-p209.js
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
SRC = open(os.path.join(ROOT, "scripts", "source", "dragon-hunter.js"), encoding="utf-8").read()
T = "/*__DRAGONHUNTER__*/"
s = open(BUNDLE, encoding="utf-8").read()
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    s = s[:a] + s[b + len(T):]
s = s.rstrip("\n") + "\n" + T + "\n" + SRC + "\n" + T + "\n"
open(BUNDLE, "w", encoding="utf-8").write(s)
print("caçador de dragão:", len(SRC), "caracteres")
