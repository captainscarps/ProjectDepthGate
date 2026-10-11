"""Restaura o painel da direita da seleção de classe (história, características,
atributos e habilidades), apagado junto com o modo coop no commit 61aa580.

O projeto só tem o bundle compilado; a troca precisa casar exatamente uma vez.
Uso:  python scripts/patch_class_select_panel.py
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")

s = open(BUNDLE, encoding="utf-8").read()
DETAILS = open(os.path.join(ROOT, "scripts", "source", "class-select-details.js"), encoding="utf-8").read()
if DETAILS in s:
    print("já aplicado — nada a fazer")
else:
    old = 'else h.setVisible(!1)}\nthis.redraw()}__foot(){'
    assert s.count(old) == 1, "trecho da seleção de classe não encontrado"
    s = s.replace(old, 'else h.setVisible(!1)}' + DETAILS + 'this.redraw()}__foot(){')
    open(BUNDLE, "w", encoding="utf-8").write(s)
    print("OK — painel da seleção de classe restaurado")
if os.path.isdir(os.path.dirname(MIRROR)):
    shutil.copyfile(BUNDLE, MIRROR)
