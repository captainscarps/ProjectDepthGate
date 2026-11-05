import asyncio
import edge_tts
import json
import os
import shutil
import sys

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PT = os.path.join(ROOT, "assets", "audio", "voice", "pt")
OUT_EN = os.path.join(ROOT, "assets", "audio", "voice", "en")
MIRROR_PT = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "pt")
MIRROR_EN = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "en")
MANIFEST_PATH = os.path.join(ROOT, "assets", "audio", "voice", "voice-manifest.json")
MIRROR_MANIFEST = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "voice-manifest.json")

os.makedirs(OUT_PT, exist_ok=True)
os.makedirs(OUT_EN, exist_ok=True)
os.makedirs(MIRROR_PT, exist_ok=True)
os.makedirs(MIRROR_EN, exist_ok=True)

def fnv(t):
    t = " ".join(t.split()).strip()
    h = 2166136261
    for ch in t:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return f"{h:08x}"

def get_mp3_duration(path):
    with open(path, "rb") as f:
        data = f.read()
    idx = 0
    if data[:3] == b"ID3":
        size = (data[6] << 21) | (data[7] << 14) | (data[8] << 7) | data[9]
        idx = 10 + size
    
    bitrates = {
        1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0],
        2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0]
    }
    sample_rates = {
        0: [11025, 12000, 8000],
        2: [22050, 24000, 16000],
        3: [44100, 48000, 32000]
    }
    frames = 0
    samples_per_frame = 1152
    sr = 24000
    while idx + 4 < len(data):
        if data[idx] == 0xFF and (data[idx+1] & 0xE0) == 0xE0:
            version = (data[idx+1] >> 3) & 3
            layer = (data[idx+1] >> 1) & 3
            br_idx = (data[idx+2] >> 4) & 0xF
            sr_idx = (data[idx+2] >> 2) & 3
            padding = (data[idx+2] >> 1) & 1
            if layer == 1 and version in sample_rates and sr_idx < 3 and br_idx < 15:
                sr = sample_rates[version][sr_idx]
                br_ver = 1 if version == 3 else 2
                br = bitrates[br_ver][br_idx] * 1000
                samples_per_frame = 1152 if version == 3 else 576
                if br > 0:
                    frame_len = (samples_per_frame * br // (8 * sr)) + padding
                    idx += frame_len
                    frames += 1
                    continue
        idx += 1
    duration = frames * samples_per_frame / sr if frames > 0 else 0
    return round(duration, 2)

async def synthesize_robust(text, preferred_voice, fallbacks):
    for v in [preferred_voice] + [fb for fb in fallbacks if fb != preferred_voice]:
        try:
            c = edge_tts.Communicate(text, v)
            buf = bytearray()
            async for chunk in c.stream():
                if chunk["type"] == "audio":
                    buf.extend(chunk["data"])
            if len(buf) > 1000:
                return bytes(buf), v
        except Exception as e:
            await asyncio.sleep(0.2)
    raise RuntimeError(f"Falha ao sintetizar: {text}")

# Linhas de todos os NPCs do Refúgio até o Vendedor
NPC_LINES = [
    # 1. Explorador da Caverna (Jovem da bolsa na entrada)
    {
        "role": "cave_explorer",
        "pt": "Essa caverna é traiçoeira, ela sempre muda a cada entrada, explore com cuidado.",
        "en": "This cave is treacherous, it always changes with every entrance, explore with caution.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": ["pt-BR-FranciscaNeural"],
        "v_en": "en-US-ChristopherNeural",
        "fb_en": ["en-US-BrianNeural", "en-US-GuyNeural"]
    },
    # 2. Ferreiro (Novo ferreiro da forja)
    {
        "role": "blacksmith_welcome",
        "pt": "Ah, um cliente! Chegue mais perto.",
        "en": "Ah, a customer! Come closer.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-BrianNeural",
        "fb_en": ["en-US-RogerNeural", "en-US-EricNeural"]
    },
    {
        "role": "blacksmith_talk1",
        "pt": "Aço bom pede fogo paciente. Em que posso ajudar?",
        "en": "Good steel needs patient fire. How can I help?",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-BrianNeural",
        "fb_en": ["en-US-RogerNeural", "en-US-EricNeural"]
    },
    {
        "role": "blacksmith_talk2",
        "pt": "Traga fragmentos e eu deixo sua lâmina digna do Abismo.",
        "en": "Bring fragments and I'll make your blade worthy of the Abyss.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-BrianNeural",
        "fb_en": ["en-US-RogerNeural", "en-US-EricNeural"]
    },
    {
        "role": "blacksmith_quote",
        "pt": "Traga arma e catalisador para a fusão — eu cuido do fogo.",
        "en": "Bring weapon and catalyst for the fusion — I handle the fire.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-BrianNeural",
        "fb_en": ["en-US-RogerNeural", "en-US-EricNeural"]
    },
    # 3. Herbalista (Nova elfa herbalista de verde)
    {
        "role": "herbalist_greet",
        "pt": "Psst! Poções fresquinhas, direto do caldeirão!",
        "en": "Psst! Fresh potions, straight from the cauldron!",
        "v_pt": "pt-BR-FranciscaNeural",
        "fb_pt": ["pt-BR-ThalitaMultilingualNeural"],
        "v_en": "en-US-AvaNeural",
        "fb_en": ["en-US-EmmaNeural", "en-US-JennyNeural"]
    },
    {
        "role": "herbalist_shop1",
        "pt": "Ervas frescas e um pouco de magia. Do que você precisa?",
        "en": "Fresh herbs and a little magic. What do you need?",
        "v_pt": "pt-BR-FranciscaNeural",
        "fb_pt": ["pt-BR-ThalitaMultilingualNeural"],
        "v_en": "en-US-AvaNeural",
        "fb_en": ["en-US-EmmaNeural", "en-US-JennyNeural"]
    },
    {
        "role": "herbalist_shop2",
        "pt": "Plantei essas flores em terra do Abismo. Curam melhor assim.",
        "en": "I planted these flowers in Abyss soil. They heal better that way.",
        "v_pt": "pt-BR-FranciscaNeural",
        "fb_pt": ["pt-BR-ThalitaMultilingualNeural"],
        "v_en": "en-US-AvaNeural",
        "fb_en": ["en-US-EmmaNeural", "en-US-JennyNeural"]
    },
    {
        "role": "herbalist_shop3",
        "pt": "A dourada protege, mas não dura. Use na hora certa.",
        "en": "The golden one protects, but it doesn't last. Use it at the right moment.",
        "v_pt": "pt-BR-FranciscaNeural",
        "fb_pt": ["pt-BR-ThalitaMultilingualNeural"],
        "v_en": "en-US-AvaNeural",
        "fb_en": ["en-US-EmmaNeural", "en-US-JennyNeural"]
    },
    # 4. Vendedor / Mercador
    {
        "role": "vendor_hub_campaign",
        "pt": "Ouro da sua campanha, mercadoria da boa.",
        "en": "Your campaign gold, fine goods.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-GuyNeural",
        "fb_en": ["en-US-ChristopherNeural", "en-US-BrianNeural"]
    },
    {
        "role": "vendor_hub_quote",
        "pt": "Fragmentos? Aceito. Tudo tem um preço.",
        "en": "Fragments? I take those. Everything has a price.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-GuyNeural",
        "fb_en": ["en-US-ChristopherNeural", "en-US-BrianNeural"]
    },
    {
        "role": "vendor_dungeon1",
        "pt": "Psst… você parece alguém que precisa de uma lâmina que nunca cansa.",
        "en": "Psst… you look like someone who needs a blade that never tires.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-GuyNeural",
        "fb_en": ["en-US-ChristopherNeural", "en-US-BrianNeural"]
    },
    {
        "role": "vendor_dungeon2",
        "pt": "A Lâmina Faminta. Fica mais forte a cada vida que toma. 60 moedas e ela é sua. Sem devoluções.",
        "en": "The Hungry Blade. It grows stronger with every life it takes. 60 coins and it's yours. No returns.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-GuyNeural",
        "fb_en": ["en-US-ChristopherNeural", "en-US-BrianNeural"]
    },
    {
        "role": "vendor_dungeon_reject",
        "pt": "Hm. Voltarei a te oferecer… se você sobreviver.",
        "en": "Hm. I'll offer it again… if you survive.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-GuyNeural",
        "fb_en": ["en-US-ChristopherNeural", "en-US-BrianNeural"]
    },
    {
        "role": "vendor_dungeon_nogold",
        "pt": "Sem moedas, sem lâmina.",
        "en": "No coins, no blade.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-GuyNeural",
        "fb_en": ["en-US-ChristopherNeural", "en-US-BrianNeural"]
    },
    {
        "role": "vendor_dungeon_bought",
        "pt": "Hehe… alimente-a bem.",
        "en": "Hehe… feed it well.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-GuyNeural",
        "fb_en": ["en-US-ChristopherNeural", "en-US-BrianNeural"]
    },
    # 5. Curtidor (Hunter/Tanner no Refúgio)
    {
        "role": "hunter_1",
        "pt": "Couro de fera do Abismo não apodrece. Nem amolece.",
        "en": "Abyss beast hide never rots. Never softens.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-EricNeural",
        "fb_en": ["en-US-BrianNeural"]
    },
    {
        "role": "hunter_2",
        "pt": "Os bonecos de treino ali embaixo aguentam qualquer golpe.",
        "en": "The training dummies down there take any blow.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-EricNeural",
        "fb_en": ["en-US-BrianNeural"]
    },
    {
        "role": "hunter_3",
        "pt": "Esse cão me segue desde que voltei do bosque.",
        "en": "This dog has followed me since I came back from the woods.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-EricNeural",
        "fb_en": ["en-US-BrianNeural"]
    },
    {
        "role": "hunter_4",
        "pt": "Cuidado no portal. Nem tudo que sai de lá é bicho.",
        "en": "Careful at the portal. Not everything that comes out is a beast.",
        "v_pt": "pt-BR-AntonioNeural",
        "fb_pt": [],
        "v_en": "en-US-EricNeural",
        "fb_en": ["en-US-BrianNeural"]
    },
    # 6. Aprendiz (Girl no Refúgio)
    {
        "role": "girl_1",
        "pt": "O mestre está lá dentro. Ele forja melhor quando alguém elogia.",
        "en": "The master is inside. He forges better when praised.",
        "v_pt": "pt-BR-ThalitaMultilingualNeural",
        "fb_pt": ["pt-BR-FranciscaNeural"],
        "v_en": "en-US-AnaNeural",
        "fb_en": ["en-US-AvaNeural", "en-US-EmmaNeural"]
    },
    {
        "role": "girl_2",
        "pt": "Fragmentos abissais viram aço bom. Traga muitos!",
        "en": "Abyssal fragments make good steel. Bring plenty!",
        "v_pt": "pt-BR-ThalitaMultilingualNeural",
        "fb_pt": ["pt-BR-FranciscaNeural"],
        "v_en": "en-US-AnaNeural",
        "fb_en": ["en-US-AvaNeural", "en-US-EmmaNeural"]
    },
    {
        "role": "girl_3",
        "pt": "Já tentou fundir itens? Pergunte na loja BARGANHAS.",
        "en": "Tried fusing items? Ask at the BARGAINS shop.",
        "v_pt": "pt-BR-ThalitaMultilingualNeural",
        "fb_pt": ["pt-BR-FranciscaNeural"],
        "v_en": "en-US-AnaNeural",
        "fb_en": ["en-US-AvaNeural", "en-US-EmmaNeural"]
    },
    {
        "role": "girl_4",
        "pt": "Um dia eu vou forjar a minha própria espada.",
        "en": "One day I'll forge my own sword.",
        "v_pt": "pt-BR-ThalitaMultilingualNeural",
        "fb_pt": ["pt-BR-FranciscaNeural"],
        "v_en": "en-US-AnaNeural",
        "fb_en": ["en-US-AvaNeural", "en-US-EmmaNeural"]
    }
]

async def process_item(item):
    pt_text = item["pt"]
    en_text = item["en"]
    line_id = fnv(pt_text)
    
    pt_path = os.path.join(OUT_PT, f"{line_id}.mp3")
    en_path = os.path.join(OUT_EN, f"{line_id}.mp3")
    
    print(f"[{item['role']}] ID: {line_id}")
    
    # Gerar PT
    pt_bytes, used_pt = await synthesize_robust(pt_text, item["v_pt"], item["fb_pt"])
    with open(pt_path, "wb") as f:
        f.write(pt_bytes)
    dur_pt = get_mp3_duration(pt_path)
    
    # Gerar EN
    en_bytes, used_en = await synthesize_robust(en_text, item["v_en"], item["fb_en"])
    with open(en_path, "wb") as f:
        f.write(en_bytes)
    dur_en = get_mp3_duration(en_path)
    
    # Mirror
    shutil.copy2(pt_path, os.path.join(MIRROR_PT, f"{line_id}.mp3"))
    shutil.copy2(en_path, os.path.join(MIRROR_EN, f"{line_id}.mp3"))
    
    print(f"   -> PT ({used_pt}): {dur_pt}s | EN ({used_en}): {dur_en}s")
    return line_id, pt_text, en_text, dur_pt, dur_en

async def main():
    print("=== INICIANDO GERAÇÃO DE VOZES DE TODOS OS NPCS ===")
    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)
        
    for item in NPC_LINES:
        line_id, pt_text, en_text, dur_pt, dur_en = await process_item(item)
        
        manifest["k"][fnv(pt_text)] = line_id
        manifest["k"][fnv(en_text)] = line_id
        
        clean_pt = pt_text.strip('"').strip()
        clean_en = en_text.strip('"').strip()
        manifest["k"][fnv(clean_pt)] = line_id
        manifest["k"][fnv(clean_en)] = line_id
        
        # In case of quotes wrapped
        manifest["k"][fnv(f'"{clean_pt}"')] = line_id
        manifest["k"][fnv(f'"{clean_en}"')] = line_id
        manifest["k"][fnv(f'“{clean_pt}”')] = line_id
        manifest["k"][fnv(f'“{clean_en}”')] = line_id
        
        manifest["d"][line_id] = {
            "pt": dur_pt,
            "en": dur_en
        }
        
    data = json.dumps(manifest, ensure_ascii=False, indent=2)
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        f.write(data)
    with open(MIRROR_MANIFEST, "w", encoding="utf-8") as f:
        f.write(data)
    print("=== TODAS AS VOZES GERADAS E MANIFESTS SALVOS! ===")

if __name__ == "__main__":
    asyncio.run(main())
