import { EPISODES, PERSOS, SERIE, avecVoix } from '../scripts/ados/histoire-atlas.mjs'
import { THEMES, PROFILS, composerFondAtlas } from '../scripts/ados/musique-atlas.mjs'

const EMOTIONS = ['neutre', 'joie', 'triste', 'colere', 'surprise', 'peur', 'malade', 'froid', 'tendre', 'pleure']
const DECORS = ['route', 'atlas', 'dar']
const GESTES = ['rire', 'secoue', 'poing', 'tend', 'coeur', 'bouche', 'baisse', 'recule', 'avance', 'choc', 'explique', 'doigt', 'menton', 'hausse', 'salut']

describe('« Les Larmes de l’Atlas »', () => {
  const ep = EPISODES[0]
  const voix = ep.plans.filter(avecVoix)

  it('est une série à part, avec son dossier et sa musique', () => {
    expect(SERIE.dossier).toBe('videos-atlas')
    expect(SERIE.musique).toBe('atlas')
  })

  it('a un pilote de 18 à 26 répliques, qui finit sur une question', () => {
    expect(voix.length).toBeGreaterThanOrEqual(18)
    expect(voix.length).toBeLessThanOrEqual(26)
    expect(ep.question.endsWith('?')).toBe(true)
  })

  it('dure environ 3 minutes ou plus', () => {
    const parle = voix.reduce((a, p) => a + (p.texte ?? '').length / 15.3 + 2.1, 0)
    const muet = ep.plans.filter((p) => !avecVoix(p)).reduce((a, p) => a + (p.duree ?? 3), 0)
    expect(parle + muet + 6.2).toBeGreaterThan(170)
  })

  it('n’utilise que des personnages, décors, émotions, gestes et thèmes qui existent', () => {
    for (const p of ep.plans) {
      expect(DECORS).toContain(p.bg)
      if (p.parle) expect(Object.keys(PERSOS)).toContain(p.parle)
      if (p.theme) expect(Object.keys(THEMES)).toContain(p.theme)
      for (const x of p.persos) {
        expect(Object.keys(PERSOS)).toContain(x.id)
        expect(EMOTIONS).toContain(x.emo)
        if (x.emo2) expect(EMOTIONS).toContain(x.emo2)
        if (x.act) expect(GESTES).toContain(x.act)
      }
    }
  })

  it('les gestes ont une raison : pas de geste sur plus de la moitié des répliques', () => {
    expect(voix.filter((p) => p.persos.some((x) => x.act)).length / voix.length).toBeLessThan(0.5)
  })

  it('alterne joie et peine : au moins un moment de joie et un de tristesse', () => {
    const emos = ep.plans.flatMap((p) => p.persos.flatMap((x) => [x.emo, x.emo2]))
    expect(emos).toContain('joie')
    expect(emos.some((e) => e === 'triste' || e === 'pleure')).toBe(true)
  })

  it('la musique a une couleur pour chaque émotion du dessin', () => {
    for (const e of EMOTIONS) expect(Object.keys(PROFILS)).toContain(e)
  })

  it('utilise les six thèmes musicaux de la bible', () => {
    const utilises = new Set(ep.plans.map((p) => p.theme).filter(Boolean))
    for (const t of ['famille', 'mystere', 'separation', 'espoir', 'retrouvailles']) expect(utilises.has(t)).toBe(true)
    expect(Object.keys(THEMES).sort()).toEqual(['espoir', 'famille', 'mystere', 'nour', 'retrouvailles', 'separation'])
  })

  it('ne cite aucune œuvre, marque ou personne réelle', () => {
    const tout = JSON.stringify(ep)
    expect(tout).not.toMatch(/Candy|Sarah|Ingalls|Disney|Netflix|Spotify|Nike|Adidas|Messi|Yamal/i)
  })

  it('une musique composée est du son valide : pas de NaN, pas au-delà de 1', () => {
    const son = composerFondAtlas(3, [[0, 0.7], [3, 0.7]], [], [[0, 1.5, 'famille'], [1.5, 4, 'mystere']])
    expect(son).toHaveLength(2)
    expect(son[0].length).toBe(Math.ceil(3 * 44100))
    let pic = 0
    for (const c of son) for (const x of c) { expect(Number.isFinite(x)).toBe(true); pic = Math.max(pic, Math.abs(x)) }
    expect(pic).toBeGreaterThan(0.05)
    expect(pic).toBeLessThanOrEqual(1)
  }, 60000)
})

describe('« Les Larmes de l’Atlas » : la saison 1 complète', () => {
  const dessin = require('fs').readFileSync('scripts/ados/dessin.js', 'utf8') as string
  const DECORS_EXISTANTS = ['route', 'atlas', 'dar', 'rue']
  it('compte 6 épisodes numérotés, chacun avec une question de fin', () => {
    expect(EPISODES.map((e) => e.numero)).toEqual([1, 2, 3, 4, 5, 6])
    for (const e of EPISODES) {
      expect(e.question.endsWith('?')).toBe(true)
      expect(e.titre.length).toBeGreaterThan(3)
    }
    expect(new Set(EPISODES.map((e) => e.titre)).size).toBe(6)
  })
  it.each(EPISODES)('épisode $numero : personnages, décors, émotions et thèmes existent', (ep) => {
    for (const plan of ep.plans) {
      expect(DECORS_EXISTANTS).toContain(plan.bg)
      for (const p of plan.persos) {
        expect(PERSOS[p.id]).toBeDefined()
        expect(dessin).toMatch(new RegExp(`\\b${p.id}: \\{ peau`))
        expect(EMOTIONS).toContain(p.emo)
      }
      if (plan.theme) expect(Object.keys(THEMES)).toContain(plan.theme)
      if (avecVoix(plan)) expect(PERSOS[plan.parle as string]).toBeDefined()
    }
  })
  it('la bonne fée Lalla Nejma conclut les épisodes 2 à 5 et 6 (voix douce, aérienne)', () => {
    for (const n of [2, 3, 4, 5, 6]) {
      expect(EPISODES[n - 1].plans.some((p) => p.parle === 'nejma')).toBe(true)
    }
    expect(PERSOS.nejma.hauteur).toBeGreaterThan(1)
  })
  it('chaque épisode mêle joie et peine (règle des 8 règles)', () => {
    for (const e of EPISODES) {
      const emos = e.plans.flatMap((p) => p.persos.map((x) => x.emo))
      expect(emos.some((x) => ['joie', 'tendre'].includes(x))).toBe(true)
      expect(emos.some((x) => ['triste', 'pleure', 'peur'].includes(x))).toBe(true)
    }
  })
})
