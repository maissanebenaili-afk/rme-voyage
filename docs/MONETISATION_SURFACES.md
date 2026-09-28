# Surfaces de monétisation : état réel (28/09/2026)

Relevé fait dans le code de `main` (`41f4f4a`). Il n'y a **aucune affiliation active** : aucune variable partenaire n'est confirmée dans Netlify.

Règles :
- une ligne passe à VERIFIED seulement quand les 4 conditions en fin de document sont remplies ;
- un domaine ou un programme non vérifié est marqué À VÉRIFIER, jamais supposé.

## Tableau

| Surface dans RME | Partenaire | État technique | Action propriétaire | Mesure existante | Blocage |
|---|---|---|---|---|---|
| Bouton ferry (accueil, 56 pages `/trajet`) + comparatif | Direct Ferries (`DIRECT_FERRIES_AFFILIATE_URL`) ; à défaut GNV, FRS | prêt : lien vérifié (https + domaine), repli sur le lien public | ouvrir le programme (voie d'accès À VÉRIFIER : direct ou via Travelpayouts), coller le lien | `partner_click` (product `ferry`, placement `booking_cards`) | compte partenaire |
| Bouton vol + comparatif | Travelpayouts (`TRAVELPAYOUTS_FLIGHT_URL`) | prêt (tp.media, lien court `<marque>.tp.st`, aviasales.com, skyscanner.fr) | compte Travelpayouts, choisir un programme vols, générer le lien | `partner_click` (product `flight`) | compte partenaire |
| Comparatif partenaires (accueil) | Travelpayouts hôtels / voiture / assurance (`TRAVELPAYOUTS_HOTEL_URL`, `_CAR_URL`, `_INSURANCE_URL`) | prêt (tp.media) | choisir un programme par produit dans Travelpayouts (programmes précis À VÉRIFIER), générer les liens | `partner_click` (placement du comparatif) | compte partenaire |
| Comparatif partenaires | eSIM Morocco (`ESIM_MOROCCO_AFFILIATE_URL`) | prêt pour esimmorocco.org **uniquement** | programme esimmorocco.org À VÉRIFIER ; pour Airalo, voir plus bas | `partner_click` | programme non vérifié |
| Comparatif partenaires | Lock & Gooo, Stash & Go (consignes), Ajili.ma, Lgrima | prêt (domaines .ma / .com du partenaire) | existence d'un programme d'affiliation À VÉRIFIER pour chacun | `partner_click` | programme non vérifié |
| Bouton « Envoyer » du comparateur de transferts | Wise, Remitly, WorldRemit, Western Union, MoneyGram (`*_AFFILIATE_URL`) | prêt : tout lien https accepté, `rel="sponsored"` seulement si configuré | ouvrir le programme (souvent via un réseau d'affiliation, À VÉRIFIER par prestataire) | `partner_click` (placement comparateur) + `remittance_result_viewed` | compte partenaire |
| Hub sport | Unibet, Betclic, Winamax, bet365 (`*_AFFILIATE_URL`) | code présent, masqué dans l'app mobile | **décision juridique** (jeux d'argent régulés par l'ANJ, publicité encadrée) | `partner_click` | juridique |
| `/taza-immobilier` | HiDOUR Immobilier (contact WhatsApp) | en ligne, contact direct | accord de commission hors code, À VÉRIFIER | aucune mesure du clic WhatsApp | accord commercial |
| `/marwa-caftan`, `/boutique` | Marwa Caftan (contact WhatsApp) | en ligne, contact direct | accord de commission hors code, À VÉRIFIER | aucune mesure du clic WhatsApp | accord commercial |
| `/soutenir` | Stripe, don (`STRIPE_SECRET_KEY`) | code prêt, désactivé sans clé | compte Stripe (identité, IBAN) ; la clé secrète se pose dans Netlify par le propriétaire uniquement | — | compte Stripe |
| Encart « Publicité » du livre | le livre de l'auteur | en ligne | aucune | — | — |

## Airalo (ou tout autre fournisseur eSIM) : modification minimale

Aujourd'hui, un lien Airalo serait refusé. Il faut une modification du code, à ne faire qu'**avec le vrai lien en main**, parce que le domaine exact dépend du lien fourni.
- **Voie Travelpayouts :** probablement `tp.media`, à confirmer sur le lien réel.
- **Voie directe :** probablement un domaine Airalo ou celui d'un réseau d'affiliation, À VÉRIFIER.

Étapes :
1. **Fichier `lib/partnerCatalogue.ts`**, entrée `id: "esim-morocco"` : soit la remplacer, soit ajouter une entrée `airalo`. On ne mélange jamais une marque avec le lien d'une autre.
2. **Champs de l'entrée :**
   - `name` : `"Airalo"` ;
   - `publicUrl` : la page publique officielle ;
   - `envVar` : `"AIRALO_AFFILIATE_URL"` ;
   - `allowedHosts` : le ou les domaines exacts lus dans le lien reçu, pas plus ;
   - `commissionNote` : la condition lue chez le partenaire.
3. **Test :** étendre `__tests__/partnerCatalogue.test.ts`. Un lien sur le domaine autorisé passe à `active`, un lien sur un autre domaine reste `pending`.
4. **Netlify :** variable `AIRALO_AFFILIATE_URL`, puis Trigger deploy, puis test n°1 ci-dessous.

## Search Console : chaîne complète

1. Google : propriété « Préfixe d'URL » `https://rme-voyage.netlify.app`, méthode « Balise HTML ».
2. Copier la balise entière.
3. Netlify : créer la variable `GOOGLE_SITE_VERIFICATION` avec cette balise, puis Trigger deploy.
4. Le HTML de la page d'accueil contient alors `<meta name="google-site-verification" content="…">`. Claude peut le vérifier.
5. Google : cliquer sur « Valider », puis ajouter `sitemap.xml` dans Sitemaps.

- Sans la variable, la page ne change pas : c'est vérifié sur l'aperçu de la PR #192.
- La valeur n'existe que chez Google. Personne ne peut la préparer à l'avance.

## Tests après déploiement (tout partenaire)

1. `https://rme-voyage.netlify.app/api/partners` : l'entrée passe à `"status": "active"` avec le lien.
2. Ferry et vol : `https://rme-voyage.netlify.app/api/affiliates?type=ferry&origin=Europe&destination=Maroc` renvoie `"configured": true` (même test avec `type=flight`).
3. Le bouton affiche « Lien affilié configuré ». Un clic crée une ligne `partner_click` dans Netlify → Logs → Functions, filtre `rme-event`.
4. Le clic apparaît dans le tableau de bord du partenaire. Le délai d'affichage est propre à chaque partenaire, À VÉRIFIER.

## Condition VERIFIED

Une affiliation est VERIFIED seulement si les 4 conditions sont réunies :
1. compte partenaire accepté ;
2. lien issu du tableau de bord ;
3. tests 1 à 3 réussis en production ;
4. au moins un clic visible côté partenaire.

Avant cela, son état est « configurée » au mieux, jamais « active ».

## Liens d'inscription

- **Travelpayouts :** https://www.travelpayouts.com, bouton d'inscription (gratuite, confirmée sur leur site le 28/09/2026). Les programmes disponibles (Airalo, Direct Ferries, hôtels, voitures, assurance) sont À VÉRIFIER dans le catalogue après connexion. Leur page publique ne les liste pas.
- **Direct Ferries, Airalo en direct :** pages d'affiliation non trouvées à une adresse vérifiable. Les rechercher depuis le pied de page de leur site ou dans le catalogue Travelpayouts, À VÉRIFIER.
