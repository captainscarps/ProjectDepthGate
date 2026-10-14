const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const p = code.indexOf('engine?.step(');
console.log('engine.step at', p);
if (p !== -1) {
  console.log(code.substring(p - 100, p + 200));
}

// Find where step is implemented on the audio engine
let p2 = 0;
while (true) {
  const idx = code.indexOf('step(', p2);
  if (idx === -1) break;
  console.log('step( at', idx, ':', code.substring(idx - 30, idx + 100));
  p2 = idx + 1;
}
