const fs = require('fs');
const bundle = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');
const pvidIdx = bundle.indexOf('function __playVideos');
console.log(bundle.slice(pvidIdx, pvidIdx + 4500));
