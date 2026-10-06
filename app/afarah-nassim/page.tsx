import ReferencedListing from '@/components/ReferencedListing';
import { LISTINGS } from '@/lib/listings';

export default function Page() {
  return (
    <ReferencedListing
      listing={LISTINGS.afarah_nassim}
      note="Afarah Nassim est un service traiteur, joignable au même contact que Marwa Caftan. RME Voyage ne publie pas de menu : la formule, le prix et les conditions se demandent directement."
    />
  );
}
