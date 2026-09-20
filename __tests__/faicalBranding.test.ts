import fs from 'node:fs';
import path from 'node:path';

const files = ['app/page.tsx', 'app/api/faical/route.ts', 'components/FaicalWidget.tsx'];

describe('Faical branding', () => {
  const source = files
    .map((file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf-8'))
    .join('\n');

  it('uses only the agreed first name', () => {
    expect(source).toContain('Faical');
    expect(source).not.toMatch(/Arrayah|Faisal/i);
  });

  it('does not publish a placeholder betting affiliation', () => {
    expect(source).not.toMatch(/inamax\.com|Lien affilié|sponsored\"/i);
  });
});
