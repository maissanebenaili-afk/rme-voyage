'use client';

import { useEffect } from 'react';
import { useComputedRoute } from '@/lib/routeContext';
import { isValidTravelDate } from '@/lib/travel/travelStorage.migrations';
import { useTravelStorage } from '@/lib/travel/useTravelStorage';

/**
 * Le planificateur publie le trajet calculé : on l'enregistre comme « mon
 * voyage » (sur cet appareil uniquement). Une date restée d'un autre trajet ne
 * doit pas coller à de nouvelles villes.
 */
export function useRememberComputedTrip() {
  const storage = useTravelStorage();
  const route = useComputedRoute();
  const { isHydrated, updateTravel } = storage;

  useEffect(() => {
    if (!route || !isHydrated) return;
    updateTravel((prev) => {
      const sameTrip = prev.villes.depart === route.origin && prev.villes.arrivee === route.destination;
      const plannerDate = route.date && isValidTravelDate(route.date) ? route.date : null;
      return {
        villes: { depart: route.origin, arrivee: route.destination },
        dateVoyage: plannerDate ?? (sameTrip ? prev.dateVoyage : null),
      };
    });
  }, [route, isHydrated, updateTravel]);

  return { ...storage, route };
}
