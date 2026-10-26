"""
Ícones de itens em alta definição no jogo (inventário, loja, ficha do item, item no chão, HUD e atalhos).
Código em scripts/source/item-icons.js + trocas pontuais no bundle (marcador + original em base64). Re-executável.
O atlas é gerado por scripts/build_item_icons.py.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
SRC = open(os.path.join(ROOT, "scripts", "source", "item-icons.js"), encoding="utf-8").read()
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__ITEMHD__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    inner = s[a + len(T):b]
    k = inner.rfind("/*§")
    s = s[:a] + (base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") if k >= 0 else "") + s[b + len(T):]


def put(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T, 1)


# ficha do item (tooltip)
put('const ic=s.textures.exists(it.icon)?s.add.image(x+21,y+13,it.icon):null;ic&&(ic.setScale(Math.min(1.5,22/Math.max(ic.width,ic.height))),o.push(ic));',
    'const ic=s.textures.exists(it.icon)||__itFrame(s.textures,it)?__itSet(s.add.image(x+21,y+13,"__DEFAULT"),it,28):null;ic&&o.push(ic);')
# HUD (arma equipada)
put('this.weapon&&this.weaponIcon.setTexture(this.weapon.icon)', 'this.weapon&&__itSet(this.weaponIcon,this.weapon,20)')
# barra de atalhos: a arma leva o item junto para escolher o ícone
put('{icon:f?.icon??"icon-sword"}', '{icon:f?.icon??"icon-sword",it:f}')
put('(T.texture.key!==S.icon&&T.setTexture(S.icon),T.setScale(Math.min(1,20/Math.max(T.width,T.height))).setVisible(!0)',
    '((S.it&&__itFrame(this.s.textures,S.it)?__itSet(T,S.it,20):(T.texture.key!==S.icon&&T.setTexture(S.icon),T.setScale(Math.min(1,20/Math.max(T.width,T.height))))).setVisible(!0)')
s = s + T + "\n" + SRC + "\n" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("ícones de itens em alta definição")
