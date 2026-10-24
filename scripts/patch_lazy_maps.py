"""
Abrir o jogo mais rápido: os mapas grandes das fases (pedaços assados de 512 px: vulcão, deserto, bosque, ilhas,
floresta morta, glacial, floresta aberta, ruínas, castelo) não são mais baixados antes do menu.
  • na tela de carregamento eles só entram numa lista
  • depois que o menu abre, uma cena invisível ("LazyMaps") baixa a lista aos poucos, em segundo plano,
    enquanto o jogador está no menu / história / escolha de herói / vídeo / prólogo do rio
  • a cena da fase ("Game") espera o que ainda faltar antes de montar o mapa (nada fica sem textura)
Re-executável.
"""
import base64
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__LAZYMAP__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    s = s[:a] + s[b + len(T):]
SRC = r'''
const __LZ_RE=/^(vcb|dsb|bqb|rib|mtb|gsb|frb|frt|rfb|cab)-\d+-\d+$|^gsb-ext$/;window.__LAZY=window.__LAZY||[];
{const P0=bo.prototype.preload;bo.prototype.preload=function(){const ld=this.load,orig=ld.image;ld.image=function(k,u,...r){if(typeof k==="string"&&typeof u==="string"&&__LZ_RE.test(k)){window.__LAZY.push([k,u]);return ld}return orig.call(ld,k,u,...r)};try{return P0.apply(this,arguments)}finally{ld.image=orig}};
 const C0=bo.prototype.create;bo.prototype.create=function(){const r=C0?.apply(this,arguments);try{const G=this.game;if(window.__LAZY.length&&!G.scene.getScene("LazyMaps")){G.scene.add("LazyMaps",__LazyMaps,!0);G.scene.sendToBack("LazyMaps")}}catch(e){}return r}}
class __LazyMaps extends j.Scene{constructor(){super("LazyMaps")}
 create(){const S=this;S.load.maxParallelDownloads=3;let n=0;for(const[k,u]of window.__LAZY)if(!S.textures.exists(k)){S.load.image(k,u);n++}
  if(!n){window.__lazyDone=!0;return}S.load.once("complete",()=>{window.__lazyDone=!0});S.time.delayedCall(1200,()=>S.load.start())}}
/* a fase espera os mapas que ainda não chegaram */
Sd.prototype.preload=function(){for(const[k,u]of window.__LAZY||[])this.textures.exists(k)||this.load.image(k,u)};
'''
s = s + T + SRC + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("mapas das fases em segundo plano")
