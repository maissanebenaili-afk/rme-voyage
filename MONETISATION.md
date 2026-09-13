# RME Voyage — monétisation V1

## Principe

Ne jamais afficher un lien comme « affilié » ou « réservation » tant que les identifiants
du partenaire et le format d'URL ont été confirmés.

## Vols

Configurer :
`TRAVELPAYOUTS_PARTNER_ID`

Le backend construit ensuite le lien d'affiliation.

## Ferries

Configurer :
`DIRECT_FERRIES_PARTNER_ID`
`DIRECT_FERRIES_BASE_URL`

Le format exact de l'URL doit être remplacé par celui fourni dans le compte partenaire.
Aucun identifiant ou endpoint fictif n'est inclus.

## Revenus

Le produit peut ensuite mesurer :
- recherches ;
- clics vers partenaire ;
- route recherchée ;
- mode de transport ;
- marché MA/DZ/etc.

Ne stocker aucune donnée personnelle inutile et obtenir le consentement lorsque requis.
