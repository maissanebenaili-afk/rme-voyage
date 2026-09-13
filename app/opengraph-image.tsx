import { ImageResponse } from 'next/og';

export const alt = 'RME Voyage : préparez et partagez votre voyage Europe - Maroc';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', padding: '68px', background: '#0d3f38', color: '#faf7ed' }}>
      <div style={{ display: 'flex', color: '#e6a44e', fontSize: 36, fontWeight: 700 }}>RME Voyage</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 70, fontWeight: 700 }}>Votre voyage. Ensemble.</div>
        <div style={{ display: 'flex', fontSize: 34, marginTop: 28 }}>Préparez et partagez votre trajet Europe - Maroc.</div>
      </div>
      <div style={{ display: 'flex', fontSize: 26, color: '#e6a44e' }}>Itinéraire · Budget · Ferry · Vol</div>
    </div>,
    size,
  );
}
