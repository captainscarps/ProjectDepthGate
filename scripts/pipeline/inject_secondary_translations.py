import os
import sys
import json

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from generate_secondary_quest_voices import SECONDARY_NPC_DIALOGUES

tr_map = {}
for item in SECONDARY_NPC_DIALOGUES:
    tr_map[item["pt"]] = item["en"]

tr_snippet = ";Object.assign(__TR.en," + json.dumps(tr_map, ensure_ascii=False) + ");\n"

bundles = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
]

target_marker = ';Object.assign(__TR.en,{"É a letra do meu irmão'

for bp in bundles:
    if not os.path.exists(bp):
        continue
    with open(bp, "r", encoding="utf-8") as f:
        code = f.read()

    if target_marker in code:
        code = code.replace(target_marker, tr_snippet + target_marker)
        with open(bp, "w", encoding="utf-8") as f:
            f.write(code)
        print(f"Successfully injected translations into {bp}")
    else:
        # Fallback: append before the last script tag or after Object.assign(__TR.en
        pos = code.find('Object.assign(__TR.en,')
        if pos != -1:
            code = code[:pos] + tr_snippet + code[pos:]
            with open(bp, "w", encoding="utf-8") as f:
                f.write(code)
            print(f"Injected translations at first Object.assign in {bp}")
        else:
            print(f"ERROR: Could not find insertion point in {bp}")

print("Translation injection complete!")
