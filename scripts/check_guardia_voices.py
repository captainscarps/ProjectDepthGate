import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def fnv(t):
    h = 0x811c9dc5
    b = (' '.join(str(t).strip().split())).encode('utf-16-le')
    for i in range(0, len(b), 2):
        code = b[i] | (b[i+1] << 8)
        h ^= code
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f'{h:08x}'

manifest_path = os.path.join(ROOT, 'assets', 'audio', 'voice', 'voice-manifest.json')
with open(manifest_path, encoding='utf-8') as f:
    manifest = json.load(f)

source_dir = os.path.join(ROOT, 'scripts', 'source')
guardia_phrases = []

for fname in os.listdir(source_dir):
    if not fname.endswith('.js'):
        continue
    fpath = os.path.join(source_dir, fname)
    with open(fpath, encoding='utf-8') as f:
        content = f.read()

    # Find G(...) helper calls in quests.js or witch-quest.js: G(text, expr)
    for m in re.finditer(r'G\(\s*(?:L3\(|__L3\(|L\()?["\']([^"\']+)["\']', content):
        guardia_phrases.append((fname, m.group(1), "G() helper"))

    # Find __gSay(S, [{who: "guardia", text: "..."}]) or lines in relic-effects.js
    for m in re.finditer(r'who:\s*["\']guardia["\'][^}]*?text:\s*(?:L3\(|__L3\(|L\()?["\']([^"\']+)["\']', content):
        guardia_phrases.append((fname, m.group(1), "who: guardia"))

    # Find __dlg(S, [{who: "guardia", ... text: "..."}])
    for m in re.finditer(r'who:\s*["\']guardia["\'][^}]*?text:\s*["\']([^"\']+)["\']', content):
        guardia_phrases.append((fname, m.group(1), "who: guardia (literal)"))

# Check relic lines specifically
relic_path = os.path.join(source_dir, 'relic-effects.js')
if os.path.exists(relic_path):
    with open(relic_path, encoding='utf-8') as f:
        rc = f.read()
    for m in re.finditer(r'\[\s*["\']([a-z_]+)["\'],\s*["\'][^"\']+["\'],\s*["\'][^"\']+["\'],\s*\[\s*["\']([^"\']+)["\']\s*,\s*["\']([^"\']+)["\']', rc):
        guardia_phrases.append(('relic-effects.js', m.group(2), f"relic line ({m.group(1)})"))

# Cave return lines
guardia_phrases.append(('dorf-caves.js', "Você caiu, herói. Eu te trouxe para se recuperar.", "dorf-caves return"))
guardia_phrases.append(('dorf-caves.js', "A Guardiã: Você caiu, herói. Eu te trouxe para se recuperar.", "dorf-caves return with name"))

# Also check voice_extra_lines.json
extra_path = os.path.join(ROOT, 'scripts', 'voice_extra_lines.json')
with open(extra_path, encoding='utf-8') as f:
    extra = json.load(f)
for l in extra:
    if l.get('voice') == 'guardia' or 'guardia' in str(l.get('role', '')):
        guardia_phrases.append(('voice_extra_lines.json', l['text'], "voice_extra_lines.json"))

results = []
seen = set()
for fname, text, origin in guardia_phrases:
    if text in seen:
        continue
    seen.add(text)
    h_pt = fnv(text)
    id_pt = manifest['k'].get(h_pt, h_pt)
    file_pt = os.path.exists(os.path.join(ROOT, 'assets', 'audio', 'voice', 'pt', f'{id_pt}.mp3'))
    results.append({
        'file': fname,
        'text': text,
        'origin': origin,
        'hash': h_pt,
        'id': id_pt,
        'has_file': file_pt
    })

print("\n=== DETALHE DAS FALAS ENCONTRADAS ===")
missing = [r for r in results if not r['has_file']]
found = [r for r in results if r['has_file']]

print(f"Total de falas verificadas: {len(results)}")
print(f"Falas com audio existente (OK): {len(found)}")
print(f"Falas SEM audio (FALTANDO): {len(missing)}")

print("\n--- LISTA DE FALAS FALTANDO ---")
for m in missing:
    print(f"[{m['file']}] Hash: {m['hash']} (id: {m['id']}) | Origem: {m['origin']}")
    print(f"   Texto: \"{m['text']}\"")
