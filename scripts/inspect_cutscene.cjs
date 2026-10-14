const fs = require('fs');
const bundle = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');
const cutsceneIdx = bundle.indexOf('super("Cutscene")');
console.log('super("Cutscene") at index:', cutsceneIdx);
if (cutsceneIdx !== -1) {
  console.log(bundle.slice(cutsceneIdx - 50, cutsceneIdx + 2000));
}
