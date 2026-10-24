"""
Lista de versões dos arquivos do jogo (asset-versions.json: caminho -> impressão digital curta).
O service worker guarda as imagens/sons num cache que NÃO é apagado a cada atualização; ao ativar uma versão
nova ele compara esta lista com a anterior e baixa de novo só o que mudou.
Rodar antes de publicar: python3 scripts/build_asset_versions.py
"""
import hashlib
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = {}
for base, dirs, files in os.walk(os.path.join(ROOT, "assets")):
    for f in files:
        p = os.path.join(base, f)
        rel = os.path.relpath(p, ROOT).replace(os.sep, "/")
        h = hashlib.md5(open(p, "rb").read()).hexdigest()[:10]
        out[rel] = h
data = json.dumps(out, separators=(",", ":"), sort_keys=True)
for d in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
    if os.path.isdir(d):
        open(os.path.join(d, "asset-versions.json"), "w").write(data)
print("asset-versions.json:", len(out), "arquivos")
