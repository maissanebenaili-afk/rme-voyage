import { track } from '@vercel/analytics'
import { trackFunnelEvent, trackPartnerClick } from '@/lib/partnerTracking'

jest.mock('@vercel/analytics', () => ({ track: jest.fn() }))

const trackMock = track as jest.MockedFunction<typeof track>

describe('partnerTracking', () => {
  beforeEach(() => trackMock.mockClear())

  it('sends exactly one partner_click event per click, through the official track() API', () => {
    trackPartnerClick({ partner: 'directferries', product: 'ferry', placement: 'booking_cards', page: '/' })
    expect(trackMock).toHaveBeenCalledTimes(1)
    expect(trackMock).toHaveBeenCalledWith('partner_click', {
      partner: 'directferries',
      product: 'ferry',
      placement: 'booking_cards',
      page: '/',
    })
  })

  it('defaults the funnel event page to the current path and forwards non-personal context', () => {
    trackFunnelEvent({ event: 'route_computed', placement: 'route_search', data: { has_ferry: true } })
    expect(trackMock).toHaveBeenCalledWith('route_computed', {
      has_ferry: true,
      placement: 'route_search',
      page: window.location.pathname,
    })
  })

  it('never calls window.va directly (Vercel only accepts va("event", …))', () => {
    const va = jest.fn()
    ;(window as Window & { va?: jest.Mock }).va = va
    trackPartnerClick({ partner: 'x', product: 'other', placement: 'p', page: '/' })
    expect(va).not.toHaveBeenCalled()
    delete (window as Window & { va?: jest.Mock }).va
  })
})
