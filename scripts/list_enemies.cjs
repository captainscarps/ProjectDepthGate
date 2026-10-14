const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const matches = [...code.matchAll(/([A-Z0-9_]+):\{name:[^,]+,texture:"([^"]+)"/g)];
console.log('Unique textures/names:', matches.slice(0, 30).map(m => `${m[1]}: ${m[2]}`));
