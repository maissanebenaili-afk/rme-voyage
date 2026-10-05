import { readFileSync } from 'fs';
import { join } from 'path';
import { fireEvent, render, screen } from '@testing-library/react';
import LeadLink from '@/components/LeadLink';
import { cleanEventProps } from '@/lib/rmeEvents';

const VENDOR_PAGES = [
  'app/afarah-nassim/page.tsx',
  'app/marwa-caftan/page.tsx',
  'app/taza-immobilier/page.tsx',
  'app/taza-immobilier/[id]/page.tsx',
  'app/belisamae/page.tsx',
  'components/caftan/CaftanBooking.tsx',
  'components/caftan/CaftanMarketplace.tsx',
  'components/ServicesProWidget.tsx',
  'components/ColisWidget.tsx',
];

describe('Leads sent to partner businesses are counted', () => {
  it('a click logs partner and channel, never the phone number or message', () => {
    // No sendBeacon in jsdom: the sender falls back to fetch, whose body is readable.
    Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true });
    const post = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = post as unknown as typeof fetch;
    render(
      <LeadLink partner="afarah_nassim" channel="whatsapp" href="https://wa.me/33782722869?text=Bonjour">
        Devis
      </LeadLink>,
    );
    fireEvent.click(screen.getByText('Devis'));
    const body = JSON.parse(post.mock.calls[0][1].body as string);
    expect(body.event).toBe('partner_click');
    expect(cleanEventProps(body.props)).toMatchObject({ partner: 'afarah_nassim', product: 'contact', placement: 'vendor_whatsapp' });
    expect(JSON.stringify(body)).not.toContain('33782722869');
  });

  it.each(VENDOR_PAGES)('%s has no untracked WhatsApp, phone or booking link', (file) => {
    const source = readFileSync(join(process.cwd(), file), 'utf8');
    const rawAnchors = source.match(/<a\s+href=\{[^}]*(whatsapp|devis|contactGeneral|tel:|BELISAMAE_URL)/gi) ?? [];
    expect(source).not.toMatch(/<a\s+href=\{whatsappLink\(/);
    expect(rawAnchors).toEqual([]);
    expect(source).toContain('<LeadLink');
  });
});
