import { render, screen } from '@testing-library/react';
import TazaImmobilier from '../app/taza-immobilier/page';
import { IDOUR_WHATSAPP, MARWA_WHATSAPP, RME_SOURCE_SIGNATURE, whatsappLink } from '@/lib/partners';

describe('partner contact requests reach the right business and say they come from RME', () => {
  it('a property request goes to HiDOUR Immobilier, not to the caftan/catering number', () => {
    // Before: the property detail page sent every buyer to Marwa's WhatsApp.
    render(<TazaImmobilier />);
    const href = screen.getByText(/WhatsApp/).closest('a')!.getAttribute('href')!;
    expect(href).toContain(`wa.me/${IDOUR_WHATSAPP}`);
    expect(href).not.toContain(MARWA_WHATSAPP);
  });

  it('every prefilled message ends with the RME signature, so the partner can count RME requests', () => {
    const text = decodeURIComponent(new URL(whatsappLink('33600000000', 'Bonjour')).searchParams.get('text')!);
    expect(text).toBe(`Bonjour\n\n${RME_SOURCE_SIGNATURE}`);
  });
});
