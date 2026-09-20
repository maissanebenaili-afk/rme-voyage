import fs from 'node:fs';
import path from 'node:path';

function source(file: string) {
  return fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
}

describe('partner catalog integrity', () => {
  it('keeps Marwa contact requests without publishing unverified commercial facts', () => {
    const page = source('app/marwa-caftan/page.tsx');
    expect(page).toContain('Tarif sur demande');
    expect(page).toMatch(/Tarif, taille et\s+disponibilité à confirmer/);
    expect(page).toMatch(/whatsappLink\(\s*MARWA_WHATSAPP/);
    expect(page).toContain('<main id="main-content" tabIndex={-1}');
    expect(page).not.toMatch(
      /prixLocation|prixVente|caution: \d+|avis: \d+|stars: \d+|dispo: (true|false)/
    );
  });

  it('keeps Afarah quote requests without publishing a price or official status', () => {
    const page = source('app/afarah-nassim/page.tsx');
    expect(page).toContain('Tarif et nombre de convives à confirmer sur devis');
    expect(page).toContain('whatsappLink(');
    expect(page).not.toMatch(/parPersonne|minConvives|Partenaire officiel/);
  });

  it('does not list unverified businesses as active services', () => {
    const widget = source('components/ServicesProWidget.tsx');
    expect(widget).toContain('Aucun partenaire vérifié dans cette catégorie pour le moment.');
    expect(widget).toContain('Profil à confirmer');
    expect(widget).not.toMatch(/Garage Hassan|Atlas Car Rental|Saveurs du Maghreb/);
  });
});
