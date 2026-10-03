# Cartographie des sources : informations en continu et lecture média — 2026-10-03

Mission de cartographie, lecture seule. Aucun code, aucun déploiement, aucun changement Netlify. Preuves : `CODE` (lu dans `main`), `WEB` (page officielle lue le 2026-10-03), `MESURÉ` (mesure faite aujourd'hui), `UNKNOWN`.
Rien ici n'est un avis juridique. Un résultat non démontré reste une hypothèse.

## 1. Ce qui existe déjà dans RME

| Élément | État | Preuve |
|---|---|---|
| `lib/routeEvents.ts` | Fondation d'un événement de trajet (`RouteEvent` : type, niveau de vérité, source, lieu, date d'expiration). **Sans interface, sans réseau, sans stockage.** | CODE |
| `components/NewsFeed.tsx` et `app/rss.xml/route.ts` | Quatre « actualités » **écrites à la main**, avec des dates (2026-01-15 à 2026-06-01). Rien n'est lu en direct. Une information datée présentée comme actualité peut vieillir sans que rien ne le dise. | CODE |
| `components/TVWidget.tsx`, `SportsHub.tsx` | Simples liens sortants vers des chaînes (SNRT, Medi1TV, beIN, DW, MBC). Aucune lecture de contenu. | CODE |
| Données en direct réellement lues | TheSportsDB, Open-Meteo, AlAdhan, open.er-api.com (taux de change). Aucune donnée de route, de ferry ou de frontière. | CODE |
| Ferries | Les liaisons sont des coordonnées de terminaux. « Aucune donnée d'horaire, de prix ou d'opérateur n'est stockée. » | CODE |

Conséquence : la couche « informations en continu » est à construire de zéro. Une correction à faire d'abord, sans rapport avec la nouveauté : l'`NewsFeed` actuel doit être daté ou retiré, car il ressemble à du direct.

## 2. Informations en continu : sources accessibles

| Besoin | Source | Accès | Usage commercial | Couverture | Verdict |
|---|---|---|---|---|---|
| Routes, Espagne | **DGT** (nap.dgt.es), DATEX II v3.7 | HTTPS, sans clé, mise à jour 1 min | Oui, licence Creative Commons avec attribution (WEB) | Réseau national, **sans le Pays basque ni la Catalogne**. MESURÉ : 549 situations, 731 enregistrements, **3,1 Mo par appel**. | **Utilisable.** Mettre en cache côté serveur et filtrer par trajet. L'itinéraire par la Catalogne n'est pas couvert. |
| Routes, France | transport.data.gouv.fr « état de circulation » | XML DATEX II, sans clé, mise à jour 6 min | Oui, Licence Ouverte 2.0 (WEB) | **Seulement le réseau national non concédé**. Les autoroutes à péage sont exclues. Contenu : vitesses, débits, état (fluide, dense, saturé), 21 agglomérations. Ce ne sont pas des incidents. | **Limité.** L'exemple « A7 perturbée » **n'est pas couvert** : l'A7 est une autoroute à péage. Flux d'incidents autoroutiers : UNKNOWN. |
| Routes, Maroc | Autoroutes du Maroc (application « ADM Trafic ») | Aucune API publique trouvée | UNKNOWN | — | **Rien d'automatisable aujourd'hui.** |
| Météo, alertes France | Météo-France vigilance (portail-api.meteofrance.fr) | Abonnement gratuit | Oui, avec mention de Météo-France (Licence ouverte) (WEB, résultat de recherche) | France | **Utilisable**, conditions précises à relire sur le portail. |
| Météo, alertes Espagne | AEMET OpenData | API | Réutilisation permise par la loi espagnole ; détail dans l'avis légal, non lu | Espagne | À lire avant usage. |
| Météo, alertes Maroc | DGM, portail de vigilance (4 niveaux de couleur) | Site web ; aucune API trouvée | UNKNOWN | Provinces et bandes côtières | Lien seulement. |
| Météo générale | MET Norway | Testé (voir le spike) | Oui, CC BY 4.0 | Mondiale | Pas d'alertes pour le Maroc. |
| Ferries : retards, annulations | Opérateurs (FRS, Baleària, Trasmed, Armas, AML) | **Aucune API ni donnée ouverte trouvée** (la recherche ne montre que des sites de réservation) | UNKNOWN | — | **Le point le plus important de RME n'a pas de flux ouvert.** |
| Frontière (Ceuta, Tarajal) | Aucune source officielle d'attente trouvée | — | — | Seule la presse en parle (Bladi, Yabiladi) | Presse seulement (voir §3). |
| Actualité mondiale | **GDELT** | Gratuit, plus de 100 langues | **Oui, sans frais, avec citation du projet et lien** (WEB) | Mondiale | Utile pour **repérer** des sujets, pas pour des alertes fiables. |

## 3. Lecture média : ce que disent les conditions

| Sujet | Constat | Preuve |
|---|---|---|
| Flux RSS de presse | Le flux de France 24 ne contient **aucune condition d'usage** ; ses conditions sont à lire sur leur site (non lues). DW : page non accessible. Hespress, Médias24, Le360, MAP : non vérifiés. | WEB, UNKNOWN |
| Résumer un article par IA | Reprendre ou résumer des articles protégés pose une question de droit d'auteur et de droits voisins. Non tranché ici. | UNKNOWN : décision juridique |
| **Vidéo YouTube** | La politique développeur interdit de télécharger, mettre en cache ou stocker le contenu audiovisuel sans accord écrit, et de **séparer l'audio ou la vidéo**. Les données de l'API ne se gardent pas plus de 30 jours. **Extraire l'audio d'une vidéo YouTube pour le transcrire est donc interdit par ces règles.** Intégrer le lecteur ou donner le lien reste permis. | WEB |
| Podcasts et audio | Non vérifiés (les flux RSS de podcasts sont publics ; le droit de transcrire un contenu protégé est une autre question). | UNKNOWN |
| Transcription | Groq Whisper : 0,111 $ de l'heure (grand modèle) ou 0,04 $ (version rapide). Fichier de 25 Mo au plus sur l'offre gratuite. **Qualité en arabe et en darija : non testée.** Les conditions d'usage commercial de l'offre gratuite de Groq n'ont pas été relues dans cette mission. | WEB, UNKNOWN |
| Contenus envoyés par l'utilisateur | Données personnelles possibles : RGPD à instruire avant. | UNKNOWN |

Ordre de grandeur du coût de transcription, si c'est permis : 10 heures d'audio par jour à 0,04 $ l'heure, environ 12 $ par mois. Ce n'est pas le coût qui bloque, c'est le droit.

## 4. Ce que l'on peut dire de l'architecture proposée

Chaîne proposée : sources → collecte → déduplication → vérification → classification → pertinence pour l'itinéraire → alerte ou flux, avec les niveaux INFO, ALERTE, ACTION RECOMMANDÉE.

1. **Les sources structurées et officielles (DGT, Météo-France, trafic français non concédé) n'ont pas besoin de modèle de langage.** Elles sont déjà classées, localisées et datées. Elles se rattachent à `RouteEvent` et à son niveau de vérité existants.
2. **Là où RME en a le plus besoin (ferries, frontière, routes marocaines), il n'y a pas de source ouverte.** Le seul accès serait la presse ou les signalements d'utilisateurs, donc des informations de niveau de vérité bas, à étiqueter comme tels.
3. **La lecture média (articles, vidéo, audio) est la partie la plus risquée** : droits d'auteur, règles YouTube, qualité en darija. Elle est séparable du reste.
4. Un flux qui dit « rien à signaler » faute de source, alors qu'un ferry est annulé, est pire qu'une absence de flux. Chaque corridor doit afficher **ce qui est couvert et ce qui ne l'est pas**.

## 5. Expériences possibles (aucune n'est lancée)

| # | Hypothèse | Test | Mesure | Décision |
|---|---|---|---|---|
| E1 | Les flux officiels couvrent une part utile du trajet Paris → Algésiras → Tanger | Pour 5 itinéraires réels, compter les tronçons couverts par DGT, le trafic français non concédé et Météo-France | % du trajet couvert, retard moyen des données | KEEP si au moins la moitié du trajet européen est couverte, sinon REJECT |
| E2 | Le flux DGT filtré par trajet est assez léger pour un cache serveur | Appeler le flux toutes les 5 minutes pendant une journée, filtrer, mesurer le temps et la taille | Octets, temps d'exécution, erreurs | KEEP ou MODIFY |
| E3 | La presse signale les perturbations de ferry et de frontière avant les opérateurs | Relever à la main, une semaine, les sujets « ferry Tanger » et « frontière Ceuta » dans GDELT | Nombre d'événements, délai par rapport aux faits | Si le signal est faible : REJECT l'idée |
| E4 | Les signalements d'utilisateurs peuvent remplacer l'absence de source ferry | Tester auprès des 5 premiers utilisateurs du Lab | Nombre de signalements, justesse | Après un premier signal commercial seulement |
| E5 | La transcription de contenus audio de droits libres (pas YouTube) est utile en darija | Tester 5 extraits | Taux d'erreur sur les noms de lieux | Seulement si E3 montre un besoin |

## 6. Points qui ne dépendent pas de l'outil

- **NewsFeed daté** : à corriger indépendamment (retirer, ou dater clairement).
- **Décision juridique** avant tout résumé d'articles ou transcription de contenus protégés.
- **Aucune promesse commerciale** : « passer plus de temps dans l'application » est un objectif, pas un résultat mesuré.
