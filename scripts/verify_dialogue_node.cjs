const fs = require('fs');

const manifest = JSON.parse(fs.readFileSync('assets/audio/voice/voice-manifest.json', 'utf-8'));
const jsContent = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf-8');

function fnv(text) {
  let h = 0x811C9DC5;
  const b = Buffer.from(text, 'utf16le');
  for (let i = 0; i < b.length; i += 2) {
    h ^= b[i] | (b[i + 1] << 8);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

const testDialogues = [
  {
    pt: "Espere. Uma carta atravessou um dos portais. Está selada com um brasão que você conhece.",
    en: "Wait. A letter crossed one of the gates. It is sealed with a crest you know."
  },
  {
    pt: "O templo fica além do último selo que você fechou. Vou abrir o caminho. Tragam um ao outro de volta.",
    en: "The temple lies beyond the last seal you closed. I will open the way. Bring each other back."
  },
  {
    pt: "Cuidado. Esta névoa esconde mais do que túmulos. Siga até o covil do Cérbero e acabe com ele.",
    en: "Careful. This mist hides more than tombs. Make your way to the Cerberus lair and destroy it."
  },
  {
    pt: "A bruxa ainda prende você. Vou te levar até a casa dela.",
    en: "The witch still binds you. I will take you to her house."
  }
];

let allPassed = true;
for (const d of testDialogues) {
  const lid = fnv(d.pt);
  const hEn = fnv(d.en);

  const ptInK = manifest.k[lid] === lid;
  const enInK = manifest.k[hEn] === lid;
  const hasD = manifest.d[lid] && manifest.d[lid].pt > 0 && manifest.d[lid].en > 0;
  const inBundle = jsContent.includes(d.en);

  console.log(`[TEST] LID: ${lid} | PT in manifest: ${ptInK} | EN in manifest: ${enInK} | Durs: ${JSON.stringify(manifest.d[lid])} | In Bundle: ${inBundle}`);

  if (!ptInK || !enInK || !hasD || !inBundle) {
    allPassed = false;
  }
}

if (allPassed) {
  console.log("\nALL CHECKED SAMPLES PASSED PERFECTLY!");
} else {
  process.exit(1);
}
