# RME Voyage — Déploiement

## Architecture actuelle

- **Web :** Next.js 16 + React 18
- **Hébergement :** Vercel
- **APIs :** routes server-side Next.js
- **PWA :** manifest + service worker
- **Mobile :** Capacitor 7 préparatoire, projets natifs non encore générés
- **CI :** vérifications TypeScript / lint / tests / build selon le pipeline du dépôt

## Vérification locale

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
```

## Production web

Le déploiement production est effectué via Vercel.

Avant toute mise en production :
- typecheck ;
- lint ;
- tests ;
- build ;
- contrôle des APIs sensibles ;
- contrôle des erreurs runtime ;
- contrôle des secrets et variables d'environnement.

## Mobile / Capacitor

**Attention : le script `npm run cap:build` n'est pas actuellement un pipeline de production mobile validé.**

La raison est architecturale : l'application utilise des routes API Next.js et la configuration Capacitor pointe vers `.next/standalone/public`, alors que Next.js n'est pas configuré avec `output: "standalone"`.

Les projets natifs `ios/` et `android/` ne sont pas encore présents dans le dépôt.

La prochaine étape mobile est donc un **Architecture Gate** avant génération des plateformes natives.

## PWA

Le portail dispose déjà :
- d'un manifest ;
- d'un service worker ;
- d'un fallback hors ligne ;
- d'une stratégie qui ne met pas en cache les APIs.

## Sécurité

Les secrets ne doivent jamais être committés.

Les APIs qui dépendent d'une authentification réelle doivent échouer proprement lorsque leur backend sécurisé n'est pas configuré. Le mode mock ne doit pas devenir un mécanisme d'identité en production.

## Store readiness

Avant publication iOS / Android :
- build natif reproductible ;
- signature ;
- test sur appareil réel ;
- test cold start ;
- test réseau indisponible ;
- test permissions ;
- vérification des données collectées ;
- politique de confidentialité accessible ;
- fiches store cohérentes avec le comportement réel ;
- absence de fonctionnalités annoncées mais non disponibles.

## Important

Les anciennes procédures qui supposent :

```
npm run build
npx cap sync
```

puis un build natif immédiat ne doivent pas être considérées comme suffisantes.

**Statut : web production opérationnel ; mobile natif en préparation architecturale.**
