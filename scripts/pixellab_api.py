#!/usr/bin/env python3
"""Cliente mínimo da API v2 do PixelLab (https://api.pixellab.ai/v2) para os scripts de arte.
A chave vem de PIXELLAB_API_KEY (arquivo .env na raiz do projeto, fora do Git).
  from pixellab_api import post, job, b64, img
"""
import base64, io, json, os, time, urllib.request, urllib.error
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = "https://api.pixellab.ai/v2"


def _key():
    k = os.environ.get("PIXELLAB_API_KEY")
    if not k:
        for ln in open(os.path.join(ROOT, ".env"), encoding="utf-8"):
            if ln.startswith("PIXELLAB_API_KEY="):
                k = ln.split("=", 1)[1].strip()
    if not k:
        raise SystemExit("PIXELLAB_API_KEY ausente (.env)")
    return k


def _req(method, path, body=None, timeout=180):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(BASE + path, data=data, method=method,
                               headers={"Authorization": "Bearer " + _key(), "Content-Type": "application/json"})
    for tent in range(4):
        try:
            with urllib.request.urlopen(r, timeout=timeout) as f:
                return json.loads(f.read())
        except urllib.error.HTTPError as e:
            msg = e.read().decode()[:600]
            if e.code in (429, 500, 502, 503, 504) and tent < 3:
                time.sleep(8 * (tent + 1)); continue
            raise SystemExit(f"HTTP {e.code} {path}: {msg}")
        except (urllib.error.URLError, TimeoutError) as e:
            if tent < 3:
                time.sleep(6); continue
            raise


def b64(im):
    if isinstance(im, str):
        im = Image.open(im)
    buf = io.BytesIO(); im.convert("RGBA").save(buf, "PNG")
    return {"type": "base64", "base64": base64.b64encode(buf.getvalue()).decode(), "format": "png"}


def img(o):
    """imagem de uma resposta (dict com base64 ou url) → PIL"""
    if isinstance(o, dict):
        s = o.get("base64") or o.get("image", {}).get("base64") if isinstance(o.get("image"), dict) else o.get("base64")
        if s is None and isinstance(o.get("image"), dict):
            s = o["image"].get("base64")
        if s is None and o.get("url"):
            with urllib.request.urlopen(o["url"]) as f:
                return Image.open(io.BytesIO(f.read())).convert("RGBA")
    else:
        s = o
    if s.startswith("data:"):
        s = s.split(",", 1)[1]
    return Image.open(io.BytesIO(base64.b64decode(s))).convert("RGBA")


def post(path, body):
    return _req("POST", path, body)


def job(resp, every=6, limit=900):
    """espera o background job e devolve last_response"""
    jid = resp.get("background_job_id") or resp.get("job_id")
    if not jid:
        return resp
    t0 = time.time()
    while True:
        r = _req("GET", f"/background-jobs/{jid}")
        st = r.get("status")
        if st == "completed":
            return r.get("last_response") or r
        if st == "failed":
            raise SystemExit("job falhou: " + json.dumps(r)[:800])
        if time.time() - t0 > limit:
            raise SystemExit("job demorou demais: " + jid)
        time.sleep(every)


def images_of(lr):
    L = lr.get("images") or lr.get("frames") or []
    return [img(x) for x in L]


def balance():
    return _req("GET", "/balance")
