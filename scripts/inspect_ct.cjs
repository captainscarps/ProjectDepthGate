const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = code.indexOf('const Ct={PLAYER_HURT:');
console.log('Ct at', idx);
if (idx !== -1) {
  console.log(code.substring(idx - 100, idx + 1200));
}
