/* ── Tradução do Códice e dos Colecionáveis (inglês e espanhol) ──────────────────────────────────────────
   O texto original em português continua no código; na hora de mostrar, o texto passa por este dicionário
   (gerado de scripts/books_i18n_*.json por scripts/patch_books_i18n.py). Só age nesses dois livros e no aviso
   de relíquia encontrada.                                                                                   */
const __TRBU={};for(const k in __TRB){const u=k.toUpperCase();u!==k&&!__TRB[u]&&(__TRBU[u]=__TRB[k].map(x=>x.toUpperCase()))}
function __trbT(s,k){if(!s)return s;const d=__TRB[s]||__TRBU[s];if(d)return d[k];if(s.endsWith("…")){const b=s.slice(0,-1);for(const key in __TRB)if(key.startsWith(b)){const t=__TRB[key][k];return t.length>b.length?t.slice(0,b.length)+"…":t}}return null}
function __trb(s,k){const t=__trbT(s,k);if(t!=null)return t;let m;const R=x=>__trbT(x,k)??__trb(x,k),E=k===1;
 if(m=s.match(/^Colecionáveis Resgatados: (\d+) \/ (\d+) \((\d+)%\) · Toque em um item para examinar$/))return E?`Coleccionables Recuperados: ${m[1]} / ${m[2]} (${m[3]}%) · Toca un objeto para examinarlo`:`Collectibles Recovered: ${m[1]} / ${m[2]} (${m[3]}%) · Tap an item to examine it`;
 if(m=s.match(/^Registro Arcano #(\d+) de (\d+)$/))return E?`Registro Arcano #${m[1]} de ${m[2]}`:`Arcane Record #${m[1]} of ${m[2]}`;
 if(m=s.match(/^✦ RELÍQUIA: (.+) ✦$/))return(E?"✦ RELIQUIA: ":"✦ RELIC: ")+R(m[1])+" ✦";
 if(m=s.match(/^RELÍQUIA ENCONTRADA: (.+)$/))return(E?"RELIQUIA ENCONTRADA: ":"RELIC FOUND: ")+R(m[1]);
 if(m=s.match(/^Pág (\d+)$/))return(E?"Pág. ":"p. ")+m[1];
 if(m=s.match(/^Topografia • (.+)$/))return(E?"Topografía • ":"Topography • ")+R(m[1]);
 if(m=s.match(/^(\d+)\. (.+)$/s))return m[1]+". "+R(m[2]);
 if(m=s.match(/^• (.+?) — (.+)$/s))return"• "+R(m[1])+" — "+R(m[2]);
 if(m=s.match(/^• (.+)$/s))return"• "+R(m[1]);
 if(m=s.match(/^❖ (.+) ❖$/s))return"❖ "+R(m[1])+" ❖";
 if(m=s.match(/^✦ (.+) ✦$/s))return"✦ "+R(m[1])+" ✦";
 if(m=s.match(/^\[ (.+) \]$/s))return"[ "+R(m[1])+" ]";
 return s}
{const P=j.GameObjects.Text.prototype,ST=P.setText;P.setText=function(v){try{if(typeof v==="string"&&v.length>1){const key=this.scene?.sys?.settings?.key;
 if(key==="CodexBook"||key==="CollectiblesBook"||/RELÍQUIA/.test(v)){const L=Be();if(L!=="pt")v=__trb(v,L==="es"?1:0)}}}catch(e){}return ST.call(this,v)}}
