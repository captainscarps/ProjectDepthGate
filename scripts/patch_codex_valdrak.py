"""Codex: a relíquia do castelo passa a contar a verdade sobre Aelric (missão 'O Rei que Abriu as Portas').
Troca o texto PT (chave da tradução) e os valores EN/ES no bundle e em scripts/books_i18n_1.json. Idempotente."""
import os, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OLD = "Lorde Valdrak acreditava que isolar a fortaleza salvaria o mundo, mas sua própria ambição serviu de ponte para o mal."
NEW = "Lorde Aelric de Valdrak abriu os portões proibidos para salvar o povo da Névoa, sem saber que a lei dos Antigos guardava uma prisão. A misericórdia dele serviu de ponte para o mal."
EN_NEW = "Lord Aelric of Valdrak opened the forbidden gates to save his people from the Mist, unaware that the Ancients' law guarded a prison. His mercy became a bridge for evil."
ES_NEW = "Lord Aelric de Valdrak abrió las puertas prohibidas para salvar a su pueblo de la Niebla, sin saber que la ley de los Antiguos guardaba una prisión. Su misericordia sirvió de puente para el mal."
for rel in ("assets/index-D6qIWtA7-p209.js", "scripts/books_i18n_1.json"):
    p = os.path.join(ROOT, rel); s = open(p, encoding="utf-8").read(); n0 = s.count(OLD)
    # EN/ES: a frase final de cada tradução da mesma curiosidade
    s = re.sub(r"(Valdrak Castle does not rest on ordinary rock[^\"]*?Abyss\.)[^\"]*\"", lambda m: m.group(1) + " " + EN_NEW + '"', s)
    s = re.sub(r"(El Castillo de Valdrak no descansa[^\"]*?Abismo\.)[^\"]*\"", lambda m: m.group(1) + " " + ES_NEW + '"', s)
    s = s.replace(OLD, NEW); open(p, "w", encoding="utf-8").write(s); print(rel, n0, "trocas PT")
