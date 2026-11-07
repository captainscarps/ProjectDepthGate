#!/usr/bin/env python3
"""
Gera todas as falas dos Heróis em Português e Inglês usando o Gemini TTS.
Gera os arquivos em assets/audio/voice/pt/ e en/, atualiza o voice-manifest.json e o espelho.
"""

import os
import sys
import json
import base64
import time
import io
import wave
import urllib.request
import urllib.error
import lameenc

sys.stdout.reconfigure(encoding="utf-8")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_PT = os.path.join(ROOT, "assets", "audio", "voice", "pt")
OUT_EN = os.path.join(ROOT, "assets", "audio", "voice", "en")
MIRROR_PT = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "pt")
MIRROR_EN = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "en")
MANIFEST_PATH = os.path.join(ROOT, "assets", "audio", "voice", "voice-manifest.json")
MIRROR_MANIFEST = os.path.join(ROOT, "Projeto atualizado", "assets", "audio", "voice", "voice-manifest.json")

KEY_FILE = os.path.join(ROOT, "scripts", ".api_key.txt")
API_KEY = open(KEY_FILE, "r", encoding="utf-8").read().strip() if os.path.exists(KEY_FILE) else os.environ.get("GEMINI_API_KEY", "")

MODELS = [
    "gemini-2.5-flash-preview-tts",
    "gemini-3.8-flash-lite-tts",
    "gemini-3.8-flash-tts"
]

def fnv(text):
    h = 0x811c9dc5
    b = (' '.join(str(text).strip().split())).encode('utf-16-le')
    for i in range(0, len(b), 2):
        code = b[i] | (b[i+1] << 8)
        h ^= code
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f'{h:08x}'

def wav_to_mp3(wav_bytes):
    try:
        wf = wave.open(io.BytesIO(wav_bytes), "rb")
        sr = wf.getframerate()
        channels = wf.getnchannels()
        nframes = wf.getnframes()
        pcm_raw = wf.readframes(nframes)
        duration = round(nframes / sr, 2)
    except Exception:
        sr = 24000
        channels = 1
        pcm_raw = wav_bytes[44:] if wav_bytes[:4] == b"RIFF" else wav_bytes
        duration = round(len(pcm_raw) / (sr * 2), 2)

    encoder = lameenc.Encoder()
    encoder.set_bit_rate(128)
    encoder.set_in_sample_rate(sr)
    encoder.set_channels(channels)
    encoder.set_quality(2)
    mp3 = encoder.encode(pcm_raw) + encoder.flush()
    return mp3, duration

def generate_gemini(text, prompt_instruction, voice="Puck"):
    instruction = f'{prompt_instruction}: "{text}"' if prompt_instruction else text
    payload = {
        "contents": [{"parts": [{"text": instruction}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {"voiceName": voice}
                }
            }
        }
    }

    last_err = None
    for model in MODELS:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"
        for attempt in range(3):
            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers={"Content-Type": "application/json"}
                )
                with urllib.request.urlopen(req, timeout=30) as resp:
                    data = json.loads(resp.read().decode())
                    cand = data["candidates"][0]["content"]["parts"][0]
                    wav_bytes = base64.b64decode(cand["inlineData"]["data"])
                    return wav_to_mp3(wav_bytes)
            except urllib.error.HTTPError as he:
                last_err = he
                if he.code == 429:
                    time.sleep(4 + attempt * 3)
                else:
                    break
            except Exception as e:
                last_err = e
                time.sleep(1.5)
    raise RuntimeError(f"Erro TTS para '{text[:35]}': {last_err}")

HERO_LINES = [
    # Prólogo do Rio / Barco
    ("47a8c4e7", "Como você sabe tudo isso? Quem é você?", "How do you know all this? Who are you?", "Puck", "com tom de curiosidade e surpresa investigativa", "with a tone of genuine curiosity and wonder"),
    ("5de361e5", "Mostre-se! Por que não aparece?", "Show yourself! Why won't you appear?", "Fenrir", "com voz firme, exigente e desconfiada", "with a demanding, firm and alert tone"),
    ("1c0b8f01", "Coração da Floresta… então é lá que vou descobrir quem é essa voz.", "The Heart of the Forest… so that's where I'll find out whose voice this is.", "Puck", "com tom reflexivo e decidido", "with a thoughtful and resolute tone"),
    ("8707e6fc", "Faz tanto tempo que não vejo uma água tão limpa…", "It's been so long since I've seen water this clear…", "Puck", "com tom nostálgico, sereno e aliviado", "with a nostalgic and serene tone"),
    ("ecc53c38", "Guardiões do selo… e você era um deles? Quem é você, afinal?", "Guardians of the seal… and you were one of them? Who are you, really?", "Fenrir", "com voz imponente, séria e reflexiva", "with a solemn and questioning tone"),
    ("48fb5d34", "Eu também sinto… como se algo me vigiasse entre as árvores.", "I feel it too… as if something were watching me from the trees.", "Fenrir", "com tom cauteloso, atento e em alerta", "with a cautious and guarded tone"),
    ("32d6ac62", "Até os pássaros fogem… preciso aprender a andar mais leve.", "Even the birds fly off… I need to learn to step lighter.", "Puck", "com tom bem-humorado e tranquilo", "with a lighthearted and observant tone"),
    ("e3655ff6", "Patos! Faz tempo que não vejo um lago cheio de vida.", "Ducks! It's been ages since I saw a lake so full of life.", "Puck", "com tom caloroso de admiração e alívio", "with a warm and appreciative tone"),

    # Monólogos no rio
    ("2cf75c4c", "Água fria… mas dá pé.", "Cold water… but I can touch the bottom.", "Puck", "com tom espontâneo e prático", "with a practical and casual tone"),
    ("b7263ee5", "Tem alguma coisa enorme passando embaixo do barco…", "Something huge is passing under the boat…", "Fenrir", "com tom tenso e sussurrado de alerta", "with a tense and hushed tone of suspense"),
    ("5da873e6", "A correnteza está puxando mais forte. Preciso manobrar.", "The current is pulling harder. I need to steer.", "Puck", "com foco e agilidade de aventureiro", "with focus and quick reaction"),
    ("6e420bff", "As ruínas da ponte… a Guardiã falou a verdade.", "The ruins of the bridge… the Guardian spoke the truth.", "Puck", "com tom de confirmação e respeito", "with a tone of revelation and respect"),
    ("ca1a166c", "O píer… finalmente terra firme.", "The pier… dry land at last.", "Puck", "com tom de alívio e prontidão", "with relief and readiness"),
    ("d93a3fa5", "A mata fechou… só resta a trilha agora.", "The woods closed in… only the trail left now.", "Fenrir", "com foco e determinação de guerreiro", "with determination and focus"),
    ("05b10dc4", "Essa névoa… não é natural. Está fria demais.", "This mist… it isn't natural. It's too cold.", "Fenrir", "com cautela e pressentimento sombrio", "with caution and an ominous feeling"),
    ("e9a58e2e", "Senti um arrepio… como se alguém estivesse me chamando lá dentro.", "I felt a chill… as if someone were calling to me from inside.", "Puck", "com leve arrepio e mistério", "with an eerie sense of foreboding"),
    ("814770f5", "O barco aguentou o tranco. Mas não sei se aguenta o caminho de volta.", "The boat held up. But I don't know if it will survive the way back.", "Puck", "com pragmatismo e leve ironia", "with pragmatism and slight irony"),
    ("86f461e6", "Outro viajante… que você encontre a paz que não achou em vida.", "Another traveler… may you find the peace you didn't find in life.", "Fenrir", "com pesar solene e respeito aos mortos", "with solemn reverence and sympathy"),
    ("a789e686", "A estátua… o rosto parece cansado. Como se esperasse há séculos.", "The statue… the face looks weary. As if it has been waiting for centuries.", "Puck", "com empatia e admiração histórica", "with empathy and wonder"),
    ("6b629dcb", "A floresta está sussurrando… ou é a minha cabeça?", "The forest is whispering… or is it just in my head?", "Puck", "com tom sussurrado e intrigado", "with an intrigued and quiet tone"),
    ("a6ac06fd", "O ar aqui é mais pesado… as Profundezas estão perto.", "The air is heavier here… the Depths are near.", "Fenrir", "com voz grave e alerta ao perigo", "with a grave voice bracing for battle"),
    ("a3043c6e", "Preciso me apressar. Não posso perder mais tempo.", "I need to hurry. I can't waste any more time.", "Puck", "com urgência e determinação", "with urgency and grit"),

    # Missões / Quests
    ("5fc59cba", "É a letra do meu irmão mais velho… AKIHIRO.", "It's the handwriting of my older brother… AKIHIRO.", "Puck", "com surpresa e emoção familiar", "with deep personal emotion and surprise"),
    ("a19991f7", "É a letra do meu irmão… HAYATO.", "It's the handwriting of my brother… HAYATO.", "Fenrir", "com tom emocionado e afetuoso", "with brotherly affection and recognition"),
    ("c3558df0", "Você veio. Eu sabia que viria.", "You came. I knew you would.", "Fenrir", "com alívio e calor fraterno", "with brotherly warmth and relief"),
    ("b0cda755", "Nunca deixaria você sozinho. Nem aqui, nem em lugar nenhum.", "I would never leave you alone. Not here, not anywhere.", "Fenrir", "com lealdade inabalável e firmeza", "with unwavering loyalty and brotherhood"),
    ("e86dbb72", "Conseguimos… como quando éramos crianças, lembra?", "We did it… just like when we were kids, remember?", "Puck", "com alegria e nostalgia", "with joyful nostalgia"),
    ("c2e1bb08", "Lembro. Você sempre chegava atrasado.", "I remember. You were always late.", "Fenrir", "com um sorriso na voz e afeto", "with an affectionate smile in the voice"),
    ("26838783", "Avô? O senhor é… um dos pajés do igapó?", "Grandfather? Are you… one of the shamans of the igapó?", "Puck", "com respeito e assombro espiritual", "with deep spiritual respect and wonder"),
    ("8660d473", "Quem é o senhor?", "Who are you, sir?", "Puck", "com tom respeitoso e curioso", "with polite inquiry"),
    ("b88eb3cb", "O Observador…", "The Beholder…", "Fenrir", "com sussurro temeroso e sombrio", "with an ominous and hushed whisper"),
    ("89a9e18e", "Bispo! Mostre o que está bordado no seu manto.", "Bishop! Show what is embroidered on your mantle.", "Fenrir", "com autoridade e confronto imponente", "with stern authority and demand"),
    ("458b00a2", "Fique perto de mim. Vou te tirar daqui.", "Stay close to me. I will get you out of here.", "Fenrir", "com tom protetor, firme e acolhedor", "with a protective and reassuring tone"),
    ("951675a6", "Me perdoe. Eu não fui rápido o bastante.", "Forgive me. I was not fast enough.", "Fenrir", "com dor, remorso e pesar profundo", "with deep sorrow and remorse"),
    ("5b30a0d1", "Uma senhora… na Floresta da Cripta. Ela me deu uma fruta e insistiu que eu comesse.", "An old lady… in the Crypt Forest. She gave me a fruit and insisted that I eat it.", "Puck", "com tom reflexivo e desconfiado", "with suspicious recollection"),
    ("7dddefcf", "Você me envenenou!", "You poisoned me!", "Fenrir", "com raiva, choque e traição", "with fury, betrayal and sudden shock"),
    ("0358ee46", "Desfaça o feitiço. Agora.", "Break the spell. Now.", "Fenrir", "com ameaça gélida, cortante e firme", "with a cold, commanding and deadly threat"),
    ("79e01c91", "Essa missão foi mais difícil do que deveria ser… o que será?", "This quest was harder than it should have been… what could it be?", "Puck", "com cansaço e dúvida crescente", "with exhaustion and growing suspicion"),
    ("be268be4", "Minhas pernas pesam como pedra… isso não é normal.", "My legs feel heavy as stone… this is not normal.", "Fenrir", "com respiração pesada e preocupação", "with heavy breathing and growing dread"),
    ("6e833bf7", "Antes eu aguentava muito mais. O que está acontecendo comigo?", "I used to endure much more. What is happening to me?", "Puck", "com fraqueza e espanto genuíno", "with weakness and genuine bewilderment"),
    ("b8decd05", "Cada selo me deixa mais fraco… ou é impressão minha?", "Each seal leaves me weaker… or is it just my impression?", "Fenrir", "com tom sombrio e desconfiado", "with a dark and troubled realization")
]

def main():
    print("====================================================")
    print("    DEPTHGATE - GERAÇÃO VOZES DOS HERÓIS (GEMINI)   ")
    print("====================================================")
    print(f"Total de falas a processar: {len(HERO_LINES)}\n")

    with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    for idx, (lid, pt_text, en_text, voice, pt_prompt, en_prompt) in enumerate(HERO_LINES, 1):
        print(f"[{idx:02d}/{len(HERO_LINES)}] {lid} ({voice}): \"{pt_text[:35]}...\"", end="", flush=True)

        # 1. PT
        pt_mp3, pt_dur = generate_gemini(pt_text, pt_prompt, voice)
        with open(os.path.join(OUT_PT, f"{lid}.mp3"), "wb") as f: f.write(pt_mp3)
        with open(os.path.join(MIRROR_PT, f"{lid}.mp3"), "wb") as f: f.write(pt_mp3)

        # 2. EN
        en_mp3, en_dur = generate_gemini(en_text, en_prompt, voice)
        with open(os.path.join(OUT_EN, f"{lid}.mp3"), "wb") as f: f.write(en_mp3)
        with open(os.path.join(MIRROR_EN, f"{lid}.mp3"), "wb") as f: f.write(en_mp3)

        # 3. Manifest update
        h_pt = fnv(pt_text)
        h_en = fnv(en_text)
        manifest["k"][h_pt] = lid
        manifest["k"][h_en] = lid
        manifest["k"][lid] = lid
        manifest["d"][lid] = {"pt": pt_dur, "en": en_dur}

        print(f" ✓ OK (PT: {pt_dur}s, EN: {en_dur}s)")
        time.sleep(0.35)

    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    with open(MIRROR_MANIFEST, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    print("\n✓ voice-manifest.json atualizado com todas as falas dos heróis em PT e EN!")
    print("====================================================")

if __name__ == "__main__":
    main()

