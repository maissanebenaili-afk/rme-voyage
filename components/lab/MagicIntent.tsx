"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Car, FileText, Hotel, Plane, Route, Smartphone, Sparkles, Wallet } from "lucide-react";
import { extractIntent } from "@/lib/lab/intentFacts";
import {
  describeFacts,
  missingChoices,
  planNextActions,
  type MagicAction,
  type MagicActionKind,
  type MagicLang,
  type RouteIndexEntry,
} from "@/lib/lab/nextBestAction";
import type { PartnerCatalogueEntry } from "@/lib/partnerCatalogue";
import { trackFunnelEvent, trackPartnerClick, type PartnerProduct } from "@/lib/partnerTracking";

const ICON: Record<MagicActionKind, typeof Plane> = {
  papers: FileText, flight: Plane, route: Route, hotel: Hotel, car_rental: Car, money: Wallet, sim: Smartphone,
};

const PRODUCT: Record<MagicActionKind, PartnerProduct> = {
  papers: "other", flight: "flight", route: "ferry", hotel: "hotel", car_rental: "car_rental", money: "transfer", sim: "other",
};

const TEXT = {
  fr: {
    title: "Dis-moi ton projet",
    placeholder: "Ex. : Je veux aller au Maroc ce week-end",
    submit: "Comprendre",
    tip: "Astuce : touchez le micro du clavier pour parler au lieu d’écrire.",
    examples: [
      "Je veux aller au Maroc ce week-end",
      "Il faut que je trouve un hôtel à Marrakech",
      "Je rentre à Tanger en août en voiture depuis Paris",
    ],
    understood: "J’ai compris",
    notUnderstood: "Je n’ai pas encore compris. Essayez un des exemples.",
    deduced: "déduit",
    youSaid: "vous avez dit",
    canPrepare: "Ce que je peux préparer",
    partnerLink: "Lien partenaire",
    footer: "Prototype RME Lab. Une date marquée « déduit » est calculée par RME : vérifiez-la.",
  },
  da: {
    title: "Goul liya chno bghiti",
    placeholder: "Ex.: bghit nmshi l bled had l weekend",
    submit: "Fhem",
    tip: "Nsi7a: dghet 3la l-micro dyal l-clavier bach thder.",
    examples: [
      "bghit nmshi l bled had l weekend",
      "bghit nbat f Marrakech",
      "ghadi nmshi l Nador f ghusht b tomobil mn Bruxelles",
    ],
    understood: "Fhemt",
    notUnderstood: "Mazal ma fhemtch. Jerreb chi mital.",
    deduced: "mstantaj",
    youSaid: "gulti",
    canPrepare: "Chno n9der nwajjed",
    partnerLink: "Lien partenaire",
    footer: "Prototype RME Lab. Tarikh fih « mstantaj » 7sbato RME: t2akked mno.",
  },
} as const;

function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

type Props = { partners: PartnerCatalogueEntry[]; routes: RouteIndexEntry[] };

export default function MagicIntent({ partners: initialPartners, routes }: Props) {
  const [lang, setLang] = useState<MagicLang>("fr");
  const [text, setText] = useState("");
  const [analysed, setAnalysed] = useState<{ sentence: string; today: string } | null>(null);
  const [partners, setPartners] = useState(initialPartners);
  const t = TEXT[lang];

  // Affiliate links live in server-only env vars: the current catalogue comes from the server route.
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/partners", { signal: controller.signal, cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { partners?: unknown } | null) => {
        if (Array.isArray(data?.partners)) setPartners(data.partners as PartnerCatalogueEntry[]);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const result = useMemo(() => {
    if (!analysed) return null;
    const facts = extractIntent(analysed.sentence, analysed.today);
    return {
      understood: describeFacts(facts, lang, analysed.today),
      missing: missingChoices(facts, lang),
      plan: planNextActions(facts, { partners, routes, today: analysed.today, lang }),
    };
  }, [analysed, lang, partners, routes]);

  const analyse = (sentence: string) => {
    setText(sentence);
    if (sentence.trim()) setAnalysed({ sentence, today: localToday() });
  };

  const onAction = (action: MagicAction, rank: number) => {
    trackFunnelEvent({ event: "hadak_next_action", placement: "magic", data: { action: action.kind, rank } });
    if (action.partner) {
      trackPartnerClick({
        partner: action.partner.name,
        product: PRODUCT[action.kind],
        placement: "magic_intent",
        page: window.location.pathname,
        context: { rank },
      });
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-3xl bg-[#0f1f3d] p-5 text-white shadow-lg sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-xl font-black">
            <Sparkles size={20} className="text-[#f59e0b]" aria-hidden /> {t.title}
          </h1>
          <div className="flex rounded-full bg-white/10 p-1 text-xs font-bold" role="group" aria-label="Langue">
            {(["fr", "da"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`rounded-full px-3 py-1 ${lang === l ? "bg-[#f59e0b] text-[#0f1f3d]" : "text-white/70"}`}
              >
                {l === "fr" ? "Français" : "Darija"}
              </button>
            ))}
          </div>
        </div>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            analyse(text);
          }}
        >
          <label htmlFor="magic-sentence" className="sr-only">{t.title}</label>
          <textarea
            id="magic-sentence"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder}
            className="w-full resize-none rounded-2xl bg-white px-4 py-3 text-base text-[#0f1f3d] placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-[#f59e0b]/50"
          />
          <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f59e0b] px-4 py-3 font-black text-[#0f1f3d]">
            {t.submit} <ArrowRight size={18} aria-hidden />
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {t.examples.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => analyse(example)}
              className="rounded-full border border-white/20 px-3 py-1.5 text-left text-xs text-white/85 hover:bg-white/10"
            >
              {example}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/60">{t.tip}</p>
      </section>

      {result && (
        <section aria-live="polite" className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {result.understood.length === 0 ? (
            <p className="text-sm font-semibold text-slate-600">{t.notUnderstood}</p>
          ) : (
            <>
              <h2 className="text-lg font-black">{t.understood}</h2>
              <ul className="flex flex-wrap gap-2">
                {result.understood.map((item) => (
                  <li key={`${item.text}-${item.evidence}`} className="rounded-2xl bg-slate-100 px-3 py-2">
                    <span className="flex items-center gap-2 text-sm font-bold">
                      {item.text}
                      {item.inferred && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-800">
                          {t.deduced}
                        </span>
                      )}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {t.youSaid} « {item.evidence} »
                    </span>
                  </li>
                ))}
              </ul>

              {result.missing.map((row) => (
                <div key={row.field} className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wide text-slate-500">{row.label}</span>
                  {row.options.map((option) => (
                    <button
                      key={option.text}
                      type="button"
                      onClick={() => analyse(text.replace(/[\s.!?]+$/, "") + option.append)}
                      className="rounded-full border border-slate-300 px-3 py-1 text-sm font-semibold hover:border-[#0f1f3d]"
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              ))}
            </>
          )}

          {result.plan.notes.map((note) => (
            <p key={note} className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">{note}</p>
          ))}

          {result.plan.actions.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-[.16em] text-[#b45309]">{t.canPrepare}</h3>
              <ol className="mt-3 space-y-2">
                {result.plan.actions.map((action, index) => {
                  const Icon = ICON[action.kind];
                  const body = (
                    <>
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-[#0f1f3d]">
                        <Icon size={19} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2 font-extrabold">
                          {action.label}
                          {action.partner && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                              {t.partnerLink}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 block text-sm leading-5 text-slate-600">{action.reason}</span>
                      </span>
                      {action.href && <ArrowRight size={18} className="shrink-0 text-slate-400" aria-hidden />}
                    </>
                  );
                  const external = Boolean(action.href?.startsWith("http"));
                  return (
                    <li key={action.kind}>
                      {action.href ? (
                        <a
                          href={action.href}
                          target={external ? "_blank" : undefined}
                          rel={action.partner ? "sponsored noopener noreferrer" : external ? "noopener noreferrer" : undefined}
                          onClick={() => onAction(action, index + 1)}
                          className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-slate-300 hover:shadow-md"
                        >
                          {body}
                        </a>
                      ) : (
                        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 p-3 opacity-70">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
          <p className="text-[11px] leading-4 text-slate-400">{t.footer}</p>
        </section>
      )}
    </div>
  );
}
