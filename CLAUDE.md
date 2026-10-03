@AGENTS.md

## Continuité de travail (règles pour Claude, à relire au début de chaque session)

Pourquoi : les sessions changent de modèle, des réponses peuvent être coupées par un filtre automatique (faux positif), et du travail non enregistré est alors perdu. L'utilisateur est fatigué et handicapé : réponses courtes, en français, sans jargon.

**Ne pas perdre de travail**
- Commit + push après chaque étape terminée, jamais de gros travail non enregistré.
- Si une réponse est coupée : vérifier `git status` et l'état des PR avant de recommencer, ne rien refaire de ce qui existe.
- Ne pas discuter du filtre, ne pas reformuler en boucle : reprendre le travail concret, par petites étapes vérifiables.

**Méthode qui compense un modèle moins puissant**
1. Auditer le dépôt réel d'abord (branche, PR, tests). Le code est la référence, pas une ancienne doc.
2. Une hypothèse = un test = une mesure = KEEP / MODIFY / REJECT. Ne mesurer que ce qui se calcule.
3. Chercher d'abord les erreurs silencieuses (fausse déduction affichée comme vraie) avant l'esthétique, et les phrases qui donnent « aucune action ».
4. Chaque bug important devient un test de non-régression, y compris les faux positifs à éviter.
5. Petit changement, code existant réutilisé, pas de nouvelle dépendance, pas de réécriture.
6. Un résultat non démontré reste une hypothèse. « Aucune découverte » est acceptable, une découverte inventée non.
7. Si une branche exige une décision de Tarek, arrêter cette branche seulement et continuer les autres.

**Économie (états séparés, jamais confondus)**
CODE PRÉSENT ≠ PARTENAIRE APPROUVÉ ≠ LIEN ACTIF ≠ CLIC ≠ CONVERSION ≠ REVENU. Inconnu reste UNKNOWN. Une recommandation est justifiée par le besoin de l'utilisateur, jamais par la commission. Un partenaire non vérifié n'est jamais présenté comme réservable.

**Protégé : ne pas toucher** production, `main`, secrets, paiements, comptes externes, Vercel, PR #193. Ne fusionner aucune PR, ne supprimer aucune donnée, ne rien déployer.

**Acquis du Lab à ne pas refaire** : banc de 210 phrases en 6 langues (`lib/lab/intentBench.ts`), invariant « tout `vous avez dit` est dans la phrase », garde-fous `lib/lab/intentGuards.ts` (retour Maroc→Europe, souvenir, ville ou mode écartés, origine sans « depuis »). Limites connues et testées : « Tanger Paris » nu (ambigu), trajets à étapes multiples, « samedi non dimanche ».
