import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Car, Clock, Fuel, Ship } from 'lucide-react';
import { countryName } from '@/lib/countries';
import { computeFuelByCountry, FUEL_PRICES } from '@/lib/fuelByCountry';
import {
  ferryOf,
  formatDuration,
  formatKm,
  frenchDate,
  getRoutePage,
  NON_EU_FALLBACK_PRICE,
  REFERENCE_CONSUMPTION_L_PER_100KM,
  ROUTE_PAGES,
  type RoutePage,
} from '@/lib/routePages';
import { siteUrl } from '@/lib/siteUrl';

// Données statiques ; on régénère chaque jour pour que la fraîcheur du
// bulletin carburant affichée reste juste sans nouveau déploiement.
export const revalidate = 86_400;
export const dynamicParams = false;

export function generateStaticParams() {
  return ROUTE_PAGES.routes.map((route) => ({ slug: route.slug }));
}

function title(route: RoutePage) {
  return `${route.originCity} → ${route.destinationCity} en voiture : distance, durée et budget`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const route = getRoutePage((await params).slug);
  if (!route) return {};
  const ferry = ferryOf(route);
  const description =
    `${route.originCity} → ${route.destinationCity} : ${formatKm(route.distanceMeters)} de route et ` +
    `${formatDuration(route.durationSeconds)} de conduite` +
    (ferry ? `, via la traversée ${ferry.from} → ${ferry.to}` : '') +
    `. Coût du carburant pays par pays, calculé sur les prix officiels de l'Union européenne.`;
  return {
    title: title(route),
    description,
    alternates: { canonical: `/trajet/${route.slug}` },
    openGraph: {
      title: `${route.originCity} → ${route.destinationCity} | RME Voyage`,
      description,
      url: `${siteUrl}/trajet/${route.slug}`,
      type: 'article',
    },
  };
}

function eur(value: number, digits = 0) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export default async function TrajetPage({ params }: { params: Promise<{ slug: string }> }) {
  const route = getRoutePage((await params).slug);
  if (!route) notFound();

  const ferry = ferryOf(route);
  const fuel = computeFuelByCountry({
    legs: route.legs,
    consumptionPer100Km: REFERENCE_CONSUMPTION_L_PER_100KM,
    fuelType: 'diesel',
    fallbackPricePerLiter: NON_EU_FALLBACK_PRICE,
    now: new Date(),
  });
  const planUrl = `/?from=${encodeURIComponent(route.origin)}&to=${encodeURIComponent(route.destination)}#planifier`;
  const others = ROUTE_PAGES.routes.filter((other) => other.slug !== route.slug).slice(0, 6);

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#fffdf8] text-[#0f1f3d]">
      {/* Un seul fil d'Ariane par page, décrivant cette page précise. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
              { '@type': 'ListItem', position: 2, name: 'Trajets', item: `${siteUrl}/trajet` },
              {
                '@type': 'ListItem',
                position: 3,
                name: `${route.originCity} → ${route.destinationCity}`,
                item: `${siteUrl}/trajet/${route.slug}`,
              },
            ],
          }),
        }}
      />

      <header className="bg-[#0f1f3d] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Fil d'Ariane" className="text-xs font-semibold uppercase tracking-[.16em] text-[#fde68a]">
            <Link href="/" className="inline-block py-1 hover:underline">
              Accueil
            </Link>{' '}
            ·{' '}
            <Link href="/trajet" className="inline-block py-1 hover:underline">
              Trajets
            </Link>
          </nav>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title(route)}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            Itinéraire calculé sur les données OpenStreetMap, le {frenchDate(ROUTE_PAGES.generatedAt)}. Les prix des
            billets de ferry et des vols ne sont pas publiés ici : ils changent tous les jours et ne sont vérifiables
            qu'auprès des compagnies.
          </p>

          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: Car, label: 'Distance routière', value: formatKm(route.distanceMeters) },
              { icon: Clock, label: 'Durée de conduite', value: formatDuration(route.durationSeconds) },
              {
                icon: ferry ? Ship : Fuel,
                label: ferry ? 'Traversée' : 'Carburant estimé',
                value: ferry ? `${ferry.from} → ${ferry.to}` : eur(fuel.fuelTotal),
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl bg-white/5 p-4">
                <dt className="flex items-center gap-2 text-xs text-white/60">
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </dt>
                <dd className="mt-1 text-lg font-bold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <section aria-labelledby="etapes-title">
          <h2 id="etapes-title" className="font-display text-2xl font-semibold">
            Les étapes du trajet
          </h2>
          <ol className="mt-4 space-y-3">
            {fuel.legs.map((leg, index) =>
              leg.kind === 'ferry' ? (
                <li key={index} className="flex items-start gap-3 rounded-2xl bg-[#eff6ff] p-4 text-sm text-[#1e3a5f]">
                  <Ship size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <span>
                    <strong>
                      Traversée {leg.from}
                      {leg.to ? ` → ${leg.to}` : ''}
                    </strong>{' '}
                    ·{' '}
                    {leg.measured === 'straight-line'
                      ? `environ ${formatKm(leg.km * 1000)} à vol d'oiseau`
                      : `${formatKm(leg.km * 1000)} de ligne maritime`}
                    . Horaires, tarifs et compagnies sont à vérifier directement auprès des opérateurs ; la durée de
                    conduite ci-dessus ne comprend ni la traversée ni l'attente à l'embarquement.
                  </span>
                </li>
              ) : (
                <li key={index} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#e2e8f0]">
                  <div className="flex flex-wrap justify-between gap-2 font-semibold">
                    <span>
                      {leg.from} → {leg.to}
                    </span>
                    <span>{formatKm(leg.km * 1000)}</span>
                  </div>
                  <ul className="mt-2 text-sm text-[#475569]">
                    {leg.countries.map((line) => (
                      <li key={line.country ?? 'none'} className="flex justify-between gap-3 py-0.5">
                        <span>{countryName(line.country)}</span>
                        <span>{formatKm(line.km * 1000)}</span>
                      </li>
                    ))}
                  </ul>
                </li>
              ),
            )}
          </ol>
        </section>

        <section aria-labelledby="carburant-title" className="mt-10">
          <h2 id="carburant-title" className="font-display text-2xl font-semibold">
            Combien coûte le carburant ?
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#475569]">
            Estimation pour un véhicule diesel consommant{' '}
            {REFERENCE_CONSUMPTION_L_PER_100KM.toLocaleString('fr-FR')} L/100 km, aux prix
            moyens à la pompe de chaque pays. Aucun carburant n'est compté pendant la traversée.
          </p>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-[#64748b]">
                <th className="py-2 text-left font-semibold">Pays</th>
                <th className="py-2 text-right font-semibold">Distance</th>
                <th className="py-2 text-right font-semibold">Prix du gazole</th>
                <th className="py-2 text-right font-semibold">Carburant</th>
              </tr>
            </thead>
            <tbody>
              {fuel.countries.map((line) => (
                <tr key={line.country ?? 'none'} data-country={line.country ?? ''} className="border-t border-[#e2e8f0]">
                  <td className="py-2 font-semibold">{countryName(line.country)}</td>
                  <td className="py-2 text-right">{formatKm(line.km * 1000)}</td>
                  <td className="py-2 text-right">
                    {eur(line.pricePerLiter, 3)}/L
                    {line.priceSource === 'user' ? ' (hypothèse)' : ''}
                  </td>
                  <td className="py-2 text-right font-bold">{eur(line.cost)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-[#0f1f3d]">
                <td className="py-2 font-bold" colSpan={3}>
                  Carburant, aller simple
                </td>
                <td className="py-2 text-right font-black">{eur(fuel.fuelTotal)}</td>
              </tr>
            </tbody>
          </table>
          <p className="mt-3 text-xs leading-5 text-[#64748b]">
            Prix de l'Union européenne : moyennes nationales à la pompe, taxes comprises, du{' '}
            <a href={FUEL_PRICES.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">
              Weekly Oil Bulletin
            </a>{' '}
            de la Commission européenne, relevés le {frenchDate(FUEL_PRICES.observedAt)}
            {fuel.dataset.fresh ? '' : " — ces prix ont plus de deux semaines, vérifiez-les avant de partir"}. Hors
            Union européenne, aucune source officielle n'est intégrée : {eur(NON_EU_FALLBACK_PRICE, 2)}/L est une
            hypothèse, à remplacer par le prix que vous constatez. Les stations d'autoroute sont souvent plus chères.
            Péages, billet de ferry, repas et hébergement ne sont pas compris.
          </p>

          <Link
            href={planUrl}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0f1f3d] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#1e3a5f]"
          >
            Calculer ce trajet avec mes hypothèses <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>

        {route.crossings.length > 1 && (
          <section aria-labelledby="traversees-title" className="mt-10">
            <h2 id="traversees-title" className="font-display text-2xl font-semibold">
              Les autres traversées possibles
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#475569]">
              Classées par distance totale (route plus mer). La plus courte n'est pas forcément la moins chère ni la
              plus rapide : cela dépend des tarifs et des horaires du jour.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              {route.crossings.map((crossing) => (
                <li
                  key={`${crossing.from}-${crossing.to}`}
                  className="flex flex-wrap justify-between gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-[#e2e8f0]"
                >
                  <span className="font-semibold">
                    {crossing.from} → {crossing.to}
                  </span>
                  <span className="text-[#475569]">
                    {formatKm(crossing.roadMeters)} de route, {formatKm(crossing.seaMeters)} de mer
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="autres-title" className="mt-10 border-t border-[#e2e8f0] pt-8">
          <h2 id="autres-title" className="font-display text-xl font-semibold">
            Autres trajets
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2 text-sm">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/trajet/${other.slug}`}
                  className="inline-block rounded-full bg-white px-3 py-1.5 font-semibold shadow-sm ring-1 ring-[#e2e8f0] hover:ring-[#0f1f3d]"
                >
                  {other.originCity} → {other.destinationCity}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/trajet" className="inline-block rounded-full px-3 py-1.5 font-semibold underline">
                Voir tous les trajets
              </Link>
            </li>
          </ul>
        </section>

        <p className="mt-8 text-xs leading-5 text-[#64748b]">Source de l'itinéraire : {ROUTE_PAGES.source}.</p>
      </div>
    </main>
  );
}
