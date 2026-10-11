"use client";

import { useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { CHAMPS_PROCURATION_VEHICULE, procurationVehicule, type Valeurs } from "@/lib/modeles";

export default function ModeleProcuration() {
  const [valeurs, setValeurs] = useState<Valeurs>({});
  const doc = useMemo(() => procurationVehicule(valeurs), [valeurs]);

  return (
    <div>
      <form className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 print:hidden" onSubmit={(e) => e.preventDefault()}>
        {CHAMPS_PROCURATION_VEHICULE.map((champ) => (
          <label key={champ.id} className="block text-sm font-bold text-[#0f1f3d]">
            {champ.label}
            <input
              type={champ.type}
              placeholder={champ.placeholder}
              value={valeurs[champ.id] ?? ""}
              onChange={(e) => setValeurs((prev) => ({ ...prev, [champ.id]: e.target.value }))}
              className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2 text-base font-normal"
            />
          </label>
        ))}
        <p className="text-xs text-slate-600">Rien n&apos;est envoyé ni enregistré : tout reste sur votre téléphone.</p>
      </form>

      <button
        type="button"
        onClick={() => window.print()}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0f1f3d] px-4 py-3 text-base font-bold text-white print:hidden"
      >
        <Printer size={18} /> Imprimer la procuration
      </button>

      <article className="mt-6 rounded-2xl border border-slate-300 bg-white p-6 font-serif text-[15px] leading-relaxed text-black print:mt-0 print:border-0 print:p-0">
        <h2 className="mb-6 text-center text-lg font-bold">{doc.titre}</h2>
        {doc.paragraphes.map((p) => (
          <p key={p} className="mb-4">
            {p}
          </p>
        ))}
        <div className="mt-10 h-24" aria-hidden="true" />
      </article>
    </div>
  );
}
