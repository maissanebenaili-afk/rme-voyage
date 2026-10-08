import { readFileSync } from 'fs'
import { join } from 'path'

// Les scripts sont des modules .mjs : on vérifie leur logique en rejouant le
// code source tel quel, sans réseau ni secret.
const src = readFileSync(join(__dirname, '..', 'scripts', 'etat-rme.mjs'), 'utf8')

describe("rapport d'état RME (script)", () => {
  it('lit seulement le dépôt : aucun secret, aucun réseau', () => {
    const code = src.replace(/\/\/.*$/gm, '')
    expect(code).not.toMatch(/process\.env|fetch\(/)
  })

  it("ne présente jamais un clic comme un revenu", () => {
    expect(src).toContain("Revenu prouvé : 0 €")
    expect(src).toContain("Un clic n'est ni une réservation ni un revenu")
  })

  it('compte la « Prochaine étape » avec le même emplacement que la mesure du site', () => {
    const tracking = readFileSync(join(__dirname, '..', 'components', 'home', 'JourneySummary.tsx'), 'utf8')
    expect(tracking).toContain("placement: 'journey_summary'")
    expect(src).toContain("e.placement !== 'journey_summary'")
  })
})
