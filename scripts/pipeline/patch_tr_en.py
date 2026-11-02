import os
import sys
import json
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, ".")
from scripts.pipeline.generate_new_quest_voices import DIALOGUES

tr_map = {}
for pt, en in DIALOGUES:
    tr_map[pt] = en

assign_code = f";Object.assign(__TR.en,{json.dumps(tr_map, ensure_ascii=False)});"

bundle_files = [
    "assets/index-D6qIWtA7-p209.js",
    "Projeto atualizado/assets/index-D6qIWtA7-p209.js"
]

anchor = 'Object.assign(__TR.en,{"Olhe nos meus olhos'

for bf in bundle_files:
    if not os.path.exists(bf):
        print(f"File not found: {bf}")
        continue
    with open(bf, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "Wait. A letter crossed one of the gates" in content:
        print(f"Already injected in {bf}")
        continue
    
    idx = content.find(anchor)
    if idx == -1:
        print(f"ERROR: anchor not found in {bf}")
        continue
    
    new_content = content[:idx] + assign_code + content[idx:]
    with open(bf, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Successfully injected translations into {bf}")

print("Done!")
