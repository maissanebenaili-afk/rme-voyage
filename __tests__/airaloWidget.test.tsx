import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AiraloWidget from '@/components/affiliate/AiraloWidget';

// Mock fetch
global.fetch = jest.fn();

describe('AiraloWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/api/affiliate/link')) {
        return Promise.resolve({
          json: async () => ({
            url: 'https://www.airalo.com/?ref=test-id&utm_source=rme-voyage',
          }),
        });
      }
      return Promise.resolve({ json: async () => ({}) });
    });
  });

  it('renders widget with correct title and CTA', () => {
    render(<AiraloWidget destination="Maroc" userId="user-123" />);

    expect(screen.getByText(/Besoin de données à l'étranger/i)).toBeInTheDocument();
    expect(screen.getByText(/Achetez une eSIM Airalo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Découvrir Airalo/i })).toBeInTheDocument();
  });

  it('tracks affiliate click when button is clicked', async () => {
    const { getByRole } = render(
      <AiraloWidget destination="Maroc" userId="user-123" source="trip-detail" />
    );

    const button = getByRole('button', { name: /Découvrir Airalo/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/affiliate/track',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-user-id': 'user-123',
          }),
          body: expect.stringContaining('"program":"airalo"'),
        })
      );
    });
  });

  it('fetches affiliate link from API', async () => {
    const { getByRole } = render(
      <AiraloWidget destination="Maroc" userId="user-123" />
    );

    const button = getByRole('button', { name: /Découvrir Airalo/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/affiliate/link?program=esim'
      );
    });
  });

  it('disables button while loading', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        json: async () => ({ url: 'https://www.airalo.com/?ref=test' }),
      }), 100))
    );

    const { getByRole } = render(<AiraloWidget destination="Maroc" userId="user-123" />);
    const button = getByRole('button', { name: /Découvrir Airalo/i });

    fireEvent.click(button);
    expect(button).toBeDisabled();

    await waitFor(() => {
      expect(button).not.toBeDisabled();
    });
  });

  it('renders destination name dynamically', () => {
    render(<AiraloWidget destination="Algérie" userId="user-123" />);
    expect(screen.getByText(/Algérie/)).toBeInTheDocument();
  });

  it('uses default destination if not provided', () => {
    render(<AiraloWidget userId="user-123" />);
    expect(screen.getByText(/votre destination/)).toBeInTheDocument();
  });

  it('sends correct tracking data with source', async () => {
    const { getByRole } = render(
      <AiraloWidget
        destination="Maroc"
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
      expect(bodyText).toContain('"destination":"Maroc"');
    });
  });
});
