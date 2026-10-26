"""
Lembranças da Guardiã: depois de cada "Eco do passado" ela comenta de longe a cena que o herói viu.
Código em scripts/source/guardian-memories.js; traduções EN/ES entram no dicionário __TR. Re-executável.
"""
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
SRC = open(os.path.join(ROOT, "scripts", "source", "guardian-memories.js"), encoding="utf-8").read()
TR = {
 "Esses túmulos guardam nomes de quem nunca foi enterrado aqui. Alguns segredos precisaram de séculos de silêncio.":
  ("These tombs keep the names of people who were never buried here. Some secrets needed centuries of silence.",
   "Estas tumbas guardan nombres de quienes nunca fueron enterrados aquí. Algunos secretos necesitaron siglos de silencio."),
 "Não julgue os que fugiram, herói. Eu também já precisei escolher entre a verdade e o meu povo.":
  ("Don't judge the ones who fled, hero. I too once had to choose between the truth and my people.",
   "No juzgues a los que huyeron, héroe. Yo también tuve que elegir entre la verdad y mi pueblo."),
 "O brasão nas fechaduras… eu vi quando foi gravado. Ou sonhei que vi.":
  ("The crest on the locks… I saw it being carved. Or I dreamed I did.",
   "El blasón en las cerraduras… vi cuando lo grabaron. O soñé que lo vi."),
 "Às vezes as lembranças dos selos se confundem com as minhas. Já não sei onde uma termina e a outra começa.":
  ("Sometimes the memories of the seals blur with my own. I no longer know where one ends and the other begins.",
   "A veces los recuerdos de los sellos se confunden con los míos. Ya no sé dónde termina uno y empieza el otro."),
 "…Você viu. Eu sei que viu.": ("…You saw it. I know you did.", "…Lo viste. Sé que lo viste."),
 "Aquela voz no gelo ainda não tem explicação que eu possa dar. Peço só que confie em mim mais um pouco.":
  ("That voice in the ice has no explanation I can give you yet. I only ask that you trust me a little longer.",
   "Esa voz en el hielo todavía no tiene una explicación que pueda darte. Solo te pido que confíes en mí un poco más."),
 "Ele pediu ao dragão que não o deixasse passar… nem mesmo ele.":
  ("He asked the dragon not to let him pass… not even him.", "Le pidió al dragón que no lo dejara pasar… ni siquiera a él."),
 "Lembre-se dessas palavras quando chegar ao castelo. Ele sabia o que estava deixando entrar.":
  ("Remember those words when you reach the castle. He knew what he was letting in.",
   "Recuerda esas palabras cuando llegues al castillo. Él sabía lo que estaba dejando entrar."),
 "A sumaúma ainda está de pé. Os pajés cumpriram a promessa deles melhor do que nós cumprimos as nossas.":
  ("The kapok tree still stands. The shamans kept their promise better than we kept ours.",
   "La ceiba todavía está en pie. Los chamanes cumplieron su promesa mejor que nosotros las nuestras."),
 "A Ordem do Limiar marcou essas pedras há séculos. Eles sempre souberam esperar.":
  ("The Order of the Threshold marked these stones centuries ago. They always knew how to wait.",
   "La Orden del Umbral marcó estas piedras hace siglos. Siempre supieron esperar."),
 "Eu deveria ter apagado essas marcas quando ainda podia.":
  ("I should have erased those marks while I still could.", "Debí borrar esas marcas cuando todavía podía."),
 "A sentinela ainda vigia… depois de tanto tempo.": ("The sentinel still keeps watch… after all this time.", "El centinela todavía vigila… después de tanto tiempo."),
 "Algumas promessas não morrem nem com quem as fez. Esta foi uma das minhas.":
  ("Some promises don't die even with the ones who made them. This one was mine.",
   "Algunas promesas no mueren ni con quien las hizo. Esta fue una de las mías."),
 "Eu disse a ele para não abrir. Eu disse…": ("I told him not to open it. I told him…", "Le dije que no abriera. Se lo dije…"),
 "Você ouviu o meu nome, herói. Logo vai entender o resto. Só peço que continue andando.":
  ("You heard my name, hero. Soon you'll understand the rest. I only ask that you keep walking.",
   "Oíste mi nombre, héroe. Pronto entenderás el resto. Solo te pido que sigas caminando."),
}
s = open(BUNDLE, encoding="utf-8").read()
T = "/*__GMEM__*/"
while T in s:
    a = s.index(T)
    b = s.index(T, a + 1)
    s = s[:a] + s[b + len(T):]
q = lambda t: json.dumps(t, ensure_ascii=False)
i = s.index("const __TR={en:{")
# no fim do dicionário EN (fora do trecho que patch_story_origins.py reescreve no começo)
add = "".join(f",{q(k)}:{q(v[0])}" for k, v in TR.items() if f"{q(k)}:{q(v[0])}" not in s)
j0 = s.index("},es:{", i)
s = s[:j0] + add + s[j0:]
i = s.index("const __TR={en:{")
j = s.index("},es:{", i) + len("},es:{")
add = "".join(f"{q(k)}:{q(v[1])}," for k, v in TR.items() if f"{q(k)}:{q(v[1])}" not in s)
s = s[:j] + add + s[j:]
# lembranças do herói (pt no jogo; en/es no dicionário)
HM = json.load(open(os.path.join(ROOT, "scripts", "hero_memory_lines.json"), encoding="utf-8"))
for cls, (lv, rows) in HM.items():
    for pt, en, es, _ in rows:
        TR[pt] = (en, es)
HMJS = "const __HMEM=" + json.dumps({c: [lv, [r[0] for r in rows]] for c, (lv, rows) in HM.items()}, ensure_ascii=False) + ";\n"
i = s.index("const __TR={en:{")
add = "".join(f",{q(k)}:{q(v[0])}" for k, v in TR.items() if f"{q(k)}:{q(v[0])}" not in s)
j0 = s.index("},es:{", i)
s = s[:j0] + add + s[j0:]
j = s.index("},es:{", i) + len("},es:{")
add = "".join(f"{q(k)}:{q(v[1])}," for k, v in TR.items() if f"{q(k)}:{q(v[1])}" not in s)
s = s[:j] + add + s[j:]
s = s + T + "\n" + HMJS + SRC + "\n" + T
for p in (BUNDLE, MIRROR):
    if os.path.isdir(os.path.dirname(p)):
        open(p, "w", encoding="utf-8").write(s)
print("lembranças da Guardiã e dos heróis:", len(TR), "falas")
