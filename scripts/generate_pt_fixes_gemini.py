"""Português pelo Gemini nas falas que ainda estavam fora do padrão (achadas por scripts/audit_pt_voices.py).

  exclusivas — falas que só um herói diz (__HLINE, __GHERO): estavam no Kokoro antigo, ou no Gemini com a voz da
               Guardiã (Aoede, nas da xamã). Agora cada uma usa a voz Gemini do próprio herói (generate_hero_voice.VOICES),
               levada ao tom médio dele, gravada como versão do herói (byClass) e como arquivo comum.
  ecos       — as vozes dos Antigos (ecos nas salas): estavam no Kokoro. Agora Gemini (homem Orus, mulher Vindemiatrix,
               vozes que nenhum outro personagem usa), com o mesmo efeito de fantasma da dublagem.

Uso (a chave nunca é gravada em arquivo):
    GEMINI_API_KEY=... NODE_PATH=<acorn> python3 scripts/generate_pt_fixes_gemini.py exclusivas|ecos [--force] [--model <modelo TTS>]
Re-executável: pula o que já foi refeito (marca "gpt" no manifesto).
"""
import importlib.util
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load(name, file):
    spec = importlib.util.spec_from_file_location(name, os.path.join(ROOT, "scripts", file))
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    return m


P = load("prolv", "generate_prologue_hero_voices.py")   # gemini_pt, class_hz, V, DUB, Q, HV
V, DUB, Q, HV, D = P.V, P.DUB, P.Q, P.HV, P.D
ECHO = {"echo-m": ("Orus", 118), "echo-f": ("Vindemiatrix", 205)}


def story_lines():
    with tempfile.TemporaryDirectory() as td:
        lj = os.path.join(td, "l.json")
        subprocess.run(["node", os.path.join(ROOT, "scripts", "extract_story_lines.cjs"),
                        os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"), lj], check=True, capture_output=True)
        return json.load(open(lj))


def tts_text(t):
    return t.strip().strip("“”\"").strip()


def gem(key, text, voice, target, tmp, who=None):
    """Gemini com persona e sentimento (pt_voice_direction): no máximo 2 tiradas, tom ajustado em até 8%"""
    raw, best = os.path.join(tmp, "g.mp3"), None
    for take in range(D.TAKES):
        mp3 = P._gem_call(key, text, D.instruction(who, text), voice)
        p = os.path.join(tmp, f"g{take}.mp3")
        open(p, "wb").write(mp3)
        hz, voiced = Q.f0(p)
        hz = D.fold(hz, target)
        good = D.ok(hz, voiced, target) and not D.read_instruction_too(Q.dur(p), text)
        print(f"    tirada {take + 1}: {hz:.0f} Hz (alvo {target}), {voiced:.0%} com voz{'' if good else ' — fora'}", flush=True)
        score = abs(target / hz - 1) if hz else 9
        if not D.read_instruction_too(Q.dur(p), text) and (best is None or score < best[0]):
            best = (score, p, hz)
        if good:
            break
    if best is None:
        best = (0, p, 0)
    shutil.copy(best[1], raw)
    r = D.rate(best[2], target)
    return raw, r if abs(r - 1) > 0.03 else 1.0


def main():
    argv = sys.argv[1:]
    mode = next((a for a in argv if a in ("exclusivas", "ecos")), None)
    if not mode:
        raise SystemExit(__doc__)
    force = "--force" in argv
    if "--model" in argv:
        V.MODELS_QUEUE = [argv[argv.index("--model") + 1]]
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise SystemExit("defina GEMINI_API_KEY")
    man = json.load(open(V.MANIFEST_PATH, encoding="utf-8"))
    tmp = tempfile.mkdtemp()

    def save():
        txt = json.dumps(man, indent=2, ensure_ascii=False)
        for f in (V.MANIFEST_PATH, V.MIRROR_MANIFEST):
            open(f, "w", encoding="utf-8").write(txt)

    hz = P.class_hz(man)
    todo = []
    for ln in story_lines():
        v = ln["voice"]
        if mode == "exclusivas" and v.startswith("hero-"):
            todo.append((ln["text"], v[5:]))
        elif mode == "ecos" and v in ECHO:
            todo.append((ln["text"], v))
    print(f"{len(todo)} falas", flush=True)
    for n, (pt, who) in enumerate(todo):
        lid = man["k"].get(V.fnv(pt))
        if not lid or lid not in man["d"]:
            print("  fora do manifesto:", pt[:50])
            continue
        d = man["d"][lid]
        if d.get("gpt") and not force:
            continue
        try:
            if mode == "exclusivas":
                raw, rate = gem(key, tts_text(pt), HV.VOICES[who], hz[who], tmp, who)
                out = os.path.join(tmp, "o.mp3")
                Q.to_mp3(raw, out, rate)
            else:
                voice, target = ECHO[who]
                raw, rate = gem(key, tts_text(pt), voice, target, tmp, who)
                tuned = os.path.join(tmp, "t.wav")
                af = f"aresample=24000,asetrate=24000*{rate},aresample=24000,atempo={1 / rate:.4f}" if rate != 1.0 else "anull"
                subprocess.run(["ffmpeg", "-v", "quiet", "-y", "-i", raw, "-af", af, "-ar", "44100", "-ac", "1", tuned], check=True)
                import librosa
                x, sr = librosa.load(tuned, sr=44100)
                x = DUB.fx(x, "ghost", sr, "special", 0.02)
                x = x / (abs(x).max() + 1e-9) * 0.9
                ghost = os.path.join(tmp, "gh.mp3")
                DUB.save_mp3(x, sr, ghost)
                out = os.path.join(tmp, "o.mp3")
                subprocess.run(["ffmpeg", "-v", "quiet", "-y", "-i", ghost, "-af", "loudnorm=I=-16:TP=-1.5", "-ar", "24000",
                                "-ac", "1", "-b:a", "96k", out], check=True)
        except RuntimeError as e:
            print("  ERRO:", e, flush=True)
            save()
            raise SystemExit("parando (cota do Gemini?) — rode de novo depois para continuar")
        for dd in (V.OUT_PT, V.MIRROR_PT):
            shutil.copy(out, os.path.join(dd, lid + ".mp3"))
            if mode == "exclusivas":
                shutil.copy(out, os.path.join(dd, f"{lid}-{who}.mp3"))
        d["pt"] = Q.dur(out)
        if mode == "exclusivas":
            d.setdefault("byClass", {}).setdefault("pt", {})[who] = d["pt"]
        d["gpt"] = 1
        print(f"[{n + 1}/{len(todo)}] {lid} {who} {d['pt']}s  {pt[:50]}", flush=True)
        save()
    print("fim", flush=True)


if __name__ == "__main__":
    main()
