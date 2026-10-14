const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = code.indexOf('.play(f.sound)');
if (idx !== -1) {
  console.log(code.substring(idx - 150, idx + 250));
}
