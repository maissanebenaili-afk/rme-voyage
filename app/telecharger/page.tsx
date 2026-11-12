import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Download,
  Share,
  PlusSquare,
  MoreVertical,
  WifiOff,
  Gamepad2,
  ShieldCheck,
  Compass,
  ArrowLeft,
  Smartphone,
  CheckCircle,
} from 'lucide-react';
import MoroccoFlag from '@/components/MoroccoFlag';
import InstallPwaButton from '@/components/InstallPwaButton';

export const metadata: Metadata = {
  title: 'Installer l’application RME Voyage',
  description:
    'Installez gratuitement RME Voyage sur votre smartphone ou tablette (iPhone, iPad, Android). Fonctionne 100% hors ligne en voyage, sans pub et sans compte.',
  alternates: { canonical: '/telecharger' },
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
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#0f1f3d] text-white">
      {/* En-tête */}
      <header className="border-b border-white/10 px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white">
            <ArrowLeft size={18} />
            <span>Retour à l&apos;accueil</span>
          </Link>
          <div className="flex items-center gap-2 font-black">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#f59e0b] text-xs text-[#0f1f3d]">R</span>
            <span className="text-sm">RME Voyage</span>
            <MoroccoFlag className="h-3.5 w-5" />
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative isolate overflow-hidden px-5 pb-16 pt-12 sm:px-8 sm:pt-16">
        <div className="pointer-events-none absolute -right-20 -top-24 -z-10 h-96 w-96 rounded-full bg-[#f59e0b]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 left-1/4 -z-10 h-72 w-72 rounded-full bg-[#10b981]/15 blur-3xl" />

        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#f59e0b] text-[#0f1f3d] shadow-lg">
            <Download size={32} />
          </div>
          <span className="mt-5 inline-block text-xs font-black uppercase tracking-[0.2em] text-[#fcd34d]">
            Application Web Progressive (PWA)
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
            Emportez RME Voyage partout avec vous
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
            Installez l&apos;application directement sur votre téléphone ou tablette en 5 secondes. Accessible en plein écran et utilisable hors ligne même au milieu du détroit !
          </p>

          <div className="mt-8">
            <InstallPwaButton />
          </div>
        </div>
      </section>

      {/* Guide d'installation pas-à-pas */}
      <section className="bg-[#172b52] px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
            Comment installer l&apos;application sur votre appareil ?
          </h2>
          <p className="mt-2 text-center text-sm text-white/70">
            Aucun téléchargement lourd depuis un store n&apos;est nécessaire. C&apos;est instantané, sécurisé et gratuit.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {/* iPhone / iPad (Safari) */}
            <div className="rounded-3xl border border-white/10 bg-[#0f1f3d] p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-xl font-bold">🍏</span>
                <div>
                  <h3 className="text-lg font-black text-white">Sur iPhone & iPad</h3>
                  <p className="text-xs text-white/60">Avec Safari</p>
                </div>
              </div>

              <ol className="mt-6 space-y-4 text-sm text-white/85">
                <li className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-400 font-bold text-[#0f1f3d]">1</span>
                  <div>
                    Appuyez sur le bouton de <strong>Partage</strong>{' '}
                    <Share size={16} className="inline align-text-bottom text-[#fcd34d]" /> en bas de l&apos;écran de Safari.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-400 font-bold text-[#0f1f3d]">2</span>
                  <div>
                    Faites défiler le menu vers le bas et touchez <strong>« Sur l&apos;écran d&apos;accueil »</strong>{' '}
                    <PlusSquare size={16} className="inline align-text-bottom text-[#fcd34d]" />.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-400 font-bold text-[#0f1f3d]">3</span>
                  <div>
                    Touchez <strong>« Ajouter »</strong> en haut à droite. L&apos;icône <strong>RME Voyage</strong> apparaît immédiatement sur votre écran d&apos;accueil !
                  </div>
                </li>
              </ol>
            </div>

            {/* Android / Chrome */}
            <div className="rounded-3xl border border-white/10 bg-[#0f1f3d] p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-xl font-bold">🤖</span>
                <div>
                  <h3 className="text-lg font-black text-white">Sur Android</h3>
                  <p className="text-xs text-white/60">Avec Chrome ou Samsung Internet</p>
                </div>
              </div>

              <ol className="mt-6 space-y-4 text-sm text-white/85">
                <li className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-400 font-bold text-[#0f1f3d]">1</span>
                  <div>
                    Touchez le menu <strong>trois points</strong>{' '}
                    <MoreVertical size={16} className="inline align-text-bottom text-[#fcd34d]" /> en haut à droite du navigateur.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-400 font-bold text-[#0f1f3d]">2</span>
                  <div>
                    Sélectionnez <strong>« Installer l&apos;application »</strong> ou <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong>.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-amber-400 font-bold text-[#0f1f3d]">3</span>
                  <div>
                    Confirmez l&apos;installation. L&apos;application est prête et accessible comme n&apos;importe quelle appli native !
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages de l'application */}
      <section className="px-5 py-14 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center font-display text-2xl font-bold sm:text-3xl">
            Pourquoi installer RME Voyage ?
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <WifiOff size={28} className="text-[#f59e0b]" />
              <h3 className="mt-3 font-bold text-white">Mode 100% Hors-ligne</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Consultez vos trajets, documents de douane, modèles de procuration et fiches pratiques sans réseau mobile.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Gamepad2 size={28} className="text-[#f59e0b]" />
              <h3 className="mt-3 font-bold text-white">Jeux pour la route</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Quiz, Zellige, Mémoire des souks et Skate pour occuper les enfants en voiture et sur le bateau.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <Compass size={28} className="text-[#f59e0b]" />
              <h3 className="mt-3 font-bold text-white">Outils du quotidien</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Horaires de prière, boussole Qibla, convertisseur dirham, comparateur de transfert et prix du carburant.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <ShieldCheck size={28} className="text-[#f59e0b]" />
              <h3 className="mt-3 font-bold text-white">Sans pub & respectueux</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/70">
                Aucun compte obligatoire, pas de traçage publicitaire, respect total de votre vie privée.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#f59e0b] px-8 text-base font-extrabold text-[#0f1f3d] shadow-gold transition hover:bg-[#fcd34d]"
            >
              Ouvrir l&apos;application maintenant
            </Link>
          </div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/60">
        <p>© 2026 RME Voyage — Compagnon de route des Marocains du monde</p>
      </footer>
    </main>
  );
}
