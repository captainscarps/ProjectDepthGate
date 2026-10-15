"""
Vulcão de Cinzas — 10º portal do hub. Aplica-se sobre o bundle ATUAL (edições diretas são preservadas).
Requer: build_volcano_map.py (chunks vcb-*, props vc-*, volcano_level.json) e build_magma_titan.py.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
LV = json.load(open(os.path.join(ROOT, "scripts", "volcano_level.json"), encoding="utf-8"))
META = json.load(open(os.path.join(ROOT, "assets", "pixel-art", "newmaps", "vcb-meta.json")))
s = open(BUNDLE, encoding="utf-8").read()
if "vcb-meta" in s:
    print("já aplicado — nada a fazer")
    raise SystemExit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, f"esperava 1 ocorrência, achei {n}: {old[:90]!r}"
    s = s.replace(old, new)


J = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))
NAME = "Vulcão de Cinzas"

# 1) definição da fase (tema da Fortaleza: fogo, música e paleta quentes)
rep('fortress:{id:"fortress",name:"Fortaleza dos Dragões",theme:$n,world:pl,rooms:_e("fortress",vl),corridors:ml,doors:gl,playerSpawn:yl,next:null}',
    'fortress:{id:"fortress",name:"Fortaleza dos Dragões",theme:$n,world:pl,rooms:_e("fortress",vl),corridors:ml,doors:gl,playerSpawn:yl,next:null},'
    f'vulcao:{{id:"vulcao",name:"{NAME}",theme:{{...$n,id:"vulcao",name:"{NAME}"}},world:{J(LV["world"])},rooms:{J(LV["rooms"])},'
    f'corridors:{J(LV["corridors"])},doors:{J(LV["doors"])},playerSpawn:{J(LV["spawn"])},next:null}}')

# 2) mapa assado
rep('P={forest:"frb",castle:"cab",bosque:"bqb",rio:"rib",morta:"mtb",temple:"dsb"}[B.level?.id]',
    'P={forest:"frb",castle:"cab",bosque:"bqb",rio:"rib",morta:"mtb",temple:"dsb",vulcao:"vcb"}[B.level?.id]')
rep('setBackgroundColor({cab:1315091,bqb:1056525,rib:2768250,mtb:1316888,dsb:13140310}[P]??1450010)',
    'setBackgroundColor({cab:1315091,bqb:1056525,rib:2768250,mtb:1316888,dsb:13140310,vcb:1183502}[P]??1450010)')
rep('if(["castle","bosque","rio","morta","temple"].includes(i)&&__frBaked(this))return;',
    'if(["castle","bosque","rio","morta","temple","vulcao"].includes(i)&&__frBaked(this))return;')
chunks = [f'"vcb-{x}-{y}"' for y in range(META["rows"]) for x in range(META["cols"])]
rep('const __NM_CHUNKS=[', 'const __NM_CHUNKS=[' + ",".join(chunks) + ",")
rep('for(const P of["bqb","rib","mtb","dsb"])this.load.json(P+"-meta",`assets/pixel-art/newmaps/${P}-meta.json`);',
    'for(const P of["bqb","rib","mtb","dsb","vcb"])this.load.json(P+"-meta",`assets/pixel-art/newmaps/${P}-meta.json`);'
    f'for(const f of{J(LV["props"])})this.load.image(f,`assets/pixel-art/newmaps/${{f}}.png`);')
# passagens: obsidiana que brota do chão ao trancar
rep('(i.level?.theme?.id??i.dungeon?.level?.theme?.id??i.levelId)==="temple"&&i.textures.exists("ds-thorn-h")&&(this.modelKey=null,this.__thorn=!0,this.setTexture(e?"ds-thorn-h":"ds-thorn-v"),this.setAlpha(0))',
    '(i.level?.theme?.id??i.dungeon?.level?.theme?.id??i.levelId)==="temple"&&i.textures.exists("ds-thorn-h")&&(this.modelKey=null,this.__thorn=!0,this.setTexture(e?"ds-thorn-h":"ds-thorn-v"),this.setAlpha(0)),'
    '!a&&(i.level?.theme?.id??i.dungeon?.level?.theme?.id??i.levelId)==="vulcao"&&i.textures.exists("vc-thorn-h")&&(this.modelKey=null,this.__thorn=!0,this.setTexture(e?"vc-thorn-h":"vc-thorn-v"),this.setAlpha(0))')

# 3) hub: 10º portal, cristal, cor, posição
rep('const __HUBD=["temple","catacombs","ruins","glacial","fortress","bosque","rio","morta"]',
    'const __HUBD=["temple","catacombs","ruins","glacial","fortress","bosque","rio","morta","vulcao"]')
rep('morta:"crystal_morta"}', 'morta:"crystal_morta",vulcao:"crystal_vulcao"}')
rep('morta:11179730}', 'morta:11179730,vulcao:16734754}')
rep('morta:[.8,.22]}', 'morta:[.8,.22],vulcao:[.42,.5]}')
rep('crystal_fortress:{name:"Cristal Dracônico",type:"quest",icon:"icon-crys-fortress",minRarity:"LEGENDARY",stats:{},value:0,desc:"Item de missão: não pode ser vendido nem descartado."}',
    'crystal_fortress:{name:"Cristal Dracônico",type:"quest",icon:"icon-crys-fortress",minRarity:"LEGENDARY",stats:{},value:0,desc:"Item de missão: não pode ser vendido nem descartado."},'
    'crystal_vulcao:{name:"Cristal de Magma",type:"quest",icon:"icon-crys-fortress",minRarity:"LEGENDARY",stats:{},value:0,desc:"Item de missão: não pode ser vendido nem descartado."}')

# 4) dificuldade
rep('fortress:4,bosque:1,rio:2,morta:3}', 'fortress:4,bosque:1,rio:2,morta:3,vulcao:3.5}')
rep('fortress: 8,', 'fortress: 8,\n    vulcao: 8,')
rep('fortress:  { hp: 34, dmg: 4.8, bHp: 240, bDmg: 6.2, bNm: "Dragão Ancião" },',
    'fortress:  { hp: 34, dmg: 4.8, bHp: 240, bDmg: 6.2, bNm: "Dragão Ancião" },\n    vulcao:    { hp: 32, dmg: 4.6, bHp: 220, bDmg: 6.0, bNm: "Titã de Magma" },')

# 5) chefe: Titã de Magma (variante de obsidiana do Golem de Lava)
rep('for(const t of Object.values(Yt))if(t.implemented!==!1)for(const[e,d]of Object.entries(t.anims))i(t.texture,e,d);',
    'Yt.MAGMA_TITAN||(Yt.MAGMA_TITAN={...Yt.LAVA_GOLEM,name:"Titã de Magma",subtitle:"O Coração do Vulcão",texture:"boss-magma-titan",'
    'scale:2.35,bodySize:34,maxHp:78,speed:58,phase2:{...Yt.LAVA_GOLEM.phase2,tint:16746570}});'
    'for(const t of Object.values(Yt))if(t.implemented!==!1)for(const[e,d]of Object.entries(t.anims))i(t.texture,e,d);')
rep('this.load.spritesheet("boss-lava-golem","assets/pixel-art/bosses/boss-lava-golem.png",{frameWidth:128,frameHeight:128});',
    'this.load.spritesheet("boss-lava-golem","assets/pixel-art/bosses/boss-lava-golem.png",{frameWidth:128,frameHeight:128});'
    'this.load.spritesheet("boss-magma-titan","assets/pixel-art/bosses/boss-magma-titan.png",{frameWidth:128,frameHeight:128});')
rep('"boss.LAVA_GOLEM":"Lava Golem"', '"boss.LAVA_GOLEM":"Lava Golem","boss.MAGMA_TITAN":"Magma Titan"')
rep('"boss.LAVA_GOLEM":"Gólem de Lava"', '"boss.LAVA_GOLEM":"Gólem de Lava","boss.MAGMA_TITAN":"Titán de Magma"')
rep('LAVA_GOLEM:["A areia guarda o que é meu. Volte ao pó.","O fogo… volta… para a terra…"]',
    'LAVA_GOLEM:["A areia guarda o que é meu. Volte ao pó.","O fogo… volta… para a terra…"],'
    'MAGMA_TITAN:["A montanha respira através de mim. Ajoelhe-se ou derreta.","A chama… adormece… mas não morre…"]')

# 6) textos de abertura / encerramento
PT = ('vulcao:{title:"VULCÃO DE CINZAS",intro:["O portal se abriu no flanco de um vulcão que nunca dormiu de verdade.",'
      '"A cinza cai como neve escura, e rios de lava cortam a rocha em fendas sem fundo.",'
      '"Lá no alto, na caldeira, algo grande se move junto com o magma."],'
      'postBoss:["O Titã de Magma se parte em obsidiana fria.","O Cristal de Magma pulsa em suas mãos, enfraquecendo os selos do Castelo de Valdrak."]},')
EN = ('vulcao:{title:"ASHEN VOLCANO",intro:["The portal opened on the flank of a volcano that never truly slept.",'
      '"Ash falls like dark snow, and rivers of lava carve the rock into bottomless rifts.",'
      '"High above, in the caldera, something huge moves with the magma."],'
      'postBoss:["The Magma Titan shatters into cold obsidian.","The Magma Crystal throbs in your hands, weakening the seals of Valdrak Castle."]},')
ES = ('vulcao:{title:"VOLCÁN DE CENIZA",intro:["El portal se abrió en la ladera de un volcán que nunca durmió del todo.",'
      '"La ceniza cae como nieve oscura, y ríos de lava cortan la roca en grietas sin fondo.",'
      '"Allá arriba, en la caldera, algo enorme se mueve con el magma."],'
      'postBoss:["El Titán de Magma se rompe en obsidiana fría.","El Cristal de Magma late en tus manos, debilitando los sellos del Castillo de Valdrak."]},')
rep('fortress:{title:"FORTALEZA DOS DRAGÕES"', PT + 'fortress:{title:"FORTALEZA DOS DRAGÕES"')
rep('fortress:{title:"DRAGON FORTRESS"', EN + 'fortress:{title:"DRAGON FORTRESS"')
rep('fortress:{title:"FORTALEZA DE LOS DRAGONES"', ES + 'fortress:{title:"FORTALEZA DE LOS DRAGONES"')

for p in (BUNDLE, MIRROR):
    if os.path.exists(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("vulcão aplicado")
