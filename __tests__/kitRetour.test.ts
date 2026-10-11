import { buildKit, type KitAnswers } from '@/lib/kitRetour';

const base: KitAnswers = {
  transport: 'avion',
  nationalite: 'francaise',
  mineurSansParent: false,
  vehiculeAuNomDuConducteur: true,
};

const ids = (answers: Partial<KitAnswers>) => buildKit({ ...base, ...answers }).map((item) => item.id);

describe('buildKit', () => {
  it('asks a French traveller for a passport, never the ID card alone', () => {
    expect(ids({})).toContain('passeport-francais');
    expect(ids({})).not.toContain('identite-marocaine');
  });

  it('gives a binational traveller both identities', () => {
    const kit = ids({ nationalite: 'binationale' });
    expect(kit).toEqual(expect.arrayContaining(['passeport-francais', 'identite-marocaine', 'deux-nationalites']));
  });

  it('adds the AST only when a minor travels without a parent', () => {
    expect(ids({})).not.toContain('ast');
    expect(ids({ mineurSansParent: true })).toEqual(expect.arrayContaining(['ast', 'ast-piece-enfant']));
  });

  it('adds vehicle papers by car, and the proxy only for someone else’s car', () => {
    expect(ids({})).not.toContain('admission-temporaire');
    const ownCar = ids({ transport: 'voiture' });
    expect(ownCar).toEqual(expect.arrayContaining(['carte-grise', 'assurance-maroc', 'admission-temporaire', 'billet-ferry']));
    expect(ownCar).not.toContain('procuration');
    expect(ids({ transport: 'voiture', vehiculeAuNomDuConducteur: false })).toContain('procuration');
  });

  it('ignores the car owner answer when not travelling by car', () => {
    expect(ids({ transport: 'ferry-pieton', vehiculeAuNomDuConducteur: false })).not.toContain('procuration');
  });

  it('cites an https source for every item and never duplicates an id', () => {
    const kit = buildKit({ transport: 'voiture', nationalite: 'binationale', mineurSansParent: true, vehiculeAuNomDuConducteur: false });
    for (const item of kit) expect(item.source.url).toMatch(/^https:\/\//);
    expect(new Set(kit.map((item) => item.id)).size).toBe(kit.length);
  });
});
