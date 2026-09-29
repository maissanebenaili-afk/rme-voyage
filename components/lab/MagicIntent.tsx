"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Bus, Car, Check, FileText, Hotel, Plane, Route, Save, Share2, Smartphone, Sparkles, Wallet } from "lucide-react";
import { CHECKLIST_PREFIX } from "@/components/TravelChecklist";
import { extractIntent } from "@/lib/lab/intentFacts";
import { doneActions, journeyState } from "@/lib/lab/journeyState";
import {
  departureDate,
  describeFacts,
  planNextActions,
  rankedChoices,
  type MagicAction,
  type MagicActionKind,
  type MagicLang,
  type RouteIndexEntry,
} from "@/lib/lab/nextBestAction";
import type { PartnerCatalogueEntry } from "@/lib/partnerCatalogue";
import { trackFunnelEvent, trackPartnerClick, type PartnerProduct } from "@/lib/partnerTracking";
import { toLocalIsoDate } from "@/lib/travel/travelPhase";
import { useTravelStorage } from "@/lib/travel/useTravelStorage";

const ICON: Record<MagicActionKind, typeof Plane> = {
  papers: FileText, flight: Plane, route: Route, local_transfer: Bus, hotel: Hotel, car_rental: Car, money: Wallet, sim: Smartphone,
};

const PRODUCT: Record<MagicActionKind, PartnerProduct> = {
  papers: "other", flight: "flight", route: "ferry", local_transfer: "transfer", hotel: "hotel", car_rental: "car_rental", money: "transfer", sim: "other",
};

const MAX_SHARED_CHARS = 300;

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
    save: "Enregistrer ce voyage sur ce téléphone",
    saved: "Enregistré sur ce téléphone : RME suit maintenant votre voyage.",
    share: "Partager",
    shareIntro: "Je prépare mon voyage :",
    shareCta: "Prépare le tien avec RME :",
    myTrip: "Mon voyage",
    phase: { "mon-voyage": "À définir", preparer: "Préparer", route: "Départ aujourd’hui", maroc: "Au Maroc" },
    daysLeft: (n: number) => (n === 1 ? "départ demain" : `départ dans ${n} jours`),
    ready: (done: number, total: number) => `${done}/${total} prêts`,
    nextStep: "Prochaine étape",
    allSet: "Tout est coché. Bonne route !",
    footer: "Prototype RME Lab. Une date marquée « déduit » est calculée par RME : vérifiez-la. Votre voyage reste sur ce téléphone.",
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
    save: "Sjjel had s-safar f had telephone",
    saved: "Tsjjel f had telephone: RME kaytab3 s-safar dyalk.",
    share: "Partager",
    shareIntro: "Kanwajjed s-safar dyali:",
    shareCta: "Wajjed dyalk m3a RME:",
    myTrip: "S-safar dyali",
    phase: { "mon-voyage": "Mazal", preparer: "Wajjed", route: "Safar lyoum", maroc: "F l-Maghrib" },
    daysLeft: (n: number) => (n === 1 ? "safar ghedda" : `b9aw ${n} ayyam`),
    ready: (done: number, total: number) => `${done}/${total} wajdin`,
    nextStep: "L-khotwa jaya",
    allSet: "Kolchi m-cochi. Triq salama!",
    footer: "Prototype RME Lab. Tarikh fih « mstantaj » 7sbato RME: t2akked mno. S-safar dyalk kaybqa f had telephone.",
  },
} as const;

type Props = { partners: PartnerCatalogueEntry[]; routes: RouteIndexEntry[] };

export default function MagicIntent({ partners: initialPartners, routes }: Props) {
  const [lang, setLang] = useState<MagicLang>("fr");
  const [text, setText] = useState("");
  const [analysed, setAnalysed] = useState<{ sentence: string; today: string } | null>(null);
  const [partners, setPartners] = useState(initialPartners);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const { travel, updateTravel, isHydrated } = useTravelStorage();
  const t = TEXT[lang];

  const analyse = (sentence: string) => {
    setText(sentence);
    setSavedAt(null);
    if (sentence.trim()) setAnalysed({ sentence, today: toLocalIsoDate(new Date()) });
  };

  // A shared link (?q=…&lang=da) opens on its sentence, already understood.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get("q")?.slice(0, MAX_SHARED_CHARS);
    if (params.get("lang") === "da") setLang("da");
    if (shared?.trim()) analyse(shared);
  }, []);

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

  // The user's own checklist ticks, shared with the home page checklist.
  const ticked = useMemo(
    () => new Set(travel.checklistProgress.filter((k) => k.startsWith(CHECKLIST_PREFIX)).map((k) => k.slice(CHECKLIST_PREFIX.length))),
    [travel.checklistProgress],
  );

  const result = useMemo(() => {
    if (!analysed) return null;
    const facts = extractIntent(analysed.sentence, analysed.today);
    const done = isHydrated ? doneActions(ticked, travel.modeTransport) : [];
    return {
      facts,
      understood: describeFacts(facts, lang, analysed.today),
      // The two questions whose answers change the plan the most.
      missing: rankedChoices(analysed.sentence, { partners, routes, today: analysed.today, lang, done }),
      plan: planNextActions(facts, { partners, routes, today: analysed.today, lang, done }),
    };
  }, [analysed, lang, partners, routes, ticked, travel.modeTransport, isHydrated]);

  const journey = useMemo(() => {
    if (!isHydrated || (!travel.dateVoyage && !travel.villes.arrivee)) return null;
    return journeyState(travel, ticked, toLocalIsoDate(new Date()), lang);
  }, [isHydrated, travel, ticked, lang]);

  const toggleStep = (id: string) => {
    const key = `${CHECKLIST_PREFIX}${id}`;
    updateTravel((prev) => ({
      checklistProgress: prev.checklistProgress.includes(key)
        ? prev.checklistProgress.filter((entry) => entry !== key)
        : [...prev.checklistProgress, key],
    }));
  };

  const saveTrip = () => {
    if (!result || !analysed) return;
    const { facts } = result;
    const city = facts.destination?.value.label ?? facts.destinationGuess?.value.label;
    updateTravel((prev) => ({
      villes: {
        depart: facts.origin?.value.label ?? prev.villes.depart,
        arrivee: city ?? (facts.country ? "Maroc" : prev.villes.arrivee),
      },
      dateVoyage: departureDate(facts, analysed.today) ?? prev.dateVoyage,
      modeTransport: facts.mode?.value ?? prev.modeTransport,
    }));
    setSavedAt(analysed.sentence);
    trackFunnelEvent({ event: "hadak_next_action", placement: "magic", data: { action: "save_trip" } });
  };

  const share = async () => {
    if (!result || !analysed) return;
    const query = new URLSearchParams({ q: analysed.sentence.slice(0, MAX_SHARED_CHARS), ...(lang === "da" ? { lang } : {}) });
    const url = `${window.location.origin}/lab/intention?${query}`;
    const message = `${t.shareIntro} ${result.understood.map((i) => i.text).join(" · ")}. ${t.shareCta}`;
    trackFunnelEvent({ event: "hadak_next_action", placement: "magic", data: { action: "share" } });
    if (typeof navigator.share === "function") {
      await navigator.share({ text: message, url }).catch(() => {});
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`, "_blank", "noopener,noreferrer");
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
      {journey && (
        <section aria-label={t.myTrip} className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-emerald-800">{t.myTrip}</p>
              <p className="mt-1 text-lg font-black text-[#0f1f3d]">
                {[travel.villes.depart, travel.villes.arrivee].filter(Boolean).join(" → ") || "—"}
              </p>
              <p className="text-sm font-semibold text-emerald-900">
                {t.phase[journey.phase]}
                {journey.phase === "preparer" && journey.daysUntilDeparture !== null && ` · ${t.daysLeft(journey.daysUntilDeparture)}`}
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-emerald-800">{t.ready(journey.done, journey.steps.length)}</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white" aria-hidden>
            <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.round((journey.done / journey.steps.length) * 100)}%` }} />
          </div>
          <p className="mt-3 text-sm font-bold text-[#0f1f3d]">
            {journey.next ? `${t.nextStep} : ${journey.next.label}` : t.allSet}
          </p>
          <ul className="mt-2 space-y-1">
            {journey.steps.map((step) => (
              <li key={step.id}>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={step.done} onChange={() => toggleStep(step.id)} className="h-4 w-4 accent-emerald-700" />
                  <span className={step.done ? "line-through opacity-60" : ""}>{step.label}</span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

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
            dir="auto"
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
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-black">{t.understood}</h2>
                <button
                  type="button"
                  onClick={share}
                  className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1 text-sm font-bold hover:border-[#0f1f3d]"
                >
                  <Share2 size={15} aria-hidden /> {t.share}
                </button>
              </div>
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
                    <span className="block text-[11px] text-slate-500" dir="auto">
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
                  const Icon = action.done ? Check : ICON[action.kind];
                  const body = (
                    <>
                      <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${action.done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-[#0f1f3d]"}`}>
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
                  const tone = action.done ? "opacity-60" : "";
                  return (
                    <li key={action.kind}>
                      {action.href ? (
                        <a
                          href={action.href}
                          target={external ? "_blank" : undefined}
                          rel={action.partner ? "sponsored noopener noreferrer" : external ? "noopener noreferrer" : undefined}
                          onClick={() => onAction(action, index + 1)}
                          className={`flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-slate-300 hover:shadow-md ${tone}`}
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

              {isHydrated && (
                savedAt === analysed?.sentence ? (
                  <p className="mt-3 flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
                    <Check size={16} aria-hidden /> {t.saved}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={saveTrip}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#0f1f3d] px-4 py-2.5 text-sm font-black text-[#0f1f3d]"
                  >
                    <Save size={16} aria-hidden /> {t.save}
                  </button>
                )
              )}
            </div>
          )}
          <p className="text-[11px] leading-4 text-slate-400">{t.footer}</p>
        </section>
      )}
    </div>
  );
}
