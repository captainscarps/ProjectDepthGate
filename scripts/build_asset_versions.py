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
assets_dir = os.path.join(ROOT, "assets")
count = 0
for base, dirs, files in os.walk(assets_dir):
    for f in files:
        p = os.path.join(base, f)
        rel = os.path.relpath(p, ROOT).replace(os.sep, "/")
        with open(p, "rb") as fp:
            out[rel] = hashlib.md5(fp.read()).hexdigest()[:10]
        count += 1
        if count % 1000 == 0:
            print(f"Indexados {count} arquivos...", flush=True)

data = json.dumps(out, separators=(",", ":"), sort_keys=True)
for d in (ROOT, os.path.join(ROOT, "Projeto atualizado")):
    if os.path.isdir(d):
        target = os.path.join(d, "asset-versions.json")
        with open(target, "w", encoding="utf-8") as fp:
            fp.write(data)
print("asset-versions.json:", len(out), "arquivos", flush=True)

