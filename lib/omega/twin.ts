/**
 * OMEGA — jumeau numérique inversé, version honnête et vérifiable.
 *
 * 1. Moteur inverse : à partir des observations, retrouve les variables cachées
 *    (tendance, saisonnalité, bruit) avec leur incertitude (MCMC de Metropolis).
 * 2. Monte Carlo : simule des milliers de futurs possibles → fourchettes p10/p50/p90.
 * 3. Auto-contrôle : cache la fin de l'historique, prévoit, et mesure l'erreur réelle.
 * 4. Décision : compare des choix par gain moyen ET par risque (pire 10 %).
 *
 * Tout est déterministe (graine fixée) : même entrée → même résultat, donc traçable.
 */

/** Générateur aléatoire reproductible (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Tirage gaussien (Box-Muller). */
export function gauss(rand: () => number): number {
  const u = 1 - rand()
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

/** Modèle universel : n'importe quel système qui sait dire « ces paramètres expliquent-ils ces données ? ». */
export interface Model {
  names: string[]
  start: number[]
  logLikelihood: (params: number[]) => number
}

export interface Posterior {
  names: string[]
  samples: number[][]
  mean: number[]
  sd: number[]
}

/** Moteur inverse générique : Metropolis composante par composante, pas auto-ajustés. */
export function infer(model: Model, opts: { iterations?: number; burnIn?: number; seed?: number } = {}): Posterior {
  const iterations = opts.iterations ?? 4000
  const burnIn = opts.burnIn ?? 2000
  const rand = rng(opts.seed ?? 1)
  const k = model.start.length
  let current = [...model.start]
  let currentLL = model.logLikelihood(current)
  if (!Number.isFinite(currentLL)) throw new Error('Point de départ impossible pour le modèle')
  const step = current.map((v) => Math.max(Math.abs(v) * 0.05, 0.1))
  const samples: number[][] = []

  for (let it = 0; it < burnIn + iterations; it++) {
    for (let j = 0; j < k; j++) {
      const proposal = [...current]
      proposal[j] += step[j] * gauss(rand)
      const ll = model.logLikelihood(proposal)
      const accepted = Number.isFinite(ll) && Math.log(rand()) < ll - currentLL
      if (accepted) {
        current = proposal
        currentLL = ll
      }
      // Pendant la chauffe, on vise ~44 % d'acceptation (optimum en 1 dimension).
      if (it < burnIn) step[j] *= Math.exp(((accepted ? 1 : 0) - 0.44) / Math.sqrt(it + 1))
    }
    if (it >= burnIn) samples.push([...current])
  }

  const mean = model.names.map((_, j) => samples.reduce((s, x) => s + x[j], 0) / samples.length)
  const sd = model.names.map((_, j) =>
    Math.sqrt(samples.reduce((s, x) => s + (x[j] - mean[j]) ** 2, 0) / (samples.length - 1)),
  )
  return { names: model.names, samples, mean, sd }
}

/** Moindres carrés (point de départ rapide). Résout (XᵀX)β = Xᵀy par élimination de Gauss. */
function leastSquares(rows: number[][], y: number[]): number[] {
  const p = rows[0].length
  const A = Array.from({ length: p }, (_, i) => {
    const line = Array.from({ length: p }, (_, j) => rows.reduce((s, r) => s + r[i] * r[j], 0))
    line.push(rows.reduce((s, r, n) => s + r[i] * y[n], 0))
    return line
  })
  for (let c = 0; c < p; c++) {
    let pivot = c
    for (let r = c + 1; r < p; r++) if (Math.abs(A[r][c]) > Math.abs(A[pivot][c])) pivot = r
    ;[A[c], A[pivot]] = [A[pivot], A[c]]
    if (Math.abs(A[c][c]) < 1e-12) throw new Error('Données insuffisantes pour estimer le modèle')
    for (let r = 0; r < p; r++) {
      if (r === c) continue
      const f = A[r][c] / A[c][c]
      for (let k = c; k <= p; k++) A[r][k] -= f * A[c][k]
    }
  }
  return A.map((line, i) => line[p] / line[i])
}

const features = (t: number, period: number) => [
  1,
  t,
  Math.sin((2 * Math.PI * t) / period),
  Math.cos((2 * Math.PI * t) / period),
]

/** Jumeau d'une série (demande, trésorerie, flux de voyageurs…) : niveau + tendance + saison + bruit. */
export function seasonalModel(series: number[], period: number): Model {
  if (series.length < 8) throw new Error('Il faut au moins 8 observations')
  const rows = series.map((_, t) => features(t, period))
  const beta = leastSquares(rows, series)
  const resid = series.map((y, t) => y - rows[t].reduce((s, x, i) => s + x * beta[i], 0))
  const sigma0 = Math.sqrt(resid.reduce((s, r) => s + r * r, 0) / series.length) || 1
  return {
    names: ['niveau', 'tendance', 'saisonSin', 'saisonCos', 'logBruit'],
    start: [...beta, Math.log(sigma0)],
    logLikelihood: (p) => {
      const sigma = Math.exp(p[4])
      let ll = 0
      for (let t = 0; t < series.length; t++) {
        const r = series[t] - (p[0] + p[1] * t + p[2] * rows[t][2] + p[3] * rows[t][3])
        ll -= Math.log(sigma) + (r * r) / (2 * sigma * sigma)
      }
      return ll
    },
  }
}

export interface Forecast {
  p10: number[]
  p50: number[]
  p90: number[]
  scenarios: number[][]
}

const quantile = (sorted: number[], q: number) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]

/** Monte Carlo : chaque scénario tire des paramètres plausibles PUIS un bruit futur. */
export function forecast(
  post: Posterior,
  start: number,
  horizon: number,
  period: number,
  opts: { scenarios?: number; seed?: number } = {},
): Forecast {
  const n = opts.scenarios ?? 2000
  const rand = rng(opts.seed ?? 7)
  const scenarios: number[][] = []
  for (let s = 0; s < n; s++) {
    const p = post.samples[Math.floor(rand() * post.samples.length)]
    const sigma = Math.exp(p[4])
    const path: number[] = []
    for (let h = 0; h < horizon; h++) {
      const f = features(start + h, period)
      path.push(p[0] + p[1] * f[1] + p[2] * f[2] + p[3] * f[3] + sigma * gauss(rand))
    }
    scenarios.push(path)
  }
  const at = (q: number) =>
    Array.from({ length: horizon }, (_, h) => quantile(scenarios.map((x) => x[h]).sort((a, b) => a - b), q))
  return { p10: at(0.1), p50: at(0.5), p90: at(0.9), scenarios }
}

export interface Backtest {
  mae: number
  naiveMae: number
  coverage80: number
}

/** Auto-contrôle : cache les `holdout` derniers points, prévoit, compare à la réalité. */
export function backtest(series: number[], period: number, holdout: number, seed = 1): Backtest {
  const train = series.slice(0, series.length - holdout)
  const truth = series.slice(series.length - holdout)
  const post = infer(seasonalModel(train, period), { seed })
  const fc = forecast(post, train.length, holdout, period, { seed })
  const mae = truth.reduce((s, y, h) => s + Math.abs(y - fc.p50[h]), 0) / holdout
  const naive = train[train.length - 1]
  const naiveMae = truth.reduce((s, y) => s + Math.abs(y - naive), 0) / holdout
  const coverage80 = truth.filter((y, h) => y >= fc.p10[h] && y <= fc.p90[h]).length / holdout
  return { mae, naiveMae, coverage80 }
}

export interface DecisionScore {
  name: string
  expected: number
  worst10: number
}

/** Décision : gain moyen et moyenne des 10 % pires scénarios (CVaR) pour chaque option. */
export function decide(
  scenarios: number[][],
  options: { name: string; payoff: (path: number[]) => number }[],
): DecisionScore[] {
  return options
    .map(({ name, payoff }) => {
      const gains = scenarios.map(payoff).sort((a, b) => a - b)
      const tail = gains.slice(0, Math.max(1, Math.floor(gains.length * 0.1)))
      return {
        name,
        expected: gains.reduce((s, g) => s + g, 0) / gains.length,
        worst10: tail.reduce((s, g) => s + g, 0) / tail.length,
      }
    })
    .sort((a, b) => b.expected - a.expected)
}
