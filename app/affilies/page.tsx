import type { Metadata } from 'next';
import Link from 'next/link';
import { ExternalLink, CheckCircle2, AlertCircle, Clock, Banknote } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Guide Affiliés RME Voyage — S\'inscrire et être payé',
  description: 'Guide complet pour s\'inscrire aux programmes d\'affiliation Wise, WorldRemit, Western Union, GNV, FRS et être payé sur votre IBAN.',
  robots: { index: false, follow: false },
};

const programs = [
  {
    name: 'Wise (TransferWise)',
    category: 'Transfert d\'argent',
    commission: '€10–25 par nouveau client activé',
    payout: 'Virement SEPA mensuel dès €100',
    delay: '30 jours après activation',
    signupUrl: 'https://wise.com/affiliates',
    deepLinkBase: 'https://wise.com/invite/',
    envKey: 'WISE_AFFILIATE_URL',
    status: 'recommended',
    notes: 'Programme le plus rentable. Cookie 30 jours. Dashboard Partnerize.',
    steps: [
      'Aller sur wise.com/affiliates → "Join the program"',
      'Créer un compte Partnerize (si pas déjà fait)',
      'Renseigner ton IBAN pour les virements',
      'Attendre validation (24–72h)',
      'Copier ton lien affilié et le mettre dans WISE_AFFILIATE_URL',
    ],
  },
  {
    name: 'WorldRemit',
    category: 'Transfert d\'argent',
    commission: '€5–15 par nouveau client + 1% sur les transferts récurrents',
    payout: 'Virement SEPA mensuel dès €50',
    delay: '45 jours',
    signupUrl: 'https://affiliates.worldremit.com',
    deepLinkBase: 'https://www.worldremit.com/fr?refCode=',
    envKey: 'WORLDREMIT_AFFILIATE_URL',
    status: 'recommended',
    notes: 'Réseau Impact. Bonus sur clients récurrents = revenu passif puissant.',
    steps: [
      'Aller sur affiliates.worldremit.com',
      'S\'inscrire sur Impact Radius',
      'Renseigner ton IBAN/PayPal',
      'Générer un lien de tracking',
      'Mettre dans WORLDREMIT_AFFILIATE_URL',
    ],
  },
  {
    name: 'Remitly',
    category: 'Transfert d\'argent',
    commission: '€8–20 par nouveau client',
    payout: 'PayPal ou virement mensuel dès €50',
    delay: '30 jours',
    signupUrl: 'https://www.remitly.com/gb/en/landing/partner',
    deepLinkBase: 'https://www.remitly.com/?utm_source=rmevoyage&ref=',
    envKey: 'REMITLY_AFFILIATE_URL',
    status: 'good',
    notes: 'Réseau Commission Junction (CJ). Taux compétitifs sur le couloir EUR→MAD.',
    steps: [
      'Aller sur la page partenaires Remitly',
      'Rejoindre via CJ Affiliate (Commission Junction)',
      'Configurer le paiement IBAN dans CJ',
      'Créer un lien tracking',
      'Mettre dans REMITLY_AFFILIATE_URL',
    ],
  },
  {
    name: 'Western Union',
    category: 'Transfert d\'argent',
    commission: '€3–8 par transaction générée',
    payout: 'Virement mensuel dès €100',
    delay: '60 jours',
    signupUrl: 'https://www.westernunion.com/fr/fr/partner-with-us.html',
    deepLinkBase: 'https://www.westernunion.com/fr/fr/send-money/?utm_source=rmevoyage&amount=',
    envKey: 'WESTERN_UNION_AFFILIATE_URL',
    status: 'standard',
    notes: 'Programme direct WU ou via Awin. Délai de paiement plus long (60j).',
    steps: [
      'Rejoindre via Awin : awin.com → chercher "Western Union"',
      'Configurer paiement IBAN dans Awin',
      'Obtenir lien affilié',
      'Mettre dans WESTERN_UNION_AFFILIATE_URL',
    ],
  },
  {
    name: 'MoneyGram',
    category: 'Transfert d\'argent',
    commission: '€2–6 par transaction',
    payout: 'Virement mensuel dès €50',
    delay: '45 jours',
    signupUrl: 'https://www.moneygram.com/mgo/us/en/partner-with-us',
    deepLinkBase: 'https://www.moneygram.com/mgo/?utm_source=rmevoyage&amount=',
    envKey: 'MONEYGRAM_AFFILIATE_URL',
    status: 'standard',
    notes: 'Réseau Awin également. CPA plus faible que Wise mais volume Maroc élevé.',
    steps: [
      'Rejoindre via Awin',
      'Chercher "MoneyGram" dans les annonceurs',
      'Configurer IBAN',
      'Créer lien tracking',
      'Mettre dans MONEYGRAM_AFFILIATE_URL',
    ],
  },
  {
    name: 'GNV (Grandi Navi Veloci)',
    category: 'Ferry',
    commission: '3–5% sur le prix du billet',
    payout: 'Virement mensuel',
    delay: '30 jours après traversée',
    signupUrl: 'https://www.gnv.it/fr/info/partenaires.html',
    deepLinkBase: 'https://www.gnv.it/fr/booking?utm_source=rmevoyage&ref=',
    envKey: 'GNV_AFFILIATE_URL',
    status: 'good',
    notes: 'Leader ferry Gênes-Tanger, Barcelone-Tanger. CPA moyen = €15–40/billet famille.',
    steps: [
      'Contacter GNV via leur page partenaires',
      'Ou rejoindre via le réseau Travelpayouts',
      'Configurer paiement IBAN',
      'Obtenir lien tracking',
      'Ajouter en env var GNV_AFFILIATE_URL',
    ],
  },
  {
    name: 'FRS (Fred. Olsen)',
    category: 'Ferry',
    commission: '2–4% sur le billet',
    payout: 'Virement mensuel',
    delay: '30 jours',
    signupUrl: 'https://www.frs.es/en/partners',
    deepLinkBase: 'https://www.frs.es/?utm_source=rmevoyage&ref=',
    envKey: 'FRS_AFFILIATE_URL',
    status: 'standard',
    notes: 'Tarifa↔Tanger, Algeciras↔Ceuta. Programme plus petit mais lien direct possible.',
    steps: [
      'Contacter FRS directement via frs.es/en/partners',
      'Demander un contrat d\'affiliation direct',
      'IBAN pour paiement',
      'Ajouter en env var FRS_AFFILIATE_URL',
    ],
  },
];

const statusConfig = {
  recommended: { label: 'Priorité 1', color: 'bg-emerald-100 text-emerald-800' },
  good: { label: 'Priorité 2', color: 'bg-blue-100 text-blue-800' },
  standard: { label: 'Priorité 3', color: 'bg-gray-100 text-gray-700' },
};

export default function AffiliatesPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] text-[#0f1f3d]">
      {/* Nav */}
      <nav className="bg-[#0f1f3d] px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-base font-black text-white">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#f59e0b] text-sm text-[#0f1f3d]">R</span>
            RME <span className="font-medium text-[#f5cd93]">Voyage</span>
          </Link>
          <Link href="/" className="text-sm text-white/70 hover:text-white">← Retour</Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <div className="mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#0f1f3d]/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-widest text-[#0f1f3d]">
            Guide interne
          </span>
          <h1 className="mt-4 text-4xl font-display font-semibold tracking-tight">
            Guide d'inscription affiliés
          </h1>
          <p className="mt-3 text-lg text-[#5a716c]">
            Pour chaque programme : lien d'inscription, commission, délai de paiement, et les étapes exactes.
            Une fois inscrit, colle l'URL affilié dans la variable d'environnement Vercel correspondante.
          </p>
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <strong>Comment ça marche :</strong> Tu t'inscris → tu reçois un lien de tracking unique → tu le mets dans Vercel
            (Settings → Environment Variables) → RME Voyage utilise automatiquement ton lien. Chaque clic qui
            mène à un transfert te rapporte une commission virée sur ton IBAN.
          </div>
        </div>

        {/* Revenue estimate */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Si 100 clics/mois Wise', value: '~€1 000–2 500/mois', note: 'Taux de conversion 10–25%' },
            { label: 'Si 50 billets ferry/mois', value: '~€750–2 000/mois', note: 'Billet moyen famille €150–400' },
            { label: 'Si 3 clients B2B/an', value: '~€1 470–5 970/an', note: 'Récurrent, zéro support' },
          ].map(({ label, value, note }) => (
            <div key={label} className="premium-card rounded-xl p-5">
              <Banknote size={20} className="text-[#0369a1]" />
              <p className="mt-3 text-sm text-[#5a716c]">{label}</p>
              <p className="mt-1 text-xl font-black text-[#0f1f3d]">{value}</p>
              <p className="mt-1 text-xs text-[#5a716c]">{note}</p>
            </div>
          ))}
        </div>

        {/* Programs */}
        <div className="space-y-8">
          {programs.map((prog) => {
            const st = statusConfig[prog.status as keyof typeof statusConfig];
            return (
              <article key={prog.name} className="premium-card rounded-2xl p-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-extrabold">{prog.name}</h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${st.color}`}>{st.label}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-[#5a716c]">{prog.category}</p>
                  </div>
                  <a
                    href={prog.signupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg bg-[#0f1f3d] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0f1f3d]"
                  >
                    S'inscrire <ExternalLink size={14} />
                  </a>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-[#f8fafc] p-3">
                    <p className="text-xs text-[#5a716c]">Commission</p>
                    <p className="mt-0.5 text-sm font-bold">{prog.commission}</p>
                  </div>
                  <div className="rounded-lg bg-[#f8fafc] p-3">
                    <p className="text-xs text-[#5a716c]">Paiement</p>
                    <p className="mt-0.5 text-sm font-bold">{prog.payout}</p>
                  </div>
                  <div className="rounded-lg bg-[#f8fafc] p-3">
                    <p className="text-xs text-[#5a716c]">Délai</p>
                    <p className="mt-0.5 text-sm font-bold">{prog.delay}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-[#e6ede9] bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#0369a1]">Variable Vercel à remplir</p>
                  <code className="mt-1 block font-mono text-sm text-[#0f1f3d]">{prog.envKey}</code>
                  <p className="mt-1 text-xs text-[#5a716c]">Base du lien deep : <span className="font-mono">{prog.deepLinkBase}</span></p>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#5a716c]">Étapes</p>
                  <ol className="space-y-1.5">
                    {prog.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#0f1f3d] text-xs font-bold text-white">{i + 1}</span>
                        <span className="text-[#5a716c]">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {prog.notes && (
                  <p className="mt-4 flex items-start gap-2 text-xs text-[#5a716c]">
                    <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-500" />
                    {prog.notes}
                  </p>
                )}
              </article>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-12 rounded-2xl bg-[#0f1f3d] p-8 text-white">
          <h2 className="text-2xl font-display font-semibold">Ordre d'action recommandé</h2>
          <ol className="mt-5 space-y-3">
            {[
              'Wise (priorité absolue — meilleure commission, meilleur produit)',
              'WorldRemit (récurrence = revenu passif)',
              'GNV (billet famille = CPA moyen élevé)',
              'Remitly + MoneyGram (volume Maroc)',
              'Western Union + FRS (complémentaires)',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#f59e0b] text-sm font-black text-[#0f1f3d]">{i + 1}</span>
                <span className="text-white/85 text-sm">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-sm text-white/60">
            Une fois inscrits, ajoute les URLs dans Vercel → Settings → Environment Variables → Redeploy.
            RME Voyage injecte les liens automatiquement dans le comparateur.
          </p>
        </div>
      </div>

      <footer className="bg-[#080f28] py-8 text-center text-sm text-white/40">
        © 2026 RME Voyage — Nova Presta · <Link href="/" className="hover:text-white/70">Retour à l'accueil</Link>
      </footer>
    </main>
  );
}
