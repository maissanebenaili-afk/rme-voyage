/* RME Voyage: cache only public pages and immutable local assets.
 * Never cache affiliate URLs, API responses or private/authenticated requests.
 */
const PREFIX = 'rme-voyage-';
const VERSION = `${PREFIX}v3`;
const ASSETS = `${VERSION}-assets`;
const PAGES = `${VERSION}-pages`;
const OFFLINE = '/offline.html';
const PUBLIC_PAGES = ['/', '/guide', '/decouvrir', '/telecharger'];
const PRECACHE = [OFFLINE, '/manifest.webmanifest', '/icon-192.svg', '/icon-512.svg'];

async function precache(cacheName, paths) {
  const cache = await caches.open(cacheName);
  // Missing optional files cannot invalidate the entire offline installation.
  await Promise.allSettled(paths.map(async (path) => {
    const response = await fetch(path, { cache: 'reload' });
    if (response.ok) await cache.put(path, response);
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil(Promise.all([precache(ASSETS, PRECACHE), precache(PAGES, PUBLIC_PAGES)])
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys
    .filter((key) => key.startsWith(PREFIX) && !key.startsWith(`${VERSION}-`))
    .map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

function offlineApi() {
  return new Response(JSON.stringify({ error: 'Connexion requise', offline: true }), {
    status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function navigation(request) {
  const cache = await caches.open(PAGES);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(request, { signal: controller.signal });
    const url = new URL(request.url);
    // Do not persist shared dates or travel plans from query parameters.
    if (response.ok && !url.search && PUBLIC_PAGES.includes(url.pathname) &&
        response.headers.get('content-type')?.includes('text/html')) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    return cached || await caches.match(OFFLINE) ||
      new Response('Vous êtes hors ligne. Reconnectez-vous pour continuer.', {
        status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
  } finally {
    clearTimeout(timeout);
  }
}

async function asset(request) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).catch(offlineApi));
    return;
  }
  // Next.js RSC, auth and development requests must not be served cached HTML.
  if (request.headers.has('RSC') || url.searchParams.has('_rsc') ||
      request.headers.has('Authorization') || url.pathname.includes('hot-update') ||
      url.pathname.startsWith('/__nextjs')) return;
  if (request.mode === 'navigate') {
    event.respondWith(navigation(request));
    return;
  }
  if (url.pathname.startsWith('/_next/static/') || PRECACHE.includes(url.pathname)) {
    event.respondWith(asset(request));
  }
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CLEAR_CACHE') {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys
      .filter((key) => key.startsWith(PREFIX)).map((key) => caches.delete(key)))));
  }
});
