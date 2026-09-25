import Image from 'next/image';
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
      <div className={className || 'relative h-full w-full'}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 250px, 100vw"
          loading="lazy"
          className="object-cover"
        />
      </div>
    );
  }

  return <CaftanIllustration caftan={caftan} view={view} variant={variant} className={className} />;
}

/** Vrai quand le visuel affiché est une illustration et non une photo du modèle. */
export function isIllustration(caftan: Caftan): boolean {
  return !caftan.images?.length;
}
