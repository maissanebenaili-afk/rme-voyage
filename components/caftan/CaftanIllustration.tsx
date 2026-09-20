import type { Caftan, CaftanView, Motif } from '@/lib/caftans';
import { CANVAS, SILHOUETTES, bodyPath, capePath, deriveTones, folds } from '@/lib/caftanArt';

export type Variant = 'thumb' | 'card' | 'full';

type Props = {
  caftan: Caftan;
  view?: CaftanView;
  variant?: Variant;
  className?: string;
};

const VIEWBOX: Record<CaftanView, string> = {
  face: `0 0 ${CANVAS.w} ${CANVAS.h}`,
  dos: `0 0 ${CANVAS.w} ${CANVAS.h}`,
  // Pas un nouveau dessin : le même espace de coordonnées, cadré sur le plastron.
  detail: '132 132 150 150',
};

const VIEW_LABEL: Record<CaftanView, string> = {
  face: 'vue de face',
  dos: 'vue de dos',
  detail: 'détail de la broderie',
};

function MotifTile({ id, motif, accent }: { id: string; motif: Motif; accent: string }) {
  const common = { fill: 'none', stroke: accent, strokeWidth: 1.1, strokeOpacity: 0.85 };
  return (
    <pattern id={id} width="22" height="22" patternUnits="userSpaceOnUse">
      {motif === 'zellige' && (
        <>
          <path d="M11 2 L20 11 L11 20 L2 11 Z" {...common} />
          <path d="M11 5.5 L16.5 11 L11 16.5 L5.5 11 Z" {...common} strokeOpacity={0.5} />
          <circle cx="11" cy="11" r="1.4" fill={accent} fillOpacity={0.8} stroke="none" />
        </>
      )}
      {motif === 'floral' && (
        <>
          <path d="M11 4 C14 7 14 9 11 11 C8 9 8 7 11 4 Z" {...common} />
          <path d="M11 18 C8 15 8 13 11 11 C14 13 14 15 11 18 Z" {...common} />
          <path d="M4 11 C7 8 9 8 11 11 C9 14 7 14 4 11 Z" {...common} strokeOpacity={0.5} />
          <path d="M18 11 C15 14 13 14 11 11 C13 8 15 8 18 11 Z" {...common} strokeOpacity={0.5} />
        </>
      )}
      {motif === 'sfifa' && (
        <>
          <path d="M0 7 Q5.5 2 11 7 T22 7" {...common} />
          <path d="M0 15 Q5.5 10 11 15 T22 15" {...common} strokeOpacity={0.5} />
        </>
      )}
    </pattern>
  );
}

export default function CaftanIllustration({
  caftan,
  view = 'face',
  variant = 'card',
  className = '',
}: Props) {
  // Les id de <defs> sont globaux au document : sans préfixe, les 12 cartes
  // partageraient le dégradé de la première.
  const uid = `${caftan.id}-${view}`;
  const spec = SILHOUETTES[caftan.silhouette];
  const tones = deriveTones(caftan.color);
  const rich = variant === 'full';
  const detailed = variant !== 'thumb';

  const body = bodyPath(spec);
  const { cx } = CANVAS;
  const hemY = spec.nodes[spec.nodes.length - 1][1];
  const drape = detailed ? folds(caftan.id, rich ? 7 : 5) : [];
  const motifDensity = view === 'detail' ? 1.6 : 1;

  return (
    <svg
      viewBox={VIEWBOX[view]}
      className={className || 'h-full w-full'}
      preserveAspectRatio={view === 'detail' ? 'xMidYMid slice' : 'xMidYMid meet'}
      role="img"
      aria-label={`Illustration du caftan ${caftan.name}, ${VIEW_LABEL[view]} — ${caftan.matiere.toLowerCase()}, ${caftan.style.toLowerCase()}`}
    >
      <defs>
        <linearGradient id={`fabric-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={tones.deep} />
          <stop offset="38%" stopColor={tones.base} />
          <stop offset="68%" stopColor={tones.light} />
          <stop offset="100%" stopColor={tones.deep} />
        </linearGradient>

        <radialGradient id={`sheen-${uid}`} cx="0.36" cy="0.26" r="0.5">
          <stop offset="0%" stopColor={tones.sheen} stopOpacity={rich ? 0.5 : 0.35} />
          <stop offset="100%" stopColor={tones.sheen} stopOpacity="0" />
        </radialGradient>

        <radialGradient id={`studio-${uid}`} cx="0.5" cy="0.36" r="0.78">
          <stop offset="0%" stopColor="#fdf8f2" />
          <stop offset="100%" stopColor="#e7d9c6" />
        </radialGradient>

        <MotifTile id={`motif-${uid}`} motif={caftan.motif} accent={caftan.accent} />

        <clipPath id={`clip-${uid}`}>
          <path d={body} />
        </clipPath>

        {rich && (
          <filter id={`shadow-${uid}`} x="-20%" y="-10%" width="140%" height="130%">
            <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="#2a1f18" floodOpacity="0.28" />
          </filter>
        )}
      </defs>

      {/* Fond studio */}
      <rect width={CANVAS.w} height={CANVAS.h} fill={`url(#studio-${uid})`} aria-hidden="true" />
      {detailed && (
        <ellipse cx={cx} cy={572} rx={110} ry={16} fill="#2a1f18" opacity="0.16" aria-hidden="true" />
      )}

      <g filter={rich ? `url(#shadow-${uid})` : undefined}>
        {/* Cape : dessous, pour que le corps passe devant */}
        {spec.overlay === 'cape' && (
          <path d={capePath()} fill={tones.light} opacity="0.55" />
        )}

        <path d={body} fill={`url(#fabric-${uid})`} />
        <path d={body} fill={`url(#sheen-${uid})`} />

        <g clipPath={`url(#clip-${uid})`}>
          {/* Broderie : empiècement et ourlet */}
          <rect
            x="0" y="96" width={CANVAS.w} height={44}
            fill={`url(#motif-${uid})`} opacity={0.75 * motifDensity}
          />
          <rect
            x="0" y={hemY - 54} width={CANVAS.w} height={54}
            fill={`url(#motif-${uid})`} opacity={0.65 * motifDensity}
          />

          {/* Plis de drapé */}
          {drape.map((f, i) => {
            const x = cx + f.t * 60;
            return (
              <path
                key={i}
                d={`M ${x} ${f.from} C ${x + f.sway * 30} ${(f.from + hemY) / 2} ${x + f.sway * 46} ${hemY - 60} ${x + f.sway * 60} ${hemY}`}
                stroke={tones.deep}
                strokeWidth={1.6}
                strokeOpacity={0.14}
                fill="none"
              />
            );
          })}

          {/* Takchita : dfina ouverte par-dessus */}
          {spec.overlay === 'dfina' && (
            <path d={bodyPath(spec, 11)} fill={caftan.accent} fillOpacity="0.2" stroke={caftan.accent} strokeOpacity="0.45" />
          )}

          {view === 'face' ? (
            <>
              {/* Plastron */}
              <path d={`M ${cx} 92 L ${cx} ${hemY - 40}`} stroke={caftan.accent} strokeWidth="3" strokeOpacity="0.7" />
              {/* Mdamma (ceinture) */}
              <rect x="0" y="298" width={CANVAS.w} height="26" fill={caftan.accent} fillOpacity="0.28" />
              <rect x="0" y="298" width={CANVAS.w} height="26" fill={`url(#motif-${uid})`} opacity="0.9" />
            </>
          ) : (
            <>
              {/* Dos : couture d'empiècement et rang de boutons */}
              <path d={`M ${cx - 70} 132 Q ${cx} 146 ${cx + 70} 132`} stroke={tones.deep} strokeWidth="1.6" strokeOpacity="0.35" fill="none" />
              {[172, 196, 220, 244].map(y => (
                <circle key={y} cx={cx} cy={y} r="3" fill={caftan.accent} fillOpacity="0.75" />
              ))}
            </>
          )}
        </g>

        {/* Encolure */}
        <path
          d={`M ${cx - spec.neck[0]} ${spec.neck[1]} Q ${cx} ${spec.neck[1] + 30} ${cx + spec.neck[0]} ${spec.neck[1]}`}
          fill="#e7d9c6"
          stroke={caftan.accent}
          strokeWidth="2"
          strokeOpacity="0.8"
        />
        <path d={body} fill="none" stroke={tones.deep} strokeWidth="1.4" strokeOpacity="0.45" />
      </g>
    </svg>
  );
}
