import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#fdf8f2] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="grid h-16 w-16 mx-auto place-items-center rounded-3xl bg-[#fee2e2] mb-6">
          <AlertCircle className="text-[#dc2626]" size={32} />
        </div>
        <h1 className="text-2xl font-black text-[#0f1f3d] mb-2">Propriété non trouvée</h1>
        <p className="text-[#64748b] mb-6">
          La propriété que vous cherchez n'existe pas ou a été supprimée.
        </p>
        <Link
          href="/taza-immobilier"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#c9903a] px-6 py-3 text-sm font-extrabold text-[#0f1f3d] hover:bg-[#a8741e] transition"
        >
          <ArrowLeft size={14} /> Retourner au catalogue
        </Link>
      </div>
    </main>
  );
}
