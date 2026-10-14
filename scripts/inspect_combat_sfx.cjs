const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = code.indexOf('case"warrior-whirlwind":');
console.log('warrior-whirlwind at', idx);
if (idx !== -1) {
  console.log(code.substring(idx - 600, idx + 1000));
}
