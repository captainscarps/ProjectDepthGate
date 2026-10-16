import os, re, hashlib, subprocess

ROOT = r"C:\Users\rafaelscarpille\.gemini\antigravity\scratch\ProjectDepthGate"

def patch_file(rel_path, old_sub, new_sub):
    full_path = os.path.join(ROOT, rel_path)
    content = open(full_path, "r", encoding="utf-8").read()
    if old_sub not in content:
        print(f"[WARN] Pattern not found in {rel_path}!")
        return False
    content = content.replace(old_sub, new_sub, 1)
    open(full_path, "w", encoding="utf-8").write(content)
    print(f"[OK] Patched {rel_path}")
    return True

print("=== PATCHING CONTROLS PANEL ===")
cp_old1 = 'if(!this.root.visible)return;if(this.capturing){(i.key==="Escape"||!i.isTrusted)&&(i.stopImmediatePropagation?.(),i.preventDefault?.()),i.key==="Escape"&&this.cancel();return}i.stopImmediatePropagation?.(),i.preventDefault?.();'
cp_new1 = 'if(!this.root.visible)return;if(this.capturing){i.stopImmediatePropagation?.();i.preventDefault?.();if(i.key==="Escape")this.cancel();return}i.stopImmediatePropagation?.(),i.preventDefault?.();'

cp_old2 = 'this.capturing=tx,tx.setText("...").setColor("#8ae0b0"),this.refresh(),setTimeout(()=>{if(this.capturing!==tx)return;this.col===0?this.mgr.captureKey(s=>{this.mgr.saveBinding("keyboard",c.action,[s]),this.capturing=null,this.refresh()}):this.mgr.captureGamepadButton(s=>{this.mgr.saveBinding("gamepad",c.action,[s]),this.capturing=null,this.refresh()})},180)'
cp_new2 = 'this.capturing=tx,tx.setText("...").setColor("#8ae0b0"),this.refresh();const __doCap=()=>{if(this.capturing!==tx)return;this.col===0?this.mgr.captureKey(s=>{this.mgr.saveBinding("keyboard",c.action,[s]),this.capturing=null,this.refresh()}):this.mgr.captureGamepadButton(s=>{this.mgr.saveBinding("gamepad",c.action,[s]),this.capturing=null,this.refresh()})};__doCap()'

for p in ["assets/ControlsPanel-kYdEPlgz-p209.js", "Projeto atualizado/assets/ControlsPanel-kYdEPlgz-p209.js"]:
    patch_file(p, cp_old1, cp_new1)
    patch_file(p, cp_old2, cp_new2)

print("\n=== PATCHING INDEX JS (INPUT MANAGER) ===")
im_old = 'this.keyCapture=null,window.addEventListener("keydown",t=>{if(!t.isTrusted)return;if(!(document.activeElement?.tagName==="INPUT"||document.activeElement?.tagName==="TEXTAREA")){if(this.keyCapture){this.keyCapture(t.code),this.keyCapture=null,t.preventDefault();return}this.keysDown.has(t.code)||this.keyPressedBuffer.add(t.code),this.keysDown.add(t.code),this.setDevice("keyboard")}}),'
im_new = 'this.keyCapture=null,window.addEventListener("keydown",t=>{if(!t.isTrusted)return;if((t.ctrlKey||t.metaKey)&&(t.shiftKey||(t.code&&t.code.startsWith("Digit")))){t.preventDefault?.();t.stopPropagation?.();}if(!(document.activeElement?.tagName==="INPUT"||document.activeElement?.tagName==="TEXTAREA")){if(this.keyCapture){this.keyCapture(t.code);this.keyCapture=null;t.preventDefault?.();t.stopPropagation?.();return}this.keysDown.has(t.code)||this.keyPressedBuffer.add(t.code),this.keysDown.add(t.code),this.setDevice("keyboard")}},{capture:true}),'

for p in ["assets/index-D6qIWtA7-p209.js", "Projeto atualizado/assets/index-D6qIWtA7-p209.js"]:
    patch_file(p, im_old, im_new)

print("\n=== PATCHING INDEX.HTML ===")
prevent_script = """  <script>
    /* Bloqueio preventivo de divisão de tela (Edge Split Screen / atalhos indesejados de browser) */
    (function() {
      window.addEventListener("keydown", function(e) {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
          if (e.code === "Digit2" || e.key === "2" || e.keyCode === 50 ||
              e.code === "Digit1" || e.code === "Digit3" || e.code === "Digit4" ||
              e.code === "KeyS" || e.code === "KeyD" || e.code === "KeyA" || e.code === "KeyW" ||
              e.code === "KeyE" || e.code === "KeyQ" || e.code === "Space") {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
        }
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && e.code && e.code.startsWith("Digit")) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        if (e.altKey && (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.code === "ArrowLeft" || e.code === "ArrowRight")) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        if (e.key === "Tab" && (!document.activeElement || (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA"))) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        if (e.key === "F1" || e.key === "F3" || e.key === "F7") {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }, { capture: true, passive: false });

      window.addEventListener("pointerdown", function() {
        const c = document.querySelector("#game canvas");
        if (c && document.activeElement !== c) {
          try { c.focus(); } catch(err) {}
        }
      }, { passive: true });
    })();
  </script>
"""

for html_file in ["index.html", "Projeto atualizado/index.html"]:
    path = os.path.join(ROOT, html_file)
    c = open(path, "r", encoding="utf-8").read()
    if "/* Bloqueio preventivo de divisão de tela" not in c:
        c = c.replace("<head>", "<head>\n" + prevent_script, 1)
        open(path, "w", encoding="utf-8").write(c)
        print(f"[OK] Added prevention script to {html_file}")
    else:
        print(f"[SKIP] Script already in {html_file}")

