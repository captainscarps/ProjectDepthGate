"""
Missão "O Rei que Abriu as Portas" — arco do príncipe (cena ValdrakAntiga).
Embute scripts/valdrak_lines.json em scripts/source/valdrak.js e anexa ao bundle (bloco com marcador, re-executável).
  python3 scripts/patch_valdrak.py && node --check assets/index-D6qIWtA7-p209.js
"""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
SRC = open(os.path.join(ROOT, "scripts", "source", "valdrak.js"), encoding="utf-8").read()
LINES = json.load(open(os.path.join(ROOT, "scripts", "valdrak_lines.json"), encoding="utf-8"))
SRC = SRC.replace("/*__VLINES__*/null/*__VLINES_END__*/", json.dumps(LINES, ensure_ascii=False, separators=(",", ":")))
T = "/*__VALDRAK__*/"
s = open(BUNDLE, encoding="utf-8").read()
while T in s:
    a = s.index(T); b = s.index(T, a + 1); s = s[:a] + s[b + len(T):]
s = s.rstrip("\n") + "\n" + T + "\n" + SRC + "\n" + T + "\n"
open(BUNDLE, "w", encoding="utf-8").write(s)
print("valdrak:", len(SRC), "caracteres")
