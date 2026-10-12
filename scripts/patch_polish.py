"""
Polimento (aplicar por último):
  • Inimigos não "tremem" parados/perto do herói: a animação de locomoção só troca
    depois de um instante (histerese) e o lado para onde olham só vira com movimento claro.
  • Xamã: textos sem "Pajé".
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
if "__locT" in s:
    print("já aplicado — nada a fazer")
    raise SystemExit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, f"esperava 1 ocorrência, achei {n}: {old[:90]!r}"
    s = s.replace(old, new)


# locomoção dos inimigos com histerese
rep('else if(Math.abs(a.x)>4||Math.abs(a.y)>4){const s=Math.hypot(a.x,a.y)>this.speed*.7&&this.scene.anims.exists(`${this.data_.texture}-run`)?"run":"walk";this.play(`${this.data_.texture}-${s}`,!0)}else this.play(`${this.data_.texture}-idle`,!0);',
    'else{const sp=Math.hypot(a.x,a.y);this.__spd=(this.__spd??sp)*.75+sp*.25;this.__locT=(this.__locT??0)-i;'
    'const w=this.__spd>16?(this.__spd>this.speed*.66&&this.scene.anims.exists(`${this.data_.texture}-run`)?"run":"walk"):"idle";'
    'if(w!==this.__loc&&(this.__locT<=0||!this.__loc)){this.__loc=w;this.__locT=.25}'
    'this.play(`${this.data_.texture}-${this.__loc??w}`,!0)}')
# só vira de lado com movimento horizontal claro, e no máximo a cada 0,18 s
rep('aiMove(i,t){this.setVelocity(i,t),i!==0&&this.setFlipX(i<0)}',
    'aiMove(i,t){this.setVelocity(i,t);const n=this.scene.time.now;'
    'Math.abs(i)>18&&(i<0)!==this.flipX&&n-(this.__flN??-1e4)>180&&(this.setFlipX(i<0),this.__flN=n)}')

# Xamã sem "Pajé"
rep('tagline:"Pajé e guerreira tupi: corta com a lâmina xamânica, comanda os espíritos da mata e invoca a fúria de Tupã."',
    'tagline:"Guerreira tupi e guardiã dos espíritos: corta com a lâmina xamânica, comanda os espíritos da mata e invoca a fúria de Tupã."')
rep('name:"Sopro do Pajé"', 'name:"Sopro dos Ancestrais"')
assert "Pajé" not in s

open(BUNDLE, "w", encoding="utf-8").write(s)
if os.path.isdir(os.path.dirname(MIRROR)):
    shutil.copyfile(BUNDLE, MIRROR)
print("OK — polimento (movimento dos inimigos, textos da Xamã)")
