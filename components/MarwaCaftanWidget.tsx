import ListingCard from '@/components/ListingCard';
import { LISTINGS } from '@/lib/listings';

export default function MarwaCaftanWidget() {
  return <ListingCard listing={LISTINGS.marwa_caftan} href="/marwa-caftan" />;
}
