const fs = require('fs');
const bundle = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');
const regex = /scene\.start\(["']Cutscene["']/g;
let m;
while ((m = regex.exec(bundle)) !== null) {
  console.log('Found Cutscene start at:', m.index);
  console.log(bundle.slice(Math.max(0, m.index - 80), Math.min(bundle.length, m.index + 260)));
  console.log('---');
}
