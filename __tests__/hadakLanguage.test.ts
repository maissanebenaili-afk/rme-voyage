import { detectHadakLanguage } from '@/lib/hadakLanguage';

describe('detectHadakLanguage', () => {
  it('switches from Darija mode to French for a clearly French question', () => {
    expect(detectHadakLanguage('Je veux aller à Tanger, quel ferry ?', 'da')).toBe('fr');
  });

  it('keeps Darija for a clearly Darija transliterated question', () => {
    expect(detectHadakLanguage('bghit nmchi l Taza chhal l budget', 'da')).toBe('da');
  });

  it('uses Moroccan Arabic as the spoken mode for Arabic-script input in Darija mode', () => {
    expect(detectHadakLanguage('أريد الذهاب إلى طنجة', 'da')).toBe('da');
  });

  it('does not override the selected language for an ambiguous short message', () => {
    expect(detectHadakLanguage('Tanger ferry', 'da')).toBe('da');
  });
});
