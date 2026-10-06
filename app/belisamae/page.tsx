import ReferencedListing from '@/components/ReferencedListing';
import { LISTINGS } from '@/lib/listings';

export default function Page() {
  return (
    <ReferencedListing
      listing={LISTINGS.belisamae}
      note="Belisamae propose du Reiki et de la géobiologie. Les séances, les tarifs et les rendez-vous se consultent sur son site ou par téléphone."
    />
  );
}
