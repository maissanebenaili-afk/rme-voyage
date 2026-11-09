import { fireEvent, render, screen } from '@testing-library/react'
import DepartCalendar from '@/components/DepartCalendar'
import sitemap from '@/app/sitemap'

afterEach(() => window.history.replaceState(null, '', '/'))

describe('Calendrier « Quand partir »', () => {
  it('shows the month with a level on every day, not by colour alone', () => {
    render(<DepartCalendar initial={{ year: 2027, month: 7 }} />)
    expect(screen.getByRole('heading', { name: 'juillet 2027' })).toBeInTheDocument()
    expect(screen.getByText('Ce mois-ci : 0 jours calmes, 14 chargés, 17 très chargés.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'mercredi 14 juillet 2027 : Chargé' })).toHaveTextContent('14!')
    expect(screen.getByRole('button', { name: 'jeudi 15 juillet 2027 : Très chargé' })).toHaveTextContent('15!!')
  })

  it('details a day, proposes the nearest calmer day and a WhatsApp link to that day', () => {
    render(<DepartCalendar initial={{ year: 2027, month: 7 }} />)
    fireEvent.click(screen.getByRole('button', { name: 'vendredi 16 juillet 2027 : Très chargé' }))
    expect(screen.getByRole('heading', { name: 'vendredi 16 juillet 2027' })).toBeInTheDocument()
    expect(screen.getByText(/Cœur de la saison estivale/)).toBeInTheDocument()

    const share = screen.getByRole('link', { name: /Envoyer ce jour à la famille/ })
    expect(decodeURIComponent(share.getAttribute('href')!)).toContain('/quand-partir?jour=2027-07-16')

    fireEvent.click(screen.getByRole('button', { name: 'mercredi 14 juillet 2027' }))
    expect(screen.getByRole('heading', { name: 'mercredi 14 juillet 2027' })).toBeInTheDocument()
  })

  it('still proposes a calmer day in the middle of the season, when it is weeks away', () => {
    render(<DepartCalendar initial={{ year: 2027, month: 8 }} />)
    fireEvent.click(screen.getByRole('button', { name: 'jeudi 5 août 2027 : Très chargé' }))
    expect(screen.getByRole('button', { name: 'jeudi 26 août 2027' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Mois précédent' }))
    fireEvent.click(screen.getByRole('button', { name: 'mercredi 14 juillet 2027 : Chargé' }))
    expect(screen.getByRole('button', { name: 'vendredi 4 juin 2027' })).toBeInTheDocument()
  })

  it('moves across months and years', () => {
    render(<DepartCalendar initial={{ year: 2026, month: 12 }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Mois suivant' }))
    expect(screen.getByRole('heading', { name: 'janvier 2027' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Mois précédent' }))
    expect(screen.getByRole('heading', { name: 'décembre 2026' })).toBeInTheDocument()
  })

  it('says so when the Aïd dates of the year are not announced yet', () => {
    render(<DepartCalendar initial={{ year: 2031, month: 5 }} />)
    expect(screen.getByText(/dates des Aïd de 2031 ne sont pas encore annoncées/)).toBeInTheDocument()
  })

  it('opens the shared day from the link, and ignores an invalid one', () => {
    window.history.replaceState(null, '', '/quand-partir?jour=2027-08-30')
    const { unmount } = render(<DepartCalendar initial={{ year: 2026, month: 11 }} />)
    expect(screen.getByRole('heading', { name: 'lundi 30 août 2027' })).toBeInTheDocument()
    unmount()

    window.history.replaceState(null, '', '/quand-partir?jour=2027-02-31')
    render(<DepartCalendar initial={{ year: 2026, month: 11 }} />)
    expect(screen.getByRole('heading', { name: 'novembre 2026' })).toBeInTheDocument()
    expect(screen.getByText(/Touchez un jour/)).toBeInTheDocument()
  })

  it('is listed in the sitemap', () => {
    expect(sitemap().some((entry) => entry.url.endsWith('/quand-partir'))).toBe(true)
  })
})
