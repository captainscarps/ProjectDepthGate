const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');
const sIdx = code.indexOf('case"skeleton-death":');
console.log('sIdx:', sIdx);
if (sIdx !== -1) {
  console.log(code.substring(sIdx, sIdx + 1200));
}
