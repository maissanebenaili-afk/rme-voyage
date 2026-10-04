import fs from 'node:fs';
import path from 'node:path';

function source(file: string) {
  return fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
}

// Issue #227: partner pages render the shared ReferencedListing, which has no
// room for a price, a stock, a review or an official status.
describe('partner catalog integrity', () => {
  it.each(['marwa-caftan', 'afarah-nassim', 'taza-immobilier', 'belisamae'])('%s publishes no catalogue of its own', (page) => {
    const file = source(`app/${page}/page.tsx`);
    expect(file).toContain('<ReferencedListing');
    expect(file).not.toMatch(/prixLocation|prixVente|caution: \d+|avis: \d+|stars: \d+|dispo: (true|false)|parPersonne|Partenaire officiel/);
  });

  it('the shared listing page keeps the skip-link target', () => {
    expect(source('components/ReferencedListing.tsx')).toContain('<main id="main-content" tabIndex={-1}');
  });

  it('does not list unverified businesses as active services', () => {
    const widget = source('components/ServicesProWidget.tsx');
    expect(widget).toContain('Aucun partenaire vérifié dans cette catégorie pour le moment.');
    expect(widget).toContain('Référencé · aucun accord commercial');
    expect(widget).not.toMatch(/Garage Hassan|Atlas Car Rental|Saveurs du Maghreb/);
  });
});
