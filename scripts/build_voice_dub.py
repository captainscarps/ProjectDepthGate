"""
Dublagem da história com voz neural (Supertonic 3, licença OpenRAIL-M, roda offline via sherpa-onnx), em português.
  1. extrai as falas do bundle com quem fala (extract_story_lines.cjs)
  2. gera cada fala com a voz do personagem (narrador, Guardiã, Rei, heróis, ecos dos Antigos)
  3. aplica o "acabamento" de cada voz (eco de templo, voz demoníaca do Rei corrompido, fantasma dos ecos…)
  4. salva assets/audio/voice/<hash>.mp3 + voice-manifest.json (o jogo toca pela frase exibida)
Re-executável: falas já geradas com a mesma voz são reaproveitadas.
Uso: python3 scripts/build_voice_dub.py <pasta_do_modelo> <pasta_node_modules_com_acorn>
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
MODEL, NODE_MODULES = (sys.argv[1:3] + ["", ""])[:2]

# sid: 0-4 vozes femininas, 5-9 masculinas do Supertonic 3
VOICES = {
    "narrator": dict(sid=6, speed=.9, fx="room"),
    "guardia": dict(sid=0, speed=.93, fx="temple"),
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
}


def voice_cfg(v):
    if v.startswith("cine-"):
        return VOICES["guardia"] if "GUARDI" in v.upper() else VOICES["narrator"]
    return VOICES.get(v) or VOICES["narrator"]


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


def fx(x, kind, sr):
    import librosa
    x = x.astype(np.float64)
    x = B.filt(x, "highpass", 70)
    if kind == "room":
        x = B.space(x, "small", .1)
    elif kind == "temple":
        ch = np.roll(x, int(.011 * sr)) * .35
        x = B.space(B.mix(x, ch), "stone", .22)
    elif kind == "demon":
        low = librosa.effects.pitch_shift(x.astype(np.float32), sr=sr, n_steps=-5).astype(np.float64)
        lower = librosa.effects.pitch_shift(x.astype(np.float32), sr=sr, n_steps=-12).astype(np.float64)
        y = B.mix(.55 * x, .9 * low, .45 * lower)
        y = B.sat(y, 2.2)
        x = B.space(y, "stone", .28)
    elif kind == "ghost":
        ch = np.roll(x, int(.017 * sr)) * .5
        x = B.filt(B.mix(x, ch), "lowpass", 6500)
        x = B.space(x, "stone", .35)
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


def main():
    import sherpa_onnx as S
    prepare_model(MODEL)
    with tempfile.TemporaryDirectory() as td:
        lj = os.path.join(td, "lines.json")
        env = dict(os.environ, NODE_PATH=NODE_MODULES)
        subprocess.run(["node", os.path.join(ROOT, "scripts", "extract_story_lines.cjs"), BUNDLE, lj], check=True, env=env)
        lines = json.load(open(lj))
    M = MODEL.rstrip("/") + "/"
    tts = S.OfflineTts(S.OfflineTtsConfig(model=S.OfflineTtsModelConfig(supertonic=S.OfflineTtsSupertonicModelConfig(
        duration_predictor=M + "duration_predictor.onnx", text_encoder=M + "text_encoder.onnx", vector_estimator=M + "vector_estimator.onnx",
        vocoder=M + "vocoder.onnx", tts_json=M + "tts.json", unicode_indexer=M + "unicode_indexer.bin", voice_style=M + "voice.bin"), num_threads=2)))
    os.makedirs(OUT, exist_ok=True)
    mpath = os.path.join(OUT, "voice-manifest.json")
    old = json.load(open(mpath)) if os.path.exists(mpath) else {}
    man = {}
    for i, ln in enumerate(lines):
        text = norm(ln["text"])
        h = fnv(text)
        if h in man:
            continue
        cfg = voice_cfg(ln["voice"])
        sig = hashlib.md5(json.dumps([text, cfg], ensure_ascii=False).encode()).hexdigest()[:10]
        f = os.path.join(OUT, h + ".mp3")
        if old.get(h, {}).get("s") == sig and os.path.exists(f):
            man[h] = old[h]
            continue
        c = S.GenerationConfig()
        c.sid, c.num_steps, c.speed = cfg["sid"], 12, cfg["speed"]
        c.extra = {"lang": "pt"}
        a = tts.generate(text, c)
        sr = a.sample_rate
        x = np.array(a.samples, dtype=np.float64)
        nz = np.where(np.abs(x) > .01)[0]
        if len(nz):
            x = x[max(0, nz[0] - int(.03 * sr)):nz[-1] + int(.08 * sr)]
        x = fx(x, cfg["fx"], sr)
        with tempfile.TemporaryDirectory() as td:
            w = os.path.join(td, "v.wav")
            ww = wave.open(w, "wb")
            ww.setnchannels(1), ww.setsampwidth(2), ww.setframerate(sr)
            ww.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes())
            ww.close()
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", w, "-ac", "1", "-ar", "32000", "-c:a", "libmp3lame", "-b:a", "48k", f], check=True)
        man[h] = {"d": round(len(x) / sr, 2), "v": ln["voice"], "s": sig}
        print(f"[{i + 1}/{len(lines)}] {ln['voice']:16s} {man[h]['d']:5.1f}s  {text[:60]}")
    # remove falas que não existem mais
    for g in os.listdir(OUT):
        if g.endswith(".mp3") and g[:-4] not in man:
            os.remove(os.path.join(OUT, g))
    json.dump(man, open(mpath, "w"), ensure_ascii=False, separators=(",", ":"))
    os.makedirs(MIRROR, exist_ok=True)
    for g in os.listdir(MIRROR):
        if g not in os.listdir(OUT):
            os.remove(os.path.join(MIRROR, g))
    for g in os.listdir(OUT):
        with open(os.path.join(OUT, g), "rb") as a, open(os.path.join(MIRROR, g), "wb") as b:
            b.write(a.read())
    tot = sum(v["d"] for v in man.values())
    size = sum(os.path.getsize(os.path.join(OUT, g)) for g in os.listdir(OUT))
    print("dublagem:", len(man), "falas,", round(tot / 60, 1), "min,", size // 1024, "KB")


if __name__ == "__main__":
    main()
