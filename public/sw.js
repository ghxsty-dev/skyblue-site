const CACHE = "skyblue-v4";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      try {
        await cache.addAll(["/", OFFLINE_URL]);
      } catch (e) {
        console.warn("[SW] install cache partial", e);
      }
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const privatePath = ["/api", "/account", "/login", "/register", "/admin"].some(
    (prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)
  );
  const isRscRequest = req.headers.has("rsc") || url.searchParams.has("_rsc");
  if (privatePath || isRscRequest) return;

  event.respondWith(
    (async () => {
      try {
        const res = await fetch(req);
        if (res.ok && !res.headers.get("Cache-Control")?.includes("no-store")) {
          const clone = res.clone();
          const cache = await caches.open(CACHE);
          cache.put(req, clone).catch(() => {});
        }
        return res;
      } catch {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") {
          const fallback = await caches.match(OFFLINE_URL);
          if (fallback) return fallback;
        }
        return new Response("Offline", { status: 503 });
      }
    })()
  );
});
