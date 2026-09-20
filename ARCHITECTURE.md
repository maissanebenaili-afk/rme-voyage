# RME Voyage — architecture vérifiée

## Périmètre

Application web mobile-first qui aide à préparer les voyages Europe ↔ Maroc.
Le dépôt est la source de vérité : les fournisseurs externes, données temps réel,
partenariats et tarifs ne sont pas considérés actifs sans configuration et preuve
exécutée.

## Pile réellement implémentée

- **Framework :** Next.js (App Router) avec React et TypeScript strict.
- **Interface :** Tailwind CSS, composants React et `lucide-react`.
- **Déploiement :** Vercel ; l’API est fournie par les Route Handlers Next.js.
- **Données locales :** listes et réponses de repli documentées dans le code.
- **PWA :** manifest, service worker et parcours d’installation sont présents.
- **Mobile :** configuration Capacitor présente pour une évolution native future.
- **Observabilité :** `@vercel/speed-insights` est rendu dans le layout. Son
  statut d’activation et ses données doivent être vérifiés dans Vercel.

## Services optionnels, non garantis

- **Supabase :** le client est activé seulement si `NEXT_PUBLIC_SUPABASE_URL` et
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont configurés. Sans ces variables, les routes
  concernées utilisent leur comportement de repli local ; l’authentification et
  la modération ne sont pas établies comme actives.
- **IA Hadak :** le serveur tente les fournisseurs configurés, puis expose un
  signal de repli que l’interface traite localement. Aucun fournisseur ni niveau
  de service n’est garanti sans clé et validation d’exécution.
- **Affiliation ferry/vol :** les liens ne sont utilisables que lorsqu’un lien
  HTTPS complet, approuvé et configuré est fourni. Aucun partenariat, prix,
  horaire ou commission n’est présumé.
- **Données tierces :** itinéraires, météo et prières dépendent des sources
  réellement appelées par les routes ou composants ; toute indisponibilité doit
  être présentée comme telle.

## Sécurité et fiabilité

- `proxy.ts` ajoute les en-têtes de sécurité, applique une politique CORS
  restrictive et limite certaines routes publiques.
- Le rate limiting actuel est une `Map` en mémoire par instance : il limite les
  abus simples mais ne constitue pas une garantie distribuée. Une solution
  durable doit être choisie et intégrée avant de revendiquer une protection
  multi-instance.
- Les secrets restent côté serveur et les valeurs d’exemple sont documentées
  dans `.env.example`.

## Vérification continue

La CI exécute `npm run lint`, `npm run test` et `npm run build` sur les push et
pull requests vers `main`. Les scripts locaux incluent aussi `npm run typecheck`.
Toute évolution doit conserver ces contrôles et documenter les résultats réels
plutôt que de déclarer le produit « production ready ».

## Évolutions possibles, non implémentées par défaut

- Itinéraires multi-alternatives et données de péages/carburant/ferry temps réel
  provenant de fournisseurs validés.
- Authentification, signalements communautaires et modération persistants.
- Monitoring d’erreurs externe et analytics, après validation de la solution et
  de son paramétrage.
- Stockage de rate limiting partagé, notamment via Upstash Redis installé via la
  Marketplace Vercel (Vercel KV n’est plus un produit first-party depuis la
  migration de décembre 2024).
