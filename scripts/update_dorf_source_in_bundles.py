"""
Atualiza o bloco de dorf-caves.js nos dois bundles mantendo todos os outros hooks intactos.
"""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = open(os.path.join(ROOT, "scripts", "source", "dorf-caves.js"), encoding="utf-8").read().strip()
FILES = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
]

TAG = "/*__DORF_CAVES__*/"
ANCHOR_BEFORE = " 3) biomas novos */\n" + TAG + "\n"
ANCHOR_AFTER = "\n" + TAG + "\nLs.edesert = { ...Kn, id: \"edesert\""

for p in FILES:
    if not os.path.exists(p):
        continue
    s = open(p, "r", encoding="utf-8").read()
    if ANCHOR_BEFORE not in s or ANCHOR_AFTER not in s:
        print(f"Error: anchors not found in {p}")
        continue
    idx1 = s.index(ANCHOR_BEFORE) + len(ANCHOR_BEFORE)
    idx2 = s.index(ANCHOR_AFTER, idx1)
    s = s[:idx1] + SRC + s[idx2:]
    open(p, "w", encoding="utf-8").write(s)
    print(f"Updated dorf-caves.js in {p} successfully.")

print("Done updating dorf-caves.js in all bundles.")
