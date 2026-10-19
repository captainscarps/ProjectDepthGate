"""Desempenho (1): a camada de escuridão/luz (RenderTexture) tinha o tamanho do MAPA inteiro (até 1920x1600 ou mais)
e era limpa + pintada + recortada a cada quadro. Agora ela tem só o tamanho da tela (+ margem) e acompanha a câmera:
o mesmo visual com ~10x menos pixels por quadro.
Desempenho (2): minimapa sem refazer o texto do título a cada quadro. Re-executável."""
import os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
REPL = [
    ('this.rt=i.add.renderTexture(0,0,t,e).setOrigin(0).setDepth(1e3).setScrollFactor(1),this.stamp=i.make.image({key:"light",add:!1})}',
     'this.rt=null,this.__rw=0,this.__rh=0,this.__ox=0,this.__oy=0,this.stamp=i.make.image({key:"light",add:!1})}'),
    ('update(i){this.ambient+=(this.targetAmbient-this.ambient)*.04;const t=this.rt;t.clear();',
     'update(i){this.ambient+=(this.targetAmbient-this.ambient)*.04;/*__LTV__*/const _c=this.scene.cameras?.main,_v=_c?.worldView,_M=96,_nw=Math.ceil((_v?.width||640)+_M*2),_nh=Math.ceil((_v?.height||360)+_M*2);'
     'if(!this.rt||!this.rt.active||_nw>this.__rw||_nh>this.__rh||_nw<this.__rw-64||_nh<this.__rh-64){this.rt?.destroy();this.rt=this.scene.add.renderTexture(0,0,Math.ceil(_nw/2),Math.ceil(_nh/2)).setOrigin(0).setScale(2).setDepth(1e3).setScrollFactor(1);try{this.rt.texture?.setFilter?.(j.Textures.FilterMode.LINEAR)}catch(e){}this.__rw=_nw;this.__rh=_nh}'
     'const ox=this.__ox=Math.floor((_v?.x||0)-_M),oy=this.__oy=Math.floor((_v?.y||0)-_M),t=this.rt;t.setPosition(ox,oy);t.clear();'),
    ('this.stamp.setAlpha(d.intensity);t.erase(this.stamp,d.x,d.y);', 'this.stamp.setAlpha(d.intensity);t.erase(this.stamp,(d.x-ox)/2,(d.y-oy)/2);'),
    ('this.stamp.setScale(o*2/256);', 'this.stamp.setScale(o/256);'),
    # a vinheta da tela passa a ser pintada dentro da camada de luz (meia resolução) — um passe de tela cheia a menos
    ('d.glow.setAlpha(Math.max(.15,.32+gn));}}}}const ua={low:', 'd.glow.setAlpha(Math.max(.15,.32+gn));}}__ltVig(this,_v,ox,oy)}}function __ltVig(L,v,ox,oy){const S=L.scene;if(!v||!S.textures.exists("vignette"))return;L.__vimg||(L.__vimg=S.make.image({key:"vignette",add:!1}).setOrigin(.5).setAlpha(.55));L.__vimg.setDisplaySize(v.width*.65,v.height*.65);L.rt.draw(L.__vimg,(v.centerX-ox)/2,(v.centerY-oy)/2);window.__vigInRT=performance.now()}const ua={low:'),
    ('create(){Ss(this),this.textures.exists("vignette")&&this.add.image(_/2,st/2,"vignette").setDisplaySize(_*1.3,st*1.3).setDepth(40).setAlpha(.55),',
     'create(){Ss(this),this.textures.exists("vignette")&&(this.__vig=this.add.image(_/2,st/2,"vignette").setDisplaySize(_*1.3,st*1.3).setDepth(40).setAlpha(.55),this.events.on("update",()=>{this.__vig.setVisible(!(performance.now()-(window.__vigInRT||0)<400))})),'),
    # minimapa: o título era reajustado (texto refeito letra a letra) TODO quadro → 7 envios de textura por quadro.
    # Agora só quando o nome muda; e o desenho do mapa roda no máximo ~20x por segundo.
    ('redraw(i,t){const e=this.map;i.world&&this.setWorld(i.world.cols,i.world.rows)&&this.layout();const d=this.mapScale;e.clear(),__fit(this.title.setText(i.biome.toUpperCase()),this.width-12);',
     'redraw(i,t){const __n=performance.now();if(this.__rl&&__n-this.__rl<50)return;this.__rl=__n;const e=this.map;i.world&&this.setWorld(i.world.cols,i.world.rows)&&this.layout();const d=this.mapScale,__tk=i.biome+"|"+this.width;e.clear(),this.__tk!==__tk&&(this.__tk=__tk,__fit(this.title.setText(i.biome.toUpperCase()),this.width-12));'),
]
for old, new in REPL:
    if new not in s:
        assert s.count(old) == 1, old[:70]
        s = s.replace(old, new)
for p in (BUNDLE, MIRROR):
    open(p, "w", encoding="utf-8").write(s)
print("luz/escuridão do tamanho da tela aplicada")
