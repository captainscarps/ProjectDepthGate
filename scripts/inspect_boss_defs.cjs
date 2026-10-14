const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = code.indexOf('const Yt=');
if (idx !== -1) {
  console.log(code.substring(idx, idx + 1500));
}
