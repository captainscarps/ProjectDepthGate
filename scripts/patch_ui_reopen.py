"""
Painel que "some" e deixa o jogo congelado (ex.: Relicário Selado, lápides, qualquer objeto com [X] Examinar).

Causa: o mesmo aperto do botão que FECHA o painel (X/Enter) ainda contava como "interagir" no quadro seguinte
da fase (o controle é lido pela tela de interface, depois da fase). O objeto abria o painel de novo na hora,
mas a animação de fechar, ainda rodando, terminava escondendo o painel — e o jogo ficava pausado esperando um
painel invisível; só Start → voltar destravava.

Correção:
  • depois que qualquer painel fecha, a fase ignora "interagir" por 0,35 s e pelo menos 3 quadros (celular lento) (vale para loja, baú, guardiã etc.)
  • o painel de história não pode ser escondido pela animação antiga se for reaberto
Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__UIREOPEN__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    inner = s[a + len(T):b]
    k = inner.rindex("/*§")
    s = s[:a] + base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8") + s[b + len(T):]


def put(old, new):
    global s
    assert s.count(old) == 1, (s.count(old), old[:80])
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T, 1)


# fase: guarda quando a interface fechou
put("onInventoryToggle(i){if(this.uiOpen=i,",
    "onInventoryToggle(i){i||(this.__uiClosedAt=performance.now(),this.__uiClosedF=this.game.loop.frame);if(this.uiOpen=i,")
# fase: o aperto que fechou o painel não reabre o objeto
put('this.inputMgr?.justDown("INTERACT")&&(n.kind==="item"?',
    'this.inputMgr?.justDown("INTERACT")&&!(performance.now()-(this.__uiClosedAt||0)<350||this.game.loop.frame-(this.__uiClosedF??-99)<4)&&(n.kind==="item"?')
# painel de história: abrir cancela a animação de fechar
put('onStoryShow({title:i,lines:t}){if(this.game.registry.get("mode")==="endless")return;',
    'onStoryShow({title:i,lines:t}){if(this.game.registry.get("mode")==="endless")return;this.tweens.killTweensOf(this.storyPanel);')
put("this.storyPanel.visible&&(this.tweens.add({targets:this.storyPanel,alpha:0,duration:260,onComplete:()=>this.storyPanel.setVisible(!1)}),",
    "this.storyPanel.visible&&(this.tweens.killTweensOf(this.storyPanel),this.tweens.add({targets:this.storyPanel,alpha:0,duration:260,onComplete:()=>this.storyPanel.setVisible(!1)}),")
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("painel não reabre com o mesmo aperto")
