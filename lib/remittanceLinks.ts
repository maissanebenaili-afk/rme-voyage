// A partner link from the environment is used only if it is a plain https URL on the
// provider's own domain; anything else is ignored rather than shown as an affiliate link.
export function verifiedRemittanceUrl(value: string | undefined, hosts: readonly string[]): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    return hosts.includes(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}
