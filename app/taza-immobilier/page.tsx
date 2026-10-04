import ReferencedListing from '@/components/ReferencedListing';
import { LISTINGS } from '@/lib/listings';

export default function Page() {
  return (
    <ReferencedListing
      listing={LISTINGS.taza_immobilier}
      note="HiDOUR Immobilier propose des biens à Taza, à la vente et à la location. RME Voyage ne publie pas d'annonces : les biens disponibles, leurs prix et leurs caractéristiques se demandent directement. Avant tout achat, faites vérifier le titre foncier par un notaire."
    />
  );
}
