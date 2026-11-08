"""Menus em livro: coloca scripts/source/book-ui.js no fim dos dois bundles (entre marcadores /*__BOOKUI__*/, trocado
inteiro a cada execução) e a fonte Pixelify Sans do kit no index.html. Re-executável."""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = open(os.path.join(ROOT, "scripts", "source", "book-ui.js"), encoding="utf-8").read().strip()
TAG = "/*__BOOKUI__*/"
FONT = '    @font-face { font-family: "PixelifySans"; src: url("./assets/fonts/PixelifySans.ttf") format("truetype"); font-display: swap; }\n'
for base in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
    b = os.path.join(base, "assets", "index-D6qIWtA7-p209.js")
    if os.path.isfile(b):
        s = open(b, encoding="utf-8").read()
        block = TAG + "\n" + SRC + "\n" + TAG
        if s.count(TAG) == 2:
            i, k = s.index(TAG), s.index(TAG, s.index(TAG) + 1) + len(TAG)
            s = s[:i] + block + s[k:]
        else:
            s = s.rstrip() + "\n" + block + "\n"
        open(b, "w", encoding="utf-8").write(s)
        print(os.path.relpath(b, ROOT), "ok")
    h = os.path.join(base, "index.html")
    if os.path.isfile(h):
        s = open(h, encoding="utf-8").read()
        if "PixelifySans" not in s:
            a = s.index('    @font-face { font-family: "NeoDunggeunmo"')
            s = s[:a] + FONT + s[a:]
            open(h, "w", encoding="utf-8").write(s)
            print(os.path.relpath(h, ROOT), "fonte ok")
