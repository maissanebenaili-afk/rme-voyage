/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '../app/api/hadak/route'

async function ask(message: string, lang: string) {
  const res = await POST(new NextRequest('http://localhost/api/hadak', {
    method: 'POST',
    body: JSON.stringify({ message, lang }),
    headers: { 'content-type': 'application/json' },
  }))
  return (await res.json()).response as string
}

describe('Hadak SIM answer', () => {
  const originalFetch = global.fetch
  beforeEach(() => {
    global.fetch = jest.fn(async () => { throw new Error('offline') }) as unknown as typeof fetch
  })
  afterEach(() => { global.fetch = originalFetch })

  it.each(['fr', 'es', 'da', 'ar'])('gives operators and the ID rule, never an invented price or nationwide 4G (%s)', async (lang) => {
    const answer = await ask('Quelle carte SIM acheter au Maroc ?', lang)
    expect(answer).toMatch(/Maroc Telecom|اتصالات المغرب/)
    expect(answer).toMatch(/2014/)
    expect(answer).not.toMatch(/10-20|4G dans tout|tout le pays|por todo el país|في كل مكان|f kull blad/)
  })
})
