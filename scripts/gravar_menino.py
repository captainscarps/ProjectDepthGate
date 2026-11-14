"""Regrava em português a voz do menino da missão "A Criança Perdida" (quests.js): ElevenLabs Zozo (voz brasileira
de personagem infantil) com o tom levado a ~230 Hz, como um menino de uns 10 anos. Substitui só o áudio PT das falas
já registradas no voice-manifest (mesmo id; o inglês fica como está).
Uso: python3 scripts/gravar_menino.py [--executar]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import regravar_dublagem_elevenlabs as R
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = os.path.join(ROOT, "assets", "audio", "voice"); MAN = os.path.join(VOICE, "voice-manifest.json")
VOZ, ALVO = "4dlXQwYXFHlCAUmQAu9j", 245   # Zozo; cada fala é medida e levada a ~245 Hz (menino de ~10 anos)
FALAS = [  # texto do jogo → texto falado (as marcas de emoção viram tags do eleven_v4)
    ("(soluçando) Eu… eu me perdi. Entrei atrás do meu cachorro e a porta sumiu.", "[sobbing] Eu… eu me perdi. Entrei atrás do meu cachorro e a porta sumiu."),
    ("Promete?", "[hopeful] Promete?"),
    ("Você cumpriu a promessa! Vou contar pra todo mundo da vila!", "[excited] Você cumpriu a promessa! Vou contar pra todo mundo da vila!"),
    ("Você prometeu…", "Você… prometeu."),
    ("…Tudo bem. Meu cachorro estava me esperando do outro lado. Agora eu sei o caminho.", "…Tudo bem. Meu cachorro estava me esperando do outro lado. Agora eu sei o caminho.")]
def H(t):
    t = re.sub(r"\s+", " ", t).strip(); h = 2166136261; b = t.encode("utf-16-le")
    for i in range(0, len(b), 2): h ^= b[i] | (b[i + 1] << 8); h = (h * 16777619) & 0xFFFFFFFF
    return "%08x" % h
man = json.load(open(MAN, encoding="utf-8")); key = R.api_key()
for jogo, fala in FALAS:
    lid = man["k"].get(H(jogo)); print(lid, jogo[:50])
    if not lid or "--executar" not in sys.argv: continue
    out = os.path.join(VOICE, "pt", lid + ".mp3")
    mp3 = R.req(key, "POST", f"/v1/text-to-speech/{VOZ}?output_format=mp3_44100_128", {"text": fala, "model_id": "eleven_v4", "language_code": "pt", "voice_settings": R.SETTINGS}, raw=True)
    raw = out + ".raw.mp3"; open(raw, "wb").write(mp3)
    import warnings; warnings.filterwarnings("ignore"); import librosa, numpy as np
    y, sr = librosa.load(raw, sr=16000); f, v, _ = librosa.pyin(y, fmin=70, fmax=500, sr=sr); hz = float(np.median(f[v])) if v.sum() > 25 else 175; hz = max(hz, 120)
    PITCH = max(1.0, min(1.5, ALVO / hz)); print(f"  {hz:.0f} Hz × {PITCH:.2f}")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", raw, "-af", f"asetrate=44100*{PITCH},aresample=44100,atempo={1 / PITCH:.5f},loudnorm=I=-16:TP=-1.5", "-ar", "24000", "-ac", "1", "-b:a", "96k", out], check=True)
    os.remove(raw)
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out], capture_output=True, text=True).stdout)
    man["d"][lid]["pt"] = round(d, 2); json.dump(man, open(MAN, "w", encoding="utf-8"), ensure_ascii=False, indent=2); print("  ok", round(d, 2), "s")
