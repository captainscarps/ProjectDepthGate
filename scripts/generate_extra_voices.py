"""Gera no Gemini TTS só as falas novas listadas em EXTRA (PT e EN) e registra no manifesto.
Reaproveita a síntese e o hash de scripts/generate_all_npc_voices_gemini.py.

Uso (a chave nunca é gravada em arquivo):
    GEMINI_API_KEY=... python3 scripts/generate_extra_voices.py
"""
import importlib.util
import json
import os
import sys
import time

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("npcv", os.path.join(ROOT, "scripts", "generate_all_npc_voices_gemini.py"))
V = importlib.util.module_from_spec(spec)
spec.loader.exec_module(V)

SMITH_PT = "com voz forte, calorosa, rústica e encorpada de um ferreiro sábio e experiente diante da fornalha"
SMITH_EN = "with a strong, hearty, rustic, and weathered voice of an experienced master blacksmith"

# (voz, direção PT, direção EN, texto PT, texto EN) — o texto precisa ser idêntico ao do jogo
EXTRA = [
    ("Fenrir", SMITH_PT, SMITH_EN,
     "Só forjo com Pedra Cobalto. Essas armas são feitas dela, por isso são tão raras. E ela só existe nas Cavernas Dorf; o portal branco fica logo ali no canto.",
     "I only forge with Cobalt Stone. These weapons are made of it, that's why they're so rare. And it's only found in the Dorf Caves; the white portal is right there in the corner."),
    ("Fenrir", SMITH_PT + ", firme e direto", SMITH_EN + ", firm and blunt",
     "Sem Pedra Cobalto, sem forja. Desça às Cavernas Dorf e minere os veios azuis.",
     "No Cobalt Stone, no forging. Go down to the Dorf Caves and mine the blue veins."),
    # Guardiã (Aoede) ao trazer o herói que caiu na caverna e perdeu metade da pedra; no Refúgio a fala sai com o nome na frente
    ("Aoede", None, None,
     "Você caiu, herói. Eu te trouxe para se recuperar, mas metade da Pedra Cobalto que você juntou ficou caída na caverna.",
     "You fell, hero. I brought you here to recover, but half of the Cobalt Stone you gathered was left behind in the cave.",
     ["A Guardiã: Você caiu, herói. Eu te trouxe para se recuperar, mas metade da Pedra Cobalto que você juntou ficou caída na caverna.",
      "The Guardian: You fell, hero. I brought you here to recover, but half of the Cobalt Stone you gathered was left behind in the cave."]),
]


def main():
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise SystemExit("defina GEMINI_API_KEY")
    with open(V.MANIFEST_PATH, encoding="utf-8") as f:
        man = json.load(f)
    for row in EXTRA:
        voice, dpt, den, pt, en = row[:5]
        aliases = row[5] if len(row) > 5 else []
        lid = V.fnv(pt)
        if "--force" not in sys.argv and man["d"].get(lid) and os.path.isfile(os.path.join(V.OUT_PT, lid + ".mp3")) and os.path.isfile(os.path.join(V.OUT_EN, lid + ".mp3")):
            print("já existe:", lid, pt[:40])
            for al in aliases:
                man["k"][V.fnv(al)] = lid
            continue
        print("gerando", lid, pt[:50], "...", end="", flush=True)
        # sem instrução de direção: com ela o modelo às vezes lê a instrução em voz alta;
        # o timbre vem da própria voz escolhida (Fenrir = grave e rústico)
        pt_mp3, pt_d = V.generate_gemini(key, pt, None, voice)
        en_mp3, en_d = V.generate_gemini(key, en, None, voice)
        for d in (V.OUT_PT, V.MIRROR_PT):
            os.makedirs(d, exist_ok=True)
            open(os.path.join(d, lid + ".mp3"), "wb").write(pt_mp3)
        for d in (V.OUT_EN, V.MIRROR_EN):
            os.makedirs(d, exist_ok=True)
            open(os.path.join(d, lid + ".mp3"), "wb").write(en_mp3)
        man["k"][lid] = lid
        man["k"][V.fnv(en)] = lid
        for al in aliases:
            man["k"][V.fnv(al)] = lid
        man["d"][lid] = {"pt": pt_d, "en": en_d}
        print(f" ok (PT {pt_d}s, EN {en_d}s)")
        time.sleep(0.5)
    txt = json.dumps(man, indent=2, ensure_ascii=False)
    open(V.MANIFEST_PATH, "w", encoding="utf-8").write(txt)
    open(V.MIRROR_MANIFEST, "w", encoding="utf-8").write(txt)


if __name__ == "__main__":
    main()
