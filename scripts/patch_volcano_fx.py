"""
Vulcão: lava viva otimizada + ajuste de dificuldade balanceado.
Aplica em assets/ e Projeto atualizado/assets/:
  - Substitui __vcFx pelo código ultra otimizado de scripts/source/volcano-fx.js
  - Atualiza volcano_level.json (minions da caldeira removidos, afixos de elite suavizados)
  - Reduz HP e dano dos monstros de fogo (Golem de Magma, Draco Colérico)
  - Balanceia o Dragão Pálido (HP de 130 para 95, dano de mordida/garra/mergulho ajustado)
  - Aumenta o tempo de intervalo de dano de lava de 0.75s para 1.1s
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
LV = json.load(open(os.path.join(ROOT, "scripts", "volcano_level.json"), encoding="utf-8"))
FX = open(os.path.join(ROOT, "scripts", "source", "volcano-fx.js"), encoding="utf-8").read()
s = open(BUNDLE, encoding="utf-8").read()
J = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))
NAME = "Vulcão de Cinzas"

# 1) Definição da fase (rooms com minions da caldeira limpos e afixos suavizados)
a = s.index('vulcao:{id:"vulcao",')
b = s.index("next:null}", a) + len("next:null}")
s = s[:a] + (f'vulcao:{{id:"vulcao",name:"{NAME}",theme:{{...$n,id:"vulcao",name:"{NAME}"}},world:{J(LV["world"])},'
             f'rooms:{J(LV["rooms"])},corridors:{J(LV["corridors"])},doors:{J(LV["doors"])},playerSpawn:{J(LV["spawn"])},next:null}}') + s[b:]

# 2) Código dos efeitos otimizados (substitui __vcFx)
if "function __vcFx(" in s:
    start_fx = s.index("/* ── Vulcão de Cinzas:")
    end_fx = s.index("function __frBaked(B){")
    s = s[:start_fx] + s[end_fx:]

old_baked = "function __frBaked(B){"
assert s.count(old_baked) == 1
s = s.replace(old_baked, FX + "\n" + old_baked)

# 3) Balanceamento de monstros do Vulcão
# Golem de Magma: HP 16->11, Dano 3->2, Velocidade 70->60
s = re.sub(
    r'FIRE_ELEMENTAL:\{name:"Golem de Magma",texture:"mk3e-fire-elemental",sizeClass:"large",bodySize:20,speed:\d+,maxHp:\d+,damage:\d+',
    'FIRE_ELEMENTAL:{name:"Golem de Magma",texture:"mk3e-fire-elemental",sizeClass:"large",bodySize:20,speed:60,maxHp:11,damage:2',
    s
)

# Draco Colérico: HP 34->22, Dano 4->3, Velocidade 60->55
s = re.sub(
    r'DRAGON_DRAKE:\{name:"Draco Col[^"]+",texture:"mk3e-drake",sizeClass:"huge",bodySize:22,speed:\d+,maxHp:\d+,damage:\d+',
    'DRAGON_DRAKE:{name:"Draco Colérico",texture:"mk3e-drake",sizeClass:"huge",bodySize:22,speed:55,maxHp:22,damage:3',
    s
)

# Dragão Pálido: HP 130->95, contactDamage 4->2.5, speed 70->65, cooldown 1400->1600
s = re.sub(
    r'maxHp:\s*130,\s*contactDamage:\s*4,\s*speed:\s*70,\s*xp:\s*1800,\s*gold:\s*\{[^}]+\},\s*attackCooldownMs:\s*1400,',
    'maxHp: 95,\n  contactDamage: 2.5,\n  speed: 65,\n  xp: 1800,\n  gold: { min: 280, max: 450 },\n  attackCooldownMs: 1600,',
    s
)

# Dano dos ataques do dragão
s = s.replace('BITE: { damage: 4, range: 74', 'BITE: { damage: 3, range: 74')
s = s.replace('CLAW: { damage: 3, range: 66', 'CLAW: { damage: 2, range: 66')
s = s.replace('DIVE: { damage: 4, speed: 420', 'DIVE: { damage: 3, speed: 390')

# 4) Intervalo do dano de lava mais justo (0.75s -> 1.1s)
s = s.replace('this.tickTimer=.75,t.invuln=0', 'this.tickTimer=1.1,t.invuln=0')

# Salva nos dois bundles com garantia de paridade
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        with open(p, "w", encoding="utf-8") as f:
            f.write(s)
        print(f"[OK] Atualizado {p}")

print("[SUCCESS] Otimizações de performance e balanceamento de dificuldade do Vulcão aplicados com sucesso!")
