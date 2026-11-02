import sys, json, os
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, ".")

from scripts.pipeline.generate_hero_voices import HERO_DIALOGUES, fnv

vm = json.load(open("assets/audio/voice/voice-manifest.json", encoding="utf-8"))
js_bundle = open("assets/index-D6qIWtA7-p209.js", encoding="utf-8").read()

all_ok = True
print(f"=== Verifying {len(HERO_DIALOGUES)} Hero Dialogues ===")

for idx, (pt_text, en_text) in enumerate(HERO_DIALOGUES, 1):
    lid = fnv(pt_text)
    h_en = fnv(en_text)

    k_pt = vm["k"].get(lid) == lid
    k_en = vm["k"].get(h_en) == lid
    has_d = lid in vm["d"] and vm["d"][lid].get("pt", 0) > 0 and vm["d"][lid].get("en", 0) > 0

    file_pt = os.path.exists(f"assets/audio/voice/pt/{lid}.mp3") and os.path.getsize(f"assets/audio/voice/pt/{lid}.mp3") > 1000
    file_en = os.path.exists(f"assets/audio/voice/en/{lid}.mp3") and os.path.getsize(f"assets/audio/voice/en/{lid}.mp3") > 1000
    mirror_pt = os.path.exists(f"Projeto atualizado/assets/audio/voice/pt/{lid}.mp3")
    mirror_en = os.path.exists(f"Projeto atualizado/assets/audio/voice/en/{lid}.mp3")

    in_bundle = en_text in js_bundle

    ok = k_pt and k_en and has_d and file_pt and file_en and mirror_pt and mirror_en and in_bundle

    if not ok:
        all_ok = False
        print(f"[{idx:02d}] FAIL LID:{lid} | k_pt:{k_pt} k_en:{k_en} d:{has_d} f_pt:{file_pt} f_en:{file_en} bundle:{in_bundle}")
    else:
        d = vm["d"][lid]
        print(f"[{idx:02d}] OK LID:{lid} | PT: {d['pt']}s | EN: {d['en']}s | in_bundle: YES | {pt_text[:45]}...")

if all_ok:
    print("\nALL 21 HERO DIALOGUES 100% VERIFIED AND READY!")
else:
    print("\nSOME DIALOGUES FAILED VERIFICATION!")
    sys.exit(1)
