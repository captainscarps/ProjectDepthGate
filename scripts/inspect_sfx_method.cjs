const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = code.indexOf('sfx(i,t=null){');
if (idx !== -1) {
  console.log(code.substring(idx, idx + 2500));
} else {
  const idx2 = code.indexOf('sfx(');
  console.log('sfx at', idx2);
  console.log(code.substring(idx2, idx2 + 1000));
}
