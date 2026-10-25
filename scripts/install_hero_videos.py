"""
Instala vídeos de final dos heróis feitos fora do jogo (Gemini/Veo, Kling…).
  python3 scripts/install_hero_videos.py <arquivos ou pasta>...
O herói é reconhecido pelo nome do arquivo (Hayato, ARCHER, arqueiro…). Vários clipes do mesmo herói são
emendados na ordem do nome (hayato-1, hayato-2…) com transição suave. Saída: assets/video/final_herois/<CLASSE>.mp4
(1280x720, 30 fps, H.264 + AAC, início rápido), também no espelho "Projeto atualizado". Depois rode
scripts/build_asset_versions.py e suba o CACHE do sw.js.
"""
import os
import re
import subprocess
import sys
import tempfile
import unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "video", "final_herois")
MIRROR = os.path.join(ROOT, "Projeto atualizado", "assets", "video", "final_herois")
ALIAS = {
    "WARRIOR": ["draven", "warrior", "guerreiro", "cavaleiro"],
    "BERSERKER": ["akihiro", "berserker", "samurai"],
    "ARCHER": ["hayato", "archer", "arqueiro"],
    "HUNTER": ["kael", "hunter", "cacador"],
    "DRUID": ["tharion", "druid", "druida"],
    "NECROMANCER": ["valthor", "necromancer", "necromante"],
    "MAGE": ["arthelia", "mage", "maga", "mago"],
    "ROGUE": ["seris", "rogue", "ladina", "ladino"],
    "SHAMAN": ["arai", "shaman", "xama"],
}


def plain(s):
    return unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()


def hero_of(path):
    n = plain(os.path.basename(path))
    for cls, keys in ALIAS.items():
        if any(re.search(r"(^|[^a-z])" + k + r"([^a-z]|$)", n) for k in keys):
            return cls
    return None


def dur(f):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True)
    return float(r.stdout.strip() or 0)


def has_audio(f):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", f], capture_output=True, text=True)
    return bool(r.stdout.strip())


def normalize(src, dst):
    """1280x720 (com faixas se a proporção for outra), 30 fps, áudio estéreo (silêncio se não tiver)"""
    vf = "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=black,fps=30,format=yuv420p"
    cmd = ["ffmpeg", "-v", "error", "-y", "-i", src]
    if not has_audio(src):
        cmd += ["-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo"]
    cmd += ["-vf", vf, "-c:v", "libx264", "-crf", "21", "-preset", "medium", "-c:a", "aac", "-b:a", "160k", "-ar", "44100", "-ac", "2", "-shortest", dst]
    subprocess.run(cmd, check=True)


def join(parts, dst, fade=0.6):
    if len(parts) == 1:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", parts[0], "-c", "copy", "-movflags", "+faststart", dst], check=True)
        return
    ins, fv, fa, off = [], [], [], 0.0
    for p in parts:
        ins += ["-i", p]
    v, a = "[0:v]", "[0:a]"
    for i in range(1, len(parts)):
        off += dur(parts[i - 1]) - fade
        fv.append(f"{v}[{i}:v]xfade=transition=fade:duration={fade}:offset={off:.2f}[v{i}]")
        fa.append(f"{a}[{i}:a]acrossfade=d={fade}[a{i}]")
        v, a = f"[v{i}]", f"[a{i}]"
    subprocess.run(["ffmpeg", "-v", "error", "-y", *ins, "-filter_complex", ";".join(fv + fa), "-map", v, "-map", a,
                    "-c:v", "libx264", "-crf", "21", "-preset", "medium", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", dst], check=True)


def main():
    files = []
    for a in sys.argv[1:]:
        if os.path.isdir(a):
            files += [os.path.join(a, f) for f in sorted(os.listdir(a)) if f.lower().endswith((".mp4", ".mov", ".webm", ".m4v"))]
        else:
            files.append(a)
    groups = {}
    for f in files:
        cls = hero_of(f)
        if not cls:
            print("não reconheci o herói pelo nome:", os.path.basename(f))
            continue
        groups.setdefault(cls, []).append(f)
    os.makedirs(OUT, exist_ok=True)
    for cls, fs in groups.items():
        fs.sort(key=lambda x: plain(os.path.basename(x)))
        with tempfile.TemporaryDirectory() as td:
            parts = []
            for i, f in enumerate(fs):
                q = os.path.join(td, f"{i}.mp4")
                normalize(f, q)
                parts.append(q)
            dst = os.path.join(OUT, cls + ".mp4")
            join(parts, dst)
        if os.path.isdir(os.path.dirname(MIRROR)):
            os.makedirs(MIRROR, exist_ok=True)
            subprocess.run(["cp", dst, os.path.join(MIRROR, cls + ".mp4")], check=True)
        print(f"{cls}: {len(fs)} clipe(s) → {dur(dst):.1f}s, {os.path.getsize(dst) // 1024} KB")


if __name__ == "__main__":
    main()
