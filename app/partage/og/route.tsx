import { ImageResponse } from 'next/og';
import { shareCardFacts, shareCardFromQuery } from '@/lib/shareCard';

// Aperçu d'un lien de trajet partagé : uniquement les villes saisies et, si le
// couple est un trajet pré-calculé, ses vrais chiffres. Aucune distance inventée.
export async function GET(request: Request) {
  const sp = new URL(request.url).searchParams;
  const card = shareCardFromQuery({ from: sp.get('from') ?? '', to: sp.get('to') ?? '' });
  const facts = card ? shareCardFacts(card) : null;
  const cut = (v: string) => (v.length > 34 ? `${v.slice(0, 33)}…` : v);
  const title = card ? `${cut(card.from)} → ${cut(card.to)}` : 'Votre voyage. Ensemble.';
  const long = title.length > 28;

  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', padding: '68px', color: '#faf7ed',
      background: 'radial-gradient(circle at 78% 92%, rgba(245,158,11,0.55) 0%, rgba(245,158,11,0) 46%), #0a1730' }}>
      <div style={{ display: 'flex', color: '#f59e0b', fontSize: 36, fontWeight: 700 }}>RME Voyage</div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: long ? 58 : 76, fontWeight: 700 }}>
          {title}
        </div>
        <div style={{ display: 'flex', fontSize: 36, marginTop: 28, color: '#fde68a' }}>
          {facts ?? 'Préparez et partagez votre trajet Europe - Maroc.'}
        </div>
      </div>
      <div style={{ display: 'flex', fontSize: 26, color: '#f59e0b' }}>Itinéraire · Budget · Ferry · Vol</div>
    </div>,
    { width: 1200, height: 630 },
  );
}
