import { CHAMPS_PROCURATION_VEHICULE, DOCUMENTS_OFFICIELS, procurationVehicule } from '@/lib/modeles';

describe('procurationVehicule', () => {
  it('fills the template with the given values and French dates', () => {
    const doc = procurationVehicule({
      propNom: 'Amina Benali',
      propNaissance: '1980-03-07',
      immat: 'AB-123-CD',
      condNom: 'Youssef Benali',
      debut: '2026-12-20',
      fin: '2027-01-05',
    });
    const text = doc.paragraphes.join('\n');
    expect(text).toContain('Amina Benali, né(e) le 07/03/1980');
    expect(text).toContain('immatriculé AB-123-CD');
    expect(text).toContain('autorise Youssef Benali');
    expect(text).toContain('du 20/12/2026 au 05/01/2027');
  });

  it('leaves a blank line to fill by hand instead of inventing a value', () => {
    const text = procurationVehicule({}).paragraphes.join('\n');
    expect(text).not.toMatch(/undefined|null/);
    expect(text).toContain('…………………………');
  });

  it('states it is not a sale, and that the signature happens at the town hall', () => {
    const text = procurationVehicule({}).paragraphes.join('\n');
    expect(text).toContain('ne vaut ni vente, ni cession');
    expect(text).toContain('devant l’agent de la mairie');
  });

  it('uses unique field ids', () => {
    const ids = CHAMPS_PROCURATION_VEHICULE.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('links official forms over https only', () => {
    for (const doc of DOCUMENTS_OFFICIELS) expect(doc.url).toMatch(/^https:\/\/www\.service-public\.fr\//);
  });
});
