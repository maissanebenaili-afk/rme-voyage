# RME Voyage — PWA & App Store Deployment Guide

## ✅ Phase 1: PWA Setup (Complète)

L'app est déjà configurée comme PWA (Progressive Web App) et peut être installée sur tout navigateur moderne.

### Fichiers en place :
- ✅ `public/manifest.webmanifest` — App metadata, icons, shortcuts
- ✅ `public/sw.js` — Service Worker avec offline support & caching
- ✅ `app/layout.tsx` — Configuration PWA (viewport, theme-color, manifest link)
- ✅ `capacitor.config.ts` — Configuration Capacitor pour native build
- ✅ `build-android.sh` — Script de build Android automatisé

### Tester la PWA localement

```bash
npm run build
npm run dev

# Sur navigateur mobile (ou Chrome DevTools mobile mode)
# Cherchez le bouton "Installer" qui apparaît dans la barre d'adresse
```

---

## 🚀 Phase 2 : Soumettre aux App Stores (3 options)

### Option 1 : PWABuilder (✅ Recommandé — Gratuit & Facile)

**PWABuilder** convertit votre PWA en packages natifs iOS/Android sans besoin d'Xcode/Android Studio.

#### Étapes :

1. **Aller à PWABuilder :**
   ```
   https://www.pwabuilder.com
   ```

2. **Entrer l'URL :**
   - Utilisez `https://rme-voyage.com` (en prod)
   - Ou `http://localhost:3000` (en dev)

3. **PWABuilder génère automatiquement :**
   - ✅ iOS app (`.ipa` bundle)
   - ✅ Android app (`.aab` ou `.apk`)
   - ✅ Windows/Mac app (bonus)

4. **Télécharger les packages :**
   - `app.aab` → Google Play Store
   - `app.ipa` → Apple App Store

5. **Soumettre aux stores :**
   - **Google Play** : https://play.google.com/console (€25 one-time)
   - **Apple App Store** : https://appstoreconnect.apple.com (€99/year)

**Avantages :**
- ✅ Pas d'outils de compilation nécessaires
- ✅ Génération automatique
- ✅ Les mises à jour automatiques via la PWA
- ✅ Économie : pas besoin de Xcode/Android Studio

---

### Option 2 : Capacitor (Native Control)

**Capacitor** vous donne plus de contrôle en générant les projets Xcode/Android Studio localement.

#### Prérequis :
- Mac avec Xcode (pour iOS)
- Android Studio (pour Android)
- Node.js + npm

#### Étapes :

```bash
# 1. Build web app
npm run build

# 2. Ajouter les plateformes
npx cap add ios
npx cap add android

# 3. Sync les assets web
npx cap sync

# 4. Ouvrir les projets natifs
npx cap open ios    # Ouvre Xcode
npx cap open android # Ouvre Android Studio

# 5. Build et soumission
# → Dans Xcode : Product → Archive → Organizer
# → Dans Android Studio : Build → Generate Signed Bundle/APK
```

**Fichier de script existant :**
```bash
./build-android.sh
```

**Coût :** Gratuit, mais nécessite Xcode/Android Studio localement

---

### Option 3 : Tauri (Desktop Focus)

Pour une app desktop (Windows/Mac), utiliser Tauri :

```bash
npm install tauri
npx tauri dev
```

Moins pertinent pour mobile, plus pour desktop distribution.

---

## 📋 App Store Submission

### Google Play Store

1. **Créer un compte développeur** : https://play.google.com/console
   - Frais : €25 one-time
   - Compte Google requis

2. **Créer une nouvelle app**
   - App name: `RME Voyage`
   - Package name: `com.mreroute.app` (from capacitor.config.ts)

3. **Uploads :**
   - Uploader `app.aab` (Android App Bundle)
   - Remplir le store listing (screenshots, description, etc.)

4. **Review :**
   - Google : instant to 24h review
   - Visible immédiatement après approbation

### Apple App Store

1. **Créer un Apple Developer Account** : https://developer.apple.com
   - Frais : €99/year
   - Apple ID requis

2. **Créer une app dans App Store Connect** : https://appstoreconnect.apple.com
   - App name: `RME Voyage`
   - Bundle ID: `com.mreroute.app`

3. **Uploads :**
   - Uploader `app.ipa` (iOS app binary)
   - Remplir le store listing (screenshots, description, etc.)
   - Screenshots recommandés : 6.5" iPhone (2796×1290) + iPad (2732×2048)

4. **Review :**
   - Apple : 24-48h review
   - Strictement plus contrôlé (contenu, privacy, etc.)

---

## 🔄 Mise à Jour des Apps

### Après PWABuilder :
- **L'app auto-update** via le service worker et la PWA
- Aucune soumission App Store nécessaire pour les updates
- Les utilisateurs reçoivent les nouvelles versions automatiquement

### Après Capacitor/Xcode/Android Studio :
- Rebuild localement `npm run build && npx cap sync`
- Créer une nouvelle version dans Xcode/Android Studio
- Soumettre à nouveau aux stores

---

## 🎯 Recommandation

**Pour MVP rapide :** Utiliser **PWABuilder** (10 min setup, gratuit)
**Pour contrôle maximal :** Utiliser **Capacitor** localement (plus de config)

Les deux approches aboutissent à une app native sur les stores.

---

## 📱 Raccourcis App (Configurés)

La PWA inclut des raccourcis rapides au lancement :

1. **Tableau de bord affilié** → `/dashboard/affiliate`
2. **Mes trajets** → `/dashboard/trips`
3. **Caftans** → `/marwa-caftan`
4. **Propriétés** → `/idour`

---

## ✨ Prochaines Étapes

1. ✅ **Maintenant** : PWA prête, tout compile
2. 🔄 **Attendre les clés Stripe** : (utilisateur fournis)
3. 📱 **Option A** : Utiliser PWABuilder pour les stores (facile, rapide)
4. 📱 **Option B** : Installer Capacitor localement (plus de contrôle)
5. 🚀 **Soumission** : Google Play (€25) + Apple App Store (€99/year)

---

## Fichiers à Ignorer en Git

Capacitor génère ces dossiers (à ajouter à `.gitignore` si nécessaire) :

```
/ios
/android
/.capacitor
```

---

## Support

Pour questions PWABuilder : https://docs.pwabuilder.com
Pour questions Capacitor : https://capacitorjs.com/docs
