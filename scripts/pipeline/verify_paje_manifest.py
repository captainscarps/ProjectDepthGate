import sys, json
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, ".")

with open("assets/audio/voice/voice-manifest.json", "r", encoding="utf-8") as f:
    mf = json.load(f)

with open("Projeto atualizado/assets/audio/voice/voice-manifest.json", "r", encoding="utf-8") as f:
    mf_proj = json.load(f)

from scripts.pipeline.patch_tr_en_paje import PAJE_TRANSLATIONS
from scripts.pipeline.generate_secondary_quest_voices import fnv

print("Total keys in manifest:", len(mf["k"]), "durations:", len(mf["d"]))
all_ok = True
for pt, en in PAJE_TRANSLATIONS.items():
    h_pt = fnv(pt)
    h_en = fnv(en)
    if h_pt not in mf["d"]:
        print("Missing duration for:", pt, h_pt)
        all_ok = False
    if h_pt not in mf["k"] or h_en not in mf["k"]:
        print("Missing key map for:", pt)
        all_ok = False
    print(f"Pajé [{h_pt}]: PT={mf['d'][h_pt]['pt']}s, EN={mf['d'][h_pt]['en']}s | \"{pt[:30]}...\"")

print("All Pajé lines present in assets manifest:", all_ok)
print("Manifest match between assets and Projeto atualizado:", len(mf["d"]) == len(mf_proj["d"]))
