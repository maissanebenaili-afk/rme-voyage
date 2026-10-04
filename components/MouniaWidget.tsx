import ListingCard from '@/components/ListingCard';
import { LISTINGS } from '@/lib/listings';

export default function MouniaWidget() {
  return <ListingCard listing={LISTINGS.belisamae} href="/belisamae" />;
}
