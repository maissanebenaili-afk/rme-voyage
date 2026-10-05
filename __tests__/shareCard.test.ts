import { shareCardFacts, shareCardFromQuery } from '@/lib/shareCard';

describe('shareCard', () => {
  it('lit départ et arrivée saisis', () => {
    const c = shareCardFromQuery({ from: 'Rennes', to: 'Agadir' });
    expect(c).toMatchObject({ from: 'Rennes', to: 'Agadir', known: null });
    expect(shareCardFacts(c!)).toBeNull();
  });

  it('donne les chiffres réels seulement pour un trajet pré-calculé (accents et casse ignorés)', () => {
    const c = shareCardFromQuery({ from: 'amsterdam', to: 'al hoceima' });
    expect(c?.known?.slug).toBe('amsterdam-al-hoceima');
    expect(shareCardFacts(c!)).toMatch(/^\d[\d\s  ]* km · \d+ h \d{2} de conduite$/);
  });

  it('ignore un lien incomplet ou invalide', () => {
    expect(shareCardFromQuery({ from: 'Paris' })).toBeNull();
    expect(shareCardFromQuery({ from: 'Paris', to: 'x'.repeat(200) })).toBeNull();
    expect(shareCardFromQuery({ from: 'Paris', to: 'Tan\u0000ger' })).toBeNull();
  });

  it('prend la première valeur si le paramètre est répété', () => {
    expect(shareCardFromQuery({ from: ['Paris', 'Lyon'], to: 'Tanger' })?.from).toBe('Paris');
  });
});
