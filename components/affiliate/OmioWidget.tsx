'use client';

import { useCallback, useState } from 'react';
import { Zap } from 'lucide-react';

type OmioWidgetProps = {
  origin?: string;
  destination?: string;
  userId?: string;
  source?: string;
};

export default function OmioWidget({
  origin,
  destination,
  userId,
  source = 'widget',
}: OmioWidgetProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setIsLoading(true);

    try {
      // Track the click
      if (userId) {
        await fetch('/api/affiliate/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({
            program: 'omio',
            source,
            origin,
            destination,
          }),
        }).catch(console.error); // Non-blocking
      }

      // Get affiliate link
      const params = new URLSearchParams();
      if (origin) params.set('origin', origin);
      if (destination) params.set('destination', destination);
      const response = await fetch(`/api/affiliate/link?program=omio&${params}`);
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to get Omio link:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, origin, destination, source]);

  return (
    <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
          <Zap className="h-6 w-6 text-purple-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">
            Trajet multimodal vers {destination || 'votre destination'}?
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Comparez bus, trains et vols combinés sur Omio. Jusqu'à 5% de commission sur chaque
            réservation multimodale. Itinéraires flexibles, paiement sécurisé.
          </p>

          <button
            onClick={handleClick}
            disabled={isLoading}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 font-semibold text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Chargement...' : 'Réserver sur Omio'}
            <span className="text-sm">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
