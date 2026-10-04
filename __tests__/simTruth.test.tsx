/**
 * Until 2026-10-04 the SIM widget showed three invented plans and a single
 * "French operator" roaming tariff, and Hadak promised "4G dans tout le pays"
 * and "forfait hebdomadaire 10-20 MAD". Only sourced facts remain.
 */
import { render, screen } from '@testing-library/react'
import { SIM_OPERATORS, TimeZoneSIM } from '@/components/TravelWidgets'

describe('SIM widget', () => {
  it('links the three operators to their official sites, with no invented plan or roaming price', () => {
    render(<TimeZoneSIM />)
    for (const op of SIM_OPERATORS) {
      expect(screen.getByRole('link', { name: new RegExp(op.name) })).toHaveAttribute('href', op.url)
    }
    const text = document.body.textContent ?? ''
    expect(text).not.toMatch(/\d+ MAD|\d+ Go|€\/Mo|€\/min|€\/SMS|Avantages|Inconvénients/)
    expect(text).toMatch(/pièce d.identité officielle/)
    expect(text).toMatch(/n.est pas dans l.Union européenne/)
  })
})
