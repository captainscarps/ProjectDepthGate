const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

// Find all audio references in abilities
const abilities = ["FIREBALL", "ARCANE_BLAST", "METEOR", "REPULSE", "ICE_SHARDS", "ARROW", "PIERCING_ARROW"];
for (const a of abilities) {
  const p = code.indexOf(`id:"${a}"`);
  if (p !== -1) {
    console.log(a, ':', code.substring(p - 30, p + 250));
  }
}
