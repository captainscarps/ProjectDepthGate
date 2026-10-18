"""
Druida: remove o nome antigo "Paladino" do código (classe PALADIN -> DRUID, texturas/arquivos paladin-* -> druid-*)
e renomeia no código as formas antigas (urso/pantera) para Javali e Lobisomem.
  form "bear"     -> "javali"       BEAR_FORM    -> JAVALI_FORM     icon-bear-form    -> icon-javali-form
  form "panther"  -> "lobisomem"    PANTHER_FORM -> LOBISOMEM_FORM  icon-panther-form -> icon-lobisomem-form
  mk4b-paladin-bear/panther -> mk4b-paladin-javali/lobisomem  (arquivos paladin-*-body.png também)
Inclui migração automática dos saves (localStorage) com os IDs antigos.
Re-executável.
"""
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
s = open(BUNDLE, encoding="utf-8").read()

MIG_TAG = "/*__DRUID_FORMS_MIGRATION__*/"
MIG = (MIG_TAG + '(()=>{try{const P="PALA"+"DIN",p="pala"+"din",RX=[[new RegExp(\'"\'+"BEAR"+"_FORM"+\'"\',"g"),\'"JAVALI_FORM"\'],'
       '[new RegExp(\'"\'+"PANTHER"+"_FORM"+\'"\',"g"),\'"LOBISOMEM_FORM"\'],[new RegExp("\\\\b"+P+"\\\\b","g"),"DRUID"],[new RegExp("\\\\b"+p+"\\\\b","g"),"druid"]];'
       'const fix=t=>{let w=t;for(const[a,b]of RX)w=w.replace(a,b);return w};const K=[];for(let n=0;n<localStorage.length;n++)K.push(localStorage.key(n));'
       'for(const k of K){if(!k)continue;const v=localStorage.getItem(k);if(v==null)continue;const k2=fix(k),w=fix(v);'
       'if(k2!==k){localStorage.getItem(k2)==null&&localStorage.setItem(k2,w);localStorage.removeItem(k)}else w!==v&&localStorage.setItem(k,w)}}catch(e){}})();\n')
# remove versão anterior da migração (se houver) — será reinserida no fim
if MIG_TAG in s:
    e = s.index("\n", s.index(MIG_TAG)) + 1
    s = s[e:] if s.startswith(MIG_TAG) else s

# IDs de habilidade (sempre entre aspas no código) e ícones
pairs = [
    ('"BEAR_FORM"', '"JAVALI_FORM"'), ('"PANTHER_FORM"', '"LOBISOMEM_FORM"'),
    ('BEAR_FORM:{id:', 'JAVALI_FORM:{id:'), ('PANTHER_FORM:{id:', 'LOBISOMEM_FORM:{id:'),
    ('"icon-bear-form"', '"icon-javali-form"'), ('"icon-panther-form"', '"icon-lobisomem-form"'),
    ('form:"bear"', 'form:"javali"'), ('form:"panther"', 'form:"lobisomem"'),
    ('i.form==="bear"', 'i.form==="javali"'),
    ('for(const f of["bear","panther"])this.load.spritesheet(`mk4b-paladin-${f}`',
     'for(const f of["javali","lobisomem"])this.load.spritesheet(`mk4b-paladin-${f}`'),
    ('"mk4b-paladin-bear","mk4b-paladin-panther"', '"mk4b-paladin-javali","mk4b-paladin-lobisomem"'),
    ('"Forma de Javali / Urso (Bear Form): ', '"Forma de Javali: '),
    ('"Forma de Pantera / Lobo (Panther Form): ', '"Forma de Lobisomem: '),
]
for a, b in pairs:
    s = s.replace(a, b)

# não pode sobrar nenhuma referência às formas antigas (exceto a própria migração)
body = s
left = re.findall(r'BEAR_FORM|PANTHER_FORM|icon-bear-form|icon-panther-form|mk4b-paladin-bear|mk4b-paladin-panther|form:"bear"|form:"panther"|form==="bear"|form==="panther"', body)
assert not left, f"sobraram referências: {sorted(set(left))}"


# classe: PALADIN -> DRUID  e  paladin -> druid (ids, texturas, caminhos de arquivo)
s = re.sub(r'\bPALADIN\b', 'DRUID', s)
s = re.sub(r'paladin', 'druid', s)
# compatibilidade: quem ainda mandar "PALADIN" (coop/nuvem de versão antiga) recebe o Druida
ALIAS = 'try{Object.defineProperty(pe,"PALA"+"DIN",{get:()=>pe.DRUID,enumerable:!1,configurable:!0})}catch(e){}'
A = 'const ia={WARRIOR:{orb:'
if ALIAS not in s:
    assert s.count(A) == 1
    s = s.replace(A, ALIAS + A)
left = re.findall(r'PALADIN|paladin', s)
assert not left, f"sobrou paladin: {len(left)}"

s = MIG + s
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)

# arquivos de arte
REN = [("pixel-art/characters/paladin-bear-body.png", "pixel-art/characters/paladin-javali-body.png"),
       ("pixel-art/characters/paladin-panther-body.png", "pixel-art/characters/paladin-lobisomem-body.png"),
       ("pixel-art/ui/icon-bear-form.png", "pixel-art/ui/icon-javali-form.png"),
       ("pixel-art/ui/icon-panther-form.png", "pixel-art/ui/icon-lobisomem-form.png"),
       ("pixel-art/ui/icons/BEAR_FORM.png", "pixel-art/ui/icons/JAVALI_FORM.png"),
       ("pixel-art/ui/icons/PANTHER_FORM.png", "pixel-art/ui/icons/LOBISOMEM_FORM.png")]
for base in (os.path.join(ROOT, "assets"), os.path.join(ROOT, "Projeto atualizado", "assets")):
    for a, b in REN:
        pa, pb = os.path.join(base, a), os.path.join(base, b)
        if os.path.exists(pa) and not os.path.exists(pb):
            r = subprocess.run(["git", "mv", pa, pb], cwd=ROOT, capture_output=True)
            if r.returncode != 0:
                os.rename(pa, pb)
# todos os arquivos com "paladin" no nome -> "druid";  vídeo PALADIN.mp4 -> DRUID.mp4
for base in (os.path.join(ROOT, "assets"), os.path.join(ROOT, "Projeto atualizado", "assets")):
    for dp, dn, fn in os.walk(base):
        for f in fn:
            g = f.replace("paladin", "druid").replace("PALADIN", "DRUID")
            if g != f and not os.path.exists(os.path.join(dp, g)):
                r = subprocess.run(["git", "mv", os.path.join(dp, f), os.path.join(dp, g)], cwd=ROOT, capture_output=True)
                if r.returncode != 0:
                    os.rename(os.path.join(dp, f), os.path.join(dp, g))
print("formas do Druida renomeadas (javali / lobisomem)")
