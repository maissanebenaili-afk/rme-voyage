import { fireEvent, render, screen } from '@testing-library/react'
import { GOLD_PRICE_READING, NISAB_GOLD_GRAMS, ZakaatCalculator, zakatFor } from '@/components/TravelWidgets'

describe('zakat nisab', () => {
  it('is 85 g of gold at the given price, not a fixed 50 000 MAD', () => {
    expect(NISAB_GOLD_GRAMS).toBe(85)
    expect(zakatFor(0, 1200).nisab).toBe(102000)
    expect(zakatFor(0, GOLD_PRICE_READING.madPerGram).nisab).toBeGreaterThan(50000)
  })

  // 2026-10-04: 60 000 MAD of savings was declared above the nisab.
  it('says zakat is not due on 60 000 MAD at a 2026 gold price, and charges nothing', () => {
    expect(zakatFor(60000, GOLD_PRICE_READING.madPerGram)).toMatchObject({ due: false, zakat: 0 })
    expect(zakatFor(200000, GOLD_PRICE_READING.madPerGram)).toMatchObject({ due: true, zakat: 5000 })
  })

  it('never shows an amount to pay under the nisab, and follows the gold price the user types', () => {
    render(<ZakaatCalculator />)
    fireEvent.change(screen.getByLabelText(/Devise/), { target: { value: 'MAD' } })
    fireEvent.change(screen.getByLabelText(/Épargne/), { target: { value: '60000' } })
    expect(document.body.textContent).toMatch(/Zakat non due/)
    expect(document.body.textContent).not.toMatch(/Zakat à payer/)
    fireEvent.change(screen.getByLabelText(/Prix de l.or/), { target: { value: '500' } })
    expect(document.body.textContent).toMatch(/Zakat à payer/)
    expect(document.body.textContent).toMatch(/1\s?500/)
  })
})
