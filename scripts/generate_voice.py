#!/usr/bin/env python3
"""
Gerador de Vozes Gemini TTS para o DepthGate
Uso:
    python scripts/generate_voice.py --text "Olá, viajante!" --lang pt --voice Fenrir --prompt "Voz grave e sábia"
"""

import os
import sys
import json
import base64
import wave
import io
import argparse
import urllib.request
import urllib.error
import lameenc

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API_KEY = os.environ.get('GEMINI_API_KEY')
MODEL = 'gemini-2.5-flash-preview-tts'

VOICES = {
    'Fenrir': 'Homem forte, grave, encorpada (Ferreiro, Guerreiro)',
    'Kore': 'Mulher suave, acolhedora, serena (Herbalista, Maga)',
    'Puck': 'Jovem energético, impulsivo (Arqueiro, Ladina)',
    'Aoede': 'Mulher madura, sofisticada, mística',
    'Charon': 'Homem sombrio, cansado, misterioso (Necromante, Caçador)'
}

def fnv1a_32(text: str) -> str:
    """Calcula o hash FNV-1a 32-bit (UTF-16LE) idêntico ao runtime do jogo."""
    t = ' '.join(str(text or '').strip().split())
    h = 0x811c9dc5
    buf = t.encode('utf-16le')
    for i in range(0, len(buf), 2):
        code = buf[i] | (buf[i + 1] << 8)
        h ^= code
        h = (h * 0x01000193) & 0xFFFFFFFF
    return f'{h:08x}'

def synthesize(text: str, voice_name: str, prompt_instruction: str = None) -> tuple[bytes, float]:
    url = f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}'
    instruction = f'{prompt_instruction}: "{text}"' if prompt_instruction else text
    payload = {
        'contents': [{'parts': [{'text': instruction}]}],
        'generationConfig': {
            'responseModalities': ['AUDIO'],
            'speechConfig': {
                'voiceConfig': {
                    'prebuiltVoiceConfig': {'voiceName': voice_name}
                }
            }
        }
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    with urllib.request.urlopen(req, timeout=30) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        cand = res['candidates'][0]['content']['parts'][0]
        raw = base64.b64decode(cand['inlineData']['data'])

    sr = 24000
    if raw[:4] == b'RIFF':
        wf = wave.open(io.BytesIO(raw), 'rb')
        sr = wf.getframerate()
        pcm = wf.readframes(wf.getnframes())
    else:
        pcm = raw

    encoder = lameenc.Encoder()
    encoder.set_bit_rate(128)
    encoder.set_in_sample_rate(sr)
    encoder.set_channels(1)
    encoder.set_quality(2)
    mp3 = encoder.encode(pcm) + encoder.flush()
    duration = round(len(pcm) / (sr * 2), 2)
    return mp3, duration

def update_manifest(manifest_path: str, text_hash: str, duration: float):
    if not os.path.exists(manifest_path):
        return
    with open(manifest_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    data.setdefault('k', {})[text_hash] = text_hash
    data.setdefault('d', {})[text_hash] = duration
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def main():
    parser = argparse.ArgumentParser(description='Gerador de Dublagem Gemini TTS para DepthGate')
    parser.add_argument('--text', required=True, help='Texto da fala do personagem')
    parser.add_argument('--lang', default='pt', choices=['pt', 'en', 'es'], help='Idioma (pt, en, es)')
    parser.add_argument('--voice', default='Fenrir', choices=list(VOICES.keys()), help='Voz do Gemini')
    parser.add_argument('--prompt', default=None, help='Direção de atuação (ex: "Fale com tom caloroso e misterioso")')
    args = parser.parse_args()

    text_hash = fnv1a_32(args.text)
    print(f'Texto: "{args.text}"')
    print(f'Idioma: {args.lang.upper()} | Voz: {args.voice} | Hash FNV-1a: {text_hash}')
    
    print('Sintetizando com Gemini Flash TTS...')
    mp3_bytes, duration = synthesize(args.text, args.voice, args.prompt)
    print(f'✓ Áudio sintetizado: {duration} segundos ({len(mp3_bytes)} bytes)')

    # Destinos
    destinations = [
        os.path.join(ROOT, 'assets', 'audio', 'voice', args.lang, f'{text_hash}.mp3'),
        os.path.join(ROOT, 'Projeto atualizado', 'assets', 'audio', 'voice', args.lang, f'{text_hash}.mp3')
    ]
    manifests = [
        os.path.join(ROOT, 'assets', 'audio', 'voice', 'voice-manifest.json'),
        os.path.join(ROOT, 'Projeto atualizado', 'assets', 'audio', 'voice', 'voice-manifest.json')
    ]

    for dest in destinations:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest, 'wb') as f:
            f.write(mp3_bytes)
        print(f'✓ Salvo em: {os.path.relpath(dest, ROOT)}')

    for mf in manifests:
        update_manifest(mf, text_hash, duration)
        print(f'✓ Manifest atualizado: {os.path.relpath(mf, ROOT)}')

    print('\n✓ Sucesso! O áudio já está registrado e pronto para tocar no jogo via:')
    print(f'  window.__dub("{args.text}");')

if __name__ == '__main__':
    main()
