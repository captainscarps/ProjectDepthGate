const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = code.indexOf('this.weaponDef.sound');
console.log('weaponDef.sound at', idx);
if (idx !== -1) {
  console.log(code.substring(idx - 100, idx + 400));
}
