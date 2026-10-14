const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

// Find all occurrences of "set.ambient"
let p = 0;
while (true) {
  const idx = code.indexOf('"set.ambient":', p);
  if (idx === -1) break;
  console.log(code.substring(idx - 10, idx + 60));
  p = idx + 1;
}

// Find how footsteps are currently played
console.log('--- Searching footsteps ---');
let p2 = 0;
while (p2 < 3000000) {
  const idx = code.indexOf('stepT', p2);
  if (idx === -1) break;
  console.log('stepT at', idx, ':', code.substring(idx - 50, idx + 150));
  p2 = idx + 1;
}
