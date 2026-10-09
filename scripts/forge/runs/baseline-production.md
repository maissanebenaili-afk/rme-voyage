# Forge — baseline-production

https://rme-voyage.netlify.app · 2026-10-04T13:42:18.975Z

**17 PASS · 28 FAIL · 0 SKIPPED** sur 45 scénarios.

| Famille | PASS | FAIL | SKIPPED |
|---|---|---|---|
| truth | 4 | 9 | 0 |
| action | 1 | 6 | 0 |
| function | 11 | 3 | 0 |
| ux | 1 | 5 | 0 |
| commercial | 0 | 5 | 0 |

## Échecs

- **H01** (truth) : absent : /20[  ,.]?000/ ; réponse générée par l'IA (groq) sur un sujet où seule une source réelle est permise
- **H02** (truth) : absent : /100[  ,.]?000/
- **H03** (truth) : interdit présent : /11-12/
- **H04** (truth) : interdit présent : /Grimaldi/ ; affirmation interdite (Nador is served by GNV, not Grimaldi (2026-10-04))
- **H06** (action) : interdit présent : /Météo/ ; interdit présent : /°C/
- **H07** (action) : interdit présent : /MAD/l/
- **H08** (truth) : interdit présent : /\+33/ ; réponse générée par l'IA (groq) sur un sujet où seule une source réelle est permise
- **H09** (truth) : requête impossible : fetch failed
- **H15** (action) : interdit présent : /^Il est actuellement/
- **H17** (action) : interdit présent : /°C/
- **H18** (truth) : réponse générée par l'IA (groq) sur un sujet où seule une source réelle est permise
- **H20** (action) : absent : /ville/
- **H22** (truth) : interdit présent : /FRS/ ; affirmation interdite (Nador is served by GNV, not Grimaldi (2026-10-04))
- **A02** (ux) : interdit présent : /not found/
- **A03** (ux) : interdit présent : /Missing/
- **A04** (function) : status 502, attendu 200
- **A05** (function) : status 502, attendu 200
- **A06** (function) : status 502, attendu 200
- **A07** (ux) : interdit présent : /not found/
- **P01** (truth) : affirmation interdite (unsourced remittance volume (2026-10-04))
- **P02** (commercial) : interdit présent : /\d+ ?€/ ; interdit présent : /10 ?%/
- **P03** (commercial) : interdit présent : /halal certifiée/
- **P04** (commercial) : interdit présent : /\d[\d  ]* ?DH/ ; interdit présent : /m²/
- **B01** (ux) : affirmation interdite (unsourced remittance volume (2026-10-04)) ; affirmation interdite (no source found (2026-10-04)) ; erreur JavaScript : Minified React error #418; visit https://react.dev/errors/418?args[]=HTML&args[]= for the full message or use the non-mi
- **B02** (action) : résultat hors écran (haut à 912 px sur 844)
- **B03** (ux) : interdit présent : /not found/ ; résultat hors écran (haut à 980 px sur 844)
- **B04** (commercial) : médaille 🥇 attribuée sur des frais estimés
- **B05** (commercial) : interdit présent : /Partenaire\b(?! de RME)/ ; interdit présent : /Collection exclusive/

## Mesures

- B02 : msToAnswer = 2737, resultTop = 912
- B03 : msToAnswer = 1563, resultTop = 980
- B06 : screens = 37, sections = 38, buttons = 79