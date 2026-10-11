import { ETAPES, texteALire } from '@/lib/outilsPapiers';

const outils = ETAPES.flatMap((etape) => etape.outils);

describe('outils papiers', () => {
  it('only links over https, with unique ids', () => {
    for (const outil of outils) expect(outil.url).toMatch(/^https:\/\//);
    expect(new Set(outils.map((o) => o.id)).size).toBe(outils.length);
  });

  it('keeps every step non-empty and every sentence short enough to be read aloud', () => {
    for (const etape of ETAPES) expect(etape.outils.length).toBeGreaterThan(0);
    for (const outil of outils) expect(outil.phrase.length).toBeLessThanOrEqual(130);
  });

  it('warns aloud when a tool sends the file online, and only then', () => {
    const online = outils.find((o) => o.enLigne)!;
    const local = outils.find((o) => !o.enLigne)!;
    expect(texteALire(online)).toContain('le fichier part sur internet');
    expect(texteALire(local)).not.toContain('internet');
  });
});
