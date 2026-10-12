"""
Patch: Confirmação e Dificuldade de Portais
Pergunta se tem certeza antes de entrar num portal e calcula a dificuldade
comparando a força/resistência dos inimigos com o nível e equipamentos do herói.
Código em scripts/source/portal-confirm.js.
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
SRC = open(os.path.join(ROOT, "scripts", "source", "portal-confirm.js"), encoding="utf-8").read()

s = open(BUNDLE, encoding="utf-8").read()
if "__calcPortalDifficulty" in s:
    print("já aplicado — nada a fazer")
    raise SystemExit(0)

def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, f"esperava {count}, achei {n}: {old[:90]!r}"
    s = s.replace(old, new)

# 1. Injeta o código do modal e cálculo antes de __hubEnter
rep(
    'function __hubEnter(S,p){p.__sealed?S.effects.floatText(p.x,p.y-30,__T("Selado — já concluído"),"#c9a24a"):p.__locked?S.effects.floatText(p.x,p.y-40,__L3(`Conclua as ${__HUBD.length} masmorras primeiro`,`Complete the ${__HUBD.length} dungeons first`,`Completa las ${__HUBD.length} mazmorras primero`),"#e05a4a"):__goLevel(S,p.__level)}',
    SRC + '\nfunction __hubEnter(S,p){p.__sealed?S.effects.floatText(p.x,p.y-30,__T("Selado — já concluído"),"#c9a24a"):p.__locked?S.effects.floatText(p.x,p.y-40,__L3(`Conclua as ${__HUBD.length} masmorras primeiro`,`Complete the ${__HUBD.length} dungeons first`,`Completa las ${__HUBD.length} mazmorras primero`),"#e05a4a"):__portalPrompt(S,{levelId:p.__level,onConfirm:()=>__goLevel(S,p.__level)})}'
)

# 2. Intercepta a interação com portais regulares (saída de masmorra ou modo infinito)
rep(
    'n.kind==="hubportal"?__hubEnter(this,n.target):n.kind==="portal"?this.level.endless?this.descendEndless():this.transitionToNext():n.target.interact()',
    'n.kind==="hubportal"?__hubEnter(this,n.target):n.kind==="portal"?(this.level.endless?__portalPrompt(this,{levelId:"endless",depth:(this.endlessRun?.()?.depth||1)+1,onConfirm:()=>this.descendEndless()}):this.level.next?__portalPrompt(this,{levelId:this.level.next,onConfirm:()=>this.transitionToNext()}):this.transitionToNext()):n.target.interact()'
)

open(BUNDLE, "w", encoding="utf-8").write(s)
if os.path.isdir(os.path.dirname(MIRROR)):
    shutil.copyfile(BUNDLE, MIRROR)
print("OK — Confirmação e cálculo de dificuldade de portal aplicados com sucesso!")
