const fs = require('fs');
const bundle = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');
const cutsceneIdx = bundle.indexOf('class Xd extends j.Scene');
console.log(bundle.slice(cutsceneIdx + 9000, cutsceneIdx + 13000));
