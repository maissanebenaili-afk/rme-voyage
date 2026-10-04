# Trouver des testeurs à distance, sans pression et sans faux utilisateurs

Complément de `docs/TEST_5_PERSONNES_PROTOCOLE.md`. Écrit le 2026-10-04 pour une contrainte réelle : Tarek ne peut pas réunir 5 personnes autour de lui. Le test s'adapte à cette contrainte.

## 1. Règles

- **On commence avec une seule personne.** Une personne observée apprend déjà quelque chose. Les seuils (0-1, 2-3, 4-5 sur 5) ne s'appliquent qu'à partir de 5 personnes ; avant, on note des observations, pas un score.
- **Aucun faux utilisateur**, aucune réponse écrite à la place de quelqu'un, aucun avis acheté présenté comme spontané.
- **On dit la vérité** aux personnes : c'est un prototype en test, on veut leur avis honnête, même négatif.
- **Le minimum de données** : pas de nom, pas de numéro dans les notes. Un message vocal contient une voix : demander l'accord, le retranscrire, puis le supprimer.
- **Les réponses à distance comptent à part** des tests observés. On ne mélange pas les deux dans un même chiffre.

## 2. Le test à distance (sans observateur)

Tarek n'a besoin que de WhatsApp. La personne fait le test seule, puis répond à 5 questions par écrit ou par message vocal.

**Ce qu'on perd** : on ne voit pas où la personne hésite. **Ce qu'on garde** : sa phrase, ce qu'elle a compris de l'action proposée, et si elle la ferait.

**Message à envoyer (français)**

> Salam ! Je teste une petite appli pour préparer le voyage au Maroc. Ce n'est pas encore fini, et j'ai besoin d'un avis honnête, même négatif.
> 1. Ouvre ce lien : https://deploy-preview-199--rme-voyage.netlify.app/lab/intention
> 2. Écris ce que tu dirais à un ami sur ton prochain voyage (ou un voyage imaginaire).
> 3. Ne lis pas tout : fais ce que tu ferais naturellement.
> Ensuite réponds-moi à ces 5 questions, même en vocal :
> a) Qu'est-ce que l'appli t'a proposé de faire en premier ?
> b) Tu l'as ouvert ? Pourquoi oui ou non ?
> c) Est-ce qu'elle a compris ce que tu voulais ? (oui / non / à moitié)
> d) Tu l'enverrais à quelqu'un ? À qui ?
> e) Qu'est-ce qui t'a gêné ?
> Si tu veux, appuie ensuite sur « Partager » et envoie-le-moi : je verrai la phrase que tu as écrite.
> Merci, ça m'aide beaucoup.

**Message à envoyer (darija en lettres latines, à faire relire par un locuteur natif)**

> Salam ! Kanjerreb wa7d l'application sghira bach twajjed safar l'Maghrib. Mazal ma kamlatch, w bghit rayek b sra7a, 7tta ila kan khayb.
> 1. 7ell had l-lien : https://deploy-preview-199--rme-voyage.netlify.app/lab/intention
> 2. Kteb chno katgoul l chi sa7bek 3la safar dyalek.
> 3. Dir kima ghadi dir b tabi3a.
> Men b3d jawebni 3la had 5 d les questions, 7tta b vocal :
> a) Chno l'application qaltlek dir lowel ?
> b) 7elltih ? 3lach ?
> c) Fhmat chno bghiti ? (iyeh / la / nos nos)
> d) Ghadi tsiftou l chi wa7ed ? L chkoun ?
> e) Chno li ma 3jbekch ?
> Ila bghiti, brek 3la « Partager » w siftou lia.
> Choukran bzaf.

**Pourquoi « Partager » arrive en dernier** : si on le demande avant la question d), on fabrique un partage. Ici, la question d) mesure l'envie spontanée ; le bouton sert seulement à récupérer la phrase écrite.

## 3. Où trouver des personnes, du moins cher au plus cher

Rien n'est publié ni envoyé par Claude : chaque contact humain passe par Tarek.

| Canal | Coût | Effort pour Tarek | Ce qui est vérifié | Ce qui ne l'est pas |
|---|---|---|---|---|
| **Une connaissance qui transmet** le message à 2 ou 3 personnes de son entourage | 0 € | 1 message | — | — |
| **Forums MRE** (bladi.net, yabiladi.com) : demande d'avis, pas une publicité | 0 € | 1 message + répondre | Ces forums existent et parlent des trajets vers le Maroc (cités dans les sources de l'audit) | **Leurs règles sur les messages promotionnels n'ont pas été lues** : lire la charte avant de poster. Beaucoup de forums interdisent la publicité. |
| **Reddit r/Morocco** | 0 € | 1 message + répondre | Environ 400 000 membres d'après une enquête du sous-forum (source secondaire) | **Règles sur l'autopromotion et les sondages non lues** : les lire avant |
| **Groupes Facebook ou WhatsApp de voyageurs vers le Maroc** | 0 € | demander l'accord de l'administrateur | — | Groupes précis non identifiés ici |
| **Associations, centres culturels, mosquées** proches | 0 € | contact humain | — | Non recensé |
| **Prolific** (plateforme payante de participants) | quelques euros par personne + frais | compte et paiement | Filtres auto-déclarés : nationalité, pays de naissance, pays de résidence. Le Maroc a un petit vivier, la France un grand. Une étude publiée cite environ 9 £ de l'heure. | Prix exact, nombre réel de personnes nées au Maroc vivant en France, conditions d'usage : **à vérifier**. C'est une dépense : décision de Tarek. |

**Recommandation** : commencer par la première ligne (une connaissance qui transmet), puis un forum dont la charte autorise les demandes d'avis. Garder Prolific comme plan B si rien n'arrive en une semaine.

## 4. Message court pour un forum ou un groupe

> Bonjour à tous, je prépare une petite application gratuite pour aider les familles qui voyagent vers le Maroc (papiers, trajet, traversée). Elle n'est pas finie. Je cherche 5 personnes qui partent ou sont parties récemment, pour la tester 5 minutes et me dire franchement ce qui ne va pas. Pas d'inscription, pas de données personnelles. Si ça vous intéresse, répondez ici ou en message privé. Merci !

(À ne poster que si la charte du forum ou de l'administrateur le permet.)

## 5. Ce que fait Tarek, et rien d'autre

1. Envoyer le message à une première personne, ou le poster dans un lieu qui l'autorise.
2. Recevoir les réponses.
3. Les transmettre (texte copié ou résumé) : Claude remplit la fiche d'observation, compte, et propose une décision selon le protocole.
