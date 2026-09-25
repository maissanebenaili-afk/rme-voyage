'use client';

import type { CorridorPulsePayload, NodePulseSnapshot } from '@/lib/types/pulse';

const labels: Record<string, string> = {
  paris: 'Paris',
  barcelona: 'Barcelone',
  algeciras: 'Algésiras',
  tarifa: 'Tarifa',
  tanger_med: 'Tanger Med',
  marrakech: 'Marrakech',
};

function tensionTone(tension: number) {
  if (tension >= 80) return 'bg-red-500';
  if (tension >= 55) return 'bg-orange-500';
  if (tension >= 25) return 'bg-amber-400';
  return 'bg-emerald-500';
}

function levelLabel(tension: number) {
  if (tension >= 80) return 'Critique';
  if (tension >= 55) return 'Élevée';
  if (tension >= 25) return 'Modérée';
  return 'Faible';
}

function NodeCard({ node }: { node: NodePulseSnapshot }) {
  const { metrics } = node;
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#0f1f3d]">{labels[node.nodeId] ?? node.nodeId}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">{node.sampleSize} observations actives</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
          {levelLabel(metrics.tension)}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tension terrain</p>
            <p className="mt-0.5 text-2xl font-black text-[#0f1f3d]">{metrics.tension}<span className="text-sm text-slate-400">/100</span></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Confiance</p>
            <p className="mt-0.5 text-lg font-black text-sky-700">{metrics.confidence}%</p>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${tensionTone(metrics.tension)}`} style={{ width: `${metrics.tension}%` }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-xl bg-slate-50 p-2.5"><span className="text-slate-500">Accord</span><strong className="float-right">{metrics.agreement}%</strong></div>
        <div className="rounded-xl bg-slate-50 p-2.5"><span className="text-slate-500">Fraîcheur</span><strong className="float-right">{metrics.freshness}%</strong></div>
        <div className="rounded-xl bg-slate-50 p-2.5"><span className="text-slate-500">Diversité</span><strong className="float-right">{metrics.sourceDiversity}%</strong></div>
        <div className="rounded-xl bg-slate-50 p-2.5"><span className="text-slate-500">Échantillon</span><strong className="float-right">{metrics.sampleAdequacy}%</strong></div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
        <span className={metrics.earlySignal === 'BREAK' ? 'font-black text-red-700' : metrics.earlySignal === 'ACCELERATION' ? 'font-black text-orange-700' : 'font-semibold text-emerald-700'}>
          {metrics.earlySignal === 'BREAK' ? '⚠ Rupture détectée' : metrics.earlySignal === 'ACCELERATION' ? '↗ Accélération' : '→ Situation stable'}
        </span>
        {metrics.anomaly && <span className="font-black text-red-700">Anomalie</span>}
      </div>
    </article>
  );
}

export default function RoutePulse({ snapshot }: { snapshot: CorridorPulsePayload }) {
  const nodes = Object.values(snapshot.nodes);
  return (
    <section aria-labelledby="route-pulse-title" className="rounded-[2rem] border border-slate-200 bg-slate-50 p-5 shadow-sm sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[.16em] text-[#b45309]">RME Route Pulse</p>
          <h2 id="route-pulse-title" className="mt-2 text-3xl font-black tracking-tight text-[#0f1f3d]">La réalité du corridor, en direct.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Maquette méthodologique : tension, confiance et signaux précoces sont séparés. Les chiffres affichés ici sont des données de démonstration.</p>
        </div>
        <div className="rounded-2xl bg-[#0f1f3d] px-5 py-4 text-white">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/55">Corridor global</p>
          <p className="mt-1 text-3xl font-black">{snapshot.globalPulseScore}<span className="text-sm text-white/50">/100</span></p>
          <p className="text-[11px] text-white/60">Méthode {snapshot.methodologyVersion}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-5">
        {nodes.map((node, index) => (
          <div key={node.nodeId} className="relative">
            {index < nodes.length - 1 && <div aria-hidden="true" className="absolute left-[calc(50%+22px)] right-[calc(-50%+22px)] top-5 hidden h-px bg-slate-300 sm:block" />}
            <div className="relative mx-auto grid h-10 w-10 place-items-center rounded-full border-4 border-slate-50 bg-white shadow-sm">
              <span className={`h-3 w-3 rounded-full ${tensionTone(node.metrics.tension)}`} />
            </div>
            <p className="mt-2 text-center text-[11px] font-extrabold text-slate-700">{labels[node.nodeId] ?? node.nodeId}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {nodes.map((node) => <NodeCard key={node.nodeId} node={node} />)}
      </div>

      <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-xs leading-5 text-sky-900">
        <strong>Lecture :</strong> la tension décrit l'intensité observée ; la confiance décrit la qualité des données disponibles. Une tension élevée avec une confiance faible reste un signal précoce, pas une certitude.
      </div>
    </section>
  );
}
