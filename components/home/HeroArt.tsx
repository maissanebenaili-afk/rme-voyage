/**
 * Décor du haut de l'accueil, purement visuel (aria-hidden) : ciel étoilé
 * d'un départ de nuit, lueur du lever de soleil côté Maroc, et une étoile de
 * zellige à huit branches qui tourne très lentement (arrêtée si l'appareil
 * demande moins d'animations).
 */
export default function HeroArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="rme-hero-stars absolute inset-0" />
      <svg viewBox="-100 -100 200 200" className="rme-zellige absolute -right-28 -top-24 h-[22rem] w-[22rem] text-white/[.07] sm:-right-16 sm:h-[30rem] sm:w-[30rem]">
        <g fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="-62" y="-62" width="124" height="124" />
          <rect x="-62" y="-62" width="124" height="124" transform="rotate(45)" />
          <rect x="-40" y="-40" width="80" height="80" />
          <rect x="-40" y="-40" width="80" height="80" transform="rotate(45)" />
          <circle r="22" />
          <circle r="88" />
        </g>
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#f59e0b]/40 to-transparent" />
    </div>
  );
}
