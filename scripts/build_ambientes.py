#!/usr/bin/env python3
"""Normaliza os sons ambientes gerados no ElevenLabs (scripts/art-src/ambiente/*.mp3, brutos) para o jogo
(assets/audio/ambient/bioma/): fundos com volume médio de -26 dB, eventos -20 dB, pico limitado em -1 dB;
eventos com mais de 6 s são cortados com fade de saída. Só ganho e limitador (o laço dos fundos continua sem emenda)."""
import os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = os.path.join(ROOT, "scripts/art-src/ambiente"); O = os.path.join(ROOT, "assets/audio/ambient/bioma")
def mean(f):
    o = subprocess.run(["ffmpeg", "-i", f, "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.search(r"mean_volume: (-?[\d.]+)", o).group(1))
def dur(f):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout)
os.makedirs(O, exist_ok=True)
for fn in sorted(os.listdir(S)):
    if not fn.endswith(".mp3"): continue
    f = os.path.join(S, fn); bed = "-bed" in fn; tgt = -26 if bed else -20
    g = max(-12, min(18, tgt - mean(f))); af = [f"volume={g:.1f}dB", "alimiter=limit=0.89:level=false"]
    d = dur(f)
    if not bed and d > 6: af.append("afade=t=out:st=5.4:d=0.6"); extra = ["-t", "6"]
    else: extra = []
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", f, *extra, "-af", ",".join(af), "-c:a", "libmp3lame", "-b:a", "96k", os.path.join(O, fn)], check=True)
    print(f"{fn:20s} {g:+5.1f} dB")
