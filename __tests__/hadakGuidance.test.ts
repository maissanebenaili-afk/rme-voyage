/** @jest-environment node */
import { NextRequest } from 'next/server'
import { POST } from '../app/api/hadak/route'
import { describeProvenance, nextActionsFor, provenanceOf } from '../lib/hadakGuidance'

function post(body: unknown) {
  return POST(new NextRequest('http://localhost/api/hadak', {
    method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' },
  }))
}

describe('provenanceOf', () => {
  it('never labels an AI answer as measured, even with live context', () => {
    expect(provenanceOf({ live: ['TheSportsDB'], liveOnly: true, ai: true })).toEqual({ level: 'INFERRED', basis: 'AI', sources: ['TheSportsDB'] })
  })
  it('labels live-only answers as measured, and mixed ones as RME guide', () => {
    expect(provenanceOf({ live: ['Open-Meteo'], liveOnly: true }).level).toBe('MEASURED')
    expect(provenanceOf({ live: ['Open-Meteo', 'AlAdhan'], liveOnly: false })).toEqual({ level: 'INFERRED', basis: 'RME_GUIDE', sources: ['Open-Meteo', 'AlAdhan'] })
    expect(provenanceOf({ live: [], liveOnly: true }).basis).toBe('RME_GUIDE')
  })
  it('names the sources in the "why" text', () => {
    expect(describeProvenance({ level: 'MEASURED', basis: 'LIVE_DATA', sources: ['Open-Meteo'] }, 'en').why).toContain('Sources: Open-Meteo.')
  })
})

describe('nextActionsFor', () => {
  it('proposes at most three informational in-app sections', () => {
    const actions = nextActionsFor('trip', 'fr')
    expect(actions.length).toBeGreaterThan(0)
    expect(actions.length).toBeLessThanOrEqual(3)
    for (const a of actions) {
      expect(a.safety).toBe('INFORMATIONAL')
      expect(a.destination).toMatch(/^\/#[a-z-]+$/)
      expect(a.reason.trim()).not.toBe('')
    }
  })
  it('proposes nothing for the clock, school work or unknown questions', () => {
    expect(nextActionsFor('time')).toEqual([])
    expect(nextActionsFor('education')).toEqual([])
    expect(nextActionsFor('constructor')).toEqual([])
  })
})

describe('POST /api/hadak — trust and next actions', () => {
  const originalFetch = global.fetch
  afterEach(() => { global.fetch = originalFetch })

  it('marks live prayer times as measured from AlAdhan', async () => {
    global.fetch = jest.fn(async () => new Response(
      JSON.stringify({ data: { timings: { Fajr: '05:30', Dhuhr: '13:10', Asr: '16:20', Maghrib: '18:45', Isha: '20:05' } } }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )) as unknown as typeof fetch
    const data = await (await post({ message: 'horaires de prière à Fès', lang: 'fr' })).json()
    expect(data.trust).toEqual({ level: 'MEASURED', basis: 'LIVE_DATA', sources: ['AlAdhan'] })
    expect(data.next_actions.map((a: { destination: string }) => a.destination)).toEqual(['/#maroc'])
  })

  it('marks written ferry guidance as RME guide, not official', async () => {
    global.fetch = jest.fn() as unknown as typeof fetch
    const data = await (await post({ message: 'quel ferry pour rentrer au Maroc', lang: 'fr' })).json()
    expect(data.trust.level).toBe('INFERRED')
    expect(data.trust.basis).toBe('RME_GUIDE')
    expect(data.next_actions[0].destination).toBe('/#route')
  })

  it('logs the intent and its resolution, never the question', async () => {
    const info = jest.spyOn(console, 'info').mockImplementation(() => {})
    await post({ message: 'quel ferry pour rentrer au Maroc', lang: 'fr' })
    const line = info.mock.calls.map(c => String(c[0])).find(l => l.startsWith('[hadak-intent]'))
    info.mockRestore()
    expect(JSON.parse(line!.slice('[hadak-intent] '.length))).toEqual({ intent: 'ferry', resolution: 'LOCAL', basis: 'RME_GUIDE', next_actions: 2 })
    expect(line).not.toContain('rentrer')
  })

  it('marks the clock answer as measured with no suggestion', async () => {
    const data = await (await post({ message: 'quelle heure est-il', lang: 'fr' })).json()
    expect(data.trust.basis).toBe('CLOCK')
    expect(data.next_actions).toEqual([])
  })
})
