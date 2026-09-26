# RME Voyage — Capacitor & stores

## Architecture mobile retenue

RME utilise une **coquille Capacitor avec le site RME distant** :

- URL chargée par l'application : `https://rme-route.vercel.app`
- backend et routes Next.js : Vercel
- pas d'export Next.js statique
- `webDir` : `public`, utilisé pour les ressources locales lors du sync Capacitor
- navigation vers les partenaires : navigateur Capacitor séparé de la WebView
- partage : API native Capacitor
- retour Android : gestionnaire par défaut du plugin Capacitor App
- géolocalisation : plugin Capacitor Geolocation
- splash screen : plugin Capacitor Splash Screen
- notifications push : **non déclarées** tant qu'elles ne sont pas implémentées et testées

Cette architecture évite de réécrire les APIs existantes et conserve le backend RME sur Vercel.

## Hors connexion

RME possède déjà :

- `public/offline.html`
- `public/sw.js`
- un cache limité aux pages publiques et assets ;
- aucun cache volontaire des APIs, données privées ou URLs partenaires.

Dans la coquille distante, le service worker doit être installé après une première connexion. Le comportement hors connexion doit donc être testé sur appareil réel, notamment après un démarrage à froid sans réseau.

**CONFIRMÉ dans le dépôt :** la page offline et le service worker existent.

**À vérifier sur appareil :** démarrage totalement hors réseau avant toute première visite, puis navigation hors réseau après une première visite.

## Projets natifs

Les répertoires `android/` et `ios/` ne sont pas encore committés.

Ils doivent être générés avec les outils Capacitor correspondant aux versions réellement verrouillées dans le projet, puis testés sur appareils réels. Nous ne fabriquons pas manuellement des projets natifs ou leurs fichiers de signature.

Préparation locale :

```bash
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npx cap add android
npx cap add ios
npx cap sync
```

Puis ouvrir les projets dans Android Studio / Xcode et effectuer les builds signés uniquement avec les comptes et certificats du propriétaire.

## Plugins Capacitor

Le projet verrouille actuellement les plugins v7 suivants :

- `@capacitor/app`
- `@capacitor/browser`
- `@capacitor/geolocation`
- `@capacitor/share`
- `@capacitor/splash-screen`

Les versions doivent rester cohérentes avec Capacitor 7 jusqu'à migration volontaire vers Capacitor 8.

## Icônes

Les SVG RME existants servent au web/PWA. Les stores natifs nécessitent une génération réelle des assets PNG et des variantes adaptatives Android.

**Non considéré comme terminé tant que les PNG ne sont pas générés, intégrés aux projets natifs et vérifiés sur appareil.**

## Exigences stores vérifiées le 26 septembre 2026

### Apple

Apple exige que l'application apporte une expérience qui va au-delà d'un simple site web reconditionné. RME doit donc démontrer ses fonctions de voyage et ses fonctions natives réellement utilisables.

### Google Play

Google interdit les applications dont le but principal est de générer du trafic d'affiliation ou de fournir un simple webview. Les fonctions RME doivent rester centrées sur le service de voyage.

À partir du 31 août 2026, les nouvelles applications et mises à jour Google Play doivent cibler Android 16 / API 36 ou supérieur.

Références officielles :

- Apple App Review Guidelines, section 4.2.
- Google Play Spam / Webviews and Affiliate Spam.
- Android Developers — Target API level requirements.

## Pipeline de preuve avant publication

```
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npx cap sync
build Android
build iOS
test appareil Android
test appareil iPhone/iPad
test cold start
test réseau faible
test hors connexion
test permission localisation
test liens externes
test partage natif
test retour Android
test splash
test rotation / tailles d'écran
vérification métadonnées stores
```

**Statut : code mobile préparé, publication native non déclarée prête tant que les projets natifs, assets PNG, builds signés et tests appareil réel ne sont pas validés.**
