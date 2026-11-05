"""
Registra e conecta os 7 novos NPCs nos bundles do jogo:
  - assets/index-D6qIWtA7-p209.js
  - Projeto atualizado/assets/index-D6qIWtA7-p209.js

Configura:
  1. Pré-carregamento dos spritesheets e retratos de diálogo em bo.prototype.preload
  2. Registro de todas as animações (idle, idle2, walk, talk, special, sell) em __qAnims
  3. Suporte a spawn rápido via __qNpc e window.__spawnNpc
"""

import os
import sys

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILES = [
    os.path.join(ROOT, "assets", "index-D6qIWtA7-p209.js"),
    os.path.join(ROOT, "Projeto atualizado", "assets", "index-D6qIWtA7-p209.js")
]

TAG_NPC = "/*__NEW_NPCS_REGISTRY__*/"

# 1. Preload patch
PRELOAD_OLD_ANCHOR = 'for (const nm of ["bispo", "freira", "menino", "paje"])'
PRELOAD_NEW_REPLACEMENT = 'for (const nm of ["bispo", "freira", "menino", "paje", "elf-1", "elf-2", "elf-3", "peasant-1", "peasant-2", "peasant-3", "peasant-4"])'

SHEETS_PRELOAD_ANCHOR = 'sh("paje", "paje.png", 47, 60);'
SHEETS_PRELOAD_INJECTION = (
    'sh("paje", "paje.png", 47, 60);'
    + TAG_NPC
    + 'for (const k of ["elf-1", "elf-2", "elf-3", "peasant-1", "peasant-2", "peasant-3", "peasant-4"]) sh(k, k + ".png", 128, 128);'
    + TAG_NPC
)

# 2. Animations patch
ANIMS_ANCHOR = 'mk("paje-idle", "paje", 24, 2, 2);'
ANIMS_INJECTION = (
    'mk("paje-idle", "paje", 24, 2, 2);'
    + TAG_NPC
    # elf-1: idle (0..5), idle2 (16..21), walk (32..43), talk (48..54), special (64..75)
    + 'mk("elf-1-idle", "elf-1", 0, 6, 6); mk("elf-1-idle2", "elf-1", 16, 6, 6); mk("elf-1-walk", "elf-1", 32, 12, 10); mk("elf-1-talk", "elf-1", 48, 7, 7); mk("elf-1-special", "elf-1", 64, 12, 8);'
    # elf-2: idle (0..6), idle2 (16..19), walk (32..43), talk (48..56), special (64..68)
    + 'mk("elf-2-idle", "elf-2", 0, 7, 6); mk("elf-2-idle2", "elf-2", 16, 4, 6); mk("elf-2-walk", "elf-2", 32, 12, 10); mk("elf-2-talk", "elf-2", 48, 9, 7); mk("elf-2-special", "elf-2", 64, 5, 7);'
    # elf-3: idle (0..6), idle2 (16..22), walk (32..43), talk (48..55), special (64..70)
    + 'mk("elf-3-idle", "elf-3", 0, 7, 6); mk("elf-3-idle2", "elf-3", 16, 7, 6); mk("elf-3-walk", "elf-3", 32, 12, 10); mk("elf-3-talk", "elf-3", 48, 8, 7); mk("elf-3-special", "elf-3", 64, 7, 7);'
    # peasant-1: idle (0..11), idle2 (16..22), talk (48..58)
    + 'mk("peasant-1-idle", "peasant-1", 0, 12, 6); mk("peasant-1-idle2", "peasant-1", 16, 7, 6); mk("peasant-1-talk", "peasant-1", 48, 11, 7);'
    # peasant-2: idle (0..6), idle2 (16..22), walk (32..43), talk (48..57)
    + 'mk("peasant-2-idle", "peasant-2", 0, 7, 6); mk("peasant-2-idle2", "peasant-2", 16, 7, 6); mk("peasant-2-walk", "peasant-2", 32, 12, 10); mk("peasant-2-talk", "peasant-2", 48, 10, 7);'
    # peasant-3: idle (0..6), walk (16..27), talk (32..40), sell (48..61)
    + 'mk("peasant-3-idle", "peasant-3", 0, 7, 6); mk("peasant-3-walk", "peasant-3", 16, 12, 10); mk("peasant-3-talk", "peasant-3", 32, 9, 7); mk("peasant-3-sell", "peasant-3", 48, 14, 8);'
    # peasant-4: idle (0..6), walk (16..25), sell (32..41), talk (48..54)
    + 'mk("peasant-4-idle", "peasant-4", 0, 7, 6); mk("peasant-4-walk", "peasant-4", 16, 10, 10); mk("peasant-4-sell", "peasant-4", 32, 10, 8); mk("peasant-4-talk", "peasant-4", 48, 7, 7);'
    + TAG_NPC
)

HELPER_INJECTION = (
    TAG_NPC
    + 'window.__AVAILABLE_NPCS=["bispo","freira","menino","paje","elf-1","elf-2","elf-3","peasant-1","peasant-2","peasant-3","peasant-4"];'
    + 'window.__spawnNpc=function(S,key,x,y,o){return __qNpc(S,key,x,y,o)};'
    + TAG_NPC
)

def patch_file(p):
    if not os.path.exists(p):
        print(f"Skipping {p} (not found)")
        return
    s = open(p, "r", encoding="utf-8").read()

    # Limpar injeções antigas com TAG_NPC se houver
    while TAG_NPC in s:
        a = s.index(TAG_NPC)
        b = s.index(TAG_NPC, a + 1) + len(TAG_NPC)
        s = s[:a] + s[b:]

    # Injetar preload dos spritesheets
    if SHEETS_PRELOAD_ANCHOR in s:
        s = s.replace(SHEETS_PRELOAD_ANCHOR, SHEETS_PRELOAD_INJECTION, 1)
        print(f"[{p}] Sheets preload patched")
    else:
        print(f"[{p}] WARNING: SHEETS_PRELOAD_ANCHOR not found")

    # Injetar preload dos retratos
    if PRELOAD_OLD_ANCHOR in s:
        s = s.replace(PRELOAD_OLD_ANCHOR, PRELOAD_NEW_REPLACEMENT, 1)
        print(f"[{p}] Portraits preload patched")
    else:
        print(f"[{p}] WARNING: PRELOAD_OLD_ANCHOR not found")

    # Injetar animações em __qAnims
    if ANIMS_ANCHOR in s:
        s = s.replace(ANIMS_ANCHOR, ANIMS_INJECTION, 1)
        print(f"[{p}] Animations patched in __qAnims")
    else:
        print(f"[{p}] WARNING: ANIMS_ANCHOR not found")

    # Injetar helper global logo após __qNpc
    qnpc_end = 'if(d<64&&!S.uiOpen)s.flipX=S.player.x<s.x;};S.events.on("update",U);s.once("destroy",()=>S.events.off("update",U));return s}'
    if qnpc_end in s and "window.__spawnNpc" not in s:
        s = s.replace(qnpc_end, qnpc_end + "\n" + HELPER_INJECTION)
        print(f"[{p}] window.__spawnNpc helper injected")

    open(p, "w", encoding="utf-8").write(s)
    print(f"[{p}] File saved successfully.")

for f in FILES:
    patch_file(f)

print("Done patching new NPCs into game bundles.")
