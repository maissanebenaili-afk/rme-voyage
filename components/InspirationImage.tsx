import Image from 'next/image';
import type { InspirationImage as InspirationImageData } from '@/lib/inspirationImages';

export default function InspirationImage({
  image,
  className = '',
  caption = 'Photo d’inspiration — illustration non contractuelle.',
}: {
  image: InspirationImageData;
  className?: string;
  caption?: string;
}) {
  return (
    <figure className={`overflow-hidden rounded-3xl border border-black/10 bg-white ${className}`}>
      <Image
        src={image.src}
        alt={image.alt}
        width={1200}
        height={800}
        sizes="(max-width: 768px) 100vw, 50vw"
        className="aspect-[3/2] h-auto w-full object-cover"
      />
      <figcaption className="flex flex-wrap items-center justify-between gap-1 px-3 py-2 text-[10px] leading-4 text-[#64748b]">
        <span>{caption}</span>
        <span>
          <a
            href={image.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#0f1f3d]"
          >
            {image.credit}
          </a>{' '}
          ·{' '}
          <a
            href={image.licenseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[#0f1f3d]"
          >
            Licence
          </a>
        </span>
      </figcaption>
    </figure>
  );
}
