"""
Druida (Tharion) agora é da Boêmia (República Tcheca), de origem celta (boios): ele é homem, então o card
deixa de dizer "Guardiã/Guardiana da mata". Falas, códex e voz tcheca ficam em patch_hero_origins.py,
hero_native_lines.json, arctic-prologue.js, hub-village.js e region-titles.js. Re-executável.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
s = s.replace('"Guardiã da mata: vira javali, vira lobisomem e chama a águia."', '"Guardião da mata: vira javali, vira lobisomem e chama a águia."')
s = s.replace('"tag.DRUID":"Guardiana de', '"tag.DRUID":"Guardián de')
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("druida da Boêmia")
