const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = 2096768;
console.log(code.substring(idx - 600, idx + 1400));
