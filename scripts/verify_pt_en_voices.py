import json, os, sys
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, ".")

m = json.load(open('assets/audio/voice/voice-manifest.json', encoding='utf-8'))
from scripts.pipeline.generate_new_quest_voices import DIALOGUES, fnv

all_ok = True
for idx, (pt, en) in enumerate(DIALOGUES, 1):
    lid = fnv(pt)
    h_en = fnv(en)
    
    pt_in_k = lid in m['k'] and m['k'][lid] == lid
    en_in_k = h_en in m['k'] and m['k'][h_en] == lid
    in_d = lid in m['d']
    
    f_pt = os.path.exists(f'assets/audio/voice/pt/{lid}.mp3') and os.path.getsize(f'assets/audio/voice/pt/{lid}.mp3') > 1000
    f_en = os.path.exists(f'assets/audio/voice/en/{lid}.mp3') and os.path.getsize(f'assets/audio/voice/en/{lid}.mp3') > 1000
    m_pt = os.path.exists(f'Projeto atualizado/assets/audio/voice/pt/{lid}.mp3')
    m_en = os.path.exists(f'Projeto atualizado/assets/audio/voice/en/{lid}.mp3')
    
    ok = pt_in_k and en_in_k and in_d and f_pt and f_en and m_pt and m_en
    if not ok:
        all_ok = False
        print(f'[{idx:02d}] FAIL: {lid} pt_in_k={pt_in_k} en_in_k={en_in_k} in_d={in_d} f_pt={f_pt} f_en={f_en} m_pt={m_pt} m_en={m_en}')
    else:
        durs = m['d'][lid]
        print(f'[{idx:02d}] OK LID:{lid} | PT: {durs["pt"]}s | EN: {durs["en"]}s | EN hash:{h_en}')

if all_ok:
    print('\nALL 32 DIALOGUES FULLY VERIFIED IN PT AND EN (FILES, MANIFEST, MIRRORS)!')
else:
    sys.exit(1)
