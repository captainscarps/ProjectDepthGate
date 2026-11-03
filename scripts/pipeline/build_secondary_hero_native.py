"""
Pipeline para sintetizar todas as falas dos heróis das missões secundárias
nas suas línguas nativas e integrá-las em voice-native.json.

Línguas nativas e timbres:
- WARRIOR (Draven): English (UK) - en-GB-RyanNeural (-4%, -2Hz)
- BERSERKER (Akihiro): Japanese - ja-JP-KeitaNeural (-8%, -12Hz)
- ARCHER (Hayato): Japanese - ja-JP-KeitaNeural (+2%, +6Hz)
- HUNTER (Kael): English (US) - en-US-ChristopherNeural (-6%, -4Hz)
- DRUID (Tharion): Czech - en-US-AndrewMultilingualNeural (-6%, -4Hz)
- NECROMANCER (Valthor): Polish - pl-PL-MarekNeural (-8%, -8Hz)
- MAGE (Arthelia): Arabic - ar-SY-AmanyNeural (-4%, +0Hz)
- ROGUE (Seris): French - fr-FR-DeniseNeural (+2%, +0Hz)
- SHAMAN (Araí): Nheengatu - pt-BR-ThalitaMultilingualNeural (+0%, +0Hz)
"""
import asyncio
import hashlib
import json
import os
import shutil
import sys
import edge_tts

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERO_JSON = os.path.join(ROOT, "scripts", "hero_native_lines.json")
OUT_NAT = os.path.join(ROOT, "assets", "audio", "voice", "nat")
MAN_NAT = os.path.join(ROOT, "assets", "audio", "voice", "voice-native.json")
MIRROR_NAT = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "nat")
MIRROR_MAN_NAT = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "voice-native.json")

MAN_MAIN = os.path.join(ROOT, "assets", "audio", "voice", "voice-manifest.json")
MIRROR_MAN_MAIN = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "voice-manifest.json")

def norm(t):
    return " ".join(t.split()).strip()

def fnv(text):
    h = 0x811C9DC5
    b = text.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"

def get_mp3_duration(path):
    with open(path, 'rb') as f:
        data = f.read()
    idx = 0
    total_samples = 0
    sample_rate = 24000
    if data.startswith(b'ID3'):
        size = 0
        for b in data[6:10]:
            size = (size << 7) | (b & 0x7F)
        idx = 10 + size
    bitrates_v1_l3 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
    bitrates_v2_l3 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0]
    sample_rates_v1 = [44100, 48000, 32000, 0]
    sample_rates_v2 = [22050, 24000, 16000, 0]
    sample_rates_v25 = [11025, 12000, 8000, 0]
    while idx + 4 <= len(data):
        if data[idx] == 0xFF and (data[idx+1] & 0xE0) == 0xE0:
            version_bits = (data[idx+1] >> 3) & 3
            layer_bits = (data[idx+1] >> 1) & 3
            bitrate_bits = (data[idx+2] >> 4) & 15
            sr_bits = (data[idx+2] >> 2) & 3
            pad = (data[idx+2] >> 1) & 1
            if layer_bits == 1:
                if version_bits == 3:
                    sr = sample_rates_v1[sr_bits]
                    br = bitrates_v1_l3[bitrate_bits] * 1000
                    samples_per_frame = 1152
                elif version_bits == 2:
                    sr = sample_rates_v2[sr_bits]
                    br = bitrates_v2_l3[bitrate_bits] * 1000
                    samples_per_frame = 576
                elif version_bits == 0:
                    sr = sample_rates_v25[sr_bits]
                    br = bitrates_v2_l3[bitrate_bits] * 1000
                    samples_per_frame = 576
                else:
                    idx += 1
                    continue
                if sr > 0 and br > 0:
                    frame_len = (samples_per_frame * br // (8 * sr)) + pad
                    total_samples += samples_per_frame
                    sample_rate = sr
                    idx += frame_len
                    continue
        idx += 1
    return round(total_samples / sample_rate, 2) if sample_rate else 0.0

# ── Novas falas de missões secundárias ──
NEW_OWN_LINES = {
    "ARCHER": [
        {
            "pt": "É a letra do meu irmão mais velho… AKIHIRO.",
            "en": "It's my older brother's handwriting… AKIHIRO.",
            "es": "Es la letra de mi hermano mayor… AKIHIRO.",
            "nat": "兄上の筆跡だ…アキヒロの。"
        }
    ],
    "BERSERKER": [
        {
            "pt": "É a letra do meu irmão… HAYATO.",
            "en": "It's my brother's handwriting… HAYATO.",
            "es": "Es la letra de mi hermano… HAYATO.",
            "nat": "弟の筆跡だ…ハヤトの。"
        }
    ],
    "SHAMAN": [
        {
            "pt": "Avô? O senhor é… um dos pajés do igapó?",
            "en": "Grandfather? Are you… one of the shamans of the flooded forest?",
            "es": "¿Abuelo? ¿Usted es… uno de los chamanes del igapó?",
            "nat": "Amuã? Indé taá… yepé paié igapó suíwara?",
            "tts": "Amuã? Indé taá… iepé paié igapó suíuára?"
        },
        {
            "pt": "O Observador…",
            "en": "The Observer…",
            "es": "El Observador…",
            "nat": "Umaãsara…",
            "tts": "Umaãssára…"
        }
    ]
}

NEW_GENERIC_LINES = [
    {
        "pt": "Quem é o senhor?",
        "en": "Who are you?",
        "es": "¿Quién es usted?",
        "ja": "貴方は…どなたですか？",
        "ja_b": "何者だ、老爺？",
        "pl": "Kim jesteś, starcze?",
        "ar": "مَن تكون يا هذا؟",
        "fr": "Qui êtes-vous, l'ancien ?",
        "yrl": "Awá taá indé?",
        "yrl_tts": "Auá taá indé?",
        "cs": "Kdo jste, pane?"
    },
    {
        "pt": "Bispo! Mostre o que está bordado no seu manto.",
        "en": "Bishop! Show what is embroidered beneath your robes.",
        "es": "¡Obispo! Muestre lo que está bordado en su manto.",
        "ja": "司教様！マントの裏に何が刺繍されているか、見せてください。",
        "ja_b": "司教！その衣の裏に縫い付けられた紋を見せろ。",
        "pl": "Biskupie! Pokaż, co masz wyszyte pod płaszczem.",
        "ar": "أيها الأسقف! أرِنا ما هو مطرّزٌ تحت رداءك.",
        "fr": "L'Évêque ! Montrez ce qui est brodé sous votre manteau.",
        "yrl": "Bispo! Eremukameẽ maã usasá ne poyawa wirpe.",
        "yrl_tts": "Bispo! Eremucamenssá maã ussassá ne poiáua uírpe.",
        "cs": "Biskupe! Ukaž, co máš vyšito na plášti."
    },
    {
        "pt": "Fique perto de mim. Vou te tirar daqui.",
        "en": "Stay close to me. I'll get you out of here.",
        "es": "Quédate cerca de mí. Te sacaré de aquí.",
        "ja": "俺のそばにいて。必ずここから連れ出すから。",
        "ja_b": "我のそばを離れるな。ここから出してやる。",
        "pl": "Bądź blisko mnie. Wyciągnę cię stąd.",
        "ar": "ابقَ قريبًا منّي. سأخرجكَ من هنا.",
        "fr": "Reste près de moi. Je vais te sortir de là.",
        "yrl": "Epitá se rimbiwa. Arasú-ana indé iké suí.",
        "yrl_tts": "Epitá se rimbiua. Arassú-ana indé iquê suí.",
        "cs": "Zůstaň blízko mě. Dostanu tě odtud."
    },
    {
        "pt": "Me perdoe. Eu não fui rápido o bastante.",
        "en": "Forgive me. I was not fast enough.",
        "es": "Perdóname. No fui lo bastante rápido.",
        "ja": "すまない…俺が間に合わなかったんだ。",
        "ja_b": "許せ…我の太刀が間に合わなかった。",
        "pl": "Wybacz mi. Nie byłem dość szybki.",
        "ar": "سامحني… لم أكن بالسرعة الكافية.",
        "fr": "Pardonne-moi. Je n'ai pas été assez rapide.",
        "yrl": "Repurudũ se resé. Ti aikué katuíwa.",
        "yrl_tts": "Repurudún se ressê. Ti aicuê catuíua.",
        "cs": "Odpusť mi. Nebyl jsem dost rychlý."
    },
    {
        "pt": "Uma senhora… na Floresta da Cripta. Ela me deu uma fruta e insistiu que eu comesse ali mesmo.",
        "en": "An old lady… in the Crypt Forest. She gave me a fruit and insisted that I eat it right there.",
        "es": "Una anciana… en el Bosque de la Cripta. Me dio una fruta e insistió en que la comiera allí mismo.",
        "ja": "お婆さんだよ…地下墓地の森の。果物をくれて、その場で食べるように言われたんだ。",
        "ja_b": "老婆だ…地下墓地の森のな。果実を差し出し、その場で食えと迫られた。",
        "pl": "Stara kobieta… w Lesie Krypty. Dała mi owoc i nalegała, bym zjadł go na miejscu.",
        "ar": "عجوزٌ… في غابةِ السرداب. أعطتني ثمرةً وأصرّت أن آكلها في الحال.",
        "fr": "Une vieille femme… dans la Forêt de la Crypte. Elle m'a donné un fruit et a insisté pour que je le mange sur-le-champ.",
        "yrl": "Yepé tiwa… kaá-pituna upé. Umée yepé ywa se arama, unheẽ ambaú arama apé-pukuana.",
        "yrl_tts": "Iepé tíua… caá-pitúna upé. Umêe iepé iuá se arama, unhên ambaú arama apé-pucuána.",
        "cs": "Stará žena… v Kryptovém lese. Dala mi ovoce a naléhala, abych ho hned snědl."
    },
    {
        "pt": "Uma senhora… na Floresta da Cripta. Ela me deu uma fruta e insistiu que eu comesse.",
        "en": "An old lady… in the Crypt Forest. She gave me a fruit and insisted that I eat it.",
        "es": "Una anciana… en el Bosque de la Cripta. Me dio una fruta e insistió en que la comiera.",
        "ja": "お婆さんだよ…地下墓地の森の。果物をくれて、食べるように言われたんだ。",
        "ja_b": "老婆だ…地下墓地の森のな。果実を差し出し、食えと迫られた。",
        "pl": "Stara kobieta… w Lesie Krypty. Dała mi owoc i nalegała, bym go zjadł.",
        "ar": "عجوزٌ… في غابةِ السرداب. أعطتني ثمرةً وأصرّت أن آكلها.",
        "fr": "Une vieille femme… dans la Forêt de la Crypte. Elle m'a donné un fruit et a insisté pour que je le mange.",
        "yrl": "Yepé tiwa… kaá-pituna upé. Umée yepé ywa se arama, unheẽ ambaú arama.",
        "yrl_tts": "Iepé tíua… caá-pitúna upé. Umêe iepé iuá se arama, unhên ambaú arama.",
        "cs": "Stará žena… v Kryptovém lese. Dala mi ovoce a naléhala, abych ho snědl."
    },
    {
        "pt": "Você me envenenou!",
        "en": "You poisoned me!",
        "es": "¡Me envenenaste!",
        "ja": "毒を盛ったな！",
        "ja_b": "我に毒を盛ったな！",
        "pl": "Otrułaś mnie!",
        "ar": "لقد سمّمتِني!",
        "fr": "Tu m'as empoisonnée !",
        "yrl": "Emupuxi ixé pukasi irũmu!",
        "yrl_tts": "Emupúxi ixé pucássi irúmu!",
        "cs": "Otrávilas mě!"
    },
    {
        "pt": "Desfaça o feitiço. Agora.",
        "en": "Undo the curse. Now.",
        "es": "Deshaz el hechizo. Ahora.",
        "ja": "呪いを解いてくれ。今すぐに。",
        "ja_b": "呪いを解け。今すぐにだ。",
        "pl": "Cofnij to zaklęcie. Już.",
        "ar": "أبطلي هذه التعويذة. الآن.",
        "fr": "Romps ce sortilège. Tout de suite.",
        "yrl": "Reyuká kuá paiesá. Kuíri-té.",
        "yrl_tts": "Reiucá cuá paiessá. Cuíri-té.",
        "cs": "Zruš to kouzlo. Hned."
    },
    {
        "pt": "Essa missão foi mais difícil do que deveria ser… o que será?",
        "en": "That run was harder than it had any right to be… what is happening?",
        "es": "Esta misión fue más difícil de lo que debía ser… ¿qué será?",
        "ja": "今回の探索、いつもよりきつかったな…何だろう？",
        "ja_b": "この戦、妙に重かった…何が起きているのだ？",
        "pl": "Ta wyprawa była trudniejsza niż zwykle… co się ze mną dzieje?",
        "ar": "كانت هذه المهمةُ أصعبَ ممّا ينبغي… ما الخطبُ يا ترى؟",
        "fr": "Cette virée était bien plus rude que prévu… qu'est-ce qui m'arrive ?",
        "yrl": "Kuá marã umupuxi retana… maã taá kuá?",
        "yrl_tts": "Cuá marã umupúxi retána… maã taá cuá?",
        "cs": "Ta výprava byla těžší, než měla být… co se to děje?"
    },
    {
        "pt": "Minhas pernas pesam como pedra… isso não é normal.",
        "en": "My legs feel heavy as lead… this isn't normal.",
        "es": "Mis piernas pesan como piedra… esto no es normal.",
        "ja": "足がまるで石のように重い…普通じゃない。",
        "ja_b": "足が石のように重い…尋常ではないぞ。",
        "pl": "Moje nogi ciążą jak kamień… to nie jest normalne.",
        "ar": "قدماي ثقيلتان كالحجر… هذا ليس طبيعيًّا.",
        "fr": "Mes jambes sont lourdes comme de la pierre… ce n'est pas normal.",
        "yrl": "Se yetimá upusú itá yáwa… ti katú kuá.",
        "yrl_tts": "Se ietimá upussú itá iáua… ti catú cuá.",
        "cs": "Nohy mám těžké jako kámen… to není normální."
    },
    {
        "pt": "Antes eu aguentava muito mais. O que está acontecendo comigo?",
        "en": "I used to endure far more than this. What is happening to me?",
        "es": "Antes aguantaba mucho más. ¿Qué me está pasando?",
        "ja": "前はもっと耐えられたのに。俺、どうかしちゃったのかな？",
        "ja_b": "我が力はこんなものではないはず。何が我が身を蝕んでいるのだ？",
        "pl": "Kiedyś znosiłem o wiele więcej. Co się ze mną dzieje?",
        "ar": "كنتُ أحتملُ أكثرَ من هذا بكثير. ما الذي يحلُّ بي؟",
        "fr": "J'encaissais bien mieux que ça avant. Qu'est-ce qui cloche chez moi ?",
        "yrl": "Kuxiima asarú katuíwa. Maã taá uikué ixé resé?",
        "yrl_tts": "Cuxiíma assarú catuíua. Maã taá uicuê ixé ressê?",
        "cs": "Dřív jsem vydržel mnohem víc. Co se to se mnou děje?"
    },
    {
        "pt": "Cada selo me deixa mais fraco… ou é impressão minha?",
        "en": "Every seal seems to leave me weaker… or is it just my mind?",
        "es": "Cada sello me deja más débil… ¿o es impresión mía?",
        "ja": "印を解くたびに体が弱くなってる気がする…気のせいじゃないよね？",
        "ja_b": "封印を解くたび、力が削がれていく…気のせいではないな。",
        "pl": "Z każdą pieczęcią słabnę… czy to tylko moje złudzenie?",
        "ar": "كلُّ ختمٍ يتركني أضعف… أم أنّه يخالُ إليّ ذلك فحسب؟",
        "fr": "Chaque sceau me laisse plus faible… ou c'est juste mon imagination ?",
        "yrl": "Panhẽ mukameẽsá umupuxi ixé… ou apensari nhũ?",
        "yrl_tts": "Panhên mucamenssá umupúxi ixé… ou apenssári nhún?",
        "cs": "S každou pečetí jsem slabší… nebo se mi to jen zdá?"
    },
    {
        "pt": "Nunca deixaria você sozinho. Nem aqui, nem em lugar nenhum.",
        "en": "I would never leave you alone. Neither here, nor anywhere.",
        "es": "Nunca te dejaría solo. Ni aquí, ni en ninguna parte.",
        "ja": "あんたを独りになど絶対にしない。ここでも、どこであろうと。",
        "ja_b": "お前を独りになどするものか。ここでも、どこであろうとな。",
        "pl": "Nigdy bym cię nie zostawił samego. Ani tu, ani nigdzie indziej.",
        "ar": "لن أترككَ وحدكَ أبدًا. لا هنا، ولا في أيِّ مكان.",
        "fr": "Je ne te laisserais jamais seul. Ni ici, ni nulle part ailleurs.",
        "yrl": "Ti mairamé aité amuyereu indé aintewé. Ti iké, ti mamé.",
        "yrl_tts": "Ti mairamê aité amuiereu indé aintêué. Ti iquê, ti mamê.",
        "cs": "Nikdy bych tě nenechal samotného. Ani tady, ani nikde jinde."
    },
    {
        "pt": "Lembro. Você sempre chegava atrasado.",
        "en": "I remember. You always arrived late.",
        "es": "Me acuerdo. Siempre llegabas tarde.",
        "ja": "覚えてるよ。兄上はいつも遅れて来てたけどね。",
        "ja_b": "覚えているとも。貴様はいつも遅れて来ていたがな。",
        "pl": "Pamiętam. Zawsze się spóźniałeś.",
        "ar": "أتذكّر. كنتَ تأتي متأخّرًا دومًا.",
        "fr": "Je m'en souviens. Tu arrivais toujours en retard.",
        "yrl": "Asikari se akangatu upé. Indé rasú asikawera.",
        "yrl_tts": "Assicári se acangatú upé. Indé rassú assicauéra.",
        "cs": "Pamatuji. Vždycky jsi chodil pozdě."
    },
    {
        "pt": "Você veio. Eu sabia que viria.",
        "en": "You came. I knew you would.",
        "es": "Viniste. Sabía que vendrías.",
        "ja": "来てくれたんだな。信じていたよ。",
        "ja_b": "よくぞ来た。必ず来ると信じておったぞ。",
        "pl": "Przyszedłeś. Wiedziałem, że przyjdziesz.",
        "ar": "لقد أتيت. كنت أعلم أنك ستأتي.",
        "fr": "Tu es venu. Je savais que tu viendrais.",
        "yrl": "Indé reyuur. Akuáu ana reyuur arama.",
        "yrl_tts": "Indé reiuur. Acuáu ana reiuur arama.",
        "cs": "Přišel jsi. Věděl jsem, že přijdeš."
    },
    {
        "pt": "O guardião do santuário é um tengu. O mesmo espírito das histórias do nosso avô.",
        "en": "The sanctuary guardian is a tengu. The very spirit from our grandfather's stories.",
        "es": "El guardián del santuario es un tengu. El mismo espíritu de las historias de nuestro abuelo.",
        "ja": "社の守護者は天狗だ。祖父の昔話に出てきた、あの霊気そのものだ。",
        "ja_b": "この社の番人は天狗。祖父の語り草にあった、あの霊物だ。",
        "pl": "Strażnikiem sanktuarium jest tengu. Ten sam duch z opowieści naszego dziadka.",
        "ar": "حارس المعبد هو التينغو. الروح نفسها من حكايات جدنا.",
        "fr": "Le gardien du sanctuaire est un tengu. L'esprit même des histoires de notre grand-père.",
        "yrl": "Kuá rendá sarakura yepé tengu. Aé anga se amuã unheẽ uikowé kuxiima.",
        "yrl_tts": "Cuá rendá ssaracúra iepé tengu. Aê ânga se amuã unhên uicouê cuxiíma.",
        "cs": "Strážcem svatyně je tengu. Přesně ten duch z dědečkových příběhů."
    },
    {
        "pt": "Juntos, como no dojo. Eu cubro as suas costas.",
        "en": "Together, just like in the dojo. I've got your back.",
        "es": "Juntos, como en el dojo. Te cubro la espalda.",
        "ja": "道場にいた頃のように、共に戦おう。背中は任せてくれ。",
        "ja_b": "道場の頃のようにな。背中は我に任せておけ。",
        "pl": "Razem, jak w dojo. Osłaniam cię.",
        "ar": "معًا، كما في الدوجو. أنا أحمي ظهرك.",
        "fr": "Ensemble, comme au dojo. Je couvre tes arrières.",
        "yrl": "Yautukué, marã-rendá yáwa. Ixé amaã ne kupé resé.",
        "yrl_tts": "Iautucuê, marã-rendá iáua. Ixé amaã ne cupê ressê.",
        "cs": "Spolu, jako v dódžó. Kryju ti záda."
    },
    {
        "pt": "Conseguimos… como quando éramos crianças, lembra?",
        "en": "We did it… just like when we were kids, remember?",
        "es": "Lo logramos… como cuando éramos niños, ¿te acuerdas?",
        "ja": "やったな…子どもの頃のようじゃないか、覚えてるかい？",
        "ja_b": "成し遂げたな…幼き日のようではないか。覚えているか？",
        "pl": "Udało się… jak za dzieciaka, pamiętasz?",
        "ar": "لقد فعلناها… كما عندما كنا أطفالًا، أتتذكر؟",
        "fr": "On a réussi… comme quand on était gosses, tu te rappelles ?",
        "yrl": "Yapisirũ… kuxiima yauiíwa yáwa, remunduá?",
        "yrl_tts": "Iapissirún… cuxiíma iauiíua iáua, remunduá?",
        "cs": "Dokázali jsme to… jako když jsme byli děti, pamatuješ?"
    },
    {
        "pt": "Vou seguir pelos meus próprios portais. Mas leve isto: o laço do nosso clã. Vai deixar seus golpes mais fortes.",
        "en": "I'll walk through my own gates now. But take this: our clan's bond. It will make your strikes stronger.",
        "es": "Seguiré por mis propios portales. Pero llévate esto: el lazo de nuestro clan. Hará tus golpes más fuertes.",
        "ja": "俺は俺の門を進むよ。でもこれを持っていってくれ、一族の絆だ。一撃がさらに重くなるはずだ。",
        "ja_b": "我は我の門を行く。だがこれを受け取れ、一族の絆だ。貴様の刃をさらに強くしよう。",
        "pl": "Pójdę przez własne bramy. Ale weź to: więź naszego klanu. Wzmocni twoje ciosy.",
        "ar": "سأمضي عبر بواباتي الخاصة. لكن خذ هذا: رباط عشيرتنا. سيجعل ضرباتك أقوى.",
        "fr": "Je vais suivre mes propres portails. Mais prends ceci : le lien de notre clan. Il rendra tes coups plus puissants.",
        "yrl": "Asú-ana se okena rupí. Ma erasú kuá: se yandé-itá sausara. Umurari ne punha.",
        "yrl_tts": "Assú-ana se ocêna rupí. Ma erassú cuá: se iandé-itá saussára. Umurári ne púnha.",
        "cs": "Půjdu svými vlastními branami. Ale vezmi si tohle: pouto našeho klanu. Tvé údery budou silnější."
    }
]

async def synth_job(hid, cls, nat, v, out_path, sem):
    async with sem:
        if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
            dur = get_mp3_duration(out_path)
            return hid, cls, dur
        
        for attempt in range(4):
            try:
                c = edge_tts.Communicate(
                    nat,
                    v["voice"],
                    rate=v.get("rate", "+0%"),
                    pitch=v.get("pitch", "+0Hz")
                )
                await c.save(out_path)
                if os.path.exists(out_path) and os.path.getsize(out_path) > 500:
                    break
            except Exception as e:
                if attempt == 3:
                    print(f"  [ERROR] {cls}: {e}")
                    raise e
                await asyncio.sleep(1.5 * (attempt + 1))
        
        dur = get_mp3_duration(out_path)
        print(f"  [{cls:11s}] Generated: {dur:.2f}s | {nat[:45]}")
        return hid, cls, dur

async def main():
    print("=== SINTETIZADOR DE VOZES NATIVAS DOS HERÓIS (MISSÕES SECUNDÁRIAS) ===")
    os.makedirs(OUT_NAT, exist_ok=True)
    os.makedirs(MIRROR_NAT, exist_ok=True)
    
    with open(HERO_JSON, "r", encoding="utf-8") as f:
        cfg = json.load(f)
    
    voices = cfg["voices"]
    
    # 1. Atualizar hero_native_lines.json com as novas falas
    existing_generic_pts = {norm(g["pt"]) for g in cfg["generic"]}
    added_generic = 0
    for g in NEW_GENERIC_LINES:
        if norm(g["pt"]) not in existing_generic_pts:
            cfg["generic"].append(g)
            existing_generic_pts.add(norm(g["pt"]))
            added_generic += 1
            
    for cls, rows in NEW_OWN_LINES.items():
        cfg["own"].setdefault(cls, [])
        existing_own_pts = {norm(r["pt"] if isinstance(r, dict) else r[0]) for r in cfg["own"][cls]}
        for r in rows:
            if norm(r["pt"]) not in existing_own_pts:
                cfg["own"][cls].append(r)
                existing_own_pts.add(norm(r["pt"]))
                print(f"Added OWN line for {cls}: {r['pt'][:40]}")
                
    with open(HERO_JSON, "w", encoding="utf-8") as f:
        json.dump(cfg, f, indent=1, ensure_ascii=False)
    print(f"Updated hero_native_lines.json (+{added_generic} generic lines)")
    
    # 2. Carregar manifestos
    vn = json.load(open(MAN_NAT, "r", encoding="utf-8")) if os.path.exists(MAN_NAT) else {"k": {}, "d": {}, "s": {}}
    vm = json.load(open(MAN_MAIN, "r", encoding="utf-8"))
    
    # List of hero line Portuguese texts to clean up from voice-manifest.json
    stale_hero_pts = [
        "É a letra do meu irmão mais velho… AKIHIRO.",
        "É a letra do meu irmão… HAYATO.",
        "Nunca deixaria você sozinho. Nem aqui, nem em lugar nenhum.",
        "Lembro. Você sempre chegava atrasado.",
        "Avô? O senhor é… um dos pajés do igapó?",
        "Quem é o senhor?",
        "O Observador…",
        "Bispo! Mostre o que está bordado no seu manto.",
        "Fique perto de mim. Vou te tirar daqui.",
        "Me perdoe. Eu não fui rápido o bastante.",
        "Uma senhora… na Floresta da Cripta. Ela me deu uma fruta e insistiu que eu comesse ali mesmo.",
        "Uma senhora… na Floresta da Cripta. Ela me deu uma fruta e insistiu que eu comesse.",
        "Você me envenenou!",
        "Desfaça o feitiço. Agora.",
        "Essa missão foi mais difícil do que deveria ser… o que será?",
        "Minhas pernas pesam como pedra… isso não é normal.",
        "Antes eu aguentava muito mais. O que está acontecendo comigo?",
        "Cada selo me deixa mais fraco… ou é impressão minha?",
        "Você veio. Eu sabia que viria.",
        "O guardião do santuário é um tengu. O mesmo espírito das histórias do nosso avô.",
        "Juntos, como no dojo. Eu cubro as suas costas.",
        "Conseguimos… como quando éramos crianças, lembra?",
        "Vou seguir pelos meus próprios portais. Mas leve isto: o laço do nosso clã. Vai deixar seus golpes mais fortes."
    ]
    
    stale_hids = set()
    for pt in stale_hero_pts:
        h = fnv(norm(pt))
        if h in vm["k"]:
            hid = vm["k"][h]
            stale_hids.add(hid)
            del vm["k"][h]
            if hid in vm["d"]:
                del vm["d"][hid]
    # Remove from vm["k"] any other key mapping to stale_hids (e.g. English translation)
    vm["k"] = {k: v for k, v in vm["k"].items() if v not in stale_hids}
    
    # 3. Montar jobs de síntese para todas as falas
    jobs = []
    # Generic lines
    for g in cfg["generic"]:
        pt = norm(g["pt"])
        hid = fnv(pt)
        shown = {pt, norm(g.get("en", "")), norm(g.get("es", ""))}
        for t in shown:
            if t:
                vn["k"][fnv(t)] = hid
        vn["d"].setdefault(hid, {})
        for cls, v in voices.items():
            nat = (v.get("natkey") and g.get(v["natkey"])) or g.get(v["lang"] + "_tts") or (g.get(v["lang"]) if v["lang"] != "en" else g.get("en"))
            if nat:
                out_file = os.path.join(OUT_NAT, f"{hid}-{cls}.mp3")
                jobs.append((hid, cls, nat, v, out_file))
                
    # Own lines
    for cls, rows in cfg["own"].items():
        v = voices[cls]
        for row in rows:
            if isinstance(row, dict):
                pt = norm(row["pt"])
                nat = row.get("tts") or row["nat"]
                shown = {pt, norm(row.get("en", "")), norm(row.get("es", ""))}
            else:
                pt = norm(row[0])
                nat = row[2] if len(row) > 2 else row[1]
                shown = {pt}
            hid = fnv(pt)
            for t in shown:
                if t:
                    vn["k"][fnv(t)] = hid
            vn["d"].setdefault(hid, {})
            out_file = os.path.join(OUT_NAT, f"{hid}-{cls}.mp3")
            jobs.append((hid, cls, nat, v, out_file))
            
    print(f"Total jobs to verify/synthesize: {len(jobs)}")
    sem = asyncio.Semaphore(4)
    tasks = [synth_job(hid, cls, nat, v, out, sem) for hid, cls, nat, v, out in jobs]
    results = await asyncio.gather(*tasks)
    
    for hid, cls, dur in results:
        vn["d"][hid][cls] = dur
        
    # 4. Gravar voice-native.json
    with open(MAN_NAT, "w", encoding="utf-8") as f:
        json.dump(vn, f, ensure_ascii=False, separators=(",", ":"))
    with open(MIRROR_MAN_NAT, "w", encoding="utf-8") as f:
        json.dump(vn, f, ensure_ascii=False, separators=(",", ":"))
    print(f"Saved voice-native.json: {len(vn['k'])} keys, {len(vn['d'])} ids")
    
    # 5. Salvar voice-manifest.json limpo
    with open(MAN_MAIN, "w", encoding="utf-8") as f:
        json.dump(vm, f, indent=2, ensure_ascii=False)
    with open(MIRROR_MAN_MAIN, "w", encoding="utf-8") as f:
        json.dump(vm, f, indent=2, ensure_ascii=False)
    print(f"Cleaned {len(stale_hids)} hero dialogue entries from voice-manifest.json")
    
    # 6. Espelhar arquivos nat para Projeto atualizado
    print("Mirroring nat MP3s to Projeto atualizado...")
    count_nat = 0
    for fname in os.listdir(OUT_NAT):
        if fname.endswith(".mp3"):
            src = os.path.join(OUT_NAT, fname)
            dst = os.path.join(MIRROR_NAT, fname)
            if not os.path.exists(dst) or os.path.getmtime(src) > os.path.getmtime(dst):
                shutil.copy2(src, dst)
                count_nat += 1
    print(f"Mirrored {count_nat} files to {MIRROR_NAT}")

if __name__ == "__main__":
    asyncio.run(main())
