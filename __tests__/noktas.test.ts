import { readFileSync } from 'fs'
import { EPISODES, PERSOS, SERIE, avecVoix, texteParle } from '../scripts/ados/histoire-nokta.mjs'

const EMOTIONS = ['neutre', 'joie', 'triste', 'colere', 'surprise', 'peur', 'malade', 'froid', 'tendre', 'pleure']
const dessin = readFileSync('scripts/ados/dessin.js', 'utf8')

describe('« Les Noktas de Joha »', () => {
  it('forment une collection de 10 noktas courtes, en style papier, avec son dossier', () => {
    expect(SERIE.etiquette).toBe('NOKTA')
    expect(SERIE.style).toBe('papier')
    expect(SERIE.dossier).toBe('videos-noktas')
    expect(EPISODES.map((e) => e.numero)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })
  it.each(EPISODES)('nokta $numero : personnages, décors et émotions existent', (ep) => {
    for (const plan of ep.plans) {
      expect(dessin).toContain(`${plan.bg}(t`)
      for (const p of plan.persos) {
        expect(PERSOS[p.id]).toBeDefined()
        expect(dessin).toMatch(new RegExp(`\\b${p.id}: \\{ peau`))
        expect(EMOTIONS).toContain(p.emo)
        expect(Math.abs(p.x)).toBeLessThanOrEqual(0.5)
      }
      if (avecVoix(plan)) expect(PERSOS[plan.parle as string]).toBeDefined()
    }
  })
  it.each(EPISODES)('nokta $numero : courte, avec une chute et une question', (ep) => {
    const voix = ep.plans.filter(avecVoix)
    const mots = voix.map((p) => (p.texte as string).split(/\s+/).length).reduce((a, b) => a + b, 0)
    expect(mots).toBeGreaterThan(25)
    expect(mots).toBeLessThan(110) // moins d'une minute
    expect(ep.question.endsWith('?')).toBe(true)
    expect(voix.some((p) => p.persos.some((x) => x.emo === 'joie'))).toBe(true)
    voix.forEach((p) => expect(texteParle(p)).toMatch(/^(\[[^\]]+\] )?\S/))
  })
})
