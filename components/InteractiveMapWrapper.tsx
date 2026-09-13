"use client";

import dynamic from "next/dynamic";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <section className="rounded-3xl border border-sable-300 bg-white p-6 shadow-sm">
      <h2 className="font-display text-lg font-semibold text-zellige-800">🗺️ Carte du trajet Europe ↔ Maroc</h2>
      <div className="mt-4 flex h-80 items-center justify-center rounded-2xl bg-sable-100 text-sm text-sable-600">
        Chargement de la carte...
      </div>
    </section>
  ),
});

export default function InteractiveMapWrapper() {
  return <InteractiveMap />;
}
