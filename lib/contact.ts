// Adresse de contact publique (professionnels, presse, données personnelles).
// Les anciennes adresses @rme-voyage.com et @rmevoyage.com pointaient vers des
// domaines non enregistrés : les messages étaient perdus. Tant que
// NEXT_PUBLIC_CONTACT_EMAIL n'est pas configurée, les liens « écrire » sont
// masqués plutôt que de mener nulle part.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const DEAD_DOMAINS = /@(rme-voyage|rmevoyage)\.com$/i;

export function parseContactEmail(raw: string | undefined): string | null {
  const email = raw?.trim();
  if (!email || !EMAIL_PATTERN.test(email) || DEAD_DOMAINS.test(email)) return null;
  return email;
}

export const contactEmail = parseContactEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL);

export function contactMailto(subject?: string): string | null {
  if (!contactEmail) return null;
  return subject ? `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}` : `mailto:${contactEmail}`;
}
