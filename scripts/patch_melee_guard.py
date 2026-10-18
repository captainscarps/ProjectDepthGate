"""
Resistência dos corpo a corpo e escudo do Guerreiro.
  - Guerreiro (WARRIOR), Ladina (ROGUE), Samurai (BERSERKER) e Druida transformado (DRUID em forma
    de Lobisomem/Javali): dano de CONTATO (encostar em chefe
    ou inimigo) ×0.5 e +50% de invulnerabilidade depois de um golpe de contato.
  - Escudo do Guerreiro: defesa segurada deixa passar 15% (antes 40%), golpes pequenos podem ser
    bloqueados por completo ("BLOQUEADO"), empurrão reduzido; bloqueio passivo do escudo 25% (antes 40%).
Re-executável.
"""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
if "__meleeRes" in s:
    print("já aplicado")
    raise SystemExit(0)


def rep(old, new, n=1):
    global s
    c = s.count(old)
    assert c == n, f"esperava {n}, achei {c}: {old[:80]!r}"
    s = s.replace(old, new)


HELPER = ('const __MELEE_CLS=new Set(["WARRIOR","ROGUE","BERSERKER"]);'
          'function __meleeRes(p){if(p&&(__MELEE_CLS.has(p.__cls)||(p.__cls==="DRUID"&&p.scene?.__form))){p.__contactHit=!0;return .5}return 1}')

# guarda a classe no herói
rep('this.data_=cs,this.tex=d.texture,', 'this.data_=cs,this.__cls=d.id,this.tex=d.texture,')
# helper antes da classe do herói
rep('class oh extends j.Physics.Arcade.Sprite{constructor(i,t,e,d){', HELPER + 'class oh extends j.Physics.Arcade.Sprite{constructor(i,t,e,d){')
# contato com chefes (6 colisões: chefe, chefe 2, coop)
rep('amount:l.data_.contactDamage', 'amount:l.data_.contactDamage*__meleeRes(r)', 6)
# contato com inimigos comuns
rep('i.takeDamage(t.damage,{x:e/o,y:d/o})', 'i.takeDamage(t.damage*__meleeRes(i),{x:e/o,y:d/o})')

# escudo
rep('this.guarding&&(i=Math.max(1,Math.ceil(i*.4)),',
    'if(this.guarding&&this.__cls==="WARRIOR"){const g=i*.15;if(g<1&&Math.random()<1-g){this.__contactHit=!1;this.scene.effects?.burstTinted(this.x+this.facing.x*10,this.y-4,13488860,10);'
    'this.scene.audioRef?.play("sfx-shield-block");this.scene.playerVisual?.flashShield?.();this.scene.effects?.floatText(this.x,this.y-20,__L3("BLOQUEADO","BLOCKED","BLOQUEADO"),"#d8d0b8",9);'
    'this.invuln=Math.max(this.invuln,.25);return!1}i=Math.max(1,Math.ceil(g));t&&(t={x:t.x*.35,y:t.y*.35})}else '
    'this.guarding&&(i=Math.max(1,Math.ceil(i*.4)),')
rep('Math.random()*100<Math.min(60,d)&&(i=Math.max(1,Math.ceil(i*.4)),',
    'Math.random()*100<Math.min(60,d)&&(i=Math.max(1,Math.ceil(i*(this.__cls==="WARRIOR"?.25:.4))),')
rep('takeDamage(i,t){if(this.dead||this.invuln>0)return!1;', 'takeDamage(i,t){if(this.dead||this.invuln>0)return this.__contactHit=!1,!1;')
# invulnerabilidade maior após golpe de contato
rep('this.invuln=this.data_.invulnTime,', 'this.invuln=this.data_.invulnTime*(this.__contactHit?1.5:1),this.__contactHit=!1,')

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("resistência corpo a corpo e escudo aplicados")
