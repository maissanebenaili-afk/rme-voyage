import { BellRing, Info, AlertTriangle, Calendar } from "lucide-react";

const newsItems = [
  {
    icon: Info,
    title: "Période de pointe estivale",
    text: "Les ferries Tarifa-Tanger et Algésiras-Tanger sont très fréquentés de juin à septembre. Réservez plusieurs semaines à l'avance.",
    type: "info",
    date: "2026-06-01",
  },
  {
    icon: AlertTriangle,
    title: "Passeport : validité 6 mois",
    text: "Le Maroc exige un passeport valide 6 mois après la date d'entrée. Vérifiez votre passeport dès maintenant.",
    type: "warning",
    date: "2026-01-15",
  },
  {
    icon: Calendar,
    title: "Formalités douane véhicule",
    text: "Si vous voyagez avec votre véhicule, munissez-vous de la carte grise, de l'assurance et d'un permis de conduire valide.",
    type: "info",
    date: "2026-03-10",
  },
  {
    icon: BellRing,
    title: "Aides au voyage MRE",
    text: "Le programme MRE de l'OFII propose des services d'accompagnement pour les Marocains résidant à l'étranger. Renseignez-vous sur vos droits.",
    type: "info",
    date: "2026-02-20",
  },
];

const typeStyles: Record<string, { bg: string; text: string; border: string }> = {
  info: { bg: "bg-blue-50", text: "text-blue-900", border: "border-blue-200" },
  warning: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200" },
};

export default function NewsFeed() {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm border">
      <h2 className="text-lg font-bold">📰 Infos voyage</h2>
      <p className="mt-2 text-sm text-slate-500">
        Les alertes réelles seront activées lorsque les sources officielles et les flux
        partenaires seront connectés. Aucune donnée fictive n&apos;est présentée comme du temps réel.
      </p>
      <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
        Conseil : vérifiez les conditions de ferry et les formalités avant le départ.
        Promesse RME Voyage : vous aider à préparer, organiser et simplifier chaque trajet Europe ↔ Maroc.
      </div>
    </section>
  );
}
