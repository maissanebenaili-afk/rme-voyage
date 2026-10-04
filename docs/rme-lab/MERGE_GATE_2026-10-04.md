# Merge gate — 4 octobre 2026

État de `main` : `8454ce6`, inchangé depuis le début de la journée. Rien n'a été fusionné.

| PR | Verdict | Raison | Dépendance | Risque |
|---|---|---|---|---|
| #201 | **GO MERGE (urgent)** | Bulletin carburant UE du 28/09. Celui du 21/09 expire le 05/10 | aucune | Très faible : données seulement |
| #219 | **GO MERGE** | Retire le podium construit sur des frais inventés ; journalise les liens ferry refusés | aucune | Faible : affichage seulement |
| #221 | **GO MERGE** | Conseil carburant à partir des seuls prix officiels ; prix d'avion valises incluses | aucune | Faible |
| #222 | **GO MERGE** | Bulletin périmé affiché « périmé » au lieu d'une hypothèse à 1,40 €/L | contient #221 | Faible |
| #220 | **GO MERGE** | Compte les clics de contact (`product: 'contact'`, renommé depuis `lead`) | aucune | Faible : données anonymes |
| #223 | **GO MERGE** | Demandes immobilières vers HiDOUR, signature « (vu sur RME Voyage) », provenance des visites, rapport par partenaire, Colis et ServicesPro comptés | contient #220 | Moyen : le texte des messages WhatsApp change (signature ajoutée). Choix produit visible par les partenaires |
| #224 | **GO MERGE** | Convertisseur au taux du jour daté ; recherches de services comptées | aucune | Faible : dépend d'une source publique, avec repli annoncé |
| #225 | **GO MERGE** | Audit hebdomadaire en lecture seule, non bloquant | aucune | Très faible : `contents: read`, GET publics seulement |

**Autres PR ouvertes (25)** : aucune ne modifie un fichier touché par ces 8 PR, donc aucun conflit. Elles ne sont pas examinées ici : **HOLD**, hors du périmètre de cette revue.

## A. Ordre recommandé
#201 → #219 → #221 → #222 → #220 → #223 → #224 → #225.
Toutes les combinaisons fusionnent sans conflit. Cet ordre fait entrer d'abord l'urgence, puis chaque PR avant celle qui la contient.

## B. À ne pas fusionner maintenant
Aucune des 8. Le seul point qui demande un « oui » explicite est la signature dans les messages WhatsApp (#223) : elle est visible par les partenaires.

## C. Risques résiduels
- Les mesures disparaissent toujours après environ 24 h. L'audit le signale en FAIL. **Décision de Tarek.**
- Le convertisseur (#224) dépend d'une source publique (fawazahmed0) sans garantie de disponibilité. Le repli est annoncé à l'utilisateur.
- Le statut Vercel « Account is blocked » reste rouge. Il n'est pas lié au code.

## D. Tests réellement exécutés (les 8 PR réunies, simulation locale)
- Fusion de l'ensemble : **aucun conflit**.
- `tsc` : OK. `eslint` sur les fichiers modifiés : OK.
- **jest : 105 suites, 819 tests OK.**
- `next build --webpack` : OK. Avec Turbopack, le build échoue **ici seulement**, à cause du lien symbolique `node_modules` de mon environnement de travail. Chaque PR a passé « Lint, Test & Build » et CodeQL sur GitHub.
- Audit de vérité sur l'ensemble : tout est OK, sauf `event-persistence` (FAIL attendu, décision humaine).
- Aucune dépendance ajoutée (`package.json` et `package-lock.json` inchangés).

## Contradiction trouvée et corrigée pendant la revue
Les clics vers les commerces étaient enregistrés avec `product: 'lead'`. Or un clic n'est pas un lead : seul le partenaire sait si un message a été envoyé. La valeur est renommée **`contact`** (#220 `6f1fcd9`, reporté dans #223), avec le script et les tests.

## Affirmations vérifiées dans les rapports
- **Bank Al-Maghrib** : jamais utilisée par RME. Citée seulement pour réfuter le badge proposé par Gemini.
- **Netlify Blobs** : recommandation retirée (pas d'incrément atomique, quotas gratuits INCONNUS). Le rapport a été corrigé.
- **IndexedDB, RGPD** : seulement dans la réfutation.
- **OSRM, Open-Meteo, MET Norway** : non concernés par ces 8 PR.
- **Commissions** : Wise et Airalo sont des pages officielles. Direct Ferries 1,6 à 4 % reste À VÉRIFIER.
- **Marché** : les 122 MMDH de transferts des MRE en 2025 viennent de la presse citant l'Office des changes. C'est une **source secondaire**, pas une confirmation directe.

## E. Ce qui demande Tarek
1. Fusionner (personne d'autre ne le fait).
2. Dire oui ou non à la signature WhatsApp (#223).
3. Choisir comment conserver les mesures.

## F. Prochaine action prioritaire
**Fusionner #201 avant le 5 octobre.**
