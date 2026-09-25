/** @jest-environment node */
import { readFileSync } from 'node:fs'
import shapes from '@/lib/data/countryShapes.json'
import { countryNear } from '@/lib/countryLookup'

/**
 * lib/data/countryShapes.json est généré par scripts/build-country-shapes.mjs.
 * Modifier le script sans relancer la génération laisse un code inatteignable
 * et des libellés qui ne s'affichent jamais — c'est déjà arrivé.
 */
describe('countryShapes.json stays in sync with its generator', () => {
  const script = readFileSync(new URL('../scripts/build-country-shapes.mjs', import.meta.url), 'utf8')
  const mapping = script.slice(script.indexOf('const COUNTRIES = {'), script.indexOf('};', script.indexOf('const COUNTRIES = {')))
  const expected = new Set(Array.from(mapping.matchAll(/'(\d{3})':\s*'([A-Z]{2})'/g), (m) => m[2]))
  const actual = new Set(Object.keys((shapes as { countries: Record<string, unknown> }).countries))

  it('ships exactly the country codes the script maps', () => {
    expect([...actual].sort()).toEqual([...expected].sort())
  })

  it('keeps every Moroccan city the route pages rely on under a single code', () => {
    // Natural Earth isole un code 732 dont le contour ne couvre que
    // l'intérieur est ; la façade atlantique est déjà dans le polygone 504.
    // Tout le territoire est donc rattaché au Maroc (voir le script).
    for (const city of [
      [-5.83, 35.76], // Tanger
      [-7.9811, 31.6295], // Marrakech
      [-9.598, 30.427], // Agadir
      [-13.2033, 27.1536], // Laâyoune
      [-15.9582, 23.6848], // Dakhla
    ] as [number, number][]) {
      expect(countryNear(city)).toBe('MA')
    }
  })
})
