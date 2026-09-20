export const MARWA_WHATSAPP = '33782722869';

export function whatsappLink(phone: string, message: string) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// Belisamae — Mounia, énergéticienne (Reiki, géobiologie).
export const BELISAMAE_URL = 'https://www.belisamae.fr';
export const BELISAMAE_PHONE = '+33686628361';

// Recherche Amazon.fr par titre + auteur : fonctionne sans ASIN.
// Remplacer par https://www.amazon.fr/dp/<ASIN> dès que l'ASIN FR est connu.
export const BOOK_URL =
  'https://www.amazon.fr/s?k=L%27%C3%89quation+du+D%C3%A9sir+Les+Nombres+Interdits+Tarek+Benaili';
