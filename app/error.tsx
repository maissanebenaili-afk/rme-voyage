'use client';

import Link from 'next/link';
import { useEffect } from 'react';

/**
 * Filet de sécurité : si une page plante côté navigateur, le voyageur ne voit
 * plus le message brut de Next (« This page couldn't load »). On retente une
 * fois tout seul, après un court délai (une panne passagère passe alors
 * inaperçue), puis on propose un bouton clair en français.
 */
const AUTO_RETRY_DELAY_MS = 600;

// Au niveau du module, pas dans le composant : si la page replante après la
// nouvelle tentative, ce composant est recréé et un garde interne serait remis
// à zéro (boucle sans fin). Ici, une seule relance automatique par chargement.
let autoRetried = false;

export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // Aucune donnée perso : seulement l'erreur technique, pour les journaux du navigateur.
    console.error(error);
    if (autoRetried) return;
    const timer = setTimeout(() => {
      autoRetried = true; // consommé seulement si la relance part vraiment
      retry();
    }, AUTO_RETRY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [error, retry]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-5 text-center">
      <h1 className="text-2xl font-extrabold text-[#0f1f3d]">Un petit souci d&apos;affichage</h1>
      <p role="alert" className="text-base text-slate-700">
        La page n&apos;a pas pu s&apos;afficher correctement. Vos informations ne sont pas perdues : réessayez.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="min-h-12 rounded-2xl bg-[#0f1f3d] px-6 text-base font-extrabold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59e0b]"
      >
        Réessayer
      </button>
      <Link href="/" className="text-sm font-bold text-[#0f1f3d] underline">Retour à l&apos;accueil</Link>
    </main>
  );
}
