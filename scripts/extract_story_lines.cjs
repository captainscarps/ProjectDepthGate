// Extrai as falas da história do bundle (com quem fala) para a dublagem. Uso: NODE_PATH=<pasta com acorn e acorn-walk> node extract_story_lines.cjs bundle.js saida.json
const fs=require('fs'),acorn=require('acorn'),walk=require('acorn-walk');
const src=fs.readFileSync(process.argv[2],'utf8');
const ast=acorn.parse(src,{ecmaVersion:'latest',sourceType:'module'});
const out=[]; const seen=new Set();
const add=(text,voice,where,expr)=>{text=(text||'').replace(/\s+/g,' ').trim(); if(!text||text.length<3)return; const k=voice+'|'+text; if(seen.has(k))return; seen.add(k); out.push({text,voice,where,expr:expr||null});};
const lit=n=>n&&n.type==='Literal'&&typeof n.value==='string'?n.value:(n&&n.type==='TemplateLiteral'&&n.expressions.length===0?n.quasis[0].value.cooked:null);
const prop=(o,k)=>o.properties?.find(p=>p.type==='Property'&&((p.key.name||p.key.value)===k));
// 1) objetos de diálogo com who/text
walk.full(ast,n=>{ if(n.type!=='ObjectExpression')return; const w=prop(n,'who'),t=prop(n,'text'); if(w&&t){const who=lit(w.value),tx=lit(t.value); const c=prop(n,'corrupt'); const cor=c&&c.value.type==='UnaryExpression'&&c.value.argument.value===0; const ex=prop(n,'expr'); if(who&&tx)add(tx,cor?who+'-corrupt':who,'dlg',ex?lit(ex.value):null);}});
// 2) tabelas nomeadas
const D={}; walk.full(ast,n=>{if(n.type==='VariableDeclarator'&&n.id.type==='Identifier'&&n.init)(D[n.id.name]??=[]).push(n.init);});
const decls=new Proxy({}, {get:(_,k)=>(D[k]||[]).find(x=>x.type==='ObjectExpression'&&(k!=='gi'||x.properties.some(p=>(p.key?.name)==='pt')))});
const strings=(node,cb)=>walk.full(node,n=>{const v=lit(n); if(v!=null)cb(v,n);});
// gi: intros e pós-chefe (narrador) só pt
const gi=decls.gi; if(gi){const pt=prop(gi,'pt'); for(const lv of pt.value.properties){for(const k of ['intro','postBoss']){const p=prop(lv.value,k); if(p&&p.value.type==='ArrayExpression')for(const e of p.value.elements)add(lit(e),'narrator','gi.'+(lv.key.name||lv.key.value)+'.'+k);}}}
// prólogo (páginas) e outros com img/lines
walk.full(ast,n=>{ if(n.type!=='ObjectExpression')return; const im=prop(n,'img'),ln=prop(n,'lines'); if(im&&ln&&ln.value.type==='ArrayExpression'){const w=prop(n,'who'); const who=w?lit(w.value):null; for(const e of ln.value.elements)add(lit(e),who||'narrator','pages');}});
// __HLINE e __GHERO por classe
for(const nm of ['__HLINE']){const d=decls[nm]; if(d)for(const p of d.properties){const cls=p.key.name||p.key.value; strings(p.value,(v)=>{ if(v.length>12)add(v,'hero-'+cls,nm);});}}
const gh=decls.__GHERO; if(gh)for(const p of gh.properties){const cls=p.key.name||p.key.value; const v=lit(p.value); if(v){const i=v.indexOf(':'); add(v.slice(i+1).trim().replace(/Guardião/g,'Guardiã'),'hero-'+cls,'__GHERO');}}
// ecos dos Antigos
const ec=decls.__ECHO; if(ec)for(const lv of ec.properties){const f=prop(lv.value,'f'),l=prop(lv.value,'l'); const spr=f.value.elements.map(e=>lit(e.elements[0])); for(const e of l.value.elements){const idx=e.elements[0].value; add(lit(e.elements[1]),'echo-'+(/mage|rogue|shaman/.test(spr[idx]||'')?'f':'m'),'echo');}}
// cinemática HTML (SLIDES)
walk.full(ast,n=>{ if(n.type==='VariableDeclarator'&&n.id.name==='SLIDES'&&n.init?.type==='ArrayExpression'){for(const sl of n.init.elements){const sp=prop(sl,'speaker'); const who=sp?lit(sp.value):null; const ln=prop(sl,'lines'); if(ln)for(const e of ln.value.elements)add(lit(e),who?'cine-'+who:'narrator','slides');}}});
fs.writeFileSync(process.argv[3],JSON.stringify(out,null,1));
const by={}; for(const o of out){by[o.voice]=(by[o.voice]||0)+1;}
console.log(out.length,'falas',out.reduce((a,o)=>a+o.text.length,0),'caracteres',by);
