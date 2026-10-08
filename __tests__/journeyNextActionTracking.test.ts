import { readFileSync } from 'fs'
import { join } from 'path'

const source = readFileSync(join(__dirname, '..', 'components', 'home', 'JourneySummary.tsx'), 'utf8')

describe('« Prochaine étape » du voyage est mesurée', () => {
  it('compte le clic avec un événement déjà autorisé, sans ville ni donnée personnelle', () => {
    expect(source).toContain("event: 'hadak_next_action'")
    expect(source).toContain("placement: 'journey_summary'")
    expect(source).toContain('data: { action: step.icon }')
  })
})
