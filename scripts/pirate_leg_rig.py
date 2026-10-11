"""Rig de pernas do Capitão Scarpa: anda e corre com o mesmo ciclo dos outros heróis.

As folhas em pixel art não têm passos de verdade: nos 8 quadros de "walk" as pernas ficam
abertas na mesma pose, só o calcanhar mexe. Aqui as pernas do desenho são deformadas por um
esqueleto simples (quadril -> joelho -> tornozelo, com mistura suave nas juntas, como em
animação 2D por ossos), seguindo o ciclo dos outros heróis: perna à frente, passagem com os pés
juntos, a outra perna à frente. A perna que vai para frente dobra o joelho, a de apoio fica
reta, e o corpo desce um pouco no passo largo. Tudo em alta resolução, antes de reduzir.
"""
import numpy as np, cv2, math

def R(deg):
    a = math.radians(deg)   # positivo = pé para frente (+x) numa perna pendurada (0,+1)
    return np.array([[math.cos(a), math.sin(a)], [-math.sin(a), math.cos(a)]])

def smooth(x, a, b):
    t = np.clip((x - a) / max(1e-6, b - a), 0, 1); return t * t * (3 - 2 * t)

def splat(h, w, xs, ys, rgba):
    """espalha cada pixel nos 4 vizinhos (bilinear) — sem buracos depois de deformar"""
    acc = np.zeros((h, w, 4), np.float64); wsum = np.zeros((h, w), np.float64)
    x0 = np.floor(xs).astype(int); y0 = np.floor(ys).astype(int)
    fx = xs - x0; fy = ys - y0
    a = rgba[:, 3:4].astype(np.float64) / 255.0
    pre = np.hstack([rgba[:, :3] * a, a])
    for dx, dy, ww in ((0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)):
        xx, yy = x0 + dx, y0 + dy
        ok = (xx >= 0) & (xx < w) & (yy >= 0) & (yy < h)
        np.add.at(acc, (yy[ok], xx[ok]), pre[ok] * ww[ok, None])
        np.add.at(wsum, (yy[ok], xx[ok]), ww[ok])
    out = np.zeros((h, w, 4), np.float64)
    nz = wsum > 0.25
    out[nz, :3] = acc[nz, :3] / np.maximum(acc[nz, 3:4], 1e-6)
    out[nz, 3] = np.clip(acc[nz, 3] / wsum[nz], 0, 1) * 255 * np.clip(wsum[nz] / 0.6, 0, 1)
    return out.clip(0, 255).astype(np.uint8)

def over(dst, src):
    a = src[..., 3:4].astype(np.float32) / 255.0
    out = dst.astype(np.float32) * (1 - a) + src.astype(np.float32) * a
    out[..., 3:4] = np.maximum(dst[..., 3:4], src[..., 3:4])
    return out.astype(np.uint8)

def shift(layer, dx, dy):
    M = np.float32([[1, 0, dx], [0, 1, dy]])
    return cv2.warpAffine(layer, M, (layer.shape[1], layer.shape[0]), flags=cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))

def split_legs(cell, ankle_h=26):
    m = cell[..., 3] > 128
    ys, xs = np.nonzero(m); foot = ys.max()
    hsv = cv2.cvtColor(cell[..., :3], cv2.COLOR_BGR2HSV)
    sab = (hsv[..., 1] < 60) & (hsv[..., 2] > 150) & m
    for y in range(foot - 5, ys.min(), -1):
        xs_ = np.nonzero(m[y])[0]
        if len(np.split(xs_, np.nonzero(np.diff(xs_) > 1)[0] + 1)) == 1:
            crotch = y; break
    y0 = max(int(np.nonzero(sab)[0].max()) + 5, crotch - 4)   # abaixo do sabre e da mão (o pomo não vai junto)
    xs_ = np.nonzero(m[crotch + 4])[0]
    runs = np.split(xs_, np.nonzero(np.diff(xs_) > 1)[0] + 1)
    split = (runs[0][-1] + runs[1][0]) / 2 if len(runs) > 1 else xs_.mean()
    yy, xx = np.mgrid[:cell.shape[0], :cell.shape[1]]
    legs = (cell[..., 3] > 0) & (yy >= y0)
    upper = cell.copy(); upper[legs] = 0
    L = {}
    for name, sel in (("back", legs & (xx < split)), ("front", legs & (xx >= split))):
        ly, lx = np.nonzero(sel & m)
        fy = ly.max()
        hip = np.array([float(lx[ly < y0 + 6].mean()), float(y0)])
        ank_y = fy - ankle_h
        knee_y = hip[1] + (ank_y - hip[1]) * 0.5
        row = lambda y: float(lx[(ly > y - 3) & (ly < y + 3)].mean())
        knee = np.array([row(knee_y), knee_y]); ank = np.array([row(ank_y), float(ank_y)])
        py, px = np.nonzero(sel)
        L[name] = dict(px=px.astype(np.float64), py=py.astype(np.float64), rgba=cell[py, px].astype(np.float64),
                       hip=hip, knee=knee, ank=ank, foot=fy,
                       base_th=math.degrees(math.atan2(*(knee - hip))), base_sh=math.degrees(math.atan2(*(ank - knee))),
                       lum=float(cell[sel & m][:, :3].mean()))
    return upper, L, dict(y0=y0, crotch=crotch, split=split, foot=int(foot))

def deform(d, th, bend, boot_tilt=0.0):
    hip, knee, ank = d["hip"], d["knee"], d["ank"]
    R1 = R(th - d["base_th"]); knee2 = hip + R1 @ (knee - hip)
    R2 = R(th - bend - d["base_sh"]); ank2 = knee2 + R2 @ (ank - knee)
    R3 = R(boot_tilt)
    P = np.stack([d["px"], d["py"]], 1)
    p_th = hip + (P - hip) @ R1.T
    p_sh = knee2 + (P - knee) @ R2.T
    p_bt = ank2 + (P - ank) @ R3.T
    y = d["py"]
    w_sh = smooth(y, knee[1] - 10, knee[1] + 10)              # joelho: mistura suave coxa -> canela
    w_bt = smooth(y, ank[1] - 6, ank[1] + 6)                  # tornozelo: canela -> bota
    q = p_th * (1 - w_sh)[:, None] + p_sh * w_sh[:, None]
    q = q * (1 - w_bt)[:, None] + p_bt * w_bt[:, None]
    return q

def pose(upper, L, info, ang, lean=0.0, extra_down=0.0):
    h, w = upper.shape[:2]
    near = max(L, key=lambda k: L[k]["lum"]); far = [k for k in L if k != near][0]
    layers, lows = {}, []
    for k in L:
        th, bend = ang[k]
        q = deform(L[k], th, bend, boot_tilt=-0.45 * bend)
        layers[k] = splat(h, w, q[:, 0], q[:, 1], L[k]["rgba"])
        if bend < 2:
            lows.append(np.nonzero(layers[k][..., 3] > 100)[0].max())
    comp = over(layers[far], upper)
    comp = over(comp, layers[near])
    low = max(lows) if lows else info["foot"]
    comp = shift(comp, 0, info["foot"] - low + extra_down)
    if lean:
        out = np.zeros_like(comp); f = info["foot"]
        for y in range(h):
            out[y] = shift(comp[y:y + 1], lean * max(0, f - y), 0)[0]
        comp = out
    return comp

def cycle(cell, n=8, amp=22.0, knee=40.0, inward=1.0, lean=0.0, bob=0.0):
    upper, L, info = split_legs(cell)
    D = L["front"]["hip"][0] - L["back"]["hip"][0]
    Lg = ((L["front"]["foot"] - L["front"]["hip"][1]) + (L["back"]["foot"] - L["back"]["hip"][1])) / 2
    c0 = -math.degrees(math.asin(max(-.9, min(.9, D / (2 * Lg))))) * inward
    frames = []
    for t in range(n):
        ph = 2 * math.pi * t / n
        s, c = math.sin(ph), math.cos(ph)
        th = c0 + amp * s
        ang = {"front": (th, knee * max(0.0, c) ** 1.3), "back": (-th, knee * max(0.0, -c) ** 1.3)}
        frames.append(pose(upper, L, info, ang, lean, extra_down=-bob * abs(c)))
    return frames, info
