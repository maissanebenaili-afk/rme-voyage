/** @jest-environment node */

const mockCreate = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: { sessions: { create: mockCreate } },
  }));
});

function buildRequest(body: unknown) {
  return new Request('http://localhost:3000/api/support/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any;
}

describe('/api/support/checkout', () => {
  const saved = { ...process.env };

  beforeEach(() => {
    mockCreate.mockReset();
    jest.resetModules();
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  it('returns 503 with configured:false when Stripe is not set up', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { POST } = await import('../app/api/support/checkout/route');

    const res = await POST(buildRequest({ amountEur: 10 }));
    const data = await res.json();

    expect(res.status).toBe(503);
    expect(data.configured).toBe(false);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('rejects an amount below the 1€ minimum', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    const { POST } = await import('../app/api/support/checkout/route');

    const res = await POST(buildRequest({ amountEur: 0.5 }));
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('rejects an amount above the 1000€ cap', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    const { POST } = await import('../app/api/support/checkout/route');

    const res = await POST(buildRequest({ amountEur: 5000 }));
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('rejects a non-numeric amount', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    const { POST } = await import('../app/api/support/checkout/route');

    const res = await POST(buildRequest({ amountEur: 'ten' }));
    expect(res.status).toBe(400);
  });

  it('creates a real payment-mode Checkout Session for a valid amount and returns its URL', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    mockCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session_abc' });
    const { POST } = await import('../app/api/support/checkout/route');

    const res = await POST(buildRequest({ amountEur: 15 }));
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.url).toBe('https://checkout.stripe.com/session_abc');
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const args = mockCreate.mock.calls[0][0];
    expect(args.mode).toBe('payment');
    expect(args.line_items[0].price_data.unit_amount).toBe(1500);
    expect(args.line_items[0].price_data.currency).toBe('eur');
  });

  it('returns 502 when Stripe itself errors', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    mockCreate.mockRejectedValue(new Error('stripe down'));
    const { POST } = await import('../app/api/support/checkout/route');

    const res = await POST(buildRequest({ amountEur: 15 }));
    expect(res.status).toBe(502);
  });
});
