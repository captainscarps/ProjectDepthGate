import http from "http";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const PORT = 24896;
const DEBUG_PORT = 9230;

const server = http.createServer((req, res) => {
  let reqPath = req.url.split("?")[0];
  if (reqPath === "/") reqPath = "/index.html";
  const filePath = path.join(process.cwd(), reqPath.replace(/^\//, ""));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeMap = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".webm": "video/webm",
      ".mp4": "video/mp4",
      ".json": "application/json"
    };
    res.writeHead(200, { "Content-Type": mimeMap[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, async () => {
  console.log(`Server listening on ${PORT}`);
  
  const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = spawn(chromePath, [
    `--remote-debugging-port=${DEBUG_PORT}`,
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--window-size=1280,720",
    `http://127.0.0.1:${PORT}/index.html`
  ]);

  await new Promise(r => setTimeout(r, 3500));

  const tabsRes = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json`);
  const tabs = await tabsRes.json();
  const gameTab = tabs.find(t => t.title && t.title.includes("DEPTHGATE")) || tabs[0];

  const ws = new WebSocket(gameTab.webSocketDebuggerUrl);

  let idCounter = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = idCounter++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener("message", handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener("message", handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  ws.addEventListener("message", (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === "Runtime.consoleAPICalled") {
      console.log("BROWSER LOG:", msg.params.type, msg.params.args.map(a => a.value || a.description).join(" "));
    }
    if (msg.method === "Runtime.exceptionThrown") {
      console.log("BROWSER EXCEPTION:", msg.params.exceptionDetails.text, msg.params.exceptionDetails.exception?.description);
    }
  });

  ws.addEventListener("open", async () => {
    try {
      await send("Runtime.enable");
      await send("Console.enable");

      // Wait for MainMenu to be active before starting game
      const waitRes = await send("Runtime.evaluate", {
        awaitPromise: true,
        expression: `
          new Promise((resolve) => {
            const check = () => {
              const game = window.__DED_GAME || window.__game;
              if (game && game.scene.isActive("MainMenu")) {
                resolve("READY");
              } else {
                setTimeout(check, 250);
              }
            };
            check();
          })
        `
      });
      console.log("MainMenu wait status:", waitRes?.result?.value);

      // Try starting floresta_nevada and inspect the scene objects!
      const debugRes = await send("Runtime.evaluate", {
        expression: `
          (function() {
            try {
              const game = window.__DED_GAME || window.__game;
              if (!game) return "NO_GAME";
              console.log("BEFORE START: active scenes =", game.scene.getScenes(true).map(s => s.scene.key));
              console.log("BEFORE START: has tiles-frozen =", game.textures.exists("tiles-frozen"));
              const mm = game.scene.getScene("MainMenu");
              mm?.scene?.stop?.();
              game.scene.start("Game", {
                levelId: "floresta_nevada",
                classId: "WARRIOR",
                introHandoff: true
              });
              return "START_CALLED";
            } catch(e) {
              return "ERR: " + e.stack;
            }
          })()
        `
      });
      console.log("Debug start result:", debugRes?.result?.value);

      // Wait 5s for Game scene to populate and render frames
      await new Promise(r => setTimeout(r, 5000));

      // Inspect Game scene state
      const stateRes = await send("Runtime.evaluate", {
        expression: `
          (function() {
            try {
              const game = window.__DED_GAME || window.__game;
              const gs = game.scene.getScene("Game");
              if (!gs) return "NO_GAME_SCENE";
              return JSON.stringify({
                active: gs.scene.isActive(),
                levelId: gs.levelId,
                playerPos: gs.player ? { x: gs.player.x, y: gs.player.y } : null,
                childrenCount: gs.children?.length,
                camera: { scrollX: gs.cameras.main.scrollX, scrollY: gs.cameras.main.scrollY, zoom: gs.cameras.main.zoom },
                fnb00Exists: gs.textures.exists("fnb-0-0"),
                fnbMetaExists: !!gs.cache.json.get("fnb-meta"),
                allTiles: Object.keys(gs.textures.list).filter(k => k.includes('tile')),
                activeScenes: game.scene.getScenes(true).map(s => s.scene.key),
                texturesCount: Object.keys(gs.textures.list).length
              });
            } catch(e) {
              return "ERR: " + e.stack;
            }
          })()
        `
      });
      // Inspect children in Game scene
      const childrenRes = await send("Runtime.evaluate", {
        expression: `
          (function() {
            const gs = (window.__DED_GAME || window.__game).scene.getScene("Game");
            if (!gs) return [];
            return gs.children.list.map(c => ({
              type: c.type,
              key: c.texture?.key,
              x: c.x,
              y: c.y,
              w: c.width,
              h: c.height,
              visible: c.visible,
              alpha: c.alpha,
              depth: c.depth
            }));
          })()
        `,
        returnByValue: true
      });
      console.log("Total children in scene:", childrenRes?.result?.value?.length);
      const fnbChunks = childrenRes?.result?.value?.filter(c => c.key && c.key.startsWith("fnb-"));
      console.log("fnb Chunks found in scene:", JSON.stringify(fnbChunks?.slice(0, 5), null, 2));
      const fnbFront = childrenRes?.result?.value?.filter(c => c.key && (c.key.startsWith("fn-") || c.key.startsWith("fp-")));
      console.log("fnb Decor/scenery found in scene:", JSON.stringify(fnbFront?.slice(0, 5), null, 2));
      console.log("Game Scene State:", stateRes?.result?.value);

      // Capture snapshot directly from Phaser WebGL renderer!
      const snapRes = await send("Runtime.evaluate", {
        awaitPromise: true,
        expression: `
          new Promise((resolve) => {
            const game = window.__DED_GAME || window.__game;
            if (!game || !game.renderer) {
              resolve(null);
              return;
            }
            game.renderer.snapshot((image) => {
              resolve(image.src);
            });
          })
        `
      });

      if (snapRes?.result?.value) {
        const base64Data = snapRes.result.value.replace(/^data:image\/png;base64,/, "");
        const outPath = "C:\\Users\\rafaelscarpille\\.gemini\\antigravity\\brain\\f32dd795-4fc4-4eee-a304-6a2759fd9a03\\real_in_game_floresta_nevada.png";
        fs.writeFileSync(outPath, Buffer.from(base64Data, "base64"));
        console.log("Saved Phaser snapshot to:", outPath);
      } else {
        console.log("Snapshot failed or returned null!");
      }
    } catch(err) {
      console.error("Error:", err);
    } finally {
      ws.close();
      browser.kill();
      server.close();
      process.exit(0);
    }
  });
});
