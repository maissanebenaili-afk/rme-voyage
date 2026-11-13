import { netlifyImageUrl, netlifyImageSrcSet } from '@/lib/netlifyImage';

describe('lib/netlifyImage', () => {
  it('formats local images with default parameters (avif, q=80)', () => {
    const url = netlifyImageUrl('/coloriages/couverture.png', 400);
    expect(url).toBe('/.netlify/images?url=/coloriages/couverture.png&w=400&fm=avif&q=80');
  });

  it('percent-encodes remote image URLs', () => {
    const remote = 'https://images.unsplash.com/photo-123?auto=format&fit=crop';
    const url = netlifyImageUrl(remote, 800);
    expect(url).toBe(
      `/.netlify/images?url=${encodeURIComponent(remote)}&w=800&fm=avif&q=80`
    );
  });

  it('does not re-encode already transformed image URLs', () => {
    const existing = '/.netlify/images?url=/photo.jpg&w=400&fm=avif&q=80';
    expect(netlifyImageUrl(existing, 800)).toBe(existing);
  });

  it('generates responsive srcset with specified widths', () => {
    const srcset = netlifyImageSrcSet('/photo.jpg', [400, 800, 1200]);
    expect(srcset).toBe(
      '/.netlify/images?url=/photo.jpg&w=400&fm=avif&q=80 400w, ' +
      '/.netlify/images?url=/photo.jpg&w=800&fm=avif&q=80 800w, ' +
      '/.netlify/images?url=/photo.jpg&w=1200&fm=avif&q=80 1200w'
    );
  });

  it('returns empty string when given an empty src', () => {
    expect(netlifyImageUrl('', 400)).toBe('');
    expect(netlifyImageSrcSet('', [400, 800])).toBe('');
  });
});
