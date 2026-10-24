"""
Dublagem da história com voz neural, em português do Brasil e inglês.
Português: Kokoro-82M com as vozes brasileiras (pf_dora, pm_alex, pm_santa) e pronúncia pt-br do espeak-ng.
(Antes era Supertonic 3, que soava com sotaque de Portugal; continua disponível com --supertonic.)
  1. extrai as falas do bundle com quem fala (extract_story_lines.cjs)
  2. gera cada fala com a voz do personagem (narrador, Guardiã, Rei, heróis, ecos dos Antigos)
  3. aplica o "acabamento" de cada voz (eco de templo, voz demoníaca do Rei corrompido, fantasma dos ecos…)
  4. salva assets/audio/voice/<hash>.mp3 + voice-manifest.json (o jogo toca pela frase exibida)
Re-executável: falas já geradas com a mesma voz são reaproveitadas.
Uso: python3 scripts/build_voice_dub.py <pasta_do_modelo_supertonic> <pasta_node_modules_com_acorn> <pasta_do_kokoro>
Inglês: Kokoro-82M (pip install kokoro-onnx). Português: Supertonic 3.
Pré-requisitos: pip install sherpa-onnx librosa; npm i acorn acorn-walk (na pasta passada). O modelo é baixado do npm se faltar.
"""
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import wave

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_sfx_bank as B  # noqa: E402  (filtros, eco e saturação)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
OUT = os.path.join(ROOT, "assets", "audio", "voice")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice")
MODEL, NODE_MODULES, KOKORO = (sys.argv[1:4] + ["", "", ""])[:3]

# sid: 0-4 vozes femininas, 5-9 masculinas do Supertonic 3
VOICES = {
    "narrator": dict(sid=6, speed=.9, fx="room"),
    "guardia": dict(sid=0, speed=.9, fx="temple"),
    "guardia-corrupt": dict(sid=0, speed=.88, fx="demon"),
    "rei": dict(sid=9, speed=.88, fx="room"),
    "rei-corrupt": dict(sid=9, speed=.85, fx="demon"),
    "hero-WARRIOR": dict(sid=8, speed=.97, fx="dry"),
    "hero-BERSERKER": dict(sid=5, speed=.95, fx="dry"),
    "hero-ARCHER": dict(sid=7, speed=.97, fx="dry"),
    "hero-HUNTER": dict(sid=5, speed=.92, fx="dry"),
    "hero-DRUID": dict(sid=7, speed=.9, fx="dry"),
    "hero-NECROMANCER": dict(sid=9, speed=.9, fx="room"),
    "hero-MAGE": dict(sid=2, speed=.96, fx="dry"),
    "hero-ROGUE": dict(sid=1, speed=1.0, fx="dry"),
    "hero-SHAMAN": dict(sid=3, speed=.95, fx="dry"),
    "echo-m": dict(sid=7, speed=.88, fx="ghost"),
    "echo-f": dict(sid=4, speed=.88, fx="ghost"),
    "vision": dict(sid=6, speed=.88, fx="temple"),
    "video": dict(sid=6, speed=.95, fx="room"),  # legendas do vídeo seguem a narração: sem acelerar
}
LANGS = ("pt", "en")

# inglês com Kokoro-82M (Apache-2.0): voz por personagem, algumas misturadas para um timbre único
KVOICE = {
    "narrator": ({"bm_george": .7, "bm_fable": .3}, "en-gb", .9),
    "vision": ({"bm_george": .7, "bm_fable": .3}, "en-gb", .9),
    "video": ({"bm_george": .7, "bm_fable": .3}, "en-gb", .95),
    "guardia": ({"af_heart": .6, "bf_emma": .4}, "en-gb", .9),
    "guardia-corrupt": ({"af_heart": .6, "bf_emma": .4}, "en-gb", .88),
    "rei": ({"bm_fable": .6, "am_onyx": .4}, "en-gb", .88),
    "rei-corrupt": ({"bm_fable": .6, "am_onyx": .4}, "en-gb", .86),
    "hero-WARRIOR": ({"am_michael": 1}, "en-us", .97),
    "hero-BERSERKER": ({"am_fenrir": 1}, "en-us", .95),
    "hero-ARCHER": ({"am_puck": 1}, "en-us", .97),
    "hero-HUNTER": ({"bm_lewis": .6, "am_fenrir": .4}, "en-gb", .94),
    "hero-DRUID": ({"am_liam": .5, "bm_daniel": .5}, "en-gb", .92),
    "hero-NECROMANCER": ({"am_onyx": .7, "bm_george": .3}, "en-gb", .9),
    "hero-MAGE": ({"af_bella": 1}, "en-us", .96),
    "hero-ROGUE": ({"af_nicole": .6, "af_sky": .4}, "en-us", 1.0),
    "hero-SHAMAN": ({"af_kore": .7, "af_aoede": .3}, "en-us", .95),
    "echo-m": ({"bm_daniel": .6, "am_michael": .4}, "en-gb", .88),
    "echo-f": ({"bf_isabella": .6, "bf_emma": .4}, "en-gb", .88),
}


# português do Brasil com Kokoro: só as 3 vozes brasileiras dão o sotaque; uma pitada de outra voz muda o timbre por personagem
PT_ENGINE = "supertonic" if "--supertonic" in sys.argv else "kokoro-ptbr"
PVOICE = {
    "narrator": ({"pm_santa": .8, "bm_george": .2}, .92),
    "vision": ({"pm_santa": .8, "bm_george": .2}, .9),
    "video": ({"pm_santa": .8, "bm_george": .2}, .96),
    "guardia": ({"pf_dora": .85, "bf_emma": .15}, .92),
    "guardia-corrupt": ({"pf_dora": .85, "bf_emma": .15}, .88),
    "rei": ({"pm_santa": .7, "am_onyx": .3}, .88),
    "rei-corrupt": ({"pm_santa": .7, "am_onyx": .3}, .86),
    "hero-WARRIOR": ({"pm_alex": .85, "am_michael": .15}, .98),
    "hero-BERSERKER": ({"pm_alex": .75, "am_fenrir": .25}, .96),
    "hero-ARCHER": ({"pm_alex": .85, "am_puck": .15}, .98),
    "hero-HUNTER": ({"pm_santa": .75, "am_fenrir": .25}, .95),
    "hero-DRUID": ({"pm_santa": .8, "am_liam": .2}, .93),
    "hero-NECROMANCER": ({"pm_santa": .75, "am_onyx": .25}, .9),
    "hero-MAGE": ({"pf_dora": .85, "af_bella": .15}, .97),
    "hero-ROGUE": ({"pf_dora": .8, "af_nicole": .2}, 1.0),
    "hero-SHAMAN": ({"pf_dora": .8, "af_kore": .2}, .95),
    "echo-m": ({"pm_alex": .8, "bm_daniel": .2}, .88),
    "echo-f": ({"pf_dora": .8, "bf_isabella": .2}, .88),
}


def pvoice(v):
    if v.startswith("cine-"):
        return PVOICE["guardia"] if "GUARDI" in v.upper() else PVOICE["narrator"]
    return PVOICE.get(v) or PVOICE["narrator"]


def synth_ptbr_raw(text, voice, emo, mul=1.0):
    from kokoro_onnx import Kokoro
    if "k" not in _K:
        prepare_kokoro(KOKORO)
        _K["k"] = Kokoro(os.path.join(KOKORO, "kokoro-q8.onnx"), os.path.join(KOKORO, "voices.npz"))
    k = _K["k"]
    mixv, spd = pvoice(voice)
    style = sum(k.get_voice_style(n) * w for n, w in mixv.items())
    s, sr = k.create(prep_text(text), voice=style, speed=spd * EMO[emo][0] * mul, lang="pt-br")
    x = np.array(s, dtype=np.float64)
    nz = np.where(np.abs(x) > .01)[0]
    if len(nz):
        x = x[max(0, nz[0] - int(.03 * sr)):nz[-1] + int(.08 * sr)]
    return x, sr


def kvoice(v):
    if v.startswith("cine-"):
        return KVOICE["guardia"] if "GUARDI" in v.upper() else KVOICE["narrator"]
    return KVOICE.get(v) or KVOICE["narrator"]


def prepare_kokoro(d):
    """modelo Kokoro q8 (npm kokoro-q8-shards) + vozes (npm kokoro-js) → kokoro-q8.onnx e voices.npz"""
    import io
    import tarfile
    import urllib.request
    if os.path.exists(os.path.join(d, "voices.npz")):
        return
    os.makedirs(d, exist_ok=True)
    tf = tarfile.open(fileobj=io.BytesIO(urllib.request.urlopen("https://registry.npmjs.org/kokoro-q8-shards/-/kokoro-q8-shards-1.0.0.tgz").read()))
    parts = {m.name: tf.extractfile(m).read() for m in tf.getmembers() if m.name.endswith(".bin")}
    with open(os.path.join(d, "kokoro-q8.onnx"), "wb") as f:
        for i in range(6):
            f.write(parts[f"package/kokoro-q8.part{i}.bin"])
    tf = tarfile.open(fileobj=io.BytesIO(urllib.request.urlopen("https://registry.npmjs.org/kokoro-js/-/kokoro-js-1.2.1.tgz").read()))
    V = {os.path.basename(m.name)[:-4]: np.frombuffer(tf.extractfile(m).read(), dtype=np.float32).reshape(-1, 1, 256)
         for m in tf.getmembers() if m.name.startswith("package/voices/") and m.name.endswith(".bin")}
    np.savez(os.path.join(d, "voices.npz"), **V)


_K = {}


def synth_en_raw(text, voice, emo, mul=1.0):
    from kokoro_onnx import Kokoro
    if "k" not in _K:
        prepare_kokoro(KOKORO)
        _K["k"] = Kokoro(os.path.join(KOKORO, "kokoro-q8.onnx"), os.path.join(KOKORO, "voices.npz"))
    k = _K["k"]
    mixv, lang, spd = kvoice(voice)
    style = sum(k.get_voice_style(n) * w for n, w in mixv.items())
    s, sr = k.create(prep_text(text), voice=style, speed=spd * EMO[emo][0] * mul, lang=lang)
    x = np.array(s, dtype=np.float64)
    nz = np.where(np.abs(x) > .01)[0]
    if len(nz):
        x = x[max(0, nz[0] - int(.03 * sr)):nz[-1] + int(.08 * sr)]
    return x, sr


def voice_cfg(v):
    if v.startswith("cine-"):
        return VOICES["guardia"] if "GUARDI" in v.upper() else VOICES["narrator"]
    return VOICES.get(v) or VOICES["narrator"]


# emoção: (multiplicador de velocidade, semitons, pausas, respiração antes, suspiro depois, intensidade)
EMO = {
    "sadness": (.88, -.25, .5, True, True, 0),
    "aggression": (1.02, .15, .14, False, False, 1.3),
    "smile": (.98, .25, .26, False, False, 0),
    "calm": (.93, -.1, .38, True, False, 0),
    "special": (.86, -.15, .55, True, False, 0),
    "talk": (1.0, 0, .3, False, False, 0),
    "excited": (1.02, .2, .2, False, False, 1.1),
    "pensive": (.91, -.1, .45, True, False, 0),
}


def emotion_of(ln):
    e = ln.get("expr")
    if e in EMO:
        return e
    if ln["voice"].startswith("cine-"):
        return "special"
    t = ln["text"]
    if "!" in t:
        return "excited"
    if "…" in t or "..." in t:
        return "pensive"
    return "calm" if ln["voice"] == "narrator" else "talk"


def prep_text(t):
    """pontuação que vira pausa e respiro na leitura"""
    t = t.replace(" — ", ", ").replace("—", ", ").replace(" – ", ", ").replace("…", "...")
    t = t.replace(" ,", ",")
    t = t.replace("“", "").replace("”", "").replace('"', "")
    return " ".join(t.split())


def breath(sr, d=.38, out=False):
    n = int(d * sr)
    t = np.arange(n) / sr
    env = np.sin(np.pi * t / d) ** (1.5 if not out else .8)
    if out:
        env *= np.exp(-t / (d * .5))
    x = B.filt(np.random.default_rng().standard_normal(n), "bandpass", [450, 2600]) * env
    x += .4 * B.filt(np.random.default_rng().standard_normal(n), "bandpass", [1200, 1700]) * env
    return x


def fnv(text):
    """FNV-1a 32 bits sobre unidades UTF-16 (idêntico ao do jogo)"""
    h = 0x811C9DC5
    b = text.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


def norm(t):
    return " ".join(t.split()).strip()


def vverb(x, sr, rt=.8, wet=.14, pre=.018, damp=5200):
    """reverberação suave para voz: cauda difusa sem ecos discretos (evita som metálico)"""
    n = int(rt * sr)
    t = np.arange(n) / sr
    rg = np.random.default_rng(11)
    ir = (B.filt(rg.standard_normal(n), "lowpass", 900) * 1.3 * np.exp(-t / (rt / 5)) +
          B.filt(rg.standard_normal(n), "highpass", 900) * np.exp(-t / (rt / 8)))
    ir = B.filt(ir, "lowpass", damp) * np.clip(t / .03, 0, 1)
    ir = np.concatenate([np.zeros(int(pre * sr)), ir])
    from scipy.signal import fftconvolve
    y = fftconvolve(x, ir)[:len(x) + int(rt * .6 * sr)]
    y = y / (np.abs(y).max() + 1e-9) * (np.abs(x).max() + 1e-9)
    return B.mix(x, y * wet)


def air(x, sr, amt=.035):
    """sopro: ar acompanhando a fala (voz mais íntima e misteriosa)"""
    env = np.convolve(np.abs(x), np.ones(int(.02 * sr)) / int(.02 * sr), "same")
    nz = B.filt(np.random.default_rng(5).standard_normal(len(x)), "bandpass", [2500, 7500])
    return x + nz * env * amt * 4


def fx(x, kind, sr, emo="talk", breathy=0.0):
    import librosa
    x = x.astype(np.float64)
    sp, st, sil, br_in, br_out, inten = EMO[emo]
    if inten:
        x = B.shelf(x, 2500, 1.5, "high")                     # voz mais projetada (sem distorção)
    x = B.filt(x, "highpass", 70)
    x = B.shelf(x, 180, 2.0, "low")                            # calor/corpo de microfone próximo
    if breathy:
        x = air(x, sr, breathy)
    pk = np.abs(x).max() + 1e-9
    if br_in:
        x = np.concatenate([breath(sr, .36) * pk * .05, np.zeros(int(.06 * sr)), x])
    if br_out:
        x = np.concatenate([x, np.zeros(int(.12 * sr)), breath(sr, .6, True) * pk * .045])
    if kind == "room":
        x = vverb(x, sr, .35, .07)
    elif kind == "temple":
        x = vverb(x, sr, 1.3, .17, .025)
    elif kind == "demon":
        low = librosa.effects.pitch_shift(x.astype(np.float32), sr=sr, n_steps=-5).astype(np.float64)
        lower = librosa.effects.pitch_shift(x.astype(np.float32), sr=sr, n_steps=-12).astype(np.float64)
        y = B.mix(.55 * x, .9 * low, .45 * lower)
        y = B.sat(y, 2.2)
        x = vverb(y, sr, 1.4, .25)
    elif kind == "vision":
        x = vverb(x, sr, 1.1, .16)
    elif kind == "ghost":
        ch = np.roll(x, int(.017 * sr)) * .4
        x = B.filt(B.mix(x, ch), "lowpass", 6500)
        x = vverb(x, sr, 1.6, .3)
    # nível: RMS de fala parecido entre vozes, pico sob controle
    rms = np.sqrt(np.mean(x[np.abs(x) > .01 * np.abs(x).max()] ** 2)) + 1e-9
    x = x * (.12 / rms)
    pk = np.abs(x).max()
    if pk > .95:
        x = B.sat(x / pk, 1.2) * .95
    return x


def prepare_model(d):
    """baixa o Supertonic 3 (pacotes npm @3sln/donki-lle-voice-multi*, convertidos pelo sherpa-onnx) e remonta os .onnx"""
    import base64
    import io
    import tarfile
    import urllib.request
    if os.path.exists(os.path.join(d, "vocoder.onnx")):
        return
    os.makedirs(d, exist_ok=True)
    pk = {}
    for suf in ("", "-2", "-3"):
        url = f"https://registry.npmjs.org/@3sln/donki-lle-voice-multi{suf}/-/donki-lle-voice-multi{suf}-0.1.1.tgz"
        tf = tarfile.open(fileobj=io.BytesIO(urllib.request.urlopen(url).read()))
        pk["@3sln/donki-lle-voice-multi" + suf] = {m.name[len("package/"):]: tf.extractfile(m).read() for m in tf.getmembers() if m.isfile()}
    vj = pk["@3sln/donki-lle-voice-multi"]["voice.js"].decode()
    cfg = json.loads(vj[vj.index("{"):vj.rindex("}") + 1])
    for fn, info in cfg["files"].items():
        data = b""
        for part in info["parts"]:
            name, rest = part.split("@0.1.1/")
            js = pk[name][rest].decode()
            data += base64.b64decode(js[js.index('"') + 1:js.rindex('"')])
        assert len(data) == info["size"], fn
        open(os.path.join(d, fn), "wb").write(data)


def synth(tts, S, text, lang, cfg, emo, speed_mul=1.0):
    c = S.GenerationConfig()
    c.sid, c.num_steps, c.speed = cfg["sid"], 16, cfg["speed"] * EMO[emo][0] * speed_mul
    c.silence_scale = EMO[emo][2]
    c.extra = {"lang": lang}
    a = tts.generate(prep_text(text), c)
    sr = a.sample_rate
    x = np.array(a.samples, dtype=np.float64)
    nz = np.where(np.abs(x) > .01)[0]
    if len(nz):
        x = x[max(0, nz[0] - int(.03 * sr)):nz[-1] + int(.08 * sr)]
    return x, sr


MYSTERY = {"guardia": .03, "guardia-corrupt": .02, "narrator": .012, "vision": .02, "video": .012, "echo-m": .02, "echo-f": .02}


def phrases(text):
    """quebra a fala em trechos de respiração, com a pausa certa depois de cada um"""
    import re
    t = prep_text(text)
    parts = [p.strip() for p in re.findall(r"[^.,;:!?]+(?:\.\.\.|[.,;:!?])*", t) if p.strip()]
    out = []
    for p in parts:
        if out and len(out[-1]) < 14 and not out[-1].endswith(("...", ".", "?", "!")):
            out[-1] = out[-1] + " " + p
        else:
            out.append(p)
    res = []
    for p in out:
        pause = .62 if p.endswith("...") else .42 if p.endswith((".", "?")) else .36 if p.endswith("!") else .3 if p.endswith((";", ":")) else .2
        res.append((p, pause))
    return res


def phrased(gen, text, voice, emo, mul=1.0):
    """gera trecho por trecho variando ritmo e intensidade: o fim desacelera e baixa (tom de mistério)"""
    ps = phrases(text)
    rg = np.random.default_rng(abs(hash(text)) % (2 ** 32))
    myst = voice.split("-")[0] in ("guardia", "narrator", "vision", "video", "echo") or voice.startswith("cine-")
    chunks, sr = [], 44100
    for k, (p, pause) in enumerate(ps):
        last = k == len(ps) - 1
        v = rg.uniform(.94, 1.05) if not last else (.9 if myst else .96)
        if len(ps) == 1:
            v = .95 if myst else 1.0
        x, sr = gen(p, mul * v)
        # trecho curto demais para o texto = palavras engolidas/aceleradas: refaz mais devagar
        for _ in range(2):
            letters = sum(c.isalpha() for c in p)
            if letters < 8 or len(x) / sr >= letters / 15.5:
                break
            x, sr = gen(p, mul * v * .9)
        g = 1.0
        if last and len(ps) > 1:
            g = .8 if myst else .9
        elif k == 0 and myst and len(ps) > 1:
            g = .9
        if p.endswith("?"):
            g *= 1.05
        x = x * g
        fade = int(.012 * sr)
        x[:fade] *= np.linspace(0, 1, fade)
        x[-fade:] *= np.linspace(1, 0, fade)
        chunks.append(x)
        if not last:
            chunks.append(np.zeros(int(pause * (1.15 if myst else 1.0) * sr)))
    return np.concatenate(chunks), sr


def save_mp3(x, sr, f):
    with tempfile.TemporaryDirectory() as td:
        w = os.path.join(td, "v.wav")
        ww = wave.open(w, "wb")
        ww.setnchannels(1), ww.setsampwidth(2), ww.setframerate(sr)
        ww.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
        ww.close()
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", w, "-ac", "1", "-ar", "32000", "-c:a", "libmp3lame", "-b:a", "48k", f], check=True)


def main():
    S = tts = None
    if PT_ENGINE == "supertonic":
        import sherpa_onnx as S
        prepare_model(MODEL)
    with tempfile.TemporaryDirectory() as td:
        lj = os.path.join(td, "lines.json")
        env = dict(os.environ, NODE_PATH=NODE_MODULES)
        subprocess.run(["node", os.path.join(ROOT, "scripts", "extract_story_lines.cjs"), BUNDLE, lj], check=True, env=env)
        lines = json.load(open(lj))
    over = json.load(open(os.path.join(ROOT, "scripts", "story_en_overrides.json"), encoding="utf-8"))
    M = MODEL.rstrip("/") + "/"
    tts = None if S is None else S.OfflineTts(S.OfflineTtsConfig(model=S.OfflineTtsModelConfig(supertonic=S.OfflineTtsSupertonicModelConfig(
        duration_predictor=M + "duration_predictor.onnx", text_encoder=M + "text_encoder.onnx", vector_estimator=M + "vector_estimator.onnx",
        vocoder=M + "vocoder.onnx", tts_json=M + "tts.json", unicode_indexer=M + "unicode_indexer.bin", voice_style=M + "voice.bin"), num_threads=2)))
    for L in LANGS:
        os.makedirs(os.path.join(OUT, L), exist_ok=True)
    mpath = os.path.join(OUT, "voice-manifest.json")
    old = json.load(open(mpath)) if os.path.exists(mpath) else {}
    if old and "k" not in old:      # formato antigo (só português, arquivos na raiz)
        for h, e in old.items():
            f = os.path.join(OUT, h + ".mp3")
            if os.path.exists(f):
                os.replace(f, os.path.join(OUT, "pt", h + ".mp3"))
        old = {"k": {}, "d": {h: {"pt": e["d"]} for h, e in old.items()}, "s": {h: {"pt": e["s"]} for h, e in old.items()}}
    man = {"k": {}, "d": {}, "s": {}}
    for i, ln in enumerate(lines):
        pt = norm(ln["text"])
        hid = fnv(pt)
        texts = {"pt": pt, "en": norm(ln.get("en") or over.get(ln["text"]) or over.get(pt) or ""), "es": norm(ln.get("es") or "")}
        for t in texts.values():
            if t:
                man["k"].setdefault(fnv(t), hid)
        if hid in man["d"]:
            continue
        cfg = voice_cfg(ln["voice"])
        emo = emotion_of(ln)
        man["d"][hid], man["s"][hid] = {}, {}
        for L in LANGS:
            text = texts[L]
            if not text:
                continue
            sig = hashlib.md5(json.dumps([text, cfg, emo, EMO[emo], 3] + ([L, "kokoro", kvoice(ln["voice"])] if L == "en" else [] if PT_ENGINE == "supertonic" else [L, PT_ENGINE, pvoice(ln["voice"])]), ensure_ascii=False).encode()).hexdigest()[:10]
            f = os.path.join(OUT, L, hid + ".mp3")
            if old.get("s", {}).get(hid, {}).get(L) == sig and os.path.exists(f):
                man["d"][hid][L], man["s"][hid][L] = old["d"][hid][L], sig
                continue
            v = ln["voice"]
            gen = (lambda p, m: synth_en_raw(p, v, emo, m)) if L == "en" else (lambda p, m: synth(tts, S, p, L, cfg, emo, m)) if PT_ENGINE == "supertonic" else (lambda p, m: synth_ptbr_raw(p, v, emo, m))
            breathy = MYSTERY.get("guardia" if v.startswith("cine-") else v, 0)
            x, sr = phrased(gen, text, v, emo)
            x = fx(x, cfg["fx"], sr, emo, breathy)
            if cfg.get("maxd") and len(x) / sr > cfg["maxd"]:            # cabe na legenda do vídeo
                x, sr = phrased(gen, text, v, emo, len(x) / sr / (cfg["maxd"] - .3))
                x = fx(x, cfg["fx"], sr, emo, breathy)
            save_mp3(x, sr, f)
            man["d"][hid][L], man["s"][hid][L] = round(len(x) / sr, 2), sig
            print(f"[{i + 1}/{len(lines)}] {L} {ln['voice']:16s} {emo:10s} {man['d'][hid][L]:5.1f}s  {text[:60]}")
    for L in LANGS:
        d = os.path.join(OUT, L)
        for g in os.listdir(d):
            if g[:-4] not in man["d"] or L not in man["d"][g[:-4]]:
                os.remove(os.path.join(d, g))
    for g in os.listdir(OUT):
        if g.endswith(".mp3"):
            os.remove(os.path.join(OUT, g))
    json.dump(man, open(mpath, "w"), ensure_ascii=False, separators=(",", ":"))
    import shutil
    shutil.rmtree(MIRROR, ignore_errors=True)
    shutil.copytree(OUT, MIRROR)
    for L in LANGS:
        tot = sum(v.get(L, 0) for v in man["d"].values())
        size = sum(os.path.getsize(os.path.join(OUT, L, g)) for g in os.listdir(os.path.join(OUT, L)))
        print(f"dublagem {L}:", sum(1 for v in man["d"].values() if L in v), "falas,", round(tot / 60, 1), "min,", size // 1024, "KB")


if __name__ == "__main__":
    main()
