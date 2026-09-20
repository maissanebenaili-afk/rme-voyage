import fs from 'node:fs';
import path from 'node:path';
import { INSPIRATION_IMAGES } from '../lib/inspirationImages';

describe('partner inspiration images', () => {
  it('uses documented public sources and licenses', () => {
    for (const image of Object.values(INSPIRATION_IMAGES)) {
      expect(image.src).toMatch(/^https:\/\//);
      expect(image.sourceUrl).toMatch(/^https:\/\//);
      expect(image.licenseUrl).toMatch(/^https:\/\//);
      expect(image.credit).not.toHaveLength(0);
      expect(image.alt).not.toHaveLength(0);
    }
    expect(INSPIRATION_IMAGES.delivery.licenseUrl).toBe('https://creativecommons.org/publicdomain/zero/1.0/');
  });

  it('does not associate a generic inspiration image with named caftan styles', () => {
    const boutique = fs.readFileSync(path.join(__dirname, '..', 'app/boutique/page.tsx'), 'utf-8');
    const catalog = fs.readFileSync(path.join(__dirname, '..', 'app/marwa-caftan/page.tsx'), 'utf-8');

    expect(boutique).toContain('Photos d’inspiration — modèles non contractuels.');
    expect(boutique).not.toContain('INSPIRATION_IMAGES.caftan');
    expect(catalog).not.toContain('INSPIRATION_IMAGES.caftan');
    expect(catalog).toContain('Modèle et détails à confirmer avec Marwa.');
  });

  it('uses stable dimensions and responsive sizing for visual stability', () => {
    const source = fs.readFileSync(path.join(__dirname, '../components/InspirationImage.tsx'), 'utf-8');
    expect(source).toContain('width={1200}');
    expect(source).toContain('height={800}');
    expect(source).toContain('sizes="(max-width: 768px) 100vw, 50vw"');
  });
});
