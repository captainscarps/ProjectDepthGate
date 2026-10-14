const fs = require('fs');
const bundle = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');
const wdIdx = bundle.indexOf('const Wd=');
console.log('const Wd= at index:', wdIdx);
if (wdIdx !== -1) {
  console.log(bundle.slice(wdIdx, wdIdx + 3000));
}
