import { whatsappShareUrl } from '@/components/WhatsAppShare';

describe('whatsappShareUrl', () => {
  it('builds an encoded wa.me link carrying the message and the page URL', () => {
    const url = whatsappShareUrl('Papiers pour le Maroc & enfants :', '/kit-retour');
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    const text = decodeURIComponent(url.slice('https://wa.me/?text='.length));
    expect(text).toMatch(/^Papiers pour le Maroc & enfants : https:\/\/.+\/kit-retour$/);
  });
});
