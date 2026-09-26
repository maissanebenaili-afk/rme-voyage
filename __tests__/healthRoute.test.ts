/** @jest-environment node */
import { GET } from '../app/api/health/route'

describe('GET /api/health', () => {
  it('never advertises the removed /api/chat endpoint', async () => {
    const response = await GET()
    const body = await response.json()
    expect(body.endpoints).not.toHaveProperty('chat')
    expect(JSON.stringify(body)).not.toContain('/api/chat')
  })
  it('returns only aggregate provider state and no secret material', async () => {
    const previous = process.env;
    process.env = { ...previous, GROQ_API_KEY: 'SECRET_GROQ', OPENAI_API_KEY: 'SECRET_OPENAI', ANTHROPIC_API_KEY: 'SECRET_ANTHROPIC', AI_ROUTER_FREE_ONLY: 'true' };
    try {
      const response = await GET();
      const body = await response.json();
      const serialized = JSON.stringify(body);
      expect(serialized).not.toContain('SECRET_GROQ');
      expect(serialized).not.toContain('SECRET_OPENAI');
      expect(serialized).not.toContain('SECRET_ANTHROPIC');
      expect(body).not.toHaveProperty('endpoints');
      expect(body.ai_router.providers.groq).toHaveProperty('state');
      expect(body.ai_router.providers.groq).not.toHaveProperty('key');
    } finally {
      process.env = previous;
    }
  });
})
