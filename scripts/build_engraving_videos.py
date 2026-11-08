"""Vídeos no estilo gravura/serigrafia antiga, animados a partir das imagens-chave (scripts/build_engraving_keyframes.py).

A imagem fica parada como uma gravura impressa e ganha vida com efeitos feitos aqui: câmera lenta (aproximar, deslizar),
traço que "treme" como animação à mão, neblina passando, partículas, chamas das tochas oscilando, portal girando,
silhueta do dragão cruzando a lua, granulado de impressão. 1280x720, 24 qps, mp4 (H.264) e webm (VP9), sem som.

Uso: python3 scripts/build_engraving_videos.py [campanha_1 campanha_2 campanha_4 background_menu modo_infinito]
Fonte do título do Modo Infinito: TITLE_FONT (padrão /tmp/dg/font/.../alfa-slab-one-latin-400-normal.woff, npm @fontsource/alfa-slab-one).
"""
import math
import os
import subprocess
import sys

import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KF = os.path.join(ROOT, "art-src", "video-keyframes")
OUTS = [os.path.join(ROOT, "assets", "video"), os.path.join(ROOT, "Projeto atualizado", "assets", "video")]
W, H, FPS = 1280, 720, 24
CREAM = np.array([0.93, 0.88, 0.78], np.float32)
PEACH = np.array([0.98, 0.74, 0.55], np.float32)
FONT = os.environ.get("TITLE_FONT", "/tmp/dg/font/package/files/alfa-slab-one-latin-400-normal.woff")


# ── imagens ────────────────────────────────────────────────────────────────────────────────────────────────────────
def load(name, trim=True):
    a = cv2.cvtColor(cv2.imread(os.path.join(KF, name + ".png")), cv2.COLOR_BGR2RGB).astype(np.float32) / 255
    if trim:   # tira a moldura clara que o modelo às vezes desenha em volta
        g = a.mean(2)
        h, w = g.shape

        def edge(lines):
            n = 0
            for ln in lines:
                if ln.mean() > 0.82 and ln.std() < 0.08:
                    n += 1
                else:
                    break
            return n
        t = edge(g[i] for i in range(h // 5))
        b = edge(g[h - 1 - i] for i in range(h // 5))
        l = edge(g[:, i] for i in range(w // 5))
        r = edge(g[:, w - 1 - i] for i in range(w // 5))
        if t + b + l + r:
            m = 6
            a = a[t + m:h - b - m, l + m:w - r - m]
    # mesmo quadro 16:9
    h, w = a.shape[:2]
    if w / h > W / H:
        nw = int(h * W / H)
        a = a[:, (w - nw) // 2:(w - nw) // 2 + nw]
    else:
        nh = int(w * H / W)
        a = a[(h - nh) // 2:(h - nh) // 2 + nh]
    return cv2.resize(a, (int(W * 1.25), int(H * 1.25)), interpolation=cv2.INTER_AREA)


def cam(img, zoom=1.0, cx=0.5, cy=0.5, rot=0.0):
    """recorte de câmera: zoom 1 = quadro inteiro; cx/cy = centro (0..1)"""
    h, w = img.shape[:2]
    s = W / w * zoom
    M = cv2.getRotationMatrix2D((cx * w, cy * h), rot, s)
    M[0, 2] += W / 2 - cx * w
    M[1, 2] += H / 2 - cy * h
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def boil(a, f, amp=0.7):
    """traço que treme de leve, trocando de pose a cada 3 quadros (animação à mão)"""
    k = f // 3
    rng = np.random.default_rng(k)
    dx, dy = rng.uniform(-amp, amp, 2)
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    return cv2.warpAffine(a, M, (W, H), borderMode=cv2.BORDER_REFLECT)


_N = {}


def noise_field(seed, w, h, scale):
    key = (seed, w, h, scale)
    if key not in _N:
        rng = np.random.default_rng(seed)
        n = rng.random((h // scale + 3, w // scale + 3)).astype(np.float32)
        n = cv2.resize(n, (w + 3 * scale, h + 3 * scale), interpolation=cv2.INTER_CUBIC)[:h, :w]
        _N[key] = cv2.GaussianBlur(n, (0, 0), scale / 3)
    return _N[key]


def fog(a, f, y0=0.45, strength=0.32, speed=2.0, seed=3, color=CREAM, period=None):
    """neblina passando na parte de baixo (hachurada como o resto)"""
    field = noise_field(seed, W * 2, H, 110)
    off = (f * speed) % W if period is None else (f / period * W) % W
    o = int(off)
    n = field[:, o:o + W]
    n = np.clip((n - 0.35) * 2.2, 0, 1)
    hatch = (np.sin((np.arange(W)[None, :] + np.arange(H)[:, None]) * 0.9) > -0.2).astype(np.float32)
    n = n * (0.75 + 0.25 * hatch)
    grad = np.clip((np.linspace(0, 1, H) - y0) / (1 - y0), 0, 1)[:, None] * strength
    m = (n * grad)[..., None]
    return a * (1 - m) + color * m


def particles(a, f, n=60, seed=1, color=PEACH, vx=0.5, vy=-0.35, size=2, period=None, alpha=0.8):
    rng = np.random.default_rng(seed)
    P = rng.random((n, 4))
    for p in P:
        if period:   # volta ao mesmo lugar no fim do laço
            ph = (f / period + p[3]) % 1
            x = (p[0] * W + ph * vx * W) % W
            y = (p[1] * H + ph * vy * H) % H
        else:
            x = (p[0] * W + f * vx * (0.6 + p[2])) % W
            y = (p[1] * H + f * vy * (0.6 + p[2])) % H
        xi, yi = int(x), int(y)
        s = size if p[2] < 0.7 else size + 1
        tw = 0.6 + 0.4 * math.sin(f * 0.3 + p[3] * 6.28)
        if s < xi < W - s - 1 and s < yi < H - s - 1:
            sl = a[yi - s:yi + s + 1, xi - s:xi + s + 1]
            a[yi - s:yi + s + 1, xi - s:xi + s + 1] = sl * (1 - alpha * tw) + color * alpha * tw
    return a


def flame_mask(img):
    """onde estão as chamas: pixels quentes e claros"""
    r, g, b = img[..., 0], img[..., 1], img[..., 2]
    m = ((r > 0.78) & (r - b > 0.25) & (g > 0.45)).astype(np.float32)
    m = cv2.dilate(m, np.ones((9, 9), np.uint8))
    return cv2.GaussianBlur(m, (0, 0), 14)


def flicker(a, mask, f, amt=0.22, seed=7, period=None):
    t = f if period is None else (f % period) / period * 48
    v = (0.6 * math.sin(t * 0.9 + seed) + 0.4 * math.sin(t * 2.3 + seed * 2)) if period else \
        (0.55 * math.sin(f * 0.71 + seed) + 0.3 * math.sin(f * 1.93) + 0.15 * np.random.default_rng(f).uniform(-1, 1))
    k = 1 + amt * v
    glow = mask[..., None] * (k - 1)
    return np.clip(a + glow * PEACH, 0, 1)


def swirl(img, cx, cy, rx, ry, ang):
    """gira o miolo do portal: mais no centro, nada na borda"""
    h, w = img.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dx, dy = (xx - cx) / rx, (yy - cy) / ry
    r = np.sqrt(dx * dx + dy * dy)
    fall = np.clip(1 - r, 0, 1) ** 1.5
    th = ang * fall
    c, s = np.cos(th), np.sin(th)
    sx = cx + (dx * c - dy * s) * rx
    sy = cy + (dx * s + dy * c) * ry
    return cv2.remap(img, sx, sy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def grain(a, f, amt=0.045):
    rng = np.random.default_rng(1000 + f)
    g = (rng.random((H // 2, W // 2), dtype=np.float32) - 0.5)
    g = cv2.resize(g, (W, H), interpolation=cv2.INTER_NEAREST)[..., None]
    return a + g * amt


def vignette(a, s=0.35):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    return a * (1 - s * np.clip(d - 0.6, 0, 1)[..., None])


def ease(t):
    return t * t * (3 - 2 * t)


def fade(a, f, n, fin=12, fout=12):
    k = min(1, f / fin if fin else 1, (n - 1 - f) / fout if fout else 1)
    return a * max(0.0, k)


# ── cenas ─────────────────────────────────────────────────────────────────────────────────────────────────────────
def campanha_1(n):
    img = load("c1-floresta")
    fl = None
    for f in range(n):
        t = f / n
        a = cam(img, 1.0 + 0.12 * ease(t), 0.5 + 0.02 * t, 0.52 - 0.02 * t)
        a = boil(a, f)
        a = fog(a, f, 0.5, 0.3, 1.6)
        a = particles(a, f, 70, 1, PEACH, 0.45, -0.25)
        a *= 1 + 0.02 * math.sin(f / 8)
        yield fade(vignette(grain(a, f)), f, n, 14, 10)


def campanha_2(n):
    door, sky = load("c2-porta"), load("c2-ceu")
    dm = flame_mask(door)
    dr = cv2.cvtColor(cv2.imread(os.path.join(KF, "c2-dragao.png")), cv2.COLOR_BGR2RGB).astype(np.float32) / 255
    alpha = np.clip((0.75 - dr.mean(2)) / 0.35, 0, 1)        # fundo creme some, a silhueta fica
    ys, xs = np.where(alpha > 0.5)
    dr, alpha = dr[ys.min():ys.max(), xs.min():xs.max()], alpha[ys.min():ys.max(), xs.min():xs.max()]
    dark = np.clip(dr * 0.35, 0, 1)                            # silhueta quase preta, com um pouco do hachurado
    cut = int(n * 0.47)
    for f in range(n):
        t = f / n
        if f < cut:   # a porta sob as raízes, a câmera desce até ela
            u = f / cut
            a = cam(door, 1.05 + 0.18 * ease(u), 0.42, 0.42 + 0.08 * u)
            a = flicker(a, cam(dm, 1.05 + 0.18 * ease(u), 0.42, 0.42 + 0.08 * u), f, 0.35, 3)
            a = fog(a, f, 0.55, 0.25, 1.2, seed=5)
        else:         # o céu: a câmera sobe; o dragão cruza a lua
            u = (f - cut) / (n - cut)
            a = cam(sky, 1.12 - 0.08 * ease(u), 0.55, 0.62 - 0.14 * ease(u))
            sc = 0.42 + 0.05 * math.sin(u * 9)                 # bater de asas
            dw, dh = int(dr.shape[1] * sc), int(dr.shape[0] * sc * (0.92 + 0.08 * math.sin(u * 18)))
            d = cv2.resize(dark, (dw, dh)); al = cv2.resize(alpha, (dw, dh))[..., None]
            x = int(W * (1.05 - 1.45 * ease(min(1, u * 1.1)))); y = int(H * (0.12 + 0.06 * math.sin(u * 3)))
            x0, y0 = max(0, x), max(0, y)
            x1, y1 = min(W, x + dw), min(H, y + dh)
            if x1 > x0 and y1 > y0:
                sl = a[y0:y1, x0:x1]
                a[y0:y1, x0:x1] = sl * (1 - al[y0 - y:y1 - y, x0 - x:x1 - x]) + d[y0 - y:y1 - y, x0 - x:x1 - x] * al[y0 - y:y1 - y, x0 - x:x1 - x]
            if abs(u - 0.18) < 0.012 or abs(u - 0.22) < 0.008:   # relâmpago
                a = a * 0.6 + CREAM * 0.4
            a = fog(a, f, 0.0, 0.18, 1.0, seed=9, color=np.array([0.55, 0.68, 0.64], np.float32))
        a = boil(a, f)
        if abs(f - cut) < 6:   # corte com mergulho no escuro
            a *= abs(f - cut) / 6
        yield fade(vignette(grain(a, f)), f, n, 12, 10)


def campanha_3(n):
    """os heróis na ponte sob o céu rachado: câmera desliza ao longo da fila; as rachaduras pulsam"""
    img = load("c3-ponte")
    g = img.mean(2)
    h = img.shape[0]
    crack = ((g > 0.62).astype(np.float32) * (np.arange(h)[:, None] < h * 0.45))
    crack = cv2.GaussianBlur(cv2.dilate(crack, np.ones((5, 5), np.uint8)), (0, 0), 6)
    for f in range(n):
        t = ease(f / n)
        z, cx, cy = 1.16 - 0.08 * t, 0.40 + 0.20 * t, 0.50
        a = cam(img, z, cx, cy)
        cm = cam(crack, z, cx, cy)
        pulse = 0.5 + 0.5 * math.sin(f * 0.22) * math.sin(f * 0.07 + 1)
        a = np.clip(a + cm[..., None] * pulse * 0.22 * CREAM, 0, 1)
        a = fog(a, f, 0.6, 0.35, 1.4, seed=11, color=np.array([0.62, 0.74, 0.70], np.float32))
        a = particles(a, f, 40, 6, CREAM, -0.15, -0.45, 1, alpha=0.6)
        a = boil(a, f)
        yield fade(vignette(grain(a, f)), f, n, 12, 10)


def campanha_4(n):
    ent, cor = load("c4-entrada"), load("c4-corredor")
    cm = flame_mask(cor)
    cut = int(n * 0.5)
    for f in range(n):
        if f < cut:   # a luz ainda toca os primeiros degraus; a câmera mergulha na escada
            u = f / cut
            z = 1.0 + 0.9 * ease(u) ** 1.6
            a = cam(ent, z, 0.53, 0.62)
            a = particles(a, f, 50, 4, PEACH, 0.2, 0.15, 2)
            a *= 1 - 0.65 * max(0, u - 0.6) / 0.4                # escurece ao descer
        else:         # o corredor: tochas acendem e a câmera avança
            u = (f - cut) / (n - cut)
            z = 1.0 + 0.22 * ease(u)
            a = cam(cor, z, 0.5, 0.5)
            a = flicker(a, cam(cm, z, 0.5, 0.5), f, 0.3, 5)
            a *= min(1, 0.35 + u * 2.2)
            a = fog(a, f, 0.7, 0.18, 1.0, seed=8, color=np.array([0.45, 0.6, 0.58], np.float32))
        a = boil(a, f)
        yield fade(vignette(grain(a, f), 0.45), f, n, 12, 14)


def background_menu(n):
    """laço perfeito: tudo volta ao começo no último quadro"""
    img = load("menu-portal")
    fm = flame_mask(img)
    h, w = img.shape[:2]
    # o portal: miolo central (o modelo põe o arco no meio do quadro)
    cx, cy, rx, ry = w * 0.5, h * 0.565, w * 0.085, h * 0.25
    for f in range(n):
        a0 = swirl(img, cx, cy, rx, ry, -2 * math.pi * f / n)
        a = cam(a0, 1.04, 0.5, 0.5)
        a = flicker(a, cam(fm, 1.04, 0.5, 0.5), f, 0.3, 2, period=n)
        a = particles(a, f, 45, 2, CREAM, 0.15, -0.2, 1, period=n, alpha=0.55)
        a = fog(a, f, 0.72, 0.16, 0, seed=4, period=n)
        a = boil(a, f, 0.5)
        yield vignette(grain(a, f % 48))


def modo_infinito(n):
    from PIL import Image, ImageDraw, ImageFont
    img = load("inf-corredor")
    fm = flame_mask(img)
    seg = int(n * 0.3)   # zoom contínuo "sem fim": cada trecho termina igual ao começo do próximo
    tstart = int(n * 0.68)
    title = None
    if os.path.isfile(FONT):
        L = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(L)
        f1, f2 = ImageFont.truetype(FONT, 92), ImageFont.truetype(FONT, 34)
        for txt, ft, y in (("MODO INFINITO", f1, H * 0.40), ("SUPERE SEUS LIMITES", f2, H * 0.56)):
            bb = d.textbbox((0, 0), txt, font=ft); x = (W - bb[2]) / 2
            d.text((x + 4, y + 4), txt, font=ft, fill=(16, 14, 14, 255))
            d.text((x, y), txt, font=ft, fill=(246, 196, 150, 255) if ft is f1 else (236, 226, 204, 255))
        title = np.asarray(L).astype(np.float32) / 255
    for f in range(n):
        u = (f % seg) / seg
        z = 2 ** u   # dobra de tamanho e recomeça: a imagem do centro já é o próximo arco
        a = cam(img, z, 0.5, 0.5)
        b = cam(img, z / 2, 0.5, 0.5)
        k = ease(u)
        a = a * (1 - k * 0.0) if u < 0.75 else a * (1 - (u - 0.75) / 0.25) + b * ((u - 0.75) / 0.25)
        a = flicker(a, cam(fm, z, 0.5, 0.5), f, 0.3, 6)
        a = boil(a, f)
        if f >= tstart and title is not None:
            v = min(1, (f - tstart) / 14)
            a = a * (1 - 0.55 * v)
            al = title[..., 3:4] * v
            a = a * (1 - al) + title[..., :3] * al
        yield fade(vignette(grain(a, f), 0.5), f, n, 10, 16)


SCENES = {"campanha_1": campanha_1, "campanha_2": campanha_2, "campanha_3": campanha_3, "campanha_4": campanha_4,
          "background_menu": background_menu, "modo_infinito": modo_infinito}


def render(name, secs=10):
    n = secs * FPS
    tmp = f"/tmp/eng-{name}.mp4"
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
                          "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
                          "-movflags", "+faststart", tmp], stdin=subprocess.PIPE)
    for a in SCENES[name](n):
        p.stdin.write((np.clip(a, 0, 1) * 255).astype(np.uint8).tobytes())
    p.stdin.close()
    p.wait()
    webm = f"/tmp/eng-{name}.webm"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "34", "-row-mt", "1",
                    "-deadline", "good", "-cpu-used", "4", "-an", webm], check=True)
    for d in ([] if "--preview" in sys.argv else OUTS):
        if os.path.isdir(d):
            subprocess.run(["cp", tmp, os.path.join(d, name + ".mp4")], check=True)
            subprocess.run(["cp", webm, os.path.join(d, name + ".webm")], check=True)
    print(name, os.path.getsize(tmp) // 1024, "KB mp4,", os.path.getsize(webm) // 1024, "KB webm", flush=True)


if __name__ == "__main__":
    for nm in [a for a in sys.argv[1:] if not a.startswith("--")] or list(SCENES):
        render(nm)
