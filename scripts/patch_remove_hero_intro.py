path1 = 'assets/index-D6qIWtA7-p209.js'
path2 = 'Projeto atualizado/assets/index-D6qIWtA7-p209.js'

with open(path1, 'r', encoding='utf-8') as f:
    bundle = f.read()

c_idx = bundle.find('assets/video/campanha_1')
start_call = bundle.rfind('this.__vid=', 0, c_idx)
end_call = bundle.find('});return', c_idx) + 2

new_cutscene = """this.__vid=__playVideos([
  "assets/video/campanha_1",
  "assets/video/campanha_2",
  "assets/video/campanha_3",
  "assets/video/campanha_4"
], {
  muted: !0,
  music: "assets/audio/cinematic_intro.mp3",
  musicVol: .50,
  musicLoop: !0,
  subs: [
    [0.6, 9.2, W("intro.l1") + " " + W("intro.l2")],
    [10.4, 19.2, W("intro.l3") + " " + W("intro.l4")],
    [20.4, 29.2, W("intro.l5") + " " + W("intro.l6")],
    [30.4, 39.2, W("intro.l7")]
  ],
  endCard: [W("intro.chapter"), W("intro.chapterSub"), 3200],
  onDone: () => {
    __holdM(!1);
    this.skipped = !0;
    this.finish();
  }
})"""

bundle = bundle[:start_call] + new_cutscene + bundle[end_call:]

with open(path1, 'w', encoding='utf-8') as f:
    f.write(bundle)
with open(path2, 'w', encoding='utf-8') as f:
    f.write(bundle)

print('Updated intro cutscene in both bundle files!')
