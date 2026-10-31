"""
Castelo de Valdrak em andares — planta (etapa 1: parte externa, térreo e subsolo).
Coordenadas em células de 32 px. rect = (x, y, w, h). Tudo que não é sala/corredor é parede (ou água/mata).
build_castle.py desenha o cenário e grava assets/castle2/castle-data.json; assets/castle-floors.js usa os dados.
"""

R = lambda x, y, w, h: {"x": x, "y": y, "w": w, "h": h}
E = lambda t, c, r, **k: dict(type=t, col=c, row=r, **k)
S = lambda tex, c, r, bw=20, bh=10, **k: dict(type="sprite", tex=tex, col=c, row=r, solid=True, bw=bw, bh=bh, **k)
F = lambda tex, c, r, **k: dict(type="sprite", tex=tex, col=c, row=r, solid=False, **k)
T = lambda c, r: dict(type="torch", col=c, row=r)

KEYS = {
    "castle_crank": {"pt": "Manivela Enferrujada", "en": "Rusty Crank", "es": "Manivela Oxidada",
                     "desc": ["Ergue a grade levadiça do portão.", "Raises the gate's portcullis.", "Levanta el rastrillo de la puerta."]},
    "castle_key_iron": {"pt": "Chave de Ferro", "en": "Iron Key", "es": "Llave de Hierro",
                        "desc": ["Abre a grade de ferro da ala oeste.", "Opens the iron gate of the west wing.", "Abre la reja de hierro del ala oeste."]},
    "castle_key_crest": {"pt": "Chave do Brasão", "en": "Crest Key", "es": "Llave del Blasón",
                         "desc": ["Leva o brasão dos Valdrak. Abre a porta da Sala do Trono.", "Bears the Valdrak crest. Opens the Throne Room door.", "Lleva el blasón de los Valdrak. Abre la puerta del Salón del Trono."]},
}

FLOORS = {}

# ═══════════════════════ PARTE EXTERNA ═══════════════════════
FLOORS["ext"] = {
    "name": ["Arredores do Castelo", "Castle Grounds", "Alrededores del Castillo"],
    "kind": "exterior", "W": 60, "H": 66,
    "spawn": {"col": 29, "row": 63},
    "castleRows": 32,             # acima desta linha o que não é chão é castelo; abaixo é mata
    "lake": {"cx": 10, "cy": 46, "rx": 6.5, "ry": 4.6},
    "moat": {"y": 32, "h": 4},
    "rooms": [
        {"id": "x-trilha", "name": "Trilha da Mata", "rect": R(27, 56, 6, 9), "ambient": .12, "floor": "path", "enemies": [], "decor": []},
        {"id": "x-clareira", "name": "Clareira", "rect": R(22, 50, 16, 6), "ambient": .14, "floor": "grass",
         "enemies": [E("SKELETON", 26, 52), E("SKELETON", 34, 53)],
         "decor": [F("fr-flower0", 24, 51), F("fr-flower2", 33, 54), S("fr-rock1", 36, 51, 14, 8)]},
        {"id": "x-cabana", "name": "Cabana do Guarda", "rect": R(3, 54, 14, 8), "ambient": .16, "floor": "grass",
         "enemies": [E("GOBLIN_ASSASSIN", 7, 57), E("SKELETON_ARCHER", 12, 59), E("GHOST", 9, 55)],
         "decor": [S("cx-barricade", 5, 55, 30, 10), S("cx-bucket", 14, 56, 12, 8), S("cx-rack", 11, 55, 26, 10), F("fr-flower1", 6, 60)]},
        {"id": "x-bosque", "name": "Bosque Leste", "rect": R(40, 44, 12, 8), "ambient": .16, "floor": "grass",
         "enemies": [E("SKELETON_WARRIOR", 46, 47), E("GHOST", 49, 49)],
         "decor": [S("cx-grave", 42, 45, 16, 8), S("cx-grave", 44, 45, 16, 8), S("cx-deadtree", 49, 45, 16, 8), F("fr-flower2", 47, 50)]},
        {"id": "x-margem", "name": "Margem do Fosso", "rect": R(10, 36, 40, 6), "ambient": .14, "floor": "grass",
         "enemies": [E("SKELETON", 18, 38), E("SKELETON_ARCHER", 40, 37)],
         "decor": [S("fr-rock0", 13, 37, 12, 8), S("fr-bush1", 45, 40, 16, 8), F("fr-flower0", 22, 40)]},
        {"id": "x-patio", "name": "Pátio de Armas", "rect": R(14, 12, 32, 12), "ambient": .18, "floor": "cobble",
         "enemies": [E("SKELETON_WARRIOR", 20, 18), E("SKELETON_WARRIOR", 39, 18), E("SKELETON_ARCHER", 24, 14), E("SKELETON_ARCHER", 36, 14)],
         "decor": [S("cx-knight", 17, 13, 16, 8), S("cx-knight", 42, 13, 16, 8), S("cx-obelisk", 30, 18, 18, 8),
                   S("cx-halberds", 16, 21, 22, 8), S("cx-urns", 44, 21, 20, 8), T(18, 11), T(41, 11)]},
    ],
    "corridors": [R(27, 42, 6, 8), R(36, 49, 5, 3), R(17, 51, 6, 3), R(14, 52, 4, 3), R(28, 32, 4, 4), R(29, 24, 2, 8), R(29, 10, 2, 2)],
    "bridge": R(28, 32, 4, 4),
    "gatehouse": {"x": 27, "y": 24},          # torre do portão (6x8) sobre a passagem (29..30)
    "keep": {"x": 27, "y": 1},                # fachada central (7x11) sobre a porta
    "stairs": [
        {"id": "keepdoor", "kind": "door", "col": 29, "row": 10, "w": 2, "h": 1, "to": "f0", "arrive": "hall",
         "label": ["Entrar no castelo", "Enter the castle", "Entrar al castillo"]},
    ],
    "arrive": {"keepdoor": {"col": 29, "row": 12}, "start": {"col": 29, "row": 63}},
    "doors": [
        {"id": "portcullis", "key": "castle_crank", "col": 29, "row": 30, "w": 2, "h": 2, "gfx": "cf-portcullis",
         "label": ["Grade levadiça — falta a manivela", "Portcullis — the crank is missing", "Rastrillo — falta la manivela"],
         "use": ["Encaixar a manivela e erguer a grade", "Fit the crank and raise the portcullis", "Encajar la manivela y alzar el rastrillo"],
         "open": ["A GRADE LEVADIÇA SE ERGUE", "THE PORTCULLIS RISES", "EL RASTRILLO SE ALZA"]},
    ],
    "items": [{"id": "castle_crank", "col": 8, "row": 56}],
    "saves": [{"col": 21, "row": 13}],
}

# ═══════════════════════ TÉRREO ═══════════════════════
FLOORS["f0"] = {
    "name": ["Térreo", "Ground Floor", "Planta Baja"],
    "kind": "interior", "floor": "grey", "W": 58, "H": 46,
    "spawn": {"col": 28, "row": 40},
    "rooms": [
        {"id": "t-salao", "name": "Grande Salão", "rect": R(20, 30, 18, 12), "ambient": .26, "carpet": R(27, 30, 4, 12),
         "enemies": [E("SKELETON_WARRIOR", 23, 34), E("SKELETON_WARRIOR", 34, 34)],
         "decor": [S("cx-column", 22, 32, 16, 8), S("cx-column", 35, 32, 16, 8), S("cx-column", 22, 38, 16, 8), S("cx-column", 35, 38, 16, 8),
                   S("cx-banquet", 31, 36, 40, 10), T(24, 29), T(33, 29)]},
        {"id": "t-arsenal", "name": "Arsenal", "rect": R(2, 30, 10, 10), "ambient": .3,
         "enemies": [E("ORC_BRUTE", 6, 34), E("SKELETON_WARRIOR", 9, 36), E("ORC_WARRIOR", 4, 37)],
         "decor": [S("cx-rack", 4, 31, 26, 10), S("cx-halberds", 8, 31, 22, 8), S("cx-axeblock", 10, 38, 18, 8), S("cx-barricade", 3, 38, 30, 10), T(3, 29), T(9, 29)]},
        {"id": "t-galeria", "name": "Galeria dos Heróis", "rect": R(46, 30, 10, 10), "ambient": .28,
         "enemies": [E("GHOST", 50, 34), E("SKELETON_ARCHER", 53, 37), E("SKELETON_WARRIOR", 48, 37)],
         "decor": [S("cx-knight", 47, 31, 16, 8), S("cx-knight", 50, 31, 16, 8), S("cx-angel", 47, 38, 18, 8), T(47, 29), T(54, 29)]},
        {"id": "t-capela", "name": "Capela Real", "rect": R(2, 14, 12, 10), "ambient": .36,
         "enemies": [E("SKELETON_MAGE", 5, 18), E("GHOST", 9, 20)],
         "decor": [S("cx-altar", 6, 15, 30, 10), S("cx-candles", 4, 15, 14, 8), S("cx-cross", 8, 21, 14, 8), T(4, 13), T(8, 13)]},
        {"id": "t-biblioteca", "name": "Biblioteca Proibida", "rect": R(44, 14, 12, 10), "ambient": .32, "floor": "wood",
         "enemies": [E("GHOST", 48, 18), E("DEMON_CASTER", 52, 20)],
         "decor": [S("cx-bookshelf", 45, 15, 30, 10), S("cx-bookshelf", 49, 15, 30, 10), S("cx-lectern", 47, 20, 16, 8), S("cx-globe", 54, 21, 16, 8), T(47, 13), T(51, 13)]},
        {"id": "t-antecamara", "name": "Antecâmara Real", "rect": R(22, 16, 14, 8), "ambient": .3,
         "enemies": [E("SKELETON_WARRIOR", 25, 19, elite=True), E("SKELETON_ARCHER", 33, 18), E("SKELETON_WARRIOR", 31, 21)],
         "decor": [S("cx-gargoyle", 23, 17, 18, 8), S("cx-gargoyle", 34, 17, 18, 8), T(25, 15), T(32, 15)]},
        {"id": "t-trono", "name": "Sala do Trono", "rect": R(18, 4, 22, 9), "ambient": .3, "carpet": R(27, 4, 4, 9),
         "boss": "CASTLE_LORD", "bossCol": 29, "bossRow": 7, "enemies": [],
         "decor": [S("cx-throne", 29, 4, 30, 10), S("cx-column", 20, 6, 16, 8), S("cx-column", 37, 6, 16, 8), S("cx-banners", 24, 4, 20, 6),
                   S("cx-banners", 34, 4, 20, 6), T(22, 3), T(26, 3), T(32, 3), T(36, 3)]},
    ],
    "corridors": [R(12, 34, 8, 3), R(38, 34, 8, 3), R(27, 24, 4, 6), R(27, 13, 4, 3), R(5, 24, 3, 6), R(49, 24, 3, 6), R(27, 42, 4, 1)],
    "stairs": [
        {"id": "exit", "kind": "door", "col": 27, "row": 42, "w": 4, "h": 1, "to": "ext", "arrive": "keepdoor",
         "label": ["Sair para o pátio", "Go out to the courtyard", "Salir al patio"]},
        {"id": "capela-down", "kind": "down", "col": 10, "row": 16, "to": "b1", "arrive": "escada",
         "label": ["Descer ao subsolo", "Go down to the basement", "Bajar al sótano"]},
        {"id": "galeria-down", "kind": "down", "col": 53, "row": 32, "to": "b1", "arrive": "passagem", "oneWay": "b1",
         "label": ["Descer ao subsolo", "Go down to the basement", "Bajar al sótano"],
         "blocked": ["Grade emperrada — parece abrir pelo outro lado", "Jammed grate — it seems to open from the other side", "Reja atascada — parece abrirse desde el otro lado"]},
    ],
    "arrive": {"hall": {"col": 28, "row": 40}, "capela-down": {"col": 9, "row": 19}, "galeria-down": {"col": 52, "row": 35}},
    "doors": [
        {"id": "irongate", "key": "castle_key_iron", "col": 5, "row": 26, "w": 3, "h": 1, "gfx": "cf-gate",
         "label": ["Grade de ferro trancada", "Locked iron gate", "Reja de hierro cerrada"],
         "use": ["Abrir com a Chave de Ferro", "Open with the Iron Key", "Abrir con la Llave de Hierro"],
         "open": ["A GRADE DE FERRO SE ABRE", "THE IRON GATE OPENS", "LA REJA DE HIERRO SE ABRE"]},
        {"id": "crestdoor", "key": "castle_key_crest", "col": 27, "row": 14, "w": 4, "h": 1, "gfx": "cf-crestdoor",
         "label": ["Porta do Trono — um brasão marca a fechadura", "Throne door — a crest marks the lock", "Puerta del Trono — un blasón marca la cerradura"],
         "use": ["Usar a Chave do Brasão", "Use the Crest Key", "Usar la Llave del Blasón"],
         "open": ["A PORTA DO TRONO SE ABRE", "THE THRONE DOOR OPENS", "LA PUERTA DEL TRONO SE ABRE"]},
    ],
    "items": [{"id": "castle_key_iron", "col": 3, "row": 32}],
    "saves": [{"col": 24, "row": 40}],
}

# ═══════════════════════ SUBSOLO ═══════════════════════
FLOORS["b1"] = {
    "name": ["Subsolo", "Basement", "Sótano"],
    "kind": "interior", "floor": "maroon", "W": 50, "H": 36,
    "spawn": {"col": 6, "row": 7},
    "rooms": [
        {"id": "s-escada", "name": "Escadaria do Porão", "rect": R(2, 5, 10, 8), "ambient": .42,
         "enemies": [], "decor": [S("cx-urns", 3, 11, 20, 8), S("cx-bucket", 10, 11, 12, 8), T(4, 4)]},
        {"id": "s-celas", "name": "Celas do Porão", "rect": R(20, 4, 14, 10), "ambient": .48,
         "enemies": [E("SKELETON", 23, 8), E("SKELETON", 30, 9), E("ORC_BRUTE", 27, 11), E("GHOST", 25, 6)],
         "decor": [S("cx-bunk", 21, 5, 26, 8), S("cx-bunk", 32, 5, 26, 8), S("cx-ballchain", 24, 12, 14, 8), S("cx-gibbet", 31, 12, 16, 8), T(23, 3), T(30, 3)]},
        {"id": "s-cripta", "name": "Cripta dos Reis", "rect": R(16, 22, 20, 10), "ambient": .5,
         "enemies": [E("SKELETON_WARRIOR", 21, 26, elite=True), E("SKELETON_MAGE", 30, 25), E("GHOST", 26, 29), E("SKELETON_WARRIOR", 33, 29)],
         "decor": [S("cx-sarcophagus", 19, 24, 30, 10), S("cx-sarcophagus", 31, 24, 30, 10), S("cx-coffin", 18, 30, 26, 8),
                   S("cx-coffin", 33, 30, 26, 8), S("cx-candles", 25, 23, 14, 8), T(20, 21), T(31, 21)]},
        {"id": "s-passagem", "name": "Passagem Esquecida", "rect": R(42, 19, 6, 12), "ambient": .5,
         "enemies": [E("GHOST", 44, 26)], "decor": [S("cx-urns", 43, 29, 20, 8)]},
    ],
    "corridors": [R(12, 7, 8, 3), R(25, 14, 3, 8), R(36, 25, 6, 3)],
    "stairs": [
        {"id": "escada", "kind": "up", "col": 6, "row": 3, "to": "f0", "arrive": "capela-down",
         "label": ["Subir ao térreo", "Go up to the ground floor", "Subir a la planta baja"]},
        {"id": "passagem", "kind": "up", "col": 44, "row": 17, "to": "f0", "arrive": "galeria-down", "opens": "galeria-down",
         "label": ["Subir ao térreo", "Go up to the ground floor", "Subir a la planta baja"]},
    ],
    "arrive": {"escada": {"col": 7, "row": 6}, "passagem": {"col": 45, "row": 20}},
    "doors": [],
    "items": [{"id": "castle_key_crest", "col": 26, "row": 25}],
    "saves": [{"col": 3, "row": 7}],
}

ORDER = ["ext", "f0", "b1", "f1", "top"]
FUTURE = {"f1": ["1º Andar", "1st Floor", "1.ª Planta"], "top": ["Torre", "Tower", "Torre"]}
