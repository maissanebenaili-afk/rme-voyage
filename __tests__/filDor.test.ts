import { EPISODES, PERSOS, texteParle } from '../scripts/ados/histoire.mjs'
import { construire, FIN, INTRO } from '../scripts/ados/montage.mjs'

const EMOTIONS = ['neutre', 'joie', 'triste', 'colere', 'surprise', 'peur', 'malade', 'froid', 'tendre', 'pleure']
const DECORS = ['aube', 'atelier', 'toits', 'lycee', 'villa', 'hopital', 'gala']

describe('« Le Fil d’or » : l’histoire', () => {
  it('a 6 épisodes numérotés, chacun avec un titre et une annonce du suivant', () => {
    expect(EPISODES.map((e) => e.numero)).toEqual([1, 2, 3, 4, 5, 6])
    for (const e of EPISODES) {
      expect(e.titre.length).toBeGreaterThan(3)
      expect(e.demain.length).toBeGreaterThan(3)
    }
  })

  it('chaque plan a un décor connu, une voix, un ton et un texte', () => {
    for (const e of EPISODES)
      for (const p of e.plans) {
        expect(DECORS).toContain(p.bg)
        expect(Object.keys(PERSOS)).toContain(p.parle)
        expect(p.ton.length).toBeGreaterThan(2)
        expect(p.texte.trim().length).toBeGreaterThan(5)
        expect(texteParle(p)).toMatch(/^\[.+\] /)
        expect(texteParle(p)).not.toContain('*')
      }
  })

  it('celui qui parle est à l’écran, sauf le narrateur, et les émotions sont connues', () => {
    for (const e of EPISODES)
      for (const p of e.plans) {
        if (p.parle !== 'narration') expect(p.persos.map((x) => x.id)).toContain(p.parle)
        for (const x of p.persos) {
          expect(EMOTIONS).toContain(x.emo)
          expect(x.x).toBeGreaterThanOrEqual(-1)
          expect(x.x).toBeLessThanOrEqual(1)
        }
      }
  })

  it('reste court : 9 plans au plus par épisode, et aucune réplique de plus de 25 mots', () => {
    for (const e of EPISODES) {
      expect(e.plans.length).toBeLessThanOrEqual(9)
      for (const p of e.plans) expect(p.texte.split(/\s+/).length).toBeLessThanOrEqual(25)
    }
  })

  it('pas de contenu inadapté à des adolescents', () => {
    const tout = EPISODES.flatMap((e) => e.plans.map((p) => p.texte)).join(' ')
    expect(tout).not.toMatch(/sang|viol|suicide|tuer|sexe/i)
  })
})

describe('montage', () => {
  it('enchaîne les plans sans trou ni recouvrement', () => {
    const ep = EPISODES[0]
    const S = construire(ep, ep.plans.map(() => 3), PERSOS, 24)
    expect(S.introFin).toBe(INTRO)
    expect(S.shots[0].start).toBe(INTRO)
    for (let i = 1; i < S.shots.length; i++) expect(S.shots[i].start).toBeCloseTo(S.shots[i - 1].end, 6)
    expect(S.finDebut).toBeCloseTo(S.shots[S.shots.length - 1].end, 6)
    expect(S.total).toBeCloseTo(S.finDebut + FIN, 6)
  })

  it('la voix commence après le début du plan et finit avant sa fin', () => {
    const S = construire(EPISODES[1], [], PERSOS, 24)
    for (const s of S.shots) {
      expect(s.voixDebut).toBeGreaterThan(s.start)
      expect(s.voixDebut + s.voixDuree).toBeLessThan(s.end)
    }
  })
})
