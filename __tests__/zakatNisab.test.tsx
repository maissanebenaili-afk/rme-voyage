import { fireEvent, render, screen } from '@testing-library/react'
import { GOLD_PRICE_READING, eurToMadFrom, goldReadingIsStale, NISAB_GOLD_GRAMS, ZakaatCalculator, zakatFor } from '@/components/TravelWidgets'

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

// 2026-10-06 : le relevé de l'or (fin juillet) donnait un verdict ferme.
describe('zakat with an old gold reading', () => {
  afterEach(() => jest.useRealTimers())

  it('flags the verdict « à confirmer » until the user types the price of the day', () => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] }).setSystemTime(new Date('2026-10-06T12:00:00Z'))
    render(<ZakaatCalculator />)
    fireEvent.change(screen.getByLabelText(/Devise/), { target: { value: 'MAD' } })
    fireEvent.change(screen.getByLabelText(/Épargne/), { target: { value: '60000' } })
    expect(screen.getByRole('alert').textContent).toMatch(/fin juillet 2026/)
    expect(document.body.textContent).toMatch(/à confirmer/)
    expect(document.body.textContent).not.toMatch(/Zakat non obligatoire/)

    fireEvent.change(screen.getByLabelText(/Prix de l.or/), { target: { value: '1250' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/à confirmer/)
    expect(document.body.textContent).toMatch(/Zakat non obligatoire/)
  })

  it('treats the reading as fresh during the month it was taken', () => {
    expect(goldReadingIsStale('2026-08-10', GOLD_PRICE_READING.madPerGram)).toBe(false)
    expect(goldReadingIsStale('2026-10-06', GOLD_PRICE_READING.madPerGram)).toBe(true)
    expect(goldReadingIsStale('2026-10-06', 1250)).toBe(false)
  })
})

// 2026-10-06 : la Zakat convertissait à 10,8 en dur alors que le convertisseur
// de la même page affichait le taux du jour (11,03).
describe('zakat uses the live EUR → MAD rate', () => {
  const originalFetch = global.fetch
  afterEach(() => { global.fetch = originalFetch })

  it('reads the day rate and says so', async () => {
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ date: '2026-10-06', eur: { mad: 11.03 } }) })) as unknown as typeof fetch
    render(<ZakaatCalculator />)
    fireEvent.change(screen.getByLabelText(/Prix de l.or/), { target: { value: '1213.5' } })
    // 9 400 € : 101 520 MAD à 10,8 (sous le nisab de 103 147,5) mais 103 682 MAD à 11,03 (au-dessus).
    fireEvent.change(screen.getByLabelText(/Épargne/), { target: { value: '9400' } })
    expect(await screen.findByText(/taux de marché du 2026-10-06/)).toBeInTheDocument()
    expect(document.body.textContent).toMatch(/Zakat à payer/)
  })

  it('falls back to the fixed rate, labelled as not current', () => {
    global.fetch = jest.fn(async () => { throw new Error('offline') }) as unknown as typeof fetch
    render(<ZakaatCalculator />)
    expect(document.body.textContent).toMatch(/taux fixe indicatif, non à jour/)
  })

  it('rejects an absurd rate', () => {
    expect(eurToMadFrom({ date: '2026-10-06', eur: { mad: 0.09 } })).toBeNull()
    expect(eurToMadFrom({ date: '2026-10-06', eur: { mad: 11.03 } })).toEqual({ rate: 11.03, date: '2026-10-06' })
  })
})
