import os
import urllib.request
import zipfile

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
SIGNER_JAR = os.path.join(SCRIPTS_DIR, 'uber-apk-signer.jar')
JRE_DIR = os.path.join(SCRIPTS_DIR, 'jre8')

# 1. Download uber-apk-signer
if not os.path.exists(SIGNER_JAR):
    url_signer = 'https://github.com/patrickfav/uber-apk-signer/releases/download/v1.3.0/uber-apk-signer-1.3.0.jar'
    print(f'Downloading uber-apk-signer from {url_signer}...')
    urllib.request.urlretrieve(url_signer, SIGNER_JAR)
    print(f'[OK] uber-apk-signer downloaded ({os.path.getsize(SIGNER_JAR)} bytes)')
else:
    print('[OK] uber-apk-signer already present')

# 2. Download Temurin JRE 8
java_exe = os.path.join(JRE_DIR, 'jdk8u504-b01-jre', 'bin', 'java.exe')
if not os.path.exists(java_exe):
    url_jre = 'https://github.com/adoptium/temurin8-binaries/releases/download/jdk8u504-b01/OpenJDK8U-jre_x64_windows_hotspot_8u504b01.zip'
    zip_path = os.path.join(SCRIPTS_DIR, 'jre8.zip')
    print(f'Downloading JRE 8 from {url_jre}...')
    urllib.request.urlretrieve(url_jre, zip_path)
    print(f'[OK] JRE 8 downloaded ({os.path.getsize(zip_path)} bytes), extracting...')
    os.makedirs(JRE_DIR, exist_ok=True)
    with zipfile.ZipFile(zip_path, 'r') as z:
        z.extractall(JRE_DIR)
    os.remove(zip_path)
    print('[OK] JRE 8 extracted successfully')
else:
    print('[OK] JRE 8 already present')

print('All APK tools ready!')
