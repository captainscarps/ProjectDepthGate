"""Olivia no Refúgio: embute scripts/olivia_lines.json em scripts/source/olivia.js, põe a Olivia no mapa de retratos
da caixa de fala (__hubDlg) e roda o patch_book_ui.py (bloco /*__OLIVIA__*/). Re-executável."""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(ROOT, "scripts", "source", "olivia.js"); s = open(src, encoding="utf-8").read()
L = json.load(open(os.path.join(ROOT, "scripts", "olivia_lines.json"), encoding="utf-8")); L.pop("_about", None)
s = re.sub(r"/\*__OLINES__\*/.*?/\*__OLINES_END__\*/", lambda m: "/*__OLINES__*/" + json.dumps(L, ensure_ascii=False, separators=(",", ":")) + "/*__OLINES_END__*/", s, flags=re.S)
open(src, "w", encoding="utf-8").write(s)
B = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"); b = open(B, encoding="utf-8").read()
OLD = 'farias:["FARIAS","farias"],maria:["MARIA","maria"]}'; NEW = 'farias:["FARIAS","farias"],maria:["MARIA","maria"],olivia:["OLIVIA","olivia"]}'
if OLD in b: b = b.replace(OLD, NEW); open(B, "w", encoding="utf-8").write(b); print("SP ok")
elif NEW not in b: sys.exit("SP não encontrado (rode patch_taverna.py antes)")
subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "patch_book_ui.py")], check=True)
