const CACHE = "ded-web-v5.32.1-deck-do-pacto";
/* Imagens, sons e dados ficam num cache que NÃO é apagado a cada versão. Ao ativar uma versão nova,
   o asset-versions.json (gerado por scripts/build_asset_versions.py antes de publicar) é comparado com o
   anterior e só os arquivos que mudaram são apagados (e baixados de novo quando o jogo pedir).
   A página e os scripts continuam vindo sempre da rede (cópia só para jogar offline). */
const ASSETS = "ded-assets-v1";
const VKEY = "__asset-versions__";

self.addEventListener("install", () => self.skipWaiting());

const scopePath = () => new URL(self.registration.scope).pathname;
const relOf = (url) => decodeURIComponent(new URL(url).pathname).slice(scopePath().length);

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE && k !== ASSETS).map((k) => caches.delete(k)));
      try {
        const r = await fetch("asset-versions.json", { cache: "no-store" });
        if (r.ok) {
          const nv = await r.json();
          const ac = await caches.open(ASSETS);
          const vk = new URL(VKEY, self.registration.scope).href;
          const prev = await ac.match(vk);
          const pv = prev ? await prev.json() : null;
          const reqs = await ac.keys();
          await Promise.all(
            reqs.map((q) => {
              if (q.url === vk) return null;
              const p = relOf(q.url);
              // scripts nunca devem ficar presos em ASSETS; apaga também o que mudou/sumiu
              if (p.endsWith(".js") || p.endsWith(".mjs") || (pv ? nv[p] !== pv[p] : !(p in nv))) return ac.delete(q);
              return null;
            })
          );
          await ac.put(vk, new Response(JSON.stringify(nv), { headers: { "content-type": "application/json" } }));
        }
      } catch (err) {}
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(self.location.origin)) return;
  const path = new URL(req.url).pathname;
  // vídeos (e pedidos parciais/range) vão direto à rede: o cache não guarda respostas 206
  if (path.match(/\.(mp4|webm)$/) || req.headers.has("range")) return;
  // sinalização de rede, ranking online e a lista de versões sempre direto da rede
  if (path.includes("/api/") || path.endsWith("online-config.json") || path.endsWith("asset-versions.json")) return;
  const isDynamic = req.mode === "navigate" || path.endsWith("/index.html") || path.endsWith("/sw.js") || path.endsWith(".js") || path.endsWith(".mjs") || path.includes("index-") || path.includes("network-coop") || path.includes("user-auth") || path.includes("abyss-") || path.includes("hall-of-fame");
  if (isDynamic) {
    // Página principal e scripts: sempre da rede (cópia guardada só se estiver offline).
    // Atenção: um pedido de navegação não pode ser repassado com opções extras —
    // fetch(req, {...}) falha e caía na cópia antiga para sempre. Por isso usamos a URL.
    e.respondWith(
      fetch(req.url, { cache: "no-cache", credentials: "same-origin" })
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }
  // imagens, sons, dados: do cache permanente; se não tiver, baixa e guarda
  e.respondWith(
    caches.open(ASSETS).then((ac) =>
      ac.match(req).then(
        (hit) =>
          hit ||
          fetch(req, { cache: "no-cache" }).then((res) => {
            if (res.ok && res.status === 200) ac.put(req, res.clone());
            return res;
          })
      )
    )
  );
});
