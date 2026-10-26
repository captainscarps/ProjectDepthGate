/* ── Lembranças da Guardiã ──────────────────────────────────────────────────────────────────────────────
   Cada fase tem um "Eco do passado" (fantasmas repetindo uma cena de séculos atrás). Depois que o eco some,
   a Guardiã fala com o herói de longe, pela magia dela: ela esteve em muitas dessas cenas e reage como quem
   reconhece o lugar — sem ainda contar quem é (a revelação continua guardada para o castelo). */
const __GMEM={
 catacombs:[{who:"guardia",expr:"sadness",name:__GN,text:"Esses túmulos guardam nomes de quem nunca foi enterrado aqui. Alguns segredos precisaram de séculos de silêncio."},
  {who:"guardia",expr:"calm",name:__GN,text:"Não julgue os que fugiram, herói. Eu também já precisei escolher entre a verdade e o meu povo."}],
 ruins:[{who:"guardia",expr:"talk",name:__GN,text:"O brasão nas fechaduras… eu vi quando foi gravado. Ou sonhei que vi."},
  {who:"guardia",expr:"sadness",name:__GN,text:"Às vezes as lembranças dos selos se confundem com as minhas. Já não sei onde uma termina e a outra começa."}],
 glacial:[{who:"guardia",expr:"sadness",name:__GN,text:"…Você viu. Eu sei que viu."},
  {who:"guardia",expr:"calm",name:__GN,text:"Aquela voz no gelo ainda não tem explicação que eu possa dar. Peço só que confie em mim mais um pouco."}],
 fortress:[{who:"guardia",expr:"sadness",name:__GN,text:"Ele pediu ao dragão que não o deixasse passar… nem mesmo ele."},
  {who:"guardia",expr:"talk",name:__GN,text:"Lembre-se dessas palavras quando chegar ao castelo. Ele sabia o que estava deixando entrar."}],
 bosque:[{who:"guardia",expr:"smile",name:__GN,text:"A sumaúma ainda está de pé. Os pajés cumpriram a promessa deles melhor do que nós cumprimos as nossas."}],
 rio:[{who:"guardia",expr:"talk",name:__GN,text:"A Ordem do Limiar marcou essas pedras há séculos. Eles sempre souberam esperar."},
  {who:"guardia",expr:"sadness",name:__GN,text:"Eu deveria ter apagado essas marcas quando ainda podia."}],
 morta:[{who:"guardia",expr:"sadness",name:__GN,text:"A sentinela ainda vigia… depois de tanto tempo."},
  {who:"guardia",expr:"calm",name:__GN,text:"Algumas promessas não morrem nem com quem as fez. Esta foi uma das minhas."}],
 castle:[{who:"guardia",expr:"sadness",name:__GN,text:"Eu disse a ele para não abrir. Eu disse…"},
  {who:"guardia",expr:"calm",name:__GN,text:"Você ouviu o meu nome, herói. Logo vai entender o resto. Só peço que continue andando."}]};
/* ── Lembranças do herói: na terra (fase) de cada herói, ele fala do lugar logo no começo — depois do eco e da
   Guardiã quando a fase tem eco; senão, ao limpar a primeira sala. O Guerreiro fala no começo do castelo, porque
   dali o jogo termina. (Falas em __HMEM, geradas de scripts/hero_memory_lines.json.) ── */
function __hmemSay(S){const id=S.classDef?.id,h=typeof __HMEM!=="undefined"&&__HMEM[id];if(!h||h[0]!==S.levelId)return;const k="hmem_"+S.levelId+"_"+id;if(__stFlag(S,k))return;__stFlag(S,k,!0);
 const nm=(__HN[id]??S.classDef.name).toUpperCase(),go=()=>{if(!S.sys.isActive())return;if(S.uiOpen||S.state!=="playing"){S.time.delayedCall(800,go);return}__dlg(S,h[1].map(t=>({name:nm,text:t})))};go()}
{const E0=__echo;__echo=function(S,room){const lv=S?.levelId,before=!!(lv&&__ECHO[lv]&&room&&!__stFlag(S,"echo_"+lv));const r=E0.apply(this,arguments);
 try{if(before&&__stFlag(S,"echo_"+lv)){S.__echoNow=!0;const L=__GMEM[lv],wait=1300+3300*(__ECHO[lv].l.length)+1900;
  S.time.delayedCall(wait,()=>{if(!S.sys.isActive())return;const go=()=>{if(!S.sys.isActive())return;if(S.uiOpen||S.state!=="playing"){S.time.delayedCall(800,go);return}
   L?__dlg(S,L,()=>S.time.delayedCall(500,()=>__hmemSay(S))):__hmemSay(S)};go()})}}catch(e){}return r}}
{const C0=Sd.prototype.create;Sd.prototype.create=function(){const r=C0.apply(this,arguments);try{const S=this,id=S.classDef?.id,h=typeof __HMEM!=="undefined"&&__HMEM[id];
 if(h&&h[0]===S.levelId&&S.game.registry.get("mode")==="campaign"&&!S.isRift&&!S.level?.endless){S.__echoNow=!1;let n=0;
  const tryH=()=>{if(!S.sys.isActive()||S.__echoNow)return;const lv=S.levelId;if(__ECHO[lv]&&!__stFlag(S,"echo_"+lv)&&n++<20){S.time.delayedCall(1e3,tryH);return}__hmemSay(S)};
  const on=(q,rm)=>{if(rm&&!rm.hasBoss){S.game.events.off("room:cleared",on);S.time.delayedCall(1500,tryH)}};S.game.events.on("room:cleared",on);S.events.once("shutdown",()=>S.game.events.off("room:cleared",on))}}catch(e){}return r}}
