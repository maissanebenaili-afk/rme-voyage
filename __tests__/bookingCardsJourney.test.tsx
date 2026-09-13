import { render, screen, waitFor } from '@testing-library/react';
import BookingCards from '@/components/BookingCards';

describe('Comparison journey', () => {
  afterEach(() => jest.restoreAllMocks());
  it('has usable external links even if the partner service is unavailable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    render(<BookingCards origin="Paris" destination="Tanger" />);
    expect(screen.getByTestId('compare-ferry')).toHaveAttribute('href', 'https://www.directferries.fr/');
    expect(screen.getByTestId('compare-flight')).toHaveAttribute('href', 'https://www.skyscanner.fr/');
    expect(screen.getByTestId('compare-flight')).toHaveAttribute('target', '_blank');
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  });
  it('labels a verified affiliate link without claiming a commission is earned', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, json: async () => ({ configured: true, affiliateUrl: 'https://tp.media/r?marker=123' }),
    });
    render(<BookingCards origin="Lyon" destination="Rabat" />);
    await waitFor(() => expect(screen.getByTestId('compare-flight')).toHaveAttribute('rel', 'sponsored noopener noreferrer'));
  });
  it('ignores an unsafe URL returned by a malformed response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, json: async () => ({ configured: true, affiliateUrl: 'javascript:alert(1)' }),
    });
    render(<BookingCards origin="Paris" destination="Tanger" />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId('compare-flight')).toHaveAttribute('href', 'https://www.skyscanner.fr/');
  });
});
