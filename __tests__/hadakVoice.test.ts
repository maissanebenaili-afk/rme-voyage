import { cleanForSpeech, pickHadakVoice, speechLocale } from '../lib/hadakVoice';

const v = (name: string, lang: string) => ({ name, lang, localService: true });

describe('Hadak voice', () => {
  it('prefers a natural female French voice over the default male one', () => {
    const voices = [v('Thomas', 'fr-FR'), v('Amélie', 'fr-CA'), v('Microsoft Denise Online (Natural) - French (France)', 'fr-FR'), v('Samantha', 'en-US')];
    expect(pickHadakVoice(voices, 'fr')?.name).toMatch(/Denise/);
  });

  it('takes a female voice from another French locale rather than a male fr-FR one', () => {
    expect(pickHadakVoice([v('Thomas', 'fr-FR'), v('Amélie', 'fr-CA')], 'fr')?.name).toBe('Amélie');
  });

  it("recognises Chrome's Google voices, which are female by default", () => {
    expect(pickHadakVoice([v('Google UK English Male', 'en-GB'), v('Google US English', 'en-US')], 'en')?.name).toBe('Google US English');
  });

  it('uses a Moroccan Arabic female voice for Darija when the phone has one', () => {
    const voices = [v('Maged', 'ar-SA'), v('Microsoft Mouna Online (Natural) - Arabic (Morocco)', 'ar-MA'), v('Laila', 'ar-SA')];
    expect(pickHadakVoice(voices, 'da')?.name).toMatch(/Mouna/);
    expect(speechLocale('da')).toBe('ar-MA');
  });

  it('never picks a voice in the wrong language, and lets the phone decide when only male voices exist', () => {
    expect(pickHadakVoice([v('Samantha', 'en-US')], 'fr')).toBeNull();
    expect(pickHadakVoice([v('Thomas', 'fr-FR')], 'fr')).toBeNull();
    expect(pickHadakVoice([v('fr-fr-x-frc-local', 'fr_FR')], 'fr')?.name).toBe('fr-fr-x-frc-local');
  });

  it('reads the answer without Markdown marks, bullets, emojis or links', () => {
    const text = '**Ferries pour les MRE** : Algeciras → Tanger Med (1h30).\n• 🚢 **Ferry** — horaires\nVoir https://example.com';
    expect(cleanForSpeech(text)).toBe('Ferries pour les MRE : Algeciras, Tanger Med (1h30). Ferry — horaires. Voir');
  });
});
