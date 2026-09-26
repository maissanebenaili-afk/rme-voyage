import { render, screen } from '@testing-library/react';
import { Capacitor } from '@capacitor/core';
import SportsHub from '@/components/SportsHub';

jest.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: jest.fn() },
}));

const nativePlatform = Capacitor.isNativePlatform as jest.MockedFunction<typeof Capacitor.isNativePlatform>;

describe('SportsHub mobile safety', () => {
  beforeEach(() => {
    nativePlatform.mockReturnValue(true);
  });

  it('does not render sports betting operators in the native app', () => {
    render(<SportsHub />);

    expect(screen.queryByText('Opérateurs sportifs')).not.toBeInTheDocument();
    expect(screen.queryByText('Unibet')).not.toBeInTheDocument();
    expect(screen.queryByText('Betclic')).not.toBeInTheDocument();
    expect(screen.queryByText('Winamax')).not.toBeInTheDocument();
    expect(screen.queryByText('bet365')).not.toBeInTheDocument();
  });
});
