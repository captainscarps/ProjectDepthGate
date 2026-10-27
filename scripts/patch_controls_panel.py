"""
Painel de Controles no estilo novo, com todas as ações (inclui poção extra, inventário e pausa), troca automática
de botões repetidos, Restaurar padrão e captura do botão B no gamepad. Fonte: scripts/source/controls-panel.js,
copiada para o módulo que o jogo carrega (assets/ControlsPanel-kYdEPlgz-p209.js). Re-executável.
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts", "source", "controls-panel.js")
for d in (os.path.join(ROOT, "assets"), os.path.join(ROOT, "Projeto atualizado", "assets")):
    if os.path.isdir(d):
        shutil.copyfile(SRC, os.path.join(d, "ControlsPanel-kYdEPlgz-p209.js"))
print("painel de controles atualizado")
