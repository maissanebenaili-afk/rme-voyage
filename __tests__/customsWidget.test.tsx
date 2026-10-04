import { render, screen } from '@testing-library/react'
import { CustomsCalculator, CUSTOMS_SOURCES } from '@/components/TravelWidgets'

describe('CustomsCalculator', () => {
  it('shows only the sourced limits: 20 000 DH MRE gifts, 2 000 DH cash, 100 000 DH declaration', () => {
    render(<CustomsCalculator />)
    const text = document.body.textContent ?? ''
    expect(text).toMatch(/moins de 20 000 DH/)
    expect(text).toMatch(/2 000 DH au plus/)
    expect(text).toMatch(/déclaration dès 100 000 DH/)
    expect(screen.getAllByRole('link', { name: /Office des Changes/ })[0]).toHaveAttribute('href', CUSTOMS_SOURCES.igoc2026)
    expect(screen.getByRole('link', { name: /ADII/ })).toHaveAttribute('href', CUSTOMS_SOURCES.adiiMre)
  })

  // Invented rules shown on the home page until 2026-10-04.
  it('no longer computes duties from invented rates or limits', () => {
    render(<CustomsCalculator />)
    const text = document.body.textContent ?? ''
    expect(text).not.toMatch(/Droits estimés|Franchise: 1\s?000|20%|10 000 EUR/)
    expect(screen.queryByRole('spinbutton')).toBeNull()
  })
})
