import { backtest, decide, forecast, gauss, infer, rng, seasonalModel } from './twin'

// Une « réalité » dont on connaît les causes cachées, pour vérifier que le jumeau les retrouve.
const HIDDEN = { niveau: 100, tendance: 0.5, saisonSin: 20, saisonCos: -8, bruit: 5 }
const PERIOD = 12
function reality(n: number, seed = 42): number[] {
  const r = rng(seed)
  return Array.from({ length: n }, (_, t) =>
    HIDDEN.niveau +
    HIDDEN.tendance * t +
    HIDDEN.saisonSin * Math.sin((2 * Math.PI * t) / PERIOD) +
    HIDDEN.saisonCos * Math.cos((2 * Math.PI * t) / PERIOD) +
    HIDDEN.bruit * gauss(r),
  )
}

describe('OMEGA jumeau inversé', () => {
  it('est déterministe : même graine, même résultat', () => {
    expect(rng(3)()).toBe(rng(3)())
    const a = infer(seasonalModel(reality(60), PERIOD), { seed: 9 })
    const b = infer(seasonalModel(reality(60), PERIOD), { seed: 9 })
    expect(a.mean).toEqual(b.mean)
  })

  it('retrouve les variables cachées avec leur incertitude', () => {
    const post = infer(seasonalModel(reality(120), PERIOD))
    const truth = [HIDDEN.niveau, HIDDEN.tendance, HIDDEN.saisonSin, HIDDEN.saisonCos, Math.log(HIDDEN.bruit)]
    truth.forEach((v, j) => {
      // La vraie valeur doit tomber dans ±3 écarts-types de l'estimation.
      expect(Math.abs(post.mean[j] - v)).toBeLessThan(3 * post.sd[j] + 1e-9)
    })
  })

  it('prévoit avec des fourchettes ordonnées', () => {
    const post = infer(seasonalModel(reality(60), PERIOD))
    const fc = forecast(post, 60, 6, PERIOD, { scenarios: 500 })
    expect(fc.scenarios).toHaveLength(500)
    fc.p50.forEach((m, h) => {
      expect(fc.p10[h]).toBeLessThanOrEqual(m)
      expect(m).toBeLessThanOrEqual(fc.p90[h])
    })
  })

  it("mesure ses erreurs et bat la méthode naïve", () => {
    const bt = backtest(reality(96), PERIOD, 12)
    expect(bt.mae).toBeLessThan(bt.naiveMae)
    expect(bt.coverage80).toBeGreaterThanOrEqual(0.5)
  })

  it('compare des décisions par gain et par risque', () => {
    const scenarios = [[10], [20], [30], [40]]
    const res = decide(scenarios, [
      { name: 'prudent', payoff: () => 20 },
      { name: 'risqué', payoff: (p) => p[0] * 2 - 30 },
    ])
    expect(res[0].name).toBe('prudent')
    expect(res.find((r) => r.name === 'risqué')!.worst10).toBe(-10)
  })

  it('refuse des données trop maigres au lieu de deviner', () => {
    expect(() => seasonalModel([1, 2, 3], PERIOD)).toThrow('au moins 8')
  })
})
