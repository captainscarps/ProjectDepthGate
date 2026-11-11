"""
Regrava em português do Brasil, no Gemini TTS, as falas da lista scripts/dublagem_a_corrigir.json
(tom fora do padrão do personagem, dublador diferente, fala de herói com voz genérica).

Econômico de propósito:
  - UMA chamada por fala. Só repete (uma vez) se a API devolver erro passageiro (429 / 5xx / rede).
  - Nenhuma "tirada" extra por tom: o áudio que vier é o que fica. O script só AVISA quando o resultado
    parece suspeito (duração muito longa ou tom longe do padrão), para você ouvir e decidir.
  - Texto puro, sem instrução de direção (instrução às vezes é lida em voz alta) e idioma fixado em pt-BR.
  - Pula o que já foi regravado (marca "rg" no manifesto), então pode parar e continuar depois.

A chave vem de GEMINI_API_KEY, do .env da raiz ou de scripts/.api_key.txt (os dois ficam fora do git).

Uso:
  python3 scripts/regravar_dublagem_ptbr.py                 # só mostra o plano e quantas chamadas fará
  python3 scripts/regravar_dublagem_ptbr.py --executar      # grava tudo
  python3 scripts/regravar_dublagem_ptbr.py --executar --limite 10        # só as 10 primeiras
  python3 scripts/regravar_dublagem_ptbr.py --executar --so pt/7dddefcf-BERSERKER.mp3
  opções: --modelo gemini-2.5-pro-preview-tts (padrão: gemini-2.5-flash-preview-tts) · --refazer (ignora a marca "rg")
Depois: python3 scripts/build_asset_versions.py
"""
import base64
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE = os.path.join(ROOT, "assets", "audio", "voice")
MAN = os.path.join(VOICE, "voice-manifest.json")
LIST = os.path.join(ROOT, "scripts", "dublagem_a_corrigir.json")
REPORT = os.path.join(ROOT, "scripts", "dublagem_regravada.json")
TEMP = 0.6   # pouca variação entre falas do mesmo personagem


def arg(name, default=None):
    a = sys.argv
    return a[a.index(name) + 1] if name in a and a.index(name) + 1 < len(a) else default


def api_key():
    k = os.environ.get("GEMINI_API_KEY", "").strip()
    if k:
        return k
    for f in (os.path.join(ROOT, ".env"), os.path.join(ROOT, "scripts", ".api_key.txt")):
        if os.path.isfile(f):
            for line in open(f, encoding="utf-8").read().splitlines():
                line = line.strip()
                if line.startswith("GEMINI_API_KEY="):
                    return line.split("=", 1)[1].strip().strip("\"'")
                if line and "=" not in line:
                    return line
    raise SystemExit("defina GEMINI_API_KEY (ou crie .env com GEMINI_API_KEY=...)")


def clean(text):
    return " ".join(text.replace("“", "").replace("”", "").split()).strip().strip('"')


def call(key, model, text, voice, lang=True):
    """uma chamada; devolve PCM 24 kHz mono. Repete uma única vez em erro passageiro."""
    speech = {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}}
    if lang:
        speech["languageCode"] = "pt-BR"
    body = {"contents": [{"parts": [{"text": text}]}],
            "generationConfig": {"responseModalities": ["AUDIO"], "temperature": TEMP, "speechConfig": speech}}
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    for attempt in (1, 2):
        req = urllib.request.Request(url, data=json.dumps(body).encode(), headers={"Content-Type": "application/json", "x-goog-api-key": key})
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                d = json.loads(r.read().decode())
            part = d["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
            return base64.b64decode(part)
        except urllib.error.HTTPError as e:
            msg = e.read().decode(errors="ignore")[:300]
            if e.code == 400 and lang and "languageCode" in msg:      # modelo sem suporte ao campo: tira e segue
                return call(key, model, text, voice, lang=False)
            if e.code in (429, 500, 502, 503, 504) and attempt == 1:
                time.sleep(20 if e.code == 429 else 5)
                continue
            raise RuntimeError(f"HTTP {e.code}: {msg}")
        except (urllib.error.URLError, TimeoutError) as e:
            if attempt == 1:
                time.sleep(5)
                continue
            raise RuntimeError(str(e))


def to_mp3(pcm, path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", "pipe:0",
                    "-af", "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse",
                    "-b:a", "128k", "-ar", "24000", path], input=pcm, check=True)
    r = subprocess.run(["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True)
    return round(float(r.stdout.strip() or 0), 2)


def pitch(path):
    try:
        import librosa, numpy as np, warnings
        warnings.filterwarnings("ignore")
        y, sr = librosa.load(path, sr=16000)
        f, v, _ = librosa.pyin(y, fmin=65, fmax=420, sr=sr, frame_length=1024)
        g = f[v]
        return round(float(np.median(g))) if len(g) else 0
    except Exception:
        return None


def main():
    data = json.load(open(LIST, encoding="utf-8"))
    jobs = data["jobs"]
    man = json.load(open(MAN, encoding="utf-8"))
    redo = "--refazer" in sys.argv
    only = arg("--so")
    if only:
        jobs = [j for j in jobs if j["out"] == only]
    todo = [j for j in jobs if redo or not man["d"].get(j["id"], {}).get("rg", {}).get(j["cls"] or "_")]
    done_before = len(jobs) - len(todo)
    lim = arg("--limite")
    if lim:
        todo = todo[:int(lim)]
    model = arg("--modelo", "gemini-2.5-flash-preview-tts")
    print(f"{len(todo)} falas para regravar ({done_before} já feitas) · modelo {model} · "
          f"no máximo {len(todo)} chamadas (+1 só em erro passageiro)")
    if "--executar" not in sys.argv:
        for j in todo:
            print(f"  {j['out']:34s} {j['voice']:13s} {j['text'][:70]}")
        print("\nNada foi gravado. Rode com --executar para gravar.")
        return
    key = api_key()
    rep = json.load(open(REPORT, encoding="utf-8")) if os.path.isfile(REPORT) else {}
    ok = fail = 0
    for n, j in enumerate(todo, 1):
        text = clean(j["text"])
        try:
            pcm = call(key, model, text, j["voice"])
        except Exception as e:
            fail += 1
            print(f"[{n}/{len(todo)}] ERRO {j['out']}: {e}")
            if "outstanding balance" in str(e) or "API key" in str(e) or "PERMISSION" in str(e):
                print("Parando: problema de cobrança ou de chave no Google AI Studio.")
                break
            continue
        out = os.path.join(VOICE, j["out"])
        dur = to_mp3(pcm, out)
        d = man["d"].setdefault(j["id"], {})
        if j["cls"]:
            d.setdefault("byClass", {}).setdefault("pt", {})[j["cls"]] = dur
            if j.get("also_generic"):                       # fala de um herói só: o arquivo comum passa a ser a mesma voz
                gen = os.path.join(VOICE, "pt", j["id"] + ".mp3")
                subprocess.run(["cp", out, gen], check=True)
                d["pt"] = dur
        else:
            d["pt"] = dur
        d.setdefault("rg", {})[j["cls"] or "_"] = 1
        json.dump(man, open(MAN, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
        hz = pitch(out)
        exp = len(text) / 13 + 1.2
        warn = []
        if dur > max(3.5, exp * 2.1):
            warn.append(f"longo ({dur}s, esperado ~{exp:.1f}s)")
        rep[j["out"]] = {"voz": j["voice"], "dur": dur, "tom": hz, "aviso": " · ".join(warn), "modelo": model}
        json.dump(rep, open(REPORT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        ok += 1
        print(f"[{n}/{len(todo)}] ok {j['out']} · {j['voice']} · {dur}s · {hz} Hz{' · CONFERIR: ' + warn[0] if warn else ''}", flush=True)
        time.sleep(1.2)   # respeita o limite por minuto sem precisar repetir chamadas
    print(f"\nPronto: {ok} gravadas, {fail} com erro. Relatório: scripts/dublagem_regravada.json")
    print("Agora rode: python3 scripts/build_asset_versions.py")


if __name__ == "__main__":
    main()
