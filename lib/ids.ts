/**
 * Identifiers are assigned by the system, not by domain contracts: contracts
 * take an `newId` option so callers and tests can supply their own.
 */
export type IdGenerator = () => string;

export const newId: IdGenerator = () => {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  // jsdom and older WebViews expose getRandomValues without randomUUID.
  if (c && typeof c.getRandomValues === 'function') {
    const b = c.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }
  throw new Error('No secure random source available for ids');
};
