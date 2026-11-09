/** @jest-environment node */
import { readFileSync } from 'fs';
import { resolve } from 'path';
import vm from 'vm';

describe('Offline service worker boundaries', () => {
  let listeners: Record<string, (event: any) => void>;
  let fetchMock: jest.Mock;
  let deleteMock: jest.Mock;
  let putMock: jest.Mock;
  beforeEach(() => {
    listeners = {};
    fetchMock = jest.fn().mockResolvedValue(new Response('asset'));
    deleteMock = jest.fn().mockResolvedValue(true);
    putMock = jest.fn().mockResolvedValue(undefined);
    const context = {
      self: { location: { origin: 'https://rme-voyage.netlify.app' },
        addEventListener: (type: string, fn: any) => { listeners[type] = fn; },
        skipWaiting: jest.fn(), clients: { claim: jest.fn() } },
      caches: { open: jest.fn().mockResolvedValue({ put: putMock, match: jest.fn() }),
        match: jest.fn(), keys: jest.fn().mockResolvedValue(['another-app-v1', 'rme-voyage-v2-api', 'rme-voyage-v3-assets', 'rme-voyage-v5-assets']),
        delete: deleteMock },
      fetch: fetchMock, URL, Response, AbortController, setTimeout, clearTimeout,
    };
    vm.runInNewContext(readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8'), context);
  });
  it('cleans only this app’s obsolete caches', async () => {
    let completion: Promise<void> | undefined;
    listeners.activate({ waitUntil: (p: Promise<void>) => { completion = p; } });
    await completion;
    expect(deleteMock.mock.calls).toEqual([['rme-voyage-v2-api'], ['rme-voyage-v3-assets']]);
  });
  it('keeps the offline page even when an optional icon is missing', async () => {
    fetchMock.mockImplementation((url: string) => url === '/icon-192.svg'
      ? Promise.reject(new Error('missing')) : Promise.resolve(new Response('content')));
    let completion: Promise<void> | undefined;
    listeners.install({ waitUntil: (p: Promise<void>) => { completion = p; } });
    await completion;
    expect(putMock.mock.calls.some(([key]) => key === '/offline.html')).toBe(true);
    expect(fetchMock.mock.calls.some(([key]) => key === '/globals.css')).toBe(false);
  });
  it('keeps the code, images and fonts a precached page needs, so one online visit is enough', async () => {
    const html = '<link rel="stylesheet" href="/_next/static/chunks/a1.css"><script src="/_next/static/chunks/jeu-9x.js"></script>'
      + '<img src="/coloriages/apercu-fanous-1.png"><a href="/coloriages/echantillon.pdf">pdf</a><a href="/api/affiliates.js">x</a><script src="https://ailleurs.example/x.js"></script>';
    fetchMock.mockImplementation((url: string) => Promise.resolve(
      url === '/jeux' ? new Response(html, { headers: { 'content-type': 'text/html' } })
        : url === '/_next/static/chunks/a1.css' ? new Response('@font-face{src:url(/_next/static/media/police.p.woff2)}')
          : new Response('content')));
    let completion: Promise<void> | undefined;
    listeners.install({ waitUntil: (p: Promise<void>) => { completion = p; } });
    await completion;
    const kept = putMock.mock.calls.map(([key]) => key);
    expect(kept).toEqual(expect.arrayContaining([
      '/jeux', '/coloriages', '/kit-retour', '/quand-partir',
      '/_next/static/chunks/a1.css', '/_next/static/chunks/jeu-9x.js',
      '/coloriages/apercu-fanous-1.png', '/coloriages/echantillon.pdf', '/_next/static/media/police.p.woff2',
    ]));
    expect(kept.some((key) => String(key).includes('/api/') || String(key).includes('ailleurs'))).toBe(false);
    expect(kept.filter((key) => key === '/_next/static/chunks/jeu-9x.js')).toHaveLength(1);
  });
  it('reopens a kept page offline even when the link carries a shared date', async () => {
    const matchMock = jest.fn().mockResolvedValue(new Response('page gardée'));
    fetchMock.mockRejectedValue(new Error('offline'));
    const request = { method: 'GET', url: 'https://rme-voyage.netlify.app/quand-partir?jour=2027-07-16', headers: new Headers(), mode: 'navigate' };
    // Recharge le service worker avec un cache qui contient la page.
    const context = {
      self: { location: { origin: 'https://rme-voyage.netlify.app' },
        addEventListener: (type: string, fn: any) => { listeners[type] = fn; }, skipWaiting: jest.fn(), clients: { claim: jest.fn() } },
      caches: { open: jest.fn().mockResolvedValue({ put: putMock, match: matchMock }), match: jest.fn(), keys: jest.fn().mockResolvedValue([]), delete: deleteMock },
      fetch: fetchMock, URL, Response, AbortController, setTimeout, clearTimeout,
    };
    vm.runInNewContext(readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8'), context);
    let response: Promise<Response> | undefined;
    listeners.fetch({ request, respondWith: (p: Promise<Response>) => { response = p; } });
    expect(await (await response!).text()).toBe('page gardée');
    expect(matchMock).toHaveBeenCalledWith(request, { ignoreSearch: true });
  });
  it('does not serve a stale affiliate/API response offline', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    let response: Promise<Response> | undefined;
    listeners.fetch({ request: { method: 'GET', url: 'https://rme-voyage.netlify.app/api/affiliates' },
      respondWith: (p: Promise<Response>) => { response = p; } });
    const result = await response!;
    expect(result.status).toBe(503);
    expect((await result.json()).offline).toBe(true);
    expect(putMock).not.toHaveBeenCalled();
  });
  it('does not substitute cached HTML for Next.js RSC requests', () => {
    const respondWith = jest.fn();
    listeners.fetch({ request: { method: 'GET', url: 'https://rme-voyage.netlify.app/guide?_rsc=xyz',
      headers: new Headers(), mode: 'cors' }, respondWith });
    expect(respondWith).not.toHaveBeenCalled();
  });
});
