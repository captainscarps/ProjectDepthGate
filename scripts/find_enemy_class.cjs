const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = code.indexOf('class Enemy extends');
if (idx !== -1) {
  console.log(code.substring(idx, idx + 1000));
} else {
  const idx2 = code.indexOf('takeDamage(');
  console.log('takeDamage at', idx2);
  console.log(code.substring(idx2 - 100, idx2 + 600));
}
