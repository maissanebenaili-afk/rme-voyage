import { ImageResponse } from 'next/og';
import { ferryOf, formatDuration, formatKm, getRoutePage, ROUTE_PAGES } from '@/lib/routePages';

export const alt = 'Trajet en voiture Europe - Maroc : distance, durée et traversée';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return ROUTE_PAGES.routes.map((route) => ({ slug: route.slug }));
}

// Aperçu partagé sur WhatsApp / Facebook : les chiffres réels du trajet,
// issus des mêmes données que la page.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const route = getRoutePage((await params).slug);
  const ferry = route ? ferryOf(route) : null;

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', padding: '68px', background: '#0f1f3d', color: '#faf7ed' }}>
      <div style={{ display: 'flex', color: '#f59e0b', fontSize: 36, fontWeight: 700 }}>RME Voyage</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 72, fontWeight: 700 }}>
          {route ? `${route.originCity} - ${route.destinationCity}` : 'Trajet Europe - Maroc'}
        </div>
        {route && (
          <div style={{ display: 'flex', fontSize: 40, marginTop: 28 }}>
            {`${formatKm(route.distanceMeters)} · ${formatDuration(route.durationSeconds)} de conduite`}
          </div>
        )}
        {ferry && (
          <div style={{ display: 'flex', fontSize: 32, marginTop: 16, color: '#fde68a' }}>
            {`Traversée ${ferry.from} - ${ferry.to}`}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', fontSize: 26, color: '#f59e0b' }}>Distance · Durée · Budget carburant pays par pays</div>
    </div>,
    size,
  );
}
