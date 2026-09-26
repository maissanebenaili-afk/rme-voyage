import Link from 'next/link';
import { Mail } from 'lucide-react';

export default function ConfirmPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f1f3d] to-[#1a2f52] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-[#c9903a]/10 rounded-full p-4">
              <Mail className="text-[#c9903a]" size={32} />
            </div>
          </div>

          {/* Message */}
          <h1 className="text-2xl font-black text-[#0f1f3d] mb-2">
            Confirmez votre email
          </h1>
          <p className="text-[#64748b] mb-6">
            Un email de confirmation a été envoyé. Vérifiez votre boîte de réception et cliquez sur le lien pour activer votre compte.
          </p>

          {/* Button */}
          <Link
            href="/"
            className="inline-block bg-[#c9903a] hover:bg-[#a8741e] text-[#0f1f3d] font-bold py-2.5 px-6 rounded-lg transition-all duration-200"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
