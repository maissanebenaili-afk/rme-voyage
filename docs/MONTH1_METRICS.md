# RME, mois 1 : ce qu'on mesure et où le lire

Aucune donnée n'est inventée ici. Ce document liste les instruments en place et les questions auxquelles ils répondent. Tant qu'un instrument n'a pas tourné en production, son résultat est **inconnu**.

## Règle de collecte

- Jamais le texte d'une question, une ville saisie, une adresse ni un identifiant.
- Seulement des catégories : l'intention, la façon dont la réponse a été produite, l'action choisie.
- Pas de compte, pas de profil, pas de suivi entre sessions.

## Instruments

| Signal | Où il est produit | Où le lire | Coût |
|---|---|---|---|
| `[hadak-intent] {intent, resolution, basis, next_actions}` | serveur, `app/api/hadak/route.ts`, une ligne par question | Vercel → Logs (filtre `hadak-intent`). Durée de conservation limitée sur Hobby | 0 € |
| `[hadak-ledger] {provider, resolution_type, latency_ms, tokens, cost}` | serveur, `lib/hadakAiRouter.ts` | Vercel → Logs (filtre `hadak-ledger`) | 0 € |
| `hadak_next_action {action}` | clic sur une suggestion « Et maintenant ? » | Vercel Analytics → Events* | 0 € |
| `hadak_trust_why {basis}` | ouverture de « Pourquoi ? » | Vercel Analytics → Events* | 0 € |
| `hadak_voice_listen {lang}`, `hadak_voice_input {lang}` | lecture vocale, micro | Vercel Analytics → Events* | 0 € |
| `route_computed`, `reality_check_used`, `reality_check_cta`, `remittance_result_viewed`, `partner_click` | entonnoir existant | Vercel Analytics → Events* | 0 € |
| Visites, pages, pays, appareils | `<Analytics />` | Vercel Analytics | 0 € |
| Signalements de réponses IA | `/api/hadak/report` | logs serveur | 0 € |
| Charge / latence p50-p95-p99 | `scripts/load-hadak.mjs`, workflow `lot-c-load.yml` | artefacts GitHub Actions, `docs/lot-c/` | 0 € |

\* **[UNKNOWN]** Vercel ne garde les événements personnalisés que sur certains plans. Si l'onglet Events reste vide sur Hobby, les lignes serveur `[hadak-intent]` et `[hadak-ledger]` restent la source fiable.

## Les questions du lendemain matin

| Question | Réponse |
|---|---|
| Combien de personnes utilisent RME ? | Vercel Analytics, visiteurs |
| Qu'est-ce qu'elles cherchent ? | Répartition des `intent` dans `[hadak-intent]` |
| **Taux de résolution des intentions** | Part des lignes `[hadak-intent]` dont `resolution` vaut `LOCAL` ou `AI` (et non `OFFLINE`), intention par intention. `generic` montre ce que RME ne sait pas encore reconnaître |
| Quelles réponses sont fiables ? | `basis` : `LIVE_DATA` / `CLOCK` mesurés, `RME_GUIDE` et `AI` à vérifier |
| Les suggestions servent-elles ? | `hadak_next_action` / nombre de réponses avec `next_actions > 0` |
| Où abandonnent-elles ? | Entonnoir `route_computed` → `reality_check_used` → `reality_check_cta` → `partner_click` |
| Quels fournisseurs IA, quel coût ? | `[hadak-ledger]` : `provider`, `cost_basis`, `estimated_cost` |
| Quelles erreurs ? | Vercel → Logs, niveau error ; lignes `resolution: OFFLINE` |
| Quelles fonctions sont ignorées ? | Événements absents ou rares, sur la même période |
| La voix est-elle utilisée ? | `hadak_voice_listen`, `hadak_voice_input` |

## À ajouter seulement quand ce sera nécessaire

- Conservation longue des logs (drain vers un stockage gratuit) si la conservation Hobby devient trop courte.
- Un tableau de bord : pas avant d'avoir des données réelles à y mettre.
