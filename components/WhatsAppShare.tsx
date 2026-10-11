import { MessageCircle } from 'lucide-react';
import { siteUrl } from '@/lib/siteUrl';

// Lien wa.me simple : marche sans JavaScript et sur tous les téléphones.
// Les familles MRE se transmettent ce genre de liste par WhatsApp.
export function whatsappShareUrl(message: string, path: string): string {
  return `https://wa.me/?text=${encodeURIComponent(`${message} ${siteUrl}${path}`)}`;
}

export default function WhatsAppShare({ message, path }: { message: string; path: string }) {
  return (
    <a
      href={whatsappShareUrl(message, path)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-xl bg-[#14532d] px-4 py-3 text-base font-bold text-white print:hidden"
    >
      <MessageCircle size={18} /> Envoyer à la famille sur WhatsApp
    </a>
  );
}
