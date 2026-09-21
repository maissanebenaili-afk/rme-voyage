'use client';

import { useCallback, useState } from 'react';
import { Smartphone } from 'lucide-react';

type AiraloWidgetProps = {
  destination?: string;
  userId?: string;
  source?: string;
};

export default function AiraloWidget({ destination, userId, source = 'widget' }: AiraloWidgetProps) {
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
            program: 'airalo',
            source,
            destination,
          }),
        }).catch(console.error); // Non-blocking
      }

      // Get affiliate link
      const response = await fetch('/api/affiliate/link?program=esim');
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to get Airalo link:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, destination, source]);

  return (
    <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
          <Smartphone className="h-6 w-6 text-blue-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900">
            Besoin de données à l'étranger?
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Achetez une eSIM Airalo pour rester connecté dans {destination || 'votre destination'}.
            Données sans engagement, activation instantanée.
          </p>

          <button
            onClick={handleClick}
            disabled={isLoading}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Chargement...' : 'Découvrir Airalo'}
            <span className="text-sm">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
