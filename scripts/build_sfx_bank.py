"""
Banco de efeitos sonoros do Depthgate gerado por SÍNTESE FÍSICA (sem samples de terceiros, 100% livre):
  - golpes de arma: deslocamento de ar = ruído filtrado com centro que varre (efeito Doppler)
  - metal (escudo, moedas, trincos): síntese modal — senoides amortecidas com razões inarmônicas de placa/barra
  - madeira (portas, baús, Ents): atrito stick-slip passando por ressonâncias de madeira
  - água (passos no lago, poção): modelo de bolhas de Minnaert (frequência sobe enquanto a bolha some)
  - ossos, cascalho, folhas: grãos (milhares de micro-impactos) com densidade decrescente
  - fogo, gelo, pedra, lava, explosões: camadas de ruído colorido, estalos e ressonâncias
Cada som tem 3-4 variações. Saída: assets/audio/sfx/sfx-bank.mp3 (sprite) + sfx-bank.json.
Uso: python3 scripts/build_sfx_bank.py [--preview arquivo.mp3]
"""
import json
import math
import os
import subprocess
import sys
import tempfile

import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "audio", "sfx")
SR = 44100
rng = np.random.default_rng(7)


# ─────────────────────────── blocos básicos ───────────────────────────
def T(d):
    return np.arange(int(d * SR)) / SR


def noise(d):
    return rng.standard_normal(int(d * SR))


def brown(d):
    x = np.cumsum(rng.standard_normal(int(d * SR)))
    x -= np.convolve(x, np.ones(400) / 400, "same")
    return x / (np.abs(x).max() + 1e-9)


def filt(x, kind, f, order=2):
    f = np.atleast_1d(f)
    f = np.clip(f, 20, SR / 2 - 100)
    sos = butter(order, f if len(f) > 1 else f[0], btype=kind, fs=SR, output="sos")
    return sosfilt(sos, x)


def svf_bp(x, fc, q, stages=2):
    """passa-banda de estado variável com frequência variando no tempo (fc: array); 2 estágios = saias mais íngremes"""
    fc = np.broadcast_to(fc, x.shape)
    k = 1.0 / q
    fs = 2 * np.sin(np.pi * np.minimum(fc, SR / 6) / SR)
    for _ in range(stages):
        y = np.zeros_like(x)
        lp = bp = 0.0
        for i in range(len(x)):
            f = fs[i]
            hp = x[i] - lp - k * bp
            bp += f * hp
            lp += f * bp
            y[i] = bp
        x = y
    return y


def svf_lp(x, fc, q=0.8):
    y = np.zeros_like(x)
    lp = bp = 0.0
    fc = np.broadcast_to(fc, x.shape)
    k = 1.0 / q
    for i in range(len(x)):
        f = 2 * math.sin(math.pi * min(fc[i], SR / 6) / SR)
        hp = x[i] - lp - k * bp
        bp += f * hp
        lp += f * bp
        y[i] = lp
    return y


def env_ad(d, a, dec, curve=4.0):
    t = T(d)
    e = np.where(t < a, t / max(a, 1e-4), np.exp(-(t - a) / max(dec, 1e-4) * (curve / 4)))
    return e


def env_bell(d, peak=0.45, sharp=2.2):
    t = T(d) / d
    e = np.where(t < peak, (t / peak) ** sharp, ((1 - t) / (1 - peak)) ** (sharp * .8))
    return np.clip(e, 0, 1)


def pad(x, d):
    n = int(d * SR)
    return np.pad(x, (0, max(0, n - len(x))))[:n] if len(x) < n else x


def mix(*parts):
    n = max(len(p) for p in parts)
    o = np.zeros(n)
    for p in parts:
        o[:len(p)] += p
    return o


def at(x, t0, d=None):
    s = np.zeros(int(t0 * SR))
    y = np.concatenate([s, x])
    return pad(y, d) if d else y


def modal(freqs, decays, amps, d, strike=0.003):
    t = T(d)
    o = np.zeros_like(t)
    for f, dc, a in zip(freqs, decays, amps):
        if f >= SR / 2 - 200:
            continue
        o += a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6.28)) * np.exp(-t / dc)
    o *= 1 - np.exp(-t / strike)
    return o


def click(d=0.004, f=3000):
    return filt(noise(d) * env_ad(d, .0003, d / 4), "bandpass", [f * .6, f * 1.6])


def grains(d, rate0, rate1, fmin, fmax, glen=(0.0015, 0.006), amp=(0.3, 1.0), decay=None):
    """nuvem de micro-impactos (ossos, cascalho, folhas, estalos)"""
    n = int(d * SR)
    o = np.zeros(n)
    t = 0.0
    while t < d:
        r = rate0 + (rate1 - rate0) * (t / d)
        t += rng.exponential(1.0 / max(r, 1e-3))
        if t >= d:
            break
        gl = rng.uniform(*glen)
        f = math.exp(rng.uniform(math.log(fmin), math.log(fmax)))
        g = click(gl, f) * rng.uniform(*amp)
        if decay:
            g *= math.exp(-t / decay)
        i = int(t * SR)
        o[i:i + len(g)] += g[:max(0, n - i)]
    return o


def bubble(f0, d=None, rise=None, amp=1.0):
    """bolha de Minnaert: senoide amortecida cuja frequência sobe enquanto a bolha chega à superfície"""
    tau = 0.043 / (f0 ** .55) * 6 if d is None else d / 4
    d = d or tau * 5
    t = T(d)
    rise = rise if rise is not None else rng.uniform(.1, .25) / tau
    f = f0 * (1 + rise * t)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return amp * np.sin(ph) * np.exp(-t / tau) * (1 - np.exp(-t / .0008))


def creak(d, f0, f1, wobble=0.25, res=(320, 760, 1450, 2600), q=9):
    """atrito stick-slip (dobradiça, madeira): trem de impulsos irregular + ressonâncias de madeira"""
    n = int(d * SR)
    x = np.zeros(n)
    t = 0.0
    lfo = rng.uniform(1.5, 3.5)
    while t < d:
        f = f0 + (f1 - f0) * (t / d)
        f *= 1 + wobble * math.sin(2 * math.pi * lfo * t) + rng.normal(0, .08)
        t += 1.0 / max(f, 8)
        i = int(t * SR)
        if i < n:
            x[i] += rng.uniform(.5, 1.0)
    o = np.zeros(n)
    for k, r in enumerate(res):
        o += filt(x, "bandpass", [r / (1 + 1 / q), r * (1 + 1 / q)]) / (1 + k * .4)
    return o * env_bell(d, .3, 1.2)


def ks_pluck(f, d, damp=0.996, bright=0.5):
    """corda (Karplus-Strong) — corda do arco"""
    n = int(d * SR)
    p = int(SR / f)
    buf = rng.uniform(-1, 1, p) * 1.0
    buf = filt(buf, "lowpass", 1500 + bright * 6000)
    o = np.zeros(n)
    for i in range(n):
        o[i] = buf[i % p]
        buf[i % p] = damp * .5 * (buf[i % p] + buf[(i + 1) % p])
    return o


def whoosh(d, f0, fpk, f1, q=2.2, peak=.45, bright=0.0):
    t = T(d)
    u = t / d
    fc = np.where(u < peak, f0 * (fpk / f0) ** (u / peak), fpk * (f1 / fpk) ** ((u - peak) / (1 - peak)))
    x = svf_bp(noise(d), fc, q) * env_bell(d, peak, 2.0)
    if bright:
        x += bright * svf_bp(noise(d), fc * 2.6, q * 1.5) * env_bell(d, peak, 3.0)
    return x


def thump(f0=90, f1=45, d=.18, dec=.06):
    t = T(d)
    f = f1 + (f0 - f1) * np.exp(-t / (dec * .6))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / dec)


def room(x, size=.25, wet=.12, damp=3000):
    """pequena reverberação (sala de pedra) para dar corpo"""
    n = int(size * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (n / 5))
    ir = filt(ir, "lowpass", damp)
    ir /= np.abs(ir).sum() ** .5 * 6
    y = fftconvolve(x, ir)[:len(x) + n]
    return mix(x, y * wet * 8)


def fin(x, gain_db=-3.0, fade=0.004, hp=35):
    x = filt(x, "highpass", hp)
    i = np.where(np.abs(x) > 1e-4 * np.abs(x).max())[0]
    x = x[i[0]:i[-1] + 1] if len(i) else x
    nf = int(fade * SR)
    x[-nf:] *= np.linspace(1, 0, nf)
    x[:16] *= np.linspace(0, 1, 16)
    pk = np.abs(x).max() + 1e-9
    return x / pk * 10 ** (gain_db / 20)


def J(a, b):
    return rng.uniform(a, b)


# ─────────────────────────── receitas ───────────────────────────
def r_sword():
    d = J(.22, .3)
    x = whoosh(d, J(350, 500), J(1800, 2600), J(500, 800), q=J(2.2, 3.2), peak=J(.4, .55), bright=.35)
    ring = modal([J(2900, 3400) * k for k in (1, 1.52, 2.31)], [.05, .035, .02], [.05, .03, .02], d)
    return fin(mix(x, ring * env_bell(d, .5, 1)))


def r_heavy_swing():
    d = J(.32, .42)
    return fin(mix(whoosh(d, J(160, 220), J(700, 1000), J(200, 300), q=1.6, peak=.5),
                   .6 * whoosh(d, 90, 300, 100, q=1.2, peak=.55)))


def r_dagger():
    d = J(.14, .19)
    return fin(whoosh(d, J(900, 1300), J(3500, 4800), J(1500, 2000), q=J(3, 4), peak=.42, bright=.25))


def r_staff():
    d = J(.26, .34)
    x = whoosh(d, J(250, 330), J(900, 1300), J(300, 450), q=1.8, peak=.5)
    return fin(mix(x, .25 * creak(d, 60, 90, res=(450, 1100), q=6)))


def r_dash():
    d = J(.2, .26)
    return fin(mix(whoosh(d, 300, J(1200, 1600), 500, q=1.2, peak=.35), .4 * grains(d, 300, 50, 2500, 6000, amp=(.05, .2))))


def r_miss():
    d = J(.16, .21)
    return fin(whoosh(d, 400, J(1300, 1800), 600, q=2.2, peak=.45), -6)


def r_hit():
    """golpe acertando carne/couro: baque grave + estalo + respingo curto"""
    d = .25
    x = mix(thump(J(110, 140), J(50, 60), d, J(.045, .06)),
            .7 * filt(noise(.05) * env_ad(.05, .0005, .012), "lowpass", J(900, 1400)),
            .45 * filt(noise(.03) * env_ad(.03, .0003, .006), "bandpass", [1200, 3200]),
            .25 * grains(.08, 400, 60, 1500, 4000, amp=(.1, .4)))
    return fin(room(x, .18, .08))


def r_hit_metal():
    d = .45
    f = J(380, 520)
    x = mix(modal([f * k for k in (1, 1.58, 2.24, 2.92, 3.86, 5.1)], [.22, .16, .1, .07, .05, .03], [1, .6, .5, .35, .25, .15], d),
            .6 * filt(noise(.02) * env_ad(.02, .0002, .004), "highpass", 2000),
            .5 * thump(160, 80, .12, .03))
    return fin(room(x, .2, .08))


def r_shield():
    d = .6
    f = J(300, 380)
    x = mix(modal([f * k for k in (1, 1.59, 2.14, 2.65, 3.6, 4.15, 5.4)], [.3, .22, .15, .12, .08, .06, .04], [1, .7, .55, .45, .3, .25, .18], d),
            .9 * thump(120, 60, .2, .05),
            .5 * filt(noise(.03) * env_ad(.03, .0003, .006), "bandpass", [1800, 6000]))
    return fin(room(x, .25, .1))


def r_player_hurt():
    d = .35
    x = mix(thump(J(95, 120), 45, d, .07),
            .6 * filt(noise(.06) * env_ad(.06, .0005, .015), "lowpass", 1100),
            .4 * grains(.18, 260, 30, 2500, 6500, glen=(.001, .003), amp=(.15, .5)),  # malha/armadura chacoalhando
            .25 * modal([J(2400, 2800) * k for k in (1, 1.41, 2.03)], [.06, .04, .03], [1, .6, .4], d))
    return fin(room(x, .2, .08))


def r_bones():
    """esqueleto desmontando: ossos batendo e rolando"""
    d = J(.7, .9)
    x = mix(grains(d, J(120, 160), 4, 700, 3500, glen=(.002, .007), amp=(.25, 1), decay=.35),
            .6 * mix(*[at(modal([J(500, 1100) * k for k in (1, 2.4, 4.1)], [.03, .02, .012], [1, .5, .3], .12), J(0, .4)) for _ in range(5)]),
            .5 * thump(80, 40, .25, .07))
    return fin(room(pad(x, d), .3, .12))


def r_death():
    d = .8
    x = mix(thump(70, 32, .5, .12), .6 * filt(brown(.5) * env_ad(.5, .01, .15), "lowpass", 700),
            .35 * grains(.6, 90, 5, 500, 2500, amp=(.2, .7), decay=.3))
    return fin(room(x, .35, .12))


def r_skel_attack():
    d = .35
    return fin(mix(.8 * grains(d, 260, 40, 900, 4000, glen=(.002, .005), amp=(.2, 1), decay=.15), whoosh(d, 300, 1100, 400, q=1.8) * .6))


def r_growl(f0=None, d=None, formants=(420, 950, 2300), rough=.35):
    d = d or J(.45, .65)
    f0 = f0 or J(65, 85)
    t = T(d)
    f = f0 * (1 + .12 * np.sin(2 * np.pi * J(3, 6) * t)) * (1 + rough * .1 * filt(noise(d), "lowpass", 30) * 10)
    ph = np.cumsum(f) / SR
    saw = 2 * (ph % 1) - 1
    src = saw * (1 + rough * filt(noise(d), "lowpass", 80) * 4) + .5 * noise(d)
    o = sum(filt(src, "bandpass", [fm * .85, fm * 1.15]) / (1 + k * .7) for k, fm in enumerate(formants))
    return o * env_bell(d, .25, 1.4)


def r_orc_attack():
    d = J(.5, .6)
    return fin(mix(r_growl(J(70, 90), d), .7 * whoosh(d, 150, 600, 200, q=1.4, peak=.55)))


def r_wood_attack():
    """Árvore Amaldiçoada: tronco rangendo + galhos estalando + golpe de ar"""
    d = J(.6, .75)
    x = mix(creak(d, J(30, 45), J(70, 90), wobble=.35, res=(180, 420, 900, 1700), q=7),
            .5 * whoosh(d, 120, 450, 160, q=1.3, peak=.6),
            .4 * grains(d, 30, 120, 1200, 3500, glen=(.002, .006), amp=(.2, .9)))
    return fin(room(x, .3, .1))


def r_heavy_smash():
    d = 1.0
    x = mix(thump(J(70, 85), 30, d, .18), .9 * filt(noise(.4) * env_ad(.4, .002, .09), "lowpass", 900),
            .5 * at(grains(.7, 220, 8, 600, 3000, glen=(.002, .008), amp=(.2, 1), decay=.25), .03),
            .4 * filt(brown(d) * env_ad(d, .01, .3), "lowpass", 180))
    return fin(room(x, .45, .14))


def r_door_open():
    d = J(.9, 1.2)
    x = mix(creak(d * .8, J(25, 35), J(90, 130), wobble=.3), .7 * at(thump(90, 50, .25, .05), d * .8))
    return fin(room(pad(x, d + .1), .35, .12))


def r_door_locked():
    d = .45
    x = np.zeros(int(d * SR))
    for t0 in (0, J(.08, .11), J(.19, .24)):
        f = J(1800, 2400)
        c = mix(modal([f * k for k in (1, 1.47, 2.3)], [.03, .02, .015], [1, .6, .3], .08), .5 * thump(150, 90, .06, .015))
        x = mix(x, at(c * J(.6, 1), t0, d))
    return fin(room(x, .25, .1))


def r_chest():
    d = 1.0
    x = mix(at(modal([J(1500, 1900) * k for k in (1, 1.5, 2.4)], [.04, .03, .02], [1, .5, .3], .1), 0),  # trinco
            at(creak(.6, 30, 60, wobble=.2, res=(260, 600, 1300), q=8), .08),
            .8 * at(thump(85, 45, .2, .05), .7))
    return fin(room(pad(x, d), .3, .1))


def r_coins():
    d = .55
    x = np.zeros(int(d * SR))
    for k in range(int(J(5, 8))):
        f = J(3200, 5200)
        c = modal([f * r for r in (1, 1.34, 2.08, 2.7)], [J(.05, .09), .05, .03, .02], [1, .5, .4, .25], .2)
        x = mix(x, at(c * J(.4, 1), J(0, .25) if k else 0, d))
    return fin(x)


def r_pickup():
    d = .3
    return fin(mix(.7 * grains(.12, 300, 100, 2000, 5000, amp=(.2, .6)), modal([J(2600, 3000) * r for r in (1, 1.5, 2.2)], [.06, .04, .03], [1, .5, .3], d) * .6,
                   .5 * whoosh(.18, 600, 1800, 900, q=2)))


def r_potion():
    d = 1.0
    x = np.zeros(int(d * SR))
    for _ in range(14):
        x = mix(x, at(bubble(J(350, 1400), amp=J(.2, .6)), J(0, .55), d))
    x = mix(x, at(bubble(J(160, 230), d=.18, rise=3, amp=1), .6), at(bubble(J(150, 210), d=.16, rise=3, amp=.8), .78))  # goles
    return fin(room(x, .2, .06))


def r_water_step():
    """passo em água rasa: respingo (ruído agudo) + bolhas de Minnaert + baque abafado"""
    d = .45
    x = mix(filt(noise(.12) * env_ad(.12, .002, .035), "bandpass", [J(1500, 2200), 7000]) * .6,
            .4 * filt(noise(.08) * env_ad(.08, .001, .02), "lowpass", 600))
    for _ in range(int(J(6, 11))):
        x = mix(x, at(bubble(J(500, 2600), amp=J(.15, .5)), J(.005, .2), d))
    return fin(pad(x, d), -5)


def r_step():
    """passo em terra/folhas: baque macio + estalos de folhas e gravetos"""
    d = .2
    x = mix(.6 * thump(J(70, 90), 45, d, .025), .8 * filt(noise(.06) * env_ad(.06, .002, .015), "bandpass", [300, 1500]),
            .45 * grains(.1, 500, 100, 2000, 7000, glen=(.0008, .002), amp=(.1, .5)))
    return fin(x, -6)


def r_secret():
    """parede de pedra deslizando: arrasto grave + poeira caindo"""
    d = 1.6
    t = T(d)
    am = 1 + .5 * filt(noise(d), "lowpass", 8) * 20
    x = mix(svf_bp(brown(d) * am, 260 + 120 * np.sin(2 * np.pi * .7 * t), 1.4) * env_bell(d, .3, 1),
            .6 * filt(brown(d), "lowpass", 90) * env_bell(d, .3, 1),
            .3 * at(grains(1.0, 30, 120, 1500, 5000, amp=(.1, .5)), .4, d))
    return fin(room(x, .5, .15))


def r_fire():
    """bola de fogo: rugido (ruído grave modulado) + estalos"""
    d = J(.7, .9)
    t = T(d)
    roar = svf_lp(noise(d) * (1 + .6 * np.sin(2 * np.pi * J(9, 14) * t)), 300 + 1600 * env_bell(d, .25, 1.5), .9)
    x = mix(roar * env_bell(d, .2, 1.3), .5 * grains(d, 60, 180, 1500, 6000, glen=(.0006, .002), amp=(.1, .8)),
            .5 * whoosh(d, 200, 1200, 300, q=1.0, peak=.3))
    return fin(x)


def r_explosion():
    d = 1.4
    x = mix(thump(65, 25, d, .3), filt(noise(d) * env_ad(d, .003, .22), "lowpass", 1400),
            .6 * filt(brown(d) * env_ad(d, .01, .45), "lowpass", 160),
            .4 * at(grains(1.0, 200, 10, 800, 4000, amp=(.1, .8), decay=.35), .05, d))
    return fin(room(x, .6, .12))


def r_ice():
    """gelo: estalo cristalino + estilhaços de vidro"""
    d = .8
    x = mix(filt(noise(.03) * env_ad(.03, .0002, .006), "highpass", 3000))
    for _ in range(int(J(9, 14))):
        f = J(2500, 7500)
        c = modal([f * r for r in (1, 1.73, 2.61)], [J(.04, .15), .05, .03], [1, .4, .25], .3)
        x = mix(x, at(c * J(.15, .6), J(0, .35), d))
    x = mix(x, .4 * whoosh(.4, 1500, 4500, 2000, q=2.5))
    return fin(room(x, .3, .1))


def r_arcane():
    d = .7
    t = T(d)
    x = mix(*[np.sin(2 * np.pi * f * t * (1 + .002 * np.sin(2 * np.pi * 6 * t))) * env_bell(d, .15, 1.5) * a
              for f, a in ((J(420, 480), 1), (J(630, 700), .5), (J(880, 960), .35))],
            .5 * whoosh(d, 400, 2800, 800, q=3, peak=.2), .3 * grains(d, 200, 20, 3000, 9000, amp=(.05, .3)))
    return fin(room(x, .4, .15))


def r_bow():
    d = .55
    x = mix(ks_pluck(J(95, 130), .45, damp=.994, bright=.6) * env_ad(.45, .001, .12), .6 * at(whoosh(.3, 900, 3200, 1500, q=3, peak=.3), .02, d),
            .3 * thump(160, 100, .05, .01))
    return fin(pad(x, d))


def r_arrow_hit():
    d = .3
    return fin(mix(thump(160, 90, d, .03), .6 * creak(.12, 140, 80, wobble=.1, res=(700, 1600), q=10), .5 * filt(noise(.02) * env_ad(.02, .0002, .004), "bandpass", [1500, 5000])))


def r_lava():
    d = .6
    t = T(d)
    x = mix(filt(noise(d), "bandpass", [1800, 7000]) * (.5 + .5 * np.abs(filt(noise(d), "lowpass", 25) * 15)) * env_bell(d, .1, 1),
            .5 * grains(d, 150, 60, 2000, 8000, glen=(.0005, .0015), amp=(.1, .7)), .3 * at(bubble(220, d=.2, rise=2), .1, d))
    return fin(x, -5)


def r_roar():
    d = J(1.1, 1.4)
    return fin(room(mix(r_growl(J(45, 55), d, formants=(300, 700, 1900), rough=.6), .5 * filt(brown(d), "lowpass", 140) * env_bell(d, .3, 1)), .5, .15))


def r_beast_alert():
    d = J(.5, .7)
    return fin(r_growl(J(90, 120), d, formants=(500, 1200, 2700), rough=.4))


def r_smoke():
    d = .7
    return fin(mix(whoosh(d, 200, 900, 250, q=.9, peak=.3), .15 * filt(noise(d), "bandpass", [2500, 6000]) * env_bell(d, .2, 1)))


def r_shadow_step():
    d = .4
    t = T(d)
    x = mix(whoosh(d, 1200, 300, 120, q=2, peak=.25), .5 * np.sin(2 * np.pi * np.cumsum(220 * np.exp(-t * 4)) / SR) * env_bell(d, .2, 1.5))
    return fin(room(x, .3, .12))


def r_whirlwind():
    d = 1.0
    t = T(d)
    fc = 500 + 400 * np.sin(2 * np.pi * 5 * t)
    x = mix(svf_bp(noise(d), fc, 1.6) * env_bell(d, .5, 1.2), .5 * svf_bp(noise(d), fc * 3, 3) * env_bell(d, .5, 1.5))
    return fin(x)


def r_heal():
    d = 1.0
    t = T(d)
    x = mix(*[np.sin(2 * np.pi * f * t) * env_bell(d, .25 + k * .1, 1.6) * .5 for k, f in enumerate((523, 659, 784, 1047))],
            .4 * grains(d, 80, 20, 4000, 9000, amp=(.05, .3)))
    return fin(room(x, .5, .2), -6)


def r_shrine():
    d = 1.6
    f = J(200, 240)
    x = mix(modal([f * r for r in (1, 2.0, 2.76, 3.0, 4.07, 5.4)], [1.2, .9, .6, .5, .35, .25], [1, .5, .35, .3, .2, .12], d), .3 * thump(90, 60, .3, .08))
    return fin(room(x, .8, .2))


def r_lever():
    d = .55
    x = mix(creak(.25, 60, 120, wobble=.15, res=(500, 1200, 2400), q=12) * .7,
            at(modal([J(900, 1100) * r for r in (1, 1.6, 2.5)], [.05, .03, .02], [1, .5, .3], .12), .26, d),
            at(thump(110, 60, .2, .04), .26, d))
    return fin(room(x, .3, .1))



# ═══════════════════════ segunda rodada: camadas, saturação, espaço e transientes reais ═══════════════════════
def sat(x, drive=2.0):
    """saturação suave (como um pré de gravação): engorda o som e segura picos"""
    m = np.abs(x).max() + 1e-9
    return np.tanh(drive * x / m) / math.tanh(drive) * m


def shelf(x, f, db, kind="low"):
    g = 10 ** (db / 20) - 1
    return x + g * filt(x, "lowpass" if kind == "low" else "highpass", f)


_IR = {}


def ir_space(kind):
    """resposta de sala: reflexões iniciais discretas + cauda difusa com graves decaindo mais devagar"""
    if kind in _IR:
        return _IR[kind]
    cfg = {"stone": (.55, 14, .035, 5200), "small": (.22, 9, .018, 6500), "out": (.12, 5, .012, 4000)}[kind]
    rt, taps, span, damp = cfg
    n = int(rt * SR)
    ir = np.zeros(n)
    ir[0] = 1.0
    for k in range(taps):
        t = rng.uniform(.002, span)
        ir[int(t * SR)] += rng.uniform(.25, .6) * (1 - t / span * .6) * rng.choice([-1, 1])
    t = np.arange(n) / SR
    lo = filt(rng.standard_normal(n), "lowpass", 700) * np.exp(-t / (rt / 5.5))
    hi = filt(rng.standard_normal(n), "highpass", 700) * np.exp(-t / (rt / 9))
    tail = filt(lo * 1.4 + hi, "lowpass", damp) * np.clip((t - span * .6) / .01, 0, 1)
    ir += tail * .35
    _IR[kind] = ir / np.abs(ir).sum() ** .5
    return _IR[kind]


def space(x, kind="small", wet=.16):
    ir = ir_space(kind)
    y = fftconvolve(x, ir)
    y = y / (np.abs(y).max() + 1e-9) * (np.abs(x).max() + 1e-9)
    return mix(x * (1 - wet * .3), y * wet)


def tick(f=3000, d=.002, bw=1.6):
    return filt(noise(d + .004) * env_ad(d + .004, .0001, d / 3), "bandpass", [f / bw, min(f * bw, SR / 2 - 200)])


def plate_modes(f0, n, d, spread=(1, 9), dec0=.25, amp_tilt=.8):
    """placa de metal: modos inarmônicos aleatórios, agudos somem mais rápido"""
    fs = np.sort(f0 * np.exp(rng.uniform(math.log(spread[0]), math.log(spread[1]), n)))
    fs[0] = f0
    decs = dec0 * (f0 / fs) ** .7
    amps = (f0 / fs) ** amp_tilt * rng.uniform(.5, 1, n)
    return modal(fs, decs, amps, d, strike=.0008)


def wet_squish(d=.08, lo=250, hi=1100):
    """camada molhada de impacto em carne: micro-rajadas de ruído grave"""
    g = grains(d, 900, 150, lo, hi, glen=(.002, .006), amp=(.2, 1))
    return filt(g, "lowpass", hi * 1.5)


def glottal(f0, d, jitter=.03, shimmer=.15, sub=.35):
    """voz de criatura: pulsos glotais (Rosenberg) com tremor, sub-harmônico e aspiração"""
    n = int(d * SR)
    o = np.zeros(n)
    t = 0.0
    k = 0
    while t < d:
        f = f0 * (1 + rng.normal(0, jitter)) * (1 + .1 * math.sin(2 * math.pi * 4.5 * t))
        per = 1 / max(f, 20)
        L = int(per * SR)
        tp = np.arange(L) / L
        pulse = np.where(tp < .6, .5 * (1 - np.cos(np.pi * tp / .6)), np.cos(np.pi * (tp - .6) / .8))
        pulse = np.clip(pulse, 0, None) * (1 + rng.normal(0, shimmer)) * (1 + (sub if k % 2 else -sub))
        i = int(t * SR)
        o[i:i + L] += np.diff(np.concatenate([[0], pulse]))[:max(0, n - i)]
        t += per
        k += 1
    return o + .08 * filt(noise(d), "highpass", 1500)


def formant(x, fms, bws, gains=None):
    gains = gains or [1] * len(fms)
    return sum(g * filt(x, "bandpass", [f - b / 2, f + b / 2]) for f, b, g in zip(fms, bws, gains))


def swing(d, lo, pk, hi, whistle_q=11, air=1.0, wh=.8, peak=.5):
    """golpe de lâmina: assobio estreito da borda (Doppler) + rajada de ar larga + roupa no começo"""
    t = T(d)
    u = t / d
    fc = np.where(u < peak, lo * (pk / lo) ** (u / peak), pk * (hi / pk) ** ((u - peak) / (1 - peak)))
    trem = 1 + .35 * np.sin(2 * np.pi * J(22, 38) * t) * env_bell(d, peak, 1)
    whistle = svf_bp(noise(d), fc, whistle_q) * env_bell(d, peak, 3.2) * trem
    airx = svf_bp(noise(d), fc * .8, 1.1, 1) * env_bell(d, peak * .9, 2.2)
    cloth = filt(noise(.07) * env_ad(.07, .004, .02), "bandpass", [180, 900]) * .5
    return mix(wh * whistle / (np.abs(whistle).max() + 1e-9), air * airx / (np.abs(airx).max() + 1e-9) * .8, cloth)


def r_sword():
    d = J(.28, .36)
    return fin(space(swing(d, J(500, 650), J(1250, 1650), J(600, 800)), "small", .1))


def r_heavy_swing():
    d = J(.38, .48)
    return fin(space(swing(d, J(220, 280), J(560, 720), J(260, 330), whistle_q=8, air=1.3, wh=.6), "small", .1))


def r_dagger():
    d = J(.17, .22)
    return fin(swing(d, J(1000, 1300), J(2300, 2900), J(1300, 1600), whistle_q=13, air=.7, wh=.9, peak=.42))


def r_staff():
    d = J(.3, .38)
    return fin(swing(d, J(240, 300), J(620, 800), J(280, 360), whistle_q=5, air=1.4, wh=.4))


def r_dash():
    d = J(.24, .3)
    x = mix(swing(d, 200, J(700, 900), 260, whistle_q=3, air=1.4, wh=.25, peak=.35),
            .35 * grains(d, 400, 60, 1500, 5000, glen=(.001, .003), amp=(.05, .3)))   # areia/cascalho sob os pés
    return fin(x)


def r_miss():
    d = J(.22, .28)
    return fin(swing(d, J(450, 550), J(1000, 1300), J(500, 650), whistle_q=7, air=1.0, wh=.5), -5)


def r_hit():
    """golpe acertando: estalo, tapa, corpo grave saturado, camada molhada e às vezes osso"""
    d = .32
    body = thump(J(85, 110), J(45, 55), d, J(.05, .07))
    smack = filt(noise(.03) * env_ad(.03, .0003, .007), "bandpass", [J(700, 900), J(2400, 3200)])
    x = mix(1.1 * body, .9 * smack, .5 * tick(J(2500, 4000), .0015), .55 * at(wet_squish(.09), .004))
    if rng.random() < .45:
        x = mix(x, .35 * at(grains(.05, 900, 300, 1800, 4500, glen=(.0008, .002), amp=(.3, 1)), .008))
    return fin(space(sat(x, 2.6), "small", .12))


def r_player_hurt():
    d = .4
    x = mix(1.0 * thump(J(90, 110), 48, d, .065), .8 * filt(noise(.035) * env_ad(.035, .0003, .008), "bandpass", [600, 2200]),
            .45 * at(wet_squish(.08, 200, 900), .004),
            .5 * plate_modes(J(700, 900), 8, .25, (1, 6), .06),                                  # placa da armadura
            .35 * grains(.22, 500, 40, 3500, 9000, glen=(.0006, .0016), amp=(.1, .6)))          # malha chacoalhando
    return fin(space(sat(x, 2.4), "small", .12))


def r_shield():
    d = .7
    x = mix(1.0 * plate_modes(J(260, 340), 16, d, (1, 14), .32), .9 * thump(110, 55, .25, .05),
            .6 * tick(J(4000, 6000), .002), .4 * filt(noise(.05) * env_ad(.05, .0005, .012), "bandpass", [1500, 5000]))
    return fin(space(sat(x, 1.8), "stone", .14))


def r_hit_metal():
    d = .55
    x = mix(plate_modes(J(380, 480), 14, d, (1, 12), .2), .8 * thump(150, 70, .15, .03), .5 * tick(5000, .002))
    return fin(space(sat(x, 2.0), "stone", .14))


def drop_bounce(f0, n=4, gap0=.09, ratio=.62, partials=(1, 2.71, 5.2), dec=.025):
    """objeto duro caindo e quicando: intervalos e força diminuindo"""
    o = np.zeros(int(1.2 * SR))
    t, a = 0.0, 1.0
    for k in range(n):
        f = f0 * rng.uniform(.95, 1.05)
        h = modal([f * p for p in partials], [dec, dec * .6, dec * .4], [1, .45, .25], .12, strike=.0004)
        h = mix(h, .5 * tick(f * 2.5, .0012))
        i = int(t * SR)
        o[i:i + len(h)] += a * h[:max(0, len(o) - i)]
        t += gap0 * ratio ** k * rng.uniform(.85, 1.15)
        a *= rng.uniform(.45, .7)
    return o


def r_bones():
    d = 1.1
    x = .9 * thump(75, 40, .3, .06)
    for _ in range(int(J(5, 8))):
        x = mix(x, at(drop_bounce(J(700, 1700), int(J(2, 5)), J(.06, .12)) * J(.3, .8), J(0, .25)))
    x = mix(x, .6 * at(drop_bounce(J(380, 520), 3, .14, partials=(1, 2.4, 4.4), dec=.04), .02))   # crânio
    return fin(space(pad(x, d), "stone", .14))


def r_death():
    """corpo caindo: baque do tronco, baque do braço/arma, terra e um suspiro"""
    d = 1.0
    fall = lambda: mix(thump(J(65, 80), 36, .4, J(.07, .1)), .6 * filt(noise(.08) * env_ad(.08, .002, .025), "lowpass", 900),
                       .3 * grains(.12, 500, 60, 600, 2500, amp=(.1, .5)))
    exhale = filt(noise(.5), "bandpass", [250, 900]) * env_bell(.5, .2, 1.5) * .25
    x = mix(sat(fall(), 2.2), .55 * at(sat(fall(), 2), J(.12, .2)), exhale,
            .3 * at(grains(.3, 120, 10, 1200, 4000, amp=(.1, .5)), .05))
    return fin(space(pad(x, d), "stone", .12))


def r_step():
    """passo: calcanhar + ponta do pé, com terra e folhas"""
    d = .26
    heel = mix(thump(J(80, 95), 50, .1, .018), .7 * filt(noise(.03) * env_ad(.03, .001, .008), "lowpass", 700))
    toe = mix(.5 * filt(noise(.06) * env_ad(.06, .002, .018), "bandpass", [400, 1800]),
              .5 * grains(.08, 700, 120, 1800, 6000, glen=(.0006, .002), amp=(.1, .6)))
    x = mix(sat(heel, 1.8), at(toe, J(.04, .07)))
    return fin(space(pad(x, d), "out", .08), -6)


def r_water_step():
    """pé entrando em água rasa: impacto, borrifo, bolhas, 'plunk' grave e gotas caindo de volta"""
    d = .55
    impact = filt(noise(.025) * env_ad(.025, .0005, .006), "highpass", 900)
    spray_env = env_ad(.2, .004, .05)
    spray = filt(noise(.2) * spray_env * (1 + .8 * filt(noise(.2), "lowpass", 60) * 8), "bandpass", [J(1800, 2600), 9000])
    x = mix(.7 * impact, .55 * spray, .6 * bubble(J(160, 260), d=.14, rise=J(2, 4)))
    for _ in range(int(J(10, 16))):
        x = mix(x, at(bubble(J(600, 3200), amp=J(.1, .45)), J(.005, .14), d))
    for _ in range(int(J(2, 5))):                                                        # gotas voltando
        x = mix(x, at(bubble(J(900, 2200), amp=J(.08, .2)), J(.18, .45), d))
    return fin(space(pad(x, d), "out", .08), -4)


def r_door_open():
    d = J(1.1, 1.4)
    latch = mix(plate_modes(J(1400, 1800), 6, .12, (1, 4), .03), .6 * thump(160, 100, .05, .01))
    hinge = creak(d * .7, J(35, 45), J(110, 150), wobble=.3, res=(380, 900, 1700, 3100), q=14)
    body = creak(d * .7, J(18, 25), J(40, 55), wobble=.2, res=(140, 320, 620), q=6) * .5
    air = filt(noise(d * .7), "lowpass", 400) * env_bell(d * .7, .6, 1.2) * .2
    x = mix(latch, at(mix(hinge, body, air), .1), .9 * at(sat(thump(85, 45, .3, .06), 2), d * .78))
    return fin(space(pad(x, d + .2), "stone", .16))


def r_heavy_smash():
    d = 1.3
    boom = sat(thump(J(60, 72), 28, d, .2), 3)
    crack = filt(noise(.03) * env_ad(.03, .0003, .006), "highpass", 1200)
    debris = mix(*[at(drop_bounce(J(500, 1600), int(J(2, 4)), J(.05, .1)) * J(.1, .35), J(.03, .3)) for _ in range(8)])
    dust = filt(noise(d) * env_ad(d, .02, .35), "bandpass", [200, 1500]) * .3
    x = mix(boom, .7 * crack, .5 * filt(noise(.3) * env_ad(.3, .002, .07), "lowpass", 1100), pad(debris, d), dust)
    return fin(space(x, "stone", .2))


def r_coins():
    d = .7
    x = np.zeros(int(d * SR))
    t = 0.0
    for k in range(int(J(6, 10))):
        f = J(3800, 6200)
        c = modal([f * r for r in (1, 1.59, 2.14, 2.65, 3.25)], [J(.12, .22), .1, .07, .05, .04], [1, .55, .4, .3, .2], .4, strike=.0003)
        x = mix(x, at(c * J(.25, 1), t, d))
        t += rng.exponential(.03) + (.04 if k % 3 == 2 else 0)
        if t > .45:
            break
    x = mix(x, .4 * filt(noise(.05) * env_ad(.05, .002, .015), "lowpass", 800))      # bolsa de couro
    return fin(space(x, "small", .1))


def r_growl(f0=None, d=None, formants=(420, 950, 2300), rough=.35):
    d = d or J(.5, .7)
    f0 = f0 or J(70, 90)
    v = glottal(f0, d, jitter=.04 + rough * .05, shimmer=.2 + rough * .2, sub=.25 + rough * .3)
    x = formant(v, formants, [f * .35 for f in formants], [1, .7, .4])
    x = sat(x * env_bell(d, .25, 1.3), 2.5 + rough * 3)
    return x


def r_roar():
    d = J(1.2, 1.5)
    x = mix(r_growl(J(48, 58), d, formants=(320, 760, 1900), rough=.8), .5 * filt(brown(d), "lowpass", 160) * env_bell(d, .3, 1))
    return fin(space(x, "stone", .2))


def r_fire():
    d = J(.75, .95)
    t = T(d)
    roar = svf_lp(noise(d) * (1 + .6 * np.sin(2 * np.pi * J(9, 14) * t)), 250 + 1500 * env_bell(d, .25, 1.5), .9)
    crackle = grains(d, 50, 220, 1500, 7000, glen=(.0004, .0015), amp=(.1, 1))
    x = mix(sat(roar * env_bell(d, .2, 1.3), 2.2), .45 * crackle, .5 * swing(d, 180, 700, 220, whistle_q=2, air=1.3, wh=.1, peak=.3))
    return fin(space(x, "small", .1))


def r_explosion():
    d = 1.6
    x = mix(sat(thump(60, 24, d, .32), 3.2), filt(noise(d) * env_ad(d, .002, .25), "lowpass", 1600),
            .6 * filt(brown(d) * env_ad(d, .01, .5), "lowpass", 160),
            pad(mix(*[at(drop_bounce(J(500, 1800), int(J(2, 4)), J(.05, .1)) * J(.1, .3), J(.05, .5)) for _ in range(10)]), d))
    return fin(space(x, "stone", .2))

RECIPES = {
    # armas e ataques
    "sword-swing": (r_sword, 4, .6), "weapon-sword": (r_sword, 4, .6), "attack": (r_sword, 3, .55), "attack-miss": (r_miss, 3, .45),
    "weapon-axe": (r_heavy_swing, 3, .65), "weapon-dagger": (r_dagger, 4, .55), "weapon-staff": (r_staff, 3, .55),
    "weapon-bow": (r_bow, 3, .6), "dash": (r_dash, 3, .5), "warrior-heavy-strike": (r_heavy_smash, 2, .7),
    "warrior-whirlwind": (r_whirlwind, 2, .6), "rogue-backstab": (r_dagger, 3, .6), "rogue-smoke": (r_smoke, 2, .55),
    "rogue-shadow-step": (r_shadow_step, 3, .55), "archer-multishot": (r_bow, 3, .6), "archer-explosive-arrow": (r_explosion, 2, .65),
    "mage-fireball": (r_fire, 3, .65), "mage-meteor": (r_explosion, 2, .75), "mage-arcane-blast": (r_arcane, 3, .55), "ice-bolt": (r_ice, 3, .6),
    # impactos
    "hit": (r_hit, 4, .7), "shield-block": (r_shield, 3, .65), "shield-block-heavy": (r_hit_metal, 3, .7), "player-hurt": (r_player_hurt, 3, .7),
    "heavy-smash": (r_heavy_smash, 3, .75), "enemy-death": (r_death, 3, .6), "skeleton-attack": (r_skel_attack, 3, .55),
    "orc-attack": (r_orc_attack, 3, .6), "ranged-enemy-attack": (r_bow, 3, .5), "beast-alert": (r_beast_alert, 3, .5),
    "lava-damage": (r_lava, 3, .5), "ancient-dragon-roar": (r_roar, 2, .8), "dragon-alert": (r_roar, 2, .7),
    "ancient-dragon-meteor": (r_explosion, 2, .8), "dragon-fire-breath": (r_fire, 2, .7), "ancient-dragon-fire": (r_fire, 2, .7),
    # mundo
    "door-open": (r_door_open, 3, .6), "door-locked": (r_door_locked, 3, .55), "chest-open": (r_chest, 3, .6),
    "item-pickup": (r_pickup, 3, .5), "gold": (r_coins, 4, .5), "potion-use": (r_potion, 2, .55), "secret-reveal": (r_secret, 2, .65),
    "shrine-use": (r_shrine, 2, .55), "lever": (r_lever, 2, .6), "step": (r_step, 4, .45), "water-step": (r_water_step, 5, .5),
    "bones": (r_bones, 3, .55), "wood-attack": (r_wood_attack, 3, .6), "arrow-hit": (r_arrow_hit, 3, .55), "heal": (r_heal, 2, .5),
}


# outros nomes de eventos do jogo que usam os mesmos sons
ALIAS = {"boss-hit": "hit", "boss-attack": "heavy-smash", "ancient-dragon-bite": "heavy-smash", "ancient-dragon-claw": "warrior-heavy-strike",
         "ancient-dragon-tail": "heavy-smash", "dragon-bite": "heavy-smash", "dragon-knight-attack": "weapon-axe", "frost-demon-attack": "orc-attack",
         "elemental-attack": "mage-arcane-blast", "frost-warden-nova": "ice-bolt", "rogue-fan": "weapon-dagger", "equip": "item-pickup",
         "dragon-priest-cast": "mage-arcane-blast", "sfx-heavy-smash": "heavy-smash"}


def main():
    os.makedirs(OUT, exist_ok=True)
    clips, meta, pos = [], {}, 0.0
    gap = np.zeros(int(.12 * SR))
    lead = np.zeros(int(.15 * SR))   # silêncio inicial (atraso do codificador mp3)
    clips.append(lead)
    pos = len(lead) / SR
    only = None
    for key, (fn, nv, gain) in RECIPES.items():
        vs = []
        for _ in range(nv):
            x = fn().astype(np.float32)
            vs.append([round(pos, 4), round(len(x) / SR, 4)])
            clips += [x, gap]
            pos += (len(x) + len(gap)) / SR
        meta[key] = {"v": vs, "g": gain}
        print(f"{key:24s} {nv} var  {np.mean([v[1] for v in vs]):.2f}s")
    audio = np.concatenate(clips) * .95
    with tempfile.TemporaryDirectory() as td:
        wav = os.path.join(td, "bank.wav")
        import wave
        w = wave.open(wav, "wb")
        w.setnchannels(1), w.setsampwidth(2), w.setframerate(SR)
        w.writeframes((np.clip(audio, -1, 1) * 32767).astype(np.int16).tobytes())
        w.close()
        mp3 = os.path.join(OUT, "sfx-bank.mp3")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-c:a", "libmp3lame", "-b:a", "96k", "-ar", str(SR), mp3], check=True)
        if "--preview" in sys.argv:
            # prévia: cada som em sequência com 0,5 s de pausa
            pv = []
            for key, m in meta.items():
                for a, l in m["v"][:2]:
                    i = int(a * SR)
                    pv += [audio[i:i + int(l * SR)] * m["g"] / .7, np.zeros(int(.45 * SR))]
            w = wave.open(wav, "wb")
            w.setnchannels(1), w.setsampwidth(2), w.setframerate(SR)
            w.writeframes((np.clip(np.concatenate(pv), -1, 1) * 32767).astype(np.int16).tobytes())
            w.close()
            subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-c:a", "libmp3lame", "-b:a", "128k", sys.argv[sys.argv.index("--preview") + 1]], check=True)
    json.dump({"sr": SR, "sounds": meta, "alias": ALIAS}, open(os.path.join(OUT, "sfx-bank.json"), "w"), separators=(",", ":"))
    mir = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "sfx")
    os.makedirs(mir, exist_ok=True)
    for f in ("sfx-bank.mp3", "sfx-bank.json"):
        with open(os.path.join(OUT, f), "rb") as a, open(os.path.join(mir, f), "wb") as b:
            b.write(a.read())
    print("banco:", round(pos, 1), "s", os.path.getsize(os.path.join(OUT, "sfx-bank.mp3")) // 1024, "KB")


if __name__ == "__main__":
    main()
