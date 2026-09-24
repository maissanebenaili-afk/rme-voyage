# RME Voyage — état commercial réel

Ce document décrit, sans rien inventer, ce qui est réellement connecté,
configurable et monétisable dans ce dépôt aujourd'hui. Un agent (humain ou
IA) qui reprend ce projet doit pouvoir lire ce fichier seul et savoir quoi
faire ensuite, sans redémarrer l'analyse.

**Principe non négociable, appliqué partout dans le code :** un lien n'est
jamais affiché comme « partenaire » tant que l'identifiant/l'URL n'a pas été
validé (format, domaine autorisé) contre les hôtes réels du partenaire — voir
`lib/bookingLinks.ts` (`verifiedPartnerUrl`). Sans configuration, l'app bascule
sur un lien comparateur public générique, jamais sur un lien inventé.

## Matrice des leviers

| Levier | Existe (code) | Fonctionnel sans config | Monétisable si configuré | Variable(s) d'env |
|---|---|---|---|---|
| Vols (Travelpayouts) | ✅ `lib/affiliate.ts`, `app/api/affiliates` | Repli comparateur public (skyscanner.fr) | ✅ commission | `TRAVELPAYOUTS_FLIGHT_URL` (URL complète approuvée, pas un simple ID) |
| Ferries (Direct Ferries) | ✅ idem | Repli comparateur public (directferries.fr) | ✅ commission | `DIRECT_FERRIES_AFFILIATE_URL` |
| Transferts d'argent (Wise, WorldRemit, Remitly, Western Union, MoneyGram) | ✅ `app/api/remittance`, `components/RemittanceComparator.tsx` — taux de change live (fawazahmed0 API), frais/spread **estimés** et étiquetés comme tels à l'utilisateur | Lien public pré-rempli vers chaque fournisseur | ✅ commission par fournisseur configuré | `WISE_AFFILIATE_URL`, `WORLDREMIT_AFFILIATE_URL`, `REMITLY_AFFILIATE_URL`, `WESTERN_UNION_AFFILIATE_URL`, `MONEYGRAM_AFFILIATE_URL` |
| Immobilier Taza (Aziz HiDOUR) | ✅ `app/taza-immobilier` | Contact WhatsApp direct, partenaire réel nommé | Lead / commission à négocier hors-code | — (contact direct) |
| Caftans Marwa | ✅ `app/marwa-caftan` | Boutique/contact | Vente directe (hors plateforme de paiement dans ce dépôt) | — |
| Offre B2B / widget embarquable | ❌ pas construit | `/pro` explicite : « en préparation, aucune facturation » (voir #87) | Non — aucun embed, aucune facturation, aucun dashboard n'existe | — |
| Hôtels, eSIM, assurance, location voiture | ❌ pas de code | — | Non explorés dans ce dépôt à ce jour | — |
| Hadak (assistant IA) | ✅ `app/api/hadak` | Repli local si aucune clé LLM | Pas un levier direct de revenu ; coût variable | `ANTHROPIC_API_KEY` / `GROQ_API_KEY` / `OPENAI_API_KEY` (au choix, ordre de repli dans le code) |
| Newsletter | ✅ `app/api/newsletter` | Ne prétend jamais un succès si non configurée (voir historique `RME_ROUTE_ETAT.md`) | Canal de reciblage, pas un revenu direct | `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` |

## Tracking de conversion

`lib/partnerTracking.ts` + `components/RemittanceComparator.tsx` envoient un
événement anonymisé (Vercel Analytics) au clic vers un partenaire :
`partner`, `product`, `placement`, `page`. Aucune conversion (paiement réel
chez le partenaire) n'est mesurée depuis ce dépôt — aucun webhook partenaire
n'est intégré à ce jour. Donc : le clic est mesuré, le revenu ne l'est pas
encore. Ne pas présenter de taux de conversion ou de revenu à un tiers sans
le dire explicitement.

## Ce qui reste à faire pour transformer un clic en revenu mesuré

1. Obtenir les liens d'affiliation approuvés (pas de simples ID) auprès de
   chaque partenaire listé ci-dessus, et les configurer en variables d'env.
2. Si un partenaire fournit un webhook de conversion/postback, le brancher
   sur un nouvel endpoint (aucun n'existe aujourd'hui) pour fermer la boucle
   clic → revenu.
3. Sans (1) et (2), toute affirmation de revenu ou de taux de conversion
   réel serait fabriquée — ne pas le faire.

## Financement / TravelTech

Ce dépôt contient une infrastructure de voyage France↔Maroc(↔Algérie)
fonctionnelle (calcul de coût réel, comparateur de transferts, assistant IA,
partenaires locaux vérifiés) qui peut appuyer un dossier TravelTech
(ex. France Tourisme Tech). Ce fichier + `RME_ROUTE_ETAT.md` +
`ARCHITECTURE.md` en constituent la preuve technique. La préparation et le
dépôt du dossier (SIRET, données financières, pitch, signature) reste une
action humaine hors du périmètre de cet agent — vérifier la date limite et
les critères sur la page officielle au moment du dépôt, pas sur une date
mémorisée.
