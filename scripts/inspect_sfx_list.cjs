const fs = require('fs');
const code = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');
const sfxSectionIdx = code.indexOf('play(i,t){');
if (sfxSectionIdx !== -1) {
  const chunk = code.substring(sfxSectionIdx, sfxSectionIdx + 4000);
  console.log(chunk);
}
