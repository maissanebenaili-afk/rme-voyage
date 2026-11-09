/* RME Voyage: cache only public pages and immutable local assets.
 * Never cache affiliate URLs, API responses or private/authenticated requests.
 */
const PREFIX = 'rme-voyage-';
const VERSION = `${PREFIX}v5`;
const ASSETS = `${VERSION}-assets`;
const PAGES = `${VERSION}-pages`;
const OFFLINE = '/offline.html';
// /jeux, /dessins-animes, /feuilletons et /coloriages : pour les enfants en voiture ou sur le bateau.
// /kit-retour, /modeles et /quand-partir : les papiers et les dates, à relire au port sans réseau.
const PUBLIC_PAGES = ['/', '/guide', '/decouvrir', '/telecharger', '/jeux', '/dessins-animes', '/feuilletons',
  '/coloriages', '/kit-retour', '/modeles', '/quand-partir'];
// Fichiers locaux gardés pour le hors-ligne (code des pages, images des coloriages, voix).
const STATIC_PREFIXES = ['/_next/static/', '/coloriages/', '/kalimat/voix/'];
// Ce qu'une page ou une feuille de style précachée demande pour fonctionner.
const LINKED_STATIC = /\/(?:_next\/static|coloriages)\/[A-Za-z0-9_\-.~%\/[\]()@]+\.(?:js|css|woff2|png|jpg|jpeg|webp|svg|pdf)/g;
const PRECACHE = [OFFLINE, '/manifest.webmanifest', '/icon-192.svg', '/icon-512.svg', '/icons/icon-192.png'];

async function precache(cacheName, paths) {
  const cache = await caches.open(cacheName);
  // Missing optional files cannot invalidate the entire offline installation.
  await Promise.allSettled(paths.map(async (path) => {
    const response = await fetch(path, { cache: 'reload' });
    if (response.ok) await cache.put(path, response);
  }));
}

function linkedStatic(text) {
  return [...new Set(text.match(LINKED_STATIC) || [])];
}

/**
 * Une page précachée sans son code reste blanche hors ligne : on garde aussi
 * les fichiers qu'elle cite (scripts, styles, images), puis les polices citées
 * par ses feuilles de style. Ainsi ouvrir l'appli une seule fois avec du réseau
 * suffit pour que les jeux marchent ensuite sans réseau.
 */
async function precachePages(paths) {
  const pages = await caches.open(PAGES);
  const assets = await caches.open(ASSETS);
  const seen = new Set();
  async function keep(path) {
    if (seen.has(path)) return;
    seen.add(path);
    if (await assets.match(path)) return;
    const response = await fetch(path);
    if (!response.ok) return;
    const css = path.endsWith('.css') ? await response.clone().text() : '';
    await assets.put(path, response);
    await Promise.allSettled(linkedStatic(css).map(keep));
  }
  await Promise.allSettled(paths.map(async (path) => {
    const response = await fetch(path, { cache: 'reload' });
    if (!response.ok) return;
    const html = await response.clone().text();
    await pages.put(path, response);
    await Promise.allSettled(linkedStatic(html).map(keep));
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil(Promise.all([precache(ASSETS, PRECACHE), precachePages(PUBLIC_PAGES)])
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
    // Un lien partagé (« ?jour=… ») rouvre la page gardée, même sans réseau.
    const cached = await cache.match(request, { ignoreSearch: true });
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
  // Fichiers au nom unique (empreinte) : un paramètre d'URL éventuel ne change pas le contenu.
  const cached = await cache.match(request, { ignoreSearch: true });
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
  // Les voix des dessins animés (/kalimat/voix/) : gardées pour regarder sans réseau.
  // Si on remplace des voix ou des images sous le même nom, changer VERSION pour vider le cache.
  if (STATIC_PREFIXES.some((prefix) => url.pathname.startsWith(prefix)) || PRECACHE.includes(url.pathname)) {
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
