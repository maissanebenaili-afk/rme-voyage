import type { Metadata } from 'next';

// Google Search Console "HTML tag" verification, set from the environment so the owner
// never needs a code change: GOOGLE_SITE_VERIFICATION may hold the token itself or the
// whole tag Google shows (<meta name="google-site-verification" content="…" />).
// Anything that is not a plain token is ignored rather than written into the page.
const TOKEN_RE = /^[A-Za-z0-9_-]{10,128}$/;

export function googleVerificationToken(value: string | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  const fromTag = raw.match(/content\s*=\s*["']([^"']+)["']/i)?.[1]?.trim();
  const token = fromTag ?? raw;
  return TOKEN_RE.test(token) ? token : undefined;
}

export function siteVerification(
  value: string | undefined = process.env.GOOGLE_SITE_VERIFICATION,
): Metadata['verification'] {
  const google = googleVerificationToken(value);
  return google ? { google } : undefined;
}
