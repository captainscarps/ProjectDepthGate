"""Vozes dos NPCs das missões novas: PT pelo Gemini TTS, EN pelo Kokoro (modelo aberto, roda local, sem Gemini).

  rafael — o ferreiro do Refúgio, grave e masculina: PT Algenib (rouca); cada fala é medida e levada ao mesmo
           tom (~112 Hz) no ffmpeg (asetrate), e falas sussurradas são refeitas; EN am_onyx (Kokoro, ~86 Hz).
  alline — a dona dos gatos, doce: PT Achernar (suave); EN af_heart (calorosa).
As falas saem do código do jogo (o texto precisa ser idêntico) e ficam em assets/audio/voice/<idioma>/<id>.mp3,
com o id e o manifesto no mesmo formato das outras vozes de NPC. Falas montadas na hora (com números ou nomes
de masmorra) ficam de fora.

Uso (a chave nunca é gravada em arquivo; os arquivos do Kokoro ficam fora do repositório):
    GEMINI_API_KEY=... KOKORO_DIR=/caminho/com/kokoro.onnx+voices.bin python3 scripts/generate_quest_npc_voices.py rafael|alline [--only pt|en] [--reuse-pt] [--model <modelo TTS>]
    --retune só leva as falas PT já gravadas ao tom alvo (sem gastar cota do Gemini)
    --reuse-pt reaproveita os PT gerados nas últimas 6 h (a cota diária do Gemini pode acabar no meio)
    kokoro.onnx / voices.bin: github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0); pip install kokoro-onnx soundfile
"""
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile
import time

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
spec = importlib.util.spec_from_file_location("npcv", os.path.join(ROOT, "scripts", "generate_all_npc_voices_gemini.py"))
V = importlib.util.module_from_spec(spec)
spec.loader.exec_module(V)

NPCS = {
    "rafael": {
        "src": "hub-village.js", "pt": ("Algenib", 0.88), "en": ("am_onyx", 0.92, "en-us"),
        "pt_hz": 112,   # cada fala é levada a esse tom (o Gemini varia muito de uma fala para outra)
        "starts": ["Ah, um cliente! Chegue mais perto.", "Aço bom pede fogo paciente.", "Traga fragmentos e eu deixo",
                   "Só forjo com Pedra Cobalto.", "Sem Pedra Cobalto, sem forja.",
                   "O Brokk… não volta mais.", "Hoje a forja fica fria.", "Antes de você comprar qualquer coisa",
                   "Meu aprendiz, o Brokk,", "Se encontrar ele lá embaixo", "Brokk! Você trouxe ele vivo", "Forjamos juntos o Martelo",
                   "A Alline me contou o que você fez pelos gatos."],
    },
    "alline": {
        "src": ["quests2.js", "hub-village.js"], "pt": ("Achernar", 1.0), "en": ("af_heart", 0.97, "en-us"),
        "starts": ["Ei, você aí! Espera!", "Meus gatos fugiram pelos portais", "Eles vão fugir de você.",
                   "Todos eles! Olha só", "O Ollie não sai do seu pé", "A casa nunca esteve tão cheia", "Cuide bem do Ollie.",
                   "E tem mais: o ferreiro do Refúgio", "Agora que os gatos voltaram, vamos morar",
                   "Nenhum voltou ainda…", "A Mel já está em casa!", "Só falta um! Veja no diário",
                   "Os gatos adoraram o Refúgio.", "O Rafael finge que é durão", "Cuida bem do Ollie lá fora."],
    },
}
NPC = None


def lines():
    srcs = NPC["src"] if isinstance(NPC["src"], list) else [NPC["src"]]
    s = "\n".join(open(os.path.join(ROOT, "scripts", "source", f), encoding="utf-8").read() for f in srcs)
    out = []
    for k in NPC["starts"]:
        i = s.index(k)
        a = s.rfind('"', 0, i + 1)   # aspas que abrem o texto PT (L3("pt","en",…) ou ["pt","en",…])
        m = re.match(r'"((?:[^"\\]|\\.)*)",\s*"((?:[^"\\]|\\.)*)"', s[a:])
        un = lambda t: t.replace("\\'", "'").replace('\\"', '"')
        out.append((un(m.group(1)), un(m.group(2))))
    return out


def to_mp3(src, dst, rate=1.0):
    af = f"aresample=24000,asetrate=24000*{rate},aresample=24000,atempo={1 / rate:.4f}," if rate != 1.0 else ""
    subprocess.run(["ffmpeg", "-v", "quiet", "-y", "-i", src, "-af", af + "loudnorm=I=-16:TP=-1.5", "-ar", "24000", "-ac", "1", "-b:a", "96k", dst], check=True)


def f0(path):
    """tom mediano (Hz) e quantos quadros têm voz — pouca voz = fala sussurrada/rouca demais"""
    import warnings
    import librosa
    import numpy as np
    warnings.filterwarnings("ignore")
    y, sr = librosa.load(path, sr=16000)
    f, v, _ = librosa.pyin(y, fmin=70, fmax=400, sr=sr)
    g = f[v]
    return (float(np.median(g)) if len(g) else 0.0), len(g) / max(1, len(f))


def dur(path):
    r = subprocess.run(["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True)
    return round(float(r.stdout.strip()), 2)


def main():
    global NPC
    skip = {sys.argv[sys.argv.index("--model") + 1]} if "--model" in sys.argv else set()
    names = [a for a in sys.argv[1:] if not a.startswith("--") and a not in ("pt", "en") and a not in skip]
    if not names or names[0] not in NPCS:
        raise SystemExit(f"uso: generate_quest_npc_voices.py {'|'.join(NPCS)} [--only pt|en] [--reuse-pt]")
    NPC = NPCS[names[0]]
    if "--model" in sys.argv:
        V.MODELS_QUEUE = [sys.argv[sys.argv.index("--model") + 1]]
    PT_VOICE, PT_RATE = NPC["pt"]
    EN_VOICE, EN_SPEED, EN_LANG = NPC["en"]
    only = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None
    man = json.load(open(V.MANIFEST_PATH, encoding="utf-8"))
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    kok = None
    if only != "pt" and "--retune" not in sys.argv:
        from kokoro_onnx import Kokoro
        import soundfile as sf
        kd = os.environ.get("KOKORO_DIR", "/tmp/dg/kk")
        kok = Kokoro(os.path.join(kd, "kokoro.onnx"), os.path.join(kd, "voices.bin"))
    if only != "en" and not key and "--retune" not in sys.argv:
        raise SystemExit("defina GEMINI_API_KEY (ou use --only en)")
    tmp = tempfile.mkdtemp()
    if "--retune" in sys.argv:
        # sem Gemini: só ajusta o tom das falas PT já gravadas para o tom alvo do personagem
        for pt, en in lines():
            lid = man["k"].get(V.fnv(pt)); out = os.path.join(V.OUT_PT, f"{lid}.mp3")
            if not lid or not os.path.isfile(out) or not NPC.get("pt_hz"):
                continue
            hz, voiced = f0(out); r = min(1.2, max(0.72, NPC["pt_hz"] / hz)) if hz else 1.0
            if abs(r - 1) > 0.04:
                src = os.path.join(tmp, "in.mp3"); subprocess.run(["cp", out, src], check=True); to_mp3(src, out, r)
                subprocess.run(["cp", out, os.path.join(V.MIRROR_PT, lid + ".mp3")], check=True)
                man["d"][lid]["pt"] = dur(out)
            print(f"{lid}  {hz:.0f} Hz ×{r:.2f}  {pt[:50]}", flush=True)
        txt = json.dumps(man, indent=2, ensure_ascii=False)
        for f in (V.MANIFEST_PATH, V.MIRROR_MANIFEST):
            open(f, "w", encoding="utf-8").write(txt)
        return
    for pt, en in lines():
        lid = man["k"].get(V.fnv(pt)) or V.fnv(pt)
        d = man["d"].setdefault(lid, {})
        man["k"][V.fnv(pt)] = lid
        man["k"][V.fnv(en)] = lid
        out_pt = os.path.join(V.OUT_PT, lid + ".mp3")
        fresh = os.path.isfile(out_pt) and os.path.getmtime(out_pt) > time.time() - 6 * 3600
        if only != "en" and "--reuse-pt" in sys.argv and fresh:
            d["pt"] = dur(out_pt)   # já gerada com a voz nova numa rodada anterior (a cota do Gemini acabou no meio)
            subprocess.run(["cp", out_pt, os.path.join(V.MIRROR_PT, lid + ".mp3")], check=True)
        elif only != "en":
            raw, rate = os.path.join(tmp, "pt.mp3"), PT_RATE
            for take in range(3):   # com tom alvo: refaz a fala que vier sussurrada ou fora do tom
                mp3 = None
                for tries in range(4):
                    try:
                        mp3, _ = V.generate_gemini(key, pt, None, PT_VOICE); break
                    except RuntimeError as e:
                        if "429" in str(e) and tries == 3 and "--reuse-pt" in sys.argv:
                            print("  sem cota do Gemini: fala fica sem PT por enquanto", flush=True); break
                        if "429" not in str(e) or tries == 3: raise
                        print("  limite por minuto, esperando 65 s…", flush=True); time.sleep(65)
                if not mp3 or not NPC.get("pt_hz"):
                    break
                open(raw, "wb").write(mp3)
                hz, voiced = f0(raw)
                ok = hz > 0 and voiced > 0.35 and 0.72 <= NPC["pt_hz"] / hz <= 1.12
                print(f"  tirada {take + 1}: {hz:.0f} Hz, {voiced:.0%} com voz{'' if ok else ' — refazendo'}", flush=True)
                if ok or take == 2:
                    rate = min(1.12, max(0.72, NPC["pt_hz"] / hz)) if hz else PT_RATE
                    break
            if mp3:
                if not NPC.get("pt_hz"):
                    open(raw, "wb").write(mp3)
                out = os.path.join(V.OUT_PT, lid + ".mp3"); to_mp3(raw, out, rate)
                d["pt"] = dur(out)
                subprocess.run(["cp", out, os.path.join(V.MIRROR_PT, lid + ".mp3")], check=True)
        if only != "pt":
            s, sr = kok.create(en, voice=EN_VOICE, speed=EN_SPEED, lang=EN_LANG)
            raw = os.path.join(tmp, "en.wav"); sf.write(raw, s, sr)
            out = os.path.join(V.OUT_EN, lid + ".mp3"); to_mp3(raw, out)
            d["en"] = dur(out)
            subprocess.run(["cp", out, os.path.join(V.MIRROR_EN, lid + ".mp3")], check=True)
        d.pop("byClass", None)
        print(f"{lid}  PT {d.get('pt')}s  EN {d.get('en')}s  {pt[:50]}", flush=True)
        txt = json.dumps(man, indent=2, ensure_ascii=False)
        for f in (V.MANIFEST_PATH, V.MIRROR_MANIFEST):
            open(f, "w", encoding="utf-8").write(txt)


if __name__ == "__main__":
    main()
