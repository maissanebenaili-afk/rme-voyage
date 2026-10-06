import { act, render, screen } from '@testing-library/react'
import { hotelSearchUrl, nightsFor, overnightStops, parseOvernightStops } from '@/lib/overnight'
import { publishRoute, toComputedRoute } from '@/lib/routeContext'
import JourneySummary from '@/components/home/JourneySummary'
import { resetTravelStoreForTests } from '@/lib/travel/useTravelStorage'

const h = 3600

describe('overnight stops', () => {
  it('cuts long drives into days of at most 11 h', () => {
    expect(nightsFor(10 * h)).toBe(0)
    expect(nightsFor(11 * h)).toBe(0)
    expect(nightsFor(20.7 * h)).toBe(1) // Paris → Tanger
    expect(nightsFor(26 * h)).toBe(2)
    expect(nightsFor(Number.NaN)).toBe(0)
  })

  // Paris (8 h) → Burgos → (12 h) → Algésiras : 20 h, une nuit vers 10 h.
  const steps = [
    { duration: 8 * h, coordinates: [[2.35, 48.86], [0.34, 46.58], [-1.47, 43.49]] as [number, number][] },
    { duration: 12 * h, coordinates: [[-3.68, 42.34], [-3.70, 40.42], [-5.45, 36.13]] as [number, number][] },
  ]
  const hubs = [
    { name: 'Burgos, Espagne', lat: 42.3448, lon: -3.6812 },
    { name: 'Lyon, France', lat: 45.7578, lon: 4.832 },
  ]

  it('picks a real stopover town near the route, close to the ideal time', () => {
    expect(overnightStops(steps, hubs)).toEqual([{ name: 'Burgos, Espagne', afterSeconds: 8 * h }])
  })

  it('proposes no stop rather than a town far from the route (no invented place)', () => {
    expect(overnightStops(steps, [{ name: 'Lyon, France', lat: 45.7578, lon: 4.832 }])).toEqual([])
  })

  it('finds no stop on a short drive', () => {
    expect(overnightStops([{ duration: 6 * h, coordinates: [[0, 0], [1, 1]] }], hubs)).toEqual([])
  })

  it('ignores malformed stops from the network', () => {
    expect(parseOvernightStops([{ name: '', afterSeconds: 3 }, { name: 'Burgos, Espagne', afterSeconds: -1 }])).toBeNull()
    expect(parseOvernightStops([{ name: ' Burgos, Espagne ', afterSeconds: 36000 }])).toEqual([{ name: 'Burgos, Espagne', afterSeconds: 36000 }])
  })

  it('links to a hotel search for the stop town', () => {
    expect(hotelSearchUrl('Burgos, Espagne')).toBe('https://www.booking.com/searchresults.fr.html?ss=Burgos%2C%20Espagne')
  })
})

describe('JourneySummary overnight block', () => {
  afterEach(() => {
    act(() => publishRoute(null))
    window.localStorage.clear()
    resetTravelStoreForTests()
  })

  it('shows where to sleep on a 20 h drive, with a labelled non-affiliated hotel link', () => {
    render(<JourneySummary />)
    act(() =>
      publishRoute(
        toComputedRoute('Paris, France', 'Tanger, Maroc', 1_942_000, 74_640, 0, undefined, undefined, [
          { name: 'Burgos, Espagne', afterSeconds: 37_320 },
        ]),
      ),
    )
    const block = screen.getByTestId('overnight')
    expect(block.textContent).toMatch(/En 2 jours : une nuit en route/)
    expect(block.textContent).toMatch(/Étape recommandée : Burgos, après ≈ 10 h 22 de route/)
    expect(block.textContent).toMatch(/Disponibilités non vérifiées/)
    expect(block.textContent).toMatch(/lien non affilié/)
    expect(screen.getByRole('link', { name: /Chercher un hôtel/ })).toHaveAttribute('href', hotelSearchUrl('Burgos, Espagne'))
  })

  it('shows no overnight block on a short trip', () => {
    render(<JourneySummary />)
    act(() => publishRoute(toComputedRoute('Algésiras, Espagne', 'Séville, Espagne', 200_000, 7_200, 0)))
    expect(screen.queryByTestId('overnight')).not.toBeInTheDocument()
  })
})
