# Google Play Store Listing - RME Voyage

## App Details
- **Package ID**: com.rmevoyage.app (identique à `capacitor.config.ts` ; définitif après le premier envoi)
- **App Name**: RME Voyage
- **Category**: Travel & Local
- **Content Rating**: à obtenir via le questionnaire IARC de la Play Console (voir `data-safety.md` pour le public cible)
- **Price**: Free

## Short Description (80 chars max)
Compagnon voyage Europe-Maroc: itinéraire, prières, Qibla, budget, IA darija.

## Full Description (4000 chars max)
RME Voyage est le compagnon de voyage ultime pour les Marocains résidant à l'étranger (MRE/RME) et tous les voyageurs entre l'Europe et le Maroc.

L'application réunit tous les services essentiels dans une expérience claire et intuitive, pensée pour les familles qui voyagent entre l'Europe, le Maroc et au-delà.

FONCTIONNALITÉS PRINCIPALES:

• Itinéraire intelligent - Planifiez votre trajet de n'importe quelle ville européenne vers votre destination au Maroc. Distance, temps estimé et étapes détaillées.

• Horaires de prière & Qibla - Prières calculées automatiquement selon votre position GPS. Direction de la Qibla en temps réel avec la boussole de votre téléphone.

• Calculateur de coûts - Estimez carburant, péages, ferry et budget total de votre voyage en un clic.

• Carte interactive - Visualisez votre route avec les villes, ports et points d'intérêt sur une carte détaillée.

• Checklist voyage - Documents, véhicule, santé, logistique: ne rien oublier avant le départ.

• Convertisseur de devises - EUR, MAD, USD, GBP et plus. Conversion instantanée.

• Assistant Hadak - Posez vos questions en darija, français, arabe, anglais ou espagnol. Réponses rapides sur les itinéraires, prières, ferry, documents, urgences et plus. Certaines réponses sont générées par IA : vérifiez les informations importantes, et signalez une réponse d'un simple bouton.

ASSISTANT EN 5 LANGUES (interface en français) :
- Français
- English
- العربية
- Español
- الدارجة (Darija marocaine)

L'application est gratuite et fonctionne sans compte. Les liens partenaires sont clairement signalés.

RME Voyage - Parce que le voyage commence bien avant le départ.

## Keywords (max 100 chars)
voyage, maroc, MRE, RME, prière, qibla, itinéraire, ferry, darija, diaspora

## Screenshots needed
1. Hero page with route planner
2. Prayer times & Qibla compass
3. Interactive map with route
4. AI Assistant chat in Darija
5. Travel checklist
6. Currency converter

## Build Instructions
Voir `CAPACITOR_BUILD.md` (source à jour pour la construction de l'AAB).

## Déclarations liées
- Politique de confidentialité : https://rme-route.vercel.app/api/legal/privacy
- Formulaire « Sécurité des données » : `data-safety.md`
- Chaque promesse ci-dessus correspond à une fonction présente dans l'app (vérifié le 26/09/2026) : itinéraire + carte (RouteSearch), prières et Qibla (PrayerWidget, QiblaCompass), coûts carburant/péages/ferry (TripDecisionEngine, FuelByCountryPanel), checklist (TravelChecklist), convertisseur (CurrencyConverter), assistant (HadakAI).
