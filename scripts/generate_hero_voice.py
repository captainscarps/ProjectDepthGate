"""Voz própria de cada herói (Gemini TTS) para todas as falas de herói.

As falas vêm de HERO_LINES em scripts/generate_all_hero_voices_gemini.py (mais as de EXTRA abaixo).
Cada áudio é gravado como assets/audio/voice/<idioma>/<id>-<CLASSE>.mp3 e marcado no manifesto em
d[id].byClass[idioma][CLASSE]; a dublagem (scripts/source/voice-webaudio.js) toca essa versão quando
aquele herói fala (o diálogo reconhece o herói pelo "who" ou pelo nome — scripts/patch_hero_voices.py).

Vozes escolhidas pelo perfil de cada herói e conferidas pelo tom médio (frequência fundamental):
  Draven Alnilam ~111 Hz · Akihiro Schedar ~130 · Kael Algenib ~134 · Valthor Enceladus ~137 ·
  Tharion Charon ~140 · Hayato Puck ~167 · Arthelia Kore · Araí Zephyr ~205 · Seris Leda ~237
Sem instrução de direção: com ela o Gemini às vezes lê a instrução em voz alta.

Uso (a chave nunca é gravada em arquivo):
    GEMINI_API_KEY=... python3 scripts/generate_hero_voice.py all            # PT de todos (+ EN das heroínas)
    GEMINI_API_KEY=... python3 scripts/generate_hero_voice.py MAGE --en      # inglês também para os homens
    --force regrava o que já existe · --workers N (padrão 4)
"""
import concurrent.futures as cf
import importlib.util
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, "scripts", file))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


V = load("npcv", "generate_all_npc_voices_gemini.py")   # síntese + hash idêntico ao do jogo
H = load("herov", "generate_all_hero_voices_gemini.py")  # HERO_LINES

VOICES = {
    "WARRIOR": "Alnilam", "BERSERKER": "Schedar", "HUNTER": "Algenib", "NECROMANCER": "Enceladus",
    "DRUID": "Charon", "ARCHER": "Puck", "MAGE": "Kore", "SHAMAN": "Zephyr", "ROGUE": "Leda",
}
FEMALE = {"MAGE", "SHAMAN", "ROGUE"}
BROTHERS = {"BERSERKER", "ARCHER"}
# falas que só um herói (ou par) diz; as demais servem para todos
ONLY = {
    "É a letra do meu irmão mais velho… AKIHIRO.": {"ARCHER"},
    "É a letra do meu irmão… HAYATO.": {"BERSERKER"},
    "Você veio. Eu sabia que viria.": BROTHERS,
    "Nunca deixaria você sozinho. Nem aqui, nem em lugar nenhum.": BROTHERS,
    "Conseguimos… como quando éramos crianças, lembra?": BROTHERS,
    "Lembro. Você sempre chegava atrasado.": BROTHERS,
    "Avô? O senhor é… um dos pajés do igapó?": {"SHAMAN"},
    "Quem é o senhor?": set(VOICES) - {"SHAMAN"},
    "O Observador…": {"SHAMAN"},
}
# falas de herói que ficam fora de HERO_LINES (todas com versão em PT e EN para cada herói)
EXTRA = [
    ("Nossa, estou falando e entendendo uma língua diferente, que mágica é essa?",
     "Wow, I'm speaking and understanding a different language, what magic is this?"),
]


def main():
    argv = sys.argv[1:]
    force, en_all = "--force" in argv, "--en" in argv
    workers = int(argv[argv.index("--workers") + 1]) if "--workers" in argv else 4
    skip = {argv[argv.index("--workers") + 1]} if "--workers" in argv else set()
    names = [a.upper() for a in argv if not a.startswith("--") and a not in skip]
    classes = list(VOICES) if not names or "ALL" in names else names
    bad = [c for c in classes if c not in VOICES]
    if bad:
        raise SystemExit(f"classe desconhecida: {bad}")
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise SystemExit("defina GEMINI_API_KEY")
    man = json.load(open(V.MANIFEST_PATH, encoding="utf-8"))

    def save():
        txt = json.dumps(man, indent=2, ensure_ascii=False)
        for f in (V.MANIFEST_PATH, V.MIRROR_MANIFEST):
            open(f, "w", encoding="utf-8").write(txt)

    extra_pts = {pt for pt, _ in EXTRA}
    lines = [(r[1], r[2]) for r in H.HERO_LINES] + EXTRA
    jobs, removed = [], 0
    for pt, en in lines:
        lid = man["k"].get(V.fnv(pt))
        if not lid or lid not in man["d"]:
            print("  sem fala comum no manifesto, pulando:", pt[:40])
            continue
        for cls in classes:
            for L, text in (("pt", pt), ("en", en)):
                if L == "en" and not (en_all or cls in FEMALE or pt in extra_pts):
                    continue
                out = V.OUT_PT if L == "pt" else V.OUT_EN
                mir = V.MIRROR_PT if L == "pt" else V.MIRROR_EN
                name = f"{lid}-{cls}.mp3"
                bc = man["d"][lid].setdefault("byClass", {}).setdefault(L, {})
                if pt in ONLY and cls not in ONLY[pt]:
                    # fala que esse herói nunca diz: limpa versões antigas
                    if cls in bc:
                        bc.pop(cls)
                        for d in (out, mir):
                            p = os.path.join(d, name)
                            if os.path.isfile(p):
                                os.remove(p)
                        removed += 1
                    continue
                # a fala extra foi gerada antes com instrução lida em voz alta: refaz sempre que vier --force-extra
                redo = pt in extra_pts and "--force-extra" in argv
                if not force and not redo and bc.get(cls) and os.path.isfile(os.path.join(out, name)):
                    continue
                jobs.append((lid, cls, L, text, out, mir, name))
    print(f"{len(jobs)} áudios para gerar; {removed} versões de falas exclusivas removidas", flush=True)
    save()

    def work(j):
        lid, cls, L, text, out, mir, name = j
        mp3, dur = V.generate_gemini(key, text, None, VOICES[cls])
        return j, mp3, dur

    done = 0
    with cf.ThreadPoolExecutor(max_workers=workers) as ex:
        futs = [ex.submit(work, j) for j in jobs]
        for f in cf.as_completed(futs):
            try:
                (lid, cls, L, text, out, mir, name), mp3, dur = f.result()
            except Exception as e:
                print("  ERRO:", e, flush=True)
                continue
            for d in (out, mir):
                os.makedirs(d, exist_ok=True)
                open(os.path.join(d, name), "wb").write(mp3)
            man["d"][lid].setdefault("byClass", {}).setdefault(L, {})[cls] = dur
            if cls == "WARRIOR" and lid == man["k"].get(V.fnv(EXTRA[0][0])):
                man["d"][lid][L] = dur  # o arquivo genérico dessa fala é cópia do Draven
                for d in (out, mir):
                    open(os.path.join(d, f"{lid}.mp3"), "wb").write(mp3)
            done += 1
            print(f"[{done}/{len(jobs)}] {L}/{name} {VOICES[cls]} {dur}s  {text[:40]}", flush=True)
            if done % 20 == 0:
                save()
    save()
    print(f"fim: {done} áudios gerados", flush=True)


if __name__ == "__main__":
    main()
