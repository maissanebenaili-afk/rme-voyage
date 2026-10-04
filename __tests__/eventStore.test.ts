/** @jest-environment node */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { POST } from '../app/api/events/route'
import { eventStoreConfig, storeEvent } from '../lib/eventStore'
import { RME_EVENTS } from '../lib/rmeEvents'

const ENV = { RME_EVENTS_SUPABASE_URL: 'https://abcd.supabase.co', RME_EVENTS_SUPABASE_KEY: 'anon-key' }

describe('event store', () => {
  const originalFetch = global.fetch
  const originalEnv = process.env
  let info: jest.SpyInstance
  let warn: jest.SpyInstance
  beforeEach(() => {
    info = jest.spyOn(console, 'info').mockImplementation(() => {})
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
  })
  afterEach(() => {
    global.fetch = originalFetch
    process.env = originalEnv
    info.mockRestore()
    warn.mockRestore()
  })

  it('does nothing without its own variables (not the sign-in NEXT_PUBLIC_SUPABASE_* ones)', async () => {
    global.fetch = jest.fn() as unknown as typeof fetch
    expect(await storeEvent('page_view', {}, { NEXT_PUBLIC_SUPABASE_URL: 'https://abcd.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'k' })).toBe('not_configured')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('only accepts an https Supabase project URL', () => {
    expect(eventStoreConfig(ENV)?.endpoint).toBe('https://abcd.supabase.co/rest/v1/rme_events')
    expect(eventStoreConfig({ ...ENV, RME_EVENTS_SUPABASE_URL: 'http://abcd.supabase.co' })).toBeNull()
    expect(eventStoreConfig({ ...ENV, RME_EVENTS_SUPABASE_URL: 'https://evil.example/supabase.co' })).toBeNull()
    expect(eventStoreConfig({ ...ENV, RME_EVENTS_SUPABASE_URL: 'https://abcd.supabase.co.evil.example' })).toBeNull()
  })

  it('inserts the cleaned event through the REST API, without reading anything back', async () => {
    const fetchMock = jest.fn(async () => new Response(null, { status: 201 }))
    global.fetch = fetchMock as unknown as typeof fetch
    expect(await storeEvent('partner_click', { partner: 'aviasales', product: 'flight' }, ENV)).toBe('stored')
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://abcd.supabase.co/rest/v1/rme_events')
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).Prefer).toBe('return=minimal')
    expect(JSON.parse(String(init.body))).toEqual({ event: 'partner_click', props: { partner: 'aviasales', product: 'flight' } })
  })

  it('reports a failure but the route still answers 204 and logs the line', async () => {
    process.env = { ...originalEnv, ...ENV }
    global.fetch = jest.fn(async () => { throw new Error('down') }) as unknown as typeof fetch
    const res = await POST(new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({ event: 'partner_click', props: { partner: 'x', email: 'a@b.fr' } }),
    }))
    expect(res.status).toBe(204)
    expect(info).toHaveBeenCalledWith('[rme-event]', JSON.stringify({ partner: 'x', event: 'partner_click' }))
    expect(warn).toHaveBeenCalledWith('[rme-event-store] failed')
  })

  it('stores exactly the cleaned props the log shows (no e-mail reaches the table)', async () => {
    process.env = { ...originalEnv, ...ENV }
    const fetchMock = jest.fn(async () => new Response(null, { status: 201 }))
    global.fetch = fetchMock as unknown as typeof fetch
    await POST(new Request('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({ event: 'route_computed', props: { has_ferry: true, contact: 'a@b.fr' } }),
    }))
    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1]
    expect(JSON.parse(String(init.body)).props).toEqual({ has_ferry: true })
  })

  it('the SQL policy accepts exactly the events the app sends', () => {
    const sql = readFileSync(join(__dirname, '..', 'supabase', 'rme_events.sql'), 'utf8')
    const listed = [...(sql.match(/event in \(([^)]*)\)/)?.[1] ?? '').matchAll(/'([a-z_]+)'/g)].map((m) => m[1])
    expect(listed).toEqual([...RME_EVENTS])
    expect(sql).toMatch(/for insert to anon/)
    expect(sql).not.toMatch(/for (select|update|delete|all)/)
  })
})
