"""Direção de voz PT para o Gemini TTS — poucas tiradas, tom e sentimento realistas, uma voz única por personagem.

  • Cada herói tem a SUA voz Gemini (generate_hero_voice.VOICES, nenhuma repetida) e uma persona curta que vai
    junto do texto ("um samurai intenso e contido…"); o sentimento da fala é deduzido do próprio texto (pontuação e
    palavras: susto, urgência, luto, dúvida, ironia…). Assim o modelo acerta a emoção na primeira tirada.
  • No máximo 2 tiradas por fala. Aceita tom até ~15% longe do natural do herói (e corrige oitava errada do
    detector); o ajuste final de tom fica em no máximo 8% (mais que isso muda o timbre e soa como outra pessoa).
"""
import re

TAKES = 2
BAND = (0.86, 1.16)          # alvo / tom medido aceitos sem refazer
SHIFT = 0.08                 # ajuste máximo de tom no arquivo final

PERSONA = {
    "WARRIOR": "um guerreiro veterano, voz grave, firme e calejada",
    "BERSERKER": "um samurai intenso e contido, de poucas palavras",
    "HUNTER": "um caçador do norte, rústico, calmo e observador",
    "NECROMANCER": "um necromante sombrio, voz baixa, culta e controlada",
    "DRUID": "um druida sereno, sábio e ligado à natureza",
    "ARCHER": "um arqueiro jovem, atento e de fala leve",
    "MAGE": "uma maga culta, confiante e elegante",
    "SHAMAN": "uma xamã indígena, calorosa, espiritual e firme",
    "ROGUE": "uma ladina astuta, irônica e rápida",
    "echo-m": "o eco de um homem antigo, distante e solene",
    "echo-f": "o eco de uma mulher antiga, distante e melancólica",
}

_GRIEF = re.compile(r"\b(mort[oa]s?|morte|morr|sangue|perdi|perdemos|saudade|luto|túmulo|cinzas|adeus|lágrima|chor)", re.I)
_FAMILY = re.compile(r"\b(irmã[o]?|pai|mãe|filh[oa]|ancestra[l]|meu povo|minha aldeia|clã)\b", re.I)
_DANGER = re.compile(r"\b(cuidado|corra|fuja|atrás|ataque|monstro|enorme|perigo|depressa|rápido)\b", re.I)
_DARK = re.compile(r"\b(sombra|escurid|maldi|corromp|trevas|silêncio|frio)\b", re.I)
_HOPE = re.compile(r"\b(luz\b|esperança|respir|viv[oa]s?\b|enfim|finalmente|descans|livre|casa\b|amanhec|paz\b)", re.I)
_IRONY = re.compile(r"\b(espertos?|claro|óbvio|ótimo|que beleza|engraçado)\b", re.I)


def feeling(text):
    t = text.strip()
    bang, ask, dots = "!" in t, "?" in t, ("…" in t or "..." in t)
    if bang and ask:
        return "com espanto e alarme na voz"
    if _DANGER.search(t) and bang:
        return "com urgência, alerta, falando rápido"
    if _GRIEF.search(t) and _HOPE.search(t):
        return "com alívio sereno e respeito"
    if _GRIEF.search(t) and _FAMILY.search(t):
        return "com emoção contida, a voz quase embargando"
    if _GRIEF.search(t):
        return "em tom grave e pesaroso, devagar"
    if _HOPE.search(t):
        return "com alívio e uma esperança cansada"
    if _IRONY.search(t) and not bang:
        return "com ironia seca, meio sorrindo"
    if _DARK.search(t):
        return "em voz baixa e tensa, desconfiado"
    if ask:
        return "intrigado, perguntando de verdade"
    if bang:
        return "com energia e determinação"
    if dots:
        return "pensativo, com pausas naturais"
    return "de forma natural, como quem conversa"


def instruction(who, text):
    p = PERSONA.get(who, "uma pessoa comum")
    return f"Fale em português do Brasil, com sotaque natural, como {p}, {feeling(text)}. Diga somente a frase"


def fold(hz, target):
    """o detector às vezes pega a oitava de cima ou de baixo: traz de volta para perto do alvo"""
    if not hz or not target:
        return hz
    for k in (2.0, 0.5):
        if abs(target / (hz / k) - 1) < abs(target / hz - 1) and 0.75 <= target / (hz / k) <= 1.33:
            return hz / k
    return hz


def ok(hz, voiced, target):
    return hz > 0 and voiced > 0.3 and BAND[0] <= target / hz <= BAND[1]


def rate(hz, target):
    return min(1 + SHIFT, max(1 - SHIFT, target / hz)) if hz else 1.0


def read_instruction_too(dur, text):
    """leu a instrução em voz alta junto com a fala?"""
    return dur > len(text) / 9 + 2.2
