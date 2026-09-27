// Netlify-native rate limit for /api/hadak (the in-memory counter in proxy.ts
// does not hold across Netlify executions). This function only passes the
// request on; Netlify enforces the rule at its edge and answers 429 above
// 8 requests per 60 s per client IP, with up to ~10 s of enforcement delay.
// Free plan: 2 code-based rules per project (this one and its sibling).
// Deno edge runtime: types kept inline so the repo needs no extra package.
type Context = { next: () => Promise<Response> };

const passThrough = async (_request: Request, context: Context) => context.next();

export default passThrough;

export const config = {
  path: "/api/hadak",
  rateLimit: {
    windowLimit: 8,
    windowSize: 60,
    aggregateBy: ["ip", "domain"],
  },
};
