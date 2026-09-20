import type { Caftan, CaftanView } from '@/lib/caftans';
import CaftanIllustration, { type Variant } from './CaftanIllustration';

type Props = {
  caftan: Caftan;
  view?: CaftanView;
  variant?: Variant;
  className?: string;
};

/**
 * Le seul point de bascule photo ⇄ illustration.
 * Aucun autre composant n'importe CaftanIllustration : le jour où Marwa fournit
 * ses photos, il suffit d'ajouter `images` au modèle dans lib/caftans.ts.
 */
export default function CaftanVisual({ caftan, view = 'face', variant = 'card', className }: Props) {
  const photo = caftan.images?.find(i => i.view === view) ?? caftan.images?.[0];

  if (photo) {
    return (
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className={className || 'h-full w-full object-cover'}
      />
    );
  }

  return <CaftanIllustration caftan={caftan} view={view} variant={variant} className={className} />;
}

/** Vrai quand le visuel affiché est une illustration et non une photo du modèle. */
export function isIllustration(caftan: Caftan): boolean {
  return !caftan.images?.length;
}
