/**
 * The home page is prerendered once at build time and served for days.
 * Anything that depends on "now" must not be in that HTML, or React finds a
 * different text in the browser and re-renders the whole page (error #418,
 * seen on every production load on 2026-10-04, caused by the "J-n" countdown).
 */
import { act } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { FuelPriceComparator, MoroccanCalendar } from '@/components/TravelWidgets'
import { FUEL_PRICES } from '@/lib/fuelByCountry'

// Tell React this test drives act() itself.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

// The Node build of the server renderer: jsdom lacks the TextEncoder that the
// browser build needs.
const { renderToString } = jest.requireActual<typeof import('react-dom/server')>('react-dom/server.node')

const DAY = 24 * 3600 * 1000

async function hydrationErrors(element: React.ReactElement, builtAt: number, openedAt: number) {
  jest.useFakeTimers({ now: builtAt })
  const html = renderToString(element)
  jest.setSystemTime(openedAt)
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)
  const errors: unknown[] = []
  await act(async () => {
    hydrateRoot(container, element, { onRecoverableError: (e) => errors.push(e) })
  })
  const text = container.textContent ?? ''
  container.remove()
  jest.useRealTimers()
  return { errors, text }
}

describe('prerendered home widgets', () => {
  it('MoroccanCalendar hydrates without mismatch when opened days after the build, with the right count', async () => {
    const builtAt = new Date('2026-10-01T12:00:00').getTime()
    const { errors, text } = await hydrationErrors(<MoroccanCalendar />, builtAt, builtAt + 3 * DAY)
    expect(errors).toEqual([])
    expect(text).toMatch(/J-\d+/)
  })

  it('FuelPriceComparator hydrates without mismatch when the prices go stale after the build, and still warns', async () => {
    const observed = new Date(FUEL_PRICES.observedAt).getTime()
    const { errors, text } = await hydrationErrors(<FuelPriceComparator />, observed + DAY, observed + 60 * DAY)
    expect(errors).toEqual([])
    expect(text).toMatch(/plus de deux semaines/)
  })
})
