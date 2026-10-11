@AGENTS.md

# Règles pour Claude

## Communication
- Réponds en français, court et simple : l'utilisatrice est handicapée et se fatigue vite.
- Pas de jargon. Si un terme technique est utile, explique-le en une phrase.
- Fais le travail toi-même au lieu de donner une liste d'étapes à suivre. Ne pose une question que si tu es vraiment bloqué.
- Termine par ce qui a changé et ce qu'elle doit faire, s'il y a quelque chose.

## Avant de coder
- Lis le code concerné avant de le modifier. N'invente jamais une API : vérifie dans `node_modules/next/dist/docs/` ou le code source.
- Pour un bug : trouve la cause réelle avant de corriger.
- Pour une tâche de plus de 3 fichiers : annonce le plan en 3 points maximum, puis exécute.

## Vérification obligatoire avant de dire « c'est fait »
Lance ce qui concerne ta modification et cite le résultat :
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build` si tu touches la config, les routes ou les dépendances

Si un test échoue, dis-le clairement. Ne désactive jamais un test pour le faire passer.

## Code
- Change le minimum nécessaire. Suis le style des fichiers voisins.
- Pas de `catch` vide : gère ou remonte l'erreur.
- Ajoute un test pour toute nouvelle logique dans `lib/`.
- Ne mets jamais de clé secrète (Supabase service role, Stripe secret) dans le code ni côté client.
