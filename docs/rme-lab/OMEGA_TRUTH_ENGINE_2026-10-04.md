# OMEGA — Truth Engine et proposition « Intent Ledger » (4 octobre 2026)

Légende : **MESURÉ** · **SOURCE OFFICIELLE** · **HYPOTHÈSE** · **INCONNU**.

## 1. La proposition de Gemini, affirmation par affirmation
| Affirmation | Verdict | Pourquoi |
|---|---|---|
| « Zéro infrastructure » | **FAUX** pour la mesure | IndexedDB vit dans **un seul navigateur**. 100 visiteurs, ce sont 100 journaux séparés. Pour obtenir « X recherches de garage », il faut un **collecteur côté serveur**. RME en a déjà un (`/api/events`). Ce qui manque, c'est la **conservation**. |
| « Rapport agrégé pour Tarek » depuis IndexedDB | **FAUX** | L'export d'un navigateur ne décrit que ce navigateur. Il ne peut jamais dire « RME a eu N utilisateurs ». |
| « 100 % RGPD » | **NON DÉMONTRÉ** | Un UUID persistant et des horodatages précis forment un identifiant pseudonyme. Le serveur voit aussi l'adresse IP quoi que contienne le message. On peut démontrer « aucun identifiant direct, données minimisées ». La qualification juridique, elle, reste à faire. |
| « UUID sans risque » | **FAUX** | Il relie les événements d'une même personne dans le temps. Pour compter, il est **inutile** : un comptage par catégorie et par jour suffit. |
| « Hash de vérité », « preuve irréfutable » | **FAUX** | Un hash prouve qu'un contenu n'a pas changé **par rapport à une copie de référence conservée ailleurs**. Il ne prouve ni que la source disait vrai, ni que l'utilisateur a vu la donnée, ni que la décision était bonne. Côté client, le contenu est modifiable avant même d'être haché. |
| Badge « Taux certifié… via Bank Al-Maghrib » | **FAUX ET DANGEREUX** | RME utilise une source publique (fawazahmed0), **pas** Bank Al-Maghrib. Ce badge aurait affiché une fausse source, exactement le défaut corrigé depuis le début. |
| Source et date visibles sur les données critiques | **VRAI** | C'est le bon principe. Il est déjà appliqué : carburant (bulletin UE daté, « périmé »), convertisseur (#224), transferts (« estimation RME »). |
| Fonctionnement hors ligne | **VRAI mais hors sujet** | Utile pour le voyageur sans réseau à la frontière, pas pour prouver une valeur commerciale. |
| Stockage Netlify « gratuit inclus » (ma recommandation précédente) | **TROP RAPIDE, je la retire** | Documentation officielle : « last write wins », **pas d'incrément atomique**, une dépendance obligatoire, quotas de l'offre gratuite **non documentés**. Un compteur partagé perdrait des événements. |

## 2. Ce qui survit, ce qui meurt
- **Meurt** : registre IndexedDB pour la mesure, UUID, « sceau » cryptographique, slogans « certifié » et « RGPD ».
- **Survit** : la **provenance visible** (source, date, statut frais, périmé ou hypothèse) et la **taxonomie d'intention** ci-dessous.
- **Remplace l'idée** : un **audit de vérité automatique** (#225). C'est le plus petit mécanisme qui rend RME progressivement plus vrai et plus mesurable.

## 3. Modèle Donnée → Décision (ce qui marche déjà)
Une décision ne doit pas être plus certaine que sa donnée.
| Statut de la donnée | Décision permise | Exemple appliqué |
|---|---|---|
| Officielle et fraîche | Conseil affirmatif | « Faites le plein en Espagne » (#221) |
| Officielle et périmée | Valeur affichée « périmé », **pas de conseil** | #222 |
| Estimation de RME | Valeur « ≈ », **pas de classement** | #219 |
| Promotion | Séparée du prix normal | Laboratoire Money Flow |
| Source injoignable | Valeurs fixes **annoncées comme non à jour**, aucune réponse partielle | #224 |
| Hypothèse de l'utilisateur | Jamais comparée à une donnée officielle | #221 |

On compte **6 endroits** où ce modèle s'applique déjà. Le généraliser dans un type commun serait du travail de réécriture sans preuve de gain. **Pas fait.**

## 4. Modèle Action → Valeur (taxonomie d'intention)
| Niveau | Événement RME | Mesuré | Attribuable au partenaire | Durable | Intérêt commercial |
|---|---|---|---|---|---|
| Vue | `page_view` (+ provenance #223) | Oui | — | **Non** (24 h) | Faible seul |
| Recherche | `route_computed`, `services_searched` (#224) | Oui | — | Non | **Moyen** (demande exprimée) |
| Comparaison | `reality_check_used`, `remittance_result_viewed` | Oui | — | Non | Moyen |
| Clic sortant | `partner_click` (ferry, vols, vitrine) | Oui | Seulement si lien partenaire actif (vols uniquement) | Non | Fort si rémunéré |
| Contact partenaire | `partner_click` avec `product: 'lead'` (#220, #223) | Oui | **Oui**, signature « (vu sur RME Voyage) » | Non | **Fort** |
| Transaction | — | **Impossible sans le partenaire** | — | — | — |

Un clic n'est pas un lead. Un lead n'est pas une vente. Une vente n'est pas un revenu RME.

## 5. Conserver les mesures : la frontière minimale
- **Charge utile minimale**, déjà en place : nom de l'événement, catégorie, partenaire, page, provenance. **Pas** de texte saisi, pas de lieu tapé, pas d'identifiant.
- **Ce que le serveur voit quand même** : l'IP et le navigateur. Ils ne sont pas écrits dans la ligne de journal, mais la plateforme peut les journaliser (INCONNU).
- **Agrégat suffisant pour un partenaire** : nombre de contacts par jour et par partenaire. Aucun identifiant n'est nécessaire.
- **Options** :

| Option | Coût | Nouveau compte | Persistance | Point faible |
|---|---|---|---|---|
| Export manuel quotidien | 0 € | Non | Oui, si fait chaque jour | Discipline humaine |
| Netlify Blobs, un fichier par événement (jamais de compteur partagé) | 0 € (quotas INCONNUS) | Non | Oui | 1 dépendance ; liste à agréger |
| Supabase (prévu dans le code, non branché) | 0 € (offre gratuite) | Oui + clés | Oui | Configuration et secrets |

**Décision réservée à Tarek.** Je ne choisis pas à sa place.

## 6. Mesures du jour
- **Audit sur `main`** : FAIL sur le routage immobilier, les taux en dur et la persistance des événements ; WARN sur les contacts non comptés, le ferry non rémunéré, 9 partenaires sur 10 en attente et le stockage communauté non branché.
- **Audit avec toutes les PR fusionnées (simulation)** : routage, taux et carburant passent à **OK**. Il restait 2 contacts non comptés (ServicesPro, Colis), **corrigés** depuis dans #223. Il reste la persistance.
- Suite complète, toutes PR réunies : **104 suites, 812 tests** (mesure précédente). Branche #223 : 100 suites, 798 tests. Branche #225 : 98 suites, 785 tests.
- Performance : l'audit hors ligne s'exécute en moins d'une seconde. Avec la production, il fait 4 requêtes publiques.

## 7. Surprises
1. **Qu'est-ce que RME mesure mal ?** Il compte des **événements** qui disparaissent en 24 heures. Il ne mesure donc rien dans le temps.
2. **Qu'est-ce que RME ne mesure pas du tout ?** Les transporteurs qui veulent rejoindre l'annuaire « Colis » : c'est de l'**offre** qui frappe à la porte. C'est maintenant compté à part (`colis_annuaire`), pour ne jamais le confondre avec un client.
3. **Qu'est-ce que RME croit vrai sans preuve suffisante ?** Que la « plateforme » retient 10 % sur les caftans. Aucun bénéficiaire, contrat ou date n'est identifiable. L'historique Git ne remonte qu'à un import groupé du 26/09/2026 (#139). **Origine : UNKNOWN.**
4. **Quelle valeur RME crée-t-il sans la capturer ?** L'**envoi de colis** vers le Maroc. C'est un besoin **récurrent** (plusieurs fois par an), et RME l'affiche déjà sur l'accueil et sur `/boutique`. Mais la liste des transporteurs est vide : les anciennes fiches étaient inventées et ont été retirées, honnêtement. C'est le meilleur candidat de flux récurrent trouvé.

## 8. Brevet
Rien de ce qui a été construit ne constitue une invention technique nouvelle. Provenance et fraîcheur des données, audit automatique, comptage anonyme : ce sont de bonnes pratiques connues. **Pas de brevet recommandé.**

## Décision
**GO pour l'audit de vérité (#225)** : coût 0 €, lecture seule, et il a trouvé seul 2 trous que j'avais ratés.
**NO-GO pour le registre IndexedDB et le « sceau »** proposés par Gemini.
**Frontière qui nécessite Tarek :** choisir la conservation des mesures (export manuel, Netlify Blobs en fichiers séparés, ou Supabase), puis fusionner #201 avant le 5 octobre.
