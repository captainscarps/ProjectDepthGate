const fs = require('fs');

const bundlePath = 'assets/index-D6qIWtA7-p209.js';
let bundle = fs.readFileSync(bundlePath, 'utf8');

// Usamos index exato para não depender de quebras de linha CRLF vs LF
const pvidIdx = bundle.indexOf('assets/video/intro_campanha');
const startCall = bundle.lastIndexOf('this.__vid=', pvidIdx);
const endCall = bundle.indexOf('});return', pvidIdx) + 2;

const originalSnippet = bundle.slice(startCall, endCall);

const replacementSnippet = 'this.__vid=__playVideos([\n' +
'  "assets/video/campanha_1",\n' +
'  "assets/video/campanha_2",\n' +
'  "assets/video/campanha_3",\n' +
'  "assets/video/campanha_4",\n' +
'  "assets/video/intro_herois/" + (this.classId || "WARRIOR")\n' +
'], {\n' +
'  muted: !1,\n' +
'  music: "assets/audio/opening",\n' +
'  musicVol: .35,\n' +
'  musicLoop: !0,\n' +
'  subs: [\n' +
'    [0.8, 8.5, W("intro.l1") + " " + W("intro.l2")],\n' +
'    [10.8, 18.5, W("intro.l3") + " " + W("intro.l4")],\n' +
'    [20.8, 28.5, W("intro.l5") + " " + W("intro.l6")],\n' +
'    [30.8, 38.5, W("intro.l7")],\n' +
'    [40.8, 49.0, ((W("class." + (this.classId || "WARRIOR"))?.toUpperCase()) || (this.classId || "WARRIOR")) + " — " + __L3("Adentrando a Floresta de Eldervale rumo a Depthgate...", "Entering Eldervale Forest toward Depthgate...", "Entrando al Bosque de Eldervale hacia Depthgate...")]\n' +
'  ],\n' +
'  endCard: [W("intro.chapter"), W("intro.chapterSub"), 3200],\n' +
'  onDone: () => {\n' +
'    __holdM(!1);\n' +
'    this.skipped = !0;\n' +
'    this.finish();\n' +
'  }\n' +
'})';

bundle = bundle.slice(0, startCall) + replacementSnippet + bundle.slice(endCall);

// No epílogo de vitória:
const oldEpilogueEnd = 'ui.tweens.add({targets:R,alpha:0,duration:700,onComplete:()=>{R.destroy(),done&&done()}})},key=e=>{(e.key==="Enter"||e.key===" "||e.key==="Escape")&&end()};';

const newEpilogueEnd = 'ui.tweens.add({targets:R,alpha:0,duration:700,onComplete:()=>{' +
'R.destroy();' +
'__holdM(!0);' +
'__playVideos(["assets/video/final_herois/" + (cid || "WARRIOR")], {' +
'  muted: !1,' +
'  music: "assets/audio/victory",' +
'  musicVol: .45,' +
'  hint: __L3("Pular  ▸", "Skip  ▸", "Saltar  ▸"),' +
'  endCard: [__L3("VITÓRIA", "VICTORY", "VICTORIA"), (H || "HERÓI").toUpperCase() + " — " + __L3("O DEPTHGATE ESTÁ EM PAZ", "DEPTHGATE IS AT PEACE", "EL DEPTHGATE ESTÁ EN PAZ"), 3200],' +
'  onDone: () => {' +
'    __holdM(!1);' +
'    done && done();' +
'  }' +
'});' +
'}})},key=e=>{(e.key==="Enter"||e.key===" "||e.key==="Escape")&&end()};';

if (!bundle.includes(oldEpilogueEnd)) {
  console.error("Could not find exact oldEpilogueEnd!");
  process.exit(1);
}

bundle = bundle.replace(oldEpilogueEnd, newEpilogueEnd);

fs.writeFileSync(bundlePath, bundle, 'utf8');
console.log("Successfully replaced calls in assets/index-D6qIWtA7-p209.js!");

const mirrorPath = 'Projeto atualizado/assets/index-D6qIWtA7-p209.js';
if (fs.existsSync(mirrorPath)) {
  fs.writeFileSync(mirrorPath, bundle, 'utf8');
  console.log("Successfully synced to Projeto atualizado!");
}
