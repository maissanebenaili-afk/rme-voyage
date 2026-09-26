# Google Play — formulaire « Sécurité des données »

Réponses établies à partir du code (inventaire du 26/09/2026). À relire si une
fonction qui envoie des données est ajoutée : la politique
`public/privacy-policy.html` et ce fichier doivent rester alignés
(`__tests__/privacyPolicy.test.ts` vérifie une partie de l'alignement).

URL de la politique : `https://rme-route.vercel.app/api/legal/privacy`

## Questions générales

| Question | Réponse |
|---|---|
| L'application collecte-t-elle ou partage-t-elle des données utilisateur ? | **Oui** |
| Toutes les données sont-elles chiffrées en transit ? | **Oui** (HTTPS partout) |
| Les utilisateurs peuvent-ils demander la suppression de leurs données ? | **Oui**, par e-mail (adresse développeur). Les données de voyage sont sur l'appareil : bouton « Effacer mon voyage ». |
| Création de compte | **Non** : aucun compte proposé. La section « suppression de compte » ne s'applique pas. |

## Types de données déclarés

« Collectée » = quitte l'appareil. Les données qui restent sur l'appareil
(voyage, checklist, réglages) ne sont **pas** à déclarer.

| Type Google | Collectée | Partagée | Facultative | Finalité | Détail |
|---|---|---|---|---|---|
| Position approximative / précise | Oui | Oui (Aladhan) | Oui | Fonctionnalités de l'app | Horaires de prière, seulement si l'utilisateur autorise la localisation. Pas de suivi en arrière-plan. |
| Messages dans l'app (autres contenus générés) | Oui | Oui (Groq / OpenAI / Anthropic) | Oui | Fonctionnalités de l'app | Questions à Hadak. Non conservées par RME. Traitement éphémère. |
| Enregistrements audio | **Non** | — | — | — | Dictée gérée par le système (Web Speech), l'audio ne transite pas par RME. Revoir si un plugin natif d'enregistrement est ajouté. |
| Adresse e-mail | Oui | Non (Resend = sous-traitant) | Oui | Communications | Lettre d'information, seulement sur inscription. |
| Informations de paiement | Non | — | — | — | Le paiement du don est saisi sur la page Stripe (hors application) : RME ne les collecte pas. |
| Interactions avec l'app / pages consultées | Oui | Non (Vercel = sous-traitant) | Non | Analyse | Vercel Web Analytics, sans cookie ni identifiant publicitaire. |
| Diagnostics / performances | Oui | Non | Non | Analyse | Vercel Speed Insights. |
| Autres infos (villes saisies pour l'itinéraire) | Oui | Non (traitées par nos serveurs, envoyées à OpenStreetMap/OSRM sans identifiant) | Oui | Fonctionnalités de l'app | Pas de lien avec une identité. |

Identifiant publicitaire (AD_ID) : **non utilisé**. Déclarer « Non » dans la
section « Identifiant publicitaire » et ne pas demander la permission
`com.google.android.gms.permission.AD_ID`.

## Autres déclarations Play Console

| Section | Réponse proposée |
|---|---|
| Contient des annonces | **À décider** : le bandeau livre (`components/BookAd.tsx`) promeut un produit vendu sur Amazon. Soit le masquer dans l'app native (réponse « Non »), soit répondre « Oui ». Les liens d'affiliation seuls ne sont pas des annonces. |
| Public cible | 18 ans et plus (paris sportifs masqués dans l'app native mais contenus voyage/argent destinés aux adultes). |
| Accès à l'application | Aucune connexion requise : « Toutes les fonctionnalités sont disponibles sans restriction ». |
| Application d'actualités | Non (le fil d'actualités est un complément). |
| Applications financières | Non (comparateur de transfert d'argent avec liens externes, pas de service financier). |
| Autorisation de localisation | Premier plan uniquement (`ACCESS_COARSE_LOCATION` / `ACCESS_FINE_LOCATION`), pas `ACCESS_BACKGROUND_LOCATION`. |
