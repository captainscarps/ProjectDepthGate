const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

for (const p of ['.play(i.sound)', '.play(t.sound)', '.play(d.sound)', '.play(e.sound)']) {
  const idx = code.indexOf(p);
  if (idx !== -1) {
    console.log('---', p, '---');
    console.log(code.substring(idx - 100, idx + 200));
  }
}
