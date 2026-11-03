const fs = require('fs');
const path = require('path');

console.log("=== TESTE DE INTEGRIDADE DAS VOZES DO PAJÉ (NHEENGATU / IDOSO) ===");

const ROOT = path.resolve(__dirname, '..');
const manifestPath = path.join(ROOT, 'assets', 'audio', 'voice', 'voice-manifest.json');
const manifestMirrorPath = path.join(ROOT, 'Projeto atualizado', 'assets', 'audio', 'voice', 'voice-manifest.json');

const mf = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const mfMirror = JSON.parse(fs.readFileSync(manifestMirrorPath, 'utf8'));

// FNV-1a 32-bit hash function as used by the game engine
function fnv(text) {
    const t = String(text || '').trim().replace(/\s+/g, ' ');
    let h = 0x811c9dc5;
    const buf = Buffer.from(t, 'utf16le');
    for (let i = 0; i < buf.length; i += 2) {
        h ^= buf[i] | (buf[i + 1] << 8);
        h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
}

const PAJE_LINES = [
    {
        pt: "Kunhã… filha da mata. Eu sentia o seu cheiro de urucum desde o outro lado do portal.",
        en: "Kunhã… daughter of the forest. I could smell your annatto from the other side of the gate."
    },
    {
        pt: "O último que sobrou. Quando começaram a construir portais novos, o nosso selo velho rachou. Atravessei para segurá-lo.",
        en: "The last one left. When they began building new gates, our ancient seal cracked. I crossed over to hold it."
    },
    {
        pt: "Roubaram as três coisas sagradas do ritual. Sem elas, não consigo fechar a rachadura.",
        en: "They stole the three sacred objects of the ritual. Without them, I cannot mend the fracture."
    },
    {
        pt: "Hm. Mais um forasteiro tocado pelas Profundezas.",
        en: "Hm. Another outlander touched by the Depths."
    },
    {
        pt: "Um velho que segura uma porta que não quer ficar fechada. Roubaram as coisas sagradas do meu ritual.",
        en: "An old man holding a door that refuses to stay shut. They stole the sacred relics of my ritual."
    },
    {
        pt: "Se as encontrar pelo caminho, traga para mim. Talvez você sirva para alguma coisa.",
        en: "If you find them on your path, bring them to me. Perhaps you may be of some use after all."
    },
    {
        pt: "Ainda faltam 3. A mata espera.",
        en: "There are still 3 missing. The forest waits."
    },
    {
        pt: "Ainda faltam 2. A mata espera.",
        en: "There are still 2 missing. The forest waits."
    },
    {
        pt: "Ainda faltam 1. A mata espera.",
        en: "There is still 1 missing. The forest waits."
    },
    {
        pt: "Ainda falta 1. A mata espera.",
        en: "There is still 1 missing. The forest waits."
    },
    {
        pt: "Tudo aqui. Segure o maracá comigo, kunhã. Cante comigo.",
        en: "Everything is here. Hold the maracá with me, kunhã. Sing with me."
    },
    {
        pt: "Tudo aqui… você trouxe mesmo. Afaste-se.",
        en: "Everything is here… you truly brought it. Step back."
    },
    {
        pt: "O igapó respira de novo. Leve a bênção da mata: ela vai segurar a sua vida como segurou a minha.",
        en: "The flooded forest breathes once more. Take the forest's blessing: it will sustain your life as it did mine."
    },
    {
        pt: "E ouça, kunhã: quem constrói os portais novos usa o mesmo símbolo do castelo. O olho. Cuidado com ele.",
        en: "And listen, kunhã: whoever builds the new gates bears the same symbol as the castle. The eye. Beware of it."
    }
];

let allPassed = true;

PAJE_LINES.forEach((line, idx) => {
    const h_pt = fnv(line.pt);
    const h_en = fnv(line.en);

    const inManifestK_pt = mf.k[h_pt] === h_pt;
    const targetHash_en = mf.k[h_en];
    const inManifestK_en = targetHash_en && mf.d[targetHash_en];
    const durEntry = mf.d[h_pt];

    if (!inManifestK_pt || !inManifestK_en || !durEntry) {
        console.error(`FAIL: Missing manifest entries for line ${idx + 1} (${h_pt})`);
        allPassed = false;
        return;
    }

    const ptAudioPath = path.join(ROOT, 'assets', 'audio', 'voice', 'pt', `${h_pt}.mp3`);
    const enAudioPath = path.join(ROOT, 'assets', 'audio', 'voice', 'en', `${h_pt}.mp3`);
    const ptMirrorPath = path.join(ROOT, 'Projeto atualizado', 'assets', 'audio', 'voice', 'pt', `${h_pt}.mp3`);
    const enMirrorPath = path.join(ROOT, 'Projeto atualizado', 'assets', 'audio', 'voice', 'en', `${h_pt}.mp3`);

    const files = [ptAudioPath, enAudioPath, ptMirrorPath, enMirrorPath];
    for (const f of files) {
        if (!fs.existsSync(f)) {
            console.error(`FAIL: File does not exist: ${f}`);
            allPassed = false;
        } else {
            const sz = fs.statSync(f).size;
            if (sz < 1000) {
                console.error(`FAIL: File too small (${sz} bytes): ${f}`);
                allPassed = false;
            }
        }
    }

    console.log(`[PASS ${idx + 1}/14] [${h_pt}] Dur: ${durEntry.pt}s | PT size: ${fs.statSync(ptAudioPath).size}b | "${line.pt.slice(0, 30)}..."`);
});

if (allPassed) {
    console.log("\n=== RESULTADO: TODOS OS TESTES PASSARAM COM SUCESSO (100% OK) ===");
    process.exit(0);
} else {
    console.error("\n=== RESULTADO: HOUVE FALHAS NA VALIDAÇÃO ===");
    process.exit(1);
}
