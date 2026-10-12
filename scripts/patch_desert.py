"""
Santuário Esquecido → Deserto Esquecido (aplicar depois de patch_enemies.py).
Troca o mapa da fase "temple" pelo mapa assado gerado por build_desert_map.py.
"""
import json
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
LV = json.load(open(os.path.join(ROOT, "scripts", "desert_level.json"), encoding="utf-8"))
META = json.load(open(os.path.join(ROOT, "assets", "pixel-art", "newmaps", "dsb-meta.json")))
s = open(BUNDLE, encoding="utf-8").read()
if "dsb-meta" in s:
    print("já aplicado — nada a fazer")
    raise SystemExit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, f"esperava 1 ocorrência, achei {n}: {old[:90]!r}"
    s = s.replace(old, new)


J = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))

# 1) salas/portas do templo → deserto (mantém os nomes das variáveis)
a = s.index("tl_temple=[")
b = s.index("ol_temple=[", a)
e = s.index("}]", b) + 2
s = s[:a] + "tl_temple=" + J(LV["rooms"]) + ",ol_temple=" + J(LV["doors"]) + ",cl_desert=" + J(LV["corridors"]) + s[e:]

# 2) definição da fase
rep('temple:{id:"temple",name:"Santuário Esquecido",theme:{...Kn,id:"temple",name:"Santuário Esquecido",',
    'temple:{id:"temple",name:"Deserto Esquecido",theme:{...Kn,id:"temple",name:"Deserto Esquecido",')
rep('world:al,rooms:_e("temple",tl_temple),corridors:rl,doors:ol_temple,playerSpawn:ll,next:null}',
    f'world:{J(LV["world"])},rooms:_e("temple",tl_temple),corridors:cl_desert,doors:ol_temple,playerSpawn:{J(LV["spawn"])},next:null}}')

# 3) mapa assado
rep('P={forest:"frb",castle:"cab",bosque:"bqb",rio:"rib",morta:"mtb"}[B.level?.id]',
    'P={forest:"frb",castle:"cab",bosque:"bqb",rio:"rib",morta:"mtb",temple:"dsb"}[B.level?.id]')
rep('setBackgroundColor({cab:1315091,bqb:1056525,rib:2768250,mtb:1316888}[P]??1450010)',
    'setBackgroundColor({cab:1315091,bqb:1056525,rib:2768250,mtb:1316888,dsb:13140310}[P]??1450010)')
rep('if(["castle","bosque","rio","morta"].includes(i)&&__frBaked(this))return;',
    'if(["castle","bosque","rio","morta","temple"].includes(i)&&__frBaked(this))return;')
chunks = [f'"dsb-{x}-{y}"' for y in range(META["rows"]) for x in range(META["cols"])]
rep('const __NM_CHUNKS=["bqb-0-0",', 'const __NM_CHUNKS=[' + ",".join(chunks) + ',"bqb-0-0",')
rep('for(const P of["bqb","rib","mtb"])this.load.json(P+"-meta",`assets/pixel-art/newmaps/${P}-meta.json`);',
    'for(const P of["bqb","rib","mtb","dsb"])this.load.json(P+"-meta",`assets/pixel-art/newmaps/${P}-meta.json`);'
    f'for(const f of{J(LV["props"])})this.load.image(f,`assets/pixel-art/newmaps/${{f}}.png`);')

# 4) textos de abertura / encerramento
rep('temple:{title:"SANTUÁRIO ESQUECIDO",intro:["As colunas de mármore branco ainda resistem ao tempo.","Antes da corrupção, Lorde Valdrak orava neste templo sagrado da luz.","Mas o sangue de seus sacerdotes manchou os altares, aprisionando almas cultistas nas ruínas."],postBoss:["O Guardião Espectral foi libertado de sua penitência eterna.","O Cristal Sagrado do Santuário brilha em suas mãos, enfraquecendo os selos do Castelo de Valdrak."]}',
    'temple:{title:"DESERTO ESQUECIDO",intro:["A areia engoliu o antigo santuário da luz — só a pirâmide ainda aponta para o céu.","Antes da corrupção, Lorde Valdrak orava ali, no coração do deserto.","Hoje, almas de cultistas vagam entre o oásis seco e a vila soterrada."],postBoss:["O Guardião Espectral foi libertado de sua penitência eterna.","O Cristal Sagrado do Deserto brilha em suas mãos, enfraquecendo os selos do Castelo de Valdrak."]}')
rep('temple:{title:"FORGOTTEN SANCTUARY",intro:["The white marble columns still resist the passage of time.","Before his corruption, Lord Valdrak prayed at this sacred temple of light.","Yet the blood of his own priests stained the altars, binding cultist spirits to the ruins."],postBoss:["The Spectral Guardian has been freed from eternal penance.","The Sacred Sanctuary Crystal glows in your grasp, shattering the dark wards of Valdrak Castle."]}',
    'temple:{title:"FORGOTTEN DESERT",intro:["The sand swallowed the old sanctuary of light — only the pyramid still points to the sky.","Before his corruption, Lord Valdrak prayed there, in the heart of the desert.","Now cultist souls wander between the dry oasis and the buried village."],postBoss:["The Spectral Guardian has been freed from eternal penance.","The Sacred Desert Crystal glows in your grasp, shattering the dark wards of Valdrak Castle."]}')
rep('temple:{title:"SANTUARIO OLVIDADO",intro:["Las columnas de mármol blanco aún resisten el paso del tiempo.","Antes de su corrupción, Lord Valdrak rezaba en este templo sagrado de la luz.","Mas la sangre de sus sacerdotes manchó los altares, atrapando almas de cultistas en las ruínas."],postBoss:["El Guardián Espectral ha sido liberado de su penitencia eterna.","El Cristal Sagrado del Santuario brilla en tus manos, debilitando los sellos del Castillo de Valdrak."]}',
    'temple:{title:"DESIERTO OLVIDADO",intro:["La arena se tragó el antiguo santuario de la luz — solo la pirámide aún apunta al cielo.","Antes de su corrupción, Lord Valdrak rezaba allí, en el corazón del desierto.","Hoy, almas de cultistas vagan entre el oasis seco y la aldea sepultada."],postBoss:["El Guardián Espectral ha sido liberado de su penitencia eterna.","El Cristal Sagrado del Desierto brilla en tus manos, debilitando los sellos del Castillo de Valdrak."]}')

open(BUNDLE, "w", encoding="utf-8").write(s)
if os.path.isdir(os.path.dirname(MIRROR)):
    shutil.copyfile(BUNDLE, MIRROR)
print("OK — Deserto Esquecido")
