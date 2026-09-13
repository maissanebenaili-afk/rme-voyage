'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only register in production or when not in dev mode
    if (!('serviceWorker' in navigator)) return;

    // Register the service worker silently
    const register = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });
        // Silent registration - no UI feedback needed
      } catch {
        // Silent failure - don't disturb the user
      }
    };

    // Register after window load to not block initial render
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register);
      return () => window.removeEventListener('load', register);
    }
  }, []);

  return null;
}
