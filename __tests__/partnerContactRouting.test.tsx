import { render, screen } from '@testing-library/react';
import PropertyDetail from '../app/taza-immobilier/[id]/page';
import { IDOUR_WHATSAPP, PROPERTIES } from '@/lib/properties';
import { MARWA_WHATSAPP, RME_SOURCE_SIGNATURE, whatsappLink } from '@/lib/partners';

describe('partner contact requests reach the right business and say they come from RME', () => {
  it('a property request goes to HiDOUR Immobilier, not to the caftan/catering number', async () => {
    // Before: the property detail page sent every buyer to Marwa's WhatsApp.
    render(await PropertyDetail({ params: Promise.resolve({ id: PROPERTIES[0].id }) }));
    const href = screen.getByText(/Contacter/).closest('a')!.getAttribute('href')!;
    expect(href).toContain(`wa.me/${IDOUR_WHATSAPP}`);
    expect(href).not.toContain(MARWA_WHATSAPP);
  });

  it('every prefilled message ends with the RME signature, so the partner can count RME requests', () => {
    const text = decodeURIComponent(new URL(whatsappLink('33600000000', 'Bonjour')).searchParams.get('text')!);
    expect(text).toBe(`Bonjour\n\n${RME_SOURCE_SIGNATURE}`);
  });
});
