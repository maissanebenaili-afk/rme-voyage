import { fireEvent, render, screen } from '@testing-library/react';
import SportsHub from '@/components/SportsHub';
import TVWidget from '@/components/TVWidget';
import { featuredMatchTiming, parisDay } from '@/lib/featuredMatch';

jest.mock('@capacitor/browser', () => ({ Browser: { open: jest.fn() } }));
jest.mock('@capacitor/share', () => ({ Share: { share: jest.fn() } }));
jest.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: () => false } }));

const at = (iso: string) => jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] }).setSystemTime(new Date(iso));
afterEach(() => jest.useRealTimers());

describe('featured match date guard', () => {
  it('reads the day in Paris, not UTC', () => {
    expect(parisDay(new Date('2026-09-24T22:30:00Z'))).toBe('2026-09-25');
    expect(featuredMatchTiming('2026-09-24')).toBe('upcoming');
    expect(featuredMatchTiming('2026-09-25')).toBe('today');
    expect(featuredMatchTiming('2026-10-06')).toBe('played');
  });

  it('SportsHub: a played match is never shown as live or upcoming (bug seen 2026-10-06)', () => {
    at('2026-10-06T12:00:00Z');
    render(<SportsHub />);
    expect(screen.queryByText(/Direct officiel/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/COUP D'ENVOI/)).not.toBeInTheDocument();
    expect(screen.queryByText('Ce soir')).not.toBeInTheDocument();
    expect(screen.getByText('MATCH JOUÉ')).toBeInTheDocument();
  });

  it('SportsHub: on match day, kickoff and « Ce soir » stay', () => {
    at('2026-09-25T10:00:00Z');
    render(<SportsHub />);
    expect(screen.getByText('20:00')).toBeInTheDocument();
    expect(screen.getByText('Ce soir')).toBeInTheDocument();
  });

  it('RME TV: Maroc–Gabon links disappear once played, without a LIVE badge before', () => {
    at('2026-10-06T12:00:00Z');
    const { unmount } = render(<TVWidget />);
    fireEvent.click(screen.getByRole('button', { name: /Sport/ }));
    expect(screen.queryByText(/Maroc–Gabon/)).not.toBeInTheDocument();
    unmount();

    at('2026-09-25T10:00:00Z');
    render(<TVWidget />);
    expect(screen.getByText('🇲🇦 Maroc–Gabon · ce soir')).toBeInTheDocument();
    const card = screen.getByText('beIN SPORTS · Maroc–Gabon').closest('a')!;
    expect(card.textContent).not.toMatch(/LIVE/);
  });
});
