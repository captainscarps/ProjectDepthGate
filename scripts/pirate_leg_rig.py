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


# ---------------------------------------------------------------- ciclos copiados dos outros heróis
# Poses medidas quadro a quadro no Guerreiro (folha warrior-pack, a mesma referência de
# "cavaleiro" das folhas do pirata). Para cada quadro: (coxa, joelho) da perna da frente e da
# de trás, em graus (coxa: + = para frente; joelho: quanto a canela dobra para trás),
# inclinação do tronco (graus, + = para frente) e altura extra do corpo (pulo/voo, em % da perna).
WARRIOR_WALK = [   # 6 quadros a 11 fps (padrão do jogo)
    dict(front=(10, 5),  back=(-18, 65), lean=4, air=0.00),   # apoio na da frente, calcanhar de trás sobe
    dict(front=(22, 8),  back=(-22, 10), lean=4, air=0.00),   # passo largo: as duas no chão
    dict(front=(0, 5),   back=(42, 80),  lean=4, air=0.04),   # a de trás passa com o joelho alto
    dict(front=(-18, 65), back=(10, 5),  lean=4, air=0.00),   # espelho: agora a de trás apoia
    dict(front=(-22, 10), back=(22, 8),  lean=4, air=0.00),
    dict(front=(42, 80), back=(0, 5),    lean=4, air=0.04),   # a da frente passa com o joelho alto
]
WARRIOR_RUN = [    # 6 quadros a 15 fps (padrão do jogo)
    dict(front=(50, 90),  back=(-38, 25), lean=18, air=0.10), # joelho da frente alto, de trás esticada (voo)
    dict(front=(26, 18),  back=(-42, 85), lean=18, air=0.00), # pisa na frente, de trás dobra para cima
    dict(front=(2, 15),   back=(30, 105), lean=18, air=0.02), # passagem: de trás vem com o joelho dobrado
    dict(front=(-38, 25), back=(50, 90),  lean=18, air=0.10), # espelho (voo)
    dict(front=(-42, 85), back=(26, 18),  lean=18, air=0.00),
    dict(front=(30, 105), back=(2, 15),   lean=18, air=0.02),
]


def rotate_upper(upper, deg, pivot):
    """inclina o tronco em torno do quadril (+ = cabeça para frente)"""
    a = math.radians(deg)
    Rm = np.array([[math.cos(a), -math.sin(a)], [math.sin(a), math.cos(a)]])   # gira a cabeça (acima) para +x
    t = np.array(pivot) - Rm @ np.array(pivot)
    M = np.hstack([Rm, t[:, None]]).astype(np.float32)
    return cv2.warpAffine(upper, M, (upper.shape[1], upper.shape[0]), flags=cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))


def keyed_cycle(cell, keys):
    upper, L, info = split_legs(cell)
    h, w = upper.shape[:2]
    near = max(L, key=lambda k: L[k]["lum"]); far = [k for k in L if k != near][0]
    hipmid = (L["front"]["hip"] + L["back"]["hip"]) / 2
    leg_len = ((L["front"]["foot"] - L["front"]["hip"][1]) + (L["back"]["foot"] - L["back"]["hip"][1])) / 2
    frames = []
    for kf in keys:
        up = rotate_upper(upper, kf["lean"], tuple(hipmid)) if kf["lean"] else upper
        layers = {}
        for k in ("front", "back"):
            th, bend = kf[k]
            q = deform(L[k], th, bend, boot_tilt=-0.4 * max(0, bend - 20))
            layers[k] = splat(h, w, q[:, 0], q[:, 1], L[k]["rgba"])
        comp = over(layers[far], up)
        comp = over(comp, layers[near])
        low = int(np.nonzero(comp[..., 3] > 100)[0].max())
        comp = shift(comp, 0, info["foot"] - low - kf["air"] * leg_len)
        frames.append(comp)
    return frames, info


def _seg_layers(cell, d, sel_mask, pad=9):
    """camadas rígidas com sobreposição nas juntas (não abre buraco ao dobrar)"""
    knee_y, ank_y = d["knee"][1], d["ank"][1]
    yy = np.arange(cell.shape[0])[:, None]
    out = {}
    for name, (a, b) in (("thigh", (-1e9, knee_y + pad)), ("shin", (knee_y - pad, ank_y + pad)), ("boot", (ank_y - pad, 1e9))):
        lay = np.zeros_like(cell)
        sel = sel_mask & (yy >= a) & (yy < b)
        lay[sel] = cell[sel]
        out[name] = lay
    return out


def _warp(layer, M):
    return cv2.warpAffine(layer, M.astype(np.float32), (layer.shape[1], layer.shape[0]), flags=cv2.INTER_LINEAR,
                          borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))


def _M(Rm, src, dst):
    t = np.array(dst) - Rm @ np.array(src)
    return np.hstack([Rm, t[:, None]])


def rigid_leg(cell, d, segs, th, bend, boot_tilt, hip_dst=None):
    hip, knee, ank = d["hip"], d["knee"], d["ank"]
    hip2 = hip if hip_dst is None else np.array(hip_dst)
    R1 = R(th - d["base_th"]); knee2 = hip2 + R1 @ (knee - hip)
    R2 = R(th - bend - d["base_sh"]); ank2 = knee2 + R2 @ (ank - knee)
    R3 = R(boot_tilt)
    boot = _warp(segs["boot"], _M(R3, ank, ank2))
    shin = _warp(segs["shin"], _M(R2, knee, knee2))
    thigh = _warp(segs["thigh"], _M(R1, hip, hip2))
    return over(over(boot, shin), thigh)


def keyed_cycle_rigid(cell, keys):
    upper, L, info = split_legs(cell)
    h, w = upper.shape[:2]
    near = max(L, key=lambda k: L[k]["lum"]); far = [k for k in L if k != near][0]
    # máscaras de cada perna (mesma divisão de split_legs)
    m = cell[..., 3] > 0
    yy, xx = np.mgrid[:h, :w]
    legs = m & (yy >= info["y0"])
    sel = {"back": legs & (xx < info["split"]), "front": legs & (xx >= info["split"])}
    segs = {k: _seg_layers(cell, L[k], sel[k]) for k in L}
    hipmid = (L["front"]["hip"] + L["back"]["hip"]) / 2
    leg_len = ((L["front"]["foot"] - L["front"]["hip"][1]) + (L["back"]["foot"] - L["back"]["hip"][1])) / 2
    frames = []
    for kf in keys:
        up = rotate_upper(upper, kf["lean"], tuple(hipmid)) if kf["lean"] else upper
        layers = {k: rigid_leg(cell, L[k], segs[k], kf[k][0], kf[k][1], -0.4 * max(0, kf[k][1] - 20)) for k in L}
        comp = over(layers[far], up)
        comp = over(comp, layers[near])
        low = int(np.nonzero(comp[..., 3] > 100)[0].max())
        comp = shift(comp, 0, info["foot"] - low - kf["air"] * leg_len)
        frames.append(comp)
    return frames, info


# ---------------------------------------------------------------- cópia por posição dos pés (IK)
# Medido pixel a pixel no Guerreiro (warrior-pack, quadros de andar 6-11 e correr 12-17):
# posição da sola de cada pé em relação ao quadril (x: + = para frente; y: para baixo; o pé
# em pé fica 19 px abaixo do quadril). "A" é uma perna e "B" a outra (B = A atrasada 3 quadros),
# do mesmo jeito que no Guerreiro as duas pernas trocam de papel a cada 3 quadros.
WARRIOR_LEG = 19.0
HIP_CENTER = 1.0          # 0 = do quadril de cada perna, 1 = do centro do corpo
MAX_DROP = 0.0            # o corpo não sobe nem desce além disto (no Guerreiro a cabeça mexe ~1 px)
BASE_DROP = 0.12          # joelhos levemente dobrados o tempo todo, como o Guerreiro andando
X_SCALE = 1.00            # passo proporcional ao do Guerreiro (perna do pirata é mais reta)
LEG_PULL = 0.7            # aproxima os quadris (0 = pose 3/4 da arte, 1 = as duas pernas saem do mesmo ponto)
_WALK_A = [(11, 19), (9, 19), (-2, 19), (-8, 19), (-16, 12), (-10, 10)]    # pisa na frente, apoia, vai para trás, sobe atrás, passa
_RUN_A = [(11, 19), (-2, 19), (-9, 19), (-22, 6), (-15, 5), (6, 10)]       # pisa, apoia, empurra, estica atrás, dobra, joelho alto
WARRIOR_WALK_IK = [dict(A=_WALK_A[i], B=_WALK_A[(i + 3) % 6], lean=4) for i in range(6)]
WARRIOR_RUN_IK = [dict(A=_RUN_A[i], B=_RUN_A[(i + 3) % 6], lean=l) for i, l in enumerate((8, 4, 18, 8, 4, 18))]


def _ik(l1, l2, tx, ty):
    """quadril em (0,0); devolve (ângulo da coxa, ângulo da canela) a partir da vertical, + = para frente,
    com o joelho dobrando para frente"""
    d = max(1e-6, math.hypot(tx, ty))
    d = min(d, (l1 + l2) * 0.999)
    base = math.atan2(tx, ty)
    cos_a = max(-1.0, min(1.0, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))
    a1 = base + math.acos(cos_a)                     # coxa gira para frente: joelho à frente
    kx, ky = l1 * math.sin(a1), l1 * math.cos(a1)
    a2 = math.atan2(tx - kx, ty - ky)
    return math.degrees(a1), math.degrees(a2)


def ik_cycle(cell, keys):
    upper, L, info = split_legs(cell)
    h, w = upper.shape[:2]
    near = max(L, key=lambda k: L[k]["lum"]); far = [k for k in L if k != near][0]
    role = {"A": near, "B": far}
    m = cell[..., 3] > 0
    yy, xx = np.mgrid[:h, :w]
    legs = m & (yy >= info["y0"])
    sel = {"back": legs & (xx < info["split"]), "front": legs & (xx >= info["split"])}
    segs = {k: _seg_layers(cell, L[k], sel[k]) for k in L}
    hipmid = (L["front"]["hip"] + L["back"]["hip"]) / 2
    frames = []
    for kf in keys:
        poses, need_drop = {}, 0.0
        tgt = {}
        for r in ("A", "B"):
            d = L[role[r]]
            l1 = float(np.linalg.norm(d["knee"] - d["hip"])); l2 = float(np.linalg.norm(d["ank"] - d["knee"]))
            boot_h = d["foot"] - d["ank"][1]
            leg = d["foot"] - d["hip"][1]
            sc = leg / WARRIOR_LEG
            fx, fy = kf[r]
            # a posição do pé é medida do centro do corpo (como no Guerreiro), não do quadril
            # de cada perna: na vista 3/4 os quadris do pirata ficam afastados
            tx = fx * sc * X_SCALE - (d["hip"][0] - hipmid[0]) * (1 - LEG_PULL) * HIP_CENTER
            ty = fy * sc - boot_h - BASE_DROP * leg          # alvo do tornozelo (quadril um pouco mais baixo)
            planted = fy >= WARRIOR_LEG - 0.5
            tgt[r] = (tx, ty, l1, l2, planted)
            if planted:                                       # pé no chão longe demais: o corpo desce
                reach = (l1 + l2) * 0.985
                if math.hypot(tx, ty) > reach and abs(tx) < reach:
                    need_drop = max(need_drop, ty - math.sqrt(reach * reach - tx * tx))
        need_drop = min(need_drop, MAX_DROP * (L["front"]["foot"] - L["front"]["hip"][1]))
        for r in ("A", "B"):
            tx, ty, l1, l2, planted = tgt[r]
            a1, a2 = _ik(l1, l2, tx, ty - need_drop)
            bend = a1 - a2
            poses[role[r]] = (a1, bend, 0.0 if planted else -0.35 * max(0.0, bend - 15))
        up = rotate_upper(upper, kf["lean"], tuple(hipmid)) if kf["lean"] else upper
        layers = {k: rigid_leg(cell, L[k], segs[k], poses[k][0], poses[k][1], poses[k][2],
                               hip_dst=L[k]["hip"] + np.array([(hipmid[0] - L[k]["hip"][0]) * LEG_PULL, 0.0])) for k in L}
        comp = over(layers[far], up)
        comp = over(comp, layers[near])
        low = int(np.nonzero(comp[..., 3] > 100)[0].max())
        comp = shift(comp, 0, info["foot"] - low)
        frames.append(comp)
    return frames, info
