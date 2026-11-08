"""Imagens-chave dos vídeos no estilo gravura/serigrafia antiga (Gemini, modelo de imagem).

Cada cena vira uma imagem 16:9 em art-src/video-keyframes/<nome>.png; scripts/build_engraving_videos.py anima.
As imagens de referência de estilo (os prints que definem o visual) ficam fora do repositório: passe a pasta em
STYLE_REFS (padrão /tmp/dg/style-refs). Só gera as cenas que ainda não existem (--force refaz; nomes limitam).

Uso (a chave nunca é gravada em arquivo):
    GEMINI_API_KEY=... STYLE_REFS=<pasta com .jpg/.png> python3 scripts/build_engraving_keyframes.py [cena ...] [--force]
"""
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "art-src", "video-keyframes")
MODEL = os.environ.get("IMG_MODEL", "gemini-3-pro-image")

STYLE = ("Use exactly the art style of the reference images: vintage mid-century pulp illustration printed as a worn screen "
         "print and woodcut engraving, bold black ink outlines, all shading with dense parallel hatching and cross-hatching, "
         "strictly limited palette of deep black, muted teal-green, dusty rose-salmon, warm peach-orange highlights and cream, "
         "coarse fabric/paper texture and fine grain, slight ink misregistration, moody dusk light. Absolutely no text, no letters, "
         "no logos, no signature, no border. Wide 16:9 composition, full bleed.")

SCENES = {
    # campanha 1: a floresta mais antiga que os nomes
    "c1-floresta": "A forest older than names: towering moss-covered trees, shafts of pale light through mist, fallen stone "
                   "arches swallowed by roots, a standing stone carved with runes in the middle distance.",
    # campanha 2: a porta sob as raízes e o céu
    "c2-porta": "At the base of a colossal ancient tree, a stone doorway carved with runes is sunk between enormous roots, "
                "worn stairs descending into total darkness. Faint warm peach light glows from the runes. Night, deep shadows.",
    "c2-ceu": "Stormy night sky over the dark silhouette of a forest canopy at the bottom of the frame. A large full moon in the "
              "upper right third, surrounded by swirling engraved clouds. Empty sky, no creatures.",
    "c2-dragao": "A single huge winged dragon in pure solid black silhouette, wings fully spread, seen from below while gliding "
                 "to the left, isolated and centered on a plain flat cream background. Only the black shape, nothing else.",
    # campanha 3: heróis de eras diferentes atravessando a ponte (referência extra: retratos dos heróis)
    "c3-ponte": "Wide side view of an old mossy stone arch bridge over a misty gorge in a forest. Nine travelers walk across it "
                "in a single line from left to right, small in the frame, matching the character portraits given: a knight in "
                "full plate with white fur collar, a samurai in navy armor with red face mask, a young samurai archer in green "
                "and white armor with crested helmet, a hunter in a conical straw hat with orange fur collar, an old druid in a "
                "green antlered hood, a pale necromancer in a black hood, a woman in a dark navy hood, a woman in a purple hood "
                "and face mask, an Amazonian woman with a black ponytail and red face paint. Above them the sky is cracked like "
                "broken glass, with fragments of other skies showing through the cracks.",
    # campanha 4: onde a luz ainda toca o chão
    "c4-entrada": "Seen from above and behind, a square stone stairwell opening in the forest floor, its steps going DOWN into "
                  "the ground and disappearing into pitch black darkness at the bottom. Roots and ferns frame the opening, the "
                  "last golden rays of sunset light only the first steps at the top.",
    "c4-corredor": "A long underground stone corridor of repeating arches receding to a dark vanishing point in the center. "
                   "Torches with small peach-orange flames burn on the walls on both sides. Cracked flagstones, cold and silent.",
    # menu: salão com o portal
    "menu-portal": "Symmetrical view of a stone dungeon hall. At the far end, centered, a tall arched gate carved with runes "
                   "holds a round swirling portal of teal and salmon energy. One torch burning on each side wall. Dust in the air.",
    # modo infinito
    "inf-corredor": "Symmetrical one-point perspective of an endless underground crypt corridor, arches repeating into a black "
                    "vanishing point exactly in the center. Torches with peach flames on both walls, skulls and bones in wall "
                    "niches, cracked floor.",
}


def gen(key, prompt, refs):
    parts = [{"inline_data": {"mime_type": "image/jpeg" if r.endswith("jpg") else "image/png",
                              "data": base64.b64encode(open(r, "rb").read()).decode()}} for r in refs]
    parts.append({"text": STYLE + " Scene: " + prompt})
    body = {"contents": [{"parts": parts}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "16:9"}}}
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={key}"
    for attempt in range(5):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(url, data=json.dumps(body).encode(),
                                                                         headers={"Content-Type": "application/json"}), timeout=180).read())
            for p in d["candidates"][0]["content"]["parts"]:
                if "inlineData" in p:
                    return base64.b64decode(p["inlineData"]["data"])
            raise RuntimeError("sem imagem na resposta")
        except urllib.error.HTTPError as e:
            if e.code != 429 and e.code < 500:
                raise RuntimeError(f"HTTP {e.code}: {e.read()[:200]!r}")
            time.sleep(20 * (attempt + 1))
        except RuntimeError:
            time.sleep(5)
    raise RuntimeError("falhou depois de 5 tentativas")


def main():
    key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not key:
        raise SystemExit("defina GEMINI_API_KEY")
    rd = os.environ.get("STYLE_REFS", "/tmp/dg/style-refs")
    refs = sorted(os.path.join(rd, f) for f in os.listdir(rd) if f.lower().endswith((".jpg", ".png")))
    heroes = os.path.join(ROOT, "art-src", "video-keyframes", "ref-herois.png")   # retratos lado a lado
    names = [a for a in sys.argv[1:] if not a.startswith("--")] or list(SCENES)
    os.makedirs(OUT, exist_ok=True)
    for n in names:
        f = os.path.join(OUT, n + ".png")
        if os.path.isfile(f) and "--force" not in sys.argv:
            continue
        open(f, "wb").write(gen(key, SCENES[n], refs + ([heroes] if n.startswith(("c3", "h-", "intro")) else [])))
        print("ok", n, flush=True)


if __name__ == "__main__":
    main()
