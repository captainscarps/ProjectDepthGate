import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 1. Update index.html and Projeto atualizado/index.html
for rel in ['index.html', os.path.join('Projeto atualizado', 'index.html')]:
    path = os.path.join(ROOT, rel)
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()
    html = html.replace('?v=5.73', '?v=5.74')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f'Bumped version to 5.74 in {rel}')

# 2. Update sw.js and Projeto atualizado/sw.js
for rel in ['sw.js', os.path.join('Projeto atualizado', 'sw.js')]:
    path = os.path.join(ROOT, rel)
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        sw = f.read()
    sw = sw.replace('const CACHE = "ded-web-v5.73.0-paje-exclusive-arai";',
                    'const CACHE = "ded-web-v5.74.0-endless-dorf-forge";')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(sw)
    print(f'Bumped SW cache to v5.74.0 in {rel}')
