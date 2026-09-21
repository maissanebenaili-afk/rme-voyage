import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DirectFerriesWidget from '@/components/affiliate/DirectFerriesWidget';

// Mock fetch
global.fetch = jest.fn();

describe('DirectFerriesWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/affiliate/link')) {
        return Promise.resolve({
          json: async () => ({
            url: 'https://www.directferries.com/?aff=test-id',
          }),
        });
      }
      return Promise.resolve({ json: async () => ({}) });
    });
  });

  it('renders widget with correct title and CTA', () => {
    render(
      <DirectFerriesWidget
        origin="Barcelona"
        destination="Maroc"
        userId="user-123"
      />
    );

    expect(screen.getByText(/Traversée en ferry/i)).toBeInTheDocument();
    expect(screen.getByText(/Réserver un ferry/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Réserver un ferry/i })).toBeInTheDocument();
  });

  it('tracks affiliate click when button is clicked', async () => {
    const { getByRole } = render(
      <DirectFerriesWidget
        origin="Barcelona"
        destination="Maroc"
        userId="user-123"
        source="trip-detail"
      />
    );

    const button = getByRole('button', { name: /Réserver un ferry/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/affiliate/track',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-user-id': 'user-123',
          }),
          body: expect.stringContaining('"program":"ferry"'),
        })
      );
    });
  });

  it('fetches affiliate link from API', async () => {
    const { getByRole } = render(
      <DirectFerriesWidget origin="Barcelona" destination="Maroc" userId="user-123" />
    );

    const button = getByRole('button', { name: /Réserver un ferry/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/affiliate/link?program=ferry')
      );
    });
  });

  it('disables button while loading', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        json: async () => ({ url: 'https://www.directferries.com/?aff=test' }),
      }), 100))
    );

    const { getByRole } = render(
      <DirectFerriesWidget origin="Barcelona" destination="Maroc" userId="user-123" />
    );
    const button = getByRole('button', { name: /Réserver un ferry/i });

    fireEvent.click(button);
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('sends correct tracking data with origin and destination', async () => {
    const { getByRole } = render(
      <DirectFerriesWidget
        origin="Barcelona"
        destination="Tangier"
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
      expect(bodyText).toContain('"destination":"Tangier"');
      expect(bodyText).toContain('"origin":"Barcelona"');
    });
  });

  it('renders destination name dynamically', () => {
    render(
      <DirectFerriesWidget
        origin="Barcelona"
        destination="Maroc"
        userId="user-123"
      />
    );
    expect(screen.getByText(/Maroc/)).toBeInTheDocument();
  });
});
