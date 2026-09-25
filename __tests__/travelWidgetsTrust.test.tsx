import { render, screen, waitFor } from '@testing-library/react'
import { FuelPriceComparator, WeatherMorocco } from '@/components/TravelWidgets'
import { FUEL_PRICES } from '@/lib/fuelByCountry'

describe('WeatherMorocco', () => {
  const originalFetch = global.fetch
  afterEach(() => {
    global.fetch = originalFetch
  })

  it('queries Moroccan coordinates (west longitudes), not Algeria/Tunisia', async () => {
    const urls: string[] = []
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      urls.push(input.toString())
      return new Response(JSON.stringify({ current: { temperature_2m: 20, weather_code: 0 } }))
    }) as unknown as typeof fetch

    render(<WeatherMorocco />)
    await waitFor(() => expect(urls).toHaveLength(6))

    for (const url of urls) {
      const params = new URL(url).searchParams
      const lat = Number(params.get('latitude'))
      const lon = Number(params.get('longitude'))
      // Boîte englobante du Maroc (hors provinces du Sud) : lat 27–36, lon −13 à −1.
      expect(lat).toBeGreaterThan(27)
      expect(lat).toBeLessThan(36)
      expect(lon).toBeGreaterThan(-13)
      expect(lon).toBeLessThan(-1)
    }
  })
})

describe('FuelPriceComparator', () => {
  it('shows the official EU bulletin prices, with date and source, and no unsourced claim', () => {
    render(<FuelPriceComparator />)
    const france = document.querySelector('tr[data-country="FR"]')
    expect(france?.textContent).toContain(FUEL_PRICES.prices.FR.diesel!.toFixed(3))
    expect(screen.getByRole('link', { name: /Weekly Oil Bulletin/ })).toHaveAttribute('href', FUEL_PRICES.sourceUrl)
    expect(document.querySelector('tr[data-country="MA"]')?.textContent).toMatch(/Pas de source officielle/)
    expect(document.body.textContent).not.toMatch(/subventionn/i)
    expect(document.body.textContent).not.toMatch(/moins cher au Maroc/i)
  })
})

describe('EmergencyContacts', () => {
  it('lists the officially sourced Moroccan numbers only (19 / 177 / 15), with the source', async () => {
    const { EmergencyContacts } = await import('@/components/TravelWidgets')
    render(<EmergencyContacts />)
    const numbers = Array.from(document.querySelectorAll('a[href^="tel:"]')).map((a) => a.getAttribute('href'))
    expect(numbers).toEqual(['tel:19', 'tel:177', 'tel:15'])
    expect(document.body.textContent).not.toMatch(/Garde Royale/)
    expect(screen.getByRole('link', { name: 'France Diplomatie' })).toHaveAttribute(
      'href',
      expect.stringContaining('diplomatie.gouv.fr'),
    )
  })
})
