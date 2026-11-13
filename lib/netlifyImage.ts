/**
 * Netlify Image CDN helper
 * Transforms images on-demand via Netlify's built-in Image CDN:
 * /.netlify/images?url=<path>&w=<width>&fm=avif&q=80
 */

export function netlifyImageUrl(
  src: string,
  width: number,
  format: 'avif' | 'webp' | 'png' | 'jpg' = 'avif',
  quality = 80
): string {
  if (!src) return '';
  // If already a Netlify Image CDN URL, avoid double-wrapping
  if (src.startsWith('/.netlify/images')) return src;

  const encodedUrl =
    src.startsWith('http://') || src.startsWith('https://')
      ? encodeURIComponent(src)
      : src;

  return `/.netlify/images?url=${encodedUrl}&w=${width}&fm=${format}&q=${quality}`;
}

export function netlifyImageSrcSet(
  src: string,
  widths: number[] = [400, 800, 1200],
  format: 'avif' | 'webp' | 'png' | 'jpg' = 'avif',
  quality = 80
): string {
  if (!src) return '';
  return widths.map((w) => `${netlifyImageUrl(src, w, format, quality)} ${w}w`).join(', ');
}
