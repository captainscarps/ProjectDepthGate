const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = 2311535;
console.log(code.substring(idx - 250, idx + 250));
