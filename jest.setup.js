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
