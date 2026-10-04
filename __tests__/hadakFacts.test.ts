/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '../app/api/hadak/route'

// Production on 2026-10-04: customs questions went to an AI that gave MRE the
// 2 000 DH gift limit (theirs is 20 000 DH) and "6 L de vin"; the local fuel
// answer said diesel 11-12 MAD/L while the press reported it above 16 DH/L.
async function ask(message: string, lang = 'fr') {
  global.fetch = jest.fn(async () => {
    throw new Error('no upstream call expected')
  }) as unknown as typeof fetch
  const response = await POST(
    new NextRequest('http://localhost/api/hadak', {
      method: 'POST',
      body: JSON.stringify({ message, lang }),
      headers: { 'content-type': 'application/json' },
    }),
  )
  return (await response.json()) as { response: string; source?: string }
}

describe('Hadak — customs and fuel facts', () => {
  const originalFetch = global.fetch
  afterEach(() => {
    global.fetch = originalFetch
  })

  it.each([
    'Quelle franchise douane au Maroc ?',
    "Combien d'argent liquide je peux passer à la douane ?",
    'Moroccan customs allowance?',
  ])('answers "%s" locally with the MRE gift limit, never an AI guess', async (message) => {
    const data = await ask(message)
    expect(data.source).toBe('local')
    expect(data.response).toMatch(/20[  ,]000/)
    expect(data.response).toMatch(/100[  ,]000/)
    expect(data.response).not.toMatch(/2000 ?€|€ ?2000|6 L de vin/)
  })

  it('no longer gives the stale 11-12 MAD diesel price, and dates the figure it gives', async () => {
    const { response } = await ask('Prix du gasoil au Maroc ?')
    expect(response).not.toMatch(/11-12/)
    expect(response).toMatch(/1er octobre 2026/)
  })

  it('still sends a currency question without customs words to the exchange answer', async () => {
    const { response } = await ask('Combien vaut 100 euros en dirhams ?')
    expect(response).toMatch(/Taux de change/)
  })
})
