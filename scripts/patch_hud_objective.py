"""Caixa do objetivo/selos no HUD: afasta da borda direita para não ultrapassar a tela. Re-executável."""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
for old, new in [
    ('ui.__cdT=ui.add.text(_-14,58,"",', 'ui.__cdT=ui.add.text(_-26,58,"",'),
    ('const w=T.width,h=T.height,x=T.x-w-12,y=T.y-6;g.fillStyle(1315091,.88).fillRoundedRect(x,y,w+22,h+12,6).lineStyle(1,9053216,.8).strokeRoundedRect(x+.5,y+.5,w+21,h+11,6)',
     'const w=T.displayWidth,h=T.displayHeight,x=T.x-w-12,y=T.y-6;g.fillStyle(1315091,.88).fillRoundedRect(x,y,w+24,h+12,6).lineStyle(1,9053216,.8).strokeRoundedRect(x+.5,y+.5,w+23,h+11,6)'),
]:
    if new not in s:
        assert s.count(old) == 1, old[:60]
        s = s.replace(old, new)
for p in (BUNDLE, MIRROR):
    open(p, "w", encoding="utf-8").write(s)
print("caixa do objetivo ajustada")
