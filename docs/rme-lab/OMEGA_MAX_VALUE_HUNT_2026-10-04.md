# OMEGA MAX — Chasse à la valeur (4 octobre 2026, après-midi)

Légende : **OFFICIEL** · **SECONDAIRE** (presse, annuaires) · **MESURÉ** (par moi, aujourd'hui) · **CALCUL** · **HYPOTHÈSE** · **UNKNOWN**.
Méthode : dépôt + production + deux recherches web parallèles (22 problèmes MRE sourcés, 27 programmes partenaires, 12 concurrents) + sources primaires (IGOC 2026, guide ADII, France Diplomatie).

## Artefacts produits dans cette session
| Artefact | Contenu | Preuve |
|---|---|---|
| **PR #226** (mise à jour) | Douane : ne garde que les chiffres lus dans une source primaire. 20 000 DH par année civile pour un MRE qui travaille (guide ADII). 2 000 DH en billets et déclaration des devises dès 100 000 DH (IGOC 2026). Retirés : « 2 000 DH autres voyageurs », « parfum 150 ml » | 6 tests ; vérifié sur l'aperçu de déploiement |
| **PR #228** (nouvelle) | Ferries : GNV et non Grimaldi pour Nador ; Baleària sur Tarifa depuis mai 2025 ; Almería → Nador ajoutée. Passeport « valide pour le séjour » au lieu de « 6 mois » (France Diplomatie). « Programme MRE de l'OFII » probablement inventé, retiré du flux RSS | 3 tests, les 3 échouent sur l'ancien code |
| Ce document | Synthèse, décisions | — |

## PR #226 — Truth gate : **GO SOUS RÉSERVE**
| Chiffre | Source primaire | Date | Statut |
|---|---|---|---|
| Cadeaux familiaux d'un MRE qui travaille à l'étranger < 20 000 DH par année civile, une fois par an | Guide ADII « Marocains du Monde » ([finances.gov.ma](https://www.finances.gov.ma/Publication/adii/2011/8347_mre_douane.pdf)) | **2011**. Maintien confirmé par l'ADII en 2022 selon la presse | OFFICIEL, ancien |
| Dirhams en billets ≤ 2 000 DH | [IGOC 2026](https://www.oc.gov.ma/sites/default/files/reglementation/pdf/2026-01/IGOC%202026.pdf) §3.2 | 2026 | OFFICIEL |
| Devises : déclaration ≥ 100 000 DH | IGOC 2026, « Déclaration obligatoire » | 2026 | OFFICIEL |
| Gasoil > 16 DH/L le 01/10/2026 | Presse | 01/10/2026 | SECONDAIRE, affiché comme tel |

**Seule réserve** : le guide ADII date de 2011. douane.gov.ma refuse toute lecture automatique. Une personne doit ouvrir la section 33 de l'ADII (« Facilités MRE ») dans un navigateur avant fusion.

## Les 10 réponses
1. **Le plus gros bug économique actuel.** RME ne peut rien prouver à personne : les journaux s'effacent en environ 24 h (déjà connu). **Nouveau** : Google Search Console n'est pas branchée. Le code l'attend (`GOOGLE_SITE_VERIFICATION`, `lib/siteVerification.ts`), mais la page de production n'a aucune balise. RME ignore donc les recherches Google qui l'affichent, ce qui est gratuit et sans nouveau code. Google affiche en principe aussi des données antérieures à la vérification : ce n'est donc pas une perte, c'est une donnée gratuite que personne ne lit (HYPOTHÈSE à confirmer à l'ouverture). — MESURÉ (absence de la balise)
2. **Meilleure opportunité de revenu.** **Colis via Eurosender** : 10 % HT par vente **+ 2 € par prospect**, cookie 45 jours, et le Maroc est desservi (OFFICIEL, pages Eurosender). C'est le seul programme trouvé qui **paie le prospect** et pas seulement la vente. Le colis figure dans les 22 problèmes MRE (3 sources), et l'annuaire Colis de RME est vide. Ensuite : WorldRemit, 30 £ par premier transfert ≥ 50 £ (OFFICIEL). Le code du comparateur a déjà la variable `WORLDREMIT_AFFILIATE_URL`.
3. **Meilleur problème utilisateur non résolu.** **La voiture restée plus de 6 mois au Maroc** : amendes de 1 000 à 10 000 DH (3 sources secondaires citant la douane). Aucun outil ne compte les jours. RME connaît la date d'entrée du trajet ; personne d'autre ne la relie à ce délai. Sans partenaire, sans dépense.
4. **Meilleur partenaire potentiel.** Au niveau local : HiDOUR (immobilier, inchangé). Programmes ouverts : **Eurosender** (paie le prospect) et **WorldRemit** (paiement fixe élevé). Les deux demandent une inscription par Tarek, et un statut juridique pour certains.
5. **Meilleur avantage asymétrique.** RME relie **date + port + destination + véhicule** en un seul trajet. Les concurrents ont chacun une partie : LesMRE.com (annuaire, guides, transfert), Marhaba (officiel, sans coûts), Tanger Med (un seul port), Ferryhopper (billets). **Aucun ne calcule la route voiture ni le carburant pays par pays** (HYPOTHÈSE pour LesMRE, site non exploré en entier).
6. **Meilleure donnée propriétaire possible.** Le calendrier anonyme des intentions de passage : quel port, quelle semaine, depuis quel pays. Tanger Med, les compagnies et les loueurs paieraient pour cette donnée (HYPOTHÈSE). **Elle n'existe pas** tant que les mesures disparaissent en 24 h.
7. **Meilleur test à faire.** Search Console : 10 minutes de Tarek, 0 €, 0 code. Après 2 semaines, on connaît les requêtes, les pages vues dans Google et les clics. C'est la première mesure durable et gratuite de la demande.
8. **Chemin le plus court vers le premier euro.**
   1. Tarek s'inscrit à Eurosender (TradeTracker).
   2. Il met le lien d'affiliation sur la section Colis.
   3. Un prospect Eurosender rapporte 2 €.

   Le développement est minime, car le pattern « lien partenaire par variable d'environnement » existe déjà. **Bloquant : le trafic réel est UNKNOWN.** Sans visiteurs, aucun modèle ne produit 1 €.
9. **Risque qui pourrait tuer le projet.** **La distribution.** RME n'apparaît dans aucune des recherches web faites aujourd'hui (MESURÉ, moteur de recherche de l'outil, pas Google lui-même). Yabiladi et Bladi ont des millions de visites par mois (SECONDAIRE). Second risque : la crédibilité. Hadak affirmait des chiffres de douane faux, venus de l'IA. Pour un public qui risque des amendes, une fausse réponse détruit la confiance.
10. **Ce que nous ne comprenons pas encore sur RME.** **Qui l'utilise et combien.** Tout le reste (partenaires, commissions, données propriétaires) dépend de cette donnée. Personne ne l'a. Le vrai produit n'est peut-être pas l'application, mais **les réponses fiables aux questions à amende** (douane, voiture 6 mois, devises, billet fixe en août). Elles se diffusent là où les MRE parlent déjà (HYPOTHÈSE).

## Décision qui revient à Tarek (branche arrêtée)
**Paris sportifs sur la page d'accueil.** La production affiche « **Partenaires** paris sportifs » (bet365, Betclic, Unibet, Winamax), à côté de pronostics générés par IA. Aucun lien d'affiliation n'est configuré : ce ne sont **pas** des partenaires, ce qui contredit la règle du projet (CODE PRÉSENT ≠ PARTENAIRE APPROUVÉ).
- Hypothèse vérifiée et rejetée : bet365 a bien un agrément ANJ depuis le 16/04/2026 (SECONDAIRE). Il n'y a donc pas d'illégalité évidente.
- Reste à trancher : garder ou retirer ce bloc pour un public familial MRE. Le mot « Partenaires » doit de toute façon disparaître tant qu'aucun partenariat n'existe.
- Je n'ai rien modifié : la bonne correction dépend de ce choix.

## Les 3 meilleures actions
| | 1. Search Console | 2. Compteur des 6 mois du véhicule | 3. Eurosender sur Colis |
|---|---|---|---|
| Problème | Aucune mesure durable de la demande | Amendes de 1 000 à 10 000 DH, aucun outil | Annuaire Colis vide, aucun revenu |
| Preuve | Balise absente en production (MESURÉ) ; code prêt | 3 sources secondaires citant la douane | Commission officielle 10 % + 2 €/prospect ; Maroc desservi |
| Action | Tarek vérifie la propriété et colle le jeton dans `GOOGLE_SITE_VERIFICATION` | Prototype : date d'entrée → date limite + rappel, avec source | Tarek s'inscrit ; lien par variable d'environnement, comme les ferries |
| Artefact | Aucun nécessaire (code présent) | **À construire** seulement après vérification de la règle sur une source primaire (douane) | Petite PR après inscription |
| Test | 14 jours : requêtes et impressions | 5 MRE testent, l'utilisent-ils ? | Premier prospect déclaré par Eurosender |
| Résultat | — | — | — |
| Décision | **GO** (Tarek, 10 min) | **GO SOUS CONDITION** de la source primaire | **GO SOUS CONDITION** d'inscription |

## Red team
- **Search Console** : ne mesure que Google, pas les visiteurs venus de WhatsApp ou Facebook. Reste la meilleure mesure gratuite disponible.
- **Compteur des 6 mois** : la règle exacte (180 jours ? par année ? prolongation ?) n'est pas vérifiée sur une source primaire. Une erreur ici coûterait une amende à l'utilisateur. Il faut donc la source avant le code. Utilité forte, revenu nul et direct.
- **Eurosender** : prix inconnu par rapport au groupage MRE informel, souvent moins cher (HYPOTHÈSE). La définition exacte d'un « prospect » qui paie 2 € est UNKNOWN avant inscription. Un statut juridique est peut-être nécessaire. Le trafic est inconnu.
- **WorldRemit / Wise** : la recommandation doit rester justifiée par le besoin. Or le comparateur affiche encore des estimations (#219 retire le podium). Sans vrais devis, pas de lien payé mis en avant.
- **KILL** : marketplace de colis entre particuliers (déjà NO-GO, registre des transporteurs). Banques marocaines (aucun programme public). Grimaldi et FRS (aucun programme).

## Ce qui a été vérifié et rejeté
- « bet365 non agréé en France » : faux, agréé ANJ en 2026.
- « Tarifa → Tanger Ville n'existe plus » : faux, la ligne est reprise par Baleària. Les 32 pages trajet qui l'utilisent restent justes.
- « Le prix hypothèse du gasoil au Maroc (1,40 €/L) est faux » : non, environ 1,44 €/L réel.

## Améliorer la mission (pour la prochaine fois)
- Remplacer « 20 opportunités, 20 problèmes, 20 partenaires » par « **jusqu'à** 20, chacun avec une source ». Un nombre imposé pousse à remplir.
- Fixer un **critère d'arrêt** : 3 actions classées GO, avec preuve.
- Garder une seule règle de sortie : **chaque phrase importante porte son statut**.
- Les 16 phases se recoupent ; 5 suffisent : carte, utilisateurs, argent, vérité, red team.
