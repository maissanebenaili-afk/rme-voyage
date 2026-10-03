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

**Gemini (offre gratuite) : troisième point, ajouté le 03/10/2026.** Condition des Gemini API Additional Terms, lues sur ai.google.dev le 03/10/2026 : « You may use only Paid Services when making API Clients available to users in the European Economic Area, Switzerland, or the United Kingdom », et les contenus envoyés servent à améliorer les produits Google. Le public de RME est en France. Fait vérifié : cette restriction existe. État de la clé `GEMINI_API_KEY` en production (offre gratuite ou payante) : UNKNOWN, à vérifier dans la console Google, hors dépôt. Tant que ce n'est pas tranché : soit retirer la clé (le routeur utilise les autres fournisseurs), soit passer le projet Google sur l'offre payante. Aucune de ces deux actions n'est requise par la séance d'activation, mais l'activation commerciale ne doit pas être accélérée avant.

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
| `ESIM_MOROCCO_AFFILIATE_URL` | esimmorocco.org **uniquement** | comparatif. Pour Airalo et Yesim, voir la ligne suivante |
| `AIRALO_AFFILIATE_URL`, `YESIM_AFFILIATE_URL`, `KKDAY_AFFILIATE_URL`, `KLOOK_AFFILIATE_URL` | tp.media, lien court `<marque>.tp.st` | comparatif partenaires (eSIM et expériences). Tant que la variable est absente, la carte reste « À activer » et pointe vers le site public, sans lien d'affiliation |
| `WISE_AFFILIATE_URL`, `REMITLY_AFFILIATE_URL`, `WORLDREMIT_AFFILIATE_URL`, `WESTERN_UNION_AFFILIATE_URL`, `MONEYGRAM_AFFILIATE_URL` | tout lien https | bouton « Envoyer » du comparateur de transferts |

Ordre : obtenir le lien → le faire vérifier → Netlify → Project configuration → Environment variables → Add a variable (portée Functions ou All scopes) → Trigger deploy.

Test après déploiement :
1. `https://rme-voyage.netlify.app/api/partners` : le partenaire passe en `"status": "active"` avec son lien.
2. `https://rme-voyage.netlify.app/api/affiliates?type=ferry&origin=Europe&destination=Maroc` renvoie `"configured": true` (idem `type=flight`).
3. Le bouton affiche « Lien affilié configuré » ; un clic produit une ligne `partner_click` dans Netlify → Logs → Functions (filtre `rme-event`).
4. La conversion n'est visible que dans le tableau de bord du partenaire.

Les paris sportifs (`UNIBET_…`, `BETCLIC_…`, `WINAMAX_…`, `BET365_AFFILIATE_URL`) restent hors activation : secteur régulé (ANJ), décision juridique du propriétaire d'abord.

## Séance unique d'activation : ordre, prérequis, vérifications

> Écrit le 03/10/2026 d'après le code de `main` et l'état public de la production. Aucune valeur secrète n'est écrite dans ce dépôt : seulement des noms et des formats. Ne poser une variable qu'une fois son prérequis rempli.

États à ne jamais confondre : **code présent ≠ partenaire approuvé ≠ lien actif ≠ clic ≠ conversion ≠ revenu.** Poser une variable fait passer un partenaire de « code présent » à « lien actif ». Cela ne prouve ni l'approbation du programme, ni un clic, ni une commission.

| Étape | Quoi | Prérequis | Vérification publique (aucun clic d'affiliation) |
|---|---|---|---|
| 0 | Quel code tourne en production ? **Non prouvé aujourd'hui** : indices d'un déploiement antérieur à `f2d4d0a` (voir l'étape 1) | aucun | Netlify → Deploys → « Published deploy » : le commit doit être celui de `main`, ou postérieur à `f2d4d0a` (« add safe Travelpayouts flight deep links »). Sinon : Trigger deploy, sans changer aucune variable, puis revérifier `/api/partners` (un seul actif : Travelpayouts Vols). Ne rien activer tant que ce point n'est pas tranché |
| 1 | Lien de vol pré-rempli | étape 0 ; `TRAVELPAYOUTS_FLIGHT_URL` déjà posée (elle reste le repli) | `/api/affiliates?type=flight&origin=Paris&destination=Tanger&date=<une date future>` doit contenir `"prefilled":true` et une adresse qui commence par `https://tp.media/r?` |
| 2 | Quatre partenaires : Airalo, Yesim, KKday, Klook | PR #207 fusionnée, puis étape 0 | `/api/partners` : chacun en `"status":"active"` avec son lien |
| 3 | Hôtels, voiture, assurance | étape 0 ; aucun code à fusionner | `/api/partners` : `travelpayouts-hotels`, `travelpayouts-car`, `travelpayouts-insurance` en `active` |
| 4 | Ferry | programme Direct Ferries non vérifié : ne pas le planifier avant d'avoir un lien | `/api/affiliates?type=ferry&origin=Europe&destination=Maroc` doit donner `"configured":true` |
| 5 | Search Console | section suivante | la page d'accueil contient `google-site-verification` |

Adresses de vérification : `https://rme-voyage.netlify.app` + le chemin du tableau. Elles ne déclenchent aucun clic d'affiliation. Ne cliquer ni acheter via ses propres liens pour « tester ».

### Étape 1 : `TRAVELPAYOUTS_FLIGHT_DEEPLINK_TEMPLATE`

- **Valeur :** le lien long de Travelpayouts (« Get full link » sur une recherche Aviasales), où l'adresse Aviasales est remplacée par `{url}`. Forme : `https://tp.media/r?campaign_id=<…>&marker=<…>&p=<…>&trs=<…>&u={url}`.
- **Le code l'accepte seulement si :** https, hôte `tp.media`, un seul `{url}`, placé comme valeur d'un paramètre de la requête. N'ajouter que ce qui figure dans le lien réel, jamais un identifiant de sous-compte inventé.
- **Si l'API ne renvoie pas `prefilled` :** le modèle est refusé (relire la forme), le déploiement n'a pas été refait (étape 0), ou la ville n'a pas d'aéroport connu (Meknès, Taza, Utrecht… : le lien générique reste, c'est normal).
- Cette variable concerne le code déjà dans `main` : elle ne dépend pas de la PR #207.
- **Constat du 03/10/2026 :** le code de `main` contenait ce pré-remplissage, mais l'API de production renvoyait encore le lien générique, sans `prefilled`. Cause non établie. Indice fort d'un déploiement ancien : le cache de la page d'accueil avait 20,7 heures à 18h25 UTC (stocké vers 21h45 UTC le 02/10), or Netlify vide le cache à chaque déploiement, et le commit `f2d4d0a` date du 03/10 à 02h37 (heure de Paris). Le commit réellement publié n'est pas lu ici : l'étape 0 le tranche. Après un nouveau déploiement, si `prefilled` manque encore, la variable est absente ou refusée.

### Étapes 2 et 3 : liens courts

- Valeur de chaque variable : le lien court `https://<marque>.tp.st/<code>` copié du tableau de bord Travelpayouts.
- Le code accepte n'importe quel lien `*.tp.st` : **vérifier à l'œil que la marque correspond** (le lien `airalo.tp.st` va dans `AIRALO_AFFILIATE_URL`, pas ailleurs).
- Un lien généré n'est pas une approbation : avant de compter un partenaire comme commercialement actif, vérifier dans Travelpayouts que le programme est connecté au compte RME. État au 03/10/2026 pour Airalo, KKday, Klook et Yesim : UNKNOWN.
- Les trois emplacements hôtels, voiture et assurance existent déjà dans le code et apparaissent « À activer » en production.

### Règles de séance

1. Un groupe à la fois : le vol (étape 1) seul ; puis hôtels, voiture, assurance ensemble ; puis les quatre liens de la PR #207 ensemble. Pour chaque groupe : poser, Trigger deploy, vérifier les adresses du tableau, noter le résultat. En cas d'anomalie, retirer la dernière variable posée.
2. Ne jamais coller une clé ou un secret (`STRIPE_SECRET_KEY`, `*_API_KEY`) dans le dépôt, une PR, une issue ou un message. Un lien d'affiliation n'est pas un secret.
3. Laisser `AI_ROUTER_FREE_ONLY=true` tant qu'aucun budget IA n'est décidé.
4. Ne pas toucher à `STRIPE_SECRET_KEY` sans décision explicite : elle active la page de dons.

### Journal d'activation (à remplir au fil des étapes, sans jamais anticiper)

| Date | Variable | Programme connecté au compte ? | Lien posé | Vérifié par l'API | Premier clic | Première conversion | Revenu confirmé |
|---|---|---|---|---|---|---|---|
| | | | | | | | |

### Toutes les variables lues par le code de `main` (03/10/2026)

| Domaine | Variables | Secret ? | Observé en production le 03/10/2026 |
|---|---|---|---|
| Vols | `TRAVELPAYOUTS_FLIGHT_URL` | non | posée : partenaire `active` |
| Vols pré-remplis | `TRAVELPAYOUTS_FLIGHT_DEEPLINK_TEMPLATE` | non | non observée (pas de `prefilled`) |
| Hôtels, voiture, assurance | `TRAVELPAYOUTS_HOTEL_URL`, `TRAVELPAYOUTS_CAR_URL`, `TRAVELPAYOUTS_INSURANCE_URL` | non | absentes : `pending` |
| Ferry | `DIRECT_FERRIES_AFFILIATE_URL`, `GNV_AFFILIATE_URL`, `FRS_AFFILIATE_URL` | non | Direct Ferries `pending` ; GNV et FRS non observables |
| eSIM et expériences | `ESIM_MOROCCO_AFFILIATE_URL`, `LOCK_AND_GOO_AFFILIATE_URL`, `STASH_AND_GO_AFFILIATE_URL`, `AJILI_AFFILIATE_URL`, `LGRIMA_AFFILIATE_URL` | non | absentes : `pending` |
| Nouveaux partenaires (PR #207) | `AIRALO_AFFILIATE_URL`, `YESIM_AFFILIATE_URL`, `KKDAY_AFFILIATE_URL`, `KLOOK_AFFILIATE_URL` | non | n'existent pas encore dans le code déployé |
| Transferts d'argent | `WISE_`, `REMITLY_`, `WORLDREMIT_`, `WESTERN_UNION_`, `MONEYGRAM_` + `AFFILIATE_URL` | non | non vérifié |
| Référencement | `GOOGLE_SITE_VERIFICATION` | non | absente (la page d'accueil ne contient pas la balise) |
| IA | `AI_ROUTER_FREE_ONLY` | non | `free_only: true` sur `/api/health` |
| IA, clés | `GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | **oui** | `/api/health` liste les cinq fournisseurs « AVAILABLE » sans dire quelles clés existent |
| Newsletter | `RESEND_API_KEY` (**secret**), `RESEND_AUDIENCE_ID` | clé : oui | non observé |
| Dons | `STRIPE_SECRET_KEY` | **oui** | non observé |
| Données | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publiques par conception | non observé |
| Publiques | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_APP_DOWNLOAD_URL` | non | non observé |

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
