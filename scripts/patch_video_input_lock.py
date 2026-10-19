"""Vídeos (abertura, etc.): enquanto o vídeo está na tela e por um instante depois que ele some,
as cenas do jogo por baixo (menu principal) não recebem clique/toque/tecla.
Antes, o toque/clique que pulava a abertura "vazava" para o menu e abria um submenu sozinho.
Re-executável."""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
FN = ('/*__VLOCK__*/function __vidLock(on){const G=window.__DED_GAME;if(!G)return;const L=window.__vlk||(window.__vlk={n:0,sc:[],t:0});'
      'if(on){L.n++;clearTimeout(L.t);for(const sc of G.scene.getScenes(!1)){const st_=sc.sys?.settings?.status??0;if(st_<2||st_>6)continue;const I=sc.input;if(!I||L.sc.includes(sc))continue;if(I.enabled!==!1||I.keyboard?.enabled!==!1){L.sc.push(sc);I.enabled=!1;I.keyboard&&(I.keyboard.enabled=!1)}}return}'
      'L.n=Math.max(0,L.n-1);if(L.n)return;clearTimeout(L.t);L.t=setTimeout(()=>{if(L.n)return;for(const sc of L.sc){const I=sc.input;if(!I||!sc.sys?.isActive?.())continue;I.enabled=!0;I.keyboard&&(I.keyboard.enabled=!0,I.keyboard.resetKeys?.())}L.sc=[]},650)}')
REPL = [
    ('root.appendChild(ov);', 'root.appendChild(ov);__vidLock(1);'),
    ('ov.remove(),o.onDone?.()},480)', 'ov.remove(),o.onDone?.(),__vidLock(0)},480)'),
    ('function __playVideos(list,o={}){', FN + 'function __playVideos(list,o={}){'),
]
for old, new in REPL:
    if new not in s:
        assert s.count(old) == 1, old[:60]
        s = s.replace(old, new)
for p in (BUNDLE, MIRROR):
    open(p, "w", encoding="utf-8").write(s)
print("trava de entrada durante vídeos aplicada")
