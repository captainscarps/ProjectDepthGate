const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = 1613961;
const end = code.indexOf('class ', idx);
const chunk = code.substring(idx, end);
const bossKeys = [...chunk.matchAll(/([A-Z0-9_]+):\{name:/g)].map(m => m[1]);
console.log('Bosses:', bossKeys);
