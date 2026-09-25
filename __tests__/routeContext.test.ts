import { getComputedRoute, publishRoute, subscribeRoute, toComputedRoute } from '@/lib/routeContext'

describe('routeContext', () => {
  afterEach(() => publishRoute(null))

  it('converts an OSRM response into a sourced, timestamped route', () => {
    expect(toComputedRoute('Paris', 'Tanger', 2_104_400, 80_000, 42)).toEqual({
      origin: 'Paris',
      destination: 'Tanger',
      distanceKm: 2104,
      durationSeconds: 80_000,
      source: 'osrm',
      computedAt: 42,
    })
  })

  it('rejects missing, zero, negative or non-numeric distances', () => {
    for (const bad of [undefined, null, 0, -5, Number.NaN, '2000']) {
      expect(toComputedRoute('A', 'B', bad, 10)).toBeNull()
    }
  })

  it('notifies subscribers and stops after unsubscribe', () => {
    const listener = jest.fn()
    const unsubscribe = subscribeRoute(listener)
    const route = toComputedRoute('A', 'B', 5000, 60)
    publishRoute(route)
    expect(getComputedRoute()).toBe(route)
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    publishRoute(null)
    expect(listener).toHaveBeenCalledTimes(1)
  })
})
