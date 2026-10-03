# Competitive Gap — RME Voyage
## Audit du 3 octobre 2026

### Objet

Ce document verrouille une conclusion importante de l'audit produit : RME ne peut plus présenter comme différenciation suffisante le simple assemblage « MRE + route + ferry + carburant + hors-ligne + convoi + OCR ».

Des produits concurrents et des outils officiels couvrent déjà une partie substantielle de ce terrain. La différenciation de RME doit donc porter sur **la manière dont le produit orchestre le parcours et aide une personne à décider de la prochaine action**, et non sur la possession isolée de ces fonctionnalités.

---

## 1. Concurrents / références vérifiés

### Tariq — Route, Ferry, Bled

Tariq est une application mobile explicitement conçue pour la diaspora marocaine qui rentre au Maroc en voiture.

Fonctionnalités déclarées dans ses fiches App Store / Google Play :
- itinéraires Europe → ports espagnols ;
- budget ferry + hôtels + carburant + péages ;
- temps d'attente ferry communautaires ;
- hôtels orientés MRE ;
- prix carburant ;
- aide hors-ligne ;
- convoi entre familles ;
- OCR / formulaire d'entrée dans les versions récentes ;
- affiliation Booking.com.

Sources :
- Google Play : https://play.google.com/store/apps/details?id=app.tariq
- App Store : https://apps.apple.com/ma/app/tariq-route-ferry-bled/id6773486682

**Conséquence RME :** ces fonctionnalités ne doivent pas être présentées comme uniques ou comme un moat à elles seules.

### Tanger Med Passenger Journey

Tanger Med propose officiellement une application passager avec notamment :
- départs / arrivées en temps réel ;
- réservation / suivi du trajet ;
- carte d'embarquement ;
- notifications ;
- navigation dans le port ;
- services à proximité ;
- assistance/remorquage ;
- prévisions de trafic portuaire.

Source officielle :
https://www.tangermed.ma/fr/nouvelle-version-de-la-solution-mobile-passagers-tanger-med-passenger-journey/

**Conséquence RME :** RME ne doit pas essayer de devenir simplement « l'app Tanger Med améliorée ». Sa valeur doit couvrir le parcours avant le port et les transitions entre services, avec une couche d'orchestration indépendante d'un opérateur.

### Trekna

Trekna se positionne publiquement comme un copilote Europe → Maroc pour MRE, avec :
- avion, voiture, train et ferry ;
- comparaison de modes ;
- budget ;
- trafic des ports ;
- communauté ;
- assistant IA ;
- informations douanières et de parcours.

Source publique :
https://www.trekna.com/

Les métriques et témoignages affichés sur le site sont des déclarations du site lui-même et ne constituent pas une mesure indépendante de traction.

**Conséquence RME :** « multimodal + IA + communauté + ports » ne suffit pas non plus à définir une différenciation défendable.

---

## 2. Positionnement à tester

### RME = couche d'exploitation humaine du voyage Europe ↔ Maroc

Hypothèse de positionnement :

> **RME ne demande pas à l'utilisateur de comprendre toute la logistique du voyage. Il comprend l'état du trajet, montre ce qui est important maintenant, explique pourquoi, puis laisse la personne confirmer l'action.**

Le produit doit rester centré sur :
1. **Contexte** — où en est le voyage ?
2. **Transition** — quelle étape critique arrive ?
3. **Décision** — quelle est la prochaine action utile ?
4. **Preuve** — d'où vient l'information et à quelle date a-t-elle été vérifiée ?
5. **Contrôle humain** — aucune action sensible n'est exécutée sans validation.
6. **Continuité familiale** — partager l'état utile du voyage sans obliger toute la famille à installer l'application.

Ce positionnement est une **hypothèse stratégique**, pas une preuve d'originalité juridique ou de supériorité commerciale.

---

## 3. Ce que RME ne doit pas faire

- Ne pas revendiquer « premier » ou « unique » sans preuve.
- Ne pas copier Tariq fonctionnalité par fonctionnalité.
- Ne pas reconstruire les fonctions déjà fournies directement par Tanger Med lorsque leur valeur est essentiellement portuaire.
- Ne pas faire de « chatbot IA » la surface principale.
- Ne pas générer de documents administratifs officiels non homologués.
- Ne pas inventer de disponibilité, prix, attente, commission ou procédure.
- Ne pas automatiser une réservation ou un paiement sans confirmation explicite.
- Ne pas lancer une architecture lourde avant d'avoir mesuré l'usage réel.

---

## 4. Axe produit à construire

### Dynamic Canvas humain

Une seule surface principale doit répondre à :

**« Qu'est-ce qui compte maintenant ? »**

Exemples de sorties, selon les faits réellement disponibles :
- « Votre ferry est à telle heure. Il reste X temps estimé avant l'embarquement. »
- « Vous approchez du port. Vérifiez votre billet avant de continuer. »
- « Information officielle : voici la procédure publiée par l'autorité. »
- « Donnée communautaire : attente signalée il y a X minutes. »
- « Donnée insuffisante pour décider : vérifiez avant de changer votre plan. »

La formulation doit toujours distinguer **fait, source, inférence et inconnue**.

### Bridge Mode

Le mode spécialisé Europe → port → ferry → arrivée Maroc reste pertinent comme couche de transition.

Mais son rôle n'est pas de devenir un deuxième GPS. Il doit coordonner :
- état du trajet ;
- billet / départ ;
- informations portuaires disponibles ;
- documents et sources officielles ;
- connectivité ;
- pack hors-ligne minimal ;
- partage familial ;
- aide / urgence ;
- actions partenaires pertinentes.

---

## 5. Moat à rechercher

Le moat potentiel n'est pas une liste de fonctionnalités.

Il pourrait venir de la combinaison suivante, si elle est réellement utilisée et mesurée :

**historique contextuel + qualité/provenance des sources + modèles de transition + signaux communautaires + orchestration multimodale + confiance utilisateur.**

Toute prétention de moat doit rester une hypothèse jusqu'à preuve par :
- usage ;
- rétention ;
- résolution d'intentions ;
- précision des alertes ;
- temps gagné ;
- conversion partenaire ;
- données historiques propriétaires produites par l'usage.

---

## 6. IP / brevet

Un axe technique à examiner séparément :

> orchestration d'une transition de voyage à partir d'un graphe de sources vérifiées, d'un état contextuel, d'un niveau d'incertitude et d'une sélection de prochaine action soumise à confirmation humaine.

Ce texte **ne constitue pas une revendication de brevetabilité**.

Avant toute dépense ou dépôt :
1. recherche d'antériorités ;
2. définition précise du problème technique ;
3. description de l'implémentation réellement nouvelle ;
4. analyse juridique par conseil en propriété industrielle si l'enjeu le justifie.

---

## 7. Décision produit pour la suite

Le MVP ne doit pas chercher à gagner par le nombre de fonctions.

Priorité :
1. **Accueil humain + Dynamic Canvas**
2. **Trip state fiable**
3. **Bridge Mode**
4. **Provenance / confiance lisible**
5. **Partage familial**
6. **Actions partenaires contextualisées**
7. **Mesure de la valeur réelle**

Les fonctions déjà présentes chez les concurrents peuvent rester si elles sont utiles à l'expérience, mais elles ne doivent plus être présentées comme la preuve de différenciation.

### Règle

> **RME doit être reconnaissable à la qualité de la décision qu'il aide à prendre, pas à la quantité de boutons qu'il possède.**
