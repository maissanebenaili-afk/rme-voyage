/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '../app/api/hadak/route'
import { GET as rss } from '../app/rss.xml/route'

// Checked on 2026-10-04: Nador is served by GNV, not Grimaldi; Tarifa → Tanger
// Ville is run by Baleària since FRS left in May 2025; France Diplomatie asks
// for a passport valid for the stay, not "6 months"; the "OFII MRE programme"
// quoted in the RSS feed could not be found anywhere.
async function ask(message: string) {
  global.fetch = jest.fn(async () => {
    throw new Error('no upstream call expected')
  }) as unknown as typeof fetch
  const response = await POST(
    new NextRequest('http://localhost/api/hadak', {
      method: 'POST',
      body: JSON.stringify({ message, lang: 'fr' }),
      headers: { 'content-type': 'application/json' },
    }),
  )
  return ((await response.json()) as { response: string }).response
}

describe('Hadak ferry and documents facts', () => {
  const originalFetch = global.fetch
  afterEach(() => {
    global.fetch = originalFetch
  })

  it('names the operators that actually serve the lines', async () => {
    const text = await ask('Quel ferry pour Nador ?')
    expect(text).not.toMatch(/Grimaldi/)
    expect(text).toMatch(/Almería → Nador/)
    expect(text).toMatch(/Baleària/)
  })

  it('asks for a passport valid for the stay, not six months', async () => {
    const text = await ask('Quels documents pour entrer au Maroc ?')
    expect(text).not.toMatch(/6 mois/)
    expect(text).toMatch(/toute la durée du séjour/)
  })

  it('RSS feed no longer quotes the six-month rule or an OFII programme', async () => {
    const xml = await rss(new Request('http://localhost/rss.xml')).text()
    expect(xml).not.toMatch(/6 mois|OFII/)
  })
})
