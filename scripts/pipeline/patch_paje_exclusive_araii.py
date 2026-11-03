import os
import sys
import hashlib
import json

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

bundle_files = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
]

for bf in bundle_files:
    if not os.path.exists(bf):
        print(f"Skipping (not found): {bf}")
        continue
    with open(bf, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Hub spawn in forest
    old_hub_spawn = 'if (__Q.get(S, "pj") || n >= 2) __qPajeHub(S);'
    new_hub_spawn = 'if ((__Q.get(S, "pj") || n >= 2) && __Q.cls(S) === "SHAMAN") __qPajeHub(S);'
    if old_hub_spawn in content:
        content = content.replace(old_hub_spawn, new_hub_spawn)
        print(f"[{bf}] 1. Patched forest hub spawn")
    elif new_hub_spawn in content:
        print(f"[{bf}] 1. Hub spawn already patched")
    else:
        print(f"[{bf}] WARNING: old_hub_spawn not found!")

    # 2. __qPajeHub
    old_paje_hub = 'function __qPajeHub(S) {\n  const s = __Q.get(S, "pj"); if (s === 3) return;'
    new_paje_hub = 'function __qPajeHub(S) {\n  if (__Q.cls(S) !== "SHAMAN") return;\n  const s = __Q.get(S, "pj"); if (s === 3) return;'
    if old_paje_hub in content:
        content = content.replace(old_paje_hub, new_paje_hub)
        print(f"[{bf}] 2. Patched __qPajeHub check")
    elif new_paje_hub in content:
        print(f"[{bf}] 2. __qPajeHub already patched")
    else:
        print(f"[{bf}] WARNING: old_paje_hub not found!")

    # 3. __qPajeLevel
    old_paje_level = 'function __qPajeLevel(S) {\n  if (__Q.get(S, "pj") !== 1) return;'
    new_paje_level = 'function __qPajeLevel(S) {\n  if (__Q.cls(S) !== "SHAMAN" || __Q.get(S, "pj") !== 1) return;'
    if old_paje_level in content:
        content = content.replace(old_paje_level, new_paje_level)
        print(f"[{bf}] 3. Patched __qPajeLevel check")
    elif new_paje_level in content:
        print(f"[{bf}] 3. __qPajeLevel already patched")
    else:
        print(f"[{bf}] WARNING: old_paje_level not found!")

    # 4. __QLIST paje diary entry
    old_qlist_paje = '{ id: "paje", title: "O Último Pajé", st: (S) => { const s = __Q.get(S, "pj"); if (!s) return null;'
    new_qlist_paje = '{ id: "paje", title: "O Último Pajé", st: (S) => { if (__Q.cls(S) !== "SHAMAN") return null; const s = __Q.get(S, "pj"); if (!s) return null;'
    if old_qlist_paje in content:
        content = content.replace(old_qlist_paje, new_qlist_paje)
        print(f"[{bf}] 4. Patched __QLIST entry")
    elif new_qlist_paje in content:
        print(f"[{bf}] 4. __QLIST entry already patched")
    else:
        print(f"[{bf}] WARNING: old_qlist_paje not found!")

    # 5. __qPajeTalk
    old_talk_start = 'function __qPajeTalk(S, npc) {\n  const s = __Q.get(S, "pj"), ara = __Q.cls(S) === "SHAMAN", P = (t, e = "talk") => __Q.N("paje", "O PAJÉ", t, e);'
    new_talk_start = 'function __qPajeTalk(S, npc) {\n  if (__Q.cls(S) !== "SHAMAN") return;\n  const s = __Q.get(S, "pj"), P = (t, e = "talk") => __Q.N("paje", "O PAJÉ", t, e);'
    if old_talk_start in content:
        content = content.replace(old_talk_start, new_talk_start)
        print(f"[{bf}] 5a. Patched __qPajeTalk start check")
    elif new_talk_start in content:
        print(f"[{bf}] 5a. __qPajeTalk start already patched")
    else:
        print(f"[{bf}] WARNING: old_talk_start not found!")

    # 5b. Remove the forasteiro branch in initial talk
    old_intro_dlg = """    const L = ara ? [
      P("Kunhã… filha da mata. Eu sentia o seu cheiro de urucum desde o outro lado do portal.", "smile"),
      __Q.H(S, "Avô? O senhor é… um dos pajés do igapó?", "special"),
      P("O último que sobrou. Quando começaram a construir portais novos, o nosso selo velho rachou. Atravessei para segurá-lo."),
      P("Roubaram as três coisas sagradas do ritual. Sem elas, não consigo fechar a rachadura.", "sadness"),
    ] : [
      P("Hm. Mais um forasteiro tocado pelas Profundezas.", "calm"),
      __Q.H(S, "Quem é o senhor?"),
      P("Um velho que segura uma porta que não quer ficar fechada. Roubaram as coisas sagradas do meu ritual.", "sadness"),
      P("Se as encontrar pelo caminho, traga para mim. Talvez você sirva para alguma coisa.", "aggression"),
    ];"""

    new_intro_dlg = """    const L = [
      P("Kunhã… filha da mata. Eu sentia o seu cheiro de urucum desde o outro lado do portal.", "smile"),
      __Q.H(S, "Avô? O senhor é… um dos pajés do igapó?", "special"),
      P("O último que sobrou. Quando começaram a construir portais novos, o nosso selo velho rachou. Atravessei para segurá-lo."),
      P("Roubaram as três coisas sagradas do ritual. Sem elas, não consigo fechar a rachadura.", "sadness"),
    ];"""

    if old_intro_dlg in content:
        content = content.replace(old_intro_dlg, new_intro_dlg)
        print(f"[{bf}] 5b. Patched intro dialogue (exclusive to Araí)")
    elif new_intro_dlg in content:
        print(f"[{bf}] 5b. Intro dialogue already exclusive to Araí")
    else:
        print(f"[{bf}] WARNING: old_intro_dlg not found!")

    # 5c. Ritual dialogue:
    old_ritual_dlg = '__dlg(S, [P(ara ? "Tudo aqui. Segure o maracá comigo, kunhã. Cante comigo." : "Tudo aqui… você trouxe mesmo. Afaste-se.", "special")], () => {'
    new_ritual_dlg = '__dlg(S, [P("Tudo aqui. Segure o maracá comigo, kunhã. Cante comigo.", "special")], () => {'
    if old_ritual_dlg in content:
        content = content.replace(old_ritual_dlg, new_ritual_dlg)
        print(f"[{bf}] 5c. Patched ritual dialogue (exclusive to Araí)")
    elif new_ritual_dlg in content:
        print(f"[{bf}] 5c. Ritual dialogue already exclusive to Araí")
    else:
        print(f"[{bf}] WARNING: old_ritual_dlg not found!")

    # 5d. Ritual finish dialogue:
    old_fin_dlg = """      const L = [P("O igapó respira de novo. Leve a bênção da mata: ela vai segurar a sua vida como segurou a minha.", "smile")];
      ara && L.push(P("E ouça, kunhã: quem constrói os portais novos usa o mesmo símbolo do castelo. O olho. Cuidado com ele.", "aggression"), __Q.H(S, "O Observador…", "sadness"));"""
    
    new_fin_dlg = """      const L = [
        P("O igapó respira de novo. Leve a bênção da mata: ela vai segurar a sua vida como segurou a minha.", "smile"),
        P("E ouça, kunhã: quem constrói os portais novos usa o mesmo símbolo do castelo. O olho. Cuidado com ele.", "aggression"),
        __Q.H(S, "O Observador…", "sadness")
      ];"""

    if old_fin_dlg in content:
        content = content.replace(old_fin_dlg, new_fin_dlg)
        print(f"[{bf}] 5d. Patched ritual finish dialogue (exclusive to Araí)")
    elif new_fin_dlg in content:
        print(f"[{bf}] 5d. Ritual finish dialogue already exclusive to Araí")
    else:
        print(f"[{bf}] WARNING: old_fin_dlg not found!")

    with open(bf, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Wrote updated {bf}\n")

# Now bump sw.js cache version and update asset-versions.json
sw_files = [
    os.path.join(ROOT, "sw.js"),
    os.path.join(ROOT, "Projeto atualizado", "sw.js")
]

for sf in sw_files:
    if os.path.exists(sf):
        with open(sf, "r", encoding="utf-8") as f:
            sc = f.read()
        import re
        sc = re.sub(r'const CACHE = "ded-web-[^"]+";', 'const CACHE = "ded-web-v5.73.0-paje-exclusive-arai";', sc)
        with open(sf, "w", encoding="utf-8") as f:
            f.write(sc)
        print(f"Updated SW cache version in {sf}")

# Update asset-versions.json
av_files = [
    os.path.join(ROOT, "asset-versions.json"),
    os.path.join(ROOT, "Projeto atualizado", "asset-versions.json")
]
with open(av_files[0], "r", encoding="utf-8") as f:
    av = json.load(f)

# Update bundle MD5 in av
bundle_rel = "assets/index-D6qIWtA7-p209.js"
with open(os.path.join(ROOT, bundle_rel), "rb") as fp:
    av[bundle_rel] = hashlib.md5(fp.read()).hexdigest()[:10]

av_data = json.dumps(av, separators=(",", ":"), sort_keys=True)
for af in av_files:
    if os.path.exists(af):
        with open(af, "w", encoding="utf-8") as f:
            f.write(av_data)
        print(f"Updated {af}")

print("\n✓ Pajé configurado como 100% exclusivo da heroína Araí (SHAMAN)!")
