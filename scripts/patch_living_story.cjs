const fs = require('fs');

const bundlePath = 'assets/index-D6qIWtA7-p209.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');

const originalBlock = fs.readFileSync('scripts/play_videos_original.js', 'utf8');
const replacementBlock = fs.readFileSync('scripts/living_story_cinematic_engine.js', 'utf8') + '\n';

if (!bundle.includes(originalBlock)) {
  console.error('Error: original play_videos block not found in bundle!');
  process.exit(1);
}

bundle = bundle.replace(originalBlock, replacementBlock);
fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log('Successfully replaced __playVideos with Living Story Cinematic Engine in assets/index-D6qIWtA7-p209.js!');

const mirrorPath = 'Projeto atualizado/assets/index-D6qIWtA7-p209.js';
if (fs.existsSync(mirrorPath)) {
  fs.writeFileSync(mirrorPath, bundle, 'utf8');
  console.log('Successfully synced to Projeto atualizado!');
}
