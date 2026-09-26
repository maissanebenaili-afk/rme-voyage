import { fireEvent, render, screen } from '@testing-library/react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';
import SportsHub from '@/components/SportsHub';

jest.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: jest.fn() } }));
jest.mock('@capacitor/browser', () => ({ Browser: { open: jest.fn() } }));
jest.mock('@capacitor/share', () => ({ Share: { share: jest.fn() } }));

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


describe('SportsHub native integrations', () => {
  beforeEach(() => {
    nativePlatform.mockReturnValue(true);
    jest.clearAllMocks();
  });

  it('opens a broadcaster in the Capacitor browser instead of the webview', async () => {
    render(<SportsHub />);
    fireEvent.click(screen.getByText('Arryadia TNT'));
    expect(Browser.open).toHaveBeenCalledWith({ url: 'https://www.snrt.ma/fr/arryadia' });
  });

  it('uses the native share sheet', async () => {
    render(<SportsHub />);
    fireEvent.click(screen.getByRole('button', { name: 'Partager' }));
    expect(Share.share).toHaveBeenCalled();
  });
});
