"""
Origens dos heróis (falas ao entrar na terra natal + crônica + Códex):
  Guerreiro (Draven)  -> Castelo de Valdrak  (descendente do Rei de Valdrak, séculos depois)
  Samurai (Akihiro)   -> Vulcão de Cinzas    (Sakurajima)
  Arqueiro (Hayato)   -> Vulcão de Cinzas    (Sakurajima, arqueiro samurai)
  Ladina (Seris)      -> Ilhas (rio)
  Maga (Arthelia)     -> Deserto Esquecido (temple)
  Druida (Tharion)    -> Ruínas Antigas  (Boêmia, República Tcheca, de origem celta boia)
  Caçador (Kael)      -> Cidadela Glacial (terras gélidas do norte)
  Xamã e Necromante continuam como estavam.
Re-executável.
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()

# ── falas: [fase, [falas ao entrar], fala depois do chefe | None]  com tradução EN / ES ──
H = {
    "SHAMAN": ("bosque", None, None),          # inalterado
    "DRUID": ("ruins",
              [('Estas pedras têm os mesmos símbolos que meus ancestrais gravaram em Závist. Os Antigos também derrubaram um bosque sagrado para erguer seus portais.', 'These stones bear the same signs my ancestors carved at Závist. The Ancients felled a sacred grove here too, to raise their gates.', 'Estas piedras tienen los mismos signos que mis antepasados tallaron en Závist. Los Antiguos también talaron aquí un bosque sagrado para alzar sus portales.'),
               ('Ainda sinto as raízes debaixo do mármore… e elas têm medo, como os carvalhos de casa antes de secarem.', 'I can still feel the roots beneath the marble… and they are afraid, like the oaks back home before they withered.', 'Todavía siento las raíces bajo el mármol… y tienen miedo, como los robles de mi tierra antes de secarse.')],
              ('O Colosso guardava as raízes, não o portal. Que a terra respire de novo, pelo juramento dos boios.', 'The Colossus guarded the roots, not the gate. Let the land breathe again, by the oath of the Boii.', 'El Coloso guardaba las raíces, no el portal. Que la tierra vuelva a respirar, por el juramento de los boyos.')),
    "BERSERKER": ("vulcao",
                  [("Esta cinza… é a mesma que caía sobre Sakurajima. O vulcão da minha terra.",
                    "This ash… it is the same that fell on Sakurajima. The volcano of my homeland.",
                    "Esta ceniza… es la misma que caía sobre Sakurajima. El volcán de mi tierra."),
                   ("Meu clã guardava as forjas da cratera. O que atravessou o fogo até aqui?",
                    "My clan guarded the forges of the crater. What crossed the fire to get here?",
                    "Mi clan guardaba las forjas del cráter. ¿Qué cruzó el fuego hasta aquí?"),
                   ('Hayato… se você me seguiu até aqui, perdoe o seu irmão teimoso. Eu precisava descer sozinho.', 'Hayato… if you followed me this far, forgive your stubborn brother. I had to come down alone.', 'Hayato… si me seguiste hasta aquí, perdona a tu hermano testarudo. Tenía que bajar solo.')],
                  ("Meus ancestrais forjaram as fechaduras nesta lava. E juraram nunca contar por quê.",
                   "My ancestors forged the locks in this lava. And swore never to say why.",
                   "Mis antepasados forjaron las cerraduras en esta lava. Y juraron no contar nunca por qué.")),
    "WARRIOR": ("castle",
                [("Minha família guardou a memória destes corredores por séculos. Meu ancestral, o Rei de Valdrak, abriu estes portões para salvar o nosso povo.",
                  "My family kept the memory of these halls alive for centuries. My ancestor, the King of Valdrak, opened these gates to save our people.",
                  "Mi familia guardó la memoria de estos pasillos durante siglos. Mi antepasado, el Rey de Valdrak, abrió estas puertas para salvar a nuestro pueblo."),
                 ("Se ainda restar alguma coisa dele aqui dentro… quem vai encontrá-lo sou eu.",
                  "If anything of him is still left in here… I will be the one to find it.",
                  "Si todavía queda algo de él aquí dentro… seré yo quien lo encuentre.")],
                ("Este trono pertenceu ao meu sangue. As Profundezas não vão usá-lo como coroa.",
                 "This throne belonged to my bloodline. The Depths won't wear it as a crown.",
                 "Este trono perteneció a mi linaje. Las Profundidades no lo usarán como corona.")),
    "ARCHER": ("vulcao",
               [("Eu treinava o arco no alto de Sakurajima, contra o vento de cinzas.",
                 "I trained with the bow atop Sakurajima, against the wind of ash.",
                 "Entrenaba con el arco en lo alto de Sakurajima, contra el viento de ceniza."),
                ("Este não é o meu vulcão… mas a cinza tem o mesmo cheiro de casa.",
                 "This is not my volcano… but the ash smells just like home.",
                 "Este no es mi volcán… pero la ceniza huele igual que mi hogar."),
                ('Estas marcas na rocha… são do corte do Akihiro. Meu irmão passou por aqui.', "These marks in the rock… they're Akihiro's cut. My brother came through here.", 'Estas marcas en la roca… son del corte de Akihiro. Mi hermano pasó por aquí.')],
               ("O Dragão Pálido guardava a cratera como quem guarda um portão. Sakurajima precisa saber disso.",
                "The Pale Dragon guarded the crater like one guards a gate. Sakurajima must know of this.",
                "El Dragón Pálido guardaba el cráter como quien guarda un portón. Sakurajima debe saberlo.")),
    "ROGUE": ("rio",
              [("Nasci nestas ilhas, entre contrabandistas. Conheço cada enseada — e estas marcas não estavam aqui.",
                "I was born on these isles, among smugglers. I know every cove — and these marks were not here.",
                "Nací en estas islas, entre contrabandistas. Conozco cada cala — y estas marcas no estaban aquí."),
               ("Alguém está construindo portais novos.",
                "Someone is building new gates.",
                "Alguien está construyendo portales nuevos.")],
              ("Pedras marcadas, barcos sem bandeira… a Ordem do Limiar é real.",
               "Marked stones, flagless boats… the Order of the Threshold is real.",
               "Piedras marcadas, barcos sin bandera… la Orden del Umbral es real.")),
    "MAGE": ("temple",
             [("Cresci entre as dunas de Ra-Khem. Os espelhos do templo nunca apontaram para baixo… até agora.",
               "I grew up among the dunes of Ra-Khem. The temple mirrors never pointed downward… until now.",
               "Crecí entre las dunas de Ra-Khem. Los espejos del templo nunca apuntaron hacia abajo… hasta ahora."),
              ("Os portais não são aleatórios. Formam um círculo — e este é um dos elos.",
               "The gates are not random. They form a circle — and this is one of its links.",
               "Los portales no son aleatorios. Forman un círculo — y este es uno de sus eslabones.")],
             ("O templo não queimava as trevas. Prendia-as. Isto não é uma porta… é uma cela.",
              "The temple did not burn the darkness. It held it. This is not a door… it is a cell.",
              "El templo no quemaba la oscuridad. La encerraba. Esto no es una puerta… es una celda.")),
    "NECROMANCER": ("morta", None, None),       # inalterado
    "HUNTER": ("glacial",
               [("Neve que não derrete, vento que corta a pele… estou em casa.",
                 "Snow that never melts, wind that cuts the skin… I am home.",
                 "Nieve que no se derrite, viento que corta la piel… estoy en casa."),
                ("Os lobos do norte não uivam mais aqui. Alguma coisa os calou.",
                 "The northern wolves no longer howl here. Something silenced them.",
                 "Los lobos del norte ya no aúllan aquí. Algo los silenció.")],
               ("O Golem de Gelo não caçava. Vigiava. As feras fugiam da prisão, não dele.",
                "The Ice Golem did not hunt. It kept watch. The beasts were fleeing the prison, not it.",
                "El Gólem de Hielo no cazaba. Vigilaba. Las fieras huían de la prisión, no de él.")),
}

# lê o objeto atual para manter os heróis inalterados exatamente como estão
a = s.index("const __HLINE={")
b = s.index("};", a) + 2
old = s[a:b]


def js(t):
    return '"' + t.replace("\\", "\\\\").replace('"', '\\"') + '"'


def cur_entry(cid):
    m = re.search(r'(?<![A-Z_])' + cid + r':(\["[a-z]+",\[.*?\],(?:null|"(?:[^"\\]|\\.)*")\])', old)
    assert m, cid
    return m.group(1)


parts = []
tr = []
for cid, (lv, entry, after) in H.items():
    if entry is None:
        parts.append(f"{cid}:{cur_entry(cid)}")
        continue
    lines = ",".join(js(p) for p, _, _ in entry)
    parts.append(f'{cid}:["{lv}",[{lines}],{js(after[0]) if after else "null"}]')
    tr += list(entry) + ([after] if after else [])
s = s[:a] + "const __HLINE={" + ",".join(parts) + "};" + s[b:]

# traduções (dicionários PT -> EN e PT -> ES, mesmo formato das falas existentes)
EN_A = '"Foi por causa disto que perdi meus companheiros.":"This is why I lost my companions.",'
ES_A = '"Foi por causa disto que perdi meus companheiros.":"Por esto perdí a mis compañeros.",'
assert s.count(EN_A) == 1 and s.count(ES_A) == 1
en_add = "".join(f"{js(p)}:{js(e)}," for p, e, _ in tr if f"{js(p)}:{js(e)}" not in s)
es_add = "".join(f"{js(p)}:{js(x)}," for p, _, x in tr if f"{js(p)}:{js(x)}" not in s)
s = s.replace(EN_A, EN_A + en_add).replace(ES_A, ES_A + es_add)

# ── Códex dos heróis ──
CODEX = {
    "WARRIOR": {
        "subtitle": "Herdeiro de Valdrak & Guarda Inabalável",
        "dimension": "Castelo de Valdrak, coração do antigo império",
        "lore": "Draven é descendente do Rei de Valdrak, nascido séculos depois da queda do castelo, numa linhagem que guardou em segredo a memória do rei que abriu os portões para salvar o povo. Cresceu ouvindo que o portal do castelo foi selado com o próprio rei lá dentro, e foi esse sangue que as Profundezas reconheceram quando os selos começaram a ceder. Treinado como cavaleiro e escudo da família, atravessou a fenda para terminar o que o seu ancestral começou.",
        "motivation": "Retomar o castelo dos seus ancestrais, descobrir o que restou do rei e fechar para sempre as portas que ele abriu.",
    },
    "BERSERKER": {
        "era": "Fim da Era dos Estados em Guerra (por volta de 1600), domínio de Satsuma",
        "dimension": "Sakurajima, a ilha do vulcão",
        "lore": "Akihiro é o irmão mais velho de Hayato e herdeiro de um clã de samurais e ferreiros de Satsuma que guardava as forjas da cratera de Sakurajima havia gerações. Criado para liderar o clã, fala com a formalidade solene dos antigos e dedicou a vida ao domínio de um único corte perfeito. Quando uma fenda se abriu no coração do vulcão e engoliu o templo do clã, ele embainhou a katana e desceu sozinho ao fogo atrás do segredo que os ancestrais juraram guardar, sem saber que o irmão mais novo viria logo atrás.",
        "motivation": "Descobrir o segredo das fechaduras forjadas na lava, cortar a corrupção abissal na raiz e levar Hayato de volta vivo para Sakurajima."
    },
    "ARCHER": {
        "subtitle": "Arqueiro Samurai & Vento de Cinzas",
        "era": "Fim da Era dos Estados em Guerra (por volta de 1600), domínio de Satsuma",
        "dimension": "Sakurajima, a ilha do vulcão",
        "weapon": "Yumi (arco longo samurai) & Flechas de Ponta Perfurante",
        "lore": "Hayato é o irmão mais novo de Akihiro. Enquanto o irmão aprendia a forja e a katana como herdeiro do clã, ele treinava o arco no alto da cratera de Sakurajima, onde o vento carregado de cinzas desvia qualquer flecha mal disparada. Quando a fenda engoliu o templo do clã e Akihiro desceu ao fogo, criaturas das trevas subiram as encostas atrás dele. Hayato seguiu o rastro de fogo para caçá-las na origem e para trazer o irmão de volta.",
        "motivation": "Encontrar Akihiro, impedir que a podridão do Abismo alcance Sakurajima e garantir que nenhuma flecha seja disparada em vão."
    },
    "MAGE": {
        "era": "Século Dourado da Academia Arcana de Dal-Vor",
        "dimension": "Deserto Esquecido de Ra-Khem",
        "lore": "Arthelia cresceu entre as dunas de Ra-Khem, onde a Academia Arcana de Dal-Vor estudava os espelhos solares do templo. Prodígio dos círculos superiores de magia, passou anos decifrando manuscritos sobre as portas proibidas entre os planos. Quando um experimento com fendas instáveis ameaçou engolir a biblioteca sagrada, ela usou a própria mana para conter o colapso e entrou no portal para selá-lo por dentro.",
        "motivation": "Compreender a natureza das Profundezas, desvendar o que o templo do deserto realmente aprisionava e fechar as brechas para sempre.",
    },
    "ROGUE": {
        "era": "Era dos Sindicatos das Ilhas",
        "dimension": "As Ilhas, portos de contrabandistas",
        "lore": "Seris nasceu nas Ilhas, entre contrabandistas e barcos sem bandeira, onde só os mais rápidos sobrevivem. Dominou a infiltração e a eliminação silenciosa antes de atingir a maioridade, e conhece cada enseada do arquipélago. Quando marcas de portais começaram a surgir nas pedras das ilhas, ela seguiu o dinheiro da Ordem do Limiar até as Profundezas.",
        "motivation": "Descobrir quem está construindo portais nas Ilhas, saquear os maiores tesouros esquecidos e testar as adagas contra os horrores do Abismo.",
    },
    "DRUID": {
        "subtitle": "Guardião da Mata & Senhor das Feras",
        "era": "Tempo dos Boios & do Juramento dos Carvalhos",
        "dimension": "Floresta da Boêmia (Šumava), na República Tcheca",
        "lore": "Tharion nasceu nas florestas da Boêmia, na atual República Tcheca, a terra que herdou o nome dos boios, o povo celta que a habitou antes de todos os reinos. Sua família guardou em segredo, por séculos, o caminho dos druidas: o carvalho, o visco e o juramento de vigiar o nemeton da Šumava, o bosque sagrado onde os antigos druidas selaram um portal com um círculo de carvalhos vivos. Quando os carvalhos começaram a secar de dentro para fora, Tharion entendeu que o selo cedia e seguiu as raízes até as Profundezas. Nas Ruínas Antigas reconhece, gravados na pedra, os mesmos símbolos que seus ancestrais deixaram no oppidum de Závist, e canaliza a fúria do javali e do lobisomem para defender a terra com dentes e garras.",
        "motivation": "Renovar o juramento dos druidas boios, devolver a vida às raízes sob as Ruínas e garantir que o círculo de carvalhos da Šumava nunca mais se abra."
    },
    "HUNTER": {
        "era": "Era Pré-Imperial das Terras Geladas",
        "dimension": "Territórios Gélidos do Norte",
        "lore": "Kael cresceu nas terras geladas do norte, onde a neve nunca derrete e os homens são presas fáceis. Ao lado de seu fiel lobo espiritual, aprendeu a ler cada pegada na neve, cada galho quebrado e cada mudança no vento. Atravessou a fenda quando as feras corrompidas começaram a descer das geleiras para suas terras sagradas de caça.",
        "motivation": "Rastrear a besta suprema que lidera a corrupção das criaturas, devolver o uivo aos lobos do norte e garantir a sobrevivência de sua matilha.",
    },
}
ca = s.index("const __CODEX_HEROES = [")
cb = s.index("];", ca)
block = s[ca:cb]
for cid, fields in CODEX.items():
    i = block.index(f'id: "{cid}",')
    j = block.find("\n  },", i)
    j = len(block) if j < 0 else j
    ent = block[i:j]
    for k, v in fields.items():
        ent, n = re.subn(r'(\n    ' + k + r': )"(?:[^"\\]|\\.)*"', lambda m: m.group(1) + js(v), ent, count=1)
        assert n == 1, (cid, k)
    block = block[:i] + ent + block[j:]
s = s[:ca] + block + s[cb:]

for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("origens dos heróis aplicadas")
