const fs = require('fs');
const bundle = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');
console.log(bundle.slice(2006620 - 200, 2006620 + 400));
