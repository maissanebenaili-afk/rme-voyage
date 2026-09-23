# Capital Hunter — source registry v0.1

Priorité: sources publiques, gratuites/open-data, avec provenance stable. Aucun achat ni abonnement obligatoire.

| Source | Type | Usage | Coût d'accès | URL | Statut du schéma |
|---|---|---|---|---|---|
| Aides Territoires | API ouverte | aides financières/ingénierie par territoire | 0€ annoncé | https://aides-territoires.beta.gouv.fr/api | SYNTHETIC_TEST |
| ADEME aides financières | API open data | subventions/aides remboursables | 0€ annoncé | https://data.ademe.fr/data-fair/api/v1/datasets/les-aides-financieres-de-lademe | SYNTHETIC_TEST |
| BOAMP | API gratuite | marchés publics, avis et résultats | 0€ | API BOAMP officielle via data.gouv.fr | SYNTHETIC_TEST |
| data.europa.eu | API + RSS | datasets et flux RSS européens | 0€ | https://data.europa.eu/api/hub/search/ | REAL_FIXTURE (`DATA_EUROPA_HUB`, capturé 2026-09-23) + SYNTHETIC_TEST (`DATA_EUROPA`) |
| CORDIS | RSS + SPARQL | projets européens R&I | 0€ sans login pour RSS/recherche | https://cordis.europa.eu/about/services | SYNTHETIC_TEST |
| Funding/Tenders dataset | open data | projets financés par l'UE | 0€ | data.gouv.fr / Funding & Tenders | SYNTHETIC_TEST |
| Base aides aux entreprises | open data CSV | aides publiques aux entreprises | 0€ | data.gouv.fr | SYNTHETIC_TEST |

SYNTHETIC_TEST : extracteur écrit sur un schéma inventé. REAL_FIXTURE : extracteur écrit sur des réponses réelles capturées (`fixtures/real/`) ; ce n'est pas une intégration réseau certifiée.
