/** @jest-environment node */
// Audit « red team » du 2026-10-10 : chaque test rejoue une entrée hostile
// envoyée à une route publique et vérifie que la route tient.
import { NextRequest } from 'next/server'
import { POST as hadakPost } from '../app/api/hadak/route'
import { GET as remittanceGet } from '../app/api/remittance/route'
import { GET as routeGet } from '../app/api/route/route'
import { GET as servicesGet } from '../app/api/services/route'
import { geocodePlace } from '../lib/serverGeocode'
import { resetRouterForTests } from '../lib/hadakAiRouter'

const originalFetch = global.fetch
afterEach(() => {
  global.fetch = originalFetch
})

function failingFetch() {
  return jest.fn(async () => {
    throw new Error('offline')
  }) as unknown as typeof fetch
}

describe('Hadak : langue piégée', () => {
  beforeEach(() => resetRouterForTests())

  it.each(['constructor', '__proto__', 'toString'])(
    'renvoie toujours un texte quand lang vaut « %s » et que l’IA est injoignable',
    async (lang) => {
      global.fetch = failingFetch()
      const response = await hadakPost(
        new NextRequest('http://localhost/api/hadak', {
          method: 'POST',
          body: JSON.stringify({ message: 'zzqx blorp vrrk', lang }),
          headers: { 'content-type': 'application/json' },
        }),
      )
      const body = await response.json()
      expect(typeof body.response).toBe('string')
      expect(body.response.length).toBeGreaterThan(0)
    },
  )
})

describe('Géocodage : texte géant', () => {
  it('refuse un nom de lieu démesuré sans appeler Nominatim', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    await expect(geocodePlace('Paris '.repeat(2_000))).resolves.toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('/api/route répond 400 à un départ démesuré, sans appel externe', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    const long = encodeURIComponent('a'.repeat(5_000))
    const response = await routeGet(new Request(`http://localhost/api/route?origin=${long}&destination=Nador`))
    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('/api/services répond 400 à un lieu démesuré, sans appel externe', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    const long = encodeURIComponent('a'.repeat(5_000))
    const response = await servicesGet(new Request(`http://localhost/api/services?place=${long}&category=fuel`))
    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('Transfert d’argent : devise piégée', () => {
  it.each(['../../evil', 'eur.json?x=', 'EURO', '€€€'])(
    'refuse la devise « %s » sans appel externe',
    async (from) => {
      const fetchMock = jest.fn()
      global.fetch = fetchMock as unknown as typeof fetch
      const url = `http://localhost/api/remittance?amount=100&from=${encodeURIComponent(from)}&to=MAD`
      const response = await remittanceGet(new NextRequest(url))
      expect(response.status).toBe(400)
      expect(fetchMock).not.toHaveBeenCalled()
    },
  )

  it('refuse un montant suivi de lettres (« 500abc »)', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    const response = await remittanceGet(new NextRequest('http://localhost/api/remittance?amount=500abc'))
    expect(response.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
