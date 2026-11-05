import { pausesFamille } from '@/lib/pausesFamille'

const H = 3600

describe('pausesFamille', () => {
  it('propose une pause toutes les 2 heures', () => {
    const p = pausesFamille(7 * H, 700_000)
    expect(p.map((x) => x.apresSecondes / H)).toEqual([2, 4, 6])
    expect(p.map((x) => x.numero)).toEqual([1, 2, 3])
  })

  it('estime le kilomètre au prorata de la durée', () => {
    expect(pausesFamille(8 * H, 800_000).map((x) => x.kmApprox)).toEqual([200, 400, 600])
  })

  it('ne propose pas de pause quand l’arrivée est à moins de 30 minutes', () => {
    expect(pausesFamille(4 * H + 20 * 60, 400_000).map((x) => x.apresSecondes / H)).toEqual([2])
    expect(pausesFamille(2 * H + 20 * 60, 200_000)).toEqual([])
  })

  it('ne fait pas de pause sur un trajet court ni sur des données invalides', () => {
    expect(pausesFamille(90 * 60, 100_000)).toEqual([])
    expect(pausesFamille(0, 100_000)).toEqual([])
    expect(pausesFamille(5 * H, 0)).toEqual([])
    expect(pausesFamille(NaN, 1000)).toEqual([])
  })
})
