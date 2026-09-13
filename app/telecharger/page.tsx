import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Download } from 'lucide-react';

export const metadata = {
  title: 'Télécharger RME Voyage',
  description: 'Téléchargez l’application RME Voyage.',
};

function getDownloadUrl() {
  const value = process.env.NEXT_PUBLIC_APP_DOWNLOAD_URL;
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function DownloadPage() {
  const downloadUrl = getDownloadUrl();
  if (downloadUrl) redirect(downloadUrl);

  return (
    <main id="main-content" tabIndex={-1} className="relative grid min-h-screen place-items-center overflow-hidden bg-[#0d3f38] px-5 text-white">
      <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-96 w-96 rounded-full bg-[#eead59]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-36 left-1/4 -z-10 h-72 w-72 rounded-full bg-[#4cc3ac]/15 blur-3xl" />

      <section className="animate-scale-in max-w-lg rounded-[2rem] border border-white/10 bg-[#153f39] p-8 text-center shadow-2xl sm:p-10">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#eead59] text-[#0d3f38]">
          <Download size={26} />
        </span>
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.18em] text-[#f5cd93]">RME Voyage</p>
        <h1 className="mt-3 font-display text-3xl font-semibold">L&apos;application arrive bientôt</h1>
        <p className="mt-4 leading-7 text-white/75">
          Le lien de téléchargement est en cours de publication. Revenez dans quelques instants.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex rounded-full bg-[#eead59] px-5 py-3 font-bold text-[#0d3f38] shadow-gold transition hover:bg-[#f5cd93]"
        >
          Préparer mon voyage sur le web
        </Link>
      </section>
    </main>
  );
}
