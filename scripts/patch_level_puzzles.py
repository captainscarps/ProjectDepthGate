"""
Enigmas em todas as outras fases da campanha (Deserto, Catacumbas, Ruínas, Fortaleza, Profundezas Amazônicas,
Ilhas, Floresta Morta e Vulcão): quatro enigmas por fase + Relicário Selado com um acessório lendário único.
As peças são posicionadas na hora, só em chão livre, sem nada do cenário na frente e sem fechar passagem.
Código em scripts/source/level-puzzles.js. Aplicar depois de patch_glacial_puzzles.py (usa as texturas dele).
Re-executável (bloco com marcador e texto original em base64).
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
SRC = open(os.path.join(ROOT, "scripts", "source", "level-puzzles.js"), encoding="utf-8").read()
T = "/*__PZL__*/"


def strip_all():
    global s
    while T in s:
        a = s.index(T)
        b = s.index(T, a + 1)
        inner = s[a + len(T):b]
        k = inner.rindex("/*§")
        orig = base64.b64decode(inner[k + 3:inner.rindex("*/")]).decode("utf-8")
        s = s[:a] + orig + s[b + len(T):]


strip_all()


def put(old, new):
    global s
    assert s.count(old) == 1, old[:80]
    s = s.replace(old, T + new + "/*§" + base64.b64encode(old.encode("utf-8")).decode() + "*/" + T, 1)


# código no fim do módulo (funções e itens; o jogo só chama depois de tudo carregado)
s = s + T + "\n" + SRC + "\n/*§*/" + T
# monta os enigmas logo depois que a fase termina de construir paredes e objetos
put("this.map=i,this}", "__pzAuto(this),this.map=i,this}")

# ícones dos acessórios (amuleto com gema na cor da fase)
ICONS = {"sun_eye": ("#7a4a08", "#ffc93c", "#fff3b0"), "ancients_lantern": ("#3a2a6a", "#b58cff", "#efe2ff"),
         "lock_sigil": ("#5a4a2a", "#e8c878", "#fff6d8"), "warden_scale": ("#6a1a10", "#ff6a3c", "#ffd2b8"),
         "anhanga_seed": ("#1a4a20", "#6ee070", "#dcffd0"), "tide_pearl": ("#123a6a", "#6cc8ff", "#e8f8ff"),
         "dead_bell": ("#3a3a52", "#c8c0f0", "#ffffff"), "ember_core": ("#6a1800", "#ff7a22", "#ffe0a0")}
ic = ""
for k, (a, b, c) in ICONS.items():
    ic += ('vt(c,"icon-pz-%s",i=>{i.strokeStyle="#c9a24a",i.lineWidth=1,i.beginPath(),i.moveTo(4,2),i.quadraticCurveTo(10,9,16,2),i.stroke(),'
           'i.fillStyle="%s",i.beginPath(),i.arc(10,12,6.5,0,Math.PI*2),i.fill(),i.fillStyle="%s",i.beginPath(),i.arc(10,12,5,0,Math.PI*2),i.fill(),'
           'i.fillStyle="%s",i.fillRect(7,9,3,2),i.fillRect(8,8,1,1),i.fillStyle="#c9a24a",i.fillRect(9,4,2,2)}),') % (k, a, b, c)
put('vt(c,"icon-shadow-dagger",', ic + 'vt(c,"icon-shadow-dagger",')

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("enigmas nas outras fases aplicados")
