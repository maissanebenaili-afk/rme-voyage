import { render } from '@testing-library/react'
import JuryPack from '@/components/JuryPack'
import { formatKm, getRoutePage } from '@/lib/routePages'

// /pitch is shown to a jury. Checked against production on 2026-10-04: the
// converter used fixed rates (not "temps réel"), Paris → Tanger is about
// 1 939 km by RME's own route (not 2100), and "la première plateforme" has
// no source (LesMRE.com and the official Marhaba app exist).
describe('jury page claims only what RME can show', () => {
  it('no superlative, no real-time claim, the computed distance', () => {
    const { container } = render(<JuryPack />)
    const text = container.textContent ?? ''
    expect(text).not.toMatch(/première plateforme|temps réel \(MAD|2100 km|accessibilité totale/)
    expect(text).toContain(formatKm(getRoutePage('paris-tanger')!.distanceMeters))
  })
})
