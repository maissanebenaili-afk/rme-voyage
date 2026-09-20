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

  it('keeps caftan images explicitly non-contractual', () => {
    for (const file of ['app/boutique/page.tsx', 'app/marwa-caftan/page.tsx']) {
      const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf-8');
      expect(source).toContain('Photos d’inspiration — modèles non contractuels.');
      expect(source).toContain('INSPIRATION_IMAGES.caftan');
    }
  });

  it('uses stable dimensions and responsive sizing for visual stability', () => {
    const source = fs.readFileSync(path.join(__dirname, '../components/InspirationImage.tsx'), 'utf-8');
    expect(source).toContain('width={1200}');
    expect(source).toContain('height={800}');
    expect(source).toContain('sizes="(max-width: 768px) 100vw, 50vw"');
  });
});
