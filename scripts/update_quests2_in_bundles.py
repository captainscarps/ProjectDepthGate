"""Coloca scripts/source/quests2.js nos dois bundles, logo depois das missões da parte 1 (window.__dgQ).
O bloco fica entre marcadores /*__QUESTS2__*/ e é trocado inteiro a cada execução. Re-executável.
"""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = open(os.path.join(ROOT, "scripts", "source", "quests2.js"), encoding="utf-8").read().strip()
FILES = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js"),
]
TAG = "/*__QUESTS2__*/"
ANCHOR = "window.__dgQ = { Q: __Q,"


def run(path):
    s = open(path, encoding="utf-8").read()
    block = TAG + "\n" + SRC + "\n" + TAG
    if s.count(TAG) == 2:
        a = s.index(TAG)
        b = s.index(TAG, a + 1) + len(TAG)
        s = s[:a] + block + s[b:]
    else:
        if s.count(ANCHOR) != 1:
            raise SystemExit(f"âncora não encontrada em {path}")
        i = s.index(ANCHOR)
        i = s.index("\n", i) + 1
        s = s[:i] + block + "\n" + s[i:]
    open(path, "w", encoding="utf-8").write(s)
    print(os.path.relpath(path, ROOT), "ok")


for f in FILES:
    if os.path.isfile(f):
        run(f)
