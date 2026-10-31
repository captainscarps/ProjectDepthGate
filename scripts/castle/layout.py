"""
Castelo de Valdrak em andares — planta (etapa 1: parte externa, térreo e subsolo).
Coordenadas em células de 32 px. rect = (x, y, w, h). Tudo que não é sala/corredor é parede (ou água/mata).
Adereços (P) usam o catálogo de art.py: (nome, col, linha) = centro da base em células (frações valem).
Adereços de parede (W) ficam pendurados: (nome, col, linha) = centro da base, na face da parede.
build_castle.py desenha o cenário e grava assets/castle2/castle-data.json; assets/castle-floors.js usa os dados.
"""

R = lambda x, y, w, h: {"x": x, "y": y, "w": w, "h": h}
E = lambda t, c, r, **k: dict(type=t, col=c, row=r, **k)
T = lambda c, r: dict(type="torch", col=c, row=r)
P = lambda n, c, r, **k: dict(p=n, c=c, r=r, **k)

KEYS = {
    "castle_crank": {"pt": "Manivela Enferrujada", "en": "Rusty Crank", "es": "Manivela Oxidada",
                     "desc": ["Ergue a grade levadiça do portão.", "Raises the gate's portcullis.", "Levanta el rastrillo de la puerta."]},
    "castle_key_iron": {"pt": "Chave de Ferro", "en": "Iron Key", "es": "Llave de Hierro",
                        "desc": ["Abre a grade de ferro da ala oeste.", "Opens the iron gate of the west wing.", "Abre la reja de hierro del ala oeste."]},
    "castle_key_crest": {"pt": "Chave do Brasão", "en": "Crest Key", "es": "Llave del Blasón",
                         "desc": ["Leva o brasão dos Valdrak. Abre a porta da Sala do Trono.", "Bears the Valdrak crest. Opens the Throne Room door.", "Lleva el blasón de los Valdrak. Abre la puerta del Salón del Trono."]},
}

NAMES = {
    "x-trilha": ["Trilha da Mata", "Forest Trail", "Sendero del Bosque"], "x-clareira": ["Clareira", "Clearing", "Claro"],
    "x-cabana": ["Cabana do Guarda", "Guard's Hut", "Cabaña del Guardia"], "x-bosque": ["Bosque dos Túmulos", "Grave Grove", "Arboleda de las Tumbas"],
    "x-margem": ["Margem do Fosso", "Moat Bank", "Orilla del Foso"], "x-patio": ["Pátio de Armas", "Bailey", "Patio de Armas"],
    "t-salao": ["Grande Salão", "Great Hall", "Gran Salón"], "t-arsenal": ["Arsenal", "Armory", "Arsenal"],
    "t-galeria": ["Galeria dos Heróis", "Hall of Heroes", "Galería de los Héroes"], "t-capela": ["Capela Real", "Royal Chapel", "Capilla Real"],
    "t-biblioteca": ["Biblioteca Proibida", "Forbidden Library", "Biblioteca Prohibida"], "t-antecamara": ["Antecâmara Real", "Royal Antechamber", "Antecámara Real"],
    "t-trono": ["Sala do Trono", "Throne Room", "Salón del Trono"], "s-escada": ["Escadaria do Porão", "Cellar Stairs", "Escalera del Sótano"],
    "s-celas": ["Celas do Porão", "Cellar Cells", "Celdas del Sótano"], "s-cripta": ["Cripta dos Reis", "Crypt of Kings", "Cripta de los Reyes"],
    "s-passagem": ["Passagem Esquecida", "Forgotten Passage", "Pasaje Olvidado"],
}

FLOORS = {}

# ═══════════════════════ PARTE EXTERNA ═══════════════════════
# trilhas: polilinhas (células) pintadas como terra batida com borda irregular
FLOORS["ext"] = {
    "name": ["Arredores do Castelo", "Castle Grounds", "Alrededores del Castillo"],
    "kind": "exterior", "W": 60, "H": 68,
    "spawn": {"col": 30, "row": 65},
    "castleRows": 32,
    "lake": {"cx": 10, "cy": 46, "rx": 6.5, "ry": 4.4},
    "moat": {"y": 32, "h": 4},
    "paths": [
        {"w": 2.4, "pts": [(30, 67), (30.5, 61), (29.4, 56), (30.2, 51), (29.6, 46), (30, 41), (29.5, 37), (29.5, 32)]},
        {"w": 1.7, "pts": [(29.8, 54), (25, 55.2), (19, 56.4), (13, 57.4), (9.5, 57.6)]},
        {"w": 1.6, "pts": [(30.2, 50.5), (36, 49.6), (41, 48.2), (46, 47.4)]},
        {"w": 1.5, "pts": [(29.6, 39), (23, 38.6), (16, 38.8)]},
    ],
    "rooms": [
        {"id": "x-trilha", "rect": R(28, 57, 5, 10), "ambient": 0.24, "enemies": [], "decor": []},
        {"id": "x-clareira", "rect": R(23, 49, 15, 7), "ambient": 0.26,
         "enemies": [E("SKELETON", 26, 52), E("SKELETON", 34, 53)], "decor": []},
        {"id": "x-cabana", "rect": R(4, 54, 13, 7), "ambient": 0.28,
         "enemies": [E("GOBLIN_ASSASSIN", 7, 57), E("SKELETON_ARCHER", 12, 59), E("GHOST", 9, 55)], "decor": [T(5, 54), T(15, 54)]},
        {"id": "x-bosque", "rect": R(41, 44, 11, 7), "ambient": 0.28,
         "enemies": [E("SKELETON_WARRIOR", 46, 47), E("GHOST", 49, 49)], "decor": []},
        {"id": "x-margem", "rect": R(12, 36, 36, 5), "ambient": 0.26,
         "enemies": [E("SKELETON", 18, 38), E("SKELETON_ARCHER", 40, 38)], "decor": []},
        {"id": "x-patio", "rect": R(14, 13, 32, 11), "ambient": 0.30,
         "enemies": [E("SKELETON_WARRIOR", 20, 18), E("SKELETON_WARRIOR", 39, 18), E("SKELETON_ARCHER", 24, 15), E("SKELETON_ARCHER", 36, 15)],
         "decor": [T(19, 13), T(40, 13), T(26, 13), T(33, 13)]},
    ],
    "corridors": [R(28, 41, 4, 8), R(37, 48, 5, 4), R(16, 54, 8, 3), R(28, 32, 3, 4), R(28, 24, 3, 8), R(29, 11, 2, 2)],
    "bridge": R(28, 32, 3, 4),
    "props": [
        # cabana do guarda
        P("rack", 7, 55.2), P("bucket", 13.6, 55.4), P("stones", 15.2, 59.6), P("rubble-s", 5.2, 60.2), P("axeblock", 10.6, 55.3),
        # bosque dos túmulos
        P("grave", 43, 45.2), P("grave", 45.4, 45.2), P("cross", 47.8, 45.3), P("grave", 50, 45.4), P("deadtree", 51, 50.4),
        # margem
        P("stones", 14, 39.8), P("rubble-s", 44.6, 40.2),
        # pátio
        P("knight", 17.5, 14.4), P("knight", 42.5, 14.4), P("obelisk", 30, 19.2), P("halberds", 16.6, 22.6), P("urns", 43.2, 22.6),
        P("pillar-short", 26.6, 23.4), P("pillar-short", 33.4, 23.4),
    ],
    "stairs": [
        {"id": "keepdoor", "kind": "door", "col": 29, "row": 12, "w": 2, "h": 1, "to": "f0", "arrive": "hall",
         "label": ["Entrar no castelo", "Enter the castle", "Entrar al castillo"]},
    ],
    "arrive": {"keepdoor": {"col": 29, "row": 14}, "start": {"col": 30, "row": 65}},
    "doors": [
        {"id": "portcullis", "key": "castle_crank", "col": 28, "row": 30, "w": 3, "h": 2, "gfx": "cf-portcullis",
         "label": ["Grade levadiça — falta a manivela", "Portcullis — the crank is missing", "Rastrillo — falta la manivela"],
         "use": ["Encaixar a manivela e erguer a grade", "Fit the crank and raise the portcullis", "Encajar la manivela y alzar el rastrillo"],
         "open": ["A GRADE LEVADIÇA SE ERGUE", "THE PORTCULLIS RISES", "EL RASTRILLO SE ALZA"]},
    ],
    "items": [{"id": "castle_crank", "col": 8, "row": 58}],
    "saves": [{"col": 21, "row": 15}],
}

# ═══════════════════════ TÉRREO ═══════════════════════
FLOORS["f0"] = {
    "name": ["Térreo", "Ground Floor", "Planta Baja"],
    "kind": "interior", "floor": "grey", "W": 58, "H": 46,
    "spawn": {"col": 28, "row": 40},
    "rooms": [
        {"id": "t-salao", "rect": R(20, 30, 18, 12), "ambient": 0.38, "carpet": R(27, 30, 4, 12),
         "enemies": [E("SKELETON_WARRIOR", 24, 35), E("SKELETON_WARRIOR", 34, 35)], "decor": [T(22, 29), T(36, 29)]},
        {"id": "t-arsenal", "rect": R(2, 30, 10, 10), "ambient": 0.42, "floor": "maroon",
         "enemies": [E("ORC_BRUTE", 6, 35), E("SKELETON_WARRIOR", 9, 37), E("ORC_WARRIOR", 4, 37)], "decor": [T(3, 29), T(10, 29)]},
        {"id": "t-galeria", "rect": R(46, 30, 10, 10), "ambient": 0.40,
         "enemies": [E("GHOST", 50, 35), E("SKELETON_ARCHER", 53, 38), E("SKELETON_WARRIOR", 48, 37)], "decor": [T(47, 29), T(54, 29)]},
        {"id": "t-capela", "rect": R(2, 14, 12, 10), "ambient": 0.48, "carpet": R(7, 16, 2, 8),
         "enemies": [E("SKELETON_MAGE", 5, 19), E("GHOST", 10, 21)], "decor": [T(3, 13), T(12, 13)]},
        {"id": "t-biblioteca", "rect": R(44, 14, 12, 10), "ambient": 0.44, "floor": "wood",
         "enemies": [E("GHOST", 48, 19), E("DEMON_CASTER", 52, 20)], "decor": [T(45, 13), T(55, 13)]},
        {"id": "t-antecamara", "rect": R(22, 16, 14, 8), "ambient": 0.42,
         "enemies": [E("SKELETON_WARRIOR", 25, 20, elite=True), E("SKELETON_ARCHER", 33, 19), E("SKELETON_WARRIOR", 31, 21)], "decor": [T(24, 15), T(34, 15)]},
        {"id": "t-trono", "rect": R(18, 4, 22, 9), "ambient": 0.42, "floor": "maroon", "carpet": R(27, 9, 4, 4),
         "boss": "CASTLE_LORD", "bossCol": 29, "bossRow": 8, "enemies": [], "decor": [T(20, 3), T(24, 3), T(34, 3), T(38, 3)]},
    ],
    "corridors": [R(12, 34, 8, 3), R(38, 34, 8, 3), R(27, 24, 4, 6), R(27, 13, 4, 3), R(5, 24, 3, 6), R(49, 24, 3, 6), R(27, 42, 4, 1)],
    "props": [
        # Grande Salão: colunas, mesa do banquete, bandeiras e armaduras
        P("pillar", 22, 32.4), P("pillar", 22, 38.4), P("pillar", 36, 32.4), P("pillar", 36, 38.4),
        P("chair", 33.2, 36.0), P("chair", 34.6, 36.0), P("banquet", 34, 37.2), P("candles", 31.8, 37.0),
        P("chair", 23.4, 36.0), P("chair", 24.8, 36.0), P("banquet", 24.2, 37.2),
        P("knight", 25.4, 41.6), P("knight", 32.6, 41.6),
        P("banner", 21.6, 30, wall=1), P("banner", 25.5, 30, wall=1), P("banner", 32.5, 30, wall=1), P("banner", 36.4, 30, wall=1),
        P("shield", 23.6, 29.4, wall=1), P("shield", 34.4, 29.4, wall=1),
        # Arsenal
        P("halberds", 4.4, 31.3), P("rack", 8.4, 31.3), P("axeblock", 10.4, 38.6), P("rubble-s", 2.8, 39.4),
        P("shield-pole", 3.1, 30, wall=1), P("swords", 6.4, 29.5, wall=1), P("kite", 10.6, 29.6, wall=1), P("kite-b", 11.4, 29.6, wall=1),
        # Galeria dos Heróis: estátuas em fila sob estandartes
        P("knight", 47.6, 31.5), P("knight", 50.4, 31.5), P("angel", 47.8, 39.6), P("gargoyle", 55, 39.6),
        P("banner", 47.6, 30, wall=1), P("banner", 50.4, 30, wall=1), P("swords2", 53.6, 29.5, wall=1),
        # Capela: altar, velas, anjos e bancos de pedra
        P("altar", 8, 15.5), P("candles", 5.4, 15.4), P("candles", 10.6, 15.4), P("angel", 3.4, 16.4), P("angel", 12.6, 16.4),
        P("candles", 5.2, 19.6), P("candles", 10.8, 19.6), P("urns", 3.4, 22.6), P("cross", 12.4, 22.6),
        P("win-tall", 4.5, 14, wall=1), P("gem-arch", 8, 14, wall=1), P("win-tall", 11.5, 14, wall=1),
        # Biblioteca
        P("bookshelf", 46, 15.3), P("bookshelf", 48.9, 15.3), P("bookshelf", 51.8, 15.3), P("bookshelf", 54.6, 15.3),
        P("keytable", 47, 21.4), P("lectern", 50.4, 19.6), P("globe", 54.2, 21.6), P("hourglass", 45.2, 22.6), P("potions", 53.6, 17.8),
        # Antecâmara
        P("gargoyle", 23.4, 17.4), P("gargoyle", 34.6, 17.4), P("pillar-b", 26.2, 17.2), P("pillar-b", 31.8, 17.2),
        P("shield-pole", 24.6, 16, wall=1), P("shield-pole", 33.4, 16, wall=1),
        # Sala do Trono: estrado, trono, colunas de gemas
        P("dais", 29, 11.3, under=1), P("throne", 29, 7.6),
        P("pillar-gem", 20, 7.2), P("pillar-gem", 20, 11.6), P("pillar-gem", 38, 7.2), P("pillar-gem", 38, 11.6),
        P("gem-panel", 22.5, 4, wall=1), P("gem-panel", 35.5, 4, wall=1), P("banner", 26, 4, wall=1), P("banner", 32, 4, wall=1),
    ],
    "stairs": [
        {"id": "exit", "kind": "door", "col": 27, "row": 42, "w": 4, "h": 1, "to": "ext", "arrive": "keepdoor",
         "label": ["Sair para o pátio", "Go out to the courtyard", "Salir al patio"]},
        {"id": "capela-down", "kind": "down", "col": 2, "row": 21, "to": "b1", "arrive": "escada",
         "label": ["Descer ao subsolo", "Go down to the basement", "Bajar al sótano"]},
        {"id": "galeria-down", "kind": "down", "col": 53, "row": 31, "to": "b1", "arrive": "passagem", "oneWay": "b1",
         "label": ["Descer ao subsolo", "Go down to the basement", "Bajar al sótano"],
         "blocked": ["Grade emperrada — parece abrir pelo outro lado", "Jammed grate — it seems to open from the other side", "Reja atascada — parece abrirse desde el otro lado"]},
    ],
    "arrive": {"hall": {"col": 28, "row": 40}, "capela-down": {"col": 4, "row": 21}, "galeria-down": {"col": 53, "row": 34}},
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
    "items": [{"id": "castle_key_iron", "col": 6, "row": 36}],
    "saves": [{"col": 24, "row": 40}],
}

# ═══════════════════════ SUBSOLO ═══════════════════════
FLOORS["b1"] = {
    "name": ["Subsolo", "Basement", "Sótano"],
    "kind": "interior", "floor": "maroon", "W": 50, "H": 36,
    "spawn": {"col": 6, "row": 7},
    "rooms": [
        {"id": "s-escada", "rect": R(2, 5, 10, 8), "ambient": 0.54, "enemies": [], "decor": [T(4, 4), T(10, 4)]},
        {"id": "s-celas", "rect": R(20, 4, 14, 10), "ambient": 0.60,
         "enemies": [E("SKELETON", 23, 8), E("SKELETON", 30, 9), E("ORC_BRUTE", 27, 11), E("GHOST", 25, 7)], "decor": [T(22, 3), T(32, 3)]},
        {"id": "s-cripta", "rect": R(16, 22, 20, 10), "ambient": 0.60, "floor": "grey",
         "enemies": [E("SKELETON_WARRIOR", 21, 27, elite=True), E("SKELETON_MAGE", 30, 26), E("GHOST", 26, 29), E("SKELETON_WARRIOR", 33, 29)], "decor": [T(19, 21), T(33, 21)]},
        {"id": "s-passagem", "rect": R(42, 19, 6, 12), "ambient": 0.60, "enemies": [E("GHOST", 44, 26)], "decor": []},
    ],
    "corridors": [R(12, 7, 8, 3), R(25, 14, 3, 8), R(36, 25, 6, 3)],
    "props": [
        P("urns", 3.4, 11.8), P("bucket", 10.4, 11.8), P("stones", 9, 6.2), P("chain", 6, 5, wall=1), P("chain-l", 8, 5, wall=1),
        # celas: beliches, correntes, grilhões
        P("bunk", 22, 5.3), P("bunk", 32, 5.3), P("ballchain", 24.6, 12.4), P("gibbet", 31, 12.6), P("maiden", 27, 5.4), P("bucket", 29.2, 5.4),
        P("shackle", 24.4, 4, wall=1), P("shackle2", 29.6, 4, wall=1), P("chain-l", 26, 4, wall=1), P("chain", 28.2, 4, wall=1),
        # cripta
        P("sarcophagus", 20, 24.6), P("sarcophagus", 32, 24.6), P("coffin", 18, 30.8), P("coffin", 34, 30.8), P("candles", 24.4, 23.4),
        P("candles", 27.6, 23.4), P("pillar-grey", 17.2, 23.6), P("pillar-grey", 34.8, 23.6), P("urns", 26, 30.8), P("bier", 26, 27.4),
        P("chain", 22.5, 22, wall=1), P("chain", 29.5, 22, wall=1),
        # passagem
        P("rubble", 45, 30.4), P("stones", 43, 22), P("rubble-s", 46.6, 24.4),
    ],
    "stairs": [
        {"id": "escada", "kind": "up", "col": 5, "row": 5, "to": "f0", "arrive": "capela-down",
         "label": ["Subir ao térreo", "Go up to the ground floor", "Subir a la planta baja"]},
        {"id": "passagem", "kind": "up", "col": 44, "row": 19, "to": "f0", "arrive": "galeria-down", "opens": "galeria-down",
         "label": ["Subir ao térreo", "Go up to the ground floor", "Subir a la planta baja"]},
    ],
    "arrive": {"escada": {"col": 6, "row": 8}, "passagem": {"col": 45, "row": 22}},
    "doors": [],
    "items": [{"id": "castle_key_crest", "col": 26, "row": 25}],
    "saves": [{"col": 3, "row": 8}],
}

ORDER = ["ext", "f0", "b1", "f1", "top"]
FUTURE = {"f1": ["1º Andar", "1st Floor", "1.ª Planta"], "top": ["Torre", "Tower", "Torre"]}
