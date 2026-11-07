"""Voz própria por herói na dublagem — reconhecer o herói que fala.

A dublagem (scripts/source/voice-webaudio.js) já toca "<id>-<CLASSE>.mp3" quando o manifesto marca a
fala com d[id].byClass[idioma][CLASSE], usando window.__currentSpeaker. Mas o __dlg só preenchia
__currentSpeaker quando a fala vinha com "who" (o retrato do herói precisava estar carregado).
Aqui ele também reconhece o herói pelo nome de quem fala (ex.: "DRAVEN" → WARRIOR).

Os áudios por herói saem de scripts/generate_hero_voice.py. Re-executável.
"""
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js"),
]
# versões anteriores deste patch (procuravam outra chave): voltam ao original
UNDO = [
    ('const __sid=window.__dubSpk?__DUB.m?.k?.[__dubH(String(window.__dubSpk).toLowerCase()+"|"+text)]:null,'
     'id=(__sid&&__DUB.m.d[__sid]?.[__dubLang()]?__sid:null)||__DUB.m?.k?.[__dubH(text)],D=id&&__DUB.m.d[id]/*__HEROVOICE__*/;',
     'const id=__DUB.m?.k?.[__dubH(text)],D=id&&__DUB.m.d[id];'),
    ('window.__dubSpk=who||"";'
     'if(!window.__dubSpk)try{const __hn=String(e.name||"").toUpperCase().trim();for(const[k,v]of Object.entries(__HN))if(String(v).toUpperCase()===__hn){window.__dubSpk="hero-"+k.toLowerCase();break}}catch(_){}'
     '__dub(full);window.__dubSpk=""/*__HEROVOICE2__*/;',
     '__dub(full);'),
    ('window.__dubSpk=who||"";__dub(full);window.__dubSpk=""/*__HEROVOICE__*/;', '__dub(full);'),
]
REPL = [
    ('}else{window.__currentSpeaker=(who&&who.startsWith("hero-"))?who.slice(5).toUpperCase():null',
     '}else{window.__currentSpeaker=(who&&who.startsWith("hero-"))?who.slice(5).toUpperCase():null;'
     'if(!window.__currentSpeaker)try{const __hn=String(e.name||"").toUpperCase().trim();'
     'for(const[k,v]of Object.entries(__HN))if(String(v).toUpperCase()===__hn){window.__currentSpeaker=k;break}}catch(_){}/*__HEROVOICE3__*/'),
]


def patch(path):
    s = open(path, encoding="utf-8").read()
    n = 0
    for new, old in UNDO:
        if new in s:
            s = s.replace(new, old)
            n += 1
    for old, new in REPL:
        if new in s:
            continue
        if s.count(old) != 1:
            raise SystemExit(f"padrão não encontrado em {path}: {old[:60]}")
        s = s.replace(old, new)
        n += 1
    open(path, "w", encoding="utf-8").write(s)
    print(f"{os.path.relpath(path, ROOT)}: {n} trocas")


for t in TARGETS:
    if os.path.isfile(t):
        patch(t)
