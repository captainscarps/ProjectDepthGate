import sys, json, os

sys.stdout.reconfigure(encoding="utf-8")

vm = json.load(open("assets/audio/voice/voice-manifest.json", encoding="utf-8"))
vn = json.load(open("assets/audio/voice/voice-native.json", encoding="utf-8"))

def fnv(text):
    h = 0x811C9DC5
    b = text.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"

hero_quest_lines = [
    # quests.js - Laço dos Irmãos
    "É a letra do meu irmão mais velho… AKIHIRO.",
    "É a letra do meu irmão… HAYATO.",
    "Você veio. Eu sabia que viria.",
    "Nunca deixaria você sozinho. Nem aqui, nem em lugar nenhum.",
    "O guardião do santuário é um tengu. O mesmo espírito das histórias do nosso avô.",
    "Juntos, como no dojo. Eu cubro as suas costas.",
    "Conseguimos… como quando éramos crianças, lembra?",
    "Lembro. Você sempre chegava atrasado.",
    "Vou seguir pelos meus próprios portais. Mas leve isto: o laço do nosso clã. Vai deixar seus golpes mais fortes.",
    
    # quests.js - O Último Pajé
    "Avô? O senhor é… um dos pajés do igapó?",
    "Quem é o senhor?",
    "O Observador…",
    
    # quests.js - O Bispo e a Freira
    "Bispo! Mostre o que está bordado no seu manto.",
    
    # quests.js - A Criança Perdida
    "Fique perto de mim. Vou te tirar daqui.",
    "Me perdoe. Eu não fui rápido o bastante.",
    
    # witch-quest.js - A Velha da Cabana
    "Uma senhora… na Floresta da Cripta. Ela me deu uma fruta e insistiu que eu comesse ali mesmo.",
    "Uma senhora… na Floresta da Cripta. Ela me deu uma fruta e insistiu que eu comesse.",
    "Você me envenenou!",
    "Desfaça o feitiço. Agora.",
    
    # witch-quest.js - __WQBARK
    "Essa missão foi mais difícil do que deveria ser… o que será?",
    "Minhas pernas pesam como pedra… isso não é normal.",
    "Antes eu aguentava muito mais. O que está acontecendo comigo?",
    "Cada selo me deixa mais fraco… ou é impressão minha?"
]

print("=== Checking Real Hero Quest Lines in Manifests ===")
all_ok = True
for line in hero_quest_lines:
    h = fnv(line)
    in_vm = h in vm["k"]
    in_vn = h in vn["k"]
    status = "OK_NATIVE" if (in_vn and not in_vm) else "ERROR_IN_VM" if in_vm else "MISSING"
    if status != "OK_NATIVE":
        all_ok = False
    hid = vn["k"].get(h, "none")
    classes_count = len(vn["d"].get(hid, {})) if hid != "none" else 0
    print(f"[{status}] (hid:{hid}, {classes_count} classes) {line[:65]}")

print("\nAll lines properly configured in voice-native:", all_ok)
