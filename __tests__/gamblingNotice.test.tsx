import { render, screen } from '@testing-library/react'
import SportsHub from '@/components/SportsHub'
import FaicalWidget from '@/components/FaicalWidget'

jest.mock('@capacitor/browser', () => ({ Browser: { open: jest.fn() } }))
jest.mock('@capacitor/share', () => ({ Share: { share: jest.fn() } }))
jest.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }))

// 2026-10-06 : les blocs paris disaient seulement « réservés aux adultes, le
// jeu comporte des risques » et s'intitulaient « Partenaires » sans aucun accord.
describe('betting links always come with the prevention notice', () => {
  beforeEach(() => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify({ picks: [] }))) as unknown as typeof fetch
  })

  it.each([['SportsHub', SportsHub], ['FaicalWidget', FaicalWidget]])('%s: minors ban, help line, ANJ, no fake partnership', (_name, Component) => {
    render(<Component />)
    const notice = screen.getByTestId('gambling-notice')
    expect(notice.textContent).toMatch(/interdits aux mineurs/)
    expect(notice.textContent).toMatch(/09 74 75 13 13/)
    expect(notice.textContent).toMatch(/Autorité nationale des jeux/)
    expect(notice.textContent).toMatch(/aucun partenariat/)
    expect(document.body.textContent).not.toMatch(/Partenaires paris sportifs/)
  })
})
