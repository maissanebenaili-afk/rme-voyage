// First-party, anonymous usage events (replaces Vercel Analytics, which does
// nothing off Vercel). Shared by the client sender (lib/partnerTracking.ts) and
// the server route (app/api/events/route.ts): only these names are accepted,
// and props are cleaned so no personal data can reach the logs.
export const RME_EVENTS = [
  'partner_click',
  'route_computed',
  'reality_check_used',
  'reality_check_cta',
  'remittance_result_viewed',
  'hadak_next_action',
  'hadak_trust_why',
  'hadak_voice_listen',
  'hadak_voice_input',
] as const;

export type RmeEventName = (typeof RME_EVENTS)[number];
export type RmeEventProps = Record<string, string | number | boolean>;

const MAX_PROPS = 12;
const MAX_STRING = 64;
const KEY_RE = /^[a-z_]{1,32}$/;
// An @ (e-mail) or a long digit run (phone, card, postcode + number) is dropped.
const PERSONAL_RE = /@|\d{5,}/;

export function isRmeEvent(name: unknown): name is RmeEventName {
  return typeof name === 'string' && (RME_EVENTS as readonly string[]).includes(name);
}

export function cleanEventProps(input: unknown): RmeEventProps {
  const out: RmeEventProps = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return out;
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (Object.keys(out).length >= MAX_PROPS) break;
    if (!KEY_RE.test(key)) continue;
    if (typeof value === 'boolean') out[key] = value;
    else if (typeof value === 'number' && Number.isFinite(value)) out[key] = value;
    else if (typeof value === 'string' && !PERSONAL_RE.test(value)) out[key] = value.slice(0, MAX_STRING);
  }
  return out;
}
