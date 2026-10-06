import { render, screen } from '@testing-library/react'
import SportsHub from '@/components/SportsHub'
import FaicalWidget from '@/components/FaicalWidget'
import { paidSportsPartners } from '@/lib/sportsPartners'

jest.mock('@capacitor/browser', () => ({ Browser: { open: jest.fn() } }))
jest.mock('@capacitor/share', () => ({ Share: { share: jest.fn() } }))
jest.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }))
jest.mock('@/lib/sportsPartners', () => ({
  ...jest.requireActual('@/lib/sportsPartners'),
  paidSportsPartners: jest.fn(() => []),
}))

const paid = paidSportsPartners as jest.MockedFunction<typeof paidSportsPartners>

// Décision du fondateur (2026-10-06) : un site de paris n'apparaît que s'il
// rapporte (lien affilié réel). Avant, Unibet, Betclic, Winamax et bet365
// s'affichaient sous « Partenaires paris sportifs » sans aucun accord.
describe.each([['SportsHub', SportsHub], ['FaicalWidget', FaicalWidget]])('%s betting block', (_name, Component) => {
  beforeEach(() => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify({ picks: [] }))) as unknown as typeof fetch
    paid.mockReturnValue([])
  })

  it('shows no betting operator at all without a paid affiliate link', () => {
    render(<Component />)
    for (const name of ['Unibet', 'Betclic', 'Winamax', 'bet365']) expect(screen.queryByText(name)).not.toBeInTheDocument()
    expect(screen.queryByTestId('gambling-notice')).not.toBeInTheDocument()
    expect(document.body.textContent).not.toMatch(/Partenaires paris sportifs/)
  })

  it('shows a paid operator only with the prevention notice', () => {
    paid.mockReturnValue([{ id: 'winamax', name: 'Winamax', url: 'https://www.winamax.fr/?aff=rme', affiliateUrl: 'https://www.winamax.fr/?aff=rme', status: 'active' }])
    render(<Component />)
    expect(screen.getByRole('link', { name: /Winamax/ })).toHaveAttribute('rel', 'sponsored noopener noreferrer')
    const notice = screen.getByTestId('gambling-notice')
    expect(notice.textContent).toMatch(/interdits aux mineurs/)
    expect(notice.textContent).toMatch(/09 74 75 13 13/)
    expect(notice.textContent).toMatch(/Autorité nationale des jeux/)
    expect(notice.textContent).toMatch(/commission/)
  })
})
