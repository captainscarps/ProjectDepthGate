const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = 2113591;
console.log('Boss methods at', idx);
console.log(code.substring(idx - 200, idx + 1000));
