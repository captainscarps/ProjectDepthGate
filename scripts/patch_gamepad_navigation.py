# -*- coding: utf-8 -*-
"""
Patch for Full Gamepad Navigation across Codex, Bestiary, and Collectibles:
- __CodexScene:
  * D-Pad Left / Right, LB / RB, LT / RT, Analog Stick: page flip (previous/next)
  * D-Pad Up / Down: navigate index entries cursor on index spread
  * A button: open index (from cover) or open selected entry (from index)
  * Y button: jump directly to index
  * X button: jump directly to biomes section
  * B button / Start / Back: close book
- __CollectiblesScene:
  * D-Pad Left / Right / Up / Down / Analog Stick: navigate grid of relics
  * A button: inspect / click sound
  * B button / Start / Back: close screen
- __BookScene:
  * Enhanced bumper and start/back support
"""

import os
import re

def patch_files():
    files = [
        'assets/index-D6qIWtA7-p209.js',
        'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
    ]

    for fpath in files:
        print(f"Patching {fpath}...")
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()

        # -----------------------------------------------------------------
        # 1. Patch __CollectiblesScene: Add padState() and update()
        # -----------------------------------------------------------------
        coll_close_marker = 'close() {\n    if (this.__closing) return;\n    this.__closing = !0;'
        coll_pad_code = '''padState() {
    try {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const p = Array.from(pads).find(pad => pad && pad.connected);
      if (!p) return {};
      const B = i => !!p.buttons[i]?.pressed || (p.buttons[i]?.value || 0) > 0.5;
      const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
      return {
        l: B(14) || B(4) || ax < -0.5,
        r: B(15) || B(5) || ax > 0.5,
        u: B(12) || ay < -0.5,
        d: B(13) || ay > 0.5,
        a: B(0), b: B(1), x: B(2), y: B(3),
        lb: B(4), rb: B(5),
        back: B(8), start: B(9)
      };
    } catch (e) { return {}; }
  }

  update() {
    if (this.__closing || !this.sys.isActive()) return;
    const s = this.padState(), p = this.__pad || {};
    this.__pad = s;
    const ed = k => s[k] && !p[k];

    if (ed("b") || ed("back") || ed("start")) {
      this.close();
      return;
    }
    if (ed("l") || ed("lb")) {
      this.select((this.selected - 1 + this.total) % this.total);
    } else if (ed("r") || ed("rb")) {
      this.select((this.selected + 1) % this.total);
    } else if (ed("u")) {
      this.select((this.selected - 4 + this.total) % this.total);
    } else if (ed("d")) {
      this.select((this.selected + 4) % this.total);
    } else if (ed("a")) {
      this.game.audioEngine?.sfx("sfx-ui-click");
    }
  }

  '''
        if 'padState()' not in content[content.find('class __CollectiblesScene'):content.find('class __CodexScene')]:
            idx_coll_close = content.find(coll_close_marker)
            if idx_coll_close != -1:
                content = content[:idx_coll_close] + coll_pad_code + content[idx_coll_close:]
                print("  Added padState and update to __CollectiblesScene.")

        # -----------------------------------------------------------------
        # 2. Patch __CodexScene: Add padState(), update(), index cursor nav
        # -----------------------------------------------------------------
        codex_close_marker = 'close() {\n    if (this.__closing) return;\n    this.__closing = true;\n    window.removeEventListener("keydown", this.__kd);'
        codex_pad_code = '''padState() {
    try {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const p = Array.from(pads).find(pad => pad && pad.connected);
      if (!p) return {};
      const B = i => !!p.buttons[i]?.pressed || (p.buttons[i]?.value || 0) > 0.5;
      const ax = p.axes[0] || 0, ay = p.axes[1] || 0;
      return {
        l: B(14) || B(4) || ax < -0.5,
        r: B(15) || B(5) || ax > 0.5,
        u: B(12) || ay < -0.5,
        d: B(13) || ay > 0.5,
        a: B(0), b: B(1), x: B(2), y: B(3),
        lb: B(4), rb: B(5),
        lt: B(6), rt: B(7),
        back: B(8), start: B(9)
      };
    } catch (e) { return {}; }
  }

  update() {
    if (this.__closing || !this.sys.isActive() || this.busy) return;
    const s = this.padState(), p = this.__pad || {};
    this.__pad = s;
    const ed = k => s[k] && !p[k];

    // Fechar com B, Back ou Start
    if (ed("b") || ed("back") || ed("start")) {
      this.close();
      return;
    }

    // Virar páginas
    if (ed("l") || ed("lb") || ed("lt")) {
      this.go(this.spread - 1);
      return;
    }
    if (ed("r") || ed("rb") || ed("rt")) {
      this.go(this.spread + 1);
      return;
    }

    // Atalhos
    if (ed("y")) {
      this.go(1);
      return;
    }
    if (ed("x")) {
      this.go(this.BIOMES_START);
      return;
    }

    // Navegação no Índice
    if (this.spread === 1) {
      const totalEntries = (this.indexEntries ? this.indexEntries.length : (this.totalBiomes + this.totalHeroes + this.totalLegends));
      if (ed("u")) {
        this.indexCursor = ((this.indexCursor ?? 0) - 1 + totalEntries) % totalEntries;
        this.highlightIndexCursor();
      } else if (ed("d")) {
        this.indexCursor = ((this.indexCursor ?? 0) + 1) % totalEntries;
        this.highlightIndexCursor();
      } else if (ed("a")) {
        this.openIndexCursor();
      }
    } else if (this.spread === 0 && ed("a")) {
      this.go(1);
    }
  }

  highlightIndexCursor() {
    if (this.spread !== 1 || !this.indexEntries || !this.indexEntries.length) return;
    const cur = Phaser.Math.Clamp(this.indexCursor ?? 0, 0, this.indexEntries.length - 1);
    this.indexG?.clear();
    const item = this.indexEntries[cur];
    if (item && this.indexG) {
      this.indexG.fillStyle(0xc9a24a, 0.22).fillRoundedRect(item.x - 4, item.y - 2, item.w + 8, item.h + 4, 3);
      this.indexG.lineStyle(1, 0x8a6230, 0.7).strokeRoundedRect(item.x - 4, item.y - 2, item.w + 8, item.h + 4, 3);
      this.game.audioEngine?.sfx("sfx-ui-hover");
    }
  }

  openIndexCursor() {
    if (this.spread !== 1 || !this.indexEntries || !this.indexEntries.length) return;
    const cur = Phaser.Math.Clamp(this.indexCursor ?? 0, 0, this.indexEntries.length - 1);
    const item = this.indexEntries[cur];
    if (item && item.spread != null) {
      this.go(item.spread);
    }
  }

  '''
        if 'padState()' not in content[content.find('class __CodexScene'):content.find('class __BookScene')]:
            idx_codex_close = content.find(codex_close_marker)
            if idx_codex_close != -1:
                content = content[:idx_codex_close] + codex_pad_code + content[idx_codex_close:]
                print("  Added padState, update, and index cursor nav to __CodexScene.")

        # -----------------------------------------------------------------
        # 3. Enhance renderIndex to populate this.indexEntries for cursor
        # -----------------------------------------------------------------
        old_idx_fn = '''  // --- Índice Geral ---
  renderIndex(LX, RX, PW) {
    const L = this.L, R = this.R;

    // Coluna Esquerda: Biomas'''

        new_idx_fn = '''  // --- Índice Geral (Navegável por Mouse, Touch e Gamepad) ---
  renderIndex(LX, RX, PW) {
    const L = this.L, R = this.R;
    this.indexEntries = [];
    this.indexG = this.add.graphics();
    L.add(this.indexG);

    // Coluna Esquerda: Biomas'''

        if old_idx_fn in content:
            content = content.replace(old_idx_fn, new_idx_fn)
            print("  Initialized indexEntries in renderIndex.")

        # Track index entries in biomes loop
        old_b_loop = 'const act = () => this.go(this.BIOMES_START + i);\n      t.on("pointerdown", act); pg.on("pointerdown", act);'
        new_b_loop = '''const act = () => this.go(this.BIOMES_START + i);
      this.indexEntries.push({ x: LX + 10, y: y, w: PW - 20, h: 18, spread: this.BIOMES_START + i });
      t.on("pointerdown", act); pg.on("pointerdown", act);'''
        if old_b_loop in content:
            content = content.replace(old_b_loop, new_b_loop)

        # Track index entries in heroes loop
        old_h_loop = 'const act = () => this.go(this.HEROES_START + i);\n      t.on("pointerdown", act); pg.on("pointerdown", act);'
        new_h_loop = '''const act = () => this.go(this.HEROES_START + i);
      this.indexEntries.push({ x: RX + 10, y: y, w: PW - 20, h: 16, spread: this.HEROES_START + i });
      t.on("pointerdown", act); pg.on("pointerdown", act);'''
        if old_h_loop in content:
            content = content.replace(old_h_loop, new_h_loop)

        # Track index entries in legends loop
        old_l_loop = 'const act = () => this.go(this.LEGENDS_START + i);\n      t.on("pointerdown", act); pg.on("pointerdown", act);'
        new_l_loop = '''const act = () => this.go(this.LEGENDS_START + i);
      this.indexEntries.push({ x: RX + 10, y: y, w: PW - 20, h: 16, spread: this.LEGENDS_START + i });
      t.on("pointerdown", act); pg.on("pointerdown", act);'''
        if old_l_loop in content:
            content = content.replace(old_l_loop, new_l_loop)

        # -----------------------------------------------------------------
        # 4. Enhance __BookScene padState to support triggers and start/back
        # -----------------------------------------------------------------
        old_book_pad = 'return { l: B(14) || B(4) || ax < -.6, r: B(15) || B(5) || ax > .6, u: B(12) || ay < -.6, d: B(13) || ay > .6, a: B(0), b: B(1), y: B(3) };'
        new_book_pad = 'return { l: B(14) || B(4) || ax < -.6, r: B(15) || B(5) || ax > .6, u: B(12) || ay < -.6, d: B(13) || ay > .6, a: B(0), b: B(1), y: B(3), lb: B(4), rb: B(5), back: B(8), start: B(9) };'
        if old_book_pad in content:
            content = content.replace(old_book_pad, new_book_pad)

        old_book_upd = 'ed("a") && this.key("Enter"); ed("b") && this.key("Escape"); ed("y") && this.go(1);'
        new_book_upd = 'ed("a") && this.key("Enter"); (ed("b") || ed("start") || ed("back")) && this.close(); ed("y") && this.go(1);'
        if old_book_upd in content:
            content = content.replace(old_book_upd, new_book_upd)

        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Saved {fpath}")

if __name__ == '__main__':
    patch_files()
