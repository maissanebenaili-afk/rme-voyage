import { BellRing, Info, AlertTriangle, Calendar, Rss } from "lucide-react";

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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">📰 Infos voyage</h2>
        <a
          href="/rss.xml"
          className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 transition hover:bg-emerald-200"
          aria-label="S’abonner au flux RSS RME Voyage"
        >
          <Rss size={14} aria-hidden="true" /> RSS
        </a>
      </div>

      <div className="mt-4 space-y-3">
        {newsItems.map((item, index) => {
          const style = typeStyles[item.type] || typeStyles.info;
          const Icon = item.icon;
          return (
            <div
              key={index}
              className={`rounded-xl border p-4 ${style.bg} ${style.border} ${style.text} card-hover`}
            >
              <div className="flex items-start gap-3">
                <Icon size={20} className="mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold">{item.title}</h3>
                    <span className="text-xs opacity-90">{item.date}</span>
                  </div>
                  <p className="mt-1 text-sm opacity-80">{item.text}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-900">
        💡 <strong>Conseil RME Voyage :</strong> Vérifiez toujours les conditions de ferry et les formalités
        avant le départ. Les sources officielles (ONMT, ambassades) restent la référence.
      </div>
    </section>
  );
}
