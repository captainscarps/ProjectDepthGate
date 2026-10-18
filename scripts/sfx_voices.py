"""
Vozes do Depthgate por síntese de formantes (estilo Klatt), sem gravações:
  fonte glotal (pulsos com tremor, aspereza, respiração e voz rouca) → filtros de formantes que mudam no tempo
  (vogais a e i o u ə, consoantes h s ʃ f x p t k b d g m n l r) → saturação e espaço.
Cada "falante" tem tom, tamanho de trato vocal, soprosidade e aspereza próprios.
Gera: fala inventada para os diálogos, esforço/dor/morte dos heróis, e alertas, dor, morte, risadas
e rugidos de inimigos e chefes. Importado por build_sfx_bank.py.
"""
import math

import numpy as np
from scipy.signal import lfilter

import build_sfx_bank as B

SR = B.SR
rng = B.rng
J = B.J

# formantes masculinos (F1..F4) e larguras de banda
VOW = {
    "a": ((730, 1090, 2440, 3400), (90, 110, 160, 250)),
    "e": ((530, 1840, 2480, 3500), (70, 100, 150, 250)),
    "i": ((290, 2250, 3000, 3700), (60, 90, 150, 250)),
    "o": ((570, 840, 2410, 3400), (80, 90, 150, 250)),
    "u": ((320, 870, 2240, 3300), (60, 90, 150, 250)),
    "ə": ((520, 1450, 2500, 3500), (80, 110, 160, 250)),
    "m": ((260, 1100, 2300, 3300), (60, 200, 250, 300)),
    "n": ((260, 1600, 2500, 3400), (60, 200, 250, 300)),
    "l": ((380, 1000, 2600, 3400), (70, 120, 180, 250)),
    "r": ((420, 1250, 1650, 3200), (70, 120, 160, 250)),
}
FRIC = {"s": (4200, 9500, .5), "ʃ": (2200, 6500, .55), "f": (1400, 9000, .18), "x": (1100, 3600, .45), "h": (0, 0, .3)}
PLOS = {"p": (500, 1600, 0), "t": (3000, 7000, 0), "k": (1500, 3500, 0), "b": (400, 1400, 1), "d": (2500, 6000, 1), "g": (1300, 3000, 1)}

SPEAKERS = {
    # f0, escala de formantes, soprosidade, tremor, aspereza (growl), inclinação espectral (Hz do passa-baixa da fonte)
    "male": dict(f0=118, fs=1.0, br=.06, jit=.012, gr=.0, tilt=3500),
    "female": dict(f0=212, fs=1.16, br=.12, jit=.01, gr=.0, tilt=5000),
    "old": dict(f0=98, fs=.97, br=.18, jit=.03, gr=.08, tilt=2800, trem=5.5),
    "kid": dict(f0=285, fs=1.3, br=.1, jit=.012, gr=0, tilt=6000),
    "guardia": dict(f0=200, fs=1.14, br=.32, jit=.008, gr=0, tilt=4200, chorus=1),
    "rei": dict(f0=92, fs=.95, br=.12, jit=.02, gr=.05, tilt=3000, trem=4.5),
    "demon": dict(f0=62, fs=.8, br=.18, jit=.05, gr=.55, tilt=2400, sub=.7, dist=4),
    "demonf": dict(f0=118, fs=.98, br=.3, jit=.04, gr=.35, tilt=3200, sub=.55, dist=3, chorus=1),
    "warrior": dict(f0=108, fs=.97, br=.08, jit=.015, gr=.12, tilt=3200),
    "berserker": dict(f0=104, fs=.96, br=.1, jit=.02, gr=.25, tilt=3000),
    "archer": dict(f0=128, fs=1.02, br=.08, jit=.012, gr=.05, tilt=3600),
    "hunter": dict(f0=112, fs=.98, br=.1, jit=.015, gr=.15, tilt=3200),
    "druid": dict(f0=110, fs=.99, br=.14, jit=.015, gr=.08, tilt=3000),
    "necro": dict(f0=96, fs=.95, br=.22, jit=.025, gr=.2, tilt=2600),
    "mage": dict(f0=218, fs=1.17, br=.12, jit=.01, gr=0, tilt=5200),
    "rogue": dict(f0=228, fs=1.18, br=.16, jit=.012, gr=.02, tilt=5000),
    "shaman": dict(f0=205, fs=1.15, br=.14, jit=.012, gr=.04, tilt=4600),
    "goblin": dict(f0=330, fs=1.38, br=.12, jit=.05, gr=.3, tilt=4500, nasal=1),
    "orc": dict(f0=78, fs=.82, br=.12, jit=.05, gr=.5, tilt=2400, dist=3),
    "troll": dict(f0=62, fs=.74, br=.14, jit=.06, gr=.6, tilt=2000, sub=.4, dist=3),
    "ghost": dict(f0=240, fs=1.1, br=.55, jit=.006, gr=0, tilt=2600, trem=5, vib=.06, chorus=1),
    "beast": dict(f0=95, fs=.75, br=.35, jit=.07, gr=.7, tilt=2600, dist=3),
    "dragon": dict(f0=48, fs=.55, br=.4, jit=.07, gr=.8, tilt=1800, sub=.6, dist=4),
}


def lp1(x, fc):
    a = math.exp(-2 * math.pi * fc / SR)
    return lfilter([1 - a], [1, -a], x)


def glottal(f0, sp, d):
    """fonte: pulsos glotais derivados (LF simplificado) + aspiração modulada pela abertura"""
    n = len(f0)
    jit = 1 + sp.get("jit", .01) * lp1(rng.standard_normal(n), 30) * 9
    vib = sp.get("vib", 0)
    if vib:
        jit = jit * (1 + vib * np.sin(2 * np.pi * J(4.5, 6) * np.arange(n) / SR))
    trem = sp.get("trem", 0)
    if trem:
        jit = jit * (1 + .025 * np.sin(2 * np.pi * trem * np.arange(n) / SR))
    f = f0 * jit
    ph = np.cumsum(f) / SR
    p = ph % 1
    tp, tn = .42, .18
    g = np.where(p < tp, .5 * (1 - np.cos(np.pi * p / tp)), np.where(p < tp + tn, np.cos(np.pi * (p - tp) / (2 * tn)), 0))
    shim = 1 + .25 * lp1(rng.standard_normal(n), 60) * 6
    gr = sp.get("gr", 0)
    if gr:
        # aspereza: períodos alternados fortes/fracos (sub-harmônico) + ruído no fechamento
        k = np.floor(ph).astype(int)
        g = g * (1 + gr * .6 * np.where(k % 2 == 0, 1, -1)) * (1 + gr * lp1(rng.standard_normal(n), 200) * 4)
    src = np.diff(np.concatenate([[0], g * shim]))
    src = lp1(src, sp.get("tilt", 3500))
    asp = rng.standard_normal(n) * (.15 + g) * sp.get("br", .1) * .08
    sub = sp.get("sub", 0)
    if sub:
        ph2 = np.cumsum(f * .5) / SR % 1
        g2 = np.where(ph2 < tp, .5 * (1 - np.cos(np.pi * ph2 / tp)), np.where(ph2 < tp + tn, np.cos(np.pi * (ph2 - tp) / (2 * tn)), 0))
        src = src + sub * lp1(np.diff(np.concatenate([[0], g2])), 900)
    return src, asp


def resonate(x, F, BW, block=64):
    """cascata de ressonadores de Klatt com frequências variando no tempo (F: [k][n])"""
    y = x.copy()
    n = len(x)
    for k in range(F.shape[0]):
        out = np.zeros(n)
        zi = np.zeros(2)
        for s in range(0, n, block):
            e = min(n, s + block)
            f, bw = F[k, s], BW[k, s]
            if f >= SR / 2 - 300:
                out[s:e] = y[s:e]
                continue
            r = math.exp(-math.pi * bw / SR)
            c2 = -r * r
            c1 = 2 * r * math.cos(2 * math.pi * f / SR)
            a0 = 1 - c1 - c2
            out[s:e], zi = lfilter([a0], [1, -c1, -c2], y[s:e], zi=zi)
        y = out
    return y


def say(phones, sp, f0c=None, gain=1.0):
    """phones: lista de (fonema, duração). f0c: função u∈[0,1] → multiplicador do tom"""
    sp = dict(sp)
    total = sum(d for _, d in phones)
    n = int(total * SR)
    t = np.arange(n) / SR
    u = t / total
    f0 = sp["f0"] * (np.ones_like(u) * f0c(u) if f0c else (1.08 - .16 * u))
    F = np.zeros((4, n))
    BW = np.zeros((4, n))
    av = np.zeros(n)
    fric = np.zeros(n)
    events = []
    pos = 0
    last_v = "ə"
    for i, (ph, d) in enumerate(phones):
        a, b = int(pos * SR), int((pos + d) * SR)
        nxt = next((p for p, _ in phones[i + 1:] if p in VOW and p not in "mnlr"), last_v)
        tgt = ph if ph in VOW else nxt if ph in ("h", "p", "t", "k", "b", "d", "g") else last_v
        fm, bw = VOW.get(tgt, VOW["ə"])
        for k in range(4):
            F[k, a:b] = fm[k] * sp["fs"] * (1.08 if sp.get("nasal") and k == 1 else 1)
            BW[k, a:b] = bw[k] * (1.3 if sp.get("nasal") else 1)
        if ph in VOW:
            av[a:b] = .55 if ph in "mn" else .8 if ph in "lr" else 1.0
            if ph not in "mnlr":
                last_v = ph
        elif ph in FRIC:
            lo, hi, amp = FRIC[ph]
            fric[a:b] = amp
            if ph == "h":
                fric[a:b] = -amp      # aspiração passa pelos formantes
        elif ph in PLOS:
            lo, hi, voiced = PLOS[ph]
            av[a:b] = .18 if voiced else 0
            events.append((pos + d * .8, lo, hi, .5 if voiced else 1.0))
        pos += d
    # transições suaves entre fonemas (coarticulação)
    ker = np.hanning(int(.025 * SR))
    ker /= ker.sum()
    for k in range(4):
        F[k] = np.convolve(np.pad(F[k], (len(ker), len(ker)), "edge"), ker, "same")[len(ker):-len(ker)]
        BW[k] = np.convolve(np.pad(BW[k], (len(ker), len(ker)), "edge"), ker, "same")[len(ker):-len(ker)]
    av = np.convolve(av, np.hanning(int(.012 * SR)) / (np.hanning(int(.012 * SR)).sum()), "same")
    src, asp = glottal(f0, sp, total)
    exc = src * av + asp * np.clip(av, .2, 1)
    if sp.get("whisper"):
        exc = rng.standard_normal(n) * (av + np.clip(-fric, 0, None)) * .06
    hfr = np.clip(-fric, 0, None)
    exc = exc + rng.standard_normal(n) * hfr * .05
    y = resonate(exc, F, BW)
    # fricativas (não passam pelos formantes)
    nz = rng.standard_normal(n)
    for ph, (lo, hi, amp) in FRIC.items():
        if ph == "h":
            continue
    fr = np.clip(fric, 0, None)
    if fr.any():
        y = y + B.filt(nz, "bandpass", [2600, 8500]) * fr * .25
    for t0, lo, hi, amp in events:
        burst = B.filt(rng.standard_normal(int(.012 * SR)) * np.exp(-np.arange(int(.012 * SR)) / (.003 * SR)), "bandpass", [lo, hi]) * amp * .6
        i0 = int(t0 * SR)
        y[i0:i0 + len(burst)] += burst[:max(0, n - i0)]
    env = np.minimum(1, np.minimum(t / .008, (total - t) / .02))
    y = y * np.clip(env, 0, 1) * gain
    if sp.get("chorus"):
        y2 = np.roll(y, int(.013 * SR)) * .6
        y = y + y2
    if sp.get("dist"):
        y = B.sat(y, sp["dist"])
    return y


def fric_shape(ph):
    lo, hi, _ = FRIC[ph]
    return lo, hi


def _fr(phones, sp):
    """fricativas com o filtro correto de cada uma"""
    return say(phones, sp)


# ─────────────────────────── fala inventada (diálogos) ───────────────────────────
CONS = ["b", "d", "g", "k", "t", "p", "m", "n", "l", "r", "s", "ʃ", "h", "f", "", ""]
VOWS = ["a", "e", "i", "o", "u", "a", "e", "o", "ə"]


def syllable(sp, mood=0.0):
    c = rng.choice(CONS)
    v = rng.choice(VOWS)
    ph = []
    if c:
        ph.append((c, J(.035, .06) if c in FRIC or c in PLOS else J(.04, .06)))
    ph.append((v, J(.07, .13)))
    if rng.random() < .25:
        ph.append((rng.choice(["n", "m", "l", "r", "s"]), J(.04, .06)))
    a0, a1 = J(.92, 1.12), J(.85, 1.08)
    if rng.random() < .25:
        a0, a1 = a1 * .95, a0 * 1.1      # pergunta: tom sobe
    return say(ph, sp, lambda u: a0 + (a1 - a0) * u)


def talk_clip(speaker):
    sp = SPEAKERS[speaker]
    x = syllable(sp)
    kind = "stone" if speaker in ("guardia", "demon", "demonf", "rei") else "small"
    wet = .2 if speaker in ("guardia", "demonf") else .14 if speaker in ("demon",) else .05
    return B.fin(B.space(x, kind, wet), -4)


# ─────────────────────────── heróis ───────────────────────────
def effort(cls):
    sp = SPEAKERS[cls]
    v = rng.choice(["a", "ə", "a", "e"]) if cls not in ("mage", "rogue", "shaman") else rng.choice(["a", "e", "ə"])
    pre = [("h", J(.02, .04))] if rng.random() < .7 else [("x", .025)] if rng.random() < .3 else []
    post = [("h", J(.03, .06))] if rng.random() < .5 else []
    d = J(.11, .19)
    x = say(pre + [(v, d)] + post, dict(sp, gr=sp["gr"] + .15), lambda u: 1.25 - .45 * u ** .7)
    return B.fin(B.space(B.sat(x, 2.2), "small", .06), -3)


def hurt(sp_key):
    sp = SPEAKERS[sp_key]
    v = rng.choice(["ə", "a", "u"])
    d = J(.16, .26)
    x = say([("x" if rng.random() < .4 else "h", .03), (v, d), ("h", J(.05, .09))], dict(sp, gr=sp["gr"] + .3, br=sp["br"] + .1),
            lambda u: 1.35 + .1 * np.sin(np.pi * u) - .5 * u)
    return B.fin(B.space(B.sat(x, 2.6), "small", .07), -2)


def death(sp_key):
    sp = SPEAKERS[sp_key]
    d = J(.55, .75)
    x = say([("h", .04), ("a", d * .6), ("ə", d * .4), ("h", .18)], dict(sp, gr=sp["gr"] + .35, br=sp["br"] + .15),
            lambda u: 1.4 - .75 * u ** .8)
    return B.fin(B.space(B.sat(x, 2.2), "stone", .14), -2)


# ─────────────────────────── inimigos e chefes ───────────────────────────
def laugh(sp_key, n=None, step=None, start="h", vowel="a", drop=.35, pre=None, wet=.2):
    sp = SPEAKERS[sp_key]
    n = n or int(J(4, 6))
    step = step or J(.15, .2)
    parts = []
    t = 0.0
    out = np.zeros(int((n * step + 1.0) * SR))
    if pre:
        x = say(pre, sp, lambda u: 1.1 - .1 * u)
        out[:len(x)] += x
        t += sum(d for _, d in pre) + .05
    for k in range(n):
        last = k == n - 1
        dv = step * (.55 if not last else 1.6)
        lvl = 1 - drop * k / max(1, n - 1)
        x = say([(start, step * .3), (vowel, dv)], dict(sp, br=sp["br"] + .1), lambda u, l=lvl: l * (1.12 - .15 * u) * (1 - (.25 * u if last else 0)))
        i = int(t * SR)
        out[i:i + len(x)] += x[:max(0, len(out) - i)] * (1 - .25 * k / n)
        t += step * .3 + dv + (step * .15 if not last else 0)
    out = out[:int((t + .1) * SR)]
    return B.fin(B.space(out, "stone", wet), -2)


def growl(sp_key, d=None, vowel="ə", shape=None, wet=.12, sat=2.5):
    sp = SPEAKERS[sp_key]
    d = d or J(.45, .7)
    shape = shape or (lambda u: .9 + .3 * np.sin(np.pi * u) - .2 * u)
    x = say([("x", .05), (vowel, d), ("h", .1)], sp, shape)
    return B.fin(B.space(B.sat(x, sat), "stone", wet), -2)


def skeleton(kind):
    """sem pulmões: riso sussurrado (só ar) + dentes batendo"""
    sp = dict(SPEAKERS["male"], whisper=1)
    chatter = B.grains(J(.3, .5), J(60, 90), 20, 1500, 3500, glen=(.002, .004), amp=(.4, 1))
    if kind == "alert":
        out = np.zeros(int(.8 * SR))
        t = 0.0
        for k in range(int(J(3, 5))):
            x = say([("x", .04), ("a", .07)], sp)
            x = B.filt(x, "highpass", 900)
            i = int(t * SR)
            out[i:i + len(x)] += x[:max(0, len(out) - i)]
            t += J(.11, .15)
        out = B.mix(out * .9, .7 * chatter)
        return B.fin(B.space(out[:int((t + .15) * SR)], "stone", .15), -3)
    if kind == "hurt":
        return B.fin(B.mix(.6 * B.grains(.15, 300, 50, 1200, 3500, amp=(.3, 1)), B.filt(say([("x", .04), ("ə", .08), ("h", .06)], sp), "highpass", 800)), -4)
    x = B.mix(B.filt(say([("h", .05), ("a", .3), ("h", .25)], sp, lambda u: 1 - .3 * u), "highpass", 700) * .8, chatter * .5)
    return B.fin(B.space(x, "stone", .15), -3)


def ghost(kind):
    sp = SPEAKERS["ghost"]
    if kind == "alert":
        d = J(.9, 1.2)
        x = say([("u", d * .5), ("o", d * .5)], sp, lambda u: .85 + .35 * np.sin(np.pi * u))
    elif kind == "hurt":
        x = say([("i", J(.25, .35))], dict(sp, f0=520), lambda u: 1.2 - .3 * u)
    else:
        d = J(1.2, 1.5)
        x = say([("o", d * .4), ("u", d * .6)], sp, lambda u: 1.3 - .7 * u)
    return B.fin(B.space(x, "stone", .35), -3)


def beast(kind):
    if kind == "hurt":
        sp = dict(SPEAKERS["beast"], f0=620, fs=.9, gr=.2, br=.2)
        return B.fin(B.sat(say([("i", J(.12, .18))], sp, lambda u: 1.1 - .4 * u), 2), -3)
    if kind == "death":
        sp = dict(SPEAKERS["beast"], f0=480, fs=.9, gr=.3)
        return B.fin(B.space(say([("i", .25), ("u", .35)], sp, lambda u: 1.1 - .6 * u), "small", .1), -3)
    return growl("beast", J(.5, .8), "a", lambda u: .95 + .1 * np.sin(2 * np.pi * 3 * u))


def mimic(kind):
    chomp = B.mix(B.creak(.18, 30, 60, res=(300, 700, 1400), q=7), B.thump(110, 60, .15, .03))
    g = growl("orc", J(.3, .45), "u", wet=.08)
    x = B.mix(chomp, .7 * B.at(g, .08)) if kind == "hurt" else B.mix(B.at(chomp, .0), .9 * B.at(growl("troll", .8, "o", wet=.1), .05))
    return B.fin(x, -3)


def voice_recipes():
    R = {}
    for v in ("male", "female", "old", "kid", "guardia", "rei", "demon", "demonf"):
        R[f"vo-talk-{v}"] = (lambda v=v: talk_clip(v), 8, .42 if v not in ("demon", "demonf") else .55)
    for c in ("warrior", "berserker", "archer", "hunter", "druid", "necro", "mage", "rogue", "shaman"):
        R[f"hero-grunt-{c}"] = (lambda c=c: effort(c), 5, .5)
    R["hero-hurt-male"] = (lambda: hurt(rng.choice(["warrior", "hunter", "archer", "berserker"])), 5, .6)
    R["hero-hurt-female"] = (lambda: hurt(rng.choice(["mage", "rogue", "shaman"])), 5, .6)
    R["hero-death-male"] = (lambda: death("warrior"), 2, .7)
    R["hero-death-female"] = (lambda: death("mage"), 2, .7)
    R["skeleton-alert"] = (lambda: skeleton("alert"), 3, .55)
    R["skeleton-hurt"] = (lambda: skeleton("hurt"), 3, .5)
    R["skeleton-death"] = (lambda: B.fin(B.mix(B.r_bones(), .8 * skeleton("death"))), 3, .6)
    R["goblin-alert"] = (lambda: laugh("goblin", int(J(4, 6)), J(.09, .12), "h", "e", .2, wet=.08), 3, .5)
    R["goblin-attack"] = (lambda: B.fin(B.sat(say([("x", .03), ("a", J(.12, .18))], SPEAKERS["goblin"], lambda u: 1.2 - .3 * u), 2.5), -3), 3, .5)
    R["goblin-hurt"] = (lambda: B.fin(say([("i", J(.12, .18))], dict(SPEAKERS["goblin"], f0=480), lambda u: 1.15 - .3 * u), -3), 3, .5)
    R["goblin-death"] = (lambda: B.fin(B.space(say([("i", .2), ("ə", .3)], dict(SPEAKERS["goblin"], f0=420), lambda u: 1.2 - .7 * u), "small", .1), -3), 2, .55)
    R["orc-alert"] = (lambda: growl("orc", J(.6, .8), "a", lambda u: .9 + .35 * np.sin(np.pi * u)), 3, .6)
    R["orc-hurt"] = (lambda: B.fin(B.sat(say([("x", .04), ("ə", J(.14, .2)), ("h", .05)], SPEAKERS["orc"], lambda u: 1.3 - .4 * u), 3), -3), 3, .55)
    R["orc-death"] = (lambda: growl("orc", J(.9, 1.1), "a", lambda u: 1.25 - .7 * u, wet=.16), 2, .65)
    R["troll-hurt"] = (lambda: B.fin(B.sat(say([("x", .05), ("o", J(.18, .25))], SPEAKERS["troll"], lambda u: 1.3 - .4 * u), 3), -3), 3, .6)
    R["troll-death"] = (lambda: growl("troll", J(1.1, 1.3), "o", lambda u: 1.3 - .8 * u, wet=.18), 2, .7)
    R["demon-alert"] = (lambda: laugh("demon", int(J(3, 5)), J(.2, .26), "h", "a", .4, wet=.25), 3, .65)
    R["demon-attack"] = (lambda: growl("demon", J(.35, .5), "a", lambda u: 1.2 - .4 * u, wet=.15, sat=3.5), 3, .6)
    R["demon-hurt"] = (lambda: growl("demon", J(.25, .35), "ə", lambda u: 1.4 - .4 * u, wet=.12, sat=3.5), 3, .6)
    R["demon-death"] = (lambda: B.fin(B.space(say([("x", .06), ("a", 1.0), ("ə", .4)], dict(SPEAKERS["demon"], f0=140), lambda u: 1.6 - 1.1 * u), "stone", .3), -2), 2, .75)
    R["ghost-alert"] = (lambda: ghost("alert"), 3, .5)
    R["ghost-hurt"] = (lambda: ghost("hurt"), 3, .5)
    R["ghost-death"] = (lambda: ghost("death"), 2, .55)
    R["beast-alert"] = (lambda: beast("alert"), 3, .55)
    R["beast-hurt"] = (lambda: beast("hurt"), 3, .5)
    R["beast-death"] = (lambda: beast("death"), 2, .55)
    R["mimic-hurt"] = (lambda: mimic("hurt"), 2, .6)
    R["mimic-death"] = (lambda: mimic("death"), 2, .65)
    R["dragon-death"] = (lambda: growl("dragon", J(2.0, 2.4), "a", lambda u: 1.2 - .7 * u, wet=.3, sat=3.5), 2, .85)
    R["boss-evil-laugh-deep"] = (lambda: laugh("demon", int(J(5, 7)), J(.22, .26), "h", "a", .45, pre=[("m", .12), ("u", .12)], wet=.35), 3, .8)
    R["boss-evil-laugh-wicked"] = (lambda: laugh("demonf", int(J(7, 9)), J(.12, .15), "h", rng.choice(["e", "i"]), .3, wet=.3), 3, .75)
    R["boss-intro"] = (lambda: growl("demon", J(1.4, 1.7), "a", lambda u: .7 + .6 * np.sin(np.pi * u ** .7), wet=.35, sat=3.5), 2, .8)
    R["boss-phase2"] = (lambda: B.fin(B.mix(growl("demon", 1.3, "a", lambda u: 1.0 + .5 * np.sin(np.pi * u), wet=.3, sat=4), .8 * B.at(laugh("demon", 4, .22, wet=.3), 1.1))), 2, .8)
    R["boss-death"] = (lambda: B.fin(B.space(say([("x", .08), ("a", 1.4), ("ə", .6), ("h", .3)], dict(SPEAKERS["demon"], f0=150), lambda u: 1.7 - 1.3 * u), "stone", .4), -1), 2, .85)
    return R
