# Rapport économique Aides-territoires — Pays de la Loire

Généré par `node scripts/report-aides.cjs` à partir des fixtures réelles `fixtures/real/aides-territoires/`
(API authentifiée, capturée avec la clé de l'utilisateur ; ni clé ni jeton dans les fixtures).
Déterministe : même fixtures, même rapport (vérifié par `tests/aidesEvaluator.test.ts`).

- Date d'évaluation (dernière capture) : 2026-09-24 01:10 UTC
- Aides capturées : 11 · retenues : 4 · écartées : 7
- Profil : Nova Presta, région 52 (Pays de la Loire) ; secteur, taille et certifications **non renseignés** (adéquation `UNKNOWN`)
- Le vocabulaire des publics d'Aides-territoires ne contient aucune catégorie « entreprise privée » : l'éligibilité d'une entreprise est lue dans le texte (`HEURISTIC`).
- Une subvention n'est pas un revenu gratuit : sous 100 %, le bénéficiaire cofinance.

## Aides retenues

### 104612 — Inciter les TPE et PME ligériennes à recourir à des conseils extérieurs en participant financièrement au coût facturé par le consultant sélectionné par l’entreprise

- Financeur(s) : Conseil régional des Pays de la Loire · périmètre Pays de la Loire · type Subvention
- Rôle pour Nova Presta : levier sur la demande (vendre aux bénéficiaires) · `HEURISTIC` · L'aide finance le recours à une expertise extérieure ou à un organisme de formation : Nova Presta peut vendre sa prestation aux bénéficiaires
- Échéance : J-98 · `OBSERVED` · Date limite de dépôt (fin de journée UTC) moins la date d'évaluation
- Cofinancement : au moins 50 % des dépenses restent à la charge du bénéficiaire · `INFERRED` · Taux maximal de subvention 50 % (subvention_rate_upper_bound)
- Coût d'acquisition : 0 € · `INFERRED` · Dépôt de dossier sans frais (aide non payante, is_charged = false)
- Récurrence : Ponctuelle · `OBSERVED` · Champ recurrence
- Éligibilité d'une entreprise : entreprises mentionnées dans le texte · `HEURISTIC` · Le vocabulaire structuré des publics ne contient pas de catégorie entreprise privée ; éligibilité lue dans le texte
- Adéquation au profil : — · `UNKNOWN` · Profil Nova Presta non renseigné (secteur, taille, certifications)
- Confiance : MEDIUM
- Prochaine action : Identifier les bénéficiaires éligibles de l'aide et leur proposer une prestation qu'elle finance ; vérifier les conditions sur https://aides-territoires.beta.gouv.fr/aides/c229-pays-de-la-loire-conseil/
- Preuve : sha256 `e615778fff39a26f143ca863312a6d7d9e9454954f80c432fb3a1edd1590d619` · h_source `1a1389cf7e4ea3ce…` · opp_550a9dd789d897a6073e409538928a39 · ver_3a6af89322ee6bfd34c01125064fd6bc · capturé 2026-09-24T01:10:04.032Z

### 150665 — Financer des formations à destination des professionnels ou collaborateurs occasionnels des médiathèques

- Financeur(s) : Ministère de la Culture · périmètre France · type Subvention
- Rôle pour Nova Presta : levier sur la demande (vendre aux bénéficiaires) · `HEURISTIC` · L'aide finance le recours à une expertise extérieure ou à un organisme de formation : Nova Presta peut vendre sa prestation aux bénéficiaires
- Échéance : — · `OBSERVED` · Pas de date limite (Permanente)
- Cofinancement : — · `UNKNOWN` · Taux de subvention non renseigné
- Coût d'acquisition : 0 € · `INFERRED` · Dépôt de dossier sans frais (aide non payante, is_charged = false)
- Récurrence : Permanente · `OBSERVED` · Champ recurrence
- Éligibilité d'une entreprise : entreprises mentionnées dans le texte · `HEURISTIC` · Le vocabulaire structuré des publics ne contient pas de catégorie entreprise privée ; éligibilité lue dans le texte
- Adéquation au profil : — · `UNKNOWN` · Profil Nova Presta non renseigné (secteur, taille, certifications)
- Confiance : LOW
- Prochaine action : Identifier les bénéficiaires éligibles de l'aide et leur proposer une prestation qu'elle finance ; vérifier les conditions sur https://aides-territoires.beta.gouv.fr/aides/553c-aide-a-la-formation-continue/
- Preuve : sha256 `a6c00fab4c6fc7ab9c2b74724bcea451903d76c1bf8b0acf8466cb9a84eec7ac` · h_source `bb4d333776e68ec0…` · opp_2fb989bad83a127005da5a4222cbf182 · ver_81c29d7b8702b898eb61c9aae44bc37e · capturé 2026-09-24T01:10:13.496Z

### 163848 — Créer de nouvelles offres de formation ou d’accompagnement

- Financeur(s) : Conseil régional des Pays de la Loire · périmètre Pays de la Loire · type Subvention
- Rôle pour Nova Presta : bénéficiaire directe · `HEURISTIC` · Nova Presta serait bénéficiaire directe si elle est éligible
- Échéance : J-98 · `OBSERVED` · Date limite de dépôt (fin de journée UTC) moins la date d'évaluation
- Cofinancement : — · `UNKNOWN` · Taux de subvention non renseigné
- Coût d'acquisition : 0 € · `INFERRED` · Dépôt de dossier sans frais (aide non payante, is_charged = false)
- Récurrence : Ponctuelle · `OBSERVED` · Champ recurrence
- Éligibilité d'une entreprise : entreprises mentionnées dans le texte · `HEURISTIC` · Le vocabulaire structuré des publics ne contient pas de catégorie entreprise privée ; éligibilité lue dans le texte
- Adéquation au profil : — · `UNKNOWN` · Profil Nova Presta non renseigné (secteur, taille, certifications)
- ⚠ Le texte indique une clôture en 2025 alors que la date limite structurée est 2026-12-31 : vérifier que l'appel est encore ouvert
- Confiance : LOW
- Prochaine action : Vérifier l'éligibilité de Nova Presta et le calendrier sur https://aides-territoires.beta.gouv.fr/aides/appel-a-projet-programme-dinvestissements-davenir-4-pia-4-appel-a-projets-france-2030-regionalise-innovation-formations-professionnelles/ (contradiction de dates signalée)
- Preuve : sha256 `3ba048954cfa9d7bb6939720b9ab53e9b7263a5032f6aacf03acf76ecf4acf27` · h_source `353b43d217836704…` · opp_f2926cbd094df5c8c94d68dae51399ca · ver_12f30ba63b32de28f46d5890f2d71f11 · capturé 2026-09-24T01:10:02.475Z

### 71866 — Investir dans des projets de formation professionnelle

- Financeur(s) : Banque des Territoires · périmètre France · type Autre aide financière
- Rôle pour Nova Presta : bénéficiaire directe · `HEURISTIC` · Nova Presta serait bénéficiaire directe si elle est éligible
- Échéance : — · `OBSERVED` · Pas de date limite (Permanente)
- Cofinancement : — · `UNKNOWN` · Taux de subvention non renseigné
- Coût d'acquisition : 0 € · `INFERRED` · Dépôt de dossier sans frais (aide non payante, is_charged = false)
- Récurrence : Permanente · `OBSERVED` · Champ recurrence
- Éligibilité d'une entreprise : entreprises mentionnées dans le texte · `HEURISTIC` · Le vocabulaire structuré des publics ne contient pas de catégorie entreprise privée ; éligibilité lue dans le texte
- Adéquation au profil : — · `UNKNOWN` · Profil Nova Presta non renseigné (secteur, taille, certifications)
- Confiance : LOW
- Prochaine action : Vérifier l'éligibilité de Nova Presta et le calendrier sur https://aides-territoires.beta.gouv.fr/aides/1a0f-contribuer-a-ladaptation-et-au-developpement-/
- Preuve : sha256 `64afe7556b0c38ccf4032f4164a3ba7f6244b245b597ebe187ffbff46aa7d9e0` · h_source `3a129531964c4ce7…` · opp_ff21d9a33db0ccfa3efcabd5bc1d549c · ver_562a32c00c4ac4f5c347e84c15a9aa45 · capturé 2026-09-24T01:10:12.157Z

## Aides écartées

| Aide | Intitulé | Règles | Raison |
|---|---|---|---|
| 166539 | DIGITAL EUROPE – DIGITAL-JU-CHIPS-2026-SKILLS-PF-SG – 2026 | PUBLIC_AUDIENCE_ONLY (`HEURISTIC`), EU_CONSORTIUM_CALL (`HEURISTIC`) | Publics structurés uniquement publics (2) et aucune mention d'entreprises dans le texte |
| 166404 | DIGITAL EUROPE - Renforcer les compétences numériques avancées | EU_CONSORTIUM_CALL (`HEURISTIC`) | Appel européen (sectorial) : consortium et cofinancement lourds pour une petite structure |
| 166736 | SOCPL – Information, consultation et participation des représentants des entrepr | EU_CONSORTIUM_CALL (`HEURISTIC`) | Appel européen (sectorial) : consortium et cofinancement lourds pour une petite structure |
| 152366 | Améliorer l’accessibilité touristique à destination des personnes en situation d | OUT_OF_THEME (`HEURISTIC`) | Aucun thème du profil (formation, emploi, recrutement, RH, compétences, insertion) dans le titre ou le texte |
| 104659 | Soutenir l’organisation de salons, forums et opérations d’information sur les mé | PUBLIC_AUDIENCE_ONLY (`HEURISTIC`) | Publics structurés uniquement publics (5) et aucune mention d'entreprises dans le texte |
| 117631 | Créer des centres de formation ou développer de nouvelles formations  pour accom | PUBLIC_AUDIENCE_ONLY (`HEURISTIC`) | Publics structurés uniquement publics (2) et aucune mention d'entreprises dans le texte |
| 143365 | Engager votre démarche de résilience territoriale - Formation | PAID_SERVICE (`OBSERVED`) | Prestation payante (is_charged) : un coût, pas une aide |
