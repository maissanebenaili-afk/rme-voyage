/**
 * Encadré de prévention affiché avec tout lien vers un opérateur de paris.
 * Jusqu'au 2026-10-06, les blocs paris ne disaient que « réservés aux adultes,
 * le jeu comporte des risques » : ni interdiction aux mineurs, ni numéro d'aide,
 * ni moyen de vérifier qu'un opérateur est agréé. Conformité à faire valider par
 * un juriste ; ce texte n'affirme pas l'agrément d'un opérateur.
 */
export default function GamblingNotice({ className = '', paid = false }: { className?: string; paid?: boolean }) {
  return (
    <div className={`rounded-xl border border-white/15 bg-black/20 p-3 text-[11px] leading-5 text-slate-200 ${className}`} data-testid="gambling-notice">
      <p className="font-black text-white">Les jeux d&apos;argent sont interdits aux mineurs.</p>
      <p className="mt-1">
        Jouer comporte des risques : endettement, isolement, dépendance. Pour être aidé, appelez le{' '}
        <a href="tel:0974751313" className="font-bold underline">09 74 75 13 13</a> (appel non surtaxé) ou consultez{' '}
        <a href="https://www.joueurs-info-service.fr/" target="_blank" rel="noopener noreferrer" className="font-bold underline">joueurs-info-service.fr</a>.
      </p>
      <p className="mt-1">
        Avant de jouer, vérifiez que l&apos;opérateur est agréé sur le site de l&apos;
        <a href="https://anj.fr/" target="_blank" rel="noopener noreferrer" className="font-bold underline">Autorité nationale des jeux (ANJ)</a>.
        {paid ? ' Les liens marqués « Partenaire » rapportent une commission à RME.' : ' RME n’a aucun partenariat avec ces opérateurs.'}
      </p>
    </div>
  );
}
