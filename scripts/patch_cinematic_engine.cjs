const fs = require('fs');
let bundle = fs.readFileSync('assets/index-D6qIWtA7-p209.js', 'utf8');

// We want to upgrade Cutscene scene to use GSAP, cinematic letterbox, dramatic camera,
// dynamic typewriter text, character portraits, particles and synchronized sound effects.
// Let's inspect where class Xd extends j.Scene is.
const cutsceneClassStr = 'class Xd extends j.Scene';
const idx = bundle.indexOf(cutsceneClassStr);
if (idx === -1) {
  console.error("Could not find Cutscene class!");
  process.exit(1);
}

console.log("Found Cutscene class at", idx);
