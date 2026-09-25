import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import RouteSearch from '@/components/RouteSearch'

// BookingCards fait de l'affiliation (hors périmètre) : on l'isole pour ne
// tester que la logique propre à RouteSearch.
jest.mock('@/components/BookingCards', () => {
  return function MockBookingCards() {
    return <div data-testid="booking-cards-mock" />
  }
})

// InteractiveMapWrapper pulls in react-leaflet (needs a real DOM/canvas setup
// covered separately by interactiveMap.test.tsx) — here we only care that
// RouteSearch passes it the right status/geometry/error props.
jest.mock('@/components/InteractiveMapWrapper', () => {
  return function MockInteractiveMapWrapper(props: Record<string, unknown>) {
    return <div data-testid="map-mock" data-status={props.status as string} data-error={props.errorMessage as string} />
  }
})

function setLocation(href: string) {
  const url = new URL(href)
  ;(window as unknown as { location: Location }).location = {
    ...window.location,
    href,
    origin: url.origin,
    search: url.search,
    hash: url.hash,
  } as Location
}

describe('RouteSearch', () => {
  const originalLocation = window.location

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: originalLocation, configurable: true, writable: true })
    jest.restoreAllMocks()
  })

  it('keeps the selected city after selecting a suggestion (regression test for the lost-selection bug)', async () => {
    render(<RouteSearch />)

    const originInput = screen.getByLabelText('Départ')
    fireEvent.change(originInput, { target: { value: 'Marrakech' } })
    fireEvent.click(screen.getByText('Marrakech, Maroc'))

    // La valeur choisie doit rester affichée : onSelect ne doit pas être
    // écrasé par un onChange(null) qui réinitialiserait les coordonnées
    // après coup.
    expect(originInput).toHaveValue('Marrakech, Maroc')

    // Le lien "Ouvrir dans Google Maps" doit refléter la ville réellement
    // sélectionnée, preuve que l'état n'a pas été perdu.
    const directionsLink = await screen.findByRole('link', { name: /Ouvrir dans Google Maps/i })
    expect(directionsLink).toHaveAttribute('href', expect.stringContaining('Marrakech'))
  })

  it('shows no fictitious popular-route distances and no Haversine "distance estimée"', () => {
    render(<RouteSearch />)
    expect(screen.queryByText(/Trajets populaires/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Distance estimée/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/2 100 km/)).not.toBeInTheDocument()
  })

  it('builds a Google Maps Directions URL using the standard api=1 syntax', async () => {
    render(<RouteSearch />)
    const link = await screen.findByRole('link', { name: /Ouvrir dans Google Maps/i })
    const href = link.getAttribute('href') || ''
    expect(href).toContain('https://www.google.com/maps/dir/?')
    expect(href).toContain('api=1')
    expect(href).toContain('travelmode=driving')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
  })

  it('disables the directions link and share button when origin equals destination', () => {
    render(<RouteSearch />)
    fireEvent.change(screen.getByLabelText('Destination'), { target: { value: 'Paris, France' } })

    expect(screen.queryByRole('link', { name: /Ouvrir dans Google Maps/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Partager mon trajet/i })).toBeDisabled()
  })

  it('validates that the date is not in the past', () => {
    render(<RouteSearch />)
    const dateInput = screen.getByLabelText('Date')
    fireEvent.change(dateInput, { target: { value: '2000-01-01' } })
    expect(screen.getByText(/date ne peut pas être dans le passé/i)).toBeInTheDocument()
  })

  it('shows "Partage effectué" (not "Lien copié") when navigator.share succeeds', async () => {
    const share = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'share', { value: share, configurable: true })

    render(<RouteSearch />)
    fireEvent.click(screen.getByRole('button', { name: /Partager mon trajet/i }))

    await waitFor(() => expect(share).toHaveBeenCalled())
    const shareArg = share.mock.calls[0][0]
    expect(shareArg.url).toContain('/?')
    expect(shareArg.url).toContain('#planifier')
    expect(shareArg.url).not.toMatch(/lat=|lon=/)

    expect(await screen.findByText(/Partage effectué/i)).toBeInTheDocument()
    expect(screen.queryByText(/Lien copié/i)).not.toBeInTheDocument()

    expect(
      screen.getByText(/Le lien contient les villes et, si renseignée, la date/i)
    ).toBeInTheDocument()

    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
  })

  it('shows "Lien copié" (not "Partage effectué") when falling back to clipboard', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    render(<RouteSearch />)
    fireEvent.click(screen.getByRole('button', { name: /Partager mon trajet/i }))

    expect(await screen.findByText(/Lien copié/i)).toBeInTheDocument()
    expect(screen.queryByText(/Partage effectué/i)).not.toBeInTheDocument()
  })

  it('shows a cancelled message and does not copy to clipboard when the native share sheet is dismissed', async () => {
    const abortError = new DOMException('The user aborted a request.', 'AbortError')
    Object.defineProperty(navigator, 'share', {
      value: jest.fn().mockRejectedValue(abortError),
      configurable: true,
    })
    const writeText = jest.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })

    render(<RouteSearch />)
    fireEvent.click(screen.getByRole('button', { name: /Partager mon trajet/i }))

    expect(await screen.findByText(/annulé/i)).toBeInTheDocument()
    expect(writeText).not.toHaveBeenCalled()
    expect(screen.queryByText(/Partage effectué/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Lien copié/i)).not.toBeInTheDocument()

    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
  })

  it('clears the share status reset timeout on unmount (no leaked timer / setState after unmount)', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    })

    const { unmount } = render(<RouteSearch />)
    fireEvent.click(screen.getByRole('button', { name: /Partager mon trajet/i }))
    // Attend que le message "Lien copié" apparaisse, preuve que le timeout
    // de réinitialisation a bien été programmé avant le démontage.
    await screen.findByText(/Lien copié/i)

    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
    unmount()
    expect(clearTimeoutSpy).toHaveBeenCalled()
    clearTimeoutSpy.mockRestore()
  })

  it('caps the city fields at 120 characters via maxLength', () => {
    render(<RouteSearch />)
    expect(screen.getByLabelText('Départ')).toHaveAttribute('maxLength', '120')
    expect(screen.getByLabelText('Destination')).toHaveAttribute('maxLength', '120')
  })

  it('falls back to a read-only field when clipboard permission is refused and navigator.share is unavailable', async () => {
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockRejectedValue(new Error('denied')) },
      configurable: true,
    })

    render(<RouteSearch />)
    fireEvent.click(screen.getByRole('button', { name: /Partager mon trajet/i }))

    const fallbackInput = await screen.findByLabelText(/copiez ce lien manuellement/i)
    expect(fallbackInput).toHaveAttribute('readonly')
    expect((fallbackInput as HTMLInputElement).value).toContain('#planifier')
  })

  it('rehydrates origin/destination/date from a shared URL on load', () => {
    setLocation('https://rme-voyage.example/?from=Lyon%2C%20France&to=Marrakech%2C%20Maroc&date=2026-12-25#planifier')

    render(<RouteSearch />)

    expect(screen.getByLabelText('Départ')).toHaveValue('Lyon, France')
    expect(screen.getByLabelText('Destination')).toHaveValue('Marrakech, Maroc')
    expect(screen.getByLabelText('Date')).toHaveValue('2026-12-25')
  })

  it('ignores malformed shared URL parameters instead of crashing', () => {
    setLocation('https://rme-voyage.example/?from=Lyon&date=not-a-date&evil=<script>#planifier')

    expect(() => render(<RouteSearch />)).not.toThrow()
    expect(screen.getByLabelText('Départ')).toHaveValue('Lyon')
    // Date invalide ignorée : le champ reste vide.
    expect(screen.getByLabelText('Date')).toHaveValue('')
  })

  it('does not show the route map until "Calculer l\'itinéraire" is clicked', () => {
    render(<RouteSearch />)
    expect(screen.queryByTestId('map-mock')).not.toBeInTheDocument()
  })

  it('calculates and displays the route on success', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ geometry: [[48.8566, 2.3522], [35.7595, -5.834]], distanceMeters: 1850000, durationSeconds: 65400 }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<RouteSearch />)
    fireEvent.click(screen.getByRole('button', { name: /Calculer l.itinéraire/i }))

    expect(screen.getByTestId('map-mock')).toHaveAttribute('data-status', 'loading')
    await waitFor(() => expect(screen.getByTestId('map-mock')).toHaveAttribute('data-status', 'ready'))

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/route?origin=Paris%2C+France&destination=Tanger%2C+Maroc'),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })

  it('shows the upstream error message when the route API fails', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Destination introuvable : Nullepart' }),
    }) as unknown as typeof fetch

    render(<RouteSearch />)
    fireEvent.click(screen.getByRole('button', { name: /Calculer l.itinéraire/i }))

    await waitFor(() => expect(screen.getByTestId('map-mock')).toHaveAttribute('data-status', 'error'))
    expect(screen.getByTestId('map-mock')).toHaveAttribute('data-error', 'Destination introuvable : Nullepart')
  })

  it('offers the route calculation in "Voiture + ferry" mode instead of a "coming soon" notice', () => {
    render(<RouteSearch />)
    fireEvent.change(screen.getByLabelText('Mode de transport'), { target: { value: 'car-ferry' } })
    expect(screen.getByRole('button', { name: /Calculer l.itinéraire/i })).toBeInTheDocument()
    expect(screen.queryByText(/arrive bientôt/)).not.toBeInTheDocument()
  })
})
