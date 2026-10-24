"""
Sons do Prólogo do Rio, gerados por síntese (sem samples de terceiros).

  river-flow   laço de 40 s: correnteza calma (chiado largo que respira), borbulhas e marolinhas batendo na margem
  river-rapids laço de 24 s: corredeira da garganta (água branca forte + borbulhas densas); o jogo sobe o volume perto
  river-wind   laço de 48 s: brisa na mata (rumor grave, folhas farfalhando nas rajadas, assobio leve no pico)
               + river-wind.json com o envelope das rajadas (4 valores/s) para as folhas e as árvores acompanharem
  boat-glide   laço de 12 s: água correndo no casco do barco (o volume segue a velocidade)
  boat-sfx     remadas, rangidos da madeira, batida do casco na margem, passos no píer e passos na água rasa, num arquivo só
               + boat-sfx.json com [início, duração] de cada som

Saída: assets/audio/ambient/<nome>.ogg e .mp3 (e o espelho em "Projeto atualizado").
Uso: python3 scripts/build_river_audio.py
"""
import json
import os
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
rng = np.random.default_rng(4417)


def bp(x, lo, hi, o=2):
    return sosfilt(butter(o, [lo, hi], "bandpass", fs=SR, output="sos"), x)


def lp(x, f, o=2):
    return sosfilt(butter(o, f, "lowpass", fs=SR, output="sos"), x)


def hp(x, f, o=2):
    return sosfilt(butter(o, f, "highpass", fs=SR, output="sos"), x)


def curve(n, pps, amp, lo=0.0, r=rng):
    """curva aleatória suave (cosseno) com pps pontos por segundo"""
    m = int(n / SR * pps) + 3
    v = lo + r.random(m) * amp
    x = np.arange(n) / SR * pps
    i = x.astype(int)
    f = (1 - np.cos((x - i) * np.pi)) / 2
    return v[i] * (1 - f) + v[i + 1] * f


def pink(n, r=rng):
    w = r.standard_normal(n)
    X = np.fft.rfft(w)
    f = np.arange(len(X))
    f[0] = 1
    return np.fft.irfft(X / np.sqrt(f), n)


def bubble(f0, dur, rise=1.0):
    """bolha: seno curto com frequência subindo (ressonância de Minnaert) e queda exponencial"""
    t = np.arange(int(dur * SR)) / SR
    f = f0 * (1 + rise * t / dur * .35)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / (dur * .28)) * np.minimum(1, t * SR / 40)


def scatter(n, rate, make, r=rng, env=None):
    out = np.zeros(n)
    k = int(n / SR * rate)
    for _ in range(k):
        s = r.integers(0, n)
        if env is not None and r.random() > env[s]:
            continue
        b = make(r)
        e = min(n, s + len(b))
        out[s:e] += b[:e - s]
    return out


def loopify(stereo, dur, xf):
    n0, nx = int(dur * SR), int(xf * SR)
    fade = np.linspace(0, 1, nx)[:, None]
    loop = stereo[:n0].copy()
    loop[:nx] = stereo[:nx] * fade + stereo[n0:n0 + nx] * (1 - fade)
    return loop


def norm(x, peak):
    return x / (np.abs(x).max() + 1e-9) * peak


def save(name, stereo):
    with tempfile.TemporaryDirectory() as td:
        wav = os.path.join(td, "w.wav")
        w = wave.open(wav, "wb")
        w.setnchannels(2), w.setsampwidth(2), w.setframerate(SR)
        w.writeframes((np.clip(stereo, -1, 1) * 32767).astype(np.int16).tobytes())
        w.close()
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-c:a", "libvorbis", "-q:a", "3", os.path.join(OUT, name + ".ogg")], check=True)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-c:a", "libmp3lame", "-b:a", "96k", os.path.join(OUT, name + ".mp3")], check=True)


def stereo_of(fn, seeds=(1, 2), width=.55):
    L, R = fn(np.random.default_rng(seeds[0])), fn(np.random.default_rng(seeds[1]))
    mid = (L + R) / 2
    return np.stack([mid * (1 - width) + L * width, mid * (1 - width) + R * width], 1)


# ───────── correnteza calma ─────────
def flow_ch(r):
    D, XF = 40.0, 4.0
    n = int((D + XF) * SR)
    breath = .55 + curve(n, .3, .45, r=r)
    body = bp(pink(n, r), 180, 2400) * breath
    sheen = bp(r.standard_normal(n), 1800, 6000) * (.15 + .2 * curve(n, .5, 1, r=r))
    bubbles = scatter(n, 34, lambda q: bubble(q.uniform(380, 1500), q.uniform(.02, .07)) * q.uniform(.15, .6), r)
    # marolinhas na margem: pulsos graves irregulares (~0.7 por segundo)
    lap = np.zeros(n)
    tt = 0.3
    while tt < D + XF - 1:
        s = int(tt * SR)
        L_ = int(r.uniform(.35, .7) * SR)
        e = np.sin(np.linspace(0, np.pi, L_)) ** 2
        lap[s:s + L_] += e[:max(0, min(L_, n - s))] * r.uniform(.4, 1)
        tt += r.uniform(.9, 1.9)
    lapping = lp(bp(r.standard_normal(n), 90, 900), 700) * lap
    return norm(body, 1) * .9 + norm(sheen, 1) * .22 + norm(bubbles, 1) * .55 + norm(lapping, 1) * .5


st = stereo_of(flow_ch, (31, 47))
save("river-flow", norm(loopify(st, 40.0, 4.0), .62))


# ───────── corredeira ─────────
def rapids_ch(r):
    D, XF = 24.0, 3.0
    n = int((D + XF) * SR)
    surge = .7 + curve(n, 1.2, .3, r=r)
    white = bp(r.standard_normal(n), 700, 7000) * surge
    roar = lp(pink(n, r), 380) * (.8 + curve(n, .6, .4, r=r))
    bubbles = scatter(n, 160, lambda q: bubble(q.uniform(500, 2600), q.uniform(.012, .04)) * q.uniform(.2, .8), r)
    splash = scatter(n, 6, lambda q: bp(q.standard_normal(int(.25 * SR)), 900, 5000) * np.exp(-np.arange(int(.25 * SR)) / (.06 * SR)) * q.uniform(.4, 1), r)
    return norm(white, 1) * .8 + norm(roar, 1) * .55 + norm(bubbles, 1) * .4 + norm(splash, 1) * .35


st = stereo_of(rapids_ch, (5, 9), .7)
save("river-rapids", norm(loopify(st, 24.0, 3.0), .7))

# ───────── brisa na mata ─────────
D, XF = 48.0, 5.0
n = int((D + XF) * SR)
t = np.arange(n) / SR
env = .3 + curve(n, .25, .2)
gusts = []
tt = 3.0
while tt < D + XF - 2:
    peak = rng.uniform(.4, 1.0)
    rise, fall = rng.uniform(1.4, 2.8), rng.uniform(3.0, 6.5)
    env = env + np.where(t < tt, np.exp(-((t - tt) / rise) ** 2), np.exp(-((t - tt) / fall) ** 2)) * peak
    gusts.append(round(tt, 1))
    tt += rng.uniform(6.0, 11.0)
env = env / env.max()


def wind_ch(r):
    brown = np.cumsum(r.standard_normal(n))
    brown -= np.convolve(brown, np.ones(2000) / 2000, "same")
    rumble = lp(brown / np.abs(brown).max(), 220) * (.35 + .8 * env)
    # folhas: chiado em banda média-alta com tremulação rápida irregular, forte só nas rajadas
    flutter = .55 + .45 * np.clip(curve(n, 11, 1, r=r) * 1.4 - .2, 0, 1)
    leaves = bp(r.standard_normal(n), 1800, 7000) * flutter * (.05 + env ** 2.2)
    crackle = np.zeros(n)
    hit = r.random(n) < (40 + 700 * env ** 3) / SR
    crackle[hit] = r.uniform(-1, 1, hit.sum())
    crackle = bp(crackle, 2500, 8000) * (.1 + env ** 2)
    whistle = bp(r.standard_normal(n), 900, 960) * np.clip(env - .6, 0, 1) ** 1.4
    return norm(rumble, 1) * .7 + norm(leaves, 1) * .75 + norm(crackle, 1) * .25 + norm(whistle, 1) * .2


st = stereo_of(wind_ch, (12, 13), .7)
save("river-wind", norm(loopify(st, D, XF), .6))
n0, nx = int(D * SR), int(XF * SR)
fade = np.linspace(0, 1, nx)
env_loop = env[:n0].copy()
env_loop[:nx] = env[:nx] * fade + env[n0:n0 + nx] * (1 - fade)
step = SR // 4
json.dump({"dur": D, "env": [round(float(env_loop[i:i + step].mean()), 3) for i in range(0, n0, step)]},
          open(os.path.join(OUT, "river-wind.json"), "w"), separators=(",", ":"))


# ───────── água no casco ─────────
def glide_ch(r):
    D_, XF_ = 12.0, 2.0
    n_ = int((D_ + XF_) * SR)
    wash = bp(pink(n_, r), 250, 3200) * (.7 + curve(n_, 2.0, .3, r=r))
    slosh = np.zeros(n_)
    tt_ = .2
    while tt_ < D_ + XF_ - .5:
        s = int(tt_ * SR)
        L_ = int(r.uniform(.12, .3) * SR)
        e = np.sin(np.linspace(0, np.pi, L_)) ** 3
        slosh[s:s + L_] += e[:max(0, min(L_, n_ - s))] * r.uniform(.4, 1)
        tt_ += r.uniform(.35, .8)
    slosh = bp(r.standard_normal(n_), 150, 1400) * slosh
    bub = scatter(n_, 22, lambda q: bubble(q.uniform(600, 1800), q.uniform(.015, .05)) * q.uniform(.2, .6), r)
    return norm(wash, 1) * .6 + norm(slosh, 1) * .6 + norm(bub, 1) * .35


st = stereo_of(glide_ch, (71, 72))
save("boat-glide", norm(loopify(st, 12.0, 2.0), .6))

# ───────── efeitos do barco (um arquivo, recortes marcados no json) ─────────
pieces = {}
buf = []
pos = 0


def add(kind, x_l, x_r=None):
    global pos
    x_r = x_l if x_r is None else x_r
    s = np.stack([x_l, x_r], 1)
    pieces.setdefault(kind, []).append([round(pos / SR, 3), round(len(s) / SR, 3)])
    buf.append(s)
    gap = np.zeros((int(.25 * SR), 2))
    buf.append(gap)
    pos += len(s) + len(gap)


def env_ad(n_, a, d):
    t_ = np.arange(n_) / SR
    return np.minimum(1, t_ / a) * np.exp(-np.maximum(0, t_ - a) / d)


for k in range(4):                                       # remadas
    r = np.random.default_rng(100 + k)
    N_ = int(1.25 * SR)
    t_ = np.arange(N_) / SR
    plunk = bp(r.standard_normal(N_), 600, 3500) * env_ad(N_, .004, .05) * .9
    f = r.uniform(150, 210) * np.exp(-t_ * 3)
    bloop = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(N_, .006, .07) * .6
    pull_e = np.clip((t_ - .05) / .18, 0, 1) * np.exp(-np.maximum(0, t_ - .23) / .22) * (t_ > .05)
    pull = bp(pink(N_, r), 260, 1700) * pull_e * 1.4
    drips = np.zeros(N_)
    for _ in range(r.integers(4, 8)):
        s = int(r.uniform(.5, 1.05) * SR)
        b = bubble(r.uniform(1100, 2600), r.uniform(.02, .05)) * r.uniform(.15, .45)
        e = min(N_, s + len(b))
        drips[s:e] += b[:e - s]
    x = plunk + bloop + pull + drips
    x = norm(x, .8)
    pan = r.uniform(-.5, .5)
    add("paddle", x * (1 - pan * .5), x * (1 + pan * .5))
for k in range(3):                                       # rangidos da madeira
    r = np.random.default_rng(200 + k)
    N_ = int(r.uniform(.5, .9) * SR)
    t_ = np.arange(N_) / SR
    f0 = r.uniform(38, 70) * (1 + .5 * np.sin(np.linspace(0, r.uniform(1, 3), N_)) + .2 * curve(N_, 18, 1, r=r))
    ph = np.cumsum(f0) / SR
    pulses = (np.mod(ph, 1) < .06).astype(float) * (1 + .4 * r.standard_normal(N_))
    body = bp(pulses, 260, 1100, 3) + .5 * bp(pulses, 1400, 2600, 2)
    e = np.sin(np.linspace(0, np.pi, N_)) ** .8
    add("creak", norm(body * e, .55))
for k in range(2):                                       # casco batendo na margem
    r = np.random.default_rng(300 + k)
    N_ = int(.5 * SR)
    t_ = np.arange(N_) / SR
    thud = lp(r.standard_normal(N_), 260) * env_ad(N_, .003, .07) + np.sin(2 * np.pi * 85 * t_) * env_ad(N_, .002, .09) * .7
    sl = bp(r.standard_normal(N_), 500, 3000) * env_ad(N_, .02, .12) * .3
    add("bump", norm(thud + sl, .85))
for k in range(4):                                       # passos na madeira do píer
    r = np.random.default_rng(400 + k)
    N_ = int(.22 * SR)
    t_ = np.arange(N_) / SR
    knock = bp(r.standard_normal(N_), 180, 900) * env_ad(N_, .002, .03) + np.sin(2 * np.pi * r.uniform(110, 150) * t_) * env_ad(N_, .002, .04) * .5
    add("step", norm(knock, .5))
for k in range(4):                                       # passos na água rasa (herói e animais)
    r = np.random.default_rng(600 + k)
    N_ = int(.32 * SR)
    t_ = np.arange(N_) / SR
    slap = bp(r.standard_normal(N_), 700, 4200) * env_ad(N_, .006, .045)
    swish = bp(pink(N_, r), 250, 1600) * env_ad(N_, .03, .09) * .8
    drops = np.zeros(N_)
    for _ in range(r.integers(2, 5)):
        s0 = int(r.uniform(.05, .22) * SR)
        b_ = bubble(r.uniform(900, 2200), r.uniform(.015, .035)) * r.uniform(.2, .5)
        e_ = min(N_, s0 + len(b_))
        drops[s0:e_] += b_[:e_ - s0]
    add("wade", norm(slap + swish + drops, .55))
for k in range(1):                                       # desembarque: barco balança e a água espirra
    r = np.random.default_rng(500)
    N_ = int(1.4 * SR)
    t_ = np.arange(N_) / SR
    sp = bp(r.standard_normal(N_), 400, 4000) * env_ad(N_, .01, .18)
    sl = bp(pink(N_, r), 150, 1200) * (np.sin(np.minimum(1, t_ / 1.2) * np.pi * 3) ** 2) * np.exp(-t_ / .6) * .8
    add("splash", norm(sp + sl, .75))
all_ = np.concatenate(buf)
save("boat-sfx", all_)
json.dump(pieces, open(os.path.join(OUT, "boat-sfx.json"), "w"), separators=(",", ":"))

MIR = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "ambient")
if os.path.isdir(os.path.dirname(MIR)):
    os.makedirs(MIR, exist_ok=True)
    for nm in ("river-flow", "river-rapids", "river-wind", "boat-glide", "boat-sfx"):
        for ext in (".ogg", ".mp3"):
            shutil.copy2(os.path.join(OUT, nm + ext), os.path.join(MIR, nm + ext))
    for f_ in ("river-wind.json", "boat-sfx.json"):
        shutil.copy2(os.path.join(OUT, f_), os.path.join(MIR, f_))
print("sons do rio gerados; rajadas em", gusts, "; efeitos:", {k: len(v) for k, v in pieces.items()})
