import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ServicesMap from '@/components/ServicesMap'

// ServicesMapViewWrapper pulls in react-leaflet (covered separately by
// interactiveMap.test.tsx's approach) — here we only care that ServicesMap
// passes it the right center/results.
jest.mock('@/components/ServicesMapViewWrapper', () => {
  return function MockServicesMapViewWrapper(props: Record<string, unknown>) {
    return <div data-testid="services-map-mock" data-count={(props.results as unknown[]).length} />
  }
})

describe('ServicesMap', () => {
  const originalFetch = global.fetch

  afterEach(() => {
    if (originalFetch) {
      global.fetch = originalFetch
    } else {
      Reflect.deleteProperty(global, 'fetch')
    }
    jest.restoreAllMocks()
  })

  it('renders all six category filters and a default city', () => {
    render(<ServicesMap />)
    expect(screen.getByRole('button', { name: /Stations-service/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Mosquées/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Restaurants halal/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Consulats/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Aires de repos/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Garages/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Ville de recherche')).toHaveValue('Tanger, Maroc')
  })

  it('shows no fictitious sample service cards before any search', () => {
    render(<ServicesMap />)
    expect(screen.queryByText(/TotalEnergies/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Grande Mosquée — Barcelone/i)).not.toBeInTheDocument()
    expect(screen.getByText(/lancez la recherche pour voir de vrais services/i)).toBeInTheDocument()
  })

  it('fetches real results for the selected category and city on search', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          center: { lat: 35.7595, lon: -5.834 },
          results: [
            { id: 'node/1', name: 'Station Atlas', lat: 35.76, lon: -5.83, distanceMeters: 1200 },
          ],
        }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<ServicesMap />)
    fireEvent.click(screen.getByRole('button', { name: /Mosquées/i }))
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/i }))

    await waitFor(() => expect(screen.getByText('Station Atlas')).toBeInTheDocument())

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/services?place=Tanger%2C+Maroc&category=mosque'),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    expect(screen.getByTestId('services-map-mock')).toHaveAttribute('data-count', '1')
  })

  it('shows an honest empty state (no fabricated results) when nothing is found', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ center: { lat: 1, lon: 1 }, results: [] }),
    }) as unknown as typeof fetch

    render(<ServicesMap />)
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/i }))

    await waitFor(() =>
      expect(screen.getByText(/Aucun résultat pour/i)).toBeInTheDocument(),
    )
    expect(screen.queryByTestId('services-map-mock')).not.toBeInTheDocument()
  })

  it('shows the upstream error message when the services API fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Lieu introuvable : Nullepart' }),
    }) as unknown as typeof fetch

    render(<ServicesMap />)
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/i }))

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Lieu introuvable : Nullepart'))
  })
})
