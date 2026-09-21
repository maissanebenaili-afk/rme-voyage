'use client';

import { useCallback, useState } from 'react';
import { Wifi } from 'lucide-react';

type AffiliateBannerProps = {
  userId?: string;
  destination?: string;
  dismissible?: boolean;
};

export default function AffiliateBanner({
  userId,
  destination = 'votre destination',
  dismissible = true
}: AffiliateBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setIsLoading(true);

    try {
      // Track click
      if (userId) {
        await fetch('/api/affiliate/track', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({
            program: 'airalo',
            source: 'banner',
            destination,
          }),
        }).catch(console.error);
      }

      // Get and redirect to Airalo
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
  }, [userId, destination]);

  if (isDismissed) return null;

  return (
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-400 p-4 rounded shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Wifi className="h-5 w-5 text-orange-600 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold text-slate-900">
              Connectivité internationale
            </p>
            <p className="text-slate-600 text-xs mt-0.5">
              eSIM Airalo pour rester connecté à {destination}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClick}
            disabled={isLoading}
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? '...' : 'En savoir plus'}
          </button>

          {dismissible && (
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-400 hover:text-slate-500 ml-2"
              aria-label="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
