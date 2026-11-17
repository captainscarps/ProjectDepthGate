"""Relatório das vozes PT que faltam (Gemini TTS), para gerar em outro computador.

Lista, fala por fala, o que os geradores ainda fariam — sem chamar a API:
  prologo  — falas do herói no prólogo (generate_prologue_hero_voices.py --sem-volta)
  volta    — monólogos da viagem de volta (generate_prologue_hero_voices.py)
  exclusiva— falas que só um herói diz (generate_pt_fixes_gemini.py exclusivas)
  eco      — vozes dos Antigos (generate_pt_fixes_gemini.py ecos)
Para cada uma: arquivo de saída, personagem, voz Gemini, instrução de direção (persona + sentimento) e texto.

Uso: NODE_PATH=<pasta com acorn> python3 scripts/pt_voice_todo.py [pasta de saída]   (padrão docs/vozes-pt)
Saída: vozes-pendentes.md (leitura), vozes-pendentes.csv (planilha) e vozes-pendentes.json (para scripts).
"""
import csv
import importlib.util
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.argv, _a = sys.argv[:1] + ["--only", "pt"], sys.argv
spec = importlib.util.spec_from_file_location("fixes", os.path.join(ROOT, "scripts", "generate_pt_fixes_gemini.py"))
F = importlib.util.module_from_spec(spec); spec.loader.exec_module(F)
sys.argv = _a
P, V, D, HV = F.P, F.V, F.D, F.HV


def todo():
    man = json.load(open(V.MANIFEST_PATH, encoding="utf-8"))
    out = []
    # prólogo e volta (mesma ordem do gerador: prólogo antes da volta)
    sys.argv = [sys.argv[0], "--sem-volta"]; pro = {r[0] for r in P.lines()}
    sys.argv = [sys.argv[0]]; allv = P.lines()
    for pt, en, classes in allv:
        lid = man["k"].get(V.fnv(pt)) or V.fnv(pt)
        bc = man["d"].get(lid, {}).get("byClass", {}).get("pt", {})
        for c in classes:
            if not (bc.get(c) and os.path.isfile(os.path.join(V.OUT_PT, f"{lid}-{c}.mp3"))):
                out.append(dict(grupo="prologo" if pt in pro else "volta", arquivo=f"{lid}-{c}.mp3", personagem=c,
                                voz=HV.VOICES[c], instrucao=D.instruction(c, pt), texto=pt, ingles=en))
    for ln in F.story_lines():
        v = ln["voice"]
        if v.startswith("hero-"):
            who, voz, g = v[5:], HV.VOICES.get(v[5:]), "exclusiva"
        elif v in F.ECHO:
            who, voz, g = v, F.ECHO[v][0], "eco"
        else:
            continue
        lid = man["k"].get(V.fnv(ln["text"]))
        if not lid or lid not in man["d"] or man["d"][lid].get("gpt"):
            continue
        t = F.tts_text(ln["text"])
        arq = f"{lid}.mp3" + (f" e {lid}-{who}.mp3" if g == "exclusiva" else "")
        out.append(dict(grupo=g, arquivo=arq, personagem=who, voz=voz, instrucao=D.instruction(who, t), texto=t, ingles=""))
    return out


def main():
    dest = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "docs", "vozes-pt")
    os.makedirs(dest, exist_ok=True)
    rows = todo()
    json.dump(rows, open(os.path.join(dest, "vozes-pendentes.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    with open(os.path.join(dest, "vozes-pendentes.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, ["grupo", "arquivo", "personagem", "voz", "instrucao", "texto", "ingles"]); w.writeheader(); w.writerows(rows)
    cnt = {}
    for r in rows:
        cnt[r["grupo"]] = cnt.get(r["grupo"], 0) + 1
    open(os.path.join(dest, "vozes-pendentes.md"), "w", encoding="utf-8").write(report(rows, cnt))
    print(json.dumps(cnt, ensure_ascii=False), len(rows))


NOMES = {"prologo": "Prólogo (falas do herói)", "volta": "Viagem de volta (monólogos)",
         "exclusiva": "Falas exclusivas de cada herói", "eco": "Ecos dos Antigos"}
CMD = {"prologo": "python3 -u scripts/generate_prologue_hero_voices.py --only pt --sem-volta --model {m}",
       "volta": "python3 -u scripts/generate_prologue_hero_voices.py --only pt --model {m}",
       "exclusiva": "python3 -u scripts/generate_pt_fixes_gemini.py exclusivas --model {m}",
       "eco": "python3 -u scripts/generate_pt_fixes_gemini.py ecos --model {m}"}


def report(rows, cnt):
    md = ["# Vozes em português que faltam (Gemini TTS)", "",
          f"Total: **{len(rows)} falas** — " + ", ".join(f"{NOMES[g]}: {n}" for g, n in cnt.items()) + ".", "",
          "Gerado por `scripts/pt_voice_todo.py` a partir do manifesto (`assets/audio/voice/voice-manifest.json`) e do jogo; "
          "rode de novo para atualizar a lista (o que já foi gravado sai dela).", "",
          "O prólogo e os monólogos da volta já estão completos (cada herói com a sua voz). As falas abaixo já tocam no jogo, "
          "mas foram gravadas antes da direção de voz atual (algumas com a voz de outro personagem); regravar deixa cada "
          "personagem com uma voz só, no tom e no sentimento certos.", "",
          "## Como gerar em outro computador", "",
          "1. Clone o repositório e instale: Python 3 com `numpy librosa lameenc`, o `ffmpeg` no PATH e Node com `npm i acorn acorn-walk` "
          "(numa pasta qualquer; aponte `NODE_PATH` para a `node_modules` dela).",
          "2. Defina a chave **só no terminal** (nunca grave em arquivo do repositório): `export GEMINI_API_KEY=...` "
          "(Windows PowerShell: `$env:GEMINI_API_KEY=\"...\"`).",
          "3. Rode cada etapa primeiro com `gemini-2.5-pro-preview-tts`; quando parar com 429 (cota do dia), repita a mesma etapa com "
          "`gemini-2.5-flash-preview-tts`. Os scripts só fazem o que falta, então dá para parar e voltar no dia seguinte.", ""]
    for g in ("prologo", "exclusiva", "eco", "volta"):
        if g in cnt:
            md.append(f"   - {NOMES[g]}: `{CMD[g].format(m='gemini-2.5-pro-preview-tts')}`")
    md += ["",
           "4. Confira com `python3 scripts/audit_pt_voices.py` e com `python3 scripts/pt_voice_todo.py` (a lista deve zerar).",
           "5. Faça commit de `assets/audio/voice/pt/` e do `voice-manifest.json` e envie para o GitHub.", "",
           "Como cada fala é dirigida (já está nos scripts, em `scripts/pt_voice_direction.py`): no máximo 2 tiradas por fala; "
           "cada personagem tem a sua voz Gemini, que nenhum outro usa; a instrução diz a persona e o sentimento lido do texto; "
           "o tom é medido e ajustado em no máximo 8% para ficar no tom médio do personagem; os ecos recebem o efeito de fantasma.", "",
           "## Vozes", "", "| Personagem | Voz Gemini | Persona |", "|---|---|---|"]
    seen = {}
    for r in rows:
        seen.setdefault(r["personagem"], r["voz"])
    for c, v in seen.items():
        md.append(f"| {c} | {v} | {D.PERSONA.get(c, '')} |")
    for g in ("prologo", "exclusiva", "eco", "volta"):
        rs = [r for r in rows if r["grupo"] == g]
        if not rs:
            continue
        md += ["", f"## {NOMES[g]} ({len(rs)})", "", "| # | Arquivo | Personagem | Voz | Sentimento pedido | Texto |", "|---|---|---|---|---|---|"]
        for i, r in enumerate(rs, 1):
            feel = r["instrucao"].split(", ", 2)[-1].rsplit(". Diga", 1)[0]
            txt = r["texto"].replace("|", "\\|").replace("\n", " ")
            md.append(f"| {i} | `{r['arquivo']}` | {r['personagem']} | {r['voz']} | {feel} | {txt} |")
    md += ["", "A lista completa, com a instrução exata enviada ao Gemini, está em `vozes-pendentes.csv` e `vozes-pendentes.json`.", ""]
    return "\n".join(md)


if __name__ == "__main__":
    main()
