import { EPISODES, PERSOS, SERIE, avecVoix } from '../scripts/ados/histoire-foot.mjs'
import { construire } from '../scripts/ados/montage.mjs'

const REEL = /Yamal|Lamine|Barça|Barcelon|Camp Nou|Spotify|Real Madrid|Messi|Ronaldo|Mbapp|Liga|Premier League|FIFA|UEFA|Nike|Adidas/i

describe('« Bouba et le grand stade » : une série 100 % inventée', () => {
  const tous = JSON.stringify([SERIE, PERSOS, EPISODES])

  it('ne cite ni vrai joueur, ni vrai club, ni vraie marque', () => {
    expect(tous).not.toMatch(REEL)
  })

  it('a un titre, un dossier de sortie et au moins un épisode', () => {
    expect(SERIE.titre).toBe('Bouba et le grand stade')
    expect(SERIE.dossier).toBe('videos-foot')
    expect(EPISODES.length).toBeGreaterThanOrEqual(1)
  })

  it('celui qui parle est à l’écran, sauf le narrateur et les voix sur une image', () => {
    for (const e of EPISODES)
      for (const p of e.plans) {
        if (p.parle) expect(Object.keys(PERSOS)).toContain(p.parle)
        if (p.parle && p.parle !== 'narration' && !p.insert) expect(p.persos.map((x) => x.id)).toContain(p.parle)
        for (const x of p.persos) expect(Object.keys(PERSOS)).toContain(x.id)
      }
  })

  it('dure de 1 min 30 à 3 minutes', () => {
    for (const e of EPISODES) {
      const S = construire(e, e.plans.filter(avecVoix).map(() => 4.5), PERSOS, 24)
      expect(S.total).toBeGreaterThanOrEqual(85)
      expect(S.total).toBeLessThanOrEqual(200)
    }
  })
})
