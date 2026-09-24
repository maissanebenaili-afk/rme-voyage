import { trackFunnelEvent, trackPartnerClick } from '@/lib/partnerTracking'

type VaWindow = Window & { va?: jest.Mock }

describe('partnerTracking', () => {
  const w = window as VaWindow
  beforeEach(() => {
    w.va = jest.fn()
  })
  afterEach(() => {
    delete w.va
  })

  it('sends exactly one partner_click event per click, with partner and product', () => {
    trackPartnerClick({ partner: 'directferries', product: 'ferry', placement: 'booking_cards', page: '/' })
    expect(w.va).toHaveBeenCalledTimes(1)
    expect(w.va).toHaveBeenCalledWith('partner_click', {
      partner: 'directferries',
      product: 'ferry',
      placement: 'booking_cards',
      page: '/',
    })
  })

  it('defaults the funnel event page to the current path', () => {
    trackFunnelEvent({ event: 'reality_check_used', placement: 'trip_decision_engine' })
    expect(w.va).toHaveBeenCalledWith('reality_check_used', {
      placement: 'trip_decision_engine',
      page: window.location.pathname,
    })
  })

  it('is a no-op when analytics is not loaded', () => {
    delete w.va
    expect(() => trackPartnerClick({ partner: 'x', product: 'other', placement: 'p', page: '/' })).not.toThrow()
  })
})
