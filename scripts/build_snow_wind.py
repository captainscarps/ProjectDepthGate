"""
Vento sombrio de nevasca (ambiente da Floresta Nevada), gerado por síntese — sem samples de terceiros.

Camadas:
  - rajada grave: ruído marrom passa-baixa, sobe e desce com as rajadas
  - uivo: ruído em banda estreita cujo centro "canta" devagar (200-700 Hz), dois uivos por canal
  - assobio: banda aguda e fina que só aparece no pico das rajadas
  - chiado da neve batendo: ruído agudo bem baixo, acompanha a rajada
O laço é contínuo (o fim se funde ao começo). Também grava o envelope das rajadas
(4 valores por segundo) para a nevasca na tela acompanhar o som.

Saída: assets/audio/ambient/snow-wind.ogg, .mp3 e snow-wind.json
Uso: python3 scripts/build_snow_wind.py
     python3 scripts/build_snow_wind.py --desert   → vento de tempestade de areia (desert-wind.*):
       uivo mais seco e baixo, chiado de areia forte e grãos batendo (estalos finos) nas rajadas
"""
import json
import os
import sys
import shutil
import subprocess
import tempfile
import wave

import numpy as np
from scipy.signal import butter, sosfilt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "audio", "ambient")
os.makedirs(OUT, exist_ok=True)
SR = 44100
DUR = 48.0           # duração do laço
XF = 5.0             # fusão fim→começo
DESERT = "--desert" in sys.argv
NAME = "desert-wind" if DESERT else "snow-wind"
rng = np.random.default_rng(2207 if DESERT else 1913)
N = int((DUR + XF) * SR)
t = np.arange(N) / SR


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)


def lp(x, f, o=2):
    return sosfilt(butter(o, f, "lowpass", fs=SR, output="sos"), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, "highpass", fs=SR, output="sos"), x)


def smooth_curve(points_per_s, amp, lo=0.0):
    """curva aleatória suave (interpolação cosseno)"""
    n = int((DUR + XF) * points_per_s) + 3
    v = lo + rng.random(n) * amp
    x = t * points_per_s
    i = x.astype(int)
    f = (1 - np.cos((x - i) * np.pi)) / 2
    return v[i] * (1 - f) + v[i + 1] * f


# envelope das rajadas: base + bumps assimétricos (sobe rápido, cai devagar)
env = .35 + smooth_curve(.25, .25)
gust_times = []
tt = 2.0
while tt < DUR + XF - 2:
    peak = rng.uniform(.45, 1.0)
    rise, fall = rng.uniform(1.2, 2.5), rng.uniform(3.0, 6.0)
    g = np.where(t < tt, np.exp(-((t - tt) / rise) ** 2), np.exp(-((t - tt) / fall) ** 2)) * peak
    env = env + g
    gust_times.append(round(tt, 2))
    tt += rng.uniform(5.5, 10.0)
env = env / env.max()


def varying_band(seed_curve, width, base_noise):
    """ruído filtrado com centro que varia no tempo (blocos com sobreposição)"""
    blk = 2048
    hop = blk // 2
    win = np.hanning(blk)
    out = np.zeros(N + blk)
    pre = 4096
    x = np.concatenate([base_noise[-pre:], base_noise, base_noise[:blk]])
    for s0 in range(0, N, hop):
        fc = float(seed_curve[min(N - 1, s0 + hop)])
        seg = x[s0:s0 + pre + blk]                      # filtra o trecho cru com pré-rolagem, janela depois
        y = bp(seg, fc * (1 - width), fc * (1 + width), 2)[pre:] * win
        out[s0:s0 + blk] += y
    return out[:N]


def channel(seed):
    r = np.random.default_rng(seed)
    brown = np.cumsum(r.standard_normal(N))
    brown -= np.convolve(brown, np.ones(2000) / 2000, "same")
    brown /= np.abs(brown).max()
    rumble = lp(brown, 260) * (.4 + .9 * env)
    howls = np.zeros(N)
    for k, (lo, amp, w) in enumerate(((150, 200, .08), (260, 300, .07)) if DESERT else ((210, 260, .05), (330, 380, .045))):
        fcurve = lo + smooth_curve(.18 + .05 * k, amp) * (.6 + .5 * env)
        howls += varying_band(fcurve, w, r.standard_normal(N)) * (.25 + 1.1 * env ** 1.6) * (1.0 if k == 0 else .7)
    wcurve = 1300 + smooth_curve(.4, 900)
    whistle = varying_band(wcurve, .02, r.standard_normal(N)) * np.clip(env - .55, 0, 1) ** 1.5 * 2.2
    hiss = hp(r.standard_normal(N), 3500) * (.05 + .22 * env ** 2)
    if DESERT:
        # areia: chiado largo e áspero + grãos batendo (estalos finos, densidade acompanha a rajada)
        sand = lp(bp(r.standard_normal(N), 1500, 7000), 5200) * (.015 + .42 * env ** 2.6)
        clicks = np.zeros(N)
        dens = (25 + 900 * env ** 3) / SR
        hit = r.random(N) < dens
        clicks[hit] = r.uniform(-1, 1, hit.sum())
        grains = hp(bp(clicks, 2500, 9500), 2000) * (.15 + .9 * env ** 2)
        return rumble * 1.2 + howls * 2.2 + whistle * .5 + sand * .5 + grains * .45
    x = rumble * .9 + howls * 2.4 + whistle * 1.0 + hiss * .35
    return x


L = channel(11)
R = channel(29)
mid = (L + R) / 2
L, R = mid * .45 + L * .55, mid * .45 + R * .55
stereo = np.stack([L, R], 1)
# laço contínuo: os últimos XF segundos se fundem ao começo
n0, nx = int(DUR * SR), int(XF * SR)
fade = np.linspace(0, 1, nx)[:, None]
loop = stereo[:n0].copy()
loop[:nx] = stereo[:nx] * fade + stereo[n0:n0 + nx] * (1 - fade)
loop /= np.abs(loop).max() + 1e-9
loop *= .7
env_loop = env[:n0].copy()
env_loop[:nx] = env[:nx] * fade[:, 0] + env[n0:n0 + nx] * (1 - fade[:, 0])

with tempfile.TemporaryDirectory() as td:
    wav = os.path.join(td, "w.wav")
    w = wave.open(wav, "wb")
    w.setnchannels(2), w.setsampwidth(2), w.setframerate(SR)
    w.writeframes((np.clip(loop, -1, 1) * 32767).astype(np.int16).tobytes())
    w.close()
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-c:a", "libvorbis", "-q:a", "3", os.path.join(OUT, NAME + ".ogg")], check=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-c:a", "libmp3lame", "-b:a", "96k", os.path.join(OUT, NAME + ".mp3")], check=True)
step = SR // 4
json.dump({"dur": DUR, "env": [round(float(env_loop[i:i + step].mean()), 3) for i in range(0, n0, step)]},
          open(os.path.join(OUT, NAME + ".json"), "w"), separators=(",", ":"))
MIR = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "ambient")
if os.path.isdir(os.path.dirname(MIR)):
    os.makedirs(MIR, exist_ok=True)
    for f in (NAME + ".ogg", NAME + ".mp3", NAME + ".json"):
        shutil.copy2(os.path.join(OUT, f), os.path.join(MIR, f))
print(NAME, "gerado:", DUR, "s, rajadas em", gust_times)
