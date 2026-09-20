/** @jest-environment node */

import * as trips from '../app/api/trips/route';
import * as tips from '../app/api/tips/route';

type Handler = () => Response | Promise<Response>;

async function expectUnavailable(handler: Handler, code: string) {
  const response = await handler();
  expect(response.status).toBe(410);
  await expect(response.json()).resolves.toMatchObject({ code });
}

describe('unavailable community APIs', () => {
  it.each<readonly [Handler, string]>([
    [trips.GET, 'TRIPS_AUTH_REQUIRED'],
    [trips.POST, 'TRIPS_AUTH_REQUIRED'],
    [trips.PUT, 'TRIPS_AUTH_REQUIRED'],
    [trips.DELETE, 'TRIPS_AUTH_REQUIRED'],
    [tips.GET, 'COMMUNITY_TIPS_MODERATION_REQUIRED'],
    [tips.POST, 'COMMUNITY_TIPS_MODERATION_REQUIRED'],
  ])('does not expose an unsecured endpoint', async (handler, code) => {
    await expectUnavailable(handler, code);
  });
});
