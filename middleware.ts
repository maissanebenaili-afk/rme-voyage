import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------
//
// IMPORTANT — LIMITATION CONNUE :
// Ce rate limiting est un stockage EN MÉMOIRE (Map JS) local à l'instance du
// process qui exécute le middleware. Ce n'est PAS une solution distribuée :
//   - Sur Vercel (serverless/edge), chaque invocation peut être routée vers une
//     instance différente, qui ne partage pas cette Map. Un même client peut
//     donc dépasser la limite affichée si le trafic est réparti sur plusieurs
//     instances froides/chaudes.
//   - En cas de redémarrage/scale-to-zero, les compteurs sont perdus.
// C'est une protection "best effort" suffisante pour une v1 (limite les abus
// grossiers, les boucles de scraping basiques, les erreurs de client), mais ne
// doit jamais être présentée comme une solution de rate limiting robuste ou
// distribuée. Pour une garantie correcte multi-instances, migrer vers un store
// partagé et durable : Upstash Redis (`@upstash/ratelimit`) ou Vercel KV.
// TODO (v1.1+): remplacer ce Map en mémoire par Upstash/Vercel KV.
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requêtes / minute / IP / instance

type RateLimitEntry = { count: number; resetAt: number };
const rateLimitStore = new Map<string, RateLimitEntry>();

// Routes API couvertes par le rate limiting (v1 : endpoints publics sensibles).
const RATE_LIMITED_API_PREFIXES = ['/api/affiliates', '/api/prayer'];

function getClientKey(request: NextRequest): string {
  // x-forwarded-for peut contenir plusieurs IPs (client, proxies) ; on garde
  // la première (client d'origine déclaré). Sur Vercel, cet en-tête est fourni
  // par la plateforme et n'est pas falsifiable côté edge.
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0]?.trim() : null;
  return ip || 'anonymous';
}

function isRateLimited(key: string): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now >= entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, retryAfterSeconds: 0 };
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return { limited: true, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) };
  }

  return { limited: false, retryAfterSeconds: 0 };
}

function pruneExpiredEntries(now: number) {
  // Nettoyage opportuniste pour éviter une fuite mémoire non bornée sur une
  // instance longue durée (n'a aucun effet sur la robustesse multi-instances).
  if (rateLimitStore.size <= 1000) return;
  for (const [key, entry] of rateLimitStore) {
    if (now >= entry.resetAt) rateLimitStore.delete(key);
  }
}

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------
//
// Les routes API de ce projet sont consommées en same-origin par l'app
// Next.js elle-même (pas de SDK/tierce partie publique aujourd'hui). Le CORS
// est donc restreint au(x) domaine(s) officiel(s) de l'app plutôt qu'ouvert à
// `*`. Ajuster ALLOWED_ORIGINS si un consommateur externe légitime apparaît.
const DEFAULT_ALLOWED_ORIGINS = [
  'https://rme-voyage.com',
  'https://www.rme-voyage.com',
  'https://rme-voyage-app.pplx.app',
  'https://rme-voyage.pplx.app',
];

const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
const ALLOWED_ORIGINS = new Set(
  configuredOrigin ? [...DEFAULT_ALLOWED_ORIGINS, configuredOrigin] : DEFAULT_ALLOWED_ORIGINS,
);

// En développement local, on tolère localhost pour ne pas casser le workflow
// des contributeurs, sans jamais l'activer en production.
if (process.env.NODE_ENV !== 'production') {
  ALLOWED_ORIGINS.add('http://localhost:3000');
}

function applyCorsHeaders(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Vary', 'Origin');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  return response;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets entirely.
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/manifest.webmanifest' ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff2?)$/)
  ) {
    return NextResponse.next();
  }

  const isRateLimitedRoute = RATE_LIMITED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isApiRoute = pathname.startsWith('/api/');

  // Preflight CORS requests never need to reach the route handler.
  if (isApiRoute && request.method === 'OPTIONS') {
    const preflight = new NextResponse(null, { status: 204 });
    return applyCorsHeaders(preflight, request);
  }

  // Rate limiting for the sensitive public API routes.
  if (isRateLimitedRoute) {
    const key = `${getClientKey(request)}:${pathname}`;
    const { limited, retryAfterSeconds } = isRateLimited(key);
    pruneExpiredEntries(Date.now());

    if (limited) {
      const tooManyResponse = NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(retryAfterSeconds || 60) } },
      );
      return applyCorsHeaders(tooManyResponse, request);
    }
  }

  const response = NextResponse.next();

  if (isApiRoute) {
    applyCorsHeaders(response, request);
  }

  // Security headers (CSP resserrée : uniquement les origines tierces
  // réellement utilisées par l'app — voir RME_ROUTE_ETAT.md pour le détail).
  //
  // IMPORTANT — 'unsafe-eval' en développement uniquement : Next.js `next dev`
  // utilise du code généré dynamiquement (React Refresh / source maps webpack)
  // qui nécessite `eval`. Sans cette autorisation en dev, le CSP bloque
  // silencieusement TOUTE l'hydratation React côté client (violation logguée
  // en console, aucune erreur visible à l'écran) : le HTML rendu serveur
  // s'affiche mais aucun useEffect/handler ne s'exécute jamais — panneau
  // d'accessibilité, skip-link injecté, focus trap, etc. restent inertes.
  // Ne JAMAIS ajouter 'unsafe-eval' en production : le build `next build` ne
  // génère pas ce code eval-based, donc il n'est pas nécessaire et affaiblirait
  // la CSP pour rien.
  // Gate strictement sur 'development' (et non "!== 'production'") : Jest
  // exécute les tests avec NODE_ENV="test", qui n'est ni development ni
  // production. Le test de sécurité __tests__/middleware.test.ts vérifie
  // que le CSP ne contient JAMAIS 'unsafe-eval' pour garantir qu'aucune
  // régression future ne l'active accidentellement hors dev. Avec
  // "!== 'production'", l'environnement de test aurait aussi reçu
  // 'unsafe-eval', invalidant cette garantie de sécurité.
  const scriptSrc =
    process.env.NODE_ENV === 'development'
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.aladhan.com"
      : "script-src 'self' 'unsafe-inline' https://api.aladhan.com";

  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.fontshare.com https://cdn.fontshare.com",
    "font-src 'self' https://fonts.gstatic.com https://cdn.fontshare.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api.aladhan.com https://*.tile.openstreetmap.org https://router.project-osrm.org https://api.open-meteo.com",
    "frame-src 'self' https://www.openstreetmap.org",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
