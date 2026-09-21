import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OmioWidget from '@/components/affiliate/OmioWidget';

// Mock fetch
global.fetch = jest.fn();

describe('OmioWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/affiliate/link')) {
        return Promise.resolve({
          json: async () => ({
            url: 'https://www.omio.com/?aff=test-id',
          }),
        });
      }
      return Promise.resolve({ json: async () => ({}) });
    });
  });

  it('renders widget with correct title and CTA', () => {
    render(
      <OmioWidget
        origin="Paris"
        destination="Maroc"
        userId="user-123"
      />
    );

    expect(screen.getByText(/Trajet multimodal/i)).toBeInTheDocument();
    expect(screen.getByText(/Réserver sur Omio/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Réserver sur Omio/i })).toBeInTheDocument();
  });

  it('tracks affiliate click when button is clicked', async () => {
    const { getByRole } = render(
      <OmioWidget
        origin="Paris"
        destination="Maroc"
        userId="user-123"
        source="trip-detail"
      />
    );

    const button = getByRole('button', { name: /Réserver sur Omio/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/affiliate/track',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-user-id': 'user-123',
          }),
          body: expect.stringContaining('"program":"omio"'),
        })
      );
    });
  });

  it('fetches affiliate link from API', async () => {
    const { getByRole } = render(
      <OmioWidget origin="Paris" destination="Maroc" userId="user-123" />
    );

    const button = getByRole('button', { name: /Réserver sur Omio/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/affiliate/link?program=omio')
      );
    });
  });

  it('disables button while loading', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        json: async () => ({ url: 'https://www.omio.com/?aff=test' }),
      }), 100))
    );

    const { getByRole } = render(
      <OmioWidget origin="Paris" destination="Maroc" userId="user-123" />
    );
    const button = getByRole('button', { name: /Réserver sur Omio/i });

    fireEvent.click(button);
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('sends correct tracking data with origin and destination', async () => {
    const { getByRole } = render(
      <OmioWidget
        origin="Paris"
        destination="Casablanca"
        userId="user-456"
        source="banner"
      />
    );

    const button = getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      const trackCall = (global.fetch as jest.Mock).mock.calls[0];
      const bodyText = trackCall[1].body;
      expect(bodyText).toContain('"source":"banner"');
      expect(bodyText).toContain('"destination":"Casablanca"');
      expect(bodyText).toContain('"origin":"Paris"');
    });
  });

  it('renders destination name dynamically', () => {
    render(
      <OmioWidget
        origin="Paris"
        destination="Marrakech"
        userId="user-123"
      />
    );
    expect(screen.getByText(/Marrakech/)).toBeInTheDocument();
  });
});
