# RME Product Forge

Rejoue de vraies intentions d'utilisateurs contre un RME en marche (production, aperçu de déploiement ou `next start`) et vérifie des **invariants** : ce qui ne doit jamais être affiché.

```
npm run forge -- --base https://deploy-preview-235--rme-voyage.netlify.app --label apres --compare scripts/forge/runs/baseline-production.json
```

- `corpus.json` : les scénarios. Chacun indique pourquoi il existe (le bug réel qu'il a attrapé, avec sa date).
- `core.mjs` : la logique (invariants, exécution, rapport). Testée par `__tests__/forge.test.ts`, qui lui fait avaler les mensonges que RME a réellement affichés.
- `forge.mjs` : la ligne de commande. Elle écrit `runs/<label>.json` et `runs/<label>.md`.

## Familles
| Famille | Question |
|---|---|
| truth | La réponse affirme-t-elle plus que sa source ? (IA sur un lieu ou une règle, chiffre périmé ou inventé) |
| action | L'intention reçoit-elle une réponse utile ? (« garage près de Taza » ≠ météo) |
| function | La fonction marche-t-elle ? |
| ux | Message compréhensible, en français, visible à l'écran ? |
| commercial | Pas de catalogue, prix, badge « Partenaire » ou podium sans preuve |

## Navigateur
Les scénarios `browser` (téléphone 390 × 844) demandent `playwright-core` et Chromium. **Ils ne sont pas une dépendance de RME.** Indiquez le dossier où `playwright-core` est installé :

```
FORGE_PLAYWRIGHT=/chemin/vers/dossier npm run forge -- --base …
```

Sans navigateur, ces scénarios sont **SKIPPED**, jamais comptés comme réussis.

## Limites connues
- Hadak est limité à 8 requêtes par minute et par IP : le Forge espace ses questions de 8 s. Si la limite (429) persiste, le scénario est SKIPPED.
- Les invariants détectent des mensonges **connus** (motifs). Un nouveau mensonge formulé autrement passe, tant qu'on n'ajoute pas son motif.
- Les réponses de l'IA varient d'une exécution à l'autre : un PASS sur une question laissée à l'IA ne prouve pas qu'elle répondra toujours juste.
- Le Forge lit, il ne modifie rien. Il n'envoie aucun formulaire et ne clique sur aucun lien partenaire.
