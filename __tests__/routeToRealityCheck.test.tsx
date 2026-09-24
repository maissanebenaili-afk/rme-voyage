import { act, fireEvent, render, screen } from '@testing-library/react'
import TripDecisionEngine from '../components/TripDecisionEngine'
import CostCalculator from '../components/CostCalculator'
import { publishRoute, toComputedRoute } from '@/lib/routeContext'

function distanceInput() {
  return screen.getAllByRole('spinbutton')[0] as HTMLInputElement
}

describe('Route → Reality Check bridge', () => {
  afterEach(() => act(() => publishRoute(null)))

  it('starts from an explicitly labelled example distance', () => {
    render(<TripDecisionEngine />)
    expect(distanceInput().value).toBe('1450')
    expect(document.querySelector('[data-provenance]')?.getAttribute('data-provenance')).toBe('default')
  })

  it('adopts the computed route distance and shows where it comes from', () => {
    render(<TripDecisionEngine />)
    act(() => publishRoute(toComputedRoute('Paris, France', 'Tanger, Maroc', 2_104_400, 80_000)))
    expect(distanceInput().value).toBe('2104')
    expect(screen.getByText(/Paris, France → Tanger, Maroc \(OpenStreetMap \/ OSRM\)/)).toBeInTheDocument()
  })

  it('flags the distance as stale when the route is invalidated', () => {
    render(<TripDecisionEngine />)
    act(() => publishRoute(toComputedRoute('Paris', 'Tanger', 2_104_400, 80_000)))
    act(() => publishRoute(null))
    expect(distanceInput().value).toBe('2104')
    expect(document.querySelector('[data-provenance]')?.getAttribute('data-provenance')).toBe('stale')
  })

  it('marks a hand-typed distance as manual', () => {
    render(<TripDecisionEngine />)
    act(() => publishRoute(toComputedRoute('Paris', 'Tanger', 2_104_400, 80_000)))
    fireEvent.change(distanceInput(), { target: { value: '1900' } })
    expect(distanceInput().value).toBe('1900')
    expect(screen.getByText('Distance saisie manuellement.')).toBeInTheDocument()
  })

  it('feeds the budget calculator too', () => {
    render(<CostCalculator />)
    act(() => publishRoute(toComputedRoute('Bruxelles', 'Nador', 2_550_000, 90_000)))
    expect(distanceInput().value).toBe('2550')
  })

  it('does not tell a car+ferry traveller that car-only is cheaper', () => {
    render(<TripDecisionEngine />)
    fireEvent.click(screen.getByRole('button', { name: /Voiture \+ ferry/ }))
    // Défauts : 4 voyageurs, voiture + ferry ≈ 497 € < avion 720 €.
    expect(screen.getByText('Ce scénario est le moins cher selon vos hypothèses.')).toBeInTheDocument()
  })
})
