# ADMIN ACTION REQUIRED : ce que seul le propriétaire peut faire

Tout le reste est préparé dans le dépôt : projet Android API 36, icônes, bannière, captures, fiche, formulaire de sécurité des données, build automatique.
Aucune de ces actions ne demande de copier un secret dans une conversation.

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
   - Politique de confidentialité : `https://rme-route.vercel.app/api/legal/privacy`.
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
