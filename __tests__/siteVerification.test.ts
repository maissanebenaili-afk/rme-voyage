import { googleVerificationToken, siteVerification } from '@/lib/siteVerification';

describe('Google Search Console verification from the environment', () => {
  const token = 'AbC_123-xyzTOKENvalue0987';

  it('accepts the bare token or the whole tag Google displays', () => {
    expect(googleVerificationToken(token)).toBe(token);
    expect(googleVerificationToken(`  ${token}  `)).toBe(token);
    expect(googleVerificationToken(`<meta name="google-site-verification" content="${token}" />`)).toBe(token);
  });

  it('ignores anything that could inject markup or is not a token', () => {
    expect(googleVerificationToken(undefined)).toBeUndefined();
    expect(googleVerificationToken('')).toBeUndefined();
    expect(googleVerificationToken('"><script>alert(1)</script>')).toBeUndefined();
    expect(googleVerificationToken('short')).toBeUndefined();
    expect(googleVerificationToken('has spaces in it here')).toBeUndefined();
  });

  it('adds nothing to the page metadata when the variable is absent', () => {
    expect(siteVerification('')).toBeUndefined();
    expect(siteVerification(token)).toEqual({ google: token });
  });
});
