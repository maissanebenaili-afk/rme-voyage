# RME Voyage — Préparation mobile & stores

## État réel

RME Voyage est actuellement une application **Next.js + APIs server-side déployée sur Vercel**, avec une configuration Capacitor 7 préparatoire.

Le dépôt ne contient pas encore les projets natifs `ios/` et `android/`. Ils ne doivent pas être générés ou publiés comme une simple étape mécanique tant que l'architecture mobile n'est pas validée.

### Point important

Le projet utilise des routes API Next.js (`/api/*`). Une exportation Next.js purement statique casserait cette architecture.

La configuration actuelle de Capacitor pointe vers :

```
.next/standalone/public
```

mais `next.config.mjs` ne configure pas `output: "standalone"`. La commande `npm run cap:build` n'est donc **pas actuellement un pipeline mobile reproductible**.

**Ne pas lancer `npx cap add ios` ou `npx cap add android` sur cette base en pensant obtenir un binaire de production.**

## Architecture mobile cible à valider

Avant de générer les projets natifs, nous devons choisir explicitement entre :

1. **Web local embarqué + backend Vercel**
   - le shell et les ressources nécessaires sont embarqués ;
   - les fonctionnalités nécessitant le serveur utilisent les APIs RME ;
   - nécessite une stratégie claire pour les assets Next.js et les mises à jour.

2. **Client Capacitor avec backend distant RME**
   - le backend reste sur Vercel ;
   - les fonctions natives réellement utiles sont exposées via Capacitor ;
   - nécessite une validation spécifique de l'expérience offline, du démarrage et des politiques des stores.

Le choix doit préserver les APIs existantes et éviter une réécriture de l'application.

## Capacitor

Version actuellement déclarée dans le projet : Capacitor 7.

Plugins déclarés :
- Core
- Geolocation
- Splash Screen

La configuration mentionne également les notifications, mais aucun pipeline natif complet de notifications n'est actuellement présent dans le dépôt. Ne pas présenter cette capacité comme disponible dans une fiche store avant validation sur appareil.

## PWA

La PWA est déjà présente :
- manifest web ;
- service worker ;
- écran offline ;
- installation navigateur.

Le service worker évite explicitement de mettre en cache les APIs et les requêtes privées.

## Pré-requis store

### Apple

Apple demande une application fonctionnelle et testée sur appareil. Les applications doivent apporter une expérience qui les distingue d'un simple site web reconditionné.

RME devra donc démontrer ses fonctionnalités réellement adaptées au mobile : voyage personnel, outils de route, localisation lorsque l'utilisateur l'autorise, fonctionnement dégradé hors connexion et autres fonctions natives effectivement implémentées.

### Google Play

Google Play exige une application stable et fonctionnelle. Les applications principalement destinées à afficher un site web ou à générer du trafic d'affiliation peuvent être refusées.

RME doit donc rester une **application de service de voyage**, et non une enveloppe de liens partenaires.

À partir du 31 août 2026, les nouvelles applications et mises à jour Google Play doivent cibler Android 16 / API 36 ou supérieur.

## Données et confidentialité

Avant publication :
- vérifier exactement les données réellement collectées ;
- vérifier les SDK tiers ;
- vérifier la géolocalisation ;
- vérifier Analytics ;
- vérifier les données envoyées aux APIs ;
- préparer les déclarations Apple et Google à partir du comportement réel de l'application ;
- vérifier le mécanisme de suppression de compte si un compte utilisateur est proposé.

Ne jamais remplir les formulaires store à partir d'une ancienne documentation : ils doivent refléter la version effectivement publiée.

## Pipeline de validation avant publication

Le pipeline cible est :

```
typecheck
lint
tests
build web
audit sécurité
test des APIs
test PWA
build natif
test appareil réel
test réseau faible / hors ligne
test permissions
test cold start
test store metadata
```

Aucune publication ne doit être considérée prête avant ces contrôles.

## Commandes actuelles

Pour le web :

```
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

Pour le mobile, aucune commande de production n'est déclarée valide tant que l'architecture Capacitor n'a pas été finalisée.

## À ne pas faire

- Ne pas activer `output: "export"` uniquement pour satisfaire Capacitor.
- Ne pas prétendre que `.next/standalone/public` est généré tant que `output: "standalone"` n'est pas configuré.
- Ne pas générer `ios/` et `android/` sans stratégie de build et de signature.
- Ne pas déclarer des fonctionnalités natives non testées.
- Ne pas transformer RME en simple WebView d'affiliation.

**Statut : préparation mobile en audit — publication native non déclarée prête.**
