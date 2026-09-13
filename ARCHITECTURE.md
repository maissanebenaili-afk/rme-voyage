# RME Voyage — Architecture

## Vue d'ensemble

```
┌───────────���─────────────────────────────┐
│           Client Browser / Mobile       │
│  Next.js 15 App Router + React 19       │
│  (TypeScript, Tailwind CSS)             │
└────────────────┬────────────────────────┘
                 │ HTTP
                 ▼
┌─────────────────────────────────────────┐
│      Next.js Server (API Routes)        │
│  /api/prayer → AlAdhan Proxy            │
│  /api/affiliates → Link Building        │
│  /api/geo* → Future Geocoding           │
└────────────────┬────────────────────────┘
                 │
      ┌──────────┼──────────┐
      │          │          │
      ▼          ▼          ▼
   AlAdhan   TP.Media   DirectFerries
   (Prayers)  (Flights)   (Ferries)
```

## Stack Technique

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.7 (strict mode)
- **UI:** React 19 + Tailwind CSS 3.4
- **Icons:** Lucide React
- **Mobile:** Capacitor 7 (iOS/Android)

### Backend
- **Runtime:** Node.js (via Next.js Server)
- **API:** REST endpoints (/api/*)
- **Database:** Supabase (PostgreSQL) - prepared for future
- **Auth:** Supabase Auth - prepared for future

### Deployment
- **Web:** Vercel, Netlify, Railway, etc.
- **Mobile:** Capacitor + App Store/Google Play
- **PWA:** manifest.webmanifest configured

## Répertoire (structure attendue)

```
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   └── page.tsx            # Home page
│
├── api/
│   ├── prayer/
│   │   └── route.ts        # AlAdhan proxy
│   └── affiliates/
│       └── route.ts        # Flight/Ferry affiliate links
│
├── components/
│   ├── RouteSearch.tsx     # Trip search form
│   ├── BookingCards.tsx    # Booking buttons (flights/ferries)
│   ├── CostCalculator.tsx  # Budget calculator
│   ├── PrayerWidget.tsx    # Prayer times ("use client")
│   ├── ServicesMap.tsx     # Services map
│   └── NewsFeed.tsx        # Travel news
│
├── lib/
│   ├── affiliate.ts        # Affiliate URL builders
│   ├── costCalculator.ts   # Cost calculation logic
│   └── config.ts           # Market configurations
│
├── globals.css             # Tailwind imports
├── manifest.webmanifest    # PWA metadata
├── capacitor.config.ts     # Capacitor config
│
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
│
├── .gitignore
├── .env.example
├── README.md
├── DEPLOYMENT.md
├── ARCHITECTURE.md
├── RME_ROUTE_ETAT.md
└── MONETISATION.md
```

## Flux de Données

### 1. Recherche de Trajet
```
User → RouteSearch Component
       → /api/affiliates?type=flight&origin=Paris&destination=Tanger
       → buildFlightAffiliateUrl() en backend
       → TP.Media Link (si TRAVELPAYOUTS_PARTNER_ID défini)
       → Redirect utilisateur
```

### 2. Calcul de Budget
```
User → CostCalculator Component (client-side)
     → calculateTravelCost() (lib/costCalculator.ts)
     → Breakdown: Fuel + Tolls + Ferry = Total
     → Display en temps réel
```

### 3. Horaires de Prière
```
PrayerWidget ("use client") → /api/prayer?latitude=48.8566&longitude=2.3522
                            → AlAdhan API proxy
                            → Cache + Display Fajr/Dhuhr/Asr/Maghrib/Isha
```

## Principes de Conception

### 1. **Secrets → Server-side Only**
- ✅ TRAVELPAYOUTS_PARTNER_ID en env backend
- ❌ Jamais en client-side ou bundle JS

### 2. **API Routes sont Essentielles**
- `/api/prayer` = proxy sécurisé vers AlAdhan
- `/api/affiliates` = validation + link building
- ❌ Ne pas utiliser `output: export` tant que ces routes existent

### 3. **Mobile-First Design**
- Tailwind responsive (sm:, md:, lg:)
- Manifest.webmanifest pour PWA
- Capacitor prêt pour iOS/Android natif

### 4. **Validation & Error Handling**
- Affiliate URLs: `if (!marker) return null` (graceful fallback)
- Prayer API: AbortController + error state
- Cost Calculator: Math.max(0, value) pour valeurs négatives

### 5. **Pas de Données Fictives en Production**
- RME_ROUTE_ETAT.md documente l'état réel
- Footer disclaimer: "MVP. Données temps réel nécessitent sources vérifiées."
- Configurations de test ≠ production

## Sécurité

- ✅ TypeScript strict (noImplicitAny, strictNullChecks)
- ✅ Pas de eval(), innerHTML, ou inputs non validés
- ✅ Env vars en backend, pas exposées au client
- ✅ CORS headers à configurer côté API externe
- ✅ Rate limiting à implémenter sur /api/affiliates

## Performance

- ✅ images.unoptimized: true (Capacitor compatible)
- ✅ Next.js compression enabled
- ✅ CSS-in-JS via Tailwind (no flash of unstyled content)
- ✅ API routes cachées par CDN si applicable
- 🔄 TODO: Service Worker pour offline-first PWA

## Testing (à implémenter)

```bash
# Unit tests (Jest)
npm run test

# E2E tests (Cypress)
npm run test:e2e

# Build validation
npm run build
```

## Intégrations Futures

1. **Géocodage** → Google Maps API ou Nominatim
2. **Routing** → OSRM ou Mapbox Directions
3. **Authentification** → Supabase Auth
4. **Database** → Supabase PostgreSQL
5. **Analytics** → Vercel Analytics ou Segment
6. **Error Tracking** → Sentry ou LogRocket