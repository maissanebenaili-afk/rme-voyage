import { execFileSync } from 'child_process';
import { join } from 'path';
import { render } from '@testing-library/react';
import PageViewBeacon, { visitSource } from '@/components/PageViewBeacon';

jest.mock('next/navigation', () => ({ usePathname: () => '/afarah-nassim' }));

const ORIGIN = 'https://rme-voyage.netlify.app';

describe('Where a visit came from, without personal data', () => {
  it('keeps an RME path, an outside host, or "direct" — never an outside URL', () => {
    expect(visitSource(`${ORIGIN}/trajet/paris-tanger?x=1`, ORIGIN)).toBe('/trajet/paris-tanger');
    expect(visitSource('https://www.google.com/search?q=traiteur+mariage+marocain', ORIGIN)).toBe('google.com');
    expect(visitSource('', ORIGIN)).toBe('direct');
    expect(visitSource('not a url', ORIGIN)).toBe('direct');
  });

  it('the page view carries that source', () => {
    Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true });
    const post = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = post as unknown as typeof fetch;
    render(<PageViewBeacon />);
    const body = JSON.parse(post.mock.calls[0][1].body as string);
    expect(body).toMatchObject({ event: 'page_view', props: { page: '/afarah-nassim', ref: 'direct' } });
  });
});

describe('partner funnel from exported log lines', () => {
  const out = execFileSync('node', [join(process.cwd(), 'scripts/partner-funnel.mjs'), join(process.cwd(), '__tests__/fixtures/rme-events-sample.log')], { encoding: 'utf8' });

  it('counts views, contact clicks by channel and sources per partner; skips cut lines', () => {
    expect(out).toContain('7 événements lus.');
    expect(out).toContain('afarah_nassim : 2 vues de page → 2 clics de contact (whatsapp 1, phone 1) · 100 % des visites');
    expect(out).toMatch(/provenance des vues : (\/ 1, instagram\.com 1|instagram\.com 1, \/ 1)/);
    expect(out).toContain('marwa_caftan : 1 vues de page → 0 clics de contact (aucun) · 0 % des visites');
  });

  it('says "no visit" instead of a 0 % rate, and states what it cannot know', () => {
    expect(out).toContain('belisamae : 0 vues de page → 0 clics de contact (aucun) · pas de visite');
    expect(out).toContain('Non mesuré ici : messages réellement envoyés, devis, ventes');
  });
});
