# RME Voyage — Dossier Jury Défi Étatique

## Pitch (30 secondes)

**RME Voyage** est le compagnon de voyage intelligent pour les Marocains de l'étranger, pensé pour les 5M+ de membres de la diaspora marocaine en Europe. L'application réunit 15+ widgets intelligents — itinéraire, prières, Qibla, météo, douane, urgences, Zakat — et **Hadak**, le premier assistant IA voyage qui parle Darija (dialecte marocain). Accessible aux malvoyants, installable comme app mobile (PWA), disponible en 5 langues.

## Accès immédiat

| Ressource | URL |
|-----------|-----|
| **Application live** | https://rme-voyage-app.pplx.app |
| **Site marketing** | https://rme-voyage.pplx.app |

L'app est installable directement depuis le navigateur (Android: "Installer l'app", iPhone: "Ajouter à l'écran d'accueil"). Aucun Play Store requis.

## Métriques clés

| Métrique | Valeur |
|----------|--------|
| Composants React | 16+ |
| Lignes de code | 8000+ |
| Langues supportées | 5 (FR, EN, AR, ES, Darija) |
| Widgets intelligents | 15+ |
| Sujets IA Hadak | 17 |
| Accessibilité | Malvoyant (Vue+, synthèse vocale, reconnaissance vocale) |
| Mode offline | PWA + Service Worker |
| Build | Production (Next.js 15, TypeScript strict) |

## Innovations différenciantes

1. **Hadak AI** — Premier assistant IA voyage en Darija (dialecte marocain). 17 sujets couverts, 5 langues, suggestions contextuelles.
2. **Accessibilité malvoyant** — Bouton Vue+ (taille texte, contraste renforcé, lecture vocale de la page), reconnaissance vocale pour Hadak.
3. **PWA installable** — Contournement du Play Store: l'app s'installe comme une application native depuis le navigateur, sur Android et iPhone.
4. **15+ widgets intelligents** — Météo Maroc temps réel, phrasebook Darija avec audio, calculateur de douane, SOS ambassades, calendrier islamique, calculateur Zakat, comparateur de carburant, liste de bagage IA.
5. **i18n complet** — 5 langues dont Darija marocaine, avec support RTL automatique pour l'arabe.
6. **Smart Packing IA** — Liste de bagage générée selon saison, durée, type de voyage (famille, solo, business, religieux).

## Stack technique

- Next.js 15 (App Router)
- React 18 + TypeScript 5.7 (strict mode)
- Tailwind CSS 3.4
- Capacitor 7 (Android-ready)
- PWA (Service Worker, manifest, offline)
- APIs: Open-Meteo (météo), AlAdhan (prières), Web Speech API (voix)

## Entreprise

**Nova Presta SAS** — Le Mans, Pays de la Loire, France
Développeur: Tarek Benaïli

## État du projet

- **En ligne**: App + marketing site (pplx.app, publics)
- **Code**: 8 commits, prête pour GitHub
- **Build production**: Réussi (11 pages, 154 kB First Load JS)
- **Play Store**: Script de build AAB prêt, listing rédigé
- **Vercel**: Config prête (token à renouveler)

## Vision

RME Voyage n'est pas qu'une app de voyage. C'est un pont culturel entre l'Europe et le Maroc, qui parle la langue du cœur de millions de Marocains de l'étranger. Hadak, l'IA en Darija, en fait un compagnon unique — pas un outil froid, mais un ami qui comprend votre culture.
