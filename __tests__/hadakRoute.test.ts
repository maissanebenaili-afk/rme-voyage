import { POST } from '@/app/api/hadak/route';
import { NextRequest } from 'next/server';

describe('POST /api/hadak', () => {
  const createRequest = (body: Record<string, unknown>): NextRequest =>
    new NextRequest('http://localhost:3000/api/hadak', {
      method: 'POST',
      body: JSON.stringify(body),
    });

  it('returns 400 if message is missing', async () => {
    const req = createRequest({});
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = (await res.json()) as Record<string, string>;
    expect(data.error).toBe('Message required');
  });

  it('returns 503 if API key is not configured', async () => {
    const original = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      const req = createRequest({ message: 'Hello', lang: 'en' });
      const res = await POST(req);
      expect(res.status).toBe(503);
      const data = (await res.json()) as Record<string, boolean>;
      expect(data.fallback).toBe(true);
    } finally {
      if (original) process.env.ANTHROPIC_API_KEY = original;
    }
  });

  it('returns 400 if message is not a string', async () => {
    const req = createRequest({ message: 123 });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 if message is empty', async () => {
    const req = createRequest({ message: '   ' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('uses default lang if not provided', async () => {
    // This test just checks that the route handles missing lang gracefully
    // The actual API call would fail without a key, but we're testing the input handling
    const original = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    try {
      const req = createRequest({ message: 'Test' }); // no lang parameter
      const res = await POST(req);
      expect(res.status).toBe(503); // Still should fail due to missing API key
    } finally {
      if (original) process.env.ANTHROPIC_API_KEY = original;
    }
  });
});
