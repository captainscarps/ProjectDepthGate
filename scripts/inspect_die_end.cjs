const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

const idx = code.indexOf('this.hpBar.destroy(),this.shadow.destroy(),this.destroy()');
console.log('die end at', idx);
console.log(code.substring(idx - 150, idx + 350));
