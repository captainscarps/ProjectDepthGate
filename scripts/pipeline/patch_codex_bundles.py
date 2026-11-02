import sys

sys.stdout.reconfigure(encoding="utf-8")

old_pattern = '["forest","castle","catacombs","ruins","temple","glacial","vulcao","fortress","bosque","rio","morta"]'
new_pattern = '["forest","castle","catacombs","ruins","temple","glacial","vulcao","fortress","bosque","rio","morta","cripta","bruxa"]'

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
        print(f"Updated {fp} with extended codex preload list.")
    elif new_pattern in content:
        print(f"{fp} already has extended codex preload list.")
    else:
        print(f"WARNING: pattern not found in {fp}!")
