"use client";

import { useEffect, useState } from "react";
import { Car, Hotel, Luggage, Plane, ShieldCheck, Ship, Smartphone, Sparkles, Wallet } from "lucide-react";
import type { PartnerCatalogueEntry, PartnerCategory } from "@/lib/partnerCatalogue";
import { trackPartnerClick } from "@/lib/partnerTracking";

const categoryMeta: Record<PartnerCategory, { label: string; icon: typeof Ship }> = {
  ferry: { label: "Ferries", icon: Ship },
  flight: { label: "Vols", icon: Plane },
  hotel: { label: "Hôtels", icon: Hotel },
  esim: { label: "eSIM", icon: Smartphone },
  luggage: { label: "Bagages", icon: Luggage },
  experiences: { label: "Expériences", icon: Sparkles },
  transfer: { label: "Transferts", icon: Wallet },
  car_rental: { label: "Location de voiture", icon: Car },
  insurance: { label: "Assurance", icon: ShieldCheck },
};

export default function PartnerComparison() {
  const [partners, setPartners] = useState<PartnerCatalogueEntry[]>([]);

  useEffect(() => {
    fetch("/api/partners", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => setPartners(Array.isArray(data.partners) ? data.partners : []))
      .catch(() => setPartners([]));
  }, []);

  if (!partners.length) return null;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="partner-comparison-title">
      <div className="max-w-2xl">
        <p className="text-xs font-black uppercase tracking-[.16em] text-[#b45309]">Comparateur partenaires</p>
        <h2 id="partner-comparison-title" className="mt-2 text-3xl font-display font-semibold tracking-tight text-[#0f1f3d]">
          Comparez les services utiles au voyage
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          RME affiche plusieurs options. Un partenaire n'est présenté comme affilié que lorsque son lien de suivi a été configuré et validé.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {partners.map((partner) => {
          const { icon: Icon, label } = categoryMeta[partner.category];
          const href = partner.affiliateUrl ?? partner.publicUrl;
          const active = partner.status === "active";

          return (
            <a
              key={partner.id}
              href={href}
              target="_blank"
              rel={active ? "sponsored noopener noreferrer" : "noopener noreferrer"}
              onClick={() => trackPartnerClick({
                partner: partner.name,
                product: partner.category,
                placement: "partner_comparison",
                page: window.location.pathname,
                context: { affiliate_active: active },
              })}
              className="group rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-[#0f1f3d]">
                  <Icon size={19} aria-hidden />
                </span>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${active ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {active ? "Affilié" : "À activer"}
                </span>
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
              <h3 className="mt-1 font-extrabold text-[#0f1f3d]">{partner.name}</h3>
              <p className="mt-2 text-sm leading-5 text-slate-600">{partner.description}</p>
              <p className="mt-4 text-xs font-semibold text-slate-500">
                {active ? "Lien partenaire configuré" : "Lien public en attendant l'affiliation"}
              </p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
