'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, BellRing, Check, CircleDot, Clock3, MapPinned, ShieldCheck, Sparkles } from 'lucide-react';

type Moment = 'prepare' | 'transit' | 'arrival';

const moments: Record<Moment, { label: string; title: string; description: string }> = {
  prepare: {
    label: 'J-1',
    title: 'Avant le départ',
    description: 'RME surveille ce qui peut encore changer une décision utile.',
  },
  transit: {
    label: 'EN ROUTE',
    title: 'Pendant le trajet',
    description: 'RME ne te donne pas une liste : il cherche le prochain point qui mérite ton attention.',
  },
  arrival: {
    label: 'ARRIVÉE',
    title: 'À l’arrivée',
    description: 'Le voyage continue : le contexte change, les priorités aussi.',
  },
};

const stateByMoment: Record<Moment, string[]> = {
  prepare: ['Paris → Tanger', 'Voiture + famille', 'Ferry demain', 'Documents à confirmer'],
  transit: ['Algésiras', 'Ferry demain', 'Réservation confirmée', 'Prochaine décision : embarquement'],
  arrival: ['Tanger', 'Famille', 'Voiture', 'Prochaine décision : rejoindre Taza'],
};

const actionsByMoment: Record<Moment, { title: string; why: string; tone: string }[]> = {
  prepare: [
    { title: 'Vérifier les documents', why: 'Une information manquante peut bloquer la prochaine étape.', tone: 'Priorité' },
    { title: 'Voir la traversée', why: 'Le ferry est le prochain verrou du trajet.', tone: 'À faire' },
  ],
  transit: [
    { title: 'Préparer l’embarquement', why: 'Le contexte a changé : tu es maintenant côté port.', tone: 'Maintenant' },
    { title: 'Voir le prochain arrêt', why: 'Une seule décision utile doit rester visible.', tone: 'Ensuite' },
  ],
  arrival: [
    { title: 'Reprendre le trajet', why: 'RME conserve la trajectoire au lieu de recommencer une recherche.', tone: 'Continuité' },
    { title: 'Voir les services proches', why: 'La priorité locale remplace la préparation du départ.', tone: 'À proximité' },
  ],
};

export default function ContinuityCompanionLab() {
  const [moment, setMoment] = useState<Moment>('prepare');
  const [checked, setChecked] = useState<string[]>([]);
  const [question, setQuestion] = useState('');

  const state = stateByMoment[moment];
  const actions = useMemo(
    () => actionsByMoment[moment].filter((action) => !checked.includes(action.title)),
    [moment, checked],
  );

  function complete(title: string) {
    setChecked((current) => (current.includes(title) ? current : [...current, title]));
  }

  return (
    <main className="min-h-screen bg-[#eef1f6] text-[#0f1f3d]">
      <section className="bg-gradient-to-b from-[#eef6f1] to-[#e7dfcb] px-5 pb-10 pt-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-[#92400e]">
            <Sparkles size={15} /> RME Lab · Continuity Companion V0
          </div>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
            Le voyage continue
            <span className="block text-[#b45309]">même quand tu ne demandes rien.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Prototype de notre réponse au « petit prompt » : RME ne cherche pas à être une meilleure IA générale.
            Il conserve un état de trajet et n’affiche une action que lorsqu’elle peut changer la prochaine décision.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {(Object.keys(moments) as Moment[]).map((key) => (
              <button
                key={key}
                onClick={() => setMoment(key)}
                className={`rounded-2xl border p-4 text-left transition ${moment === key ? 'border-[#0f1f3d] bg-white shadow-md' : 'border-white/70 bg-white/60 hover:bg-white'}`}
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-[#b45309]">{moments[key].label}</div>
                <div className="mt-1 font-extrabold">{moments[key].title}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl gap-5 px-5 py-8 lg:grid-cols-[.85fr_1.15fr]">
        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black">
            <MapPinned size={18} /> État du trajet
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">{moments[moment].description}</p>
          <div className="mt-5 space-y-2">
            {state.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3 text-sm font-semibold">
                <CircleDot size={14} className="text-[#b45309]" />
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-black">
            <BellRing size={18} /> Une seule question : qu’est-ce qui mérite ton attention ?
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Si rien ne change la prochaine décision, RME reste silencieux. Ici, chaque carte représente une action potentiellement utile.
          </p>

          <div className="mt-5 space-y-3">
            {actions.length ? actions.map((action) => (
              <div key={action.title} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#b45309]">{action.tone}</span>
                    <h2 className="mt-1 font-extrabold">{action.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{action.why}</p>
                  </div>
                  <button
                    onClick={() => complete(action.title)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#0f1f3d] px-3 py-2 text-xs font-bold text-white hover:bg-[#1e3a5f]"
                  >
                    <Check size={14} /> Fait
                  </button>
                </div>
              </div>
            )) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="font-extrabold text-emerald-900">Aucune action inutile.</div>
                <p className="mt-1 text-sm text-emerald-800">RME peut rester silencieux jusqu’à ce qu’un changement mérite ton attention.</p>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-4xl px-5 pb-10">
        <div className="rounded-3xl bg-[#0f1f3d] p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 font-black"><Clock3 size={18} /> Le test du petit prompt</div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            « Je suis à Algeciras, avec ma famille, je prends le ferry demain. » Une IA peut répondre.
            RME doit pouvoir conserver cet état, détecter ce qui change et reprendre exactement au bon moment.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-xs font-black uppercase tracking-widest text-amber-300">IA générale</div>
              <div className="mt-1 font-bold">Réponse à la question</div>
            </div>
            <div className="rounded-2xl bg-white/10 p-4">
              <div className="text-xs font-black uppercase tracking-widest text-amber-300">RME</div>
              <div className="mt-1 font-bold">État → changement → prochaine action</div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 font-black"><ShieldCheck size={18} /> Banc d’essai</div>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Cette zone ne prétend pas démontrer un avantage commercial. Elle sert à trouver les situations où un assistant généraliste
            peut faire la même chose avec un prompt court — puis à chercher ce que l’état persistant, le temps, les données et l’action réelle ajoutent.
          </p>
          <label htmlFor="challenge" className="mt-4 block text-xs font-bold text-slate-600">Phrase à challenger</label>
          <textarea
            id="challenge"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ex. Je pars samedi avec ma voiture et deux enfants, je ne sais pas encore quel ferry prendre."
            className="mt-2 min-h-24 w-full rounded-2xl border border-slate-300 p-3 text-sm outline-none focus:border-[#0f1f3d]"
          />
          <button
            onClick={() => setQuestion(question.trim())}
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-bold hover:bg-slate-50"
          >
            Lancer le challenge <ArrowRight size={15} />
          </button>
        </div>
      </section>
    </main>
  );
}
