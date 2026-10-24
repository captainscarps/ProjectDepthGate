"""
Folhas dos inimigos novos (pacotes craftpix enviados):
  • Esqueletos: Legionário (escudo), Lanceiro, Atirador
  • Cultistas Piromantes: Cultista, Zelote, Lâmina das Cinzas
  • Deserto: Guardião de Anúbis, Mantícora, Estátua Desperta
  • Espiões do Observador (chefes surpresa): Olho Pálido, Olho Rubro, Olho do Vazio
Cada criatura vira uma folha em grade (quadro recortado justo, pés a 88% da altura como o jogo espera,
todas olhando para a direita) + projéteis próprios. Saída: assets/pixel-art/enemies/nf-*.png e
scripts/new_foes_meta.json (quadros de cada animação e escala de tela).
Uso: python3 scripts/build_new_foes.py <pasta com os zips extraídos>
  a pasta deve ter: Skeleton_Warrior/, Skeleton_Spearman/, Skeleton_Archer/, Pyromancer_1..3/,
  "1 Anubis"/, "2 Manticore"/, "3 Revived statue"/, Beholder1..3/ (PNG/BeholderN/Without_shadow)
"""
import glob
import json
import math
import os
import shutil
import sys

from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1]
OUT = os.path.join(ROOT, "assets", "pixel-art", "enemies")
MIR = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "enemies")


def find(rel):
    hits = [p for p in glob.glob(os.path.join(SRC, "**", rel), recursive=True) if "__MACOSX" not in p]
    assert hits, rel
    return hits[0]


def strip(rel, fw=None, fh=None, row=0, flip=False):
    im = Image.open(find(rel)).convert("RGBA")
    fh = fh or im.height
    fw = fw or fh
    fr = [im.crop((i * fw, row * fh, (i + 1) * fw, (row + 1) * fh)) for i in range(im.width // fw)]
    if flip:
        fr = [f.transpose(Image.FLIP_LEFT_RIGHT) for f in fr]
    return fr


def bbox(frames):
    bx = [f.getbbox() for f in frames if f.getbbox()]
    return min(b[0] for b in bx), min(b[1] for b in bx), max(b[2] for b in bx), max(b[3] for b in bx)


def build(key, anims, target_h, size_scale, wide=1.8):
    """anims: {nome: [quadros PIL]} (todos do mesmo tamanho de origem). Primeiro 'idle' define pés/centro."""
    idle = anims["idle"]
    ix0, iy0, ix1, iy1 = bbox(idle)
    allf = [f for v in anims.values() for f in v]
    ux0, uy0, ux1, uy1 = bbox(allf)
    feet = iy1
    vis_h = iy1 - iy0
    cx = (ix0 + ix1) / 2
    half = min(max(cx - ux0, ux1 - cx), (ix1 - ix0) / 2 * wide) + 2
    top = min(uy0, iy0) - 2
    Hc = int(math.ceil((feet - top) / .88)) + 1
    y0 = int(round(feet - .88 * Hc))
    x0 = int(math.floor(cx - half))
    fw, fh = int(math.ceil(half * 2)), Hc
    order, idx = [], {}
    for name, frs in anims.items():
        idx[name] = list(range(len(order), len(order) + len(frs)))
        order += frs
    cols = min(16, len(order))
    rows = math.ceil(len(order) / cols)
    sheet = Image.new("RGBA", (cols * fw, rows * fh), (0, 0, 0, 0))
    for k, f in enumerate(order):
        c = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
        c.paste(f, (-x0, -y0), f)
        sheet.paste(c, ((k % cols) * fw, (k // cols) * fh))
    fn = f"nf-{key}.png"
    sheet.save(os.path.join(OUT, fn), optimize=True)
    si = round(target_h / (vis_h * size_scale), 3)
    return {"file": fn, "fw": fw, "fh": fh, "n": len(order), "anims": idx, "si": si, "visH": vis_h, "visW": ix1 - ix0}


def pick(frs, *ix):
    return [frs[i] for i in ix]


META = {}
# ───────── esqueletos (128x128, olhando para a direita) ─────────
W = "Skeleton_Warrior/"
a1 = strip(W + "Attack_1.png")
META["skeleton-legion"] = build("skeleton-legion", {
    "idle": strip(W + "Idle.png"), "walk": strip(W + "Walk.png"), "run": strip(W + "Run.png"),
    "alert": strip(W + "Protect.png"), "windup": a1[:2], "strike": a1[2:4], "recover": a1[4:],
    "hurt": strip(W + "Hurt.png"), "death": strip(W + "Dead.png"), "charge": strip(W + "Run+attack.png")}, 38, 1)
P = "Skeleton_Spearman/"
a1 = strip(P + "Attack_1.png")
META["skeleton-spear"] = build("skeleton-spear", {
    "idle": strip(P + "Idle.png"), "walk": strip(P + "Walk.png"), "run": strip(P + "Run.png"),
    "alert": strip(P + "Protect.png"), "windup": a1[:2], "strike": a1[2:], "recover": a1[3:],
    "hurt": strip(P + "Hurt.png"), "death": strip(P + "Dead.png"), "charge": strip(P + "Run+attack.png")}, 38, 1, 1.9)
A = "Skeleton_Archer/"
sh = strip(A + "Shot_1.png")
META["skeleton-sharp"] = build("skeleton-sharp", {
    "idle": strip(A + "Idle.png"), "walk": strip(A + "Walk.png"), "run": strip(A + "Walk.png"),
    "alert": sh[:1], "windup": sh[:len(sh) - 3], "strike": sh[len(sh) - 3:len(sh) - 1], "recover": sh[-1:],
    "hurt": strip(A + "Hurt.png"), "death": strip(A + "Dead.png")}, 37, 1)
# ───────── piromantes (128x128) ─────────
p1a2 = strip("Pyromancer_1/Attack_2.png")
META["pyro-cultist"] = build("pyro-cultist", {
    "idle": strip("Pyromancer_1/Idle.png"), "walk": strip("Pyromancer_1/Walk.png"), "run": strip("Pyromancer_1/Run.png"),
    "alert": p1a2[:1], "windup": p1a2[:5], "strike": p1a2[5:10], "recover": p1a2[10:],
    "hurt": strip("Pyromancer_1/Hurt.png"), "death": strip("Pyromancer_1/Dead.png")}, 38, 1, 1.8)
p2a3 = strip("Pyromancer_2/Attack_3.png")
META["pyro-zealot"] = build("pyro-zealot", {
    "idle": strip("Pyromancer_2/Idle.png"), "walk": strip("Pyromancer_2/Walk.png"), "run": strip("Pyromancer_2/Run.png"),
    "alert": p2a3[:1], "windup": p2a3[:4], "strike": p2a3[4:10], "recover": p2a3[10:],
    "hurt": strip("Pyromancer_2/Hurt.png"), "death": strip("Pyromancer_2/Dead.png")}, 38, 1, 1.8)
p3a3 = strip("Pyromancer_3/Attack_3.png")
META["pyro-ashblade"] = build("pyro-ashblade", {
    "idle": strip("Pyromancer_3/Idle.png"), "walk": strip("Pyromancer_3/Walk.png"), "run": strip("Pyromancer_3/Run.png"),
    "alert": p3a3[:1], "windup": p3a3[:4], "strike": p3a3[4:8], "recover": p3a3[8:],
    "hurt": strip("Pyromancer_3/Hurt.png"), "death": strip("Pyromancer_3/Dead.png")}, 38, 1, 1.8)
# ───────── deserto (72x72, viram para a direita) ─────────
D = "1 Anubis/Anubis_"
an = lambda n: strip(D + n + ".png", 72, 72, flip=True)
a3 = an("attack3")
META["anubis"] = build("anubis", {
    "idle": an("idle"), "walk": an("walk"), "run": an("walk"), "alert": an("sneer")[:3],
    "windup": a3[:2], "strike": a3[2:5], "recover": a3[5:], "hurt": an("hurt")[1:], "death": an("death"),
    "cast": an("attack4")}, 52, 1.5, 1.8)
M = "2 Manticore/Manticore_"
mn = lambda n: strip(M + n + ".png", 72, 72, flip=True)
m1 = mn("attack1")
META["manticore"] = build("manticore", {
    "idle": mn("idle"), "walk": mn("walk"), "run": mn("walk"), "alert": mn("sneer")[:3],
    "windup": m1[:2], "strike": m1[2:], "recover": m1[3:], "hurt": mn("hurt")[1:], "death": mn("death"),
    "bite": mn("attack3")}, 34, 1.5, 1.6)
R = "3 Revived statue/Revived_statue_"
rv = lambda n: strip(R + n + ".png", 72, 72, flip=True)
r3 = rv("attack3")
META["revived-statue"] = build("revived-statue", {
    "idle": rv("idle"), "walk": rv("walk"), "run": rv("walk"), "alert": rv("sneer")[:2],
    "windup": r3[:2], "strike": r3[2:], "recover": r3[3:], "hurt": rv("hurt")[1:], "death": rv("death"),
    "shoot": rv("attack1")}, 58, 2, 1.6)
# ───────── espiões do Observador (64x64, 4 direções: 0 frente, 1 costas, 2 esquerda, 3 direita) ─────────
for n, key in ((1, "eye-pale"), (2, "eye-crimson"), (3, "eye-void")):
    B = f"Beholder{n}_"
    bh = lambda a, r: strip(f"Beholder{n}/Without_shadow/{B}{a}_without_shadow.png", 64, 64, r)
    at = bh("Attack", 3)
    META[key] = build(key, {
        "idle": bh("Idle", 0), "walk": bh("Walk", 3), "run": bh("Run", 3), "alert": bh("Idle", 0)[:2],
        "windup": at[:4], "strike": at[4:9], "recover": at[9:], "hurt": bh("Hurt", 0), "death": bh("Death", 0),
        "front": bh("Attack", 0)}, 44 if n < 3 else 52, 2, 1.4)
# ───────── projéteis ─────────
PJ = {}


def proj(name, im, w=None):
    b = im.getbbox()
    im = im.crop(b)
    if w and im.width != w:
        im = im.resize((w, max(3 if name == "arrow" else 1, round(im.height * w / im.width))), Image.NEAREST)
    im.save(os.path.join(OUT, f"nf-proj-{name}.png"))
    PJ[name] = {"file": f"nf-proj-{name}.png", "fw": im.width, "fh": im.height}


proj("arrow", Image.open(find("Skeleton_Archer/Arrow.png")).convert("RGBA"), 16)
proj("fireball", strip("Pyromancer_1/Charge.png", 64, 64)[1], 16)
proj("orb", Image.open(find("1 Anubis/Ball.png")).convert("RGBA").resize((12, 12), Image.NEAREST))
proj("acid", Image.open(find("2 Manticore/Acid.png")).convert("RGBA").transpose(Image.FLIP_LEFT_RIGHT), 20)
proj("shard", Image.open(find("3 Revived statue/Bullet.png")).convert("RGBA").rotate(90, expand=True), 14)
META["_proj"] = PJ
json.dump(META, open(os.path.join(ROOT, "scripts", "new_foes_meta.json"), "w"), indent=1)
if os.path.isdir(os.path.dirname(MIR)):
    os.makedirs(MIR, exist_ok=True)
    for f in glob.glob(os.path.join(OUT, "nf-*.png")):
        shutil.copy2(f, os.path.join(MIR, os.path.basename(f)))
for k, v in META.items():
    if k != "_proj":
        print(k, v["fw"], "x", v["fh"], "quadros", v["n"], "escala", v["si"])
print("projéteis", {k: (v["fw"], v["fh"]) for k, v in PJ.items()})
