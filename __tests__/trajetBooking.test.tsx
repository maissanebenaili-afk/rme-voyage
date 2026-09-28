import { render, screen } from '@testing-library/react';
import TrajetPage from '../app/trajet/[slug]/page';
import { ROUTE_PAGES, ferryOf } from '@/lib/routePages';

describe('Route landing pages show the ferry / flight comparison', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
  });

  it('offers the comparison, with the crossing, on a page that has a ferry leg', async () => {
    const route = ROUTE_PAGES.routes.find((r) => ferryOf(r));
    expect(route).toBeDefined();
    const ferry = ferryOf(route!)!;
    render(await TrajetPage({ params: Promise.resolve({ slug: route!.slug }) }));
    expect(screen.getByTestId('compare-ferry')).toHaveAttribute('href', 'https://www.directferries.fr/');
    expect(screen.getByTestId('compare-flight')).toBeInTheDocument();
    expect(screen.getByText(`${ferry.from} → ${ferry.to}`, { selector: 'strong' })).toBeInTheDocument();
  });
});
