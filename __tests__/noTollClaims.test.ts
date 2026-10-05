/**
 * RME computes distance, duration and fuel per country, not tolls nor the
 * ferry ticket (the route page says so). On 2026-10-05 Hadak still promised
 * "péages … calculés" and its offline answer gave invented budget ranges.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { nextActionsFor } from '@/lib/hadakGuidance'

const LANGS = ['fr', 'da', 'en', 'ar', 'es'] as const
const INTENTS = ['trip', 'route', 'ferry', 'fuel', 'weather', 'docs', 'customs', 'currency', 'generic']

describe('no toll or ferry cost claimed as computed', () => {
  it('the "plan my route" action never says tolls or ferry are worked out', () => {
    let seen = 0
    for (const intent of INTENTS) for (const lang of LANGS) {
      for (const a of nextActionsFor(intent, lang).filter((x) => x.destination === '/#route')) {
        seen++
        expect(a.reason).not.toMatch(/péages, carburant et ferry calculés|tolls, fuel and ferry worked out|Distancia, peajes, combustible y ferry para/)
        expect(a.reason).toMatch(/péages et ferry à ajouter|add tolls and ferry|añade peajes|zidhom|أضف/)
      }
    }
    expect(seen).toBeGreaterThan(0)
  })

  it('the offline budget answer has no invented price ranges', () => {
    const src = readFileSync(join(__dirname, '..', 'components', 'HadakAI.tsx'), 'utf8')
    expect(src).not.toMatch(/250-350|70-100 ?€|80-200 ?€|500-800/)
  })
})
