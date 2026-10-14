const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

// Find case "hit" and other combat sounds
const hitIdx = code.indexOf('case"hit":');
console.log('case "hit":', hitIdx);
if (hitIdx !== -1) {
  console.log(code.substring(hitIdx - 20, hitIdx + 300));
}

// Find case "shield-block"
const blockIdx = code.indexOf('case"shield-block":');
console.log('case "shield-block":', blockIdx);
if (blockIdx !== -1) {
  console.log(code.substring(blockIdx - 20, blockIdx + 300));
}
