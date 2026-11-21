#!/usr/bin/env python3
"""Sons ambientes por bioma (p216.81) — ElevenLabs Sound Effects (eleven_text_to_sound_v2).
Para cada bioma: um FUNDO em laço sem emenda (loop=true, ~22 s) e alguns EVENTOS curtos que o jogo toca de vez em
quando, em posições diferentes do estéreo (scripts/source/ambiente-sons.js).
Saída: assets/audio/ambient/bioma/<bioma>-bed.mp3 e <bioma>-e<n>.mp3. A chave vem de ELEVENLABS_API_KEY (.env) e
precisa da permissão "Sound Effects". Uso: python3 scripts/gerar_ambientes_elevenlabs.py [bioma…]  (pula o que já existe)"""
import json, os, sys, time, urllib.request, urllib.error
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets/audio/ambient/bioma")
NO = " No music, no voices, no melody."
B = {
    "forest": ("Peaceful daytime fantasy forest ambience: gentle breeze rustling leaves, many distant songbirds chirping, a small stream far away.",
               ["A songbird singing a short melodic call nearby in a forest", "A woodpecker pecking on a tree trunk in a forest", "Leaves and branches rustling as a small animal runs through bushes", "A cuckoo bird calling twice in the distance"]),
    "catacombs": ("Dark underground catacombs ambience: hollow wind howling through stone tunnels, deep low mysterious drone, distant echoing water drips.",
                  ["A single water drop falling into a puddle with a long cave echo", "A gust of cold wind whistling through a narrow stone tunnel", "Distant heavy stone grinding and settling in an underground crypt, echo", "Rats squeaking and scurrying in a dark tunnel", "Faint eerie ghostly whisper echoing far away in a crypt"]),
    "ruins": ("Ancient overgrown ruins ambience: warm wind over old stone, insects buzzing softly, distant birds, leaves rustling.",
              ["Small pebbles and dust falling from an old stone wall", "A hawk screeching high in the sky", "Old stone column cracking softly", "Cicadas buzzing for a few seconds"]),
    "temple": ("Volcanic fire temple ambience: deep earth rumble, lava slowly bubbling, fire crackling, hot air hissing in a stone hall.",
               ["Thick lava bubble popping", "Hot steam hissing out of a crack in stone", "Distant deep rumble of the earth shaking", "Fire flaring up with a whoosh"]),
    "frozen": ("Frozen ice caverns ambience: cold howling wind, snow blowing, faint crystalline ice tones, deep hollow cold air.",
               ["Ice cracking and creaking loudly", "Strong icy wind gust howling", "Small icicles falling and shattering on ice", "Glassy crystal ice resonance chiming softly"]),
    "fortress": ("Dragon fortress ambience: low fiery rumble, embers crackling, hot wind through a stone fortress, distant heavy chains.",
                 ["A huge dragon roaring far away, echoing", "Heavy iron chains rattling and clanking", "A burst of fire roaring briefly", "Metal armor clanking far away in a stone hall"]),
    "bosque": ("Dense Amazon rainforest ambience: tropical birds, insects, frogs, humid jungle, distant howler monkeys.",
               ["A toucan calling in the rainforest", "A macaw parrot squawking", "Howler monkeys calling in the distance", "Tree frogs croaking for a few seconds"]),
    "rio": ("River in a forest ambience: steady flowing river water, gentle current over rocks, birds by the riverbank, light breeze.",
            ["A fish splashing out of the river water", "A heron calling over a river", "A frog croaking by the water", "Water lapping against wooden planks"]),
    "morta": ("Dark dead forest ambience at dusk: cold wind through bare dead trees, creaking branches, distant crows, ominous low atmosphere.",
              ["Several crows cawing loudly", "An owl hooting twice in a dark forest", "A dry dead branch cracking and snapping", "A lone wolf howling far away", "Old dead tree creaking slowly in the wind"]),
    "graveyard": ("Haunted graveyard at night ambience: soft eerie wind, crickets, distant creaking iron gate, misty spooky atmosphere.",
                  ["Distant church bell tolling once at night", "A rusty iron gate creaking slowly", "A crow cawing in a graveyard at night", "Low ghostly moan echoing in the mist", "An owl hooting at night"]),
    "vulcao": ("Active volcano ambience: deep constant rumble, lava flowing, rocks crackling with heat, hot wind.",
               ["Distant volcanic eruption boom", "Rocks tumbling down a slope", "Lava splashing and bubbling", "Ground shaking rumble for a few seconds"]),
    "castle": ("Ancient dark castle ambience: hollow wind through a huge stone hall, distant echoes, faint thunder outside, cold and mysterious.",
               ["A heavy wooden door creaking open far away, echo", "Distant thunder rumbling outside a castle", "Footsteps echoing in a distant stone corridor", "A torch fire crackling and flickering"]),
    "hub": ("Cozy medieval village refuge at night ambience: campfire crackling, crickets chirping, gentle breeze, peaceful and safe.",
            ["A dog barking twice in the distance", "Wind chimes tinkling softly", "An owl hooting softly at night", "Logs crackling and popping in a campfire"]),
}
K = next((l.split("=", 1)[1].strip().strip('"') for l in open(os.path.join(ROOT, ".env")) if l.startswith("ELEVENLABS_API_KEY=")), None)
def sfx(text, out, dur=None, loop=False, inf=.45):
    body = {"text": text + NO, "model_id": "eleven_text_to_sound_v2", "loop": loop, "prompt_influence": inf}
    if dur: body["duration_seconds"] = dur
    for t in range(4):
        try:
            r = urllib.request.Request("https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_96", data=json.dumps(body).encode(), headers={"xi-api-key": K, "Content-Type": "application/json"})
            with urllib.request.urlopen(r, timeout=240) as f: open(out, "wb").write(f.read()); return True
        except urllib.error.HTTPError as e:
            msg = e.read()[:300]
            if e.code in (429, 500, 502, 503) and t < 3: time.sleep(8 * (t + 1)); continue
            raise SystemExit(f"HTTP {e.code}: {msg}")
os.makedirs(OUT, exist_ok=True)
man = {}
for b, (bed, evs) in B.items():
    if len(sys.argv) > 1 and b not in sys.argv[1:]: man[b] = len(evs); continue
    f = os.path.join(OUT, f"{b}-bed.mp3")
    os.path.exists(f) or (sfx(bed, f, 22, True) and print("fundo", b, flush=True))
    for i, e in enumerate(evs):
        f = os.path.join(OUT, f"{b}-e{i}.mp3")
        os.path.exists(f) or (sfx(e, f, None, False, .55) and print("evento", b, i, flush=True))
    man[b] = len(evs)
json.dump(man, open(os.path.join(OUT, "manifest.json"), "w"))
print("ok", man)
