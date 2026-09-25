/** @jest-environment node */
import { GET } from '../app/api/health/route'

describe('GET /api/health', () => {
  it('never advertises the removed /api/chat endpoint', async () => {
    const response = await GET()
    const body = await response.json()
    expect(body.endpoints).not.toHaveProperty('chat')
    expect(JSON.stringify(body)).not.toContain('/api/chat')
  })
})
