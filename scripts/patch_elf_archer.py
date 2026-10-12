"""
Arqueiro élfico em resolução dobrada (aplicar depois de patch_guardian.py).
Telas que mostram o herói com escala fixa passam a respeitar layout.hires;
o retrato do HUD usa o recorte do rosto do layout (pcrop); flecha verde do pacote.
"""
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
if "__hrS" in s:
    print("já aplicado — nada a fazer")
    raise SystemExit(0)


def rep(old, new, count=1):
    global s
    n = s.count(old)
    assert n == count, f"esperava {count}, achei {n}: {old[:90]!r}"
    s = s.replace(old, new)


# helper global (antes de ql)
rep('function ql(c,i,t){const e=jl[i.type];',
    'function __hrS(sc,key){try{return sc.cache.json.get(`${key}-layout`)?.hires??1}catch(e){return 1}}'
    'function __hrPor(sc,img,key,s0){const L=sc.cache.json.get(`${key}-layout`),c=L?.pcrop;'
    'c?img.setCrop(c[0],c[1],c[2],c[3]).setScale(s0*22/c[2]).setOrigin((c[0]+c[2]/2)/128,(c[1]+c[2]/2)/128)'
    ':img.setCrop(53,52,22,22).setScale(s0).setOrigin(64/128,63/128);return img}'
    'function ql(c,i,t){const e=jl[i.type];')
# lista de saves / perfis
rep('sp=this.add.sprite(x+CW/2,y+86,key,0).setOrigin(.5,(J?.footY??119)/128).setScale(1.1);',
    'sp=this.add.sprite(x+CW/2,y+86,key,0).setOrigin(.5,(J?.footY??119)/128).setScale(1.1*(J?.hires??1));')
# seleção de classe
rep('h.setTexture(d,0).setVisible(!0).setOrigin(.5,(J?.footY??119)/128),',
    'h.setTexture(d,0).setVisible(!0).setOrigin(.5,(J?.footY??119)/128).setScale(2*(J?.hires??1)),')
# retratos do HUD (P1 e P2)
rep('this.por.setTexture(key,0);this.por.setCrop(53,52,22,22).setScale(2).setOrigin(64/128,63/128).setPosition(35,35)',
    'this.por.setTexture(key,0);__hrPor(this.s,this.por,key,2).setPosition(35,35)')
rep('this.por2.setTexture(p2Key,0);this.por2.setCrop(53,52,22,22).setScale(2).setOrigin(64/128,63/128);',
    'this.por2.setTexture(p2Key,0);__hrPor(this.s,this.por2,p2Key,2);')
# cutscene (herói em escala fixa 1.3)
rep('i.hero=i.add.sprite(t/2-30,252,r).setScale(1.3).play(`${r}-idle`)',
    'i.hero=i.add.sprite(t/2-30,252,r).setScale(1.3*__hrS(i,r)).play(`${r}-idle`)')
# ecos do passado
rep('.setScale(npc?ph*1.6/71:P?.scaleX||1)', '.setScale(npc?ph*1.6/71:(P?.scaleX||1)*__hrS(S,tex))')
# flecha verde do elfo
rep('basicProjectile:{texture:"proj-arrow",speed:440,maxDist:280,damageType:"physical",tint:14209730}',
    'basicProjectile:{texture:"proj-elf-arrow",speed:440,maxDist:280,damageType:"physical"}')
rep('this.load.spritesheet("boss-minotaur",',
    'this.load.image("proj-elf-arrow","assets/pixel-art/characters/proj-elf-arrow.png");this.load.spritesheet("boss-minotaur",')

# Arqueiro: Hayato, irmão do samurai Akihiro
rep('ARCHER:"Vaelen",', 'ARCHER:"Hayato",')
rep('ARCHER:"Vaelen: “', 'ARCHER:"Hayato: “')

open(BUNDLE, "w", encoding="utf-8").write(s)
if os.path.isdir(os.path.dirname(MIRROR)):
    shutil.copyfile(BUNDLE, MIRROR)
print("OK — arqueiro élfico (alta resolução)")
