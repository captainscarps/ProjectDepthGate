"""
Tradução (inglês/espanhol) dos textos do Códice e dos Colecionáveis. Dicionário em scripts/books_i18n_*.json
(chave = texto em português, valor = [inglês, espanhol]); código em scripts/source/books-i18n.js.
Re-executável. Rodar antes de patch_item_icons.py.
"""
import glob
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
D = {}
for f in sorted(glob.glob(os.path.join(ROOT, "scripts", "books_i18n_*.json"))):
    D.update(json.load(open(f, encoding="utf-8")))
# subtítulos curtos do índice (parte antes do " & ")
for k, (en, es) in list(D.items()):
    if " & " in k and len(k) < 80:
        D.setdefault(k.split(" & ")[0], [en.split(" & ")[0], es.split(" y ")[0]])
SRC = "const __TRB=" + json.dumps(D, ensure_ascii=False, separators=(",", ":")) + ";\n" + open(os.path.join(ROOT, "scripts", "source", "books-i18n.js"), encoding="utf-8").read()
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__BOOKSI18N__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    s = s[:a] + s[b + len(T):]
s = s + T + "\n" + SRC + "\n" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print(f"Códice e Colecionáveis traduzidos: {len(D)} textos")
