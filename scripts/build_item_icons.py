"""
Ícones de itens em alta definição (vetor SVG → PNG pelo Chromium/Playwright → atlas).
  • itens comuns (espada, adaga, machado…): um visual por raridade — Comum, Incomum, Raro, Épico, Lendário, Relíquia
    (o Lendário e a Relíquia de cada tipo têm desenho próprio: guarda com asas, gemas, gume brilhante, aura)
  • itens nomeados (Mata-Dragões, Coração do Inverno, Presas de Gelo…) e peças de conjunto: desenho único cada
  • cristais de missão, materiais e poções
Saída: assets/pixel-art/items-hd/items.png + items.json (atlas Phaser, quadros "<id>" e "<id>@<RARIDADE>")
Uso: python3 scripts/build_item_icons.py [--sheet caminho.png]  (a folha de conferência mostra todos os ícones)
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from icon_svg import *  # noqa

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(ROOT, "assets", "pixel-art", "items-hd")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "pixel-art", "items-hd")
SZ = 80
RAR = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "RELIC"]

# tema de cada raridade (para os itens comuns)
TH = {
    "COMMON": dict(m="iron", g="iron", gr="wood", p="iron", gem=None, gs="bar", fu=None, rune=None, eg=None, glow=None, aura=None, sp=0, cloth="cloth_grey", trim="iron", wood="wood", band="iron"),
    "UNCOMMON": dict(m="steel", g="bronze", gr="greenleather", p="bronze", gem="emerald", gs="bar", fu=None, rune=None, eg=None, glow=None, aura=None, sp=0, cloth="cloth_green", trim="bronze", wood="wood", band="bronze"),
    "RARE": dict(m="steel", g="silver", gr="leather", p="silver", gem="sapphire", gs="curved", fu="#4f8dff", rune=None, eg=None, glow="#4f8dff", aura=None, sp=0, cloth="cloth_blue", trim="silver", wood="darkwood", band="silver"),
    "EPIC": dict(m="darksteel", g="silver", gr="cloth_black", p="silver", gem="amethyst", gs="curved", fu=None, rune="#c690ff", eg="#b07aff", glow="#a85cff", aura=None, sp=0, cloth="cloth_purple", trim="silver", wood="darkwood", band="silver"),
    "LEGENDARY": dict(m="steel", g="gold", gr="cloth_red", p="gold", gem="ruby", gs="wings", fu="#ffcf5a", rune=None, eg="#ffd36a", glow="#ffae1e", aura="#ffae1e", sp=4, cloth="crimson", trim="gold", wood="darkwood", band="gold"),
    "RELIC": dict(m="ice", g="silver", gr="cloth_blue", p="silver", gem="diamond", gs="wings", fu="#ffffff", rune="#7af6ff", eg="#7af6ff", glow="#3fe0ff", aura="#3fe0ff", sp=5, cloth="aurora", trim="silver", wood="darkwood", band="silver"),
}


def gen_base(bid, r):
    t = TH[r]
    I = Icon(hash((bid, r)) & 0xffff)
    gl, au, sp = t["glow"], t["aura"], (sparkles(hash((bid, r)) & 0xffff, t["sp"]) if t["sp"] else None)
    L = r in ("LEGENDARY", "RELIC")
    if bid in ("sword", "shaman_sword"):
        if bid == "shaman_sword":
            sword(I, "darkwood" if not L else ("obsidian" if r == "LEGENDARY" else "ice"), "bone" if not L else t["g"], "leather", "bone", "bar" if r in ("COMMON", "UNCOMMON") else t["gs"],
                  t["gem"], None, None, t["eg"], t["rune"], "broad", 14, "#c83a2a", serr=True)
        else:
            sword(I, t["m"], t["g"], t["gr"], t["p"], t["gs"], t["gem"] if r != "COMMON" else None, "ruby" if L else None, t["fu"], t["eg"], t["rune"])
    elif bid == "dagger":
        dagger(I, t["m"], t["g"], t["gr"], t["p"], "curved" if r != "COMMON" else "bar", t["gem"], None, t["eg"], t["rune"], "curved" if r in ("EPIC", "LEGENDARY", "RELIC") else "straight")
    elif bid == "great_sword":
        greatsword(I, t["m"], t["g"], t["gr"], t["p"], t["gs"], t["gem"], "ruby" if L else None, t["fu"], t["eg"], t["rune"])
    elif bid in ("axe", "great_axe"):
        axe(I, t["m"] if r != "RELIC" else "ice", t["wood"], bid == "great_axe", t["gem"], t["eg"], t["rune"], t["band"], spike=r in ("EPIC", "LEGENDARY", "RELIC"))
    elif bid in ("club", "mace", "war_hammer"):
        kind = {"club": "club", "mace": "mace", "war_hammer": "hammer"}[bid]
        head = ("wood" if r == "COMMON" else "darkwood") if kind == "club" else t["m"]
        if kind == "club" and L:
            head = "gold" if r == "LEGENDARY" else "ice"
        blunt(I, kind, head, t["wood"], t["gem"], t["eg"], t["band"], "gold" if r == "LEGENDARY" else None)
    elif bid in ("simple_staff", "staff", "arcane_staff", "bone_staff"):
        top = {"simple_staff": "crystal", "staff": "orb", "arcane_staff": "crystal", "bone_staff": "skull"}[bid]
        col = {"COMMON": "topaz", "UNCOMMON": "emerald", "RARE": "sapphire", "EPIC": "amethyst", "LEGENDARY": "ruby", "RELIC": "diamond"}[r]
        if bid == "simple_staff" and r in ("COMMON", "UNCOMMON"):
            top = "rune"
        if bid == "staff" and r == "LEGENDARY":
            top = "star"
            col = "topaz"
        if bid == "arcane_staff" and r in ("LEGENDARY", "RELIC"):
            top = "comet"
        staff(I, "bone" if bid == "bone_staff" else t["wood"], top, col if bid != "bone_staff" else ("soul" if r in ("EPIC", "RELIC") else "ruby" if r == "LEGENDARY" else "emerald"),
              t["band"], t["glow"], t["band"])
    elif bid in ("bow", "long_bow"):
        bow(I, t["wood"] if r != "RELIC" else "ice", "#e8e2d0", t["band"] if r != "COMMON" else None, "leather", t["eg"], bid == "long_bow", t["gem"], t["rune"], flames=r == "LEGENDARY")
    elif bid in ("wooden_shield", "iron_shield"):
        if bid == "wooden_shield":
            shield(I, "wood" if r in ("COMMON", "UNCOMMON") else t["m"], t["trim"], kind="round", boss=t["trim"], wood=r in ("COMMON", "UNCOMMON"), gem_=t["gem"] if L else None)
        else:
            em = {"COMMON": "boss", "UNCOMMON": "boss", "RARE": "cross", "EPIC": "cross", "LEGENDARY": "dragon", "RELIC": "cross"}[r]
            shield(I, t["m"], t["trim"], em, t["trim"], "heater", t["gem"] if r != "COMMON" else None, spikes=r == "EPIC")
    elif bid in ("armor",):
        armor(I, t["m"] if r != "LEGENDARY" else "crimson", t["trim"], "plate", t["gem"] if r != "COMMON" else None, spikes=r == "EPIC", frost=r == "RELIC", scales=r == "LEGENDARY")
    elif bid == "dark_leather_armor":
        armor(I, "leather" if r in ("COMMON", "UNCOMMON") else "cloth_black", t["trim"], "leather", t["gem"] if r != "COMMON" else None, spikes=r == "EPIC")
    elif bid == "shadow_cloak":
        armor(I, "cloth_black" if r != "RELIC" else "aurora", t["trim"], "cloak", t["gem"] if r != "COMMON" else None)
    elif bid == "helmet":
        helmet(I, t["m"] if r != "LEGENDARY" else "gold", t["trim"], "helm", t["gem"] if r != "COMMON" else None,
               plume={"RARE": "#3d7bff", "EPIC": "#a85cff", "LEGENDARY": "#ff3b4e", "RELIC": "#bff6ff"}.get(r), horns="gold" if r == "LEGENDARY" else None,
               eyes="#a85cff" if r == "EPIC" else "#7af6ff" if r == "RELIC" else None)
    elif bid == "assassin_hood":
        helmet(I, "cloth_black" if r in ("COMMON", "UNCOMMON", "RARE") else t["cloth"], t["trim"], "hood", t["gem"] if L else None,
               eyes={"RARE": "#5aa0ff", "EPIC": "#c690ff", "LEGENDARY": "#ffcf5a", "RELIC": "#7af6ff"}.get(r))
    elif bid in ("boots", "thief_boots"):
        boots(I, ("leather" if bid == "boots" else "cloth_black") if r in ("COMMON", "UNCOMMON") else t["m"] if bid == "boots" else t["cloth"], t["trim"], "boot",
              t["gem"] if r != "COMMON" else None, frost=r == "RELIC", wings="gold" if r == "LEGENDARY" else None)
    elif bid == "ring":
        ring(I, {"COMMON": "iron", "UNCOMMON": "bronze", "RARE": "silver", "EPIC": "silver", "LEGENDARY": "gold", "RELIC": "silver"}[r], t["gem"] or "topaz", big=L)
    elif bid == "amulet":
        amulet(I, t["band"] if r != "COMMON" else "iron", t["gem"] or "topaz", "gem", t["band"] if r != "COMMON" else "iron")
    else:
        return None
    return I.svg(gl, 4 if not L else 5, sp, au)


BASE = ["shaman_sword", "sword", "dagger", "club", "simple_staff", "axe", "mace", "wooden_shield", "iron_shield", "great_sword", "great_axe",
        "war_hammer", "bow", "long_bow", "staff", "arcane_staff", "assassin_hood", "shadow_cloak", "thief_boots", "dark_leather_armor",
        "helmet", "armor", "boots", "ring", "amulet", "bone_staff"]


def shrink(fn, k=.84, dy=0):
    """desenha com fn e reduz o conjunto em torno do centro (para armas grandes caberem no quadro)"""
    def g(I):
        before = len(I.body)
        fn(I)
        parts = I.body[before:]
        del I.body[before:]
        I.body.append(f'<g transform="translate(64 {64+dy}) scale({k}) translate(-64 -64)">' + "".join(parts) + "</g>")
    return g


def U(fn, glow=None, aura=None, sp=0, seed=7, gr=4):
    I = Icon(seed)
    fn(I)
    return I.svg(glow, gr, sparkles(seed, sp) if sp else None, aura)


# ── armaduras do ferreiro (forjadas em Pedra Cobalto): desenho próprio de cada uma ──
MAT.update({
    "ember_plate": ("#8a7a70", "#3b302c", "#140f0c"),
    "penumbra": ("#9a86d0", "#2a2140", "#0d0918"),
    "roots": ("#a8d884", "#4f7a36", "#1a3010"),
    "dawn": ("#ffffff", "#f1e7cc", "#a08a5e"),
})


def forge_armor(I, k):
    B = I.body.append
    if k == "brasa":
        armor(I, "ember_plate", "lava", "plate", "amber", spikes=True)
        for d in ("M44 62 L52 70 L48 80 L56 90", "M84 58 L76 68 L82 78 L74 92", "M60 96 L66 104 L62 110"):
            B(f'<path d="{d}" stroke="#ff7a1a" stroke-width="3.2" fill="none" stroke-linecap="round"/>')
            B(f'<path d="{d}" stroke="#ffe08a" stroke-width="1.2" fill="none" stroke-linecap="round"/>')
        for (x, y, r) in ((30, 22, 2.6), (98, 18, 2.2), (60, 14, 2), (106, 30, 1.8)):
            B(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#ffb04a"/>')
    elif k == "geada":
        armor(I, "ice", "silver", "cloak", "diamond")
        B('<path d="M28 108 L36 98 L44 110 L54 100 L64 112 L74 100 L84 110 L92 98 L100 108" stroke="#f2fbff" stroke-width="3" fill="none" stroke-linejoin="round"/>')
        for (x, y, r) in ((40, 78, 6), (86, 70, 5), (66, 92, 4), (100, 40, 4), (26, 46, 3.5)):
            B(star(x, y, r, "#ffffff"))
    elif k == "penumbra":
        armor(I, "penumbra", "obsidian", "robe", "void")
        for d in ("M30 100 C18 86 30 70 20 58", "M98 100 C110 86 98 72 108 60", "M64 112 C56 120 72 124 64 126"):
            B(f'<path d="{d}" stroke="#b06cff" stroke-width="3.4" fill="none" stroke-linecap="round" opacity=".85"/>')
        B('<path d="M50 64 Q64 56 78 64 Q64 70 50 64Z" fill="#b06cff" opacity=".9"/><circle cx="64" cy="64" r="3" fill="#f0d8ff"/>')
    elif k == "raizes":
        armor(I, "roots", "gold", "leather", "emerald")
        for d in ("M38 40 C50 56 34 70 46 86 C52 96 42 104 46 110", "M90 40 C78 56 94 70 82 86 C76 96 86 104 82 110"):
            B(f'<path d="{d}" stroke="#5a3a1c" stroke-width="4" fill="none" stroke-linecap="round"/>')
            B(f'<path d="{d}" stroke="#8a5a2c" stroke-width="1.6" fill="none" stroke-linecap="round"/>')
        for (x, y, a) in ((44, 58, -30), (84, 60, 30), (48, 96, -20), (80, 98, 20), (64, 30, 0)):
            B(f'<ellipse cx="{x}" cy="{y}" rx="7" ry="3.6" transform="rotate({a} {x} {y})" fill="#8ee06a" stroke="#14301a" stroke-width="1.6"/>')
    elif k == "aurora":
        I.under.append('<circle cx="64" cy="20" r="15" fill="none" stroke="#ffe08a" stroke-width="5" opacity=".95"/>')
        I.under.append('<circle cx="64" cy="20" r="15" fill="none" stroke="#fff6cf" stroke-width="1.6"/>')
        armor(I, "dawn", "gold", "plate", "topaz")
        for a in range(0, 360, 45):
            import math as _m
            x1, y1 = 64 + _m.cos(_m.radians(a)) * 8, 76 + _m.sin(_m.radians(a)) * 8
            x2, y2 = 64 + _m.cos(_m.radians(a)) * 14, 76 + _m.sin(_m.radians(a)) * 14
            B(f'<path d="M{x1:.1f} {y1:.1f} L{x2:.1f} {y2:.1f}" stroke="#f2c14e" stroke-width="2.6" stroke-linecap="round"/>')
        B('<circle cx="64" cy="76" r="7" fill="#ffcf4a" stroke="#0b0d13" stroke-width="2.2"/>')
    elif k == "cobalto":
        armor(I, "cobalt", "silver", "plate", "cobalt", spikes=True)
        for d in ("M46 72 L52 66 L58 72 L52 78Z", "M70 72 L76 66 L82 72 L76 78Z", "M58 92 L64 86 L70 92 L64 98Z"):
            B(f'<path d="{d}" fill="none" stroke="#6ff3ff" stroke-width="2.4"/>')
        B('<path d="M40 104 L88 104" stroke="#6ff3ff" stroke-width="2" stroke-dasharray="3 3"/>')


# ── encomendas especiais do ferreiro (scripts/source/encomendas.js) ──
def enc_icon(I, k):
    B = I.body.append
    if k == "crown":       # Coroa do Abismo: coroa de cobalto escuro com pontas roxas e gema do vazio
        B(f'<path d="M26 92 L22 44 L44 66 L64 30 L84 66 L106 44 L102 92Z" fill="{I.lin(list(MAT["obsidian"]), 0, 0, 0, 1)}" stroke="{OUT}" stroke-width="3.5" stroke-linejoin="round"/>')
        B(f'<rect x="24" y="88" width="80" height="16" rx="3" fill="{I.metal("darksteel", True)}" stroke="{OUT}" stroke-width="3"/>')
        for x in (22, 64, 106):
            B(f'<circle cx="{x}" cy="{44 if x != 64 else 30}" r="5" fill="#c690ff" stroke="{OUT}" stroke-width="2"/>')
        B(gem(I, 64, 70, 9, "void"))
        for x in (40, 88):
            B(gem(I, x, 96, 4.5, "amethyst"))
        B('<path d="M30 104 Q64 116 98 104" stroke="#a855f7" stroke-width="2" fill="none" opacity=".7"/>')
    elif k == "ring":      # Anel do Intocado: aro liso e polido, sem arranhão, com diamante
        ring(I, "gold", "diamond", big=True)
        B('<path d="M40 72 Q46 58 58 54" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/>')
        for (x, y, r) in ((92, 34, 6), (30, 40, 4), (100, 88, 4)):
            B(star(x, y, r, "#fff6cf"))
    elif k == "mantle":    # Manto do Carrasco: capa vermelho-sangue com capuz e machado bordado
        armor(I, "crimson", "darksteel", "cloak", None)
        B(f'<path d="M64 60 L64 104" stroke="{MAT["darksteel"][1]}" stroke-width="4"/>')
        B(f'<path d="M64 64 Q80 66 80 80 Q72 76 64 78Z" fill="{I.metal("steel", True)}" stroke="{OUT}" stroke-width="2"/>')
        B('<path d="M32 108 L40 96 M96 108 L88 96" stroke="#4f0b0b" stroke-width="3"/>')
    elif k == "boots":     # Botas do Peregrino: couro gasto, remendos, asinhas verdes
        boots(I, "leather", "bronze", "boot", "emerald", wings="jade")
        for (x, y) in ((44, 86), (82, 84)):
            B(f'<rect x="{x}" y="{y}" width="9" height="7" fill="{MAT["greenleather"][1]}" stroke="{OUT}" stroke-width="1.6" transform="rotate(-12 {x} {y})"/>')
            B(f'<path d="M{x+1} {y+2} L{x+8} {y+2}" stroke="#e8dcc0" stroke-width="1" stroke-dasharray="1.5 1.5" transform="rotate(-12 {x} {y})"/>')
    elif k == "amulet":    # Amuleto da Origem: medalhão dourado com a brasa da primeira arma
        amulet(I, "gold", "topaz", "ember", "gold")
        B('<circle cx="64" cy="80" r="26" fill="none" stroke="#fde68a" stroke-width="1.6" stroke-dasharray="3 4" opacity=".9"/>')
    elif k == "hammer":    # Martelo do Mestre-Ferreiro: martelo de cobalto e ouro, com runas acesas
        blunt(I, "hammer", "cobalt", "darkwood", "topaz", "#93c5fd", "gold")


# ── Armadura da Lua Rubra (Arqueiro, PixelLab): ō-yoroi vermelha laqueada, amarração preta, kabuto com chifres ──
def rubro_icon(I):
    B = I.body.append
    I.under.append('<circle cx="64" cy="58" r="46" fill="#c42b2b" opacity=".28"/>')
    armor(I, "crimson", "gold", "plate", None)
    for y in (66, 80, 94):
        for x in range(42, 90, 8):
            B(f'<path d="M{x} {y-6} L{x} {y+2}" stroke="#0b0d13" stroke-width="1.6" opacity=".75"/>')
    B('<path d="M50 52 Q64 46 78 52 Q74 64 64 66 Q54 64 50 52Z" fill="#f2e6cf" stroke="#0b0d13" stroke-width="2"/>')
    B('<path d="M58 54 L64 60 L70 54" stroke="#c42b2b" stroke-width="2.4" fill="none"/>')
    B('<path d="M40 22 C30 10 26 4 22 2 C30 12 34 22 44 30Z" fill="#1d1f2d" stroke="#0b0d13" stroke-width="2"/>')
    B('<path d="M88 22 C98 10 102 4 106 2 C98 12 94 22 84 30Z" fill="#1d1f2d" stroke="#0b0d13" stroke-width="2"/>')


UNIQ = {
    # armas
    "bulwark_blade": lambda: U(lambda I: sword(I, "steel", "silver", "leather", "silver", "curved", "sapphire", "sapphire", "#4f8dff", None, None, "broad", 16), "#4f8dff"),
    "colossus_sword": lambda: U(lambda I: greatsword(I, "stone", "stone", "leather", "stone", "bar", None, None, None, None, None, "broad", 22, cracks="#3a362e"), None),
    "dragon_sword": lambda: U(lambda I: sword(I, "crimson", "gold", "cloth_black", "gold", "claws", "topaz", "ruby", None, "#ff8a5a", None, "straight", 13, serr=True), "#ff5a3a"),
    "dragon_slayer": lambda: U(lambda I: greatsword(I, "steel", "gold", "crimson", "gold", "wings", "ruby", "ruby", "#ff6a3a", "#ffcf5a", None, "jagged", 20, serr=False), "#ff7a2a", "#ff7a2a", 5, 11, 5),
    "abyssal_blade": lambda: U(lambda I: greatsword(I, "obsidian", "darksteel", "cloth_black", "darksteel", "claws", "void", "void", None, "#b07aff", "#d6a8ff"), "#8a3cff", "#7a2cff", 4, 12, 5),
    "colossus_hammer": lambda: U(lambda I: blunt(I, "hammer", "stone", "darkwood", "topaz", None, "bronze"), None),
    "molten_greatsword": lambda: U(lambda I: greatsword(I, "lava", "darksteel", "leather", "darksteel", "claws", "amber", None, None, "#ffd36a", None, "broad", 19, cracks="#fff0a0"), "#ff6a1a", "#ff6a1a", 3, 13, 5),
    "frostbite_blade": lambda: U(lambda I: sword(I, "ice", "silver", "cloth_blue", "silver", "curved", "diamond", "diamond", None, "#ffffff", None, "jagged", 13), "#5ad6ff", None, 3, 14),
    "frost_greatsword": lambda: U(lambda I: greatsword(I, "ice", "silver", "cloth_blue", "silver", "wings", "sapphire", "diamond", "#ffffff", "#bff6ff", None, "broad", 20), "#5ad6ff", "#5ad6ff", 4, 15, 5),
    "executioner_cleaver": lambda: U(lambda I: sword(I, "iron", "darksteel", "leather", "darksteel", "bar", None, None, None, "#c83a2a", None, "cleaver", 22), None),
    "merchant_razor": lambda: U(lambda I: razor(I), "#ffcf5a"),
    "hunter_bow": lambda: U(lambda I: bow(I, "wood", "#f0ead8", "bronze", "greenleather", None, True, "emerald", "#3f7f3a"), None),
    "ember_bow": lambda: U(lambda I: bow(I, "darkwood", "#ffd0a0", "bronze", "leather", "#ff9a3a", False, "amber", "#ff7a2a"), "#ff7a2a"),
    "ancient_flame_bow": lambda: U(lambda I: bow(I, "gold", "#fff0c0", "gold", "crimson", "#ffcf5a", True, "ruby", "#ff6a1a", flames=True), "#ffae1e", "#ffae1e", 4, 21, 5),
    "infernal_bow": lambda: U(lambda I: bow(I, "cloth_black", "#ff6a3a", "darksteel", "crimson", "#ff4a2a", False, "ruby", "#ff3a1a", flames=True), "#ff3a1a", "#ff3a1a", 2, 22),
    "glacial_bow": lambda: U(lambda I: bow(I, "ice", "#ffffff", "silver", "cloth_blue", "#ffffff", True, "diamond", "#ffffff"), "#5ad6ff", None, 3, 23),
    "boreal_bow": lambda: U(lambda I: bow(I, "aurora", "#eafff8", "silver", "cloth_blue", "#aaffea", False, "emerald", "#d6fff4"), "#5fd6c4", None, 2, 24),
    "bone_bow": lambda: U(lambda I: bow(I, "bone", "#c8c0a0", "bone", "leather", None, False, "soul", "#8a7a52"), None),
    "ruins_staff": lambda: U(lambda I: staff(I, "stone", "rune", "emerald", "bronze", "#5aff9a", "bronze"), "#3fbf7a"),
    "inferno_staff": lambda: U(lambda I: staff(I, "darkwood", "flame", "ruby", "gold", None, "gold"), "#ff7a2a"),
    "dragon_heart_staff": lambda: U(lambda I: staff(I, "darkwood", "heart", "ruby", "gold", "#ff5a4a", "gold"), "#ff3a3a", "#ff3a3a", 3, 31, 5),
    "staff_frozen_stars": lambda: U(lambda I: staff(I, "ice", "star", "diamond", "silver", "#bff6ff", "silver"), "#5ad6ff", None, 3, 32),
    "winter_staff": lambda: U(lambda I: staff(I, "darkwood", "snowflake", "diamond", "silver", None, "silver"), "#5ad6ff"),
    "comet_staff": lambda: U(lambda I: staff(I, "darkwood", "comet", "sapphire", "silver", None, "silver"), "#4f8dff", None, 3, 33),
    "pyre_staff": lambda: U(lambda I: staff(I, "darkwood", "brazier", "ruby", "bronze", None, "bronze"), "#ff6a1a", None, 2, 34),
    "bone_scepter": lambda: U(lambda I: staff(I, "bone", "skull", "emerald", "bone", None, "bone", .85), None),
    "plague_scepter": lambda: U(lambda I: staff(I, "darkwood", "skull", "soul", "toxic", "#9aff4a", "toxic", .85), "#7fcf2a"),
    "skull_scepter": lambda: U(lambda I: staff(I, "darkwood", "skull", "amethyst", "silver", None, "silver", .85), "#a85cff"),
    "grave_scepter": lambda: U(lambda I: staff(I, "darksteel", "tomb", "soul", "silver", "#5affb0", "silver", .85), "#5affb0", None, 2, 35),
    "soul_reaper": lambda: U(lambda I: scythe(I), "#5affb0", "#3aff9a", 3, 36),
    "shadow_dagger": lambda: U(lambda I: dagger(I, "obsidian", "darksteel", "cloth_black", "darksteel", "curved", "void", None, "#b07aff", None, "curved"), "#7a2cff"),
    "assassin_dagger": lambda: U(lambda I: dagger(I, "darksteel", "crimson", "cloth_black", "darksteel", "bar", "ruby", None, "#ff3a3a", None, "straight", 9), "#c42b2b"),
    "twin_fangs": lambda: U(lambda I: twin(I, blade_mat="bone", guard_mat="darkwood", grip_mat="leather", pom_mat="bone", bkind="fang", gem_g=None), None),
    "frostfang_daggers": lambda: U(lambda I: twin(I, blade_mat="ice", guard_mat="silver", grip_mat="cloth_blue", pom_mat="silver", bkind="fang", gem_g="diamond", glow="#ffffff"), "#5ad6ff", None, 3, 41),
    "boreal_daggers": lambda: U(lambda I: twin(I, blade_mat="aurora", guard_mat="silver", grip_mat="leather", pom_mat="silver", bkind="straight", gem_g="emerald"), "#5fd6c4"),
    "winter_fangs": lambda: U(lambda I: twin(I, blade_mat="ice", guard_mat="silver", grip_mat="cloth_grey", pom_mat="silver", bkind="curved", gem_g="sapphire", glow="#bff6ff"), "#7af6ff", "#5ad6ff", 3, 42),
    "winter_axe": lambda: U(lambda I: axe(I, "ice", "darkwood", False, "sapphire", "#ffffff", None, "silver"), "#5ad6ff"),
    # armas do ferreiro (forjadas em Pedra Cobalto)
    "unique_forge_abyss_crown": lambda: U(lambda I: enc_icon(I, "crown"), "#a855f7", "#7a2cff", 4, 121, 5),
    "unique_forge_untouched_ring": lambda: U(lambda I: enc_icon(I, "ring"), "#fff6cf", "#ffe08a", 5, 122, 5),
    "unique_forge_executioner_mantle": lambda: U(lambda I: enc_icon(I, "mantle"), "#ff3b3b", "#c42b2b", 3, 123, 5),
    "unique_forge_pilgrim_boots": lambda: U(shrink(lambda I: enc_icon(I, "boots"), .9, 2), "#86efac", None, 3, 124, 5),
    "unique_forge_origin_amulet": lambda: U(lambda I: enc_icon(I, "amulet"), "#fcd34d", "#ffae1e", 4, 125, 5),
    "enc_master_hammer": lambda: U(shrink(lambda I: enc_icon(I, "hammer"), .86, 4), "#93c5fd", "#60a5fa", 5, 126, 5),
    "armor_forge_rubro": lambda: U(rubro_icon, "#ff5a4a", "#c42b2b", 4, 131, 5),
    "armor_forge_brasa": lambda: U(lambda I: forge_armor(I, "brasa"), "#ff8a2a", "#ff6a1a", 4, 111, 5),
    "armor_forge_geada": lambda: U(lambda I: forge_armor(I, "geada"), "#bfe8ff", "#8fd8ff", 5, 112, 5),
    "armor_forge_penumbra": lambda: U(lambda I: forge_armor(I, "penumbra"), "#a060ff", "#7a2cff", 3, 113, 5),
    "armor_forge_raizes": lambda: U(lambda I: forge_armor(I, "raizes"), "#d8e870", "#8ee06a", 3, 114, 5),
    "armor_forge_aurora": lambda: U(lambda I: forge_armor(I, "aurora"), "#ffe08a", "#ffcf4a", 5, 115, 5),
    "armor_forge_cobalto": lambda: U(lambda I: forge_armor(I, "cobalto"), "#58e6ff", "#3d6cf0", 4, 116, 5),
    "unique_forge_aegis": lambda: U(lambda I: sword(I, "cobalt", "gold", "cloth_blue", "gold", "wings", "topaz", "diamond", "#ffe9a0", "#ffd36a", None, "broad", 15), "#ffd36a", "#ffcf5a", 4, 101, 5),
    "unique_forge_eclipse": lambda: U(lambda I: sword(I, "darksteel", "gold", "cloth_black", "cobalt", "curved", "onyx", "onyx", "#0b0d13", "#ffcf5a", None, "jagged", 14), "#ffae1e", "#1a1030", 4, 102, 5),
    "unique_forge_shadowfangs": lambda: U(lambda I: twin(I, blade_mat="cobalt", guard_mat="darksteel", grip_mat="cloth_black", pom_mat="darksteel", bkind="fang", gem_g="sapphire", glow="#7ad8ff"), "#38bdf8", "#1f8fd0", 3, 103),
    "unique_forge_starfall": lambda: U(lambda I: bow(I, "cobalt", "#fff0c0", "gold", "cloth_blue", "#ffe9a0", True, "topaz", "#ffd36a"), "#fbbf24", "#ffae1e", 5, 104, 5),
    "unique_forge_cataclysm": lambda: U(shrink(lambda I: axe(I, "cobalt", "darkwood", True, "ruby", "#ff8a5a", None, "darksteel", spike=True), .78, 6), "#ff5a2a", "#ff3a1a", 3, 105, 5),
    "unique_forge_abyss_scepter": lambda: U(shrink(lambda I: staff(I, "darksteel", "crystal", "amethyst", "cobalt", "#c690ff", "cobalt"), .84, 6), "#a855f7", "#7a2cff", 4, 106, 5),
    "unique_forge_brokk": lambda: U(shrink(lambda I: blunt(I, "hammer", "cobalt", "darkwood", "sapphire", "#7ad8ff", "gold"), .86, 4), "#60a5fa", "#3b82f6", 4, 107, 5),
    # escudos
    "spiked_shield": lambda: U(lambda I: shield(I, "iron", "iron", None, "iron", "heater", None, spikes=True)),
    "tower_shield": lambda: U(lambda I: shield(I, "steel", "silver", "cross", "silver", "tower", "sapphire"), "#4f8dff"),
    "dragon_shield": lambda: U(lambda I: shield(I, "crimson", "gold", "dragon", "gold", "heater", None), "#ff5a3a", None, 2, 51),
    # armaduras e acessórios
    "dragon_armor": lambda: U(lambda I: armor(I, "crimson", "bronze", "scale"), "#ff5a3a"),
    "ancient_dragon_armor": lambda: U(lambda I: armor(I, "crimson", "gold", "scale", "ruby", spikes=True), "#ff5a3a", "#ff5a3a", 3, 61),
    "colossus_plate": lambda: U(lambda I: armor(I, "stone", "bronze", "plate", "topaz")),
    "hunter_cloak": lambda: U(lambda I: armor(I, "cloth_green", "bronze", "cloak")),
    "icebound_armor": lambda: U(lambda I: armor(I, "ice", "silver", "plate", "diamond", frost=True), "#5ad6ff", None, 3, 62),
    "hunter_hood": lambda: U(lambda I: helmet(I, "cloth_green", "bronze", "hood", eyes="#ffd36a")),
    "arcanist_hood": lambda: U(lambda I: helmet(I, "cloth_blue", "gold", "hood", "sapphire", eyes="#9cc4ff"), "#4f8dff", None, 3, 63),
    "frozen_helm": lambda: U(lambda I: helmet(I, "ice", "silver", "helm", "diamond", plume="#ffffff", eyes="#7af6ff"), "#5ad6ff"),
    "frost_boots": lambda: U(lambda I: boots(I, "cloth_blue", "silver", "boot", "diamond", frost=True), "#5ad6ff"),
    "ember_amulet": lambda: U(lambda I: amulet(I, "bronze", "amber", "ember", "bronze"), "#ff9a1a"),
    "abyssal_amulet": lambda: U(lambda I: amulet(I, "silver", "void", "eye", "darksteel"), "#7a2cff"),
    "abyssal_core": lambda: U(lambda I: amulet(I, "silver", "void", "core", "silver"), "#8a3cff", "#7a2cff", 4, 71, 6),
    "dragon_heart_amulet": lambda: U(lambda I: heart_item(I, "ruby", "gold", scales=True), "#ff3a3a"),
    "dragon_heart_relic": lambda: U(lambda I: heart_item(I, "ruby", "gold", scales=True, wings="gold"), "#ff4a2a", "#ff4a2a", 5, 72, 6),
    "frozen_heart": lambda: U(lambda I: heart_item(I, "diamond", "silver", snow=True), "#5ad6ff"),
    "heart_of_winter": lambda: U(lambda I: heart_item(I, "diamond", "silver", snow=True, wings="silver", cage="silver"), "#3fe0ff", "#3fe0ff", 5, 73, 6),
    "ancient_core": lambda: U(lambda I: ring(I, "bronze", "amber", True, orb=True), "#ff9a1a"),
    "arcanist_orb": lambda: U(lambda I: ring(I, "silver", "sapphire", True, orb=True), "#4f8dff"),
    "titan_eye": lambda: U(lambda I: ring(I, "gold", "amber", True, eye=True), "#ffae1e", "#ffae1e", 4, 74, 6),
    "bargain_ring": lambda: U(lambda I: ring(I, "gold", "topaz", coin=True), "#ffcf5a"),
    "fury_totem": lambda: U(lambda I: totem(I), "#ff3a1a"),
    # Árvores do Modo Infinito
    "wolf_whistle": lambda: U(lambda I: whistle(I), "#c0e0ff"),
    "sacred_maraca": lambda: U(lambda I: maraca(I), "#ffb04a"),
    "blowgun": lambda: U(lambda I: blowgun(I), "#7fcf2a"),
    "golden_sickle": lambda: U(lambda I: sickle(I), "#ffd36a", None, 3, 91),
    "marrow_staff": lambda: U(lambda I: staff(I, "bone", "skull", "topaz", "bone", None, "bone"), None),
    "crypt_staff": lambda: U(lambda I: staff(I, "darksteel", "skull", "soul", "bone", "#5affb0", "silver"), "#5affb0", None, 2, 92),
    "grim_scythe": lambda: U(lambda I: scythe(I, "cloth_black", "darksteel", "#c690ff"), "#a85cff", "#7a2cff", 3, 93),
    "ancient_flame": lambda: U(lambda I: shard(I, "flame"), "#ff7a2a", None, 2, 81),
    "eternal_ice": lambda: U(lambda I: shard(I, "ice"), "#5ad6ff", None, 2, 82),
    "potion": lambda: U(lambda I: potion(I)),
    # conjuntos
    "wolf_helm": lambda: U(lambda I: helmet(I, "cloth_grey", "silver", "wolf"), "#c8d4e8"),
    "wolf_coat": lambda: U(lambda I: armor(I, "cloth_grey", "silver", "leather"), "#c8d4e8"),
    "wolf_boots": lambda: U(lambda I: boots(I, "cloth_grey", "silver", "boot"), "#c8d4e8"),
    "sun_helm": lambda: U(lambda I: helmet(I, "crimson", "gold", "kabuto"), "#ffd060"),
    "sun_plate": lambda: U(lambda I: armor(I, "crimson", "gold", "plate", emblem="sun"), "#ffd060"),
    "sun_greaves": lambda: U(lambda I: boots(I, "crimson", "gold", "boot"), "#ffd060"),
    "grove_hood": lambda: U(lambda I: helmet(I, "cloth_green", "jade", "leafhood"), "#7ae08a"),
    "grove_mantle": lambda: U(lambda I: armor(I, "cloth_green", "jade", "cloak", "emerald"), "#7ae08a"),
    "grove_boots": lambda: U(lambda I: boots(I, "wood", "jade", "boot"), "#7ae08a"),
    "abyss_hood": lambda: U(lambda I: helmet(I, "cloth_purple", "silver", "hood", "void", eyes="#d6a8ff"), "#a85cff"),
    "abyss_robe": lambda: U(lambda I: armor(I, "cloth_purple", "silver", "robe", "void"), "#a85cff"),
    "abyss_boots": lambda: U(lambda I: boots(I, "cloth_purple", "silver", "boot", "void"), "#a85cff"),
    "cocar_tupa": lambda: U(lambda I: helmet(I, kind="cocar"), "#ff6a3a"),
    "urucum_paint": lambda: U(lambda I: armor(I, kind="paint"), "#ff6a3a"),
    "colar_onca": lambda: U(lambda I: amulet(I, "leather", "amber", teeth=True), "#ff9a1a"),
    "tornozeleira": lambda: U(lambda I: boots(I, kind="anklet"), "#ff9a1a"),
}
# Arsenal do Ferreiro: armas exclusivas de cada herói (scripts/icon_arsenal.py)
from icon_arsenal import build as _ars_build  # noqa
UNIQ.update(_ars_build(U, shrink))
CRYS = {"icon-crys-forest": "emerald", "icon-crys-ruins": "topaz", "icon-crys-catacombs": "amethyst", "icon-crys-glacial": "diamond",
        "icon-crys-bosque": "soul", "icon-crys-rio": "sapphire", "icon-crys-morta": "void", "icon-crys-fortress": "ruby"}
for k, g in CRYS.items():
    UNIQ[k] = (lambda g=g: U(lambda I: crystal(I, g), GEM[g][1], GEM[g][1], 3, hash(g) & 0xff))


def all_svgs():
    out = {}
    for b in BASE:
        for r in RAR:
            s = gen_base(b, r)
            if s:
                out[f"{b}@{r}"] = s
    for k, f in UNIQ.items():
        out[k] = f()
    return out


def main():
    from playwright.sync_api import sync_playwright
    from PIL import Image
    import io
    svgs = all_svgs()
    keys = sorted(svgs)
    imgs = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={"width": SZ, "height": SZ}, device_scale_factor=1)
        for k in keys:
            s = svgs[k].replace('width="128" height="128"', f'width="{SZ}" height="{SZ}"', 1)
            pg.set_content(f'<html><body style="margin:0;background:transparent">{s}</body></html>')
            imgs[k] = Image.open(io.BytesIO(pg.screenshot(omit_background=True))).convert("RGBA")
        b.close()
    cols = 20
    rows = (len(keys) + cols - 1) // cols
    sheet = Image.new("RGBA", (cols * SZ, rows * SZ), (0, 0, 0, 0))
    frames = {}
    for n, k in enumerate(keys):
        x, y = (n % cols) * SZ, (n // cols) * SZ
        sheet.alpha_composite(imgs[k], (x, y))
        frames[k] = {"frame": {"x": x, "y": y, "w": SZ, "h": SZ}, "rotated": False, "trimmed": False,
                     "spriteSourceSize": {"x": 0, "y": 0, "w": SZ, "h": SZ}, "sourceSize": {"w": SZ, "h": SZ}}
    os.makedirs(OUTDIR, exist_ok=True)
    sheet.save(os.path.join(OUTDIR, "items.png"), optimize=True)
    meta = {"frames": frames, "meta": {"image": "items.png", "size": {"w": sheet.width, "h": sheet.height}, "scale": "1"}}
    json.dump(meta, open(os.path.join(OUTDIR, "items.json"), "w"), separators=(",", ":"))
    if os.path.isdir(os.path.dirname(MIRROR)):
        os.makedirs(MIRROR, exist_ok=True)
        for f in ("items.png", "items.json"):
            open(os.path.join(MIRROR, f), "wb").write(open(os.path.join(OUTDIR, f), "rb").read())
    print(len(keys), "ícones;", os.path.getsize(os.path.join(OUTDIR, "items.png")) // 1024, "KB")
    if "--sheet" in sys.argv:
        dst = sys.argv[sys.argv.index("--sheet") + 1]
        big = Image.new("RGBA", (cols * (SZ + 8) + 8, rows * (SZ + 8) + 8), (24, 26, 34, 255))
        for n, k in enumerate(keys):
            big.alpha_composite(imgs[k], (8 + (n % cols) * (SZ + 8), 8 + (n // cols) * (SZ + 8)))
        big.save(dst)


if __name__ == "__main__":
    main()
