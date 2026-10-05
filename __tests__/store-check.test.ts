import { runStoreCheck } from '../scripts/store-check';

describe('store preflight', () => {
  it('passes the repository baseline when the required store assets and scripts exist', () => {
    const report = runStoreCheck(process.cwd());
    expect(report.ok).toBe(true);
    expect(report.failures).toEqual([]);
  });
});
