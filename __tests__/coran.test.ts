import {
  BASMALA,
  FAVORITE_SURAHS,
  SURAHS,
  formatTime,
  parseResume,
  parseSurahResponse,
  searchSurahs,
  surahAudioUrl,
  surahByNumber,
  surahTextUrl,
} from '@/lib/coran';

describe('liste des sourates', () => {
  it('a les 114 sourates dans l’ordre, 6236 versets en tout', () => {
    expect(SURAHS).toHaveLength(114);
    SURAHS.forEach((s, i) => expect(s.n).toBe(i + 1));
    expect(SURAHS.reduce((sum, s) => sum + s.ayahs, 0)).toBe(6236);
    expect(surahByNumber(1)).toMatchObject({ tr: 'Al-Faatiha', ayahs: 7 });
    expect(surahByNumber(0)).toBeUndefined();
    expect(surahByNumber(115)).toBeUndefined();
  });

  it('propose des raccourcis vers des sourates qui existent', () => {
    for (const n of FAVORITE_SURAHS) expect(surahByNumber(n)).toBeDefined();
  });
});

describe('searchSurahs', () => {
  const numbers = (q: string) => searchSurahs(q).map((s) => s.n);

  it.each([
    ['36', [36]],
    ['yassine', [36]],
    ['Ya-Sin', [36]],
    ['fatiha', [1]],
    ['Al Kahf', [18]],
    ['kahf', [18]],
    ['rahmane', [55]],
    ['الكهف', [18]],
  ])('trouve « %s »', (q, expected) => {
    expect(numbers(q)).toEqual(expect.arrayContaining(expected));
  });

  it('rend toute la liste sans recherche, rien pour un numéro inexistant', () => {
    expect(searchSurahs('  ')).toHaveLength(114);
    expect(searchSurahs('200')).toEqual([]);
  });
});

describe('adresses des sources', () => {
  it('demande l’arabe et la traduction de Hamidullah, et la récitation d’Alafasy', () => {
    expect(surahTextUrl(18)).toBe('https://api.alquran.cloud/v1/surah/18/editions/quran-uthmani,fr.hamidullah');
    expect(surahAudioUrl(18)).toBe('https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/18.mp3');
  });
});

describe('parseSurahResponse', () => {
  const edition = (n: number, texts: string[]) => ({
    number: n,
    ayahs: texts.map((text, i) => ({ numberInSurah: i + 1, text })),
  });
  const ikhlas = {
    code: 200,
    data: [
      edition(112, ['قُلْ هُوَ ٱللَّهُ أَحَدٌ', 'ٱللَّهُ ٱلصَّمَدُ', 'لَمْ يَلِدْ وَلَمْ يُولَدْ', 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ']),
      edition(112, ['Dis: «Il est Allah, Unique.', 'Allah, Le Seul à être imploré.', 'Il n’a jamais engendré.', 'Et nul n’est égal à Lui».']),
    ],
  };

  it('associe chaque verset arabe à sa traduction, sans modifier le texte', () => {
    const { basmala, verses } = parseSurahResponse(ikhlas, 112)!;
    expect(basmala).toBe(false);
    expect(verses).toHaveLength(4);
    expect(verses[0]).toEqual({ n: 1, ar: 'قُلْ هُوَ ٱللَّهُ أَحَدٌ', fr: 'Dis: «Il est Allah, Unique.' });
  });

  it('place la basmala au-dessus de la sourate, sauf pour la Fatiha et la sourate 9', () => {
    const withBasmala = JSON.parse(JSON.stringify(ikhlas)) as typeof ikhlas;
    withBasmala.data[0].ayahs[0].text = `${BASMALA} قُلْ هُوَ ٱللَّهُ أَحَدٌ`;
    const ikhlasText = parseSurahResponse(withBasmala, 112)!;
    expect(ikhlasText.basmala).toBe(true);
    expect(ikhlasText.verses[0].ar).toBe('قُلْ هُوَ ٱللَّهُ أَحَدٌ');

    const texts = Array.from({ length: 7 }, (_, i) => (i === 0 ? `\ufeff${BASMALA}` : `v${i + 1}`));
    const fatiha = parseSurahResponse({ code: 200, data: [edition(1, texts), edition(1, texts)] }, 1)!;
    expect(fatiha.basmala).toBe(false);
    expect(fatiha.verses[0].ar).toBe(BASMALA);
  });

  it('refuse une réponse incomplète, d’une autre sourate ou en erreur', () => {
    expect(parseSurahResponse({ code: 404, data: 'Not found' }, 112)).toBeNull();
    expect(parseSurahResponse(ikhlas, 113)).toBeNull();
    expect(parseSurahResponse({ code: 200, data: [ikhlas.data[0]] }, 112)).toBeNull();
    const short = { code: 200, data: [edition(112, ['a', 'b', 'c']), edition(112, ['a', 'b', 'c'])] };
    expect(parseSurahResponse(short, 112)).toBeNull();
    expect(parseSurahResponse(null, 112)).toBeNull();
  });
});

describe('reprise de lecture', () => {
  it('relit la dernière sourate et l’endroit de l’écoute', () => {
    expect(parseResume('{"surah":18,"time":125.4}')).toEqual({ surah: 18, time: 125.4 });
    expect(parseResume('{"surah":36}')).toEqual({ surah: 36, time: 0 });
  });

  it('ignore une valeur absente, abîmée ou hors limites', () => {
    expect(parseResume(null)).toBeNull();
    expect(parseResume('pas du json')).toBeNull();
    expect(parseResume('{"surah":999,"time":3}')).toBeNull();
    expect(parseResume('{"surah":2,"time":-5}')).toEqual({ surah: 2, time: 0 });
  });

  it('affiche les durées en minutes ou en heures', () => {
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(245)).toBe('4:05');
    expect(formatTime(3750)).toBe('1:02:30');
    expect(formatTime(Number.NaN)).toBe('0:00');
  });
});
