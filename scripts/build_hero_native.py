"""
Vozes dos heróis na língua de cada um (Edge TTS, gratuito): lê scripts/hero_native_lines.json e grava
  assets/audio/voice/nat/<id>-<CLASSE>.mp3
  assets/audio/voice/voice-native.json   {k: {hash do texto exibido (pt/en/es) -> id}, d: {id: {CLASSE: duração}}}
O jogo continua mostrando a legenda no idioma escolhido; a voz do herói sai na língua dele.
Só gera o que mudou (assinatura por texto+voz). Precisa de rede (usa o proxy do ambiente se houver).
Uso: python3 scripts/build_hero_native.py
"""
import asyncio
import hashlib
import json
import os
import shutil
import subprocess
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "scripts", "hero_native_lines.json")
BUNDLE = os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js")
OUT = os.path.join(ROOT, "assets", "audio", "voice", "nat")
MAN = os.path.join(ROOT, "assets", "audio", "voice", "voice-native.json")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice")


def norm(t):
    return " ".join(t.split()).strip()


def fnv(text):
    h = 0x811C9DC5
    b = text.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"


async def tts_phrased(text, v, path):
    """frase a frase, cada pedaço com tom próprio: sobe no começo, desce no fim, pergunta sobe, reticências alongam
    (a voz não conhece a língua; assim a entonação deixa de soar robótica)"""
    import re
    raw = [x.strip() for x in re.split(r"(?<=[…,.!?—،؟؛;])\s+|(?<=[。！？…])(?=[^！？…」』])", text) if x.strip()]
    parts = []
    for x in raw:   # pedaço só de pontuação ("…") gruda no seguinte; pedaço curtinho gruda no anterior
        if parts and not re.search(r"\w", parts[-1]):
            parts[-1] += x
        elif parts and len(re.sub(r"\W", "", x)) < 2:
            parts[-1] += x
        else:
            parts.append(x)
    fs = []
    for j, pt in enumerate(parts):
        q, ex, first, last = pt.rstrip("»”」").endswith(("?", "؟", "？", ";")), pt.rstrip("»”」").endswith(("!", "！")) and not pt.rstrip("»”」").endswith(("？！", "?!")), j == 0, j == len(parts) - 1
        pitch = "+6Hz" if q else "+4Hz" if ex else "+3Hz" if first else "-2Hz" if last else "+1Hz"
        rate = "-6%" if pt.endswith("…") else "+4%" if ex else "+0%"
        f = f"{path}.{j}.mp3"
        await tts(pt, dict(v, rate=rate, pitch=pitch, phrased=False), f)
        fs.append(f)
    lst = path + ".txt"
    open(lst, "w").write("\n".join(f"file '{x}'" for x in fs))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c:a", "libmp3lame", "-b:a", "64k", path], check=True)


async def tts(text, v, path):
    import edge_tts
    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy") or None
    for k in range(4):
        try:
            c = edge_tts.Communicate(text, v["voice"], rate=v.get("rate", "+0%"), pitch=v.get("pitch", "+0Hz"), proxy=proxy)
            await c.save(path)
            if os.path.getsize(path) > 1000:
                return
        except Exception as e:  # rede instável: tenta de novo
            err = e
        await asyncio.sleep(1.5 * (k + 1))
    raise RuntimeError(f"edge-tts falhou: {text[:40]}")


def finish(raw, out):
    """volume parecido com o resto da dublagem, um respiro no começo e no fim"""
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af",
                    "adelay=120:all=1,apad=pad_dur=0.25,loudnorm=I=-17:TP=-1.5:LRA=9,highpass=f=70",
                    "-ac", "1", "-ar", "24000", "-b:a", "56k", out], check=True)
    d = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", out],
                       capture_output=True, text=True).stdout.strip()
    return round(float(d), 2)


def main():
    cfg = json.load(open(SRC, encoding="utf-8"))
    V = cfg["voices"]
    en_fix = {}
    try:
        en_fix = json.load(open(os.path.join(ROOT, "scripts", "en_dialogue.json"), encoding="utf-8"))
    except Exception:
        pass
    FIX, ADD = en_fix.get("fix", {}), en_fix.get("add", {})
    bundle = open(BUNDLE, encoding="utf-8").read()
    jobs = []   # (id, classe, texto nativo, textos exibidos)
    for g in cfg["generic"]:
        pt = norm(g["pt"])
        hid = fnv(pt)
        shown = {pt, norm(g.get("en", "")), norm(g.get("es", ""))}
        e = norm(g.get("en", ""))
        e and shown.add(norm(FIX.get(e, e)))
        if pt not in bundle:
            print("aviso: texto não encontrado no jogo:", pt[:60])
        for cls, v in V.items():
            nat = (v.get("natkey") and g.get(v["natkey"])) or g.get(v["lang"] + "_tts") or (g.get(v["lang"]) if v["lang"] != "en" else g.get("en"))
            nat and jobs.append((hid, cls, nat, shown))
    for cls, rows in cfg["own"].items():
        for row in rows:
            if isinstance(row, dict):
                pt, nat = row["pt"], row.get("tts") or row["nat"]
                shown = {norm(row["pt"]), norm(row.get("en", "")), norm(row.get("es", ""))}
            else:
                pt, nat = row[0], (row[2] if len(row) > 2 else row[1])
                shown = {norm(pt)}
            pt = norm(pt)
            hid = fnv(pt)
            jobs.append((hid, cls, nat, shown))
    # o inglês que o jogo mostra para as falas próprias vem do manifesto principal (mesmo id)
    main = json.load(open(os.path.join(ROOT, "assets", "audio", "voice", "voice-manifest.json")))
    os.makedirs(OUT, exist_ok=True)
    old = json.load(open(MAN)) if os.path.exists(MAN) else {}
    man = {"k": {}, "d": {}, "s": {}}
    own_ids = {fnv(norm(r["pt"] if isinstance(r, dict) else r[0])) for rows in cfg["own"].values() for r in rows}
    for k, hid in main["k"].items():
        if hid in own_ids:
            man["k"][k] = hid
    todo = []
    for hid, cls, nat, shown in jobs:
        for t in shown:
            t and man["k"].setdefault(fnv(t), hid)
        v = V[cls]
        sig = hashlib.md5(json.dumps([nat, v], ensure_ascii=False).encode()).hexdigest()[:10]
        f = os.path.join(OUT, f"{hid}-{cls}.mp3")
        man["d"].setdefault(hid, {})
        man["s"].setdefault(hid, {})
        if old.get("s", {}).get(hid, {}).get(cls) == sig and os.path.exists(f):
            man["d"][hid][cls] = old["d"][hid][cls]
            man["s"][hid][cls] = sig
            continue
        todo.append((hid, cls, nat, v, f, sig))
    print(len(jobs), "falas;", len(todo), "para gerar")

    async def run():
        sem = asyncio.Semaphore(4)

        async def one(job):
            hid, cls, nat, v, f, sig = job
            async with sem:
                with tempfile.TemporaryDirectory() as td:
                    raw = os.path.join(td, "r.mp3")
                    try:
                        await (tts_phrased if v.get("phrased") else tts)(nat, v, raw)
                    except Exception:   # se o corte por frases falhar, gera a fala inteira de uma vez
                        await tts(nat, dict(v, phrased=False), raw)
                    man["d"][hid][cls] = finish(raw, f)
                    man["s"][hid][cls] = sig
                    print(f"  {cls:12s} {man['d'][hid][cls]:4.1f}s  {nat[:50]}")
        await asyncio.gather(*[one(j) for j in todo])
    asyncio.run(run())
    keep = {f"{h}-{c}.mp3" for h, cc in man["d"].items() for c in cc}
    for g in os.listdir(OUT):
        g in keep or os.remove(os.path.join(OUT, g))
    json.dump(man, open(MAN, "w"), ensure_ascii=False, separators=(",", ":"))
    if os.path.isdir(os.path.dirname(MIRROR)):
        shutil.rmtree(os.path.join(MIRROR, "nat"), ignore_errors=True)
        shutil.copytree(OUT, os.path.join(MIRROR, "nat"))
        shutil.copy(MAN, os.path.join(MIRROR, "voice-native.json"))
    size = sum(os.path.getsize(os.path.join(OUT, g)) for g in os.listdir(OUT))
    print("vozes nativas:", len(keep), "arquivos,", size // 1024, "KB")


if __name__ == "__main__":
    main()
