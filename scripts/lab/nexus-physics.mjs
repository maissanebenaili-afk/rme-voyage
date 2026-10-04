// Model of Netlify Blobs semantics as documented (docs.netlify.com, read 2026-10-04):
//  - "Last write wins ... does not include a concurrency control mechanism"
//  - set(key, value, { onlyIfMatch: etag }) succeeds only if the stored ETag matches (checked at origin)
//  - default eventual consistency: a read may return a value up to 60 s old (modelled as stale reads)
// This is NOT a test of the real service: it shows what these documented rules imply.
let seq = 0;
function makeStore({ staleReadP }) {
  const origin = new Map(); // key -> { value, etag }
  const history = new Map(); // key -> previous versions (for stale reads)
  const delay = () => new Promise((r) => setTimeout(r, Math.random() * 5));
  return {
    origin,
    async get(key) {
      await delay();
      const h = history.get(key) ?? [];
      if (h.length && Math.random() < staleReadP) return h[Math.floor(Math.random() * h.length)];
      return origin.get(key) ?? null;
    },
    async set(key, value, opts = {}) {
      await delay();
      const cur = origin.get(key) ?? null;
      if (opts.onlyIfMatch !== undefined && (!cur || cur.etag !== opts.onlyIfMatch)) return { modified: false };
      if (opts.onlyIfNew && cur) return { modified: false };
      if (cur) history.set(key, [...(history.get(key) ?? []), cur].slice(-20));
      const entry = { value, etag: `e${++seq}` };
      origin.set(key, entry);
      return { modified: true, etag: entry.etag };
    },
    async list(prefix) { await delay(); return [...origin.keys()].filter((k) => k.startsWith(prefix)); },
  };
}

const strategies = {
  // count = read, +1, write: what "count++ in Blobs" means
  async naive(store, i) { const cur = await store.get('c'); await store.set('c', (cur?.value ?? 0) + 1); return 0; },
  // compare-and-swap with ETag, retry on conflict (bounded)
  async cas(store) {
    for (let attempt = 0; attempt < 200; attempt++) {
      const cur = await store.get('c');
      const r = cur ? await store.set('c', cur.value + 1, { onlyIfMatch: cur.etag }) : await store.set('c', 1, { onlyIfNew: true });
      if (r.modified) return attempt;
    }
    throw new Error('gave up');
  },
  // one object per event, count = number of keys (no read-modify-write at all)
  async append(store, i) { await store.set(`ev/${i}-${Math.random().toString(36).slice(2)}`, 1, { onlyIfNew: true }); return 0; },
};

async function run(name, n, staleReadP) {
  const store = makeStore({ staleReadP });
  const retries = await Promise.all(Array.from({ length: n }, (_, i) => strategies[name](store, i).catch(() => -1)));
  const got = name === 'append' ? (await store.list('ev/')).length : store.origin.get('c')?.value ?? 0;
  return { got, gaveUp: retries.filter((r) => r < 0).length, retries: retries.filter((r) => r > 0).reduce((a, b) => a + b, 0) };
}

const REPEATS = 5;
for (const staleReadP of [0, 0.2]) {
  console.log(`\n=== lectures en retard : ${staleReadP * 100} % ===`);
  for (const name of ['naive', 'cas', 'append']) for (const n of [10, 100, 1000]) {
    const rs = [];
    for (let k = 0; k < REPEATS; k++) rs.push(await run(name, n, staleReadP));
    const got = rs.map((r) => r.got);
    console.log(`${name.padEnd(6)} N=${String(n).padEnd(4)} attendu ${n} · obtenu min ${Math.min(...got)} max ${Math.max(...got)} · perdus max ${n - Math.min(...got)} · abandons ${Math.max(...rs.map((r) => r.gaveUp))} · réessais moyens ${Math.round(rs.reduce((a, r) => a + r.retries, 0) / REPEATS)}`);
  }
}
