# 🚀 RME Voyage — Quick Start Guide

## Pour les personnes en situation de handicap moteur

Ce guide est optimisé pour une utilisation **sans souris**, avec **commandes vocales** ou **clavier seul**.

---

## ⌨️ Installation (Clavier)

### 1. Clone le repo
```bash
git clone https://github.com/maissanebenaili-afk/rme-voyage.git
cd rme-voyage
```

### 2. Installe les dépendances
```bash
npm install
```

### 3. Configure les variables d'environnement
```bash
cp .env.example .env.local
# Édite .env.local avec tes clés API
```

### 4. Lance le serveur
```bash
npm run dev
```
Accède à `http://localhost:3000`

---

## 🧪 Tester le Code

### Tests unitaires
```bash
npm run test              # Exécute tous les tests
npm run test:watch       # Mode watch (re-exécute à chaque changement)
npm run test:coverage    # Affiche le coverage
```

### Linting & Format
```bash
npm run lint             # Vérifie TypeScript
npm run format           # Formate le code (Prettier)
npm run format:check     # Vérifie le format sans modifier
```

### Build pour production
```bash
npm run build            # Compile Next.js
npm run start            # Lance le serveur production
```

---

## 🚀 Déploiement Automatique (GitHub Actions)

Tout commit sur `main` déclenche automatiquement :
1. ✅ Linting TypeScript
2. ✅ Unit tests
3. ✅ Build Next.js
4. ✅ Déploiement Vercel (si success)

**Statut des workflows:** https://github.com/maissanebenaili-afk/rme-voyage/actions

---

## 🔐 Variables d'Environnement (Sécurisées)

### Fichier `.env.local` (ne pas committer)
```env
# Affiliation - À configurer avec tes IDs réels
TRAVELPAYOUTS_PARTNER_ID=your_id_here
DIRECT_FERRIES_PARTNER_ID=your_id_here
DIRECT_FERRIES_BASE_URL=your_url_here

# Public (safe)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

**⚠️ JAMAIS committer .env.local** ← .gitignore protège automatiquement

---

## 📂 Structure des fichiers

```
.
├── app/                    # Pages & layouts Next.js
├── components/             # Composants React
├── lib/                    # Logique partagée (costCalculator, affiliate, config)
├── __tests__/              # Tests unitaires Jest
├── .github/workflows/      # GitHub Actions CI/CD
├── .env.example            # Template (exemple)
├── vercel.json             # Config Vercel deployment
└── package.json            # Scripts & dépendances
```

---

## 🎯 Commandes Principales

| Commande | Utilité |
|----------|----------|
| `npm run dev` | Démarre le serveur (port 3000) |
| `npm run build` | Compile pour production |
| `npm run start` | Lance le serveur compilé |
| `npm run test` | Exécute les tests |
| `npm run lint` | Vérifie TypeScript |
| `npm run format` | Formate le code |
| `npm run cap:build` | Build mobile Capacitor |

---

## 🐛 Troubleshooting

### ❌ \"Cannot find module @/*\"
→ Relancer: `npm run dev`

### ❌ \"Port 3000 already in use\"
→ `npm run dev -- -p 3001` (utilise port 3001)

### ❌ Tests échouent
→ `npm run test -- --verbose` (détails des erreurs)

### ❌ Build échoue
→ `npm run build -- --no-lint` (bypass linting temporairement)

---

## 📞 Support pour Accessibilité

Si tu as besoin d'aide :
- **Commandes vocales:** Utilise Dragon NaturallySpeaking ou Windows Speech Recognition
- **Clavier seul:** Tous les boutons sont accessibles avec Tab + Enter
- **Lecteur d'écran:** NVDA / JAWS compatibles (React supporte WAI-ARIA)

**Ouvre une issue GitHub** si tu trouves des problèmes d'accessibilité.

---

## ✅ Checklist Pré-Déploiement

- [ ] Tests passent: `npm run test`
- [ ] Build réussit: `npm run build`
- [ ] Aucun secret dans git: `git status`
- [ ] Variables env configurées: `.env.local`
- [ ] GitHub Actions green: vérifier Actions tab
- [ ] Déploiement réussi: vérifier Vercel dashboard

---

## 🎓 Ressources

- [Next.js Docs](https://nextjs.org/docs)
- [Jest Testing](https://jestjs.io/)
- [Vercel Deployment](https://vercel.com/docs)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Accessibility (a11y)](https://www.w3.org/WAI/)

---

**Dernière mise à jour:** 2026-09-09
"