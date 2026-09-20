import { render, screen } from '@testing-library/react';
import { CAFTANS } from '@/lib/caftans';
import CaftanVisual from '@/components/caftan/CaftanVisual';

describe('visuels des caftans', () => {
  it('rend une illustration nommée pour chaque modèle', () => {
    render(
      <>
        {CAFTANS.map(c => <CaftanVisual key={c.id} caftan={c} view="face" variant="card" />)}
      </>,
    );
    const imgs = screen.getAllByRole('img');
    expect(imgs).toHaveLength(CAFTANS.length);
    for (const c of CAFTANS) {
      expect(screen.getByLabelText(new RegExp(`caftan ${c.name},`, 'i'))).toBeTruthy();
    }
  });

  // Les id de <defs> SVG sont globaux au document : une collision ferait
  // s'afficher les 12 cartes dans la couleur de la première.
  it('ne produit aucun identifiant SVG dupliqué sur une page entière', () => {
    const { container } = render(
      <>
        {CAFTANS.map(c => (
          <div key={c.id}>
            <CaftanVisual caftan={c} view="face" variant="card" />
            <CaftanVisual caftan={c} view="dos" variant="thumb" />
          </div>
        ))}
      </>,
    );
    const ids = [...container.querySelectorAll('[id]')].map(e => e.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('préfère une vraie photo à l\'illustration quand elle existe', () => {
    const avecPhoto = {
      ...CAFTANS[0],
      images: [{ src: '/caftans/zahia.jpg', alt: 'Caftan Zahia porté de face', view: 'face' as const }],
    };
    render(<CaftanVisual caftan={avecPhoto} view="face" />);
    const img = screen.getByAltText('Caftan Zahia porté de face') as HTMLImageElement;
    expect(img.tagName).toBe('IMG');
    expect(img.getAttribute('src')).toBe('/caftans/zahia.jpg');
  });
});
