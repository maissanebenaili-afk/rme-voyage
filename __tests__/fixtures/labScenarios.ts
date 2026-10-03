import type { PlanOptions } from "../../lib/lab/nextBestAction";
import type { PartnerCatalogueEntry } from "../../lib/partnerCatalogue";
import { ROUTE_PAGES } from "../../lib/routePages";

// Shared by the lab experiments (not a test: no .test suffix).
export const TODAY = "2026-09-29";
export const partners: PartnerCatalogueEntry[] = [{
  id: "travelpayouts-flights", name: "TP", category: "flight", description: "", status: "active",
  affiliateUrl: "https://aviasales.tp.st/test", publicUrl: "https://www.travelpayouts.com/", envVar: "X", commissionNote: "",
}];
export const routes = ROUTE_PAGES.routes.map(({ slug, originCity, destinationCity }) => ({ slug, originCity, destinationCity }));
export const options: PlanOptions = { partners, routes, today: TODAY, lang: "fr" };

export type Truth = { dest?: string; origin?: string; when?: string; mode?: "Avion" | "Voiture" | "Ferry" };
export type S = { id: string; group: string; s: string; truth?: Truth; terminal?: "cancel" | "past" | "return" };
export const SCENARIOS: S[] = [
  { id: "01", group: "destination inconnue", s: "Je pars demain", truth: { dest: "Tanger", origin: "Paris", mode: "Avion" } },
  { id: "02", group: "destination inconnue", s: "Je veux partir en août", truth: { dest: "Nador", origin: "Bruxelles", mode: "Voiture" } },
  { id: "03", group: "deux destinations", s: "Tanger ou Nador ?", truth: { dest: "Nador", origin: "Paris", when: "En août", mode: "Avion" } },
  { id: "04", group: "origine inconnue", s: "Nador en août", truth: { origin: "Paris", mode: "Avion" } },
  { id: "05", group: "origine hors choix", s: "Je vais à Tanger samedi", truth: { origin: "Lyon", mode: "Avion" } },
  { id: "06", group: "date inconnue", s: "Paris Nador en avion", truth: { when: "En août" } },
  { id: "07", group: "date inconnue", s: "de Bruxelles à Al Hoceima en voiture", truth: { when: "En juillet" } },
  { id: "08", group: "mode inconnu", s: "Bruxelles Tanger en août", truth: { mode: "Ferry" } },
  { id: "09", group: "mode ambigu", s: "en avion ou en voiture vers Oujda", truth: { origin: "Paris", when: "En août", mode: "Voiture" } },
  { id: "10", group: "annulation", s: "Je ne pars plus à Tanger", terminal: "cancel" },
  { id: "11", group: "changement d'avis", s: "Tanger non plutôt Nador en août depuis Paris", truth: { mode: "Avion" } },
  { id: "12", group: "retour", s: "Je rentre du Maroc à Bruxelles dimanche", terminal: "return" },
  { id: "13", group: "retour", s: "Je dois rentrer en France demain", terminal: "return" },
  { id: "14", group: "hôtel + voiture", s: "hôtel et voiture à Marrakech en août", truth: { origin: "Paris", mode: "Avion" } },
  { id: "15", group: "famille", s: "On part à Tanger avec les enfants en juillet", truth: { origin: "Bruxelles", mode: "Voiture" } },
  { id: "16", group: "Darija", s: "bghit nmshi l Nador ghedda", truth: { origin: "Paris", mode: "Avion" } },
  { id: "17", group: "Darija sans lieu", s: "bghit nmshi ghedda", truth: { dest: "Nador", origin: "Paris", mode: "Avion" } },
  { id: "18", group: "arabe", s: "بغيت نمشي لطنجة نهار السبت", truth: { origin: "Paris", mode: "Avion" } },
  { id: "19", group: "translittération", s: "bghit nmshi l Tanja b l-babor", truth: { origin: "Paris", when: "En août" } },
  { id: "20", group: "transfert d'argent", s: "envoyer de l'argent à ma mère au Maroc", truth: { origin: "Paris", when: "En août", mode: "Avion" } },
  { id: "21", group: "SIM seule", s: "carte SIM pour le Maroc", truth: { origin: "Paris", when: "En août", mode: "Avion" } },
  { id: "22", group: "phrase complète", s: "Paris Tanger en avion samedi" },
  { id: "23", group: "souvenir", s: "hier je suis allé à Nador", terminal: "past" },
  { id: "24", group: "ville seule", s: "Marrakech", truth: { origin: "Paris", when: "En août", mode: "Avion" } },
  { id: "25", group: "pays seul", s: "je veux aller au bled", truth: { origin: "Bruxelles", when: "En juillet", mode: "Voiture" } },
  { id: "26", group: "interne Maroc", s: "comment aller de Casablanca à Marrakech demain", truth: {} },
];

export const FIELD_OF: Record<string, keyof Truth> = { destination: "dest", origin: "origin", when: "when", mode: "mode" };
