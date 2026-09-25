"use client";

import { Car, Ship, MapPin } from "lucide-react";
import { useComputedRoute } from "@/lib/routeContext";
import { formatDuration, formatKm } from "@/lib/routePages";

/**
 * Résumé visuel du trajet réel — remplace l'ancien bloc "RME Route Pulse"
 * (données de démo, vocabulaire technique jugé incompréhensible). Ici,
 * uniquement les tronçons réellement calculés par /api/route (RouteLeg[]) :
 * pas de statut trafic/douane inventé, juste les points de passage réels
 * et leur distance/durée mesurée.
 */
export default function RouteJourney() {
  const route = useComputedRoute();
  const legs = route?.legs;
  if (!legs || legs.length === 0) return null;

  return (
    <section aria-label="Étapes du trajet" className="mt-4 rounded-2xl border border-spring-200 bg-spring-50 p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f1f3d] px-3 py-1.5 text-xs font-black text-white">
          <MapPin size={13} /> {legs[0].from}
        </span>
        {legs.map((leg, i) => (
          <span key={i} className="inline-flex items-center gap-1.5">
            {leg.kind === "road" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-[#334155]">
                <Car size={13} className="text-[#0f1f3d]" />
                {formatKm(leg.distanceMeters)} · {formatDuration(leg.durationSeconds)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-[#92400e]">
                <Ship size={13} /> Ferry
              </span>
            )}
            {leg.to && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0f1f3d] px-3 py-1.5 text-xs font-black text-white">
                <MapPin size={13} /> {leg.to}
              </span>
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
