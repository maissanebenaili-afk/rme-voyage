import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import InteractiveMap from '@/components/InteractiveMap'

jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }: { children: ReactNode }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Polyline: () => <div data-testid="route-line" />,
  Marker: () => null,
}))

describe('InteractiveMap', () => {
  it('shows an accessible empty state without demonstration route values', () => {
    render(<InteractiveMap />)
    expect(screen.getByText(/Renseignez un départ et une destination/i)).toBeInTheDocument()
    expect(screen.queryByText(/2 100 km|140 L|1h30|Paris/i)).not.toBeInTheDocument()
  })

  it('announces loading and provider errors', () => {
    const { rerender } = render(<InteractiveMap status="loading" />)
    expect(screen.getByRole('status')).toHaveTextContent(/Calcul de l’itinéraire/i)
    rerender(<InteractiveMap status="error" errorMessage="Quota fournisseur atteint." />)
    expect(screen.getByRole('alert')).toHaveTextContent('Quota fournisseur atteint.')
  })

  it('renders only supplied route data and formats provider metrics', () => {
    render(<InteractiveMap status="ready" routeGeometry={[[48.8566, 2.3522], [35.7595, -5.834]]} routeInfo={{ distanceMeters: 1850_000, durationSeconds: 65_400 }} />)
    expect(screen.getByTestId('map')).toBeInTheDocument()
    expect(screen.getByTestId('route-line')).toBeInTheDocument()
    expect(screen.getByText((content) => content.includes('850 km'))).toBeInTheDocument()
    expect(screen.getByText('18 h 10 min')).toBeInTheDocument()
  })
})
