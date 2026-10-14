const fs = require('fs');

const files = [
  'assets/index-D6qIWtA7-p209.js',
  'Projeto atualizado/assets/index-D6qIWtA7-p209.js'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Fix player hurt expression inside && (...)
  const badHurt = 'this.audio.play(Ct.PLAYER_HURT);{const c=(this.scene?.classDef?.id||"").toLowerCase();const isF=c.includes("archer")||c.includes("huntress")||c.includes("rogue");this.audio?.play(isF?"sfx-hero-hurt-female":"sfx-hero-hurt-male");})}';
  const cleanHurt = 'this.audio.play(Ct.PLAYER_HURT),this.audio?.play((this.scene?.classDef?.id||"").match(/archer|huntress|rogue/i)?"sfx-hero-hurt-female":"sfx-hero-hurt-male"))}';

  if (code.includes(badHurt)) {
    code = code.replace(badHurt, cleanHurt);
    console.log(`[${file}] Fixed player hurt expression syntax.`);
  }

  // Fix onEnemyDied block separation
  const badDied = 'onEnemyDied(i){{const tex=(i?.data_?.texture||i?.def?.texture||i?.texture?.key||i?.typeKey||"").toLowerCase();if(tex.includes("skeleton"))this.audio?.play("sfx-skeleton-death");else if(tex.includes("goblin"))this.audio?.play("sfx-goblin-death");else if(tex.includes("orc"))this.audio?.play("sfx-orc-death");else if(tex.includes("demon"))this.audio?.play("sfx-demon-death");else if(tex.includes("ghost")||tex.includes("shade"))this.audio?.play("sfx-ghost-death");else if(tex.includes("troll")||tex.includes("yeti")||tex.includes("cyclops"))this.audio?.play("sfx-troll-death");else if(tex.includes("wolf")||tex.includes("beast"))this.audio?.play("sfx-beast-death");else if(tex.includes("dragon")||tex.includes("wyrm")||tex.includes("drake"))this.audio?.play("sfx-dragon-death");else if(tex.includes("mimic"))this.audio?.play("sfx-mimic-death");else this.audio?.play(Ct.ENEMY_DEATH);}this.game.registry.inc("campaign:kills",1)';
  const cleanDied = 'onEnemyDied(i){try{const tex=(i?.data_?.texture||i?.def?.texture||i?.texture?.key||i?.typeKey||"").toLowerCase();if(tex.includes("skeleton"))this.audio?.play("sfx-skeleton-death");else if(tex.includes("goblin"))this.audio?.play("sfx-goblin-death");else if(tex.includes("orc"))this.audio?.play("sfx-orc-death");else if(tex.includes("demon"))this.audio?.play("sfx-demon-death");else if(tex.includes("ghost")||tex.includes("shade"))this.audio?.play("sfx-ghost-death");else if(tex.includes("troll")||tex.includes("yeti")||tex.includes("cyclops"))this.audio?.play("sfx-troll-death");else if(tex.includes("wolf")||tex.includes("beast"))this.audio?.play("sfx-beast-death");else if(tex.includes("dragon")||tex.includes("wyrm")||tex.includes("drake"))this.audio?.play("sfx-dragon-death");else if(tex.includes("mimic"))this.audio?.play("sfx-mimic-death");else this.audio?.play(Ct.ENEMY_DEATH);}catch(e){}this.game.registry.inc("campaign:kills",1)';

  if (code.includes(badDied)) {
    code = code.replace(badDied, cleanDied);
    console.log(`[${file}] Fixed onEnemyDied block syntax.`);
  }

  fs.writeFileSync(file, code, 'utf8');
}
console.log('Syntax fix complete.');
