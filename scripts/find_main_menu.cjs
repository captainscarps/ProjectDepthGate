const fs = require('fs');
const bundle = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');
const idx = bundle.indexOf('super("MainMenu")');
console.log('MainMenu at index:', idx);
if (idx !== -1) {
  console.log(bundle.slice(idx - 60, idx + 800));
}
