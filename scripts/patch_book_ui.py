"""Menus em livro e armaduras da forja: coloca scripts/source/book-ui.js e forge-armor.js no fim dos dois bundles (entre marcadores, trocado
inteiro a cada execução) e a fonte Pixelify Sans do kit no index.html. Re-executável."""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BLOCKS = [("/*__BOOKUI__*/", "book-ui.js"), ("/*__FARMOR__*/", "forge-armor.js"), ("/*__HMODS__*/", "hero-mods.js"), ("/*__DGUARD__*/", "death-guard.js"), ("/*__QUESTS3__*/", "quests3.js"), ("/*__HUDTOUCH__*/", "hud-touch.js"), ("/*__PETS__*/", "pets.js")]   # menus em livro; armaduras da forja
FONT = '    @font-face { font-family: "PixelifySans"; src: url("./assets/fonts/PixelifySans.ttf") format("truetype"); font-display: swap; }\n'
for base in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
    b = os.path.join(base, "assets", "index-D6qIWtA7-p209.js")
    if os.path.isfile(b):
        s = open(b, encoding="utf-8").read()
        for TAG, fn in BLOCKS:
            SRC = open(os.path.join(ROOT, "scripts", "source", fn), encoding="utf-8").read().strip()
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
