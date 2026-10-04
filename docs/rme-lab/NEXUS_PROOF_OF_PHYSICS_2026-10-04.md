# Nexus — Proof of Physics (4 octobre 2026)

Légende : **CONFIRMED** (documentation officielle, citée) · **MEASURED (modèle)** · **TO VERIFY** · **UNKNOWN**.

**Limite assumée.** Je n'ai **pas** testé le vrai Netlify Blobs : il faudrait un site déployé et l'accès au compte Netlify, ce qui est hors de mon périmètre (aucun compte, aucun secret, aucune production). J'ai donc :
1. lu la documentation officielle ;
2. simulé **exactement les règles documentées** dans un laboratoire isolé (`scripts/lab/nexus-physics.mjs`, hors de RME).

Un modèle montre ce que ces règles **impliquent**. Il ne remplace pas une mesure sur le service réel.

## 1. Documentation officielle vérifiée
| Propriété | Réponse | Statut |
|---|---|---|
| Concurrence | « **Last write wins.** If two overlapping calls try to write the same object, the last write wins. Netlify Blobs does not include a concurrency control mechanism. » | **CONFIRMED** ([docs.netlify.com/…/netlify-blobs](https://docs.netlify.com/build/data-and-storage/netlify-blobs/)) |
| Incrément atomique | Aucun | **CONFIRMED** (même page) |
| Écriture conditionnelle | `set(…, { onlyIfMatch: etag })` ou `{ onlyIfNew: true }`. Le retour indique `modified` | **CONFIRMED** |
| Cohérence | Éventuelle par défaut. Propagation des mises à jour « within 60 seconds ». Option « strong » disponible | **CONFIRMED** |
| Persistance | Les stores de site survivent aux déploiements. Les stores de déploiement disparaissent avec le déploiement | **CONFIRMED** |
| Expiration | Aucune automatique (à coder soi-même) | **CONFIRMED** |
| Edge Functions | Disponible | **CONFIRMED** |
| Dépendance | Paquet `@netlify/blobs` obligatoire | **CONFIRMED** |
| Coût | Inclus dans tous les plans. Il puise dans la **réserve de crédits** partagée (Free : 300 crédits par mois, **limite stricte**). Le coût en crédits par opération Blobs **n'est pas publié** | **CONFIRMED** (existence) / **UNKNOWN** (coût) ([tarifs crédits](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)) |
| Si la limite de crédits est atteinte | Non précisé par la documentation | **UNKNOWN**. Risque : la mesure consomme **la même réserve que le site** |
| Offre de RME | `netlify.toml` dit « free plan ». Le compte peut être un plan « Legacy » si créé avant le 04/09/2025 | **TO VERIFY** (Tarek) |

## 2. Test de concurrence (modèle des règles documentées, 5 répétitions par cas)
| Stratégie | N=10 | N=100 | N=1 000 | Coût |
|---|---|---|---|---|
| `count++` (lire, +1, réécrire) | **2 sur 10** | **2 à 3 sur 100** | **1 à 3 sur 1 000** | 2 requêtes par événement |
| ETag + réessai (`onlyIfMatch`) | 10/10 | 100/100 | **701 à 729 sur 1 000 (abandons)** | **≈1 700 réessais à N=100, ≈75 000 à N=1 000** |
| **Un objet par événement** (`onlyIfNew`), total = nombre de clés | **10/10** | **100/100** | **1 000/1 000** | 1 écriture par événement + lecture de la liste |

Les lectures en retard (20 % simulés) ne changent rien. La condition ETag est vérifiée à l'origine.
Le modèle représente le **pire cas** : toutes les écritures partent en même temps. Avec un trafic réel faible, `count++` perdrait moins, mais il resterait faux par construction.

**Verdict du compteur : D** pour `count++` (impropre à un usage commercial) et pour l'ETag sous forte charge. **B-C** si l'on renonce au compteur : on écrit **un objet par événement** et on agrège ensuite. Pas de faux compteur.

## 3. Doublons et réessais (modèle)
1 000 événements, 1 079 envois (environ 10 % renvoyés) :
- clé aléatoire **par envoi** : **1 079 comptés** ;
- clé = **identifiant de l'événement** choisi une seule fois (`onlyIfNew`) : **1 000 comptés**.

## 4. « Zero loss » du LocalIntentSpooler
Le « zéro perte » est **faux**. Un événement est perdu si :
- le stockage local est effacé ou saturé ;
- l'utilisateur est en navigation privée ;
- le téléphone change ou est réinitialisé ;
- l'onglet n'est jamais rouvert (sans l'API Sync, absente de Safari) ;
- le serveur répond 200 sans avoir écrit.

Formulation exacte : **« file d'attente durable au mieux (best-effort) »**.
Pour la mesure commerciale, elle n'est même pas nécessaire. Un clic de contact se fait **en ligne** : WhatsApp ou le téléphone partent du même appareil, au même moment. `sendBeacon`, déjà en place, couvre ce cas.

## 5. `deviceId`
- Un hachage « jetable » mais **stable** relie tous les événements d'un même appareil. C'est un **pseudonyme**, pas de l'anonymat.
- Le serveur et Netlify voient en plus **l'IP et l'heure** : la corrélation est possible.
- Il est **inutile** pour compter des clics par partenaire et par jour.
- **Supprimé du design.** On garde seulement un identifiant **d'événement**, aléatoire, tiré une fois par événement, pour dédoublonner.

## 6. Niveaux d'intention : définitions exactes
| Niveau | Définition | Ce qui permet de passer au niveau suivant | Qui le sait |
|---|---|---|---|
| INTENTION | Recherche ou comparaison (`services_searched`, `route_computed`, `reality_check_used`) | Un clic vers un partenaire précis | RME |
| QUALIFIED_INTENT | Intention + catégorie qui correspond à un partenaire existant (ex. recherche « garage » quand un garagiste partenaire existe) | Le clic de contact | RME |
| PARTNER_CONTACT | Clic WhatsApp, téléphone ou site d'un partenaire (`partner_click`, `product: 'contact'`) | **Un message réellement reçu** | **Le partenaire seulement** (signature « vu sur RME Voyage ») |
| LEAD | Demande reçue par le partenaire, jugée sérieuse **par lui** | Un devis accepté | Le partenaire |
| CONVERSION | Vente conclue | Paiement à RME | Le partenaire |
| REVENUE | Argent reçu par RME | — | RME (comptabilité) |

Sans retour du partenaire, RME s'arrête **à PARTNER_CONTACT**. Au-delà : **UNKNOWN**.

## 7. Colis : « j'envoie » contre « j'ai de la place dans ma voiture »
| Risque | Constat | Statut |
|---|---|---|
| Réglementaire (France) | Le transport de marchandises **pour le compte d'autrui** contre rémunération demande une inscription au registre des transporteurs (honorabilité, capacité, etc.) | **CONFIRMED** pour le principe (sites DREAL). Le cas du partage de frais occasionnel reste **TO VERIFY** |
| Douane (Maroc) | Franchise sur les colis personnels sous un seuil (1 250 MAD selon une source secondaire). Au-delà : droits et TVA. Le voyageur **répond de ce qu'il transporte** | Seuil **TO VERIFY** (source secondaire) |
| Marchandises interdites et fraude | Un particulier peut transporter sans le savoir un objet interdit | Risque **élevé** |
| Assurance et responsabilité | Perte, casse, vol : aucune couverture évidente | **UNKNOWN** |
| Confiance | Vérification d'identité nécessaire, ce qui ajoute une collecte de données sensibles | Risque élevé |

**Verdict.** La mise en relation entre particuliers pour transporter des colis est **NO-GO**. RME n'oriente que vers des **transporteurs professionnels déclarés** : information, intention, contact. C'est déjà la forme de l'annuaire Colis, vide aujourd'hui, avec les demandes d'inscription comptées (#223).

## 8. Matrice
| | RME actuel | CTP | Atlas | Nexus | **Minimal qui survit** |
|---|---|---|---|---|---|
| Complexité | Faible | — | — | Très forte (IndexedDB, file d'attente, Edge, compteurs) | **Faible** |
| Fiabilité du chiffre | Nulle après 24 h | — | — | **Fausse** (`count++`) | **Exacte** (1 objet par événement) |
| Coût | 0 € | — | — | Crédits UNKNOWN, réserve partagée avec le site | Crédits UNKNOWN (1 écriture par contact, pas par vue) |
| Hors ligne | Non nécessaire | — | — | « Zero loss » faux | Non nécessaire |
| Confidentialité | Bonne | — | — | `deviceId` = pseudonyme | Aucun identifiant de personne |
| Valeur commerciale | Faible (pas de durée) | — | — | Promise, non prouvée | **Durée suffisante pour un partenaire** |

« CTP » et « Atlas » ne sont décrits dans aucun document auquel j'ai accès : **UNKNOWN**, non évalués.

## 9. Architecture minimale qui survit
1. Garder `/api/events` et la charge utile actuelle, sans identifiant de personne.
2. **Persister seulement les `partner_click`** (`product: 'contact'`), soit le dixième des événements environ (**TO VERIFY**). Une écriture par contact : `events/AAAA-MM-JJ/<partenaire>/<id_événement>` avec `onlyIfNew`. Rien d'autre.
3. Faire le total la nuit ou à la demande, en listant les clés du jour. **Aucun compteur partagé.**
4. Le reste (vues, recherches) : export manuel si besoin.
5. Avant d'activer : **mesurer sur un aperçu de déploiement** (Tarek, 10 minutes). Envoyer 100 contacts en parallèle, compter 100 clés, regarder la consommation de crédits.

## 10. Décision
**Nexus tel que proposé : NO-GO.** Le compteur est faux, le « zero loss » aussi, le `deviceId` est inutile, et la mise en relation colis entre particuliers est risquée.
**Version minimale (point 9) : GO UNDER CONDITIONS.**
1. Tarek confirme l'offre Netlify (Free ou Legacy) et le comportement à la limite de crédits.
2. Un test réel sur un aperçu de déploiement confirme 100 contacts sur 100.
3. Tarek accepte une dépendance (`@netlify/blobs`).

Aucune ligne de production n'a été écrite.
