import type { DistanceProvenance } from '@/lib/hooks/useRouteDistance';

function formatTime(ms: number) {
  return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(ms);
}

export default function DistanceProvenanceNote({
  provenance,
  className = '',
}: {
  provenance: DistanceProvenance;
  className?: string;
}) {
  let text: string;
  switch (provenance.kind) {
    case 'route':
      text = `Distance de l'itinéraire ${provenance.route.origin} → ${provenance.route.destination} (OpenStreetMap / OSRM), calculé à ${formatTime(provenance.route.computedAt)}.`;
      break;
    case 'stale':
      text = `Départ ou arrivée modifié depuis le calcul ${provenance.route.origin} → ${provenance.route.destination} : recalculez l'itinéraire pour mettre la distance à jour.`;
      break;
    case 'manual':
      text = 'Distance saisie manuellement.';
      break;
    default:
      text = "Distance d'exemple : calculez votre itinéraire pour l'utiliser ici automatiquement.";
  }
  return (
    <p data-provenance={provenance.kind} role="status" className={`text-xs leading-5 ${className}`}>
      {text}
    </p>
  );
}
