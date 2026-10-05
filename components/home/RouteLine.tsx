import { Car, Plane, Ship } from 'lucide-react';

/**
 * Le trait entre les deux villes : une courbe pointillée qui avance, et les
 * modes du voyage dessous. Décoratif : la distance et les modes réels sont
 * écrits en clair ailleurs.
 */
export default function RouteLine({ mode }: { mode: string }) {
  return (
    <div aria-hidden="true" className="flex min-w-0 flex-col items-center justify-center px-1 text-white/55">
      <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-7 w-full overflow-visible">
        <path d="M2 22 Q50 -6 98 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="rme-route-dash" vectorEffect="non-scaling-stroke" />
        <circle cx="2" cy="22" r="2.6" fill="#ffffff" />
        <circle cx="98" cy="22" r="3.2" fill="#f59e0b" />
      </svg>
      <span className="mt-1 flex items-center gap-1.5">
        {mode === 'flight' ? <Plane size={15} /> : <><Car size={15} />{mode !== 'car' && <Ship size={15} />}</>}
      </span>
    </div>
  );
}
