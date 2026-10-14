const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = 2300732;
console.log(code.substring(idx - 200, idx + 800));
