import { render } from '@testing-library/react';
import PageViewBeacon from '@/components/PageViewBeacon';

const readBlob = (blob: Blob) => new Promise<string>((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.readAsText(blob);
});

let mockPath = '/trajet/paris-tanger';
jest.mock('next/navigation', () => ({ usePathname: () => mockPath }));

describe('PageViewBeacon', () => {
  const beacon = jest.fn();
  beforeEach(() => {
    beacon.mockReset().mockReturnValue(true);
    Object.defineProperty(navigator, 'sendBeacon', { value: beacon, configurable: true });
  });

  it('sends one page_view with the path only, and renders nothing', async () => {
    const { container } = render(<PageViewBeacon />);
    expect(container).toBeEmptyDOMElement();
    expect(beacon).toHaveBeenCalledTimes(1);
    const [url, blob] = beacon.mock.calls[0];
    expect(url).toBe('/api/events');
    expect(JSON.parse(await readBlob(blob as Blob))).toEqual({
      event: 'page_view',
      props: { placement: 'layout', page: '/trajet/paris-tanger' },
    });
  });

  it('sends again when the path changes, not on re-render', () => {
    const { rerender } = render(<PageViewBeacon />);
    rerender(<PageViewBeacon />);
    expect(beacon).toHaveBeenCalledTimes(1);
    mockPath = '/guide';
    rerender(<PageViewBeacon />);
    expect(beacon).toHaveBeenCalledTimes(2);
    mockPath = '/trajet/paris-tanger';
  });

  it('never breaks the page when sending fails', () => {
    beacon.mockImplementation(() => { throw new Error('blocked'); });
    expect(() => render(<PageViewBeacon />)).not.toThrow();
  });
});
