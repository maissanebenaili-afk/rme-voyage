# SAFAR - Architecture Complète

## Vision
Application conversationnelle AI-native pour la diaspora marocaine. L'utilisateur parle → l'agent comprend et guide intelligemment. Pas de navigation confuse, juste dialogue naturel.

**Marché:** 4M+ Marocains en diaspora (EU), 2x/an voyage au Maroc. Vide applicatif majeur.

---

## 1. TECH STACK (Optimisé énergie + performance)

### Frontend
- **Framework:** Astro + React islands (ultra-léger)
- **UI:** Tailwind CSS + shadcn/ui
- **État:** Zustand (minimal overhead)
- **Voice:** Web Speech API (navigateur natif)
- **Bundler:** Vite (dev rapide)

### Backend
- **Compute:** Vercel Edge Functions (serverless, éco-responsable)
- **DB:** Supabase (PostgreSQL + realtime)
- **Cache:** Redis (Upstash)
- **AI:** OpenAI API

### Infrastructure
- **Hosting:** Vercel (edge)
- **Storage:** S3/R2
- **Monitoring:** Sentry + PostHog

---

## 2. ARCHITECTURE AGENTS

### Agent Principal: SAFAR
- Écoute utilisateur (voix/texte)
- Comprend intention + contexte
- Délègue aux agents spécialisés
- Orchestre réponses

### Sous-agents
1. **NAVIGATOR** - itinéraires (Google Maps, OSRM)
2. **LOCALIZER** - infos pratiques (prière, météo, ferry, douane)
3. **COMMUNITY** - tips voyageurs
4. **BUDGET** - calcul voyage
5. **EMERGENCY** - urgences

---

## 3. MONETIZATION (Freemium)

### Free Tier
- Chat limité (10 msg/jour)
- Infos basiques
- Tips communauté
- 1 trip/mois

### Premium ($4.99/mois)
- Chat illimité
- Export PDF/iCal
- Alertes temps réel
- Budget tracker avancé

### Revenue
- Abonnement (70% margin)
- Affiliate ferry/hôtels
- Publicités discrètes

---

## 4. ROADMAP

**Phase 1 (MVP - 3 semaines):**
- Chat SAFAR + voice
- Infos temps réel
- Trip planner
- Community tips

**Phase 2 (4-6 semaines):**
- Agent NAVIGATOR
- Real-time ferry/trafic
- App mobile iOS/Android

**Phase 3 (2-3 mois):**
- Multi-device sync
- Voyage collaboratif
- Partenaires

---

## 5. SUCCESS METRICS

- MAU: 1k (M1) → 10k (M3)
- DAU/MAU: >40%
- Conversion F2P: 5-10%
- ARPU: $2-5/mois
- Uptime: >99.5%

---

## NEXT STEPS
1. Créer structure projet
2. Implémenter Frontend (SAFAR + voice)
3. Implémenter Agents
4. Intégrer APIs
5. Beta testing
6. Launch App Store
