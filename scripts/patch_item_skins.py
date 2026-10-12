"""
Itens únicos + conjuntos novos + visual por equipamento (aplicar depois de patch_polish.py).
Código em scripts/source/item-skins.js.
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
SRC = open(os.path.join(ROOT, "scripts", "source", "item-skins.js"), encoding="utf-8").read()
s = open(BUNDLE, encoding="utf-8").read()
if "__itemUnique" in s:
    print("já aplicado — nada a fazer")
    raise SystemExit(0)


def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, f"esperava {count}, achei {n}: {old[:90]!r}"
    s = s.replace(old, new)


rep('const hs=[["idle"', SRC + '\nconst hs=[["idle"')
# fábrica de itens: peças de conjunto + itens únicos (semente salva)
rep('makeItem(i,t){const e=Xt[i];',
    'makeItem(i,t,sd){sd===void 0&&(i=__maybeSetPiece(i,t,this.scene?.classDef?.id));return __itemUnique(this.__mk0(i,t),sd)}'
    '__mk0(i,t){const e=Xt[i];')
rep('e=a=>a?{id:a.id,rarity:a.rarity}:null', 'e=a=>a?{id:a.id,rarity:a.rarity,seed:a.seed??0}:null', 2)
rep('makeItem(l.id,l.rarity)', 'makeItem(l.id,l.rarity,l.seed??0)', 2)
rep('makeItem(h.id,h.rarity)', 'makeItem(h.id,h.rarity,h.seed??0)', 2)
# visual do herói conforme o equipamento
rep('if(this.mk2)this.armorImg.setVisible(!1),this.helmetImg.setVisible(!1),this.setSkin(Jn(this.classDef.id,d));',
    'if(this.mk2){this.armorImg.setVisible(!1),this.helmetImg.setVisible(!1),this.setSkin(__skinFor(this.scene,Jn(this.classDef.id,d),this.classDef.id,t));try{__adorn(this,t)}catch(e){}}')
# adornos carregados no Preload
rep('this.load.image("logo-dark-epic","assets/ui/dark-epic-dungeons-logo.png");',
    'this.load.image("logo-dark-epic","assets/ui/dark-epic-dungeons-logo.png");'
    'for(const f of["adorn-cocar","adorn-cocar-w","adorn-colar"])this.load.image(f,`assets/pixel-art/ui2/${f}.png`);')

open(BUNDLE, "w", encoding="utf-8").write(s)
if os.path.isdir(os.path.dirname(MIRROR)):
    shutil.copyfile(BUNDLE, MIRROR)
print("OK — itens únicos, conjuntos e visual por equipamento")
