import os, sys, re, shutil

sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_FILE = os.path.join(ROOT, "assets", "infinite-skills-data.js")
MIRROR_DATA = os.path.join(ROOT, "Projeto atualizado", "assets", "infinite-skills-data.js")

with open(DATA_FILE, 'r', encoding='utf-8') as f:
    code = f.read()

# Helper to find icon by keywords in node id, name, desc, req
def pick_icon(nid, name, desc, req, cat):
    t = f"{nid} {name} {desc} {req}".lower()
    
    # Samurai / Ronin / Kensei
    if any(k in t for k in ["iaijutsu", "bainha", "saque"]): return "icon-iaijutsu"
    if any(k in t for k in ["kaze-giri", "vento cortante", "kaze", "corte do vento"]): return "icon-kaze-giri"
    if any(k in t for k in ["kiai", "brado", "grito de guerra"]): return "icon-kiai"
    if any(k in t for k in ["mikiri", "contra-ataque", "desvio perfeito"]): return "icon-mikiri"
    if any(k in t for k in ["tsumuji", "redemoinho de lâminas", "ciclone"]): return "icon-tsumuji"
    if any(k in t for k in ["kaishaku", "decapitar", "corte final", "execução"]): return "icon-kaishaku"
    
    # Warrior / Defense / Shield
    if "escudo" in t or "bloqueio" in t or "gide" in t or "defesa" in t:
        if "parede" in t or "muralha" in t: return "icon-shield-wall"
        if "golpe" in t or "impacto" in t or "estalo" in t: return "icon-shield-bash"
        if "contra" in t or "retaliação" in t: return "icon-shield-counter"
        return "icon-shield"
    if "ferro" in t or "armadura" in t or "pele" in t or "carapaça" in t: return "icon-iron-skin"
    if "redemoinho" in t or "giratório" in t or "turbilhão" in t: return "icon-whirlwind"
    if "pesado" in t or "esmagar" in t or "machado" in t: return "icon-heavy-strike"
    if "fúria" in t or "sangue" in t or "frenesi" in t: return "icon-bloodlust"
    if "demolir" in t or "romper" in t or "fraturar" in t: return "icon-demolish"
    
    # Rogue / Assassin / Shadow
    if "adaga" in t or "punhal" in t or "lâmina" in t:
        if "dupla" in t or "gêmeas" in t: return "icon-boreal-daggers"
        if "leque" in t or "múltiplas" in t: return "icon-fan-blades"
        return "icon-dagger"
    if "costas" in t or "emboscada" in t or "sorrateiro" in t: return "icon-backstab"
    if "sombra" in t or "escuridão" in t or "penumbra" in t:
        if "passo" in t or "teleporte" in t: return "icon-shadow-step"
        if "dança" in t: return "icon-shadow-dance"
        return "icon-shadow-strike"
    if "fumaça" in t or "invisível" in t or "névoa" in t: return "icon-smoke-bomb"
    if "sangramento" in t or "hemorragia" in t or "garrote" in t: return "icon-garrote"
    if "ruptura" in t or "rasgar" in t: return "icon-rupture"

    # Archer / Hunter
    if "arco" in t or "flecha" in t or "tiro" in t or "disparo" in t:
        if "chuva" in t or "rajada" in t or "salva" in t: return "icon-arrow-rain"
        if "explos" in t: return "icon-explosive-arrow"
        if "perfur" in t: return "icon-piercing-arrow"
        if "mira" in t or "precis" in t or "letal" in t: return "icon-aimed-shot"
        return "icon-multishot"
    if "armadilha" in t or "laço" in t or "imobiliz" in t: return "icon-snare"
    if "lobo" in t or "uivo" in t or "alcateia" in t: return "icon-wolf"
    if "águia" in t or "falcão" in t: return "icon-eagle"

    # Mage / Wizard
    if "fogo" in t or "chama" in t or "incêndio" in t or "calor" in t:
        if "meteoro" in t or "cometa" in t: return "icon-meteor"
        return "icon-fireball"
    if "gelo" in t or "geada" in t or "neve" in t or "congel" in t:
        if "coração" in t or "absoluto" in t: return "icon-frozen-heart"
        return "icon-ice-shard"
    if "arcano" in t or "mana" in t or "magia" in t or "energia" in t:
        if "raio" in t or "feixe" in t: return "icon-arcane-ray"
        if "explosão" in t: return "icon-arcane-blast"
        return "icon-arcane-orb"
    if "cajado" in t or "varinha" in t: return "icon-arcane-staff"

    # Shaman / Nature / Druid
    if "lobo" in t or "feral" in t or "transform" in t or "licantrop" in t: return "icon-lobisomem-form"
    if "javali" in t or "investida" in t: return "icon-javali-form"
    if "raiz" in t or "raízes" in t or "cipó" in t or "terra" in t: return "icon-roots"
    if "espinho" in t or "casca" in t or "madeira" in t: return "icon-thorns"
    if "natureza" in t or "floresta" in t or "planta" in t: return "icon-natures-wrath"

    # Necromancer / Death
    if "ceifar" in t or "foice" in t: return "icon-night-harvest"
    if "cadáver" in t or "corpo" in t or "explosão de cadáver" in t: return "icon-corpse-explosion"
    if "alma" in t or "sugar" in t or "dreno" in t: return "icon-soul-siphon"
    if "esqueleto" in t or "morto" in t or "invoc" in t: return "icon-skeleton-army"
    if "maldição" in t or "ruína" in t: return "icon-death-curse"
    if "osso" in t: return "icon-skull-scepter"

    # Paladin / Cleric / Holy
    if "sagrado" in t or "luz" in t or "divin" in t or "cura" in t or "santuário" in t:
        if "golpe" in t or "castigo" in t: return "icon-holy-smite"
        if "consagra" in t or "solo" in t: return "icon-consecration"
        if "julgamento" in t: return "icon-judgment"
        if "lança" in t: return "icon-divine-lance"
        return "icon-holy-nova"

    # Fallbacks by category
    if cat == "active": return "icon-sword"
    if cat == "nightmare": return "icon-doom"
    if cat == "apex": return "icon-aegis"
    return "icon-ring"

# Robust node parser matching each node object
def process_code(src):
    # Regex matching { "id": "...", ... up to "nav":
    pattern = re.compile(r'\{\s*"id":\s*"([^"]+)",(.*?)"desc":\s*"([^"]*)"', re.DOTALL)
    
    def repl(m):
        full = m.group(0)
        nid = m.group(1)
        body = m.group(2)
        desc = m.group(3)
        
        # Check if icon already present
        if '"icon":' in body:
            return full
            
        m_name = re.search(r'"name":\s*"([^"]+)"', body)
        name = m_name.group(1) if m_name else ""
        
        m_cat = re.search(r'"category":\s*"([^"]+)"', body)
        cat = m_cat.group(1) if m_cat else ""
        
        m_req = re.search(r'"req":\s*"([^"]*)"', body)
        req = m_req.group(1) if m_req else ""
        
        icon = pick_icon(nid, name, desc, req, cat)
        
        # Insert icon after "id": "...",
        return f'{{\n        "id": "{nid}",\n        "icon": "{icon}",{body}"desc": "{desc}"'

    return pattern.sub(repl, src)

new_code = process_code(code)

total_nodes = len(re.findall(r'\"id\":\s*\"', new_code))
nodes_with_icon = len(re.findall(r'\"icon\":\s*\"', new_code))
print(f"Total nodes: {total_nodes}")
print(f"Nodes with icon: {nodes_with_icon}")

with open(DATA_FILE, 'w', encoding='utf-8') as f:
    f.write(new_code)

shutil.copyfile(DATA_FILE, MIRROR_DATA)
print("Saved infinite-skills-data.js and mirror!")
