import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

paths = [
    os.path.join(ROOT, 'assets', 'pixel-art', 'forest-open', 'frb-meta.json'),
    os.path.join(ROOT, 'Projeto atualizado', 'assets', 'pixel-art', 'forest-open', 'frb-meta.json')
]

for p in paths:
    with open(p, 'r', encoding='utf-8') as f:
        meta = json.load(f)
    
    before_count = len(meta['front'])
    # Filter out trees that fall inside the circular sanctuary clearing
    meta['front'] = [
        t for t in meta['front']
        if not (1080 <= t[0] <= 1950 and 0 <= t[1] <= 450)
    ]
    after_count = len(meta['front'])
    print(f"Patched {p}: removed {before_count - after_count} front trees.")
    
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(meta, f, separators=(',', ':'))

print("[OK] frb-meta.json updated successfully in both directories!")
