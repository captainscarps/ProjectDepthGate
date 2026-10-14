const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = 2098241;
console.log(code.substring(idx, idx + 800));
