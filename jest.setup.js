// jest.setup.js
import '@testing-library/jest-dom';

// jsdom does not implement IntersectionObserver, which framer-motion's
// `whileInView` (used by JuryPack) relies on. Minimal no-op mock so
// components mount in tests without crashing.
class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

global.IntersectionObserver = global.IntersectionObserver || MockIntersectionObserver;

// jsdom does not implement matchMedia either; Reveal reads it to honour
// `prefers-reduced-motion`. Report "no preference" so the normal path runs.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent: () => false,
  });
}

// Ensure test runner environment variables (e.g. from CI/runner) do not leak
// into isolated unit tests expecting clean defaults for LLM routing.
for (const key of [
  'AI_ROUTER_FREE_ONLY',
  'GROQ_API_KEY',
  'GEMINI_API_KEY',
  'OPENROUTER_API_KEY',
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
]) {
  delete process.env[key];
}
