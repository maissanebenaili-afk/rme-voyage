# Rapport économique BOAMP — Pays de la Loire

Généré par `node scripts/report-boamp.cjs` à partir des fixtures réelles `fixtures/real/boamp/`.
Déterministe : même fixtures, même rapport (vérifié par `tests/boampEvaluator.test.ts`).

- Date d'évaluation (dernière capture) : 2026-09-23 23:45 UTC
- Avis capturés : 12 · retenus : 7 · écartés : 5
- Profil : Nova Presta, départements 44, 49, 53, 72, 85 ; activité et certifications **non renseignées** (adéquation `UNKNOWN`)
- Ce rapport ne garantit aucun revenu. Coût d'acquisition nul ≠ risque nul ≠ revenu garanti.
- Statuts : `OBSERVED` lu dans l'avis · `INFERRED` règle générale appliquée · `HEURISTIC` estimation · `UNKNOWN` non établi.

## Opportunités retenues

### 26-83998 — CMA-PdL_ Marché de prestations de formation-Formation certifiante ADEA

- Acheteur : CMAR Pays de Loire · départements 44 · Procédure Ouverte · schéma FNSimple
- Échéance : 2026-09-28 12:00 UTC · J-4 · `OBSERVED` · Date limite de réponse de l'avis moins la date d'évaluation
- Mécanisme : marché public de services ; l'acheteur paie les prestations exécutées
- Signal de domaine : descripteurs Formation (`OBSERVED`) ; mots-clés de l'objet 1 (`HEURISTIC`)
- Lots : — · `UNKNOWN`
- Coût d'acquisition : 0 € · `INFERRED` · Accès gratuit aux documents de la consultation sur le profil d'acheteur (Code de la commande publique, art. R2132-2) ; aucun frais de candidature
- Coût initial obligatoire : — · `UNKNOWN` · Temps de préparation de l'offre et exigences du DCE (références, certifications, moyens) non établis
- Délai jusqu'au revenu : 64 à 184 jours · `HEURISTIC` · Date limite + analyse et notification (30 à 120 jours, hypothèse) + délai de paiement public après service fait (30 jours en principe, jusqu'à 60 selon l'acheteur et l'exécution)
- Répétabilité : — · `UNKNOWN` · Indicateur de marché récurrent absent de l'avis
- Marché réservé : — · `UNKNOWN` · Pas de code de réservation dans ce schéma (FNSimple)
- Certification exigée : — · `UNKNOWN` · Aucune mention dans l'avis ; le règlement de consultation (DCE) n'est pas capturé
- Adéquation au profil : — · `UNKNOWN` · Profil Nova Presta non renseigné (activité, certifications, capacité, références)
- Confiance : LOW
- Prochaine action : Télécharger le DCE (https://www.boamp.fr/pages/avis/?q=idweb:26-83998) et vérifier exigences (certification, références, capacité) ; décision go/no-go avant 2026-09-28 12:00 UTC
- Preuve : sha256 `fd22a32ad65654194a87d6db129d24645ae77089ec37424aa9a80a010a9f9fec` · h_source `9b9b33c8ab4170aa…` · économique `0effcb45dd48fc76…` · opp_d65303b1dc9bba58761b736380be053c · ver_b8e0ed6ebff3c4791a9e7c1f911ae0c4 · capturé 2026-09-23T23:45:16.253Z

### 26-83332 — Réalisation d'actions de formation relatives à la sécurité et aux conditions de travail des agents à compter de la notification jusqu'au 31 mai 2030

- Acheteur : Le Mans Métropole · départements 72 · Procédure Ouverte · schéma EFORMS
- Échéance : 2026-09-30 15:00 UTC · J-6 · `OBSERVED` · Date limite de réponse de l'avis moins la date d'évaluation
- Mécanisme : marché public de services ; l'acheteur paie les prestations exécutées
- Signal de domaine : descripteurs Formation (`OBSERVED`) ; mots-clés de l'objet 1 (`HEURISTIC`)
- Lots : LOT-0001 « Certibiocide » montant non indiqué · `OBSERVED`
- Coût d'acquisition : 0 € · `INFERRED` · Accès gratuit aux documents de la consultation sur le profil d'acheteur (Code de la commande publique, art. R2132-2) ; aucun frais de candidature
- Coût initial obligatoire : — · `UNKNOWN` · Temps de préparation de l'offre et exigences du DCE (références, certifications, moyens) non établis
- Délai jusqu'au revenu : 66 à 186 jours · `HEURISTIC` · Date limite + analyse et notification (30 à 120 jours, hypothèse) + délai de paiement public après service fait (30 jours en principe, jusqu'à 60 selon l'acheteur et l'exécution)
- Répétabilité : marché récurrent · `OBSERVED` · cbc:RecurringProcurementIndicator de l'avis eForms
- Marché réservé : non · `OBSERVED` · Code eForms reserved-procurement : none
- Certification exigée : — · `UNKNOWN` · Aucune mention dans l'avis ; le règlement de consultation (DCE) n'est pas capturé
- Adéquation au profil : — · `UNKNOWN` · Profil Nova Presta non renseigné (activité, certifications, capacité, références)
- Confiance : LOW
- Prochaine action : Télécharger le DCE (https://www.boamp.fr/pages/avis/?q=idweb:26-83332) et vérifier exigences (certification, références, capacité) ; décision go/no-go avant 2026-09-30 15:00 UTC
- Preuve : sha256 `f00295c8bca04b668f485fb1ede84f587d43b414e668ffad57fd805a43fda391` · h_source `2369bf0a09f40372…` · économique `985cc40084363296…` · opp_2cdb6dd784987cf97a9cb49b3796f02a · ver_06f55cec14d243776a7671511f3595b2 · capturé 2026-09-23T23:45:10.079Z

### 26-86504 — Prestations d’accompagnement au processus de recrutement de postes stratégiques, sous tension ou à responsabilités au sein du Département de Maine-et-Loire

- Acheteur : DEPARTEMENT DU MAINE ET LOIRE · départements 49, 53, 44, 72 · Procédure Ouverte · schéma FNSimple
- Échéance : 2026-10-05 12:00 UTC · J-11 · `OBSERVED` · Date limite de réponse de l'avis moins la date d'évaluation
- Mécanisme : marché public de services ; l'acheteur paie les prestations exécutées
- Signal de domaine : descripteurs aucun (`OBSERVED`) ; mots-clés de l'objet 1 (`HEURISTIC`)
- Lots : — · `UNKNOWN`
- Coût d'acquisition : 0 € · `INFERRED` · Accès gratuit aux documents de la consultation sur le profil d'acheteur (Code de la commande publique, art. R2132-2) ; aucun frais de candidature
- Coût initial obligatoire : — · `UNKNOWN` · Temps de préparation de l'offre et exigences du DCE (références, certifications, moyens) non établis
- Délai jusqu'au revenu : 71 à 191 jours · `HEURISTIC` · Date limite + analyse et notification (30 à 120 jours, hypothèse) + délai de paiement public après service fait (30 jours en principe, jusqu'à 60 selon l'acheteur et l'exécution)
- Répétabilité : — · `UNKNOWN` · Indicateur de marché récurrent absent de l'avis
- Marché réservé : — · `UNKNOWN` · Pas de code de réservation dans ce schéma (FNSimple)
- Certification exigée : — · `UNKNOWN` · Aucune mention dans l'avis ; le règlement de consultation (DCE) n'est pas capturé
- Adéquation au profil : — · `UNKNOWN` · Profil Nova Presta non renseigné (activité, certifications, capacité, références)
- Confiance : LOW
- Prochaine action : Télécharger le DCE (https://www.boamp.fr/pages/avis/?q=idweb:26-86504) et vérifier exigences (certification, références, capacité) ; décision go/no-go avant 2026-10-05 12:00 UTC
- Preuve : sha256 `53cc30be13d82496b29d3e7230bf6d410346e11fc3cd9469afcaccd1c5407566` · h_source `c54b65e20a83ab28…` · économique `3fec622475d4b7e8…` · opp_ec35dc3db304c71fd1aecf7d6d0c4399 · ver_1c7e7b2dd64c4c9ca478c0fc531d1e8e · capturé 2026-09-23T23:45:13.500Z

### 26-89746 — FORMATION (INITIALE, CONTINUE ET PREMIERS SECOURS) DES ACCUEILLANTS FAMILIAUX, DES ASSISTANTS FAMILIAUX ET DES ASSISTANTS MATERNELS DU DÉPARTEMENT DE LA SARTHE

- Acheteur : Département de la Sarthe · départements 72 · Procédure Ouverte · schéma EFORMS
- Échéance : 2026-10-12 09:30 UTC · J-18 · `OBSERVED` · Date limite de réponse de l'avis moins la date d'évaluation
- Mécanisme : marché public de services ; l'acheteur paie les prestations exécutées
- Signal de domaine : descripteurs Formation (`OBSERVED`) ; mots-clés de l'objet 1 (`HEURISTIC`)
- Lots : LOT-0001 « Formation obligatoire des assistants maternels préalable à l'accueil » 120 000 € HT (estimation) ; LOT-0002 « Formation premiers secours citoyen (PSC) dans le cadre de la formation » 15 000 € HT (estimation) ; LOT-0003 « Formation obligatoire des assistants maternels après accueil (en cours » 60 000 € HT (estimation) ; LOT-0004 « Formation premiers secours citoyen (PSC) des accueillants et assitants » 7 000 € HT (estimation) ; LOT-0005 « Formation initiale et continue des accueillants familliaux » 32 000 € HT (estimation) · `OBSERVED`
- Coût d'acquisition : 0 € · `INFERRED` · Accès gratuit aux documents de la consultation sur le profil d'acheteur (Code de la commande publique, art. R2132-2) ; aucun frais de candidature
- Coût initial obligatoire : — · `UNKNOWN` · Temps de préparation de l'offre et exigences du DCE (références, certifications, moyens) non établis
- Délai jusqu'au revenu : 78 à 198 jours · `HEURISTIC` · Date limite + analyse et notification (30 à 120 jours, hypothèse) + délai de paiement public après service fait (30 jours en principe, jusqu'à 60 selon l'acheteur et l'exécution)
- Répétabilité : marché récurrent · `OBSERVED` · cbc:RecurringProcurementIndicator de l'avis eForms
- Marché réservé : non · `OBSERVED` · Code eForms reserved-procurement : none
- Certification exigée : — · `UNKNOWN` · Aucune mention dans l'avis ; le règlement de consultation (DCE) n'est pas capturé
- Adéquation au profil : — · `UNKNOWN` · Profil Nova Presta non renseigné (activité, certifications, capacité, références)
- Confiance : LOW
- Prochaine action : Télécharger le DCE (https://www.boamp.fr/pages/avis/?q=idweb:26-89746) et vérifier exigences (certification, références, capacité) ; décision go/no-go avant 2026-10-12 09:30 UTC
- Preuve : sha256 `138593b28226f0b1271a5f892dd8b2a7bcb8c78b71eafd6510f8d25b66d67505` · h_source `db9399ac1ffb26ca…` · économique `67c4625c67eb124b…` · opp_6a89ae22d8ee72b10b40366c4d7a8b59 · ver_f03d0c3a7d5f8ed292da87defe0b4d9b · capturé 2026-09-23T23:45:11.603Z

### 26-90272 — FORMATION SECURITE AMIANTE

- Acheteur : Région des Pays de la Loire · départements 44, 49, 53, 72, 85 · Procédure Ouverte · schéma EFORMS
- Échéance : 2026-10-16 10:00 UTC · J-22 · `OBSERVED` · Date limite de réponse de l'avis moins la date d'évaluation
- Mécanisme : marché public de services ; l'acheteur paie les prestations exécutées
- Signal de domaine : descripteurs Formation (`OBSERVED`) ; mots-clés de l'objet 1 (`HEURISTIC`)
- Lots : LOT-0001 « FORMATION SECURITE AMIANTE » montant non indiqué · `OBSERVED`
- Coût d'acquisition : 0 € · `INFERRED` · Accès gratuit aux documents de la consultation sur le profil d'acheteur (Code de la commande publique, art. R2132-2) ; aucun frais de candidature
- Coût initial obligatoire : — · `UNKNOWN` · Temps de préparation de l'offre et exigences du DCE (références, certifications, moyens) non établis
- Délai jusqu'au revenu : 82 à 202 jours · `HEURISTIC` · Date limite + analyse et notification (30 à 120 jours, hypothèse) + délai de paiement public après service fait (30 jours en principe, jusqu'à 60 selon l'acheteur et l'exécution)
- Répétabilité : non récurrent · `OBSERVED` · cbc:RecurringProcurementIndicator de l'avis eForms
- Marché réservé : non · `OBSERVED` · Code eForms reserved-procurement : none
- Certification exigée : — · `UNKNOWN` · Aucune mention dans l'avis ; le règlement de consultation (DCE) n'est pas capturé
- Adéquation au profil : — · `UNKNOWN` · Profil Nova Presta non renseigné (activité, certifications, capacité, références)
- Doublon possible (`HEURISTIC`) : 26-90281 — même acheteur, même objet, même jour limite ; à vérifier, non fusionné
- Confiance : LOW
- Prochaine action : Télécharger le DCE (https://www.boamp.fr/pages/avis/?q=idweb:26-90272) et vérifier exigences (certification, références, capacité) ; décision go/no-go avant 2026-10-16 10:00 UTC ; vérifier le lien avec 26-90281
- Preuve : sha256 `582194a95a7eb9be1de7616a18fc8ba685db266374bcae3be05c2f2dfbbfc042` · h_source `26124d7569502c40…` · économique `30475212043bc94d…` · opp_4afb3ef4dee7d219d0a714c7a88ae3a1 · ver_94b30440a44d5001dcffa89a29f3f4e8 · capturé 2026-09-23T23:45:18.032Z

### 26-90281 — FORMATION SECURITE AMIANTE

- Acheteur : Région des Pays de la Loire · départements 44, 49, 53, 72, 85 · Procédure Adaptée · schéma MAPA
- Échéance : 2026-10-16 12:00 UTC · J-22 · `OBSERVED` · Date limite de réponse de l'avis moins la date d'évaluation
- Mécanisme : marché public de services ; l'acheteur paie les prestations exécutées
- Signal de domaine : descripteurs Formation (`OBSERVED`) ; mots-clés de l'objet 1 (`HEURISTIC`)
- Lots : — · `UNKNOWN`
- Coût d'acquisition : 0 € · `INFERRED` · Accès gratuit aux documents de la consultation sur le profil d'acheteur (Code de la commande publique, art. R2132-2) ; aucun frais de candidature
- Coût initial obligatoire : — · `UNKNOWN` · Temps de préparation de l'offre et exigences du DCE (références, certifications, moyens) non établis
- Délai jusqu'au revenu : 82 à 202 jours · `HEURISTIC` · Date limite + analyse et notification (30 à 120 jours, hypothèse) + délai de paiement public après service fait (30 jours en principe, jusqu'à 60 selon l'acheteur et l'exécution)
- Répétabilité : — · `UNKNOWN` · Indicateur de marché récurrent absent de l'avis
- Marché réservé : — · `UNKNOWN` · Pas de code de réservation dans ce schéma (MAPA)
- Certification exigée : — · `UNKNOWN` · Aucune mention dans l'avis ; le règlement de consultation (DCE) n'est pas capturé
- Adéquation au profil : — · `UNKNOWN` · Profil Nova Presta non renseigné (activité, certifications, capacité, références)
- Doublon possible (`HEURISTIC`) : 26-90272 — même acheteur, même objet, même jour limite ; à vérifier, non fusionné
- Confiance : LOW
- Prochaine action : Télécharger le DCE (https://www.boamp.fr/pages/avis/?q=idweb:26-90281) et vérifier exigences (certification, références, capacité) ; décision go/no-go avant 2026-10-16 12:00 UTC ; vérifier le lien avec 26-90272
- Preuve : sha256 `4812e7b104f75ee375040f9828644bc861d7d236ad6a7c718f02cdc2195ab471` · h_source `a5fb86c081744f4f…` · économique `774ff981d77a96fa…` · opp_31fdf1ca4b0d6f2eae43e89d636535cd · ver_53bee0ed45e93333f266bb1f2b94491b · capturé 2026-09-23T23:45:19.572Z

### 26-90875 — Formation numérique et bureautique

- Acheteur : Nantes Métropole · départements 44 · Procédure Ouverte · schéma EFORMS
- Échéance : 2026-10-23 10:00 UTC · J-29 · `OBSERVED` · Date limite de réponse de l'avis moins la date d'évaluation
- Mécanisme : marché public de services ; l'acheteur paie les prestations exécutées
- Signal de domaine : descripteurs Formation (`OBSERVED`) ; mots-clés de l'objet 1 (`HEURISTIC`)
- Lots : LOT-0001 « Acculturation aux usages numériques et initiation aux outils – niveau  » montant non indiqué ; LOT-0002 « Utilisation et usage des outils bureautiques et collaboratifs - niveau » montant non indiqué · `OBSERVED`
- Coût d'acquisition : 0 € · `INFERRED` · Accès gratuit aux documents de la consultation sur le profil d'acheteur (Code de la commande publique, art. R2132-2) ; aucun frais de candidature
- Coût initial obligatoire : — · `UNKNOWN` · Temps de préparation de l'offre et exigences du DCE (références, certifications, moyens) non établis
- Délai jusqu'au revenu : 89 à 209 jours · `HEURISTIC` · Date limite + analyse et notification (30 à 120 jours, hypothèse) + délai de paiement public après service fait (30 jours en principe, jusqu'à 60 selon l'acheteur et l'exécution)
- Répétabilité : non récurrent · `OBSERVED` · cbc:RecurringProcurementIndicator de l'avis eForms
- Marché réservé : non · `OBSERVED` · Code eForms reserved-procurement : none
- Certification exigée : — · `UNKNOWN` · Aucune mention dans l'avis ; le règlement de consultation (DCE) n'est pas capturé
- Adéquation au profil : — · `UNKNOWN` · Profil Nova Presta non renseigné (activité, certifications, capacité, références)
- Confiance : LOW
- Prochaine action : Télécharger le DCE (https://www.boamp.fr/pages/avis/?q=idweb:26-90875) et vérifier exigences (certification, références, capacité) ; décision go/no-go avant 2026-10-23 10:00 UTC
- Preuve : sha256 `f2040c0cce4e150e032e0d88eafa540f345daae5f78541714d5b299aeac6b5bb` · h_source `8035cc2717d4a230…` · économique `7b533169ee638fcd…` · opp_9f7837cc92df745e23d37c551fdd2f11 · ver_9218fa2931bc2804522fb5058ac7aa13 · capturé 2026-09-23T23:45:14.845Z

## Opportunités écartées

| Avis | Objet | Règles | Raison |
|---|---|---|---|
| 26-87965 | Mission d'hébergement et d'accompagnement social des familles étrangères avec en | OUT_OF_DOMAIN (`HEURISTIC`) | Ni descripteur BOAMP (Prestations de services, Ingénierie) ni mot-clé du domaine dans l'objet |
| 26-70382 | Mise à 2x2 voies de la RD178 et insertion d'une voie réservée entre Viais et l'A | MARKET_TYPE_NOT_DELIVERABLE (`HEURISTIC`), OUT_OF_DOMAIN (`HEURISTIC`) | Marché de travaux ; hypothèse de profil : seules des prestations de services sont réalisables |
| 26-19238 | Fournitures d'outillage bijouterie pour le centre de formation | ALREADY_AWARDED (`OBSERVED`), MARKET_TYPE_NOT_DELIVERABLE (`HEURISTIC`), OUT_OF_DOMAIN (`HEURISTIC`) | Avis d'attribution : COOKSON CLAL, OUTILLOR |
| 26-48056 | Formation de premiers secours en santé mentale | ALREADY_AWARDED (`OBSERVED`) | Avis d'attribution : EXCELLENS FORMATION, CEMEA PAYS DE LA LOIRE |
| 26-66104 | TRAVAUX DE CONSTRUCTION POUR UN CAMPUS DE FORMATION A CHANGE (53180)- NOUVELLE R | DOCUMENTARY_NOTICE (`OBSERVED`), MARKET_TYPE_NOT_DELIVERABLE (`HEURISTIC`), OUT_OF_DOMAIN (`HEURISTIC`) | Avis rectificatif d'une consultation existante (26-61001) : pas une nouvelle opportunité |
