import fs from 'node:fs';
import path from 'node:path';

describe('Boutique partner copy', () => {
  const source = fs.readFileSync(path.join(__dirname, '../app/boutique/page.tsx'), 'utf-8');

  it('does not claim unverified partner operations', () => {
    expect(source).not.toMatch(/livrée chez vous en 48 h|adresses vérifiées|5 millions/i);
    expect(source).toMatch(/confirmées avec\s+le professionnel concerné/);
  });
});
