import { act, fireEvent, render, screen } from '@testing-library/react'
import TripDecisionEngine from '../components/TripDecisionEngine'
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

  it('does not tell a car+ferry traveller that car-only is cheaper', () => {
    render(<TripDecisionEngine />)
    fireEvent.click(screen.getByRole('button', { name: /Voiture \+ ferry/ }))
    // Défauts : 4 voyageurs, voiture + ferry ≈ 497 € < avion 720 €.
    expect(screen.getByText('Ce scénario est le moins cher selon vos hypothèses.')).toBeInTheDocument()
  })
})

describe('Reality Check — fuel by leg and country', () => {
  afterEach(() => act(() => publishRoute(null)))

  const legs = [
    {
      kind: 'road', from: 'Paris', to: 'Tarifa', distanceMeters: 1_938_871, durationSeconds: 70_000,
      countries: [{ country: 'FR', meters: 1_000_000 }, { country: 'ES', meters: 938_871 }],
    },
    { kind: 'ferry', from: 'Tarifa', to: 'Tanger Ville', distanceMeters: 30_000, measured: 'straight-line' },
    {
      kind: 'road', from: 'Tanger Ville', to: 'Marrakech', distanceMeters: 573_093, durationSeconds: 22_000,
      countries: [{ country: 'MA', meters: 573_093 }],
    },
  ]

  function publish(computedAt: string) {
    act(() =>
      publishRoute(toComputedRoute('Paris', 'Marrakech', 2_511_964, 92_000, Date.parse(computedAt), legs)),
    )
  }

  it('shows each leg, prices EU countries from the bulletin and Morocco with the user price', () => {
    render(<TripDecisionEngine />)
    publish('2026-09-25T10:00:00Z')

    expect(distanceInput().value).toBe('2512')
    expect(screen.getByText(/Traversée Tarifa → Tanger Ville/)).toBeInTheDocument()
    expect(document.querySelector('tr[data-country="FR"]')?.textContent).toMatch(/France/)
    expect(document.querySelector('tr[data-country="ES"]')?.textContent).toMatch(/Espagne/)
    expect(document.querySelector('tr[data-country="MA"]')?.textContent).toMatch(/votre prix/)
    expect(document.querySelector('tr[data-country="FR"]')?.textContent).not.toMatch(/votre prix/)
    expect(document.querySelector('[data-fuel-dataset]')?.getAttribute('data-fuel-dataset')).toBe('fresh')
    // Un itinéraire avec traversée bascule le scénario sur « Voiture + ferry ».
    expect(screen.getByRole('button', { name: /Voiture \+ ferry/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('falls back to the user price everywhere once the bulletin has expired', () => {
    render(<TripDecisionEngine />)
    publish('2026-12-01T10:00:00Z')

    expect(document.querySelector('[data-fuel-dataset]')?.getAttribute('data-fuel-dataset')).toBe('expired')
    expect(document.querySelector('tr[data-country="FR"]')?.textContent).toMatch(/votre prix/)
  })

  it('drops the per-country breakdown when the distance is typed by hand', () => {
    render(<TripDecisionEngine />)
    publish('2026-09-25T10:00:00Z')
    fireEvent.change(distanceInput(), { target: { value: '2400' } })
    expect(screen.queryByText(/Carburant par tronçon et par pays/)).not.toBeInTheDocument()
  })
})

describe('Reality Check — scenarios follow the computed route', () => {
  afterEach(() => act(() => publishRoute(null)))

  const road = (from: string, to: string, meters: number, country: string) => ({
    kind: 'road', from, to, distanceMeters: meters, durationSeconds: 1, countries: [{ country, meters }],
  })

  it('defaults to "Voiture + ferry" (Europe ↔ Maroc) and labels the budget as one-way', () => {
    render(<TripDecisionEngine />)
    expect(screen.getByRole('button', { name: /Voiture \+ ferry/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/aller simple/i)).toBeInTheDocument()
  })

  it('switches to car-only and hides the ferry scenario for a route without crossing', () => {
    render(<TripDecisionEngine />)
    act(() =>
      publishRoute(toComputedRoute('Paris', 'Madrid', 1_268_000, 1, Date.parse('2026-09-25T10:00:00Z'), [
        road('Paris', 'Madrid', 1_268_000, 'FR'),
      ])),
    )
    expect(screen.getByRole('button', { name: /^Voiture$/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('Voiture + ferry', { selector: 'span' })).not.toBeInTheDocument()
    expect(screen.getByText('Voiture (sans ferry)')).toBeInTheDocument()
  })

  it('hides the impossible car-only scenario when the route needs a crossing', () => {
    render(<TripDecisionEngine />)
    act(() =>
      publishRoute(toComputedRoute('Paris', 'Tanger', 1_940_000, 1, Date.parse('2026-09-25T10:00:00Z'), [
        road('Paris', 'Tarifa', 1_937_000, 'FR'),
        { kind: 'ferry', from: 'Tarifa', to: 'Tanger Ville', distanceMeters: 30_600, measured: 'straight-line' },
        road('Tanger Ville', 'Tanger', 3_000, 'MA'),
      ])),
    )
    expect(screen.queryByText('Voiture (sans ferry)')).not.toBeInTheDocument()
  })
})
