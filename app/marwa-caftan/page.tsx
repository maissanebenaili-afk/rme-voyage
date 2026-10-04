import ReferencedListing from '@/components/ReferencedListing';
import { LISTINGS } from '@/lib/listings';

export default function Page() {
  return (
    <ReferencedListing
      listing={LISTINGS.marwa_caftan}
      note="Marwa Caftan propose des caftans à la location et à la vente. RME Voyage ne publie pas de catalogue : les modèles, les tailles, les prix et la caution se demandent directement à Marwa."
    />
  );
}
