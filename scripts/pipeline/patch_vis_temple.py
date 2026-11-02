import sys

sys.stdout.reconfigure(encoding="utf-8")

old_pattern = '["pr-1","pr-2","pr-3","pr-4","pr-5","pr-6","vis-catacombs","vis-ruins","vis-glacial","vis-fortress","vis-bosque","vis-rio","vis-morta"]'
new_pattern = '["pr-1","pr-2","pr-3","pr-4","pr-5","pr-6","vis-catacombs","vis-ruins","vis-glacial","vis-fortress","vis-bosque","vis-rio","vis-morta","vis-temple"]'

files = [
    "assets/index-D6qIWtA7-p209.js",
    "Projeto atualizado/assets/index-D6qIWtA7-p209.js"
]

for fp in files:
    with open(fp, "r", encoding="utf-8") as f:
        content = f.read()

    if old_pattern in content:
        content = content.replace(old_pattern, new_pattern)
        with open(fp, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {fp} with vis-temple preload.")
    elif new_pattern in content:
        print(f"{fp} already has vis-temple preload.")
    else:
        print(f"WARNING: pattern not found in {fp}!")
