/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '../app/api/hadak/route'

function post(body: unknown) {
  return POST(
    new NextRequest('http://localhost/api/hadak', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
    }),
  )
}

describe('POST /api/hadak — cost guards', () => {
  const originalFetch = global.fetch
  afterEach(() => {
    global.fetch = originalFetch
  })

  it('refuses an oversized message before any upstream call', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch

    const response = await post({ message: 'x'.repeat(1_001), lang: 'fr' })

    expect(response.status).toBe(413)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('rejects a missing message', async () => {
    const response = await post({ lang: 'fr' })
    expect(response.status).toBe(400)
  })
})

describe('POST /api/hadak — intent detection', () => {
  const originalFetch = global.fetch
  afterEach(() => {
    global.fetch = originalFetch
  })

  it('answers prayer times, not the clock, for "à quelle heure était la prière à Taza aujourd\'hui"', async () => {
    // Bug report: this exact phrasing used to match the "time" intent first
    // (it contains "quelle heure"), so the app answered "Il est
    // actuellement HH:MM" and silently ignored "la prière" and "Taza".
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input.toString())
      if (url.hostname === 'api.aladhan.com') {
        expect(url.searchParams.get('city')).toBe('Taza')
        return new Response(
          JSON.stringify({ data: { timings: { Fajr: '05:30', Dhuhr: '13:10', Asr: '16:20', Maghrib: '18:45', Isha: '20:05' } } }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        )
      }
      throw new Error(`Unexpected fetch: ${url}`)
    }) as unknown as typeof fetch

    const response = await post({ message: 'à quelle heure était la prière à Taza aujourd\'hui', lang: 'fr' })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.source).toBe('local')
    expect(data.response).toContain('Taza')
    expect(data.response).toContain('Fajr')
    expect(data.response).toContain('05:30')
    expect(data.response).not.toMatch(/Il est actuellement/)
  })

  it('also fixes the app\'s own suggested Darija phrasing "wa9t salat f Taza"', async () => {
    global.fetch = jest.fn(async () =>
      new Response(JSON.stringify({ data: { timings: null } }), { status: 200, headers: { 'content-type': 'application/json' } }),
    ) as unknown as typeof fetch

    const response = await post({ message: 'wa9t salat f Taza', lang: 'da' })
    const data = await response.json()

    expect(data.response).toMatch(/Salawat/)
    expect(data.response).not.toMatch(/F l-Maghrib daba/)
  })

  it('still answers the plain clock question when no prayer word is present', async () => {
    const response = await post({ message: 'quelle heure est-il au Maroc', lang: 'fr' })
    const data = await response.json()

    expect(data.response).toMatch(/Il est actuellement/)
  })
})

describe('POST /api/hadak — documents vs ferry', () => {
  const originalFetch = global.fetch
  afterEach(() => {
    global.fetch = originalFetch
  })

  async function ask(message: string) {
    global.fetch = jest.fn(async () => {
      throw new Error('no upstream call expected')
    }) as unknown as typeof fetch
    const response = await post({ message, lang: 'fr' })
    return (await response.json()).response as string
  }

  it('answers documents, not ferries, when a port is named in a documents question', async () => {
    const text = await ask('Quels documents pour passer la frontière à Tanger Med ?')
    expect(text).toMatch(/Documents nécessaires/)
    expect(text).not.toMatch(/Ferries pour les MRE/)
  })

  it('still answers ferries for "quel ferry pour rentrer au Maroc"', async () => {
    const text = await ask('Quel ferry pour rentrer au Maroc ?')
    expect(text).toMatch(/Ferries pour les MRE/)
  })
})
