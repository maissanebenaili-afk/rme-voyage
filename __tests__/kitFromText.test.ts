import { kitHintFromSearch, kitHintFromText, kitHref } from '@/lib/kitFromText';

describe('kitHintFromText', () => {
  it.each([
    ['Je pars du Mans vers le Maroc en voiture avec mes deux enfants', { transport: 'voiture' }],
    ['On prend l’avion pour Agadir en décembre', { transport: 'avion' }],
    ['Je traverse en ferry à pied, sans voiture', { transport: 'ferry-pieton' }],
    ['bghit nmshi l-Maghrib b tomobil', { transport: 'voiture' }],
    ['We are flying to Marrakech', { transport: 'avion' }],
    ['Viajo en coche a Tánger', { transport: 'voiture' }],
  ])('reads the transport in "%s"', (text, expected) => {
    expect(kitHintFromText(text)).toMatchObject(expected);
  });

  it('does not take the French conjunction "car" for a car', () => {
    expect(kitHintFromText('Je pars en avion car c’est plus rapide')).toEqual({ transport: 'avion' });
  });

  it('leaves the transport open when the sentence names both or neither', () => {
    expect(kitHintFromText('Avion ou voiture, je ne sais pas encore').transport).toBeUndefined();
    expect(kitHintFromText('Quels papiers pour le Maroc ?')).toEqual({});
  });

  it.each([
    'Mon fils part seul au Maroc cet été',
    'Ma fille voyage avec sa tante en avion',
    'Mes enfants partent sans moi',
    'mineur non accompagné, quels papiers ?',
    'My daughter travels alone to Morocco',
    'Mi hijo viaja solo a Marruecos',
    'weldi ghadi bohdo l-Maghrib',
  ])('spots a minor travelling without a parent in "%s"', (text) => {
    expect(kitHintFromText(text).mineurSansParent).toBe(true);
  });

  it.each([
    'Je pars seule avec mes enfants en voiture',
    'On part avec les enfants',
    'Mon fils vient avec moi en avion',
  ])('does not flag a child travelling with a parent: "%s"', (text) => {
    expect(kitHintFromText(text).mineurSansParent).toBeUndefined();
  });

  it.each([
    'Je pars avec la voiture de mon frère',
    "Je prends la voiture d'un ami pour aller au Maroc",
    "La carte grise n'est pas à mon nom, je pars en voiture",
  ])('spots a car that belongs to someone else: "%s"', (text) => {
    expect(kitHintFromText(text)).toMatchObject({ transport: 'voiture', vehiculeAuNomDuConducteur: false });
  });

  it('does not read "prête" (ready) as a lent car', () => {
    expect(kitHintFromText('Je suis prête, je pars en voiture demain')).toEqual({ transport: 'voiture' });
  });

  it.each([
    ['Je suis française, je pars en avion', 'francaise'],
    ['Je suis marocaine et je vis à Lyon', 'marocaine'],
    ['Je suis française et marocaine', 'binationale'],
    ["J'ai la double nationalité", 'binationale'],
  ])('reads the nationality in "%s"', (text, nationalite) => {
    expect(kitHintFromText(text).nationalite).toBe(nationalite);
  });
});

describe('kitHref / kitHintFromSearch', () => {
  it('writes only what the sentence said', () => {
    expect(kitHref({})).toBe('/kit-retour');
    expect(kitHref({ transport: 'voiture', mineurSansParent: true, vehiculeAuNomDuConducteur: false })).toBe(
      '/kit-retour?transport=voiture&mineur=oui&vehicule=autre',
    );
  });

  it('reads back the link, ignoring unknown values', () => {
    const hint = { transport: 'voiture', nationalite: 'binationale', mineurSansParent: true, vehiculeAuNomDuConducteur: false } as const;
    expect(kitHintFromSearch(kitHref(hint).split('?')[1])).toEqual(hint);
    expect(kitHintFromSearch('?transport=fusee&nationalite=martienne&mineur=peut-etre')).toEqual({});
  });
});
