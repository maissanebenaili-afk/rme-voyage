/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '../app/api/hadak/route'
import { detectServiceRequest } from '@/lib/hadakServices'

// Production, 2026-10-04: "garage près de Taza" got Taza's weather, "station
// essence près de Nador" a fuel price, and "consulat à Paris" an AI-made
// address that differed by language (real one: 12 rue de la Saïda).
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

function mockOsm(elements: unknown[] | 'down') {
  const calls: string[] = []
  global.fetch = jest.fn(async (input: RequestInfo | URL) => {
    const url = new URL(input.toString())
    calls.push(url.hostname)
    if (url.hostname === 'nominatim.openstreetmap.org') return json([{ lat: '34.21', lon: '-4.01' }])
    if (url.hostname.startsWith('overpass')) return elements === 'down' ? json({}, 504) : json({ elements })
    throw new Error(`no other upstream call expected: ${url}`)
  }) as unknown as typeof fetch
  return calls
}

async function ask(message: string, lang = 'fr') {
  const res = await POST(new NextRequest('http://localhost/api/hadak', {
    method: 'POST', body: JSON.stringify({ message, lang }), headers: { 'content-type': 'application/json' },
  }))
  return (await res.json()) as { response: string; source?: string; trust?: { basis: string; sources: string[] } }
}

describe('Hadak answers "where is a …" with real places, never from memory', () => {
  const originalFetch = global.fetch
  afterEach(() => { global.fetch = originalFetch })

  it('garage near Taza: OpenStreetMap results, not the weather', async () => {
    mockOsm([{ type: 'node', id: 1, lat: 34.215, lon: -4.012, tags: { name: 'Garage Atlas', 'addr:street': 'Rue X' } }])
    const data = await ask('Je cherche un garage près de Taza')
    expect(data.source).toBe('local')
    expect(data.response).toMatch(/Garages autour de Taza/)
    expect(data.response).toMatch(/Garage Atlas/)
    expect(data.response).not.toMatch(/Météo|°C/)
    expect(data.trust).toMatchObject({ basis: 'LIVE_DATA', sources: ['OpenStreetMap'] })
  })

  it('consulate in Paris never goes to the AI; with the search down it says so instead of inventing', async () => {
    const calls = mockOsm('down')
    const data = await ask('Je cherche un consulat à Paris')
    expect(calls.some((h) => /groq|anthropic|openai|generativelanguage/.test(h))).toBe(false)
    expect(data.response).toMatch(/indisponible/)
    expect(data.response).toMatch(/Je ne donne pas d'adresse de mémoire/)
    expect(data.response).not.toMatch(/Rue|\+33/)
  })

  it('tries the second OpenStreetMap server when the first one fails', async () => {
    let overpass = 0
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input.toString())
      if (url.hostname === 'nominatim.openstreetmap.org') return json([{ lat: '35.17', lon: '-2.93' }])
      overpass += 1
      return overpass === 1 ? json({}, 406) : json({ elements: [{ type: 'node', id: 9, lat: 35.171, lon: -2.931, tags: { name: 'Station Nador' } }] })
    }) as unknown as typeof fetch
    const data = await ask('Où trouver une station essence près de Nador ?')
    expect(overpass).toBe(2)
    expect(data.response).toMatch(/Station Nador/)
  })

  it('asks for the town when none is given', async () => {
    mockOsm([])
    expect((await ask('Je cherche un garage')).response).toMatch(/dans quelle ville/)
  })

  it.each([
    ['Quel temps fait-il à Taza ?', null],
    ["Prix de l'essence au Maroc ?", null],
    ['garage près de Taza', 'garage'],
    ['Où est la mosquée la plus proche à Fès ?', 'mosque'],
    ['ambassade du Maroc à Madrid', 'consulate'],
  ])('detects "%s" as %s', (message, category) => {
    expect(detectServiceRequest(message)?.category ?? null).toBe(category)
  })
})

describe('services search never turns an Overpass failure into "nothing here"', () => {
  const originalFetch = global.fetch
  afterEach(() => { global.fetch = originalFetch })

  it('a 200 with a runtime-error remark and no elements is a failure, so the next server is tried', async () => {
    const { searchServices } = await import('@/lib/servicesSearch')
    let overpass = 0
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input.toString())
      if (url.hostname === 'nominatim.openstreetmap.org') return json([{ lat: '48.85', lon: '2.35' }])
      overpass += 1
      return overpass === 1
        ? json({ elements: [], remark: 'runtime error: Query timed out in "query" at line 2 after 21 seconds.' })
        : json({ elements: [{ type: 'node', id: 5, lat: 48.84, lon: 2.3, tags: { name: 'Consulat général du Maroc' } }] })
    }) as unknown as typeof fetch
    const found = await searchServices('Paris', 'consulate')
    expect(overpass).toBe(2)
    expect(found).toMatchObject({ ok: true, results: [expect.objectContaining({ name: 'Consulat général du Maroc' })] })
  })

  it('gives each server a time limit, so a hanging one cannot use up the function', async () => {
    const { searchServices } = await import('@/lib/servicesSearch')
    const signals: Array<AbortSignal | undefined> = []
    global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(input.toString())
      if (url.hostname === 'nominatim.openstreetmap.org') return json([{ lat: '35.17', lon: '-2.93' }])
      signals.push(init?.signal ?? undefined)
      return json({}, 504)
    }) as unknown as typeof fetch
    expect(await searchServices('Nador', 'fuel')).toEqual({ ok: false, reason: 'unavailable' })
    expect(signals).toHaveLength(2)
    expect(signals.every((s) => s instanceof AbortSignal)).toBe(true)
  })
})
