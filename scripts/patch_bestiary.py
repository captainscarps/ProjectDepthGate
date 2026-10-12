"""Bestiário em forma de livro (scripts/source/bestiary-book.js).

- Cena "BestiaryBook" desenhada como um livro aberto: capa de couro, páginas de pergaminho,
  fitas marcadoras (Índice / Criaturas / Chefes), virada de página animada.
- Abre pelo menu principal (BESTIÁRIO) e pelo menu de pausa durante o jogo.
- Conta os inimigos derrotados por espécie (localStorage "depthgate:bestiary").
Aplicar depois de patch_skills_tab.py.
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
if "__BookScene" in s:
    print("já aplicado — nada a fazer")
    raise SystemExit(0)
BOOK = open(os.path.join(ROOT, "scripts", "source", "bestiary-book.js"), encoding="utf-8").read()


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, f"esperava 1 ocorrência, achei {n}: {old[:90]!r}"
    s = s.replace(old, new)


# código do livro logo depois da cena de teste "Bestiary" (mesmo escopo das tabelas do jogo)
rep('const hs=[["idle",[0,1,2,3],4,-1]', BOOK + '\nconst hs=[["idle",[0,1,2,3],4,-1]')
# menu principal: BESTIÁRIO antes de Configurações
rep('/* perfil oculto */{label:W("menu.settings"),enabled:!0,action:()=>this.settingsPanel.show()}',
    '/* perfil oculto */{label:__L3("BESTIÁRIO","BESTIARY","BESTIARIO"),enabled:!0,action:()=>__bestiaryOpen(this)},{label:W("menu.settings"),enabled:!0,action:()=>this.settingsPanel.show()}')
# menu de pausa: BESTIÁRIO depois de Continuar
rep('const d=[{label:W("pause.continue"),action:()=>this.close()},{label:W("pause.save"),action:()=>this.doSave()},',
    'const d=[{label:W("pause.continue"),action:()=>this.close()},{label:__L3("BESTIÁRIO","BESTIARY","BESTIARIO"),action:()=>__bestiaryOpen(this.ui)},{label:W("pause.save"),action:()=>this.doSave()},')
# contador de derrotados: liga uma vez por jogo, quando a interface da partida nasce
rep('this.skillTree=new Rd(this),', 'this.skillTree=new Rd(this),__bestTrack(this.game),')

open(BUNDLE, "w", encoding="utf-8").write(s)
if os.path.isdir(os.path.dirname(MIRROR)):
    shutil.copyfile(BUNDLE, MIRROR)
print("OK — bestiário")
