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
{const E0=__echo;__echo=function(S,room){const lv=S?.levelId,before=!!(lv&&__ECHO[lv]&&room&&!__stFlag(S,"echo_"+lv));const r=E0.apply(this,arguments);
 try{const L=__GMEM[lv];if(before&&L&&__stFlag(S,"echo_"+lv)){const wait=1300+3300*(__ECHO[lv].l.length)+1900;
  S.time.delayedCall(wait,()=>{if(!S.sys.isActive())return;const go=()=>{if(!S.sys.isActive())return;if(S.uiOpen||S.state!=="playing"){S.time.delayedCall(800,go);return}__dlg(S,L)};go()})}}catch(e){}return r}}
