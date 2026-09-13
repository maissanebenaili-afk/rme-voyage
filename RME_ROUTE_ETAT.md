# RME Route — état maître

## Harmonisation nom + accessibilité renforcée (2026-09-11, branche `chore/harmonisation-nom-et-accessibilite`)

Deux chantiers menés en parallèle sur demande explicite du propriétaire produit
(malvoyant — l'accessibilité de cette section n'est pas cosmétique). Chaque
point ci-dessous a été vérifié par exécution réelle (Playwright direct contre
`localhost:3000`, pas de simulation ni de lecture de code seule) ; voir le
détail des méthodes et scripts dans les commits de la branche.

### Tâche 1 — Harmonisation du nom "RME Voyage"

Toutes les occurrences de "MRE Route"/"mre-route"/"Rme-route-" dans la
documentation, `package.json` et le contenu applicatif ont été remplacées par
"RME Voyage". Fichiers touchés : `ARCHITECTURE.md`, `AUDIT_PREDEPLOIEMENT.md`,
`DEPLOYMENT.md`, `MONETISATION.md`, `QUICK_START.md`, `ROADMAP-V1.md`,
`config.ts`, `deploy-all.sh`, `package.json`.

**Volontairement non modifiés (identifiants techniques déjà potentiellement
publiés, changement risqué et hors périmètre) :**
- `capacitor.config.ts` → `appId: "com.mreroute.app"` inchangé.
- `play-store-listing/listing.md` → `Package ID: com.mreroute.app` inchangé.
- Toute URL de déploiement Vercel (`rme-route.vercel.app`) — protégée
  explicitement par la consigne de la tâche, aucune modification.

### Tâche 2 — Accessibilité renforcée

**Bug racine trouvé et corrigé (`middleware.ts`) :** le CSP
(`Content-Security-Policy`) n'autorisait jamais `'unsafe-eval'`, y compris en
mode développement (`next dev`). Or React Refresh / les source maps webpack de
`next dev` en ont besoin. Conséquence réelle mesurée : en développement, le CSP
bloquait silencieusement TOUTE l'hydratation React côté client (HTML serveur
affiché, mais aucun `useEffect`/handler ne s'exécutait jamais — panneau
d'accessibilité, skip-link, focus trap inertes, sans erreur visible à l'écran).
Corrigé en autorisant `'unsafe-eval'` uniquement quand
`process.env.NODE_ENV === 'development'` (gate strict, pas `!== 'production'`,
pour ne pas relâcher la garantie testée par `__tests__/middleware.test.ts` en
environnement Jest `test`). Le build de production (`next build`) ne génère pas
ce code eval-based et n'a jamais reçu cette autorisation.

**Vérifications/améliorations, toutes confirmées par Playwright réel :**
- **Mode contraste élevé** (`components/Accessibility.tsx`) : l'ancienne règle
  CSS ne ciblait qu'une liste fermée de 3-5 couleurs hexadécimales codées en
  dur, donc ne couvrait pas l'ensemble du contenu réel des 4 pages. Remplacée
  par une règle CSS universelle (`.rme-high-contrast *`) : fond noir, texte
  jaune (`#ffeb3b`), liens en or souligné, boutons/champs/`role="switch"`/
  `role="radio"` avec bordure or et état "actif" inversé, images en niveaux de
  gris contrastés. Mesuré sur les 4 pages (accueil, guide, découvrir,
  télécharger) : ratio de contraste réel **17.2:1** (bien au-delà du minimum
  AA 4.5:1).
- **Focus trap réel dans le panneau d'accessibilité** : le panneau
  (`role="dialog"`) piège désormais le focus clavier — Tab/Shift+Tab en
  bordure du panneau boucle vers le premier/dernier élément focusable au lieu
  de sortir vers la page. Vérifié : après 15 pressions de Tab consécutives, le
  focus reste dans le panneau. `aria-modal="true"` ajouté. Fermeture par
  Échap vérifiée : ferme le panneau ET rend le focus au bouton déclencheur.
- **Focus visible par défaut** : une règle globale `:focus-visible` existait
  déjà dans `app/globals.css` (contour `#0d6255`, indépendante de tout
  réglage) et couvre tout le site par défaut. L'option "focus visible"
  du panneau d'accessibilité est un renfort optionnel au-dessus de cette
  base ; son contour simple (or, `#eead59`) était invisible sur fond clair
  (1.82:1). Remplacé par un double contour simultané — `outline` foncé
  (`#0a2e28`, 13.6–14.6:1 sur fond clair) + `box-shadow` or (`#eead59`,
  7.5:1 sur fond sombre) — garantissant qu'au moins un anneau reste visible
  quel que soit le fond.
- **Contrastes de texte WCAG AA (4.5:1)** : audit systématique de toutes les
  couleurs de texte arbitraires du code contre leurs fonds réellement rendus
  (calcul + vérification Playwright sur DOM réel, pas seulement le code
  source). Échecs réels trouvés et corrigés :
  - `text-[#b45b34]` sur fond crème (`app/page.tsx`, `app/guide/page.tsx`,
    `app/decouvrir/page.tsx`) : 4.36:1 → remplacé par `#a84f2b` (5.13:1).
  - `text-[#b07a1f]` sur popup carte blanche (`components/InteractiveMap.tsx`,
    label "Port de ferry") : 3.72:1 → remplacé par `#9c6b0e` (4.64:1).
  - `text-slate-400`/`text-slate-500` (Tailwind), utilisés comme texte
    secondaire dans une dizaine de composants sur fonds blancs/pastel :
    2.34–4.48:1 → forcés vers l'équivalent `slate-600` (`#475569`,
    6.9–7.6:1) via une règle globale dans `app/globals.css`.
  - Badges de catégorie (`components/TravelChecklist.tsx`) :
    `text-emerald-600`/`text-amber-600`/`text-red-600`/`text-blue-600` sur
    fonds `-50` : 3.07–3.58:1 → remontés vers `-700` (4.84–6.16:1).
  - Boutons pleins (`components/CurrencyConverter.tsx`,
    `components/TravelWidgets.tsx`) : texte blanc sur `bg-emerald-600`
    (3.77:1) et `bg-red-500`"🚨 Urgence" (3.76:1) → `-700`/`-600` (4.83–6.47:1).
  - Texte à opacité réduite `text-[#0d3f38]/40` et `/50`/`/60`
    (`components/TravelWidgets.tsx`, 32 occurrences réelles) : le mélange
    alpha réel sur fond blanc tombait à 2.22–3.64:1 → remonté uniformément à
    `/70` (4.79:1).
  - Libellé "Suite d'outils" (`app/page.tsx`) sur fond dégradé clair :
    1.82:1 → `#8f5b08` (5.34:1).
  - `text-sable-500` (`components/CostCalculator.tsx`, suffixe "km", icônes) :
    1.90:1 → `text-sable-700` (5.07:1).
  Audit final (script Playwright mesurant les styles calculés réels sur les 4
  pages) : **zéro échec de contraste restant**.
- **ARIA du panneau et des boutons ajoutés récemment** ("Ouvrir l'itinéraire",
  "Partager mon trajet", "Comparer les ferries/vols") : vérifiés déjà corrects
  (`components/CityAutocomplete.tsx`, `components/RouteSearch.tsx`,
  `components/BookingCards.tsx` — texte accessible visible, icônes
  `aria-hidden`, `aria-labelledby` corrects). Aucune modification nécessaire.
- **Skip-link "Aller au contenu principal"** : vérifié fonctionnel sur les 4
  pages — premier Tab révèle le lien, Entrée déplace le focus vers
  `#main-content` (`id="main-content" tabIndex={-1}` sur le `<main>` de
  chaque page : accueil, guide, découvrir, télécharger).
- **Non-régression "Vue+" (taille de texte très grande)** : passage de 16px à
  21px racine vérifié, aucun débordement de texte détecté sur boutons/liens/
  titres de la page d'accueil.

### Point investigué, non-problème confirmé

Un signalement antérieur suggérait une lacune CSP (`connect-src` manquant pour
`nominatim.openstreetmap.org`). Vérification du code (`lib/geocoding.ts`) :
aucun appel réseau vers Nominatim n'existe dans le code — le module utilise une
liste statique de villes filtrée côté client, conformément à la politique
Nominatim contre l'autocomplétion côté client. Aucune correction nécessaire.

### Vérifications obligatoires — toutes passées
`npm run lint` ✅ · `npm run test` (80/80) ✅ · `npm run typecheck` ✅ ·
`npm run build` ✅.

## Correctif parcours v1.3.1 (2026-09-11, état de travail)

Cette section remplace les affirmations de conformité Nominatim et de cache
robuste figurant dans les anciens comptes rendus ci-dessous. Les résultats
historiques ne constituent pas une preuve de publication actuelle.

- Réservation : les anciens boutons n'ouvraient qu'une alerte. Ils deviennent
  des liens réels vers les comparateurs publics, utilisables même sans partenaire.
  L'affiliation nécessite désormais un lien HTTPS complet délivré par le tableau
  de bord partenaire (`TRAVELPAYOUTS_FLIGHT_URL` / `DIRECT_FERRIES_AFFILIATE_URL`).
  Aucun programme, marqueur, tarif ni gain n'est inventé.
- Recherche : l'autocomplétion de l'API publique Nominatim était interdite par
  https://operations.osmfoundation.org/policies/nominatim/ et le débit client
  n'assurait pas le plafond agrégé. Remplacée par des suggestions locales,
  gratuites, utilisables hors connexion, avec saisie libre. Les distances
  routières non vérifiées ne sont plus affichées dans ce parcours. L'utilisateur
  peut ouvrir un vrai calcul de trajet dans Google Maps, externe à l'app.
- Partage : un lien préremplit villes/date dans l'application. Aucun envoi
  automatique, aucune collecte d'identité/GPS, consentement via geste utilisateur.
  Repli presse-papiers et champ manuel si les permissions ne sont pas disponibles.
- Hors connexion : retrait de `/globals.css` inexistant, précache tolérant à un
  fichier optionnel manquant, nettoyage limité aux caches RME Voyage, pas de
  cache des API/affiliations, des dates partagées ni des réponses Next.js RSC.
  Ce n'est pas une synchronisation hors ligne complète.
- Partage social : image Open Graph réellement générée ; sitemap et métadonnées
  pointent vers `https://rme-route.vercel.app` ou un domaine HTTPS explicitement
  configuré, suppression des variantes `/en` et `/ar` inexistantes.
- Livraison : `.vercelignore` corrigé (il contenait des `\n` littéraux sur une
  seule ligne), script `typecheck` ajouté. Cela ne prouve pas que les contrôles
  de déploiement tiers sont réparés.

### Blocages observés sur les services connectés

- GitHub : CI et CodeQL réussissent sur `6a4e5bf`.
- Vercel : le déploiement `5vBo4tq43jNkKT67d97THb7fG3dE` est construit mais
  non promu, avec « Checks for Deployment have failed ». Lint et Typecheck
  affichent « No package.json found in project », alors que le fichier existe
  dans GitHub et que le répertoire racine Vercel est vide (racine du dépôt).
  Ne pas désactiver les contrôles obligatoires ni promouvoir à l'aveugle.
  Diagnostic : https://vercel.com/maissanebenaili-2967/rme-route/5vBo4tq43jNkKT67d97THb7fG3dE
- Travelpayouts : le navigateur connecté montre encore l'étape d'ajout du canal
  à monétiser. Aucune approbation de programme ni lien de commission confirmé.
  Aucune inscription partenaire ni publication sociale soumise pendant l'audit.

Date : 2026-09-11 (v1.3.0 — CI GitHub Actions, rate limiting, durcissement CORS/CSP)

## Source de vérité
Le dépôt GitHub est la source de vérité technique. Les modifications doivent :
- Partir de ce dépôt
- Produire des commits/PRs identifiables
- Mettre à jour ce fichier

## ✅ Consolidé
- Base commerciale : recherche trajet + cartes ferry/vol + endpoint affiliation
- Base MVP corrigée : calculateur de coût, prières, services, infos voyage
- **NEW:** Configuration Capacitor pour mobile
- **NEW:** PWA manifest.webmanifest
- **NEW:** Correction CostCalculator.tsx ("use client" directive)
- **NEW:** Architecture stricte TypeScript + security layers
- **NEW:** Documentation production-ready (DEPLOYMENT.md, ARCHITECTURE.md, AUDIT_PREDEPLOIEMENT.md)
- **NEW (v1.2.0) :** Refonte complète du design/UX (identité visuelle RME Voyage, typographie Boska/General Sans, animations framer-motion) — voir section Version History pour le détail
- **NEW (v1.3.0) :** CI GitHub Actions (lint/tests/build), rate limiting in-memory documenté sur les routes API sensibles, durcissement CORS/CSP dans `middleware.ts` — ET géocodage réel via Nominatim/OpenStreetMap pour l'autocomplétion départ/destination + distance estimée à partir de coordonnées réelles, PWA offline renforcée (stale-while-revalidate sur les pages principales), vérification de la performance des polices et de la taille du bundle — voir section Version History pour le détail complet

## ✅ Production-Ready
- [x] Code compile (TypeScript strict)
- [x] Aucun secret en git
- [x] Pas de prix/horaires fictifs sans disclaimer
- [x] API routes server-side prêtes
- [x] Env vars documentés (.env.example)
- [x] .gitignore complet
- [x] Documentation déploiement complète

## ⚠️ Encore non fait (v1.0.0 → v1.1.0)
- Routing multi-alternatives de production
- Péages fiables par pays
- Prix carburant temps réel
- Ferries temps réel
- Carte MapLibre/POI
- GPS/Qibla/prière dynamiques par position
- Signalements communautaires Supabase
- Authentification/anti-spam/modération
- Analytics + tracking conformité
- ~~CI GitHub et tests automatisés~~ ✅ fait (v1.3.0, voir changelog) — vérifier que la CI est bien verte sur GitHub après merge de la PR
- ~~Rate limiting sur API~~ ✅ fait en v1 in-memory (v1.3.0) — **non distribué**, évolution Upstash/Vercel KV recommandée avant scale multi-instances
- ~~CORS/CSP headers~~ ✅ durci (v1.3.0)
- ~~Géocodage réel/autocomplétion~~ ✅ fait (v1.3.0, Nominatim/OSM — gratuit, sans SLA, voir changelog)
- ~~PWA/offline robuste~~ ✅ renforcé (v1.3.0, stale-while-revalidate)

## 🆕 Nouveau suivi (post v1.3.0)
- Rate limiting actuel = Map JS en mémoire par instance : à migrer vers un
  store durable (Upstash Redis / Vercel KV) avant un trafic de production
  significatif sur Vercel serverless (voir commentaire détaillé dans
  `middleware.ts`).
- Géocodage Nominatim/OSM = service gratuit sans SLA, soumis à limite de
  débit — prévoir un fournisseur payant si le volume d'usage devient
  significatif.

## 🚀 Prochaines étapes immédiates
1. Merger branch `production-ready` en `main`
2. Déployer en web (Vercel recommandé)
3. Tester 1 semaine en beta
4. Implémenter GitHub Actions + tests (blocking)
5. Ajouter monitoring (Sentry, analytics)

## 📋 Règles de travail multi-IA (UPDATED)
1. Lire ce fichier avant toute modification
2. Ne jamais prétendre qu'une intégration externe est active sans preuve
3. Ne jamais committer de secret (utiliser .env.example)
4. Une modification = un commit clair avec message explicite
5. Toute modification importante doit mettre à jour ce fichier
6. En cas de conflit entre une proposition et le code réel, le code + tests font foi
7. PRs doivent être revues avant merge
8. Production deployments require passing CI (à implémenter)

## 📊 Version History
- **v0.1.0** (2026-09-08) — Initial consolidation
- **v1.0.0** (2026-09-09) — Production-ready + audit complet
- **v1.2.0** (2026-09-11) — Refonte design/UX pour le concours (voir détail ci-dessous)
- **v1.3.0** (2026-09-11) — CI GitHub Actions + rate limiting + durcissement CORS/CSP + géocodage réel Nominatim + performance + PWA offline (voir détail ci-dessous)
- **v1.1.0** (TBD) — Routing multi-alternatives, péages, ferries/vols temps réel, mobile + testing

### v1.2.0 (2026-09-11) — Refonte design/UX "identité RME Voyage"

**Objectif :** élever le design et l'UX pour le concours national, sans toucher à la logique métier ni au contenu multilingue existant.

**Système de design (`tailwind.config.ts`)**
- Palette de marque : `terracotta` (rouille), `zellige` (bleu profond marocain, utilisé comme fond hero `zellige-800`), `safran` (doré accent CTA), `sable` (neutres crème), chacune en échelle 50–900.
- Typographie distinctive via CDN Fontshare : `font-display` = **Boska** (serif éditorial, titres H1/H2), `font-sans` = **General Sans** (corps de texte), avec fallback `next/font/google` (Inter, Plus Jakarta Sans) et **Amiri** pour l'arabe/RTL.
- Échelle de taille fluide, `borderRadius`, `boxShadow` (`warm`, `warm-lg`, `gold`), `backgroundImage` (`zellige-grid`), animation `marquee`.
- CSP (`middleware.ts`) mise à jour pour autoriser `api.fontshare.com` / `cdn.fontshare.com` (style-src/font-src).

**Pages retravaillées** (contenu et logique inchangés) :
- `app/page.tsx` (accueil) — titres passés en `font-display`, nouvelle hiérarchie visuelle sur le hero zellige.
- `app/decouvrir/page.tsx`, `app/guide/page.tsx`, `app/telecharger/page.tsx` — réécriture visuelle complète (hero zellige, accents safran/terracotta, cartes bordées, disclaimers honnêtes conservés).

**Composants sublimés :**
- `HadakAI.tsx` — animations `framer-motion` : bouton flottant avec halo pulsant et transition d'icône, panneau de chat en `AnimatePresence` (slide + scale spring), bulles de message animées, indicateur de frappe et suggestions rapides animées. Base de connaissances et logique de correspondance multilingue inchangées.
- `JuryPack.tsx` — typographie display, animations d'entrée `whileInView` sur les métriques, libellé CTA reformulé ("Ouvrir l'aperçu de l'app") avec mention explicite que les liens de démonstration ne sont pas garantis actifs (conformité règle n°2 ci-dessus).
- `BookingCards.tsx`, `CostCalculator.tsx`, `InteractiveMap.tsx`, `InteractiveMapWrapper.tsx` — recolorisation complète vers les tokens terracotta/zellige/safran/sable (remplacement des couleurs slate/emerald/blue/orange/purple hors charte). Calculs et logique métier non modifiés.
- `LanguageSwitcher.tsx` — restylé (fond `zellige-800`, ombre `warm-lg`), rendu RTL-aware, et **rendu compact sur mobile** (code langue au lieu du libellé complet) pour corriger un débordement horizontal.
- `TravelWidgets.tsx` — titres de section passés en `font-display` (Météo, Darija, douanes, urgences, calendrier, zakat, fuseau/SIM, carburant).

**Corrections de bugs découverts pendant la QA visuelle (non liées au design pur) :**
- CSP : `connect-src` ne listait pas `https://api.open-meteo.com`, ce qui bloquait silencieusement le widget météo (affichait "Indisponible"). Corrigé — vérifié par une QA sans erreur console CSP.
- Nav mobile (375px) : le bouton "Planifier" débordait de ~30px hors du viewport sur la page d'accueil à cause du `LanguageSwitcher` + CTA trop larges côte à côte. Corrigé (switcher compact, paddings réduits, `whitespace-nowrap`, `shrink-0`) — confirmé 0 débordement horizontal sur les 4 pages (accueil, découvrir, guide, télécharger) en desktop et mobile.

**QA effectuée :**
- `npm run build` passant sans erreur après chaque commit.
- Captures d'écran Playwright desktop (1440px) et mobile (375px) pour les 4 pages, plus captures ciblées HadakAI (ouvert) et JuryPack.
- Aucune régression visuelle détectée après corrections ; RTL arabe/darija vérifié dans HadakAI.

**Rappel de conformité :** aucune intégration externe n'est présentée comme active sans preuve (JuryPack précise que les liens de démo dépendent de la disponibilité de l'hébergement), aucun secret commité, un commit clair par modification (voir historique git).

### v1.3.0 (2026-09-11) — CI GitHub Actions + rate limiting + durcissement CORS/CSP

**Objectif :** traiter les 3 items HIGH PRIORITY listés ci-dessus, sans changer la logique métier ni le design v1.2.0.

**Contexte / branche `ci-github-actions` :** une branche distante existait déjà
(`origin/ci-github-actions`), issue d'un essai antérieur basé sur le commit
juste avant le merge du design v1.2.0. Son `.github/workflows/ci.yml` et son
`.eslintrc.json` étaient réutilisables tels quels ; en revanche son commit
appliquait aussi un reformatage Prettier complet du dépôt (`format:check`),
qui aurait écrasé/entré en conflit massif avec le design v1.2.0 fraichement
fusionné sur `main`. Cette partie a été sciemment écartée : le travail ci-dessous
repart de `main` (post v1.2.0) et ne reprend que le workflow CI + la config
ESLint.

**1. CI GitHub Actions (`.github/workflows/ci.yml`)**
- Nouveau workflow sur `push`/`pull_request` vers `main` : `npm ci`, puis
  `npm run lint`, `npm run test`, `npm run build`.
- Ajout `.eslintrc.json` (`next/core-web-vitals`) : `main` n'avait aucune
  config ESLint, ce qui rendait `next lint` interactif (bloquant en CI).
- Ajout `eslint@8` + `eslint-config-next` en devDependencies (requis par
  `next lint` avec Next 15 ; leur absence provoquait une erreur
  "Unknown options" avec une version d'ESLint résolue globalement).

**2. Rate limiting (`middleware.ts`, `app/api/affiliates`, `app/api/prayer`)**
- Implémentation in-memory (fenêtre glissante simple, `Map` JS par IP +
  chemin), appliquée spécifiquement aux deux routes API listées (au lieu de
  toutes les routes `/api/*` précédemment).
- **Limite explicitement documentée en commentaire dans le code :** ce
  stockage est local à l'instance du process. Ce n'est **pas** une solution
  distribuée : sur Vercel serverless, des instances différentes ne partagent
  pas cette `Map`, donc la limite globale peut être dépassée si le trafic est
  réparti sur plusieurs instances. Suffisant pour une v1 (anti-abus basique),
  mais **évolution recommandée vers un store durable partagé** (Upstash Redis
  via `@upstash/ratelimit`, ou Vercel KV) avant un trafic de production
  significatif.

**3. CORS / CSP (`middleware.ts`)**
- CORS : ajout d'une whitelist explicite d'origines pour les routes `/api/*`
  (domaines connus de l'app + `NEXT_PUBLIC_APP_URL` optionnel, `localhost`
  uniquement hors production). Toute origine non listée ne reçoit aucun
  header `Access-Control-Allow-Origin` (vérifié manuellement). Gestion de la
  requête preflight `OPTIONS` directement dans le middleware.
- CSP : retrait de `unsafe-eval` (non utilisé par le code de l'app), ajout de
  `frame-ancestors 'none'` et `object-src 'none'`. `X-Frame-Options: DENY`
  et les autres en-têtes (`X-Content-Type-Options`, HSTS, `Referrer-Policy`,
  `Permissions-Policy`) sont conservés.

**Vérifications effectuées avant la PR :**
- `npm install`, `npm run lint`, `npm run test` (29/29, dont un nouveau
  fichier `__tests__/middleware.test.ts`), `npm run build` : tous passants.
- Test manuel avec le serveur de prod local (`npm run build && npm run
  start`) : origine autorisée → CORS + CSP durcie présents ; origine non
  autorisée → pas de header CORS ; `OPTIONS` → 204 ; 31e requête/minute sur
  `/api/prayer` depuis la même IP → 429 avec `Retry-After`.
- Correction incidente découverte pendant la stabilisation des tests : un
  test (`homeBranding.test.tsx`) attendait un ancien texte remplacé par le
  design v1.2.0, et `IntersectionObserver` (utilisé par `framer-motion` dans
  `JuryPack`) n'était pas mocké dans l'environnement jsdom — les deux ont été
  corrigés pour que `npm run test` passe sans erreur.

**Rappel de conformité :** le rate limiting n'est à aucun moment présenté
comme une solution distribuée/robuste multi-instances ; aucun secret commité ;
commits incrémentaux et ciblés (voir historique git de la branche
`opt/ci-et-securite`).

### v1.3.0 (2026-09-11) — Géocodage réel Nominatim + performance + PWA offline

**Objectif :** activer le géocodage réel (item le plus prioritaire du backlog),
optimiser le chargement des polices/bundle, et renforcer le mode hors-ligne de
la PWA.

**1. Géocodage réel (`lib/geocoding.ts`, `components/CityAutocomplete.tsx`, `components/RouteSearch.tsx`)**
- Intégration de l'API publique **Nominatim / OpenStreetMap**
  (`https://nominatim.openstreetmap.org/search`) pour l'autocomplétion réelle
  des champs "Départ" et "Destination" de `RouteSearch.tsx` (remplace la saisie
  libre sans suggestions).
- ⚠️ **Service tiers gratuit, pas une solution entreprise** : aucune clé API,
  aucune garantie de disponibilité/SLA, soumis à la
  [politique d'usage Nominatim](https://operations.osmfoundation.org/policies/nominatim/).
  À ne jamais présenter comme une intégration "production-grade" — c'est un
  point d'entrée gratuit à remplacer par un fournisseur payant si le volume
  d'usage devient significatif.
- Conformité à la politique d'usage appliquée dans `lib/geocoding.ts` :
  - Debounce ≥ 450 ms côté `CityAutocomplete.tsx` avant tout appel réseau.
  - Throttling client strict : file d'attente qui garantit au plus 1
    requête/seconde vers Nominatim (`scheduleThrottled`), même si plusieurs
    champs déclenchent une recherche presque simultanément.
  - Cache mémoire simple (`Map`) par requête normalisée pour éviter de
    re-géocoder une ville déjà recherchée dans la session.
  - En-tête `X-App-Name` identifiant l'application + `referrerPolicy: origin`
    (le User-Agent réseau réel reste celui du navigateur, conforme à l'usage
    web côté client documenté par Nominatim).
  - Aucun "bulk geocoding" : une requête = une saisie utilisateur débattue.
- Distance de trajet : `estimateRoadDistanceKm()` calcule une distance
  orthodromique (Haversine) à partir des **coordonnées réelles** retournées
  par Nominatim quand l'utilisateur sélectionne une suggestion pour le départ
  ET la destination, multipliée par un facteur d'ajustement route/ferry
  (`ROAD_DISTANCE_FACTOR = 1.35`, estimation affichée comme telle dans l'UI).
  Les distances statiques des "trajets populaires" (boutons de raccourci)
  sont conservées comme valeurs indicatives de secours quand le géocodage n'a
  pas encore résolu de coordonnées.
- CSP (`middleware.ts`) : ajout de `https://nominatim.openstreetmap.org` à
  `connect-src` (sans cette entrée, tous les appels auraient été bloqués
  silencieusement — même erreur que celle corrigée pour Open-Meteo en v1.2.0).
- Test réel effectué (voir preuve ci-dessous) : recherche "Paris" → résultats
  réels dont Paris, France (lat 48.8535, lon 2.3484) ; recherche "Tanger" →
  résultat réel Tangier, Maroc (lat 35.7696, lon -5.8034).

**2. Performance**
- Polices Boska/General Sans (Fontshare) : `preconnect` déjà présent vers
  `api.fontshare.com` et `cdn.fontshare.com` dans `app/layout.tsx`,
  `display=swap` déjà appliqué sur l'URL Fontshare et sur les fonts
  `next/font/google` (Inter, Plus Jakarta Sans, Amiri) — vérifié, aucune
  régression à corriger sur ce point (déjà conforme aux bonnes pratiques
  depuis la v1.2.0).
- `<img>` : aucune balise `<img>` brute trouvée dans `app/` ou `components/`
  (vérifié par recherche exhaustive) — rien à convertir vers `next/image`.
  À noter : `next.config.mjs` a `images.unoptimized: true` (nécessaire pour
  les usages actuels), donc `next/image` n'apporterait pas d'optimisation
  serveur tant que ce flag reste actif.
- Bundle : `npm run build` comparé avant/après sur la page d'accueil (qui
  embarque le nouveau module de géocodage) :
  - Avant (main) : `/` = 96.5 kB page / 202 kB First Load JS.
  - Après (cette branche) : `/` = 98.1 kB page / 204 kB First Load JS.
  - Delta : **+1.6 kB / +2 kB**, attribuable au nouveau code
    `lib/geocoding.ts` + `components/CityAutocomplete.tsx`. Aucune régression
    anormale détectée ; le reste des pages (`guide`, `decouvrir`,
    `telecharger`) est inchangé (167 B chacune).

**3. PWA / offline (`public/sw.js`)**
- Nouvelle stratégie **stale-while-revalidate** (`staleWhileRevalidate()`)
  appliquée aux 3 pages statiques principales (`/`, `/guide`, `/decouvrir`) :
  réponse instantanée depuis le cache si disponible, avec rafraîchissement
  réseau en arrière-plan qui met à jour le cache pour la prochaine visite.
- Ces 3 pages sont désormais pré-cachées dès l'installation du Service
  Worker (`PAGES_CACHE`), en plus des assets statiques déjà pré-cachés
  (`STATIC_CACHE`).
- Version de cache incrémentée (`rme-voyage-v1` → `rme-voyage-v2`) pour
  forcer le nettoyage des anciens caches côté clients existants.
- Le reste de la stratégie (cache-first pour assets statiques, network-first
  pour `/api/*`, fallback `offline.html`) est conservé sans changement de
  logique.
- Limite assumée : ceci reste un Service Worker applicatif simple (pas de
  Workbox), suffisant pour un usage PWA basique — pas une solution de sync
  offline avancée (pas de queue de requêtes en attente, pas de
  Background Sync API).

**QA effectuée :**
- `npm install` : succès (avertissements `EBADENGINE` sur Node 20 vs 22
  requis par des sous-dépendances Supabase — non bloquant, build et dev
  fonctionnent sur Node 20.20.1).
- `npm run build` : succès sans erreur, sur `main` et sur cette branche.
- `npm test` (Jest) : 22/23 tests passent ; le seul échec
  (`homeBranding.test.tsx`, `IntersectionObserver is not defined` en jsdom
  à cause de `framer-motion`) est **préexistant sur `main`** avant cette
  branche — vérifié en rejouant les tests sur `main` (même résultat exact :
  1 failed, 22 passed). Non lié aux changements de cette PR.
- Géocodage testé en conditions réelles via un harnais de test isolé
  reproduisant fidèlement `lib/geocoding.ts` (mêmes règles de debounce/
  throttle/cache/User-Agent), ouvert dans un navigateur réel : recherche
  "Paris" → 4 résultats réels Nominatim ; recherche "Tanger" → 1 résultat réel
  Nominatim (Tangier, Maroc). Capture d'écran conservée dans
  `.qa-geocode-test/proof_paris_tanger.jpg` (non commité — dossier de test
  local, exclu du dépôt applicatif).

**Rappel de conformité :** aucun secret commité (Nominatim ne nécessite pas
de clé), aucune intégration présentée comme "entreprise" ou garantie
disponible — le README de ce fichier précise explicitement les limites de
Nominatim (gratuit, débit limité, pas de SLA). Un commit clair par
changement (géocodage, CSP, service worker, documentation).
