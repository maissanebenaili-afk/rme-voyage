# CONTROL PLANE — mémoire inter-branches

> Système de synchronisation du portefeuille. Il évite que Tarek devienne le système de synchronisation entre les branches.

## Architecture

1. MASTER CONTROL — état courant, décisions, blocages, éléments gelés.
2. IDEA LEDGER — mémoire durable des idées, y compris gelées ou réfutées.
3. EVIDENCE LEDGER — preuves observées, avec niveau et date.
4. BRANCH INBOX — format d'entrée standard pour les découvertes provenant d'une branche/session.

## Règle d'ingestion

branche → inbox → déduplication → contre-audit → evidence ledger → idea ledger → master control → décision

Toute nouvelle proposition est d'abord classée comme fait, observation, calcul, hypothèse, opportunité ou inconnu. Elle ne devient pas une décision simplement parce qu'un modèle la propose.

## Règles

- Une idée n'est jamais supprimée silencieusement.
- Une idée réfutée reste enregistrée avec sa raison.
- Une idée gelée peut être réactivée si une condition de réouverture est satisfaite.
- Une preuve n'est jamais déduite d'une idée.
- Une simulation n'est pas une observation terrain.
- Un clic n'est pas une conversion ; une conversion n'est pas une commission ; une commission n'est pas un paiement.
- Aucun secret, identifiant, donnée personnelle ou procédure d'accès ne doit entrer dans ces registres.
- Les éléments FROZEN restent intouchables sans autorisation explicite.
- Le portefeuille actif doit rester court ; le ledger peut être large.

## Format minimal d'un rapport de branche

Projet :
Date :
Source :
Nouvelles découvertes :
Faits vérifiés :
Observations :
Hypothèses :
Opportunités :
Contradictions :
Idées abandonnées :
Idées à conserver :
Preuves/liens :
Actions proposées :
Blocages humains :

## Rôle de la session mère

La session mère arbitre la réalité du portefeuille. Les branches explorent, testent ou produisent ; elles ne changent pas silencieusement la priorité globale.
