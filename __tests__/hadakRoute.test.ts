/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '../app/api/hadak/route'
import { resetFootballCacheForTests } from '../lib/hadakFootballCache'
import { resetRouterForTests } from '../lib/hadakAiRouter'

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

// Every case below was answered wrongly in production on 2026-09-26: the first
// matching keyword won even when it was only a place name or a clock word.
describe('POST /api/hadak — subject beats weak keywords', () => {
  const originalFetch = global.fetch
  const originalEnv = process.env
  beforeEach(() => {
    process.env = Object.fromEntries(Object.entries(originalEnv).filter(([k, v]) => !/ANTHROPIC|GROQ|OPENAI/i.test(k) && !v?.startsWith('sk-ant-') && !v?.startsWith('gsk_'))) as NodeJS.ProcessEnv
    global.fetch = jest.fn(async () => {
      throw new Error('offline')
    }) as unknown as typeof fetch
  })
  afterEach(() => {
    global.fetch = originalFetch
    process.env = originalEnv
  })

  async function ask(message: string, lang = 'fr') {
    const response = await post({ message, lang })
    return (await response.json()).response as string
  }

  it.each([
    ['Barcelona contre le Real ce soir, qui va gagner ?', /Football/],
    ['Quelle heure part le ferry de Tarifa ?', /Ferries pour les MRE/],
    ['Quel ferry pour Barcelona ?', /Ferries pour les MRE/],
    ['Quelle heure est-il au Maroc ?', /Il est actuellement/],
    ['Can you tell me what time it is in Morocco?', /Il est actuellement/],
    ['Qui va gagner la CAN 2027 ?', /Football marocain/],
  ])('%s', async (question, expected) => {
    expect(await ask(question)).toMatch(expected)
  })
})

// Production on 2026-09-26: only OPENAI_API_KEY is set, so "Wydad ou Raja ce
// soir ?" got "Mentionne l'équipe pour un pronostic" although both teams were
// named. Without an Anthropic prediction, the question goes to the LLM chain.
describe('POST /api/hadak — football without Anthropic key', () => {
  const originalFetch = global.fetch
  const originalEnv = process.env
  beforeEach(() => {
    resetFootballCacheForTests()
    resetRouterForTests()
  })
  afterEach(() => {
    global.fetch = originalFetch
    process.env = originalEnv
  })

  it('answers a named-team question with the configured LLM', async () => {
    process.env = {
      ...Object.fromEntries(Object.entries(originalEnv).filter(([k, v]) => !/ANTHROPIC|GROQ|OPENAI/i.test(k) && !v?.startsWith('sk-ant-') && !v?.startsWith('gsk_'))),
      OPENAI_API_KEY: 'test-key',
    } as unknown as NodeJS.ProcessEnv
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input.toString())
      if (url.hostname === 'api.openai.com') {
        return new Response(JSON.stringify({ choices: [{ message: { content: 'Match serré, léger avantage au Wydad.' } }] }), { status: 200 })
      }
      throw new Error('offline')
    }) as unknown as typeof fetch

    const response = await post({ message: 'Wydad ou Raja ce soir ?', lang: 'fr' })
    const data = await response.json()
    expect(data.response).toBe('Match serré, léger avantage au Wydad.')
    expect(data.source).toBe('openai')
  })
})
