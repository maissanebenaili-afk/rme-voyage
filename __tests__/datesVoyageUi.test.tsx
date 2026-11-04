import { fireEvent, render, screen } from '@testing-library/react'
import { CompteurVoiture, VerifPasseport } from '@/components/DatesVoyage'

// « Aujourd'hui » figé pour que les résultats ne dépendent pas du jour du test.
beforeEach(() => {
  jest.useFakeTimers({ now: new Date('2027-07-01T10:00:00Z') })
})
afterEach(() => jest.useRealTimers())

describe('Compteur voiture 180 jours', () => {
  it('gives the last day in Morocco and mentions the December extension', () => {
    render(<CompteurVoiture />)
    fireEvent.change(screen.getByLabelText("Date d'entrée au Maroc"), { target: { value: '2027-07-01' } })
    expect(screen.getByText('27 décembre 2027')).toBeInTheDocument()
    expect(screen.getByText(/180 jours/, { selector: 'strong' })).toBeInTheDocument()
    expect(screen.getByText(/prolonger de 180 jours, sans pénalité/)).toBeInTheDocument()
  })

  it('shows the fine when the deadline is past', () => {
    render(<CompteurVoiture />)
    fireEvent.change(screen.getByLabelText("Date d'entrée au Maroc"), { target: { value: '2027-01-02' } })
    expect(screen.getByText(/Délai dépassé de/)).toHaveTextContent('Délai dépassé de 1 jours : amende prévue 1 000 DH')
  })

  it('warns that no day is left after 180 days this year', () => {
    render(<CompteurVoiture />)
    fireEvent.change(screen.getByLabelText("Date d'entrée au Maroc"), { target: { value: '2027-07-01' } })
    fireEvent.change(screen.getByLabelText(/Jours déjà passés/), { target: { value: '180' } })
    expect(screen.getByText(/Plus aucun jour pour 2027/)).toBeInTheDocument()
  })
})

describe('Vérif passeport', () => {
  it('says when the passport expires before the return', () => {
    render(<VerifPasseport />)
    fireEvent.change(screen.getByLabelText("Date d'expiration du passeport"), { target: { value: '2027-08-10' } })
    fireEvent.change(screen.getByLabelText('Date du retour'), { target: { value: '2027-08-31' } })
    expect(screen.getByText(/avant votre retour/)).toHaveTextContent('Il expire le 10 août 2027, avant votre retour')
  })

  it('confirms a passport valid for the whole stay', () => {
    render(<VerifPasseport />)
    fireEvent.change(screen.getByLabelText("Date d'expiration du passeport"), { target: { value: '2028-01-10' } })
    fireEvent.change(screen.getByLabelText('Date du retour'), { target: { value: '2027-08-31' } })
    expect(screen.getByText(/Valable pour tout le séjour/)).toHaveTextContent('et encore 132 jours après le retour')
  })
})
