# Faire entrer de vrais établissements dans RME Voyage

But : une base de vrais commerces sur la route (stations, restaurants, hôtels,
garages, traiteurs), **avec leur accord**, puis des abonnements.

## Ce qui existe aujourd'hui

- `lib/etablissements.ts` : la base. Chaque fiche a une source publique et une
  date de vérification. 9 candidats y sont, **jamais affichés** sur le site.
- `/pro/demo/[categorie]` : 5 maquettes à montrer aux commerçants
  (`station-service`, `restaurant`, `hotel`, `garage`, `traiteur`), avec un
  établissement fictif. Elles sont en ligne après la fusion de la PR.
- La liste d'appel `prospects-appel.csv` (hors dépôt : elle contient des
  numéros de téléphone d'entreprises).

## Les 3 statuts (mêmes règles que `lib/listings.ts`)

| Statut | Sens | Affiché sur le site ? |
|---|---|---|
| CANDIDATE | repéré dans une source publique, jamais contacté | Non |
| REFERENCED | accord écrit de l'établissement, gratuit | Oui |
| PARTNER | accord commercial écrit | Oui |

Pour passer à REFERENCED : une **preuve écrite** (réponse par mail ou message
WhatsApp). On la copie dans le champ `accord` de la fiche. Sans preuve, le
test du dépôt refuse la fiche.

## Ce qu'on peut dire, honnêtement

À dire :
- « RME Voyage est un nouveau portail pour les familles qui voyagent entre
  l'Europe et le Maroc. On prépare des fiches d'établissements sur la route. »
- « On vous montre une maquette. On ne publie rien sans votre accord écrit. »
- « Le référencement de lancement est gratuit. Plus tard, une formule payante
  (à partir de 20 € par mois) pourra être proposée, annoncée à l'avance, sans
  engagement. »

À ne pas dire, parce que ce n'est pas vrai aujourd'hui :
- un nombre de visiteurs ou de clients,
- que le site apporte des clients,
- qu'il y a déjà un abonnement ou une facturation : rien de tout cela n'est
  construit (voir `docs/MONETISATION_SURFACES.md`).

Pour encaisser un jour : un compte Stripe (identité et IBAN, à ouvrir par
toi), un lien de paiement, une facture. Tant que ce n'est pas prêt, on
reste sur du gratuit : c'est ce qui permet de remplir la base.

## Appel (1 minute)

« Bonjour, je m'appelle Tarek, de RME Voyage. C'est un portail pour les
familles qui font la route Europe–Maroc. On prépare des fiches pour les
[restaurants / garages / hôtels / stations] sur le trajet. Je peux vous
envoyer une maquette par WhatsApp ou par mail ? Vous regardez, et si ça vous
plaît, on met votre fiche, gratuitement au début. Rien ne se publie sans
votre accord. »

Si oui : envoyer le lien `https://rme-voyage.netlify.app/pro/demo/<categorie>`
et demander la réponse écrite « J'accepte d'apparaître sur RME Voyage ».

En espagnol : « Hola, soy Tarek, de RME Voyage, un portal para las familias
que viajan entre Europa y Marruecos. Preparamos fichas de [restaurantes /
talleres / hoteles] en la ruta. ¿Le puedo enviar una maqueta por WhatsApp?
No se publica nada sin su permiso por escrito. »

## E-mail modèle (si tu as une adresse professionnelle publiée par l'entreprise)

Objet : Votre établissement sur RME Voyage (maquette)

> Bonjour,
>
> Je vous écris car votre établissement [nom] est sur la route des familles
> qui voyagent entre l'Europe et le Maroc. RME Voyage est un nouveau portail
> pour préparer ce voyage. Nous préparons des fiches d'établissements.
>
> Voici une maquette (exemple fictif) : https://rme-voyage.netlify.app/pro/demo/[categorie]
>
> Nous ne publions rien sans votre accord écrit. Le référencement de
> lancement est gratuit ; une formule payante pourra être proposée plus tard,
> sans engagement.
>
> Si vous êtes d'accord, répondez simplement « J'accepte d'apparaître sur RME
> Voyage ». Si vous ne souhaitez pas être contacté, répondez « Non » : nous ne
> vous écrirons plus.
>
> Tarek, RME Voyage — [adresse de contact]
> Votre adresse nous vient de votre fiche publique : [lien de la source].

## Règles à respecter (pour ne pas avoir de problème)

- **Un seul message, pas de relance en rafale.** Si la réponse est « non »,
  on note et on n'écrit plus.
- En **France**, écrire à une adresse professionnelle d'entreprise est permis
  pour une offre en rapport avec son activité, si on se présente, qu'on dit
  d'où vient l'adresse et qu'on permet de refuser. Pour un **entrepreneur
  individuel**, il faut son accord avant : on l'appelle d'abord.
- En **Espagne** et au **Maroc**, il faut l'accord préalable : on **téléphone
  d'abord**, puis on envoie la maquette sur demande.
- Ne jamais envoyer à des adresses achetées ou copiées en masse.
- Garder la preuve : date, nom, réponse.

## Où chercher les prochains établissements

- Les sites d'avis et les annuaires donnent nom et adresse (c'est ce qui est
  dans la base). Le téléphone se trouve sur la fiche Google Maps : la liste
  d'appel contient un lien direct par établissement.
- Pour les stations : la recherche du site utilise déjà OpenStreetMap
  (`lib/servicesSearch.ts`). On peut en tirer une liste de candidats par ville.
- Ajouter une ligne dans `lib/etablissements.ts` (avec la source), lancer
  `npm test`. Le test refuse une fiche sans source ou sans accord.

## Suivi

La colonne « réponse » de la liste d'appel : `à appeler` → `maquette envoyée`
→ `accord reçu` → on copie la preuve dans la fiche et on passe à REFERENCED.

## L'idée qui peut rapporter le plus : payer à la visite, pas à l'abonnement

Les gros établissements (chaînes d'hôtels, de restaurants, de stations) ne
paient pas 20 € par mois pour un site sans audience prouvée. Ils paient quand
on leur amène un client. Donc : **« Bon Route »**.

1. La famille prépare son trajet sur RME Voyage. Pour chaque pause (voir
   « Vos pauses avec les enfants » sur les pages trajet), le site propose un
   établissement partenaire avec un **code** à montrer sur place.
2. L'établissement ne paie **rien** par mois. Il verse un montant fixe
   convenu **par code utilisé** (une personne vient et montre son code).
3. Les familles ont une raison d'utiliser le site (un avantage), les gros ont
   une preuve de ce que le site leur rapporte, et RME n'est payé que si ça marche.

À construire pour que ce soit réel (rien de tout cela n'existe aujourd'hui) :
- une table Supabase des codes (famille, établissement, date, utilisé ou non) ;
- une page de validation pour l'établissement (saisir ou scanner le code) ;
- un accord écrit par établissement avec le montant par code ;
- la mesure : aujourd'hui, le site mesure les clics, pas les visites réelles.

Première étape sans code : proposer le principe à 3 ou 4 établissements de la
liste d'appel et voir s'ils acceptent un test d'un mois.

## Les plus gros leviers de revenus déjà prêts dans le code

Ils ne demandent pas d'établissements, seulement **tes comptes partenaires**
(voir `docs/MONETISATION_SURFACES.md`) : ferry (Direct Ferries), vols
(Travelpayouts), transferts d'argent (Wise, Remitly, WorldRemit). Tant que les
liens d'affiliation ne sont pas posés, ces boutons ne rapportent rien.
