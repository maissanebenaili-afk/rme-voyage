# Lot C — mesures de charge (production)

Cible : `https://rme-route.vercel.app`, main `61095de`. Client : une seule machine (session Claude Code), `scripts/load-hadak.mjs` au commit `9bc7dc3`. Les rapports JSON bruts sont dans ce dossier.

| Run (UTC) | Endpoint | Requêtes | Concurrence | RPS | p50 | p95 | p99 | 2xx | 429 | Erreurs | Timeouts | Cache |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-09-26 22:32:11 | health | 100 | 10 | 77.34 | 90 ms | 246 ms | 269 ms | 100 | 0 | 0 | 0 | MISS 100 |
| 2026-09-26 22:32:13 | health | 500 | 25 | 240.46 | 85 ms | 140 ms | 253 ms | 500 | 0 | 0 | 0 | MISS 500 |
| 2026-09-26 22:32:23 | health | 1000 | 50 | 254.58 | 83 ms | 260 ms | 1709 ms | 1000 | 0 | 0 | 0 | MISS 1000 |
| 2026-09-26 22:32:29 | health | 5000 | 100 | 915.78 | 87 ms | 130 ms | 373 ms | 5000 | 0 | 0 | 0 | MISS 5000 |
| 2026-09-26 22:32:39 | hadak | 100 | 10 | 37.69 | 151 ms | 1162 ms | 1198 ms | 95 | 5 | 0 | 0 | MISS 95, none 5 |

## Constats

- `/api/health` : 6 600 requêtes au total, 0 erreur, 0 timeout, toutes `MISS` (chaque requête a atteint la fonction, pas le cache edge). Jusqu'à 916 req/s atteintes avec 100 requêtes simultanées, p95 ≤ 260 ms.
- Premier run à froid (non conservé ici, 100 requêtes) : p95 3 100 ms, attribuable aux démarrages à froid ; le p99 de 1 709 ms à 1 000 requêtes va dans le même sens.
- `/api/hadak` (« quelle heure au Maroc », réponse locale, aucun appel LLM) : 95 réponses sur 100, seulement 5 `429`. Le limiteur de `proxy.ts` (8/min/IP) garde ses compteurs en mémoire par instance ; Vercel a réparti les requêtes sur plusieurs instances, donc la limite réelle par IP est bien supérieure à 8/min.

## Non mesuré

- CPU/mémoire serveur : non observables depuis le client.
- Chemin IA sous charge (Groq/Gemini/OpenRouter) : volontairement non testé pour ne pas consommer les quotas gratuits.
- Charge répartie sur plusieurs IP clientes : un seul client ici.
- Aucune conclusion « 10K prêt » n'est tirée de ces mesures.
