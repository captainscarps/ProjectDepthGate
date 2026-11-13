"""Taverna do Refúgio: põe o Farias e a Maria na caixa de fala com retrato do Refúgio (mapa SP do __hubDlg) e
coloca scripts/source/taverna.js no bundle (via patch_book_ui.py, bloco /*__TAVERNA__*/). Re-executável."""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(ROOT, "scripts", "source", "taverna.js"); t = open(src, encoding="utf-8").read()
TL = json.load(open(os.path.join(ROOT, "scripts", "taverna_lines.json"), encoding="utf-8")); TL.pop("_about", None)
t = re.sub(r"/\*__TVLINES__\*/.*?/\*__TVLINES_END__\*/", lambda m: "/*__TVLINES__*/" + json.dumps(TL, ensure_ascii=False, separators=(",", ":")) + "/*__TVLINES_END__*/", t, flags=re.S)
open(src, "w", encoding="utf-8").write(t)
B = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"); s = open(B, encoding="utf-8").read()
OLD = 'const SP={rafael:["RAFAEL","ferreiro"],alline:["ALLINE","alline"]}'
NEW = 'const SP={rafael:["RAFAEL","ferreiro"],alline:["ALLINE","alline"],farias:["FARIAS","farias"],maria:["MARIA","maria"]}'
if OLD in s: s = s.replace(OLD, NEW); open(B, "w", encoding="utf-8").write(s); print("SP ok")
elif NEW in s or "farias:[\"FARIAS\",\"farias\"]" in s: print("SP já estava")
else: sys.exit("SP não encontrado")
OLD2 = 'this.hint.setText(this.area==="in"?__L3("Converse com o ferreiro ou saia pela porta","Talk to the blacksmith or leave through the door","Habla con el herrero o sal por la puerta"):'
NEW2 = 'this.hint.setText(this.area==="in"?(this.__tv?__L3("Converse com o Farias e a Maria ou saia pela porta","Talk to Farias and Maria or leave through the door","Habla con Farias y María o sal por la puerta"):__L3("Converse com o ferreiro ou saia pela porta","Talk to the blacksmith or leave through the door","Habla con el herrero o sal por la puerta")):'
s = open(B, encoding="utf-8").read()
if OLD2 in s: s = s.replace(OLD2, NEW2); open(B, "w", encoding="utf-8").write(s); print("dica ok")
elif NEW2 not in s: sys.exit("dica não encontrada")
subprocess.run([sys.executable, os.path.join(ROOT, "scripts", "patch_book_ui.py")], check=True)
