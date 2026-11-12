"""
Monta scripts/dublagem_refazer.json: TODAS as falas em português dos personagens incompletos, para regravar
do zero no ElevenLabs (scripts/regravar_dublagem_elevenlabs.py --lista scripts/dublagem_refazer.json).
Entrada: relação das falas (tools/pt_relacao.json, gerada na auditoria) + falas finais dos heróis que ainda
não têm português. Cada texto é conferido pelo hash do jogo antes de entrar na lista.
"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REL = sys.argv[1] if len(sys.argv) > 1 else "/tmp/pt_relacao.json"
MD = sys.argv[2] if len(sys.argv) > 2 else "/home/claude/tools/vozes-faltando.md"
man = json.load(open(os.path.join(ROOT, "assets/audio/voice/voice-manifest.json"), encoding="utf-8"))

def H(t):
    t = re.sub(r"\s+", " ", t).strip(); h = 2166136261; b = t.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8); h = (h * 16777619) & 0xFFFFFFFF
    return "%08x" % h

HERO = {"Draven (Warrior)": "WARRIOR", "Akihiro (Berserker)": "BERSERKER", "Hayato (Archer)": "ARCHER",
        "Kael (Hunter)": "HUNTER", "Tharion (Druid)": "DRUID", "Valthor (Necromancer)": "NECROMANCER",
        "Arthelia (Mage)": "MAGE", "Seris (Rogue)": "ROGUE", "Araí (Shaman)": "SHAMAN"}
NPC = {"Guardiã": "Aoede", "Eco dos Antigos (homem)": "Orus", "Eco dos Antigos (mulher)": "Vindemiatrix",
       "Rei (possuído)": "Fenrir", "Rafael": "Algieba", "Narrador": "Charon", "Visão dos cristais": "Charon",
       "Narrador dos vídeos": "Charon", "Vendedor": "Charon"}
PARTE = {c: 1 for c in ["WARRIOR", "ARCHER", "NECROMANCER", "MAGE", "ROGUE", "SHAMAN", "Aoede", "Orus", "Vindemiatrix", "Fenrir", "Algieba"]}
PARTE.update({"BERSERKER": 2, "HUNTER": 2, "DRUID": 2, "Charon": 3})
CLS_PT = {"Necromante": "NECROMANCER", "Maga": "MAGE", "Ladina": "ROGUE", "Xamã (Araí)": "SHAMAN"}

jobs, seen = [], set()
def add(id_, cls, voice, text, motivo, also_generic=False):
    out = f"pt/{id_}-{cls}.mp3" if cls else f"pt/{id_}.mp3"
    if out in seen: return
    seen.add(out)
    jobs.append({"id": id_, "cls": cls, "voice": voice, "text": text, "out": out, "motivo": motivo,
                 "also_generic": also_generic, "parte": PARTE[cls or voice]})

for x in json.load(open(REL, encoding="utf-8")):
    p, t = x["personagem"], x["texto"].strip()
    if not t or (p not in HERO and p not in NPC): continue
    m = re.match(r"pt/(\w{8})(?:-(\w+))?\.mp3", x["arquivo"]); id_, cls = m.group(1), m.group(2)
    assert man["k"].get(H(t)) == id_, x["arquivo"]
    if p in HERO:
        one = len(man["d"][id_].get("byClass", {}).get("pt", {})) == 1
        add(id_, cls, cls, t, "refazer do zero", also_generic=one)
    else:
        add(id_, None, NPC[p], t, "refazer do zero")

sec = open(MD, encoding="utf-8").read().split("## 1.")[1].split("## 2.")[0]
common = sec.split("### Falas de um herói só")[0]
for id_, t in re.findall(r"^- `(\w{8})` — (.+)$", common, re.M):
    assert man["k"].get(H(t)) == id_, id_
    for n, cls in enumerate(HERO.values()):
        add(id_, cls, cls, t, "fala final sem português", also_generic=(cls == "WARRIOR"))
for id_, who, t in re.findall(r"^- `(\w{8})` \((.+?)\) — (.+)$", sec.split("### Falas de um herói só")[1], re.M):
    assert man["k"].get(H(t)) == id_, id_
    add(id_, CLS_PT[who], CLS_PT[who], t, "fala final sem português", also_generic=True)

jobs.sort(key=lambda j: (j["parte"], j["cls"] or j["voice"], j["id"]))
json.dump({"jobs": jobs}, open(os.path.join(ROOT, "scripts/dublagem_refazer.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
from collections import defaultdict
s = defaultdict(lambda: [0, 0])
for j in jobs: k = (j["parte"], j["cls"] or j["voice"]); s[k][0] += 1; s[k][1] += len(j["text"])
for k, v in sorted(s.items()): print(k, v)
print("total", len(jobs), sum(len(j["text"]) for j in jobs))
for p in (1, 2, 3): print("parte", p, sum(len(j["text"]) for j in jobs if j["parte"] == p))
