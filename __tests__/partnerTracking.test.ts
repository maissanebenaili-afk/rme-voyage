import { trackFunnelEvent, trackPartnerClick } from '@/lib/partnerTracking'

type Nav = Navigator & { sendBeacon?: jest.Mock }

async function sentPayload(beacon: jest.Mock, call = 0) {
  const [url, blob] = beacon.mock.calls[call] as [string, Blob]
  const text = await new Promise<string>((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.readAsText(blob)
  })
  return { url, body: JSON.parse(text) }
}

describe('partnerTracking', () => {
  let beacon: jest.Mock
  beforeEach(() => {
    beacon = jest.fn(() => true)
    ;(navigator as Nav).sendBeacon = beacon
  })

  it('sends exactly one partner_click event per click to the first-party event log', async () => {
    trackPartnerClick({ partner: 'directferries', product: 'ferry', placement: 'booking_cards', page: '/' })
    expect(beacon).toHaveBeenCalledTimes(1)
    const { url, body } = await sentPayload(beacon)
    expect(url).toBe('/api/events')
    expect(body).toEqual({
      event: 'partner_click',
      props: { partner: 'directferries', product: 'ferry', placement: 'booking_cards', page: '/' },
    })
  })

  it('defaults the funnel event page to the current path and forwards non-personal context', async () => {
    trackFunnelEvent({ event: 'route_computed', placement: 'route_search', data: { has_ferry: true } })
    const { body } = await sentPayload(beacon)
    expect(body).toEqual({
      event: 'route_computed',
      props: { has_ferry: true, placement: 'route_search', page: window.location.pathname },
    })
  })

  it('falls back to fetch keepalive when sendBeacon is refused, and never throws', () => {
    beacon.mockReturnValue(false)
    const fetchMock = jest.fn(() => Promise.reject(new Error('offline')))
    const original = global.fetch
    global.fetch = fetchMock as unknown as typeof fetch
    expect(() => trackPartnerClick({ partner: 'x', product: 'other', placement: 'p', page: '/' })).not.toThrow()
    expect(fetchMock).toHaveBeenCalledWith('/api/events', expect.objectContaining({ method: 'POST', keepalive: true }))
    global.fetch = original
  })
})
