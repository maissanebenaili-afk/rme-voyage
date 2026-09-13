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
      self: { location: { origin: 'https://rme-route.vercel.app' },
        addEventListener: (type: string, fn: any) => { listeners[type] = fn; },
        skipWaiting: jest.fn(), clients: { claim: jest.fn() } },
      caches: { open: jest.fn().mockResolvedValue({ put: putMock, match: jest.fn() }),
        match: jest.fn(), keys: jest.fn().mockResolvedValue(['another-app-v1', 'rme-voyage-v2-api', 'rme-voyage-v3-assets']),
        delete: deleteMock },
      fetch: fetchMock, URL, Response, AbortController, setTimeout, clearTimeout,
    };
    vm.runInNewContext(readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8'), context);
  });
  it('cleans only this app’s obsolete caches', async () => {
    let completion: Promise<void> | undefined;
    listeners.activate({ waitUntil: (p: Promise<void>) => { completion = p; } });
    await completion;
    expect(deleteMock.mock.calls).toEqual([['rme-voyage-v2-api']]);
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
  it('does not serve a stale affiliate/API response offline', async () => {
    fetchMock.mockRejectedValue(new Error('offline'));
    let response: Promise<Response> | undefined;
    listeners.fetch({ request: { method: 'GET', url: 'https://rme-route.vercel.app/api/affiliates' },
      respondWith: (p: Promise<Response>) => { response = p; } });
    const result = await response!;
    expect(result.status).toBe(503);
    expect((await result.json()).offline).toBe(true);
    expect(putMock).not.toHaveBeenCalled();
  });
  it('does not substitute cached HTML for Next.js RSC requests', () => {
    const respondWith = jest.fn();
    listeners.fetch({ request: { method: 'GET', url: 'https://rme-route.vercel.app/guide?_rsc=xyz',
      headers: new Headers(), mode: 'cors' }, respondWith });
    expect(respondWith).not.toHaveBeenCalled();
  });
});
