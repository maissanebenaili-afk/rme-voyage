# ADMIN ACTION REQUIRED : ce que seul le propriétaire peut faire

Tout le reste est préparé dans le dépôt : projet Android API 36, icônes, bannière, captures, fiche, formulaire de sécurité des données, build automatique.
Aucune de ces actions ne demande de copier un secret dans une conversation.

## Hébergement : fait le 27/09/2026

- **Vercel a bloqué le compte** (« Account is blocked », HTTP 402).
  - Le plan Hobby est réservé à l'usage **personnel non commercial**, et Vercel compte la publicité et l'affiliation comme usage commercial.
  - L'email de Vercel donne la raison exacte.
- **RME est maintenant hébergé sur Netlify** (plan gratuit, usage commercial autorisé) : https://rme-voyage.netlify.app. L'app Android pointe vers cette adresse.
- **Clés IA : posées le 27/09/2026 par Claude, à la demande du propriétaire** : `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY` (Netlify → Environment variables).
  - Les 3 clés ont été testées directement chez chaque fournisseur, puis Hadak a répondu en production avec l'IA (`source: groq`).
  - Elles ne sont ni dans le dépôt, ni dans le code envoyé au navigateur : les 12 scripts de la page d'accueil ont été vérifiés.
  - Elles ont transité par la conversation. Plus tard, par sécurité : en régénérer de nouvelles chez Groq, Google AI Studio et OpenRouter, puis remplacer les valeurs dans Netlify.
- **NVIDIA NIM (build.nvidia.com) : ne pas ajouter de clé NVIDIA dans Netlify.** Selon les conditions de NVIDIA, l'accès gratuit est réservé aux tests et au développement ; l'utiliser pour les vrais utilisateurs est interdit sans licence payante (`docs/rme-lab/RADAR.md`, RAD-31).
- **Déjà réglé par Claude** : `AI_ROUTER_FREE_ONLY=true` sur Netlify. Ce n'est pas un secret, c'est un interrupteur : il bloque les fournisseurs IA payants de Hadak.
- **Protection anti-abus : active et observée le 27/09/2026 à 14 h UTC.**
  - Règle native Netlify : 8 requêtes / 60 s / IP sur `/api/hadak` et `/api/faical` (`netlify/edge-functions/`).
  - Test sur une seule connexion : 8 réponses normales, puis Netlify bloque lui-même (réponse 429 vide) jusqu'à la fin de la fenêtre de 60 s, puis tout redevient normal. Détails : `docs/lot-c/netlify-rate-limit-2026-09-27.txt` (Run 3).
  - Le compteur de `proxy.ts` reste en place et couvre les quelques secondes de délai avant que Netlify ne bloque.
  - Les deux essais précédents ne l'avaient pas vu : rafales trop courtes (moins que le délai d'environ 10 s de Netlify) et adresses IP différentes.

- **Mesure d'usage** : Netlify → Logs → Functions, filtres `rme-event` (clics partenaires, itinéraires), `hadak-intent` et `hadak-ledger`. Détails : `docs/MONTH1_METRICS.md`.

### Variables d'environnement (audit statique du 27/09/2026)

| Variable | Lue par | Sert à | Nécessaire ? | Côté | Si absente |
|---|---|---|---|---|---|
| `GROQ_API_KEY` | `lib/hadakAiRouter.ts` | Hadak et pronostics Faical (IA gratuite) | Recommandée | serveur | Hadak passe au fournisseur suivant |
| `GEMINI_API_KEY` | `lib/hadakAiRouter.ts` | Hadak (IA gratuite, secours) | Recommandée | serveur | idem |
| `OPENROUTER_API_KEY` | `lib/hadakAiRouter.ts` | Hadak (modèle `openrouter/free`) | Optionnelle | serveur | idem |
| `OPENAI_API_KEY` | `lib/hadakAiRouter.ts` | Hadak, **payant** | Non : bloqué par `AI_ROUTER_FREE_ONLY` | serveur | aucun effet |
| `ANTHROPIC_API_KEY` | `lib/hadakAiRouter.ts` | Hadak et Faical, **payant** | Non : bloqué par `AI_ROUTER_FREE_ONLY` | serveur | aucun effet |
| `AI_ROUTER_FREE_ONLY` | `lib/hadakAiRouter.ts` | Interrupteur « gratuit seulement » | **Oui, réglé à `true`** | serveur | les fournisseurs payants deviennent possibles |
| `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` | `app/api/newsletter/route.ts` | Inscription newsletter | Optionnelles | serveur | l'inscription n'est pas enregistrée |
| `STRIPE_SECRET_KEY` | `lib/stripe.ts` | Paiements (Soutenir) | Optionnelle | serveur | paiement indisponible |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `lib/supabase/*`, `proxy.ts` | Comptes, voyages, conseils | Optionnelles | client (publiques par nature) | mode sans compte ; `/api/trips` et `/api/tips` fermées en production |
| `NEXT_PUBLIC_APP_URL` | `lib/siteUrl.ts`, `proxy.ts` | Adresse canonique, CORS | Optionnelle | client | `https://rme-voyage.netlify.app` |
| `TRAVELPAYOUTS_FLIGHT_URL` | `lib/affiliate.ts`, `lib/partnerCatalogue.ts` | Lien affilié vols | Optionnelle | serveur | le lien vol n'est pas affiché |
| `NEXT_PUBLIC_CONTACT_EMAIL` | `lib/contact.ts` | Adresse de contact affichée | Optionnelle | client | valeur par défaut du code |
| `NEXT_PUBLIC_APP_DOWNLOAD_URL` | `app/telecharger/page.tsx` | Lien « Télécharger l'app » | Plus tard (lien Play Store) | client | page sans lien store |

- **Netlify est relié au dépôt GitHub depuis le 28/09/2026** : chaque fusion dans `main` est mise en ligne automatiquement (premier déploiement lié : commit `41f4f4a`). Une variable d'environnement modifiée n'est prise en compte qu'au déploiement suivant : Deploys → Trigger deploy → Deploy site.

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


### Lien vol pré-rempli Travelpayouts

Après validation du lien long réel du tableau de bord, remplacer uniquement l’adresse Aviasales encodée dans `u=` par `{url}`. Pour la preuve actuellement fournie : `https://tp.media/r?campaign_id=100&marker=775818&p=4114&trs=579104&u={url}`. Ne jamais ajouter de SubID ou de marqueur inventé.

## Partenaires et revenus : kit de mise en service

Inventaire complet des surfaces de revenus, conditions VERIFIED et modification minimale pour Airalo : `docs/MONETISATION_SURFACES.md`.

- Comptes d'affiliation : identité et RIB du propriétaire. Un lien partenaire n'est pas un secret : il peut être donné à Claude, qui le vérifie avant de le poser.
- **Valeur attendue : le lien complet copié depuis le tableau de bord du partenaire**, jamais un identifiant seul. Le code refuse un lien qui n'est pas en https ou qui pointe vers un autre domaine que ceux listés ; le bouton garde alors le lien public non affilié.

| Variable Netlify | Domaines acceptés par le code | Où le lien apparaît |
|---|---|---|
| `DIRECT_FERRIES_AFFILIATE_URL` | directferries.com / .fr, tp.media | bouton ferry (accueil, 56 pages `/trajet`) + comparatif |
| `GNV_AFFILIATE_URL`, `FRS_AFFILIATE_URL` | www.gnv.it, www.frs.es | bouton ferry si Direct Ferries n'est pas configuré |
| `TRAVELPAYOUTS_FLIGHT_URL` | tp.media, lien court `<marque>.tp.st`, www.aviasales.com, www.skyscanner.fr | bouton vol + comparatif |
| `TRAVELPAYOUTS_HOTEL_URL`, `TRAVELPAYOUTS_CAR_URL`, `TRAVELPAYOUTS_INSURANCE_URL` | tp.media, lien court `<marque>.tp.st` | comparatif partenaires |
| `ESIM_MOROCCO_AFFILIATE_URL` | esimmorocco.org **uniquement** | comparatif eSIM Morocco |\n| `AIRALO_AFFILIATE_URL`, `YESIM_AFFILIATE_URL`, `KKDAY_AFFILIATE_URL`, `KLOOK_AFFILIATE_URL` | tp.media, lien court `<marque>.tp.st` | comparatif partenaires eSIM et expériences ; sans variable, la carte reste « À activer » |
| `WISE_AFFILIATE_URL`, `REMITLY_AFFILIATE_URL`, `WORLDREMIT_AFFILIATE_URL`, `WESTERN_UNION_AFFILIATE_URL`, `MONEYGRAM_AFFILIATE_URL` | tout lien https | bouton « Envoyer » du comparateur de transferts |

Ordre : obtenir le lien → le faire vérifier → Netlify → Project configuration → Environment variables → Add a variable (portée Functions ou All scopes) → Trigger deploy.

Test après déploiement :
1. `https://rme-voyage.netlify.app/api/partners` : le partenaire passe en `"status": "active"` avec son lien.
2. `https://rme-voyage.netlify.app/api/affiliates?type=ferry&origin=Europe&destination=Maroc` renvoie `"configured": true` (idem `type=flight`).
3. Le bouton affiche « Lien affilié configuré » ; un clic produit une ligne `partner_click` dans Netlify → Logs → Functions (filtre `rme-event`).
4. La conversion n'est visible que dans le tableau de bord du partenaire.

Les paris sportifs (`UNIBET_…`, `BETCLIC_…`, `WINAMAX_…`, `BET365_AFFILIATE_URL`) restent hors activation : secteur régulé (ANJ), décision juridique du propriétaire d'abord.

## Google Search Console

1. https://search.google.com/search-console → Ajouter une propriété → **Préfixe d'URL** → `https://rme-voyage.netlify.app`.
2. Méthode **Balise HTML** : copier la balise affichée (entière, telle quelle).
3. Netlify → Environment variables → `GOOGLE_SITE_VERIFICATION` = la balise copiée (ou seulement le code entre guillemets), puis Trigger deploy.
4. Revenir dans Search Console → **Valider**, puis Sitemaps → `sitemap.xml`.

Le code (`lib/siteVerification.ts`) n'écrit dans la page qu'un code simple (lettres, chiffres, `-`, `_`) ; toute autre valeur est ignorée.

## Suivi des statuts (à mettre à jour, sans jamais anticiper)

| Plateforme | État |
|---|---|
| Google Play | TECHNICALLY READY (AAB API 36 construit, non signé). Non soumis |
| Apple App Store | Non préparé. Non soumis |
