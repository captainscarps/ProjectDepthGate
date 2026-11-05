const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const PORT = 8135;
const CDP_PORT = 9235;
const ROOT = path.resolve(__dirname, "..");
const userData = path.join(__dirname, "chrome_test_profile_diag");

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split("?")[0]);
  if (reqPath === "/") reqPath = "/index.html";
  const filePath = path.join(ROOT, reqPath.replace(/^\//, ""));
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    console.log("404 Not found:", reqPath, "->", filePath);
    res.statusCode = 404;
    return res.end("Not found");
  }
  const ext = path.extname(filePath);
  const mimeMap = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".mp3": "audio/mpeg",
    ".ttf": "font/ttf"
  };
  res.writeHead(200, {
    "Content-Type": mimeMap[ext] || "application/octet-stream",
    "Cache-Control": "no-cache"
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, "127.0.0.1", async () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

  const chrome = spawn(chromePath, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${userData}`,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--autoplay-policy=no-user-gesture-required",
    `http://127.0.0.1:${PORT}/index.html`
  ]);

  const cleanup = (code = 0) => {
    try { chrome.kill(); } catch (e) {}
    try { server.close(); } catch (e) {}
    process.exit(code);
  };

  await new Promise(r => setTimeout(r, 3500));

  try {
    const listRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json`);
    const tabs = await listRes.json();
    const tab = tabs.find(t => t.type === "page");
    if (!tab) {
      console.error("No page tab found");
      cleanup(1);
      return;
    }

    const ws = new WebSocket(tab.webSocketDebuggerUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ id: 1, method: "Runtime.enable" }));

      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        ws.send(JSON.stringify({
          id: 10 + attempts,
          method: "Runtime.evaluate",
          params: {
            awaitPromise: true,
            returnByValue: true,
            expression: `
              (async function() {
                if (typeof window.__dubInit !== "function") return { status: "waiting_dub" };
                await window.__dubInit();
                const manifest = window.__DUB?.m;
                if (!manifest || !manifest.k || Object.keys(manifest.k).length === 0) {
                  return { status: "waiting_manifest" };
                }

                const lines = {
                  cave: "Explore com cuidado, herói. Não se preocupe, se acontecer algo, eu abro um portal e te trago de volta pro Refúgio.",
                  nativeHero: "Como você sabe tudo isso? Quem é você?",
                  magic: "Cada um de vocês veio de terras e eras distintas, falando línguas que os outros não compreendiam. Que a bênção dos selos una nossas vozes e espíritos.",
                  hero: "Nossa, estou falando e entendendo uma língua diferente, que mágica é essa?",
                  explain: "É a comunhão dos DepthGates. Agora nossas mentes se tocam, e qualquer viajante que você encontrar entenderá as suas palavras."
                };

                const classes = ["WARRIOR", "ARCHER", "MAGE", "ROGUE", "NECROMANCER", "SHAMAN", "BERSERKER", "HUNTER", "DRUID"];

                // 1. Antes da magia da Guardiã: Heróis falam em sua língua materna
                window.__hasGuardianMagic = false;
                const heroNativeDurs = {};
                for (const cls of classes) {
                  window.__currentSpeaker = cls;
                  heroNativeDurs[cls] = window.__dubDur(lines.nativeHero);
                }

                // Test translations in window.__TR.en
                const transEn = {
                  cave: window.__TR?.en?.[lines.cave],
                  magic: window.__TR?.en?.[lines.magic],
                  hero: window.__TR?.en?.[lines.hero],
                  explain: window.__TR?.en?.[lines.explain]
                };

                // 2. Após a magia da Guardiã: Heróis falam o idioma do jogador
                window.__hasGuardianMagic = true;
                localStorage.setItem("depthgate:guardian_magic", "1");

                const heroVoiceDursPT = {};
                const heroVoiceDursEN = {};

                for (const cls of classes) {
                  window.__currentSpeaker = cls;
                  localStorage.setItem("dungeon-crawler:settings", JSON.stringify({ voiceLang: "pt", language: "pt" }));
                  heroVoiceDursPT[cls] = window.__dubDur(lines.hero);

                  localStorage.setItem("dungeon-crawler:settings", JSON.stringify({ voiceLang: "en", language: "en" }));
                  heroVoiceDursEN[cls] = window.__dubDur(lines.hero);
                }

                // Test Guardiã lines durations
                localStorage.setItem("dungeon-crawler:settings", JSON.stringify({ voiceLang: "pt", language: "pt" }));
                window.__currentSpeaker = null;
                const guardiaPT = {
                  cave: window.__dubDur(lines.cave),
                  magic: window.__dubDur(lines.magic),
                  explain: window.__dubDur(lines.explain)
                };

                localStorage.setItem("dungeon-crawler:settings", JSON.stringify({ voiceLang: "en", language: "en" }));
                const guardiaEN = {
                  cave: window.__dubDur(lines.cave),
                  magic: window.__dubDur(lines.magic),
                  explain: window.__dubDur(lines.explain)
                };

                return {
                  status: "ok",
                  manifestLoaded: true,
                  transEn,
                  heroNativeDurs,
                  heroVoiceDursPT,
                  heroVoiceDursPT,
                  heroVoiceDursEN,
                  guardiaPT,
                  guardiaEN
                };
              })()
            `
          }
        }));

        if (attempts > 30) {
          clearInterval(interval);
          console.error("Timeout waiting for game evaluation");
          cleanup(1);
        }
      }, 500);

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id >= 10) {
          if (msg.result?.exceptionDetails) {
            console.error("CDP Exception:", JSON.stringify(msg.result.exceptionDetails));
          }
          if (msg.result?.result?.value) {
            const val = msg.result.result.value;
            if (val.status !== "ok") {
              console.log("Poll status:", val.status);
            }
            if (val.status === "ok") {
            clearInterval(interval);
            console.log("\n=== TEST RESULTS IN BROWSER ===");
            console.log("English Translations:", JSON.stringify(val.transEn, null, 2));
            console.log("Guardiã PT Durations:", val.guardiaPT);
            console.log("Guardiã EN Durations:", val.guardiaEN);
            console.log("Hero Native Mother Tongue Durations (by class):", val.heroNativeDurs);
            console.log("Hero Voice PT Durations (by class):", val.heroVoiceDursPT);
            console.log("Hero Voice EN Durations (by class):", val.heroVoiceDursEN);

            // Assertions
            let ok = true;
            if (val.guardiaPT.cave <= 0 || val.guardiaEN.cave <= 0) { console.error("Cave fail"); ok = false; }
            if (val.guardiaPT.magic <= 0 || val.guardiaEN.magic <= 0) { console.error("Magic fail"); ok = false; }
            if (val.guardiaPT.explain <= 0 || val.guardiaEN.explain <= 0) { console.error("Explain fail"); ok = false; }

            const clsList = ["WARRIOR", "ARCHER", "MAGE", "ROGUE", "NECROMANCER", "SHAMAN", "BERSERKER", "HUNTER", "DRUID"];
            for (const c of clsList) {
              if (!val.heroNativeDurs[c] || val.heroNativeDurs[c] <= 0) {
                console.error(`Hero Native Mother Tongue duration 0 for ${c}`);
                ok = false;
              }
              if (!val.heroVoiceDursPT[c] || val.heroVoiceDursPT[c] <= 0) {
                console.error(`Hero PT duration 0 for ${c}`);
                ok = false;
              }
              if (!val.heroVoiceDursEN[c] || val.heroVoiceDursEN[c] <= 0) {
                console.error(`Hero EN duration 0 for ${c}`);
                ok = false;
              }
            }

            if (ok) {
              console.log("\n>>> ALL IN-GAME VOICE AND LOCALIZATION CHECKS PASSED PERFECTLY! <<<");
              cleanup(0);
            } else {
              cleanup(1);
            }
          }
        }
      }
    };
  };
  } catch (err) {
    console.error("Error connecting to Chrome:", err);
    cleanup(1);
  }
});
