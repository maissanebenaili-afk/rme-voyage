# Test des 5 personnes : « Dis-moi où tu vas, je te dis quoi faire maintenant »

Kit prêt à l'emploi. Il reprend et complète la spec « RME Magic Button — MVP Spec » (étape 4, « Test WOW », seuils GO et NO-GO) et le plan de PR #195. Il ne construit rien et ne change rien au produit.

Chaque ligne dit si elle est un fait vérifié ou une proposition. Rien ici n'est un résultat : aucune personne n'a encore été testée.

## 1. Hypothèse et règle d'arrêt

**Hypothèse à tester** : RME comprend où la personne en est de son voyage et lui donne la prochaine chose utile à faire.

**Ce qu'on ne teste pas** : la météo, les itinéraires, les ferries, l'information en continu. Ces sujets existent ailleurs (voir `COMPETITIVE_GAP`).

**Règle d'arrêt (proposition à valider par Tarek)**

| Résultat sur 5 personnes | Décision |
|---|---|
| Moins de 2 sur 5 comprennent spontanément la prochaine action | **Pivot immédiat** : on change l'écran ou l'idée, on ne rajoute rien |
| 2 ou 3 sur 5 | **Modifier puis retester** : chercher la cause dans les notes, corriger, refaire 5 personnes |
| 4 ou 5 sur 5 | **GO pour l'étape suivante** (branchement), pas pour un lancement |

Le seuil « moins de 2 sur 5 » vient de Tarek. La zone 2-3 sur 5 et le seuil 4 sur 5 sont ma proposition : la spec demande une compréhension de 75 % ou plus, ce qui revient à 4 sur 5 avec cet échantillon.

**Honnêteté sur le nombre** : 5 personnes montrent des problèmes d'usage. Elles ne mesurent ni un marché, ni un taux de conversion. Ne jamais annoncer un pourcentage de marché à partir de ce test.

## 2. Avant de commencer

| Point | Détail |
|---|---|
| Adresse à donner | **`https://deploy-preview-199--rme-voyage.netlify.app/lab/intention`** (PR #199, commit `3d8758b`, vérifié le 2026-10-04). C'est la version complète : arabe, partage WhatsApp, « Enregistrer ce voyage », « Mon voyage », garde-fous contre les erreurs silencieuses (retour en Europe, annulation, ville écartée) et le correctif « je rentre à Paris dimanche ». L'aperçu est public pour qui a le lien : ne pas le diffuser au-delà des testeurs. |
| Phrase de retour à vérifier avant les testeurs | « je rentre à Paris dimanche » doit afficher « Retour vers Paris », une action de vol et aucune question « Où ? ». C'est vérifié par les tests, pas encore par un navigateur : l'environnement de cette session n'a pas pu ouvrir l'aperçu dans un navigateur. À regarder une fois sur un téléphone avant le premier testeur. |
| Version | Noter le numéro de commit de l'aperçu utilisé. Ne rien changer entre deux personnes. |
| Testeurs | 5 personnes réelles qui voyagent vers le Maroc : famille et MRE, en français et en darija (spec). Idéal : 2 en darija, 2 en français, 1 plus âgée. Pas Tarek, pas quelqu'un qui connaît RME. |
| Matériel | Leur téléphone, ce document imprimé ou ouvert, un chronomètre. Pas d'enregistrement sans accord clair. |
| Vie privée | Ne noter ni nom, ni numéro, ni adresse. Donner à chaque personne un code (T1 à T5). Les phrases tapées restent chez RME : elles ne sont pas envoyées (spec). |

## 3. Déroulé (environ 10 minutes par personne)

1. **Accueil** (30 s). Dire seulement : « Tu pars bientôt au Maroc ? Ouvre ce lien, écris ce que tu veux, comme si tu parlais à un ami. Je ne t'aide pas, c'est RME qu'on teste, pas toi. »
2. **Saisie libre.** La personne tape sa propre phrase. Ne rien suggérer. Si elle bloque plus de 20 secondes, lui montrer l'un des exemples déjà affichés par l'écran, jamais ses propres mots.
3. **Question avant tout toucher.** Quand « J'ai compris » s'affiche, demander **avant** qu'elle touche à quoi que ce soit : « Qu'est-ce que tu ferais maintenant ? » Noter sa réponse mot pour mot.
4. **Action.** Lui dire de faire ce qu'elle ferait. Observer sans parler. Noter ce qu'elle touche, dans l'ordre, et le nombre de touchers jusqu'à une surface (page, lien, checklist).
5. **Partage.** Demander : « Tu l'enverrais à quelqu'un ? » Si oui, lui faire toucher « Partager » et noter à qui elle l'enverrait (famille, ami, personne).
6. **Deux questions finales** : « RME a-t-il compris ce que tu voulais ? » (oui / non / à moitié) et « Qu'est-ce qui t'a gênée ? » Noter mot pour mot.

**Interdit pendant la séance** : expliquer, corriger, défendre le produit, finir ses phrases, répondre à « c'est quoi ça ? » autrement que par « qu'est-ce que tu en penses ? ».

## 4. Phrases de secours (seulement si la personne ne trouve rien à écrire)

Ce sont des phrases réalistes déjà couvertes par le banc de 210 phrases. À n'utiliser qu'en dernier recours, et à noter si utilisées.

| Langue | Phrase |
|---|---|
| Français | « Je veux aller au Maroc ce week-end » |
| Français | « On part à Tanger en août avec les enfants, en voiture depuis Paris » |
| Darija | « bghit nmshi l bled had l weekend » |
| Darija | « bghit nmshi l Nador f juillet m3a drari » |

Limites connues du moteur, à ne pas présenter comme des bugs surprises : « Tanger Paris » sans autre mot (ambigu), trajets à étapes multiples, « samedi non dimanche », ferry avec voiture lu comme voiture.

## 5. Fiche d'observation (une par personne)

| Champ | À noter |
|---|---|
| Code, langue, âge approximatif | T1…T5 |
| Version de l'aperçu | numéro de commit |
| Phrase tapée (mot pour mot) | |
| Champs affichés par « J'ai compris » | destination, date, départ, voyageurs, mode |
| **A. Action utile** | À l'étape 3, a-t-elle dit une action cohérente avec ce que RME propose ? **oui / non / hésite** |
| **B. Action faite** | A-t-elle touché une action proposée ? laquelle ? combien de touchers ? |
| **C. Partage** | l'enverrait-elle ? à qui ? a-t-elle touché « Partager » ? |
| RME a-t-il compris ? | oui / non / à moitié |
| Moment de blocage | où, combien de secondes |
| Citations utiles | mot pour mot |
| Phrase mal comprise ? | à ajouter au banc (voir §7) |

## 6. Les trois chiffres

| Chiffre | Calcul sur 5 | Seuil |
|---|---|---|
| **Action utile** | nombre de « oui » en A | voir §1 |
| **Clic ou action** | nombre de personnes qui touchent une action proposée (B) | au moins 3 sur 5 ; la spec veut au moins 50 % de choix d'action |
| **Partage** | nombre de personnes qui disent qu'elles enverraient le résultat (C) | pas de seuil avant observation ; on regarde si c'est 0 |

Autres critères de la spec : 3 touchers ou moins jusqu'à une surface ; au moins une action qui atteint un partenaire ; « RME a-t-il compris ? » majoritairement oui. Le NO-GO de la spec reste valable : si ça ressemble à un menu, si RME pose trop de questions, si les actions sont génériques.

**Clics de testeurs** : ils sont réels pour le lien d'affiliation (le flux Travelpayouts est actif), mais ils viennent de personnes qu'on a invitées. Les compter à part, ne jamais les présenter comme un signal commercial du marché.

## 7. Après la séance

1. Remplir le tableau de synthèse ci-dessous.
2. Décider selon §1, par écrit, avant de discuter des idées d'amélioration.
3. Ajouter chaque phrase mal comprise au banc (`lib/lab/intentBench.ts`) : une phrase réelle devient un test de non-régression.
4. Ne rien développer tant que la décision n'est pas écrite.

| | T1 | T2 | T3 | T4 | T5 | Total |
|---|---|---|---|---|---|---|
| A. Action utile (oui) | | | | | | /5 |
| B. Action touchée | | | | | | /5 |
| C. Partage envisagé | | | | | | /5 |
| Compris (oui ou moitié) | | | | | | /5 |

## 8. Ce que l'on apprend des pays à la pointe : hypothèses, pas conclusions

Les mécanismes viennent de `docs/rme-lab/RADAR.md` (rédigé le 2026-09 avec sources ; **non revérifiés aujourd'hui**). Chacun devient une hypothèse à tester **après** ce test, jamais avant.

| Mécanisme observé ailleurs | Réf. RADAR | Hypothèse RME | Test le moins cher | Dépend du test des 5 ? |
|---|---|---|---|---|
| Mini-programmes de WeChat : ouverts par un lien ou un QR, sans installation | RAD-01 | Un lien par moment (« préparer le départ ») partagé sur WhatsApp suffit pour entrer | Compter les ouvertures d'un lien partagé | Oui |
| Citymapper GO : suit l'étape du trajet | RAD-08 | « Mode Voyage » en 5 étapes réduit la confusion | Montrer la carte « Mon voyage » à 5 personnes | Oui |
| Cartes proactives de Google (Discover) | RAD-12 | Une carte au bon moment vaut mieux qu'une question | Comparer carte et question sur 5 personnes | Oui |
| Spotify « daylist » : contenu selon l'heure | RAD-07 | Matin de route : trajet, météo, prière | Idée seulement | Oui |
| Waze : signalements avec durée de vie | RAD-11 | Les signalements d'attente au port remplacent l'absence de source | 1 type de signalement pendant la pointe | Oui, et après un premier signal commercial |
| Duolingo : série | RAD-05 | Un rappel de série fait revenir | Idée seulement | Oui |
| Ligne de messagerie (LINE) : messages de service | RAD-02 | Un rappel avant la traversée | Notification locale sur l'application | Oui |

Je n'ai pas d'expérience de terrain de ces pays : ces lignes sont des hypothèses issues de documents, pas des constats.
