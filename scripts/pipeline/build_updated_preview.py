import json
import base64
import os
import io
import wave
import lameenc

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MANIFEST_PATH = os.path.join(ROOT, "assets", "audio", "voice", "voice-manifest.json")
MIRROR_MANIFEST = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "voice-manifest.json")
OUT_HTML = os.path.join(ROOT, "preview_vozes.html")
MIRROR_HTML = os.path.join(ROOT, "Projeto atualizado", "preview_vozes.html")

ext_path = os.path.join(ROOT, "scripts", "extracted_lines.json")
extra_path = os.path.join(ROOT, "scripts", "voice_extra_lines.json")

ext = json.load(open(ext_path, encoding="utf-8"))
extra = json.load(open(extra_path, encoding="utf-8"))
all_lines = ext + extra

manifest = json.load(open(MANIFEST_PATH, encoding="utf-8"))

def fnv(text):
    h = 0x811C9DC5
    b = text.encode("utf-16-le")
    for i in range(0, len(b), 2):
        h ^= b[i] | (b[i + 1] << 8)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f"{h:08x}"

VOICE_MAP = {
    "narrator": "Charon",
    "video": "Charon",
    "vision": "Charon",
    "guardia": "Aoede",
    "cine-✦ A GUARDIÃ ✦": "Aoede",
    "rei": "Fenrir",
    "rei-corrupt": "Fenrir",
    "hero-SHAMAN": "Kore"
}

samples = []
for item in all_lines:
    t = " ".join(item["text"].split()).strip()
    h = fnv(t)
    if h in manifest["k"]:
        lid = manifest["k"][h]
        vkey = item.get("voice", "narrator")
        if vkey in VOICE_MAP:
            mp3_path = os.path.join(ROOT, "assets", "audio", "voice", "pt", f"{lid}.mp3")
            dur = manifest["d"].get(lid, {}).get("pt", 0)
            samples.append({
                "id": lid,
                "voice": vkey,
                "text": item["text"],
                "dur": dur,
                "rel_path": f"assets/audio/voice/pt/{lid}.mp3",
                "full_path": mp3_path
            })

# Salva ready_samples atualizado
with open(os.path.join(ROOT, "scripts", "ready_samples.json"), "w", encoding="utf-8") as f:
    json.dump(samples, f, indent=2, ensure_ascii=False)

categories = {
    "hero-SHAMAN": "🏹 Araí, a Xamã (Voz: Kore - Tupi / Nheengatu)",
    "guardia": "✦ A Guardiã Ancestral (Voz: Aoede - Refinada)",
    "rei": "👑 O Rei Caído (Voz: Fenrir - Solene)",
    "rei-corrupt": "💀 O Rei Corrompido / Chefe (Voz: Fenrir Gutural)",
    "narrator": "📜 O Narrador das Profundezas (Voz: Charon - Épico)",
    "vision": "👁️ Visões & Memórias Antigas (Voz: Charon)",
    "video": "🎬 Vídeo de Abertura (Voz: Charon)"
}

html_sections = []

for cat_key, cat_title in categories.items():
    cat_samples = [s for s in samples if s["voice"] == cat_key]
    if not cat_samples:
        continue
    
    cards_inner = []
    # Mostra até 12 amostras de cada categoria no preview interativo com áudio Base64
    for s in cat_samples[:12]:
        b64_audio = ""
        if os.path.exists(s["full_path"]):
            with open(s["full_path"], "rb") as af:
                b64_audio = base64.b64encode(af.read()).decode("utf-8")
        
        cards_inner.append(f"""
        <div class="voice-card">
            <div class="card-header">
                <span class="badge badge-{cat_key}">{s['id']}</span>
                <span class="dur-badge">⏱ {s['dur']}s</span>
            </div>
            <div class="card-text">"{s['text']}"</div>
            <div class="audio-ctrl">
                <audio controls preload="none">
                    <source src="data:audio/mp3;base64,{b64_audio}" type="audio/mp3">
                    <source src="{s['rel_path']}" type="audio/mp3">
                </audio>
            </div>
        </div>
        """)
    
    html_sections.append(f"""
    <section class="character-section">
        <h2 class="section-title title-{cat_key}">{cat_title} <span class="count-tag">({len(cat_samples)} falas 100% limpas)</span></h2>
        <div class="cards-grid">
            {''.join(cards_inner)}
        </div>
    </section>
    """)

full_html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DepthGate — Preview das Vozes Refinadas (Sem Vazamento)</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{
            background: #0d090d;
            color: #dcd0c0;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 30px 20px;
            line-height: 1.5;
        }}
        .header {{
            text-align: center;
            max-width: 900px;
            margin: 0 auto 35px auto;
            border-bottom: 2px solid #2e1a22;
            padding-bottom: 25px;
        }}
        .header h1 {{
            font-family: Georgia, serif;
            font-size: 32px;
            color: #5ae08a;
            letter-spacing: 1.5px;
            margin-bottom: 8px;
            text-shadow: 0 0 16px rgba(90, 224, 138, 0.4);
        }}
        .header p {{
            color: #9c8a78;
            font-size: 14px;
        }}
        .status-bar {{
            display: inline-block;
            margin-top: 15px;
            background: #101c13;
            border: 1px solid #224d2e;
            padding: 8px 18px;
            border-radius: 20px;
            font-size: 13px;
            color: #72f59a;
        }}
        .container {{
            max-width: 1200px;
            margin: 0 auto;
        }}
        .character-section {{
            margin-bottom: 45px;
            background: #140d12;
            border: 1px solid #28141b;
            border-radius: 10px;
            padding: 24px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }}
        .section-title {{
            font-family: Georgia, serif;
            font-size: 20px;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #331a22;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }}
        .title-hero-SHAMAN {{ color: #5ae08a; }}
        .title-guardia {{ color: #72b5f5; }}
        .title-rei {{ color: #ffd24a; }}
        .title-rei-corrupt {{ color: #e05a5a; }}
        .title-narrator {{ color: #d8cdb4; }}
        .title-vision {{ color: #c482f5; }}
        .title-video {{ color: #f59e5a; }}
        .count-tag {{
            font-size: 13px;
            color: #8c7e6c;
            font-weight: normal;
        }}
        .cards-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
            gap: 16px;
        }}
        .voice-card {{
            background: #1a1218;
            border: 1px solid #3a202a;
            border-radius: 8px;
            padding: 16px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }}
        .voice-card:hover {{
            border-color: #5a3040;
            background: #20161e;
        }}
        .card-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }}
        .badge {{
            font-family: monospace;
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 4px;
            background: #2b1820;
            color: #e0d0c0;
        }}
        .dur-badge {{
            font-size: 11px;
            color: #8c7e6c;
        }}
        .card-text {{
            font-size: 13px;
            color: #e8dcc4;
            font-style: italic;
            margin-bottom: 14px;
            line-height: 1.4;
            flex-grow: 1;
        }}
        .audio-ctrl audio {{
            width: 100%;
            height: 36px;
            outline: none;
            filter: invert(0.85) hue-rotate(180deg);
        }}
    </style>
</head>
<body>
    <div class="header">
        <h1>DEPTHGATE — VOZES REFINADAS (100% LIMPAS)</h1>
        <p>Áudios neurais gerados com texto puro e pronúncia aperfeiçoada em Português do Brasil.</p>
        <div class="status-bar">✦ Zero Vazamento de Instruções • Pronúncia Refinada • {len(samples)} Falas Totais</div>
    </div>
    <div class="container">
        {''.join(html_sections)}
    </div>
</body>
</html>
"""

with open(OUT_HTML, "w", encoding="utf-8") as f:
    f.write(full_html)
with open(MIRROR_HTML, "w", encoding="utf-8") as f:
    f.write(full_html)

print("Preview atualizado com sucesso em preview_vozes.html e espelho!")
