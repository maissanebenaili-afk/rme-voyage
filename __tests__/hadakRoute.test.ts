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
