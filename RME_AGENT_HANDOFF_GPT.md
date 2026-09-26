# RME Voyage — Agent Handoff / Knowledge Base

> Document de passation entre agents IA.
> Dernière vérification : 2026-09-26.
> Ce document ne constitue pas une preuve de déploiement : GitHub/Vercel restent les sources de vérité.

## 0. Règle absolue : preuve avant affirmation

Aucun agent ne doit annoncer qu'une modification est « faite », « corrigée », « déployée », « validée » ou « terminée » sans preuve vérifiable.

Pour toute affirmation technique importante, conserver autant que possible :

`fichier → composant/fonction → commit/PR → test → résultat`

États autorisés :

- **VERIFIED** : preuve disponible dans le dépôt, GitHub, un test ou un résultat d'exécution.
- **PROPOSED** : proposition non encore vérifiée.
- **UNVERIFIED** : information rapportée mais non confirmée.
- **REJECTED** : hypothèse ou proposition vérifiée puis écartée.

Ne jamais transformer une hypothèse en fait.

---

## 1. Source de vérité actuelle

Repository :

- GitHub : https://github.com/maissanebenaili-afk/rme-voyage
- Branche de production de référence : `main`
- Production annoncée : https://rme-route.vercel.app

Au moment de cette vérification, le commit le plus récent observé sur `main` est :

- `cbe7ea2896b6f19382d005da8cccb8c8737602ea`
- `fix(a11y): white text on emerald buttons reaches AA (#144)`
- 2026-09-26

Ne pas utiliser un ancien SHA comme état actuel sans le revérifier.

---

## 2. Historique récent vérifié

### #140 — accessibilité / contraste

Commit :
`badda5b01aff97038fc3bc03ca4336478b0909a6`

Travail décrit dans le commit :
- labels de formulaires reliés aux contrôles ;
- corrections de contraste sur plusieurs pages ;
- les violations restantes de la home étaient concentrées dans SportsHub, FaicalWidget et TVWidget.

### #141 — performance fonts

Commit :
`f60716f749954149b18e59c0058f093de0c46ea0`

Travail décrit :
- suppression du preload global inutile d'Inter et Amiri ;
- mesure rapportée sur `/trajet/paris-tanger` : 316 KB → 56 KB de fonts téléchargées.

### #142 — mobile / splash

Commit :
`4e114d5bec6e979e2e642d05b5350b82b26bad19`

Travail décrit :
- suppression du double splash dans l'application Capacitor ;
- correction des zones tactiles trop petites ;
- audit Chromium mobile rapporté sans cibles sous-dimensionnées sur `/` et `/trajet/paris-tanger`.

### #143 — sécurité API

Commit :
`3e7a53231ef08bf9f47585b43a428ee8625f292a`

Travail décrit :
- rate limiting ajouté à `/api/newsletter`, `/api/remittance` et `/api/partners`.

### #144 — contraste boutons

Commit :
`cbe7ea2896b6f19382d005da8cccb8c8737602ea`

Travail décrit :
- contraste AA corrigé sur plusieurs boutons/éléments emerald ;
- le commit indique que les violations de contraste de la home sont passées de 12 à 10 ;
- les 10 restantes sont indiquées comme étant dans SportsHub, FaicalWidget et TVWidget, fichiers laissés à l'autre périmètre de travail.

Important : le nombre « 10 violations axe » n'est pas équivalent au nombre d'occurrences CSS. Ne pas les confondre.

---

## 3. Splash screen — état vérifié

Fichier :

`components/SplashScreen.tsx`

Constats vérifiés sur `main` :

- `HOLD_MS = 1500` pour le splash web.
- Le composant importe `Capacitor`.
- Il calcule `const nativeApp = Capacitor.isNativePlatform()`.
- Si `nativeApp` est vrai, le splash web est ignoré.
- Le commentaire du composant précise que le splash natif Android/iOS est déjà affiché et qu'un second splash web ne doit pas être enchaîné.
- `prefers-reduced-motion` est également respecté.
- `sessionStorage` évite de rejouer le splash à chaque navigation dans la même session.

### Décision

**VERIFIED / DÉJÀ TRAITÉ.**

Ne pas remplacer cette logique par une détection User-Agent sans preuve d'un problème réel.

La proposition « détecter globalement le WebView par User-Agent pour masquer le splash » est donc **REJECTED comme correction de remplacement** : la détection native Capacitor existe déjà et est plus directement liée au contexte d'exécution natif.

Attention à la distinction :
- splash web : 1,5 s ;
- historique #142 : le splash natif Capacitor était annoncé comme 2 s ;
- le problème traité était le double enchaînement, pas simplement « un splash de 2 secondes ».

---

## 4. Widgets GPT — état actuel de main

Chemins réels :

- `components/SportsHub.tsx`
- `components/TVWidget.tsx`
- `components/FaicalWidget.tsx`

Il n'existe pas, dans l'état vérifié, de chemin de référence du type :

- `components/widgets/SportsHub/...`
- `components/widgets/TVWidget/...`
- `components/widgets/FaicalWidget/...`

Ne pas inventer ces chemins.

### Occurrences ciblées par le travail GPT

Sur `main`, recherche exacte des classes `text-white/40`, `text-white/50`, `text-white/60` :

- SportsHub : **8 occurrences**
- FaicalWidget : **7 occurrences**
- TVWidget : **0 occurrence** de ces trois motifs exacts

Total ciblé par le garde-fou GPT : **15 occurrences CSS**, et non « 12 ».

Ce chiffre de 15 est un comptage d'occurrences de classes ; il ne doit pas être présenté comme le nombre de violations axe.

---

## 5. PR #145 — travail GPT déjà réalisé

PR :

https://github.com/maissanebenaili-afk/rme-voyage/pull/145

Titre :
`a11y: restore contrast in GPT widgets`

État vérifié :

- **OPEN**
- **NOT MERGED**
- head : `codex/gpt-a11y-widgets`
- head SHA : `987d51806dbec2cd4e74c1ee41b9c6a378359992`
- base : `main`
- base SHA au moment de la création : `3e7a53231ef08bf9f47585b43a428ee8625f292a`
- 4 commits
- 3 fichiers modifiés
- 32 additions / 14 deletions

La PR :
- remplace les occurrences ciblées de faible opacité dans SportsHub et FaicalWidget par `text-slate-300` ;
- ne modifie pas TVWidget pour ce garde-fou précis ;
- ajoute `__tests__/gptWidgetsContrast.test.ts`.

Test ajouté :

`__tests__/gptWidgetsContrast.test.ts`

Le test lit :
- `components/SportsHub.tsx`
- `components/TVWidget.tsx`
- `components/FaicalWidget.tsx`

et rejette la réintroduction de :

`text-white/40`
`text-white/50`
`text-white/60`

### Validation importante

La PR n'est **pas** une preuve que `main` contient ces corrections.

La branche PR est également basée sur un ancien état de `main` et doit être revalidée avant merge.

---

## 6. Vercel — état à ne pas confondre avec GitHub

Un déploiement Vercel associé au travail GPT a été observé comme :

**CANCELED**

Il ne constitue donc pas une validation de production.

Conséquence :
- ne pas dire « déployé en production » ;
- ne pas dire « validé par Vercel » ;
- si un nouveau déploiement est nécessaire, vérifier son statut réel avant de conclure.

---

## 7. eSIM / monétisation — éviter les conclusions inventées

Le dépôt contient bien une entrée catalogue :

`lib/partnerCatalogue.ts`

avec notamment :

- `id: "esim-morocco"`
- `name: "eSIM Morocco"`
- catégorie `esim`
- URL publique `https://esimmorocco.org/`

Le README mentionne également eSIM.

Mais `MONETISATION.md` contient une ligne indiquant :

« Hôtels, eSIM, assurance, location voiture » → pas de code / non explorés dans ce dépôt à ce jour.

### Interprétation correcte

Il existe une **présence de catalogue / intention partenaire eSIM**, mais cela ne prouve pas qu'un tunnel eSIM complet, mesuré et opérationnel existe.

Inversement, il est incorrect d'affirmer comme un fait que « le stream eSIM est définitivement gelé » si aucune décision formelle ne le documente.

État recommandé :

**UNVERIFIED / STRATEGIC DECISION REQUIRED**

Ne pas modifier ou supprimer ce périmètre uniquement sur la base d'une affirmation d'agent.

---

## 8. Monétisation — ne pas réduire artificiellement le projet à un seul levier

Le dépôt contient plusieurs surfaces commerciales ou partenaires.

Exemples observés :
- catalogue de partenaires ;
- comparateur/partenaires ;
- immobilier Taza ;
- boutique/caf­tan ;
- newsletter ;
- Hadak ;
- autres surfaces décrites dans `MONETISATION.md`.

La formule « unique commercial conversion vector » ne doit donc pas être présentée comme un fait du dépôt.

On peut choisir **un parcours prioritaire de QA**, mais cela reste une décision de priorisation, pas une propriété technique du produit.

---

## 9. Méthode de travail à émuler

Pour toute tâche reçue :

### Étape A — établir le réel
1. Inspecter `main` ou la branche explicitement demandée.
2. Vérifier le chemin exact du fichier.
3. Lire le code actuel.
4. Rechercher les occurrences concernées.
5. Identifier le commit/PR pertinent.

### Étape B — comparer à l'affirmation
Classer chaque affirmation :

- VERIFIED
- PROPOSED
- UNVERIFIED
- REJECTED

### Étape C — modifier seulement si nécessaire
Ne pas refaire une correction déjà présente.
Ne pas corriger un problème imaginaire.
Ne pas élargir le scope sans justification.

### Étape D — tester
Quand le changement est codé :
- test ciblé ;
- lint/typecheck/test pertinent ;
- inspection du diff ;
- vérification de la branche et du commit ;
- validation du déploiement seulement si un déploiement réel a réussi.

### Étape E — transmettre
Chaque compte-rendu doit séparer :

**FAITS**
- ce qui a été vérifié.

**CHANGEMENTS**
- ce qui a réellement été modifié.

**PREUVES**
- commit / PR / test / résultat.

**RESTANT**
- ce qui n'est pas encore validé.

**RISQUES**
- ce qui pourrait encore casser.

---

## 10. Règle anti-régression inter-agents

GPT et Claude peuvent travailler sur des périmètres différents.

Cela ne signifie pas que leurs affirmations sont automatiquement correctes.

Avant d'utiliser le travail d'un autre agent :

1. vérifier la branche ;
2. vérifier le commit ;
3. vérifier le fichier ;
4. vérifier que le changement est effectivement présent ;
5. vérifier que le changement n'a pas été annulé par une modification ultérieure ;
6. vérifier le résultat de test.

Une PR ouverte n'est pas un changement intégré.

Un commit n'est pas automatiquement un déploiement.

Un déploiement « Ready » n'est pas automatiquement une validation fonctionnelle complète.

Un rapport d'agent n'est pas une preuve.

---

## 11. Ce que Claude doit exploiter de ce document

Claude peut utiliser ce fichier comme **contexte de passation**, mais doit toujours revalider les éléments susceptibles d'avoir changé.

En particulier, avant une nouvelle intervention :

- rechecker `main` ;
- rechecker PR #145 ;
- rechecker les trois widgets ;
- rechecker `SplashScreen.tsx` ;
- rechecker les statuts Vercel si le déploiement est concerné.

Ne pas supposer que ce document reste éternellement à jour.

---

## 12. Scope GPT actuellement recommandé

### Priorité immédiate

Finaliser proprement le périmètre d'accessibilité des widgets GPT sans toucher au splash déjà traité.

### Hors scope sauf preuve nouvelle

- remplacement du mécanisme Capacitor par User-Agent ;
- refonte du tunnel eSIM ;
- suppression de partenaires existants ;
- refonte commerciale générale ;
- modification de production sans validation.

### Condition de sortie

Le périmètre contrast des widgets n'est considéré comme terminé que lorsque :

1. le changement est intégré dans une branche cible explicite ;
2. le test de régression passe ;
3. le diff est inspecté ;
4. le statut GitHub de la PR est connu ;
5. le déploiement, s'il est demandé, est réellement réussi ;
6. une validation fonctionnelle adaptée confirme l'absence de régression.

---

## 13. Checklist de compte-rendu

Utiliser ce format court :

```
STATUS: VERIFIED / PARTIAL / BLOCKED

FACTS:
- ...

CHANGES:
- ...

PROOF:
- file:
- commit:
- PR:
- test:
- deployment:

NOT VERIFIED:
- ...

NEXT:
- ...
```

---

## 14. Principe directeur

**RME doit avancer vite, mais aucune vitesse ne justifie une affirmation non prouvée.**

Le rôle de l'agent n'est pas de produire le plus de modifications possible.

Le rôle est de produire **le minimum de changements nécessaires, vérifiables, réversibles et compatibles avec le travail des autres agents**, puis de transmettre une information exploitable sans ambiguïté.
