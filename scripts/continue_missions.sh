#!/usr/bin/env bash
# Prepara o ambiente para continuar as missões secundárias (veja docs/HANDOFF-MISSOES.md).
# Uso: bash scripts/continue_missions.sh [--serve]
set -euo pipefail
cd "$(dirname "$0")/.."

git fetch -q origin
git checkout missoes-wip 2>/dev/null || git checkout -b missoes-wip origin/missoes-wip
git pull -q --ff-only origin missoes-wip || true

echo "→ Montando o bundle a partir de scripts/source/*.js"
python3 scripts/patch_endless_trees.py
node --check assets/index-D6qIWtA7-p209.js && echo "✓ bundle válido"

echo "→ Conferindo os assets das missões"
for f in bispo freira menino paje paje-logs; do
  test -f "assets/pixel-art/npc/$f.png" && echo "  ✓ $f.png" || echo "  ✗ FALTA $f.png"
done

if [[ "${1:-}" == "--serve" ]]; then
  echo "→ Servidor em http://localhost:8765/index.html (Ctrl+C para parar)"
  echo "  No console do navegador: window.__dgQ (funções de teste das missões)"
  python3 -m http.server 8765
fi
