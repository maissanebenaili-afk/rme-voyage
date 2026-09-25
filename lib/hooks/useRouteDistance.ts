import { useEffect, useRef, useState } from 'react';
import { useComputedRoute, type ComputedRoute } from '@/lib/routeContext';

/**
 * D'où vient la distance affichée dans un calculateur :
 * - default : valeur d'exemple, aucun itinéraire n'a été calculé ;
 * - route   : distance OSRM de l'itinéraire courant ;
 * - stale   : distance OSRM d'un itinéraire dont le départ ou l'arrivée a
 *             changé depuis (à recalculer) ;
 * - manual  : l'utilisateur a saisi la distance lui-même.
 */
export type DistanceProvenance =
  | { kind: 'default' }
  | { kind: 'manual' }
  | { kind: 'route'; route: ComputedRoute }
  | { kind: 'stale'; route: ComputedRoute };

export function useRouteDistance(initialKm: number) {
  const route = useComputedRoute();
  const [distanceKm, setDistanceKm] = useState(initialKm);
  const [provenance, setProvenance] = useState<DistanceProvenance>({ kind: 'default' });
  const seenRoute = useRef<ComputedRoute | null>(null);

  // Un effet plutôt qu'un ajustement d'état pendant le rendu : ce dernier
  // perdait la notification « itinéraire invalidé » de useSyncExternalStore.
  useEffect(() => {
    if (route === seenRoute.current) return;
    seenRoute.current = route;
    if (route) {
      setDistanceKm(route.distanceKm);
      setProvenance({ kind: 'route', route });
    } else {
      setProvenance((previous) =>
        previous.kind === 'route' ? { kind: 'stale', route: previous.route } : previous,
      );
    }
  }, [route]);

  function setManualDistance(km: number) {
    setDistanceKm(km);
    setProvenance({ kind: 'manual' });
  }

  return { distanceKm, provenance, setManualDistance };
}
