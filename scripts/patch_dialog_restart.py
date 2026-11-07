"""Diálogos que sumiam depois de recomeçar a campanha várias vezes.

1. A fala de abertura da Guardiã (__GINTRO) tinha 4 posições vazias no meio da lista (sobra de um
   patch antigo). Ao chegar nelas o __dlg quebrava ("reading 'who'") e a caixa travava até o
   jogador apertar várias vezes. As posições vazias são removidas, e o __dlg passa a pular entradas
   vazias em qualquer lista.
2. Quando um diálogo pedia vez enquanto outro estava aberto, ele esperava "dlg:closed" no emissor do
   jogo inteiro. Se a campanha recomeçasse antes disso, a espera não era cancelada: ao começar a
   próxima partida, todos os diálogos antigos acumulados (de cada recomeço) tocavam de uma vez, fora
   de ordem, e travavam o herói (uiOpen) — os diálogos certos da nova partida não apareciam.
   Agora a espera é cancelada quando a cena fecha e ignora o aviso se a cena não está mais ativa.
3. A cena UI é a mesma entre partidas: se um diálogo falhasse antes de montar a caixa, __dlgOpen ficava
   ligado para sempre e todo diálogo seguinte ficava esperando. Agora uma marca sem caixa viva é
   tratada como sobra e liberada.

Re-executável.
"""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js"),
]
REPL = [
    ('/*__LANG_REFINE__*/,\n,\n,\n,', '/*__LANG_REFINE__*/'),
    ('if(i>=list.length){end();return}const e=list[i];let who=e.who;',
     'if(i>=list.length){end();return}const e=list[i];if(!e){show();return}/*__DLGHOLE__*/let who=e.who;'),
    ('if(ui.__dlgOpen){S.game.events.once("dlg:closed",()=>S.time.delayedCall(250,()=>S.scene.isActive()&&__dlg(S,list,done)));return}',
     'if(ui.__dlgOpen){const __w=()=>{S.events.off("shutdown",__x);if(!S.sys?.isActive?.())return;'
     'S.time.delayedCall(250,()=>S.scene.isActive()&&__dlg(S,list,done))},'
     '__x=()=>S.game.events.off("dlg:closed",__w);'
     'S.game.events.once("dlg:closed",__w);S.events.once("shutdown",__x);return}/*__DLGWAIT__*/'),
    ('if(ui.__dlgOpen){const __w=',
     'if(ui.__dlgOpen&&!ui.__dlgR?.scene)ui.__dlgOpen=!1;/*__DLGSTALE__*/if(ui.__dlgOpen){const __w='),
    ('R.add(dim);let bg;', 'R.add(dim);ui.__dlgR=R;let bg;'),
]


def patch(path):
    s = open(path, encoding="utf-8").read()
    n = 0
    for old, new in REPL:
        if new in s and (old not in s or old in new):
            continue
        if s.count(old) != 1:
            raise SystemExit(f"padrão não encontrado em {path}: {old[:60]!r}")
        s = s.replace(old, new)
        n += 1
    open(path, "w", encoding="utf-8").write(s)
    print(f"{os.path.relpath(path, ROOT)}: {n} trocas")


for t in TARGETS:
    if os.path.isfile(t):
        patch(t)
