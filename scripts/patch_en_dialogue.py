"""
Inglês mais natural em todos os diálogos e textos do jogo (scripts/en_dialogue.json).
  fix: inglês antigo -> novo, aplicado na tabela de tradução da história (__TR.en), nas narrações das fases (gi.en),
       nos textos do jogo (Rs.en: legendas do vídeo, menus, dicas) e em toda fala escolhida por __L3(pt,en,es)
       (aldeia, heróis, prólogo, espiões, enigmas…)
  add: falas que não tinham inglês (português -> inglês) entram na tabela __TR.en
A dublagem em inglês lê o mesmo arquivo (scripts/build_voice_dub.py). Re-executável.
"""
import base64
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__ENDLG__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    s = s[:a] + s[b + len(T):]
X = json.load(open(os.path.join(ROOT, "scripts", "en_dialogue.json"), encoding="utf-8"))
X = {"fix": {k: v for k, v in X["fix"].items() if k != v}, "add": X["add"]}
SRC = ("const __ENX=" + json.dumps(X, ensure_ascii=False, separators=(",", ":")) + ";"
       "(function(){const F=__ENX.fix,A=__ENX.add;"
       "try{const D=__TR.en;for(const k in D){const v=D[k];F[v]!=null&&(D[k]=F[v])}for(const k in A)D[k]=A[k]}catch(e){}"
       "try{for(const lv in gi.en)for(const kk in gi.en[lv]){const a=gi.en[lv][kk];Array.isArray(a)&&a.forEach((t,i)=>{F[t]!=null&&(a[i]=F[t])})}}catch(e){}"
       "try{const R=Rs.en;for(const k in R){const v=R[k];typeof v==='string'&&F[v]!=null&&(R[k]=F[v])}}catch(e){}})();"
       "{const o=__L3;__L3=function(a,b,c){const r=o(a,b,c);return r===b&&r!==a&&__ENX.fix[b]!=null?__ENX.fix[b]:r}}")
s = s + T + "\n" + SRC + "\n" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("inglês revisado:", len(X["fix"]), "trocas,", len(X["add"]), "falas novas")
