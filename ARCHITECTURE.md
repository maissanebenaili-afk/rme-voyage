# RME Voyage - Architecture

 > **Code de référence :** GitHub / `main`.
>
> **Production web :** Netlify — https://rme-voyage.netlify.app
>
> **Vercel : HISTORICAL** — ancien environnement ; pas une cible de production actuelle.
>
> **Preuve de correspondance :** SHA Git associé au déploiement Netlify.
>
> **Dernier snapshot de production vérifié pendant le contrôle documentaire :** `7dda27a9dcdb02346dcb27119093e11b587ba52b`. Ce SHA est un instantané daté.

Ce document décrit la pile réellement implémentée dans ce dépôt. Toute
mention d'un service ci-dessous suppose ses variables d'environnement
configurées ; sans elles, le code bascule explicitement en mode dégradé
(voir `DEVELOPMENT.md`, `RME_ROUTE_ETAT.md`) plutôt que d'échouer
silencieusement.

## Vision
Application de voyage pour la diaspora marocaine (MRE) : itinéraires,
transferts d'argent, infos pratiques (prière, météo, ferry), assistant
conversationnel Hadak, marketplace caftans et partenaires immobiliers.

---

## 1. Stack réelle

### Frontend
- **Framework :** Next.js 16 (App Router, React 18, Turbopack)
- **UI :** Tailwind CSS
- **Cartes :** Leaflet / react-leaflet (OpenStreetMap)
- **Animations :** Framer Motion
- **Icônes :** Lucide React

### Backend
- **Runtime :** routes API Next.js (`app/api/*`), Netlify Functions (routes) et Edge Functions (proxy, limites de débit)
- **Auth + DB :** Supabase (PostgreSQL + Auth), **optionnelle** — sans
  `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`, l'app tourne en
  mode données fictives (voir `packages/utils/supabase.ts`)
- **IA conversationnelle (Hadak) :** Anthropic API côté serveur, avec repli
  local documenté si l'API est indisponible
- **Proxy applicatif :** `proxy.ts` — CORS, rate limiting en mémoire (best
  effort, non distribué), CSP, rafraîchissement de session Supabase

### Infrastructure
- **Hébergement :** Netlify
- **Vercel :** HISTORICAL
- **CI :** GitHub Actions (`.github/workflows/ci.yml` — lint, test, build)
- **Mobile :** Capacitor (préparation iOS/Android, non publié)
- **Analytics :** les anciennes références à Vercel Analytics sont HISTORICAL et ne constituent pas une preuve d'hébergement Vercel. La mesure actuellement revendiquée doit être vérifiée dans le code et les logs de production.

---

## Frontière de vérité

```text
GitHub / main
      │
      │ commit SHA
      ▼
Netlify production
      │
      │ deployment SHA
      ▼
preuve de correspondance
```

Un composant présent dans le dépôt n'est pas automatiquement une fonctionnalité **ACTIVE**.

Une fonctionnalité expérimentale reste **LAB** jusqu'à validation explicite.

Une intégration nécessitant un compte ou une variable externe reste **CONFIGURABLE** tant que cette configuration n'est pas vérifiée.

## 2. Fonctionnalités implémentées

- Recherche d'itinéraire et calcul de coût réel de trajet (RME Reality
  Check) — péages, carburant, ferry, scénarios comparés
- Comparateur de transferts EUR→MAD (taux de change live)
- Assistant Hadak (chat IA, infos pratiques)
- Marketplace Marwa Caftan
- Section immobilière Taza (partenaire Aziz HiDOUR)
- Programme d'affiliation avec statut explicite (actif/non configuré),
  tracking de clics respectueux de la vie privée
- Authentification Supabase (inscription, connexion, session)
- PWA (manifest, pas de service worker à ce jour)

## 3. Non implémenté (ne pas présenter comme actif)

- Offre B2B / widget embarquable payant (`/pro` — en préparation, aucune
  facturation)
- Paiement Stripe actif
- Tableau de bord analytics client
- App mobile publiée sur les stores

---

## 4. Sécurité

- CSP stricte (voir `proxy.ts` pour le détail et les exceptions dev-only)
- Rate limiting sur les routes API sensibles
- Identité utilisateur sur `/api/trips` dérivée exclusivement de la session
  Supabase validée côté serveur — jamais d'un header client (voir
  `RME_ROUTE_ETAT.md`)
- Headers de sécurité (HSTS, X-Frame-Options, etc.)

---

## 5. État et historique

L'état détaillé, daté, des correctifs et vérifications successifs est tenu
dans `RME_ROUTE_ETAT.md` — à consulter avant toute intervention pour éviter
de rouvrir un chantier déjà traité.
