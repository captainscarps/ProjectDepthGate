"""
Refúgio com controle: a "ponte" que transforma botões do gamepad em teclas de menu (B = Esc, Start = Enter…)
fica desligada no Refúgio (exceto em telas que só usam teclado, marcadas por window.__padUI), que trata o controle sozinho (movimento, ataque, painéis e pausa com Start).
Antes, apertar B no Refúgio virava Esc e mandava direto para a tela inicial. Os livros (Bestiário, Colecionáveis, Códice) também leem o controle sozinhos; com a ponte ligada o direcional andava dois passos.
Re-executável.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
OLD = 'bridgeActive(){const i=this.game.scene;'
NEW = 'bridgeActive(){const i=this.game.scene;/*__HUBPAD__*/if(window.__padUI>0)return!0;if(i.isActive("Hub")||i.isActive("BestiaryBook")||i.isActive("CollectiblesBook")||i.isActive("CodexBook"))return!1;/*__HUBPAD__*/'
import re
s = re.sub(r'/\*__HUBPAD__\*/.*?/\*__HUBPAD__\*/', '', s)
assert s.count(OLD) == 1
s = s.replace(OLD, NEW)
for p in (BUNDLE, MIRROR):
    open(p, "w", encoding="utf-8").write(s)
print("controle no Refúgio ajustado")
