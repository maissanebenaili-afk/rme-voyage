# RME Voyage

Plateforme de préparation et d'accompagnement des voyages des MRE et voyageurs des corridors **France ↔ Maroc**, avec extension **Algérie**.

## État actuel — septembre 2026

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

Les intégrations partenaires ne sont considérées comme **actives** que lorsqu'une URL, un compte partenaire ou une configuration réelle a été fournie et vérifiée.

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
- Vercel : cible de déploiement actuellement configurée

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

**Code : GitHub → `main`.**

Les anciens audits peuvent contenir des états historiques. Pour connaître l'état courant, partir des derniers commits de `main` et vérifier les fichiers concernés avant de conclure.
