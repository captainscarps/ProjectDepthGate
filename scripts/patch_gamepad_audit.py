"""
Varredura de controle (gamepad) no jogo todo:
  - telas que só escutam o teclado (escolha do final, epílogo, vídeos, cinemática de abertura) ligam a "ponte"
    que converte botões em teclas, mesmo com a fase em andamento (antes ficavam mortas no controle)
  - telas que já leem o controle sozinhas (diálogos, painéis de visão) não recebem mais o mesmo botão duas vezes
    (o A pulava falas)
Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__PADAUD__*/"
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


UP = 'window.__padUI=(window.__padUI||0)+1;'
DN = 'window.__padUI=Math.max(0,(window.__padUI||0)-1);'
BR = 'window.__DED_GAME?.inputManager?.bridgeActive?.()'
# diálogos e painéis: se a ponte já converte os botões, não lê o controle de novo
put('const pad=()=>{const g=navigator.getGamepads?.()?.find?.(p=>p);const a=!!(g&&(g.buttons[0]?.pressed||g.buttons[1]?.pressed));',
    'const pad=()=>{const g=navigator.getGamepads?.()?.find?.(p=>p);const a=!!(g&&(g.buttons[0]?.pressed||g.buttons[1]?.pressed));if(' + BR + '){pv=a;return}')
put('const pad=()=>{const g=navigator.getGamepads?.()?.find?.(q=>q);const a=!!(g&&(g.buttons[0]?.pressed||g.buttons[1]?.pressed)),b=!!(g&&(g.buttons[9]?.pressed||g.buttons[8]?.pressed));',
    'const pad=()=>{const g=navigator.getGamepads?.()?.find?.(q=>q);const a=!!(g&&(g.buttons[0]?.pressed||g.buttons[1]?.pressed)),b=!!(g&&(g.buttons[9]?.pressed||g.buttons[8]?.pressed));if(' + BR + '){pv=a;pv2=b;return}')
# escolha final
put('window.addEventListener("keydown",key);let gone=!1;const pick=()=>{if(gone)return;gone=!0;window.removeEventListener("keydown",key);',
    'window.addEventListener("keydown",key);' + UP + 'let gone=!1;const pick=()=>{if(gone)return;gone=!0;window.removeEventListener("keydown",key);' + DN)
# epílogo
put('window.addEventListener("keydown",key);bg.on("pointerdown",end)}', 'window.addEventListener("keydown",key);' + UP + 'bg.on("pointerdown",end)}')
put('window.removeEventListener("keydown",key),bg.off("pointerdown")', 'window.removeEventListener("keydown",key),' + DN + 'bg.off("pointerdown")')
# vídeos (abertura e final do herói)
put('window.addEventListener("keydown",key,!0)},o.skipDelay??700)', 'window.addEventListener("keydown",key,!0),ov.__pu||(ov.__pu=1,' + UP[:-1] + ')},o.skipDelay??700)')
put('window.removeEventListener("keydown",key,!0),ov.style.opacity="0"', 'window.removeEventListener("keydown",key,!0),ov.__pu&&(ov.__pu=0,' + DN[:-1] + '),ov.style.opacity="0"')
# cinemática de abertura
put('window.addEventListener("keydown", onKeyDown);', 'window.addEventListener("keydown", onKeyDown); ' + UP)
put('window.removeEventListener("keydown", onKeyDown);', 'window.removeEventListener("keydown", onKeyDown); ' + DN)

# dica do epílogo também fala do controle
put('"ENTER / CLIQUE PARA CONTINUAR"', '"A / ENTER / CLIQUE PARA CONTINUAR"')

for p in (BUNDLE, MIRROR):
    open(p, "w", encoding="utf-8").write(s)
print("gamepad: telas de teclado e diálogos ajustados")
