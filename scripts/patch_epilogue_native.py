"""
Epílogo ("O Caminho de Volta"): sem a magia da Guardiã, o herói volta a falar a própria língua.
  - ao entrar na volta (cena do rio com ret), a magia é desligada → as falas finais tocam a voz nativa
    (legenda continua no idioma do jogo); ao sair da cena a magia volta, para o resto do jogo não mudar;
  - a primeira fala da volta é nova: "Espera… essa é a minha língua. A magia da Guardiã se foi."
Re-executável (cada troca é pulada se já estiver aplicada).
  python3 scripts/patch_epilogue_native.py && node --check assets/index-D6qIWtA7-p209.js
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
SOURCE = os.path.join(ROOT, "scripts", "source", "arctic-prologue.js")   # mesmo código, para o patch do prólogo não desfazer

LANG = ('const __RETLANG=["Espera… essa é a minha língua. A magia da Guardiã se foi.",'
        '"Wait… this is my own language. The Guardian\'s magic is gone.",'
        '"Espera… esta es mi lengua. La magia de la Guardiana se ha ido."];')

def swap(old, new):
    global s
    if new in s:        # já aplicado
        return
    assert s.count(old) == 1, old[:60]
    s = s.replace(old, new)

for path in (SOURCE, BUNDLE):
    s = open(path, encoding="utf-8").read()
    swap('const __RETH={', LANG + 'const __RETH={')
    swap('if(!S.ret)window.__hasGuardianMagic=!1;',
         'if(!S.ret)window.__hasGuardianMagic=!1;else{window.__hasGuardianMagic=!1;'
         'S.events.once("shutdown",()=>{window.__hasGuardianMagic=!0})}')
    swap('S.time.delayedCall(3600,()=>S.mono("r0",L3(...__RET.r0)))',
         'S.time.delayedCall(3600,()=>{S.mono("lang",L3(...__RETLANG));S.mono("r0",L3(...__RET.r0))})')
    swap('try{window.__dubPrefetch?.(Object.values(__RET).map(a=>__L3(...a)))}catch(e){}',
         'try{window.__dubPrefetch?.([__L3(...__RETLANG)].concat(Object.values(__RET).map(a=>__L3(...a))))}catch(e){}')
    open(path, "w", encoding="utf-8").write(s)
print("epílogo nativo aplicado")
