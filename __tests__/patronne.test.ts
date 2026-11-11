import { readFileSync } from 'fs'
import { resolve } from 'path'
import { EPISODES, PERSOS, SERIE, avecVoix } from '../scripts/ados/histoire-patronne.mjs'
import { THEMES } from '../scripts/ados/musique-atlas.mjs'

const EMOTIONS = ['neutre', 'joie', 'triste', 'colere', 'surprise', 'peur', 'malade', 'froid', 'tendre', 'pleure']
const DECORS = ['gala', 'villa', 'rue', 'dar', 'atelier']
const GESTES = ['rire', 'secoue', 'poing', 'tend', 'coeur', 'bouche', 'baisse', 'recule', 'avance', 'choc', 'explique', 'doigt', 'menton', 'hausse', 'salut']
const dessin = readFileSync(resolve(process.cwd(), 'scripts/ados/dessin.js'), 'utf8')

describe('« La Patronne cachée »', () => {
  it('a son dossier, la musique de l’Atlas et trois épisodes courts', () => {
    expect(SERIE.dossier).toBe('videos-patronne')
    expect(SERIE.musique).toBe('atlas')
    expect(EPISODES.map((e) => e.numero)).toEqual([1, 2, 3])
    for (const ep of EPISODES) {
      const voix = ep.plans.filter(avecVoix).length
      expect(voix).toBeGreaterThanOrEqual(10)
      expect(voix).toBeLessThanOrEqual(14) // répliques ; les plans muets de réaction s'ajoutent
    }
  })

  it('chaque épisode finit sur une question et annonce la suite', () => {
    for (const ep of EPISODES) {
      expect(ep.question.endsWith('?')).toBe(true)
      expect(ep.demain.length).toBeGreaterThan(3)
    }
  })

  it('n’utilise que des personnages dessinés, décors, émotions, gestes et thèmes qui existent', () => {
    for (const id of Object.keys(PERSOS).filter((k) => k !== 'narration')) expect(dessin).toContain(`    ${id}: { peau:`)
    for (const p of EPISODES.flatMap((e) => e.plans)) {
      expect(DECORS).toContain(p.bg)
      expect(dessin).toContain(`    ${p.bg}(t) {`)
      if (p.parle) expect(Object.keys(PERSOS)).toContain(p.parle)
      if (p.theme) expect(Object.keys(THEMES)).toContain(p.theme)
      for (const x of p.persos) {
        expect(Object.keys(PERSOS)).toContain(x.id)
        expect(EMOTIONS).toContain(x.emo)
        if (x.act) expect(GESTES).toContain(x.act)
      }
    }
  })

  it('accroche dès la première réplique : une scène, pas une présentation', () => {
    for (const ep of EPISODES.slice(0, 1)) expect(ep.plans[0].parle).not.toBe('narration')
  })
})
