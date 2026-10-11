"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, ExternalLink, Printer } from "lucide-react";
import {
  buildKit,
  KIT_CATEGORY_LABELS,
  type KitAnswers,
  type Nationalite,
  type Transport,
} from "@/lib/kitRetour";

const transports: { value: Transport; label: string }[] = [
  { value: "voiture", label: "En voiture (ferry)" },
  { value: "ferry-pieton", label: "En ferry, à pied" },
  { value: "avion", label: "En avion" },
];

const nationalites: { value: Nationalite; label: string }[] = [
  { value: "francaise", label: "Française" },
  { value: "marocaine", label: "Marocaine" },
  { value: "binationale", label: "Les deux" },
];

function Choice<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="mt-6">
      <legend className="text-sm font-bold text-[#0f1f3d]">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold ${
              value === option.value
                ? "border-[#0f1f3d] bg-[#0f1f3d] text-white"
                : "border-slate-300 bg-white text-[#0f1f3d]"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const yesNo = [
  { value: "non", label: "Non" },
  { value: "oui", label: "Oui" },
] as const;

export default function KitRetour() {
  const [answers, setAnswers] = useState<KitAnswers>({
    transport: "voiture",
    nationalite: "binationale",
    mineurSansParent: false,
    vehiculeAuNomDuConducteur: true,
  });
  const [done, setDone] = useState<Set<string>>(new Set());

  const kit = useMemo(() => buildKit(answers), [answers]);
  const update = (patch: Partial<KitAnswers>) => setAnswers((prev) => ({ ...prev, ...patch }));

  function toggle(id: string) {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const ready = kit.filter((item) => done.has(item.id)).length;

  return (
    <div>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 print:hidden">
        <Choice
          legend="Comment partez-vous ?"
          name="transport"
          options={transports}
          value={answers.transport}
          onChange={(transport) => update({ transport })}
        />
        <Choice
          legend="Votre nationalité"
          name="nationalite"
          options={nationalites}
          value={answers.nationalite}
          onChange={(nationalite) => update({ nationalite })}
        />
        <Choice
          legend="Un enfant mineur voyage-t-il sans aucun de ses parents ?"
          name="mineur"
          options={[...yesNo]}
          value={answers.mineurSansParent ? "oui" : "non"}
          onChange={(v) => update({ mineurSansParent: v === "oui" })}
        />
        {answers.transport === "voiture" && (
          <Choice
            legend="La carte grise est-elle au nom du conducteur ?"
            name="vehicule"
            options={[
              { value: "oui", label: "Oui" },
              { value: "non", label: "Non" },
            ]}
            value={answers.vehiculeAuNomDuConducteur ? "oui" : "non"}
            onChange={(v) => update({ vehiculeAuNomDuConducteur: v === "oui" })}
          />
        )}
      </section>

      <section className="mt-6" aria-live="polite">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-[#0f1f3d]">
            Vos papiers : {ready}/{kit.length} prêts
          </h2>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-[#0f1f3d] print:hidden"
          >
            <Printer size={16} /> Imprimer
          </button>
        </div>

        <ul className="mt-4 space-y-3">
          {kit.map((item) => {
            const isDone = done.has(item.id);
            return (
              <li key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-pressed={isDone}
                    aria-label={`${item.title} : ${isDone ? "prêt" : "pas encore prêt"}`}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${
                      isDone ? "border-emerald-700 bg-emerald-700 text-white" : "border-slate-400 bg-white"
                    }`}
                  >
                    {isDone && <Check size={16} />}
                  </button>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-[#5a716c]">
                      {KIT_CATEGORY_LABELS[item.category]}
                    </p>
                    <p className="font-bold text-[#0f1f3d]">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-700">{item.detail}</p>
                    {item.aVerifier && (
                      <p className="mt-2 flex items-start gap-1.5 text-xs font-semibold text-amber-800">
                        <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                        À confirmer auprès de la source officielle avant le départ.
                      </p>
                    )}
                    <a
                      href={item.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-700 underline"
                    >
                      {item.source.label} <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
