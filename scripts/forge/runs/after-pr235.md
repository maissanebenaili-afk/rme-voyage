# Forge — after-pr235

https://deploy-preview-235--rme-voyage.netlify.app · 2026-10-04T13:48:36.416Z

**28 PASS · 17 FAIL · 0 SKIPPED** sur 45 scénarios.

| Famille | PASS | FAIL | SKIPPED |
|---|---|---|---|
| truth | 7 | 6 | 0 |
| action | 5 | 2 | 0 |
| function | 11 | 3 | 0 |
| ux | 5 | 1 | 0 |
| commercial | 0 | 5 | 0 |

## Changements depuis « baseline-production »

- H06 : FAIL → PASS
- H07 : FAIL → PASS
- H08 : FAIL → PASS
- H09 : FAIL → PASS
- H17 : FAIL → PASS
- H20 : FAIL → PASS
- A02 : FAIL → PASS
- A03 : FAIL → PASS
- A07 : FAIL → PASS
- P01 : FAIL → PASS
- B03 : FAIL → PASS

## Échecs

- **H01** (truth) : absent : /20[  ,.]?000/ ; réponse générée par l'IA (groq) sur un sujet où seule une source réelle est permise
- **H02** (truth) : absent : /100[  ,.]?000/
- **H03** (truth) : interdit présent : /11-12/
- **H04** (truth) : interdit présent : /Grimaldi/ ; affirmation interdite (Nador is served by GNV, not Grimaldi (2026-10-04))
- **H15** (action) : interdit présent : /^Il est actuellement/
- **H18** (truth) : réponse générée par l'IA (groq) sur un sujet où seule une source réelle est permise
- **H22** (truth) : interdit présent : /FRS/ ; affirmation interdite (Nador is served by GNV, not Grimaldi (2026-10-04))
- **A04** (function) : status 502, attendu 200
- **A05** (function) : status 502, attendu 200
- **A06** (function) : status 502, attendu 200
- **P02** (commercial) : interdit présent : /\d+ ?€/ ; interdit présent : /10 ?%/
- **P03** (commercial) : interdit présent : /halal certifiée/
- **P04** (commercial) : interdit présent : /\d[\d  ]* ?DH/ ; interdit présent : /m²/
- **B01** (ux) : affirmation interdite (no source found (2026-10-04)) ; erreur JavaScript : Minified React error #418; visit https://react.dev/errors/418?args[]=text&args[]= for the full message or use the non-mi
- **B02** (action) : résultat hors écran (haut à -683 px sur 844)
- **B04** (commercial) : médaille 🥇 attribuée sur des frais estimés
- **B05** (commercial) : interdit présent : /Partenaire\b(?! de RME)/ ; interdit présent : /Collection exclusive/

## Mesures

- B02 : msToAnswer = 2924, resultTop = -683
- B03 : msToAnswer = 1716, resultTop = 84
- B06 : screens = 37, sections = 38, buttons = 79