#!/bin/bash
# ============================================
# RME Voyage - Déploiement Complet Automatisé
# ============================================
# Ce script pousse le code sur GitHub et déploie sur Vercel
# 
# PRÉREQUIS:
# 1. Git installé
# 2. Vercel CLI installé: npm i -g vercel
# 3. GitHub CLI installé (ou git configuré avec vos credentials)
# 4. Compte Vercel connecté: vercel login
#
# UTILISATION:
#   chmod +x deploy-all.sh
#   ./deploy-all.sh
# ============================================

set -e

REPO_URL="https://github.com/maissanebenaili-afk/rme-voyage"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 RME Voyage - Déploiement Complet"
echo "=================================="
echo ""

# 1. Vérifier Git
echo "1. Vérification Git..."
cd "$PROJECT_DIR"
git status --short
echo "   Commits ahead: $(git rev-list --count origin/main..HEAD 2>/dev/null || echo 'unknown')"
echo ""

# 2. Push GitHub
echo "2. Push vers GitHub..."
echo "   Repo: $REPO_URL"
git push origin main || {
    echo "   ⚠️  Push échoué. Essayez:"
    echo "   - gh auth login (GitHub CLI)"
    echo "   - Ou configurez: git config --global user.email votre@email.com"
    echo "   - Puis: git remote set-url origin https://USERNAME:TOKEN@github.com/maissanebenaili-afk/rme-voyage.git"
    echo ""
    echo "   Pour un Personal Access Token (PAT):"
    echo "   1. Allez sur https://github.com/settings/tokens"
    echo "   2. Créez un token avec scope 'repo'"
    echo "   3. Utilisez: git remote set-url origin https://maissanebenaili-afk:VOTRE_TOKEN@github.com/maissanebenaili-afk/rme-voyage.git"
    echo "   4. Relancez: git push origin main"
}
echo ""

# 3. Deploy Vercel
echo "3. Déploiement Vercel..."
if command -v vercel &> /dev/null; then
    echo "   Vercel CLI détecté. Déploiement..."
    vercel --prod --yes 2>&1 || {
        echo "   ⚠️  Déploiement Vercel échoué. Essayez:"
        echo "   - vercel login"
        echo "   - vercel link (pour lier le projet)"
        echo "   - vercel --prod"
    }
else
    echo "   ⚠️  Vercel CLI non installé. Installez avec:"
    echo "   npm i -g vercel"
    echo "   Puis: vercel --prod"
fi
echo ""

# 4. Build Android (optionnel)
echo "4. Build Android (optionnel)..."
if command -v gradlew &> /dev/null || [ -f "$PROJECT_DIR/android/gradlew" ]; then
    echo "   Android SDK détecté. Build AAB..."
    cd "$PROJECT_DIR"
    npm run build
    npx cap sync android
    cd android && ./gradlew bundleRelease
    echo "   AAB: android/app/build/outputs/bundle/release/app-release.aab"
else
    echo "   ⚠️  Android SDK non détecté."
    echo "   Installez Android Studio: https://developer.android.com/studio"
    echo "   Puis: ./build-android.sh"
fi
echo ""

echo "=================================="
echo "✅ Déploiement terminé!"
echo ""
echo "Sites publiés:"
echo "  App: https://rme-voyage-app.pplx.app"
echo "  Marketing: https://rme-voyage.pplx.app"
echo ""
echo "Vercel (si déployé):"
echo "  https://rme-route-XXXXX.vercel.app"
echo ""
echo "Play Store:"
echo "  1. Upload AAB sur https://play.google.com/console"
echo "  2. Listing dans play-store-listing/listing.md"
echo "=================================="
