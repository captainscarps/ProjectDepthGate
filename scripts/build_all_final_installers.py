import os
import sys
import shutil
import zipfile
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEST_DIR = r'C:\Users\rafaelscarpille\DEPTHGATE-Instaladores'
os.makedirs(DEST_DIR, exist_ok=True)

PROJ_DIR = os.path.join(ROOT, 'Projeto atualizado')
CSC_EXE = r'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'
JAVA_EXE = os.path.join(ROOT, 'scripts', 'jre8', 'jdk8u504-b01-jre', 'bin', 'java.exe')
SIGNER_JAR = os.path.join(ROOT, 'scripts', 'uber-apk-signer.jar')
BASE_APK = r'C:\Users\rafaelscarpille\OneDrive - CNT - SEST SENAT - ITL\Arquivos de Chat do Microsoft Teams\DARK-EPIC-DUNGEONS.apk'

print('=== INICIANDO EXPORTAÇÃO DOS INSTALADORES DEPTHGATE ===')
print(f'Destino: {DEST_DIR}')

import tempfile

# -------------------------------------------------------------------------
# 1. PREPARAR PACOTE DE ARQUIVOS WEB DO JOGO (COM FLAG OFFLINE)
# -------------------------------------------------------------------------
print('\n[1/4] Preparando arquivos do jogo para empacotamento offline...')
temp_game_dir = tempfile.mkdtemp(prefix='depthgate_pack_')
# Copy contents of PROJ_DIR to temp_game_dir
for item in os.listdir(PROJ_DIR):
    s = os.path.join(PROJ_DIR, item)
    d = os.path.join(temp_game_dir, item)
    if os.path.isdir(s):
        shutil.copytree(s, d)
    else:
        shutil.copy2(s, d)

# Injetar offline build flag e título DEPTHGATE no index.html
index_html_path = os.path.join(temp_game_dir, 'index.html')
with open(index_html_path, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace('<title>DARK EPIC DUNGEONS</title>', '<title>DEPTHGATE</title>')
if '<script>window.__OFFLINE_BUILD' not in html:
    html = html.replace('<head>', '<head>\n  <script>window.__OFFLINE_BUILD = true; window.__IS_LOCAL_DESKTOP = true;</script>')
with open(index_html_path, 'w', encoding='utf-8') as f:
    f.write(html)

# Criar game.zip para embutir no executável Windows
game_zip_path = os.path.join(temp_game_dir, 'game_payload.zip')
if os.path.exists(game_zip_path):
    try: os.remove(game_zip_path)
    except: pass

with zipfile.ZipFile(game_zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for root, dirs, files in os.walk(temp_game_dir):
        for file in files:
            if file == 'game_payload.zip': continue
            full = os.path.join(root, file)
            rel = os.path.relpath(full, temp_game_dir).replace('\\', '/')
            z.write(full, rel)
print(f'[OK] game.zip criado com sucesso ({os.path.getsize(game_zip_path)} bytes)')

# -------------------------------------------------------------------------
# 2. COMPILAR EXECUTÁVEL WINDOWS (DEPTHGATE.exe)
# -------------------------------------------------------------------------
print('\n[2/4] Compilando executável nativo Windows (DEPTHGATE.exe)...')
launcher_cs = os.path.join(ROOT, 'scripts', 'Launcher.cs')
out_win_exe = os.path.join(DEST_DIR, 'DEPTHGATE.exe')
if os.path.exists(out_win_exe):
    try: os.remove(out_win_exe)
    except: pass

ico_path = os.path.join(ROOT, 'app_icon.ico')
csc_cmd = [
    CSC_EXE,
    '/target:winexe',
    '/optimize+',
    f'/win32icon:{ico_path}',
    f'/resource:{game_zip_path},game.zip',
    '/reference:System.IO.Compression.dll',
    '/reference:System.IO.Compression.FileSystem.dll',
    '/reference:System.Windows.Forms.dll',
    f'/out:{out_win_exe}',
    launcher_cs
]

res = subprocess.run(csc_cmd, capture_output=True, text=True)
if res.returncode != 0:
    print('Erro compilação Windows:', res.stderr, res.stdout)
    sys.exit(1)
print(f'[OK] DEPTHGATE.exe gerado com sucesso ({os.path.getsize(out_win_exe)} bytes)')

# -------------------------------------------------------------------------
# 3. EMPACOTAR MAC (DEPTHGATE-Mac.zip contendo DEPTHGATE.app)
# -------------------------------------------------------------------------
print('\n[3/4] Empacotando versão macOS (DEPTHGATE-Mac.zip)...')
mac_zip_path = os.path.join(DEST_DIR, 'DEPTHGATE-Mac.zip')
if os.path.exists(mac_zip_path):
    try:
        os.remove(mac_zip_path)
    except Exception:
        import time
        time.sleep(1)
        try: os.remove(mac_zip_path)
        except Exception: pass

info_plist = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>pt-BR</string>
    <key>CFBundleDisplayName</key>
    <string>DEPTHGATE</string>
    <key>CFBundleExecutable</key>
    <string>DEPTHGATE</string>
    <key>CFBundleIdentifier</key>
    <string>com.rafaelscarpille.depthgate</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>DEPTHGATE</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.7.5</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
"""

launch_script = """#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
GAME_DIR="$DIR/../Resources/game"

if command -v python3 &> /dev/null; then
  cd "$GAME_DIR"
  python3 -m http.server 8089 &
  SERVER_PID=$!
  sleep 1
  open "http://localhost:8089/index.html"
  wait $SERVER_PID
else
  open "$GAME_DIR/index.html"
fi
"""

with zipfile.ZipFile(mac_zip_path, 'w', zipfile.ZIP_DEFLATED) as z_mac:
    z_mac.writestr('DEPTHGATE.app/Contents/Info.plist', info_plist)
    
    # Criar script com permissão de execução UNIX (0o755)
    exec_info = zipfile.ZipInfo('DEPTHGATE.app/Contents/MacOS/DEPTHGATE')
    exec_info.external_attr = 0o755 << 16
    z_mac.writestr(exec_info, launch_script)
    
    # Escrever arquivos do jogo
    for root, dirs, files in os.walk(temp_game_dir):
        for file in files:
            full = os.path.join(root, file)
            rel = os.path.relpath(full, temp_game_dir).replace('\\', '/')
            entry_path = 'DEPTHGATE.app/Contents/Resources/game/' + rel
            z_mac.write(full, entry_path)

print(f'[OK] DEPTHGATE-Mac.zip gerado com sucesso ({os.path.getsize(mac_zip_path)} bytes)')

# -------------------------------------------------------------------------
# 4. REEMPACOTAR E ASSINAR ANDROID APK (DEPTHGATE.apk)
# -------------------------------------------------------------------------
print('\n[4/4] Empacotando e assinando versão Android (DEPTHGATE.apk)...')
unsigned_apk = os.path.join(ROOT, 'temp_unsigned_depthgate.apk')
if os.path.exists(unsigned_apk):
    os.remove(unsigned_apk)

with zipfile.ZipFile(BASE_APK, 'r') as z_in, zipfile.ZipFile(unsigned_apk, 'w', zipfile.ZIP_DEFLATED) as z_out:
    for item in z_in.infolist():
        if item.filename.startswith('META-INF/') and (item.filename.endswith('.RSA') or item.filename.endswith('.SF') or item.filename.endswith('.MF') or item.filename.endswith('.DSA')):
            continue
        if item.filename.startswith('assets/public/'):
            continue
        if 'ic_launcher' in item.filename:
            continue
        
        data = z_in.read(item.filename)
        if item.filename == 'assets/capacitor.config.json':
            text = data.decode('utf-8')
            text = text.replace('DARK EPIC DUNGEONS', 'DEPTHGATE')
            text = text.replace('com.rafaelscarpille.darkepicdungeons', 'com.rafaelscarpille.depthgate')
            data = text.encode('utf-8')
        z_out.writestr(item, data)
    
    # Adicionar novos ícones do portal em res/
    apk_icons_dir = os.path.join(ROOT, 'scripts', 'apk_icons')
    if os.path.exists(apk_icons_dir):
        for root, dirs, files in os.walk(apk_icons_dir):
            for file in files:
                full = os.path.join(root, file)
                rel = os.path.relpath(full, apk_icons_dir).replace('\\', '/')
                z_out.write(full, 'res/' + rel)

    # Adicionar todos os assets atualizados para assets/public/
    for root, dirs, files in os.walk(temp_game_dir):
        for file in files:
            full = os.path.join(root, file)
            rel = os.path.relpath(full, temp_game_dir).replace('\\', '/')
            z_out.write(full, 'assets/public/' + rel)

# Assinar e alinhar APK
final_apk_path = os.path.join(DEST_DIR, 'DEPTHGATE.apk')
if os.path.exists(final_apk_path):
    try: os.remove(final_apk_path)
    except: pass

sign_cmd = [
    JAVA_EXE,
    '-jar', SIGNER_JAR,
    '-a', unsigned_apk,
    '-o', DEST_DIR,
    '--allowResign'
]

res = subprocess.run(sign_cmd, capture_output=True, text=True)
if res.returncode != 0:
    print('Erro ao assinar APK:', res.stderr, res.stdout)
    sys.exit(1)

# Encontrar o APK assinado gerado e renomear para DEPTHGATE.apk
signed_cand = os.path.join(DEST_DIR, 'temp_unsigned_depthgate-aligned-debugSigned.apk')
if os.path.exists(signed_cand):
    if os.path.exists(final_apk_path):
        os.remove(final_apk_path)
    os.rename(signed_cand, final_apk_path)

print(f'[OK] DEPTHGATE.apk assinado e alinhado com sucesso ({os.path.getsize(final_apk_path)} bytes)')

# Limpar temporários
try: shutil.rmtree(temp_game_dir, ignore_errors=True)
except: pass
try: os.remove(game_zip_path)
except: pass
try: os.remove(unsigned_apk)
except: pass

# Limpar qualquer arquivo/pasta espúria em DEST_DIR para deixar APENAS os 3 executáveis
allowed_files = {'DEPTHGATE.exe', 'DEPTHGATE-Mac.zip', 'DEPTHGATE.apk', 'DEPTHGATE - Windows.zip', 'DEPTHGATE - Android.zip'}
for item in os.listdir(DEST_DIR):
    item_path = os.path.join(DEST_DIR, item)
    if item not in allowed_files:
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)
        else:
            os.remove(item_path)

print('\n=== EXPORTAÇÃO CONCLUÍDA COM SUCESSO! ===')
print('Arquivos finais em DEPTHGATE-Instaladores:')
for f in os.listdir(DEST_DIR):
    fp = os.path.join(DEST_DIR, f)
    print(f'  • {f} ({os.path.getsize(fp) / (1024*1024):.2f} MB)')
