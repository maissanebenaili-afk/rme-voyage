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

  it('names the computed crossing and never claims the partner form is prefilled', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    render(
      <BookingCards
        origin="Paris, France"
        destination="Marrakech, Maroc"
        date="2099-07-01"
        crossing="Tarifa → Tanger Ville"
      />,
    );

    expect(screen.getByText(/Tarifa → Tanger Ville/)).toBeInTheDocument();
    expect(screen.getByText(/nous ne pré-remplissons pas ces/)).toBeInTheDocument();
    // Les liens restent les comparateurs publics : aucun format de lien profond
    // n'est documenté par les partenaires, donc aucun n'est fabriqué.
    expect(screen.getByTestId('compare-ferry')).toHaveAttribute('href', 'https://www.directferries.fr/');
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
    const requested = new URL((global.fetch as jest.Mock).mock.calls[0][0] as string, 'https://rme.test');
    expect(requested.searchParams.get('origin')).toBe('Paris, France');
  });

  it('shows no crossing line when the itinerary has none', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    render(<BookingCards origin="Paris" destination="Madrid" />);
    expect(screen.queryByText(/la traversée la plus courte/)).not.toBeInTheDocument();
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
  });
});
