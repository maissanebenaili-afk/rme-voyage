import fs from 'node:fs';
import path from 'node:path';

describe('Pro page commercial claims', () => {
  const source = fs.readFileSync(path.join(__dirname, '../app/pro/page.tsx'), 'utf-8');

  it('does not publish unverified pricing or service-level claims', () => {
    expect(source).not.toMatch(/490€|990€|1 990€|99,9|TVA|support sous|abonnement annuel/i);
  });

  it('states that the offer is in preparation', () => {
    expect(source).toContain('RME Voyage Pro est en préparation.');
  });
});
