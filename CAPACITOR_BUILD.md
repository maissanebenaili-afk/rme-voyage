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

**Android — committé dans `android/` (27/09/2026).**

- Généré avec `npx cap add android` (Capacitor 7.6.9).
- `compileSdk` / `targetSdk` passés à **36**, comme l'exige Google Play depuis le 31/08/2026.
- Android Gradle Plugin 8.9.1.
- Permissions : `INTERNET`, plus la localisation au premier plan (`ACCESS_COARSE_LOCATION` / `ACCESS_FINE_LOCATION`), conformément à `play-store-listing/data-safety.md`. La localisation n'est demandée qu'au tap sur « Ma position ».
- Icônes et splash RME générés par `node scripts/generate-app-assets.mjs`.
- **Mesuré :** `./gradlew bundleRelease assembleDebug` produit `app-release.aab` et `app-debug.apk`. `aapt2` lit `targetSdkVersion:'36'`.

**Build sans ordinateur : GitHub Actions `Android bundle`** (`.github/workflows/android.yml`).

- Il se lance à la main (onglet Actions → *Android bundle* → *Run workflow*) ou à chaque changement de `android/`.
- Il produit l'AAB et un APK de test, téléchargeables dans *Artifacts* pendant 14 jours.
- `versionCode` = numéro du run : chaque envoi à Play est plus haut que le précédent.
- **Signature :** l'AAB n'est signé que si ces 4 secrets GitHub existent :

  | Secret | Contenu |
  |---|---|
  | `RME_UPLOAD_KEYSTORE_BASE64` | le fichier `.jks`, en base64 |
  | `RME_UPLOAD_KEYSTORE_PASSWORD` | mot de passe du keystore |
  | `RME_UPLOAD_KEY_ALIAS` | alias de la clé |
  | `RME_UPLOAD_KEY_PASSWORD` | mot de passe de la clé |

  Sans eux, l'AAB n'est pas signé et Play le refusera. La clé d'envoi appartient au propriétaire et n'est jamais committée (`*.jks` est ignoré).

**iOS — pas encore généré.**

- Il faut un Mac ou un runner macOS et un compte Apple Developer (99 $/an).
- Le dossier `ios/` reste ignoré jusque-là.

## Plugins Capacitor

Le projet verrouille actuellement les plugins v7 suivants :

- `@capacitor/app`
- `@capacitor/browser`
- `@capacitor/geolocation`
- `@capacitor/share`
- `@capacitor/splash-screen`

Les versions doivent rester cohérentes avec Capacitor 7 jusqu'à migration volontaire vers Capacitor 8.

## Icônes et visuels store

`node scripts/generate-app-assets.mjs` génère tout depuis le logo du site (« R » ambre sur bleu nuit `#0f1f3d`) :

- mipmaps Android (normale, ronde, adaptative) et splash ;
- PNG web/PWA et `apple-touch-icon` ;
- icône Play 512 px et bannière 1024×500 (`play-store-listing/assets/`).

Captures d'écran : `play-store-listing/assets/screenshots/`. Ce sont de vraies captures de la production (1080×1920, Chromium mobile, 27/09/2026), sans montage.

**À vérifier sur appareil :** rendu de l'icône adaptative selon les lanceurs.

## Exigences stores vérifiées le 26 septembre 2026

### Apple

Apple exige que l'application apporte une expérience qui va au-delà d'un simple site web reconditionné. RME doit donc démontrer ses fonctions de voyage et ses fonctions natives réellement utilisables.

### Google Play

Google interdit les applications dont le but principal est de générer du trafic d'affiliation ou de fournir un simple webview. Les fonctions RME doivent rester centrées sur le service de voyage.

À partir du 31 août 2026, les nouvelles applications et mises à jour Google Play doivent cibler Android 16 / API 36 ou supérieur.

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

**Statut Android :**

- TECHNICALLY READY pour un envoi en test fermé, une fois la clé d'envoi fournie.
- Pas encore testé sur un appareil réel.
- Pas soumis.

**Statut iOS :** non préparé (compte Apple requis).
