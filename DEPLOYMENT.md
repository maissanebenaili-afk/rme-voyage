# RME Voyage — Guide de Déploiement

## ✅ Pré-requis vérifiés

### Code
- [x] TypeScript strict activé
- [x] Pas de secrets en client
- [x] "use client" correctement placés
- [x] Structure des routes cohérente
- [x] Imports paths configurés (@/)
- [x] Aucune console.log en production

### Dépendances
- [x] Next.js 15.0 + React 19
- [x] Capacitor 7.0 pour mobile
- [x] Tailwind CSS + PostCSS configurés
- [x] TypeScript 5.7
- [x] Lucide React pour icônes
- [x] Supabase JS (prêt pour integration)

### Configuration
- [x] manifest.webmanifest pour PWA
- [x] capacitor.config.ts pour mobile
- [x] .env.example documenté
- [x] .gitignore complet
- [x] tsconfig.json strict

## 🚀 Build & Start

```bash
# Installation
npm install

# Development
npm run dev      # http://localhost:3000

# Production build
npm run build
npm run start

# Mobile (Capacitor)
npm run cap:build
```

## 🔐 Secrets & Env Vars

**Ne jamais committer :**
- `.env` (fichier local)
- API keys, tokens, identifiants
- Données personnelles

**Configuration requise en production :**
```
TRAVELPAYOUTS_PARTNER_ID=<id_validé>
DIRECT_FERRIES_PARTNER_ID=<id_validé>
DIRECT_FERRIES_BASE_URL=<url_validée>
```

## 📋 Checklist Déploiement

### Avant mise en ligne
- [ ] Tester npm run build localement
- [ ] Vérifier qu'aucun secret n'est commité
- [ ] Tester les routes API (/api/*)
- [ ] Vérifier les imports images et assets
- [ ] Tester sur mobile (Capacitor) si applicable
- [ ] Valider que l'app fonctionne sans affiliation (fallback gracieux)

### En production
- [ ] Variables d'env configurées côté hosting
- [ ] Monitoring activé (erreurs, performance)
- [ ] Cache headers configurés (images, static assets)
- [ ] CORS/CSP headers appropriés
- [ ] SSL/HTTPS forcé
- [ ] Rate limiting sur /api/affiliates

## 🌍 Cibles de déploiement

### Web (Recommandé : Vercel, Netlify, Railway)
```bash
npm run build && npm run start
```

### Mobile (iOS/Android via Capacitor)
```bash
npm run cap:build
npx cap sync ios
npx cap sync android
```

### PWA (Progressive Web App)
- manifest.webmanifest ✓ configuré
- Service Worker à ajouter (future amélioration)

## 🐛 Troubleshooting

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Cannot find module @/*` | tsconfig.json paths incorrects | Vérifier paths + relancer dev |
| `"use client" missing` | Composant use* sans directive | Ajouter "use client" en haut |
| `Build timeout` | Dépendances trop lourdes | npm ci + npm run build --no-lint |
| `API 401/403` | Env vars manquants | Configurer .env.local |
| `Images broken` | next/image + output:export conflict | next.config: images.unoptimized: true ✓ |

## 📚 Ressources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Capacitor iOS/Android](https://capacitorjs.com/docs/getting-started/environment-setup)
- [PWA Manifest](https://web.dev/add-manifest/)
- [Supabase Docs](https://supabase.com/docs)

## 🔄 Post-Déploiement

1. Monitor erreurs (Sentry, LogRocket, etc.)
2. Configurer Analytics (Vercel Analytics ou GA4)
3. Intégrer géocodage réel + routing
4. Ajouter authentification + modération Supabase
5. Mettre en place CI/CD GitHub Actions
6. Tests automatisés (Jest, Cypress)

## 📝 État après déploiement

Mettez à jour `RME_ROUTE_ETAT.md` :
```markdown
## Déployé (2026-09-XX)
- Date: [date]
- URL: [domain]
- Plateforme: [web/mobile/pwa]
- Version: 1.0.0
```