// Use the verified public application, not an unconfigured vanity domain.
// Set NEXT_PUBLIC_APP_URL only after verifying ownership and HTTPS routing.
export const siteUrl = (() => {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://rme-route.vercel.app');
    if (url.protocol === 'https:' && !url.username && !url.password) return url.origin;
  } catch { /* fall through to the verified production origin */ }
  return 'https://rme-route.vercel.app';
})();
