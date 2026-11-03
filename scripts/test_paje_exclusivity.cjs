const fs = require('fs');
const path = require('path');

console.log("=== TESTE DE EXCLUSIVIDADE DO PAJÉ PARA A HEROÍNA ARAÍ (SHAMAN) ===");

const ROOT = path.resolve(__dirname, '..');
const bundlePath = path.join(ROOT, 'assets', 'index-D6qIWtA7-p209.js');
const bundleMirror = path.join(ROOT, 'Projeto atualizado', 'assets', 'index-D6qIWtA7-p209.js');

const c1 = fs.readFileSync(bundlePath, 'utf8').replace(/\r\n/g, '\n');
const c2 = fs.readFileSync(bundleMirror, 'utf8').replace(/\r\n/g, '\n');

// Assertions on both bundles
[c1, c2].forEach((c, idx) => {
    const name = idx === 0 ? "assets/index-D6qIWtA7-p209.js" : "Projeto atualizado/assets/index-D6qIWtA7-p209.js";
    console.log(`\nValidando bundle: ${name}`);

    // 1. Hub spawn
    if (!c.includes('if ((__Q.get(S, "pj") || n >= 2) && __Q.cls(S) === "SHAMAN") __qPajeHub(S);')) {
        throw new Error(`FAIL: forest hub spawn check missing SHAMAN condition in ${name}`);
    }
    console.log("  [PASS] Hub spawn condicionado a __Q.cls(S) === 'SHAMAN'");

    // 2. __qPajeHub
    if (!c.includes('function __qPajeHub(S) {\n  if (__Q.cls(S) !== "SHAMAN") return;')) {
        throw new Error(`FAIL: __qPajeHub missing SHAMAN check in ${name}`);
    }
    console.log("  [PASS] __qPajeHub bloqueia qualquer classe diferente de SHAMAN");

    // 3. __qPajeLevel
    if (!c.includes('function __qPajeLevel(S) {\n  if (__Q.cls(S) !== "SHAMAN" || __Q.get(S, "pj") !== 1) return;')) {
        throw new Error(`FAIL: __qPajeLevel missing SHAMAN check in ${name}`);
    }
    console.log("  [PASS] __qPajeLevel (itens sagrados) condicionado a SHAMAN");

    // 4. __QLIST diary
    if (!c.includes('{ id: "paje", title: "O Último Pajé", st: (S) => { if (__Q.cls(S) !== "SHAMAN") return null;')) {
        throw new Error(`FAIL: __QLIST missing SHAMAN check in ${name}`);
    }
    console.log("  [PASS] Diário de missões (J) só exibe 'O Último Pajé' para SHAMAN");

    // 5. __qPajeTalk
    if (!c.includes('function __qPajeTalk(S, npc) {\n  if (__Q.cls(S) !== "SHAMAN") return;')) {
        throw new Error(`FAIL: __qPajeTalk missing SHAMAN check in ${name}`);
    }
    console.log("  [PASS] Diálogo __qPajeTalk bloqueia qualquer classe diferente de SHAMAN");

    // 6. Generic forasteiro dialogue removed from __qPajeTalk
    const pajeTalkBlock = c.slice(c.indexOf('function __qPajeTalk('), c.indexOf('function __qPajeTalk(') + 1200);
    if (pajeTalkBlock.includes('forasteiro')) {
        throw new Error(`FAIL: generic forasteiro dialogue still found in __qPajeTalk in ${name}`);
    }
    console.log("  [PASS] Diálogos genéricos de forasteiro removidos de __qPajeTalk (somente diálogos de Araí)");
});

console.log("\n=== RESULTADO: TODOS OS TESTES DE EXCLUSIVIDADE PASSARAM COM SUCESSO (100% OK) ===");
