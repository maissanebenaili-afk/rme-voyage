# ADMIN ACTION REQUIRED : ce que seul le propriétaire peut faire

Tout le reste est préparé dans le dépôt : projet Android API 36, icônes, bannière, captures, fiche, formulaire de sécurité des données, build automatique.
Aucune de ces actions ne demande de copier un secret dans une conversation.

## Hébergement : fait le 27/09/2026

- **Vercel a bloqué le compte** (« Account is blocked », HTTP 402).
  - Le plan Hobby est réservé à l'usage **personnel non commercial**, et Vercel compte la publicité et l'affiliation comme usage commercial.
  - L'email de Vercel donne la raison exacte.
- **RME est maintenant hébergé sur Netlify** (plan gratuit, usage commercial autorisé) : https://rme-voyage.netlify.app. L'app Android pointe vers cette adresse.
- **À faire par le propriétaire (5 minutes)** : Netlify → rme-voyage → Project configuration → Environment variables.
  - Ajouter `GROQ_API_KEY` et `GEMINI_API_KEY`, puis relancer le déploiement.
  - Sans ces clés, Hadak répond seulement avec ses réponses locales.
- **Déjà réglé par Claude** : `AI_ROUTER_FREE_ONLY=true` sur Netlify. Ce n'est pas un secret, c'est un interrupteur : il bloque les fournisseurs IA payants de Hadak.
- **Protection anti-abus** : règle native Netlify déclarée (8 requêtes / 60 s / IP sur `/api/hadak` et `/api/faical`, `netlify/edge-functions/`) et déployée.
  - **Mais son effet n'a pas été observé** lors du test du 27/09/2026 (`docs/lot-c/netlify-rate-limit-2026-09-27.txt`).
  - Ce qui coupe réellement aujourd'hui, c'est le compteur de `proxy.ts`, et seulement sur une même instance (7 à 8 requêtes, puis 429).
  - Risque de coût actuel : faible, car `AI_ROUTER_FREE_ONLY=true` est réglé et aucune clé payante n'est posée.
  - À revérifier dans Netlify → Logs → Edge Functions (validation de la règle). Si la règle n'est pas validée, un compteur partagé (Netlify Blobs) serait l'étape suivante : IV-019.

### Variables d'environnement (audit statique du 27/09/2026)

| Variable | Lue par | Sert à | Nécessaire ? | Côté | Si absente |
|---|---|---|---|---|---|
| `GROQ_API_KEY` | `lib/hadakAiRouter.ts` | Hadak (IA gratuite) | Recommandée | serveur | Hadak passe au fournisseur suivant |
| `GEMINI_API_KEY` | `lib/hadakAiRouter.ts` | Hadak (IA gratuite, secours) | Recommandée | serveur | idem |
| `OPENROUTER_API_KEY` | `lib/hadakAiRouter.ts` | Hadak (modèle `openrouter/free`) | Optionnelle | serveur | idem |
| `OPENAI_API_KEY` | `lib/hadakAiRouter.ts` | Hadak, **payant** | Non : bloqué par `AI_ROUTER_FREE_ONLY` | serveur | aucun effet |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_API_CLE` | `lib/hadakAiRouter.ts`, `app/api/faical/route.ts` | Hadak (bloqué par FREE_ONLY) **et pronostics Faical**, **payant** | **Non recommandé** : Faical l'appelle directement, sans FREE_ONLY. Au plus 3 appels toutes les 6 h grâce au cache, `max_tokens` 120 | serveur | Faical affiche les matchs sans pronostic |
| `AI_ROUTER_FREE_ONLY` | `lib/hadakAiRouter.ts` | Interrupteur « gratuit seulement » | **Oui, réglé à `true`** | serveur | les fournisseurs payants deviennent possibles |
| `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` | `app/api/newsletter/route.ts` | Inscription newsletter | Optionnelles | serveur | l'inscription n'est pas enregistrée |
| `STRIPE_SECRET_KEY` | `lib/stripe.ts` | Paiements (Soutenir) | Optionnelle | serveur | paiement indisponible |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/*`, `proxy.ts` | Comptes, voyages, conseils | Optionnelles | client (publiques par nature) | mode sans compte ; `/api/trips` et `/api/tips` fermées en production |
| `NEXT_PUBLIC_APP_URL` | `lib/siteUrl.ts`, `proxy.ts` | Adresse canonique, CORS | Optionnelle | client | `https://rme-voyage.netlify.app` |
| `TRAVELPAYOUTS_FLIGHT_URL` | `lib/affiliate.ts`, `lib/partnerCatalogue.ts` | Lien affilié vols | Optionnelle | serveur | le lien vol n'est pas affiché |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `lib/contact.ts` | Adresse de contact affichée | Optionnelle | client | valeur par défaut du code |
| `NEXT_PUBLIC_APP_DOWNLOAD_URL` | `app/telecharger/page.tsx` | Lien « Télécharger l'app » | Plus tard (lien Play Store) | client | page sans lien store |

- **Optionnel** : relier Netlify au dépôt GitHub (Project configuration → Build & deploy → Link repository) pour un déploiement automatique à chaque fusion. Sinon Claude déploie après chaque fusion.

## Google Play : dans l'ordre

1. **Créer le compte développeur Google Play.**
   - Où : play.google.com/console/signup.
   - Il faut : une pièce d'identité, une carte bancaire (25 $ une fois), un téléphone.
   - Résultat : accès à la Play Console, après vérification d'identité par Google (quelques jours).
   - Choix à faire :
     - un compte **personnel** ouvert après le 13/11/2023 doit faire un **test fermé de 14 jours avec au moins 12 testeurs** avant de pouvoir publier en production ([règle Google](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)) ;
     - un compte **organisation** en est dispensé mais demande un numéro D-U-N-S.

2. **Créer la clé d'envoi**, une seule fois, sur un ordinateur avec Java ou Android Studio.
   ```
   keytool -genkeypair -v -keystore rme-upload.jks -alias rme-upload -keyalg RSA -keysize 2048 -validity 10000
   ```
   - Garder `rme-upload.jks` et ses mots de passe en lieu sûr : sans eux, plus aucune mise à jour possible.
   - Résultat : le fichier de clé.

3. **Donner la clé au build automatique.**
   - Où : GitHub → dépôt `rme-voyage` → Settings → Secrets and variables → Actions → *New repository secret*.
   - Il faut : 4 secrets.

     | Secret | Valeur |
     |---|---|
     | `RME_UPLOAD_KEYSTORE_BASE64` | résultat de `base64 -w0 rme-upload.jks` |
     | `RME_UPLOAD_KEYSTORE_PASSWORD` | mot de passe du keystore |
     | `RME_UPLOAD_KEY_ALIAS` | `rme-upload` |
     | `RME_UPLOAD_KEY_PASSWORD` | mot de passe de la clé |

   - Puis : Actions → *Android bundle* → *Run workflow*.
   - Résultat : un `app-release.aab` **signé** dans les Artifacts.

4. **Créer l'application dans la Play Console.**
   - Nom : RME Voyage. Langue : français. Type : application gratuite.
   - Tout le contenu est déjà prêt :
     - textes : `play-store-listing/listing.md` ;
     - visuels : `play-store-listing/assets/`.
   - Résultat : la fiche du store remplie.

5. **Remplir les déclarations de la Play Console.** Les réponses préparées sont dans `play-store-listing/data-safety.md` :
   - Sécurité des données.
   - Politique de confidentialité : `https://rme-voyage.netlify.app/api/legal/privacy`.
   - Accès à l'application : aucune connexion requise.
   - **Annonces : répondre « Oui »**, car l'app affiche un encart « Publicité » pour un livre.
   - Classification du contenu (questionnaire IARC).
   - Public cible : adultes.
   - Fonctionnalités financières : l'app **compare** des services de transfert d'argent sans en exécuter. Le propriétaire répond selon sa lecture.
   - Résultat : le tableau de bord n'affiche plus de tâche bloquante.

6. **Lancer le test fermé.**
   - Envoyer l'AAB signé dans *Test fermé*.
   - Ajouter au moins 12 testeurs (adresses Gmail de proches), qui l'installent et l'utilisent pendant 14 jours.
   - Résultat : l'accès à la production devient demandable.

7. **Demander l'accès à la production, puis publier.**
   - Résultat : l'application passe en examen, puis en ligne.

## Décision licences : avant toute monétisation (validation juridique)

Deux services gratuits utilisés par RME ne sont gratuits **que pour un usage non commercial** (voir `docs/rme-lab/RADAR.md`, RAD-24 et RAD-25) :

| Service | Condition | Où RME l'utilise |
|---|---|---|
| **Open-Meteo** | Gratuit si non commercial ; Open-Meteo cite « applis avec abonnement ou publicité » comme usage commercial | Météo |
| **Serveur de démonstration OSRM** | Usage « raisonnable et non commercial », 1 requête par seconde au plus, peut être retiré à tout moment | Calcul d'itinéraire (`/api/route`) |

RME affiche déjà une publicité (le livre) et des liens affiliés.

- Qualifier RME de commercial ou non : c'est une décision du propriétaire, pas du code.
- Si RME est commercial :
  - Open-Meteo : prendre son offre commerciale, ou changer de source météo. Tarif et source de remplacement : UNKNOWN, à vérifier.
  - Itinéraire : héberger son propre OSRM ou Valhalla, ce qui demande un serveur. Coût : UNKNOWN.
- En attendant, les deux restent en place, avec cache et attribution.

## Apple App Store

- Il faut : un compte Apple Developer (99 $/an), un Mac (ou un service de build macOS) et un iPhone de test.
- **Risque connu :** RME charge le site dans une coque native. Apple refuse les applications qui ne sont qu'un site web reconditionné (règle 4.2). Avant de payer, il faut décider si RME sort d'abord sur Android seulement (recommandé : coût nul après les 25 $).

## Partenaires et revenus (quand ce sera le moment)

- Comptes d'affiliation (ferry, vols, transferts) : identité et RIB du propriétaire. Donner ensuite l'identifiant partenaire, qui n'est pas un secret, pour que les liens soient branchés.

## Suivi des statuts (à mettre à jour, sans jamais anticiper)

| Plateforme | État |
|---|---|
| Google Play | TECHNICALLY READY (AAB API 36 construit, non signé). Non soumis |
| Apple App Store | Non préparé. Non soumis |
