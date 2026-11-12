"""
Regrava em português do Brasil, no ElevenLabs, as falas da lista scripts/dublagem_a_corrigir.json.
Mesmo jeito econômico do regravar_dublagem_ptbr.py: UMA chamada por fala, repete só uma vez em erro
passageiro (429 / 5xx / rede), pula o que já foi regravado e atualiza o voice-manifest.json.

A chave vem de ELEVENLABS_API_KEY (ambiente, .env da raiz ou scripts/.api_key_eleven.txt). Fica fora do git.

Elenco: scripts/elevenlabs_elenco.json liga cada herói (classe: WARRIOR, MAGE...) ou, nas falas sem herói,
a voz Gemini atual (Aoede, Charon...) a uma voz brasileira do ElevenLabs. "_modelo" define o modelo padrão.

Passo a passo:
  1) python3 scripts/regravar_dublagem_elevenlabs.py vozes [masculino|feminino] [palavra]
       lista vozes da biblioteca com sotaque brasileiro (id, nome, descrição)
  2) python3 scripts/regravar_dublagem_elevenlabs.py adicionar <public_owner_id> <voice_id> <nome>
       coloca a voz em "My Voices" (o ElevenLabs só gera com vozes adicionadas)
  3) python3 scripts/regravar_dublagem_elevenlabs.py amostra <voice_id> "texto"   → scripts/amostras_eleven/
  4) preencha scripts/elevenlabs_elenco.json
  5) python3 scripts/regravar_dublagem_elevenlabs.py                → só o plano
     python3 scripts/regravar_dublagem_elevenlabs.py --executar --limite 10
     python3 scripts/regravar_dublagem_elevenlabs.py --executar
  lista completa por partes: --lista scripts/dublagem_refazer.json --parte 1 [--personagem WARRIOR]
  opções: --modelo eleven_v3 (padrão: "_modelo" do elenco) · --refazer · --so pt/arquivo.mp3
Depois: python3 scripts/build_asset_versions.py
"""
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = os.path.join(ROOT, "assets", "audio", "voice")
MAN = os.path.join(VOICE, "voice-manifest.json")
LIST = os.path.join(ROOT, "scripts", "dublagem_a_corrigir.json")
CAST = os.path.join(ROOT, "scripts", "elevenlabs_elenco.json")
REPORT = os.path.join(ROOT, "scripts", "dublagem_regravada.json")
SAMPLES = os.path.join(ROOT, "scripts", "amostras_eleven")
API = "https://api.elevenlabs.io"
SETTINGS = {"stability": 0.5, "similarity_boost": 0.8, "style": 0.0, "use_speaker_boost": True}


def arg(name, default=None):
    a = sys.argv
    return a[a.index(name) + 1] if name in a and a.index(name) + 1 < len(a) else default


def api_key():
    k = os.environ.get("ELEVENLABS_API_KEY", "").strip()
    if k:
        return k
    for f in (os.path.join(ROOT, ".env"), os.path.join(ROOT, "scripts", ".api_key_eleven.txt")):
        if os.path.isfile(f):
            for line in open(f, encoding="utf-8").read().splitlines():
                line = line.strip()
                if line.startswith("ELEVENLABS_API_KEY="):
                    return line.split("=", 1)[1].strip().strip("\"'")
                if line.startswith("sk_"):
                    return line
    raise SystemExit("defina ELEVENLABS_API_KEY (ou coloque no .env)")


def req(key, method, path, body=None, raw=False):
    data = json.dumps(body).encode() if body is not None else None
    for attempt in (1, 2):
        r = urllib.request.Request(API + path, data=data, method=method,
                                   headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "*/*"})
        try:
            with urllib.request.urlopen(r, timeout=120) as resp:
                out = resp.read()
            return out if raw else json.loads(out.decode() or "{}")
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="ignore")[:400]
            if e.code in (429, 500, 502, 503, 504) and attempt == 1:
                time.sleep(20 if e.code == 429 else 5)
                continue
            raise RuntimeError(f"HTTP {e.code}: {msg}")
        except (urllib.error.URLError, TimeoutError) as e:
            if attempt == 1:
                time.sleep(5)
                continue
            raise RuntimeError(str(e))


def tts(key, voice_id, text, model, lang=True):
    body = {"text": text, "model_id": model, "voice_settings": SETTINGS}
    if lang:
        body["language_code"] = "pt"
    try:
        return req(key, "POST", f"/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128", body, raw=True)
    except RuntimeError as e:
        if lang and "HTTP 400" in str(e) and "language" in str(e).lower():
            return tts(key, voice_id, text, model, lang=False)
        raise


def save_mp3(mp3, path):
    """corta silêncio do começo/fim e grava em 128k; devolve a duração."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "pipe:0",
                    "-af", "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse",
                    "-b:a", "128k", "-ar", "24000", "-ac", "1", path], input=mp3, check=True)
    r = subprocess.run(["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", path],
                       capture_output=True, text=True)
    return round(float(r.stdout.strip() or 0), 2)


def clean(text):
    return " ".join(text.replace("“", "").replace("”", "").split()).strip().strip('"')


def cmd_vozes(key):
    rest = [a for a in sys.argv[2:] if not a.startswith("--")]
    q = {"page_size": "40", "language": "pt", "accent": "brazilian"}
    for a in rest:
        if a in ("masculino", "male"):
            q["gender"] = "male"
        elif a in ("feminino", "female"):
            q["gender"] = "female"
        else:
            q["search"] = a
    d = req(key, "GET", "/v1/shared-voices?" + urllib.parse.urlencode(q))
    for v in d.get("voices", []):
        print(f"{v.get('voice_id')}  dono={v.get('public_owner_id')}  {v.get('gender','?'):6s} {v.get('age','?'):11s} "
              f"{v.get('name','')} — {(v.get('description') or '')[:90]}")
        if v.get("preview_url"):
            print(f"      prévia: {v['preview_url']}")


def cmd_adicionar(key):
    owner, vid, name = sys.argv[2], sys.argv[3], " ".join(sys.argv[4:]) or "depthgate"
    d = req(key, "POST", f"/v1/voices/add/{owner}/{vid}", {"new_name": name})
    print("adicionada:", d)


def cmd_amostra(key):
    vid, text = sys.argv[2], sys.argv[3]
    model = arg("--modelo", "eleven_v4")
    out = os.path.join(SAMPLES, f"{vid}.mp3")
    print(out, save_mp3(tts(key, vid, clean(text), model), out), "s")


def main():
    if len(sys.argv) > 1 and sys.argv[1] in ("vozes", "adicionar", "amostra"):
        return {"vozes": cmd_vozes, "adicionar": cmd_adicionar, "amostra": cmd_amostra}[sys.argv[1]](api_key())
    jobs = json.load(open(arg("--lista", LIST), encoding="utf-8"))["jobs"]
    if arg("--parte"):
        jobs = [j for j in jobs if str(j.get("parte")) == arg("--parte")]
    if arg("--personagem"):
        jobs = [j for j in jobs if (j["cls"] or j["voice"]) == arg("--personagem")]
    man = json.load(open(MAN, encoding="utf-8"))
    cast = json.load(open(CAST, encoding="utf-8")) if os.path.isfile(CAST) else {}
    only = arg("--so")
    if only:
        jobs = [j for j in jobs if j["out"] == only]
    redo = "--refazer" in sys.argv
    todo = [j for j in jobs if redo or not man["d"].get(j["id"], {}).get("el", {}).get(j["cls"] or "_")]
    done_before = len(jobs) - len(todo)
    pick = lambda j: cast.get(j["cls"] or "") or cast.get(j["voice"])
    missing = sorted({j["cls"] or j["voice"] for j in todo if not pick(j)})
    lim = arg("--limite")
    if lim:
        todo = todo[:int(lim)]
    model = arg("--modelo", cast.get("_modelo", "eleven_v3"))
    chars = sum(len(clean(j["text"])) for j in todo)
    print(f"{len(todo)} falas ({done_before} já feitas) · modelo {model} · {chars} caracteres · no máximo {len(todo)} chamadas")
    if missing:
        print("Vozes Gemini ainda sem par no elenco (scripts/elevenlabs_elenco.json):", ", ".join(missing))
    if "--executar" not in sys.argv:
        for j in todo:
            print(f"  {j['out']:34s} {j['voice']:13s} → {(pick(j) or '???')[:22]:22s} {j['text'][:60]}")
        print("\nNada foi gravado. Rode com --executar para gravar.")
        return
    if missing:
        raise SystemExit("Complete o elenco antes de gravar.")
    key = api_key()
    rep = json.load(open(REPORT, encoding="utf-8")) if os.path.isfile(REPORT) else {}
    ok = fail = 0
    for n, j in enumerate(todo, 1):
        text = clean(j["text"])
        try:
            mp3 = tts(key, pick(j), text, model)
        except Exception as e:
            fail += 1
            print(f"[{n}/{len(todo)}] ERRO {j['out']}: {e}")
            if any(s in str(e) for s in ("HTTP 401", "quota_exceeded", "HTTP 402", "payment")):
                print("Parando: chave inválida ou créditos acabaram.")
                break
            continue
        out = os.path.join(VOICE, j["out"])
        dur = save_mp3(mp3, out)
        d = man["d"].setdefault(j["id"], {})
        if j["cls"]:
            d.setdefault("byClass", {}).setdefault("pt", {})[j["cls"]] = dur
            if j.get("also_generic"):
                subprocess.run(["cp", out, os.path.join(VOICE, "pt", j["id"] + ".mp3")], check=True)
                d["pt"] = dur
        else:
            d["pt"] = dur
        d.setdefault("el", {})[j["cls"] or "_"] = 1
        json.dump(man, open(MAN, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        exp = len(text) / 13 + 1.2
        warn = f"longo ({dur}s, esperado ~{exp:.1f}s)" if dur > max(3.5, exp * 2.1) else ""
        rep[j["out"]] = {"voz": j["voice"], "eleven": pick(j), "dur": dur, "aviso": warn, "modelo": model}
        json.dump(rep, open(REPORT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        ok += 1
        print(f"[{n}/{len(todo)}] ok {j['out']} · {dur}s{' · CONFERIR: ' + warn if warn else ''}", flush=True)
        time.sleep(0.5)
    print(f"\nPronto: {ok} gravadas, {fail} com erro. Relatório: scripts/dublagem_regravada.json")
    print("Agora rode: python3 scripts/build_asset_versions.py")


if __name__ == "__main__":
    main()
