import os
import sys
import json

sys.stdout.reconfigure(encoding="utf-8")

PAJE_TRANSLATIONS = {
    "Kunhã… filha da mata. Eu sentia o seu cheiro de urucum desde o outro lado do portal.":
        "Kunhã… daughter of the forest. I could smell your annatto from the other side of the gate.",
    "O último que sobrou. Quando começaram a construir portais novos, o nosso selo velho rachou. Atravessei para segurá-lo.":
        "The last one left. When they began building new gates, our ancient seal cracked. I crossed over to hold it.",
    "Roubaram as três coisas sagradas do ritual. Sem elas, não consigo fechar a rachadura.":
        "They stole the three sacred objects of the ritual. Without them, I cannot mend the fracture.",
    "Hm. Mais um forasteiro tocado pelas Profundezas.":
        "Hm. Another outlander touched by the Depths.",
    "Um velho que segura uma porta que não quer ficar fechada. Roubaram as coisas sagradas do meu ritual.":
        "An old man holding a door that refuses to stay shut. They stole the sacred relics of my ritual.",
    "Se as encontrar pelo caminho, traga para mim. Talvez você sirva para alguma coisa.":
        "If you find them on your path, bring them to me. Perhaps you may be of some use after all.",
    "Ainda faltam 3. A mata espera.":
        "There are still 3 missing. The forest waits.",
    "Ainda faltam 2. A mata espera.":
        "There are still 2 missing. The forest waits.",
    "Ainda faltam 1. A mata espera.":
        "There is still 1 missing. The forest waits.",
    "Ainda falta 1. A mata espera.":
        "There is still 1 missing. The forest waits.",
    "Tudo aqui. Segure o maracá comigo, kunhã. Cante comigo.":
        "Everything is here. Hold the maracá with me, kunhã. Sing with me.",
    "Tudo aqui… você trouxe mesmo. Afaste-se.":
        "Everything is here… you truly brought it. Step back.",
    "O igapó respira de novo. Leve a bênção da mata: ela vai segurar a sua vida como segurou a minha.":
        "The flooded forest breathes once more. Take the forest's blessing: it will sustain your life as it did mine.",
    "E ouça, kunhã: quem constrói os portais novos usa o mesmo símbolo do castelo. O olho. Cuidado com ele.":
        "And listen, kunhã: whoever builds the new gates bears the same symbol as the castle. The eye. Beware of it."
}

assign_code = f";Object.assign(__TR.en,{json.dumps(PAJE_TRANSLATIONS, ensure_ascii=False)});"

bundle_files = [
    "assets/index-D6qIWtA7-p209.js",
    "Projeto atualizado/assets/index-D6qIWtA7-p209.js"
]

anchor = ';Object.assign(__TR.en,{"Filho das Profundezas'

for bf in bundle_files:
    if not os.path.exists(bf):
        print(f"File not found: {bf}")
        continue
    with open(bf, "r", encoding="utf-8") as f:
        content = f.read()

    if "Kunhã… daughter of the forest" in content:
        print(f"Already injected in {bf}")
        continue

    idx = content.find(anchor)
    if idx == -1:
        print(f"ERROR: anchor not found in {bf}")
        continue

    new_content = content[:idx] + assign_code + content[idx:]
    with open(bf, "w", encoding="utf-8") as f:
        f.write(new_content)
    print(f"Successfully injected Pajé translations into {bf}")

print("Translation patch complete!")
