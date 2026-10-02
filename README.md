# RME Voyage

Plateforme de préparation et d'accompagnement des voyages des MRE et voyageurs des corridors **France ↔ Maroc**, avec extension **Algérie**.

## État documentaire — octobre 2026

## Vérité de déploiement

- **Code de référence :** GitHub, branche `main`.
- **Production web :** Netlify.
- **URL canonique :** https://rme-voyage.netlify.app
- **Preuve de correspondance :** SHA Git associé au déploiement de production Netlify.
- **Dernier snapshot de production vérifié pendant le contrôle documentaire :** `7dda27a9dcdb02346dcb27119093e11b587ba52b`.
- Ce SHA est un instantané daté et doit être revérifié avant toute nouvelle affirmation concernant la production.
- **Vercel : HISTORICAL** — ancien environnement ; pas une cible de production actuelle.

### Statuts produit

- **ACTIVE** — présent, vérifié et utilisable sur la production Netlify actuelle.
- **CONFIGURABLE** — code présent, mais activation dépendante d'une configuration ou validation externe.
- **LAB** — expérimental, isolé et non inclus dans la promesse produit de production.
- **HISTORICAL** — archive, ancien environnement, ancien audit ou décision datée.
- **NOT VERIFIED** — affirmation sans preuve actuelle suffisante ; ne pas la présenter comme disponible.

RME Voyage a dépassé le stade de simple MVP. Le dépôt est désormais orienté **validation produit, économie réelle du voyage, monétisation mesurable et qualité des données**.

Chantiers récemment intégrés sur `main` :
- **RME Reality Check** : comparaison du coût réel des scénarios de trajet et aide à la décision avant réservation.
- **Mesure des clics partenaires** : événements de conversion privacy-preserving pour les offres ferry/vol et autres partenaires.
- **Transparence économique** : les coûts de transferts affichés comme estimations sont explicitement identifiés comme tels ; le statut d'affiliation n'est pas présenté comme acquis.
- **Newsletter** : aucun faux succès ; sans configuration Resend, l'API refuse proprement l'inscription.
- **OMEGA-VERITAS** : provenance/données réelles, opportunités Aides-territoires et veille BOAMP automatisée pour les opportunités pertinentes.
- **Sécurité** : le parcours trips ne fait plus confiance à un `userId` fourni arbitrairement par le client ; l'accès est contrôlé côté serveur.
- **Supabase** : intégration préparée avec gestion explicite du mode non configuré ; la persistance réelle reste une étape de déploiement à finaliser si les variables Supabase ne sont pas activées.

## Produit

Le socle actuel comprend notamment :
- planification de trajet ;
- calcul et comparaison des coûts ;
- prières et Qibla via AlAdhan ;
- conversion de devises ;
- comparateurs/points d'entrée transport ;
- services et contenus pour les voyageurs ;
- catalogue partenaire et immobilier de Taza ;
- Marwa Caftan ;
- comparateur de transferts ;
- analytics de conversion ;
- PWA/accessibilité renforcée ;
- API server-side pour les intégrations nécessitant des secrets.

## Monétisation

Les intégrations partenaires sont **CONFIGURABLE** tant que le compte, l'URL partenaire et le flux réel n'ont pas été vérifiés. Une présence de code ou de documentation ne constitue pas une preuve de commission active.

Axes :
- vols ;
- ferries ;
- transferts d'argent ;
- hôtels et services de voyage ;
- eSIM ;
- partenaires locaux ;
- offres B2B/pro ;
- publicité et commissions, lorsque les conditions réelles sont établies.

**Règle : aucun tarif, horaire, partenaire ou revenu fictif ne doit être présenté comme réel.**

## Architecture

- Next.js App Router + TypeScript
- React + Tailwind CSS
- API server-side
- Supabase/SSR préparé pour l'authentification et la persistance
- Capacitor préparé pour les builds mobiles
- Leaflet / cartographie
- Netlify : hébergement de production actuel

## Développement

Installer :

```bash
npm install
```

Développement :

```bash
npm run dev
```

Validation :

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Règles de production

1. GitHub `main` est la source de vérité du code.
2. Ne jamais reconstruire RME Voyage depuis zéro.
3. Vérifier l'état réel du dépôt avant toute intervention.
4. Ne jamais présenter une donnée fictive comme donnée temps réel.
5. Ne jamais exposer de secret côté client.
6. Ne jamais déclarer un programme d'affiliation actif sans accès/configuration vérifiés.
7. Toute nouvelle fonctionnalité doit être testée et économiquement justifiée.

## Documentation de référence

- `RME_ROUTE_ETAT.md` : état technique et audits historiques détaillés.
- `AI_PARTNER.md` : consignes de collaboration avec les agents IA.
- `AUDIT_PREDEPLOIEMENT.md` : contrôles de pré-déploiement.
- `QUICK_START.md` : démarrage développeur.

## Source de vérité

**Code de référence : GitHub → `main`.**

**Production : Netlify → dernier déploiement de production.**

**Preuve : SHA Git associé au déploiement Netlify.**

Une PR, un commit ou un build vert ne prouvent pas à eux seuls la production.

Les anciens audits peuvent contenir des états historiques. Pour connaître l'état courant, partir des derniers commits de `main` et vérifier les fichiers concernés avant de conclure.
