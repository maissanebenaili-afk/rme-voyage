import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { render, screen } from '@testing-library/react';
import sitemap from '../app/sitemap';
import TazaImmobilier from '../app/taza-immobilier/page';
import Belisamae from '../app/belisamae/page';
import MouniaWidget from '@/components/MouniaWidget';
import { LISTINGS } from '@/lib/listings';

// Issue #227: the 12 caftans, 4 catering menus and Taza properties were
// invented, and businesses without any agreement were badged "Partenaire".
const PAGES = [TazaImmobilier, Belisamae];
const INVENTED = /Zahia|Takchita|\d ?€|\d ?DH\b|m²|Collection exclusive|livraison|halal certifiée|10 ?%|chambres?/i;

describe('Partner pages show only what RME can stand behind', () => {
  it.each(PAGES.map((Page, i) => [i, Page] as const))('page %i: no invented product, price or badge', (_, Page) => {
    const { container } = render(<Page />);
    expect(container.textContent).not.toMatch(INVENTED);
    expect(screen.getByTestId('listing-status').textContent).toBe('Référencé gratuitement · aucun accord commercial');
    expect(container.textContent).not.toMatch(/Partenaire de RME/);
    expect(container.textContent).toMatch(/Vérifié le 4 octobre 2026/);
  });

  it('no business is PARTNER or AFFILIATE without proof, and every listing is dated and sourced', () => {
    for (const listing of Object.values(LISTINGS)) {
      expect(listing.status).toBe('REFERENCED');
      expect(listing.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(listing.source.length).toBeGreaterThan(10);
      if (listing.sourceUrl) expect(listing.sourceUrl).toMatch(/^https:\/\//);
      for (const c of listing.contacts) if (c.channel === 'site') expect(c.url).toMatch(/^https:\/\//);
    }
  });

  it('boutique cards carry no stars or "Partenaire" badge', () => {
    for (const Widget of [MouniaWidget]) {
      const { container, unmount } = render(<Widget />);
      expect(container.textContent).not.toMatch(/Partenaire|exclusive|★/);
      expect(container.querySelectorAll('svg.lucide-star').length).toBe(0);
      unmount();
    }
  });

  it('the invented catalogues and their pages are gone, and the sitemap no longer lists them', () => {
    for (const file of ['lib/caftans.ts', 'lib/properties.ts', 'app/marwa-caftan/[id]/page.tsx', 'app/marwa-caftan/page.tsx', 'app/afarah-nassim/page.tsx', 'app/taza-immobilier/[id]/page.tsx']) {
      expect(existsSync(join(process.cwd(), file))).toBe(false);
    }
    const urls = sitemap().map((e) => e.url);
    expect(urls.filter((u) => /\/marwa-caftan|\/afarah-nassim|\/taza-immobilier\//.test(u))).toEqual([]);
    expect(readFileSync(join(process.cwd(), 'app/boutique/page.tsx'), 'utf8')).not.toMatch(/confirmées avec/);
  });
});
