"""
Corrige o travamento dos chefes: o estado "attack" deixou de chamar doAttack() (substituído por um som
no commit ef3ff2e), então a investida (CHARGE) nunca terminava e o chefe ficava parado para sempre.
"""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
BAD = 'case"attack":window.__advancedAudio?.playNoiseBurst?.("32n");this.noiseHit({duration:.09,filter:"bandpass",freq:850,freqEnd:260,q:1.6,gain:.22,priority:1});break;'
GOOD = 'case"attack":this.doAttack(i,t);break;'
if BAD in s:
    assert s.count(BAD) == 1
    s = s.replace(BAD, GOOD)
    for p in (BUNDLE, MIRROR):
        if os.path.isdir(os.path.dirname(p)):
            open(p, "w", encoding="utf-8").write(s)
    print("estado de ataque dos chefes restaurado")
else:
    print("já corrigido" if 'case"recover":case"phase_transition"' in s and GOOD in s else "ATENÇÃO: trecho não encontrado")
