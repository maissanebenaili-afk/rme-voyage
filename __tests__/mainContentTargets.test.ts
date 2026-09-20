import fs from 'node:fs';
import path from 'node:path';

const pages = [
  'app/pro/page.tsx',
  'app/affilies/page.tsx',
  'app/marwa-caftan/page.tsx',
];

describe('skip-link targets', () => {
  it.each(pages)('%s has a focusable main-content target', (page) => {
    const source = fs.readFileSync(path.join(__dirname, '..', page), 'utf-8');
    expect(source).toMatch(/<main\s+id="main-content"\s+tabIndex=\{-1\}/);
  });
});
