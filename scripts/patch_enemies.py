"""
Novos visuais de inimigos (aplicar depois de patch_fixes.py):
  • Goblins (normal, fundeiro, elite, do gelo) → pacote craftpix + recolorações
  • Antigo sprite do "Goblin de Elite" (era um orc) → Orc Guerreiro
  • Dragão Jovem → Mini Dragão (+ variantes do Gelo e Sombria, novas)
  • Sacerdote / Cavaleiro Dracônico → pacote Dracônicos
  • Lobo Glacial → Urso Glacial
  • Troll e Yeti → pacote "Troll e Yete" (verde-musgo / branco-gelo)
Folhas geradas por scripts/build_enemy_sheets.py.
"""
import json
import os
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
META = json.load(open(os.path.join(ROOT, "scripts", "enemy_sheets_v4.json")))
s = open(BUNDLE, encoding="utf-8").read()
if "goblin-v4.png" in s:
    print("já aplicado — nada a fazer")
    raise SystemExit(0)


def rep(old, new):
    global s
    n = s.count(old)
    assert n == 1, f"esperava 1 ocorrência, achei {n}: {old[:90]!r}"
    s = s.replace(old, new)


def ld(name):
    m = META[name]
    return f'"{name}.png",{m["w"]},{m["h"]}'


# ── carregamento das folhas ─────────────────────────────────────────────
rep('["mk3e-goblin","goblin-mk3.png",36,44]', f'["mk3e-goblin",{ld("goblin-v4")}]')
rep('["mk3e-goblin-archer","goblin-archer-mk3.png",36,44]', f'["mk3e-goblin-archer",{ld("goblin-archer-v4")}]')
rep('["mk3e-goblin-assassin","goblin-elite-v2.png",108,83]', f'["mk3e-goblin-assassin",{ld("goblin-elite-v4")}]')
rep('["mk3e-orc-warrior","orc-warrior-mk3.png",48,56]', '["mk3e-orc-warrior","goblin-elite-v2.png",108,83]')
rep('["mk3e-frost-goblin","frost-goblin-mk3.png",36,44]', f'["mk3e-frost-goblin",{ld("frost-goblin-v4")}]')
rep('["mk3e-wyrmling","wyrmling-mk3.png",46,42]',
    f'["mk3e-wyrmling",{ld("wyrmling-v4")}],["mk3e-wyrmling-frost",{ld("wyrmling-frost-v4")}],["mk3e-wyrmling-shadow",{ld("wyrmling-shadow-v4")}]')
rep('["mk3e-dragon-priest","dragon-priest-mk3.png",46,60]', f'["mk3e-dragon-priest",{ld("dragon-priest-v4")}]')
rep('["mk3e-dragon-knight","dragon-knight-mk3.png",50,62]', f'["mk3e-dragon-knight",{ld("dragon-knight-v4")}]')
rep('["mk3e-frost-wolf","frost-wolf-mk3.png",54,38]', f'["mk3e-frost-wolf",{ld("frost-bear-v4")}]')
import re
old = re.search(r'\["mk3e-frost-goblin-archer","frost-goblin-archer-mk3\.png",\d+,\d+\]', s).group(0)
rep(old, f'["mk3e-frost-goblin-archer",{ld("frost-goblin-archer-v4")}]')

rep('["mk3e-troll","troll-mk3.png",52,62]', f'["mk3e-troll",{ld("troll-v4")}]')
rep('["mk3e-yeti","yeti-mk3.png",56,66]', f'["mk3e-yeti",{ld("yeti-v4")}]')

rep('["mk3e-drake","drake-mk3.png",58,52]', f'["mk3e-drake",{ld("drake-v4")}]')
rep('["mk3e-ice-skeleton","ice-skeleton-mk3.png",44,52]', f'["mk3e-ice-skeleton",{ld("ice-skeleton-v4")}]')
rep('["mk3e-frost-demon","frost-demon-mk3.png",48,58]', f'["mk3e-frost-demon",{ld("frost-brute-v4")}]')

# ── escalas (altura na tela ≈ visível × Si × escala da classe) ──────────
GOB = 0.57  # mesma escala p/ todo o pacote de goblins → proporções coerentes
rep('"mk3e-goblin":.68,"mk3e-goblin-archer":.68,"mk3e-goblin-assassin":0.404,',
    f'"mk3e-goblin":{GOB},"mk3e-goblin-archer":{GOB},"mk3e-goblin-assassin":0.62,')
rep('"mk3e-orc-warrior":.71,', '"mk3e-orc-warrior":0.5,')
rep('"mk3e-drake":.69,', '"mk3e-drake":0.38,')
rep('"mk3e-ice-skeleton":.7,', '"mk3e-ice-skeleton":0.6,')
rep('"mk3e-frost-demon":.66', '"mk3e-frost-demon":0.64')
rep('FROST_DEMON:{name:"Demônio do Gelo",', 'FROST_DEMON:{name:"Bruto de Gelo",')
rep('"mk3e-troll":.68,', '"mk3e-troll":0.85,')
rep('"mk3e-yeti":.64,', '"mk3e-yeti":0.94,')
rep('"mk3e-wyrmling":.76,', '"mk3e-wyrmling":0.39,"mk3e-wyrmling-frost":0.39,"mk3e-wyrmling-shadow":0.39,')
rep('"mk3e-dragon-priest":.67,"mk3e-dragon-knight":.68,', '"mk3e-dragon-priest":0.515,"mk3e-dragon-knight":0.64,')
rep('"mk3e-frost-goblin":.68,"mk3e-frost-goblin-archer":.68,"mk3e-frost-wolf":.68,',
    f'"mk3e-frost-goblin":{GOB},"mk3e-frost-goblin-archer":{GOB},"mk3e-frost-wolf":0.6,')

# ── fundeiros: pedra no lugar da flecha ────────────────────────────────
rep('GOBLIN_ARCHER:{name:"Goblin Arqueiro",', 'GOBLIN_ARCHER:{name:"Goblin Fundeiro",')
rep('castMs:350,cooldownMs:1800,texture:"proj-arrow",tint:10537080,', 'castMs:350,cooldownMs:1800,texture:"proj-bolt",tint:9077358,')
rep('FROST_GOBLIN_ARCHER:{name:"Goblin Arqueiro do Gelo",', 'FROST_GOBLIN_ARCHER:{name:"Goblin Fundeiro do Gelo",')
rep('castMs:450,cooldownMs:2e3,texture:"proj-arrow",tint:10146032,', 'castMs:450,cooldownMs:2e3,texture:"proj-bolt",tint:10146032,')

# ── Urso Glacial (antigo Lobo Glacial) ─────────────────────────────────
rep('FROST_WOLF:{name:"Lobo Glacial",texture:"mk3e-frost-wolf",sizeClass:"small",bodySize:20,speed:135,maxHp:6,damage:2,hitFlashMs:100,behavior:"chase",'
    'ai:{detectionRange:260,loseTargetRange:400,attackRange:40,dashBurst:{minDist:90,maxDist:200,mult:2.4,durationMs:320,cooldownMs:2600},'
    'attacks:[{type:"MELEE_SLASH",damage:3,range:38,width:30,telegraphMs:320,recoverMs:450,cooldownMs:1500,sound:"sfx-frost-wolf-attack"}]},xp:75,',
    'FROST_WOLF:{name:"Urso Glacial",texture:"mk3e-frost-wolf",sizeClass:"medium",bodySize:24,speed:90,maxHp:14,damage:3,hitFlashMs:110,behavior:"chase",knockbackResist:.55,'
    'ai:{detectionRange:250,loseTargetRange:380,attackRange:48,dashBurst:{minDist:90,maxDist:190,mult:2.1,durationMs:380,cooldownMs:3400},'
    'attacks:[{type:"MELEE_SLASH",damage:4,range:46,width:42,telegraphMs:430,recoverMs:560,cooldownMs:1800,sound:"sfx-frost-wolf-attack"}]},xp:110,')

# ── sopro colorido / com status (para as variantes de dragão) ──────────
rep('d.telegraphs.rect(a,n,i.length,i.width,o,i.telegraphMs,16738846,()=>{c.finishTelegraph(i,()=>{for(let r=0;r<6;r++){const l=(r/5-.5)*i.length;d.effects.burstTinted(a+Math.cos(o)*l,n+Math.sin(o)*l,r%2?16738846:16761418,8)}',
    'd.telegraphs.rect(a,n,i.length,i.width,o,i.telegraphMs,i.colors?.[0]??16738846,()=>{c.finishTelegraph(i,()=>{for(let r=0;r<6;r++){const l=(r/5-.5)*i.length;d.effects.burstTinted(a+Math.cos(o)*l,n+Math.sin(o)*l,r%2?(i.colors?.[0]??16738846):(i.colors?.[1]??16761418),8)}')
rep('d.damageSystem.apply({source:e,target:s,amount:c.attackDamage(i),dir:{x:Math.cos(o),y:Math.sin(o)}})})})},BUFF_ALLIES(',
    'd.damageSystem.apply({source:e,target:s,amount:c.attackDamage(i),dir:{x:Math.cos(o),y:Math.sin(o)},status:i.status??null})})})},BUFF_ALLIES(')

# ── novas variantes de Dragão Jovem ────────────────────────────────────
WY = re.search(r'DRAGON_WYRMLING:\{name:"Dragão Jovem".*?anims:At\}', s).group(0)
frost = (WY.replace('DRAGON_WYRMLING:{name:"Dragão Jovem"', 'DRAGON_WYRMLING_FROST:{name:"Dragão Jovem do Gelo"')
           .replace('"mk3e-wyrmling"', '"mk3e-wyrmling-frost"')
           .replace('type:"FIRE_BREATH",damage:3,', 'type:"FIRE_BREATH",colors:[10146032,15138815],status:{key:"SLOW",duration:1.8},damage:3,')
           .replace('"dragon_sword","ember_bow","inferno_staff","dragon_armor","ember_amulet",', '"long_bow","arcane_staff","ring","amulet","boots",'))
shadow = (WY.replace('DRAGON_WYRMLING:{name:"Dragão Jovem"', 'DRAGON_WYRMLING_SHADOW:{name:"Dragão Jovem Sombrio"')
            .replace('"mk3e-wyrmling"', '"mk3e-wyrmling-shadow"')
            .replace('type:"FIRE_BREATH",damage:3,', 'type:"FIRE_BREATH",colors:[9447935,12886271],damageType:"magical",damage:3,')
            .replace('"dragon_sword","ember_bow","inferno_staff","dragon_armor","ember_amulet",', '"dagger","arcane_staff","ring","amulet","dragon_armor",'))
assert frost != WY and shadow != WY and frost.count("colors") == 1 and shadow.count("colors") == 1
rep(WY, WY + "," + frost + "," + shadow)

# facções do modo infinito, emboscadas e salas fixas
rep('{type:"FROST_WOLF",cost:3,minDepth:7},', '{type:"FROST_WOLF",cost:4,minDepth:7},{type:"DRAGON_WYRMLING_FROST",cost:5,minDepth:10},')
rep('members:[{type:"DEMON",cost:4,minDepth:3},{type:"DEMON_CASTER",cost:5,minDepth:5}]',
    'members:[{type:"DEMON",cost:4,minDepth:3},{type:"DEMON_CASTER",cost:5,minDepth:5},{type:"DRAGON_WYRMLING_SHADOW",cost:5,minDepth:9}]')
rep('frozen:["ICE_SKELETON","FROST_WOLF","FROST_GOBLIN"]', 'frozen:["ICE_SKELETON","FROST_WOLF","FROST_GOBLIN","DRAGON_WYRMLING_FROST"]')
rep('{type:"FROST_WOLF",col:48,row:34}', '{type:"FROST_WOLF",col:48,row:34},{type:"DRAGON_WYRMLING_FROST",col:52,row:34}')
rep('{type:"DEMON",col:31,row:20}', '{type:"DEMON",col:31,row:20},{type:"DRAGON_WYRMLING_SHADOW",col:30,row:22}')

# ── Orc comum sai: o Orc Guerreiro aparece no lugar dele ────────────
rep('members:[{type:"ORC",cost:4,minDepth:4},{type:"ORC_WARRIOR",cost:5,minDepth:6},',
    'members:[{type:"ORC_WARRIOR",cost:5,minDepth:4},')
s = re.sub(r'(type"?:)"ORC"(?=[,}])', r'\1"ORC_WARRIOR"', s)
rep('ruins:["GOBLIN","ORC","GOBLIN_ARCHER"]', 'ruins:["GOBLIN","ORC_WARRIOR","GOBLIN_ARCHER"]')
left = [m.start() for m in re.finditer(r'"ORC"', s)]
print("referências restantes a \"ORC\":", [s[i-40:i+20] for i in left])

# ── ciclos completos de andar/correr (movimento mais fluido) ───────────
TEX = {"mk3e-goblin": "goblin-v4", "mk3e-goblin-archer": "goblin-archer-v4", "mk3e-goblin-assassin": "goblin-elite-v4",
       "mk3e-frost-goblin": "frost-goblin-v4", "mk3e-frost-goblin-archer": "frost-goblin-archer-v4",
       "mk3e-wyrmling": "wyrmling-v4", "mk3e-wyrmling-frost": "wyrmling-frost-v4", "mk3e-wyrmling-shadow": "wyrmling-shadow-v4",
       "mk3e-dragon-priest": "dragon-priest-v4", "mk3e-dragon-knight": "dragon-knight-v4", "mk3e-frost-wolf": "frost-bear-v4",
       "mk3e-troll": "troll-v4", "mk3e-yeti": "yeti-v4", "mk3e-drake": "drake-v4", "mk3e-frost-demon": "frost-brute-v4"}
for key, sh in TEX.items():
    m = META.get(sh, {})
    if not m.get("walk"):
        continue
    w = m["walk"]
    r = m.get("run") or w
    anim = ('anims:{...At,walk:{frames:%s,frameRate:%d,repeat:-1},run:{frames:%s,frameRate:%d,repeat:-1}}'
            % (json.dumps(w), max(10, round(len(w) / .62)), json.dumps(r), max(13, round(len(r) / .5))))
    n = 0
    for mm in list(re.finditer(r'texture:"%s",' % re.escape(key), s)):
        i = mm.end()
        j = s.find("anims:At}", i)
        nxt = s.find("texture:\"mk3e-", i)
        if j < 0 or (0 <= nxt < j):
            continue
        s = s[:j] + anim + "}" + s[j + len("anims:At}"):]
        n += 1
    assert n >= 1, key

open(BUNDLE, "w", encoding="utf-8").write(s)
if os.path.isdir(os.path.dirname(MIRROR)):
    shutil.copyfile(BUNDLE, MIRROR)
print("OK — novos sprites de inimigos")
