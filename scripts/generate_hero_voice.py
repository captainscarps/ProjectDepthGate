"""Gera a voz própria de UM herói em português (PT-BR) para todas as falas de herói.

As falas vêm de HERO_LINES em scripts/generate_all_hero_voices_gemini.py. Cada áudio é gravado como
assets/audio/voice/pt/<id>-<CLASSE>.mp3 e marcado no manifesto em d[id].byClass.pt.<CLASSE>; a dublagem
(scripts/source/voice-webaudio.js) toca essa versão quando aquele herói fala (ver scripts/patch_hero_voices.py).
O inglês continua com a voz comum.

Uso (a chave nunca é gravada em arquivo):
    GEMINI_API_KEY=... python3 scripts/generate_hero_voice.py warrior Alnilam
    (--force regrava o que já existe)

Draven (warrior): Alnilam — a mais grave das vozes masculinas do Gemini (~111 Hz), firme, homem adulto.
"""
import importlib.util
import json
import os
import sys
import time

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, "scripts", file))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


V = load("npcv", "generate_all_npc_voices_gemini.py")   # síntese + hash idêntico ao do jogo
H = load("herov", "generate_all_hero_voices_gemini.py")  # HERO_LINES


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    cls = (args[0] if args else "warrior").lower()
    voice = args[1] if len(args) > 1 else "Alnilam"
    force = "--force" in sys.argv
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise SystemExit("defina GEMINI_API_KEY")
    man = json.load(open(V.MANIFEST_PATH, encoding="utf-8"))
    CLS = cls.upper()
    save = lambda: [open(f, "w", encoding="utf-8").write(json.dumps(man, indent=2, ensure_ascii=False)) for f in (V.MANIFEST_PATH, V.MIRROR_MANIFEST)]
    done = 0
    for i, row in enumerate(H.HERO_LINES, 1):
        pt = row[1]
        lid = man["k"].get(V.fnv(pt), row[0])
        if lid not in man["d"]:
            print("  sem fala comum no manifesto, pulando:", pt[:40]); continue
        name = f"{lid}-{CLS}.mp3"
        old = V.fnv(f"hero-{cls}|{pt}")  # formato antigo deste script: migra se existir
        bc = man["d"][lid].setdefault("byClass", {}).setdefault("pt", {})
        if os.path.isfile(os.path.join(V.OUT_PT, old + ".mp3")) and not os.path.isfile(os.path.join(V.OUT_PT, name)):
            for d in (V.OUT_PT, V.MIRROR_PT):
                src = os.path.join(d, old + ".mp3")
                if os.path.isfile(src): os.replace(src, os.path.join(d, name))
            bc[CLS] = man["d"].get(old, {}).get("pt", 4)
            man["k"].pop(old, None); man["d"].pop(old, None)
            continue
        if not force and bc.get(CLS) and os.path.isfile(os.path.join(V.OUT_PT, name)):
            continue
        print(f"[{i:02d}/{len(H.HERO_LINES)}] {name} {pt[:46]}", end="", flush=True)
        mp3, dur = V.generate_gemini(key, pt, None, voice)
        for d in (V.OUT_PT, V.MIRROR_PT):
            os.makedirs(d, exist_ok=True)
            open(os.path.join(d, name), "wb").write(mp3)
        bc[CLS] = dur
        done += 1
        print(f"  ok {dur}s")
        time.sleep(0.4)
        if done % 8 == 0:
            save()
    save()
    print(f"{done} falas geradas para {CLS} com a voz {voice}")


if __name__ == "__main__":
    main()
